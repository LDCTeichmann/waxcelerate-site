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
import { ArrowLeft, ArrowRight, ChevronDown, CheckCircle2, Sparkles, Droplet, Check, Minus, Plus, Clock, ShieldCheck } from 'lucide-react';
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

// Preiskarte → Formular: „Umstieg anmelden" bei 2 Ketten setzt beides im
// Stufenformular und scrollt hin. Ein Fenster-Event statt State-Lift, weil
// PriceMatrix und Formular auch auf den Stadtseiten getrennt stehen.
const BOOK_EVENT = 'rewax:book';
function bookChain(service: ServiceId, quantity: number) {
  window.dispatchEvent(new CustomEvent(BOOK_EVENT, { detail: { service, quantity } }));
  document.querySelector('#rewax-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Leistungswahl ──────────────────────────────────────────────────────────
// Die Frage, die der Besucher schon im Kopf hat: ist deine Kette schon
// gewachst, oder geölt/neu? Erster Schritt des Stufenformulars. Nur sichtbar
// wenn der Umstieg-Service live ist.
function ServiceChooser({ service, onChange, de }: {
  service: ServiceId | null; onChange: (s: ServiceId) => void; de: boolean;
}) {
  const options = [
    {
      id: 'rewax' as const, Icon: Sparkles,
      titleDe: 'Schon gewachst', titleEn: 'Already waxed',
      bodyDe: 'Auffrischen', bodyEn: 'Refresh',
      price: `${de ? 'ab' : 'from'} ${eur(PRICE.rewax.single, de)}`,
    },
    {
      id: 'umstieg' as const, Icon: Droplet,
      titleDe: 'Geölt oder neu', titleEn: 'Oiled or new',
      bodyDe: 'Entfetten + erstmals wachsen', bodyEn: 'Degrease + first wax',
      price: `${de ? 'ab' : 'from'} ${eur(PRICE.umstieg.single, de)}`,
    },
  ];
  return (
    <div role="radiogroup" aria-label={de ? 'Zustand deiner Kette' : 'State of your chain'}
      className="grid grid-cols-2 gap-2">
      {options.map(({ id, Icon, titleDe, titleEn, bodyDe, bodyEn, price }) => {
        const active = service === id;
        return (
          <button key={id} type="button" role="radio" aria-checked={active}
            onClick={() => onChange(id)}
            className="rounded-xl p-3 text-left transition-colors"
            style={{
              background: active ? 'var(--accent)' : 'var(--sf2)',
              color: active ? '#fff' : 'var(--tx1)',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--bd2)'}`,
            }}>
            <span className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: active ? '#fff' : 'var(--accent)' }} aria-hidden />
              <span className="text-[13.5px] font-semibold leading-tight">{de ? titleDe : titleEn}</span>
            </span>
            <span className="block text-[12px] sm:text-[11.5px] leading-snug mt-1" style={{ opacity: 0.8 }}>{de ? bodyDe : bodyEn}</span>
            <span className="block text-[12px] font-semibold mt-1" style={{ color: active ? '#fff' : 'var(--accent)' }}>{price}</span>
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
// Statt alles auf einmal: 1) Zustand der Kette, 2) wie viele (Stepper, der
// Mengenpreis ab drei Ketten greift von selbst), 3) Kontakt. Jede Stufe klappt
// erst auf, wenn die vorige beantwortet ist. Die Prepaid-Karten stehen nicht
// mehr hier, sondern in der Geschenk-Sektion; das Formular kennt nur noch
// `single`/`bundle3` — die API-Payload ist dieselbe wie vorher.
export function RewaxRequestForm({ de, preselect }: { de: boolean; preselect: ServiceId | null }) {
  const [service, setService] = useState<ServiceId | null>(UMSTIEG_LIVE ? preselect : 'rewax');
  const [quantity, setQuantity] = useState(1);
  const [contactOpen, setContactOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const onBook = (e: Event) => {
      const { service: s, quantity: q } = (e as CustomEvent<{ service: ServiceId; quantity: number }>).detail;
      setService(UMSTIEG_LIVE ? s : 'rewax');
      setQuantity(q);
    };
    window.addEventListener(BOOK_EVENT, onBook);
    return () => window.removeEventListener(BOOK_EVENT, onBook);
  }, []);

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

  const stepLabel = (n: number, de_: string, en: string) => (
    <p className="flex items-center gap-2 text-[12.5px] font-semibold mb-2" style={{ color: 'var(--txm)' }}>
      <span className="num inline-grid place-items-center w-5 h-5 rounded-full text-[11px]"
        style={{ background: 'var(--accent-wash)', color: 'var(--accent)' }}>{n}</span>
      {de ? de_ : en}
    </p>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-4 sm:p-5"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

      {UMSTIEG_LIVE && (
        <div>
          {stepLabel(1, 'Wie ist deine Kette jetzt?', 'What state is your chain in?')}
          <ServiceChooser service={service} onChange={setService} de={de} />
        </div>
      )}

      <Reveal open={service !== null}>
        <div className={UMSTIEG_LIVE ? 'pt-4' : ''}>
          {stepLabel(UMSTIEG_LIVE ? 2 : 1, 'Wie viele Ketten?', 'How many chains?')}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                aria-label={de ? 'Eine Kette weniger' : 'One chain fewer'}
                className="w-10 h-10 grid place-items-center rounded-full disabled:opacity-30" style={{ color: 'var(--tx1)' }}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="num w-6 text-center text-[15px] font-semibold" style={{ color: 'var(--tx1)' }} aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => Math.min(20, q + 1))}
                aria-label={de ? 'Eine Kette mehr' : 'One chain more'}
                className="w-10 h-10 grid place-items-center rounded-full" style={{ color: 'var(--tx1)' }}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="font-display font-bold leading-none" style={{ fontSize: '1.3rem', color: 'var(--tx1)' }}>{eur(total, de)}</p>
              <p className="num text-[12px] sm:text-[11.5px] mt-1" style={{ color: 'var(--txm)' }}>
                {quantity > 1 && <>{quantity} × {eur(perChain, de)} + </>}
                {eur(shipping, de)} {de ? 'Rückversand' : 'return'}
              </p>
            </div>
          </div>
          <p className="text-[12px] mt-2" style={{ color: isBundle ? 'var(--accent)' : 'var(--txf)' }}>
            {quantity === PRICE.bundleCount && (de ? 'Rotation: eine fährt, eine ist bei uns. ' : 'Rotation: one rides, one is with us. ')}
            {isBundle
              ? (de ? `Mengenpreis aktiv: ${eur(p.bundle, de)} statt ${eur(p.single, de)} je Kette` : `Volume price on: ${eur(p.bundle, de)} instead of ${eur(p.single, de)} per chain`)
              : (de ? `Ab ${PRICE.bundleCount} Ketten nur ${eur(p.bundle, de)} je Kette` : `From ${PRICE.bundleCount} chains only ${eur(p.bundle, de)} per chain`)}
            {service === 'rewax' && (
              <>
                {' · '}
                <a href="#geschenk" className="underline underline-offset-2" style={{ color: 'var(--txm)' }}>
                  {de ? `10er-Karte ${eur(TEN_CARD.price / TEN_CARD.count, de)}` : `10-card ${eur(TEN_CARD.price / TEN_CARD.count, de)}`}
                </a>
              </>
            )}
          </p>

          {!contactOpen && (
            <button type="button" onClick={() => setContactOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {de ? 'Weiter' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </Reveal>

      <Reveal open={contactOpen}>
        <div className="pt-4 mt-4 space-y-3" style={{ borderTop: '1px solid var(--bd2)' }}>
          {stepLabel(UMSTIEG_LIVE ? 3 : 2, 'Wohin sollen wir die Adresse schicken?', 'Where should we send the address?')}
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

// ─── Preise: zwei Angebotskarten ────────────────────────────────────────────
// Vorher eine 13-Zeilen-Matrix mit Arbeitsschritt-Häkchen. Jetzt zwei Karten:
// Auffrischung links, Umstieg rechts (der höhere Preis rahmt den kleineren).
// Ein Mengen-Umschalter rechnet beide live um, inklusive Rotation ab zwei
// Ketten. Am Fuß die zwei häufigsten Einwände, beantwortet: Leise-Garantie
// und das konkrete Rückgabe-Datum. „Anmelden" übergibt Leistung + Menge ans
// Stufenformular im Hero (bookChain).
const QTY_OPTIONS = [1, 2, 3] as const;

export function PriceMatrix({ de }: { de: boolean }) {
  const [qty, setQty] = useState<number>(1);
  // Mobil eine Karte mit Umschalter statt zwei Karten untereinander.
  const [mobileSvc, setMobileSvc] = useState<ServiceId>('rewax');
  const cols: ServiceId[] = UMSTIEG_LIVE ? ['rewax', 'umstieg'] : ['rewax'];
  const isBundle = qty >= PRICE.bundleCount;
  const shipping = qty === 1 ? PRICE.shippingSingle : PRICE.shippingBundle;

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
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Was es kostet.' : 'What it costs.'}
          </h2>
          <p className="text-[14px] mt-2" style={{ color: 'var(--txm)' }}>
            {de ? 'Zwei Leistungen, je nachdem, wie deine Kette ankommt.' : 'Two services, depending on how your chain arrives.'}
          </p>
        </div>
        <div role="radiogroup" aria-label={de ? 'Anzahl Ketten' : 'Number of chains'}
          className="inline-flex rounded-full p-1" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
          {QTY_OPTIONS.map((n) => (
            <button key={n} type="button" role="radio" aria-checked={qty === n} onClick={() => setQty(n)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors"
              style={{ background: qty === n ? 'var(--accent)' : 'transparent', color: qty === n ? '#fff' : 'var(--txm)' }}>
              {n} {de ? (n === 1 ? 'Kette' : 'Ketten') : (n === 1 ? 'chain' : 'chains')}
              {n === PRICE.bundleCount && (
                <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                  style={{ background: qty === n ? 'rgba(255,255,255,0.2)' : 'var(--accent-wash)', color: qty === n ? '#fff' : 'var(--accent)' }}>
                  Rotation
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobil: Umschalter mit beiden Preisen, damit der Anker sichtbar bleibt */}
      {cols.length > 1 && (
        <div role="radiogroup" aria-label={de ? 'Leistung' : 'Service'} className="sm:hidden grid grid-cols-2 gap-2 mb-3">
          {cols.map((c) => {
            const on = mobileSvc === c;
            return (
              <button key={c} type="button" role="radio" aria-checked={on} onClick={() => setMobileSvc(c)}
                className="rounded-xl px-3 py-2 text-left transition-colors"
                style={{ background: on ? 'var(--accent)' : 'var(--sf2)', color: on ? '#fff' : 'var(--tx1)', border: `1px solid ${on ? 'var(--accent)' : 'var(--bd2)'}` }}>
                <span className="flex items-baseline justify-between gap-2 text-[13px] font-semibold">
                  {card[c].t}
                  <span className="num whitespace-nowrap">{eur(isBundle ? PRICE[c].bundle : PRICE[c].single, de)}</span>
                </span>
                <span className="block text-[12px] leading-snug mt-0.5" style={{ opacity: 0.85 }}>{card[c].s}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={`grid gap-4 ${cols.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {cols.map((c) => {
          const { t, s, Icon, points } = card[c];
          const p = PRICE[c];
          const per = isBundle ? p.bundle : p.single;
          return (
            <div key={c} className={`rounded-2xl p-5 sm:p-6 flex-col ${cols.length > 1 && c !== mobileSvc ? 'hidden sm:flex' : 'flex'}`}
              style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
              {/* Mobil steht Name + Zustand schon im Umschalter darüber */}
              <p className={`${cols.length > 1 ? 'hidden sm:flex' : 'flex'} items-center gap-1.5 font-semibold text-[15px]`} style={{ color: 'var(--tx1)' }}>
                <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />{t}
              </p>
              <p className={`${cols.length > 1 ? 'hidden sm:block' : ''} text-[12.5px] mt-0.5`} style={{ color: 'var(--txm)' }}>{s}</p>

              <div className={`flex items-baseline flex-wrap gap-x-2 ${cols.length > 1 ? 'sm:mt-4' : 'mt-4'}`}>
                <span className="font-display font-bold leading-none whitespace-nowrap"
                  style={{ fontSize: 'clamp(1.9rem, 5vw, 2.3rem)', letterSpacing: '-0.02em', color: 'var(--tx1)' }}>
                  {eur(per, de)}
                </span>
                {isBundle && <span className="num text-[13px]" style={{ color: 'var(--txff)' }}>{de ? 'einzeln' : 'singly'} {eur(p.single, de)}</span>}
                <span className="text-[12.5px]" style={{ color: 'var(--txm)' }}>{de ? 'je Kette' : 'per chain'}</span>
              </div>
              <p className="num text-[12.5px] mt-1.5" style={{ color: isBundle ? 'var(--accent)' : 'var(--txf)' }}>
                {isBundle
                  ? (de ? `Du sparst ${eur((p.single - p.bundle) * qty, de)}` : `You save ${eur((p.single - p.bundle) * qty, de)}`)
                  : (de ? `Ab ${PRICE.bundleCount} Ketten ${eur(p.bundle, de)} je Kette` : `From ${PRICE.bundleCount} chains ${eur(p.bundle, de)} each`)}
              </p>

              <ul className="mt-4 space-y-1.5 flex-1">
                {points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: 'var(--tx2)' }}>
                    <Check className="h-3.5 w-3.5 flex-shrink-0 mt-[3px]" style={{ color: 'var(--accent)' }} aria-hidden />{pt}
                  </li>
                ))}
              </ul>

              <dl className="mt-5 pt-4 space-y-1 text-[12.5px]" style={{ borderTop: '1px solid var(--bd2)' }}>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: 'var(--txm)' }}>
                    {qty === 1 ? (de ? 'Mit Rückversand' : 'With return shipping') : (de ? `${qty} Ketten mit Rückversand` : `${qty} chains with return shipping`)}
                  </dt>
                  <dd className="num font-semibold" style={{ color: 'var(--tx1)' }}>{eur(per * qty + shipping, de)}</dd>
                </div>
                {/* Eigener Komplettpreis statt Konkurrenzvergleich (UWG, siehe content.ts). */}
                <div className="flex justify-between gap-3">
                  <dt style={{ color: 'var(--txf)' }}>{de ? 'Mit Porto hin und zurück' : 'With postage both ways'}</dt>
                  <dd className="num" style={{ color: 'var(--txm)' }}>{eur(per * qty + 2 * shipping, de)}</dd>
                </div>
              </dl>

              <button type="button" onClick={() => bookChain(c, qty)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {de ? `${t} anmelden` : `Book ${t.toLowerCase()}`} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Die zwei Einwände, direkt am Preis beantwortet */}
      <div className="mt-4 rounded-2xl px-4 sm:px-5 py-3.5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5"
        style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
        <p className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: 'var(--txm)' }}>
          <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-px" style={{ color: 'var(--accent)' }} aria-hidden />
          <span><strong style={{ color: 'var(--tx1)' }}>{de ? GUARANTEE.short : GUARANTEE.shortEn}:</strong> {de ? GUARANTEE.line : GUARANTEE.lineEn}</span>
        </p>
        <p className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: 'var(--txm)' }}>
          <Clock className="h-4 w-4 flex-shrink-0 mt-px" style={{ color: 'var(--accent)' }} aria-hidden />
          <ReturnWindowLine state={HOME_STATE} de={de} />
        </p>
      </div>

      <p className="text-[12.5px] mt-3" style={{ color: 'var(--txm)' }}>
        {de ? 'Öfter fällig? ' : 'Due often? '}
        <a href="/kette-wachsen-lassen#geschenk" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent)' }}>
          {de ? `Mit der 10er-Karte ${eur(TEN_CARD.price / TEN_CARD.count, de)} je Auffrischung` : `${eur(TEN_CARD.price / TEN_CARD.count, de)} per rewax with the 10-card`}
        </a>
        {de ? ', Rückversand inklusive.' : ', return shipping included.'}
      </p>
      <p className="text-[12px] sm:text-[11.5px] leading-relaxed mt-3" style={{ color: 'var(--txff)' }}>
        {de
          ? `Eine Kette im Großbrief (${eur(PRICE.shippingSingle, de)}), ab zwei Ketten im Maxibrief ${eur(PRICE.shippingBundle, de)} für alle zusammen. Hinversand trägst du. Rückgabe-Datum geschätzt aus Postlaufzeit und Feiertagen. Kleinunternehmer nach § 19 UStG, daher keine Umsatzsteuer ausgewiesen.`
          : `One chain as a letter (${eur(PRICE.shippingSingle, de)}), two or more as a large letter for ${eur(PRICE.shippingBundle, de)} in total. You cover shipping to us. Return date estimated from postal times and public holidays. Small business under § 19 UStG, so no VAT is shown.`}
      </p>
    </div>
  );
}

// ─── So läuft's ab ──────────────────────────────────────────────────────────
// Drei Karten nebeneinander (mobil wischbar), je ein Satz, Fotos flacher (3:2).
// Darunter die Laufzeit als Zeitstrahl. Die Stadt-Chips standen hier und im
// Wetterblock doppelt — sie wohnen jetzt einmal, als Textlinks unter der FAQ.
export function RewaxSteps({ de }: { de: boolean }) {
  const legs = [
    { de: 'Post zu uns', en: 'Post to us', v: de ? '1–2 Werktage' : '1–2 days', grow: 1, strong: false },
    { de: 'Bei uns', en: 'With us', v: de ? TURNAROUND.short : TURNAROUND.shortEn, grow: 2, strong: true },
    { de: 'Post zu dir', en: 'Post to you', v: de ? '1–2 Werktage' : '1–2 days', grow: 1, strong: false },
  ];
  return (
    <section id="ablauf" className="scroll-mt-24 py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Ablauf' : 'How it works'}
        </p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-6"
          style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
          {de ? 'So läuft’s ab.' : 'How it works.'}
        </h2>

        <ol className="-mx-6 px-6 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 sm:pb-0"
          style={{ scrollbarWidth: 'none' }}>
          {STEPS.map(s => (
            <li key={s.n} className="snap-start flex-shrink-0 w-[78%] sm:w-auto">
              <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3 / 2', background: 'var(--sf2)' }}>
                <img src={`${s.img}.webp`}
                  srcSet={`${s.img}-800.webp 800w, ${s.img}.webp 1200w`}
                  sizes="(max-width: 640px) 78vw, 30vw"
                  alt={de ? s.altDe : s.altEn}
                  loading="lazy" decoding="async"
                  className="w-full h-full object-cover" />
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="num font-bold" style={{ color: 'var(--accent)', fontSize: 13 }}>{s.n}</span>
                <h3 className="font-semibold text-[15.5px]" style={{ color: 'var(--tx1)' }}>{de ? s.de : s.en}</h3>
              </div>
              <p className="text-[13.5px] leading-relaxed mt-1" style={{ color: 'var(--txm)' }}>
                {de ? s.bodyDe : s.bodyEn}
              </p>
            </li>
          ))}
        </ol>

        {/* Laufzeit als Zeitstrahl */}
        <div className="mt-8 flex gap-1.5">
          {legs.map(l => (
            <div key={l.de} style={{ flexGrow: l.grow, flexBasis: 0 }}>
              <div className="h-1.5 rounded-full" style={{ background: l.strong ? 'var(--accent)' : 'var(--bd)' }} />
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
function RewaxTrust({ de }: { de: boolean }) {
  // Zwei echte eBay-Bewertungen. j***k nennt genau das Umstieg-Argument
  // ("Ölfrei machen ist zeitaufwändig"); e***n die einwandfrei gewachste
  // Kette. Keine erfundenen Zitate.
  const quotes = ['m8100-selbstwachser', 'm8100-einwandfrei'].map(reviewById).filter((r): r is Review => Boolean(r));

  return (
    <section className="py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Vertrauen' : 'Trust'}
        </p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-6"
          style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
          {de ? 'Warum Leute uns ihre Kette schicken.' : 'Why people mail us their chain.'}
        </h2>

        {/* Luca + Kennzahlen in einer Zeile */}
        <div className="flex flex-wrap items-center gap-x-10 gap-y-5 mb-6">
          <div className="flex items-center gap-3.5">
            <img src="/images/people/luca-stage.webp" alt={de ? 'Luca von Waxcelerate' : 'Luca of Waxcelerate'}
              className="rounded-full object-cover flex-shrink-0" style={{ width: 52, height: 52 }} loading="lazy" />
            <div>
              <p className="font-semibold text-[14px]" style={{ color: 'var(--tx1)' }}>Luca Teichmann</p>
              <p className="text-[12.5px]" style={{ color: 'var(--txm)' }}>
                {de ? 'wächst jede Kette selbst · Stuttgart' : 'waxes every chain himself · Stuttgart'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full sm:w-auto sm:flex sm:gap-10">
          {[
            { v: `${trustStats.sold}+`, l: de ? 'Ketten gewachst, seit 2024' : 'chains waxed, since 2024' },
            { v: `${trustStats.reviews}`, l: de ? 'Bewertungen · 100 % positiv' : 'reviews · 100% positive' },
            { v: de ? TURNAROUND.short : TURNAROUND.shortEn, l: de ? 'Bearbeitung ab Ankunft' : 'processing after arrival' },
          ].map(({ v, l }) => (
            <div key={l}>
              <p className="font-display font-bold leading-none" style={{ fontSize: '1.3rem', color: 'var(--tx1)' }}>{v}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--txm)' }}>{l}</p>
            </div>
          ))}
          </div>
        </div>

        {/* Mobil wischbar wie der Ablauf, ab md nebeneinander */}
        <div className="-mx-6 px-6 md:mx-0 md:px-0 flex md:grid md:grid-cols-2 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0"
          style={{ scrollbarWidth: 'none' }}>
          {quotes.map(r => (
            <figure key={r.name} className="snap-start flex-shrink-0 w-[85%] md:w-auto rounded-2xl p-5"
              style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
              <blockquote className="text-[13.5px] leading-relaxed" style={{ color: 'var(--tx2)' }}>
                „{de ? r.textDe : r.textEn}"
              </blockquote>
              <figcaption className="text-[12px] mt-3" style={{ color: 'var(--txf)' }}>
                {r.name} · {de ? r.dateDe : r.dateEn} · {de ? 'eBay verifiziert' : 'eBay verified'}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="text-[12px] sm:text-[11.5px] leading-relaxed mt-3" style={{ color: 'var(--txff)' }}>
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
  const heroChips = de
    ? ['Nichts vorreinigen', `${TURNAROUND.short} bei uns`, GUARANTEE.short]
    : ['No pre-cleaning', `${TURNAROUND.shortEn} with us`, GUARANTEE.shortEn];
  // Ein kurzes, echtes Service-Zitat direkt unter dem Formular.
  const heroQuote = reviewById('m8100-einwandfrei');
  // FAQ mobil: erst fünf Fragen, der Rest auf Wunsch (bleibt im DOM + JSON-LD).
  const FAQ_MOBILE = 5;
  const [allFaq, setAllFaq] = useState(false);

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
      {/* Das Foto ist die Bühne, nicht eine Kachel neben dem Formular: auf
          Desktop füllt es die rechte Hälfte und läuft per Maske weich in den
          Seitengrund aus, mobil steht es oben und blendet nach unten aus. */}
      <section id="rewax-hero" className="relative overflow-hidden pt-24 sm:pt-32 pb-14 sm:pb-20" style={{ background: 'var(--pg)' }}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-[260px] sm:h-[420px] lg:inset-x-auto lg:right-0 lg:h-full lg:w-[58%]"
          style={{
            WebkitMaskImage: 'var(--rewax-hero-mask)',
            maskImage: 'var(--rewax-hero-mask)',
          }}>
          <img src="/images/rewax/hero.webp"
            srcSet="/images/rewax/hero-800.webp 800w, /images/rewax/hero.webp 1200w"
            sizes="(max-width: 1024px) 100vw, 58vw"
            alt="" fetchPriority="high"
            className="w-full h-full object-cover" style={{ objectPosition: '70% 40%' }} />
        </div>
        <style>{`
          #rewax-hero { --rewax-hero-mask: linear-gradient(to bottom, rgba(0,0,0,.9) 0%, rgba(0,0,0,.55) 55%, transparent 100%); }
          @media (min-width: 1024px) {
            #rewax-hero { --rewax-hero-mask: linear-gradient(to right, transparent 0%, rgba(0,0,0,.85) 30%, #000 60%); }
          }
        `}</style>

        <div className={`${W} relative`}>
          {/* Mobil Bild 260 statt 340 px: Überschrift, Nutzen und Formular-
              Schritt 1 stehen damit im ersten Bildschirm. */}
          <div className="pt-[150px] sm:pt-[260px] lg:pt-0 lg:max-w-[440px]">
            <BackLink de={de} className="hidden lg:inline-flex mb-6" />
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{de ? 'Wachs-Service' : 'Wax service'}</p>
            <h1 className="font-display font-bold leading-[1.02]"
              style={{ color: 'var(--tx1)', fontSize: 'clamp(2.3rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
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
            {/* Mobil eine Textzeile statt drei Pillen über zwei Zeilen */}
            <p className="sm:hidden flex items-center gap-1.5 text-[12.5px] font-medium mt-4 whitespace-nowrap" style={{ color: 'var(--tx2)' }}>
              <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
              {de
                ? `Nichts vorreinigen · ${TURNAROUND.short} · ${GUARANTEE.short}`
                : `No pre-cleaning · ${TURNAROUND.shortEn} · ${GUARANTEE.shortEn}`}
            </p>
            <ul className="hidden sm:flex flex-wrap gap-1.5 mt-5">
              {heroChips.map(c => (
                <li key={c} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
                  style={{ background: 'color-mix(in srgb, var(--sf) 82%, transparent)', border: '1px solid var(--bd2)', color: 'var(--tx2)', backdropFilter: 'blur(6px)' }}>
                  <Check className="h-3 w-3" style={{ color: 'var(--accent)' }} aria-hidden />
                  {c}
                </li>
              ))}
            </ul>

            <div id="rewax-form" className="mt-6 scroll-mt-24">
              <RewaxRequestForm de={de} preselect={waxedLabel ? 'rewax' : null} />
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-3">
                <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
                  ★ {trustStats.reviews} {de ? 'Bewertungen · 100 % positiv' : 'reviews · 100% positive'}
                </p>
                <a href={waLink(de, waxedLabel)} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackRewaxInterest()}
                  className="inline-flex items-center gap-1.5 py-2 -my-2 text-[12.5px] font-semibold" style={{ color: 'var(--tx1)' }}>
                  {de ? 'Lieber per WhatsApp' : 'Prefer WhatsApp'}
                  <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                </a>
              </div>
              {heroQuote && (
                <figure className="mt-4 pl-3" style={{ borderLeft: '2px solid var(--accent)' }}>
                  <blockquote className="text-[13px] leading-snug" style={{ color: 'var(--tx2)' }}>
                    „{de ? heroQuote.textDe : heroQuote.textEn}"
                  </blockquote>
                  <figcaption className="text-[12px] mt-1" style={{ color: 'var(--txf)' }}>
                    {heroQuote.name} · {de ? 'eBay verifiziert' : 'eBay verified'}
                  </figcaption>
                </figure>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Preise ── direkt nach dem Hero: die zweite Frage jedes Besuchers.
          Danach das Orts-Werkzeug, dann erst der Ablauf. */}
      <section id="preise" className="scroll-mt-24 py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <div className="max-w-[880px]">
            <PriceMatrix de={de} />
          </div>
        </div>
      </section>

      <LocalChainTool de={de} />

      <RewaxSteps de={de} />

      <GiftSection de={de} />

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
          {/* Ab lg zwei Spalten: zehn Fragen standen sonst über 1.200 px
              untereinander. Grid statt CSS-Columns, damit eine aufgeklappte
              Antwort nichts in die andere Spalte schiebt. */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
            {faqItems.map((item, i) => (
              <details key={item.q} className={`group py-5 ${i >= FAQ_MOBILE && !allFaq ? 'hidden lg:block' : ''}`}
                style={{ borderBottom: '1px solid var(--bd2)' }}>
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
          {!allFaq && faqItems.length > FAQ_MOBILE && (
            <button type="button" onClick={() => setAllFaq(true)}
              className="lg:hidden mt-4 inline-flex items-center gap-1.5 py-2 text-[13.5px] font-semibold" style={{ color: 'var(--tx1)' }}>
              {de ? `Alle ${faqItems.length} Fragen zeigen` : `Show all ${faqItems.length} questions`}
              <ChevronDown className="h-4 w-4" style={{ color: 'var(--accent)' }} aria-hidden />
            </button>
          )}

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
