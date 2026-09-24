// ─── ProductShelf — das Regal, das die drei Tueren ersetzt ───────────────────
//
// Die Tueren zeigten drei gleich grosse Fotokacheln und *kein einziges*
// Produkt: wer auf „Produkte" klickte, sah eine zweite Auswahl statt einer
// Ware. Bei 14 Artikeln ist das eine Zwischenseite ohne Aufgabe — NN/G fasst
// Kategorie- und Listenseite fuer kleine Sortimente ausdruecklich zusammen,
// Unterkategorien oben, Produkte direkt darunter.
//
// Die Ordnung hier folgt dem Katalog, nicht der Symmetrie:
//
//   Wachs   4 SKUs = 2 Entscheidungen (Formel, dann Menge). Passt vollstaendig
//           auf den Schirm, also steht es dort — zwei Tafeln, Groesse als
//           Schalter darin. Kein Tab, keine Liste, kein Klick davor.
//   Set     kein eigener Eingang, sondern der naechste Schritt nach der
//           Wachsentscheidung.
//   Ketten  8 SKUs mit Kompatibilitaetsfilter — das passt nicht auf den Schirm
//           und behaelt deshalb seine Liste.
//   Rewax   Retention, dort platziert wo sie relevant wird: wer sich gerade
//           mit Wachs und Ketten beschaeftigt hat, ist genau die Person, die
//           das in vierhundert Kilometern braucht.
//
// Fruehere Fassung: jedes der vier Elemente in einem eigenen Layout — Wachs
// als Fotokachel mit eingeblendetem Text, Set als 16:9-Foto neben Text,
// Ketten als 3:2-Foto neben Text mit eigenen Filter-Chips, Rewax als
// ganzflaechiges dunkles Banner. Vier Bildseitenverhaeltnisse, vier
// Kartenformen, vier Abstandsrhythmen auf einem einzigen Bildschirm — genau
// das war Lucas Ruecklmeldung ("all over the place"), und es ist kein
// Geschmacksurteil: ein A/B-Test mit 25.000 Besuchern zeigte 17,1 % mehr
// Umsatz pro Besucher allein durch einheitliche statt gemischte Kartengroessen
// (siehe SecondaryTile-Kommentar unten fuer die Quelle).
//
// Jetzt zwei Ebenen, zwei Kartensprachen, nicht vier:
//   Ebene 1 (Wachs)              — 4:5 Hochformat, volle Kaufwerkzeuge darunter.
//   Ebene 2 (Set / Ketten / Rewax) — eine gemeinsame SecondaryTile-Komponente,
//           4:3 Querformat, gleiche Bildunterschrift-Grammatik wie Wachs, drei
//           gleich grosse Kacheln in einer Reihe statt drei verschiedener
//           Module untereinander.
//
// Behaelter nach DESIGN.md §3: ganzflaechiges Foto und Haarlinie. Keine
// gefuellten Kacheln mit Rahmen und Schatten.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeftRight, ExternalLink, Truck, RotateCw, ChevronDown, BadgePercent } from 'lucide-react';
import { products, accessories, starterSet, starterSetPrice, starterSetOptions, starterSetPriceFor, canCheckout, waxTierBreakdown } from '@/lib/data';
import { costPerApplication } from '@/lib/waxMath';
import type { TranslationType } from '@/lib/i18n';
import { AddToCartButton } from '@/components/AddToCartButton';
import { PriceNote } from '@/components/PriceNote';
import { Stars } from '@/components/Stars';
import { ShippingPill } from '@/components/ShippingPill';
import { trackEbayClick } from '@/lib/analytics';
import { getEstimatedDelivery } from '@/lib/utils';

type Size = '300' | '500';
type Variant = 'classic' | 'pro';

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const waxOf = (variant: Variant, size: Size) =>
  products.find(p => p.category === 'wax' && p.variant === variant && p.weight === `${size}g`)!;

// Vertrauenssignal gehoert der Formel (Classic/Pro), nicht der einzelnen
// Groesse — sonst springt die Zahl beim Umschalten von 500g auf 300g, was
// als Beleg seltsam wirkt. Summe beider Groessen, auf 10er abgerundet
// ("253 verkauft" faellt als exakte Zahl auf, "250+" liest sich wie ein
// Beleg statt wie eine Behauptung).
function variantStats(variant: Variant) {
  const skus = products.filter(p => p.category === 'wax' && p.variant === variant);
  const sold = skus.reduce((sum, p) => sum + (p.unitsSold ?? 0), 0);
  const reviews = skus.reduce((sum, p) => sum + (p.reviewCount ?? 0), 0);
  return { soldRounded: Math.floor(sold / 10) * 10, reviews };
}

const minPrice = (category: 'wax' | 'chain') =>
  Math.min(...products.filter(p => p.category === category).map(p => p.price));

