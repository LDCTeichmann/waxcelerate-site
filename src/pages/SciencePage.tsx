import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronsLeftRight, Gauge, Clock, Droplets, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { InstrumentFrame, SegmentedToggle, AnimatedNumber, CountUp, SprocketTooth } from '@/components/viz';
import { waxVsOil, frictionRanges } from '@/lib/data';
import { COMPONENTS, FAILURES, type ScienceComponent } from '@/lib/science';
import { FormulaGraph } from '@/sections/science/FormulaGraph';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { HexMoS2, TransferFilm } from '@/sections/science/LabViz';

const W = 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';

// One rough (worn) surface in cross-section meeting a moving counter-surface,
// same viewBox aspect as SprocketTooth (320×300) so the twin panels actually
// match height instead of this one collapsing to a sliver with dead space
// below it. The physical story in one frame: a rough, jagged surface (the
// asperities that grind against a chain roller) with a hard grit particle at
// the interface — wax's conformal film blankets every peak/valley so the
// grit rides on top of it, clear of the metal; without it, the grit wedges
// directly against bare metal and gets dragged through it, leaving a scratch.
const CZ_PROFILE = 'M0,190 L28,168 L46,196 L70,150 L92,192 L118,160 L140,198 L168,155 L192,194 L216,162 L240,200 L264,158 L288,192 L320,170';
const CZ_WAX_FILM = 'M0,145 C40,140 60,148 92,142 C120,138 150,146 180,141 C210,137 250,146 288,140 L320,138';
const CZ_MOTION_ARROW = { x1: 230, y1: 40, x2: 270, y2: 40, arrow: 'M262,32 L276,40 L262,48' };

function ContactZone({ wax }: { wax: boolean; de?: boolean }) {
  return (
    <svg viewBox="0 0 320 300" className="w-full h-auto" role="img"
      aria-label={wax ? 'Dry wax film blankets the rough surface — grit rides clear' : 'Grit wedges against bare metal and scratches it'}>
      <defs>
        <linearGradient id="cz-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tx2)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--tx2)" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="cz-bot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tx2)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--tx2)" stopOpacity="0.10" />
        </linearGradient>
        <pattern id="cz-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--txm)" strokeWidth="0.4" opacity="0.16" />
        </pattern>
        <pattern id="cz-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--accent)" opacity="0.09" />
        </pattern>
        <filter id="cz-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.24" />
        </filter>
      </defs>

      <rect width="320" height="300" fill="url(#cz-dots)" />

      {/* Bottom surface — rough, jagged (the worn/asperity-covered part) */}
      <path d={`${CZ_PROFILE} L320,300 L0,300 Z`} fill="url(#cz-bot)" />
      <path d={`${CZ_PROFILE} L320,300 L0,300 Z`} fill="url(#cz-hatch)" />
      <path d={CZ_PROFILE} fill="none" stroke="var(--tx2)" strokeWidth={2.5}
        opacity={wax ? 0.4 : 0.65} strokeLinejoin="round"
        style={{ transition: 'opacity 350ms ease' }} />

      {/* Wax film — conformal, blankets every peak so nothing can wedge in */}
      <path d={CZ_WAX_FILM} fill="none" stroke="var(--accent)" strokeWidth={3.5} strokeLinecap="round"
        style={{ opacity: wax ? 0.75 : 0, transition: 'opacity 350ms ease' }} />
      <path d={`${CZ_WAX_FILM} L320,190 C280,196 250,186 210,190 C180,186 150,196 120,190 C90,186 60,196 30,192 L0,195 Z`}
        fill="var(--accent)" style={{ opacity: wax ? 0.10 : 0, transition: 'opacity 350ms ease' }} />

      {/* Top (moving) surface */}
      <path d="M0,0 L320,0 L320,95 L0,88 Z" fill="url(#cz-top)" />
      <path d="M0,0 L320,0 L320,95 L0,88 Z" fill="url(#cz-hatch)" />
      <path d="M0,88 L320,95" fill="none" stroke="var(--tx2)" strokeWidth={2.5} opacity={0.65} />

      {/* Grit — sits on top of the wax film (wax) or wedged directly on bare metal (oil) */}
      <path
        d={wax ? 'M155,102 L173,95 L184,106 L179,122 L162,126 L150,114 Z' : 'M140,110 L162,100 L178,112 L174,138 L150,146 L132,128 Z'}
        fill="var(--tx2)" opacity={0.7} filter="url(#cz-shadow)"
        style={{ transition: 'd 350ms ease' }} />

      {/* Wax: motion arc carrying the grit away, clear of everything */}
      <path d="M184,106 C215,92 245,78 270,58" fill="none" stroke="var(--txf)" strokeWidth={1.5}
        strokeDasharray="2 4" strokeLinecap="round"
        style={{ opacity: wax ? 0.55 : 0, transition: 'opacity 350ms ease' }} />

      {/* Oil: fresh scratch groove cut into the top surface right above the grit */}
      <path d="M100,92 L200,100" fill="none" stroke="var(--tx1)" strokeWidth={3.5} strokeLinecap="round"
        style={{ opacity: wax ? 0 : 0.55, transition: 'opacity 350ms ease' }} />

      {/* Sliding-direction cue */}
      <g stroke="var(--txf)" strokeWidth={2} opacity={0.55} strokeLinecap="round">
        <line x1={CZ_MOTION_ARROW.x1} y1={CZ_MOTION_ARROW.y1} x2={CZ_MOTION_ARROW.x2} y2={CZ_MOTION_ARROW.y2} />
        <path d={CZ_MOTION_ARROW.arrow} fill="none" />
      </g>
    </svg>
  );
}

