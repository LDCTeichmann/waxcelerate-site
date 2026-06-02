import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
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

const HERO_PARTICLES = [
  { cx: 22,  cy: 300, r: 1.5, dur: 6.2, dx: 10  },
  { cx: 68,  cy: 240, r: 2,   dur: 5.1, dx: -9  },
  { cx: 118, cy: 330, r: 1.5, dur: 7.0, dx: 12  },
  { cx: 172, cy: 200, r: 2.5, dur: 5.5, dx: -11 },
  { cx: 218, cy: 280, r: 1.5, dur: 6.8, dx: 9   },
  { cx: 268, cy: 160, r: 2,   dur: 4.9, dx: -13 },
  { cx: 315, cy: 315, r: 1.5, dur: 6.3, dx: 11  },
  { cx: 370, cy: 235, r: 2,   dur: 5.7, dx: -9  },
  { cx: 425, cy: 185, r: 1.5, dur: 6.5, dx: 13  },
  { cx: 478, cy: 320, r: 2.5, dur: 5.2, dx: -10 },
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

// ─── Hero floating particles ──────────────────────────────────────────────────
function HeroParticles() {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const nodes = svgRef.current?.querySelectorAll<SVGCircleElement>('.hp');
      if (!nodes?.length) return;
      HERO_PARTICLES.forEach((p, i) => {
        const el = nodes[i];
        if (!el) return;
        gsap.fromTo(el,
          { attr: { cy: p.cy + 50 } },
          { attr: { cy: p.cy - 130 }, duration: p.dur, ease: 'none', repeat: -1, delay: i * 0.55 },
        );
        gsap.to(el, {
          attr: { cx: p.cx + p.dx },
          duration: 2.8 + i * 0.25,
          repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2,
        });
      });
    }, svgRef);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={svgRef} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
      {HERO_PARTICLES.map((p, i) => (
        <circle key={i} className="hp" cx={p.cx} cy={p.cy} r={p.r} fill="#4472D4" opacity="0.14" />
      ))}
    </svg>
  );
}

// ─── Chapter navigation sidebar ───────────────────────────────────────────────
function ChapterNav({ de }: { de: boolean }) {
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
        if (e.isIntersecting) setActive(parseInt(e.target.getAttribute('data-chapter') ?? '1', 10) - 1);
      }),
      { threshold: 0.25, rootMargin: '-5% 0px -58% 0px' },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
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

// ─── Stat callout — full-bleed dark section ───────────────────────────────────
function StatCallout({ stat, ctxDe, ctxEn, de, isDark }: { stat: string; ctxDe: string; ctxEn: string; de: boolean; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div
      ref={ref}
      className="w-full py-10 sm:py-14 flex flex-col items-center text-center"
      style={isDark ? {
        background: '#07070A',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        opacity: 0,
      } : {
        background: 'var(--sf2)',
        borderTop: '1px solid var(--bd)',
        borderBottom: '1px solid var(--bd)',
        opacity: 0,
      }}
    >
      <p className="font-serif-display italic font-bold leading-none select-none"
        style={{
          fontSize: 'clamp(2.8rem,7vw,4.5rem)',
          color: isDark ? '#3060C8' : '#1A3C6E',
          textShadow: isDark ? '0 0 60px rgba(43,82,176,0.55), 0 0 130px rgba(43,82,176,0.22)' : 'none',
        }}>
        {stat}
      </p>
      <p className="text-[11px] uppercase tracking-[0.3em] mt-5 max-w-[400px] leading-relaxed"
        style={{ color: isDark ? 'rgba(255,255,255,0.50)' : 'var(--txm)' }}>
        {de ? ctxDe : ctxEn}
      </p>
    </div>
  );
}

// ─── Formula Assembly System Map ─────────────────────────────────────────────
// Radial zone diagram. Each component color-coded by functional role:
//   Paraffin → steel-blue (neutral carrier scaffold)
//   FT-Wachs → amber      (thermal hardener — communicates HEAT)
//   Mikrokris.→ ice-cyan  (cold-flex modifier — communicates COLD)
//   MoS₂     → cobalt     (active lubricant — dominant center)
//   Dispersant→ violet    (particle stabilizer chemistry)
//   Antioxidans→ emerald  (oxidation protector / longevity)
// Metric value is the PRIMARY text inside each node — name is secondary.
// Edge direction = "A → B means A enables / modifies B".
const GRAPH_CX = 320;
const GRAPH_CY = 258;

// Per-component accent colors encode functional role.
// amber=thermal · cyan=cold · cobalt=active lubricant · violet=stabilizer chemistry · emerald=protection
const NODE_COLORS: Record<number, { accent: string; darkA: string; darkB: string; lightA: string; lightB: string; zoneFill: string }> = {
  1: { accent: '#7A98B8', darkA: '#223660', darkB: '#0D1A30', lightA: '#EEF4FF', lightB: '#D2E2F4', zoneFill: 'rgba(120,152,184,0.22)' },
  2: { accent: '#C4802A', darkA: '#3C2010', darkB: '#1C0C04', lightA: '#FFF5E8', lightB: '#F8DDB8', zoneFill: 'rgba(196,128,42,0.18)'  },
  3: { accent: '#2AAAC8', darkA: '#0C3A4A', darkB: '#041820', lightA: '#E8F8FF', lightB: '#C0E8F8', zoneFill: 'rgba(42,170,200,0.18)'  },
  4: { accent: '#4472D4', darkA: '#1C3C9C', darkB: '#060E28', lightA: '#E8EFFF', lightB: '#C4D4FF', zoneFill: 'rgba(68,114,212,0.30)'  },
  5: { accent: '#8058D0', darkA: '#281458', darkB: '#100828', lightA: '#F4EEFF', lightB: '#DDD0F8', zoneFill: 'rgba(128,88,208,0.18)'  },
  6: { accent: '#28B080', darkA: '#0A3028', darkB: '#041814', lightA: '#E4FFF5', lightB: '#BCEEE0', zoneFill: 'rgba(40,176,128,0.18)'  },
};

