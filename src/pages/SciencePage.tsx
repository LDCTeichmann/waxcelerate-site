import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { InstrumentFrame, SegmentedToggle, AnimatedNumber, CountUp } from '@/components/viz';
import { waxVsOil, frictionRanges } from '@/lib/data';
import { COMPONENTS, FAILURES, type ScienceComponent } from '@/lib/science';
import { FormulaGraph } from '@/sections/science/FormulaGraph';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { HexMoS2, TransferFilm } from '@/sections/science/LabViz';

const W = 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';

// ─── Top scroll-progress bar (the one consolidated nav cue) ──────────────────
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      el.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div aria-hidden className="fixed top-0 left-0 right-0 h-0.5 z-50 origin-left"
      ref={ref}
      style={{ background: 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))', transform: 'scaleX(0)' }} />
  );
}

function ContactZone({ wax }: { wax: boolean }) {
  const topSurf = 'M0,52 L18,52 L30,52.5 L42,53 L54,52.5 L68,52 L78,53 L86,54.5 L92,55.5 L100,54 L110,52.5 L126,52 L138,52.5 L148,53.5 L156,54 L164,53 L178,52 L190,52.5 L200,54 L208,55.5 L216,56 L224,55 L234,53 L248,52 L262,52.5 L272,53.5 L280,54.5 L288,53.5 L300,52 L314,52.5 L324,54 L332,55.5 L340,55 L350,53.5 L364,52 L378,52.5 L388,53.5 L396,55 L404,55.5 L412,54 L422,53 L438,52 L452,52.5 L462,53.5 L472,53 L486,52 L500,52';
  const topPts = topSurf.replace('M', '').split(/\s*L\s*/).map(s => s.trim());
  const topBody = `M0,0 L500,0 ${[...topPts].reverse().map(p => `L${p}`).join(' ')} Z`;

  const botSurf = 'M0,88 L18,88 L30,87.5 L42,87 L54,87.5 L68,88 L78,87 L86,85.5 L92,84.5 L100,86 L110,87.5 L126,88 L138,87.5 L148,86.5 L156,86 L164,87 L178,88 L190,87.5 L200,86 L208,84.5 L216,84 L224,85 L234,87 L248,88 L262,87.5 L272,86.5 L280,85.5 L288,86.5 L300,88 L314,87.5 L324,86 L332,84.5 L340,85 L350,86.5 L364,88 L378,87.5 L388,86.5 L396,85 L404,84.5 L412,86 L422,87 L438,88 L452,87.5 L462,86.5 L472,87 L486,88 L500,88';
  const botPts = botSurf.replace('M', '').split(/\s*L\s*/).map(s => s.trim());
  const botBody = `M0,140 L500,140 ${[...botPts].reverse().map(p => `L${p}`).join(' ')} Z`;

  const grit: { x: number; y: number; d: string }[] = [
    { x: 60, y: 70, d: 'M-3,-1.5 L0,-3.5 L3.5,-1 L2.5,2 L-1,3 L-3.5,0.5 Z' },
    { x: 128, y: 72, d: 'M-2.5,-3 L2,-3 L4,0 L2,3 L-2,2.5 L-3.5,-0.5 Z' },
    { x: 200, y: 69, d: 'M-3,-2 L1,-4 L4,-1 L3,2 L-0.5,3.5 L-3.5,1 Z' },
    { x: 268, y: 73, d: 'M-2,-3 L3,-1.5 L3,2 L0,3.5 L-3.5,1 L-2.5,-1.5 Z' },
    { x: 335, y: 70, d: 'M-3.5,-1 L-1,-3.5 L3,-2 L4,1 L1,3 L-3,2 Z' },
    { x: 400, y: 71, d: 'M-2,-3 L2.5,-2.5 L3.5,1 L1,3.5 L-2.5,2 L-3.5,-0.5 Z' },
    { x: 462, y: 69, d: 'M-3,-2 L0.5,-3.5 L3.5,0 L2,3 L-2,3 L-3.5,0 Z' },
    { x: 95, y: 74, d: 'M-2,-2 L2,-2.5 L3,1 L0,2.5 L-2.5,0.5 Z' },
    { x: 170, y: 68, d: 'M-2.5,0 L-1,-2.5 L2.5,-1 L2,2 L-1,2.5 Z' },
    { x: 365, y: 74, d: 'M-2,-1.5 L1,-2.5 L3,0.5 L1.5,2.5 L-2,2 Z' },
  ];

  const dust: { x: number; y: number; d: string; rot: number }[] = [
    { x: 50, y: 42, d: 'M-2,-1.5 L1,-2.5 L3,0 L1,2 L-2,1.5 Z', rot: 15 },
    { x: 145, y: 40, d: 'M-2.5,-1 L0,-2.5 L3,-0.5 L2,2 L-1.5,2 Z', rot: -20 },
    { x: 235, y: 43, d: 'M-1.5,-2 L2,-2 L2.5,1 L0,2.5 L-2.5,0.5 Z', rot: 30 },
    { x: 320, y: 41, d: 'M-2,-2 L1.5,-2.5 L3,0.5 L0.5,2.5 L-2.5,1 Z', rot: -10 },
    { x: 420, y: 44, d: 'M-2,-1 L1,-2.5 L3,0 L1.5,2.5 L-2,1.5 Z', rot: 25 },
    { x: 485, y: 41, d: 'M-1.5,-2 L2,-1.5 L2,1.5 L-0.5,2.5 L-2.5,0 Z', rot: -15 },
  ];

  return (
    <svg viewBox="0 0 500 140" className="w-full h-auto" role="img"
      aria-label={wax ? 'Dry wax film — particles cannot embed' : 'Oil traps grit into abrasive paste'}>
      <defs>
        <pattern id="cz-ht" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--txm)" strokeWidth="0.3" opacity="0.05" />
        </pattern>
        <linearGradient id="cz-mt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.16" />
          <stop offset="60%" stopColor="var(--txm)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.36" />
        </linearGradient>
        <linearGradient id="cz-mb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.36" />
          <stop offset="40%" stopColor="var(--txm)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="cz-oil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="var(--txm)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.15" />
        </linearGradient>
        <filter id="cz-gs"><feDropShadow dx="0" dy="0.4" stdDeviation="0.5" floodColor="#000" floodOpacity="0.16" /></filter>
      </defs>

      {/* Deflected dust above top surface (wax mode) */}
      {dust.map((p, i) => (
        <path key={`d${i}`} d={p.d}
          transform={`translate(${p.x},${p.y}) rotate(${p.rot})`}
          fill="var(--txm)" opacity={wax ? 0.30 : 0}
          style={{ transition: 'opacity 0.5s ease' }} />
      ))}

      {/* Top metal body */}
      <path d={topBody} fill="url(#cz-mt)" />
      <path d={topBody} fill="url(#cz-ht)" />
      <path d={topSurf} fill="none" stroke="var(--txm)" strokeWidth="0.8" opacity="0.40" strokeLinejoin="round" />
      <path d={topSurf} fill="none" stroke="var(--sf)" strokeWidth="0.4" opacity="0.25" strokeLinejoin="round"
        transform="translate(0,-0.8)" />

      {/* Gap fill (oil) */}
      <rect x="0" y="52" width="500" height="36" fill={wax ? 'transparent' : 'url(#cz-oil)'}
        style={{ transition: 'fill 0.5s ease' }} />

      {/* Wax film — conformal solid coating */}
      <path d={topSurf} fill="none" stroke="var(--accent)" strokeWidth="2"
        opacity={wax ? 0.28 : 0} style={{ transition: 'opacity 0.5s ease' }}
        transform="translate(0,2.5)" strokeLinejoin="round" />
      <path d={botSurf} fill="none" stroke="var(--accent)" strokeWidth="2"
        opacity={wax ? 0.28 : 0} style={{ transition: 'opacity 0.5s ease' }}
        transform="translate(0,-2.5)" strokeLinejoin="round" />

      {/* Trapped angular grit (oil mode) */}
      {grit.map((p, i) => (
        <path key={`g${i}`} d={p.d}
          transform={`translate(${p.x},${p.y})`}
          fill="var(--tx2)" opacity={wax ? 0 : 0.50} filter={wax ? undefined : 'url(#cz-gs)'}
          style={{ transition: `opacity 0.5s ease ${wax ? 0 : 0.12 + i * 0.03}s` }} />
      ))}

      {/* Micro-scratches on surfaces (oil mode — active abrasion) */}
      {[58, 126, 198, 266, 333, 398, 460].map((x, i) => (
        <line key={`sc${i}`} x1={x - 14} y1={87.5 - (i % 2) * 0.5} x2={x + 14} y2={87 + (i % 2) * 0.5}
          stroke="var(--accent-strong)" strokeWidth="0.4" opacity={wax ? 0 : 0.20}
          style={{ transition: 'opacity 0.5s ease' }} />
      ))}

      {/* Bottom metal body */}
      <path d={botBody} fill="url(#cz-mb)" />
      <path d={botBody} fill="url(#cz-ht)" />
      <path d={botSurf} fill="none" stroke="var(--txm)" strokeWidth="0.8" opacity="0.40" strokeLinejoin="round" />
      <path d={botSurf} fill="none" stroke="var(--sf)" strokeWidth="0.4" opacity="0.25" strokeLinejoin="round"
        transform="translate(0,0.8)" />

      {/* Sliding direction */}
      <g opacity="0.22">
        <line x1="478" y1="28" x2="496" y2="28" stroke="var(--txf)" strokeWidth="0.7" />
        <path d="M492,25.5 L497,28 L492,30.5" fill="none" stroke="var(--txf)" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="496" y1="112" x2="478" y2="112" stroke="var(--txf)" strokeWidth="0.7" />
        <path d="M482,109.5 L477,112 L482,114.5" fill="none" stroke="var(--txf)" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// ─── ACT I — Problem hero with Wax⇄Oil toggle ────────────────────────────────
function ProblemHero({ de }: { de: boolean }) {
  const [state, setState] = useState<'wax' | 'oil'>('oil');
  const wax = state === 'wax';
  const friction = waxVsOil.friction[state];
  const [wLo, wHi] = waxVsOil.watts[state];
  const life = waxVsOil.life[state];
  const valStyle = { color: wax ? 'var(--accent)' : 'var(--txm)', transition: 'color 300ms ease' };
  const numCls = 'num-data font-bold text-[28px] sm:text-[32px] leading-none tabular-nums';

  const metrics = [
    {
      label: de ? 'Reibung' : 'Friction',
      node: <AnimatedNumber value={friction} decimals={2} prefix="μ " className={numCls} style={valStyle} />,
      pct: wax ? 15 : 100,
    },
    {
      label: de ? 'Antriebsverlust' : 'Drivetrain loss',
      node: <span className={numCls} style={valStyle}><AnimatedNumber value={wLo} />–<AnimatedNumber value={wHi} /><span className="text-[18px] ml-0.5">W</span></span>,
      pct: wax ? 33 : 100,
    },
    {
      label: de ? 'Kettenlaufzeit' : 'Chain life',
      node: <AnimatedNumber value={life} suffix="×" className={numCls} style={valStyle} />,
      pct: wax ? 100 : 33,
    },
    {
      label: de ? 'Sauberkeit' : 'Cleanliness',
      node: <span className="text-[15px] font-semibold" style={valStyle}>{wax ? (de ? 'Trocken & sauber' : 'Dry & clean') : (de ? 'Bindet Schmutz' : 'Binds dirt')}</span>,
      pct: wax ? 100 : 15,
    },
  ];

  return (
    <section id="problem" className={`${W} pt-28 sm:pt-36 pb-20`}>
      <p className="eyebrow mb-4" style={{ color: 'var(--accent-soft)' }}>
        {de ? 'Tribologie' : 'Tribology'}
      </p>
      <h1 className="font-display font-bold text-wx-tx1 leading-[1.05] mb-5"
        style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Was im Schmierspalt passiert.' : 'What happens in the lubricant gap.'}
      </h1>
      <p className="text-wx-txm text-lead max-w-2xl mb-12">
        {de
          ? 'Zwei Metallflächen gleiten aufeinander. Partikel gelangen in den Kontakt. Die Art der Schmierung entscheidet, ob sie schleifen — oder abgleiten.'
          : 'Two metal surfaces slide against each other. Particles enter the contact zone. The type of lubrication determines whether they grind — or slide off.'}
      </p>

      <InstrumentFrame eyebrow={de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}>
        <SegmentedToggle
          ariaLabel={de ? 'Öl oder Wachs' : 'Oil or wax'}
          value={state} onChange={setState} className="max-w-xs mb-6"
          options={[
            { value: 'wax', label: de ? 'Wachs' : 'Wax' },
            { value: 'oil', label: de ? 'Öl' : 'Oil' },
          ]}
        />

        {/* ── Microscope viewport ── */}
        <div className="rounded-xl overflow-hidden mb-8"
          style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em]"
              style={{ color: 'var(--txf)' }}>
              {de ? 'Kontaktzone' : 'Contact zone'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
              style={{ background: 'var(--bd)', fontSize: 10 }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="7" cy="7" r="5" stroke="var(--txf)" strokeWidth="1.5" />
                <line x1="11" y1="11" x2="14" y2="14" stroke="var(--txf)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="num-data" style={{ color: 'var(--txf)' }}>×100</span>
            </span>
          </div>

          <div className="px-3 sm:px-5 pb-2">
            <ContactZone wax={wax} />
          </div>

          <div className="px-4 pb-3.5">
            <p className="text-center text-[11px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: wax ? 'var(--accent)' : 'var(--txm)', transition: 'color 0.4s ease' }}>
              {wax
                ? (de ? 'Trockener Wachsfilm — Partikel gleiten ab' : 'Dry wax film — particles slide off')
                : (de ? 'Schleifpaste — Partikel schleifen Metall ab' : 'Grinding paste — particles abrade metal')}
            </p>
          </div>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="rounded-lg px-4 py-3.5"
              style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
              <dt className="text-[10px] uppercase tracking-[0.14em] mb-2.5"
                style={{ color: 'var(--txf)' }}>{m.label}</dt>
              <dd className="mb-3">{m.node}</dd>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                <div className="h-full rounded-full"
                  style={{
                    width: `${m.pct}%`,
                    background: wax
                      ? 'linear-gradient(90deg, var(--accent), var(--accent-strong))'
                      : 'var(--txm)',
                    transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1), background 0.3s ease',
                  }} />
              </div>
            </div>
          ))}
        </div>
      </InstrumentFrame>
    </section>
  );
}