// Billigste echte Kombination durch dieselbe starterSetPrice(), die auch der
// Konfigurator nutzt — nie eine getippte Zahl, die davon abdriften kann. Der
// niedrigste Einstieg ist das Set ohne Kette (nur Wachs + Zange + Draht).
const accSum = accessories.reduce((sum, a) => sum + a.price, 0);
// Exportiert: die "Passt dazu"-Reihe auf /ketten (Stufe 3) zeigt dieselbe
// Set-Kachel wie das Regal und braucht denselben Preis, nicht eine zweite
// Berechnung, die irgendwann abweicht.
export const minSetPrice = Math.min(
  starterSetPrice(minPrice('wax') + minPrice('chain') + accSum),
  starterSetPrice(minPrice('wax') + accSum),
);

// ── Kartenkopf, fuer alle drei Karten gleich gebaut ──────────────────────────
function ShelfHead({ name, to, meta, body }: { name: string; to: string; meta: React.ReactNode; body: string }) {
  return (
    <div className="min-w-0">
      {/* <p>-Optik, nicht <h3>: index.css faerbt h1–h4 im Hellmodus global. */}
      <Link to={to} viewTransition className="stretched-link block font-display font-bold leading-[1.05] tracking-[-0.02em]"
        style={{ color: 'var(--tx1)', fontSize: 'clamp(1.4rem, 2.2vw, 1.65rem)' }}>
        {name}
      </Link>
      <div className="flex items-center gap-2 mt-1.5 h-5 min-w-0">{meta}</div>
      <p className="text-[13px] leading-[1.4] mt-2 line-clamp-2 min-h-[2.8em]" style={{ color: 'var(--txm)' }}>{body}</p>
    </div>
  );
}

