// ─── /rewax — the service page ───────────────────────────────────────────────
// The rewax service is the only recurring revenue in the whole model and had no
// address on the website: no route, no menu entry, no page. This is that page.
//
// Its hardest job is not selling. It is saying no clearly: we rewax chains that
// are already waxed, ours or anyone's, and we do not strip and first-wax an
// oiled chain. That limit is not a policy, it is physics — a single oiled chain
// contaminates the bath and the oil floats on top and blocks penetration, so the
// batch has to be thrown away. Saying that plainly costs a few orders and buys
// the trust the rest of the brand runs on.
//
// Prices per Luca, 2026-07-28: 13,95 € for one chain, 9,95 € per chain from
// three, plus 1,80 € return shipping either way. These supersede the older
// figures in the business context (9,99 / 24,99).

import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Gift, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { prefersReducedMotion } from '@/hooks/useAnimation';

import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { WaxcelerateMark } from '@/components/WaxcelerateMark';
import { GiftPreviewModal } from '@/components/GiftPreviewModal';

// One tap, no form, no scrolling to a contact section that may or may not be
// reachable from a route. The previous CTA pointed at /#kontakt and did not
// land, which for the only recurring-revenue page on the site is the worst
// possible place for a dead button.
const WA_NUMBER = '4915751957470';
const waLink = (de: boolean, waxedLabel?: string | null) =>
  `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(
    de
      ? ('Hi Luca, ich möchte Ketten zum Rewaxen einschicken.'
        + (waxedLabel ? ` Die Karte sagt gewachst am ${waxedLabel}.` : '')
        + ' Anzahl: ')
      : ('Hi Luca, I would like to send in chains for rewaxing.'
        + (waxedLabel ? ` The card says waxed ${waxedLabel}.` : '')
        + ' Number of chains: '),
  );
// Ablauf-Schritte: eine Quelle, zwei Darstellungen — kompakte Textliste im
// Hero (ab lg, füllt den Raum neben dem Formular), Foto-Schritte in der
// Preis-Sektion (unter lg, wo im Hero kein Platz ist).
const STEPS = [
  { n: 1, de: 'Einschicken', en: 'Send it', bodyDe: 'Am Quick-Link raus, in den Umschlag.', bodyEn: 'Off at the quick link, into an envelope.', img: '/images/rewax/step-1' },
  { n: 2, de: 'Waschen & Wachsen', en: 'Wash & wax', bodyDe: 'Ultraschallgereinigt, dann frisch im Wachsbad.', bodyEn: 'Ultrasonically cleaned, then fresh in the wax bath.', img: '/images/rewax/step-2' },
  { n: 3, de: 'Zurück aufs Rad', en: 'Back on the bike', bodyDe: 'Ausgehärtet, anbauen, kurbeln, los.', bodyEn: 'Cured, fit it, turn the cranks, ride.', img: '/images/rewax/step-3' },
] as const;

function parseWaxedStamp(raw: string | null): Date | null {
  const s = (raw || '').trim();
  if (!s) return null;
  let y = 0, mo = 0, day = 0;
  if (/^\d{8}$/.test(s)) {
    y = Number(s.slice(0, 4));
    mo = Number(s.slice(4, 6));
    day = Number(s.slice(6, 8));
  } else {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    y = Number(m[1]); mo = Number(m[2]); day = Number(m[3]);
  }
  const dt = new Date(y, mo - 1, day);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== day) return null;
  const earliest = new Date(2020, 0, 1);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dt < earliest || dt > today) return null;
  return dt;
}

function waxedFromLocation(): Date | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const fromQ = parseWaxedStamp(q.get('w') || q.get('waxed'));
  if (fromQ) return fromQ;
  const h = (window.location.hash || '').replace(/^#/, '');
  const m = h.match(/(?:^|[?&])w=(\d{8}|\d{4}-\d{2}-\d{2})/) || h.match(/^(\d{8})$/);
  return parseWaxedStamp(m ? m[1] : null);
}

const W = 'mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14';

const PRICE = {
  single: 13.95,
  bundle: 9.95,
  bundleCount: 3,
  // Eine Kette passt in den Großbrief (1,80 €). Drei Ketten brauchen den
  // Maxibrief (2,90 €) — deshalb zwei Versandpreise statt einem.
  shippingSingle: 1.80,
  shippingBundle: 2.90,
};

// Prepaid cards (Luca, 2026-09-06). Two changes from the earlier model:
//
// 1. Anker ist der EINZELPREIS (13,95 €), nicht mehr der Dreierpreis. Wer eine
//    Karte kauft, hat ein bis zwei Ketten — drei plus in Rotation schickt man
//    ohnehin zusammen für 9,95 €. Gegen 9,95 € sah die Karte nach 10/15 %
//    aus, gegen den Preis, den der Kartenkäufer real zahlt, spart sie ~30 %.
// 2. All-in: der Kartenpreis deckt Wachsen UND Rückversand. Deshalb ein fest
//    gesetzter Preis statt einer Formel — er ist eine Geschäftsentscheidung
//    (Porto-Deckung bei ~2-3 Ketten je Sendung, Selbstkosten 3-5 €/Vorgang),
//    keine Ableitung. `list` bleibt abgeleitet, damit der Anker nie driftet.
const TEN_CARD = {
  count: 10,
  get list() { return PRICE.single * this.count; }, // 139,50 €
  price: 94.50,                                      // 9,45 €/Vorgang, Rückversand inklusive
};

const FIVE_CARD = {
  count: 5,
  get list() { return PRICE.single * this.count; }, // 69,75 €
  price: 49.75,                                      // 9,95 €/Vorgang, Rückversand inklusive
};

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// ─── Request form ────────────────────────────────────────────────────────────
// The second Bestellweg next to WhatsApp/mailto — additive, not a
// replacement (WhatsApp stays the primary CTA). Posts to api/rewax-request.ts,
// which only sends an email today; `tierId` deliberately mirrors what would
// become `productId` in a future api/create-checkout.ts call (see that file's
// { items: [{ productId, quantity }] } shape) so activating real Stripe
// payment later means swapping the submit target, not redesigning this form.
// Input/label/error/success conventions mirror the site's one other real
// form, WiderrufPage.tsx — same input styling, same --danger/CheckCircle2
// pattern — so this doesn't invent a second "how forms look" on the site.
type TierId = 'single' | 'bundle3' | 'five' | 'ten';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()/-]{5,}$/;

function RewaxRequestForm({ de }: { de: boolean }) {
  // Preis-Label je Kachel ist IMMER ein Pro-Vorgang-Preis, nie ein
  // Gesamtpreis — vorher zeigte die 5er/10er-Karte ihren bereits
  // rabattierten GESAMTpreis (z.B. 44,78 €) direkt neben Kacheln, die einen
  // Pro-Kette-Preis zeigen (13,95 €, 9,95 €/Kette), ohne das kenntlich zu
  // machen. Las sich wie ein viel teurerer Pro-Kette-Preis. Der tatsaechliche
  // Gesamtbetrag steht jetzt separat in der Gesamt-Zeile unter der Auswahl,
  // die live mitrechnet (siehe totalPrice unten).
  const tiers: { id: TierId; labelDe: string; labelEn: string; price: string; hasQuantity: boolean; quantityMin: number }[] = [
    { id: 'single', labelDe: 'Einzelne Kette', labelEn: 'Single chain', price: eur(PRICE.single, de), hasQuantity: true, quantityMin: 1 },
    { id: 'bundle3', labelDe: 'Drei Ketten', labelEn: 'Three chains', price: `${eur(PRICE.bundle, de)}/${de ? 'Kette' : 'chain'}`, hasQuantity: true, quantityMin: 3 },
    { id: 'five', labelDe: '5er-Karte', labelEn: '5-visit card', price: `${eur(FIVE_CARD.price / FIVE_CARD.count, de)}/${de ? 'Kette' : 'chain'}`, hasQuantity: false, quantityMin: 1 },
    { id: 'ten', labelDe: '10er-Karte', labelEn: '10-visit card', price: `${eur(TEN_CARD.price / TEN_CARD.count, de)}/${de ? 'Kette' : 'chain'}`, hasQuantity: false, quantityMin: 1 },
  ];

  const [tierId, setTierId] = useState<TierId>('single');
  const [quantity, setQuantity] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const activeTier = tiers.find(t => t.id === tierId)!;
  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none';
  const inputStyle = { background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)' };

  const contactLooksValid = EMAIL_RE.test(contact) || PHONE_RE.test(contact);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactLooksValid) {
      setError(de ? 'Bitte eine gültige E-Mail-Adresse oder Telefonnummer angeben.' : 'Please enter a valid email address or phone number.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/rewax-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId, quantity: activeTier.hasQuantity ? quantity : undefined, isGift, name, contact, message, honeypot,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? (de ? 'Die Anfrage konnte nicht übermittelt werden.' : 'The request could not be submitted.'));
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : (de ? 'Die Anfrage konnte nicht übermittelt werden.' : 'The request could not be submitted.'));
    }
  };

  if (status === 'done') {
    return (
      <div className="flex items-start gap-3 rounded-xl p-5 mt-4 max-w-md"
        style={{ background: 'var(--accent-wash)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}>
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--tx1)' }}>
          {de
            ? 'Danke, deine Anfrage ist angekommen. Wir melden uns in Kürze mit der Versandadresse.'
            : "Thanks, your request has arrived. We'll get back to you shortly with the shipping address."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4 max-w-md rounded-2xl p-5 sm:p-6"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
      {/* Honeypot — real users never see or fill this. Bots that fill every
          field get a normal-looking success response with nothing sent. */}
      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

      <div>
        <p className="block text-sm font-medium mb-1.5" style={{ color: 'var(--txm)' }}>
          {de ? 'Karte wählen' : 'Choose tier'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {tiers.map((t) => (
            <button key={t.id} type="button"
              onClick={() => { setTierId(t.id); setQuantity(t.quantityMin); }}
              className="rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-colors"
              style={{
                background: tierId === t.id ? 'var(--accent)' : 'var(--sf2)',
                color: tierId === t.id ? '#fff' : 'var(--tx1)',
                border: `1px solid ${tierId === t.id ? 'var(--accent)' : 'var(--bd2)'}`,
              }}>
              {de ? t.labelDe : t.labelEn}
              <span className="block text-[11px] font-normal mt-0.5" style={{ opacity: 0.85 }}>{t.price}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTier.hasQuantity && (
        <div>
          <label htmlFor="rewax-quantity" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--txm)' }}>
            {de ? 'Anzahl Ketten' : 'Number of chains'}
          </label>
          <input id="rewax-quantity" type="number" min={activeTier.quantityMin} max={20} value={quantity}
            onChange={(e) => setQuantity(Math.max(activeTier.quantityMin, parseInt(e.target.value, 10) || activeTier.quantityMin))}
            className={inputClass} style={inputStyle} />
        </div>
      )}

      {/* Gesamtsumme, live nachgerechnet. Die Kachel oben zeigt bewusst nur
          den Pro-Vorgang-Preis (siehe Kommentar bei tiers) — ohne diese Zeile
          stuende nirgends im Formular, was am Ende wirklich fällig wird. */}
      <div className="rounded-xl px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.18)' }}>
        <span className="text-[12.5px]" style={{ color: 'var(--txm)' }}>
          {de ? 'Gesamt' : 'Total'}
          {!activeTier.hasQuantity && (
            <span style={{ color: 'var(--txf)' }}>
              {' · '}{activeTier.id === 'five' ? FIVE_CARD.count : TEN_CARD.count} {de ? 'Vorgänge' : 'treatments'}
            </span>
          )}
        </span>
        <span className="font-display font-bold" style={{ fontSize: '1.15rem', color: 'var(--tx1)' }}>
          {eur(
            activeTier.id === 'single' ? PRICE.single * quantity
              : activeTier.id === 'bundle3' ? PRICE.bundle * quantity
              : activeTier.id === 'five' ? FIVE_CARD.price
              : TEN_CARD.price,
            de,
          )}
        </span>
      </div>

      <div className="inline-flex rounded-full p-1" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
        {([
          { key: false, labelDe: 'Für mich', labelEn: 'For me', Icon: User },
          { key: true, labelDe: 'Als Geschenk', labelEn: 'As a gift', Icon: Gift },
        ] as const).map(({ key, labelDe, labelEn, Icon }) => (
          <button key={String(key)} type="button" onClick={() => setIsGift(key)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
            style={{ background: isGift === key ? 'var(--accent)' : 'transparent', color: isGift === key ? '#fff' : 'var(--txm)' }}>
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {de ? labelDe : labelEn}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="rewax-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--txm)' }}>
          {de ? 'Name' : 'Name'}
        </label>
        <input id="rewax-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="rewax-contact" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--txm)' }}>
          {de ? 'E-Mail oder Telefon' : 'Email or phone'}
        </label>
        <input id="rewax-contact" type="text" required value={contact} onChange={(e) => setContact(e.target.value)}
          className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="rewax-message" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--txm)' }}>
          {de ? 'Nachricht (optional)' : 'Message (optional)'}
        </label>
        <textarea id="rewax-message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)}
          className={inputClass} style={inputStyle} />
      </div>

      {status === 'error' && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
      )}

      <button type="submit" disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: 'var(--accent)', color: '#fff' }}>
        {status === 'sending' ? (de ? 'Wird gesendet …' : 'Sending …') : (de ? 'Anfrage senden' : 'Send request')}
      </button>
    </form>
  );
}

// ─── Stamp card ──────────────────────────────────────────────────────────────
// A real punch-card look: a grid of stamp fields, each holding our own logo
// in its actual brand colors instead of a generic chain-link glyph. Both
// cards share the accent wash background now, not just the recommended one
// — the point is two cards that both read as "proper branded stamp cards"
// sitting side by side for comparison, not one plain + one highlighted.
function StampCard({ de, count, price, list, gift, recommended, onPreview }: {
  de: boolean; count: number; price: number; list: number; gift: boolean; recommended?: boolean;
  onPreview?: () => void;
}) {
  const label = de ? `${count}er-Karte` : `${count}-visit card`;
  const savings = list - price;
  const pct = Math.round((1 - price / list) * 100);

  // Stamps start pale/gray — a wall of full-color logos read as "too much" —
  // then stamp in one after another, staggered, once the card scrolls into
  // view, and keep looping (fill → hold, fully stamped → wipe → pause, empty
  // → fill again) for as long as the card stays mounted: this is a demo of
  // what using the card looks like, not a one-shot reveal, so it shouldn't
  // exhaust itself after a single pass. Just a self-observing
  // IntersectionObserver to start the loop (the pattern already used for
  // simple in-view flags elsewhere on the site, e.g. products.tsx/
  // reviews.tsx), not the GSAP-based use3DReveal hook: that one tweens
  // opacity/y/rotateX, not filter, and pulling in ScrollTrigger for a
  // one-property grayscale fade would be more machinery than the effect
  // needs. The stamp-in itself is a real CSS keyframe (wx-stamp-pop in
  // index.css) with a scale overshoot, not a plain filter transition — it
  // needs to read as a discrete impact per field, not a smooth wash, paired
  // with a box-shadow ring pulse (wx-stamp-ring) on the field itself so the
  // "something just landed here" moment doesn't rely on a 24px glyph alone
  // to be noticed. The end state is deliberately muted (grayscale/
  // saturate/opacity), not full brand color — a wall of 10 vivid logos was
  // too loud even once "stamped".
  //
  // Timing lives in JS (a chained setTimeout, not a single CSS animation per
  // field) because the reset has to be a synchronized, all-at-once wipe —
  // independent per-field CSS delays would keep each field's own phase
  // offset forever, so they'd wipe staggered too instead of together.
  // stampedCount is how many fields (left to right) are currently "on";
  // each field's own style flips from dim to the pop animation the instant
  // its index enters that range, so only the field that just turned on ever
  // visibly restarts wx-stamp-pop — the ones already on keep re-applying an
  // unchanged style and just sit at the animation's held end frame.
  const STAMP_STAGGER_MS = 950;
  const STAMP_HOLD_MS = 3400;
  const STAMP_EMPTY_PAUSE_MS = 1300;
  const gridRef = useRef<HTMLDivElement>(null);
  const [stampedCount, setStampedCount] = useState(0);
  const [inView, setInView] = useState(false);
  const [reduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (reduced) { setStampedCount(count); return; }
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !inView) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const runCycle = (i: number) => {
      if (cancelled) return;
      if (i <= count) {
        setStampedCount(i);
        timer = setTimeout(() => runCycle(i + 1), STAMP_STAGGER_MS);
      } else {
        timer = setTimeout(() => {
          if (cancelled) return;
          setStampedCount(0);
          timer = setTimeout(() => runCycle(1), STAMP_EMPTY_PAUSE_MS);
        }, STAMP_HOLD_MS);
      }
    };
    timer = setTimeout(() => runCycle(1), STAMP_STAGGER_MS);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [inView, reduced, count]);

  const waMsg = gift
    ? (de
      ? `Hi Luca, ich möchte die ${label} als Geschenk bestellen. Name der beschenkten Person: `
      : `Hi Luca, I would like to order the ${label} as a gift. Recipient's name: `)
    : (de
      ? `Hi Luca, ich möchte die ${label} bestellen.`
      : `Hi Luca, I would like to order the ${label}.`);

  return (
    <div className="rounded-2xl p-4 sm:p-5 flex flex-col h-full"
      style={{
        background: 'var(--accent-wash-sm)',
        border: '1px solid rgba(var(--accent-rgb),0.22)',
        boxShadow: 'var(--card-shad)',
      }}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-3">
        <p className="text-small uppercase tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
          {label}
        </p>
        {recommended && (
          <span className="num-data px-1.5 py-0.5 rounded-full" style={{ fontSize: 9.5, background: 'var(--sf)', border: '1px solid rgba(var(--accent-rgb),0.20)', color: 'var(--accent)' }}>
            {de ? 'bester Preis' : 'best price'}
          </span>
        )}
      </div>

      {/* Immer 10 Felder rendern (zwei Reihen), auch auf der 5er-Karte —
          die ueberzaehligen bleiben unsichtbar, aber layout-wirksam, damit
          Preis/Ersparnis auf beiden Karten an derselben Y-Position beginnen,
          egal ob die Karte eine oder zwei Stempelreihen zeigt. */}
      <div ref={gridRef} className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => {
          const isOn = reduced ? i < count : i < stampedCount;
          return (
          <div key={i} className="relative rounded-md flex items-center justify-center"
            style={{
              aspectRatio: '1 / 1', border: '1px dashed rgba(var(--accent-rgb),0.35)', background: 'var(--sf)',
              visibility: i < count ? 'visible' : 'hidden',
              ...(isOn && !reduced
                ? { animationName: 'wx-stamp-ring', animationDuration: '1150ms', animationTimingFunction: 'ease-out', animationFillMode: 'forwards' }
                : null),
            }}
            aria-hidden={i >= count}>
            <div className="w-[62%] h-[62%]"
              style={
                reduced
                  ? { filter: 'grayscale(0.35) saturate(0.6) brightness(1.05) opacity(0.9)' }
                  : isOn
                  ? {
                      animationName: 'wx-stamp-pop',
                      animationDuration: '1150ms',
                      animationTimingFunction: 'cubic-bezier(0.34, 1.42, 0.64, 1)',
                      animationFillMode: 'forwards',
                    }
                  : { filter: 'grayscale(1) opacity(0.4)' }
              }>
              <WaxcelerateMark className="w-full h-full" />
            </div>
          </div>
          );
        })}
      </div>

      <div className="flex items-baseline gap-2 mt-6">
        <p className="font-display font-bold text-wx-tx1 leading-none" style={{ fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
          {eur(price, de)}
        </p>
        <p className="num-data text-[11px] line-through" style={{ color: 'var(--txff)' }}>
          {eur(list, de)}
        </p>
      </div>
      {/* Zwei Zeilen statt vorher vier: die Ersparnis (jetzt gegen den
          Einzelpreis gerechnet, also eine echte Zahl) und eine
          Merkmals-Zeile. Wie man die Karte spaeter einloest, stand vorher auf
          JEDER Karte — das steht jetzt einmal unter beiden Karten und in der
          FAQ, damit die Karte selbst nicht wieder zur Textwand wird. */}
      <p className="text-[11.5px] mt-1" style={{ color: 'var(--accent)' }}>
        {de ? `Du sparst ${eur(savings, de)} (${pct} %)` : `You save ${eur(savings, de)} (${pct}%)`}
      </p>
      <p className="text-[11px] mt-1 mb-4" style={{ color: 'var(--txf)' }}>
        {de
          ? `${eur(price / count, de)} je Vorgang · Rückversand inklusive · übertragbar`
          : `${eur(price / count, de)} per treatment · return shipping included · transferable`}
      </p>

      {gift && onPreview && (
        <button type="button" onClick={onPreview}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-3 transition-opacity hover:opacity-70"
          style={{ color: 'var(--accent)' }}>
          {de ? 'Geschenk-Vorschau ansehen' : 'See gift preview'}
          <ArrowRight className="h-3 w-3" />
        </button>
      )}

      <div className="flex-1" />

      <a href={`https://wa.me/4915751957470?text=${encodeURIComponent(waMsg)}`}
        target="_blank" rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent)', color: '#fff' }}>
        {gift ? (de ? 'Als Geschenk anfragen' : 'Request as a gift') : (de ? 'Karte anfragen' : 'Request this card')}
        {gift ? <Gift className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
      </a>
    </div>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
function Pricing({ de }: { de: boolean }) {
  const bundleTotal = PRICE.bundle * PRICE.bundleCount;

  const plans = [
    {
      key: 'single',
      titleDe: 'Einzelne Kette', titleEn: 'Single chain',
      per: PRICE.single,
      total: PRICE.single,
      shipping: PRICE.shippingSingle,
      accent: false,
    },
    {
      key: 'bundle',
      titleDe: 'Drei Ketten', titleEn: 'Three chains',
      per: PRICE.bundle,
      total: bundleTotal,
      shipping: PRICE.shippingBundle,
      accent: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {plans.map(p => (
        <div key={p.key} className="rounded-2xl p-4 sm:p-6"
          style={{
            background: p.accent ? 'var(--accent-wash-sm)' : 'var(--sf)',
            border: p.accent ? '1px solid rgba(var(--accent-rgb),0.22)' : '1px solid var(--bd)',
          }}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-small uppercase tracking-[0.12em]"
              style={{ color: p.accent ? 'var(--accent)' : 'var(--txf)' }}>
              {de ? p.titleDe : p.titleEn}
            </p>
            {p.accent && (
              <span className="num-data px-1.5 py-0.5 rounded-full" style={{ fontSize: 9.5, background: 'var(--sf)', border: '1px solid rgba(var(--accent-rgb),0.20)', color: 'var(--accent)' }}>
                {de ? 'empfohlen' : 'recommended'}
              </span>
            )}
          </div>

          <p className="font-display font-bold text-wx-tx1 mt-3 leading-none" style={{ fontSize: '1.9rem', letterSpacing: '-0.02em' }}>
            {eur(p.per, de)}
          </p>
          <p className="text-[12px] mt-1.5" style={{ color: 'var(--txm)' }}>
            {de ? 'pro Kette' : 'per chain'}
          </p>

          <div className="mt-4 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--bd2)' }}>
            <p className="num-data text-[11.5px]" style={{ color: 'var(--txm)' }}>
              {de ? 'Wachsen' : 'Waxing'} <span style={{ color: 'var(--tx1)' }}>{eur(p.total, de)}</span>
            </p>
            <p className="num-data text-[11.5px]" style={{ color: 'var(--txm)' }}>
              {de ? 'Rückversand' : 'Return shipping'} <span style={{ color: 'var(--tx1)' }}>{eur(p.shipping, de)}</span>
            </p>
            <p className="num-data text-[13px] pt-1.5" style={{ color: 'var(--tx1)' }}>
              {de ? 'Gesamt' : 'Total'} <span style={{ color: 'var(--accent)' }}>{eur(p.total + p.shipping, de)}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function RewaxPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [isGift, setIsGift] = useState(false);
  const [giftPreview, setGiftPreview] = useState<{ count: number; price: number; list: number } | null>(null);
  const location = useLocation();
  const waxedOn = useMemo(
    () => waxedFromLocation(),
    [location.search, location.hash],
  );
  const waxedLabel = waxedOn
    ? waxedOn.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // Die vorgerenderte Huelle (scripts/generate-blog-html.mjs, STATIC_PAGES)
  // liefert fuer /kette-wachsen-lassen bereits ein WebPage-Schema,
  // client-managed markiert (ldClientManaged) — genau damit es hier entfernt
  // werden kann, sobald diese Seite ihre eigenen, spezifischeren Service- und
  // FAQPage-Schemas unten via Helmet nachliefert. Ohne diesen Aufruf blieben
  // nach der Hydration drei JSON-LD-Bloecke gleichzeitig im DOM stehen
  // (dieselbe Klasse Bug wie vorher auf der Wissenschaftsseite). Gleiches
  // gilt fuer die title-/description-/canonical-Tags, die das <Helmet>
  // unten erneut setzt (siehe removeStaticHeadMeta).
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  // Mobile-Plan B8: die URL (/kette-wachsen-lassen, seit 08/2026) war schon
  // auf den deutschen Suchbegriff umgestellt, aber Title, H1 und Nav-Label
  // sagten weiter "Rewax" — der Anglizismus, nach dem im deutschen Markt
  // praktisch niemand sucht. "Rewax" bleibt als Marken-/Szenebegriff in der
  // Unterzeile und im Schema (alternateName) erhalten, fuehrt aber nicht
  // mehr die staerksten Ranking-Signale an.
  const title = de
    ? 'Fahrradkette wachsen lassen — Kettenwachs-Service aus Stuttgart | Waxcelerate'
    : 'Rewax service for waxed chains | Waxcelerate';
  const description = de
    ? 'Gewachste Kette einschicken, frisch gewachst zurückbekommen. 13,95 € je Kette, 9,95 € ab drei Ketten, zzgl. Rückversand. Handgewachst in Stuttgart.'
    : 'Send in your waxed chain, get it back freshly waxed. 13.95 € per chain, 9.95 € from three chains, plus return shipping. Hand-waxed in Stuttgart.';

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: de ? 'Rewax-Service' : 'Rewax service',
    alternateName: de
      ? ['Rewax-Service', 'Kettenwachs-Service', 'Wachsservice für Fahrradketten']
      : ['Rewax service', 'Chain wax service', 'Bicycle chain waxing service'],
    serviceType: de ? 'Kettenwachs-Service' : 'Chain waxing service',
    provider: { '@type': 'Organization', name: 'Waxcelerate', url: 'https://waxcelerate.de' },
    areaServed: 'DE',
    url: 'https://waxcelerate.de/kette-wachsen-lassen',
    offers: [
      { '@type': 'Offer', name: de ? 'Einzelne Kette' : 'Single chain', price: PRICE.single.toFixed(2), priceCurrency: 'EUR' },
      { '@type': 'Offer', name: de ? 'Drei Ketten' : 'Three chains', price: (PRICE.bundle * PRICE.bundleCount).toFixed(2), priceCurrency: 'EUR' },
    ],
  });

  // Mobile-Plan B8, Punkt 4: vier FAQ-Fragen entlang der im Plan gelisteten
  // Suchbegriffe ("was kostet kette wachsen lassen", "fahrradkette wachsen
  // lassen kosten", "wo kann ich meine fahrradkette wachsen lassen", "kette
  // wachsen lassen oder selber machen"). Frage 1+2 decken die beiden
  // Kosten-Begriffe ab, aber mit echtem inhaltlichem Unterschied (Einzelpreis
  // vs. Mengenrabatt) statt einer reinen Wiederholung. Preise kommen aus
  // PRICE/eur() oben in dieser Datei, nicht neu getippt, damit hier nichts
  // von den echten Preisen abweichen kann. Leipzig bewusst nicht erwaehnt —
  // das laut Plan noch offene D-M2-Thema braucht erst Luca's Bestaetigung,
  // ob der Standort noch aktiv ist.
  const faqItems: {
    q: string; a: string; link?: { to: string; labelDe: string; labelEn: string };
  }[] = [
    {
      q: de ? 'Was kostet es, eine Fahrradkette wachsen zu lassen?' : 'How much does it cost to get a chain rewaxed?',
      a: de
        ? `${eur(PRICE.single, de)} für eine einzelne Kette, zuzüglich ${eur(PRICE.shippingSingle, de)} Rückversand.`
        : `${eur(PRICE.single, de)} for a single chain, plus ${eur(PRICE.shippingSingle, de)} return shipping.`,
    },
    {
      q: de ? 'Was kostet es, mehrere Fahrradketten wachsen zu lassen?' : 'How much does it cost to get several chains rewaxed?',
      a: de
        ? `Ab drei Ketten sinkt der Preis auf ${eur(PRICE.bundle, de)} pro Kette. Der Rückversand (${eur(PRICE.shippingBundle, de)}) fällt dabei nur einmal an, egal wie viele Ketten im selben Umschlag sind.`
        : `From three chains the price drops to ${eur(PRICE.bundle, de)} per chain. Return shipping (${eur(PRICE.shippingBundle, de)}) is charged only once, no matter how many chains are in the same envelope.`,
    },
    {
      q: de ? 'Wie funktioniert die 5er- oder 10er-Karte?' : 'How do the 5- and 10-visit cards work?',
      a: de
        ? `Du zahlst fünf oder zehn Wachsgänge im Voraus, der Rückversand ist im Kartenpreis schon drin. Nach dem Kauf bekommst du einen Code, den schickst du bei jeder Sendung mit — wir führen die Karte für dich. Kein Ablaufdatum, übertragbar. Gegen den Einzelpreis von ${eur(PRICE.single, de)} sparst du auf der 5er-Karte ${eur(FIVE_CARD.list - FIVE_CARD.price, de)}, auf der 10er ${eur(TEN_CARD.list - TEN_CARD.price, de)}.`
        : `You pay for five or ten waxings up front, return shipping is already included in the card price. After purchase you get a code to include with every shipment — we keep the card for you. No expiry, transferable. Against the single price of ${eur(PRICE.single, de)} you save ${eur(FIVE_CARD.list - FIVE_CARD.price, de)} on the 5-visit card and ${eur(TEN_CARD.list - TEN_CARD.price, de)} on the 10-visit one.`,
    },
    {
      // Absorbiert den frueheren eigenen "Ablauf"-Sektionskopf mit den drei
      // Foto-Schritten — die Kurzfassung steht jetzt im Hero, die Details hier.
      q: de ? 'Wie läuft das Rewaxen ab?' : 'How does the rewaxing process work?',
      a: de
        ? 'Kette am Quick-Link öffnen, in den Umschlag, einschicken — reinigen musst du vorher nichts. Wir reinigen sie professionell im Ultraschallbad und lösen das alte Wachs mit kochendem Wasser, ganz ohne Lösemittel, bevor sie in einem frischen Bad neu gewachst wird. Zurück kommt sie ausgehärtet, Glieder freigebrochen, trocken verpackt — anbauen, kurz kurbeln, fertig.'
        : 'Open the chain at the quick link, put it in an envelope, send it in — no cleaning needed beforehand. We clean it professionally in an ultrasonic bath and release the old wax with boiling water, no solvents, before it gets waxed fresh in a clean bath. It comes back cured, links broken free, packed dry — fit it, turn the cranks, ride.',
    },
    {
      q: de ? 'Wo kann ich meine Fahrradkette wachsen lassen?' : 'Where can I get my bicycle chain waxed?',
      a: de
        ? 'Bei uns in Stuttgart — du musst aber nicht vor Ort sein. Du schickst die Kette per Post ein, wir wachsen sie von Hand und schicken sie zurück. Das funktioniert deutschlandweit.'
        : "With us in Stuttgart — but you don't need to be local. You send the chain by mail, we hand-wax it and send it back. This works nationwide within Germany.",
    },
    {
      // Absorbiert die frühere eigene "Umfang"-Sektion (Ja/Nein-Liste + der
      // Grund, warum eine ölige Kette nicht geht).
      q: de ? 'Welche Ketten nehmt ihr an?' : 'Which chains do you accept?',
      a: de
        ? 'Jede Kette, die schon gewachst ist — unsere oder fremde, alle gängigen 9- bis 12-fach-Ketten. Was wir nicht machen: eine geölte Kette entfetten und erstmals wachsen. Eine einzige ölige Kette macht ein ganzes Wachsbad unbrauchbar, weil das Öl oben schwimmt und das Wachs nicht mehr in die Gelenke kommt.'
        : "Any chain that's already waxed — ours or someone else's, all common 9 to 12 speed chains. What we don't do: degrease an oiled chain and wax it for the first time. A single oily chain ruins an entire wax bath, because the oil floats on top and blocks the wax from reaching the joints.",
      link: { to: '/#anleitungen', labelDe: 'Zur Anleitung für den Umstieg', labelEn: 'To the switching guide' },
    },
    {
      // Absorbiert die Intervall-Tabelle, die frueher als eigenes
      // InstrumentFrame-Panel in einer eigenen Sektion ("Warum drei") stand.
      // Als Frage beantwortet sie dasselbe, kostet aber keine eigene Sektion
      // — und "wie oft muss man nachwachsen" ist ohnehin eine echte Suchfrage.
      q: de ? 'Wie oft muss eine gewachste Kette neu gewachst werden?' : 'How often does a waxed chain need rewaxing?',
      a: de
        ? 'Trocken auf Asphalt 400–550 km, bei Nässe, MTB oder gemischt 200–300 km, im Winter bei Dauerregen unter 200 km. Das zuverlässigste Signal ist aber das Ohr: Wird die Kette lauter und trockener, ist sie fällig.'
        : 'Dry on tarmac 400–550 km, in the wet, on MTB or mixed 200–300 km, in winter with constant rain under 200 km. The most reliable signal is your ear though: when the chain gets louder and drier, it is due.',
      link: { to: '/rechner/intervall', labelDe: 'Dein Intervall in Wochen berechnen', labelEn: 'Work out your interval in weeks' },
    },
    {
      q: de ? 'Kette wachsen lassen oder selbst wachsen — was lohnt sich?' : 'Send it in or wax it myself — which is worth it?',
      a: de
        ? 'Selbst wachsen ist einfach, kostet aber einen Abend, einen Topf und Platz für die Ausrüstung — die Anleitung dafür steht kostenlos auf dieser Seite. Der Service lohnt sich, wenn du das nicht selbst machen willst oder der Platz dafür fehlt. Ab der zweiten oder dritten Kette in Rotation rechnet er sich zusätzlich, weil der Rückversand nur einmal anfällt.'
        : "Waxing it yourself is simple, but costs an evening, a pot and space for the gear — the guide for that is free on this page. The service is worth it if you'd rather not do that yourself or don't have the space for it. From a second or third chain in rotation it pays off further, since return shipping is only charged once.",
    },
  ];
  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  });

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/kette-wachsen-lassen" />
        <script type="application/ld+json">{schema}</script>
        <script type="application/ld+json">{faqSchema}</script>
      </Helmet>

      <Navigation />

      {/* Mobile-Plan B7d: kein <main>-Landmark auf dieser Seite — "zum
          Inhalt springen" hatte nichts zum Ansteuern. */}
      <main id="main-content">
      {/* ── Hero ── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20" style={{ background: 'var(--pg)' }}>
        {/* Kopf ueber die volle Breite, damit darunter die Bild-Oberkante mit
            der Formular-Oberkante fluchtet (vorher zentrierte lg:items-center
            das Bild gegen die hoehere Formularspalte). */}
        <div className={W}>
          <BackLink de={de} className="mb-6 sm:mb-8" />
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Service' : 'Service'}
          </p>
          <h1 className="font-display font-bold leading-[1.05] max-w-[16ch]"
            style={{ color: 'var(--tx1)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Fahrradkette wachsen lassen.' : 'Get your chain rewaxed.'}
          </h1>
          {waxedLabel && (
            <p className="text-[14px] font-semibold mt-5" style={{ color: 'var(--accent-soft)' }}>
              {de
                ? `Deine Karte: gewachst am ${waxedLabel}. Trocken klingt → jetzt einschicken.`
                : `Your card: waxed ${waxedLabel}. Sounds dry → send it in.`}
            </p>
          )}
        </div>

        <div className={`${W} mt-8 flex flex-col lg:flex-row lg:items-start lg:gap-14`}>
          {/* Formular ist der primaere Bestellweg, nicht mehr WhatsApp:
              es deckt die Auswahl (Karte, Anzahl, Geschenk) praezise ab,
              statt sie in einen Chat-Text zu quetschen, und braucht keine
              installierte/verknuepfte WhatsApp-Nummer — wichtig, weil das
              hier der einzige wiederkehrende Umsatz im ganzen Modell ist,
              also jede zusaetzliche Huerde real kostet. WhatsApp bleibt als
              leiser Zweitlink darunter (anderer Kanal, keine Weiterleitung). */}
          <div className="lg:flex-1">
            <RewaxRequestForm de={de} />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              <a href={waLink(de, waxedLabel)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: 'var(--tx1)' }}>
                {de ? 'Lieber direkt per WhatsApp' : 'Prefer WhatsApp instead'}
                <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
              </a>
              <a href="#preise" className="text-[13.5px] font-semibold" style={{ color: 'var(--txm)' }}>
                {de ? 'Was kostet das?' : 'What does it cost?'}
              </a>
            </div>
          </div>

          <div className="order-first lg:order-none mb-8 lg:mb-0 lg:mt-0 lg:flex-1">
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3 / 2', background: 'var(--hero-stage)' }}>
              <img src="/images/rewax/hero.webp"
                srcSet="/images/rewax/hero-800.webp 800w, /images/rewax/hero.webp 1200w"
                sizes="(max-width: 1024px) 92vw, 48vw"
                alt={de ? 'Frisch gewachste Ketten hängen zum Aushärten' : 'Freshly waxed chains hanging to cure'}
                className="w-full h-full object-cover" />
            </div>
            <p className="num-data text-meta mt-3" style={{ color: 'var(--txff)' }}>
              {de ? 'AUSGEHÄRTET, STUTTGART' : 'CURED, STUTTGART'}
            </p>

            {/* Ab lg: kompakter Ablauf + Preis-Kurzfassung fuellen den Raum,
                den lg:items-start neben dem hoeheren Formular sonst leer
                laesst — so zeigt der erste Bildschirm Bild, Formular, Ablauf
                und Preis auf einmal. Unter lg ausgeblendet (Formular bleibt
                oben); der volle Ablauf mit Fotos steht dann in der
                Preis-Sektion. */}
            <div className="hidden lg:block mt-7 pt-6" style={{ borderTop: '1px solid var(--bd2)' }}>
              <p className="text-small uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--txf)' }}>
                {de ? 'So läuft’s ab' : 'How it works'}
              </p>
              <ol className="space-y-2">
                {STEPS.map((s) => (
                  <li key={s.n} className="flex gap-2.5 text-[13px] leading-snug">
                    <span className="num-data flex-shrink-0 font-bold" style={{ color: 'var(--accent)' }}>{s.n}</span>
                    <span style={{ color: 'var(--txm)' }}>
                      <span className="font-semibold" style={{ color: 'var(--tx1)' }}>{de ? s.de : s.en}</span>
                      {' — '}{de ? s.bodyDe : s.bodyEn}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-[12.5px] leading-relaxed mt-4" style={{ color: 'var(--txm)' }}>
                {de
                  ? `Einzeln ${eur(PRICE.single, de)} · ab 3 Ketten ${eur(PRICE.bundle, de)}/Kette · Karten ab ${eur(TEN_CARD.price / TEN_CARD.count, de)} je Vorgang, Rückversand inklusive`
                  : `Single ${eur(PRICE.single, de)} · from 3 chains ${eur(PRICE.bundle, de)}/chain · cards from ${eur(TEN_CARD.price / TEN_CARD.count, de)} per treatment, return shipping included`}
              </p>
              <a href="#preise" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold mt-2" style={{ color: 'var(--accent)' }}>
                {de ? 'Alle Preise' : 'All prices'}
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* ── Preise ──
          Der Ablauf (1-2-3) stand hier vorher als eigene sticky-Spalte. Ab lg
          steht die Kurzfassung jetzt im Hero neben dem Formular (ein Blick,
          alles da) — hier waere sie doppelt. Unter lg, wo im Hero kein Platz
          ist, bleiben die Foto-Schritte an dieser Stelle. */}
      <section id="preise" className="scroll-mt-24 py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>

          <div className="lg:hidden mb-12 max-w-md">
            <p className="text-small uppercase tracking-[0.16em] mb-5" style={{ color: 'var(--txf)' }}>
              {de ? 'So läuft’s ab' : 'How it works'}
            </p>
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-3 py-3.5"
                style={{ borderBottom: i < 2 ? '1px solid var(--bd2)' : 'none' }}>
                <span className="num-data flex-shrink-0 rounded-full flex items-center justify-center font-bold"
                  style={{ width: 22, height: 22, background: 'var(--accent-wash-sm)', color: 'var(--accent)', fontSize: 11.5 }}>
                  {s.n}
                </span>
                <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 60, height: 48, background: 'var(--sf2)' }}>
                  <img src={`${s.img}-800.webp`} alt="" aria-hidden loading="lazy" decoding="async"
                    className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-[13.5px]" style={{ color: 'var(--tx1)' }}>{de ? s.de : s.en}</p>
                  <p className="text-[12.5px] leading-snug mt-0.5" style={{ color: 'var(--txm)' }}>
                    {de ? s.bodyDe : s.bodyEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-[760px]">
            <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-8"
              style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
              {de ? 'Preise' : 'Pricing'}
            </h2>

            <Pricing de={de} />

            <p className="text-[13px] leading-relaxed max-w-[62ch] mt-6" style={{ color: 'var(--txff)' }}>
              {de
                ? 'Hinversand trägst du. Bei Einzelbestellung ist der Rückversand oben eingerechnet, bei den Karten steckt er im Kartenpreis. Wir arbeiten als Kleinunternehmer nach § 19 UStG, es wird keine Umsatzsteuer ausgewiesen.'
                : 'You cover the shipping to us. For single orders return shipping is included above, for the cards it is part of the card price. We operate under the German small business rule, so no VAT is shown.'}
            </p>

            {/* ── Vorausbezahlte Karten ──
                Dieselbe Frage ("was kostet das") in einer zweiten Variante —
                als Untertitel hinter einer Haarlinie, kein neues Thema. Zwei
                Größen plus ein Für-mich/Geschenk-Umschalter: "als Geschenk"
                ändert die Bestellnachricht und öffnet die Geschenk-Vorschau. */}
            <div className="mt-12 pt-10" style={{ borderTop: '1px solid var(--bd2)' }}>
              <p className="text-small uppercase tracking-[0.16em] mb-6" style={{ color: 'var(--txf)' }}>
                {de ? 'Mehrere Vorgänge, einmal bezahlt.' : 'Several treatments, paid once.'}
              </p>

              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-full p-1" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
                  {([
                    { key: false, labelDe: 'Für mich', labelEn: 'For me', Icon: User },
                    { key: true, labelDe: 'Als Geschenk', labelEn: 'As a gift', Icon: Gift },
                  ] as const).map(({ key, labelDe, labelEn, Icon }) => (
                    <button key={String(key)} type="button" onClick={() => setIsGift(key)}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
                      style={{
                        background: isGift === key ? 'var(--accent)' : 'transparent',
                        color: isGift === key ? '#fff' : 'var(--txm)',
                      }}>
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {de ? labelDe : labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <StampCard de={de} count={FIVE_CARD.count} price={FIVE_CARD.price} list={FIVE_CARD.list} gift={isGift}
                  onPreview={() => setGiftPreview({ count: FIVE_CARD.count, price: FIVE_CARD.price, list: FIVE_CARD.list })} />
                <StampCard de={de} count={TEN_CARD.count} price={TEN_CARD.price} list={TEN_CARD.list} gift={isGift} recommended
                  onPreview={() => setGiftPreview({ count: TEN_CARD.count, price: TEN_CARD.price, list: TEN_CARD.list })} />
              </div>

              {/* Wie man die Karte einloest: einmal unter beiden Karten statt
                  auf jeder — die Karte selbst soll keine Textwand sein. */}
              <p className="text-[12px] leading-relaxed mt-4 max-w-[64ch]" style={{ color: 'var(--txf)' }}>
                {de
                  ? (isGift
                    ? 'Beim Geschenk bekommst du eine gedruckte Karte mit Code zum Überreichen. Kein Ablaufdatum, übertragbar.'
                    : 'Nach dem Kauf bekommst du einen Code für deine Karte — den schickst du bei jeder Sendung einfach mit. Kein Ablaufdatum, übertragbar.')
                  : (isGift
                    ? 'With a gift you get a printed card with a code to hand over. No expiry, transferable.'
                    : 'After purchase you get a code for your card — just include it with every shipment. No expiry, transferable.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──
          Mobile-Plan B8, Punkt 4. Bewusst als natives <details>/<summary>
          statt der Akkordeon-Komponente von der Startseite (sections/faq.tsx)
          — kein eigener JS-Zustand noetig, funktioniert per Tastatur und
          Screenreader ohne Zusatzcode, und fuer vier Fragen auf einer
          Service-Seite ist die Suchleiste/"Alle anzeigen"-Logik der
          Startseiten-Variante ohnehin ueberdimensioniert. */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--sf)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Fragen' : 'Questions'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-8"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Kurz beantwortet.' : 'Answered briefly.'}
          </h2>
          <div className="max-w-[720px]">
            {faqItems.map((item, i) => (
              <details key={item.q} className="group py-5"
                style={{ borderBottom: i < faqItems.length - 1 ? '1px solid var(--bd2)' : 'none' }}>
                <summary className="flex items-center justify-between gap-5 cursor-pointer list-none">
                  <h3 className="text-[15px] font-medium" style={{ color: 'var(--tx1)' }}>{item.q}</h3>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-180"
                    style={{ color: 'var(--txf)' }} aria-hidden />
                </summary>
                <p className="text-[14px] leading-relaxed mt-3 max-w-[62ch]" style={{ color: 'var(--txm)' }}>
                  {item.a}
                </p>
                {item.link && (
                  <Link to={item.link.to} className="inline-flex items-center gap-2 mt-3 text-[13.5px] font-semibold"
                    style={{ color: 'var(--tx1)' }}>
                    {de ? item.link.labelDe : item.link.labelEn}
                    <ArrowRight className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  </Link>
                )}
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Der fruehere Bild-Band-CTA am Seitenende ist raus: dasselbe hero.webp
          ein zweites Mal, weisse Schrift aufs dunkle Foto, und inhaltlich
          nichts, was der Hero (Formular, WhatsApp, "Was kostet das?") nicht
          schon traegt. Weniger Seite, weniger Friction. */}
      </main>

      <GiftPreviewModal open={!!giftPreview} onClose={() => setGiftPreview(null)} de={de} data={giftPreview} />

      <footer className={`${W} py-12 text-center`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
      </footer>

      <Footer />
    </div>
  );
}
