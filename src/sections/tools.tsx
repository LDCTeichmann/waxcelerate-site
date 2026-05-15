import { useState, useEffect, useRef } from 'react';
import { Calculator, Package, PiggyBank, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { waxIntervals } from '@/lib/data';

const BLUE = '#5B7AEE';

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    },
  };
}

// Theme-aware chip toggle — works in all three modes
const tog = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-sm transition-all border cursor-pointer ${
    active
      ? 'border-[#5B7AEE]/40 bg-[#5B7AEE]/10 text-wx-tx1'
      : 'border-wx-bd text-wx-txf hover:text-wx-tx2 hover:border-wx-bd'
  }`;

function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-xl border border-wx-bd hover:border-wx-bd2"
      style={{
        background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
        boxShadow: 'var(--card-shad)',
        transition: 'background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
      }}
    >
      {children}
    </div>
  );
}

function ToolHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-6 pb-5">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(91,122,238,0.1)', boxShadow: '0 0 0 1px rgba(91,122,238,0.18)' }}
        >
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold text-wx-tx1">{title}</h3>
      </div>
      <p className="text-[13px] text-wx-txm leading-snug ml-11">{subtitle}</p>
      <div className="mt-5 border-t border-wx-bd2" />
    </div>
  );
}

function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-[10px] text-wx-txf uppercase tracking-[0.12em] font-medium">{label}</span>
      {value && <span className="text-[12px] text-wx-txm tabular-nums">{value}</span>}
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border border-wx-bd2 p-4"
      style={{ background: 'var(--sf2)' }}
    >
      {children}
    </div>
  );
}

// ─── Tool 1: Rewax Interval Calculator ───────────────────────────────────────
function RewaxCalculator() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<'trocken' | 'gemischt' | 'nass'>('trocken');
  const [terrain, setTerrain] = useState<'strasse' | 'gravel' | 'mtb'>('strasse');
  const [kmPerWeek, setKmPerWeek] = useState(100);

  const MAX_REWAX_WEEKS = 26; // ~6 months — wax oxidizes regardless of riding distance

  const interval = waxIntervals[weather][terrain];
  const rawWeeks = kmPerWeek > 0 ? Math.round(interval / kmPerWeek) : MAX_REWAX_WEEKS;
  const weeks = Math.min(rawWeeks, MAX_REWAX_WEEKS);
  const weeksCapped = rawWeeks > MAX_REWAX_WEEKS;

  const weatherOpts = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];
  const terrainOpts = [
    { value: 'strasse', label: t.tools.rewax.road },
    { value: 'gravel', label: t.tools.rewax.gravel },
    { value: 'mtb', label: t.tools.rewax.mtb },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.rewax.title}
        subtitle="Nie wieder zu früh oder zu spät — erhalte dein genaues Rewax-Intervall."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.rewax.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <button key={o.value} onClick={() => setWeather(o.value as any)} className={tog(weather === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.rewax.terrain} />
            <div className="flex flex-wrap gap-2">
              {terrainOpts.map(o => (
                <button key={o.value} onClick={() => setTerrain(o.value as any)} className={tog(terrain === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.rewax.kmPerWeek} value={`${kmPerWeek} km`} />
            <Slider value={[kmPerWeek]} onValueChange={v => setKmPerWeek(v[0])} min={20} max={400} step={10} className="py-1" />
          </div>
        </div>

        <ResultBox>
          <p className="text-[42px] font-bold text-wx-tx1 text-center leading-none tracking-tight">{weeks}</p>
          <p className="text-[13px] text-wx-txf text-center mt-1">
            {weeks === 1 ? 'Woche' : 'Wochen'} bis zum nächsten Rewaxen
            {weeksCapped && <span className="text-wx-txff"> (max.)</span>}
          </p>
          <p className="text-[12px] text-wx-txm text-center mt-0.5">
            {interval} km · bei {kmPerWeek} km/Wo.
          </p>
          <p className="text-[10px] text-wx-txff text-center mt-3 leading-snug">
            Rewaxe wenn die Kette leise kratzt oder deutlich lauter läuft als gewohnt — das Wachs ist aufgebraucht.
          </p>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 3: Wax Stock Calculator ────────────────────────────────────────────
function WaxStockCalculator() {
  const { t } = useLanguage();
  const [chainCount, setChainCount] = useState(2);
  const [kmPerMonth, setKmPerMonth] = useState(400);
  const [weather, setWeather] = useState<'trocken' | 'gemischt' | 'nass'>('gemischt');

  const roadIntervals = {
    trocken: waxIntervals.trocken.strasse,
    gemischt: waxIntervals.gemischt.strasse,
    nass: waxIntervals.nass.strasse,
  };
  const WAX_GRAMS_PER_APP = 15;
  const MAX_MONTHS = 30;

  const appsPerMonth = kmPerMonth / roadIntervals[weather];
  const waxPerMonth = appsPerMonth * WAX_GRAMS_PER_APP * chainCount;
  const tooLittle = waxPerMonth < 5;

  const months300 = tooLittle ? MAX_MONTHS : Math.min(Math.max(1, Math.round(300 / waxPerMonth)), MAX_MONTHS);
  const months500 = tooLittle ? MAX_MONTHS : Math.min(Math.max(1, Math.round(500 / waxPerMonth)), MAX_MONTHS);
  const cost300 = (22.95 / months300).toFixed(2);
  const cost500 = (29.95 / months500).toFixed(2);
  const rec = waxPerMonth > 80 ? '500' : parseFloat(cost500) < parseFloat(cost300) ? '500' : '300';

  const weatherOpts = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<Package className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.stock.title}
        subtitle="Bestell genau das richtige Paket — kein Verschwendung, kein Engpass."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.stock.chainCount} value={`${chainCount}`} />
            <Slider value={[chainCount]} onValueChange={v => setChainCount(v[0])} min={1} max={4} step={1} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.stock.kmPerMonth} value={`${kmPerMonth} km`} />
            <Slider value={[kmPerMonth]} onValueChange={v => setKmPerMonth(v[0])} min={50} max={1200} step={50} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.stock.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <button key={o.value} onClick={() => setWeather(o.value as any)} className={tog(weather === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
        </div>

        <ResultBox>
          {tooLittle ? (
            <>
              <p className="text-[10px] text-wx-txf uppercase tracking-[0.1em] mb-2">Empfehlung</p>
              <p className="text-[13px] text-wx-txm leading-snug">
                Dein Verbrauch ist sehr niedrig — der 300g-Block reicht länger als seine Haltbarkeit (~2–3 Jahre). Die 300g genügen vollkommen.
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] text-wx-txf uppercase tracking-[0.1em] mb-4">Empfohlene Packung</p>
              <div className="grid grid-cols-2 gap-2">
                {(['300', '500'] as const).map(size => {
                  const isRec = rec === size;
                  const months = size === '300' ? months300 : months500;
                  const cost = size === '300' ? cost300 : cost500;
                  const price = size === '300' ? '22,95' : '29,95';
                  const url = size === '300' ? 'https://www.ebay.de/itm/395811183957' : 'https://www.ebay.de/itm/395811184583';
                  return (
                    <a key={size} href={url} target="_blank" rel="noopener noreferrer">
                      <div
                        className="rounded-lg border p-3 text-center transition-all hover:border-[#5B7AEE]/40"
                        style={{
                          borderColor: isRec ? 'rgba(91,122,238,0.45)' : 'var(--bd)',
                          background: isRec ? 'rgba(91,122,238,0.08)' : 'transparent',
                        }}
                      >
                        {isRec && <p className="text-[9px] text-[#5B7AEE] uppercase tracking-[0.12em] mb-1">Empfohlen</p>}
                        <p className="text-[20px] font-bold text-wx-tx1 leading-none">~{months}<span className="text-[12px] font-normal text-wx-txm ml-1">Mo.</span></p>
                        <p className="text-[11px] text-wx-tx2 mt-1">{size}g — {price} €</p>
                        <p className="text-[10px] text-wx-txf mt-0.5">{cost} €/Monat</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 4: Cost Savings Calculator ─────────────────────────────────────────
function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(pct), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pct, delay]);
  useEffect(() => { setWidth(pct); }, [pct]);

  return (
    <div ref={ref} className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: color,
          transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </div>
  );
}

function CostSavingsCalculator() {
  const { t } = useLanguage();
  const [kmPerYear, setKmPerYear] = useState(5000);
  const [chainPrice, setChainPrice] = useState(45);

  const CASSETTE_PRICE = 80;
  const WAX_APP_COST = 1.5;
  const REWAX_INTERVAL = 500;

  const waxCost = Math.round(
    (kmPerYear / 6000) * chainPrice +
    (kmPerYear / 15000) * CASSETTE_PRICE +
    (kmPerYear / REWAX_INTERVAL) * WAX_APP_COST
  );
  const oilCost = Math.round(
    (kmPerYear / 2500) * chainPrice +
    (kmPerYear / 8000) * CASSETTE_PRICE +
    48
  );
  const savings = Math.max(0, oilCost - waxCost);
  const waxBarPct = Math.round((waxCost / Math.max(oilCost, 1)) * 100);

  return (
    <ToolCard>
      <ToolHeader
        icon={<PiggyBank className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.savings.title}
        subtitle="Sieh in Euro, wie viel Wachs vs. Kettenöl pro Jahr wirklich spart."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.savings.kmPerYear} value={`${kmPerYear} km`} />
            <Slider value={[kmPerYear]} onValueChange={v => setKmPerYear(v[0])} min={1000} max={15000} step={500} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.savings.chainPrice} value={`${chainPrice} €`} />
            <Slider value={[chainPrice]} onValueChange={v => setChainPrice(v[0])} min={20} max={100} step={5} className="py-1" />
          </div>
          <p className="text-[10px] text-wx-txff leading-relaxed -mt-2">
            Kassette €80 · Wachskette 6.000km · Ölkette 2.500km · Wachsen €1,50/Session
          </p>
        </div>

        <ResultBox>
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] text-wx-tx2">Wachs</span>
                <span className="text-[13px] font-bold text-wx-tx1">{waxCost} €</span>
              </div>
              <AnimatedBar pct={waxBarPct} color="linear-gradient(90deg, #4A68E8, #7090FF)" delay={0} />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] text-wx-txf">Kettenöl</span>
                <span className="text-[13px] font-bold text-wx-txf line-through decoration-wx-bd">{oilCost} €</span>
              </div>
              <AnimatedBar pct={100} color="rgba(255,255,255,0.1)" delay={150} />
            </div>
          </div>

          <div className="rounded-lg border border-[#5B7AEE]/20 p-3 text-center" style={{ background: 'rgba(91,122,238,0.06)' }}>
            <p className="text-[10px] text-[#5B7AEE] uppercase tracking-[0.14em] mb-1">Deine Ersparnis</p>
            <p className="text-[36px] font-bold text-wx-tx1 leading-none tracking-tight">+{savings} €</p>
            <p className="text-[11px] text-wx-txf mt-0.5">pro Jahr</p>
          </div>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 5: Rotation ROI ─────────────────────────────────────────────────────
function RotationROI() {
  const [kmPerYear, setKmPerYear] = useState(5000);
  const [showHow, setShowHow] = useState(false);

  const CHAIN_KM_1   = 6000;
  const CHAIN_KM_2   = 8500;
  const CASSETTE_KM_1 = 15000;
  const CASSETTE_KM_2 = 22000;
  const CHAIN_PRICE   = 45;
  const CASSETTE_PRICE = 50;
  const REWAX_KM      = 500;

  const chainMonths1  = Math.max(1, Math.round((CHAIN_KM_1 / kmPerYear) * 12));
  const chainMonths2  = Math.max(1, Math.round((CHAIN_KM_2 / kmPerYear) * 12));
  const cassetteYrs1  = parseFloat((CASSETTE_KM_1 / kmPerYear).toFixed(1));
  const cassetteYrs2  = parseFloat((CASSETTE_KM_2 / kmPerYear).toFixed(1));
  const chainGain     = chainMonths2 - chainMonths1;
  const cassetteGain  = parseFloat((cassetteYrs2 - cassetteYrs1).toFixed(1));
  const rewaxPerYear  = Math.ceil(kmPerYear / REWAX_KM);

  // 5-year total cost comparison
  const km5 = kmPerYear * 5;
  const cost1 = Math.round((km5 / CHAIN_KM_1) * CHAIN_PRICE + (km5 / CASSETTE_KM_1) * CASSETTE_PRICE);
  const cost2 = Math.round((km5 / CHAIN_KM_2) * CHAIN_PRICE + (km5 / CASSETTE_KM_2) * CASSETTE_PRICE);
  const savingsPerYear = Math.round((cost1 - cost2) / 5);
  const breakEvenMonths = savingsPerYear > 0 ? Math.round((CHAIN_PRICE / savingsPerYear) * 12) : 0;

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title="Lohnen sich mehrere Ketten?"
        subtitle="Kettenverschleiß und Kassettenlaufzeit realistisch verglichen."
      />
      <div className="px-6 flex flex-col flex-1 gap-4 pb-6">
        <div>
          <FieldLabel label="km pro Jahr" value={`${kmPerYear} km`} />
          <Slider value={[kmPerYear]} onValueChange={v => setKmPerYear(v[0])} min={1000} max={10000} step={500} className="py-1" />
        </div>

        {/* Hero: annual savings */}
        <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(91,122,238,0.07)', border: '1px solid rgba(91,122,238,0.22)' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txf mb-2">Ersparnis pro Jahr</p>
          <p className="text-[38px] font-bold tabular-nums leading-none" style={{ color: '#8AAAFF' }}>~{savingsPerYear} €</p>
          <p className="text-[11px] text-wx-txf mt-1.5">
            2. Kette amortisiert sich in ~{breakEvenMonths} Monaten
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1 chain */}
          <div className="rounded-lg border border-wx-bd p-3 text-center" style={{ background: 'var(--sf3)' }}>
            <p className="text-[10px] text-wx-txff mb-2">1 Kette</p>
            <p className="text-[22px] font-bold text-wx-txm leading-none">{chainMonths1}</p>
            <p className="text-[10px] text-wx-txff mt-0.5">Mo. / Kette</p>
            <div className="mt-2.5 pt-2.5 border-t border-wx-bd2">
              <p className="text-[13px] font-semibold text-wx-txm">{cassetteYrs1} J.</p>
              <p className="text-[10px] text-wx-txff mt-0.5">Kassette</p>
            </div>
          </div>

          {/* 2 chains */}
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: 'rgba(91,122,238,0.38)', background: 'rgba(91,122,238,0.06)' }}>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: '#5B7AEE' }}>Empfohlen</p>
            <p className="text-[10px] text-wx-txf mb-1.5">2 Ketten</p>
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-[22px] font-bold text-wx-tx1 leading-none">{chainMonths2}</p>
              {chainGain > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(91,122,238,0.18)', color: '#8AAAFF' }}>
                  +{chainGain} Mo.
                </span>
              )}
            </div>
            <p className="text-[10px] text-wx-txf mt-0.5">Mo. / Kette</p>
            <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: 'rgba(91,122,238,0.2)' }}>
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-[13px] font-semibold text-wx-tx1">{cassetteYrs2} J.</p>
                {cassetteGain > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(91,122,238,0.18)', color: '#8AAAFF' }}>
                    +{cassetteGain} J.
                  </span>
                )}
              </div>
              <p className="text-[10px] text-wx-txf mt-0.5">Kassette</p>
            </div>
          </div>
        </div>

        {/* Honest note */}
        <p className="text-[10px] text-wx-txff text-center -mt-1">
          Rewax-Frequenz bleibt gleich: ~{rewaxPerYear}× pro Jahr — du wechselst nur ab.
        </p>

        {/* Expandable: how it works */}
        <div className="rounded-lg border border-wx-bd overflow-hidden" style={{ background: 'var(--sf3)' }}>
          <button
            type="button"
            onClick={() => setShowHow(v => !v)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-wx-txf hover:text-wx-tx2 transition-colors"
          >
            <span className="text-[11px] font-medium">Wie funktioniert das?</span>
            <span
              className="text-[11px] transition-transform duration-[320ms] inline-block"
              style={{ transform: showHow ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >↓</span>
          </button>
          <div
            className="overflow-hidden transition-[grid-template-rows,opacity] duration-[320ms]"
            style={{
              display: 'grid',
              gridTemplateRows: showHow ? '1fr' : '0fr',
              opacity: showHow ? 1 : 0,
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-3 border-t border-wx-bd2 space-y-2">
                <p className="text-[11px] text-wx-txm leading-relaxed">
                  Beim Abwechseln zwischen zwei Ketten trägt sich jede Kette nur halb so schnell ab — sie hält dadurch ~40 % länger. Da die Kassette durch Kettendehnung verschleißt, lebt auch sie deutlich länger.
                </p>
                <p className="text-[11px] text-wx-txf leading-relaxed">
                  Du rewaxst genauso oft (die Strecke pro Rewax bleibt gleich), wechselst aber die Kette ab. Ergebnis: weniger Ketten kaufen, viel seltener Kassette wechseln.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full rounded-lg border border-[#5B7AEE]/25 p-2.5 text-center hover:border-[#5B7AEE]/45 transition-colors"
          style={{ background: 'rgba(91,122,238,0.05)' }}
        >
          <span className="text-[12px] font-medium" style={{ color: '#8AAAFF' }}>2. Kette im Shop ansehen →</span>
        </button>
      </div>
    </ToolCard>
  );
}

// ─── Reveal wrapper ──────────────────────────────────────────────────────────
function RevealSlot({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { ref, style } = useScrollReveal(delay);
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

// ─── Mobile tab labels ────────────────────────────────────────────────────────
const TAB_LABELS = ['Intervall', 'Vorrat', 'Ersparnis', 'Rotation'];

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  const toolComponents = [
    <RewaxCalculator />,
    <WaxStockCalculator />,
    <CostSavingsCalculator />,
    <RotationROI />,
  ];

  return (
    <section id="tools" className="py-24" style={{ background: 'var(--tool-bg)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div ref={headerRef} className="text-center mb-16">
            <span data-reveal="eyebrow" className="text-[10px] tracking-[0.35em] uppercase mb-3 block font-medium" style={{ color: BLUE }}>
              Planungs-Tools
            </span>
            <h2 data-reveal="heading" className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              {t.tools.title}
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2 max-w-xl mx-auto text-[15px]">
              {t.tools.subtitle}
            </p>
          </div>

          {/* ── Mobile: tab switcher (one tool at a time) ── */}
          <div className="md:hidden">
            <div
              className="flex gap-1 p-1 rounded-xl border border-wx-bd mb-5 overflow-x-auto"
              style={{ background: 'var(--sf2)' }}
            >
              {TAB_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 min-w-[60px] px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === i ? 'text-wx-tx1 shadow-sm' : 'text-wx-txf hover:text-wx-tx2'
                  }`}
                  style={activeTab === i ? { background: 'var(--sf)' } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
            {toolComponents[activeTab]}
          </div>

          {/* ── Desktop: 2+2 grid layout ── */}
          <div className="hidden md:block space-y-4">
            <div className="grid md:grid-cols-2 gap-4 items-stretch">
              <RevealSlot delay={0}><RewaxCalculator /></RevealSlot>
              <RevealSlot delay={90}><WaxStockCalculator /></RevealSlot>
            </div>
            <div className="grid md:grid-cols-2 gap-4 items-stretch">
              <RevealSlot delay={180}><CostSavingsCalculator /></RevealSlot>
              <RevealSlot delay={270}><RotationROI /></RevealSlot>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
