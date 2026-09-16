import { useState } from 'react';
import type { Product } from '@/lib/data';
import { CHAIN_TIERS, canCheckout, isSoldOut, trustStats } from '@/lib/data';
import { getEstimatedDelivery } from '@/lib/utils';
import { useDispatchLine } from '@/hooks/useDispatchLine';
import { trackEbayClick } from '@/lib/analytics';
import { AddToCartButton } from '@/components/AddToCartButton';
import { PriceNote } from '@/components/PriceNote';
import { Stars } from '@/components/Stars';
import type { useLanguage } from '@/hooks/useLanguage';
import { Ico } from '../wax/Ico';
import { chainCopy } from './content';

// ══════════════════════════════════════════════════════════════
// ERSTER SCREEN DER KETTENSEITE — Aufbau wie WaxHero
// ══════════════════════════════════════════════════════════════
// Bildstrecke links, feste Kaufbox rechts. Die Kaufbox beantwortet in der
// Reihenfolge: was ist das (Modell, Gaenge, Glieder) → was steckt im Karton
// (Kette, Wachs, Schloss; aus der eBay-Beschreibung) → was kostet es, auch
// bei mehreren (Staffel wie auf eBay, CHAIN_TIERS) → kaufen → wann ist es
// da → passt es zu meinem Rad (Sprung zu #passung).

/** "Quick-Link (dabei)" → "Quick-Link". Der Verbinder steht in den Specs. */
export const connectorOf = (p: Product) => (p.specs?.['Verbinder'] ?? 'Quick-Link').replace(/\s*\(.*\)$/, '');

