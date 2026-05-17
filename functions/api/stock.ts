/**
 * GET /api/stock — Cloudflare Pages Function
 *
 * Returns current stock levels for all purchasable (wax) products.
 * Cached at the CDN edge for 30 seconds.
 *
 * Response format: { [productId]: number }
 *   -1 = not tracked (treat as unlimited)
 *    0 = out of stock
 *   >0 = units available
 *
 * Fails open: if Redis is unreachable, returns -1 for all products.
 */

import { Redis } from '@upstash/redis/cloudflare';
import { products } from '../../src/lib/data';

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

const WAX_IDS = products.filter((p) => p.category === 'wax').map((p) => p.id);

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
  };

  try {
    const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
    const keys = WAX_IDS.map((id) => `stock:${id}`);
    const rawValues = await redis.mget<number | null>(...keys) as (number | null)[];

    const stock: Record<string, number> = {};
    WAX_IDS.forEach((id, i) => {
      stock[id] = rawValues[i] ?? -1;
    });

    return new Response(JSON.stringify(stock), { headers });
  } catch {
    // Redis unreachable — fail open with -1 (unlimited) for all products
    const fallback: Record<string, number> = {};
    WAX_IDS.forEach((id) => { fallback[id] = -1; });
    return new Response(JSON.stringify(fallback), { headers });
  }
};
