import type { VercelRequest, VercelResponse } from '@vercel/node';
import { escapeHtml, sendEmail as sendEmailShared } from './_lib/email';

/**
 * POST /api/rewax-request — the form alternative to the WhatsApp/mailto
 * deep links on /kette-wachsen-lassen. Deliberately additive, not a
 * replacement: WhatsApp stays the primary CTA, this is a second option for
 * people who'd rather not open a chat app.
 *
 * `tierId` mirrors the four pricing tiers already defined in RewaxPage.tsx
 * (PRICE.single / PRICE.bundle*3 / FIVE_CARD / TEN_CARD) on purpose — if
 * those tiers ever get real stripePriceIds, this is the same shape a
 * `{ items: [{ productId, quantity }] }` Stripe Checkout call would need
 * (see api/create-checkout.ts), so upgrading later means swapping the
 * submit target, not redesigning the form.
 */
type TierId = 'single' | 'bundle3' | 'five' | 'ten';

interface RewaxRequestBody {
  tierId: TierId;
  quantity?: number;
  isGift: boolean;
  name: string;
  contact: string;
  message?: string;
  honeypot?: string;
}

const TIER_LABELS: Record<TierId, string> = {
  single: 'Einzelne Kette',
  bundle3: 'Drei Ketten',
  five: '5er-Karte',
  ten: '10er-Karte',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose on purpose — contact can be an email or a phone number, and phone
// formatting varies too much (spaces, dashes, country codes) to validate
// strictly. This just rejects obviously-empty or single-character input.
const PHONE_RE = /^[+\d][\d\s()/-]{5,}$/;
const OWNER_EMAIL = 'waxcelerate@gmail.com';

const sendEmail = (to: string, subject: string, html: string) => sendEmailShared(to, subject, html, 'rewax-request');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { tierId, quantity, isGift, name, contact, message, honeypot } = req.body as Partial<RewaxRequestBody>;

  // Bots fill every field, including ones real users never see. Report
  // success without sending anything, so the bot has no signal to retry.
  if (honeypot) return res.json({ success: true });

  if (!tierId || !(tierId in TIER_LABELS)) {
    return res.status(400).json({ error: 'Bitte eine Kartengröße auswählen.' });
  }
  if (!name?.trim() || !contact?.trim()) {
    return res.status(400).json({ error: 'Bitte Name und Kontakt angeben.' });
  }
  if (!EMAIL_RE.test(contact) && !PHONE_RE.test(contact)) {
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse oder Telefonnummer angeben.' });
  }

  const safeTierLabel = TIER_LABELS[tierId];
  const safeName = escapeHtml(name.trim());
  const safeContact = escapeHtml(contact.trim());
  const safeMessage = message?.trim() ? escapeHtml(message.trim()) : '';
  const safeQuantity = Number.isFinite(quantity) && quantity! > 0 ? Math.min(Math.round(quantity!), 50) : null;
  const receivedAt = new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

  const [ownerNotified] = await Promise.all([
    sendEmail(
      OWNER_EMAIL,
      `Rewax-Anfrage: ${safeTierLabel}${isGift ? ' (Geschenk)' : ''}`,
      `<p>Neue Rewax-Anfrage über das Formular (${receivedAt}):</p>
       <ul>
         <li><strong>Karte:</strong> ${safeTierLabel}${isGift ? ' — als Geschenk' : ''}</li>
         ${safeQuantity ? `<li><strong>Anzahl Ketten:</strong> ${safeQuantity}</li>` : ''}
         <li><strong>Name:</strong> ${safeName}</li>
         <li><strong>Kontakt:</strong> ${safeContact}</li>
         ${safeMessage ? `<li><strong>Nachricht:</strong> ${safeMessage}</li>` : ''}
       </ul>`
    ),
    // Only fires if the contact looks like an email — a phone number can't
    // receive a confirmation this way, and Luca will reach out there directly.
    EMAIL_RE.test(contact)
      ? sendEmail(
          contact.trim(),
          'Deine Anfrage bei Waxcelerate ist angekommen',
          `<p>Hallo ${safeName},</p>
           <p>deine Anfrage (${safeTierLabel}${isGift ? ', als Geschenk' : ''}) ist bei uns eingegangen.
           Wir melden uns in Kürze mit der Versandadresse und den nächsten Schritten.</p>
           <p>Viele Grüße<br />Luca, Waxcelerate</p>`
        )
      : Promise.resolve(true),
  ]);

  if (!ownerNotified) {
    console.error('[rewax-request] ALERT: owner notification failed to send', {
      tierId, safeQuantity, safeName, safeContact, receivedAt,
    });
  }

  return res.json({ success: true });
}
