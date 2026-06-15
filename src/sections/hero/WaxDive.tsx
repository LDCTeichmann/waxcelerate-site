import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ChevronRight, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { diveFormula, type ScienceComponent } from '@/lib/science';

/**
 * WaxDive — the "look inside the wax" experience.
 *
 * Master/detail in the site's own visual language: LEFT a clean, interactive
 * "composition" column (each component a selectable stratum of the block);
 * RIGHT the selected component's card — role, metric, summary, its diagram and
 * the development insight, deep-linking to /wissenschaft#id.
 *
 * It follows the AMBIENT theme (light in light mode, dark in noir) by using the
 * design tokens, and renders through a portal to <body> so the hero's
 * white-heading rule doesn't leak in. Classic and Pro list only what each
 * variant genuinely contains.
 */

// Relative height of each stratum — the paraffin base reads as the foundation,
// the solid lubricant as the functional heart; the rest are thinner films.
function weightOf(c: ScienceComponent): number {
  if (c.id === 'kristallstruktur') return 1.7;       // Paraffin — base matrix
  if (c.id === 'mos2' || c.id === 'ptfe') return 1.45; // solid lubricant
  return 1;
}

export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const components = diveFormula(variant);
  const active = components.find(c => c.id === activeId) ?? components[0];

  // Reset selection whenever the variant changes so the card matches the column.
  useEffect(() => { setActiveId(null); }, [variant]);

  // Body scroll lock + Escape + initial focus.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Strata settle in on open / variant switch; the hint arrow nudges to invite a tap.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const stack = stackRef.current;
    if (!stack) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-layer]', { x: -18, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 });
      gsap.to('[data-nudge]', { x: 4, repeat: -1, yoyo: true, duration: 0.8, ease: 'sine.inOut' });
    }, stack);
    return () => ctx.revert();
  }, [open, variant]);

  // Detail cross-fades when the selection changes.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const el = detailRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, [active.id, open]);

  if (!open) return null;

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
            <p className="eyebrow" style={{ color: 'var(--accent)' }}>
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
              className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-colors btn-ghost"
              style={{ border: '1px solid var(--bd)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-5 sm:gap-7 p-5 sm:p-7">

          {/* LEFT — interactive composition column */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow" style={{ color: 'var(--txf)' }}>
                {de ? `Zusammensetzung · ${components.length} Komponenten` : `Composition · ${components.length} components`}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
                {de ? 'Tippe eine Komponente' : 'Tap a component'}
                <ArrowRight data-nudge className="h-3.5 w-3.5" />
              </span>
            </div>

            <div
              ref={stackRef}
              className="flex flex-col flex-1 rounded-xl overflow-hidden"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', minHeight: 360 }}
            >
              {components.map((c, i) => {
                const sel = active.id === c.id;
                return (
                  <button
                    key={c.id}
                    data-layer
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    aria-pressed={sel}
                    className="group relative flex items-center gap-3 text-left px-4 sm:px-5 transition-colors duration-200"
                    style={{
                      flex: weightOf(c),
                      minHeight: 58,
                      background: sel ? 'rgba(var(--accent-rgb),0.10)' : 'transparent',
                      borderTop: i === 0 ? 'none' : '1px solid var(--bd)',
                    }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.045)'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* selection bar — pulses gently so "where am I" is obvious */}
                    <span
                      className="absolute left-0 top-0 h-full transition-all duration-200"
                      style={{ width: sel ? 4 : 0, background: 'var(--accent)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-display font-semibold text-[15px] truncate"
                          style={{ color: sel ? 'var(--accent)' : 'var(--tx1)' }}>
                          {de ? c.graphLabelDe : c.graphLabelEn}
                        </span>
                        <span className="num-data text-[12px] flex-shrink-0" style={{ color: sel ? 'var(--accent)' : 'var(--txm)' }}>
                          {c.metric}
                        </span>
                      </div>
                      <span className="block text-[10px] uppercase tracking-[0.16em] mt-0.5" style={{ color: 'var(--txf)' }}>
                        {de ? c.roleDe : c.roleEn}
                      </span>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:translate-x-0.5"
                      style={{ color: sel ? 'var(--accent)' : 'var(--txff)' }}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] mt-3" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Aufeinander abgestimmt — die Reihenfolge ist Teil der Rezeptur, nicht nur die Zutaten.'
                : 'Tuned together — the order is part of the recipe, not just the ingredients.'}
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
