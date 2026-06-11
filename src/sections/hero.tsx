import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Hero — „Gallery Stage" mit Tiefenebenen.
 * Das Foto liegt als gerundete Bühne auf dem Seitenhintergrund (funktioniert
 * in Light & Noir). Die Waxcelerate-Wortmarke (Roboto) läuft HINTER dem
 * Wachsblock durch: eine zweite, per Alpha-Maske auf die Block-Silhouette
 * beschnittene Bildebene liegt über der Typo — Maske und Bild teilen
 * dieselbe cover-Geometrie und bleiben dadurch in jedem Viewport deckungs-
 * gleich. Letters und Headline-Wörter fallen nacheinander von oben ein.
 * Alles einmal getriggert oder scroll-gebunden — kein Loop, kein Glow.
 */

const BRAND = 'Waxcelerate'.split('');
const IMG_POS = '62% 50%'; // identisch für object-position UND mask-position

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const rootRef    = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const blockRef   = useRef<HTMLDivElement>(null);
  const wordRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLButtonElement>(null);
  const animated   = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    animated.current = true;

    const letters = root.querySelectorAll<HTMLElement>('[data-letter]');
    const words   = root.querySelectorAll<HTMLElement>('[data-word]');
    const items   = root.querySelectorAll<HTMLElement>('[data-hero]');
    // Basis- und Maskenebene müssen jede Transformation exakt teilen.
    const imgLayers = [imgRef.current, blockRef.current].filter(Boolean) as HTMLElement[];

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduced) {
      gsap.set([letters, words], { yPercent: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(card, { opacity: 1, y: 0 });
      gsap.set(imgLayers, { scale: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.05, defaults: { ease: 'power4.out' } });

    // Bühne hebt sich leise vom Seitenhintergrund ab.
    tl.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0);
    // Cineastischer Bild-Settle — beide Ebenen synchron, Maske bleibt deckungsgleich.
    tl.fromTo(imgLayers, { scale: 1.06 }, { scale: 1.01, duration: 2.4, ease: 'power2.out' }, 0);
    // Wortmarke: jeder Letter fällt von oben hinter den Block.
    tl.fromTo(
      letters,
      { yPercent: -115 },
      { yPercent: 0, duration: 0.85, ease: 'back.out(1.4)', stagger: { each: 0.042 } },
      0.3,
    );
    // Headline: Wörter fallen nacheinander ein — Drop mit leichtem Überschwung.
    tl.fromTo(
      words,
      { yPercent: -120 },
      { yPercent: 0, duration: 0.72, ease: 'back.out(1.3)', stagger: 0.15 },
      0.75,
    );
    tl.fromTo(items, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 1.0);

    // Scroll: Bild driftet, Wortmarke atmet auseinander, Text verabschiedet sich.
    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(
        ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }),
      );
    scrub(gsap.to(imgLayers, { yPercent: 4, ease: 'none' }));
    if (contentRef.current) scrub(gsap.to(contentRef.current, { y: -40, opacity: 0.25, ease: 'none' }));
    if (letters.length) {
      const mid = (letters.length - 1) / 2;
      scrub(gsap.to(letters, { x: (i: number) => (i - mid) * 5, ease: 'none' }));
    }
    // Die Bühne weicht beim Scrollen minimal zurück — cineastischer Abgang.
    scrub(gsap.to(card, { scale: 0.965, transformOrigin: '50% 100%', ease: 'none' }));

    // Cursor-Tiefe: Bildebenen folgen der Maus stärker als die Wortmarke —
    // der Versatz zwischen Block und Typo erzeugt echte Parallaxe.
    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer) {
      const qImg = imgLayers.map((el) => [
        gsap.quickTo(el, 'x', { duration: 1.0, ease: 'power3.out' }),
        gsap.quickTo(el, 'y', { duration: 1.0, ease: 'power3.out' }),
      ]);
      const qWordX = wordRef.current ? gsap.quickTo(wordRef.current, 'x', { duration: 1.2, ease: 'power3.out' }) : null;
      const qWordY = wordRef.current ? gsap.quickTo(wordRef.current, 'y', { duration: 1.2, ease: 'power3.out' }) : null;
      onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        qImg.forEach(([qx, qy]) => { qx(nx * -10); qy(ny * -7); });
        if (qWordX && qWordY) { qWordX(nx * -3); qWordY(ny * -2); }
      };
      card.addEventListener('mousemove', onMove);
    }

    // Magnetischer Primär-CTA: zieht sich wenige Pixel zum Cursor,
    // federt beim Verlassen elastisch zurück.
    let ctaMove: ((e: MouseEvent) => void) | undefined;
    let ctaLeave: (() => void) | undefined;
    const cta = ctaRef.current;
    if (finePointer && cta) {
      const qx = gsap.quickTo(cta, 'x', { duration: 0.35, ease: 'power3.out' });
      const qy = gsap.quickTo(cta, 'y', { duration: 0.35, ease: 'power3.out' });
      ctaMove = (e: MouseEvent) => {
        const r = cta.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width - 0.5) * 10);
        qy(((e.clientY - r.top) / r.height - 0.5) * 8);
      };
      ctaLeave = () => gsap.to(cta, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      cta.addEventListener('mousemove', ctaMove);
      cta.addEventListener('mouseleave', ctaLeave);
    }

    return () => {
      if (onMove) card.removeEventListener('mousemove', onMove);
      if (cta && ctaMove) cta.removeEventListener('mousemove', ctaMove);
      if (cta && ctaLeave) cta.removeEventListener('mouseleave', ctaLeave);
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

  // Bild-Ebene (für Basis + maskierte Block-Ebene identisch aufgebaut)
  const imgEl = (masked: boolean) => (
    <picture>
      <source srcSet="/images/hero-wax-v5.webp" type="image/webp" />
      <img
        src="/images/hero-wax-v5.jpg"
        alt={masked ? '' : de ? 'Waxcelerate Heißwachs-Block auf Schiefer' : 'Waxcelerate hot wax block on slate'}
        aria-hidden={masked || undefined}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition: IMG_POS,
          ...(masked
            ? {
                WebkitMaskImage: 'url(/images/hero-wax-v5-mask.png)',
                maskImage: 'url(/images/hero-wax-v5-mask.png)',
                WebkitMaskSize: 'cover',
                maskSize: 'cover',
                WebkitMaskPosition: IMG_POS,
                maskPosition: IMG_POS,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
              }
            : {}),
        }}
        fetchPriority={masked ? undefined : 'high'}
      />
    </picture>
  );

  return (
    <section id="home" ref={rootRef} className="relative" style={{ background: 'var(--pg)' }}>
      <div className="px-3 sm:px-4 lg:px-6 pt-[84px] lg:pt-[104px] pb-3 sm:pb-4 lg:pb-6">
        {/* Bühne: gerundete Foto-Karte auf dem Seitenhintergrund — Light & Noir */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] will-change-transform
                     h-[calc(100dvh-108px)] lg:h-[calc(100dvh-134px)] min-h-[540px]"
          style={{
            background: '#0B0C0E',
            boxShadow: '0 28px 90px rgba(10,10,16,0.22), 0 4px 18px rgba(10,10,16,0.10)',
          }}
        >
          {/* Ebene 1 — Foto (hell, der Schiefer bleibt sichtbar) */}
          <div ref={imgRef} className="absolute inset-0 will-change-transform">
            {imgEl(false)}
          </div>

          {/* Sanfte Scrims — nur wo Typo liegt, kein Vignetten-Schwarz */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background:
                'linear-gradient(90deg, rgba(7,8,10,0.72) 0%, rgba(7,8,10,0.42) 30%, rgba(7,8,10,0.08) 56%, transparent 72%)',
            }}
          />
          <div
            className="absolute top-0 inset-x-0 h-24 pointer-events-none z-[1]"
            style={{ background: 'linear-gradient(to bottom, rgba(5,6,8,0.42), transparent)' }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-36 pointer-events-none z-[1]"
            style={{ background: 'linear-gradient(to top, rgba(5,6,8,0.72), transparent)' }}
          />
          {/* Mobile: kräftigerer Boden-Scrim — Text liegt dort über dem Block.
              Über den Bildebenen (z-4), damit auch die maskierte Blockkopie
              abgedunkelt wird. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[62%] pointer-events-none z-[4] sm:hidden"
            style={{
              background:
                'linear-gradient(to top, rgba(5,6,8,0.92) 0%, rgba(5,6,8,0.72) 40%, rgba(5,6,8,0.30) 72%, transparent 100%)',
            }}
          />

          {/* Ebene 2 — Wortmarke (Roboto), läuft hinter dem Block durch */}
          <div
            ref={wordRef}
            aria-hidden
            className="absolute left-0 right-0 top-[10%] sm:top-[12%] z-[2] flex justify-center pointer-events-none select-none px-4 will-change-transform"
          >
            <div
              className="whitespace-nowrap"
              style={{
                fontFamily: '"Roboto", "Libre Franklin", ui-sans-serif, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2.9rem, 10.6vw, 10.4rem)',
                lineHeight: 1,
                letterSpacing: '-0.035em',
                color: 'rgba(255,255,255,0.97)',
              }}
            >
              {BRAND.map((ch, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom">
                  <span data-letter className="inline-block will-change-transform">
                    {ch}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Ebene 3 — der Wachsblock als maskierte Bildkopie: er verdeckt die
              Typo und „tritt" dadurch leicht aus der Fläche hervor */}
          <div ref={blockRef} className="absolute inset-0 z-[3] pointer-events-none will-change-transform">
            {imgEl(true)}
          </div>

          {/* Ebene 4 — Content links über der ruhigen Schieferfläche */}
          <div className="relative z-10 h-full w-full px-6 sm:px-10 lg:px-14 xl:px-20">
            <div className="h-full max-w-7xl mx-auto flex flex-col justify-end pb-28 sm:pb-32 lg:pb-28">
              <div ref={contentRef} className="max-w-xl will-change-transform">

                {/* Eyebrow — der einzige Produktblau-Akzent */}
                <div data-hero className="flex items-center gap-3 mb-5">
                  <span style={{ width: '28px', height: '2px', background: 'var(--brand-blue)' }} />
                  <p
                    className="text-[10px] sm:text-[11px] uppercase font-semibold"
                    style={{ letterSpacing: '0.34em', color: 'rgba(255,255,255,0.62)' }}
                  >
                    {t.hero.subtitle}
                  </p>
                </div>

                {/* Headline — Fraunces, Wörter fallen nacheinander ein */}
                <h1
                  className="font-display text-white"
                  style={{
                    fontSize: 'clamp(2.3rem, 4.6vw, 4.1rem)',
                    lineHeight: 1.0,
                    letterSpacing: '-0.025em',
                    fontWeight: 600,
                    fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
                  }}
                >
                  <span className="block" style={{ paddingBottom: '0.05em' }}>
                    {t.hero.headline.split(' ').map((w, i) => (
                      <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.24em]">
                        <span data-word className="inline-block will-change-transform">{w}</span>
                      </span>
                    ))}
                  </span>
                  <span className="block" style={{ paddingBottom: '0.08em' }}>
                    {t.hero.headlineSub.split(' ').map((w, i) => (
                      <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.24em]">
                        <span
                          data-word
                          className="inline-block italic will-change-transform"
                          style={{ fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 30, "WONK" 0' }}
                        >
                          {w}
                        </span>
                      </span>
                    ))}
                  </span>
                </h1>

                {/* Konkreter Nutzen */}
                <p
                  data-hero
                  className="mt-5 max-w-md leading-relaxed"
                  style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {t.hero.tagline}
                </p>

                {/* CTAs — ruhige Mikrointeraktionen: Lift + Pfeil-Nudge */}
                <div data-hero className="mt-7 flex items-center gap-4 flex-wrap">
                  <button
                    ref={ctaRef}
                    onClick={() => scrollTo('#produkte')}
                    className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-[14px] font-bold rounded-full transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.45)] will-change-transform"
                    style={{ background: '#FFFFFF', color: '#0F0F12' }}
                  >
                    {t.hero.ctaBuy}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => scrollTo('#warum-wachs')}
                    className="px-6 py-3.5 text-[13px] font-medium rounded-full transition-all duration-300"
                    style={{
                      color: 'rgba(255,255,255,0.88)',
                      border: '1px solid rgba(255,255,255,0.30)',
                      background: 'rgba(10,11,13,0.18)',
                      backdropFilter: 'blur(6px)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.52)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(10,11,13,0.18)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)';
                    }}
                  >
                    {t.hero.ctaSecondary}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll-Rail — rechte Kante, leise Einladung weiterzulesen */}
          <button
            data-hero
            onClick={() => scrollTo('#warum-wachs')}
            aria-label={de ? 'Weiterscrollen' : 'Scroll down'}
            className="hidden lg:flex absolute right-7 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-3 group cursor-pointer"
          >
            <span
              className="text-[9px] uppercase font-medium transition-colors duration-300 group-hover:text-white"
              style={{
                writingMode: 'vertical-rl',
                letterSpacing: '0.32em',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              Scroll
            </span>
            <span
              className="w-px h-12 transition-all duration-300 group-hover:h-16"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.08))' }}
            />
          </button>

          {/* Trust + Daten — ein ruhiges Band am Fuß der Bühne */}
          <div data-hero className="absolute bottom-0 inset-x-0 z-10">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
              <div
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}
              >
                {/* Trust — eine leise Zeile */}
                <div className="flex items-center gap-3 order-2 sm:order-1">
                  <span style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '0.08em', fontSize: '13px' }}>
                    ★★★★★
                  </span>
                  <span
                    className="text-[10.5px] sm:text-[11px] uppercase tabular-nums"
                    style={{ letterSpacing: '0.13em', color: 'rgba(255,255,255,0.55)' }}
                  >
                    171 · {de ? '100 % positiv' : '100% positive'} · {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}
                  </span>
                </div>

                {/* Daten — drei klare Werte, durch Hairlines kolumniert */}
                <div className="flex items-stretch order-1 sm:order-2">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="px-3 sm:px-7 first:pl-0 last:pr-0"
                      style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.14)' : 'none' }}
                    >
                      <p
                        className="font-display font-bold tabular-nums text-white leading-none"
                        style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}
                      >
                        {s.v}
                      </p>
                      <p
                        className="text-[9px] sm:text-[10px] uppercase mt-1.5 whitespace-nowrap"
                        style={{ letterSpacing: '0.09em', color: 'rgba(255,255,255,0.52)' }}
                      >
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
