import { ExternalLink, Check, Droplets, Sun, Shield } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { products } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const filterChip = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-[12px] transition-all border cursor-pointer ${
    active
      ? 'border-[#2B52B0]/40 bg-[#2B52B0]/10 text-wx-tx1'
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
          <div ref={headerRef} className="text-center mb-10">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.products.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl mx-auto">
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
              <div className="flex items-center gap-2.5 mb-6 px-1">
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: '#2B52B0' }} />
                <p className="text-[13px]" style={{ color: 'var(--txm)' }}>
                  {de
                    ? 'Neu beim Heißwachs? Das Classic 500g ist der ideale Einstieg.'
                    : 'New to hot wax? The Classic 500g is the perfect starting point.'}
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
                  <button onClick={resetFilters} className="text-[12px] transition-colors" style={{ color: '#2B52B0' }}>
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
      {/* Bottom gradient — bridges to Tools below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--tool-bg))', zIndex: 1 }}
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

// ── 3D tilt hook ──────────────────────────────────────────────────────────

function useTilt(strength = 5) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    // Remove leave-transition so mouse-move is instant
    el.style.transition = '';
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(0)`;
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Ease back to flat instead of snapping
    el.style.transition = 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
    el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    // Remove inline transition after it completes so hover styles aren't delayed
    setTimeout(() => { if (el) el.style.transition = ''; }, 400);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return ref;
}

// ── Wax Card ───────────────────────────────────────────────────────────────

const WaxCard = memo(function WaxCard({ product, de, formatPrice }: CardProps) {
  const isPro = product.variant === 'pro';
  const accent = isPro ? '#4A72D4' : '#2B52B0';

  const title = de ? product.title : product.titleEn;
  const badge = de ? product.badge : product.badgeEn;

  const benefits = isPro
    ? [
        { icon: <Shield className="h-3.5 w-3.5" />, label: de ? 'MoS₂-Film bindet ans Metall — schützt auch wenn Wachs nachlässt' : 'MoS₂ bonds to metal — protects even as wax fades' },
        { icon: <Droplets className="h-3.5 w-3.5" />, label: de ? 'Hydrophobe Matrix — reduzierte Korrosionsneigung' : 'Hydrophobic matrix — reduced corrosion tendency' },
        { icon: <Check className="h-3.5 w-3.5" />, label: de ? 'Reibungskoeffizient 0,03–0,06 — messbar weniger Verlust' : 'Friction coefficient 0.03–0.06 — measurably less loss' },
      ]
    : [
        { icon: <Sun className="h-3.5 w-3.5" />, label: de ? 'Trocken & sauber — kein Ölfilm, kein Dreck' : 'Dry & clean — no oil film, no grime' },
        { icon: <Check className="h-3.5 w-3.5" />, label: de ? 'Leise & reibungsarm — spürbar am Berg' : 'Quiet & low friction — felt on every climb' },
        { icon: <Check className="h-3.5 w-3.5" />, label: de ? 'Ideal für Trockenheit & Sommer' : 'Ideal for dry conditions & summer' },
      ];

  const tiltRef = useTilt(3);

  return (
    // h-full so all cards in the grid row stretch to same height
    // overflow-hidden must be on the same element as the 3D transform to prevent corner artifacts
    <div ref={tiltRef} className="wax-card relative h-full rounded-2xl overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      <Link
        to={`/produkt/${product.id}`}
        className="group relative flex flex-col h-full rounded-2xl"
        style={{
          background: 'linear-gradient(175deg, var(--card-from) 0%, var(--card-to) 100%)',
          border: isPro ? '1px solid rgba(43,82,176,0.45)' : '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
          transition: 'border-color 250ms ease, box-shadow 250ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
          e.currentTarget.style.borderColor = isPro ? 'rgba(74,114,212,0.70)' : 'var(--bd2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shad)';
          e.currentTarget.style.borderColor = isPro ? 'rgba(43,82,176,0.45)' : 'var(--bd)';
        }}
      >
        {isPro && (
          <div
            className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: 'linear-gradient(90deg, #1A3080, #4A72D4)' }}
          />
        )}

        {/* Image — 3:2 ratio shows product well at the wider 2-col card size */}
        <div className="relative overflow-hidden aspect-[3/2] flex-shrink-0">
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style={{ objectPosition: product.imagePosition ?? 'center 55%' }}
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, var(--card-to) 0%, transparent 55%)' }}
          />
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
              {isPro ? 'Pro' : 'Classic'} · {product.weight}
            </span>
            {badge && (
              <span
                className="text-[11px] font-semibold tracking-[0.10em] uppercase px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content — flex-1 so all cards push price to the same baseline */}
        <div className="px-5 pt-5 pb-5 flex flex-col flex-1">
          <div className="mb-4">
            <h3 className="text-[17px] font-semibold text-wx-tx1 leading-snug tracking-[-0.01em]">
              {de ? product.title : product.titleEn}
            </h3>
          </div>

          {/* Benefits grow to fill — this equalises card heights */}
          <div className="flex flex-col gap-2 mb-5 flex-1">
            {benefits.map(({ icon, label }, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[12.5px] leading-snug" style={{ color: 'var(--txm)' }}>
                <span style={{ color: accent }} className="flex-shrink-0 mt-px">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Price + CTA — always at card bottom */}
          <div className="h-px mb-4" style={{ background: 'var(--bd2)' }} />
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[22px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
                {formatPrice(product.price)}
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>
                {product.applications} {de ? 'Anwendungen' : 'applications'}
              </p>
            </div>
            <AddToCartButton product={product} size="sm" />
          </div>
        </div>
      </Link>
    </div>
  );
});

// ── Chain Card ─────────────────────────────────────────────────────────────

const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const accent = '#2B52B0';
  const badge = de ? product.badge : product.badgeEn;

  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;
  const compatStr = product.compatibility ?? '';

  const tiltRef = useTilt(3);

  return (
    <div ref={tiltRef} className="chain-card relative h-full rounded-2xl overflow-hidden" style={{ transform: 'translateZ(0)' }}>
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
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '60px', background: 'linear-gradient(to top, var(--card-to) 0%, transparent 100%)' }}
          />
          {badge && (
            <span
              className="absolute top-2.5 right-2.5 text-[11px] font-semibold tracking-wide uppercase px-2 py-1 rounded-md"
              style={{ background: 'rgba(0,0,0,0.50)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-4 flex flex-col flex-1 gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] mb-1" style={{ color: accent }}>{brand}</p>
              <h3 className="text-[14px] font-semibold text-wx-tx1 leading-snug tracking-[-0.01em]">{model}</h3>
            </div>
            <span
              className="flex-shrink-0 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded mt-0.5"
              style={{ background: 'var(--sf)', color: 'var(--tx2)', border: '1px solid var(--bd)' }}
            >
              {speed}
            </span>
          </div>

          <p className="text-[11.5px] leading-relaxed flex-1" style={{ color: 'var(--txm)' }}>
            {compatStr}
          </p>

          <div className="flex items-center gap-3 text-[11px]" style={{ borderTop: '1px solid var(--bd2)', paddingTop: '10px' }}>
            {chainLinks && <span style={{ color: 'var(--tx2)' }}>{chainLinks}</span>}
            <span style={{ color: 'var(--txf)' }}>·</span>
            <span style={{ color: 'var(--tx2)' }}>Quick-Link</span>
            <span style={{ color: 'var(--txf)' }}>·</span>
            <span style={{ color: 'var(--tx2)' }}>{de ? 'Gewachst' : 'Waxed'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[20px] font-bold text-wx-tx1 tracking-[-0.02em]">{formatPrice(product.price)}</span>
            <a
              href={product.ebayUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: accent }}
            >
              {buyLabel}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Link>
    </div>
  );
});
