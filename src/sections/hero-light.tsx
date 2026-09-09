import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight, ZoomIn, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCutout } from '@/sections/hero/WaxLensCutout';
import { waxLensEnabled } from '@/sections/hero/constants';
import { waxVsOil, trustStats } from '@/lib/data';
import { Stars } from '@/components/Stars';

const WaxDive = lazy(() => import('@/sections/hero/WaxDive').then(m => ({ default: m.WaxDive })));

// chain-bg.jpg is now a pre-cropped 1653×918 (1.8:1) slice of the source photo,
// chosen so the calm slate surface (with the loose chain-link detail) occupies
// the left ~60% and the woven chain pattern occupies the right ~40% — instead
// of the old crop straddling the slate/chain boundary at roughly the frame's
// midpoint, which put both the wax block and the text in the busiest, most
// pattern-heavy part of the photo.
const BG_POS = '48% 38%';

// ===== TAUSCHPUNKT MOBILES HINTERGRUNDFOTO =====
// v4 (09/2026): der Mobile-Hero ist die HOCHKANT-Fassung des Desktop-Heros —
// Kettenfoto randlos im Hintergrund, der freigestellte Wachsblock scharf davor
// als einziges Objekt im Fokus. v3 hatte stattdessen EIN Foto mit
// eingebranntem Block; das konnte weder atmen noch einen Tap-Ripple tragen,
// und ohne Kette im Bild las sich der blaue Block wie ein Stueck Seife.
//
// chain-weave-mobile ist aus "1 Chain.JPG" (2250x4000) exportiert und als
// einziger Kandidat NATIV 9:16 — es muss also nicht beschnitten werden, die
// Komposition sitzt dadurch auf jedem Geraeteverhaeltnis gleich.
//
// Rohkontrast ist bei diesem Bild der falsche Massstab: chain-bg.jpg, das der
// Desktop-Hero benutzt, liegt roh bei 1,49:1 und liest sich trotzdem
// einwandfrei, weil Blur + Scrim-Stapel darueberliegen. Mit demselben Rezept
// (siehe Markup unten) gemessen: Eyebrow 14,5:1, Headline 6,1:1, CTA/Fuss
// 14,9:1 — die Headline bekommt deshalb zusaetzlich ein eigenes lokales
// Scrim. Anforderung an ein Ersatzbild: hochkant 9:16, Kette gross und
// erkennbar, ruhige dunkle obere Haelfte fuer die Textzone.
// Bei Bildtausch: Preload in index.html + Strip-Regex in
// scripts/lib/prerender.mjs am Namen chain-weave-mobile.webp nachziehen.
const MOBILE_HERO_BG = '/images/hero/chain-weave-mobile.webp';
const MOBILE_HERO_BG_FALLBACK = '/images/hero/chain-weave-mobile.jpg';

// Alle weissen Textzeilen im Mobile-Hero tragen denselben leichten Schatten.
// Gemessen per Canvas-Pixelsampling der tatsaechlich gerenderten Fotoflaeche
// (nicht der Quelldatei): einzelne Bildstellen fielen ohne ihn auf 4,5:1,
// waehrend der Rest bei 9–18:1 lag. Der Schatten macht die Lesbarkeit
// unabhaengig davon, was zufaellig hinter einer Zeile liegt — dieselbe
// Technik wie das "Blick ins Wachs"-Label in WaxLensCutout.tsx.
const HERO_TEXT_SHADOW = '0 1px 3px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.35)';


