import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { products } from '../src/lib/data.js';

/**
 * Partnerbereich (/partner/konditionen): Zugang per Code, Inhalt nur serverseitig.
 *
 *   POST   { code }  -> prueft den Code, setzt ein signiertes HttpOnly-Cookie, liefert die Konditionen
 *   GET              -> liefert die Konditionen, wenn das Cookie gueltig ist und der Code noch aktiv
 *   DELETE           -> Abmelden (Cookie loeschen)
 *
 * Codes liegen in Upstash Redis unter `partner:code:<CODE>` (Shop, Stadt, Land, aktiv) und werden mit
 * scripts/partner-code.mjs angelegt, aufgelistet und gesperrt. Ein gesperrter Code wirkt sofort, auch
 * fuer bereits ausgestellte Cookies, weil jeder GET den Code erneut prueft.
 *
 * Die Konditionen stehen absichtlich NUR in dieser Datei und nie in src/: alles unter src/ landet im
 * oeffentlichen Bundle. Nie hier hinein: interne Margen, Ketten-Rohertrag, Formel, Mechaniker-EK.
 *
 * Bewusst in sich geschlossen (kein api/_lib), siehe Hinweis in api/partner-request.ts.
 *
 * Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, PARTNER_SESSION_SECRET (mind. 32 Zeichen),
 *      optional RESEND_API_KEY (Mail an Luca beim ersten Login eines Codes).
 */

type Country = 'DE' | 'AT';
interface CodeRecord { shop: string; city: string; country: Country; active: boolean; createdAt: string }

interface Section {
  id: string;
  title: string;
  note?: string;
  table?: { head: string[]; rows: string[][] };
  items?: string[];
}

const COOKIE = 'wx_partner';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const CODE_RE = /^WX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const RATE_LIMIT = 10;
const RATE_WINDOW_S = 15 * 60;
const OWNER_EMAIL = 'waxcelerate@gmail.com';

// Gleicher Wert wie COBRANDING_MIN_BLOCKS in src/pages/partner/content.ts (dort erklaert, warum 16).
const COBRANDING_MIN_BLOCKS = 16;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
const uvp = (id: string) => {
  const p = products.find((x) => x.id === id);
  return p ? eur(p.price) : '';
};

