#!/usr/bin/env python3
"""
generate_gfg_card.py
Scrapes GFG profile page directly (same as browser) and generates a live SVG card.
Run by GitHub Actions daily — commits gfg-stats.svg to the repo.
"""

import requests
import json
import re
import sys
from datetime import datetime

GFG_USERNAME = "jharshavardhan"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": f"https://www.geeksforgeeks.org/user/{GFG_USERNAME}/",
    "Origin": "https://www.geeksforgeeks.org",
}


def fetch_gfg_stats(username):
    """Try GFG's internal APIs used by their own website."""
    
    endpoints = [
        f"https://practiceapi.geeksforgeeks.org/api/v1/user/info/?handle={username}",
        f"https://practiceapi.geeksforgeeks.org/api/v1/user/?handle={username}",
        f"https://authapi.geeksforgeeks.org/api/v1/user/info/?handle={username}",
    ]

    for url in endpoints:
        try:
            print(f"Trying: {url}")
            r = requests.get(url, headers=HEADERS, timeout=10)
            print(f"  Status: {r.status_code}")
            if r.status_code == 200:
                data = r.json()
                print(f"  Response keys: {list(data.keys())[:5]}")
                return data
        except Exception as e:
            print(f"  Error: {e}")

    # Try scraping the profile page HTML for JSON data
    try:
        print(f"Trying HTML scrape: https://www.geeksforgeeks.org/user/{username}/")
        r = requests.get(
            f"https://www.geeksforgeeks.org/user/{username}/",
            headers={**HEADERS, "Accept": "text/html"},
            timeout=10
        )
        if r.status_code == 200:
            html = r.text
            # GFG embeds user data as JSON in script tags
            patterns = [
                r'window\.__INITIAL_STATE__\s*=\s*({.*?});',
                r'"userInfo"\s*:\s*({.*?}),\s*"',
                r'codingScore["\s:]+(\d+)',
            ]
            for pat in patterns:
                m = re.search(pat, html, re.DOTALL)
                if m:
                    try:
                        data = json.loads(m.group(1))
                        print(f"  Found JSON data via scrape")
                        return {"scraped": True, "data": data}
                    except:
                        # Try extracting individual numbers
                        score_match = re.search(r'"codingScore"\s*:\s*(\d+)', html)
                        solved_match = re.search(r'"totalProblemsSolved"\s*:\s*(\d+)', html)
                        rank_match = re.search(r'"instituteRank"\s*:\s*"?(\d+)"?', html)
                        if solved_match:
                            return {
                                "info": {
                                    "totalProblemsSolved": int(solved_match.group(1)),
                                    "codingScore": int(score_match.group(1)) if score_match else 0,
                                    "instituteRank": rank_match.group(1) if rank_match else "–",
                                }
                            }
    except Exception as e:
        print(f"  Scrape error: {e}")

    return None


def parse_stats(data):
    """Extract stats from any API response format."""
    if not data:
        return None

    # Format 1: practiceapi response with 'data' key
    if "data" in data:
        d = data["data"]
        return {
            "solved":  d.get("pod_solved_count") or d.get("total_problems_solved") or 0,
            "score":   d.get("score") or d.get("coding_score") or "–",
            "rank":    d.get("institute_rank") or d.get("rank") or "–",
            "streak":  d.get("current_streak") or d.get("streak") or "–",
            "school":  (d.get("problems_solved") or {}).get("school", 0),
            "basic":   (d.get("problems_solved") or {}).get("basic",  0),
            "easy":    (d.get("problems_solved") or {}).get("easy",   0),
            "medium":  (d.get("problems_solved") or {}).get("medium", 0),
            "hard":    (d.get("problems_solved") or {}).get("hard",   0),
        }

    # Format 2: arnoob16 style with 'info' key
    if "info" in data:
        info = data["info"]
        stats = data.get("solvedStats", {})
        return {
            "solved":  info.get("totalProblemsSolved", 0),
            "score":   info.get("codingScore",   "–"),
            "rank":    info.get("instituteRank", "–"),
            "streak":  info.get("currentStreak", "–"),
            "school":  int(stats.get("school", {}).get("count", 0)),
            "basic":   int(stats.get("basic",  {}).get("count", 0)),
            "easy":    int(stats.get("easy",   {}).get("count", 0)),
            "medium":  int(stats.get("medium", {}).get("count", 0)),
            "hard":    int(stats.get("hard",   {}).get("count", 0)),
        }

    return None


