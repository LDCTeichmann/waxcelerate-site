import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

// ─── CSS keyframes ────────────────────────────────────────────────────────────
const ANIM_STYLES = `
/* Strip 1 — water droplet falls through gap in coarse wax, hits metal */
@keyframes wx-drop-gap {
  0%,10%  { transform: translateY(0);   opacity: 1; }
  52%     { transform: translateY(38px); opacity: 1; }
  62%     { transform: translateY(38px); opacity: 0; }
  63%     { transform: translateY(0);   opacity: 0; }
  80%,100%{ transform: translateY(0);   opacity: 1; }
}
/* Rust spot grows in via scale after droplet lands */
@keyframes wx-rust-grow {
  0%,55%  { transform: scale(0); opacity: 0; }
  72%     { transform: scale(1.2); opacity: 0.7; }
  82%     { transform: scale(1);   opacity: 0.6; }
  100%    { transform: scale(1);   opacity: 0.6; }
}
/* Strip 1 — droplet on dense side slides off surface */
@keyframes wx-drop-slide {
  0%,15% { transform: translate(0, 0);   opacity: 1; }
  48%    { transform: translate(-11px, 9px); opacity: 1; }
  58%    { transform: translate(-14px, 9px); opacity: 0; }
  59%    { transform: translate(0, 0);   opacity: 0; }
  78%,100%{ transform: translate(0, 0); opacity: 1; }
}

/* Strip 2 — crack line draws itself in, then holds */
@keyframes wx-crack-draw {
  0%,20%  { stroke-dashoffset: 20; opacity: 0; }
  38%     { stroke-dashoffset: 0;  opacity: 1; }
  80%     { stroke-dashoffset: 0;  opacity: 1; }
  92%,100%{ stroke-dashoffset: 20; opacity: 0; }
}
/* Wax chip flies off chain */
@keyframes wx-chip-off {
  0%,32%  { transform: translate(0,0) rotate(0deg);   opacity: 0; }
  38%     { transform: translate(0,0) rotate(0deg);   opacity: 1; }
  65%     { transform: translate(10px,-8px) rotate(25deg); opacity: 0.9; }
  75%     { transform: translate(14px,-10px) rotate(35deg); opacity: 0; }
  76%,100%{ transform: translate(0,0) rotate(0deg);   opacity: 0; }
}
/* Right side chain — subtle flex pulse to show elasticity */
@keyframes wx-flex-pulse {
  0%,100%{ transform: scaleX(1)   scaleY(1);   }
  35%    { transform: scaleX(1.03) scaleY(0.97); }
  65%    { transform: scaleX(0.97) scaleY(1.03); }
}

/* Strip 3 — wax layer thinning (the outer bar shrinks in height) */
@keyframes wx-wax-thin {
  0%,10%  { transform: scaleY(1);   }
  55%     { transform: scaleY(0.38); }
  70%     { transform: scaleY(0.38); }
  88%,100%{ transform: scaleY(1);   }
}
/* Wax drip falls from thinning layer */
@keyframes wx-drip-fall {
  0%,18%  { transform: translateY(0);   opacity: 0;   }
  24%     { transform: translateY(0);   opacity: 0.8; }
  58%     { transform: translateY(28px); opacity: 0.8; }
  68%     { transform: translateY(28px); opacity: 0;   }
  69%,100%{ transform: translateY(0);   opacity: 0;   }
}
/* Dirt particle appears after wax leaves */
@keyframes wx-dirt-in {
  0%,55%  { transform: scale(0); opacity: 0; }
  72%     { transform: scale(1.1); opacity: 0.75; }
  82%,100%{ transform: scale(1);   opacity: 0.65; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 1 — Crystal grain size: why microcrystalline covers metal better
//
// Mechanism: coarse paraffin grains leave gaps between them → water reaches
// bare metal → oxidation. Fine microcrystalline grains pack tightly → no gaps.
// The animation SHOWS this: droplet falls through gap on left (rust appears),
// slides off surface on right (no rust).
// ─────────────────────────────────────────────────────────────────────────────
function CrystalDiagram() {
  // Right panel: 18 small grains arranged in 2 rows — tightly packed, no gaps
  const smallGrains: { cx: number; cy: number; r: number }[] = [];
  for (let i = 0; i < 10; i++) {
    smallGrains.push({ cx: 150 + i * 13, cy: 104, r: 5.5 });
  }
  for (let i = 0; i < 9; i++) {
    smallGrains.push({ cx: 156.5 + i * 13, cy: 115, r: 5 });
  }

  return (
    <svg viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      {/* ── panels ── */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd)" strokeWidth="1" />

      {/* ── metal surfaces ── */}
      <rect x="0"   y="128" width="138" height="24" fill="var(--bd2)" />
      <rect x="0"   y="128" width="138" height="2.5" fill="var(--bd)" />
      <rect x="142" y="128" width="138" height="24" fill="var(--bd2)" />
      <rect x="142" y="128" width="138" height="2.5" fill="var(--bd)" />

      {/* ── LEFT: 4 coarse grains, visible gaps between them ── */}
      {/* Grain positions chosen so gaps at ~x=38 and ~x=70 are clearly visible */}
      <ellipse cx="18"  cy="112" rx="16" ry="14" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="1" />
      <ellipse cx="52"  cy="111" rx="14" ry="15" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="1" />
      <ellipse cx="85"  cy="113" rx="15" ry="13" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="1" />
      <ellipse cx="118" cy="111" rx="13" ry="14" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="1" />
      {/* Down-arrows in the two main gaps to signal "water gets through here" */}
      <path d="M38,75 L38,95 M34,90 L38,96 L42,90" stroke="var(--bd)" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
      <path d="M70,75 L70,95 M66,90 L70,96 L74,90" stroke="var(--bd)" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />

      {/* Water droplet — falls through gap at x≈38, animates continuously */}
      <g style={{ animation: 'wx-drop-gap 4s ease-in-out infinite', transformOrigin: '38px 70px' }}>
        <ellipse cx="38" cy="66" rx="4" ry="5.5" fill="#4A90D9" opacity="0.9" />
        <polygon points="34,69 42,69 38,76" fill="#4A90D9" opacity="0.9" />
      </g>

      {/* Rust spot — appears after droplet reaches metal */}
      <g style={{ animation: 'wx-rust-grow 4s ease-in-out infinite', transformOrigin: '38px 133px' }}>
        <circle cx="38" cy="133" r="6" fill="rgba(192,57,43,0.55)" />
        <circle cx="38" cy="133" r="3" fill="rgba(192,57,43,0.4)" />
      </g>

      {/* ✗ badge */}
      <circle cx="10" cy="10" r="8" fill="rgba(192,57,43,0.12)" stroke="rgba(192,57,43,0.25)" strokeWidth="1" />
      <text x="10" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="#C0392B">✗</text>

      {/* ── RIGHT: 19 small grains, dense packing — no gaps visible ── */}
      {smallGrains.map((g, i) => (
        <ellipse key={i} cx={g.cx} cy={g.cy} rx={g.r} ry={g.r * 0.9}
          fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      ))}

      {/* Water droplet — arrives, cannot penetrate, slides off */}
      <g style={{ animation: 'wx-drop-slide 4s ease-in-out infinite', animationDelay: '1.4s', transformOrigin: '211px 88px' }}>
        <ellipse cx="211" cy="88" rx="4" ry="5.5" fill="#4A90D9" opacity="0.9" />
        <polygon points="207,91 215,91 211,98" fill="#4A90D9" opacity="0.9" />
      </g>

      {/* ✓ badge */}
      <circle cx="152" cy="10" r="8" fill="rgba(43,82,176,0.12)" stroke="rgba(43,82,176,0.25)" strokeWidth="1" />
      <text x="152" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3D67CA">✓</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 2 — Wax brittleness in cold: why the chain flakes and shifts
//
// Mechanism: standard wax becomes brittle under ~5°C — flex stress from chain
// movement cracks the matrix and chips it off → lubrication fails → shifting
// degrades. MoS₂ keeps the matrix elastic so it deforms rather than cracks.
// Animation: left side shows crack lines appear + chip flies off.
//            Right side flexes smoothly, no cracking.
// ─────────────────────────────────────────────────────────────────────────────
function ColdDiagram() {
  return (
    <svg viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      {/* ── panels ── */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd)" strokeWidth="1" />

      {/* ── temperature indicator shared at top ── */}
      {/* Snowflake — simple 6-pointed star */}
      <g transform="translate(140, 16)" opacity="0.55">
        <line x1="0" y1="-9" x2="0" y2="9"  stroke="var(--txm)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-8" y1="-4.5" x2="8" y2="4.5" stroke="var(--txm)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="-4.5"  x2="-8" y2="4.5" stroke="var(--txm)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-4" y1="-7.5" x2="4" y2="7.5"  stroke="var(--txm)" strokeWidth="1" strokeLinecap="round" />
        <line x1="4" y1="-7.5"  x2="-4" y2="7.5" stroke="var(--txm)" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* ── LEFT: brittle wax chain link ── */}
      {/* Chain link outer ring */}
      <rect x="18" y="50" width="100" height="64" rx="32" fill="none"
        stroke="var(--txm)" strokeWidth="2.5" />
      {/* Inner cutout */}
      <rect x="36" y="67" width="64" height="30" rx="15" fill="none"
        stroke="var(--txm)" strokeWidth="1.5" />
      {/* Wax coating layer — shown as a slightly larger ring, rigid, will crack */}
      <rect x="13" y="45" width="110" height="74" rx="37" fill="none"
        stroke="var(--sf3)" strokeWidth="7" />

      {/* Crack line 1 — draws itself in, then fades */}
      <line x1="32" y1="58" x2="46" y2="72"
        stroke="var(--tx1)" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="20" strokeDashoffset="20"
        style={{ animation: 'wx-crack-draw 4s ease-in-out infinite', animationDelay: '0s' }}
        opacity="0" />
      {/* Crack line 2 */}
      <line x1="58" y1="48" x2="68" y2="62"
        stroke="var(--tx1)" strokeWidth="1.2" strokeLinecap="round"
        strokeDasharray="18" strokeDashoffset="18"
        style={{ animation: 'wx-crack-draw 4s ease-in-out infinite', animationDelay: '0.3s' }}
        opacity="0" />
      {/* Crack line 3 */}
      <line x1="90" y1="52" x2="100" y2="63"
        stroke="var(--tx1)" strokeWidth="1.4" strokeLinecap="round"
        strokeDasharray="16" strokeDashoffset="16"
        style={{ animation: 'wx-crack-draw 4s ease-in-out infinite', animationDelay: '0.18s' }}
        opacity="0" />

      {/* Wax chip that flies off */}
      <g style={{ animation: 'wx-chip-off 4s ease-in-out infinite', animationDelay: '0s' }}
        opacity="0">
        <rect x="28" y="54" width="10" height="6" rx="2"
          fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      </g>

      {/* ✗ badge */}
      <circle cx="10" cy="10" r="8" fill="rgba(192,57,43,0.12)" stroke="rgba(192,57,43,0.25)" strokeWidth="1" />
      <text x="10" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="#C0392B">✗</text>

      {/* ── RIGHT: elastic Pro wax — flexes, no cracking ── */}
      {/* Chain link outer ring */}
      <g style={{ animation: 'wx-flex-pulse 4s ease-in-out infinite', transformOrigin: '211px 82px' }}>
        <rect x="160" y="50" width="100" height="64" rx="32" fill="none"
          stroke="var(--txm)" strokeWidth="2.5" />
        <rect x="178" y="67" width="64" height="30" rx="15" fill="none"
          stroke="var(--txm)" strokeWidth="1.5" />
        {/* Wax coating — smooth, no cracks, slightly glowing to suggest elasticity */}
        <rect x="155" y="45" width="110" height="74" rx="37" fill="none"
          stroke="rgba(61,103,202,0.45)" strokeWidth="7" />
      </g>

      {/* No cracks, no chips */}

      {/* ✓ badge */}
      <circle cx="152" cy="10" r="8" fill="rgba(43,82,176,0.12)" stroke="rgba(43,82,176,0.25)" strokeWidth="1" />
      <text x="152" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3D67CA">✓</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 3 — Wax migration under heat: why soft wax thins and exposes chain
//
// Mechanism: soft paraffin reaches its flow point at chain contact temperatures
// (~45–55°C) → wax migrates away from joints → thin spots → dirt sticks to
// exposed metal. Hard Fischer-Tropsch matrix (drop point ~75°C) stays in place.
// Animation: LEFT shows wax layer visibly thinning + drips + dirt.
//            RIGHT shows wax layer stable, clean chain.
// ─────────────────────────────────────────────────────────────────────────────
function HeatDiagram() {
  return (
    <svg viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      {/* ── panels ── */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd)" strokeWidth="1" />

      {/* ── shared heat indicator: wavy line at bottom of each panel ── */}
      {/* Left heat waves */}
      <path d="M4,145 Q17,138 30,145 Q43,152 56,145 Q69,138 82,145 Q95,152 108,145 Q121,138 134,145"
        fill="none" stroke="rgba(192,100,43,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right heat waves */}
      <path d="M146,145 Q159,138 172,145 Q185,152 198,145 Q211,138 224,145 Q237,152 250,145 Q263,138 276,145"
        fill="none" stroke="rgba(192,100,43,0.35)" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Chain representation: two horizontal bars (cross-section side view) ── */}
      {/* LEFT chain body */}
      <rect x="8"   y="88" width="122" height="26" rx="4" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />
      {/* RIGHT chain body */}
      <rect x="150" y="88" width="122" height="26" rx="4" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />

      {/* ── LEFT: wax coating layer — thinning animation ── */}
      {/* The wax layer sits ON TOP of the chain (y=72 to y=88, height=16) */}
      {/* We animate scaleY from 1 → 0.38, transform-origin at bottom edge (y=88) */}
      <g style={{ animation: 'wx-wax-thin 4s ease-in-out infinite', transformOrigin: '69px 88px' }}>
        <rect x="8" y="72" width="122" height="16" rx="3"
          fill="rgba(200,170,60,0.45)" stroke="rgba(200,170,60,0.6)" strokeWidth="1" />
      </g>

      {/* Three wax drips — staggered */}
      <g style={{ animation: 'wx-drip-fall 4s ease-in-out infinite', animationDelay: '0s', transformOrigin: '35px 90px' }}>
        <ellipse cx="35" cy="90" rx="3" ry="4" fill="rgba(200,170,60,0.65)" />
        <polygon points="32,93 38,93 35,100" fill="rgba(200,170,60,0.65)" />
      </g>
      <g style={{ animation: 'wx-drip-fall 4s ease-in-out infinite', animationDelay: '0.8s', transformOrigin: '69px 90px' }}>
        <ellipse cx="69" cy="90" rx="2.5" ry="3.5" fill="rgba(200,170,60,0.6)" />
        <polygon points="66.5,93 71.5,93 69,99" fill="rgba(200,170,60,0.6)" />
      </g>
      <g style={{ animation: 'wx-drip-fall 4s ease-in-out infinite', animationDelay: '1.5s', transformOrigin: '100px 90px' }}>
        <ellipse cx="100" cy="90" rx="3" ry="4" fill="rgba(200,170,60,0.65)" />
        <polygon points="97,93 103,93 100,100" fill="rgba(200,170,60,0.65)" />
      </g>

      {/* Dirt particles appear on exposed chain surface */}
      <g style={{ animation: 'wx-dirt-in 4s ease-in-out infinite', transformOrigin: '35px 97px' }}>
        <circle cx="35" cy="97" r="3" fill="rgba(90,65,40,0.65)" />
      </g>
      <g style={{ animation: 'wx-dirt-in 4s ease-in-out infinite', animationDelay: '0.3s', transformOrigin: '69px 97px' }}>
        <circle cx="69" cy="97" r="2.5" fill="rgba(90,65,40,0.6)" />
      </g>
      <g style={{ animation: 'wx-dirt-in 4s ease-in-out infinite', animationDelay: '0.6s', transformOrigin: '100px 97px' }}>
        <circle cx="100" cy="97" r="3" fill="rgba(90,65,40,0.65)" />
      </g>

      {/* ✗ badge */}
      <circle cx="10" cy="10" r="8" fill="rgba(192,57,43,0.12)" stroke="rgba(192,57,43,0.25)" strokeWidth="1" />
      <text x="10" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="#C0392B">✗</text>

      {/* ── RIGHT: stable wax layer — no thinning, no drips ── */}
      {/* Wax layer stays constant thickness */}
      <rect x="150" y="72" width="122" height="16" rx="3"
        fill="rgba(61,103,202,0.30)" stroke="rgba(61,103,202,0.45)" strokeWidth="1" />

      {/* No drips, no dirt. Subtle glow to signal stability */}
      {/* Clean indicator line */}
      <line x1="150" y1="88" x2="272" y2="88" stroke="rgba(61,103,202,0.2)" strokeWidth="0.5" />

      {/* ✓ badge */}
      <circle cx="152" cy="10" r="8" fill="rgba(43,82,176,0.12)" stroke="rgba(43,82,176,0.25)" strokeWidth="1" />
      <text x="152" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3D67CA">✓</text>
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

  // Inject keyframes once
  useEffect(() => {
    const id = 'wx-anim-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = ANIM_STYLES;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

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
