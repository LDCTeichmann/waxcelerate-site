// ─── /kette-wachsen-lassen — die Service-Seite ───────────────────────────────
// Der einzige wiederkehrende Umsatz im ganzen Modell (docs/AUDIT.md). Zwei
// Leistungen, beide reiner Postversand aus ganz Deutschland:
//
//   Auffrischung  — eine bereits gewachste Kette neu wachsen. Altes Wachs löst
//                   kochendes Wasser, ganz ohne Lösemittel; dann frisches Bad.
//   Umstieg       — eine geölte oder fabrikneue Kette auf Wachs umstellen. Sie
//                   kommt zuerst in ein SEPARATES Ultraschallbad, wird gründlich
//                   entfettet und getrocknet, bevor sie das erste Mal ins Wachs
//                   geht. So sieht das Wachsbad nie eine ölige Kette — die würde
//                   eine ganze Charge unbrauchbar machen (Öl schwimmt oben,
//                   blockiert die Penetration). Früher der Grund, geölte Ketten
//                   abzulehnen; jetzt der Grund für den eigenen Ablauf und Preis.
//
// Preise, FAQ, Meta und der Umstieg-Flag liegen in src/pages/rewax/content.ts —
// geteilt mit dem Prerender (scripts/generate-blog-html.mjs), damit die
// vorgerenderte Seite und die hydrierte Seite wortgleich sind.
//
// Formular ist der primäre Bestellweg (POST /api/rewax-request, E-Mail an Luca,
// keine Zahlung). WhatsApp bleibt leiser Zweitlink.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Gift, User, ChevronDown, CheckCircle2, Sparkles, Droplet } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { trustStats } from '@/lib/data';
import { trackRewaxInterest } from '@/lib/analytics';
import { REVIEWS } from '@/sections/reviews';
import {
  PRICE, FIVE_CARD, TEN_CARD, eur, UMSTIEG_LIVE, TURNAROUND, CITIES,
  COMPETITOR_FULL_SERVICE, rewaxMeta, rewaxFaqItems, rewaxServiceSchema, rewaxFaqSchema,
  type ServiceId,
} from '@/pages/rewax/content';

import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { WaxcelerateMark } from '@/components/WaxcelerateMark';
import { GiftPreviewModal } from '@/components/GiftPreviewModal';

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

// Ablauf-Schritte — echte Fotos (public/images/rewax/step-*), kleines Bild +
// beschreibender Text daneben. Eigene Sektion, auf allen Breakpoints sichtbar.
const STEPS = [
  {
    n: 1,
    de: 'Einschicken', en: 'Send it in',
    bodyDe: 'Kette am Quick-Link öffnen, in einen gepolsterten Umschlag, als Großbrief (1,80 €) an unsere Adresse in Stuttgart. Vorher reinigen musst du nichts — den Quick-Link einfach mit dazulegen. Aus ganz Deutschland, meist 1 bis 2 Werktage zu uns.',
    bodyEn: 'Open the chain at the quick link, into a padded envelope, as a letter (1.80 €) to our address in Stuttgart. No cleaning needed beforehand — just drop the quick link in with it. From anywhere in Germany, usually 1 to 2 working days to us.',
    img: '/images/rewax/step-1',
    altDe: 'Fahrradkette und Quick-Link neben einem Waxcelerate-Versandumschlag',
    altEn: 'Bike chain and quick link next to a Waxcelerate mailing envelope',
  },
  {
    n: 2,
    de: 'Reinigen & Wachsen', en: 'Clean & wax',
    bodyDe: 'Eine bereits gewachste Kette lösen wir mit kochendem Wasser vom alten Wachs, ganz ohne Lösemittel. Eine geölte oder fabrikneue Kette kommt zuerst in ein separates Ultraschallbad und wird gründlich entfettet und getrocknet. Dann geht sie ins frische Wachsbad, härtet aus, und wir brechen die Glieder frei.',
    bodyEn: "An already-waxed chain we release from the old wax with boiling water, no solvents at all. An oiled or factory-new chain first goes into a separate ultrasonic bath and is thoroughly degreased and dried. Then into a fresh wax bath, it cures, and we break the links free.",
    img: '/images/rewax/step-2',
    altDe: 'Kette hängt an einem Draht über einem Edelstahl-Wachsbad',
    altEn: 'Chain hanging on a wire above a stainless-steel wax bath',
  },
  {
    n: 3,
    de: 'Zurück & anbauen', en: 'Back & refit',
    bodyDe: 'Trocken verpackt zurück im Maxibrief, in der Regel 3 bis 5 Werktage ab Ankunft bei uns. Quick-Link schließen, kurz einkurbeln, fertig — der Antrieb läuft leiser und bleibt sauber.',
    bodyEn: 'Packed dry and sent back as a large letter, usually 3 to 5 working days after it reaches us. Close the quick link, turn the cranks a few times, done — the drivetrain runs quieter and stays clean.',
    img: '/images/rewax/step-3',
    altDe: 'Frisch gewachste Kette und versiegelte Verpackung auf Schiefer',
    altEn: 'Freshly waxed chain and sealed packaging on slate',
  },
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()/-]{5,}$/;

