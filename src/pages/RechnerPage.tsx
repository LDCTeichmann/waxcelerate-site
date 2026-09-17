// ── /rechner und /rechner/:slug ─────────────────────────────────────────────
//
// Bis hierher lebten die Rechner ausschliesslich in der Startseiten-Sektion
// #tools. Damit hatten sie keine Adresse: Google konnte sie nicht indexieren,
// KI-Antwortmaschinen nicht zitieren, die 18 Blogartikel nicht auf sie
// verlinken und niemand ein Ergebnis teilen.
//
// Jede Seite traegt den Antworttext aus lib/toolRegistry.ts auch als echtes
// HTML — nicht nur den Rechner. Eine Seite, die ohne JavaScript leer ist, hat
// fuer eine Suchmaschine keinen Inhalt.

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useToolProfile } from '@/hooks/useToolProfile';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { getToolBySlug } from '@/lib/toolRegistry';
import { getArticleBySlug } from '@/pages/blog/articles';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { ProfileBar } from '@/components/tools/ProfileBar';
import { ToolCalculator } from '@/components/tools/registry';
import { AssumptionsDisclosure } from '@/components/tools/AssumptionsDisclosure';
import { NotFoundPage } from '@/pages/NotFoundPage';

const W = 'wx-frame';
const BASE = 'https://waxcelerate.de';

/**
 * Der Erklaertext, ab dem dritten Absatz eingeklappt.
 *
 * Fuenf Absaetze am Stueck neben einem Rechner sind eine Wand: wer eine Zahl
 * eintragen will, liest sie nicht, und wer wirklich etwas nachschlagen will,
 * findet die Stelle nicht. Die ersten beiden Absaetze beantworten die Frage,
 * der Rest steht auf Abruf.
 *
 * Wichtig: der Rest bleibt im DOM und wird nicht nachgeladen — das
 * vorgerenderte HTML unter scripts/generate-blog-html.mjs traegt ohnehin alle
 * Absaetze, und das ist der Text, den Suchmaschinen und KI-Antwortmaschinen
 * lesen.
 */
