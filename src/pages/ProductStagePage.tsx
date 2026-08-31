import { useParams, Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getProductById, canCheckout, checkoutEnabled } from '@/lib/data';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick } from '@/lib/analytics';
import { CartIcon } from '@/components/CartIcon';
import { GpsrInfo } from '@/components/GpsrInfo';
import { gsap } from '@/lib/gsap';

const lg = (src: string) =>
  src.includes('/products/') && src.endsWith('.webp') && !src.endsWith('-lg.webp')
    ? src.replace('.webp', '-lg.webp')
    : src;

const AUTO_INTERVAL = 5000;
const FADE_MS = 900;

export function ProductStagePage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const de = lang === 'de';
  const product = id ? getProductById(id) : undefined;

  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  // Mirrors pausedRef for the JSX below — refs can't be read during render
  // (no re-render is triggered when they change), so the progress-dot
  // animation needs actual state to reflect pause/resume correctly.
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gallery = product ? [product.image, ...(product.images ?? [])] : [];
  const total = gallery.length;

  const goTo = useCallback((i: number) => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  }, [active]);

  // Reset gallery position when navigating to a different product — otherwise
  // an active index left over from a longer gallery can point past the end
  // of a shorter one, and no image matches `i === active` until the
  // auto-advance interval eventually wraps it back into range.
  useEffect(() => {
    setActive(0);
    setPrev(-1);
    window.scrollTo(0, 0);
  }, [id]);

  const next = useCallback(() => {
    if (total <= 1) return;
    goTo((active + 1) % total);
  }, [active, total, goTo]);

  // Auto-play
  useEffect(() => {
    if (reduce || total <= 1) return;
    const start = () => {
      if (autoRef.current) clearInterval(autoRef.current);
      autoRef.current = setInterval(() => {
        if (!pausedRef.current) next();
      }, AUTO_INTERVAL);
    };
    start();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next, reduce, total]);

  const pause = useCallback(() => { pausedRef.current = true; setPaused(true); }, []);
  const resume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, AUTO_INTERVAL);
  }, [next]);

  // Mount entrance animation
  useEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.15,
        });
      }
      if (stageRef.current) {
        gsap.from(stageRef.current, {
          scale: 1.06, opacity: 0, duration: 1.1, ease: 'power2.out',
        });
      }
    });
    return () => ctx.revert();
  }, [id, reduce]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--pg)' }}>
        <p style={{ color: 'var(--txm)' }}>{de ? 'Produkt nicht gefunden.' : 'Product not found.'}</p>
        <Link to="/" className="text-sm flex items-center gap-1" style={{ color: 'var(--accent-soft)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> {de ? 'Zurück' : 'Back'}
        </Link>
      </div>
    );
  }

  const title = de ? product.title : product.titleEn;
  const desc = de ? product.description : product.descriptionEn;
  const fmt = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="fixed inset-0" style={{ background: '#0a0a0b' }}>
      {/* ── Full-screen image stage ── */}
      <div ref={stageRef} className="absolute inset-0 overflow-hidden">
        {gallery.map((src, i) => (
          <img
            key={i}
            src={lg(src)}
            alt={i === active ? title : ''}
            aria-hidden={i !== active}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: product.imagePosition ?? 'center',
              opacity: i === active ? 1 : 0,
              scale: i === active ? '1' : '1.04',
              transition: reduce ? 'none' : `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1), scale ${FADE_MS * 2}ms cubic-bezier(0.4,0,0.2,1)`,
              zIndex: i === active ? 2 : (i === prev ? 1 : 0),
            }}
            onError={e => { const t = e.target as HTMLImageElement; if (!t.src.includes('wax-block-spin')) t.src = src; }}
          />
        ))}
        {/* Scrim for card readability */}
        <div className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'linear-gradient(105deg, rgba(var(--scrim-rgb),0.72) 0%, rgba(var(--scrim-rgb),0.40) 32%, transparent 58%)' }} />
        <div className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.35) 0%, transparent 30%)' }} />
      </div>

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-8 py-5">
        <Link
          to={`/produkt/${product.id}`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {de ? 'Zurück' : 'Back'}
        </Link>
        {checkoutEnabled && <CartIcon />}
      </div>

      {/* ── Floating info card ── */}
      <div
        ref={cardRef}
        className="absolute z-20 left-5 sm:left-8 lg:left-12 bottom-5 sm:bottom-7 lg:bottom-10 w-[calc(100%-40px)] sm:w-[360px] lg:w-[380px]"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        <div
          className="rounded-2xl px-6 py-6 sm:px-7 sm:py-7"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.5)',
          }}
        >
          {/* Variant chip */}
          <span
            className="inline-block text-small font-semibold uppercase tracking-[0.18em] mb-2"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
          >
            {product.variant ? `${product.variant} · ${product.weight ?? ''}` : (product.chainSpeed ?? '')}
          </span>

          <h1 className="font-display text-[24px] sm:text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-white">
            {title}
          </h1>

          <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/50 max-w-[36ch] line-clamp-2">{desc}</p>

          {/* Intervals + Thumbnails row */}
          <div className="mt-4 flex items-end justify-between gap-4">
            {(product.intervalDry || product.intervalWet) && (
              <div className="flex items-center gap-5">
                {product.intervalDry && (
                  <div>
                    <p className="text-small uppercase tracking-[0.16em] mb-0.5 text-white/30">{de ? 'Trocken' : 'Dry'}</p>
                    <p className="num text-[15px] font-bold leading-none text-white">{product.intervalDry}</p>
                  </div>
                )}
                {product.intervalWet && (
                  <div>
                    <p className="text-small uppercase tracking-[0.16em] mb-0.5 text-white/30">{de ? 'Nass' : 'Wet'}</p>
                    <p className="num text-[15px] font-bold leading-none text-white">{product.intervalWet}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {total > 1 && (
            <div className="mt-4 flex gap-1.5">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  aria-label={`${title} ${i + 1}`}
                  className="relative h-10 w-10 overflow-hidden rounded-md flex-shrink-0 transition-all duration-300"
                  style={{
                    opacity: i === active ? 1 : 0.35,
                    transform: i === active ? 'translateY(-1px)' : 'none',
                    boxShadow: i === active ? '0 0 0 1.5px rgba(255,255,255,0.65)' : 'none',
                  }}
                >
                  <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="num text-[22px] font-bold leading-none text-white">{fmt(product.price)}</p>
            <div className="flex-shrink-0">
              {canCheckout(product) ? (
                <AddToCartButton product={product} />
              ) : (
                <a
                  href={product.ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEbayClick(product.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.95)', color: '#0a0a0b' }}
                >
                  {de ? 'Kaufen' : 'Buy'} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <GpsrInfo de={de} dark />
        </div>

        {/* Auto-play progress dots */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                className="relative h-1 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-11 after:h-11"
                style={{
                  width: i === active ? 28 : 8,
                  background: i === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                }}
                aria-label={de ? `Bild ${i + 1}` : `Image ${i + 1}`}
              >
                {i === active && !paused && (
                  <span
                    className="absolute inset-0 rounded-full origin-left"
                    style={{
                      background: 'rgba(255,255,255,1)',
                      animation: `progress ${AUTO_INTERVAL}ms linear`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right index rail ── */}
      {total > 1 && (
        <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-3">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
              className="num text-[12px] tabular-nums transition-all duration-300"
              style={{
                color: i === active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)',
                fontWeight: i === active ? 700 : 400,
                letterSpacing: '0.05em',
                textShadow: i === active ? '0 1px 8px rgba(0,0,0,0.5)' : 'none',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      )}

      {/* Auto-play progress keyframe */}
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
