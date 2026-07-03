import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { diveFormula } from '@/lib/science';
import { getProductById, canCheckout } from '@/lib/data';
import { AddToCartButton } from '@/components/AddToCartButton';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

/**
 * WaxDive — "look inside the wax" experience.
 *
 * LEFT: the formula as an indexed recipe list (name · role · metric).
 * RIGHT: selected component detail — name, summary, micro-diagram.
 *        Fixed-height sections prevent layout shifts between ingredients.
 * BOTTOM: conversion footer — matching product with buy CTA.
 *
 * Mobile: recipe list becomes a horizontal pill strip; layout stacks.
 */
export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  const components = diveFormula(variant);
  const active = components.find(c => c.id === activeId) ?? components[0];

  const productId = variant === 'pro' ? 'wax-500-mos2' : 'wax-500';
  const product = getProductById(productId)!;

  useEffect(() => { setActiveId(null); }, [variant]);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => { window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const els = [summaryRef.current, diagramRef.current].filter(Boolean);
    if (!els.length) return;
    const tl = gsap.timeline();
    tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.06 });
    return () => { tl.kill(); };
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
        className="relative w-full max-w-4xl max-h-[90dvh] flex flex-col rounded-2xl outline-none"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad), 0 40px 100px rgba(0,0,0,0.35)' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-5 flex-shrink-0"
          style={{ background: 'var(--sf)', borderBottom: '1px solid var(--bd)', borderRadius: '1rem 1rem 0 0' }}>
          <div className="min-w-0">
            <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>{de ? 'Blick ins Wachs' : 'Inside the wax'}</p>
            <p className="font-display font-bold text-[18px] sm:text-[19px] leading-tight mt-1 truncate" style={{ color: 'var(--tx1)' }}>
              {de ? 'Die Formel unter der Lupe' : 'The formula up close'}
            </p>
            <p className="text-[11.5px] mt-1 hidden sm:block" style={{ color: 'var(--txm)' }}>{variantLine}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
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

        {/* ── Content: recipe list + detail ── */}
        <div className="flex-1 overflow-y-auto min-h-0">

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
                    background: sel ? 'rgba(var(--accent-rgb),0.10)' : 'transparent',
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
            <div className="hidden lg:block px-6 sm:px-8 py-7 lg:border-r" style={{ borderColor: 'var(--bd)' }}>
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

            {/* RIGHT — detail panel with fixed-height sections */}
            <div className="px-5 sm:px-8 py-6 lg:py-7 flex flex-col min-h-[320px] lg:min-h-[420px]">

              {/* Name + role + metric */}
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h3 className="font-display font-bold text-[1.35rem] lg:text-[1.5rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                  {de ? active.nameDe : active.nameEn}
                </h3>
                <span className="num-data font-semibold text-[16px]" style={{ color: 'var(--accent-soft)' }}>
                  {active.metric}
                </span>
              </div>
              <p className="eyebrow mt-1.5" style={{ color: 'var(--accent-soft)' }}>
                {de ? active.roleDe : active.roleEn}
              </p>

              {/* Summary — fixed height, clamped */}
              <div ref={summaryRef}
                className="mt-4 min-h-[120px] max-h-[140px] lg:min-h-[140px] lg:max-h-[140px] overflow-hidden">
                <p className="text-[14px] lg:text-[14.5px] leading-relaxed"
                  style={{
                    color: 'var(--tx2)',
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                  {de ? active.sumDe : active.sumEn}
                </p>
              </div>

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
            <p className="num-data text-[15px] font-bold mt-0.5" style={{ color: 'var(--tx1)' }}>
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
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold flex-shrink-0 transition-transform active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {de ? 'Kaufen' : 'Buy'}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
