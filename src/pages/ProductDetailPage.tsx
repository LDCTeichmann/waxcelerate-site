import { useParams, Link } from 'react-router-dom';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, ArrowRight, ExternalLink, Check,
  ChevronRight, ChevronLeft, ChevronDown, Star, Lightbulb, Truck,
} from 'lucide-react';
import { getProductById, products, canCheckout, checkoutEnabled } from '@/lib/data';
import type { Product } from '@/lib/data';
import { richContent } from '@/lib/productContent';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick } from '@/lib/analytics';
import { CartIcon } from '@/components/CartIcon';
import { ImageLightbox } from '@/components/ImageLightbox';
import { gsap } from '@/lib/gsap';
import { Footer } from '@/sections/footer';
import { getEstimatedDelivery } from '@/lib/utils';

const AUTO_INTERVAL = 5000;
const FADE_MS = 900;

const lg = (src: string) =>
  src.includes('/products/') && src.endsWith('.webp') && !src.endsWith('-lg.webp')
    ? src.replace('.webp', '-lg.webp')
    : src;

// Deckt sich exakt mit IMG_WIDTHS/srcSetFor in scripts/generate-product-html.mjs:
// tatsaechlich gemessene Pixelbreiten von Basis- und -lg-Datei je Bild
// (public/images/products/{classic,pro}/*.webp, vermessen am 05.08.2026 mit
// PIL). Ohne diese Tabelle wuerde JEDES Galeriebild — Mobile wie Desktop —
// immer die 2000px-lg-Variante laden, auch auf einem 390px-Handy (Audit vom
// 05.08.2026, Problem 3: bis zu 202 KB statt 107 KB pro Bild). Manche
// -lg-Dateien sind trotz Namens nicht groesser als die Basis (pro-3, pro-5,
// pro-6) — dort liefert srcSet zwei identische Kandidaten, kein Gewinn, aber
// auch kein Schaden. Neu vermessen, falls Dateien ausgetauscht werden:
//   python3 -c "from PIL import Image; import glob
//   [print(f, Image.open(f).size) for f in sorted(glob.glob('public/images/products/*/*.webp'))]"
const IMG_WIDTHS: Record<string, { base: number; lg: number }> = {
  'classic-1': { base: 1400, lg: 2000 },
  'classic-2': { base: 1400, lg: 2000 },
  'classic-3': { base: 1400, lg: 2000 },
  'classic-4': { base: 1400, lg: 2000 },
  'classic-5': { base: 1400, lg: 2000 },
  'classic-6': { base: 1400, lg: 2000 },
  'pro-1': { base: 1400, lg: 2000 },
  'pro-2': { base: 1400, lg: 2000 },
  'pro-3': { base: 1254, lg: 1254 },
  'pro-4': { base: 1400, lg: 1600 },
  'pro-5': { base: 1086, lg: 1086 },
  'pro-6': { base: 360, lg: 480 },
};

