import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { products, shipping, shippingFor } from '../src/lib/data.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { items } = req.body as { items: { productId: string; quantity: number }[] };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Empty cart' });
  }

  // Look up Stripe price IDs from data.ts — client never sends price amounts
  const lineItems: { price: string; quantity: number }[] = [];
  const shippingItems: { product: typeof products[number]; quantity: number }[] = [];
  let subtotalCents = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Unknown product: ${item.productId}` });
    }
    if (!product.stripePriceId || product.stripePriceId === '') {
      return res.status(503).json({
        error: `Stripe not yet configured for "${product.title}". Add stripePriceId to src/lib/data.ts after creating products in the Stripe Dashboard.`,
      });
    }
    lineItems.push({ price: product.stripePriceId, quantity: item.quantity });
    shippingItems.push({ product, quantity: item.quantity });
    subtotalCents += Math.round(product.price * 100) * item.quantity;
  }

  // Weight-tiered rate (Großbrief/Maxibrief/Paket) from the same table and
  // function the cart drawer uses for its pre-checkout estimate — free over
  // €50, same threshold as the free-shipping banner shown there. Built
  // inline via shipping_rate_data so no shipping-rate objects need to exist
  // in the Stripe Dashboard, in either test or live mode.
  const tier = shippingFor(shippingItems);
  const shippingCents = subtotalCents >= shipping.freeFromCents ? 0 : tier.cents;
  const shippingLabel = subtotalCents >= shipping.freeFromCents ? 'Kostenloser Versand' : tier.label;

  const origin = req.headers.origin ?? process.env.SITE_URL ?? 'https://waxcelerate.de';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'eur',
    line_items: lineItems,
    allow_promotion_codes: true,
    shipping_address_collection: {
      allowed_countries: ['DE', 'AT', 'CH', 'NL', 'BE', 'FR', 'IT', 'ES', 'PL', 'DK', 'SE', 'NO', 'GB'],
    },
    shipping_options: [{
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: shippingCents, currency: 'eur' },
        display_name: shippingLabel,
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 1 },
          maximum: { unit: 'business_day', value: 3 },
        },
      },
    }],
    payment_method_types: ['card', 'sepa_debit', 'klarna'],
    invoice_creation: {
      enabled: true,
      invoice_data: {
        footer: 'Gemäß §19 UStG wird keine Umsatzsteuer erhoben. | Waxcelerate, Stuttgart',
      },
    },
    success_url: `${origin}/bestellung-erfolgreich?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#produkte`,
    metadata: { source: 'website' },
  });

  return res.json({ url: session.url });
}
