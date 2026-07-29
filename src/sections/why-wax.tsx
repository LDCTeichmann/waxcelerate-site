import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { CountUp } from '@/components/viz/CountUp';
import { WhatChanges } from '@/sections/WhatChanges';
import { ScienceTeaser } from '@/sections/science/ScienceTeaser';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { waxVsOil } from '@/lib/data';
import { Section } from '@/components/Section';

// Three cards, not four. Chain life used to sit here as "3×", but the hero
// already counts that number up on arrival and the products subtitle says it a
// third time. A figure repeated three times on one page does not get bigger, it
// gets cheaper. The hero owns the outcome numbers; this row owns the
// measurements that explain them, and the benefit lines below own the everyday
// consequences. One statement per surface.
function buildCards(de: boolean) {
  const f = waxVsOil.friction, w = waxVsOil.watts;
  return [
    {
      value: `μ ${f.wax.toFixed(2)}`,
      label: de ? 'Reibung' : 'Friction',
      detail: de ? `${Math.round(f.oil / f.wax)}× weniger als Öl` : `${Math.round(f.oil / f.wax)}× less than oil`,
    },
    {
      value: `${w.wax[0]}–${w.wax[1]} W`,
      label: de ? 'Antriebsverlust' : 'Drivetrain loss',
      detail: de ? `Öl: ${w.oil[0]}–${w.oil[1]} W` : `Oil: ${w.oil[0]}–${w.oil[1]} W`,
    },
    {
      value: de ? 'Trocken' : 'Dry',
      label: de ? 'Sauberkeit' : 'Cleanliness',
      detail: de ? 'Kein Dreck, keine Flecken' : 'No grime, no stains',
    },
  ];
}

export function WhyWax() {
  const { lang }   = useLanguage();
  const de         = lang === 'de';
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  useSectionReveal(headerRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('[data-card]');
      if (cards?.length) {
        gsap.fromTo(cards,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', once: true } });
      }
      const bars = cardsRef.current?.querySelectorAll('[data-bar]');
      if (bars?.length) {
        gsap.fromTo(bars,
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'center center', duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', once: true } });
      }
      const items = benefitsRef.current?.querySelectorAll('[data-benefit]');
      if (items?.length) {
        gsap.fromTo(items,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: benefitsRef.current, start: 'top 88%', once: true } });
      }
    }, section);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  const cards = buildCards(de);

  return (
    <Section id="warum-wachs" ref={sectionRef} className="bg-wx-sf">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      {/* ── Header ── */}
      <div ref={headerRef} className="mb-14 sm:mb-16">
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={de ? 'Messbar besser.' : 'Measurably better.'} />
            </h2>
            <p data-reveal="subtitle" className="hidden sm:block text-wx-txm max-w-xl text-[15px] leading-relaxed">
              {de
                ? 'Derselbe Antrieb, zwei Schmierstoffe — Seite an Seite gemessen.'
                : 'Same drivetrain, two lubricants — measured side by side.'}
            </p>
          </div>

          {/* ── Stat cards — 2×2 grid — measurement-card language shared with
              the science page (CountUp figure, centered accent tick, no
              icons) instead of the icon+progress-bar pattern used before. ── */}
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((c, i) => (
              <div key={i} data-card
                className="rounded-2xl px-4 py-5 sm:py-6 flex flex-col items-center text-center"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
                <CountUp value={c.value}
                  className="font-display font-bold leading-none tracking-[-0.02em] block"
                  style={{ fontSize: 'clamp(1.5rem, 4.2vw, 1.875rem)', color: 'var(--tx1)' }} />
                <div data-bar className="h-0.5 w-8 mt-3.5 mb-2.5 rounded-full"
                  style={{ background: 'var(--accent)', opacity: 0.5, transformOrigin: 'center' }} />
                <span className="text-[11px] uppercase tracking-[0.14em] font-medium"
                  style={{ color: 'var(--txm)' }}>
                  {c.label}
                </span>
                <span className="text-[11px] mt-1" style={{ color: 'var(--txf)' }}>
                  {c.detail}
                </span>
              </div>
            ))}
          </div>

          {/* ── What changes ──
              Was a chart plus four benefit tiles. Both were asking a cold
              visitor to decode something before getting anything back. Three
              rows, one statement each, photograph where the photograph is the
              argument. See WhatChanges.tsx for the reasoning. */}
          <div ref={benefitsRef}>
            <WhatChanges de={de} />
          </div>

          {/* ── Door into the science page ──
              Was a flat card describing the page. Now it starts the argument
              and stops one line short, which is the reason to click. */}
          <ScienceTeaser de={de} />

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </Section>
  );
}
