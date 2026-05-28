import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { products } from '../src/lib/data';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const FREE_SHIPPING_THRESHOLD = 50_00; // €50.00 in cents

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { items } = req.body as { items: { productId: string; quantity: number }[] };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Empty cart' });
  }

  // Look up Stripe price IDs from data.ts — client never sends price amounts
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
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
    subtotalCents += Math.round(product.price * 100) * item.quantity;
  }

  // Free shipping over €50, otherwise show standard rate
  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
    subtotalCents >= FREE_SHIPPING_THRESHOLD
      ? [{ shipping_rate: process.env.STRIPE_SHIPPING_FREE! }]
      : [{ shipping_rate: process.env.STRIPE_SHIPPING_STANDARD! }];

  const origin = req.headers.origin ?? process.env.SITE_URL ?? 'https://waxcelerate.de';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'eur',
    line_items: lineItems,
    allow_promotion_codes: true,
    shipping_address_collection: {
      allowed_countries: ['DE', 'AT', 'CH', 'NL', 'BE', 'FR', 'IT', 'ES', 'PL', 'DK', 'SE', 'NO', 'GB'],
    },
    shipping_options: shippingOptions,
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
