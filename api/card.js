// api/card.js — Vercel Serverless Function
export default async function handler(req, res) {
  const { username = "jharshavardhan" } = req.query;

  let solved = "–", score = "–", rank = "–", streak = "–";
  let school = 0, basic = 0, easy = 0, medium = 0, hard = 0;
// api/card.js — Vercel Serverless Function
// Tries multiple GFG APIs with correct field mappings
export default async function handler(req, res) {
  const { username = "jharshavardhan" } = req.query;

  let solved = "–", score = "–", rank = "–", streak = "–";
  let school = 0, basic = 0, easy = 0, medium = 0, hard = 0;
  let gotData = false;

  // ── API 1: arnoob16 (returns info{} + solvedStats{}) ────────────────────
  try {
    const r = await fetch(`https://geeks-for-geeks-api.vercel.app/${username}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(5000),
    });
    if (r.ok) {
      const d = await r.json();
      if (d?.info) {
        solved = d.info.totalProblemsSolved ?? "–";
        score  = d.info.codingScore         ?? "–";
        rank   = d.info.instituteRank       ?? "–";
        streak = d.info.currentStreak       ?? "–";
        school = Number(d.solvedStats?.school?.count ?? 0);
        basic  = Number(d.solvedStats?.basic?.count  ?? 0);
        easy   = Number(d.solvedStats?.easy?.count   ?? 0);
        medium = Number(d.solvedStats?.medium?.count ?? 0);
        hard   = Number(d.solvedStats?.hard?.count   ?? 0);
        if (Number(solved) > 0) gotData = true;
      }
    }
  } catch (_) {}

  // ── API 2: pratham1singh (returns flat JSON) ─────────────────────────────
  if (!gotData) {
    try {
      const r = await fetch(`https://gfg-api-fefa.onrender.com/${username}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(6000),
      });
      if (r.ok) {
        const d = await r.json();
        solved = d.problems_solved   ?? d.totalSolved    ?? "–";
        score  = d.overallScore      ?? d.coding_score   ?? "–";
        rank   = d.rank              ?? "–";
        streak = d.streak            ?? "–";
        school = Number(d.school     ?? 0);
        basic  = Number(d.basic      ?? 0);
        easy   = Number(d.easy       ?? 0);
        medium = Number(d.medium     ?? 0);
        hard   = Number(d.hard       ?? 0);
        if (Number(solved) > 0) gotData = true;
      }
    } catch (_) {}
  }

  // ── API 3: napiyo (returns JSON with raw=y) ──────────────────────────────
  if (!gotData) {
    try {
      const r = await fetch(
        `https://geeks-for-geeks-stats-api.vercel.app/?raw=y&userName=${username}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (r.ok) {
        const d = await r.json();
        solved = d.totalProblemsSolved ?? d.Total         ?? "–";
        score  = d.codingScore        ?? d.CodingScore    ?? "–";
        rank   = d.instituteRank      ?? d.GlobalRank     ?? "–";
        streak = d.streak             ?? "–";
        school = Number(d.School ?? 0);
        basic  = Number(d.Basic  ?? d.basic  ?? 0);
        easy   = Number(d.Easy   ?? d.easy   ?? 0);
        medium = Number(d.Medium ?? d.medium ?? 0);
        hard   = Number(d.Hard   ?? d.hard   ?? 0);
      }
    } catch (_) {}
  }

  // ── Bar widths (max 200px) ────────────────────────────────────────────────
  const bar = (v, max) => Math.max(4, Math.min(Math.round((Number(v) / max) * 200), 200));

  // ── Build SVG ─────────────────────────────────────────────────────────────
  const svg = `<svg width="480" height="210" viewBox="0 0 480 210"
  xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="GeeksForGeeks stats for ${username}">
  <defs>
    <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1a472a"/>
      <stop offset="100%" stop-color="#2d6a4f"/>
    </linearGradient>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a1f2e"/>
      <stop offset="100%" stop-color="#141824"/>
    </linearGradient>
  </defs>

  <!-- Card -->
  <rect width="480" height="210" rx="10" fill="url(#bg)" stroke="#2d6a4f" stroke-width="1.5"/>
  <rect width="480" height="5" rx="2" fill="url(#hg)"/>

  <!-- Header -->
  <circle cx="26" cy="32" r="7" fill="#2F8D46" opacity="0.9"/>
  <text x="42" y="37" font-family="Segoe UI,sans-serif" font-size="14"
        font-weight="700" fill="#f0f0f0" letter-spacing="0.5">GEEKSFORGEEKS</text>
  <text x="42" y="52" font-family="Segoe UI,sans-serif" font-size="10"
        fill="#6b8f71">@${username}</text>
  <line x1="16" y1="62" x2="464" y2="62" stroke="#2a3040" stroke-width="1"/>

  <!-- Left: Solved number -->
  <text x="65" y="108" font-family="Segoe UI,sans-serif" font-size="44"
        font-weight="800" fill="#f0f0f0" text-anchor="middle">${solved}</text>
  <text x="65" y="126" font-family="Segoe UI,sans-serif" font-size="10"
        fill="#6b8f71" text-anchor="middle" letter-spacing="1">SOLVED</text>

  <!-- Score -->
  <text x="16" y="150" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="0.8">SCORE</text>
  <text x="16" y="165" font-family="Segoe UI,sans-serif" font-size="17"
        font-weight="700" fill="#50fa7b">${score}</text>

  <!-- Rank -->
  <text x="75" y="150" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="0.8">RANK</text>
  <text x="75" y="165" font-family="Segoe UI,sans-serif" font-size="17"
        font-weight="700" fill="#f1c40f">#${rank}</text>

  <!-- Streak -->
  <text x="16" y="184" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="0.8">STREAK</text>
  <text x="16" y="200" font-family="Segoe UI,sans-serif" font-size="13"
        font-weight="600" fill="#ffb86c">${streak} days &#x1F525;</text>

  <!-- Vertical divider -->
  <line x1="130" y1="68" x2="130" y2="205" stroke="#2a3040" stroke-width="1"/>

  <!-- Right: Difficulty header -->
  <text x="148" y="82" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="1">DIFFICULTY BREAKDOWN</text>

  <!-- School -->
  <text x="148" y="101" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd">School</text>
  <text x="460" y="101" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd" text-anchor="end">${school}</text>
  <rect x="148" y="105" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="105" width="${bar(school, 30)}" height="5" rx="2.5" fill="#8be9fd" opacity="0.8"/>

  <!-- Basic -->
  <text x="148" y="123" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8">Basic</text>
  <text x="460" y="123" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8" text-anchor="end">${basic}</text>
  <rect x="148" y="127" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="127" width="${bar(basic, 50)}" height="5" rx="2.5" fill="#a8d8a8" opacity="0.8"/>

  <!-- Easy -->
  <text x="148" y="145" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b">Easy</text>
  <text x="460" y="145" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b" text-anchor="end">${easy}</text>
  <rect x="148" y="149" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="149" width="${bar(easy, 100)}" height="5" rx="2.5" fill="#50fa7b" opacity="0.85"/>

  <!-- Medium -->
  <text x="148" y="167" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c">Medium</text>
  <text x="460" y="167" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c" text-anchor="end">${medium}</text>
  <rect x="148" y="171" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="171" width="${bar(medium, 150)}" height="5" rx="2.5" fill="#ffb86c" opacity="0.85"/>

  <!-- Hard -->
  <text x="148" y="189" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555">Hard</text>
  <text x="460" y="189" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555" text-anchor="end">${hard}</text>
  <rect x="148" y="193" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="193" width="${bar(hard, 50)}" height="5" rx="2.5" fill="#ff5555" opacity="0.85"/>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(svg);
}

  const apis = [
    `https://geeks-for-geeks-api.vercel.app/${username}`,
    `https://gfgstatscard.vercel.app/api/stats?user=${username}`,
  ];

  for (const url of apis) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) continue;
      const d = await r.json();

      solved = d.totalProblemsSolved ?? d.info?.totalProblemsSolved ?? d.solvedStats?.total ?? d.solved ?? "–";
      score  = d.codingScore ?? d.info?.codingScore ?? d.score ?? "–";
      rank   = d.instituteRank ?? d.info?.instituteRank ?? d.rank ?? "–";
      streak = d.currentStreak ?? d.info?.currentStreak ?? d.streak ?? "–";
      school = d.school ?? d.solvedStats?.school?.count ?? d.info?.school ?? 0;
      basic  = d.basic  ?? d.solvedStats?.basic?.count  ?? d.info?.basic  ?? 0;
      easy   = d.easy   ?? d.solvedStats?.easy?.count   ?? d.info?.easy   ?? 0;
      medium = d.medium ?? d.solvedStats?.medium?.count ?? d.info?.medium ?? 0;
      hard   = d.hard   ?? d.solvedStats?.hard?.count   ?? d.info?.hard   ?? 0;

      if (solved !== "–" && Number(solved) > 0) break;
    } catch (_) { continue; }
  }

  const bar = (v, max) => Math.max(4, Math.min(Math.round((Number(v) / max) * 200), 200));

  const svg = `<svg width="480" height="210" viewBox="0 0 480 210"
  xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="GeeksForGeeks stats for ${username}">
  <defs>
    <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1a472a"/>
      <stop offset="100%" stop-color="#2d6a4f"/>
    </linearGradient>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a1f2e"/>
      <stop offset="100%" stop-color="#141824"/>
    </linearGradient>
  </defs>
  <rect width="480" height="210" rx="10" fill="url(#bg)" stroke="#2d6a4f" stroke-width="1.5"/>
  <rect width="480" height="5" rx="2" fill="url(#hg)"/>
  <circle cx="26" cy="32" r="7" fill="#2F8D46" opacity="0.9"/>
  <text x="42" y="37" font-family="Segoe UI,sans-serif" font-size="14" font-weight="700" fill="#f0f0f0" letter-spacing="0.5">GEEKSFORGEEKS</text>
  <text x="42" y="52" font-family="Segoe UI,sans-serif" font-size="10" fill="#6b8f71">@${username}</text>
  <line x1="16" y1="62" x2="464" y2="62" stroke="#2a3040" stroke-width="1"/>
  <text x="65" y="108" font-family="Segoe UI,sans-serif" font-size="44" font-weight="800" fill="#f0f0f0" text-anchor="middle">${solved}</text>
  <text x="65" y="125" font-family="Segoe UI,sans-serif" font-size="10" fill="#6b8f71" text-anchor="middle" letter-spacing="1">SOLVED</text>
  <text x="20" y="150" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">SCORE</text>
  <text x="20" y="164" font-family="Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#50fa7b">${score}</text>
  <text x="80" y="150" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">RANK</text>
  <text x="80" y="164" font-family="Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#f1c40f">#${rank}</text>
  <text x="20" y="182" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">STREAK</text>
  <text x="20" y="196" font-family="Segoe UI,sans-serif" font-size="13" font-weight="600" fill="#ffb86c">${streak} days 🔥</text>
  <line x1="130" y1="68" x2="130" y2="200" stroke="#2a3040" stroke-width="1"/>
  <text x="148" y="82" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="1">DIFFICULTY BREAKDOWN</text>
  <text x="148" y="102" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd">School</text>
  <text x="458" y="102" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd" text-anchor="end">${school}</text>
  <rect x="148" y="106" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="106" width="${bar(school,30)}" height="5" rx="2.5" fill="#8be9fd" opacity="0.8"/>
  <text x="148" y="124" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8">Basic</text>
  <text x="458" y="124" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8" text-anchor="end">${basic}</text>
  <rect x="148" y="128" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="128" width="${bar(basic,50)}" height="5" rx="2.5" fill="#a8d8a8" opacity="0.8"/>
  <text x="148" y="146" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b">Easy</text>
  <text x="458" y="146" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b" text-anchor="end">${easy}</text>
  <rect x="148" y="150" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="150" width="${bar(easy,100)}" height="5" rx="2.5" fill="#50fa7b" opacity="0.85"/>
  <text x="148" y="168" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c">Medium</text>
  <text x="458" y="168" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c" text-anchor="end">${medium}</text>
  <rect x="148" y="172" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="172" width="${bar(medium,150)}" height="5" rx="2.5" fill="#ffb86c" opacity="0.85"/>
  <text x="148" y="190" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555">Hard</text>
  <text x="458" y="190" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555" text-anchor="end">${hard}</text>
  <rect x="148" y="194" width="200" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="148" y="194" width="${bar(hard,50)}" height="5" rx="2.5" fill="#ff5555" opacity="0.85"/>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(svg);
}
