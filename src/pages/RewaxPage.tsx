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
const mailLink = (de: boolean) =>
  'mailto:waxcelerate@gmail.com?subject=' + encodeURIComponent(de ? 'Rewax-Service' : 'Rewax service')
  + '&body=' + encodeURIComponent(de
    ? 'Hallo Luca,\n\nich möchte folgende Anzahl Ketten zum Rewaxen einschicken: \n\nViele Grüße\n'
    : 'Hi Luca,\n\nI would like to send in the following number of chains for rewaxing: \n\nBest regards\n');

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

// Prepaid tiers at the three-chain rate, less the discount Luca set on
// 2026-08-18: ten percent on five treatments, fifteen on ten. Written as a
// derivation rather than typed-in numbers so price and list can never drift.
const TEN_CARD = {
  count: 10,
  get list() { return PRICE.bundle * this.count; },
  get price() { return Math.round(this.list * 0.85 * 100) / 100; },
};

const FIVE_CARD = {
  count: 5,
  get list() { return PRICE.bundle * this.count; },
  get price() { return Math.round(this.list * 0.90 * 100) / 100; },
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
function StampCard({ de, count, price, list, gift, recommended }: {
  de: boolean; count: number; price: number; list: number; gift: boolean; recommended?: boolean;
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
  const STAMP_STAGGER_MS = 550;
  const STAMP_HOLD_MS = 2400;
  const STAMP_EMPTY_PAUSE_MS = 900;
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
                ? { animationName: 'wx-stamp-ring', animationDuration: '900ms', animationTimingFunction: 'ease-out', animationFillMode: 'forwards' }
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
                      animationDuration: '900ms',
                      animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
      <p className="text-[11.5px] mt-1" style={{ color: 'var(--accent)' }}>
        {de ? `Du sparst ${eur(savings, de)} (${pct}%)` : `You save ${eur(savings, de)} (${pct}%)`}
      </p>
      <p className="text-[11px] mt-1" style={{ color: 'var(--txf)' }}>
        {de
          ? `${eur(price / count, de)} je Vorgang · kein Ablaufdatum, übertragbar`
          : `${eur(price / count, de)} per treatment · no expiry, transferable`}
      </p>
      {/* Ohne diesen Satz stand nirgends, wie man eine gekaufte Karte
          spaeter tatsaechlich einloest — kein Objekt wandert hin und her
          (verlustanfaellig bei einem reinen Versand-Service), nur ein Code,
          den Luca in der bestehenden Kundenliste mitfuehrt. Beim Geschenk
          bekommt der Schenkende zusaetzlich eine gedruckte Karte, weil ein
          reiner Code sich nicht wie ein Geschenk anfuehlt. */}
      <p className="text-[11px] mt-1 mb-4" style={{ color: 'var(--txf)' }}>
        {de
          ? (gift
            ? 'Du bekommst eine gedruckte Geschenkkarte mit Code zum Überreichen.'
            : 'Nach dem Kauf bekommst du einen Code für deine Karte. Den schickst du bei jeder Sendung einfach mit.')
          : (gift
            ? 'You get a printed gift card with the code to hand over.'
            : 'After purchase you get a code for your card. Just include it with every shipment.')}
      </p>

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
        <div className={W}>
          <BackLink de={de} className="mb-6 sm:mb-8" />
        </div>
        <div className={`${W} lg:flex lg:items-center lg:gap-14`}>
          <div className="lg:flex-1">
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Service' : 'Service'}
            </p>
            <h1 className="font-display font-bold leading-[1.05] mb-2"
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

            {/* Formular ist der primaere Bestellweg, nicht mehr WhatsApp:
                es deckt die Auswahl (Karte, Anzahl, Geschenk) praezise ab,
                statt sie in einen Chat-Text zu quetschen, und braucht keine
                installierte/verknuepfte WhatsApp-Nummer — wichtig, weil das
                hier der einzige wiederkehrende Umsatz im ganzen Modell ist,
                also jede zusaetzliche Huerde real kostet. Lief vorher
                eingeklappt hinter einem zweiten Klick, dahinter ein Formular,
                das inhaltlich laengst der genauere Weg war. WhatsApp bleibt
                trotzdem bestehen, nur als leiser Zweitlink darunter: es passt
                zur persoenlichen Marke ("meistens antworte ich am selben
                Tag") und manche wollen einfach chatten statt tippen — aber es
                ist ein ANDERER Kanal als das Formular (E-Mail via
                api/rewax-request.ts), keine Weiterleitung dorthin. */}
            <div className="mt-8">
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
          </div>
        </div>

      </section>

      {/* ── Ablauf + Preise ──
          Der Ablauf-Streifen (1-2-3) stand vorher als eigener voller
          Abschnitt UEBER der Preis-Sektion — er braucht aber kaum Hoehe,
          waehrend Preise+Stempelkarten deutlich laenger sind. Das zog die
          Seite unnoetig in die Laenge, bevor der eigentliche Kaufteil
          ueberhaupt anfing. Ab lg: jetzt nebeneinander: eine schmale linke
          Spalte fuer den Ablauf (sticky, bleibt sichtbar waehrend rechts
          durch Preise und Karten gescrollt wird), rechts alles Bisherige
          unveraendert. Unter lg: bleibt es block/gestapelt in derselben
          Reihenfolge wie vorher. */}
      <section id="preise" className="scroll-mt-24 py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14 lg:items-start">

            {/* Ablauf — kein h2, aber ein kleines Label passend zum
                "Mehrere Vorgaenge, einmal bezahlt."-Muster rechts, jetzt wo
                es als eigene Spalte neben statt unter der Preis-Ueberschrift
                steht. */}
            {/* max-w-md: unterhalb lg: (dieser Container hat sonst keine
                eigene Breitenbeschraenkung) zog eine kurze Nummer+Thumbnail-
                Zeile eine Trennlinie ueber die volle Containerbreite bis 1024px
                — bei mittleren Bildschirmbreiten (etwa 640-1024px) blieb dann
                sichtbar leerer Raum rechts neben Text und Linie. Ab lg: setzt
                ohnehin die 300px-Grid-Spalte die eigentliche Breite, max-w-md
                (448px) greift dort also gar nicht mehr ein. */}
            <div className="mb-10 max-w-md lg:mb-0 lg:sticky lg:top-28">
              <p className="text-small uppercase tracking-[0.16em] mb-5" style={{ color: 'var(--txf)' }}>
                {de ? 'So läuft’s ab' : 'How it works'}
              </p>
              {([
                { n: 1, de: 'Einschicken', en: 'Send it', bodyDe: 'Am Quick-Link raus, in den Umschlag.', bodyEn: 'Off at the quick link, into an envelope.', img: '/images/rewax/step-1' },
                { n: 2, de: 'Waschen & Wachsen', en: 'Wash & wax', bodyDe: 'Ultraschallgereinigt, dann frisch im Wachsbad.', bodyEn: 'Ultrasonically cleaned, then fresh in the wax bath.', img: '/images/rewax/step-2' },
                { n: 3, de: 'Zurück aufs Rad', en: 'Back on the bike', bodyDe: 'Ausgehärtet, anbauen, kurbeln, los.', bodyEn: 'Cured, fit it, turn the cranks, ride.', img: '/images/rewax/step-3' },
              ] as const).map((s, i) => (
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

            {/* Preise + vorausbezahlte Karten — inhaltlich unveraendert
                gegenueber vorher, nur jetzt rechte Spalte statt alleinig im
                Container. */}
            <div>
              <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-8"
                style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
                {de ? 'Preise' : 'Pricing'}
              </h2>

              <Pricing de={de} />

              <p className="text-[13px] leading-relaxed max-w-[62ch] mt-6" style={{ color: 'var(--txff)' }}>
                {de
                  ? 'Hinversand trägst du, Rückversand ist oben eingerechnet. Wir arbeiten als Kleinunternehmer nach § 19 UStG, es wird keine Umsatzsteuer ausgewiesen.'
                  : 'You cover the shipping to us, return shipping is included above. We operate under the German small business rule, so no VAT is shown.'}
              </p>

              {/* ── Vorausbezahlte Karten ──
                  Steht jetzt IN der Preis-Sektion statt in einer eigenen
                  darunter. Es ist dieselbe Frage ("was kostet das") in einer
                  zweiten Variante, und zwei eigene Sektionsköpfe für eine
                  Frage sind genau die Zerstückelung, die die Seite lang und
                  unübersichtlich gemacht hat. Als Untertitel hinter einer
                  Haarlinie liest es sich als das, was es ist: eine Option,
                  kein neues Thema.

                  Lebt hier statt als vierte Produkttür auf der Startseite —
                  vier Türen sind keine Wahl mehr, sondern ein Menü, und ein
                  Geschenk ist kein Einstieg für einen Erstbesucher.

                  Zwei Größen (fünf/zehn) plus ein Für-mich/Geschenk-
                  Umschalter: "auch als Geschenk" ist kein Abzeichen auf der
                  Karte, sondern ändert die Bestellnachricht direkt mit. */}
              <div className="mt-12 pt-10" style={{ borderTop: '1px solid var(--bd2)' }}>
                <p className="text-small uppercase tracking-[0.16em] mb-6" style={{ color: 'var(--txf)' }}>
                  {de ? 'Mehrere Vorgänge, einmal bezahlt.' : 'Several treatments, paid once.'}
                </p>

                {/* Eigene, zentrierte Zeile statt in der Kopfzeile rechts —
                    der Umschalter gilt fuer die Karten direkt darunter,
                    nicht fuer das Sub-Label daneben, und sollte optisch
                    auch so wirken. */}
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
                  <StampCard de={de} count={FIVE_CARD.count} price={FIVE_CARD.price} list={FIVE_CARD.list} gift={isGift} />
                  <StampCard de={de} count={TEN_CARD.count} price={TEN_CARD.price} list={TEN_CARD.list} gift={isGift} recommended />
                </div>
              </div>
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

      {/* ── CTA ──
          Vorher ein blasser Kasten in Akzentfarbe, also derselbe Kasten, den
          jede Sektion auf jeder Website benutzt. Jetzt ein Bildband ueber die
          volle Breite mit dem Foto der haengenden Ketten: die Seite endet mit
          dem Ergebnis, das man bekommt, nicht mit einer Aufforderung auf
          hellgrauem Grund. Und ein Knopf, nicht zwei, damit es nichts zu
          entscheiden gibt. */}
      {/* pdp-dark: Ohne diese Klasse faerbt die globale Hellmodus-Regel in
          index.css (`:root:not(.noir) h2 { color: var(--tx1) !important }`)
          die Ueberschrift auf Fast-Schwarz — mit !important, also gewinnt sie
          auch gegen das inline gesetzte color:#fff weiter unten. Auf dem
          dunklen Kettenfoto war der Abschluss-CTA dieser Seite dadurch
          praktisch unsichtbar. `.pdp-dark` ist die dafuer vorgesehene
          Ausnahme und stellt Weiss wieder her. */}
      <section className="pdp-dark relative overflow-hidden" style={{ minHeight: 460, background: 'var(--hero-stage)' }}>
        <img src="/images/rewax/hero.webp"
          srcSet="/images/rewax/hero-800.webp 800w, /images/rewax/hero.webp 1200w"
          sizes="100vw" alt="" aria-hidden loading="lazy" decoding="async"
          className="absolute inset-0 w-full h-full object-cover" />
        <div aria-hidden className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, rgba(var(--scrim-rgb),0.80) 0%, rgba(var(--scrim-rgb),0.52) 46%, rgba(var(--scrim-rgb),0.16) 100%)' }} />

        <div className={`${W} relative py-20 sm:py-24`}>
          <div className="max-w-[44ch]">
            <p className="text-small uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(255,255,255,0.68)' }}>
              {de ? 'Loslegen' : 'Get started'}
            </p>
            <h2 className="font-display font-bold leading-[1.08] tracking-[-0.02em]"
              style={{ color: '#fff', fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              {de ? 'Schreib mir, wie viele Ketten kommen.' : 'Tell me how many chains are coming.'}
            </h2>
            <p className="text-[15px] leading-relaxed mt-5 max-w-[40ch]" style={{ color: 'rgba(255,255,255,0.82)' }}>
              {de
                ? 'Eine Nachricht, ein Satz. Du bekommst die Versandadresse und eine Einschätzung, wann die Kette zurück ist. Meistens antworte ich am selben Tag.'
                : 'One message, one sentence. You get the shipping address and an estimate of when the chain will be back. I usually reply the same day.'}
            </p>

            <a href={waLink(de, waxedLabel)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 rounded-full px-7 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#fff', color: '#101013' }}>
              {de ? 'Ketten anmelden' : 'Register chains'}
              <ArrowRight className="h-4 w-4" />
            </a>

            <p className="text-[12.5px] mt-5" style={{ color: 'rgba(255,255,255,0.62)' }}>
              {de ? 'Kein Konto nötig. ' : 'No account needed. '}
              <a href={mailLink(de)} className="underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.86)' }}>
                {de ? 'Lieber per E-Mail' : 'Prefer email'}
              </a>
            </p>
          </div>
        </div>
      </section>
      </main>

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
