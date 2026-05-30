import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

// Animations are now fully GSAP-driven (see each diagram component below).

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 1 — Crystal grain size (GSAP-driven)
// LEFT:  4 coarse polygon grains, gaps visible → droplet falls through → oxidation
//        bloom appears with glowing SVG filter + elastic.out easing.
// RIGHT: continuous dense band → droplet arrives, bounces off, slides away clean.
// ─────────────────────────────────────────────────────────────────────────────
function CrystalDiagram() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const dropL   = useRef<SVGPathElement>(null);
  const oxide   = useRef<SVGGElement>(null);
  const dropR   = useRef<SVGPathElement>(null);

  const drop = (cx: number, cy: number) =>
    `M${cx},${cy+7} C${cx-5},${cy+3} ${cx-5},${cy-4} ${cx},${cy-5} C${cx+5},${cy-4} ${cx+5},${cy+3} ${cx},${cy+7} Z`;

  useEffect(() => {
    if (!svgRef.current || !dropL.current || !oxide.current || !dropR.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // ── initial states ──
      gsap.set(dropL.current, { y: 0, opacity: 0 });
      gsap.set(oxide.current, { scale: 0, opacity: 0, transformOrigin: '36px 132px' });
      gsap.set(dropR.current, { x: 0, y: 0, opacity: 0 });

      // ── LEFT: droplet falls → oxidation blooms ──
      const tlL = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      tlL
        .to(dropL.current, { opacity: 0.72, duration: 0.18, ease: 'none' }, 0.25)
        .to(dropL.current, { y: 36, duration: 0.65, ease: 'power2.in' }, 0.25)
        .to(dropL.current, { opacity: 0, duration: 0.1 }, 0.85)
        // bloom: elastic overshoot, then hold, then collapse
        .to(oxide.current, { scale: 1.5, opacity: 0.95, duration: 0.22, ease: 'power3.out' }, 1.05)
        .to(oxide.current, { scale: 1.0, opacity: 0.7, duration: 0.45, ease: 'elastic.out(1.4, 0.4)' }, 1.27)
        .to(oxide.current, { opacity: 0.55, duration: 2.1, ease: 'power1.out' }, 1.72)
        .to(oxide.current, { scale: 0.5, opacity: 0, duration: 0.38, ease: 'power2.in' }, 4.2)
        .set(dropL.current, { y: 0, opacity: 0 })
        .set(oxide.current, { scale: 0, opacity: 0 });

      // ── RIGHT: droplet arrives, bounces, slides off ──
      const tlR = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 0.85 });
      tlR
        .to(dropR.current, { opacity: 0.72, duration: 0.18 }, 0.0)
        .to(dropR.current, { y: 17, duration: 0.5, ease: 'power2.in' }, 0.0)
        // micro-bounce at surface
        .to(dropR.current, { y: 13, duration: 0.12, ease: 'power2.out' })
        // deflect diagonally off surface
        .to(dropR.current, { x: -11, y: 23, duration: 0.42, ease: 'power2.out' })
        .to(dropR.current, { opacity: 0, duration: 0.18 }, '-=0.18')
        .set(dropR.current, { x: 0, y: 0, opacity: 0 });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      <defs>
        {/* Glow filter for oxidation bloom */}
        <filter id="cd-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Metallic gradient for steel surface */}
        <linearGradient id="cd-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--bd)"  />
          <stop offset="45%"  stopColor="var(--bd2)" />
          <stop offset="100%" stopColor="var(--bd)"  />
        </linearGradient>
      </defs>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd2)" strokeWidth="0.75" />

      {/* steel surfaces — metallic gradient */}
      <rect x="0"   y="128" width="138" height="24" fill="url(#cd-steel)" />
      <rect x="0"   y="128" width="138" height="1.5" fill="var(--txm)" opacity="0.14" />
      <rect x="142" y="128" width="138" height="24" fill="url(#cd-steel)" />
      <rect x="142" y="128" width="138" height="1.5" fill="var(--txm)" opacity="0.14" />

      {/* LEFT — 4 coarse polygon grains, clear 8 px gaps */}
      <polygon points="2,128 4,114 8,102 16,91 26,90 30,100 32,114 32,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      <polygon points="40,128 40,114 42,104 50,95 58,93 62,102 64,114 64,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      <polygon points="72,128 72,115 74,104 82,93 90,92 96,102 98,113 98,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      <polygon points="104,128 104,115 107,104 116,93 124,92 130,102 134,113 134,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      <text x="69" y="13" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.08em">PARAFFIN</text>

      {/* LEFT droplet — GSAP-animated */}
      <path ref={dropL} d={drop(36, 72)} fill="none" stroke="var(--txm)" strokeWidth="1.2" opacity="0" />

      {/* LEFT oxidation bloom — SVG glow filter + GSAP elastic */}
      <g ref={oxide} filter="url(#cd-glow)" style={{ opacity: 0 }}>
        <ellipse cx="36" cy="132" rx="15" ry="5.5" fill="rgba(185,125,50,0.52)" />
        <ellipse cx="36" cy="132" rx="7"  ry="2.5" fill="rgba(185,125,50,0.42)" />
      </g>

      {/* RIGHT — continuous dense band, no visible gaps */}
      <rect x="144" y="108" width="134" height="20" rx="1.5"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.6" />
      {[168, 191, 211, 231, 252].map((x, i) => (
        <line key={i} x1={x} y1="108" x2={x + (i % 2 === 0 ? -1 : 1)} y2="128"
          stroke="var(--bd2)" strokeWidth="0.55" />
      ))}
      <text x="211" y="13" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.08em">MIKROKRISTALLIN</text>

      {/* RIGHT droplet — GSAP-animated */}
      <path ref={dropR} d={drop(211, 89)} fill="none" stroke="var(--txm)" strokeWidth="1.2" opacity="0" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 2 — Cold brittleness (GSAP-driven)
