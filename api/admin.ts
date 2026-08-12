/**
 * GET/POST /api/admin — passwortgeschuetzte Bestandsverwaltung fuer /admin.
 *
 * GET  /api/admin?password=…  → { stock, catalog } fuer alle Wachsprodukte
 * POST /api/admin             → body { productId, stock, password }
 *
 * Bestand -1 = unbegrenzt, 0 = ausverkauft, >0 = Stueckzahl.
 *
 * Portiert aus der frueheren Cloudflare-Pages-Function (`functions/api/admin.ts`),
 * die nie ausgefuehrt wurde: die Seite laeuft auf Vercel, dort greift nur `api/`.
 * `/admin` lief deshalb bis 08/2026 ins Leere.
 *
 * Authentifizierung: Klartext-Passwort aus `ADMIN_PASSWORD`. Fuer einen
 * Ein-Personen-Betrieb ausreichend, siehe api/stock.ts fuer denselben Zuschnitt.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { products } from '../src/lib/data.js';

const WAX = products.filter((p) => p.category === 'wax');
const WAX_IDS = WAX.map((p) => p.id);
const WAX_SET = new Set(WAX_IDS);

// Anders als in api/stock.ts wird hier NICHT nach "unbegrenzt" aufgemacht, wenn
// Redis fehlt: ein stiller Erfolg beim Speichern waere schlimmer als ein Fehler.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const catalog = Object.fromEntries(
  WAX.map((p) => [p.id, { title: p.title, price: p.price }])
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Bestandsdaten nie zwischenspeichern, sonst zeigt die Oberflaeche alte Werte.
  res.setHeader('Cache-Control', 'no-store');

  const expected = process.env.ADMIN_PASSWORD;
  // Ohne gesetztes Passwort bleibt der Endpunkt zu. Sonst wuerde ein leerer
  // Vergleich jeden hereinlassen.
  if (!expected) {
    return res.status(503).json({ error: 'admin_password_not_configured' });
  }

  const given =
    req.method === 'POST'
      ? (req.body as { password?: string } | undefined)?.password
      : (req.query.password as string | undefined);

  if (given !== expected) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (req.method === 'GET') {
    if (!redis) {
      return res.json({
        stock: Object.fromEntries(WAX_IDS.map((id) => [id, -1])),
        catalog,
      });
    }
    const keys = WAX_IDS.map((id) => `stock:${id}`);
    const values = await redis.mget<(number | null)[]>(...keys);
    const stock = Object.fromEntries(WAX_IDS.map((id, i) => [id, values[i] ?? -1]));
    return res.json({ stock, catalog });
  }

  if (req.method === 'POST') {
    if (!redis) {
      return res.status(503).json({ error: 'redis_not_configured' });
    }

    const { productId, stock } = (req.body ?? {}) as {
      productId?: string;
      stock?: number;
    };

    if (!productId || !WAX_SET.has(productId)) {
      return res.status(400).json({ error: 'invalid_product' });
    }
    if (!Number.isInteger(stock) || (stock as number) < -1) {
      return res.status(400).json({ error: 'invalid_stock' });
    }

    if (stock === -1) {
      // -1 heisst unbegrenzt: Schluessel loeschen, dann liefert mget null → -1
      await redis.del(`stock:${productId}`);
    } else {
      await redis.set(`stock:${productId}`, stock);
    }

    return res.json({ ok: true, productId, stock });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
