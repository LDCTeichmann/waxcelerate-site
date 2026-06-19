import { useParams, Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getProductById, canCheckout } from '@/lib/data';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CartIcon } from '@/components/CartIcon';
import { gsap } from '@/lib/gsap';

type Fit = 'full' | 'frame';

// High-res variant for the big stage image (falls back to the card-sized webp).
const lg = (src: string) =>
  src.includes('/products/') && src.endsWith('.webp') && !src.endsWith('-lg.webp')
    ? src.replace('.webp', '-lg.webp')
    : src;

const COLS = 7; // vertical curtain columns

/**
 * MANGO-style split product layout (preview/experiment route: /produkt/:id/stage).
 * Fixed info card on the left, full-height image stage on the right that swaps
 * with a column-curtain wipe. Toggle between true full-bleed and a framed stage.
 * The canonical product page (/produkt/:id) is untouched.
 */
export function ProductStagePage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const de = lang === 'de';
  const product = id ? getProductById(id) : undefined;

  const [fit, setFit] = useState<Fit>('full');
  const [active, setActive] = useState(0);   // selected index (drives the numbered rail)
  const [display, setDisplay] = useState(0); // currently rendered image (swaps mid-wipe)
  const wipeRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gallery = product ? [product.image, ...(product.images ?? [])] : [];

  const goTo = useCallback((i: number) => {
    if (i === active || animating.current) return;
    setActive(i);
    if (reduce || !wipeRef.current) { setDisplay(i); return; }
    const cols = wipeRef.current.querySelectorAll<HTMLElement>('[data-col]');
    if (!cols.length) { setDisplay(i); return; }
    animating.current = true;
    const tl = gsap.timeline({ onComplete: () => { animating.current = false; } });
    tl.set(wipeRef.current, { display: 'flex' })
      .set(cols, { yPercent: -100 })
      .to(cols, { yPercent: 0, duration: 0.42, ease: 'power3.in', stagger: 0.045 })
      .add(() => setDisplay(i))
      .to(cols, { yPercent: 100, duration: 0.52, ease: 'power3.out', stagger: 0.045 }, '+=0.03')
      .set(wipeRef.current, { display: 'none' });
  }, [active, reduce]);

  // Mount reveal — the curtain lifts away to unveil the first image.
  useEffect(() => {
    if (reduce || !wipeRef.current) return;
    const cols = wipeRef.current.querySelectorAll<HTMLElement>('[data-col]');
    if (!cols.length) return;
    const tl = gsap.timeline();
    tl.set(wipeRef.current, { display: 'flex' })
      .set(cols, { yPercent: 0 })
      .to(cols, { yPercent: 100, duration: 0.6, ease: 'power4.inOut', stagger: 0.05, delay: 0.05 })
      .set(wipeRef.current, { display: 'none' });
    return () => { tl.kill(); };
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
  const ref = `REF. ${product.id.toUpperCase()}`;
  const fmt = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="lg:fixed lg:inset-0 lg:flex" style={{ background: 'var(--pg)' }}>

      {/* ── LEFT — fixed info card ── */}
      <aside className="relative z-30 flex flex-col flex-shrink-0 px-7 sm:px-9 py-7 lg:py-9 lg:h-full lg:w-[clamp(340px,31vw,440px)]"
        style={{ background: 'var(--pg)' }}>
        <div className="flex items-center justify-between">
          <Link to={`/produkt/${product.id}`} className="inline-flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-60" style={{ color: 'var(--txm)' }}>
            <ArrowLeft className="h-4 w-4" /> {de ? 'Zurück' : 'Back'}
          </Link>
          <div className="lg:hidden"><CartIcon /></div>
        </div>

        <div className="lg:my-auto lg:py-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--accent-soft)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
            {product.variant ? `${product.variant} · ${product.weight ?? ''}` : (product.chainSpeed ?? '')}
          </span>
          <h1 className="font-display mt-3 text-[30px] sm:text-[34px] font-bold leading-[1.05] tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
            {title}
          </h1>
          <p className="mt-2 text-[10px] tracking-[0.14em]" style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>{ref}</p>

          <p className="mt-5 text-[13.5px] leading-relaxed max-w-[42ch]" style={{ color: 'var(--txm)' }}>{desc}</p>

          {/* Intervals */}
          {(product.intervalDry || product.intervalWet) && (
            <div className="mt-6 flex items-center gap-7">
              {product.intervalDry && (
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--txff)' }}>{de ? 'Trocken' : 'Dry'}</p>
                  <p className="num text-[17px] font-bold leading-none" style={{ color: 'var(--tx1)' }}>{product.intervalDry}</p>
                </div>
              )}
              {product.intervalWet && (
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--txff)' }}>{de ? 'Nass' : 'Wet'}</p>
                  <p className="num text-[17px] font-bold leading-none" style={{ color: 'var(--tx1)' }}>{product.intervalWet}</p>
                </div>
              )}
            </div>
          )}

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="mt-6 flex gap-2.5">
              {gallery.map((src, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`${title} ${i + 1}`} aria-current={i === active}
                  className="h-14 w-14 overflow-hidden rounded-lg flex-shrink-0 transition-[transform,opacity,box-shadow] duration-300"
                  style={{
                    opacity: i === active ? 1 : 0.45,
                    transform: i === active ? 'translateY(-2px)' : 'none',
                    boxShadow: i === active ? '0 0 0 2px var(--accent-soft), 0 8px 16px -8px rgba(58,102,160,0.5)' : '0 0 0 1px var(--bd2)',
                  }}>
                  <img src={src} alt="" aria-hidden className="h-full w-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/products/wax-block-spin.png'; }} />
                </button>
              ))}
            </div>
          )}

          {/* Price + buy */}
          <div className="mt-7">
            <p className="num text-[26px] font-bold leading-none" style={{ color: 'var(--tx1)' }}>{fmt(product.price)}</p>
            <div className="mt-4 max-w-[320px]">
              {canCheckout(product) ? (
                <AddToCartButton product={product} fullWidth />
              ) : (
                <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
                  {de ? 'Jetzt bei eBay kaufen' : 'Buy on eBay'} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="hidden lg:block text-[10px] tracking-[0.14em] uppercase" style={{ color: 'var(--txff)' }}>
          {de ? 'Made in Germany · Stuttgart' : 'Made in Germany · Stuttgart'}
        </p>
      </aside>

      {/* ── RIGHT — image stage ── */}
      <main className="relative flex-1 overflow-hidden h-[58vh] lg:h-full">
        <div className={`absolute inset-0 ${fit === 'frame' ? 'p-5 lg:p-9' : ''}`}>
          <div className={`relative h-full w-full overflow-hidden ${fit === 'frame' ? 'rounded-[20px]' : ''}`}
            style={fit === 'frame' ? { boxShadow: '0 40px 90px -34px rgba(16,16,19,0.45)', border: '1px solid var(--bd2)' } : undefined}>
            {/* Stacked images — display index visible */}
            {gallery.map((src, i) => (
              <img key={i} src={lg(src)} alt={i === display ? title : ''} aria-hidden={i !== display}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: product.imagePosition ?? 'center', opacity: i === display ? 1 : 0, transition: 'opacity 180ms linear' }}
                onError={e => { const t = e.target as HTMLImageElement; if (!t.src.includes('wax-block-spin')) t.src = src; }} />
            ))}
            {/* Column curtain */}
            <div ref={wipeRef} aria-hidden className="absolute inset-0 flex pointer-events-none" style={{ display: 'none' }}>
              {Array.from({ length: COLS }).map((_, i) => (
                <div key={i} data-col className="h-full flex-1 will-change-transform"
                  style={{ background: 'var(--pg)', borderRight: i < COLS - 1 ? '1px solid var(--bd2)' : undefined }} />
              ))}
            </div>
          </div>
        </div>

        {/* Top bar — cart (desktop) */}
        <div className="absolute top-6 right-6 z-20 hidden lg:block"><CartIcon /></div>

        {/* Numbered index rail */}
        {gallery.length > 1 && (
          <div className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-2.5">
            {gallery.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="num text-[12px] tabular-nums transition-all duration-300"
                style={{ color: i === active ? 'var(--tx1)' : 'var(--txff)', fontWeight: i === active ? 700 : 400, letterSpacing: '0.05em' }}>
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}

        {/* Fit toggle */}
        <div className="absolute left-5 bottom-5 z-20 flex items-center gap-1 rounded-full p-1"
          style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid var(--bd2)', backdropFilter: 'blur(8px)' }}>
          {(['full', 'frame'] as Fit[]).map(f => (
            <button key={f} onClick={() => setFit(f)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              style={{ background: fit === f ? 'var(--tx1)' : 'transparent', color: fit === f ? '#fff' : 'var(--txm)' }}>
              {f === 'full' ? (de ? 'Vollbild' : 'Full') : (de ? 'Rahmen' : 'Framed')}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
