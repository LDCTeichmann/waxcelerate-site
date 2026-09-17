// ─── /anleitung — Anleitungen & Rechner, an einem Ort ──────────────────────
//
// Seitenordnung 09/2026 (Chat 3): ersetzt die getrennte Startseiten-Sektion
// "Anleitungen" (guides.tsx, drei Text-Akkordeons) und "Rechner" (tools.tsx,
// Kartenstapel) durch eine Seite, auf der jede Frage nur einmal beantwortet
// wird. ProcessWatch (Ablauf, drei Modi inkl. Rotation) und WaxCalculator
// (produktneutral) sind dieselben Bausteine wie auf der Wachsseite — eine
// Rechenlogik statt dreier.
//
// #ablauf → ProcessWatch, #lohnt-sich → WaxCalculator, #rechner → Deck der
// vier verbleibenden Einzelrechner (Kosten sitzt schon bei #lohnt-sich).

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useToolProfile } from '@/hooks/useToolProfile';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { waxProcessTimeline } from '@/lib/data';
import { getArticleBySlug } from '@/pages/blog/articles';
import { parseWaxedStamp } from '@/lib/toolState';
import { ProcessWatch, type RunMode } from '@/components/process/ProcessWatch';
import { WaxCalculator } from '@/pages/product/wax/WaxCalculator';
import { ProfileBar } from '@/components/tools/ProfileBar';
import { ToolDeck } from '@/components/tools/registry';
import { TOOLS } from '@/lib/toolRegistry';
import '@/pages/product/wax/wax.css';

const BASE = 'https://waxcelerate.de';
const CANONICAL = `${BASE}/anleitung`;
const W = 'wx-frame';

/** Alte Anker der getrennten Startseiten-Sektionen zeigen weiter auf den
 *  passenden ProcessWatch-Modus, jetzt auf dieser Seite. */
function modeFromHash(): RunMode {
  if (typeof window === 'undefined') return 'rewax';
  const h = window.location.hash.replace('#', '');
  if (h === 'neue-kette') return 'first';
  if (h === 'rotation') return 'rotation';
  return 'rewax';
}

export function AnleitungPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const p = t.pages.anleitung;
  const profile = useToolProfile();
  const [initialMode] = useState<RunMode>(modeFromHash);

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  // Der QR-Code im Paket zeigt inzwischen auf /rechner/intervall?w=JJJJMMTT.
  // Aeltere Beileger und geteilte Links zeigen aber weiterhin auf die
  // Startseite bzw. #tools — die muessen hier beim Rechner-Deck landen (Logik
  // uebernommen aus der frueheren tools.tsx).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    if (!parseWaxedStamp(q.get('w') || q.get('waxed'))) return;
    let attempts = 0;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      const el = document.getElementById('rechner');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else if (attempts < 20) { attempts += 1; setTimeout(go, 120); }
    };
    go();
    return () => { cancelled = true; };
  }, []);

  // HowTo-Schema aus derselben Zeitleiste wie ProcessWatch (waxProcessTimeline
  // in data.ts) statt eines fest verdrahteten PT45M — der komplette
  // Erstwachs-Ablauf inklusive Entfetten, wortgleich mit dem, was die Seite
  // zeigt.
  const guide = getArticleBySlug('heisswachs-anleitung');
  const texts = guide?.howTo?.steps ?? [];
  const howToSteps = waxProcessTimeline
    .map((s, i) => {
      const h = s.howToIndex !== undefined ? texts[s.howToIndex] : undefined;
      return {
        i,
        name: h?.name ?? (de ? s.nameDe : s.nameEn) ?? '',
        text: (de ? s.textDe : s.textEn) ?? h?.text ?? '',
      };
    })
    .filter(s => s.name);
  const totalMinutes = waxProcessTimeline.reduce((a, s) => a + s.minutes, 0);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: guide?.howTo?.name ?? p.h1,
        description: p.lead,
        url: CANONICAL,
        inLanguage: de ? 'de-DE' : 'en',
        totalTime: `PT${totalMinutes}M`,
        supply: [
          { '@type': 'HowToSupply', name: de ? 'Waxcelerate Heißwachs (Classic oder Pro)' : 'Waxcelerate hot wax (Classic or Pro)' },
          { '@type': 'HowToSupply', name: de ? 'Isopropanol oder Aceton zum Entfetten' : 'Isopropanol or acetone for degreasing' },
        ],
        tool: [
          { '@type': 'HowToTool', name: de ? 'Topf / Wachsschmelzer' : 'Pot / wax melter' },
          { '@type': 'HowToTool', name: de ? 'Kettenschloss-Zange' : 'Quick-link pliers' },
        ],
        step: howToSteps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text || s.name,
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

  // Die vier verbliebenen Deck-Karten, fuer die Links auf ihre Einzelseiten
  // unter dem Deck (Kosten steht schon bei #lohnt-sich, Ersparnis nur noch
  // als eigene SEO-Seite).
  const deckTools = TOOLS.filter(entry => entry.inDeck !== false);

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
          <p className="mt-4 text-[16px] leading-[1.7] text-wx-tx2 max-w-[60ch]">{p.lead}</p>

          <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] font-semibold"
            style={{ color: 'var(--accent-soft)' }} aria-label={de ? 'Auf dieser Seite' : 'On this page'}>
            <a href="#ablauf">{de ? 'Ablauf' : 'Process'}</a>
            <a href="#lohnt-sich">{de ? 'Lohnt es sich?' : 'Does it pay off?'}</a>
            <a href="#rechner">{de ? 'Rechner' : 'Calculators'}</a>
          </nav>
        </div>

        <div className="wxp">
          <div id="ablauf">
            <ProcessWatch de={de} initialMode={initialMode} />
          </div>

          <div id="lohnt-sich">
            <WaxCalculator profile={profile} de={de} anchorId="lohnt-sich-calc" chapter={de ? 'Kapitel 05' : 'Chapter 05'} />
          </div>

          <section className="wxp-chapter" id="rechner">
            <div className="wxp-wrap">
              <div className="wxp-chead">
                <p className="eyebrow">{de ? 'Kapitel 06' : 'Chapter 06'}</p>
                <h2>{de ? 'Die einzelnen Rechner' : 'The individual calculators'}</h2>
                <p>{de ? 'Verschleiß, Kettenlänge, passende Kette und Intervall — jeder auch als eigene Seite.' : 'Wear, chain length, matching chain and interval — each also on its own page.'}</p>
              </div>

              <ProfileBar profile={profile} readOnly />
              <ToolDeck profile={profile} />

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
                {deckTools.map(entry => (
                  <li key={entry.slug}>
                    <Link to={`/rechner/${entry.slug}`} style={{ color: 'var(--accent-soft)' }} className="font-medium">
                      {de ? entry.label : entry.labelEn} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className={W}>
          <p className="mt-10 text-[14px]">
            <Link to="/blog" className="font-medium" style={{ color: 'var(--accent)' }}>
              {de ? 'Fragen offen? Blog & FAQ →' : 'Still have questions? Blog & FAQ →'}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
