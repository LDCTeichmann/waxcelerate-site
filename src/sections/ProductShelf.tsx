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

const HAIR = { borderTop: '1px solid var(--bd)' } as const;

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
    <div className="flex flex-col">
      {/* Foto — ganzflaechig, kein Rahmen. Der Name liegt im Bild, damit er
          nicht darunter ein zweites Mal als Ueberschrift auftaucht. */}
      <Link
        to={`/produkt/${product.id}`}
        className="group relative block overflow-hidden rounded-2xl aspect-[16/10] transition-transform duration-300 ease-out hover:-translate-y-1"
        style={{ background: 'var(--hero-stage)', willChange: 'transform' }}
      >
        <picture>
          <source srcSet={`${image}-800.webp 800w, ${image}.webp 1000w`} sizes="(max-width: 640px) 92vw, 46vw" type="image/webp" />
          <img
            src={`${image}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="photo-neutral absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.42) 24%, rgba(0,0,0,0.06) 52%, rgba(0,0,0,0) 72%)' }}
        />

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
            background: variant === 'classic' ? 'rgba(255,255,255,0.94)' : 'rgba(10,10,12,0.62)',
            color: variant === 'classic' ? '#101013' : 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(6px)',
            border: variant === 'classic' ? 'none' : '1px solid rgba(255,255,255,0.22)',
          }}>
          {variant === 'classic' ? s.classicBadge : s.proBadge}
        </span>

        <div className="absolute left-5 right-5 bottom-5">
          {/* <p>, nicht <h3>: index.css erzwingt im Hellmodus global
              `h1,h2,h3,h4 { color: var(--tx1) !important }`, mit expliziten
              Ausnahmen nur fuer #home/.pdp-dark/.hero-editorial/#herkunft.
              Diese Karte stand in keiner der Ausnahmen, darum lief der Titel
              trotz `color:#fff` inline fast schwarz (rgb(16,16,19) statt
              weiss — !important auf der Klassenregel schlaegt eine nicht-
              !important Inline-Deklaration). SecondaryTile direkt darunter
              hat exakt dasselbe Problem, indem es von Anfang an ein <p> statt
              <h3> war — hier jetzt angeglichen, statt eine weitere Ausnahme
              in index.css zu sammeln. */}
          <p
            className="font-display font-bold leading-[1.05] tracking-[-0.02em]"
            style={{ color: '#fff', fontSize: 'clamp(1.3rem, 2.6vw, 1.85rem)', textShadow: '0 1px 18px rgba(0,0,0,0.4)' }}
          >
            {variant === 'classic' ? s.classicName : s.proName}
          </p>
          <p className="num-data text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.86)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            {variant === 'classic' ? s.classicFor : s.proFor}
          </p>
        </div>
      </Link>

      {/* Zahlen — Haarlinien statt Kartenfond. Wahl links, Folge rechts. */}
      <div className="mt-3 pt-2.5 flex items-end justify-between gap-4" style={HAIR}>
        <div className="flex gap-1.5">{(['300', '500'] as Size[]).map(sizeBtn)}</div>
        <div className="text-right">
          <span className="num text-[21px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
            {eur(product.price, de)}
          </span>
          <p className="num-data text-meta mt-1" style={{ color: 'var(--txf)' }}>
            {per100} {s.per100}
          </p>
        </div>
      </div>

      <p className="num-data text-meta mt-2 pt-2" style={{ ...HAIR, color: 'var(--txm)' }}>
        {product.intervalDry} {s.dryInterval} · {product.applications} {s.uses} · {variant === 'classic' ? s.classicFormula : s.proFormula}
      </p>

      {/* Verkaufszahl, Bewertungen und Lieferdatum in einer Zeile statt
          zweier — dieselben Werte wie zuvor, aber eine Kartenreihe kuerzer.
          Sterne (#F5A623) in derselben Sprache wie die Produktseite fuer ihr
          "N+ zufriedene Kunden" (siehe ProductDetailPage.tsx), Truck-Icon
          fuer das Lieferdatum ebenso von dort uebernommen. Bezieht sich auf
          die Formel (Classic/Pro) statt die Groesse, siehe variantStats()
          oben — sonst springt die Zahl beim Groessenwechsel. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
        {reviews > 0 && (
          <>
            <div className="flex gap-px">
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
        <span className="flex items-center gap-1.5 num-data text-meta" style={{ color: 'var(--txff)' }}>
          <Truck className="h-3 w-3 flex-shrink-0" style={{ color: accentColor }} aria-hidden />
          {s.delivery} {delivery}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
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
    </div>
  );
}

// ── Eine Sekundaer-Kachel ────────────────────────────────────────────────────
// Set, Ketten und Rewax teilen sich diese eine Komponente statt je eines
// eigenen Layouts. Gleiche Bildgrammatik wie WaxPanel (Foto traegt Kicker +
// Titel im Scrim), aber 4:3.3 statt 4:4.6 — die drei Quellfotos sind
// Querformate, und drei Kacheln nebeneinander brauchen ohnehin weniger Hoehe
// als zwei Kaufentscheidungen mit Groessenschalter und Preis darunter. Die
// beiden Seitenverhaeltnisse liegen bewusst naeher beieinander als frueher
// (4:5 / 4:3) — siehe DESIGN.md §4.
//
// `as`: Link fuer Set (echte Route) und Rewax (echte Route), button fuer
// Ketten (oeffnet nur einen Zustand auf derselben Seite — kein Seitenwechsel,
// also kein <a>/<Link>, sonst waere Rechtsklick/"in neuem Tab oeffnen" ein
// Versprechen, das die Seite nicht haelt).
// Exportiert: products.tsx braucht dieselbe Kachel fuer die Rewax-Karte am
// Ende der aufgeklappten Kettenliste — siehe dortiger Kommentar.
export function SecondaryTile({ image, imageW, eyebrow, title, body, cta, alt, dark, index, ...action }: {
  image: string; imageW: number; eyebrow: string; title: string; body: string; cta: string; alt: string;
  dark?: boolean;
  /** 1-3: rahmt die Kachel als einen von drei parallelen Wegen (Ziffer vor
      dem Eyebrow, dieselbe Zahlentypo wie im Formel-Vergleich). Weggelassen
      bei der Rewax-Kachel, die products.tsx einzeln unter der Kettenliste
      wiederverwendet — dort ausserhalb der Dreiergruppe ergibt eine Ziffer
      keinen Sinn. */
  index?: 1 | 2 | 3;
} & ({ to: string } | { onClick: () => void })) {
  const inner = (
    <>
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3.3]" style={{ background: 'var(--hero-stage)' }}>
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
            ? 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.1) 62%, rgba(0,0,0,0) 78%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 32%, rgba(0,0,0,0) 62%)' }} />
        <div className="absolute left-4 right-4 bottom-4">
          <p className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {index && (
              <span className="num-data" style={{ color: 'rgba(255,255,255,0.5)' }}>0{index}</span>
            )}
            {eyebrow}
          </p>
          <p className="font-display font-bold leading-[1.12] mt-1"
            style={{ color: '#fff', fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', textShadow: '0 1px 14px rgba(0,0,0,0.35)' }}>
            {title}
          </p>
        </div>
      </div>
      <p className="text-[13.5px] leading-relaxed mt-3" style={{ color: 'var(--txm)' }}>{body}</p>
      {/* Ruhender Zustand fast identisch zum reinen Textlink von vorher (kein
          Rahmen, kein Fond) — erst beim Hover waechst ein Chip dahinter, in
          derselben Farbsprache wie der Groessenschalter oben im Regal
          (--accent-wash/--accent-soft). Macht aus der Bildunterschrift einen
          Button, ohne im Ruhezustand die "keine gefuellten Kacheln"-Regel zu
          brechen (DESIGN.md §3). */}
      <span
        className="inline-flex items-center gap-1.5 mt-2.5 -ml-3 pl-3 pr-3 py-1.5 rounded-full text-[13px] font-semibold border border-transparent transition-all duration-300 ease-out group-hover:bg-[var(--accent-wash)] group-hover:border-[var(--accent-soft)]"
        style={{ color: 'var(--accent-soft)' }}
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </span>
    </>
  );

  const wrapperClass = 'group flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1';

  return 'to' in action ? (
    <Link to={action.to} className={wrapperClass}>{inner}</Link>
  ) : (
    <button type="button" onClick={action.onClick} className={`${wrapperClass} text-left`}>{inner}</button>
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
        <div className="mb-6">
          <h3 className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.25rem, 2.4vw, 1.65rem)', color: 'var(--tx1)' }}>
            {s.altTitle}
          </h3>
          <p className="text-[13.5px] mt-1.5" style={{ color: 'var(--txm)' }}>{s.altBody}</p>
        </div>

        <div className="grid gap-8 sm:gap-6 sm:grid-cols-3">
        <SecondaryTile
          index={1}
          to="/starter-set"
          image="/images/shelf/starter-box" imageW={1200}
          eyebrow={s.setEyebrow} title={s.setTitle}
          body={`${s.setBody} ${de ? 'Ab' : 'From'} ${eur(minSetPrice, de)}.`}
          cta={s.setCta}
          alt={de ? 'Offener Versandkarton mit Waxcelerate Wachsblöcken' : 'Open shipping box with Waxcelerate wax blocks'}
        />
        <SecondaryTile
          index={2}
          onClick={() => onOpenChains('all')}
          image="/images/shelf/chains-flat" imageW={1400}
          eyebrow={s.chainsEyebrow} title={s.chainsTitle}
          body={s.chainsBody}
          cta={s.chainsAll}
          alt={de ? 'Vorgewachste Fahrradketten mit Quick-Link auf Schiefer' : 'Pre-waxed bicycle chains with quick link on slate'}
        />
        <SecondaryTile
          index={3}
          to="/kette-wachsen-lassen"
          image="/images/blog/chains-hanging-gold" imageW={1600}
          eyebrow={s.rewaxEyebrow} title={s.rewaxTitle}
          body={s.rewaxBody}
          cta={s.rewaxCta}
          alt={de ? 'Frisch gewachste Ketten hängen zum Aushärten' : 'Freshly waxed chains hanging to cure'}
          dark
        />
        </div>
      </div>
    </div>
  );
}
