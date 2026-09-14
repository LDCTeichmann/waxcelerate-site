import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/weather?stadt=<slug> — Live-Wetter für die Stadtseiten unter
 * /kette-wachsen-lassen/:stadt. Proxy zu Open-Meteo (kein API-Key), damit der
 * Browser des Besuchers keine Anfrage an einen Dritten schickt (DSGVO: keine
 * Besucher-IP an Open-Meteo). Antwort wird 30 Minuten am Edge gecacht.
 *
 * Koordinaten gespiegelt aus src/pages/rewax/cities.ts — bewusst inline, weil
 * api/ außerhalb der src-tsconfig liegt (gleiches Muster wie rewax-request.ts).
 * Neue Stadt dort = neue Zeile hier.
 */
const COORDS: Record<string, [number, number]> = {
  hamburg: [53.55, 9.99], berlin: [52.52, 13.40], muenchen: [48.14, 11.58], koeln: [50.94, 6.96],
  frankfurt: [50.11, 8.68], leipzig: [51.34, 12.37], dresden: [51.05, 13.74], hannover: [52.37, 9.74],
  nuernberg: [49.45, 11.08], duesseldorf: [51.23, 6.78], freiburg: [47.99, 7.85], stuttgart: [48.78, 9.18],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = typeof req.query.stadt === 'string' ? req.query.stadt : '';
  const coords = COORDS[slug];
  if (!coords) return res.status(404).json({ error: 'unknown city' });

  const [lat, lon] = coords;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m&daily=precipitation_sum&past_days=7&forecast_days=1&timezone=Europe%2FBerlin';
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`open-meteo ${r.status}`);
    const d = await r.json() as { current?: { temperature_2m?: number }; daily?: { precipitation_sum?: (number | null)[] } };
    const sums = d.daily?.precipitation_sum ?? [];
    // past_days=7 + forecast_days=1: die ersten sieben Werte sind die letzten
    // sieben Tage, der letzte ist heute.
    const past = sums.slice(0, 7).map((x) => x ?? 0);
    const today = sums[sums.length - 1] ?? 0;
    const tempC = d.current?.temperature_2m;
    if (typeof tempC !== 'number') throw new Error('no temperature');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({
      tempC,
      rainMm: Math.round(today * 10) / 10,
      rainDays7: past.filter((x) => x >= 1).length,
    });
  } catch {
    return res.status(502).json({ error: 'weather unavailable' });
  }
}
