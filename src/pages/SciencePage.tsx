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

// ─── Tribology cross-section: microscope view of the contact zone ───────────
// Two rough metal surfaces with asperity peaks, a lubricant gap between them.
// Oil: particles trapped in the gap (grinding). Wax: particles sit outside, gap clean.
// Uses crossfade between two particle layers (no confusing position animation).
function ContactZone({ wax }: { wax: boolean }) {
  // Two parallel metal surfaces with realistic asperities in sliding contact.
  // Full-width bodies (edge-to-edge) eliminate the "converging triangles" illusion.
  // Motion arrows co-located at right edge show relative sliding clearly.
  const topSurf = 'M0,50 L32,50 L38,53 L44,57 L50,54 L56,50 L90,50 L96,52 L102,58 L108,61 L114,56 L120,50 L154,50 L160,53 L166,56 L172,53 L178,50 L212,50 L218,55 L224,61 L230,64 L234,58 L240,50 L274,50 L280,53 L286,58 L292,54 L298,50 L332,50 L338,54 L344,60 L350,56 L356,50 L390,50 L396,53 L402,58 L408,54 L414,50 L448,50 L454,52 L460,56 L466,53 L472,50 L500,50';
  const topPts = topSurf.replace('M','').split(/\s*L\s*/).map(s => s.trim());
  const topBody = `M0,0 L500,0 ${topPts.reverse().map(p => `L${p}`).join(' ')} Z`;

  const botSurf = 'M0,90 L28,90 L34,87 L40,83 L46,86 L52,90 L86,90 L92,87 L98,82 L104,79 L110,83 L116,90 L150,90 L156,87 L162,83 L168,86 L174,90 L208,90 L214,85 L220,79 L226,76 L232,81 L238,90 L272,90 L278,87 L284,83 L290,86 L296,90 L330,90 L336,86 L342,81 L348,84 L354,90 L388,90 L394,87 L400,83 L406,86 L412,90 L446,90 L452,87 L458,84 L464,87 L470,90 L500,90';
  const botPts = botSurf.replace('M','').split(/\s*L\s*/).map(s => s.trim());
  const botBody = `M0,140 L500,140 ${botPts.reverse().map(p => `L${p}`).join(' ')} Z`;

  const dust = [
    { x: 75, y: 43, r: 2.5 }, { x: 155, y: 41, r: 3 }, { x: 240, y: 44, r: 2.8 },
    { x: 325, y: 42, r: 2.5 }, { x: 405, y: 43, r: 3 }, { x: 465, y: 42, r: 2.2 },
    { x: 115, y: 45, r: 2 }, { x: 285, y: 40, r: 2.2 },
  ];
  const trapped = [
    { x: 48, y: 70, r: 3.2 }, { x: 106, y: 72, r: 3.8 },
    { x: 168, y: 68, r: 3 }, { x: 228, y: 73, r: 4.2 },
    { x: 288, y: 70, r: 3.5 }, { x: 344, y: 72, r: 3.2 },
    { x: 402, y: 69, r: 3.5 }, { x: 460, y: 71, r: 3 },
    { x: 78, y: 76, r: 2.5 }, { x: 140, y: 75, r: 2.8 },
    { x: 258, y: 77, r: 2.2 }, { x: 370, y: 76, r: 2.5 },
  ];

  return (
    <svg viewBox="0 0 500 140" className="w-full h-auto" role="img"
      aria-label={wax ? 'Dry wax film — particles cannot embed' : 'Oil traps grit into abrasive paste'}>
      <defs>
        <pattern id="cz-ht" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--txm)" strokeWidth="0.4" opacity="0.07" />
        </pattern>
        <linearGradient id="cz-mt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.40" />
        </linearGradient>
        <linearGradient id="cz-mb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.40" />
          <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.26" />
        </linearGradient>
        <linearGradient id="cz-oil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.20" />
          <stop offset="50%" stopColor="var(--txm)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.20" />
        </linearGradient>
        <filter id="cz-ps"><feDropShadow dx="0" dy="0.5" stdDeviation="0.8" floodColor="#000" floodOpacity="0.22" /></filter>
      </defs>

      {/* ── Dust above top surface (wax: particles can't enter gap) ── */}
      {dust.map((p, i) => (
        <circle key={`d${i}`} cx={p.x} cy={p.y} r={p.r}
          fill="var(--txm)" opacity={wax ? 0.4 : 0}
          style={{ transition: 'opacity 0.5s ease' }} />
      ))}

      {/* ── Top metal body — full width, no tapering ── */}
      <path d={topBody} fill="url(#cz-mt)" />
      <path d={topBody} fill="url(#cz-ht)" />
      <path d={topSurf} fill="none" stroke="var(--txm)" strokeWidth="1.2" opacity="0.50" strokeLinejoin="round" />

      {/* ── Gap: oil fill or wax film ── */}
      <rect x="0" y="50" width="500" height="40" fill={wax ? 'transparent' : 'url(#cz-oil)'}
        style={{ transition: 'fill 0.5s ease' }} />
      <path d={topSurf} fill="none" stroke="var(--accent)" strokeWidth="2.5"
        opacity={wax ? 0.35 : 0} style={{ transition: 'opacity 0.5s ease' }}
        transform="translate(0,3)" strokeLinejoin="round" />
      <path d={botSurf} fill="none" stroke="var(--accent)" strokeWidth="2.5"
        opacity={wax ? 0.35 : 0} style={{ transition: 'opacity 0.5s ease' }}
        transform="translate(0,-3)" strokeLinejoin="round" />

      {/* ── Trapped particles (oil: abrasive grinding paste) ── */}
      {trapped.map((p, i) => (
        <circle key={`t${i}`} cx={p.x} cy={p.y} r={p.r}
          fill="var(--tx2)" opacity={wax ? 0 : 0.7} filter={wax ? undefined : 'url(#cz-ps)'}
          style={{ transition: `opacity 0.5s ease ${wax ? 0 : 0.2 + i * 0.04}s` }} />
      ))}

      {/* ── Abrasion scratches on bottom surface (oil mode) ── */}
      {[50, 108, 170, 230, 290, 346, 404, 462].map((x, i) => (
        <line key={`sc${i}`} x1={x - 12} y1={89 - (i % 2)} x2={x + 12} y2={88 + (i % 2)}
          stroke="var(--accent-strong)" strokeWidth="0.6" opacity={wax ? 0 : 0.28}
          style={{ transition: 'opacity 0.5s ease' }} />
      ))}

      {/* ── Bottom metal body — full width, no tapering ── */}
      <path d={botBody} fill="url(#cz-mb)" />
      <path d={botBody} fill="url(#cz-ht)" />
      <path d={botSurf} fill="none" stroke="var(--txm)" strokeWidth="1.2" opacity="0.50" strokeLinejoin="round" />

      {/* ── Motion arrows — both at right edge, showing relative sliding ── */}
      <g opacity="0.30">
        <line x1="480" y1="30" x2="496" y2="30" stroke="var(--txf)" strokeWidth="1" />
        <path d="M492,27 L497,30 L492,33" fill="none" stroke="var(--txf)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="496" y1="110" x2="480" y2="110" stroke="var(--txf)" strokeWidth="1" />
        <path d="M484,107 L479,110 L484,113" fill="none" stroke="var(--txf)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
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
        {de ? 'Das Problem' : 'The Problem'}
      </p>
      <h1 className="font-display font-bold text-wx-tx1 leading-[1.05] mb-5"
        style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Öl schmiert. Und schmirgelt.' : 'Oil lubricates. And grinds.'}
      </h1>
      <p className="text-wx-txm text-lead max-w-2xl mb-12">
        {de
          ? 'Öl bindet jeden Staubkorn zu einer Schleifpaste, die bei jedem Tritt Metall abträgt. Wachs bleibt trocken — nichts haftet, nichts schmirgelt. Schalt um und sieh den Unterschied.'
          : 'Oil binds every speck of grit into a grinding paste that wears metal with each pedal stroke. Wax stays dry — nothing sticks, nothing grinds. Flip the switch and see the difference.'}
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
      chip={de ? 'Außentemperatur' : 'Ambient temp.'}>

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
          ? 'Originalaufnahmen von Antriebskomponenten unter identischen Bedingungen und identischer Vergrößerung.'
          : 'Original micrographs of drivetrain components under identical conditions and magnification.'}
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
            {/* Column labels */}
            <div className="grid grid-cols-2 gap-2 px-4 pb-1.5">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--txf)' }}>
                {de ? 'Referenz' : 'Reference'}
              </span>
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--accent-soft)' }}>
                Waxcelerate
              </span>
            </div>
            {/* Image pair */}
            <div className="grid grid-cols-2 gap-2 px-3 pb-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden" style={{ background: '#0a0e1a' }}>
                <img src={row.ref} alt={`${de ? row.de : row.en} – ${de ? 'Referenz' : 'Reference'}`}
                  className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden" style={{ background: '#0a0e1a' }}>
                <img src={row.mos2} alt={`${de ? row.de : row.en} – Waxcelerate + MoS₂`}
                  className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Methodology note */}
      <p className="text-[11px] leading-relaxed mt-5" style={{ color: 'var(--txff)' }}>
        {de
          ? 'Alle Aufnahmen bei identischer Vergrößerung und identischen Aufnahmebedingungen. Reale Oberflächenstrukturen — keine Simulationen.'
          : 'All images at identical magnification and conditions. Real surface structures — not simulations.'}
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
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <HexMoS2 de={de} />
            <div id="matrix-window">
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
