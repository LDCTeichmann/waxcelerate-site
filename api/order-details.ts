import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { session_id } = req.query;
  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'line_items.data.price.product'],
  });

  if (session.payment_status !== 'paid') {
    return res.status(400).json({ error: 'Session not paid' });
  }

  const items = (session.line_items?.data ?? []).map((li) => {
    const product = li.price?.product as Stripe.Product | null;
    return {
      name: product?.name ?? '',
      image: product?.images?.[0] ?? null,
      quantity: li.quantity ?? 1,
      amount: li.amount_total ?? 0,
    };
  });

  return res.json({
    items,
    total: session.amount_total ?? 0,
    currency: session.currency ?? 'eur',
    customerEmail: session.customer_details?.email ?? null,
    shippingName: session.customer_details?.name ?? null,
  });
}
