import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCube } from '@/sections/hero/WaxLensCube';
import { waxLensEnabled } from '@/sections/hero/constants';

// Der „Blick ins Wachs"-Dive (Graph + Diagramme) ist schwer und erst nach dem
// Öffnen nötig — daher aus dem Initial-Bundle gesplittet.
const WaxDive = lazy(() => import('@/sections/hero/WaxDive').then(m => ({ default: m.WaxDive })));

/**
 * Hero (Light) — „Editorial Stage".
 *
 * Eine helle, gerundete Bühne auf dem Seitenhintergrund. Drei Tiefenebenen:
 *  1. Die Wortmarke „Waxcelerate" (Libre Franklin 900, near-black) liegt groß
 *     in der oberen Fläche.
 *  2. Der freistehende Wachs-Cutout (transparentes PNG/WebP) schwebt davor und
 *     verdeckt die Typo — er „tritt" mit weichem Kontaktschatten aus der Fläche.
 *  3. Rechts schneidet ein diagonales, dunkles Ketten-Panel die Bühne an: der
 *     dramatische Hell/Dunkel-Kontrast, der das Produkt im Kontext zeigt.
 *
 * Eine einzige GSAP-Timeline orchestriert die Eröffnung (Bühne → Bild-Settle →
 * fallende Lettern/Wörter → Items → hochzählende Zahlen). Die „Blick ins Wachs"-
 * Lupe (WaxLensCube) folgt dem Cursor über dem Wachs und öffnet den Dive.
 *
 * Alle Farben über CSS-Variablen → Light & Noir ohne JS. Nur die Lupe bekommt
 * (für Kontrast) den aktuellen Modus per `light`-Flag.
 */

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
  const cardRef     = useRef<HTMLDivElement>(null);
  const chainRef    = useRef<HTMLDivElement>(null);
  const cubeBoxRef  = useRef<HTMLDivElement>(null);   // statische Geometrie (Lupe sampelt diese)
  const cubeAnimRef = useRef<HTMLDivElement>(null);   // Settle / Float / Parallax
  const wordRef     = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLButtonElement>(null);
  const animated    = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    animated.current = true;

    const letters = root.querySelectorAll<HTMLElement>('[data-letter]');
    const words   = root.querySelectorAll<HTMLElement>('[data-word]');
    const items   = root.querySelectorAll<HTMLElement>('[data-hero]');
    const statEls = root.querySelectorAll<HTMLElement>('[data-stat-val]');
    const chain   = chainRef.current;
    const cube    = cubeAnimRef.current;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduced) {
      gsap.set([letters, words], { yPercent: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(card, { opacity: 1, y: 0 });
      if (chain) gsap.set(chain, { opacity: 1, scale: 1 });
      if (cube)  gsap.set(cube, { opacity: 1, scale: 1, y: 0 });
      return;
    }

    // ── Eröffnung: eine durchkomponierte Timeline ─────────────────────────────
    const tl = gsap.timeline({ delay: 0.05, defaults: { ease: 'power3.out' } });

    // Bühne hebt sich leise vom Seitenhintergrund ab.
    tl.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 0);
    // Ketten-Panel: diagonaler Wisch von rechts + cineastischer Bild-Settle.
    if (chain) {
      tl.fromTo(chain, { opacity: 0, xPercent: 6, scale: 1.08 },
        { opacity: 1, xPercent: 0, scale: 1.015, duration: 1.5, ease: 'power3.out' }, 0.15);
    }
    // Wachs-Cutout schwebt herein und settled — leichter Drop + Scale.
    if (cube) {
      tl.fromTo(cube, { opacity: 0, y: -26, scale: 1.05 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }, 0.35);
    }
    // Lupe-Ring/Feld (in der Cube-Box, nicht im Anim-Wrapper) sanft mit einblenden.
    if (cubeBoxRef.current) {
      tl.fromTo(cubeBoxRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.4);
    }
    // Wortmarke: jeder Buchstabe fällt von oben hinter den Block.
    tl.fromTo(letters, { yPercent: -115 },
      { yPercent: 0, duration: 0.85, ease: 'back.out(1.25)', stagger: { each: 0.042 } }, 0.3);
    // Headline-Wörter im selben Rhythmus.
    tl.fromTo(words, { yPercent: -120 },
      { yPercent: 0, duration: 0.74, ease: 'back.out(1.25)', stagger: 0.13 }, 0.82);
    tl.fromTo(items, { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 1.05);

    // Zahlen zählen hoch — exakt mit dem Items-Fade als ein Beat.
    if (statEls[0]) {
      const el0 = statEls[0]; const c0 = { val: 0 };
      tl.to(c0, { val: 3, duration: 0.9, ease: 'power2.out', snap: { val: 1 },
        onStart() { el0.textContent = '0×'; }, onUpdate() { el0.textContent = c0.val + '×'; } }, 1.2);
    }
    if (statEls[1]) {
      const el1 = statEls[1]; const c1 = { val: 0 };
      tl.to(c1, { val: 70, duration: 1.1, ease: 'power2.out', snap: { val: 1 },
        onStart() { el1.textContent = '~€0'; }, onUpdate() { el1.textContent = '~€' + c1.val; } }, 1.2);
    }
    if (statEls[2]) {
      tl.fromTo(statEls[2], { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.55);
    }

    // Idle-Float: der Cutout atmet ganz leise weiter — Leben ohne Ablenkung.
    let floatTween: gsap.core.Tween | undefined;
    if (cube) {
      floatTween = gsap.to(cube, { y: '+=8', duration: 4.2, ease: 'sine.inOut',
        repeat: -1, yoyo: true, delay: 1.6 });
    }

    // ── Scroll: Tiefen-Drift ──────────────────────────────────────────────────
    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }));
    if (chain) scrub(gsap.to(chain, { yPercent: 6, ease: 'none' }));
    if (cubeBoxRef.current) scrub(gsap.to(cubeBoxRef.current, { yPercent: 5, ease: 'none' }));
    if (wordRef.current) scrub(gsap.to(wordRef.current, { yPercent: -9, ease: 'none' }));
    if (contentRef.current) scrub(gsap.to(contentRef.current, { y: -40, opacity: 0.3, ease: 'none' }));

    // ── Cursor-Tiefe: Ebenen folgen der Maus unterschiedlich stark ────────────
    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer) {
      const qCubeX = cube ? gsap.quickTo(cube, 'x', { duration: 1.0, ease: 'power3.out' }) : null;
      const qChainX = chain ? gsap.quickTo(chain, 'x', { duration: 1.2, ease: 'power3.out' }) : null;
      const qChainY = chain ? gsap.quickTo(chain, 'y', { duration: 1.2, ease: 'power3.out' }) : null;
      const qWordX = wordRef.current ? gsap.quickTo(wordRef.current, 'x', { duration: 1.3, ease: 'power3.out' }) : null;
      onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        if (qCubeX) qCubeX(nx * 7);
        if (qChainX) qChainX(nx * -12);
        if (qChainY) qChainY(ny * -8);
        if (qWordX) qWordX(nx * -4);
      };
      card.addEventListener('mousemove', onMove);
    }

    // Magnetischer Primär-CTA.
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
    <section id="home" ref={rootRef} className="hero-editorial relative" style={{ background: 'var(--pg)' }}>
        {/* Bühne — full-bleed, edge-to-edge */}
        <div
          ref={cardRef}
          className="hero-stage relative overflow-hidden min-h-[100svh] lg:h-[100svh] lg:min-h-[640px]"
        >

          {/* ── Ketten-Panel — mobil oben als Band, ab lg rechts (diagonal) ── */}
          <div
            ref={chainRef}
            className="hero-chain-clip absolute z-[3] will-change-transform
                       top-0 inset-x-0 h-[300px]
                       lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[49%]"
          >
            <picture>
              <source srcSet="/images/hero/chain.webp" type="image/webp" />
              <img
                src="/images/hero/chain.jpg"
                alt={de ? 'Gewachste Fahrradkette mit Kettenschloss auf Schiefer' : 'Waxed bicycle chain with quick-link on slate'}
                className="absolute inset-0 w-full h-full object-cover object-[58%_30%] lg:object-[34%_40%]"
                fetchPriority="high"
              />
            </picture>
            {/* Seam scrim — scharfer Übergang zur Lichtfläche */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, rgba(6,8,16,0.80) 0%, rgba(6,8,16,0.32) 22%, transparent 44%)' }} />
            {/* Cinematic vignette — ovales Tiefendunkel + Top/Bottom letterbox */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse 130% 75% at 95% 50%, transparent 40%, rgba(4,6,16,0.45) 100%), linear-gradient(180deg, rgba(4,6,16,0.28) 0%, transparent 22%, transparent 68%, rgba(4,6,16,0.38) 100%)' }} />
          </div>

          {/* Feine Naht-Linie entlang der Diagonale (Akzent) — nur Desktop */}
          <div aria-hidden className="absolute inset-y-0 right-0 z-[4] pointer-events-none hidden lg:block"
               style={{ width: '49%' }}>
            <div className="absolute inset-0"
                 style={{
                   clipPath: 'polygon(20% 0, 20.22% 0, 2.22% 100%, 2% 100%)',
                   WebkitClipPath: 'polygon(20% 0, 20.22% 0, 2.22% 100%, 2% 100%)',
                   background: 'linear-gradient(180deg, rgba(46,120,200,0) 0%, rgba(46,120,200,0.85) 50%, rgba(46,120,200,0) 100%)',
                 }} />
          </div>

          {/* ── Ebene: Wortmarke „Waxcelerate" (hinter dem Cutout) ── */}
          <div
            ref={wordRef}
            aria-hidden
            className="absolute left-0 right-0 top-[120px] lg:top-[15.5%] z-[6] lg:z-[2] pointer-events-none select-none px-6 sm:px-10 lg:px-14 xl:px-20 will-change-transform"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center lg:justify-start">
                <div
                  className="whitespace-nowrap text-white lg:text-[color:var(--tx1)]"
                  style={{
                    fontFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(1.9rem, 6.8vw, 7rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.008em',
                  }}
                >
                  {BRAND.map((ch, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom">
                      <span data-letter className="inline-block">{ch}</span>
                    </span>
                  ))}
                </div>
              </div>
              {/* Masthead-Haarlinie — organisiert die Wortmarke als Kopf der Seite.
                  Bleibt in der hellen Zone (endet vor der Ketten-Diagonale). */}
              <div data-hero className="hidden lg:flex items-center gap-4 mt-5 w-[38%]">
                <span className="h-px flex-1" style={{ background: 'var(--bd)' }} />
                <span className="text-[10.5px] uppercase whitespace-nowrap" style={{ letterSpacing: '0.28em', color: 'var(--tx2)' }}>
                  Made in Germany · Stuttgart
                </span>
              </div>
            </div>
          </div>

          {/* Specimen haze — weicher Lichthof hinter dem Cutout, Desktop only */}
          <div
            aria-hidden
            className="absolute z-[3] pointer-events-none hidden lg:block"
            style={{
              left: '53%',
              top: '54%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(300px, 34vw, 480px)',
              height: 'clamp(300px, 34vw, 480px)',
              background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(232,238,252,0.28) 0%, transparent 70%)',
              filter: 'blur(32px)',
            }}
          />

          {/* ── Ebene: freistehender Wachs-Cutout (vor der Typo) ── */}
          {/* Statische Box = Geometrie für die Lupe; Animation auf innerem Wrapper. */}
          <div
            ref={cubeBoxRef}
            className="absolute z-[5] pointer-events-none will-change-transform
                       left-1/2 -translate-x-1/2 top-[244px] -translate-y-1/2
                       w-[clamp(150px,42vw,210px)]
                       lg:left-[53%] lg:top-[54%] lg:translate-y-[-50%] lg:w-[clamp(250px,27vw,410px)]"
          >
            <div ref={cubeAnimRef} className="relative will-change-transform"
                 style={{ filter: 'drop-shadow(0 40px 55px rgba(18,24,40,0.30)) drop-shadow(0 12px 20px rgba(18,24,40,0.18))' }}>
              <picture>
                <source srcSet="/images/hero/wax-cutout.webp" type="image/webp" />
                <img
                  src="/images/hero/wax-cutout.png"
                  alt={de ? 'Waxcelerate Heißwachs-Block' : 'Waxcelerate hot wax block'}
                  className="block w-full h-auto"
                  fetchPriority="high"
                />
              </picture>
              {/* Lit-Sheen — auf die Specimen-Silhouette geclippt: weiches Licht von
                  oben-links gibt dem Block Volumen/Glanz (Material, premium). */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  WebkitMaskImage: 'url(/images/hero/wax-cutout-mask.png)',
                  maskImage: 'url(/images/hero/wax-cutout-mask.png)',
                  WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
                  WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                  background: 'linear-gradient(132deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0) 50%, rgba(8,14,30,0.18) 100%)',
                  mixBlendMode: 'soft-light',
                }}
              />
            </div>

          </div>

          {/* „Blick ins Wachs"-Lupe — folgt dem Cursor über dem Cutout */}
          <WaxLensCube cubeRef={cubeBoxRef} enabled={lensOn} light={light} de={de}
                       onOpen={openDive} onActiveChange={setLensActive} />

          {/* Klick-Hotspot über dem Cutout (Desktop) — „Blick ins Wachs" */}
          <button
            type="button"
            onClick={() => setDiveOpen(true)}
            aria-label={de ? 'Blick ins Wachs — Inhaltsstoffe ansehen' : 'Look inside the wax — see the ingredients'}
            className="group hidden lg:block absolute z-[6]"
            style={{ left: '53%', top: '54%', width: 'clamp(250px,27vw,410px)', height: 'clamp(250px,27vw,410px)',
                     transform: 'translate(-50%,-50%)', cursor: lensOn && lensActive ? 'none' : 'pointer' }}
          />

          {/* Frosted-Footer — die Kette verläuft am Fuß in die Lichtfläche, damit
              das Daten-Band (dunkel auf hell) auch rechts lesbar bleibt */}
          <div aria-hidden className="hero-footer-fade absolute inset-x-0 bottom-0 z-[8] pointer-events-none h-[120px]" />

          {/* Top-Fade — Nav-Lesbarkeit über dem full-bleed Hero */}
          <div aria-hidden className="hero-topfade absolute top-0 inset-x-0 h-[116px] z-[7] pointer-events-none" />

          {/* Feines Film-Grain über der gesamten Bühne — Material & Wärme */}
          <div aria-hidden className="hero-grain absolute inset-0 z-[9] pointer-events-none" />

          {/* Editorial Side-Rail — vertikaler Index am linken Rand (nur xl) */}
          <div
            data-hero
            aria-hidden
            className="hidden xl:flex absolute left-7 top-1/2 -translate-y-1/2 z-[7] flex-col items-center gap-5 pointer-events-none"
          >
            <span className="num-data text-[10px]" style={{ color: 'var(--txf)', letterSpacing: '0.12em' }}>Nº 01</span>
            <span className="w-px h-24" style={{ background: 'linear-gradient(to bottom, transparent, var(--bd), transparent)' }} />
            <span
              className="text-[9.5px] uppercase font-medium"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.36em', color: 'var(--txf)' }}
            >
              {de ? 'Heißwachs-System' : 'Hot-wax system'}
            </span>
          </div>

          {/* ── Ebene: Content links ── */}
          <div className="relative z-[10] w-full lg:h-full px-6 sm:px-10 lg:px-14 xl:px-20 pointer-events-none">
            <div className="max-w-7xl mx-auto flex flex-col pt-[316px] pb-[150px] lg:pt-0 lg:pb-[104px] lg:h-full lg:justify-end">
              <div ref={contentRef} className="max-w-xl will-change-transform pointer-events-auto">

                {/* Eyebrow — ruhiger Kicker mit feiner Akzentlinie */}
                <div data-hero className="flex items-center gap-3.5 mb-6">
                  <span style={{ width: '30px', height: '1.5px', background: 'var(--brand-blue)' }} />
                  <p className="text-[10px] sm:text-[11px] uppercase font-medium"
                     style={{ letterSpacing: '0.3em', color: 'var(--txm)' }}>
                    {t.hero.subtitle}
                  </p>
                </div>

                {/* Headline */}
                <h1 className="font-display" style={{
                  fontSize: 'clamp(2.4rem, 4.9vw, 4.5rem)', lineHeight: 0.98,
                  letterSpacing: '-0.025em', fontWeight: 600, color: 'var(--tx1)',
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

                {/* Nutzen */}
                <p data-hero className="mt-5 max-w-md leading-relaxed"
                   style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'var(--tx2)' }}>
                  {t.hero.tagline}
                </p>

                {/* CTAs — eine laute Primäraktion, der Rest leise */}
                <div data-hero className="mt-8 flex items-center gap-6 flex-wrap">
                  <button
                    ref={ctaRef}
                    onClick={() => scrollTo('#produkte')}
                    className="group inline-flex items-center gap-2.5 px-8 py-4 text-[14px] font-bold rounded-full transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(17,19,24,0.30)] will-change-transform"
                    style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
                  >
                    {t.hero.ctaBuy}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => scrollTo('#warum-wachs')}
                    className="group inline-flex items-center gap-2 text-[13.5px] font-semibold transition-colors duration-200"
                    style={{ color: 'var(--tx1)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--tx1)'; }}
                  >
                    <span style={{ borderBottom: '1.5px solid var(--bd)', paddingBottom: '2px' }}>
                      {de ? 'Wie funktioniert Heißwachs?' : 'How hot wax works'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                {/* „Blick ins Wachs" — eigene, leise Zeile (Lupe-Geste) */}
                <button
                  data-hero
                  onClick={() => setDiveOpen(true)}
                  className="group mt-5 inline-flex items-center gap-2 text-[12.5px] font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--txm)' }}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span style={{ textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(46,120,200,0.5)' }}>
                    {de ? 'Blick ins Wachs' : 'Look inside the wax'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Trust + Daten — Band am Fuß der Bühne */}
          <div data-hero className="absolute bottom-0 inset-x-0 z-[10]">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5"
                   style={{ borderTop: '1px solid var(--bd)' }}>
                <div className="flex items-center gap-3 order-2 sm:order-1">
                  <span style={{ color: 'var(--brand-blue)', letterSpacing: '0.08em', fontSize: '13px' }}>★★★★★</span>
                  <span className="text-[8.5px] sm:text-[10.5px] uppercase"
                        style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', letterSpacing: '0.06em', color: 'var(--txm)' }}>
                    200+ · {de ? '100 % positiv' : '100% positive'} · {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}
                  </span>
                </div>
                <div className="flex items-stretch gap-1 order-1 sm:order-2">
                  {stats.map((s, i) => (
                    <div key={i} className="px-2.5 sm:px-7 first:pl-0 last:pr-0"
                         style={{ borderLeft: i > 0 ? '1px solid var(--bd)' : 'none' }}>
                      <p data-stat-val className="tabular-nums leading-none"
                         style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontWeight: 500, fontSize: 'clamp(1.05rem, 1.9vw, 1.6rem)', letterSpacing: '-0.02em', color: 'var(--tx1)' }}>
                        {s.v}
                      </p>
                      <p className="text-[8px] sm:text-[9.5px] uppercase mt-1.5 sm:mt-2 leading-tight max-w-[10ch] sm:max-w-none sm:whitespace-nowrap"
                         style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', letterSpacing: '0.04em', color: 'var(--txm)' }}>
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