// ─── Insight — accent-bar callout used inside the deep "Die Physik" tier ──────
function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mt-4 pl-1">
      <span className="w-0.5 flex-shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
      <p className="text-[13px] leading-relaxed italic" style={{ color: 'var(--tx2)' }}>{children}</p>
    </div>
  );
}

// ─── Disclosure — one collapsible tier (grid-rows 0fr→1fr) ───────────────────
function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium"
        style={{ color: 'var(--accent)' }} aria-expanded={open}>
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── ACT II — component card: editorial split layout (inspired by numbered index) ─
function CompCard({ c, n, de, cardRef }: { c: ScienceComponent; n: number; de: boolean; cardRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={cardRef} id={c.id} className="scroll-mt-24 rounded-2xl border border-wx-bd overflow-hidden"
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shad)' }}>
      {/* Header band */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--bd2)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="num-data text-[12px] flex-shrink-0" style={{ color: 'var(--txf)' }}>0{n}</span>
            <div className="h-px flex-1 max-w-[32px]" style={{ background: 'var(--accent-soft)', opacity: 0.4 }} />
            <span className="text-[10px] uppercase tracking-[0.18em] flex-shrink-0" style={{ color: 'var(--accent-soft)' }}>
              {de ? c.roleDe : c.roleEn}
            </span>
          </div>
          <span className="num-data font-semibold text-[17px] flex-shrink-0" style={{ color: 'var(--accent-soft)' }}>
            {c.metric}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <h3 className="font-display font-bold text-wx-tx1 text-[1.35rem] leading-tight tracking-[-0.01em]">
          {de ? c.nameDe : c.nameEn}
        </h3>
        <p className="text-[14px] leading-relaxed text-wx-tx2 mt-3 max-w-prose">
          {de ? c.sumDe : c.sumEn}
        </p>

        {/* Tier 2a — short rationale */}
        <Disclosure label={de ? 'Warum das zählt' : 'Why it matters'}>
          <p className="text-[13px] leading-relaxed pt-3" style={{ color: 'var(--txm)' }}>
            {de ? c.whyDe : c.whyEn}
          </p>
        </Disclosure>

        {/* Tier 2b — deep physics + diagram + insight */}
        <Disclosure label={de ? 'Die Physik' : 'The physics'}>
          <div className="pt-3 space-y-3">
            {(de ? c.physicsDe : c.physicsEn).map((p, i) => (
              <p key={i} className="text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>{p}</p>
            ))}
          </div>
          <ComponentDiagram which={c.diagram} de={de} />
          <Insight>{de ? c.insightDe : c.insightEn}</Insight>
        </Disclosure>
      </div>
    </div>
  );
}

