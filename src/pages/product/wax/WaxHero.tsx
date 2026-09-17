import { useState } from 'react';
import type { Product } from '@/lib/data';
import { WAX_TIERS, canCheckout, isSoldOut, trustStats } from '@/lib/data';
import { applicationsPerBlock, medianChainPrice } from '@/lib/waxMath';
import { getEstimatedDelivery } from '@/lib/utils';
import { useDispatchLine } from '@/hooks/useDispatchLine';
import { trackEbayClick, trackSizeSelect } from '@/lib/analytics';
import { AddToCartButton } from '@/components/AddToCartButton';
import { PriceNote } from '@/components/PriceNote';
import { Stars } from '@/components/Stars';
import type { useLanguage } from '@/hooks/useLanguage';
import { PdpCrumbs } from '../PdpCrumbs';
import { PdpGallery } from '../PdpGallery';
import { Ico } from './Ico';

// ══════════════════════════════════════════════════════════════
// ERSTER SCREEN — Bildstrecke links, feste Kaufbox rechts
// ══════════════════════════════════════════════════════════════
// Premium-Produktseiten (Rapha, Aesop, Allbirds) loesen "grosse Galerie +
// langer Kaufblock" so: die Bilder laufen gross untereinander und erzaehlen
// den Ablauf, der Kaufblock bleibt beim Scrollen stehen. Das beseitigt den
// toten Raum unter einem einzelnen Galeriebild und die anonymen Mini-
// Vorschaubilder. Mobil wird die Strecke zu einem Wisch-Karussell.
//
// Reihenfolge der Kaufbox nach der Frage, die ein Kaeufer gerade hat: was
// ist das → welche Groesse → was kostet es (nie ohne Gegenwert: Preis je
// Wachsgang, Kilometer, "weniger als eine Kette") → kaufen → wann ist es da.

