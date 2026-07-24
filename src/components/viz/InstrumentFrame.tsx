import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion, EASE, DUR } from '@/hooks/useAnimation';

// ─── InstrumentFrame — the site's one "instrument panel" container ───────────
// Theme-aware surface with dot grid + corner registration ticks, fades/tilts in
// on scroll (skipped under reduced motion). Shared by why-wax + science page.
// variant 'panel': theme-aware surface · 'lab': forced-dark cinematic panel.
export function InstrumentFrame({
  eyebrow,
  chip,
  footer,
  variant = 'panel',
  noReveal = false,
  children,
  className = '',
  innerRef,
}: {
  eyebrow?: string;
  chip?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'panel' | 'lab';
  noReveal?: boolean;            // skip the scroll-in (e.g. inside a modal that doesn't scroll the page)
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lab = variant === 'lab';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (noReveal || prefersReducedMotion()) { gsap.set(el, { opacity: 1 }); return; }
    gsap.set(el, { opacity: 0, y: 28, rotateX: 9, transformPerspective: 700, transformOrigin: '50% 0%' });
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 87%', once: true,
      onEnter: () => gsap.to(el, {
        opacity: 1, y: 0, rotateX: 0, duration: DUR.long, ease: EASE.enter,
        onStart()    { el.style.willChange = 'transform, opacity'; },
        onComplete() { el.style.willChange = 'auto'; el.style.transform = ''; },
      }),
    });
    return () => trigger.kill();
  }, []);

  const tick = lab ? 'rgba(130,170,240,0.32)' : 'rgba(var(--accent-rgb),0.25)';

  return (
    <div
      ref={ref}
      className={`relative w-full rounded-2xl overflow-hidden grain ${className}`}
      style={lab
        ? { background: 'var(--hero-stage)', border: '1px solid rgba(var(--accent-soft-rgb),0.25)' }
        : { background: 'var(--sf2)', border: '1px solid var(--bd)' }}
    >
      {/* Dot grid */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: lab
          ? 'radial-gradient(circle, rgba(130,170,240,0.10) 1px, transparent 1px)'
          : 'radial-gradient(circle, rgba(var(--accent-rgb),0.10) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {/* Corner registration ticks */}
      {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
        <div key={c} aria-hidden className="absolute w-2.5 h-2.5 pointer-events-none" style={{
          top:    c[0] === 't' ? 7 : undefined,
          bottom: c[0] === 'b' ? 7 : undefined,
          left:   c[1] === 'l' ? 7 : undefined,
          right:  c[1] === 'r' ? 7 : undefined,
          borderTop:    c[0] === 't' ? `1px solid ${tick}` : undefined,
          borderBottom: c[0] === 'b' ? `1px solid ${tick}` : undefined,
          borderLeft:   c[1] === 'l' ? `1px solid ${tick}` : undefined,
          borderRight:  c[1] === 'r' ? `1px solid ${tick}` : undefined,
        }} />
      ))}
      <div ref={innerRef} className="relative p-5">
        {(eyebrow || chip) && (
          <div className="flex items-center justify-between gap-3 mb-4">
            {eyebrow && (
              <p className="text-[11px] uppercase tracking-[0.24em] font-medium"
                style={{ color: lab ? 'rgba(150,185,245,0.78)' : 'var(--accent-soft)' }}>
                {eyebrow}
              </p>
            )}
            {chip && (
              <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md flex-shrink-0"
                style={{
                  background: lab ? 'rgba(var(--accent-soft-rgb),0.16)' : 'var(--accent-wash)',
                  border: lab ? '1px solid rgba(var(--accent-soft-rgb),0.30)' : '1px solid rgba(var(--accent-rgb),0.16)',
                  color: lab ? '#9CC2FF' : 'var(--accent)',
                }}>
                {chip}
              </span>
            )}
          </div>
        )}
        {children}
        {footer && (
          <div className="mt-4 pt-3.5" style={{ borderTop: lab ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--bd2)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
