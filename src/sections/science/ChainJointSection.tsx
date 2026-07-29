// ─── ChainJointSection — section A–A through one chain joint ─────────────────
// Replaces an earlier concentric-ring drawing. Rings were geometrically correct
// and unreadable: three nested circles look like three circles, not like a
// roller sitting on a shoulder sitting on a pin, and the leader labels collided.
//
// Cut along the pin axis instead and every part becomes a distinct block, so
// the three sliding interfaces are unmistakable lines between two blocks:
//
//   ══════ outer plate ══════
//   ══════ inner plate ══════   ← zone 3 slides here (vertical line)
//        ╞═ roller ═╡           ← zone 2 slides here
//        ╞ shoulder ╡           ← zone 1 slides here
//   ─────── pin (hatched) ──────
//
// The active interface gets an accent line and a small ↔ token. The arrow does
// the explaining, which is why the drawing carries only three words of its own.
//
// The key drawing of actual chain above it is not decoration. Without it the
// cutaway is a stack of rectangles and nobody reads "chain link", so it renders
// in the compact variant too — that one sits on the homepage in front of the
// coldest audience on the site, where recognition matters most.
//
// Modern 9–12 speed chains are bushingless: the inner plate shoulder replaced
// the bushing. Drawing a bushing would be wrong for every chain we sell.

const A = { x0: 60, x1: 560 };          // pin extent
const CY = 150;                          // centreline
const PIN = 15;                          // pin half-height
const SHO = 31;                          // shoulder outer half-height
const ROL = 52;                          // roller outer half-height
const SHO_X = [148, 296] as const;       // left shoulder run (mirrored right)
const ROL_X = [186, 434] as const;
const IP_X = [130, 150] as const;        // inner plate (mirrored)
const OP_X = [102, 126] as const;        // outer plate (mirrored)
const KEY_P = [222, 266, 310, 354, 398]; // key chain pivots, 44 px pitch
const KEY_Y = 4;

const mirror = (x: number) => 620 - x;

const HAIR = { strokeWidth: 'var(--dw-hair)' } as const;
const LINE = { strokeWidth: 'var(--dw-line)' } as const;

