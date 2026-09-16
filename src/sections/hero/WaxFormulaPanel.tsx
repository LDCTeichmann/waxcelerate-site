import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { diveFormula, COMPONENTS } from '@/lib/science';
import { getProductById, canCheckout } from '@/lib/data';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick } from '@/lib/analytics';

/**
 * "Was drin ist" — die Rezeptur, zweiter Reiter des Hero-Dialogs.
 *
 * Das war bis 09/2026 der gesamte Inhalt des Wachs-Klicks ("Die Formel unter
 * der Lupe"). Der Inhalt ist unveraendert gut, beantwortet aber nicht die
 * Frage, mit der jemand vor einer Kaufentscheidung steht — deshalb liegt er
 * jetzt neben dem Urteil (WaxVerdict) statt davor. Wer die Chemie sehen will,
 * kommt in einem Klick hin; wer entscheiden will, wird nicht mehr damit
 * aufgehalten.
 *
 * LINKS: die Formel als nummerierte Rezeptliste (Name, Rolle, Kennwert).
 * RECHTS: die gewaehlte Komponente — Name, Zusammenfassung, Mikro-Diagramm.
 *         Feste Hoehen, damit beim Wechsel nichts springt.
 * UNTEN:  Conversion-Fuss mit dem zur Variante passenden Produkt.
 *
 * Mobil wird die Rezeptliste zu einer waagerechten Pillenleiste.
 */
