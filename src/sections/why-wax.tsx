import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { prefersReducedMotion } from '@/hooks/useAnimation';
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
/** Posten mit Punktfuehrung, wie im Beileger (public/flyer.html, .fv-dots).
 *  Zwei Zahlen untereinander ohne verbindende Linie liest das Auge als zwei
 *  unabhaengige Angaben; mit Fuehrung als eine Rechnung. Genau darum geht es
 *  hier, denn die Summenzeile darunter ist nur mit beiden Posten glaubwuerdig. */
function LeaderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-small flex-shrink-0" style={{ color: 'var(--txm)' }}>{label}</span>
      <span className="flex-1 self-center" style={{ borderBottom: '1px dotted var(--bd2)' }} aria-hidden />
      <span className="num text-small flex-shrink-0" style={{ color: 'var(--tx1)' }}>{value}</span>
    </div>
  );
}

function buildMoments(de: boolean) {
  const pro = frictionRanges.find(r => r.id === 'pro')!;
  const oil = frictionRanges.find(r => r.id === 'oil')!;
  const life = waxVsOil.life;

  return [
    {
      n: '01',
      titleDe: 'Du bleibst sauber.',
      titleEn: 'You stay clean.',
      bodyDe: 'Keine schwarzen Streifen an Hose und Fingern, auch nicht beim Einladen.',
      bodyEn: 'No black streaks on your clothes or hands, not even when loading the bike.',
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
      bodyDe: 'Öl bindet Staub zu einer Schleifpaste zwischen Bolzen und Hülse. Genau dort entsteht Verschleiß.',
      bodyEn: 'Oil binds dust into a grinding paste between pin and bushing. That is exactly where wear happens.',
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
      {/* Skala ueber der Spur statt darunter — die Achse zuerst lesen, dann die
          Balken dagegen. */}
      <div className="flex justify-between mb-2">
        {[0, 6, 12].map(v => (
          <span key={v} className="num-data text-eyebrow" style={{ color: 'var(--txff)', letterSpacing: 'normal' }}>{v}{v === 12 ? ' W' : ''}</span>
        ))}
      </div>
      <div className="relative h-2.5 rounded-full" style={{ background: 'var(--bd2)' }}>
        <div className="absolute inset-y-0 rounded-full" style={seg(w.oil[0], w.oil[1], false)} />
        <div className="absolute inset-y-0 rounded-full" style={seg(w.wax[0], w.wax[1], true)} />
      </div>
      {/* Reihenfolge folgt der Balkenlage: Wachs (2–4 W) sitzt links auf der
          Skala, Oel (6–10 W) rechts — also steht Heisswachs auch links. */}
      <div className="flex items-center justify-between mt-2.5 text-small">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--tx1)' }}>
          <span aria-hidden className="inline-block rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: 'var(--accent)' }} />
          {de ? 'Heißwachs' : 'Hot wax'}
          <span className="num-data font-medium" style={{ color: 'var(--accent)' }}>{w.wax[0]}–{w.wax[1]} W</span>
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--txm)' }}>
          <span aria-hidden className="inline-block rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: 'var(--txf)', opacity: 0.5 }} />
          {de ? 'Kettenöl' : 'Chain oil'}
          <span className="num-data" style={{ color: 'var(--txf)' }}>{w.oil[0]}–{w.oil[1]} W</span>
        </span>
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
  // Zwei Belege, eine Kartenhöhe: "Foto" (Öl/Wachs-Fotopaar) und
  // "Mikroskop" (bestehendes 1000×-Paar) teilen sich denselben Slot statt
  // eine zweite Karte anzuhängen — die Sektion ist bewusst auf eine
  // Bildschirmhöhe getrimmt (siehe Kommentare unten), dafür war kein Platz
  // übrig. Default "macro": das unmittelbar Sichtbare passt besser zur
  // Überschrift "Du merkst es sofort" als eine Aufnahme, die man eben nur
  // unterm Mikroskop sieht. ("Sichtbar" als Label verworfen — Luca-Feedback:
  // unklar, was damit gemeint ist. "Foto" vs. "Mikroskop" ist der
  // eindeutigere Kontrast.)
  const [proofTab, setProofTab] = useState<'macro' | 'micro'>('macro');

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

  // Ein Objekt statt zweier paralleler Ternaries — einzige Quelle für
  // welches Bildpaar gerade aktiv ist. Beide Paare sind exakt auf 6/5
  // vorzugeschnitten (siehe public/images/compare/, Originale in
  // raw-image-library/compare/ bzw. unverändert in public/images/microscope/
  // für die Wissenschaftsseite, die ihr eigenes Seitenverhältnis nutzt) —
  // object-contain zeigt beide Paare dadurch randlos, ohne Balken oben/unten.
  // `aspect` ist deshalb fix 6/5 für beide Tabs: gleiche Kartenhöhe UND
  // gleiches Bildformat, kein Sprung beim Umschalten.
  const proof = proofTab === 'macro'
    ? {
        aspect: '6/5',
        beforeSrc: '/images/compare/chain-oel.webp',
        afterSrc: '/images/compare/chain-wachs.webp',
        beforeAlt: de ? 'Kette mit Kettenöl, ungewachst' : 'Chain with chain oil, unwaxed',
        afterAlt: de ? 'Dieselbe Kette, gewachst mit Waxcelerate' : 'Same chain, waxed with Waxcelerate',
        beforeLabel: de ? 'Öl' : 'Oil',
        caption: de
          ? 'Kein Dreck, keine Flecken. Der Unterschied ist sofort sichtbar.'
          : 'No grime, no stains. The difference is visible immediately.',
      }
    : {
        aspect: '6/5',
        beforeSrc: '/images/compare/micro-ref.webp',
        afterSrc: '/images/compare/micro-mos2.webp',
        beforeAlt: de ? 'Kettenglied-Innenfläche, Referenz ohne MoS₂' : 'Chain link inner surface, reference without MoS₂',
        afterAlt: de ? 'Kettenglied-Innenfläche mit Waxcelerate und MoS₂' : 'Chain link inner surface with Waxcelerate and MoS₂',
        beforeLabel: de ? 'Referenz' : 'Reference',
        caption: de
          ? 'Innenfläche eines Kettenglieds, dort wo der Bolzen läuft.'
          : 'Inner surface of a chain link, exactly where the pin runs.',
      };

  return (
    // `style` ueberschreibt hier bewusst Sections eigenes `py-14 sm:py-28`
    // (112px oben+unten auf Desktop). Lucas Vorgabe: die Sektion soll nicht
    // ueber Gebuehr Platz fressen. Section.tsx selbst bleibt unangetastet
    // (gilt fuer alle anderen Sektionen), nur diese eine Instanz bekommt per
    // Inline-Style (schlaegt die Klasse ohne `!important`-Hacks) einen
    // kleineren, fluiden Wert.
    <Section id="warum-wachs" ref={sectionRef} className="bg-wx-sf"
      style={{ paddingTop: 'clamp(1.75rem, 3vw, 2.75rem)', paddingBottom: 'clamp(1.75rem, 3vw, 2.75rem)' }}>

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      {/* ══ Band 1: Behauptung links, Beleg rechts ══════════════════════════
          Vorher stand die Ueberschrift allein ueber der vollen Breite und die
          vier Zeilen darunter in einer schmalen Spalte, neben der zwei
          gestapelte Karten standen. Das hatte drei Probleme auf einmal: rechts
          zwei Karten, die wie zusammengestueckelt wirkten; links eine Spalte,
          in der vier kurze Saetze per `flex-1` auf Kartenhoehe auseinander-
          gezogen wurden; und ueber 1300px Hoehe fuer insgesamt vier Aussagen.

          Jetzt drei volle Baender statt Spalten: Behauptung mit Beleg, dann
          die vier Punkte ueber die ganze Breite, dann die Messwerte als
          Fusszeile. Der freie Platz neben der Ueberschrift traegt jetzt das
          Foto, statt leer zu bleiben — und beide Karten sind aufgeloest: der
          Slider steht ohne Rahmen da, die Kostenrechnung als Haarlinienzeile. */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-16 items-center mb-8 sm:mb-10">

        <div ref={headerRef}>
          <p className="eyebrow mb-2" style={{ color: 'var(--txf)' }}>
            {de ? 'Öl vs. Wachs' : 'Oil vs. wax'}
          </p>
          {/* "Du merkst es sofort." war ein Gefuehl, keine Aussage, und stand
              damit auch im Widerspruch zum Rest der Seite, die sonst ueberall
              mit Messwerten argumentiert. Die neue Zeile ist die Praemisse
              selbst, aus der die vier Punkte darunter folgen.
              Verworfene Alternativen: "Öl schmiert. Wachs auch, nur ohne den
              Dreck." (zu geschwaetzig fuer eine Headline) und "Der Unterschied
              bleibt nicht an dir haengen." (wieder Gefuehl statt Aussage). */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-3">
            <ScrollWordReveal text={de ? 'Trocken schmiert besser.' : 'Dry lubricates better.'} />
          </h2>
          <p data-reveal="subtitle" className="text-wx-txm max-w-xl text-[15px] leading-relaxed">
            {de
              ? 'Wachs härtet trocken aus und bindet deshalb keinen Schmutz. Alles Weitere folgt daraus, und vier davon merkst du schon auf der ersten Ausfahrt.'
              : 'Wax cures dry and therefore binds no dirt. Everything else follows from that, and four of those you notice on the very first ride.'}
          </p>
        </div>

        {/* Der Beleg ohne Kartenrahmen: kein Hintergrund, kein Schatten, keine
            Ecken. Ein Foto braucht keine Karte, um ein Foto zu sein, und die
            Karte war genau das, was die Sektion zusammengestueckelt aussehen
            liess. Umschalter darueber statt in einem Kartenfuss. */}
        <div ref={proofRef} className="w-full max-w-[380px] mx-auto lg:mx-0">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            {/* Unter sm ausgeblendet: dort blieben fuer die Beschriftung UND
                den Umschalter keine 342px uebrig, beides brach zweizeilig um.
                Die Labels im Bild (ÖL / WAXCELERATE) sagen ohnehin dasselbe. */}
            <span className="eyebrow hidden sm:inline" style={{ color: 'var(--txf)' }}>
              {de ? 'Dieselbe Kette' : 'Same chain'}
            </span>
            {/* Segmented Control statt reiner Farbaenderung an Fliesstext —
                Luca-Feedback: der alte, rein textbasierte Umschalter wurde
                nicht als klickbar erkannt bzw. beim Klicken verfehlt. Das
                Pfeil-Icon markiert die Gruppe zusaetzlich als Umschalter. */}
            <div className="flex items-center gap-1.5">
              <ArrowLeftRight className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--txff)' }} aria-hidden />
              <div className="inline-flex items-center gap-1 p-0.5 rounded-full"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
                <button type="button" aria-pressed={proofTab === 'macro'}
                  onClick={() => setProofTab('macro')}
                  className="text-meta font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  style={{
                    color: proofTab === 'macro' ? '#fff' : 'var(--txm)',
                    background: proofTab === 'macro' ? 'var(--accent)' : 'transparent',
                  }}>
                  {de ? 'Foto' : 'Photo'}
                </button>
                <button type="button" aria-pressed={proofTab === 'micro'}
                  onClick={() => setProofTab('micro')}
                  className="text-meta font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  style={{
                    color: proofTab === 'micro' ? '#fff' : 'var(--txm)',
                    background: proofTab === 'micro' ? 'var(--accent)' : 'transparent',
                  }}>
                  {de ? 'Mikroskop · 1000×' : 'Microscope · 1000×'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ transform: 'translateZ(0)' }}>
            <BeforeAfterSlider
              key={proofTab}
              aspect={proof.aspect}
              beforeSrc={proof.beforeSrc}
              afterSrc={proof.afterSrc}
              beforeAlt={proof.beforeAlt}
              afterAlt={proof.afterAlt}
              beforeLabel={proof.beforeLabel}
              afterLabel="Waxcelerate"
            />
          </div>
          <p className="text-small leading-relaxed mt-2.5" style={{ color: 'var(--txm)' }}>
            {proof.caption}
          </p>
        </div>
      </div>

      {/* ══ Band 2: die vier Punkte als Datenblattzeile ═════════════════════
          Typo-Grammatik des Beilegers (public/flyer.html, .stats-row): Zellen
          auf Flaechenfarbe, dazwischen 1px Fuge in der Rahmenfarbe. Der Trick
          daran ist, dass er bei jeder Spaltenzahl von selbst aufgeht — auf dem
          Handy werden aus den senkrechten Fugen waagerechte Trennlinien, ohne
          eine einzige Sonderregel fuer erste/letzte Zelle. */}
      <div ref={rowsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
        style={{ background: 'var(--bd2)', borderTop: '1px solid var(--bd2)', borderBottom: '1px solid var(--bd2)' }}>
        {moments.map((m, i) => (
          <div key={m.n} data-row
            className={[
              'py-6',
              // Aussenkanten buendig mit der Sektionsspalte, damit die 01
              // exakt unter der Ueberschrift steht und die 04 am rechten Rand
              // abschliesst. Innen gleichmaessiger Abstand zur Fuge.
              i === 0 ? 'lg:pl-0 lg:pr-7' : i === moments.length - 1 ? 'lg:pl-7 lg:pr-0' : 'lg:px-7',
            ].join(' ')}
            style={{ background: 'var(--sf)' }}>
            <span className="font-display font-bold leading-none select-none block"
              style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', color: 'var(--accent-soft)' }}>
              {m.n}
            </span>
            <h3 className="font-display font-bold text-wx-tx1 leading-[1.2] tracking-[-0.01em] mt-2.5 mb-1.5"
              style={{ fontSize: 'clamp(1rem, 1.35vw, 1.15rem)' }}>
              {de ? m.titleDe : m.titleEn}
            </h3>
            <p className="text-small leading-relaxed" style={{ color: 'var(--txm)' }}>
              {de ? m.bodyDe : m.bodyEn}
            </p>
            {/* Beleg-Notiz: bewusst dieselbe Schrift wie der Satz, nur eine
                Stufe kleiner und in der leisesten Textfarbe. Der Inhalt ist
                gemischt (Wortbelege wie "Fahrerurteil" neben Zahlen wie
                "μ 0.03"), eine Mono-Type passte nur zur Haelfte und las sich
                als Fehlformatierung. `.num` nur fuer buendige Ziffern. */}
            <p className="num text-meta mt-2" style={{ color: 'var(--txff)' }}>
              {m.chip}
            </p>
          </div>
        ))}
      </div>

      {/* ══ Band 3: die Messwerte als Fusszeile ═════════════════════════════
          Frueher eine zweite Karte unter der Foto-Karte. Als Band unter den
          vier Punkten liest sie sich als deren Beleg statt als eigenes
          Element, und die Kostenrechnung bekommt endlich die Breite fuer
          Punktfuehrungen (flyer.html, .fv-dots) statt einer engen Spalte.

          Klickbar bleibt sie: die Ersparniszahl stuende sonst ohne Herleitung
          da, dabei gibt es auf der wax-500-Produktseite eine
          Posten-fuer-Posten-Aufschluesselung genau dieser Zahlen. */}
      <Link to="/produkt/wax-500#instrument" className="group block pt-7 sm:pt-8"
        aria-label={de ? 'Woher die Ersparnis kommt: Kostenaufschlüsselung ansehen' : 'Where the savings come from: see the cost breakdown'}>
        <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-7 lg:gap-16">

          <div>
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Gemessen · Antriebsverlust' : 'Measured · drivetrain loss'}
            </p>
            <DriveLossBars de={de} />
            <p className="text-meta leading-relaxed mt-3" style={{ color: 'var(--txff)' }}>
              {de
                ? `Bei ${w.inputW[0]}–${w.inputW[1]} W, μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} statt ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Laborwerte.`
                : `At ${w.inputW[0]}–${w.inputW[1]} W, μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)} instead of ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}. Lab values.`}
            </p>
          </div>

          <div>
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? `Gerechnet · ${cost.km.toLocaleString('de-DE')} km` : `Calculated · ${cost.km.toLocaleString('en-US')} km`}
            </p>
            <div className="flex flex-col gap-2">
              <LeaderRow label={de ? 'Kettenöl' : 'Chain oil'} value={eur(cost.oilEur, de)} />
              <LeaderRow label={de ? 'Heißwachs' : 'Hot wax'} value={eur(cost.waxEur, de)} />
            </div>
            <div className="flex items-baseline justify-between gap-3 pt-3 mt-2.5"
              style={{ borderTop: '1px solid var(--bd2)' }}>
              <span className="text-small font-semibold" style={{ color: 'var(--tx1)' }}>
                {de ? 'Gespart' : 'Saved'}
              </span>
              <span className="font-display font-bold" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>
                {eur(cost.savedEur, de)}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-meta font-semibold mt-3" style={{ color: 'var(--tx1)' }}>
              {de ? 'Woher kommt die Zahl?' : 'Where does this number come from?'}
              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: 'var(--accent-soft)' }} />
            </span>
          </div>
        </div>
      </Link>

      {/* ── Tür in die Wissenschaft ── */}
      <ScienceTeaser de={de} />

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--pg), transparent 100%), var(--pg))', zIndex: 1 }} />
    </Section>
  );
}
