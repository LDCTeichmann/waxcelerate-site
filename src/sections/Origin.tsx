import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';

// The one dark full-bleed break in an otherwise all-light homepage (Luca's
// "dark moment in the middle" ask). Scoped to the wax only — "gegossen in
// Stuttgart" is true for what we make here, not for a Shimano/SRAM/YBN chain
// we only wax-treat (see v9ChainFooterNote in productContent.ts).
//
// Rebuilt from a boxed-thumbnail-beside-text layout with fade bands at the
// top/bottom edges after direct feedback that both read as cheap: the fades
// as a flat gradient band, the image as "just a rounded thing next to it".
// This version follows the pattern the homepage hero already uses for a dark
// photo section instead of inventing a new one — one continuous full-bleed
// photo with a directional scrim for text legibility, no separate framed
// image, no transition band at the section edges (a clean hard cut, the same
// way the hero itself simply starts).
//
// Deliberately NOT wrapped in the shared <Section> component: that component
// constrains everything to the max-w-7xl padded column, which is exactly
// right for text-only sections but is what forced the photo into a small
// boxed card here. This rebuilds the same outer padding/spacing by hand so
// the image can bleed edge to edge while the text stays in the same column
// every other section uses.
export function Origin() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // Only two stats, deliberately: "2024 · In Stuttgart gegründet" already
  // lives in the About section's own stat row (src/sections/about.tsx) — an
  // Origin section repeating it back is filler, not new information. These
  // two are the ones About doesn't already own.
  const stats = [
    { v: '80–90 °C', l: t.origin.stat1 },
    { v: t.origin.stat2v, l: t.origin.stat2 },
  ];

  return (
    <section id="herkunft" className="relative py-20 sm:py-32 overflow-hidden" style={{ background: '#0a0a0a' }}>
      <picture>
        <source
          srcSet="/images/origin/origin-stuttgart-800.webp 800w, /images/origin/origin-stuttgart.webp 1200w"
          sizes="100vw"
          type="image/webp"
        />
        <img
          src="/images/origin/origin-stuttgart.jpg"
          alt={de ? 'Waxcelerate Ketten und Verpackung mit Blick über Stuttgart' : 'Waxcelerate chains and packaging overlooking Stuttgart'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '75% 38%' }}
          loading="lazy"
          decoding="async"
        />
      </picture>

      {/* Directional scrim — heaviest under the text (left), easing off
          toward the photo's own detail (right), same technique as the hero's
          own scrim rather than a flat panel dropped over the whole image. */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(100deg, rgba(5,6,8,0.95) 0%, rgba(5,6,8,0.86) 30%, rgba(5,6,8,0.45) 58%, rgba(5,6,8,0.12) 100%)' }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none hero-grain" />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-20">
        <div ref={headerRef} className="max-w-lg">
          <p data-reveal="eyebrow" className="eyebrow mb-3" style={{ color: 'var(--brand-blue)' }}>
            {t.origin.eyebrow}
          </p>
          <h2
            data-reveal="heading"
            className="font-display font-bold leading-[1.1] text-white mb-5"
            style={{ fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            {t.origin.title1}
            <br />
            <em className="italic">{t.origin.title2}</em>
          </h2>
          <p data-reveal="subtitle" className="text-[15px] leading-[1.8] max-w-md" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {t.origin.body}
          </p>
          <div className="grid grid-cols-2 max-w-[280px] mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.16)' }}>
            {stats.map((s, i) => (
              <div key={s.l} className="pr-2" style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.16)' : 'none', paddingLeft: i > 0 ? '1rem' : 0 }}>
                <p className="font-display font-bold text-white tabular-nums" style={{ fontSize: 'clamp(16px, 2.2vw, 24px)' }}>
                  {s.v}
                </p>
                <p className="text-meta uppercase mt-1" style={{ letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