export function ChainHero({
  product, de, t, titleText, gallery, buyRef, onOpenImage,
}: {
  product: Product;
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  titleText: string;
  gallery: { src: string; title: string; fact: string }[];
  buyRef: React.RefObject<HTMLDivElement | null>;
  onOpenImage: (i: number) => void;
}) {
  const [slide, setSlide] = useState(0);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatchLine(de);
  const c = chainCopy(de);
  const fmt = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const speed = product.chainSpeed ?? '';
  const speedShown = de ? speed : speed.replace('-fach', '-speed');
  const links = product.chainLinks ?? '';
  const connector = connectorOf(product);
  const toFit = () => document.getElementById('passung')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Staffel wie der eBay-Multi-Rabatt: erst den Stueckpreis auf den Cent
  // runden, dann mal Menge (39,95 € → 37,95 / 37,15 / 35,96 €/Stk., genau
  // die Werte im eBay-Angebot). Gross steht der Stueckpreis, sonst bricht
  // "4 × 69,95 €" samt Streichpreis in der Preiskarte um.
  const pctFor = (q: number) => [...CHAIN_TIERS].sort((a, b) => b.qty - a.qty).find(x => q >= x.qty)?.pct ?? 0;
  const priceCents = Math.round(product.price * 100);
  const unitFor = (q: number) => Math.round((priceCents * (100 - pctFor(q))) / 100) / 100;
  const pct = pctFor(qty);
  const unit = unitFor(qty);
  const total = Math.round(unit * qty * 100) / 100;
  const full = Math.round(priceCents * qty) / 100;

  const buyLink = isSoldOut(product) ? (
    <p className="text-center text-[14px] font-semibold py-3.5" style={{ color: 'var(--txf)' }}>{c.soldOut}</p>
  ) : canCheckout(product) ? (
    <AddToCartButton product={product} fullWidth />
  ) : (
    <a className="wxp-cta" href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}>
      {qty > 1 ? c.orderQty(qty) : c.orderNow}
      <Ico name="arrow" className="wxp-ico" style={{ width: 16, height: 16 }} />
    </a>
  );

  return (
    <section className="wxp-hero">
      <div className="wxp-wrap wxp-hero-grid">
        <div className="min-w-0">
          <div className="wxp-gallery" aria-label={de ? 'Bilder' : 'Images'}
            onScroll={e => {
              const el = e.currentTarget; const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
              setSlide(Math.round(el.scrollLeft / (w + 10)));
            }}>
            {gallery.slice(0, 4).map((g, i) => (
              <figure key={g.src} className={`g${i}`}>
                <img src={g.src} alt={i === 0 ? titleText : g.title} loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined} decoding="async" />
                <figcaption><b>{g.title}</b><span>{g.fact}</span></figcaption>
                <button type="button" onClick={() => onOpenImage(i)} aria-label={`${g.title} ${de ? 'vergrößern' : 'enlarge'}`} />
              </figure>
            ))}
          </div>
          <p className="wxp-gcount" aria-hidden>{slide + 1} / {Math.min(4, gallery.length)}</p>
        </div>

        <aside className="wxp-buy" aria-label={de ? 'Kaufen' : 'Buy'}>
          <p className="eyebrow wxp-eyebrow">
            {c.eyebrow} · {product.chainBrand}
            {!isSoldOut(product) && <span className="wxp-stock">{c.inStock}</span>}
          </p>
          <h1>{titleText}</h1>
          <a className="wxp-rating" href="#stimmen">
            <Stars rating={5} color="#F5A623" />
            {trustStats.reviews} {c.reviews}
          </a>
          <p className="wxc-specline">{speedShown} · {de ? links : links.replace('Glieder', 'links')} · {c.proWax} · {connector} {c.included}</p>
          <p className="wxp-lede">{c.lede(speed)}</p>

          <div ref={buyRef} className="wxp-card wxp-pricecard">
            {/* Kein Streichpreis in der Zeile: bei 4 × M9100 lief sie sonst
                ueber (394 px Inhalt in 342 px). Ersparnis und Summe stehen
                in der Notiz unter der Mengenwahl. */}
            <div className="wxp-pricetop wxc-pricetop">
              <p className="wxp-price">{fmt(unit)}<span style={{ fontSize: 22, marginLeft: 3, color: 'var(--tx2)', fontWeight: 600 }}>€{qty > 1 && pct > 0 && <small className="wxc-perpc">{c.perPiece}</small>}</span></p>
              <span className="wxp-ship"><Ico name="truck" />{de ? 'Versand kostenlos' : 'Free shipping'}</span>
            </div>
            <div className="wxp-stack">
              <div><div className="v">{speedShown}</div><div className="k">{c.tiles.speed}</div></div>
              <div><div className="v">{links.replace(/\D+/g, '')}</div><div className="k">{c.tiles.links}</div></div>
              <div><div className="v">{c.tiles.readyV}</div><div className="k">{c.tiles.ready}</div></div>
            </div>
            <p className="wxc-boxtitle">{c.boxTitle}</p>
            <ul className="wxc-box">
              <li><Ico name="chain" /><span><b>{product.chainBrand} {product.chainModel}</b>{c.box.chain(links)}</span></li>
              <li><Ico name="drop" /><span><b>{c.proWax}</b>{c.box.wax}</span></li>
              <li><Ico name="link" /><span><b>{connector}</b>{c.box.link}</span></li>
            </ul>
            {!isSoldOut(product) && (
              <>
                <div className="wxp-qty" role="group" aria-label={c.qtyLabel}>
                  {[1, 2, 3, 4].map(q => (
                    <button key={q} type="button" aria-pressed={qty === q} onClick={() => setQty(q)}>
                      <b>{q === 4 ? '4+' : q}</b>
                      <span>{pctFor(q) > 0 ? `−${pctFor(q)} %` : c.qtyPiece}</span>
                    </button>
                  ))}
                </div>
                {qty > 1 && (
                  <p className="wxp-addnote">
                    {c.qtySave(fmt(total), fmt(full - total))}{' '}
                    {!canCheckout(product) && c.qtyEbay(qty === 4 ? (de ? '4 oder mehr' : '4 or more') : String(qty))}
                  </p>
                )}
              </>
            )}
            {buyLink}
            <div className="wxp-legal"><PriceNote de={de} t={t} /></div>
          </div>

          <div className="wxp-dispatch" aria-live="polite"><span className="wxp-pulse" aria-hidden />
            <span>{dispatch}</span></div>

          <div className="wxp-trust">
            <div><Ico name="calendar" /><span><b>{getEstimatedDelivery(de ? 'de' : 'en')}</b>{c.trust.delivery}</span></div>
            <div><Ico name="pin" /><span><b>Stuttgart</b>{c.trust.city}</span></div>
            <div><Ico name="shield" /><span><b>{c.trust.days}</b>{c.trust.daysSub}</span></div>
          </div>

          <button type="button" className="wxp-prohint" onClick={toFit}>
            <span><b>{c.fitHint}</b> {product.compatibility}</span>
            <Ico name="arrow" style={{ color: 'var(--accent-soft)', width: 16, height: 16 }} />
          </button>
        </aside>
      </div>
    </section>
  );
}
