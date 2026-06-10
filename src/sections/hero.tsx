import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Hero — „Gallery Slab".
 * Kein Full-Bleed-Foto mehr: eine tiefschwarze, ruhige Bühne trägt eine
 * gerahmte, helle Bildplatte (saubere Silberkette = das Markenversprechen),
 * darüber schwebt eine kleinere Platte (Kette im Heißwachsbad = der echte
 * Prozess). Die weiße vertikale Wortmarke überspannt die Plattenkante und
 * invertiert per mix-blend-difference über dem hellen Foto — ein Schnitt,
 * kein Effekt-Feuerwerk. Curtain-Unveil, maskierte Headline-Zeilen,
 * Mehrschicht-Parallax (Cursor + Scroll, je Ebene anderes Tempo).
 * Alles einmal getriggert oder scroll-gebunden — kein Loop, kein Glow.
 */
export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const rootRef   = useRef<HTMLElement>(null);
  const plateWrap = useRef<HTMLDivElement>(null);  // Cursor-/Scroll-Parallax (Ebene 1)
  const plateClip = useRef<HTMLDivElement>(null);  // Curtain-Unveil (clip-path)
  const plateImg  = useRef<HTMLDivElement>(null);  // Settle (scale)
  const bathRef   = useRef<HTMLDivElement>(null);  // Tiefere Ebene — bewegt sich stärker
  const wordRef   = useRef<HTMLSpanElement>(null); // Wortmarke
  const animated  = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    if (!root) return;
    animated.current = true;

    const items = root.querySelectorAll<HTMLElement>('[data-hero]');
    const masks = root.querySelectorAll<HTMLElement>('[data-hero-mask]');
    const lines = root.querySelectorAll<HTMLElement>('[data-hero-line]');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(masks, { yPercent: 0 });
      gsap.set(lines, { scaleX: 1 });
      if (plateClip.current) gsap.set(plateClip.current, { clipPath: 'inset(0% 0 0 0)' });
      if (plateImg.current)  gsap.set(plateImg.current, { scale: 1 });
      if (bathRef.current)   gsap.set(bathRef.current, { opacity: 1, y: 0 });
      if (wordRef.current)   gsap.set(wordRef.current, { opacity: 1, x: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.12, defaults: { ease: 'power3.out' } });

    // Curtain-Unveil: die Platte enthüllt sich von oben — wie ein Tuch, das fällt.
    if (plateClip.current) {
      tl.fromTo(
        plateClip.current,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1.35, ease: 'power3.inOut' },
        0.15,
      );
    }
    // Settle des Makros in der Platte — langsam, schwer.
    if (plateImg.current) {
      tl.fromTo(plateImg.current, { scale: 1.16 }, { scale: 1.05, duration: 2.6, ease: 'power2.out' }, 0.15);
    }
    // Headline-Zeilen steigen maskiert aus der Grundlinie.
    tl.fromTo(masks, { yPercent: 112 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 }, 0.35);
    // Wachsbad-Platte schwebt ein — die tiefere Ebene kommt zuletzt zur Ruhe.
    if (bathRef.current) {
      tl.fromTo(bathRef.current, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.1 }, 0.95);
    }
    // Wortmarke: ein ruhiger Schnitt von links.
    if (wordRef.current) {
      tl.fromTo(wordRef.current, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 1.2 }, 0.8);
    }
    tl.fromTo(items, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.5);
    tl.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.09 }, 1.0);

    // Scroll-Drift: jede Ebene gleitet in eigenem Tempo — echte Tiefe.
    const triggers: ScrollTrigger[] = [];
    const drift = (el: Element | null, dist: number) => {
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          animation: gsap.fromTo(el, { yPercent: 0 }, { yPercent: dist, ease: 'none' }),
        }),
      );
    };
    drift(plateWrap.current, -5);
    drift(bathRef.current, -16);

    // Cursor-Tiefe: Ebenen folgen der Maus mit unterschiedlicher Amplitude.
    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer) {
      const layers: Array<[Element | null, number, number]> = [
        [plateWrap.current, -9, -6],
        [bathRef.current, -22, -14],
      ];
      const movers = layers
        .filter((l): l is [Element, number, number] => !!l[0])
        .map(([el, ax, ay]) => ({
          ax, ay,
          qx: gsap.quickTo(el, 'x', { duration: 1.0, ease: 'power3.out' }),
          qy: gsap.quickTo(el, 'y', { duration: 1.0, ease: 'power3.out' }),
        }));
      onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        movers.forEach((m) => { m.qx(nx * m.ax); m.qy(ny * m.ay); });
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
      className="relative overflow-hidden grain min-h-[100dvh] lg:h-[100dvh]"
      style={{
        background: '#0A0B0D',
        ['--tx1' as string]: '#F7F7F8',
      } as React.CSSProperties}
    >
      {/* Stille Bühne: ein einziger, kaum sichtbarer Lichteinfall oben links */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(70% 55% at 18% 0%, rgba(255,255,255,0.045), transparent 70%)' }}
      />

      {/* Content + Bühne */}
      <div className="relative z-10 h-full max-w-[1680px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="h-full flex flex-col lg:flex-row lg:items-center pt-24 sm:pt-28 lg:pt-0 gap-10 lg:gap-0">

          {/* Text — links */}
          <div className="order-2 lg:order-1 lg:flex-[1.04] lg:pr-12 xl:pr-16 lg:pb-24">

            {/* Eyebrow — der einzige Produktblau-Akzent */}
            <div data-hero className="flex items-center gap-3 mb-7 sm:mb-9">
              <span style={{ width: '30px', height: '2px', background: 'var(--brand-blue)' }} />
              <p
                className="text-[10px] sm:text-[11px] uppercase font-semibold"
                style={{ letterSpacing: '0.36em', color: 'rgba(255,255,255,0.58)' }}
              >
                {t.hero.subtitle}
              </p>
            </div>

            {/* Headline — zwei maskierte Zeilen, aufrechtes Fraunces, Italic nur im Schluss */}
            <h1
              className="font-display text-white"
              style={{
                fontSize: 'clamp(3.3rem, 7.6vw, 7rem)',
                lineHeight: 0.96,
                letterSpacing: '-0.025em',
                fontWeight: 600,
                fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
              }}
            >
              <span className="block overflow-hidden" style={{ paddingBottom: '0.06em' }}>
                <span data-hero-mask className="block will-change-transform">{t.hero.headline}</span>
              </span>
              <span className="block overflow-hidden" style={{ paddingBottom: '0.09em' }}>
                <span data-hero-mask className="block italic will-change-transform" style={{ fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 30, "WONK" 0' }}>
                  {t.hero.headlineSub}
                </span>
              </span>
            </h1>

            {/* Konkreter Nutzen — ruhige Stütze */}
            <p
              data-hero
              className="mt-7 max-w-md leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.66)' }}
            >
              {t.hero.tagline}
            </p>

            {/* Trust-Zeile */}
            <div
              data-hero
              className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]"
              style={{ color: 'rgba(255,255,255,0.6)' }}
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

          {/* Bühne — rechts: gerahmte Galerie-Platte + schwebende Prozess-Platte */}
          <div className="order-1 lg:order-2 lg:flex-[0.96] relative lg:h-full flex items-center justify-center lg:justify-end lg:pb-16">
            <div
              ref={plateWrap}
              className="relative will-change-transform w-full sm:w-[88%] lg:w-[var(--plate-w)]"
              style={{
                maxWidth: 'min(34rem, 100%)',
                ['--plate-w' as string]: 'min(33rem, 38vw, calc((100dvh - 230px) * 0.8))',
              } as React.CSSProperties}
            >
              {/* Galerie-Platte: saubere Silberkette — das Versprechen, sichtbar */}
              <div
                ref={plateClip}
                className="relative overflow-hidden aspect-[5/4] lg:aspect-[4/5]"
                style={{
                  border: '1px solid rgba(255,255,255,0.16)',
                  width: '100%',
                  maxHeight: 'calc(100dvh - 230px)',
                  clipPath: 'inset(0 0 100% 0)',
                }}
              >
                <div ref={plateImg} className="absolute inset-0 will-change-transform">
                  <picture>
                    <source srcSet="/images/hero-plate.webp" type="image/webp" />
                    <img
                      src="/images/hero-plate.jpg"
                      alt={de ? 'Frisch gewachste Fahrradketten, Makroaufnahme' : 'Freshly waxed bicycle chains, macro shot'}
                      className="absolute inset-0 w-full h-full object-cover"
                      fetchPriority="high"
                    />
                  </picture>
                </div>
                {/* Bildunterschrift in der Platte — Galerie-Etikett */}
                <div
                  className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-3"
                  style={{ background: 'linear-gradient(to top, rgba(8,9,11,0.55), transparent)' }}
                >
                  <span className="text-[9px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: 'rgba(255,255,255,0.8)' }}>
                    {de ? 'Gewachst · 0 Öl' : 'Waxed · 0 oil'}
                  </span>
                  <span className="hidden sm:inline text-[9px] uppercase tabular-nums" style={{ letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)' }}>
                    µ 0,03–0,06
                  </span>
                </div>
              </div>

              {/* Prozess-Platte: Kette im Heißwachsbad — die tiefere Ebene */}
              <div
                ref={bathRef}
                className="absolute will-change-transform -right-2 sm:-right-5 lg:right-[-9%]"
                style={{
                  width: 'clamp(7.5rem, 13vw, 12.5rem)',
                  bottom: '-9%',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 32px 70px rgba(0,0,0,0.55)',
                }}
              >
                <picture>
                  <source srcSet="/images/hero-bath.webp" type="image/webp" />
                  <img
                    src="/images/hero-bath.jpg"
                    alt={de ? 'Kette im Heißwachsbad' : 'Chain in the hot wax bath'}
                    className="block w-full aspect-square object-cover"
                    loading="eager"
                  />
                </picture>
                <div
                  className="absolute bottom-0 inset-x-0 px-2.5 py-2"
                  style={{ background: 'linear-gradient(to top, rgba(8,9,11,0.6), transparent)' }}
                >
                  <span className="text-[8px] uppercase font-semibold" style={{ letterSpacing: '0.2em', color: 'rgba(255,255,255,0.75)' }}>
                    {de ? 'Heißwachsbad · 85 °C' : 'Hot wax bath · 85 °C'}
                  </span>
                </div>
              </div>

              {/* Vertikale Wortmarke — weiß, überspannt die Plattenkante.
                  mix-blend-difference: über dem hellen Foto kippt sie ins Dunkle — ein Schnitt. */}
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 z-[5] hidden lg:flex items-center justify-center pointer-events-none select-none"
                style={{ width: 0 }}
              >
                <span
                  ref={wordRef}
                  className="whitespace-nowrap"
                  style={{
                    transform: 'rotate(-90deg)',
                    fontFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontSize: 'min(6.6vh, 5.5rem)',
                    letterSpacing: '0.08em',
                    lineHeight: 1,
                    color: '#FFFFFF',
                    mixBlendMode: 'difference',
                  }}
                >
                  Waxcelerate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spec-Ribbon — nummerierte Editorial-Einträge */}
      <div data-hero className="relative lg:absolute lg:bottom-0 lg:inset-x-0 z-10 mt-12 lg:mt-0">
        <div className="max-w-[1680px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
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
