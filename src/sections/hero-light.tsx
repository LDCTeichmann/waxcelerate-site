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

// ===== TAUSCHPUNKT MOBILES VOLLBILDFOTO =====
// v3 (09/2026): traegt den GESAMTEN Mobile-Hero randlos, kein Panel, kein
// Freisteller, kein Scrim mehr. chain-bg-mobile ist 960x1707 (0,562), also
// praktisch Handy-Seitenverhaeltnis — lag bis hierhin ungenutzt im Repo.
// Gemessen (nicht geschaetzt), Kontrast fuer WEISSEN Text je Hoehenband —
// rechts liegt ein Blattfragment, das bei voller Breite auf 6,2:1 einbricht,
// deshalb pro Zeile ein eigenes max-w im Markup statt einer pauschalen Zahl:
// Kopfzeile (Eyebrow-Hoehe) bleibt bis 95% Breite bei >=12,5:1, die Headline
// zwei Zeilen tiefer (das Blatt reicht dort naeher heran) nur bis 88% Breite
// bei >=7,2:1 — Fuss-/CTA-Baender sind durchgehend bei 9,5–18,8:1, dort ist
// weder das Blatt noch der Block im Bild noch praesent. Deshalb kein
// Verlauf/Scrim noetig. Anforderung an ein Ersatzbild: gleiche
// Devise — ein Motiv MIT Wachsblock, dessen obere ~40% und untere ~20% dunkel
// genug fuer weissen Text sind (>_ 7:1 gemessen, nicht geschaetzt), Rest darf
// hell sein. Bei Bildtausch: Preload in index.html + Strip-Regex in
// scripts/lib/prerender.mjs am Namen chain-bg-mobile.webp nachziehen, und die
// Block-Trefferflaeche in BLOCK_HOTSPOT unten (per Farbsegmentierung
// gemessene Bildanteile) neu bestimmen.
const MOBILE_HERO_BG = '/images/hero/chain-bg-mobile.webp';
const MOBILE_HERO_BG_FALLBACK = '/images/hero/chain-bg-mobile.jpg';

// Trefferflaeche fuer "Blick ins Wachs" auf dem Vollbildfoto, als Bildanteile
// (per Farbsegmentierung gemessen, 2/98-Quantile: x 0,2208-0,7833, y
// 0,4616-0,7803). Diese Bildanteile werden auf ein Element gemappt, das
// exakt dieselbe object-cover-Geometrie wie das <img> nachbildet (siehe
// .hero-cover-frame unten) — nur so landet der Hotspot unabhaengig vom
// Geraete-Seitenverhaeltnis auf dem tatsaechlichen Block und nicht auf einem
// je nach Zuschnitt verschobenen Punkt.
const BLOCK_HOTSPOT = { left: 22.08, top: 46.16, width: 78.33 - 22.08, height: 78.03 - 46.16 };

