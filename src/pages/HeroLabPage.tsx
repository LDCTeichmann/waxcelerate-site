// ─── /hero-lab — Vergleichsseite für Hero-Varianten ──────────────────────────
//
// Bewusst eine eigene Route und nicht die Startseite. Der Hero ist das eine
// Element, bei dem ein Fehlgriff sofort teuer ist, also wird hier verglichen
// und erst danach getauscht. Wenn eine Variante gewinnt, wandert sie nach
// sections/hero-*.tsx und diese Seite kann weg.
//
// ─── Die Analyse dahinter ────────────────────────────────────────────────────
//
// Der bestehende Hero ist dunkel und texturnah: Kette im Studio, nah, kühl.
// Das ist handwerklich sauber und trotzdem austauschbar, denn genau so sieht
// jede zweite technische Fahrradmarke aus. Es zeigt das Produkt, aber nicht,
// wer es macht.
//
// In "New Hero" liegen drei Aufnahmen aus derselben Session: Schiefer im
// Vordergrund, Stuttgarter Hügel im Bokeh, goldenes Abendlicht, gleiche
// Kamerahöhe. Das ist kein Zufallsfundus, das ist eine Bildsprache. Und sie
// erzählt in einer Sekunde, was die Marke sonst in drei Absätzen behauptet:
// hier stellt jemand in Stuttgart etwas in kleinen Mengen her. Der Wettbewerb
// fotografiert im Studio auf Weiß. Draußen bei Abendlicht ist der Platz, den
// niemand besetzt.
//
// Deshalb die Rotation in Variante B: weil die drei Bilder aus einem Abend
// stammen, liest sich der Wechsel nicht als Slideshow, sondern als derselbe
// Ort aus drei Blickwinkeln. Bei drei zusammengewürfelten Motiven wäre genau
// das der Grund, es NICHT zu tun.

import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { waxVsOil } from '@/lib/data';

const W = 'mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14';

const SHOTS = [
  { slug: 'envelope', de: 'Umschlag und Kette auf Schiefer', en: 'Envelope and chain on slate' },
  { slug: 'hanging', de: 'Gewachste Ketten hängen zum Aushärten', en: 'Waxed chains hanging to cure' },
  { slug: 'box', de: 'Geöffneter Versandkarton mit Wachsblock', en: 'Opened shipping box with wax block' },
];

function Shot({ slug, alt, eager = false }: { slug: string; alt: string; eager?: boolean }) {
  return (
    <img
      src={`/images/hero-alt/${slug}.webp`}
      srcSet={`/images/hero-alt/${slug}-800.webp 800w, /images/hero-alt/${slug}-1200.webp 1200w, /images/hero-alt/${slug}.webp 2000w`}
      sizes="100vw"
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

/** Gemeinsame Textebene, damit die Varianten wirklich nur im Bild differieren. */
function HeroCopy({ de, onLight }: { de: boolean; onLight?: boolean }) {
  const fg = onLight ? 'var(--tx1)' : '#fff';
  const sub = onLight ? 'var(--txm)' : 'rgba(255,255,255,0.82)';
  return (
    <div className="relative z-10 max-w-[46ch]">
      <p className="text-small uppercase tracking-[0.14em] mb-4"
        style={{ color: onLight ? 'var(--accent)' : 'rgba(255,255,255,0.72)' }}>
        Waxcelerate · {de ? 'Heißwachs aus Stuttgart' : 'Hot wax from Stuttgart'}
      </p>
      <h1 className="font-display font-bold leading-[1.02] tracking-[-0.025em]"
        style={{ color: fg, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}>
        {de ? 'Ein Antrieb, der sauber bleibt.' : 'A drivetrain that stays clean.'}
      </h1>
      <p className="text-[16px] leading-relaxed mt-5 max-w-[42ch]" style={{ color: sub }}>
        {de
          ? `Heißwachs statt Öl. Kein klebriger Film, kein Schmutz, der sich einarbeitet, und ${waxVsOil.watts.oil[0]} bis ${waxVsOil.watts.oil[1]} Watt Reibung, die du nicht mehr wegdrückst.`
          : `Hot wax instead of oil. No tacky film, no grit working its way in, and ${waxVsOil.watts.oil[0]} to ${waxVsOil.watts.oil[1]} watts of friction you no longer push through.`}
      </p>
      <div className="flex flex-wrap items-center gap-4 mt-8">
        <Link to="/#produkte"
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: onLight ? 'var(--accent)' : '#fff', color: onLight ? '#fff' : '#101013' }}>
          {de ? 'Jetzt bestellen' : 'Order now'}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/wissenschaft" className="text-[14px] font-semibold underline underline-offset-4"
          style={{ color: onLight ? 'var(--tx1)' : 'rgba(255,255,255,0.9)' }}>
          {de ? 'Wie funktioniert Heißwachs?' : 'How does hot wax work?'}
        </Link>
      </div>
    </div>
  );
}

/** Variante B — langsamer Kreuzblende zwischen drei Aufnahmen einer Session. */
function Rotating({ de }: { de: boolean }) {
  const [i, setI] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    timer.current = window.setInterval(() => setI(v => (v + 1) % SHOTS.length), 6500);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: '78vh', background: 'var(--hero-stage)' }}>
      {SHOTS.map((s, n) => (
        <div key={s.slug} aria-hidden={n !== i} className="absolute inset-0"
          style={{ opacity: n === i ? 1 : 0, transition: 'opacity 1.6s ease-in-out' }}>
          <Shot slug={s.slug} alt={de ? s.de : s.en} eager={n === 0} />
        </div>
      ))}
      <div aria-hidden className="absolute inset-0"
        style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.12) 100%)' }} />
      <div className="relative h-full flex items-center px-8 sm:px-14 py-20" style={{ minHeight: '78vh' }}>
        <HeroCopy de={de} />
      </div>
      <div className="absolute bottom-6 left-8 sm:left-14 flex gap-2">
        {SHOTS.map((s, n) => (
          <button key={s.slug} type="button" onClick={() => setI(n)}
            aria-label={de ? s.de : s.en}
            className="rounded-full transition-all duration-500"
            style={{
              width: n === i ? 26 : 8, height: 8,
              background: n === i ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.38)',
            }} />
        ))}
      </div>
    </div>
  );
}

