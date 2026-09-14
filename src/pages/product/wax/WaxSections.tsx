import { Link } from 'react-router-dom';
import type { Product } from '@/lib/data';
import { getProductById, trustStats, bundleOffer, canCheckout, isSoldOut } from '@/lib/data';
import { waxChooserRows, type ChooserCell, type RichContent } from '@/lib/productContent';
import { REVIEWS, type Review } from '@/sections/reviews';
import { Stars } from '@/components/Stars';
import { GpsrInfo } from '@/components/GpsrInfo';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick, trackFormulaCompare } from '@/lib/analytics';
import { WAX_TOPICS } from '@/pages/product/faqTopics';
import type { useLanguage } from '@/hooks/useLanguage';
import { Ico } from './Ico';

type T = ReturnType<typeof useLanguage>['t'];

function ChapterHead({ n, title, lede }: { n: string; title: string; lede?: string }) {
  return (
    <div className="wxp-chead">
      <p className="eyebrow">{n}</p>
      <h2>{title}</h2>
      {lede && <p>{lede}</p>}
    </div>
  );
}

// ── Kapitel 05 · Welches Wachs passt zu dir? ───────────────────────────────
// Kontrast-Effekt mit Ehrlichkeit: die Spalte dieser Seite ist getoent, Oel
// grau, "enthaelt PTFE" steht offen da. Das Urteil darunter entscheidet fuer
// den Leser, ohne ihn von der Seite zu schicken.
function Cell({ c, de }: { c: ChooserCell; de: boolean }) {
  const text = de ? c.text : c.textEn;
  return c.kind ? <span className={`wxp-${c.kind}`}>{text}</span> : <>{text}</>;
}

