import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { ScienceTeaser } from '@/sections/science/ScienceTeaser';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { InstrumentFrame } from '@/components/viz';
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
// das, was man auf dem Rad merkt, die Zahl steht klein daneben als Beleg.
// Haarlinien-Zeilen statt Kacheln ist außerdem der von DESIGN.md §3
// vorgesehene Standardbehälter.
// Vier Zeilen, vier VERSCHIEDENE Achsen.
//
// 08/2026, zweiter Durchgang: Luca fand die Sektion textlastig, uneinheitlich
// proportioniert und ohne Emotion. Body-Texte deshalb auf einen Halbsatz
// gekürzt. Die Wattzahlen sind aus der Textzeile in einen kleinen
// Balkenvergleich neben der Mikroskopkarte gewandert (Herkunft:
// `WhatChanges.tsx`, dort unbenutzt), damit die rechte Spalte zwei gleich
// schwere Karten zeigt statt Foto+Zahl. Die Kostenzahl bekommt eine Rechnung
// statt eines Absatzes.
//
// Ein echtes Testimonial (Foto + Zitat aus einem eBay-Review) stand hier
// kurzzeitig als eigener Block zwischen Liste und Beleg — Lucas Feedback:
// Zitat zu groß, Foto nicht überzeugend genug, und redundant zur ohnehin
// laufenden Bewertungs-Zeile weiter unten auf der Seite. Wieder raus; Liste
// und Beleg stehen jetzt wieder direkt nebeneinander wie ursprünglich, nur
// mit kürzeren Zeilen und einer zweiten Karte (Wattbalken) im Beleg.
//
// 08/2026, dritter Durchgang: Mikroskopbild gewechselt von 04 (chain-link-
// inner-2) auf 01 (chain-link-inner) — 04 ist fast 16:9 (1,9:1), der Slider-
// Rahmen aber 4:3, also standen oben und unten dicke schwarze Balken, genau
// dort, wo REFERENZ/WAXCELERATE stehen (Lucas Beschwerde). 01 liegt mit
// 1,21–1,29:1 sehr nah an den 5:4, die `aspect` jetzt für diese Karte trägt —
// der Rahmen ist außerdem inhaltlich der treffendere: "Innenfläche eines
// Kettenglieds, wo der Bolzen läuft" (Zeile 03) ist exakt das Motiv von 01,
// 04 war ein zweiter Schnitt derselben Stelle aus anderem Winkel.
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
      bodyDe: 'Kein Ketten-Tattoo an der Wade, keine schwarzen Finger beim Einladen.',
      bodyEn: 'No chain tattoo on your calf, no black fingers loading the bike.',
      chip: de ? 'färbt nicht ab' : 'no rub-off',
    },
    {
      n: '02',
      titleDe: 'Es wird leise.',
      titleEn: 'It goes quiet.',
      bodyDe: 'Kein trockenes Sirren im Leerlauf, kein Knirschen unter Last.',
      bodyEn: 'No dry whirr when freewheeling, no grinding under load.',
      chip: de ? 'Fahrerurteil' : 'rider reports',
    },
    {
      n: '03',
      titleDe: 'Im Gelenk mahlt nichts mehr.',
      titleEn: 'Nothing grinds inside the joint.',
      bodyDe: 'Öl bindet Staub zu einer Schleifpaste zwischen Bolzen und Hülse — genau dort entsteht Verschleiß, nicht außen an der Kette.',
      bodyEn: 'Oil binds dust into a grinding paste between pin and bushing — that is where wear happens, not on the outside of the chain.',
      chip: `μ ${pro.muLo.toFixed(2)} ${de ? 'statt' : 'vs'} ${oil.muLo.toFixed(2)}`,
    },
    {
      n: '04',
      titleDe: 'Der ganze Antrieb hält länger.',
      titleEn: 'The whole drivetrain lasts longer.',
      bodyDe: `Die Kette hält ${life.waxLo} bis ${life.wax} mal so lange, Kassette und Kettenblätter altern nicht mit.`,
      bodyEn: `The chain lasts ${life.waxLo} to ${life.wax} times as long, cassette and chainrings don't age along with it.`,
      chip: `${life.waxLo}–${life.wax}×`,
    },
  ];
}

