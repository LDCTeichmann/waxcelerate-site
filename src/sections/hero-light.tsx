import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCube } from '@/sections/hero/WaxLensCube';
import { waxLensEnabled } from '@/sections/hero/constants';

const WaxDive = lazy(() => import('@/sections/hero/WaxDive').then(m => ({ default: m.WaxDive })));

const BRAND = 'Waxcelerate'.split('');

function useIsLight() {
  const [light, setLight] = useState(() =>
    typeof document === 'undefined' ? true : !document.documentElement.classList.contains('noir'),
  );
  useEffect(() => {
    const read = () => setLight(!document.documentElement.classList.contains('noir'));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return light;
}

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const light = useIsLight();
  const [diveOpen, setDiveOpen] = useState(false);
  const [lensOn] = useState(() => waxLensEnabled());
  const [lensActive, setLensActive] = useState(false);
  const openDive = useCallback(() => setDiveOpen(true), []);

  const rootRef     = useRef<HTMLElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const cubeBoxRef  = useRef<HTMLDivElement>(null);
  const cubeAnimRef = useRef<HTMLDivElement>(null);
  const wordRef     = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLButtonElement>(null);
  const animated    = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    animated.current = true;

    const letters = root.querySelectorAll<HTMLElement>('[data-letter]');
    const words   = root.querySelectorAll<HTMLElement>('[data-word]');
    const items   = root.querySelectorAll<HTMLElement>('[data-hero]');
    const statEls = root.querySelectorAll<HTMLElement>('[data-stat-val]');
    const bg      = bgRef.current;
    const cube    = cubeAnimRef.current;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduced) {
      gsap.set([letters, words], { yPercent: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(stage, { opacity: 1 });
      if (cube) gsap.set(cube, { opacity: 1, scale: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.05, defaults: { ease: 'power3.out' } });

    tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 0);

    if (bg) {
      tl.fromTo(bg, { scale: 1.08 },
        { scale: 1.015, duration: 1.8, ease: 'power3.out' }, 0);
    }

    if (cube) {
      tl.fromTo(cube, { opacity: 0, y: -30, scale: 1.06 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' }, 0.3);
    }

    if (cubeBoxRef.current) {
      tl.fromTo(cubeBoxRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.35);
    }

    tl.fromTo(letters, { yPercent: -115 },
      { yPercent: 0, duration: 0.85, ease: 'back.out(1.25)', stagger: { each: 0.042 } }, 0.25);

    tl.fromTo(words, { yPercent: -120 },
      { yPercent: 0, duration: 0.74, ease: 'back.out(1.25)', stagger: 0.13 }, 0.78);
    tl.fromTo(items, { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 1.0);

    if (statEls[0]) {
      const el0 = statEls[0]; const c0 = { val: 0 };
      tl.to(c0, { val: 3, duration: 0.9, ease: 'power2.out', snap: { val: 1 },
        onStart() { el0.textContent = '0×'; }, onUpdate() { el0.textContent = c0.val + '×'; } }, 1.15);
    }
    if (statEls[1]) {
      const el1 = statEls[1]; const c1 = { val: 0 };
      tl.to(c1, { val: 70, duration: 1.1, ease: 'power2.out', snap: { val: 1 },
        onStart() { el1.textContent = '~€0'; }, onUpdate() { el1.textContent = '~€' + c1.val; } }, 1.15);
    }
    if (statEls[2]) {
      tl.fromTo(statEls[2], { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.5);
    }

    let floatTween: gsap.core.Tween | undefined;
    if (cube) {
      floatTween = gsap.to(cube, { y: '+=8', duration: 4.2, ease: 'sine.inOut',
        repeat: -1, yoyo: true, delay: 1.6 });
    }

    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }));
    if (bg) scrub(gsap.to(bg, { yPercent: 8, ease: 'none' }));
    if (cubeBoxRef.current) scrub(gsap.to(cubeBoxRef.current, { yPercent: 5, ease: 'none' }));
    if (wordRef.current) scrub(gsap.to(wordRef.current, { yPercent: -9, ease: 'none' }));
    if (contentRef.current) scrub(gsap.to(contentRef.current, { y: -40, opacity: 0.3, ease: 'none' }));

    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer) {
      const qCubeX = cube ? gsap.quickTo(cube, 'x', { duration: 1.0, ease: 'power3.out' }) : null;
      const qBgX = bg ? gsap.quickTo(bg, 'x', { duration: 1.3, ease: 'power3.out' }) : null;
      const qBgY = bg ? gsap.quickTo(bg, 'y', { duration: 1.3, ease: 'power3.out' }) : null;
      const qWordX = wordRef.current ? gsap.quickTo(wordRef.current, 'x', { duration: 1.3, ease: 'power3.out' }) : null;
      onMove = (e: MouseEvent) => {
        const r = stage.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        if (qCubeX) qCubeX(nx * 7);
        if (qBgX) qBgX(nx * -10);
        if (qBgY) qBgY(ny * -6);
        if (qWordX) qWordX(nx * -4);
      };
      stage.addEventListener('mousemove', onMove);
    }

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
      if (onMove) stage.removeEventListener('mousemove', onMove);
      if (cta && ctaMove) cta.removeEventListener('mousemove', ctaMove);
      if (cta && ctaLeave) cta.removeEventListener('mouseleave', ctaLeave);
      floatTween?.kill();
      triggers.forEach((s) => s.kill());
    };
  }, []);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const stats = [
    { v: '3×',    l: de ? 'Kettenlaufzeit'        : 'chain life'        },
    { v: '~€70',  l: de ? 'gespart · 12.000 km'   : 'saved · 12,000 km' },
    { v: '1 Tag', l: de ? 'Versand nach Bestellung': 'ships after order' },
  ];

  return (
    <section id="home" ref={rootRef} className="hero-editorial relative" style={{ background: '#0a0c12' }}>
      <div
        ref={stageRef}
        className="hero-stage relative overflow-hidden min-h-[100svh] lg:h-[100svh] lg:min-h-[640px]"
      >

        {/* ── Full-bleed chain background ── */}
        <div ref={bgRef} className="absolute inset-0 z-[1] will-change-transform">
          <img
            src="/images/hero/chain-bg.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '60% 35%' }}
            fetchPriority="high"
          />
          {/* Readability overlays */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(6,8,16,0.72) 0%, rgba(6,8,16,0.38) 40%, rgba(6,8,16,0.22) 60%, rgba(6,8,16,0.52) 100%)',
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(6,8,16,0.3) 0%, transparent 30%, transparent 60%, rgba(6,8,16,0.65) 100%)',
          }} />
        </div>

        {/* ── Brand: "Waxcelerate" large behind the wax block ── */}
        <div
          ref={wordRef}
          aria-hidden
          className="absolute left-0 right-0 top-[100px] lg:top-[14%] z-[2] pointer-events-none select-none px-6 sm:px-10 lg:px-14 xl:px-20 will-change-transform"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center">
              <div
                className="whitespace-nowrap"
                style={{
                  fontFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2.2rem, 8vw, 8.5rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.008em',
                  color: 'rgba(255,255,255,0.92)',
                }}
              >
                {BRAND.map((ch, i) => (
                  <span key={i} className="inline-block overflow-hidden align-bottom">
                    <span data-letter className="inline-block">{ch}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Wax cutout — large, center-right, in front of brand text ── */}
        <div
          ref={cubeBoxRef}
          className="absolute z-[5] pointer-events-none will-change-transform
                     left-1/2 -translate-x-1/2 top-[220px]
                     w-[clamp(170px,48vw,240px)]
                     lg:left-[58%] lg:top-[50%] lg:-translate-y-1/2 lg:w-[clamp(280px,30vw,440px)]"
        >
          <div ref={cubeAnimRef} className="relative will-change-transform"
               style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.45)) drop-shadow(0 14px 24px rgba(0,0,0,0.25))' }}>
            <picture>
              <source srcSet="/images/hero/wax-cutout.webp" type="image/webp" />
              <img
                src="/images/hero/wax-cutout.png"
                alt={de ? 'Waxcelerate Heißwachs-Block' : 'Waxcelerate hot wax block'}
                className="block w-full h-auto"
                fetchPriority="high"
              />
            </picture>
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                WebkitMaskImage: 'url(/images/hero/wax-cutout-mask.png)',
                maskImage: 'url(/images/hero/wax-cutout-mask.png)',
                WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                background: 'linear-gradient(132deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 100%)',
                mixBlendMode: 'soft-light',
              }}
            />
          </div>
        </div>

        {/* WaxLensCube — follows cursor over the cutout */}
        <WaxLensCube cubeRef={cubeBoxRef} enabled={lensOn} light={light} de={de}
                     onOpen={openDive} onActiveChange={setLensActive} />

        {/* Click hotspot over the cutout (desktop) */}
        <button
          type="button"
          onClick={() => setDiveOpen(true)}
          aria-label={de ? 'Blick ins Wachs — Inhaltsstoffe ansehen' : 'Look inside the wax — see the ingredients'}
          className="group hidden lg:block absolute z-[6]"
          style={{ left: '58%', top: '50%', width: 'clamp(280px,30vw,440px)', height: 'clamp(280px,30vw,440px)',
                   transform: 'translate(-50%,-50%)', cursor: lensOn && lensActive ? 'none' : 'pointer' }}
        />

        {/* Top fade for nav readability */}
        <div aria-hidden className="absolute top-0 inset-x-0 h-[120px] z-[7] pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, rgba(6,8,16,0.45), transparent)' }} />

        {/* Bottom fade */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 z-[8] pointer-events-none h-[120px]"
             style={{ background: 'linear-gradient(to top, rgba(6,8,16,0.55), transparent)' }} />

        {/* Film grain */}
        <div aria-hidden className="hero-grain absolute inset-0 z-[9] pointer-events-none" />

        {/* ── Content — left side ── */}
        <div className="relative z-[10] w-full lg:h-full px-6 sm:px-10 lg:px-14 xl:px-20 pointer-events-none">
          <div className="max-w-7xl mx-auto flex flex-col pt-[340px] pb-[150px] lg:pt-0 lg:pb-[104px] lg:h-full lg:justify-end">
            <div ref={contentRef} className="max-w-xl will-change-transform pointer-events-auto">

              <div data-hero className="flex items-center gap-3.5 mb-6">
                <span style={{ width: '30px', height: '1.5px', background: '#3D67CA' }} />
                <p className="text-[10px] sm:text-[11px] uppercase font-medium"
                   style={{ letterSpacing: '0.3em', color: 'rgba(255,255,255,0.55)' }}>
                  {t.hero.subtitle}
                </p>
              </div>

              <h1 className="font-display" style={{
                fontSize: 'clamp(2.4rem, 4.9vw, 4.5rem)', lineHeight: 0.98,
                letterSpacing: '-0.025em', fontWeight: 600, color: '#fff',
                fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
              }}>
                <span className="block" style={{ paddingBottom: '0.05em' }}>
                  {t.hero.headline.split(' ').map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.24em]">
                      <span data-word className="inline-block">{w}</span>
                    </span>
                  ))}
                </span>
                <span className="block" style={{ paddingBottom: '0.08em' }}>
                  {t.hero.headlineSub.split(' ').map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.24em]">
                      <span data-word className="inline-block italic"
                            style={{ fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 30, "WONK" 0' }}>
                        {w}
                      </span>
                    </span>
                  ))}
                </span>
              </h1>

              <p data-hero className="mt-5 max-w-md leading-relaxed"
                 style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.68)' }}>
                {t.hero.tagline}
              </p>

              <div data-hero className="mt-8 flex items-center gap-6 flex-wrap">
                <button
                  ref={ctaRef}
                  onClick={() => scrollTo('#produkte')}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 text-[14px] font-bold rounded-full transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.40)] will-change-transform"
                  style={{ background: '#fff', color: '#0a0c12' }}
                >
                  {t.hero.ctaBuy}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => scrollTo('#warum-wachs')}
                  className="group inline-flex items-center gap-2 text-[13.5px] font-semibold transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                >
                  <span style={{ borderBottom: '1.5px solid rgba(255,255,255,0.25)', paddingBottom: '2px' }}>
                    {de ? 'Wie funktioniert Heißwachs?' : 'How hot wax works'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              <button
                data-hero
                onClick={() => setDiveOpen(true)}
                className="group mt-5 inline-flex items-center gap-2 text-[12.5px] font-medium transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <Search className="h-3.5 w-3.5" />
                <span style={{ textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(61,103,202,0.6)' }}>
                  {de ? 'Blick ins Wachs' : 'Look inside the wax'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Trust + stats bar at bottom ── */}
        <div data-hero className="absolute bottom-0 inset-x-0 z-[10]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex items-center gap-3 order-2 sm:order-1">
                <span style={{ color: '#3D67CA', letterSpacing: '0.08em', fontSize: '13px' }}>★★★★★</span>
                <span className="text-[8.5px] sm:text-[10.5px] uppercase"
                      style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)' }}>
                  200+ · {de ? '100 % positiv' : '100% positive'} · {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}
                </span>
              </div>
              <div className="flex items-stretch gap-1 order-1 sm:order-2">
                {stats.map((s, i) => (
                  <div key={i} className="px-2.5 sm:px-7 first:pl-0 last:pr-0"
                       style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                    <p data-stat-val className="tabular-nums leading-none"
                       style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontWeight: 500, fontSize: 'clamp(1.05rem, 1.9vw, 1.6rem)', letterSpacing: '-0.02em', color: '#fff' }}>
                      {s.v}
                    </p>
                    <p className="text-[8px] sm:text-[9.5px] uppercase mt-1.5 sm:mt-2 leading-tight max-w-[10ch] sm:max-w-none sm:whitespace-nowrap"
                       style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.4)' }}>
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {diveOpen && (
        <Suspense fallback={null}>
          <WaxDive open={diveOpen} onClose={() => setDiveOpen(false)} de={de} />
        </Suspense>
      )}
    </section>
  );
}