const ASSEMBLY_NODES = [
  { id: 1, labelDe: 'Paraffin',     labelEn: 'Paraffin',    subDe: 'Trägermatrix',   subEn: 'Base scaffold',  cx: 320,      cy: 118, r: 34, metric: '58–60°C', msDe: 'Erstarrungsb.',   msEn: 'Solidif. range'  },
  { id: 2, labelDe: 'FT-Wachs',     labelEn: 'FT-Wax',      subDe: 'Härtemodul',     subEn: 'Hardener',       cx: 93,       cy: 180, r: 30, metric: '+14°C',   msDe: 'Tropfpunkt',      msEn: 'Drop point'      },
  { id: 3, labelDe: 'Mikrokris.',    labelEn: 'Microcris.',   subDe: 'Kälteflex.',     subEn: 'Cold flex.',     cx: 547,      cy: 180, r: 30, metric: '−10°C',   msDe: 'Flexgrenze',      msEn: 'Flex limit'      },
  { id: 4, labelDe: 'MoS₂',         labelEn: 'MoS₂',        subDe: 'Festschmierst.', subEn: 'Solid lubricant',cx: GRAPH_CX, cy: GRAPH_CY, r: 50, metric: 'μ 0.03', msDe: '< 5 µm',     msEn: '< 5 µm'          },
  { id: 5, labelDe: 'Dispergierm.', labelEn: 'Dispersant',   subDe: 'Partikelstab.',  subEn: 'Particle stab.', cx: 108,      cy: 412, r: 30, metric: '5.6×',    msDe: 'Dichtekomp.',     msEn: 'Density ratio'   },
  { id: 6, labelDe: 'Antioxidans',  labelEn: 'Antioxidant',  subDe: 'MoO₃-Schutz',   subEn: 'MoO₃ shield',   cx: 532,      cy: 412, r: 30, metric: '12 Mo.',  msDe: 'Lagerstab.',      msEn: 'Shelf life'      },
] as const;

const ASSEMBLY_EDGES = [
  { from: 2, to: 1, labelDe: 'Ko-Kristallisation',   labelEn: 'co-crystallises'    },
  { from: 3, to: 1, labelDe: 'Plastifiziert Matrix', labelEn: 'plasticises matrix' },
  { from: 1, to: 4, labelDe: 'Trägermatrix',          labelEn: 'carrier matrix'     },
  { from: 3, to: 4, labelDe: 'Partikeleinbettung',   labelEn: 'particle embedding' },
  { from: 5, to: 4, labelDe: 'Sterische Barriere',   labelEn: 'steric barrier'     },
  { from: 6, to: 4, labelDe: 'Schützt vor MoO₃',    labelEn: 'prevents MoO₃'     },
] as const;

function curvedEdge(ax: number, ay: number, bx: number, by: number, ra: number, rb: number) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const x1 = ax + ux * (ra + 5), y1 = ay + uy * (ra + 5);
  const x2 = bx - ux * (rb + 6), y2 = by - uy * (rb + 6);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const cpx = mx - (GRAPH_CX - mx) * 0.30;
  const cpy = my - (GRAPH_CY - my) * 0.30;
  const lx = 0.25 * x1 + 0.5 * cpx + 0.25 * x2;
  const ly = 0.25 * y1 + 0.5 * cpy + 0.25 * y2;
  const ex = x2 - x1, ey = y2 - y1, el = Math.sqrt(ex * ex + ey * ey);
  const px = -ey / el, py = ex / el;
  const sign = (px * (GRAPH_CX - lx) + py * (GRAPH_CY - ly)) <= 0 ? 1 : -1;
  return { path: `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`, lx: lx + sign * px * 16, ly: ly + sign * py * 16, len };
}

