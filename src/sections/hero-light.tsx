import { useCallback, useEffect, useLayoutEffect, useRef, useState, lazy, Suspense } from 'react';
import type { RefObject } from 'react';
import { ArrowRight, ZoomIn, Search, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useDispatchLine } from '@/hooks/useDispatchLine';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WaxLensCutout } from '@/sections/hero/WaxLensCutout';
import { waxLensEnabled } from '@/sections/hero/constants';
import { products, trustStats } from '@/lib/data';
import { costPerApplication, referenceWax } from '@/lib/waxMath';
import { Stars } from '@/components/Stars';

const WaxDive = lazy(() => import('@/sections/hero/WaxDive').then(m => ({ default: m.WaxDive })));

// ===== Hero v6 (09/2026): der Block ueber Stuttgart =====
// Vorher: weichgezeichnete Kettenmakro + freigestellter Block. Das zeigte
// Material, aber keinen Ort, und der Freisteller wirkte aufgeklebt. Jetzt ein
// einziges echtes Foto (raw-image-library/products/classic/DSC05255.png): der
// Classic-Block auf einer Schiefermauer, dahinter das Tal mit Dorf und
// Weinbergen. Die Herkunft steht damit im Bild und nicht nur im Text.
//
// Beide Exporte stammen aus demselben Original (6000x4000), leicht gegradet
// (Lichter gedaempft, Himmel abgedunkelt, Block farbtreu). Der Block ist
// Teil des Fotos. Klick-Hotspot und Lupe werden deshalb per object-fit-
// cover-Rechnung auf ihn gelegt (useCoverBox). `box` sind seine Kanten im
// jeweiligen Export als Bruchteil von Breite/Hoehe, am Original gemessen:
// x 2691-4124, y 1905-3345.
// Bei Bildtausch: Preloads in index.html + HOME_ONLY_PRELOADS in
// scripts/lib/prerender.mjs am Namen stuttgart-wall nachziehen.
const DESKTOP = {
  src: '/images/hero/stuttgart-wall',
  w: 2400, h: 1600,
  // 72 % vertikal: bei 1,8:1 bis 2:1 Kartenformat bleibt unter dem Block
  // Schiefer fuer die Fussleiste sichtbar, oben Dorf und Huegelkamm.
  pos: [0.5, 0.72],
  box: [0.4485, 0.4763, 0.6873, 0.8363],
} as const;
// 3:4-Ausschnitt um den Block (x 1907-4907): breiter als 9:16, damit der
// Block auf dem Handy rund 60 % statt 90 % der Breite einnimmt.
const MOBILE = {
  src: '/images/hero/stuttgart-wall-mobile',
  w: 1200, h: 1600,
  pos: [0.5, 0.5],
  box: [0.2613, 0.4763, 0.7390, 0.8363],
} as const;

type Photo = {
  src: string; w: number; h: number;
  pos: readonly [number, number];
  box: readonly [number, number, number, number];
};

// Alle weissen Textzeilen ueber dem Foto tragen denselben leichten Schatten,
// damit die Lesbarkeit nicht davon abhaengt, was zufaellig dahinter liegt.
const HERO_TEXT_SHADOW = '0 1px 3px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.35)';

/**
 * Legt boxRef exakt auf den Block im Foto. frameRef ist die Flaeche, die das
 * Bild mit object-fit: cover fuellt (clientWidth/-Height, also ohne GSAP-
 * Transforms — die erbt der Hotspot als Kind derselben Ebene). Layout-Effekt,
 * weil WaxLensCutout (ein Kind) das Rechteck in seinem eigenen Effekt misst:
 * Kind-Effekte laufen vor Eltern-Effekten, Layout-Effekte vor allen passiven.
 */
