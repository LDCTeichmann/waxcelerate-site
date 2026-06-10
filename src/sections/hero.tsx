import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Hero — „Proven Performance", Poster-Edition.
 * Editorial-Poster-Regie: kolossales vertikales WAXCELERATE am rechten Rand,
 * dessen Lettern mit dem Silber-Ketten-Makro gefüllt sind (background-clip:text)
 * — die Wortmarke ist buchstäblich aus Kettenstahl geschnitten. Dazu: maskierter
 * Headline-Reveal, nummerierte Spec-Einträge mit gezeichneten Hairlines,
 * Scroll-Parallax auf der Wortmarke, Pointer-Tiefe auf dem Bild (Desktop).
 * Alles einmal getriggert oder scroll-gebunden — kein Loop, kein Glow.
 */
export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const rootRef  = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);   // Pointer-Parallax (translate)
  const imgRef   = useRef<HTMLDivElement>(null);   // Settle (scale)
  const wordWrap = useRef<HTMLDivElement>(null);   // Scroll-Parallax (yPercent)
  const wordRef  = useRef<HTMLSpanElement>(null);  // Entrance (opacity)
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    if (!root) return;
    animated.current = true;

    const items = root.querySelectorAll<HTMLElement>('[data-hero]');
    const mask  = root.querySelector<HTMLElement>('[data-hero-mask]');
    const lines = root.querySelectorAll<HTMLElement>('[data-hero-line]');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0 });
      if (mask) gsap.set(mask, { yPercent: 0 });
      gsap.set(lines, { scaleX: 1 });
      if (imgRef.current) gsap.set(imgRef.current, { scale: 1 });
      if (wordRef.current) gsap.set(wordRef.current, { opacity: 1 });
      return;
    }

    // Bei feinem Pointer leicht überskaliert lassen → Spielraum für Tiefen-Parallax.
    const settleScale = finePointer ? 1.045 : 1;

    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'power3.out' } });

    // Cineastischer Bild-Settle — langsam, schwer, kein Tech-Demo.
    if (imgRef.current) {
      tl.fromTo(imgRef.current, { scale: 1.1 }, { scale: settleScale, duration: 2.4, ease: 'power2.out' }, 0);
    }
    // Maskierter Headline-Reveal — die Zeile steigt aus ihrer eigenen Grundlinie.
    if (mask) {
      tl.fromTo(mask, { yPercent: 110 }, { yPercent: 0, duration: 1.15, ease: 'power4.out' }, 0.25);
    }
    // Stahl-Wortmarke — taucht ruhig auf, kein Effekt-Feuerwerk.
    if (wordRef.current) {
      tl.fromTo(wordRef.current, { opacity: 0 }, { opacity: 1, duration: 1.7, ease: 'power2.out' }, 0.4);
    }
    tl.fromTo(items, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.95, stagger: 0.11 }, 0.45);
    // Hairlines der nummerierten Specs zeichnen sich von links.
    tl.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.09 }, 0.85);

    // Scroll-Parallax: die Wortmarke gleitet langsam mit dem Scroll nach oben.
    let st: ScrollTrigger | undefined;
    if (wordWrap.current) {
      st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        animation: gsap.fromTo(wordWrap.current, { yPercent: 0 }, { yPercent: -9, ease: 'none' }),
      });
    }

    // Pointer-Tiefe: das Makro folgt der Maus um wenige Pixel — ruhig gedämpft.
    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer && stageRef.current) {
      const qx = gsap.quickTo(stageRef.current, 'x', { duration: 0.9, ease: 'power3.out' });
      const qy = gsap.quickTo(stageRef.current, 'y', { duration: 0.9, ease: 'power3.out' });
      onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width - 0.5) * -14);
        qy(((e.clientY - r.top) / r.height - 0.5) * -10);
      };
      root.addEventListener('mousemove', onMove);
    }

    return () => {
      if (onMove) root.removeEventListener('mousemove', onMove);
      st?.kill();
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
      className="relative overflow-hidden grain"
      style={{
        height: '100dvh',
        background: '#08080A',
        ['--tx1' as string]: '#F7F7F8',
      } as React.CSSProperties}
    >
      {/* Bühne: Pointer-Parallax-Wrapper → Settle-Layer → dunkles Graphit-Makro */}
      <div ref={stageRef} className="absolute inset-0 will-change-transform">
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

      {/* Kolossale vertikale Wortmarke — Lettern aus dem Silber-Ketten-Makro geschnitten.
          Liest von unten nach oben (Poster-Regie), gleitet mit dem Scroll. */}
      <div
        ref={wordWrap}
        aria-hidden
        className="absolute inset-y-0 right-0 z-[6] hidden lg:flex items-center justify-center pointer-events-none select-none will-change-transform"
        style={{ width: 'clamp(6.5rem, 13vh, 11.5rem)', marginRight: 'clamp(0rem, 1.4vw, 1.75rem)' }}
      >
        <span
          ref={wordRef}
          className="whitespace-nowrap"
          style={{
            transform: 'rotate(-90deg)',
            fontFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontSize: 'min(8.8vh, 8rem)',
            letterSpacing: '0.04em',
            lineHeight: 1,
            backgroundImage: 'url(/images/hero-silver.webp)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.10)',
            filter: 'brightness(1.32) contrast(1.05) drop-shadow(0 0 28px rgba(0,0,0,0.5))',
          }}
        >
          Waxcelerate
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="h-full max-w-7xl mx-auto flex flex-col justify-center">
          <div className="max-w-3xl pb-28 sm:pb-24">

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

            {/* Emotionaler Hook — großes Fraunces-Italic, maskierter Zeilen-Reveal */}
            <div className="overflow-hidden" style={{ paddingBottom: '0.08em' }}>
              <h1
                data-hero-mask
                className="font-display italic text-white will-change-transform"
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
            </div>

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

      {/* Spec-Ribbon — nummerierte Editorial-Einträge (Poster-Regie):
          ⓝ + gezeichnete Hairline, darunter Wert + Label. */}
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
