import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { gsap } from '@/lib/gsap';

// ─── Static data ──────────────────────────────────────────────────────────────

const S_X  = [10, 50, 90, 130, 170, 210, 250, 290, 330, 370];
const MO_X = [30, 70, 110, 150, 190, 230, 270, 310, 350];

const TF_PARTICLES = [
  { x: 28,  y: 75,  r: 4.5, top: true  },
  { x: 68,  y: 112, r: 3.5, top: false },
  { x: 110, y: 52,  r: 4,   top: true  },
  { x: 155, y: 130, r: 5,   top: false },
  { x: 198, y: 88,  r: 3.5, top: true  },
  { x: 240, y: 62,  r: 4.5, top: false },
  { x: 285, y: 140, r: 4,   top: true  },
  { x: 328, y: 95,  r: 3,   top: false },
  { x: 370, y: 118, r: 5,   top: true  },
  { x: 412, y: 70,  r: 4,   top: false },
  { x: 50,  y: 138, r: 3.5, top: false },
  { x: 90,  y: 65,  r: 4.5, top: true  },
  { x: 132, y: 102, r: 3,   top: false },
  { x: 176, y: 48,  r: 5,   top: true  },
  { x: 218, y: 148, r: 4,   top: false },
  { x: 262, y: 82,  r: 3.5, top: true  },
  { x: 306, y: 42,  r: 4.5, top: false },
  { x: 348, y: 130, r: 3,   top: true  },
  { x: 390, y: 58,  r: 4,   top: false },
  { x: 430, y: 108, r: 3.5, top: true  },
] as const;

const DOT_GRID: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(26,60,110,0.11) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

const CARD: React.CSSProperties = {
  background: 'var(--sf2)',
  border: '1px solid var(--bd)',
};

// For components inside forced-dark sections — always dark regardless of theme
const DARK_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
};

const DARK_DOT_GRID: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(100,140,220,0.12) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

// Always-dark card for SVG visualizations
const VIZ_CARD: React.CSSProperties = {
  background: '#0D1117',
  border: '1px solid rgba(68,114,212,0.20)',
};
const VIZ_CARD_LIGHT: React.CSSProperties = {
  background: '#f0f4fb',
  border: '1px solid rgba(68,114,212,0.22)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.07)',
};

const LIGHT_DOT_GRID: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(68,114,212,0.10) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

// Shared container width
const W = 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8';

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        // eslint-disable-next-line max-len
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat',
        backgroundSize: '300px 300px',
        opacity: 0.032,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

