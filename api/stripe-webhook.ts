import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Vercel must not parse the body — Stripe needs the raw buffer to verify the signature
export const config = { api: { bodyParser: false } };

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return res.status(400).json({ error: 'Invalid Stripe signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotency — skip if already processed
    const alreadyDone = await redis.get(`order:${session.id}`);
    if (alreadyDone) return res.json({ received: true });

    // Decrement stock for each purchased product
    const itemsJson = session.metadata?.items;
    if (itemsJson) {
      const items = JSON.parse(itemsJson) as { id: string; qty: number }[];
      const results = await Promise.all(
        items.map(item => redis.decrby(`stock:${item.id}`, item.qty))
      );
      results.forEach((newStock, i) => {
        if (newStock < 0) {
          console.error('[OVERSELL]', { productId: items[i].id, newStock, sessionId: session.id });
        }
      });
    }

    // Mark order as processed (7-day TTL for idempotency)
    await redis.setex(`order:${session.id}`, 7 * 24 * 3600, '1');

    console.log('[order]', {
      id: session.id,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      shipping: session.customer_details?.address,
      created: new Date(session.created * 1000).toISOString(),
    });
  }

  return res.json({ received: true });
}
