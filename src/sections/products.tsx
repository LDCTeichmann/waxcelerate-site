import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { products } from '@/lib/data';


const filterChip = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-[12px] transition-all border cursor-pointer ${
    active
      ? 'border-[#1A3C6E]/40 bg-[#1A3C6E]/10 text-wx-tx1'
      : 'border-wx-bd text-wx-txf hover:text-wx-tx2'
  }`;

export function Products() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'wax' | 'chain'>('wax');
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

  // Wax card entrance — runs once, cards never change
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.wax-card', {
        onEnter: (els) => {
          gsap.set(els, { transformPerspective: 700, transformOrigin: '50% 0%' });
          gsap.from(els, {
            y: 30, opacity: 0, rotateX: 8, duration: 0.7,
            stagger: 0.09, ease: 'power3.out',
            onStart: () => els.forEach(el => { (el as HTMLElement).style.willChange = 'transform, opacity'; }),
            onComplete: () => els.forEach(el => {
              gsap.set(el, { clearProps: 'transform,willChange' });
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
          gsap.set(els, { transformPerspective: 700, transformOrigin: '50% 0%' });
          gsap.from(els, {
            y: 30, opacity: 0, rotateX: 8, duration: 0.7,
            stagger: 0.09, ease: 'power3.out',
            onStart: () => els.forEach(el => { (el as HTMLElement).style.willChange = 'transform, opacity'; }),
            onComplete: () => els.forEach(el => {
              gsap.set(el, { clearProps: 'transform,willChange' });
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
    <section id="produkte" className="relative py-20 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="mb-10">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
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
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3 mb-3 px-1">
                <p className="text-[13px]" style={{ color: 'var(--txm)' }}>
                  {de
                    ? 'Du brauchst nur: alter Topf · Isopropanol · 85–90 °C · ~60 min beim ersten Mal.'
                    : 'All you need: old pot · isopropanol · 85–90 °C · ~60 min the first time.'}
                </p>
                <p className="text-[12px] sm:whitespace-nowrap sm:flex-shrink-0" style={{ color: 'var(--txf)' }}>
                  {t.products.multiDiscount}
                </p>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6 px-1">
                <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
                  {t.products.decisionAid}
                </p>
                <p className="text-[11px] sm:whitespace-nowrap sm:flex-shrink-0" style={{ color: 'var(--txf)' }}>
                  {t.products.shippingHint}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                {waxProducts.map((product) => (
                  <WaxCard
                    key={product.id}
                    product={product}
                    de={de}
                    formatPrice={formatPrice}
                    buyLabel={t.products.buyOnEbay}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Chains tab ── */}
          {activeTab === 'chain' && (
            <>
              <p className="text-[13px] mb-6 px-1" style={{ color: 'var(--txm)' }}>
                {t.products.preWaxedHint}
              </p>

              {/* Filter bar */}
              <div className="mb-6 rounded-xl border border-wx-bd px-4 py-3 space-y-2" style={{ background: 'var(--sf)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs uppercase tracking-[0.12em] text-wx-txf font-medium w-12 flex-shrink-0">
                    {de ? 'Gänge' : 'Speed'}
                  </span>
                  <div className="flex gap-1.5">
                    {(['all', '11', '12'] as const).map(v => (
                      <button key={v} onClick={() => setSpeedFilter(v)} className={filterChip(speedFilter === v)}>
                        {v === 'all' ? (de ? 'Alle' : 'All') : `${v}-fach`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs uppercase tracking-[0.12em] text-wx-txf font-medium w-12 flex-shrink-0">
                    {de ? 'Marke' : 'Brand'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { v: 'all',        label: de ? 'Alle' : 'All' },
                      { v: 'shimano',    label: 'Shimano'            },
                      { v: 'sram',       label: 'SRAM'               },
                      { v: 'campagnolo', label: 'Campa'              },
                    ] as { v: 'all' | 'shimano' | 'sram' | 'campagnolo'; label: string }[]).map(({ v, label }) => (
                      <button key={v} onClick={() => setBrandFilter(v)} className={filterChip(brandFilter === v)}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredChains.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-wx-txm text-sm mb-3">
                    {de ? 'Keine passende Kette gefunden.' : 'No matching chain found.'}
                  </p>
                  <button onClick={resetFilters} className="text-[12px] transition-colors" style={{ color: '#1A3C6E' }}>
                    {de ? 'Filter zurücksetzen' : 'Reset filters'}
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
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
        </div>
      </div>
      {/* Bottom gradient — bridges to About below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf))', zIndex: 1 }}
      />
    </section>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

type AnyProduct = typeof products[number];

interface CardProps {
  product: AnyProduct;
  de: boolean;
  formatPrice: (p: number) => string;
  buyLabel: string;
}


// ── Wax Card ───────────────────────────────────────────────────────────────

const WaxCard = memo(function WaxCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const isPro = product.variant === 'pro';
  const accent = isPro ? '#2A5499' : '#1A3C6E';

  const title = de ? product.title : product.titleEn;
  const badge = de ? product.badge : product.badgeEn;
  const desc = de ? product.description : product.descriptionEn;

  return (
    <div className="wax-card relative h-full rounded-2xl overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      <Link
        to={`/produkt/${product.id}`}
        className="group relative flex flex-col h-full rounded-2xl"
        style={{
          background: 'linear-gradient(175deg, var(--card-from) 0%, var(--card-to) 100%)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
          transition: 'border-color 250ms ease, box-shadow 250ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
          e.currentTarget.style.borderColor = 'var(--bd2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shad)';
          e.currentTarget.style.borderColor = 'var(--bd)';
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/2] flex-shrink-0">
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style={{ objectPosition: product.imagePosition ?? 'center 55%' }}
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--card-to) 0%, transparent 50%)' }} />
          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.50)', color: accent, border: `1px solid ${accent}40`, backdropFilter: 'blur(4px)' }}
            >
              {isPro ? 'Pro' : 'Classic'} · {product.weight}
            </span>
            {badge && (
              <span
                className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.50)', color: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-5 flex flex-col flex-1">
          {/* Title + description */}
          <div className="mb-5 flex-1">
            <h3 className="text-[18px] font-bold text-wx-tx1 leading-tight tracking-[-0.02em] mb-1.5">
              {title}
            </h3>
            <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: 'var(--txm)' }}>
              {desc}
            </p>
          </div>

          {/* Interval metrics */}
          {(product.intervalDry || product.intervalWet) && (
            <div className="flex gap-3 mb-5">
              {product.intervalDry && (
                <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
                  <p className="text-[9px] uppercase tracking-[0.12em] font-medium mb-0.5" style={{ color: 'var(--txff)' }}>
                    {de ? 'Trocken' : 'Dry'}
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>{product.intervalDry}</p>
                </div>
              )}
              {product.intervalWet && (
                <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
                  <p className="text-[9px] uppercase tracking-[0.12em] font-medium mb-0.5" style={{ color: 'var(--txff)' }}>
                    {de ? 'Nass' : 'Wet'}
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>{product.intervalWet}</p>
                </div>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[22px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
                {formatPrice(product.price)}
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>
                {product.applications} {de ? 'Anwendungen' : 'applications'}
              </p>
            </div>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-xl transition-opacity duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {buyLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
});

// ── Chain Card ─────────────────────────────────────────────────────────────

const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const accent = '#1A3C6E'; // used for badge border/text only
  const badge = de ? product.badge : product.badgeEn;

  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;

  return (
    <div className="chain-card relative h-full rounded-2xl overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      <Link
        to={`/produkt/${product.id}`}
        className="group flex flex-col h-full rounded-2xl"
        style={{
          background: 'linear-gradient(175deg, var(--card-from) 0%, var(--card-to) 100%)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
          transition: 'border-color 250ms ease, box-shadow 250ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
          e.currentTarget.style.borderColor = 'var(--bd2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shad)';
          e.currentTarget.style.borderColor = 'var(--bd)';
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/9] flex-shrink-0">
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--card-to) 0%, transparent 55%)' }} />
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.50)', color: accent, border: `1px solid ${accent}40`, backdropFilter: 'blur(4px)' }}
            >
              {speed}
            </span>
            {badge && (
              <span
                className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.50)', color: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-4 flex flex-col flex-1">
          {/* Brand + model */}
          <div className="mb-4 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: accent }}>{brand}</p>
            <h3 className="text-[15px] font-bold text-wx-tx1 leading-snug tracking-[-0.02em]">{model}</h3>
          </div>

          {/* Spec pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {chainLinks && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg font-medium" style={{ background: 'var(--sf3)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                {chainLinks}
              </span>
            )}
            <span className="text-[11px] px-2.5 py-1 rounded-lg font-medium" style={{ background: 'var(--sf3)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
              Quick-Link
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-lg font-medium" style={{ background: 'var(--sf3)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
              {de ? 'Vorgewachst' : 'Pre-waxed'}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
            <span className="text-[20px] font-bold text-wx-tx1 tracking-[-0.02em]">{formatPrice(product.price)}</span>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: '#1A3C6E' }}
            >
              {buyLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
});