// ─── Chapter navigation sidebar ───────────────────────────────────────────────
function ChapterNav({ de, onActiveChange }: { de: boolean; onActiveChange?: (i: number) => void }) {
  const [active, setActive] = useState(-1);
  const LABELS = [
    { de: 'Die Basis',    en: 'Foundation'  },
    { de: 'Härtemodul',  en: 'Hardener'    },
    { de: 'Kälteflex.',  en: 'Cold Flex.'  },
    { de: 'MoS₂',        en: 'MoS₂'        },
    { de: 'Dispergier.', en: 'Dispersant'  },
    { de: 'Antioxidans', en: 'Antioxidant' },
  ];
  useEffect(() => {
    const els = document.querySelectorAll('[data-chapter]');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = parseInt(e.target.getAttribute('data-chapter') ?? '1', 10) - 1;
          setActive(idx);
          onActiveChange?.(idx);
        }
      }),
      { threshold: 0.25, rootMargin: '-5% 0px -58% 0px' },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [onActiveChange]);
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-4" aria-label="Chapter navigation">
      <div className="absolute right-[4px] top-0 bottom-0 w-px" style={{ background: 'var(--bd)' }} />
      {LABELS.map((l, i) => {
        const isActive = active === i;
        const num = String(i + 1).padStart(2, '0');
        return (
          <button
            key={i}
            onClick={() => document.querySelector(`[data-chapter="${num}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="relative flex items-center gap-2.5 group"
            title={de ? l.de : l.en}
          >
            <span className="text-[9px] uppercase tracking-widest whitespace-nowrap text-right transition-all duration-200 opacity-0 group-hover:opacity-100"
              style={{ color: isActive ? '#4472D4' : 'var(--txff)' }}>
              {de ? l.de : l.en}
            </span>
            <div className="relative z-10 rounded-full flex-shrink-0 transition-all duration-300"
              style={{ width: isActive ? '9px' : '5px', height: isActive ? '9px' : '5px', background: isActive ? '#4472D4' : 'var(--bd)', boxShadow: isActive ? '0 0 10px rgba(68,114,212,0.75)' : 'none' }} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Scroll progress ──────────────────────────────────────────────────────────
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      setP(scrollTop / Math.max(scrollHeight - clientHeight, 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]" style={{ background: 'var(--bd)' }}>
      <div className="h-full" style={{ width: `${p * 100}%`, background: 'linear-gradient(90deg,#1A3080,#6A8AE8)', transition: 'width 0.06s linear' }} />
    </div>
  );
}

// ─── Failure Timeline ─────────────────────────────────────────────────────────
// Only verified facts from existing chapter text — no invented history.
const FAILURES: { vDe: string; vEn: string; failDe: string; failEn: string; fixDe: string; fixEn: string; isCurrent?: true }[] = [
  {
    vDe: 'Frühe Formel',     vEn: 'Early formula',
    failDe: 'Wachsschicht platzte bei < 5°C ab — Biegebelastung brach die spröde Matrix.',
    failEn: 'Wax coating spalled below 5°C — flexing cracked the brittle matrix.',
    fixDe: '→ Mikrokristallines Wachs als Plastifikator (Ch. 03)',
    fixEn: '→ Microcrystalline wax as plasticizer (Ch. 03)',
  },
  {
    vDe: 'Iteration 2',      vEn: 'Iteration 2',
    failDe: 'Höhere FT-Wachs-Konzentration getestet — keine messbare Verbesserung beim Tropfpunkt.',
    failEn: 'Higher FT-wax concentration tested — no measurable drop point improvement.',
    fixDe: '→ Optimum liegt niedriger als intuitiv erwartet (Ch. 02)',
    fixEn: '→ Optimum is lower than intuitively expected (Ch. 02)',
  },
  {
    vDe: 'Iteration 3',      vEn: 'Iteration 3',
    failDe: 'MoS₂ ohne Dispergiermittel: messbarer Konzentrationsgradient von oben nach unten im Block.',
    failEn: 'MoS₂ without dispersant: measurable concentration gradient top-to-bottom in the block.',
    fixDe: '→ Amphiphiler Fettsäureester stabilisiert Partikel (Ch. 05)',
    fixEn: '→ Amphiphilic fatty acid ester stabilizes particles (Ch. 05)',
  },
  {
    vDe: 'Aktuelle Formel',  vEn: 'Current formula',
    failDe: 'Separater Korrosionsinhibitor entfernt — seine antioxidative Nebenwirkung kompensiert.',
    failEn: 'Separate corrosion inhibitor removed — its secondary antioxidant effect compensated.',
    fixDe: '→ Phenol-Antioxidans-Konzentration leicht erhöht (Ch. 06)',
    fixEn: '→ Phenolic antioxidant concentration raised slightly (Ch. 06)',
    isCurrent: true,
  },
];

function FailureTimeline({ de, isDark }: { de: boolean; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = ref.current?.querySelectorAll('.ft-item');
      if (items?.length) {
        gsap.fromTo(items,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.14, ease: 'power2.out',
            scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } },
        );
      }
      if (connectorRef.current) {
        gsap.fromTo(connectorRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'power2.out', transformOrigin: 'left center',
            scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } },
        );
      }
      const lastDot = ref.current?.querySelector('.ft-item:last-child .ft-dot');
      if (lastDot) {
        gsap.fromTo(lastDot,
          { scale: 1 },
          { scale: 1.4, duration: 0.22, ease: 'back.out(3)',
            scrollTrigger: { trigger: ref.current, start: 'top 78%', once: true },
            yoyo: true, repeat: 1 },
        );
      }
      const vLines = ref.current?.querySelectorAll('.ft-vline');
      if (vLines?.length) {
        gsap.fromTo(vLines,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.5, stagger: 0.14, ease: 'power2.out', transformOrigin: 'top center',
            scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } },
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  const cardBg   = isDark ? 'rgba(255,255,255,0.03)' : 'var(--sf3)';
  const cardBd   = isDark ? 'rgba(255,255,255,0.08)' : 'var(--bd2)';
  const failClr  = isDark ? 'rgba(255,255,255,0.50)' : 'var(--txm)';
  const fixClr   = isDark ? 'rgba(100,140,220,0.80)' : '#2A5499';
  const dotFail  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(26,60,110,0.25)';
  const lineClr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,60,110,0.12)';

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-center gap-3 mb-6 pl-4 relative">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
          style={{ background: 'linear-gradient(to bottom, #2A5499, rgba(68,114,212,0.2))' }} />
        <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--txff)' }}>
          {de ? 'Entwicklungsiterationen — nur dokumentierte Fakten' : 'Development iterations — documented facts only'}
        </p>
      </div>
      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:flex items-start gap-0 relative">
        {/* connector line */}
        <div ref={connectorRef} className="absolute top-[18px] left-0 right-0 h-px" style={{ background: lineClr, transform: 'scaleX(0)', transformOrigin: 'left center' }} />
        {FAILURES.map((f, i) => (
          <div key={i} className="ft-item flex-1 flex flex-col items-center px-2 opacity-0" style={{ minWidth: 0 }}>
            {/* Dot */}
            <div
              className="ft-dot w-[18px] h-[18px] rounded-full flex-shrink-0 z-10 flex items-center justify-center mb-3"
              style={{
                background: f.isCurrent ? '#2A5499' : dotFail,
                border: `2px solid ${f.isCurrent ? '#4472D4' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(26,60,110,0.20)')}`,
                boxShadow: f.isCurrent ? '0 0 10px rgba(68,114,212,0.5)' : 'none',
              }}
            />
            {/* Card */}
            <div className="w-full rounded-xl p-3" style={{
              background: f.isCurrent ? (isDark ? 'rgba(26,60,110,0.20)' : 'rgba(26,60,110,0.07)') : cardBg,
              border: `1px solid ${f.isCurrent ? 'rgba(68,114,212,0.30)' : cardBd}`,
              boxShadow: f.isCurrent ? '0 0 0 2px rgba(68,114,212,0.35), 0 4px 20px rgba(26,60,110,0.15)' : 'none',
            }}>
              <p className="text-[9px] font-mono font-bold uppercase tracking-wide mb-1.5" style={{ color: f.isCurrent ? '#4472D4' : (isDark ? 'rgba(255,255,255,0.35)' : 'var(--txff)') }}>
                {de ? f.vDe : f.vEn}
              </p>
              <p className="text-[10px] leading-snug mb-2" style={{ color: failClr }}>
                {de ? f.failDe : f.failEn}
              </p>
              <p className="text-[10px] font-medium leading-snug" style={{ color: fixClr }}>
                {de ? f.fixDe : f.fixEn}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {FAILURES.map((f, i) => (
          <div key={i} className="ft-item flex gap-3 opacity-0">
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div className="ft-dot w-3 h-3 rounded-full" style={{ background: f.isCurrent ? '#2A5499' : dotFail, border: `1.5px solid ${f.isCurrent ? '#4472D4' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(26,60,110,0.20)')}` }} />
              {i < FAILURES.length - 1 && <div className="ft-vline w-px flex-1 mt-1" style={{ background: lineClr, minHeight: '20px' }} />}
            </div>
            <div className="pb-2">
              <p className="text-[9px] font-mono font-bold uppercase tracking-wide mb-1" style={{ color: f.isCurrent ? '#4472D4' : (isDark ? 'rgba(255,255,255,0.35)' : 'var(--txff)') }}>
                {de ? f.vDe : f.vEn}
              </p>
              <p className="text-[11px] leading-snug mb-1" style={{ color: failClr }}>{de ? f.failDe : f.failEn}</p>
              <p className="text-[11px] font-medium" style={{ color: fixClr }}>{de ? f.fixDe : f.fixEn}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hexagonal MoS₂ crystal (proper SVG) ─────────────────────────────────────
function HexMoS2({ de }: { de: boolean }) {
  const topRef  = useRef<SVGGElement>(null);
  const botRef  = useRef<SVGGElement>(null);
  const [hov, setHov] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  useEffect(() => {
    if (!topRef.current || !botRef.current) return;
    gsap.to(topRef.current, { x: hov ?  18 : 0, duration: 0.65, ease: 'power2.inOut' });
    gsap.to(botRef.current, { x: hov ? -18 : 0, duration: 0.65, ease: 'power2.inOut' });
  }, [hov]);

  const TOP_S1 = 18, TOP_MO = 44, TOP_S2 = 70;
  const BOT_S1 = 95, BOT_MO = 121, BOT_S2 = 147;
  const GAP_Y  = 82;

  const bonds = (moY: number, sUp: number, sDn: number) =>
    MO_X.flatMap(mx => [
      { x1: mx, y1: moY, x2: mx - 20, y2: sUp },
      { x1: mx, y1: moY, x2: mx + 20, y2: sUp },
      { x1: mx, y1: moY, x2: mx - 20, y2: sDn },
      { x1: mx, y1: moY, x2: mx + 20, y2: sDn },
    ]);

  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'noir';
  const vizCard = isDark ? VIZ_CARD : VIZ_CARD_LIGHT;
  const dotGrid = isDark ? DARK_DOT_GRID : LIGHT_DOT_GRID;

  const txMid  = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(26,60,110,0.60)';
  const txLow  = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(26,60,110,0.40)';
  const txMono = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(26,60,110,0.65)';
  const sLabel = isDark ? 'rgba(168,192,244,0.55)'  : 'rgba(68,114,212,0.70)';
  const moLabel= isDark ? 'rgba(130,170,240,0.80)'  : 'rgba(26,60,110,0.90)';
  const vdwClr = isDark ? 'rgba(100,140,220,0.28)'  : 'rgba(68,114,212,0.45)';
  const vdwTxt = isDark ? 'rgba(168,192,244,0.45)'  : 'rgba(68,114,212,0.60)';
  const hovClr = isDark ? 'rgba(100,140,220,0.60)'  : 'rgba(26,60,110,0.65)';
  const divClr = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(26,60,110,0.12)';
  const txSub  = isDark ? 'rgba(255,255,255,0.35)'  : 'rgba(26,60,110,0.55)';

  return (
    <div className="w-full rounded-2xl overflow-hidden p-5 cursor-default select-none"
      style={{ ...vizCard, ...dotGrid, transition: 'box-shadow 0.35s ease', boxShadow: hov ? '0 0 0 1px rgba(68,114,212,0.4), 0 8px 32px rgba(26,60,110,0.3)' : 'none', cursor: isTouch ? 'pointer' : undefined }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => {
        if (!isTouch) return;
        const next = !hov;
        setHov(next);
        if (next) {
          setTimeout(() => setHov(false), 2200);
        }
      }}>
      <style>{`@keyframes pulse-gap { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: txMid }}>
        {de ? 'MoS₂ — S–Mo–S Schichtstruktur' : 'MoS₂ — S–Mo–S layer structure'}
      </p>
      <svg viewBox="0 0 395 155" className="w-full" style={{ overflow: 'visible' }}>
        <g ref={topRef}>
          {bonds(TOP_MO, TOP_S1, TOP_S2).map((b, i) => (
            <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={isDark ? 'rgba(42,84,153,0.22)' : 'rgba(42,84,153,0.35)'} strokeWidth="1.2" />
          ))}
          {S_X.map((x, i) => <circle key={`ts1${i}`} cx={x} cy={TOP_S1} r="5" fill="#A8C0F4" opacity="0.92" />)}
          {MO_X.map((x, i) => <circle key={`tmo${i}`} cx={x} cy={TOP_MO} r="7.5" fill="#2A5499" style={{ filter: 'drop-shadow(0 0 5px rgba(68,114,212,0.60))' }} />)}
          {S_X.map((x, i) => <circle key={`ts2${i}`} cx={x} cy={TOP_S2} r="5" fill="#A8C0F4" opacity="0.92" />)}
        </g>
        {/* Van der Waals gap */}
        <g>
          <line x1="8" y1={GAP_Y} x2="310" y2={GAP_Y} stroke={vdwClr} strokeWidth="1" strokeDasharray="5 4" />
          {isTouch && !hov && (
            <rect
              x="8" y={GAP_Y - 4} width="302" height="8" rx="2"
              fill={isDark ? 'rgba(68,114,212,0.12)' : 'rgba(68,114,212,0.08)'}
              style={{ animation: 'pulse-gap 2s ease-in-out infinite' }}
            />
          )}
          <text x="316" y={GAP_Y + 4} fontSize="8.5" fill={vdwTxt} fontFamily="monospace">vdW</text>
        </g>
        <g ref={botRef}>
          {bonds(BOT_MO, BOT_S1, BOT_S2).map((b, i) => (
            <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={isDark ? 'rgba(42,84,153,0.22)' : 'rgba(42,84,153,0.35)'} strokeWidth="1.2" />
          ))}
          {S_X.map((x, i) => <circle key={`bs1${i}`} cx={x} cy={BOT_S1} r="5" fill="#A8C0F4" opacity="0.92" />)}
          {MO_X.map((x, i) => <circle key={`bmo${i}`} cx={x} cy={BOT_MO} r="7.5" fill="#1A3C6E" style={{ filter: 'drop-shadow(0 0 5px rgba(26,60,110,0.55))' }} />)}
          {S_X.map((x, i) => <circle key={`bs2${i}`} cx={x} cy={BOT_S2} r="5" fill="#A8C0F4" opacity="0.92" />)}
        </g>
        {/* Single-side labels only */}
        <text x="10" y={TOP_S1 + 4}  fontSize="8.5" fill={sLabel}  fontFamily="monospace">S</text>
        <text x="10" y={TOP_MO + 4}  fontSize="8.5" fill={moLabel} fontFamily="monospace">Mo</text>
        <text x="10" y={TOP_S2 + 4}  fontSize="8.5" fill={sLabel}  fontFamily="monospace">S</text>
        <text x="10" y={BOT_S1 + 4}  fontSize="8.5" fill={sLabel}  fontFamily="monospace">S</text>
        <text x="10" y={BOT_MO + 4}  fontSize="8.5" fill={moLabel} fontFamily="monospace">Mo</text>
        <text x="10" y={BOT_S2 + 4}  fontSize="8.5" fill={sLabel}  fontFamily="monospace">S</text>
        {/* Hover arrow cue */}
        {hov && (
          <text x="197" y={GAP_Y - 4} textAnchor="middle" fontSize="8" fill={hovClr} fontFamily="monospace" letterSpacing="1">
            {de ? '← Schicht gleitet →' : '← layer slides →'}
          </text>
        )}
      </svg>
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${divClr}` }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#A8C0F4' }} />
            <span className="text-[9px] font-mono" style={{ color: txMono }}>S</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full" style={{ background: '#2A5499', boxShadow: '0 0 4px rgba(68,114,212,0.5)' }} />
            <span className="text-[9px] font-mono" style={{ color: txMono }}>Mo</span>
          </div>
          <span className="text-[9px]" style={{ color: txLow }}>
            {isTouch
              ? (de ? '· Tippen: Schicht gleitet' : '· Tap: layer shears')
              : (de ? '· Hover: Schicht gleitet' : '· Hover: layer shears')}
          </span>
        </div>
        <div className="text-right">
          <p className="font-serif-display italic text-[20px] font-bold leading-none" style={{ color: '#6A8AE8', textShadow: '0 0 16px rgba(68,114,212,0.55)' }}>μ 0.03</p>
          <p className="text-[9px] mt-0.5" style={{ color: txSub }}>{de ? 'Grenzschmierung' : 'Boundary lubrication'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Transfer film animation — chain cross-section ────────────────────────────
function TransferFilm({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const replay = () => {
    if (!tlRef.current) return;
    const container = ref.current;
    if (!container) return;
    const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
    const films = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
    const label = container.querySelector<SVGTextElement>('.tf-label');
    particles.forEach((el, i) => {
      const p = TF_PARTICLES[i];
      gsap.set(el, { attr: { cy: p.y } });
    });
    gsap.set(films, { opacity: 0 });
    if (label) gsap.set(label, { opacity: 0 });
    tlRef.current.restart();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = ref.current;
      if (!container) return;

      const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
      const films     = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
      const label     = container.querySelector<SVGTextElement>('.tf-label');

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 88%', once: true },
        onComplete: () => setHasPlayed(true),
      });
      tlRef.current = tl;

      particles.forEach((el, i) => {
        const p = TF_PARTICLES[i];
        tl.to(el, {
          attr: { cy: p.top ? 30 + p.r : 153 - p.r },
          duration: 1.4,
          ease: 'power3.inOut',
        }, i * 0.048);
      });

      tl.to(films, { opacity: 0.88, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, 0.7);
      if (label) tl.to(label, { opacity: 1, duration: 0.5 }, 1.5);

    }, ref);
    return () => ctx.revert();
  }, []);

  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'noir';
  const vizCard = isDark ? VIZ_CARD : VIZ_CARD_LIGHT;
  const dotGrid = isDark ? DARK_DOT_GRID : LIGHT_DOT_GRID;

  const txMid   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(26,60,110,0.60)';
  const txVal   = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,30,70,0.85)';
  const txSub   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(26,60,110,0.55)';
  const divClr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,60,110,0.12)';
  const sLabelC = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(26,60,110,0.50)';
  const steelT0 = isDark ? '#2a2a38' : '#c4cedf';
  const steelT1 = isDark ? '#1c1c28' : '#b0bcce';
  const steelB0 = isDark ? '#1c1c28' : '#b0bcce';
  const steelB1 = isDark ? '#2a2a38' : '#c4cedf';

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden p-5"
      style={{ ...vizCard, ...dotGrid, position: 'relative', transition: 'box-shadow 0.35s ease', boxShadow: hov ? '0 0 0 1px rgba(68,114,212,0.4), 0 8px 32px rgba(26,60,110,0.30)' : 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: txMid }}>
        {de ? 'Transferfilm unter Kontaktdruck' : 'Transfer film under contact pressure'}
      </p>
      <svg viewBox="0 0 440 175" className="w-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="steel-grad-t" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={steelT0} />
            <stop offset="100%" stopColor={steelT1} />
          </linearGradient>
          <linearGradient id="steel-grad-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={steelB0} />
            <stop offset="100%" stopColor={steelB1} />
          </linearGradient>
        </defs>
        {/* Steel plates — no text inside them */}
        <rect x="0" y="0"   width="440" height="22" fill="url(#steel-grad-t)" rx="2" />
        <rect x="0" y="153" width="440" height="22" fill="url(#steel-grad-b)" rx="2" />
        {/* Side labels for the plates */}
        <text x="6" y="15"  fontSize="8" fill={sLabelC} fontFamily="monospace">{de ? 'Stahl' : 'Steel'}</text>
        <text x="6" y="167" fontSize="8" fill={sLabelC} fontFamily="monospace">{de ? 'Stahl' : 'Steel'}</text>
        {/* Transfer film deposits */}
        <rect className="tf-film" x="0" y="22"  width="440" height="5" fill="#1A3C6E" opacity="0" rx="1" />
        <rect className="tf-film" x="0" y="148" width="440" height="5" fill="#1A3C6E" opacity="0" rx="1" />
        {/* MoS₂ particles */}
        {TF_PARTICLES.map((p, i) => (
          <circle key={i} className="tf-p" cx={p.x} cy={p.y} r={p.r} fill="#2A5499" opacity="0.85" />
        ))}
        {/* Film label — appears after animation */}
        <text className="tf-label" x="220" y="38" textAnchor="middle" fontSize="8.5" fill="rgba(106,138,232,0.9)" fontFamily="monospace" letterSpacing="1" opacity="0">
          {de ? 'Fe-S Transferfilm' : 'Fe-S transfer film'}
        </text>
      </svg>
      <div className="mt-3 pt-3 grid grid-cols-3 gap-2 text-center" style={{ borderTop: `1px solid ${divClr}` }}>
        {[
          { val: '50–300 MPa', sub: de ? 'Kontaktdruck' : 'Contact pressure' },
          { val: '2–5 nm',     sub: de ? 'Filmdicke'    : 'Film thickness'   },
          { val: 'Fe–S',       sub: de ? 'tribochem. Bindung' : 'tribochem. bond' },
        ].map((s, i) => (
          <div key={i}>
            <p className="font-mono text-[12px] font-semibold" style={{ color: txVal }}>{s.val}</p>
            <p className="text-[9px] mt-0.5" style={{ color: txSub }}>{s.sub}</p>
          </div>
        ))}
      </div>
      {hasPlayed && (
        <button
          onClick={replay}
          aria-label="Replay animation"
          className="absolute top-3 right-3 p-1.5 rounded-full transition-opacity hover:opacity-70"
          style={{
            background: isDark ? 'rgba(68,114,212,0.18)' : 'rgba(68,114,212,0.10)',
            border: `1px solid ${isDark ? 'rgba(68,114,212,0.30)' : 'rgba(68,114,212,0.20)'}`,
            color: isDark ? 'rgba(168,192,244,0.80)' : '#2a56c4',
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Crystal lattice — split-panel comparison: ordered vs disordered ──────────
// LEFT: Waxcelerate (uniform, narrow 58–60°C) · RIGHT: Generic paraffin (wide, irregular)
function CrystalLattice({ de }: { de: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'noir';
  const vizCard = isDark ? VIZ_CARD : VIZ_CARD_LIGHT;
  const dotGrid = isDark ? DARK_DOT_GRID : LIGHT_DOT_GRID;

  const txMid  = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(26,60,110,0.60)';
  const divClr = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(26,60,110,0.12)';
  const vdwClr = isDark ? 'rgba(100,140,220,0.32)' : 'rgba(68,114,212,0.50)';
  const vdwTxt = isDark ? 'rgba(100,140,220,0.45)' : 'rgba(68,114,212,0.65)';
  const bktClr = isDark ? 'rgba(100,140,220,0.45)' : 'rgba(68,114,212,0.65)';
  const bktTxt = isDark ? 'rgba(100,140,220,0.50)' : 'rgba(26,60,110,0.70)';
  const bandA  = isDark ? 'rgba(26,60,110,0.14)'   : 'rgba(68,114,212,0.10)';
  const bandB  = isDark ? 'rgba(26,60,110,0.07)'   : 'rgba(68,114,212,0.05)';

  // LEFT panel — 3 crystal layers, 7 aligned chain rods
  const LAYERS = [
    { yCenter: 36,  color: '#4472D4' },
    { yCenter: 96,  color: '#3D67CA' },
    { yCenter: 156, color: '#4472D4' },
  ];
  const CHAIN_W = 46, CHAIN_H = 9, CHAIN_GAP = 7;
  const CHAINS = 7;
  const totalChainWidth = CHAINS * CHAIN_W + (CHAINS - 1) * CHAIN_GAP;
  const startX = (395 - totalChainWidth) / 2;

  // RIGHT panel — disordered (varied widths/gaps/heights/ycenters)
  const RIGHT_WIDTHS = [38, 52, 42, 58, 36, 50, 44];
  const RIGHT_GAPS   = [5, 9, 6, 11, 4, 8, 0];
  const CHAINS_R = 7;
  const CHAIN_H_R = [8, 10, 7, 11, 8, 9, 10];
  const RIGHT_LAYERS_Y = [34, 98, 152];
  const RIGHT_COLOR = 'rgba(68,114,212,0.38)';
  const totalRightWidth = RIGHT_WIDTHS.reduce((s, w) => s + w, 0) + RIGHT_GAPS.slice(0, CHAINS_R - 1).reduce((s, g) => s + g, 0);
  const startXR = 420 + (400 - totalRightWidth) / 2;

  // Van der Waals gap positions
  const VDW_Y = [66, 126];

  useEffect(() => {
    const rods  = svgRef.current?.querySelectorAll<SVGRectElement>('.chain-rod');
    const rodsR = svgRef.current?.querySelectorAll<SVGRectElement>('.chain-rod-r');
    if (rods?.length) {
      rods.forEach((rod, i) => {
        gsap.to(rod, {
          x: (i % 3 === 0 ? 1.5 : i % 3 === 1 ? -1.5 : 0.8),
          duration: 1.6 + (i % 5) * 0.28,
          repeat: -1, yoyo: true, ease: 'sine.inOut',
          delay: i * 0.09,
        });
      });
    }
    if (rodsR?.length) {
      rodsR.forEach((rod, i) => {
        gsap.to(rod, {
          x: (i % 3 === 0 ? 3.5 : i % 3 === 1 ? -3.5 : 2.0),
          duration: 1.2 + (i % 5) * 0.22,
          repeat: -1, yoyo: true, ease: 'sine.inOut',
          delay: i * 0.07,
        });
      });
    }
    return () => {
      if (rods?.length)  gsap.killTweensOf(Array.from(rods));
      if (rodsR?.length) gsap.killTweensOf(Array.from(rodsR));
    };
  }, []);

  // Build right-panel rod x positions
  const rightRodXs: number[] = [];
  let rx = startXR;
  for (let ci = 0; ci < CHAINS_R; ci++) {
    rightRodXs.push(rx);
    rx += RIGHT_WIDTHS[ci] + (ci < CHAINS_R - 1 ? RIGHT_GAPS[ci] : 0);
  }

  const dividerClr = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(26,60,110,0.12)';

  return (
    <div className="w-full rounded-2xl overflow-hidden p-5" style={{ ...vizCard, ...dotGrid }}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: txMid }}>
        {de ? 'Lamellare Kristallstruktur — C₂₀–C₃₆' : 'Lamellar crystal structure — C₂₀–C₃₆'}
      </p>
      <svg ref={svgRef} viewBox="0 0 820 210" className="w-full" style={{ minHeight: 100 }}>
        {/* ── LEFT panel background bands ── */}
        {LAYERS.map((l, li) => (
          <rect key={li} x="0" y={l.yCenter - 22} width="400" height="44"
            fill={li % 2 === 0 ? bandA : bandB} />
        ))}
        {/* ── LEFT label ── */}
        <text x="197" y="8" fontSize="8" fontFamily="monospace" textAnchor="middle" fill={txMid}>
          58–60°C
        </text>
        {/* ── LEFT VdW gap lines ── */}
        {VDW_Y.map((y, i) => (
          <g key={i}>
            <line x1="12" y1={y} x2="340" y2={y} stroke={vdwClr} strokeWidth="0.8" strokeDasharray="5 4" />
            <text x="348" y={y + 4} fontSize="8.5" fill={vdwTxt} fontFamily="monospace" textAnchor="start">vdW</text>
          </g>
        ))}
        {/* ── LEFT chain rods ── */}
        {LAYERS.map((l, li) =>
          [...Array(CHAINS)].map((_, ci) => {
            const x = startX + ci * (CHAIN_W + CHAIN_GAP);
            return (
              <rect
                key={`L${li}-${ci}`}
                className="chain-rod"
                x={x} y={l.yCenter - CHAIN_H / 2} width={CHAIN_W} height={CHAIN_H}
                rx="4.5"
                fill={l.color}
                opacity={0.70 + (ci % 3) * 0.09}
                style={{ filter: isDark ? 'drop-shadow(0 0 4px rgba(68,114,212,0.55))' : 'drop-shadow(0 2px 6px rgba(68,114,212,0.30))' }}
              />
            );
          })
        )}
        {/* ── LEFT side bracket ── */}
        <line x1="10" y1={LAYERS[1].yCenter - 20} x2="10" y2={LAYERS[1].yCenter + 20}
          stroke={bktClr} strokeWidth="1" />
        <text x="14" y={LAYERS[1].yCenter + 4} fontSize="8.5" fill={bktTxt} fontFamily="monospace">
          {de ? 'Kristallebene' : 'Crystal plane'}
        </text>

        {/* ── CENTER divider ── */}
        <line x1="410" y1="0" x2="410" y2="210" stroke={dividerClr} strokeWidth="0.8" />
        <g transform="translate(410,105) rotate(-90)">
          <text x="0" y="0" textAnchor="middle" dominantBaseline="middle"
            fontSize="7.5" fontFamily="monospace"
            fill={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(26,60,110,0.35)'}>
            vs
          </text>
        </g>

        {/* ── RIGHT panel background bands ── */}
        {RIGHT_LAYERS_Y.map((yc, li) => (
          <rect key={`rb${li}`} x="420" y={yc - 22} width="400" height="44"
            fill={li % 2 === 0 ? bandA : bandB} />
        ))}
        {/* ── RIGHT label ── */}
        <text x="617" y="8" fontSize="8" fontFamily="monospace" textAnchor="middle" fill={txMid}>
          55–65°C
        </text>
        {/* ── RIGHT VdW gap lines ── */}
        {VDW_Y.map((y, i) => (
          <line key={`rvdw${i}`} x1="432" y1={y} x2="770" y2={y} stroke={vdwClr} strokeWidth="0.8" strokeDasharray="5 4" />
        ))}
        {/* ── RIGHT chain rods (disordered) ── */}
        {RIGHT_LAYERS_Y.map((yc, li) =>
          [...Array(CHAINS_R)].map((_, ci) => {
            const h = CHAIN_H_R[ci % CHAIN_H_R.length];
            return (
              <rect
                key={`R${li}-${ci}`}
                className="chain-rod-r"
                x={rightRodXs[ci]} y={yc - h / 2} width={RIGHT_WIDTHS[ci]} height={h}
                rx="4.5"
                fill={RIGHT_COLOR}
                opacity={0.80}
              />
            );
          })
        )}
      </svg>
      <div className="flex items-center justify-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${divClr}` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-2.5 rounded-full" style={{ background: '#4472D4', opacity: 0.75 }} />
          <span className="text-[9px] font-mono" style={{ color: txMid }}>
            {de ? 'Waxcelerate (geordnet)' : 'Waxcelerate (ordered)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-2.5 rounded-full" style={{ background: 'rgba(68,114,212,0.38)' }} />
          <span className="text-[9px] font-mono" style={{ color: txMid }}>
            {de ? 'Generisches Paraffin' : 'Generic paraffin'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Temperature range ────────────────────────────────────────────────────────
function TempRange({ de }: { de: boolean }) {
  const items = [
    { labelDe: 'Unmodifiziertes Paraffin', labelEn: 'Unmodified paraffin', lo: 58, hi: 62, color: 'var(--bd)' },
    { labelDe: 'Waxcelerate Classic',      labelEn: 'Waxcelerate Classic', lo: 60, hi: 76, color: '#1A3C6E' },
    { labelDe: 'Waxcelerate Pro',          labelEn: 'Waxcelerate Pro',     lo: 60, hi: 79, color: '#2A5499' },
  ];
  const min = 55, max = 85;
  const toX = (v: number) => ((v - min) / (max - min)) * 100;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      ref.current?.querySelectorAll('.t-bar').forEach(bar => {
        gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.out', transformOrigin: 'left center', scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div className="w-full rounded-2xl p-5" style={{ ...CARD, ...DOT_GRID }}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--txff)' }}>
        {de ? 'Effektiver Tropfpunkt' : 'Effective drop point'}
      </p>
      <div ref={ref} className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-wx-txm">{de ? item.labelDe : item.labelEn}</span>
              <span className="text-[11px] font-mono font-semibold text-wx-tx1">{item.lo}–{item.hi}°C</span>
            </div>
            <div className="relative h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
              <div className="t-bar absolute top-0 h-full rounded-full" style={{ left: `${toX(item.lo)}%`, width: `${toX(item.hi) - toX(item.lo)}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {[55, 60, 65, 70, 75, 80, 85].map(t => (
          <span key={t} className="text-[9px] font-mono" style={{ color: 'var(--txff)' }}>{t}°</span>
        ))}
      </div>
    </div>
  );
}

// ─── Particle suspension — animated ──────────────────────────────────────────
function ParticleSuspension({ de }: { de: boolean }) {
  const wRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // "Without": top floating dots drift downward (sedimentation) — longer, more dramatic
      const floating = wRef.current?.querySelectorAll<HTMLElement>('.sp-float');
      if (floating?.length) {
        gsap.to(floating, {
          y: 64, opacity: 0.18,
          duration: 4.2, ease: 'power1.in',
          stagger: 0.18,
          scrollTrigger: { trigger: wRef.current, start: 'top 78%', once: true },
        });
      }
      // "With": uniformly distributed dots gently breathe
      const stable = mRef.current?.querySelectorAll<HTMLElement>('.sp-stable');
      if (stable?.length) {
        gsap.to(stable, {
          scale: 0.88, opacity: 0.75,
          duration: 1.7, repeat: -1, yoyo: true,
          ease: 'sine.inOut',
          stagger: { each: 0.11, from: 'random' },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full rounded-2xl p-5" style={{ ...CARD, ...DOT_GRID }}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--txff)' }}>
        {de ? 'Ohne vs. mit Dispergiermittel' : 'Without vs. with dispersant'}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div ref={wRef} className="flex flex-col items-center">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '148px', background: 'var(--bd2)', border: '1px solid var(--bd)' }}>
            {/* Center-of-mass reference line */}
            <div className="absolute inset-x-2" style={{ top: '50%', height: '1px', background: 'rgba(26,60,110,0.08)' }} />
            <div className="absolute inset-x-0 top-2 flex flex-wrap gap-2 px-3 justify-center">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="sp-float w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: '#2A5499', opacity: 0.8 }} />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 px-2 pt-1.5 pb-1 rounded-b" style={{ background: 'rgba(26,60,110,0.30)' }}>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[...Array(18)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ background: '#1A3C6E' }} />)}
              </div>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-wx-tx1 mt-2">{de ? 'Ohne' : 'Without'}</p>
          <p className="text-[10px] text-center mt-0.5" style={{ color: 'var(--txff)' }}>{de ? 'Gradient im Block' : 'Gradient in block'}</p>
        </div>
        <div ref={mRef} className="flex flex-col items-center">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '148px', background: 'var(--bd2)', border: '1px solid var(--bd)' }}>
            {/* Center-of-mass reference line */}
            <div className="absolute inset-x-2" style={{ top: '50%', height: '1px', background: 'rgba(26,60,110,0.08)' }} />
            <div className="absolute inset-0 flex flex-wrap gap-2 p-3 items-center justify-center">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="sp-stable w-3.5 h-3.5 rounded-full" style={{ background: '#2A5499', opacity: 0.9 }} />
              ))}
            </div>
          </div>
          <p className="text-[11px] font-semibold text-wx-tx1 mt-2">{de ? 'Mit' : 'With'}</p>
          <p className="text-[10px] text-center mt-0.5" style={{ color: 'var(--txff)' }}>{de ? 'Gleichmäßig verteilt' : 'Uniformly distributed'}</p>
        </div>
      </div>
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
        <p className="text-[11px] text-center" style={{ color: 'var(--txff)' }}>
          {de ? 'MoS₂ ist 5,6× dichter als Paraffin — ohne Stabilisierung sedimentiert es messbar.' : 'MoS₂ is 5.6× denser than paraffin — without stabilization it sediments measurably.'}
        </p>
      </div>
    </div>
  );
}

// ─── Friction bars ────────────────────────────────────────────────────────────
// Scale: 0 → SCALE_MAX; shorter bar = lower μ = better performance
const FRICTION_SCALE = 0.26;
const FRICTION_BARS = [
  { label: 'Waxcelerate Pro',     tag: 'PRO' as const, muLo: 0.03, muHi: 0.06, best: true  },
  { label: 'Waxcelerate Classic',                       muLo: 0.05, muHi: 0.07, best: true  },
  { labelDe: 'Graphit-Heißwachs', labelEn: 'Graphite hot wax', muLo: 0.08, muHi: 0.12, best: false },
  { labelDe: 'Kettenöl (nass)',   labelEn: 'Chain oil (wet)',   muLo: 0.10, muHi: 0.16, best: false, dim: true },
];

function FrictionBars({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'noir';

  useEffect(() => {
    const ctx = gsap.context(() => {
      ref.current?.querySelectorAll('.fb').forEach(bar => {
        const w = parseFloat((bar as HTMLElement).dataset.w!);
        gsap.fromTo(bar, { scaleX: 0 }, { scaleX: w / 100, duration: 1, ease: 'power3.out', transformOrigin: 'left center', scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const cardSt = isDark ? { ...DARK_CARD, ...DARK_DOT_GRID } : { ...CARD, ...DOT_GRID };
  const hdrClr = isDark ? 'rgba(255,255,255,0.38)' : 'var(--txff)';
  const subClr = isDark ? 'rgba(255,255,255,0.18)' : 'var(--txff)';
  const trackClr = isDark ? 'rgba(255,255,255,0.11)' : 'var(--bd2)';
  const tickClr = isDark ? 'rgba(255,255,255,0.20)' : 'var(--txff)';
  const tickBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--bd2)';

  return (
    <div className="w-full rounded-2xl p-5" style={cardSt}>
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: hdrClr }}>
          {de ? 'Reibungskoeffizient μ' : 'Friction coefficient μ'}
        </p>
        <span className="text-[9px]" style={{ color: subClr }}>
          {de ? '← kürzer = weniger Reibung' : '← shorter = less friction'}
        </span>
      </div>
      <p className="text-[9px] font-mono mb-1" style={{ color: subClr }}>
        {de ? 'Eigentest · nicht extern zertifiziert' : 'Self-tested · not third-party certified'}
      </p>
      <p className="text-[9px] font-mono mb-5" style={{ color: subClr }}>
        {de
          ? 'μ 0.03 vs. μ 0.14 (Kettenöl) ≈ 2–5 W weniger Kettenverlust bei 250 W Ausgangsleistung'
          : 'μ 0.03 vs. μ 0.14 (chain oil) ≈ 2–5 W less drivetrain loss at 250 W output'}
      </p>
      <p className="text-[9px] font-mono mb-5" style={{ color: subClr }}>
        {de ? 'Grenzschmierung · 50–300 MPa Kontaktdruck' : 'Boundary lubrication · 50–300 MPa contact pressure'}
      </p>
      <div ref={ref} className="space-y-3.5">
        {FRICTION_BARS.map((b, i) => {
          const label = 'label' in b ? b.label : (de ? b.labelDe : b.labelEn);
          const hiPct = Math.round((b.muHi / FRICTION_SCALE) * 100);
          const loPct = Math.round((b.muLo / FRICTION_SCALE) * 100);
          const isDim = 'dim' in b && b.dim;
          const labelClr = b.best
            ? (isDark ? 'rgba(255,255,255,0.90)' : 'var(--tx1)')
            : (isDark ? 'rgba(255,255,255,0.55)' : 'var(--txm)');
          const muClr = b.best
            ? (isDark ? 'rgba(255,255,255,0.72)' : 'var(--tx1)')
            : isDim
              ? (isDark ? 'rgba(255,255,255,0.28)' : 'var(--txff)')
              : (isDark ? 'rgba(255,255,255,0.40)' : 'var(--txm)');
          const solidClr = b.best
            ? (i === 0 ? '#1A3080' : '#1A3C6E')
            : (isDark ? (isDim ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)') : (isDim ? 'var(--bd2)' : 'var(--bd)'));
          const rangeClr = b.best
            ? (i === 0 ? 'linear-gradient(90deg,#2A5499,#6A8AE8)' : 'linear-gradient(90deg,#2A5499,#4472D4)')
            : (isDark ? (isDim ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.28)') : (isDim ? 'var(--bd)' : 'var(--txff)'));
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] font-medium" style={{ color: labelClr }}>
                  {label}
                  {'tag' in b && (
                    <span className="ml-1.5 text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded" style={{ background: 'linear-gradient(135deg,#1A3080,#2A5499)', color: 'rgba(255,255,255,0.9)' }}>
                      {b.tag}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-mono" style={{ color: muClr }}>
                  μ {b.muLo.toFixed(2)}–{b.muHi.toFixed(2)}
                </span>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: trackClr }}>
                <div className="absolute top-0 left-0 h-full" style={{ width: `${loPct}%`, background: solidClr }} />
                <div className="fb absolute top-0 h-full rounded-r-full" data-w={hiPct - loPct}
                  style={{ left: `${loPct}%`, width: `${hiPct - loPct}%`, background: rangeClr, transformOrigin: 'left center', transform: 'scaleX(0)' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 pt-2" style={{ borderTop: tickBorder }}>
        {[0, 0.05, 0.10, 0.15, 0.20, 0.25].map(v => (
          <span key={v} className="text-[8px] font-mono" style={{ color: tickClr }}>
            {v === 0 ? '0' : v.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Insight callout ──────────────────────────────────────────────────────────
function Insight({ children }: { children: React.ReactNode }) {
  const ref    = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(barRef.current,
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.55, ease: 'power2.out', transformOrigin: 'top center',
          scrollTrigger: { trigger: ref.current, start: 'top 87%', once: true } },
      );
      const p = ref.current?.querySelector('p');
      if (p) {
        gsap.fromTo(p,
          { opacity: 0, x: 6 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.18,
            scrollTrigger: { trigger: ref.current, start: 'top 87%', once: true } },
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="relative pl-5 py-1">
      <div ref={barRef} className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full" style={{ background: 'linear-gradient(to bottom,#2A5499,#7A9AEC)', opacity: 0 }} />
      <p className="font-serif-display text-[15px] leading-[1.75] italic" style={{ color: 'var(--tx2)', opacity: 0 }}>
        {children}
      </p>
    </div>
  );
}

// ─── Chapter ──────────────────────────────────────────────────────────────────
interface ChapterProps {
  num: string;
  anchorId?: string;
  catDe: string; catEn: string;
  titleDe: string; titleEn: string;
  ledeDe: string; ledeEn: string;
  teaserDe?: string; teaserEn?: string;
  bodyDe: React.ReactNode; bodyEn: React.ReactNode;
  insightDe: string; insightEn: string;
  visual: React.ReactNode;
  extraVisual?: React.ReactNode;
  flip?: boolean;
  featured?: boolean;
  visualFirst?: boolean;
  de: boolean;
}

function Chapter({ num, anchorId, catDe, catEn, titleDe, titleEn, ledeDe, ledeEn, teaserDe, teaserEn, bodyDe, bodyEn, insightDe, insightEn, visual, extraVisual, flip, featured, visualFirst = false, de }: ChapterProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 86%', once: true } },
      );
    });
    return () => ctx.revert();
  }, []);

  // Stagger paragraphs in when expanding
  useEffect(() => {
    if (!open) return;
    const ps = bodyRef.current?.querySelectorAll('p');
    if (ps?.length) {
      gsap.fromTo(ps,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.42, stagger: 0.1, ease: 'power2.out', delay: 0.08 },
      );
    }
  }, [open]);

  return (
    <div ref={ref} id={anchorId} className="mb-24 lg:mb-32" style={{ opacity: 0 }} data-chapter={num}>

      {/* Eyebrow — refined pill badge */}
      <div className="flex items-center gap-3 mb-8">
        <span
          className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-md leading-none select-none flex-shrink-0"
          style={{ background: 'rgba(26,60,110,0.1)', color: '#4472D4', border: '1px solid rgba(26,60,110,0.2)' }}
        >
          {num}
        </span>
        <div className="h-px w-8 flex-shrink-0" style={{ background: 'rgba(26,60,110,0.2)' }} />
        <p className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: '#4472D4' }}>
          {de ? catDe : catEn}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Text column */}
        <div className={`flex flex-col gap-5 ${flip ? 'lg:order-2' : 'lg:order-1'}`}>
          <h2 className="font-serif-display text-[1.75rem] sm:text-[2.05rem] font-bold text-wx-tx1 leading-[1.12]">
            {de ? titleDe : titleEn}
          </h2>
          {/* Lede — always visible */}
          <p className="text-[16px] font-medium leading-snug" style={{ color: 'var(--tx1)' }}>
            {de ? ledeDe : ledeEn}
          </p>
          {/* Teaser — first sentence hook, always visible */}
          {(teaserDe || teaserEn) && (
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--txm)' }}>
              {de ? teaserDe : teaserEn}
            </p>
          )}
          {/* Toggle */}
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 w-fit text-[10px] uppercase tracking-[0.22em] font-semibold transition-all duration-200 px-3.5 py-1.5 rounded-full"
            style={{
              color: open ? 'var(--txm)' : '#4472D4',
              background: open ? 'var(--sf2)' : 'rgba(26,60,110,0.08)',
              border: '1px solid',
              borderColor: open ? 'var(--bd)' : 'rgba(26,60,110,0.2)',
            }}
          >
            <ChevronDown className="w-3 h-3 transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            {de ? (open ? 'Schließen' : 'Die Physik dahinter') : (open ? 'Close' : 'The physics')}
          </button>
          {/* Expandable body */}
          <div style={{ maxHeight: open ? '1800px' : '0', overflow: 'hidden', transition: 'max-height 0.55s cubic-bezier(0.4,0,0.2,1)' }}>
            <div ref={bodyRef} className="space-y-4 text-[15px] leading-[1.88] text-wx-txm pb-2">
              {de ? bodyDe : bodyEn}
            </div>
          </div>
          <Insight>{de ? insightDe : insightEn}</Insight>
        </div>
        {/* Visual column — featured removes card border for immersive treatment */}
        <div className={`flex flex-col gap-6 ${visualFirst ? 'order-first' : ''} ${flip ? 'lg:order-1' : 'lg:order-2'} ${featured ? 'lg:-mx-8' : ''}`}>
          {visual}
          {extraVisual}
        </div>
      </div>
    </div>
  );
}

// ─── Ingredient Matrix ────────────────────────────────────────────────────────
const MATRIX_ROWS = [
  { num: '01', nameDe: 'Paraffin C₂₀–C₃₆',   nameEn: 'Paraffin C₂₀–C₃₆',   roleDe: 'Basismatrix',      roleEn: 'Foundation',        metricDe: '2°C Erstarrungsfenster', metricEn: '2°C solidification window' },
  { num: '02', nameDe: 'FT-Wachs',             nameEn: 'FT-Wax',              roleDe: 'Härtemodul',       roleEn: 'Hardener',          metricDe: '+14°C Tropfpunkt',       metricEn: '+14°C drop point'          },
  { num: '03', nameDe: 'Mikrokristallin',       nameEn: 'Microcrystalline',    roleDe: 'Kälteflexibilität',roleEn: 'Cold Flexibility',  metricDe: 'Elastisch bis −10°C',    metricEn: 'Elastic to −10°C'          },
  { num: '04', nameDe: 'MoS₂ <5 µm',           nameEn: 'MoS₂ <5 µm',         roleDe: 'Festschmierstoff', roleEn: 'Solid lubricant',   metricDe: 'μ 0.03 Grenzschmierung', metricEn: 'μ 0.03 boundary lubrication' },
  { num: '05', nameDe: 'Fettsäureester',        nameEn: 'Fatty acid ester',    roleDe: 'Dispergierung',    roleEn: 'Dispersant',        metricDe: '5,6× Dichteverhältnis',  metricEn: '5.6× density bridged'      },
  { num: '06', nameDe: 'Phenol-Antioxidans',    nameEn: 'Phenolic antioxidant',roleDe: 'Langzeitschutz',   roleEn: 'Longevity',         metricDe: '12 Monate Lagerstabilität', metricEn: '12-month shelf life'      },
] as const;

function MatrixRowContent({ index, de }: { index: number; de: boolean }) {
  switch (index) {
    case 0: return (
      <Chapter num="01" de={de} anchorId="kristallstruktur"
        catDe="Die Basis" catEn="The Foundation"
        titleDe="Das kristalline Gerüst" titleEn="The crystalline scaffold"
        ledeDe="Welches Paraffin — und warum ein 2°C-Erstarrungsfenster über Batch-Konsistenz entscheidet."
        ledeEn="Which paraffin — and why a 2°C solidification window determines batch consistency."
        teaserDe="Paraffin ist keine Substanz, sondern eine Kategorie — von weichen Kerzenwachsen bis zu spröden Technikalqualitäten. Die entscheidende Variable ist der Erstarrungsbereich."
        teaserEn="Paraffin isn't a material, it's a category — spanning soft candle waxes to brittle technical grades. The decisive variable is the solidification range."
        bodyDe={<>
          <p>Die erste Frage war täuschend einfach: Welches Paraffin? Paraffin ist keine Substanz, sondern eine Kategorie — sie reicht von weichen, öligen Kerzenwachsen bis zu spröden Technikalqualitäten. Die entscheidende Variable ist der Erstarrungsbereich.</p>
          <p>Wir haben uns für ein vollraffiniertes Erdöldestillat mit einem exakt definierten 2°C-Erstarrungsfenster (58–60°C) entschieden. Diese Enge ist keine Präzision um ihrer selbst willen — sie sichert die Reproduzierbarkeit. Ein breiterer Erstarrungsbereich produziert je nach Batch leicht unterschiedliche Kristallstrukturen.</p>
          <p>Beim Abkühlen aus der Schmelze nucleieren die linearen Kohlenwasserstoffketten (C₂₀–C₃₆) und bilden lamellare Kristalldomänen — ein dreidimensionales Gitterwerk. Alle anderen Komponenten werden in den Zwischenbereichen dieses Gitters eingeschlossen. Die Basismatrix ist das Skelett. Alles andere ist eingebettet.</p>
        </>}
        bodyEn={<>
          <p>The first question was deceptively simple: which paraffin? Paraffin isn't a material, it's a category — spanning soft, oily candle waxes to brittle technical grades. The decisive variable is the solidification range.</p>
          <p>We chose a fully refined petroleum distillate with a precisely defined 2°C solidification window (58–60°C). This narrow range isn't precision for its own sake — it ensures reproducibility. A wider solidification range produces subtly different crystal structures batch-to-batch.</p>
          <p>On cooling from the melt, the linear hydrocarbon chains (C₂₀–C₃₆) nucleate and form lamellar crystal domains — an interlocking three-dimensional lattice. All other components are trapped in the spaces between these crystals. The base matrix is the skeleton. Everything else is embedded within it.</p>
        </>}
        insightDe="Das enge Erstarrungsfenster ist der Schlüssel zur Batch-Konsistenz — und damit zur gleichmäßigen Performance jedes Blocks."
        insightEn="The narrow solidification window is the key to batch consistency — every block performing identically."
        visual={<CrystalLattice de={de} />}
      />
    );
    case 1: return (
      <Chapter num="02" de={de} flip anchorId="matrix"
        catDe="Härtemodul" catEn="Hardener Module"
        titleDe="Synthetisch reines Härtewachs" titleEn="Synthetically pure hard wax"
        ledeDe="Fischer-Tropsch-Wachs: synthetisch lineare Moleküle, die den Tropfpunkt auf 72–78°C anheben."
        ledeEn="Fischer-Tropsch wax: synthetically linear molecules that push the drop point to 72–78°C."
        teaserDe="An Kettenkontaktpunkten unter Last können Temperaturen 45–55°C erreichen. Reines Paraffinwachs wäre an seiner thermischen Grenze."
        teaserEn="At chain contact points under load, temperatures can reach 45–55°C. Unmodified paraffin wax would be at its thermal limit."
        bodyDe={<>
          <p>Das zweite Problem war der Sommer. An Kettenkontaktpunkten unter Last können Temperaturen 45–55°C erreichen. Reines Paraffinwachs wäre an seiner thermischen Grenze — es würde erweichen, migrieren, auf dem Schaltwerk landen statt in den Gelenkstiften.</p>
          <p>Die Lösung war ein synthetisches Wachs, hergestellt über den Fischer-Tropsch-Prozess: eine Kohlenstoff-Syntheseroute, die Kohlenwasserstoffketten von außergewöhnlicher Reinheit liefert. Kein Schwefel, keine Aromaten, keine Verzweigungen — nur vollständig lineare Moleküle.</p>
          <p>In gezielt gewählter Konzentration erhöht dieses Additiv den effektiven Tropfpunkt der Gesamtmatrix auf ~72–78°C. Der Mechanismus: Es ko-kristallisiert mit der Basismatrix, bildet aber dichtere, defektärmere Kristalldomänen, die deutlich mehr Energie zum Schmelzen benötigen.</p>
        </>}
        bodyEn={<>
          <p>The second problem was summer. At chain contact points under load, temperatures can reach 45–55°C. Unmodified paraffin wax would be at its thermal limit — it would soften, migrate, end up on the derailleur instead of the chain pins.</p>
          <p>The solution was a synthetic wax produced via the Fischer-Tropsch process: a carbon synthesis route that yields hydrocarbon chains of exceptional purity. No sulfur, no aromatics, no branching — only perfectly linear molecules.</p>
          <p>At a carefully chosen concentration, this additive raises the effective drop point of the matrix to ~72–78°C. The mechanism: it co-crystallizes with the base wax but forms denser, more defect-free crystal domains requiring significantly more energy to melt.</p>
        </>}
        insightDe="Tests mit höherer Konzentration zeigten keine messbare Verbesserung. Das Optimum liegt unter dem, was man intuitiv erwarten würde."
        insightEn="Tests at higher concentrations showed no measurable improvement. The optimum is lower than you'd intuitively expect."
        visual={<TempRange de={de} />}
      />
    );
    case 2: return (
      <Chapter num="03" de={de} anchorId="winterformel"
        catDe="Kälteflexibilität" catEn="Cold Flexibility"
        titleDe="Mikrokristallines Wachs" titleEn="Microcrystalline wax"
        ledeDe="Verzweigte Moleküle füllen die amorphen Bereiche zwischen Kristalldomänen — Matrix bleibt bis −10°C elastisch."
        ledeEn="Branched molecules fill the amorphous zones between crystal domains — keeping the matrix elastic to −10°C."
        teaserDe="Eine reine Paraffinmatrix ist unterhalb von 5°C extrem spröde — spröde genug, um bei Biegebelastung zu brechen. Die Wachsschicht platzte buchstäblich ab."
        teaserEn="A pure paraffin matrix is extremely brittle below 5°C — brittle enough to crack under bending stress. The wax coating literally spalled off."
        bodyDe={<>
          <p>Das entgegengesetzte Problem folgte sofort: Winter. Eine reine Paraffinmatrix mit Fischer-Tropsch-Härtemodul ist unterhalb von 5°C extrem spröde — spröde genug, um bei Biegebelastung zu brechen. Ein Kettengelenk, das sich in der Kälte bewegt, ließ die Wachsschicht buchstäblich abplatzen.</p>
          <p>Mikrokristallines Wachs löst dieses Problem strukturell. Im Gegensatz zu den geradkettigen Paraffinen besteht es aus hochverzweigten und zyklischen Molekülen, die keine geordneten Kristallstrukturen bilden können. Sie besetzen die amorphen Bereiche zwischen den Paraffindomänen — molekulare Plastifizierung.</p>
          <p>Diese Komponente erfüllt drei Funktionen gleichzeitig: (1) Die Matrix bleibt bis −10°C elastisch verformbar statt zu brechen. (2) Die verzweigten Moleküle haben stärkere van-der-Waals-Wechselwirkungen mit der Stahloberfläche — bessere Haftung unter Scherkraft. (3) Die amorphen Bereiche betten die MoS₂-Partikel mechanisch in die Matrix ein.</p>
        </>}
        bodyEn={<>
          <p>The opposite problem arrived immediately: winter. A pure paraffin matrix with a Fischer-Tropsch hardener is extremely brittle below 5°C — brittle enough to crack under bending stress. A chain link flexing in cold weather caused the wax coating to literally spall off.</p>
          <p>Microcrystalline wax solves this structurally. Unlike the straight-chain paraffins, it consists of highly branched and cyclic molecules that cannot form ordered crystal structures. They occupy the amorphous zones between paraffin crystal domains — molecular plasticization.</p>
          <p>This component serves three functions simultaneously: (1) The matrix remains elastically deformable down to −10°C. (2) Branched molecules have stronger van-der-Waals interactions with the steel surface — better adhesion. (3) The amorphous regions mechanically embed the MoS₂ particles in the matrix.</p>
        </>}
        insightDe="Ursprünglich höher konzentriert. Die Reduzierung war möglich, weil gleichzeitig der MoS₂-Anteil überarbeitet wurde."
        insightEn="Originally at higher concentration. The reduction was possible because MoS₂ loading was revised simultaneously."
        visual={
          <div className="rounded-2xl p-5 space-y-5" style={{ ...CARD, ...DOT_GRID }}>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--txff)' }}>
              {de ? 'Temperaturfenster — Matrix flexibel' : 'Temperature window — matrix stays flexible'}
            </p>
            {[
              { labelDe: 'Kälteflexibilität bis', labelEn: 'Cold flexibility to', val: '−10°C', w: 20, color: '#4472D4' },
              { labelDe: 'Optimale Performance',  labelEn: 'Optimal performance',  val: '−8°C → +35°C', w: 80, color: '#2A5499' },
              { labelDe: 'Thermisch stabil bis',  labelEn: 'Thermally stable to',   val: '+78°C', w: 100, color: '#1A3080' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-wx-txm">{de ? item.labelDe : item.labelEn}</span>
                  <span className="text-[11px] font-mono font-semibold text-wx-tx1">{item.val}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${item.w}%`, background: item.color }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
              {[{ de: 'Plastifizierung', en: 'Plastification' }, { de: 'Haftung', en: 'Adhesion' }, { de: 'Partikelbindung', en: 'Particle binding' }].map((fn, i) => (
                <div key={i} className="text-center rounded-lg py-2 px-1" style={{ background: 'rgba(26,60,110,0.07)', border: '1px solid rgba(26,60,110,0.13)' }}>
                  <p className="text-[10px] font-medium" style={{ color: '#4472D4' }}>{de ? fn.de : fn.en}</p>
                </div>
              ))}
            </div>
          </div>
        }
      />
    );
    case 3: return (
      <Chapter num="04" de={de} flip featured visualFirst anchorId="mos2"
        catDe="Festschmierstoff" catEn="Solid Lubricant"
        titleDe="Molybdändisulfid — <5 µm" titleEn="Molybdenum disulfide — <5 µm"
        ledeDe="MoS₂ bildet unter Kontaktdruck einen Transferfilm auf dem Stahl — er schmiert noch, wenn das Wachs längst verbraucht ist."
        ledeEn="MoS₂ forms a transfer film on steel under contact pressure — it lubricates long after the wax is spent."
        teaserDe="MoS₂ ist eines der wenigen Materialien mit einem Reibungskoeffizienten unter 0,05 unter Grenzschmierbedingungen — dem Regime, das in Kettenkontaktstellen tatsächlich herrscht."
        teaserEn="MoS₂ is one of the few materials with a friction coefficient below 0.05 under boundary lubrication — the regime that actually governs chain contact points."
        bodyDe={<>
          <p>MoS₂ ist eines der wenigen Materialien mit einem Reibungskoeffizienten unter 0.05 unter Grenzschmierbedingungen. Der Grund liegt in der Kristallstruktur: Mo-Atome sandwichartig zwischen zwei Schwefelschichten, die Schichten untereinander nur durch schwache van-der-Waals-Kräfte gebunden. Unter Kontaktdruck scheren diese Bindungen — die Schichten gleiten lateral fast widerstandslos.</p>
          <p>An Kettenkontaktflächen unter Last entstehen Drücke von 50–300 MPa. Das ist das Regime der Grenzschmierung — konventionelle Öle können keinen kontinuierlichen Film aufrechterhalten. MoS₂ bildet stattdessen einen Transferfilm: Partikel werden unter Druck auf der Stahloberfläche deponiert und durch tribochemische Bindungen (Mo–S → Fe–S) verankert. Dieser Film persistiert, auch nachdem der Wachsträger längst abgetragen ist.</p>
          <p>Die Partikelgröße ist nicht zufällig: Unter 5 µm passen die Partikel in die Kettenlagerungsspalte (typisch 5–15 µm). Eine einzige Ladung Wachs enthält Millionen von Partikeln — ausreichend für mehrfache Transferfilm-Regeneration über hunderte Kilometer. Mehr Konzentration schwächt die Wachsmatrix ohne tribologischen Mehrwert.</p>
        </>}
        bodyEn={<>
          <p>MoS₂ is one of the few materials with a friction coefficient below 0.05 under boundary lubrication conditions. The crystal structure is the reason: Mo atoms sandwiched between two sulfur layers, with the layers bonded only by weak van-der-Waals forces. Under contact pressure, these bonds shear — the layers slide laterally with almost no resistance.</p>
          <p>At chain contact surfaces under load, pressures reach 50–300 MPa. This is the boundary lubrication regime — conventional oils cannot maintain a continuous film here. MoS₂ instead forms a transfer film: particles deposited on the steel surface and anchored by tribochemical bonds (Mo–S → Fe–S). This film persists long after the wax carrier is worn away.</p>
          <p>Particle size is deliberate: below 5 µm, particles fit within chain clearances (typically 5–15 µm). A single charge of wax contains millions of particles — sufficient for multiple transfer film regeneration cycles over hundreds of kilometers. Higher concentrations weaken the wax matrix without tribological benefit.</p>
        </>}
        insightDe="Der Transferfilm ist der eigentliche Schmierstoff — das Wachs ist nur das Trägervehikel. MoS₂-Schichten, nanometerdick auf dem Stahl, schmieren noch, wenn der Block längst aufgebraucht ist."
        insightEn="The transfer film is the actual lubricant — the wax is just the delivery vehicle. Nanometer-thin MoS₂ layers on the steel continue lubricating long after the block is spent."
        visual={<HexMoS2 de={de} />}
        extraVisual={<TransferFilm de={de} />}
      />
    );
    case 4: return (
      <Chapter num="05" de={de} anchorId="sedimentation" visualFirst
        catDe="Dispergiersystem" catEn="Dispersant System"
        titleDe="Amphiphiler Fettsäureester" titleEn="Amphiphilic fatty acid ester"
        ledeDe="MoS₂ ist 5,6× dichter als Paraffin — ohne Dispergiermittel entsteht ein messbarer Konzentrationsgradient im fertigen Block."
        ledeEn="MoS₂ is 5.6× denser than paraffin — without dispersant a measurable concentration gradient forms in the finished block."
        teaserDe="Gibt man MoS₂ ohne Stabilisierung in geschmolzenes Wachs, sinken die Partikel messbar schnell — der erste Rewax-Vorgang wäre anders als der zwanzigste."
        teaserEn="Add MoS₂ to molten wax without stabilization and the particles sink measurably fast — the first rewax would perform differently from the twentieth."
        bodyDe={<>
          <p>MoS₂ hat eine Dichte von 5.06 g/cm³. Paraffinwachs hat eine Dichte von 0.9 g/cm³. Dichteunterschied: Faktor 5,6. Gibt man MoS₂ in geschmolzenes Wachs ohne Stabilisierung, sinken die Partikel messbar schnell. In den Minuten zwischen Rührstopp und Guss bedeutet das messbare Konzentrationsgradienten im fertigen Block.</p>
          <p>Das Dispergiermittel ist ein amphiphiler Fettsäureester: ein Molekül mit einer polaren Kopfgruppe, die über Wasserstoffbrücken an MoS₂-Partikelkanten adsorbiert, und einer langen unpolaren Fettsäurekette, die sich in die Paraffinschmelze erstreckt. Diese Hülle um jeden Partikel erzeugt eine sterische Barriere: annähernde Partikel müssen die Fettsäureketten komprimieren — dieser entropische Widerstand verhindert Agglomeration und Sedimentation.</p>
          <p>Entscheidend für die Wahl dieses spezifischen Esters: Sein Schmelzpunkt (58–60°C) ist identisch mit der Basismatrix. Die Integration in die erstarrende Matrix verläuft thermodynamisch nahtlos — kein Auftrennen, keine Phasenseparation beim Abkühlen.</p>
        </>}
        bodyEn={<>
          <p>MoS₂ has a density of 5.06 g/cm³. Paraffin wax has a density of 0.9 g/cm³. Density ratio: 5.6×. Add MoS₂ to molten wax without stabilization and the particles sink measurably fast. In the minutes between stopping agitation and casting, this creates measurable concentration gradients in the finished block.</p>
          <p>The dispersant is an amphiphilic fatty acid ester: a molecule with a polar head group that adsorbs to MoS₂ particle edges via hydrogen bonds, and a long nonpolar fatty acid tail extending into the paraffin melt. This shell around each particle creates a steric barrier: approaching particles must compress the tails — this entropic resistance prevents agglomeration and sedimentation.</p>
          <p>Critical to the choice of this specific ester: its melting point (58–60°C) is identical to the base matrix. Integration into the solidifying matrix is thermodynamically seamless — no phase separation on cooling.</p>
        </>}
        insightDe="Ohne Dispergiermittel variiert die MoS₂-Konzentration durch den Block. Der erste Rewax-Vorgang wäre anders als der zwanzigste. Das ist nicht akzeptabel."
        insightEn="Without dispersant, MoS₂ concentration varies through the block. The first rewax would perform differently from the twentieth. Unacceptable."
        visual={<ParticleSuspension de={de} />}
      />
    );
    case 5: return (
      <Chapter num="06" de={de} flip
        catDe="Langzeitstabilität" catEn="Long-term Stability"
        titleDe="Gehindertes Phenol-Antioxidans" titleEn="Hindered phenolic antioxidant"
        ledeDe="Oxidiertes MoS₂ ist MoO₃ — abrasiv. Das Antioxidans schützt den Festschmierstoff, nicht nur das Wachs."
        ledeEn="Oxidized MoS₂ is MoO₃ — abrasive. The antioxidant protects the solid lubricant, not just the wax."
        teaserDe="Ein Wachsblock, der in Woche 1 performt aber in Monat 6 nachlässt, ist kein Produkt. Kohlenwasserstoffwachse sind anfällig für Autoxidation."
        teaserEn="A wax block that performs in week 1 but degrades by month 6 isn't a product. Hydrocarbon waxes are susceptible to autoxidation."
        bodyDe={<>
          <p>Die letzte Frage war Zeit. Ein Wachsblock, der in Woche 1 performt aber in Monat 6 nachlässt, ist kein Produkt. Kohlenwasserstoffwachse sind anfällig für Autoxidation: Sauerstoffradikale greifen C–H-Bindungen an und initiieren eine Kettenreaktion, die Peroxide, Alkohole und Ketone produziert. Diese Oxidationsprodukte verspröden die Matrix.</p>
          <p>Und sie können die MoS₂-Oberfläche von einem Schmierstoff (MoS₂) in ein Abrasivum verwandeln (MoO₃, gebildet durch Mo⁴⁺ → Mo⁶⁺ Oxidation). Ein gehindertes Phenol-Antioxidans wirkt als Radikalkettenabbrecher: Die phenolische OH-Gruppe doniert ein Wasserstoffatom an Peroxylradikale (ROO•) und bricht die Oxidationskaskade ab.</p>
          <p>Die Konzentration wurde leicht erhöht, als wir einen separaten Korrosionsinhibitor aus einer früheren Formulierungsversion entfernt haben. Dieser hatte eine sekundäre antioxidative Wirkung. Ohne ihn trägt das Phenol-Antioxidans die gesamte Last — eine leichte Erhöhung kompensiert dies vollständig.</p>
        </>}
        bodyEn={<>
          <p>The last question was time. A wax block that performs in week 1 but degrades by month 6 isn't a product. Hydrocarbon waxes are susceptible to autoxidation: oxygen radicals attack C–H bonds, initiating a chain reaction producing peroxides, alcohols, and ketones. These oxidation products embrittle the matrix.</p>
          <p>And they can convert the MoS₂ surface from a lubricant (MoS₂) into an abrasive (MoO₃, formed by Mo⁴⁺ → Mo⁶⁺ oxidation). A hindered phenolic antioxidant acts as a radical chain-breaker: the phenolic OH group donates a hydrogen atom to peroxyl radicals (ROO•), breaking the oxidation cascade.</p>
          <p>Concentration was raised slightly when we removed a separate corrosion inhibitor from an earlier formula version. That inhibitor had a secondary antioxidant effect. Without it, the phenolic antioxidant carries the full stabilization load — a slight increase covers this completely.</p>
        </>}
        insightDe="Das Antioxidans schützt nicht nur das Wachs, sondern auch den Festschmierstoff. Eine Komponente, die zwei Versagensmodi gleichzeitig verhindert."
        insightEn="The antioxidant protects not just the wax, but also the solid lubricant. One component preventing two failure modes simultaneously."
        visual={
          <div className="rounded-2xl p-5" style={{ ...CARD, ...DOT_GRID }}>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--txff)' }}>
              {de ? 'Drei Schutzebenen' : 'Three protection layers'}
            </p>
            <div className="space-y-3">
              {[
                { n: '01', titleDe: 'Wachsmatrix', titleEn: 'Wax matrix', descDe: 'Stoppt Autoxidation der Kohlenwasserstoffketten — bei Produktion und Lagerung.', descEn: 'Stops autoxidation of hydrocarbon chains — during production and storage.' },
                { n: '02', titleDe: 'MoS₂-Oberfläche', titleEn: 'MoS₂ surface', descDe: 'Verhindert langsame MoS₂ → MoO₃ Oxidation durch Sauerstoffspuren in der Matrix.', descEn: 'Prevents slow MoS₂ → MoO₃ surface oxidation from trace oxygen in the matrix.' },
                { n: '03', titleDe: 'Lagerstabilität', titleEn: 'Shelf life', descDe: 'Peroxidzahl bleibt auch nach 12–24 Monaten unter dem Leistungsgrenzwert.', descEn: 'Peroxide value stays below the performance threshold after 12–24 months.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3.5 p-3.5 rounded-xl" style={{ background: 'rgba(26,60,110,0.06)', border: '1px solid rgba(26,60,110,0.13)' }}>
                  <span className="font-display text-[22px] font-bold tabular-nums flex-shrink-0 leading-none mt-0.5" style={{ color: 'rgba(26,60,110,0.28)' }}>{item.n}</span>
                  <div>
                    <p className="text-[12px] font-semibold text-wx-tx1 mb-1">{de ? item.titleDe : item.titleEn}</p>
                    <p className="text-[11px] text-wx-txm leading-relaxed">{de ? item.descDe : item.descEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      />
    );
    default: return null;
  }
}

function IngredientMatrix({ de, isDark }: { de: boolean; isDark: boolean }) {
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [everOpened, setEverOpened] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    const next = openRow === i ? null : i;
    if (next !== null) setEverOpened(prev => new Set([...prev, i]));
    setOpenRow(next);
  };

  return (
    <div style={{ border: '1px solid var(--bd)', borderRadius: '12px', overflow: 'hidden' }}>
      {MATRIX_ROWS.map((row, i) => {
        const isOpen = openRow === i;
        return (
          <div
            key={i}
            style={{ borderBottom: i < MATRIX_ROWS.length - 1 ? '1px solid var(--bd)' : 'none' }}
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-3 sm:gap-5 px-5 py-4 text-left transition-colors"
              style={{ background: isOpen ? (isDark ? 'rgba(26,60,110,0.10)' : 'rgba(26,60,110,0.05)') : 'transparent' }}
            >
              <span className="font-mono text-[11px] font-bold flex-shrink-0" style={{ color: isOpen ? '#4472D4' : 'var(--txff)', width: '20px' }}>
                {row.num}
              </span>
              <div className="w-px self-stretch flex-shrink-0" style={{ background: 'var(--bd2)', minHeight: '20px' }} />
              <span className="text-[13px] font-semibold flex-shrink-0" style={{ color: 'var(--tx1)', width: '152px' }}>
                {de ? row.nameDe : row.nameEn}
              </span>
              <span className="text-[11px] hidden sm:block flex-shrink-0" style={{ color: 'var(--txm)', width: '108px' }}>
                {de ? row.roleDe : row.roleEn}
              </span>
              <span className="text-[11px] font-mono flex-1 text-right hidden sm:block" style={{ color: 'var(--txff)' }}>
                {de ? row.metricDe : row.metricEn}
              </span>
              <ChevronDown
                className="h-4 w-4 flex-shrink-0 transition-transform duration-300 ml-auto sm:ml-0"
                style={{ color: isOpen ? '#4472D4' : 'var(--txf)', transform: isOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            <div style={{ maxHeight: isOpen ? '3200px' : '0', overflow: 'hidden', transition: 'max-height 0.55s cubic-bezier(0.4,0,0.2,1)' }}>
              {everOpened.has(i) && (
                <div className="px-4 pt-6 pb-8" style={{ borderTop: '1px solid var(--bd2)' }}>
                  <MatrixRowContent index={i} de={de} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ─── Main page ────────────────────────────────────────────────────────────────
export function SciencePage() {
  const { lang, toggleLang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'noir';
  const de = lang === 'de';
  const [activeChapter, setActiveChapter] = useState(-1);
  const heroRef  = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Badge
      gsap.fromTo('[data-hero-badge]',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 },
      );
      // Headline words
      if (wordsRef.current.length) {
        gsap.fromTo(wordsRef.current,
          { opacity: 0, y: 28, rotateX: -16 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.72, stagger: 0.1, ease: 'power3.out', delay: 0.35 },
        );
      }
      // Subtitle
      gsap.fromTo('[data-hero-sub]',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.0 },
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const heroWords = de
    ? ['Sechs', 'Stoffe.', 'Jede', 'mit', 'Geschichte.']
    : ['Six', 'components.', 'Each', 'one', 'earned.'];

  const CHAPTER_MAP = [
    { n: '01', de: 'Die Basis',    en: 'Foundation'  },
    { n: '02', de: 'Härtemodul',  en: 'Hardener'    },
    { n: '03', de: 'Kälteflex.',  en: 'Cold Flex.'  },
    { n: '04', de: 'MoS₂',        en: 'MoS₂'        },
    { n: '05', de: 'Dispergier.', en: 'Dispersant'  },
    { n: '06', de: 'Antioxidans', en: 'Antioxidant' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <GrainOverlay />
      <ScrollProgress />
      <ChapterNav de={de} onActiveChange={setActiveChapter} />

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--bd)' }}>
        <div className={`${W} h-14 flex items-center justify-between`}>
          <Link to="/" className="flex items-center gap-2 text-[13px] text-wx-txm hover:text-wx-tx1 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <span className="font-display text-[13px] font-semibold text-wx-tx1 tracking-wide transition-all duration-300">
            {activeChapter >= 0 && CHAPTER_MAP[activeChapter] ? (
              <>
                <span className="font-mono text-[11px]" style={{ color: '#4472D4' }}>
                  {CHAPTER_MAP[activeChapter].n}
                </span>
                <span style={{ color: '#4472D4' }}> · </span>
                {de ? CHAPTER_MAP[activeChapter].de : CHAPTER_MAP[activeChapter].en}
              </>
            ) : (
              <>Waxcelerate <span style={{ color: '#4472D4' }}>·</span> {de ? 'Wissenschaft' : 'Science'}</>
            )}
          </span>
          <button
            onClick={toggleLang}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all duration-200"
            style={{ color: 'var(--txm)', borderColor: 'var(--bd)', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#4472D4'; (e.currentTarget as HTMLButtonElement).style.color = '#4472D4'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bd)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--txm)'; }}
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>
      </nav>

      {/* ══ HERO — no particles, no hex grid ══════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden flex flex-col items-center justify-center"
        style={{ background: isDark ? '#07070A' : 'var(--sf)', minHeight: isDark ? '44vh' : '40vh' }}
      >
        <img
          src="/images/wax-hero.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: 0.055, objectPosition: '62% 50%', filter: 'grayscale(1) blur(1px)' }}
          loading="eager"
        />
        <div className="relative z-10 text-center px-4 sm:px-8 py-12 sm:py-16">
          <div data-hero-badge className="inline-flex items-center gap-3 mb-6" style={{ opacity: 0 }}>
            <div className="h-px w-8" style={{ background: isDark ? 'rgba(68,114,212,0.45)' : 'rgba(26,60,110,0.25)' }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.38em]" style={{ color: isDark ? 'rgba(68,114,212,0.65)' : '#4472D4' }}>
              {de ? 'Formulierungsgeschichte' : 'Formula Story'}
            </span>
            <div className="h-px w-8" style={{ background: isDark ? 'rgba(68,114,212,0.45)' : 'rgba(26,60,110,0.25)' }} />
          </div>
          <h1
            className="font-display font-bold leading-[1.05] mb-5 flex flex-wrap justify-center gap-x-4 gap-y-1"
            style={{ fontSize: 'clamp(2rem,5.5vw,3.5rem)', color: isDark ? '#FFFFFF' : 'var(--tx1)', perspective: '600px' }}
          >
            {heroWords.map((w, i) => (
              <span
                key={i}
                ref={el => { if (el) wordsRef.current[i] = el; }}
                style={{ display: 'inline-block', opacity: 0 }}
              >
                {w}
              </span>
            ))}
          </h1>
          <p
            data-hero-sub
            className="text-[14px] sm:text-[15px] leading-relaxed max-w-[480px] mx-auto mb-6"
            style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx2)', opacity: 0 }}
          >
            {de
              ? 'Jede Komponente in dieser Formel existiert, weil ein Test gescheitert ist — oder weil ein Kompromiss nicht akzeptabel war.'
              : "Every component in this formula exists because a test failed — or because a compromise was unacceptable."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.30)' : 'var(--txff)' }}>
            <span>μ 0.03</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{de ? 'bis zu 3× Kettenlaufzeit' : 'up to 3× chain life'}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{de ? '6 Komponenten' : '6 components'}</span>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--pg))' }}
        />
      </section>

      {/* ══ 01 THE RESULT ════════════════════════════════════════════════════════ */}
      <section id="reibung" style={{ borderTop: '1px solid var(--bd)' }}>
        <div className={`${W} py-16`}>
          <div className="flex items-center gap-4 mb-8">
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.32em', color: 'var(--txff)' }}>01</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-wx-tx1 mb-3">
            {de ? 'Das Ergebnis' : 'The Result'}
          </h2>
          <p className="text-wx-tx2 mb-10 max-w-xl">
            {de
              ? 'Was die Formel messbar leistet — Reibungskoeffizient unter Grenzschmierung, 50–300 MPa Kontaktdruck.'
              : 'What the formula measurably delivers — friction coefficient under boundary lubrication, 50–300 MPa contact pressure.'}
          </p>
          <FrictionBars de={de} />
        </div>
      </section>

      {/* ══ 02 THE FORMULA ═══════════════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid var(--bd)' }}>
        <div className={`${W} py-16`}>
          <div className="flex items-center gap-4 mb-8">
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.32em', color: 'var(--txff)' }}>02</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-wx-tx1 mb-3">
            {de ? 'Die Formel' : 'The Formula'}
          </h2>
          <p className="text-wx-tx2 mb-10 max-w-xl">
            {de
              ? 'Sechs Bestandteile. Jeder einzeln begründet. Zeile aufklappen für die vollständige Wissenschaft.'
              : 'Six components. Each individually justified. Expand any row for the full science.'}
          </p>
          <IngredientMatrix de={de} isDark={isDark} />
        </div>
      </div>

      {/* ══ 03 HOW WE GOT HERE ═══════════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid var(--bd)' }}>
        <div className={`${W} py-16`}>
          <div className="flex items-center gap-4 mb-8">
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.32em', color: 'var(--txff)' }}>03</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-wx-tx1 mb-3">
            {de ? 'Wie wir dahin kamen' : 'How we got here'}
          </h2>
          <p className="text-wx-tx2 mb-10 max-w-xl">
            {de
              ? 'Vier Iterationen. Jede hat etwas geändert, das heute noch in der Formel steckt.'
              : 'Four iterations. Each one changed something that is still in the formula today.'}
          </p>
          <FailureTimeline de={de} isDark={isDark} />
        </div>
      </div>

      {/* ══ 04 WHAT THIS MEANS ═══════════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid var(--bd)' }}>
        <div className={`${W} py-14`}>
          <div className="flex items-center gap-4 mb-8">
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.32em', color: 'var(--txff)' }}>04</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-wx-tx1 mb-10">
            {de ? 'Was das bedeutet' : 'What this means'}
          </h2>
          <div
            className="rounded-2xl p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
            style={{
              background: isDark ? 'rgba(26,60,110,0.12)' : 'rgba(26,60,110,0.05)',
              border: '1px solid rgba(26,60,110,0.18)',
            }}
          >
            <div>
              <p className="font-display font-bold text-[2.4rem] leading-none mb-1.5" style={{ color: isDark ? '#6A8AE8' : '#1A3C6E' }}>~300 km</p>
              <p className="text-[11px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx1)' }}>{de ? 'pro Rewax-Vorgang' : 'per rewax'}</p>
              <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>{de ? 'bei trockenen Bedingungen' : 'in dry conditions'}</p>
            </div>
            <div>
              <p className="font-display font-bold text-[2.4rem] leading-none mb-1.5" style={{ color: isDark ? '#6A8AE8' : '#1A3C6E' }}>{de ? 'bis zu 3×' : 'up to 3×'}</p>
              <p className="text-[11px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx1)' }}>{de ? 'längere Kettenlaufzeit' : 'longer chain life'}</p>
              <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>{de ? 'gegenüber Kettenöl' : 'vs. chain oil'}</p>
            </div>
            <div>
              <p className="font-display font-bold text-[2.4rem] leading-none mb-1.5" style={{ color: isDark ? '#6A8AE8' : '#1A3C6E' }}>~€35</p>
              <p className="text-[11px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx1)' }}>{de ? 'gespart pro Jahr' : 'saved per year'}</p>
              <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>{de ? 'bei 5.000 km/Jahr' : 'at 5,000 km/year'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section style={{
        background: isDark ? 'linear-gradient(160deg, #07070A 0%, #0B1830 55%, #07070A 100%)' : 'var(--sf3)',
        borderTop: isDark ? '1px solid rgba(68,114,212,0.1)' : '1px solid var(--bd)',
      }}>
        <div className={`${W} py-20 text-center`}>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] mb-4" style={{ color: '#4472D4' }}>
            {de ? 'Bereit?' : 'Ready?'}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 leading-tight" style={{ color: isDark ? '#FAFAFA' : 'var(--tx1)' }}>
            {de ? 'Die Formel auf deiner Kette.' : 'Put the formula on your chain.'}
          </h2>
          <p className="text-[14px] mb-10 max-w-sm mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>
            {de
              ? 'Direkt über eBay — mit vollem Käuferschutz.'
              : 'Directly via eBay — with full buyer protection.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://www.ebay.de/itm/396468036330"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-[14px] transition-opacity hover:opacity-80"
              style={{
                background: isDark ? 'linear-gradient(135deg,#1A3080,#2A5499)' : 'var(--cta-bg)',
                color: isDark ? '#fff' : 'var(--cta-fg)',
              }}
            >
              {de ? 'Pro kaufen →' : 'Buy Pro →'}
            </a>
            <a
              href="https://www.ebay.de/itm/395811184583"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-[14px] transition-opacity hover:opacity-80"
              style={{
                background: 'transparent',
                border: isDark ? '1.5px solid rgba(106,138,232,0.55)' : '1.5px solid var(--brand)',
                color: isDark ? 'rgba(168,192,244,0.85)' : 'var(--brand)',
              }}
            >
              {de ? 'Classic kaufen →' : 'Buy Classic →'}
            </a>
          </div>
          <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70" style={{ color: isDark ? 'rgba(255,255,255,0.30)' : 'var(--txff)' }}>
            <ArrowLeft className="w-3 h-3" />
            {de ? 'Zurück zur Übersicht' : 'Back to overview'}
          </Link>
        </div>
      </section>

    </div>
  );
}
