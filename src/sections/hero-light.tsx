import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight, ZoomIn } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCutout } from '@/sections/hero/WaxLensCutout';
import { waxLensEnabled } from '@/sections/hero/constants';
import { waxVsOil } from '@/lib/data';

const WaxDive = lazy(() => import('@/sections/hero/WaxDive').then(m => ({ default: m.WaxDive })));

// chain-bg.jpg (desktop/tablet background, sm: and up) is a pre-cropped
// 1653×918 (1.8:1) slice of the source photo, chosen so the calm slate
// surface (with the loose chain-link detail) occupies the left ~60% and the
// woven chain pattern occupies the right ~40% — instead of the old crop
// straddling the slate/chain boundary at roughly the frame's midpoint, which
// put both the wax block and the text in the busiest, most pattern-heavy
// part of the photo. Position applied via the sm:object-[48%_38%] class on
// the <img> below (see bgImg for why it's a class, not the style object).

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
  const blockInnerRef = useRef<HTMLDivElement>(null);
  const glowRef    = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLButtonElement>(null);
  // Holds the repeating "look, click here" nudge so the lens's own
  // onActiveChange can kill it the moment someone finds the real hotspot —
  // no point still nudging once they already have.
  const nudgeTlRef = useRef<gsap.core.Timeline | null>(null);

  const onLensActiveChange = useCallback((active: boolean) => {
    if (!active) return;
    nudgeTlRef.current?.kill();
    if (hintRef.current) gsap.to(hintRef.current, { autoAlpha: 0, duration: 0.25, overwrite: 'auto' });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    const cardInner = cardInnerRef.current;
    if (!root || !card || !cardInner) return;

    const words   = root.querySelectorAll<HTMLElement>('[data-word]');
    const items   = root.querySelectorAll<HTMLElement>('[data-hero]');
    // blockInnerRef, not blockRef — blockRef carries the CSS
    // -translate-x/y-1/2 that centers it on its left/top% anchor point.
    // GSAP taking ownership of that same element's `transform` (for the
    // entrance scale, scroll-scrub, and mouse-parallax below) established
    // its own x/y/scale baseline and silently dropped that -50%/-50%
    // offset, snapping the block from "centered on its anchor" to
    // "anchored by its top-left corner" the moment any of those tweens
    // first touched it — visually a sudden jump down-and-right by about
    // half the block's own size, right after the entrance timeline fires
    // on load. Animating the untransformed inner wrapper instead keeps
    // the outer element's CSS positioning completely GSAP-untouched.
    const imgLayers = [imgRef.current, blockInnerRef.current].filter(Boolean) as HTMLElement[];

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

    // statEls[0] ("Kettenlaufzeit") used to count up to a bare "3×" here,
    // independently of the React-rendered value — a plain number tween can't
    // land on the "2–3×" range the copy now uses, so that stat keeps only
    // its normal fade-in (via the [data-hero] stagger above) and no counter.
    const statEls = root.querySelectorAll<HTMLElement>('[data-stat-val]');
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

    // Idle "lebendig" wobble — reine Rotation, weil x/y/scale/yPercent auf
    // blockInnerRef schon von Entrance, Scroll-Scrub und Maus-Parallax belegt
    // sind (siehe imgLayers oben). Rotation ist eine eigene, von GSAP separat
    // getrackte Transform-Komponente, komponiert also konfliktfrei dazu.
    // blockRef (nicht blockInnerRef) ist, was WaxLensCutout fuer die
    // Treffererkennung misst, also hat dieser Wobble keinen Einfluss darauf.
    const idleWobble = blockInnerRef.current
      ? gsap.to(blockInnerRef.current, {
          rotation: 1.2,
          duration: 3.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      : undefined;

    // Ambient glow — persistent breathing so the block reads as "alive"
    // before the cursor ever finds it, not only once hovered like the lens
    // itself. Own element/property (the glow div's opacity+scale), so it
    // can't conflict with blockInnerRef's rotation/parallax/scroll tweens.
    // Amplitude deliberately larger than a first pass at this (0.85→1.08) —
    // that read as no different from doing nothing. Motion detection is a
    // pre-attentive, low-level visual system (superior colliculus/thalamus,
    // active before conscious scene parsing) that responds to a real change
    // in luminance/size over time, not a few-percent wobble; too subtle to
    // register just doesn't recruit it.
    const glowPulse = glowRef.current
      ? gsap.to(glowRef.current, {
          opacity: 1, scale: 1.22, transformOrigin: '50% 50%',
          duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1,
        })
      : undefined;

    // The block itself breathes too — literally "becomes bigger and
    // smaller," not just its glow. Starts after the one-time entrance
    // tween has finished writing to this same element's scale (it settles
    // at 1.01 by ~2.4s in), so this picks up cleanly from there instead of
    // fighting it. Independent of the rotation wobble above — GSAP tracks
    // scale and rotation as separate transform components on the same
    // element, so both compose without overwriting each other.
    const breathe = blockInnerRef.current
      ? gsap.to(blockInnerRef.current, {
          scale: 1.045, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.5,
        })
      : undefined;

    // Repeating "you can click this" nudge. Two things changed from a first
    // pass that turned out too subtle to notice: it now starts almost
    // immediately (a first-glance visitor should see it within ~1.5s, not
    // wait 15s+ to maybe catch a 2.5s window) and repeats roughly every 7s
    // instead of every 15+, so a few seconds of looking at the hero is
    // enough to catch it. Von Restorff effect: an isolated, moving element
    // against an otherwise static hero is what actually pulls the eye,
    // which is also why this stays a small badge rather than something
    // louder — one clear signal beats several competing ones. Stops for
    // good on first real hover/click (see onLensActiveChange below).
    let nudgeTl: gsap.core.Timeline | undefined;
    if (hintRef.current && lensOn) {
      gsap.set(hintRef.current, { autoAlpha: 0, scale: 0.85 });
      nudgeTl = gsap.timeline({ delay: 1.5, repeat: -1, repeatDelay: 5.5 });
      nudgeTl
        .to(hintRef.current, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)' })
        .to(hintRef.current, { autoAlpha: 0, scale: 0.92, duration: 0.35, ease: 'power2.in' }, '+=1.6');
      nudgeTlRef.current = nudgeTl;
    }

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
      idleWobble?.kill();
      glowPulse?.kill();
      breathe?.kill();
      nudgeTl?.kill();
      nudgeTlRef.current = null;
      tl.kill();
    };
  }, []);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const stats = [
    { v: `${waxVsOil.life.waxLo}–${waxVsOil.life.wax}×`, l: de ? 'Kettenlaufzeit'    : 'chain life' },
    { v: '~€70',  l: de ? 'gespart · 12.000 km' : 'saved · 12,000 km' },
    { v: '1 Tag', l: de ? 'Versand nach Bestellung' : 'ships after order' },
  ];

  // LCP-Bild der Startseite. Als WebP 46 statt 262 KB — verlustbehaftet, aber
  // ohne sichtbaren Unterschied, weil das Bild ohnehin weichgezeichnet
  // dargestellt wird (siehe filter unten). Die JPEG bleibt als Fallback im
  // <picture> UND als og:image/twitter:image in index.html: nicht jeder
  // Social-Crawler verarbeitet WebP zuverlaessig.
  //
  // Mobile-Hero-Redesign (2026-08): unter 640px zeigt der Hintergrund jetzt
  // einen Ausschnitt aus chains-hanging-gold — Waxcelerate-Karton + frisch
  // gewachste, goldfarbene Kette vor echter Stuttgarter Huegelkulisse,
  // goldene Stunde (dasselbe Foto, das schon als Blog-Hero und im
  // Produkt-Regal laeuft). Ersetzt das vorherige chain-bg-mobile.jpg
  // (Wachsblock auf Schiefer) — nicht weil das schlecht war, sondern weil
  // dieses Foto das tatsaechliche ERGEBNIS zeigt (eine saubere, gewachste
  // Kette) statt nur des Rohstoffs, und weil der Text jetzt in einem eigenen
  // Sockel unter dem Foto steht statt darueber, das Foto also endlich ohne
  // schweren Scrim lesbar bleiben darf (siehe die Scrim-Layer weiter unten,
  // jetzt sm:-only). Bild selbst ist 1050x1000px (Ausschnitt aus 1600x1000,
  // verlustfrei, ohne Hochskalieren — siehe Crop-Herleitung im
  // Redesign-Plan). object-Position fuer Mobil steht in index.css (.hero-img
  // media(max-width:639px), !important) — dort schon vorhanden fuer die
  // vorherige Mobil-Aufnahme, jetzt auf den neuen Ausschnitt umgestellt statt
  // hier per Klasse dupliziert, sonst kollidieren zwei Positionsangaben.
  // Desktop-Position bleibt die sm:-Klasse unten (BG_POS-Wert), unveraendert.
  const bgImg = (
    <picture>
      <source media="(max-width: 639px)" srcSet="/images/hero/mobile-chains-hills.webp" type="image/webp" />
      <source media="(max-width: 639px)" srcSet="/images/hero/mobile-chains-hills.jpg" type="image/jpeg" />
      <source srcSet="/images/hero/chain-bg.webp" type="image/webp" />
      <img
        src="/images/hero/chain-bg.jpg"
        alt={de ? 'Frisch gewachste Kette vor Stuttgarter Huegeln' : 'Freshly waxed chain in front of the Stuttgart hills'}
        className="absolute inset-0 w-full h-full object-cover hero-img sm:object-[48%_38%]"
        style={{
          transform: 'scale(1.035)',
          filter: 'blur(1.4px) saturate(0.95) brightness(0.92)',
        }}
        fetchPriority="high"
      />
    </picture>
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
          className="relative flex flex-col sm:block overflow-hidden rounded-[20px] sm:rounded-[28px]
                     sm:h-[min(calc(100dvh-108px),78vw)] lg:h-[min(calc(100dvh-134px),64vw)] sm:min-h-[540px]"
          style={{
            background: 'var(--hero-stage)',
            boxShadow: '0 28px 90px rgba(10,10,16,0.22), 0 4px 18px rgba(10,10,16,0.10)',
          }}
        >
        {/* Transform lives on this inner layer, separate from the rounded+clipped
            outer card — a rounded/overflow-hidden element that ALSO carries a live
            GSAP transform is a known Chromium compositing trap: the corner clip can
            render square for a frame right as the transform layer promotes. Keeping
            the clip static and transforming only this inner box avoids it.
            Mobile-Redesign: below sm:, this is no longer an absolute full-card
            overlay — cardRef is now a flex-col of [photo band, content pedestal]
            in normal flow (see the two children below), so cardInner just needs
            to be a normal, non-absolute wrapper here. It regains the exact prior
            absolute-inset-0-over-the-whole-card behavior at sm: and up, where the
            original single-card overlay design is unchanged. */}
        <div ref={cardInnerRef} className="relative sm:absolute sm:inset-0 will-change-transform">
          {/* Idle background drift (optional): a slow independent pan here would
              compete with the GSAP-driven transform already applied to this same
              element (entrance scale, scroll-scrub, cursor parallax) — both would
              write to `transform` on every frame and fight each other. Doing it
              properly means a dedicated extra layer, which isn't free performance-
              wise (another full-bleed image paint). Skipping for now; revisit only
              if the parallax layer gets refactored to a single GSAP timeline that
              could own a subtle idle loop too.
              Mobile-Redesign: imgRef is now a normal-flow, fixed-height band
              (not absolute-inset-0-of-cardInner) below sm:, so the photo shows at
              its own aspect instead of being force-cropped to fill an 86dvh-tall
              card — the whole point of the new crop (see bgImg above) is a
              recognizable box+chain+hillside composition, which an extreme
              vertical object-cover crop would have destroyed. Reverts to the
              original absolute-inset-0 behavior at sm: and up. */}
          <div ref={imgRef} className="relative h-[44dvh] min-h-[300px] overflow-hidden sm:h-auto sm:min-h-0 sm:absolute sm:inset-0 will-change-transform">
            {bgImg}

            {/* Blur already pushes the chain to atmospheric bokeh; this overlay only
                needs to add a touch more depth + tame the brightest specular hits,
                not do all the "background" work by itself.
                These scrims live inside imgRef (not as siblings under cardInner) so
                they inherit the exact same transform as the photo — entrance scale,
                scroll-scrub yPercent, mouse parallax. As siblings they had no
                overscan margin of their own, so cardInner's scroll-scrub shrink
                pulled their edges in ahead of the image, exposing an untinted sliver
                of the photo at the left/right edges while scrolling.
                Mobile-Redesign: all five of these are now sm:-only. They exist
                purely to keep white text legible when it sits ON TOP of the photo
                — on mobile the text has moved into its own solid pedestal below
                the photo band (see the content wrapper further down), so the photo
                no longer needs to be darkened for legibility and can finally just
                be seen. Desktop/tablet keep the exact original treatment. */}
            <div
              className="hidden sm:block absolute inset-0 pointer-events-none z-[1]"
              style={{ background: 'rgba(var(--scrim-rgb),0.32)' }}
            />
            <div
              className="hidden sm:block absolute inset-0 pointer-events-none z-[1]"
              style={{ background: 'linear-gradient(90deg, rgba(var(--scrim-rgb),0.30) 0%, transparent 40%)' }}
            />
            {/* Focused scrim directly behind the text column — the global overlay above
                stays light enough to keep the chain recognizable, so contrast for the
                headline/stats needs its own local boost instead of a sitewide darken. */}
            <div
              className="hidden sm:block absolute inset-0 pointer-events-none z-[1]"
              style={{ background: 'radial-gradient(ellipse 82% 105% at 0% 100%, rgba(var(--scrim-rgb),0.82) 0%, rgba(var(--scrim-rgb),0.48) 40%, transparent 68%)' }}
            />
            <div
              className="hidden sm:block absolute top-0 inset-x-0 h-20 pointer-events-none z-[1]"
              style={{ background: 'linear-gradient(to bottom, rgba(var(--scrim-rgb),0.25), transparent)' }}
            />
            {/* Stats row spans the full card width, so it can sit over the chain-weave
                side of the photo where the bottom-left radial scrim above doesn't
                reach — this band gives that whole row reliable contrast on its own,
                independent of which part of the photo is behind it. */}
            <div
              className="hidden sm:block absolute bottom-0 inset-x-0 h-36 pointer-events-none z-[1]"
              style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.58), transparent)' }}
            />
            {/* Mobile only: a light seam fade into the pedestal's solid
                background right below, purely a visual transition — not doing
                legibility work like the old heavy 0.72 mobile scrim it
                replaces, since no text sits over the photo anymore. */}
            <div
              className="sm:hidden absolute inset-x-0 bottom-0 h-14 pointer-events-none z-[1]"
              style={{ background: 'linear-gradient(to top, var(--hero-stage), transparent)' }}
            />
          </div>

          {/* Shadow leans slightly toward the content/CTA (bottom-left) instead of
              straight down — a soft directional cue, not a literal arrow.
              Auf Mobil gar nicht mehr gerendert. Urspruenglich (vor dem
              Mobile-Hero-Redesign 2026-08), weil das damalige
              Mobil-Hintergrundfoto (chain-bg-mobile.jpg) selbst ein
              Wachsblock war und ein zweiter, kleinerer daneben nur wie ein
              Doppel-Eindruck wirkte (Lucas Rueckmeldung: "sieht weiterhin
              nach zwei Wachsbloecken aus", auch nach Verkleinern/Abdunkeln).
              Das aktuelle Mobilfoto zeigt jetzt eine fertig gewachste Kette
              statt eines Wachsblocks, das urspruengliche Doppel-Problem
              besteht also nicht mehr direkt — bleibt trotzdem ausgeblendet,
              weil das Element auf Mobil ohnehin keine interaktive Funktion
              hat: die "Blick ins Wachs"-Lupe (WaxLensCutout unten) ist auf
              min-width 1024px gegated, und der Text/CTA-Sockel liegt jetzt
              unter dem Foto statt darueber, wo ein schwebender Wachsblock
              keinen offensichtlichen Platz mehr haette. sm:/lg: unveraendert. */}
          <div
            ref={blockRef}
            className="hidden sm:block absolute z-[5] pointer-events-none will-change-transform
                       -translate-x-1/2 -translate-y-1/2
                       sm:w-[clamp(280px,30%,460px)]
                       sm:left-[60%] sm:top-[50%]
                       lg:left-[62%] lg:top-[50%] lg:w-[clamp(360px,27%,650px)]"
          >
            <div ref={blockInnerRef} className="relative">
              {/* Ambient glow — sells the wax as the one lit/in-focus subject in the frame.
                  Also carries the slow persistent pulse (see glowPulse above) so the
                  block reads as "alive" before anyone hovers it, not only after. */}
              <div
                ref={glowRef}
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

              {/* Repeating discoverability nudge (see nudgeTl above) — the only
                  prior cue was the cursor-lens itself, invisible until the mouse
                  already happened to land on the block. Stops for good once
                  onLensActiveChange reports a real hover. */}
              <div
                ref={hintRef}
                aria-hidden
                className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-none"
                style={{
                  background: 'rgba(10,12,18,0.72)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.30)',
                }}
              >
                <ZoomIn className="h-3.5 w-3.5" style={{ color: '#fff' }} strokeWidth={2} />
                <span
                  className="whitespace-nowrap text-small uppercase font-semibold"
                  style={{ letterSpacing: '0.1em', color: 'rgba(255,255,255,0.94)' }}
                >
                  {de ? 'Blick ins Wachs' : 'Look inside'}
                </span>
              </div>
            </div>
          </div>

          {/* WaxLens — magnifying glass cursor over the wax block */}
          <WaxLensCutout waxRef={blockRef} enabled={lensOn} de={de}
                   onOpen={openDive} onActiveChange={onLensActiveChange} />


          {/* Matches the Section wrapper's left edge (px-6 sm:px-10 lg:px-14
              xl:px-20 on max-w-7xl) at every viewport, not just one. This card
              carries its own extra outer inset (px-3 sm:px-4 lg:px-6, "C", on
              the wrapping card above) that other sections don't have — both
              padding and max-w here are reduced by that same C so the two
              effects cancel exactly:
                - below the max-w-7xl cap (viewport < ~1280px, where Section's
                  own div isn't centered either yet): padding here is the
                  Section padding minus C, so card-inset(C) + this padding
                  reduces straight back to the Section's own padding value.
                - at/above the cap (viewport ≥ 1280px, where Section's div
                  centers with (viewport−1280)/2 slack): max-w here is reduced
                  by 2×C, so this div hits its own cap 2×C narrower — which,
                  once re-centered inside the card's already-C-narrower
                  available width, lands the content at the exact same
                  absolute screen position as the uncapped Section formula.
              Both terms use C's value at lg/xl (24px, the card's largest and
              final inset — the card has no xl: override) since the max-w
              term only ever matters at viewport ≥ 1280px, by which point the
              card is already at its lg inset. Verified against the Section
              wrapper's rendered left edge at 1440/1280/768px viewports. */}
          {/* Mobile-Redesign: below sm:, this is the new solid content pedestal —
              normal flow, opaque var(--hero-stage) background, sitting right
              below the now-clear photo band instead of overlaying it. Every one
              of the existing white/near-white text colors used inside (h1,
              tagline, star row, etc.) was already tuned for var(--hero-stage) —
              they were designed for the equivalent dark backing the old scrims
              approximated with a photo underneath; a flat var(--hero-stage) here
              gives the exact same contrast, guaranteed, independent of what part
              of a photo used to sit behind it. Reverts to the original
              transparent absolute-overlay treatment at sm: and up. */}
          <div className="relative z-10 w-full max-w-[1232px] mx-auto px-5 sm:px-6 lg:px-8 xl:px-14
                           bg-[var(--hero-stage)] pt-7 pb-8 rounded-b-[20px]
                           sm:bg-transparent sm:rounded-none sm:h-full sm:pt-0 sm:pb-0">
            {/* pb auf Mobil deutlich kleiner: dort steht am Kartenfuss keine
                Leiste mehr, fuer die Platz freigehalten werden muesste. Die
                112px Bodenabstand waren genau die leere Flaeche zwischen CTA
                und Bewertungszeile, die den Hero unten auseinandergezogen hat.
                Ab sm: unveraendert, dort traegt die Leiste weiter das
                Zahlenraster. */}
            <div className="sm:h-full flex flex-col sm:justify-end sm:pb-32 lg:pb-28">
              <div ref={contentRef} className="max-w-xl will-change-transform">

                <div data-hero className="flex items-center gap-3 mb-5">
                  <span style={{ width: '28px', height: '2px', background: 'var(--brand-blue)' }} />
                  <p
                    className="text-small uppercase font-semibold"
                    style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.72)' }}
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

                {/* Mobil: ein Knopf ueber die volle Breite, der zweite als
                    ruhiger Link darunter. Nebeneinander in einer umbrechenden
                    Reihe standen auf einem 390px-Schirm zwei gleich wichtig
                    wirkende Ziele direkt nebeneinander — genau das
                    "ueberfordert"-Gefuehl. Volle Breite ist ausserdem das
                    groesste erreichbare Daumenziel und macht unmissverstaendlich,
                    welcher der beiden der Hauptweg ist. Ab sm: unveraendert
                    nebeneinander. */}
                <div data-hero className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    ref={ctaRef}
                    onClick={() => scrollTo('#produkte')}
                    className="cta-primary group inline-flex w-full sm:w-auto items-center justify-center gap-3 px-10 py-[18px] text-[16px] font-bold rounded-full transition-all duration-300 active:scale-[0.97] will-change-transform"
                    style={{ background: '#FFFFFF', color: '#0F0F12' }}
                  >
                    {t.hero.ctaBuy}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  {/* .hero-cta-secondary was already styled for both cases — a
                      plain underlined link on mobile, the full pill from sm:
                      up (see its comment in index.css) — but `hidden sm:` here
                      cut it off before that mobile style ever got used, leaving
                      mobile with only the one CTA. */}
                  <button
                    onClick={() => scrollTo('#warum-wachs')}
                    className="hero-cta-secondary inline-flex self-start sm:self-auto text-[13px] font-medium"
                  >
                    {t.hero.ctaSecondary}
                  </button>
                  {/* Wherever the desktop cursor-lens doesn't render (touch,
                      <1024px, or prefers-reduced-motion — exactly !lensOn,
                      see waxLensEnabled()), there was previously no way at all
                      to open WaxDive. Plain tap link, same treatment as the
                      link above, no new hit-testing/gesture code needed. */}
                  {!lensOn && (
                    <button
                      onClick={openDive}
                      className="hero-cta-secondary inline-flex self-start sm:self-auto text-[13px] font-medium"
                    >
                      {de ? 'Blick ins Wachs' : 'Look inside the wax'}
                    </button>
                  )}
                </div>

                {/* Beleg direkt unter dem Knopf, nur auf Mobil. Dieselbe Zeile
                    klebte vorher am unteren Kartenrand, rund 110px unter dem
                    CTA und durch leere Flaeche von ihm getrennt — also genau
                    dort, wo sie die Kaufentscheidung nicht mehr stuetzt. Ab
                    sm: steht sie weiterhin in der Leiste am Kartenfuss,
                    zusammen mit dem Zahlenraster.
                    Mobile-Redesign: enthaelt jetzt zusaetzlich "Hergestellt in
                    Stuttgart" — bisher stand das nur in TrustStrip.tsx direkt
                    unter dem Hero, zusammen mit genau den beiden Fakten
                    (Verkaufszahl, 100% positiv), die hier eine Zeile darueber
                    schon standen. TrustStrip ist auf Mobil jetzt ausgeblendet
                    (siehe TrustStrip.tsx), dieser eine nicht-doppelte Fakt zieht
                    stattdessen hierher. */}
                <div data-hero className="sm:hidden flex items-center gap-2 mt-5">
                  <span style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '0.08em', fontSize: '12px' }}>
                    ★★★★★
                  </span>
                  <span className="text-meta uppercase tabular-nums"
                    style={{ letterSpacing: '0.08em', color: 'rgba(255,255,255,0.72)' }}>
                    200+ · {de ? '100 % positiv · Hergestellt in Stuttgart' : '100% positive · Made in Stuttgart'}
                  </span>
                </div>

                {/* Bisher unbenutzte, aber laengst freigegebene Copy aus
                    i18n.ts (hero.guarantee) — eine persoenlich von Luca
                    unterschriebene Garantie direkt am Punkt der Kaufzoegerung,
                    dieselbe Risikoumkehr-Logik wie die Ruecksende-Zeile auf
                    ProductDetailPage.tsx direkt unter deren CTA. Nur auf
                    Mobil, wo der Knopf jetzt der letzte Schritt vor dem Ende
                    des Sockels ist; auf dem Desktop-Grid wuerde die Zeile
                    gegen das Zahlenraster in der Kartenleiste konkurrieren. */}
                <p data-hero className="sm:hidden mt-3 text-[12.5px] leading-snug"
                  style={{ color: 'rgba(255,255,255,0.58)' }}>
                  {t.hero.guarantee}
                </p>
              </div>
            </div>
          </div>

          <div data-hero className="absolute bottom-0 inset-x-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-14 xl:px-20">

              {/* Mobil steht hier nichts mehr — die Bewertungszeile ist zum
                  CTA hochgezogen (siehe oben). Die 3× / ~€70 / 1-Tag-Zahlen
                  wiederholen sich ohnehin direkt unter dem Hero. */}

              {/* Tablet/Desktop — unchanged full bar (rating + stat grid) */}
              <div className="hidden sm:flex sm:items-center sm:justify-between py-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}>
                <div className="flex items-center gap-3">
                  <span style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '0.08em', fontSize: '12px' }}>
                    ★★★★★
                  </span>
                  <span className="text-[11px] uppercase tabular-nums"
                    style={{ letterSpacing: '0.08em', color: 'rgba(255,255,255,0.68)' }}>
                    200+ · {de ? '100 % positiv' : '100% positive'}
                    <span> · {de ? 'eBay-Käuferschutz' : 'eBay buyer protection'}</span>
                  </span>
                </div>

                <div className="flex items-stretch">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="px-7 first:pl-0 last:pr-0"
                      style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.14)' : 'none' }}
                    >
                      <p
                        data-stat-val
                        className="font-display font-bold tabular-nums text-white leading-none"
                        style={{ fontSize: 'clamp(1.1rem, 2vw, 1.7rem)' }}
                      >
                        {s.v}
                      </p>
                      <p className="text-[11px] uppercase mt-1.5"
                        style={{ letterSpacing: '0.06em', color: 'rgba(255,255,255,0.65)' }}>
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
      </div>

      {diveOpen && (
        <Suspense fallback={null}>
          <WaxDive open={diveOpen} onClose={() => setDiveOpen(false)} de={de} />
        </Suspense>
      )}
    </section>
  );
}
