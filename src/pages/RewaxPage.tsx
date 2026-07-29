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

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

import { Navigation } from '@/sections/navigation';
import { InstrumentFrame } from '@/components/viz';

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

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// ─── Stamp card ──────────────────────────────────────────────────────────────
// Ten chain-link glyphs in two rows. Not a real punch card, just the shape of
// one, so the offer explains itself before the price is read.
function StampCard({ de }: { de: boolean }) {
  return (
    <div className="rounded-2xl p-7"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>
          {de ? 'Zehnerkarte' : 'Ten-visit card'}
        </p>
        <p className="num-data text-[11px]" style={{ color: 'var(--txff)' }}>10 ×</p>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: TEN_CARD.count }, (_, i) => (
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
      <p className="text-[11.5px] leading-relaxed mt-6 pt-4" style={{ color: 'var(--txff)', borderTop: '1px solid var(--bd2)' }}>
        {de
          ? 'Kein Ablaufdatum, übertragbar. Wir führen die Karte, du musst nichts aufbewahren.'
          : 'No expiry, transferable. We keep the tally, you do not have to keep anything.'}
      </p>
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
          <p className="num-data text-[11px]" style={{ color: 'var(--accent)' }}>{s.n}</p>
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
            <p className="text-[11px] uppercase tracking-[0.16em]"
              style={{ color: p.accent ? 'var(--accent)' : 'var(--txf)' }}>
              {de ? p.titleDe : p.titleEn}
            </p>
            {p.accent && (
              <span className="num-data text-[11px] px-2 py-1 rounded-full"
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

  const title = de
    ? 'Rewax-Service für gewachste Ketten | Waxcelerate'
    : 'Rewax service for waxed chains | Waxcelerate';
  const description = de
    ? 'Gewachste Kette einschicken, frisch gewachst zurückbekommen. 13,95 € je Kette, 9,95 € ab drei Ketten, zuzüglich 1,80 € Rückversand. Handgewachst in Stuttgart.'
    : 'Send in your waxed chain, get it back freshly waxed. 13.95 € per chain, 9.95 € from three chains, plus 1.80 € return shipping. Hand-waxed in Stuttgart.';

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: de ? 'Rewax-Service' : 'Rewax service',
    serviceType: de ? 'Kettenwachs-Service' : 'Chain waxing service',
    provider: { '@type': 'Organization', name: 'Waxcelerate', url: 'https://waxcelerate.de' },
    areaServed: 'DE',
    url: 'https://waxcelerate.de/rewax',
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

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/rewax" />
        <script type="application/ld+json">{schema}</script>
      </Helmet>

      <Navigation />

      {/* ── Hero ── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20" style={{ background: 'var(--pg)' }}>
        <div className={`${W} lg:flex lg:items-center lg:gap-14`}>
          <div className="lg:flex-1">
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Service' : 'Service'}
            </p>
            <h1 className="font-display font-bold leading-[1.05] mb-5"
              style={{ color: 'var(--tx1)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em' }}>
              {de ? 'Rewax. Machen wir.' : 'Rewax. We handle it.'}
            </h1>
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
            <p className="num-data text-[11px] mt-3" style={{ color: 'var(--txff)' }}>
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
                ? 'Das ist der eigentliche Grund für zwei oder drei Ketten. Während eine bei uns im Bad liegt, fährst du die nächste. Es gibt keine Wartezeit, keinen Abend am Topf und keinen Kompromiss, weil gerade keine saubere Kette da ist.'
                : 'This is the real reason for two or three chains. While one is in our bath, you ride the next. No waiting, no evening at the pot, and no compromise because there happens to be no clean chain around.'}
            </p>
            <p className="text-[15px] leading-relaxed max-w-[52ch] mt-4" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Nebenbei verteilt sich der Verschleiß auf drei Ketten statt auf eine, und keine läuft lange im grenzwertigen Bereich. Der teure Teil am Antrieb, Kassette und Kettenblätter, hält dadurch spürbar länger.'
                : 'Wear also spreads across three chains instead of one, and none spends long in the marginal range. The expensive part of the drivetrain, cassette and chainrings, lasts noticeably longer as a result.'}
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

      {/* ── Ten-visit card ──
          Lives here rather than as a fourth product door on the homepage. Four
          doors stop being a choice and become a menu, and a gift is not an
          entry point for a first-time visitor. Next to the price table it is
          simply the sensible next line for someone who has just worked out
          that they will be doing this every few hundred kilometres. */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={`${W} lg:flex lg:gap-14 lg:items-center`}>
          <div className="lg:flex-1">
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Zehnerkarte · auch als Geschenk' : 'Ten-visit card · also as a gift'}
            </p>
            <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-5"
              style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
              {de ? 'Zehn Vorgänge, einmal bezahlt.' : 'Ten treatments, paid once.'}
            </h2>
            <p className="text-[15px] leading-relaxed max-w-[48ch]" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Zehn Rewax-Vorgänge im Voraus, zehn Prozent unter dem Dreierpreis. Du schickst ein, wir streichen ab. Läuft nicht ab, ist übertragbar, und lässt sich verschenken, was bei jemandem mit Rad meistens besser ankommt als das dritte Paar Socken.'
                : 'Ten rewax treatments up front, ten percent below the three-chain price. You send chains in, we tick one off. It does not expire, it is transferable, and it works as a gift, which for anyone with a bike usually beats a third pair of socks.'}
            </p>
            <div className="flex items-baseline gap-4 mt-7">
              <p className="font-display font-bold text-wx-tx1 leading-none"
                style={{ fontSize: '2.6rem', letterSpacing: '-0.02em' }}>
                {eur(TEN_CARD.price, de)}
              </p>
              <p className="num-data text-[13px]" style={{ color: 'var(--txff)' }}>
                {de ? 'statt' : 'instead of'} {eur(TEN_CARD.list, de)}
              </p>
            </div>
            <p className="text-[12.5px] mt-2" style={{ color: 'var(--txf)' }}>
              {de
                ? `${eur(TEN_CARD.price / TEN_CARD.count, de)} je Vorgang, Rückversand je Einsendung ${eur(PRICE.shipping, de)}`
                : `${eur(TEN_CARD.price / TEN_CARD.count, de)} per treatment, ${eur(PRICE.shipping, de)} return shipping per submission`}
            </p>
            <a href={waLink(de)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-7 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {de ? 'Zehnerkarte anfragen' : 'Ask for the ten-visit card'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 lg:mt-0 lg:w-[380px] lg:flex-shrink-0">
            <StampCard de={de} />
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

      {/* ── CTA ── */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <div className="rounded-2xl px-6 py-10 sm:py-12 text-center"
            style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.12)' }}>
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Loslegen' : 'Get started'}
            </p>
            <h2 className="font-display font-bold text-wx-tx1 mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              {de ? 'Schreib kurz, wie viele Ketten kommen.' : 'Tell us how many chains are coming.'}
            </h2>
            <p className="text-[14px] leading-relaxed max-w-[46ch] mx-auto mb-7" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Du bekommst die Versandadresse und eine Einschätzung, wann die Kette zurück ist. In der Regel antworte ich am selben Tag.'
                : 'You get the shipping address and an estimate of when the chain will be back. I usually reply the same day.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href={waLink(de)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {de ? 'Per WhatsApp anmelden' : 'Register via WhatsApp'}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={mailLink(de)} className="text-[13.5px] font-semibold" style={{ color: 'var(--tx1)' }}>
                {de ? 'Lieber per E-Mail' : 'Prefer email'}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className={`${W} py-12 text-center`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
      </footer>
    </div>
  );
}
