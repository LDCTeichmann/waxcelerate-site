import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion, EASE, DUR } from '@/hooks/useAnimation';

// ─── Chapter registry — single source for sidebar, mobile rail & quick-nav ───
const CHAPTERS = [
  { n: '01', de: 'Die Basis',    en: 'Foundation'  },
  { n: '02', de: 'Härtemodul',  en: 'Hardener'    },
  { n: '03', de: 'Kälteflex.',  en: 'Cold Flex.'  },
  { n: '04', de: 'MoS₂',        en: 'MoS₂'        },
  { n: '05', de: 'Dispergier.', en: 'Dispersant'  },
  { n: '06', de: 'Antioxidans', en: 'Antioxidant' },
] as const;

// ─── Static data ──────────────────────────────────────────────────────────────

// HexMoS2 constants — viewBox 0 0 360 250, 7 S / 6 Mo columns, bigger atoms
const HEX_S_X  = [20, 70, 120, 170, 220, 270, 320];
const HEX_MO_X = [45, 95, 145, 195, 245, 295];

// TransferFilm constants — viewBox 0 0 400 230, 12 particles at r6-9
const TF_PARTICLES = [
  { x: 30,  y: 100, r: 7,   top: true  },
  { x: 75,  y: 140, r: 6,   top: false },
  { x: 120, y: 85,  r: 8,   top: true  },
  { x: 165, y: 155, r: 9,   top: false },
  { x: 210, y: 110, r: 7,   top: true  },
  { x: 255, y: 90,  r: 8,   top: false },
  { x: 300, y: 160, r: 6,   top: true  },
  { x: 345, y: 120, r: 7,   top: false },
  { x: 60,  y: 165, r: 6,   top: false },
  { x: 140, y: 75,  r: 7,   top: true  },
  { x: 280, y: 130, r: 8,   top: true  },
  { x: 370, y: 95,  r: 6,   top: false },
] as const;


const DOT_GRID: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(var(--accent-rgb),0.11) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

const CARD: React.CSSProperties = {
  background: 'var(--sf2)',
  border: '1px solid var(--bd)',
};

// Shared container width
const W = 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8';