type TierId = 'single' | 'bundle3' | 'five' | 'ten';

// ─── Leistungswahl ──────────────────────────────────────────────────────────
// Die Frage, die der Besucher schon im Kopf hat: ist deine Kette schon
// gewachst, oder geölt/neu? Eigene Auswahl, nicht in die Tarif-Kacheln des
// Formulars gemischt (Tarif = Menge, orthogonal). Nur sichtbar wenn der
// Umstieg-Service live ist.
function ServiceChooser({ service, onChange, de }: {
  service: ServiceId; onChange: (s: ServiceId) => void; de: boolean;
}) {
  const options = [
    {
      id: 'rewax' as const, Icon: Sparkles,
      titleDe: 'Schon gewachst', titleEn: 'Already waxed',
      bodyDe: 'Auffrischen, sie klingt trocken', bodyEn: 'Refresh, it sounds dry',
      price: `${de ? 'ab' : 'from'} ${eur(PRICE.rewax.single, de)}`,
    },
    {
      id: 'umstieg' as const, Icon: Droplet,
      titleDe: 'Geölt oder neu', titleEn: 'Oiled or new',
      bodyDe: 'Entfetten und erstmals wachsen', bodyEn: 'Degrease and first wax',
      price: `${de ? 'ab' : 'from'} ${eur(PRICE.umstieg.single, de)}`,
    },
  ];
  return (
    <div role="radiogroup" aria-label={de ? 'Zustand deiner Kette' : 'State of your chain'}
      className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-md">
      {options.map(({ id, Icon, titleDe, titleEn, bodyDe, bodyEn, price }) => {
        const active = service === id;
        return (
          <button key={id} type="button" role="radio" aria-checked={active}
            onClick={() => onChange(id)}
            className="rounded-2xl p-3.5 text-left transition-colors"
            style={{
              background: active ? 'var(--accent)' : 'var(--sf)',
              color: active ? '#fff' : 'var(--tx1)',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--bd)'}`,
            }}>
            <Icon className="h-4 w-4 mb-1.5" style={{ color: active ? '#fff' : 'var(--accent)' }} aria-hidden />
            <span className="block text-[13.5px] font-semibold leading-tight">{de ? titleDe : titleEn}</span>
            <span className="block text-[11.5px] leading-snug mt-0.5" style={{ opacity: 0.85 }}>{de ? bodyDe : bodyEn}</span>
            <span className="block text-[12px] font-semibold mt-1.5" style={{ opacity: active ? 1 : 0.9, color: active ? '#fff' : 'var(--accent)' }}>{price}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Bestellformular ────────────────────────────────────────────────────────
function RewaxRequestForm({ de, service }: { de: boolean; service: ServiceId }) {
  const p = PRICE[service];
  // Tarife hängen an der Leistung: die Prepaid-Karten gibt es nur für die
  // Auffrischung (der Umstieg ist ein Einmalvorgang pro Kette).
  const tiers: { id: TierId; labelDe: string; labelEn: string; price: string; hasQuantity: boolean; quantityMin: number }[] = [
    { id: 'single', labelDe: 'Einzelne Kette', labelEn: 'Single chain', price: eur(p.single, de), hasQuantity: true, quantityMin: 1 },
    { id: 'bundle3', labelDe: 'Drei Ketten', labelEn: 'Three chains', price: `${eur(p.bundle, de)}/${de ? 'Kette' : 'chain'}`, hasQuantity: true, quantityMin: 3 },
    ...(service === 'rewax' ? [
      { id: 'five' as TierId, labelDe: '5er-Karte', labelEn: '5-visit card', price: `${eur(FIVE_CARD.price / FIVE_CARD.count, de)}/${de ? 'Kette' : 'chain'}`, hasQuantity: false, quantityMin: 1 },
      { id: 'ten' as TierId, labelDe: '10er-Karte', labelEn: '10-visit card', price: `${eur(TEN_CARD.price / TEN_CARD.count, de)}/${de ? 'Kette' : 'chain'}`, hasQuantity: false, quantityMin: 1 },
    ] : []),
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

  // Beim Wechsel auf den Umstieg ist eine evtl. gewählte Karte weg.
  useEffect(() => {
    if (service === 'umstieg' && (tierId === 'five' || tierId === 'ten')) {
      setTierId('single');
      setQuantity(1);
    }
  }, [service, tierId]);

  const activeTier = tiers.find(t => t.id === tierId) ?? tiers[0];
  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none';
  const inputStyle = { background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)' };

  const contactLooksValid = EMAIL_RE.test(contact) || PHONE_RE.test(contact);

  const total = activeTier.id === 'single' ? p.single * quantity
    : activeTier.id === 'bundle3' ? p.bundle * quantity
    : activeTier.id === 'five' ? FIVE_CARD.price
    : TEN_CARD.price;

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
          service, tierId, quantity: activeTier.hasQuantity ? quantity : undefined, isGift, name, contact, message, honeypot,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? (de ? 'Die Anfrage konnte nicht übermittelt werden.' : 'The request could not be submitted.'));
      }
      setStatus('done');
      trackRewaxInterest();
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
            ? 'Danke, deine Anfrage ist angekommen. Du bekommst die Versandadresse und die nächsten Schritte per E-Mail, meist innerhalb eines Werktags. Keine Zahlung jetzt.'
            : "Thanks, your request has arrived. You'll get the shipping address and next steps by email, usually within a working day. No payment now."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4 max-w-md rounded-2xl p-5 sm:p-6"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

      <div>
        <p className="block text-sm font-medium mb-1.5" style={{ color: 'var(--txm)' }}>
          {de ? 'Menge wählen' : 'Choose amount'}
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
          {eur(total, de)}
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
      <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--txf)' }}>
        {de
          ? 'Keine Zahlung jetzt. Du bekommst Versandadresse und nächste Schritte per E-Mail, meist innerhalb eines Werktags.'
          : 'No payment now. You get the shipping address and next steps by email, usually within a working day.'}
      </p>
    </form>
  );
}

// ─── Stempelkarte ───────────────────────────────────────────────────────────
function StampCard({ de, count, price, list, gift, recommended, onPreview }: {
  de: boolean; count: number; price: number; list: number; gift: boolean; recommended?: boolean;
  onPreview?: () => void;
}) {
  const label = de ? `${count}er-Karte` : `${count}-visit card`;
  const savings = list - price;

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
          <span className="num px-1.5 py-0.5 rounded-full" style={{ fontSize: 9.5, background: 'var(--sf)', border: '1px solid rgba(var(--accent-rgb),0.20)', color: 'var(--accent)' }}>
            {de ? 'bester Preis' : 'best price'}
          </span>
        )}
      </div>

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
        <p className="num text-[11px] line-through" style={{ color: 'var(--txff)' }}>
          {eur(list, de)}
        </p>
      </div>
      {/* Nur die Euro-Ersparnis, kein Prozentsatz — "Du sparst 30 €" ist eine
          Tatsache, ein Prozent­satz eine Behauptung über den Normalpreis. */}
      <p className="text-[11.5px] mt-1" style={{ color: 'var(--accent)' }}>
        {de ? `Du sparst ${eur(savings, de)}` : `You save ${eur(savings, de)}`}
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
        onClick={() => trackRewaxInterest()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent)', color: '#fff' }}>
        {gift ? (de ? 'Als Geschenk anfragen' : 'Request as a gift') : (de ? 'Karte anfragen' : 'Request this card')}
        {gift ? <Gift className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
      </a>
    </div>
  );
}

