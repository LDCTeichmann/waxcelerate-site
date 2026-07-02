// ─── SprocketTooth — cassette/chainring tooth flank in cross-section ─────────
// state 'wax': crisp factory hook profile, no material loss.
// state 'oil': the drive flank is hollowed out — a dashed ghost outline of the
// original profile stays visible so the lost material reads as the gap between
// the two lines, plus fine abrasive debris sitting in the hollow. Metal surface
// uses the same technique as ContactZone (this page's other diagram): a
// theme-aware opacity gradient layered under a fine diagonal hatch, not a flat
// fill — that layering is what actually reads as "metal" instead of "grey
// blob". A second, smaller neighbour tooth (always healthy) establishes this
// as one tooth on a repeating cassette cog. Pure SVG, theme-driven via CSS
// vars, no hooks.

const HEALTHY_D =
  'M30,175 L36,138 Q42,100 62,68 Q80,42 108,30 Q120,26 132,32 Q148,40 156,62 L165,105 Q170,135 182,158 L198,175 Z';

const WORN_D =
  'M30,175 L36,138 Q42,100 62,68 Q80,42 108,30 Q120,26 132,32 Q142,52 138,76 Q134,112 148,142 Q158,160 175,168 L198,175 Z';

const NEIGHBOR_D =
  'M218,175 L221,152 Q225,124 236,106 Q248,90 261,86 Q269,84 276,88 Q283,95 286,109 L291,142 Q293,159 296,175 Z';

// The top-left rim of the healthy silhouette — traced again as a bright bevel
// stroke so the tooth reads as a lit, curved metal surface, not a flat cutout.
const HIGHLIGHT_D = 'M36,138 Q42,100 62,68 Q80,42 108,30 Q118,27 128,29';

