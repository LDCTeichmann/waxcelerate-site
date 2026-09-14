import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/weather?stadt=<slug> — „Deine Wachs-Woche" auf /kette-wachsen-lassen
 * und den Stadtseiten. Quelle: Bright Sky (api.brightsky.dev, MIT), das die
 * offenen Daten des Deutschen Wetterdienstes ausliefert — Vorhersage (MOSMIX)
 * und die letzten Tage (Beobachtung/aktuell). DWD-Daten: CC BY 4.0, kommerziell
 * nutzbar mit Quellenvermerk. Open-Meteo ist für kommerzielle Seiten nicht
 * erlaubt und deshalb bewusst NICHT die Quelle.
 *
 * Proxy statt Direktabruf im Browser: die Besucher-IP geht an niemanden außer
 * uns. Antwort 1 Stunde am Edge gecacht (je Stadt ein Abruf pro Stunde).
 *
 * Koordinaten gespiegelt aus src/pages/rewax/cities.ts — bewusst inline, weil
 * api/ außerhalb der src-tsconfig liegt (gleiches Muster wie rewax-request.ts).
 */
const COORDS: Record<string, [number, number]> = {
  hamburg: [53.55, 9.99], berlin: [52.52, 13.40], muenchen: [48.14, 11.58], koeln: [50.94, 6.96],
  frankfurt: [50.11, 8.68], leipzig: [51.34, 12.37], dresden: [51.05, 13.74], hannover: [52.37, 9.74],
  nuernberg: [49.45, 11.08], duesseldorf: [51.23, 6.78], freiburg: [47.99, 7.85], stuttgart: [48.78, 9.18],
};

interface Hour { timestamp: string; precipitation: number | null; temperature: number | null; icon: string | null }

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = typeof req.query.stadt === 'string' ? req.query.stadt : '';
  const coords = COORDS[slug];
  if (!coords) return res.status(404).json({ error: 'unknown city' });

  const now = new Date();
  const from = new Date(now.getTime() - 7 * 864e5);
  const to = new Date(now.getTime() + 7 * 864e5);
  const url = `https://api.brightsky.dev/weather?lat=${coords[0]}&lon=${coords[1]}`
    + `&date=${ymd(from)}&last_date=${ymd(to)}&tz=Europe%2FBerlin`;

  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
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

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({
      days: next,
      pastWetDays: past.filter((d) => d.wet).length,
      pastRainMm: Math.round(past.reduce((s, d) => s + d.rainMm, 0) * 10) / 10,
      source: 'Deutscher Wetterdienst via Bright Sky',
    });
  } catch {
    return res.status(502).json({ error: 'weather unavailable' });
  }
}
