// ─── Geschenk-Sektion — die Prepaid-Karte als Geschenkidee ──────────────────
// Vorher: zwei Stempelkarten-Kacheln mit „Für mich / Als Geschenk"-Umschalter,
// die schöne gedrehte Geschenkkarte nur im Modal. Jetzt ist das Geschenk der
// Normalfall: die Karte steht als Objekt da, 5er/10er ist ein Umschalter, der
// Primär-CTA ist „Als Geschenk anfragen", „für mich" ein leiser Zweitlink.
// Darunter das Starter-Set als Beigabe — mit „Kette deiner Wahl" und einem
// ab-Preis, der Link führt in den freien Konfigurator auf /starter-set.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Gift } from 'lucide-react';
import { GiftCardObject } from '@/components/GiftCardObject';
import { trackRewaxInterest } from '@/lib/analytics';
import { starterSetOptions, starterSetBundleProducts } from '@/lib/data';
import { FIVE_CARD, TEN_CARD, eur } from '@/pages/rewax/content';

const WA_NUMBER = '4915751957470';

// Günstigstes Starter-Set MIT Kette — der ab-Preis. Aus den Daten gerechnet,
// nie getippt; ändert sich ein Einzelpreis, zieht er mit.
const STARTER_FROM = Math.min(
  ...starterSetOptions
    .filter((o) => o.chainId)
    .map((o) => starterSetBundleProducts.find((p) => p.id === o.id)!.price),
);