// ─── Opening hero — the page's actual "hero" moment: headline stats + a large
// cassette rendering, dark stage (matches the homepage hero's card treatment)
// so it reads as an entrance, not another instrument panel. All numbers come
// from the same `waxVsOil` source as the homepage's why-wax section — no
// invented stats. ProblemHero below carries on with the sober toggle deep-dive.
function ScienceHero({ de }: { de: boolean }) {
  const f = waxVsOil.friction, w = waxVsOil.watts, l = waxVsOil.life;
  const cards = [
    {
      icon: Gauge,
      value: `μ ${f.wax.toFixed(2)}`,
      label: de ? 'Reibung' : 'Friction',
      detail: de ? `${Math.round(f.oil / f.wax)}× weniger als Öl` : `${Math.round(f.oil / f.wax)}× less than oil`,
    },
    {
      icon: Droplets,
      value: `${w.wax[0]}–${w.wax[1]} W`,
      label: de ? 'Antriebsverlust' : 'Drivetrain loss',
      detail: de ? `Öl: ${w.oil[0]}–${w.oil[1]} W` : `Oil: ${w.oil[0]}–${w.oil[1]} W`,
    },
    {
      icon: Clock,
      value: `${l.wax}×`,
      label: de ? 'Kettenlaufzeit' : 'Chain life',
      detail: de ? 'gegenüber Öl' : 'vs oil lubrication',
    },
    {
      icon: Sparkles,
      value: de ? 'Trocken' : 'Dry',
      label: de ? 'Sauberkeit' : 'Cleanliness',
      detail: de ? 'Kein Dreck, keine Flecken' : 'No grime, no stains',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20" style={{ background: 'var(--pg)' }}>
      {/* The complete reference figure — own annotations, callouts and
          thumbnail comparisons all baked into the JPG — shown whole, not
          cropped down to just the product shot. Its background (245,245,245)
          is close enough to var(--pg) (#F5F5F6) that it simply merges into
          the page instead of needing a border, card, or fade mask to hide a
          seam; there isn't one. Desktop: sits to the right of the text at a
          size that keeps every label in the figure legible. */}
      <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2 w-[46%] xl:w-[42%]" aria-hidden>
        <picture>
          <source srcSet="/images/science/cassette-wear-full.webp" type="image/webp" />
          <img
            src="/images/science/cassette-wear-full.jpg"
            alt=""
            className="w-full h-auto"
          />
        </picture>
      </div>

      <div className={`${W} relative z-10`}>
        <div className="max-w-lg">
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
          </p>
          <h2 className="font-display font-bold leading-[1.05] mb-4"
            style={{ color: 'var(--tx1)', fontSize: 'clamp(2rem, 4.2vw, 3rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Ein messbarer Unterschied.' : 'One measurable difference.'}
          </h2>
          <p className="mb-6" style={{ color: 'var(--txm)', fontSize: 15, maxWidth: '38ch' }}>
            {de
              ? 'Derselbe Antrieb, zwei Schmierstoffe — Seite an Seite gemessen.'
              : 'Same drivetrain, two lubricants — measured side by side.'}
          </p>

          {/* Mobile/tablet: same complete figure, just inline above the stats
              instead of floating beside them — no room for that at this width. */}
          <div className="lg:hidden mb-6">
            <picture>
              <source srcSet="/images/science/cassette-wear-full.webp" type="image/webp" />
              <img
                src="/images/science/cassette-wear-full.jpg"
                alt={de ? 'Verschleißprinzip: Zahnflanke einer Kassette, neu vs. abgenutzt' : 'Wear principle: cassette tooth flank, new vs. worn'}
                className="w-full h-auto"
              />
            </picture>
          </div>

          {/* Stats — hairline-divided, no card fill/border, so they read as
              numbers hovering over the page rather than four boxed tiles. */}
          <div className="grid grid-cols-2 mb-8" style={{ border: '1px solid var(--bd2)', borderRadius: 14 }}>
            {cards.map((c, i) => (
              <div key={c.label} className="px-4 py-3.5"
                style={{
                  borderLeft: i % 2 === 1 ? '1px solid var(--bd2)' : 'none',
                  borderTop: i >= 2 ? '1px solid var(--bd2)' : 'none',
                }}>
                <c.icon className="h-3.5 w-3.5 mb-2" style={{ color: 'var(--txf)' }} aria-hidden />
                <p className="num-data font-bold text-[19px] sm:text-[21px] leading-none" style={{ color: 'var(--tx1)' }}>{c.value}</p>
                <p className="text-[9.5px] uppercase tracking-[0.1em] mt-2" style={{ color: 'var(--txf)' }}>{c.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--txm)' }}>{c.detail}</p>
              </div>
            ))}
          </div>

          <a href="#problem" className="inline-flex items-center gap-2 text-[13px] font-semibold transition-opacity hover:opacity-75" style={{ color: 'var(--tx1)' }}>
            {de ? 'Wie das gemessen wurde' : 'How this was measured'}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
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
      icon: Gauge,
      node: <AnimatedNumber value={friction} decimals={2} prefix="μ " className={numCls} style={valStyle} />,
      pct: wax ? 15 : 100,
    },
    {
      label: de ? 'Antriebsverlust' : 'Drivetrain loss',
      icon: Droplets,
      node: <span className={numCls} style={valStyle}><AnimatedNumber value={wLo} />–<AnimatedNumber value={wHi} /><span className="text-[18px] ml-0.5">W</span></span>,
      pct: wax ? 33 : 100,
    },
    {
      label: de ? 'Kettenlaufzeit' : 'Chain life',
      icon: Clock,
      node: <AnimatedNumber value={life} suffix="×" className={numCls} style={valStyle} />,
      pct: wax ? 100 : 33,
    },
    {
      label: de ? 'Sauberkeit' : 'Cleanliness',
      icon: Sparkles,
      node: <span className="text-[15px] font-semibold" style={valStyle}>{wax ? (de ? 'Trocken & sauber' : 'Dry & clean') : (de ? 'Bindet Schmutz' : 'Binds dirt')}</span>,
      pct: wax ? 100 : 15,
    },
  ];

  return (
    <section id="problem" className={`${W} pt-16 sm:pt-20 pb-20`}>
      <p className="eyebrow mb-4" style={{ color: 'var(--accent-soft)' }}>
        {de ? 'Tribologie' : 'Tribology'}
      </p>
      <h1 className="font-display font-bold text-wx-tx1 leading-[1.05] mb-5"
        style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Was im Schmierspalt passiert.' : 'What happens in the lubricant gap.'}
      </h1>
      <p className="text-wx-txm text-lead max-w-2xl mb-12">
        {de
          ? 'Zwei Metallflächen gleiten aufeinander. Partikel gelangen in den Kontakt. Die Art der Schmierung entscheidet, ob sie schleifen — oder abgleiten. Über Tausende Kilometer entscheidet genau das, wie lange Zahnflanke und Kette halten.'
          : 'Two metal surfaces slide against each other. Particles enter the contact zone. The type of lubrication determines whether they grind — or slide off. Over thousands of kilometres, that single difference decides how long the tooth flank and chain survive.'}
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

        {/* ── Twin viewports: same contact-zone physics, two vantage points ──
            Left = what happens at the surface (µm scale). Right = what that does
            to the part you'll actually replace (mm scale, months later). Same
            toggle drives both, so the cause→consequence link is immediate. */}
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <div className="rounded-xl overflow-hidden"
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

          <div className="rounded-xl overflow-hidden"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em]"
                style={{ color: 'var(--txf)' }}>
                {de ? 'Zahnflanke' : 'Tooth flank'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
                style={{ background: 'var(--bd)', fontSize: 10 }}>
                <span className="num-data" style={{ color: 'var(--txf)' }}>
                  {de ? 'KASSETTE' : 'CASSETTE'}
                </span>
              </span>
            </div>

            <div className="px-3 sm:px-5 pb-2">
              <SprocketTooth state={state} de={de} />
            </div>

            <div className="px-4 pb-3.5">
              <p className="text-center text-[11px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: wax ? 'var(--accent)' : 'var(--txm)', transition: 'color 0.4s ease' }}>
                {wax
                  ? (de ? 'Profil hält — Wechsel nach 4.000–5.000 km' : 'Profile holds — replace after 4,000–5,000 km')
                  : (de ? 'Flanke frisst sich an — Wechsel schon ab ~2.000 km' : 'Flank grinds away — replace as early as ~2,000 km')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="rounded-lg px-4 py-3.5"
              style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
              <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] mb-2.5"
                style={{ color: 'var(--txf)' }}>
                <m.icon className="h-3 w-3" strokeWidth={2} style={{ color: 'var(--txff)' }} aria-hidden />
                {m.label}
              </dt>
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

// Drag-to-reveal before/after — replaces a static side-by-side pair with an
// interactive one. Pointer position controls a clip-path on the "before"
// layer, so dragging left reveals more of the treated surface underneath.
function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt, beforeLabel, afterLabel }: {
  beforeSrc: string; afterSrc: string; beforeAlt: string; afterAlt: string;
  beforeLabel: string; afterLabel: string;
}) {
  const [pct, setPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(100, Math.max(0, raw)));
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      if (clientX != null) updateFromClientX(clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label={`${beforeLabel} / ${afterLabel}`}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      className="relative select-none rounded-xl overflow-hidden aspect-[4/3] mx-3 mb-3"
      style={{ background: '#0a0e1a', cursor: 'ew-resize', touchAction: 'none' }}
      onMouseDown={(e) => { draggingRef.current = true; updateFromClientX(e.clientX); }}
      onTouchStart={(e) => { draggingRef.current = true; updateFromClientX(e.touches[0].clientX); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPct(p => Math.max(0, p - 5));
        if (e.key === 'ArrowRight') setPct(p => Math.min(100, p + 5));
      }}
    >
      <img src={afterSrc} alt={afterAlt} className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <img src={beforeSrc} alt={beforeAlt} className="absolute inset-0 w-full h-full object-contain" draggable={false} />
      </div>

      {/* Handle */}
      <div className="absolute inset-y-0 pointer-events-none" style={{ left: `${pct}%` }}>
        <div className="absolute inset-y-0" style={{ width: 1.5, left: 0, transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)' }} />
        <div className="absolute top-1/2 flex items-center justify-center rounded-full"
          style={{ left: 0, transform: 'translate(-50%,-50%)', width: 32, height: 32, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>
          <ChevronsLeftRight className="h-4 w-4" style={{ color: '#101013' }} strokeWidth={2.25} />
        </div>
      </div>

      {/* Labels — fade with proximity so they don't fight the handle */}
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
        style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.35)' }}>
        {beforeLabel}
      </span>
      <span className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
        style={{ color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.35)' }}>
        {afterLabel}
      </span>
    </div>
  );
}

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
            {/* Drag-to-reveal — pull the handle to compare reference vs. treated surface directly */}
            <BeforeAfterSlider
              beforeSrc={row.ref}
              afterSrc={row.mos2}
              beforeAlt={`${de ? row.de : row.en} – ${de ? 'Referenz' : 'Reference'}`}
              afterAlt={`${de ? row.de : row.en} – Waxcelerate + MoS₂`}
              beforeLabel={de ? 'Referenz' : 'Reference'}
              afterLabel="Waxcelerate"
            />
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
    // Coalesce raw scroll events (can fire many times per frame) down to one
    // layout read + state update per animation frame, and skip the setState
    // entirely when the computed index hasn't actually changed.
    let rafId: number | null = null;
    const compute = () => {
      rafId = null;
      const rect = section.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = section.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const p = Math.min(1, scrolled / maxScroll);
      const next = Math.min(COMPONENTS.length - 1, Math.floor(p * COMPONENTS.length));
      setActiveIdx(prev => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
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
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Ambient instrument-panel texture behind the whole scroll-story
            viewport — same dot-grid language as every other diagram on this
            page, so six long scroll-steps of mostly-empty space read as one
            deliberate "lab" surface instead of plain white void. */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{
            backgroundImage: 'radial-gradient(rgba(var(--accent-rgb),0.12) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            maskImage: 'radial-gradient(ellipse 70% 65% at 68% 50%, black 0%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 68% 50%, black 0%, transparent 75%)',
          }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
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
  const { lang } = useLanguage();
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
      <Navigation />

      <ScienceHero de={de} />

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
