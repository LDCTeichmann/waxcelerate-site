import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/data';
import { getProductById, trustStats, bundleOffer, canCheckout, isSoldOut } from '@/lib/data';
import { waxChooserRows, type ChooserCell, type RichContent } from '@/lib/productContent';
import { REVIEWS, REVIEW_PHOTOS, photoCredit, photoAlt, type Review } from '@/sections/reviews';
import { Stars } from '@/components/Stars';
import { GPSR_MANUFACTURER } from '@/components/GpsrInfo';
import { trackEbayClick, trackFormulaCompare } from '@/lib/analytics';
import { WAX_TOPICS, CHAIN_TOPICS } from '@/pages/product/faqTopics';
import type { useLanguage } from '@/hooks/useLanguage';

type T = ReturnType<typeof useLanguage>['t'];

export function ChapterHead({ n, title, lede }: { n: string; title: string; lede?: string }) {
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

// Luca, 26.09.2026: kein eigenes Kapitel mehr, sondern ein schmales Band
// "Classic oder Pro?" mit Knopf; die Tabelle klappt erst auf Wunsch auf.
// openCompare() oeffnet sie von aussen (Hinweis in der Kaufbox) und scrollt hin.
export function openCompare() {
  window.dispatchEvent(new CustomEvent('wxp-compare'));
}

export function WhichWax({ product, de }: { product: Product; de: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const onEvent = () => {
      setOpen(true);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => ref.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }), 60);
    };
    window.addEventListener('wxp-compare', onEvent);
    return () => window.removeEventListener('wxp-compare', onEvent);
  }, []);
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
    <section className="wxp-cmp-band" id="welches" ref={ref}>
      <div className="wxp-wrap">
        <div className="wxp-card wxp-cmp-bar">
          <div>
            <p className="t">{de ? 'Classic oder Pro?' : 'Classic or Pro?'}</p>
            <p className="s">{de ? 'Beide Wachse und Kettenöl nebeneinander, ehrlich verglichen.' : 'Both waxes and chain oil side by side, honestly compared.'}</p>
          </div>
          <button type="button" className="wxp-cmp-toggle" aria-expanded={open} aria-controls="welches-tabelle"
            onClick={() => { if (!open) trackFormulaCompare(product.id); setOpen(o => !o); }}>
            {open ? (de ? 'Vergleich schließen' : 'Hide comparison') : (de ? 'Vergleich anzeigen' : 'Show comparison')}
            <span aria-hidden className="chev" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
        </div>
        {open && (<div id="welches-tabelle" className="wxp-cmp-open">
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
                    <th scope="row" className="rl">{de ? r.label : r.labelEn}</th>
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
              ? (de ? 'du oft bei Nässe oder Kälte fährst, ein E-Bike hast oder PFAS-frei willst. Dort hält Pro länger als Classic.' : 'you often ride in the wet or cold, ride an e-bike or want PFAS-free. Pro lasts longer there than Classic.')
              : (de ? 'du überwiegend trocken fährst und günstig einsteigen willst. Classic geht das ganze Jahr, bei Nässe wachst du nur öfter.' : 'you mostly ride dry and want an affordable start. Classic works all year, in the wet you simply rewax more often.')}
          </div>
          <div className="vn">
            <b>{isPro ? (de ? 'Nimm Classic, wenn …' : 'Choose Classic if …') : (de ? 'Nimm Pro, wenn …' : 'Choose Pro if …')}</b>
            {isPro
              ? (de ? 'du fast nur trocken fährst und den günstigeren Block willst. ' : 'you ride almost only in the dry and want the cheaper block. ')
              : (de ? 'du oft bei Nässe oder Kälte fährst, ein E-Bike hast oder PFAS-frei willst. ' : 'you often ride in the wet or cold, ride an e-bike or want PFAS-free. ')}
            {other.p && <Link to={`/produkt/${other.p.id}`} onClick={() => trackFormulaCompare(product.id)}>{other.name} {de ? 'ansehen →' : 'view →'}</Link>}
          </div>
        </div>
        </div>)}
      </div>
    </section>
  );
}

