import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
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
// @ts-ignore -- reserved for future use
const DARK_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
};

// @ts-ignore -- reserved for future use
const DARK_DOT_GRID: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(100,140,220,0.12) 1px, transparent 1px)',
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
function StatCallout({ stat, ctxDe, ctxEn, de }: { stat: string; ctxDe: string; ctxEn: string; de: boolean }) {
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
      className="w-full py-24 sm:py-32 flex flex-col items-center text-center"
      style={{
        background: '#07070A',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        opacity: 0,
      }}
    >
      <p className="font-serif-display italic font-bold leading-none select-none"
        style={{ fontSize: 'clamp(5.5rem,16vw,10.5rem)', color: '#3060C8', textShadow: '0 0 60px rgba(43,82,176,0.55), 0 0 130px rgba(43,82,176,0.22)' }}>
        {stat}
      </p>
      <p className="text-[11px] uppercase tracking-[0.3em] mt-6 max-w-[400px] leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.50)' }}>
        {de ? ctxDe : ctxEn}
      </p>
    </div>
  );
}

// ─── Composition tiers (qualitative, no quantities) ───────────────────────────
const TIERS = [
  { color: '#1A3080', barW: '82%', roleDe: 'Basisstruktur', roleEn: 'Base Structure', tagDe: 'Volumenbestimmend', tagEn: 'Volume-determining', dotsDe: '3 Komponenten', dotsEn: '3 components', descDe: 'Kristallines Paraffingerüst · Mikrokristalliner Plastifikator · Synthetisches Härtewachs', descEn: 'Crystalline paraffin scaffold · Microcrystalline plasticizer · Synthetic hard wax' },
  { color: '#2A5499', barW: '46%', roleDe: 'Festschmierstoff', roleEn: 'Solid Lubricant', tagDe: 'Hochaktiv · Spurenkonzentration', tagEn: 'Highly active · Trace concentration', dotsDe: '1 Komponente', dotsEn: '1 component', descDe: 'MoS₂ — Hexagonales Schichtgitter · Partikelgröße &lt;5 µm', descEn: 'MoS₂ — Hexagonal layer lattice · Particle size &lt;5 µm' },
  { color: '#8AAAF0', barW: '24%', roleDe: 'Stabilisatoren', roleEn: 'Stabilizers', tagDe: 'Spurenadditive · Unverzichtbar', tagEn: 'Trace additives · Non-negotiable', dotsDe: '2 Komponenten', dotsEn: '2 components', descDe: 'Amphiphiler Fettsäureester · Gehindertes Phenol-Antioxidans', descEn: 'Amphiphilic fatty acid ester · Hindered phenolic antioxidant' },
];

