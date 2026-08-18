import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { ScienceTeaser } from '@/sections/science/ScienceTeaser';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { waxVsOil, frictionRanges } from '@/lib/data';

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
import { Section } from '@/components/Section';

// ─── Was sich ändert ─────────────────────────────────────────────────────────
// Diese Sektion bestand zuletzt nur noch aus drei Messkacheln: μ 0,03–0,06,
// 2–4 W, "Trocken". Das ist der Beweis, nicht das Argument. Wer noch nie
// gewachst hat, fragt nicht nach einer Reibungszahl, sondern was sich für ihn
// ändert — genau die Reihenfolge, die DESIGN.md §4 für diese Seite vorschreibt
// ("was sich für dich ändert, dann die Messwerte"). Die Hälfte war 08/2026 beim
// Kürzen der Startseite verloren gegangen (siehe WhatChanges.tsx, drei Zeilen
// mit Foto, rund drei Bildschirme hoch), übrig blieb die Messtechnik.
//
// Jetzt wieder herumgedreht, aber ohne die Höhe zurückzuholen: Die Aussage ist
// das, was man auf dem Rad merkt, die Zahl steht klein daneben als Beleg. Alle
// Laborwerte zusammen belegen jetzt eine einzige kleine Zeile unter der Liste
// statt drei Kacheln. Haarlinien-Zeilen statt Kacheln ist außerdem der von
// DESIGN.md §3 vorgesehene Standardbehälter.
function buildMoments(de: boolean) {
  const pro = frictionRanges.find(r => r.id === 'pro')!;
  const oil = frictionRanges.find(r => r.id === 'oil')!;
  const life = waxVsOil.life;

  return [
    {
      n: '01',
      titleDe: 'Saubere Hände, saubere Wade.',
      titleEn: 'Clean hands, clean calf.',
      bodyDe: 'Wachs härtet zu einem trockenen Film aus. Da ist nichts, was abfärbt — kein Ketten-Tattoo an der Wade, keine schwarzen Finger beim Rad einladen.',
      bodyEn: 'Wax cures to a dry film. There is nothing left to rub off — no chain tattoo on your calf, no black fingers when you load the bike.',
      chip: de ? 'trocken' : 'dry',
    },
    {
      n: '02',
      titleDe: 'Der Antrieb wird leise.',
      titleEn: 'The drivetrain goes quiet.',
      bodyDe: 'Kein trockenes Sirren im Leerlauf, kein Knirschen unter Last. Es ist der Satz, der in unseren Bewertungen am häufigsten von selbst vorkommt.',
      bodyEn: 'No dry whirr when freewheeling, no grinding under load. It is the line that comes up unprompted most often in our reviews.',
      chip: de ? 'hörbar' : 'audible',
    },
    {
      n: '03',
      titleDe: 'Dreck findet keinen Halt.',
      titleEn: 'Grit finds nothing to hold on to.',
      bodyDe: 'Öl bleibt klebrig und bindet Staub zu einer Schleifpaste, die im Gelenk mitläuft. Wachs ist trocken, der Dreck fällt einfach ab.',
      bodyEn: 'Oil stays tacky and binds dust into a grinding paste that runs inside the joints. Wax is dry, so the grit simply falls off.',
      chip: `μ ${pro.muLo.toFixed(2)} ${de ? 'statt' : 'vs'} ${oil.muLo.toFixed(2)}`,
    },
    {
      n: '04',
      titleDe: 'Der ganze Antrieb hält länger.',
      titleEn: 'The whole drivetrain lasts longer.',
      bodyDe: `Ohne Schleifpaste im Gelenk hält die Kette ${life.waxLo} bis ${life.wax} mal so lange — und die teure Kassette kommt viel seltener dran.`,
      bodyEn: `Without grinding paste in the joints a chain lasts ${life.waxLo} to ${life.wax} times as long — and the expensive cassette comes up far less often.`,
      chip: `${life.waxLo}–${life.wax}×`,
    },
  ];
}

