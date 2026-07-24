// ─── SprocketTooth — cassette tooth cross-section + elongation curve ─────────
// Two coordinated views of the same wear story:
//   1. A tooth-flank cross-section (top) — the new, full profile vs. the
//      "shark-fin" hooked/undercut profile a worn tooth actually develops
//      (matches the "Neue Kassette" / "Abgenutzte Kassette" comparison
//      already used in the reference photo elsewhere on this page).
//   2. A chain-elongation curve (bottom) — wear isn't a single measurement,
//      it's a rate; showing it as two diverging curves against a real
//      distance axis is what actually earns the word "curve", and it grounds
//      the "0,75 %" / "~2.000 km" / "4.000–5.000 km" figures already used in
//      this panel's caption in an actual plot instead of a floating label.
// Wax vs. oil are independent paths cross-fading on opacity, not one path
// morphing its `d` — the two silhouettes are topologically different enough
// (full hook vs. undercut claw) that forcing a shared segment count for a
// smooth morph looked worse than a clean swap.
const NEIGHBOR_D =
  'M225,175 C226,155 230,135 240,118 C248,105 259,97 270,97 C281,97 291,106 297,120 C303,136 305,155 305,175 Z';

const HEALTHY_D =
  'M28,175 C29,148 35,120 50,98 C64,79 82,68 103,68 C124,68 141,80 152,100 C162,119 166,146 166,175 Z';

const WORN_D =
  'M28,175 C29,148 35,120 50,98 C60,85 70,76 82,72 C90,69 96,72 97,80 C98,89 91,96 87,108 C82,123 85,138 96,148 C110,160 130,162 152,163 C160,163 165,168 166,175 Z';

const HIGHLIGHT_D = 'M31,150 C33,130 38,112 50,98';
const ACCENT_TRACE_D = 'M82,72 C90,69 96,72 97,80';

const DEBRIS = [
  'M108,100 L112,97 L116,101 L114,106 L109,107 L106,103 Z',
  'M100,118 L105,116 L108,121 L104,125 L99,123 Z',
  'M112,135 L117,133 L120,137 L116,141 L111,139 Z',
];

// Curve panel: x = km (0–5000), y = chain elongation % (0–1.4, plotted top-down).
// Wax crosses the 0,75 % replacement threshold at ~4.500 km; oil crosses it at
// ~2.000 km and keeps accelerating — matching the captions already shown
// below this panel in SciencePage.tsx, not new/invented numbers.
const CHART_X0 = 30, CHART_X1 = 300, CHART_Y0 = 200, CHART_Y1 = 270;
const THRESHOLD_Y = 232.5;
const WAX_CURVE_D = 'M30,270 C120,266 220,245 300,229';
const OIL_CURVE_D = 'M30,270 C90,255 120,235 138,232.5 C200,227 260,215 300,202.5';
const WAX_MARK = { x: 273, y: THRESHOLD_Y };
const OIL_MARK = { x: 138, y: THRESHOLD_Y };