export function WaxFormulaPanel({ de, onClose }: { de: boolean; onClose: () => void }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  const components = diveFormula(variant);
  // Default to the variant's headline lubricant (the actual differentiator),
  // not components[0] (Paraffin, the base matrix every wax needs) — most
  // people who open this modal never click past the first thing they see.
  const defaultId = variant === 'pro' ? 'mos2' : 'ptfe';
  const active = components.find(c => c.id === activeId)
    ?? components.find(c => c.id === defaultId)
    ?? components[0];

  const product = getProductById(variant === 'pro' ? 'wax-500-mos2' : 'wax-500')!;

  useEffect(() => { setActiveId(null); }, [variant]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const els = [summaryRef.current, diagramRef.current].filter(Boolean);
    if (!els.length) return;
    const tl = gsap.timeline();
    tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.06 });
    return () => { tl.kill(); };
  }, [active.id]);

  const variantLine = variant === 'pro'
    ? (de ? 'Sechs Komponenten · MoS₂-Festschmierstoff' : 'Six components · MoS₂ solid lubricant')
    : (de ? 'Vier Komponenten · PTFE-Gleitzusatz' : 'Four components · PTFE glide additive');

  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Variantenwahl. Sass frueher im Dialogkopf — dort gehoert sie nicht
            hin, seit der Kopf zwei Reiter traegt: Classic/Pro betrifft nur
            diesen hier. */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-8 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--bd)' }}>
          <p className="text-[11.5px] min-w-0 truncate" style={{ color: 'var(--txm)' }}>{variantLine}</p>
          <SegmentedToggle
            ariaLabel={de ? 'Formel' : 'Formula'}
            value={variant}
            onChange={setVariant}
            className="w-[150px] flex-shrink-0"
            options={[{ value: 'classic', label: 'Classic' }, { value: 'pro', label: 'Pro' }]}
          />
        </div>

        {/* Mobile ingredient strip */}
        <div className="lg:hidden px-4 py-3 overflow-x-auto flex gap-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', borderBottom: '1px solid var(--bd)' }}>
          {components.map((c) => {
            const sel = c.id === active.id;
            return (
              <button key={c.id}
                onClick={() => setActiveId(c.id)}
                className="snap-start flex-shrink-0 px-3 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-colors"
                style={{
                  background: sel ? 'var(--accent-wash)' : 'transparent',
                  border: sel ? '1px solid rgba(var(--accent-rgb),0.30)' : '1px solid var(--bd2)',
                  color: sel ? 'var(--accent-soft)' : 'var(--txm)',
                }}>
                {de ? c.nameDe : c.nameEn}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[0.82fr_1fr]">

          {/* LEFT — recipe list (desktop only) */}
          <div className="hidden lg:block px-6 sm:px-8 py-7 lg:border-r min-w-0" style={{ borderColor: 'var(--bd)' }}>
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
                        background: sel ? 'var(--accent-wash-sm)' : 'transparent',
                        paddingLeft: sel ? '12px' : '4px',
                      }}
                    >
                      <span className="num text-meta pt-1 flex-shrink-0 w-5"
                        style={{ color: sel ? 'var(--accent-soft)' : 'var(--txff)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] font-semibold leading-tight"
                          style={{ color: sel ? 'var(--accent-strong)' : 'var(--tx1)' }}>
                          {de ? c.nameDe : c.nameEn}
                        </span>
                        <span className="block text-small uppercase tracking-[0.14em] mt-1"
                          style={{ color: 'var(--txm)' }}>
                          {de ? c.roleDe : c.roleEn}
                        </span>
                      </span>
                      <span className="num text-[12.5px] flex-shrink-0 pt-0.5"
                        style={{ color: sel ? 'var(--accent-soft)' : 'var(--txf)' }}>
                        {c.metric}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT — detail panel with fixed-height sections */}
          <div className="px-5 sm:px-8 py-6 lg:py-7 flex flex-col min-w-0 min-h-[320px] lg:min-h-[420px]">

            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h3 className="font-display font-bold text-[1.35rem] lg:text-[1.5rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                {de ? active.nameDe : active.nameEn}
              </h3>
              <span className="num font-semibold text-[16px]" style={{ color: 'var(--accent-soft)' }}>
                {active.metric}
              </span>
            </div>
            <p className="eyebrow mt-1.5" style={{ color: 'var(--accent-soft)' }}>
              {de ? active.roleDe : active.roleEn}
            </p>

            {/* Why it matters (lead, plain-language) + the chemistry (secondary,
                muted) — same two-tier order SciencePage.tsx already uses for
                this exact data, just without the "Physik" tier the full page
                goes on to add. Fixed height, both clamped, to keep the
                no-layout-shift property between ingredients. */}
            <div ref={summaryRef}
              className="mt-4 min-h-[150px] max-h-[170px] lg:min-h-[170px] lg:max-h-[170px] overflow-hidden">
              <p className="text-[14px] lg:text-[14.5px] leading-relaxed"
                style={{
                  color: 'var(--tx2)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                {de ? active.whyDe : active.whyEn}
              </p>
              <p className="mt-2.5 text-[12.5px] leading-relaxed"
                style={{
                  color: 'var(--txm)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                {de ? active.sumDe : active.sumEn}
              </p>
            </div>

            <Link
              // /wissenschaft only ever renders COMPONENTS (the shared Pro
              // six) — Classic-only extras (ptfe, haftung) have no card/id
              // there at all, so a hash link to them would silently scroll
              // to nothing. Link to the exact ingredient where that target
              // genuinely exists, otherwise to the page itself.
              to={COMPONENTS.some(c => c.id === active.id) ? `/wissenschaft#${active.id}` : '/wissenschaft'}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 self-start text-[12.5px] font-semibold group"
              style={{ color: 'var(--accent-soft)' }}
            >
              {de ? 'Mehr zur Wissenschaft' : 'More science'}
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            {/* Diagram — fixed height container */}
            <div ref={diagramRef}
              className="mt-auto h-[140px] lg:h-[180px] flex items-center justify-center overflow-hidden">
              <div className="w-full max-w-[280px]">
                <ComponentDiagram which={active.diagram} de={de} bare />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conversion footer ── */}
      <div
        className="flex items-center gap-3 sm:gap-5 px-5 sm:px-8 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid var(--bd)', background: 'var(--sf)', borderRadius: '0 0 1rem 1rem' }}
      >
        <img
          src={product.image}
          alt={de ? product.title : product.titleEn}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover flex-shrink-0"
          style={{ border: '1px solid var(--bd2)' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] sm:text-[14px] font-semibold truncate" style={{ color: 'var(--tx1)' }}>
            {de ? product.title : product.titleEn}
          </p>
          <p className="num text-[15px] font-bold mt-0.5" style={{ color: 'var(--tx1)' }}>
            {product.price.toFixed(2).replace('.', ',')} €
          </p>
        </div>
        {canCheckout(product) ? (
          <AddToCartButton product={product} size="sm" />
        ) : (
          <a
            href={product.ebayUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); trackEbayClick(product.id); }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold flex-shrink-0 transition-transform active:scale-[0.97]"
            style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
          >
            {de ? 'Kaufen' : 'Buy'}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </>
  );
}
