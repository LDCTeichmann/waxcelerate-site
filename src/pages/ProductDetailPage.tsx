import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, ExternalLink, Check, Thermometer, Droplets, Zap,
  ChevronRight, ChevronDown, Star,
} from 'lucide-react';
import { getProductById } from '@/lib/data';
import { richContent } from '@/lib/productContent';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const product = id ? getProductById(id) : undefined;
  const de = lang === 'de';

  const [compatExpanded, setCompatExpanded] = useState(false);
  const [v9Expanded, setV9Expanded] = useState(false);

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

  const formula = de ? product.formula : product.formulaEn;
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
        reviewCount: '164',
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
      {/* Site logo header — visible to direct-link visitors */}
      <header style={{ background: 'var(--sf3)', borderBottom: '1px solid var(--bd)', padding: '0 1rem' }}>
        <div className="max-w-5xl mx-auto h-12 flex items-center">
          <Link to="/" className="text-lg font-bold tracking-tight text-white">
            WAX<span style={{ color: '#2B52B0' }}>CELERATE</span>
          </Link>
        </div>
      </header>
      {/* Nav */}
      <div className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: 'var(--sf)', borderColor: 'var(--bd2)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-wx-txm hover:text-wx-tx1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-wx-txff" />
          <span className="text-sm text-wx-txff truncate">{titleText}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── TOP SECTION: image + basics ── */}
        <div className="py-10 grid lg:grid-cols-2 gap-12 items-start">

          {/* Left — image */}
          <div className="lg:sticky lg:top-24">
            <div
              className="relative rounded-2xl overflow-hidden aspect-square"
              style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)' }}
            >
              <div
                className="absolute inset-0 opacity-30 z-10"
                style={{ background: `radial-gradient(60% 60% at 30% 30%, ${accentColor}14, transparent)` }}
              />
              <img
                src={product.image}
                alt={titleText}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
              />
              {product.badge && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
                  style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}40` }}
                >
                  {de ? product.badge : product.badgeEn}
                </span>
              )}
            </div>

            {/* Interval pills */}
            {(product.intervalDry || product.intervalWet) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {product.intervalDry && (
                  <IntervalPill icon={<Zap className="h-3.5 w-3.5" />} label={de ? 'Trocken' : 'Dry'} value={product.intervalDry} color={accentColor} />
                )}
                {product.intervalWet && (
                  <IntervalPill icon={<Droplets className="h-3.5 w-3.5" />} label={de ? 'Nass' : 'Wet'} value={product.intervalWet} color="#64748B" />
                )}
                {product.intervalTopup && (
                  <IntervalPill icon={<Thermometer className="h-3.5 w-3.5" />} label={de ? 'Max. (Topup)' : 'Max. (topup)'} value={product.intervalTopup} color={accentColor} wide />
                )}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="flex flex-col gap-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-wx-tx1 leading-tight mb-2">{titleText}</h1>
              <p className="text-wx-txm text-sm leading-relaxed mb-5">{descriptionText}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-3xl font-bold text-wx-tx1">{formatPrice(product.price)}</span>
                <div className="flex items-center gap-2.5 flex-wrap">
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
            </div>

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <SectionBlock title={de ? 'Das Wichtigste' : 'Key Features'}>
                <ul className="space-y-2.5">
                  {highlights.map(h => (
                    <li key={h} className="flex items-start gap-3 text-sm text-wx-txm">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            )}

            {/* Best for */}
            {bestFor && bestFor.length > 0 && (
              <SectionBlock title={de ? 'Am besten für' : 'Best for'}>
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
              </SectionBlock>
            )}

            {/* Simple formula list */}
            {formula && formula.length > 0 && !rc?.formulaDetails && (
              <SectionBlock title={de ? 'Zusammensetzung' : 'Formula'}>
                <div className="space-y-1.5">
                  {formula.map((ingredient, i) => (
                    <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                      <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: accentBg, color: accentColor }}>{i + 1}</span>
                      <span className="text-sm text-wx-txm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            )}

            {/* Compatibility & specs */}
            <SectionBlock title={de ? 'Kompatibilität & Specs' : 'Compatibility & Specs'}>
              <div className="grid grid-cols-2 gap-2">
                {product.compatibility && <SpecRow label={de ? 'Kompatibel' : 'Compatible'} value={product.compatibility} />}
                {product.weight && <SpecRow label={de ? 'Gewicht' : 'Weight'} value={product.weight} />}
                {product.applications && <SpecRow label={de ? 'Anwendungen' : 'Applications'} value={product.applications} />}
                {isWax && <SpecRow label={de ? 'Verarbeitung' : 'Processing'} value="80–90°C" />}
                {product.chainLinks && <SpecRow label={de ? 'Glieder' : 'Links'} value={product.chainLinks} />}
                {product.chainSpeed && <SpecRow label={de ? 'Schaltung' : 'Speed'} value={product.chainSpeed} />}
              </div>
            </SectionBlock>

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

            {/* Bottom CTA */}
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
                  <div className="text-xl sm:text-2xl font-bold tabular-nums mb-1" style={{ color: accentColor }}>{s.value}</div>
                  <div className="text-xs font-medium text-wx-tx2 leading-snug mb-0.5">{s.label}</div>
                  {s.sub && <div className="text-[10px] text-wx-txff leading-snug">{s.sub}</div>}
                </div>
              ))}
            </div>

            {/* ── CHAIN SPEC — immediately after stats, unique per chain ── */}
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

            {/* ── WAX-SPECIFIC ── */}
            {isWax && rc.formulaDetails && (
              <>
                <div>
                  <SectionHeading>{de ? 'Zusammensetzung' : 'Formula'}</SectionHeading>
                  <div className="space-y-3">
                    {rc.formulaDetails.map((f, i) => (
                      <div key={i} className="rounded-xl p-4 flex gap-4" style={{ border: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
                        <span className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                          style={{ background: accentBg, color: accentColor }}>{i + 1}</span>
                        <div>
                          <div className="text-sm font-semibold text-wx-tx1 mb-1">{f.name}</div>
                          <div className="text-sm text-wx-txm leading-relaxed">{f.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {rc.techNote && (
                  <div className="rounded-xl border p-5"
                    style={{ background: `${accentColor}0A`, borderColor: `${accentColor}30` }}>
                    <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                      {rc.techNote.title}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--tx2)' }}>{rc.techNote.body}</p>
                  </div>
                )}

                {rc.compHeaders && rc.compRows && (
                  <div>
                    <SectionHeading>{de ? 'Vergleich' : 'Comparison'}</SectionHeading>
                    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--bd2)' }}>
                      <div style={{ minWidth: '420px' }}>
                        <div className="grid text-[10px] font-semibold uppercase tracking-wider text-wx-txf px-4 py-3"
                          style={{ gridTemplateColumns: `1.6fr repeat(${rc.compHeaders.length}, 1fr)`, borderBottom: '1px solid var(--bd2)' }}>
                          <span></span>
                          {rc.compHeaders.map((h, i) => (
                            <span key={i} className="text-center leading-tight whitespace-nowrap">
                              {h.replace('Waxcelerate ', '').replace('-Heißwachs', '').replace('Heißwachs', '')}
                            </span>
                          ))}
                        </div>
                        {rc.compRows.map((row, ri) => (
                          <div key={ri} className="grid px-4 py-3 last:border-0"
                            style={{ gridTemplateColumns: `1.6fr repeat(${rc.compHeaders!.length}, 1fr)`, borderBottom: '1px solid var(--bd2)' }}>
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

                {rc.oilItems && rc.waxItems && (
                  <div>
                    <SectionHeading>{de ? 'Kostenvergleich' : 'Cost comparison'}</SectionHeading>
                    {rc.costExample && <p className="text-xs text-wx-txf -mt-2 mb-2">{rc.costExample}</p>}
                    {rc.costNote && <p className="text-xs text-wx-txff mb-4">{rc.costNote}</p>}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl p-4" style={{ border: '1px solid var(--bd2)' }}>
                        <div className="text-xs font-semibold uppercase tracking-widest text-wx-txff mb-3">
                          {rc.oilCount ? `${rc.oilCount} ${rc.oilLabel}` : de ? 'Mit Kettenöl' : 'With chain oil'}
                        </div>
                        <div className="space-y-2 mb-4">
                          {rc.oilItems.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-wx-txm">{item.label}</span>
                              <span className="text-wx-tx2 font-mono">{item.cost}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 flex justify-between" style={{ borderTop: '1px solid var(--bd2)' }}>
                          <span className="text-xs font-semibold text-wx-txf uppercase tracking-wide">{de ? 'Gesamt' : 'Total'}</span>
                          <span className="text-base font-bold text-red-500 font-mono">{rc.oilTotal}</span>
                        </div>
                      </div>
                      <div className="rounded-xl border p-4" style={{ borderColor: `${accentColor}40`, background: `${accentColor}08` }}>
                        <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                          {rc.waxCount ? `${rc.waxCount} ${rc.waxLabel}` : de ? 'Mit Waxcelerate' : 'With Waxcelerate'}
                        </div>
                        <div className="space-y-2 mb-4">
                          {rc.waxItems.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-wx-txm">{item.label}</span>
                              <span className="text-wx-tx2 font-mono">{item.cost}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-3 flex justify-between" style={{ borderColor: `${accentColor}20` }}>
                          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: accentColor }}>{de ? 'Gesamt' : 'Total'}</span>
                          <span className="text-base font-bold font-mono text-wx-tx1">{rc.waxTotal}</span>
                        </div>
                      </div>
                    </div>
                    {rc.savings && (
                      <div className="mt-3 text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
                          style={{ background: `${accentColor}15`, color: accentColor }}>{rc.savings}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
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
                  <Link to={`/produkt/${product.variant === 'pro' ? 'wax-500-mos2' : 'wax-500'}`}
                    className="inline-flex items-center gap-1 mt-1.5 text-xs hover:underline"
                    style={{ color: accentColor }}>
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
                        style={{ borderColor: 'var(--bd2)', background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
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

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-wx-txff mb-3">{title}</h2>
      {children}
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

function IntervalPill({
  icon, label, value, color, wide,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${wide ? 'col-span-2' : ''}`}
      style={{ background: `${color}0D`, borderColor: `${color}30` }}
    >
      <span style={{ color }}>{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-wx-txff">{label}</span>
        <span className="text-sm font-semibold text-wx-tx1">{value}</span>
      </div>
    </div>
  );
}
