// api/card.js — Live GFG Stats Card for Vercel Edge
export default async function handler(req, res) {
  const { username = "jharshavardhan" } = req.query;

  let solved = 0, score = "–", rank = "–", streak = "–", monthly = "–";
  let school = 0, basic = 0, easy = 0, medium = 0, hard = 0;
  let gotData = false;

  // ── API 1: tashif.codes (returns problemsByDifficulty{}) ─────────────────
  if (!gotData) {
    try {
      const r = await fetch(`https://gfg-stats.tashif.codes/${username}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (r.ok) {
        const d = await r.json();
        solved = Number(d.totalProblemsSolved ?? 0);
        school = Number(d.problemsByDifficulty?.school ?? 0);
        basic  = Number(d.problemsByDifficulty?.basic  ?? 0);
        easy   = Number(d.problemsByDifficulty?.easy   ?? 0);
        medium = Number(d.problemsByDifficulty?.medium ?? 0);
        hard   = Number(d.problemsByDifficulty?.hard   ?? 0);
        if (solved > 0) gotData = true;
      }
    } catch (_) {}
  }

  // ── API 2: arnoob16 (returns info{} + solvedStats{count}) ────────────────
  if (!gotData) {
    try {
      const r = await fetch(`https://geeks-for-geeks-api.vercel.app/${username}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (r.ok) {
        const d = await r.json();
        solved  = Number(d.info?.totalProblemsSolved ?? 0);
        score   = d.info?.codingScore   ?? "–";
        rank    = d.info?.instituteRank ?? "–";
        streak  = d.info?.currentStreak ?? "–";
        monthly = d.info?.monthlyCodingScore ?? "–";
        school  = Number(d.solvedStats?.school?.count ?? 0);
        basic   = Number(d.solvedStats?.basic?.count  ?? 0);
        easy    = Number(d.solvedStats?.easy?.count   ?? 0);
        medium  = Number(d.solvedStats?.medium?.count ?? 0);
        hard    = Number(d.solvedStats?.hard?.count   ?? 0);
        if (solved > 0) gotData = true;
      }
    } catch (_) {}
  }

  // ── API 3: pratham1singh (flat JSON, arrays for each difficulty) ──────────
  if (!gotData) {
    try {
      const r = await fetch(`https://gfg-api-fefa.onrender.com/${username}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(7000),
      });
      if (r.ok) {
        const d = await r.json();
        solved  = Number(d.totalSolved    ?? d.problems_solved ?? 0);
        score   = d.overallScore          ?? d.coding_score    ?? "–";
        rank    = d.rank                  ?? "–";
        streak  = d.streak                ?? "–";
        monthly = d.monthlyScore          ?? "–";
        // Arrays of problem names per difficulty
        school  = Array.isArray(d.school) ? d.school.length : Number(d.school ?? 0);
        basic   = Array.isArray(d.basic)  ? d.basic.length  : Number(d.basic  ?? 0);
        easy    = Array.isArray(d.easy)   ? d.easy.length   : Number(d.easy   ?? 0);
        medium  = Array.isArray(d.medium) ? d.medium.length : Number(d.medium ?? 0);
        hard    = Array.isArray(d.hard)   ? d.hard.length   : Number(d.hard   ?? 0);
        if (solved > 0) gotData = true;
      }
    } catch (_) {}
  }

  // ── API 4: napiyo (query param style) ────────────────────────────────────
  if (!gotData) {
    try {
      const r = await fetch(
        `https://geeks-for-geeks-stats-api.vercel.app/?raw=y&userName=${username}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (r.ok) {
        const d = await r.json();
        solved  = Number(d.totalProblemsSolved ?? d.Total ?? 0);
        score   = d.codingScore  ?? d.CodingScore ?? "–";
        rank    = d.instituteRank ?? d.GlobalRank ?? "–";
        streak  = d.streak ?? "–";
        school  = Number(d.School ?? d.school ?? 0);
        basic   = Number(d.Basic  ?? d.basic  ?? 0);
        easy    = Number(d.Easy   ?? d.easy   ?? 0);
        medium  = Number(d.Medium ?? d.medium ?? 0);
        hard    = Number(d.Hard   ?? d.hard   ?? 0);
      }
    } catch (_) {}
  }

  // ── Bar widths ────────────────────────────────────────────────────────────
  const bar = (v, max) => Math.max(4, Math.min(Math.round((Number(v) / max) * 200), 200));

  // ── SVG Card ──────────────────────────────────────────────────────────────
  const svg = `<svg width="495" height="215" viewBox="0 0 495 215"
  xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="GeeksForGeeks stats for ${username}">
  <defs>
    <linearGradient id="topbar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#1a472a"/>
      <stop offset="100%" stop-color="#2d6a4f"/>
    </linearGradient>
    <linearGradient id="cardbg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#1e2130"/>
      <stop offset="100%" stop-color="#161925"/>
    </linearGradient>
  </defs>

  <!-- Card -->
  <rect width="495" height="215" rx="10" fill="url(#cardbg)" stroke="#2d6a4f" stroke-width="1.5"/>
  <rect width="495" height="6"   rx="3"  fill="url(#topbar)"/>

  <!-- GFG dot + title -->
  <circle cx="28" cy="34" r="8" fill="#2F8D46" opacity="0.9"/>
  <text x="46" y="39" font-family="Segoe UI,sans-serif" font-size="14"
        font-weight="700" fill="#f0f0f0" letter-spacing="0.5">GEEKSFORGEEKS</text>
  <text x="46" y="54" font-family="Segoe UI,sans-serif" font-size="10" fill="#6b8f71">@${username}</text>
  <line x1="16" y1="65" x2="479" y2="65" stroke="#2a3040" stroke-width="1"/>

  <!-- Left panel: Solved -->
  <text x="67" y="115" font-family="Segoe UI,sans-serif" font-size="46"
        font-weight="800" fill="#f0f0f0" text-anchor="middle">${solved || "–"}</text>
  <text x="67" y="133" font-family="Segoe UI,sans-serif" font-size="10"
        fill="#6b8f71" text-anchor="middle" letter-spacing="1.2">SOLVED</text>

  <!-- Score -->
  <text x="16" y="157" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">SCORE</text>
  <text x="16" y="173" font-family="Segoe UI,sans-serif" font-size="18" font-weight="700" fill="#50fa7b">${score}</text>

  <!-- Rank -->
  <text x="78" y="157" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">RANK</text>
  <text x="78" y="173" font-family="Segoe UI,sans-serif" font-size="18" font-weight="700" fill="#f1c40f">#${rank}</text>

  <!-- Streak -->
  <text x="16" y="193" font-family="Segoe UI,sans-serif" font-size="9" fill="#6b8f71" letter-spacing="0.8">STREAK</text>
  <text x="16" y="208" font-family="Segoe UI,sans-serif" font-size="13" font-weight="600" fill="#ffb86c">${streak} days &#x1F525;</text>

  <!-- Vertical divider -->
  <line x1="136" y1="72" x2="136" y2="208" stroke="#2a3040" stroke-width="1"/>

  <!-- Right: Breakdown header -->
  <text x="154" y="84" font-family="Segoe UI,sans-serif" font-size="9"
        fill="#6b8f71" letter-spacing="1.2">DIFFICULTY BREAKDOWN</text>

  <!-- School -->
  <text x="154" y="104" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd">School</text>
  <text x="479" y="104" font-family="Segoe UI,sans-serif" font-size="11" fill="#8be9fd" text-anchor="end">${school}</text>
  <rect x="154" y="108" width="210" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="154" y="108" width="${bar(school,30)}"  height="5" rx="2.5" fill="#8be9fd" opacity="0.8"/>

  <!-- Basic -->
  <text x="154" y="126" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8">Basic</text>
  <text x="479" y="126" font-family="Segoe UI,sans-serif" font-size="11" fill="#a8d8a8" text-anchor="end">${basic}</text>
  <rect x="154" y="130" width="210" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="154" y="130" width="${bar(basic,50)}"  height="5" rx="2.5" fill="#a8d8a8" opacity="0.8"/>

  <!-- Easy -->
  <text x="154" y="148" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b">Easy</text>
  <text x="479" y="148" font-family="Segoe UI,sans-serif" font-size="11" fill="#50fa7b" text-anchor="end">${easy}</text>
  <rect x="154" y="152" width="210" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="154" y="152" width="${bar(easy,100)}"  height="5" rx="2.5" fill="#50fa7b" opacity="0.85"/>

  <!-- Medium -->
  <text x="154" y="170" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c">Medium</text>
  <text x="479" y="170" font-family="Segoe UI,sans-serif" font-size="11" fill="#ffb86c" text-anchor="end">${medium}</text>
  <rect x="154" y="174" width="210" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="154" y="174" width="${bar(medium,150)}" height="5" rx="2.5" fill="#ffb86c" opacity="0.85"/>

  <!-- Hard -->
  <text x="154" y="192" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555">Hard</text>
  <text x="479" y="192" font-family="Segoe UI,sans-serif" font-size="11" fill="#ff5555" text-anchor="end">${hard}</text>
  <rect x="154" y="196" width="210" height="5" rx="2.5" fill="#2a3040"/>
  <rect x="154" y="196" width="${bar(hard,50)}"   height="5" rx="2.5" fill="#ff5555" opacity="0.85"/>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(svg);
}
