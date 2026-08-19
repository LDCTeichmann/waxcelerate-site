// ─── ScienceTeaser — the homepage door into /wissenschaft ────────────────────
// Deliberately one sentence, one drawing, one number. The earlier version listed
// all three zones and explained them, which meant a reader could finish the
// argument on the homepage and had no reason to click. This one shows the joint
// cycling through its three sliding surfaces without naming them.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { ChainJointSection } from '@/sections/science/ChainJointSection';

const TARGET = 53 * 95 * 8; // 40 280 — derivation lives in ContactZones

export function ScienceTeaser({ de }: { de: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(prefersReducedMotion() ? TARGET : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0, interval = 0;
    const t = ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - t0) / 1300, 1);
          setCount(Math.round(TARGET * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        interval = window.setInterval(() => setActive(a => (a + 1) % 3), 2400);
      },
    });
    return () => { t.kill(); cancelAnimationFrame(raf); clearInterval(interval); };
  }, []);

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

        <div className="flex items-end gap-5 mt-6">
          <p className="num-data font-bold leading-none tabular-nums"
            style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.3rem)', letterSpacing: '-0.04em', color: 'var(--tx1)' }}>
            {count.toLocaleString(de ? 'de-DE' : 'en-US')}
          </p>
          <p className="text-small uppercase tracking-[0.13em] leading-relaxed pb-1" style={{ color: 'var(--txff)' }}>
            {de ? 'Losbrech-Vorgänge' : 'Breakaway events'}<br />
            {de ? 'pro Minute' : 'per minute'}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold mt-6"
          style={{ color: 'var(--tx1)' }}>
          {de ? 'Kontaktzonen, Formel, Mikroskopie' : 'Contact zones, formula, microscopy'}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: 'var(--accent-soft)' }} />
        </span>
      </div>

      <div className="hidden sm:block" aria-hidden>
        <ChainJointSection active={active} compact />
      </div>
    </Link>
  );
}