export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [diveOpen, setDiveOpen] = useState(false);
  const [lensOn] = useState(() => waxLensEnabled());

  const openDive = useCallback(() => setDiveOpen(true), []);

  // Mobil: Tap auf den Block oeffnet WaxDive UND stoppt den Klick-Hinweis
  // dauerhaft — er hat seinen Zweck erfuellt, sobald jemand einmal getippt hat.
  const openDiveFromBlock = useCallback(() => {
    mHintTlRef.current?.kill();
    if (mRippleRef.current) gsap.set(mRippleRef.current, { autoAlpha: 0 });
    if (mMagRef.current) gsap.set(mMagRef.current, { autoAlpha: 0 });
    setDiveOpen(true);
  }, []);

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
  // Mobiler Wachsblock (< 640px). mBlockInnerRef ist der Motion-Wrapper
  // (Wobble + Atmen) — getrennt vom positionierten <button>, dessen
  // CSS-Zentrierung GSAP sonst ueberschreibt. mRippleRef/mMagRef sind der
  // intermittierende Klick-Hinweis (Tap-Ripple + kurz aufblitzende Lupe),
  // mHintTlRef haelt dessen Timeline, damit der erste echte Tap sie killt.
  const mBlockInnerRef = useRef<HTMLSpanElement>(null);
  const mRippleRef     = useRef<HTMLSpanElement>(null);
  const mMagRef        = useRef<HTMLSpanElement>(null);
  const mHintTlRef     = useRef<gsap.core.Timeline | null>(null);
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
    // Scoped to cardInner (desktop stat bar only), not root — the v3 mobile
    // hero has its own [data-stat-val] triple now (same stats array, own
    // markup), and root.querySelectorAll would have returned mobile's before
    // desktop's in DOM order, aiming this counter at the wrong element.
    const statEls = cardInner.querySelectorAll<HTMLElement>('[data-stat-val]');
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

  // Mobiler Wachsblock (< 640px): dieselbe "lebendige" Bewegung wie der
  // Desktop-Block — Rotation-Wobble + Scale-Breathe auf dem Motion-Wrapper.
  // Rotation und Scale sind getrennte GSAP-Transformkomponenten, komponieren
  // also konfliktfrei auf demselben Element. matchMedia-gated, damit die
  // Tweens auf Desktop gar nicht erst laufen. prefers-reduced-motion ->
  // alles statisch.
  //
  // Dazu der Klick-Hinweis, den Luca ausdruecklich zurueckhaben wollte: alle
  // ~6 s dehnt sich ein weicher Tap-Ripple und eine kleine Lupe blitzt ~1,4 s
  // an derselben Stelle auf. Der erste echte Tap killt die Timeline dauerhaft
  // (siehe openDiveFromBlock). Kein Dauer-Glow — nur dieser eine, endliche
  // Hinweis.
  //
  // KEIN Scroll-Parallax mehr auf dem Hintergrundfoto: das war ein
  // ScrollTrigger-Scrub (Foto-Transform an die Scrollposition gekoppelt),
  // also zusaetzliche JS-Arbeit auf jedem Scroll-Frame — genau die Sorte
  // Code, die auf einem Touchscreen als Scroll-Ruckeln auffaellt, zumal
  // parallel schon drei endlose GSAP-Ticker (Wobble, Atmen, Hinweis) laufen.
  // War rein dekorativ (12 % Drift), deshalb ersatzlos raus statt gedrosselt.
  useEffect(() => {
    const inner  = mBlockInnerRef.current;
    const ripple = mRippleRef.current;
    const mag    = mMagRef.current;
    if (!inner) return;
    if (!window.matchMedia('(max-width: 639px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wobble = gsap.to(inner, { rotation: 1.2, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    const breathe = gsap.to(inner, { scale: 1.045, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.5 });

    let hintTl: gsap.core.Timeline | undefined;
    if (ripple && mag) {
      gsap.set(ripple, { autoAlpha: 0, scale: 0.35, transformOrigin: '50% 50%' });
      gsap.set(mag, { autoAlpha: 0, scale: 0.8, y: 4 });
      hintTl = gsap.timeline({ repeat: -1, repeatDelay: 4.6, delay: 2.2 });
      hintTl
        .to(ripple, { autoAlpha: 1, scale: 0.5, duration: 0.01 })
        .to(ripple, { scale: 2.1, autoAlpha: 0, duration: 1.5, ease: 'sine.out' }, 0)
        .to(mag, { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }, 0.05)
        .to(mag, { autoAlpha: 0, scale: 0.85, y: 3, duration: 0.35, ease: 'power2.in' }, '+=1.0');
      mHintTlRef.current = hintTl;
    }

    return () => {
      wobble.kill(); breathe.kill();
      hintTl?.kill(); mHintTlRef.current = null;
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
  const bgImg = (
    <picture>
      <source srcSet="/images/hero/chain-bg.webp" type="image/webp" />
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
    </picture>
  );

  // AVIF zuerst: gemessen 61,6 KB gegen 135 KB WebP bei GLEICHER Pixelbreite
  // (885x900) und dabei naeher am PNG-Master als das WebP (RMS 3,1 vs 14,3).
  // Der Block ist auf Mobil das LCP-Element, deshalb haengt daran auch der
  // preload in index.html — der zeigt bewusst auf die .avif. Kein zusaetzliches
  // srcset: Mobil skaliert ueber --hero-block-w, Desktop ueber einen anderen
  // Anteil, ein `sizes` muesste beides treffen und waere die wahrscheinlichste
  // Fehlerquelle. Das PNG bleibt als letzter Fallback stehen.
  const waxImg = (
    <picture>
      <source srcSet="/images/hero/wax-cutout.avif" type="image/avif" />
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
      {/* Die einzige <h1> der Startseite. Sichtbar steht hier die
          Marken-Headline "Am Ende der Recherche." — die ist als Ueberschrift
          aber inhaltsleer, und sie stand bis 09/2026 zweimal als <h1> im DOM
          (einmal Mobil-, einmal Desktop-Fassung). Beide sind jetzt <p> mit
          identischem Aussehen, und die beschreibende Ueberschrift liegt hier,
          visuell verborgen. Das aendert am Design nichts und gibt
          Screenreadern wie Crawlern trotzdem eine Ueberschrift, die das
          Angebot benennt. */}
      <h1 className="sr-only">{t.hero.a11yHeading}</h1>
      {/* ===== MOBILE-HERO (< 640px) v4 — Hochkant-Fassung des Desktop-Heros ===== */}
      {/* Kettenfoto randlos im Hintergrund, der freigestellte Wachsblock
          scharf davor als einziges Objekt im Fokus — dieselbe Architektur wie
          der Desktop-Hero, nur hochkant. Randlos wie v3 (keine Karte, keine
          Radien, keine Diagonale), aber mit zwei entscheidenden Korrekturen
          gegenueber v3:
          1. Der Block ist wieder eine EIGENE Ebene statt ins Foto eingebrannt.
             Nur so kann er sich drehen, atmen und einen Tap-Ripple tragen —
             Lucas Punkte 1 und 2. Ein Block im JPEG kann das prinzipiell nicht.
          2. Im Hintergrund liegt wieder eine KETTE. Ohne sie las sich der
             blaue Block wie ein Stueck Seife und die Kategorie ging verloren.
          Das Foto bekommt das Desktop-Rezept: leichter Blur + Abdunklung +
          Scrim-Stapel. Roh liegt es bei 6,1:1 in der Headline-Zone, mit dem
          Rezept darueber (inkl. lokalem Scrim hinter der Headline) deutlich
          hoeher — am gerenderten Bild nachgemessen, nicht geschaetzt.
          Sitzt hinter der Navigation (navigation.tsx, heroTransparent) —
          deshalb kein pt-[84px]-Ausgleich, das Foto beginnt bei y=0. */}
      <div className="sm:hidden relative h-[100svh] min-h-[560px] w-full overflow-hidden">
        {/* Foto-Ebene: Bild + Scrim-Stapel in einem Wrapper, damit die
            Verlaeufe sich exakt auf das Foto beziehen statt auf die ganze
            Sektion. Kein Scroll-Parallax mehr (siehe Kommentar am mobilen
            useEffect) — deshalb kein ref/will-change-transform hier, dieser
            Layer bewegt sich nie. */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet={MOBILE_HERO_BG} type="image/webp" />
            <img
              src={MOBILE_HERO_BG_FALLBACK}
              alt={de ? 'Gewachste Fahrradkette auf Schiefer' : 'Waxed bicycle chain on slate'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: '50% 50%',
                transform: 'scale(1.08)',
                filter: 'blur(0.8px) brightness(0.92)',
              }}
              fetchPriority="high"
            />
          </picture>
          {/* Scrim-Stapel, angelehnt an den Desktop-Hero, hochkant gedacht.
              Das globale Scrim ist bewusst KEIN flacher Ton mehr (das war
              Lucas "da scheint eine dunkle Ebene im Hintergrund zu liegen,
              die auffaellt") — als Gradient blendet es oben (wo die Headline
              den Kontrast braucht) staerker ein und laeuft zum unteren Drittel
              hin fast auf null aus, sodass Block und Kette dort in ihrer
              wahren Farbe stehen. Das dedizierte Fussband weiter unten
              deckt die CTA-/Meta-Zone unabhaengig davon ab. */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'linear-gradient(to bottom, rgba(var(--scrim-rgb),0.36) 0%, rgba(var(--scrim-rgb),0.18) 40%, rgba(var(--scrim-rgb),0.04) 100%)' }} />
          <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
               style={{ background: 'linear-gradient(to bottom, rgba(var(--scrim-rgb),0.55) 0%, rgba(var(--scrim-rgb),0.20) 60%, transparent 100%)' }} />
          {/* Lokales Scrim hinter der Headline — dieses Foto ist in der
              Headline-Zone das schwaechste der drei Kandidaten (6,1:1 roh),
              hier wird der Unterschied gemacht. */}
          <div className="absolute inset-x-0 pointer-events-none"
               style={{ top: '10%', height: '34%', background: 'radial-gradient(ellipse 120% 100% at 0% 50%, rgba(var(--scrim-rgb),0.62) 0%, rgba(var(--scrim-rgb),0.30) 55%, transparent 80%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-[34%] pointer-events-none"
               style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.72) 0%, rgba(var(--scrim-rgb),0.34) 45%, transparent 100%)' }} />
        </div>
        <div className="hero-grain absolute inset-0 pointer-events-none" />

        {/* ===== WACHSBLOCK (nur < 640px) =====
            Eigene Ebene ueber dem Foto, derselbe Freisteller wie auf Desktop
            (wax-cutout, NICHT wax-cutout-soft: dessen weich ausgeblendeter
            Fuss existierte nur fuer den hellen Untergrund von v1/v2 — auf
            dunkler Kette blendet die fotografierte Kante von selbst, genau
            wie im Desktop-Hero). Position und Groesse haengen an svh, nie an
            einer max-height-Media-Query (siehe Kommentar in index.css). */}
        <button
          type="button"
          onClick={openDiveFromBlock}
          aria-label={de ? 'Blick ins Wachs — was im Wachs steckt' : 'Look inside the wax'}
          className="hero-block-m absolute z-[5]"
        >
          <span ref={mBlockInnerRef} className="relative block origin-center will-change-transform">
            {/* Kontaktschatten wie beim Desktop-Block — erdet den Freisteller
                auf der Kette, statt ihn schweben zu lassen. Kein blauer Glow:
                den hat Luca fuer Mobil ausdruecklich abgelehnt, Ripple und
                Lupe sind der Klick-Hinweis. */}
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 bottom-[4%] w-[76%] h-[22%] rounded-full pointer-events-none block"
              style={{ background: 'radial-gradient(ellipse, rgba(4,5,7,0.60), transparent 72%)', filter: 'blur(9px)' }}
            />
            <span className="relative block" style={{ filter: 'drop-shadow(-3px 10px 16px rgba(5,6,8,0.40))' }}>
              <picture>
                {/* AVIF zuerst — Begruendung bei waxImg weiter oben. */}
                <source srcSet="/images/hero/wax-cutout.avif" type="image/avif" />
                <source srcSet="/images/hero/wax-cutout.webp" type="image/webp" />
                <img
                  src="/images/hero/wax-cutout.png"
                  alt={de ? 'Waxcelerate Kettenwachs-Block' : 'Waxcelerate chain wax block'}
                  className="block w-full h-auto"
                  style={{ aspectRatio: '885 / 900' }}
                  fetchPriority="high"
                />
              </picture>
            </span>

            {/* Klick-Hinweis: Tap-Ripple + kurz aufblitzende Lupe, sonst
                nichts auf dem Block. GSAP im mobilen useEffect (alle ~6 s),
                stoppt dauerhaft nach dem ersten Tap (openDiveFromBlock). */}
            <span
              aria-hidden
              className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 pointer-events-none aspect-square"
              style={{ width: '32%' }}
            >
              <span
                ref={mRippleRef}
                className="absolute inset-0 rounded-full"
                style={{ border: '1.5px solid rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.10)' }}
              />
              <span
                ref={mMagRef}
                className="absolute inset-[22%] rounded-full flex items-center justify-center"
                style={{ background: 'rgba(12,15,22,0.58)', backdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.30)', boxShadow: '0 4px 14px rgba(0,0,0,0.28)' }}
              >
                <Search className="h-[48%] w-[48%]" style={{ color: '#fff' }} strokeWidth={2.2} />
              </span>
            </span>
          </span>
        </button>

        {/* Inhalt. pointer-events-none auf der Spalte, pointer-events-auto
            einzeln auf dem CTA — derselbe "Tap-Fresser"-Fix wie im
            Desktop-Hero (ein z-Container ueber der ganzen Hoehe schluckt
            sonst jeden Tap auf den Block darunter; das ist in dieser Datei
            schon dreimal passiert und auf Screenshots unsichtbar).
            pt-[96px] = Hoehe der mobilen Nav-Leiste (py-2 + h-16 = 80px)
            plus 16px Luft. */}
        <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none px-5 pt-[96px] pb-[calc(1rem+env(safe-area-inset-bottom))]">

          {/* Kopfgruppe: Eyebrow + Headline. Kein Schriftzug mehr im Hero —
              der steht jetzt in der Navigation neben dem Logo, wie auf
              Desktop (siehe navigation.tsx). */}
          <div>
            {/* Eyebrow — nennt die Kategorie. Zusammen mit der Kette im
                Hintergrund ist damit doppelt klar, worum es geht. */}
            <div data-hero className="flex items-center gap-3 mb-3">
              <span style={{ width: '26px', height: '2px', background: 'var(--brand-blue)' }} />
              <p
                className="hero-eyebrow text-small uppercase font-semibold"
                style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.72)', textShadow: HERO_TEXT_SHADOW }}
              >
                {t.hero.categoryLine}
              </p>
            </div>

            {/* fontSize 5,4svh: am unteren Ende real wirksam (34,6px bei 640px
                Hoehe, Deckel 48px erst ab ~890px). Ein frueherer Versuch mit
                8,5svh ueberschritt den Deckel bei JEDER Geraetehoehe und war
                dadurch konstant 48px — auf 360x640 stand die Headline damit
                im Block. max-w-[82%] haelt die Zeilenlaenge typografisch im
                Rahmen und den Text aus der hellsten Bildzone rechts. */}
            {/* <p>, nicht <h1>: die echte Ueberschrift steht als sr-only am
                Anfang der Section. Aussehen unveraendert — Fraunces kommt aus
                font-display, Weiss aus text-white; beides lag vorher nur
                zufaellig auch an den h1-Regeln in index.css. */}
            <p
              className="font-display text-white max-w-[82%]"
              style={{
                fontSize: 'clamp(1.7rem, 5.4svh, 3rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                fontWeight: 600,
                fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
                textShadow: HERO_TEXT_SHADOW,
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
            </p>
          </div>

          {/* Fussgruppe: CTA + Meta-Zeile (Sterne links, Preisanker rechts).
              Die dreispaltige Datenzeile aus v3 ist raus — Luca wollte Sterne
              und Preis zurueck, und beides zusammen unter dem Knopf laesst
              dem Block auf 640px hohen Geraeten zu wenig Buehne. */}
          <div>
            <button
              data-hero
              onClick={() => scrollTo('#produkte')}
              className="cta-primary group pointer-events-auto flex w-full items-center justify-center gap-3 px-8 py-[16px] text-[16px] font-bold rounded-full transition-all duration-300 active:scale-[0.97] will-change-transform"
              style={{ background: '#FFFFFF', color: '#0F0F12' }}
            >
              {t.hero.ctaBuy}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <div data-hero className="flex items-center justify-between mt-3">
              <span className="flex items-center gap-2">
                <Stars rating={5} color="rgba(255,255,255,0.95)" />
                <span className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.75)', textShadow: HERO_TEXT_SHADOW }}>
                  {trustStats.reviews} {de ? 'Bewertungen' : 'reviews'}
                </span>
              </span>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.92)', textShadow: HERO_TEXT_SHADOW }}>
                {t.hero.blockPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP / TABLET HERO (>= 640px) — full-bleed Karte ===== */}
      <div className="hidden sm:block px-3 sm:px-4 lg:px-6 pt-[84px] lg:pt-[104px] pb-3 sm:pb-4 lg:pb-6">
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[20px] sm:rounded-[28px]
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
          {/* overflow-hidden: das <img> traegt scale(1.035) als Overscan fuer die
              Maus-Parallax und ragt damit ueber jede Kante seines Containers
              hinaus. Hier zu clippen ist unschaedlich, weil der Container
              deckungsgleich mit der bereits clippenden Karte ist. */}
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
          </div>

          {/* Shadow leans slightly toward the content/CTA (bottom-left) instead of
              straight down — a soft directional cue, not a literal arrow. */}
          <div
            ref={blockRef}
            className="absolute z-[5] pointer-events-none will-change-transform
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
              effects cancel exactly. */}
          <div className="pointer-events-auto relative z-10 h-full w-full max-w-[1232px] mx-auto px-6 lg:px-8 xl:px-14">
            <div className="hero-zone1 h-full flex flex-col justify-end pb-32 lg:pb-28">
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

                {/* <p>, nicht <h1> — siehe Mobil-Fassung weiter oben. */}
                <p
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
                </p>

                <p
                  data-hero
                  className="mt-5 max-w-md leading-relaxed"
                  style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {t.hero.tagline}
                </p>

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
                      up (see its comment in index.css). */}
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

              </div>
            </div>
          </div>

          <div data-hero className="absolute bottom-0 inset-x-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-14 xl:px-20">

              {/* Tablet/Desktop — full bar (rating + stat grid) */}
              <div className="flex items-center justify-between py-5"
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
