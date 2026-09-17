import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/data';
import { canCheckout, isSoldOut } from '@/lib/data';
import {
  drivetrainCosts, partsPerYear, applicationsPerBlock, DRIVETRAIN_CLASSES, WAX_SHELF_LIFE_MONTHS,
  OIL_CHAIN_KM, WAX_CHAIN_KM, OIL_CASSETTE_KM, WAX_CASSETTE_KM, OIL_PRICE_PER_APP, OIL_APP_INTERVAL_KM, costPerApplication, referenceWax,
  recommendedChains, type Chains,
} from '@/lib/waxMath';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import type { Weather, Terrain } from '@/lib/ridingProfile';
import { trackCalcComplete, trackEbayClick } from '@/lib/analytics';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Ico, type IcoName } from './Ico';

// ══════════════════════════════════════════════════════════════
// KAPITEL 03 — RECHNET SICH DAS?
// ══════════════════════════════════════════════════════════════
// Dunkles Instrument als Kontrast zum hellen Umfeld. Rechnet ausschliesslich
// mit drivetrainCosts() aus waxMath.ts (eine Quelle fuer die ganze Seite) und
// dem geteilten Fahrprofil (useToolProfile), damit Groessenempfehlung im
// Kaufblock und Rechner nie auseinanderlaufen.
//
// Neu gegenueber SizingInstrument: Antriebsklasse als Eingabe, weil die
// Ersparnis fast nur am Teilepreis haengt; "X Ketten weniger" als greifbares
// Ergebnis; gestapelte Balken zeigen ehrlich, WOHER die Ersparnis kommt
// (Wachs kostet beim Schmierstoff mehr, spart beim Verschleiss).
//
// v5 (14.09.2026): Kettenrotation 1/2/3 mit Empfehlung (waxMath rechnete sie
// schon, sie war nur nicht waehlbar), Verbrauch pro Jahr als Ketten-Glyphen
// statt Tabelle, Kassettentext ohne "alle 1 Jahre", Block-Reichweite nur
// noch einmal im Fuss.

const YEARS = 3;
/** Mehr Glyphen passen nicht sinnvoll in eine Zeile; darueber steht die Zahl. */
const MAX_GLYPHS = 12;

function useCountUp(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(target); from.current = target; return; }
    const start = from.current, t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 500);
      const val = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      setV(val); from.current = val;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function Bar({ label, parts, max, cls, de }: { label: string; parts: number[]; max: number; cls: string; de: boolean }) {
  const names = de ? ['Ketten', 'Kassetten', 'Schmierstoff'] : ['Chains', 'Cassettes', 'Lubricant'];
  const total = parts.reduce((a, b) => a + b, 0);
  return (
    <div className={`wxp-bar-row ${cls}`}>
      <span className="bl">{label}</span>
      <div className="wxp-track">
        {parts.map((p, i) => (
          <div key={i} className={`wxp-seg-b c${i + 1}`} style={{ flexBasis: `${max > 0 ? (p / max) * 100 : 0}%` }}
            title={`${names[i]}: ${Math.round(p)} €`} />
        ))}
        <span className="wxp-tot num">{Math.round(total).toLocaleString(de ? 'de-DE' : 'en-US')} €</span>
      </div>
    </div>
  );
}

/** "So viele Ketten im Jahr": volle Glieder plus ein anteiliges. */
function Glyphs({ n }: { n: number }) {
  const shown = Math.min(n, MAX_GLYPHS);
  const full = Math.floor(shown);
  const frac = shown - full;
  return (
    <span className="gl" aria-hidden>
      {Array.from({ length: full }, (_, i) => <i key={i} className="wxp-link" />)}
      {frac >= 0.05 && <i className="wxp-link part" style={{ ['--p' as string]: `${Math.round(frac * 100)}%` }} />}
      {n > MAX_GLYPHS && <span className="more">+</span>}
    </span>
  );
}

/** Kettenseite: die Antriebsklasse, deren Kassettenpreis zur Kette passt.
 *  M9100 → XTR, M7100 → Deore-Klasse, sonst XT (Richtwert auch fuer 11-fach). */
const classForChain = (p: Product) => {
  const i = DRIVETRAIN_CLASSES.findIndex(c => c.id !== 'xt' && (p.chainModel ?? '').includes(c.model));
  if (i >= 0) return i;
  if ((p.chainModel ?? '').includes('M7100')) return 0;
  return 1;
};

