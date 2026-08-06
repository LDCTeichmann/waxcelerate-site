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
    <Link ref={ref} to="/wissenschaft"
      className="group grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 sm:gap-10 items-center mt-6 sm:mt-8 py-7 transition-[padding] duration-500 hover:pl-3"
      style={{ borderTop: '1px solid var(--bd2)', borderBottom: '1px solid var(--bd2)' }}>

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
