import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { hubNumbers } from '../hubContent';
import { prefersReducedMotion } from './searchHelpers';

/**
 * "Die Zahlen": vier Kennzahlen als grosse Mono-Ziffern, jede ein Link auf die
 * Seite, die sie herleitet. Autoritaet ueber Messwerte statt Adjektive, wie
 * es Zero Friction Cycling vormacht. Die Werte blenden gestaffelt ein, sobald
 * der Streifen ins Bild kommt (bei reduzierter Bewegung sofort sichtbar).
 */
export function NumbersStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (visible || !ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <section aria-labelledby="zahlen-titel" className="mb-20">
      <div className="max-w-xl mb-8">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>
          Die Zahlen
        </p>
        <h2 id="zahlen-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1]">
          Was Wachs messbar ändert.
        </h2>
      </div>
      <div
        ref={ref}
        className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl overflow-hidden"
        style={{ border: '1px solid var(--bd)', background: 'var(--bd)', gap: '1px' }}
      >
        {hubNumbers.map((n, i) => (
          <Link
            key={n.value}
            to={n.to}
            className="group flex flex-col p-4 sm:p-6 transition-colors hover:bg-[color:var(--sf2)]"
            style={{
              background: 'var(--sf)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(12px)',
              transition: 'opacity 600ms ease, transform 600ms ease, background-color 200ms',
              transitionDelay: visible ? `${i * 110}ms, ${i * 110}ms, 0ms` : '0ms',
            }}
          >
            <span className="font-mono text-wx-tx1 leading-none mb-3" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>
              {n.value}
            </span>
            <span className="font-mono text-small uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--accent)' }}>
              {n.label}
            </span>
            <span className="text-[12.5px] sm:text-[13px] leading-[1.55] text-wx-txm mb-4 sm:mb-5">{n.note}</span>
            <span className="mt-auto text-[13px] font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--accent)' }}>
              {n.to === '/wissenschaft' ? 'Zur Messung →' : 'Herleitung lesen →'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
