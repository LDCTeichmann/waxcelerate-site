// ─── „Deine Kette an deinem Ort" — DWD-Wetter + Post, auf die Kette übersetzt ─
// Holt über api/weather.ts (Bright Sky → DWD) die nächsten 7 Tage, die letzten
// 7 Tage und amtliche Warnungen für einen Ort und macht daraus Aussagen, die
// eine Entscheidung auslösen:
//   1. Wochenstreifen: Wetter, °C, Regenmenge bzw. Regenwahrscheinlichkeit
//   2. Intervall diese Woche — dieselbe 300/150-km-Logik wie cityIntervalKm
//   3. Versand-Tipp: in eine Regenphase hinein einschicken
//   4. Achtung-Kachel nur bei Anlass: DWD-Warnung, Frost (Streusalz)
// Dazu das Rückgabe-Fenster aus dates.ts — rein lokal gerechnet, deshalb auch
// dann da, wenn das Wetter nicht lädt (z. B. im Vite-Dev ohne /api).
//
// Hauptseite: PLZ-Eingabe (erste zwei Ziffern → Leitregion, plzRegions.ts).
// Stadtseiten: fester Ort. Kein Standortzugriff, keine Cookies; die PLZ bleibt
// im localStorage des Besuchers.

import { useEffect, useState } from 'react';
import {
  Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind,
  ArrowRight, AlertTriangle, Clock, MapPin,
} from 'lucide-react';
import { cityIntervalKm, rewaxesPerYear, cardFor } from '@/pages/rewax/cities';
import { eur } from '@/pages/rewax/content';
import { returnWindow, formatWindow, type State } from '@/pages/rewax/dates';
import { regionForPlz, climateReference, PLZ_REGIONS } from '@/pages/rewax/plzRegions';

export interface WaxDay {
  date: string; tMax: number | null; tMin: number | null; rainMm: number; wet: boolean; icon: string;
  rainProb?: number | null;
}
export interface WaxAlert { severity: string; event: string; eventEn: string; headline: string; headlineEn: string; onset: string; expires: string | null }
export interface WaxWeather { days: WaxDay[]; pastWetDays: number; pastRainMm: number; alerts?: WaxAlert[] }