export function WaxHero({
  product, de, t, titleText, gallery, sizeSibling, recommendedId, personalized, rewaxKm, buyRef, backFallback, onBack, onOpenImage, onSizeSelect, onProHint,
}: {
  product: Product;
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  titleText: string;
  gallery: { src: string; alt: string }[];
  sizeSibling: Product | undefined;
  recommendedId: string | undefined;
  /** Hat der Besucher den Rechner benutzt? Erst dann ist "Passt zu dir" eine Aussage. */
  personalized: boolean;
  rewaxKm: number;
  buyRef: React.RefObject<HTMLDivElement | null>;
  backFallback: { to: string; label: string };
  onBack: (e: React.MouseEvent) => void;
  onOpenImage: (i: number) => void;
  onSizeSelect: (p: Product) => void;
  onProHint: () => void;
}) {
  const [qty, setQty] = useState(1);
  const dispatch = useDispatchLine(de);
  const isPro = product.variant === 'pro';
  const fmt = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Staffel als Mengenwahl (2 × 5 %, 3 × 10 %, ab 4 × 15 %): Mengenrabatt
  // wird eine Handlung statt einer Infozeile. In Cent gerechnet wie
  // bundleOffer() in data.ts.
  const pctFor = (q: number) => [...WAX_TIERS].sort((a, b) => b.qty - a.qty).find(t => q >= t.qty)?.pct ?? 0;
  const priceCents = Math.round(product.price * 100);
  const totalFor = (q: number) => Math.round((priceCents * q * (100 - pctFor(q))) / 100) / 100;
  const pct = pctFor(qty);
  const apps = applicationsPerBlock(product) ?? 0;
  const shown = totalFor(qty);
  const full = product.price * qty;
  const kmInBlock = Math.round((apps * rewaxKm * qty) / 100) * 100;
  const perApp = apps > 0 ? product.price / apps : null;
  const lessThanChain = product.price < medianChainPrice;

  const sizes = sizeSibling
    ? [product, sizeSibling].sort((a, b) => parseInt(a.weight ?? '0') - parseInt(b.weight ?? '0'))
    : [];

  const buyLink = isSoldOut(product) ? (
    <p className="text-center text-[14px] font-semibold py-3.5" style={{ color: 'var(--txf)' }}>{de ? 'Ausverkauft' : 'Sold out'}</p>
  ) : canCheckout(product) ? (
    <AddToCartButton product={product} fullWidth />
  ) : (
    <a className="wxp-cta" href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}>
      {qty > 1 ? (de ? `${qty} Blöcke bestellen` : `Order ${qty} blocks`) : (de ? 'Jetzt bestellen' : 'Order now')}
      <Ico name="arrow" className="wxp-ico" style={{ width: 16, height: 16 }} />
    </a>
  );

  return (
    <section className="wxp-hero">
      <div className="wxp-wrap">
        <PdpCrumbs de={de} titleText={titleText} backFallback={backFallback} onBack={onBack} />
      </div>
      <div className="wxp-wrap wxp-hero-grid">
        <div className="min-w-0">
          <PdpGallery images={gallery} de={de} onOpen={onOpenImage} />
        </div>

        <aside className="wxp-buy" aria-label={de ? 'Kaufen' : 'Buy'}>
          <p className="eyebrow wxp-eyebrow">
            {de ? 'Heißwachs' : 'Hot wax'} · {isPro ? 'Pro MoS₂' : 'Classic'}
            {!isSoldOut(product) && <span className="wxp-stock">{de ? 'Auf Lager' : 'In stock'}</span>}
          </p>
          <h1>{titleText}</h1>
          <a className="wxp-rating" href="#stimmen">
            <Stars rating={5} color="#F5A623" />
            {trustStats.reviews} {de ? 'Bewertungen · 100 % positiv' : 'reviews · 100 % positive'}
          </a>
          <p className="wxp-lede">{de ? product.lede ?? product.description : product.ledeEn ?? product.descriptionEn}</p>

          {sizes.length === 2 && (
            <>
              <div className="wxp-lbl">{de ? 'Größe' : 'Size'} <a href="#rechner">{de ? 'Welche passt zu mir?' : 'Which one fits me?'}</a></div>
              <div className="wxp-sizes" role="group" aria-label={de ? 'Größe wählen' : 'Choose size'}>
                {sizes.map(p => {
                  const active = p.id === product.id;
                  const badge = personalized
                    ? (p.id === recommendedId ? (de ? 'Passt zu dir' : 'Fits you') : null)
                    : (p.weight === '500g' ? (de ? 'Beliebteste' : 'Most popular') : null);
                  return (
                    <button key={p.id} type="button" className="wxp-size" aria-pressed={active}
                      onClick={() => { if (!active) { trackSizeSelect(product.id, p.weight ?? ''); onSizeSelect(p); } }}>
                      {badge && <span className="fit">{badge}</span>}
                      <span className="row"><span className="w">{p.weight?.replace('g', ' g')}</span><span className="p num">{fmt(p.price)} €</span></span>
                      <span className="s">{p.applications} {de ? 'Wachsgänge' : 'waxings'}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div ref={buyRef} className="wxp-card wxp-pricecard">
            <div className="wxp-pricetop">
              <p className="wxp-price">{fmt(shown)}<span style={{ fontSize: 22, marginLeft: 3, color: 'var(--tx2)', fontWeight: 600 }}>€</span>
                {qty > 1 && pct > 0 && <s>{fmt(full)} €</s>}</p>
              <span className="wxp-ship"><Ico name="truck" />{de ? 'Versand kostenlos' : 'Free shipping'}</span>
            </div>
            <div className="wxp-stack">
              {perApp !== null && <div><div className="v">≈ {fmt(perApp)} €</div><div className="k">{de ? 'pro Wachsgang' : 'per waxing'}</div></div>}
              {apps > 0 && <div><div className="v">~{kmInBlock.toLocaleString(de ? 'de-DE' : 'en-US')} km</div><div className="k" title={de ? `bei deinem Wachsintervall von ${rewaxKm} km` : `at your waxing interval of ${rewaxKm} km`}>{de ? (qty > 1 ? 'Fahrt, dein Profil' : 'im Block, dein Profil') : 'riding, your profile'}</div></div>}
              {lessThanChain && <div><div className="v">&lt; 1 {de ? 'Kette' : 'chain'}</div><div className="k">{de ? 'kostet der Block' : 'is what it costs'}</div></div>}
            </div>
            {!isSoldOut(product) && (
              <>
                <div className="wxp-qty" role="group" aria-label={de ? 'Menge' : 'Quantity'}>
                  {[1, 2, 3, 4].map(q => (
                    <button key={q} type="button" aria-pressed={qty === q} onClick={() => setQty(q)}>
                      <b>{q === 4 ? '4+' : q}</b>
                      <span>{pctFor(q) > 0 ? `−${pctFor(q)} %` : (de ? 'Stück' : 'pc')}</span>
                    </button>
                  ))}
                </div>
                {qty > 1 && (
                  <p className="wxp-addnote">
                    {de ? `Du sparst ${fmt(full - shown)} €.` : `You save €${fmt(full - shown)}.`}{' '}
                    {!canCheckout(product) && (de ? `Bei eBay Menge ${qty === 4 ? '4 oder mehr' : qty} wählen, der Rabatt wird im Warenkorb abgezogen.` : `Choose quantity ${qty === 4 ? '4 or more' : qty} on eBay, the discount is applied in the basket.`)}
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
            <div><Ico name="calendar" /><span><b>{getEstimatedDelivery(de ? 'de' : 'en')}</b>{de ? 'voraussichtlich bei dir' : 'estimated delivery'}</span></div>
            <div><Ico name="pin" /><span><b>Stuttgart</b>{de ? 'in kleinen Chargen' : 'small batches'}</span></div>
            <div><Ico name="shield" /><span><b>{de ? '14 Tage' : '14 days'}</b>{de ? 'Rückgabe, ungeöffnet' : 'return, unopened'}</span></div>
          </div>

          <button type="button" className="wxp-prohint" onClick={onProHint}>
            <span>
              {isPro
                ? <><b>{de ? 'Fährst du nur trocken?' : 'Only riding dry?'}</b> {de ? 'Dann reicht Classic.' : 'Then Classic is enough.'}</>
                : <><b>{de ? 'Oft nass oder kalt?' : 'Often wet or cold?'}</b> {de ? 'Da hält Pro MoS₂ länger.' : 'Pro MoS₂ lasts longer there.'}</>}
            </span>
            <Ico name="arrow" style={{ color: 'var(--accent-soft)', width: 16, height: 16 }} />
          </button>
        </aside>
      </div>
    </section>
  );
}
