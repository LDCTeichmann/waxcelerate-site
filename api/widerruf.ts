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

// Returns whether the email actually sent. The caller uses this to log a
// loud, distinguishable alert when the notice to Luca specifically fails —
// previously this only console.error'd and the handler still returned
// {success:true} unconditionally, so a missing/misconfigured
// RESEND_API_KEY meant a legally-sensitive withdrawal notice could vanish
// with no operational signal that anything went wrong.
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[widerruf] RESEND_API_KEY not set — email not sent', { to, subject });
    return false;
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
    return false;
  }
  return true;
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

  const [ownerNotified] = await Promise.all([
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

  // The withdrawal itself is legally valid the moment it's submitted,
  // independent of whether either email actually sent — blocking the
  // customer's confirmation on an email-provider hiccup would be worse
  // than a silent send failure. But if the notice to Luca specifically
  // didn't go out, nobody knows to act on it, so that failure gets a loud,
  // greppable log line distinct from the generic per-email error above.
  if (!ownerNotified) {
    console.error('[widerruf] ALERT: owner notification failed to send — withdrawal may go unprocessed', {
      orderNumber: safeOrderNumber, orderDate: safeOrderDate, product: safeProduct, email: safeEmail, receivedAt,
    });
  }

  return res.json({ success: true });
}