// ── Kapitel 06 · Was Fahrer sagen ──────────────────────────────────────────
// Getaggte Bewertungen zuerst (die ausfuehrlichste vorn, sie wird das grosse
// Zitat), dann die fuer alle Seiten freigegebenen (fallback).
// Kettenseite (chain): zwischen beide kommen die Bewertungen zu anderen Ketten
// und die zu einer gewachsten Kette ohne bekanntes Modell (chainGeneral), damit
// dort Kettenkaeufer sprechen statt Wachskaeufer.
function reviewsFor(productId: string, chain = false): Review[] {
  const byLength = (a: Review, b: Review) => b.textDe.length - a.textDe.length;
  const tagged = REVIEWS.filter(r => r.productIds?.includes(productId)).sort(byLength);
  const chainPool = chain
    ? REVIEWS.filter(r => !tagged.includes(r) && (r.chainGeneral || r.productIds?.some(id => id.startsWith('chain-')))).sort(byLength)
    : [];
  const general = REVIEWS.filter(r => r.fallback && !tagged.includes(r) && !chainPool.includes(r));
  return [...tagged, ...chainPool, ...general].slice(0, 3);
}

// Proof-Leiste: bevorzugt ein Zitat, dessen erster Satz vollstaendig in die
// Leiste passt (25–90 Zeichen), sonst das erste mit Substanz.
export function pickProofQuote(productId: string, chain = false): Review | undefined {
  const pool = [...reviewsFor(productId, chain), ...REVIEWS];
  const firstLen = (r: Review) => (r.textDe.split(/(?<=[.!?…])\s/)[0] ?? '').length;
  return pool.find(r => r.productIds?.includes(productId) && firstLen(r) >= 25 && firstLen(r) <= 90)
    ?? reviewsFor(productId, chain).find(r => r.textDe.length >= 40) ?? pool[0];
}

// Stimmungsfoto fuer die grosse Karte: fest je Produkt, damit Wachs- und
// Kettenseiten nicht alle dasselbe Bild zeigen.
const photoFor = (productId: string) =>
  REVIEW_PHOTOS[[...productId].reduce((a, ch) => a + ch.charCodeAt(0), 0) % REVIEW_PHOTOS.length];

function Who({ r, de, about }: { r: Review; de: boolean; about?: string }) {
  const verified = de ? '✓ eBay verifiziert' : '✓ eBay verified';
  return (
    <figcaption className="wxp-who">
      <b>{r.name}</b><span className="wxp-ver">{verified}</span><span>· {de ? r.dateDe : r.dateEn}</span>
      {about && <span>· {about}</span>}
    </figcaption>
  );
}

// Einheitliche Darstellung der eBay-Zitate (Luca, 26.09.2026): Wortlaut
// bleibt unveraendert, nur Satzzeichen und Emojis werden vereinheitlicht
// (" ." → ".", "!!" → "!", fehlender Schlusspunkt ergaenzt).
export function tidyQuote(text: string): string {
  let s = text.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s+([.,!?…])/g, '$1').replace(/([!?])\1+/g, '$1').replace(/\.{2,}(?!\.)/g, '…');
  if (!/[.!?…*)]$/.test(s)) s += '.';
  return s;
}
export const quoted = (text: string, de: boolean) => de ? `„${text}“` : `“${text}”`;

