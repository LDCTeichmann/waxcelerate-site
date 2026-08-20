// ─── Shared graph vocabulary ─────────────────────────────────────────────────
// One visual language for both relationship graphs (the hero WaxDive dialog and
// the science-page FormulaGraph): gently curved edges, refined nodes with a hub
// halo + active glow, and relationship labels rendered as HTML "pills" so they
// stay legible and on-brand (sans, not the old monospace stroke-halo text).
// Pure render helpers — no hooks — so they're safe to call inside .map().

export type NodeState = 'active' | 'near' | 'dim';

// Quadratic Bézier between two points, bent perpendicular by `bend` (fraction of
// the segment length). Returns the path `d` and the on-curve midpoint (t=0.5) for
// label placement.
export function curvedEdge(ax: number, ay: number, bx: number, by: number, bend = 0.09, rA = 0, rB = 0) {
  const dx = bx - ax, dy = by - ay;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const sx = ax + ux * rA, sy = ay + uy * rA;
  const ex = bx - ux * rB, ey = by - uy * rB;
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const cx = mx - dy * bend, cy = my + dx * bend;
  const mid = { x: 0.25 * sx + 0.5 * cx + 0.25 * ex, y: 0.25 * sy + 0.5 * cy + 0.25 * ey };
  return { d: `M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`, mid, c: { x: cx, y: cy } };
}

// Point on a quadratic Bézier at parameter t∈[0,1] (a→b, control c). Lets callers
// ride a relationship label out toward one endpoint instead of the midpoint.
export function quadPoint(ax: number, ay: number, cx: number, cy: number, bx: number, by: number, t: number) {
  const u = 1 - t;
  return { x: u * u * ax + 2 * u * t * cx + t * t * bx, y: u * u * ay + 2 * u * t * cy + t * t * by };
}

// Refined node disc. Hubs (big) carry a faint concentric halo ring so importance
// reads from the ring, not just the radius; the active node fills with accent and
// gains a soft outer glow. Render this inside the caller's interactive <g>.
let _ncId = 0;
export function NodeCircle({ x, y, r, big, state }: {
  x: number; y: number; r: number; big?: boolean; state: NodeState;
}) {
  const active = state === 'active';
  const id = `nc${_ncId++}`;
  const ring = active ? 'var(--accent)'
    : state === 'near' ? 'rgba(var(--accent-rgb),0.55)'
    : 'var(--bd)';
  return (
    <g style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id={`${id}f`} cx="38%" cy="32%" r="68%">
          {active ? (
            <>
              <stop offset="0%" stopColor="var(--accent-strong)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="var(--sf)" />
              <stop offset="100%" stopColor="var(--sf2)" />
            </>
          )}
        </radialGradient>
      </defs>
      {active && (
        <circle cx={x} cy={y} r={r + (big ? 14 : 10)} fill="none"
          stroke="rgba(var(--accent-rgb),0.16)" strokeWidth={1.3}
          style={{ transition: 'opacity 0.3s' }} />
      )}
      {big && (
        <circle cx={x} cy={y} r={r + 6} fill="none"
          stroke={active ? 'rgba(var(--accent-rgb),0.40)' : 'rgba(var(--accent-rgb),0.15)'}
          strokeWidth={1.3} style={{ transition: 'stroke 0.25s' }} />
      )}
      <circle cx={x} cy={y} r={r}
        fill={`url(#${id}f)`}
        stroke={ring} strokeWidth={active ? 2.2 : 1.5}
        style={{
          filter: active
            ? 'drop-shadow(0 0 18px rgba(var(--accent-rgb),0.45)) drop-shadow(0 4px 12px rgba(var(--accent-rgb),0.28))'
            : 'drop-shadow(0 2px 8px rgba(0,0,0,0.13))',
          transition: 'fill 0.3s, stroke 0.3s, filter 0.3s',
        }} />
    </g>
  );
}

// Relationship label as an HTML pill, positioned over the SVG at a point given in
// viewBox coordinates (vbW × vbH). Fades in only when its edge is in focus.
export function EdgeLabel({ x, y, vbW, vbH, on, children }: {
  x: number; y: number; vbW: number; vbH: number; on: boolean; children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!on}
      className="absolute transition-opacity duration-300"
      style={{
        left: `${(x / vbW) * 100}%`, top: `${(y / vbH) * 100}%`,
        transform: 'translate(-50%, -50%)', opacity: on ? 1 : 0, pointerEvents: 'none',
      }}
    >
      <span
        className="inline-block whitespace-nowrap rounded-full px-2 py-[3px] text-meta font-medium leading-none"
        style={{
          background: 'var(--card-bg)', border: '1px solid var(--bd)',
          color: 'var(--accent)', boxShadow: '0 1px 5px rgba(0,0,0,0.10)',
        }}
      >
        {children}
      </span>
    </div>
  );
}

// Small legend swatch used in InstrumentFrame footers (— structure · - - surface).
export function LegendSwatch({ dashed }: { dashed?: boolean }) {
  return (
    <svg width="18" height="4" aria-hidden className="flex-shrink-0">
      <line x1="0" y1="2" x2="18" y2="2" stroke="var(--accent)" strokeWidth="2"
        strokeDasharray={dashed ? '3 3' : undefined} strokeLinecap="round" />
    </svg>
  );
}

// Reusable arrowhead marker for the component diagrams. Each inline SVG that needs
// an arrow renders <ArrowMarker id="…" /> in its <defs> and references it.
export function ArrowMarker({ id, color = 'var(--accent)' }: { id: string; color?: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6"
      orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill={color} />
    </marker>
  );
}