function FormulaAssembly({ de, mode, isDark }: { de: boolean; mode: 'overview' | 'synthesis'; isDark: boolean }) {
  const svgRef   = useRef<SVGSVGElement>(null);
  const edgeRefs = useRef<(SVGPathElement | null)[]>([]);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const didAnimate = useRef(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [canHover,    setCanHover]    = useState(mode === 'overview');

  const isOverview = mode === 'overview';
  const uid = `fa-${mode}-${isDark ? 'd' : 'l'}`;

  // ── Shared color tokens ───────────────────────────────────────────────────
  const ringClr     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,48,100,0.08)';
  const edgeClrBase = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(26,48,100,0.14)';
  const edgeClrHot  = isDark ? 'rgba(255,255,255,0.90)' : '#1a3c8e';
  const edgeLblClr  = isDark ? 'rgba(200,220,255,0.60)' : 'rgba(30,60,140,0.58)';
  const pillBg      = isDark ? 'rgba(10,16,36,0.90)'    : 'rgba(230,238,255,0.95)';
  const pillBgHot   = isDark ? 'rgba(20,36,90,0.95)'    : 'rgba(210,226,255,0.98)';


  // ── Zone fills — strong enough to actually see ────────────────────────────
  // Inner zone (Paraffin, r≈140): cobalt tint — the carrier zone
  const z1Fill = isDark ? 'rgba(40,70,160,0.28)' : 'rgba(68,114,212,0.10)';
  // Mid zone (FT-Wachs+Mikrokris., r≈240): mixed amber+cyan warm/cool blend
  const z2Fill = isDark ? 'rgba(30,55,120,0.18)' : 'rgba(68,114,212,0.06)';
  // Outer zone (stabilizers, r≈290)
  const z3Fill = isDark ? 'rgba(20,38,80,0.12)'  : 'rgba(68,114,212,0.03)';

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

  // ── Animation ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'synthesis' || didAnimate.current) return;
    const ctx = gsap.context(() => {
      const mos2 = ASSEMBLY_NODES[3];
      gsap.set(nodeRefs.current[3], { opacity: 0, scale: 0, svgOrigin: `${mos2.cx} ${mos2.cy}` });
      ASSEMBLY_NODES.forEach((node, i) => {
        if (i === 3) return;
        const el = nodeRefs.current[i];
        if (!el) return;
        gsap.set(el, { opacity: 0, x: mos2.cx - node.cx, y: mos2.cy - node.cy });
      });
      edgeRefs.current.forEach(e => { if (e) gsap.set(e, { strokeDashoffset: 1, opacity: 0 }); });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: svgRef.current, start: 'top 80%', once: true },
        onComplete: () => { didAnimate.current = true; setCanHover(true); },
      });

      tl.to(nodeRefs.current[3], { opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(1.8)', svgOrigin: `${mos2.cx} ${mos2.cy}` });

      const flyOrder = [0, 2, 1, 5, 4];
      flyOrder.forEach((idx, j) => {
        const el = nodeRefs.current[idx];
        if (!el) return;
        tl.to(el, { opacity: 1, x: 0, y: 0, duration: 0.55, ease: 'power3.out' }, j === 0 ? '>-0.10' : '<0.10');
      });

      edgeRefs.current.forEach((edge, i) => {
        if (!edge) return;
        tl.to(edge, { strokeDashoffset: 0, opacity: 1, duration: 0.50, ease: 'power2.inOut' }, i === 0 ? '>-0.15' : '<0.08');
      });

      tl.to(nodeRefs.current[3], { scale: 1.09, duration: 0.22, ease: 'power2.out', svgOrigin: `${mos2.cx} ${mos2.cy}` }, '>0.10');
      tl.to(nodeRefs.current[3], { scale: 1.00, duration: 0.55, ease: 'elastic.out(1, 0.5)', svgOrigin: `${mos2.cx} ${mos2.cy}` });
    }, svgRef);
    return () => ctx.revert();
  }, [mode]);

  return (
    <div className="w-full select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 640 500"
        className="w-full hidden sm:block"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Per-node radial gradients — color-coded by function */}
          {ASSEMBLY_NODES.map(node => {
            const c = NODE_COLORS[node.id];
            const isMos = node.id === 4;
            const gA = isMos ? (isDark ? '#2256D0' : '#3060D8') : (isDark ? c.darkA : c.lightA);
            const gB = isMos ? (isDark ? '#050E28' : '#0A1E60') : (isDark ? c.darkB : c.lightB);
            return (
              <radialGradient key={node.id} id={`${uid}-g${node.id}`} cx="32%" cy="26%" r="74%">
                <stop offset="0%"   stopColor={gA} />
                <stop offset="100%" stopColor={gB} />
              </radialGradient>
            );
          })}

          {/* Arrowhead markers — per-mode */}
          <marker id={`${uid}-ao`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={edgeClrBase} />
          </marker>
          <marker id={`${uid}-as`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={edgeClrHot} />
          </marker>
          <marker id={`${uid}-ah`} markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto">
            <path d="M0,0.5 L0,5.5 L5.5,3 z" fill={edgeClrHot} />
          </marker>
        </defs>

        {/* ── Zone background fills ── */}
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={295} fill={z3Fill} />
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={250} fill={z2Fill} />
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={158} fill={z1Fill} />

        {/* ── Zone ring borders ── */}
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={158} fill="none" stroke={ringClr} strokeWidth={1} strokeDasharray="3 6" />
        <circle cx={GRAPH_CX} cy={GRAPH_CY} r={250} fill="none" stroke={ringClr} strokeWidth={1} strokeDasharray="3 6" />

        {/* ── Zone function labels (synthesis only) — right side with tick ── */}
        {!isOverview && (() => {
          const lx = GRAPH_CX + 165;
          const lClr = isDark ? 'rgba(180,200,240,0.28)' : 'rgba(42,80,160,0.22)';
          const tickClr = isDark ? 'rgba(180,200,240,0.15)' : 'rgba(42,80,160,0.14)';
          return (
            <>
              {/* Carrier zone label */}
              <line x1={GRAPH_CX + 158} y1={GRAPH_CY} x2={lx - 4} y2={GRAPH_CY} stroke={tickClr} strokeWidth={0.8} />
              <text x={lx} y={GRAPH_CY} textAnchor="start" dominantBaseline="middle"
                fontSize="7" fontFamily="monospace" letterSpacing="0.14em" fill={lClr}>
                {de ? 'TRÄGER' : 'CARRIER'}
              </text>
              {/* Modifier zone label */}
              <line x1={GRAPH_CX + 250} y1={GRAPH_CY - 60} x2={GRAPH_CX + 265} y2={GRAPH_CY - 60} stroke={tickClr} strokeWidth={0.8} />
              <text x={GRAPH_CX + 268} y={GRAPH_CY - 60} textAnchor="start" dominantBaseline="middle"
                fontSize="7" fontFamily="monospace" letterSpacing="0.14em" fill={lClr}>
                {de ? 'MODIFIKATION' : 'MODIFICATION'}
              </text>
              {/* Stabilizer zone label */}
              <line x1={GRAPH_CX + 250} y1={GRAPH_CY + 60} x2={GRAPH_CX + 265} y2={GRAPH_CY + 60} stroke={tickClr} strokeWidth={0.8} />
              <text x={GRAPH_CX + 268} y={GRAPH_CY + 60} textAnchor="start" dominantBaseline="middle"
                fontSize="7" fontFamily="monospace" letterSpacing="0.14em" fill={lClr}>
                {de ? 'STABILISIERUNG' : 'STABILIZATION'}
              </text>
            </>
          );
        })()}

        {/* ── Edges ── */}
        {ASSEMBLY_EDGES.map((edge, i) => {
          const a = ASSEMBLY_NODES[edge.from - 1];
          const b = ASSEMBLY_NODES[edge.to - 1];
          const { path, lx, ly } = curvedEdge(a.cx, a.cy, b.cx, b.cy, a.r, b.r);
          const label   = de ? edge.labelDe : edge.labelEn;
          const hot     = isEdgeHot(edge.from, edge.to);
          const dimmed  = isEdgeDimmed(edge.from, edge.to);
          // In synthesis mode, edge color matches the SOURCE node's accent
          const srcAccent = NODE_COLORS[edge.from].accent;
          const stroke  = hot
            ? (isDark ? 'rgba(255,255,255,0.88)' : edgeClrHot)
            : isOverview
              ? edgeClrBase
              : (isDark ? `${srcAccent}CC` : `${srcAccent}AA`);
          const sw      = hot ? 2.2 : isOverview ? 0.9 : 1.6;
          const arrow   = hot ? `url(#${uid}-ah)` : isOverview ? `url(#${uid}-ao)` : `url(#${uid}-as)`;
          const pillW   = label.length * 5.4 + 18;

          return (
            <g key={i} style={{ opacity: dimmed ? 0.09 : 1, transition: 'opacity 0.22s ease' }}>
              <path
                ref={el => { edgeRefs.current[i] = el; }}
                d={path}
                pathLength="1"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="round"
                fill="none"
                markerEnd={arrow}
                style={mode === 'synthesis'
                  ? { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0, transition: 'stroke 0.2s, stroke-width 0.2s' }
                  : { transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
              {!isOverview && (
                <g transform={`translate(${lx},${ly})`} style={{ pointerEvents: 'none' }}>
                  <rect x={-pillW / 2} y={-7.5} width={pillW} height={15} rx={4}
                    fill={hot ? pillBgHot : pillBg} style={{ transition: 'fill 0.2s' }} />
                  <text x={0} y={0} textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fontFamily="monospace" letterSpacing="0.01em"
                    fill={hot ? edgeClrHot : edgeLblClr} style={{ transition: 'fill 0.2s' }}>
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
          const isHot    = hoveredNode === node.id;
          const colors   = NODE_COLORS[node.id];
          const accent   = colors.accent;
          const subAbove = node.id <= 3;
          const scaleV   = isHot ? (isMos ? 1.06 : 1.10) : 1;

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
              {isMos && (
                <>
                  <circle cx={node.cx} cy={node.cy} r={node.r + 18} fill="none"
                    stroke={isDark ? `${accent}30` : `${accent}22`} strokeWidth={1.2} />
                  <circle cx={node.cx} cy={node.cy} r={node.r + 34} fill="none"
                    stroke={isDark ? `${accent}14` : `${accent}10`} strokeWidth={0.8} />
                </>
              )}

              {/* Main circle — filled with per-node gradient, accented stroke */}
              <circle
                cx={node.cx} cy={node.cy} r={node.r}
                fill={`url(#${uid}-g${node.id})`}
                stroke={isHot ? accent : (isDark ? `${accent}80` : `${accent}CC`)}
                strokeWidth={isHot ? (isMos ? 2.8 : 2.4) : (isMos ? 2.2 : 1.8)}
                style={{
                  transform: `scale(${scaleV})`,
                  transformOrigin: `${node.cx}px ${node.cy}px`,
                  transition: 'transform 0.22s ease, stroke 0.2s, stroke-width 0.2s',
                  filter: isHot
                    ? `drop-shadow(0 0 ${isMos ? 24 : 10}px ${accent}88)`
                    : isMos
                      ? `drop-shadow(0 0 16px ${accent}55)`
                      : `drop-shadow(0 2px 6px ${accent}28)`,
                }}
              />

              {/* MoS₂ — name (small) + metric (large) + spec (tiny) */}
              {isMos && (<>
                <text x={node.cx} y={node.cy - 14} textAnchor="middle" dominantBaseline="middle"
                  fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif"
                  letterSpacing="-0.01em"
                  fill={isDark ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.98)'}>
                  MoS₂
                </text>
                <text x={node.cx} y={node.cy + 4} textAnchor="middle" dominantBaseline="middle"
                  fontSize="20" fontWeight="800" fontFamily="system-ui, sans-serif"
                  letterSpacing="-0.04em"
                  fill={isDark ? '#a0d0ff' : '#c8e4ff'}
                  style={{ filter: `drop-shadow(0 0 10px ${accent}88)` }}>
                  μ 0.03
                </text>
                <text x={node.cx} y={node.cy + 22} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontFamily="monospace" letterSpacing="0.05em"
                  fill="rgba(255,255,255,0.40)">
                  {'< 5 µm · 5.06 g/cm³'}
                </text>
              </>)}

              {/* Satellites — metric LARGE (primary), name SMALL (secondary) */}
              {!isMos && (<>
                {/* Metric value — the scientific reason it's in the formula */}
                <text x={node.cx} y={node.cy - 3} textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="800" fontFamily="system-ui, sans-serif"
                  letterSpacing="-0.03em"
                  fill={isDark ? accent : accent}
                  style={{ filter: isHot ? `drop-shadow(0 0 6px ${accent}88)` : 'none' }}>
                  {node.metric}
                </text>
                {/* Component name — secondary, below metric */}
                <text x={node.cx} y={node.cy + 11} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8.5" fontWeight="600" fontFamily="system-ui, sans-serif"
                  letterSpacing="0.01em"
                  fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(20,40,80,0.55)'}>
                  {de ? node.labelDe : node.labelEn}
                </text>
              </>)}

              {/* Function role tag — outside, above or below */}
              {!isMos && (
                <text
                  x={node.cx}
                  y={subAbove ? node.cy - node.r - 8 : node.cy + node.r + 13}
                  textAnchor="middle"
                  dominantBaseline={subAbove ? 'auto' : 'middle'}
                  fontSize="7.5" fontFamily="monospace" letterSpacing="0.08em"
                  fill={isDark ? `${accent}88` : `${accent}BB`}>
                  {de ? node.subDe : node.subEn}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* ── Mobile: clean uniform-blue grid ── */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {ASSEMBLY_NODES.map(node => {
          const isMos = node.id === 4;
          return (
            <div key={node.id} className="rounded-xl p-2.5 text-center"
              style={{
                background: isMos
                  ? 'linear-gradient(145deg, #1C3C9C, #060E28)'
                  : (isDark ? 'rgba(26,52,110,0.18)' : 'rgba(68,114,212,0.08)'),
                border: `1.5px solid ${isMos ? '#3d6ad4' : (isDark ? 'rgba(68,114,212,0.30)' : 'rgba(42,84,153,0.22)')}`,
              }}>
              <p className="text-[12px] font-bold leading-tight"
                style={{ color: isMos ? '#88c0ff' : (isDark ? '#7aaaff' : '#1a3c8e') }}>
                {node.metric}
              </p>
              <p className="text-[8.5px] font-semibold mt-0.5"
                style={{ color: isMos ? 'rgba(255,255,255,0.80)' : (isDark ? 'rgba(255,255,255,0.70)' : 'rgba(20,40,80,0.70)') }}>
                {de ? node.labelDe : node.labelEn}
              </p>
              <p className="text-[7px] mt-0.5"
                style={{ color: isMos ? 'rgba(255,255,255,0.38)' : (isDark ? 'rgba(140,180,240,0.45)' : 'rgba(42,84,153,0.50)') }}>
                {de ? node.subDe : node.subEn}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Synthesis Reveal — full section after Ch06 ───────────────────────────────
function SynthesisReveal({ de, isDark }: { de: boolean; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  const divClr = isDark ? 'rgba(255,255,255,0.08)' : 'var(--bd)';
  return (
    <div ref={ref} className="rounded-2xl p-8 sm:p-10" style={{ background: isDark ? 'rgba(26,60,110,0.14)' : 'rgba(26,60,110,0.06)', border: `1px solid ${isDark ? 'rgba(68,114,212,0.22)' : 'rgba(26,60,110,0.18)'}`, opacity: 0 }}>
      <div className="text-center mb-8">
        <p className="text-[9px] uppercase tracking-[0.28em] mb-2" style={{ color: '#4472D4' }}>
          {de ? 'Das vollständige System' : 'The complete system'}
        </p>
        <h2 className="font-serif-display text-[1.6rem] sm:text-[2rem] font-bold leading-tight text-wx-tx1 mb-3">
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
            <div className="w-4 h-px" style={{ background: '#4472D4', opacity: 0.6 }} />
            <span className="text-[9px] font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(26,60,110,0.55)' }}>
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
      <div className="flex items-center gap-3 mb-5">
        <p className="text-[9px] uppercase tracking-[0.28em]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--txff)' }}>
          {de ? 'Entwicklungsiterationen — nur dokumentierte Fakten' : 'Development iterations — documented facts only'}
        </p>
      </div>
      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:flex items-start gap-0 relative">
        {/* connector line */}
        <div className="absolute top-[18px] left-0 right-0 h-px" style={{ background: lineClr }} />
        {FAILURES.map((f, i) => (
          <div key={i} className="ft-item flex-1 flex flex-col items-center px-2 opacity-0" style={{ minWidth: 0 }}>
            {/* Dot */}
            <div
              className="w-[18px] h-[18px] rounded-full flex-shrink-0 z-10 flex items-center justify-center mb-3"
              style={{
                background: f.isCurrent ? '#2A5499' : dotFail,
                border: `2px solid ${f.isCurrent ? '#4472D4' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(26,60,110,0.20)')}`,
                boxShadow: f.isCurrent ? '0 0 10px rgba(68,114,212,0.5)' : 'none',
              }}
            />
            {/* Card */}
            <div className="w-full rounded-xl p-3" style={{ background: f.isCurrent ? (isDark ? 'rgba(26,60,110,0.20)' : 'rgba(26,60,110,0.07)') : cardBg, border: `1px solid ${f.isCurrent ? 'rgba(68,114,212,0.30)' : cardBd}` }}>
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
              <div className="w-3 h-3 rounded-full" style={{ background: f.isCurrent ? '#2A5499' : dotFail, border: `1.5px solid ${f.isCurrent ? '#4472D4' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(26,60,110,0.20)')}` }} />
              {i < FAILURES.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: lineClr, minHeight: '20px' }} />}
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
      style={{ ...vizCard, ...dotGrid, transition: 'box-shadow 0.35s ease', boxShadow: hov ? '0 0 0 1px rgba(68,114,212,0.4), 0 8px 32px rgba(26,60,110,0.3)' : 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
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
        <line x1="8" y1={GAP_Y} x2="310" y2={GAP_Y} stroke={vdwClr} strokeWidth="1" strokeDasharray="5 4" />
        <text x="316" y={GAP_Y + 4} fontSize="8.5" fill={vdwTxt} fontFamily="monospace">vdW</text>
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
            {de ? '· Hover: Schicht gleitet' : '· Hover: layer shears'}
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = ref.current;
      if (!container) return;

      const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
      const films     = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
      const label     = container.querySelector<SVGTextElement>('.tf-label');

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 74%', once: true },
      });

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
      style={{ ...vizCard, ...dotGrid, transition: 'box-shadow 0.35s ease', boxShadow: hov ? '0 0 0 1px rgba(68,114,212,0.4), 0 8px 32px rgba(26,60,110,0.30)' : 'none' }}
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
    </div>
  );
}

// ─── Crystal lattice — lamellar chain visualization ──────────────────────────
// Shows aligned hydrocarbon chains packed in parallel layers (the actual lamellar structure)
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

  // 3 crystal layers, each with 7 parallel chain rods
  const LAYERS = [
    { yCenter: 36,  color: '#4472D4' },
    { yCenter: 96,  color: '#3D67CA' },
    { yCenter: 156, color: '#4472D4' },
  ];
  const CHAIN_W = 46, CHAIN_H = 9, CHAIN_GAP = 7;
  const CHAINS = 7;
  const totalChainWidth = CHAINS * CHAIN_W + (CHAINS - 1) * CHAIN_GAP;
  const startX = (395 - totalChainWidth) / 2;

  // Van der Waals gap positions (between layers)
  const VDW_Y = [66, 126];

  useEffect(() => {
    const rods = svgRef.current?.querySelectorAll<SVGRectElement>('.chain-rod');
    if (!rods?.length) return;
    rods.forEach((rod, i) => {
      gsap.to(rod, {
        x: (i % 3 === 0 ? 1.5 : i % 3 === 1 ? -1.5 : 0.8),
        duration: 1.6 + (i % 5) * 0.28,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: i * 0.09,
      });
    });
    return () => gsap.killTweensOf(Array.from(rods));
  }, []);

  return (
    <div className="w-full rounded-2xl overflow-hidden p-5" style={{ ...vizCard, ...dotGrid }}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: txMid }}>
        {de ? 'Lamellare Kristallstruktur — C₂₀–C₃₆' : 'Lamellar crystal structure — C₂₀–C₃₆'}
      </p>
      <svg ref={svgRef} viewBox="0 0 395 192" className="w-full">
        {/* Layer background bands */}
        {LAYERS.map((l, li) => (
          <rect key={li} x="0" y={l.yCenter - 22} width="395" height="44"
            fill={li % 2 === 0 ? bandA : bandB} />
        ))}
        {/* Van der Waals gap lines */}
        {VDW_Y.map((y, i) => (
          <g key={i}>
            <line x1="12" y1={y} x2="340" y2={y} stroke={vdwClr} strokeWidth="0.8" strokeDasharray="5 4" />
            <text x="348" y={y + 4} fontSize="8.5" fill={vdwTxt} fontFamily="monospace" textAnchor="start">vdW</text>
          </g>
        ))}
        {/* Chain rods */}
        {LAYERS.map((l, li) =>
          [...Array(CHAINS)].map((_, ci) => {
            const x = startX + ci * (CHAIN_W + CHAIN_GAP);
            return (
              <rect
                key={`${li}-${ci}`}
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
        {/* Side bracket showing one crystal layer */}
        <line x1="10" y1={LAYERS[1].yCenter - 20} x2="10" y2={LAYERS[1].yCenter + 20}
          stroke={bktClr} strokeWidth="1" />
        <text x="14" y={LAYERS[1].yCenter + 4} fontSize="8.5" fill={bktTxt} fontFamily="monospace">
          {de ? 'Kristallebene' : 'Crystal plane'}
        </text>
      </svg>
      <div className="flex items-center justify-center gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${divClr}` }}>
        <div className="w-7 h-2.5 rounded-full" style={{ background: '#4472D4', opacity: 0.75 }} />
        <span className="text-[9px] font-mono" style={{ color: txMid }}>
          {de ? 'Kohlenwasserstoffkette, parallel ausgerichtet' : 'Hydrocarbon chain, aligned in parallel'}
        </span>
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
      // "Without": top floating dots drift downward (sedimentation)
      const floating = wRef.current?.querySelectorAll<HTMLElement>('.sp-float');
      if (floating?.length) {
        gsap.to(floating, {
          y: 32, opacity: 0.18,
          duration: 3.0, ease: 'power1.in',
          stagger: 0.18,
          scrollTrigger: { trigger: wRef.current, start: 'top 78%', once: true },
        });
      }
      // "With": uniformly distributed dots gently breathe
      const stable = mRef.current?.querySelectorAll<HTMLElement>('.sp-stable');
      if (stable?.length) {
        gsap.to(stable, {
          scale: 0.82, opacity: 0.72,
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
          <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '90px', background: 'var(--bd2)', border: '1px solid var(--bd)' }}>
            <div className="absolute inset-x-0 top-2 flex flex-wrap gap-1.5 px-3 justify-center">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="sp-float w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#2A5499', opacity: 0.8 }} />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 p-2 justify-center rounded-b" style={{ background: 'rgba(26,60,110,0.2)' }}>
              {[...Array(14)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full" style={{ background: '#1A3C6E' }} />)}
            </div>
          </div>
          <p className="text-[11px] font-semibold text-wx-tx1 mt-2">{de ? 'Ohne' : 'Without'}</p>
          <p className="text-[10px] text-center mt-0.5" style={{ color: 'var(--txff)' }}>{de ? 'Gradient im Block' : 'Gradient in block'}</p>
        </div>
        <div ref={mRef} className="flex flex-col items-center">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '90px', background: 'var(--bd2)', border: '1px solid var(--bd)' }}>
            <div className="absolute inset-0 flex flex-wrap gap-1.5 p-3 items-center justify-center">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="sp-stable w-2 h-2 rounded-full" style={{ background: '#2A5499', opacity: 0.9 }} />
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
  de: boolean;
}

function Chapter({ num, anchorId, catDe, catEn, titleDe, titleEn, ledeDe, ledeEn, teaserDe, teaserEn, bodyDe, bodyEn, insightDe, insightEn, visual, extraVisual, flip, featured, de }: ChapterProps) {
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
        <div className={`flex flex-col gap-6 ${flip ? 'lg:order-1' : 'lg:order-2'} ${featured ? 'lg:-mx-8' : ''}`}>
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
  const isDark = theme === 'dark' || theme === 'noir';
  const de = lang === 'de';
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
      <ChapterNav de={de} />

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--bd)' }}>
        <div className={`${W} h-14 flex items-center justify-between`}>
          <Link to="/" className="flex items-center gap-2 text-[13px] text-wx-txm hover:text-wx-tx1 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <span className="font-display text-[13px] font-semibold text-wx-tx1 tracking-wide">
            Waxcelerate <span style={{ color: '#4472D4' }}>·</span> {de ? 'Wissenschaft' : 'Science'}
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

      {/* ══ HERO — compact subpage header ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden flex flex-col items-center justify-center"
        style={{ background: isDark ? '#07070A' : 'var(--sf)', minHeight: isDark ? '44vh' : '26vh' }}
      >
        <HeroParticles />

        {/* Product image — very faint, grayscale, ties hero to product */}
        <img
          src="/images/wax-hero.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: 0.055, objectPosition: '62% 50%', filter: 'grayscale(1) blur(1px)' }}
          loading="eager"
        />

        {/* Hexagonal grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='46'%3E%3Cpath d='M20 0 L40 11.5 L40 34.5 L20 46 L0 34.5 L0 11.5 Z' fill='none' stroke='rgba(43%2C82%2C176%2C0.07)' stroke-width='0.7'/%3E%3C/svg%3E\")",
            backgroundSize: '40px 46px',
          }}
        />

        {/* Radial atmospheric glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: isDark
            ? 'radial-gradient(ellipse 72% 58% at 50% 42%, rgba(26,60,110,0.16) 0%, transparent 65%)'
            : 'radial-gradient(ellipse 72% 58% at 50% 42%, rgba(26,60,110,0.05) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 text-center px-4 sm:px-8 py-10">
          {/* Classification badge */}
          <div data-hero-badge className="inline-flex items-center gap-3 mb-6" style={{ opacity: 0 }}>
            <div className="h-px w-8" style={{ background: isDark ? 'rgba(68,114,212,0.45)' : 'rgba(26,60,110,0.25)' }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.38em]" style={{ color: isDark ? 'rgba(68,114,212,0.65)' : '#4472D4' }}>
              {de ? 'Formulierungsgeschichte' : 'Formula Story'}
            </span>
            <div className="h-px w-8" style={{ background: isDark ? 'rgba(68,114,212,0.45)' : 'rgba(26,60,110,0.25)' }} />
          </div>

          {/* Headline */}
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

          {/* Subtitle */}
          <p
            data-hero-sub
            className="text-[14px] sm:text-[15px] leading-relaxed max-w-[480px] mx-auto mb-0"
            style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx2)', opacity: 0 }}
          >
            {de
              ? 'Jede Komponente in dieser Formel existiert, weil ein Test gescheitert ist — oder weil ein Kompromiss nicht akzeptabel war.'
              : "Every component in this formula exists because a test failed — or because a compromise was unacceptable."}
          </p>
        </div>

        {/* Bottom fade into page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--pg))' }}
        />
      </section>

      {/* ══ COMPOSITION OVERVIEW ══════════════════════════════════════════════ */}
      <div className={`${W} py-14`}>
        <div className="rounded-2xl p-8 sm:p-10" style={{ background: 'linear-gradient(160deg,var(--card-from) 0%,var(--card-to) 100%)', border: '1px solid var(--bd)', ...DOT_GRID }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3" style={{ color: '#4472D4' }}>
                {de ? 'Sechs Bestandteile' : 'Six components'}
              </p>
              <h2 className="font-serif-display text-2xl font-bold text-wx-tx1 mb-4 leading-tight">
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
                  const colors = ['#1A3080','#1A3C6E','#2A5499','#4472D4','#7A9AEC','#A8C0F4'];
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
                  style={{ background: 'rgba(26,60,110,0.07)', border: '1px solid rgba(26,60,110,0.15)', color: 'var(--txm)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(68,114,212,0.35)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,60,110,0.13)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,60,110,0.15)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,60,110,0.07)'; }}
                >
                  <span className="font-mono text-[9px] font-bold" style={{ color: '#4472D4' }}>{ch.n}</span>
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
        ctxEn="Solidification window — foundation of every batch" />

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
      </div>

      {/* ══ STAT 2 ══════════════════════════════════════════════════════════════ */}
      <StatCallout de={de} isDark={isDark} stat="5.6×"
        ctxDe="Dichteunterschied MoS₂ zu Paraffin — deshalb ist Dispergierung unverzichtbar"
        ctxEn="Density ratio MoS₂ to paraffin — why dispersion is non-negotiable" />

      {/* ══ CH 04 ════════════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20`}>
        <Chapter num="04" de={de} flip featured
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

      {/* ══ WHAT THIS MEANS FOR YOU ════════════════════════════════════════════ */}
      <div className={`${W} py-8`}>
        <div className="rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
          style={{ background: isDark ? 'rgba(26,60,110,0.12)' : 'rgba(26,60,110,0.05)', border: '1px solid rgba(26,60,110,0.18)' }}>
          <div>
            <p className="font-serif-display italic font-bold text-[2.2rem] leading-none mb-1" style={{ color: isDark ? '#6A8AE8' : '#1A3C6E' }}>~300 km</p>
            <p className="text-[11px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx1)' }}>{de ? 'pro Rewax-Vorgang' : 'per rewax'}</p>
            <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>{de ? 'bei trockenen Bedingungen' : 'in dry conditions'}</p>
          </div>
          <div>
            <p className="font-serif-display italic font-bold text-[2.2rem] leading-none mb-1" style={{ color: isDark ? '#6A8AE8' : '#1A3C6E' }}>3×</p>
            <p className="text-[11px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx1)' }}>{de ? 'längere Kettenlaufzeit' : 'longer chain life'}</p>
            <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>{de ? 'gegenüber Kettenöl' : 'vs. chain oil'}</p>
          </div>
          <div>
            <p className="font-serif-display italic font-bold text-[2.2rem] leading-none mb-1" style={{ color: isDark ? '#6A8AE8' : '#1A3C6E' }}>~€35</p>
            <p className="text-[11px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.70)' : 'var(--tx1)' }}>{de ? 'gespart pro Jahr' : 'saved per year'}</p>
            <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txm)' }}>{de ? 'bei 5.000 km/Jahr' : 'at 5,000 km/year'}</p>
          </div>
        </div>
      </div>

      {/* ══ STAT 3 ══════════════════════════════════════════════════════════════ */}
      <StatCallout de={de} isDark={isDark} stat="μ 0.03"
        ctxDe="Reibungskoeffizient unter Grenzschmierung — einer der niedrigsten Werte im Vergleich"
        ctxEn="Friction coefficient under boundary lubrication — among the lowest in comparison" />

      {/* ══ CH 05 + CH 06 ════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20 pb-20`}>
        <Chapter num="05" de={de} anchorId="sedimentation"
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
      </div>

      {/* ══ SYNTHESIS REVEAL ════════════════════════════════════════════════ */}
      <div className={`${W} pb-20`}>
        <SynthesisReveal de={de} isDark={isDark} />
      </div>

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
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3" style={{ color: '#4472D4' }}>
              {de ? 'Das Ergebnis' : 'The Result'}
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold leading-tight" style={{ color: isDark ? '#FAFAFA' : 'var(--tx1)' }}>
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
            <div className="w-full rounded-2xl p-5" style={isDark ? { ...DARK_CARD, ...DARK_DOT_GRID } : { ...CARD, ...DOT_GRID }}>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--txff)' }}>
                {de ? 'MoS₂-Verteilung im Gussblock' : 'MoS₂ distribution in cast block'}
              </p>
              <p className="text-[9px] font-mono mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.18)' : 'var(--txff)' }}>
                {de ? 'Querschnitt — Oben / Mitte / Unten' : 'Cross-section — Top / Mid / Bottom'}
              </p>
              {/* Block cross-section: 3 slices, uniform particle grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(de
                  ? ['Oben', 'Mitte', 'Unten']
                  : ['Top', 'Mid', 'Bottom']
                ).map((label, si) => (
                  <div key={si} className="flex flex-col items-center gap-2">
                    <div className="w-full rounded-lg p-2.5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'var(--sf3)', border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--bd2)' }}>
                      <div className="grid grid-cols-4 gap-1 justify-items-center">
                        {[...Array(12)].map((_, j) => (
                          <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: '#2A5499', opacity: isDark ? (0.55 + (j % 4) * 0.12) : (0.45 + (j % 4) * 0.12) }} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-center" style={{ color: isDark ? 'rgba(255,255,255,0.28)' : 'var(--txff)' }}>{label}</span>
                  </div>
                ))}
              </div>
              {/* Key stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { de: 'kein Gradient', en: 'no gradient', sub: de ? 'von oben bis unten' : 'top to bottom' },
                  { de: 'Block 1 = 20', en: 'Block 1 = 20', sub: de ? 'identische Performance' : 'identical performance' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'rgba(26,60,110,0.10)', border: '1px solid rgba(26,60,110,0.18)' }}>
                    <p className="font-serif-display italic text-[16px] font-bold" style={{ color: isDark ? '#6A8AE8' : '#1A3C6E', textShadow: isDark ? '0 0 14px rgba(68,114,212,0.45)' : 'none' }}>
                      {de ? s.de : s.en}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.32)' : 'var(--txm)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] pt-3.5 leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'var(--txm)', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--bd2)' }}>
                {de
                  ? 'MoS₂ ist 5,6× dichter als Paraffin. Ohne Dispergiermittel entsteht ein messbarer Konzentrationsgradient — mehr Partikel unten, weniger oben. Der Fettsäureester verhindert genau das.'
                  : 'MoS₂ is 5.6× denser than paraffin. Without dispersant a measurable concentration gradient forms — more particles at the bottom, fewer at the top. The fatty acid ester prevents exactly this.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section style={{
        background: isDark ? 'linear-gradient(160deg, #07070A 0%, #0B1830 55%, #07070A 100%)' : 'var(--sf3)',
        borderTop: isDark ? '1px solid rgba(68,114,212,0.1)' : '1px solid var(--bd)',
      }}>
        <div className={`${W} py-20 text-center`}>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] mb-4" style={{ color: '#4472D4' }}>
            {de ? 'Bereit?' : 'Ready?'}
          </p>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold mb-4 leading-tight" style={{ color: isDark ? '#FAFAFA' : 'var(--tx1)' }}>
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
