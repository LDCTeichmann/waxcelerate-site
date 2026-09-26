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

import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUp, BadgeCheck, CheckCircle2, Sparkles, Droplet, Check, Minus, Plus, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { trustStats } from '@/lib/data';
import { trackRewaxInterest } from '@/lib/analytics';
import { reviewById, type Review } from '@/sections/reviews';
import {
  PRICE, TEN_CARD, eur, UMSTIEG_LIVE, TURNAROUND, GUARANTEE,
  rewaxMeta, rewaxFaqItems, rewaxServiceSchema, rewaxFaqSchema,
  type ServiceId,
} from '@/pages/rewax/content';

import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { Stars } from '@/components/Stars';
import { FaqAccordion } from '@/components/FaqAccordion';
import { GiftSection } from '@/pages/rewax/GiftSection';
import { REWAX_CITIES } from '@/pages/rewax/cities';
import { LocalChainTool, ReturnWindowLine } from '@/pages/rewax/WaxWeek';
import { HOME_STATE, returnWindow, formatWindow } from '@/pages/rewax/dates';

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
    bodyDe: 'Quick-Link öffnen, Kette als Großbrief an uns. Vorreinigen musst du nichts.',
    bodyEn: 'Open the quick link, send the chain as a letter. No pre-cleaning needed.',
    img: '/images/rewax/step-1',
    altDe: 'Fahrradkette und Quick-Link neben einem Waxcelerate-Versandumschlag',
    altEn: 'Bike chain and quick link next to a Waxcelerate mailing envelope',
  },
  {
    n: 2,
    de: 'Reinigen & Wachsen', en: 'Clean & wax',
    bodyDe: 'Altwachs löst kochendes Wasser, geölte Ketten gehen erst ins separate Ultraschallbad. Dann frisches Wachs.',
    bodyEn: 'Boiling water lifts old wax, oiled chains go through a separate ultrasonic bath first. Then fresh wax.',
    img: '/images/rewax/step-2',
    altDe: 'Kette hängt an einem Draht über einem Edelstahl-Wachsbad',
    altEn: 'Chain hanging on a wire above a stainless-steel wax bath',
  },
  {
    n: 3,
    de: 'Zurück & anbauen', en: 'Back & refit',
    bodyDe: 'Trocken verpackt zurück. Quick-Link zu, kurz kurbeln, der Antrieb läuft leise.',
    bodyEn: 'Back, packed dry. Close the quick link, turn the cranks, the drivetrain runs quiet.',
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

const W = 'wx-frame';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()/-]{5,}$/;

