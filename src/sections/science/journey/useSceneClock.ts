import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/hooks/useAnimation';

/**
 * Laufzeit in Sekunden fuer eine Nano-Szene. Tickt nur, solange
 *  - die Szene aktiv ist (die Karte ihres Stoffs ist dran),
 *  - ihr Element im Bild ist (IntersectionObserver),
 *  - der Tab sichtbar ist.
 * Sonst steht die Uhr — auf einem schwachen Rechner laeuft nie mehr als eine
 * Szene gleichzeitig, und keine im Hintergrund. Bei prefers-reduced-motion
 * kommt ein fester Zeitpunkt zurueck (`still`), an dem die Szene ihren
 * aussagekraeftigsten Zustand zeigt.
 */
export function useSceneClock(active: boolean, still: number) {
  const reduce = prefersReducedMotion();
  const [t, setT] = useState(reduce ? still : 0);
  const ref = useRef<SVGSVGElement>(null);
  const seen = useRef(false);

  useEffect(() => {
    if (reduce || !active) return;
    const el = ref.current;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      // Große Spruenge (Tab war weg) nicht nachholen.
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      setT(acc);
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting; if (e.isIntersecting && !document.hidden) start(); else stop(); });
    if (el) io.observe(el);
    const vis = () => { if (document.hidden) stop(); else if (seen.current) start(); };
    document.addEventListener('visibilitychange', vis);
    return () => { stop(); io.disconnect(); document.removeEventListener('visibilitychange', vis); };
  }, [active, reduce]);

  return { t, ref };
}
