import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { diveFormula, DIVE_GRAPH } from '@/lib/science';

/**
 * WaxDive — the "look inside the wax" experience, rebuilt as a calm editorial
 * spread instead of a force-graph.
 *
 * LEFT: the formula read as a recipe — a quiet, indexed list of components
 * (name · role · metric), each selectable, hairline-separated, no boxes.
 * RIGHT: the selected component up close — summary, the relationships it forms
 * (as plain arrowed lines, not pills), a designed micro-diagram, an insight, and
 * a deep-link to /wissenschaft#id. Themed via design tokens, portaled to <body>.
 */
export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const components = diveFormula(variant);
  const graph = DIVE_GRAPH[variant];
  const active = components.find(c => c.id === activeId) ?? components[0];

  const compById = (id: string) => components.find(c => c.id === id)!;
  const activeLinks = graph.links.filter(l => l.a === active.id || l.b === active.id);

  useEffect(() => { setActiveId(null); }, [variant]);

  // Scroll lock + Escape + focus.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Detail cross-fades on selection change.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const el = detailRef.current;
    if (!el) return;
    const tw = gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    return () => { tw.kill(); };
  }, [active.id, open]);

  if (!open) return null;

  const variantLine = variant === 'pro'
    ? (de ? 'Sechs Komponenten · MoS₂-Festschmierstoff' : 'Six components · MoS₂ solid lubricant')
    : (de ? 'Vier Komponenten · PTFE-Gleitzusatz' : 'Four components · PTFE glide additive');

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(10,10,12,0.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Blick ins Wachs' : 'Inside the wax'}
        tabIndex={-1}
        className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-2xl outline-none"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad), 0 40px 100px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 sm:px-8 py-5"
          style={{ background: 'var(--sf)', borderBottom: '1px solid var(--bd)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>{de ? 'Blick ins Wachs' : 'Inside the wax'}</p>
            <p className="font-display font-bold text-[19px] leading-tight mt-1" style={{ color: 'var(--tx1)' }}>
              {de ? 'Die Formel unter der Lupe' : 'The formula up close'}
            </p>
            <p className="text-[11.5px] mt-1" style={{ color: 'var(--txm)' }}>{variantLine}</p>
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

        <div className="grid lg:grid-cols-[0.82fr_1fr]">

          {/* LEFT — the recipe, read as an indexed list */}
          <div className="px-6 sm:px-8 py-7 lg:border-r" style={{ borderColor: 'var(--bd)' }}>
            <p className="eyebrow mb-1" style={{ color: 'var(--txf)' }}>
              {de ? 'Die Rezeptur' : 'The recipe'}
            </p>
            <ul>
              {components.map((c, i) => {
                const sel = c.id === active.id;
                return (
                  <li key={c.id} style={i > 0 ? { borderTop: '1px solid var(--bd2)' } : undefined}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      aria-current={sel}
                      className="group w-full flex items-baseline gap-4 py-3.5 text-left transition-colors"
                      style={{
                        boxShadow: sel ? 'inset 2px 0 0 var(--accent-soft)' : 'none',
                        background: sel ? 'rgba(var(--accent-rgb),0.05)' : 'transparent',
                        paddingLeft: sel ? '12px' : '4px',
                      }}
                    >
                      <span className="num-data text-[11px] pt-1 flex-shrink-0 w-5"
                        style={{ color: sel ? 'var(--accent-soft)' : 'var(--txff)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] font-semibold leading-tight"
                          style={{ color: sel ? 'var(--accent-strong)' : 'var(--tx1)' }}>
                          {de ? c.nameDe : c.nameEn}
                        </span>
                        <span className="block text-[11px] uppercase tracking-[0.14em] mt-1"
                          style={{ color: 'var(--txm)' }}>
                          {de ? c.roleDe : c.roleEn}
                        </span>
                      </span>
                      <span className="num-data text-[12.5px] flex-shrink-0 pt-0.5"
                        style={{ color: sel ? 'var(--accent-soft)' : 'var(--txf)' }}>
                        {c.metric}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT — the selected component up close */}
          <div ref={detailRef} className="px-6 sm:px-8 py-7 flex flex-col">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h3 className="font-display font-bold text-[1.5rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                {de ? active.nameDe : active.nameEn}
              </h3>
              <span className="num-data font-semibold text-[16px]" style={{ color: 'var(--accent-soft)' }}>
                {active.metric}
              </span>
            </div>
            <p className="eyebrow mt-2" style={{ color: 'var(--accent-soft)' }}>
              {de ? active.roleDe : active.roleEn}
            </p>
            <p className="text-[14.5px] leading-relaxed mt-4" style={{ color: 'var(--tx2)' }}>
              {de ? active.sumDe : active.sumEn}
            </p>

            {/* Verbindungen — plain arrowed lines, no pills */}
            {activeLinks.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow mb-2.5" style={{ color: 'var(--txf)' }}>{de ? 'Verbindungen' : 'Connections'}</p>
                <ul className="flex flex-col gap-2">
                  {activeLinks.map((l, i) => {
                    const other = compById(l.a === active.id ? l.b : l.a);
                    return (
                      <li key={i} className="flex items-baseline gap-2.5 text-[13.5px]">
                        <span className="font-medium" style={{ color: 'var(--accent-soft)' }}>
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

            {/* designed micro-diagram — on the surface, no box */}
            <div className="mt-7 max-w-[300px]">
              <ComponentDiagram which={active.diagram} de={de} bare />
            </div>

            <p className="text-[13px] leading-relaxed italic mt-7 pl-3.5"
              style={{ borderLeft: '2px solid var(--accent-soft)', color: 'var(--txm)' }}>
              {de ? active.insightDe : active.insightEn}
            </p>

            <Link
              to={`/wissenschaft#${active.id}`}
              onClick={onClose}
              className="group inline-flex items-center gap-1.5 mt-7 text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent-soft)' }}
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