function CompositionTiers({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const bars = ref.current?.querySelectorAll('.tier-bar');
      if (bars?.length) {
        gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 1.1, stagger: 0.2, ease: 'power3.out', transformOrigin: 'left center', scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } });
      }
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="space-y-7">
      {TIERS.map((t, i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between mb-2 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <span className="text-[13px] font-bold text-wx-tx1">{de ? t.roleDe : t.roleEn}</span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--txff)' }}>{de ? t.dotsDe : t.dotsEn}</span>
            </div>
            <span className="text-[10px] shrink-0 hidden sm:block" style={{ color: 'var(--txff)' }}>{de ? t.tagDe : t.tagEn}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bd2)' }}>
            <div className="tier-bar h-full rounded-full" style={{ width: t.barW, background: t.color }} />
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txff)' }} dangerouslySetInnerHTML={{ __html: de ? t.descDe : t.descEn }} />
        </div>
      ))}
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

  return (
    <div className="w-full rounded-2xl overflow-hidden p-5 cursor-default select-none"
      style={{ ...CARD, ...DOT_GRID, transition: 'box-shadow 0.35s ease', boxShadow: hov ? '0 0 0 1px rgba(68,114,212,0.3), 0 8px 32px rgba(26,60,110,0.14)' : 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-4 text-center" style={{ color: 'var(--txff)' }}>
        {de ? '2H-MoS₂ — Schichtstruktur (Seitenansicht)' : '2H-MoS₂ — Layer structure (side view)'}
      </p>
      <svg viewBox="0 0 395 168" className="w-full" style={{ overflow: 'visible' }}>
        <g ref={topRef}>
          {bonds(TOP_MO, TOP_S1, TOP_S2).map((b, i) => (
            <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(42,84,153,0.22)" strokeWidth="1.2" />
          ))}
          {S_X.map((x, i) => <circle key={`ts1${i}`} cx={x} cy={TOP_S1} r="5" fill="#A8C0F4" opacity="0.92" />)}
          {MO_X.map((x, i) => <circle key={`tmo${i}`} cx={x} cy={TOP_MO} r="7.5" fill="#1A3C6E" style={{ filter: 'drop-shadow(0 0 5px rgba(26,60,110,0.55))' }} />)}
          {S_X.map((x, i) => <circle key={`ts2${i}`} cx={x} cy={TOP_S2} r="5" fill="#A8C0F4" opacity="0.92" />)}
          <text x="385" y={TOP_S1 + 4} fontSize="9" fill="rgba(168,192,244,0.65)" fontFamily="monospace" textAnchor="start">S</text>
          <text x="385" y={TOP_MO + 4} fontSize="9" fill="rgba(42,84,153,0.8)"  fontFamily="monospace" textAnchor="start">Mo</text>
          <text x="385" y={TOP_S2 + 4} fontSize="9" fill="rgba(168,192,244,0.65)" fontFamily="monospace" textAnchor="start">S</text>
        </g>
        <line x1="8" y1={GAP_Y} x2="372" y2={GAP_Y} stroke="rgba(26,60,110,0.12)" strokeWidth="1" strokeDasharray="5 4" />
        <text x="197" y={GAP_Y + 9} textAnchor="middle" fontSize="8" fill="rgba(168,192,244,0.45)" letterSpacing="1" fontFamily="monospace">
          {de ? 'van-der-Waals' : 'van der Waals'}
        </text>
        <g ref={botRef}>
          {bonds(BOT_MO, BOT_S1, BOT_S2).map((b, i) => (
            <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(42,84,153,0.22)" strokeWidth="1.2" />
          ))}
          {S_X.map((x, i) => <circle key={`bs1${i}`} cx={x} cy={BOT_S1} r="5" fill="#A8C0F4" opacity="0.92" />)}
          {MO_X.map((x, i) => <circle key={`bmo${i}`} cx={x} cy={BOT_MO} r="7.5" fill="#1A3C6E" style={{ filter: 'drop-shadow(0 0 5px rgba(26,60,110,0.55))' }} />)}
          {S_X.map((x, i) => <circle key={`bs2${i}`} cx={x} cy={BOT_S2} r="5" fill="#A8C0F4" opacity="0.92" />)}
          <text x="385" y={BOT_S1 + 4} fontSize="9" fill="rgba(168,192,244,0.65)" fontFamily="monospace" textAnchor="start">S</text>
          <text x="385" y={BOT_MO + 4} fontSize="9" fill="rgba(42,84,153,0.8)"  fontFamily="monospace" textAnchor="start">Mo</text>
          <text x="385" y={BOT_S2 + 4} fontSize="9" fill="rgba(168,192,244,0.65)" fontFamily="monospace" textAnchor="start">S</text>
        </g>
      </svg>
      <div className="flex justify-center gap-6 mt-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: '#A8C0F4' }} />
          <span className="text-[11px] font-mono" style={{ color: 'var(--txf)' }}>S (Schwefel)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ background: '#1A3C6E', boxShadow: '0 0 6px rgba(26,60,110,0.5)' }} />
          <span className="text-[11px] font-mono" style={{ color: 'var(--txf)' }}>Mo (Molybdän)</span>
        </div>
      </div>
      <p className="text-center text-[10px] transition-opacity duration-300" style={{ color: 'var(--txff)', opacity: hov ? 1 : 0.4 }}>
        {de ? '↑ Hover — Scherschicht wird sichtbar' : '↑ Hover — shear layer becomes visible'}
      </p>
      <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className="text-center">
          <p className="font-serif-display italic text-[24px] font-bold" style={{ color: '#2A5499', textShadow: '0 0 20px rgba(42,84,153,0.5)' }}>μ 0.03</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--txff)' }}>{de ? 'Reibungskoeff. Grenzschmierung' : 'Friction coeff. boundary lubrication'}</p>
        </div>
        <div className="text-center">
          <p className="font-serif-display italic text-[24px] font-bold text-wx-tx1">&lt;5 µm</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--txff)' }}>{de ? 'Partikelgröße d₅₀' : 'Particle size d₅₀'}</p>
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

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden p-5"
      style={{ ...CARD, ...DOT_GRID, transition: 'box-shadow 0.35s ease', boxShadow: hov ? '0 0 0 1px rgba(68,114,212,0.3), 0 8px 32px rgba(26,60,110,0.14)' : 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-4 text-center" style={{ color: 'var(--txff)' }}>
        {de ? 'Transferfilm-Bildung unter Kontaktdruck' : 'Transfer film formation under contact pressure'}
      </p>
      <svg viewBox="0 0 440 185" className="w-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="steel-grad-t" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2a38" />
            <stop offset="100%" stopColor="#1c1c28" />
          </linearGradient>
          <linearGradient id="steel-grad-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1c28" />
            <stop offset="100%" stopColor="#2a2a38" />
          </linearGradient>
        </defs>
        <rect x="0" y="0"   width="440" height="26" fill="url(#steel-grad-t)" rx="2" />
        <rect x="0" y="159" width="440" height="26" fill="url(#steel-grad-b)" rx="2" />
        <text x="220" y="17" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="monospace" letterSpacing="2">
          {de ? 'STAHL — KETTENLASCHE' : 'STEEL — LINK PLATE'}
        </text>
        <text x="220" y="174" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="monospace" letterSpacing="2">
          {de ? 'STAHL — KETTENBOLZEN' : 'STEEL — CHAIN PIN'}
        </text>
        <rect className="tf-film" x="0" y="26"  width="440" height="5" fill="#1A3C6E" opacity="0" rx="1" />
        <rect className="tf-film" x="0" y="154" width="440" height="5" fill="#1A3C6E" opacity="0" rx="1" />
        {TF_PARTICLES.map((p, i) => (
          <circle key={i} className="tf-p" cx={p.x} cy={p.y} r={p.r} fill="#2A5499" opacity="0.85" />
        ))}
        <text className="tf-label" x="220" y="43" textAnchor="middle" fontSize="8.5" fill="rgba(106,138,232,0.9)" fontFamily="monospace" letterSpacing="1" opacity="0">
          {de ? 'Transferfilm — Fe-S tribochemische Bindung' : 'Transfer film — Fe-S tribochemical bond'}
        </text>
      </svg>
      <div className="mt-3 pt-3 grid grid-cols-3 gap-2 text-center" style={{ borderTop: '1px solid var(--bd2)' }}>
        {[
          { de: '50–300 MPa',  en: '50–300 MPa',  sub: de ? 'Kontaktdruck' : 'Contact pressure' },
          { de: '2–5 nm',     en: '2–5 nm',      sub: de ? 'Filmdicke'    : 'Film thickness'   },
          { de: 'Fe–S Bindung', en: 'Fe–S bond',  sub: de ? 'Verankerung'  : 'Anchoring'       },
        ].map((s, i) => (
          <div key={i}>
            <p className="font-mono text-[12px] font-semibold text-wx-tx1">{s.de}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--txff)' }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Crystal lattice — hexagonal close-packed SVG ────────────────────────────
function CrystalLattice() {
  const svgRef = useRef<SVGSVGElement>(null);

  const COLS = 10, ROWS = 6, HEX_W = 38, HEX_H = 30;

  // Build atom positions — hexagonal close-packed
  const atoms = Array.from({ length: ROWS * COLS }, (_, i) => {
    const r = Math.floor(i / COLS), c = i % COLS;
    return {
      x: c * HEX_W + (r % 2 === 1 ? HEX_W / 2 : 0) + 16,
      y: r * HEX_H + 14,
      big: (r + c * 2) % 4 === 0,
    };
  });

  // Compute HCP bonds
  const bonds: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const a = atoms[r * COLS + c];
      if (c < COLS - 1) bonds.push({ x1: a.x, y1: a.y, x2: atoms[r * COLS + c + 1].x, y2: atoms[r * COLS + c + 1].y });
      if (r < ROWS - 1) {
        const nbC = r % 2 === 0 ? c : c + 1;
        if (nbC < COLS) { const nb = atoms[(r + 1) * COLS + nbC]; bonds.push({ x1: a.x, y1: a.y, x2: nb.x, y2: nb.y }); }
        const nbC2 = r % 2 === 0 ? c - 1 : c;
        if (nbC2 >= 0) { const nb = atoms[(r + 1) * COLS + nbC2]; bonds.push({ x1: a.x, y1: a.y, x2: nb.x, y2: nb.y }); }
      }
    }
  }

  useEffect(() => {
    const nodes = svgRef.current?.querySelectorAll<SVGCircleElement>('.lat-atom');
    if (!nodes?.length) return;
    nodes.forEach((n, i) => {
      gsap.to(n, {
        opacity: 0.5 + (i * 7 % 5) * 0.1,
        duration: 1.5 + (i % 5) * 0.45,
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.048,
      });
    });
    return () => gsap.killTweensOf(Array.from(nodes));
  }, []);

  return (
    <div className="w-full rounded-2xl overflow-hidden p-5" style={{ ...CARD, ...DOT_GRID }}>
      <svg ref={svgRef} viewBox="0 0 395 196" className="w-full mb-3" style={{ overflow: 'visible' }}>
        {bonds.map((b, i) => (
          <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(42,84,153,0.14)" strokeWidth="0.85" />
        ))}
        {atoms.map((a, i) => (
          <circle
            key={i} className="lat-atom" cx={a.x} cy={a.y} r={a.big ? 5.5 : 3}
            fill={a.big ? '#1A3C6E' : 'var(--bd)'} opacity={a.big ? 0.88 : 0.6}
            style={{ filter: a.big ? 'drop-shadow(0 0 5px rgba(26,60,110,0.65))' : 'none' }}
          />
        ))}
      </svg>
      <p className="text-center text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--txff)' }}>
        Lamellare Kristalldomänen · C₂₀–C₃₆
      </p>
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
function FrictionBars({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const bars = [
    { label: 'Waxcelerate Pro', tag: 'PRO', desc: 'μ 0.03–0.06', pct: 100, hi: true },
    { label: 'Waxcelerate Classic',          desc: 'μ 0.05–0.07', pct: 86,  hi: true },
    { labelDe: 'Graphit-Heißwachs', labelEn: 'Graphite wax',    desc: 'μ 0.08–0.12', pct: 60,  hi: false },
    { labelDe: 'Kettenöl (nass)',   labelEn: 'Chain oil (wet)', desc: 'μ 0.18–0.25', pct: 15,  hi: false, dim: true },
  ];
  useEffect(() => {
    const ctx = gsap.context(() => {
      ref.current?.querySelectorAll('.fb').forEach(bar => {
        const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
        gsap.fromTo(bar, { scaleX: 0 }, { scaleX: pct, duration: 1, ease: 'power3.out', transformOrigin: 'left center', scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full rounded-2xl p-5" style={{ ...DARK_CARD, ...DARK_DOT_GRID }}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: 'rgba(255,255,255,0.38)' }}>
        {de ? 'Reibungskoeffizient μ — Grenzschmierung' : 'Friction coefficient μ — boundary lubrication'}
      </p>
      <div ref={ref} className="space-y-3.5">
        {bars.map((b, i) => {
          const label = 'label' in b ? b.label : (de ? b.labelDe : b.labelEn);
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] font-medium" style={{ color: b.hi ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.55)' }}>
                  {label}
                  {'tag' in b && b.tag && (
                    <span className="ml-1.5 text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded" style={{ background: 'linear-gradient(135deg,#1A3080,#2A5499)', color: 'rgba(255,255,255,0.9)' }}>
                      {b.tag}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-mono" style={{ color: b.hi ? 'rgba(255,255,255,0.72)' : 'dim' in b && b.dim ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.40)' }}>{b.desc}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.11)' }}>
                <div className="fb h-full w-full rounded-full" data-w={b.pct}
                  style={{ background: b.hi ? (b.pct === 100 ? 'linear-gradient(90deg,#1A3080,#6A8AE8)' : 'linear-gradient(90deg,#1A3C6E,#2A5499)') : ('dim' in b && b.dim) ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.28)', transformOrigin: 'left center', transform: 'scaleX(0)' }}
                />
              </div>
            </div>
          );
        })}
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
  catDe: string; catEn: string;
  titleDe: string; titleEn: string;
  ledeDe: string; ledeEn: string;
  bodyDe: React.ReactNode; bodyEn: React.ReactNode;
  insightDe: string; insightEn: string;
  visual: React.ReactNode;
  extraVisual?: React.ReactNode;
  flip?: boolean;
  de: boolean;
}

function Chapter({ num, catDe, catEn, titleDe, titleEn, ledeDe, ledeEn, bodyDe, bodyEn, insightDe, insightEn, visual, extraVisual, flip, de }: ChapterProps) {
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
    <div ref={ref} className="mb-24 lg:mb-32" style={{ opacity: 0 }} data-chapter={num}>

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
        {/* Visual column */}
        <div className={`flex flex-col gap-6 ${flip ? 'lg:order-1' : 'lg:order-2'}`}>
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
      // Scroll cue
      gsap.fromTo('[data-scroll-cue]',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 1.7 },
      );
      // Scroll cue line animation
      const scrollBar = heroRef.current?.querySelector<HTMLElement>('.scroll-bar');
      if (scrollBar) {
        const stl = gsap.timeline({ repeat: -1, delay: 2.3 });
        stl.fromTo(scrollBar, { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.65, ease: 'power1.in' });
        stl.to(scrollBar, { y: '100%', opacity: 0, duration: 0.55, ease: 'power1.out' });
        stl.set(scrollBar, { y: '-100%', opacity: 0 });
      }
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

      {/* ══ HERO — forced dark, cinematic ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden flex flex-col items-center justify-center"
        style={{ background: '#07070A', minHeight: '88vh' }}
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
          style={{ background: 'radial-gradient(ellipse 72% 58% at 50% 42%, rgba(26,60,110,0.16) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 text-center px-4 sm:px-8 py-24">
          {/* Classification badge */}
          <div data-hero-badge className="inline-flex items-center gap-3 mb-9" style={{ opacity: 0 }}>
            <div className="h-px w-8" style={{ background: 'rgba(68,114,212,0.45)' }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.38em]" style={{ color: 'rgba(68,114,212,0.65)' }}>
              {de ? 'Formulierungsdokumentation' : 'Formulation Documentation'}
            </span>
            <div className="h-px w-8" style={{ background: 'rgba(68,114,212,0.45)' }} />
          </div>

          {/* Headline */}
          <h1
            className="font-display font-bold leading-[1.05] mb-8 flex flex-wrap justify-center gap-x-4 gap-y-1"
            style={{ fontSize: 'clamp(2.6rem,7.5vw,5rem)', color: '#FFFFFF', perspective: '600px' }}
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
            className="text-[15px] sm:text-[16px] leading-relaxed max-w-[540px] mx-auto mb-16"
            style={{ color: 'rgba(255,255,255,0.42)', opacity: 0 }}
          >
            {de
              ? 'Jede Komponente in dieser Formel existiert, weil ein Test gescheitert ist — oder weil ein Kompromiss nicht akzeptabel war.'
              : "Every component in this formula exists because a test failed — or because a compromise was unacceptable."}
          </p>

          {/* Scroll cue */}
          <div data-scroll-cue className="flex flex-col items-center gap-2" style={{ opacity: 0 }}>
            <span className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
              scroll
            </span>
            <div className="relative h-8 w-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="scroll-bar absolute top-0 left-0 w-full h-1/2"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(68,114,212,0.9))' }}
              />
            </div>
          </div>
        </div>

        {/* Bottom fade into page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--pg))' }}
        />
      </section>

      {/* ══ COMPOSITION OVERVIEW ══════════════════════════════════════════════ */}
      <div className={`${W} py-20`}>
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
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--txff)' }}>
                {de ? 'Relative Bedeutung — keine Mengenangaben' : 'Relative importance — no quantities shown'}
              </p>
              <CompositionTiers de={de} />
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
        <div className="flex items-center gap-5 my-24">
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
          <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'var(--txff)' }}>
            {de ? 'Kapitel für Kapitel' : 'Chapter by chapter'}
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
        </div>

        {/* ══ CH 01 ══════════════════════════════════════════════════════════ */}
        <Chapter num="01" de={de}
          catDe="Die Basis" catEn="The Foundation"
          titleDe="Das kristalline Gerüst"
          titleEn="The crystalline scaffold"
          ledeDe="Welches Paraffin — und warum ein 2°C-Erstarrungsfenster über Batch-Konsistenz entscheidet."
          ledeEn="Which paraffin — and why a 2°C solidification window determines batch consistency."
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
          visual={<CrystalLattice />}
        />
      </div>

      {/* ══ STAT 1 — full-bleed dark ══════════════════════════════════════════ */}
      <StatCallout de={de} stat="2°C"
        ctxDe="Erstarrungsfenster — Basis jeder Batch-Konsistenz"
        ctxEn="Solidification window — foundation of every batch" />

      {/* ══ CH 02 + CH 03 ════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20`}>
        <Chapter num="02" de={de} flip
          catDe="Härtemodul" catEn="Hardener Module"
          titleDe="Synthetisch reines Härtewachs"
          titleEn="Synthetically pure hard wax"
          ledeDe="Fischer-Tropsch-Wachs: synthetisch lineare Moleküle, die den Tropfpunkt auf 72–78°C anheben."
          ledeEn="Fischer-Tropsch wax: synthetically linear molecules that push the drop point to 72–78°C."
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

        <Chapter num="03" de={de}
          catDe="Kälteflexibilität" catEn="Cold Flexibility"
          titleDe="Mikrokristallines Wachs"
          titleEn="Microcrystalline wax"
          ledeDe="Verzweigte Moleküle füllen die amorphen Bereiche zwischen Kristalldomänen — Matrix bleibt bis −10°C elastisch."
          ledeEn="Branched molecules fill the amorphous zones between crystal domains — keeping the matrix elastic to −10°C."
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

      {/* ══ STAT 2 — full-bleed dark ══════════════════════════════════════════ */}
      <StatCallout de={de} stat="5.6×"
        ctxDe="Dichteunterschied MoS₂ zu Paraffin — deshalb ist Dispergierung unverzichtbar"
        ctxEn="Density ratio MoS₂ to paraffin — why dispersion is non-negotiable" />

      {/* ══ CH 04 ════════════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20`}>
        <Chapter num="04" de={de} flip
          catDe="Festschmierstoff" catEn="Solid Lubricant"
          titleDe="Molybdändisulfid — <5 µm"
          titleEn="Molybdenum disulfide — <5 µm"
          ledeDe="MoS₂ bildet unter Kontaktdruck einen Transferfilm auf dem Stahl — er schmiert noch, wenn das Wachs längst verbraucht ist."
          ledeEn="MoS₂ forms a transfer film on steel under contact pressure — it lubricates long after the wax is spent."
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

      {/* ══ STAT 3 — full-bleed dark ══════════════════════════════════════════ */}
      <StatCallout de={de} stat="μ 0.03"
        ctxDe="Reibungskoeffizient unter Grenzschmierung — einer der niedrigsten Werte im Vergleich"
        ctxEn="Friction coefficient under boundary lubrication — among the lowest in comparison" />

      {/* ══ CH 05 + CH 06 ════════════════════════════════════════════════════ */}
      <div className={`${W} pt-20 pb-20`}>
        <Chapter num="05" de={de}
          catDe="Dispergiersystem" catEn="Dispersant System"
          titleDe="Amphiphiler Fettsäureester"
          titleEn="Amphiphilic fatty acid ester"
          ledeDe="MoS₂ ist 5,6× dichter als Paraffin — ohne Dispergiermittel entsteht ein messbarer Konzentrationsgradient im fertigen Block."
          ledeEn="MoS₂ is 5.6× denser than paraffin — without dispersant a measurable concentration gradient forms in the finished block."
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

      {/* ══ RESULTS — dark section ════════════════════════════════════════════ */}
      <section
        style={{ background: '#07070A', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className={`${W} py-24`}>
          <div className="text-center mb-14">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3" style={{ color: '#4472D4' }}>
              {de ? 'Das Ergebnis' : 'The Result'}
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold leading-tight" style={{ color: '#FAFAFA' }}>
              {de ? 'Was die Formel leistet' : 'What the formula delivers'}
            </h2>
            <p className="mt-4 text-[14px] max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {de
                ? 'Sechs Entscheidungen. Kein Kompromiss in der Kette.'
                : 'Six decisions. No compromise in the chain.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FrictionBars de={de} />
            <div className="w-full rounded-2xl p-5" style={{ ...CARD, ...DOT_GRID }}>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--txff)' }}>
                {de ? 'Konsistenz — Block zu Block' : 'Consistency — block to block'}
              </p>
              <div className="space-y-4">
                {[{ de: 'Erster Block', en: 'First block' }, { de: 'Zehnter Block', en: 'Tenth block' }, { de: 'Zwanzigster Block', en: 'Twentieth block' }].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[12px] text-wx-txm">{de ? item.de : item.en}</span>
                      <span className="text-[11px] font-medium" style={{ color: '#4472D4' }}>{de ? 'Identisch' : 'Identical'}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
                      <div className="h-full w-full rounded-full" style={{ background: 'linear-gradient(90deg,#1A3080,#4472D4)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-wx-txm mt-5 pt-4 leading-relaxed" style={{ borderTop: '1px solid var(--bd2)' }}>
                {de
                  ? 'Das Dispergiersystem stellt sicher, dass MoS₂ gleichmäßig im Gussblock verteilt ist — von der ersten bis zur letzten Scheibe.'
                  : 'The dispersant system ensures MoS₂ is uniformly distributed throughout the cast block — from first slice to last.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA — dark gradient ═══════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, #07070A 0%, #0B1830 55%, #07070A 100%)', borderTop: '1px solid rgba(68,114,212,0.1)' }}>
        <div className={`${W} py-28 text-center`}>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] mb-4" style={{ color: '#4472D4' }}>
            {de ? 'Bereit?' : 'Ready?'}
          </p>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold mb-4 leading-tight" style={{ color: '#FAFAFA' }}>
            {de ? 'Die Formel auf deiner Kette.' : 'Put the formula on your chain.'}
          </h2>
          <p className="text-[14px] mb-10 max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            {de
              ? 'Waxcelerate Pro und Classic direkt über eBay — mit vollem Käuferschutz.'
              : 'Waxcelerate Pro and Classic via eBay — with full buyer protection.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-[14px] text-white transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg,#1A3080,#2A5499)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {de ? 'Zurück zu den Produkten' : 'Back to products'}
          </Link>
        </div>
      </section>

    </div>
  );
}
