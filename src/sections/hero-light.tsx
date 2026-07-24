import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCutout } from '@/sections/hero/WaxLensCutout';
import { waxLensEnabled } from '@/sections/hero/constants';

const WaxDive = lazy(() => import('@/sections/hero/WaxDive').then(m => ({ default: m.WaxDive })));

// chain-bg.jpg is now a pre-cropped 1653×918 (1.8:1) slice of the source photo,
// chosen so the calm slate surface (with the loose chain-link detail) occupies
// the left ~60% and the woven chain pattern occupies the right ~40% — instead
// of the old crop straddling the slate/chain boundary at roughly the frame's
// midpoint, which put both the wax block and the text in the busiest, most
// pattern-heavy part of the photo.
const BG_POS = '48% 38%';

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [diveOpen, setDiveOpen] = useState(false);
  const [lensOn] = useState(() => waxLensEnabled());

  const openDive = useCallback(() => setDiveOpen(true), []);

  const rootRef      = useRef<HTMLElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const blockRef   = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    const cardInner = cardInnerRef.current;
    if (!root || !card || !cardInner) return;

    const words   = root.querySelectorAll<HTMLElement>('[data-word]');
    const items   = root.querySelectorAll<HTMLElement>('[data-hero]');
    const imgLayers = [imgRef.current, blockRef.current].filter(Boolean) as HTMLElement[];

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduced) {
      gsap.set(words, { yPercent: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(cardInner, { opacity: 1, y: 0 });
      gsap.set(imgLayers, { scale: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.05, defaults: { ease: 'power4.out' } });

    tl.fromTo(cardInner, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0);
    tl.fromTo(imgLayers, { scale: 1.06 }, { scale: 1.01, duration: 2.4, ease: 'power2.out' }, 0);
    tl.fromTo(
      words,
      { yPercent: -120 },
      { yPercent: 0, duration: 0.72, ease: 'back.out(1.3)', stagger: 0.15 },
      0.75,
    );
    tl.fromTo(items, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 1.0);

    const statEls = root.querySelectorAll<HTMLElement>('[data-stat-val]');
    if (statEls[0]) {
      const el0 = statEls[0];
      const c0 = { val: 0 };
      gsap.to(c0, { val: 3, duration: 0.9, delay: 1.2, ease: 'power2.out', snap: { val: 1 },
        onStart() { el0.textContent = '0×'; },
        onUpdate() { el0.textContent = c0.val + '×'; },
      });
    }
    if (statEls[1]) {
      const el1 = statEls[1];
      const c1 = { val: 0 };
      gsap.to(c1, { val: 70, duration: 1.1, delay: 1.2, ease: 'power2.out', snap: { val: 1 },
        onStart() { el1.textContent = '~€0'; },
        onUpdate() { el1.textContent = '~€' + c1.val; },
      });
    }

    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(
        ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }),
      );
    scrub(gsap.to(imgLayers, { yPercent: 4, ease: 'none' }));
    if (contentRef.current) scrub(gsap.to(contentRef.current, { y: -40, opacity: 0.25, ease: 'none' }));
    scrub(gsap.to(cardInner, { scale: 0.965, transformOrigin: '50% 100%', ease: 'none' }));


    let onMove:  ((e: MouseEvent) => void) | undefined;
    if (finePointer) {
      const qImg = imgLayers.map((el) => [
        gsap.quickTo(el, 'x', { duration: 1.0, ease: 'power3.out' }),
        gsap.quickTo(el, 'y', { duration: 1.0, ease: 'power3.out' }),
      ]);
      onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        // Browsers fire a "resync" mousemove reflecting wherever the cursor is
        // already resting the moment a page (re)loads under it — no actual
        // movement needed. Right after a reload the card can also still be
        // mid-layout (fonts/images not settled), so `r` itself can briefly be
        // wrong. Either one turns nx/ny into an unbounded value, and since
        // quickTo eases toward whatever it's given, that's what produced the
        // "slides up on every reload" glitch. Clamping to the intended ±0.5
        // range makes the offset safe regardless of what triggered it.
        if (r.width < 10 || r.height < 10) return;
        const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
        const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
        qImg.forEach(([qx, qy]) => { qx(nx * -10); qy(ny * -7); });
      };
      card.addEventListener('mousemove', onMove);
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
      if (onMove)  card.removeEventListener('mousemove', onMove);
      if (cta && ctaMove)  cta.removeEventListener('mousemove', ctaMove);
      if (cta && ctaLeave) cta.removeEventListener('mouseleave', ctaLeave);
      triggers.forEach((s) => s.kill());
      tl.kill();
    };
  }, []);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const stats = [
    { v: '3×',    l: de ? 'Kettenlaufzeit'    : 'chain life',     lm: de ? 'Laufzeit'     : 'chain life'    },
    { v: '~€70',  l: de ? 'gespart · 12.000 km' : 'saved · 12,000 km', lm: de ? 'gespart' : 'saved' },
    { v: '1 Tag', l: de ? 'Versand nach Bestellung' : 'ships after order', lm: de ? 'Versand' : 'shipping' },
  ];

  const bgImg = (
    <img
      src="/images/hero/chain-bg.jpg"
      alt={de ? 'Fahrradkette auf Schiefer' : 'Bicycle chain on slate'}
      className="absolute inset-0 w-full h-full object-cover hero-img"
      style={{
        objectPosition: BG_POS,
        transform: 'scale(1.035)',
        filter: 'blur(1.4px) saturate(0.95) brightness(0.92)',
      }}
      fetchPriority="high"
    />
  );

  const waxImg = (
    <picture>
      <source srcSet="/images/hero/wax-cutout.webp" type="image/webp" />
      <img
        src="/images/hero/wax-cutout.png"
        alt={de ? 'Waxcelerate Heißwachs-Block' : 'Waxcelerate hot wax block'}
        className="block w-full h-auto"
        style={{ aspectRatio: '885 / 900' }}
        fetchPriority="high"
      />
    </picture>
  );

  return (
    <section id="home" ref={rootRef} className="hero-editorial relative" style={{ background: 'var(--pg)' }}>
      <div className="px-3 sm:px-4 lg:px-6 pt-[84px] lg:pt-[104px] pb-3 sm:pb-4 lg:pb-6">
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[20px] sm:rounded-[28px]
                     h-[86dvh] sm:h-[min(calc(100dvh-108px),78vw)] lg:h-[min(calc(100dvh-134px),64vw)] min-h-[520px] sm:min-h-[540px]"
          style={{
            background: 'var(--hero-stage)',
            boxShadow: '0 28px 90px rgba(10,10,16,0.22), 0 4px 18px rgba(10,10,16,0.10)',
          }}
        >
        {/* Transform lives on this inner layer, separate from the rounded+clipped
            outer card — a rounded/overflow-hidden element that ALSO carries a live
            GSAP transform is a known Chromium compositing trap: the corner clip can
            render square for a frame right as the transform layer promotes. Keeping
            the clip static and transforming only this inner box avoids it. */}
        <div ref={cardInnerRef} className="absolute inset-0 will-change-transform">
          {/* Idle background drift (optional): a slow independent pan here would
              compete with the GSAP-driven transform already applied to this same
              element (entrance scale, scroll-scrub, cursor parallax) — both would
              write to `transform` on every frame and fight each other. Doing it
              properly means a dedicated extra layer, which isn't free performance-
              wise (another full-bleed image paint). Skipping for now; revisit only
              if the parallax layer gets refactored to a single GSAP timeline that
              could own a subtle idle loop too. */}
          <div ref={imgRef} className="absolute inset-0 will-change-transform">
            {bgImg}
          </div>

          {/* Blur already pushes the chain to atmospheric bokeh; this overlay only
              needs to add a touch more depth + tame the brightest specular hits,
              not do all the "background" work by itself. */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{ background: 'rgba(var(--scrim-rgb),0.32)' }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{ background: 'linear-gradient(90deg, rgba(var(--scrim-rgb),0.30) 0%, transparent 40%)' }}
          />
          {/* Focused scrim directly behind the text column — the global overlay above
              stays light enough to keep the chain recognizable, so contrast for the
              headline/stats needs its own local boost instead of a sitewide darken. */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{ background: 'radial-gradient(ellipse 82% 105% at 0% 100%, rgba(var(--scrim-rgb),0.82) 0%, rgba(var(--scrim-rgb),0.48) 40%, transparent 68%)' }}
          />
          <div
            className="absolute top-0 inset-x-0 h-20 pointer-events-none z-[1]"
            style={{ background: 'linear-gradient(to bottom, rgba(var(--scrim-rgb),0.25), transparent)' }}
          />
          {/* Stats row spans the full card width, so it can sit over the chain-weave
              side of the photo where the bottom-left radial scrim above doesn't
              reach — this band gives that whole row reliable contrast on its own,
              independent of which part of the photo is behind it. */}
          <div
            className="absolute bottom-0 inset-x-0 h-36 pointer-events-none z-[1]"
            style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.58), transparent)' }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[82%] pointer-events-none z-[4] sm:hidden"
            style={{
              background:
                'linear-gradient(to top, rgba(var(--scrim-rgb),0.72) 0%, rgba(var(--scrim-rgb),0.50) 30%, rgba(var(--scrim-rgb),0.20) 55%, transparent 78%)',
            }}
          />

          {/* Shadow leans slightly toward the content/CTA (bottom-left) instead of
              straight down — a soft directional cue, not a literal arrow. */}
          <div
            ref={blockRef}
            className="absolute z-[5] pointer-events-none will-change-transform
                       left-[70%] top-[27%] -translate-x-1/2 -translate-y-1/2
                       w-[clamp(155px,35%,220px)]
                       sm:left-[60%] sm:top-[50%] sm:w-[clamp(280px,30%,460px)]
                       lg:left-[62%] lg:top-[50%] lg:w-[clamp(360px,27%,650px)]"
          >
            <div className="relative">
              {/* Ambient glow — sells the wax as the one lit/in-focus subject in the frame */}
              <div
                className="absolute inset-[-24%] rounded-[40%] pointer-events-none"
                style={{ background: 'radial-gradient(closest-side, rgba(110,165,230,0.28), transparent 72%)', filter: 'blur(20px)' }}
              />
              {/* Contact shadow — grounds the block on a surface instead of floating in space */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-[4%] w-[76%] h-[22%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(4,5,7,0.60), transparent 72%)', filter: 'blur(9px)' }}
              />
              <div className="relative" style={{ filter: 'drop-shadow(-3px 10px 16px rgba(5,6,8,0.40))' }}>
                {waxImg}
              </div>
            </div>
          </div>

          {/* WaxLens — magnifying glass cursor over the wax block */}
          <WaxLensCutout waxRef={blockRef} enabled={lensOn} de={de}
                   onOpen={openDive} onActiveChange={() => {}} />


          <div className="relative z-10 h-full w-full px-6 sm:px-10 lg:px-14 xl:px-20">
            <div className="h-full max-w-7xl mx-auto flex flex-col justify-end pb-28 sm:pb-32 lg:pb-28">
              <div ref={contentRef} className="max-w-xl will-change-transform">

                <div data-hero className="flex items-center gap-3 mb-5">
                  <span style={{ width: '28px', height: '2px', background: 'var(--brand-blue)' }} />
                  <p
                    className="text-[10px] sm:text-[11px] uppercase font-semibold"
                    style={{ letterSpacing: '0.34em', color: 'rgba(255,255,255,0.72)' }}
                  >
                    {t.hero.subtitle}
                  </p>
                </div>

                <h1
                  className="font-display text-white"
                  style={{
                    fontSize: 'clamp(2.5rem, 5.2vw, 4.6rem)',
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

                <p
                  data-hero
                  className="mt-5 max-w-md leading-relaxed"
                  style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {t.hero.tagline}
                </p>

                <div data-hero className="mt-7 flex items-center gap-4 flex-wrap">
                  <button
                    ref={ctaRef}
                    onClick={() => scrollTo('#produkte')}
                    className="cta-primary group inline-flex items-center gap-3 px-10 py-[18px] text-[16px] font-bold rounded-full transition-shadow duration-300 will-change-transform"
                    style={{ background: '#FFFFFF', color: '#0F0F12' }}
                  >
                    {t.hero.ctaBuy}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => scrollTo('#warum-wachs')}
                    className="hero-cta-secondary text-[13px] font-medium"
                  >
                    {t.hero.ctaSecondary}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div data-hero className="absolute bottom-0 inset-x-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-14 xl:px-20">
              <div
                className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between py-3 sm:py-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}
              >
                <div className="flex items-center gap-2 sm:gap-3 order-2 sm:order-1">
                  <span style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '0.08em', fontSize: '12px' }}>
                    ★★★★★
                  </span>
                  <span
                    className="text-[9px] sm:text-[11px] uppercase tabular-nums"
                    style={{ letterSpacing: '0.08em', color: 'rgba(255,255,255,0.68)' }}
                  >
                    171 · {de ? '100 % positiv' : '100% positive'}
                    <span className="hidden sm:inline"> · {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}</span>
                  </span>
                </div>

                <div className="flex items-stretch order-1 sm:order-2">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="px-2.5 sm:px-7 first:pl-0 last:pr-0"
                      style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.14)' : 'none' }}
                    >
                      <p
                        data-stat-val
                        className="font-display font-bold tabular-nums text-white leading-none"
                        style={{ fontSize: 'clamp(1.1rem, 2vw, 1.7rem)' }}
                      >
                        {s.v}
                      </p>
                      <p
                        className="text-[8px] sm:text-[10px] uppercase mt-1 sm:mt-1.5"
                        style={{ letterSpacing: '0.06em', color: 'rgba(255,255,255,0.65)' }}
                      >
                        <span className="sm:hidden">{s.lm}</span>
                        <span className="hidden sm:inline">{s.l}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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
