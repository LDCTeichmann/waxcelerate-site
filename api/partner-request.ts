import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/partner-request — Testpaket-Anfrage von der Partnerseite (/partner).
 * Gleiche Bauweise wie api/rewax-request.ts: Honeypot, Validierung, HTML-Escaping,
 * Mail ueber Resend an Luca, Bestaetigung an den Absender, sofern er eine
 * E-Mail-Adresse angegeben hat.
 *
 * Bewusst in sich geschlossen (kein api/_lib): ein gemeinsames E-Mail-Modul hat
 * am 03.09.2026 mehrere Endpunkte in Produktion gebrochen, siehe api/widerruf.ts.
 */

interface PartnerRequestBody {
  shopName: string;
  city: string;
  name: string;
  contact: string;
  message?: string;
  testpaket?: boolean;
  shopSlug?: string;
  source?: string;
  honeypot?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()/-]{5,}$/;
const OWNER_EMAIL = 'waxcelerate@gmail.com';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

// Zeilenumbrueche und Steuerzeichen aus Betreff-Feldern entfernen (Header-Injection).
const oneLine = (s: string, max: number) => s.replace(/[\r\n\u0000-\u001f]+/g, ' ').trim().slice(0, max);

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[partner-request] RESEND_API_KEY not set — email not sent', { to, subject });
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Waxcelerate <widerruf@waxcelerate.de>', to: [to], subject, html }),
  });
  if (!res.ok) {
    console.error('[partner-request] Resend API error', await res.text());
    return false;
  }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Cache-Control', 'no-store');

  const { shopName, city, name, contact, message, testpaket, shopSlug, source, honeypot } =
    (req.body ?? {}) as Partial<PartnerRequestBody>;

  // Bots fuellen jedes Feld. Erfolg melden, nichts senden, kein Signal zum Wiederholen.
  if (honeypot) return res.json({ success: true });

  const cleanShop = typeof shopName === 'string' ? oneLine(shopName, 120) : '';
  const cleanCity = typeof city === 'string' ? oneLine(city, 80) : '';
  const cleanName = typeof name === 'string' ? oneLine(name, 100) : '';
  const cleanContact = typeof contact === 'string' ? oneLine(contact, 120) : '';
  if (!cleanShop || !cleanCity || !cleanName || !cleanContact) {
    return res.status(400).json({ error: 'Bitte Laden, Stadt, Ansprechpartner und Kontakt angeben.' });
  }
  if (!EMAIL_RE.test(cleanContact) && !PHONE_RE.test(cleanContact)) {
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse oder Telefonnummer angeben.' });
  }

  const safeShop = escapeHtml(cleanShop);
  const safeCity = escapeHtml(cleanCity);
  const safeName = escapeHtml(cleanName);
  const safeContact = escapeHtml(cleanContact);
  const safeMessage = typeof message === 'string' && message.trim() ? escapeHtml(message.trim().slice(0, 2000)) : '';
  const safeSlug = typeof shopSlug === 'string' ? escapeHtml(oneLine(shopSlug, 60)) : '';
  const safeSource = typeof source === 'string' && source ? escapeHtml(oneLine(source, 20)) : 'direkt';
  const receivedAt = new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });

  const [ownerNotified] = await Promise.all([
    sendEmail(
      OWNER_EMAIL,
      `Partner-Anfrage: ${cleanShop}, ${cleanCity}${testpaket ? ' (Testpaket)' : ''}`,
      `<p>Neue Anfrage über die Partnerseite (${receivedAt}):</p>
       <ul>
         <li><strong>Laden:</strong> ${safeShop}</li>
         <li><strong>Stadt:</strong> ${safeCity}</li>
         <li><strong>Ansprechpartner:</strong> ${safeName}</li>
         <li><strong>Kontakt:</strong> ${safeContact}</li>
         <li><strong>Testpaket gewünscht:</strong> ${testpaket ? 'ja' : 'nein'}</li>
         <li><strong>Herkunft:</strong> ${safeSource}${safeSlug ? ` · personalisierter Link: ${safeSlug}` : ''}</li>
         ${safeMessage ? `<li><strong>Nachricht:</strong> ${safeMessage}</li>` : ''}
       </ul>`
    ),
    EMAIL_RE.test(cleanContact)
      ? sendEmail(
          cleanContact,
          'Ihre Anfrage bei Waxcelerate ist angekommen',
          `<p>Hallo ${safeName},</p>
           <p>vielen Dank für Ihre Anfrage für ${safeShop}. Ich melde mich am selben Tag bei Ihnen${testpaket ? ' und stimme mit Ihnen das Testpaket ab' : ''}.</p>
           <p>Beste Grüße,<br />Luca (waxcelerate)</p>`
        )
      : Promise.resolve(true),
  ]);

  if (!ownerNotified) {
    console.error('[partner-request] ALERT: owner notification failed to send', { cleanShop, cleanCity, cleanName, cleanContact, receivedAt });
    // Ohne Mail an Luca ginge die Anfrage verloren. Dem Absender ehrlich einen Fehler zeigen,
    // damit er den WhatsApp-Weg nimmt, statt auf eine Antwort zu warten.
    return res.status(502).json({ error: 'Die Anfrage konnte gerade nicht zugestellt werden. Schreiben Sie uns bitte kurz per WhatsApp.' });
  }

  return res.json({ success: true });
}
