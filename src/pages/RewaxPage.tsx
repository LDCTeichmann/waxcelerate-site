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

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Gift, User, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

import { Navigation } from '@/sections/navigation';
import { InstrumentFrame } from '@/components/viz';
import { BackLink } from '@/components/BackLink';

// One tap, no form, no scrolling to a contact section that may or may not be
// reachable from a route. The previous CTA pointed at /#kontakt and did not
// land, which for the only recurring-revenue page on the site is the worst
// possible place for a dead button.
const WA_NUMBER = '4915751957470';
const waLink = (de: boolean) =>
  `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(de
    ? 'Hi Luca, ich möchte Ketten zum Rewaxen einschicken. Anzahl: '
    : 'Hi Luca, I would like to send in chains for rewaxing. Number of chains: ');
const mailLink = (de: boolean) =>
  'mailto:waxcelerate@gmail.com?subject=' + encodeURIComponent(de ? 'Rewax-Service' : 'Rewax service')
  + '&body=' + encodeURIComponent(de
    ? 'Hallo Luca,\n\nich möchte folgende Anzahl Ketten zum Rewaxen einschicken: \n\nViele Grüße\n'
    : 'Hi Luca,\n\nI would like to send in the following number of chains for rewaxing: \n\nBest regards\n');

const W = 'mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14';

const PRICE = {
  single: 13.95,
  bundle: 9.95,
  bundleCount: 3,
  shipping: 1.80,
};

// Ten treatments at the three-chain rate, less ten percent. Written as a
// derivation rather than a typed-in number so the two can never drift apart.
const TEN_CARD = {
  count: 10,
  get list() { return PRICE.bundle * this.count; },
  get price() { return Math.round(this.list * 0.9 * 100) / 100; },
};

// Five treatments, half the ten-card's discount — a smaller commitment for
// anyone not ready to prepay ten. Discount rate is a judgment call (not
// something Luca specified), same derivation pattern as TEN_CARD: flag for
// his sign-off before treating it as final.
const FIVE_CARD = {
  count: 5,
  get list() { return PRICE.bundle * this.count; },
  get price() { return Math.round(this.list * 0.95 * 100) / 100; },
};

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// ─── Stamp card ──────────────────────────────────────────────────────────────
// Chain-link glyphs, one row of five or two of five. Not a real punch card,
// just the shape of one, so the offer explains itself before the price is
// read. Parameterized over count/price/list so the same card serves both the
// five- and ten-visit tiers instead of two near-duplicate components.
function StampCard({ de, count, price, list, gift, recommended }: {
  de: boolean; count: number; price: number; list: number; gift: boolean; recommended?: boolean;
}) {
  const label = de ? `${count}er-Karte` : `${count}-visit card`;
  const waMsg = gift
    ? (de
      ? `Hi Luca, ich möchte die ${label} als Geschenk bestellen. Name der beschenkten Person: `
      : `Hi Luca, I would like to order the ${label} as a gift. Recipient's name: `)
    : (de
      ? `Hi Luca, ich möchte die ${label} bestellen.`
      : `Hi Luca, I would like to order the ${label}.`);

  return (
    <div className="rounded-2xl p-6 sm:p-7 flex flex-col h-full"
      style={{
        background: recommended ? 'var(--accent-wash-sm)' : 'var(--sf)',
        border: recommended ? '1px solid rgba(var(--accent-rgb),0.22)' : '1px solid var(--bd)',
        boxShadow: 'var(--card-shad)',
      }}>
      <div className="flex items-baseline justify-between mb-5">
        <p className="text-small uppercase tracking-[0.18em]" style={{ color: recommended ? 'var(--accent)' : 'var(--txf)' }}>
          {label}
        </p>
        {recommended && (
          <span className="num-data text-meta px-2 py-1 rounded-full"
            style={{ background: 'var(--sf)', border: '1px solid rgba(var(--accent-rgb),0.20)', color: 'var(--accent)' }}>
            {de ? 'bester Preis' : 'best price'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="relative rounded-lg flex items-center justify-center"
            style={{ aspectRatio: '1 / 1', border: '1px dashed var(--bd)', background: 'var(--sf2)' }}>
            <svg viewBox="0 0 40 20" className="w-[68%]" aria-hidden>
              <rect x="2" y="4" width="22" height="12" rx="6" fill="none" stroke="var(--bd)"
                style={{ strokeWidth: 'var(--dw-hair)' }} />
              <rect x="16" y="4" width="22" height="12" rx="6" fill="none" stroke="var(--bd)"
                style={{ strokeWidth: 'var(--dw-hair)' }} />
              <circle cx="8" cy="10" r="2.4" fill="var(--bd)" />
              <circle cx="32" cy="10" r="2.4" fill="var(--bd)" />
            </svg>
          </div>
        ))}
      </div>

      <div className="flex items-baseline gap-3 mt-6">
        <p className="font-display font-bold text-wx-tx1 leading-none" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
          {eur(price, de)}
        </p>
        <p className="num-data text-[12.5px] line-through" style={{ color: 'var(--txff)' }}>
          {eur(list, de)}
        </p>
      </div>
      <p className="text-[12.5px] mt-1.5 mb-5" style={{ color: 'var(--txf)' }}>
        {de
          ? `${eur(price / count, de)} je Vorgang · kein Ablaufdatum, übertragbar`
          : `${eur(price / count, de)} per treatment · no expiry, transferable`}
      </p>

      <div className="flex-1" />

      <a href={`https://wa.me/4915751957470?text=${encodeURIComponent(waMsg)}`}
        target="_blank" rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent)', color: '#fff' }}>
        {gift ? (de ? 'Als Geschenk anfragen' : 'Request as a gift') : (de ? 'Karte anfragen' : 'Request this card')}
        {gift ? <Gift className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </a>
    </div>
  );
}