export function WhyWax() {
  const { lang }   = useLanguage();
  const de         = lang === 'de';
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const rowsRef    = useRef<HTMLDivElement>(null);

  useSectionReveal(headerRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const rows = rowsRef.current?.querySelectorAll('[data-row]');
      if (rows?.length) {
        gsap.fromTo(rows,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: rowsRef.current, start: 'top 85%', once: true } });
      }
    }, section);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  const moments = buildMoments(de);
  const cost = waxVsOil.cost;
  const w = waxVsOil.watts;
  const pro = frictionRanges.find(r => r.id === 'pro')!;
  const oil = frictionRanges.find(r => r.id === 'oil')!;

  return (
    <Section id="warum-wachs" ref={sectionRef} className="bg-wx-sf">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      {/* ── Header ── */}
      <div ref={headerRef} className="mb-10 sm:mb-12">
        <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
          {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
        </p>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
          <ScrollWordReveal text={de ? 'Du merkst es sofort.' : 'You notice it straight away.'} />
        </h2>
        <p data-reveal="subtitle" className="hidden sm:block text-wx-txm max-w-xl text-[15px] leading-relaxed">
          {de
            ? 'Vier Dinge ändern sich auf der ersten Ausfahrt. Die Messwerte erklären sie hinterher.'
            : 'Four things change on the very first ride. The measurements explain them afterwards.'}
        </p>
      </div>

      {/* ── Die vier Momente ──
          Zahl links, Aussage groß, Beleg klein rechts. Eine Zeile pro Sache,
          Haarlinie dazwischen. Auf Mobil wandert der Beleg unter die Aussage,
          damit die Überschrift nicht auf zwei Zeichen Breite gequetscht wird. */}
      <div ref={rowsRef} style={{ borderTop: '1px solid var(--bd2)' }}>
        {moments.map(m => (
          <div key={m.n} data-row className="flex items-start gap-4 sm:gap-7 py-5 sm:py-6"
            style={{ borderBottom: '1px solid var(--bd2)' }}>
            <span className="num-data text-[12px] flex-shrink-0 pt-[0.4rem]"
              style={{ color: 'var(--accent)', minWidth: '1.5rem' }}>
              {m.n}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-5">
                <h3 className="font-display font-bold text-wx-tx1 leading-[1.15] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.6rem)' }}>
                  {de ? m.titleDe : m.titleEn}
                </h3>
                <span className="num-data text-[12px] whitespace-nowrap hidden sm:block flex-shrink-0"
                  style={{ color: 'var(--txf)' }}>
                  {m.chip}
                </span>
              </div>
              <p className="text-[14px] sm:text-[14.5px] leading-relaxed mt-2 max-w-[58ch]"
                style={{ color: 'var(--txm)' }}>
                {de ? m.bodyDe : m.bodyEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sämtliche Laborwerte in einer Zeile. Vorher waren dieselben Zahlen
          drei Kacheln plus eine Fußnote — viel Fläche für Angaben, die niemand
          liest, bevor er überzeugt ist, und die auf /wissenschaft ohnehin
          ausführlich stehen. Die Eingangsleistung gehört an jede Wattnennung. */}
      <p className="text-[12px] leading-relaxed mt-4 max-w-[70ch]" style={{ color: 'var(--txff)' }}>
        {de
          ? `Gemessen: ${w.wax[0]}–${w.wax[1]} W Antriebsverlust statt ${w.oil[0]}–${w.oil[1]} W bei ${w.inputW[0]}–${w.inputW[1]} W Tretleistung, Reibungszahl μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} statt μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Laborwerte.`
          : `Measured: ${w.wax[0]}–${w.wax[1]} W drivetrain loss instead of ${w.oil[0]}–${w.oil[1]} W at ${w.inputW[0]}–${w.inputW[1]} W pedalling power, friction coefficient μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} instead of μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Lab values.`}
      </p>

      {/* ── Cost callout ──
          Die eine Zahl, die groß sein darf: nicht "70 €" allein, sondern die
          Euro-Zahl zusammen mit den beiden echten Kosten und der Strecke,
          über die sie gemessen ist. */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 py-6 sm:py-7"
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

      {/* ── Tür in die Wissenschaft ── */}
      <ScienceTeaser de={de} />

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </Section>
  );
}
