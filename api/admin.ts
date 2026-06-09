import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { products } from '../src/lib/data.js';

// Same optional-Redis pattern as stock.ts — admin needs it configured to persist edits.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function checkPassword(provided: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  // If no password is configured the admin panel stays locked rather than open.
  return Boolean(expected) && provided === expected;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  // ── GET: return current stock + catalog (shape expected by AdminPage.tsx) ──
  if (req.method === 'GET') {
    const password = typeof req.query.password === 'string' ? req.query.password : undefined;
    if (!checkPassword(password)) return res.status(401).json({ error: 'Unauthorized' });

    const catalog = Object.fromEntries(
      products.map((p) => [p.id, { title: p.title, price: p.price }])
    );

    if (!redis) {
      const stock = Object.fromEntries(products.map((p) => [p.id, -1]));
      return res.json({ stock, catalog });
    }

    try {
      const keys = products.map((p) => `stock:${p.id}`);
      const values = await redis.mget<(number | null)[]>(...keys);
      const stock = Object.fromEntries(products.map((p, i) => [p.id, values[i] ?? -1]));
      return res.json({ stock, catalog });
    } catch {
      const stock = Object.fromEntries(products.map((p) => [p.id, -1]));
      return res.json({ stock, catalog });
    }
  }

  // ── POST: update a single product's stock ──────────────────────────────────
  if (req.method === 'POST') {
    const { productId, stock, password } = req.body as {
      productId?: string;
      stock?: number;
      password?: string;
    };

    if (!checkPassword(password)) return res.status(401).json({ error: 'Unauthorized' });
    if (!productId || !products.some((p) => p.id === productId)) {
      return res.status(400).json({ error: 'Unknown product' });
    }
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < -1) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }
    if (!redis) {
      return res.status(503).json({
        error: 'Upstash Redis is not configured — set UPSTASH_REDIS_REST_URL and _TOKEN.',
      });
    }

    try {
      await redis.set(`stock:${productId}`, stock);
      return res.json({ ok: true, productId, stock });
    } catch {
      return res.status(500).json({ error: 'Failed to write stock' });
    }
  }

  return res.status(405).end();
}
