// ─── /zubehoer/:slug — standalone purchase page for a single accessory ───────
//
// acc-wire and acc-pliers used to be visible only as two hairline rows at the
// bottom of /starter-set (name, price, one sentence) — enough for someone who
// already knows what they want, but no way to land here directly, see it
// properly, or buy just this one part. This gives each its own page in the
// same visual language as the wax/chain product pages (dark hero photo,
// highlights, spec table) without pulling them into ProductDetailPage, which
// is built entirely around wax formulas and chain compatibility — neither
// applies here.

import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { getAccessoryBySlug } from '@/lib/data';
import { trackEbayClick } from '@/lib/analytics';
import { removeStaticJsonLd } from '@/lib/utils';

const W = 'mx-auto w-full max-w-3xl px-6 sm:px-10 lg:px-14';

export function AccessoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const de = lang === 'de';
  const acc = slug ? getAccessoryBySlug(slug) : undefined;

  // Prerenderte HTML fuer diese Route liefert bereits dasselbe Product +
  // BreadcrumbList JSON-LD (data-prerendered-ld, siehe generate-accessory-html.mjs)
  // — ohne das hier haeuften sich zwei Product-Bloecke im Live-DOM nach dem
  // Hydrieren, derselbe Fix wie auf ProductDetailPage.tsx/BlogArticlePage.tsx.
  useEffect(() => { removeStaticJsonLd(); }, [slug]);

  if (!acc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--pg)' }}>
        <p style={{ color: 'var(--txm)' }}>{de ? 'Nicht gefunden.' : 'Not found.'}</p>
        <BackLink de={de} />
      </div>
    );
  }

  const titleText = de ? acc.title : acc.titleEn;
  const descriptionText = de ? acc.description : acc.descriptionEn;
  const highlights = de ? acc.highlights : acc.highlightsEn;
  const howTo = de ? acc.howTo : acc.howToEn;
  // First two spec entries are the "take it with you" numbers (weight, size /
  // quantity) — shown big, right under the price, since that is the actual
  // reason to buy this over whatever's already in a drawer at home.
  const specEntries = acc.specs ? Object.entries(acc.specs) : [];
  const statChips = specEntries.slice(0, 2);
  const secondaryImage = acc.images?.[0];
  const canonicalUrl = `https://waxcelerate.de/zubehoer/${acc.slug}`;
  const metaTitle = `${titleText} | Waxcelerate`;

  const fmt = (n: number) =>
    n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  const productSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: titleText, description: descriptionText, image: `https://waxcelerate.de${acc.image}`, sku: acc.id,
    brand: { '@type': 'Brand', name: 'Waxcelerate' },
    url: canonicalUrl,
    offers: acc.ebayUrl ? {
      '@type': 'Offer', price: acc.price.toFixed(2), priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock', url: acc.ebayUrl,
      // Per @id auf den Organization-Knoten aus index.html verweisen statt
      // einen zweiten, unverbundenen Waxcelerate-Knoten aufzumachen — deckt
      // sich mit generate-accessory-html.mjs/ProductDetailPage.tsx.
      seller: { '@id': 'https://waxcelerate.de/#organization' },
    } : undefined,
  });

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={descriptionText} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={descriptionText} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={`https://waxcelerate.de${acc.image}`} />
        <script type="application/ld+json">{productSchema}</script>
      </Helmet>

      <Navigation />

      <section className="relative pt-24 sm:pt-28 pb-8" style={{ background: 'var(--pg)' }}>
        <div className={W}>
          <BackLink de={de} className="mb-5 sm:mb-6" />
          <div className="pdp-dark relative rounded-2xl overflow-hidden"
            style={{ aspectRatio: '21 / 9', minHeight: 210, background: 'var(--hero-stage)' }}>
            <img src={acc.image} alt={titleText} className="absolute inset-0 w-full h-full object-cover" />
            <div aria-hidden className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.80) 0%, rgba(var(--scrim-rgb),0.34) 46%, rgba(var(--scrim-rgb),0.04) 100%)' }} />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <h1 className="font-display font-bold leading-[1.05]"
                style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3.6vw, 2.3rem)', letterSpacing: '-0.02em' }}>
                {titleText}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14 sm:pb-20">
        <div className={W}>
          <p className="text-[15px] leading-[1.7] mb-6" style={{ color: 'var(--txm)' }}>
            {descriptionText}
          </p>

          {/* ── Kennzahlen-Chips: Gewicht/Maße bzw. Menge/Länge groß, weil das
              der eigentliche Kaufgrund ist ("ideales Fahrradtool zum
              Mitnehmen"), nicht Fließtext darüber. ── */}
          {statChips.length > 0 && (
            <div className="flex gap-3 mb-6">
              {statChips.map(([l, v]) => (
                <div key={l} className="flex-1 rounded-xl px-4 py-3 text-center"
                  style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
                  <p className="num-data font-display font-bold leading-none" style={{ fontSize: '1.4rem', color: 'var(--tx1)' }}>{v}</p>
                  <p className="text-meta uppercase tracking-[0.1em] mt-1" style={{ color: 'var(--txff)' }}>{l}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Preis + Kaufen ── */}
          <div className="flex items-center justify-between gap-5 pb-8 mb-8" style={{ borderBottom: '1px solid var(--bd2)' }}>
            <p className="font-display font-bold text-wx-tx1 leading-none" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
              {fmt(acc.price)}
            </p>
            {acc.ebayUrl ? (
              <a href={acc.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(acc.id)}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-[14px] font-semibold flex-shrink-0 active:scale-[0.97] transition-opacity hover:opacity-90"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
                {de ? 'Kaufen' : 'Buy'} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="text-[13px] font-semibold flex-shrink-0" style={{ color: 'var(--txf)' }}>
                {de ? 'Demnächst auf eBay' : 'Coming soon on eBay'}
              </span>
            )}
          </div>

          {/* ── Highlights ── */}
          {highlights && highlights.length > 0 && (
            <ul className="space-y-2.5 mb-10">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-[14px]" style={{ color: 'var(--tx2)' }}>
                  <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* ── Sekundäres Foto ── */}
          {secondaryImage && (
            <img src={secondaryImage} alt="" aria-hidden
              className="w-full rounded-xl mb-10" style={{ aspectRatio: '3 / 2', objectFit: 'cover' }} />
          )}

          {/* ── Spezifikationen ── */}
          {acc.specs && (
            <div className="mb-10">
              <p className="text-small font-semibold uppercase tracking-[0.14em] mb-3"
                style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                {de ? 'Spezifikationen' : 'Specifications'}
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
                {Object.entries(acc.specs).map(([l, v], i, arr) => (
                  <div key={l} className="flex items-baseline justify-between px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd)' : 'none', background: i % 2 === 0 ? 'var(--sf2)' : 'var(--pg)' }}>
                    <span className="text-meta uppercase tracking-[0.14em]"
                      style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--txff)' }}>
                      {l}
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--tx1)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── So funktioniert's ── */}
          {howTo && (
            <div className="mb-10">
              <p className="text-small font-semibold uppercase tracking-[0.14em] mb-3"
                style={{ color: 'var(--txff)', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
                {de ? "So funktioniert's" : 'How it works'}
              </p>
              <p className="text-[14px] leading-[1.7]" style={{ color: 'var(--tx2)' }}>{howTo}</p>
            </div>
          )}

          {/* ── Cross-Link Starter-Set ── */}
          <div className="rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
            <p className="text-[13.5px]" style={{ color: 'var(--tx2)' }}>
              {de
                ? 'Im Starter-Set enthalten — zusammen mit Wachs und vorgewachster Kette günstiger als einzeln.'
                : 'Included in the starter set — bundled with wax and a pre-waxed chain for less than buying separately.'}
            </p>
            <Link to="/starter-set"
              className="text-[13.5px] font-semibold flex-shrink-0 hover:underline"
              style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Starter-Set ansehen →' : 'View starter set →'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
