import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { CountUp } from '@/components/viz/CountUp';
import { ScienceTeaser } from '@/sections/science/ScienceTeaser';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { waxVsOil, frictionRanges } from '@/lib/data';

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
import { Section } from '@/components/Section';

// Three cards, not four. Chain life used to sit here as "3×", but the hero
// already counts that number up on arrival and the products subtitle says it a
// third time. A figure repeated three times on one page does not get bigger, it
// gets cheaper. The hero owns the outcome numbers; this row owns the
// measurements that explain them, and the benefit lines below own the everyday
// consequences. One statement per surface.
function buildCards(de: boolean) {
  const w = waxVsOil.watts;
  const pro = frictionRanges.find(r => r.id === 'pro')!;
  const oil = frictionRanges.find(r => r.id === 'oil')!;
  // One number, one plain-language sentence — not number + tiny caps label +
  // a second, even fainter line. That three-way split was the actual
  // complaint: several small sizes fighting for attention and none of them
  // easy to read. Down to two sizes per card now, and the sentence says what
  // the number means instead of just naming it.
  return [
    {
      value: `μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)}`,
      sentenceDe: `Reibung im Antrieb — Öl liegt bei μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}.`,
      sentenceEn: `Drivetrain friction — oil sits at μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}.`,
    },
    {
      value: `${w.wax[0]}–${w.wax[1]} W`,
      sentenceDe: `Antriebsverlust — Öl braucht ${w.oil[0]}–${w.oil[1]} W bei gleicher Leistung.`,
      sentenceEn: `Drivetrain loss — oil needs ${w.oil[0]}–${w.oil[1]} W at the same power.`,
    },
    {
      value: de ? 'Trocken' : 'Dry',
      sentenceDe: 'Kein Dreck, keine Flecken an Kleidung oder Fingern.',
      sentenceEn: 'No grime, no stains on clothes or fingers.',
    },
  ];
}

