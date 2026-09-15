import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/weather?stadt=<slug>  oder  ?lat=<..>&lon=<..>
 * „Deine Kette an deinem Ort" auf /kette-wachsen-lassen (PLZ-Eingabe → die
 * Seite schickt die Koordinaten der PLZ-Leitregion, src/pages/rewax/plzRegions.ts)
 * und die Wachs-Woche der Stadtseiten (`stadt`).
 *
 * Quelle: Bright Sky (api.brightsky.dev, MIT), das die offenen Daten des
 * Deutschen Wetterdienstes ausliefert — Vorhersage (MOSMIX), die letzten Tage
 * und die amtlichen Unwetterwarnungen (/alerts). DWD-Daten: CC BY 4.0,
 * kommerziell nutzbar mit Quellenvermerk. Open-Meteo ist für kommerzielle
 * Seiten nicht erlaubt und deshalb bewusst NICHT die Quelle.
 *
 * Proxy statt Direktabruf im Browser: die Besucher-IP geht an niemanden außer
 * uns. Koordinaten werden auf zwei Stellen gerundet und auf Deutschland
 * begrenzt — die Seite schickt ohnehin nur die 95 Regionspunkte, der Edge-Cache
 * (1 Stunde) hält also je Region einen Abruf.
 *
 * Städte-Koordinaten gespiegelt aus src/pages/rewax/cities.ts — bewusst inline,
 * weil api/ außerhalb der src-tsconfig liegt (gleiches Muster wie rewax-request.ts).
 */
const COORDS: Record<string, [number, number]> = {
  hamburg: [53.55, 9.99], berlin: [52.52, 13.40], muenchen: [48.14, 11.58], koeln: [50.94, 6.96],
  frankfurt: [50.11, 8.68], leipzig: [51.34, 12.37], dresden: [51.05, 13.74], hannover: [52.37, 9.74],
  nuernberg: [49.45, 11.08], duesseldorf: [51.23, 6.78], freiburg: [47.99, 7.85], stuttgart: [48.78, 9.18],
};

interface Hour {
  timestamp: string; precipitation: number | null; temperature: number | null; icon: string | null;
  precipitation_probability: number | null;
}
interface Alert { category: string; severity: string; event_de: string; event_en: string; headline_de: string; headline_en: string; onset: string; expires: string | null }

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const round2 = (n: number) => Math.round(n * 100) / 100;

// `lat`/`lon` kommen in Hundertstel Grad als ganze Zahl (4878 = 48,78°): ein
// Punkt in der Query ließe den Vite-Dev-Server „.18" als Dateiendung lesen.
function coordsFrom(q: VercelRequest['query']): [number, number] | null {
  if (typeof q.stadt === 'string') return COORDS[q.stadt] ?? null;
  if (typeof q.lat !== 'string' || typeof q.lon !== 'string' || !/^\d{3,4}$/.test(q.lat) || !/^\d{3,4}$/.test(q.lon)) return null;
  const lat = Number(q.lat) / 100, lon = Number(q.lon) / 100;
  if (lat < 47.2 || lat > 55.1 || lon < 5.8 || lon > 15.1) return null;
  return [round2(lat), round2(lon)];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const coords = coordsFrom(req.query);
  if (!coords) return res.status(404).json({ error: 'unknown location' });

  const now = new Date();
  const from = new Date(now.getTime() - 7 * 864e5);
  const to = new Date(now.getTime() + 7 * 864e5);
  const url = `https://api.brightsky.dev/weather?lat=${coords[0]}&lon=${coords[1]}`
    + `&date=${ymd(from)}&last_date=${ymd(to)}&tz=Europe%2FBerlin`;
  const alertsUrl = `https://api.brightsky.dev/alerts?lat=${coords[0]}&lon=${coords[1]}&tz=Europe%2FBerlin`;

  try {
    // Warnungen sind Beiwerk: scheitert der Abruf, gibt es eben keine.
    const [r, alertsRes] = await Promise.all([
      fetch(url, { headers: { Accept: 'application/json' } }),
      fetch(alertsUrl, { headers: { Accept: 'application/json' } }).catch(() => null),
    ]);
    if (!r.ok) throw new Error(`brightsky ${r.status}`);
    const { weather } = await r.json() as { weather: Hour[] };

    // Stundenwerte je Ortsdatum (Zeitstempel kommen mit Europe/Berlin-Offset).
    const byDay = new Map<string, Hour[]>();
    for (const h of weather) {
      const day = h.timestamp.slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(h);
    }
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(now);

    const summarize = (date: string, hours: Hour[]) => {
      const temps = hours.map((h) => h.temperature).filter((t): t is number => t !== null);
      const rainMm = Math.round(hours.reduce((s, h) => s + (h.precipitation ?? 0), 0) * 10) / 10;
      const probs = hours.map((h) => h.precipitation_probability).filter((p): p is number => p !== null);
      // Tagsymbol: häufigstes Symbol zwischen 8 und 20 Uhr, Regen gewinnt ab 1 mm.
      const counts = new Map<string, number>();
      for (const h of hours) {
        const hr = Number(h.timestamp.slice(11, 13));
        if (h.icon && hr >= 8 && hr <= 20) counts.set(h.icon, (counts.get(h.icon) ?? 0) + 1);
      }
      const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'cloudy';
      return {
        date,
        tMax: temps.length ? Math.round(Math.max(...temps)) : null,
        tMin: temps.length ? Math.round(Math.min(...temps)) : null,
        rainMm,
        wet: rainMm >= 1,
        // Höchste stündliche Regenwahrscheinlichkeit des Tages (nur Vorhersage).
        rainProb: probs.length ? Math.max(...probs) : null,
        icon: rainMm >= 1 && !/thunder|snow|sleet|hail/.test(common) ? 'rain' : common,
      };
    };

    const dates = [...byDay.keys()].sort();
    const past = dates.filter((d) => d < today).slice(-7).map((d) => summarize(d, byDay.get(d)!));
    // Nur Tage mit (fast) vollem Stundensatz, damit ein angeschnittener
    // letzter Tag nicht als „trocken" durchgeht.
    const next = dates.filter((d) => d >= today && byDay.get(d)!.length >= 20).slice(0, 7)
      .map((d) => summarize(d, byDay.get(d)!));
    if (next.length < 3) throw new Error('forecast too short');

    let alerts: { severity: string; event: string; eventEn: string; headline: string; headlineEn: string; onset: string; expires: string | null }[] = [];
    if (alertsRes && alertsRes.ok) {
      const { alerts: raw } = await alertsRes.json() as { alerts?: Alert[] };
      alerts = (raw ?? [])
        // Nur Wetter (keine Hitze-/UV-Gesundheitswarnungen), ab „markant".
        .filter((a) => a.category === 'met' && ['moderate', 'severe', 'extreme'].includes(a.severity))
        .filter((a) => !a.expires || new Date(a.expires) > now)
        .slice(0, 3)
        .map((a) => ({
          severity: a.severity, event: a.event_de, eventEn: a.event_en,
          headline: a.headline_de, headlineEn: a.headline_en, onset: a.onset, expires: a.expires,
        }));
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({
      days: next,
      pastWetDays: past.filter((d) => d.wet).length,
      pastRainMm: Math.round(past.reduce((s, d) => s + d.rainMm, 0) * 10) / 10,
      alerts,
      source: 'Deutscher Wetterdienst via Bright Sky',
    });
  } catch {
    return res.status(502).json({ error: 'weather unavailable' });
  }
}