// ─── Antriebsverlust als EINE Skala statt zweier Balkenzeilen ────────────────
// 08/2026, siebter Durchgang: die urspruengliche Fassung (zwei beschriftete
// Balkenzeilen uebereinander) kostete allein ~115px Hoehe in einer jetzt sehr
// schlanken InstrumentFrame-Karte — der groesste vermeidbare Einzelposten auf
// dem Weg zu "passt auf einen Bildschirm". Oel-Bereich (6–10 W) und Wachs-
// Bereich (2–4 W) ueberlappen sich nicht, koennen also auf DERSELBEN Skala
// sitzen statt auf zwei getrennten — ein Messgeraet mit einer Skala und zwei
// Markierungen, nicht zwei Messgeraete. Spart ~40px UND liest sich naeher an
// "Instrument" als zwei generische Fortschrittsbalken.
function DriveLossBars({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(prefersReducedMotion());
  const w = waxVsOil.watts;
  const MAX = 12;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const t = ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => setRun(true) });
    return () => t.kill();
  }, []);

  const seg = (lo: number, hi: number, accent: boolean) => ({
    left: `${(lo / MAX) * 100}%`,
    width: run ? `${((hi - lo) / MAX) * 100}%` : '0%',
    background: accent ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))' : 'var(--txf)',
    opacity: accent ? 1 : 0.35,
    transition: 'width .9s cubic-bezier(0.22,1,0.36,1)',
  });

  return (
    <div ref={ref}>
      <div className="relative h-2.5 rounded-full" style={{ background: 'var(--bd2)' }}>
        <div className="absolute inset-y-0 rounded-full" style={seg(w.oil[0], w.oil[1], false)} />
        <div className="absolute inset-y-0 rounded-full" style={seg(w.wax[0], w.wax[1], true)} />
      </div>
      <div className="flex items-center justify-between mt-2.5 text-small">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--txm)' }}>
          <span aria-hidden className="inline-block rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: 'var(--txf)', opacity: 0.5 }} />
          {de ? 'Kettenöl' : 'Chain oil'}
          <span className="num-data" style={{ color: 'var(--txf)' }}>{w.oil[0]}–{w.oil[1]} W</span>
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--tx1)' }}>
          <span aria-hidden className="inline-block rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: 'var(--accent)' }} />
          {de ? 'Heißwachs' : 'Hot wax'}
          <span className="num-data font-medium" style={{ color: 'var(--accent)' }}>{w.wax[0]}–{w.wax[1]} W</span>
        </span>
      </div>
      <div className="flex justify-between mt-2.5 pt-2" style={{ borderTop: '1px solid var(--bd2)' }}>
        {[0, 6, 12].map(v => (
          <span key={v} className="num-data text-eyebrow" style={{ color: 'var(--txff)', letterSpacing: 'normal' }}>{v}{v === 12 ? ' W' : ''}</span>
        ))}
      </div>
    </div>
  );
}

