import { ExternalLink, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/hooks/useLanguage';
import type { TranslationType } from '@/lib/i18n';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { products } from '@/lib/data';
import { richContent } from '@/lib/productContent';
import { getEstimatedDelivery } from '@/lib/utils';
import { useCartStore, isInStock, isLowStock, getStock } from '@/store/cart';


const filterChip = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-[12px] transition-all border cursor-pointer ${
    active
      ? 'border-[#1A3C6E]/40 bg-[#1A3C6E]/10 text-wx-tx1'
      : 'border-wx-bd text-wx-txf hover:text-wx-tx2'
  }`;

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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <button
                  onClick={() => setCompareOpen(true)}
                  className="flex items-center gap-2 group w-fit"
                >
                  <span className="text-[13px]" style={{ color: 'var(--txm)' }}>
                    {t.products.decisionAid}
                  </span>
                  <span
                    className="text-[12px] font-medium px-2.5 py-1 rounded-full transition-all"
                    style={{
                      background: 'rgba(43,82,176,0.10)',
                      border: '1px solid rgba(43,82,176,0.25)',
                      color: '#3D67CA',
                    }}
                  >
                    {t.products.compareBtn} →
                  </span>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                  <span
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx2)' }}
                  >
                    {t.products.multiDiscount}
                  </span>
                  <span
                    className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--txf)' }}
                  >
                    📦 <span style={{ color: 'var(--tx2)' }}>{getEstimatedDelivery(lang)}</span>
                    {' · '}{de ? 'gratis ab €50' : 'free from €50'}
                  </span>
                </div>
              </div>
              <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} de={de} t={t} formatPrice={formatPrice} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                {waxProducts.map((product) => (
                  <WaxCard
                    key={product.id}
                    product={product}
                    de={de}
                    formatPrice={formatPrice}
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

const WaxCard = memo(function WaxCard({ product, de, formatPrice }: CardProps) {
  const isPro = product.variant === 'pro';
  const accent = isPro ? '#2A5499' : '#1A3C6E';

  const title = de ? product.title : product.titleEn;
  const badge = de ? product.badge : product.badgeEn;
  const desc = de ? product.description : product.descriptionEn;

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const stockMap = useCartStore((s) => s.stockMap);
  const inStock = isInStock(stockMap, product.id);
  const lowStock = isLowStock(stockMap, product.id);
  const stockCount = getStock(stockMap, product.id);

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
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--card-img-fade) 0%, transparent 50%)' }} />
          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.60)', color: 'rgba(180,210,255,0.95)', border: `1px solid ${accent}50`, backdropFilter: 'blur(4px)' }}
            >
              {isPro ? 'Pro' : 'Classic'} · {product.weight}
            </span>
            {badge && (
              <span
                className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.60)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}
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

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[22px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
                {formatPrice(product.price)}
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>
                {(() => {
                  const grams = product.weight ? parseInt(product.weight) : 0;
                  const per100g = grams > 0
                    ? `${(product.price / (grams / 100)).toFixed(2).replace('.', ',')} €/100g`
                    : null;
                  const appsLabel = product.applications
                    ? `${product.applications} ${de ? 'Anwendungen' : 'applications'}`
                    : null;
                  return [appsLabel, per100g].filter(Boolean).join(' · ');
                })()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!inStock) return;
                  addItem(product);
                  openCart();
                }}
                disabled={!inStock}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-xl transition-opacity duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {inStock
                  ? (de ? 'In den Warenkorb' : 'Add to cart')
                  : (de ? 'Ausverkauft' : 'Sold out')}
              </button>
              {lowStock && stockCount > 0 && (
                <p className="text-[10px]" style={{ color: '#e67e22' }}>
                  {de ? `Nur noch ${stockCount} verfügbar` : `Only ${stockCount} left`}
                </p>
              )}
            </div>
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
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--card-img-fade) 0%, transparent 55%)' }} />
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.60)', color: 'rgba(160,200,255,0.95)', border: '1px solid rgba(100,160,255,0.35)', backdropFilter: 'blur(4px)' }}
            >
              {speed}
            </span>
            {badge && (
              <span
                className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.60)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-3 flex flex-col flex-1">
          {/* Brand + model */}
          <div className="mb-3 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-0.5" style={{ color: accent }}>{brand}</p>
            <h3 className="text-[15px] font-bold text-wx-tx1 leading-snug tracking-[-0.02em]">{model}</h3>
          </div>

          {/* Spec pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
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

// ── Compare Modal ──────────────────────────────────────────────────────────

const CLASSIC_ACCENT = '#2B52B0';
const PRO_ACCENT = '#3D67CA';

function CompareModal({ open, onClose, de, t, formatPrice }: {
  open: boolean;
  onClose: () => void;
  de: boolean;
  t: TranslationType;
  formatPrice: (p: number) => string;
}) {
  const [classicOpen, setClassicOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const classicRc = richContent['wax-500'];
  const proRc = richContent['wax-500-mos2'];
  const pt = t.products;

  const classicProduct = products.find(p => p.id === 'wax-500');
  const proProduct = products.find(p => p.id === 'wax-500-mos2');
  const classicPrice = classicProduct ? formatPrice(classicProduct.price) : '29,95 €';
  const proPrice = proProduct ? formatPrice(proProduct.price) : '34,95 €';

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
                    style={{ background: `${CLASSIC_ACCENT}15`, color: CLASSIC_ACCENT }}
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
                className="grid transition-[grid-template-rows] duration-280 ease-in-out"
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
                        style={{ background: `${CLASSIC_ACCENT}08`, border: `1px solid ${CLASSIC_ACCENT}20` }}
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
              style={{ border: `1px solid ${PRO_ACCENT}30`, background: `${PRO_ACCENT}05` }}
            >
              <button
                onClick={() => setProOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${PRO_ACCENT}18`, color: PRO_ACCENT }}
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
                className="grid transition-[grid-template-rows] duration-280 ease-in-out"
                style={{ gridTemplateRows: proOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: `1px solid ${PRO_ACCENT}20` }}>
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
                        style={{ background: `${PRO_ACCENT}08`, border: `1px solid ${PRO_ACCENT}20` }}
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
            style={{ background: `${PRO_ACCENT}12`, border: `1px solid ${PRO_ACCENT}40` }}
          >
            <span className="text-[12px] font-semibold" style={{ color: PRO_ACCENT }}>Pro MoS₂</span>
            <span className="text-[11px]" style={{ color: `${PRO_ACCENT}99` }}>{proPrice}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