// Preise-Button → Formular: scrollt hoch zum Stufenformular. Auf den
// Stadtseiten steht das Formular ebenfalls unter #rewax-form.
function toForm() {
  document.querySelector('#rewax-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Leistungswahl ──────────────────────────────────────────────────────────
// Die Frage, die der Besucher schon im Kopf hat: ist deine Kette schon
// gewachst, oder geölt/neu? Mit Erkennungshilfe, damit niemand raten muss.
const SERVICE_OPTIONS = [
  {
    id: 'rewax' as const, Icon: Sparkles,
    titleDe: 'Schon gewachst', titleEn: 'Already waxed',
    hintDe: 'Trocken und hell, keine schwarze Schmiere', hintEn: 'Dry and light, no black grime',
  },
  {
    id: 'umstieg' as const, Icon: Droplet,
    titleDe: 'Geölt oder neu', titleEn: 'Oiled or new',
    hintDe: 'Schwarz und ölig, oder frisch aus der Packung', hintEn: 'Black and oily, or fresh from the box',
  },
];

function ServiceChooser({ service, onChange, de }: {
  service: ServiceId | null; onChange: (s: ServiceId) => void; de: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={de ? 'Zustand deiner Kette' : 'State of your chain'} className="grid grid-cols-2 gap-2.5">
      {SERVICE_OPTIONS.map(({ id, Icon, titleDe, titleEn, hintDe, hintEn }) => {
        const active = service === id;
        return (
          <button key={id} type="button" role="radio" aria-checked={active}
            onClick={() => onChange(id)}
            className="group rounded-xl p-3.5 text-left transition-all hover:-translate-y-px"
            style={{
              background: active ? 'var(--accent-wash)' : 'var(--sf2)',
              border: `1.5px solid ${active ? 'var(--accent)' : 'var(--bd2)'}`,
            }}>
            <span className="grid place-items-center w-8 h-8 rounded-full mb-2.5"
              style={{ background: active ? 'var(--accent)' : 'var(--sf)', color: active ? '#fff' : 'var(--accent)' }}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="block text-[14px] font-semibold leading-tight" style={{ color: 'var(--tx1)' }}>{de ? titleDe : titleEn}</span>
            <span className="block text-[12px] leading-snug mt-1" style={{ color: 'var(--txm)' }}>{de ? hintDe : hintEn}</span>
            <span className="block num text-[12.5px] font-semibold mt-2" style={{ color: 'var(--accent)' }}>
              {de ? 'ab' : 'from'} {eur(PRICE[id].single, de)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Weich aufklappender Bereich: grid-template-rows 0fr → 1fr animiert die echte
// Inhaltshöhe ohne Messen. Zu = inert, damit Tab nicht in versteckte Felder läuft.
function Reveal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className="grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
      style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
      aria-hidden={!open} inert={!open}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

// ─── Bestellformular (Stufen) ───────────────────────────────────────────────
// Eine Stufe nach der anderen: 1) Zustand der Kette, 2) wie viele, 3) Kontakt.
// Erledigte Stufen schrumpfen zu einer Zeile mit „ändern", damit das Formular
// nicht wächst. Die Menge sind drei Chips (1 · 2 · 3+), der Stepper erscheint
// erst bei 3+; der Mengenpreis greift ab PRICE.bundleCount (2) von selbst. Das ist die EINZIGE Auswahl der Seite — die Preise weiter unten
// sind nur noch Übersicht. API-Payload unverändert (`single`/`bundle3`).
type Step = 1 | 2 | 3;

export function RewaxRequestForm({ de, preselect }: { de: boolean; preselect: ServiceId | null }) {
  const initial: ServiceId | null = UMSTIEG_LIVE ? preselect : 'rewax';
  const [service, setService] = useState<ServiceId | null>(initial);
  const [step, setStep] = useState<Step>(initial ? 2 : 1);
  const [quantity, setQuantity] = useState(1);
  const [messageOpen, setMessageOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const p = PRICE[service ?? 'rewax'];
  const isBundle = quantity >= PRICE.bundleCount;
  const perChain = isBundle ? p.bundle : p.single;
  // Eine Kette passt in den Großbrief (1,80 €), ab zwei Ketten geht es im
  // Maxibrief (2,90 €) zurück — von Luca bestätigt 2026-09-14.
  const shipping = quantity === 1 ? PRICE.shippingSingle : PRICE.shippingBundle;
  const total = perChain * quantity + shipping;

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-base sm:text-sm outline-none';
  const inputStyle = { background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)' };
  const contactLooksValid = EMAIL_RE.test(contact) || PHONE_RE.test(contact);

  const pickService = (s: ServiceId) => { setService(s); setStep(2); };

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
          service: service ?? 'rewax', tierId: isBundle ? 'bundle3' : 'single', quantity,
          isGift: false, name, contact, message, honeypot,
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
      <div className="flex items-start gap-3 rounded-2xl p-5"
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

  const labels = UMSTIEG_LIVE
    ? [de ? 'Kette' : 'Chain', de ? 'Menge' : 'Amount', de ? 'Kontakt' : 'Contact']
    : [de ? 'Menge' : 'Amount', de ? 'Kontakt' : 'Contact'];
  const current = UMSTIEG_LIVE ? step : step - 1;
  const svcLabel = SERVICE_OPTIONS.find(o => o.id === service);
  const qtyLabel = `${quantity} ${de ? (quantity === 1 ? 'Kette' : 'Ketten') : (quantity === 1 ? 'chain' : 'chains')}`;

  // Erledigte Stufe als eine Zeile
  const doneRow = (label: string, value: string, back: Step) => (
    <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid var(--bd2)' }}>
      <p className="flex items-center gap-2 text-[13.5px] min-w-0" style={{ color: 'var(--txm)' }}>
        <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
        <span className="truncate">{label}: <strong style={{ color: 'var(--tx1)' }}>{value}</strong></span>
      </p>
      <button type="button" onClick={() => setStep(back)}
        className="py-2 -my-2 text-[12.5px] font-semibold underline underline-offset-2 flex-shrink-0" style={{ color: 'var(--txm)' }}>
        {de ? 'ändern' : 'change'}
      </button>
    </div>
  );

  const heading = (text: string) => (
    <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tx1)' }}>{text}</p>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-4 sm:p-5"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

      {/* Fortschritt */}
      <ol className="flex items-center gap-2 mb-4" aria-label={de ? 'Fortschritt' : 'Progress'}>
        {labels.map((l, i) => {
          const n = i + 1;
          const done = n < current, now = n === current;
          return (
            <li key={l} className="flex items-center gap-2 flex-1 min-w-0" aria-current={now ? 'step' : undefined}>
              <span className="num inline-grid place-items-center w-5 h-5 rounded-full text-[11px] font-semibold flex-shrink-0"
                style={{
                  background: done || now ? 'var(--accent)' : 'var(--sf2)',
                  color: done || now ? '#fff' : 'var(--txf)',
                }}>
                {done ? <Check className="h-3 w-3" aria-hidden /> : n}
              </span>
              <span className="text-[12px] font-medium truncate" style={{ color: now ? 'var(--tx1)' : 'var(--txf)' }}>{l}</span>
              {n < labels.length && <span className="h-px flex-1" style={{ background: 'var(--bd)' }} aria-hidden />}
            </li>
          );
        })}
      </ol>

      {/* 1 — Zustand */}
      {UMSTIEG_LIVE && (step === 1
        ? (<div>{heading(de ? 'Wie sieht deine Kette gerade aus?' : 'What does your chain look like right now?')}
            <ServiceChooser service={service} onChange={pickService} de={de} /></div>)
        : svcLabel && doneRow(de ? 'Kette' : 'Chain', de ? svcLabel.titleDe : svcLabel.titleEn, 1))}

      {/* 2 — Menge */}
      {step === 2 && (
        <div className={UMSTIEG_LIVE ? 'pt-4' : ''}>
          {heading(de ? 'Wie viele Ketten schickst du?' : 'How many chains are you sending?')}
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3].map((n) => {
              const on = n === 3 ? quantity >= 3 : quantity === n;
              return (
                <button key={n} type="button" aria-pressed={on} onClick={() => setQuantity(n)}
                  className="rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors"
                  style={{
                    background: on ? 'var(--accent)' : 'var(--sf2)', color: on ? '#fff' : 'var(--tx1)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--bd2)'}`,
                  }}>
                  {n === 3 ? '3+' : n}
                </button>
              );
            })}
            {quantity >= 3 && (
              <div className="inline-flex items-center rounded-full ml-1" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
                <button type="button" onClick={() => setQuantity(q => Math.max(3, q - 1))} disabled={quantity <= 3}
                  aria-label={de ? 'Eine Kette weniger' : 'One chain fewer'}
                  className="w-9 h-9 grid place-items-center rounded-full disabled:opacity-30" style={{ color: 'var(--tx1)' }}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="num w-6 text-center text-[14px] font-semibold" style={{ color: 'var(--tx1)' }} aria-live="polite">{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => Math.min(20, q + 1))}
                  aria-label={de ? 'Eine Kette mehr' : 'One chain more'}
                  className="w-9 h-9 grid place-items-center rounded-full" style={{ color: 'var(--tx1)' }}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Summe */}
          <div className="mt-4 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: 'var(--sf2)' }}>
            <div className="min-w-0">
              <p className="num text-[12.5px]" style={{ color: 'var(--txm)' }}>
                {quantity} × {eur(perChain, de)} + {eur(shipping, de)} {de ? 'Rückversand' : 'return'}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: isBundle ? 'var(--accent)' : 'var(--txf)' }}>
                {quantity === 2 && (de ? 'Rotation: eine fährt, eine ist bei uns. ' : 'Rotation: one rides, one is with us. ')}
                {isBundle
                  ? (de ? `Mengenpreis: ${eur(p.bundle, de)} statt ${eur(p.single, de)}` : `Volume price: ${eur(p.bundle, de)} instead of ${eur(p.single, de)}`)
                  : (de ? `Ab ${PRICE.bundleCount} Ketten nur ${eur(p.bundle, de)} je Kette` : `From ${PRICE.bundleCount} chains only ${eur(p.bundle, de)} each`)}
              </p>
            </div>
            <p className="font-display font-bold leading-none whitespace-nowrap" style={{ fontSize: '1.35rem', color: 'var(--tx1)' }}>{eur(total, de)}</p>
          </div>
          {service === 'rewax' && (
            <p className="text-[12px] mt-2" style={{ color: 'var(--txf)' }}>
              {de ? 'Öfter fällig? ' : 'Due often? '}
              <a href="#geschenk" className="underline underline-offset-2" style={{ color: 'var(--txm)' }}>
                {de ? `10er-Karte, ${eur(TEN_CARD.price / TEN_CARD.count, de)} je Mal` : `10-card, ${eur(TEN_CARD.price / TEN_CARD.count, de)} each`}
              </a>
            </p>
          )}

          <button type="button" onClick={() => setStep(3)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {de ? 'Weiter' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
      {step === 3 && doneRow(de ? 'Menge' : 'Amount', `${qtyLabel} · ${eur(total, de)}`, 2)}

      {/* 3 — Kontakt */}
      <Reveal open={step === 3}>
        <div className="pt-4 space-y-3">
          {heading(de ? 'Wohin schicken wir die Versandadresse?' : 'Where should we send the shipping address?')}
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="rewax-name" className="sr-only">Name</label>
              <input id="rewax-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Name" autoComplete="name" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="rewax-contact" className="sr-only">{de ? 'E-Mail oder Telefon' : 'Email or phone'}</label>
              <input id="rewax-contact" type="text" required value={contact} onChange={(e) => setContact(e.target.value)}
                placeholder={de ? 'E-Mail oder Telefon' : 'Email or phone'} autoComplete="email" className={inputClass} style={inputStyle} />
            </div>
          </div>

          {messageOpen ? (
            <div>
              <label htmlFor="rewax-message" className="sr-only">{de ? 'Nachricht' : 'Message'}</label>
              <textarea id="rewax-message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder={de ? 'Nachricht, z. B. Kettenmodell' : 'Message, e.g. chain model'}
                className={inputClass} style={inputStyle} autoFocus />
            </div>
          ) : (
            <button type="button" onClick={() => setMessageOpen(true)}
              className="inline-flex items-center gap-1 py-2 -my-2 text-[12.5px] font-medium" style={{ color: 'var(--txm)' }}>
              <Plus className="h-3.5 w-3.5" /> {de ? 'Nachricht hinzufügen' : 'Add a message'}
            </button>
          )}

          {status === 'error' && (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
          )}

          <button type="submit" disabled={status === 'sending'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {status === 'sending' ? (de ? 'Wird gesendet …' : 'Sending …') : (de ? 'Kette anmelden' : 'Book my chain')}
          </button>
          <p className="text-[12px] sm:text-[11.5px] leading-relaxed text-center" style={{ color: 'var(--txf)' }}>
            {de
              ? 'Keine Zahlung jetzt. Versandadresse kommt per E-Mail, meist am selben Werktag.'
              : 'No payment now. The shipping address arrives by email, usually the same working day.'}
          </p>
        </div>
      </Reveal>
    </form>
  );
}

// ─── Preise: kompakte Übersicht ─────────────────────────────────────────────
// Vorher hatte dieser Block einen eigenen Mengen- und Leistungs-Umschalter und
// eigene „anmelden"-Buttons — eine zweite Auswahl neben dem Formular (Luca,
// 26.09.2026: „intuitiverer Prozess, weniger überladen"). Jetzt nur noch
// Übersicht: je Leistung Einzel- und Mengenpreis, drei Häkchen, ein Button
// zurück zum Formular.
export function PriceMatrix({ de }: { de: boolean }) {
  const cols: ServiceId[] = UMSTIEG_LIVE ? ['rewax', 'umstieg'] : ['rewax'];

  const card = {
    rewax: {
      t: de ? 'Auffrischung' : 'Rewax', s: de ? 'Kette ist schon gewachst' : 'Chain is already waxed', Icon: Sparkles,
      points: de
        ? ['Altwachs mit kochendem Wasser raus, ohne Lösemittel', 'Frisches Wachsbad, voll ausgehärtet', 'Glieder freigebrochen, trocken verpackt']
        : ['Old wax out with boiling water, no solvents', 'Fresh wax bath, fully cured', 'Links broken free, packed dry'],
    },
    umstieg: {
      t: de ? 'Umstieg' : 'Switch', s: de ? 'Kette ist geölt oder neu' : 'Chain is oiled or new', Icon: Droplet,
      points: de
        ? ['Separates Ultraschallbad: Öl und Fett komplett raus', 'Erstes Wachsbad, bis in jedes Gelenk', 'Glieder freigebrochen, trocken verpackt']
        : ['Separate ultrasonic bath: all oil and grease out', 'First wax bath, into every joint', 'Links broken free, packed dry'],
    },
  } as const;

  return (
    <div>
      <h2 className="font-display font-bold text-wx-tx1 leading-tight"
        style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Was es kostet.' : 'What it costs.'}
      </h2>
      <p className="text-[14px] mt-2 mb-6" style={{ color: 'var(--txm)' }}>
        {de ? 'Zwei Leistungen, je nachdem, wie deine Kette ankommt. Plus Rückversand.' : 'Two services, depending on how your chain arrives. Plus return shipping.'}
      </p>

      <div className={`grid gap-3 sm:gap-4 ${cols.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {cols.map((c) => {
          const { t, s, Icon, points } = card[c];
          const p = PRICE[c];
          return (
            <div key={c} className="rounded-2xl p-5" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-[15px]" style={{ color: 'var(--tx1)' }}>
                    <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />{t}
                  </p>
                  <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--txm)' }}>{s}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold leading-none whitespace-nowrap" style={{ fontSize: '1.6rem', letterSpacing: '-0.02em', color: 'var(--tx1)' }}>
                    {eur(p.single, de)}
                  </p>
                  <p className="num text-[12px] mt-1" style={{ color: 'var(--accent)' }}>
                    {de ? `ab ${PRICE.bundleCount} Ketten: ${eur(p.bundle, de)} je` : `${PRICE.bundleCount}+ chains: ${eur(p.bundle, de)} each`}
                  </p>
                </div>
              </div>
              <ul className="mt-4 pt-4 space-y-1.5" style={{ borderTop: '1px solid var(--bd2)' }}>
                {points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: 'var(--tx2)' }}>
                    <Check className="h-3.5 w-3.5 flex-shrink-0 mt-[3px]" style={{ color: 'var(--accent)' }} aria-hidden />{pt}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 text-[13px] leading-snug" style={{ color: 'var(--txm)' }}>
          <p className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-px" style={{ color: 'var(--accent)' }} aria-hidden />
            <span><strong style={{ color: 'var(--tx1)' }}>{de ? GUARANTEE.short : GUARANTEE.shortEn}:</strong> {de ? GUARANTEE.line : GUARANTEE.lineEn}</span>
          </p>
          <p className="flex items-start gap-2">
            <Clock className="h-4 w-4 flex-shrink-0 mt-px" style={{ color: 'var(--accent)' }} aria-hidden />
            <ReturnWindowLine state={HOME_STATE} de={de} />
          </p>
        </div>
        <button type="button" onClick={toForm}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {de ? 'Jetzt auswählen' : 'Choose now'} <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[12px] sm:text-[11.5px] leading-relaxed mt-5" style={{ color: 'var(--txff)' }}>
        {de
          ? `Rückversand: eine Kette ${eur(PRICE.shippingSingle, de)}, ab zwei Ketten ${eur(PRICE.shippingBundle, de)} für alle zusammen; den Hinweg trägst du. Kleinunternehmer nach § 19 UStG, daher keine Umsatzsteuer ausgewiesen.`
          : `Return shipping: one chain ${eur(PRICE.shippingSingle, de)}, two or more ${eur(PRICE.shippingBundle, de)} in total; you cover the way to us. Small business under § 19 UStG, so no VAT is shown.`}
      </p>
    </div>
  );
}

// ─── So läuft's ab ──────────────────────────────────────────────────────────
// Drei kleine Karten untereinander an einer Linie, jede mit „Dein Teil" bzw.
// „Machen wir": zeigt auf einen Blick, wie wenig Arbeit beim Kunden bleibt.
// Daneben der Vergleich zum Selbstwachsen (Aussagen wie in der FAQ, keine
// neuen Zeit-Claims) und das echte Zitat „wollte mir einfach die Arbeit sparen".
export function RewaxSteps({ de }: { de: boolean }) {
  const legs = [
    { de: 'Post zu uns', en: 'Post to us', v: de ? '1–2 Werktage' : '1–2 days', grow: 1, strong: false },
    { de: 'Bei uns', en: 'With us', v: de ? TURNAROUND.short : TURNAROUND.shortEn, grow: 2, strong: true },
    { de: 'Post zu dir', en: 'Post to you', v: de ? '1–2 Werktage' : '1–2 days', grow: 1, strong: false },
  ];
  const quote = reviewById('m8100-selbstwachser');
  const self = de
    ? ['Kette abnehmen und komplett entfetten', 'Wachs im Topf schmelzen, Kette baden', 'Aushärten lassen, Glieder freibrechen', 'Platz für Topf und Ausrüstung']
    : ['Remove the chain and degrease it fully', 'Melt wax in a pot, bathe the chain', 'Let it cure, break the links free', 'Space for the pot and the gear'];
  const us = de
    ? ['Kette in den Umschlag', 'Briefmarke drauf, einwerfen']
    : ['Chain into the envelope', 'Stamp on, post it'];

  return (
    <section id="ablauf" className="scroll-mt-24 py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Ablauf' : 'How it works'}
        </p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight"
          style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
          {de ? 'Du schickst sie los. Den Rest machen wir.' : 'You post it. We do the rest.'}
        </h2>
        <p className="text-[14.5px] mt-2 mb-8 max-w-[56ch]" style={{ color: 'var(--txm)' }}>
          {de ? 'Dein Teil dauert ein paar Minuten. Reinigen, wachsen, aushärten, freibrechen übernehmen wir.' : 'Your part takes a few minutes. Cleaning, waxing, curing and freeing the links is on us.'}
        </p>

        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-8 lg:gap-12 items-start">
          {/* Schritte an einer Linie */}
          <ol className="relative space-y-3">
            <span aria-hidden className="absolute left-[27px] sm:left-[33px] top-6 bottom-6 w-px" style={{ background: 'var(--bd)' }} />
            {STEPS.map(s => {
              const mine = s.n === 1;
              return (
                <li key={s.n} className="relative flex items-center gap-4 rounded-2xl p-2.5 pr-4"
                  style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
                  <div className="relative flex-shrink-0 w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden" style={{ background: 'var(--sf2)' }}>
                    <img src={`${s.img}-800.webp`} alt={de ? s.altDe : s.altEn}
                      loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    <span className="num absolute left-1 top-1 grid place-items-center w-5 h-5 rounded-full text-[11px] font-bold"
                      style={{ background: 'var(--accent)', color: '#fff' }}>{s.n}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="font-semibold text-[15px]" style={{ color: 'var(--tx1)' }}>{de ? s.de : s.en}</h3>
                      <span className="text-[11px] font-semibold rounded-full px-2 py-0.5"
                        style={mine
                          ? { background: 'var(--accent-wash)', color: 'var(--accent)' }
                          : { background: 'var(--sf2)', color: 'var(--txm)' }}>
                        {mine ? (de ? 'Dein Teil' : 'Your part') : (de ? 'Machen wir' : 'On us')}
                      </span>
                    </div>
                    <p className="text-[13px] leading-snug mt-1" style={{ color: 'var(--txm)' }}>{de ? s.bodyDe : s.bodyEn}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Arbeit gespart */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.18)' }}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--txf)' }}>
              {de ? 'Die Arbeit, die du sparst' : 'The work you save'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--txm)' }}>{de ? 'Selbst wachsen' : 'Wax it yourself'}</p>
                <ul className="mt-2 space-y-1.5">
                  {self.map(x => (
                    <li key={x} className="flex items-start gap-1.5 text-[12.5px] leading-snug" style={{ color: 'var(--txf)' }}>
                      <span aria-hidden className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--txff)' }} />{x}
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-2 font-medium" style={{ color: 'var(--txm)' }}>{de ? '= ein Abend' : '= an evening'}</p>
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>{de ? 'Mit uns' : 'With us'}</p>
                <ul className="mt-2 space-y-1.5">
                  {us.map(x => (
                    <li key={x} className="flex items-start gap-1.5 text-[12.5px] leading-snug" style={{ color: 'var(--tx1)' }}>
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-[1px]" style={{ color: 'var(--accent)' }} aria-hidden />{x}
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-2 font-medium" style={{ color: 'var(--accent)' }}>{de ? '= ein paar Minuten' : '= a few minutes'}</p>
              </div>
            </div>
            {quote && (
              <figure className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(var(--accent-rgb),0.18)' }}>
                <blockquote className="text-[13px] leading-snug italic" style={{ color: 'var(--tx2)' }}>
                  {de
                    ? '„Ich wollte mir einfach die Arbeit sparen, da das mit dem Ölfrei machen der Kette ziemlich zeitaufwändig ist."'
                    : '"I just wanted to save myself the work, since getting the chain oil-free is pretty time-consuming."'}
                </blockquote>
                <figcaption className="text-[12px] mt-1.5" style={{ color: 'var(--txf)' }}>
                  {quote.name} · {de ? 'eBay verifiziert' : 'eBay verified'}
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        {/* Laufzeit als Zeitstrahl */}
        <div className="mt-8 flex gap-1.5 max-w-[640px]">
          {legs.map(l => (
            <div key={l.de} style={{ flexGrow: l.grow, flexBasis: 0 }}>
              <div className="h-1 rounded-full" style={{ background: l.strong ? 'var(--accent)' : 'var(--bd)' }} />
              <p className="text-[12px] sm:text-[11.5px] mt-2" style={{ color: 'var(--txf)' }}>{de ? l.de : l.en}</p>
              <p className="num text-[13px] font-semibold" style={{ color: l.strong ? 'var(--accent)' : 'var(--tx1)' }}>{l.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Vertrauen ──────────────────────────────────────────────────────────────
// Drei echte eBay-Bewertungen, wortgleich: t***t („die besten Ketten") groß als
// Hauptzitat, daneben i***4 (Beratung) und r***e (zuvorkommend). j***k steht
// schon im Ablauf, e***n auf dem Hero-Bild. Keine erfundenen Zitate.
function initialOf(name: string) {
  return (name.match(/[a-z0-9]/i)?.[0] ?? '?').toUpperCase();
}

function ReviewMeta({ r, de }: { r: Review; de: boolean }) {
  return (
    <figcaption className="flex items-center gap-2.5 mt-4">
      <span className="grid place-items-center w-8 h-8 rounded-full text-[13px] font-semibold flex-shrink-0"
        style={{ background: 'var(--accent-wash)', color: 'var(--accent)' }} aria-hidden>{initialOf(r.name)}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>
          {r.name}
          <BadgeCheck className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} aria-hidden />
          <span className="text-[11.5px] font-medium" style={{ color: 'var(--txf)' }}>{de ? 'eBay verifiziert' : 'eBay verified'}</span>
        </span>
        <span className="block text-[11.5px] truncate" style={{ color: 'var(--txf)' }}>
          {(de ? r.productDe : r.productEn) ?? ''}{(de ? r.productDe : r.productEn) ? ' · ' : ''}{de ? r.dateDe : r.dateEn}
        </span>
      </span>
    </figcaption>
  );
}

function ReviewCard({ r, de }: { r: Review; de: boolean }) {
  return (
    <figure className="rounded-2xl p-5 flex flex-col justify-between" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
      <div>
        <Stars />
        <blockquote className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--tx2)' }}>
          „{de ? r.textDe : r.textEn}“
        </blockquote>
      </div>
      <ReviewMeta r={r} de={de} />
    </figure>
  );
}

function RewaxTrust({ de }: { de: boolean }) {
  const hero = reviewById('m9100-beste-ketten');
  const side = ['m7100-beratung', 'm8100-zuvorkommend'].map(reviewById).filter((r): r is Review => Boolean(r));

  return (
    <section className="py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 mb-7">
          <div>
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{de ? 'Bewertungen' : 'Reviews'}</p>
            <h2 className="font-display font-bold text-wx-tx1 leading-tight"
              style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
              {de ? 'Was Kunden sagen.' : 'What customers say.'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Stars size="h-4 w-4" />
            <p className="text-[13px]" style={{ color: 'var(--txm)' }}>
              <strong style={{ color: 'var(--tx1)' }}>{trustStats.reviews}</strong> {de ? 'Bewertungen · 100 % positiv' : 'reviews · 100% positive'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-4">
          {hero && (
            <figure className="rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
              style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.2)' }}>
              <div>
                <Stars size="h-4 w-4" />
                <blockquote className="font-display font-semibold leading-snug mt-4"
                  style={{ color: 'var(--tx1)', fontSize: 'clamp(1.08rem, 2.2vw, 1.5rem)', letterSpacing: '-0.01em' }}>
                  „{de ? hero.textDe : hero.textEn}“
                </blockquote>
              </div>
              <ReviewMeta r={hero} de={de} />
            </figure>
          )}
          <div className="grid gap-4">
            {side.map(r => <ReviewCard key={r.id} r={r} de={de} />)}
          </div>
        </div>

        {/* Luca + Kennzahlen als schmale Leiste */}
        <div className="mt-6 rounded-2xl px-4 sm:px-5 py-4 flex flex-wrap items-center gap-x-10 gap-y-4"
          style={{ background: 'var(--sf2)' }}>
          <div className="flex items-center gap-3">
            <img src="/images/people/luca-stage.webp" alt={de ? 'Luca von Waxcelerate' : 'Luca of Waxcelerate'}
              className="rounded-full object-cover flex-shrink-0" style={{ width: 44, height: 44 }} loading="lazy" />
            <div>
              <p className="font-semibold text-[13.5px]" style={{ color: 'var(--tx1)' }}>Luca Teichmann</p>
              <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
                {de ? 'wächst jede Kette selbst · Stuttgart' : 'waxes every chain himself · Stuttgart'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:flex sm:gap-10">
            {[
              { v: `${trustStats.sold}+`, l: de ? 'Ketten gewachst, seit 2024' : 'chains waxed, since 2024' },
              { v: de ? TURNAROUND.short : TURNAROUND.shortEn, l: de ? 'Bearbeitung ab Ankunft' : 'processing after arrival' },
            ].map(({ v, l }) => (
              <div key={l}>
                <p className="font-display font-bold leading-none" style={{ fontSize: '1.2rem', color: 'var(--tx1)' }}>{v}</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--txm)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] leading-relaxed mt-3" style={{ color: 'var(--txff)' }}>
          {de
            ? 'Bewertungen aus unserem eBay-Shop, unverändert übernommen. „100 % positiv" heißt: keine negative Bewertung.'
            : 'Reviews from our eBay shop, quoted verbatim. "100% positive" means: no negative rating.'}
        </p>
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
        {/* Preis, Risiko und Zeit am Daumen — die drei Fragen vor dem Klick */}
        <p className="num text-[12px] text-center mt-1.5 truncate" style={{ color: 'var(--txm)' }}>
          {de ? 'ab ' : 'from '}{eur(PRICE.rewax.single, de)} · {de ? GUARANTEE.short : GUARANTEE.shortEn} · {de ? 'zurück ca. ' : 'back approx. '}{formatWindow(returnWindow(new Date(), HOME_STATE), de)}
        </p>
      </div>
    </div>
  );
}

// ─── Seite ──────────────────────────────────────────────────────────────────
export function RewaxPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
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

  const heroTitle = de ? 'Fahrradkette wachsen lassen.' : 'Get your chain waxed.';
  const valueProp = de
    ? 'Kette einschicken, frisch gewachst und leise zurück. Handgewachst in Stuttgart, deutschlandweit per Post.'
    : 'Send in your chain, get it back freshly waxed and quiet. Hand-waxed in Stuttgart, nationwide by mail.';
  // Ein kurzes, echtes Service-Zitat schwebt auf dem Hero-Bild.
  const heroQuote = reviewById('m8100-einwandfrei');

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
      {/* Bild als gerahmte Bühne neben dem Formular (vorher lief es rechts
          randlos aus dem Rahmen). Mobil steht es als flache Karte oben. */}
      <section id="rewax-hero" className="pt-24 sm:pt-32 pb-12 sm:pb-16" style={{ background: 'var(--pg)' }}>
        <div className={`${W} grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] gap-6 lg:gap-14 items-start`}>
          <div className="lg:max-w-[480px] min-w-0">
            <BackLink de={de} className="hidden lg:inline-flex mb-6" />
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{de ? 'Wachs-Service' : 'Wax service'}</p>
            <h1 className="font-display font-bold leading-[1.02]"
              style={{ color: 'var(--tx1)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.025em' }}>
              {heroTitle}
            </h1>
            <p className="text-[15.5px] leading-relaxed mt-4" style={{ color: 'var(--txm)' }}>
              {valueProp}
            </p>
            {waxedLabel && (
              <p className="text-[14px] font-semibold mt-3" style={{ color: 'var(--accent-soft)' }}>
                {de
                  ? `Deine Karte: gewachst am ${waxedLabel}. Klingt sie trocken, schick sie ein.`
                  : `Your card: waxed ${waxedLabel}. If it sounds dry, send it in.`}
              </p>
            )}
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] font-medium mt-4" style={{ color: 'var(--tx2)' }}>
              {(de
                ? ['Nichts vorreinigen', `${TURNAROUND.short} bei uns`, GUARANTEE.short]
                : ['No pre-cleaning', `${TURNAROUND.shortEn} with us`, GUARANTEE.shortEn]).map(c => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />{c}
                </span>
              ))}
            </p>

            <div id="rewax-form" className="mt-6 scroll-mt-24">
              <RewaxRequestForm de={de} preselect={waxedLabel ? 'rewax' : null} />
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-3">
                <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--txm)' }}>
                  <Stars size="h-3 w-3" />
                  {trustStats.reviews} {de ? 'Bewertungen · 100 % positiv' : 'reviews · 100% positive'}
                </div>
                <a href={waLink(de, waxedLabel)} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackRewaxInterest()}
                  className="inline-flex items-center gap-1.5 py-2 -my-2 text-[12.5px] font-semibold" style={{ color: 'var(--tx1)' }}>
                  {de ? 'Lieber per WhatsApp' : 'Prefer WhatsApp'}
                  <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                </a>
              </div>
            </div>
          </div>

          <figure className="order-first lg:order-none lg:mt-12 relative rounded-2xl lg:rounded-3xl overflow-hidden aspect-[2/1] sm:aspect-[16/9] lg:aspect-[4/5]"
            style={{ background: 'var(--hero-stage, var(--sf2))', boxShadow: 'var(--card-shad)' }}>
            <img src="/images/rewax/hero.webp"
              srcSet="/images/rewax/hero-800.webp 800w, /images/rewax/hero.webp 1200w"
              sizes="(max-width: 1024px) 92vw, 44vw"
              alt={de ? 'Frisch gewachste Ketten hängen zum Aushärten' : 'Freshly waxed chains hanging to cure'}
              fetchPriority="high"
              className="w-full h-full object-cover" style={{ objectPosition: '62% 45%' }} />
            {heroQuote && (
              <figcaption className="hidden sm:block absolute left-4 right-4 bottom-4 max-w-[340px] rounded-2xl p-4"
                style={{ background: 'color-mix(in srgb, var(--sf) 88%, transparent)', border: '1px solid var(--bd)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                <Stars size="h-3 w-3" />
                <p className="text-[13px] leading-snug mt-2" style={{ color: 'var(--tx1)' }}>
                  „{de ? heroQuote.textDe : heroQuote.textEn}“
                </p>
                <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--txf)' }}>
                  {heroQuote.name} · {de ? 'eBay verifiziert' : 'eBay verified'}
                </p>
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      <RewaxSteps de={de} />

      <section id="preise" className="scroll-mt-24 py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <div className="max-w-[880px]">
            <PriceMatrix de={de} />
          </div>
        </div>
      </section>

      <RewaxTrust de={de} />

      <GiftSection de={de} />

      <LocalChainTool de={de} />

      {/* ── FAQ ── gleiche Akkordeon-Sprache wie die Produktseiten */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 lg:gap-16 items-start">
            <div>
              <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
                {de ? 'Fragen' : 'Questions'}
              </p>
              <h2 className="font-display font-bold text-wx-tx1 leading-tight"
                style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
                {de ? 'Kurz beantwortet.' : 'Answered briefly.'}
              </h2>
              <div className="hidden lg:block mt-6 rounded-2xl p-5" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
                <p className="font-display font-semibold text-[18px]" style={{ color: 'var(--tx1)' }}>
                  {de ? 'Noch eine Frage?' : 'Another question?'}
                </p>
                <p className="text-[14px] leading-relaxed mt-1.5" style={{ color: 'var(--txm)' }}>
                  {de ? 'Schreib Luca direkt, die Antwort kommt meist am selben Tag.' : 'Message Luca directly, usually answered the same day.'}
                </p>
                <a href={waLink(de, waxedLabel)} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackRewaxInterest()}
                  className="inline-flex items-center gap-1.5 mt-3 text-[13.5px] font-semibold" style={{ color: 'var(--accent-soft)' }}>
                  WhatsApp <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <FaqAccordion items={faqItems} de={de} idPrefix="rewax-faq" />
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
            {/* Die zwölf Stadtseiten, einmal verlinkt (vorher doppelt als Chips). */}
            <p className="text-[13px] leading-relaxed mt-6" style={{ color: 'var(--txm)' }}>
              {de ? 'Per Post aus ganz Deutschland, zum Beispiel aus ' : 'By mail from anywhere in Germany, for example from '}
              {REWAX_CITIES.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && ' · '}
                  <Link to={`/kette-wachsen-lassen/${c.slug}`} className="font-medium hover:underline underline-offset-2" style={{ color: 'var(--tx2)' }}>
                    {de ? c.name : c.nameEn}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>
      </main>

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
