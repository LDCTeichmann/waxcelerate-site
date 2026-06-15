import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { diveFormula, EDGES, type ScienceComponent } from '@/lib/science';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/**
 * WaxDive — the "look inside the wax" experience.
 * Opening the hero block dives from the macro photo into the microstructure:
 * a lab-panel scene of the formula's components as interactive nodes. Tapping a
 * node surfaces an ingredient card (reused science data + diagram) that deep-links
 * to the matching chapter on /wissenschaft. A Classic⇄Pro toggle swaps the set.
 */
export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SVGSVGElement>(null);

  const components = diveFormula(variant);
  const active = components.find(c => c.id === activeId) ?? components[0];
  // Edges only make sense for the full Pro system (Classic has no relationship graph).
  const ids = new Set(components.map(c => c.node));
  const edges = variant === 'pro' ? EDGES.filter(e => ids.has(e.from) && ids.has(e.to)) : [];

  // Reset selection whenever the variant changes so the card matches the scene.
  useEffect(() => { setActiveId(null); }, [variant]);

  // Body scroll lock + Escape to close + initial focus.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Cinematic entrance: the scene scales in and nodes settle (skipped if reduced).
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const scene = sceneRef.current;
    if (!scene) return;
    const nodes = scene.querySelectorAll('[data-dive-node]');
    const ctx = gsap.context(() => {
      gsap.fromTo(scene, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo(nodes, { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.7)', stagger: 0.07, delay: 0.15,
          transformOrigin: 'center' });
    }, scene);
    return () => ctx.revert();
  }, [open, variant]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(5,6,8,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Blick ins Wachs' : 'Inside the wax'}
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto rounded-2xl outline-none"
        style={{ background: '#0E1626', border: '1px solid rgba(130,170,240,0.25)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 sm:px-7 py-4"
          style={{ background: 'rgba(14,22,38,0.92)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(150,185,245,0.78)' }}>
              {de ? 'Blick ins Wachs' : 'Inside the wax'}
            </p>
            <p className="font-display font-bold text-white text-[17px] leading-tight mt-0.5">
              {de ? 'Die Formel unter der Lupe' : 'The formula up close'}
            </p>
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
              className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body: microstructure scene + ingredient card */}
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4 sm:gap-6 p-5 sm:p-7">

          {/* Scene */}
          <div className="relative rounded-xl overflow-hidden" style={{ background: '#0B1220', border: '1px solid rgba(130,170,240,0.18)' }}>
            {/* dot grid backdrop */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, rgba(130,170,240,0.10) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }} />
            <svg ref={sceneRef} viewBox="0 0 640 430" className="relative w-full h-auto"
              role="group" aria-label={de ? 'Mikrostruktur der Formel' : 'Formula microstructure'}>
              {/* paraffin lamellae — the carrier matrix backdrop */}
              <g opacity={0.18}>
                {[60, 110, 160, 210, 260, 310, 360].map(y => (
                  <line key={y} x1={40} y1={y} x2={600} y2={y} stroke="rgba(150,185,245,0.6)" strokeWidth={1} />
                ))}
              </g>
              {/* relationship edges (Pro only) */}
              {edges.map((e, i) => {
                const a = components.find(c => c.node === e.from)!;
                const b = components.find(c => c.node === e.to)!;
                return (
                  <line key={i} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                    stroke="rgba(130,170,240,0.5)" strokeWidth={e.main ? 2.5 : 1.25}
                    strokeDasharray={e.dash ? '5 5' : undefined} strokeLinecap="round" />
                );
              })}
              {/* component nodes */}
              {components.map((c) => (
                <DiveNode key={c.node} c={c} de={de} active={active.id === c.id}
                  onSelect={() => setActiveId(c.id)} />
              ))}
            </svg>
            <p className="absolute bottom-2 inset-x-0 text-center text-[10px]" style={{ color: 'rgba(150,185,245,0.55)' }}>
              {de ? 'Tippe eine Komponente' : 'Tap a component'}
            </p>
          </div>

          {/* Ingredient card */}
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="font-display font-bold text-white text-[1.2rem] leading-tight">
                {de ? active.nameDe : active.nameEn}
              </h3>
              <span className="font-semibold text-[15px] tabular-nums" style={{ color: '#9CC2FF', fontFamily: MONO }}>
                {active.metric}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.16em] mt-1" style={{ color: 'rgba(150,185,245,0.6)' }}>
              {de ? active.roleDe : active.roleEn}
            </p>
            <p className="text-[14px] leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.82)' }}>
              {de ? active.sumDe : active.sumEn}
            </p>

            <div className="mt-4">
              <ComponentDiagram which={active.diagram} de={de} />
            </div>

            <p className="text-[13px] leading-relaxed italic mt-4 pl-3"
              style={{ borderLeft: '2px solid #9CC2FF', color: 'rgba(255,255,255,0.7)' }}>
              {de ? active.insightDe : active.insightEn}
            </p>

            <Link
              to={`/wissenschaft#${active.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 mt-5 text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#9CC2FF' }}
            >
              {de ? 'Die ganze Geschichte' : 'The full story'} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// One interactive node (wrapper component → no hooks in .map)
function DiveNode({ c, de, active, onSelect }: {
  c: ScienceComponent; de: boolean; active: boolean; onSelect: () => void;
}) {
  return (
    <g
      data-dive-node
      role="button"
      tabIndex={0}
      aria-label={de ? c.nameDe : c.nameEn}
      style={{ cursor: 'pointer', outline: 'none' }}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
    >
      {active && (
        <circle cx={c.cx} cy={c.cy} r={c.r + 8} fill="none" stroke="#9CC2FF" strokeWidth={1.5} opacity={0.5} />
      )}
      <circle cx={c.cx} cy={c.cy} r={c.r}
        fill="rgba(20,32,54,0.92)"
        stroke={active ? '#9CC2FF' : 'rgba(130,170,240,0.45)'}
        strokeWidth={active ? 2.5 : 1.5} />
      {/* enlarged transparent hit area for comfortable tapping */}
      <circle cx={c.cx} cy={c.cy} r={c.r + 12} fill="transparent" />
      <text x={c.cx} y={c.cy - 2} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff"
        style={{ pointerEvents: 'none' }}>
        {de ? c.graphLabelDe : c.graphLabelEn}
      </text>
      <text x={c.cx} y={c.cy + 14} textAnchor="middle" fontSize={11} fill="#9CC2FF" fontFamily={MONO}
        style={{ pointerEvents: 'none' }}>
        {c.metric}
      </text>
    </g>
  );
}