// Alle weissen Textzeilen im v3-Mobile-Hero tragen denselben leichten
// Schatten. Gemessen (Canvas-Pixelsampling der tatsaechlich gerenderten
// Fotoflaeche hinter dem jeweiligen Element, nicht der Quelldatei): bei
// 375x667 faellt der Kontrast unter der Bildunterschrift auf 4,5:1 und unter
// dem Schriftzug auf 5,18:1 — beides technisch noch WCAG-AA, aber naeher an
// der Grenze als der Rest (9,3–18,8:1). Ein Schatten macht die Lesbarkeit
// unabhaengig von der jeweiligen Bildstelle, ohne einen Verlauf/Scrim
// einzufuehren — dieselbe Technik wie das "Blick ins Wachs"-Label in
// WaxLensCutout.tsx (dort: textShadow, hier zusaetzlich als drop-shadow-
// Filter fuers SVG, weil text-shadow auf <text> nicht in jedem Renderer
// zuverlaessig greift).
const HERO_TEXT_SHADOW = '0 1px 3px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.35)';


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

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  // lShort: Kurzlabel fuer die mobile Datenzeile (drei schmale Spalten auf
  // ~335px). Desktop nutzt weiterhin das lange Label `l`.
  const stats = [
    { v: `${waxVsOil.life.waxLo}–${waxVsOil.life.wax}×`, l: de ? 'Kettenlaufzeit'    : 'chain life', lShort: de ? 'Laufzeit' : 'chain life' },
    { v: '~€70',  l: de ? 'gespart · 12.000 km' : 'saved · 12,000 km', lShort: de ? 'gespart' : 'saved' },
    { v: '1 Tag', l: de ? 'Versand nach Bestellung' : 'ships after order', lShort: de ? 'Versand' : 'shipping' },
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
      {/* ===== MOBILE-HERO (< 640px) v3 — Vollbild-Fotografie ===== */}
      {/* Nach Lucas Kritik an v2 ("langweilig, schlecht designed" + ein
          Groessen-Sprung-Bug beim Scrollen, siehe index.css) komplett neu
          gebaut: ein einziges Foto traegt den GESAMTEN Hero randlos. Keine
          Karte, keine Radien, kein Freisteller, keine Maske, KEIN Scrim —
          jede Artefakt-Klasse, die v2 noch hatte, faellt damit weg, weil es
          sie strukturell nicht mehr geben kann.
          Gemessen an den tatsaechlichen Pixeln von chain-bg-mobile.jpg: Kopf-,
          Eyebrow- und Fussbaender liegen bei 9,5–18,8:1 Kontrast fuer WEISSEN
          Text auch ueber die volle Spaltenbreite. Nur die Headline (zwei
          Zeilen tiefer, das Blattfragment rechts reicht dort naeher heran)
          braucht ein eigenes max-w-[82%] — bei voller Breite bricht sie auf
          6,2:1 ein, bei 82% liegt sie noch bei 9,3:1.
          Sitzt hinter der Navigation (siehe navigation.tsx, heroTransparent:
          auf der Startseite ungescrollt transparent, faerbt sich beim
          Scrollen ein) — deshalb hier KEIN pt-[84px]-Ausgleich mehr, das Foto
          beginnt bei y=0 und die Navigation schwebt darueber. */}
      <div className="sm:hidden relative h-[100svh] min-h-[560px] w-full overflow-hidden">
        <picture>
          <source srcSet={MOBILE_HERO_BG} type="image/webp" />
          <img
            src={MOBILE_HERO_BG_FALLBACK}
            alt={de ? 'Wachsblock auf nassem Schiefer' : 'Wax block on wet slate'}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 50%' }}
            fetchPriority="high"
          />
        </picture>
        <div className="hero-grain absolute inset-0 pointer-events-none" />

        {/* Trefferflaeche "Blick ins Wachs" — KEIN Badge, KEIN Ripple, KEIN
            Glow auf dem Block selbst (Luca: "nicht zu viel SaaS-KI-Optik").
            Die einzige Auffindbarkeit ist die Bildunterschrift weiter unten.
            .hero-cover-frame bildet die object-cover-Geometrie des <img>
            oben NACH (Flex + fixes aspect-ratio + min-width/height:100% ist
            exakt dieselbe Groessenberechnung, die der Browser fuer
            object-fit:cover verwendet) — nur dadurch landet die Prozent-
            Position aus BLOCK_HOTSPOT unabhaengig vom Geraete-
            Seitenverhaeltnis auf dem tatsaechlichen Block und nicht auf
            einem je nach Zuschnitt verschobenen Punkt (siehe die
            Sackgassen-Notiz zu genau diesem Fehler in der Projekt-Memory). */}
        <div className="hero-cover-frame absolute inset-0 pointer-events-none">
          <div className="relative" style={{ aspectRatio: '960 / 1707', minWidth: '100%', minHeight: '100%' }}>
            <button
              type="button"
              onClick={openDive}
              aria-label={de ? 'Blick ins Wachs — was im Wachs steckt' : 'Look inside the wax'}
              className="absolute pointer-events-auto"
              style={{
                left: `${BLOCK_HOTSPOT.left}%`,
                top: `${BLOCK_HOTSPOT.top}%`,
                width: `${BLOCK_HOTSPOT.width}%`,
                height: `${BLOCK_HOTSPOT.height}%`,
              }}
            />
          </div>
        </div>

        {/* Inhalt. pointer-events-none auf der Spalte, pointer-events-auto
            einzeln auf CTA — derselbe "Tap-Fresser"-Fix wie im Desktop-Hero
            (ein z-Container ueber der ganzen Hoehe schluckt sonst jeden Tap
            auf den Hotspot darunter; das ist in dieser Datei schon dreimal
            passiert und auf Screenshots unsichtbar). pt-[96px] = Hoehe der
            mobilen Nav-Leiste (py-2 + h-16 = 80px) plus 16px Luft. */}
        <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none px-5 pt-[96px] pb-[calc(1rem+env(safe-area-inset-bottom))]">

          {/* Kopfgruppe: Masthead randbuendig ueber volle Geraetebreite,
              darunter Eyebrow + Headline in der linken 70%. */}
          <div>
            {/* Masthead — der grosse "Waxcelerate"-Schriftzug, den Luca an v2
                vermisst hat. -mx-5 hebt das px-5 der Elternspalte fuer dieses
                eine Element auf, damit es wirklich Kante-zu-Kante des
                Geraets läuft, nicht nur innerhalb der Textspalte. textLength
                + lengthAdjust="spacing" zwingt die Laufweite auf exakt 97 %
                der viewBox-Breite (x=15 bis 985 von 1000), unabhaengig von
                Displaybreite/Sprache — ohne JS, ohne Layout-Shift. Bewusst
                NICHT die volle 0..1000: randscharfe Glyphen exakt auf der
                Geraetekante lasen sich im Test wie ein Beschnittfehler, nicht
                wie Absicht; 1,5 % Luft je Seite (~5,6px auf 375px) genuegt,
                um "randbuendig" von "abgeschnitten" zu unterscheiden.
                "spacing" (nicht "spacingAndGlyphs"), damit nur der
                Zwischenraum waechst und keine Buchstabenform verzerrt wird.
                Gewicht 700, nicht 800: diese Site laedt Libre Franklin nur in
                400/500/600/700/900 (siehe fonts.css) — angefordertes 800
                loest laut CSS-Gewichts-Fallback auf das naechsthoehere
                verfuegbare Gewicht auf, hier 900 (Black). Bei einem derart
                grossen, randbuendigen Schriftzug macht das den Unterschied
                zwischen einem eleganten Zeitschriften-Kopf und einem
                schreienden Balken; 700 ist die naeher am Original gemeinte
                Absicht. */}
            <div data-hero className="-mx-5">
              <svg viewBox="0 0 1000 120" width="100%" style={{ display: 'block' }} aria-hidden focusable="false">
                <text
                  x="15" y="86"
                  textLength="970"
                  lengthAdjust="spacing"
                  fontFamily="'Libre Franklin', ui-sans-serif, system-ui, sans-serif"
                  fontWeight={700}
                  fontSize="66"
                  fill="#fff"
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.45)) drop-shadow(0 2px 10px rgba(0,0,0,0.35))' }}
                >
                  WAXCELERATE
                </text>
              </svg>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.24)' }} />
            </div>

            <div className="mt-5">
              {/* Eyebrow — sagt die Kategorie. Im Foto liegt KEINE Kette (nur
                  der Block), ohne Kontext liest ein blauer Block sonst wie
                  Seife — die Eyebrow loest das auf, nicht der Schriftzug
                  darueber (der nennt nur die Marke). Kein max-w hier: bei
                  y ~10-15% (ihrer Bildhoehe) bleibt der Kontrast bis zur
                  vollen Spaltenbreite bei >=12,5:1 gemessen — die 70%-Regel
                  gilt fuer die HEADLINE, die zwei Zeilen tiefer sitzt, wo das
                  Blatt rechts schon naeher heranreicht. */}
              <div data-hero className="flex items-center gap-3 mb-3">
                <span style={{ width: '26px', height: '2px', background: 'var(--brand-blue)' }} />
                <p
                  className="hero-eyebrow text-small uppercase font-semibold"
                  style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.72)', textShadow: HERO_TEXT_SHADOW }}
                >
                  {t.hero.categoryLine}
                </p>
              </div>

              {/* max-w-[82%] statt 70%: bei y ~15-30% (Headline-Bandhoehe)
                  bleibt der Kontrast bis 88% Spaltenbreite bei >=7,2:1 (AA
                  fuer grosse Schrift) — 82% laesst spuerbaren Sicherheitsabstand
                  UND reicht, damit "Am Ende der" auf einer Zeile bleibt statt
                  mitten im Satz umzubrechen.
                  fontSize 5,4svh statt (der urspruenglich versuchten) 8,5svh:
                  8,5svh ueberschritt den 3rem-Deckel bei JEDER getesteten
                  Geraetehoehe (640-932px) und blieb dadurch konstant bei 48px
                  — der Clamp wirkte also gar nicht. Auf 360x640 stand die
                  Headline dadurch mit -51px (!) buchstaeblich IM Wachsblock.
                  5,4svh ist am unteren Ende real wirksam: 34,6px bei 640px
                  Hoehe (30px Abstand zum Block), 48px (Deckel) erst ab
                  ~890px. Gemessen bei 360x640 / 375x667 / 375x812 / 430x932:
                  Abstand Headline -> Block 30 / 36 / 86 / 125px, durchgehend
                  positiv. */}
              <h1
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
              </h1>
            </div>
          </div>

          {/* Fussgruppe: Bildunterschrift (zentriert unter dem Block, einzige
              Auffindbarkeit fuer "Blick ins Wachs"), CTA, Datenzeile. Gemessen
              y ~78–100% des Fotos: 9,5–18,8:1 Kontrast, auch ohne die
              linke-70%-Regel — der Block ist zu diesem Zeitpunkt im Bild
              schon zu Ende und das Blatt laengst ausgeblendet. */}
          <div>
            <p
              data-hero
              className="text-center text-small uppercase font-semibold mb-4"
              style={{ letterSpacing: '0.12em', color: 'rgba(255,255,255,0.72)', textShadow: HERO_TEXT_SHADOW }}
            >
              {de ? 'Blick ins Wachs →' : 'Look inside the wax →'}
            </p>

            {/* Kein cta-brand-pulse (siehe Desktop-Nav-CTA-Kommentar):
                .cta-primary ist die richtige Wahl hier — dieselbe kaum
                merkliche Atem-Glow-Klasse wie die Desktop-Hero-CTA, mit
                derselben weissen Pille, damit Handy und Desktop dieselbe
                CTA-Sprache sprechen statt der alten theme-abhaengigen
                .btn-primary (dunkel/hell je nach Theme), die auf einem
                immer-dunklen Foto nicht mehr passt. */}
            <button
              data-hero
              onClick={() => scrollTo('#produkte')}
              className="cta-primary group pointer-events-auto flex w-full items-center justify-center gap-3 px-8 py-[16px] text-[16px] font-bold rounded-full transition-all duration-300 active:scale-[0.97] will-change-transform"
              style={{ background: '#FFFFFF', color: '#0F0F12' }}
            >
              {t.hero.ctaBuy}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {/* Datenzeile — dieselben drei Werte wie die Desktop-
                Statistikleiste (stats-Array oben), mit Haarlinien-Trennern.
                Kurzlabels statt der langen Desktop-Labels ("Kettenlaufzeit" /
                12 Zeichen waere hier ohnehin zu breit) — drei Spalten auf
                335px verfuegbarer Breite brauchen kompakte Woerter. */}
            <div data-hero className="flex items-stretch justify-between mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}>
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 text-center px-1 first:pl-0 last:pr-0"
                  style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.18)' : 'none' }}
                >
                  <p data-stat-val className="font-display font-bold tabular-nums text-white leading-none" style={{ fontSize: '17px', textShadow: HERO_TEXT_SHADOW }}>
                    {s.v}
                  </p>
                  <p className="text-[9.5px] uppercase mt-1" style={{ letterSpacing: '0.05em', color: 'rgba(255,255,255,0.65)', textShadow: HERO_TEXT_SHADOW }}>
                    {s.lShort}
                  </p>
                </div>
              ))}
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
