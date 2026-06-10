import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

/**
 * Hero — „Proven Performance", aber mit Seele.
 * Cineastisch: lebendiges Ketten-Makro, großes ausdrucksstarkes Fraunces-Italic
 * als emotionaler Hook, ruhiger Image-Settle + gewichtetes Reveal, Vignette/Grain
 * für Stimmung. Ein einziger Produktblau-Akzent. Kein Glow, keine Loops.
 */
export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const rootRef  = useRef<HTMLElement>(null);
  const imgRef   = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    if (!root) return;
    animated.current = true;

    const items = root.querySelectorAll<HTMLElement>('[data-hero]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0 });
      if (imgRef.current) gsap.set(imgRef.current, { scale: 1 });
      return;
    }
    // Cineastischer Bild-Settle — langsam, schwer, kein Tech-Demo.
    if (imgRef.current) {
      gsap.fromTo(imgRef.current, { scale: 1.09 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
    }
    gsap.set(items, { opacity: 0, y: 30 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', stagger: 0.13, delay: 0.15,
    });
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
      className="relative overflow-hidden grain"
      style={{
        height: '100dvh',
        background: '#08080A',
        ['--tx1' as string]: '#F7F7F8',
      } as React.CSSProperties}
    >
      {/* Dunkles Graphit-Ketten-Makro mit langsamem Settle (66 KB webp / 146 KB jpg) */}
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        <picture>
          <source srcSet="/images/hero-texture.webp" type="image/webp" />
          <img
            src="/images/hero-texture.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 50%' }}
            fetchPriority="high"
          />
        </picture>
      </div>

      {/* Cineastische Gradation: Vignette + linker Scrim + Säume */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(125% 120% at 32% 36%, transparent 28%, rgba(5,5,7,0.60) 100%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,7,9,0.93) 0%, rgba(7,7,9,0.72) 40%, rgba(7,7,9,0.34) 72%, rgba(7,7,9,0.10) 100%)',
        }}
      />
      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(7,7,9,0.6), transparent)' }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-44 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #08080A 0%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="h-full max-w-7xl mx-auto flex flex-col justify-center">
          <div className="max-w-3xl pb-24 sm:pb-20">

            {/* Eyebrow — der einzige Produktblau-Akzent */}
            <div data-hero className="flex items-center gap-3 mb-7">
              <span style={{ width: '30px', height: '2px', background: 'var(--brand-blue)' }} />
              <p
                className="text-[10px] sm:text-[11px] uppercase font-semibold"
                style={{ letterSpacing: '0.36em', color: 'rgba(255,255,255,0.6)' }}
              >
                {t.hero.subtitle}
              </p>
            </div>

            {/* Emotionaler Hook — großes Fraunces-Italic */}
            <h1
              data-hero
              className="font-display italic text-white"
              style={{
                fontSize: 'clamp(2.9rem, 7.2vw, 6rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.02em',
                fontWeight: 700,
                fontVariationSettings: '"opsz" 120, "wght" 700, "SOFT" 40, "WONK" 1',
                textShadow: '0 6px 60px rgba(0,0,0,0.45)',
              }}
            >
              {t.hero.headline}
            </h1>

            {/* Konkreter Nutzen — ruhige Stütze */}
            <p
              data-hero
              className="mt-6 max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.0625rem)', color: 'rgba(255,255,255,0.72)' }}
            >
              {t.hero.tagline}
            </p>

            {/* Trust-Zeile */}
            <div
              data-hero
              className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <span style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '0.05em' }}>★★★★★</span>
                <span className="tabular-nums">171</span>
              </span>
              <span className="h-3 w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
              <span>{de ? '100% positiv' : '100% positive'}</span>
              <span className="h-3 w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
              <span>{de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}</span>
            </div>

            {/* CTAs */}
            <div data-hero className="mt-9 flex items-center gap-5 flex-wrap">
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
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textDecorationColor: 'rgba(255,255,255,0.22)',
                }}
              >
                {t.hero.ctaSecondary}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Spec-Ribbon — engineering signature, Heimat der drei Headline-Stats */}
      <div data-hero className="absolute bottom-0 inset-x-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div
            className="grid grid-cols-3 py-4 sm:py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="px-1 sm:px-4"
                style={{
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.10)' : 'none',
                  paddingLeft: i > 0 ? '16px' : '0',
                }}
              >
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
