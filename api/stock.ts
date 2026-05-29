import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { products } from '../src/lib/data.js';

// Redis is optional — if env vars are missing, all stock returns as -1 (unlimited/not tracked)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Cache for 60s — stock doesn't need to be real-time at this scale
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (!redis) {
    // No Redis configured — return -1 (unlimited) for all products
    const fallback = Object.fromEntries(products.map((p) => [p.id, -1]));
    return res.json(fallback);
  }

  try {
    const keys = products.map((p) => `stock:${p.id}`);
    const values = await redis.mget<(number | null)[]>(...keys);

    const stockMap = Object.fromEntries(
      products.map((p, i) => [p.id, values[i] ?? -1])
    );

    return res.json(stockMap);
  } catch {
    // Redis error — fail open (return unlimited) so checkout still works
    const fallback = Object.fromEntries(products.map((p) => [p.id, -1]));
    return res.json(fallback);
  }
}
