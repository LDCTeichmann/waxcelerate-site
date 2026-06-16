import { useEffect, useRef, useState } from 'react';
import { COMPONENTS, EDGES, type ScienceComponent } from '@/lib/science';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { curvedEdge, NodeCircle, EdgeLabel, type NodeState } from '@/sections/science/graphPrimitives';

const VB_W = 640, VB_H = 430;
const byNode = (n: number) => COMPONENTS.find(c => c.node === n)!;

// One interactive node (no hooks → safe to render inside .map via this wrapper)
function GraphNode({ c, de, dim, state, onActivate, onSelect }: {
  c: ScienceComponent; de: boolean; dim: boolean; state: NodeState;
  onActivate: (n: number | null) => void; onSelect: (id: string) => void;
}) {
  return (
    <g
      data-node
      role="button" tabIndex={0}
      aria-label={de ? c.nameDe : c.nameEn}
      style={{ cursor: 'pointer', opacity: dim ? 0.16 : 1, transition: 'opacity 220ms ease',
        outline: 'none', transformBox: 'fill-box', transformOrigin: 'center' }}
      onMouseEnter={() => onActivate(c.node)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(c.node)}
      onBlur={() => onActivate(null)}
      onClick={() => onSelect(c.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c.id); } }}
    >
      <NodeCircle x={c.cx} y={c.cy} r={c.r} big={c.node === 4} state={state} />
      {/* enlarged transparent hit area for comfortable mobile tapping */}
      <circle cx={c.cx} cy={c.cy} r={c.r + 10} fill="transparent" />
    </g>
  );
}

export function FormulaGraph({ de, onSelect }: { de: boolean; onSelect: (id: string) => void }) {
  const [active, setActive] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const userRef = useRef(false);      // true while the user is driving the highlight
  const resumeRef = useRef<number | undefined>(undefined);

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
  const nodeStateOf = (n: number): NodeState =>
    active === n ? 'active' : (active != null && connected.has(n)) ? 'near' : 'dim';

  // Curved edge geometry + on-curve midpoints for the relationship label pills.
  const edgeGeo = EDGES.map((e) => {
    const a = byNode(e.from), b = byNode(e.to);
    const { d, mid } = curvedEdge(a.cx, a.cy, b.cx, b.cy);
    return { e, d, mid, on: edgeActive(e) };
  });

  // Assemble-on-scroll animation + auto-cycle that walks the relationships.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return; // static: React renders everything visible

    const nodes = root.querySelectorAll('[data-node]');
    const edges = root.querySelector('[data-edges]');
    const labels = root.querySelector('[data-labels]');
    const order = [4, 1, 2, 3, 5, 6];   // MoS₂ first, then outward
    let idx = 0;
    let cycle: number | undefined;

    const startCycle = () => {
      cycle = window.setInterval(() => {
        if (userRef.current) return;
        setActive(order[idx % order.length]);
        idx++;
      }, 2200);
    };

    const ctx = gsap.context(() => {
      gsap.set(nodes, { opacity: 0, scale: 0.4 });
      gsap.set([edges, labels], { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 80%', once: true }, onComplete: startCycle })
        .to(nodes, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: { each: 0.08, from: 3 } })
        .to(edges, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .to(labels, { opacity: 1, duration: 0.4 }, '<');
    }, root);

    return () => { ctx.revert(); if (cycle) clearInterval(cycle); clearTimeout(resumeRef.current); };
  }, []);

  // User interaction pauses the auto-cycle; it resumes shortly after they let go.
  const onActivate = (n: number | null) => {
    clearTimeout(resumeRef.current);
    if (n != null) { userRef.current = true; setActive(n); }
    else { resumeRef.current = window.setTimeout(() => { userRef.current = false; }, 800); setActive(null); }
  };
  const onPick = (id: string) => {
    clearTimeout(resumeRef.current);
    resumeRef.current = window.setTimeout(() => { userRef.current = false; }, 4000);
    onSelect(id);
  };

  return (
    <div ref={rootRef}>
      <div className="relative">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ overflow: 'visible' }}
          role="group" aria-label={de ? 'Komponenten-Beziehungen' : 'Component relationships'}>
          {/* curved edges */}
          <g data-edges>
            {edgeGeo.map(({ e, d, on }, i) => (
              <path key={i} d={d} fill="none"
                stroke={on ? 'var(--accent)' : 'var(--tx2)'}
                strokeWidth={e.main ? 3 : 1.75}
                strokeDasharray={e.dash ? '5 5' : undefined} strokeLinecap="round"
                style={{ opacity: active == null ? (e.main ? 0.55 : 0.32) : on ? 1 : 0.08, transition: 'opacity 220ms ease, stroke 220ms ease' }} />
            ))}
          </g>
          {/* nodes (geometry + interaction) */}
          {COMPONENTS.map(c => (
            <GraphNode key={c.node} c={c} de={de} state={nodeStateOf(c.node)} dim={dimNode(c.node)}
              onActivate={onActivate} onSelect={onPick} />
          ))}
        </svg>

        {/* Node labels + relationship pills — HTML overlay so text stays legible at any width */}
        <div data-labels className="absolute inset-0 pointer-events-none">
          {COMPONENTS.map(c => (
            <div key={c.node}
              className="absolute text-center leading-tight"
              style={{
                left: `${(c.cx / VB_W) * 100}%`, top: `${(c.cy / VB_H) * 100}%`,
                transform: 'translate(-50%, -50%)',
                opacity: dimNode(c.node) ? 0.16 : 1, transition: 'opacity 220ms ease',
              }}>
              <span className={`block font-semibold ${c.node === 4 ? 'text-[14px]' : 'text-[12px]'}`}
                style={{ color: 'var(--tx1)' }}>
                {de ? c.graphLabelDe : c.graphLabelEn}
              </span>
              <span className="block num-data text-[11px]" style={{ color: 'var(--accent-soft)' }}>
                {c.metric}
              </span>
            </div>
          ))}
          {edgeGeo.map(({ e, mid, on }, i) => (
            <EdgeLabel key={`e-${i}`} x={mid.x} y={mid.y} vbW={VB_W} vbH={VB_H} on={on}>
              {de ? e.labelDe : e.labelEn}
            </EdgeLabel>
          ))}
        </div>
      </div>

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