def generate_svg(stats):
    """Generate a beautiful dracula-themed GFG stats card SVG."""
    solved = int(stats.get("solved", 0))
    score  = stats.get("score",  "–")
    rank   = stats.get("rank",   "–")
    streak = stats.get("streak", "–")
    school = int(stats.get("school", 0))
    basic  = int(stats.get("basic",  0))
    easy   = int(stats.get("easy",   0))
    medium = int(stats.get("medium", 0))
    hard   = int(stats.get("hard",   0))

    # Circle progress
    import math
    radius = 30
    circum = 2 * math.pi * radius
    pct    = min(solved / 200.0, 1.0)
    dash   = round(pct * circum, 1)

    # Bar widths (max 210px)
    def bar(v, mx): return max(4, min(round(v / mx * 210), 210))

    updated = datetime.utcnow().strftime("%d %b %Y %H:%M UTC")

    return f"""<svg width="495" height="225" viewBox="0 0 495 225"
  xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="GeeksForGeeks stats for {GFG_USERNAME}">
  <defs>
    <linearGradient id="topbar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#166534"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="cardbg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#1e2130"/>
      <stop offset="100%" stop-color="#161925"/>
    </linearGradient>
    <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#50fa7b"/>
      <stop offset="100%" stop-color="#2F8D46"/>
    </linearGradient>
  </defs>

  <rect width="495" height="225" rx="10" fill="url(#cardbg)" stroke="#166534" stroke-width="1.5"/>
  <rect width="495" height="6"   rx="3"  fill="url(#topbar)"/>

  <circle cx="28" cy="34" r="8" fill="#2F8D46"/>
  <text x="46" y="39" font-family="Segoe UI,sans-serif" font-size="14" font-weight="700" fill="#f0f0f0" letter-spacing="0.5">GEEKSFORGEEKS</text>
  <text x="46" y="54" font-family="Segoe UI,sans-serif" font-size="10" fill="#6b8f71">@{GFG_USERNAME}</text>
  <line x1="16" y1="65" x2="479" y2="65" stroke="#263040" stroke-width="1"/>

  <circle cx="70" cy="118" r="{radius}" fill="none" stroke="#263040" stroke-width="5"/>
  <circle cx="70" cy="118" r="{radius}" fill="none" stroke="url(#cg)"
          stroke-width="5" stroke-linecap="round"
          stroke-dasharray="{dash} {round(circum,1)}" stroke-dashoffset="0"
          transform="rotate(-90 70 118)"/>
  <text x="70" y="124" font-family="Segoe UI,sans-serif" font-size="20" font-weight="800" fill="#f0f0f0" text-anchor="middle">{solved}</text>
  <text x="70" y="163" font-family="Segoe UI,sans-serif" font-size="9"  fill="#6b8f71" text-anchor="middle" letter-spacing="1.2">SOLVED</text>

  <text x="16" y="184" font-family="Segoe UI,sans-serif" font-size="9"  fill="#6b8f71" letter-spacing="0.8">SCORE</text>
  <text x="16" y="200" font-family="Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#50fa7b">{score}</text>
  <text x="80" y="184" font-family="Segoe UI,sans-serif" font-size="9"  fill="#6b8f71" letter-spacing="0.8">RANK</text>
  <text x="80" y="200" font-family="Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#f1c40f">#{rank}</text>
  <text x="16" y="216" font-family="Segoe UI,sans-serif" font-size="9"  fill="#6b8f71" letter-spacing="0.8">STREAK</text>
  <text x="72" y="216" font-family="Segoe UI,sans-serif" font-size="11" font-weight="600" fill="#ffb86c">{streak} days 🔥</text>

  <line x1="136" y1="72" x2="136" y2="218" stroke="#263040" stroke-width="1"/>

  <text x="154" y="86"  font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="1.2">DIFFICULTY BREAKDOWN</text>

  <text x="154" y="106" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd">School</text>
  <text x="479" y="106" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd" text-anchor="end">{school}</text>
  <rect x="154" y="110" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="110" width="{bar(school,30)}"   height="5" rx="2.5" fill="#8be9fd" opacity="0.85"/>

  <text x="154" y="128" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8">Basic</text>
  <text x="479" y="128" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8" text-anchor="end">{basic}</text>
  <rect x="154" y="132" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="132" width="{bar(basic,50)}"    height="5" rx="2.5" fill="#a8d8a8" opacity="0.85"/>

  <text x="154" y="150" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b">Easy</text>
  <text x="479" y="150" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b" text-anchor="end">{easy}</text>
  <rect x="154" y="154" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="154" width="{bar(easy,100)}"    height="5" rx="2.5" fill="#50fa7b" opacity="0.85"/>

  <text x="154" y="172" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c">Medium</text>
  <text x="479" y="172" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c" text-anchor="end">{medium}</text>
  <rect x="154" y="176" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="176" width="{bar(medium,150)}"  height="5" rx="2.5" fill="#ffb86c" opacity="0.85"/>

  <text x="154" y="194" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555">Hard</text>
  <text x="479" y="194" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555" text-anchor="end">{hard}</text>
  <rect x="154" y="198" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="198" width="{bar(hard,50)}"     height="5" rx="2.5" fill="#ff5555" opacity="0.85"/>

  <text x="479" y="218" font-family="Segoe UI,sans-serif" font-size="8" fill="#44475a" text-anchor="end">Updated: {updated}</text>
</svg>"""


def generate_fallback_svg():
    """Use latest known stats as fallback when API fails."""
    print("⚠️  Using fallback stats (API unavailable)")
    return generate_svg({
        "solved": 100, "score": 273, "rank": 5, "streak": 13,
        "school": 0, "basic": 17, "easy": 33, "medium": 42, "hard": 8
    })


if __name__ == "__main__":
    print(f"🔄 Fetching GFG stats for: {GFG_USERNAME}")
    
    raw = fetch_gfg_stats(GFG_USERNAME)
    stats = parse_stats(raw) if raw else None

    if stats and int(stats.get("solved", 0)) > 0:
        print(f"✅ Got live data: {stats}")
        svg = generate_svg(stats)
    else:
        print("⚠️  Live fetch failed — using fallback")
        svg = generate_fallback_svg()

    with open("gfg-stats.svg", "w", encoding="utf-8") as f:
        f.write(svg)

    print("✅ gfg-stats.svg written!")
