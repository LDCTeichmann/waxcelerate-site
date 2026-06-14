import { useState } from 'react';
import { COMPONENTS, EDGES, type ScienceComponent } from '@/lib/science';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const byNode = (n: number) => COMPONENTS.find(c => c.node === n)!;

// One interactive node (no hooks → safe to render inside .map via this wrapper)
function GraphNode({ c, de, dim, active, onActivate, onSelect }: {
  c: ScienceComponent; de: boolean; dim: boolean; active: boolean;
  onActivate: (n: number | null) => void; onSelect: (id: string) => void;
}) {
  return (
    <g
      role="button" tabIndex={0}
      aria-label={de ? c.nameDe : c.nameEn}
      style={{ cursor: 'pointer', opacity: dim ? 0.16 : 1, transition: 'opacity 220ms ease', outline: 'none' }}
      onMouseEnter={() => onActivate(c.node)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(c.node)}
      onBlur={() => onActivate(null)}
      onClick={() => onSelect(c.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c.id); } }}
    >
      <circle cx={c.cx} cy={c.cy} r={c.r}
        fill="var(--sf2)"
        stroke={active ? 'var(--accent)' : 'var(--tx2)'}
        strokeWidth={c.node === 4 ? 2.5 : 1.75} />
      <text x={c.cx} y={c.cy - 2} textAnchor="middle" fontSize={c.node === 4 ? 17 : 14}
        fontWeight={600} fill="var(--tx1)">
        {de ? c.graphLabelDe : c.graphLabelEn}
      </text>
      <text x={c.cx} y={c.cy + 15} textAnchor="middle" fontSize={12} fill="var(--accent-soft)" fontFamily={MONO}>
        {c.metric}
      </text>
    </g>
  );
}

export function FormulaGraph({ de, onSelect }: { de: boolean; onSelect: (id: string) => void }) {
  const [active, setActive] = useState<number | null>(null);

  // Nodes connected to the active node (via any edge), plus the active node itself.
  const connected = new Set<number>();
  if (active != null) {
    connected.add(active);
    EDGES.forEach(e => {
      if (e.from === active) connected.add(e.to);
      if (e.to === active) connected.add(e.from);
    });
  }
  const dimNode = (n: number) => active != null && !connected.has(n);
  const edgeActive = (e: typeof EDGES[number]) => active != null && (e.from === active || e.to === active);

  const activeComp = active != null ? byNode(active) : null;

  return (
    <div>
      <svg viewBox="0 0 640 430" className="w-full h-auto" style={{ overflow: 'visible' }}
        role="group" aria-label={de ? 'Komponenten-Beziehungen' : 'Component relationships'}>
        {/* edges */}
        {EDGES.map((e, i) => {
          const a = byNode(e.from), b = byNode(e.to);
          const on = edgeActive(e);
          const mx = (a.cx + b.cx) / 2, my = (a.cy + b.cy) / 2;
          return (
            <g key={i} style={{ opacity: active == null ? (e.main ? 0.55 : 0.32) : on ? 1 : 0.08, transition: 'opacity 220ms ease' }}>
              <line x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                stroke={on ? 'var(--accent)' : 'var(--tx2)'}
                strokeWidth={e.main ? 3 : 1.75}
                strokeDasharray={e.dash ? '5 5' : undefined} strokeLinecap="round" />
              {on && (
                <text x={mx} y={my - 5} textAnchor="middle" fontSize={12} fontFamily={MONO}
                  fill="var(--accent)" style={{ paintOrder: 'stroke' }} stroke="var(--sf2)" strokeWidth={4}>
                  {de ? e.labelDe : e.labelEn}
                </text>
              )}
            </g>
          );
        })}
        {/* nodes */}
        {COMPONENTS.map(c => (
          <GraphNode key={c.node} c={c} de={de} active={active === c.node} dim={dimNode(c.node)}
            onActivate={setActive} onSelect={onSelect} />
        ))}
      </svg>

      {/* Info panel (mobile-friendly, below the diagram) */}
      <div className="mt-2 rounded-xl px-4 py-3 min-h-[64px] flex items-center"
        style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
        {activeComp ? (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-wx-tx1 text-[15px]">{de ? activeComp.nameDe : activeComp.nameEn}</span>
              <span className="num-data text-[12px]" style={{ color: 'var(--accent-soft)' }}>{activeComp.metric}</span>
            </div>
            <p className="text-[12.5px] leading-snug mt-1 text-wx-txm">{de ? activeComp.whyDe : activeComp.whyEn}</p>
          </div>
        ) : (
          <p className="text-[12.5px] text-wx-txf">
            {de ? 'Tippe eine Komponente, um ihre Beziehungen zu sehen.' : 'Tap a component to see how it connects.'}
          </p>
        )}
      </div>
    </div>
  );
}
