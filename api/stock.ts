/**
 * GET /api/stock
 *
 * Returns current stock levels for all purchasable (wax) products.
 * Response is cached at the CDN edge for 30 seconds.
 *
 * Response format: { [productId]: number }
 *   -1 = not tracked (treat as unlimited)
 *    0 = out of stock
 *   >0 = units available
 *
 * Fails open: if Redis is unreachable, returns -1 for all products
 * (frontend shows "in stock" — better UX than blocking the page).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { products } from '../src/lib/data';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

const WAX_IDS = products.filter((p) => p.category === 'wax').map((p) => p.id);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  // CDN-cached for 30s, stale-while-revalidate for 60s
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const keys = WAX_IDS.map((id) => `stock:${id}`);
    const rawValues = await redis.mget<number | null>(...keys);
    const values = rawValues as (number | null)[];

    const stock: Record<string, number> = {};
    WAX_IDS.forEach((id, i) => {
      // null = key not set in Redis = treat as unlimited (-1)
      stock[id] = values[i] ?? -1;
    });

    return res.json(stock);
  } catch {
    // Redis unreachable — fail open with -1 (unlimited) for all products
    const fallback: Record<string, number> = {};
    WAX_IDS.forEach((id) => { fallback[id] = -1; });
    return res.json(fallback);
  }
}