/** `query` ist `stadt=<slug>` oder `lat=..&lon=..`. */
export function useWaxWeather(query: string) {
  const [state, setState] = useState<WaxWeather | null | 'error'>(null);
  useEffect(() => {
    let alive = true;
    setState(null);
    fetch(`/api/weather?${query}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: WaxWeather) => { if (alive) setState(Array.isArray(d?.days) && d.days.length ? d : 'error'); })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [query]);
  return state;
}

const ICONS: Record<string, typeof Sun> = {
  'clear-day': Sun, 'clear-night': Moon, 'partly-cloudy-day': CloudSun, 'partly-cloudy-night': CloudSun,
  cloudy: Cloud, fog: CloudFog, wind: Wind, rain: CloudRain, sleet: CloudSnow, snow: CloudSnow,
  hail: CloudRain, thunderstorm: CloudLightning,
};

// Gleiche Stützwerte wie cityIntervalKm (cities.ts): trocken 300 km, nass 150 km.
function weekIntervalKm(wet: number, total: number) {
  const f = total ? wet / total : 0;
  return Math.round(1 / ((1 - f) / 300 + f / 150) / 10 + 1e-9) * 10;
}

// Erste zusammenhängende Regenphase (≥ 2 nasse Tage in Folge), sonst null.
function firstWetRun(days: WaxDay[]) {
  for (let i = 0; i < days.length - 1; i++) {
    if (days[i].wet && days[i + 1].wet) {
      let j = i + 1;
      while (j + 1 < days.length && days[j + 1].wet) j++;
      return [days[i], days[j]] as const;
    }
  }
  return null;
}

const tile = 'text-[12.5px] leading-relaxed rounded-xl px-3 py-2.5';

/** Rückgabe-Fenster als Satz: „Heute eingeworfen → zurück ca. Di 23.–Do 25.9." */
export function ReturnWindowLine({ state, de, className = '' }: { state: State; de: boolean; className?: string }) {
  const w = returnWindow(new Date(), state);
  const today = new Date();
  const postedToday = w.posted.toDateString() === today.toDateString();
  // Nach der Leerung oder am Wochenende zählt der nächste Werktag: „Morgen
  // eingeworfen" bzw. „Montag eingeworfen" statt eines Satzes, der nach
  // Vergangenheit klingt.
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const postedTomorrow = w.posted.toDateString() === tomorrow.toDateString();
  const wdName = w.posted.toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'long' });
  const posted = postedToday
    ? (de ? 'Heute eingeworfen' : 'Posted today')
    : postedTomorrow
      ? (de ? 'Morgen eingeworfen' : 'Posted tomorrow')
      : (de ? `${wdName} eingeworfen` : `Posted ${wdName}`);
  return (
    <span className={className}>
      {posted} → {de ? 'zurück ca.' : 'back approx.'} <strong className="whitespace-nowrap" style={{ color: 'var(--tx1)' }}>{formatWindow(w, de)}</strong>
    </span>
  );
}

export function WaxWeekView({ data, name, de, state, compact, hideInterval }: {
  data: WaxWeather; name: string; de: boolean; state?: State; compact?: boolean;
  /** Hauptseite: das Intervall steht schon in der linken Karte. */
  hideInterval?: boolean;
}) {
  const loc = de ? 'de-DE' : 'en-GB';
  const wd = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(loc, { weekday: 'short' });
  const wet = data.days.filter((d) => d.wet).length;
  const interval = weekIntervalKm(wet, data.days.length);
  const run = firstWetRun(data.days);
  const maxRain = Math.max(5, ...data.days.map((d) => d.rainMm));
  const alert = data.alerts?.[0];
  const frostDay = data.days.find((d) => d.tMin !== null && d.tMin <= 1);

  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>
          {de ? `Wachs-Woche ${name}` : `Wax week ${name}`}
        </p>
        <p className="text-[12px] sm:text-[11px]" style={{ color: 'var(--txf)' }}>{de ? 'nächste 7 Tage' : 'next 7 days'}</p>
      </div>

      {/* Streifen */}
      <ol className="grid gap-1 mt-3" style={{ gridTemplateColumns: `repeat(${data.days.length}, minmax(0, 1fr))` }}>
        {data.days.map((d, i) => {
          const Icon = ICONS[d.icon] ?? Cloud;
          // Kein Regen gemessen/vorhergesagt, aber eine Wahrscheinlichkeit:
          // die zeigen statt eines leeren Strichs.
          const prob = !d.wet && d.rainProb != null && d.rainProb >= 30 ? d.rainProb : null;
          return (
            <li key={d.date} className="flex flex-col items-center rounded-xl py-2"
              style={{ background: d.wet ? 'var(--accent-wash)' : 'transparent' }}>
              <span className="text-[12px] sm:text-[11px] font-semibold" style={{ color: i === 0 ? 'var(--accent)' : 'var(--txm)' }}>
                {i === 0 ? (de ? 'Heute' : 'Today') : wd(d.date)}
              </span>
              <Icon className="h-5 w-5 my-1.5" style={{ color: d.wet ? 'var(--accent)' : 'var(--tx2)' }} aria-hidden />
              <span className="num text-[12px] font-semibold" style={{ color: 'var(--tx1)' }}>{d.tMax ?? '–'}°</span>
              <span className="num text-[12px] sm:text-[10.5px]" style={{ color: 'var(--txf)' }}>{d.tMin ?? '–'}°</span>
              {!compact && (
                // Regenbalken erst ab sm: mobil trägt die mm-Zahl allein.
                <span className="mt-2 w-2 rounded-full self-center hidden sm:block" aria-hidden
                  style={{ height: 28, background: 'var(--bd2)', position: 'relative', overflow: 'hidden' }}>
                  <span className="absolute inset-x-0 bottom-0 rounded-full"
                    style={{ height: `${Math.min(100, (d.rainMm / maxRain) * 100)}%`, background: 'var(--accent)' }} />
                </span>
              )}
              <span className="num text-[10px] mt-1" style={{ color: d.wet ? 'var(--accent)' : 'var(--txff)' }}>
                {d.rainMm > 0 ? `${d.rainMm.toLocaleString(loc)} mm` : prob ? `${prob} %` : '–'}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Übersetzt auf die Kette */}
      <div className={`mt-4 grid gap-2.5 ${hideInterval ? '' : 'sm:grid-cols-2'}`}>
        {!hideInterval && (
          <p className={tile} style={{ background: 'var(--sf2)', color: 'var(--txm)' }}>
            <strong style={{ color: 'var(--tx1)' }}>{de ? `${wet} nasse ${wet === 1 ? 'Tag' : 'Tage'}` : `${wet} wet ${wet === 1 ? 'day' : 'days'}`}</strong>
            {de
              ? ` — wer diese Woche fährt, braucht nach etwa ${interval} km frisches Wachs (trocken: 300 km).`
              : ` — riding this week, a chain needs fresh wax after about ${interval} km (dry: 300 km).`}
          </p>
        )}
        <p className={tile} style={{ background: 'var(--sf2)', color: 'var(--txm)' }}>
          <strong style={{ color: 'var(--tx1)' }}>{de ? 'Versand-Tipp: ' : 'Shipping tip: '}</strong>
          {run
            ? (de
              ? `Regen ${wd(run[0].date)}${run[0] !== run[1] ? `–${wd(run[1].date)}` : ''}. Schick die Kette davor ab, dann ist sie unterwegs, während es ohnehin nass ist.`
              : `Rain ${wd(run[0].date)}${run[0] !== run[1] ? `–${wd(run[1].date)}` : ''}. Post the chain just before, so it travels while it's wet anyway.`)
            : (de
              ? 'Keine Regenphase in Sicht: die trockenen Tage fahren, danach einschicken.'
              : 'No rainy spell ahead: ride the dry days, then send it in.')}
        </p>
        {state && (
          <p className={`${tile} flex items-start gap-2`} style={{ background: 'var(--sf2)', color: 'var(--txm)' }}>
            <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-[3px]" style={{ color: 'var(--accent)' }} aria-hidden />
            <ReturnWindowLine state={state} de={de} />
          </p>
        )}
        {alert && (
          <p className={`${tile} flex items-start gap-2 sm:col-span-2`}
            style={{ background: 'color-mix(in srgb, var(--danger) 9%, var(--sf))', color: 'var(--txm)' }}>
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-[3px]" style={{ color: 'var(--danger)' }} aria-hidden />
            <span>
              <strong style={{ color: 'var(--tx1)' }}>{de ? 'Amtliche DWD-Warnung: ' : 'Official DWD warning: '}</strong>
              {de ? alert.headline : alert.headlineEn}
              {de ? '. Nasse Kilometer verbrauchen doppelt so viel Wachs.' : '. Wet kilometres use up wax twice as fast.'}
            </span>
          </p>
        )}
        {!alert && frostDay && (
          <p className={`${tile} flex items-start gap-2 sm:col-span-2`} style={{ background: 'var(--accent-wash)', color: 'var(--txm)' }}>
            <CloudSnow className="h-3.5 w-3.5 flex-shrink-0 mt-[3px]" style={{ color: 'var(--accent)' }} aria-hidden />
            <span>
              <strong style={{ color: 'var(--tx1)' }}>{de ? `Frost ab ${wd(frostDay.date)}: ` : `Frost from ${wd(frostDay.date)}: `}</strong>
              {de
                ? 'Jetzt wird gestreut. Auf gesalzenen Straßen die Kette lieber früher auffrischen, bevor sie trocken klingt.'
                : 'Gritting season. On salted roads, rewax a little earlier, before the chain sounds dry.'}
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
          {de
            ? `Letzte 7 Tage: ${data.pastWetDays} ${data.pastWetDays === 1 ? 'nasser Tag' : 'nasse Tage'}, ${data.pastRainMm.toLocaleString(loc)} mm.`
            : `Last 7 days: ${data.pastWetDays} wet ${data.pastWetDays === 1 ? 'day' : 'days'}, ${data.pastRainMm} mm.`}
          {data.pastWetDays >= 2 && (de ? ' Klingt die Kette schon trocken?' : ' Does the chain sound dry already?')}
        </p>
        {data.pastWetDays >= 2 && (
          <a href="#rewax-form" className="inline-flex items-center gap-1 py-2 -my-2 text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>
            {de ? 'Jetzt anmelden' : 'Book now'} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <p className="text-[12px] sm:text-[10.5px] mt-3" style={{ color: 'var(--txff)' }}>
        {de ? 'Wetterdaten und Warnungen: Deutscher Wetterdienst (DWD), über Bright Sky. Stündlich aktualisiert.' : 'Weather data and warnings: Deutscher Wetterdienst (DWD), via Bright Sky. Updated hourly.'}
      </p>
    </div>
  );
}

// Bundesland je Stadtseite — für die Feiertage im Rückgabe-Fenster.
const CITY_STATE: Record<string, State> = {
  hamburg: 'HH', berlin: 'BE', muenchen: 'BY', koeln: 'NW', frankfurt: 'HE', leipzig: 'SN',
  dresden: 'SN', hannover: 'NI', nuernberg: 'BY', duesseldorf: 'NW', freiburg: 'BW', stuttgart: 'BW',
};

/** Stadtseite: Block für eine feste Stadt, verschwindet ohne Daten. */
export function WaxWeek({ slug, name, de }: { slug: string; name: string; de: boolean }) {
  const data = useWaxWeather(`stadt=${slug}`);
  if (!data || data === 'error') return null;
  return <div className="mt-8 max-w-[720px]"><WaxWeekView data={data} name={name} de={de} state={CITY_STATE[slug]} /></div>;
}

// ─── Hauptseite: PLZ-Werkzeug ───────────────────────────────────────────────
const PLZ_KEY = 'wx-rewax-plz';
const DEFAULT_REGION = PLZ_REGIONS['70']; // Stuttgart, bis jemand seine PLZ tippt

function readPlz() {
  try { return localStorage.getItem(PLZ_KEY) ?? ''; } catch { return ''; }
}

export function LocalChainTool({ de }: { de: boolean }) {
  const [plz, setPlz] = useState('');
  const [km, setKm] = useState(3000);
  useEffect(() => { setPlz(readPlz()); }, []);

  const typed = plz.length >= 2 ? regionForPlz(plz) : null;
  const unknown = plz.length >= 2 && !typed;
  const region = typed ?? DEFAULT_REGION;
  // Koordinaten in Hundertsteln, ohne Punkt: sonst liest der Vite-Dev-Server
  // „…lon=9.18" als Dateiendung „.18" und wirft ein Fehler-Overlay.
  const data = useWaxWeather(`lat=${Math.round(region.lat * 100)}&lon=${Math.round(region.lon * 100)}`);
  const ref = climateReference(region);
  const n = rewaxesPerYear(ref, km);
  const card = cardFor(n);

  const onPlz = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 5);
    setPlz(digits);
    try { if (digits.length === 5) localStorage.setItem(PLZ_KEY, digits); } catch { /* privat/blockiert */ }
  };

  return (
    <section id="dein-ort" className="scroll-mt-24 py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{de ? 'Dein Ort' : 'Your area'}</p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight"
          style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', letterSpacing: '-0.02em' }}>
          {de ? 'Was deine Kette bei dir erwartet.' : 'What your chain faces where you live.'}
        </h2>

        <div className="mt-6 grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5 lg:gap-8 items-start">
          {/* Links: PLZ + Zahlen, die ohne Wetter-API auskommen */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.18)' }}>
            <label htmlFor="rewax-plz" className="text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>
              {de ? 'Deine Postleitzahl' : 'Your postcode'}
            </label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--txf)' }} aria-hidden />
              <input id="rewax-plz" type="text" inputMode="numeric" autoComplete="postal-code" maxLength={5}
                value={plz} onChange={(e) => onPlz(e.target.value)} placeholder="z. B. 50667"
                aria-describedby="rewax-plz-hint"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-base sm:text-sm outline-none num"
                style={{ background: 'var(--sf)', border: `1px solid ${unknown ? 'var(--danger)' : 'var(--bd2)'}`, color: 'var(--tx1)' }} />
            </div>
            <p id="rewax-plz-hint" className="text-[12px] mt-1.5" style={{ color: unknown ? 'var(--danger)' : 'var(--txf)' }} aria-live="polite">
              {unknown
                ? (de ? 'Diese PLZ kennen wir nicht.' : "We don't know that postcode.")
                : typed
                  ? (de ? `Region ${region.name}` : `${region.name} area`)
                  : plz.length === 1
                    ? (de ? 'Eine Ziffer noch, dann kennen wir deine Region.' : 'One more digit and we know your area.')
                    : (de ? `Solange nichts drinsteht: ${DEFAULT_REGION.name}` : `Until you type one: ${DEFAULT_REGION.name}`)}
            </p>

            <div className="mt-5 pt-4 space-y-4" style={{ borderTop: '1px solid rgba(var(--accent-rgb),0.18)' }}>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--txf)' }}>{de ? 'Rückgabe' : 'Back with you'}</p>
                <p className="text-[13.5px] leading-snug mt-1" style={{ color: 'var(--txm)' }}>
                  <ReturnWindowLine state={region.state} de={de} />
                </p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--txf)' }}>{de ? 'Nachwachsen' : 'Rewax'}</p>
                <p className="text-[13.5px] leading-snug mt-1" style={{ color: 'var(--txm)' }}>
                  {de ? 'Etwa alle ' : 'Roughly every '}
                  <strong style={{ color: 'var(--tx1)' }}>{cityIntervalKm(ref)} km</strong>
                  {de ? ', bei ' : ', at '}
                  <select value={km} onChange={(e) => setKm(Number(e.target.value))}
                    aria-label={de ? 'Kilometer im Jahr' : 'Kilometres a year'}
                    className="num font-semibold bg-transparent underline underline-offset-2 cursor-pointer outline-none"
                    style={{ color: 'var(--tx1)' }}>
                    {[1500, 3000, 5000, 8000].map((v) => (
                      <option key={v} value={v}>{v.toLocaleString(de ? 'de-DE' : 'en-US')} km</option>
                    ))}
                  </select>
                  {de ? ` im Jahr ${n} Auffrischungen.` : ` a year that's ${n} rewaxes.`}
                  {card && (
                    <>
                      {' '}
                      <a href="#geschenk" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent)' }}>
                        {de ? `${card.count}er-Karte: ${eur(card.price / card.count, de)} je Mal` : `${card.count}-card: ${eur(card.price / card.count, de)} each`}
                      </a>
                    </>
                  )}
                </p>
                <p className="text-[12px] sm:text-[11px] mt-1.5" style={{ color: 'var(--txff)' }}>
                  {de
                    ? `Klima-Referenz: DWD-Station ${ref.dwdStation}, ${ref.wetDays} Regentage im Jahr (Mittel 1991–2020).`
                    : `Climate reference: DWD station ${ref.dwdStation}, ${ref.wetDays} rain days a year (1991–2020 mean).`}
                </p>
              </div>
            </div>
          </div>

          {/* Rechts: die Woche */}
          <div style={{ minHeight: 220 }}>
            {data && data !== 'error'
              ? <WaxWeekView data={data} name={region.name} de={de} hideInterval />
              : (
                <div className="rounded-2xl p-5 text-[13px]" style={{ background: 'var(--sf)', border: '1px solid var(--bd)', color: 'var(--txf)' }}>
                  {data === 'error'
                    ? (de ? 'Die Wettervorschau ist gerade nicht erreichbar. Rückgabe und Intervall links gelten trotzdem.' : 'The forecast is unavailable right now. Return date and interval on the left still apply.')
                    : (de ? 'Wetter lädt …' : 'Loading weather …')}
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}
