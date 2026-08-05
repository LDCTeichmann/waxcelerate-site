// ─── StarterSetBuilder — pick two things, the rest follows ───────────────────
//
// The set exists because the first waxing evening is where people give up: they
// order wax, then find out they also need something to open the chain and
// something to hang it on, and the evening ends with a chain in a pot and no
// hook. So the builder only ever asks the two questions the customer can
// actually answer — which wax, which chain — and adds the two parts nobody
// thinks about automatically.
//
// Deliberately not a multi-step wizard. Two rows of choices, a running total,
// done. A configurator that makes you click "next" for a four-item bundle is
// theatre; everything fits on one screen, so it is on one screen.
//
// The saving is shown in euros, not as a percentage. "You save 11.80 €" is a
// fact about this basket; "15% off" is a claim about a list price, and a brand
// that argues with measurements should not carry a permanent percentage badge.

import { useMemo, useState } from 'react';
import { Check, ArrowRight, ExternalLink } from 'lucide-react';
import { products, accessories, starterSet, starterSetPrice } from '@/lib/data';
import { trackEbayClick } from '@/lib/analytics';

const fmt = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export function StarterSetBuilder({ de }: { de: boolean }) {
  const waxes = useMemo(() => products.filter(p => p.category === 'wax'), []);
  const chains = useMemo(() => products.filter(p => p.category === 'chain'), []);

  const [waxId, setWaxId] = useState(waxes.find(p => p.id === 'wax-500')?.id ?? waxes[0]?.id);
  const [chainId, setChainId] = useState(chains.find(p => p.id === 'chain-ybn11')?.id ?? chains[0]?.id);

  const wax = waxes.find(p => p.id === waxId);
  const chain = chains.find(p => p.id === chainId);
  const extras = accessories.filter(a =>
    (starterSet.includedAccessoryIds as readonly string[]).includes(a.id));

  const partsSum = (wax?.price ?? 0) + (chain?.price ?? 0) + extras.reduce((a, x) => a + x.price, 0);
  const setPrice = starterSetPrice(partsSum);
  const saved = Math.round((partsSum - setPrice) * 100) / 100;

  const Choice = ({
    active, onClick, title, sub, price,
  }: { active: boolean; onClick: () => void; title: string; sub?: string; price: number }) => (
    <button type="button" onClick={onClick} aria-pressed={active}
      className="w-full text-left rounded-xl px-4 py-3.5 transition-colors"
      style={{
        background: active ? 'var(--accent-wash-sm)' : 'var(--sf)',
        border: active ? '1px solid rgba(var(--accent-rgb),0.35)' : '1px solid var(--bd)',
      }}>
      <span className="flex items-start gap-3">
        <span aria-hidden className="flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center"
          style={{
            width: 16, height: 16,
            border: active ? 'none' : '1px solid var(--bd)',
            background: active ? 'var(--accent)' : 'transparent',
          }}>
          {active && <Check className="h-3 w-3" style={{ color: '#fff' }} strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] leading-snug" style={{ color: 'var(--tx1)' }}>{title}</span>
          {sub && <span className="block text-[12px] mt-0.5" style={{ color: 'var(--txm)' }}>{sub}</span>}
        </span>
        <span className="num-data text-[12.5px] flex-shrink-0" style={{ color: 'var(--txf)' }}>
          {fmt(price, de)}
        </span>
      </span>
    </button>
  );

  return (
    <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">

      {/* ── Choices ── */}
      <div className="space-y-8">
        <div>
          <p className="num-data text-[11px] mb-3" style={{ color: 'var(--accent)' }}>
            01 · {de ? 'Wachs wählen' : 'Choose the wax'}
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {waxes.map(p => (
              <Choice key={p.id} active={p.id === waxId} onClick={() => setWaxId(p.id)}
                title={de ? p.title : p.titleEn}
                sub={p.variant === 'pro'
                  ? (de ? 'Ganzjahr, Winter, E-Bike' : 'All year, winter, e-bike')
                  : (de ? 'Frühjahr bis Herbst' : 'Spring to autumn')}
                price={p.price} />
            ))}
          </div>
        </div>

        <div>
          <p className="num-data text-[11px] mb-3" style={{ color: 'var(--accent)' }}>
            02 · {de ? 'Kette wählen' : 'Choose the chain'}
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {chains.map(p => (
              <Choice key={p.id} active={p.id === chainId} onClick={() => setChainId(p.id)}
                title={de ? p.title : p.titleEn}
                sub={p.chainSpeed}
                price={p.price} />
            ))}
          </div>
        </div>

        <div>
          <p className="num-data text-[11px] mb-3" style={{ color: 'var(--txf)' }}>
            03 · {de ? 'Liegt automatisch bei' : 'Included automatically'}
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {extras.map(a => (
              <div key={a.id} className="rounded-xl px-4 py-3.5"
                style={{ background: 'var(--sf2)', border: '1px dashed var(--bd)' }}>
                <span className="flex items-start gap-3">
                  <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] leading-snug" style={{ color: 'var(--tx1)' }}>
                      {de ? a.title : a.titleEn}
                    </span>
                    <span className="block text-[12px] mt-0.5" style={{ color: 'var(--txm)' }}>
                      {de ? 'Ohne die beiden wird der erste Abend zäh.' : 'Without these two the first evening drags.'}
                    </span>
                  </span>
                  <span className="num-data text-[12.5px] flex-shrink-0" style={{ color: 'var(--txf)' }}>
                    {fmt(a.price, de)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Running total ── */}
      <div className="lg:sticky lg:top-24 rounded-2xl p-6 sm:p-7"
        style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
        <p className="text-[11px] uppercase tracking-[0.16em] mb-5" style={{ color: 'var(--accent)' }}>
          {de ? 'Dein Set' : 'Your set'}
        </p>

        <div style={{ borderTop: '1px solid var(--bd2)' }}>
          {[
            wax && { k: de ? wax.title : wax.titleEn, v: wax.price },
            chain && { k: de ? chain.title : chain.titleEn, v: chain.price },
            ...extras.map(a => ({ k: de ? a.title : a.titleEn, v: a.price })),
          ].filter(Boolean).map((r, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 py-2.5"
              style={{ borderBottom: '1px solid var(--bd2)' }}>
              <span className="text-[13px] leading-snug" style={{ color: 'var(--txm)' }}>{r!.k}</span>
              <span className="num-data text-[12.5px] whitespace-nowrap" style={{ color: 'var(--txf)' }}>
                {fmt(r!.v, de)}
              </span>
            </div>
          ))}

          <div className="flex items-baseline justify-between gap-4 py-2.5"
            style={{ borderBottom: '1px solid var(--bd2)' }}>
            <span className="text-[13px]" style={{ color: 'var(--txm)' }}>
              {de ? 'Einzeln gekauft' : 'Bought separately'}
            </span>
            <span className="num-data text-[12.5px]" style={{ color: 'var(--txm)' }}>{fmt(partsSum, de)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5"
            style={{ borderBottom: '1px solid var(--bd2)' }}>
            <span className="text-[13px]" style={{ color: 'var(--txm)' }}>
              {de ? 'Als Set' : 'As a set'}
            </span>
            <span className="num-data text-[12.5px]" style={{ color: 'var(--accent)' }}>
              &minus; {fmt(saved, de)}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 mt-5">
          <p className="font-display font-bold text-wx-tx1 leading-none"
            style={{ fontSize: '2.4rem', letterSpacing: '-0.02em' }}>
            {fmt(setPrice, de)}
          </p>
          <p className="text-[11px] uppercase tracking-[0.14em] pb-1.5" style={{ color: 'var(--txf)' }}>
            {de ? 'Set-Preis' : 'Set price'}
          </p>
        </div>

        <a href={wax?.ebayUrl ?? '#'} target="_blank" rel="noopener noreferrer"
          onClick={() => { if (wax) trackEbayClick(wax.id); }}
          className="inline-flex w-full items-center justify-center gap-2 mt-6 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {de ? 'Set anfragen' : 'Request the set'}
          <ExternalLink className="h-4 w-4" />
        </a>

        <p className="text-[11.5px] leading-relaxed mt-4" style={{ color: 'var(--txff)' }}>
          {de
            ? `Solange der eigene Checkout im Aufbau ist, läuft die Bestellung über eBay oder direkt per Nachricht. Schreib dazu, welche Kombination du willst, dann geht das Set als ein Paket raus. Der Set-Preis liegt ${starterSet.discountPct} Prozent unter der Summe der Einzelteile.`
            : `While the own checkout is being built, orders go through eBay or a direct message. Tell me which combination you want and the set ships as one parcel. The set price is ${starterSet.discountPct} percent below the sum of the parts.`}
        </p>

        <a href="/#kontakt"
          className="inline-flex items-center gap-2 mt-4 text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>
          {de ? 'Lieber direkt schreiben' : 'Rather message directly'}
          <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
        </a>
      </div>
    </div>
  );
}
