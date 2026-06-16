import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle, InstrumentFrame } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { curvedEdge, NodeCircle, EdgeLabel, LegendSwatch, type NodeState } from '@/sections/science/graphPrimitives';
import { diveFormula, DIVE_GRAPH, type ScienceComponent, type DiveNodePos } from '@/lib/science';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const VB_W = 460, VB_H = 430;
const radOf = (big?: boolean) => (big ? 44 : 33);

/**
 * WaxDive — the "look inside the wax" experience.
 *
 * LEFT: a real relationship map. Paraffin is the matrix hub, the solid lubricant
 * the second hub; every link carries the genuine relationship (Trägermatrix,
 * Ko-Kristallisation, Einbettung, …). Hovering/selecting a node lights up ITS
 * connections with labels and dims the rest — so it reads which ingredients
 * relate and how. RIGHT: the selected component's card incl. a "Verbindungen"
 * list, deep-linking to /wissenschaft#id.
 *
 * Themed with design tokens (light in light mode) and portaled to <body>.
 */
export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const components = diveFormula(variant);
  const graph = DIVE_GRAPH[variant];
  const active = components.find(c => c.id === activeId) ?? components[0];
  const focusId = hoverId ?? active.id;

  const compById = (id: string) => components.find(c => c.id === id)!;
  const posById = (id: string) => graph.nodes.find(n => n.id === id)!;

  // Links touching the focus node → its neighbours light up, the rest dim.
  const incident = (id: string) => graph.links.filter(l => l.a === id || l.b === id);
  const neighbours = new Set(incident(focusId).flatMap(l => [l.a, l.b]).filter(id => id !== focusId));
  const nodeState = (id: string): 'active' | 'near' | 'dim' =>
    id === focusId ? 'active' : neighbours.has(id) ? 'near' : 'dim';
  const activePos = posById(active.id);
  const activeLinks = incident(active.id);

  // Pre-computed edge geometry (curved path + on-curve midpoint for the label pill).
  const edgeGeo = graph.links.map((l) => {
    const A = posById(l.a), B = posById(l.b);
    const { d, mid } = curvedEdge(A.x, A.y, B.x, B.y);
    return { l, d, mid, on: l.a === focusId || l.b === focusId };
  });

  useEffect(() => { setActiveId(null); setHoverId(null); }, [variant]);

  // Scroll lock + Escape + focus.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Links draw in (solid) / fade in (dashed); the hint arrow nudges.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const svg = svgRef.current;
    if (!svg) return;
    const ctx = gsap.context(() => {
      svg.querySelectorAll<SVGLineElement>('[data-link]').forEach((ln) => {
        if (ln.dataset.dash === '1') {
          gsap.fromTo(ln, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.25 });
        } else {
          const len = ln.getTotalLength?.() ?? 240;
          gsap.fromTo(ln, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.out', delay: 0.1 });
        }
      });
      gsap.to('[data-nudge]', { x: 4, repeat: -1, yoyo: true, duration: 0.8, ease: 'sine.inOut' });
    }, svg);
    return () => ctx.revert();
  }, [open, variant]);

  // Selection ring pulses around the committed (selected) node.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const ring = svgRef.current?.querySelector('[data-pulse]') as SVGCircleElement | null;
    if (!ring) return;
    const cx = ring.getAttribute('cx'); const cy = ring.getAttribute('cy');
    const tw = gsap.fromTo(ring, { scale: 1, opacity: 0.5 }, { scale: 1.4, opacity: 0, duration: 1.5, ease: 'power1.out', repeat: -1, svgOrigin: `${cx} ${cy}` });
    return () => { tw.kill(); gsap.set(ring, { opacity: 0 }); };
  }, [active.id, open, variant]);

  // Detail cross-fades on selection change.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const el = detailRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, [active.id, open]);

  if (!open) return null;

  const variantLine = variant === 'pro'
    ? (de ? 'Sechs Komponenten · MoS₂-Festschmierstoff' : 'Six components · MoS₂ solid lubricant')
    : (de ? 'Vier Komponenten · PTFE-Gleitzusatz' : 'Four components · PTFE glide additive');

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(10,10,12,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Blick ins Wachs' : 'Inside the wax'}
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto rounded-2xl outline-none"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad), 0 40px 100px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 sm:px-7 py-4"
          style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--bd)', backdropFilter: 'blur(10px)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent)' }}>{de ? 'Blick ins Wachs' : 'Inside the wax'}</p>
            <p className="font-display font-bold text-[17px] leading-tight mt-0.5" style={{ color: 'var(--tx1)' }}>
              {de ? 'Die Formel unter der Lupe' : 'The formula up close'}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--txm)' }}>{variantLine}</p>
          </div>
          <div className="flex items-center gap-3">
            <SegmentedToggle
              ariaLabel={de ? 'Formel' : 'Formula'}
              value={variant}
              onChange={setVariant}
              className="w-[150px]"
              options={[{ value: 'classic', label: 'Classic' }, { value: 'pro', label: 'Pro' }]}
            />
            <button
              onClick={onClose}
              aria-label={de ? 'Schließen' : 'Close'}
              className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 btn-ghost"
              style={{ border: '1px solid var(--bd)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-5 sm:gap-7 p-5 sm:p-7">

          {/* LEFT — relationship map */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="eyebrow" style={{ color: 'var(--txf)' }}>
                {de ? 'Beziehungen' : 'Relationships'}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
                {de ? 'Knoten erkunden' : 'Explore the nodes'}
                <ArrowRight data-nudge className="h-3.5 w-3.5" />
              </span>
            </div>

            <InstrumentFrame
              noReveal
              footer={
                <div className="flex items-center gap-4 text-[10.5px]" style={{ color: 'var(--txm)' }}>
                  <span className="inline-flex items-center gap-1.5"><LegendSwatch /> {de ? 'Aufbau' : 'structure'}</span>
                  <span className="inline-flex items-center gap-1.5"><LegendSwatch dashed /> {de ? 'Schutz' : 'surface'}</span>
                </div>
              }
            >
              <div className="relative">
                <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto"
                  role="group" aria-label={de ? 'Beziehungsgraph der Formel' : 'Formula relationship graph'}>
                  {/* curved links */}
                  {edgeGeo.map(({ l, d, on }, i) => (
                    <path key={`l-${i}`} data-link data-dash={l.dash ? '1' : undefined}
                      d={d} fill="none"
                      stroke={on ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.16)'}
                      strokeWidth={on ? (l.main ? 2.6 : 2) : 1.2}
                      strokeDasharray={l.dash ? '5 6' : undefined}
                      strokeLinecap="round"
                      style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
                  ))}

                  {/* pulse ring around the selected node */}
                  <circle data-pulse cx={activePos.x} cy={activePos.y} r={radOf(activePos.big) + 6}
                    fill="none" stroke="var(--accent)" strokeWidth={1.5} opacity={0} />

                  {/* nodes */}
                  {graph.nodes.map((n, i) => (
                    <DiveNode key={n.id} comp={compById(n.id)} pos={n} index={i} de={de}
                      state={nodeState(n.id)}
                      onSelect={() => setActiveId(n.id)}
                      onHover={setHoverId} />
                  ))}
                </svg>

                {/* relationship labels — pills over the focus node's links */}
                <div className="absolute inset-0 pointer-events-none">
                  {edgeGeo.map(({ l, mid, on }, i) => (
                    <EdgeLabel key={`p-${i}`} x={mid.x} y={mid.y} vbW={VB_W} vbH={VB_H} on={on}>
                      {de ? l.labelDe : l.labelEn}
                    </EdgeLabel>
                  ))}
                </div>
              </div>
            </InstrumentFrame>

            <p className="text-[11px] mt-3" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Paraffin ist die Matrix, der Festschmierstoff das Herz — die Verbindungen dazwischen sind die eigentliche Rezeptur.'
                : 'Paraffin is the matrix, the solid lubricant the heart — the links between them are the real recipe.'}
            </p>
          </div>

          {/* RIGHT — selected component detail */}
          <div ref={detailRef} className="flex flex-col">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="font-display font-bold text-[1.25rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                {de ? active.nameDe : active.nameEn}
              </h3>
              <span className="num-data font-semibold text-[15px]" style={{ color: 'var(--accent)' }}>
                {active.metric}
              </span>
            </div>
            <p className="eyebrow mt-1.5" style={{ color: 'var(--accent)' }}>
              {de ? active.roleDe : active.roleEn}
            </p>
            <p className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--tx2)' }}>
              {de ? active.sumDe : active.sumEn}
            </p>

            {/* Verbindungen — what this component connects to, and how */}
            {activeLinks.length > 0 && (
              <div className="mt-4">
                <p className="eyebrow mb-2" style={{ color: 'var(--txf)' }}>{de ? 'Verbindungen' : 'Connections'}</p>
                <ul className="flex flex-col gap-1.5">
                  {activeLinks.map((l, i) => {
                    const other = compById(l.a === active.id ? l.b : l.a);
                    return (
                      <li key={i} className="flex items-center gap-2 text-[12.5px]">
                        <span className="inline-block rounded-full px-2 py-[2px] text-[10.5px] font-medium leading-none"
                          style={{ background: 'rgba(var(--accent-rgb),0.10)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb),0.18)' }}>
                          {de ? l.labelDe : l.labelEn}
                        </span>
                        <span style={{ color: 'var(--txff)' }}>→</span>
                        <span style={{ color: 'var(--tx2)' }}>{de ? other.graphLabelDe : other.graphLabelEn}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* compact diagram */}
            <div className="mt-4 max-w-[280px]">
              <ComponentDiagram which={active.diagram} de={de} />
            </div>

            <p className="text-[13px] leading-relaxed italic mt-4 pl-3"
              style={{ borderLeft: '2px solid var(--accent)', color: 'var(--txm)' }}>
              {de ? active.insightDe : active.insightEn}
            </p>

            <Link
              to={`/wissenschaft#${active.id}`}
              onClick={onClose}
              className="group inline-flex items-center gap-1.5 mt-5 text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              {de ? 'Die ganze Geschichte' : 'The full story'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// One node (wrapper component → no hooks in .map). Pops in on mount, lifts on
// hover (which also previews its relationships), flips to accent when focused.
function DiveNode({ comp, pos, state, index, de, onSelect, onHover }: {
  comp: ScienceComponent; pos: DiveNodePos; state: NodeState;
  index: number; de: boolean; onSelect: () => void; onHover: (id: string | null) => void;
}) {
  const gref = useRef<SVGGElement>(null);
  const r = radOf(pos.big);
  const { x, y } = pos;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const g = gref.current;
    if (!g) return;
    const t = gsap.from(g, { opacity: 0, scale: 0.4, duration: 0.5, ease: 'back.out(1.7)', delay: 0.2 + index * 0.06, svgOrigin: `${x} ${y}` });
    return () => { t.kill(); };
  }, []); // mount only

  const lift = (s: number, d: number) => {
    if (!prefersReducedMotion()) gsap.to(gref.current, { scale: s, duration: d, svgOrigin: `${x} ${y}`, overwrite: 'auto' });
  };

  const active = state === 'active';
  const dim = state === 'dim';

  return (
    <g
      ref={gref}
      data-dive-node
      role="button"
      tabIndex={0}
      aria-label={de ? comp.nameDe : comp.nameEn}
      style={{ cursor: 'pointer', outline: 'none', opacity: dim ? 0.5 : 1, transition: 'opacity 0.3s' }}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      onMouseEnter={() => { onHover(comp.id); lift(1.07, 0.2); }}
      onMouseLeave={() => { onHover(null); lift(1, 0.3); }}
      onFocus={() => onHover(comp.id)}
      onBlur={() => onHover(null)}
    >
      <NodeCircle x={x} y={y} r={r} big={pos.big} state={state} />
      <text x={x} y={pos.big ? y - 4 : y - 2} textAnchor="middle" fontSize={pos.big ? 13 : 10}
        fontWeight={600} fill={active ? '#fff' : 'var(--tx1)'} style={{ pointerEvents: 'none' }}>
        {de ? comp.graphLabelDe : comp.graphLabelEn}
      </text>
      <text x={x} y={pos.big ? y + 13 : y + 11} textAnchor="middle" fontSize={pos.big ? 10 : 8.5} fontFamily={MONO}
        fill={active ? 'rgba(255,255,255,0.85)' : 'var(--txm)'} style={{ pointerEvents: 'none' }}>
        {comp.metric}
      </text>
    </g>
  );
}