// ─── Steps ───────────────────────────────────────────────────────────────────
function Steps({ de }: { de: boolean }) {
  const steps = [
    {
      n: '01',
      de: 'Du schickst die Kette', en: 'You send the chain',
      bodyDe: 'Kette am Quick-Link öffnen, in einen Umschlag, fertig. Kein Reinigen nötig, den Teil machen wir.',
      bodyEn: 'Open the chain at the quick link, put it in an envelope, done. No cleaning needed, that part is ours.',
      img: '/images/rewax/step-1',
    },
    {
      n: '02',
      de: 'Wir waschen und wachsen', en: 'We wash and wax',
      bodyDe: 'Kochendes Wasser über ein Sieb löst altes Wachs samt eingelagertem Grit, ganz ohne Lösemittel. Danach 10 bis 15 Minuten ins frische Bad bei 85 bis 90 Grad.',
      bodyEn: 'Boiling water over a sieve releases the old wax together with the embedded grit, no solvents involved. Then 10 to 15 minutes in a fresh bath at 85 to 90 degrees.',
      img: '/images/rewax/step-2',
    },
    {
      n: '03',
      de: 'Du bekommst sie fahrbereit zurück', en: 'You get it back ready to ride',
      bodyDe: 'Ausgehärtet, Glieder freigebrochen, trocken verpackt. Anbauen, kurz kurbeln, los.',
      bodyEn: 'Cured, links broken free, packed dry. Fit it, turn the cranks once, ride.',
      img: '/images/rewax/step-3',
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
      {steps.map(s => (
        <div key={s.n}>
          <div className="rounded-xl overflow-hidden mb-5" style={{ aspectRatio: '4 / 3', background: 'var(--sf2)' }}>
            <img src={`${s.img}.webp`} srcSet={`${s.img}-800.webp 800w, ${s.img}.webp 1200w`}
              sizes="(max-width: 640px) 92vw, 33vw"
              alt="" aria-hidden loading="lazy" decoding="async"
              className="w-full h-full object-cover" />
          </div>
          <p className="num-data text-meta" style={{ color: 'var(--accent)' }}>{s.n}</p>
          <h3 className="font-display font-bold text-wx-tx1 mt-2 leading-tight" style={{ fontSize: '1.25rem' }}>
            {de ? s.de : s.en}
          </h3>
          <p className="text-[14px] leading-relaxed mt-2.5" style={{ color: 'var(--txm)' }}>
            {de ? s.bodyDe : s.bodyEn}
          </p>
        </div>
      ))}
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
      noteDe: 'Für ein Rad, ein Termin.',
      noteEn: 'One bike, one appointment.',
      accent: false,
    },
    {
      key: 'bundle',
      titleDe: 'Drei Ketten', titleEn: 'Three chains',
      per: PRICE.bundle,
      total: bundleTotal,
      noteDe: 'Die Rotation. Eine fährt, eine ist Reserve, eine ist bei uns.',
      noteEn: 'The rotation. One rides, one is spare, one is with us.',
      accent: true,
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {plans.map(p => (
        <div key={p.key} className="rounded-2xl p-6 sm:p-7"
          style={{
            background: p.accent ? 'var(--accent-wash-sm)' : 'var(--sf)',
            border: p.accent ? '1px solid rgba(var(--accent-rgb),0.22)' : '1px solid var(--bd)',
          }}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-small uppercase tracking-[0.16em]"
              style={{ color: p.accent ? 'var(--accent)' : 'var(--txf)' }}>
              {de ? p.titleDe : p.titleEn}
            </p>
            {p.accent && (
              <span className="num-data text-meta px-2 py-1 rounded-full"
                style={{ background: 'var(--sf)', border: '1px solid rgba(var(--accent-rgb),0.20)', color: 'var(--accent)' }}>
                {de ? 'empfohlen' : 'recommended'}
              </span>
            )}
          </div>

          <p className="font-display font-bold text-wx-tx1 mt-4 leading-none" style={{ fontSize: '2.4rem', letterSpacing: '-0.02em' }}>
            {eur(p.per, de)}
          </p>
          <p className="text-[13px] mt-2" style={{ color: 'var(--txm)' }}>
            {de ? 'pro Kette' : 'per chain'}
          </p>

          <div className="mt-5 pt-4 space-y-1.5" style={{ borderTop: '1px solid var(--bd2)' }}>
            <p className="num-data text-[12.5px]" style={{ color: 'var(--txm)' }}>
              {de ? 'Wachsen' : 'Waxing'} <span style={{ color: 'var(--tx1)' }}>{eur(p.total, de)}</span>
            </p>
            <p className="num-data text-[12.5px]" style={{ color: 'var(--txm)' }}>
              {de ? 'Rückversand' : 'Return shipping'} <span style={{ color: 'var(--tx1)' }}>{eur(PRICE.shipping, de)}</span>
            </p>
            <p className="num-data text-[13.5px] pt-1.5" style={{ color: 'var(--tx1)' }}>
              {de ? 'Gesamt' : 'Total'} <span style={{ color: 'var(--accent)' }}>{eur(p.total + PRICE.shipping, de)}</span>
            </p>
          </div>

          <p className="text-[13px] leading-relaxed mt-4" style={{ color: 'var(--txm)' }}>
            {de ? p.noteDe : p.noteEn}
          </p>
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
    ? 'Gewachste Kette einschicken, frisch gewachst zurückbekommen. 13,95 € je Kette, 9,95 € ab drei Ketten, zuzüglich 1,80 € Rückversand. Handgewachst in Stuttgart.'
    : 'Send in your waxed chain, get it back freshly waxed. 13.95 € per chain, 9.95 € from three chains, plus 1.80 € return shipping. Hand-waxed in Stuttgart.';

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

  const yes = [
    de ? 'Ketten, die schon gewachst sind, egal von wem' : 'Chains that are already waxed, whoever waxed them',
    de ? 'Unsere vorgewachsten Ketten' : 'Our own pre-waxed chains',
    de ? 'Alle gängigen 9 bis 12 fach Ketten' : 'All common 9 to 12 speed chains',
  ];
  const no = [
    de ? 'Geölte Ketten entfetten und erstmalig wachsen' : 'Degreasing an oiled chain and waxing it for the first time',
    de ? 'Ketten mit Flüssigwachs-Resten aus dem Ölbetrieb' : 'Chains carrying drip-wax residue from oil use',
  ];

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
  const faqItems = [
    {
      q: de ? 'Was kostet es, eine Fahrradkette wachsen zu lassen?' : 'How much does it cost to get a chain rewaxed?',
      a: de
        ? `${eur(PRICE.single, de)} für eine einzelne Kette, zuzüglich ${eur(PRICE.shipping, de)} Rückversand.`
        : `${eur(PRICE.single, de)} for a single chain, plus ${eur(PRICE.shipping, de)} return shipping.`,
    },
    {
      q: de ? 'Was kostet es, mehrere Fahrradketten wachsen zu lassen?' : 'How much does it cost to get several chains rewaxed?',
      a: de
        ? `Ab drei Ketten sinkt der Preis auf ${eur(PRICE.bundle, de)} pro Kette. Der Rückversand (${eur(PRICE.shipping, de)}) fällt dabei nur einmal an, egal wie viele Ketten im selben Umschlag sind.`
        : `From three chains the price drops to ${eur(PRICE.bundle, de)} per chain. Return shipping (${eur(PRICE.shipping, de)}) is charged only once, no matter how many chains are in the same envelope.`,
    },
    {
      q: de ? 'Wo kann ich meine Fahrradkette wachsen lassen?' : 'Where can I get my bicycle chain waxed?',
      a: de
        ? 'Bei uns in Stuttgart — du musst aber nicht vor Ort sein. Du schickst die Kette per Post ein, wir wachsen sie von Hand und schicken sie zurück. Das funktioniert deutschlandweit.'
        : "With us in Stuttgart — but you don't need to be local. You send the chain by mail, we hand-wax it and send it back. This works nationwide within Germany.",
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
      <main>
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
            <p className="text-[15px] font-semibold mb-5" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Rewax. Machen wir.' : 'Rewax. We handle it.'}
            </p>
            <p className="text-lead max-w-[46ch]" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Wachsen ist einfach, aber es kostet einen Abend, einen Topf und Platz. Wenn du das nicht selbst machen willst, schick die Kette. Du bekommst sie fahrbereit zurück.'
                : 'Waxing is simple, but it costs an evening, a pot and space. If you would rather not do it yourself, send the chain in. You get it back ready to ride.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a href={waLink(de)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {de ? 'Per WhatsApp anmelden' : 'Register via WhatsApp'}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#preise" className="text-[13.5px] font-semibold" style={{ color: 'var(--tx1)' }}>
                {de ? 'Was kostet das?' : 'What does it cost?'}
              </a>
            </div>
          </div>

          <div className="mt-10 lg:mt-0 lg:flex-1">
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

      {/* ── Steps ── */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--sf)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Ablauf' : 'How it works'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-10"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Drei Schritte, ein Umschlag.' : 'Three steps, one envelope.'}
          </h2>
          <Steps de={de} />
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="preise" className="scroll-mt-24 py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Preise' : 'Pricing'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-3"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Ehrlich gerechnet.' : 'Honestly costed.'}
          </h2>
          <p className="text-wx-txm text-lead max-w-[52ch] mb-8">
            {de
              ? 'Der Rückversand kommt einmal dazu, egal wie viele Ketten im Umschlag liegen. Deshalb rechnet sich die Rotation doppelt.'
              : 'Return shipping is charged once, no matter how many chains are in the envelope. Which is why the rotation pays off twice.'}
          </p>

          <Pricing de={de} />

          <p className="text-[13px] leading-relaxed max-w-[62ch] mt-6" style={{ color: 'var(--txff)' }}>
            {de
              ? 'Hinversand trägst du, Rückversand ist oben eingerechnet. Wir arbeiten als Kleinunternehmer nach § 19 UStG, es wird keine Umsatzsteuer ausgewiesen.'
              : 'You cover the shipping to us, return shipping is included above. We operate under the German small business rule, so no VAT is shown.'}
          </p>
        </div>
      </section>

      {/* ── Why rotation ── */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--sf)' }}>
        <div className={`${W} lg:flex lg:gap-14 lg:items-start`}>
          <div className="lg:flex-1">
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Warum drei' : 'Why three'}
            </p>
            <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-5"
              style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
              {de ? 'Eine fährt immer.' : 'One is always on the bike.'}
            </h2>
            <p className="text-[15px] leading-relaxed max-w-[52ch]" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Während eine Kette bei uns im Bad liegt, fährst du die nächste — keine Wartezeit, kein Abend am Topf. Nebeneffekt: Der Verschleiß verteilt sich auf drei Ketten statt auf eine, also hält die teure Kassette spürbar länger.'
                : 'While one chain is in our bath, you ride the next — no waiting, no evening at the pot. Side effect: wear spreads across three chains instead of one, so the expensive cassette lasts noticeably longer.'}
            </p>
          </div>

          <div className="mt-8 lg:mt-0 lg:w-[360px] lg:flex-shrink-0">
            <InstrumentFrame eyebrow={de ? 'Intervalle' : 'Intervals'} chip={de ? 'Richtwerte' : 'guide values'}>
              <div style={{ borderTop: '1px solid var(--bd2)' }}>
                {[
                  { k: de ? 'Trocken, Asphalt' : 'Dry, tarmac', v: '400–550 km' },
                  { k: de ? 'Nässe, MTB, gemischt' : 'Wet, MTB, mixed', v: '200–300 km' },
                  { k: de ? 'Winter, Dauerregen' : 'Winter, constant rain', v: de ? 'unter 200 km' : 'under 200 km' },
                ].map(r => (
                  <div key={r.k} className="flex justify-between items-baseline gap-4 py-3"
                    style={{ borderBottom: '1px solid var(--bd2)' }}>
                    <span className="text-[13.5px]" style={{ color: 'var(--tx2)' }}>{r.k}</span>
                    <span className="num-data text-[13px] whitespace-nowrap" style={{ color: 'var(--accent)' }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] leading-relaxed mt-3" style={{ color: 'var(--txff)' }}>
                {de
                  ? 'Das zuverlässigste Signal ist das Ohr. Wird die Kette lauter und trockener, ist sie fällig.'
                  : 'The most reliable signal is your ear. When the chain gets louder and drier, it is due.'}
              </p>
            </InstrumentFrame>
          </div>
        </div>
      </section>

      {/* ── Prepaid cards ──
          Lives here rather than as a fourth product door on the homepage. Four
          doors stop being a choice and become a menu, and a gift is not an
          entry point for a first-time visitor. Next to the price table it is
          simply the sensible next line for someone who has just worked out
          that they will be doing this every few hundred kilometres.
          Two sizes (five/ten) instead of one, plus an explicit for-me/gift
          toggle: previously "also as a gift" was a badge on the card, which
          only tells the giver it's *possible* — it didn't change the actual
          order message, so Luca still had to ask who it was for every time. */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Vorausbezahlt' : 'Prepaid'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-5"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Mehrere Vorgänge, einmal bezahlt.' : 'Several treatments, paid once.'}
          </h2>

          {/* For-me / gift toggle — shared by both cards below, changes only
              the WhatsApp message each card's button sends. */}
          <div className="inline-flex rounded-full p-1 mb-8" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
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

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <StampCard de={de} count={FIVE_CARD.count} price={FIVE_CARD.price} list={FIVE_CARD.list} gift={isGift} />
            <StampCard de={de} count={TEN_CARD.count} price={TEN_CARD.price} list={TEN_CARD.list} gift={isGift} recommended />
          </div>
        </div>
      </section>

      {/* ── Umfang ──
          Stand frueher direkt nach dem Hero und war damit das Erste nach der
          Ueberschrift: eine Wand aus "machen wir nicht", bevor ueberhaupt klar
          war, was es kostet und wie es laeuft. Ehrlichkeit muss nicht an den
          Anfang, sie muss vor die Entscheidung. Hier, kurz vor dem Knopf,
          qualifiziert sie statt zu bremsen. */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Was wir machen und was nicht' : 'What we do and what we do not'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-8"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Nur schon gewachste Ketten.' : 'Already waxed chains only.'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <InstrumentFrame eyebrow={de ? 'Machen wir' : 'We do'}>
              <ul className="space-y-3 py-1">
                {yes.map(t => (
                  <li key={t} className="flex gap-3 text-[14px] leading-relaxed" style={{ color: 'var(--tx2)' }}>
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </InstrumentFrame>

            <InstrumentFrame eyebrow={de ? 'Machen wir nicht' : 'We do not'}>
              <ul className="space-y-3 py-1">
                {no.map(t => (
                  <li key={t} className="flex gap-3 text-[14px] leading-relaxed" style={{ color: 'var(--tx2)' }}>
                    <X className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--txf)' }} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </InstrumentFrame>
          </div>

          <p className="text-[14px] leading-relaxed max-w-[62ch] mt-6" style={{ color: 'var(--txm)' }}>
            {de
              ? 'Der Grund ist nicht Bequemlichkeit. Öl schwimmt im Wachsbad oben auf und blockiert, dass das Wachs überhaupt in die Gelenke kommt. Eine einzige ölige Kette macht ein ganzes Bad unbrauchbar, und dann sind alle Ketten dieser Charge schlechter gewachst als vorher. Deshalb machen wir den Umstieg von Öl nicht als Service. Wie du ihn selbst machst, steht Schritt für Schritt in den Anleitungen.'
              : 'The reason is not convenience. Oil floats on top of a wax bath and blocks the wax from reaching the joints at all. A single oily chain ruins an entire batch, and every chain in it comes out worse than it went in. So we do not offer the switch from oil as a service. How to do it yourself is in the guides, step by step.'}
          </p>
          <Link to="/#anleitungen" className="inline-flex items-center gap-2 mt-4 text-[13.5px] font-semibold"
            style={{ color: 'var(--tx1)' }}>
            {de ? 'Zur Anleitung für den Umstieg' : 'To the switching guide'}
            <ArrowRight className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          </Link>
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
      <section className="relative overflow-hidden" style={{ minHeight: 460, background: 'var(--hero-stage)' }}>
        <img src="/images/rewax/hero.webp"
          srcSet="/images/rewax/hero-800.webp 800w, /images/rewax/hero.webp 1200w"
          sizes="100vw" alt="" aria-hidden loading="lazy" decoding="async"
          className="absolute inset-0 w-full h-full object-cover" />
        <div aria-hidden className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.52) 46%, rgba(0,0,0,0.16) 100%)' }} />

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

            <a href={waLink(de)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 rounded-full px-7 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#fff', color: '#101013' }}>
              {de ? 'Ketten anmelden' : 'Register chains'}
              <ArrowRight className="h-4 w-4" />
            </a>

            <p className="text-[12.5px] mt-5" style={{ color: 'rgba(255,255,255,0.62)' }}>
              {de ? 'Kein Formular. Kein Konto. ' : 'No form. No account. '}
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
    </div>
  );
}
