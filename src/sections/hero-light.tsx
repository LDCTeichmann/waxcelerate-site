import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCube } from '@/sections/hero/WaxLensCube';
import { waxLensEnabled } from '@/sections/hero/constants';

const WaxDive = lazy(() => import('@/sections/hero/WaxDive').then(m => ({ default: m.WaxDive })));

const BRAND = 'Waxcelerate'.split('');
const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

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
      tl.fromTo(bg, { scale: 1.06 },
        { scale: 1, duration: 2.0, ease: 'power2.out' }, 0);
    }

    if (cube) {
      tl.fromTo(cube, { opacity: 0, y: -36, scale: 1.08 },
        { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'power3.out' }, 0.25);
    }
    if (cubeBoxRef.current) {
      tl.fromTo(cubeBoxRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.3);
    }

    tl.fromTo(letters, { yPercent: -120 },
      { yPercent: 0, duration: 0.9, ease: 'back.out(1.15)', stagger: { each: 0.038 } }, 0.2);

    tl.fromTo(words, { yPercent: -120 },
      { yPercent: 0, duration: 0.78, ease: 'back.out(1.2)', stagger: 0.12 }, 0.72);
    tl.fromTo(items, { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 0.95);

    if (statEls[0]) {
      const el0 = statEls[0]; const c0 = { val: 0 };
      tl.to(c0, { val: 3, duration: 0.9, ease: 'power2.out', snap: { val: 1 },
        onStart() { el0.textContent = '0×'; }, onUpdate() { el0.textContent = c0.val + '×'; } }, 1.1);
    }
    if (statEls[1]) {
      const el1 = statEls[1]; const c1 = { val: 0 };
      tl.to(c1, { val: 70, duration: 1.1, ease: 'power2.out', snap: { val: 1 },
        onStart() { el1.textContent = '~€0'; }, onUpdate() { el1.textContent = '~€' + c1.val; } }, 1.1);
    }
    if (statEls[2]) {
      tl.fromTo(statEls[2], { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.45);
    }

    let floatTween: gsap.core.Tween | undefined;
    if (cube) {
      floatTween = gsap.to(cube, { y: '+=7', duration: 4.5, ease: 'sine.inOut',
        repeat: -1, yoyo: true, delay: 1.8 });
    }

    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }));
    if (bg) scrub(gsap.to(bg, { yPercent: 10, ease: 'none' }));
    if (cubeBoxRef.current) scrub(gsap.to(cubeBoxRef.current, { yPercent: 6, ease: 'none' }));
    if (wordRef.current) scrub(gsap.to(wordRef.current, { yPercent: -10, ease: 'none' }));
    if (contentRef.current) scrub(gsap.to(contentRef.current, { y: -40, opacity: 0.2, ease: 'none' }));

    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer) {
      const qCubeX = cube ? gsap.quickTo(cube, 'x', { duration: 1.0, ease: 'power3.out' }) : null;
      const qBgX = bg ? gsap.quickTo(bg, 'x', { duration: 1.4, ease: 'power3.out' }) : null;
      const qBgY = bg ? gsap.quickTo(bg, 'y', { duration: 1.4, ease: 'power3.out' }) : null;
      const qWordX = wordRef.current ? gsap.quickTo(wordRef.current, 'x', { duration: 1.3, ease: 'power3.out' }) : null;
      onMove = (e: MouseEvent) => {
        const r = stage.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        if (qCubeX) qCubeX(nx * 8);
        if (qBgX) qBgX(nx * -12);
        if (qBgY) qBgY(ny * -7);
        if (qWordX) qWordX(nx * -5);
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
    <section id="home" ref={rootRef} className="hero-editorial relative" style={{ background: '#080a10' }}>
      <div
        ref={stageRef}
        className="hero-stage relative overflow-hidden min-h-[100svh] lg:h-[100svh] lg:min-h-[640px]"
      >

        {/* ── Full-bleed chain background with parallax ── */}
        <div ref={bgRef} className="absolute inset-[-4%] z-[1] will-change-transform">
          <img
            src="/images/hero/chain-bg.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '58% 32%' }}
            fetchPriority="high"
          />
          {/* Cinematic grade: darken left for text, keep right lighter for wax */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(105deg, rgba(4,6,14,0.82) 0%, rgba(4,6,14,0.55) 35%, rgba(4,6,14,0.28) 55%, rgba(4,6,14,0.42) 100%)',
          }} />
          {/* Vertical letterbox */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(4,6,14,0.38) 0%, transparent 25%, transparent 55%, rgba(4,6,14,0.72) 100%)',
          }} />
          {/* Vignette */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 70% 65% at 55% 48%, transparent 30%, rgba(4,6,14,0.35) 100%)',
          }} />
        </div>

        {/* ── Brand: "Waxcelerate" — massive, spanning full width ── */}
        <div
          ref={wordRef}
          aria-hidden
          className="absolute inset-x-0 z-[2] pointer-events-none select-none will-change-transform"
          style={{ top: 'clamp(90px, 13vh, 160px)' }}
        >
          <div className="flex justify-center px-4">
            <div
              className="whitespace-nowrap"
              style={{
                fontFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(2.5rem, 11.5vw, 12rem)',
                lineHeight: 0.88,
                letterSpacing: '-0.025em',
                color: 'rgba(255,255,255,0.92)',
                textShadow: '0 4px 60px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
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

        {/* ── Wax block — clean photo with CSS rounded clip ── */}
        <div
          ref={cubeBoxRef}
          className="absolute z-[5] pointer-events-none will-change-transform
                     left-1/2 -translate-x-1/2 top-[200px]
                     w-[clamp(180px,50vw,250px)]
                     lg:left-[56%] lg:top-[50%] lg:-translate-y-1/2 lg:w-[clamp(300px,28vw,420px)]"
        >
          <div ref={cubeAnimRef} className="relative will-change-transform">
            <div className="relative overflow-hidden"
                 style={{
                   borderRadius: 'clamp(24px, 4vw, 44px)',
                   boxShadow: '0 50px 80px rgba(0,0,0,0.50), 0 20px 30px rgba(0,0,0,0.30), 0 0 60px rgba(61,103,202,0.12), 0 0 0 1px rgba(255,255,255,0.08)',
                 }}>
              <img
                src="/images/hero/wax-hero.jpg"
                alt={de ? 'Waxcelerate Heißwachs-Block' : 'Waxcelerate hot wax block'}
                className="block w-full h-auto"
                style={{ aspectRatio: '12 / 13', objectFit: 'cover', objectPosition: 'center 35%' }}
                fetchPriority="high"
              />
              {/* Subtle gloss overlay */}
              <div className="absolute inset-0 pointer-events-none"
                   style={{
                     background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 35%, transparent 50%, rgba(0,0,0,0.10) 100%)',
                   }} />
            </div>
          </div>
        </div>

        {/* WaxLensCube */}
        <WaxLensCube cubeRef={cubeBoxRef} enabled={lensOn} light={light} de={de}
                     onOpen={openDive} onActiveChange={setLensActive} />

        {/* Click hotspot over the cutout (desktop) */}
        <button
          type="button"
          onClick={() => setDiveOpen(true)}
          aria-label={de ? 'Blick ins Wachs — Inhaltsstoffe ansehen' : 'Look inside the wax — see the ingredients'}
          className="group hidden lg:block absolute z-[6]"
          style={{ left: '56%', top: '50%', width: 'clamp(300px,28vw,420px)', height: 'clamp(300px,28vw,420px)',
                   transform: 'translate(-50%,-50%)', cursor: lensOn && lensActive ? 'none' : 'pointer' }}
        />

        {/* Top fade */}
        <div aria-hidden className="absolute top-0 inset-x-0 h-[100px] z-[7] pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, rgba(4,6,14,0.40), transparent)' }} />

        {/* Film grain */}
        <div aria-hidden className="hero-grain absolute inset-0 z-[9] pointer-events-none" />

        {/* ── Content — left, lower third ── */}
        <div className="relative z-[10] w-full lg:h-full px-6 sm:px-10 lg:px-14 xl:px-20 pointer-events-none">
          <div className="max-w-7xl mx-auto flex flex-col pt-[360px] pb-[140px] lg:pt-0 lg:pb-[110px] lg:h-full lg:justify-end">
            <div ref={contentRef} className="max-w-lg will-change-transform pointer-events-auto">

              {/* Eyebrow */}
              <div data-hero className="flex items-center gap-3.5 mb-5">
                <span style={{ width: '28px', height: '2px', background: '#3D67CA' }} />
                <p className="text-[10.5px] sm:text-[11.5px] uppercase font-semibold"
                   style={{ letterSpacing: '0.28em', color: 'rgba(255,255,255,0.58)' }}>
                  {t.hero.subtitle}
                </p>
              </div>

              {/* Headline */}
              <h1 className="font-display" style={{
                fontSize: 'clamp(2.8rem, 5.5vw, 5rem)', lineHeight: 0.94,
                letterSpacing: '-0.03em', fontWeight: 700, color: '#fff',
              }}>
                <span className="block" style={{ paddingBottom: '0.06em' }}>
                  {t.hero.headline.split(' ').map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                      <span data-word className="inline-block">{w}</span>
                    </span>
                  ))}
                </span>
                <span className="block" style={{ paddingBottom: '0.08em' }}>
                  {t.hero.headlineSub.split(' ').map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                      <span data-word className="inline-block italic"
                            style={{ fontWeight: 500, color: 'rgba(255,255,255,0.90)' }}>
                        {w}
                      </span>
                    </span>
                  ))}
                </span>
              </h1>

              {/* Benefit line */}
              <p data-hero className="mt-5 max-w-[26rem] leading-[1.65]"
                 style={{ fontSize: 'clamp(0.94rem, 1.35vw, 1.05rem)', color: 'rgba(255,255,255,0.65)' }}>
                {t.hero.tagline}
              </p>

              {/* CTAs */}
              <div data-hero className="mt-8 flex items-center gap-5 flex-wrap">
                <button
                  ref={ctaRef}
                  onClick={() => scrollTo('#produkte')}
                  className="group inline-flex items-center gap-2.5 px-8 py-[15px] text-[14px] font-bold rounded-full transition-all duration-300 hover:shadow-[0_18px_44px_rgba(0,0,0,0.45)] will-change-transform"
                  style={{ background: '#fff', color: '#0a0c12' }}
                >
                  {t.hero.ctaBuy}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => scrollTo('#warum-wachs')}
                  className="group inline-flex items-center gap-2 text-[13.5px] font-semibold transition-colors duration-200 hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.72)' }}
                >
                  <span style={{ borderBottom: '1.5px solid rgba(255,255,255,0.20)', paddingBottom: '2px' }}>
                    {de ? 'Wie funktioniert Heißwachs?' : 'How hot wax works'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {/* "Blick ins Wachs" */}
              <button
                data-hero
                onClick={() => setDiveOpen(true)}
                className="group mt-5 inline-flex items-center gap-2 text-[12.5px] font-medium transition-opacity hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.48)' }}
              >
                <Search className="h-3.5 w-3.5" />
                <span style={{ textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(61,103,202,0.5)' }}>
                  {de ? 'Blick ins Wachs' : 'Look inside the wax'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Trust + stats bar ── */}
        <div data-hero className="absolute bottom-0 inset-x-0 z-[10]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
              <div className="flex items-center gap-3 order-2 sm:order-1">
                <span style={{ color: '#4A7AE8', letterSpacing: '0.06em', fontSize: '12px' }}>★★★★★</span>
                <span className="text-[8.5px] sm:text-[10.5px] uppercase"
                      style={{ fontFamily: MONO, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' }}>
                  200+ · {de ? '100 % positiv' : '100% positive'} · {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}
                </span>
              </div>
              <div className="flex items-stretch gap-0 order-1 sm:order-2">
                {stats.map((s, i) => (
                  <div key={i} className="px-2.5 sm:px-7 first:pl-0 last:pr-0"
                       style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.10)' : 'none' }}>
                    <p data-stat-val className="tabular-nums leading-none"
                       style={{ fontFamily: MONO, fontWeight: 600, fontSize: 'clamp(1.1rem, 2vw, 1.65rem)', letterSpacing: '-0.02em', color: '#fff' }}>
                      {s.v}
                    </p>
                    <p className="text-[8px] sm:text-[9.5px] uppercase mt-1.5 sm:mt-2 leading-tight max-w-[10ch] sm:max-w-none sm:whitespace-nowrap"
                       style={{ fontFamily: MONO, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.42)' }}>
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