function useCoverBox(frameRef: RefObject<HTMLElement | null>, boxRef: RefObject<HTMLElement | null>, photo: Photo) {
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const el = boxRef.current;
    if (!frame || !el) return;
    const place = () => {
      const cw = frame.clientWidth, ch = frame.clientHeight;
      if (!cw || !ch) return;
      const s = Math.max(cw / photo.w, ch / photo.h);
      const rw = photo.w * s, rh = photo.h * s;
      const ox = (cw - rw) * photo.pos[0], oy = (ch - rh) * photo.pos[1];
      const [x0, y0, x1, y1] = photo.box;
      el.style.left = `${ox + x0 * rw}px`;
      el.style.top = `${oy + y0 * rh}px`;
      el.style.width = `${(x1 - x0) * rw}px`;
      el.style.height = `${(y1 - y0) * rh}px`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [frameRef, boxRef, photo]);
}

function HeroPhoto({ photo, alt }: { photo: Photo; alt: string }) {
  return (
    <picture>
      <source srcSet={`${photo.src}.avif`} type="image/avif" />
      <source srcSet={`${photo.src}.webp`} type="image/webp" />
      <img
        src={`${photo.src}.jpg`}
        alt={alt}
        width={photo.w}
        height={photo.h}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: `${photo.pos[0] * 100}% ${photo.pos[1] * 100}%` }}
        fetchPriority="high"
      />
    </picture>
  );
}

// Dezente Flagge statt Emoji: 14x9 mit feiner Haarlinie, damit der schwarze
// Streifen auf dem dunklen Scrim nicht verschwindet.
function GermanFlag() {
  return (
    <svg width="14" height="9" viewBox="0 0 14 9" aria-hidden className="shrink-0 rounded-[1.5px]"
         style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.28)' }}>
      <rect width="14" height="3" y="0" fill="#000" />
      <rect width="14" height="3" y="3" fill="#DD0000" />
      <rect width="14" height="3" y="6" fill="#FFCE00" />
    </svg>
  );
}

function OriginLine({ label }: { label: string }) {
  return (
    <div data-hero className="flex items-center gap-2.5 mb-4 sm:mb-5">
      <GermanFlag />
      <p
        className="hero-eyebrow text-small uppercase font-semibold"
        style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.84)', textShadow: HERO_TEXT_SHADOW }}
      >
        {label}
      </p>
    </div>
  );
}