export function SprocketTooth({
  state,
  className = '',
  de = true,
}: {
  state: 'wax' | 'oil';
  className?: string;
  de?: boolean;
}) {
  const wax = state === 'wax';
  const mark = wax ? WAX_MARK : OIL_MARK;

  return (
    <svg
      viewBox="0 0 320 300"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label={wax ? (de ? 'Unversehrte Zahnflanke' : 'Undamaged tooth flank') : (de ? 'Angefressene Zahnflanke' : 'Worn-away tooth flank')}
    >
      <defs>
        <linearGradient id="tooth-metal" x1="0.1" y1="0" x2="0.75" y2="1">
          <stop offset="0%"   stopColor="var(--tx2)" stopOpacity="0.09" />
          <stop offset="30%"  stopColor="var(--tx2)" stopOpacity="0.22" />
          <stop offset="65%"  stopColor="var(--tx2)" stopOpacity="0.13" />
          <stop offset="100%" stopColor="var(--tx2)" stopOpacity="0.30" />
        </linearGradient>
        <pattern id="tooth-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--txm)" strokeWidth="0.35" opacity="0.10" />
        </pattern>
        <pattern id="tooth-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--accent)" opacity="0.09" />
        </pattern>
        <filter id="tooth-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="4" stdDeviation="3.5" floodColor="#000" floodOpacity="0.20" />
        </filter>
      </defs>

      <rect x="0" y="0" width="320" height="300" fill="url(#tooth-dots)" />

      {/* ── Tooth cross-section ── */}
      <path d="M14,178 Q160,192 306,178" fill="none" stroke="var(--bd2)" strokeWidth={1.5} />
      <path d={NEIGHBOR_D} fill="var(--sf3)" stroke="var(--bd)" strokeWidth={1.5} />
      <path d={NEIGHBOR_D} fill="url(#tooth-hatch)" opacity={0.6} />

      {/* Ghost of the healthy profile — only meaningful once worn, so it only
          draws attention in the oil state. */}
      <path
        d={HEALTHY_D}
        fill="none"
        stroke="var(--txf)"
        strokeWidth={1.25}
        strokeDasharray="3 4"
        style={{ opacity: wax ? 0 : 0.85, transition: 'opacity 400ms ease' }}
      />

      {/* Healthy silhouette — full rounded hook. */}
      <g style={{ opacity: wax ? 1 : 0, transition: 'opacity 350ms ease' }}>
        <path d={HEALTHY_D} fill="var(--sf2)" stroke="var(--tx2)" strokeWidth={2} filter="url(#tooth-shadow)" />
        <path d={HEALTHY_D} fill="url(#tooth-metal)" />
        <path d={HEALTHY_D} fill="url(#tooth-hatch)" />
      </g>

      {/* Worn silhouette — the drive flank has been ground into a hooked,
          undercut "claw" profile; the gap to the dashed ghost line above IS
          the lost material. */}
      <g style={{ opacity: wax ? 0 : 1, transition: 'opacity 350ms ease' }}>
        <path d={WORN_D} fill="var(--sf2)" stroke="var(--tx2)" strokeWidth={2} filter="url(#tooth-shadow)" />
        <path d={WORN_D} fill="url(#tooth-metal)" />
        <path d={WORN_D} fill="url(#tooth-hatch)" />
        <g aria-hidden>
          {DEBRIS.map((d, i) => <path key={i} d={d} fill="var(--tx1)" opacity={0.45} />)}
        </g>
      </g>

      <path d={HIGHLIGHT_D} fill="none" stroke="var(--sf)" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <path
        d={ACCENT_TRACE_D}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.75}
        strokeLinecap="round"
        style={{ opacity: wax ? 0.85 : 0, transition: 'opacity 400ms ease' }}
      />

      {/* ── Elongation curve: wear isn't a single measurement, it's a rate ── */}
      <line x1={CHART_X0} y1={CHART_Y1} x2={CHART_X1} y2={CHART_Y1} stroke="var(--bd)" strokeWidth={1} />
      <line x1={CHART_X0} y1={CHART_Y0} x2={CHART_X0} y2={CHART_Y1} stroke="var(--bd)" strokeWidth={1} />
      <line x1={CHART_X0} y1={THRESHOLD_Y} x2={CHART_X1} y2={THRESHOLD_Y} stroke="var(--txf)" strokeWidth={1} strokeDasharray="2 3" />
      <text x={CHART_X1 + 3} y={THRESHOLD_Y + 3} fontSize="7" fill="var(--txf)" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
        0,75%
      </text>

      <path d={wax ? OIL_CURVE_D : WAX_CURVE_D} fill="none" stroke="var(--txf)" strokeWidth={1.5} opacity={0.4} />
      <path
        d={wax ? WAX_CURVE_D : OIL_CURVE_D}
        fill="none"
        strokeWidth={2.25}
        strokeLinecap="round"
        style={{ stroke: wax ? 'var(--accent)' : 'var(--tx2)', transition: 'stroke 350ms ease' }}
      />
      <circle cx={mark.x} cy={mark.y} r={3} style={{ fill: wax ? 'var(--accent)' : 'var(--tx2)', transition: 'fill 350ms ease' }} />
      <line x1={mark.x} y1={mark.y} x2={mark.x} y2={CHART_Y1} strokeWidth={1} strokeDasharray="1.5 2.5" opacity={0.5}
        style={{ stroke: wax ? 'var(--accent)' : 'var(--tx2)', transition: 'stroke 350ms ease' }} />

      <text x={CHART_X0} y={CHART_Y1 + 12} fontSize="7" fill="var(--txm)" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>0</text>
      <text x={(CHART_X0 + CHART_X1) / 2 - 16} y={CHART_Y1 + 12} fontSize="7" fill="var(--txm)" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
        2.500 km
      </text>
      <text x={CHART_X1 - 22} y={CHART_Y1 + 12} fontSize="7" fill="var(--txm)" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
        5.000
      </text>
      <text x={CHART_X0} y={CHART_Y0 - 6} fontSize="7" fontWeight={700} letterSpacing="0.06em" fill="var(--txf)" style={{ textTransform: 'uppercase' }}>
        {de ? 'Kettendehnung' : 'Chain elongation'}
      </text>
    </svg>
  );
}
