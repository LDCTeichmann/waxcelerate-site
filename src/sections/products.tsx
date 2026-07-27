import { ExternalLink, X, ChevronDown, Truck, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/hooks/useLanguage';
import type { TranslationType } from '@/lib/i18n';
import { useSectionReveal } from '@/hooks/useAnimation';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { products, canCheckout } from '@/lib/data';
import { richContent } from '@/lib/productContent';
import { getEstimatedDelivery } from '@/lib/utils';
import { ChainFinder } from '@/sections/ChainFinder';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Stars } from '@/components/Stars';
import { Section } from '@/components/Section';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export function Products() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'wax' | 'chain'>('wax');
  const [compareOpen, setCompareOpen] = useState(false);
  const [speedFilter, setSpeedFilter] = useState<'all' | '11' | '12'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'shimano' | 'sram' | 'campagnolo'>('all');
  const de = lang === 'de';

  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // Listen for hero pill "Vorgewachste Ketten" click → open chains tab
  useEffect(() => {
    const handler = (e: Event) => setActiveTab((e as CustomEvent<'wax' | 'chain'>).detail);
    window.addEventListener('wax:selectTab', handler);
    return () => window.removeEventListener('wax:selectTab', handler);
  }, []);

  const waxProducts = useMemo(() => products.filter(p => p.category === 'wax'), []);
  const chainProducts = useMemo(() => products.filter(p => p.category === 'chain'), []);

  const filteredChains = useMemo(() => chainProducts.filter(p => {
    if (speedFilter !== 'all' && p.chainSpeed !== `${speedFilter}-fach`) return false;
    if (brandFilter !== 'all') {
      const isYBN = p.chainBrand === 'YBN';
      if (brandFilter === 'campagnolo') {
        if (!p.compatibility?.includes('Campagnolo')) return false;
      } else {
        if (!isYBN && p.chainBrand?.toLowerCase() !== brandFilter) return false;
      }
    }
    return true;
  }), [chainProducts, speedFilter, brandFilter]);

  const formatter = useMemo(() =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }),
  [lang]);
  const formatPrice = useCallback((price: number) => formatter.format(price), [formatter]);

  const resetFilters = useCallback(() => { setSpeedFilter('all'); setBrandFilter('all'); }, []);

  // Wax card entrance — runs once, cards never change.
  // Plain fade+rise, no 3D rotateX/perspective: the previous 3D tilt read as a
  // "flip" and — because rotateX forces the browser to recomposite the card
  // in a 3D rendering context — could disrupt the rounded-corner clip on the
  // image wrapper nested inside it for a frame (the same class of Chromium
  // compositing quirk fixed elsewhere on this site, just triggered by the
  // parent's 3D transform instead of the child's own). A 2D transform doesn't
  // have that problem. `data-wx-in` marks elements once animated so that if
  // this effect ever runs twice for the same DOM nodes (React StrictMode's
  // dev-only double-invoke, or any other re-registration), the second pass
  // is a no-op instead of visibly replaying the animation.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.wax-card', {
        onEnter: (els) => {
          const fresh = els.filter(el => !(el as HTMLElement).dataset.wxIn);
          if (!fresh.length) return;
          fresh.forEach(el => { (el as HTMLElement).dataset.wxIn = 'true'; });
          gsap.from(fresh, {
            y: 24, opacity: 0, duration: 0.6,
            stagger: 0.09, ease: 'power3.out',
            onStart: () => fresh.forEach(el => { (el as HTMLElement).style.willChange = 'transform, opacity'; }),
            onComplete: () => fresh.forEach(el => {
              // Only clear the transform GSAP itself animated (the entrance
              // y-offset) — NOT willChange. This element's will-change:
              // transform is a persistent hint set directly in its own style
              // (see the wax-card/chain-card JSX above) precisely so the
              // corner-radius clip survives from here through to whenever the
              // user eventually hovers the card, however much later that is.
              // Clearing it here would strip that hint right back off again
              // moments after it was set, reopening the same glitch on hover.
              gsap.set(el, { clearProps: 'transform' });
            }),
          });
        },
        start: 'top 87%',
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  // Chain card entrance — re-registers when filter changes so new cards animate in
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.chain-card', {
        onEnter: (els) => {
          const fresh = els.filter(el => !(el as HTMLElement).dataset.wxIn);
          if (!fresh.length) return;
          fresh.forEach(el => { (el as HTMLElement).dataset.wxIn = 'true'; });
          gsap.from(fresh, {
            y: 24, opacity: 0, duration: 0.6,
            stagger: 0.09, ease: 'power3.out',
            onStart: () => fresh.forEach(el => { (el as HTMLElement).style.willChange = 'transform, opacity'; }),
            onComplete: () => fresh.forEach(el => {
              // Only clear the transform GSAP itself animated (the entrance
              // y-offset) — NOT willChange. This element's will-change:
              // transform is a persistent hint set directly in its own style
              // (see the wax-card/chain-card JSX above) precisely so the
              // corner-radius clip survives from here through to whenever the
              // user eventually hovers the card, however much later that is.
              // Clearing it here would strip that hint right back off again
              // moments after it was set, reopening the same glitch on hover.
              gsap.set(el, { clearProps: 'transform' });
            }),
          });
        },
        start: 'top 87%',
        once: true,
      });
    });
    return () => ctx.revert();
  }, [filteredChains.length]);

  return (
    <Section id="produkte" className="bg-wx-bg">
          {/* Header */}
          <div ref={headerRef} className="mb-10">
            <h2 className="section-title mb-4">
              <ScrollWordReveal text={t.products.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl">
              {t.products.subtitle}
            </p>
          </div>

          {/* ── Tab switcher ── */}
          <div
            className="relative flex p-1 rounded-xl border border-wx-bd mb-10"
            style={{ background: 'var(--sf)' }}
          >
            {/* Sliding pill — pure CSS, no GSAP needed for 2 tabs */}
            <div
              className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: activeTab === 'wax' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
                background: 'var(--sf2)',
                border: '1px solid var(--bd)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
            <button
              onClick={() => setActiveTab('wax')}
              className={`relative z-10 flex-1 py-2.5 text-[13px] font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'wax' ? 'text-wx-tx1' : 'text-wx-txf hover:text-wx-tx2'
              }`}
            >
              {de ? 'Kettenwachs' : 'Chain Wax'}
            </button>
            <button
              onClick={() => setActiveTab('chain')}
              className={`relative z-10 flex-1 py-2.5 text-[13px] font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'chain' ? 'text-wx-tx1' : 'text-wx-txf hover:text-wx-tx2'
              }`}
            >
              {de ? 'Vorgewachste Ketten' : 'Pre-Waxed Chains'}
            </button>
          </div>

          {/* ── Wax tab ── */}
          {activeTab === 'wax' && (
            <>
              <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} de={de} t={t} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                {waxProducts.map((product) => (
                  <WaxCard
                    key={product.id}
                    product={product}
                    de={de}
                    formatPrice={formatPrice}
                    buyLabel={t.products.buyOnEbay}
                    deliveryDate={getEstimatedDelivery(lang)}
                    multiDiscount={t.products.multiDiscount}
                  />
                ))}
              </div>
              {/* Comparison link — clear, accessible */}
              <button
                onClick={() => setCompareOpen(true)}
                className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-xl text-[13px] font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx2)' }}
              >
                {t.products.decisionAid}{' '}
                <span style={{ color: 'var(--accent-soft)' }}>{t.products.compareBtn} →</span>
              </button>
            </>
          )}

          {/* ── Chains tab ── */}
          {activeTab === 'chain' && (
            <>
              <p className="text-[13px] mb-6 px-1" style={{ color: 'var(--txm)' }}>
                {t.products.preWaxedHint}
              </p>

              {/* Shared info — shown once instead of repeating identical pills on every card */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 px-1 text-[11px]" style={{ color: 'var(--txf)' }}>
                <span className="font-medium" style={{ color: 'var(--tx2)' }}>
                  {de ? 'Alle Ketten: vorgewachst · Quick-Link inklusive' : 'All chains: pre-waxed · Quick-Link included'}
                </span>
                <span className="hidden sm:inline" style={{ color: 'var(--bd2)' }}>·</span>
                <span>{t.products.multiDiscount}</span>
              </div>

              {/* Guided "Finde deine Kette" finder — drives the same brand/speed state */}
              <ChainFinder
                de={de}
                brand={brandFilter}
                speed={speedFilter}
                setBrand={setBrandFilter}
                setSpeed={setSpeedFilter}
                count={filteredChains.length}
              />

              {filteredChains.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-wx-txm text-sm mb-3">
                    {de ? 'Keine passende Kette gefunden.' : 'No matching chain found.'}
                  </p>
                  <button onClick={resetFilters} className="text-[12px] transition-colors" style={{ color: 'var(--accent-soft)' }}>
                    {de ? 'Filter zurücksetzen' : 'Reset filters'}
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5 items-stretch">
                  {filteredChains.map((product) => (
                    <ChainCard
                      key={product.id}
                      product={product}
                      de={de}
                      formatPrice={formatPrice}
                      buyLabel={t.products.buyOnEbay}
                    />
                  ))}
                </div>
              )}
            </>
          )}
      {/* Bottom gradient — bridges to About below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf))', zIndex: 1 }}
      />
    </Section>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

type AnyProduct = typeof products[number];

interface CardProps {
  product: AnyProduct;
  de: boolean;
  formatPrice: (p: number) => string;
  buyLabel: string;
  deliveryDate?: string;
  multiDiscount?: string;
}


// ── Wax Card ───────────────────────────────────────────────────────────────

const WaxCard = memo(function WaxCard({ product, de, formatPrice, buyLabel, deliveryDate, multiDiscount }: CardProps) {
  const isPro = product.variant === 'pro';
  const title = de ? product.title : product.titleEn;
  const badge = de ? product.badge : product.badgeEn;
  const featured = product.badge === 'Empfohlen' || product.badgeEn === 'Recommended';

  const grams = product.weight ? parseInt(product.weight) : 0;
  const per100 = grams > 0 ? `${(product.price / (grams / 100)).toFixed(2).replace('.', ',')} €/100g` : null;

  return (
    <div className="wax-card relative h-full rounded-2xl" style={{ willChange: 'transform' }}>
      <Link
        to={`/produkt/${product.id}`}
        className="group relative flex flex-col h-full rounded-2xl"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
        }}
      >
        {/* Image — will-change: transform (not translateZ(0)) pre-promotes this
            clipped, rounded box to its own compositing layer up front, so the
            hover scale below doesn't trigger a fresh layer promotion — Chromium
            can flash the corner mask square for a frame right as that happens.
            translateZ(0) used to be the standard trick for this, but it's a
            static, non-animating transform value with no ongoing purpose, and
            Chromium's compositor can — and after the page has sat idle for a
            while, reliably does — demote a layer like that back down as a memory
            optimization, silently undoing the pre-promotion. will-change is the
            purpose-built, persistent version of the same hint and isn't subject
            to that demotion, which is why the old fix "worked" right after load
            but the glitch came back on a later hover. */}
        <div className="relative overflow-hidden rounded-t-2xl aspect-[16/9] flex-shrink-0" style={{ willChange: 'transform' }}>
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            style={{ objectPosition: product.imagePosition ?? 'center 55%' }}
            onError={e => { (e.target as HTMLImageElement).src = '/images/products/wax-block-spin.webp'; }}
          />
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <span className="wx-badge"
              style={{ background: 'var(--chip-bg)', color: 'rgba(224,234,255,0.95)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)' }}>
              {isPro ? 'PRO' : 'CLASSIC'} · {product.weight}
            </span>
            {badge && (
              <span className="wx-badge" style={featured
                ? { background: 'var(--brand-blue)', color: '#fff', border: '1px solid var(--brand-blue)', boxShadow: '0 3px 12px rgba(var(--brand-blue-rgb),0.40)' }
                : { background: 'var(--chip-bg)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-3.5 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-4 flex flex-col flex-1">
          <h3 className="font-display text-[15px] sm:text-[17px] font-bold text-wx-tx1 leading-tight tracking-[-0.02em]">
            {title}
          </h3>

          {product.reviewCount != null && (
            <div className="flex items-center gap-1.5 mt-1">
              <Stars rating={5} />
              <span className="text-[11px]" style={{ color: 'var(--txf)' }}>
                {product.reviewCount} {de ? 'Bewertungen' : 'reviews'}
              </span>
            </div>
          )}

          {/* Specs — inline pills. Smaller/tighter on mobile only (base, no sm:
              prefix) so all three fit on one row instead of the third wrapping
              to its own line at 375px; sm: and up restore the original size. */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2.5 flex-wrap">
            {product.intervalDry && (
              <span className="text-[9px] px-1.5 sm:text-[10.5px] sm:px-2 py-0.5 rounded-md tabular-nums" style={{ fontFamily: MONO, background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                {product.intervalDry}
              </span>
            )}
            {product.applications && (
              <span className="text-[9px] px-1.5 sm:text-[10.5px] sm:px-2 py-0.5 rounded-md tabular-nums" style={{ fontFamily: MONO, background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                {product.applications} {de ? 'Anw.' : 'uses'}
              </span>
            )}
            {deliveryDate && (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 sm:text-[10.5px] sm:px-2 py-0.5 rounded-md tabular-nums" style={{ fontFamily: MONO, background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                <Truck className="h-2.5 w-2.5" strokeWidth={2.25} style={{ color: 'var(--brand-blue)' }} aria-hidden />
                {deliveryDate}
              </span>
            )}
          </div>

          {/* Discount — the one place a color accent earns its keep: this is the
              number that actually moves a purchase decision, shown right where
              the eye already is when it reaches the price. Short + bold, not a
              loud badge; the full 2-for-10%/3-for-15% breakdown stays as quiet
              fine print below with the other trust signals. */}
          {multiDiscount && (
            <div className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold" style={{ color: 'var(--brand-blue)' }}>
              <Tag className="h-3 w-3" strokeWidth={2.25} aria-hidden />
              {de ? 'Bis 15 % Rabatt' : 'Up to 15% off'}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-3">
            <div>
              <span className="num text-[22px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
                {formatPrice(product.price)}
              </span>
              {per100 && (
                <p className="text-[10px] mt-1 tabular-nums" style={{ fontFamily: MONO, color: 'var(--txf)' }}>{per100}</p>
              )}
            </div>
            {canCheckout(product) ? (
              <div className="flex flex-col items-end gap-1">
                <AddToCartButton product={product} size="sm" />
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                  className="text-[11px] transition-opacity hover:opacity-70"
                  style={{ color: 'var(--txm)' }}
                >
                  {de ? 'oder bei eBay →' : 'or on eBay →'}
                </button>
              </div>
            ) : (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold rounded-full transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {buyLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});

// ── Chain Card ─────────────────────────────────────────────────────────────

const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const badge = de ? product.badge : product.badgeEn;
  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;

  return (
    <div className="chain-card relative h-full rounded-2xl" style={{ willChange: 'transform' }}>
      <Link
        to={`/produkt/${product.id}`}
        className="group flex flex-col h-full rounded-2xl"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
        }}
      >
        {/* Image — see WaxCard's image wrapper for why will-change: transform (not translateZ(0)) is here. */}
        <div className="relative overflow-hidden rounded-t-2xl aspect-[2/1] flex-shrink-0" style={{ willChange: 'transform' }}>
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            onError={e => { (e.target as HTMLImageElement).src = '/images/products/wax-block-spin.webp'; }}
          />
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <span className="wx-badge"
              style={{ background: 'var(--chip-bg)', color: 'rgba(160,200,255,0.95)', border: '1px solid rgba(100,160,255,0.35)', backdropFilter: 'blur(4px)' }}>
              {speed}
            </span>
            {badge && (
              <span className="wx-badge"
                style={{ background: 'var(--chip-bg)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-3.5 sm:px-4 pt-2.5 sm:pt-3 pb-3 sm:pb-3.5 flex flex-col flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--accent-soft)' }}>{brand}</p>
          <h3 className="text-[14px] sm:text-[15px] font-bold text-wx-tx1 leading-snug tracking-[-0.02em] mt-0.5">{model}</h3>

          {/* Specs as pills */}
          {(chainLinks || speed) && (
            <div className="hidden sm:flex items-center gap-2 mt-2 flex-wrap">
              {speed && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-md tabular-nums" style={{ fontFamily: MONO, background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                  {speed}
                </span>
              )}
              {chainLinks && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-md tabular-nums" style={{ fontFamily: MONO, background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                  {chainLinks} {de ? 'Glieder' : 'links'}
                </span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-3">
            <span className="num text-[20px] font-bold text-wx-tx1 tracking-[-0.02em]">{formatPrice(product.price)}</span>
            {canCheckout(product) ? (
              <div className="flex flex-col items-end gap-1">
                <AddToCartButton product={product} size="sm" />
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                  className="text-[11px] transition-opacity hover:opacity-70"
                  style={{ color: 'var(--txm)' }}
                >
                  {de ? 'oder bei eBay →' : 'or on eBay →'}
                </button>
              </div>
            ) : (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {buyLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});

// ── Compare Modal ──────────────────────────────────────────────────────────

const CLASSIC_ACCENT = 'var(--accent-soft)';
const PRO_ACCENT = 'var(--accent-soft)';

function CompareModal({ open, onClose, de, t }: {
  open: boolean;
  onClose: () => void;
  de: boolean;
  t: TranslationType;
}) {
  const [classicOpen, setClassicOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useBodyScrollLock(open);

  if (!open) return null;

  const classicRc = richContent['wax-500'];
  const proRc = richContent['wax-500-mos2'];
  const pt = t.products;

  const classicPrice = '29,95 €';
  const proPrice = '34,95 €';

  const rows = [
    {
      label: de ? 'Wirkstoff' : 'Active ingredient',
      classic: 'PTFE-Film',
      pro: 'MoS₂-Transferfilm',
    },
    {
      label: de ? 'Reibungskoeffizient' : 'Friction coeff.',
      classic: '0,05–0,07',
      pro: '0,03–0,06',
    },
    {
      label: de ? 'Intervall trocken' : 'Dry interval',
      classic: '250–450 km',
      pro: '300–550 km',
    },
    {
      label: de ? 'Wintereignung' : 'Winter use',
      classic: de ? 'bedingt' : 'limited',
      pro: de ? 'bis −8°C' : 'to −8°C',
      proCheck: true,
    },
    {
      label: de ? 'Rostschutz' : 'Rust protection',
      classic: de ? 'Standard' : 'Standard',
      pro: de ? 'Hydrophob' : 'Hydrophobic',
      proCheck: true,
    },
    {
      label: 'PFAS / PTFE-frei',
      classic: '—',
      pro: '✓',
      proCheck: true,
      classicDim: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'color-mix(in srgb, var(--pg) 72%, transparent)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--sf)',
          border: '1px solid var(--bd)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--bd)' }}
        >
          <div>
            <h3 className="text-[15px] font-semibold text-wx-tx1 tracking-[-0.01em]">{pt.compareTitle}</h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--txff)' }}>
              {de ? 'Alle Angaben für 500g Blöcke' : 'All figures for 500g blocks'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ background: 'var(--sf2)', color: 'var(--txf)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sf3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sf2)'; }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Comparison table ── */}
          <div className="px-4 pt-4 pb-2">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>

              {/* Column header row */}
              <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr 1fr', background: 'var(--sf2)', borderBottom: '1px solid var(--bd2)' }}>
                <div className="px-3 py-3" />
                {/* Classic header */}
                <div className="px-3 py-3 flex flex-col gap-0.5" style={{ borderLeft: '1px solid var(--bd2)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: CLASSIC_ACCENT }}>Classic</span>
                  <span className="text-[10px] leading-snug" style={{ color: 'var(--txff)' }}>
                    {de ? 'Sommer & Einsteiger' : 'Summer & Beginners'}
                  </span>
                </div>
                {/* Pro header */}
                <div className="px-3 py-3 flex flex-col gap-0.5" style={{ borderLeft: '1px solid var(--bd2)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: PRO_ACCENT }}>Pro MoS₂</span>
                  <span className="text-[10px] leading-snug" style={{ color: 'var(--txff)' }}>
                    {de ? 'Ganzjahr & E-Bike' : 'Year-round & E-Bike'}
                  </span>
                </div>
              </div>

              {/* Data rows */}
              {rows.map((row, ri) => (
                <div
                  key={ri}
                  className="grid"
                  style={{ gridTemplateColumns: '1.1fr 1fr 1fr', borderBottom: ri < rows.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                >
                  {/* Label */}
                  <div className="px-3 py-3 flex items-center">
                    <span className="text-[11px]" style={{ color: 'var(--txm)' }}>{row.label}</span>
                  </div>
                  {/* Classic value */}
                  <div className="px-3 py-3 flex items-center justify-center" style={{ borderLeft: '1px solid var(--bd2)' }}>
                    <span
                      className="text-[12px] font-medium text-center"
                      style={{ color: row.classicDim ? 'var(--txff)' : 'var(--tx2)' }}
                    >
                      {row.classic}
                    </span>
                  </div>
                  {/* Pro value */}
                  <div className="px-3 py-3 flex items-center justify-center" style={{ borderLeft: '1px solid var(--bd2)' }}>
                    <span
                      className="text-[12px] font-semibold text-center"
                      style={{ color: row.proCheck ? PRO_ACCENT : 'var(--tx2)' }}
                    >
                      {row.pro}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Formula accordions ── */}
          <div className="px-4 pt-3 pb-4 space-y-2">

            {/* Classic Formula */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)' }}>
              <button
                onClick={() => setClassicOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(var(--accent-soft-rgb), 0.08)', color: CLASSIC_ACCENT }}
                  >
                    Classic
                  </span>
                  <span className="text-[12px] font-medium text-wx-tx1">{pt.compareFormulaClassic}</span>
                  <span className="text-[11px]" style={{ color: 'var(--txff)' }}>
                    · {classicRc.formulaDetails?.length} {pt.compareComponents}
                  </span>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--txf)', transform: classicOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out"
                style={{ gridTemplateRows: classicOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: '1px solid var(--bd2)' }}>
                    {classicRc.formulaDetails?.map((f, i, arr) => (
                      <div
                        key={i}
                        className="flex gap-3.5 px-4 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                      >
                        <span className="text-[11px] font-bold tabular-nums flex-shrink-0 mt-0.5 w-5 text-right" style={{ color: CLASSIC_ACCENT }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-[12px] font-semibold text-wx-tx1 mb-0.5">{f.name}</div>
                          <div className="text-[11px] leading-relaxed" style={{ color: 'var(--txm)' }}>{f.detail}</div>
                        </div>
                      </div>
                    ))}
                    {classicRc.techNote && (
                      <div
                        className="mx-4 mb-3 mt-1 rounded-lg p-3"
                        style={{ background: 'rgba(var(--accent-soft-rgb), 0.03)', border: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: CLASSIC_ACCENT }}>
                          {classicRc.techNote.title}
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                          {classicRc.techNote.body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Formula */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(var(--accent-soft-rgb), 0.19)', background: 'rgba(var(--accent-soft-rgb), 0.02)' }}
            >
              <button
                onClick={() => setProOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(var(--accent-soft-rgb), 0.09)', color: PRO_ACCENT }}
                  >
                    Pro MoS₂
                  </span>
                  <span className="text-[12px] font-medium text-wx-tx1">{pt.compareFormulaPro}</span>
                  <span className="text-[11px]" style={{ color: 'var(--txff)' }}>
                    · {proRc.formulaDetails?.length} {pt.compareComponents}
                  </span>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--txf)', transform: proOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out"
                style={{ gridTemplateRows: proOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}>
                    {proRc.formulaDetails?.map((f, i, arr) => (
                      <div
                        key={i}
                        className="flex gap-3.5 px-4 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                      >
                        <span className="text-[11px] font-bold tabular-nums flex-shrink-0 mt-0.5 w-5 text-right" style={{ color: PRO_ACCENT }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-[12px] font-semibold text-wx-tx1 mb-0.5">{f.name}</div>
                          <div className="text-[11px] leading-relaxed" style={{ color: 'var(--txm)' }}>{f.detail}</div>
                        </div>
                      </div>
                    ))}
                    {proRc.techNote && (
                      <div
                        className="mx-4 mb-3 mt-1 rounded-lg p-3"
                        style={{ background: 'rgba(var(--accent-soft-rgb), 0.03)', border: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: PRO_ACCENT }}>
                          {proRc.techNote.title}
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                          {proRc.techNote.body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer CTAs ── */}
        <div
          className="flex-shrink-0 grid grid-cols-2 gap-2.5 px-4 py-3.5"
          style={{ borderTop: '1px solid var(--bd)', background: 'var(--sf2)' }}
        >
          <Link
            to="/produkt/wax-500"
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 py-3 rounded-xl text-center transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
          >
            <span className="text-[12px] font-semibold" style={{ color: 'var(--tx1)' }}>Classic</span>
            <span className="text-[11px]" style={{ color: 'var(--txff)' }}>{classicPrice}</span>
          </Link>
          <Link
            to="/produkt/wax-500-mos2"
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 py-3 rounded-xl text-center transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'rgba(var(--accent-soft-rgb), 0.07)', border: '1px solid rgba(var(--accent-soft-rgb), 0.25)' }}
          >
            <span className="text-[12px] font-semibold" style={{ color: PRO_ACCENT }}>Pro MoS₂</span>
            <span className="text-[11px]" style={{ color: 'rgba(var(--accent-soft-rgb), 0.6)' }}>{proPrice}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
