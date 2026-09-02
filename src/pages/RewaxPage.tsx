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

import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Gift, User, ChevronDown, Send, Droplets, Bike } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';

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
  shipping: 1.80,
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
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-small uppercase tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
          {label}
        </p>
        {recommended && (
          <span className="num-data px-1.5 py-0.5 rounded-full" style={{ fontSize: 9.5, background: 'var(--sf)', border: '1px solid rgba(var(--accent-rgb),0.20)', color: 'var(--accent)' }}>
            {de ? 'bester Preis' : 'best price'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="relative rounded-md flex items-center justify-center"
            style={{ aspectRatio: '1 / 1', border: '1px dashed rgba(var(--accent-rgb),0.35)', background: 'var(--sf)' }}>
            <WaxcelerateMark className="w-[62%] h-[62%]" />
          </div>
        ))}
      </div>

      <div className="flex items-baseline gap-2 mt-4">
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
      <p className="text-[11px] mt-1 mb-4" style={{ color: 'var(--txf)' }}>
        {de
          ? `${eur(price / count, de)} je Vorgang · kein Ablaufdatum, übertragbar`
          : `${eur(price / count, de)} per treatment · no expiry, transferable`}
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
      accent: false,
    },
    {
      key: 'bundle',
      titleDe: 'Drei Ketten', titleEn: 'Three chains',
      per: PRICE.bundle,
      total: bundleTotal,
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
          <div className="flex items-baseline justify-between gap-2">
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
              {de ? 'Rückversand' : 'Return shipping'} <span style={{ color: 'var(--tx1)' }}>{eur(PRICE.shipping, de)}</span>
            </p>
            <p className="num-data text-[13px] pt-1.5" style={{ color: 'var(--tx1)' }}>
              {de ? 'Gesamt' : 'Total'} <span style={{ color: 'var(--accent)' }}>{eur(p.total + PRICE.shipping, de)}</span>
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
      // Absorbiert den frueheren eigenen "Ablauf"-Sektionskopf mit den drei
      // Foto-Schritten — die Kurzfassung steht jetzt im Hero, die Details hier.
      q: de ? 'Wie läuft das Rewaxen ab?' : 'How does the rewaxing process work?',
      a: de
        ? 'Kette am Quick-Link öffnen, in den Umschlag, einschicken — reinigen musst du vorher nichts. Wir lösen das alte Wachs mit kochendem Wasser, ganz ohne Lösemittel, und wachsen sie danach in einem frischen Bad neu. Zurück kommt sie ausgehärtet, Glieder freigebrochen, trocken verpackt — anbauen, kurz kurbeln, fertig.'
        : 'Open the chain at the quick link, put it in an envelope, send it in — no cleaning needed beforehand. We release the old wax with boiling water, no solvents, then wax it fresh in a clean bath. It comes back cured, links broken free, packed dry — fit it, turn the cranks, ride.',
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
            <h1 className="font-display font-bold leading-[1.05] mb-4"
              style={{ color: 'var(--tx1)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em' }}>
              {de ? 'Fahrradkette wachsen lassen.' : 'Get your chain rewaxed.'}
            </h1>
            <p className="text-lead max-w-[46ch]" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Wachsen kostet einen Abend, einen Topf und Platz. Schick uns die Kette — du bekommst sie fahrbereit zurück.'
                : 'Waxing costs an evening, a pot and space. Send us the chain — you get it back ready to ride.'}
            </p>
            {waxedLabel && (
              <p className="text-[14px] font-semibold mt-5" style={{ color: 'var(--accent-soft)' }}>
                {de
                  ? `Deine Karte: gewachst am ${waxedLabel}. Trocken klingt → jetzt einschicken.`
                  : `Your card: waxed ${waxedLabel}. Sounds dry → send it in.`}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a href={waLink(de, waxedLabel)} target="_blank" rel="noopener noreferrer"
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

        {/* Kompakter Ablauf-Streifen, kein eigener Sektionskopf: das
            "ist nur ein Umschlag"-Argument soll sofort sichtbar sein, nicht
            erst im eingeklappten FAQ. Details stehen dort trotzdem, für wer
            sie will. */}
        <div className={`${W} mt-12 pt-10 grid sm:grid-cols-3 gap-6`} style={{ borderTop: '1px solid var(--bd2)' }}>
          {([
            { n: '1', Icon: Send, de: 'Einschicken', en: 'Send it', bodyDe: 'Am Quick-Link raus, in den Umschlag.', bodyEn: 'Off at the quick link, into an envelope.' },
            { n: '2', Icon: Droplets, de: 'Waschen & Wachsen', en: 'Wash & wax', bodyDe: 'Kochendes Wasser statt Lösemittel, frisches Bad.', bodyEn: 'Boiling water, no solvents, fresh bath.' },
            { n: '3', Icon: Bike, de: 'Zurück aufs Rad', en: 'Back on the bike', bodyDe: 'Ausgehärtet, anbauen, kurbeln, los.', bodyEn: 'Cured, fit it, turn the cranks, ride.' },
          ] as const).map(s => (
            <div key={s.n}>
              <span className="flex-shrink-0 rounded-full flex items-center justify-center mb-3"
                style={{ width: 36, height: 36, background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}>
                <s.Icon className="h-4 w-4" style={{ color: 'var(--accent)' }} aria-hidden />
              </span>
              <p className="font-semibold text-[14px]" style={{ color: 'var(--tx1)' }}>{de ? s.de : s.en}</p>
              <p className="text-[13.5px] leading-snug mt-1" style={{ color: 'var(--txm)' }}>
                {de ? s.bodyDe : s.bodyEn}
              </p>
            </div>
          ))}
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

          {/* ── Vorausbezahlte Karten ──
              Steht jetzt IN der Preis-Sektion statt in einer eigenen darunter.
              Es ist dieselbe Frage ("was kostet das") in einer zweiten
              Variante, und zwei eigene Sektionsköpfe für eine Frage sind genau
              die Zerstückelung, die die Seite lang und unübersichtlich
              gemacht hat. Als Untertitel hinter einer Haarlinie liest es sich
              als das, was es ist: eine Option, kein neues Thema.

              Lebt hier statt als vierte Produkttür auf der Startseite — vier
              Türen sind keine Wahl mehr, sondern ein Menü, und ein Geschenk
              ist kein Einstieg für einen Erstbesucher.

              Zwei Größen (fünf/zehn) plus ein Für-mich/Geschenk-Umschalter:
              "auch als Geschenk" ist kein Abzeichen auf der Karte, sondern
              ändert die Bestellnachricht direkt mit. */}
          <div className="mt-12 pt-10" style={{ borderTop: '1px solid var(--bd2)' }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-small uppercase tracking-[0.16em]" style={{ color: 'var(--txf)' }}>
                {de ? 'Mehrere Vorgänge, einmal bezahlt.' : 'Several treatments, paid once.'}
              </p>

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

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl">
              <StampCard de={de} count={FIVE_CARD.count} price={FIVE_CARD.price} list={FIVE_CARD.list} gift={isGift} />
              <StampCard de={de} count={TEN_CARD.count} price={TEN_CARD.price} list={TEN_CARD.list} gift={isGift} recommended />
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

      <Footer />
    </div>
  );
}
