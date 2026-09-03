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
import { ArrowRight, ArrowLeftRight, ExternalLink, Star, Truck } from 'lucide-react';
import { products, accessories, starterSetPrice, canCheckout } from '@/lib/data';
import type { TranslationType } from '@/lib/i18n';
import { AddToCartButton } from '@/components/AddToCartButton';
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
// Konfigurator nutzt — nie eine getippte Zahl, die davon abdriften kann.
const minSetPrice = starterSetPrice(
  minPrice('wax') + minPrice('chain') + accessories.reduce((sum, a) => sum + a.price, 0),
);

// ── Eine Wachs-Tafel ────────────────────────────────────────────────────────
// Foto traegt den Namen, die Haarlinien darunter tragen die Zahlen. Der
// Groessenschalter tauscht das ganze Produkt aus (Preis, Grundpreis,
// Anwendungen, eBay-Link), damit aus vier Karten zwei Tafeln werden.
function WaxPanel({ variant, de, t, image, alt, delivery }: {
  variant: Variant;
  de: boolean;
  t: TranslationType;
  image: string;
  alt: string;
  delivery: string;
}) {
  const [size, setSize] = useState<Size>('500');
  const product = waxOf(variant, size);
  const s = t.products.shelf;
  const accentColor = variant === 'pro' ? '#4A72D4' : 'var(--accent-soft)';
  const { soldRounded, reviews } = variantStats(variant);

  const grams = parseInt(product.weight!);
  const per100 = eur(product.price / (grams / 100), de);

  const sizeBtn = (v: Size) => {
    const active = size === v;
    return (
      <button
        key={v}
        type="button"
        onClick={() => setSize(v)}
        aria-pressed={active}
        className={`num-data inline-flex items-center justify-center min-h-11 min-w-11 px-4 rounded-lg text-[12.5px] leading-none border transition-all ${
          active ? 'text-wx-tx1' : 'text-wx-txm hover:text-wx-tx2'
        }`}
        style={{
          borderColor: active ? 'var(--accent-soft)' : 'var(--bd)',
          background: active ? 'var(--accent-wash)' : 'transparent',
        }}
      >
        {v} g
      </button>
    );
  };

  return (
    <div className="shelf-card group flex flex-col rounded-[20px] overflow-hidden">
      {/* Foto — ganzflaechig, ohne Scrim und ohne Text darauf.
          09/2026: Der Name lag vorher IM Bild und brauchte dafuer einen
          Verlauf, der die untere Bildhaelfte zu 76 % schwarz uebermalte —
          bei einem Motiv, das seine Wirkung aus Farbe zieht (blauer Block vor
          gruenem Bokeh), kostet das genau die Farbe. Lucas Urteil dazu:
          "die Wachsbilder sind irgendwie so duester und nicht farbenfroh".
          Jetzt traegt das Foto nur noch die Auszeichnung und den Hover-Pfeil,
          beide mit eigenem Fond; Name und Einsatzzeitraum stehen im Block
          darunter, wo sie ohnehin neben dem Preis hingehoeren. Nebeneffekt:
          eine Zeile weniger Gesamthoehe, weil Titel und Preis sich jetzt eine
          Zeile teilen statt uebereinander zu stehen. */}
      <Link
        to={`/produkt/${product.id}`}
        className="relative block overflow-hidden aspect-[16/10]"
        style={{ background: 'var(--hero-stage)' }}
        aria-label={variant === 'classic' ? s.classicName : s.proName}
      >
        <picture>
          <source srcSet={`${image}-800.webp 800w, ${image}.webp 1000w`} sizes="(max-width: 640px) 92vw, 46vw" type="image/webp" />
          <img
            src={`${image}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="photo-wax absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>

        {/* Hover-Pfeil oben rechts — spiegelt die Auszeichnung oben links und
            gibt WaxPanel dieselbe Klick-Signatur wie SecondaryTile darunter.
            Erst beim Hover sichtbar, damit die Karte in Ruhe nicht ueberladen
            wirkt (siehe Recherche zu "reveal on hover" statt Dauerpraesenz). */}
        <span
          aria-hidden
          className="absolute top-4 right-4 flex items-center justify-center h-9 w-9 rounded-full opacity-0 -translate-y-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0"
          style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.28)' }}
        >
          <ArrowRight className="h-4 w-4" style={{ color: '#fff' }} />
        </span>

        {/* Auszeichnung oben links.
            Classic und Pro standen bisher als zwei voellig gleichwertige
            Tafeln nebeneinander — gleiche Groesse, gleiche Gestaltung, kein
            Hinweis, welche die uebliche Wahl ist. Die eigenen Verkaufszahlen
            sagen etwas anderes: von 236 verkauften Wachsbloecken sind 207
            Classic (87 %). Wer zwei gleich grosse Tafeln sieht, muss eine
            Entscheidung treffen, die 87 % der Kaeufer gar nicht haben.
            Wichtig: Die Auszeichnungen sagen NICHT "diese ist besser" — das
            waere bei zwei Produkten im selben Regal ein Widerspruch. Classic
            traegt eine Tatsache (meistgekauft), Pro einen Anwendungsfall
            (Winter & E-Bike). So beantwortet die Karte "welche bin ich?"
            statt "welche ist besser?". */}
        <span className="absolute top-4 left-4 rounded-full px-2.5 py-1 text-meta font-semibold"
          style={{
            background: variant === 'classic' ? 'rgba(255,255,255,0.94)' : 'rgba(10,10,12,0.72)',
            color: variant === 'classic' ? '#101013' : 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(6px)',
            border: variant === 'classic' ? 'none' : '1px solid rgba(255,255,255,0.22)',
          }}>
          {variant === 'classic' ? s.classicBadge : s.proBadge}
        </span>
      </Link>

      {/* Infoblock — vorher lose auf dem Seiten-Hintergrund, nur mit einer
          oberen Haarlinie vom Foto getrennt. Auf Mobile mit sechs bis acht
          Einzelelementen darunter (Groessenschalter, Preis, drei Chips,
          Social-Proof-Zeile, zwei Buttons) reicht eine einzelne obere Linie
          als Gruppierungssignal nicht — das Gestalt-Prinzip "Common Region"
          (NN/g) sagt: eine Flaeche bindet lose Elemente zu einer Einheit
          zusammen, eine Linie an nur einer Kante schwaecher. Flaeche und
          Rahmen liegen jetzt auf .shelf-card (index.css), damit Foto und
          Block als eine Karte lesen und dieselbe blaue Hover-Kante tragen
          wie die Kacheln darunter. */}
      <div className="px-4 pt-3.5 pb-4">
        {/* Zeile 1: Name links, Preis rechts. Beide Enden der Zeile belegt —
            vorher stand rechts der Preis und links der Groessenschalter,
            waehrend der Name eine eigene Zeile im Foto hatte. */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* <p>, nicht <h3>: index.css erzwingt im Hellmodus global
                `h1,h2,h3,h4 { color: var(--tx1) !important }` — hier zwar
                dieselbe Farbe, aber SecondaryTile und WaxPanel bleiben so in
                derselben Auszeichnung. */}
            <p className="font-display font-bold leading-[1.1] tracking-[-0.02em]"
              style={{ color: 'var(--tx1)', fontSize: 'clamp(1.15rem, 1.9vw, 1.4rem)' }}>
              {variant === 'classic' ? s.classicName : s.proName}
            </p>
            <p className="num-data text-[12px] mt-0.5 truncate" style={{ color: 'var(--txm)' }}>
              {variant === 'classic' ? s.classicFor : s.proFor}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="num text-[21px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
              {eur(product.price, de)}
            </span>
            <p className="num-data text-meta mt-1" style={{ color: 'var(--txf)' }}>
              {per100} {s.per100}
            </p>
          </div>
        </div>

        {/* Spezifikationen als Chips — dieselbe Kartensprache wie ChainCards
            Speed/Glieder-Chips weiter unten in dieser Datei, statt eines
            eigenen, mit "·" verketteten Mono-Satzes. Drei getrennte Fakten
            statt ein Satz, den man erst parsen muss. */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[
            `${product.intervalDry} ${s.dryInterval}`,
            `${product.applications} ${s.uses}`,
            variant === 'classic' ? s.classicFormula : s.proFormula,
          ].map((label) => (
            <span key={label} className="num-data text-[10.5px] px-2 py-1 rounded-md"
              style={{ background: 'var(--sf3)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
              {label}
            </span>
          ))}
        </div>

        {/* Zeile 3: Groessenschalter links, sozialer Beweis rechts. Vorher
            standen Bewertung/Verkaufszahl und Lieferdatum zusammen in einer
            eigenen Zeile und der Schalter in der Preiszeile — drei Zeilen fuer
            drei Aussagen, jede nur halb belegt. Jetzt zwei Zeilen, beide an
            beiden Enden belegt (Lucas "viel Deadspace"). Bezieht sich auf die
            Formel (Classic/Pro) statt die Groesse, siehe variantStats() oben —
            sonst springt die Zahl beim Groessenwechsel. */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mt-3">
          <div className="flex gap-1.5">{(['300', '500'] as Size[]).map(sizeBtn)}</div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {reviews > 0 && (
              <>
                <div className="flex gap-px flex-shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" style={{ color: '#F5A623' }} aria-hidden />
                  ))}
                </div>
                <span className="num-data text-meta font-medium" style={{ color: 'var(--txm)' }}>
                  {reviews} {s.reviewsShort}
                </span>
              </>
            )}
            {soldRounded >= 20 && (
              <span className="num-data text-meta" style={{ color: 'var(--txf)' }}>
                {reviews > 0 && '· '}{soldRounded}+ {s.soldUnits}
              </span>
            )}
          </div>
        </div>

        {/* Zeile 4: Kaufzeile links, Lieferdatum rechts — das Datum fuellt den
            Platz, der rechts neben zwei Buttons ohnehin frei bleibt, statt
            eine eigene Zeile zu belegen. */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mt-3.5">
          <div className="flex items-center gap-2.5">
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
          {/* War ein reiner Textlink neben einem gefuellten Button — daneben
              praktisch unsichtbar, obwohl er zur Produktseite mit allen
              Details, Bewertungen und FAQ fuehrt. Jetzt als Rahmen-Button auf
              Augenhoehe mit dem eBay-Button (gleiche Groesse, ohne dessen
              Flaeche zu kopieren), damit die Seite nicht nur "eBay oder
              nichts" signalisiert. */}
          <Link to={`/produkt/${product.id}`}
            className="inline-flex items-center gap-1 min-h-11 px-4 rounded-full text-[13px] font-semibold border transition-colors duration-150 hover:bg-[var(--accent-wash)]"
            style={{ borderColor: 'var(--bd)', color: 'var(--tx2)' }}>
            {s.details} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          </div>
          <span className="flex items-center gap-1.5 num-data text-meta whitespace-nowrap" style={{ color: 'var(--txff)' }}>
            <Truck className="h-3 w-3 flex-shrink-0" style={{ color: accentColor }} aria-hidden />
            {s.delivery} {delivery}
          </span>
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
export function SecondaryTile({ image, imageW, eyebrow, title, body, cta, alt, price, dark, index, ...action }: {
  image: string; imageW: number; eyebrow: string; title: string; body: string; cta: string; alt: string;
  /** Fertig formatierter Preis-String ("ab 57,63 €"). Macht aus der Kachel
      sichtbar ein Kaufangebot statt eines reinen Editorial-Links — ohne
      Preis war auf Mobile nicht erkennbar, dass hier etwas verkauft wird. */
  price?: string;
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
      <div className="relative overflow-hidden aspect-[16/10]" style={{ background: 'var(--hero-stage)' }}>
        <picture>
          <source srcSet={`${image}-800.webp 800w, ${image}.webp ${imageW}w`} sizes="(max-width: 640px) 92vw, 30vw" type="image/webp" />
          <img
            src={`${image}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="photo-neutral absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>
        <span aria-hidden className="absolute inset-0"
          style={{ background: dark
            ? 'linear-gradient(to top, rgba(var(--scrim-rgb),0.34) 0%, rgba(var(--scrim-rgb),0) 42%)'
            : 'linear-gradient(to top, rgba(var(--scrim-rgb),0.18) 0%, rgba(var(--scrim-rgb),0) 36%)' }} />
        {index && (
          <span className="absolute top-3.5 left-3.5 flex items-center justify-center h-6 w-6 rounded-full num-data text-[11px] font-semibold"
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

        {/* CTA als eigenstaendiger, gefuellter Button statt einer leicht
            getoenten Pille im Fliesstext-Stil — dieselbe Buy-Button-Grammatik
            wie die Kauf-CTAs oben in dieser Datei. Dauerhaft gefuellt, nicht
            per :hover ein-/ausgeblendet: auf Touch gibt es kein "vorher". */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3.5">
          {price && <span className="num text-[15px] font-bold flex-shrink-0" style={{ color: 'var(--tx1)' }}>{price}</span>}
          <span
            className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-full text-[13px] font-semibold flex-shrink-0 transition-all duration-200 group-hover:opacity-90"
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

export function ProductShelf({ de, t, onOpenChains, onCompare }: {
  de: boolean;
  t: TranslationType;
  /** Setzt den Schaltungsfilter und oeffnet die Kettenliste. */
  onOpenChains: (speed: 'all' | '11' | '12') => void;
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

        <div className="grid gap-8 sm:gap-6 sm:grid-cols-2">
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

      {/* ── Set / Ketten / Rewax ──
          Eine Kachelsprache, eine Reihe — und seit dieser Fassung mit einer
          eigenen Ueberschrift. Ohne sie las sich die Sektion als flache Liste
          aus fuenf gleichrangigen Bloecken (zwei Tafeln, drei Kacheln); alles
          gleich laut ist dasselbe wie nichts laut. Die drei Kacheln sind aber
          keine drei weiteren Produkte, sondern drei Antworten auf denselben
          Einwand — "ich will kein Wachs schmelzen". Genau so benannt, wird
          aus der Liste ein Argument. */}
      <div>
        <div className="mb-4 sm:mb-6">
          <h3 className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.25rem, 2.4vw, 1.65rem)', color: 'var(--tx1)' }}>
            {s.altTitle}
          </h3>
          <p className="text-[13.5px] mt-1.5" style={{ color: 'var(--txm)' }}>{s.altBody}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 sm:gap-6">
        <SecondaryTile
          index={1}
          to="/starter-set"
          image="/images/shelf/starter-box" imageW={1200}
          eyebrow={s.setEyebrow} title={s.setTitle}
          body={s.setBody}
          price={`${de ? 'Ab' : 'From'} ${eur(minSetPrice, de)}`}
          cta={s.setCta}
          alt={de ? 'Offener Versandkarton mit Waxcelerate Wachsblöcken' : 'Open shipping box with Waxcelerate wax blocks'}
        />
        <SecondaryTile
          index={2}
          onClick={() => onOpenChains('all')}
          image="/images/shelf/chains-flat" imageW={1400}
          eyebrow={s.chainsEyebrow} title={s.chainsTitle}
          body={s.chainsBody}
          price={`${de ? 'Ab' : 'From'} ${eur(minPrice('chain'), de)}`}
          cta={s.chainsAll}
          alt={de ? 'Vorgewachste Fahrradketten mit Quick-Link auf Schiefer' : 'Pre-waxed bicycle chains with quick link on slate'}
        />
        <SecondaryTile
          index={3}
          to="/kette-wachsen-lassen"
          image="/images/blog/chains-hanging-gold-1600" imageW={1600}
          eyebrow={s.rewaxEyebrow} title={s.rewaxTitle}
          body={s.rewaxBody}
          price={s.rewaxFrom}
          cta={s.rewaxCta}
          alt={de ? 'Frisch gewachste Ketten hängen zum Aushärten' : 'Freshly waxed chains hanging to cure'}
          dark
        />
        </div>
      </div>
    </div>
  );
}
