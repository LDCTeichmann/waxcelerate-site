import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';
import { Delaunay } from 'd3-delaunay';

// ─── Diagram colour tokens — monochrome / silver palette ─────────────────────
// Wax elements: light silver-white — high contrast on dark panel bg, neutral.
// Rust: only chromatic accent — functional (rust IS orange). Everything else grey.
const C_WAX   = 'rgba(178,182,194,0.93)';   // silver-gray wax — darker for contrast
const C_WAX_S = 'rgba(130,135,152,0.70)';   // wax stroke / secondary — more visible
const C_RUST  = 'rgba(195,72,18,0.92)';     // rust core (functional orange)
const C_RUST2 = 'rgba(195,72,18,0.50)';     // rust spread / halo
const C_DROP  = 'rgba(68,114,212,0.88)';    // water droplet (blue)
const C_GRIME = 'rgba(42,44,52,0.92)';      // contamination / grime (near-black)

// ─── Voronoi grain data — computed once at module load (pure math, no DOM) ───
// Crystal zone above steel bar: x 0–138 (left), 142–280 (right), y 78–124.
// Left (PARAFFIN):       5 coarse grains → large cells, ~3.5 px visible gaps.
// Right (MIKROKRISTALLIN): 44 dense grains → tiny cells, ~0.8 px boundaries.
const _VOR_BOUNDS_L: [number,number,number,number] = [0,   78, 138, 124];
const _VOR_BOUNDS_R: [number,number,number,number] = [142, 78, 280, 124];

const _SEEDS_P: [number,number][] = [[18,102],[55,92],[89,96],[122,100],[35,115]];
const _CELLS_P = (() => {
  const v = Delaunay.from(_SEEDS_P).voronoi(_VOR_BOUNDS_L);
  return _SEEDS_P.map((_, i) => v.renderCell(i));
})();