// Dieselbe Live-Zeile wie Topbar und Kaufblock ("Heute versandt, wenn du in
// 2 Std 14 Min bestellst") statt des pauschalen "1 Tag Versand".
function DispatchLine({ de, className = '' }: { de: boolean; className?: string }) {
  const line = useDispatchLine(de);
  return (
    <span className={`items-center gap-2 ${className}`} style={{ color: 'rgba(255,255,255,0.78)', textShadow: HERO_TEXT_SHADOW }}>
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
        <span className="hero-live-ping absolute inline-flex h-full w-full rounded-full" style={{ background: '#4ADE80' }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#4ADE80' }} />
      </span>
      <span className="[&_b]:font-semibold [&_b]:text-white">{line}</span>
    </span>
  );
}

const minWaxPrice = Math.min(...products.filter(p => p.category === 'wax').map(p => p.price));
const perWaxing = costPerApplication(referenceWax);

export function Hero() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [diveOpen, setDiveOpen] = useState(false);
  const [lensOn] = useState(() => waxLensEnabled());

  const eur = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-GB', { style: 'currency', currency: 'EUR' });
  const priceFrom = `${de ? 'ab' : 'from'} ${eur(minWaxPrice)}`;

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
  const imgRef       = useRef<HTMLDivElement>(null);
  const blockRef     = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLButtonElement>(null);
  const mFrameRef    = useRef<HTMLDivElement>(null);
  const mBlockRef    = useRef<HTMLButtonElement>(null);
  const mRippleRef   = useRef<HTMLSpanElement>(null);
  const mMagRef      = useRef<HTMLSpanElement>(null);
  const mHintTlRef   = useRef<gsap.core.Timeline | null>(null);
  // Haelt den wiederkehrenden "hier klicken"-Hinweis, damit der erste echte
  // Treffer der Lupe ihn beenden kann.
  const nudgeTlRef = useRef<gsap.core.Timeline | null>(null);

  // Der Desktop-Hotspot liegt INNERHALB von imgRef und bewegt sich dadurch
  // mit Ken Burns, Parallax und Scroll-Scrub des Fotos exakt mit.
  useCoverBox(imgRef, blockRef, DESKTOP);
  useCoverBox(mFrameRef, mBlockRef, MOBILE);

  const onLensActiveChange = useCallback((active: boolean) => {
    if (!active) return;
    nudgeTlRef.current?.kill();
    if (hintRef.current) gsap.to(hintRef.current, { autoAlpha: 0, duration: 0.25, overwrite: 'auto' });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    const cardInner = cardInnerRef.current;
    const img = imgRef.current;
    if (!root || !card || !cardInner || !img) return;

    const words = root.querySelectorAll<HTMLElement>('[data-word]');
    const items = root.querySelectorAll<HTMLElement>('[data-hero]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Ruhelage 1.06: 3 % Ueberstand je Kante deckt Parallax (max 10 px) und
    // Scroll-Scrub (3 %) ab, ohne dass je eine Kartenkante freiliegt.
    const REST = 1.06;
    if (reduced) {
      gsap.set(words, { yPercent: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(cardInner, { opacity: 1, y: 0 });
      gsap.set(img, { scale: REST });
      return;
    }

    const tl = gsap.timeline({ delay: 0.05, defaults: { ease: 'power4.out' } });
    tl.fromTo(cardInner, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0);
    // Ken Burns: das Tal oeffnet sich langsam, statt stehend einzublenden.
    tl.fromTo(img, { scale: 1.14 }, { scale: REST, duration: 3.2, ease: 'power2.out' }, 0);
    tl.fromTo(words, { yPercent: -120 }, { yPercent: 0, duration: 0.72, ease: 'back.out(1.3)', stagger: 0.15 }, 0.75);
    tl.fromTo(items, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 1.0);

    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }));
    scrub(gsap.to(img, { yPercent: 3, ease: 'none' }));
    if (contentRef.current) scrub(gsap.to(contentRef.current, { y: -40, opacity: 0.25, ease: 'none' }));
    scrub(gsap.to(cardInner, { scale: 0.965, transformOrigin: '50% 100%', ease: 'none' }));

    // "Welcher ist deiner?" blitzt alle ~7 s am Block auf, bis die Lupe
    // einmal wirklich getroffen wurde (onLensActiveChange).
    let nudgeTl: gsap.core.Timeline | undefined;
    if (hintRef.current && lensOn) {
      gsap.set(hintRef.current, { autoAlpha: 0, scale: 0.85 });
      nudgeTl = gsap.timeline({ delay: 2.2, repeat: -1, repeatDelay: 5.5 });
      nudgeTl
        .to(hintRef.current, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)' })
        .to(hintRef.current, { autoAlpha: 0, scale: 0.92, duration: 0.35, ease: 'power2.in' }, '+=1.6');
      nudgeTlRef.current = nudgeTl;
    }

    let onMove: ((e: MouseEvent) => void) | undefined;
    if (finePointer) {
      const qx = gsap.quickTo(img, 'x', { duration: 1.0, ease: 'power3.out' });
      const qy = gsap.quickTo(img, 'y', { duration: 1.0, ease: 'power3.out' });
      onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        // Clamp: der "Resync"-mousemove nach einem Reload kann bei noch nicht
        // fertigem Layout beliebige Werte liefern.
        if (r.width < 10 || r.height < 10) return;
        const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
        const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
        qx(nx * -10); qy(ny * -7);
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
      if (onMove) card.removeEventListener('mousemove', onMove);
      if (cta && ctaMove) cta.removeEventListener('mousemove', ctaMove);
      if (cta && ctaLeave) cta.removeEventListener('mouseleave', ctaLeave);
      triggers.forEach((s) => s.kill());
      nudgeTl?.kill();
      nudgeTlRef.current = null;
      tl.kill();
    };
  }, [lensOn]);

  // Mobiler Klick-Hinweis: alle ~6 s ein weicher Tap-Ripple plus kurz
  // aufblitzende Lupe auf dem Block. Kein Wobble mehr — der Block ist Teil
  // des Fotos, Bewegung wuerde dort wie ein Bildfehler wirken.
  useEffect(() => {
    const ripple = mRippleRef.current;
    const mag = mMagRef.current;
    if (!ripple || !mag) return;
    if (!window.matchMedia('(max-width: 639px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(ripple, { autoAlpha: 0, scale: 0.35, transformOrigin: '50% 50%' });
    gsap.set(mag, { autoAlpha: 0, scale: 0.8, y: 4 });
    const hintTl = gsap.timeline({ repeat: -1, repeatDelay: 4.6, delay: 2.2 });
    hintTl
      .to(ripple, { autoAlpha: 1, scale: 0.5, duration: 0.01 })
      .to(ripple, { scale: 2.1, autoAlpha: 0, duration: 1.5, ease: 'sine.out' }, 0)
      .to(mag, { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }, 0.05)
      .to(mag, { autoAlpha: 0, scale: 0.85, y: 3, duration: 0.35, ease: 'power2.in' }, '+=1.0');
    mHintTlRef.current = hintTl;
    return () => { hintTl.kill(); mHintTlRef.current = null; };
  }, []);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const photoAlt = de
    ? 'Blauer Waxcelerate-Kettenwachsblock auf einer Schiefermauer über einem Tal bei Stuttgart'
    : 'Blue Waxcelerate chain wax block on a slate wall above a valley near Stuttgart';

  const headline = (
    <>
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
    </>
  );

  const rating = (
    <span className="flex items-center gap-2">
      <Stars rating={5} color="rgba(255,255,255,0.95)" emptyColor="rgba(255,255,255,0.25)" />
      <span className="tabular-nums whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.78)', textShadow: HERO_TEXT_SHADOW }}>
        <b className="font-semibold text-white">{de ? '5,0' : '5.0'}</b> · {trustStats.reviews} {t.hero.reviewsLine}
      </span>
    </span>
  );

  return (
    <section id="home" ref={rootRef} className="hero-editorial relative" style={{ background: 'var(--pg)' }}>
      {/* Die einzige <h1> der Startseite, visuell verborgen: "Am Ende der
          Recherche." ist Marken-Headline, benennt aber das Angebot nicht. */}
      <h1 className="sr-only">{t.hero.a11yHeading}</h1>

      {/* ===== MOBILE-HERO (< 640px) ===== */}
      {/* Hochformat-Ausschnitt desselben Fotos. Die Foto-Ebene endet 150 px
          ueber dem unteren Rand und laeuft dort in die dunkle Buehne aus: CTA
          und Meta-Zeile stehen auf ruhigem Grund, nie auf dem Block. Sitzt
          hinter der transparenten Navigation, beginnt bei y=0. Keine
          Versandzeile hier: die Topbar zeigt auf dem Handy denselben Satz
          direkt darueber. */}
      <div className="sm:hidden relative h-[calc(100svh-var(--topbar-h))] min-h-[528px] w-full overflow-hidden" style={{ background: 'var(--hero-stage)' }}>
        <div ref={mFrameRef} className="absolute inset-x-0 top-0" style={{ bottom: 150 }}>
          <HeroPhoto photo={MOBILE} alt={photoAlt} />
          {/* Scrims: oben kraeftig (Headline ueber hellem Dorf), unten ein
              Band fuer CTA und Meta-Zeile. Der Block selbst bleibt frei. */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'linear-gradient(to bottom, rgba(var(--scrim-rgb),0.66) 12%, rgba(var(--scrim-rgb),0.42) 34%, rgba(var(--scrim-rgb),0.06) 52%, transparent 60%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-[18%] pointer-events-none"
               style={{ background: 'linear-gradient(to top, var(--hero-stage) 0%, rgba(11,12,14,0.55) 45%, transparent 100%)' }} />

          <button
            ref={mBlockRef}
            type="button"
            onClick={openDiveFromBlock}
            aria-label={de ? 'Welcher Block ist deiner — Wachs finden' : 'Which block is yours — find your wax'}
            className="absolute z-[5] rounded-[6px]"
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none aspect-square"
              style={{ width: '32%' }}
            >
              <span ref={mRippleRef} className="absolute inset-0 rounded-full"
                    style={{ visibility: 'hidden', border: '1.5px solid rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.10)' }} />
              <span
                ref={mMagRef}
                className="absolute inset-[22%] rounded-full flex items-center justify-center"
                style={{ visibility: 'hidden', background: 'rgba(12,15,22,0.58)', backdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.30)', boxShadow: '0 4px 14px rgba(0,0,0,0.28)' }}
              >
                <Search className="h-[48%] w-[48%]" style={{ color: '#fff' }} strokeWidth={2.2} />
              </span>
            </span>
          </button>
        </div>
        <div className="hero-grain absolute inset-0 pointer-events-none" />

        {/* pointer-events-none auf der Spalte, sonst schluckt sie jeden Tap
            auf den Block darunter. pt-[96px] = mobile Nav (80px) + Luft. */}
        <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none px-5 pt-[96px] pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div>
            <OriginLine label={t.hero.originLine} />
            <p
              className="font-display text-white max-w-[88%]"
              style={{
                fontSize: 'clamp(1.7rem, 5.4svh, 3rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                fontWeight: 600,
                fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
                textShadow: HERO_TEXT_SHADOW,
              }}
            >
              {headline}
            </p>
          </div>

          {/* Meta-Zeile ueber dem Knopf: sie ist das letzte, was man vor
              der Entscheidung liest, und der Knopf sitzt daumennah unten. */}
          <div>
            <div data-hero className="flex items-center justify-between gap-3 mb-3 text-[12px]">
              <span className="flex items-center gap-2 min-w-0">
                <Stars rating={5} color="rgba(255,255,255,0.95)" emptyColor="rgba(255,255,255,0.25)" />
                <span className="tabular-nums truncate" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  <b className="font-semibold text-white">{de ? '5,0' : '5.0'}</b> · {trustStats.reviews} {t.hero.reviewsShort}
                </span>
              </span>
              <span className="font-semibold tabular-nums text-white whitespace-nowrap">{priceFrom}</span>
            </div>
            <button
              data-hero
              onClick={() => scrollTo('#produkte')}
              className="cta-primary group pointer-events-auto flex w-full items-center justify-center gap-3 px-8 py-[16px] text-[16px] font-bold rounded-full transition-all duration-300 active:scale-[0.97] will-change-transform"
              style={{ background: '#FFFFFF', color: '#0F0F12' }}
            >
              {t.hero.ctaBuy}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP / TABLET HERO (>= 640px) — Karte ===== */}
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
        {/* Transform auf der inneren Ebene, nicht auf der clippenden Karte:
            Chromium rendert die Radien sonst fuer einen Frame eckig. */}
        <div ref={cardInnerRef} className="absolute inset-0 will-change-transform">
          <div ref={imgRef} className="absolute inset-0 will-change-transform" style={{ transform: 'scale(1.06)' }}>
            <HeroPhoto photo={DESKTOP} alt={photoAlt} />

            {/* Scrims liegen in imgRef und bewegen sich mit dem Foto. Links ein
                Verlauf fuer die Textspalte, unten links die Verdichtung hinter
                Headline und CTA, unten ein Band fuer die Fussleiste. Rechts
                bleibt das Tal hell. */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, rgba(var(--scrim-rgb),0.50) 0%, rgba(var(--scrim-rgb),0.28) 32%, transparent 52%)' }} />
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse 70% 95% at 0% 100%, rgba(var(--scrim-rgb),0.78) 0%, rgba(var(--scrim-rgb),0.42) 45%, transparent 72%)' }} />
            <div className="absolute top-0 inset-x-0 h-24 pointer-events-none"
                 style={{ background: 'linear-gradient(to bottom, rgba(var(--scrim-rgb),0.30), transparent)' }} />
            <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
                 style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.62), transparent)' }} />

            {/* Hotspot ueber dem fotografierten Block (Position: useCoverBox). */}
            <div ref={blockRef} className="absolute pointer-events-none">
              <div
                ref={hintRef}
                aria-hidden
                className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  visibility: 'hidden',
                  background: 'rgba(10,12,18,0.72)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.30)',
                }}
              >
                <ZoomIn className="h-3.5 w-3.5" style={{ color: '#fff' }} strokeWidth={2} />
                <span className="whitespace-nowrap text-small uppercase font-semibold"
                      style={{ letterSpacing: '0.1em', color: 'rgba(255,255,255,0.94)' }}>
                  {t.hero.whichIsYours}
                </span>
              </div>
            </div>
          </div>

          <WaxLensCutout waxRef={blockRef} enabled={lensOn} de={de} mask={null}
                         onOpen={openDive} onActiveChange={onLensActiveChange} />

          {/* Ortsmarke wie eine Bildunterschrift. */}
          <p data-hero
             className="absolute top-5 right-6 lg:top-6 lg:right-8 z-10 flex items-center gap-1.5 text-[11px] uppercase font-medium tabular-nums"
             style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.82)', textShadow: HERO_TEXT_SHADOW }}>
            <MapPin className="h-3 w-3" strokeWidth={2} aria-hidden />
            {t.hero.locationMark}
          </p>

          {/* Linke Kante deckungsgleich mit dem Section-Raster. */}
          <div className="pointer-events-none relative z-10 h-full w-full max-w-[1232px] mx-auto px-6 lg:px-8 xl:px-14">
            <div className="h-full flex flex-col justify-end pb-28 lg:pb-24">
              <div ref={contentRef} className="pointer-events-auto shrink-0 max-w-[34rem] will-change-transform">
                <OriginLine label={t.hero.originLine} />

                {/* <p>, nicht <h1> — siehe sr-only-Ueberschrift oben. */}
                <p
                  className="hero-h1 font-display text-white"
                  style={{
                    fontSize: 'clamp(2.5rem, 5.2vw, 4.6rem)',
                    lineHeight: 1.0,
                    letterSpacing: '-0.025em',
                    fontWeight: 600,
                    fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
                    textShadow: '0 2px 24px rgba(0,0,0,0.30)',
                  }}
                >
                  {headline}
                </p>

                <p
                  data-hero
                  className="mt-5 max-w-md leading-relaxed"
                  style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.86)', textShadow: HERO_TEXT_SHADOW }}
                >
                  {t.hero.tagline}
                </p>

                <div data-hero className="mt-7 flex items-center gap-5">
                  <button
                    ref={ctaRef}
                    onClick={() => scrollTo('#produkte')}
                    className="cta-primary group inline-flex shrink-0 whitespace-nowrap items-center justify-center gap-3 px-10 py-[18px] text-[16px] font-bold rounded-full transition-all duration-300 active:scale-[0.97] will-change-transform"
                    style={{ background: '#FFFFFF', color: '#0F0F12' }}
                  >
                    {t.hero.ctaBuy}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={openDive}
                    className="hero-cta-secondary inline-flex items-center gap-2 text-[13px] font-medium whitespace-nowrap"
                  >
                    <Search className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    {t.hero.whichIsYours}
                  </button>
                  <button
                    onClick={() => scrollTo('#warum-wachs')}
                    className="hidden 2xl:inline text-[13px] font-medium underline underline-offset-4 whitespace-nowrap"
                    style={{ color: 'rgba(255,255,255,0.78)', textDecorationColor: 'rgba(255,255,255,0.30)', textShadow: HERO_TEXT_SHADOW }}
                  >
                    {t.hero.ctaSecondary}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fussleiste auf dem Schiefer: Beleg · Live-Versand · Preisanker. */}
          <div data-hero className="absolute bottom-0 inset-x-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-14 xl:px-20">
              <div className="flex items-center justify-between gap-6 py-5 text-[13px]"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.16)' }}>
                {rating}
                <DispatchLine de={de} className="hidden lg:flex" />
                <span className="flex items-baseline gap-2 tabular-nums whitespace-nowrap" style={{ textShadow: HERO_TEXT_SHADOW }}>
                  <span className="font-display font-semibold text-white" style={{ fontSize: '1.125rem' }}>{priceFrom}</span>
                  {perWaxing !== null && (
                    <span style={{ color: 'rgba(255,255,255,0.74)' }}>
                      · ~{eur(perWaxing)} {t.hero.perApplication}
                    </span>
                  )}
                </span>
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
