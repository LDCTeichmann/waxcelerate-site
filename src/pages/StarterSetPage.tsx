// ─── /starter-set — das Set, und die zwei Teile, an die keiner denkt ────────
//
// Das Set gibt es, weil beim ersten Wachsen die meisten aufgeben: Wachs
// bestellt, dann fehlt etwas zum Öffnen der Kette und etwas zum Aufhängen.
//
// v3 (16.09.2026, Luca: „ruhiger, weniger Text, smarter konfigurieren"):
//   1. Kopf = Kaufbox (SetHero), Basis-Set 300 g vorgewählt, Kette optional
//      mit Filter aus dem Fahrprofil.
//   2. Der erste Abend in drei Handgriffen, Details aufklappbar, dazu der
//      Hinweis auf die vorgewachste Kette.
//   3. Geschenk, 4. Einzelteile, 5. Fragen, mobile Kaufleiste.
// Preise ausschließlich aus data.ts (starterSetPriceFor) und rewax/content.ts.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { GpsrInfo } from '@/components/GpsrInfo';
import { FaqList } from '@/components/FaqList';
import { removeStaticHeadMeta } from '@/lib/utils';
import {
  DEFAULT_COMBO, STEPS, eur, comboFromSetId,
  starterMeta, starterFaqItems, starterFaqSchema, type SetCombo,
} from '@/pages/starter/content';
import { comboFacts, comboLabel } from '@/pages/starter/setFacts';
import { SetHero, SetBuyButton } from '@/pages/starter/SetHero';
import { GiftBlock } from '@/pages/starter/GiftBlock';
import { AccessoryCards } from '@/pages/starter/AccessoryCards';
import { preferredChainId } from '@/pages/starter/chainFilter';

function initialCombo(): SetCombo {
  if (typeof window === 'undefined') return DEFAULT_COMBO;
  const q = new URLSearchParams(window.location.search);
  const fromSet = comboFromSetId(q.get('set'));
  if (fromSet) return fromSet;
  // ?konfigurieren=1 (z. B. Geschenk-Sektion auf /kette-wachsen-lassen):
  // direkt mit Kette öffnen.
  if (q.has('konfigurieren')) return { ...DEFAULT_COMBO, chainId: preferredChainId() };
  return DEFAULT_COMBO;
}

// ─── Mobile Kaufleiste ──────────────────────────────────────────────────────
// Sichtbar, sobald die Preiskarte oben aus dem Bild ist, und nur bis zur
// Geschenk-Sektion — danach hat jede Sektion ihren eigenen Knopf.
function StickyBuy({ de, combo, anchor }: { de: boolean; combo: SetCombo; anchor: React.RefObject<HTMLDivElement | null> }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const card = anchor.current;
    const end = document.querySelector('#geschenk');
    if (!card || !end) return;
    let past = false, endReached = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === card) past = !e.isIntersecting && e.boundingClientRect.bottom < 0;
        if (e.target === end) endReached = e.isIntersecting || e.boundingClientRect.top < 0;
      }
      setVisible(past && !endReached);
    }, { threshold: 0 });
    io.observe(card); io.observe(end);
    return () => io.disconnect();
  }, [anchor]);

  const { price, pct } = comboFacts(combo);
  return (
    <div className="wxs-sticky" style={{ transform: visible ? 'none' : 'translateY(110%)' }}
      aria-hidden={!visible} inert={!visible}>
      <div className="l">
        <p>{comboLabel(combo, de)}</p>
        <b className="num">{eur(price, de)}</b>
        <span className="wxs-savepill ml-2">−{pct} %</span>
      </div>
      <div className="r"><SetBuyButton combo={combo} de={de} compact /></div>
    </div>
  );
}

