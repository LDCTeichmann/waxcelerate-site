import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

/**
 * Hero — Engineered Editorial.
 * One clean composition: a value-led headline over a light waxed-chain macro,
 * a single primary CTA, an inline trust strip, and a spec ribbon at the foot.
 * No frosted panel, no giant wordmark, no glow, no infinite particle loops.
 */
export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const rootRef  = useRef<HTMLElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    if (!root) return;
    animated.current = true;

    const items = root.querySelectorAll<HTMLElement>('[data-hero]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    gsap.set(items, { opacity: 0, y: 22 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.12,
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
        background: '#0A0A0B',
        ['--tx1' as string]: '#F7F7F8',
      } as React.CSSProperties}
    >
      {/* Full-bleed dark chain-texture macro — material, präzise, ruhig.
          Optimiert: 66 KB webp / 146 KB jpg (aus 5,5 MB Original). */}
      <picture>
        <source srcSet="/images/hero-texture.webp" type="image/webp" />
        <img
          src="/images/hero-texture.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 48%' }}
          fetchPriority="high"
        />
      </picture>

      {/* Scrims — left-weighted for legibility, no blue glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.70) 42%, rgba(8,8,10,0.36) 72%, rgba(8,8,10,0.12) 100%)',
        }}
      />
      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(8,8,10,0.65), transparent)' }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-44 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0A0A0B 0%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="h-full max-w-7xl mx-auto flex flex-col justify-center">
          <div className="max-w-2xl pb-20 sm:pb-16">

            {/* Eyebrow */}
            <div data-hero className="flex items-center gap-3 mb-6">
              <span style={{ width: '26px', height: '2px', background: 'var(--brand-blue)' }} />
              <p
                className="text-[10px] sm:text-[11px] uppercase font-semibold"
                style={{ letterSpacing: '0.34em', color: 'rgba(255,255,255,0.58)' }}
              >
                {t.hero.subtitle}
              </p>
            </div>

            {/* Poetic kicker (existing brand line) */}
            <p
              data-hero
              className="font-display italic mb-3"
              style={{ fontSize: 'clamp(1.05rem, 1.9vw, 1.5rem)', color: 'rgba(255,255,255,0.5)' }}
            >
              {t.hero.headline}
            </p>

            {/* Value-led headline */}
            <h1
              data-hero
              className="font-display font-black text-white mb-7"
              style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.5rem)', lineHeight: 1.03, letterSpacing: '-0.022em' }}
            >
              {t.hero.tagline}
            </h1>

            {/* Trust strip */}
            <div
              data-hero
              className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-9 text-[13px]"
              style={{ color: 'rgba(255,255,255,0.64)' }}
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
            <div data-hero className="flex items-center gap-5 flex-wrap">
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

      {/* Spec ribbon — engineered signature; single home for the 3 headline stats */}
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
