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
      ? 'border-[#4A6AEE]/40 bg-[#4A6AEE]/10 text-wx-tx1'
      : 'border-wx-bd text-wx-txf hover:text-wx-tx2'
  }`;

export function Products() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'wax' | 'chain'>('wax');
  const [speedFilter, setSpeedFilter] = useState<'all' | '11' | '12'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'shimano' | 'sram' | 'campagnolo'>('all');
  const de = lang === 'de';

  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const idx = activeTab === 'wax' ? 0 : 1;
    const btn = tabBtnRefs.current[idx];
    const bar = tabBarRef.current;
    const pill = pillRef.current;
    if (!btn || !bar || !pill) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    gsap.to(pill, {
      x: btnRect.left - barRect.left,
      width: btnRect.width,
      duration: 0.35,
      ease: 'power3.inOut',
      overwrite: 'auto',
    });
  }, [activeTab]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const btn = tabBtnRefs.current[0];
      const bar = tabBarRef.current;
      const pill = pillRef.current;
      if (!btn || !bar || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: btnRect.left - barRect.left, width: btnRect.width });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() => {
      const idx = activeTab === 'wax' ? 0 : 1;
      const btn = tabBtnRefs.current[idx];
      const pill = pillRef.current;
      if (!btn || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: btnRect.left - barRect.left, width: btnRect.width });
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, [activeTab]);

  const gridRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (prevTabRef.current === activeTab) return;
    prevTabRef.current = activeTab;
    const grid = gridRef.current;
    if (!grid) return;
    gsap.fromTo(grid,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' }
    );
  }, [activeTab]);

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
              (el as HTMLElement).style.willChange = 'auto';
              (el as HTMLElement).style.transform = '';
            }),
          });
        },
        start: 'top 87%',
        once: true,
      });

      ScrollTrigger.batch('.chain-card', {
        onEnter: (els) => {
          gsap.set(els, { transformPerspective: 700, transformOrigin: '50% 0%' });
          gsap.from(els, {
            y: 30, opacity: 0, rotateX: 8, duration: 0.7,
            stagger: 0.09, ease: 'power3.out',
            onStart: () => els.forEach(el => { (el as HTMLElement).style.willChange = 'transform, opacity'; }),
            onComplete: () => els.forEach(el => {
              (el as HTMLElement).style.willChange = 'auto';
              (el as HTMLElement).style.transform = '';
            }),
          });
        },
        start: 'top 87%',
        once: true,
      });
    });

    return () => ctx.revert();
  }, [activeTab]);

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

  const resetFilters = useCallback(() => { setSpeedFilter('all'); setBrandFilter('all'); }, []);

  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price), [lang]);

  return (
    <section id="produkte" className="relative py-20 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-10">
            <span data-reveal="eyebrow" className="section-eyebrow mb-4 block">
              {de ? 'Unser Sortiment' : 'Our Products'}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.products.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl mx-auto">
              {t.products.subtitle}
            </p>
          </div>

          {/* Tabs */}
          <div ref={tabBarRef} className="relative flex justify-center gap-1 mb-12 bg-wx-sf border border-wx-bd p-1 rounded-xl w-fit mx-auto">
            <div ref={pillRef} className="absolute top-1 bottom-1 bg-[#4A6AEE] rounded-full pointer-events-none" style={{ width: 0 }} />
            <button
              ref={el => { tabBtnRefs.current[0] = el; }}
              onClick={() => setActiveTab('wax')}
              className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'wax' ? 'text-white' : 'text-wx-txf hover:text-wx-tx2'
              }`}
            >
              {t.products.tabs.wax}
            </button>
            <button
              ref={el => { tabBtnRefs.current[1] = el; }}
              onClick={() => setActiveTab('chain')}
              className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chain' ? 'text-white' : 'text-wx-txf hover:text-wx-tx2'
              }`}
            >
              {t.products.tabs.chains}
            </button>
          </div>

          {/* Wax Products */}
          {activeTab === 'wax' && (
            <div ref={gridRef} className="grid sm:grid-cols-2 gap-5">
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
          )}

          {/* Chain Products */}
          {activeTab === 'chain' && (
            <div ref={gridRef}>
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

              {/* Results */}
              {filteredChains.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-wx-txm text-sm mb-3">
                    {de ? 'Keine passende Kette gefunden.' : 'No matching chain found.'}
                  </p>
                  <button onClick={resetFilters} className="text-[12px] transition-colors" style={{ color: '#4A6AEE' }}>
                    {de ? 'Filter zurücksetzen' : 'Reset filters'}
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
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
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(0)`;
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
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
  const accent = isPro ? '#8B6FFD' : '#4A6AEE';
  const accentGlow = isPro ? 'rgba(139,111,253,0.14)' : 'rgba(74,106,238,0.12)';
  const accentMuted = isPro ? 'rgba(139,111,253,0.12)' : 'rgba(74,106,238,0.10)';
  const accentBorder = isPro ? 'rgba(139,111,253,0.26)' : 'rgba(74,106,238,0.22)';

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

  const tiltRef = useTilt(4);
  const specularRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={tiltRef}
      className="wax-card relative"
      onMouseMove={(e) => {
        if (!specularRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const lx = 100 - x;
        const ly = 100 - y;
        specularRef.current.style.background =
          `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,0.065) 0%, transparent 62%)`;
      }}
      onMouseLeave={() => {
        if (specularRef.current) specularRef.current.style.background = '';
      }}
    >
      <Link
        to={`/produkt/${product.id}`}
        className="group relative block rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(175deg, var(--card-from) 0%, var(--card-to) 100%)',
          border: isPro ? '1px solid rgba(139,111,253,0.35)' : '1px solid var(--bd2)',
          boxShadow: 'var(--card-shad)',
          transition: 'box-shadow 300ms ease, border-color 300ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `var(--card-shadow-hover), 0 40px 80px ${accentGlow}`;
          e.currentTarget.style.borderColor = isPro ? 'rgba(139,111,253,0.60)' : 'var(--bd)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shad)';
          e.currentTarget.style.borderColor = isPro ? 'rgba(139,111,253,0.50)' : 'var(--bd)';
        }}
      >
        {isPro && (
          <div
            className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: 'linear-gradient(90deg, #7B5FFC, #4A6AEE)' }}
          />
        )}
        {/* Full-bleed image — aspect ratio based */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{ objectPosition: product.imagePosition ?? 'center 55%' }}
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
          />
          {/* Scrim */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, var(--card-to) 0%, rgba(var(--card-to-rgb), 0.55) 28%, rgba(0,0,0,0) 58%)' }}
          />
          {/* Overlaid label + badge */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
              {isPro ? 'Pro' : 'Classic'} · {product.weight}
            </span>
            {badge && (
              <span
                className="text-[11px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                style={{ background: accentMuted, color: accent, border: `1px solid ${accentBorder}` }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-5 flex flex-col">
          {/* Product name + variant */}
          <div className="mb-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] mb-1" style={{ color: accent }}>
              {isPro ? 'Pro' : 'Classic'} · {product.weight}
            </p>
            <h3 className="text-[18px] font-semibold text-wx-tx1 leading-snug tracking-[-0.01em]">
              {de ? product.title : product.titleEn}
            </h3>
          </div>

          {/* Benefits — tight, readable */}
          <div className="flex flex-col gap-2 mb-5">
            {benefits.map(({ icon, label }, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[12.5px] leading-snug" style={{ color: 'var(--txm)' }}>
                <span style={{ color: accent }} className="flex-shrink-0 mt-px">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px mb-4" style={{ background: 'var(--bd2)' }} />

          {/* Price + CTA row */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <span
                className="text-[22px] font-bold leading-none tracking-[-0.02em]"
                style={{ color: 'var(--tx1)' }}
              >
                {formatPrice(product.price)}
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>
                {product.applications} {de ? 'Anwendungen' : 'applications'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <AddToCartButton product={product} size="sm" />
              <a
                href={product.ebayUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-medium text-wx-txf hover:text-wx-tx1 transition-colors flex-shrink-0"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
              >
                eBay
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </Link>
      <div
        ref={specularRef}
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ zIndex: 20 }}
      />
    </div>
  );
});

// ── Chain Card ─────────────────────────────────────────────────────────────

const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const accent = '#4A6AEE';
  const accentGlow = 'rgba(74,106,238,0.12)';
  const badge = de ? product.badge : product.badgeEn;

  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;
  const compatStr = product.compatibility ?? '';

  const tiltRef = useTilt(3);
  const chainSpecularRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={tiltRef}
      className="chain-card relative"
      onMouseMove={(e) => {
        if (!chainSpecularRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const lx = 100 - x;
        const ly = 100 - y;
        chainSpecularRef.current.style.background =
          `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,0.065) 0%, transparent 62%)`;
      }}
      onMouseLeave={() => {
        if (chainSpecularRef.current) chainSpecularRef.current.style.background = '';
      }}
    >
      <Link
        to={`/produkt/${product.id}`}
        className="group block rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(175deg, var(--card-from) 0%, var(--card-to) 100%)',
          border: '1px solid var(--bd2)',
          boxShadow: 'var(--card-shad)',
          transition: 'box-shadow 300ms ease, border-color 300ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `var(--card-shadow-hover), 0 40px 80px ${accentGlow}`;
          e.currentTarget.style.borderColor = 'var(--bd)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--card-shad)';
          e.currentTarget.style.borderColor = 'var(--bd2)';
        }}
      >
        {/* Full-bleed image */}
        <div className="relative overflow-hidden aspect-[16/9]">
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
          />
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '70px', background: 'linear-gradient(to top, var(--card-to) 0%, transparent 100%)' }}
          />
          {badge && (
            <span
              className="absolute top-2.5 right-2.5 text-[11px] font-bold tracking-widest uppercase px-2 py-1 rounded-md"
              style={{ background: 'rgba(74,106,238,0.82)', color: '#fff', backdropFilter: 'blur(6px)' }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] mb-1" style={{ color: accent }}>{brand}</p>
              <h3 className="text-[14px] font-semibold text-wx-tx1 leading-snug tracking-[-0.01em]">{model}</h3>
            </div>
            <span
              className="flex-shrink-0 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded mt-0.5"
              style={{ background: 'rgba(74,106,238,0.08)', color: accent, border: '1px solid rgba(74,106,238,0.16)' }}
            >
              {speed}
            </span>
          </div>

          <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>
            {compatStr}
          </p>

          <div className="flex items-center gap-3 text-[11px]" style={{ borderTop: '1px solid var(--bd2)', paddingTop: '10px' }}>
            {chainLinks && <span style={{ color: 'var(--tx2)' }}>{chainLinks}</span>}
            <span style={{ color: 'var(--txf)' }}>·</span>
            <span style={{ color: 'var(--tx2)' }}>Quick-Link</span>
            <span style={{ color: 'var(--txf)' }}>·</span>
            <span style={{ color: 'var(--tx2)' }}>{de ? 'Gewachst' : 'Waxed'}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[17px] font-bold text-wx-tx1 tracking-[-0.02em]">{formatPrice(product.price)}</span>
            <a
              href={product.ebayUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: accent }}
            >
              {buyLabel}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Link>
      <div
        ref={chainSpecularRef}
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ zIndex: 20 }}
      />
    </div>
  );
});
