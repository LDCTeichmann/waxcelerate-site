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

  useEffect(() => {
    if (animatedRef.current) return;
    const els = {
      eyebrow: eyebrowRef.current,
      brand:   brandRef.current,
      content: contentRef.current,
      badge:   badgeRef.current,
    };
    if (Object.values(els).some(v => !v)) return;
    animatedRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(Object.values(els), { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(els.eyebrow, { opacity: 0, y: -14 });
    gsap.set(els.brand,   { opacity: 0, y: 28 });
    gsap.set(els.content, { opacity: 0, y: 22 });
    gsap.set(els.badge,   { opacity: 0, scale: 0.84 });

    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(els.eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
    tl.to(els.brand,   { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0.12);
    tl.to(els.content, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.55);
    tl.to(els.badge,   { opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(1.4)' }, 0.95);
  }, []);

  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{
        height: '100dvh',
        background: '#06070A',
        '--tx1': '#F8F8F8',
      } as React.CSSProperties}
    >
      {/* SEO heading */}
      <h1 className="sr-only">Waxcelerate — Premium Heißwachs für Fahrradketten</h1>

      {/* Full-bleed photo */}
      <img
        src="/images/hero-chain-wax.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '58% 35%' }}
        fetchPriority="high"
      />

      {/* Left dark arm — keeps text readable without harsh cuts */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(100deg, rgba(5,6,10,0.96) 0%, rgba(5,6,10,0.88) 22%, rgba(5,6,10,0.55) 42%, rgba(5,6,10,0.12) 58%, transparent 70%)',
        }}
      />
      {/* Bottom dark arm — content zone */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(5,6,10,0.97) 0%, rgba(5,6,10,0.70) 22%, rgba(5,6,10,0.25) 44%, transparent 60%)',
        }}
      />
      {/* Top scrim */}
      <div
        className="absolute top-0 inset-x-0 pointer-events-none"
        style={{
          height: '180px',
          background: 'linear-gradient(to bottom, rgba(5,6,10,0.60) 0%, transparent 100%)',
        }}
      />

      {/* ══════════════════════ DESKTOP ══════════════════════ */}
      <div className="hidden lg:block absolute inset-0">

        {/* Eyebrow */}
        <div
          ref={eyebrowRef}
          className="absolute flex items-center gap-3"
          style={{ top: '104px', left: '76px' }}
        >
          <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.18)' }} />
          <span
            className="text-[10px] uppercase tracking-[0.42em] font-bold"
            style={{ color: 'rgba(255,255,255,0.24)' }}
          >
            {t.hero.subtitle}
          </span>
          <button
            onClick={() => scrollToSection('#ueber-mich')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: 'rgba(91,139,237,0.09)', borderColor: 'rgba(91,139,237,0.22)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#5B8BED' }} />
            <span className="text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {de ? '171 × ★★★★★ auf eBay' : '171 × ★★★★★ on eBay'}
            </span>
          </button>
        </div>

        {/* Brand name — large, top-left, crosses into photo */}
        <div
          ref={brandRef}
          className="absolute"
          style={{ top: '142px', left: '76px' }}
        >
          <p
            className="font-display font-black uppercase"
            style={{
              fontSize: 'clamp(5.5rem, 10.8vw, 15rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.9,
              color: 'rgba(248,248,252,0.95)',
              whiteSpace: 'nowrap',
              textShadow: '0 2px 48px rgba(0,0,0,0.22)',
            }}
            aria-hidden="true"
          >
            WAXCELERATE
          </p>
        </div>

        {/* No. stamp */}
        <div
          className="absolute select-none pointer-events-none"
          aria-hidden="true"
          style={{
            top: '108px',
            right: '76px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.30em',
            color: 'rgba(255,255,255,0.11)',
            textTransform: 'uppercase',
          }}
        >
          No.&nbsp;01
        </div>

        {/* Vertical stamp */}
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

        {/* Content block — bottom left */}
        <div
          ref={contentRef}
          className="absolute"
          style={{ bottom: '64px', left: '76px', width: '46%' }}
        >
          <div className="flex items-center gap-4 mb-5">
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.26em', color: 'rgba(255,255,255,0.18)' }}>
              01
            </span>
            <div style={{ width: '36px', height: '1px', background: 'rgba(255,255,255,0.10)' }} />
          </div>

          <p
            className="font-display font-bold leading-tight tracking-[-0.025em] mb-1"
            style={{ fontSize: 'clamp(1.55rem, 2.4vw, 3rem)', color: '#F0F0F6' }}
          >
            {t.hero.headline}
          </p>
          <p
            className="font-serif-display italic mb-5"
            style={{ fontSize: 'clamp(1.2rem, 1.9vw, 2.2rem)', color: '#5B8BED', letterSpacing: '-0.01em' }}
          >
            {t.hero.headlineSub}
          </p>

          <p
            className="text-[13.5px] leading-relaxed mb-7"
            style={{ color: 'rgba(255,255,255,0.30)', maxWidth: '380px' }}
          >
            {t.hero.tagline}
          </p>

          <div
            className="flex items-start mb-7"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px', gap: 0 }}
          >
            {[
              { v: '3×',   l: de ? 'Kettenlaufzeit'   : 'Chain life'      },
              { v: '~€70', l: de ? 'gespart · 12k km' : 'saved · 12k km'  },
              { v: '100%', l: de ? 'positiv auf eBay' : 'positive on eBay' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  paddingRight: i < 2 ? '24px' : 0,
                  paddingLeft:  i > 0 ? '24px' : 0,
                  borderLeft:   i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}
              >
                <p className="font-black tabular-nums leading-none" style={{ fontSize: 'clamp(16px, 1.8vw, 24px)', color: '#F0F0F6' }}>
                  {s.v}
                </p>
                <p className="text-[11px] mt-1.5 leading-none" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => scrollToSection('#produkte')}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[13px] font-bold rounded-full hover:opacity-90 transition-all active:scale-[0.97]"
              style={{
                background: '#5B8BED',
                color: '#fff',
                letterSpacing: '0.04em',
                boxShadow: '0 0 36px rgba(91,139,237,0.25)',
              }}
            >
              {t.hero.ctaBuy}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollToSection('#warum-wachs')}
              className="text-[12.5px] cursor-pointer hover:opacity-70 transition-opacity"
              style={{
                color: 'rgba(255,255,255,0.26)',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                textDecorationColor: 'rgba(255,255,255,0.10)',
              }}
            >
              {t.hero.ctaSecondary}
            </button>
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {t.hero.priceAnchor}
          </p>
        </div>

        {/* Proof badge — bottom right, clearly over the photo */}
        <div
          ref={badgeRef}
          className="absolute"
          style={{
            right: '7%',
            bottom: '10%',
            background: 'rgba(4,5,9,0.86)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(91,139,237,0.20)',
            borderRadius: '18px',
            padding: '22px 30px',
            minWidth: '186px',
            boxShadow:
              '0 32px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ width: '22px', height: '2px', background: '#5B8BED', borderRadius: '2px', marginBottom: '12px' }} />
          <p
            className="font-serif-display italic leading-none"
            style={{ fontSize: '42px', fontWeight: 700, color: '#5B8BED', letterSpacing: '-0.02em', marginBottom: '8px' }}
          >
            ~€70
          </p>
          <p className="text-[11px] font-medium leading-none" style={{ color: 'rgba(255,255,255,0.44)' }}>
            {de ? 'gespart / 12.000 km' : 'saved / 12,000 km'}
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)', marginTop: '5px' }}>
            {de ? 'gegenüber Kettenöl' : 'vs. chain oil'}
          </p>
        </div>

      </div>

      {/* ══════════════════════ MOBILE ══════════════════════ */}
      <div
        className="lg:hidden absolute inset-0 flex flex-col justify-end"
        style={{
          background:
            'linear-gradient(to top, rgba(5,6,10,0.97) 0%, rgba(5,6,10,0.75) 40%, rgba(5,6,10,0.20) 68%, transparent 100%)',
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
            style={{ fontSize: 'clamp(3.6rem, 14vw, 5.2rem)', letterSpacing: '-0.025em', lineHeight: 0.88, color: 'rgba(248,248,252,0.94)' }}
            aria-hidden="true"
          >
            WAX<br />CELERATE
          </p>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '20px' }} />
          <p className="font-display font-bold leading-tight tracking-[-0.02em] mb-1"
            style={{ fontSize: 'clamp(1.4rem, 6vw, 1.9rem)', color: '#F0F0F6' }}>
            {t.hero.headline}
          </p>
          <p className="font-serif-display italic mb-5"
            style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.5rem)', color: '#5B8BED' }}>
            {t.hero.headlineSub}
          </p>
          <div className="flex items-start mb-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px', gap: 0 }}>
            {[
              { v: '3×',   l: de ? 'Kettenlaufzeit' : 'Chain life'    },
              { v: '~€70', l: de ? 'gespart/12k km' : 'saved/12k km'  },
              { v: '100%', l: de ? 'positiv eBay'   : 'positive eBay' },
            ].map((s, i) => (
              <div key={i}
                style={{
                  paddingRight: i < 2 ? '18px' : 0,
                  paddingLeft:  i > 0 ? '18px' : 0,
                  borderLeft:   i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                <p className="text-[20px] font-black leading-none" style={{ color: '#F0F0F6' }}>{s.v}</p>
                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.l}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => scrollToSection('#produkte')}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-full"
              style={{ background: '#5B8BED', color: '#fff' }}>
              {t.hero.ctaBuy} <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => scrollToSection('#warum-wachs')}
              className="text-sm cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.26)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {t.hero.ctaSecondary}
            </button>
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {t.hero.priceAnchor}
          </p>
        </div>
      </div>

    </section>
  );
}