export function GiftSection({ de }: { de: boolean }) {
  const [count, setCount] = useState<5 | 10>(10);
  const card = count === 10 ? TEN_CARD : FIVE_CARD;
  const label = de ? `${count}er-Karte` : `${count}-visit card`;

  const wa = (gift: boolean) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    gift
      ? (de ? `Hi Luca, ich möchte die ${label} als Geschenk bestellen. Name der beschenkten Person: `
        : `Hi Luca, I would like to order the ${label} as a gift. Recipient's name: `)
      : (de ? `Hi Luca, ich möchte die ${label} für mich bestellen.` : `Hi Luca, I would like to order the ${label} for myself.`),
  )}`;

  return (
    <section id="geschenk" className="scroll-mt-24 py-16 sm:py-24 overflow-hidden"
      style={{ borderTop: '1px solid var(--bd2)', background: 'linear-gradient(180deg, var(--accent-wash-sm) 0%, var(--pg) 100%)' }}>
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
          {/* Karte als Objekt */}
          <div className="order-last lg:order-first py-4">
            <GiftCardObject count={count} de={de} />
          </div>

          <div>
            <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{de ? 'Geschenkidee' : 'Gift idea'}</p>
            <h2 className="font-display font-bold text-wx-tx1 leading-[1.05]"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 2.7rem)', letterSpacing: '-0.025em' }}>
              {de ? 'Das Geschenk für alle, die Rad fahren.' : 'The gift for everyone who rides.'}
            </h2>
            <p className="text-[15px] leading-relaxed mt-4" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Eine gedruckte Karte zum Überreichen: fünf- oder zehnmal eine frisch gewachste Kette. Rückversand inklusive, ohne Ablauf, übertragbar.'
                : 'A printed card to hand over: five or ten freshly waxed chains. Return shipping included, no expiry, transferable.'}
            </p>

            <div role="radiogroup" aria-label={de ? 'Kartengröße' : 'Card size'}
              className="inline-flex rounded-full p-1 mt-6" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
              {([5, 10] as const).map((n) => (
                <button key={n} type="button" role="radio" aria-checked={count === n} onClick={() => setCount(n)}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
                  style={{ background: count === n ? 'var(--accent)' : 'transparent', color: count === n ? '#fff' : 'var(--txm)' }}>
                  {de ? `${n}× Wachsen` : `${n}× waxing`}
                  {n === 10 && (
                    <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                      style={{ background: count === n ? 'rgba(255,255,255,0.2)' : 'var(--accent-wash)', color: count === n ? '#fff' : 'var(--accent)' }}>
                      {de ? 'bester Preis' : 'best price'}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-baseline gap-2.5 mt-5">
              <p className="font-display font-bold text-wx-tx1 leading-none" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
                {eur(card.price, de)}
              </p>
              <p className="num text-[13px] line-through" style={{ color: 'var(--txff)' }}>{eur(card.list, de)}</p>
            </div>
            <p className="text-[13px] mt-1.5" style={{ color: 'var(--accent)' }}>
              {de ? `Du sparst ${eur(card.list - card.price, de)}` : `You save ${eur(card.list - card.price, de)}`}
              <span style={{ color: 'var(--txf)' }}> · {eur(card.price / card.count, de)} {de ? 'je Wachsen' : 'per waxing'}</span>
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6">
              <a href={wa(true)} target="_blank" rel="noopener noreferrer" onClick={() => trackRewaxInterest()}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                <Gift className="h-4 w-4" /> {de ? 'Als Geschenk anfragen' : 'Request as a gift'}
              </a>
              <a href={wa(false)} target="_blank" rel="noopener noreferrer" onClick={() => trackRewaxInterest()}
                className="text-[13px] font-semibold underline underline-offset-4" style={{ color: 'var(--txm)' }}>
                {de ? 'Lieber für mich selbst' : 'Rather for myself'}
              </a>
            </div>
            <p className="text-[11.5px] mt-3" style={{ color: 'var(--txff)' }}>
              {de ? 'Gilt für die Auffrischung einer gewachsten Kette.' : 'Valid for rewaxing an already-waxed chain.'}
            </p>
          </div>
        </div>

        {/* ── Starter-Set dazu ── */}
        <div className="mt-14 rounded-2xl overflow-hidden grid sm:grid-cols-[220px_minmax(0,1fr)]"
          style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
          {/* Lucas Wahl (2026-09-14): Kette unten, Draht und Zange vor dem
              blauen Block — dasselbe Motiv wie im eBay-Angebot. Ausschnitt
              links-unten, damit die Kette im schmalen Feld sichtbar bleibt. */}
          <div className="relative min-h-[200px]" style={{ background: 'var(--sf2)' }}>
            <img src="/images/shelf/shelf-set-800.webp" style={{ objectPosition: '20% 85%' }} alt={de ? 'Starter-Set mit Kettenwachs, Kette und Werkzeug' : 'Starter set with chain wax, chain and tools'}
              loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>
              {de ? 'Dazu schenken' : 'Add to the gift'}
            </p>
            <h3 className="font-display font-bold text-[1.35rem] leading-tight mt-1.5" style={{ color: 'var(--tx1)' }}>
              {de ? 'Starter-Set, damit es sofort losgeht.' : 'Starter set, to get going right away.'}
            </h3>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-4">
              {(de
                ? ['Kettenwachs deiner Wahl', 'Kette deiner Wahl, vorgewachst', 'Quick-Link-Zange', 'Drei Aufhängedrähte']
                : ['Chain wax of your choice', 'Chain of your choice, pre-waxed', 'Quick-link pliers', 'Three hanging wires']
              ).map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-[13px]" style={{ color: 'var(--txm)' }}>
                  <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden />{c}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
              <p className="font-display font-bold leading-none" style={{ fontSize: '1.4rem', color: 'var(--tx1)' }}>
                <span className="text-[13px] font-normal" style={{ color: 'var(--txm)' }}>{de ? 'ab ' : 'from '}</span>
                {eur(STARTER_FROM, de)}
              </p>
              <Link to="/starter-set?konfigurieren=1"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-opacity hover:opacity-85"
                style={{ background: 'var(--tx1)', color: 'var(--pg)' }}>
                {de ? 'Set zusammenstellen' : 'Build the set'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
