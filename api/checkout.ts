import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

interface CartItem {
  productId: string;
  title: string;
  titleEn: string;
  price: number;
  image: string;
  quantity: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).end();

  const { items, lang } = req.body as { items: CartItem[]; lang: 'de' | 'en' };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  const de = lang === 'de';
  const siteUrl = process.env.SITE_URL ?? 'https://waxcelerate.de';

  // Compute cart total to decide shipping
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
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
                ? 'DHL Standardversand (2–4 Werktage)'
                : 'DHL Standard (2–4 business days)',
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
      line_items: items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: de ? item.title : item.titleEn,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: [
          'DE', 'AT', 'CH', 'FR', 'NL', 'BE', 'LU',
          'DK', 'SE', 'NO', 'FI', 'IT', 'ES', 'PT',
          'PL', 'CZ', 'SK', 'HU',
        ],
      },
      shipping_options: shippingOptions,
      allow_promotion_codes: true,
      payment_method_types: ['card', 'paypal'],
      success_url: `${siteUrl}/bestellung-erfolgreich?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#produkte`,
      locale: de ? 'de' : 'en',
      metadata: {
        items: JSON.stringify(items.map((i) => ({ id: i.productId, qty: i.quantity }))),
        lang,
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: 'Checkout session creation failed' });
  }
}