// ── Eine Wachs-Tafel ────────────────────────────────────────────────────────
// Foto traegt den Namen, die Haarlinien darunter tragen die Zahlen. Der
// Groessenschalter tauscht das ganze Produkt aus (Preis, Grundpreis,
// Anwendungen, eBay-Link), damit aus vier Karten zwei Tafeln werden.
// 14.09.2026, Wachsseite v5: Karte neu nach der Grammatik der Produktseite
// (WaxHero): Groesse als zwei Kacheln mit Preis und Wachsgaengen, ein grosser
// Preis, Rabatt als sichtbare Pille, Kauf unten rechts. Lucas Befund zur
// vorigen Fassung: "sehr unuebersichtlich", Rabatt "nicht sehr attraktiv",
// §19-Hinweis abgeschnitten. Der steht jetzt nur noch einmal unter dem Regal.
function WaxPanel({ variant, de, t, image, alt, delivery }: {
  variant: Variant;
  de: boolean;
  t: TranslationType;
  image: string;
  alt: string;
  delivery: string;
}) {
  const [size, setSize] = useState<Size>('500');
  const [dealOpen, setDealOpen] = useState(false);
  const product = waxOf(variant, size);
  const s = t.products.shelf;
  const p = t.products;
  const { soldRounded, reviews } = variantStats(variant);
  const name = variant === 'classic' ? s.classicName : s.proName;
  const badge = variant === 'classic' ? s.classicBadge : s.proBadge;

  // Grundpreis je 100 g bleibt: PAngV verlangt ihn bei Ware nach Gewicht.
  const grams = parseInt(product.weight!);
  const per100 = eur(product.price / (grams / 100), de);
  const perWax = costPerApplication(product);
  const tiers = waxTierBreakdown(product);
  const maxPct = Math.max(0, ...tiers.map(x => x.pct));

  return (
    <div className="shelf-card group relative flex flex-col rounded-[20px] overflow-hidden">
      {/* Foto traegt nur Auszeichnung und Hover-Pfeil, beide mit eigenem
          Fond — der Name steht darunter auf Flaeche (kein Scrim ueber dem
          farbigen Motiv). Auszeichnung jetzt bei beiden oben links. */}
      <Link
        to={`/produkt/${product.id}`}
        viewTransition
        className="relative block overflow-hidden aspect-[16/10]"
        style={{ background: 'var(--bd2)' }}
        // Sichtbare Auszeichnung steht mit im zugaenglichen Namen (WCAG 2.5.3).
        aria-label={`${name} — ${badge}`}
      >
        {/* AVIF vor WebP, gleiche Breiten und dasselbe `sizes` — spart je Motiv
            18-31 % (gemessen, siehe scripts/build-avif-variants.mjs). Die
            WebP-Zeile bleibt als Fallback und darf nicht entfallen. */}
        <picture>
          <source srcSet={`${image}-800.avif 800w, ${image}.avif 1000w`} sizes="(max-width: 640px) 92vw, 46vw" type="image/avif" />
          <source srcSet={`${image}-800.webp 800w, ${image}.webp 1000w`} sizes="(max-width: 640px) 92vw, 46vw" type="image/webp" />
          <img
            src={`${image}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="photo-shelf absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>

        {/* Hover-Pfeil unten rechts — Runde 4: die alte Position oben rechts
            kollidiert jetzt mit Pros staendig sichtbarem MoS2-Chip (siehe
            unten). Gibt WaxPanel weiterhin dieselbe Klick-Signatur wie
            SecondaryTile darunter, erst beim Hover sichtbar, damit die Karte
            in Ruhe nicht ueberladen wirkt. */}
        <span
          aria-hidden
          className="absolute bottom-4 right-4 flex items-center justify-center h-9 w-9 rounded-full opacity-0 translate-y-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0"
          style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.28)' }}
        >
          <ArrowRight className="h-4 w-4" style={{ color: '#fff' }} />
        </span>

        {/* Auszeichnung: Classic traegt eine Tatsache (meistgekauft), Pro
            seinen Wirkstoff. Keine sagt "die bessere". */}
        <span className="absolute top-4 left-4 rounded-full px-2.5 py-1 text-meta font-semibold"
          style={variant === 'classic'
            ? { background: 'rgba(255,255,255,0.94)', color: '#101013', backdropFilter: 'blur(6px)' }
            : { background: 'rgba(10,10,12,0.72)', color: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.22)' }}>
          {badge}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        {/* Kopf in festen Zeilen, damit Preis und Schalter auf allen drei
            Karten auf derselben Hoehe stehen (Luca, 25.09.2026: bei Classic
            brach die Einsatzzeile neben den Sternen dreizeilig um, bei Pro
            zweizeilig, der Preis stand dadurch ueberall woanders).
            Name / Beleg-Zeile / Einsatz mit fest reservierten zwei Zeilen.
            Der Name ist der "Stretched Link": sein ::after legt eine
            Klickflaeche ueber die ganze Karte (siehe .stretched-link in index.css). */}
        <ShelfHead
          name={name}
          to={`/produkt/${product.id}`}
          meta={reviews > 0 && (
            <>
              <Stars rating={5} />
              <span className="num text-meta whitespace-nowrap truncate" style={{ color: 'var(--txf)' }}>
                {reviews} {s.reviewsShort}{soldRounded >= 20 && ` · ${soldRounded}+ ${s.soldUnits}`}
              </span>
            </>
          )}
          body={variant === 'classic' ? s.classicUse : s.proUse}
        />

        {/* Groesse als zwei Kacheln wie in der Kaufbox der Produktseite:
            jede nennt Preis und Wachsgaenge selbst, also braucht es keine
            eigene Anwendungszeile und keine zweite Preisspalte mehr. */}
        <div className="grid grid-cols-2 gap-2.5 mt-4" role="group" aria-label={s.size}>
          {(['300', '500'] as Size[]).map(v => {
            const sp = waxOf(variant, v);
            return (
              <button key={v} type="button" aria-pressed={size === v} onClick={() => setSize(v)}
                className="shelf-size text-left rounded-xl px-3 py-2.5 min-h-11">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="num text-[15px] font-bold" style={{ color: 'var(--tx1)' }}>{v} g</span>
                  <span className="num text-[13px]" style={{ color: 'var(--tx2)' }}>{eur(sp.price, de)}</span>
                </span>
                <span className="block num text-meta mt-0.5 whitespace-nowrap" style={{ color: 'var(--txf)' }}>{sp.applications}<span className="shelf-uses-long"> {s.uses}</span><span className="shelf-uses-short" aria-hidden>×</span></span>
              </button>
            );
          })}
        </div>

        {/* Preis: einmal gross, daneben der Gegenwert je Wachsgang und der
            Grundpreis (PAngV). */}
        <div className="flex items-end justify-between gap-3 mt-4">
          <p className="shelf-price font-display font-extrabold leading-none tracking-[-0.03em]"
            style={{ fontSize: 'clamp(1.9rem, 3vw, 2.3rem)' }}>
            {eur(product.price, de).replace(' €', '')}<span className="text-[0.55em] font-semibold ml-1" style={{ color: 'var(--tx2)' }}>€</span>
          </p>
          <p className="num text-[12.5px] text-right leading-snug" style={{ color: 'var(--txm)' }}>
            {perWax !== null && <>≈ {eur(perWax, de)} {s.perWaxing}<br /></>}
            <span style={{ color: 'var(--txf)' }}>{per100} {s.per100}</span>
          </p>
        </div>

        {/* Staffel als sichtbare gruene Pille statt einer 10,5-px-Zeile im
            Fussstreifen; aufgeklappt drei Stufen mit Euro-Ersparnis. */}
        {tiers.length > 0 && (
          <div className="mt-3">
            <button type="button" onClick={() => setDealOpen(o => !o)} aria-expanded={dealOpen}
              className="shelf-deal inline-flex items-center gap-1.5 min-h-9 px-3 rounded-full text-[12.5px] font-semibold">
              <BadgePercent className="h-3.5 w-3.5" aria-hidden />
              {s.dealPill.replace('{pct}', String(maxPct))}
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" style={{ transform: dealOpen ? 'rotate(180deg)' : 'none' }} aria-hidden />
            </button>
            {dealOpen && (
              <>
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {tiers.map(tier => (
                    <div key={tier.qty} className="rounded-lg px-2.5 py-2" style={{ background: 'var(--sf)', border: '1px solid var(--bd2)' }}>
                      <p className="num text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>
                        {p.quantityDiscountUnit.replace('{qty}', tier.qty === 4 ? '4+' : String(tier.qty))}
                        <span className="shelf-deal-tx ml-1.5">−{tier.pct} %</span>
                      </p>
                      <p className="num text-meta mt-0.5" style={{ color: 'var(--txm)' }}>
                        {eur(tier.unitPrice, de)} / {de ? 'Stk.' : 'pc.'}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-meta mt-2" style={{ color: 'var(--txf)' }}>{p.quantityDiscountMechanism}</p>
              </>
            )}
          </div>
        )}

        {/* Fuss: Lieferung links, Details und Kauf unten rechts. mt-auto
            haelt die Fusszeile beider Karten auf einer Linie. */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-x-3 gap-y-3 flex-wrap pt-4" style={{ borderTop: '1px solid var(--bd2)' }}>
            <p className="flex items-center gap-1.5 num text-[12.5px]" style={{ color: 'var(--tx2)' }}>
              <Truck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
              <span>{s.delivery} {delivery}<span style={{ color: 'var(--txf)' }}> · {p.priceNoteShippingIncluded}</span></span>
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <Link to={`/produkt/${product.id}`} viewTransition
                className="inline-flex items-center gap-1 min-h-11 px-4 rounded-full text-[13px] font-semibold border transition-colors duration-150 hover:bg-[var(--accent-wash)]"
                style={{ borderColor: 'var(--bd)', color: 'var(--tx2)' }}>
                {s.details}
              </Link>
              {product.soldOut ? (
                <span className="inline-flex items-center min-h-11 text-[13px] font-semibold" style={{ color: 'var(--txf)' }}>
                  {de ? 'Ausverkauft' : 'Sold out'}
                </span>
              ) : canCheckout(product) ? (
                <AddToCartButton product={product} />
              ) : (
                <button
                  type="button"
                  onClick={() => { trackEbayClick(product.id); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                  className="inline-flex items-center gap-1.5 min-h-11 px-5 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
                  style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
                >
                  {t.products.buyOnEbay}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Eine Sekundaer-Kachel ────────────────────────────────────────────────────
// Set, Ketten und Rewax teilen sich diese eine Komponente statt je eines
// eigenen Layouts.
//
// 09/2026, dritter Anlauf: Die vorherige Fassung legte den kompletten Text
// (Ziffer, Eyebrow, zweizeiliger Titel — vier Zeilen) als Scrim-Overlay auf
// ein auf halbe Breite verkleinertes Foto (2-spaltig auf Mobile, ~165px
// Kachelbreite). Bei der Breite brach die Eyebrow-Zeile um, die Ziffer stand
// verwaist vor der ersten Zeile statt vor dem ganzen Block, und der CTA blieb
// auf Touch-Geraeten nach dem ersten Tap sichtbar "haengen" (:hover-Fond ohne
// :hover) — Lucas Screenshots zeigten genau das: uneinheitlich gefuellte
// Chips, harter Kontrastwechsel zwischen hellen und dunklen Fotos, insgesamt
// "hässlich" und "chaotisch". Das Foto-Scrim-Muster traegt eben nur einen
// ganzen Fliesstextblock, wenn die Kachel die volle Spaltenbreite hat.
//
// WaxPanel im selben Regal loeste dasselbe Problem (Foto plus vollstaendiger
// Kaufblock: Groessenschalter, Preis, Chips, Social Proof, zwei Buttons)
// bereits so: Foto rundet nur oben, geht ohne Abstand in einen durchgehend
// getoenten Block ueber (`var(--sf2)`, `rounded-b-2xl`) — Foto und Textblock
// wirken als eine Form, aber der Text steht auf Flaeche statt auf Foto, also
// immer mit garantiertem Kontrast unabhaengig vom Bildinhalt. Diese Kachel
// hier folgt jetzt derselben, bereits bewaehrten Grammatik statt einer
// eigenen: Foto traegt nur noch einen kleinen Ziffern-Chip (wie WaxPanels
// Auszeichnungs-Chip oben links — kann nicht mehr umbrechen, weil er nicht
// Teil eines Fliesstexts ist), Titel/Eyebrow/Preis/CTA wandern in den
// getoenten Block darunter. CTA ist jetzt dauerhaft gefuellt statt per
// :hover ein-/ausgeblendet — auf Touch-Geraeten gibt es kein "vorher", also
// keine zwei Zustaende, die je nach Geraet auseinanderlaufen koennen.
//
// `as`: Link fuer Set (echte Route) und Rewax (echte Route), button fuer
// Ketten (oeffnet nur einen Zustand auf derselben Seite — kein Seitenwechsel,
// also kein <a>/<Link>, sonst waere Rechtsklick/"in neuem Tab oeffnen" ein
// Versprechen, das die Seite nicht haelt).
// Exportiert: products.tsx braucht dieselbe Kachel fuer die Rewax-Karte am
// Ende der aufgeklappten Kettenliste — siehe dortiger Kommentar.
export function SecondaryTile({ image, imageW, eyebrow, title, body, cta, alt, price, delivery, deliveryIcon = 'truck', freeShipping, dark, index, ...action }: {
  image: string; imageW: number; eyebrow: string; title: string; body: string; cta: string; alt: string;
  /** Text der gruenen Versand-Pille ("Versandkostenfrei"), steht klein neben
      der Lieferzeile. Weggelassen bei Rewax: dort wird nichts verschickt,
      sondern die eigene Kette zurueckgeschickt. */
  freeShipping?: string;
  /** Fertig formatierter Preis-String ("ab 57,63 €"). Macht aus der Kachel
      sichtbar ein Kaufangebot statt eines reinen Editorial-Links — ohne
      Preis war auf Mobile nicht erkennbar, dass hier etwas verkauft wird. */
  price?: string;
  /** Fertig formatierter Lieferzeile-String ("Lieferung Mo., 7. Sept."),
      dieselbe Grammatik wie WaxPanels Lieferzeile. Set und Ketten teilen
      sich dieselbe Sendung/dasselbe Lager und bekommen deshalb dieselbe
      Schaetzung; Rewax hat keine Zustellung im klassischen Sinn, sondern
      einen Turnaround (siehe deliveryIcon). */
  delivery?: string;
  /** 'truck' (Standard) fuer eine Lieferschaetzung, 'rotate' fuer Rewax'
      Turnaround ("zurueck in X Werktagen") — ein Rundpfeil statt eines LKW,
      weil hier nichts zugestellt, sondern die eigene Kette zurueckgeschickt
      wird (Produktkarten-Plan Stufe 2.2). */
  deliveryIcon?: 'truck' | 'rotate';
  /** Dunklerer Foto-Rand fuer die Rewax-Kachel (moodigeres Motiv) — rein
      atmosphaerisch, seit der Text nicht mehr auf dem Foto steht keine
      Kontrastfrage mehr. */
  dark?: boolean;
  /** 1-3: eigenstaendiger Ziffern-Chip oben links auf dem Foto (siehe
      WaxPanels Auszeichnungs-Chip), rahmt die Kachel als einen von drei
      parallelen Wegen. Weggelassen bei der Rewax-Kachel, die products.tsx
      einzeln unter der Kettenliste wiederverwendet — dort ausserhalb der
      Dreiergruppe ergibt eine Ziffer keinen Sinn. */
  index?: 1 | 2 | 3;
} & ({ to: string } | { onClick: () => void })) {
  const inner = (
    <>
      {/* 09/2026, vierter Anlauf — zurueck zur Karte, aber mit der Grammatik
          von WaxPanel statt der alten Scrim-Kachel.
          Der dritte Anlauf (Foto links, Text rechts, drei Zeilen untereinander)
          loeste zwar das Textproblem, erzeugte aber auf dem Desktop das
          naechste: eine Zeile ueber die volle Sektionsbreite hat neben einem
          quadratischen Bild und drei Zeilen Text rund 400 px, die nichts
          tragen — Lucas Befund "viel Deadspace". Drei solcher Zeilen
          untereinander sind ausserdem dreimal so hoch wie eine Reihe.
          Jetzt: dieselbe Karte wie die Wachs-Tafeln — Foto 16:10 oben, Text
          im getoenten Block darunter, drei Karten nebeneinander. Der Text
          steht weiterhin auf Flaeche statt auf Foto (das war der Fehler des
          zweiten Anlaufs), aber die Kachel hat jetzt volle Spaltenbreite
          statt halber, also bricht keine Eyebrow-Zeile mehr um. */}
      <div className="relative overflow-hidden aspect-[16/10]" style={{ background: 'var(--bd2)' }}>
        <picture>
          {/* AVIF vor WebP, siehe Kommentar bei der Hauptkarte weiter oben. */}
          <source srcSet={`${image}-800.avif 800w, ${image}.avif ${imageW}w`} sizes="(max-width: 640px) 92vw, 30vw" type="image/avif" />
          <source srcSet={`${image}-800.webp 800w, ${image}.webp ${imageW}w`} sizes="(max-width: 640px) 92vw, 30vw" type="image/webp" />
          <img
            src={`${image}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="photo-shelf absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>
        <span aria-hidden className="absolute inset-0"
          style={{ background: dark
            ? 'linear-gradient(to top, rgba(var(--scrim-rgb),0.34) 0%, rgba(var(--scrim-rgb),0) 42%)'
            : 'linear-gradient(to top, rgba(var(--scrim-rgb),0.18) 0%, rgba(var(--scrim-rgb),0) 36%)' }} />
        {index && (
          <span className="absolute top-3.5 left-3.5 flex items-center justify-center h-6 w-6 rounded-full num text-[11px] font-semibold"
            style={{
              background: 'rgba(255,255,255,0.94)',
              color: '#101013',
              backdropFilter: 'blur(6px)',
            }}>
            {index}
          </span>
        )}
      </div>

      {/* flex-1 + mt-auto auf der Preiszeile: drei Kacheln nebeneinander haben
          unterschiedlich lange Fliesstexte, die CTA-Zeilen sollen trotzdem auf
          einer Linie liegen (der Grid streckt alle Karten auf gleiche Hoehe). */}
      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        <p className="eyebrow">{eyebrow}</p>
        {/* Runde 2: Titel sind jetzt kurze Produktnamen statt ganzer Saetze
            ("Starter-Set", "Vorgewachste Ketten", "Kette wachsen lassen") —
            eine Groessenstufe groesser als vorher, naeher an WaxPanels
            Produktnamen-Groesse (clamp 1.15-1.4rem), damit sie als
            Ueberschrift statt als Fliesstext-Zeile lesen. */}
        <h3 className="font-display font-bold text-[17px] sm:text-[18.5px] leading-snug tracking-[-0.015em] mt-0.5" style={{ color: 'var(--tx1)' }}>{title}</h3>
        <p className="text-[13px] leading-snug mt-1.5" style={{ color: 'var(--txm)' }}>{body}</p>

        {/* Lieferzeile — nur wenn uebergeben. Gleiche Truck-Icon-Grammatik
            wie WaxPanel, ausser bei Rewax (deliveryIcon='rotate'). */}
        {(delivery || freeShipping) && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-2.5">
            {freeShipping && <ShippingPill small label={freeShipping} />}
            {delivery && (
              <span className="flex items-center gap-1.5 num text-meta" style={{ color: 'var(--tx2)' }}>
                {deliveryIcon === 'rotate'
                  ? <RotateCw className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
                  : !freeShipping && <Truck className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />}
                {delivery}
              </span>
            )}
          </div>
        )}

        {/* CTA als eigenstaendiger, gefuellter Button statt einer leicht
            getoenten Pille im Fliesstext-Stil — dieselbe Buy-Button-Grammatik
            wie die Kauf-CTAs oben in dieser Datei. Dauerhaft gefuellt, nicht
            per :hover ein-/ausgeblendet: auf Touch gibt es kein "vorher".
            group-hover:scale hebt den Button beim Card-Hover minimal an —
            dieselbe Mikro-Interaktion wie active:scale bei den eBay-Buttons
            oben, hier auf hover statt press gemuenzt. */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3.5">
          {price && <span className="num text-[15px] font-bold flex-shrink-0" style={{ color: 'var(--tx1)' }}>{price}</span>}
          <span
            className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-full text-[13px] font-semibold flex-shrink-0 transition-all duration-200 group-hover:opacity-90 group-hover:scale-[1.035]"
            style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
          >
            {cta}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </>
  );

  // Rahmen, Flaeche und die blaue Hover-Kante kommen aus .shelf-card
  // (index.css) — als Inline-Style konnte die Hover-Klasse den Rahmen nie
  // ueberschreiben, die blaue Kante war damit tot.
  const wrapperClass = 'shelf-card group flex flex-col rounded-[20px] overflow-hidden';

  return 'to' in action ? (
    <Link to={action.to} className={wrapperClass}>{inner}</Link>
  ) : (
    <button type="button" onClick={action.onClick} className={`${wrapperClass} text-left w-full`}>{inner}</button>
  );
}

// ── Starter-Set-Kachel, dritte Karte neben den zwei Wachs-Tafeln ───────────
// /kettenwachs (Seitenordnung Chat 2): "Drei gleich hohe Karten: Classic und
// Pro (bestehendes WaxPanel) plus eine Starter-Set-Karte in derselben
// Zonen-Grammatik." Gleiche Aussenform wie WaxPanel (Foto 16:10, getoenter
// Block darunter, Fusszeile per mt-auto). Seit 25.09.2026 auch derselbe
// mittlere Block: Schalter ohne/mit Kette statt einer Punkteliste.
//
// Die zwei Einstiege der Set-Karte, beide echte Kombinationen aus
// starterSetOptions (Preis ueber starterSetPriceFor, Einzelsumme aus den
// echten Katalogpreisen) — keine getippte Zahl.
type SetPick = 'nochain' | 'chain';
const setParts = (waxId: string, chainId?: string) =>
  (products.find(p => p.id === waxId)?.price ?? 0)
  + (chainId ? products.find(p => p.id === chainId)?.price ?? 0 : 0)
  + accessories.filter(a => (starterSet.includedAccessoryIds as readonly string[]).includes(a.id)).reduce((sum, a) => sum + a.price, 0);
const setPick = (id: string, labelDe: string, labelEn: string, subDe: string, subEn: string) => {
  const opt = starterSetOptions.find(o => o.id === id)!;
  return { opt, labelDe, labelEn, subDe, subEn, price: starterSetPriceFor(opt.waxId, opt.chainId), parts: setParts(opt.waxId, opt.chainId) };
};
const SET_PICKS: Record<SetPick, ReturnType<typeof setPick>> = {
  nochain: setPick('starter-nochain', 'Ohne Kette', 'No chain', 'Wachs 300 g, Zange, Draht', 'Wax 300 g, pliers, wire'),
  chain: setPick('starter-classic', 'Mit Kette', 'With chain', 'dazu Kette YBN 11-fach', 'plus YBN 11-speed chain'),
};

function StarterSetPanel({ de, t, delivery }: { de: boolean; t: TranslationType; delivery: string }) {
  const s = t.products.shelf;
  // Luca, 25.09.2026: dasselbe Muster wie der Groessenschalter bei Classic
  // und Pro — ohne/mit Kette als zwei Kacheln, "ohne" vorausgewaehlt, Preis
  // wechselt mit, der CTA oeffnet den Konfigurator mit genau dieser Wahl.
  const [pick, setPick] = useState<SetPick>('nochain');
  const chosen = SET_PICKS[pick];

  return (
    <div className="shelf-card group relative flex flex-col rounded-[20px] overflow-hidden">
      <Link
        to={`/starter-set?set=${chosen.opt.id}`}
        viewTransition
        className="relative block overflow-hidden aspect-[16/10]"
        style={{ background: 'var(--bd2)' }}
        aria-label={`${s.setTitle} — ${eur(chosen.price, de)}`}
      >
        <picture>
          <source srcSet="/images/shelf/shelf-set-800.avif 800w, /images/shelf/shelf-set.avif 1000w" sizes="(max-width: 640px) 92vw, 30vw" type="image/avif" />
          <source srcSet="/images/shelf/shelf-set-800.webp 800w, /images/shelf/shelf-set.webp 1000w" sizes="(max-width: 640px) 92vw, 30vw" type="image/webp" />
          <img
            src="/images/shelf/shelf-set.webp"
            alt={de ? 'Waxcelerate Starter-Set mit Wachs, Kettenzange und Draht' : 'Waxcelerate starter set with wax, chain pliers and wire'}
            loading="lazy"
            decoding="async"
            className="photo-shelf absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>
        <span
          aria-hidden
          className="absolute bottom-4 right-4 flex items-center justify-center h-9 w-9 rounded-full opacity-0 translate-y-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0"
          style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.28)' }}
        >
          <ArrowRight className="h-4 w-4" style={{ color: '#fff' }} />
        </span>
        <span className="absolute top-4 left-4 rounded-full px-2.5 py-1 text-meta font-semibold"
          style={{ background: 'rgba(255,255,255,0.94)', color: '#101013', backdropFilter: 'blur(6px)' }}>
          {s.setEyebrow}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <ShelfHead
          name={s.setTitle}
          to={`/starter-set?set=${chosen.opt.id}`}
          meta={
            <span className="shelf-deal-tx inline-flex items-center gap-1.5 text-meta font-semibold whitespace-nowrap">
              <BadgePercent className="h-3.5 w-3.5" aria-hidden />
              {de ? `${starterSet.discountPct} % günstiger als einzeln` : `${starterSet.discountPct}% cheaper than separately`}
            </span>
          }
          body={s.setBody}
        />

        <div className="grid grid-cols-2 gap-2.5 mt-4" role="group" aria-label={de ? 'Kette' : 'Chain'}>
          {(Object.keys(SET_PICKS) as SetPick[]).map(k => {
            const o = SET_PICKS[k];
            return (
              <button key={k} type="button" aria-pressed={pick === k} onClick={() => setPick(k)}
                className="shelf-size text-left rounded-xl px-3 py-2.5 min-h-11">
                <span className="block text-[15px] font-bold whitespace-nowrap" style={{ color: 'var(--tx1)' }}>{de ? o.labelDe : o.labelEn}</span>
                <span className="block num text-meta mt-0.5" style={{ color: 'var(--txf)' }}>{eur(o.price, de)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-end justify-between gap-3 mt-4">
          <p className="shelf-price font-display font-extrabold leading-none tracking-[-0.03em]"
            style={{ fontSize: 'clamp(1.9rem, 3vw, 2.3rem)' }}>
            {eur(chosen.price, de).replace(' €', '')}<span className="text-[0.55em] font-semibold ml-1" style={{ color: 'var(--tx2)' }}>€</span>
          </p>
          <p className="num text-[12.5px] text-right leading-snug" style={{ color: 'var(--txm)' }}>
            {eur(chosen.parts, de)} {de ? 'einzeln gekauft' : 'bought separately'}<br />
            <span style={{ color: 'var(--txf)' }}>{de ? chosen.subDe : chosen.subEn}</span>
          </p>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-x-3 gap-y-3 flex-wrap pt-4" style={{ borderTop: '1px solid var(--bd2)' }}>
            <p className="flex items-center gap-1.5 num text-[12.5px]" style={{ color: 'var(--tx2)' }}>
              <Truck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
              <span>{s.delivery} {delivery}</span>
            </p>
            <Link
              to={`/starter-set?set=${chosen.opt.id}`}
              viewTransition
              className="ml-auto inline-flex items-center gap-1.5 min-h-11 px-5 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {s.setCta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductShelf({ de, t, onCompare }: {
  de: boolean;
  t: TranslationType;
  onCompare: () => void;
}) {
  const s = t.products.shelf;
  const delivery = getEstimatedDelivery(de ? 'de' : 'en');

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {/* ── Wachs ──
          08/2026, zweiter Anlauf: Der max-w-[880px]-Deckel von der ersten
          Runde (Ziel: Wax-Tafeln sollen nicht "viel groesser" wirken als
          Set/Ketten/Rewax) loeste das Groessenproblem nur zur Haelfte und
          erzeugte ein neues — Lucas Screenshot vom 21.08. zeigt es: die
          Tafeln blieben bei 1400px Viewport 424×488px gross (Seitenverhaeltnis
          4:4.6), waehrend die Dreierreihe darunter volle Breite nutzt
          (1120px) und pro Kachel nur 357×295px (4:3.3) misst. Der Deckel
          schnitt die Wachs-Reihe bei 880px ab, die Reihe darunter geht bis
          1260px — 240px Leerraum rechts neben den Tafeln, plus die Tafeln
          selbst deutlich hochformatiger als die Kacheln. Zusammen ergab das
          genau "zu gross, nicht zentral, nicht wie aus einem Guss".
          Jetzt: kein Deckel mehr, volle Sektionsbreite wie die Reihe darunter
          (behebt den Leerraum), und dasselbe Seitenverhaeltnis 4:3.3 wie
          SecondaryTile (behebt den Formfaktor-Bruch) — bei zwei Spalten statt
          drei ergibt das bei 1400px rund 544×449px statt vorher 424×488px:
          breiter, aber deutlich weniger hochformatig, und dieselbe
          Bildsprache wie die Kacheln darunter statt eines eigenen
          Seitenverhaeltnisses. Kein mx-auto (Section.tsx-Regel: linke Kante
          bleibt an derselben Stelle wie jede andere Sektion) — jetzt auch
          nicht mehr noetig, da die Reihe von selbst die volle Breite traegt.

          08/2026, dritter Anlauf: Lucas Wunsch, die Sektion auf einem
          Desktop-Bildschirm moeglichst ohne weiteres Scrollen zu zeigen.
          Das Foto ist mit Abstand der groesste Posten einer Tafel (~70 % der
          Hoehe), also dort gekuerzt statt an Preis/Groessenschalter/Kauf-
          zeile, die schon auf ihr Minimum (min-h-11 Klickflaeche) sitzen.
          Seitenverhaeltnis jetzt 16:10 statt 4:3.3 — bei 1440px Viewport
          faellt die Tafel dadurch von 719px auf 550px Hoehe. Bewertungs-
          Sterne und Lieferdatum ausserdem in eine gemeinsame Zeile
          zusammengelegt (vorher zwei), spart eine weitere Zeile samt
          Abstand. */}
      <div>
        <div className="mb-4">
          <p className="eyebrow">{s.waxEyebrow}</p>
        </div>

        {/* /kettenwachs (Seitenordnung Chat 2): drei gleich hohe Karten statt
            zwei Tafeln plus einer separaten Set/Ketten/Rewax-Reihe — das
            Regal zeigte vorher fuenf Kacheln auf der Startseite, jetzt lebt
            nur noch Wachs plus Set hier, Ketten und Rewax stehen als eigene
            Tueren weiter unten auf der Seite (ProductDoors, kleine Variante).
            items-stretch (Grid-Standard) haelt alle drei Fusszeilen auf
            gleicher Hoehe, solange die Karten gleich viele Zeilen Text
            haben. */}
        <div className="grid gap-8 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <WaxPanel
            variant="classic"
            de={de}
            t={t}
            image="/images/shelf/wax-classic"
            alt={de ? 'Blauer Waxcelerate Classic Wachsblock auf Schiefer' : 'Blue Waxcelerate Classic wax block on slate'}
            delivery={delivery}
          />
          <WaxPanel
            variant="pro"
            de={de}
            t={t}
            image="/images/shelf/wax-pro"
            alt={de ? 'Schwarzer Waxcelerate Pro Wachsblock mit MoS₂ auf Schiefer' : 'Black Waxcelerate Pro wax block with MoS₂ on slate'}
            delivery={delivery}
          />
          <StarterSetPanel de={de} t={t} delivery={delivery} />
        </div>

        {/* Vorher ein reiner Fliesstext ohne Rahmen — neben zwei Tafeln mit
            eigener Kaufhandlung ging er optisch unter, obwohl er fuer alle
            interessant ist, die noch zwischen Classic und Pro schwanken.
            Jetzt ein Chip mit Rahmen, wie der Groessenschalter oben in
            jeder Tafel — dieselbe Grammatik "Rahmen = anklickbar" statt
            eines neuen Musters, plus Icon und dauerhaft sichtbarer Rahmen
            statt reiner Hover-Erkennbarkeit. */}
        <button type="button" onClick={onCompare}
          className="group mx-auto mt-6 flex items-center gap-2 min-h-11 px-4 rounded-full text-[13.5px] font-semibold border transition-all duration-200 hover:bg-[var(--accent-wash)]"
          style={{ borderColor: 'var(--accent-soft)', color: 'var(--tx2)' }}>
          <ArrowLeftRight className="h-3.5 w-3.5" style={{ color: 'var(--accent-soft)' }} aria-hidden />
          {t.products.decisionAid} <span style={{ color: 'var(--accent-soft)' }}>{t.products.compareBtn}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--accent-soft)' }} aria-hidden />
        </button>
      </div>

      {/* PAngV: bis 09/2026 stand auf dieser Sektion (Wachs-Tafeln, Set)
          zu Steuer und Versandkosten nichts, obwohl hier ueberall Preise
          stehen — dieselbe Luecke, die die Produktdetailseite in Etappe 1
          geschlossen hat. Einmal fuer die ganze Sektion statt auf jeder
          Kachel wiederholt, gleiches Muster wie die "Shared info"-Zeile bei
          der Kettenliste in products.tsx. */}
      <PriceNote de={de} t={t} />
    </div>
  );
}