// ─── VizFrame — unified instrument-panel container for every visualization ───
// variant 'panel': theme-aware surface · variant 'lab': forced-dark lab panel
// (#0E1626 in BOTH themes — deliberate cinematic moment for the MoS₂ diagrams)
function VizFrame({ eyebrow, chip, footer, variant = 'panel', children, className = '', innerRef }: {
  eyebrow: string;
  chip?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'panel' | 'lab';
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lab = variant === 'lab';
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { gsap.set(el, { opacity: 1 }); return; }
    gsap.set(el, { opacity: 0, y: 28, rotateX: 9, transformPerspective: 700, transformOrigin: '50% 0%' });
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 87%', once: true,
      onEnter: () => gsap.to(el, {
        opacity: 1, y: 0, rotateX: 0, duration: DUR.long, ease: EASE.enter,
        onStart()    { el.style.willChange = 'transform, opacity'; },
        onComplete() { el.style.willChange = 'auto'; el.style.transform = ''; },
      }),
    });
    return () => trigger.kill();
  }, []);
  const tick = lab ? 'rgba(130,170,240,0.32)' : 'rgba(var(--accent-rgb),0.25)';
  return (
    <div
      ref={ref}
      className={`relative w-full rounded-2xl overflow-hidden grain ${className}`}
      style={lab
        ? { background: '#0E1626', border: '1px solid rgba(var(--accent-soft-rgb),0.25)' }
        : { background: 'var(--sf2)', border: '1px solid var(--bd)' }}
    >
      {/* Dot grid */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: lab
          ? 'radial-gradient(circle, rgba(130,170,240,0.10) 1px, transparent 1px)'
          : 'radial-gradient(circle, rgba(var(--accent-rgb),0.09) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {/* Corner registration ticks */}
      {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
        <div key={c} aria-hidden className="absolute w-2.5 h-2.5 pointer-events-none" style={{
          top:    c[0] === 't' ? 7 : undefined,
          bottom: c[0] === 'b' ? 7 : undefined,
          left:   c[1] === 'l' ? 7 : undefined,
          right:  c[1] === 'r' ? 7 : undefined,
          borderTop:    c[0] === 't' ? `1px solid ${tick}` : undefined,
          borderBottom: c[0] === 'b' ? `1px solid ${tick}` : undefined,
          borderLeft:   c[1] === 'l' ? `1px solid ${tick}` : undefined,
          borderRight:  c[1] === 'r' ? `1px solid ${tick}` : undefined,
        }} />
      ))}
      <div ref={innerRef} className="relative p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-[11px] uppercase tracking-[0.24em] font-medium"
            style={{ color: lab ? 'rgba(150,185,245,0.78)' : 'var(--accent-soft)' }}>
            {eyebrow}
          </p>
          {chip && (
            <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md flex-shrink-0"
              style={{
                background: lab ? 'rgba(var(--accent-soft-rgb),0.16)' : 'rgba(var(--accent-rgb),0.08)',
                border: lab ? '1px solid rgba(var(--accent-soft-rgb),0.30)' : '1px solid rgba(var(--accent-rgb),0.16)',
                color: lab ? '#9CC2FF' : 'var(--accent)',
              }}>
              {chip}
            </span>
          )}
        </div>
        {children}
        {footer && (
          <div className="mt-4 pt-3.5" style={{ borderTop: lab ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--bd2)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CountUp — every number in the string counts 0 → target on scroll ────────
function CountUp({ value, className, style, duration = 1.1 }: {
  value: string; className?: string; style?: React.CSSProperties; duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const NUM = /-?\d+(?:[.,]\d+)?/g;
    if (!NUM.test(value) || prefersReducedMotion()) { el.textContent = value; return; }
    const render = (p: number) =>
      value.replace(NUM, raw => {
        const target   = parseFloat(raw.replace(',', '.'));
        const decimals = (raw.split(/[.,]/)[1] ?? '').length;
        const sep      = raw.includes(',') ? ',' : '.';
        return (target * p).toFixed(decimals).replace('.', sep);
      });
    el.textContent = render(0);
    const proxy = { p: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(proxy, {
        p: 1, duration, ease: 'power2.out',
        onUpdate()   { el.textContent = render(proxy.p); },
        onComplete() { el.textContent = value; },
      }),
    });
    return () => trigger.kill();
  }, [value, duration]);
  return <span ref={ref} className={`tabular-nums ${className ?? ''}`} style={style}>{value}</span>;
}


// ─── Chapter navigation sidebar ───────────────────────────────────────────────
function ChapterNav({ de, onActiveChange }: { de: boolean; onActiveChange?: (i: number) => void }) {
  const [active, setActive] = useState(-1);
  const LABELS = CHAPTERS;
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
              style={{ color: isActive ? 'var(--accent-soft)' : 'var(--txff)' }}>
              {de ? l.de : l.en}
            </span>
            <div className="relative z-10 rounded-full flex-shrink-0 transition-all duration-300"
              style={{ width: isActive ? '9px' : '5px', height: isActive ? '9px' : '5px', background: isActive ? 'var(--accent-soft)' : 'var(--bd)', boxShadow: isActive ? '0 0 10px rgba(var(--accent-soft-rgb),0.75)' : 'none' }} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Mobile chapter rail — fixed chip nav below the top bar, <xl only ────────
// Reuses the IntersectionObserver state owned by ChapterNav (via SciencePage).
function MobileChapterRail({ de, active }: { de: boolean; active: number }) {
  const railRef = useRef<HTMLDivElement>(null);
  const visible = active >= 0;
  useEffect(() => {
    if (active < 0) return;
    const chip = railRef.current?.querySelector<HTMLElement>(`[data-rail="${active}"]`);
    if (chip && railRef.current) {
      const rail = railRef.current;
      const target = chip.offsetLeft - (rail.clientWidth - chip.clientWidth) / 2;
      rail.scrollTo({ left: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }, [active]);
  return (
    <div
      className="fixed top-14 left-0 right-0 z-30 xl:hidden"
      aria-hidden={!visible}
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--bd)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <div
        ref={railRef}
        className="flex items-stretch gap-1 overflow-x-auto px-2 h-10 hide-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {CHAPTERS.map((ch, i) => {
          const isActive = active === i;
          return (
            <button
              key={ch.n}
              data-rail={i}
              tabIndex={visible ? 0 : -1}
              onClick={() => document.querySelector(`[data-chapter="${ch.n}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="relative flex items-center gap-1.5 px-2.5 whitespace-nowrap flex-shrink-0"
            >
              <span className="font-mono text-[10px] font-bold tabular-nums" style={{ color: isActive ? 'var(--accent)' : 'var(--txff)' }}>
                {ch.n}
              </span>
              <span className="text-[11px] font-medium" style={{ color: isActive ? 'var(--tx1)' : 'var(--txm)' }}>
                {de ? ch.de : ch.en}
              </span>
              <span
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                style={{ background: 'var(--accent)', opacity: isActive ? 1 : 0, transition: 'opacity 0.2s ease' }}
              />
            </button>
          );
        })}
      </div>
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

// ─── Mini-SVG visualizations for StatCallout ─────────────────────────────────
function TempBandViz({ isDark }: { isDark: boolean }) {
  const trackClr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(var(--accent-rgb),0.10)';
  const bandClr   = isDark ? '#3060C8'                : 'var(--accent)';
  const wideClr   = isDark ? 'rgba(var(--accent-soft-rgb),0.22)'  : 'rgba(var(--accent-soft-rgb),0.15)';
  const labelClr  = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(var(--accent-rgb),0.45)';
  const tickClr   = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(var(--accent-rgb),0.30)';
  const toX = (t: number) => ((t - 52) / 18) * 200;
  return (
    <svg viewBox="0 0 220 80" style={{ width: 220, height: 80 }}>
      <rect x="10" y="28" width="200" height="6" rx="3" fill={trackClr} />
      <rect x={10 + toX(55)} y="22" width={toX(65) - toX(55)} height="18" rx="3" fill={wideClr} />
      <rect x={10 + toX(58)} y="20" width={toX(60) - toX(58)} height="22" rx="3" fill={bandClr}
        style={{ filter: isDark ? 'drop-shadow(0 0 6px rgba(48,96,200,0.7))' : 'none' }} />
      {[55, 58, 60, 65].map(t => (
        <g key={t}>
          <line x1={10 + toX(t)} y1="46" x2={10 + toX(t)} y2="52" stroke={tickClr} strokeWidth="0.8" />
          <text x={10 + toX(t)} y="62" textAnchor="middle" fontSize="7" fontFamily="monospace" fill={labelClr}>{t}°</text>
        </g>
      ))}
      <text x={10 + toX(59)} y="14" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill={bandClr} letterSpacing="0.05em">WAXCELERATE</text>
    </svg>
  );
}

function DensityViz({ isDark }: { isDark: boolean }) {
  const parClr   = isDark ? 'rgba(var(--accent-soft-rgb),0.25)'  : 'rgba(var(--accent-soft-rgb),0.15)';
  const parBd    = isDark ? 'rgba(var(--accent-soft-rgb),0.45)'  : 'rgba(var(--accent-soft-rgb),0.40)';
  const mosClr   = isDark ? 'var(--accent)'                : 'var(--accent)';
  const labelClr = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(var(--accent-rgb),0.45)';
  const valClr   = isDark ? 'rgba(255,255,255,0.70)' : 'rgba(var(--accent-strong-rgb),0.75)';
  const rPar = 14, rMos = 36;
  return (
    <svg viewBox="0 0 160 90" style={{ width: 160, height: 90 }}>
      <circle cx="35" cy="45" r={rPar} fill={parClr} stroke={parBd} strokeWidth="1" />
      <text x="35" y="42" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="monospace" fill={labelClr}>Paraffin</text>
      <text x="35" y="51" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontFamily="monospace" fontWeight="700" fill={valClr}>0.9</text>
      <circle cx="108" cy="45" r={rMos} fill={mosClr}
        style={{ filter: isDark ? 'drop-shadow(0 0 10px rgba(var(--accent-rgb),0.55))' : 'drop-shadow(0 3px 8px rgba(var(--accent-rgb),0.25))' }} />
      <text x="108" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="7.5" fontFamily="monospace" fill="rgba(255,255,255,0.75)">MoS₂</text>
      <text x="108" y="51" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontFamily="monospace" fontWeight="700" fill="rgba(255,255,255,0.90)">5.06</text>
      <text x="80" y="84" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill={labelClr}>g/cm³</text>
    </svg>
  );
}

function FrictionLadderViz({ isDark }: { isDark: boolean }) {
  const labelClr = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(var(--accent-rgb),0.45)';
  const dotClr   = isDark ? 'var(--accent-soft)'                : 'var(--accent)';
  const bars = [
    { label: 'Pro',      val: 0.03, color: isDark ? '#3060C8' : 'var(--accent)', glow: true  },
    { label: 'Graphite', val: 0.10, color: isDark ? 'rgba(var(--accent-soft-rgb),0.45)' : 'rgba(var(--accent-rgb),0.35)', glow: false },
    { label: 'Oil',      val: 0.18, color: isDark ? 'rgba(var(--accent-soft-rgb),0.22)' : 'rgba(var(--accent-rgb),0.18)', glow: false },
  ];
  const scale = 160 / 0.25;
  return (
    <svg viewBox="0 0 200 80" style={{ width: 200, height: 80 }}>
      {bars.map((b, i) => {
        const barW = b.val * scale;
        const y = 12 + i * 22;
        return (
          <g key={i}>
            <circle cx="8" cy={y + 5} r="3" fill={dotClr} opacity={b.glow ? 1 : 0.4}
              style={b.glow ? { filter: `drop-shadow(0 0 4px ${b.color})` } : undefined} />
            <rect x="14" y={y} width={barW} height="10" rx="2" fill={b.color}
              style={b.glow ? { filter: isDark ? `drop-shadow(0 0 6px rgba(48,96,200,0.65))` : 'none' } : undefined} />
            <text x={14 + barW + 5} y={y + 7} dominantBaseline="middle" fontSize="6.5" fontFamily="monospace" fill={labelClr}>{b.label}</text>
          </g>
        );
      })}
      <text x="14" y="75" fontSize="6.5" fontFamily="monospace" fill={labelClr}>μ →</text>
    </svg>
  );
}

// ─── Stat callout — clean divider section ────────────────────────────────────
function StatCallout({ stat, ctxDe, ctxEn, de, isDark, miniViz }: {
  stat: string; ctxDe: string; ctxEn: string; de: boolean; isDark: boolean;
  miniViz?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) {
      gsap.set([ref.current, numRef.current], { opacity: 1, y: 0, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: EASE.enter,
          scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } },
      );
      if (numRef.current) {
        gsap.fromTo(numRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)', delay: 0.2,
            scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } },
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div
      ref={ref}
      className="w-full py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 px-6"
      style={{
        background: isDark ? '#07070A' : 'var(--sf2)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--bd)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--bd)',
      }}
    >
      <div className="flex flex-col items-center sm:items-start">
        <p ref={numRef} className="font-display font-bold leading-none select-none tabular-nums"
          style={{
            fontSize: 'clamp(3rem,7vw,4.8rem)',
            color: 'var(--accent)',
            letterSpacing: '-0.03em',
          }}>
          <CountUp value={stat} duration={1.3} />
        </p>
        <p className="text-[11px] uppercase tracking-[0.24em] mt-4 max-w-[420px] leading-relaxed text-center sm:text-left"
          style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'var(--txm)' }}>
          {de ? ctxDe : ctxEn}
        </p>
      </div>
      {miniViz && (
        <div className="flex-shrink-0 scale-[0.85] sm:scale-100" aria-hidden="true">
          {miniViz}
        </div>
      )}
    </div>
  );
}

// ─── Formula Assembly System Map ─────────────────────────────────────────────
// Living radial diagram with persistent ambient animations after assembly:
//   • Zone rings breathe independently (different periods/phases)
//   • MoS₂ S–Mo–S layers shear continuously (demonstrating μ=0.03 mechanism)
//   • Expanding pulse ring from MoS₂ every ~4 seconds
//   • Protective edges (Dispersant, Antioxidant) have flowing dashes toward MoS₂
//   • Carrier particle travels Paraffin→MoS₂ edge (material transport)
//
// Each node contains a micro-visualization of its actual physical mechanism.
// Edges: solid = structural/physical · dashed = chemical/protective
// Assembly animation follows scientific order: MoS₂ → Paraffin → matrix modifiers → stabilizers

const GRAPH_CX = 320;
const GRAPH_CY = 260;

const ASSEMBLY_NODES = [
  {
    id: 1, labelDe: 'Paraffin',     labelEn: 'Paraffin',
    subDe: 'Trägermatrix',   subEn: 'Base scaffold',
    whyDe: 'C₂₀–C₃₆ Ketten kristallisieren zu lamellaren Domänen · enger 2°C-Bereich sichert Batch-Konsistenz',
    whyEn: 'C₂₀–C₃₆ chains crystallize into lamellar domains · narrow 2°C window ensures batch consistency',
    cx: 320, cy: 112, r: 32, metric: '58–60°C',
  },
  {
    id: 2, labelDe: 'FT-Wachs',     labelEn: 'FT-Wax',
    subDe: 'Härtemodul',     subEn: 'Hardener',
    whyDe: 'Ko-kristallisiert mit Paraffin · defektärmere Domänen brauchen mehr Energie zum Schmelzen → Tropfpunkt 72–78°C',
    whyEn: 'Co-crystallizes with paraffin · more defect-free domains need more energy to melt → drop point 72–78°C',
    cx: 154, cy: 88, r: 28, metric: '+14°C',
  },
  {
    id: 3, labelDe: 'Mikrokris.',    labelEn: 'Microcris.',
    subDe: 'Kälteflex.',     subEn: 'Cold flex.',
    whyDe: 'Verzweigte Moleküle füllen amorphe Zonen · Matrix bleibt bis −10°C elastisch · bettet MoS₂-Partikel ein',
    whyEn: 'Branched molecules fill amorphous zones · matrix stays elastic to −10°C · mechanically embeds MoS₂',
    cx: 486, cy: 88, r: 28, metric: '−10°C',
  },
  {
    id: 4, labelDe: 'MoS₂',         labelEn: 'MoS₂',
    subDe: 'Festschmierst.', subEn: 'Solid lubricant',
    whyDe: '50–300 MPa Kontaktdruck → Fe–S Transferfilm auf Stahl · aktiv auch nachdem das Wachs abgetragen ist · hexagonales Kristallsystem (P6₃/mmc)',
    whyEn: '50–300 MPa contact pressure → Fe–S transfer film on steel · active long after the wax is spent · hexagonal crystal system (P6₃/mmc)',
    cx: GRAPH_CX, cy: GRAPH_CY, r: 48,  metric: 'μ 0.03',
  },
  {
    id: 5, labelDe: 'Dispergierm.', labelEn: 'Dispersant',
    subDe: 'Partikelstab.',  subEn: 'Particle stab.',
    whyDe: 'Amphiphile Fettsäurehülle direkt um jeden MoS₂-Partikel · verhindert Sedimentation · MoS₂ ist 5,6× dichter als Paraffin',
    whyEn: 'Amphiphilic fatty acid shell directly around each MoS₂ particle · prevents sedimentation · MoS₂ is 5.6× denser than paraffin',
    cx: 214, cy: 358, r: 28, metric: '5.6×',
  },
  {
    id: 6, labelDe: 'Antioxidans',  labelEn: 'Antioxidant',
    subDe: 'MoO₃-Schutz',   subEn: 'MoO₃ shield',
    whyDe: 'Phenolische OH-Gruppe bricht Autoxidationskette (ROO•) · verhindert MoS₂→MoO₃-Umwandlung · 12 Monate Lagerstab.',
    whyEn: 'Phenolic OH group breaks autoxidation chain (ROO•) · prevents MoS₂→MoO₃ conversion · 12-month shelf life',
    cx: 426, cy: 358, r: 28, metric: '12 Mo.',
  },
] as const;

// dash=true: chemical/protective bond · main=true: primary delivery spine · weight: visual thickness
const ASSEMBLY_EDGES = [
  { from: 2, to: 1, labelDe: 'Ko-Kristallisation',   labelEn: 'co-crystallises',   dash: false, main: false, weight: 1.6 },
  { from: 3, to: 1, labelDe: 'Plastifiziert',         labelEn: 'plasticises',       dash: false, main: false, weight: 1.4 },
  { from: 1, to: 4, labelDe: 'Trägermatrix',           labelEn: 'carrier matrix',    dash: false, main: true,  weight: 5.0 },
  { from: 3, to: 4, labelDe: 'Partikeleinbettung',    labelEn: 'particle embedding', dash: false, main: false, weight: 1.4 },
  { from: 5, to: 4, labelDe: 'Sterische Hülle',       labelEn: 'steric shell',       dash: true,  main: false, weight: 1.8 },
  { from: 6, to: 4, labelDe: 'Oxidationsschutz',      labelEn: 'oxidation guard',    dash: true,  main: false, weight: 1.8 },
] as const;

// Returns bezier path + label position + raw control points (for particle animation)
function curvedEdge(ax: number, ay: number, bx: number, by: number, ra: number, rb: number) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const x1 = ax + ux * (ra + 5), y1 = ay + uy * (ra + 5);
  const x2 = bx - ux * (rb + 6), y2 = by - uy * (rb + 6);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const cpx = mx - (GRAPH_CX - mx) * 0.28;
  const cpy = my - (GRAPH_CY - my) * 0.28;
  const lx = 0.25 * x1 + 0.5 * cpx + 0.25 * x2;
  const ly = 0.25 * y1 + 0.5 * cpy + 0.25 * y2;
  const ex = x2 - x1, ey = y2 - y1, el = Math.sqrt(ex * ex + ey * ey);
  const px = -ey / el, py = ex / el;
  const sign = (px * (GRAPH_CX - lx) + py * (GRAPH_CY - ly)) <= 0 ? 1 : -1;
  return { path: `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`, lx: lx + sign * px * 15, ly: ly + sign * py * 15, len, x1, y1, x2, y2, cpx, cpy };
}

// ── Node micro-visualizations — each shows the physical/chemical mechanism ──
function NodeMechViz({ id, cx, cy, isDark, isHot }: { id: number; cx: number; cy: number; isDark: boolean; isHot: boolean }) {
  const base = isDark ? 'rgba(130,175,255,0.22)' : 'rgba(var(--accent-rgb),0.16)';
  const hot  = isDark ? 'rgba(160,205,255,0.40)' : 'rgba(var(--accent-rgb),0.30)';
  const c = isHot ? hot : base;

  if (id === 1) {
    // Paraffin: lamellar crystal structure — parallel aligned chains
    return (
      <g>
        {[-7, -2, 3, 8].map((dy, i) => (
          <line key={i}
            x1={cx - 14 + (i % 2) * 2} y1={cy + dy}
            x2={cx + 14 - (i % 2) * 2} y2={cy + dy}
            stroke={c} strokeWidth={1.6} strokeLinecap="round" />
        ))}
      </g>
    );
  }
  if (id === 2) {
    // FT-Wachs: temperature lift — upward arrow with baseline
    return (
      <g>
        <line x1={cx} y1={cy + 8} x2={cx} y2={cy - 7} stroke={c} strokeWidth={1.4} />
        <polyline points={`${cx - 4},${cy - 4} ${cx},${cy - 10} ${cx + 4},${cy - 4}`}
          stroke={c} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
        <line x1={cx - 6} y1={cy + 8} x2={cx + 6} y2={cy + 8} stroke={c} strokeWidth={1.2} />
      </g>
    );
  }
  if (id === 3) {
    // Mikrokris.: amorphous structure — irregular scattered dots
    return (
      <g>
        {[[-9,-4,2.2],[5,-7,2.8],[-3,2,2],[8,5,2.5],[0,-9,1.8],[-7,6,2]].map(([dx,dy,r],i) => (
          <circle key={i} cx={cx+dx} cy={cy+dy} r={r} fill={c} />
        ))}
      </g>
    );
  }
  if (id === 5) {
    // Dispersant: steric coating — central particle + amphiphilic shell
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill={c} />
        <circle cx={cx} cy={cy} r={13} fill="none" stroke={c} strokeWidth={1.2} strokeDasharray="2.5 2" />
        <circle cx={cx} cy={cy} r={18} fill="none" stroke={c} strokeWidth={0.7} opacity={0.6} />
      </g>
    );
  }
  if (id === 6) {
    // Antioxidant: radical chain break — shield arc + intercepted radical
    return (
      <g>
        <path d={`M${cx - 10},${cy + 2} Q${cx},${cy - 12} ${cx + 10},${cy + 2}`}
          fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
        <line x1={cx} y1={cy + 2} x2={cx} y2={cy + 9} stroke={c} strokeWidth={1.4} />
        <circle cx={cx} cy={cy + 11} r={2.2} fill={c} opacity={0.7} />
      </g>
    );
  }
  return null;
}

// Returns SVG polygon points string for a regular hexagon (pointy-top)
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (-90 + 60 * i); // start from top
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

// ─── FormulaSpine — mobile (<sm) vertical card layout replacing unreadable radial ─
// MoS₂ hero at top, 5 component cards connected by accent spine + relation chips.
const SPINE_ITEMS: readonly { nodeIdx: number; edgeIdx: number }[] = [
  { nodeIdx: 3, edgeIdx: -1 },  // MoS₂ (hero)
  { nodeIdx: 0, edgeIdx: 2  },  // Paraffin ← Trägermatrix
  { nodeIdx: 1, edgeIdx: 0  },  // FT-Wachs ← Ko-Kristallisation
  { nodeIdx: 2, edgeIdx: 1  },  // Mikrokris. ← Plastifiziert
  { nodeIdx: 4, edgeIdx: 4  },  // Dispersant ← Sterische Hülle
  { nodeIdx: 5, edgeIdx: 5  },  // Antioxidant ← Oxidationsschutz
];

function FormulaSpine({ de, isDark }: { de: boolean; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia({
        '(max-width: 639px)': () => {
          const spine = ref.current?.querySelector<HTMLDivElement>('[data-spine]');
          if (spine) {
            gsap.fromTo(spine, { scaleY: 0 }, {
              scaleY: 1, ease: 'none',
              scrollTrigger: { trigger: ref.current!, start: 'top 85%', end: 'bottom 50%', scrub: 0.6 },
            });
          }
          const cards = ref.current?.querySelectorAll<HTMLDivElement>('[data-spine-card]');
          if (cards?.length) {
            gsap.set(cards, { opacity: 0, y: 24 });
            ScrollTrigger.create({
              trigger: ref.current!,
              start: 'top 80%',
              once: true,
              onEnter: () => {
                gsap.to(cards, { opacity: 1, y: 0, duration: DUR.standard, ease: 'back.out(1.4)', stagger: 0.10 });
              },
            });
          }
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative sm:hidden pl-6">
      <div data-spine className="absolute left-[18px] top-4 bottom-4 w-[2px] origin-top rounded-full"
        style={{ background: 'linear-gradient(to bottom, var(--accent), rgba(var(--accent-rgb),0.12))' }} />
      {SPINE_ITEMS.map((item, i) => {
        const node = ASSEMBLY_NODES[item.nodeIdx];
        const edge = item.edgeIdx >= 0 ? ASSEMBLY_EDGES[item.edgeIdx] : null;
        const isHero = i === 0;
        return (
          <div key={node.id}>
            {edge && (
              <div className="relative flex items-center gap-2 py-3 pl-6">
                <div className="absolute left-[14px] w-[9px] h-[9px] rounded-full border-2"
                  style={{ borderColor: 'var(--accent-soft)', background: isDark ? '#090909' : 'var(--pg)' }} />
                <span className="text-[11px] font-mono tracking-wide"
                  style={{ color: isDark ? 'rgba(160,195,248,0.55)' : 'rgba(var(--accent-rgb),0.50)' }}>
                  {de ? edge.labelDe : edge.labelEn}
                </span>
              </div>
            )}
            <div data-spine-card className="relative ml-5 rounded-xl overflow-hidden"
              style={isHero
                ? { background: '#0E1626', border: '1px solid rgba(var(--accent-soft-rgb),0.25)', padding: '20px' }
                : { background: 'var(--sf2)', border: '1px solid var(--bd)', padding: '14px 16px' }}>
              <div className="absolute -left-[21px] top-1/2 w-[21px] h-[2px]"
                style={{ background: isHero ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.25)' }} />
              {isHero ? (<>
                <div className="flex items-center gap-3 mb-3">
                  <svg viewBox="0 0 30 30" className="w-6 h-6 flex-shrink-0">
                    <polygon points={hexPoints(15, 15, 13)} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[11px] uppercase tracking-[0.24em] font-medium"
                    style={{ color: 'rgba(150,185,245,0.78)' }}>MoS₂</span>
                </div>
                <CountUp value="μ 0.03" className="font-display italic text-[40px] font-bold leading-none"
                  style={{ color: '#6A8AE8', textShadow: '0 0 24px rgba(var(--accent-soft-rgb),0.55)' }} />
                <p className="text-[12px] font-mono mt-2" style={{ color: 'rgba(168,192,244,0.55)' }}>
                  {'< 5 µm · 5.06 g/cm³'}
                </p>
              </>) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CountUp value={node.metric} className="font-display text-[17px] font-bold leading-none"
                      style={{ color: isDark ? '#88bbff' : '#1a3c8e' }} />
                    <p className="text-[13px] font-semibold mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.60)' : 'var(--tx1)' }}>
                      {de ? node.labelDe : node.labelEn}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono flex-shrink-0"
                    style={{ color: isDark ? 'rgba(140,180,240,0.42)' : 'rgba(var(--accent-rgb),0.48)' }}>
                    {de ? node.subDe : node.subEn}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FormulaAssembly({ de, mode, isDark }: { de: boolean; mode: 'overview' | 'synthesis'; isDark: boolean }) {
  const svgRef        = useRef<SVGSVGElement>(null);
  const edgeRefs      = useRef<(SVGPathElement | null)[]>([]);
  const nodeRefs      = useRef<(SVGGElement | null)[]>([]);
  const vignetteRef    = useRef<SVGGElement | null>(null);
  const didAnimate     = useRef(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [canHover,    setCanHover]    = useState(mode === 'overview');

  const isOverview = mode === 'overview';
  const uid = `fa-${mode}-${isDark ? 'd' : 'l'}`;

  // ── Color system (uniform cobalt — clean, professional) ───────────────────
  const nodeGradA   = isDark ? '#1c3060' : '#f0f5ff';
  const nodeGradB   = isDark ? '#090f28' : '#d0e0f8';
  const nodeStroke  = isDark ? 'rgba(68,120,220,0.55)' : 'rgba(var(--accent-rgb),0.70)';
  const nodeStrokeH = isDark ? '#7ab0ff' : '#1535a0';

  const metricClr   = isDark ? '#88bbff' : '#1a3c8e';
  const subClr      = isDark ? 'rgba(140,180,240,0.42)' : 'rgba(var(--accent-rgb),0.48)';

  // Zone fills — innermost = most saturated (closest functional relationship to MoS₂)
  const z1Fill = isDark ? 'rgba(40,68,155,0.32)' : 'rgba(var(--accent-soft-rgb),0.12)';   // Inner: protective agents
  const z2Fill = isDark ? 'rgba(28,50,115,0.18)' : 'rgba(var(--accent-soft-rgb),0.07)';   // Mid: carrier
  const z3Fill = isDark ? 'rgba(18,34,80,0.10)'  : 'rgba(var(--accent-soft-rgb),0.035)';  // Outer: matrix modifiers
  const ringClr = isDark ? 'rgba(100,140,220,0.14)' : 'rgba(var(--accent-rgb),0.12)';

  // Edge colors — structural vs protective
  const edgeSolid  = isDark ? 'rgba(80,130,230,0.55)' : 'rgba(var(--accent-rgb),0.42)';
  const edgeDash   = isDark ? 'rgba(80,130,230,0.38)' : 'rgba(var(--accent-rgb),0.28)';
  const edgeHot    = isDark ? 'rgba(140,190,255,0.95)' : '#1a3c8e';
  const edgeLblClr = isDark ? 'rgba(160,200,255,0.52)' : 'rgba(26,60,130,0.48)';

  // ── Hover adjacency ───────────────────────────────────────────────────────
  const connected: Set<number> | null = hoveredNode !== null ? (() => {
    const s = new Set([hoveredNode]);
    ASSEMBLY_EDGES.forEach(e => {
      if (e.from === hoveredNode) s.add(e.to);
      if (e.to   === hoveredNode) s.add(e.from);
    });
    return s;
  })() : null;

  const nodeOpacity  = (id: number) => !canHover || !connected ? 1 : connected.has(id) ? 1 : 0.15;
  const isEdgeHot    = (f: number, t: number) => canHover && !!connected && connected.has(f) && connected.has(t);
  const isEdgeDimmed = (f: number, t: number) => canHover && !!connected && !(connected.has(f) && connected.has(t));

  // ── Scientific assembly story animation ───────────────────────────────────
  useEffect(() => {
    if (mode !== 'synthesis' || didAnimate.current) return;
    if (prefersReducedMotion()) {
      // Skip the choreography — everything visible & interactive immediately
      didAnimate.current = true;
      setCanHover(true);
      nodeRefs.current.forEach(n => { if (n) gsap.set(n, { opacity: 1, scale: 1, x: 0, y: 0 }); });
      edgeRefs.current.forEach(e => { if (e) gsap.set(e, { strokeDashoffset: 0, opacity: 1 }); });
      return;
    }
    const ctx = gsap.context(() => {
      const mos2 = ASSEMBLY_NODES[3]; // idx 3

      // All start hidden
      gsap.set(nodeRefs.current[3], { opacity: 0, scale: 0, svgOrigin: `${mos2.cx} ${mos2.cy}` });
      ASSEMBLY_NODES.forEach((node, i) => {
        if (i === 3) return;
        gsap.set(nodeRefs.current[i], { opacity: 0, x: mos2.cx - node.cx, y: mos2.cy - node.cy });
      });
      edgeRefs.current.forEach(e => { if (e) gsap.set(e, { strokeDashoffset: 1, opacity: 0 }); });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: svgRef.current, start: 'top 80%', once: true },
        onComplete: () => { didAnimate.current = true; setCanHover(true); },
      });

      // 1. MoS₂ crystallizes — the REASON for the entire formula
      tl.to(nodeRefs.current[3], { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2.0)', svgOrigin: `${mos2.cx} ${mos2.cy}` });

      // 2. Paraffin carrier arrives from above
      tl.to(nodeRefs.current[0], { opacity: 1, x: 0, y: 0, duration: 0.55, ease: 'power3.out' }, '>-0.15');

      // 3. The carrier-to-active edge draws — the foundation of the system
      tl.to(edgeRefs.current[2], { strokeDashoffset: 0, opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '>0.05');

      // 4. FT-Wachs co-crystallizes into the Paraffin lattice
      tl.to(nodeRefs.current[1], { opacity: 1, x: 0, y: 0, duration: 0.50, ease: 'power3.out' }, '>-0.1');
      tl.to(edgeRefs.current[0], { strokeDashoffset: 0, opacity: 1, duration: 0.40, ease: 'power2.inOut' }, '<0.1');

      // 5. Mikrokris. fills the amorphous zones
      tl.to(nodeRefs.current[2], { opacity: 1, x: 0, y: 0, duration: 0.50, ease: 'power3.out' }, '<0.0');
      tl.to(edgeRefs.current[1], { strokeDashoffset: 0, opacity: 1, duration: 0.38, ease: 'power2.inOut' }, '<0.08');
      tl.to(edgeRefs.current[3], { strokeDashoffset: 0, opacity: 1, duration: 0.38, ease: 'power2.inOut' }, '<0.06');

      // 6. Dispersant coats each particle
      tl.to(nodeRefs.current[4], { opacity: 1, x: 0, y: 0, duration: 0.50, ease: 'power3.out' }, '>0.05');
      tl.to(edgeRefs.current[4], { strokeDashoffset: 0, opacity: 1, duration: 0.45, ease: 'power2.inOut' }, '<0.12');

      // 7. Antioxidant shields the system
      tl.to(nodeRefs.current[5], { opacity: 1, x: 0, y: 0, duration: 0.50, ease: 'power3.out' }, '<0.0');
      tl.to(edgeRefs.current[5], { strokeDashoffset: 0, opacity: 1, duration: 0.45, ease: 'power2.inOut' }, '<0.12');

      // 8. MoS₂ pulses — formula is complete and live
      tl.to(nodeRefs.current[3], { scale: 1.10, duration: 0.22, ease: 'power2.out', svgOrigin: `${mos2.cx} ${mos2.cy}` }, '>0.15');
      tl.to(nodeRefs.current[3], { scale: 1.00, duration: 0.55, ease: 'elastic.out(1, 0.55)', svgOrigin: `${mos2.cx} ${mos2.cy}` });

      // 9. "So what" vignette — chain link + performance stat briefly appear
      if (vignetteRef.current) {
        tl.to(vignetteRef.current, { opacity: 1, duration: 0.45, ease: 'power2.out' }, '>0.2');
        tl.to(vignetteRef.current, { opacity: 0, duration: 0.65, ease: 'power2.in' }, '>3.2');
      }
    }, svgRef);
    return () => ctx.revert();
  }, [mode]);

  // Ambient looping animations removed — after assembly the graph stays still.

  const hovNode = ASSEMBLY_NODES.find(n => n.id === hoveredNode) ?? null;

  return (
    <div className="w-full select-none">
      <FormulaSpine de={de} isDark={isDark} />
      <svg
        ref={svgRef}
        viewBox="0 0 640 430"
        className="w-full hidden sm:block"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Shared satellite gradient */}
          <radialGradient id={`${uid}-ng`} cx="34%" cy="28%" r="72%">
            <stop offset="0%"   stopColor={nodeGradA} />
            <stop offset="100%" stopColor={nodeGradB} />
          </radialGradient>
          {/* MoS₂ cobalt gradient */}
          <radialGradient id={`${uid}-mg`} cx="30%" cy="24%" r="74%">
            <stop offset="0%"   stopColor={isDark ? '#2456cc' : '#2c5acc'} />
            <stop offset="100%" stopColor={isDark ? '#05102a' : '#08144a'} />
          </radialGradient>
          {/* Arrowheads */}
          <marker id={`${uid}-ao`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={edgeSolid} />
          </marker>
          <marker id={`${uid}-ad`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={edgeDash} />
          </marker>
          <marker id={`${uid}-as`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={edgeSolid} />
          </marker>
          <marker id={`${uid}-asd`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={edgeDash} />
          </marker>
          <marker id={`${uid}-ah`} markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto">
            <path d="M0,0.5 L0,5.5 L5.5,3 z" fill={edgeHot} />
          </marker>
          {/* Main carrier edge — larger arrowhead to match heavier stroke */}
          <marker id={`${uid}-am`} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill={isDark ? 'rgba(80,130,230,0.70)' : 'rgba(var(--accent-rgb),0.55)'} />
          </marker>
          {/* Edge glow filter */}
          <filter id={`${uid}-eg`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── Zone fills: inner=protective agents, mid=carrier, outer=matrix modifiers ── */}
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={245} fill={z3Fill} />
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={195} fill={z2Fill} />
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={144} fill={z1Fill} />

        {/* ── Zone ring borders (static) ── */}
        <circle
          cx={GRAPH_CX} cy={GRAPH_CY} r={144} fill="none" stroke={ringClr} strokeWidth={0.9} strokeDasharray="4 6" />
        <circle
          cx={GRAPH_CX} cy={GRAPH_CY} r={245} fill="none" stroke={ringClr} strokeWidth={0.9} strokeDasharray="4 6" />

        {/* ── "So what" vignette — friction comparison bars, appear after full assembly ── */}
        {/* Positions: centered at GRAPH_CX, rows at GRAPH_CY+62, +76, +90 */}
        {(() => {
          const vx = GRAPH_CX - 72;  // bar left edge
          const maxW = 120;           // max bar width at μ=0.18
          const scale = maxW / 0.18;  // px per μ unit
          const bars = [
            { label: de ? 'Waxcelerate' : 'Waxcelerate', mu: 0.03, isThis: true  },
            { label: de ? 'Graphit'     : 'Graphite',    mu: 0.10, isThis: false },
            { label: de ? 'Kettenöl'    : 'Chain oil',   mu: 0.18, isThis: false },
          ];
          const accentFill = isDark ? 'rgba(80,130,230,0.80)' : 'rgba(var(--accent-rgb),0.65)';
          const dimFill    = isDark ? 'rgba(80,130,230,0.22)' : 'rgba(var(--accent-rgb),0.16)';
          const textClr    = isDark ? 'rgba(180,210,255,0.80)' : 'rgba(var(--accent-rgb),0.75)';
          const muClr      = isDark ? 'rgba(140,180,255,0.65)' : 'rgba(var(--accent-rgb),0.55)';
          return (
            <g ref={vignetteRef} opacity={0} style={{ pointerEvents: 'none' }}>
              {/* Title */}
              <text x={GRAPH_CX} y={GRAPH_CY + 54} textAnchor="middle"
                fontSize="6.5" fontFamily="monospace" letterSpacing="0.18em"
                fill={isDark ? 'rgba(160,200,255,0.45)' : 'rgba(42,80,160,0.38)'}>
                {de ? 'REIBUNGSKOEFF.' : 'FRICTION COEFF.'}
              </text>
              {bars.map((b, idx) => {
                const y  = GRAPH_CY + 63 + idx * 16;
                const bw = b.mu * scale;
                return (
                  <g key={idx}>
                    {/* Track */}
                    <rect x={vx} y={y} width={maxW} height={7} rx={2}
                      fill={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(var(--accent-rgb),0.06)'} />
                    {/* Bar fill */}
                    <rect x={vx} y={y} width={bw} height={7} rx={2}
                      fill={b.isThis ? accentFill : dimFill}
                      style={b.isThis ? { filter: isDark ? 'drop-shadow(0 0 4px rgba(80,130,230,0.6))' : 'none' } : undefined} />
                    {/* Label */}
                    <text x={vx + maxW + 6} y={y + 4} dominantBaseline="middle"
                      fontSize="7" fontFamily="monospace" fill={textClr}>
                      {b.label}
                    </text>
                    {/* μ value */}
                    <text x={vx - 4} y={y + 4} textAnchor="end" dominantBaseline="middle"
                      fontSize="6.5" fontFamily="monospace" fill={b.isThis ? accentFill : muClr}>
                      {b.mu.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              {/* μ axis label */}
              <text x={vx + maxW / 2} y={GRAPH_CY + 114} textAnchor="middle"
                fontSize="6" fontFamily="monospace" letterSpacing="0.12em"
                fill={isDark ? 'rgba(140,180,255,0.30)' : 'rgba(42,80,160,0.28)'}>
                μ →  {de ? '(niedriger = besser)' : '(lower = better)'}
              </text>
            </g>
          );
        })()}

        {/* Zone labels removed — spatial position + fill intensity encodes meaning.
            Inner zone (darker): protective agents · Outer zone (lighter): matrix modifiers */}

        {/* ── Edges ── */}
        {ASSEMBLY_EDGES.map((edge, i) => {
          const a      = ASSEMBLY_NODES[edge.from - 1];
          const b      = ASSEMBLY_NODES[edge.to - 1];
          const { path, lx, ly } = curvedEdge(a.cx, a.cy, b.cx, b.cy, a.r, b.r);
          const label  = de ? edge.labelDe : edge.labelEn;
          const hot    = isEdgeHot(edge.from, edge.to);
          const dimmed = isEdgeDimmed(edge.from, edge.to);
          const isMain = edge.main && !isOverview;

          const baseStroke = edge.dash ? edgeDash : edgeSolid;
          const mainStroke = isDark ? 'rgba(80,130,230,0.65)' : 'rgba(var(--accent-rgb),0.50)';
          const stroke = hot ? edgeHot : isMain ? mainStroke : (isOverview ? (isDark ? 'rgba(80,130,230,0.28)' : 'rgba(var(--accent-rgb),0.18)') : baseStroke);
          const sw     = hot ? 2.9 : isOverview ? 1.0 : edge.weight + 0.4;
          const dashArr = (!hot && edge.dash && !isOverview) ? '5 3.5' : undefined;
          const arrow  = hot
            ? `url(#${uid}-ah)`
            : isMain
              ? `url(#${uid}-am)`
              : isOverview
                ? (edge.dash ? `url(#${uid}-ad)` : `url(#${uid}-ao)`)
                : (edge.dash ? `url(#${uid}-asd)` : `url(#${uid}-as)`);
          const edgePathId = `${uid}-ep-${i}`;

          return (
            <g key={i} style={{ opacity: dimmed ? 0.08 : 1, transition: 'opacity 0.22s ease' }}>
              {/* Ghost path for textPath reference (no stroke, not animated) */}
              {!isOverview && !isMain && (
                <path id={edgePathId} d={path} fill="none" stroke="none" />
              )}
              {/* Main edge stroke — main carrier gets glow filter */}
              <path
                ref={el => { edgeRefs.current[i] = el; }}
                d={path}
                pathLength="1"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeDasharray={dashArr}
                fill="none"
                markerEnd={arrow}
                filter={isMain && !hot ? `url(#${uid}-eg)` : undefined}
                style={mode === 'synthesis'
                  ? { strokeDasharray: dashArr ?? 1, strokeDashoffset: 1, opacity: 0, transition: 'stroke 0.2s, stroke-width 0.2s' }
                  : { transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
              {/* Inline edge label — tiny text at midpoint, no pill box */}
              {!isOverview && !isMain && !hot && (
                <text style={{ pointerEvents: 'none' }}>
                  <textPath
                    href={`#${edgePathId}`}
                    startOffset="50%"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="monospace"
                    letterSpacing="0.04em"
                    fill={edgeLblClr}
                    dy={edge.dash ? -6 : -5}
                  >
                    {label}
                  </textPath>
                </text>
              )}
              {/* Hot state: floating label (clearer on hover) */}
              {!isOverview && hot && (
                <g transform={`translate(${lx},${ly})`} style={{ pointerEvents: 'none' }}>
                  <text x={0} y={0} textAnchor="middle" dominantBaseline="middle"
                    fontSize="10" fontFamily="monospace" letterSpacing="0.04em"
                    fill={edgeHot}>
                    {label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {ASSEMBLY_NODES.map((node, i) => {
          const isMos    = node.id === 4;
          const isHot    = canHover && hoveredNode === node.id;
          const subAbove = node.id <= 3;
          const scaleVal = isHot ? (isMos ? 1.07 : 1.10) : 1;

          return (
            <g
              key={node.id}
              ref={el => { nodeRefs.current[i] = el as SVGGElement; }}
              style={{
                opacity: (mode === 'synthesis' && !canHover) ? 0 : nodeOpacity(node.id),
                transition: canHover ? 'opacity 0.22s ease' : 'none',
                cursor: canHover ? 'pointer' : 'default',
              }}
              onPointerEnter={() => canHover && setHoveredNode(node.id)}
              onPointerLeave={() => canHover && setHoveredNode(null)}
            >
              {/* MoS₂ halo rings */}
              {isMos && (<>
                <polygon points={hexPoints(node.cx, node.cy, node.r + 16)} fill="none"
                  stroke={isDark ? 'rgba(var(--accent-soft-rgb),0.18)' : 'rgba(var(--accent-rgb),0.12)'} strokeWidth={1} />
                <polygon points={hexPoints(node.cx, node.cy, node.r + 30)} fill="none"
                  stroke={isDark ? 'rgba(var(--accent-soft-rgb),0.07)' : 'rgba(var(--accent-rgb),0.05)'} strokeWidth={0.8} />
              </>)}

              {/* Main shape: hexagon for MoS₂ (actual P6₃/mmc crystal system), circle for satellites */}
              {isMos ? (
                <polygon
                  points={hexPoints(node.cx, node.cy, node.r)}
                  fill={`url(#${uid}-mg)`}
                  stroke={isHot ? nodeStrokeH : (isDark ? '#3d6ad4' : '#2a56c4')}
                  strokeWidth={isHot ? 2.8 : 2.2}
                  style={{
                    transform: `scale(${scaleVal})`,
                    transformOrigin: `${node.cx}px ${node.cy}px`,
                    transition: 'transform 0.24s ease, stroke 0.2s',
                    filter: `drop-shadow(0 0 ${isHot ? 22 : 14}px rgba(55,100,215,${isHot ? 0.88 : 0.58}))`,
                  }}
                />
              ) : (
                <>
                  {/* Chemical-agent nodes (Dispersant id=5, Antioxidant id=6) get a dashed outer ring
                      encoding: "this is a chemical agent wrapping/protecting the core particle" */}
                  {(node.id === 5 || node.id === 6) && (
                    <circle
                      cx={node.cx} cy={node.cy} r={node.r + 11}
                      fill="none"
                      stroke={isHot ? nodeStrokeH : (isDark ? 'rgba(100,150,230,0.38)' : 'rgba(var(--accent-rgb),0.30)')}
                      strokeWidth={1.2}
                      strokeDasharray="3 3"
                      style={{
                        transform: `scale(${scaleVal})`,
                        transformOrigin: `${node.cx}px ${node.cy}px`,
                        transition: 'transform 0.24s ease, stroke 0.2s',
                      }}
                    />
                  )}
                  <circle
                    cx={node.cx} cy={node.cy} r={node.r}
                    fill={`url(#${uid}-ng)`}
                    stroke={isHot ? nodeStrokeH : nodeStroke}
                    strokeWidth={isHot ? 2.6 : 2.0}
                    style={{
                      transform: `scale(${scaleVal})`,
                      transformOrigin: `${node.cx}px ${node.cy}px`,
                      transition: 'transform 0.24s ease, stroke 0.2s',
                      filter: isHot
                        ? (isDark ? 'drop-shadow(0 0 10px rgba(68,120,240,0.55))' : 'drop-shadow(0 2px 10px rgba(var(--accent-rgb),0.25))')
                        : 'none',
                    }}
                  />
                </>
              )}

              {/* ── Mechanism micro-visualization ── */}
              {!isMos && !isOverview && (
                <NodeMechViz id={node.id} cx={node.cx} cy={node.cy} isDark={isDark} isHot={isHot} />
              )}

              {/* MoS₂ content: S–Mo–S layer hint + μ 0.03 + spec */}
              {isMos && (<>
                {/* S-Mo-S layered crystal hint (two subtle horizontal bands) */}
                {!isOverview && (
                  <g opacity={0.38}>
                    {/* Top S layer */}
                    <rect
                      x={node.cx - 21} y={node.cy - 11} width={42} height={5.5} rx={2.5}
                      fill={isDark ? 'rgba(150,195,255,0.50)' : 'rgba(180,210,255,0.65)'} />
                    {/* Mo layer — middle */}
                    <rect
                      x={node.cx - 19} y={node.cy - 3.5} width={38} height={4} rx={1.5}
                      fill={isDark ? 'rgba(100,155,255,0.65)' : 'rgba(140,180,255,0.75)'} />
                    {/* Bottom S layer */}
                    <rect
                      x={node.cx - 21} y={node.cy + 2} width={42} height={5.5} rx={2.5}
                      fill={isDark ? 'rgba(150,195,255,0.50)' : 'rgba(180,210,255,0.65)'} />
                    {/* vdW gap hint lines */}
                    <line x1={node.cx - 24} y1={node.cy - 3.5} x2={node.cx - 24} y2={node.cy + 2}
                      stroke={isDark ? 'rgba(140,180,255,0.30)' : 'rgba(100,150,255,0.30)'} strokeWidth={0.6} strokeDasharray="1.5 1.5" />
                    <line x1={node.cx + 24} y1={node.cy - 3.5} x2={node.cx + 24} y2={node.cy + 2}
                      stroke={isDark ? 'rgba(140,180,255,0.30)' : 'rgba(100,150,255,0.30)'} strokeWidth={0.6} strokeDasharray="1.5 1.5" />
                    {/* S-Mo-S atom labels — left side of each layer band */}
                    <text x={node.cx - 28} y={node.cy - 8} textAnchor="end" dominantBaseline="middle"
                      fontSize="5.5" fontFamily="monospace" fill="rgba(200,225,255,0.45)" letterSpacing="0.05em">S</text>
                    <text x={node.cx - 28} y={node.cy - 1.5} textAnchor="end" dominantBaseline="middle"
                      fontSize="5.5" fontFamily="monospace" fill="rgba(200,225,255,0.55)" letterSpacing="0.05em">Mo</text>
                    <text x={node.cx - 28} y={node.cy + 4.5} textAnchor="end" dominantBaseline="middle"
                      fontSize="5.5" fontFamily="monospace" fill="rgba(200,225,255,0.45)" letterSpacing="0.05em">S</text>
                  </g>
                )}
                <text x={node.cx} y={node.cy - 14} textAnchor="middle" dominantBaseline="middle"
                  fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif"
                  letterSpacing="-0.01em" fill="rgba(255,255,255,0.95)">
                  MoS₂
                </text>
                <text x={node.cx} y={node.cy + 4} textAnchor="middle" dominantBaseline="middle"
                  fontSize="19" fontWeight="800" fontFamily="system-ui, sans-serif"
                  letterSpacing="-0.04em"
                  fill={isDark ? '#a0ccff' : '#cce0ff'}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(80,140,255,0.55))' }}>
                  μ 0.03
                </text>
                <text x={node.cx} y={node.cy + 22} textAnchor="middle" dominantBaseline="middle"
                  fontSize="7.5" fontFamily="monospace" letterSpacing="0.04em"
                  fill="rgba(255,255,255,0.38)">
                  {'< 5 µm · 5.06 g/cm³'}
                </text>
              </>)}

              {/* Satellite content: metric (primary) + name (secondary) */}
              {!isMos && (<>
                <text x={node.cx} y={node.cy - 5} textAnchor="middle" dominantBaseline="middle"
                  fontSize="15" fontWeight="800" fontFamily="system-ui, sans-serif"
                  letterSpacing="-0.03em" fill={isHot ? (isDark ? '#aad0ff' : '#1535a0') : metricClr}
                  style={{ transition: 'fill 0.2s' }}>
                  {node.metric}
                </text>
                <text x={node.cx} y={node.cy + 10} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9.5" fontWeight="600" fontFamily="system-ui, sans-serif"
                  letterSpacing="0.01em" fill={isDark ? 'rgba(255,255,255,0.52)' : 'rgba(var(--accent-strong-rgb),0.52)'}>
                  {de ? node.labelDe : node.labelEn}
                </text>
              </>)}

              {/* Sub-label outside (above for top nodes, below for lower) */}
              {!isMos && (
                <text
                  x={node.cx}
                  y={subAbove ? node.cy - node.r - 8 : node.cy + node.r + 14}
                  textAnchor="middle" dominantBaseline={subAbove ? 'auto' : 'middle'}
                  fontSize="9.5" fontFamily="monospace" letterSpacing="0.08em" fill={subClr}>
                  {de ? node.subDe : node.subEn}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* ── Hover info panel — shows the scientific "why" for each component ── */}
      {!isOverview && (
        <div
          className="hidden sm:flex items-start gap-3 mt-4 px-5 py-3.5 rounded-xl"
          style={{
            minHeight: '52px',
            background: isDark ? 'rgba(20,36,80,0.35)' : 'rgba(230,238,255,0.60)',
            border: `1px solid ${isDark ? 'rgba(var(--accent-soft-rgb),0.18)' : 'rgba(var(--accent-rgb),0.14)'}`,
            opacity: (canHover && hovNode) ? 1 : 0,
            transform: (canHover && hovNode) ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {hovNode && (<>
            <span className="text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 px-2 py-1 rounded-md"
              style={{ background: isDark ? 'rgba(var(--accent-soft-rgb),0.25)' : 'rgba(var(--accent-soft-rgb),0.12)', color: isDark ? '#7ab0ff' : '#2a56c4' }}>
              {hovNode.metric}
            </span>
            <p className="text-[12px] leading-relaxed" style={{ color: isDark ? 'rgba(200,220,255,0.78)' : 'rgba(15,40,90,0.72)' }}>
              {de ? hovNode.whyDe : hovNode.whyEn}
            </p>
          </>)}
        </div>
      )}

    </div>
  );
}

// ─── Synthesis Reveal — full section after Ch06 ───────────────────────────────
function SynthesisReveal({ de, isDark }: { de: boolean; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) { gsap.set(ref.current, { opacity: 1, y: 0 }); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: EASE.enter,
          scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  const divClr = isDark ? 'rgba(255,255,255,0.08)' : 'var(--bd)';
  return (
    <div ref={ref} className="rounded-2xl p-8 sm:p-10" style={{ background: isDark ? 'rgba(var(--accent-rgb),0.14)' : 'rgba(var(--accent-rgb),0.06)', border: `1px solid ${isDark ? 'rgba(var(--accent-soft-rgb),0.22)' : 'rgba(var(--accent-rgb),0.18)'}` }}>
      <div className="text-center mb-8">
        <p className="eyebrow mb-2" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Das vollständige System' : 'The complete system'}
        </p>
        <h2 className="font-display text-[1.6rem] sm:text-[2.2rem] font-bold leading-tight text-wx-tx1 mb-3" style={{ letterSpacing: '-0.01em' }}>
          {de ? 'Sechs Komponenten. Ein System.' : 'Six components. One system.'}
        </h2>
        <p className="text-[14px] max-w-md mx-auto" style={{ color: 'var(--txm)' }}>
          {de
            ? 'Jede Konzentration hat die einer anderen beeinflusst. Kein Bestandteil wurde isoliert gewählt.'
            : 'Every concentration influenced another. No component was chosen in isolation.'}
        </p>
      </div>
      <FormulaAssembly de={de} mode="synthesis" isDark={isDark} />
      <div className="mt-6 pt-5 flex flex-wrap items-center justify-center gap-6" style={{ borderTop: `1px solid ${divClr}` }}>
        {ASSEMBLY_EDGES.map((edge, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-4 h-px" style={{ background: 'var(--accent-soft)', opacity: 0.6 }} />
            <span className="text-[9px] font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(var(--accent-rgb),0.55)' }}>
              {de ? edge.labelDe : edge.labelEn}
            </span>
          </div>
        ))}
      </div>
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
    if (prefersReducedMotion()) {
      const root = ref.current;
      if (root) {
        gsap.set(root.querySelectorAll('.ft-item'), { opacity: 1, x: 0 });
        gsap.set(root.querySelectorAll('.ft-vline'), { scaleY: 1 });
      }
      if (connectorRef.current) gsap.set(connectorRef.current, { scaleX: 1 });
      return;
    }
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
  const fixClr   = isDark ? 'rgba(100,140,220,0.80)' : 'var(--accent)';
  const dotFail  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(var(--accent-rgb),0.25)';
  const lineClr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(var(--accent-rgb),0.12)';

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-center gap-3 mb-6 pl-4 relative">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
          style={{ background: 'linear-gradient(to bottom, var(--accent), rgba(var(--accent-soft-rgb),0.2))' }} />
        <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--txff)' }}>
          {de ? 'Entwicklungsiterationen — nur dokumentierte Fakten' : 'Development iterations — documented facts only'}
        </p>
      </div>
      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:flex items-start gap-0 relative">
        {/* connector line */}
        <div ref={connectorRef} className="absolute top-[18px] left-0 right-0 h-px" style={{ background: lineClr, transform: 'scaleX(0)', transformOrigin: 'left center' }} />
        {FAILURES.map((f, i) => (
          <div key={i} className="ft-item flex-1 flex flex-col items-center px-2" style={{ minWidth: 0, opacity: 0 }}>
            {/* Dot */}
            <div
              className="ft-dot w-[18px] h-[18px] rounded-full flex-shrink-0 z-10 flex items-center justify-center mb-3"
              style={{
                background: f.isCurrent ? 'var(--accent)' : dotFail,
                border: `2px solid ${f.isCurrent ? 'var(--accent-soft)' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(var(--accent-rgb),0.20)')}`,
                boxShadow: f.isCurrent ? '0 0 10px rgba(var(--accent-soft-rgb),0.5)' : 'none',
              }}
            />
            {/* Card */}
            <div className="w-full rounded-xl p-3" style={{
              background: f.isCurrent ? (isDark ? 'rgba(var(--accent-rgb),0.20)' : 'rgba(var(--accent-rgb),0.07)') : cardBg,
              border: `1px solid ${f.isCurrent ? 'rgba(var(--accent-soft-rgb),0.30)' : cardBd}`,
              boxShadow: f.isCurrent ? '0 0 0 2px rgba(var(--accent-soft-rgb),0.35), 0 4px 20px rgba(var(--accent-rgb),0.15)' : 'none',
            }}>
              <p className="text-[9px] font-mono font-bold uppercase tracking-wide mb-1.5" style={{ color: f.isCurrent ? 'var(--accent-soft)' : (isDark ? 'rgba(255,255,255,0.35)' : 'var(--txff)') }}>
                {de ? f.vDe : f.vEn}
              </p>
              <p className="text-[11.5px] leading-snug mb-2" style={{ color: failClr }}>
                {de ? f.failDe : f.failEn}
              </p>
              <p className="text-[11.5px] font-medium leading-snug" style={{ color: fixClr }}>
                {de ? f.fixDe : f.fixEn}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {FAILURES.map((f, i) => (
          <div key={i} className="ft-item flex gap-3" style={{ opacity: 0 }}>
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div className="ft-dot w-3 h-3 rounded-full" style={{ background: f.isCurrent ? 'var(--accent)' : dotFail, border: `1.5px solid ${f.isCurrent ? 'var(--accent-soft)' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(var(--accent-rgb),0.20)')}` }} />
              {i < FAILURES.length - 1 && <div className="ft-vline w-px flex-1 mt-1" style={{ background: lineClr, minHeight: '20px' }} />}
            </div>
            <div className="pb-2">
              <p className="text-[9px] font-mono font-bold uppercase tracking-wide mb-1" style={{ color: f.isCurrent ? 'var(--accent-soft)' : (isDark ? 'rgba(255,255,255,0.35)' : 'var(--txff)') }}>
                {de ? f.vDe : f.vEn}
              </p>
              <p className="text-[11.5px] leading-snug mb-1" style={{ color: failClr }}>{de ? f.failDe : f.failEn}</p>
              <p className="text-[11.5px] font-medium" style={{ color: fixClr }}>{de ? f.fixDe : f.fixEn}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hexagonal MoS₂ crystal (proper SVG) ─────────────────────────────────────
function HexMoS2({ de }: { de: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef  = useRef<SVGGElement>(null);
  const botRef  = useRef<SVGGElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Rows: viewBox 0 0 360 250
  const TOP_S1 = 30, TOP_MO = 62, TOP_S2 = 94;
  const GAP_Y  = 125;
  const BOT_S1 = 156, BOT_MO = 188, BOT_S2 = 220;

  const bonds = (moY: number, sUp: number, sDn: number) =>
    HEX_MO_X.flatMap(mx => [
      { x1: mx, y1: moY, x2: mx - 25, y2: sUp },
      { x1: mx, y1: moY, x2: mx + 25, y2: sUp },
      { x1: mx, y1: moY, x2: mx - 25, y2: sDn },
      { x1: mx, y1: moY, x2: mx + 25, y2: sDn },
    ]);

  useEffect(() => {
    const container = containerRef.current;
    const top = topRef.current;
    const bot = botRef.current;
    const lbl = labelRef.current;
    if (!container || !top || !bot) return;

    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.matchMedia({
        '(max-width: 639px)': () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container, start: 'top 85%', end: 'top 35%', scrub: 0.6,
            },
          });
          tl.fromTo(top, { x: 0 }, { x: 26, ease: 'none' }, 0);
          tl.fromTo(bot, { x: 0 }, { x: -26, ease: 'none' }, 0);
          if (lbl) {
            tl.fromTo(lbl, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.3);
            tl.to(lbl, { opacity: 0, ease: 'none' }, 0.7);
          }
        },
        '(min-width: 640px)': () => {
          const onEnter = () => {
            gsap.to(top, { x: 26, duration: DUR.standard, ease: EASE.enter });
            gsap.to(bot, { x: -26, duration: DUR.standard, ease: EASE.enter });
            if (lbl) gsap.to(lbl, { opacity: 1, duration: DUR.short, delay: 0.15 });
          };
          const onLeave = () => {
            gsap.to(top, { x: 0, duration: DUR.standard, ease: EASE.enter });
            gsap.to(bot, { x: 0, duration: DUR.standard, ease: EASE.enter });
            if (lbl) gsap.to(lbl, { opacity: 0, duration: DUR.fast });
          };
          container.addEventListener('mouseenter', onEnter);
          container.addEventListener('mouseleave', onLeave);
          return () => {
            container.removeEventListener('mouseenter', onEnter);
            container.removeEventListener('mouseleave', onLeave);
          };
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <VizFrame variant="lab"
      eyebrow={de ? 'MoS₂ — S–Mo–S Schichtstruktur' : 'MoS₂ — S–Mo–S layer structure'}
      chip="< 5 µm"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-[18px] h-[18px] rounded-full" style={{ background: 'var(--accent-soft)', opacity: 0.9 }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(168,192,244,0.65)' }}>S</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[26px] h-[26px] rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(var(--accent-soft-rgb),0.55)' }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(168,192,244,0.65)' }}>Mo</span>
            </div>
          </div>
          <div className="text-right">
            <CountUp value="μ 0.03" className="font-display italic text-[26px] font-bold leading-none" style={{ color: '#6A8AE8', textShadow: '0 0 20px rgba(var(--accent-soft-rgb),0.55)' }} />
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{de ? 'Grenzschmierung' : 'Boundary lubrication'}</p>
          </div>
        </div>
      }
      innerRef={containerRef}
    >
      <div className="relative select-none cursor-default">
        <svg viewBox="0 0 360 250" className="w-full" style={{ overflow: 'visible' }}>
          <g ref={topRef}>
            {bonds(TOP_MO, TOP_S1, TOP_S2).map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(var(--accent-rgb),0.25)" strokeWidth="2" />
            ))}
            {HEX_S_X.map((x, i) => <circle key={`ts1${i}`} cx={x} cy={TOP_S1} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
            {HEX_MO_X.map((x, i) => <circle key={`tmo${i}`} cx={x} cy={TOP_MO} r="13" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 7px rgba(var(--accent-soft-rgb),0.60))' }} />)}
            {HEX_S_X.map((x, i) => <circle key={`ts2${i}`} cx={x} cy={TOP_S2} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
          </g>
          {/* Van der Waals gap */}
          <line x1="15" y1={GAP_Y} x2="310" y2={GAP_Y} stroke="rgba(100,140,220,0.28)" strokeWidth="1" strokeDasharray="6 5" />
          <text x="318" y={GAP_Y + 4} fontSize="11" fill="rgba(168,192,244,0.45)" fontFamily="monospace">vdW</text>
          <g ref={botRef}>
            {bonds(BOT_MO, BOT_S1, BOT_S2).map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(var(--accent-rgb),0.25)" strokeWidth="2" />
            ))}
            {HEX_S_X.map((x, i) => <circle key={`bs1${i}`} cx={x} cy={BOT_S1} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
            {HEX_MO_X.map((x, i) => <circle key={`bmo${i}`} cx={x} cy={BOT_MO} r="13" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 7px rgba(var(--accent-rgb),0.55))' }} />)}
            {HEX_S_X.map((x, i) => <circle key={`bs2${i}`} cx={x} cy={BOT_S2} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
          </g>
          {/* Side labels — 13px Mo, 11px S */}
          <text x="5" y={TOP_S1 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
          <text x="5" y={TOP_MO + 5} fontSize="13" fill="rgba(130,170,240,0.80)" fontFamily="monospace" fontWeight="600">Mo</text>
          <text x="5" y={TOP_S2 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
          <text x="5" y={BOT_S1 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
          <text x="5" y={BOT_MO + 5} fontSize="13" fill="rgba(130,170,240,0.80)" fontFamily="monospace" fontWeight="600">Mo</text>
          <text x="5" y={BOT_S2 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
        </svg>
        {/* Shear label — fades in on scroll (mobile) or hover (desktop) */}
        <div ref={labelRef} className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: '46%', opacity: 0 }}>
          <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-md" style={{ background: 'rgba(14,22,38,0.85)', border: '1px solid rgba(100,140,220,0.35)', color: 'rgba(130,170,240,0.80)' }}>
            {de ? '← Schicht gleitet →' : '← layer slides →'}
          </span>
        </div>
      </div>
    </VizFrame>
  );
}

// ─── Transfer film animation — chain cross-section ────────────────────────────
// 3-beat timeline: (1) plates nudge + pressure arrows, (2) particles migrate,
// (3) films draw scaleX + label. viewBox 0 0 400 230, 30px plates, 8px films.
function TransferFilm({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const replay = () => {
    if (!tlRef.current) return;
    const container = ref.current;
    if (!container) return;
    const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
    const films = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
    const label = container.querySelector<SVGTextElement>('.tf-label');
    const arrows = Array.from(container.querySelectorAll<SVGElement>('.tf-arrow'));
    const topPlate = container.querySelector<SVGRectElement>('.tf-plate-t');
    const botPlate = container.querySelector<SVGRectElement>('.tf-plate-b');
    particles.forEach((el, i) => { const p = TF_PARTICLES[i]; gsap.set(el, { attr: { cy: p.y } }); });
    gsap.set(films, { scaleX: 0, opacity: 0 });
    if (label) gsap.set(label, { opacity: 0 });
    gsap.set(arrows, { opacity: 0 });
    if (topPlate) gsap.set(topPlate, { attr: { y: 0 } });
    if (botPlate) gsap.set(botPlate, { attr: { y: 200 } });
    tlRef.current.restart();
  };

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (prefersReducedMotion()) {
      const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
      const films = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
      const label = container.querySelector<SVGTextElement>('.tf-label');
      particles.forEach((el, i) => {
        const p = TF_PARTICLES[i];
        gsap.set(el, { attr: { cy: p.top ? 38 + p.r : 192 - p.r } });
      });
      gsap.set(films, { scaleX: 1, opacity: 0.92 });
      if (label) gsap.set(label, { opacity: 1 });
      setHasPlayed(true);
      return;
    }

    const ctx = gsap.context(() => {
      const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
      const films     = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
      const label     = container.querySelector<SVGTextElement>('.tf-label');
      const arrows    = Array.from(container.querySelectorAll<SVGElement>('.tf-arrow'));
      const topPlate  = container.querySelector<SVGRectElement>('.tf-plate-t');
      const botPlate  = container.querySelector<SVGRectElement>('.tf-plate-b');

      gsap.set(films, { scaleX: 0, transformOrigin: '50% 50%' });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 88%', once: true },
        onComplete: () => setHasPlayed(true),
      });
      tlRef.current = tl;

      // Beat 1: plates nudge inward + pressure arrows fade in
      if (topPlate) tl.fromTo(topPlate, { attr: { y: -4 } }, { attr: { y: 0 }, duration: DUR.standard, ease: EASE.enter }, 0);
      if (botPlate) tl.fromTo(botPlate, { attr: { y: 204 } }, { attr: { y: 200 }, duration: DUR.standard, ease: EASE.enter }, 0);
      tl.to(arrows, { opacity: 1, duration: DUR.short, stagger: 0.06, ease: EASE.enter }, 0.15);

      // Beat 2: particles migrate to plate surfaces
      particles.forEach((el, i) => {
        const p = TF_PARTICLES[i];
        tl.to(el, {
          attr: { cy: p.top ? 38 + p.r : 192 - p.r },
          duration: 1.2,
          ease: 'power3.inOut',
        }, 0.4 + i * 0.04);
      });

      // Beat 3: films draw scaleX + label
      tl.to(films, { scaleX: 1, opacity: 0.92, duration: DUR.long, stagger: 0.12, ease: EASE.enter }, 1.2);
      if (label) tl.to(label, { opacity: 1, duration: DUR.standard }, 1.8);
      tl.to(arrows, { opacity: 0, duration: DUR.short }, 1.4);

    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <VizFrame variant="lab"
      eyebrow={de ? 'Transferfilm unter Kontaktdruck' : 'Transfer film under contact pressure'}
      chip="Fe–S"
      footer={
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { val: '50–300 MPa', sub: de ? 'Kontaktdruck' : 'Contact pressure' },
            { val: '2–5 nm',     sub: de ? 'Filmdicke'    : 'Film thickness'   },
            { val: 'Fe–S',       sub: de ? 'tribochem. Bindung' : 'tribochem. bond' },
          ].map((s, i) => (
            <div key={i}>
              <CountUp value={s.val} className="font-mono text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }} />
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      }
      innerRef={ref}
    >
      <div className="relative">
        <svg viewBox="0 0 400 230" className="w-full" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="tf-steel-t" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2e3e" />
              <stop offset="100%" stopColor="#1c2030" />
            </linearGradient>
            <linearGradient id="tf-steel-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c2030" />
              <stop offset="100%" stopColor="#2a2e3e" />
            </linearGradient>
            <pattern id="tf-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(130,170,240,0.12)" strokeWidth="1" />
            </pattern>
            <filter id="tf-film-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Steel plates — 30px with hatch + inside label */}
          <rect className="tf-plate-t" x="0" y="0" width="400" height="30" fill="url(#tf-steel-t)" rx="3" />
          <rect x="0" y="0" width="400" height="30" fill="url(#tf-hatch)" rx="3" />
          <text x="12" y="20" fontSize="11" fill="rgba(168,192,244,0.40)" fontFamily="monospace">{de ? 'Stahl' : 'Steel'}</text>
          <rect className="tf-plate-b" x="0" y="200" width="400" height="30" fill="url(#tf-steel-b)" rx="3" />
          <rect x="0" y="200" width="400" height="30" fill="url(#tf-hatch)" rx="3" />
          <text x="12" y="220" fontSize="11" fill="rgba(168,192,244,0.40)" fontFamily="monospace">{de ? 'Stahl' : 'Steel'}</text>
          {/* Pressure arrows — fade in beat 1 */}
          <g className="tf-arrow" opacity="0">
            <line x1="200" y1="-8" x2="200" y2="8" stroke="rgba(168,192,244,0.50)" strokeWidth="1.5" markerEnd="url(#tf-arw)" />
            <text x="200" y="-14" textAnchor="middle" fontSize="10" fill="rgba(168,192,244,0.55)" fontFamily="monospace">50–300 MPa</text>
          </g>
          <g className="tf-arrow" opacity="0">
            <line x1="200" y1="238" x2="200" y2="222" stroke="rgba(168,192,244,0.50)" strokeWidth="1.5" />
          </g>
          {/* Transfer film deposits — 8px with glow */}
          <rect className="tf-film" x="0" y="30" width="400" height="8" fill="var(--accent)" opacity="0" rx="2" filter="url(#tf-film-glow)" />
          <rect className="tf-film" x="0" y="192" width="400" height="8" fill="var(--accent)" opacity="0" rx="2" filter="url(#tf-film-glow)" />
          {/* MoS₂ particles */}
          {TF_PARTICLES.map((p, i) => (
            <circle key={i} className="tf-p" cx={p.x} cy={p.y} r={p.r} fill="var(--accent)" opacity="0.85" />
          ))}
          {/* Film label — appears after animation */}
          <text className="tf-label" x="200" y="48" textAnchor="middle" fontSize="11" fill="rgba(106,138,232,0.9)" fontFamily="monospace" letterSpacing="1.5" opacity="0">
            {de ? 'Fe-S Transferfilm' : 'Fe-S transfer film'}
          </text>
        </svg>
        {hasPlayed && (
          <button
            onClick={replay}
            aria-label="Replay animation"
            className="absolute top-0 right-0 p-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{
              background: 'rgba(var(--accent-soft-rgb),0.18)',
              border: '1px solid rgba(var(--accent-soft-rgb),0.30)',
              color: 'rgba(168,192,244,0.80)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </VizFrame>
  );
}

// ─── Crystal lattice — twin panels: order crystallizes, disorder stays ───────
// Scroll scrub drives the argument: Waxcelerate rods converge into perfect
// alignment while the generic-paraffin rods settle but keep their jitter.
const LAT_ROWS_Y = [46, 116, 186];
const LAT_RODS = 5;
const LAT_ROD_W = 64, LAT_ROD_H = 14, LAT_ROD_GAP = 9;
const LAT_START_X = (400 - (LAT_RODS * LAT_ROD_W + (LAT_RODS - 1) * LAT_ROD_GAP)) / 2;
const LAT_VDW_Y = [81, 151];
// Deterministic per-rod jitter [dy, rot] — disorder that reads as disorder
const LAT_JITTER: [number, number][][] = [
  [[-3, -4], [2, 3],  [-1, -2], [3, 5],   [-2, 2]],
  [[2, 4],   [-3, -3], [1, 2],  [-2, -5], [3, 3]],
  [[-2, 3],  [1, -4],  [3, 4],  [-3, -2], [1, -3]],
];
const LAT_WIDTHS_R = [52, 70, 46, 66, 58];
const LAT_HEIGHTS_R = [12, 16, 11, 15, 13];

function LatticePanel({ ordered, de }: { ordered: boolean; de: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const bandA = 'rgba(var(--accent-soft-rgb),0.10)';
  const bandB = 'rgba(var(--accent-soft-rgb),0.05)';
  const vdwClr = 'rgba(var(--accent-soft-rgb),0.45)';
  const vdwTxt = 'rgba(var(--accent-soft-rgb),0.65)';

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rods = Array.from(svg.querySelectorAll<SVGRectElement>('.lat-rod'));
    if (!rods.length) return;

    if (prefersReducedMotion()) {
      // Ordered side: aligned. Disordered side keeps its baked-in jitter.
      if (ordered) gsap.set(rods, { x: 0, y: 0, rotation: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      if (ordered) {
        // Watch order crystallize: rods converge from jitter into alignment
        const tl = gsap.timeline({
          scrollTrigger: { trigger: svg, start: 'top 85%', end: 'top 35%', scrub: 0.6 },
        });
        rods.forEach((rod, i) => {
          const row = Math.floor(i / LAT_RODS), col = i % LAT_RODS;
          const [dy, rot] = LAT_JITTER[row][col];
          tl.fromTo(rod,
            { y: dy * 2.2, rotation: rot * 1.5, transformOrigin: '50% 50%' },
            { y: 0, rotation: 0, ease: 'power2.out' },
            col * 0.06,
          );
        });
      } else {
        // Disorder never settles: slow ambient wobble (±1.5px)
        gsap.to(rods, {
          y: '+=1.5',
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.3, from: 'random' },
        });
      }
    }, svg);
    return () => ctx.revert();
  }, [ordered]);

  return (
    <div>
      {/* Panel header — HTML chip, never SVG text */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className="text-[12px] font-semibold px-2 py-0.5 rounded-md"
          style={ordered
            ? { background: 'rgba(var(--accent-rgb),0.10)', border: '1px solid rgba(var(--accent-rgb),0.22)', color: 'var(--accent)' }
            : { color: 'var(--txm)' }}
        >
          {ordered ? 'Waxcelerate' : (de ? 'Generisches Paraffin' : 'Generic paraffin')}
        </span>
        <span className="text-[12px] font-mono tabular-nums" style={{ color: ordered ? 'var(--accent)' : 'var(--txf)' }}>
          {ordered ? '58–60°C' : '55–65°C'}
        </span>
      </div>
      <svg ref={svgRef} viewBox="0 0 400 230" className="w-full block rounded-lg"
        style={{ background: 'rgba(var(--accent-rgb),0.025)' }}>
        {/* Crystal plane bands */}
        {LAT_ROWS_Y.map((yc, li) => (
          <rect key={li} x="0" y={yc - 26} width="400" height="52" fill={li % 2 === 0 ? bandA : bandB} />
        ))}
        {/* Van-der-Waals gaps */}
        {LAT_VDW_Y.map((y, i) => (
          <g key={i}>
            <line x1="14" y1={y} x2="340" y2={y} stroke={vdwClr} strokeWidth="1" strokeDasharray="6 5" />
            <text x="350" y={y + 4} fontSize="11" fill={vdwTxt} fontFamily="monospace">vdW</text>
          </g>
        ))}
        {/* Chain rods */}
        {LAT_ROWS_Y.map((yc, row) =>
          [...Array(LAT_RODS)].map((_, col) => {
            const [dy, rot] = LAT_JITTER[row][col];
            const w = ordered ? LAT_ROD_W : LAT_WIDTHS_R[col];
            const h = ordered ? LAT_ROD_H : LAT_HEIGHTS_R[col];
            const x = ordered
              ? LAT_START_X + col * (LAT_ROD_W + LAT_ROD_GAP)
              : LAT_START_X + col * (LAT_ROD_W + LAT_ROD_GAP) + (LAT_ROD_W - w) / 2;
            const cx = x + w / 2, cy = yc;
            return (
              <rect
                key={`${row}-${col}`}
                className="lat-rod"
                x={x} y={yc - h / 2} width={w} height={h} rx={7}
                fill={ordered ? 'var(--accent-soft)' : 'rgba(var(--accent-soft-rgb),0.35)'}
                opacity={ordered ? 0.88 : 1}
                transform={ordered ? undefined : `rotate(${rot} ${cx} ${cy}) translate(0 ${dy})`}
                style={ordered ? { filter: 'drop-shadow(0 0 5px rgba(var(--accent-soft-rgb),0.45))' } : undefined}
              />
            );
          })
        )}
      </svg>
      <p className="text-[11px] mt-2" style={{ color: 'var(--txf)' }}>
        {ordered
          ? (de ? 'Geordnet — jede Charge identisch' : 'Ordered — every batch identical')
          : (de ? 'Ungeordnet — variiert je Charge' : 'Disordered — varies batch to batch')}
      </p>
    </div>
  );
}

function CrystalLattice({ de }: { de: boolean }) {
  return (
    <VizFrame
      eyebrow={de ? 'Lamellare Kristallstruktur' : 'Lamellar crystal structure'}
      chip="C₂₀–C₃₆"
      footer={
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txf)' }}>
          {de
            ? 'vdW = van-der-Waals-Lücke zwischen Kristallebenen. Das enge 2°C-Erstarrungsfenster erzwingt die geordnete Struktur links.'
            : 'vdW = van-der-Waals gap between crystal planes. The narrow 2°C solidification window forces the ordered structure on the left.'}
        </p>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
        <LatticePanel ordered de={de} />
        <LatticePanel ordered={false} de={de} />
      </div>
    </VizFrame>
  );
}

// ─── Temperature range — instrument panel with real axis ─────────────────────
function TempRange({ de }: { de: boolean }) {
  const items = [
    { labelDe: 'Unmodifiziertes Paraffin', labelEn: 'Unmodified paraffin', lo: 58, hi: 62, dim: true  },
    { labelDe: 'Waxcelerate Classic',      labelEn: 'Waxcelerate Classic', lo: 60, hi: 76, dim: false },
    { labelDe: 'Waxcelerate Pro',          labelEn: 'Waxcelerate Pro',     lo: 60, hi: 79, dim: false },
  ];
  const min = 55, max = 85;
  const TICKS = [55, 60, 65, 70, 75, 80, 85];
  const toX = (v: number) => ((v - min) / (max - min)) * 100;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const bars = root.querySelectorAll('.t-bar');
    const dots = root.querySelectorAll('.t-dot');
    if (prefersReducedMotion()) {
      gsap.set(bars, { scaleX: 1 });
      gsap.set(dots, { scale: 1, opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(bars, { scaleX: 0 }, {
        scaleX: 1, duration: 0.9, stagger: 0.12, ease: EASE.enter, transformOrigin: 'left center',
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      gsap.fromTo(dots, { scale: 0, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.45, stagger: 0.12, delay: 0.55, ease: 'back.out(2.2)',
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <VizFrame
      eyebrow={de ? 'Effektiver Tropfpunkt' : 'Effective drop point'}
      chip="+14–19°C"
      footer={
        <div>
          <div className="flex justify-between">
            {TICKS.map(t => (
              <span
                key={t}
                className={`text-[10px] font-mono tabular-nums ${t % 10 === 0 ? 'hidden min-[400px]:inline' : ''}`}
                style={{ color: 'var(--txf)' }}
              >
                {t}°
              </span>
            ))}
          </div>
          <p className="text-[11px] mt-2.5" style={{ color: 'var(--txf)' }}>
            {de
              ? 'Schraffiertes Band = Betriebsfenster 60–79°C. Kontaktpunkte erreichen unter Last 45–55°C.'
              : 'Shaded band = operating window 60–79°C. Contact points reach 45–55°C under load.'}
          </p>
        </div>
      }
    >
      <div ref={ref} className="relative">
        {/* Axis gridlines + operating window — span all rows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {TICKS.map(t => (
            <div key={t} className="absolute top-0 bottom-0 w-px" style={{ left: `${toX(t)}%`, background: 'rgba(var(--accent-rgb),0.08)' }} />
          ))}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${toX(60)}%`,
              width: `${toX(79) - toX(60)}%`,
              background: 'rgba(var(--accent-rgb),0.05)',
              borderLeft: '1px dashed rgba(var(--accent-rgb),0.22)',
              borderRight: '1px dashed rgba(var(--accent-rgb),0.22)',
            }}
          />
        </div>
        <div className="relative space-y-5 py-1">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline mb-1.5 gap-2">
                <span className="text-[13px]" style={{ color: item.dim ? 'var(--txm)' : 'var(--tx1)' }}>
                  {de ? item.labelDe : item.labelEn}
                </span>
                <CountUp
                  value={`${item.lo}–${item.hi}°C`}
                  className="font-display text-[17px] font-bold leading-none flex-shrink-0"
                  style={{ color: item.dim ? 'var(--txm)' : 'var(--accent)' }}
                />
              </div>
              <div className="relative h-2.5 rounded-full" style={{ background: 'var(--bd2)' }}>
                <div
                  className="t-bar absolute top-0 h-full rounded-full"
                  style={{
                    left: `${toX(item.lo)}%`,
                    width: `${toX(item.hi) - toX(item.lo)}%`,
                    background: item.dim ? 'var(--bd)' : 'linear-gradient(90deg, var(--accent), var(--accent-soft))',
                    transformOrigin: 'left center',
                  }}
                />
                {!item.dim && (
                  <div
                    className="t-dot absolute top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full"
                    style={{
                      left: `calc(${toX(item.hi)}% - 3.5px)`,
                      background: 'var(--accent-soft)',
                      boxShadow: '0 0 8px rgba(var(--accent-soft-rgb),0.85)',
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VizFrame>
  );
}

// ─── Chapter 03 — temperature window panel (same instrument language) ────────
function TempWindowPanel({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = [
    { labelDe: 'Kälteflexibilität bis', labelEn: 'Cold flexibility to', val: '−10°C',        w: 20,  dim: false },
    { labelDe: 'Optimale Performance',  labelEn: 'Optimal performance', val: '−8°C → +35°C', w: 80,  dim: false },
    { labelDe: 'Thermisch stabil bis',  labelEn: 'Thermally stable to', val: '+78°C',        w: 100, dim: false },
  ];
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const bars = root.querySelectorAll('.tw-bar');
    if (prefersReducedMotion()) { gsap.set(bars, { scaleX: 1 }); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(bars, { scaleX: 0 }, {
        scaleX: 1, duration: 0.9, stagger: 0.12, ease: EASE.enter, transformOrigin: 'left center',
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <VizFrame
      eyebrow={de ? 'Temperaturfenster' : 'Temperature window'}
      chip="−10°C → +78°C"
      footer={
        <div className="grid grid-cols-3 gap-2">
          {[{ de: 'Plastifizierung', en: 'Plastification' }, { de: 'Haftung', en: 'Adhesion' }, { de: 'Partikelbindung', en: 'Particle binding' }].map((fn, i) => (
            <div key={i} className="text-center rounded-lg py-2 px-1" style={{ background: 'rgba(var(--accent-rgb),0.07)', border: '1px solid rgba(var(--accent-rgb),0.13)' }}>
              <p className="text-[10px] font-medium" style={{ color: 'var(--accent-soft)' }}>{de ? fn.de : fn.en}</p>
            </div>
          ))}
        </div>
      }
    >
      <div ref={ref} className="space-y-5 py-1">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline mb-1.5 gap-2">
              <span className="text-[13px]" style={{ color: 'var(--tx1)' }}>{de ? item.labelDe : item.labelEn}</span>
              <CountUp
                value={item.val}
                className="font-display text-[17px] font-bold leading-none flex-shrink-0"
                style={{ color: 'var(--accent)' }}
              />
            </div>
            <div className="h-2.5 rounded-full" style={{ background: 'var(--bd2)' }}>
              <div
                className="tw-bar h-full rounded-full"
                style={{ width: `${item.w}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-soft))', transformOrigin: 'left center' }}
              />
            </div>
          </div>
        ))}
      </div>
    </VizFrame>
  );
}

// ─── Particle suspension — animated ──────────────────────────────────────────
function ParticleSuspension({ de }: { de: boolean }) {
  const wRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const floating = wRef.current?.querySelectorAll<HTMLElement>('.sp-float');
      const stable   = mRef.current?.querySelectorAll<HTMLElement>('.sp-stable');
      if (floating?.length) gsap.set(floating, { y: 64, opacity: 0.18 });
      if (stable?.length)   gsap.set(stable,   { scale: 1, opacity: 0.9 });
      return;
    }
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
      // "With": uniformly distributed dots appear with stagger
      const stable = mRef.current?.querySelectorAll<HTMLElement>('.sp-stable');
      if (stable?.length) {
        gsap.fromTo(stable,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.9, duration: 0.5, ease: 'back.out(1.5)',
            stagger: { each: 0.04, from: 'center' },
            scrollTrigger: { trigger: mRef.current, start: 'top 82%', once: true } },
        );
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
            <div className="absolute inset-x-2" style={{ top: '50%', height: '1px', background: 'rgba(var(--accent-rgb),0.08)' }} />
            <div className="absolute inset-x-0 top-2 flex flex-wrap gap-2 px-3 justify-center">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="sp-float w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)', opacity: 0.8 }} />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 px-2 pt-1.5 pb-1 rounded-b" style={{ background: 'rgba(var(--accent-rgb),0.30)' }}>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[...Array(18)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }} />)}
              </div>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-wx-tx1 mt-2">{de ? 'Ohne' : 'Without'}</p>
          <p className="text-[10px] text-center mt-0.5" style={{ color: 'var(--txff)' }}>{de ? 'Gradient im Block' : 'Gradient in block'}</p>
        </div>
        <div ref={mRef} className="flex flex-col items-center">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '148px', background: 'var(--bd2)', border: '1px solid var(--bd)' }}>
            {/* Center-of-mass reference line */}
            <div className="absolute inset-x-2" style={{ top: '50%', height: '1px', background: 'rgba(var(--accent-rgb),0.08)' }} />
            <div className="absolute inset-0 flex flex-wrap gap-2 p-3 items-center justify-center">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="sp-stable w-3.5 h-3.5 rounded-full" style={{ background: 'var(--accent)', opacity: 0.9 }} />
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

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (prefersReducedMotion()) {
      container.querySelectorAll<HTMLElement>('.fb').forEach(bar => {
        bar.style.transform = `scaleX(${parseFloat(bar.dataset.w!) / 100})`;
      });
      return;
    }
    const ctx = gsap.context(() => {
      container.querySelectorAll('.fb').forEach(bar => {
        const w = parseFloat((bar as HTMLElement).dataset.w!);
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: w / 100, duration: DUR.long, ease: EASE.enter,
          transformOrigin: 'left center',
          scrollTrigger: { trigger: container, start: 'top 80%', once: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const ticks = [0, 0.05, 0.10, 0.15, 0.20, 0.25];

  return (
    <VizFrame
      eyebrow={de ? 'Reibungskoeffizient μ' : 'Friction coefficient μ'}
      chip={de ? '≈ 2–5 W gespart @ 250 W' : '≈ 2–5 W saved @ 250 W'}
      footer={
        <p className="text-[11px] font-mono text-center" style={{ color: 'var(--accent-soft)', opacity: 0.6 }}>
          {de ? 'Eigentest · Grenzschmierung · 50–300 MPa' : 'Self-tested · boundary lubrication · 50–300 MPa'}
        </p>
      }
      innerRef={ref}
    >
      {/* Gridlines */}
      <div className="relative">
        <div className="absolute inset-0 flex justify-between pointer-events-none" aria-hidden>
          {ticks.map(v => (
            <div key={v} className="h-full w-px" style={{ background: 'rgba(var(--accent-rgb),0.08)' }} />
          ))}
        </div>
        <div className="relative space-y-4 py-1">
          {FRICTION_BARS.map((b, i) => {
            const label = 'label' in b ? b.label : (de ? b.labelDe : b.labelEn);
            const hiPct = Math.round((b.muHi / FRICTION_SCALE) * 100);
            const loPct = Math.round((b.muLo / FRICTION_SCALE) * 100);
            const isDim = 'dim' in b && b.dim;
            const barGrad = b.best
              ? (i === 0 ? 'linear-gradient(90deg,var(--accent),#6A8AE8)' : 'linear-gradient(90deg,var(--accent),var(--accent-soft))')
              : (isDim ? 'rgba(var(--accent-rgb),0.12)' : 'rgba(var(--accent-rgb),0.22)');
            const solidFill = b.best
              ? (i === 0 ? '#1A3080' : 'var(--accent)') : 'rgba(var(--accent-rgb),0.10)';
            const glowDot = b.best && i === 0;
            return (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-[13px] font-medium ${b.best ? 'text-wx-tx1' : 'text-wx-txm'}`}>
                    {label}
                    {'tag' in b && (
                      <span className="ml-2 text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                        style={{ background: 'linear-gradient(135deg,#1A3080,var(--accent))', color: 'rgba(255,255,255,0.9)' }}>
                        {b.tag}
                      </span>
                    )}
                  </span>
                  <CountUp value={`μ ${b.muLo.toFixed(2)}–${b.muHi.toFixed(2)}`}
                    className="font-display text-[15px] font-semibold tabular-nums"
                    style={{ color: b.best ? 'var(--accent)' : (isDim ? 'var(--txff)' : 'var(--txm)') }} />
                </div>
                <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(var(--accent-rgb),0.06)' }}>
                  <div className="absolute top-0 left-0 h-full" style={{ width: `${loPct}%`, background: solidFill }} />
                  <div className="fb absolute top-0 h-full rounded-r-full" data-w={hiPct - loPct}
                    style={{ left: `${loPct}%`, width: `${hiPct - loPct}%`, background: barGrad, transformOrigin: 'left center', transform: 'scaleX(0)' }} />
                  {glowDot && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{ left: `${hiPct}%`, transform: `translateX(-50%) translateY(-50%)`, background: '#6A8AE8', boxShadow: '0 0 8px rgba(106,138,232,0.7)' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Tick axis */}
      <div className="flex justify-between mt-3 pt-2" style={{ borderTop: '1px solid rgba(var(--accent-rgb),0.08)' }}>
        {ticks.map(v => (
          <span key={v} className="text-[10px] font-mono" style={{ color: 'var(--accent-soft)', opacity: 0.5 }}>
            {v === 0 ? '0' : v.toFixed(2)}
          </span>
        ))}
      </div>
    </VizFrame>
  );
}

// ─── Insight callout ──────────────────────────────────────────────────────────
function Insight({ children, de }: { children: React.ReactNode; de: boolean }) {
  const ref    = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) {
      if (barRef.current) gsap.set(barRef.current, { scaleY: 1, opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(barRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', transformOrigin: 'top center',
          scrollTrigger: { trigger: ref.current, start: 'top 87%', end: 'top 55%', scrub: 0.6 } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="relative pl-5 py-1.5">
      <div ref={barRef} className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full origin-top" style={{ background: 'linear-gradient(to bottom,var(--accent),#7A9AEC)' }} />
      <p className="text-[11px] uppercase tracking-[0.24em] font-medium mb-1.5" style={{ color: 'var(--accent-soft)' }}>
        {de ? 'Erkenntnis' : 'Insight'}
      </p>
      <p className="font-display text-[16px] leading-[1.75] italic" style={{ color: 'var(--tx2)', fontVariationSettings: '"SOFT" 30' }}>
        {children}
      </p>
    </div>
  );
}

// ─── Outcome band — 3 key stats with 3D-reveal stagger + CountUp ─────────────
function OutcomeBand({ de, isDark }: { de: boolean; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-card]');
    if (!cards.length) return;
    gsap.set(cards, { opacity: 0, y: 32, rotateX: 9, transformPerspective: 700, transformOrigin: '50% 0%' });
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 87%', once: true,
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1, y: 0, rotateX: 0, duration: DUR.long, ease: EASE.enter, stagger: 0.12,
          onStart()    { cards.forEach(c => { c.style.willChange = 'transform, opacity'; }); },
          onComplete() { cards.forEach(c => { c.style.willChange = 'auto'; c.style.transform = ''; }); },
        });
      },
    });
    return () => trigger.kill();
  }, []);

  const items = [
    { val: '~300 km', labelDe: 'pro Rewax-Vorgang', labelEn: 'per rewax', subDe: 'bei trockenen Bedingungen', subEn: 'in dry conditions' },
    { val: '3×',      labelDe: 'längere Kettenlaufzeit', labelEn: 'longer chain life', subDe: 'gegenüber Kettenöl', subEn: 'vs. chain oil' },
    { val: '~€35',    labelDe: 'gespart pro Jahr', labelEn: 'saved per year', subDe: 'bei 5.000 km/Jahr', subEn: 'at 5,000 km/year' },
  ];

  return (
    <div ref={ref} className={`${W} py-14`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={i} data-card className="rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: isDark ? 'rgba(var(--accent-rgb),0.12)' : 'rgba(var(--accent-rgb),0.05)',
              border: '1px solid rgba(var(--accent-rgb),0.18)',
            }}>
            <CountUp value={item.val} className="font-display italic font-bold text-[2.4rem] leading-none mb-1.5"
              style={{ color: isDark ? '#6A8AE8' : 'var(--accent)' }} />
            <p className="text-[12px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx1)' }}>
              {de ? item.labelDe : item.labelEn}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>
              {de ? item.subDe : item.subEn}
            </p>
          </div>
        ))}
      </div>
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
    if (prefersReducedMotion()) { gsap.set(ref.current, { opacity: 1, y: 0 }); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, ease: EASE.enter,
          scrollTrigger: { trigger: ref.current, start: 'top 86%', once: true } },
      );
    });
    return () => ctx.revert();
  }, []);

  // Expanding/collapsing changes the page height — downstream ScrollTrigger
  // positions go stale without a refresh (after the 0.5s grid transition).
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 550);
    return () => window.clearTimeout(id);
  }, [open]);

  // Stagger paragraphs in when expanding
  useEffect(() => {
    if (!open) return;
    const ps = bodyRef.current?.querySelectorAll('p');
    if (!ps?.length) return;
    if (prefersReducedMotion()) { gsap.set(ps, { opacity: 1, y: 0 }); return; }
    gsap.fromTo(ps,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.42, stagger: 0.1, ease: 'power2.out', delay: 0.08 },
    );
  }, [open]);

  return (
    <div ref={ref} id={anchorId} className="mb-24 lg:mb-32" style={{ opacity: 0 }} data-chapter={num}>

      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="font-display text-[28px] font-bold tabular-nums leading-none select-none flex-shrink-0"
          style={{ color: 'rgba(var(--accent-rgb),0.12)' }}
        >
          {num}
        </span>
        <div className="h-px flex-1 max-w-[40px]" style={{ background: 'rgba(var(--accent-rgb),0.15)' }} />
        <p className="text-[11px] font-medium uppercase tracking-[0.20em]" style={{ color: 'var(--accent-soft)' }}>
          {de ? catDe : catEn}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Text column */}
        <div className={`flex flex-col gap-5 ${flip ? 'lg:order-2' : 'lg:order-1'}`}>
          <h2 className="font-display text-[1.75rem] sm:text-[2.1rem] font-bold text-wx-tx1 leading-[1.12]" style={{ letterSpacing: '-0.01em' }}>
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
            className="inline-flex items-center gap-1.5 text-[12px] font-medium self-start transition-colors duration-200"
            style={{ color: 'var(--accent)' }}
          >
            {de ? (open ? 'Weniger' : 'Die Physik dahinter') : (open ? 'Less' : 'The physics')}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-300"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          {/* Expandable body */}
          <div style={{
            display: 'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div ref={bodyRef} className="space-y-4 text-[15px] leading-[1.88] text-wx-txm pb-2">
                {de ? bodyDe : bodyEn}
              </div>
            </div>
          </div>
          <Insight de={de}>{de ? insightDe : insightEn}</Insight>
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

// ─── Main page ────────────────────────────────────────────────────────────────
export function SciencePage() {
  const { lang, toggleLang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'noir';
  const de = lang === 'de';
  const [activeChapter, setActiveChapter] = useState(-1);
  const heroRef        = useRef<HTMLElement>(null);
  const heroCardRef    = useRef<HTMLDivElement>(null);
  const heroImgRef     = useRef<HTMLDivElement>(null);
  const heroHexRef     = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroSpotRef    = useRef<HTMLDivElement>(null);
  const heroAnimated   = useRef(false);

  // ── Lab-stage hero choreography — mirrors the main hero's motion language ──
  useEffect(() => {
    if (heroAnimated.current) return;
    const root = heroRef.current;
    const card = heroCardRef.current;
    if (!root || !card) return;
    heroAnimated.current = true;

    const words   = root.querySelectorAll<HTMLElement>('[data-word]');
    const items   = root.querySelectorAll<HTMLElement>('[data-hero-item]');
    const statEls = root.querySelectorAll<HTMLElement>('[data-stat-val]');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion()) {
      gsap.set(words, { yPercent: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(card,  { opacity: 1, y: 0 });
      if (heroImgRef.current) gsap.set(heroImgRef.current, { scale: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.05, defaults: { ease: EASE.hero } });
    // Stage lifts off the page background
    tl.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0);
    // Cinematic image settle
    if (heroImgRef.current) {
      tl.fromTo(heroImgRef.current, { scale: 1.06 }, { scale: 1.01, duration: 2.4, ease: 'power2.out' }, 0);
    }
    // Headline words drop in with slight overshoot
    tl.fromTo(words,
      { yPercent: -120 },
      { yPercent: 0, duration: 0.72, ease: 'back.out(1.3)', stagger: 0.15 },
      0.45,
    );
    tl.fromTo(items, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 0.9);

    // Data band counts up — components · months of iteration · μ
    const SPECS = [
      { to: 6,    fmt: (v: number) => String(Math.round(v)) },
      { to: 12,   fmt: (v: number) => String(Math.round(v)) },
      { to: 0.03, fmt: (v: number) => 'μ ' + v.toFixed(2) },
    ];
    statEls.forEach((el, i) => {
      const spec = SPECS[i];
      if (!spec) return;
      const c = { v: 0 };
      gsap.to(c, {
        v: spec.to, duration: 1.0, delay: 1.15 + i * 0.12, ease: 'power2.out',
        onUpdate() { el.textContent = spec.fmt(c.v); },
      });
    });

    // Scroll scrub: image drifts, hexagon rotates away, content recedes, stage steps back
    const triggers: ScrollTrigger[] = [];
    const scrub = (animation: gsap.core.Tween) =>
      triggers.push(ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, animation }));
    if (heroImgRef.current)     scrub(gsap.to(heroImgRef.current,     { yPercent: 4, ease: 'none' }));
    if (heroContentRef.current) scrub(gsap.to(heroContentRef.current, { y: -40, opacity: 0.25, ease: 'none' }));
    if (heroHexRef.current)     scrub(gsap.to(heroHexRef.current,     { y: 70, rotate: 9, ease: 'none' }));
    scrub(gsap.to(card, { scale: 0.965, transformOrigin: '50% 100%', ease: 'none' }));

    // Cursor depth: image follows the pointer, hexagon counter-drifts, spotlight trails
    let onMove:  ((e: MouseEvent) => void) | undefined;
    let onLeave: (() => void) | undefined;
    if (finePointer) {
      const qImgX = heroImgRef.current ? gsap.quickTo(heroImgRef.current, 'x', { duration: 1.0, ease: 'power3.out' }) : null;
      const qImgY = heroImgRef.current ? gsap.quickTo(heroImgRef.current, 'y', { duration: 1.0, ease: 'power3.out' }) : null;
      const qHexX = heroHexRef.current ? gsap.quickTo(heroHexRef.current, 'x', { duration: 1.3, ease: 'power3.out' }) : null;
      onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        if (qImgX && qImgY) { qImgX(nx * -9); qImgY(ny * -6); }
        if (qHexX) qHexX(nx * 14);
        if (heroSpotRef.current) {
          heroSpotRef.current.style.background =
            `radial-gradient(ellipse 520px 340px at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(255,255,255,0.028) 0%, transparent 68%)`;
        }
      };
      onLeave = () => { if (heroSpotRef.current) heroSpotRef.current.style.background = 'none'; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    }

    return () => {
      if (onMove)  card.removeEventListener('mousemove', onMove);
      if (onLeave) card.removeEventListener('mouseleave', onLeave);
      triggers.forEach(s => s.kill());
    };
  }, []);

  const heroLines: [string[], string[]] = de
    ? [['Sechs', 'Stoffe.'], ['Jede', 'mit', 'Geschichte.']]
    : [['Six', 'components.'], ['Each', 'one', 'earned.']];

  const heroStats = [
    { v: '6',      l: de ? 'Komponenten'       : 'components'          },
    { v: '12',     l: de ? 'Monate Iteration'  : 'months of iteration' },
    { v: 'μ 0.03', l: de ? 'Reibungskoeffizient' : 'friction coefficient' },
  ];

  const CHAPTER_MAP = CHAPTERS;

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <ScrollProgress />
      <ChapterNav de={de} onActiveChange={setActiveChapter} />
      <MobileChapterRail de={de} active={activeChapter} />

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
                <span className="font-mono text-[11px]" style={{ color: 'var(--accent-soft)' }}>
                  {CHAPTER_MAP[activeChapter].n}
                </span>
                <span style={{ color: 'var(--accent-soft)' }}> · </span>
                {de ? CHAPTER_MAP[activeChapter].de : CHAPTER_MAP[activeChapter].en}
              </>
            ) : (
              <>Waxcelerate <span style={{ color: 'var(--accent-soft)' }}>·</span> {de ? 'Wissenschaft' : 'Science'}</>
            )}
          </span>
          <button
            onClick={toggleLang}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all duration-200"
            style={{ color: 'var(--txm)', borderColor: 'var(--bd)', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-soft)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-soft)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bd)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--txm)'; }}
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>
      </nav>

      {/* ══ HERO — Lab Stage: cinematic photo card, mirrors the main hero ═════ */}
      <section ref={heroRef} className="relative" style={{ background: 'var(--pg)' }}>
        <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4">
          <div
            ref={heroCardRef}
            className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] will-change-transform
                       min-h-[74dvh] sm:min-h-[72dvh] flex flex-col"
            style={{
              background: '#0B0C0E',
              boxShadow: '0 28px 90px rgba(10,10,16,0.22), 0 4px 18px rgba(10,10,16,0.10)',
            }}
          >
            {/* Layer 1 — molten wax bath, chain submerged */}
            <div ref={heroImgRef} className="absolute inset-0 will-change-transform">
              <picture>
                <source srcSet="/images/hero-bath.webp" type="image/webp" />
                <img
                  src="/images/hero-bath.jpg"
                  alt={de ? 'Fahrradkette im heißen Wachsbad' : 'Bicycle chain submerged in molten wax'}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: '70% 42%' }}
                  fetchPriority="high"
                />
              </picture>
            </div>

            {/* Scrims — typography zones only */}
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{ background: 'linear-gradient(90deg, rgba(7,8,10,0.78) 0%, rgba(7,8,10,0.50) 34%, rgba(7,8,10,0.12) 60%, transparent 76%)' }}
            />
            <div
              className="absolute top-0 inset-x-0 h-24 pointer-events-none z-[1]"
              style={{ background: 'linear-gradient(to bottom, rgba(5,6,8,0.45), transparent)' }}
            />
            <div
              className="absolute bottom-0 inset-x-0 h-40 pointer-events-none z-[1]"
              style={{ background: 'linear-gradient(to top, rgba(5,6,8,0.78), transparent)' }}
            />
            {/* Mobile: stronger floor scrim — content sits over the image */}
            <div
              className="absolute inset-x-0 bottom-0 h-[64%] pointer-events-none z-[1] sm:hidden"
              style={{ background: 'linear-gradient(to top, rgba(5,6,8,0.94) 0%, rgba(5,6,8,0.74) 42%, rgba(5,6,8,0.30) 74%, transparent 100%)' }}
            />

            {/* Hexagon ornament — the MoS₂ crystal system as quiet signature */}
            <div
              ref={heroHexRef}
              aria-hidden
              className="absolute z-[1] pointer-events-none will-change-transform
                         w-[58vh] h-[58vh] sm:w-[70vh] sm:h-[70vh]
                         -right-[14vh] sm:-right-[10vh] top-1/2 -translate-y-1/2"
            >
              <svg viewBox="-110 -110 220 220" className="w-full h-full" style={{ overflow: 'visible' }}>
                <polygon points={hexPoints(0, 0, 100)} fill="none" stroke="rgba(255,255,255,0.075)" strokeWidth="0.8" />
                <polygon points={hexPoints(0, 0, 68)}  fill="none" stroke="rgba(255,255,255,0.05)"  strokeWidth="0.7" />
                <polygon points={hexPoints(0, 0, 38)}  fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.6" />
              </svg>
            </div>

            {/* Cursor spotlight */}
            <div ref={heroSpotRef} className="absolute inset-0 z-[2] pointer-events-none" />

            {/* Content — bottom-left over the calm scrim */}
            <div className="relative z-10 flex-1 flex flex-col justify-end px-6 sm:px-10 lg:px-14">
              <div ref={heroContentRef} className="max-w-2xl pb-8 sm:pb-10 will-change-transform">

                {/* Eyebrow — single brand-blue accent, like the main hero */}
                <div data-hero-item className="flex items-center gap-3 mb-5">
                  <span style={{ width: '28px', height: '2px', background: 'var(--brand-blue)' }} />
                  <p
                    className="text-[10px] sm:text-[11px] uppercase font-semibold"
                    style={{ letterSpacing: '0.34em', color: 'rgba(255,255,255,0.62)' }}
                  >
                    {de ? 'Formulierungsgeschichte' : 'Formula Story'}
                  </p>
                </div>

                {/* Headline — two Fraunces lines, words drop in */}
                <h1
                  className="font-display text-white"
                  style={{
                    fontSize: 'clamp(2.5rem, 5.4vw, 4.6rem)',
                    lineHeight: 1.02,
                    letterSpacing: '-0.025em',
                    fontWeight: 600,
                    fontVariationSettings: '"opsz" 144, "wght" 620, "SOFT" 0, "WONK" 0',
                  }}
                >
                  <span className="block" style={{ paddingBottom: '0.05em' }}>
                    {heroLines[0].map((w, i) => (
                      <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.24em]">
                        <span data-word className="inline-block will-change-transform">{w}</span>
                      </span>
                    ))}
                  </span>
                  <span className="block" style={{ paddingBottom: '0.08em' }}>
                    {heroLines[1].map((w, i) => (
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

                {/* Premise */}
                <p
                  data-hero-item
                  className="mt-5 max-w-md leading-relaxed"
                  style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {de
                    ? 'Jede Komponente in dieser Formel existiert, weil ein Test gescheitert ist — oder weil ein Kompromiss nicht akzeptabel war.'
                    : 'Every component in this formula exists because a test failed — or because a compromise was unacceptable.'}
                </p>
              </div>
            </div>

            {/* Data band — three values, hairline-columned, count up on load */}
            <div data-hero-item className="relative z-10 px-6 sm:px-10 lg:px-14">
              <div
                className="flex items-stretch justify-between sm:justify-start sm:gap-0 py-4 sm:py-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}
              >
                {heroStats.map((s, i) => (
                  <div
                    key={i}
                    className="px-3 sm:px-10 first:pl-0 last:pr-0"
                    style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.14)' : 'none' }}
                  >
                    <p
                      data-stat-val
                      className="font-display font-bold tabular-nums text-white leading-none"
                      style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}
                    >
                      {s.v}
                    </p>
                    <p
                      className="text-[9px] sm:text-[10px] uppercase mt-1.5 whitespace-nowrap"
                      style={{ letterSpacing: '0.09em', color: 'rgba(255,255,255,0.52)' }}
                    >
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPOSITION OVERVIEW ══════════════════════════════════════════════ */}
      <div className={`${W} py-16`}>
        <div className="rounded-2xl p-8 sm:p-10" style={{ background: 'linear-gradient(160deg,var(--card-from) 0%,var(--card-to) 100%)', border: '1px solid var(--bd)' }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div>
              <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
                {de ? 'Sechs Bestandteile' : 'Six components'}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-wx-tx1 mb-4 leading-tight" style={{ letterSpacing: '-0.01em' }}>
                {de ? 'Die vollständige Formel' : 'The complete formula'}
              </h2>
              <p className="text-[14px] leading-relaxed text-wx-txm mb-6">
                {de
                  ? 'Ein Jahr Iteration — von ersten Schmelzversuchen bis zur stabilen Produktion. Die Mengen werden hier nicht genannt. Was zählt: warum jede Komponente überhaupt drin ist.'
                  : 'A year of iteration — from first melt tests to stable production. Exact quantities not disclosed. What matters: why each component is in there at all.'}
              </p>
              <div className="space-y-3">
                {[
                  { catDe: 'Basismatrix',     catEn: 'Base matrix',   descDe: 'Kristallines Trägergerüst',   descEn: 'Crystalline scaffold'       },
                  { catDe: 'Plastifikator',   catEn: 'Plasticizer',   descDe: 'Kälteflexibilität & Haftung', descEn: 'Cold flexibility & adhesion' },
                  { catDe: 'Härtemodul',      catEn: 'Hardener',      descDe: 'Schmelzpunkterhöhung',        descEn: 'Drop point elevation'        },
                  { catDe: 'MoS₂',            catEn: 'MoS₂',         descDe: 'Primärer Festschmierstoff',   descEn: 'Primary solid lubricant'     },
                  { catDe: 'Dispergiermittel',catEn: 'Dispersant',    descDe: 'Partikelstabilisierung',      descEn: 'Particle stabilization'      },
                  { catDe: 'Antioxidans',     catEn: 'Antioxidant',   descDe: 'Langzeitschutz',              descEn: 'Long-term protection'        },
                ].map((item, i) => {
                  const colors = ['#1A3080','var(--accent)','var(--accent)','var(--accent-soft)','#7A9AEC','var(--accent-soft)'];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[i] }} />
                      <span className="text-[12px] font-semibold text-wx-tx1 w-28 flex-shrink-0">{de ? item.catDe : item.catEn}</span>
                      <span className="text-[12px] text-wx-txf">{de ? item.descDe : item.descEn}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--txff)' }}>
                {de ? 'Abhängigkeiten zwischen Komponenten' : 'Component dependencies'}
              </p>
              <FormulaAssembly de={de} mode="overview" isDark={isDark} />
            </div>
          </div>

          {/* Chapter quick-nav */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--bd2)' }}>
            <p className="text-[9px] uppercase tracking-[0.22em] mb-3" style={{ color: 'var(--txff)' }}>
              {de ? 'Direkt zu Kapitel' : 'Jump to chapter'}
            </p>
            <div className="flex flex-wrap gap-2">
              {CHAPTER_MAP.map(ch => (
                <button
                  key={ch.n}
                  onClick={() => document.querySelector(`[data-chapter="${ch.n}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all duration-200"
                  style={{ background: 'rgba(var(--accent-rgb),0.07)', border: '1px solid rgba(var(--accent-rgb),0.15)', color: 'var(--txm)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--accent-soft-rgb),0.35)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--accent-rgb),0.13)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--accent-rgb),0.15)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--accent-rgb),0.07)'; }}
                >
                  <span className="font-mono text-[9px] font-bold" style={{ color: 'var(--accent-soft)' }}>{ch.n}</span>
                  <span>{de ? ch.de : ch.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-5 my-14">
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
          <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'var(--txff)' }}>
            {de ? 'Kapitel für Kapitel' : 'Chapter by chapter'}
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
        </div>

        {/* ══ FAILURE TIMELINE ══════════════════════════════════════════════ */}
        <div className="mb-16">
          <FailureTimeline de={de} isDark={isDark} />
        </div>

        {/* ══ CH 01 ══════════════════════════════════════════════════════════ */}
        <Chapter num="01" de={de} anchorId="kristallstruktur"
          catDe="Die Basis" catEn="The Foundation"
          titleDe="Das kristalline Gerüst"
          titleEn="The crystalline scaffold"
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
      </div>

      {/* ══ STAT 1 ══════════════════════════════════════════════════════════════ */}
      <StatCallout de={de} isDark={isDark} stat="2°C"
        ctxDe="Erstarrungsfenster — Basis jeder Batch-Konsistenz"
        ctxEn="Solidification window — foundation of every batch"
        miniViz={<TempBandViz isDark={isDark} />} />

      {/* ══ CH 02 + CH 03 ════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20`}>
        <Chapter num="02" de={de} flip anchorId="matrix"
          catDe="Härtemodul" catEn="Hardener Module"
          titleDe="Synthetisch reines Härtewachs"
          titleEn="Synthetically pure hard wax"
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

        <Chapter num="03" de={de} anchorId="winterformel"
          catDe="Kälteflexibilität" catEn="Cold Flexibility"
          titleDe="Mikrokristallines Wachs"
          titleEn="Microcrystalline wax"
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
          visual={<TempWindowPanel de={de} />}
        />
      </div>

      {/* ══ STAT 2 ══════════════════════════════════════════════════════════════ */}
      <StatCallout de={de} isDark={isDark} stat="5.6×"
        ctxDe="Dichteunterschied MoS₂ zu Paraffin — deshalb ist Dispergierung unverzichtbar"
        ctxEn="Density ratio MoS₂ to paraffin — why dispersion is non-negotiable"
        miniViz={<DensityViz isDark={isDark} />} />

      {/* ══ CH 04 ════════════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20`}>
        <Chapter num="04" de={de} flip featured visualFirst
          catDe="Festschmierstoff" catEn="Solid Lubricant"
          titleDe="Molybdändisulfid — <5 µm"
          titleEn="Molybdenum disulfide — <5 µm"
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
      </div>

      {/* ══ STAT 3 — concludes CH04 friction claim ══════════════════════════════ */}
      <StatCallout de={de} isDark={isDark} stat="μ 0.03"
        ctxDe="Reibungskoeffizient unter Grenzschmierung — einer der niedrigsten Werte im Vergleich"
        ctxEn="Friction coefficient under boundary lubrication — among the lowest in comparison"
        miniViz={<FrictionLadderViz isDark={isDark} />} />

      {/* ══ CH 05 + CH 06 ════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20 pb-0`}>
        <Chapter num="05" de={de} anchorId="sedimentation" visualFirst
          catDe="Dispergiersystem" catEn="Dispersant System"
          titleDe="Amphiphiler Fettsäureester"
          titleEn="Amphiphilic fatty acid ester"
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

        <Chapter num="06" de={de} flip
          catDe="Langzeitstabilität" catEn="Long-term Stability"
          titleDe="Gehindertes Phenol-Antioxidans"
          titleEn="Hindered phenolic antioxidant"
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
                  <div key={i} className="flex gap-3.5 p-3.5 rounded-xl" style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.13)' }}>
                    <span className="font-display text-[22px] font-bold tabular-nums flex-shrink-0 leading-none mt-0.5" style={{ color: 'rgba(var(--accent-rgb),0.28)' }}>{item.n}</span>
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
      </div>

      {/* ══ SYNTHESIS REVEAL — standalone full section ═══════════════════════ */}
      <section
        style={{
          background: isDark ? 'rgba(var(--accent-strong-rgb),0.10)' : 'rgba(var(--accent-rgb),0.04)',
          borderTop: isDark ? '1px solid rgba(var(--accent-soft-rgb),0.12)' : '1px solid rgba(var(--accent-rgb),0.08)',
          borderBottom: isDark ? '1px solid rgba(var(--accent-soft-rgb),0.12)' : '1px solid rgba(var(--accent-rgb),0.08)',
        }}
      >
        <div className={`${W} py-24`}>
          <SynthesisReveal de={de} isDark={isDark} />
        </div>
      </section>

      {/* ══ WHAT THIS MEANS FOR YOU — outcome bridge before results ══════════ */}
      <OutcomeBand de={de} isDark={isDark} />

      {/* ══ RESULTS ═══════════════════════════════════════════════════════════ */}
      <section
        id="reibung"
        style={{
          background: isDark ? '#07070A' : 'var(--sf2)',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--bd)',
        }}
      >
        <div className={`${W} py-24`}>
          <div className="text-center mb-14">
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Das Ergebnis' : 'The Result'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight" style={{ color: isDark ? '#FAFAFA' : 'var(--tx1)', letterSpacing: '-0.01em' }}>
              {de ? 'Was die Formel leistet' : 'What the formula delivers'}
            </h2>
            <p className="mt-4 text-[14px] max-w-md mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>
              {de
                ? 'Sechs Entscheidungen. Kein Kompromiss in der Kette.'
                : 'Six decisions. No compromise in the chain.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FrictionBars de={de} />
            <VizFrame
              eyebrow={de ? 'MoS₂-Verteilung im Gussblock' : 'MoS₂ distribution in cast block'}
              chip={de ? 'Oben = Mitte = Unten' : 'Top = Mid = Bottom'}
              footer={
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                  {de
                    ? 'MoS₂ ist 5,6× dichter als Paraffin. Der Fettsäureester verhindert Sedimentation.'
                    : 'MoS₂ is 5.6× denser than paraffin. The fatty acid ester prevents sedimentation.'}
                </p>
              }
            >
              <div className="grid grid-cols-3 gap-3 mb-5">
                {(de ? ['Oben', 'Mitte', 'Unten'] : ['Top', 'Mid', 'Bottom']).map((label, si) => (
                  <div key={si} className="flex flex-col items-center gap-2">
                    <div className="w-full rounded-lg p-3" style={{ background: 'rgba(var(--accent-rgb),0.05)', border: '1px solid rgba(var(--accent-rgb),0.12)' }}>
                      <div className="grid grid-cols-4 gap-2 justify-items-center py-1">
                        {[...Array(12)].map((_, j) => (
                          <div key={j} className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)', opacity: 0.5 + (j % 4) * 0.12 }} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-center" style={{ color: 'var(--accent-soft)', opacity: 0.6 }}>{label}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: de ? 'kein Gradient' : 'no gradient', sub: de ? 'von oben bis unten' : 'top to bottom' },
                  { val: 'Block 1 = 20', sub: de ? 'identische Performance' : 'identical performance' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-lg" style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.15)' }}>
                    <CountUp value={s.val} className="font-display italic text-[18px] font-bold" style={{ color: 'var(--accent)' }} />
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--txm)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </VizFrame>
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section style={{
        background: isDark ? 'linear-gradient(160deg, #07070A 0%, #0B1830 55%, #07070A 100%)' : 'var(--sf3)',
        borderTop: isDark ? '1px solid rgba(var(--accent-soft-rgb),0.1)' : '1px solid var(--bd)',
      }}>
        <div className={`${W} py-20 text-center`}>
          <p className="eyebrow mb-4" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Bereit?' : 'Ready?'}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 leading-tight" style={{ color: isDark ? '#FAFAFA' : 'var(--tx1)', letterSpacing: '-0.01em' }}>
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
                background: isDark ? 'linear-gradient(135deg,#1A3080,var(--accent))' : 'var(--cta-bg)',
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
