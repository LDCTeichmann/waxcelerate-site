// ─── /zubehoer/:slug — Einzelseite für Draht und Zange ──────────────────────
//
// v2 (16.09.2026, Luca: „die Einzelseiten sehen blöd aus"): gleiche Grammatik
// wie die Wachs- und Kettenseiten (wax.css / chain.css). Oben Bildstrecke und
// Kaufbox (AccessoryHero), darunter „So geht's" neben den Daten, „Passt
// dazu" mit den Karten der Starter-Set-Seite, kurze Fragen, GPSR.
// Meta und Produkt-Schema wie bisher; der statische Teil kommt aus
// scripts/generate-accessory-html.mjs.

import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { GpsrInfo } from '@/components/GpsrInfo';
import { FaqList } from '@/components/FaqList';
import { getAccessoryBySlug } from '@/lib/data';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { AccessoryHero } from '@/pages/product/accessory/AccessoryHero';
import { ACCESSORY_PAGES } from '@/pages/product/accessory/content';
import { AccessoryCards } from '@/pages/starter/AccessoryCards';

export function AccessoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const de = lang === 'de';
  const acc = slug ? getAccessoryBySlug(slug) : undefined;
  const copy = acc ? ACCESSORY_PAGES[acc.id] : undefined;

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, [slug]);

  if (!acc || !copy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--pg)' }}>
        <p style={{ color: 'var(--txm)' }}>{de ? 'Nicht gefunden.' : 'Not found.'}</p>
        <BackLink de={de} />
      </div>
    );
  }

  const titleText = de ? acc.title : acc.titleEn;
  const descriptionText = de ? acc.description : acc.descriptionEn;
  const steps = (de ? acc.howToSteps : acc.howToStepsEn) ?? [];
  const canonicalUrl = `https://waxcelerate.de/zubehoer/${acc.slug}`;
  const metaTitle = `${titleText} | Waxcelerate`;
  const other = acc.id === 'acc-wire' ? 'pliers' : 'wire';

  const productSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: titleText, description: descriptionText, image: `https://waxcelerate.de${acc.image}`, sku: acc.id,
    brand: { '@type': 'Brand', name: 'Waxcelerate' },
    url: canonicalUrl,
    offers: acc.ebayUrl ? {
      '@type': 'Offer', price: acc.price.toFixed(2), priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock', url: acc.ebayUrl,
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

      <main id="main-content" className="wxp">
        <div className="wxp-wrap pt-24 sm:pt-28">
          <BackLink de={de} />
        </div>
        <AccessoryHero acc={acc} copy={copy} de={de} t={t} />

        {/* So geht's + Daten nebeneinander */}
        <section className="wxp-chapter" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className="wxp-wrap wxs-howgrid">
            <div>
              <div className="wxp-chead" style={{ marginBottom: 0 }}>
                <p className="eyebrow">{de ? "So geht's" : 'How it works'}</p>
                <h2>{de ? 'Drei Handgriffe.' : 'Three moves.'}</h2>
              </div>
              <ol className="wxc-steps wxs-steps3">
                {steps.map((s, i) => (
                  <li key={s}>
                    <span className="node" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                    <b>{s}</b>
                  </li>
                ))}
              </ol>
            </div>
            {acc.specs && (
              <div className="wxp-card wxs-specs">
                <p className="wxc-boxtitle">{de ? 'Daten' : 'Specs'}</p>
                <dl>
                  {Object.entries(acc.specs).map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                  <div><dt>{de ? 'Versand einzeln' : 'Shipping alone'}</dt><dd>{acc.shippingCost ? `${acc.shippingCost.toFixed(2).replace('.', de ? ',' : '.')} €` : '—'}</dd></div>
                  <div><dt>{de ? 'Im Starter-Set' : 'In the starter set'}</dt><dd className="ok">{de ? 'versandkostenfrei' : 'free shipping'}</dd></div>
                </dl>
              </div>
            )}
          </div>
        </section>

        <section className="wxp-chapter" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className="wxp-wrap">
            <div className="wxp-chead">
              <p className="eyebrow">{de ? 'Passt dazu' : 'Goes with it'}</p>
              <h2>{de ? 'Zusammen ist es günstiger.' : 'Better value together.'}</h2>
            </div>
            <AccessoryCards de={de} ids={['set', other, 'rewax']} />
          </div>
        </section>

        <section className="wxp-chapter" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className="wxp-wrap">
            <div className="wxp-chead">
              <p className="eyebrow">{de ? 'Fragen' : 'Questions'}</p>
              <h2>{de ? 'Kurz beantwortet.' : 'Answered briefly.'}</h2>
            </div>
            <FaqList de={de} items={copy.faq.map((f) => ({ q: de ? f.qDe : f.qEn, a: de ? f.aDe : f.aEn }))} />
            <div className="mt-10"><GpsrInfo de={de} /></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
