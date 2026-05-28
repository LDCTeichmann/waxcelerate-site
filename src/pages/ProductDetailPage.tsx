import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, ExternalLink, Check,
  ChevronRight, ChevronDown, Star,
} from 'lucide-react';
import { getProductById } from '@/lib/data';
import { richContent } from '@/lib/productContent';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CartIcon } from '@/components/CartIcon';

type RichTab = 'formula' | 'vergleich' | 'kosten';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const product = id ? getProductById(id) : undefined;
  const de = lang === 'de';

  const [activeImage, setActiveImage] = useState(0);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [compatExpanded, setCompatExpanded] = useState(false);
  const [v9Expanded, setV9Expanded] = useState(false);
  const [richTab, setRichTab] = useState<RichTab>('formula');

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
  const accentColor = isPro ? '#4A72D4' : '#2B52B0';
  const accentBg = isPro ? 'rgba(74,114,212,0.08)' : 'rgba(43,82,176,0.08)';

  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price), [lang]);

  const gallery = [product.image, ...(product.images ?? [])];

  const highlights = de ? product.highlights : product.highlightsEn;
  const bestFor = de ? product.bestFor : product.bestForEn;
  const descriptionText = de ? product.description : product.descriptionEn;
  const titleText = de ? product.title : product.titleEn;

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
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: '168',
        bestRating: '5',
        worstRating: '1',
      },
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

  const tabs: { key: RichTab; label: string }[] = [
    ...(hasFormula ? [{ key: 'formula' as RichTab, label: de ? 'Formel' : 'Formula' }] : []),
    ...(hasVergleich ? [{ key: 'vergleich' as RichTab, label: de ? 'Vergleich' : 'Comparison' }] : []),
    ...(hasKosten ? [{ key: 'kosten' as RichTab, label: de ? 'Kosten' : 'Costs' }] : []),
  ];

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
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {product.image && <meta name="twitter:image" content={product.image} />}
      <script type="application/ld+json">{breadcrumbSchema}</script>
      <script type="application/ld+json">{productSchema}</script>
    </Helmet>
    <div className="min-h-screen text-wx-tx1" style={{ background: 'var(--pg)' }}>
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: 'var(--sf)', borderColor: 'var(--bd2)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2.5">
          <Link to="/" className="flex-shrink-0">
            <img src="/images/logo.jpg" alt="Waxcelerate" className="h-7 w-auto rounded-md" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-wx-txff" />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-wx-txm hover:text-wx-tx1 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-wx-txff" />
          <span className="text-sm text-wx-txff truncate flex-1 min-w-0">{titleText}</span>
          <CartIcon />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── HERO: image + info ── */}
        <div className="py-10 grid lg:grid-cols-[55fr_45fr] gap-10 items-start">

          {/* Left — image gallery */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-3">
            {/* Main image */}
            <div
              className="relative rounded-2xl overflow-hidden aspect-square"
              style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)' }}
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
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.30) 0%, transparent 45%)' }}
              />
              {product.badge && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}
                >
                  {de ? product.badge : product.badgeEn}
                </span>
              )}
              {(isPro || isClassic) && (
                <span
                  className="absolute bottom-4 left-4 text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
                  style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}50`, backdropFilter: 'blur(6px)' }}
                >
                  {isPro ? 'Pro' : 'Classic'}{product.weight ? ` · ${product.weight}` : ''}
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {gallery.length > 1 && (
              <div className="flex gap-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="flex-1 rounded-xl overflow-hidden aspect-square transition-all"
                    style={{
                      border: i === activeImage
                        ? `2px solid ${accentColor}`
                        : '2px solid var(--bd2)',
                      opacity: i === activeImage ? 1 : 0.55,
                    }}
                  >
                    <img
                      src={img}
                      alt={`${titleText} ${i + 1}`}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: product.imagePosition ?? 'center' }}
                      onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="flex flex-col gap-4">

            {/* Title + description */}
            <div>
              <h1 className="text-2xl sm:text-[26px] font-bold text-wx-tx1 leading-tight tracking-[-0.02em] mb-1.5">
                {titleText}
              </h1>
              <p className="text-wx-txm text-[13px] leading-relaxed">{descriptionText}</p>
            </div>

            {/* Price + CTAs */}
            <div className="py-4" style={{ borderTop: '1px solid var(--bd2)', borderBottom: '1px solid var(--bd2)' }}>
              <div className="flex items-baseline gap-2.5 mb-3">
                <span className="text-[30px] font-bold text-wx-tx1 tracking-[-0.02em] leading-none">
                  {formatPrice(product.price)}
                </span>
                {product.applications && (
                  <span className="text-[12px]" style={{ color: 'var(--txf)' }}>
                    ~{formatPrice(product.price / parseFloat(product.applications.split('–')[1] ?? product.applications))}/{de ? 'Anwendung' : 'use'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isWax && <AddToCartButton product={product} />}
                <a
                  href={product.ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 ${
                    isWax
                      ? 'px-4 py-2.5 text-wx-txm border hover:text-wx-tx1'
                      : 'px-5 py-2.5 text-white'
                  }`}
                  style={isWax
                    ? { background: 'var(--sf2)', borderColor: 'var(--bd2)' }
                    : { background: accentColor }
                  }
                >
                  {de ? 'Bei eBay kaufen' : 'Buy on eBay'}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Interval stats — clean inline numbers */}
            {(product.intervalDry || product.intervalWet || product.intervalTopup) && (
              <div className="flex gap-5">
                {product.intervalDry && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] font-medium mb-1" style={{ color: 'var(--txff)' }}>
                      {de ? 'Trocken' : 'Dry'}
                    </p>
                    <p className="text-[17px] font-bold text-wx-tx1 leading-none">{product.intervalDry}</p>
                  </div>
                )}
                {product.intervalWet && (
                  <>
                    <div className="w-px self-stretch" style={{ background: 'var(--bd2)' }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] font-medium mb-1" style={{ color: 'var(--txff)' }}>
                        {de ? 'Nass' : 'Wet'}
                      </p>
                      <p className="text-[17px] font-bold text-wx-tx1 leading-none">{product.intervalWet}</p>
                    </div>
                  </>
                )}
                {product.intervalTopup && (
                  <>
                    <div className="w-px self-stretch" style={{ background: 'var(--bd2)' }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] font-medium mb-1" style={{ color: 'var(--txff)' }}>
                        {de ? 'Max. Topup' : 'Max. topup'}
                      </p>
                      <p className="text-[17px] font-bold text-wx-tx1 leading-none">{product.intervalTopup}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Best-for tags */}
            {bestFor && bestFor.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {bestFor.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}30` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Accordion: Highlights */}
            {highlights && highlights.length > 0 && (
              <AccordionItem
                title={de ? 'Das Wichtigste' : 'Key Features'}
                preview={highlights[0]}
                open={highlightsOpen}
                onToggle={() => setHighlightsOpen(v => !v)}
              >
                <ul className="space-y-2.5 pt-3">
                  {highlights.map(h => (
                    <li key={h} className="flex items-start gap-3 text-sm text-wx-txm">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            )}

            {/* Accordion: Specs */}
            {(product.compatibility || product.weight || product.applications || product.chainLinks || product.chainSpeed) && (
              <AccordionItem
                title={de ? 'Kompatibilität & Specs' : 'Compatibility & Specs'}
                open={specsOpen}
                onToggle={() => setSpecsOpen(v => !v)}
              >
                <div className="grid grid-cols-2 gap-2 pt-3">
                  {product.compatibility && <SpecRow label={de ? 'Kompatibel' : 'Compatible'} value={product.compatibility} />}
                  {product.weight && <SpecRow label={de ? 'Gewicht' : 'Weight'} value={product.weight} />}
                  {product.applications && <SpecRow label={de ? 'Anwendungen' : 'Applications'} value={product.applications} />}
                  {isWax && <SpecRow label={de ? 'Verarbeitung' : 'Processing'} value="80–90°C" />}
                  {product.chainLinks && <SpecRow label={de ? 'Glieder' : 'Links'} value={product.chainLinks} />}
                  {product.chainSpeed && <SpecRow label={de ? 'Schaltung' : 'Speed'} value={product.chainSpeed} />}
                </div>
              </AccordionItem>
            )}

            {/* Classic → Pro upsell */}
            {isClassic && (
              <div className="rounded-xl border border-[#4A72D4]/20 bg-[#4A72D4]/5 p-4">
                <p className="text-xs" style={{ color: 'var(--tx2)' }}>
                  {de
                    ? 'Fahre viel im Herbst/Winter oder bei Regen? Das Pro mit MoS₂ bietet längere Intervalle und Rostschutz.'
                    : 'Ride a lot in autumn/winter or rain? Pro with MoS₂ offers longer intervals and rust protection.'}
                </p>
                <Link
                  to={`/produkt/${product.weight === '500g' ? 'wax-500-mos2' : 'wax-300-mos2'}`}
                  className="inline-flex items-center gap-1 mt-2 text-xs text-[#4A72D4] hover:underline"
                >
                  {de ? 'Pro ansehen' : 'View Pro'} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Bottom eBay CTA */}
            <a
              href={product.ebayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-wx-tx1 transition-all"
              style={{ border: '1px solid var(--bd)' }}
            >
              {de ? 'Jetzt bei eBay kaufen' : 'Buy now on eBay'}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* ── RICH CONTENT ── */}
        {rc && (
          <div className="pb-20 space-y-8 pt-10" style={{ borderTop: '1px solid var(--bd2)' }}>

            {/* Chain hook */}
            {isChain && rc.hook && (
              <p className="text-[15px] leading-[1.8] text-wx-txm max-w-2xl">{rc.hook}</p>
            )}

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rc.stats.map((s, i) => (
                <div key={i} className="rounded-xl px-4 py-4" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                  <div className="text-xl sm:text-2xl font-bold tabular-nums mb-1" style={{ color: 'var(--tx1)' }}>{s.value}</div>
                  <div className="text-xs font-medium text-wx-tx2 leading-snug mb-0.5">{s.label}</div>
                  {s.sub && <div className="text-[10px] text-wx-txff leading-snug">{s.sub}</div>}
                </div>
              ))}
            </div>

            {/* ── CHAIN SPEC TABLE ── */}
            {isChain && rc.chainSpec && (
              <div>
                <SectionHeading>{de ? 'Technische Daten' : 'Technical specs'}</SectionHeading>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
                  {Object.entries(rc.chainSpec).map(([key, val], i, arr) => (
                    <div key={key} className="flex gap-4 px-4 py-3 text-sm"
                      style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}>
                      <span className="text-wx-txff w-32 flex-shrink-0 text-xs">{key}</span>
                      <span className="text-wx-txm">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── WAX: tabbed content ── */}
            {isWax && tabs.length > 0 && (
              <div>
                {/* Tab bar */}
                <div
                  className="flex rounded-xl overflow-hidden mb-6"
                  style={{ border: '1px solid var(--bd2)', background: 'var(--sf)' }}
                >
                  {tabs.map((tab, i) => (
                    <button
                      key={tab.key}
                      onClick={() => setRichTab(tab.key)}
                      className="flex-1 py-2.5 text-[13px] font-medium transition-all"
                      style={{
                        background: richTab === tab.key ? 'var(--sf2)' : 'transparent',
                        color: richTab === tab.key ? 'var(--tx1)' : 'var(--txm)',
                        borderRight: i < tabs.length - 1 ? '1px solid var(--bd2)' : 'none',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Formel */}
                {richTab === 'formula' && rc.formulaDetails && (
                  <div className="space-y-3">
                    {rc.formulaDetails.map((f, i) => (
                      <div key={i} className="rounded-xl p-4 flex gap-4" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                        <span
                          className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                          style={{ background: accentBg, color: accentColor }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-wx-tx1 mb-1">{f.name}</div>
                          <div className="text-sm text-wx-txm leading-relaxed">{f.detail}</div>
                        </div>
                      </div>
                    ))}
                    {rc.techNote && (
                      <div
                        className="rounded-xl border p-5 mt-1"
                        style={{ background: `${accentColor}0A`, borderColor: `${accentColor}30` }}
                      >
                        <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                          {rc.techNote.title}
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--tx2)' }}>{rc.techNote.body}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vergleich */}
                {richTab === 'vergleich' && rc.compHeaders && rc.compRows && (
                  <div className="space-y-5">
                    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--bd2)' }}>
                      <div style={{ minWidth: '420px' }}>
                        <div
                          className="grid text-[10px] font-semibold uppercase tracking-wider text-wx-txf px-4 py-3"
                          style={{ gridTemplateColumns: `1.6fr repeat(${rc.compHeaders.length}, 1fr)`, borderBottom: '1px solid var(--bd2)' }}
                        >
                          <span></span>
                          {rc.compHeaders.map((h, i) => (
                            <span key={i} className="text-center leading-tight whitespace-nowrap">
                              {h.replace('Waxcelerate ', '').replace('-Heißwachs', '').replace('Heißwachs', '')}
                            </span>
                          ))}
                        </div>
                        {rc.compRows.map((row, ri) => (
                          <div
                            key={ri}
                            className="grid px-4 py-3 last:border-0"
                            style={{ gridTemplateColumns: `1.6fr repeat(${rc.compHeaders!.length}, 1fr)`, borderBottom: '1px solid var(--bd2)' }}
                          >
                            <span className="text-wx-txm text-xs whitespace-nowrap pr-3">{row.label}</span>
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
                      <p className="text-[11px] text-wx-txff mt-2 px-1">{rc.compFootnote}</p>
                    )}
                  </div>
                )}

                {/* Kosten */}
                {richTab === 'kosten' && rc.oilItems && rc.waxItems && (
                  <div className="space-y-4">
                    {/* Scenario explanation */}
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

                    {/* Side-by-side cost cards */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* Oil */}
                      <div className="rounded-xl p-4" style={{ border: '1px solid var(--bd2)' }}>
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-wx-txff mb-3">
                          {rc.oilCount ? `${rc.oilCount} ${rc.oilLabel}` : de ? 'Mit Kettenöl' : 'With chain oil'}
                        </div>
                        <div className="space-y-2 mb-4">
                          {rc.oilItems.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-wx-txm">{item.label}</span>
                              <span className="font-mono" style={{ color: 'var(--tx2)' }}>{item.cost}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 flex justify-between items-baseline" style={{ borderTop: '1px solid var(--bd2)' }}>
                          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--txf)' }}>{de ? 'Gesamt' : 'Total'}</span>
                          <span className="text-[18px] font-bold font-mono" style={{ color: '#ef4444' }}>{rc.oilTotal}</span>
                        </div>
                      </div>

                      {/* Wax */}
                      <div className="rounded-xl p-4" style={{ border: `1px solid ${accentColor}30`, background: `${accentColor}06` }}>
                        <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                          {rc.waxCount ? `${rc.waxCount} ${rc.waxLabel}` : de ? 'Mit Waxcelerate' : 'With Waxcelerate'}
                        </div>
                        <div className="space-y-2 mb-4">
                          {rc.waxItems.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-wx-txm">{item.label}</span>
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

                    {/* Savings callout — green */}
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
                              : 'Reduced chain and cassette wear not included in this calculation.'}
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

            {/* ── 300g → 500g nudge ── */}
            {isWax && product.weight === '300g' && (
              <div className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
                <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                <div>
                  <p className="text-sm text-wx-txm">
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

            {/* ── CHAIN V9 — collapsible ── */}
            {isChain && rc.processSteps && rc.v9Bullets && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
                <button onClick={() => setV9Expanded(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
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
                  <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                    style={{ color: 'var(--txff)', transform: v9Expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                <div className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
                  style={{ gridTemplateRows: v9Expanded ? '1fr' : '0fr' }}>
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
                                <div className="text-sm text-wx-txm leading-relaxed">{step.body}</div>
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
                          <p className="text-sm text-wx-txm leading-relaxed">{rc.v9Intro}</p>
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
                                <div className="text-sm text-wx-txm leading-relaxed">{b.body}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {rc.v9Note && (
                          <div className="mt-4 rounded-xl border p-4 text-sm text-wx-txm leading-relaxed"
                            style={{ borderColor: `${accentColor}25`, background: `${accentColor}08` }}>
                            {rc.v9Note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CHAIN COMPARISON TABLE ── */}
            {isChain && rc.chainCompRows && (
              <div>
                <SectionHeading>{de ? 'Vorgewachst vs. Kettenöl' : 'Pre-waxed vs. chain oil'}</SectionHeading>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
                  <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-wider text-wx-txf px-4 py-3" style={{ borderBottom: '1px solid var(--bd2)' }}>
                    <span></span>
                    <span className="text-center" style={{ color: accentColor }}>{de ? 'Vorgewachst' : 'Pre-waxed'}</span>
                    <span className="text-center text-wx-txff">{de ? 'Kettenöl' : 'Chain oil'}</span>
                  </div>
                  {rc.chainCompRows.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-3 px-4 py-3 last:border-0" style={{ borderBottom: '1px solid var(--bd2)' }}>
                      <span className="text-wx-txf text-xs">{row.label}</span>
                      <span className="text-center text-xs font-medium" style={{ color: accentColor }}>{row.good}</span>
                      <span className="text-center text-xs text-wx-txff">{row.bad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro tip */}
            {isChain && rc.proTip && (
              <div className="rounded-xl border p-5" style={{ borderColor: `${accentColor}30`, background: `${accentColor}08` }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                  {de ? 'Pro-Tipp' : 'Pro tip'}
                </div>
                <p className="text-sm text-wx-txm leading-relaxed">{rc.proTip}</p>
              </div>
            )}

            {/* ── COMPAT TAGS ── */}
            {rc.compatTags && rc.compatTags.length > 0 && (
              <div>
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
                        className="text-xs mt-1 transition-colors" style={{ color: accentColor }}>
                        {compatExpanded ? (de ? 'Weniger anzeigen' : 'Show less') : (de ? '+ alle anzeigen' : '+ show all')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── REVIEW STRIP ── */}
            {rc.reviewCount > 0 && (
              <div className="rounded-xl px-4 py-4" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
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

            {/* ── FOOTER NOTE ── */}
            {rc.footerNote && (
              <p className="text-xs text-wx-txff leading-relaxed pt-6" style={{ borderTop: '1px solid var(--bd2)' }}>
                {rc.footerNote}
              </p>
            )}

            {/* ── FINAL CTA ── */}
            <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: accentColor }}>
              {de ? 'Jetzt bei eBay kaufen' : 'Buy now on eBay'} — {formatPrice(product.price)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

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
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between px-4 py-3.5 text-left gap-3"
        style={{ background: open ? 'var(--sf3)' : 'transparent' }}
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
          <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--bd2)' }}>
            {children}
          </div>
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
      <span className="text-sm text-wx-txm font-medium">{value}</span>
    </div>
  );
}
