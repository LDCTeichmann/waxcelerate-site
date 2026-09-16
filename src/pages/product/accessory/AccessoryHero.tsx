// ─── Erster Screen der Zubehörseite — Aufbau wie ChainHero ──────────────────
// v1 (16.09.2026, Luca: „die Einzelseiten sehen blöd aus"). Vorher: ein
// 21:9-Foto mit Überschrift, darunter Fließtext und ein kleiner Preis.
// Jetzt: Bildstrecke links, Kaufbox rechts. Beim Einzelkauf fällt Versand an
// (graue Pille), das Starter-Set ist der günstigere Weg und steht als zweiter,
// gleichwertig sichtbarer Knopf direkt darunter.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Truck } from 'lucide-react';
import type { Accessory } from '@/lib/data';
import { getEstimatedDelivery } from '@/lib/utils';
import { trackEbayClick } from '@/lib/analytics';
import { PriceNote } from '@/components/PriceNote';
import type { useLanguage } from '@/hooks/useLanguage';
import { Ico } from '@/pages/product/wax/Ico';
import { eur, PCT } from '@/pages/starter/content';
import { SET_FROM } from '@/pages/starter/setFacts';
import type { AccessoryPageCopy } from './content';
import '@/pages/product/wax/wax.css';
import '@/pages/product/chain/chain.css';
import '@/pages/starter/starter.css';

export function AccessoryHero({ acc, copy, de, t }: {
  acc: Accessory;
  copy: AccessoryPageCopy;
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
}) {
  const [slide, setSlide] = useState(0);
  const title = de ? acc.title : acc.titleEn;
  const shipping = acc.shippingCost
    ? (de ? `zzgl. ${eur(acc.shippingCost, de)} Versand` : `plus ${eur(acc.shippingCost, de)} shipping`)
    : undefined;

  return (
    <section className="wxp-hero wxs-hero">
      <div className="wxp-wrap wxp-hero-grid">
        <div className="min-w-0">
          <div className="wxp-gallery wxs-gallery" aria-label={de ? 'Bilder' : 'Images'}
            onScroll={(e) => {
              const el = e.currentTarget; const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
              setSlide(Math.round(el.scrollLeft / (w + 10)));
            }}>
            {copy.gallery.map((g, i) => (
              <figure key={g.src} className={`g${i}`}>
                <img src={g.src} alt={i === 0 ? title : (de ? g.de : g.en)} loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined} decoding="async" style={{ objectPosition: g.pos }} />
                <figcaption><b>{de ? g.de : g.en}</b><span>{de ? g.factDe : g.factEn}</span></figcaption>
              </figure>
            ))}
          </div>
          <p className="wxp-gcount" aria-hidden>{slide + 1} / {copy.gallery.length}</p>
        </div>

        <aside className="wxp-buy" aria-label={de ? 'Kaufen' : 'Buy'}>
          <p className="eyebrow wxp-eyebrow">
            {de ? 'Werkzeug' : 'Tool'} · {de ? 'fürs Wachsbad' : 'for the wax bath'}
            <span className="wxp-stock">{de ? 'Auf Lager' : 'In stock'}</span>
          </p>
          <h1>{title}</h1>
          <p className="wxp-lede">{de ? acc.description : acc.descriptionEn}</p>

          <div className="wxp-card wxp-pricecard wxs-pricecard">
            <div className="wxp-pricetop">
              <p className="wxp-price">{eur(acc.price, de).replace(' €', '')}<span style={{ fontSize: 22, marginLeft: 3, color: 'var(--tx2)', fontWeight: 600 }}>€</span></p>
              {shipping && <span className="wxs-shipcost"><Truck aria-hidden />{shipping}</span>}
            </div>
            <div className="wxp-stack">
              {copy.tiles.map((x) => (
                <div key={x.de}><div className="v">{de ? x.v : x.vEn ?? x.v}</div><div className="k">{de ? x.de : x.en}</div></div>
              ))}
            </div>
            <p className="wxc-boxtitle">{de ? 'Das bekommst du' : 'What you get'}</p>
            <ul className="wxc-box">
              <li><Ico name="check" /><span><b>{de ? copy.box.de : copy.box.en}</b>{de ? copy.box.subDe : copy.box.subEn}</span></li>
            </ul>
            {acc.ebayUrl ? (
              <a className="wxp-cta" href={acc.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(acc.id)}>
                {de ? 'Einzeln bestellen' : 'Order on its own'}
                <Ico name="arrow" className="wxp-ico" style={{ width: 16, height: 16 }} />
              </a>
            ) : (
              <p className="text-center text-[13.5px] font-semibold py-3 rounded-full" style={{ color: 'var(--txm)', background: 'var(--sf2)' }}>
                {de ? 'Einzeln bald auf eBay' : 'Soon on eBay on its own'}
              </p>
            )}
            <div className="wxp-legal"><PriceNote de={de} t={t} shipping={acc.shippingCost ? (de ? `Zuzüglich ${eur(acc.shippingCost, de)} Versand` : `Plus ${eur(acc.shippingCost, de)} shipping`) : undefined} /></div>
          </div>

          {/* Der günstigere Weg: im Set, ohne Versandkosten */}
          <Link to="/starter-set" className="wxs-setoffer">
            <span className="ic"><PackageCheck className="h-5 w-5" aria-hidden /></span>
            <span className="tx">
              <b>{de ? 'Im Starter-Set günstiger' : 'Better value in the starter set'}</b>
              <span>{de ? `Mit Wachs und ${acc.id === 'acc-wire' ? 'Zange' : 'Draht'} · bis −${PCT} % · Versand kostenlos` : `With wax and ${acc.id === 'acc-wire' ? 'pliers' : 'wire'} · up to −${PCT} % · free shipping`}</span>
            </span>
            <span className="pr num">{de ? 'ab' : 'from'} {eur(SET_FROM, de)}</span>
          </Link>

          <div className="wxp-trust">
            <div><Ico name="calendar" /><span><b>{getEstimatedDelivery(de ? 'de' : 'en')}</b>{de ? 'voraussichtlich bei dir' : 'estimated delivery'}</span></div>
            <div><Ico name="pin" /><span><b>Stuttgart</b>{de ? 'Versand' : 'ships from'}</span></div>
            <div><Ico name="shield" /><span><b>{de ? '14 Tage' : '14 days'}</b>{de ? 'Rückgabe, unbenutzt' : 'return, unused'}</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
