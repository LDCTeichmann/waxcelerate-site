/**
 * POST /api/webhook
 *
 * Stripe webhook handler — called by Stripe after successful payment.
 *
 * Security:
 *   - Signature is verified against STRIPE_WEBHOOK_SECRET before any action.
 *   - The raw request body must be read from the Node.js stream BEFORE
 *     accessing req.body, to avoid Vercel's lazy body parsing consuming it.
 *   - Each event is processed exactly once via Redis idempotency key.
 *
 * Note: Do NOT add `export const config = { api: { bodyParser: false } }` —
 * that is Next.js-only syntax and has no effect in non-Next.js Vercel functions.
 * Stream buffering below achieves the same result.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

/** Buffer the raw request stream before any body parsing. */
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

  // Read raw bytes FIRST — before Vercel's lazy parser can consume the stream
  let rawBody: Buffer;
  try {
    rawBody = await getRawBody(req);
  } catch {
    return res.status(400).send('Failed to read request body');
  }

  // Verify Stripe signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (err) {
    console.error('Stripe signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${String(err)}`);
  }

  // Respond immediately — Stripe retries if we take >30s
  // (heavy processing below is synchronous for simplicity at this scale;
  //  move to a queue if processing time becomes an issue)

  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true });
  }

  // ── Idempotency: process each event exactly once ──────────────────────────
  // redis.set with nx:true returns "OK" if the key was NEW, null if it existed
  const isNew = await redis.set(`processed:${event.id}`, '1', {
    nx: true,
    ex: 86400 * 7, // keep dedup key for 7 days
  });
  if (!isNew) {
    // Already handled (Stripe delivered the event twice — normal behaviour)
    return res.json({ received: true });
  }

  // ── Decrement inventory ───────────────────────────────────────────────────
  const session = event.data.object as Stripe.Checkout.Session;
  const rawItems = session.metadata?.items;
  if (!rawItems) return res.json({ received: true });

  let items: Array<{ id: string; qty: number }>;
  try {
    items = JSON.parse(rawItems) as Array<{ id: string; qty: number }>;
  } catch {
    console.error('Failed to parse items metadata:', rawItems);
    return res.json({ received: true });
  }

  for (const { id, qty } of items) {
    const newStock = await redis.decrby(`stock:${id}`, qty);

    if (newStock < 0) {
      // Stock went negative → auto-refund and floor at 0
      console.error(
        `OVERSOLD: product=${id} qty=${qty} remaining=${newStock} session=${session.id}`
      );

      // Floor stock to prevent further negative drift
      await redis.set(`stock:${id}`, 0);

      // Issue automatic refund so the customer isn't charged for unavailable goods
      if (session.payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
          });
          console.log(`Auto-refunded oversold order: session=${session.id} product=${id}`);
        } catch (refundErr) {
          // Refund failed → requires manual intervention
          console.error(`MANUAL REFUND NEEDED: session=${session.id}`, refundErr);
        }
      }
    }
  }

  return res.json({ received: true });
}
