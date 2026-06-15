import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { diveFormula, diveEdges, DIVE_SLOTS, type ScienceComponent } from '@/lib/science';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/**
 * WaxDive — the "look inside the wax" experience.
 *
 * Opening the hero block dives from the macro photo into the formula: a dark
 * lab panel where the six components sit as an interactive relationship graph.
 * Both Classic and Pro fill the same six roles, so the scene reads as one tuned
 * system — not a three-ingredient mix. Selecting a node surfaces its card
 * (reused science copy + diagram) and deep-links to /wissenschaft#id.
 *
 * The whole overlay is a self-contained `noir` surface: every colour comes from
 * the site's design tokens (--card-bg, --accent, --brand-blue, --tx*), so it
 * matches the rest of the site in light AND dark mode — including the embedded
 * ComponentDiagram, which previously inherited the page theme and clashed.
 */
export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SVGSVGElement>(null);

  const components = diveFormula(variant);
  const active = components.find(c => c.id === activeId) ?? components[0];
  const activeSlot = components.findIndex(c => c.id === active.id);
  const edges = diveEdges(variant);

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

  // Cinematic entrance: panel rises, edges draw in, nodes settle (skipped if reduced).
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const scene = sceneRef.current;
    if (!scene) return;
    const nodes = scene.querySelectorAll('[data-dive-node]');
    const lines = scene.querySelectorAll<SVGLineElement>('[data-edge]');
    const ctx = gsap.context(() => {
      gsap.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      // Solid edges draw themselves in; dashed (secondary) edges keep their
      // pattern and just fade up, so the relationship reads stay intact.
      lines.forEach((ln) => {
        if (ln.dataset.dash === '1') {
          gsap.fromTo(ln, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.3 });
        } else {
          const len = ln.getTotalLength?.() ?? 320;
          gsap.fromTo(ln,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', delay: 0.15 });
        }
      });
      gsap.fromTo(nodes, { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.06, delay: 0.25,
          transformOrigin: 'center' });
    }, scene);
    return () => ctx.revert();
  }, [open, variant]);

  if (!open) return null;

  return (
    <div
      className="noir fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(6,6,8,0.74)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Blick ins Wachs' : 'Inside the wax'}
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto rounded-2xl outline-none"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad), 0 40px 100px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 sm:px-7 py-4"
          style={{ background: 'rgba(17,17,19,0.86)', borderBottom: '1px solid var(--bd)', backdropFilter: 'blur(10px)' }}>
          <div>
            <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.28em', color: 'var(--accent-soft)' }}>
              {de ? 'Blick ins Wachs' : 'Inside the wax'}
            </p>
            <p className="font-display font-bold text-[17px] leading-tight mt-0.5" style={{ color: 'var(--tx1)' }}>
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
              style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)', color: 'var(--tx1)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body: relationship scene + ingredient card */}
        <div className="grid lg:grid-cols-[1.12fr_1fr] gap-4 sm:gap-6 p-5 sm:p-7">

          {/* Scene */}
          <div className="relative rounded-xl overflow-hidden" style={{ background: 'var(--sf3)', border: '1px solid var(--bd)' }}>
            {/* dot grid backdrop */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, rgba(var(--accent-rgb),0.14) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            <svg ref={sceneRef} viewBox="0 0 640 430" className="relative w-full h-auto"
              role="group" aria-label={de ? 'Komponenten der Formel' : 'Formula components'}>
              <defs>
                <linearGradient id="diveNode" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--card-from)" />
                  <stop offset="1" stopColor="var(--card-to)" />
                </linearGradient>
                <filter id="diveGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>

              {/* paraffin lamellae — the carrier matrix backdrop, very faint */}
              <g opacity={0.5}>
                {[70, 120, 170, 220, 270, 320, 370].map(y => (
                  <line key={y} x1={44} y1={y} x2={596} y2={y} stroke="rgba(var(--accent-rgb),0.10)" strokeWidth={1} />
                ))}
              </g>

              {/* relationship edges — slot-indexed, with a connection label that
                  brightens when it touches the selected node */}
              {edges.map((e, i) => {
                const A = DIVE_SLOTS[e.a], B = DIVE_SLOTS[e.b];
                const touches = e.a === activeSlot || e.b === activeSlot;
                const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
                return (
                  <g key={i}>
                    <line data-edge data-dash={e.dash ? '1' : undefined}
                      x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                      stroke={touches ? 'var(--brand-blue)' : 'rgba(var(--accent-rgb),0.55)'}
                      strokeWidth={e.main ? 2.4 : 1.4}
                      strokeDasharray={e.dash ? '5 6' : undefined}
                      strokeLinecap="round"
                      style={{ transition: 'stroke 0.3s ease' }} />
                    <text x={mx} y={my - 5} textAnchor="middle" fontSize={9.5} fontFamily={MONO}
                      fill={touches ? 'var(--accent-soft)' : 'var(--txf)'}
                      opacity={touches ? 1 : 0.55}
                      style={{ transition: 'fill 0.3s ease, opacity 0.3s ease', pointerEvents: 'none' }}>
                      {de ? e.labelDe : e.labelEn}
                    </text>
                  </g>
                );
              })}

              {/* component nodes — positioned by slot, not editorial geometry */}
              {components.map((c, i) => (
                <DiveNode key={c.id} c={c} slot={DIVE_SLOTS[i]} de={de} active={active.id === c.id}
                  onSelect={() => setActiveId(c.id)} />
              ))}
            </svg>
            <p className="absolute bottom-2.5 inset-x-0 text-center text-[10px]" style={{ color: 'var(--txm)' }}>
              {de ? 'Sechs Komponenten, ein abgestimmtes System — kein bloßes Mischen.'
                  : 'Six components, one tuned system — not just a blend.'}
            </p>
          </div>

          {/* Ingredient card */}
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="font-display font-bold text-[1.2rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                {de ? active.nameDe : active.nameEn}
              </h3>
              <span className="font-semibold text-[15px] tabular-nums" style={{ color: 'var(--accent-soft)', fontFamily: MONO }}>
                {active.metric}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.16em] mt-1" style={{ color: 'var(--accent)' }}>
              {de ? active.roleDe : active.roleEn}
            </p>
            <p className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--tx2)' }}>
              {de ? active.sumDe : active.sumEn}
            </p>

            <div className="mt-4">
              <ComponentDiagram which={active.diagram} de={de} />
            </div>

            <p className="text-[13px] leading-relaxed italic mt-4 pl-3"
              style={{ borderLeft: '2px solid var(--accent)', color: 'var(--txm)' }}>
              {de ? active.insightDe : active.insightEn}
            </p>

            <Link
              to={`/wissenschaft#${active.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 mt-5 text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--brand-blue)' }}
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
function DiveNode({ c, slot, de, active, onSelect }: {
  c: ScienceComponent; slot: { x: number; y: number; r: number }; de: boolean; active: boolean; onSelect: () => void;
}) {
  const { x, y, r } = slot;
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
      {/* soft glow + selection ring when active */}
      {active && (
        <>
          <circle cx={x} cy={y} r={r} fill="var(--brand-blue)" opacity={0.18} filter="url(#diveGlow)" />
          <circle cx={x} cy={y} r={r + 7} fill="none" stroke="var(--brand-blue)" strokeWidth={1.5} opacity={0.55} />
        </>
      )}
      <circle cx={x} cy={y} r={r}
        fill="url(#diveNode)"
        stroke={active ? 'var(--brand-blue)' : 'rgba(var(--accent-rgb),0.5)'}
        strokeWidth={active ? 2.5 : 1.5} />
      {/* enlarged transparent hit area for comfortable tapping */}
      <circle cx={x} cy={y} r={r + 12} fill="transparent" />
      <text x={x} y={y - 2} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--tx1)"
        style={{ pointerEvents: 'none' }}>
        {de ? c.graphLabelDe : c.graphLabelEn}
      </text>
      <text x={x} y={y + 14} textAnchor="middle" fontSize={11} fill="var(--accent-soft)" fontFamily={MONO}
        style={{ pointerEvents: 'none' }}>
        {c.metric}
      </text>
    </g>
  );
}
