/**
 * POST /api/checkout — Cloudflare Pages Function
 *
 * Creates a Stripe Checkout Session.
 * Prices are looked up from the server-side catalog; frontend sends productId+qty only.
 */

import Stripe from 'stripe';
import { Redis } from '@upstash/redis/cloudflare';
import { products } from '../../src/lib/data';

interface Env {
  STRIPE_SECRET_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  SITE_URL: string;
}

interface OrderLine {
  productId: string;
  quantity: number;
}

const CATALOG = Object.fromEntries(products.map((p) => [p.id, p]));
const PURCHASABLE_IDS = new Set(
  products.filter((p) => p.category === 'wax').map((p) => p.id)
);
const MAX_QTY = 10;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { items: OrderLine[]; lang: 'de' | 'en' };
  try {
    body = await request.json() as typeof body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { items, lang } = body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'no_items' }, { status: 400 });
  }
  if (items.length > 20) {
    return Response.json({ error: 'too_many_items' }, { status: 400 });
  }
  for (const { productId, quantity } of items) {
    if (!PURCHASABLE_IDS.has(productId)) {
      return Response.json({ error: 'invalid_product', productId }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return Response.json({ error: 'invalid_quantity', productId }, { status: 400 });
    }
  }

  // ── Soft stock check (hard guarantee happens in webhook via atomic DECRBY) ─
  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
  try {
    const stockKeys = items.map((i) => `stock:${i.productId}`);
    const rawValues = await redis.mget<number | null>(...stockKeys) as (number | null)[];
    for (let i = 0; i < items.length; i++) {
      const stock = rawValues[i];
      if (stock !== null && stock < items[i].quantity) {
        return Response.json({ error: 'out_of_stock', productId: items[i].productId }, { status: 409 });
      }
    }
  } catch {
    console.warn('Redis stock check failed — proceeding without soft check');
  }

  // ── Build Stripe session with server-side prices ──────────────────────────
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(), // required for Cloudflare Workers
  });

  const de = lang === 'de';
  const siteUrl = env.SITE_URL ?? 'https://waxcelerate.de';

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    ({ productId, quantity }) => {
      const p = CATALOG[productId]!;
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: de ? p.title : p.titleEn,
            images: [p.image],
          },
          unit_amount: Math.round(p.price * 100), // always server-side catalog price
        },
        quantity,
      };
    }
  );

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
              display_name: de ? 'Kostenloser Versand (2–4 Werktage)' : 'Free Shipping (2–4 business days)',
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
              display_name: de ? 'DHL Versand (2–4 Werktage)' : 'DHL Shipping (2–4 business days)',
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
      // No payment_method_types → Stripe auto-shows PayPal, SEPA, cards for DE customers
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
        items: JSON.stringify(items.map(({ productId, quantity }) => ({ id: productId, qty: quantity }))),
        lang,
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation failed:', err);
    return Response.json({ error: 'stripe_error' }, { status: 500 });
  }
};
