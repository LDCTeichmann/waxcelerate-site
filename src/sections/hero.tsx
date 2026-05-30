import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import gsap from 'gsap';

// Split text into word spans for clip-mask reveal
// NOTE: space must live OUTSIDE the overflow-hidden wrapper, otherwise it gets clipped
function WordReveal({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(' ');
  return (
    <span className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline' }}>
          <span
            className="inline-block overflow-hidden leading-[1.15]"
            style={{ verticalAlign: 'bottom' }}
          >
            <span className="word-inner inline-block" style={{ willChange: 'transform' }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'noir';
  const animatedRef = useRef<boolean>(false);
  const pillRef     = useRef<HTMLDivElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const taglineRef  = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

  useEffect(() => {
    if (animatedRef.current) return;

    const el = {
      pill:    pillRef.current,
      head:    headRef.current,
      tagline: taglineRef.current,
      cta:     ctaRef.current,
    };
    if (Object.values(el).some(v => !v)) return;

    animatedRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(Object.values(el), { opacity: 1, y: 0 });
      if (el.head) {
        el.head.querySelectorAll<HTMLElement>('.word-inner').forEach(w => {
          w.style.transform = 'translateY(0)';
        });
      }
      return;
    }

    gsap.set([el.pill, el.tagline, el.cta], { opacity: 0, y: 18 });
    if (el.head) {
      el.head.querySelectorAll<HTMLElement>('.word-inner').forEach(w => {
        w.style.transform = 'translateY(110%)';
      });
    }

    const tl = gsap.timeline({ delay: 0.08 });
    tl.to(el.pill,    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0);
    if (el.head) {
      const words = el.head.querySelectorAll<HTMLElement>('.word-inner');
      tl.to(words, { y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.055 }, 0.18);
    }
    tl.to(el.tagline, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.52);
    tl.to(el.cta,     { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out' }, 0.64);
  }, []);


  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const headline    = t.hero.headline;
  const headlineSub = t.hero.headlineSub;

  return (
    <section
      id="home"
      className="grain relative overflow-hidden"
      style={{ minHeight: '100dvh', background: isDark ? '#0A0A0A' : 'transparent', contain: 'paint' }}
    >

      {/* ── Background image — full width on both layouts ── */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/DSC01455.JPG"
          alt=""
          width={1366}
          height={912}
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '60% 72%' }}
        />
        {isDark ? (
          /* Dark mode: strong left-to-right fade + bottom vignette */
          <>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0A0A0A 0%, rgba(10,10,10,0.75) 25%, rgba(10,10,10,0.25) 55%, transparent 75%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.20) 0%, transparent 15%, transparent 72%, rgba(10,10,10,0.92) 100%)' }} />
          </>
        ) : (
          /* Light mode: very subtle bottom vignette only — let the photo breathe */
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 20%, transparent 75%, rgba(245,245,247,0.5) 100%)' }} />
        )}
      </div>

      {/* Mobile: extra scrim for text readability over full-bleed image */}
      <div className="lg:hidden absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(to right, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.50) 60%, rgba(10,10,10,0.20) 100%)'
              : 'linear-gradient(to right, rgba(245,245,247,0.82) 0%, rgba(245,245,247,0.50) 60%, rgba(245,245,247,0.10) 100%)',
          }}
        />
      </div>

      {/* Dark mode accent glow */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 55% 60% at 27% 48%, rgba(26,60,110,0.09) 0%, transparent 65%)',
          }}
        />
      )}

      {/* Grid texture removed */}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-[100dvh]">

        {/*
          Text block:
          - Mobile: full-width, centered
          - Desktop: left 52%, left-aligned, vertically centered
        */}
        <div
          className="w-full lg:w-[52%] flex flex-col items-center lg:items-start justify-center px-6 sm:px-10 lg:pl-16 xl:pl-24 lg:pr-10 pt-24 pb-16"
          style={!isDark ? {
            background: 'linear-gradient(to right, rgba(245,245,247,0.88) 0%, rgba(245,245,247,0.60) 70%, transparent 100%)',
          } : undefined}
        >
          <div className="max-w-lg w-full mx-auto lg:mx-0 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Pill — social proof */}
            <div ref={pillRef} className="mb-9">
              <button
                onClick={() => scrollToSection('#ueber-mich')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0 animate-pulse"
                  style={{ background: '#2B52B0' }}
                />
                <span className="text-[12px] tracking-wide" style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'var(--tx2)' }}>
                  {de
                    ? '171 Bewertungen · 100 % positiv auf eBay'
                    : '171 reviews · 100 % positive on eBay'}
                </span>
                <ArrowRight className="h-3 w-3 flex-shrink-0" style={{ color: '#2B52B0' }} />
              </button>
            </div>

            <p
              className="text-[11px] uppercase tracking-[0.28em] font-semibold mb-4"
              style={{ color: 'var(--txf)' }}
            >
              {t.hero.subtitle}
            </p>

            {/* Headline */}
            <div ref={headRef} className="mb-6">
              <h1
                className="font-display font-bold leading-[1.05] tracking-[-0.035em]"
                style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.2rem)', color: isDark ? '#FFFFFF' : 'var(--tx1)' }}
              >
                <WordReveal text={headline} className="block" />
                <span
                  className="block font-serif-display italic overflow-hidden"
                  style={{ color: '#5B8BED', verticalAlign: 'bottom' }}
                >
                  <span className="word-inner inline-block" style={{ willChange: 'transform' }}>
                    {headlineSub}
                  </span>
                </span>
              </h1>
            </div>

            {/* Tagline */}
            <p
              ref={taglineRef}
              className="text-[17px] leading-relaxed mb-9 max-w-xs sm:max-w-sm"
              style={{ color: isDark ? 'rgba(255,255,255,0.78)' : 'var(--tx2)' }}
            >
              {t.hero.tagline}
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                <button
                  onClick={() => scrollToSection('#produkte')}
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-full transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: isDark ? '#EDE9E0' : 'var(--cta-bg)', color: isDark ? '#0A0A0A' : 'var(--cta-fg)' }}
                >
                  {t.hero.ctaBuy}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.50)' : 'var(--txm)' }}>
                  {t.hero.priceAnchor}
                </span>
              </div>
              <button
                onClick={() => scrollToSection('#warum-wachs')}
                className="text-sm cursor-pointer"
                style={{ color: isDark ? 'rgba(255,255,255,0.82)' : 'var(--tx2)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                {t.hero.ctaSecondary}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: isDark ? 'linear-gradient(to top, #0A0A0A 0%, transparent 100%)' : 'none' }}
      />
    </section>
  );
}
