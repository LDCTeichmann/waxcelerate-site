import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const animatedRef = useRef<boolean>(false);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const brandRef    = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const photoRef    = useRef<HTMLDivElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animatedRef.current) return;
    const els = {
      photo:   photoRef.current,
      eyebrow: eyebrowRef.current,
      brand:   brandRef.current,
      line:    lineRef.current,
      content: contentRef.current,
      badge:   badgeRef.current,
    };
    if (Object.values(els).some(v => !v)) return;
    animatedRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(Object.values(els), { opacity: 1, y: 0, x: 0, scaleX: 1, clipPath: 'none' });
      return;
    }

    gsap.set(els.photo,   { opacity: 0, x: 60 });
    gsap.set(els.eyebrow, { opacity: 0, y: -10 });
    gsap.set(els.brand,   { opacity: 0, y: 40 });
    gsap.set(els.line,    { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
    gsap.set(els.content, { opacity: 0, y: 24 });
    gsap.set(els.badge,   { opacity: 0, scale: 0.80 });

    const tl = gsap.timeline({ delay: 0.05 });
    tl.to(els.photo,   { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, 0);
    tl.to(els.eyebrow, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.2);
    tl.to(els.brand,   { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0.3);
    tl.to(els.line,    { scaleX: 1, opacity: 1, duration: 0.9, ease: 'power3.inOut' }, 0.55);
    tl.to(els.content, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.75);
    tl.to(els.badge,   { opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(1.5)' }, 1.1);
  }, []);

  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{
        height: '100dvh',
        background: '#05060A',
        '--tx1': '#F8F8F8',
      } as React.CSSProperties}
    >
      {/* Hidden h1 for SEO */}
      <h1 className="sr-only">Waxcelerate — Premium Heißwachs für Fahrradketten</h1>

      {/* ══════════════════════════════════════════════════
          PHOTO PANEL — diagonal cut, fills right portion
          The diagonal runs from ~30% at top to ~48% at bottom
          This gives the hero momentum / directionality
      ══════════════════════════════════════════════════ */}
      <div
        ref={photoRef}
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 45% 100%)',
        }}
      >
        <img
          src="/images/hero-chain-wax.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '52% 38%' }}
          fetchPriority="high"
        />
        {/* Left-edge fade — softens the diagonal cut */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(5,6,10,0.55) 0%, rgba(5,6,10,0.15) 22%, transparent 42%)',
          }}
        />
        {/* Subtle top-right corner darkening */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(5,6,10,0.35) 100%)',
          }}
        />
      </div>

      {/* Diagonal glow line — the cut edge */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '30%',
          width: '2px',
          height: '140%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(91,139,237,0.50) 25%, rgba(91,139,237,0.70) 50%, rgba(91,139,237,0.50) 75%, transparent 100%)',
          transformOrigin: 'top center',
          transform: 'rotate(8.5deg)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Blue glow at the diagonal intersection */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%',
          left: '26%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(91,139,237,0.14) 0%, transparent 65%)',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Top scrim — nav readability */}
      <div
        className="absolute top-0 inset-x-0 pointer-events-none"
        style={{
          height: '180px',
          background: 'linear-gradient(to bottom, rgba(5,6,10,0.55) 0%, transparent 100%)',
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(to top, #05060A 0%, transparent 100%)',
        }}
      />

      {/* ══════════════════════════════════════════════════
          DESKTOP CONTENT
      ══════════════════════════════════════════════════ */}
      <div className="hidden lg:block absolute inset-0">

        {/* ── Eyebrow — top left ── */}
        <div
          ref={eyebrowRef}
          className="absolute flex items-center gap-4"
          style={{ top: '108px', left: '72px' }}
        >
          <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.16)' }} />
          <span
            className="text-[10px] uppercase tracking-[0.40em] font-bold"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            {t.hero.subtitle}
          </span>
          <button
            onClick={() => scrollToSection('#ueber-mich')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              background: 'rgba(91,139,237,0.10)',
              borderColor: 'rgba(91,139,237,0.22)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#5B8BED' }} />
            <span className="text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {de ? '171 × ★★★★★ auf eBay' : '171 × ★★★★★ on eBay'}
            </span>
          </button>
        </div>

        {/* ── WAXCELERATE — spans the diagonal boundary ──
            Left portion: white on dark bg
            Right portion: white cuts across the photo
            = exact Iceland/INSIGHT technique              */}
        <div
          ref={brandRef}
          className="absolute"
          style={{ top: '24%', left: '72px', right: 0 }}
        >
          <p
            className="font-display font-black uppercase"
            style={{
              fontSize: 'clamp(5.5rem, 11.8vw, 16rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.88,
              color: 'rgba(245,245,248,0.95)',
              textShadow: '0 2px 60px rgba(0,0,0,0.30)',
              whiteSpace: 'nowrap',
            }}
            aria-hidden="true"
          >
            WAXCELERATE
          </p>

          {/* Tagline — directly under the brand, quiet */}
          <p
            className="text-[13px] mt-4 tracking-wide"
            style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em', maxWidth: '400px' }}
          >
            {t.hero.tagline}
          </p>
        </div>

        {/* ── No. label — top right stamp ── */}
        <div
          className="absolute select-none pointer-events-none"
          aria-hidden="true"
          style={{
            top: '110px',
            right: '72px',
            fontSize: '10px',
            letterSpacing: '0.30em',
            color: 'rgba(255,255,255,0.12)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          No.&nbsp;01
        </div>

        {/* Vertical brand stamp — far right */}
        <div
          className="absolute select-none pointer-events-none"
          aria-hidden="true"
          style={{
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            fontSize: '9px',
            letterSpacing: '0.44em',
            color: 'rgba(255,255,255,0.09)',
            textTransform: 'uppercase',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {de ? 'Premium Kettenwachs · seit 2022' : 'Premium Chain Wax · since 2022'}
        </div>

        {/* ── Horizontal divider ── */}
        <div
          ref={lineRef}
          className="absolute"
          style={{
            bottom: '216px',
            left: '72px',
            width: '36%',
            height: '1px',
            background: 'rgba(255,255,255,0.07)',
          }}
        />

        {/* ── CONTENT — bottom left, below diagonal ── */}
        <div
          ref={contentRef}
          className="absolute flex"
          style={{ bottom: '68px', left: '72px', right: '50%', gap: '48px', alignItems: 'flex-end' }}
        >
          {/* Left column: headline + tagline */}
          <div style={{ flex: '0 0 auto', maxWidth: '320px' }}>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.26em', color: 'rgba(255,255,255,0.18)' }}>
                01
              </span>
              <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.10)' }} />
            </div>
            <p
              className="font-display font-bold leading-tight tracking-[-0.025em] mb-1.5"
              style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2.6rem)', color: '#F0F0F4' }}
            >
              {t.hero.headline}
            </p>
            <p
              className="font-serif-display italic"
              style={{ fontSize: 'clamp(1.1rem, 1.8vw, 2rem)', color: '#5B8BED', letterSpacing: '-0.01em' }}
            >
              {t.hero.headlineSub}
            </p>
          </div>

          {/* Right column: stats + CTA */}
          <div style={{ flex: 1 }}>
            {/* Stats */}
            <div className="flex items-start mb-6" style={{ gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
              {[
                { v: '3×',   l: de ? 'Kettenlaufzeit'     : 'Chain life'      },
                { v: '~€70', l: de ? 'gespart · 12k km'   : 'saved · 12k km'  },
                { v: '100%', l: de ? 'positiv auf eBay'   : 'positive on eBay' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    paddingRight: i < 2 ? '22px' : '0',
                    paddingLeft:  i > 0 ? '22px' : '0',
                    borderLeft:   i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <p className="font-black tabular-nums leading-none" style={{ fontSize: 'clamp(15px, 1.7vw, 22px)', color: '#F0F0F4' }}>
                    {s.v}
                  </p>
                  <p className="text-[10px] mt-1.5 leading-none" style={{ color: 'rgba(255,255,255,0.20)' }}>
                    {s.l}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => scrollToSection('#produkte')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[13px] font-bold rounded-full hover:opacity-90 transition-all active:scale-[0.97]"
                style={{
                  background: '#5B8BED',
                  color: '#fff',
                  letterSpacing: '0.04em',
                  boxShadow: '0 0 36px rgba(91,139,237,0.28)',
                }}
              >
                {t.hero.ctaBuy}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => scrollToSection('#warum-wachs')}
                className="text-[12.5px] cursor-pointer hover:opacity-70 transition-opacity"
                style={{
                  color: 'rgba(255,255,255,0.24)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textDecorationColor: 'rgba(255,255,255,0.10)',
                }}
              >
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>
        </div>

        {/* ── Proof badge — sits at the diagonal cut, mid-height ── */}
        <div
          ref={badgeRef}
          className="absolute"
          style={{
            left: '27%',
            top: '54%',
            transform: 'translateY(-50%)',
            background: 'rgba(4,5,9,0.90)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(91,139,237,0.25)',
            borderRadius: '16px',
            padding: '20px 26px',
            minWidth: '178px',
            boxShadow: '0 28px 56px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ width: '22px', height: '2px', background: '#5B8BED', borderRadius: '2px', marginBottom: '11px' }} />
          <p
            className="font-serif-display italic leading-none"
            style={{ fontSize: '40px', fontWeight: 700, color: '#5B8BED', letterSpacing: '-0.02em', marginBottom: '7px' }}
          >
            ~€70
          </p>
          <p className="text-[11px] font-medium leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {de ? 'gespart / 12.000 km' : 'saved / 12,000 km'}
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)', marginTop: '5px' }}>
            {de ? 'gegenüber Kettenöl' : 'vs. chain oil'}
          </p>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE
      ══════════════════════════════════════════════════ */}
      <div
        className="lg:hidden absolute inset-0 flex flex-col justify-end"
        style={{
          background: 'linear-gradient(to top, rgba(5,6,10,0.97) 0%, rgba(5,6,10,0.75) 45%, rgba(5,6,10,0.15) 72%, transparent 100%)',
        }}
      >
        <div className="px-6 pb-12">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: '18px', height: '1px', background: 'rgba(255,255,255,0.16)' }} />
            <p className="text-[10px] uppercase tracking-[0.36em] font-bold" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {t.hero.subtitle}
            </p>
          </div>
          <p
            className="font-display font-black uppercase select-none mb-4"
            style={{
              fontSize: 'clamp(3.4rem, 13.5vw, 5rem)',
              letterSpacing: '-0.025em',
              lineHeight: 0.88,
              color: 'rgba(245,245,248,0.94)',
            }}
            aria-hidden="true"
          >
            WAX<br />CELERATE
          </p>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '20px' }} />
          <p className="font-display font-bold leading-tight tracking-[-0.02em] mb-1.5"
            style={{ fontSize: 'clamp(1.4rem, 6vw, 1.9rem)', color: '#F0F0F4' }}>
            {t.hero.headline}
          </p>
          <p className="font-serif-display italic mb-4"
            style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.5rem)', color: '#5B8BED' }}>
            {t.hero.headlineSub}
          </p>
          <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {t.hero.tagline}
          </p>
          <div className="flex items-start mb-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px', gap: '0' }}>
            {[
              { v: '3×',   l: de ? 'Kettenlaufzeit' : 'Chain life'    },
              { v: '~€70', l: de ? 'gespart/12k km' : 'saved/12k km'  },
              { v: '100%', l: de ? 'positiv eBay'   : 'positive eBay' },
            ].map((s, i) => (
              <div key={i}
                style={{
                  paddingRight: i < 2 ? '18px' : '0',
                  paddingLeft:  i > 0 ? '18px' : '0',
                  borderLeft:   i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                <p className="text-[20px] font-black leading-none" style={{ color: '#F0F0F4' }}>{s.v}</p>
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.22)' }}>{s.l}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollToSection('#produkte')}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-full"
              style={{ background: '#5B8BED', color: '#fff' }}>
              {t.hero.ctaBuy} <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollToSection('#warum-wachs')}
              className="text-sm cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.24)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {t.hero.ctaSecondary}
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