// Angular grit fragments — same shape language as ContactZone's `grit`/`dust`
// arrays, scaled up slightly since this view is more zoomed-in.
const DEBRIS: { x: number; y: number; d: string; rot: number }[] = [
  { x: 141, y: 84,  d: 'M-3,-1.5 L0,-3.5 L3.5,-1 L2.5,2 L-1,3 L-3.5,0.5 Z',     rot: 10 },
  { x: 133, y: 101, d: 'M-2.5,-3 L2,-3 L4,0 L2,3 L-2,2.5 L-3.5,-0.5 Z',        rot: -15 },
  { x: 146, y: 117, d: 'M-3,-2 L1,-4 L4,-1 L3,2 L-0.5,3.5 L-3.5,1 Z',          rot: 25 },
  { x: 137, y: 133, d: 'M-2,-2.5 L2.5,-2 L3,1.5 L0,3 L-2.5,1.5 Z',             rot: -8 },
  { x: 151, y: 97,  d: 'M-2,-2 L2,-2.5 L3,1 L0,2.5 L-2.5,0.5 Z',              rot: 18 },
];

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

  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label={wax ? (de ? 'Unversehrte Zahnflanke' : 'Undamaged tooth flank') : (de ? 'Angefressene Zahnflanke' : 'Worn-away tooth flank')}
    >
      <defs>
        {/* Opacity-based tone, not hard color stops — same trick as ContactZone
            so it self-adapts between light and noir themes automatically. */}
        <linearGradient id="tooth-metal" x1="0.1" y1="0" x2="0.75" y2="1">
          <stop offset="0%"   stopColor="var(--tx2)" stopOpacity="0.09" />
          <stop offset="30%"  stopColor="var(--tx2)" stopOpacity="0.22" />
          <stop offset="65%"  stopColor="var(--tx2)" stopOpacity="0.13" />
          <stop offset="100%" stopColor="var(--tx2)" stopOpacity="0.30" />
        </linearGradient>
        {/* Fine 45° brushed-metal hatch, layered on top of the gradient fill. */}
        <pattern id="tooth-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--txm)" strokeWidth="0.35" opacity="0.07" />
        </pattern>
        {/* Faint measurement dot-grid backdrop — same recipe as InstrumentFrame,
            ties this panel to the site's one "instrument" register. */}
        <pattern id="tooth-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--accent)" opacity="0.09" />
        </pattern>
        <filter id="tooth-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>

      <rect x="0" y="0" width="320" height="200" fill="url(#tooth-dots)" />

      {/* Root-diameter reference — a faint arc, not a straight line, since this
          is a slice of a circular cog, not a linear rack. */}
      <path d="M14,178 Q160,192 306,178" fill="none" stroke="var(--bd2)" strokeWidth={1.5} />

      {/* Neighbouring tooth — always healthy, muted; context only. */}
      <path d={NEIGHBOR_D} fill="var(--sf3)" stroke="var(--bd)" strokeWidth={1.5} />
      <path d={NEIGHBOR_D} fill="url(#tooth-hatch)" opacity={0.6} />

      {/* Ghost outline of the original profile — only meaningful once the solid
          shape has departed from it, so it only renders (and only needs to)
          in the oil state. */}
      <path
        d={HEALTHY_D}
        fill="none"
        stroke="var(--txf)"
        strokeWidth={1.25}
        strokeDasharray="3 4"
        style={{ opacity: wax ? 0 : 0.85, transition: 'opacity 400ms ease' }}
      />

      {/* Solid tooth silhouette — morphs between the two path definitions.
          Gradient + hatch layered together read as brushed steel; a flat
          single-tone fill (the old version) just reads as a grey blob. */}
      <path
        d={wax ? HEALTHY_D : WORN_D}
        fill="var(--sf2)"
        stroke="var(--tx2)"
        strokeWidth={2}
        filter="url(#tooth-shadow)"
        style={{ transition: 'd 400ms ease' }}
      />
      <path d={wax ? HEALTHY_D : WORN_D} fill="url(#tooth-metal)" style={{ transition: 'd 400ms ease' }} />
      <path d={wax ? HEALTHY_D : WORN_D} fill="url(#tooth-hatch)" style={{ transition: 'd 400ms ease' }} />

      {/* Bevel highlight — the rim catching light, sold the surface as curved
          metal rather than a paper cutout. */}
      <path d={HIGHLIGHT_D} fill="none" stroke="var(--sf)" strokeWidth={1.5} strokeLinecap="round" opacity={0.55} />

      {/* Wear-zone debris (oil state only) */}
      <g style={{ opacity: wax ? 0 : 1, transition: 'opacity 400ms ease' }} aria-hidden>
        {DEBRIS.map((d, i) => (
          <path key={i} d={d.d} transform={`translate(${d.x},${d.y}) rotate(${d.rot})`} fill="var(--tx1)" opacity={0.5} />
        ))}
      </g>

      {/* Clean accent trace along the healthy hook (wax state only) */}
      <path
        d="M108,30 Q120,26 132,32"
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.75}
        strokeLinecap="round"
        style={{ opacity: wax ? 0.85 : 0, transition: 'opacity 400ms ease' }}
      />

      {/* Wear-zone callout (oil state only) — a technical-drawing style
          dimension line (perpendicular extension ticks + inline arrowheads)
          between the worn edge and the original ghost edge, grounded in the
          real elongation threshold rather than an invented measurement. */}
      <g style={{ opacity: wax ? 0 : 1, transition: 'opacity 400ms ease' }}>
        <line x1="142" y1="100" x2="142" y2="116" stroke="var(--txf)" strokeWidth={1} />
        <line x1="163" y1="100" x2="163" y2="116" stroke="var(--txf)" strokeWidth={1} />
        <line x1="145" y1="108" x2="160" y2="108" stroke="var(--txf)" strokeWidth={1} />
        <path d="M142,108 L147,105.5 L147,110.5 Z" fill="var(--txf)" />
        <path d="M163,108 L158,105.5 L158,110.5 Z" fill="var(--txf)" />
        <line x1="166" y1="108" x2="185" y2="108" stroke="var(--txf)" strokeWidth={1} strokeDasharray="1.5 3" />
        <text x="188" y="106" fontSize="8" fontWeight={700} letterSpacing="0.04em" fill="var(--tx2)" style={{ textTransform: 'uppercase' }}>
          {de ? 'Verschleiß' : 'Wear zone'}
        </text>
        <text x="188" y="117" fontSize="7.5" fill="var(--txf)" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
          {de ? 'ab 0,75 % Dehnung' : 'from 0.75% elongation'}
        </text>
      </g>
    </svg>
  );
}