// ─── Preise je Leistung ─────────────────────────────────────────────────────
function ServicePricing({ de, service }: { de: boolean; service: ServiceId }) {
  const p = PRICE[service];
  const bundleTotal = p.bundle * PRICE.bundleCount;
  const titleDe = service === 'rewax' ? 'Auffrischung' : 'Umstieg';
  const subDe = service === 'rewax'
    ? 'Eine bereits gewachste Kette neu wachsen'
    : 'Geölte oder neue Kette entfetten und erstmals wachsen';
  const subEn = service === 'rewax'
    ? 'Rewax an already-waxed chain'
    : 'Degrease an oiled or new chain and wax it for the first time';

  const plans = [
    { key: 'single', titleDe: 'Einzelne Kette', titleEn: 'Single chain', per: p.single, total: p.single, shipping: PRICE.shippingSingle, accent: false },
    { key: 'bundle', titleDe: 'Drei Ketten', titleEn: 'Three chains', per: p.bundle, total: bundleTotal, shipping: PRICE.shippingBundle, accent: true },
  ];

  return (
    <div>
      <h2 className="font-display font-bold text-wx-tx1 leading-tight"
        style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', letterSpacing: '-0.02em' }}>
        {de ? titleDe : (service === 'rewax' ? 'Rewax' : 'Oil-to-wax switch')}
      </h2>
      <p className="text-[13px] mt-1 mb-5" style={{ color: 'var(--txm)' }}>{de ? subDe : subEn}</p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {plans.map(plan => (
          <div key={plan.key} className="rounded-2xl p-4 sm:p-6"
            style={{
              background: plan.accent ? 'var(--accent-wash-sm)' : 'var(--sf)',
              border: plan.accent ? '1px solid rgba(var(--accent-rgb),0.22)' : '1px solid var(--bd)',
            }}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-small uppercase tracking-[0.12em]"
                style={{ color: plan.accent ? 'var(--accent)' : 'var(--txf)' }}>
                {de ? plan.titleDe : plan.titleEn}
              </p>
              {plan.accent && (
                <span className="num px-1.5 py-0.5 rounded-full" style={{ fontSize: 9.5, background: 'var(--sf)', border: '1px solid rgba(var(--accent-rgb),0.20)', color: 'var(--accent)' }}>
                  {de ? 'empfohlen' : 'recommended'}
                </span>
              )}
            </div>

            <p className="font-display font-bold text-wx-tx1 mt-3 leading-none" style={{ fontSize: '1.9rem', letterSpacing: '-0.02em' }}>
              {eur(plan.per, de)}
            </p>
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--txm)' }}>
              {de ? 'pro Kette' : 'per chain'}
            </p>

            <div className="mt-4 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--bd2)' }}>
              <p className="num text-[11.5px]" style={{ color: 'var(--txm)' }}>
                {de ? 'Wachsen' : 'Waxing'} <span style={{ color: 'var(--tx1)' }}>{eur(plan.total, de)}</span>
              </p>
              <p className="num text-[11.5px]" style={{ color: 'var(--txm)' }}>
                {de ? 'Rückversand' : 'Return shipping'} <span style={{ color: 'var(--tx1)' }}>{eur(plan.shipping, de)}</span>
              </p>
              <p className="num text-[13px] pt-1.5" style={{ color: 'var(--tx1)' }}>
                {de ? 'Gesamt' : 'Total'} <span style={{ color: 'var(--accent)' }}>{eur(plan.total + plan.shipping, de)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {service === 'umstieg' && (
        <p className="text-[12.5px] leading-relaxed mt-4 max-w-[64ch]" style={{ color: 'var(--txf)' }}>
          {de
            ? `Der Aufpreis gegenüber der Auffrischung ist der echte Mehraufwand: separates Ultraschallbad, gründlich entfetten, vollständig trocknen, dann erst ins Wachs. Zum Vergleich das volle Programm anderswo: ${COMPETITOR_FULL_SERVICE.map(c => `${c.name} ${eur(c.price, de)}`).join(', ')}.`
            : `The premium over a rewax is real extra work: a separate ultrasonic bath, thorough degreasing, full drying, then into the wax. For comparison, the full service elsewhere: ${COMPETITOR_FULL_SERVICE.map(c => `${c.name} ${eur(c.price, de)}`).join(', ')}.`}
        </p>
      )}
    </div>
  );
}

// ─── So läuft's ab ──────────────────────────────────────────────────────────
// Echte Fotos (public/images/rewax/step-*), kleines Bild + beschreibender Text
// daneben. Eigene Sektion, auf allen Breakpoints sichtbar — die frühere
// text-only-Liste im Hero und der Mobile-only-Fotostreifen sind dafür raus.
function RewaxSteps({ de }: { de: boolean }) {
  return (
    <section id="ablauf" className="scroll-mt-24 py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Ablauf' : 'How it works'}
        </p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-10"
          style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
          {de ? 'So läuft’s ab.' : 'How it works.'}
        </h2>
        <div className="max-w-[760px]">
          {STEPS.map((s, i) => (
            <div key={s.n}
              className="flex gap-4 sm:gap-6 py-6"
              style={{ borderBottom: i < STEPS.length - 1 ? '1px solid var(--bd2)' : 'none' }}>
              <div className="flex-shrink-0 w-24 sm:w-36 lg:w-44 rounded-xl overflow-hidden self-start"
                style={{ aspectRatio: '4 / 3', background: 'var(--sf2)' }}>
                <img src={`${s.img}.webp`}
                  srcSet={`${s.img}-800.webp 800w, ${s.img}.webp 1200w`}
                  sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 176px"
                  alt={de ? s.altDe : s.altEn}
                  loading="lazy" decoding="async"
                  className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="num font-bold" style={{ color: 'var(--accent)', fontSize: 13 }}>{s.n}</span>
                  <h3 className="font-semibold text-[15px] sm:text-[16px]" style={{ color: 'var(--tx1)' }}>
                    {de ? s.de : s.en}
                  </h3>
                </div>
                <p className="text-[13.5px] sm:text-[14px] leading-relaxed mt-1.5" style={{ color: 'var(--txm)' }}>
                  {de ? s.bodyDe : s.bodyEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Vertrauen ──────────────────────────────────────────────────────────────
function RewaxTrust({ de }: { de: boolean }) {
  // Zwei echte, attribuierte eBay-Servicerezensionen. diemojakob nennt genau
  // das Umstieg-Argument ("Ölfrei-Machen ist zeitaufwändig"); seyrane die
  // Geschwindigkeit. Keine erfundenen Zitate.
  const quotes = REVIEWS.filter(r => r.name === 'diemojakob' || r.name === 'seyrane');

  return (
    <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Vertrauen' : 'Trust'}
        </p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-8"
          style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
          {de ? 'Warum Leute uns ihre Kette schicken.' : 'Why people mail us their chain.'}
        </h2>

        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14 lg:items-start">
          {/* Luca + Kennzahlen */}
          <div className="mb-10 lg:mb-0">
            <div className="flex items-center gap-3.5">
              <img src="/images/people/luca-stage.webp" alt={de ? 'Luca von Waxcelerate' : 'Luca of Waxcelerate'}
                className="rounded-full object-cover flex-shrink-0" style={{ width: 56, height: 56 }} loading="lazy" />
              <div>
                <p className="font-semibold text-[14px]" style={{ color: 'var(--tx1)' }}>Luca Teichmann</p>
                <p className="text-[12.5px]" style={{ color: 'var(--txm)' }}>
                  {de ? 'wächst jede Kette selbst · Stuttgart' : 'waxes every chain himself · Stuttgart'}
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-3">
              {[
                { v: `${trustStats.sold}+`, l: de ? 'Ketten gewachst, seit 2024' : 'chains waxed, since 2024' },
                { v: `${trustStats.reviews}`, l: de ? 'Bewertungen · 100 % positiv' : 'reviews · 100% positive' },
                { v: de ? TURNAROUND.short : TURNAROUND.shortEn, l: de ? 'Bearbeitung ab Ankunft' : 'processing after arrival' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <p className="font-display font-bold leading-none" style={{ fontSize: '1.35rem', color: 'var(--tx1)' }}>{v}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--txm)' }}>{l}</p>
                </div>
              ))}
            </dl>
          </div>

          {/* Zitate */}
          <div className="space-y-4">
            {quotes.map(r => (
              <figure key={r.name} className="rounded-2xl p-5"
                style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
                <blockquote className="text-[13.5px] leading-relaxed" style={{ color: 'var(--tx2)' }}>
                  „{de ? r.textDe : r.textEn}"
                </blockquote>
                <figcaption className="text-[12px] mt-3" style={{ color: 'var(--txf)' }}>
                  {r.name} · {de ? r.dateDe : r.dateEn} · {de ? 'eBay verifiziert' : 'eBay verified'}
                </figcaption>
              </figure>
            ))}
            <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--txff)' }}>
              {de
                ? 'Bewertungen aus unserem eBay-Shop, unverändert übernommen. „100 % positiv" heißt: keine negative Bewertung.'
                : 'Reviews from our eBay shop, quoted verbatim. "100% positive" means: no negative rating.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mobile-Sticky-CTA ──────────────────────────────────────────────────────
// Seiten-lokal, weil MobileStickyCTA auf Nicht-Home-Routen abbricht und Ziel
// hart verdrahtet hat. Erscheint nach dem Hero, verschwindet über der Fußzeile.
function RewaxStickyCTA({ de }: { de: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const form = document.querySelector('#rewax-form');
    const foot = document.querySelector('#rewax-footer');
    if (!form || !foot) return;
    // Sichtbar, sobald das Formular oben aus dem Blick gescrollt ist, wieder
    // weg, sobald die Fußzeile auftaucht.
    let formPast = false, footIn = false;
    const sync = () => setVisible(formPast && !footIn);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === form) formPast = !e.isIntersecting && e.boundingClientRect.bottom < 0;
        if (e.target === foot) footIn = e.isIntersecting;
      }
      sync();
    }, { threshold: 0 });
    io.observe(form); io.observe(foot);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden transition-transform duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        background: 'var(--pg)', borderTop: '1px solid var(--bd)',
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
      }}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className={`${W} pt-3`}>
        <button type="button"
          onClick={() => document.querySelector('#rewax-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {de ? 'Kette einschicken' : 'Send in your chain'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Seite ──────────────────────────────────────────────────────────────────
export function RewaxPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [service, setService] = useState<ServiceId>('rewax');
  const [isGift, setIsGift] = useState(false);
  const [giftPreview, setGiftPreview] = useState<{ count: number; price: number; list: number } | null>(null);
  const location = useLocation();
  const waxedOn = useMemo(() => waxedFromLocation(), [location.search, location.hash]);
  const waxedLabel = waxedOn
    ? waxedOn.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const { title, description } = rewaxMeta(de);
  const canonical = 'https://waxcelerate.de/kette-wachsen-lassen';
  const ogImage = 'https://waxcelerate.de/images/rewax/hero.webp';

  // Service- + FAQ-Schema aus dem geteilten Modul (identisch mit dem Prerender).
  const schema = JSON.stringify(rewaxServiceSchema(de));
  const faqItems = rewaxFaqItems(de);
  const faqSchema = JSON.stringify(rewaxFaqSchema(de));

  const valueProp = de
    ? `Kette einschicken, frisch gewachst zurück. Ab ${eur(PRICE.rewax.single, de)}, handgewachst in Stuttgart, deutschlandweit per Post. Bearbeitung ${TURNAROUND.full}.`
    : `Send in your chain, get it back freshly waxed. From ${eur(PRICE.rewax.single, de)}, hand-waxed in Stuttgart, nationwide by mail. Processing ${TURNAROUND.fullEn}.`;

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content={de ? 'de_DE' : 'en_US'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{schema}</script>
        <script type="application/ld+json">{faqSchema}</script>
      </Helmet>

      <Navigation />

      <main id="main-content">
      {/* ── Hero ── */}
      <section id="rewax-hero" className="relative pt-28 sm:pt-36 pb-14 sm:pb-20" style={{ background: 'var(--pg)' }}>
        <div className={W}>
          <BackLink de={de} className="mb-6 sm:mb-8" />
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>Service</p>
          <h1 className="font-display font-bold leading-[1.05] max-w-[16ch]"
            style={{ color: 'var(--tx1)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Fahrradkette wachsen lassen.' : 'Get your chain rewaxed.'}
          </h1>
          <p className="text-[15px] leading-relaxed mt-4 max-w-[52ch]" style={{ color: 'var(--txm)' }}>
            {valueProp}
          </p>
          {waxedLabel && (
            <p className="text-[14px] font-semibold mt-4" style={{ color: 'var(--accent-soft)' }}>
              {de
                ? `Deine Karte: gewachst am ${waxedLabel}. Trocken klingt → jetzt einschicken.`
                : `Your card: waxed ${waxedLabel}. Sounds dry → send it in.`}
            </p>
          )}
        </div>

        <div className={`${W} mt-8 flex flex-col lg:flex-row lg:items-start lg:gap-14`}>
          <div id="rewax-form" className="lg:flex-1 scroll-mt-24">
            {UMSTIEG_LIVE && (
              <div className="mb-4">
                <p className="block text-sm font-medium mb-2" style={{ color: 'var(--txm)' }}>
                  {de ? 'Wie ist deine Kette jetzt?' : 'What state is your chain in?'}
                </p>
                <ServiceChooser service={service} onChange={setService} de={de} />
              </div>
            )}
            <RewaxRequestForm de={de} service={service} />
            <p className="text-[12px] mt-3" style={{ color: 'var(--txm)' }}>
              {de
                ? `★ ${trustStats.reviews} Bewertungen · 100 % positiv · Antwort meist am selben Tag`
                : `★ ${trustStats.reviews} reviews · 100% positive · usually a same-day reply`}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              <a href={waLink(de, waxedLabel)} target="_blank" rel="noopener noreferrer"
                onClick={() => trackRewaxInterest()}
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
            <p className="num text-meta mt-3" style={{ color: 'var(--txff)' }}>
              {de ? 'AUSGEHÄRTET, STUTTGART' : 'CURED, STUTTGART'}
            </p>

            <div className="mt-7 pt-6" style={{ borderTop: '1px solid var(--bd2)' }}>
              <p className="text-small uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--txf)' }}>
                {de ? 'Ablauf' : 'How it works'}
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--tx1)' }}>
                {de
                  ? '1. Einschicken → 2. Reinigen & Wachsen → 3. Zurück & anbauen.'
                  : '1. Send it in → 2. Clean & wax → 3. Back & refit.'}
              </p>
              {/* Einzelpreis gross, zweite Zahl als Anker darunter (Plan §3):
                  "Ab X €" allein waere der niedrigere Anker, bricht aber beim
                  Aufschlagen der Seite (Einzelpreis, Vorkasse-Kartenpreis) —
                  die zweizeilige Form beantwortet beide Fragen auf einmal.
                  Rewax hat die Stempelkarte als Anker (10er-Karte, TEN_CARD),
                  Umstieg hat keine Karte (content.ts: "Karten gelten fuer die
                  Auffrischung, nicht fuer den Umstieg") und behaelt deshalb
                  den 3er-Mengenrabatt als Anker. */}
              <p className="num font-display font-bold leading-none mt-4" style={{ fontSize: '1.5rem', color: 'var(--tx1)' }}>
                {eur(service === 'rewax' ? PRICE.rewax.single : PRICE.umstieg.single, de)}{' '}
                <span className="text-[13px] font-normal" style={{ color: 'var(--txm)' }}>{de ? 'je Kette' : 'per chain'}</span>
              </p>
              <p className="num text-[12.5px] mt-0.5" style={{ color: 'var(--txm)' }}>
                {service === 'rewax'
                  ? `${de ? 'mit 10er-Karte' : 'with 10-visit card'} ${eur(TEN_CARD.price / TEN_CARD.count, de)}`
                  : `${de ? 'ab 3 Ketten' : 'from 3 chains'} ${eur(PRICE.umstieg.bundle, de)}`}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <a href="#ablauf" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>
                  {de ? 'Ablauf im Detail' : 'The process in detail'}
                  <ArrowRight className="h-3 w-3" />
                </a>
                <a href="#preise" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>
                  {de ? 'Alle Preise' : 'All prices'}
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RewaxSteps de={de} />

      {/* ── Preise ── */}
      <section id="preise" className="scroll-mt-24 py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>

          <div className="max-w-[760px] space-y-12">
            <ServicePricing de={de} service="rewax" />
            {UMSTIEG_LIVE && (
              <div className="pt-12" style={{ borderTop: '1px solid var(--bd2)' }}>
                <ServicePricing de={de} service="umstieg" />
              </div>
            )}

            <p className="text-[13px] leading-relaxed max-w-[62ch]" style={{ color: 'var(--txff)' }}>
              {de
                ? 'Hinversand trägst du. Bei Einzelbestellung ist der Rückversand oben eingerechnet, bei den Karten steckt er im Kartenpreis. Wir arbeiten als Kleinunternehmer nach § 19 UStG, es wird keine Umsatzsteuer ausgewiesen.'
                : 'You cover the shipping to us. For single orders return shipping is included above, for the cards it is part of the card price. We operate under the German small business rule, so no VAT is shown.'}
            </p>

            {/* ── Aus ganz Deutschland ── */}
            <div className="pt-12" style={{ borderTop: '1px solid var(--bd2)' }}>
              <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-4"
                style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', letterSpacing: '-0.02em' }}>
                {de ? 'Aus ganz Deutschland einschicken.' : 'Send it from anywhere in Germany.'}
              </h2>
              <p className="text-[14px] leading-relaxed max-w-[62ch]" style={{ color: 'var(--txm)' }}>
                {de
                  ? `Der Service ist reiner Postversand. Egal ob ${CITIES.join(', ')} oder das Dorf dazwischen — die Kette geht im Großbrief (${eur(PRICE.shippingSingle, de)}) zu uns nach Stuttgart, wird handgewachst und kommt im Maxibrief zurück. Die Bearbeitung dauert in der Regel ${TURNAROUND.full}, dazu je 1 bis 2 Werktage Post hin und zurück.`
                  : `The service is purely by mail. Whether ${CITIES.join(', ')} or the village in between — the chain travels to us in Stuttgart as a letter (${eur(PRICE.shippingSingle, de)}), gets hand-waxed and comes back as a large letter. Processing usually takes ${TURNAROUND.fullEn}, plus 1 to 2 working days of post each way.`}
              </p>
            </div>

            {/* ── Prepaid-Karten ── */}
            <div className="pt-12" style={{ borderTop: '1px solid var(--bd2)' }}>
              <h2 className="font-display font-bold text-wx-tx1 leading-tight"
                style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', letterSpacing: '-0.02em' }}>
                {de ? 'Prepaid-Karten für die Auffrischung.' : 'Prepaid cards for rewaxing.'}
              </h2>
              <p className="text-[13px] mt-1 mb-6" style={{ color: 'var(--txm)' }}>
                {de ? 'Mehrere Vorgänge im Voraus, einmal bezahlt. Nicht für den Umstieg.' : 'Several treatments up front, paid once. Not for the oil-to-wax switch.'}
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

      <RewaxTrust de={de} />

      {/* ── FAQ ── */}
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

          {/* Interne Links raus — SEO + Verweildauer */}
          <div className="mt-10 pt-8 max-w-[720px]" style={{ borderTop: '1px solid var(--bd2)' }}>
            <p className="text-small uppercase tracking-[0.16em] mb-4" style={{ color: 'var(--txf)' }}>
              {de ? 'Mehr zum Thema' : 'More on this'}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-semibold">
              {[
                { to: '/blog/von-oel-auf-wachs-umsteigen', de: 'Von Öl auf Wachs umsteigen', en: 'Switching from oil to wax' },
                { to: '/rechner/intervall', de: 'Wachs-Intervall berechnen', en: 'Work out your wax interval' },
                { to: '/wissenschaft', de: 'Die Wissenschaft dahinter', en: 'The science behind it' },
                { to: '/starter-set', de: 'Selbst wachsen: Starter-Set', en: 'Wax it yourself: starter set' },
              ].map(l => (
                <Link key={l.to} to={l.to} className="inline-flex items-center gap-1.5" style={{ color: 'var(--tx1)' }}>
                  {de ? l.de : l.en}
                  <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      </main>

      <GiftPreviewModal open={!!giftPreview} onClose={() => setGiftPreview(null)} de={de} data={giftPreview} />
      <RewaxStickyCTA de={de} />

      <footer id="rewax-footer" className={`${W} py-12 text-center`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
      </footer>

      <Footer />
    </div>
  );
}