// Chain roller cross-section: outer ring + wax annulus + inner pin.
// LEFT:  pin shifts under load → radial crack snaps in (brittle speed) →
//        chip ejects outward with momentum.
// RIGHT: same load → wax ring deforms elastically (scaleX/Y) → springs back.
// ─────────────────────────────────────────────────────────────────────────────
function ColdDiagram() {
  const svgRef    = useRef<SVGSVGElement>(null);
  const pinL      = useRef<SVGGElement>(null);
  const crackLine = useRef<SVGLineElement>(null);
  const chip      = useRef<SVGCircleElement>(null);
  const waxRingR  = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !pinL.current || !crackLine.current || !chip.current || !waxRingR.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // initial states
      gsap.set(crackLine.current, { strokeDasharray: 22, strokeDashoffset: 22, opacity: 0 });
      gsap.set(chip.current,      { x: 0, y: 0, rotation: 0, opacity: 0, transformOrigin: '82px 71px' });

      // LEFT: subtle flex load → sudden brittle crack → chip ejects
      const tlL = gsap.timeline({ repeat: -1, repeatDelay: 1.1 });
      tlL
        // flex load: pin nudges (simulates articulation stress)
        .to(pinL.current, { x: 1.8,  duration: 0.32, ease: 'power2.inOut' }, 0.4)
        .to(pinL.current, { x: -1.0, duration: 0.22, ease: 'power2.inOut' }, 0.72)
        .to(pinL.current, { x: 0,    duration: 0.18, ease: 'power2.out'   }, 0.94)
        // crack snaps in — fast, brittle (power4 = very sharp acceleration)
        .to(crackLine.current, { opacity: 0.9, duration: 0.04 }, 1.18)
        .to(crackLine.current, { strokeDashoffset: 0, duration: 0.13, ease: 'power4.out' }, 1.18)
        // chip detaches and ejects radially
        .to(chip.current, { opacity: 0.78, duration: 0.04 }, 1.3)
        .to(chip.current, { x: 14, y: -10, rotation: -38, opacity: 0, duration: 0.52, ease: 'power2.out' }, 1.34)
        // hold crack visible, then fade before loop
        .to(crackLine.current, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 3.8)
        .set(crackLine.current, { strokeDashoffset: 22 })
        .set(chip.current,      { x: 0, y: 0, rotation: 0, opacity: 0 });

      // RIGHT: same load timing → wax ring deforms elastically → springs back, no crack
      gsap.timeline({ repeat: -1, repeatDelay: 1.1, delay: 0.35 })
        .to(waxRingR.current, {
          scaleX: 1.06, scaleY: 0.93,
          transformOrigin: '211px 84px',
          duration: 0.38, ease: 'power2.in',
        }, 0.4)
        .to(waxRingR.current, {
          scaleX: 1, scaleY: 1,
          transformOrigin: '211px 84px',
          duration: 0.65, ease: 'elastic.out(1.3, 0.38)',
        }, 0.78);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      <defs>
        <filter id="cold-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd2)" strokeWidth="0.75" />

      {/* snowflake — centered, refined */}
      <g transform="translate(140,20)" opacity="0.45">
        <line x1="0" y1="-8"  x2="0"  y2="8"   stroke="var(--txm)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="-6.9" y1="-4" x2="6.9" y2="4" stroke="var(--txm)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="6.9" y1="-4" x2="-6.9" y2="4" stroke="var(--txm)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="-2.4" y1="-6.2" x2="2.4" y2="-6.2" stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="-2.4" y1="6.2"  x2="2.4" y2="6.2"  stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="5.0" y1="-1.5" x2="5.0" y2="1.5"   stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="-5.0" y1="-1.5" x2="-5.0" y2="1.5" stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
      </g>
      <text x="140" y="44" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif">−8 °C</text>

      {/* ── LEFT cross-section: roller → wax ring → pin ── */}
      {/* outer roller */}
      <circle cx="69" cy="84" r="26" fill="none" stroke="var(--bd)" strokeWidth="1.5"
        filter="url(#cold-shadow)" />
      {/* wax annulus: circle at r=19, strokeWidth=8 → ring from r≈15 to r≈23 */}
      <circle cx="69" cy="84" r="19" strokeWidth="8" stroke="var(--sf3)" fill="none" />
      {/* inner pin — GSAP-animated group */}
      <g ref={pinL}>
        <circle cx="69" cy="84" r="13" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />
        <circle cx="69" cy="84" r="3"  fill="var(--bd)" opacity="0.45" />
      </g>
      {/* crack line — radial, at ~315° (upper-right), drawn by GSAP */}
      {/* from r≈15 to r≈23 at angle −45°: (69+10.6,84−10.6)→(69+16.3,84−16.3) */}
      <line ref={crackLine}
        x1="80" y1="73" x2="85" y2="68"
        stroke="var(--tx1)" strokeWidth="1.3" strokeLinecap="round"
        opacity="0" />
      {/* chip fragment */}
      <circle ref={chip} cx="82" cy="71" r="3.8"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.7" opacity="0" />
      <text x="69" y="143" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.07em">STANDARD-WACHS</text>

      {/* ── RIGHT cross-section: same geometry, elastic wax ring ── */}
      <circle cx="211" cy="84" r="26" fill="none" stroke="var(--bd)" strokeWidth="1.5"
        filter="url(#cold-shadow)" />
      <circle ref={waxRingR} cx="211" cy="84" r="19" strokeWidth="8"
        stroke="var(--sf3)" fill="none" />
      <circle cx="211" cy="84" r="13" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />
      <circle cx="211" cy="84" r="3"  fill="var(--bd)" opacity="0.45" />
      <text x="211" y="143" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.07em">MOS₂-MATRIX</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 3 — Heat migration (GSAP-driven)
// LEFT:  3 independent wax segments thin at staggered rates → each drips →
//        contamination dots appear on exposed metal. Center segment fails first
//        (highest thermal load at contact point — physically accurate).
// RIGHT: single stable wax layer, nothing changes.
// ─────────────────────────────────────────────────────────────────────────────
function HeatDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const segA   = useRef<SVGRectElement>(null);
  const segB   = useRef<SVGRectElement>(null);
  const segC   = useRef<SVGRectElement>(null);
  const dripA  = useRef<SVGGElement>(null);
  const dripB  = useRef<SVGGElement>(null);
  const dripC  = useRef<SVGGElement>(null);
  const dirtA  = useRef<SVGCircleElement>(null);
  const dirtB  = useRef<SVGCircleElement>(null);
  const dirtC  = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const refs = [segA, segB, segC, dripA, dripB, dripC, dirtA, dirtB, dirtC];
    if (refs.some(r => !r.current)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // initial states — all anchored to bottom of wax layer (y=88)
      gsap.set(segA.current, { transformOrigin: '29px 88px',  scaleY: 1 });
      gsap.set(segB.current, { transformOrigin: '73px 88px',  scaleY: 1 });
      gsap.set(segC.current, { transformOrigin: '117px 88px', scaleY: 1 });
      gsap.set([dripA.current, dripB.current, dripC.current], { y: 0, opacity: 0 });
      gsap.set([dirtA.current, dirtB.current, dirtC.current], { scale: 0, opacity: 0 });

      // single master timeline keeps all three segments choreographed
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });

      // ── Center (B) fails first — highest heat at contact point ──
      tl.to(segB.current,  { scaleY: 0.18, duration: 1.3, ease: 'power1.inOut' }, 0.3)
        .to(dripB.current,  { opacity: 0.6, duration: 0.14 }, 0.65)
        .to(dripB.current,  { y: 22, duration: 0.68, ease: 'power2.in' }, 0.65)
        .to(dripB.current,  { opacity: 0, duration: 0.18 }, 1.18)
        .to(dirtB.current,  { scale: 1.15, opacity: 0.58, duration: 0.28, ease: 'back.out(2)' }, 1.38)
        .to(dirtB.current,  { scale: 1.0,  opacity: 0.42, duration: 0.2 }, 1.66)

      // ── Left (A) fails — 0.55s behind B ──
        .to(segA.current,  { scaleY: 0.22, duration: 1.25, ease: 'power1.inOut' }, 0.85)
        .to(dripA.current,  { opacity: 0.6, duration: 0.14 }, 1.18)
        .to(dripA.current,  { y: 22, duration: 0.68, ease: 'power2.in' }, 1.18)
        .to(dripA.current,  { opacity: 0, duration: 0.18 }, 1.72)
        .to(dirtA.current,  { scale: 1.15, opacity: 0.52, duration: 0.28, ease: 'back.out(2)' }, 1.9)
        .to(dirtA.current,  { scale: 1.0,  opacity: 0.38, duration: 0.2 }, 2.18)

      // ── Right (C) fails last ──
        .to(segC.current,  { scaleY: 0.2,  duration: 1.25, ease: 'power1.inOut' }, 1.3)
        .to(dripC.current,  { opacity: 0.6, duration: 0.14 }, 1.65)
        .to(dripC.current,  { y: 22, duration: 0.68, ease: 'power2.in' }, 1.65)
        .to(dripC.current,  { opacity: 0, duration: 0.18 }, 2.18)
        .to(dirtC.current,  { scale: 1.15, opacity: 0.52, duration: 0.28, ease: 'back.out(2)' }, 2.38)
        .to(dirtC.current,  { scale: 1.0,  opacity: 0.38, duration: 0.2 }, 2.66)

      // ── hold degraded state ──
      // ── reset ──
        .to([segA.current, segB.current, segC.current],
            { scaleY: 1, duration: 0.5, ease: 'power2.inOut' }, 4.6)
        .to([dirtA.current, dirtB.current, dirtC.current],
            { scale: 0, opacity: 0, duration: 0.4, ease: 'power2.in' }, 4.6)
        .set([dripA.current, dripB.current, dripC.current], { y: 0, opacity: 0 });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      <defs>
        <linearGradient id="ht-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--bd)"  />
          <stop offset="45%"  stopColor="var(--bd2)" />
          <stop offset="100%" stopColor="var(--bd)"  />
        </linearGradient>
      </defs>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd2)" strokeWidth="0.75" />

      <text x="140" y="13" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif">+75 °C</text>

      {/* LEFT — chain bar with metallic gradient */}
      <rect x="8"   y="88" width="122" height="26" rx="3"
        fill="url(#ht-steel)" stroke="var(--bd)" strokeWidth="1" />

      {/* LEFT — 3 independent wax segments (center first, then sides) */}
      {/* A: x=10–48 */}
      <rect ref={segA} x="10"  y="72" width="38" height="16" rx="2"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      {/* B: x=54–92 (center, most heat) */}
      <rect ref={segB} x="54"  y="72" width="38" height="16" rx="2"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      {/* C: x=98–136 */}
      <rect ref={segC} x="98"  y="72" width="38" height="16" rx="2"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />

      {/* drip A */}
      <g ref={dripA}>
        <ellipse cx="29" cy="89" rx="2" ry="2.6" fill="var(--txm)" opacity="0.52" />
        <polygon points="27,91.5 31,91.5 29,97" fill="var(--txm)" opacity="0.52" />
      </g>
      {/* drip B */}
      <g ref={dripB}>
        <ellipse cx="73" cy="89" rx="2" ry="2.6" fill="var(--txm)" opacity="0.52" />
        <polygon points="71,91.5 75,91.5 73,97" fill="var(--txm)" opacity="0.52" />
      </g>
      {/* drip C */}
      <g ref={dripC}>
        <ellipse cx="117" cy="89" rx="2" ry="2.6" fill="var(--txm)" opacity="0.52" />
        <polygon points="115,91.5 119,91.5 117,97" fill="var(--txm)" opacity="0.52" />
      </g>

      {/* contamination specks */}
      <circle ref={dirtA} cx="29"  cy="98" r="2.5" fill="var(--txm)" opacity="0" />
      <circle ref={dirtB} cx="73"  cy="98" r="2.5" fill="var(--txm)" opacity="0" />
      <circle ref={dirtC} cx="117" cy="98" r="2.5" fill="var(--txm)" opacity="0" />

      <text x="69" y="143" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.07em">PARAFFIN</text>

      {/* RIGHT — chain bar */}
      <rect x="150" y="88" width="122" height="26" rx="3"
        fill="url(#ht-steel)" stroke="var(--bd)" strokeWidth="1" />
      {/* RIGHT — single stable wax layer — no animation */}
      <rect x="150" y="72" width="122" height="16" rx="2"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />

      <text x="211" y="143" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.07em">FISCHER-TROPSCH</text>
    </svg>
  );
}

