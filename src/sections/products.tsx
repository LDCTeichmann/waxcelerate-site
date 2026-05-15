import { ExternalLink, ArrowRight, Check, Droplets, Sun, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { products } from '@/lib/data';

export function Products() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'wax' | 'chain'>('wax');
  const de = lang === 'de';

  const waxProducts = products.filter(p => p.category === 'wax');
  const chainProducts = products.filter(p => p.category === 'chain');

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);

  return (
    <section id="produkte" className="py-24 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] text-[#5B7AEE] uppercase mb-3 block font-medium">
              {de ? 'Unser Sortiment' : 'Our Products'}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.products.title}
            </h2>
            <p className="text-wx-txm max-w-xl mx-auto">
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
            <div className="grid sm:grid-cols-2 gap-5">
              {waxProducts.map((product, i) => (
                <WaxCard
                  key={product.id}
                  product={product}
                  de={de}
                  formatPrice={formatPrice}
                  buyLabel={t.products.buyOnEbay}
                  index={i}
                />
              ))}
            </div>
          )}

          {/* Chain Products */}
          {activeTab === 'chain' && (
            <>
              <div className="border border-wx-bd rounded-xl px-5 py-3.5 mb-8 bg-wx-sf">
                <p className="text-wx-txm text-sm">{t.products.preWaxedHint}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chainProducts.map((product, i) => (
                  <ChainCard
                    key={product.id}
                    product={product}
                    de={de}
                    formatPrice={formatPrice}
                    buyLabel={t.products.buyOnEbay}
                    index={i}
                  />
                ))}
              </div>
            </>
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

// ── Scroll-reveal hook ─────────────────────────────────────────────────────

function useScrollReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    },
  };
}

// ── Wax Card ───────────────────────────────────────────────────────────────

function WaxCard({ product, de, formatPrice, buyLabel, index }: CardProps & { index: number }) {
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
  const { ref: revealRef, style: revealStyle } = useScrollReveal(index * 80);

  // Merge refs
  const cardRef = useCallback((el: HTMLDivElement | null) => {
    (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (revealRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }, []);

  return (
    <div ref={cardRef} style={{ ...revealStyle, willChange: 'transform, opacity' }}>
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
        {/* Full-bleed image — 360px, per-product positioning */}
        <div className="relative overflow-hidden" style={{ height: '360px' }}>
          <img
            src={product.image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-[1.08]"
            style={{ objectPosition: product.imagePosition ?? 'center 55%' }}
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.png'; }}
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
}

// ── Chain Card ─────────────────────────────────────────────────────────────

function ChainCard({ product, de, formatPrice, buyLabel, index }: CardProps & { index: number }) {
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
  const { ref: revealRef, style: revealStyle } = useScrollReveal(index * 60);

  const cardRef = useCallback((el: HTMLDivElement | null) => {
    (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (revealRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }, []);

  return (
    <div ref={cardRef} style={{ ...revealStyle, willChange: 'transform, opacity' }}>
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
        <div className="relative overflow-hidden" style={{ height: '210px' }}>
          <img
            src={product.image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-[1.08]"
            onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.png'; }}
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
}
