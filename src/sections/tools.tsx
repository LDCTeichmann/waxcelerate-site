import { useState, useEffect, useRef, useMemo } from 'react';
import { Calculator, Package, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { waxIntervals } from '@/lib/data';
import { gsap } from '@/lib/gsap';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { AnimatedNumber } from '@/components/viz';
import { Section } from '@/components/Section';


// ─── Toggle button — blue accent active state ────────────────────────────────
function TogButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[13px] transition-all cursor-pointer${active ? ' chip-active' : ''}`}
      style={{
        border: active ? undefined : '1px solid var(--tog-bd)',
        background: active ? undefined : 'var(--tog-bg)',
        color: active ? 'var(--tx1)' : 'var(--tog-fg)',
        fontWeight: active ? 500 : 400,
        boxShadow: 'none',
      }}
    >
      {children}
    </button>
  );
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────
// No backdrop-filter here: var(--card-bg) is a fully opaque gradient (see
// index.css), so blurring whatever sits behind an opaque card is invisible —
// pure wasted compositing work (and, with 5 of these cards on the page, a
// likely source of the scroll/render jank reported around this section).
function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-3xl"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--bd)',
        boxShadow: 'var(--card-shad)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Tool header ─────────────────────────────────────────────────────────────
function ToolHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-6 pb-5">
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
            border: '1px solid rgba(var(--accent-rgb),0.30)',
          }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>
            {title}
          </h3>
          <p className="text-[12px] leading-snug mt-0.5" style={{ color: 'var(--txf)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: 'var(--inset-bd)' }} />
    </div>
  );
}

// ─── Field label ─────────────────────────────────────────────────────────────
function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2.5">
      <span
        className="text-[11px] uppercase tracking-[0.1em] font-medium"
        style={{ color: 'var(--txf)' }}
      >
        {label}
      </span>
      {value && (
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--tx2)' }}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Result inset box ────────────────────────────────────────────────────────
function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--inset-bg)',
        border: '1px solid var(--inset-bd)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Step reveal wrapper — dims inactive inputs ───────────────────────────────
function StepSection({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        opacity: active ? 1 : 0.2,
        transform: active ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}

// ─── Shared CTA button — consistent across all tools ────────────────────────
function ToolCTA({ onClick, href, children }: {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    background: 'var(--inset-bg)',
    border: '1px solid var(--brand)',
  };
  const className = "w-full rounded-xl py-2.5 px-4 text-center transition-opacity hover:opacity-70 active:opacity-50 cursor-pointer";
  const inner = (
    <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
      {children}
    </span>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`block ${className}`} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={className} style={style}>
      {inner}
    </button>
  );
}

// ─── Tool 1: Rewax Interval Calculator ───────────────────────────────────────
function RewaxCalculator() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [weather, setWeather] = useState<'trocken' | 'gemischt' | 'nass'>('trocken');
  const [terrain, setTerrain] = useState<'strasse' | 'gravel' | 'mtb'>('strasse');
  const [kmPerWeek, setKmPerWeek] = useState(100);

  const MAX_REWAX_WEEKS = 26;
  const interval = waxIntervals[weather][terrain];
  const rawWeeks = kmPerWeek > 0 ? Math.round(interval / kmPerWeek) : MAX_REWAX_WEEKS;
  const weeks = Math.min(rawWeeks, MAX_REWAX_WEEKS);
  const weeksCapped = rawWeeks > MAX_REWAX_WEEKS;

  const weatherOpts: { value: 'trocken' | 'gemischt' | 'nass'; label: string }[] = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];
  const terrainOpts: { value: 'strasse' | 'gravel' | 'mtb'; label: string }[] = [
    { value: 'strasse', label: t.tools.rewax.road },
    { value: 'gravel', label: t.tools.rewax.gravel },
    { value: 'mtb', label: t.tools.rewax.mtb },
  ];

  const goToWax = () => {
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'wax' }));
  };

  const rewaxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weeks * 7);
    return d.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long' });
  }, [weeks, de]);

  const SEP = <div style={{ borderTop: '1px solid var(--inset-bd)' }} />;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.rewax.title}
        subtitle={de
          ? 'Nie wieder zu früh oder zu spät — erhalte dein genaues Rewax-Intervall.'
          : 'Never too early or too late — get your exact rewax interval.'}
      />
      <div className="flex flex-col flex-1">

        {/* Hero result — always visible, updates live as parameters change below */}
        <div className="px-6 pt-5 pb-5 text-center flex flex-col items-center">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-[56px] font-bold leading-none tabular-nums" style={{ color: 'var(--tx1)' }}>
              <AnimatedNumber value={weeks} />
            </span>
            <span className="text-[22px] font-semibold leading-none" style={{ color: 'var(--tx2)' }}>
              {weeks === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks')}
              {weeksCapped && <span className="text-[14px]" style={{ color: 'var(--txm)' }}> max.</span>}
            </span>
          </div>
          <p className="text-[12px] mb-3" style={{ color: 'var(--txf)' }}>
            {de ? 'bis zum nächsten Rewaxen' : 'until next rewax'}
          </p>
          {/* Compact meta: date · range per wax */}
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-medium" style={{ color: 'var(--txm)' }}>
              {de ? `ca. ${rewaxDate}` : `~${rewaxDate}`}
            </span>
            <span style={{ color: 'var(--bd2)' }}>·</span>
            <span className="text-[12px] tabular-nums" style={{ color: 'var(--txff)' }}>
              <AnimatedNumber value={interval} suffix=" km" />
            </span>
          </div>
        </div>

        {SEP}

        {/* Parameters — evenly distributed vertically to fill the card height */}
        <div className="px-6 pt-4 pb-4 flex flex-col flex-1 justify-evenly">
          <div>
            <FieldLabel label={t.tools.rewax.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <TogButton key={o.value} active={weather === o.value} onClick={() => setWeather(o.value)}>
                  {o.label}
                </TogButton>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel label={t.tools.rewax.terrain} />
            <div className="flex flex-wrap gap-2">
              {terrainOpts.map(o => (
                <TogButton key={o.value} active={terrain === o.value} onClick={() => setTerrain(o.value)}>
                  {o.label}
                </TogButton>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel label={t.tools.rewax.kmPerWeek} value={`${kmPerWeek} km`} />
            <Slider
              value={[kmPerWeek]}
              onValueChange={v => setKmPerWeek(v[0])}
              min={20} max={400} step={10}
              className="py-1"
            />
          </div>
        </div>

        {/* CTA — prompt to buy wax after seeing the interval */}
        <div className="px-6 pb-5 pt-2">
          <ToolCTA onClick={goToWax}>
            {de ? 'Wachs kaufen →' : 'Buy wax →'}
          </ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}

// ─── Tool 2: Wax Stock Calculator ────────────────────────────────────────────
function fmtDuration(months: number, de: boolean): string {
  if (months > 24) return de ? `~${Math.round(months / 12)} Jahre` : `~${Math.round(months / 12)} yrs`;
  return de ? `~${months} Monate` : `~${months} months`;
}

function WaxStockCalculator() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  type FreqKey = 'frequent' | 'regular' | 'occasional' | 'rare';
  // Default to 'regular' so a meaningful recommendation shows immediately on load.
  const [freq, setFreq] = useState<FreqKey>('regular');

  const freqOpts: { value: FreqKey; label: string; hint: string; km: string; rewaxPerMonth: number }[] = [
    { value: 'frequent',   label: de ? 'Alle 2–3 Wochen' : 'Every 2–3 weeks',  hint: de ? 'Vielfahrer · Rennsport' : 'Heavy rider · Racing',  km: de ? '~150 km/Wo.' : '~150 km/wk',  rewaxPerMonth: 1.67 },
    { value: 'regular',    label: de ? 'Einmal im Monat'  : 'Once a month',     hint: de ? 'Wochenend­fahrer'       : 'Weekend rider',         km: de ? '~100 km/Wo.' : '~100 km/wk',  rewaxPerMonth: 1 },
    { value: 'occasional', label: de ? 'Alle 2–3 Monate'  : 'Every 2–3 months', hint: de ? 'Gelegenheits­fahrer'   : 'Occasional rider',      km: de ? '~40 km/Wo.'  : '~40 km/wk',   rewaxPerMonth: 0.4 },
    { value: 'rare',       label: de ? 'Noch seltener'    : 'Less often',       hint: de ? 'Selten unterwegs'      : 'Infrequent rider',      km: de ? '< 20 km/Wo.' : '< 20 km/wk',  rewaxPerMonth: 0.18 },
  ];

  const WAX_PER_REWAX = 20; // grams per wax session (300g ÷ 20 = 15 sessions, aligns with "20–25 apps/300g")
  const SHELF_LIFE_MONTHS = 30;

  const selected = freqOpts.find(f => f.value === freq);
  const waxPerMonth = selected ? selected.rewaxPerMonth * WAX_PER_REWAX : 0;
  const hasResult = selected !== undefined;

  const months300 = hasResult && waxPerMonth > 0 ? Math.max(1, Math.round(300 / waxPerMonth)) : 0;
  const months500 = hasResult && waxPerMonth > 0 ? Math.max(1, Math.round(500 / waxPerMonth)) : 0;

  // Recommend 300g only when 300g already outlasts shelf life
  const rec: '300' | '500' = months300 > SHELF_LIFE_MONTHS ? '300' : '500';

  const recMonths  = rec === '500' ? months500 : months300;
  const altMonths  = rec === '500' ? months300 : months500;
  const recPrice   = rec === '500' ? (de ? '29,95' : '29.95') : (de ? '22,95' : '22.95');
  const altPrice   = rec === '500' ? (de ? '22,95' : '22.95') : (de ? '29,95' : '29.95');
  const altSize    = rec === '500' ? '300' : '500';
  const recUrl     = rec === '500' ? 'https://www.ebay.de/itm/395811184583' : 'https://www.ebay.de/itm/395811183957';
  const altUrl     = altSize === '500' ? 'https://www.ebay.de/itm/395811184583' : 'https://www.ebay.de/itm/395811183957';

  // Concrete reason based on actual session count
  const rewaxPerYear = hasResult ? Math.round(selected!.rewaxPerMonth * 12) : 0;
  const recReason = !hasResult ? '' : rec === '500'
    ? (de
      ? `Du wachst ~${rewaxPerYear}× im Jahr — 500g ist günstiger pro Anwendung.`
      : `You wax ~${rewaxPerYear}× per year — 500g is cheaper per session.`)
    : (de
      ? `Bei ~${rewaxPerYear}× im Jahr reicht 300g über die gesamte Saison.`
      : `At ~${rewaxPerYear}× per year, 300g lasts the whole season.`);

  return (
    <ToolCard>
      <ToolHeader
        icon={<Package className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={de ? 'Wie viel Wachs brauche ich?' : 'How much wax do I need?'}
        subtitle={de
          ? 'Bestell genau das richtige Paket — keine Verschwendung, kein Engpass.'
          : 'Order exactly the right amount — no waste, no shortfall.'}
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        {/* Single question: rewax frequency */}
        <div className="flex-1">
          <FieldLabel label={de ? 'Wie oft rewaxst du?' : 'How often do you re-wax?'} />
          <div className="grid grid-cols-2 gap-2">
            {freqOpts.map(o => (
              <button
                key={o.value}
                onClick={() => setFreq(o.value)}
                className={`rounded-xl px-3 py-3 text-left transition-all cursor-pointer${freq === o.value ? ' chip-active' : ''}`}
                style={{
                  border: freq === o.value ? undefined : '1px solid var(--tog-bd)',
                  background: freq === o.value ? undefined : 'var(--tog-bg)',
                }}
              >
                <p className="text-[13px] font-medium leading-snug" style={{ color: freq === o.value ? 'var(--tx1)' : 'var(--tog-fg)' }}>
                  {o.label}
                </p>
                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: freq === o.value ? 'var(--tx2)' : 'var(--txff)' }}>
                  {o.hint}
                </p>
                <p className="text-[11px] mt-0.5 tabular-nums" style={{ color: freq === o.value ? 'var(--txm)' : 'var(--txff)' }}>
                  {o.km}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Result — fades in after selection */}
        <StepSection active={hasResult}>
          <ResultBox>
            {/* Primary recommendation — links to eBay */}
            <a href={recUrl} target="_blank" rel="noopener noreferrer" className="block group">
              <div
                className="rounded-xl p-4 transition-opacity group-hover:opacity-80"
                style={{
                  background: 'var(--sf)',
                  border: '1px solid var(--brand)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--brand)' }}>
                    {de ? 'Empfohlen' : 'Recommended'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[12px]" style={{ color: 'var(--txf)' }}>
                      {rec}g — {recPrice} €
                    </p>
                    <span className="text-[11px]" style={{ color: 'var(--brand)' }}>eBay →</span>
                  </div>
                </div>
                <p className="text-[42px] font-bold leading-none mb-2" style={{ color: 'var(--tx1)' }}>
                  {fmtDuration(recMonths, de)}
                </p>
                <p className="text-[11px] leading-snug" style={{ color: 'var(--txf)' }}>
                  {recReason}
                </p>
              </div>
            </a>

            {/* Alt option — secondary button style */}
            <a href={altUrl} target="_blank" rel="noopener noreferrer" className="block mt-3 group">
              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between transition-opacity group-hover:opacity-70"
                style={{
                  background: 'var(--tog-bg)',
                  border: '1px solid var(--tog-bd)',
                }}
              >
                <p className="text-[12px]" style={{ color: 'var(--txff)' }}>
                  {altSize}g — {altPrice} €
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[12px] tabular-nums" style={{ color: 'var(--txff)' }}>
                    {fmtDuration(altMonths, de)}
                  </p>
                  <span className="text-[11px]" style={{ color: 'var(--txff)' }}>eBay →</span>
                </div>
              </div>
            </a>
          </ResultBox>
        </StepSection>
      </div>
    </ToolCard>
  );
}

// ─── Tool 3: Rotation & Savings (merged) ─────────────────────────────────────
function RotationAndSavings() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [kmPerYear, setKmPerYear] = useState(5000);

  // Financial constants — Shimano M8100 12s reference
  const REWAX_KM        = 300;
  const CHAIN_PRICE     = 45;
  const CASSETTE_PRICE  = 85.70;
  const WAX_BLOCK_PRICE = 35;
  const APPS_PER_BLOCK  = 33;
  const OIL_CHAIN_KM    = 4000;
  const OIL_CASSETTE_KM = 15000;
  const OIL_PRICE_PER_APP     = 1.10;
  const OIL_APP_INTERVAL_KM   = 1000;
  const CASSETTE_KM: number[] = [30000, 40000, 48000]; // per chain count 1/2/3
  const CHAIN_KM:    number[] = [6000,  8500,  10500];

  type ChainOption = {
    n: number;
    sessionsPerYear: number;
    annualCost: number;
    annualSavings: number;
    savingsPct: number;
    cassetteSavingsVsOil: number;
    sessionsSavedPct: number;
    dateStr: string;
  };

  type CalcResult = {
    oilAnnual: number;
    chains: ChainOption[];
  };

  const data: CalcResult = useMemo(() => {
    const today = new Date();
    const kmPerWeek = kmPerYear / 52;
    const WAX_LUBE_PER_KM = WAX_BLOCK_PRICE / (APPS_PER_BLOCK * REWAX_KM);
    const OIL_LUBE_PER_KM = OIL_PRICE_PER_APP / OIL_APP_INTERVAL_KM;
    const oilCassettePerKm = CASSETTE_PRICE / OIL_CASSETTE_KM;
    const oilCostPerKm = CHAIN_PRICE / OIL_CHAIN_KM + oilCassettePerKm + OIL_LUBE_PER_KM;
    const oilAnnual = Math.round(kmPerYear * oilCostPerKm);

    const singleChainSessionsPerYear = Math.ceil(kmPerYear / REWAX_KM);

    const chains: ChainOption[] = [1, 2, 3].map(n => {
      const weeksRaw = (n * REWAX_KM) / kmPerWeek;
      const sessionsPerYear = Math.ceil(kmPerYear / (n * REWAX_KM));
      const waxCassettePerKm = CASSETTE_PRICE / CASSETTE_KM[n - 1];
      const costPerKm = CHAIN_PRICE / CHAIN_KM[n - 1] + waxCassettePerKm + WAX_LUBE_PER_KM;
      const annualCost = Math.round(kmPerYear * costPerKm);
      const annualSavings = Math.max(0, oilAnnual - annualCost);
      const savingsPct = oilAnnual > 0 ? Math.round((annualSavings / oilAnnual) * 100) : 0;
      const cassetteSavingsVsOil = Math.max(0, Math.round(kmPerYear * (oilCassettePerKm - waxCassettePerKm)));
      const sessionsSavedPct = n > 1 ? Math.round((1 - sessionsPerYear / singleChainSessionsPerYear) * 100) : 0;
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + Math.round(weeksRaw * 7));
      const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric', month: 'short',
        ...(nextDate.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
      };
      const dateStr = nextDate.toLocaleDateString(de ? 'de-DE' : 'en-GB', opts);
      return { n, sessionsPerYear, annualCost, annualSavings, savingsPct, cassetteSavingsVsOil, sessionsSavedPct, dateStr };
    });

    return { oilAnnual, chains };
  }, [kmPerYear, de]); // eslint-disable-line

  // Dynamic recommendation — adapts to actual km/year
  const rec = kmPerYear < 2500 ? 1 : kmPerYear >= 8000 ? 3 : 2;
  const recData = data.chains[rec - 1];
  const discountPct = rec === 2 ? 5 : rec === 3 ? 10 : 0;

  const goToChains = () => {
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'chain' }));
  };

  const SEP = <div style={{ borderTop: '1px solid var(--inset-bd)' }} />;

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={de ? 'Rotation & Ersparnis' : 'Rotation & Savings'}
        subtitle={de
          ? 'Ketten im Wechsel: seltener waxen, Kassette schonen, Geld sparen.'
          : 'Rotate chains: wax less often, protect the cassette, save money.'}
      />
      <div className="flex flex-col flex-1">

        {/* Hero — savings + recommendation + oil baseline context in one block */}
        <div className="px-6 pt-5 pb-5 text-center flex flex-col items-center">
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <AnimatedNumber
              value={recData.annualSavings}
              prefix="~€"
              className="num text-[56px] font-bold leading-none"
              style={{ color: 'var(--tx1)' }}
            />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--brand)' }}>
                {de ? 'gespart' : 'saved'}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--txf)' }}>
                {de ? '/Jahr' : '/year'}
              </span>
            </div>
          </div>
          {/* Single subtitle line: recommendation + oil baseline */}
          <p className="text-[12px]" style={{ color: 'var(--txf)' }}>
            {de
              ? `mit ${rec} ${rec === 1 ? 'Kette' : 'Ketten'} · vs. Kettenöl (~€${data.oilAnnual}/Jahr)`
              : `with ${rec} ${rec === 1 ? 'chain' : 'chains'} · vs. chain oil (~€${data.oilAnnual}/yr)`}
          </p>
        </div>

        {SEP}

        {/* Slider — adjust km/year to tune results */}
        <div className="px-6 pt-4 pb-3">
          <FieldLabel
            label={de ? 'km pro Jahr' : 'km per year'}
            value={`${kmPerYear.toLocaleString(de ? 'de-DE' : 'en-US')} km`}
          />
          <Slider
            value={[kmPerYear]}
            onValueChange={v => setKmPerYear(v[0])}
            min={1000} max={10000} step={500}
            className="py-1"
          />
        </div>

        {SEP}

        {/* 3 comparison cards — the single source of truth */}
        <div className="px-4 py-4 flex-1">
          <div className="grid grid-cols-3 gap-2 h-full">
            {data.chains.map(({ n, sessionsPerYear, annualSavings, savingsPct, sessionsSavedPct, dateStr }) => {
              const isRec = n === rec;
              const cardDiscountPct = n === 2 ? 5 : n === 3 ? 10 : 0;
              return (
                <div
                  key={n}
                  className="rounded-2xl flex flex-col"
                  style={{
                    background: isRec ? 'rgba(var(--accent-rgb),0.08)' : 'var(--sf)',
                    border: isRec ? '1.5px solid var(--brand)' : '1px solid var(--bd2)',
                    padding: '12px 10px',
                  }}
                >
                  {/* Top: label row */}
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className="text-[11px] font-semibold leading-none"
                      style={{ color: isRec ? 'var(--brand)' : 'var(--tx2)' }}
                    >
                      {n} {de ? (n === 1 ? 'Kette' : 'Ketten') : (n === 1 ? 'chain' : 'chains')}
                    </p>
                    {cardDiscountPct > 0 && (
                      <span
                        className="rounded px-1 py-0.5 text-[8px] font-semibold leading-none"
                        style={{ background: 'var(--accent-wash)', color: 'var(--brand)' }}
                      >
                        −{cardDiscountPct}%
                      </span>
                    )}
                  </div>

                  {/* Savings — primary metric */}
                  <p
                    className="text-[22px] font-bold tabular-nums leading-none"
                    style={{ color: isRec ? 'var(--brand)' : annualSavings > 0 ? 'var(--tx2)' : 'var(--txff)' }}
                  >
                    {annualSavings > 0 ? `~€${annualSavings}` : '—'}
                  </p>
                  <p className="text-[9px] mt-0.5 mb-3" style={{ color: 'var(--txff)' }}>
                    {savingsPct > 0
                      ? (de ? `/Jahr · −${savingsPct}%` : `/yr · −${savingsPct}%`)
                      : (de ? '/Jahr vs. Öl' : '/yr vs. oil')}
                  </p>

                  {/* Sessions */}
                  <div className="flex items-baseline gap-1 mb-0.5">
                    <p className="text-[16px] font-bold tabular-nums leading-none" style={{ color: 'var(--txm)' }}>
                      {sessionsPerYear}×
                    </p>
                    {sessionsSavedPct > 0 && (
                      <p className="text-[9px] font-semibold" style={{ color: 'var(--brand)' }}>−{sessionsSavedPct}%</p>
                    )}
                  </div>
                  <p className="text-[9px]" style={{ color: 'var(--txff)' }}>
                    {de ? 'Waxen/Jahr' : 'wax/yr'}
                  </p>

                  {/* Next wax date — always at bottom */}
                  <div className="mt-auto pt-3">
                    <p className="text-[9px]" style={{ color: 'var(--txff)' }}>
                      {de ? 'Nächstes Waxen' : 'Next wax'}
                    </p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: isRec ? 'var(--brand)' : 'var(--txm)' }}>
                      {dateStr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-5 pt-2">
          <ToolCTA onClick={goToChains}>
            {de
              ? rec === 1
                ? 'Einzelkette ansehen →'
                : `${rec}-Ketten-Kit ansehen · ${discountPct}% Rabatt →`
              : rec === 1
                ? 'View single chain →'
                : `View ${rec}-chain kit · ${discountPct}% off →`}
          </ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}

// ─── Desktop deck ─────────────────────────────────────────────────────────────
// The 3D deck, without the flaw that had it replaced by a flat grid: the old
// version parked its side cards at 0.85 scale and 0.58 opacity, 560px
// off-centre, so on a 1440px screen two of the three calculators were
// unreadable ghosts clipped by the section edge — most visitors only ever saw
// one of them. Here the side cards stay legible (0.88 / 0.9) and sit close
// enough to read, and they ARE the control: clicking one brings it forward.
// Labelled tabs and arrows below make all three reachable without anyone
// having to discover that the cards are clickable.
//
// Driven by CSS transitions over React state rather than a GSAP timeline:
// each card derives one transform string from its slot, so there is no
// timeline to fall out of sync, nothing to overwrite mid-flight, and an
// interrupted move re-targets from wherever it is. Three slots is the whole
// state space, so the table below is exhaustive — no modulo edge case at the
// wrap point.
//
// Geometry note: the card is centred by `left:50%` + `translate(-50%)`, so the
// extra `translateX(±58%)` offsets its centre by 58% of a card width. At 48%
// container width that keeps the outer edge of a side card inside the column
// at every lg+ breakpoint (checked at 1024 and 1440).
// Offsets are tuned so a side card's own CENTRE always lands outside the active
// card's edge (0.72w > 0.5w), which is what keeps its label readable instead of
// hidden behind the front card, while its outer edge still stays inside the
// column: 0.72w + 0.9w/2 = 1.17w ≤ half the container at 42% width. Checked at
// 1024 and 1440.
const DECK_POS = [
  { transform: 'translate(-50%) rotateY(0deg) scale(1)',                     zIndex: 30, opacity: 1    },
  { transform: 'translate(-50%) translateX(72%) rotateY(-18deg) scale(0.9)',  zIndex: 20, opacity: 0.96 },
  { transform: 'translate(-50%) translateX(-72%) rotateY(18deg) scale(0.9)',  zIndex: 20, opacity: 0.96 },
] as const;

// Tall enough for the tallest calculator at deck width so no card's content is
// clipped — they are absolutely positioned and therefore all share this height.
const DECK_HEIGHT = 620;

const DECK = [
  { key: 'rewax', Comp: RewaxCalculator, Icon: Calculator,
    coverDe: 'Wann muss ich rewaxen?',      coverEn: 'When do I re-wax?',
    hintDe: 'Dein Intervall in Wochen — nach Wetter, Gelände und Kilometern.',
    hintEn: 'Your interval in weeks — from weather, terrain and distance.' },
  { key: 'stock', Comp: WaxStockCalculator, Icon: Package,
    coverDe: 'Wie viel Wachs brauche ich?', coverEn: 'How much wax do I need?',
    hintDe: '300 g oder 500 g — welcher Block bei dir länger reicht.',
    hintEn: '300 g or 500 g — which block lasts you longer.' },
  { key: 'rotation', Comp: RotationAndSavings, Icon: RotateCcw,
    coverDe: 'Rotation & Ersparnis',        coverEn: 'Rotation & savings',
    hintDe: 'Was zwei oder drei Ketten im Wechsel pro Jahr sparen.',
    hintEn: 'What rotating two or three chains saves you per year.' },
] as const;

const DECK_LABELS_DE = ['Intervall', 'Vorrat', 'Rotation'];
const DECK_LABELS_EN = ['Interval', 'Stock', 'Rotation'];

function DeckSlot({ rel, label, cover, hint, Icon, onActivate, de, children }: {
  rel: number;
  label: string;
  cover: string;
  hint: string;
  Icon: typeof Calculator;
  onActivate: () => void;
  de: boolean;
  children: React.ReactNode;
}) {
  const pos = DECK_POS[rel] ?? DECK_POS[0];
  const active = rel === 0;
  return (
    <div className="deck-slot absolute inset-y-0 left-1/2 w-[42%]" style={pos}>
      {/* `inert` takes the whole inactive card out of tab order and off the
          a11y tree in one go — a background card must not be reachable by Tab
          or announced as if it were the one on screen. */}
      <div className="h-full" inert={!active}>{children}</div>

      {/* Cover for the two background cards. Three live calculators fanned out
          at once is visual noise — sliders, chips and numbers competing behind
          the one you're meant to be reading. The cover reduces each background
          card to the question it answers, and cross-fades out as that card
          rotates to the front, which is what reads as the card "flipping open".
          Kept mounted (rather than conditionally rendered) so that fade has
          something to animate in both directions. */}
      <button
        type="button"
        onClick={onActivate}
        aria-label={label}
        aria-hidden={active}
        tabIndex={active ? -1 : 0}
        className="deck-cover absolute inset-0 z-10 rounded-3xl flex flex-col items-center justify-center gap-4 px-8 text-center"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
          opacity: active ? 0 : 1,
          pointerEvents: active ? 'none' : 'auto',
        }}
      >
        <span
          className="w-12 h-12 rounded-2xl grid place-items-center"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
            border: '1px solid rgba(var(--accent-rgb),0.30)',
          }}
        >
          <Icon className="h-5 w-5" style={{ color: 'var(--txm)' }} />
        </span>
        <span className="text-[16px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>
          {cover}
        </span>
        <span className="text-[12.5px] leading-relaxed max-w-[26ch]" style={{ color: 'var(--txf)' }}>
          {hint}
        </span>
        <span className="text-[12px] font-medium mt-1" style={{ color: 'var(--brand)' }}>
          {de ? 'Rechner öffnen →' : 'Open calculator →'}
        </span>
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // Shared by the mobile tab bar and the desktop deck's tablist.
  const TAB_LABELS = useMemo(() => (de ? DECK_LABELS_DE : DECK_LABELS_EN), [de]);

  // ── Desktop deck state ────────────────────────────────────────────────────
  const [activeCard, setActiveCard] = useState(0);
  const deckTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving tabindex: only the selected tab is tabbable, so when the arrow keys
  // move the selection the focus has to travel with it — otherwise focus is
  // left sitting on a button that just became tabIndex -1 and the next Tab
  // press jumps somewhere unrelated.
  const moveDeck = (next: number) => {
    setActiveCard(next);
    deckTabRefs.current[next]?.focus();
  };

  // ── Mobile tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabPillRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number; isSlider: boolean }>({ x: 0, y: 0, isSlider: false });
  const [swipeHintShown, setSwipeHintShown] = useState(false);

  useEffect(() => {
    if (swipeHintShown) return;
    const t = setTimeout(() => setSwipeHintShown(true), 3000);
    return () => clearTimeout(t);
  }, [swipeHintShown]);

  const pillX = (btnRect: DOMRect, barRect: DOMRect) =>
    btnRect.left - barRect.left - 1;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const btn = tabButtonRefs.current[0];
      const bar = tabBarRef.current;
      const pill = tabPillRef.current;
      if (!btn || !bar || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: pillX(btnRect, barRect), width: btnRect.width });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const btn = tabButtonRefs.current[activeTab];
    const bar = tabBarRef.current;
    const pill = tabPillRef.current;
    if (!btn || !bar || !pill) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    gsap.to(pill, {
      x: pillX(btnRect, barRect),
      width: btnRect.width,
      duration: 0.35,
      ease: 'power3.inOut',
      overwrite: 'auto',
    });
  }, [activeTab, TAB_LABELS]);

  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() => {
      const btn = tabButtonRefs.current[activeTabRef.current];
      const pill = tabPillRef.current;
      if (!btn || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: pillX(btnRect, barRect), width: btnRect.width });
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return (
    <Section id="tools" style={{ background: 'var(--tool-bg)' }}>
          <div ref={headerRef} className="mb-16">
            <h2 className="section-title mb-4">
              <ScrollWordReveal text={t.tools.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2 max-w-xl text-[15px]">
              {t.tools.subtitle}
            </p>
          </div>

          {/* ── Mobile / tablet: swipeable tabs (up to lg) ── */}
          <div className="lg:hidden">
            <div
              ref={tabBarRef}
              role="tablist"
              className="relative flex p-1 rounded-2xl mb-5 overflow-x-auto"
              style={{ background: 'var(--tab-track-bg)', border: '1px solid var(--tab-track-bd)' }}
            >
              <div
                ref={tabPillRef}
                className="absolute top-1 bottom-1 rounded-xl pointer-events-none"
                style={{
                  width: 0,
                  background: 'var(--tab-pill-bg)',
                  border: '1px solid var(--tab-pill-bd)',
                  boxShadow: 'var(--tab-pill-shadow)',
                }}
              />
              {TAB_LABELS.map((label, i) => (
                <button
                  key={i}
                  ref={el => { tabButtonRefs.current[i] = el; }}
                  onClick={() => setActiveTab(i)}
                  role="tab"
                  aria-selected={activeTab === i}
                  className="relative z-10 flex-1 min-w-[60px] px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors whitespace-nowrap"
                  style={{
                    color: activeTab === i ? 'var(--tx1)' : 'var(--txf)',
                    letterSpacing: activeTab === i ? '-0.01em' : '0',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className="overflow-hidden"
              onTouchStart={e => {
                const target = e.target as HTMLElement;
                touchStart.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                  isSlider: !!target.closest('[role="slider"], [data-orientation]'),
                };
              }}
              onTouchEnd={e => {
                if (touchStart.current.isSlider) return;
                const dx = e.changedTouches[0].clientX - touchStart.current.x;
                const dy = e.changedTouches[0].clientY - touchStart.current.y;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                  if (dx < 0 && activeTab < 2) setActiveTab(activeTab + 1);
                  if (dx > 0 && activeTab > 0) setActiveTab(activeTab - 1);
                }
              }}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeTab * 100}%)` }}
              >
                <div className="min-w-full"><RewaxCalculator /></div>
                <div className="min-w-full"><WaxStockCalculator /></div>
                <div className="min-w-full"><RotationAndSavings /></div>
              </div>
            </div>
            {/* Swipe hint + dot indicators */}
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="flex items-center gap-2">
                {TAB_LABELS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className="transition-all duration-300"
                    aria-label={TAB_LABELS[i]}
                    style={{
                      width: i === activeTab ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: i === activeTab ? 'var(--accent)' : 'var(--bd)',
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[10px] tracking-[0.08em] transition-opacity duration-700"
                style={{ color: 'var(--txff)', opacity: swipeHintShown ? 0 : 0.7 }}
              >
                ← {de ? 'wischen' : 'swipe'} →
              </p>
            </div>
          </div>

          {/* ── Desktop: 3D deck (lg+) ── */}
          <div className="hidden lg:block">
            <div
              className="relative"
              style={{ perspective: '1900px', height: DECK_HEIGHT }}
            >
              {DECK.map((tool, i) => (
                <DeckSlot
                  key={tool.key}
                  rel={(i - activeCard + 3) % 3}
                  label={de ? `${DECK_LABELS_DE[i]} anzeigen` : `Show ${DECK_LABELS_EN[i]}`}
                  cover={de ? tool.coverDe : tool.coverEn}
                  hint={de ? tool.hintDe : tool.hintEn}
                  Icon={tool.Icon}
                  onActivate={() => setActiveCard(i)}
                  de={de}
                >
                  <tool.Comp />
                </DeckSlot>
              ))}
            </div>

            {/* Arrows + labelled tabs. The old deck's only affordance was three
                4px dots with 10px labels; these are the real control surface,
                all ≥44px, and they name every calculator so nothing depends on
                guessing that a background card can be clicked. */}
            <div className="flex items-center justify-center gap-3 mt-9">
              <button
                type="button"
                onClick={() => setActiveCard((activeCard + 2) % 3)}
                aria-label={de ? 'Vorheriger Rechner' : 'Previous calculator'}
                className="w-11 h-11 rounded-full grid place-items-center transition-colors hover:opacity-80"
                style={{ border: '1px solid var(--bd)', background: 'var(--sf)', color: 'var(--tx2)' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div
                role="tablist"
                aria-label={de ? 'Rechner' : 'Calculators'}
                className="flex items-center gap-1 p-1 rounded-full"
                style={{ background: 'var(--tab-track-bg)', border: '1px solid var(--tab-track-bd)' }}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') { e.preventDefault(); moveDeck((activeCard + 1) % 3); }
                  if (e.key === 'ArrowLeft')  { e.preventDefault(); moveDeck((activeCard + 2) % 3); }
                  if (e.key === 'Home')       { e.preventDefault(); moveDeck(0); }
                  if (e.key === 'End')        { e.preventDefault(); moveDeck(2); }
                }}
              >
                {TAB_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    ref={el => { deckTabRefs.current[i] = el; }}
                    aria-selected={activeCard === i}
                    tabIndex={activeCard === i ? 0 : -1}
                    onClick={() => setActiveCard(i)}
                    className="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors"
                    style={{
                      background: activeCard === i ? 'var(--tab-pill-bg)' : 'transparent',
                      border: activeCard === i ? '1px solid var(--tab-pill-bd)' : '1px solid transparent',
                      boxShadow: activeCard === i ? 'var(--tab-pill-shadow)' : 'none',
                      color: activeCard === i ? 'var(--tx1)' : 'var(--txf)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveCard((activeCard + 1) % 3)}
                aria-label={de ? 'Nächster Rechner' : 'Next calculator'}
                className="w-11 h-11 rounded-full grid place-items-center transition-colors hover:opacity-80"
                style={{ border: '1px solid var(--bd)', background: 'var(--sf)', color: 'var(--tx2)' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

      {/* Bottom gradient — bridges to FAQ below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </Section>
  );
}
