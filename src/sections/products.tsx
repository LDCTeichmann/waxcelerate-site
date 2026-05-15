import { ExternalLink, ArrowRight, Check, Droplets, Sun, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { products } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const filterChip = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-[12px] transition-all border cursor-pointer ${
    active
      ? 'border-[#5B7AEE]/40 bg-[#5B7AEE]/10 text-wx-tx1'
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

  const gridRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (prevTabRef.current === activeTab) return;
    prevTabRef.current = activeTab;
    const grid = gridRef.current;
    if (!grid) return;
    gsap.fromTo(grid,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
  }, [activeTab]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.wax-card', {
        onEnter: (els) => gsap.from(els, {
          y: 24, opacity: 0, duration: 0.6,
          stagger: 0.08, ease: 'power2.out',
          onStart: () => els.forEach(el => { (el as HTMLElement).style.willChange = 'transform, opacity'; }),
          onComplete: () => els.forEach(el => { (el as HTMLElement).style.willChange = 'auto'; }),
        }),
        start: 'top 87%',
        once: true,
      });

      ScrollTrigger.batch('.chain-card', {
        onEnter: (els) => gsap.from(els, {
          y: 24, opacity: 0, duration: 0.6,
          stagger: 0.08, ease: 'power2.out',
        }),
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

  const formatPrice = useMemo(() => (price: number) =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price), [de]);

  return (
    <section id="produkte" className="pt-4 pb-24 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-10">
            <span data-reveal="eyebrow" className="text-xs tracking-[0.3em] text-[#5B7AEE] uppercase mb-3 block font-medium">
              {de ? 'Unser Sortiment' : 'Our Products'}
            </span>
            <h2 data-reveal="heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.products.title}
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl mx-auto">
              {t.products.subtitle}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-1 mb-12 bg-wx-sf border border-wx-bd p-1 rounded-xl w-fit mx-auto">
            {(['wax', 'chain'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-wx-sf2 text-white shadow-sm'
                    : 'text-wx-txf hover:text-wx-tx2'
                }`}
              >
                {tab === 'wax' ? t.products.tabs.wax : t.products.tabs.chains}
              </button>
            ))}
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
                  <span className="text-[10px] uppercase tracking-[0.12em] text-wx-txf font-medium w-12 flex-shrink-0">
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
                  <span className="text-[10px] uppercase tracking-[0.12em] text-wx-txf font-medium w-12 flex-shrink-0">
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
                  <button onClick={resetFilters} className="text-[12px] transition-colors" style={{ color: '#5B7AEE' }}>
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

const WaxCard = memo(function WaxCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const isPro = product.variant === 'pro';
  const accent = isPro ? '#8B6FFD' : '#5B87F6';
  const accentGlow = isPro ? 'rgba(139,111,253,0.14)' : 'rgba(91,135,246,0.12)';
  const accentMuted = isPro ? 'rgba(139,111,253,0.12)' : 'rgba(91,135,246,0.10)';
  const accentBorder = isPro ? 'rgba(139,111,253,0.26)' : 'rgba(91,135,246,0.22)';

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

  return (
    <div ref={tiltRef} className="wax-card">
      <Link
        to={`/produkt/${product.id}`}
        className="group block rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(175deg, var(--card-from) 0%, var(--card-to) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.35), 0 8px 32px rgba(0,0,0,0.55)',
          transition: 'box-shadow 300ms ease, border-color 300ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.65), 0 40px 80px ${accentGlow}`;
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.35), 0 8px 32px rgba(0,0,0,0.55)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        }}
      >
        {/* Full-bleed image — aspect ratio based */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-[1.08]"
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
            <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
              {isPro ? 'Pro' : 'Classic'} · {product.weight}
            </span>
            {badge && (
              <span
                className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                style={{ background: accentMuted, color: accent, border: `1px solid ${accentBorder}` }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-5 flex flex-col">
          <h3 className="text-[17px] font-semibold text-wx-tx1 leading-tight mb-3">
            {de ? 'Kettenwachs' : 'Chain Wax'} — {isPro ? 'Pro' : 'Classic'}
          </h3>

          <div className="flex flex-col gap-1.5 mb-3">
            {benefits.map(({ icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] text-wx-txm">
                <span style={{ color: accent }} className="flex-shrink-0">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-wx-txf mb-4">
            {product.weight} · {product.applications} {de ? 'Anw.' : 'uses'} · {product.compatibility}
          </p>

          <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <div className="flex items-center justify-between">
            <span className="text-[20px] font-semibold text-wx-tx1">{formatPrice(product.price)}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-medium text-wx-txf flex items-center gap-1">
                {de ? 'Details' : 'Details'}
                <ArrowRight className="h-3 w-3" />
              </span>
              <a
                href={product.ebayUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white hover:opacity-85 transition-opacity"
                style={{ background: accent }}
              >
                {buyLabel}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

// ── Chain Card ─────────────────────────────────────────────────────────────

const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const accent = '#5B87F6';
  const accentGlow = 'rgba(91,135,246,0.12)';
  const badge = de ? product.badge : product.badgeEn;

  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;
  const compatStr = product.compatibility ?? '';

  const tiltRef = useTilt(3);

  return (
    <div ref={tiltRef} className="chain-card">
      <a
        href={product.ebayUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(175deg, var(--card-from) 0%, var(--card-to) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.35), 0 8px 32px rgba(0,0,0,0.55)',
          transition: 'box-shadow 300ms ease, border-color 300ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.65), 0 40px 80px ${accentGlow}`;
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.35), 0 8px 32px rgba(0,0,0,0.55)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        }}
      >
        {/* Full-bleed image */}
        <div className="relative overflow-hidden aspect-[16/9]">
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-[1.08]"
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
          />
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '70px', background: 'linear-gradient(to top, var(--card-to) 0%, transparent 100%)' }}
          />
          {badge && (
            <span
              className="absolute top-2.5 right-2.5 text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-md"
              style={{ background: 'rgba(91,135,246,0.82)', color: '#fff', backdropFilter: 'blur(6px)' }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-4 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4A5168] mb-0.5">{brand}</p>
              <h3 className="text-[13px] font-semibold text-white leading-snug">{model}</h3>
            </div>
            <span
              className="flex-shrink-0 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md mt-0.5"
              style={{ background: 'rgba(91,135,246,0.08)', color: accent, border: '1px solid rgba(91,135,246,0.16)' }}
            >
              {speed}
            </span>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#333B4D] mb-1">
              {de ? 'Kompatibel' : 'Compatible'}
            </p>
            <p className="text-[11px] text-wx-txm leading-relaxed">{compatStr}</p>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {chainLinks && <span className="text-[#5A6278] font-medium">{chainLinks}</span>}
            <span className="text-[#2E3545]">·</span>
            <span className="text-[#5A6278]">✓ Quick-Link</span>
            <span className="text-[#2E3545]">·</span>
            <span className="text-[#5A6278]">{de ? '✓ Gewachst' : '✓ Waxed'}</span>
          </div>

          <div className="pt-2.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[16px] font-semibold text-wx-tx1">{formatPrice(product.price)}</span>
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white"
              style={{ background: accent }}
            >
              {buyLabel}
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
});