// ─── Der erste Abend ────────────────────────────────────────────────────────
function FirstEvening({ de, onWantChain }: { de: boolean; onWantChain: () => void }) {
  return (
    <section className="wxp-chapter" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{de ? 'Warum ein Set' : 'Why a set'}</p>
          <h2>{de ? 'Der erste Abend in drei Handgriffen.' : 'The first evening in three moves.'}</h2>
        </div>
        <div className="wxs-steps">
          {STEPS.map((s) => (
            <article key={s.n} className="wxs-step">
              <div className="ph">
                <img src={s.img} alt="" aria-hidden loading="lazy" decoding="async" style={{ objectPosition: s.pos }} />
                <span className="n">{s.n}</span>
                <span className="part">{de ? `Im Set: ${s.partDe}` : `In the set: ${s.partEn}`}</span>
              </div>
              <details>
                <summary>{de ? s.titleDe : s.titleEn}<ChevronDown className="h-4 w-4" aria-hidden /></summary>
                <p>{de ? s.moreDe : s.moreEn}</p>
              </details>
            </article>
          ))}
          <div className="wxs-upsell">
            <div>
              <b>{de ? 'Kette noch geölt?' : 'Chain still oiled?'}</b>
              <p>{de
                ? 'Mit vorgewachster Kette entfällt das Entfetten. Auspacken, montieren, fahren.'
                : 'A pre-waxed chain skips the degreasing. Unpack, fit, ride.'}</p>
            </div>
            <button type="button" onClick={onWantChain}>
              {de ? 'Kette dazunehmen' : 'Add a chain'} <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StarterSetPage() {
  const { lang, t } = useLanguage();
  const de = lang === 'de';
  const { title, description } = starterMeta(de);
  const faq = starterFaqItems(de);
  const [combo, setCombo] = useState<SetCombo>(initialCombo);
  const buyRef = useRef<HTMLDivElement>(null);

  // Die vorgerenderte Hülle (scripts/generate-blog-html.mjs, STATIC_PAGES)
  // setzt title/description/canonical bereits statisch, markiert mit
  // data-prerendered — ohne diesen Aufruf bleiben nach der Hydration zwei
  // Versionen jedes Tags im DOM (siehe removeStaticHeadMeta in src/lib/utils.ts).
  useEffect(() => { removeStaticHeadMeta(); }, []);

  const wantChain = useCallback(() => {
    setCombo((c) => (c.chainId ? c : { ...c, chainId: preferredChainId() }));
    // 'instant': das CSS scroll-behavior: smooth würde sonst greifen.
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/starter-set" />
        <script type="application/ld+json">{JSON.stringify(starterFaqSchema(de))}</script>
      </Helmet>

      <Navigation />

      <main id="main-content" className="wxp">
        <div id="top" className="wxp-wrap pt-24 sm:pt-28">
          <BackLink de={de} />
        </div>
        <SetHero de={de} t={t} combo={combo} setCombo={setCombo} buyRef={buyRef} />

        <FirstEvening de={de} onWantChain={wantChain} />

        <GiftBlock de={de} combo={combo} />

        <section className="wxp-chapter" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className="wxp-wrap">
            <div className="wxp-chead">
              <p className="eyebrow">{de ? 'Einzeln' : 'Separately'}</p>
              <h2>{de ? 'Nur das fehlende Teil.' : 'Just the missing piece.'}</h2>
            </div>
            <AccessoryCards de={de} />
          </div>
        </section>

        <section id="fragen" className="wxp-chapter scroll-mt-20" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className="wxp-wrap">
            <div className="wxp-chead">
              <p className="eyebrow">{de ? 'Fragen' : 'Questions'}</p>
              <h2>{de ? 'Kurz beantwortet.' : 'Answered briefly.'}</h2>
            </div>
            <FaqList items={faq} de={de} />
            <div className="mt-10"><GpsrInfo de={de} /></div>
          </div>
        </section>
      </main>

      <Footer />
      <StickyBuy de={de} combo={combo} anchor={buyRef} />
    </div>
  );
}
