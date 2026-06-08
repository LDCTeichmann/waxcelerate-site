import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { products } from '../src/lib/data.js';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const WAX_IDS = products.filter((p) => p.category === 'wax').map((p) => p.id);
const WAX_SET = new Set(WAX_IDS);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (req.method === 'GET') {
    const password = req.query['password'] as string | undefined;
    if (!adminPassword || password !== adminPassword) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    if (!redis) {
      return res.status(503).json({ error: 'Redis not configured' });
    }

    const keys = WAX_IDS.map((id) => `stock:${id}`);
    const rawValues = await redis.mget<(number | null)[]>(...keys);

    const stock: Record<string, number> = {};
    WAX_IDS.forEach((id, i) => { stock[id] = rawValues[i] ?? -1; });

    const catalog = Object.fromEntries(
      products
        .filter((p) => p.category === 'wax')
        .map((p) => [p.id, { title: p.title, price: p.price }])
    );

    return res.json({ stock, catalog });
  }

  if (req.method === 'POST') {
    const body = req.body as { productId: string; stock: number; password: string };
    if (!adminPassword || body.password !== adminPassword) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const { productId, stock } = body;
    if (!WAX_SET.has(productId)) {
      return res.status(400).json({ error: 'invalid_product' });
    }
    if (!Number.isInteger(stock) || stock < -1) {
      return res.status(400).json({ error: 'invalid_stock' });
    }
    if (!redis) {
      return res.status(503).json({ error: 'Redis not configured' });
    }

    if (stock === -1) {
      await redis.del(`stock:${productId}`);
    } else {
      await redis.set(`stock:${productId}`, stock);
    }

    return res.json({ ok: true, productId, stock });
  }

  return res.status(405).end();
}
