import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

// Disable body parsing so we can verify Stripe's raw signature
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Missing stripe-signature header');
  }

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${String(err)}`);
  }

  // Only handle successful payments
  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true });
  }

  // Idempotency: process each event exactly once
  const isNew = await redis.set(`processed:${event.id}`, '1', {
    nx: true,
    ex: 86400 * 7, // TTL: 7 days
  });
  if (!isNew) {
    return res.json({ received: true }); // already handled
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const rawItems = session.metadata?.items;
  if (!rawItems) return res.json({ received: true });

  const items = JSON.parse(rawItems) as Array<{ id: string; qty: number }>;

  for (const { id, qty } of items) {
    const newStock = await redis.decrby(`stock:${id}`, qty);
    if (newStock < 0) {
      // Floor at 0 to prevent runaway negative values
      await redis.set(`stock:${id}`, 0);
      // Log for manual review — email yourself or handle via Stripe dashboard
      console.error(
        `OVERSOLD: product=${id} qty=${qty} remaining=${newStock} session=${session.id}`
      );
    }
  }

  return res.json({ received: true });
}
