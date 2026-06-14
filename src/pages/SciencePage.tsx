import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { InstrumentFrame, SegmentedToggle, AnimatedNumber, CountUp, Chain } from '@/components/viz';
import { waxVsOil, frictionRanges } from '@/lib/data';

const W = 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';

// ─── The 6-component story — editorial science content ───────────────────────
interface Comp {
  id: string;
  nameDe: string; nameEn: string;
  roleDe: string; roleEn: string;
  metric: string;
  sumDe: string;  sumEn: string;
  detDe: string;  detEn: string;
}
const COMPONENTS: Comp[] = [
  {
    id: 'kristallstruktur',
    nameDe: 'Paraffin', nameEn: 'Paraffin',
    roleDe: 'Trägermatrix', roleEn: 'Base scaffold', metric: '58–60 °C',
    sumDe: 'Vollraffiniertes Paraffin bildet den Grundfilm — kleine, dicht gepackte Kristalle bedecken mehr Metall und lassen weniger Wasser durch.',
    sumEn: 'Fully refined paraffin forms the base film — small, densely packed crystals cover more metal and let less water through.',
    detDe: 'Grobkristallines Standard-Wachs lässt messbare Lücken, durch die Wasser die Stahloberfläche erreicht. Ein eng schmelzendes Paraffin (58–60 °C) kristallisiert feiner und dichter — der Film schließt besser ab und schützt vor Oxidation.',
    detEn: 'Coarse standard wax leaves measurable gaps where water reaches the steel. A tight-melting paraffin (58–60 °C) crystallises finer and denser — the film seals better and protects against oxidation.',
  },
  {
    id: 'matrix',
    nameDe: 'Fischer-Tropsch-Wachs', nameEn: 'Fischer–Tropsch wax',
    roleDe: 'Härtemodul', roleEn: 'Hardener', metric: '+75 °C',
    sumDe: 'Synthetisches Hartwachs hebt den Tropfpunkt auf ~75 °C — die Matrix hält Position unter Last statt wegzuwandern.',
    sumEn: 'Synthetic hard wax raises the drop point to ~75 °C — the matrix holds position under load instead of migrating.',
    detDe: 'An Kontaktpunkten entstehen unter Last 45–55 °C. Weiches Wachs erreicht hier seine Grenze, migriert vom Gelenk weg und dünnt aus. Das härtere FT-Wachs (Tropfpunkt ~75 °C) bleibt an Ort und Stelle: weniger Migration, längere Intervalle.',
    detEn: 'Contact points reach 45–55 °C under load. Soft wax hits its limit here, migrating away from the joint and thinning out. The harder FT wax (drop point ~75 °C) stays put: less migration, longer intervals.',
  },
  {
    id: 'winterformel',
    nameDe: 'Mikrokristallines Wachs', nameEn: 'Microcrystalline wax',
    roleDe: 'Plastifizierer', roleEn: 'Plastifier', metric: '−10 °C',
    sumDe: 'Hält die Matrix bei Frost elastisch bis −10 °C — kein Verspröden, kein Abplatzen an den Gelenken.',
    sumEn: 'Keeps the matrix elastic in frost down to −10 °C — no embrittlement, no flaking at the joints.',
    detDe: 'Standard-Wachse werden unter ~5 °C spröde und brechen bei Biegung auf. Die amorphe, mikrokristalline Komponente bleibt elastisch und verhindert, dass der Film an den Kettengelenken abplatzt — entscheidend für Winter- und E-Bike-Betrieb.',
    detEn: 'Standard waxes turn brittle below ~5 °C and fracture under flex. The amorphous microcrystalline component stays elastic and stops the film flaking off the chain joints — decisive for winter and e-bike use.',
  },
  {
    id: 'mos2',
    nameDe: 'Molybdändisulfid (MoS₂)', nameEn: 'Molybdenum disulfide (MoS₂)',
    roleDe: 'Festschmierstoff', roleEn: 'Solid lubricant', metric: 'μ 0,03',
    sumDe: 'Lamellare MoS₂-Partikel (< 5 µm) gleiten wie Spielkarten aufeinander und bilden einen Transferfilm auf dem Stahl — Reibung bis μ 0,03.',
    sumEn: 'Lamellar MoS₂ particles (< 5 µm) glide like playing cards and form a transfer film on the steel — friction down to μ 0.03.',
    detDe: 'MoS₂ besteht aus S–Mo–S-Schichten mit schwacher Bindung dazwischen. Unter Druck scheren die Schichten ab und legen sich als 2–5 nm dünner Transferfilm auf die Metalloberfläche (50–300 MPa an den Gelenken). Das senkt die Grenzreibung deutlich unter die von Öl.',
    detEn: 'MoS₂ is built from S–Mo–S layers weakly bound between sheets. Under pressure the layers shear and lay down as a 2–5 nm transfer film on the metal (50–300 MPa at the joints). This drops boundary friction well below oil.',
  },
  {
    id: 'sedimentation',
    nameDe: 'Dispergiersystem', nameEn: 'Dispersant system',
    roleDe: 'Stabilisator', roleEn: 'Stabiliser', metric: '5,6×',
    sumDe: 'MoS₂ ist 5,6× dichter als Wachs und würde absinken. Ein amphiphiler Ester hält die Partikel gleichmäßig in der Schmelze verteilt — Block für Block.',
    sumEn: 'MoS₂ is 5.6× denser than wax and would sink. An amphiphilic ester keeps the particles evenly suspended in the melt — block after block.',
    detDe: 'Dichte: MoS₂ 5,06 g/cm³ vs. Paraffin 0,9 g/cm³. Ohne Stabilisator sedimentieren die Partikel — der erste Block wäre arm, der letzte überladen. Der Dispersant umhüllt jedes Partikel und sorgt für gleichmäßige Qualität in jeder Kleinstcharge.',
    detEn: 'Density: MoS₂ 5.06 g/cm³ vs. paraffin 0.9 g/cm³. Without a stabiliser the particles settle — the first block would be lean, the last overloaded. The dispersant coats each particle for consistent quality in every small batch.',
  },
  {
    id: 'antioxidans',
    nameDe: 'Phenolisches Antioxidans', nameEn: 'Phenolic antioxidant',
    roleDe: 'Schutz', roleEn: 'Protection', metric: '12 Mo.',
    sumDe: 'Fängt Radikale ab und schützt das MoS₂ vor Umwandlung zu abrasivem MoO₃ — 12 Monate stabile Lagerung.',
    sumEn: 'Scavenges radicals and protects the MoS₂ from converting to abrasive MoO₃ — 12 months of stable shelf life.',
    detDe: 'Sauerstoff oxidiert MoS₂ langsam zu MoO₃ — einem harten, abrasiven Produkt, das genau das Gegenteil von Schmierung bewirkt. Das gehinderte phenolische Antioxidans unterbricht die Radikalkette und hält die Formel über die gesamte Haltbarkeit wirksam.',
    detEn: 'Oxygen slowly converts MoS₂ to MoO₃ — a hard, abrasive product that does the opposite of lubrication. The hindered phenolic antioxidant breaks the radical chain and keeps the formula effective across its full shelf life.',
  },
];

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

