// api/card.js — Live GFG Stats Card
// Calls GFG's own internal API used by their website
export default async function handler(req, res) {
  const { username = "jharshavardhan" } = req.query;

  let solved = 0, score = "–", rank = "–", streak = "–";
  let school = 0, basic = 0, easy = 0, medium = 0, hard = 0;
  let gotData = false;

  // ── GFG's OWN internal API (what their website uses) ─────────────────────
  const gfgApis = [
    // Primary: GFG practice API
    {
      url: `https://practiceapi.geeksforgeeks.org/api/v1/user/info/?handle=${username}`,
      parse: (d) => {
        const u = d?.data ?? d;
        return {
          solved: u?.pod_solved_count ?? u?.total_problems_solved,
          score:  u?.score ?? u?.coding_score,
          rank:   u?.institute_rank ?? u?.rank,
          streak: u?.current_streak ?? u?.streak,
          school: u?.problems_solved?.school ?? 0,
          basic:  u?.problems_solved?.basic  ?? 0,
          easy:   u?.problems_solved?.easy   ?? 0,
          medium: u?.problems_solved?.medium ?? 0,
          hard:   u?.problems_solved?.hard   ?? 0,
        };
      }
    },
    // Secondary: GFG user profile API
    {
      url: `https://www.geeksforgeeks.org/api/user/profile/?handle=${username}`,
      parse: (d) => {
        const u = d?.data ?? d;
        return {
          solved: u?.total_problems_solved,
          score:  u?.coding_score,
          rank:   u?.institute_rank,
          streak: u?.streak,
          school: u?.school ?? 0,
          basic:  u?.basic  ?? 0,
          easy:   u?.easy   ?? 0,
          medium: u?.medium ?? 0,
          hard:   u?.hard   ?? 0,
        };
      }
    },
    // Tertiary: tashif.codes API
    {
      url: `https://gfg-stats.tashif.codes/${username}`,
      parse: (d) => ({
        solved: d?.totalProblemsSolved,
        score:  "–",
        rank:   "–",
        streak: "–",
        school: d?.problemsByDifficulty?.school ?? 0,
        basic:  d?.problemsByDifficulty?.basic  ?? 0,
        easy:   d?.problemsByDifficulty?.easy   ?? 0,
        medium: d?.problemsByDifficulty?.medium ?? 0,
        hard:   d?.problemsByDifficulty?.hard   ?? 0,
      })
    },
    // Quaternary: arnoob16 API
    {
      url: `https://geeks-for-geeks-api.vercel.app/${username}`,
      parse: (d) => ({
        solved: d?.info?.totalProblemsSolved,
        score:  d?.info?.codingScore,
        rank:   d?.info?.instituteRank,
        streak: d?.info?.currentStreak,
        school: Number(d?.solvedStats?.school?.count ?? 0),
        basic:  Number(d?.solvedStats?.basic?.count  ?? 0),
        easy:   Number(d?.solvedStats?.easy?.count   ?? 0),
        medium: Number(d?.solvedStats?.medium?.count ?? 0),
        hard:   Number(d?.solvedStats?.hard?.count   ?? 0),
      })
    },
    // Quinary: pratham1singh API
    {
      url: `https://gfg-api-fefa.onrender.com/${username}`,
      parse: (d) => ({
        solved: d?.totalSolved ?? d?.problems_solved,
        score:  d?.overallScore,
        rank:   d?.rank,
        streak: d?.streak,
        school: Array.isArray(d?.school) ? d.school.length : Number(d?.school ?? 0),
        basic:  Array.isArray(d?.basic)  ? d.basic.length  : Number(d?.basic  ?? 0),
        easy:   Array.isArray(d?.easy)   ? d.easy.length   : Number(d?.easy   ?? 0),
        medium: Array.isArray(d?.medium) ? d.medium.length : Number(d?.medium ?? 0),
        hard:   Array.isArray(d?.hard)   ? d.hard.length   : Number(d?.hard   ?? 0),
      })
    },
  ];

  for (const api of gfgApis) {
    if (gotData) break;
    try {
      const r = await fetch(api.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "Referer": "https://www.geeksforgeeks.org/",
        },
        signal: AbortSignal.timeout(6000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      const p = api.parse(d);
      const s = Number(p.solved ?? 0);
      if (s > 0) {
        solved = s;
        score  = p.score  ?? "–";
        rank   = p.rank   ?? "–";
        streak = p.streak ?? "–";
        school = Number(p.school ?? 0);
        basic  = Number(p.basic  ?? 0);
        easy   = Number(p.easy   ?? 0);
        medium = Number(p.medium ?? 0);
        hard   = Number(p.hard   ?? 0);
        gotData = true;
      }
    } catch (_) { continue; }
  }

  // ── Progress circle for solved (out of 200 assumed cap) ──────────────────
  const pct     = Math.min(solved / 200, 1);
  const radius  = 30;
  const circum  = 2 * Math.PI * radius;
  const dashArr = (pct * circum).toFixed(1);
  const dashOff = "0";

  // ── Difficulty bars (max 210px wide) ─────────────────────────────────────
  const bar = (v, max) => Math.max(4, Math.min(Math.round((Number(v) / max) * 210), 210));

  // ── SVG ──────────────────────────────────────────────────────────────────
  const svg = `<svg width="495" height="220" viewBox="0 0 495 220"
  xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="GeeksForGeeks stats for ${username}">
  <defs>
    <linearGradient id="topbar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#166534"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="cardbg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#1e2130"/>
      <stop offset="100%" stop-color="#161925"/>
    </linearGradient>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#50fa7b"/>
      <stop offset="100%" stop-color="#2F8D46"/>
    </linearGradient>
  </defs>

  <!-- Card background -->
  <rect width="495" height="220" rx="10" fill="url(#cardbg)" stroke="#166534" stroke-width="1.5"/>
  <rect width="495" height="6"   rx="3"  fill="url(#topbar)"/>

  <!-- Header: GFG dot + title + username -->
  <circle cx="28" cy="34" r="8" fill="#2F8D46"/>
  <text x="46" y="39" font-family="Segoe UI,sans-serif" font-size="14"
        font-weight="700" fill="#f0f0f0" letter-spacing="0.5">GEEKSFORGEEKS</text>
  <text x="46" y="54" font-family="Segoe UI,sans-serif" font-size="10" fill="#6b8f71">@${username}</text>
  <line x1="16" y1="65" x2="479" y2="65" stroke="#263040" stroke-width="1"/>

  <!-- Left panel: circle + solved count -->
  <!-- Circle track -->
  <circle cx="70" cy="118" r="${radius}" fill="none" stroke="#263040" stroke-width="5"/>
  <!-- Circle progress -->
  <circle cx="70" cy="118" r="${radius}" fill="none" stroke="url(#circleGrad)"
          stroke-width="5" stroke-linecap="round"
          stroke-dasharray="${dashArr} ${circum.toFixed(1)}"
          stroke-dashoffset="${dashOff}"
          transform="rotate(-90 70 118)"/>
  <!-- Solved number inside circle -->
  <text x="70" y="123" font-family="Segoe UI,sans-serif" font-size="20"
        font-weight="800" fill="#f0f0f0" text-anchor="middle">${solved || "–"}</text>
  <text x="70" y="162" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" text-anchor="middle" letter-spacing="1.2">SOLVED</text>

  <!-- Score / Rank / Streak below circle -->
  <text x="16" y="182" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">SCORE</text>
  <text x="16" y="197" font-family="Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#50fa7b">${score}</text>
  <text x="80" y="182" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">RANK</text>
  <text x="80" y="197" font-family="Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#f1c40f">#${rank}</text>
  <text x="16" y="212" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">STREAK</text>
  <text x="72" y="212" font-family="Segoe UI,sans-serif" font-size="11" font-weight="600" fill="#ffb86c">${streak} days &#x1F525;</text>

  <!-- Vertical divider -->
  <line x1="136" y1="72" x2="136" y2="214" stroke="#263040" stroke-width="1"/>

  <!-- Right panel: Difficulty breakdown -->
  <text x="154" y="85" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="1.2">DIFFICULTY BREAKDOWN</text>

  <!-- School -->
  <text x="154" y="105" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd">School</text>
  <text x="479" y="105" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd" text-anchor="end">${school}</text>
  <rect x="154" y="109" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="109" width="${bar(school, 30)}"  height="5" rx="2.5" fill="#8be9fd" opacity="0.85"/>

  <!-- Basic -->
  <text x="154" y="127" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8">Basic</text>
  <text x="479" y="127" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8" text-anchor="end">${basic}</text>
  <rect x="154" y="131" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="131" width="${bar(basic, 50)}"  height="5" rx="2.5" fill="#a8d8a8" opacity="0.85"/>

  <!-- Easy -->
  <text x="154" y="149" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b">Easy</text>
  <text x="479" y="149" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b" text-anchor="end">${easy}</text>
  <rect x="154" y="153" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="153" width="${bar(easy, 100)}"  height="5" rx="2.5" fill="#50fa7b" opacity="0.85"/>

  <!-- Medium -->
  <text x="154" y="171" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c">Medium</text>
  <text x="479" y="171" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c" text-anchor="end">${medium}</text>
  <rect x="154" y="175" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="175" width="${bar(medium, 150)}" height="5" rx="2.5" fill="#ffb86c" opacity="0.85"/>

  <!-- Hard -->
  <text x="154" y="193" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555">Hard</text>
  <text x="479" y="193" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555" text-anchor="end">${hard}</text>
  <rect x="154" y="197" width="210" height="5" rx="2.5" fill="#263040"/>
  <rect x="154" y="197" width="${bar(hard, 50)}"   height="5" rx="2.5" fill="#ff5555" opacity="0.85"/>

  <!-- POTDs solved (bottom right) -->
  <text x="479" y="214" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" text-anchor="end" letter-spacing="0.5">● Live via GFG API</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  // No cache — always fresh
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(svg);
}
