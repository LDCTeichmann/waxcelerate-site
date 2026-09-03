import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight, ZoomIn } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCutout } from '@/sections/hero/WaxLensCutout';
import { waxLensEnabled } from '@/sections/hero/constants';
import { waxVsOil } from '@/lib/data';

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
  const blockInnerRef = useRef<HTMLDivElement>(null);
  const glowRef    = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLButtonElement>(null);
  // Mobiler Wachsblock. Aussen die CSS-Positionierung, innen die
  // GSAP-Transforms — derselbe Split wie bei blockRef/blockInnerRef auf
  // Desktop und aus demselben Grund: GSAP uebernimmt sonst `transform`
  // des positionierten Elements und verwirft dessen CSS-Offsets.
  const mBlockInnerRef = useRef<HTMLDivElement>(null);
  const mBlockRef  = useRef<HTMLButtonElement>(null);
  const bgImgRef   = useRef<HTMLImageElement>(null);
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
      // Auch ohne Animation muss der Freisteller seinen Zwilling verdecken.
      if (mBlockInnerRef.current) gsap.set(mBlockInnerRef.current, { scale: 1.03 });
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

    // Mobiler Wachsblock. Wie auf Desktop nur Rotation und Scale, bewusst
    // ohne den pulsierenden Farb-Glow: Luca wollte "wie im Desktop Hero
    // einfach etwas Bewegung", aber keine SaaS-KI-Optik.
    //
    // Ruhezustand ist scale 1.03, NICHT 1.0. Der Freisteller liegt exakt auf
    // seinem Zwilling im Hintergrundfoto; nur wenn er durchgehend etwas
    // groesser ist, verdeckt er dessen Kante auch waehrend der Drehung
    // vollstaendig. Bei 1.0 blitzte an den Ecken das Original hervor.
    // Rechnung: 0.5 Grad Drehung versetzt die Ecke eines rund 300px breiten
    // Blocks um etwa 1.9px, 3 % Vergroesserung schiebt die Kante um etwa
    // 4.5px nach aussen — die Deckung bleibt also in jeder Phase erhalten.
    if (mBlockInnerRef.current) gsap.set(mBlockInnerRef.current, { scale: 1.03 });
    const mWobble = mBlockInnerRef.current
      ? gsap.to(mBlockInnerRef.current, {
          rotation: 0.5, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1,
        })
      : undefined;
    const mBreathe = mBlockInnerRef.current
      ? gsap.to(mBlockInnerRef.current, {
          scale: 1.075, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.5,
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
      mWobble?.kill();
      mBreathe?.kill();
      nudgeTl?.kill();
      nudgeTlRef.current = null;
      tl.kill();
    };
  }, []);

  // Anteile des Wachsblocks INNERHALB von hero-b-bg (aus dem Zuschnitt
  // berechnet, siehe TAUSCHPUNKT weiter unten).
  const B_X = 0.14249, B_Y = 0.32863, B_W = 0.71566;

  // Der freigestellte Block muss deckungsgleich auf dem Block liegen, der im
  // Hintergrundfoto ohnehin zu sehen ist. Prozentwerte der KARTE reichen dafuer
  // nicht: das Foto liegt als object-cover darin und beschneidet sich je nach
  // Geraeteverhaeltnis anders, der Block wanderte dadurch von seinem Platz weg
  // und man sah ihn doppelt. Deshalb wird hier die tatsaechlich gerenderte
  // Bildflaeche nachgerechnet (dieselbe Formel, die object-cover verwendet)
  // und der Block darauf gesetzt.
  // offsetWidth/offsetHeight statt getBoundingClientRect: der Container traegt
  // GSAP-Transforms (Entrance-Scale, Scroll-Scrub), das Rect waere davon
  // verzerrt. Der Button haengt im selben transformierten Container, gebraucht
  // werden also Layoutwerte, keine transformierten.
  useEffect(() => {
    const img = bgImgRef.current;
    const btn = mBlockRef.current;
    if (!img || !btn) return;

    const place = () => {
      if (window.matchMedia('(min-width: 640px)').matches) return;
      const cw = img.offsetWidth, chh = img.offsetHeight;
      const nat = img.naturalWidth / img.naturalHeight;
      if (!cw || !chh || !nat) return;
      let w: number, h: number, ox: number, oy: number;
      if (cw / chh > nat) { w = cw; h = w / nat; ox = 0; oy = (chh - h) / 2; }
      else                { h = chh; w = h * nat; oy = 0; ox = (cw - w) / 2; }
      btn.style.left  = `${ox + B_X * w}px`;
      btn.style.top   = `${oy + B_Y * h}px`;
      btn.style.width = `${B_W * w}px`;
    };

    place();
    if (!img.complete) img.addEventListener('load', place);
    const ro = new ResizeObserver(place);
    ro.observe(img);
    window.addEventListener('resize', place);
    window.addEventListener('orientationchange', place);
    return () => {
      img.removeEventListener('load', place);
      ro.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('orientationchange', place);
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
  // Unter 640px eigenes Bild statt des Ketten-Fotos: die Kette liest auf
  // einem Hochkant-Crop kaum noch als Kette, nur als dunkle Flaeche (Lucas
  // Feedback — "sieht komisch aus auf Mobile"). Der Wachsblock ist bereits im
  // richtigen 9:16-Seitenverhaeltnis fotografiert (kein Crop noetig) und
  // steht als eigenstaendiges Motiv fuer sich, ohne auf die Kette angewiesen
  // zu sein.
  const bgImg = (
    <picture>
      {/* ===== TAUSCHPUNKT MOBILES HERO-FOTO =====
          Erzeugt aus raw-image-library/hero/2026-08-18/DSC01454.JPG.
          Es sind ZWEI Dateien, die zusammengehoeren:
            hero-b-bg    = Hintergrundplatte, Dunsthimmel weggeschnitten (ab
                           y=1050), Blockbereich als Schattenloch abgedunkelt
            hero-b-block = derselbe Block freigestellt, schwebt darueber
                           (siehe SCHWEBENDER WACHSBLOCK weiter unten)
          Beim Bildtausch muessen beide neu erzeugt und die Prozentwerte am
          Blocklayer nachgezogen werden, sonst sitzt der Block nicht mehr auf
          seinem Schattenloch.
          Anforderung an ein neues Bild: Hochformat im Kartenverhaeltnis
          (~0,54), Motiv in der unteren Haelfte, oben ruhige DUNKLE Flaeche —
          die Headline steht dort ohne jeden Scrim, das funktioniert nur bei
          einem Bildkopf unter etwa Helligkeit 110.
          Das alte hero-mobile-stage.* und chain-bg-mobile.* bleiben
          unangetastet im Ordner liegen. */}
      <source media="(max-width: 639px)" srcSet="/images/hero/hero-b-bg.webp" type="image/webp" />
      <source media="(max-width: 639px)" srcSet="/images/hero/hero-b-bg.jpg" type="image/jpeg" />
      <source srcSet="/images/hero/chain-bg.webp" type="image/webp" />
      <img
        ref={bgImgRef}
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
          {/* Auf Mobil (< 640px) belegt das Foto nur noch das untere Band der
              Karte, ab sm: unveraendert die ganze Flaeche. Kein Text liegt
              mehr darueber, also braucht es dort auch keinen Scrim mehr, der
              das Motiv erschlaegt — genau der Kreislauf, der den alten
              Mobile-Hero unlesbar UND das Bild unsichtbar gemacht hat. Die
              Kartenhaelfte darueber ist die ruhige Typo-Buehne in
              var(--hero-stage). */}
          {/* overflow-hidden: das <img> traegt auf Desktop scale(1.035) als
              Overscan fuer die Maus-Parallax und ragt damit ueber jede Kante
              seines Containers hinaus. Hier zu clippen ist unschaedlich, weil
              der Container deckungsgleich mit der bereits clippenden Karte ist.
              Auf Mobil ist dieser Overscan abgeschaltet (siehe .hero-img in
              index.css), weil der freigestellte Wachsblock unten in Prozent
              DIESES Containers positioniert wird: waere das Foto darunter um
              3,5 % groesser, saesse der Block nicht mehr deckungsgleich auf
              seinem eigenen Schattenloch. */}
          <div ref={imgRef} className="absolute inset-0 overflow-hidden will-change-transform">
            {bgImg}

            {/* Blur already pushes the chain to atmospheric bokeh; this overlay only
                needs to add a touch more depth + tame the brightest specular hits,
                not do all the "background" work by itself.
                These scrims live inside imgRef (not as siblings under cardInner) so
                they inherit the exact same transform as the photo — entrance scale,
                scroll-scrub yPercent, mouse parallax. As siblings they had no
                overscan margin of their own, so cardInner's scroll-scrub shrink
                pulled their edges in ahead of the image, exposing an untinted sliver
                of the photo at the left/right edges while scrolling. */}
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
            {/* Mobil: EIN Bodenverlauf, kein Kopf-Scrim.
                Der Zuschnitt hero-b-bg schneidet den hellen Dunsthimmel weg,
                dadurch liegt der Bildkopf bei Helligkeit rund 63. Weisser Text
                erreicht darauf ueber 10:1, die Headline braucht also gar keine
                Abdunklung und das Foto bleibt oben unangetastet. Nur unten ist
                der graue Tisch mit rund 115 zu hell fuer Label, CTA und
                Sternzeile, deshalb hier ein Verlauf. Er liegt auf z-[4] und
                damit UNTER dem Wachsblock (z-[6]): der Hintergrund dunkelt
                nach unten ab, waehrend der Block beleuchtet stehen bleibt. */}
            <div
              className="sm:hidden absolute inset-x-0 bottom-0 h-[46%] pointer-events-none z-[4]"
              style={{
                background:
                  'linear-gradient(to top, rgba(var(--scrim-rgb),0.80) 0%, rgba(var(--scrim-rgb),0.55) 30%, rgba(var(--scrim-rgb),0.22) 62%, transparent 100%)',
              }}
            />

            {/* ===== SCHWEBENDER WACHSBLOCK (nur < 640px) =====
                Derselbe Block, der im Hintergrundfoto ohnehin zu sehen ist,
                freigestellt und deckungsgleich darueber gelegt. Position und
                Breite setzt der Effekt weiter oben zur Laufzeit aus der
                gerenderten Bildflaeche, damit object-cover ihn nicht
                verschieben kann.

                Warum deckungsgleich und nicht daneben: das Hintergrundfoto
                laesst sich nicht vom Block befreien. Ein abgedunkeltes Loch
                sah nach Fehler aus, und selbst sehr starker Weichzeichner
                (getestet bis Radius 168) loescht die Silhouette nicht, weil
                ein heller Block auf dunklem Grund als weiche Form bestehen
                bleibt. Deckungsgleich ist die einzige artefaktfreie Loesung:
                im Ruhezustand ist die Schicht mit dem Foto identisch.

                Deshalb ruht der Block auf scale 1.03 statt 1.0 und atmet nach
                oben. So ist der Freisteller IMMER etwas groesser als sein
                Zwilling darunter und verdeckt ihn vollstaendig, auch waehrend
                der leichten Drehung. Wuerde er auf 1.0 ruhen, blitzte an den
                Ecken die Kante des Originals hervor. */}
            <button
              ref={mBlockRef}
              type="button"
              onClick={() => scrollTo('#produkte')}
              aria-label={`${t.hero.blockLabel}, ${t.hero.blockPrice}, ${de ? 'zu den Produkten' : 'go to products'}`}
              className="sm:hidden absolute z-[6] block"
              style={{ left: '14%', top: '33%', width: '72%' }}
            >
              <span ref={mBlockInnerRef} className="block origin-center will-change-transform">
                <picture>
                  <source srcSet="/images/hero/hero-b-block.webp" type="image/webp" />
                  <img
                    src="/images/hero/hero-b-block.png"
                    alt=""
                    className="block w-full h-auto"
                    /* Nur eine sehr feine helle Kante, die den Block vom
                       Hintergrund abhebt. Kein Schlagschatten und keine
                       Kontaktschatten-Ellipse mehr: der Block liegt exakt auf
                       seinem fotografierten Zwilling, dessen echter Schatten
                       im Bild bereits vorhanden ist. Ein zweiter, gerechneter
                       Schatten darueber war genau das, was aufgesetzt aussah. */
                    style={{ aspectRatio: '900 / 967', filter: 'drop-shadow(0 0 1.5px rgba(255,255,255,0.32))' }}
                    fetchPriority="high"
                  />
                </picture>
              </span>
              <span className="hero-block-label mt-3 block text-center">
                <span
                  className="block text-[10px] uppercase font-semibold"
                  style={{ letterSpacing: '0.16em', color: 'rgba(255,255,255,0.72)' }}
                >
                  {t.hero.blockLabel}
                </span>
                <span className="block font-display mt-1" style={{ fontSize: '15px', color: '#fff' }}>
                  {t.hero.blockPrice}
                </span>
              </span>
            </button>

          </div>

          {/* Shadow leans slightly toward the content/CTA (bottom-left) instead of
              straight down — a soft directional cue, not a literal arrow.
              Auf Mobil gar nicht mehr gerendert. Das Hintergrundfoto IST dort
              inzwischen selbst ein Wachsblock (chain-bg-mobile.jpg, siehe oben
              — keine Kettenaufnahme aus dem Rohmaterial uebersteht den schweren
              Bottom-Scrim dieser Sektion mit genug Kontrast, getestet und
              zurueckgenommen), also stand hier ein zweiter Wachsblock direkt
              neben dem ersten. Ein Versuch, das durch Verkleinern und
              Abdunkeln (16 % Breite, opacity-60) zu entschaerfen, hat den
              Doppel-Eindruck nicht beseitigt, sondern nur verkleinert — Lucas
              Rueckmeldung dazu: sieht weiterhin nach zwei Wachsbloecken aus.
              Interaktive Funktion hat das Element auf Mobil ohnehin keine: die
              "Blick ins Wachs"-Lupe (WaxLensCutout unten) ist auf min-width
              1024px gegated. sm:/lg: unveraendert. */}
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
          {/* h-auto auf Mobil, h-full erst ab sm:. Mit h-full spannte diese
              z-10-Spalte ueber die GANZE Karte, also auch ueber das Fotoband
              darunter, und hat dort jeden Tap abgefangen, obwohl sie optisch
              leer war. Die Hotspots auf z-[6] lagen darunter und waren
              dadurch komplett tot (im Klicktest bestaetigt: der Klick landete
              auf dieser Spalte statt auf dem Ring). Ab sm: bleibt h-full
              noetig, weil dort justify-end den Text an den Kartenfuss
              schiebt. */}
          {/* pointer-events-none auf Mobil, ab sm: wieder auto.
              Diese Spalte ist z-10 und deckt die ganze Karte ab. Der
              Wachsblock liegt als z-[6]-Schicht im Foto darunter, seine Taps
              landeten also auf dieser Spalte statt auf ihm. Genau dieser
              Fehler ist hier schon zweimal aufgetreten (zuerst bei den
              Hotspots, dann bei der ersten Blockfassung) und er ist auf
              Screenshots unsichtbar — er faellt nur im Klicktest auf.
              Die interaktiven Kinder holen sich pointer-events einzeln
              zurueck (contentRef fuer die Desktop-Knoepfe, hero-zone3 fuer
              CTA und Beleg). */}
          <div className="pointer-events-none sm:pointer-events-auto relative z-10 h-full w-full max-w-[1232px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-14">
            {/* pb auf Mobil deutlich kleiner: dort steht am Kartenfuss keine
                Leiste mehr, fuer die Platz freigehalten werden muesste. Die
                112px Bodenabstand waren genau die leere Flaeche zwischen CTA
                und Bewertungszeile, die den Hero unten auseinandergezogen hat.
                Ab sm: unveraendert, dort traegt die Leiste weiter das
                Zahlenraster. */}
            {/* Mobil oben statt unten. Das ist der Kern des Umbaus: Text und
                Foto teilen sich die Karte, statt uebereinander zu liegen.
                Der CTA landet dadurch genau auf der Naht zwischen Typo-Buehne
                und Foto, also auf der Horizontlinie der Karte. Ab sm:
                unveraendert am Kartenfuss, wo das Foto full-bleed liegt. */}
            {/* Auf Mobil eine echte Flex-Spalte ueber die ganze Kartenhoehe:
                Zone 1 (Worte) und Zone 3 (Handlung) nehmen ihre natuerliche
                Hoehe, Zone 2 (der Wachsblock) bekommt den Rest. Der Block wird
                dadurch ueber die verfuegbare HOEHE dimensioniert statt ueber
                die Kartenbreite und kann deshalb bei keiner Geraetehoehe mehr
                mit dem CTA kollidieren.
                Vorher standen Block und Zone 3 absolut positioniert in Prozent
                der Karte. Gemessen brach das unter etwa 800px Karteninnenhoehe:
                bei 760px ueberlappten Block und CTA um 22px, beim iPhone SE um
                64px. Genau das war auf dem Geraet zu sehen, sobald Safaris
                Adressleiste die dvh verkleinert hat.
                Die volle Hoehe hier ist unkritisch, weil diese Spalte selbst
                alle Tap-Ziele enthaelt und nichts mehr unter ihr liegt. */}
            <div className="hero-zone1 h-full flex flex-col justify-start pt-7 sm:justify-end sm:pt-0 sm:pb-32 lg:pb-28">
              <div ref={contentRef} className="pointer-events-auto shrink-0 max-w-xl will-change-transform">

                <div data-hero className="flex items-center gap-3 mb-5">
                  <span style={{ width: '28px', height: '2px', background: 'var(--brand-blue)' }} />
                  <p
                    className="hero-eyebrow text-small uppercase font-semibold"
                    style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.72)' }}
                  >
                    {t.hero.subtitle}
                  </p>
                </div>

                {/* hero-h1 setzt die Schriftgroesse nur unter 640px hoch
                    (siehe index.css). Auf Mobil hat die Headline jetzt eine
                    eigene Buehne statt eines Streifens ueber dem Foto, also
                    war sie mit 2.5rem deutlich untermassig fuer die Flaeche,
                    die sie traegt. Ab sm: bleibt die clamp() unveraendert,
                    dort steht die Headline weiter im Bild und darf nicht
                    wachsen. */}
                <h1
                  className="hero-h1 font-display text-white"
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

                {/* Auf Mobil ausgeblendet, ab sm: unveraendert. Zone 1 traegt
                    dort nur noch Eyebrow und Headline; die Kategorie ("Kette")
                    loesen stattdessen die Eyebrow und das Label am Wachsblock
                    auf, und der Preisanker sitzt am antippbaren Block statt in
                    einer Fliesstextzeile. Ein Absatz weniger im oberen Drittel,
                    ohne Informationsverlust. Falls das im Test zu knapp wirkt:
                    hier wieder einblenden, in Zone 1 ist Platz dafuer. */}
                <p
                  data-hero
                  className="hidden sm:block mt-5 max-w-md leading-relaxed"
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
                <div data-hero className="hidden sm:flex mt-7 flex-col sm:flex-row sm:items-center gap-4">
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
                  {/* Ab sm: aufwaerts. Auf Mobil standen hier drei gleich
                      laut wirkende Ziele untereinander (Kaufen, Wie
                      funktioniert Heisswachs, Blick ins Wachs). Ein Hero
                      traegt einen dominanten CTA und hoechstens einen
                      zweiten, nie drei konkurrierende. Auf Mobil uebernimmt
                      jetzt der Hotspot auf dem Wachsblock im Foto den Weg
                      "Blick ins Wachs", und "Wie funktioniert Heisswachs"
                      steht ohnehin als eigene Sektion direkt unter dem Hero. */}
                  <button
                    onClick={() => scrollTo('#warum-wachs')}
                    className="hero-cta-secondary hidden sm:inline-flex self-start sm:self-auto text-[13px] font-medium"
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
                      className="hero-cta-secondary hidden sm:inline-flex self-start sm:self-auto text-[13px] font-medium"
                    >
                      {de ? 'Blick ins Wachs' : 'Look inside the wax'}
                    </button>
                  )}
                </div>

              </div>

              {/* Abstandhalter: haelt Zone 3 am Kartenfuss und laesst dazwischen
                  Platz fuer den Wachsblock, der als absolut positionierte
                  Schicht im Foto liegt (siehe SCHWEBENDER WACHSBLOCK). Er kann
                  nicht im Flexfluss stehen, weil er deckungsgleich auf seinem
                  Zwilling im Hintergrundfoto sitzen muss und dessen Lage von
                  object-cover bestimmt wird, nicht vom Layout. */}
              <div className="sm:hidden flex-1 min-h-0 pointer-events-none" aria-hidden />

              {/* ===== ZONE 3 (nur < 640px): Handlung, Daumenzone ===== */}
              <div data-hero className="hero-zone3 pointer-events-auto sm:hidden shrink-0 pb-1">
                <button
                  onClick={() => scrollTo('#produkte')}
                  className="cta-primary group flex w-full items-center justify-center gap-3 px-8 py-[18px] text-[16px] font-bold rounded-full transition-all duration-300 active:scale-[0.97] will-change-transform"
                  style={{ background: '#FFFFFF', color: '#0F0F12' }}
                >
                  {t.hero.ctaBuy}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="hero-proof flex items-center justify-center gap-2 mt-4">
                  <span style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '0.08em', fontSize: '12px' }}>
                    ★★★★★
                  </span>
                  <span className="text-meta uppercase tabular-nums"
                    style={{ letterSpacing: '0.08em', color: 'rgba(255,255,255,0.72)' }}>
                    200+ · {de ? '100 % positiv' : '100% positive'}
                  </span>
                </div>
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