// Kompakte Karte fuer die dreispaltige Stimmen-Reihe (v6): Zitat auf vier
// Zeilen begrenzt, "mehr" klappt sie auf. Eigene Komponente statt Hook in der
// .map() weiter unten (Regel 2).
function CompactReviewCard({ r, de, about }: { r: Review; de: boolean; about?: string }) {
  const [expanded, setExpanded] = useState(false);
  // "mehr" nur, wenn das Zitat wirklich abgeschnitten ist (gemessen statt
  // per Zeichenzahl geraten). Der Platz fuer den Knopf bleibt immer
  // reserviert, damit alle drei Karten gleich aufgebaut sind.
  const [clamped, setClamped] = useState(false);
  const qRef = useRef<HTMLQuoteElement>(null);
  useEffect(() => {
    const el = qRef.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const text = tidyQuote(de ? r.textDe : r.textEn);
  return (
    <figure className="wxp-card wxp-rvc">
      <Stars rating={r.rating ?? 5} color="#F5A623" />
      <blockquote ref={qRef} className={expanded ? undefined : 'clamp'}>{quoted(text, de)}</blockquote>
      <button type="button" className="more" onClick={() => setExpanded(v => !v)}
        style={{ visibility: clamped || expanded ? 'visible' : 'hidden' }} tabIndex={clamped || expanded ? 0 : -1}>
        {expanded ? (de ? 'weniger' : 'less') : (de ? 'mehr' : 'more')}
      </button>
      <Who r={r} de={de} about={about} />
    </figure>
  );
}

export function WaxReviews({ productId, de, chapter, chain = false, compact = false }: { productId: string; de: boolean; chapter?: string; chain?: boolean; compact?: boolean }) {
  const list = reviewsFor(productId, chain);
  // Auf Kettenseiten steht bei einer Bewertung zu einer ANDEREN Kette dabei,
  // worum es ging, damit sie nicht als Stimme zu dieser Kette gelesen wird.
  const aboutOf = (r: Review) => chain && !r.productIds?.includes(productId) ? (de ? r.productDe : r.productEn) : undefined;

  // v6: drei gleich grosse Karten statt einer grossen Foto-Karte + zwei
  // kleinen — Luca wollte die Stimmen kompakter, sie stehen jetzt vor dem
  // "Mehr wissen"-Deck statt danach.
  if (compact) {
    const shown = list.slice(0, 3);
    if (shown.length === 0) return null;
    return (
      <section className="wxp-chapter wxp-rv-compact" id="stimmen">
        <div className="wxp-wrap">
          <ChapterHead n={chapter ?? (de ? 'Kapitel 06' : 'Chapter 06')} title={de ? 'Was Fahrer sagen.' : 'What riders say.'} />
          <p className="wxp-rv-line">
            <Stars rating={5} color="#F5A623" />
            {trustStats.reviews} {de ? 'Bewertungen' : 'reviews'} · 100 % {de ? 'positiv' : 'positive'} · {trustStats.sold}+ {de ? 'verkauft' : 'sold'}
          </p>
          <div className="wxp-rv-row">
            {shown.map(r => <CompactReviewCard key={r.id} r={r} de={de} about={aboutOf(r)} />)}
          </div>
          <p className="wxp-rv-ebay">
            {de ? 'Kontoweit auf eBay, nicht nur dieses Produkt.' : 'Account-wide on eBay, not only this product.'}
          </p>
        </div>
      </section>
    );
  }

  const big = list[0];
  const photo = photoFor(productId);
  const rest = list.filter(r => r !== big).slice(0, 2);
  if (!big) return null;
  return (
    <section className="wxp-chapter" id="stimmen" style={{ paddingTop: 24 }}>
      <div className="wxp-wrap">
        <ChapterHead n={chapter ?? (de ? 'Kapitel 06' : 'Chapter 06')} title={de ? 'Was Fahrer sagen.' : 'What riders say.'} />
        <div className="wxp-rv-grid">
          <figure className="wxp-card wxp-rv-big pdp-dark">
            {/* Stimmungsbild, nicht das Rad der zitierten Person — die
                Bildunterschrift sagt das offen, statt "Kundenfoto" zu
                behaupten (Luca, 16.09.2026: Fotos sind seine eigenen). */}
            <div className="ph">
              <img src={photo.src.replace(/\.jpg$/, '.webp')} alt={photoAlt(de)} loading="lazy" decoding="async" style={{ objectPosition: photo.pos ?? '50% 50%' }} />
              <span className="cr">{photoCredit(de)}</span>
            </div>
            <div className="tx">
              <Stars rating={big.rating ?? 5} color="#F5A623" emptyColor="rgba(255,255,255,.2)" />
              <blockquote>{quoted(tidyQuote(de ? big.textDe : big.textEn), de)}</blockquote>
              <Who r={big} de={de} about={aboutOf(big)} />
            </div>
          </figure>
          <div className="wxp-rv-side">
            {rest.map(r => (
              <figure key={r.id} className="wxp-card wxp-rv">
                <Stars rating={r.rating ?? 5} color="#F5A623" />
                <blockquote>{quoted(tidyQuote(de ? r.textDe : r.textEn), de)}</blockquote>
                <Who r={r} de={de} about={aboutOf(r)} />
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
export function DataFitLimits({ product, rc, specs, de, n }: { product: Product; rc: RichContent | undefined; specs: { l: string; v: string }[]; de: boolean; n?: string }) {
  const isPro = product.variant === 'pro';
  const [brands, , bikes] = rc?.compatTags ?? [];
  const drive = [product.compatibility, ...(brands ?? [])].filter(Boolean) as string[];
  const riding = (bikes ?? []).filter(t => !/fach$/.test(t));
  return (
    <section className="wxp-chapter wxp-graybg">
      <div className="wxp-wrap">
        <ChapterHead n={n ?? (de ? 'Kapitel 07' : 'Chapter 07')} title={de ? 'Daten, Passung, Grenzen.' : 'Specs, fit, limits.'}
          lede={de ? 'Alles, was du vor dem Kauf prüfen willst, auch wofür der Block nicht taugt.' : 'Everything to check before buying, including what the block is not for.'} />
        <div className="wxp-specs">
          <div className="wxp-card" style={{ padding: 20 }}>
            <table className="wxp-stable"><tbody>
              {specs.map(s => <tr key={s.l}><td>{s.l}</td><td>{s.v}</td></tr>)}
              {product.intervalDry && <tr><td>{de ? 'Intervall trocken' : 'Interval, dry'}</td><td>{product.intervalDry}{de ? ', empfohlen ~300' : ', recommended ~300'}</td></tr>}
              {product.intervalWet && <tr><td>{de ? 'Intervall nass' : 'Interval, wet'}</td><td>{product.intervalWet}</td></tr>}
              <tr><td>{de ? 'Versand' : 'Shipping'}</td><td>{de ? 'kostenlos, werktags bis 15 Uhr am selben Tag' : 'free, same day on weekdays until 3 pm'}</td></tr>
              <tr><td>{de ? 'Lagerung' : 'Storage'}</td><td>{de ? 'kühl, trocken, dunkel; wird nicht schlecht' : 'cool, dry, dark; does not go off'}</td></tr>
              {/* GPSR Art. 19: Herstellerangabe im Angebot. Als Tabellenzeile
                  statt eigener Box (v5), dieselbe Quelle wie GpsrInfo. */}
              <tr className="mfr"><td>{de ? 'Hersteller' : 'Manufacturer'}</td><td>{GPSR_MANUFACTURER}</td></tr>
            </tbody></table>
            {rc?.formulaDetails && (
              <SmoothDisclosure id="formula" title={de ? 'Formel & Inhaltsstoffe' : 'Formula & ingredients'}>
                {rc.formulaDetails.map(f => <p key={f.name} style={{ marginBottom: 10 }}><b style={{ color: 'var(--tx1)' }}>{f.name}.</b> {f.detail}</p>)}
                {rc.techNote && <p><b style={{ color: 'var(--tx1)' }}>{rc.techNote.title}.</b> {rc.techNote.body}</p>}
              </SmoothDisclosure>
            )}
          </div>
          <div className="wxp-card wxp-fit">
            <span className="lbl2">{de ? 'Antrieb' : 'Drivetrain'}</span>
            <div className="wxp-chips">{drive.map(t => <span key={t}>{t}</span>)}</div>
            {riding.length > 0 && <>
              <span className="lbl2">{de ? 'Räder' : 'Bikes'}</span>
              <div className="wxp-chips">{riding.map(t => <span key={t}>{t}</span>)}</div>
            </>}
            {/* v5: ehrlich statt Jahreszeiten-Schubladen (Luca, 14.09.2026):
                beide gehen das ganze Jahr, Pro haelt bei Naesse und Kaelte
                laenger, aber Dauerregen verkuerzt bei jedem Wachs das
                Intervall. mt-auto haelt den Block am Kartenfuss. */}
            <div className="wxp-goodbad">
              <div>
                <span className="d ok" aria-hidden>✓</span>
                <div><b>{de ? 'Gut bei' : 'Good for'}</b>
                  {isPro
                    ? (de ? 'Ganzjährig, besonders bei Nässe und Kälte: hält dort länger als Classic und bleibt bis −8 °C geschmeidig. Auch fürs E-Bike.' : 'All year, especially in wet and cold: lasts longer there than Classic and stays supple down to −8 °C. E-bikes too.')
                    : (de ? 'Ganzjährig, am längsten hält es im Trockenen. Bei Nässe und Kälte funktioniert Classic auch, du wachst dann nur öfter.' : 'All year, it lasts longest in the dry. Classic also works in wet and cold, you just rewax more often.')}
                </div>
              </div>
              <div>
                <span className="d no" aria-hidden>✕</span>
                <div><b>{de ? 'Grenzen' : 'Limits'}</b>
                  {isPro
                    ? (de ? 'Dauerregen verkürzt auch hier das Intervall, Wachs ist kein Nassschmierstoff. Und kein Öl zwischendurch: das zerstört den Film, lieber neu wachsen.' : 'Constant rain shortens the interval here too, wax is not a wet lube. And no oil in between: it ruins the film, rewax instead.')
                    : (de ? 'Wer oft bei Regen fährt, wachst deutlich öfter; dafür gibt es Pro. Kein Öl zwischendurch: das zerstört den Film, lieber neu wachsen.' : 'If you ride in rain a lot you rewax much more often; that is what Pro is for. No oil in between: it ruins the film, rewax instead.')}
                </div>
              </div>
            </div>
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

/** Ein einzelnes Aufklappfeld im selben Muster wie die FAQ (weiche Hoehe
 *  statt <details>-Sprung), damit die Seite nur eine Akkordeon-Sprache hat. */
function SmoothDisclosure({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="wxp-acc" data-open={open || undefined}>
      <button type="button" className="wxp-acc-q" aria-expanded={open} aria-controls={`acc-${id}`} onClick={() => setOpen(o => !o)}>
        {title}
      </button>
      <div id={`acc-${id}`} className="wxp-acc-a" role="region" inert={!open}>
        <div><div>{children}</div></div>
      </div>
    </div>
  );
}

// Luca, 25.09.2026: "zu viele Fragen, die gleichzeitig gezeigt werden".
// Fuenf stehen, der Rest klappt auf. Immer nur eine Antwort offen, weiche
// Hoehe ueber grid-template-rows statt des harten <details>-Sprungs.
const FAQ_VISIBLE = 5;
function FaqList({ items, de }: { items: { q: string; a: string }[]; de: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, FAQ_VISIBLE);
  return (
    <div>
      {shown.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="wxp-acc" data-open={isOpen || undefined}>
            <button type="button" className="wxp-acc-q" aria-expanded={isOpen} aria-controls={`faq-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}>
              {item.q}
            </button>
            <div id={`faq-${i}`} className="wxp-acc-a" role="region" inert={!isOpen}>
              <div><div>{item.a}</div></div>
            </div>
          </div>
        );
      })}
      {items.length > FAQ_VISIBLE && (
        <button type="button" className="wxp-acc-more" aria-expanded={all} onClick={() => setAll(v => !v)}>
          {all
            ? (de ? 'Weniger Fragen zeigen' : 'Show fewer questions')
            : (de ? `Alle ${items.length} Fragen zeigen` : `Show all ${items.length} questions`)}
        </button>
      )}
    </div>
  );
}

export function WaxFaq({ de, t, kind = 'wax' }: { de: boolean; t: T; kind?: 'wax' | 'chain' }) {
  const topics = kind === 'chain' ? CHAIN_TOPICS : WAX_TOPICS;
  // Reihenfolge der Stichworte = Kaufrelevanz (faqTopics.ts). Vorher blieb die
  // Reihenfolge der i18n-Liste stehen, das Stichwort-Ranking wirkte nicht.
  const rank = (q: string) => topics.findIndex(topic => q.includes(topic));
  const items = (t.faq.items ?? [])
    .filter(item => rank(item.q) >= 0)
    .sort((x, y) => rank(x.q) - rank(y.q));
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
        <FaqList items={items} de={de} />
      </div>
    </section>
  );
}
