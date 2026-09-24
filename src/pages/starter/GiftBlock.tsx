// ─── Starter-Set als Geschenk ───────────────────────────────────────────────
// v3 (16.09.2026): zwei gleich hohe Karten nebeneinander statt Sektion mit
// Absätzen. Links das Set (Anfrage nennt die gewählte Kombination), rechts
// die Wachs-Karte vom Rewax-Service — 5er vorgewählt, weil ein Geschenk
// unter 50 € leichter fällt (Luca). Bewusst nichts zu Geschenkpapier oder
// Grußkarte, das ist nicht mit Luca geklärt.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift } from 'lucide-react';
import { GiftCardObject } from '@/components/GiftCardObject';
import { trackStarterInterest } from '@/lib/analytics';
import { FIVE_CARD, TEN_CARD, eur as rewaxEur } from '@/pages/rewax/content';
import { eur, type SetCombo } from '@/pages/starter/content';
import { comboFacts, comboLabel, setRequestHref } from '@/pages/starter/setFacts';

export function GiftBlock({ de, combo }: { de: boolean; combo: SetCombo }) {
  const [count, setCount] = useState<5 | 10>(5);
  const card = count === 10 ? TEN_CARD : FIVE_CARD;
  const { price } = comboFacts(combo);

  return (
    <section id="geschenk" className="scroll-mt-24 py-16 sm:py-24"
      style={{ borderTop: '1px solid var(--bd2)', background: 'linear-gradient(180deg, var(--accent-wash-sm) 0%, var(--pg) 100%)' }}>
      <div className="wxp-wrap">
        <div className="wxp-chead" style={{ marginBottom: 28 }}>
          <p className="eyebrow">{de ? 'Geschenkidee' : 'Gift idea'}</p>
          <h2>{de ? 'Verschenk den ersten Wachsabend.' : 'Give the first waxing evening.'}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
          {/* Das Set */}
          <div className="wxp-card overflow-hidden flex flex-col">
            <div className="relative aspect-[16/10] overflow-hidden" style={{ background: 'var(--hero-stage)' }}>
              <img src="/images/blog/chain-wax-kit-hills-800.webp"
                srcSet="/images/blog/chain-wax-kit-hills-800.webp 800w, /images/blog/chain-wax-kit-hills-1600.webp 1600w"
                sizes="(max-width: 768px) 92vw, 540px"
                alt={de ? 'Waxcelerate-Paket mit Kette und Wachs' : 'Waxcelerate parcel with chain and wax'}
                loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: '60% 50%' }} />
            </div>
            <div className="p-5 sm:p-6 flex flex-col flex-1">
              <p className="font-display font-bold text-[1.3rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                {de ? 'Das Starter-Set' : 'The starter set'}
              </p>
              <p className="text-[13.5px] mt-1 truncate" style={{ color: 'var(--txm)' }}>
                {comboLabel(combo, de)} · <span className="num">{eur(price, de)}</span>
                <a href="#top" className="ml-2 underline underline-offset-4" style={{ color: 'var(--txf)' }}>{de ? 'ändern' : 'change'}</a>
              </p>
              <div className="mt-auto pt-5">
                <a href={setRequestHref(combo, de, true)} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackStarterInterest('gift')}
                  className="wxp-cta" style={{ background: 'var(--accent)', color: '#fff' }}>
                  <Gift className="h-4 w-4" aria-hidden /> {de ? 'Als Geschenk anfragen' : 'Request as a gift'}
                </a>
              </div>
            </div>
          </div>

          {/* Die Wachs-Karte */}
          <div className="wxp-card p-5 sm:p-6 flex flex-col">
            <div className="grid sm:grid-cols-[minmax(0,190px)_minmax(0,1fr)] gap-5 items-center">
              <div className="py-3 w-full max-w-[230px] mx-auto"><GiftCardObject count={count} de={de} animate={false} tilt={-4} /></div>
              <div className="min-w-0">
                <p className="font-display font-bold text-[1.3rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                  {de ? 'Die Wachs-Karte' : 'The wax card'}
                </p>
                <p className="text-[13.5px] mt-1" style={{ color: 'var(--txm)' }}>
                  {de ? 'Kette einschicken, gewachst zurück. Rückversand inklusive.' : 'Send the chain in, get it back waxed. Return included.'}
                </p>
              </div>
            </div>

            {/* Gleiches Muster wie die Segmente in SetHero.tsx: role="group" am
                Wrapper, aria-pressed an den Knöpfen. role="radio" + aria-pressed
                zusammen ist ungültiges ARIA (radio kennt nur aria-checked). */}
            <div role="group" aria-label={de ? 'Kartengröße' : 'Card size'} className="wxs-seg mt-5">
              {([5, 10] as const).map((n) => {
                const c = n === 10 ? TEN_CARD : FIVE_CARD;
                return (
                  <button key={n} type="button" aria-pressed={count === n} onClick={() => setCount(n)}>
                    <b>{n}× · {rewaxEur(c.price, de)}</b>
                    <span>{n === 10 ? (de ? 'bester Preis' : 'best price') : (de ? 'unter 50 €' : 'under 50 €')}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-5 flex items-center justify-between gap-4">
              <p className="text-[13px]" style={{ color: 'var(--txm)' }}>
                <span className="wxs-savepill">−{Math.round((1 - card.price / card.list) * 100)} %</span>
                <span className="num ml-2" style={{ color: 'var(--txff)' }}>{de ? 'einzeln' : 'separately'} {rewaxEur(card.list, de)}</span>
              </p>
              <Link to="/kette-wachsen-lassen#geschenk"
                className="inline-flex items-center gap-1.5 min-h-11 text-[14px] font-semibold" style={{ color: 'var(--tx1)' }}>
                {de ? 'Zur Wachs-Karte' : 'See the wax card'}
                <ArrowRight className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
