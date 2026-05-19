import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';


// ── Easing constants (match CSS vars in index.css) ──────────────────────────
export const EASE = {
  ui:     'cubic-bezier(0.4, 0, 0.2, 1)',
  enter:  'power3.out',
  hero:   'power4.out',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const DUR = {
  micro:    0.12,
  fast:     0.20,
  short:    0.32,
  standard: 0.60,
  long:     0.80,
  counter:  1.80,
} as const;

// ── Reduced motion guard ─────────────────────────────────────────────────────
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Universal section header reveal ─────────────────────────────────────────
// Usage: place data-reveal="eyebrow" / "heading" / "subtitle" on children
export function useSectionReveal(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prefersReducedMotion()) {
      gsap.set(container.querySelectorAll('[data-reveal]'), { opacity: 1, y: 0 });
      return;
    }

    const eyebrow  = container.querySelector('[data-reveal="eyebrow"]');
    const heading  = container.querySelector('[data-reveal="heading"]');
    const subtitle = container.querySelector('[data-reveal="subtitle"]');

    const els = [eyebrow, heading, subtitle].filter(Boolean) as Element[];
    if (!els.length) return;

    // Set correct initial positions once, before trigger is created
    gsap.set(eyebrow, { opacity: 0, y: 14 });
    if (heading)  gsap.set(heading,  { opacity: 0, y: 24 });
    if (subtitle) gsap.set(subtitle, { opacity: 0, y: 14 });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(eyebrow, { opacity: 1, y: 0, duration: DUR.standard, ease: EASE.enter });
        if (heading)  gsap.to(heading,  { opacity: 1, y: 0, duration: DUR.long,     ease: EASE.hero,  delay: 0.09 });
        if (subtitle) gsap.to(subtitle, { opacity: 1, y: 0, duration: DUR.standard, ease: EASE.enter, delay: 0.20 });
      },
    });

    return () => { trigger.kill(); };
  }, [containerRef]);
}

// ── Scroll reveal for individual elements ───────────────────────────────────
export function useScrollReveal(
  ref: React.RefObject<HTMLElement | null>,
  opts: { y?: number; delay?: number; once?: boolean } = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) { gsap.set(el, { opacity: 1, y: 0 }); return; }

    gsap.set(el, { opacity: 0, y: opts.y ?? 24 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: opts.once ?? true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1, y: 0,
          duration: DUR.standard,
          ease: EASE.enter,
          delay: opts.delay ?? 0,
          onStart: () => { el.style.willChange = 'transform, opacity'; },
          onComplete: () => { el.style.willChange = 'auto'; },
        });
      },
    });

    return () => { trigger.kill(); };
  }, [ref, opts.y, opts.delay, opts.once]);
}

// ── 3D perspective reveal — staggered cards ──────────────────────────────────
// Apply to a container ref; all direct children with [data-card] get staggered
// rotateX entrance. Also works when passed a single element ref.
export function use3DReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  opts: { stagger?: number; delay?: number; start?: string } = {}
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prefersReducedMotion()) {
      gsap.set(container, { opacity: 1, rotateX: 0, y: 0 });
      return;
    }

    const targets = container.querySelectorAll<HTMLElement>('[data-card]');
    const els: HTMLElement[] = targets.length ? Array.from(targets) : [container];

    gsap.set(els, { opacity: 0, y: 32, rotateX: 9, transformPerspective: 700, transformOrigin: '50% 0%' });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: opts.start ?? 'top 87%',
      once: true,
      onEnter: () => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: DUR.long,
          ease: EASE.enter,
          stagger: opts.stagger ?? 0.10,
          delay: opts.delay ?? 0,
          onStart() { els.forEach(e => { e.style.willChange = 'transform, opacity'; }); },
          onComplete() { els.forEach(e => { e.style.willChange = 'auto'; e.style.transform = ''; }); },
        });
      },
    });

    return () => { trigger.kill(); };
  }, [containerRef, opts.stagger, opts.delay, opts.start]);
}
