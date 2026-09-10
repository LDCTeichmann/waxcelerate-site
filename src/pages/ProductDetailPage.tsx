import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, ArrowRight, ExternalLink, Check,
  ChevronRight, ChevronLeft, ChevronDown, Star, Lightbulb, Truck, RotateCcw, BadgeCheck, Gauge,
} from 'lucide-react';
import { getProductById, products, canCheckout, checkoutEnabled, isSoldOut, schemaAvailability, shipping } from '@/lib/data';
import type { Product } from '@/lib/data';
import { loadRidingProfile, weeksRemainingForProduct } from '@/lib/ridingProfile';
import { richContent } from '@/lib/productContent';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick } from '@/lib/analytics';
import { CartIcon } from '@/components/CartIcon';
import { GpsrInfo } from '@/components/GpsrInfo';
import { ImageLightbox } from '@/components/ImageLightbox';
import { gsap } from '@/lib/gsap';
import { Footer } from '@/sections/footer';
import { getEstimatedDelivery, removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { reviewsForProduct, type Review } from '@/sections/reviews';
import { Stars } from '@/components/Stars';
import { CompareModal } from '@/sections/products';
import { CompareTable } from '@/components/CompareTable';

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
  const { lang, t } = useLanguage();
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
  const heroDesktopRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const [compatExpanded, setCompatExpanded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
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

  // Deep link from why-wax.tsx's Ersparnis-Karte (`/produkt/wax-500#kostenvergleich`):
  // open the Kostenvergleich accordion and scroll to it once it has rendered.
  // The timeout lets the scrollTo(0,0) above and the accordion's own layout
  // settle first — scrolling immediately would race the top-scroll reset.
  useEffect(() => {
    if (window.location.hash !== '#kostenvergleich') return;
    setOpenAccordion('kosten');
    const t = setTimeout(() => {
      document.getElementById('kostenvergleich')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }, 350);
    return () => clearTimeout(t);
  }, [id, reduce]);

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

  // Der Hero existiert zweimal im DOM (Mobil- und Desktop-Fassung, per CSS
  // umgeschaltet). Bis 09/2026 trugen BEIDE dieselbe `heroRef` — React behaelt
  // bei zwei Elementen an einem Ref-Objekt nur die zuletzt zugewiesene
  // Zuweisung, hier also die Desktop-Sektion. Auf dem Handy beobachtete der
  // Observer damit ein Element mit `display: none`. Zwei getrennte Refs, und
  // die Navigation wird erst dann massiv, wenn KEINE der beiden Fassungen mehr
  // sichtbar ist — die jeweils versteckte meldet ohnehin nie ein Intersecting,
  // fuer sie ist die Bedingung also neutral.
  useEffect(() => {
    const els = [heroRef.current, heroDesktopRef.current].filter(Boolean) as Element[];
    if (!els.length) return;
    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target, e.isIntersecting);
      setNavSolid(![...visible.values()].some(Boolean));
    }, { threshold: 0 });
    els.forEach(el => io.observe(el));
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
    ? weeksRemainingForProduct(product, ridingProfile)
    : null;
  const accentColor = isPro ? '#4A72D4' : 'var(--accent-soft)';
  const accentBg = isPro ? 'rgba(74,114,212,0.06)' : 'rgba(43,82,176,0.06)';
  // cardAccent war der fixe Akzent der frueheren, fest weissen
  // Desktop-Kaufkarte. Die Karte ist weg, alle verbliebenen Stellen sitzen
  // auf --pg — also dem Theme folgen statt einem Hex-Wert, sonst steht im
  // Dark Mode ein dunkles Blau auf dunklem Grund.
  const cardAccent = accentColor;

  // Widerrufshinweis am Kaufpunkt. Stand bis 09/2026 ausschliesslich im
  // Mobil-Markup — die Desktop-Kaufkarte trug ihn nicht, obwohl genau dort die
  // Kaufentscheidung faellt. Deshalb hier einmal abgeleitet statt zweimal
  // getippt: zwei Fassungen desselben Hinweises waren die Ursache dafuer, dass
  // eine davon vergessen wurde. Die lange Fassung bleibt wortgleich die
  // bisherige (die Formulierung ist bewusst an die tatsaechliche Bedingung
  // geknuepft, siehe Kommentar am Mobil-Trust-Streifen); die kurze traegt nur
  // die Rechtslage, weil in der Karte kein Platz fuer zwei Saetze ist.
  const returnNoteLong = de
    ? (isWax
      ? '14 Tage Rückgaberecht, solange der Block original verpackt ist. Schreib mir gerne trotzdem, wenn etwas nicht passt.'
      : '14 Tage Rückgaberecht, solange die Kette nicht montiert wurde. Schreib mir gerne, wenn etwas nicht passt.')
    : (isWax
      ? '14-day right of return, as long as the block is still sealed. Feel free to write to me anyway if something is not right.'
      : '14-day right of return, as long as the chain has not been installed. Feel free to write to me if something is not right.');

  const highlights = de ? product.highlights : product.highlightsEn;
  const descriptionText = de ? product.description : product.descriptionEn;
  const titleText = de ? product.title : product.titleEn;

  const related = products
    .filter(p => p.id !== product.id)
    .filter(p => product.category === 'wax' ? (p.category === 'chain' && !p.variant) : p.category === 'wax')
    .slice(0, 3);

  // Groessengeschwister derselben Formel — ersetzt den frueheren
  // "Auch erhaeltlich"-Karussellstreifen, der Groessenvarianten als anonyme
  // Fremdprodukte neben Ketten-Cross-Sells zeigte (Baymard: Varianten gehoeren
  // ins Produkt, nicht daneben). Der Schalter in der Kaufkarte tauscht direkt
  // die Route, kein Zwischenschritt.
  const waxSizeSibling = isWax
    ? products.find(p => p.category === 'wax' && p.variant === product.variant && p.weight !== product.weight)
    : undefined;

  const pricePerApp = product.applications
    ? product.price / parseFloat(product.applications.split('–')[1] ?? product.applications)
    : null;

  // Same figures the homepage product cards already show (getEstimatedDelivery,
  // price-per-100g) — missing here, this was the one page where a buyer
  // couldn't see either before deciding.
  const deliveryDate = getEstimatedDelivery(lang);
  const grams = isWax && product.weight ? parseInt(product.weight) : 0;
  const per100g = grams > 0 ? `${(product.price / (grams / 100)).toFixed(2).replace('.', ',')} €/100g` : null;

  // Runde 4 (Produktkarten-Neugliederung): zwei statt drei Haekchen — die
  // Karte bekommt zusaetzlich einen eigenen Positionierungssatz (Einsatz-
  // zeitraum), drei generische Haekchen plus Satz waren zu viele Atome fuer
  // eine Flaeche, die vor allem Preis und CTA tragen soll.
  const cardBenefits = (highlights ?? []).filter(h => {
    const lower = h.toLowerCase();
    if (product.applications && lower.includes(product.applications.split('–')[0])) return false;
    return true;
  }).slice(0, 2);

  const specsData = [
    // Kompatibilitaet steht bewusst NICHT hier: sie hat weiter unten eine
    // eigene Sektion mit Marken-Tags und stand dadurch zweimal auf der Seite.
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
  // scrollToDetails() stand hier. Seine beiden Aufrufer sind mit dem
  // Vollbild-Hero (Scroll-Hinweis) und der Vergleichs-Dublette
  // ("Vollen Vergleich ansehen") weggefallen — die Detailsektionen folgen
  // jetzt direkt auf die Entscheidungszone, es gibt nichts zu ueberspringen.

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
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--bd)',
          }}>
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link to="/" className="flex-shrink-0 flex items-center" aria-label="Waxcelerate — Startseite">
                {/* Kleiner Logo-Satz statt des 65-KB-PNG, siehe Kommentar in
                    src/sections/footer.tsx. alt bleibt leer: der Link daneben
                    traegt bereits ein aria-label. */}
                <picture>
                  <source srcSet="/images/logo-dark-160.avif" type="image/avif" />
                  <source srcSet="/images/logo-dark-160.webp" type="image/webp" />
                  <img src="/images/logo-dark.png" alt="" width={160} height={160} className="h-8 w-auto" />
                </picture>
              </Link>
              {/* Breadcrumb — mirrors the breadcrumbSchema in <head>, which had
                  no visible on-page counterpart before this. */}
              <nav aria-label={de ? 'Brotkrümelnavigation' : 'Breadcrumb'}
                className="hidden sm:flex items-center gap-1.5 text-[13px] min-w-0">
                <Link to="/" className="flex-shrink-0 hover:underline transition-colors"
                  style={{ color: 'var(--txf)' }}>
                  {de ? 'Start' : 'Home'}
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50"
                  style={{ color: 'var(--txf)' }} />
                <Link to="/#produkte" className="flex-shrink-0 hover:underline transition-colors"
                  style={{ color: 'var(--txf)' }}>
                  {de ? 'Produkte' : 'Products'}
                </Link>
                <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50"
                  style={{ color: 'var(--txf)' }} />
                <span className="truncate font-medium" style={{ color: 'var(--tx1)' }}>
                  {titleText}
                </span>
              </nav>
              {/* Mobile — no room for the full breadcrumb, keep the simple back link */}
              <Link to="/" onClick={handleBack} className="sm:hidden flex items-center gap-2 text-[13px] font-medium transition-colors flex-shrink-0"
                style={{ color: 'var(--txm)' }}>
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
            ENTSCHEIDUNGSZONE — EINE Fassung fuer beide Breakpoints
            ══════════════════════════════════════════════════════════════
            Vorher standen hier zwei vollstaendig getrennte Heroes im DOM:
            ein gestapelter Mobil-Hero (`lg:hidden`) und ein bildschirm-
            fuellender Desktop-Hero (`hidden lg:block`) mit einer schwebenden
            440-px-Karte. Beide wurden IMMER gerendert, nur per CSS
            umgeschaltet. Folgen, alle gemessen:

            - Jede Information stand doppelt im DOM. Titel, Preis, CTA,
              Groessenschalter, Pflichtangaben — zweimal, und beim Pflegen
              lief zwangslaeufig eine Fassung der anderen davon (genau so
              haben Widerrufsrecht und GPSR es geschafft, nur im Mobil-Zweig
              zu existieren).
            - Die Desktop-Karte war 849 px hoch bei 900 px Viewport und trug
              rund 15 Elemente auf fast gleicher visueller Ebene. Das war die
              Ursache des "ueberwaeltigend"-Eindrucks.
            - 65 % der Desktop-Flaeche war Foto, 100 % der Entscheidungs-
              information steckte in der schmalen Karte daneben.

            Jetzt ein Raster: Galerie links, Kaufblock rechts, ab lg klebt der
            Kaufblock beim Scrollen mit. Der Kaufblock traegt nur noch, was
            zur Kaufentscheidung gehoert. Alles Erklaerende steht darunter in
            eigenen Sektionen mit echten Ueberschriften. */}
        <section ref={heroRef} className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 pt-20 lg:pt-28 pb-10 lg:pb-16">
          <div className="grid gap-6 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] lg:items-start">

            {/* ── Galerie ───────────────────────────────────────────────── */}
            <div className="min-w-0">
              <div
                className="relative rounded-2xl overflow-hidden aspect-[4/3]"
                style={{ background: 'var(--hero-stage)', touchAction: 'pan-y' }}
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
                    <img key={i} src={lg(slide.src)} srcSet={srcSetFor(slide.src)}
                      sizes={srcSetFor(slide.src) ? '(min-width: 1024px) 60vw, 100vw' : undefined}
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
                        // Faellt auf die Basisdatei zurueck, falls die -lg-Variante
                        // fehlt. srcSet muss mit geleert werden: ist es gesetzt,
                        // waehlt der Browser beim naechsten Ladeversuch wieder
                        // daraus, egal was src sagt.
                        const t = e.target as HTMLImageElement;
                        if (!t.src.includes('wax-block-spin')) { t.removeAttribute('srcset'); t.src = slide.src; }
                      }}
                    />
                  )
                ))}

                {slideCount > 1 && (
                  <>
                    <button onClick={() => { prev(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                      aria-label={de ? 'Vorheriges Bild' : 'Previous image'}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                      style={{ background: 'rgba(var(--scrim-rgb),0.34)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.94)' }}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => { next(); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                      aria-label={de ? 'Nächstes Bild' : 'Next image'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                      style={{ background: 'rgba(var(--scrim-rgb),0.34)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.94)' }}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Fortschrittsstriche. 24x24-px-Knoepfe (WCAG 2.5.8) mit dem
                    Strich als Inhalt — vorher 2,5x7-px-Knoepfe mit einer
                    44-px-::after-Flaeche, die sich bei 13 px Mittenabstand
                    gegenseitig ueberlappten. */}
                {slideCount > 1 && (
                  <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 z-10 flex items-center">
                    {slides.map((_, i) => (
                      <button key={i} type="button" onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                        className="grid h-6 w-6 place-items-center"
                        aria-label={de ? `Bild ${i + 1}` : `Image ${i + 1}`}
                        aria-current={i === activeImage ? 'true' : undefined}>
                        <span aria-hidden className="block h-[2.5px] rounded-full transition-all duration-500"
                          style={{ width: i === activeImage ? 22 : 7, background: i === activeImage ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Vorschaubilder unter der Galerie statt als Streifen im Foto:
                  auf dem Foto konkurrierten sie mit dem Motiv und lagen auf
                  Desktop zusaetzlich mit der Cross-Sell-Karte uebereinander. */}
              {total > 1 && (
                <div className="flex gap-2 mt-3">
                  {gallery.slice(0, 6).map((src, i) => (
                    <button key={i} onClick={() => { goTo(i); pause(); setTimeout(resume, AUTO_INTERVAL); }}
                      aria-label={`${titleText} — ${de ? 'Bild' : 'Image'} ${i + 1}`} aria-current={i === activeImage}
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300"
                      style={{ opacity: i === activeImage ? 1 : 0.4, boxShadow: i === activeImage ? '0 0 0 2px var(--tx1)' : '0 0 0 1px var(--bd)' }}>
                      <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Kaufblock ─────────────────────────────────────────────────
                Klebt ab lg mit. Traegt ausschliesslich, was zur Kaufent-
                scheidung gehoert: wer bin ich, was koste ich, was gilt
                rechtlich, wie kaufe ich. Faktenraster, Staffel, Fahrprofil
                und "Alle Daten" sind bewusst raus und stehen unten in
                eigenen Sektionen — sie beantworten Folgefragen, nicht die
                Kaufentscheidung. */}
            <div className="lg:sticky lg:top-24 min-w-0">
              <span className="text-small font-semibold uppercase tracking-[0.2em] block mb-2"
                style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                {product.variant ? `${product.variant} · ${product.weight ?? ''}` : (product.chainSpeed ?? '')}
              </span>

              {/* Die einzige <h1> der Seite. Frueher gab es zwei Fassungen
                  (Mobil als <h1>, Desktop als <p>), damit nicht zwei
                  Ueberschriften ersten Grades im DOM standen. Mit einem
                  gemeinsamen Markup erledigt sich das. */}
              <h1 className="font-display text-[26px] sm:text-[30px] lg:text-[32px] font-bold leading-[1.08] tracking-[-0.025em] mb-2"
                style={{ color: 'var(--tx1)' }}>{titleText}</h1>

              {isWax && (
                <p className="text-small font-semibold mb-3" style={{ color: accentColor }}>
                  {de ? 'Für ' : 'For '}{isClassic ? t.products.shelf.classicFor : t.products.shelf.proFor}
                </p>
              )}

              <p className="text-[13.5px] leading-[1.55] mb-4" style={{ color: 'var(--txm)' }}>{descriptionText}</p>

              {/* Groessenschalter — wechselt die Route, nicht nur den Zustand:
                  300 g und 500 g sind eigene Produkte mit eigenen Adressen. */}
              {isWax && waxSizeSibling && (
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="inline-flex rounded-lg p-0.5" style={{ background: 'var(--sf3)', border: '1px solid var(--bd)' }}>
                    {(['300', '500'] as const).map(v => {
                      const active = product.weight === `${v}g`;
                      return (
                        <button key={v} type="button"
                          onClick={() => { if (!active) navigate(`/produkt/${waxSizeSibling.id}`); }}
                          aria-pressed={active}
                          className="num-data inline-flex items-center justify-center min-h-11 min-w-11 px-4 rounded-md text-[12.5px] leading-none transition-all"
                          style={{ background: active ? 'var(--sf)' : 'transparent', color: active ? 'var(--tx1)' : 'var(--txm)' }}>
                          {v} g
                        </button>
                      );
                    })}
                  </div>
                  {product.applications && (
                    <span className="text-meta font-medium flex-shrink-0" style={{ color: 'var(--txf)' }}>
                      {product.applications} {de ? 'Anwendungen' : 'applications'}
                    </span>
                  )}
                </div>
              )}

              {isClassic && (
                <button type="button" onClick={() => setCompareOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium mb-4 hover:opacity-70 transition-opacity"
                  style={{ color: accentColor }}>
                  {de ? 'Regen & Winter? Pro MoS₂ vergleichen' : 'Rain & winter? Compare Pro MoS₂'}
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}

              {/* Preisblock: Preis, Grundpreis, Pflichtangaben, CTA. */}
              <div className="pt-4" style={{ borderTop: '1px solid var(--bd)' }}>
                <p className="num text-[30px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
                  {formatPrice(product.price)}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 mb-2">
                  {pricePerApp !== null && (
                    <p className="text-meta whitespace-nowrap" style={{ color: 'var(--txff)' }}>~{formatPrice(pricePerApp)} / {de ? 'Anwendung' : 'use'}</p>
                  )}
                  {per100g && <p className="text-meta whitespace-nowrap" style={{ color: 'var(--txff)' }}>{pricePerApp !== null ? '· ' : ''}{per100g}</p>}
                </div>

                <div className="mb-4">
                  <PriceNote de={de} t={t} tone="page" />
                </div>

                <div className="mb-3">
                  {isSoldOut(product) ? (
                    <p className="text-center text-[14px] font-semibold py-3.5" style={{ color: 'var(--txf)' }}>
                      {de ? 'Ausverkauft' : 'Sold out'}
                    </p>
                  ) : canCheckout(product) ? (
                    <div className="w-full"><AddToCartButton product={product} /></div>
                  ) : (
                    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[14px] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.01] active:scale-[0.97]"
                      style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
                      {de ? 'Jetzt bestellen' : 'Order now'} <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-meta" style={{ color: 'var(--txff)' }}>
                    <Truck className="h-3 w-3 flex-shrink-0" style={{ color: accentColor }} aria-hidden />
                    {isWax ? `${de ? 'Hergestellt in Stuttgart' : 'Made in Stuttgart'} · ` : ''}
                    {de ? `Lieferung ${deliveryDate}` : `Delivery ${deliveryDate}`}
                  </div>
                  <div className="flex items-start gap-1.5 text-meta" style={{ color: 'var(--txff)' }}>
                    <RotateCcw className="h-3 w-3 flex-shrink-0 mt-[3px]" style={{ color: accentColor }} aria-hidden />
                    <span>{returnNoteLong}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buy-bar scroll trigger */}
        <div ref={buyRef} className="h-0" />

        {/* ══════════════════════════════════════════════════════════════
            AUF EINEN BLICK — die vier Kennzahlen des Produkts
            ══════════════════════════════════════════════════════════════
            `rc.stats` ist fuer ALLE zwoelf Produkte gepflegt (value/label/sub)
            und wurde bis 09/2026 an keiner einzigen Stelle gerendert. Die
            Seite zeigte stattdessen dieselben Fakten dreifach verteilt:
            Faktenpanel im Hero, "Spezifikationen"-Tabelle darunter und noch
            einmal in der Vergleichstabelle — "Kompatibilitaet" und "Gewicht"
            standen wortgleich doppelt.

            Gestaltung nach DESIGN.md §3: Haarlinien, keine gefuellten
            Icon-Kacheln ("Was es nicht mehr geben sollte: gefuellte Kacheln
            mit Icon und zwei Zeilen Text"). Die Zahl traegt die Sektion,
            gesetzt in Fraunces — das ist die im Markenprofil vorgesehene
            "grosse Serifzahl, sparsam eingesetzt". */}
        {rc?.stats && rc.stats.length > 0 && (
          <section style={{ background: 'var(--pg)' }}>
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 pb-12 lg:pb-16">
              <h2 className="sr-only">{de ? 'Kennzahlen' : 'Key figures'}</h2>
              <dl className="grid grid-cols-2 lg:grid-cols-4" style={{ borderTop: '1px solid var(--bd)' }}>
                {rc.stats.map((stat, i) => (
                  <div key={i}
                    className="flex flex-col py-5 lg:py-6 pr-4 lg:pr-8"
                    style={{
                      borderBottom: '1px solid var(--bd)',
                      // Senkrechte Haarlinie nur zwischen den Spalten, nicht
                      // am linken Rand der jeweils ersten Spalte — sonst
                      // entsteht optisch doch wieder ein Kasten.
                      borderLeft: i % 2 === 0 ? 'none' : '1px solid var(--bd)',
                      paddingLeft: i % 2 === 0 ? 0 : '1rem',
                    }}>
                    <dt className="order-2 text-small font-semibold mb-1" style={{ color: 'var(--tx2)' }}>{stat.label}</dt>
                    <dd className="order-1 font-display font-bold leading-[1.05] tracking-[-0.02em] mb-1.5"
                      style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', color: 'var(--tx1)' }}>
                      {stat.value}
                    </dd>
                    <dd className="order-3 text-meta leading-[1.5]" style={{ color: 'var(--txff)' }}>{stat.sub}</dd>
                  </div>
                ))}
              </dl>

              {/* Was das Produkt auszeichnet — vorher im Hero-Faktenpanel als
                  gefuellte Flaeche, die dort mit dem Kaufblock um
                  Aufmerksamkeit konkurrierte. */}
              {cardBenefits.length > 0 && (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:gap-x-10">
                  {cardBenefits.map((b, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-[3px]" style={{ color: accentColor }} aria-hidden />
                      <span className="text-[13px] leading-[1.55]" style={{ color: 'var(--txm)' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Persoenliche Reichweite, falls auf diesem Geraet schon einmal
                  ein Fahrprofil gesetzt wurde. Ein kalter Besucher sieht das
                  heute nie — Etappe 3 macht daraus das eigentliche Instrument
                  mit Vorgabewerten. */}
              {personalizedWeeks !== null && (
                <p className="flex items-center gap-1.5 mt-5 text-meta" style={{ color: 'var(--txm)' }}>
                  <Gauge className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentColor }} aria-hidden />
                  {de
                    ? `Bei deinem Fahrprofil reicht dir das etwa ${personalizedWeeks} Wochen.`
                    : `At your riding profile this lasts you about ${personalizedWeeks} weeks.`}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Die Bande "Kurz verglichen" stand hier und zeigte die ersten drei
            Zeilen derselben Tabelle, die wenige Sektionen weiter unten
            vollstaendig im Akkordeon "Vergleich" steht. Zwei Fassungen
            derselben Tabelle auf einer Seite waren die auffaelligste
            Dublette; die vollstaendige gewinnt. */}

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
                  <h2 className="text-small font-semibold uppercase tracking-[0.14em] mb-3"
                    style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                    {de ? 'Spezifikationen' : 'Specifications'}
                  </h2>
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
                  {/* Der fruehere Regen/Winter-Textlink zu Pro MoS2 steht jetzt
                      als Chip direkt in der Kaufkarte (Zone 2, isClassic-Block
                      oben) — dort, wo die Kaufentscheidung tatsaechlich faellt,
                      statt im Spezifikations-Block unterhalb des Folds. */}
                  {isChain && (
                    <p className="text-[12px] mt-4" style={{ color: 'var(--txff)' }}>
                      {de ? 'Kette schon durch? ' : 'Chain due for a refresh? '}
                      <Link to="/kette-wachsen-lassen"
                        className="underline underline-offset-2" style={{ color: accentColor }}>
                        {de ? 'Rewax-Service anfragen →' : 'Request the rewax service →'}
                      </Link>
                    </p>
                  )}
                  {isChain && (
                    <p className="text-[12px] mt-2" style={{ color: 'var(--txff)' }}>
                      {de ? 'Passt die zu meinem Antrieb? ' : 'Will it fit my drivetrain? '}
                      <Link to="/rechner/passende-kette"
                        className="underline underline-offset-2" style={{ color: accentColor }}>
                        {de ? 'Kompatibilität prüfen →' : 'Check compatibility →'}
                      </Link>
                    </p>
                  )}
                  {isWax && (
                    <p className="text-[12px] mt-4" style={{ color: 'var(--txff)' }}>
                      {de ? 'Wie oft nachwachsen? ' : 'How often to re-wax? '}
                      <Link to="/rechner/intervall"
                        className="underline underline-offset-2" style={{ color: accentColor }}>
                        {de ? 'Intervall berechnen →' : 'Work out your interval →'}
                      </Link>
                    </p>
                  )}
                </div>
              )}

              {rc && (isWax ? (hasFormula || hasVergleich || hasKosten) : true) && (
                <div className="min-w-0">
                  <h2 className="text-small font-semibold uppercase tracking-[0.14em] mb-3"
                    style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                    {de ? 'Im Detail' : 'Deep dive'}
                  </h2>
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
                        <CompareTable headers={rc.compHeaders} rows={rc.compRows} accentColor={cardAccent} de={de} />
                      </AccordionItem>
                    )}
                    {hasKosten && rc.oilItems && rc.waxItems && (
                      <AccordionItem id="kostenvergleich" title={de ? 'Kostenvergleich' : 'Cost comparison'}
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
                            <CompareTable
                              headers={[de ? 'Vorgewachst' : 'Pre-waxed', de ? 'Kettenöl' : 'Chain oil']}
                              rows={rc.chainCompRows.map(row => ({ label: row.label, cols: [row.good, row.bad], winCol: 0, dimCols: [1] }))}
                              accentColor={cardAccent} de={de}
                            />
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
              <h2 className="text-small font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                {de ? 'Was Fahrer sagen' : 'What riders say'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {productReviews.map((review, i) => <ReviewSnippet key={i} review={review} de={de} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        {/* Herstellerangabe nach GPSR — einmal fuer beide Breakpoints. Lag bis
            09/2026 im Mobil-Hero und fehlte auf Desktop dadurch komplett. */}
        <section style={{ background: 'var(--pg)' }}>
          <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-8">
            <GpsrInfo de={de} />
          </div>
        </section>

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
            {/* Dieser Abschluss-CTA hat bis 09/2026 als einziger der vier
                Kaufaktionen weder isSoldOut noch canCheckout geprueft und
                bedingungslos zu eBay verlinkt. Fuer chain-ybn12 (soldOut)
                stand hier also ein Kaufbutton, und sobald Stripe scharf
                geschaltet wird, haette er am eigenen Checkout vorbeiverkauft.
                Jetzt dieselbe Reihenfolge wie an den anderen drei Stellen:
                ausverkauft -> eigener Checkout -> eBay. */}
            {isSoldOut(product) ? (
              <p className="text-[14px] font-semibold" style={{ color: 'var(--txf)' }}>
                {de ? 'Ausverkauft' : 'Sold out'}
              </p>
            ) : canCheckout(product) ? (
              <div className="inline-block"><AddToCartButton product={product} /></div>
            ) : (
              <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}
                className="inline-flex items-center gap-2 px-9 py-3.5 rounded-full text-[14px] font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
                {de ? 'Jetzt kaufen' : 'Buy now'} — {formatPrice(product.price)} <ExternalLink className="h-4 w-4" />
              </a>
            )}
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

      {/* Classic/Pro-Vergleich — dasselbe Modal wie im Regal (products.tsx),
          hier ueber den Chip in der Kaufkarte geoeffnet (Zone 2, siehe
          Kommentar dort). */}
      {isWax && <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} de={de} t={t} />}

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

/* ── Pflichtangaben am Preis ────────────────────────────────────────────────
    Die Preisangabenverordnung verlangt beim Preis eine Aussage zur
    Umsatzsteuer und zu den Versandkosten, und zwar mit Verlinkung auf die
    Seite, die sie beziffert. Auf der Produktseite stand bis 09/2026 zu beidem
    nichts — geprueft am Live-HTML, weder "MwSt" noch "Versandkosten" kamen
    vor. Fachlich ist das zugleich der wirksamste Einzelhebel gegen
    Kaufabbruch: "extra costs too high" ist bei Baymard mit 48 % der
    haeufigste einzelne Abbruchgrund.

    Eine Komponente fuer beide Breakpoints, damit Mobil- und Desktop-Fassung
    nicht auseinanderlaufen — genau das ist beim Widerrufsrecht und beim
    GPSR-Block passiert, die es nur im Mobil-Markup gab.

    `tone`: die Desktop-Kaufkarte hat einen fest weissen Grund und arbeitet
    deshalb mit rgba-Werten statt mit den Theme-Variablen. */
function PriceNote({ de, t, tone }: {
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  tone: 'page' | 'card';
}) {
  const muted = tone === 'card' ? 'rgba(0,0,0,0.48)' : 'var(--txff)';
  const linkCol = tone === 'card' ? 'rgba(0,0,0,0.68)' : 'var(--txm)';
  const p = t.products;
  return (
    <p className="text-meta leading-[1.5]" style={{ color: muted }}>
      {p.priceNoteTax}{' '}
      {p.priceNoteShippingPre}{' '}
      <Link
        to="/versand-und-zahlung"
        className="underline underline-offset-2 hover:no-underline"
        style={{ color: linkCol }}
      >
        {p.priceNoteShippingLink}
      </Link>
      {de ? ', ' : ', '}{p.priceNoteShippingPost}.
    </p>
  );
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
function AccordionItem({ id, title, subtitle, open, onToggle, children }: {
  id?: string; title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div id={id} className="rounded-xl overflow-hidden transition-shadow duration-300"
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
        {/* Ersetzt die zweizeilige Beschreibung, die vorher hidden sm:block
            war — auf Mobile (2-spaltiges Grid) blieb "Passend dazu" damit
            eine reine Bild+Preis-Kachel ohne erkennbaren Nutzen ("Vergleichs-
            produkte" waren nicht als solche erkennbar). Kompatibilitaet ist
            fuer beide Kategorien gesetzt, kurz genug fuer eine Zeile und der
            haeufigste Vorentscheidungs-Filter beim Cross-Sell. */}
        {p.compatibility && (
          <p className="mt-1 text-meta truncate" style={{ color: 'var(--txm)' }}>{p.compatibility}</p>
        )}
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