/** srcSet-Kandidatenliste, oder undefined fuer externe eBay-Kettenbilder (unbekannte Breiten). */
const srcSetFor = (src: string) => {
  const m = src.match(/(classic|pro)-\d(?=\.webp$)/);
  const w = m && IMG_WIDTHS[m[0]];
  if (!w) return undefined;
  return `${src} ${w.base}w, ${lg(src)} ${w.lg}w`;
};

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const product = id ? getProductById(id) : undefined;
  const de = lang === 'de';

  const [activeImage, setActiveImage] = useState(0);
  const [prevImage, setPrevImage] = useState(-1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showBuyBar, setShowBuyBar] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const [compatExpanded, setCompatExpanded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gallery = product ? [product.image, ...(product.images ?? [])] : [];
  const total = gallery.length;

  const goTo = useCallback((i: number) => {
    if (i === activeImage) return;
    setPrevImage(activeImage);
    setActiveImage(i);
  }, [activeImage]);

  // Reset gallery position when navigating to a different product — otherwise
  // an activeImage index left over from a longer gallery can point past the
  // end of a shorter one, and no image matches `i === activeImage` until the
  // auto-advance interval eventually wraps it back into range.
  useEffect(() => {
    setActiveImage(0);
    setPrevImage(-1);
    window.scrollTo(0, 0);
  }, [id]);

  const next = useCallback(() => {
    if (total <= 1) return;
    goTo((activeImage + 1) % total);
  }, [activeImage, total, goTo]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    goTo((activeImage - 1 + total) % total);
  }, [activeImage, total, goTo]);

  useEffect(() => {
    if (reduce || total <= 1) return;
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, AUTO_INTERVAL);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next, reduce, total]);

  const pause = useCallback(() => { pausedRef.current = true; }, []);
  const resume = useCallback(() => {
    pausedRef.current = false;
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, AUTO_INTERVAL);
  }, [next]);

  // Swipe/drag on the gallery image itself — until now the only way to
  // change images was clicking a dot or thumbnail; dragging the image did
  // nothing. Direction is decided on release (not live-following the
  // finger) to avoid fighting the existing cross-fade transition.
  const dragStartXRef = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 40;

  const onGalleryPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (total <= 1) return;
    dragStartXRef.current = e.clientX;
    pause();
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [total, pause]);

  const onGalleryPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const startX = dragStartXRef.current;
    dragStartXRef.current = null;
    if (startX === null) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) next(); else prev();
    }
    setTimeout(resume, AUTO_INTERVAL);
  }, [next, prev, resume]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNavSolid(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowBuyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.from(cardRef.current, { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 });
      }
    });
    return () => ctx.revert();
  }, [id, reduce]);

  // Must run unconditionally, before the `!product` early return below —
  // React requires the same hooks in the same order on every render, and
  // `id` can change from a valid to an invalid product between renders of
  // this same mounted component (client-side nav between product pages).
  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency', currency: 'EUR',
    }).format(price), [lang]);

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

  const rc = id ? richContent[id] : undefined;
  const isPro = product.variant === 'pro';
  const isClassic = product.variant === 'classic';
  const isWax = product.category === 'wax';
  const isChain = product.category === 'chain';
  const accentColor = isPro ? '#4A72D4' : 'var(--accent-soft)';
  const accentBg = isPro ? 'rgba(74,114,212,0.06)' : 'rgba(43,82,176,0.06)';
  const cardAccent = isPro ? '#4A72D4' : '#2B52B0';

  const highlights = de ? product.highlights : product.highlightsEn;
  const descriptionText = de ? product.description : product.descriptionEn;
  const titleText = de ? product.title : product.titleEn;

  const alternatives = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .filter(p => product.category === 'wax' ? p.category === 'wax' : true)
    .slice(0, 3);

  const related = products
    .filter(p => p.id !== product.id)
    .filter(p => product.category === 'wax' ? (p.category === 'chain' && !p.variant) : p.category === 'wax')
    .slice(0, 3);

  const pricePerApp = product.applications
    ? product.price / parseFloat(product.applications.split('–')[1] ?? product.applications)
    : null;

  // Same figures the homepage product cards already show (getEstimatedDelivery,
  // price-per-100g) — missing here, this was the one page where a buyer
  // couldn't see either before deciding.
  const deliveryDate = getEstimatedDelivery(lang);
  const grams = isWax && product.weight ? parseInt(product.weight) : 0;
  const per100g = grams > 0 ? `${(product.price / (grams / 100)).toFixed(2).replace('.', ',')} €/100g` : null;

  const cardBenefits = (highlights ?? []).filter(h => {
    const lower = h.toLowerCase();
    if (product.applications && lower.includes(product.applications.split('–')[0])) return false;
    return true;
  }).slice(0, 3);

  const specsData = [
    product.compatibility && { l: de ? 'Kompatibel' : 'Compatible', v: product.compatibility },
    product.weight && { l: de ? 'Gewicht' : 'Weight', v: product.weight },
    product.applications && { l: de ? 'Anwendungen' : 'Uses', v: product.applications },
    isWax && { l: de ? 'Verarbeitung' : 'Processing', v: '80–90°C' },
    product.chainLinks && { l: de ? 'Glieder' : 'Links', v: product.chainLinks },
    product.chainSpeed && { l: de ? 'Schaltung' : 'Speed', v: product.chainSpeed },
  ].filter(Boolean) as { l: string; v: string }[];

  const metaTitle = `${titleText} | Waxcelerate`;
  const metaDescription = descriptionText ?? '';
  const canonicalUrl = `https://waxcelerate.de/produkt/${id}`;

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: de ? 'Startseite' : 'Home', item: 'https://waxcelerate.de' },
      { '@type': 'ListItem', position: 2, name: titleText, item: canonicalUrl },
    ],
  });

  const productSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: titleText, description: descriptionText, image: product.image, sku: id,
    // Pre-waxed chains are Shimano/SRAM/YBN parts we resell, not our own
    // brand — asserting "Waxcelerate" as the manufacturer brand for a
    // Shimano CN-M9100 was factually wrong. Wax is genuinely our own product.
    brand: { '@type': 'Brand', name: product.category === 'chain' ? product.chainBrand! : 'Waxcelerate' },
    url: canonicalUrl,
    // No per-product aggregateRating: the "200+ reviews, 5.0" figure is
    // whole-account eBay seller feedback, not review data for this specific
    // SKU — reusing it verbatim as if genuine across 4 different wax pages
    // reads as templated/fake review markup to Google, which can strip
    // rich-result eligibility sitewide on manual action. The real number
    // still appears as visible on-page copy, just not asserted as
    // structured per-product review data it isn't.
    offers: {
      '@type': 'Offer', price: product.price.toFixed(2), priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock', url: canonicalUrl,
      seller: { '@type': 'Organization', name: 'Waxcelerate' }, priceValidUntil: '2026-12-31',
    },
  });

  const hasFormula = !!(isWax && rc?.formulaDetails);
  const hasVergleich = !!(rc?.compHeaders && rc?.compRows);
  const hasKosten = !!(rc?.oilItems && rc?.waxItems);
  const toggleAccordion = (key: string) => setOpenAccordion(prev => prev === key ? null : key);

  const scrollToDetails = () => {
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content={de ? 'de_DE' : 'en_US'} />
        {product.image && <meta property="og:image" content={product.image} />}
        <script type="application/ld+json">{breadcrumbSchema}</script>
        <script type="application/ld+json">{productSchema}</script>
      </Helmet>

      <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--pg)' }}>

        {/* ── NAV ── */}
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
          style={{
            background: navSolid ? 'var(--nav-bg)' : 'transparent',
            backdropFilter: navSolid ? 'blur(12px)' : 'none',
            borderBottom: navSolid ? '1px solid var(--bd)' : '1px solid transparent',
          }}>
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link to="/" className="flex-shrink-0 flex items-center" aria-label="Waxcelerate — Startseite">
                <img src="/images/logo-dark.png" alt="" className="h-8 w-auto" />
              </Link>
              {/* Breadcrumb — mirrors the breadcrumbSchema in <head>, which had
                  no visible on-page counterpart before this. */}
              <nav aria-label={de ? 'Brotkrümelnavigation' : 'Breadcrumb'}
                className="hidden sm:flex items-center gap-1.5 text-[13px] min-w-0">
                <Link to="/" className="flex-shrink-0 hover:underline transition-colors"
                  style={{ color: navSolid ? 'var(--txf)' : 'rgba(255,255,255,0.65)' }}>
                  {de ? 'Start' : 'Home'}
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50"
                  style={{ color: navSolid ? 'var(--txf)' : 'rgba(255,255,255,0.65)' }} />
                <Link to="/#produkte" className="flex-shrink-0 hover:underline transition-colors"
                  style={{ color: navSolid ? 'var(--txf)' : 'rgba(255,255,255,0.65)' }}>
                  {de ? 'Produkte' : 'Products'}
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50"
                  style={{ color: navSolid ? 'var(--txf)' : 'rgba(255,255,255,0.65)' }} />
                <span className="truncate font-medium" style={{ color: navSolid ? 'var(--tx1)' : '#fff' }}>
                  {titleText}
                </span>
              </nav>
              {/* Mobile — no room for the full breadcrumb, keep the simple back link */}
              <Link to="/" className="sm:hidden flex items-center gap-2 text-[13px] font-medium transition-colors flex-shrink-0"
                style={{ color: navSolid ? 'var(--txm)' : 'rgba(255,255,255,0.8)' }}>
                <ArrowLeft className="h-4 w-4" /> {de ? 'Zurück' : 'Back'}
              </Link>
            </div>
            {checkoutEnabled && <CartIcon />}
          </div>
        </header>

        {/* Mobile-Plan B7d: ohne <main> hatte diese Seite keinen Landmark,
            den Screenreader-Nutzer per "zum Inhalt springen" ansteuern
            koennen — sie mussten sich durch Header und Navigation tabben,
            bevor der eigentliche Produktinhalt beginnt. */}
        <main>
        {/* ══════════════════════════════════════════════════════════════
            MOBILE HERO — stacked: image top, info below
           ══════════════════════════════════════════════════════════════ */}
        <section className="lg:hidden">
          <div ref={heroRef} className="relative h-[54vh] min-h-[300px] overflow-hidden"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={onGalleryPointerDown} onPointerUp={onGalleryPointerUp}>
            {gallery.map((src, i) => (
              <img key={i} src={lg(src)} srcSet={srcSetFor(src)} sizes={srcSetFor(src) ? '100vw' : undefined}
                alt={i === activeImage ? titleText : ''} aria-hidden={i !== activeImage}
                loading={i === activeImage ? 'eager' : 'lazy'}
                fetchPriority={i === activeImage ? 'high' : undefined}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: product.imagePosition ?? 'center',
                  opacity: i === activeImage ? 1 : 0, scale: i === activeImage ? '1' : '1.04',
                  transition: reduce ? 'none' : `opacity ${FADE_MS}ms ease, scale ${FADE_MS * 2}ms ease`,
                  zIndex: i === activeImage ? 2 : (i === prevImage ? 1 : 0),
                }}
                onError={e => {
                  // Faellt auf die Basisdatei zurueck, falls die -lg-Variante fehlt.
                  // srcSet muss mit geleert werden: ist es gesetzt, waehlt der Browser
                  // beim naechsten Ladeversuch wieder daraus, egal was src sagt.
                  const t = e.target as HTMLImageElement;
                  if (!t.src.includes('wax-block-spin')) { t.removeAttribute('srcset'); t.src = src; }
                }}
              />
            ))}
            <div className="absolute inset-0 z-[3] pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.2) 0%, transparent 35%)' }} />
            {total > 1 && (
              <>
                <button onClick={() => { prev(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  aria-label={de ? 'Vorheriges Bild' : 'Previous image'}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.92)' }}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => { next(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  aria-label={de ? 'Nächstes Bild' : 'Next image'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.92)' }}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            {total > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button key={i} onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                    className="h-[2.5px] rounded-full transition-all duration-500"
                    style={{ width: i === activeImage ? 22 : 7, background: i === activeImage ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}
                    aria-label={`Image ${i + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="px-5 sm:px-8 py-6" style={{ background: 'var(--pg)' }}>
            <span className="text-small font-semibold uppercase tracking-[0.2em] block mb-2"
              style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
              {product.variant ? `${product.variant} · ${product.weight ?? ''}` : (product.chainSpeed ?? '')}
            </span>
            {/* The only <h1> in the DOM — the desktop hero below repeats this
                same title visually in its own card, but as a <p>, not a
                second <h1>. Both markups exist in the DOM at once (CSS
                hidden/lg:hidden toggles which one is visible, not conditional
                rendering), so only one may carry real heading semantics. */}
            <h1 className="font-display text-[26px] font-bold leading-[1.08] tracking-[-0.025em] mb-2" style={{ color: 'var(--tx1)' }}>{titleText}</h1>
            <p className="text-[13px] leading-[1.6] mb-4" style={{ color: 'var(--txm)' }}>{descriptionText}</p>

            {cardBenefits.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {cardBenefits.map((b, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <p className="text-[12px] leading-[1.5]" style={{ color: 'var(--txm)' }}>{b}</p>
                  </div>
                ))}
              </div>
            )}

            {(product.intervalDry || product.intervalWet) && (
              <div className="flex items-center gap-6 mb-4 pb-4" style={{ borderBottom: '1px solid var(--bd)' }}>
                {product.intervalDry && (
                  <div>
                    <p className="text-small uppercase tracking-[0.16em] mb-0.5" style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>{de ? 'Trocken' : 'Dry'}</p>
                    <p className="num text-[20px] font-bold leading-none" style={{ color: 'var(--tx1)' }}>{product.intervalDry}</p>
                  </div>
                )}
                {product.intervalDry && product.intervalWet && <div className="w-px h-8" style={{ background: 'var(--bd)' }} />}
                {product.intervalWet && (
                  <div>
                    <p className="text-small uppercase tracking-[0.16em] mb-0.5" style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>{de ? 'Nass' : 'Wet'}</p>
                    <p className="num text-[20px] font-bold leading-none" style={{ color: 'var(--tx1)' }}>{product.intervalWet}</p>
                  </div>
                )}
              </div>
            )}

            {total > 1 && (
              <div className="flex gap-2 mb-4">
                {gallery.slice(0, 6).map((src, i) => (
                  <button key={i} onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                    aria-label={`${titleText} — Bild ${i + 1}`} aria-current={i === activeImage}
                    className="h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300"
                    style={{ opacity: i === activeImage ? 1 : 0.35, boxShadow: i === activeImage ? '0 0 0 2px var(--tx1)' : '0 0 0 1px var(--bd)' }}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="num text-[28px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>{formatPrice(product.price)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {pricePerApp !== null && (
                    <p className="text-meta" style={{ color: 'var(--txff)' }}>~{formatPrice(pricePerApp)} / {de ? 'Anwendung' : 'use'}</p>
                  )}
                  {per100g && <p className="text-meta" style={{ color: 'var(--txff)' }}>{pricePerApp !== null ? '· ' : ''}{per100g}</p>}
                </div>
              </div>
              {canCheckout(product) ? <AddToCartButton product={product} /> : (
                <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-[13px] font-semibold active:scale-[0.97]"
                  style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
                  {de ? 'Kaufen' : 'Buy'} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Same delivery estimate the homepage product cards already show —
                this page had no delivery-date signal at all before. */}
            <div className="flex items-center gap-1.5 mb-5 text-meta" style={{ color: 'var(--txff)' }}>
              <Truck className="h-3 w-3 flex-shrink-0" style={{ color: accentColor }} aria-hidden />
              {de ? `Lieferung ${deliveryDate}` : `Delivery ${deliveryDate}`}
            </div>

            {(alternatives.length > 0 || related.length > 0) && (
              <div className="pt-4" style={{ borderTop: '1px solid var(--bd)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-small font-semibold uppercase tracking-[0.18em]"
                    style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                    {de ? 'Auch erhältlich' : 'Also available'}
                  </p>
                  <span className="text-meta" style={{ color: 'var(--txff)' }}>
                    ← {de ? 'wischen' : 'swipe'} →
                  </span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                  {[...alternatives, ...related].slice(0, 5).map(alt => <AltMiniCard key={alt.id} product={alt} de={de} formatPrice={formatPrice} />)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            DESKTOP HERO — full-bleed image, focused conversion card
           ══════════════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative h-screen min-h-[680px] overflow-hidden hidden lg:block"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onGalleryPointerDown} onPointerUp={onGalleryPointerUp}>
          {gallery.map((src, i) => (
            <img key={i} src={lg(src)} srcSet={srcSetFor(src)} sizes={srcSetFor(src) ? '100vw' : undefined}
              alt={i === activeImage ? titleText : ''} aria-hidden={i !== activeImage}
              loading={i === activeImage ? 'eager' : 'lazy'}
              fetchPriority={i === activeImage ? 'high' : undefined}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: product.imagePosition ?? 'center',
                opacity: i === activeImage ? 1 : 0, scale: i === activeImage ? '1' : '1.04',
                transition: reduce ? 'none' : `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1), scale ${FADE_MS * 2}ms cubic-bezier(0.4,0,0.2,1)`,
                zIndex: i === activeImage ? 2 : (i === prevImage ? 1 : 0),
              }}
              onError={e => {
                // Faellt auf die Basisdatei zurueck, falls die -lg-Variante fehlt.
                // srcSet muss mit geleert werden: ist es gesetzt, waehlt der Browser
                // beim naechsten Ladeversuch wieder daraus, egal was src sagt.
                const t = e.target as HTMLImageElement;
                if (!t.src.includes('wax-block-spin')) { t.removeAttribute('srcset'); t.src = src; }
              }}
            />
          ))}

          <div className="absolute inset-0 z-[3] pointer-events-none"
            style={{ background: 'linear-gradient(105deg, rgba(var(--scrim-rgb),0.55) 0%, rgba(var(--scrim-rgb),0.20) 28%, transparent 48%)' }} />
          <div className="absolute inset-0 z-[3] pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.25) 0%, transparent 30%)' }} />

          {/* ── MAIN CARD — focused conversion funnel ── */}
          <div ref={cardRef}
            className="absolute z-20 left-10 xl:left-14 top-1/2 -translate-y-1/2 w-[380px] xl:w-[400px]"
            onMouseEnter={pause} onMouseLeave={resume}>
            {/* No backdrop-filter: at 96% opacity there's only a 4% sliver of
                backdrop showing through, so a blur(40px) here cost real
                compositing work for a practically invisible effect. */}
            <div className="pdp-hero-card rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.96)',
                boxShadow: '0 24px 64px -16px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15)',
              }}>

              <div className="px-6 xl:px-7 pt-6 pb-5">
                {/* Eyebrow + bestseller badge */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-small font-semibold uppercase tracking-[0.2em]"
                    style={{ color: 'rgba(0,0,0,0.35)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                    {product.variant ? `${product.variant} · ${product.weight ?? ''}` : (product.chainSpeed ?? '')}
                  </span>
                  {isWax && product.weight === '500g' && (
                    <span className="text-meta font-bold uppercase tracking-[0.1em] px-1.5 py-[1px] rounded"
                      style={{ background: `${cardAccent}12`, color: cardAccent }}>
                      {de ? 'Bestseller' : 'Bestseller'}
                    </span>
                  )}
                </div>

                {/* Title — visually a duplicate of the mobile hero's <h1> above
                    (the mobile block is display:none, not unmounted, at this
                    viewport), so this one stays a <p> to avoid a second h1
                    landing in the DOM alongside it. */}
                <p className="font-display text-[26px] xl:text-[28px] font-bold leading-[1.06] tracking-[-0.03em] mb-4"
                  style={{ color: '#0a0a0a' }}>
                  {titleText}
                </p>

                {/* Benefits — tight, no circles */}
                {cardBenefits.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {cardBenefits.map((b, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 mt-px" style={{ color: cardAccent }} />
                        <p className="text-[12px] leading-[1.45]" style={{ color: 'rgba(0,0,0,0.52)' }}>{b}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Intervals */}
                {(product.intervalDry || product.intervalWet) && (
                  <div className="flex items-stretch gap-0 mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                    {product.intervalDry && (
                      <div className="flex-1 px-4 py-2" style={{ background: 'rgba(0,0,0,0.015)' }}>
                        <p className="text-small uppercase tracking-[0.18em] mb-0.5 font-semibold"
                          style={{ color: 'rgba(0,0,0,0.28)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                          {de ? 'Trocken' : 'Dry'}
                        </p>
                        <p className="num text-[18px] font-bold leading-none tracking-[-0.02em]" style={{ color: '#0a0a0a' }}>
                          {product.intervalDry}
                        </p>
                      </div>
                    )}
                    {product.intervalDry && product.intervalWet && <div className="w-px" style={{ background: 'rgba(0,0,0,0.06)' }} />}
                    {product.intervalWet && (
                      <div className="flex-1 px-4 py-2" style={{ background: 'rgba(0,0,0,0.015)' }}>
                        <p className="text-small uppercase tracking-[0.18em] mb-0.5 font-semibold"
                          style={{ color: 'rgba(0,0,0,0.28)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                          {de ? 'Nass' : 'Wet'}
                        </p>
                        <p className="num text-[18px] font-bold leading-none tracking-[-0.02em]" style={{ color: '#0a0a0a' }}>
                          {product.intervalWet}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Social proof — close to CTA for conversion */}
                {rc && rc.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex gap-px">
                      {[0, 1, 2, 3, 4].map(i => <Star key={i} className="h-3 w-3 fill-current" style={{ color: '#F5A623' }} />)}
                    </div>
                    <span className="text-meta font-medium" style={{ color: 'rgba(0,0,0,0.32)' }}>
                      {rc.reviewCount}+ {de ? 'zufriedene Kunden' : 'happy customers'}
                    </span>
                  </div>
                )}

                {/* Price block */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2.5">
                    <p className="num text-[28px] font-bold leading-none tracking-[-0.02em]" style={{ color: '#0a0a0a' }}>
                      {formatPrice(product.price)}
                    </p>
                    {pricePerApp !== null && (
                      <span className="text-meta font-medium" style={{ color: 'rgba(0,0,0,0.3)' }}>
                        ~{formatPrice(pricePerApp)}/{de ? 'Anw.' : 'use'}
                      </span>
                    )}
                    {per100g && (
                      <span className="text-meta font-medium" style={{ color: 'rgba(0,0,0,0.3)' }}>
                        {per100g}
                      </span>
                    )}
                  </div>
                  {rc?.savings && (
                    <p className="text-meta font-semibold mt-1" style={{ color: cardAccent }}>
                      {de ? `Spart ${rc.savings} vs. Kettenöl` : `Saves ${rc.savings} vs. chain oil`}
                    </p>
                  )}
                </div>

                {/* CTA — full width for maximum conversion */}
                <div className="mb-3">
                  {canCheckout(product) ? (
                    <div className="w-full"><AddToCartButton product={product} /></div>
                  ) : (
                    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[14px] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.01] active:scale-[0.97]"
                      style={{ background: '#0a0a0a', color: '#fff', boxShadow: '0 6px 24px -6px rgba(0,0,0,0.4)' }}>
                      {de ? 'Jetzt bestellen' : 'Order now'} <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  )}
                </div>

                {/* Trust signals — "Made in Germany" only for wax (our own
                    product); pre-waxed chains are resold Shimano/SRAM/YBN
                    parts, per the AGENTS.md rule this line wasn't following. */}
                <p className="text-meta text-center font-medium" style={{ color: 'rgba(0,0,0,0.3)' }}>
                  {isWax ? `${de ? 'Hergestellt in Stuttgart' : 'Made in Stuttgart'} · ` : ''}
                  {de ? `Lieferung ${deliveryDate}` : `Delivery ${deliveryDate}`}
                </p>
              </div>

              {/* Footer: spec pills + details link */}
              <div className="flex items-center justify-between px-6 xl:px-7 py-2.5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.015)' }}>
                <div className="flex flex-wrap gap-1.5">
                  {specsData.slice(0, 4).map((spec, i) => (
                    <span key={i} className="text-meta font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.35)' }}>
                      {spec.v}
                    </span>
                  ))}
                </div>
                <button onClick={scrollToDetails}
                  className="flex items-center gap-0.5 text-meta font-semibold flex-shrink-0 transition-colors hover:opacity-70"
                  style={{ color: cardAccent }}>
                  Details <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Thumbnail strip */}
            {total > 1 && (
              <div className="flex gap-1 mt-2.5">
                {gallery.slice(0, 6).map((src, i) => (
                  <button key={i} onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                    aria-label={`${titleText} — Bild ${i + 1}`} aria-current={i === activeImage}
                    className="h-11 flex-1 rounded-lg overflow-hidden transition-all duration-400"
                    style={{
                      opacity: i === activeImage ? 1 : 0.22,
                      boxShadow: i === activeImage ? '0 0 0 1.5px rgba(255,255,255,0.7)' : 'none',
                      transform: i === activeImage ? 'translateY(-1px)' : 'none',
                    }}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Recommendation strip — same column width, integrated feel */}
            {(alternatives.length > 0 || related.length > 0) && (
              <FlipCard items={[...alternatives, ...related].slice(0, 5)} de={de} formatPrice={formatPrice} />
            )}
          </div>

          {/* Number rail + prev/next arrows — the rail already let you jump to
              a specific image; there was no way to just step forward/back
              or drag the image itself. Arrows sit directly below the rail,
              same right-edge alignment, clear of both the card (left) and
              the "Mehr erfahren" hint (bottom-center). */}
          {total > 1 && (
            // Scrim pill behind the whole rail, not just per-number opacity tuning —
            // a light product photo (e.g. the pale wax block) behind translucent
            // white numbers left them barely legible regardless of how their own
            // opacity was tuned. A dedicated dark backdrop fixes contrast against
            // any photo, the same fix SectionDots already uses for its own dots.
            <div className="absolute right-6 xl:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2.5 px-2.5 py-3.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
              {gallery.map((_, i) => (
                <button key={i} onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  className="num text-[12px] tabular-nums transition-all duration-300 flex items-center justify-center"
                  style={{
                    minWidth: 24, minHeight: 24,
                    color: i === activeImage ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.62)',
                    fontWeight: i === activeImage ? 700 : 500,
                    letterSpacing: '0.05em',
                  }}>
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
              <div className="flex items-center gap-1 mt-0.5">
                {/* Visual circle stays compact; the button's own box is the full
                    44×44px WCAG 2.5.8 hit target (padding, not just the icon). */}
                <button onClick={() => { prev(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  aria-label={de ? 'Vorheriges Bild' : 'Previous image'}
                  className="w-11 h-11 flex items-center justify-center rounded-full transition-all hover:bg-white/15 active:scale-90"
                  style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => { next(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  aria-label={de ? 'Nächstes Bild' : 'Next image'}
                  className="w-11 h-11 flex items-center justify-center rounded-full transition-all hover:bg-white/15 active:scale-90"
                  style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Scroll hint */}
          <button onClick={scrollToDetails}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
            aria-label={de ? 'Mehr erfahren' : 'Learn more'}>
            <span className="text-small uppercase tracking-[0.14em] font-semibold" style={{ color: 'rgba(255,255,255,0.5)', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
              {de ? 'Mehr erfahren' : 'Learn more'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 pdp-bounce" style={{ color: 'rgba(255,255,255,0.4)', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.3))' }} />
          </button>
        </section>

        {/* Buy-bar scroll trigger */}
        <div ref={buyRef} className="h-0" />

        {/* ══════════════════════════════════════════════════════════════
            BELOW FOLD — Specs + Deep dive (all sizes)
           ══════════════════════════════════════════════════════════════ */}
        <section ref={detailRef} style={{ background: 'var(--pg)' }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12">
              <div>
                <p className="text-small font-semibold uppercase tracking-[0.14em] mb-3"
                  style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                  {de ? 'Spezifikationen' : 'Specifications'}
                </p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
                  {specsData.map((spec, i, arr) => (
                    <div key={i} className="flex items-baseline justify-between px-4 py-3"
                      style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd)' : 'none', background: i % 2 === 0 ? 'var(--sf2)' : 'var(--pg)' }}>
                      <span className="text-meta uppercase tracking-[0.14em]"
                        style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--txff)' }}>
                        {spec.l}
                      </span>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--tx1)' }}>
                        {spec.v}
                      </span>
                    </div>
                  ))}
                </div>
                {isClassic && (
                  <p className="text-[12px] mt-4" style={{ color: 'var(--txff)' }}>
                    {de ? 'Regen / Winter? ' : 'Rain / winter? '}
                    {/* Mobile-Plan B7e: axe-core misst hier nur 1.06:1 Kontrast
                        gegen den umgebenden Fliesstext (Linkfarbe accentColor
                        gegen --txff) — bei hover:underline war der Link ohne
                        Maus/Hover nur an der Farbe erkennbar, die dafuer nicht
                        reicht. underline statt hover:underline macht ihn
                        permanent auch ohne Farbkontrast als Link erkennbar,
                        gerade fuer Touch, wo hover nie greift. */}
                    <Link to={`/produkt/${product.weight === '500g' ? 'wax-500-mos2' : 'wax-300-mos2'}`}
                      className="underline underline-offset-2" style={{ color: accentColor }}>
                      Pro MoS₂ →
                    </Link>
                  </p>
                )}
              </div>

              {rc && (isWax ? (hasFormula || hasVergleich || hasKosten) : true) && (
                <div>
                  <p className="text-small font-semibold uppercase tracking-[0.14em] mb-3"
                    style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                    {de ? 'Im Detail' : 'Deep dive'}
                  </p>
                  {rc.hook && isChain && <p className="text-[13px] leading-[1.7] mb-3" style={{ color: 'var(--txm)' }}>{rc.hook}</p>}
                  <div className="space-y-2.5">
                    {hasFormula && rc.formulaDetails && (
                      <AccordionItem title={de ? 'Formel & Inhaltsstoffe' : 'Formula & Ingredients'}
                        subtitle={rc.formulaDetails.map(f => f.name).join(' · ')}
                        open={openAccordion === 'formula'} onToggle={() => toggleAccordion('formula')}>
                        <div className="space-y-3">
                          {rc.formulaDetails.map((f, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="num text-[18px] font-bold leading-none flex-shrink-0 w-6 pt-0.5" style={{ color: 'var(--bd2)' }}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <p className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--tx1)' }}>{f.name}</p>
                                <p className="text-[12px] leading-[1.65]" style={{ color: 'var(--txm)' }}>{f.detail}</p>
                              </div>
                            </div>
                          ))}
                          {rc.techNote && (
                            <div className="rounded-lg p-3 mt-2" style={{ background: accentBg }}>
                              <p className="text-small font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: accentColor }}>{rc.techNote.title}</p>
                              <p className="text-meta leading-[1.65]" style={{ color: 'var(--txm)' }}>{rc.techNote.body}</p>
                            </div>
                          )}
                        </div>
                      </AccordionItem>
                    )}
                    {hasVergleich && rc.compHeaders && rc.compRows && (
                      <AccordionItem title={de ? 'Vergleich' : 'Comparison'}
                        subtitle={rc.compHeaders.join(' vs. ')}
                        open={openAccordion === 'vergleich'} onToggle={() => toggleAccordion('vergleich')}>
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
                          <div className="grid text-meta font-semibold uppercase tracking-wider px-3 py-2.5"
                            style={{ gridTemplateColumns: `1.4fr repeat(${rc.compHeaders.length}, 1fr)`, background: 'var(--sf2)', borderBottom: '1px solid var(--bd)', color: 'var(--txff)' }}>
                            <span />
                            {rc.compHeaders.map((h, i) => (
                              <span key={i} className="text-center leading-tight text-meta">
                                {h.replace('Waxcelerate ', '').replace('-Heißwachs', '')}
                              </span>
                            ))}
                          </div>
                          {rc.compRows.map((row, ri) => (
                            <div key={ri} className="grid px-3 py-2.5 text-meta"
                              style={{ gridTemplateColumns: `1.4fr repeat(${rc.compHeaders!.length}, 1fr)`, borderBottom: ri < rc.compRows!.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                              <span style={{ color: 'var(--txm)' }}>{row.label}</span>
                              {row.cols.map((col, ci) => (
                                <span key={ci} className="text-center font-medium"
                                  style={{ color: ci === row.winCol ? accentColor : row.dimCols?.includes(ci) ? 'var(--txff)' : 'var(--tx2)' }}>
                                  {col}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </AccordionItem>
                    )}
                    {hasKosten && rc.oilItems && rc.waxItems && (
                      <AccordionItem title={de ? 'Kostenvergleich' : 'Cost comparison'}
                        subtitle={rc.savings ? `${de ? 'Ersparnis' : 'Savings'}: ${rc.savings}` : ''}
                        open={openAccordion === 'kosten'} onToggle={() => toggleAccordion('kosten')}>
                        <div className="space-y-3">
                          {rc.costExample && <p className="text-[12px] leading-relaxed mb-2" style={{ color: 'var(--txm)' }}>{rc.costExample}</p>}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-lg p-3" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
                              <p className="text-meta font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--txff)' }}>
                                {rc.oilCount ? `${rc.oilCount} ${rc.oilLabel}` : de ? 'Kettenöl' : 'Chain oil'}
                              </p>
                              {rc.oilItems.map((item, i) => (
                                <div key={i} className="flex justify-between text-meta py-1" style={{ borderBottom: '1px solid var(--bd)' }}>
                                  <span style={{ color: 'var(--txm)' }}>{item.label}</span>
                                  <span className="font-mono text-meta" style={{ color: 'var(--tx2)' }}>{item.cost}</span>
                                </div>
                              ))}
                              <div className="flex justify-between items-baseline pt-2 mt-1">
                                <span className="text-meta font-semibold uppercase" style={{ color: 'var(--txff)' }}>{de ? 'Gesamt' : 'Total'}</span>
                                <span className="num text-[16px] font-bold" style={{ color: 'var(--txm)' }}>{rc.oilTotal}</span>
                              </div>
                            </div>
                            <div className="rounded-lg p-3" style={{ background: accentBg, border: `1px solid ${cardAccent}18` }}>
                              <p className="text-meta font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: cardAccent }}>
                                {rc.waxCount ? `${rc.waxCount} ${rc.waxLabel}` : 'Waxcelerate'}
                              </p>
                              {rc.waxItems.map((item, i) => (
                                <div key={i} className="flex justify-between text-meta py-1" style={{ borderBottom: `1px solid ${cardAccent}12` }}>
                                  <span style={{ color: 'var(--txm)' }}>{item.label}</span>
                                  <span className="font-mono text-meta" style={{ color: 'var(--tx2)' }}>{item.cost}</span>
                                </div>
                              ))}
                              <div className="flex justify-between items-baseline pt-2 mt-1">
                                <span className="text-meta font-semibold uppercase" style={{ color: cardAccent }}>{de ? 'Gesamt' : 'Total'}</span>
                                <span className="num text-[16px] font-bold" style={{ color: 'var(--tx1)' }}>{rc.waxTotal}</span>
                              </div>
                            </div>
                          </div>
                          {rc.savings && (
                            <div className="rounded-lg p-3 flex items-center justify-between gap-3" style={{ background: accentBg }}>
                              <p className="text-meta" style={{ color: 'var(--txm)' }}>{de ? 'Ersparnis ~12.000 km' : 'Savings ~12,000 km'}</p>
                              <span className="num text-[20px] font-bold flex-shrink-0" style={{ color: accentColor }}>{rc.savings}</span>
                            </div>
                          )}
                        </div>
                      </AccordionItem>
                    )}
                    {rc && isChain && (
                      <>
                        {rc.chainSpec && (
                          <AccordionItem title={de ? 'Technische Daten' : 'Technical specs'} subtitle="" open={openAccordion === 'chainspec'} onToggle={() => toggleAccordion('chainspec')}>
                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
                              {Object.entries(rc.chainSpec).map(([key, val], i, arr) => (
                                <div key={key} className="flex gap-4 px-3 py-2.5 text-meta"
                                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd)' : 'none', background: i % 2 === 0 ? 'var(--sf2)' : 'var(--pg)' }}>
                                  <span className="w-28 flex-shrink-0" style={{ color: 'var(--txff)' }}>{key}</span>
                                  <span style={{ color: 'var(--txm)' }}>{val}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionItem>
                        )}
                        {rc.processSteps && rc.v9Bullets && (
                          <AccordionItem title={de ? 'Wachsprozess & V9 MoS₂' : 'Wax process & V9 MoS₂'} subtitle={de ? 'Ultraschall · MoS₂-Transferfilm' : 'Ultrasonic · MoS₂ transfer film'} open={openAccordion === 'v9'} onToggle={() => toggleAccordion('v9')}>
                            <div className="space-y-4">
                              {rc.processSteps.map(step => (
                                <div key={step.n} className="flex gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full text-meta font-bold flex items-center justify-center" style={{ background: accentBg, color: accentColor }}>{step.n}</span>
                                  <div>
                                    <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'var(--tx1)' }}>{step.title}</p>
                                    <p className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>{step.body}</p>
                                  </div>
                                </div>
                              ))}
                              {rc.v9Bullets.map((b, i) => (
                                <div key={i} className="flex gap-2.5">
                                  <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                                  <div>
                                    <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'var(--tx1)' }}>{b.title}</p>
                                    <p className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>{b.body}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionItem>
                        )}
                        {rc.chainCompRows && (
                          <AccordionItem title={de ? 'Vorgewachst vs. Kettenöl' : 'Pre-waxed vs. chain oil'} subtitle="" open={openAccordion === 'chaincomp'} onToggle={() => toggleAccordion('chaincomp')}>
                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
                              <div className="grid grid-cols-3 text-meta font-semibold uppercase tracking-wider px-3 py-2" style={{ borderBottom: '1px solid var(--bd)', background: 'var(--sf2)' }}>
                                <span /><span className="text-center" style={{ color: accentColor }}>{de ? 'Vorgewachst' : 'Pre-waxed'}</span><span className="text-center" style={{ color: 'var(--txff)' }}>{de ? 'Kettenöl' : 'Chain oil'}</span>
                              </div>
                              {rc.chainCompRows.map((row, ri) => (
                                <div key={ri} className="grid grid-cols-3 px-3 py-2 text-meta" style={{ borderBottom: '1px solid var(--bd)' }}>
                                  <span style={{ color: 'var(--txm)' }}>{row.label}</span>
                                  <span className="text-center font-medium" style={{ color: accentColor }}>{row.good}</span>
                                  <span className="text-center" style={{ color: 'var(--txff)' }}>{row.bad}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionItem>
                        )}
                        {rc.proTip && (
                          <div className="pl-3 mt-3" style={{ borderLeft: `2px solid ${accentColor}` }}>
                            <p className="text-small font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: accentColor }}>{de ? 'Pro-Tipp' : 'Pro tip'}</p>
                            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--txm)' }}>{rc.proTip}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Trust ── */}
        {rc && (
          <section style={{ background: 'var(--sf2)' }}>
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                {rc.reviewCount > 0 && (
                  <div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[0, 1, 2, 3, 4].map(i => <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#F5A623' }} />)}
                    </div>
                    <p className="font-display text-[28px] font-bold leading-none tracking-[-0.02em] mb-1" style={{ color: 'var(--tx1)' }}>{rc.reviewCount}+</p>
                    <p className="text-[13px] mb-0.5" style={{ color: 'var(--txm)' }}>{de ? 'verifizierte Bewertungen' : 'verified reviews'}</p>
                    {rc.reviewCats && <p className="text-meta mb-3" style={{ color: 'var(--txff)' }}>{rc.reviewCats}</p>}
                    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)} className="inline-flex items-center gap-1 text-[12px] font-medium hover:underline" style={{ color: accentColor }}>
                      {de ? 'Alle Bewertungen ansehen' : 'See all reviews'} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {rc.compatTags && rc.compatTags.length > 0 && (
                  <div>
                    <p className="text-small font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>{de ? 'Kompatibilität' : 'Compatibility'}</p>
                    <h2 className="font-display text-[17px] font-bold tracking-[-0.02em] mb-4" style={{ color: 'var(--tx1)' }}>
                      {de ? 'Funktioniert mit allen großen Marken' : 'Works with all major brands'}
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {rc.compatTags[0].map(tag => (
                        <span key={tag} className="text-meta px-2.5 py-1 rounded-full font-medium" style={{ color: 'var(--tx2)', background: 'var(--pg)', border: '1px solid var(--bd)' }}>{tag}</span>
                      ))}
                    </div>
                    {rc.compatTags.length > 1 && (
                      <>
                        {compatExpanded && rc.compatTags.slice(1).map((group, gi) => (
                          <div key={gi} className="flex flex-wrap gap-1.5 mt-1.5">
                            {group.map(tag => <span key={tag} className="text-meta px-2 py-0.5 rounded-full" style={{ color: 'var(--txm)', background: 'var(--pg)', border: '1px solid var(--bd)' }}>{tag}</span>)}
                          </div>
                        ))}
                        <button onClick={() => setCompatExpanded(v => !v)} className="text-meta mt-2 font-medium" style={{ color: accentColor }}>
                          {compatExpanded ? (de ? 'Weniger' : 'Less') : (de ? '+ alle anzeigen' : '+ show all')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {rc.footerNote && <p className="mt-12 text-meta leading-relaxed pt-5" style={{ borderTop: '1px solid var(--bd)', color: 'var(--txff)' }}>{rc.footerNote}</p>}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section style={{ background: 'var(--pg)' }}>
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
            {isWax && product.weight === '300g' && (
              <div className="rounded-xl p-4 flex items-start gap-3 text-left mb-8 max-w-xl mx-auto" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
                <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                <div>
                  <p className="text-[13px]" style={{ color: 'var(--txm)' }}>{de ? 'Fährst du mehr als einmal pro Woche? Der 500g-Block ist günstiger pro Anwendung.' : 'Riding more than once a week? The 500g block works out cheaper per application.'}</p>
                  <Link to={`/produkt/${product.variant === 'pro' ? 'wax-500-mos2' : 'wax-500'}`} className="inline-flex items-center gap-1 mt-1.5 text-[12px] font-medium hover:underline" style={{ color: accentColor }}>
                    {de ? '500g ansehen' : 'View 500g'} <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
            <h2 className="font-display text-[22px] sm:text-[28px] font-bold mb-5 tracking-[-0.025em]" style={{ color: 'var(--tx1)' }}>{titleText}</h2>
            <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}
              className="inline-flex items-center gap-2 px-9 py-3.5 rounded-full text-[14px] font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
              {de ? 'Jetzt kaufen' : 'Buy now'} — {formatPrice(product.price)} <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* ── Related ── */}
        {related.length > 0 && (
          <section style={{ background: 'var(--sf2)', borderTop: '1px solid var(--bd)' }}>
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
              <p className="text-small font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>{de ? 'Weitere Produkte' : 'More products'}</p>
              <h2 className="font-display text-[18px] sm:text-[22px] font-bold tracking-[-0.02em] mb-8" style={{ color: 'var(--tx1)' }}>{de ? 'Passend dazu' : 'You might also like'}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map(p => <RelatedCard key={p.id} product={p} de={de} formatPrice={formatPrice} />)}
              </div>
            </div>
          </section>
        )}
        </main>

        <Footer />
      </div>

      {/* Sticky buy-bar. Mobile-Plan B2/A-Stufe: im eingefahrenen Zustand trug
          dieser Container nur aria-hidden="true", der eBay-Link (oder
          AddToCartButton) blieb per Tab erreichbar — ein unsichtbares
          Element, das trotzdem den Fokus bekommt. inert deckt beide
          moeglichen Kind-Buttons ab (eBay-Link ohne Checkout, AddToCartButton
          mit), ohne dass jedes einzeln ein tabIndex bräuchte. */}
      <div className={`fixed bottom-0 inset-x-0 z-50 ${showBuyBar ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--bd)', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', transition: 'transform 320ms cubic-bezier(0.22,1,0.36,1)' }}
        aria-hidden={!showBuyBar} inert={!showBuyBar}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-2.5 flex items-center gap-4">
          <img src={gallery[0]} alt="" aria-hidden className="w-10 h-10 rounded-xl object-cover flex-shrink-0 hidden sm:block" style={{ border: '1px solid var(--bd)' }}
            onError={e => { (e.target as HTMLImageElement).src = '/images/products/wax-block-spin.webp'; }} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--tx1)' }}>{titleText}</p>
            <p className="num text-[15px] font-bold leading-none mt-0.5" style={{ color: 'var(--tx1)' }}>{formatPrice(product.price)}</p>
          </div>
          {canCheckout(product) ? <div className="flex-shrink-0"><AddToCartButton product={product} size="sm" /></div> : (
            <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-semibold flex-shrink-0 active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
              {de ? 'Kaufen' : 'Buy'} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {lightboxOpen && <ImageLightbox images={gallery} activeIndex={activeImage} onClose={() => setLightboxOpen(false)} onChange={(i) => setActiveImage(i)} alt={titleText} />}

      <style>{`
        @keyframes pdp-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes pdp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
        .pdp-bounce { animation: pdp-float 2.5s ease-in-out infinite; }
        .pdp-card-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.06) transparent; }
        .pdp-card-scroll::-webkit-scrollbar { width: 3px; }
        .pdp-card-scroll::-webkit-scrollbar-track { background: transparent; }
        .pdp-card-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 3px; }
      `}</style>
    </>
  );
}

/* ── Recommendation strip (desktop hero, inside card column) ── */
function FlipCard({ items, de, formatPrice }: { items: Product[]; de: boolean; formatPrice: (n: number) => string }) {
  const [active, setActive] = useState(0);
  const count = items.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((dir: number) => {
    setActive(p => (p + dir + count) % count);
  }, [count]);

  const startCycle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(1), 3000);
  }, [go]);

  const stopCycle = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => stopCycle(), [stopCycle]);

  if (count === 0) return null;

  const p = items[active];
  const title = de ? p.title : p.titleEn;
  const short = title.replace('Kettenwachs ', '').replace('Chain Wax ', '');
  const isChainItem = p.category === 'chain';
  const label = isChainItem
    ? (de ? 'Passende Kette' : 'Matching chain')
    : (de ? 'Auch erhältlich' : 'Also available');

  const linkContent = (
    <div className="flex items-center gap-3 flex-1 min-w-0 py-2.5 px-1 transition-opacity hover:opacity-90">
      <img src={p.image} alt={title} loading="lazy"
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
        style={{ objectPosition: p.imagePosition ?? 'center', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.3)' }} />
      <div className="min-w-0 flex-1">
        <p className="text-meta uppercase tracking-[0.14em] font-semibold mb-0.5"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          {label}
        </p>
        <p className="text-[13px] font-semibold truncate leading-tight"
          style={{ color: 'rgba(255,255,255,0.85)' }}>
          {short}
        </p>
        <p className="num text-[13px] font-bold mt-0.5"
          style={{ color: 'rgba(255,255,255,0.5)' }}>
          {formatPrice(p.price)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="mt-2.5 rounded-2xl overflow-hidden"
      onMouseEnter={startCycle} onMouseLeave={stopCycle}
      style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.25)',
      }}>
      <div className="flex items-center gap-0.5 px-2">
        <button onClick={() => go(-1)}
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          aria-label={de ? 'Vorheriges' : 'Previous'}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {p.category === 'wax' ? (
          <Link to={`/produkt/${p.id}`} className="flex-1 min-w-0">
            {linkContent}
          </Link>
        ) : (
          <a href={p.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(p.id)} className="flex-1 min-w-0">
            {linkContent}
          </a>
        )}

        <button onClick={() => go(1)}
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          aria-label={de ? 'Nächstes' : 'Next'}>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1 pb-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="h-[2px] rounded-full transition-all duration-300"
            style={{
              width: i === active ? 14 : 4,
              background: i === active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)',
            }}
            aria-label={`Product ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

/* ── Alternative mini-card (mobile) ── */
function AltMiniCard({ product: p, de, formatPrice }: { product: Product; de: boolean; formatPrice: (n: number) => string }) {
  const title = de ? p.title : p.titleEn;
  const shortTitle = title.replace('Kettenwachs ', '').replace('Chain Wax ', '');
  const isChainItem = p.category === 'chain';
  const label = isChainItem ? (de ? 'Kette' : 'Chain') : '';

  const inner = (
    <div className="group w-[140px] rounded-xl overflow-hidden snap-start transition-all duration-300 active:scale-[0.97]"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--bd)',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
      }}>
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'var(--sf2)' }}>
        <img src={p.image} alt={title} loading="lazy"
          className="h-full w-full object-cover"
          style={{ objectPosition: p.imagePosition ?? 'center' }} />
        {label && (
          <span className="absolute top-1.5 left-1.5 text-meta font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-md"
            style={{ background: 'var(--chip-bg)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}>
            {label}
          </span>
        )}
      </div>
      <div className="px-2.5 py-2">
        <p className="text-meta font-semibold leading-tight truncate" style={{ color: 'var(--tx1)' }}>{shortTitle}</p>
        <p className="num text-meta mt-0.5" style={{ color: 'var(--txff)' }}>{formatPrice(p.price)}</p>
      </div>
    </div>
  );

  if (p.category === 'wax') return <Link to={`/produkt/${p.id}`} className="block flex-shrink-0">{inner}</Link>;
  return <a href={p.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(p.id)} className="block flex-shrink-0">{inner}</a>;
}

/* ── Accordion ── */
function AccordionItem({ title, subtitle, open, onToggle, children }: {
  title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden transition-shadow duration-300"
      style={{ border: '1px solid var(--bd)', background: 'var(--pg)', boxShadow: open ? '0 2px 8px rgba(0,0,0,0.04)' : 'none' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--tx1)' }}>{title}</p>
          {subtitle && !open && <p className="text-meta mt-0.5 truncate" style={{ color: 'var(--txff)' }}>{subtitle}</p>}
        </div>
        <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: 'var(--txff)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <div className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--bd)' }}>
            <div className="pt-3">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Related card ── */
function RelatedCard({ product: p, de, formatPrice }: { product: Product; de: boolean; formatPrice: (n: number) => string }) {
  const title = de ? p.title : p.titleEn;
  const desc = de ? p.description : p.descriptionEn;
  const isWax = p.category === 'wax';
  const eyebrow = isWax ? [p.variant, p.weight].filter(Boolean).join(' · ').toUpperCase() : (p.chainSpeed ?? (de ? 'Kette' : 'Chain')).toUpperCase();

  const inner = (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-md"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', transform: 'translateZ(0)' }}>
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'var(--sf2)' }}>
        <img src={p.image} alt={title} loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          style={{ objectPosition: p.imagePosition ?? 'center' }} />
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-small font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--accent-soft)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>{eyebrow}</span>
        <p className="font-display mt-1 text-[14px] leading-snug" style={{ color: 'var(--tx1)' }}>{title}</p>
        <p className="mt-1 text-meta leading-relaxed line-clamp-2 hidden sm:block" style={{ color: 'var(--txm)' }}>{desc}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="num text-[14px] font-semibold" style={{ color: 'var(--tx1)' }}>{formatPrice(p.price)}</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-[var(--accent-soft)] group-hover:text-white"
            style={{ border: '1px solid var(--bd)', color: 'var(--accent-soft)' }}>
            {isWax ? <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /> : <ExternalLink className="h-3 w-3" />}
          </span>
        </div>
      </div>
    </div>
  );

  if (isWax) return <Link to={`/produkt/${p.id}`} className="block h-full">{inner}</Link>;
  return <a href={p.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(p.id)} className="block h-full">{inner}</a>;
}
