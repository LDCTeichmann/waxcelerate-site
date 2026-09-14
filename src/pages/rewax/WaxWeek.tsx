// ─── „Deine Wachs-Woche" — DWD-Wetter, auf die Kette übersetzt ──────────────
// Holt über api/weather.ts (Bright Sky → DWD) die nächsten 7 Tage und die
// letzten 7 Tage einer Stadt und macht daraus drei Aussagen:
//   1. Wochenstreifen: Wetter, °C, Regenmenge je Tag
//   2. Intervall diese Woche — dieselbe 300/150-km-Logik wie cityIntervalKm
//   3. Versand-Tipp: in eine Regenphase hinein einschicken, dann verpasst man
//      keine guten Fahrtage; Rückblick „letzte 7 Tage nass" als Anlass.
// Kein Standortzugriff, keine Cookies. Schlägt der Abruf fehl (auch im
// Vite-Dev-Server ohne /api), rendert nichts.

import { useEffect, useState } from 'react';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind, ArrowRight } from 'lucide-react';
import { REWAX_CITIES } from '@/pages/rewax/cities';

export interface WaxDay { date: string; tMax: number | null; tMin: number | null; rainMm: number; wet: boolean; icon: string }
export interface WaxWeather { days: WaxDay[]; pastWetDays: number; pastRainMm: number }