export function ChainJointSection({
  active,
  compact = false,
  onZone,
}: {
  active: number | null;
  compact?: boolean;
  onZone?: (i: number) => void;
}) {
  const on = (i: number) => active === i;
  const stroke = (i: number) => (on(i) ? 'var(--accent)' : 'var(--txf)');
  const iw = (i: number) => ({ strokeWidth: on(i) ? 'var(--dw-bold)' : 'var(--dw-line)' });
  // Only a light hold-back. At 0.32 two thirds of the drawing looked broken
  // rather than out of focus, which is not what a construction drawing does.
  const fade = (i: number) => (active === null || on(i) ? 1 : 0.62);
  const fs = 14;

  const hit = (i: number) =>
    onZone ? { onMouseEnter: () => onZone(i), style: { cursor: 'pointer' } } : {};

  const Slide = ({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) => (
    <g transform={`translate(${x},${y})${vertical ? ' rotate(90)' : ''}`} style={{ pointerEvents: 'none' }}>
      <circle r={12} fill="var(--sf)" stroke="var(--accent)" style={LINE} />
      <path d="M-6 0 L6 0 M-6 0 L-3.2 -2.8 M-6 0 L-3.2 2.8 M6 0 L3.2 -2.8 M6 0 L3.2 2.8"
        fill="none" stroke="var(--accent)" strokeLinecap="round" style={LINE} />
    </g>
  );

  return (
    <svg viewBox={compact ? '18 40 512 232' : '2 20 600 262'} className="w-full h-auto"
      role="img" aria-label="Schnitt A–A durch ein Kettengelenk, die drei Gleitflächen sind markiert">

      {/* Key: a piece of chain, turned upright so its cut plane runs the same
          way the section is drawn.
          Earlier the chain lay horizontally with a vertical A–A line, and the
          section next to it was horizontal. Both were geometrically right and
          the eye still could not connect them, because a vertical cut mark does
          not lead anywhere near a horizontal drawing. Standing the chain up
          turns the cut plane horizontal, so the dashed line now runs straight
          out of the marked joint and into the section: left to right, cause and
          consequence, the way a drawing sheet is read. */}
      <g opacity={0.95} transform="translate(52,150) rotate(-90) translate(-310,-4)">
        {KEY_P.slice(0, -1).map((x, i) => {
          const h = i % 2 === 0 ? 11 : 8.5;   // outer plates sit proud of inner
          return (
            <rect key={x} x={x - 13} y={KEY_Y - h} width={KEY_P[i + 1] - x + 26} height={h * 2} rx={h}
              fill="none" stroke="var(--bd)" style={HAIR} />
          );
        })}
        {[266, 354].map(x => (
          <circle key={`r${x}`} cx={x} cy={KEY_Y} r={7.5} fill="none" stroke="var(--bd)" style={HAIR} />
        ))}
        {KEY_P.map(x => <circle key={`p${x}`} cx={x} cy={KEY_Y} r={3} fill="var(--bd)" />)}
        <line x1={310} y1={KEY_Y - 28} x2={310} y2={KEY_Y + 28} stroke="var(--accent)"
          strokeDasharray="5 3" style={HAIR} />
      </g>

      {/* Cut plane, continuing horizontally into the section */}
      <line x1={80} y1={CY} x2={OP_X[0] - 10} y2={CY} stroke="var(--accent)"
        strokeDasharray="5 3" opacity={0.4} style={HAIR} />
      {!compact && (
        <g className="num-data" fontSize={fs} fill="var(--accent)">
          <text x={16} y={CY + 4}>A</text>
          <text x={86} y={CY + 4}>A</text>
          <text x={52} y={44} textAnchor="middle" fill="var(--txff)">KETTE</text>
        </g>
      )}

      {/* ── Outer plates ── */}
      {[OP_X[0], mirror(OP_X[1])].map((x, i) => (
        <rect key={`op${i}`} x={x} y={CY - 78} width={OP_X[1] - OP_X[0]} height={156} rx={5}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} opacity={fade(2)} />
      ))}

      {/* ── Inner plates ── */}
      {[IP_X[0], mirror(IP_X[1])].map((x, i) => (
        <rect key={`ip${i}`} x={x} y={CY - 66} width={IP_X[1] - IP_X[0]} height={132} rx={4}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} opacity={fade(2)} />
      ))}

      {/* ── Shoulders — the bushing's job, formed from the inner plate ── */}
      {[[SHO_X[0], SHO_X[1]], [mirror(SHO_X[1]), mirror(SHO_X[0])]].map(([x0, x1], i) => (
        <g key={`sh${i}`} opacity={Math.max(fade(0), fade(1))}>
          <rect x={x0} y={CY - SHO} width={x1 - x0} height={SHO - PIN}
            fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
          <rect x={x0} y={CY + PIN} width={x1 - x0} height={SHO - PIN}
            fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
        </g>
      ))}

      {/* ── Roller ── */}
      <g opacity={fade(1)}>
        <rect x={ROL_X[0]} y={CY - ROL} width={ROL_X[1] - ROL_X[0]} height={ROL - SHO} rx={3}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
        <rect x={ROL_X[0]} y={CY + SHO} width={ROL_X[1] - ROL_X[0]} height={ROL - SHO} rx={3}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
      </g>

      {/* ── Pin ── */}
      <g opacity={fade(0)}>
        <rect x={A.x0} y={CY - PIN} width={A.x1 - A.x0} height={PIN * 2} rx={7}
          fill="var(--sf)" stroke="var(--tx2)" style={LINE} />
        {Array.from({ length: 26 }, (_, i) => A.x0 + 14 + i * 19).map(x => (
          <line key={x} x1={x} y1={CY - PIN + 2} x2={x - 11} y2={CY + PIN - 2}
            stroke="var(--bd)" style={HAIR} />
        ))}
      </g>

      {/* ── Zone 1 · pin against shoulder ── */}
      <g {...hit(0)}>
        <rect x={SHO_X[0]} y={CY - PIN - 8} width={mirror(SHO_X[0]) - SHO_X[0]} height={16} fill="transparent" />
        {[CY - PIN, CY + PIN].map(y => (
          <line key={y} x1={SHO_X[0]} y1={y} x2={mirror(SHO_X[0])} y2={y}
            stroke={stroke(0)} style={{ ...iw(0), transition: 'stroke .35s, stroke-width .35s' }} />
        ))}
        {on(0) && <Slide x={310} y={CY - PIN} />}
      </g>

      {/* ── Zone 2 · roller against shoulder ── */}
      <g {...hit(1)}>
        <rect x={ROL_X[0]} y={CY - SHO - 8} width={ROL_X[1] - ROL_X[0]} height={16} fill="transparent" />
        {[CY - SHO, CY + SHO].map(y => (
          <line key={y} x1={ROL_X[0]} y1={y} x2={ROL_X[1]} y2={y}
            stroke={stroke(1)} style={{ ...iw(1), transition: 'stroke .35s, stroke-width .35s' }} />
        ))}
        {on(1) && <Slide x={ROL_X[1] - 36} y={CY - SHO} />}
      </g>

      {/* ── Zone 3 · inner plate against outer plate ── */}
      <g {...hit(2)}>
        {[IP_X[0], mirror(IP_X[0])].map((x, i) => (
          <line key={i} x1={x} y1={CY - 66} x2={x} y2={CY + 66}
            stroke={stroke(2)} style={{ ...iw(2), transition: 'stroke .35s, stroke-width .35s' }} />
        ))}
        {on(2) && <Slide x={IP_X[0]} y={CY - 46} vertical />}
      </g>

      {!compact && (
        <g className="num-data" fontSize={fs} fill="var(--txf)">
          <text x={310} y={CY + 5} textAnchor="middle">BOLZEN</text>
          <text x={310} y={CY - ROL - 10} textAnchor="middle">ROLLE</text>
          <text x={OP_X[0] - 10} y={CY - 84} textAnchor="start">LASCHEN</text>
          <text x={340} y={CY + 112} textAnchor="middle" fill="var(--txff)">SCHNITT A–A</text>
        </g>
      )}
    </svg>
  );
}
