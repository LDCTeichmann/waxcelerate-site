import { useState, useEffect, useRef, useMemo } from 'react';
import { Calculator, Package, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { waxIntervals } from '@/lib/data';
import { gsap } from '@/lib/gsap';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';


// ─── Animated number ticker ───────────────────────────────────────────────────
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    const to = value;
    prev.current = to;
    if (from === to) return;

    tweenRef.current?.kill();
    const counter = { val: from };
    tweenRef.current = gsap.to(counter, {
      val: to,
      duration: 0.38,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `${prefix}${counter.val.toFixed(decimals)}${suffix}`;
      },
    });
  }, [value, prefix, suffix, decimals]);

  const fmt = value.toFixed(decimals);
  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{fmt}{suffix}
    </span>
  );
}

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
function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-3xl"
      style={{
        background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
        border: '1px solid var(--bd)',
        boxShadow: 'var(--card-shad)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
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
                  background: 'var(--sf3)',
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
              className="font-serif-display italic text-[56px] font-bold leading-none tabular-nums"
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
                    background: isRec ? 'rgba(var(--accent-rgb),0.08)' : 'var(--sf3)',
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
                        style={{ background: 'rgba(43,84,153,0.12)', color: 'var(--brand)' }}
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

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // ── Desktop deck state ────────────────────────────────────────────────────
  const [activeCard, setActiveCard] = useState(0);

  // 3 card refs (no hooks in loops)
  const cardRef0 = useRef<HTMLDivElement>(null);
  const cardRef1 = useRef<HTMLDivElement>(null);
  const cardRef2 = useRef<HTMLDivElement>(null);
  const cardRefs = useMemo(() => [cardRef0, cardRef1, cardRef2], []);
  const deckMountedRef = useRef(false);

  // Deck geometry
  const CARD_WIDTH   = 620;
  const DECK_HEIGHT  = 700;
  const SIDE_OFFSET  = 560;
  const SIDE_SCALE   = 0.85;
  const SIDE_OPACITY = 0.58;

  // GSAP: position 3 cards in a circular deck
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = deckMountedRef.current && !prefersReduced;
    deckMountedRef.current = true;

    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      // 3-card circular: 0=active, 1=right, 2=left
      const rawOffset = (i - activeCard + 3) % 3;
      const isActive = rawOffset === 0;
      const isRight  = rawOffset === 1;
      const props = {
        x:       isActive ? 0 : isRight ? SIDE_OFFSET : -SIDE_OFFSET,
        scale:   isActive ? 1 : SIDE_SCALE,
        opacity: isActive ? 1 : SIDE_OPACITY,
        zIndex:  isActive ? 20 : 10,
      };
      if (animate) {
        gsap.to(ref.current, { ...props, duration: 0.55, ease: 'power3.inOut', overwrite: 'auto' });
      } else {
        gsap.set(ref.current, props);
      }
    });
  }, [activeCard, cardRefs]); // eslint-disable-line

  // ── Mobile tab state ──────────────────────────────────────────────────────
  const TAB_LABELS = useMemo(() =>
    de ? ['Intervall', 'Vorrat', 'Rotation']
       : ['Interval', 'Stock', 'Rotation'],
  [de]);
  const [activeTab, setActiveTab] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabPillRef = useRef<HTMLDivElement>(null);

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
  }, []); // eslint-disable-line

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
  }, []); // eslint-disable-line

  return (
    <section id="tools" className="relative py-20 sm:py-28" style={{ background: 'var(--tool-bg)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">

          <div ref={headerRef} className="mb-16">
            <h2 className="section-title mb-4">
              <ScrollWordReveal text={t.tools.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2 max-w-xl text-[15px]">
              {t.tools.subtitle}
            </p>
          </div>

          {/* ── Mobile / tablet: tab switcher (up to lg) ── */}
          <div className="lg:hidden">
            <div
              ref={tabBarRef}
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
                  className="relative z-10 flex-1 min-w-[60px] px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors whitespace-nowrap"
                  style={{
                    color: activeTab === i ? 'var(--tx1)' : 'var(--txf)',
                    letterSpacing: activeTab === i ? '-0.01em' : '0',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {activeTab === 0 && <RewaxCalculator />}
            {activeTab === 1 && <WaxStockCalculator />}
            {activeTab === 2 && <RotationAndSavings />}
          </div>

          {/* ── Desktop: 3-card streaming deck (lg+) ── */}
          <div
            className="hidden lg:block relative"
            style={{
              height: DECK_HEIGHT,
              overflow: 'hidden',
              background: 'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(var(--accent-rgb),0.07) 0%, transparent 70%)',
            }}
          >
            {([cardRef0, cardRef1, cardRef2] as const).map((ref, i) => (
              <div
                key={i}
                ref={ref}
                className="absolute top-0"
                style={{
                  left: '50%',
                  marginLeft: -CARD_WIDTH / 2,
                  width: CARD_WIDTH,
                  height: '100%',
                  willChange: 'transform',
                }}
              >
                <div style={{ height: '100%', pointerEvents: i === activeCard ? 'auto' : 'none' }}>
                  {i === 0 && <RewaxCalculator />}
                  {i === 1 && <WaxStockCalculator />}
                  {i === 2 && <RotationAndSavings />}
                </div>

                {/* Inactive overlay: frosted glass tint */}
                {i !== activeCard && (
                  <div
                    className="absolute inset-0 rounded-3xl cursor-pointer"
                    style={{
                      background: 'rgba(4,4,10,0.18)',
                      zIndex: 25,
                      transition: 'background 250ms ease',
                    }}
                    onClick={() => setActiveCard(i)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(4,4,10,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(4,4,10,0.18)'; }}
                  />
                )}
              </div>
            ))}

            {/* Edge fades */}
            <div
              className="absolute inset-y-0 left-0 pointer-events-none"
              style={{ width: 220, zIndex: 50, background: 'linear-gradient(to right, var(--tool-bg) 20%, transparent 100%)' }}
            />
            <div
              className="absolute inset-y-0 right-0 pointer-events-none"
              style={{ width: 220, zIndex: 50, background: 'linear-gradient(to left, var(--tool-bg) 20%, transparent 100%)' }}
            />
          </div>

          {/* Dot + label indicator — desktop only */}
          <div className="hidden lg:flex items-center justify-center gap-5 mt-6">
            {TAB_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setActiveCard(i)}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                style={{ border: 'none', background: 'transparent', padding: 0 }}
              >
                <div
                  className="transition-all duration-300"
                  style={{
                    width: i === activeCard ? '22px' : '5px',
                    height: '4px',
                    borderRadius: '2px',
                    background: i === activeCard ? 'var(--tx1)' : 'var(--bd)',
                  }}
                />
                <span
                  className="text-[10px] tracking-[0.08em] transition-all duration-300"
                  style={{
                    color: i === activeCard ? 'var(--txm)' : 'var(--txff)',
                    fontWeight: i === activeCard ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
      {/* Bottom gradient — bridges to FAQ below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </section>
  );
}
