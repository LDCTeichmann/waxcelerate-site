/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session.
 *
 * Security contract:
 *   - Frontend sends only { productId, quantity } — NO price.
 *   - All prices, titles, images are looked up from the server-side catalog.
 *   - Only wax products (category === 'wax') can be purchased via this endpoint.
 *   - Stock is checked before session creation (soft check — race-condition
 *     safety is enforced atomically in the webhook via DECRBY).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { products } from '../src/lib/data';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

// Build server-side lookup maps once (module-level — persists across warm invocations)
const CATALOG = Object.fromEntries(products.map((p) => [p.id, p]));
const PURCHASABLE_IDS = new Set(
  products.filter((p) => p.category === 'wax').map((p) => p.id)
);
const MAX_QTY = 10;

interface OrderLine {
  productId: string;
  quantity: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).end();

  // ── Input validation ──────────────────────────────────────────────────────
  const { items, lang } = req.body as { items: OrderLine[]; lang: 'de' | 'en' };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'no_items' });
  }
  if (items.length > 20) {
    return res.status(400).json({ error: 'too_many_items' });
  }

  for (const { productId, quantity } of items) {
    if (!PURCHASABLE_IDS.has(productId)) {
      return res.status(400).json({
        error: 'invalid_product',
        productId,
      });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return res.status(400).json({ error: 'invalid_quantity', productId });
    }
  }

  // ── Stock check (soft — race-condition safety lives in webhook) ───────────
  try {
    const stockKeys = items.map((i) => `stock:${i.productId}`);
    // mget returns (number | null)[] — null means key not set = unlimited
    const rawValues = await redis.mget<number | null>(...stockKeys);
    const stockValues = rawValues as (number | null)[];

    for (let i = 0; i < items.length; i++) {
      const stock = stockValues[i];
      if (stock !== null && stock < items[i].quantity) {
        return res.status(409).json({
          error: 'out_of_stock',
          productId: items[i].productId,
        });
      }
    }
  } catch {
    // Redis down → skip soft check, webhook handles atomics
    console.warn('Redis stock check failed — proceeding without soft check');
  }

  // ── Build Stripe line items from SERVER-SIDE catalog (never frontend prices) ──
  const de = lang === 'de';
  const siteUrl = process.env.SITE_URL ?? 'https://waxcelerate.de';

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    ({ productId, quantity }) => {
      const p = CATALOG[productId]!;
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: de ? p.title : p.titleEn,
            // eBay hosted images are typically stable; if Stripe rejects, swap
            // to Vercel-hosted /images/ URLs after uploading product photos.
            images: [p.image],
          },
          unit_amount: Math.round(p.price * 100), // ← server catalog, not frontend
        },
        quantity,
      };
    }
  );

  // Free shipping above €50 (computed server-side from real prices)
  const cartTotal = items.reduce(
    (sum, { productId, quantity }) => sum + CATALOG[productId]!.price * quantity,
    0
  );

  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
    cartTotal >= 50
      ? [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 0, currency: 'eur' },
              display_name: de
                ? 'Kostenloser Versand (2–4 Werktage)'
                : 'Free Shipping (2–4 business days)',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 2 },
                maximum: { unit: 'business_day', value: 4 },
              },
            },
          },
        ]
      : [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 390, currency: 'eur' },
              display_name: de
                ? 'DHL Versand (2–4 Werktage)'
                : 'DHL Shipping (2–4 business days)',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 2 },
                maximum: { unit: 'business_day', value: 4 },
              },
            },
          },
        ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // No payment_method_types → Stripe auto-detects best methods per customer
      // (shows PayPal, SEPA, cards automatically for German locale)
      shipping_address_collection: {
        allowed_countries: [
          'DE', 'AT', 'CH', 'FR', 'NL', 'BE', 'LU',
          'DK', 'SE', 'NO', 'FI', 'IT', 'ES', 'PT',
          'PL', 'CZ', 'SK', 'HU',
        ],
      },
      shipping_options: shippingOptions,
      allow_promotion_codes: true,
      success_url: `${siteUrl}/bestellung-erfolgreich?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#produkte`,
      locale: de ? 'de' : 'en',
      metadata: {
        // Store productId+qty pairs for webhook inventory decrement
        items: JSON.stringify(items.map(({ productId, quantity }) => ({ id: productId, qty: quantity }))),
        lang,
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation failed:', err);
    return res.status(500).json({ error: 'stripe_error' });
  }
}
