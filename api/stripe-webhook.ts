import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
      shipping: session.customer_details?.address,
      created: new Date(session.created * 1000).toISOString(),
    });

    // ── Phase 2: uncomment to send branded email via Resend ─────────────────
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'Waxcelerate <bestellungen@waxcelerate.de>',
    //     to: [session.customer_details?.email!],
    //     subject: 'Deine Bestellung bei Waxcelerate',
    //     html: `<p>Vielen Dank für deine Bestellung! Wir melden uns sobald sie versendet wurde.</p>`,
    //   }),
    // });

    // ── Phase 2: uncomment to save to Supabase ───────────────────────────────
    // await supabase.from('orders').insert({ stripe_session_id: session.id, ... });
  }

  return res.json({ received: true });
}
