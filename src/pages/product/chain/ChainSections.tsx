import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/data';
import { products, cheapestChainIds, canCheckout, isSoldOut } from '@/lib/data';
import type { RichContent } from '@/lib/productContent';
import { GPSR_MANUFACTURER } from '@/components/GpsrInfo';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick } from '@/lib/analytics';
import { use3DReveal } from '@/hooks/useAnimation';
import { PRICE, TEN_CARD, eur } from '@/pages/rewax/content';
import { ChapterHead } from '../wax/WaxSections';
import { Ico } from '../wax/Ico';
import { chainCopy } from './content';

// Kapitel der Kettenseite, die es auf der Wachsseite nicht gibt. Gleiche
// Grammatik (wxp-*), Kettenspezifisches in chain.css (wxc-*). Karten-Gruppen
// kommen per use3DReveal (useAnimation.ts, dasselbe Muster wie auf der
// Startseite) gestaffelt herein; prefers-reduced-motion schaltet das ab.

/** "11-fach" → "11" */
const speedNum = (p: Product) => (p.chainSpeed ?? '').replace(/\D+/g, '');

/** Aussenbreite je Gangzahl, gerundete Richtwerte (Shimano-Angabe CN-HG93:
 *  6,6 mm; uebrige nach BikeGremlin-Masstabelle, 15.09.2026 geprueft). */
const CHAIN_WIDTHS: { speed: string; mm: number }[] = [
  { speed: '9', mm: 6.6 }, { speed: '10', mm: 5.9 }, { speed: '11', mm: 5.6 }, { speed: '12', mm: 5.3 },
];