// ─── Friction bar data ────────────────────────────────────────────────────────
const frictionMini = [
  { label: 'Pro',                              val: 'μ 0,03–0,06', pct: 100, highlight: true  },
  { label: 'Classic',                          val: 'μ 0,05–0,07', pct: 80,  highlight: true  },
  { labelDe: 'Kettenöl', labelEn: 'Chain Oil', val: 'μ 0,18–0,25', pct: 18,  highlight: false },
];

const cardStyle = {
  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
  boxShadow: 'var(--card-shad)',
};

// ─── Single mechanism strip ───────────────────────────────────────────────────
interface StripProps {
  index: number;
  catDe: string; catEn: string;
  specValue?: string;
  specLabelDe?: string; specLabelEn?: string;
  titleDe: string; titleEn: string;
  bodyDe: string; bodyEn: string;
  scienceLinkDe: string; scienceLinkEn: string;
  scienceAnchor: string;
  diagram: React.ReactNode;
  de: boolean;
}

function MechanismStrip({
  index, catDe, catEn, specValue, specLabelDe, specLabelEn,
  titleDe, titleEn, bodyDe, bodyEn,
  scienceLinkDe, scienceLinkEn, scienceAnchor, diagram, de,
}: StripProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    gsap.set(el, { opacity: 0, y: 28 });
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.65, ease: 'power3.out',
      delay: index * 0.10,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  }, [index]);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={stripRef}
      className="py-10 sm:py-12"
      style={{ borderBottom: '1px solid var(--bd2)' }}
    >
      <div className={`flex flex-col sm:flex-row gap-8 sm:gap-12 items-center ${isEven ? '' : 'sm:flex-row-reverse'}`}>

        {/* ── Diagram ── */}
        <div className="flex-shrink-0 w-full sm:w-auto rounded-xl overflow-hidden"
          style={{ maxWidth: 300, border: '1px solid var(--bd2)', background: 'var(--sf2)' }}>
          {diagram}
        </div>

        {/* ── Text ── */}
        <div className="flex-1 min-w-0">

          {/* Eyebrow + spec */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--txff)' }}>
              {de ? catDe : catEn}
            </span>
            {specValue && (
              <span className="font-display font-bold tabular-nums leading-none flex-shrink-0"
                style={{ fontSize: 'clamp(1.55rem, 3vw, 2.2rem)', color: 'var(--tx1)' }}>
                {specValue}
              </span>
            )}
          </div>

          {/* Spec label */}
          {specValue && (specLabelDe || specLabelEn) && (
            <p className="text-[10px] font-medium mb-3 text-right" style={{ color: '#3D67CA' }}>
              {de ? specLabelDe : specLabelEn}
            </p>
          )}

          {/* Title */}
          <h3 className="font-serif-display italic font-bold text-wx-tx1 mb-3 leading-tight"
            style={{ fontSize: 'clamp(1.1rem, 2.1vw, 1.4rem)' }}>
            {de ? titleDe : titleEn}
          </h3>

          {/* Body */}
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--txm)' }}>
            {de ? bodyDe : bodyEn}
          </p>

          {/* Science link */}
          <Link to={`/wissenschaft${scienceAnchor}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
            style={{ color: '#264E8C' }}>
            {de ? scienceLinkDe : scienceLinkEn}
            <span aria-hidden="true" style={{ fontSize: 10 }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function WhyWax() {
  const { lang }   = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const proofRef   = useRef<HTMLDivElement>(null);
  const de         = lang === 'de';

  useSectionReveal(headerRef);

  // Friction bars animate in on scroll
  useEffect(() => {
    if (!proofRef.current) return;
    const ctx = gsap.context(() => {
      proofRef.current?.querySelectorAll('.fbar').forEach((bar) => {
        const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: pct, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: proofRef.current, start: 'top 82%', once: true },
        });
      });
    }, proofRef);
    return () => ctx.revert();
  }, []);

  const strips: Omit<StripProps, 'de' | 'index'>[] = [
    {
      catDe: 'Feuchtigkeitsschutz',
      catEn: 'Moisture protection',
      // No single number — the diagram is the proof
      titleDe: 'Weniger Oxidation nach der Regenfahrt',
      titleEn: 'Less oxidation after a wet ride',
      bodyDe: 'Standard-Paraffin bildet grobkristalline Strukturen mit messbaren Lücken — durch diese Lücken erreicht Wasser die Metalloberfläche und Oxidation entsteht schneller. Mikrokristallines Hartwachs hat deutlich kleinere Kristallite, die dichter packen und mehr Metalloberfläche bedecken. Das reduziert den Wasserkontakt mit dem Stahl erheblich.',
      bodyEn: 'Standard paraffin forms coarse crystal structures with measurable gaps — through these gaps water reaches the metal and oxidation sets in faster. Microcrystalline hard wax has significantly smaller crystallites that pack more densely and cover more metal surface area, substantially reducing water contact with the steel.',
      scienceLinkDe: 'Kristallstruktur erklärt',
      scienceLinkEn: 'Crystal structure explained',
      scienceAnchor: '#kristallstruktur',
      diagram: <CrystalDiagram />,
    },
    {
      catDe: 'Winterformel · Pro (MoS₂)',
      catEn: 'Winter formula · Pro (MoS₂)',
      specValue: '−8 °C',
      specLabelDe: 'Grenze für einwandfreien Betrieb',
      specLabelEn: 'Lower limit for reliable operation',
      titleDe: 'Weniger Abplatzen und Schaltprobleme bei Frost',
      titleEn: 'Less flaking and shifting issues in frost',
      bodyDe: 'Standard-Wachse werden unter ~5 °C spröde — die Matrix bricht bei Biegebewegungen auf, Stücke platzen ab, Schmierung fällt aus. Amorphes MoS₂ hält die Matrix elastisch bis −8 °C, verhindert Abplatzen und sorgt für konsistentere Schaltperformance. Ein Phenol-Antioxidans schützt zusätzlich das MoS₂ vor Umwandlung zu MoO₃ — einem abrasiven Oxidationsprodukt, das statt zu schmieren schadet.',
      bodyEn: 'Standard waxes become brittle below ~5 °C — the matrix fractures under flex stress, pieces chip off, and lubrication fails. Amorphous MoS₂ keeps the matrix elastic down to −8 °C, preventing flaking and maintaining more consistent shifting. A phenolic antioxidant also protects the MoS₂ from converting to MoO₃ — an abrasive oxidation product that harms rather than lubricates.',
      scienceLinkDe: 'Winterformel & MoS₂ erklärt',
      scienceLinkEn: 'Winter formula & MoS₂ explained',
      scienceAnchor: '#winterformel',
      diagram: <ColdDiagram />,
    },
    {
      catDe: 'Sommerbeständigkeit',
      catEn: 'Summer stability',
      specValue: '+75 °C',
      specLabelDe: 'Tropfpunkt der Wachsmatrix',
      specLabelEn: 'Drop point of wax matrix',
      titleDe: 'Weniger Shedding und Migration bei Hitze',
      titleEn: 'Less shedding and migration in heat',
      bodyDe: 'An Kettenkontaktpunkten unter Last entstehen Temperaturen von 45–55 °C. Weiches Wachs erreicht hier seine thermische Grenze — es migriert weg vom Gelenk, dünnt aus, und Schmutz haftet an der Stelle. Die härtere Fischer-Tropsch-Matrix (Tropfpunkt ~75 °C) bleibt an Position: deutlich weniger Migration und Shedding, längere Rewax-Intervalle.',
      bodyEn: 'Under load, chain contact points reach 45–55 °C. Soft wax approaches its thermal limit here — it migrates away from the joint, thins out, and dirt sticks where it exposed the metal. The harder Fischer-Tropsch matrix (drop point ~75 °C) holds its position: significantly less migration and shedding, longer re-wax intervals.',
      scienceLinkDe: 'Matrix & Tropfpunkt erklärt',
      scienceLinkEn: 'Matrix & drop point explained',
      scienceAnchor: '#matrix',
      diagram: <HeatDiagram />,
    },
  ];

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-20 sm:py-28 bg-wx-sf chain-texture">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="mb-10">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-3"
              style={{ color: 'var(--txf)' }}>
              {de ? 'Die Formel' : 'The Formula'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal
                text={de ? 'Was Waxcelerate anders macht.' : 'What makes Waxcelerate different.'} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl text-[15px]">
              {de
                ? 'Drei Bedingungen, an denen Schmiermittel versagen. Hier ist die Chemie dahinter — und warum sie bei Waxcelerate weniger versagen.'
                : 'Three conditions where lubricants fail. Here is the chemistry behind each — and why they fail less with Waxcelerate.'}
            </p>
          </div>

          {/* ── Three mechanism strips ── */}
          <div style={{ borderTop: '1px solid var(--bd2)' }}>
            {strips.map((strip, i) => (
              <MechanismStrip key={i} index={i} de={de} {...strip} />
            ))}
          </div>

          {/* ── Batch quality trust bar ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-6 mt-1 mb-8"
            style={{ borderBottom: '1px solid var(--bd2)' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map(n => (
                  <div key={n} style={{ width: 10, height: 18, background: 'var(--sf3)', borderRadius: 3,
                    border: '1px solid var(--bd)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '78%',
                      background: 'rgba(43,82,176,0.40)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%',
                      background: 'rgba(61,103,202,0.7)', top: '28%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: 'var(--tx2)' }}>
                  {de ? 'Gleichmäßige Qualität — Block für Block' : 'Consistent quality — block to block'}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--txf)' }}>
                  {de
                    ? 'MoS₂ ist 5,6× dichter als Paraffin und sedimentiert in Großchargen. Kleinstchargen in Stuttgart mit kontrollierter Homogenisierung verhindern das.'
                    : 'MoS₂ is 5.6× denser than paraffin and settles in large batches. Small-batch production in Stuttgart with controlled homogenisation prevents this.'}
                </p>
              </div>
            </div>
            <Link to="/wissenschaft#sedimentation"
              className="text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
              style={{ color: '#264E8C' }}>
              {de ? 'Sedimentation erklärt →' : 'Sedimentation explained →'}
            </Link>
          </div>

          {/* ── Proof: friction + cost ── */}
          <div ref={proofRef} className="grid sm:grid-cols-2 gap-3 mb-7">

            {/* Friction */}
            <div className="rounded-xl border border-wx-bd p-5 flex flex-col" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Reibung' : 'Friction'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">μ 0,03</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {frictionMini.map((item, i) => {
                  const label = 'label' in item ? item.label : (de ? item.labelDe : item.labelEn);
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-[11px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>{label}</span>
                        <span className={`text-[11px] font-mono tabular-nums ${item.highlight ? 'text-wx-tx2' : 'text-wx-txff'}`}>{item.val}</span>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                        <div className="fbar h-full w-full rounded-full" data-w={item.pct}
                          style={{
                            background: item.highlight ? 'linear-gradient(90deg, #0F2450, #3D67CA)' : 'var(--bd2)',
                            transformOrigin: 'left center', transform: 'scaleX(0)',
                          }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/wissenschaft#reibung"
                className="flex items-center gap-1 text-[11px] font-medium mt-3 pt-3 transition-opacity hover:opacity-70"
                style={{ color: '#264E8C', borderTop: '1px solid var(--bd2)' }}>
                {de ? 'Vollständiger Vergleich →' : 'Full comparison →'}
              </Link>
            </div>

            {/* Cost savings */}
            <div className="rounded-xl border border-wx-bd p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Kostenersparnis' : 'Cost savings'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">~€70</span>
              </div>
              <p className="text-[11px] font-semibold mb-3" style={{ color: '#2B52B0' }}>
                {de ? '46 % weniger über 12.000 km' : '46% less over 12,000 km'}
              </p>
              <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
                <div className="flex justify-between text-[11px]">
                  <span className="text-wx-txf">{de ? 'Mit Öl (3 Ketten)' : 'With oil (3 chains)'}</span>
                  <span className="text-wx-txm tabular-nums">~€151</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-wx-txf">{de ? 'Mit Wachs (1 Kette)' : 'With wax (1 chain)'}</span>
                  <span className="tabular-nums font-semibold" style={{ color: '#2B52B0' }}>~€81</span>
                </div>
              </div>
              <p className="text-[10px] mt-3 pt-3 leading-relaxed"
                style={{ borderTop: '1px solid var(--bd2)', color: 'var(--txff)' }}>
                {de
                  ? '* Kettenpreis €30 · Rewax alle 400 km · Ölwechsel alle 300 km · 12.000 km'
                  : '* Chain price €30 · re-wax every 400 km · oil change every 300 km · 12,000 km'}
              </p>
            </div>
          </div>

          {/* ── Formula selector note ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-4 px-4 rounded-xl"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
            <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
              <span className="font-semibold" style={{ color: 'var(--tx2)' }}>
                {de ? 'Welche Formel?' : 'Which formula?'}
              </span>
              {' · '}
              <span>Classic (PTFE) — {de ? 'Frühjahr–Herbst' : 'spring–autumn'}</span>
              {'  ·  '}
              <span>Pro (MoS₂) — {de ? 'Ganzjahr, Winter & E-Bike' : 'year-round, winter & e-bike'}</span>
            </p>
            <Link to="/#produkte"
              className="text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
              style={{ color: '#264E8C' }}>
              {de ? 'Zu den Produkten →' : 'See products →'}
            </Link>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </section>
  );
}