export function WhichWax({ product, de }: { product: Product; de: boolean }) {
  const isPro = product.variant === 'pro';
  const size = product.weight === '300g' ? '300' : '500';
  const classic = getProductById(size === '300' ? 'wax-300' : 'wax-500');
  const pro = getProductById(size === '300' ? 'wax-300-mos2' : 'wax-500-mos2');
  const fmt = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2 });
  const cols = [
    { key: 'classic' as const, p: classic, name: 'Classic', here: !isPro },
    { key: 'pro' as const, p: pro, name: 'Pro MoS₂', here: isPro },
  ];
  const other = cols.find(c => !c.here)!;

  return (
    <section className="wxp-chapter" id="welches">
      <div className="wxp-wrap">
        <ChapterHead n={de ? 'Kapitel 05' : 'Chapter 05'} title={de ? 'Welches Wachs passt zu dir?' : 'Which wax suits you?'}
          lede={de ? 'Ehrlich verglichen, auch mit dem, was du gerade benutzt.' : 'An honest comparison, including what you use today.'} />
        <div className="wxp-cmp-wrap">
          <div className="wxp-card wxp-cmp">
            <table>
              <thead>
                <tr>
                  <th />
                  {cols.map(c => (
                    <th key={c.key} className={c.here ? 'win' : 'mid'}>
                      {c.here && <span className="wxp-pill">{de ? 'Diese Seite' : 'This page'}</span>}
                      <span className={`wxp-hname${c.here ? '' : ' m'}`}>
                        {c.here || !c.p ? c.name : <Link to={`/produkt/${c.p.id}`} onClick={() => trackFormulaCompare(product.id)}>{c.name}</Link>}
                      </span>
                      {c.p && <span className="wxp-hprice">{c.p.weight?.replace('g', ' g')} · {fmt(c.p.price)} €</span>}
                    </th>
                  ))}
                  <th className="lose"><span className="wxp-hname m" style={{ color: 'var(--txf)' }}>{de ? 'Kettenöl' : 'Chain oil'}</span><span className="wxp-hprice">{de ? 'zum Vergleich' : 'for comparison'}</span></th>
                </tr>
              </thead>
              <tbody>
                {waxChooserRows.map(r => (
                  <tr key={r.label}>
                    <td className="rl">{de ? r.label : r.labelEn}</td>
                    {cols.map(c => <td key={c.key} className={c.here ? 'win' : 'mid'}><Cell c={r[c.key]} de={de} /></td>)}
                    <td className="lose"><Cell c={r.oil} de={de} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="wxp-verdict">
          <div className="vy pdp-dark">
            <b>{isPro ? (de ? 'Nimm Pro, wenn …' : 'Choose Pro if …') : (de ? 'Nimm Classic, wenn …' : 'Choose Classic if …')}</b>
            {isPro
              ? (de ? 'du oft bei Nässe oder im Winter fährst, ein E-Bike hast oder PFAS-frei willst.' : 'you often ride in the wet or in winter, ride an e-bike or want PFAS-free.')
              : (de ? 'du überwiegend trocken fährst und günstig einsteigen willst. Für die meisten der einzige Block, den sie je brauchen.' : 'you mostly ride dry and want an affordable start. For most riders the only block they will ever need.')}
          </div>
          <div className="vn">
            <b>{isPro ? (de ? 'Nimm Classic, wenn …' : 'Choose Classic if …') : (de ? 'Nimm Pro, wenn …' : 'Choose Pro if …')}</b>
            {isPro
              ? (de ? 'du fast nur trocken fährst und den günstigeren Block willst. ' : 'you ride almost only in the dry and want the cheaper block. ')
              : (de ? 'du oft bei Nässe oder im Winter fährst, ein E-Bike hast oder PFAS-frei willst. ' : 'you often ride in the wet or in winter, ride an e-bike or want PFAS-free. ')}
            {other.p && <Link to={`/produkt/${other.p.id}`} onClick={() => trackFormulaCompare(product.id)}>{other.name} {de ? 'ansehen →' : 'view →'}</Link>}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Kapitel 06 · Was Fahrer sagen ──────────────────────────────────────────
// Getaggte Bewertungen zuerst, dann die fuer alle Wachsseiten freigegebenen
// (fallback). Die erste mit Kundenfoto wird das grosse Zitat.
function reviewsFor(productId: string): Review[] {
  const tagged = REVIEWS.filter(r => r.productIds?.includes(productId));
  const general = REVIEWS.filter(r => r.fallback && !tagged.includes(r));
  return [...tagged, ...general].slice(0, 3);
}

export function pickProofQuote(productId: string): Review | undefined {
  return reviewsFor(productId).find(r => r.photo);
}

function Who({ r, de, photo }: { r: Review; de: boolean; photo?: boolean }) {
  const verified = r.source === 'web' ? (de ? 'Verifizierter Käufer' : 'Verified buyer') : (de ? '✓ eBay verifiziert' : '✓ eBay verified');
  return (
    <figcaption className="wxp-who">
      {photo && r.photo && <img src={r.photo.replace(/\.jpg$/, '.webp')} alt="" loading="lazy" decoding="async" />}
      <b>{r.name}</b><span className="wxp-ver">{verified}</span><span>· {de ? r.dateDe : r.dateEn}</span>
    </figcaption>
  );
}

export function WaxReviews({ productId, de }: { productId: string; de: boolean }) {
  const list = reviewsFor(productId);
  const big = list.find(r => r.photo) ?? list[0];
  const rest = list.filter(r => r !== big).slice(0, 2);
  if (!big) return null;
  return (
    <section className="wxp-chapter" id="stimmen" style={{ paddingTop: 24 }}>
      <div className="wxp-wrap">
        <ChapterHead n={de ? 'Kapitel 06' : 'Chapter 06'} title={de ? 'Was Fahrer sagen.' : 'What riders say.'} />
        <div className="wxp-rv-grid">
          <figure className="wxp-card wxp-rv-big pdp-dark">
            {big.photo && <div className="ph"><img src={big.photo.replace(/\.jpg$/, '.webp')} alt={de ? 'Kundenfoto' : 'Customer photo'} loading="lazy" decoding="async" style={{ objectPosition: big.photoPos ?? '50% 50%' }} /></div>}
            <div className="tx">
              <Stars rating={big.rating ?? 5} color="#F5A623" emptyColor="rgba(255,255,255,.2)" />
              <blockquote>„{de ? big.textDe : big.textEn}“</blockquote>
              <Who r={big} de={de} />
            </div>
          </figure>
          <div className="wxp-rv-side">
            {rest.map(r => (
              <figure key={r.name} className="wxp-card wxp-rv">
                <Stars rating={r.rating ?? 5} color="#F5A623" />
                <blockquote>„{de ? r.textDe : r.textEn}“</blockquote>
                <Who r={r} de={de} photo />
              </figure>
            ))}
          </div>
        </div>
        <div className="wxp-rv-stats">
          <div><div className="v num">{trustStats.reviews}</div><div className="k">{de ? 'Bewertungen' : 'reviews'}</div></div>
          <div><div className="v num">100 %</div><div className="k">{de ? 'positiv' : 'positive'}</div></div>
          <div><div className="v num">{trustStats.sold}+</div><div className="k">{de ? 'verkauft' : 'sold'}</div></div>
          <p>{de ? 'Kontoweit auf eBay, nicht nur dieses Produkt. 2025 auf der Hauptbühne des eBay-Seller-Events in San José.' : 'Account-wide on eBay, not only this product. On the main stage of the eBay seller event in San José, 2025.'}</p>
        </div>
      </div>
    </section>
  );
}

// ── Kapitel 07 · Daten, Passung, Grenzen ───────────────────────────────────
export function DataFitLimits({ product, rc, specs, de }: { product: Product; rc: RichContent | undefined; specs: { l: string; v: string }[]; de: boolean }) {
  const isPro = product.variant === 'pro';
  const [brands, , bikes] = rc?.compatTags ?? [];
  const drive = [product.compatibility, ...(brands ?? [])].filter(Boolean) as string[];
  const riding = (bikes ?? []).filter(t => !/fach$/.test(t));
  return (
    <section className="wxp-chapter wxp-graybg">
      <div className="wxp-wrap">
        <ChapterHead n={de ? 'Kapitel 07' : 'Chapter 07'} title={de ? 'Daten, Passung, Grenzen.' : 'Specs, fit, limits.'}
          lede={de ? 'Alles, was du vor dem Kauf prüfen willst, auch wofür der Block nicht taugt.' : 'Everything to check before buying, including what the block is not for.'} />
        <div className="wxp-specs">
          <div className="wxp-card" style={{ padding: 20 }}>
            <table className="wxp-stable"><tbody>
              {specs.map(s => <tr key={s.l}><td>{s.l}</td><td>{s.v}</td></tr>)}
              {product.intervalDry && <tr><td>{de ? 'Intervall trocken' : 'Interval, dry'}</td><td>{product.intervalDry}{de ? ', empfohlen ~300' : ', recommended ~300'}</td></tr>}
              {product.intervalWet && <tr><td>{de ? 'Intervall nass' : 'Interval, wet'}</td><td>{product.intervalWet}</td></tr>}
              <tr><td>{de ? 'Versand' : 'Shipping'}</td><td>{de ? 'kostenlos, werktags bis 15 Uhr am selben Tag' : 'free, same day on weekdays until 3 pm'}</td></tr>
            </tbody></table>
            {rc?.formulaDetails && (
              <details className="wxp-acc">
                <summary>{de ? 'Formel & Inhaltsstoffe' : 'Formula & ingredients'}</summary>
                <div>
                  {rc.formulaDetails.map(f => <p key={f.name} style={{ marginBottom: 10 }}><b style={{ color: 'var(--tx1)' }}>{f.name}.</b> {f.detail}</p>)}
                  {rc.techNote && <p><b style={{ color: 'var(--tx1)' }}>{rc.techNote.title}.</b> {rc.techNote.body}</p>}
                </div>
              </details>
            )}
          </div>
          <div className="wxp-card wxp-fit">
            <span className="lbl2">{de ? 'Antrieb' : 'Drivetrain'}</span>
            <div className="wxp-chips">{drive.map(t => <span key={t}>{t}</span>)}</div>
            {riding.length > 0 && <>
              <span className="lbl2">{de ? 'Räder' : 'Bikes'}</span>
              <div className="wxp-chips">{riding.map(t => <span key={t}>{t}</span>)}</div>
            </>}
            <div className="wxp-limit">
              <span className="wxp-xdot" aria-hidden>✕</span>
              <div><b>{de ? 'Nicht gedacht für' : 'Not meant for'}</b>
                {isPro
                  ? (de ? 'Kettenöl-Nachschmieren zwischendurch: Öl auf gewachster Kette macht den Film kaputt. Erst neu wachsen.' : 'Topping up with oil in between: oil on a waxed chain ruins the film. Rewax instead.')
                  : (de ? 'Dauerregen und Winterpendeln. Da hält Classic kürzer, dafür gibt es Pro.' : 'Constant rain and winter commuting. Classic lasts shorter there, that is what Pro is for.')}
              </div>
            </div>
            <div style={{ marginTop: 18 }}><GpsrInfo de={de} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Wenn der Block leer ist · FAQ · Schluss ────────────────────────────────
export function WhenEmpty({ product, de }: { product: Product; de: boolean }) {
  const offer = bundleOffer(product);
  const fmt = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2 });
  return (
    <section className="wxp-chapter">
      <div className="wxp-wrap">
        <ChapterHead n={de ? 'Wenn der Block leer ist' : 'When the block runs out'} title={de ? 'Zwei Wege danach.' : 'Two ways on.'} />
        <div className="wxp-two">
          <div className="wxp-card wxp-path">
            <span className="lbl2">{de ? 'Selbst' : 'Yourself'}</span>
            <h3>{de ? 'Nachbestellen' : 'Reorder'}</h3>
            <p>{de ? 'Mehrere Blöcke auf einmal werden günstiger: 2 Stück 5 %, 3 Stück 10 %, ab 4 Stück 15 %. Kühl, trocken und dunkel gelagert wird Wachs nicht schlecht.' : 'Several blocks at once get cheaper: 2 pcs 5 %, 3 pcs 10 %, 4 or more 15 %. Stored cool, dry and dark, wax does not go off.'}</p>
            {offer && !isSoldOut(product) && !canCheckout(product) && (
              <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}>
                {offer.qty} × {product.weight?.replace('g', ' g')} {de ? 'für' : 'for'} {fmt(offer.total)} € →
              </a>
            )}
          </div>
          <div className="wxp-card wxp-path">
            <span className="lbl2">{de ? 'Oder' : 'Or'}</span>
            <h3>{de ? 'Einschicken' : 'Send it in'}</h3>
            <p>{de ? 'Kette am Quick-Link öffnen, einschicken, fahrbereit zurückbekommen. Reinigen musst du vorher nichts.' : 'Open the chain at the quick link, send it in, get it back ready to ride. No cleaning needed first.'}</p>
            <Link to="/kette-wachsen-lassen">{de ? 'Wie das Einschicken läuft →' : 'How sending it in works →'}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WaxFaq({ de, t }: { de: boolean; t: T }) {
  const items = (t.faq.items ?? []).filter(item => WAX_TOPICS.some(topic => item.q.includes(topic)));
  if (items.length === 0) return null;
  return (
    <section className="wxp-chapter" style={{ paddingTop: 24 }}>
      <div className="wxp-wrap wxp-faq-grid">
        <div>
          <ChapterHead n={de ? 'Aus der Praxis' : 'From practice'} title={de ? 'Häufige Fragen.' : 'Common questions.'} />
          <div className="wxp-card wxp-ask">
            <b>{de ? 'Noch eine Frage?' : 'Another question?'}</b>
            <p>{de ? 'Schreib über eBay oder das Kontaktformular. Die Antwort kommt von den Leuten, die das Wachs gießen.' : 'Write via eBay or the contact form. The answer comes from the people who cast the wax.'}{' '}
              <Link to="/kontakt" style={{ color: 'var(--accent-soft)', fontWeight: 600 }}>{de ? 'Kontakt →' : 'Contact →'}</Link></p>
          </div>
        </div>
        <div>
          {items.map(item => (
            <details key={item.q} className="wxp-acc" style={{ marginTop: 10 }}>
              <summary>{item.q}</summary>
              <div>{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WaxClosing({ product, de, titleText }: { product: Product; de: boolean; titleText: string }) {
  const fmt = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2 });
  return (
    <section className="wxp-close pdp-dark">
      <img src="/images/blog/chains-hanging-gold-1600.webp" alt="" loading="lazy" decoding="async" />
      <div className="wxp-wrap">
        <div>
          <h2>{de ? 'Saubere Kette ab dem ersten Wachsgang.' : 'A clean chain from the first waxing.'}</h2>
          <p>{de ? 'Frisch gegossen in Stuttgart · werktags bis 15 Uhr bestellt, am selben Tag versandt' : 'Freshly cast in Stuttgart · weekday orders by 3 pm ship the same day'}</p>
        </div>
        <div className="box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <p className="wxp-price">{fmt(product.price)}<span style={{ fontSize: 20, marginLeft: 3, opacity: .75 }}>€</span></p>
            <span className="wxp-ship"><Ico name="truck" />{de ? 'Versand kostenlos' : 'Free shipping'}</span>
          </div>
          <p style={{ marginTop: 6, fontSize: 13 }}>{titleText}</p>
          {isSoldOut(product) ? null : canCheckout(product)
            ? <div style={{ marginTop: 16 }}><AddToCartButton product={product} fullWidth /></div>
            : <a className="wxp-cta" href={product.ebayUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEbayClick(product.id)}>{de ? 'Jetzt bestellen' : 'Order now'}</a>}
        </div>
      </div>
    </section>
  );
}
