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

const tog = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-sm transition-all border cursor-pointer ${
    active
      ? 'border-[#5B7AEE]/50 bg-[#5B7AEE]/12 text-[#A8BFFF]'
      : 'border-[#1E1E2C] text-[#4E4E62] hover:border-[#2E2E40] hover:text-[#7A7A9A]'
  }`;

function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-xl border border-[#1A1A28] transition-colors hover:border-[#2A2A3A]"
      style={{
        background: 'linear-gradient(160deg, #0E0E17 0%, #0A0A10 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
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
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      </div>
      <p className="text-[13px] text-[#6B7088] leading-snug ml-11">{subtitle}</p>
      <div className="mt-5 border-t border-[#131320]" />
    </div>
  );
}

function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-[10px] text-[#4A4A62] uppercase tracking-[0.12em] font-medium">{label}</span>
      {value && <span className="text-[12px] text-[#7A80A0] tabular-nums">{value}</span>}
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border border-[#1A1A2E] p-4"
      style={{ background: 'rgba(6,6,14,0.8)' }}
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
          <p className="text-[42px] font-bold text-white text-center leading-none tracking-tight">{interval}</p>
          <p className="text-[13px] text-[#4A4A62] text-center mt-1">km bis zum nächsten Rewaxen</p>
          <p className="text-[12px] text-[#6B7088] text-center mt-0.5">
            ≈ {weeks} {weeks === 1 ? 'Woche' : 'Wochen'} bei {kmPerWeek} km/Wo.
            {weeksCapped && <span className="text-[#3A3A52]"> (max. — Wachs oxidiert)</span>}
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
            <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.1em] mb-2">Empfehlung</p>
            <p className="text-[12px] text-[#7A7A9A] leading-snug mb-3">
              Für 9/10-fach bieten wir keine vorgewachsten Ketten an — aber deine bestehende Kette kannst du einfach selbst wachsen.
            </p>
            <a href="https://www.ebay.de/itm/395811183957" target="_blank" rel="noopener noreferrer">
              <div
                className="rounded-lg border p-3 hover:border-[#5B7AEE]/50 transition-colors"
                style={{ borderColor: 'rgba(91,122,238,0.3)', background: 'rgba(91,122,238,0.06)' }}
              >
                <p className="text-[13px] font-semibold text-[#A8BFFF]">Classic Kettenwachs 300g</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#5B7AEE' }}>22,95 € · Auf eBay ↗</p>
              </div>
            </a>
          </ResultBox>
        ) : (
          <div>
            <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.12em] mb-3">Passende Ketten</p>
            {recommendedChains.length === 0 ? (
              <p className="text-[13px] text-[#3E3E52] text-center py-4">Keine Ketten gefunden</p>
            ) : (
              <div className="space-y-1.5">
                {recommendedChains.map((chain) => (
                  <div
                    key={chain.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 border border-[#181826] hover:border-[#252538] transition-colors"
                    style={{ background: 'rgba(6,6,14,0.7)' }}
                  >
                    <div>
                      <p className="text-[13px] text-[#C0C4DC] leading-tight">{lang === 'de' ? chain.title : chain.titleEn}</p>
                      <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#8AAAFF' }}>{chain.price.toFixed(2)} €</p>
                    </div>
                    <a href={chain.ebayUrl} target="_blank" rel="noopener noreferrer">
                      <button className="p-1.5 rounded-md border border-[#1E1E2C] text-[#3E3E52] hover:border-[#5B7AEE]/30 hover:text-[#8AAAFF] transition-all">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </a>
                  </div>
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

  // Use road intervals from waxIntervals (consistent with RewaxCalculator)
  const roadIntervals = {
    trocken: waxIntervals.trocken.strasse,
    gemischt: waxIntervals.gemischt.strasse,
    nass: waxIntervals.nass.strasse,
  };
  const WAX_GRAMS_PER_APP = 15; // net hot-wax consumption per dip (gross drips return to pot)
  const MAX_MONTHS = 30; // shelf life cap ~2.5 years

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
              <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.1em] mb-2">Empfehlung</p>
              <p className="text-[13px] text-[#7A7A9A] leading-snug">
                Dein Verbrauch ist sehr niedrig — der 300g-Block reicht länger als seine Haltbarkeit (~2–3 Jahre). Die 300g genügen vollkommen.
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.1em] mb-0.5">Empfohlene Packung</p>
              <p className="text-[11px] text-[#4A4A62] mb-4">
                ~{Math.round(waxPerMonth)}g/Monat · {(appsPerMonth * chainCount).toFixed(1)} Rewax-Sessions/Monat
              </p>
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
                          borderColor: isRec ? 'rgba(91,122,238,0.45)' : '#1E1E2C',
                          background: isRec ? 'rgba(91,122,238,0.08)' : 'transparent',
                        }}
                      >
                        {isRec && <p className="text-[9px] text-[#5B7AEE] uppercase tracking-[0.12em] mb-1">Empfohlen</p>}
                        <p className="text-[20px] font-bold text-white leading-none">~{months}<span className="text-[12px] font-normal text-[#6B7088] ml-1">Mo.</span></p>
                        <p className="text-[11px] text-[#C0C4DC] mt-1">{size}g — {price} €</p>
                        <p className="text-[10px] text-[#4A4A62] mt-0.5">{cost} €/Monat</p>
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
  // Reset animation when pct changes (slider moved)
  useEffect(() => { setWidth(pct); }, [pct]);

  return (
    <div ref={ref} className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
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
  const WAX_APP_COST = 1.5;   // €/app — 15g × €29.95/500g ≈ €0.90 + overhead
  const REWAX_INTERVAL = 500; // km, consistent with road/dry waxIntervals

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
  // Oil is always the baseline (100%) — wax bar is proportional
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
          <p className="text-[10px] text-[#2E2E42] leading-relaxed -mt-2">
            Kassette €80 · Wachskette 6.000km · Ölkette 2.500km · Wachsen €1,50/Session
          </p>
        </div>

        <ResultBox>
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] text-[#A8BFFF]">Wachs</span>
                <span className="text-[13px] font-bold text-white">{waxCost} €</span>
              </div>
              <AnimatedBar pct={waxBarPct} color="linear-gradient(90deg, #4A68E8, #7090FF)" delay={0} />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] text-[#4A4A62]">Kettenöl</span>
                <span className="text-[13px] font-bold text-[#4A4A62] line-through decoration-[#3E3E52]">{oilCost} €</span>
              </div>
              <AnimatedBar pct={100} color="rgba(255,255,255,0.1)" delay={150} />
            </div>
          </div>

          <div className="rounded-lg border border-[#5B7AEE]/20 p-3 text-center" style={{ background: 'rgba(91,122,238,0.06)' }}>
            <p className="text-[10px] text-[#5B7AEE] uppercase tracking-[0.14em] mb-1">Deine Ersparnis</p>
            <p className="text-[36px] font-bold text-white leading-none tracking-tight">+{savings} €</p>
            <p className="text-[11px] text-[#4A4A62] mt-0.5">pro Jahr</p>
          </div>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 5: Rotation ROI ─────────────────────────────────────────────────────
function RotationROI() {
  const [kmPerYear, setKmPerYear] = useState(5000);
  const [cassettePrice, setCassettePrice] = useState(80);

  const CHAIN_LIFE = 6000;
  const CHAIN_PRICE = 38; // avg pre-waxed chain
  const WAX_COST_PER_APP = 1.5;
  const REWAX_KM = 500;
  const BASE_CASSETTE_KM = 12000; // single waxed chain
  const CASSETTE_MULT: Record<number, number> = { 1: 1, 2: 1.8, 3: 2.4 };
  const YEARS = 5;
  const totalKm = kmPerYear * YEARS;

  const calc = (n: number) => {
    const cassetteKm = BASE_CASSETTE_KM * CASSETTE_MULT[n];
    const cassetteEveryYears = parseFloat((cassetteKm / kmPerYear).toFixed(1));
    const cassetteCost = (totalKm / cassetteKm) * cassettePrice;
    const chainsConsumed = Math.ceil(totalKm / CHAIN_LIFE) + (n - 1);
    const chainCost = chainsConsumed * CHAIN_PRICE;
    const waxCost = (totalKm / REWAX_KM) * WAX_COST_PER_APP;
    const totalCost = Math.round(chainCost + cassetteCost + waxCost);
    const rewaxEveryWeeks = Math.max(1, Math.round((REWAX_KM * n) / (kmPerYear / 52)));
    return { cassetteEveryYears, totalCost, rewaxEveryWeeks };
  };

  const r1 = calc(1), r2 = calc(2), r3 = calc(3);
  const savings2 = r1.totalCost - r2.totalCost;

  const cols = [
    { n: 1, label: '1 Kette', r: r1, rec: false },
    { n: 2, label: '2 Ketten', r: r2, rec: true },
    { n: 3, label: '3 Ketten', r: r3, rec: false },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title="Lohnen sich mehrere Ketten?"
        subtitle="Kassettenlaufzeit und Rewax-Aufwand im Vergleich."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label="km pro Jahr" value={`${kmPerYear} km`} />
            <Slider value={[kmPerYear]} onValueChange={v => setKmPerYear(v[0])} min={1000} max={10000} step={500} className="py-1" />
          </div>
          <div>
            <FieldLabel label="Kassettenpreis" value={`${cassettePrice} €`} />
            <Slider value={[cassettePrice]} onValueChange={v => setCassettePrice(v[0])} min={40} max={200} step={10} className="py-1" />
          </div>
        </div>

        <ResultBox>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {cols.map(({ n, label, r, rec }) => (
              <div
                key={n}
                className="rounded-lg border p-2.5 text-center"
                style={{
                  borderColor: rec ? 'rgba(91,122,238,0.45)' : '#1A1A2E',
                  background: rec ? 'rgba(91,122,238,0.08)' : 'rgba(6,6,14,0.6)',
                }}
              >
                {rec && <p className="text-[8px] text-[#5B7AEE] uppercase tracking-[0.12em] mb-1">Empfohlen</p>}
                <p className="text-[10px] font-semibold text-[#C0C4DC] mb-2">{label}</p>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[7.5px] text-[#3A3A52] uppercase tracking-[0.1em]">Kassette hält</p>
                    <p className="text-[16px] font-bold text-white leading-tight">{r.cassetteEveryYears}<span className="text-[10px] font-normal text-[#6B7088] ml-0.5">J.</span></p>
                  </div>
                  <div>
                    <p className="text-[7.5px] text-[#3A3A52] uppercase tracking-[0.1em]">Rewax alle</p>
                    <p className="text-[16px] font-bold text-white leading-tight">{r.rewaxEveryWeeks}<span className="text-[10px] font-normal text-[#6B7088] ml-0.5">Wo.</span></p>
                  </div>
                  <div>
                    <p className="text-[7.5px] text-[#3A3A52] uppercase tracking-[0.1em]">Kosten {YEARS}J.</p>
                    <p className="text-[13px] font-bold leading-tight" style={{ color: rec ? '#A8BFFF' : '#6B7088' }}>€{r.totalCost}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {savings2 > 0 && (
            <p className="text-[10px] text-[#3E3E52] text-center mb-3">
              2 Ketten: Kassette hält {r2.cassetteEveryYears}J. statt {r1.cassetteEveryYears}J. · ~€{savings2} gespart über {YEARS} Jahre
            </p>
          )}

          <button
            onClick={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full rounded-lg border border-[#5B7AEE]/25 p-2.5 text-center hover:border-[#5B7AEE]/45 transition-colors"
            style={{ background: 'rgba(91,122,238,0.05)' }}
          >
            <span className="text-[12px] font-medium" style={{ color: '#8AAAFF' }}>2. Kette hinzufügen →</span>
          </button>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Reveal wrapper (hook must be in component, not in map) ──────────────────
function RevealSlot({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { ref, style } = useScrollReveal(delay);
  return (
    <div ref={ref} style={{ ...style, willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t } = useLanguage();

  const tools = [
    <RewaxCalculator />,
    <BikeQuestionnaire />,
    <WaxStockCalculator />,
    <CostSavingsCalculator />,
    <RotationROI />,
  ];

  return (
    <section id="tools" className="py-24" style={{ background: '#06060A' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[0.35em] uppercase mb-3 block font-medium" style={{ color: BLUE }}>
              Planungs-Tools
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.tools.title}
            </h2>
            <p className="text-[#52526A] max-w-xl mx-auto text-[15px]">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {tools.map((tool, i) => (
              <RevealSlot key={i} delay={i * 90}>
                {tool}
              </RevealSlot>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
