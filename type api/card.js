// api/card.js  —  Vercel Serverless Function
// Deploy this repo to Vercel → your live GFG card URL:
// https://YOUR-VERCEL-APP.vercel.app/api/card?username=jharshavardhan

export default async function handler(req, res) {
  const { username = "jharshavardhan" } = req.query;

  // ── 1. Fetch from GFG public API ──────────────────────────────────────────
  let data = {};
  try {
    const apiRes = await fetch(
      `https://geeks-for-geeks-api.vercel.app/${username}`,
      { headers: { "User-Agent": "gfg-card-bot/1.0" } }
    );
    if (apiRes.ok) data = await apiRes.json();
  } catch (_) {}

  // ── 2. Parse stats ────────────────────────────────────────────────────────
  const solved  = data?.totalProblemsSolved ?? data?.solvedStats?.total ?? "–";
  const score   = data?.codingScore         ?? data?.score              ?? "–";
  const rank    = data?.instituteRank       ?? data?.rank               ?? "–";
  const streak  = data?.currentStreak       ?? data?.streak             ?? "–";
  const school  = data?.school  ?? data?.solvedStats?.school?.count  ?? 0;
  const basic   = data?.basic   ?? data?.solvedStats?.basic?.count   ?? 0;
  const easy    = data?.easy    ?? data?.solvedStats?.easy?.count    ?? 0;
  const medium  = data?.medium  ?? data?.solvedStats?.medium?.count  ?? 0;
  const hard    = data?.hard    ?? data?.solvedStats?.hard?.count    ?? 0;

  // ── 3. Bar widths (max 200px) ─────────────────────────────────────────────
  const bar = (val, max) => Math.min(Math.round((Number(val) / max) * 200), 200) || 4;
  const schoolBar  = bar(school,  50);
  const basicBar   = bar(basic,   50);
  const easyBar    = bar(easy,   100);
  const mediumBar  = bar(medium, 150);
  const hardBar    = bar(hard,    50);

  // ── 4. Build SVG ──────────────────────────────────────────────────────────
  const svg = `<svg width="480" height="195" viewBox="0 0 480 195"
  xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="GeeksForGeeks stats for ${username}">

  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#1a472a"/>
      <stop offset="100%" stop-color="#2d6a4f"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#1a1f2e"/>
      <stop offset="100%" stop-color="#141824"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Card background -->
  <rect width="480" height="195" rx="10" fill="url(#cardGrad)" stroke="#2d6a4f" stroke-width="1.5"/>

  <!-- Top accent bar -->
  <rect width="480" height="5" rx="2" fill="url(#headerGrad)"/>

  <!-- GFG dot + title -->
  <circle cx="26" cy="30" r="7" fill="#2F8D46" filter="url(#glow)"/>
  <text x="42" y="35" font-family="'Segoe UI',sans-serif" font-size="14"
        font-weight="700" fill="#f0f0f0" letter-spacing="0.5">GEEKSFORGEEKS</text>
  <text x="42" y="50" font-family="'Segoe UI',sans-serif" font-size="10"
        fill="#6b8f71">@${username}</text>

  <!-- Divider -->
  <line x1="16" y1="62" x2="464" y2="62" stroke="#2a3040" stroke-width="1"/>

  <!-- LEFT: Big solved number -->
  <text x="58" y="115" font-family="'Segoe UI',sans-serif" font-size="46"
        font-weight="800" fill="#f0f0f0" text-anchor="middle">${solved}</text>
  <text x="58" y="132" font-family="'Segoe UI',sans-serif" font-size="10"
        fill="#6b8f71" text-anchor="middle" letter-spacing="1">SOLVED</text>

  <!-- Score / Rank / Streak -->
  <text x="20" y="158" font-family="'Segoe UI',sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="0.8">SCORE</text>
  <text x="20" y="172" font-family="'Segoe UI',sans-serif" font-size="15"
        font-weight="700" fill="#50fa7b">${score}</text>

  <text x="76" y="158" font-family="'Segoe UI',sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="0.8">RANK</text>
  <text x="76" y="172" font-family="'Segoe UI',sans-serif" font-size="15"
        font-weight="700" fill="#f1c40f">#${rank}</text>

  <text x="20" y="188" font-family="'Segoe UI',sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="0.8">STREAK</text>
  <text x="76" y="188" font-family="'Segoe UI',sans-serif" font-size="11"
        font-weight="600" fill="#ffb86c">${streak} days 🔥</text>

  <!-- Vertical divider -->
  <line x1="130" y1="68" x2="130" y2="185" stroke="#2a3040" stroke-width="1"/>

  <!-- RIGHT: Difficulty bars -->
  <text x="148" y="80" font-family="'Segoe UI',sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="1">DIFFICULTY BREAKDOWN</text>

  <!-- School -->
  <text x="148" y="100" font-family="'Segoe UI',sans-serif" font-size="11" fill="#8be9fd">School</text>
  <text x="458" y="100" font-family="'Segoe UI',sans-serif" font-size="11" fill="#8be9fd" text-anchor="end">${school}</text>
  <rect x="148" y="104" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="104" width="${schoolBar}" height="5" rx="2.5" fill="#8be9fd" opacity="0.8"/>

  <!-- Basic -->
  <text x="148" y="122" font-family="'Segoe UI',sans-serif" font-size="11" fill="#a8d8a8">Basic</text>
  <text x="458" y="122" font-family="'Segoe UI',sans-serif" font-size="11" fill="#a8d8a8" text-anchor="end">${basic}</text>
  <rect x="148" y="126" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="126" width="${basicBar}" height="5" rx="2.5" fill="#a8d8a8" opacity="0.8"/>

  <!-- Easy -->
  <text x="148" y="144" font-family="'Segoe UI',sans-serif" font-size="11" fill="#50fa7b">Easy</text>
  <text x="458" y="144" font-family="'Segoe UI',sans-serif" font-size="11" fill="#50fa7b" text-anchor="end">${easy}</text>
  <rect x="148" y="148" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="148" width="${easyBar}" height="5" rx="2.5" fill="#50fa7b" opacity="0.85"/>

  <!-- Medium -->
  <text x="148" y="166" font-family="'Segoe UI',sans-serif" font-size="11" fill="#ffb86c">Medium</text>
  <text x="458" y="166" font-family="'Segoe UI',sans-serif" font-size="11" fill="#ffb86c" text-anchor="end">${medium}</text>
  <rect x="148" y="170" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="170" width="${mediumBar}" height="5" rx="2.5" fill="#ffb86c" opacity="0.85"/>

  <!-- Hard -->
  <text x="148" y="188" font-family="'Segoe UI',sans-serif" font-size="11" fill="#ff5555">Hard</text>
  <text x="458" y="188" font-family="'Segoe UI',sans-serif" font-size="11" fill="#ff5555" text-anchor="end">${hard}</text>
  <rect x="148" y="192" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="192" width="${hardBar}" height="5" rx="2.5" fill="#ff5555" opacity="0.85"/>
</svg>`;

  // ── 5. Return SVG with caching headers ────────────────────────────────────
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(svg);
}
