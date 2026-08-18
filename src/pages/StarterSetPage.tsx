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
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { BackLink } from '@/components/BackLink';
import { accessories, starterSet } from '@/lib/data';
import { StarterSetOptions } from '@/sections/StarterSetOptions';

const W = 'mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14';

const SHIPPING = 1.80;

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const accPriceOf = (id: string) => accessories.find(a => a.id === id)?.price ?? 0;

export function StarterSetPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const title = de
    ? 'Starter-Set Kettenwachs | Waxcelerate'
    : 'Chain wax starter set | Waxcelerate';
  const description = de
    ? `Wachs, vorgewachste Kette, Quick-Link-Zange und Aufhängedraht in einem Set, ${starterSet.discountPct} Prozent unter der Summe der Einzelteile. Alles, was für das erste Wachsen nötig ist.`
    : `Wax, pre-waxed chain, quick-link pliers and hanging wire in one set, ${starterSet.discountPct} percent below the sum of the parts. Everything the first waxing needs.`;

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/starter-set" />
      </Helmet>

      <Navigation />

      {/* ── Hero — the kit image, nothing else. The old version repeated the
          exact same "pick wax + chain, rest included" message three times
          (hero copy, section intro, closing CTA) before you ever saw a
          price. The image already says "here's the kit"; the cards below
          say the rest. */}
      <section className="relative pt-28 sm:pt-36 pb-10" style={{ background: 'var(--pg)' }}>
        <div className={W}>
          <BackLink de={de} className="mb-6 sm:mb-8" />
          <h1 className="font-display font-bold leading-[1.05] mb-6"
            style={{ color: 'var(--tx1)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Alles da, beim ersten Mal.' : 'Everything there, first time.'}
          </h1>
          <div className="rounded-2xl overflow-hidden mx-auto" style={{ aspectRatio: '16 / 9', maxWidth: 720, background: 'var(--hero-stage)' }}>
            <img src="/images/doors/starter-set.webp"
              srcSet="/images/doors/starter-set-800.webp 800w, /images/doors/starter-set.webp 1200w"
              sizes="(max-width: 1024px) 92vw, 720px"
              alt={de ? 'Wachsblock mit Quick-Link-Zange und Kette' : 'Wax block with quick-link pliers and chain'}
              className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── Cards — wax + chain + tools, one click. Everything the page
          needs to say is on the cards themselves now. */}
      <section id="sets" className="pt-6 pb-14 sm:pb-20" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <StarterSetOptions de={de} />
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
                price: accPriceOf('acc-wire'),
                bodyDe: 'Steif genug, dass die Kette im Bad nicht kippt, dünn genug, dass kaum Wachs daran hängen bleibt.',
                bodyEn: 'Stiff enough that the chain does not tip in the bath, thin enough that hardly any wax stays on it.',
                shipping: true,
              },
              {
                key: 'pliers',
                nameDe: 'Quick-Link-Zange', nameEn: 'Quick-link pliers',
                price: accPriceOf('acc-pliers'),
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
                  <p className="num-data text-meta mt-4 pt-3" style={{ color: 'var(--txff)', borderTop: '1px solid var(--bd2)' }}>
                    {de ? `zuzüglich ${eur(SHIPPING, de)} Versand` : `plus ${eur(SHIPPING, de)} shipping`}
                  </p>
                )}
              </div>
            ))}
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
