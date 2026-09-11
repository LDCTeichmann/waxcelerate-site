// ─── /ueber-uns — die Marke als eigene, indexierbare Seite ──────────────────
//
// Bis September 2026 lagen "Über mich" nur als Startseiten-Anker #ueber-mich
// vor. Damit war die Gründer- und Herkunftsgeschichte für Suchmaschinen und
// KI-Antwortsysteme nur ein Fragment der Startseite, nicht als eigene Entität
// zitierbar. Diese Seite trägt denselben Text an einer kanonischen Adresse,
// mit AboutPage- und Person-Schema.
//
// Meta/H1/Lead kommen aus t.pages.about (src/lib/i18n.ts) — dieselbe Quelle,
// aus der scripts/generate-blog-html.mjs die vorgerenderte Fassung baut. Der
// Fließtext ist t.about.bio1…bio4, wortgleich mit der Startseiten-Sektion.

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';

const BASE = 'https://waxcelerate.de';
const CANONICAL = `${BASE}/ueber-uns`;
const W = 'mx-auto w-full max-w-3xl px-6 sm:px-10';

export function UeberUnsPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const p = t.pages.about;

  // Der Prerender (renderStatic) setzt title/description/canonical und das
  // JSON-LD statisch, markiert mit data-prerendered — ohne diesen Aufruf
  // stehen sie nach der Hydration doppelt im DOM (siehe src/lib/utils.ts).
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        name: p.metaTitle,
        description: p.metaDescription,
        url: CANONICAL,
        inLanguage: de ? 'de-DE' : 'en',
        primaryImageOfPage: `${BASE}/images/people/luca-stage.jpg`,
        about: { '@id': `${BASE}/#organization` },
        // Verweist auf den vorhandenen Person-Knoten aus index.html (@id
        // gesetzt dort) statt ihn hier unvollstaendig zu duplizieren.
        mainEntity: { '@id': `${BASE}/#person-luca` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: de ? 'Startseite' : 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: p.h1, item: CANONICAL },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{p.metaTitle}</title>
        <meta name="description" content={p.metaDescription} />
        <link rel="canonical" href={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify(graph)}</script>
      </Helmet>

      <Navigation />

      <main id="main-content" className="pt-24 sm:pt-28 pb-16">
        <div className={W}>
          <BackLink de={de} className="mb-6" />
          <h1 className="font-display font-bold text-wx-tx1 leading-tight"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', letterSpacing: '-0.02em' }}>
            {p.h1}
          </h1>
          <p className="mt-4 text-[16px] leading-[1.7] text-wx-tx2">{p.lead}</p>

          <div className="mt-10 space-y-4">
            <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
            <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
            <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
            <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio4}</p>
          </div>

          <figure className="mt-10">
            <picture>
              <source srcSet="/images/people/luca-stage.avif" type="image/avif" />
              <source srcSet="/images/people/luca-stage.webp" type="image/webp" />
              <img src="/images/people/luca-stage.jpg" loading="lazy" decoding="async"
                alt={de ? 'eBay Seller Leadership Week 2025, San Jose' : 'eBay Seller Leadership Week 2025, San Jose'}
                className="w-full rounded-2xl" style={{ border: '1px solid var(--bd)' }} />
            </picture>
            <figcaption className="mt-2 text-[13px]" style={{ color: 'var(--txm)' }}>
              {de
                ? 'eBay Seller Leadership Week 2025, San Jose — Waxcelerate auf der Hauptbühne.'
                : 'eBay Seller Leadership Week 2025, San Jose — Waxcelerate on the main stage.'}
            </figcaption>
          </figure>

          <dl className="mt-10 grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--bd)', background: 'var(--bd2)' }}>
            {[
              { v: de ? '2024' : '2024', k: de ? 'In Stuttgart gegründet' : 'Founded in Stuttgart' },
              { v: de ? '1 Tag' : '1 day', k: de ? 'Versand nach Bestellung' : 'Ships after order' },
              { v: '200+', k: de ? 'eBay-Top-Bewertungen' : 'eBay top reviews' },
            ].map((s) => (
              <div key={s.k} className="p-4 text-center" style={{ background: 'var(--sf2)' }}>
                <dt className="font-display font-bold text-wx-tx1" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>{s.v}</dt>
                <dd className="text-meta mt-1" style={{ color: 'var(--tx2)' }}>{s.k}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            <a href="https://www.ebay.de/usr/waxcelerate" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--accent)' }}>
              {t.about.ebay} <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link to="/kontakt" className="font-medium" style={{ color: 'var(--accent)' }}>
              {de ? 'Kontakt aufnehmen →' : 'Get in touch →'}
            </Link>
            <Link to="/impressum" className="font-medium" style={{ color: 'var(--accent)' }}>
              {de ? 'Impressum →' : 'Legal notice →'}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