// ── Kapitel · Was wir damit machen ─────────────────────────────────────────
// Der Teil, den der Kaeufer einer vorgewachsten Kette nie sieht und fuer den
// er bezahlt. Aus der eBay-Beschreibung, mit dem Wachsbad-Foto der Rewax-Seite.
// Vier Schritte als verbundene Zeitleiste: es ist eine Reihenfolge, keine
// Liste gleichrangiger Punkte.
export function ChainProcess({ de, n }: { de: boolean; n: string }) {
  const c = chainCopy(de).process;
  const stepsRef = useRef<HTMLOListElement>(null);
  use3DReveal(stepsRef, { stagger: 0.12 });
  return (
    <section className="wxp-chapter">
      <div className="wxp-wrap">
        <ChapterHead n={n} title={c.title} lede={c.lede} />
        <figure className="wxc-procimg">
          <img src="/images/rewax/step-2.webp" alt={c.imgAlt} loading="lazy" decoding="async" />
          <figcaption><b>{c.imgCap}</b><span>{c.imgCapSub}</span></figcaption>
        </figure>
        <ol className="wxc-steps" ref={stepsRef}>
          {c.steps.map((s, i) => (
            <li key={s.t} data-card>
              <span className="node" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              <b>{s.t}</b>
              <p>{s.b}</p>
            </li>
          ))}
        </ol>
        <div className="wxc-procfoot">
          <div className="wxp-card wxc-list">
            <span className="lbl2">{c.cleanTitle}</span>
            <ul>
              {c.clean.map((s, i) => (
                <li key={s.t}><span className="k">{i + 1}</span><div><b>{s.t}</b><p>{s.b}</p></div></li>
              ))}
            </ul>
          </div>
          <div className="wxc-note">
            <p><b>{c.note}</b> {c.noteRest}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Kapitel · Passt sie an dein Rad? ───────────────────────────────────────
// Pendant zu "Welches Wachs passt zu dir?": erst die Passung, dann ehrlich die
// Grenze (andere Gangzahlen, mit der Breite als Grund), dann die Geschwister
// derselben Gangzahl.
export function ChainFit({ product, rc, de, n }: { product: Product; rc: RichContent | undefined; de: boolean; n: string }) {
  const c = chainCopy(de).fit;
  const own = speedNum(product);
  const speed = product.chainSpeed ?? '';
  const [drive = [], bikes = []] = rc?.compatTags ?? [];
  const riding = bikes.filter(t => !/fach$/.test(t));
  const others = ['9', '10', '11', '12'].filter(s => s !== own);
  const othersText = `${others.slice(0, -1).join(', ')} ${de ? 'oder' : 'or'} ${others[others.length - 1]}`;
  const siblings = products.filter(p => p.category === 'chain' && p.id !== product.id && p.chainSpeed === product.chainSpeed);
  const fmt = (x: number) => x.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2 });
  const maxMm = Math.max(...CHAIN_WIDTHS.map(w => w.mm));
  const sibsRef = useRef<HTMLUListElement>(null);
  use3DReveal(sibsRef, { stagger: 0.08 });

  return (
    <section className="wxp-chapter" id="passung">
      <div className="wxp-wrap">
        <ChapterHead n={n} title={c.title} lede={c.lede} />
        <div className="wxp-specs">
          <div className="wxp-card wxp-fit">
            <span className="lbl2">{c.drive}</span>
            <div className="wxp-chips">{drive.map(t => <span key={t}>{t}</span>)}</div>
            {riding.length > 0 && <>
              <span className="lbl2">{c.bikes}</span>
              <div className="wxp-chips">{riding.map(t => <span key={t}>{t}</span>)}</div>
            </>}
            <div className="wxc-widths" role="img" aria-label={`${c.widthTitle}: ${CHAIN_WIDTHS.map(w => `${w.speed}-${de ? 'fach' : 'speed'} ca. ${w.mm.toLocaleString(de ? 'de-DE' : 'en-US')} mm`).join(', ')}`}>
              <span className="lbl2">{c.widthTitle}</span>
              {CHAIN_WIDTHS.map(w => (
                <div key={w.speed} className={`row${w.speed === own ? ' own' : ''}`} aria-hidden>
                  <span className="sp">{w.speed}-{de ? 'fach' : 'sp.'}</span>
                  <span className="bar"><i style={{ width: `${(w.mm / maxMm) * 100}%` }} /></span>
                  <span className="mm num">≈ {w.mm.toLocaleString(de ? 'de-DE' : 'en-US')} mm{w.speed === own && <em>{c.widthOwn}</em>}</span>
                </div>
              ))}
              <p className="note">{c.widthNote}</p>
            </div>
            <div className="wxp-goodbad">
              <div>
                <span className="d ok" aria-hidden>✓</span>
                <div><b>{c.good}</b>{c.goodBody(speed, product.compatibility ?? '')}</div>
              </div>
              <div>
                <span className="d no" aria-hidden>✕</span>
                <div><b>{c.no}</b>{c.noBody(othersText, product.chainModel ?? '', speed)}</div>
              </div>
            </div>
          </div>
          <div className="wxp-card wxp-fit">
            <span className="lbl2">{siblings.length > 0 ? c.siblings(speed) : c.allChains.replace(' →', '')}</span>
            {siblings.length > 0 && (
              <ul className="wxc-sibs" ref={sibsRef}>
                {siblings.map(p => (
                  <li key={p.id} data-card>
                    <Link to={`/produkt/${p.id}`}>
                      <img src={p.image} alt="" loading="lazy" decoding="async" />
                      <span className="tx">
                        <b>{p.chainBrand} {p.chainModel}</b>
                        <span>{de ? p.chainLinks : p.chainLinks?.replace('Glieder', 'links')}
                          {cheapestChainIds.has(p.id) && <> · <em>{c.cheapest}</em></>}
                          {isSoldOut(p) && <> · {c.soldOut}</>}</span>
                      </span>
                      <span className="pr num">{fmt(p.price)} €</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link className="wxc-all" to={own ? `/ketten?gang=${own}` : '/ketten'}>{siblings.length > 0 ? c.all(speed) : c.allChains}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Kapitel · Daten, Einbau, Grenzen ───────────────────────────────────────
export function ChainData({ product, rc, de, n }: { product: Product; rc: RichContent | undefined; de: boolean; n: string }) {
  const c = chainCopy(de).data;
  const spec = Object.entries(rc?.chainSpec ?? {});
  return (
    <section className="wxp-chapter wxp-graybg">
      <div className="wxp-wrap">
        <ChapterHead n={n} title={c.title} lede={c.lede} />
        <div className="wxp-specs">
          <div className="wxp-card" style={{ padding: 20 }}>
            <table className="wxp-stable"><tbody>
              {spec.map(([l, v]) => <tr key={l}><td>{l}</td><td>{v}</td></tr>)}
              <tr><td>{c.wax}</td><td>{c.waxV}</td></tr>
              <tr><td>{c.interval}</td><td>{c.intervalV}</td></tr>
              <tr><td>{c.shipping}</td><td>{c.shippingV}</td></tr>
              {/* GPSR Art. 19: die Kette baut der Hersteller, in Verkehr
                  bringt sie nach der Wachsbehandlung Waxcelerate. */}
              <tr><td>{c.maker}</td><td>{product.chainBrand}</td></tr>
              <tr className="mfr"><td>{c.treat}</td><td>{GPSR_MANUFACTURER}</td></tr>
            </tbody></table>
          </div>
          <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
            {rc?.chainCompRows && (
              <div className="wxp-card wxc-cmp">
                <span className="lbl2">{c.cmpTitle}</span>
                <table>
                  <thead><tr><th /><th className="win"><span className="wxp-pill">{c.cmpWax}</span></th><th className="lose">{c.cmpOil}</th></tr></thead>
                  <tbody>
                    {rc.chainCompRows.map(r => (
                      <tr key={r.label}><th scope="row">{r.label}</th><td className="win">{r.good}</td><td className="lose">{r.bad}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="wxp-card wxc-list">
              <span className="lbl2">{c.installTitle}</span>
              <ul>
                {c.install.map((s, i) => (
                  <li key={s.t}><span className="k">{i + 1}</span><div><b>{s.t}</b><p>{s.b}</p></div></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Wenn das Wachs nachlaesst ──────────────────────────────────────────────
// Preise aus der Rewax-Seite, nie aus dem eBay-Text: eine Quelle.
export function ChainAfter({ de }: { de: boolean }) {
  const c = chainCopy(de).after;
  const card = eur(TEN_CARD.price / TEN_CARD.count, de);
  const pathsRef = useRef<HTMLDivElement>(null);
  use3DReveal(pathsRef, { stagger: 0.1 });
  return (
    <section className="wxp-chapter">
      <div className="wxp-wrap">
        <ChapterHead n={c.n} title={c.title} lede={c.lede} />
        <div className="wxp-two" ref={pathsRef}>
          <div className="wxp-card wxp-path wxc-lift" data-card>
            <span className="lbl2">{c.self}</span>
            <h3>{c.selfT}</h3>
            <p>{c.selfB}</p>
            <Link to="/produkt/wax-500-mos2">{c.selfCta}</Link>
          </div>
          <div className="wxp-card wxp-path wxc-lift" data-card>
            <span className="lbl2">{c.send}</span>
            <h3>{c.sendT}</h3>
            <p>{c.sendB(eur(PRICE.rewax.single, de), card)}</p>
            <Link to="/kette-wachsen-lassen">{c.sendCta}</Link>
          </div>
        </div>
        <div className="wxc-green">
          <div className="hd">
            <span className="ic"><Ico name="check" /></span>
            <div><b>{c.greenTitle}</b><span>{c.greenSub}</span></div>
          </div>
          <ul>
            {c.green.map(g => <li key={g.t}><b>{g.t}</b>{g.b}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Schluss ────────────────────────────────────────────────────────────────
export function ChainClosing({ product, de, titleText }: { product: Product; de: boolean; titleText: string }) {
  const c = chainCopy(de);
  const fmt = (x: number) => x.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2 });
  return (
    <section className="wxp-close pdp-dark">
      <img src="/images/blog/chains-hanging-gold-1600.webp" alt="" loading="lazy" decoding="async" />
      <div className="wxp-wrap">
        <div>
          <h2>{c.close.title}</h2>
          <p>{c.close.sub}</p>
        </div>
        <div className="box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <p className="wxp-price">{fmt(product.price)}<span style={{ fontSize: 20, marginLeft: 3, opacity: .75 }}>€</span></p>
            <span className="wxp-ship"><Ico name="truck" />{de ? 'Versand kostenlos' : 'Free shipping'}</span>
          </div>
          <p style={{ marginTop: 6, fontSize: 13 }}>{titleText}</p>
          {isSoldOut(product)
            ? <p style={{ marginTop: 16, fontWeight: 600 }}>{c.soldOut}</p>
            : canCheckout(product)
              ? <div style={{ marginTop: 16 }}><AddToCartButton product={product} fullWidth /></div>
              : <a className="wxp-cta" href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}>{c.orderNow}</a>}
        </div>
      </div>
    </section>
  );
}