// ─── ACT I — Problem hero with Wax⇄Oil toggle ────────────────────────────────
function ProblemHero({ de }: { de: boolean }) {
  const [state, setState] = useState<'wax' | 'oil'>('oil');
  const wax = state === 'wax';
  const friction = waxVsOil.friction[state];
  const [wLo, wHi] = waxVsOil.watts[state];
  const life = waxVsOil.life[state];
  const valColor = { color: wax ? 'var(--accent)' : 'var(--txm)', transition: 'color 300ms ease' };
  const valCls = 'num-data font-semibold text-[19px] leading-none tabular-nums';

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
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div className="order-2 lg:order-1">
            <Chain state={state} className="max-w-[460px] mx-auto" />
            <p className="text-center text-[13px] mt-5 transition-colors duration-300"
              style={{ color: wax ? 'var(--accent)' : 'var(--txm)' }}>
              {wax
                ? (de ? 'Trockener Wachsfilm — nichts haftet an.' : 'Dry wax film — nothing sticks.')
                : (de ? 'Öl bindet Schmutz zur Schleifpaste.' : 'Oil binds dirt into grinding paste.')}
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <SegmentedToggle
              ariaLabel={de ? 'Öl oder Wachs' : 'Oil or wax'}
              value={state} onChange={setState} className="w-full mb-5"
              options={[
                { value: 'wax', label: de ? 'Wachs' : 'Wax' },
                { value: 'oil', label: de ? 'Öl' : 'Oil' },
              ]}
            />
            <dl>
              {[
                { k: de ? 'Reibung' : 'Friction', node: <AnimatedNumber value={friction} decimals={2} prefix="μ " className={valCls} style={valColor} /> },
                { k: de ? 'Antriebsverlust' : 'Drivetrain loss', node: <span className={valCls} style={valColor}><AnimatedNumber value={wLo} />–<AnimatedNumber value={wHi} suffix=" W" /></span> },
                { k: de ? 'Kettenlaufzeit' : 'Chain life', node: <AnimatedNumber value={life} suffix="×" className={valCls} style={valColor} /> },
                { k: de ? 'Sauberkeit' : 'Cleanliness', node: <span className="text-[13px] font-medium" style={valColor}>{wax ? (de ? 'Trocken & sauber' : 'Dry & clean') : (de ? 'Bindet Schmutz' : 'Binds dirt')}</span> },
              ].map((r, i) => (
                <div key={r.k} className="flex items-center justify-between py-3"
                  style={i > 0 ? { borderTop: '1px solid var(--bd2)' } : undefined}>
                  <dt className="text-[13px] text-wx-txm">{r.k}</dt>
                  <dd>{r.node}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </InstrumentFrame>
    </section>
  );
}

// ─── ACT II — one component, one instant-read row (expandable detail) ─────────
function CompRow({ c, n, de }: { c: Comp; n: number; de: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div id={c.id} className="scroll-mt-24 rounded-2xl border border-wx-bd p-5 sm:p-6"
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shad)' }}>
      <div className="flex items-start gap-4">
        <span className="num-data text-[13px] pt-1 flex-shrink-0" style={{ color: 'var(--txf)' }}>
          0{n}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h3 className="font-display font-bold text-wx-tx1 text-[1.25rem] leading-tight">
              {de ? c.nameDe : c.nameEn}
            </h3>
            <span className="num-data font-semibold text-[16px] flex-shrink-0" style={{ color: 'var(--accent-soft)' }}>
              {c.metric}
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.16em] mt-1" style={{ color: 'var(--txf)' }}>
            {de ? c.roleDe : c.roleEn}
          </p>
          <p className="text-[14px] leading-relaxed text-wx-tx2 mt-3">
            {de ? c.sumDe : c.sumEn}
          </p>

          <button onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium mt-3"
            style={{ color: 'var(--accent)' }}>
            {open ? (de ? 'Weniger' : 'Less') : (de ? 'Warum das zählt' : 'Why it matters')}
            <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300"
              style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
          </button>
          <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
            <div style={{ overflow: 'hidden' }}>
              <p className="text-[13px] leading-relaxed pt-3" style={{ color: 'var(--txm)' }}>
                {de ? c.detDe : c.detEn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ACT II — temperature operating window (Classic ⇄ Pro toggle) ────────────
const TEMP = { min: -15, max: 80 };
const TX = (t: number) => ((t - TEMP.min) / (TEMP.max - TEMP.min)) * 100;
function TempWindow({ de }: { de: boolean }) {
  const [f, setF] = useState<'classic' | 'pro'>('pro');
  const win = f === 'pro' ? { lo: -8, hi: 35 } : { lo: 2, hi: 35 };
  const ticks = [-10, 0, 20, 40, 60, 75];

  return (
    <InstrumentFrame eyebrow={de ? 'Einsatzfenster' : 'Operating window'}
      chip={f === 'pro' ? '−8 … +75 °C' : '+2 … +70 °C'}>
      <SegmentedToggle ariaLabel={de ? 'Formel' : 'Formula'} value={f} onChange={setF}
        className="max-w-xs mb-6"
        options={[{ value: 'classic', label: 'Classic' }, { value: 'pro', label: 'Pro' }]} />

      <div className="relative h-16">
        {/* axis */}
        <div className="absolute left-0 right-0 top-7 h-px" style={{ background: 'var(--bd)' }} />
        {ticks.map(t => (
          <div key={t} className="absolute top-7 -translate-x-1/2 text-center" style={{ left: `${TX(t)}%` }}>
            <div className="w-px h-2 mx-auto" style={{ background: 'var(--bd)' }} />
            <span className="num-data text-[10px]" style={{ color: 'var(--txf)' }}>{t}°</span>
          </div>
        ))}
        {/* operating band */}
        <div className="absolute top-[18px] h-3 rounded-full"
          style={{
            left: `${TX(win.lo)}%`, width: `${TX(win.hi) - TX(win.lo)}%`,
            background: 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))',
            transition: 'left 360ms cubic-bezier(0.22,1,0.36,1), width 360ms cubic-bezier(0.22,1,0.36,1)',
          }} />
        {/* drop point marker */}
        <div className="absolute top-3 -translate-x-1/2" style={{ left: `${TX(75)}%` }}>
          <div className="w-px h-5" style={{ background: 'var(--accent)' }} />
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-wx-tx2 mt-4">
        {f === 'pro'
          ? (de ? 'Pro öffnet das Fenster nach unten: elastisch bis −8 °C für Winter & E-Bike, thermisch stabil bis +75 °C.'
                : 'Pro opens the window downward: elastic to −8 °C for winter & e-bike, thermally stable to +75 °C.')
          : (de ? 'Classic ist auf trockene, mildere Bedingungen optimiert — ideal von Frühjahr bis Herbst.'
                : 'Classic is tuned for dry, milder conditions — ideal from spring to autumn.')}
      </p>
    </InstrumentFrame>
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
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
            <div className="h-full rounded-full"
              style={{
                width: run ? `${r.pct}%` : '0%',
                background: r.highlight
                  ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                  : 'var(--bd2)',
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

export function SciencePage() {
  const { lang, toggleLang } = useLanguage();
  const de = lang === 'de';
  const { hash } = useLocation();

  // Honour deep-links from the landing page (#kristallstruktur, #reibung, …).
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [hash]);

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

      {/* ── ACT II — FORMULA ── */}
      <section className={`${W} py-20`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <ActHead
          eyebrow={de ? 'Die Formel' : 'The Formula'}
          title={de ? 'Sechs Komponenten, ein System.' : 'Six components, one system.'}
          lede={de
            ? 'Jede Zutat löst ein konkretes Versagensszenario. Zusammen ergeben sie einen Film, der sauber bleibt, unter Last hält und im Winter nicht bricht.'
            : 'Each ingredient solves a specific failure mode. Together they make a film that stays clean, holds under load, and doesn’t crack in winter.'}
        />
        <div className="space-y-4">
          {COMPONENTS.map((c, i) => <CompRow key={c.id} c={c} n={i + 1} de={de} />)}
        </div>

        <div id="matrix-window" className="mt-12">
          <TempWindow de={de} />
        </div>
      </section>

      {/* ── ACT III — PROOF ── */}
      <section className={`${W} py-20`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <ActHead
          eyebrow={de ? 'Der Beweis' : 'The Proof'}
          title={de ? 'Gemessen, nicht behauptet.' : 'Measured, not claimed.'}
        />

        <InstrumentFrame eyebrow={de ? 'Reibung' : 'Friction'} className="mb-6">
          <FrictionBars de={de} />
        </InstrumentFrame>

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
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }} />
              <p className="text-[13px] text-wx-txm mt-2">{s.d}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h3 className="font-display font-bold text-wx-tx1 mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {de ? 'Bereit für einen sauberen Antrieb?' : 'Ready for a clean drivetrain?'}
          </h3>
          <Link to="/#produkte" className="btn-primary inline-flex">
            {de ? 'Formel wählen' : 'Choose your formula'}
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
