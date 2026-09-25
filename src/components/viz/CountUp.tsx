import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';

// ─── CountUp — every number in the string counts 0 → target once, on scroll ──
// Locale-aware ('.' vs ','), decimal-preserving. Use sparingly — big moments only.
export function CountUp({ value, className, style, duration = 1.1 }: {
  value: string; className?: string; style?: React.CSSProperties; duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const NUM = /-?\d+(?:[.,]\d+)?/g;
    if (!NUM.test(value) || prefersReducedMotion()) { el.textContent = value; return; }
    const render = (p: number) =>
      value.replace(NUM, raw => {
        const target   = parseFloat(raw.replace(',', '.'));
        const decimals = (raw.split(/[.,]/)[1] ?? '').length;
        const sep      = raw.includes(',') ? ',' : '.';
        return (target * p).toFixed(decimals).replace('.', sep);
      });
    // Bis der Trigger feuert, steht der ECHTE Wert da, nicht "0". Vorher
    // wurde sofort auf 0 gesetzt; sprang man per Anker oder schnellem
    // Scrollen am Startpunkt vorbei, feuerte der Trigger nie und die Seite
    // zeigte dauerhaft "0–0 nm" / "0–0 MPa" (gesehen 25.09.2026 im Beweis).
    el.textContent = value;
    const proxy = { p: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.fromTo(proxy, { p: 0 }, {
        p: 1, duration, ease: 'power2.out',
        onUpdate()   { el.textContent = render(proxy.p); },
        onComplete() { el.textContent = value; },
      }),
    });
    return () => trigger.kill();
  }, [value, duration]);
  return <span ref={ref} className={`tabular-nums ${className ?? ''}`} style={style}>{value}</span>;
}
