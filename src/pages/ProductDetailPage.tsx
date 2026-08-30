import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, ArrowRight, ExternalLink, Check,
  ChevronRight, ChevronLeft, ChevronDown, Star, Lightbulb, Truck, RotateCcw, BadgeCheck,
} from 'lucide-react';
import { getProductById, products, canCheckout, checkoutEnabled, isSoldOut, schemaAvailability, waxIntervals, shipping } from '@/lib/data';
import type { Product } from '@/lib/data';
import { loadRidingProfile, weeksRemainingForProduct } from '@/lib/ridingProfile';
import { richContent } from '@/lib/productContent';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick } from '@/lib/analytics';
import { CartIcon } from '@/components/CartIcon';
import { ImageLightbox } from '@/components/ImageLightbox';
import { gsap } from '@/lib/gsap';
import { Footer } from '@/sections/footer';
import { getEstimatedDelivery, removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { reviewsForProduct, type Review } from '@/sections/reviews';
import { Stars } from '@/components/Stars';

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
// Re-measured 2026-08-18 after all 12 source photos were replaced (see
// raw-image-library/products/ for the originals). Several new sources are
// themselves under 2000px, so base and lg collapse to the same width for
// those — not a bug, just what the actual file is.
const IMG_WIDTHS: Record<string, { base: number; lg: number }> = {
  'classic-1': { base: 1400, lg: 2000 },
  'classic-2': { base: 1400, lg: 1600 },
  'classic-3': { base: 1400, lg: 1600 },
  'classic-4': { base: 1400, lg: 2000 },
  'classic-5': { base: 1387, lg: 1387 },
  'classic-6': { base: 1400, lg: 2000 },
  'pro-1': { base: 1400, lg: 2000 },
  'pro-2': { base: 1400, lg: 2000 },
  'pro-3': { base: 1400, lg: 2000 },
  'pro-4': { base: 1400, lg: 2000 },
  'pro-5': { base: 1254, lg: 1254 },
  'pro-6': { base: 1400, lg: 2000 },
};

/** srcSet-Kandidatenliste, oder undefined fuer externe eBay-Kettenbilder (unbekannte Breiten). */
const srcSetFor = (src: string) => {
  const m = src.match(/(classic|pro)-\d(?=\.webp$)/);
  const w = m && IMG_WIDTHS[m[0]];
  if (!w) return undefined;
  return `${src} ${w.base}w, ${lg(src)} ${w.lg}w`;
};

/** One optional video gallery slide (dip-wax process clip). No product sets
    this yet — this component only ever runs once one does. Play/pause is
    imperative (not the `autoPlay` attribute) because every slide stays
    mounted for the crossfade, so a slide becoming active later needs an
    explicit .play() rather than relying on a mount-time-only attribute.
    A dedicated component (not an inline branch in the .map() below) is what
    lets this hook live outside the .map() callback itself, per this repo's
    own "no hooks in .map()" rule. */
function VideoGallerySlide({ src, poster, active, inView, reduce, style }: {
  src: string; poster: string; active: boolean; inView: boolean; reduce: boolean; style: React.CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;
    if (active && inView) v.play().catch(() => {}); else v.pause();
  }, [active, inView, reduce]);

  if (reduce) {
    return <img src={poster} alt="" aria-hidden={!active} draggable={false}
      className="absolute inset-0 h-full w-full object-cover" style={style} />;
  }
  return (
    <video ref={videoRef} src={src} poster={poster} muted playsInline loop aria-hidden={!active}
      className="absolute inset-0 h-full w-full object-cover" style={style} />
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const navigate = useNavigate();
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

  // `slides` extends `gallery` with an optional trailing video slide, used
  // only by the two hero crossfade stages and their nav (dots/arrows/swipe/
  // autoplay) below — thumbnail strips deliberately keep using `gallery`/
  // `total` directly and stay image-only (a video thumbnail would need its
  // own poster-crop treatment, not built here). No product sets `videoSlide`
  // today, so `slides`/`slideCount` are identical to `gallery`/`total` for
  // every real product right now — this is inert until one does.
  type Slide = { type: 'image'; src: string } | { type: 'video'; src: string; poster: string };
  const slides: Slide[] = [
    ...gallery.map((src): Slide => ({ type: 'image', src })),
    ...(product?.videoSlide ? [{ type: 'video', ...product.videoSlide } as Slide] : []),
  ];
  const slideCount = slides.length;

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
    if (slideCount <= 1) return;
    goTo((activeImage + 1) % slideCount);
  }, [activeImage, slideCount, goTo]);

  const prev = useCallback(() => {
    if (slideCount <= 1) return;
    goTo((activeImage - 1 + slideCount) % slideCount);
  }, [activeImage, slideCount, goTo]);

  useEffect(() => {
    if (reduce || slideCount <= 1) return;
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, AUTO_INTERVAL);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next, reduce, slideCount]);

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
  const dragTargetImgRef = useRef(false);
  const SWIPE_THRESHOLD = 40;

  const onGalleryPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Captured here, before setPointerCapture below retargets every later
    // pointer/mouse/click event on this container to the container itself —
    // a plain onClick on the <img> never fires once the pointer is captured
    // (verified: Chromium redirects the compatibility click event to the
    // capturing element), which is why the lightbox trigger had no working
    // way to attach directly to the image. This is the only point in the
    // gesture where the real target (image vs. a thumbnail/dot button) is
    // still observable.
    const target = e.target as HTMLElement;
    const isButton = !!target.closest('button');
    // Thumbnails/dots/arrows are <button> elements nested inside this same
    // pointer-handled container — capturing the pointer here would silently
    // break their own onClick (verified: once captured, Chromium retargets
    // the compatibility click event to the capturing element, so the
    // button's onClick never fires). Bailing out before capture for any
    // button-descendant target lets those buttons keep handling their own
    // clicks natively, exactly as before this gallery had any pointer
    // handling at all.
    dragTargetImgRef.current = target.tagName === 'IMG' && !isButton;
    if (isButton || slideCount <= 1) return;
    dragStartXRef.current = e.clientX;
    pause();
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [slideCount, pause]);

  const onGalleryPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const wasImgTap = dragTargetImgRef.current;
    const startX = dragStartXRef.current;
    dragStartXRef.current = null;
    if (startX === null) {
      // slideCount <= 1: no swipe/autoplay wiring ran on pointerdown above,
      // but a single-image product should still open the lightbox on tap.
      if (wasImgTap) setLightboxOpen(true);
      return;
    }
    const delta = e.clientX - startX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) next(); else prev();
    } else if (wasImgTap) {
      setLightboxOpen(true);
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

  // Prerendered HTML for this route already ships this same Product +
  // BreadcrumbList JSON-LD; without this, Helmet's copy below just piles on
  // top of it (see removeStaticJsonLd in src/lib/utils.ts). Same story for
  // the title/description/canonical/og/twitter tags Helmet sets further
  // down (see removeStaticHeadMeta).
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, [id]);

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
  const productReviews = reviewsForProduct(product.id);
  // Only ever reads a profile — never writes one, so this can't desync
  // whatever the calculator (tools.tsx) itself relies on. Never shown for
  // chains, and never fabricated for a first-time visitor: if nothing was
  // ever persisted, ridingProfile is null and the line below simply doesn't
  // render, exactly like every other optional block on this page.
  const ridingProfile = isWax ? loadRidingProfile() : null;
  const personalizedWeeks = ridingProfile
    ? weeksRemainingForProduct(product.applications, waxIntervals, ridingProfile)
    : null;
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

  // Deckt sich mit titleOf()/descriptionOf() in generate-product-html.mjs —
  // vorher wich sowohl Titel ("kaufen" fehlte hier) als auch Beschreibung
  // (kein Preis-/Versand-Zusatz, keine 160-Zeichen-Kuerzung) zwischen dem
  // vorgerenderten HTML und der von Helmet nachtraeglich gesetzten Version
  // ab — zwei verschiedene Snippets fuer dieselbe URL, je nachdem, ob ein
  // Crawler JS ausfuehrt (Audit ProductDetailPage.tsx, Problem 6).
  const metaTitle = `${titleText} kaufen | Waxcelerate`;
  const priceStr = product.price.toFixed(2).replace('.', ',');
  const descBase = (descriptionText ?? '').replace(/\s+/g, ' ').trim();
  const descSuffix = de ? ` ${priceStr} €, versandkostenfrei ab 50 €.` : ` €${priceStr}, free shipping from €50.`;
  const descRoom = 160 - descSuffix.length;
  const descHead = descBase.length > descRoom ? `${descBase.slice(0, descRoom - 1).trimEnd()}…` : descBase;
  const metaDescription = descHead + descSuffix;
  const canonicalUrl = `https://waxcelerate.de/produkt/${id}`;
  const absImg = (src: string) => (src?.startsWith('http') ? src : `https://waxcelerate.de${src}`);
  const absImage = absImg(product.image);

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: de ? 'Startseite' : 'Home', item: 'https://waxcelerate.de' },
      { '@type': 'ListItem', position: 2, name: titleText, item: canonicalUrl },
    ],
  });

  // Deckt sich mit productSchema() in generate-product-html.mjs. Vorher war
  // diese Fassung deutlich duenner (kein mpn/category/shippingDetails/
  // hasMerchantReturnPolicy/itemCondition/Pro-additionalProperty) — und weil
  // removeStaticJsonLd() das reichere vorgerenderte Schema beim Mounten
  // entfernt, war genau diese duennere Version am Ende das, was ein
  // JS-ausfuehrender Crawler tatsaechlich indexiert (Audit ProductDetailPage.tsx,
  // Problem 5). AggregateRating bleibt bewusst weg (siehe Kommentar unten),
  // Offer.availability war bereits ueber schemaAvailability() korrekt geteilt.
  const productSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: titleText, description: descriptionText, image: [product.image, ...(product.images ?? [])].map(absImg),
    sku: id, mpn: product.category === 'chain' ? product.chainModel : id,
    category: product.category === 'wax' ? 'Kettenwachs' : 'Vorgewachste Fahrradkette',
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
      availability: schemaAvailability(product), url: canonicalUrl,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Waxcelerate' },
      // Was hardcoded to a fixed date that would silently go stale — always
      // valid for a year out so it never needs manual upkeep.
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: (shipping[product.shippingClass].cents / 100).toFixed(2), currency: 'EUR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' },
        freeShippingThreshold: {
          '@type': 'DeliveryChargeSpecification',
          eligibleTransactionVolume: { '@type': 'PriceSpecification', minPrice: (shipping.freeFromCents / 100).toFixed(2), priceCurrency: 'EUR' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy', applicableCountry: 'DE',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14, returnMethod: 'https://schema.org/ReturnByMail',
      },
    },
    // Pro-Linie ist PFAS-/PTFE-frei (siehe generate-product-html.mjs fuer die
    // volle Begruendung) — nur fuer Pro, Classic enthaelt noch PTFE.
    ...(isPro ? { additionalProperty: [
      { '@type': 'PropertyValue', name: 'PFAS-frei', value: 'ja' },
      { '@type': 'PropertyValue', name: 'PTFE-frei', value: 'ja' },
    ] } : {}),
  });

  const hasFormula = !!(isWax && rc?.formulaDetails);
  const hasVergleich = !!(rc?.compHeaders && rc?.compRows);
  const hasKosten = !!(rc?.oilItems && rc?.waxItems);
  const toggleAccordion = (key: string) => setOpenAccordion(prev => prev === key ? null : key);

  // Manual offset scroll instead of scrollIntoView({block:'start'}) for two
  // reasons: (1) block:'start' would land the section flush against the
  // viewport top, right behind the fixed 56px (h-14) header above — the
  // first ~56px of "Spezifikationen" would render hidden underneath it;
  // (2) scrollIntoView's smooth animation was observed to silently no-op in
  // some environments (e.g. a backgrounded/inactive tab throttling the
  // scroll-behavior:smooth animation), whereas a plain scrollTo is the same
  // API surface every other scroll-to-position call in this file already
  // uses successfully.
  const HEADER_OFFSET = 56;
  const scrollToDetails = () => {
    const el = detailRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // "Zurück" used to always land on the homepage, even for a visitor who
  // arrived here from the blog, a search result, or a shared link — a real
  // back button should return them to wherever they actually came from.
  // history.state.idx (set by the browser's History API under
  // BrowserRouter) is >0 only when there's a prior entry in this tab's own
  // session history; falling back to "/" keeps the link correct for a fresh
  // tab or a direct/external arrival, where there is nothing to go back to.
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((window.history.state as { idx?: number } | null)?.idx) navigate(-1);
    else navigate('/');
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
        {product.image && <meta property="og:image" content={absImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {product.image && <meta name="twitter:image" content={absImage} />}
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
              <Link to="/" onClick={handleBack} className="sm:hidden flex items-center gap-2 text-[13px] font-medium transition-colors flex-shrink-0"
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
        <main id="main-content">
        {/* ══════════════════════════════════════════════════════════════
            MOBILE HERO — stacked: image top, info below
           ══════════════════════════════════════════════════════════════ */}
        <section className="lg:hidden">
          <div ref={heroRef} className="relative h-[54vh] min-h-[300px] overflow-hidden"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={onGalleryPointerDown} onPointerUp={onGalleryPointerUp}>
            {slides.map((slide, i) => (
              slide.type === 'video' ? (
                <VideoGallerySlide key={i} src={slide.src} poster={slide.poster}
                  active={i === activeImage} inView={!navSolid} reduce={reduce}
                  style={{
                    objectPosition: product.imagePosition ?? 'center',
                    opacity: i === activeImage ? 1 : 0,
                    transition: reduce ? 'none' : `opacity ${FADE_MS}ms ease`,
                    zIndex: i === activeImage ? 2 : (i === prevImage ? 1 : 0),
                  } as React.CSSProperties} />
              ) : (
              <img key={i} src={lg(slide.src)} srcSet={srcSetFor(slide.src)} sizes={srcSetFor(slide.src) ? '100vw' : undefined}
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
                  cursor: i === activeImage ? 'zoom-in' : undefined,
                }}
                onError={e => {
                  // Faellt auf die Basisdatei zurueck, falls die -lg-Variante fehlt.
                  // srcSet muss mit geleert werden: ist es gesetzt, waehlt der Browser
                  // beim naechsten Ladeversuch wieder daraus, egal was src sagt.
                  const t = e.target as HTMLImageElement;
                  if (!t.src.includes('wax-block-spin')) { t.removeAttribute('srcset'); t.src = slide.src; }
                }}
              />
              )
            ))}
            <div className="absolute inset-0 z-[3] pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.2) 0%, transparent 35%)' }} />
            {slideCount > 1 && (
              <>
                <button onClick={() => { prev(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  aria-label={de ? 'Vorheriges Bild' : 'Previous image'}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ background: 'rgba(var(--scrim-rgb),0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.92)' }}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => { next(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                  aria-label={de ? 'Nächstes Bild' : 'Next image'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ background: 'rgba(var(--scrim-rgb),0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.92)' }}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            {slideCount > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                    className="relative h-[2.5px] rounded-full transition-all duration-500 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-11 after:h-11"
                    style={{ width: i === activeImage ? 22 : 7, background: i === activeImage ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}
                    aria-label={de ? `Bild ${i + 1}` : `Image ${i + 1}`} />
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
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                  {pricePerApp !== null && (
                    <p className="text-meta whitespace-nowrap" style={{ color: 'var(--txff)' }}>~{formatPrice(pricePerApp)} / {de ? 'Anwendung' : 'use'}</p>
                  )}
                  {per100g && <p className="text-meta whitespace-nowrap" style={{ color: 'var(--txff)' }}>{pricePerApp !== null ? '· ' : ''}{per100g}</p>}
                </div>
              </div>
              {isSoldOut(product) ? (
                <span className="text-[13px] font-semibold px-4 py-3" style={{ color: 'var(--txf)' }}>
                  {de ? 'Ausverkauft' : 'Sold out'}
                </span>
              ) : canCheckout(product) ? <AddToCartButton product={product} /> : (
                <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-[13px] font-semibold active:scale-[0.97]"
                  style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
                  {de ? 'Kaufen' : 'Buy'} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Same delivery estimate the homepage product cards already show —
                this page had no delivery-date signal at all before. */}
            <div className="flex items-center gap-1.5 mb-2 text-meta" style={{ color: 'var(--txff)' }}>
              <Truck className="h-3 w-3 flex-shrink-0" style={{ color: accentColor }} aria-hidden />
              {de ? `Lieferung ${deliveryDate}` : `Delivery ${deliveryDate}`}
            </div>

            {personalizedWeeks !== null && (
              <p className="text-meta font-semibold mb-2" style={{ color: accentColor }}>
                {de ? `Basierend auf deinem Fahrprofil: reicht dir noch ~${personalizedWeeks} Wochen` : `Based on your riding profile: lasts you ~${personalizedWeeks} more weeks`}
              </p>
            )}

            {/* Risikoabbau am Kaufpunkt (docs/AUDIT.md §11): das Widerrufsrecht
                stand bisher nur im Warenkorb, also im abgeschalteten Checkout —
                an der Stelle, an der jemand tatsaechlich zoegert, stand nichts.
                Bei einem Produkt, das eine Verhaltensaenderung verlangt, ist die
                stille Frage nicht "ist es gut", sondern "was, wenn ich damit
                nicht klarkomme". Bewusst zwei Saetze: der erste ist die
                Rechtslage, der zweite der Ton der Marke.
                Vorherige Fassung ("wenn das Wachsen nichts fuer dich ist")
                versprach implizit eine Ruecknahme, nachdem der Block schon
                angeschmolzen bzw. die Kette schon montiert war — genau das
                nimmt Luca nicht zurueck (unverkaeuflich, kein Streitfall).
                Jetzt an die tatsaechliche Bedingung geknuepft, ohne die
                Einladung zu streichen, sich bei Problemen trotzdem zu melden. */}
            <div className="flex items-start gap-1.5 mb-5 text-meta" style={{ color: 'var(--txff)' }}>
              <RotateCcw className="h-3 w-3 flex-shrink-0 mt-[3px]" style={{ color: accentColor }} aria-hidden />
              <span>
                {de
                  ? (isWax
                    ? '14 Tage Rückgaberecht, solange der Block original verpackt ist. Schreib mir gerne trotzdem, wenn etwas nicht passt.'
                    : '14 Tage Rückgaberecht, solange die Kette nicht montiert wurde. Schreib mir gerne, wenn etwas nicht passt.')
                  : (isWax
                    ? '14-day right of return, as long as the block is still sealed. Feel free to write to me anyway if something is not right.'
                    : '14-day right of return, as long as the chain has not been installed. Feel free to write to me if something is not right.')}
              </span>
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
          {slides.map((slide, i) => (
            slide.type === 'video' ? (
              <VideoGallerySlide key={i} src={slide.src} poster={slide.poster}
                active={i === activeImage} inView={!navSolid} reduce={reduce}
                style={{
                  objectPosition: product.imagePosition ?? 'center',
                  opacity: i === activeImage ? 1 : 0,
                  transition: reduce ? 'none' : `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
                  zIndex: i === activeImage ? 2 : (i === prevImage ? 1 : 0),
                } as React.CSSProperties} />
            ) : (
            <img key={i} src={lg(slide.src)} srcSet={srcSetFor(slide.src)} sizes={srcSetFor(slide.src) ? '100vw' : undefined}
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
                cursor: i === activeImage ? 'zoom-in' : undefined,
              }}
              onError={e => {
                // Faellt auf die Basisdatei zurueck, falls die -lg-Variante fehlt.
                // srcSet muss mit geleert werden: ist es gesetzt, waehlt der Browser
                // beim naechsten Ladeversuch wieder daraus, egal was src sagt.
                const t = e.target as HTMLImageElement;
                if (!t.src.includes('wax-block-spin')) { t.removeAttribute('srcset'); t.src = slide.src; }
              }}
            />
            )
          ))}

          <div className="absolute inset-0 z-[3] pointer-events-none"
            style={{ background: 'linear-gradient(105deg, rgba(var(--scrim-rgb),0.55) 0%, rgba(var(--scrim-rgb),0.20) 28%, transparent 48%)' }} />
          <div className="absolute inset-0 z-[3] pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.25) 0%, transparent 30%)' }} />

          {/* ── MAIN CARD — focused conversion funnel ── */}
          {/* cardRef/GSAP lives on the INNER .pdp-hero-card div, not this
              wrapper. GSAP's `.from()` writes its own `transform` and resets
              the standalone `translate`/`scale`/`rotate` CSS properties to
              `none` on whatever element it targets — but this wrapper's
              vertical centering (`top-1/2 -translate-y-1/2`) is implemented
              via that same `translate` property. Animating this div directly
              silently killed the -50% centering the moment the reveal ran,
              leaving the card either off-screen or overlapping the header
              (worst on the two Starter-Set bundles, whose shorter card
              content made the miscalculated offset most visible). Same class
              of bug already solved this way for the slider handle in
              BeforeAfterSlider — see the wx-slider-pulse comment in
              index.css. */}
          <div
            className="absolute z-20 left-10 xl:left-14 top-1/2 -translate-y-1/2 w-[380px] xl:w-[400px]"
            onMouseEnter={pause} onMouseLeave={resume}>
            {/* No backdrop-filter: at 96% opacity there's only a 4% sliver of
                backdrop showing through, so a blur(40px) here cost real
                compositing work for a practically invisible effect. */}
            <div ref={cardRef} className="pdp-hero-card rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.96)',
                boxShadow: '0 24px 64px -16px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15)',
              }}>

              <div className="px-6 xl:px-7 pt-6 pb-5">
                {/* Eyebrow + bestseller badge */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  {/* .pdp-hero-card ist bewusst theme-unabhaengig weiss (Glaskarte
                      ueber dem Foto, siehe style oben) — die CSS-Variablen
                      --txm/--txf/--txff sind dagegen PRO THEME neu berechnet
                      (in noir hell, fuer dunkle Flaechen kalibriert) und wuerden
                      auf dieser immer-weissen Karte im noir-Theme umkippen: zu
                      hell fuer AA-Kontrast. Deshalb hier feste rgba(0,0,0,X)-
                      Werte statt Tokens — 0.62/0.58/0.55 sind auf >=4.5:1 gegen
                      #fff nachgerechnet (WCAG-Relativluminanz-Formel), die alten
                      Werte (0.35/0.52/0.28/0.3/0.45) lagen bei 2.0-4.3:1. */}
                  <span className="text-small font-semibold uppercase tracking-[0.2em]"
                    style={{ color: 'rgba(0,0,0,0.62)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                    {product.variant ? `${product.variant} · ${product.weight ?? ''}` : (product.chainSpeed ?? '')}
                  </span>
                  {(de ? product.badge : product.badgeEn) && (
                    <span className="text-meta font-bold uppercase tracking-[0.1em] px-1.5 py-[1px] rounded"
                      style={{ background: `${cardAccent}12`, color: cardAccent }}>
                      {de ? product.badge : product.badgeEn}
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
                        <p className="text-[12px] leading-[1.45]" style={{ color: 'rgba(0,0,0,0.58)' }}>{b}</p>
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
                          style={{ color: 'rgba(0,0,0,0.62)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
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
                          style={{ color: 'rgba(0,0,0,0.62)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
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
                    {/* rgba(0,0,0,0.32) auf weiss faellt auf ~2,2:1 Kontrast, WCAG AA
                        braucht 4,5:1 fuer Normaltext. Fest statt --txm: die Karte
                        ist bewusst theme-unabhaengig weiss (siehe Kommentar oben
                        an der ersten Stelle dieses Fixes), --txm faellt im
                        noir-Theme dagegen hell und wuerde hier wieder unter AA
                        rutschen. */}
                    <span className="text-meta font-medium" style={{ color: 'rgba(0,0,0,0.58)' }}>
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
                      <span className="text-meta font-medium" style={{ color: 'rgba(0,0,0,0.58)' }}>
                        ~{formatPrice(pricePerApp)}/{de ? 'Anw.' : 'use'}
                      </span>
                    )}
                    {per100g && (
                      <span className="text-meta font-medium" style={{ color: 'rgba(0,0,0,0.58)' }}>
                        {per100g}
                      </span>
                    )}
                  </div>
                  {rc?.savings && (
                    <p className="text-meta font-semibold mt-1" style={{ color: cardAccent }}>
                      {de ? `Spart ${rc.savings} vs. Kettenöl` : `Saves ${rc.savings} vs. chain oil`}
                    </p>
                  )}
                  {personalizedWeeks !== null && (
                    <p className="text-meta font-semibold mt-1" style={{ color: cardAccent }}>
                      {de ? `Basierend auf deinem Fahrprofil: reicht dir noch ~${personalizedWeeks} Wochen` : `Based on your riding profile: lasts you ~${personalizedWeeks} more weeks`}
                    </p>
                  )}
                </div>

                {/* CTA — full width for maximum conversion */}
                <div className="mb-3">
                  {isSoldOut(product) ? (
                    <p className="text-center text-[14px] font-semibold py-3.5" style={{ color: 'rgba(0,0,0,0.58)' }}>
                      {de ? 'Ausverkauft' : 'Sold out'}
                    </p>
                  ) : canCheckout(product) ? (
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
                <p className="text-meta text-center font-medium" style={{ color: 'rgba(0,0,0,0.58)' }}>
                  {isWax ? `${de ? 'Hergestellt in Stuttgart' : 'Made in Stuttgart'} · ` : ''}
                  {de ? `Lieferung ${deliveryDate}` : `Delivery ${deliveryDate}`}
                </p>
              </div>

              {/* Footer: spec pills + details link */}
              <div className="flex items-center justify-between px-6 xl:px-7 py-2.5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.015)' }}>
                <div className="flex flex-wrap gap-1.5">
                  {specsData.slice(0, 4).map((spec, i) => (
                    <span key={i} className="text-meta font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.62)' }}>
                      {spec.v}
                    </span>
                  ))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); scrollToDetails(); }}
                  onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}
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

          {/* Scroll hint — the card's own "Details ⌄" link (above) does the
              same scrollToDetails() call, but it's small text tucked in the
              card's corner and easy to miss on first glance; without any
              cue here the hero can read as a self-contained unit with
              nothing below. Icon-only and glassy (same treatment as the
              mobile hero's prev/next arrows) instead of the old solid black
              pill with an all-caps label — a quiet "there's more" nudge,
              not a second CTA competing with the card. Reuses the existing
              .pdp-bounce keyframe defined below (it does work and already
              handles prefers-reduced-motion on its own). */}
          <button onClick={(e) => { e.stopPropagation(); scrollToDetails(); }}
            onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90"
            style={{ background: 'rgba(var(--scrim-rgb),0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            aria-label={de ? 'Mehr erfahren' : 'Learn more'}>
            <ChevronDown className="h-4 w-4 pdp-bounce" style={{ color: 'rgba(255,255,255,0.92)' }} />
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
              {/* Bundle products (Starter-Set) carry none of the fields
                  specsData reads from — compatibility/weight/applications/
                  chainLinks/chainSpeed are all real-product-only fields — so
                  specsData is always empty here. Rendering the heading with
                  an empty bordered box under it looked like missing content,
                  not intentionally absent content. */}
              {specsData.length > 0 && (
                <div className="min-w-0">
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
              )}

              {rc && (isWax ? (hasFormula || hasVergleich || hasKosten) : true) && (
                <div className="min-w-0">
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
                          <div className="grid gap-x-1.5 text-meta font-semibold uppercase tracking-wider px-3 py-2.5"
                            style={{ gridTemplateColumns: `1.4fr repeat(${rc.compHeaders.length}, 1fr)`, background: 'var(--sf2)', borderBottom: '1px solid var(--bd)', color: 'var(--txff)' }}>
                            <span />
                            {rc.compHeaders.map((h, i) => (
                              <span key={i} className="text-center leading-tight text-meta break-words">
                                {h.replace('Waxcelerate ', '').replace('-Heißwachs', '')}
                              </span>
                            ))}
                          </div>
                          {rc.compRows.map((row, ri) => (
                            <div key={ri} className="grid gap-x-1.5 px-3 py-2.5 text-meta"
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
                              <div className="grid grid-cols-3 gap-x-1.5 text-meta font-semibold uppercase tracking-wider px-3 py-2" style={{ borderBottom: '1px solid var(--bd)', background: 'var(--sf2)' }}>
                                <span /><span className="text-center break-words" style={{ color: accentColor }}>{de ? 'Vorgewachst' : 'Pre-waxed'}</span><span className="text-center break-words" style={{ color: 'var(--txff)' }}>{de ? 'Kettenöl' : 'Chain oil'}</span>
                              </div>
                              {rc.chainCompRows.map((row, ri) => (
                                <div key={ri} className="grid grid-cols-3 gap-x-1.5 px-3 py-2 text-meta" style={{ borderBottom: '1px solid var(--bd)' }}>
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
                    {/* Kein trackEbayClick hier: das ist ein Link zur eBay-
                        Feedback-Seite, kein Kauf-CTA. analytics.ts definiert
                        click_ebay ausdruecklich als "Kauf-CTA, nicht der
                        allgemeine Shop-Link" — dieses Event sonst mit
                        Nicht-Kaufklicks zu verwaessern, verzerrt genau die
                        Kennzahl, die ueber nativen Checkout vs. eBay
                        entscheiden soll. */}
                    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] font-medium hover:underline" style={{ color: accentColor }}>
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

        {/* ── Reviews ── deliberately its own section, not nested inside the
            `{rc && ...}` Trust block above: bundle products (starter-classic,
            starter-pro) have no richContent entry at all, so `rc` is always
            undefined for them — exactly the one case where reviewsForProduct()
            returns a genuinely-matched result (the Starter-Kit reviews), so
            this must render independently of whether `rc` exists. */}
        {productReviews.length > 0 && (
          <section style={{ background: 'var(--sf2)', borderTop: rc ? 'none' : '1px solid var(--bd)' }}>
            {/* Less top padding when the Trust section (same background)
                already ran directly above — otherwise the two same-colored
                sections stack into one oversized gap before "Was Fahrer
                sagen" even starts. Full padding when this is the first thing
                here (bundle pages, which have no richContent/Trust section). */}
            <div className={`max-w-6xl mx-auto px-5 sm:px-8 pb-14 sm:pb-20 ${rc ? 'pt-0' : 'pt-14 sm:pt-20'}`}>
              <p className="text-small font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                {de ? 'Was Fahrer sagen' : 'What riders say'}
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {productReviews.map((review, i) => <ReviewSnippet key={i} review={review} de={de} />)}
              </div>
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
          {isSoldOut(product) ? (
            <span className="text-[13px] font-semibold flex-shrink-0" style={{ color: 'var(--txf)' }}>
              {de ? 'Ausverkauft' : 'Sold out'}
            </span>
          ) : canCheckout(product) ? <div className="flex-shrink-0"><AddToCartButton product={product} size="sm" /></div> : (
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
        @media (prefers-reduced-motion: reduce) { .pdp-bounce { animation: none; } }
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

        {p.category === 'wax' || isSoldOut(p) ? (
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

  if (p.category === 'wax' || isSoldOut(p)) return <Link to={`/produkt/${p.id}`} className="block flex-shrink-0">{inner}</Link>;
  return <a href={p.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(p.id)} className="block flex-shrink-0">{inner}</a>;
}

/* ── Review snippet — real quotes from reviews.tsx's curated REVIEWS list,
    picked via reviewsForProduct(). Deliberately simpler than reviews.tsx's
    own ReviewCard (no fixed pixel width, no marquee sizing) since this runs
    full-width in a static grid, not a scrolling row. */
function ReviewSnippet({ review, de }: { review: Review; de: boolean }) {
  const text = de ? review.textDe : review.textEn;
  const date = de ? review.dateDe : review.dateEn;
  const product = de ? review.productDe : review.productEn;
  const verified = review.source === 'web'
    ? (de ? 'Verifizierter Käufer' : 'Verified buyer')
    : (de ? 'eBay verifiziert' : 'eBay verified');
  const [photoOk, setPhotoOk] = useState(true);
  const showPhoto = Boolean(review.photo) && photoOk;

  return (
    <figure className="rounded-2xl p-5" style={{ background: 'var(--pg)', border: '1px solid var(--bd)' }}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <Stars rating={review.rating ?? 5} />
        <span className="text-meta" style={{ color: 'var(--txf)' }}>{date}</span>
      </div>
      <blockquote className="text-[13px] leading-[1.6] mb-3" style={{ color: 'var(--tx2)' }}>
        „{text}“
      </blockquote>
      <figcaption className="flex items-center gap-2 flex-wrap">
        {showPhoto && (
          <img src={review.photo} alt="" loading="lazy" decoding="async" onError={() => setPhotoOk(false)}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0" style={{ objectPosition: review.photoPos ?? '50% 50%' }} />
        )}
        <span className="text-[12.5px] font-semibold" style={{ color: 'var(--tx1)' }}>{review.name}</span>
        <span className="inline-flex items-center gap-1 text-meta font-medium" style={{ color: 'var(--accent-soft)' }}>
          <BadgeCheck className="h-3.5 w-3.5" /> {verified}
        </span>
        {product && (
          <span className="text-meta font-medium" style={{ color: 'var(--txf)' }}>· {product}</span>
        )}
      </figcaption>
    </figure>
  );
}

/* ── Accordion ── */
function AccordionItem({ title, subtitle, open, onToggle, children }: {
  title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden transition-shadow duration-300"
      style={{ border: '1px solid var(--bd)', background: 'var(--pg)', boxShadow: open ? '0 2px 8px rgba(0,0,0,0.04)' : 'none' }}>
      <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left">
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

  if (isWax || isSoldOut(p)) return <Link to={`/produkt/${p.id}`} className="block h-full">{inner}</Link>;
  return <a href={p.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(p.id)} className="block h-full">{inner}</a>;
}
