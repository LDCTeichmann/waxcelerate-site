/**
 * GET/POST /api/admin — Cloudflare Pages Function
 *
 * Password-protected stock management endpoint.
 *
 * GET  /api/admin         → returns current stock for all wax products
 * POST /api/admin         → sets stock for a product
 *   body: { productId: string; stock: number; password: string }
 *
 * Authentication: plain password in request body / query param.
 * (Fine for a one-person operation — no need for full auth infrastructure.)
 */

import { Redis } from '@upstash/redis/cloudflare';
import { products } from '../../src/lib/data';

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ADMIN_PASSWORD: string;
}

const WAX_IDS = products.filter((p) => p.category === 'wax').map((p) => p.id);
const WAX_SET = new Set(WAX_IDS);

const unauthorized = () =>
  Response.json({ error: 'unauthorized' }, { status: 401 });

const cors = { 'Access-Control-Allow-Origin': '*' };

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  if (url.searchParams.get('password') !== env.ADMIN_PASSWORD) {
    return unauthorized();
  }

  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
  const keys = WAX_IDS.map((id) => `stock:${id}`);
  const rawValues = await redis.mget<number | null>(...keys) as (number | null)[];

  const stock: Record<string, number> = {};
  WAX_IDS.forEach((id, i) => {
    stock[id] = rawValues[i] ?? -1;
  });

  // Also include product names for display
  const catalog = Object.fromEntries(
    products
      .filter((p) => p.category === 'wax')
      .map((p) => [p.id, { title: p.title, price: p.price }])
  );

  return Response.json({ stock, catalog }, { headers: cors });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { productId: string; stock: number; password: string };
  try {
    body = await request.json() as typeof body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (body.password !== env.ADMIN_PASSWORD) {
    return unauthorized();
  }

  const { productId, stock } = body;

  if (!WAX_SET.has(productId)) {
    return Response.json({ error: 'invalid_product' }, { status: 400 });
  }
  if (!Number.isInteger(stock) || stock < -1) {
    return Response.json({ error: 'invalid_stock' }, { status: 400 });
  }

  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });

  if (stock === -1) {
    // -1 means unlimited — delete the key so mget returns null → -1
    await redis.del(`stock:${productId}`);
  } else {
    await redis.set(`stock:${productId}`, stock);
  }

  return Response.json({ ok: true, productId, stock }, { headers: cors });
};
