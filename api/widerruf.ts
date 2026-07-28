import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/widerruf — § 356a BGB withdrawal notice.
 *
 * By law this may only ask for contract identification (order number, date,
 * product) and a contact method for the receipt confirmation — never a
 * reason. There's no "reason" field in the request type below on purpose;
 * don't add one.
 */
interface WithdrawalRequest {
  orderNumber: string;
  orderDate: string;
  product: string;
  email: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_EMAIL = 'waxcelerate@gmail.com';

// Fields below come straight from the public form — escape before interpolating
// into email HTML so a submitted "product" or "orderNumber" can't inject markup.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[widerruf] RESEND_API_KEY not set — email not sent', { to, subject });
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Waxcelerate <widerruf@waxcelerate.de>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error('[widerruf] Resend API error', await res.text());
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { orderNumber, orderDate, product, email } = req.body as Partial<WithdrawalRequest>;

  if (!orderNumber?.trim() || !orderDate?.trim() || !product?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' });
  }

  const receivedAt = new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
  const safeOrderNumber = escapeHtml(orderNumber);
  const safeOrderDate = escapeHtml(orderDate);
  const safeProduct = escapeHtml(product);
  const safeEmail = escapeHtml(email);

  await Promise.all([
    sendEmail(
      OWNER_EMAIL,
      `Widerruf eingegangen — Bestellung ${safeOrderNumber}`,
      `<p>Ein Widerruf ist eingegangen (${receivedAt}):</p>
       <ul>
         <li><strong>Bestellnummer:</strong> ${safeOrderNumber}</li>
         <li><strong>Bestelldatum:</strong> ${safeOrderDate}</li>
         <li><strong>Produkt:</strong> ${safeProduct}</li>
         <li><strong>Kontakt-E-Mail:</strong> ${safeEmail}</li>
       </ul>`
    ),
    sendEmail(
      email,
      'Eingangsbestätigung: Dein Widerruf bei Waxcelerate',
      `<p>Hallo,</p>
       <p>dein Widerruf zur Bestellung <strong>${safeOrderNumber}</strong> vom ${safeOrderDate} ist bei uns eingegangen.
       Wir melden uns in Kürze mit den weiteren Schritten zur Rücksendung und Erstattung.</p>
       <p>Viele Grüße<br />Luca, Waxcelerate</p>`
    ),
  ]);

  return res.json({ success: true });
}
