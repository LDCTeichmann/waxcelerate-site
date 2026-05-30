import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

// ─── CSS keyframes injected once ─────────────────────────────────────────────
const ANIM_STYLES = `
@keyframes wx-drop-bad {
  0%   { transform: translateY(0px);   opacity: 1; }
  55%  { transform: translateY(32px);  opacity: 1; }
  70%  { transform: translateY(32px);  opacity: 0; }
  71%  { transform: translateY(0px);   opacity: 0; }
  85%  { transform: translateY(0px);   opacity: 1; }
  100% { transform: translateY(0px);   opacity: 1; }
}
@keyframes wx-rust-pulse {
  0%,60%  { opacity: 0; r: 0; }
  75%     { opacity: 1; r: 5; }
  90%     { opacity: 0.7; r: 4; }
  100%    { opacity: 0.7; r: 4; }
}
@keyframes wx-droplet-slide {
  0%   { transform: translateY(0px) translateX(0px); opacity: 1; }
  40%  { transform: translateY(10px) translateX(-8px); opacity: 1; }
  55%  { transform: translateY(10px) translateX(-8px); opacity: 0; }
  56%  { transform: translateY(0px) translateX(0px);  opacity: 0; }
  75%  { transform: translateY(0px) translateX(0px);  opacity: 1; }
  100% { transform: translateY(0px) translateX(0px);  opacity: 1; }
}
@keyframes wx-wax-drip {
  0%   { transform: translateY(0px);  opacity: 0.9; }
  50%  { transform: translateY(22px); opacity: 0.9; }
  65%  { transform: translateY(22px); opacity: 0; }
  66%  { transform: translateY(0px);  opacity: 0; }
  80%  { transform: translateY(0px);  opacity: 0.9; }
  100% { transform: translateY(0px);  opacity: 0.9; }
}
@keyframes wx-dirt-appear {
  0%,55%  { opacity: 0; }
  80%     { opacity: 1; }
  100%    { opacity: 1; }
}
@keyframes wx-temp-pulse {
  0%,100% { opacity: 0.6; }
  50%     { opacity: 1; }
}
@keyframes wx-chain-shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-1.5px); }
  40%     { transform: translateX(1.5px); }
  60%     { transform: translateX(-1px); }
  80%     { transform: translateX(1px); }
}
@keyframes wx-strip-in {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ─── Crystal Coverage Diagram — Strip 1 ──────────────────────────────────────
function CrystalDiagram() {
  return (
    <svg
      viewBox="0 0 280 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: 280, height: 'auto', display: 'block' }}
    >
      {/* ── LEFT panel: coarse paraffin ── */}
      {/* background */}
      <rect x="0" y="0" width="134" height="160" fill="var(--sf2)" />

      {/* Label */}
      <text x="67" y="14" textAnchor="middle" fontSize="7" fontWeight="600"
        letterSpacing="0.08em" fill="var(--txff)" style={{ textTransform: 'uppercase' }}>
        Standard-Paraffin
      </text>

      {/* Metal surface line */}
      <rect x="4" y="130" width="126" height="26" rx="2"
        fill="var(--bd2)" />
      <rect x="4" y="130" width="126" height="3"
        fill="var(--bd)" />

      {/* Coarse, irregular crystals — big angular shapes with visible gaps */}
      {/* Crystal 1 */}
      <polygon points="8,110 28,68 50,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      {/* Crystal 2 */}
      <polygon points="42,110 58,72 76,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      {/* Crystal 3 */}
      <polygon points="70,110 84,76 100,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      {/* Crystal 4 */}
      <polygon points="96,110 110,70 130,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      {/* Gap indicators — small gap lines between crystals visible */}
      <line x1="40" y1="110" x2="44" y2="126" stroke="var(--bd)" strokeWidth="0.6" strokeDasharray="2,2" />
      <line x1="68" y1="110" x2="72" y2="126" stroke="var(--bd)" strokeWidth="0.6" strokeDasharray="2,2" />
      <line x1="94" y1="110" x2="98" y2="126" stroke="var(--bd)" strokeWidth="0.6" strokeDasharray="2,2" />

      {/* Water droplet falling through gap — animated */}
      <g style={{ animation: 'wx-drop-bad 3.6s ease-in-out infinite', animationDelay: '0.3s' }}>
        {/* droplet body */}
        <ellipse cx="70" cy="92" rx="4" ry="5.5" fill="#4A90D9" opacity="0.85" />
        {/* droplet tip */}
        <polygon points="67,94 73,94 70,100" fill="#4A90D9" opacity="0.85" />
      </g>

      {/* Rust dot at metal surface — appears after droplet lands */}
      <circle cx="70" cy="133" r="0" fill="#C0392B" opacity="0"
        style={{ animation: 'wx-rust-pulse 3.6s ease-in-out infinite', animationDelay: '0.3s' }} />

      {/* ✗ badge */}
      <rect x="4" y="18" width="16" height="10" rx="2" fill="rgba(192,57,43,0.15)" />
      <text x="12" y="26" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#C0392B">✗</text>

      {/* ── Divider ── */}
      <line x1="137" y1="4" x2="137" y2="156" stroke="var(--bd)" strokeWidth="0.8" />

      {/* ── RIGHT panel: microcrystalline ── */}
      {/* background */}
      <rect x="146" y="0" width="134" height="160" fill="var(--sf2)" />

      {/* Label */}
      <text x="213" y="14" textAnchor="middle" fontSize="7" fontWeight="600"
        letterSpacing="0.08em" fill="var(--txff)" style={{ textTransform: 'uppercase' }}>
        Mikrokristallin
      </text>

      {/* Metal surface */}
      <rect x="150" y="130" width="126" height="26" rx="2" fill="var(--bd2)" />
      <rect x="150" y="130" width="126" height="3" fill="var(--bd)" />

      {/* Fine, tightly-packed crystals — many small shapes, no gaps visible */}
      {/* Row 1 */}
      <polygon points="150,110 157,90 164,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="163,110 170,88 177,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="176,110 183,92 190,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="189,110 196,90 203,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="202,110 209,88 216,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="215,110 222,92 229,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="228,110 235,90 242,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="241,110 248,88 255,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      <polygon points="254,110 261,92 268,110" fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.5" />
      {/* Row 2 — offset fill to close gaps */}
      <polygon points="156,110 163,96 170,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />
      <polygon points="169,110 176,94 183,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />
      <polygon points="182,110 189,96 196,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />
      <polygon points="195,110 202,94 209,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />
      <polygon points="208,110 215,96 222,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />
      <polygon points="221,110 228,94 235,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />
      <polygon points="234,110 241,96 248,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />
      <polygon points="247,110 254,94 261,110" fill="var(--bd2)" stroke="var(--bd)" strokeWidth="0.4" opacity="0.7" />

      {/* Water droplet bouncing off surface — no penetration */}
      <g style={{ animation: 'wx-droplet-slide 3.6s ease-in-out infinite', animationDelay: '1.2s' }}>
        <ellipse cx="213" cy="90" rx="4" ry="5.5" fill="#4A90D9" opacity="0.85" />
        <polygon points="210,92 216,92 213,98" fill="#4A90D9" opacity="0.85" />
      </g>

      {/* ✓ badge */}
      <rect x="150" y="18" width="16" height="10" rx="2" fill="rgba(43,82,176,0.15)" />
      <text x="158" y="26" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#3D67CA">✓</text>

      {/* No rust dot on right side — clean metal surface */}
      <text x="213" y="146" textAnchor="middle" fontSize="6.5" fill="var(--txff)">kein Kontakt</text>
    </svg>
  );
}

// ─── Temperature Range Diagram — Strip 2 ─────────────────────────────────────
function TempDiagram({ de }: { de: boolean }) {
  // Temp range: -15°C to +45°C = 60° total range, 260px wide
  // -8°C position: ((-8 - (-15)) / 60) * 260 = (7/60)*260 ≈ 30px
  // 0°C position:  (15/60)*260 ≈ 65px
  // +5°C position: (20/60)*260 ≈ 87px
  const BAR_W = 240;
  const RANGE = 60; // -15 to +45
  const toX = (t: number) => ((t + 15) / RANGE) * BAR_W;
  const xNeg8 = toX(-8);   // ≈ 28px — left end of Waxcelerate range
  const xZero = toX(0);    // ≈ 60px — zero line
  const xStd  = toX(5);    // ≈ 80px — where std wax starts working properly
  const BAR_Y = 72;

  return (
    <svg
      viewBox="0 0 280 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: 280, height: 'auto', display: 'block' }}
    >
      {/* Temperature scale labels */}
      <text x="20" y="28" fontSize="8" fontWeight="600" fill="var(--txff)">−15 °C</text>
      <text x="240" y="28" textAnchor="end" fontSize="8" fontWeight="600" fill="var(--txff)">+45 °C</text>
      <text x={20 + xZero} y="28" textAnchor="middle" fontSize="8" fill="var(--txm)">0°</text>

      {/* Zero line */}
      <line x1={20 + xZero} y1="32" x2={20 + xZero} y2={BAR_Y + 54}
        stroke="var(--bd)" strokeWidth="0.8" strokeDasharray="3,3" />

      {/* ── Standard wax zone bar ── */}
      {/* Gray track — full range */}
      <rect x="20" y={BAR_Y} width={BAR_W} height="18" rx="9"
        fill="var(--sf3)" />
      {/* Standard wax: works from ~+5°C upward */}
      <rect x={20 + xStd} y={BAR_Y} width={BAR_W - xStd} height="18" rx="5"
        fill="var(--bd)" opacity="0.9" />
      {/* Frozen zone for std (below +5): red-muted */}
      <rect x="20" y={BAR_Y} width={xStd} height="18" rx="9"
        fill="rgba(192,57,43,0.22)" />

      {/* ── Waxcelerate Pro zone ── */}
      <rect x={20 + xNeg8} y={BAR_Y + 22} width={BAR_W - xNeg8} height="18" rx="5"
        fill="rgba(43,82,176,0.30)" />
      <rect x={20 + xNeg8} y={BAR_Y + 22} width={xZero - xNeg8} height="18" rx="0"
        fill="rgba(61,103,202,0.50)"
        style={{ animation: 'wx-temp-pulse 2.8s ease-in-out infinite' }} />

      {/* Labels on bars */}
      <text x="22" y={BAR_Y + 13} fontSize="7" fontWeight="600" fill="rgba(192,57,43,0.8)">
        {de ? 'std. Wachs verhärtet' : 'std. wax hardens'}
      </text>
      <text x={20 + xStd + 4} y={BAR_Y + 13} fontSize="7" fill="var(--txm)">
        {de ? 'standard Bereich' : 'standard range'}
      </text>

      <text x={20 + xNeg8 + 2} y={BAR_Y + 35} fontSize="7" fontWeight="600" fill="#5B8BED">
        Pro — {de ? 'flexibel ab' : 'flexible from'}
      </text>

      {/* Bracket showing the Pro advantage zone (below 0°C) */}
      <line x1={20 + xNeg8} y1={BAR_Y + 46} x2={20 + xZero} y2={BAR_Y + 46}
        stroke="#3D67CA" strokeWidth="1" />
      <line x1={20 + xNeg8} y1={BAR_Y + 43} x2={20 + xNeg8} y2={BAR_Y + 49}
        stroke="#3D67CA" strokeWidth="1" />
      <line x1={20 + xZero} y1={BAR_Y + 43} x2={20 + xZero} y2={BAR_Y + 49}
        stroke="#3D67CA" strokeWidth="1" />
      <text x={(20 + xNeg8 + 20 + xZero) / 2} y={BAR_Y + 57}
        textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#3D67CA">
        −8 °C
      </text>

      {/* Chain-link icon at the frozen zone — with shake animation */}
      <g transform={`translate(${20 + xNeg8 / 2 - 8}, ${BAR_Y - 28})`}
        style={{ animation: 'wx-chain-shake 0.5s ease-in-out infinite', animationDelay: '1s', animationIterationCount: '3', animationPlayState: 'running' }}>
        {/* Simple chain link */}
        <rect x="4" y="4" width="16" height="12" rx="6" fill="none" stroke="rgba(192,57,43,0.6)" strokeWidth="2" />
        <rect x="7" y="7" width="10" height="6" rx="3" fill="none" stroke="rgba(192,57,43,0.4)" strokeWidth="1.2" />
      </g>

      {/* Legend */}
      <rect x="20" y={BAR_Y + 70} width="8" height="8" rx="2" fill="rgba(192,57,43,0.22)" />
      <text x="32" y={BAR_Y + 78} fontSize="7" fill="var(--txm)">
        {de ? 'Standard-Wachs' : 'Standard wax'}
      </text>
      <rect x="120" y={BAR_Y + 70} width="8" height="8" rx="2" fill="rgba(43,82,176,0.40)" />
      <text x="132" y={BAR_Y + 78} fontSize="7" fill="var(--txm)">
        Pro (MoS₂)
      </text>
    </svg>
  );
}

// ─── Wax Shedding Diagram — Strip 3 ──────────────────────────────────────────
function SheddingDiagram({ de }: { de: boolean }) {
  return (
    <svg
      viewBox="0 0 280 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: 280, height: 'auto', display: 'block' }}
    >
      {/* ── LEFT: wax migrating off chain ── */}
      <rect x="0" y="0" width="134" height="160" fill="var(--sf2)" />
      <text x="67" y="14" textAnchor="middle" fontSize="7" fontWeight="600"
        letterSpacing="0.08em" fill="var(--txff)" style={{ textTransform: 'uppercase' }}>
        {de ? 'Weiches Wachs' : 'Soft wax'}
      </text>

      {/* Chain link outline */}
      <rect x="24" y="52" width="86" height="50" rx="25" fill="none"
        stroke="var(--bd)" strokeWidth="3" />
      <rect x="37" y="64" width="60" height="26" rx="13" fill="none"
        stroke="var(--bd)" strokeWidth="1.5" />

      {/* Wax coating on chain — shown as dripping off */}
      {/* Wax layer that's thinning */}
      <rect x="24" y="49" width="86" height="6" rx="3"
        fill="rgba(180,160,80,0.35)" />
      <rect x="24" y="95" width="86" height="6" rx="3"
        fill="rgba(180,160,80,0.35)" />

      {/* Dripping wax droplets — animated */}
      <g style={{ animation: 'wx-wax-drip 2.8s ease-in-out infinite', animationDelay: '0s' }}>
        <ellipse cx="48" cy="102" rx="3.5" ry="5" fill="rgba(200,170,60,0.7)" />
        <polygon points="45,105 51,105 48,113" fill="rgba(200,170,60,0.7)" />
      </g>
      <g style={{ animation: 'wx-wax-drip 2.8s ease-in-out infinite', animationDelay: '0.9s' }}>
        <ellipse cx="67" cy="104" rx="3" ry="4.5" fill="rgba(200,170,60,0.65)" />
        <polygon points="64,107 70,107 67,114" fill="rgba(200,170,60,0.65)" />
      </g>
      <g style={{ animation: 'wx-wax-drip 2.8s ease-in-out infinite', animationDelay: '1.7s' }}>
        <ellipse cx="87" cy="101" rx="3.5" ry="5" fill="rgba(200,170,60,0.7)" />
        <polygon points="84,104 90,104 87,112" fill="rgba(200,170,60,0.7)" />
      </g>

      {/* Dirt particles sticking to chain — appear after wax leaves */}
      <circle cx="43" cy="57" r="2" fill="rgba(100,80,50,0.6)"
        style={{ animation: 'wx-dirt-appear 2.8s ease-in-out infinite', animationDelay: '0s' }} />
      <circle cx="72" cy="55" r="1.5" fill="rgba(100,80,50,0.55)"
        style={{ animation: 'wx-dirt-appear 2.8s ease-in-out infinite', animationDelay: '0.5s' }} />
      <circle cx="95" cy="58" r="2" fill="rgba(100,80,50,0.6)"
        style={{ animation: 'wx-dirt-appear 2.8s ease-in-out infinite', animationDelay: '1s' }} />

      {/* Time label */}
      <text x="67" y="148" textAnchor="middle" fontSize="7" fill="var(--txff)">
        {de ? 'nach 40 km · 28 °C' : 'after 40 km · 28 °C'}
      </text>

      {/* ✗ badge */}
      <rect x="4" y="18" width="16" height="10" rx="2" fill="rgba(192,57,43,0.15)" />
      <text x="12" y="26" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#C0392B">✗</text>

      {/* ── Divider ── */}
      <line x1="137" y1="4" x2="137" y2="156" stroke="var(--bd)" strokeWidth="0.8" />

      {/* ── RIGHT: wax stays on chain ── */}
      <rect x="146" y="0" width="134" height="160" fill="var(--sf2)" />
      <text x="213" y="14" textAnchor="middle" fontSize="7" fontWeight="600"
        letterSpacing="0.08em" fill="var(--txff)" style={{ textTransform: 'uppercase' }}>
        {de ? 'Härtere Matrix' : 'Harder matrix'}
      </text>

      {/* Chain link outline */}
      <rect x="170" y="52" width="86" height="50" rx="25" fill="none"
        stroke="var(--bd)" strokeWidth="3" />
      <rect x="183" y="64" width="60" height="26" rx="13" fill="none"
        stroke="var(--bd)" strokeWidth="1.5" />

      {/* Wax coating — solid, thicker, no drips */}
      <rect x="170" y="48" width="86" height="8" rx="4"
        fill="rgba(61,103,202,0.35)" />
      <rect x="170" y="94" width="86" height="8" rx="4"
        fill="rgba(61,103,202,0.35)" />
      {/* Left and right wax edges */}
      <rect x="170" y="56" width="8" height="38" rx="4"
        fill="rgba(61,103,202,0.25)" />
      <rect x="248" y="56" width="8" height="38" rx="4"
        fill="rgba(61,103,202,0.25)" />

      {/* No droplets, no dirt — clean chain */}
      <text x="213" y="80" textAnchor="middle" fontSize="7.5" fontWeight="500" fill="rgba(61,103,202,0.7)">
        {de ? 'kein Shedding' : 'no shedding'}
      </text>

      {/* Time label */}
      <text x="213" y="148" textAnchor="middle" fontSize="7" fill="var(--txff)">
        {de ? 'nach 400 km · 28 °C' : 'after 400 km · 28 °C'}
      </text>

      {/* ✓ badge */}
      <rect x="150" y="18" width="16" height="10" rx="2" fill="rgba(43,82,176,0.15)" />
      <text x="158" y="26" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#3D67CA">✓</text>
    </svg>
  );
}

// ─── Friction bar data ────────────────────────────────────────────────────────
const frictionMini = [
  { label: 'Pro',                           val: 'μ 0,03–0,06', pct: 100, highlight: true  },
  { label: 'Classic',                       val: 'μ 0,05–0,07', pct: 80,  highlight: true  },
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
  specValue: string;
  specLabelDe: string; specLabelEn: string;
  titleDe: string; titleEn: string;
  bodyDe: string; bodyEn: string;
  scienceLinkDe: string; scienceLinkEn: string;
  scienceAnchor: string;
  diagram: React.ReactNode;
  de: boolean;
}

function MechanismStrip({ index, catDe, catEn, specValue, specLabelDe, specLabelEn,
  titleDe, titleEn, bodyDe, bodyEn, scienceLinkDe, scienceLinkEn,
  scienceAnchor, diagram, de }: StripProps) {

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
    return () => {};
  }, [index]);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={stripRef}
      className="strip-row py-8 sm:py-10"
      style={{ borderBottom: '1px solid var(--bd2)' }}
    >
      <div className={`flex flex-col sm:flex-row gap-6 sm:gap-10 items-center ${isEven ? '' : 'sm:flex-row-reverse'}`}>

        {/* ── Diagram panel ── */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{
            width: '100%',
            maxWidth: 280,
            background: 'var(--sf2)',
            border: '1px solid var(--bd2)',
          }}
        >
          {diagram}
        </div>

        {/* ── Text panel ── */}
        <div className="flex-1 min-w-0">

          {/* Eyebrow + spec number row */}
          <div className="flex items-center justify-between mb-3 gap-4">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.22em] flex-shrink-0"
              style={{ color: 'var(--txff)' }}
            >
              {de ? catDe : catEn}
            </span>
            <span
              className="font-display font-bold tabular-nums leading-none flex-shrink-0"
              style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: 'var(--tx1)' }}
            >
              {specValue}
            </span>
          </div>

          {/* Spec label */}
          <p className="text-[10px] font-medium mb-3 -mt-1 text-right"
            style={{ color: '#3D67CA' }}>
            {de ? specLabelDe : specLabelEn}
          </p>

          {/* Title */}
          <h3
            className="font-serif-display italic font-bold text-wx-tx1 mb-3 leading-tight"
            style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.45rem)' }}
          >
            {de ? titleDe : titleEn}
          </h3>

          {/* Body */}
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--txm)' }}>
            {de ? bodyDe : bodyEn}
          </p>

          {/* Science link */}
          <Link
            to={`/wissenschaft${scienceAnchor}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
            style={{ color: '#264E8C' }}
          >
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
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const proofRef   = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

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

  // Proof strip: friction bars animate in on scroll
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
      specValue: 'μ-Dicht',
      specLabelDe: 'Mikrokristalline Abdeckung',
      specLabelEn: 'Microcrystalline coverage',
      titleDe: 'Kein Rost nach der Regenfahrt',
      titleEn: 'No rust after a wet ride',
      bodyDe: 'Standard-Paraffin hat eine grobkristalline Struktur — zwischen den Kristallen entstehen Lücken, durch die Wasser das Metall erreicht. Mikrokristallines Hartwachs vernetzt dichter, schließt diese Lücken und deckt mehr Metalloberfläche ab.',
      bodyEn: 'Standard paraffin has a coarse crystal structure — gaps form between crystals through which water reaches bare metal. Microcrystalline hard wax cross-links more densely, closes those gaps, and covers more metal surface.',
      scienceLinkDe: 'Kristallstruktur erklärt',
      scienceLinkEn: 'Crystal structure explained',
      scienceAnchor: '#kristallstruktur',
      diagram: <CrystalDiagram />,
    },
    {
      catDe: 'Winterformel · Pro',
      catEn: 'Winter formula · Pro',
      specValue: '−8 °C',
      specLabelDe: 'Untergrenze für saubere Schaltung',
      specLabelEn: 'Lower limit for clean shifting',
      titleDe: 'Keine Schaltprobleme unter Null',
      titleEn: 'No shifting problems below zero',
      bodyDe: 'Standard-Wachse verhärten unter ~5 °C — Kettengelenke blockieren, die Schaltung springt oder blockiert. Amorphes MoS₂ als Hochdruckadditiv hält die Wachsmatrix flexibel, auch tief im Minusbereich.',
      bodyEn: 'Standard waxes harden below ~5 °C — link joints seize, shifting skips or locks. Amorphous MoS₂ as a high-pressure additive keeps the wax matrix flexible, even deep below freezing.',
      scienceLinkDe: 'Winterformel & MoS₂ erklärt',
      scienceLinkEn: 'Winter formula & MoS₂ explained',
      scienceAnchor: '#winterformel',
      diagram: <TempDiagram de={de} />,
    },
    {
      catDe: 'Sommerbeständigkeit',
      catEn: 'Summer stability',
      specValue: '+75 °C',
      specLabelDe: 'Tropfpunkt der Wachsmatrix',
      specLabelEn: 'Drop point of wax matrix',
      titleDe: 'Kein Shedding in der Sommerhitze',
      titleEn: 'No shedding in summer heat',
      bodyDe: 'Weiches Wachs migriert auf heißem Asphalt — Rückstände tropfen ab, Schmutz haftet an der nackten Kette. Die härtere Wachsmatrix hält Position: kein Shedding, kein Schmutzfilm, deutlich längere Intervalle.',
      bodyEn: 'Soft wax migrates on hot asphalt — residue drips off and dirt sticks to the exposed chain. The harder wax matrix holds its position: no shedding, no grime film, significantly longer intervals.',
      scienceLinkDe: 'Matrix & Tropfpunkt erklärt',
      scienceLinkEn: 'Matrix & drop point explained',
      scienceAnchor: '#matrix',
      diagram: <SheddingDiagram de={de} />,
    },
  ];

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-20 sm:py-28 bg-wx-sf chain-texture">

      {/* Top fade */}
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
            <p data-reveal="subtitle" className="text-wx-txm max-w-lg text-[15px]">
              {de
                ? 'Drei Bedingungen, an denen Schmiermittel versagen. Hier ist die Chemie dahinter — und warum sie bei Waxcelerate nicht versagen.'
                : 'Three conditions where lubricants fail. Here is the chemistry behind each — and why they don\'t fail with Waxcelerate.'}
            </p>
          </div>

          {/* ── Three mechanism strips ── */}
          <div style={{ borderTop: '1px solid var(--bd2)' }}>
            {strips.map((strip, i) => (
              <MechanismStrip key={i} index={i} de={de} {...strip} />
            ))}
          </div>

          {/* ── Batch quality trust bar ── */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-6 mt-1 mb-8"
            style={{ borderBottom: '1px solid var(--bd2)' }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              {/* Five block icons — equal fill to signal consistency */}
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map(n => (
                  <div key={n} className="flex flex-col gap-0.5">
                    {/* Fill indicator */}
                    <div style={{ width: 10, height: 18, background: 'var(--sf3)', borderRadius: 3, border: '1px solid var(--bd)', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '78%', background: 'rgba(43,82,176,0.40)', borderRadius: 2 }} />
                      {/* MoS₂ dots — evenly distributed */}
                      <div style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: 'rgba(61,103,202,0.7)', top: '30%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: 'var(--tx2)' }}>
                  {de ? 'Block 1 = Block 100' : 'Block 1 = Block 100'}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--txf)' }}>
                  {de
                    ? 'Kleinstchargen in Stuttgart — MoS₂ gleichmäßig verteilt, jede Charge kontrolliert homogenisiert'
                    : 'Small batches in Stuttgart — MoS₂ evenly distributed, every batch controlled homogenised'}
                </p>
              </div>
            </div>
            <Link
              to="/wissenschaft#sedimentation"
              className="text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
              style={{ color: '#264E8C' }}
            >
              {de ? 'Sedimentation erklärt →' : 'Sedimentation explained →'}
            </Link>
          </div>

          {/* ── Proof strip: friction + cost ── */}
          <div ref={proofRef} className="grid sm:grid-cols-2 gap-3 mb-7">

            {/* Friction card */}
            <div className="rounded-xl border border-wx-bd p-5 flex flex-col" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Reibung' : 'Friction'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">
                  μ 0,03
                </span>
              </div>
              <div className="space-y-2.5 flex-1">
                {frictionMini.map((item, i) => {
                  const label = 'label' in item ? item.label : (de ? item.labelDe : item.labelEn);
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-[11px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>
                          {label}
                        </span>
                        <span className={`text-[11px] font-mono tabular-nums ${item.highlight ? 'text-wx-tx2' : 'text-wx-txff'}`}>
                          {item.val}
                        </span>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                        <div
                          className="fbar h-full w-full rounded-full"
                          data-w={item.pct}
                          style={{
                            background: item.highlight
                              ? 'linear-gradient(90deg, #0F2450, #3D67CA)'
                              : 'var(--bd2)',
                            transformOrigin: 'left center',
                            transform: 'scaleX(0)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/wissenschaft#reibung"
                className="flex items-center gap-1 text-[11px] font-medium mt-3 pt-3 transition-opacity hover:opacity-70"
                style={{ color: '#264E8C', borderTop: '1px solid var(--bd2)' }}
              >
                {de ? 'Vollständiger Vergleich →' : 'Full comparison →'}
              </Link>
            </div>

            {/* Cost savings card */}
            <div className="rounded-xl border border-wx-bd p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Kostenersparnis' : 'Cost savings'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">
                  ~€70
                </span>
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
              <p className="text-[10px] mt-3 pt-3 leading-relaxed" style={{ borderTop: '1px solid var(--bd2)', color: 'var(--txff)' }}>
                {de
                  ? '* Kettenpreis €30 · Rewax alle 400 km · Ölwechsel alle 300 km · 12.000 km'
                  : '* Chain price €30 · re-wax every 400 km · oil change every 300 km · 12,000 km'}
              </p>
            </div>
          </div>

          {/* ── Formula selector note (replaces filter chips) ── */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-4 px-4 rounded-xl"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
          >
            <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
              <span className="font-semibold" style={{ color: 'var(--tx2)' }}>
                {de ? 'Welche Formel?' : 'Which formula?'}
              </span>
              {' · '}
              <span>Classic (PTFE) — {de ? 'Frühjahr–Herbst' : 'spring–autumn'}</span>
              {'  ·  '}
              <span>Pro (MoS₂) — {de ? 'Ganzjahr, Winter & E-Bike' : 'year-round, winter & e-bike'}</span>
            </p>
            <Link
              to="/#produkte"
              className="text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
              style={{ color: '#264E8C' }}
            >
              {de ? 'Zu den Produkten →' : 'See products →'}
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </section>
  );
}