// ─── Konditionen (Stand: Masterplan 08.07.2026 und Infoblatt 18.09.2026, von Luca zu bestaetigen) ──
function buildConditions(country: Country): Section[] {
  const at = country === 'AT';
  const minChains = at ? 10 : 5;

  // Österreich: Mindestmenge 10 bei gleichem Preis ohne Zuschlag, die 8,95-Stufe erst ab 20 Ketten je Sendung
  // (sonst würde sie dort immer gelten). Deutschland: Stufen wie im Masterplan.
  const rewaxRows = at
    ? [
        ['10–19 Ketten', '9,95 €'],
        ['ab 20 Ketten je Sendung', '8,95 €'],
        ['Rahmenvereinbarung, ab 20 Ketten pro Woche', '8,50 €'],
      ]
    : [
        ['5–9 Ketten', '9,95 €'],
        ['ab 10 Ketten', '8,95 €'],
        ['Rahmenvereinbarung, ab 20 Ketten pro Woche', '8,50 €'],
      ];

  return [
    {
      // An Laeden geht nur MoS2 Pro 500 g (Luca, 24.09.2026). Stufen an den DHL-Gewichtsklassen
      // (0,6 kg je Block): 3 = bis 2 kg, 8 = bis 5 kg, 16 = bis 10 kg. Shop-Marge bei 34,95 EUR:
      // 35,6 / 39,9 / 44,2 %. Kalkulation: docs/plaene/PARTNER_SEITE.md.
      id: 'wachs-direktkauf',
      title: 'Wachs im Direktkauf',
      note: 'Preise je Block, ohne Umsatzsteuer (Kleinunternehmer nach § 19 UStG). Endkundenpreise sind unverbindliche Empfehlungen, Ihre Preise bestimmen Sie.',
      table: {
        head: ['Produkt (Preisempfehlung)', 'ab 3', 'ab 8', 'ab 16'],
        rows: [[`MoS₂ Pro Edition 500 g (${uvp('wax-500-mos2')})`, '22,50 €', '21,00 €', '19,50 €']],
      },
      items: ['Ab 32 Blöcken sprechen wir über eine Rahmenvereinbarung.'],
    },
    {
      id: 'kommission',
      title: 'Wachs auf Kommission',
      items: [
        '30 % Marge auf das verkaufte Wachs. Sie kaufen nichts ein und binden kein Kapital.',
        'Unverkauftes holen wir auf unsere Kosten zurück. Das ist das 0 € Warenrisiko.',
        'Das Testpaket ist ein Paket mit 8 Blöcken MoS₂ Pro: 7 auf Kommission, 1 gratis für die Werkstatt, zum Selbsttesten.',
        'Kommission gibt es nur für Wachs, nie für Ketten.',
        'Ware mit Ihrem Logo (Co-Branding) gibt es nur im Direktkauf, nie auf Kommission.',
      ],
    },
    {
      id: 'ketten',
      title: 'Vorgewachste Ketten',
      items: [
        'Nur im Direktkauf, nicht auf Kommission.',
        '5–10 % Staffelrabatt ab Menge. Die genauen Stufen nennen wir Ihnen im Gespräch.',
        'Lagern Sie zwei bis drei Typen, passend zu Ihrer Kundschaft. Den Rest liefern wir in 48–72 h innerhalb Deutschlands.',
      ],
    },
    {
      id: 'rewax',
      title: 'Rewax-Service (Kreislauf)',
      note: 'Preise je Kette inklusive Rückversand. Den Hinversand zahlt der Shop. Nur Ketten aus dem Waxcelerate-System.',
      table: { head: ['Menge je Sendung', 'Preis je Kette'], rows: rewaxRows },
      items: [
        at
          ? 'Mindestmenge: 10 Ketten pro Sendung. Gleicher Preis, kein Österreich-Zuschlag.'
          : 'Mindestmenge: 5 Ketten pro Sendung.',
        at
          ? 'Laufzeit von Absendung bis Rückkehr: ca. 8–10 Werktage.'
          : 'Laufzeit von Absendung bis Rückkehr: in der Regel 5 Werktage (3 Werktage Bearbeitung ab Ankunft bei uns, dazu Post).',
        'Durch die Zweitkette beim Kunden spielt die Laufzeit keine Rolle.',
        'Annahme: Verschleißprüfung und Tauschentscheidung liegen bei Ihnen. Geölte oder kontaminierte Ketten bearbeiten wir nicht, sie gehen auf Ihre Kosten zurück.',
        `Sammelbox auf der Theke mit aufgedruckter Regel: Ab ${minChains} Ketten einsenden.`,
        'Nummerierte Beutel oder Tags: Die Zuordnung von Kunde zu Kette machen Sie, wir garantieren die Unversehrtheit der Beutel.',
      ],
    },
    {
      id: 'karten',
      title: 'Stempelkarten',
      items: [
        'Ihr Shop gibt die Karte aus und setzt den Preis. Eine Preisempfehlung nennen wir Ihnen im Gespräch.',
        'Unser Preis bleibt je eingesandter Kette derselbe, egal was auf der Karte steht.',
        'Blanko-Karten liefern wir kostenlos, co-brandbar mit Ihrem Logo.',
        'Nicht eingelöste Stempel bleiben Ihre Marge.',
        'Gutscheine in Deutschland gelten mindestens drei Jahre. Bitte keine kürzeren Ablaufdaten aufdrucken.',
        'Erstattungszusage: Können wir vorausverkaufte Rewax-Zyklen nicht erfüllen, erstatten wir Ihnen die Differenz.',
      ],
    },
    {
      id: 'cobranding',
      title: 'Co-Branding',
      items: [
        `Ihr Logo auf dem Etikett, kostenlos, im Direktkauf ab ${COBRANDING_MIN_BLOCKS} Blöcken (ein volles Paket).`,
        'Nie auf Kommissionsware.',
      ],
    },
    {
      id: 'zahlung',
      title: 'Zahlung und Lieferung',
      items: [
        'Erste Bestellung per Vorkasse, danach Rechnung mit 14 Tagen Zahlungsziel.',
        at
          ? 'Lieferzeiten und Versandkosten nach Österreich nennen wir Ihnen bei der Bestellung.'
          : 'Lieferung innerhalb Deutschlands in 48–72 h. Wachs liefern wir frei Haus ab 8 Blöcken, darunter berechnen wir 7,70 € Versand.',
        'Bestellungen und Fragen: WhatsApp oder Telefon 0157 51957470.',
      ],
    },
  ];
}

