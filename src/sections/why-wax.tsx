import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { ScienceTeaser } from '@/sections/science/ScienceTeaser';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
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
// Vier Zeilen, vier VERSCHIEDENE Achsen.
//
// Vorher lasen sich Zeile 01 ("Saubere Haende, saubere Wade") und Zeile 03
// ("Dreck findet keinen Halt") wie dieselbe Aussage — Lucas Rueckmeldung, und
// sie stimmt: beide begannen mit derselben Praemisse ("Wachs ist trocken,
// deshalb bleibt nichts haften") und unterschieden sich erst im Nebensatz.
// Zwei von vier Argumenten fuer denselben Gedanken zu verbrauchen, macht die
// Liste laenger, aber nicht ueberzeugender.
//
// Die Praemisse steht jetzt genau einmal, als Vorspann ueber der Liste
// ("Wachs haertet trocken aus. Alles Weitere folgt daraus."). Darunter liegt
// jede Zeile auf einer eigenen Ebene, und keine wiederholt den Grund:
//   01  was DU merkst          (Haende, Wade, Socken)
//   02  was du HOERST          (Fahrerurteil)
//   03  was im GELENK passiert (Mechanismus)
//   04  was es KOSTET          (Standzeit, Geld)
//
// Zu 02 bewusst "Fahrerurteil" als Beleg und keine Dezibelzahl: veroeffent-
// lichte Messungen zeigen zwischen frischem Oel und frischem Wachs praktisch
// keinen Unterschied (rund 40 zu 41 dB), und eine erschoepfte Wachsschicht
// kann sogar lauter werden als Oel. Die Wahrnehmung "leiser" ist echt und
// steht so in den eigenen Bewertungen — als Messwert ausgegeben waere sie
// eine Behauptung, die der erste kundige Leser widerlegt. Auf einer Seite,
// die mit "gemessen statt behauptet" wirbt, waere das der teuerste
// vorstellbare Fehler.
function buildMoments(de: boolean) {
  const pro = frictionRanges.find(r => r.id === 'pro')!;
  const oil = frictionRanges.find(r => r.id === 'oil')!;
  const life = waxVsOil.life;

  return [
    {
      n: '01',
      titleDe: 'Du bleibst sauber.',
      titleEn: 'You stay clean.',
      bodyDe: 'Kein Ketten-Tattoo an der Wade, keine schwarzen Finger beim Rad einladen, keine Streifen auf hellen Socken. Du kannst die Kette mit bloßen Händen auflegen.',
      bodyEn: 'No chain tattoo on your calf, no black fingers when you load the bike, no streaks on light socks. You can fit the chain with bare hands.',
      chip: de ? 'färbt nicht ab' : 'no rub-off',
    },
    {
      n: '02',
      titleDe: 'Es wird leise.',
      titleEn: 'It goes quiet.',
      bodyDe: 'Kein trockenes Sirren im Leerlauf, kein Knirschen unter Last. Es ist der Satz, der in unseren Bewertungen am häufigsten von selbst vorkommt.',
      bodyEn: 'No dry whirr when freewheeling, no grinding under load. It is the line that comes up unprompted most often in our reviews.',
      chip: de ? 'Fahrerurteil' : 'rider reports',
    },
    {
      n: '03',
      titleDe: 'Im Gelenk mahlt nichts mehr.',
      titleEn: 'Nothing grinds inside the joint.',
      bodyDe: 'Öl bindet Staub zu einer Schleifpaste, die bei jeder Umdrehung zwischen Bolzen und Hülse mitläuft. Genau dort entsteht Verschleiß — nicht außen an der Kette.',
      bodyEn: 'Oil binds dust into a grinding paste that runs between pin and bushing on every rotation. That is where wear happens — not on the outside of the chain.',
      chip: `μ ${pro.muLo.toFixed(2)} ${de ? 'statt' : 'vs'} ${oil.muLo.toFixed(2)}`,
    },
    {
      n: '04',
      titleDe: 'Der ganze Antrieb hält länger.',
      titleEn: 'The whole drivetrain lasts longer.',
      bodyDe: `Die Kette hält ${life.waxLo} bis ${life.wax} mal so lange — und weil sie sich nicht längt, fressen sich Kassette und Kettenblätter nicht mit ab.`,
      bodyEn: `The chain lasts ${life.waxLo} to ${life.wax} times as long — and because it does not elongate, cassette and chainrings do not get eaten along with it.`,
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
        {/* Die Praemisse. Steht hier genau einmal, damit keine der vier
            Zeilen darunter sie noch einmal erklaeren muss — das war der
            Grund, warum 01 und 03 vorher wie dasselbe Argument klangen. */}
        <p data-reveal="subtitle" className="text-wx-txm max-w-xl text-[15px] leading-relaxed">
          {de
            ? 'Wachs härtet trocken aus. Alles Weitere folgt daraus — und vier davon merkst du schon auf der ersten Ausfahrt.'
            : 'Wax cures dry. Everything else follows from that — and four of those you notice on the very first ride.'}
        </p>
      </div>

      {/* ── Argumente links, Beleg rechts ──
          Vorher lagen beide Bloecke ueber die volle Breite untereinander: vier
          Zeilen, dann die Messwerte, dann der Mikroskop-Beleg. Das ergab rund
          zwei Bildschirme fuer eine Sektion, deren Text zusammen keine halbe
          Seite fuellt — die Flaeche entstand nicht durch Inhalt, sondern
          dadurch, dass eine Textspalte von 60 Zeichen ueber 1000 Pixel Breite
          gezogen wurde und rechts daneben nichts stand.
          Nebeneinander macht beides gleichzeitig sichtbar: waehrend man die
          Argumente liest, liegt der Beleg schon im Blick, statt zwei
          Bildschirme spaeter zu kommen. Unter lg wieder untereinander — dort
          gibt es keine zweite Spalte. */}
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-14 items-start">

        {/* Die vier Momente */}
        <div>
          <div ref={rowsRef} style={{ borderTop: '1px solid var(--bd2)' }}>
            {moments.map(m => (
              <div key={m.n} data-row className="flex items-start gap-4 sm:gap-5 py-4 sm:py-5"
                style={{ borderBottom: '1px solid var(--bd2)' }}>
                <span className="num-data text-[12px] flex-shrink-0 pt-[0.35rem]"
                  style={{ color: 'var(--accent)', minWidth: '1.4rem' }}>
                  {m.n}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display font-bold text-wx-tx1 leading-[1.15] tracking-[-0.02em]"
                      style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)' }}>
                      {de ? m.titleDe : m.titleEn}
                    </h3>
                    <span className="num-data text-[11.5px] whitespace-nowrap hidden sm:block flex-shrink-0"
                      style={{ color: 'var(--txf)' }}>
                      {m.chip}
                    </span>
                  </div>
                  <p className="text-[13.5px] sm:text-[14px] leading-relaxed mt-1.5"
                    style={{ color: 'var(--txm)' }}>
                    {de ? m.bodyDe : m.bodyEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sämtliche Laborwerte in einer Zeile — die Zahlen stehen
              ausfuehrlich auf /wissenschaft, hier reicht der Nachweis, dass es
              sie gibt. Die Eingangsleistung gehört an jede Wattnennung. */}
          <p className="text-[11.5px] leading-relaxed mt-4" style={{ color: 'var(--txff)' }}>
            {de
              ? `Gemessen: ${w.wax[0]}–${w.wax[1]} W Antriebsverlust statt ${w.oil[0]}–${w.oil[1]} W bei ${w.inputW[0]}–${w.inputW[1]} W Tretleistung, Reibungszahl μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} statt μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Laborwerte.`
              : `Measured: ${w.wax[0]}–${w.wax[1]} W drivetrain loss instead of ${w.oil[0]}–${w.oil[1]} W at ${w.inputW[0]}–${w.inputW[1]} W pedalling power, friction coefficient μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} instead of μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Lab values.`}
          </p>
        </div>

        {/* ── Der Beleg ──
            Zeile 03 behauptet, dass der Verschleiss im Gelenk entsteht und
            dass Wachs ihn dort verhindert. Genau daneben steht jetzt die
            eigene Mikroskopaufnahme derselben Flaeche mit und ohne MoS2 —
            gleiche Vergroesserung, gleiche Bedingungen. Sie lag bisher nur
            auf /wissenschaft, also hinter einem Klick, den die meisten
            Besucher der Startseite nie machen. */}
        <div>
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--bd)', background: 'var(--card-bg)', boxShadow: 'var(--card-shad)' }}>
            <BeforeAfterSlider
              beforeSrc="/images/microscope/01-chain-link-inner-ref.webp"
              afterSrc="/images/microscope/01-chain-link-inner-mos2.webp"
              beforeAlt={de ? 'Kettenglied-Innenfläche, Referenz ohne MoS₂' : 'Chain link inner surface, reference without MoS₂'}
              afterAlt={de ? 'Kettenglied-Innenfläche mit Waxcelerate und MoS₂' : 'Chain link inner surface with Waxcelerate and MoS₂'}
              beforeLabel={de ? 'Referenz' : 'Reference'}
              afterLabel="Waxcelerate"
            />
          </div>

          <p className="eyebrow mt-5 mb-2" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Eigene Aufnahme · 1000×' : 'Our own micrograph · 1000×'}
          </p>
          <h3 className="font-display font-bold text-wx-tx1 leading-[1.15] tracking-[-0.02em] mb-2"
            style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.45rem)' }}>
            {de ? 'Dieselbe Stelle, zwei Schmierstoffe.' : 'Same spot, two lubricants.'}
          </h3>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>
            {de
              ? 'Innenfläche eines Kettenglieds — genau die Fläche, auf der der Bolzen läuft. Zieh den Regler. Identische Aufnahmebedingungen, keine Simulation.'
              : 'Inner surface of a chain link — exactly the face the pin runs on. Drag the handle. Identical shooting conditions, not a simulation.'}
          </p>
        </div>
      </div>

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