export function WhyWax() {
  const { lang }   = useLanguage();
  const de         = lang === 'de';
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);

  useSectionReveal(headerRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('[data-card]');
      if (cards?.length) {
        gsap.fromTo(cards,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', once: true } });
      }
      const bars = cardsRef.current?.querySelectorAll('[data-bar]');
      if (bars?.length) {
        gsap.fromTo(bars,
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'center center', duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', once: true } });
      }
    }, section);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  const cards = buildCards(de);
  const cost = waxVsOil.cost;

  return (
    <Section id="warum-wachs" ref={sectionRef} className="bg-wx-sf">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      {/* ── Header ── */}
      <div ref={headerRef} className="mb-14 sm:mb-16">
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={de ? 'Messbar besser.' : 'Measurably better.'} />
            </h2>
            <p data-reveal="subtitle" className="hidden sm:block text-wx-txm max-w-xl text-[15px] leading-relaxed">
              {de
                ? 'Derselbe Antrieb, zwei Schmierstoffe — Seite an Seite gemessen.'
                : 'Same drivetrain, two lubricants — measured side by side.'}
            </p>
          </div>

          {/* ── Stat cards — 2×2 grid — measurement-card language shared with
              the science page (CountUp figure, centered accent tick, no
              icons) instead of the icon+progress-bar pattern used before. ── */}
          {/* Mobile — hairline rows, not three stacked boxes. As centered
              cards these took roughly 450px of a 844px screen to deliver
              three short facts, and a boxed tile per fact is exactly the
              "Baukasten" pattern docs/DESIGN.md §3 rules out anyway. Number
              left, sentence right, one rule between: same information in
              about a third of the height, and the three numbers line up in
              a column the eye can compare down. */}
          <div ref={cardsRef}>
            <div className="sm:hidden" style={{ borderTop: '1px solid var(--bd2)' }}>
              {cards.map((c, i) => (
                <div key={i} data-card className="flex items-baseline gap-4 py-4"
                  style={{ borderBottom: '1px solid var(--bd2)' }}>
                  <CountUp value={c.value}
                    className="font-display font-bold leading-none tracking-[-0.02em] flex-shrink-0"
                    style={{ fontSize: '1.35rem', color: 'var(--tx1)', minWidth: '6.4rem' }} />
                  <span className="text-[13.5px] leading-snug" style={{ color: 'var(--tx2)' }}>
                    {de ? c.sentenceDe : c.sentenceEn}
                  </span>
                </div>
              ))}
            </div>

            <div className="hidden sm:grid sm:grid-cols-3 gap-4">
              {cards.map((c, i) => (
                <div key={i} data-card
                  className="rounded-2xl px-5 py-6 flex flex-col items-center text-center"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
                  <CountUp value={c.value}
                    className="font-display font-bold leading-none tracking-[-0.02em] block"
                    style={{ fontSize: 'clamp(1.6rem, 4.4vw, 2rem)', color: 'var(--tx1)' }} />
                  <div data-bar className="h-0.5 w-8 mt-4 mb-3 rounded-full"
                    style={{ background: 'var(--accent)', opacity: 0.5, transformOrigin: 'center' }} />
                  <span className="text-[14px] leading-snug" style={{ color: 'var(--tx2)' }}>
                    {de ? c.sentenceDe : c.sentenceEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shared footnote instead of repeating it in every tile — a watt
              figure without its input power is not a number, and this way it
              is said once, not three times at 10px. */}
          <p className="text-[12px] sm:text-center mt-4" style={{ color: 'var(--txf)' }}>
            {de
              ? `Gemessen bei ${waxVsOil.watts.inputW[0]}–${waxVsOil.watts.inputW[1]} W Tretleistung, Laborwerte.`
              : `Measured at ${waxVsOil.watts.inputW[0]}–${waxVsOil.watts.inputW[1]} W pedalling power, lab values.`}
          </p>

          {/* ── Cost callout ──
              The one number worth making big: not "70 €" on its own (that
              was the actual complaint — the figure stood with no derivation
              anywhere near it), but the euro figure paired, in the same
              breath, with the two real costs and the distance it is measured
              over. One statement, one place, everything it needs to be
              self-explanatory right next to it. */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 py-6 sm:py-7"
            style={{ borderTop: '1px solid var(--bd2)', borderBottom: '1px solid var(--bd2)' }}>
            <p className="font-display font-bold leading-none tracking-[-0.02em] flex-shrink-0"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 3.2rem)', color: 'var(--accent)' }}>
              {eur(cost.savedEur, de)}
            </p>
            <p className="text-[14.5px] leading-relaxed max-w-[52ch]" style={{ color: 'var(--txm)' }}>
              {de
                ? `gespart auf ${cost.km.toLocaleString('de-DE')} km. Wachs kostet über diese Strecke rund ${eur(cost.waxEur, de)}, Öl rund ${eur(cost.oilEur, de)} — ${cost.pctLess} % weniger, durch weniger Reibung im Antrieb und seltener fällige Kettenwechsel.`
                : `saved over ${cost.km.toLocaleString('en-US')} km. Wax costs around ${eur(cost.waxEur, de)} over that distance, oil around ${eur(cost.oilEur, de)} — ${cost.pctLess}% less, from lower drivetrain friction and less frequent chain replacements.`}
            </p>
          </div>

          {/* ── Door into the science page ──
              Mobile-Plan B1: WhatChanges (drei Zeilen, Foto + Text je
              Zeile — siehe WhatChanges.tsx) stand bis 08/2026 hier und zog
              diesen Abschnitt auf rund 3,0 Bildschirme. Die Startseite soll
              beweisen, nicht erklaeren; die ausfuehrliche Erklaerung lebt
              bereits auf /wissenschaft, tiefer als hier moeglich (u. a.
              Mikroskopaufnahmen zum Verschleiss, siehe SciencePage.tsx). Die
              "Sauberkeit"-Aussage aus WhatChanges bleibt trotzdem sichtbar:
              die Stat-Karte oben ("Trocken") sagt dasselbe. Nichts geloescht
              — WhatChanges.tsx bleibt im Code, falls die Zeilen woanders
              gebraucht werden, nur hier nicht mehr gerendert.
              War vorher eine flache Karte, die die Seite beschreibt. Jetzt
              beginnt sie das Argument und hoert eine Zeile zu frueh auf,
              das ist der Grund zu klicken. */}
          <ScienceTeaser de={de} />

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </Section>
  );
}