// ─── ACT II — development-iteration story (compact, collapsible) ──────────────
function FailureTimeline({ de }: { de: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-12">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 font-display font-bold text-wx-tx1"
        style={{ fontSize: '1.15rem' }} aria-expanded={open}>
        {de ? 'Wie die Formel entstand' : 'How the formula evolved'}
        <ChevronDown className="h-4 w-4 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none', color: 'var(--accent)' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.45s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ overflow: 'hidden' }}>
          <ol className="mt-5 space-y-4 border-l" style={{ borderColor: 'var(--bd)' }}>
            {FAILURES.map((f, i) => (
              <li key={i} className="relative pl-5">
                <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: f.isCurrent ? 'var(--accent)' : 'var(--bd)',
                    boxShadow: f.isCurrent ? '0 0 0 3px rgba(var(--accent-rgb),0.18)' : 'none' }} />
                <p className="text-[12px] uppercase tracking-[0.14em]"
                  style={{ color: f.isCurrent ? 'var(--accent)' : 'var(--txf)' }}>
                  {de ? f.vDe : f.vEn}
                </p>
                <p className="text-[13px] text-wx-tx2 mt-1">{de ? f.failDe : f.failEn}</p>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--accent)' }}>→ {de ? f.fixDe : f.fixEn}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── ACT II — ambient temperature operating range (Pro vs Classic comparison) ─
const AMB = { min: -10, max: 45 };
const AX = (t: number) => ((t - AMB.min) / (AMB.max - AMB.min)) * 100;
function TempWindow({ de }: { de: boolean }) {
  const ticks = [-5, 0, 10, 20, 30, 40];
  const pro     = { lo: -8, hi: 45 };
  const classic = { lo: 5,  hi: 35 };

  return (
    <InstrumentFrame eyebrow={de ? 'Einsatzbereich' : 'Operating range'}
      chip={de ? 'Außentemperatur' : 'Ambient temp.'} className="h-full">

      <div className="space-y-5">
        {/* Pro bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--tx1)' }}>Pro</span>
            <span className="num-data text-[10px]" style={{ color: 'var(--accent-soft)' }}>−8 … 45+ °C</span>
          </div>
          <div className="relative h-3 rounded-full" style={{ background: 'var(--sf2)' }}>
            <div className="absolute inset-y-0 rounded-full"
              style={{ left: `${AX(pro.lo)}%`, right: '0%',
                background: 'linear-gradient(90deg, var(--accent), rgba(var(--accent-rgb),0.55))',
              }} />
            {/* arrow indicating >45°C */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
              style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
                borderLeft: '6px solid var(--accent)', marginRight: -7, opacity: 0.6 }} />
          </div>
        </div>

        {/* Classic bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--tx1)' }}>Classic</span>
            <span className="num-data text-[10px]" style={{ color: 'var(--txf)' }}>+5 … ~35 °C</span>
          </div>
          <div className="relative h-3 rounded-full" style={{ background: 'var(--sf2)' }}>
            <div className="absolute inset-y-0 rounded-full"
              style={{ left: `${AX(classic.lo)}%`, width: `${AX(classic.hi) - AX(classic.lo)}%`,
                background: 'var(--txf)',
                opacity: 0.45,
              }} />
          </div>
        </div>

        {/* Shared axis */}
        <div className="relative h-5">
          <div className="absolute left-0 right-0 top-0 h-px" style={{ background: 'var(--bd)' }} />
          {ticks.map(t => (
            <div key={t} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${AX(t)}%` }}>
              <div className="w-px h-1.5 mx-auto" style={{ background: 'var(--bd)' }} />
              <span className="num-data text-[9px] block mt-0.5" style={{ color: 'var(--txf)' }}>{t > 0 ? `+${t}` : t}°</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[12px] leading-relaxed mt-3" style={{ color: 'var(--txm)' }}>
        {de
          ? 'Pro deckt den gesamten Fahrradbereich ab — von Winterfahrten bei −8 °C bis Sommerhitze über 40 °C. Classic funktioniert zuverlässig von Frühling bis Herbst, stößt aber bei Frost und extremer Hitze an Grenzen.'
          : 'Pro covers the full cycling range — from winter rides at −8 °C to summer heat above 40 °C. Classic works reliably from spring to autumn but hits limits in frost and extreme heat.'}
      </p>
    </InstrumentFrame>
  );
}

// ─── Microscope comparison — real micrograph evidence ────────────────────────
const MICRO = [
  { n: '01', de: 'Kettenglied – Innenfläche', en: 'Chain link – inner surface', mag: '1 000×',
    ref: '/images/microscope/01-chain-link-inner-ref.webp',
    mos2: '/images/microscope/01-chain-link-inner-mos2.webp' },
  { n: '02', de: 'Kassettenspeiche – Verschleißkante', en: 'Cassette spoke – wear edge', mag: '2 000×',
    ref: '/images/microscope/02-sprocket-wear-edge-ref.webp',
    mos2: '/images/microscope/02-sprocket-wear-edge-mos2.webp' },
  { n: '03', de: 'Kassettenspeiche – Zahnflanke', en: 'Cassette spoke – tooth flank', mag: '2 500×',
    ref: '/images/microscope/03-sprocket-tooth-flank-ref.webp',
    mos2: '/images/microscope/03-sprocket-tooth-flank-mos2.webp' },
  { n: '04', de: 'Kettenglied – Innenfläche', en: 'Chain link – inner surface', mag: '1 000×',
    ref: '/images/microscope/04-chain-link-inner-2-ref.webp',
    mos2: '/images/microscope/04-chain-link-inner-2-mos2.webp' },
];

function Microscope({ de }: { de: boolean }) {
  return (
    <div>
      <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
        {de ? 'Oberflächenanalyse' : 'Surface analysis'}
      </p>
      <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-2"
        style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Unter dem Mikroskop.' : 'Under the microscope.'}
      </h2>
      <p className="text-[15px] max-w-xl mb-8" style={{ color: 'var(--txm)' }}>
        {de
          ? 'Originalaufnahmen von Antriebskomponenten — jede Gegenüberstellung bei identischer Vergrößerung und identischen Aufnahmebedingungen.'
          : 'Original micrographs of drivetrain components — each pair shot at identical magnification and conditions.'}
      </p>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--txm)', opacity: 0.35 }} />
          <span className="text-[11px]" style={{ color: 'var(--txm)' }}>
            {de ? 'Referenz (ohne MoS₂)' : 'Reference (no MoS₂)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="text-[11px]" style={{ color: 'var(--txm)' }}>Waxcelerate + MoS₂</span>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {MICRO.map((row) => (
          <div key={row.n} className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <div className="flex items-baseline gap-2">
                <span className="num-data text-[14px] font-bold" style={{ color: 'var(--tx2)' }}>{row.n}</span>
                <span className="text-[12px]" style={{ color: 'var(--txm)' }}>{de ? row.de : row.en}</span>
              </div>
              <span className="num-data text-[10px] px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.10)',
                  color: 'var(--txf)' }}>
                {row.mag}
              </span>
            </div>
            {/* Column labels — aligned to the two stage halves */}
            <div className="grid grid-cols-2 mx-3 mb-1.5">
              <span className="text-[9px] uppercase tracking-[0.14em] pl-0.5" style={{ color: 'var(--txf)' }}>
                {de ? 'Referenz' : 'Reference'}
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] pl-2.5" style={{ color: 'var(--accent-soft)' }}>
                Waxcelerate
              </span>
            </div>
            {/* Image pair — one dark "microscope stage", hairline divider, full frame (no crop) */}
            <div className="grid grid-cols-2 mx-3 mb-3 rounded-xl overflow-hidden" style={{ background: '#0a0e1a' }}>
              <div className="aspect-[4/3]">
                <img src={row.ref} alt={`${de ? row.de : row.en} – ${de ? 'Referenz' : 'Reference'}`}
                  className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="aspect-[4/3]" style={{ borderLeft: '1px solid rgba(255,255,255,0.09)' }}>
                <img src={row.mos2} alt={`${de ? row.de : row.en} – Waxcelerate + MoS₂`}
                  className="w-full h-full object-contain" loading="lazy" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Methodology note */}
      <p className="text-[11px] leading-relaxed mt-5" style={{ color: 'var(--txff)' }}>
        {de
          ? 'Reale Oberflächenstrukturen, keine Simulationen. Referenz und Waxcelerate-Probe je Gegenüberstellung bei identischer Vergrößerung und unter identischen Bedingungen aufgenommen.'
          : 'Real surface structures, not simulations. Reference and Waxcelerate sample shot at identical magnification and conditions within each pair.'}
      </p>
    </div>
  );
}

// ─── ACT III — friction proof bars (higher bar = better; never invert) ───────
function FrictionBars({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(prefersReducedMotion());
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const trigger = ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => setRun(true) });
    return () => trigger.kill();
  }, []);
  const labels: Record<string, string> = {
    pro: 'Pro', classic: 'Classic', oil: de ? 'Kettenöl' : 'Chain oil',
  };
  return (
    <div ref={ref} id="reibung" className="scroll-mt-24 space-y-4">
      {frictionRanges.map(r => (
        <div key={r.id}>
          <div className="flex justify-between mb-1.5">
            <span className={`text-[13px] font-medium ${r.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>{labels[r.id]}</span>
            <span className="num-data text-[12px]" style={{ color: r.highlight ? 'var(--tx2)' : 'var(--txff)' }}>
              μ {r.muLo.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}–{r.muHi.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
            <div className="h-full rounded-full"
              style={{
                width: run ? `${r.pct}%` : '0%',
                background: r.highlight
                  ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                  : 'var(--txf)',
                transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
              }} />
          </div>
        </div>
      ))}
      <p className="text-[12px] pt-1" style={{ color: 'var(--txf)' }}>
        {de ? 'Höherer Balken = weniger Reibung (Performance-Index).' : 'Higher bar = less friction (performance index).'}
      </p>
    </div>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function ActHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mb-10">
      <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{eyebrow}</p>
      <h2 className="font-display font-bold text-wx-tx1 leading-tight"
        style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>{title}</h2>
      {lede && <p className="text-wx-txm text-lead max-w-2xl mt-4">{lede}</p>}
    </div>
  );
}

// ─── Scroll-driven formula storytelling (desktop only) ──────────────────────
function FormulaStory({ de }: { de: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = section.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const p = Math.min(1, scrolled / maxScroll);
      setActiveIdx(Math.min(COMPONENTS.length - 1, Math.floor(p * COMPONENTS.length)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToComponent = (id: string) => {
    const idx = COMPONENTS.findIndex(c => c.id === id);
    if (idx < 0 || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const maxScroll = sectionRef.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: sectionTop + ((idx + 0.5) / COMPONENTS.length) * maxScroll, behavior: 'smooth' });
  };

  const comp = COMPONENTS[activeIdx];

  return (
    <div ref={sectionRef} className="relative" style={{ height: `${COMPONENTS.length * 60}vh` }}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-[minmax(320px,440px)_1fr] gap-10 xl:gap-14 items-center">
            {/* LEFT — component info (crossfading) */}
            <div className="relative" style={{ minHeight: 400 }}>
              {COMPONENTS.map((c, i) => (
                <div
                  key={c.id}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{
                    opacity: i === activeIdx ? 1 : 0,
                    transform: `translateY(${i === activeIdx ? 0 : i < activeIdx ? -20 : 20}px)`,
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    pointerEvents: i === activeIdx ? 'auto' : 'none',
                  }}
                >
                  {/* Step counter */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="num-data text-[28px] font-bold leading-none" style={{ color: 'rgba(var(--accent-rgb),0.18)' }}>
                      0{i + 1}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--accent-soft)' }}>
                      {de ? c.roleDe : c.roleEn}
                    </span>
                  </div>
                  {/* Title */}
                  <h3 className="font-display font-bold text-wx-tx1 leading-[1.05] tracking-[-0.025em]"
                    style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)' }}>
                    {de ? c.nameDe : c.nameEn}
                  </h3>
                  {/* Accent line + metric */}
                  <div className="flex items-center gap-4 mt-3 mb-5">
                    <div className="h-[2px] w-10 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span className="num-data font-semibold text-[14px]" style={{ color: 'var(--accent-soft)' }}>
                      {c.metric}
                    </span>
                  </div>
                  {/* Summary */}
                  <p className="text-[15px] leading-relaxed text-wx-tx2 max-w-[38ch]">
                    {de ? c.sumDe : c.sumEn}
                  </p>
                  {/* Expandable details */}
                  <div className="mt-2">
                    <Disclosure label={de ? 'Warum das zählt' : 'Why it matters'}>
                      <p className="text-[13px] leading-relaxed pt-3" style={{ color: 'var(--txm)' }}>
                        {de ? c.whyDe : c.whyEn}
                      </p>
                    </Disclosure>
                    <Disclosure label={de ? 'Die Physik' : 'The physics'}>
                      <div className="pt-3 space-y-3">
                        {(de ? c.physicsDe : c.physicsEn).map((p, j) => (
                          <p key={j} className="text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>{p}</p>
                        ))}
                      </div>
                      <ComponentDiagram which={c.diagram} de={de} />
                      <Insight>{de ? c.insightDe : c.insightEn}</Insight>
                    </Disclosure>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — FormulaGraph */}
            <div className="relative">
              <div className="absolute inset-0 -m-8 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(var(--accent-rgb),0.06) 0%, transparent 70%)',
                  filter: 'blur(24px)',
                }} />
              <FormulaGraph de={de} onSelect={scrollToComponent} scrollFocus={comp.node} compact />
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2.5">
              {COMPONENTS.map((c, i) => (
                <button key={c.id} onClick={() => scrollToComponent(c.id)}
                  aria-label={de ? c.nameDe : c.nameEn}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span className="rounded-full transition-all duration-300"
                    style={{
                      width: i === activeIdx ? 24 : 8,
                      height: 8,
                      background: i === activeIdx ? 'var(--accent)' : i < activeIdx ? 'rgba(var(--accent-rgb),0.35)' : 'var(--bd)',
                    }}
                  />
                  <span className="text-[9px] uppercase tracking-[0.14em] transition-opacity duration-300"
                    style={{ color: 'var(--txf)', opacity: i === activeIdx ? 1 : 0 }}>
                    {de ? c.graphLabelDe : c.graphLabelEn}
                  </span>
                </button>
              ))}
            </div>
            <span className="text-[10px] tracking-[0.12em] uppercase transition-opacity duration-700"
              style={{ color: 'var(--txf)', opacity: activeIdx === 0 ? 0.7 : 0 }}>
              {de ? 'Scrollen zum Erkunden' : 'Scroll to explore'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SciencePage() {
  const { lang, toggleLang } = useLanguage();
  const de = lang === 'de';
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [hash]);

  const scrollToAnchor = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-wx-bg">
      <ScrollProgress />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md"
        style={{ background: 'color-mix(in srgb, var(--pg) 82%, transparent)', borderBottom: '1px solid var(--bd2)' }}>
        <div className={`${W} flex items-center justify-between h-14`}>
          <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-wx-tx2 transition-opacity hover:opacity-70">
            <ArrowLeft className="h-4 w-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <p className="eyebrow" style={{ color: 'var(--txf)' }}>{de ? 'Die Wissenschaft' : 'The Science'}</p>
          <button onClick={toggleLang} className="text-[12px] font-medium text-wx-tx2 transition-opacity hover:opacity-70">
            {de ? 'EN' : 'DE'}
          </button>
        </div>
      </header>

      {/* ── ACT I — PROBLEM ── */}
      <ProblemHero de={de} />

      {/* ── ACT II — FORMULA (scroll-driven storytelling) ── */}
      <section style={{ borderTop: '1px solid var(--bd2)' }}>
        {/* Section heading */}
        <div className={`${W} pt-20 pb-8`}>
          <ActHead
            eyebrow={de ? 'Die Formel' : 'The Formula'}
            title={de ? 'Sechs Komponenten, ein System.' : 'Six components, one system.'}
            lede={de
              ? 'Jede Zutat löst ein konkretes Versagensszenario. Zusammen ergeben sie einen Film, der sauber bleibt, unter Last hält und im Winter nicht bricht.'
              : "Each ingredient solves a specific failure mode. Together they make a film that stays clean, holds under load, and doesn't crack in winter."}
          />
        </div>

        {/* Desktop: scroll-driven storytelling */}
        <div className="hidden lg:block">
          <FormulaStory de={de} />
        </div>

        {/* Mobile: stacked cards */}
        <div className="lg:hidden">
          <div className={`${W} pb-8`}>
            <InstrumentFrame eyebrow={de ? 'Das System' : 'The system'}>
              <FormulaGraph de={de} onSelect={scrollToAnchor} />
            </InstrumentFrame>
          </div>
          <div className={`${W} space-y-5 pb-12`}>
            {COMPONENTS.map((c, i) => <CompCard key={c.id} c={c} n={i + 1} de={de} />)}
          </div>
        </div>

        {/* Below: full-width deep-dive sections */}
        <div className={`${W} py-14`}>
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <HexMoS2 de={de} />
            <div id="matrix-window" className="h-full">
              <TempWindow de={de} />
            </div>
          </div>
          <FailureTimeline de={de} />
        </div>
      </section>

      {/* ── MICROSCOPE — real micrograph evidence ── */}
      <section className={`${W} pt-20 pb-16`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Microscope de={de} />
      </section>

      {/* ── ACT III — PROOF ── */}
      <section className={`${W} py-16`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <ActHead
          eyebrow={de ? 'Der Beweis' : 'The Proof'}
          title={de ? 'Gemessen, nicht behauptet.' : 'Measured, not claimed.'}
        />

        <InstrumentFrame eyebrow={de ? 'Reibung' : 'Friction'} className="mb-6">
          <FrictionBars de={de} />
        </InstrumentFrame>

        {/* Signature visual — Fe–S transfer film deposition (the payoff) */}
        <div className="mb-6">
          <TransferFilm de={de} />
        </div>

        {/* Outcome stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { v: '~300 km', d: de ? 'pro Rewax-Vorgang' : 'per rewax' },
            { v: `${waxVsOil.life.wax}×`, d: de ? 'längere Kettenlaufzeit' : 'longer chain life' },
            { v: `~€${waxVsOil.cost.savedEur}`, d: de ? `gespart auf ${waxVsOil.cost.km.toLocaleString('de-DE')} km` : `saved over ${waxVsOil.cost.km.toLocaleString('en-US')} km` },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-wx-bd p-6 text-center"
              style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shad)' }}>
              <CountUp value={s.v} className="font-display font-bold text-wx-tx1 block leading-none"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 2.6rem)' }} />
              <div className="h-0.5 w-8 mx-auto mt-3 mb-2 rounded-full" style={{ background: 'var(--accent)', opacity: 0.5 }} />
              <p className="text-[13px] text-wx-txm">{s.d}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl px-6 py-10 sm:py-12 text-center"
          style={{ background: 'rgba(var(--accent-rgb),0.04)', border: '1px solid rgba(var(--accent-rgb),0.12)' }}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Nächster Schritt' : 'Next step'}
          </p>
          <h3 className="font-display font-bold text-wx-tx1 mb-5" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {de ? 'Bereit für einen sauberen Antrieb?' : 'Ready for a clean drivetrain?'}
          </h3>
          <Link to="/#produkte"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {de ? 'Formel wählen' : 'Choose your formula'}
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </section>

      <footer className={`${W} py-12 text-center`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
      </footer>
    </div>
  );
}
