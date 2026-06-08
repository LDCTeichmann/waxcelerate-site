import { useParams, Link } from 'react-router-dom';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, ExternalLink, Check,
  ChevronRight, ChevronDown, Star,
} from 'lucide-react';
import { getProductById, products } from '@/lib/data';
import type { Product } from '@/lib/data';
import { richContent } from '@/lib/productContent';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { PageTransition } from '@/components/PageTransition';
import { CartIcon } from '@/components/CartIcon';
import { ImageLightbox } from '@/components/ImageLightbox';
import { ProductFAQ } from '@/components/ProductFAQ';

type RichTab = 'formula' | 'vergleich' | 'kosten';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const product = id ? getProductById(id) : undefined;
  const de = lang === 'de';

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [compatExpanded, setCompatExpanded] = useState(false);
  const [v9Expanded, setV9Expanded] = useState(false);
  const [richTab, setRichTab] = useState<RichTab>('formula');
  const [stickyVisible, setStickyVisible] = useState(false);
  const ctaSentinelRef = useRef<HTMLDivElement>(null);
  const isWaxProduct = product?.category === 'wax';

  useEffect(() => {
    const el = ctaSentinelRef.current;
    if (!el || !isWaxProduct) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isWaxProduct]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--pg)' }}>
        <p className="text-wx-txm">{de ? 'Produkt nicht gefunden.' : 'Product not found.'}</p>
        <Link to="/" className="text-[#3D67CA] hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> {de ? 'Zurück' : 'Back'}
        </Link>
      </div>
    );
  }

  const rc = id ? richContent[id] : undefined;
  const isClassic = product.variant === 'classic';
  const isPro = product.variant === 'pro';
  const isWax = product.category === 'wax';
  const isChain = product.category === 'chain';
  const accentColor = isPro ? '#4A72D4' : '#2B52B0';  // text/icon accent — lighter for contrast on dark bg
  // buttonColor now uses CSS variable — see inline styles below
  const accentBg = isPro ? 'rgba(74,114,212,0.08)' : 'rgba(43,82,176,0.08)';

  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency', currency: 'EUR',
    }).format(price), [lang]);

  const gallery = [product.image, ...(product.images ?? [])];
  const highlights = de ? product.highlights : product.highlightsEn;
  const descriptionText = de ? product.description : product.descriptionEn;
  const titleText = de ? product.title : product.titleEn;

  const related = products
    .filter(p => p.id !== product.id)
    .filter(p => {
      if (product.category === 'wax') {
        return p.category === 'wax' || (p.category === 'chain' && p.variant === undefined);
      } else {
        return p.category === 'wax';
      }
    })
    .slice(0, 3);

  const pricePerApp = product.applications
    ? product.price / parseFloat(product.applications.split('–')[1] ?? product.applications)
    : null;

  const metaTitle = `${titleText} | Waxcelerate`;
  const metaDescription = descriptionText ?? '';
  const canonicalUrl = `https://waxcelerate.de/produkt/${id}`;

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: de ? 'Startseite' : 'Home', item: 'https://waxcelerate.de' },
      { '@type': 'ListItem', position: 2, name: titleText, item: canonicalUrl },
    ],
  });

  const productSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: titleText,
    description: descriptionText,
    image: product.image,
    sku: id,
    brand: { '@type': 'Brand', name: 'Waxcelerate' },
    url: canonicalUrl,
    ...(isWax && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '171', bestRating: '5', worstRating: '1' },
    }),
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: product.ebayUrl,
      seller: { '@type': 'Organization', name: 'Waxcelerate' },
      priceValidUntil: '2026-12-31',
    },
  });

  const hasFormula = !!(isWax && rc?.formulaDetails);
  const hasVergleich = !!(rc?.compHeaders && rc?.compRows);
  const hasKosten = !!(rc?.oilItems && rc?.waxItems);
  const hasSpecs = !!(product.compatibility || product.weight || product.applications || product.chainLinks || product.chainSpeed);

  const tabs: { key: RichTab; label: string }[] = [
    ...(hasFormula ? [{ key: 'formula' as RichTab, label: de ? 'Formel' : 'Formula' }] : []),
    ...(hasVergleich ? [{ key: 'vergleich' as RichTab, label: de ? 'Vergleich' : 'Comparison' }] : []),
    ...(hasKosten ? [{ key: 'kosten' as RichTab, label: de ? 'Kosten' : 'Costs' }] : []),
  ];

  return (
    <PageTransition>
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {product.image && <meta name="twitter:image" content={product.image} />}
        <script type="application/ld+json">{breadcrumbSchema}</script>
        <script type="application/ld+json">{productSchema}</script>
      </Helmet>

      <div className="min-h-screen text-wx-tx1" style={{ background: 'var(--pg)' }}>

        {/* Sticky Add-to-Cart bar */}
        {isWax && (
          <div
            className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300"
            style={{
              transform: stickyVisible ? 'translateY(0)' : 'translateY(100%)',
              background: 'var(--pg)',
              borderTop: '1px solid var(--bd)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-4"
              style={{ paddingTop: '0.75rem', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            >
              <img
                src={product.image}
                alt={titleText}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                style={{ objectPosition: product.imagePosition ?? 'center' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-wx-tx1 truncate">{titleText}</p>
                <p className="text-[12px]" style={{ color: 'var(--txm)' }}>{formatPrice(product.price)}</p>
              </div>
              <div className="flex-shrink-0">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: 'var(--nav-bg)', borderColor: 'var(--bd)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2.5">
            <Link to="/" className="flex-shrink-0">
              <img src="/images/logo.jpg" alt="Waxcelerate" className="h-7 w-auto rounded-md" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-wx-txff" />
            <Link to="/" className="flex items-center gap-1.5 text-sm text-wx-txm hover:text-wx-tx1 transition-colors flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
              {de ? 'Zurück' : 'Back'}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-wx-txff" />
            <span className="text-sm text-wx-txff truncate flex-1 min-w-0">{titleText}</span>
            <CartIcon />
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* ── HERO ── */}
          <div className="py-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">

            {/* Left — image */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-3">
              <div
                className={`relative rounded-2xl overflow-hidden aspect-square${gallery.length > 1 ? ' ring-2 ring-transparent hover:ring-white/30 transition-all' : ''}`}
                style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)', cursor: gallery.length > 1 ? 'zoom-in' : undefined }}
                onClick={gallery.length > 1 ? () => setLightboxOpen(true) : undefined}
              >
                <img
                  key={activeImage}
                  src={gallery[activeImage]}
                  alt={titleText}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ objectPosition: product.imagePosition ?? 'center' }}
                  onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 40%)' }}
                />
                {product.badge && (
                  <span
                    className="absolute top-3.5 right-3.5 text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.48)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
                  >
                    {de ? product.badge : product.badgeEn}
                  </span>
                )}
                {(isPro || isClassic) && (
                  <span
                    className="absolute bottom-3.5 left-3.5 text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
                    style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}50`, backdropFilter: 'blur(6px)' }}
                  >
                    {isPro ? 'Pro' : 'Classic'}{product.weight ? ` · ${product.weight}` : ''}
                  </span>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-2">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                      style={{
                        border: `2px solid ${i === activeImage ? accentColor : 'var(--bd2)'}`,
                        opacity: i === activeImage ? 1 : 0.4,
                      }}
                    >
                      <img
                        src={img}
                        alt={`${titleText} ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        style={{ objectPosition: product.imagePosition ?? 'center' }}
                        onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — info */}
            <div className="flex flex-col gap-5">

              {/* Title + description */}
              <div>
                <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em] text-wx-tx1 leading-tight">
                  {titleText}
                </h1>
                <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                  {descriptionText}
                </p>
              </div>

              {/* Price + CTAs */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <p className="text-[32px] font-bold tracking-[-0.03em] text-wx-tx1 leading-none">
                    {formatPrice(product.price)}
                  </p>
                  {pricePerApp !== null && (
                    <p className="text-[12px] mt-1.5" style={{ color: 'var(--txff)' }}>
                      ~{formatPrice(pricePerApp)} {de ? 'pro Anwendung' : 'per use'}
                    </p>
                  )}
                </div>

                {isWax ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <AddToCartButton product={product} fullWidth />
                    <a
                      href={product.ebayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 text-[12px] transition-opacity hover:opacity-60"
                      style={{ color: 'var(--txm)' }}
                    >
                      {de ? 'Oder direkt bei eBay kaufen' : 'Or buy directly on eBay'}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <a
                    href={product.ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 mt-1"
                    style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
                  >
                    {de ? 'Jetzt bei eBay kaufen' : 'Buy on eBay'}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Sentinel — sticky bar observes this */}
              {isWax && <div ref={ctaSentinelRef} aria-hidden="true" />}

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--bd2)' }} />

              {/* Intervals */}
              {(product.intervalDry || product.intervalWet || product.intervalTopup) && (
                <div className="flex gap-2.5">
                  {product.intervalDry && (
                    <div className="flex-1 rounded-xl px-3.5 py-3" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--txff)' }}>
                        {de ? 'Trocken' : 'Dry'}
                      </p>
                      <p className="text-[16px] font-bold text-wx-tx1 leading-none mb-3">{product.intervalDry}</p>
                      <div className="h-[2px] rounded-full" style={{ background: 'var(--bd2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${intervalPct(product.intervalDry)}%`, background: accentColor }} />
                      </div>
                    </div>
                  )}
                  {product.intervalWet && (
                    <div className="flex-1 rounded-xl px-3.5 py-3" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--txff)' }}>
                        {de ? 'Nass' : 'Wet'}
                      </p>
                      <p className="text-[16px] font-bold text-wx-tx1 leading-none mb-3">{product.intervalWet}</p>
                      <div className="h-[2px] rounded-full" style={{ background: 'var(--bd2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${intervalPct(product.intervalWet)}%`, background: accentColor }} />
                      </div>
                    </div>
                  )}
                  {product.intervalTopup && (
                    <div className="flex-1 rounded-xl px-3.5 py-3" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--txff)' }}>
                        {de ? 'Topup max.' : 'Max. topup'}
                      </p>
                      <p className="text-[16px] font-bold text-wx-tx1 leading-none mb-3">{product.intervalTopup}</p>
                      <div className="h-[2px] rounded-full" style={{ background: 'var(--bd2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${intervalPct(product.intervalTopup, 1200)}%`, background: accentColor }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accordions — flat divider style, no border boxes */}
              {((highlights && highlights.length > 0) || hasSpecs) && (
                <div style={{ borderTop: '1px solid var(--bd2)' }}>
                  {highlights && highlights.length > 0 && (
                    <div style={{ borderBottom: '1px solid var(--bd2)' }}>
                      <p className="text-sm font-medium text-wx-tx1 py-3.5">
                        {de ? 'Das Wichtigste' : 'Key Features'}
                      </p>
                      <ul className="space-y-2.5 pb-4">
                        {highlights.map(h => (
                          <li key={h} className="flex items-start gap-3 text-sm" style={{ color: 'var(--txm)' }}>
                            <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasSpecs && (
                    <AccordionItem
                      title={de ? 'Kompatibilität & Specs' : 'Compatibility & Specs'}
                      open={specsOpen}
                      onToggle={() => setSpecsOpen(v => !v)}
                    >
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {product.compatibility && <SpecRow label={de ? 'Kompatibel' : 'Compatible'} value={product.compatibility} />}
                        {product.weight && <SpecRow label={de ? 'Gewicht' : 'Weight'} value={product.weight} />}
                        {product.applications && <SpecRow label={de ? 'Anwendungen' : 'Applications'} value={product.applications} />}
                        {isWax && <SpecRow label={de ? 'Verarbeitung' : 'Processing'} value="80–90°C" />}
                        {product.chainLinks && <SpecRow label={de ? 'Glieder' : 'Links'} value={product.chainLinks} />}
                        {product.chainSpeed && <SpecRow label={de ? 'Schaltung' : 'Speed'} value={product.chainSpeed} />}
                      </div>
                    </AccordionItem>
                  )}
                </div>
              )}

              {/* Classic → Pro — one-liner */}
              {isClassic && (
                <p className="text-[12px]" style={{ color: 'var(--txff)' }}>
                  {de ? 'Viel Regen oder Winter? ' : 'Lots of rain or winter? '}
                  <Link
                    to={`/produkt/${product.weight === '500g' ? 'wax-500-mos2' : 'wax-300-mos2'}`}
                    className="hover:underline"
                    style={{ color: accentColor }}
                  >
                    {de ? 'Pro mit MoS₂ ansehen →' : 'See Pro with MoS₂ →'}
                  </Link>
                </p>
              )}

              {/* WhatsApp — context-aware */}
              {isWax && (
                <a
                  href={`https://wa.me/4915751957470?text=${encodeURIComponent(
                    de
                      ? `Hi Luca! Ich interessiere mich für ${titleText} und habe eine Frage: `
                      : `Hi Luca! I'm interested in ${titleText} and have a question: `
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[12px] transition-opacity hover:opacity-70"
                  style={{ color: 'var(--txff)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {de ? 'Frage? Direkt per WhatsApp fragen' : 'Question? Ask directly on WhatsApp'}
                </a>
              )}
            </div>
          </div>

          {/* ── RICH CONTENT ── */}
          {rc && (
            <div className="pb-20" style={{ borderTop: '1px solid var(--bd2)' }}>

              {isChain && rc.hook && (
                <p className="text-[15px] leading-[1.8] max-w-2xl pt-10" style={{ color: 'var(--txm)' }}>{rc.hook}</p>
              )}

              {/* Stats — single container, internal dividers */}
              <div className="mt-10 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--bd2)', background: 'var(--bd2)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px">
                  {rc.stats.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-5 sm:px-5 sm:py-6"
                      style={{ background: 'var(--pg)' }}
                    >
                      <div className="text-lg sm:text-[22px] font-bold tabular-nums text-wx-tx1 leading-none mb-1.5">{s.value}</div>
                      <div className="text-[11px] leading-snug" style={{ color: 'var(--tx2)' }}>{s.label}</div>
                      {s.sub && <div className="text-[10px] text-wx-txff mt-1 leading-snug">{s.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chain spec table */}
              {isChain && rc.chainSpec && (
                <div className="mt-10">
                  <SectionHeading>{de ? 'Technische Daten' : 'Technical specs'}</SectionHeading>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
                    {Object.entries(rc.chainSpec).map(([key, val], i, arr) => (
                      <div key={key} className="flex gap-4 px-4 py-3 text-sm"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}>
                        <span className="text-wx-txff w-32 flex-shrink-0 text-xs">{key}</span>
                        <span style={{ color: 'var(--txm)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WAX — tabbed */}
              {isWax && tabs.length > 0 && (
                <div className="mt-10">

                  {/* Underline tabs */}
                  <div className="flex gap-7 mb-8" style={{ borderBottom: '1px solid var(--bd2)' }}>
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setRichTab(tab.key)}
                        className="pb-3.5 text-sm font-medium transition-colors relative"
                        style={{ color: richTab === tab.key ? 'var(--tx1)' : 'var(--txm)' }}
                      >
                        {tab.label}
                        {richTab === tab.key && (
                          <span
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                            style={{ background: accentColor }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Formel */}
                  {richTab === 'formula' && rc.formulaDetails && (
                    <div>
                      {rc.formulaDetails.map((f, i) => (
                        <div key={i} className="flex gap-5 py-5" style={{ borderBottom: '1px solid var(--bd2)' }}>
                          <span
                            className="text-[13px] font-bold tabular-nums flex-shrink-0 mt-0.5"
                            style={{ color: accentColor, minWidth: '22px' }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-wx-tx1 mb-1">{f.name}</div>
                            <div className="text-sm leading-relaxed" style={{ color: 'var(--txm)' }}>{f.detail}</div>
                          </div>
                        </div>
                      ))}
                      {rc.techNote && (
                        <div
                          className="mt-6 rounded-xl p-5"
                          style={{ background: `${accentColor}0A`, border: `1px solid ${accentColor}25` }}
                        >
                          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                            {rc.techNote.title}
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--tx2)' }}>{rc.techNote.body}</p>
                        </div>
                      )}
                      {/* Science deeplink */}
                      <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--bd2)' }}>
                        <Link
                          to={isPro ? '/wissenschaft#mos2' : '/wissenschaft'}
                          className="text-[13px] hover:underline flex items-center gap-1.5"
                          style={{ color: accentColor }}
                        >
                          💡 {de ? 'Warum funktioniert das? → Zur Wissenschaft' : 'Why does this work? → Read the science'}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Vergleich */}
                  {richTab === 'vergleich' && rc.compHeaders && rc.compRows && (
                    <div className="space-y-5">
                      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--bd2)' }}>
                        <div>
                          <div
                            className="grid text-[10px] font-semibold uppercase tracking-wider text-wx-txf px-4 py-3"
                            style={{ gridTemplateColumns: `1.6fr repeat(${rc.compHeaders.length}, 1fr)`, borderBottom: '1px solid var(--bd2)' }}
                          >
                            <span />
                            {rc.compHeaders.map((h, i) => (
                              <span key={i} className="text-center leading-tight break-words">
                                {h.replace('Waxcelerate ', '').replace('-Heißwachs', '').replace('Heißwachs', '')}
                              </span>
                            ))}
                          </div>
                          {rc.compRows.map((row, ri) => (
                            <div
                              key={ri}
                              className="grid px-4 py-3"
                              style={{ gridTemplateColumns: `1.6fr repeat(${rc.compHeaders!.length}, 1fr)`, borderBottom: '1px solid var(--bd2)' }}
                            >
                              <span className="text-wx-txm text-xs leading-snug break-words pr-2">{row.label}</span>
                              {row.cols.map((col, ci) => (
                                <span key={ci} className="text-center text-xs font-medium" style={{
                                  color: ci === row.winCol ? accentColor
                                    : row.dimCols?.includes(ci) ? 'var(--txff)'
                                    : 'var(--tx2)',
                                }}>{col}</span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      {rc.compFootnote && (
                        <p className="text-[11px] text-wx-txff px-1">{rc.compFootnote}</p>
                      )}
                    </div>
                  )}

                  {/* Kosten */}
                  {richTab === 'kosten' && rc.oilItems && rc.waxItems && (
                    <div className="space-y-4">
                      <div className="rounded-xl p-4" style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: 'var(--txff)' }}>
                          {de ? 'Szenario' : 'Scenario'}
                        </p>
                        {rc.costExample && (
                          <p className="text-sm font-medium text-wx-tx1 mb-1">{rc.costExample}</p>
                        )}
                        {rc.costNote && (
                          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--txm)' }}>{rc.costNote}</p>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="rounded-xl p-4" style={{ border: '1px solid var(--bd2)' }}>
                          <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--txm)' }}>
                            {rc.oilCount ? `${rc.oilCount} ${rc.oilLabel}` : de ? 'Mit Kettenöl' : 'With chain oil'}
                          </div>
                          <div className="space-y-2 mb-4">
                            {rc.oilItems.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span style={{ color: 'var(--txm)' }}>{item.label}</span>
                                <span className="font-mono" style={{ color: 'var(--tx2)' }}>{item.cost}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 flex justify-between items-baseline" style={{ borderTop: '1px solid var(--bd2)' }}>
                            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--txm)' }}>{de ? 'Gesamt' : 'Total'}</span>
                            <span className="text-[18px] font-bold font-mono" style={{ color: '#f87171' }}>{rc.oilTotal}</span>
                          </div>
                        </div>

                        <div className="rounded-xl p-4" style={{ border: `1px solid ${accentColor}30`, background: `${accentColor}06` }}>
                          <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                            {rc.waxCount ? `${rc.waxCount} ${rc.waxLabel}` : de ? 'Mit Waxcelerate' : 'With Waxcelerate'}
                          </div>
                          <div className="space-y-2 mb-4">
                            {rc.waxItems.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span style={{ color: 'var(--txm)' }}>{item.label}</span>
                                <span className="font-mono" style={{ color: 'var(--tx2)' }}>{item.cost}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 flex justify-between items-baseline" style={{ borderTop: `1px solid ${accentColor}20` }}>
                            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accentColor }}>{de ? 'Gesamt' : 'Total'}</span>
                            <span className="text-[18px] font-bold font-mono text-wx-tx1">{rc.waxTotal}</span>
                          </div>
                        </div>
                      </div>

                      {rc.savings && (
                        <div
                          className="rounded-xl p-4 flex items-center justify-between gap-4"
                          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)' }}
                        >
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-0.5" style={{ color: 'rgba(34,197,94,0.8)' }}>
                              {de ? 'Ersparnis über ~12.000 km' : 'Savings over ~12,000 km'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--txm)' }}>
                              {de
                                ? 'Weniger Kettenverschleiß, seltener Kassettenwechsel — nicht eingerechnet.'
                                : 'Reduced chain and cassette wear not included.'}
                            </p>
                          </div>
                          <span className="text-[22px] font-bold font-mono flex-shrink-0" style={{ color: '#22c55e' }}>
                            {rc.savings}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 300g nudge */}
              {isWax && product.weight === '300g' && (
                <div className="mt-8 rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
                  <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--txm)' }}>
                      {de
                        ? 'Fährst du mehr als einmal pro Woche? Der 500g-Block ist günstiger pro Anwendung.'
                        : 'Riding more than once a week? The 500g block works out cheaper per application.'}
                    </p>
                    <Link
                      to={`/produkt/${product.variant === 'pro' ? 'wax-500-mos2' : 'wax-500'}`}
                      className="inline-flex items-center gap-1 mt-1.5 text-xs hover:underline"
                      style={{ color: accentColor }}
                    >
                      {de ? '500g ansehen' : 'View 500g'} <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Chain V9 */}
              {isChain && rc.processSteps && rc.v9Bullets && (
                <div className="mt-8 rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
                  <button
                    onClick={() => setV9Expanded(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div>
                      <span className="text-sm font-medium text-wx-tx1">
                        {de ? 'Wachsprozess & V9 MoS₂ Formulierung' : 'Wax process & V9 MoS₂ formula'}
                      </span>
                      {!v9Expanded && (
                        <p className="text-xs text-wx-txff mt-0.5">
                          {de ? 'Ultraschall-Entfettung · MoS₂-Transferfilm · V9-Entwicklung' : 'Ultrasonic degreasing · MoS₂ transfer film · V9 development'}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                      style={{ color: 'var(--txff)', transform: v9Expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-250 ease-in-out"
                    style={{ gridTemplateRows: v9Expanded ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-6" style={{ borderTop: '1px solid var(--bd2)' }}>
                        <div className="pt-5">
                          <p className="text-xs font-semibold uppercase tracking-widest text-wx-txff mb-3">
                            {de ? 'Unser Wachsprozess' : 'Our waxing process'}
                          </p>
                          <div className="space-y-3">
                            {rc.processSteps.map(step => (
                              <div key={step.n} className="flex gap-4 rounded-xl p-4" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                                <span className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                                  style={{ background: accentBg, color: accentColor }}>{step.n}</span>
                                <div>
                                  <div className="text-sm font-semibold text-wx-tx1 mb-1">{step.title}</div>
                                  <div className="text-sm leading-relaxed" style={{ color: 'var(--txm)' }}>{step.body}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {rc.processNote && (
                            <p className="text-xs text-wx-txff mt-3 leading-relaxed">{rc.processNote}</p>
                          )}
                        </div>
                        {rc.v9Intro && (
                          <div className="rounded-xl p-5" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                            <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                              Waxcelerate V9 MoS₂
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--txm)' }}>{rc.v9Intro}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-wx-txff mb-3">
                            {de ? 'Warum V9 MoS₂?' : 'Why V9 MoS₂?'}
                          </p>
                          <div className="space-y-3">
                            {rc.v9Bullets.map((b, i) => (
                              <div key={i} className="flex gap-4 rounded-xl p-4" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                                <div>
                                  <div className="text-sm font-semibold text-wx-tx1 mb-1">{b.title}</div>
                                  <div className="text-sm leading-relaxed" style={{ color: 'var(--txm)' }}>{b.body}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {rc.v9Note && (
                            <div className="mt-4 rounded-xl border p-4 text-sm leading-relaxed"
                              style={{ borderColor: `${accentColor}25`, background: `${accentColor}08`, color: 'var(--txm)' }}>
                              {rc.v9Note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chain comparison */}
              {isChain && rc.chainCompRows && (
                <div className="mt-8">
                  <SectionHeading>{de ? 'Vorgewachst vs. Kettenöl' : 'Pre-waxed vs. chain oil'}</SectionHeading>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
                    <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-wider text-wx-txf px-4 py-3"
                      style={{ borderBottom: '1px solid var(--bd2)' }}>
                      <span />
                      <span className="text-center" style={{ color: accentColor }}>{de ? 'Vorgewachst' : 'Pre-waxed'}</span>
                      <span className="text-center text-wx-txff">{de ? 'Kettenöl' : 'Chain oil'}</span>
                    </div>
                    {rc.chainCompRows.map((row, ri) => (
                      <div key={ri} className="grid grid-cols-3 px-4 py-3" style={{ borderBottom: '1px solid var(--bd2)' }}>
                        <span className="text-wx-txf text-xs">{row.label}</span>
                        <span className="text-center text-xs font-medium" style={{ color: accentColor }}>{row.good}</span>
                        <span className="text-center text-xs text-wx-txff">{row.bad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isChain && rc.proTip && (
                <div className="mt-8 rounded-xl border p-5" style={{ borderColor: `${accentColor}30`, background: `${accentColor}08` }}>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                    {de ? 'Pro-Tipp' : 'Pro tip'}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--txm)' }}>{rc.proTip}</p>
                </div>
              )}

              {/* Compat tags */}
              {rc.compatTags && rc.compatTags.length > 0 && (
                <div className="mt-8">
                  <SectionHeading>{de ? 'Kompatibilität' : 'Compatibility'}</SectionHeading>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {rc.compatTags[0].map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full text-wx-tx2"
                          style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {rc.compatTags.length > 1 && (
                      <>
                        {compatExpanded && rc.compatTags.slice(1).map((group, gi) => (
                          <div key={gi} className="flex flex-wrap gap-1.5">
                            {group.map(tag => (
                              <span key={tag} className="text-xs px-2.5 py-1 rounded-full text-wx-txm"
                                style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        ))}
                        <button onClick={() => setCompatExpanded(v => !v)}
                          className="text-xs mt-1" style={{ color: accentColor }}>
                          {compatExpanded ? (de ? 'Weniger anzeigen' : 'Show less') : (de ? '+ alle anzeigen' : '+ show all')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {rc.reviewCount > 0 && (
                <div className="mt-8 rounded-xl px-4 py-4" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2, 3, 4].map(i => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: '#FBBF24' }} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-wx-tx1">
                        {rc.reviewCount}+ {de ? 'Bewertungen' : 'reviews'}
                      </span>
                    </div>
                    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: accentColor }}>
                      {de ? 'Alle' : 'All'} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {rc.reviewCats && <p className="text-[11px] text-wx-txff">{rc.reviewCats}</p>}
                </div>
              )}

              {rc.footerNote && (
                <p className="mt-8 text-xs text-wx-txff leading-relaxed pt-6" style={{ borderTop: '1px solid var(--bd2)' }}>
                  {rc.footerNote}
                </p>
              )}

              {/* Final CTA */}
              {isWax ? (
                <div className="mt-8 flex flex-col gap-1.5">
                  <AddToCartButton product={product} fullWidth />
                  <a
                    href={product.ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 text-[12px] transition-opacity hover:opacity-60"
                    style={{ color: 'var(--txm)' }}
                  >
                    {de ? 'Oder direkt bei eBay kaufen' : 'Or buy directly on eBay'}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <a
                  href={product.ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
                >
                  {de ? 'Jetzt bei eBay kaufen' : 'Buy now on eBay'} — {formatPrice(product.price)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
          {/* ── INLINE FAQ ── */}
          {isWax && product.faqIds && product.faqIds.length > 0 && (
            <div className="pb-8" style={{ borderTop: related.length > 0 ? 'none' : undefined }}>
              <ProductFAQ faqIds={product.faqIds} accentColor={accentColor} />
            </div>
          )}

          {/* ── RELATED PRODUCTS ── */}
          {related.length > 0 && (
            <section className="mt-12 pt-8" style={{ borderTop: '1px solid var(--bd)' }}>
              <h2 className="text-[15px] font-semibold text-wx-tx1 mb-4">
                {de ? 'Passend dazu' : 'You might also like'}
              </h2>
              <div className="flex flex-col gap-2">
                {related.map(p => <RelatedCard key={p.id} product={p} de={de} formatPrice={formatPrice} />)}
              </div>
            </section>
          )}

        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={gallery}
          activeIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
          onChange={(i) => setActiveImage(i)}
        />
      )}
    </>
    </PageTransition>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function AccordionItem({
  title, preview, open, onToggle, children,
}: {
  title: string;
  preview?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--bd2)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between py-3.5 text-left gap-3"
      >
        <div className="min-w-0">
          <span className="text-sm font-medium text-wx-tx1 block">{title}</span>
          {preview && !open && (
            <span className="text-[12px] mt-0.5 block truncate" style={{ color: 'var(--txff)' }}>
              {preview}
            </span>
          )}
        </div>
        <ChevronDown
          className="h-4 w-4 flex-shrink-0 transition-transform duration-200 mt-0.5"
          style={{ color: 'var(--txff)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-wx-txff mb-4">{children}</h3>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
      <span className="text-[10px] uppercase tracking-wide text-wx-txff">{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--txm)' }}>{value}</span>
    </div>
  );
}

function intervalPct(interval: string, maxKm = 600): number {
  const clean = interval.replace(/(\d)\.(\d{3})/g, '$1$2');
  const nums = clean.match(/\d+/g);
  if (!nums) return 0;
  const upper = parseInt(nums[nums.length - 1]);
  return Math.min(Math.round((upper / maxKm) * 100), 100);
}

function RelatedCard({ product: p, de, formatPrice }: { product: Product; de: boolean; formatPrice: (n: number) => string }) {
  const title = de ? p.title : p.titleEn;
  const cardInner = (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{ border: '1px solid var(--bd)', background: 'var(--sf)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd2)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd)'; }}
    >
      <img
        src={p.image}
        alt={title}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
      />
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-wx-tx1 leading-tight truncate">{title}</p>
        <p className="text-[13px] mt-1" style={{ color: '#1A3C6E' }}>{formatPrice(p.price)}</p>
      </div>
    </div>
  );

  if (p.category === 'wax') {
    return <Link to={`/produkt/${p.id}`}>{cardInner}</Link>;
  }
  return (
    <a href={p.ebayUrl} target="_blank" rel="noopener noreferrer">
      {cardInner}
    </a>
  );
}
