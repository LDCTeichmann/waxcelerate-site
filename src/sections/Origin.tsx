import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';

// The one dark full-bleed break in an otherwise all-light homepage (Luca's
// "dark moment in the middle" ask). Scoped to the wax only — "gegossen in
// Stuttgart" is true for what we make here, not for a Shimano/SRAM/YBN chain
// we only wax-treat (see v9ChainFooterNote in productContent.ts).
//
// Dritter Aufbau. Die beiden vorherigen und warum sie nicht getragen haben:
//
//  v1: gerahmtes Bild neben Text, Verlaufsbaender an Ober- und Unterkante.
//      Rueckmeldung: die Baender wirkten billig, das Bild wie "nur ein
//      rundes Ding daneben".
//  v2: ein Foto ueber die volle Breite, darueber ein Scrim, der links 95 %
//      deckte. Zwei Fehler auf einmal. Erstens war das Bild damit faktisch
//      schon eine rechte Spalte — nur eine, die man durch Uebermalen der
//      linken zwei Drittel erzeugt hat, statt sie zu bauen. Zweitens, und
//      das war der sichtbare Mangel: die Vorlage ist ein HOCHFORMAT
//      (2224x3953). Ueber die volle Breite gezogen musste daraus ein
//      extremer Querausschnitt werden, und die ausgelieferte Datei war dabei
//      nur 1200px breit — auf einem 2560px-Bildschirm also mehr als doppelt
//      hochskaliert. Daher "unscharf": kein Motiv-, sondern ein
//      Aufloesungsproblem.
//
// v3 ist eine echte Bildspalte am rechten Rand ueber die volle
// Sektionshoehe. Die Vorlage ist jetzt quadratisch (2367x2367) — das
// deckt sich fast mit dem Seitenverhaeltnis der Spalte auf ueblichen
// Laptop-Breiten (~46 %, ~1:1), also kaum Beschnitt und kein Reinzoomen
// auf den Wachsblock. Gespeist aus einer 1400px-Datei, bei ~46 %
// Spaltenbreite auf 1600px-Viewport rund 730 CSS-Pixel, also fast
// 2x-Dichte. Die linke Kante loest sich per Verlauf in den dunklen Grund
// auf, damit die Spalte nicht als aufgeklebtes Rechteck endet — bewusst
// schmal und weich, damit das Motiv Strahlkraft behaelt, aber ohne die
// Baender an den Sektionskanten, die an v1 kritisiert wurden.
export function Origin() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // Only two stats, deliberately: "2024 · In Stuttgart gegründet" already
  // lives in the About section's own stat row (src/sections/about.tsx) — an
  // Origin section repeating it back is filler, not new information.
  const stats = [
    { v: '80–90 °C', l: t.origin.stat1 },
    { v: t.origin.stat2v, l: t.origin.stat2 },
  ];

  const img = (
    <picture>
      <source
        srcSet="/images/origin/origin-stuttgart-800.webp 800w, /images/origin/origin-stuttgart.webp 1400w"
        sizes="(max-width: 1023px) 100vw, 46vw"
        type="image/webp"
      />
      <img
        src="/images/origin/origin-stuttgart.jpg"
        alt={de
          ? 'Frisch gegossene Waxcelerate-Wachsblöcke mit Blick über das Stuttgarter Tal'
          : 'Freshly cast Waxcelerate wax blocks overlooking the Stuttgart valley'}
        className="w-full h-full object-cover"
        style={{ objectPosition: '50% 50%' }}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );

  return (
    // Mindesthoehe ab lg, damit die Bildspalte hochkant bleibt. Ohne sie
    // bestimmt allein der Text die Sektionshoehe (gemessen: 577px), und die
    // Spalte wird mit 662x577 breiter als hoch — dann schneidet object-cover
    // aus dem Hochformat-Ausschnitt wieder ein Querband heraus, also genau
    // das Problem, das dieser Umbau beheben soll.
    <section id="herkunft" className="relative overflow-hidden lg:min-h-[680px] lg:flex lg:items-center"
      style={{ background: '#0a0a0a' }}>

      {/* ── Bildspalte, ab lg als echte Spalte rechts ──
          absolut positioniert, damit sie die volle Sektionshoehe traegt,
          egal wie hoch der Text daneben baut. */}
      <div aria-hidden className="hidden lg:block absolute inset-y-0 right-0 w-[46%]">
        {img}
        {/* Linke Kante loest sich in den Grund auf. Bewusst schmal und weich
            gehalten, damit der Verlauf die Kante nur kaschiert, statt in das
            Motiv hineinzufressen — das Foto soll Strahlkraft behalten. */}
        <div className="absolute inset-y-0 left-0 w-2/5 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.38) 24%, rgba(10,10,10,0) 62%)' }} />
      </div>

      {/* Mobil: Bild als Band oben. Eine Seitenspalte gibt es auf 390px
          nicht sinnvoll, und das Motiv unter den Text zu schieben wuerde die
          Sektion mit einer Textwand beginnen lassen. */}
      <div className="lg:hidden relative w-full" style={{ aspectRatio: '4 / 3' }}>
        {img}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0) 100%)' }} />
      </div>

      <div aria-hidden className="absolute inset-0 pointer-events-none hero-grain" />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-20 pb-20 pt-10 sm:pt-14 lg:py-32">
        <div ref={headerRef} className="max-w-lg lg:max-w-[30rem]">
          <p data-reveal="eyebrow" className="eyebrow mb-3" style={{ color: 'var(--brand-blue)' }}>
            {t.origin.eyebrow}
          </p>
          <h2
            data-reveal="heading"
            className="font-display font-bold leading-[1.1] text-white mb-5"
            style={{ fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            {t.origin.title1}
            <br />
            <em className="italic">{t.origin.title2}</em>
          </h2>
          <p data-reveal="subtitle" className="text-[15px] leading-[1.8] max-w-md" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {t.origin.body}
          </p>
          <div className="grid grid-cols-2 max-w-[280px] mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.16)' }}>
            {stats.map((s, i) => (
              <div key={s.l} className="pr-2" style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.16)' : 'none', paddingLeft: i > 0 ? '1rem' : 0 }}>
                <p className="font-display font-bold text-white tabular-nums" style={{ fontSize: 'clamp(16px, 2.2vw, 24px)' }}>
                  {s.v}
                </p>
                <p className="text-meta uppercase mt-1" style={{ letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
