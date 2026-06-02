import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const animatedRef  = useRef<boolean>(false);
  const pillRef      = useRef<HTMLDivElement>(null);
  const brandRef     = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const badgeRef     = useRef<HTMLDivElement>(null);
  const frostedRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animatedRef.current) return;
    const els = {
      pill:    pillRef.current,
      brand:   brandRef.current,
      content: contentRef.current,
      badge:   badgeRef.current,
      frosted: frostedRef.current,
    };
    if (Object.values(els).some(v => !v)) return;
    animatedRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(Object.values(els), { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    gsap.set(els.pill,    { opacity: 0, y: -14 });
    gsap.set(els.brand,   { opacity: 0, scale: 0.97, y: 16 });
    gsap.set(els.frosted, { opacity: 0 });
    gsap.set(els.content, { opacity: 0, y: 24 });
    gsap.set(els.badge,   { opacity: 0, scale: 0.86 });

    const tl = gsap.timeline({ delay: 0.08 });
    tl.to(els.frosted, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0);
    tl.to(els.brand,   { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 0.1);
    tl.to(els.pill,    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.3);
    tl.to(els.content, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.55);
    tl.to(els.badge,   { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, 1.0);
  }, []);

  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{
        height: '100dvh',
        background: '#07080A',
        // Override global !important h1 color rule for light mode
        '--tx1': '#F8F8F8',
        '--tx2': 'rgba(248,248,248,0.55)',
      } as React.CSSProperties}
    >

      {/* ── LAYER 0: Full-bleed photo ── */}
      <img
        src="/images/hero-chain-wax.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '62% 50%' }}
        fetchPriority="high"
      />

      {/* ── LAYER 1: Top scrim for nav readability ── */}
      <div
        className="absolute top-0 inset-x-0 pointer-events-none"
        style={{
          height: '200px',
          background: 'linear-gradient(to bottom, rgba(5,6,8,0.6) 0%, transparent 100%)',
        }}
      />

      {/* ── LAYER 2: Bottom fade into next section ── */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{
          height: '100px',
          background: 'linear-gradient(to top, #07080A 0%, transparent 100%)',
        }}
      />

      {/* ══════════════════════════════════════════
          DESKTOP — Iceland-style split composition
      ══════════════════════════════════════════ */}
      <div className="hidden lg:block absolute inset-0">

        {/* ── LAYER 3: Frosted glass LEFT panel ── */}
        {/* Sits behind the brand name, above the photo */}
        <div
          ref={frostedRef}
          className="absolute top-0 left-0 bottom-0"
          style={{
            width: '48%',
            backdropFilter: 'blur(36px) saturate(0.65) brightness(0.78)',
            WebkitBackdropFilter: 'blur(36px) saturate(0.65) brightness(0.78)',
            background: 'rgba(4,5,7,0.48)',
          }}
        />

        {/* Subtle right-edge gradient on left panel: bleeds into photo */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: '42%',
            width: '12%',
            background: 'linear-gradient(to right, rgba(4,5,7,0.22) 0%, transparent 100%)',
          }}
        />

        {/* Blue radial glow — top right of photo panel */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-60px',
            right: '-60px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,139,237,0.16) 0%, transparent 65%)',
          }}
        />

        {/* ── Eyebrow pill — top left ── */}
        <div
          ref={pillRef}
          className="absolute flex items-center gap-3"
          style={{ top: '108px', left: '72px' }}
        >
          <div style={{ width: '22px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <p
            className="text-[10px] uppercase tracking-[0.38em] font-semibold"
            style={{ color: 'rgba(255,255,255,0.26)' }}
          >
            {t.hero.subtitle}
          </p>
          <button
            onClick={() => scrollToSection('#ueber-mich')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer hover:opacity-75 transition-opacity"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.10)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: '#5B8BED' }}
            />
            <span
              className="text-[10px] tracking-wide"
              style={{ color: 'rgba(255,255,255,0.36)' }}
            >
              {de ? '171 × ★★★★★ auf eBay' : '171 × ★★★★★ on eBay'}
            </span>
          </button>
        </div>

        {/* ── Vertical brand stamp — far right ── */}
        <div
          className="absolute select-none pointer-events-none"
          aria-hidden="true"
          style={{
            right: '22px',
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            fontSize: '9px',
            letterSpacing: '0.46em',
            color: 'rgba(255,255,255,0.14)',
            textTransform: 'uppercase',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {de ? 'Premium Kettenwachs · seit 2022' : 'Premium Chain Wax · since 2022'}
        </div>

        {/* ══════════════════════════════════════
            THE BRAND NAME — visual centerpiece
            Spans full width, bridges both panels
            Iceland-pattern: text above the divide
        ══════════════════════════════════════ */}
        <div
          ref={brandRef}
          className="absolute inset-x-0 select-none pointer-events-none"
          style={{ top: '34%', transform: 'translateY(-50%)' }}
          aria-hidden="true"
        >
          <p
            className="font-display font-black uppercase text-center"
            style={{
              fontSize: 'clamp(5.5rem, 12vw, 16rem)',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 4px 80px rgba(0,0,0,0.25)',
            }}
          >
            WAXCELERATE
          </p>
        </div>

        {/* ══════════════════════════════
            Content block — lower left
            Lives inside the frosted panel
        ══════════════════════════════ */}
        <div
          ref={contentRef}
          className="absolute flex flex-col"
          style={{ bottom: '68px', left: '72px', width: '38%' }}
        >

          {/* Index marker (like Iceland's "01") */}
          <div className="flex items-center gap-4 mb-5">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.32em',
                color: 'rgba(255,255,255,0.20)',
              }}
            >
              01
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Sub-headline */}
          <p
            className="font-display font-bold leading-tight tracking-[-0.025em] mb-4"
            style={{
              fontSize: 'clamp(1.5rem, 2.4vw, 2.6rem)',
              color: '#F5F5F5',
            }}
          >
            {t.hero.headline}
          </p>

          {/* Tagline */}
          <p
            className="text-[14px] leading-relaxed mb-8"
            style={{ color: 'rgba(255,255,255,0.36)', maxWidth: '340px' }}
          >
            {t.hero.tagline}
          </p>

          {/* Stats row */}
          <div
            className="flex items-start gap-0 mb-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '22px' }}
          >
            {[
              { v: '3×',   l: de ? 'Kettenlaufzeit'     : 'Chain life'      },
              { v: '~€70', l: de ? 'gespart · 12.000km' : 'saved · 12k km'  },
              { v: '100%', l: de ? 'positiv auf eBay'   : 'positive on eBay' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  paddingRight: i < 2 ? '28px' : '0',
                  marginRight: i < 2 ? '8px' : '0',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}
              >
                <p
                  className="font-black tabular-nums leading-none"
                  style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: '#F5F5F5' }}
                >
                  {s.v}
                </p>
                <p
                  className="text-[10px] mt-1.5 leading-none"
                  style={{ color: 'rgba(255,255,255,0.22)' }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => scrollToSection('#produkte')}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[13px] font-bold rounded-full hover:opacity-90 transition-all active:scale-[0.97]"
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
                color: 'rgba(255,255,255,0.28)',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                textDecorationColor: 'rgba(255,255,255,0.12)',
              }}
            >
              {t.hero.ctaSecondary}
            </button>
          </div>

        </div>

        {/* ── Proof badge — floats over the PHOTO side ── */}
        <div
          ref={badgeRef}
          className="absolute"
          style={{
            right: '8%',
            bottom: '20%',
            background: 'rgba(5,6,8,0.76)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(91,139,237,0.20)',
            borderRadius: '20px',
            padding: '26px 34px',
            minWidth: '210px',
            boxShadow:
              '0 40px 80px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '2px',
              background: '#5B8BED',
              borderRadius: '2px',
              marginBottom: '14px',
            }}
          />
          <p
            className="font-serif-display italic leading-none"
            style={{
              fontSize: '46px',
              fontWeight: 700,
              color: '#5B8BED',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            ~€70
          </p>
          <p className="text-[12px] font-medium leading-none" style={{ color: 'rgba(255,255,255,0.50)' }}>
            {de ? 'gespart / 12.000 km' : 'saved / 12,000 km'}
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)', marginTop: '6px' }}>
            {de ? 'gegenüber Kettenöl' : 'vs. chain oil'}
          </p>
        </div>

      </div>

      {/* ══════════════════════════════
          MOBILE — full-bleed photo
          content anchored at bottom
      ══════════════════════════════ */}
      <div
        className="lg:hidden absolute inset-0 flex flex-col justify-end"
        style={{
          background:
            'linear-gradient(to top, rgba(5,6,8,0.97) 0%, rgba(5,6,8,0.75) 42%, rgba(5,6,8,0.20) 70%, transparent 100%)',
        }}
      >
        <div className="relative px-6 pb-12 pt-32">

          {/* Tiny brand stamp mobile */}
          <p
            className="font-display font-black uppercase mb-4 select-none"
            style={{
              fontSize: 'clamp(3.4rem, 13vw, 5rem)',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              color: 'rgba(255,255,255,0.90)',
            }}
          >
            WAXCE<br />LERATE
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: '18px', height: '1px', background: 'rgba(255,255,255,0.18)' }} />
            <p
              className="text-[10px] uppercase tracking-[0.32em] font-semibold"
              style={{ color: 'rgba(255,255,255,0.24)' }}
            >
              {t.hero.subtitle}
            </p>
          </div>

          <p
            className="font-display font-bold leading-tight tracking-[-0.02em] mb-4"
            style={{ fontSize: 'clamp(1.5rem, 6.5vw, 2rem)', color: '#F5F5F5' }}
          >
            {t.hero.headline}
          </p>

          <p
            className="text-[14px] leading-relaxed mb-6"
            style={{ color: 'rgba(255,255,255,0.36)' }}
          >
            {t.hero.tagline}
          </p>

          <div
            className="flex items-start gap-7 mb-7"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px' }}
          >
            {[
              { v: '3×',   l: de ? 'Kettenlaufzeit' : 'Chain life'    },
              { v: '~€70', l: de ? 'gespart/12k km' : 'saved/12k km'  },
              { v: '100%', l: de ? 'positiv eBay'   : 'positive eBay' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  paddingLeft: i > 0 ? '28px' : '0',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                <p className="text-[22px] font-black leading-none" style={{ color: '#F5F5F5' }}>
                  {s.v}
                </p>
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.24)' }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => scrollToSection('#produkte')}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-full"
              style={{ background: '#5B8BED', color: '#fff' }}
            >
              {t.hero.ctaBuy} <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollToSection('#warum-wachs')}
              className="text-sm cursor-pointer"
              style={{
                color: 'rgba(255,255,255,0.28)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {t.hero.ctaSecondary}
            </button>
          </div>

        </div>
      </div>

    </section>
  );
}