export function useWaxWeather(slug: string) {
  const [state, setState] = useState<WaxWeather | null | 'error'>(null);
  useEffect(() => {
    let alive = true;
    setState(null);
    fetch(`/api/weather?stadt=${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: WaxWeather) => { if (alive) setState(Array.isArray(d?.days) && d.days.length ? d : 'error'); })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [slug]);
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
  return Math.round(1 / ((1 - f) / 300 + f / 150) / 10) * 10;
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

export function WaxWeekView({ data, name, de, compact }: { data: WaxWeather; name: string; de: boolean; compact?: boolean }) {
  const loc = de ? 'de-DE' : 'en-GB';
  const wd = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(loc, { weekday: 'short' });
  const wet = data.days.filter((d) => d.wet).length;
  const interval = weekIntervalKm(wet, data.days.length);
  const run = firstWetRun(data.days);
  const maxRain = Math.max(5, ...data.days.map((d) => d.rainMm));

  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>
          {de ? `Wachs-Woche ${name}` : `Wax week ${name}`}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--txf)' }}>{de ? 'nächste 7 Tage' : 'next 7 days'}</p>
      </div>

      {/* Streifen */}
      <ol className="grid gap-1 mt-3" style={{ gridTemplateColumns: `repeat(${data.days.length}, minmax(0, 1fr))` }}>
        {data.days.map((d, i) => {
          const Icon = ICONS[d.icon] ?? Cloud;
          return (
            <li key={d.date} className="flex flex-col items-center rounded-xl py-2"
              style={{ background: d.wet ? 'var(--accent-wash)' : 'transparent' }}>
              <span className="text-[11px] font-semibold" style={{ color: i === 0 ? 'var(--accent)' : 'var(--txm)' }}>
                {i === 0 ? (de ? 'Heute' : 'Today') : wd(d.date)}
              </span>
              <Icon className="h-5 w-5 my-1.5" style={{ color: d.wet ? 'var(--accent)' : 'var(--tx2)' }} aria-hidden />
              <span className="num text-[12px] font-semibold" style={{ color: 'var(--tx1)' }}>{d.tMax ?? '–'}°</span>
              <span className="num text-[10.5px]" style={{ color: 'var(--txf)' }}>{d.tMin ?? '–'}°</span>
              {!compact && (
                <span className="mt-2 w-2 rounded-full self-center" aria-hidden
                  style={{ height: 28, background: 'var(--bd2)', position: 'relative', overflow: 'hidden' }}>
                  <span className="absolute inset-x-0 bottom-0 rounded-full"
                    style={{ height: `${Math.min(100, (d.rainMm / maxRain) * 100)}%`, background: 'var(--accent)' }} />
                </span>
              )}
              <span className="num text-[10px] mt-1" style={{ color: d.wet ? 'var(--accent)' : 'var(--txff)' }}>
                {d.rainMm > 0 ? `${d.rainMm.toLocaleString(loc)} mm` : '–'}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Übersetzt auf die Kette */}
      <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
        <p className="text-[12.5px] leading-relaxed rounded-xl px-3 py-2.5" style={{ background: 'var(--sf2)', color: 'var(--txm)' }}>
          <strong style={{ color: 'var(--tx1)' }}>{de ? `${wet} nasse ${wet === 1 ? 'Tag' : 'Tage'}` : `${wet} wet ${wet === 1 ? 'day' : 'days'}`}</strong>
          {de
            ? ` — wer diese Woche fährt, braucht nach etwa ${interval} km frisches Wachs (trocken: 300 km).`
            : ` — riding this week, a chain needs fresh wax after about ${interval} km (dry: 300 km).`}
        </p>
        <p className="text-[12.5px] leading-relaxed rounded-xl px-3 py-2.5" style={{ background: 'var(--sf2)', color: 'var(--txm)' }}>
          <strong style={{ color: 'var(--tx1)' }}>{de ? 'Versand-Tipp: ' : 'Shipping tip: '}</strong>
          {run
            ? (de
              ? `Regen ${wd(run[0].date)}${run[0] !== run[1] ? `–${wd(run[1].date)}` : ''}. Schick die Kette davor ab, dann ist sie unterwegs, während es ohnehin nass ist.`
              : `Rain ${wd(run[0].date)}${run[0] !== run[1] ? `–${wd(run[1].date)}` : ''}. Post the chain just before, so it travels while it's wet anyway.`)
            : (de
              ? 'Keine Regenphase in Sicht: die trockenen Tage fahren, danach einschicken.'
              : 'No rainy spell ahead: ride the dry days, then send it in.')}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
          {de
            ? `Letzte 7 Tage: ${data.pastWetDays} ${data.pastWetDays === 1 ? 'nasser Tag' : 'nasse Tage'}, ${data.pastRainMm.toLocaleString(loc)} mm.`
            : `Last 7 days: ${data.pastWetDays} wet ${data.pastWetDays === 1 ? 'day' : 'days'}, ${data.pastRainMm} mm.`}
          {data.pastWetDays >= 2 && (de ? ' Klingt die Kette schon trocken?' : ' Does the chain sound dry already?')}
        </p>
        {data.pastWetDays >= 2 && (
          <a href="#rewax-form" className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>
            {de ? 'Jetzt anmelden' : 'Book now'} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <p className="text-[10.5px] mt-3" style={{ color: 'var(--txff)' }}>
        {de ? 'Wetterdaten: Deutscher Wetterdienst (DWD), über Bright Sky. Stündlich aktualisiert.' : 'Weather data: Deutscher Wetterdienst (DWD), via Bright Sky. Updated hourly.'}
      </p>
    </div>
  );
}

/** Stadtseite: Block für eine feste Stadt, verschwindet ohne Daten. */
export function WaxWeek({ slug, name, de }: { slug: string; name: string; de: boolean }) {
  const data = useWaxWeather(slug);
  if (!data || data === 'error') return null;
  return <div className="mt-8 max-w-[720px]"><WaxWeekView data={data} name={name} de={de} /></div>;
}

/** Hauptseite: Städteauswahl + Wachs-Woche. Ganze Sektion bleibt weg, wenn
 *  die erste Abfrage scheitert (z. B. lokal ohne /api). */
export function WaxWeatherPicker({ de }: { de: boolean }) {
  const [slug, setSlug] = useState('stuttgart');
  const data = useWaxWeather(slug);
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    if (data === 'error' && available === null) setAvailable(false);
    else if (data && data !== 'error') setAvailable(true);
  }, [data, available]);
  if (available === false) return null;
  const city = REWAX_CITIES.find((c) => c.slug === slug)!;

  return (
    <section className="py-14 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }} hidden={available === null && !data}>
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{de ? 'Wachs-Wetter' : 'Wax weather'}</p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight"
          style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', letterSpacing: '-0.02em' }}>
          {de ? 'Was diese Woche mit deiner Kette passiert.' : 'What this week does to your chain.'}
        </h2>
        <div className="flex flex-wrap gap-1.5 mt-5 mb-5" role="radiogroup" aria-label={de ? 'Stadt' : 'City'}>
          {REWAX_CITIES.map((c) => (
            <button key={c.slug} type="button" role="radio" aria-checked={slug === c.slug} onClick={() => setSlug(c.slug)}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors"
              style={{
                background: slug === c.slug ? 'var(--accent)' : 'var(--sf)',
                color: slug === c.slug ? '#fff' : 'var(--tx2)',
                border: `1px solid ${slug === c.slug ? 'var(--accent)' : 'var(--bd2)'}`,
              }}>
              {de ? c.name : c.nameEn}
            </button>
          ))}
        </div>
        <div className="max-w-[720px]" style={{ minHeight: 260 }}>
          {data && data !== 'error'
            ? <WaxWeekView data={data} name={de ? city.name : city.nameEn} de={de} />
            : <p className="text-[13px]" style={{ color: 'var(--txf)' }}>{data === 'error' ? (de ? 'Wetter gerade nicht verfügbar.' : 'Weather unavailable right now.') : (de ? 'Lädt …' : 'Loading …')}</p>}
        </div>
      </div>
    </section>
  );
}
