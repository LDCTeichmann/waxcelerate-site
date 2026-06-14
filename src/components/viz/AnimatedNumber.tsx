import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';

// ─── Animated number ticker — tweens between values on change ─────────────────
// Shared by the Wax⇄Oil toggle (why-wax) and the tool calculators (tools.tsx).
// Respects reduced motion: snaps instantly with no tween.
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    const to = value;
    prev.current = to;
    if (from === to) return;

    const write = (v: number) => {
      el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
    };

    if (prefersReducedMotion()) { write(to); return; }

    tweenRef.current?.kill();
    const counter = { val: from };
    tweenRef.current = gsap.to(counter, {
      val: to,
      duration: 0.42,
      ease: 'power2.out',
      onUpdate: () => write(counter.val),
    });
  }, [value, prefix, suffix, decimals]);

  const fmt = value.toFixed(decimals);
  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{fmt}{suffix}
    </span>
  );
}
