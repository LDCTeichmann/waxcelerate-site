import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

// ─── CSS keyframes ────────────────────────────────────────────────────────────
const ANIM_STYLES = `
/* D1 — droplet falls through inter-grain gap */
@keyframes wx-drip-fall {
  0%,12%  { transform:translateY(0);    opacity:0; }
  18%     { transform:translateY(0);    opacity:0.6; }
  50%     { transform:translateY(36px); opacity:0.6; }
  58%     { transform:translateY(36px); opacity:0; }
  59%,100%{ transform:translateY(0);    opacity:0; }
}
/* D1 — oxidation mark fades in after droplet hits, resets near loop end */
@keyframes wx-oxide {
  0%,54%  { transform:scale(0);    opacity:0; }
  66%     { transform:scale(1.15); opacity:1; }
  76%     { transform:scale(1);    opacity:0.85; }
  90%     { transform:scale(1);    opacity:0.85; }
  98%     { transform:scale(0.7);  opacity:0; }
  99%,100%{ transform:scale(0);    opacity:0; }
}
/* D1 — droplet deflects off dense surface */
@keyframes wx-deflect {
  0%,24%  { transform:translate(0,0);         opacity:0; }
  30%     { transform:translate(0,0);         opacity:0.6; }
  52%     { transform:translate(-5px,13px);   opacity:0.6; }
  60%     { transform:translate(-9px,16px);   opacity:0; }
  61%,100%{ transform:translate(0,0);         opacity:0; }
}

/* D2 — crack draws in */
@keyframes wx-crack {
  0%,20%  { stroke-dashoffset:22; opacity:0; }
  36%     { stroke-dashoffset:0;  opacity:0.8; }
  76%     { stroke-dashoffset:0;  opacity:0.8; }
  88%     { stroke-dashoffset:22; opacity:0; }
  100%    { stroke-dashoffset:22; opacity:0; }
}
/* D2 — wax chip detaches and drifts away */
@keyframes wx-chip {
  0%,34%  { transform:translate(0,0) rotate(0deg);          opacity:0; }
  40%     { transform:translate(0,0) rotate(0deg);          opacity:0.65; }
  70%     { transform:translate(14px,-11px) rotate(30deg);  opacity:0.4; }
  78%     { transform:translate(18px,-14px) rotate(40deg);  opacity:0; }
  79%,100%{ transform:translate(0,0) rotate(0deg);          opacity:0; }
}
/* D2 — right coating: elastic deformation, no cracking */
@keyframes wx-elastic {
  0%,100%{ transform:scaleX(1)     scaleY(1);    }
  32%    { transform:scaleX(1.025) scaleY(0.972); }
  64%    { transform:scaleX(0.975) scaleY(1.028); }
}

/* D3 — wax layer thins (scaleY, origin anchored to bottom of layer) */
@keyframes wx-thin {
  0%,10%  { transform:scaleY(1);    }
  55%     { transform:scaleY(0.26); }
  70%     { transform:scaleY(0.26); }
  90%,100%{ transform:scaleY(1);    }
}
/* D3 — wax micro-drip falls */
@keyframes wx-drop {
  0%,22%  { transform:translateY(0);    opacity:0; }
  29%     { transform:translateY(0);    opacity:0.42; }
  62%     { transform:translateY(22px); opacity:0.42; }
  71%     { transform:translateY(24px); opacity:0; }
  72%,100%{ transform:translateY(0);    opacity:0; }
}
/* D3 — contamination speck appears where wax left */
@keyframes wx-dirt {
  0%,60%  { transform:scale(0);   opacity:0; }
  73%     { transform:scale(1.1); opacity:0.4; }
  84%,100%{ transform:scale(1);   opacity:0.3; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 1 — Crystal grain size: why microcrystalline covers metal better
//
// LEFT:  4 coarse polygon grains with clear 8 px gaps → droplet falls through,
//        faint oxidation mark appears on metal surface.
// RIGHT: continuous coverage band (many fine crystals → no visible gaps) →
//        droplet deflects off the surface without penetrating.
// ─────────────────────────────────────────────────────────────────────────────
function CrystalDiagram() {
  // Teardrop path: tip at bottom, centered at (cx, cy), ~10 px wide, 13 px tall
  const drop = (cx: number, cy: number) =>
    `M${cx},${cy + 7} C${cx - 5},${cy + 3} ${cx - 5},${cy - 4} ${cx},${cy - 5} C${cx + 5},${cy - 4} ${cx + 5},${cy + 3} ${cx},${cy + 7} Z`;

  return (
    <svg viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd2)" strokeWidth="0.75" />

      {/* metal surfaces */}
      <rect x="0"   y="128" width="138" height="24" fill="var(--bd2)" />
      <rect x="0"   y="128" width="138" height="1.5" fill="var(--bd)" />
      <rect x="142" y="128" width="138" height="24" fill="var(--bd2)" />
      <rect x="142" y="128" width="138" height="1.5" fill="var(--bd)" />

      {/* LEFT — 4 coarse crystal grains (irregular polygons, 8 px gaps at ~x=36, 68, 100) */}
      <polygon points="2,128 4,114 8,102 16,91 26,90 30,100 32,114 32,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      <polygon points="40,128 40,114 42,104 50,95 58,93 62,102 64,114 64,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      <polygon points="72,128 72,115 74,104 82,93 90,92 96,102 98,113 98,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      <polygon points="104,128 104,115 107,104 116,93 124,92 130,102 134,113 134,128"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />

      {/* label */}
      <text x="69" y="14" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.05em">Paraffin</text>

      {/* droplet — falls through gap at x=36 */}
      <g style={{ animation: 'wx-drip-fall 4.5s ease-in-out infinite',
                  transformOrigin: '36px 74px' }}>
        <path d={drop(36, 72)} fill="none" stroke="var(--txm)" strokeWidth="1.1" />
      </g>

      {/* oxidation mark — faint warm stain where droplet lands */}
      <g style={{ animation: 'wx-oxide 4.5s ease-in-out infinite',
                  transformOrigin: '36px 130px' }}>
        <ellipse cx="36" cy="130" rx="11" ry="4.5" fill="rgba(200,150,80,0.38)" />
        <ellipse cx="36" cy="130" rx="5"  ry="2"   fill="rgba(200,150,80,0.28)" />
      </g>

      {/* RIGHT — continuous microcrystalline coverage: single tight band, no gaps */}
      <rect x="144" y="108" width="134" height="20" rx="1.5"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.6" />
      {/* subtle internal grain-boundary suggestions */}
      {[167, 189, 211, 233, 253].map((x, i) => (
        <line key={i} x1={x} y1="108" x2={x + (i % 2 === 0 ? -1 : 1)} y2="128"
          stroke="var(--bd2)" strokeWidth="0.6" />
      ))}

      {/* label */}
      <text x="211" y="14" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.05em">Mikrokristallin</text>

      {/* droplet — deflects off dense surface */}
      <g style={{ animation: 'wx-deflect 4.5s ease-in-out infinite',
                  animationDelay: '1.6s', transformOrigin: '211px 93px' }}>
        <path d={drop(211, 91)} fill="none" stroke="var(--txm)" strokeWidth="1.1" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 2 — Wax brittleness in cold: why the chain flakes and shifts
//
// Shows a chain bar cross-section with a wax coating layer on top.
// LEFT:  coating develops hairline cracks under flex stress → chip lifts off.
// RIGHT: coating deforms elastically (subtle scaleX/scaleY breathing), no cracks.
// Temperature marker shared at top-center.
// ─────────────────────────────────────────────────────────────────────────────
function ColdDiagram() {
  return (
    <svg viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd2)" strokeWidth="0.75" />

      {/* snowflake — 6 radial lines, centered at top */}
      <g transform="translate(140,19)" opacity="0.5">
        <line x1="0" y1="-8"  x2="0"  y2="8"   stroke="var(--txm)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="-7" y1="-4" x2="7"  y2="4"   stroke="var(--txm)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="7"  y1="-4" x2="-7" y2="4"   stroke="var(--txm)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="-2.5" y1="-6" x2="2.5" y2="-6" stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="-2.5" y1="6"  x2="2.5" y2="6"  stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="5.2"  y1="-1.5" x2="5.2" y2="1.5" stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="-5.2" y1="-1.5" x2="-5.2" y2="1.5" stroke="var(--txm)" strokeWidth="0.9" strokeLinecap="round" />
      </g>
      <text x="140" y="44" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif">−8 °C</text>

      {/* LEFT — chain cross-section bar */}
      <rect x="16" y="76" width="106" height="30" rx="3"
        fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />

      {/* LEFT — wax coating layer (brittle, will crack) */}
      <rect x="12" y="64" width="114" height="14" rx="2"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.9" />

      {/* LEFT — three hairline crack lines draw in */}
      <line x1="28" y1="65"  x2="36" y2="78"
        stroke="var(--tx1)" strokeWidth="1.1" strokeLinecap="round"
        strokeDasharray="16" strokeDashoffset="16"
        style={{ animation: 'wx-crack 4.5s ease-in-out infinite', animationDelay: '0s' }}
        opacity="0" />
      <line x1="60" y1="64"  x2="66" y2="76"
        stroke="var(--tx1)" strokeWidth="0.9" strokeLinecap="round"
        strokeDasharray="14" strokeDashoffset="14"
        style={{ animation: 'wx-crack 4.5s ease-in-out infinite', animationDelay: '0.22s' }}
        opacity="0" />
      <line x1="94" y1="65"  x2="100" y2="76"
        stroke="var(--tx1)" strokeWidth="0.9" strokeLinecap="round"
        strokeDasharray="14" strokeDashoffset="14"
        style={{ animation: 'wx-crack 4.5s ease-in-out infinite', animationDelay: '0.42s' }}
        opacity="0" />

      {/* LEFT — wax chip that lifts off from first crack */}
      <g style={{ animation: 'wx-chip 4.5s ease-in-out infinite' }} opacity="0">
        <rect x="24" y="64" width="10" height="8" rx="1.5"
          fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.8" />
      </g>

      {/* LEFT label */}
      <text x="69" y="138" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.04em">Standard-Wachs</text>

      {/* RIGHT — chain cross-section bar */}
      <rect x="158" y="76" width="106" height="30" rx="3"
        fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />

      {/* RIGHT — elastic wax coating (no cracks, gentle breathing) */}
      <g style={{ animation: 'wx-elastic 4.5s ease-in-out infinite',
                  transformOrigin: '211px 71px' }}>
        <rect x="154" y="64" width="114" height="14" rx="2"
          fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.9" />
      </g>

      {/* RIGHT label */}
      <text x="211" y="138" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.04em">MoS₂-Matrix</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 3 — Wax migration under heat: why soft wax thins and exposes chain
//
// Chain bar cross-section with wax coating above it.
// LEFT:  coating thins (scaleY, origin at bottom) → micro-drips form → faint
//        contamination specks appear on exposed metal surface.
// RIGHT: coating stays at full thickness — no drips, no dirt.
// ─────────────────────────────────────────────────────────────────────────────
function HeatDiagram() {
  const dripPositions = [
    { cx: 32,  delay: '0s'    },
    { cx: 69,  delay: '0.85s' },
    { cx: 106, delay: '1.6s'  },
  ] as const;

  return (
    <svg viewBox="0 0 280 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}>

      {/* panels */}
      <rect x="0"   y="0" width="138" height="152" fill="var(--sf2)" />
      <rect x="142" y="0" width="138" height="152" fill="var(--sf2)" />
      <line x1="140" y1="0" x2="140" y2="152" stroke="var(--bd2)" strokeWidth="0.75" />

      {/* temperature label */}
      <text x="140" y="14" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif">+75 °C</text>

      {/* LEFT — chain bar */}
      <rect x="8"   y="88" width="122" height="26" rx="3"
        fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />

      {/* LEFT — wax coating (thinning, anchored at bottom = y 88) */}
      <g style={{ animation: 'wx-thin 4.5s ease-in-out infinite',
                  transformOrigin: '69px 88px' }}>
        <rect x="8" y="72" width="122" height="16" rx="2"
          fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.9" />
      </g>

      {/* LEFT — micro-drips */}
      {dripPositions.map(({ cx, delay }) => (
        <g key={cx} style={{ animation: `wx-drop 4.5s ease-in-out infinite`,
            animationDelay: delay, transformOrigin: `${cx}px 89px` }}>
          <ellipse cx={cx} cy="89" rx="2.2" ry="2.8" fill="var(--txm)" opacity="0.5" />
          <polygon points={`${cx - 2.2},91 ${cx + 2.2},91 ${cx},97`}
            fill="var(--txm)" opacity="0.5" />
        </g>
      ))}

      {/* LEFT — contamination specks appear after drip */}
      {dripPositions.map(({ cx, delay }) => (
        <g key={cx} style={{ animation: `wx-dirt 4.5s ease-in-out infinite`,
            animationDelay: delay, transformOrigin: `${cx}px 97px` }}>
          <circle cx={cx} cy="97" r="2.4" fill="var(--txm)" opacity="0.4" />
        </g>
      ))}

      {/* LEFT label */}
      <text x="69" y="138" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.04em">Paraffin</text>

      {/* RIGHT — chain bar */}
      <rect x="150" y="88" width="122" height="26" rx="3"
        fill="var(--bd2)" stroke="var(--bd)" strokeWidth="1" />

      {/* RIGHT — stable wax coating (no animation, no drips) */}
      <rect x="150" y="72" width="122" height="16" rx="2"
        fill="var(--sf3)" stroke="var(--bd)" strokeWidth="0.9" />

      {/* RIGHT label */}
      <text x="211" y="138" textAnchor="middle" fontSize="7.5" fill="var(--txf)"
        fontFamily="system-ui,sans-serif" letterSpacing="0.04em">Fischer-Tropsch</text>
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
