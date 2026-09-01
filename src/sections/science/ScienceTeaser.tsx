// ─── ScienceTeaser — the homepage door into /wissenschaft ────────────────────
// Deliberately one sentence, one drawing, one number. The earlier version listed
// all three zones and explained them, which meant a reader could finish the
// argument on the homepage and had no reason to click. This one shows the joint
// cycling through its three sliding surfaces without naming them.
//
// 08/2026: die Zeichnung (ChainWaxMap in `compact` mode) und die Zahl ("40.280
// Losbrech-Vorgänge pro Minute", aus dem separaten Breakaway-Rechner in
// ContactZones.tsx) erzaehlten zwei unabhaengige Geschichten nebeneinander —
// Lucas Feedback: weder war das Bild ueberzeugend genug, um zum Klicken zu
// animieren, noch passte die Zahl zu dem, was das Bild zeigt.
//
// 08/2026, zweiter Durchgang: der erste Fix ersetzte die Zahl durch das
// Zonenkuerzel, liess das Bild dabei aber auf `hidden sm:block` stehen — auf
// dem Handy (Lucas eigentliches Testgeraet) blieb dadurch nur ein Textblock
// ohne jedes Bild uebrig, plus ein zweizeiliges Label ("… / gerade im Fokus"),
// das er zu Recht als seltsam formatiert zurueckmeldete. Beides behoben:
// das Bild ist jetzt auf JEDER Breite sichtbar (kein `hidden` mehr — im
// eher einspaltigen `grid` unterhalb `sm:` faellt es einfach unter den Text),
// und statt eines separaten Zahlenblocks in der Textspalte traegt das Bild
// jetzt seine eigene, einzeilige Live-Bildunterschrift ("Zone 01 · Bolzen ↔
// Kragen", ein pulsierender Punkt statt zweier gestapelter Zeilen) direkt
// darunter — Bild und Beschriftung liegen jetzt auch raeumlich beieinander,
// nicht mehr auseinandergerissen in zwei Spalten. Die `teaser`-Prop auf
// ChainWaxMap (Seitenansicht/Beschriftungen ausgeblendet, kraeftigeres Blau +
// Glow auf der aktiven Flaeche) bleibt unveraendert.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { ChainWaxMap } from '@/sections/science/ChainWaxMap';

// Reihenfolge deckt sich mit ChainWaxMap's `active`-Index (0 = Bolzen/Kragen ·
// 1 = Rolle/Kragen · 2 = Laschen) und inhaltlich mit `ZONES` in ContactZones.tsx
// — hier bewusst dupliziert statt importiert, um die beiden Komponenten
// entkoppelt zu halten (nur drei kurze Strings).
const ZONE_LABELS = [
  { n: '01', de: 'Bolzen ↔ Kragen', en: 'Pin ↔ collar' },
  { n: '02', de: 'Rolle ↔ Kragen', en: 'Roller ↔ collar' },
  { n: '03', de: 'Lasche ↔ Lasche', en: 'Plate ↔ plate' },
];

export function ScienceTeaser({ de }: { de: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let interval = 0;
    const t = ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        interval = window.setInterval(() => setActive(a => (a + 1) % 3), 2800);
      },
    });
    return () => { t.kill(); clearInterval(interval); };
  }, []);

  const zone = ZONE_LABELS[active];

  return (
    // Als Karte, nicht als Zeile zwischen zwei Haarlinien.
    // Vorher war das hier ein Link, dessen einzige Auszeichnung zwei
    // Trennlinien und ein leichtes Einruecken beim Hovern waren — auf einer
    // Seite, die ohnehin ueberall mit Haarlinien arbeitet, ist das kein
    // Klickhinweis, sondern sieht aus wie der naechste Absatz. Lucas
    // Rueckmeldung: man versteht nicht, dass das eine Karte ist, die man
    // anklicken soll. Jetzt eigene Flaeche, Rahmen, Radius und ein sichtbarer
    // Hover-Zustand (Rahmen faerbt sich, Karte hebt sich leicht) — also die
    // gleichen Signale, die die Produktkarten auf derselben Seite benutzen.
    <Link ref={ref} to="/wissenschaft"
      aria-label={de ? 'Zur Wissenschaftsseite: Kontaktzonen, Formel, Mikroskopie' : 'To the science page: contact zones, formula, microscopy'}
      className="group grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 sm:gap-10 items-center
                 mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl
                 transition-[transform,border-color,box-shadow] duration-300
                 hover:-translate-y-0.5"
      // --sf2 statt --card-bg: --card-bg ist ein Verlauf, der bei Weiss
      // beginnt, und diese Sektion steht selbst auf Weiss (bg-wx-sf) — die
      // Karte haette also oben exakt die Farbe des Untergrunds gehabt und
      // haenge allein an Rahmen und Schatten. --sf2 (#F1F1F1) gibt ihr eine
      // eigene Flaeche, die man auch ohne Rahmen als Karte liest.
      style={{
        background: 'var(--sf2)',
        border: '1px solid var(--bd)',
        boxShadow: 'var(--card-shad)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.45)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; }}
    >

      <div>
        <p className="eyebrow" style={{ color: 'var(--txf)' }}>
          {de ? 'Die Wissenschaft dahinter' : 'The science behind it'}
        </p>
        <h3 className="font-display font-bold text-wx-tx1 mt-2.5 leading-[1.12] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(1.35rem, 2.7vw, 1.9rem)' }}>
          {de ? 'Reibung entsteht an genau drei Flächen.' : 'Friction happens at exactly three surfaces.'}
        </h3>

        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold mt-6"
          style={{ color: 'var(--tx1)' }}>
          {de ? 'Kontaktzonen, Formel, Mikroskopie' : 'Contact zones, formula, microscopy'}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: 'var(--accent-soft)' }} />
        </span>
      </div>

      {/* Bild + Live-Beschriftung als eine Einheit: die Zeile darunter nennt
          exakt die Flaeche, die im Bild gerade glueht — kein separater
          Zahlenblock mehr in der Textspalte, der auf Mobile ohnehin ohne Bild
          danebenstand. */}
      <div>
        <div aria-hidden>
          <ChainWaxMap de={de} active={active} teaser />
        </div>
        <p className="flex items-center gap-2 mt-3 text-small" style={{ color: 'var(--txm)' }}>
          <span aria-hidden className="inline-block rounded-full flex-shrink-0"
            style={{ width: 6, height: 6, background: 'var(--accent)', boxShadow: '0 0 6px rgba(var(--accent-rgb),0.8)' }} />
          <span className="num-data font-semibold" style={{ color: 'var(--tx1)' }}>{zone.n}</span>
          <span style={{ color: 'var(--txff)' }}>·</span>
          {de ? zone.de : zone.en}
        </p>
      </div>
    </Link>
  );
}
