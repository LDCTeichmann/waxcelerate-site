import { useState, useEffect, useRef } from 'react';
import { Calculator, Link2, Package, PiggyBank, RotateCcw, ExternalLink } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';
import { waxIntervals, compatibilityMatrix, getProductById, type Product } from '@/lib/data';

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
      className="flex flex-col h-full rounded-xl border border-wx-bd transition-colors hover:border-wx-bd2"
      style={{
        background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
        boxShadow: 'var(--card-shad)',
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

        {/* Weeks as primary output — more intuitive than raw km */}
        <ResultBox>
          <p className="text-[42px] font-bold text-wx-tx1 text-center leading-none tracking-tight">{weeks}</p>
          <p className="text-[13px] text-wx-txf text-center mt-1">
            {weeks === 1 ? 'Woche' : 'Wochen'} bis zum nächsten Rewaxen
            {weeksCapped && <span className="text-wx-txff"> (max.)</span>}
          </p>
          <p className="text-[12px] text-wx-txm text-center mt-0.5">
            {interval} km · bei {kmPerWeek} km/Wo.
          </p>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 2: Bike Questionnaire ───────────────────────────────────────────────
function BikeQuestionnaire() {
  const { lang } = useLanguage();
  const [brand, setBrand] = useState<'shimano' | 'sram' | 'campagnolo' | 'unknown'>('shimano');
  const [speed, setSpeed] = useState<'9-10' | '11' | '12'>('11');

  const is9or10 = speed === '9-10';
  const speedKey = speed as '11' | '12';

  let recommendedChains: Product[] = [];
  if (!is9or10) {
    if (brand === 'unknown') {
      const ybnId = speed === '11' ? 'chain-ybn11' : 'chain-ybn12';
      const ybn = getProductById(ybnId);
      if (ybn) recommendedChains = [ybn];
    } else {
      recommendedChains = (compatibilityMatrix[brand]?.[speedKey] || [])
        .map(id => getProductById(id))
        .filter((p): p is Product => Boolean(p));
    }
  }

  const brandOpts = [
    { value: 'shimano', label: 'Shimano' },
    { value: 'sram', label: 'SRAM' },
    { value: 'campagnolo', label: 'Campagnolo' },
    { value: 'unknown', label: 'Weiß nicht' },
  ];
  const speedOpts = [
    { value: '9-10', label: '9/10-fach' },
    { value: '11', label: '11-fach' },
    { value: '12', label: '12-fach' },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<Link2 className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title="Welche Kette passt zu dir?"
        subtitle="2 Angaben — sofortige Empfehlung."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label="Antrieb" />
            <div className="flex flex-wrap gap-2">
              {brandOpts.map(o => (
                <button key={o.value} onClick={() => setBrand(o.value as any)} className={tog(brand === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label="Gänge" />
            <div className="flex flex-wrap gap-2">
              {speedOpts.map(o => (
                <button key={o.value} onClick={() => setSpeed(o.value as any)} className={tog(speed === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
        </div>

        {is9or10 ? (
          <ResultBox>
            <p className="text-[10px] text-wx-txf uppercase tracking-[0.1em] mb-2">Für 9/10-fach</p>
            <p className="text-[12px] text-wx-txm leading-snug mb-3">
              Keine vorgewachsten Ketten nötig — wachs einfach deine bestehende Kette selbst.
            </p>
            <a
              href="https://www.ebay.de/itm/395811183957"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-3 hover:border-[#5B7AEE]/50 transition-colors"
              style={{ borderColor: 'rgba(91,122,238,0.3)', background: 'rgba(91,122,238,0.06)' }}
            >
              <p className="text-[13px] font-semibold text-wx-tx1">Classic Kettenwachs 300g</p>
              <p className="text-[11px] mt-0.5" style={{ color: BLUE }}>22,95 € · Auf eBay ↗</p>
            </a>
          </ResultBox>
        ) : (
          <div>
            <p className="text-[10px] text-wx-txf uppercase tracking-[0.12em] mb-3">Passende Ketten</p>
            {recommendedChains.length === 0 ? (
              <p className="text-[13px] text-wx-txm text-center py-4">Keine Ketten gefunden</p>
            ) : (
              <div className="space-y-1.5">
                {/* Entire row is the link — large tap target, no nested <a><button> */}
                {recommendedChains.map((chain) => (
                  <a
                    key={chain.id}
                    href={chain.ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 border border-wx-bd hover:border-[#5B7AEE]/40 transition-colors group"
                    style={{ background: 'var(--sf2)' }}
                  >
                    <div>
                      <p className="text-[13px] text-wx-tx2 leading-tight">{lang === 'de' ? chain.title : chain.titleEn}</p>
                      <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#8AAAFF' }}>{chain.price.toFixed(2)} €</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-wx-txf group-hover:text-[#8AAAFF] transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
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

  // Numbers consistent with CostSavingsCalculator (wax chain = 6000 km, cassette = 15000 km)
  const CHAIN_KM_1 = 6000;    // single hot-waxed chain lifespan (road, typical)
  const CHAIN_KM_2 = 8500;    // each chain in 2-chain rotation (~40% longer per chain)
  const CASSETTE_KM_1 = 15000; // cassette with 1 waxed chain (consistent with savings calc)
  const CASSETTE_KM_2 = 22000; // cassette with 2-chain rotation (~47% longer)
  const REWAX_KM = 500;        // road/dry rewax interval (baseline)

  // Chain lifespan in months at their riding pace
  const chainMonths1 = Math.max(1, Math.round((CHAIN_KM_1 / kmPerYear) * 12));
  const chainMonths2 = Math.max(1, Math.round((CHAIN_KM_2 / kmPerYear) * 12));

  // Cassette lifespan in years
  const cassetteYears1 = parseFloat((CASSETTE_KM_1 / kmPerYear).toFixed(1));
  const cassetteYears2 = parseFloat((CASSETTE_KM_2 / kmPerYear).toFixed(1));

  // Rewax sessions per year — same regardless of chain count (honest disclosure)
  const rewaxPerYear = Math.ceil(kmPerYear / REWAX_KM);

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title="Lohnen sich mehrere Ketten?"
        subtitle="Kettenverschleiß und Kassettenlaufzeit realistisch verglichen."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div>
          <FieldLabel label="km pro Jahr" value={`${kmPerYear} km`} />
          <Slider value={[kmPerYear]} onValueChange={v => setKmPerYear(v[0])} min={1000} max={10000} step={500} className="py-1" />
        </div>

        <ResultBox>
          <div className="grid grid-cols-2 gap-3">
            {/* 1 chain */}
            <div className="rounded-lg border border-wx-bd p-4 text-center" style={{ background: 'var(--sf3)' }}>
              <p className="text-[11px] text-wx-txf mb-3">1 Kette</p>
              <p className="text-[32px] font-bold text-wx-tx1 leading-none">{chainMonths1}</p>
              <p className="text-[11px] text-wx-txf mt-1">Monate / Kette</p>
              <div className="mt-3 pt-3 border-t border-wx-bd2">
                <p className="text-[13px] font-semibold text-wx-txm">{cassetteYears1} J.</p>
                <p className="text-[10px] text-wx-txff mt-0.5">Kassettenlaufzeit</p>
              </div>
            </div>

            {/* 2 chains — recommended */}
            <div className="rounded-lg border p-4 text-center" style={{ borderColor: 'rgba(91,122,238,0.4)', background: 'rgba(91,122,238,0.07)' }}>
              <p className="text-[9px] text-[#5B7AEE] uppercase tracking-[0.14em] mb-1">Empfohlen</p>
              <p className="text-[11px] text-wx-tx2 mb-2">2 Ketten</p>
              <p className="text-[32px] font-bold text-wx-tx1 leading-none">{chainMonths2}</p>
              <p className="text-[11px] text-wx-txm mt-1">Monate / Kette</p>
              <div className="mt-3 pt-3 border-t border-wx-bd2">
                <p className="text-[13px] font-semibold text-wx-tx1">{cassetteYears2} J.</p>
                <p className="text-[10px] text-wx-txf mt-0.5">Kassettenlaufzeit</p>
              </div>
            </div>
          </div>

          {/* Honest disclosure: rewax frequency doesn't change */}
          <p className="text-[10px] text-wx-txff text-center mt-3 leading-snug">
            Rewax-Frequenz bleibt gleich: ~{rewaxPerYear}× pro Jahr — du wechselst nur ab.
          </p>

          <button
            onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full mt-3 rounded-lg border border-[#5B7AEE]/25 p-2.5 text-center hover:border-[#5B7AEE]/45 transition-colors"
            style={{ background: 'rgba(91,122,238,0.05)' }}
          >
            <span className="text-[12px] font-medium" style={{ color: '#8AAAFF' }}>2. Kette hinzufügen →</span>
          </button>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Reveal wrapper ──────────────────────────────────────────────────────────
function RevealSlot({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { ref, style } = useScrollReveal(delay);
  return (
    <div ref={ref} style={{ ...style, willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}

// ─── Mobile tab labels ────────────────────────────────────────────────────────
const TAB_LABELS = ['Intervall', 'Kette', 'Vorrat', 'Ersparnis', 'Rotation'];

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const toolComponents = [
    <RewaxCalculator />,
    <BikeQuestionnaire />,
    <WaxStockCalculator />,
    <CostSavingsCalculator />,
    <RotationROI />,
  ];

  return (
    <section id="tools" className="py-24" style={{ background: 'var(--tool-bg)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[0.35em] uppercase mb-3 block font-medium" style={{ color: BLUE }}>
              Planungs-Tools
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              {t.tools.title}
            </h2>
            <p className="text-wx-tx2 max-w-xl mx-auto text-[15px]">
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

          {/* ── Desktop: 2+3 grid layout ── */}
          <div className="hidden md:block space-y-4">
            {/* Row 1: primary tools — 2 wide columns */}
            <div className="grid md:grid-cols-2 gap-4 items-stretch">
              <RevealSlot delay={0}><RewaxCalculator /></RevealSlot>
              <RevealSlot delay={90}><BikeQuestionnaire /></RevealSlot>
            </div>
            {/* Row 2: secondary tools — 3 columns */}
            <div className="grid md:grid-cols-3 gap-4 items-stretch">
              <RevealSlot delay={180}><WaxStockCalculator /></RevealSlot>
              <RevealSlot delay={270}><CostSavingsCalculator /></RevealSlot>
              <RevealSlot delay={360}><RotationROI /></RevealSlot>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