export function WhyWax() {
  const { lang }   = useLanguage();
  const de         = lang === 'de';
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const rowsRef    = useRef<HTMLDivElement>(null);
  const proofRef   = useRef<HTMLDivElement>(null);

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
      if (proofRef.current) {
        gsap.fromTo(proofRef.current,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: proofRef.current, start: 'top 85%', once: true } });
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
    // `style` überschreibt hier bewusst Sections eigenes `py-14 sm:py-28`
    // (112px oben+unten auf Desktop) — Lucas Vorgabe war, dass Überschrift
    // bis 70-€-Zeile ohne weiteres Scrollen auf einen Bildschirm passen.
    // Section.tsx selbst bleibt unangetastet (gilt fuer alle anderen
    // Sektionen der Seite), nur diese eine Instanz bekommt per Inline-Style
    // (schlägt die Klasse ohne `!important`-Hacks) einen kleineren, fluiden
    // Wert.
    <Section id="warum-wachs" ref={sectionRef} className="bg-wx-sf"
      style={{ paddingTop: 'clamp(1.75rem, 3vw, 2.5rem)', paddingBottom: 'clamp(1.75rem, 3vw, 2.5rem)' }}>

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      {/* ── Header ── */}
      <div ref={headerRef} className="mb-5 sm:mb-6">
        <p className="eyebrow mb-2" style={{ color: 'var(--txf)' }}>
          {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
        </p>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-3">
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
          08/2026, siebter Durchgang: schlanke Karten (290px, voriger
          Durchgang) liessen den Bildunterschrift-Satz auf zwei Zeilen
          umbrechen — "länglich", Lucas Wort — und die Sektion war insgesamt
          hoeher als ein Bildschirm, die 70-€-Zahl fiel unters Fold. Vier
          Stellschrauben, keine davon einzeln gross, zusammen aber spuerbar:
          1. Beleg-Spalte 290px → 370px. Der Bildunterschrift-Satz braucht
             per `scrollWidth`-Messung (whiteSpace:nowrap, dann zurueck)
             exakt 325px natuerliche Breite; 350px Kartenbreite (318px nutzbar
             nach Padding) reichte um 7px nicht, 370px (338px nutzbar) laesst
             sicheren Spielraum. Bleibt trotzdem klar unter der alten
             Spaltenbreite (~475px) und weit über der ~224px-Kollisionsgrenze
             der REFERENZ/WAXCELERATE-Chips.
          2. Der Metrik-Chip zieht aus einer eigenen Zeile unter den
             Fliesstext IN den Fliesstext ("… beim Einladen.  färbt nicht
             ab") — spart eine ganze Zeile Höhe pro Listenpunkt (vier Zeilen
             insgesamt) UND liest sich weniger zusammengestückelt: die Zahl
             wirkt wie eine angehängte Beleg-Notiz zum Satz, nicht wie ein
             drittes, unverbundenes Element.
          3. Zeilenabstand der Liste und Kopfbereich-Abstand jeweils leicht
             gestrafft (py-8→py-7, mb-12→mb-9) — zusammen mit Punkt 2 genug,
             um die ganze Sektion wieder unter eine Bildschirmhoehe zu
             bringen, ohne dass die grossen Serifziffern ihre Wirkung
             verlieren.
          4. Wattbalken (DriveLossBars) sind ab jetzt `hidden sm:block` —
             auf Mobile ersetzt sie eine einzeilige Zusammenfassung. Von den
             drei Beleg-Stuecken (Foto, Wattbalken, 70-€-Zahl) sind die
             Wattbalken die einzige reine Wiederholung: Zeile 03 der Liste
             traegt die Reibungszahl schon als Chip, Zeile 04 die
             Kettenlaufzeit. Foto ist der einzige echte Eigenbeleg der Marke
             (nirgendwo sonst auf der Seite), die 70-€-Zahl der konkreteste,
             am leichtesten verstaendliche Vorteil. Die Balken sind der
             abstrakteste der drei (μ-Werte, Watt) UND schon anderswo in der
             Liste vertreten — die naheliegende Streichung fuer Mobile. */}
      <div className="grid lg:grid-cols-[1fr_370px] gap-10 lg:gap-16 items-start">

        <div ref={rowsRef} style={{ borderTop: '1px solid var(--bd2)' }}>
          {moments.map(m => (
            <div key={m.n} data-row className="flex items-start gap-5 sm:gap-7 py-7 sm:py-9"
              style={{ borderBottom: '1px solid var(--bd2)' }}>
              <span className="font-display font-bold leading-none flex-shrink-0 select-none"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 3.25rem)', color: 'var(--accent-soft)', minWidth: '2.4ch' }}>
                {m.n}
              </span>
              <div className="flex-1 min-w-0 pt-1" style={{ maxWidth: '32rem' }}>
                <h3 className="font-display font-bold text-wx-tx1 leading-[1.15] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)' }}>
                  {de ? m.titleDe : m.titleEn}
                </h3>
                <p className="text-body leading-relaxed mt-2"
                  style={{ color: 'var(--txm)' }}>
                  {de ? m.bodyDe : m.bodyEn}
                  {'  '}
                  <span className="num-data text-eyebrow whitespace-nowrap" style={{ color: 'var(--txf)', letterSpacing: 'normal', textTransform: 'none' }}>
                    · {m.chip}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* w-full statt fixer 370px unterhalb von lg: bei 370px fixer Breite
            ragte die Karte auf schmalen Viewports (< ~420px, inkl. der
            Section-Innenabstaende) über den Content-Rand hinaus und erzeugte
            horizontales Scrollen — nachgemessen per scrollWidth/clientWidth.
            max-w-[370px] deckelt sie trotzdem, falls sm: (bis lg:) mal breiter
            als 370px content-Platz hat. */}
        <div ref={proofRef} className="flex flex-col gap-2.5 mx-auto lg:mx-0 w-full max-w-[370px] lg:w-[370px]">
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--bd)', background: 'var(--card-bg)', boxShadow: 'var(--card-shad)' }}>
            <div className="pt-2">
              <BeforeAfterSlider
                aspect="6/5"
                beforeSrc="/images/microscope/01-chain-link-inner-ref.webp"
                afterSrc="/images/microscope/01-chain-link-inner-mos2.webp"
                beforeAlt={de ? 'Kettenglied-Innenfläche, Referenz ohne MoS₂' : 'Chain link inner surface, reference without MoS₂'}
                afterAlt={de ? 'Kettenglied-Innenfläche mit Waxcelerate und MoS₂' : 'Chain link inner surface with Waxcelerate and MoS₂'}
                beforeLabel={de ? 'Referenz' : 'Reference'}
                afterLabel="Waxcelerate"
              />
            </div>
            <div className="px-4 pb-3.5 pt-3">
              <p className="eyebrow mb-1.5" style={{ color: 'var(--accent-soft)' }}>
                {de ? 'Eigene Aufnahme · 1000×' : 'Our own micrograph · 1000×'}
              </p>
              <p className="text-small leading-relaxed" style={{ color: 'var(--txm)' }}>
                {de
                  ? 'Innenfläche eines Kettenglieds, dort wo der Bolzen läuft.'
                  : 'Inner surface of a chain link, exactly where the pin runs.'}
              </p>
            </div>
          </div>

          <InstrumentFrame
            noReveal
            eyebrow={de ? 'Gemessen · Antriebsverlust' : 'Measured · drivetrain loss'}
            footer={
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <span className="font-display font-bold" style={{ fontSize: '1.6rem', color: 'var(--accent)' }}>
                    {eur(cost.savedEur, de)}
                  </span>
                  <span className="text-meta ml-1.5" style={{ color: 'var(--txf)' }}>
                    {de ? `/ ${cost.km.toLocaleString('de-DE')} km` : `/ ${cost.km.toLocaleString('en-US')} km`}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 num-data text-small">
                  <span style={{ color: 'var(--txf)', textDecoration: 'line-through', textDecorationColor: 'var(--bd)' }}>
                    {eur(cost.oilEur, de)}
                  </span>
                  <span aria-hidden style={{ color: 'var(--txff)' }}>→</span>
                  <span style={{ color: 'var(--tx1)', fontWeight: 600 }}>
                    {eur(cost.waxEur, de)}
                  </span>
                </div>
              </div>
            }
          >
            {/* Balken nur ab sm — auf Mobile reicht eine Zeile, siehe
                Kommentar oben (Punkt 4): einzige der drei Beleg-Stuecke, die
                sich mit der Liste (Zeile 03/04) wiederholt. */}
            <div className="hidden sm:block">
              <DriveLossBars de={de} />
              <p className="text-meta leading-relaxed mt-3" style={{ color: 'var(--txff)' }}>
                {de
                  ? `Bei ${w.inputW[0]}–${w.inputW[1]} W, μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} statt ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Laborwerte.`
                  : `At ${w.inputW[0]}–${w.inputW[1]} W, μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} instead of ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Lab values.`}
              </p>
            </div>
            <p className="sm:hidden text-small leading-relaxed" style={{ color: 'var(--txm)' }}>
              <span className="num-data font-medium" style={{ color: 'var(--accent)' }}>{w.wax[0]}–{w.wax[1]} W</span>
              {de ? ' statt ' : ' instead of '}
              <span className="num-data" style={{ color: 'var(--txf)' }}>{w.oil[0]}–{w.oil[1]} W</span>
              {de ? ' Reibungsverlust im Antrieb.' : ' drivetrain friction loss.'}
            </p>
          </InstrumentFrame>
        </div>
      </div>

      {/* ── Tür in die Wissenschaft ── */}
      <ScienceTeaser de={de} />

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--pg), transparent 100%), var(--pg))', zIndex: 1 }} />
    </Section>
  );
}