// deterministic LCG so grain positions are always identical
const _lcg = (() => { let s = 0xbeef42; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
const _SEEDS_M: [number,number][] = Array.from({ length: 44 }, () => [142 + _lcg() * 136, 79 + _lcg() * 43] as [number,number]);
const _CELLS_M = (() => {
  const v = Delaunay.from(_SEEDS_M).voronoi(_VOR_BOUNDS_R);
  return _SEEDS_M.map((_, i) => v.renderCell(i));
})();

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 1 — Crystal grain size
// LEFT:  4 coarse warm-amber crystal grains with visible 9 px gaps.
//        Droplet falls into gap, seeps through, rust bloom erupts on steel.
// RIGHT: Dense continuous wax band. Droplet hits surface, squishes flat,
//        beads into sphere, rolls off — surface stays clean.
// ─────────────────────────────────────────────────────────────────────────────
function CrystalDiagram() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const dropL   = useRef<SVGPathElement>(null);
  const oxide   = useRef<SVGGElement>(null);
  const dropR   = useRef<SVGPathElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);  // animated for rust bloom

  // Filled teardrop: tip at (cx, cy−top), round bottom at (cx, cy+bot)
  const tear = (cx: number, cy: number, top = 9, bot = 11, w = 7) =>
    `M${cx},${cy+bot} C${cx-w},${cy+bot/2} ${cx-w},${cy-top+3} ${cx},${cy-top} C${cx+w},${cy-top+3} ${cx+w},${cy+bot/2} ${cx},${cy+bot} Z`;

  useEffect(() => {
    if (!svgRef.current || !dropL.current || !oxide.current || !dropR.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.set(dropL.current,  { y: 0, opacity: 0, scaleX: 1, scaleY: 1 });
      gsap.set(oxide.current,  { scale: 0, opacity: 0, svgOrigin: '36 135' });
      gsap.set(dropR.current,  { x: 0, y: 0, opacity: 0, scaleX: 1, scaleY: 1 });

      // ── LEFT: drop falls into crystal gap → seeps through → rust erupts ──
      const tlL = gsap.timeline({ repeat: -1, repeatDelay: 1.0 });
      tlL
        .to(dropL.current, { opacity: 1, duration: 0.2 }, 0.4)
        .to(dropL.current, { y: 38, duration: 0.72, ease: 'power2.in' }, 0.4)
        // squeezes into the gap (narrows + continues down)
        .to(dropL.current, { scaleX: 0.38, y: 54, duration: 0.28, ease: 'power3.in', transformOrigin: '50% 0%' }, 1.1)
        .to(dropL.current, { opacity: 0, duration: 0.15 }, 1.25)
        // rust bloom: fast overshoot then elastic settle, then slow decay
        .to(oxide.current, { scale: 1.8, opacity: 1, duration: 0.22, ease: 'power3.out' }, 1.45)
        .to(oxide.current, { scale: 1.0, opacity: 0.92, duration: 0.52, ease: 'elastic.out(1.4, 0.38)' }, 1.67)
        // feTurbulence baseFrequency breathes while rust holds → organic spreading feel
        .to(turbRef.current, { attr: { baseFrequency: 0.055 }, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 1.67)
        .to(oxide.current, { opacity: 0.68, duration: 2.8, ease: 'power1.out' }, 2.2)
        .to(oxide.current, { scale: 0.3, opacity: 0, duration: 0.42, ease: 'power2.in' }, 5.3)
        .set(dropL.current, { y: 0, opacity: 0, scaleX: 1 })
        .set(oxide.current, { scale: 0, opacity: 0 })
        .set(turbRef.current, { attr: { baseFrequency: 0.038 } });

      // ── RIGHT: drop hits dense surface → squish → bead → rolls off ──
      const tlR = gsap.timeline({ repeat: -1, repeatDelay: 1.0, delay: 1.0 });
      tlR
        .to(dropR.current, { opacity: 1, duration: 0.2 }, 0.0)
        .to(dropR.current, { y: 28, duration: 0.6, ease: 'power2.in' }, 0.0)
        // impact squish
        .to(dropR.current, { scaleX: 2.0, scaleY: 0.42, duration: 0.09, ease: 'power3.out', transformOrigin: '50% 100%' }, 0.6)
        // bead up (elastic)
        .to(dropR.current, { scaleX: 1.05, scaleY: 1.18, duration: 0.28, ease: 'elastic.out(1.5, 0.4)', transformOrigin: '50% 100%' }, 0.69)
        // settle
        .to(dropR.current, { scaleX: 1, scaleY: 1, duration: 0.16 }, 1.0)
        // roll off diagonally
        .to(dropR.current, { x: -24, y: 38, duration: 0.5, ease: 'power2.in' }, 1.2)
        .to(dropR.current, { opacity: 0, duration: 0.2 }, 1.52)
        .set(dropR.current, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 0 });
    }, svgRef);
    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        {/* Organic rust-bloom filter: turbulence displaces + blurs the rust ellipses.
            GSAP animates baseFrequency on turbRef to make rust "breathe" as it spreads. */}
        <filter id="cd-rust" x="-120%" y="-120%" width="340%" height="340%">
          <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.038"
            numOctaves="3" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14"
            xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feGaussianBlur in="disp" stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="disp" />
          </feMerge>
        </filter>
        <linearGradient id="cd-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(90,92,102,0.95)" />
          <stop offset="40%"  stopColor="rgba(58,60,68,0.95)"  />
          <stop offset="100%" stopColor="rgba(32,33,38,0.95)"  />
        </linearGradient>
      </defs>

      {/* panel backgrounds */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd)" strokeWidth="0.8" />

      {/* steel base bars */}
      <rect x="0"   y="124" width="138" height="28" fill="url(#cd-steel)" />
      <rect x="0"   y="124" width="138" height="1"  fill="rgba(255,255,255,0.10)" />
      <rect x="142" y="124" width="138" height="28" fill="url(#cd-steel)" />
      <rect x="142" y="124" width="138" height="1"  fill="rgba(255,255,255,0.10)" />

      {/* ── LEFT: D3 Voronoi — 5 coarse grains, stroke=panel-bg creates visible gaps ── */}
      {_CELLS_P.map((d, i) => (
        <path key={i} d={d} fill={C_WAX} stroke="var(--sf2)" strokeWidth="3.5" />
      ))}
      <text x="69" y="14" textAnchor="middle" fontSize="7" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.10em" fontWeight="600">PARAFFIN</text>

      {/* LEFT droplet — falls near the Voronoi boundary that bisects x≈36 */}
      <path ref={dropL} d={tear(36, 57)} fill={C_DROP} opacity="0" />

      {/* LEFT rust bloom — turbulence-displaced so it looks like real corrosion */}
      <g ref={oxide} filter="url(#cd-rust)" style={{ opacity: 0 }}>
        <ellipse cx="36" cy="135" rx="20" ry="8"    fill={C_RUST2} />
        <ellipse cx="36" cy="135" rx="12" ry="5"    fill={C_RUST}  />
        <ellipse cx="36" cy="135" rx="5.5" ry="2.5" fill="rgba(230,120,50,0.95)" />
        <circle  cx="26" cy="132" r="2.5"            fill={C_RUST2} />
        <circle  cx="47" cy="136" r="2"              fill={C_RUST2} />
        <circle  cx="31" cy="139" r="1.8"            fill={C_RUST2} />
      </g>

      {/* ── RIGHT: D3 Voronoi — 44 dense micro-grains, thin boundaries ── */}
      {_CELLS_M.map((d, i) => (
        <path key={i} d={d} fill={C_WAX} stroke="var(--sf2)" strokeWidth="0.9" />
      ))}
      <text x="211" y="14" textAnchor="middle" fontSize="7" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.10em" fontWeight="600">MIKROKRISTALLIN</text>

      {/* RIGHT droplet — falls onto dense surface */}
      <path ref={dropR} d={tear(207, 62)} fill={C_DROP} opacity="0" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 2 — Cold brittleness  (completely redesigned concept)
// Shows a WAX SLAB being stressed — far more intuitive than a cross-section.
//
// LEFT (STANDARD-WACHS):
//   Force arrow descends → slab compresses slightly → 3 brittle crack lines
//   snap in (power4, very fast = brittle feel) → two chips eject outward.
//
// RIGHT (MOS₂-MATRIX):
//   Same force → slab compresses more (elastic can absorb more) → springs
//   back with elastic.out overshoot → no cracks.
//
// Crack lines use stroke="var(--sf2)" so they appear as dark slits through
// the warm amber wax fill — correct appearance in both light and dark mode.
// ─────────────────────────────────────────────────────────────────────────────
function ColdDiagram() {
  const svgRef   = useRef<SVGSVGElement>(null);
  const waxL     = useRef<SVGRectElement>(null);
  const crackL1  = useRef<SVGLineElement>(null);
  const crackL2  = useRef<SVGLineElement>(null);
  const crackL3  = useRef<SVGLineElement>(null);
  const chipL1   = useRef<SVGPolygonElement>(null);
  const chipL2   = useRef<SVGPolygonElement>(null);
  const forceL   = useRef<SVGGElement>(null);
  const waxR     = useRef<SVGRectElement>(null);
  const forceR   = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const refs = [waxL, crackL1, crackL2, crackL3, chipL1, chipL2, forceL, waxR, forceR];
    if (refs.some(r => !r.current)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // crack stroke-dash: each crack ~24 px long
      gsap.set([crackL1.current, crackL2.current, crackL3.current], {
        strokeDasharray: 26, strokeDashoffset: 26, opacity: 0,
      });
      gsap.set([chipL1.current, chipL2.current], { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0 });
      gsap.set([forceL.current, forceR.current], { y: 0, opacity: 0 });
      // anchor scale transforms at bottom-center of each wax slab
      // left wax rect: x=14, y=70, w=110, h=24 → bottom-center SVG coords = (69, 94)
      gsap.set(waxL.current, { svgOrigin: '69 94' });
      // right wax rect: x=152, y=70, w=110, h=24 → bottom-center = (207, 94)
      gsap.set(waxR.current, { svgOrigin: '207 94' });

      // ── LEFT: brittle fracture sequence ──
      const tlL = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
      tlL
        .to(forceL.current, { opacity: 0.88, duration: 0.22 }, 0.3)
        .to(forceL.current, { y: 5, duration: 0.48, ease: 'power2.in' }, 0.52)
        // slight compression before breaking
        .to(waxL.current, { scaleY: 0.90, duration: 0.22, ease: 'power2.in' }, 0.72)
        // cracks snap — fast, staggered 50 ms apart (brittle fracture propagates)
        .to(crackL1.current, { strokeDashoffset: 0, opacity: 1, duration: 0.06, ease: 'none' }, 0.96)
        .to(crackL2.current, { strokeDashoffset: 0, opacity: 1, duration: 0.06, ease: 'none' }, 1.01)
        .to(crackL3.current, { strokeDashoffset: 0, opacity: 1, duration: 0.07, ease: 'none' }, 1.06)
        // block lurches (failed attempt to spring back)
        .to(waxL.current, { scaleY: 0.94, duration: 0.14, ease: 'power2.out' }, 0.96)
        // chips fly off
        .to(chipL1.current, { opacity: 0.92, duration: 0.04 }, 1.05)
        .to(chipL1.current, { x: -18, y: -20, scale: 0.2, rotation: -48, opacity: 0, duration: 0.55, ease: 'power2.out' }, 1.09)
        .to(chipL2.current, { opacity: 0.88, duration: 0.04 }, 1.12)
        .to(chipL2.current, { x: 16, y: -24, scale: 0.15, rotation: 34, opacity: 0, duration: 0.5, ease: 'power2.out' }, 1.16)
        .to(forceL.current, { opacity: 0, duration: 0.35 }, 1.7)
        // hold cracked state…
        .to([crackL1.current, crackL2.current, crackL3.current], { opacity: 0, duration: 0.4 }, 4.0)
        .to(waxL.current, { scaleY: 1, duration: 0.38, ease: 'power2.inOut' }, 4.3)
        .set([crackL1.current, crackL2.current, crackL3.current], { strokeDashoffset: 26 })
        .set([chipL1.current, chipL2.current], { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0 })
        .set(forceL.current, { y: 0, opacity: 0 });

      // ── RIGHT: elastic recovery — same timing, opposite outcome ──
      const tlR = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
      tlR
        .to(forceR.current, { opacity: 0.88, duration: 0.22 }, 0.3)
        .to(forceR.current, { y: 5, duration: 0.48, ease: 'power2.in' }, 0.52)
        // compresses MORE (elastic absorbs energy) + slight lateral bulge
        .to(waxR.current, { scaleY: 0.74, scaleX: 1.07, duration: 0.28, ease: 'power2.in' }, 0.72)
        // SPRINGS BACK — elastic.out overshoot, no cracks
        .to(waxR.current, { scaleY: 1, scaleX: 1, duration: 0.82, ease: 'elastic.out(1.28, 0.34)' }, 1.0)
        .to(forceR.current, { opacity: 0, y: 0, duration: 0.32 }, 1.15)
        .set(forceR.current, { y: 0, opacity: 0 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="cold-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(92,94,106,0.95)" />
          <stop offset="45%"  stopColor="rgba(56,58,66,0.95)"  />
          <stop offset="100%" stopColor="rgba(30,31,36,0.95)"  />
        </linearGradient>
        {/* High-frequency turbulence roughens the straight crack lines into
            jagged fracture edges — looks brittle rather than geometric. Static. */}
        <filter id="cold-crack" x="-30%" y="-60%" width="160%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8" />
        </filter>
      </defs>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd)" strokeWidth="0.8" />

      {/* snowflake centred on divider */}
      <g transform="translate(140,19)" opacity="0.85">
        <line x1="0" y1="-9"   x2="0"   y2="9"    stroke="#4472D4" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="-7.8" y1="-4.5" x2="7.8" y2="4.5" stroke="#4472D4" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="7.8"  y1="-4.5" x2="-7.8" y2="4.5" stroke="#4472D4" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="-2.6" y1="-7"  x2="2.6" y2="-7"  stroke="#4472D4" strokeWidth="1.0" strokeLinecap="round" />
        <line x1="-2.6" y1="7"   x2="2.6" y2="7"   stroke="#4472D4" strokeWidth="1.0" strokeLinecap="round" />
        <line x1="5.5"  y1="-1.8" x2="5.5" y2="1.8" stroke="#4472D4" strokeWidth="1.0" strokeLinecap="round" />
        <line x1="-5.5" y1="-1.8" x2="-5.5" y2="1.8" stroke="#4472D4" strokeWidth="1.0" strokeLinecap="round" />
      </g>
      <text x="140" y="42" textAnchor="middle" fontSize="8" fill="#4472D4"
        fontFamily="system-ui,sans-serif" fontWeight="600">−8 °C</text>

      {/* ── LEFT panel ── */}
      {/* chain bar */}
      <rect x="14" y="94" width="110" height="22" rx="3"
        fill="url(#cold-metal)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="14" y="94" width="110" height="1" fill="rgba(255,255,255,0.12)" />
      {/* wax slab — warm amber, clearly visible */}
      <rect ref={waxL} x="14" y="70" width="110" height="24" rx="2"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="1.4" />
      {/* crack lines — turbulence filter makes edges jagged (brittle fracture) */}
      <line ref={crackL1} x1="42"  y1="70" x2="36"  y2="94"
        stroke="var(--sf2)" strokeWidth="2.4" strokeLinecap="round" opacity="0"
        filter="url(#cold-crack)" />
      <line ref={crackL2} x1="73"  y1="70" x2="68"  y2="94"
        stroke="var(--sf2)" strokeWidth="2.4" strokeLinecap="round" opacity="0"
        filter="url(#cold-crack)" />
      <line ref={crackL3} x1="104" y1="70" x2="99"  y2="94"
        stroke="var(--sf2)" strokeWidth="2.4" strokeLinecap="round" opacity="0"
        filter="url(#cold-crack)" />
      {/* fragment chips */}
      <polygon ref={chipL1} points="34,76 47,76 42,85"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="0.8" opacity="0" />
      <polygon ref={chipL2} points="65,73 78,73 74,81"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="0.8" opacity="0" />
      {/* force arrow */}
      <g ref={forceL} opacity="0">
        <line x1="69" y1="52" x2="69" y2="67" stroke="var(--txm)" strokeWidth="1.6" strokeLinecap="round" />
        <polygon points="64,66 74,66 69,73" fill="var(--txm)" />
      </g>
      <text x="69" y="144" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.08em" fontWeight="500">STANDARD-WACHS</text>

      {/* ── RIGHT panel ── */}
      <rect x="152" y="94" width="110" height="22" rx="3"
        fill="url(#cold-metal)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="152" y="94" width="110" height="1" fill="rgba(255,255,255,0.12)" />
      {/* wax slab */}
      <rect ref={waxR} x="152" y="70" width="110" height="24" rx="2"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="1.4" />
      {/* force arrow */}
      <g ref={forceR} opacity="0">
        <line x1="207" y1="52" x2="207" y2="67" stroke="var(--txm)" strokeWidth="1.6" strokeLinecap="round" />
        <polygon points="202,66 212,66 207,73" fill="var(--txm)" />
      </g>
      <text x="207" y="144" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.08em" fontWeight="500">MOS₂-MATRIX</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 3 — Heat migration
// LEFT  (PARAFFIN): 3 wax segments thin staggered (center first — highest
//        thermal load). Each segment drips amber liquid, then grime spots
//        appear on exposed metal with back.out pop.
// RIGHT (FISCHER-TROPSCH): single stable wax layer, no change.
// ─────────────────────────────────────────────────────────────────────────────
function HeatDiagram() {
  const svgRef     = useRef<SVGSVGElement>(null);
  const segA       = useRef<SVGRectElement>(null);
  const segB       = useRef<SVGRectElement>(null);
  const segC       = useRef<SVGRectElement>(null);
  const dripA      = useRef<SVGPathElement>(null);
  const dripB      = useRef<SVGPathElement>(null);
  const dripC      = useRef<SVGPathElement>(null);
  const dirtA      = useRef<SVGGElement>(null);
  const dirtB      = useRef<SVGGElement>(null);
  const dirtC      = useRef<SVGGElement>(null);
  const shimmerTurb = useRef<SVGFETurbulenceElement>(null); // heat shimmer

  // Small teardrop for wax drip — amber fill
  const drip = (cx: number, cy: number) =>
    `M${cx},${cy+9} C${cx-4},${cy+5} ${cx-4},${cy} ${cx},${cy-1} C${cx+4},${cy} ${cx+4},${cy+5} ${cx},${cy+9} Z`;

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const refs = [segA, segB, segC, dripA, dripB, dripC, dirtA, dirtB, dirtC];
    if (refs.some(r => !r.current)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // continuous heat shimmer on left chain bar — independent of main timeline
      if (shimmerTurb.current) {
        gsap.to(shimmerTurb.current, {
          attr: { baseFrequency: '0.022 0.09' },
          duration: 1.9, ease: 'sine.inOut',
          yoyo: true, repeat: -1,
        });
      }

      // anchor each segment's scaleY at its bottom edge (y=90)
      gsap.set(segA.current, { svgOrigin: '29 90'  });
      gsap.set(segB.current, { svgOrigin: '73 90'  });
      gsap.set(segC.current, { svgOrigin: '117 90' });
      gsap.set([dripA.current, dripB.current, dripC.current], { y: 0, opacity: 0 });
      gsap.set([dirtA.current, dirtB.current, dirtC.current], { scale: 0, opacity: 0 });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

      // ── Center (B) — highest thermal load, fails first ──
      tl.to(segB.current,  { scaleY: 0.16, duration: 1.4, ease: 'power1.inOut' }, 0.3)
        .to(dripB.current,  { opacity: 1, duration: 0.16 }, 0.7)
        .to(dripB.current,  { y: 24, duration: 0.72, ease: 'power2.in' }, 0.7)
        .to(dripB.current,  { opacity: 0, duration: 0.18 }, 1.26)
        .to(dirtB.current,  { scale: 1.2, opacity: 0.92, duration: 0.3, ease: 'back.out(2.2)' }, 1.46)
        .to(dirtB.current,  { scale: 1.0, opacity: 0.72, duration: 0.22 }, 1.76)
      // ── Left (A) — 0.55 s behind ──
        .to(segA.current,  { scaleY: 0.20, duration: 1.3, ease: 'power1.inOut' }, 0.85)
        .to(dripA.current,  { opacity: 1, duration: 0.16 }, 1.22)
        .to(dripA.current,  { y: 24, duration: 0.72, ease: 'power2.in' }, 1.22)
        .to(dripA.current,  { opacity: 0, duration: 0.18 }, 1.78)
        .to(dirtA.current,  { scale: 1.2, opacity: 0.88, duration: 0.3, ease: 'back.out(2.2)' }, 1.98)
        .to(dirtA.current,  { scale: 1.0, opacity: 0.68, duration: 0.22 }, 2.28)
      // ── Right (C) — last ──
        .to(segC.current,  { scaleY: 0.18, duration: 1.3, ease: 'power1.inOut' }, 1.3)
        .to(dripC.current,  { opacity: 1, duration: 0.16 }, 1.72)
        .to(dripC.current,  { y: 24, duration: 0.72, ease: 'power2.in' }, 1.72)
        .to(dripC.current,  { opacity: 0, duration: 0.18 }, 2.28)
        .to(dirtC.current,  { scale: 1.2, opacity: 0.88, duration: 0.3, ease: 'back.out(2.2)' }, 2.48)
        .to(dirtC.current,  { scale: 1.0, opacity: 0.68, duration: 0.22 }, 2.78)
      // ── reset ──
        .to([segA.current, segB.current, segC.current],
            { scaleY: 1, duration: 0.5, ease: 'power2.inOut' }, 5.0)
        .to([dirtA.current, dirtB.current, dirtC.current],
            { scale: 0, opacity: 0, duration: 0.38, ease: 'power2.in' }, 5.0)
        .set([dripA.current, dripB.current, dripC.current], { y: 0, opacity: 0 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="ht-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(92,94,106,0.95)" />
          <stop offset="45%"  stopColor="rgba(56,58,66,0.95)"  />
          <stop offset="100%" stopColor="rgba(30,31,36,0.95)"  />
        </linearGradient>
        {/* Heat shimmer: low-frequency turbulence displaces the left chain bar surface.
            GSAP animates baseFrequency continuously → surface appears to radiate heat. */}
        <filter id="ht-shimmer" x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence ref={shimmerTurb} type="turbulence"
            baseFrequency="0.015 0.06" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5"
            xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd)" strokeWidth="0.8" />

      <text x="140" y="14" textAnchor="middle" fontSize="8" fill="#C84020"
        fontFamily="system-ui,sans-serif" fontWeight="600">+75 °C</text>

      {/* LEFT — metallic chain bar with heat shimmer filter */}
      <rect x="8" y="90" width="122" height="26" rx="3"
        fill="url(#ht-steel)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
        filter="url(#ht-shimmer)" />
      <rect x="8" y="90" width="122" height="1" fill="rgba(255,255,255,0.10)" />

      {/* LEFT — 3 wax segments in warm amber (visible!) */}
      {/* A: left segment */}
      <rect ref={segA} x="10" y="74" width="38" height="16" rx="2"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="1.2" />
      {/* B: centre segment (fails first) */}
      <rect ref={segB} x="54" y="74" width="38" height="16" rx="2"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="1.2" />
      {/* C: right segment */}
      <rect ref={segC} x="98" y="74" width="38" height="16" rx="2"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="1.2" />

      {/* drips — amber teardrops, match wax color */}
      <path ref={dripA} d={drip(29, 90)} fill={C_WAX} opacity="0" />
      <path ref={dripB} d={drip(73, 90)} fill={C_WAX} opacity="0" />
      <path ref={dripC} d={drip(117,90)} fill={C_WAX} opacity="0" />

      {/* contamination clusters — grime colour, multi-dot for realism */}
      <g ref={dirtA} style={{ opacity: 0 }}>
        <circle cx="29" cy="101" r="4.2" fill={C_GRIME} />
        <circle cx="22" cy="103" r="2.2" fill={C_GRIME} opacity="0.75" />
        <circle cx="36" cy="100" r="1.8" fill={C_GRIME} opacity="0.70" />
      </g>
      <g ref={dirtB} style={{ opacity: 0 }}>
        <circle cx="73" cy="101" r="4.2" fill={C_GRIME} />
        <circle cx="66" cy="103" r="2.2" fill={C_GRIME} opacity="0.75" />
        <circle cx="80" cy="100" r="1.8" fill={C_GRIME} opacity="0.70" />
      </g>
      <g ref={dirtC} style={{ opacity: 0 }}>
        <circle cx="117" cy="101" r="4.2" fill={C_GRIME} />
        <circle cx="110" cy="103" r="2.2" fill={C_GRIME} opacity="0.75" />
        <circle cx="124" cy="100" r="1.8" fill={C_GRIME} opacity="0.70" />
      </g>

      <text x="69" y="144" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.08em" fontWeight="500">PARAFFIN</text>

      {/* RIGHT — metallic chain bar */}
      <rect x="150" y="90" width="122" height="26" rx="3"
        fill="url(#ht-steel)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="150" y="90" width="122" height="1" fill="rgba(255,255,255,0.10)" />
      {/* RIGHT — single stable wax layer, no animation */}
      <rect x="150" y="74" width="122" height="16" rx="2"
        fill={C_WAX} stroke={C_WAX_S} strokeWidth="1.2" />

      <text x="211" y="144" textAnchor="middle" fontSize="6.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.08em" fontWeight="500">FISCHER-TROPSCH</text>
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
  isLast: boolean;
}

// Curved dashed path connecting one strip's diagram column to the next.
// x1/x2 are percentage positions (0–100) matching the diagram column centres.
function StripConnector({ fromEven }: { fromEven: boolean }) {
  // diagram column centres: ~16 % (left) and ~84 % (right) of the container.
  const x1 = fromEven ? 16 : 84;
  const x2 = fromEven ? 84 : 16;
  return (
    <div className="hidden sm:block" aria-hidden="true" style={{ height: 52, position: 'relative' }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <path
          d={`M ${x1},0 C ${x1},50 ${x2},50 ${x2},100`}
          fill="none"
          stroke="var(--txf)"
          strokeOpacity="0.35"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function MechanismStrip({
  index, catDe, catEn, specValue, specLabelDe, specLabelEn,
  titleDe, titleEn, bodyDe, bodyEn,
  scienceLinkDe, scienceLinkEn, scienceAnchor, diagram, de, isLast,
}: StripProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(el,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out',
        delay: index * 0.08,
        scrollTrigger: { trigger: el, start: 'top 98%', once: true } },
    );
  }, [index]);

  const isEven = index % 2 === 0;
  const num = String(index + 1).padStart(2, '0');

  return (
    <>
      <div ref={stripRef} className="py-8 sm:py-10">

        {/* ── Content ── */}
        <div className={`flex flex-col sm:flex-row gap-8 sm:gap-12 items-center ${isEven ? '' : 'sm:flex-row-reverse'}`}>

          {/* Diagram — number badge overlaps the outer corner */}
          <div className="relative flex-shrink-0 w-full sm:w-auto" style={{ maxWidth: 308 }}>
            <div
              className={`absolute z-10 flex items-center justify-center select-none ${isEven ? '-top-4 -left-4' : '-top-4 -right-4 left-auto'}`}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--sf2)',
                border: '1.5px solid #3D67CA',
                boxShadow: '0 0 0 3px var(--sf), 0 2px 8px rgba(0,0,0,0.14)',
              }}
            >
              <span className="font-mono font-bold leading-none"
                style={{ fontSize: 11, letterSpacing: '0.06em', color: '#3D67CA' }}>
                {num}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)' }}>
              {diagram}
            </div>
          </div>

          {/* Text */}
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

      {/* ── Curved path connector to the next strip ── */}
      {!isLast && <StripConnector fromEven={isEven} />}
    </>
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

  const strips: Omit<StripProps, 'de' | 'index' | 'isLast'>[] = [
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
          <div style={{ borderTop: '1px solid var(--bd2)', paddingTop: '8px' }}>
            {strips.map((strip, i) => (
              <MechanismStrip key={i} {...strip} index={i} de={de} isLast={i === strips.length - 1} />
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
