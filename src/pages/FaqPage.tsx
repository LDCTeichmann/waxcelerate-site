// ─── /faq — die häufigen Fragen als eigene, indexierbare Seite ─────────────
//
// Vorher nur Startseiten-Anker #faq, und dort standardmäßig nur 5 von ~22
// Fragen sichtbar. Diese Seite trägt alle Fragen an einer kanonischen
// Adresse, mit FAQPage-Schema über den vollständigen Satz — das ist die
// Fassung, die KI-Antwortsysteme zur Extraktion lesen.
//
// Fragen und Antworten kommen unverändert aus t.faq.items (src/lib/i18n.ts),
// dieselbe Quelle wie die Startseiten-Sektion und der Prerender.

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';

const BASE = 'https://waxcelerate.de';
const CANONICAL = `${BASE}/faq`;
const W = 'mx-auto w-full max-w-3xl px-6 sm:px-10';

export function FaqPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const p = t.pages.faq;
  const items = t.faq.items;

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        name: p.metaTitle,
        description: p.metaDescription,
        url: CANONICAL,
        inLanguage: de ? 'de-DE' : 'en',
        mainEntity: items.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
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

          <div className="mt-10 divide-y" style={{ borderColor: 'var(--bd2)' }}>
            {items.map((f) => (
              <section key={f.q} className="py-6 first:pt-0" style={{ borderColor: 'var(--bd2)' }}>
                <h2 className="font-display font-semibold text-wx-tx1 text-[17px] leading-snug">{f.q}</h2>
                <p className="mt-2 text-[14.5px] leading-[1.75] text-wx-tx2">{f.a}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            <Link to="/anleitung" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Anleitung: Kette wachsen →' : 'How to wax a chain →'}</Link>
            <Link to="/rechner/intervall" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Nachwachs-Intervall berechnen →' : 'Calculate re-wax interval →'}</Link>
            <Link to="/kontakt" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Frage nicht dabei? Kontakt →' : 'Question missing? Contact →'}</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