function Answer({ points }: { points: string[] }) {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [expanded, setExpanded] = useState(false);
  const VISIBLE = 2;
  const hidden = points.length - VISIBLE;

  return (
    <div className="flex flex-col gap-3 max-w-[65ch]">
      {points.map((p, i) => (
        <p
          key={p}
          className="text-[14px] leading-relaxed"
          style={{ color: 'var(--tx2)' }}
          hidden={!expanded && i >= VISIBLE}
        >
          {p}
        </p>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="self-start text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--brand)' }}
        >
          {expanded
            ? (de ? 'Weniger anzeigen' : 'Show less')
            : (de ? `Weiterlesen · ${hidden} Absätze` : `Read more · ${hidden} paragraphs`)}
        </button>
      )}
    </div>
  );
}

export function RechnerToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const profile = useToolProfile();
  const entry = slug ? getToolBySlug(slug) : undefined;

  // Siehe RechnerHubPage: der Prerender (renderTool) setzt data-prerendered-Meta,
  // die sonst nach der Hydration doppelt im DOM stehen.
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, [slug]);

  if (!entry) return <NotFoundPage />;

  const canonical = `${BASE}/rechner/${entry.slug}`;
  const article = entry.article ? getArticleBySlug(entry.article) : undefined;

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{entry.title}</title>
        <meta name="description" content={entry.description} />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': ['SoftwareApplication', 'WebApplication'],
              name: entry.cover,
              description: entry.description,
              url: canonical,
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Web',
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              inLanguage: 'de-DE',
              isAccessibleForFree: true,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
              publisher: { '@type': 'Organization', name: 'Waxcelerate', url: BASE },
            },
            ...(entry.faq ? [{
              '@type': 'FAQPage',
              mainEntity: entry.faq.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }] : []),
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
                { '@type': 'ListItem', position: 2, name: 'Anleitungen & Rechner', item: `${BASE}/anleitung` },
                { '@type': 'ListItem', position: 3, name: entry.h1, item: canonical },
              ],
            },
          ],
        })}</script>
      </Helmet>

      <Navigation />

      <main id="main-content" className={`${W} pt-24 pb-20`}>
        <BackLink de={de} className="mb-4" />
        <h1 className="text-[26px] sm:text-[32px] font-semibold leading-tight mb-2" style={{ color: 'var(--tx1)' }}>
          {entry.h1}
        </h1>
        <p className="text-[14px] leading-relaxed max-w-[60ch] mb-6" style={{ color: 'var(--tx2)' }}>
          {entry.lead}
        </p>

        {/* Zweispaltig ab lg: vorher stand der Rechner in einer schmalen Spalte
            und rechts daneben eine halbe Bildschirmbreite Leerraum, waehrend der
            Erklaertext weit darunter lag und beim Bedienen nicht sichtbar war.
            Jetzt steht die Erklaerung neben dem Rechner — auf einer Seite, ohne
            Scrollen, und genau dort lesbar, wo die Frage aufkommt. */}
        {entry.usesProfile && <ProfileBar profile={profile} />}

        {/* WaxCalculator (umstieg, ersparnis) braucht die volle Breite fuer sein
            eigenes zweispaltiges Innenlayout ab 1000px — in der 26rem-Spalte
            liefe sein Ergebnisblock ab. Volle Breite oben, Erklaerung darunter,
            statt nebeneinander. */}
        {entry.fullWidth ? (
          <>
            <ToolCalculator slug={entry.slug} profile={profile} />
            {/* Kein AssumptionsDisclosure hier: WaxCalculator legt seine
                Annahmen schon in einem eigenen <details> offen. */}
            <section className="mt-8 max-w-[65ch]">
              <h2 className="text-[17px] font-semibold mb-3" style={{ color: 'var(--tx1)' }}>
                {de ? 'Kurz erklärt' : 'In short'}
              </h2>
              <Answer points={entry.answer} />
            </section>
          </>
        ) : (
          <div className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
            <ToolCalculator slug={entry.slug} profile={profile} />

            {/* Der Antworttext steht bewusst auch dann da, wenn der Rechner alles
                beantwortet — er ist das, was ohne JavaScript ausgeliefert wird,
                und das, was eine KI zitieren kann. */}
            <section className="lg:pt-1">
              <h2 className="text-[17px] font-semibold mb-3" style={{ color: 'var(--tx1)' }}>
                {de ? 'Kurz erklärt' : 'In short'}
              </h2>
              <Answer points={entry.answer} />
              {entry.showsAssumptions && (
                <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--bd)' }}>
                  <AssumptionsDisclosure />
                </div>
              )}
            </section>
          </div>
        )}

        {entry.faq && (
          <section className="mt-10">
            <h2 className="text-[17px] font-semibold mb-4" style={{ color: 'var(--tx1)' }}>
              {de ? 'Häufige Fragen' : 'Common questions'}
            </h2>
            <dl className="flex flex-col gap-4 max-w-[65ch]">
              {entry.faq.map(f => (
                <div key={f.q}>
                  <dt className="text-[14px] font-semibold mb-1" style={{ color: 'var(--tx1)' }}>{f.q}</dt>
                  <dd className="text-[14px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          <Link to="/anleitung#rechner" style={{ color: 'var(--brand)' }}>{t.tools.shared.allTools}</Link>
          {entry.next && (
            <Link to={entry.next.href} style={{ color: 'var(--brand)' }}>{entry.next.label} →</Link>
          )}
          {article && (
            <Link to={`/blog/${article.slug}`} style={{ color: 'var(--brand)' }}>{article.title} →</Link>
          )}
        </nav>
      </main>

      <Footer />
    </div>
  );
}
