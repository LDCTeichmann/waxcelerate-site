import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Hero — „Editorial Monument" mit echter Produktfotografie.
 * Full-bleed: das reale Wachsblock-Foto auf Schiefer (mit Pflanze) trägt die
 * rechte Bühne; links die ruhige dunkle Negativfläche für Typo. Darüber das
 * kolossale, kinetisch enthüllte WAXCELERATE als typografische Wirbelsäule.
 * Echtes Bild, echtes Material — kein 3D, kein Fake. Bild-Settle + Parallax,
 * Letter-für-Letter-Reveal, maskierte Headline, sich zeichnende Hairlines.
 * Alles einmal getriggert oder scroll-gebunden — kein Loop, kein Glow.
 */

const BRAND = 'WAXCELERATE'.split('');

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const rootRef  = useRef<HTMLElement>(null);
  const imgRef   = useRef<HTMLDivElement>(null);
  const wordRef  = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    if (!root) return;
    animated.current = true;

    const letters = root.querySelectorAll<HTMLElement>('[data-letter]');
    const masks   = root.querySelectorAll<HTMLElement>('[data-hero-mask]');
    const items   = root.querySelectorAll<HTMLElement>('[data-hero]');
    const lines   = root.querySelectorAll<HTMLElement>('[data-hero-line]');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduced) {
      gsap.set(letters, { yPercent: 0 });
      gsap.set(masks, { yPercent: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(lines, { scaleX: 1 });
      if (imgRef.current) gsap.set(imgRef.current, { scale: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'power4.out' } });

    // Cineastischer Bild-Settle — langsam, schwer.
    if (imgRef.current) {
      tl.fromTo(imgRef.current, { scale: 1.12 }, { scale: 1.04, duration: 2.4, ease: 'power2.out' }, 0);
    }
    // Kinetische Wortmarke: jeder Letter steigt maskiert aus der Grundlinie.
    tl.fromTo(letters, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: { each: 0.04 } }, 0.2);
    // Headline-Zeilen + Stütztext steigen maskiert nach.
    tl.fromTo(masks, { yPercent: 115 }, { yPercent: 0, duration: 1.05, stagger: 0.1 }, 0.55);
    tl.fromTo(items, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09 }, 0.7);
    tl.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.09 }, 1.0);

    // Scroll: Bild driftet sanft, die Wortmarke atmet leicht auseinander.
    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(
        ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }),
      );
    if (imgRef.current) scrub(gsap.to(imgRef.current, { yPercent: 8, ease: 'none' }));
    if (letters.length) {
      const mid = (letters.length - 1) / 2;
      scrub(gsap.to(letters, { x: (i: number) => (i - mid) * 6, ease: 'none' }));
    }

    // Cursor-Tiefe: das Bild folgt der Maus um wenige Pixel.
    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer && imgRef.current) {
      const qx = gsap.quickTo(imgRef.current, 'x', { duration: 1.0, ease: 'power3.out' });
      const qy = gsap.quickTo(imgRef.current, 'y', { duration: 1.0, ease: 'power3.out' });
      onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width - 0.5) * -16);
        qy(((e.clientY - r.top) / r.height - 0.5) * -10);
      };
      root.addEventListener('mousemove', onMove);
    }

    return () => {
      if (onMove) root.removeEventListener('mousemove', onMove);
      triggers.forEach((s) => s.kill());
    };
  }, []);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const stats = [
    { v: '3×',   l: de ? 'Kettenlaufzeit'      : 'chain life'        },
    { v: '~€70', l: de ? 'gespart · 12.000 km' : 'saved · 12,000 km' },
    { v: '−46%', l: de ? 'Kosten vs. Öl'       : 'cost vs. oil'      },
  ];

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative overflow-hidden min-h-[100dvh] lg:h-[100dvh]"
      style={{
        background: '#0A0B0D',
        ['--tx1' as string]: '#F7F7F8',
      } as React.CSSProperties}
    >
      {/* Echtes Produktfoto: Wachsblock auf Schiefer mit Pflanze — full-bleed */}
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        <picture>
          <source srcSet="/images/hero-wax.webp" type="image/webp" />
          <img
            src="/images/hero-wax.jpg"
            alt={de ? 'Waxcelerate Heißwachs-Block auf Schiefer' : 'Waxcelerate hot wax block on slate'}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '68% 50%' }}
            fetchPriority="high"
          />
        </picture>
      </div>

      {/* Gradation: linker Scrim für Typo-Legibilität + Säume oben/unten */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,9,11,0.94) 0%, rgba(8,9,11,0.82) 34%, rgba(8,9,11,0.42) 64%, rgba(8,9,11,0.12) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 120% at 28% 40%, transparent 36%, rgba(6,7,9,0.55) 100%)' }}
      />
      <div
        className="absolute top-0 inset-x-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(8,9,11,0.7), transparent)' }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0A0B0D 0%, transparent 100%)' }}
      />

      {/* Kinetische Monument-Wortmarke — quer über die obere Bühne, Stahl-Verlauf */}
      <div
        ref={wordRef}
        aria-hidden
        className="absolute left-0 right-0 top-[15%] z-[2] hidden lg:flex justify-center pointer-events-none select-none px-4"
      >
        <div
          className="whitespace-nowrap will-change-transform"
          style={{
            fontFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.4rem, 9.6vw, 9rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.012em',
          }}
        >
          {BRAND.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.05em' }}>
              <span
                data-letter
                className="inline-block will-change-transform"
                style={{
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(226,232,240,0.55) 52%, rgba(174,185,198,0.32) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {ch}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Content — links, über der dunklen Negativfläche */}
      <div className="relative z-10 min-h-[100dvh] lg:h-full w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="min-h-[100dvh] lg:h-full max-w-7xl mx-auto flex flex-col justify-center lg:justify-end pt-24 pb-28 lg:pt-0 lg:pb-28">
          <div className="max-w-xl">

            {/* Eyebrow — der einzige Produktblau-Akzent */}
            <div data-hero className="flex items-center gap-3 mb-6">
              <span style={{ width: '30px', height: '2px', background: 'var(--brand-blue)' }} />
              <p
                className="text-[10px] sm:text-[11px] uppercase font-semibold"
                style={{ letterSpacing: '0.36em', color: 'rgba(255,255,255,0.6)' }}
              >
                {t.hero.subtitle}
              </p>
            </div>

            {/* Headline — Fraunces, maskierte Zeilen */}
            <h1
              className="font-display text-white"
              style={{
                fontSize: 'clamp(2.4rem, 4.8vw, 4.3rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.025em',
                fontWeight: 600,
                fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
              }}
            >
              <span className="block overflow-hidden" style={{ paddingBottom: '0.05em' }}>
                <span data-hero-mask className="block will-change-transform">{t.hero.headline}</span>
              </span>
              <span className="block overflow-hidden" style={{ paddingBottom: '0.08em' }}>
                <span
                  data-hero-mask
                  className="block italic will-change-transform"
                  style={{ fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 30, "WONK" 0' }}
                >
                  {t.hero.headlineSub}
                </span>
              </span>
            </h1>

            {/* Konkreter Nutzen */}
            <p
              data-hero
              className="mt-6 max-w-md leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.72)' }}
            >
              {t.hero.tagline}
            </p>

            {/* CTAs */}
            <div data-hero className="mt-8 flex items-center gap-5 flex-wrap">
              <button
                onClick={() => scrollTo('#produkte')}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[14px] font-bold rounded-full transition-all active:scale-[0.98]"
                style={{ background: '#FFFFFF', color: '#0F0F12' }}
              >
                {t.hero.ctaBuy}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollTo('#warum-wachs')}
                className="text-[13px] transition-opacity hover:opacity-80"
                style={{
                  color: 'rgba(255,255,255,0.62)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textDecorationColor: 'rgba(255,255,255,0.24)',
                }}
              >
                {t.hero.ctaSecondary}
              </button>
            </div>

            {/* Trust — eine ruhige Mikro-Zeile */}
            <p
              data-hero
              className="mt-7 text-[12px] uppercase tabular-nums"
              style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.82)' }}>★★★★★</span>
              {'  171 · '}
              {de ? '100 % positiv' : '100% positive'}
              {' · '}
              {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}
            </p>
          </div>
        </div>
      </div>

      {/* Spec-Ribbon — nummerierte Editorial-Einträge */}
      <div data-hero className="absolute bottom-0 inset-x-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div
            className="grid grid-cols-3 gap-x-5 sm:gap-x-8 py-4 sm:py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
          >
            {stats.map((s, i) => (
              <div key={i}>
                <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                  <span
                    className="inline-flex items-center justify-center flex-shrink-0 rounded-full tabular-nums"
                    style={{
                      width: '21px',
                      height: '21px',
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'rgba(255,255,255,0.72)',
                      border: '1px solid rgba(255,255,255,0.28)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    data-hero-line
                    className="h-px flex-1 origin-left"
                    style={{ background: 'rgba(255,255,255,0.16)' }}
                  />
                </div>
                <p
                  className="font-display font-bold tabular-nums text-white leading-none"
                  style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.7rem)' }}
                >
                  {s.v}
                </p>
                <p
                  className="text-[10px] sm:text-[11px] uppercase mt-1.5"
                  style={{ letterSpacing: '0.06em', color: 'rgba(255,255,255,0.46)' }}
                >
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
