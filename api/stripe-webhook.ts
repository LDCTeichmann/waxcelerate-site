import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Optional integrations — each is skipped gracefully if its env vars are absent.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

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

/** Decrement Upstash stock for each purchased item. Skips untracked (-1) products. */
async function decrementStock(cart: [string, number][]) {
  if (!redis) return;
  await Promise.all(
    cart.map(async ([productId, qty]) => {
      const key = `stock:${productId}`;
      const current = await redis.get<number>(key);
      // -1 = unlimited / not tracked, null = never set → leave untracked.
      if (current === null || current === undefined || current < 0) return;
      await redis.set(key, Math.max(0, current - qty));
    })
  );
}

async function saveOrder(session: Stripe.Checkout.Session) {
  if (!supabase) return;
  await supabase.from('orders').insert({
    stripe_session_id: session.id,
    email: session.customer_details?.email ?? null,
    amount_total: session.amount_total,
    currency: session.currency,
    items: session.metadata?.cart ? JSON.parse(session.metadata.cart) : null,
    shipping: session.customer_details?.address ?? null,
    created_at: new Date(session.created * 1000).toISOString(),
  });
}

async function sendConfirmationEmail(session: Stripe.Checkout.Session) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = session.customer_details?.email;
  if (!apiKey || !to) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Waxcelerate <bestellungen@waxcelerate.de>',
      to: [to],
      subject: 'Deine Bestellung bei Waxcelerate',
      html: '<p>Vielen Dank für deine Bestellung! Wir melden uns, sobald sie versendet wurde.</p>',
    }),
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

    console.log('[order]', {
      id: session.id,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
    });

    let cart: [string, number][] = [];
    try {
      cart = session.metadata?.cart ? (JSON.parse(session.metadata.cart) as [string, number][]) : [];
    } catch {
      cart = [];
    }

    // Run side effects independently — one failure must not block the others,
    // and we still return 200 so Stripe doesn't retry indefinitely.
    const results = await Promise.allSettled([
      decrementStock(cart),
      saveOrder(session),
      sendConfirmationEmail(session),
    ]);
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[webhook] side-effect ${['stock', 'order', 'email'][i]} failed:`, r.reason);
      }
    });
  }

  return res.json({ received: true });
}
