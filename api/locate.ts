import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/locate
 * „Dein Ort" auf /kette-wachsen-lassen, ohne dass jemand etwas tippen muss:
 * Vercel hängt jeder Anfrage die grob aus der IP geschätzte Position an
 * (x-vercel-ip-*). Wir geben davon nur Breite/Länge auf eine Nachkommastelle
 * (~10 km) zurück und nur für Deutschland; die Seite sucht daraus die nächste
 * PLZ-Leitregion (src/pages/rewax/plzRegions.ts) und holt das Wetter wie
 * bisher über /api/weather. Nichts wird gespeichert oder weitergegeben.
 *
 * 204 = kein Ort (Ausland, Header fehlt, lokaler Dev) → die Seite fragt nach
 * der PLZ. `private, no-store`, weil die Antwort je Besucher verschieden ist.
 */
const header = (req: VercelRequest, name: string) => {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (header(req, 'x-vercel-ip-country') !== 'DE') return res.status(204).end();
  const lat = Number(header(req, 'x-vercel-ip-latitude'));
  const lon = Number(header(req, 'x-vercel-ip-longitude'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return res.status(204).end();
  if (lat < 47.2 || lat > 55.1 || lon < 5.8 || lon > 15.1) return res.status(204).end();
  return res.status(200).json({ lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10 });
}