function Variant({ n, title, note, children }: {
  n: string; title: string; note: string; children: React.ReactNode;
}) {
  return (
    <section className="py-10 sm:py-14" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="num-data text-[12px]" style={{ color: 'var(--accent)' }}>{n}</span>
          <h2 className="font-display font-bold text-wx-tx1" style={{ fontSize: '1.5rem' }}>{title}</h2>
        </div>
        <p className="text-[14px] leading-relaxed max-w-[70ch] mb-7" style={{ color: 'var(--txm)' }}>{note}</p>
        {children}
      </div>
    </section>
  );
}

export function HeroLabPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>Hero-Varianten | Waxcelerate</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navigation />

      <section className="pt-28 sm:pt-32 pb-6">
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>Intern</p>
          <h1 className="font-display font-bold text-wx-tx1 leading-tight mb-4"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', letterSpacing: '-0.02em' }}>
            Drei Hero-Varianten im Vergleich.
          </h1>
          <p className="text-wx-txm text-lead max-w-[64ch]">
            Die Startseite bleibt unangetastet. Der bestehende Hero ist dunkel und nah am Material,
            handwerklich sauber und trotzdem austauschbar: so sieht jede zweite technische Fahrradmarke aus.
            Was die Marke unterscheidet, steht auf den Bildern aus „New Hero" und nicht im Studio.
          </p>
        </div>
      </section>

      <Variant n="A" title="Ein Bild, goldene Stunde"
        note="Die hängenden Ketten mit den Hügeln dahinter. Ein Bild, das in einer Sekunde sagt, dass hier jemand in Stuttgart in kleinen Mengen arbeitet. Der Wettbewerb fotografiert im Studio auf Weiß, draußen bei Abendlicht steht niemand.">
        <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: '72vh', background: 'var(--hero-stage)' }}>
          <Shot slug="hanging" alt={de ? SHOTS[1].de : SHOTS[1].en} eager />
          <div aria-hidden className="absolute inset-0"
            style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.42) 48%, rgba(0,0,0,0.10) 100%)' }} />
          <div className="relative flex items-center px-8 sm:px-14 py-20" style={{ minHeight: '72vh' }}>
            <HeroCopy de={de} />
          </div>
        </div>
      </Variant>

      <Variant n="B" title="Drei Bilder, ein Abend"
        note="Kreuzblende alle 6,5 Sekunden zwischen drei Aufnahmen derselben Session. Das funktioniert nur, weil Schiefer, Horizont, Licht und Kamerahöhe identisch sind: es liest sich als derselbe Ort aus drei Blickwinkeln, nicht als Slideshow. Bei drei zusammengewürfelten Motiven wäre genau das der Grund, es nicht zu tun. Bei reduzierter Bewegung bleibt das erste Bild stehen."
      >
        <Rotating de={de} />
      </Variant>

      <Variant n="C" title="Dunkel, aber näher am Material"
        note="Falls der dunkle Weg bleiben soll: die Makroaufnahme der aufgefächerten Kette ist deutlich stärker als das aktuelle Hintergrundbild, weil sie eine Struktur zeigt statt einer Fläche. Der Kompromiss bleibt: das Bild erzählt nichts über die Herkunft."
      >
        <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: '62vh', background: 'var(--hero-stage)' }}>
          <Shot slug="macro" alt={de ? 'Aufgefächerte Kette auf Schiefer' : 'Chain fanned out on slate'} />
          <div aria-hidden className="absolute inset-0"
            style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)' }} />
          <div className="relative flex items-center px-8 sm:px-14 py-20" style={{ minHeight: '62vh' }}>
            <HeroCopy de={de} />
          </div>
        </div>
      </Variant>

      <section className="py-14" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <h2 className="font-display font-bold text-wx-tx1 mb-4" style={{ fontSize: '1.4rem' }}>Meine Empfehlung</h2>
          <p className="text-[15px] leading-relaxed max-w-[70ch]" style={{ color: 'var(--txm)' }}>
            Variante B. Der Hero ist die einzige Stelle, an der Bewegung etwas verdient, weil sie
            dort nicht vom Lesen ablenkt, und drei Bilder aus einem Abend geben der Marke einen Ort,
            den kein Wettbewerber hat. Wenn dir das zu unruhig ist, nimm A mit demselben Bild als
            Standbild: der Gewinn gegenüber heute liegt ohnehin im Motiv, nicht in der Bewegung.
          </p>
          <p className="text-[13px] leading-relaxed max-w-[70ch] mt-4" style={{ color: 'var(--txff)' }}>
            Technisch: nur das erste Bild lädt eager, die anderen beiden lazy, alle als WebP in drei
            Größen, zusammen unter 900 KB. Bei reduzierter Bewegung läuft keine Blende.
          </p>
        </div>
      </section>

      <footer className={`${W} py-12`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </Link>
      </footer>
    </div>
  );
}
