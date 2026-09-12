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
    // Kein aria-label mehr. Es lautete "Zur Wissenschaftsseite: Kontaktzonen,
    // Formel, Mikroskopie" und hat damit den gesamten sichtbaren Inhalt der
    // Karte ueberschrieben — Screenreader bekamen statt der Ueberschrift
    // "Reibung entsteht an genau drei Flaechen." nur diese kurze Zeile, und
    // weil der sichtbare Text im Namen fehlte, fiel die Karte zugleich durch
    // WCAG 2.5.3 (Label in Name; Lighthouse: label-content-name-mismatch).
    // Ohne aria-label bildet der eigene Inhalt den zugaenglichen Namen: er ist
    // laenger, aber inhaltlich richtig und deckt sich mit dem Sichtbaren.
    <Link ref={ref} to="/wissenschaft"
      className="group grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 sm:gap-10 items-center
                 mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl
                 transition-[transform,border-color,box-shadow] duration-300
                 hover:-translate-y-1 focus-visible:outline-offset-4"
      // --card-bg (nahezu weiss) statt --sf2 (#F1F1F1): ein Mittelgrau-Feld
      // hinter der duennen Strichzeichnung benennt das Auge als beige/ocker
      // (DESIGN.md §1, Ursache 4). Weiss liest eindeutig als weiss, und die
      // Karte traegt sich wie die Geschwister-Karten in why-wax ueber Kante +
      // Schatten. Klick-Signatur wie die Produktkacheln: Rahmen faerbt sich,
      // Schatten hebt ab, Karte steigt.
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--bd)',
        boxShadow: 'var(--card-shad)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent-soft)';
        e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--bd)';
        e.currentTarget.style.boxShadow = 'var(--card-shad)';
      }}
    >

      <div>
        <p className="eyebrow" style={{ color: 'var(--txf)' }}>
          {de ? 'Die Wissenschaft dahinter' : 'The science behind it'}
        </p>
        <h3 className="font-display font-bold text-wx-tx1 mt-2.5 leading-[1.12] tracking-[-0.02em]
                       decoration-1 underline-offset-4 group-hover:underline"
          style={{ fontSize: 'clamp(1.35rem, 2.7vw, 1.9rem)', textDecorationColor: 'var(--accent-soft)' }}>
          {de ? 'Reibung entsteht an genau drei Flächen.' : 'Friction happens at exactly three surfaces.'}
        </h3>

        {/* Als sichtbares Button-Element statt als blosse Textzeile mit Pfeil —
            die Karte fuehrt woanders hin, das darf man sehen. */}
        <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold mt-6 px-3.5 py-2 rounded-full
                         transition-colors duration-300"
          style={{
            color: 'var(--accent)',
            border: '1px solid rgba(var(--accent-rgb),0.30)',
            background: 'var(--accent-wash)',
          }}>
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
          <span className="num font-semibold" style={{ color: 'var(--tx1)' }}>{zone.n}</span>
          <span style={{ color: 'var(--txff)' }}>·</span>
          {de ? zone.de : zone.en}
        </p>
      </div>
    </Link>
  );
}
