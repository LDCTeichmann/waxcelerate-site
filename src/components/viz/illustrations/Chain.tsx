// ─── Chain — minimal line illustration of a bicycle chain ────────────────────
// state 'wax': crisp links + faint accent "dry film" sheen.
// state 'oil': same chain caked in grime blobs (the grinding-paste problem).
// Both layers always render; opacity crossfades on state so the chain "morphs".
// Pure SVG, theme-driven via CSS vars, no hooks (safe to render anywhere).

const CY = 65;
const R = 12;          // roller radius
const PIN = 4;         // pin-hole radius
const ROLLERS = [40, 90, 140, 190, 240, 290, 340];

// Static grime cluster (the dirt oil binds into a grinding paste).
const GRIME = [
  { x: 64,  y: 58, r: 6 }, { x: 88,  y: 74, r: 8 }, { x: 116, y: 60, r: 5 },
  { x: 140, y: 78, r: 9 }, { x: 168, y: 56, r: 6 }, { x: 192, y: 76, r: 8 },
  { x: 216, y: 62, r: 5 }, { x: 240, y: 80, r: 9 }, { x: 268, y: 58, r: 6 },
  { x: 292, y: 75, r: 8 }, { x: 316, y: 62, r: 5 },
];
const GRIME_DARK = [
  { x: 90, y: 72, r: 3 }, { x: 142, y: 76, r: 3.5 }, { x: 242, y: 78, r: 3 }, { x: 192, y: 60, r: 2.5 },
];

export function Chain({
  state,
  surface = 'var(--sf2)',
  className = '',
}: {
  state: 'wax' | 'oil';
  surface?: string;
  className?: string;
}) {
  const wax = state === 'wax';

  return (
    <svg
      viewBox="0 0 380 130"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label={wax ? 'Clean wax-coated chain' : 'Oil chain caked in grime'}
      style={{ overflow: 'visible' }}
    >
      {/* ── Base chain (always visible) ── */}
      <g stroke="var(--tx2)" strokeWidth={2} fill={surface}>
        {/* link plates (stadiums centered on consecutive pins) */}
        {ROLLERS.slice(0, -1).map((x, i) => {
          const next = ROLLERS[i + 1];
          return (
            <rect
              key={`plate-${i}`}
              x={x - R - 1}
              y={CY - (R + 1)}
              width={next - x + (R + 1) * 2}
              height={(R + 1) * 2}
              rx={R + 1}
            />
          );
        })}
        {/* rollers */}
        {ROLLERS.map((x, i) => (
          <circle key={`roller-${i}`} cx={x} cy={CY} r={R} />
        ))}
        {/* pin holes */}
        {ROLLERS.map((x, i) => (
          <circle key={`pin-${i}`} cx={x} cy={CY} r={PIN} fill="none" />
        ))}
      </g>

      {/* ── Grime layer (oil state) ── */}
      <g
        style={{ opacity: wax ? 0 : 1, transition: 'opacity 400ms ease' }}
        aria-hidden
      >
        {GRIME.map((g, i) => (
          <circle key={`grime-${i}`} cx={g.x} cy={g.y} r={g.r} fill="var(--txm)" opacity={0.55} />
        ))}
        {GRIME_DARK.map((g, i) => (
          <circle key={`grimed-${i}`} cx={g.x} cy={g.y} r={g.r} fill="var(--tx1)" opacity={0.5} />
        ))}
        {/* oily drips */}
        {[110, 200, 300].map((x, i) => (
          <path key={`drip-${i}`} d={`M${x} ${CY + R} q 0 12 0 18`} stroke="var(--txm)" strokeWidth={2.5}
            strokeLinecap="round" fill="none" opacity={0.45} />
        ))}
      </g>

      {/* ── Wax sheen layer (wax state) ── */}
      <g
        style={{ opacity: wax ? 1 : 0, transition: 'opacity 400ms ease' }}
        aria-hidden
      >
        {/* dry-film highlight tracing the top of the chain */}
        <path
          d={`M${ROLLERS[0] - R} ${CY - R - 4} L${ROLLERS[ROLLERS.length - 1] + R} ${CY - R - 4}`}
          stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="2 5" strokeLinecap="round" fill="none"
          opacity={0.7}
        />
        {/* clean accent pins */}
        {ROLLERS.map((x, i) => (
          <circle key={`waxpin-${i}`} cx={x} cy={CY} r={2.4} fill="var(--accent)" />
        ))}
      </g>
    </svg>
  );
}