// mode 'chain' (Kettenseite v1, 15.09.2026): gerechnet wird mit dem Preis der
// angesehenen Kette statt einer waehlbaren Antriebsklasse, der Fuss spricht
// vom Nachwachsen statt von der Block-Reichweite.
//
// product optional (Seitenordnung 09/2026, Chat 3): auf /anleitung steht der
// Rechner ohne ein bestimmtes Produkt im Blick — er beantwortet nur "lohnt
// sich das?", nicht "kauf dieses Wachs". Ohne product bleiben Blockreichweite,
// Preis und Kaufknopf aus; Letzterer wird zu einem Link auf /kettenwachs.
export function WaxCalculator({ product, profile, de, onTouch, mode = 'wax', chapter, preselectRotation, anchorId = 'rechner' }: {
  product?: Product; profile: ToolProfileState; de: boolean; onTouch?: () => void; mode?: 'wax' | 'chain'; chapter?: string;
  /** Startet mit der empfohlenen statt mit einer Kette im Wechsel (Deep-Link von /rechner/ersparnis). */
  preselectRotation?: boolean;
  /** ID des Abschnitts fuer Deep-Links. Auf den Produktseiten "rechner"
   *  (unveraendert); auf /anleitung steht der Anker "rechner" fuer den
   *  Rechner-Deck darunter, deshalb dort ein anderer Wert. */
  anchorId?: string;
}) {
  // Narrowt product auf 'chain'-Nutzung: erlaubt TypeScript, product als
  // definiert zu sehen, ohne product-Zugriffe unten mit "!" zu erzwingen.
  const chainProduct = mode === 'chain' && product ? product : undefined;
  const isChain = !!chainProduct;
  const [cls, setCls] = useState(() => chainProduct ? classForChain(chainProduct) : 1);
  const touched = useRef(false);
  const touch = () => { if (!touched.current) { touched.current = true; trackCalcComplete('pdp-savings'); onTouch?.(); } };

  const { weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek, interval } = profile;
  const [chains, setChains] = useState<Chains>(() => preselectRotation ? recommendedChains(interval, kmPerWeek) : 1);
  const kmPerYear = kmPerWeek * 52;
  const cl = DRIVETRAIN_CLASSES[cls];
  // Kettenseite: Kettenpreis = diese Kette, Kassette als Richtwert der Klasse.
  const dc = chainProduct ? { ...cl, chainPrice: chainProduct.price } : cl;
  // Die XT-Kassette steht bei Ketten fuer den Richtwert 11/12-fach, nicht fuer
  // ein XT-Rad (sonst liest die HG701- oder Force-Seite "Richtwert XT").
  const casRef = isChain && cl.id === 'xt' ? (de ? '11/12-fach' : '11/12-speed') : (de ? cl.de : cl.en);
  const costs = drivetrainCosts({ kmPerYear, rewaxKm: interval, chains, chainPrice: dc.chainPrice, cassettePrice: dc.cassettePrice });
  const oil = [costs.breakdown.chain.oil, costs.breakdown.cassette.oil, costs.breakdown.lube.oil].map(x => x * YEARS);
  const wax = [costs.breakdown.chain.wax, costs.breakdown.cassette.wax, costs.breakdown.lube.wax].map(x => x * YEARS);
  const max = Math.max(oil.reduce((a, b) => a + b, 0), wax.reduce((a, b) => a + b, 0));
  const save = Math.round((costs.savingsPerYear * YEARS) / 5) * 5;
  const shown = useCountUp(save);

  // Verbrauch pro Jahr statt "X weniger in 3 Jahren": so rechnet jeder im
  // Kopf nach (Luca, 14.09.2026: "130 km/Woche sind 6.760 km, das sind doch
  // nicht 10 Ketten").
  const parts = partsPerYear(kmPerYear, interval, chains);
  const loc = de ? 'de-DE' : 'en-US';
  const fmt1 = (n: number) => n.toLocaleString(loc, { maximumFractionDigits: 1, minimumFractionDigits: n < 10 ? 1 : 0 });
  // Vorher: Math.round(1/perYear) — 1,25 Jahre wurden zu "alle 1 Jahre", 2,5
  // zu "alle 3 Jahre". Jetzt unter zwei Jahren in Monaten, darueber mit einer
  // Nachkommastelle.
  const casEvery = (perYear: number) => {
    const yrs = perYear > 0 ? 1 / perYear : Infinity;
    if (yrs <= 1) return de ? <><b>{fmt1(perYear)}</b> Kassetten im Jahr</> : <><b>{fmt1(perYear)}</b> cassettes a year</>;
    if (yrs < 2) { const m = Math.round(yrs * 12); return de ? <>alle <b>~{m} Monate</b> eine Kassette</> : <>a cassette every <b>~{m} months</b></>; }
    const y = yrs.toLocaleString(loc, { maximumFractionDigits: 1 });
    return de ? <>alle <b>{y} Jahre</b> eine Kassette</> : <>a cassette every <b>{y} years</b></>;
  };

  const apps = product ? applicationsPerBlock(product) ?? 0 : 0;
  const dipsPerYear = interval > 0 ? kmPerYear / interval : 0;
  const months = dipsPerYear > 0 ? Math.min(WAX_SHELF_LIFE_MONTHS, Math.round((apps / dipsPerYear) * 12)) : WAX_SHELF_LIFE_MONTHS;
  const priceStr = product?.price.toLocaleString(loc, { minimumFractionDigits: 2 });

  // Rotation: wer oefter als etwa einmal pro Woche nachwachsen muesste, faehrt
  // mit zwei Ketten im Wechsel ruhiger (beide in einem Durchgang, halb so
  // viele Termine), unter vier Tagen mit drei. Ein Topf, eine Sitzung.
  // Regel vereinheitlicht mit dem frueheren CostCalculator, siehe waxMath.ts.
  const rewaxDays = kmPerWeek > 0 ? (interval / kmPerWeek) * 7 : Infinity;
  const recommended: Chains = recommendedChains(interval, kmPerWeek);
  const sessionDays = Math.max(1, Math.round(rewaxDays * chains));
  const sessionsPerYear = costs.waxSessionsPerYear;

  const weatherOpts: { v: Weather; icon: IcoName; l: string }[] = [
    { v: 'trocken', icon: 'sun', l: de ? 'Trocken' : 'Dry' },
    { v: 'gemischt', icon: 'cloud', l: de ? 'Gemischt' : 'Mixed' },
    { v: 'nass', icon: 'rain', l: de ? 'Nass' : 'Wet' },
  ];
  const terrainOpts: { v: Terrain; icon: IcoName; l: string }[] = [
    { v: 'strasse', icon: 'road', l: de ? 'Straße' : 'Road' },
    { v: 'gravel', icon: 'gravel', l: 'Gravel' },
    { v: 'mtb', icon: 'mtb', l: 'MTB' },
  ];
  const fmtEur = (n: number) => n.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const chainWord = (n: number) => de ? (n === 1 ? 'Kette' : 'Ketten') : (n === 1 ? 'chain' : 'chains');

  return (
    <section className="wxp-chapter" id={anchorId}>
      {/* Alter Deep-Link von der Startseite (/produkt/wax-500#instrument) */}
      <span id="instrument" aria-hidden />
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{chapter ?? (de ? 'Kapitel 03' : 'Chapter 03')}</p>
          <h2>{de ? 'Rechnet sich das?' : 'Does it pay off?'}</h2>
          <p>{de ? 'Ein paar Angaben zu deinem Fahren. Die Ersparnis kommt aus dem Verschleiß, nicht aus dem Schmierstoff.' : 'A few inputs about your riding. The savings come from wear, not from the lubricant.'}</p>
        </div>
        <div className="wxp-calc-stage">
        <div className="wxp-calc pdp-dark">
          <div className="wxp-c-in">
            <div><p className="eyebrow">{de ? 'Dein Fahrprofil' : 'Your riding'}</p><h3>{de ? 'Wie fährst du meistens?' : 'How do you usually ride?'}</h3></div>
            <div className="wxp-field">
              <div className="fl">{de ? 'Wetter' : 'Weather'}</div>
              <div className="wxp-seg" role="group" aria-label={de ? 'Wetter' : 'Weather'}>
                {weatherOpts.map(o => (
                  <button key={o.v} type="button" aria-pressed={weather === o.v} onClick={() => { setWeather(o.v); touch(); }}>
                    <Ico name={o.icon} />{o.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="wxp-field">
              <div className="fl">{de ? 'Gelände' : 'Terrain'}</div>
              <div className="wxp-seg" role="group" aria-label={de ? 'Gelände' : 'Terrain'}>
                {terrainOpts.map(o => (
                  <button key={o.v} type="button" aria-pressed={terrain === o.v} onClick={() => { setTerrain(o.v); touch(); }}>
                    <Ico name={o.icon} />{o.l}
                  </button>
                ))}
              </div>
            </div>
            {chainProduct ? (
              <div className="wxp-field">
                <div className="fl">{de ? 'Gerechnet mit' : 'Calculated with'}</div>
                <p className="wxp-kmyear" style={{ marginTop: 0, fontSize: 13.5, lineHeight: 1.5 }}>
                  {de
                    ? <>Kette <b style={{ color: '#fff' }}>{chainProduct.chainModel}</b> für {fmtEur(chainProduct.price)} €, Kassette {fmtEur(dc.cassettePrice)} € (Richtwert {casRef})</>
                    : <>Chain <b style={{ color: '#fff' }}>{chainProduct.chainModel}</b> at €{fmtEur(chainProduct.price)}, cassette €{fmtEur(dc.cassettePrice)} (reference {casRef})</>}
                </p>
              </div>
            ) : (
            <div className="wxp-field">
              <div className="fl">{de ? 'Dein Antrieb (Shimano 12-fach)' : 'Your drivetrain (Shimano 12-speed)'}</div>
              <div className="wxp-seg" role="group" aria-label={de ? 'Antriebsklasse' : 'Drivetrain class'}>
                {DRIVETRAIN_CLASSES.map((c, i) => (
                  <button key={c.id} type="button" aria-pressed={cls === i} onClick={() => { setCls(i); touch(); }}>
                    {de ? c.de : c.en}<small>{c.model} · {fmtEur(c.chainPrice)} €</small>
                  </button>
                ))}
              </div>
            </div>
            )}
            <div className="wxp-field">
              <label className="fl" htmlFor="wxp-km">{de ? 'Kilometer pro Woche' : 'Kilometres per week'}
                <span className="wxp-kmv">{kmPerWeek}<small>km</small></span></label>
              <input id="wxp-km" className="wxp-range" type="range" min={20} max={400} step={10} value={kmPerWeek}
                style={{ ['--f' as string]: `${((kmPerWeek - 20) / 380) * 100}%` }}
                onChange={e => { setKmPerWeek(Number(e.target.value)); touch(); }} />
              <div className="wxp-ticks" aria-hidden><span>20</span><span>{de ? 'Pendeln' : 'Commuting'}</span><span>Training</span><span>400</span></div>
              <p className="wxp-kmyear">= {kmPerYear.toLocaleString(loc)} km {de ? 'im Jahr' : 'a year'}</p>
            </div>
            <div className="wxp-field">
              <div className="fl">{de ? 'Ketten im Wechsel' : 'Chains in rotation'}</div>
              <div className="wxp-seg" role="group" aria-label={de ? 'Ketten im Wechsel' : 'Chains in rotation'}>
                {([1, 2, 3] as Chains[]).map(n => (
                  <button key={n} type="button" aria-pressed={chains === n} onClick={() => { setChains(n); touch(); }}>
                    {n}<small>{n === recommended ? (de ? 'empfohlen' : 'suggested') : chainWord(n)}</small>
                  </button>
                ))}
              </div>
              {recommended !== chains && (
                <button type="button" className="wxp-rec" onClick={() => { setChains(recommended); touch(); }}>
                  {recommended > chains
                    ? (de
                      ? <><b>Tipp: {recommended} Ketten im Wechsel.</b> Du müsstest sonst alle {Math.max(1, Math.round(rewaxDays))} Tage wachsen. So wachst du alle {Math.max(1, Math.round(rewaxDays * recommended))} Tage {recommended === 2 ? 'beide' : 'alle drei'} auf einmal.</>
                      : <><b>Tip: rotate {recommended} chains.</b> Otherwise you would wax every {Math.max(1, Math.round(rewaxDays))} days. This way you wax {recommended === 2 ? 'both' : 'all three'} at once every {Math.max(1, Math.round(rewaxDays * recommended))} days.</>)
                    : (de
                      ? <><b>{recommended === 1 ? 'Eine Kette reicht dir.' : `${recommended} Ketten reichen dir.`}</b> Bei deinem Pensum wachst du auch so nur alle {Math.max(1, Math.round(rewaxDays * recommended))} Tage.</>
                      : <><b>{recommended === 1 ? 'One chain is enough.' : `${recommended} chains are enough.`}</b> At your mileage you only wax every {Math.max(1, Math.round(rewaxDays * recommended))} days anyway.</>)}
                </button>
              )}
            </div>
          </div>

          <div className="wxp-c-out">
            <p className="eyebrow">{de ? `Deine Ersparnis in ${YEARS} Jahren · Schätzung` : `Your savings over ${YEARS} years · estimate`}</p>
            <p className="wxp-big" aria-live="polite">≈ {shown.toLocaleString(loc)}<small>€</small></p>
            <p className="wxp-bigk">
              {save >= 20
                ? (de ? <>gegenüber Kettenöl · <b>{costs.savingsPct} % weniger</b> für den Antrieb</> : <>compared with chain oil · <b>{costs.savingsPct} % less</b> on the drivetrain</>)
                : (de ? 'bei so wenig Kilometern etwa gleich teuer, dafür sauber' : 'at this mileage about the same cost, but clean')}
            </p>

            {/* Verbrauch als Glieder statt Tabelle: 4 graue gegen 1,6 blaue
                Ketten sieht man, ohne zu lesen. */}
            <div className="wxp-need" role="table" aria-label={de ? 'Verbrauch pro Jahr' : 'Use per year'}>
              <p className="cap">{de ? 'Pro Jahr verbrauchst du' : 'Per year you use'}</p>
              <div className="wxp-need-row oil" role="row">
                <span className="nl" role="rowheader">{de ? 'Mit Öl' : 'With oil'}</span>
                <span role="cell" className="nw"><Glyphs n={parts.oil.chains} /><span className="nv num">{fmt1(parts.oil.chains)}<small> {chainWord(parts.oil.chains)}</small></span></span>
                <span role="cell" className="nc">{casEvery(parts.oil.cassettes)}</span>
              </div>
              <div className="wxp-need-row wax" role="row">
                <span className="nl" role="rowheader">{de ? 'Mit Wachs' : 'With wax'}</span>
                <span role="cell" className="nw"><Glyphs n={parts.wax.chains} /><span className="nv num">{fmt1(parts.wax.chains)}<small> {chainWord(parts.wax.chains)}</small></span></span>
                <span role="cell" className="nc">{casEvery(parts.wax.cassettes)}</span>
              </div>
            </div>

            <div className="wxp-bars" aria-label={de ? `Kosten über ${YEARS} Jahre` : `Cost over ${YEARS} years`}>
              <Bar label={de ? 'Öl' : 'Oil'} parts={oil} max={max} cls="wxp-oil" de={de} />
              <Bar label={de ? 'Wachs' : 'Wax'} parts={wax} max={max} cls="wxp-wax" de={de} />
            </div>
            <div className="wxp-legend">
              <span><i style={{ background: '#A9C4E6' }} />{de ? 'Ketten' : 'Chains'}</span>
              <span><i style={{ background: '#7AA0CE' }} />{de ? 'Kassetten' : 'Cassettes'}</span>
              <span><i style={{ background: '#4F7DB6' }} />{de ? 'Schmierstoff' : 'Lubricant'}</span>
            </div>
            <details className="wxp-assum">
              <summary>{de ? 'Womit gerechnet wird' : 'What this assumes'}</summary>
              <ul>
                <li>{de
                  ? `Kette: mit Öl ${OIL_CHAIN_KM.toLocaleString('de-DE')} km, mit Wachs ${WAX_CHAIN_KM[chains - 1].toLocaleString('de-DE')} km bis zur Verschleißgrenze${chains > 1 ? ` (${chains} Ketten im Wechsel)` : ''} (Praxiswerte 2.000–3.000 bzw. 6.000–12.000 km, Zero Friction Cycling)`
                  : `Chain: ${OIL_CHAIN_KM.toLocaleString('en-US')} km with oil, ${WAX_CHAIN_KM[chains - 1].toLocaleString('en-US')} km with wax to the wear limit${chains > 1 ? ` (${chains} chains in rotation)` : ''} (typical 2,000–3,000 vs 6,000–12,000 km, Zero Friction Cycling)`}</li>
                <li>{de
                  ? `Kassette: mit Öl ${OIL_CASSETTE_KM.toLocaleString('de-DE')} km, mit Wachs ${WAX_CASSETTE_KM[chains - 1].toLocaleString('de-DE')} km`
                  : `Cassette: ${OIL_CASSETTE_KM.toLocaleString('en-US')} km with oil, ${WAX_CASSETTE_KM[chains - 1].toLocaleString('en-US')} km with wax`}</li>
                <li>{isChain
                  ? (de
                    ? `Teilepreise: Kette ${fmtEur(dc.chainPrice)} € (diese Kette), Kassette ${fmtEur(dc.cassettePrice)} € (Richtwert ${casRef})`
                    : `Part prices: chain €${fmtEur(dc.chainPrice)} (this chain), cassette €${fmtEur(dc.cassettePrice)} (reference ${casRef})`)
                  : (de
                    ? `Teilepreise ${dc.de}: Kette ${fmtEur(dc.chainPrice)} €, Kassette ${fmtEur(dc.cassettePrice)} € (Richtwerte)`
                    : `Part prices ${dc.en}: chain €${fmtEur(dc.chainPrice)}, cassette €${fmtEur(dc.cassettePrice)} (reference values)`)}</li>
                {/* Das Oel-Intervall (50–150 km) und diese Kosten widersprechen
                    sich nicht: der Betrag ist die anteilige Flasche pro
                    1.000 km, nicht der Preis eines Oelgangs. */}
                <li>{de
                  ? `Öl: ~${fmtEur(OIL_PRICE_PER_APP)} € pro ${OIL_APP_INTERVAL_KM.toLocaleString('de-DE')} km (anteilige Flasche) · Wachs ${fmtEur(costPerApplication(referenceWax) ?? 0)} € je Wachsgang (${referenceWax.weight}, ${referenceWax.applications} Gänge)`
                  : `Oil: ~€${fmtEur(OIL_PRICE_PER_APP)} per ${OIL_APP_INTERVAL_KM.toLocaleString('en-US')} km (share of a bottle) · wax €${fmtEur(costPerApplication(referenceWax) ?? 0)} per waxing (${referenceWax.weight}, ${referenceWax.applications} waxings)`}</li>
                <li>{de ? 'Nässe und Gelände verkürzen das Intervall; Öl verschleißt dabei stärker als Wachs (konservativ angesetzt).' : 'Wet and off-road shorten the interval; oil wears faster there than wax (set conservatively).'}</li>
                <li>{de ? 'Weitere Ketten für die Rotation sind als Anschaffung nicht eingerechnet, nur ihr Verschleiß.' : 'Extra chains for rotation are not counted as a purchase, only their wear.'}</li>
                <li>{de ? 'Nicht eingerechnet: Kettenreiniger, Lappen und deine Zeit.' : 'Not included: degreaser, rags and your time.'}</li>
              </ul>
            </details>
            <div className="wxp-calc-spacer" />
            <div className="wxp-c-foot">
              <p>
                {!product
                  ? (de
                    ? <>Wachsen alle <b>{sessionDays} Tage</b>, {sessionsPerYear}× im Jahr</>
                    : <>Wax every <b>{sessionDays} days</b>, {sessionsPerYear}× a year</>)
                  : isChain
                  ? (de
                    ? <>Kommt fahrbereit · danach nachwachsen alle <b>{sessionDays} Tage</b>, {sessionsPerYear}× im Jahr<br />{priceStr} € · Versand kostenlos</>
                    : <>Arrives ready to ride · then rewax every <b>{sessionDays} days</b>, {sessionsPerYear}× a year<br />€{priceStr} · free shipping</>)
                  : (de
                    ? <>Ein Block reicht dir <b>~{months} Monate</b> · wachsen alle <b>{sessionDays} Tage</b>, {sessionsPerYear}× im Jahr<br />{priceStr} € · Versand kostenlos</>
                    : <>One block lasts you <b>~{months} months</b> · wax every <b>{sessionDays} days</b>, {sessionsPerYear}× a year<br />€{priceStr} · free shipping</>)}
              </p>
              {!product
                ? <Link className="wxp-cta" to="/kettenwachs">{de ? 'Wachs wählen →' : 'Choose your wax →'}</Link>
                : !isSoldOut(product) && (canCheckout(product)
                ? <AddToCartButton product={product} />
                : <a className="wxp-cta" href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}>{de ? 'Jetzt bestellen' : 'Order now'}</a>)}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
