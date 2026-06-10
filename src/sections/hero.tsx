import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const HeroBlock3D = lazy(() => import('./hero-block3d'));

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Hero — „Monolith".
 * Radikal reduziert: ein monumentales WAXCELERATE über die volle Breite
 * (Letter für Letter maskiert enthüllt, mit feinem Silber-Verlauf), davor
 * schwebt der echte freigestellte Wachsblock — tiefblau, MoS₂-Partikel
 * sichtbar, das Produkt als Objekt. Beim Scrollen atmet die Wortmarke
 * auseinander (Letter-Spread), der Block sinkt langsamer als die Seite
 * (Parallax) und dreht minimal. Cursor gibt dem Block Tiefe.
 * Alles einmal getriggert oder scroll-gebunden — kein Loop, kein Glow.
 */

const BRAND = 'WAXCELERATE'.split('');

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const rootRef  = useRef<HTMLElement>(null);
  const wordRef  = useRef<HTMLDivElement>(null);
  const cubeRef  = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  const [webgl] = useState(hasWebGL);
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

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
      if (cubeRef.current) gsap.set(cubeRef.current, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power4.out' } });

    // Kinetische Wortmarke: jeder Letter steigt maskiert aus der Grundlinie.
    tl.fromTo(
      letters,
      { yPercent: 108 },
      { yPercent: 0, duration: 1.15, stagger: { each: 0.042, from: 'start' } },
      0,
    );
    // Der Block blendet ein — die Bewegung selbst macht das 3D-Modell (Settle).
    if (cubeRef.current) {
      tl.fromTo(
        cubeRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.1, ease: 'power2.out' },
        0.55,
      );
    }
    tl.fromTo(masks, { yPercent: 112 }, { yPercent: 0, duration: 1.0, stagger: 0.1 }, 0.75);
    tl.fromTo(items, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09 }, 0.85);
    tl.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.09 }, 1.15);

    // Scroll: die Wortmarke atmet auseinander, der Block sinkt langsamer + dreht minimal.
    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(
        ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }),
      );
    if (letters.length) {
      const mid = (letters.length - 1) / 2;
      scrub(gsap.to(letters, { x: (i: number) => (i - mid) * 9, ease: 'none' }));
    }
    // Beim 3D-Block übernimmt das Modell Scroll-Drehung + Drift selbst.
    if (cubeRef.current && !hasWebGL()) {
      scrub(gsap.to(cubeRef.current, { y: 110, rotation: 5, ease: 'none' }));
    }
    if (wordRef.current) {
      scrub(gsap.to(wordRef.current, { yPercent: -6, ease: 'none' }));
    }

    // Cursor-Tiefe: der Block folgt der Maus, die Wortmarke hält leise dagegen.
    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer && wordRef.current) {
      const webglHere = hasWebGL();
      const cx = !webglHere && cubeRef.current
        ? gsap.quickTo(cubeRef.current, 'x', { duration: 1.0, ease: 'power3.out' })
        : undefined;
      const cy = !webglHere && cubeRef.current
        ? gsap.quickTo(cubeRef.current, 'y', { duration: 1.0, ease: 'power3.out' })
        : undefined;
      const wx = gsap.quickTo(wordRef.current, 'x', { duration: 1.2, ease: 'power3.out' });
      onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        cx?.(nx * -22);
        cy?.(ny * -14);
        wx(nx * 7);
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
        background: '#0B0C0E',
        ['--tx1' as string]: '#F7F7F8',
      } as React.CSSProperties}
    >
      {/* Schiefer-Bühne: das echte Material unter den Produktfotos — fast schwarz, taktil */}
      <div className="absolute inset-0 pointer-events-none">
        <picture>
          <source srcSet="/images/hero-slate.webp" type="image/webp" />
          <img
            src="/images/hero-slate.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          />
        </picture>
        {/* Vignette hält die Ränder still, Saum führt in die nächste Section */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(115% 95% at 50% 34%, transparent 30%, rgba(8,9,11,0.88) 100%)' }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-40"
          style={{ background: 'linear-gradient(to top, #0B0C0E 0%, transparent 100%)' }}
        />
        {/* Ein einziger, kaum sichtbarer Lichteinfall hinter dem Block */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(48% 38% at 50% 42%, rgba(255,255,255,0.05), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-24 pb-10 lg:pt-28 lg:pb-28">

        {/* Eyebrow — der einzige Produktblau-Akzent */}
        <div data-hero className="flex items-center gap-3 mb-6 sm:mb-8">
          <span style={{ width: '26px', height: '2px', background: 'var(--brand-blue)' }} />
          <p
            className="text-[10px] sm:text-[11px] uppercase font-semibold"
            style={{ letterSpacing: '0.36em', color: 'rgba(255,255,255,0.55)' }}
          >
            {t.hero.subtitle}
          </p>
          <span style={{ width: '26px', height: '2px', background: 'var(--brand-blue)' }} />
        </div>

        {/* Monolith-Wortmarke — volle Breite, Letter für Letter, Silber-Verlauf */}
        <div
          ref={wordRef}
          aria-hidden
          className="whitespace-nowrap select-none pointer-events-none will-change-transform"
          style={{
            fontFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.55rem, 9.7vw, 9.2rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.012em',
          }}
        >
          {BRAND.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.05em' }}>
              <span
                data-letter
                className="inline-block will-change-transform"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #E9EDF2 52%, #AEB9C6 100%)',
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

        {/* Der Block — das Produkt als Objekt: Echtzeit-3D, PNG als Fallback */}
        <div
          ref={cubeRef}
          className="relative z-[5] will-change-transform aspect-square"
          style={{
            width: 'clamp(220px, 23.5vw, 320px)',
            marginTop: 'clamp(-4.6rem, -5.8vw, -1.8rem)',
          }}
        >
          {webgl ? (
            <Suspense
              fallback={
                <img
                  src="/images/wax-cube.webp"
                  alt=""
                  className="block w-[72%] h-auto mx-auto mt-[14%]"
                  style={{ filter: 'drop-shadow(0 46px 60px rgba(0,0,0,0.65))' }}
                />
              }
            >
              <HeroBlock3D reduced={reduced} />
            </Suspense>
          ) : (
            <picture>
              <source srcSet="/images/wax-cube.webp" type="image/webp" />
              <img
                src="/images/wax-cube.png"
                alt={de ? 'Waxcelerate Heißwachs-Block mit MoS₂-Partikeln' : 'Waxcelerate hot wax block with MoS₂ particles'}
                className="block w-[72%] h-auto mx-auto mt-[14%]"
                style={{ filter: 'drop-shadow(0 46px 60px rgba(0,0,0,0.65)) drop-shadow(0 12px 24px rgba(0,0,0,0.5))' }}
                fetchPriority="high"
              />
            </picture>
          )}
        </div>

        {/* Claim — ruhig, kursiv, ein Satz */}
        <h1
          className="font-display text-white mt-5 sm:mt-6"
          style={{
            fontSize: 'clamp(1.65rem, 2.7vw, 2.4rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            fontWeight: 600,
            fontVariationSettings: '"opsz" 144, "wght" 600, "SOFT" 30, "WONK" 0',
          }}
        >
          <span className="block overflow-hidden" style={{ paddingBottom: '0.1em' }}>
            <span data-hero-mask className="block italic will-change-transform">
              {t.hero.headline} {t.hero.headlineSub}
            </span>
          </span>
        </h1>

        {/* Konkreter Nutzen — eine ruhige Zeile */}
        <p
          data-hero
          className="mt-3.5 max-w-md leading-relaxed"
          style={{ fontSize: 'clamp(0.875rem, 1.2vw, 0.9375rem)', color: 'rgba(255,255,255,0.56)' }}
        >
          {t.hero.tagline}
        </p>

        {/* CTAs */}
        <div data-hero className="mt-8 flex items-center justify-center gap-5 flex-wrap">
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

        {/* Trust — eine einzige Mikro-Zeile, ganz unten in der Hierarchie */}
        <p
          data-hero
          className="mt-6 text-[10.5px] uppercase tabular-nums"
          style={{ letterSpacing: '0.16em', color: 'rgba(255,255,255,0.42)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>★★★★★</span>
          {'  171 · '}
          {de ? '100 % positiv' : '100% positive'}
          {' · '}
          {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}
        </p>
      </div>

      {/* Spec-Ribbon — nummerierte Editorial-Einträge */}
      <div data-hero className="relative lg:absolute lg:bottom-0 lg:inset-x-0 z-10 mt-10 lg:mt-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div
            className="grid grid-cols-3 gap-x-5 sm:gap-x-8 py-4 sm:py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
          >
            {stats.map((s, i) => (
              <div key={i} className="text-left">
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
