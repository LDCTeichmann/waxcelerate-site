import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/data';
import { canCheckout, isSoldOut } from '@/lib/data';
import {
  drivetrainCosts, partsSaved, applicationsPerBlock, DRIVETRAIN_CLASSES, WAX_SHELF_LIFE_MONTHS,
  OIL_CHAIN_KM, WAX_CHAIN_KM, OIL_CASSETTE_KM, WAX_CASSETTE_KM, OIL_PRICE_PER_APP, OIL_APP_INTERVAL_KM, costPerApplication, referenceWax,
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

const YEARS = 3;

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

export function WaxCalculator({ product, profile, de }: { product: Product; profile: ToolProfileState; de: boolean }) {
  const [cls, setCls] = useState(1);
  const touched = useRef(false);
  const touch = () => { if (!touched.current) { touched.current = true; trackCalcComplete('pdp-savings'); } };

  const { weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek, interval } = profile;
  const kmPerYear = kmPerWeek * 52;
  const dc = DRIVETRAIN_CLASSES[cls];
  const costs = drivetrainCosts({ kmPerYear, rewaxKm: interval, chains: 1, chainPrice: dc.chainPrice, cassettePrice: dc.cassettePrice });
  const oil = [costs.breakdown.chain.oil, costs.breakdown.cassette.oil, costs.breakdown.lube.oil].map(x => x * YEARS);
  const wax = [costs.breakdown.chain.wax, costs.breakdown.cassette.wax, costs.breakdown.lube.wax].map(x => x * YEARS);
  const max = Math.max(oil.reduce((a, b) => a + b, 0), wax.reduce((a, b) => a + b, 0));
  const save = Math.round((costs.savingsPerYear * YEARS) / 5) * 5;
  const shown = useCountUp(save);

  const saved = partsSaved(kmPerYear * YEARS, interval);
  const fewerChains = saved.chains;
  const fewerCas = saved.cassettes;
  const fmt1 = (n: number) => (n < 1 ? n.toFixed(1).replace('.', de ? ',' : '.') : String(Math.round(n)));

  const apps = applicationsPerBlock(product) ?? 0;
  const perYear = interval > 0 ? kmPerYear / interval : 0;
  const months = perYear > 0 ? Math.min(WAX_SHELF_LIFE_MONTHS, Math.round((apps / perYear) * 12)) : WAX_SHELF_LIFE_MONTHS;
  const priceStr = product.price.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2 });

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
  const fmtEur = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="wxp-chapter" id="rechner">
      {/* Alter Deep-Link von der Startseite (/produkt/wax-500#instrument) */}
      <span id="instrument" aria-hidden />
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{de ? 'Kapitel 03' : 'Chapter 03'}</p>
          <h2>{de ? 'Rechnet sich das?' : 'Does it pay off?'}</h2>
          <p>{de ? 'Vier Angaben zu deinem Fahren. Die Ersparnis kommt aus dem Verschleiß, nicht aus dem Schmierstoff.' : 'Four inputs about your riding. The savings come from wear, not from the lubricant.'}</p>
        </div>
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
            <div className="wxp-field">
              <div className="fl">{de ? 'Dein Antrieb' : 'Your drivetrain'}</div>
              <div className="wxp-seg" role="group" aria-label={de ? 'Antriebsklasse' : 'Drivetrain class'}>
                {DRIVETRAIN_CLASSES.map((c, i) => (
                  <button key={c.id} type="button" aria-pressed={cls === i} onClick={() => { setCls(i); touch(); }}>
                    {de ? c.de : c.en}<small>{de ? 'Kette' : 'Chain'} ~{Math.round(c.chainPrice)} €</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="wxp-field">
              <label className="fl" htmlFor="wxp-km">{de ? 'Kilometer pro Woche' : 'Kilometres per week'}
                <span className="wxp-kmv">{kmPerWeek}<small>km</small></span></label>
              <input id="wxp-km" className="wxp-range" type="range" min={20} max={400} step={10} value={kmPerWeek}
                style={{ ['--f' as string]: `${((kmPerWeek - 20) / 380) * 100}%` }}
                onChange={e => { setKmPerWeek(Number(e.target.value)); touch(); }} />
              <div className="wxp-ticks" aria-hidden><span>20</span><span>{de ? 'Pendeln' : 'Commuting'}</span><span>Training</span><span>400</span></div>
              <p className="wxp-kmyear">= {kmPerYear.toLocaleString(de ? 'de-DE' : 'en-US')} km {de ? 'im Jahr' : 'a year'}</p>
            </div>
          </div>

          <div className="wxp-c-out">
            <p className="eyebrow">{de ? `Deine Ersparnis in ${YEARS} Jahren · Schätzung` : `Your savings over ${YEARS} years · estimate`}</p>
            <p className="wxp-big" aria-live="polite">≈ {shown.toLocaleString(de ? 'de-DE' : 'en-US')}<small>€</small></p>
            <p className="wxp-bigk">
              {save >= 20
                ? (de ? <>gegenüber Kettenöl · <b>{costs.savingsPct} % weniger</b> für den Antrieb</> : <>compared with chain oil · <b>{costs.savingsPct} % less</b> on the drivetrain</>)
                : (de ? 'bei so wenig Kilometern etwa gleich teuer, dafür sauber' : 'at this mileage about the same cost, but clean')}
            </p>
            <div className="wxp-fewer">
              <div><b className="num">{fmt1(fewerChains)}</b><span>{de ? <>Ketten<br />weniger</> : <>fewer<br />chains</>}</span></div>
              <div><b className="num">{fmt1(fewerCas)}</b><span>{de ? <>Kassetten<br />weniger</> : <>fewer<br />cassettes</>}</span></div>
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
            <div className="wxp-pills">
              <span>{de ? 'Intervall' : 'Interval'} <b>{interval} km</b></span>
              <span><b>{Math.max(1, Math.round(perYear))}×</b> {de ? 'wachsen / Jahr' : 'waxings / year'}</span>
              <span>{de ? 'Block reicht' : 'Block lasts'} <b>{months} {de ? 'Monate' : 'months'}</b></span>
            </div>
            <details className="wxp-assum">
              <summary>{de ? 'Womit gerechnet wird' : 'What this assumes'}</summary>
              <ul>
                <li>{de
                  ? `Kette: mit Öl ${OIL_CHAIN_KM.toLocaleString('de-DE')} km, mit Wachs ${WAX_CHAIN_KM[0].toLocaleString('de-DE')} km bis zur Verschleißgrenze (Praxiswerte 2.000–3.000 bzw. 6.000–12.000 km, Zero Friction Cycling)`
                  : `Chain: ${OIL_CHAIN_KM.toLocaleString('en-US')} km with oil, ${WAX_CHAIN_KM[0].toLocaleString('en-US')} km with wax to the wear limit (typical 2,000–3,000 vs 6,000–12,000 km, Zero Friction Cycling)`}</li>
                <li>{de
                  ? `Kassette: mit Öl ${OIL_CASSETTE_KM.toLocaleString('de-DE')} km, mit Wachs ${WAX_CASSETTE_KM[0].toLocaleString('de-DE')} km`
                  : `Cassette: ${OIL_CASSETTE_KM.toLocaleString('en-US')} km with oil, ${WAX_CASSETTE_KM[0].toLocaleString('en-US')} km with wax`}</li>
                <li>{de
                  ? `Teilepreise ${dc.de}: Kette ${fmtEur(dc.chainPrice)} €, Kassette ${fmtEur(dc.cassettePrice)} € (Richtwerte)`
                  : `Part prices ${dc.en}: chain €${fmtEur(dc.chainPrice)}, cassette €${fmtEur(dc.cassettePrice)} (reference values)`}</li>
                <li>{de
                  ? `Öl ${fmtEur(OIL_PRICE_PER_APP)} € je ${OIL_APP_INTERVAL_KM.toLocaleString('de-DE')} km · Wachs ${fmtEur(costPerApplication(referenceWax) ?? 0)} € je Wachsgang (${referenceWax.weight}, ${referenceWax.applications} Gänge)`
                  : `Oil €${fmtEur(OIL_PRICE_PER_APP)} per ${OIL_APP_INTERVAL_KM.toLocaleString('en-US')} km · wax €${fmtEur(costPerApplication(referenceWax) ?? 0)} per waxing (${referenceWax.weight}, ${referenceWax.applications} waxings)`}</li>
                <li>{de ? 'Nässe und Gelände verkürzen das Intervall; Öl verschleißt dabei stärker als Wachs (konservativ angesetzt).' : 'Wet and off-road shorten the interval; oil wears faster there than wax (set conservatively).'}</li>
                <li>{de ? 'Nicht eingerechnet: Kettenreiniger, Lappen und deine Zeit.' : 'Not included: degreaser, rags and your time.'}</li>
              </ul>
            </details>
            <div className="wxp-calc-spacer" />
            <div className="wxp-c-foot">
              <p>{de ? <>Für dein Profil reicht ein Block <b>~{months} Monate</b>.<br />{priceStr} € · Versand kostenlos</> : <>For your riding one block lasts <b>~{months} months</b>.<br />€{priceStr} · free shipping</>}</p>
              {!isSoldOut(product) && (canCheckout(product)
                ? <AddToCartButton product={product} />
                : <a className="wxp-cta" href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}>{de ? 'Jetzt bestellen' : 'Order now'}</a>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
