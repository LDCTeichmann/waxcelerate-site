// ─── /anleitung — Kette wachsen, Schritt für Schritt ──────────────────────
//
// Vorher nur Startseiten-Anker #anleitungen. Diese Seite trägt die drei
// Abläufe (neue Kette, Re-Waxen, 3-Ketten-Rotation) an einer kanonischen
// Adresse und liefert HowTo-Schema für den Erstwachs-Ablauf — dieselben
// Schritte wie die HowTo in index.html, nur mit url auf diese Seite.
//
// Alle Schritte kommen aus t.guides.* (src/lib/i18n.ts), unverändert.

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';

const BASE = 'https://waxcelerate.de';
const CANONICAL = `${BASE}/anleitung`;
const W = 'mx-auto w-full max-w-3xl px-6 sm:px-10';

export function AnleitungPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const p = t.pages.anleitung;
  const g = t.guides;

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const blocks = [
    { data: g.newChain, id: 'neue-kette' },
    { data: g.rewax, id: 're-waxen' },
    { data: g.rotation, id: 'rotation' },
  ];

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: g.newChain.title,
        description: g.newChain.note,
        url: CANONICAL,
        inLanguage: de ? 'de-DE' : 'en',
        totalTime: 'PT45M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '29.95' },
        supply: [
          { '@type': 'HowToSupply', name: de ? 'Waxcelerate Heißwachs (Classic oder Pro)' : 'Waxcelerate hot wax (Classic or Pro)' },
          { '@type': 'HowToSupply', name: de ? 'Isopropanol oder Aceton zum Entfetten' : 'Isopropanol or acetone for degreasing' },
        ],
        tool: [
          { '@type': 'HowToTool', name: de ? 'Topf / Wachsschmelzer' : 'Pot / wax melter' },
          { '@type': 'HowToTool', name: de ? 'Küchenthermometer' : 'Kitchen thermometer' },
        ],
        step: g.newChain.steps.map((s: string, i: number) => ({
          '@type': 'HowToStep',
          position: i + 1,
          text: s,
          url: CANONICAL,
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

          <p className="mt-4 text-[14px] leading-[1.7]" style={{ color: 'var(--txm)' }}>
            {de
              ? 'Wachstemperatur durchgehend 80–90 °C. Neue Kette einmalig entfetten; danach genügt vor jedem Bad ein kurzes Abwischen.'
              : 'Keep the wax at 80–90 °C throughout. A new chain is degreased once; after that a quick wipe before each bath is enough.'}
          </p>

          {blocks.map(({ data, id }) => (
            <section key={id} id={id} className="mt-10">
              <h2 className="font-display font-bold text-wx-tx1 text-[20px]">{data.title}</h2>
              {data.note && (
                <p className="mt-2 text-[13.5px] leading-relaxed px-3 py-2.5 rounded-lg"
                  style={{ background: 'rgba(var(--accent-rgb),0.07)', borderLeft: '2px solid rgba(var(--accent-rgb),0.4)', color: 'var(--txf)' }}>
                  {data.note}
                </p>
              )}
              <ol className="mt-4 space-y-2">
                {data.steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[14.5px] leading-[1.7] text-wx-tx2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold mt-0.5"
                      style={{ background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)' }}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            <Link to="/blog/heisswachs-anleitung" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Ausführliche Anleitung mit Fotos →' : 'Detailed guide with photos →'}</Link>
            <Link to="/kette-wachsen-lassen" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Lieber einschicken? →' : 'Prefer to send it in? →'}</Link>
            <Link to="/faq" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Häufige Fragen →' : 'FAQ →'}</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