// ─── Cookie / Signatur ─────────────────────────────────────────────────────
const b64u = (s: string) => Buffer.from(s).toString('base64url');
const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url');

function makeToken(code: string, secret: string): string {
  const payload = b64u(JSON.stringify({ c: code, e: Date.now() + COOKIE_MAX_AGE * 1000 }));
  return `${payload}.${sign(payload, secret)}`;
}

function readToken(cookieHeader: string | undefined, secret: string): string | null {
  const raw = cookieHeader?.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { c, e } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { c: string; e: number };
    return typeof c === 'string' && typeof e === 'number' && e > Date.now() && CODE_RE.test(c) ? c : null;
  } catch {
    return null;
  }
}

const cookieAttrs = 'HttpOnly; Secure; SameSite=Strict; Path=/api/partner-access';

async function sendOwnerMail(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Waxcelerate <widerruf@waxcelerate.de>', to: [OWNER_EMAIL], subject, html }),
    });
  } catch (err) {
    console.error('[partner-access] owner mail failed', err);
  }
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function payloadFor(rec: CodeRecord) {
  return { ok: true, shop: rec.shop, city: rec.city, country: rec.country, sections: buildConditions(rec.country) };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const secret = process.env.PARTNER_SESSION_SECRET;
  if (!secret || secret.length < 32 || !redis) {
    console.error('[partner-access] not configured (PARTNER_SESSION_SECRET / Upstash)');
    return res.status(503).json({ error: 'not_configured' });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieAttrs}; Max-Age=0`);
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    const code = readToken(req.headers.cookie, secret);
    if (!code) return res.status(401).json({ error: 'unauthorized' });
    const rec = await redis.get<CodeRecord>(`partner:code:${code}`);
    if (!rec || !rec.active) {
      res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieAttrs}; Max-Age=0`);
      return res.status(401).json({ error: 'unauthorized' });
    }
    return res.json(payloadFor(rec));
  }

  if (req.method !== 'POST') return res.status(405).end();

  // Rate-Limit je IP (gehasht, 15 Minuten). Jeder Versuch zaehlt, auch ein erfolgreicher.
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();
  const rlKey = `partner:rl:${createHash('sha256').update(ip).digest('hex').slice(0, 16)}`;
  const attempts = await redis.incr(rlKey);
  if (attempts === 1) await redis.expire(rlKey, RATE_WINDOW_S);
  if (attempts > RATE_LIMIT) return res.status(429).json({ error: 'too_many_attempts' });

  const raw = typeof (req.body as { code?: unknown } | undefined)?.code === 'string' ? (req.body as { code: string }).code : '';
  const code = raw.toUpperCase().replace(/\s+/g, '');
  // Gleiche Antwort fuer "falsches Format", "unbekannt" und "gesperrt": kein Hinweis, welche Codes es gibt.
  const invalid = () => res.status(401).json({ error: 'invalid_code' });
  if (!CODE_RE.test(code)) return invalid();
  const rec = await redis.get<CodeRecord>(`partner:code:${code}`);
  if (!rec || !rec.active) return invalid();

  res.setHeader('Set-Cookie', `${COOKIE}=${makeToken(code, secret)}; ${cookieAttrs}; Max-Age=${COOKIE_MAX_AGE}`);

  // Erster Login dieses Codes: Luca bekommt eine Mail (gutes Vertriebssignal).
  const first = await redis.set(`partner:seen:${code}`, new Date().toISOString(), { nx: true });
  if (first) {
    await sendOwnerMail(
      `Partner-Login: ${rec.shop} hat die Konditionen geöffnet`,
      `<p><strong>${escapeHtml(rec.shop)}</strong> (${escapeHtml(rec.city)}, ${rec.country}) hat sich zum ersten Mal im Partnerbereich angemeldet.</p>`
    );
  }
  return res.json(payloadFor(rec));
}
