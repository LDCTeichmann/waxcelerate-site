// ─── /starter-set — the set, and the two parts nobody thinks about ───────────
//
// The set exists because the first waxing is where people give up: they order
// wax, then discover they also need a way to open the chain and something to
// hang it on, and the evening ends with a chain in a pot and no hook.
//
// So the page is built around completeness rather than saving. The discount is
// shown as a derivation from real single prices, never as a headline number.
// A permanent percentage badge on a premium product reads as a price with a
// guilty conscience; the same ten percent, shown as arithmetic, reads as
// sensible bundling.
//
// Prices per Luca 2026-07-28: set is ten percent below the sum of its parts.
// Accessories sold separately: three hanging wires 5 € plus 1,80 € shipping,
// quick-link pliers 5 €.

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { products } from '@/lib/data';

const W = 'mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14';

const ACCESSORY = { wire3: 5.0, pliers: 5.0, shipping: 1.8 };
const SET_DISCOUNT = 0.10;

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// The example set is priced off the real catalogue, so it can never drift away
// from the products it is made of.
const priceOf = (id: string) => products.find(p => p.id === id)?.price ?? 0;

export function StarterSetPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const parts = [
    {
      key: 'wax',
      nameDe: 'Kettenwachs Classic, 500 g', nameEn: 'Chain wax Classic, 500 g',
      noteDe: '15 bis 20 Wachsvorgänge aus einem Block', noteEn: '15 to 20 waxing cycles from one block',
      price: priceOf('wax-500'),
    },
    {
      key: 'chain',
      nameDe: 'Vorgewachste Kette, 11 fach', nameEn: 'Pre-waxed chain, 11 speed',
      noteDe: 'Fahrbereit, Quick-Link liegt bei', noteEn: 'Ready to ride, quick link included',
      price: priceOf('chain-ybn11'),
    },
    {
      key: 'pliers',
      nameDe: 'Quick-Link-Zange', nameEn: 'Quick-link pliers',
      noteDe: 'Öffnet und schließt den Verschluss ohne Fluchen', noteEn: 'Opens and closes the link without swearing',
      price: ACCESSORY.pliers,
    },
    {
      key: 'wire',
      nameDe: 'Aufhängedraht, 3 Stück', nameEn: 'Hanging wire, 3 pieces',
      noteDe: 'Zum Eintauchen und zum Abtropfen', noteEn: 'For dipping and for drip-off',
      price: ACCESSORY.wire3,
    },
  ];

  const sum = parts.reduce((a, p) => a + p.price, 0);
  const setPrice = Math.round(sum * (1 - SET_DISCOUNT) * 100) / 100;
  const saved = Math.round((sum - setPrice) * 100) / 100;

  const title = de
    ? 'Starter-Set Kettenwachs | Waxcelerate'
    : 'Chain wax starter set | Waxcelerate';
  const description = de
    ? `Wachs, vorgewachste Kette, Quick-Link-Zange und Aufhängedraht in einem Set, ${SET_DISCOUNT * 100} Prozent unter der Summe der Einzelteile. Alles, was für das erste Wachsen nötig ist.`
    : `Wax, pre-waxed chain, quick-link pliers and hanging wire in one set, ${SET_DISCOUNT * 100} percent below the sum of the parts. Everything the first waxing needs.`;

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/starter-set" />
      </Helmet>

      <Navigation />

      {/* ── Hero ── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20" style={{ background: 'var(--pg)' }}>
        <div className={`${W} lg:flex lg:items-center lg:gap-14`}>
          <div className="lg:flex-1">
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Starter-Set' : 'Starter set'}
            </p>
            <h1 className="font-display font-bold leading-[1.05] mb-5"
              style={{ color: 'var(--tx1)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em' }}>
              {de ? 'Alles da, beim ersten Mal.' : 'Everything there, first time.'}
            </h1>
            <p className="text-lead max-w-[46ch]" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Am ersten Wachsabend scheitert es selten am Wachs. Es scheitert daran, dass die Kette nicht aufgeht oder nichts da ist, woran sie hängen kann. Im Set liegt beides dabei.'
                : 'The first waxing evening rarely fails because of the wax. It fails because the chain will not open, or because there is nothing to hang it on. Both are in the set.'}
            </p>

            <div className="flex flex-wrap items-baseline gap-4 mt-8">
              <p className="font-display font-bold text-wx-tx1 leading-none"
                style={{ fontSize: '2.8rem', letterSpacing: '-0.02em' }}>
                {eur(setPrice, de)}
              </p>
              <p className="num-data text-[13px]" style={{ color: 'var(--txff)' }}>
                {de ? 'einzeln' : 'separately'} {eur(sum, de)}
              </p>
            </div>

            <Link to="/#produkte"
              className="inline-flex items-center gap-2 mt-7 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {de ? 'Set zusammenstellen' : 'Configure the set'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 lg:mt-0 lg:flex-1">
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '4 / 5', background: 'var(--hero-stage)' }}>
              <img src="/images/doors/starter-set.webp"
                srcSet="/images/doors/starter-set-800.webp 800w, /images/doors/starter-set.webp 1200w"
                sizes="(max-width: 1024px) 92vw, 46vw"
                alt={de ? 'Wachsblock mit Quick-Link-Zange und Kette' : 'Wax block with quick-link pliers and chain'}
                className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── What is in it ── */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--sf)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Was drin ist' : 'What is in it'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-10"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Vier Teile, kein Zubehörkatalog.' : 'Four parts, not an accessory catalogue.'}
          </h2>

          <div style={{ borderTop: '1px solid var(--bd2)' }}>
            {parts.map(p => (
              <div key={p.key} className="flex items-start gap-4 py-5"
                style={{ borderBottom: '1px solid var(--bd2)' }}>
                <Check className="h-4 w-4 flex-shrink-0 mt-1" style={{ color: 'var(--accent)' }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] text-wx-tx1">{de ? p.nameDe : p.nameEn}</p>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--txm)' }}>{de ? p.noteDe : p.noteEn}</p>
                </div>
                <p className="num-data text-[13.5px] whitespace-nowrap" style={{ color: 'var(--txf)' }}>
                  {eur(p.price, de)}
                </p>
              </div>
            ))}

            <div className="flex items-baseline justify-between gap-4 py-4"
              style={{ borderBottom: '1px solid var(--bd2)' }}>
              <p className="text-[14px]" style={{ color: 'var(--txm)' }}>
                {de ? 'Summe der Einzelteile' : 'Sum of the parts'}
              </p>
              <p className="num-data text-[14px]" style={{ color: 'var(--txm)' }}>{eur(sum, de)}</p>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-4"
              style={{ borderBottom: '1px solid var(--bd2)' }}>
              <p className="text-[14px]" style={{ color: 'var(--txm)' }}>
                {de ? 'Als Set, zehn Prozent weniger' : 'As a set, ten percent less'}
              </p>
              <p className="num-data text-[14px]" style={{ color: 'var(--accent)' }}>&minus; {eur(saved, de)}</p>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-5">
              <p className="text-[15px] text-wx-tx1">{de ? 'Set' : 'Set'}</p>
              <p className="font-display font-bold text-wx-tx1" style={{ fontSize: '1.7rem', letterSpacing: '-0.02em' }}>
                {eur(setPrice, de)}
              </p>
            </div>
          </div>

          <p className="text-[13px] leading-relaxed max-w-[58ch] mt-6" style={{ color: 'var(--txff)' }}>
            {de
              ? 'Das Beispiel zeigt Classic 500 g mit einer 11 fach Kette. Wachslinie, Größe und Kette lassen sich frei wählen, die zehn Prozent gelten immer auf die Summe der gewählten Teile.'
              : 'The example shows Classic 500 g with an 11 speed chain. Wax line, size and chain are free to choose, the ten percent always applies to the sum of the chosen parts.'}
          </p>
        </div>
      </section>

      {/* ── Accessories on their own ── */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Einzeln' : 'Separately'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-3"
            style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Nur das fehlende Teil.' : 'Just the missing piece.'}
          </h2>
          <p className="text-wx-txm text-lead max-w-[52ch] mb-8">
            {de
              ? 'Wenn du schon wachst und nur Nachschub brauchst. Draht verbiegt sich irgendwann, und Zangen verschwinden bekanntlich.'
              : 'For when you already wax and only need a refill. Wire eventually bends out of shape, and pliers famously disappear.'}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                key: 'wire',
                nameDe: 'Aufhängedraht, 3 Stück', nameEn: 'Hanging wire, 3 pieces',
                price: ACCESSORY.wire3,
                bodyDe: 'Steif genug, dass die Kette im Bad nicht kippt, dünn genug, dass kaum Wachs daran hängen bleibt.',
                bodyEn: 'Stiff enough that the chain does not tip in the bath, thin enough that hardly any wax stays on it.',
                shipping: true,
              },
              {
                key: 'pliers',
                nameDe: 'Quick-Link-Zange', nameEn: 'Quick-link pliers',
                price: ACCESSORY.pliers,
                bodyDe: 'Öffnet und schließt den Verschluss. Ohne sie wird das Abnehmen der Kette jedes Mal zur Geduldsprobe.',
                bodyEn: 'Opens and closes the link. Without it, taking the chain off is a test of patience every single time.',
                shipping: false,
              },
            ].map(a => (
              <div key={a.key} className="rounded-2xl p-6"
                style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[15px] text-wx-tx1">{de ? a.nameDe : a.nameEn}</p>
                  <p className="font-display font-bold text-wx-tx1" style={{ fontSize: '1.4rem' }}>
                    {eur(a.price, de)}
                  </p>
                </div>
                <p className="text-[13.5px] leading-relaxed mt-3" style={{ color: 'var(--txm)' }}>
                  {de ? a.bodyDe : a.bodyEn}
                </p>
                {a.shipping && (
                  <p className="num-data text-[11px] mt-4 pt-3" style={{ color: 'var(--txff)', borderTop: '1px solid var(--bd2)' }}>
                    {de ? `zuzüglich ${eur(ACCESSORY.shipping, de)} Versand` : `plus ${eur(ACCESSORY.shipping, de)} shipping`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <div className="rounded-2xl px-6 py-10 sm:py-12 text-center"
            style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.12)' }}>
            <h2 className="font-display font-bold text-wx-tx1 mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              {de ? 'Wachs und Kette wählen, Rest liegt bei.' : 'Pick wax and chain, the rest is included.'}
            </h2>
            <p className="text-[14px] leading-relaxed max-w-[44ch] mx-auto mb-7" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Schreib kurz, welche Schaltung du fährst. Dann stelle ich das Set passend zusammen.'
                : 'Tell me which drivetrain you ride and I will put the right set together.'}
            </p>
            <Link to="/#produkte"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {de ? 'Zu den Produkten' : 'To the products'}
              <ArrowRight className="h-4 w-4" />
            </Link>
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
