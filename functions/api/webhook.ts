/**
 * POST /api/webhook — Cloudflare Pages Function
 *
 * Stripe webhook handler — called by Stripe after successful payment.
 *
 * Security:
 *   - Signature verified via constructEventAsync + SubtleCrypto (CF Workers standard).
 *   - Raw body read via request.text() before any parsing.
 *   - Each event processed exactly once via Redis idempotency key.
 */

import Stripe from 'stripe';
import { Redis } from '@upstash/redis/cloudflare';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // Read raw body as text — required for Stripe signature verification
  const rawBody = await request.text();

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  // constructEventAsync uses SubtleCrypto — the only approach that works in CF Workers
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error('Stripe signature verification failed:', err);
    return new Response(`Webhook Error: ${String(err)}`, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true });
  }

  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });

  // ── Idempotency: process each event exactly once ──────────────────────────
  const isNew = await redis.set(`processed:${event.id}`, '1', {
    nx: true,
    ex: 86400 * 7, // keep dedup key for 7 days
  });
  if (!isNew) {
    return Response.json({ received: true });
  }

  // ── Decrement inventory ───────────────────────────────────────────────────
  const session = event.data.object as Stripe.Checkout.Session;
  const rawItems = session.metadata?.items;
  if (!rawItems) return Response.json({ received: true });

  let items: Array<{ id: string; qty: number }>;
  try {
    items = JSON.parse(rawItems) as Array<{ id: string; qty: number }>;
  } catch {
    console.error('Failed to parse items metadata:', rawItems);
    return Response.json({ received: true });
  }

  for (const { id, qty } of items) {
    const newStock = await redis.decrby(`stock:${id}`, qty);

    if (newStock < 0) {
      console.error(
        `OVERSOLD: product=${id} qty=${qty} remaining=${newStock} session=${session.id}`
      );

      // Floor stock at 0 to prevent further negative drift
      await redis.set(`stock:${id}`, 0);

      // Issue automatic refund — customer shouldn't be charged for unavailable goods
      if (session.payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
          });
          console.log(`Auto-refunded oversold order: session=${session.id} product=${id}`);
        } catch (refundErr) {
          console.error(`MANUAL REFUND NEEDED: session=${session.id}`, refundErr);
        }
      }
    }
  }

  return Response.json({ received: true });
};
