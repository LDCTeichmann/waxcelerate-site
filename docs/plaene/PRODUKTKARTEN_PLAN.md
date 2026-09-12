# Produktkarten, Kettenseite und Typografie — Plan

**Stand:** 12.09.2026, zweite Fassung · **Auslöser:** Lucas Screenshot-Feedback
zu Regal, Kettenliste, Wachs-Tafeln und Rewax-Kachel („viel zu chaotische Cards
und Infos", „Rabatt nicht signifikant genug", „die Schriftart will ich generell
nicht auf der Website").

**Ziel:** Conversion und Design. Weniger Reibung, ehrlichere Signale, eine
einzige Kartensprache, eine einzige Schriftfamilie für Zahlen.

**Zweite Fassung:** Die erste ist gegen den Code geprüft worden. Vier ihrer
Annahmen waren falsch, sechs Entscheidungen sind nach besserem Nachdenken
anders ausgefallen. Beides steht unten als K1 bis K10 — wer nur eine Sache
liest, liest diesen Abschnitt.

**Wie du das liest:** 🔨 = sofort umsetzbar. 🙋 = nur Luca kann liefern. Jede
Stufe ist für sich lieferbar und einzeln committbar.

---

## 0. Lucas Entscheidungen (verbindlich)

| Frage | Antwort |
|---|---|
| eBay-Versand im Preis enthalten | **ja**, Wachs und Ketten |
| Wachs-Staffel | **5 / 10 / 15 %** — der Code gilt, das Skill ist veraltet |
| Rewax-Turnaround | **3–5 Werktage** |
| Rewax-Preisdarstellung | Entscheidung an mich delegiert, siehe §3 |
| Mono-Schrift | „was am sinnvollsten ist und am besten aussieht", siehe §3 |
| Echte eBay-Bewertungen je Kette | **ja, existieren** |
| Umfang der Versandaussage | **alles, gekoppelt an `checkoutEnabled`** |
| Zuschnitt der Umsetzung | ein Auftrag mit **Pflicht-Zwischenstopp nach Stufe 2** |

---

## 1. Der Befund: neun Beschwerden, fünf Ursachen

| # | Ursache | Was daraus sichtbar wurde |
|---|---|---|
| U1 | **Zwei Kartensprachen für dieselbe Sache.** `.shelf-card` im Regal gegen den eigenen Satz der Kettenkarte in `products.tsx` (andere Bild-Ratio, andere Badges, andere Schatten). | „chaotisch", uneinheitliche Chips, CTA ohne gemeinsame Grundlinie |
| U2 | **IBM Plex Mono als Info-Schrift** (`.num-data`, 83 Verwendungen, dazu die `MONO`-Konstante in `products.tsx:21` und ein Inline-`fontFamily` in `ProductStagePage.tsx`), teils bei 10,5 px im blassesten Ton. | „lässt sich schlecht lesen", „passt nicht zu anderen Elementen" |
| U3 | **Kaufsignale in der schwächsten Typo-Stufe.** Sterne, verkaufte Stück, Staffel und Lieferdatum stehen zusammen in einem grauen Fußstreifen. | „sieht man wichtige Infos nicht richtig", „Rabatt nicht signifikant genug" |
| U4 | **Zustandswechsel ohne URL.** Die Kettenliste ist ein `useState`, der das Regal ersetzt (`products.tsx:177-198`). | doppelte Überschrift, 13-px-Textlink als einziger Rückweg, nicht teilbar, nicht indexierbar |
| U5 | **Ungeprüfte und fehlende Fakten.** „voller Käuferschutz" (falsch), keine Versandaussage, keine Lieferzeit bei Set und Rewax, Rewax-Preisanker am teuersten Einzelpreis. | die restlichen vier Beschwerden |

---

## 2. Zehn Korrekturen an der ersten Fassung

### Aus der Code-Prüfung

**K1 · Mobile bleibt einspaltig.** Die erste Fassung wollte 2 Spalten unter
640 px. Bei 390 px Viewport blieben je Karte rund 173 px, davon 149 px
Inhalt — „Bei eBay kaufen" passt dort nicht in eine Zeile, und genau an
dieser Breite ist im Regal schon ein Layout zerbrochen (`docs/DESIGN.md` §4,
dritter Anlauf). Neu: **1 / 2 / 3 / 4 Spalten** bei
`<640 / ≥640 / ≥1024 / ≥1280`. Acht Ketten ergeben auf dem Desktop zwei
saubere Reihen, und der echte Button unten rechts bleibt auf jeder Breite.

**K2 · Kein Button in einem Link.** `ChainCard` (`products.tsx:309-418`)
wickelt die ganze Karte in einen `<Link>` und legt den eBay-`<button>`
hinein, abgefangen mit `preventDefault` + `stopPropagation`. Ein `<button>`
in einem `<a>` ist ungültiges HTML und für Tastatur und Screenreader kaputt.
Neu: **Stretched-Link.** Nur der Produktname ist der Link und spannt sich per
`::after { position:absolute; inset:0 }` über die Karte; der CTA liegt mit
`position:relative; z-index:1` darüber. Kein `stopPropagation` mehr, korrekte
Fokusreihenfolge, zwei sauber getrennte Ziele.

**K3 · Drei Klassen aus der ersten Fassung gibt es nicht.**
`.photo-neutral` und `.photo-wax` sind ausgemustert, es existiert nur
`.photo-shelf` (`index.css:715-717`). `.shelf-card` (`index.css:727-730`) ist
im Ruhezustand flach (`--sf2` auf `--bd2`, kein Schatten) und hat **keinen
eigenen Radius** — der kommt aus dem Markup (`rounded-[20px]`).
Erfreulich dagegen: `.num` setzt **keine** Schriftfamilie, nur `tabular-nums`
(`index.css:1121-1125`), erbt also Libre Franklin vom Body. Der Austausch
`.num-data` → `.num` ist damit genau der gewünschte Wechsel, ohne neue Klasse.

**K4 · Die Kettenbilder laufen an der Bildpipeline vorbei.** Die Wachs-Tafeln
liefern AVIF vor WebP mit `srcSet` und `sizes` (`ProductShelf.tsx:158-172`).
`ChainCard` lädt ein nacktes `<img src={product.image}>` ohne `srcSet`, ohne
AVIF, alle acht mit `loading="lazy"` — auf einer eigenen Kettenseite wäre
damit das LCP-Bild ein Lazy-Bild. Neu: gleiche `<picture>`-Pipeline wie im
Regal, erste Reihe `fetchpriority="high"` und nicht lazy.

**K5 · Der dokumentierte Type-Check ist ein Blindgänger.** `CLAUDE.md`
Regel 5 verlangt `npx tsc --noEmit` vor jedem Commit „(pre-commit hook läuft
automatisch)". Beides stimmt nicht: die Wurzel-`tsconfig.json` hat
`"files": []` und nur `references`, der Befehl prüft also **nichts** und ist
immer grün; und es gibt **keinen Hook** (kein `.husky`, kein
`core.hooksPath`, keine aktiven `.git/hooks`, kein `prepare`/`lint-staged` in
`package.json`). `docs/SEO_TECHNIK.md:137-139` nennt den richtigen Befehl
bereits: **`npx tsc -b --force`**. `CLAUDE.md` wird entsprechend korrigiert.

### Aus besserem Nachdenken

**K6 · Der Preis-Hebel beim Wachs ist nicht die Staffel.** Bestätigt sind
5 / 10 / 15 %. Auf einen zweiten Block sind das **3,00 €** — eine prominente
Tabelle würde ein schwaches Angebot groß machen. Viel stärker ist die
Rechnung, die heute nirgends steht: 29,95 € bei 20–32 Anwendungen sind
**ca. 0,95 bis 1,50 € je Wachsvorgang**. Gourville (1998) ist der klassische
Beleg: „85 Cent am Tag" erreichte 52 % Zustimmung, die rechnerisch
identischen „300 $ im Jahr" nur 30 %. Für ein Verbrauchsgut ist diese
Rechnung ehrlich und wirksam (für eine einmalige Anschaffung wäre sie es
nicht, weil sie dann die Bindungsdauer betont). Neu: **je-Anwendung-Zeile als
Hauptsignal, Staffel als kompakter Zusatz.**
Der **Grundpreis je 100 g bleibt** — bei Ware nach Gewicht ist er nach PAngV
Pflicht, kein Designelement. Nicht wegräumen.

**K7 · Bewertungen ja, strukturierte Daten nein.** Echte eBay-Bewertungen
kommen auf die Kettenkarten. Aber `ProductDetailPage.tsx:530-537` verzichtet
bewusst und begründet auf `aggregateRating` im JSON-LD, weil eBay-Feedback
kontoweit ist und produktweise ausgespielt wie erfundenes Review-Markup
wirkt; `docs/SEO_TECHNIK.md:79-84` hält denselben Verzicht fest, er wurde
zweimal aktiv rückgängig gemacht. Der Verzicht bleibt: die Zahlen erscheinen
**sichtbar auf der Karte, nicht im Schema**.
Nebenbefund: `Stars.tsx:12` kann keine halben Sterne (harter Vergleich
`i < rating`), und im Repo existieren **drei** Sternvarianten in zwei Farben
(`Stars.tsx`, `ProductShelf.tsx:323-326`, `ProductDetailPage.tsx:851,1316`).
Eine 4,8 ist heute schlicht nicht darstellbar.

**K8 · Die Versandaussage ist im eBay-Betrieb falsch, an rund 14 Stellen.**
Nachgewiesen: `stripePriceId` ist an **keinem** Produkt gesetzt, also
`checkoutEnabled === false` (`data.ts:530-540`) und jeder Kauf-Button führt
zu eBay (einzige Ausnahme: Starter-Set geht auf WhatsApp). Trotzdem steht
unter jedem Preis „zzgl. Versandkosten, ab 50 € versandfrei", das JSON-LD
meldet Google `shippingRate` 1,80 € und eine 50-€-Schwelle
(`ProductDetailPage.tsx:545-552` plus die Prerender-Zwillingsfassung
`generate-product-html.mjs:198-218`), und der Merchant-Feed schreibt
`<g:shipping>1.80 EUR` (`generate-merchant-feed.mjs:73-80`).
Luca hat den vollen Umbau freigegeben: **alle Aussagen lesen künftig
`checkoutEnabled`.** eBay-Betrieb heißt „Versand inklusive"; sobald die
Stripe-Price-IDs gesetzt sind, kippt alles automatisch auf die echte
Versandtabelle zurück. Eine Wahrheit, kein Nachziehen von Hand.
`AGBPage.tsx:88-97` trennt beide Kanäle bereits korrekt und ist die Vorlage.

**K9 · `#produkte` bleibt, nur die Ketten-Einstiege ziehen um.** Die
Routen-Prüfung fand 17 Fundstellen für `#produkte` — Navigation, Hero-CTAs,
Footer, Abschluss-CTA, FAQ, Bewertungen, Scrollspy. Die zeigen alle auf die
**Produktsektion**, und die bleibt. Nur vier Dinge wechseln auf `/ketten`:
die beiden Rechner-Deep-Links `?ketten=…` (`SavingsCalculator.tsx:74`,
`ChainMatchCalculator.tsx:79`), das CustomEvent `wax:selectTab`
(`products.tsx:56-62`), die Regal-Kachel, und der Breadcrumb der
Ketten-Produktseiten — dort **beide** Fassungen, React
(`ProductDetailPage.tsx:652`) und Prerender (`generate-product-html.mjs:255`).

**K10 · Der eigentliche Aufwand der Route ist die Entkopplung.** Nicht die
Route kostet, sondern dass die Kettenliste heute ein `useState` **innerhalb**
der Produktsektion ist und das Regal ersetzt. Dazu: `RouteScrollReset` hängt
nur an `pathname`, ein Filterwechsel per Query-Parameter löst also keinen
Sprung nach oben aus (gut) — aber `PendingAnchorScroll` wird nur auf der
Startseite gerendert (`App.tsx:120`). Deshalb bekommen die Filter
**Query-Parameter statt Anker**, dann braucht es dort nichts Zusätzliches.

---

## 3. Die zwei Entscheidungen, die Luca delegiert hat

### Mono bleibt in den Figuren, verschwindet aus dem Verkauf

In `sections/science/` und `components/viz/InstrumentFrame` trägt die
Gleichbreite Bedeutung (Achsenwerte springen nicht beim Animieren) und ist
laut `DESIGN.md` §3 ein definierter Behälter der Marke. Auf einer
Produktkarte ist sie Dekoration, die Lesegeschwindigkeit kostet.

Zwei Fakten machen diese Trennung billig: IBM Plex Mono ist ohnehin **nicht
preloaded** (`index.html:37-38` lädt nur Fraunces und Libre Franklin), und
Libre Franklin ist **eine** Variable-Font-Datei für alle fünf Gewichte. Nach
dem Umbau lädt Plex Mono nur noch auf `/wissenschaft` und im Blog, ohne eine
Zeile Ladelogik.

### Rewax-Preis: Einzelpreis groß, Kartenpreis als Anker darunter

```
15,95 €  je Kette
mit 10er-Karte 9,45 €
```

„Ab 9,45 €" allein wäre der niedrigere Anker, erzeugt aber beim Aufschlagen
der Seite (15,95 € einzeln, 94,50 € Vorkasse) einen Bruch — teuer für eine
Marke, deren Alleinstellung Ehrlichkeit ist. Die zweizeilige Form beantwortet
beide Fragen auf einmal: „was kostet der erste Versuch" und „was kostet es
dauerhaft". Beide Zahlen aus `TEN_CARD` in `src/pages/rewax/content.ts`
gerechnet, nie getippt.

---

## 4. Recherche-Grundlage

- **Listenkarten brauchen Essential- plus 1–3 kategoriespezifische
  Attribute.** Baymard: 50 % der geprüften Shops zeigen zu wenig oder
  inkonsistent, Nutzer verwerfen dann passende Produkte — aber wahllos alle
  Attribute erzeugen genau den Clutter, den Luca sieht.
  ([Product Listing Information](https://baymard.com/blog/product-listing-information),
  [List Item Design](https://baymard.com/blog/list-item-design-ecommerce))
- **Lieferdatum schlägt Lieferzeit.** Die Nutzerfrage ist „wann ist es da",
  nicht „wie lange dauert der Versand"; 41 % der Shops machen es falsch herum.
  ([Baymard Checkout UX](https://baymard.com/blog/current-state-of-checkout-ux),
  [parcelLab](https://parcellab.com/glossary/delivery-date-estimate/))
- **Per-Nutzung-Preise bewegen Verbrauchsgüter.** Gourville 1998: „85 Cent am
  Tag" 52 % gegen 30 % bei „300 $ im Jahr"; für Einmalanschaffungen kippt der
  Effekt.
  ([Price Framing](https://www.getmonetizely.com/articles/price-framing-strategies-how-presentation-affects-perception),
  [Psychological Pricing DTC](https://eightx.co/blog/psychological-pricing-dtc))
- **Versand-inklusive-Signale auf der Karte** adressieren den häufigsten
  Abbruchgrund direkt an der Stelle der Preiswahrnehmung.
  ([Product Badges](https://tech-arms.io/blog/product-badges/))
- **Filter: Chips auf dem Desktop, Bottom-Sheet auf Mobile.** Inline-Chips
  tragen 3 bis 6 Optionen; auf Mobile ist Batch-Filterung („X Ergebnisse
  anzeigen") der interaktiven überlegen, aktive Filter gehören als
  entfernbare Chips über das Raster, X-Fläche 44 px.
  ([Baymard Filter UI](https://baymard.com/learn/ecommerce-filter-ui),
  [Filter UX Patterns](https://www.btng.studio/articles/top-ecommerce-ux-filter-design-patterns-practical-tips-for-2025/))
- **Monospace kostet Lesegeschwindigkeit und Platz** und gehört in Konsolen,
  Code und Messwerte.
  ([MIT 6.813](https://web.mit.edu/6.813/www/sp16/classes/17-typography/),
  [Leseforschung Typografie](https://legible-typography.com/en/5-overview-of-research-type))
- **Geteilte Elementübergänge** Liste → Detail sind der Paradefall der View
  Transitions API, nativ und GPU-beschleunigt, in großen Shops produktiv.
  ([Chrome Case Studies](https://developer.chrome.com/blog/view-transitions-case-studies),
  [React Router](https://reactrouter.com/how-to/view-transitions))
- **Einheitliche Kartengrößen im Raster**: der in `docs/DESIGN.md` §4
  dokumentierte A/B-Test (25.000 Besucher) zeigte 17,1 % mehr Umsatz pro
  Besucher. Das Argument gilt für U1 unverändert weiter, es ist bisher nur
  nicht auf die Kettenliste angewandt worden.

---

## Stufe 0 — Fundament: Schrift und Primitive 🔨

- `.num-data` → `.num` in allen Verkaufs- und Marketingflächen:
  `ProductShelf.tsx` (11×), `products.tsx` (1× plus die `MONO`-Konstante
  Zeile 21 und ihre zwei Verwendungen in den Spec-Pills),
  `StarterSetBuilder.tsx` (8×), `RewaxPage.tsx` (8×), `why-wax.tsx` (5×),
  `WhatChanges.tsx` (2×), `ChainFinder.tsx` (2×), `ProductDetailPage.tsx`
  (2×), `GiftPreviewModal.tsx` (2×), `StarterSetOptions.tsx`,
  `ProcessAndPaths.tsx`, `AccessoryDetailPage.tsx`, `hero/WaxDive.tsx` (4×),
  `science/ScienceTeaser.tsx`. Dazu das Inline-`fontFamily` im Varianten-Chip
  von `ProductStagePage.tsx`.
- Bleiben: `sections/science/*`, `components/viz/InstrumentFrame.tsx`,
  Blog-Codeblöcke, `SciencePage.tsx` nur bei echten Messwerten (dort stehen
  14 Verwendungen, Fließtext-Labels gehen mit um).
- Gesperrte Micro-Labels („01 MARKE", „TROCKEN") behalten ihre technische
  Anmutung über `.eyebrow` (`index.css:1018-1034`) statt über die Mono.
- Keine Verkaufsfläche unter **12 px** (`text-meta`). Kein Kaufsignal mehr in
  `--txff` — das ist ab jetzt nur noch die PAngV-Fußnote.
- **Eine** Sternkomponente statt drei: `Stars.tsx` bekommt anteilige Füllung
  (Clip-Path oder Verlauf) und eine feste Farbe; `ProductShelf.tsx:323-326`
  und `ProductDetailPage.tsx:851,1316` stellen darauf um.
- `docs/DESIGN.md` §2 um „wo Mono erlaubt ist" ergänzen, `CLAUDE.md` Regel 5
  auf `npx tsc -b --force` korrigieren (K5).

**Fertig, wenn** `grep -rn "num-data\|IBM Plex Mono" src/` nur noch
`sections/science/`, `components/viz/`, `pages/blog/`, `index.css` und
`tailwind.config.js` trifft.

---

## Stufe 1 — Eine Produktkarte 🔨

Neue Komponente `src/components/ProductCard.tsx` mit einer Anatomie und drei
Rollen (`wax | chain | path`). Ersetzt `ChainCard`, wird von
`WaxPanel`/`SecondaryTile` mitbenutzt. Wenn die vollständige Extraktion zu
groß wird: **erst** die Kettenkarte optisch auf die Regal-Grammatik bringen,
**dann** extrahieren. Optische Gleichheit ist das Ziel, geteilter Code der Weg.

```
┌──────────────────────────────┐
│  FOTO 3:2                    │  höchstens EIN Chip
│                     [Chip]   │  Ausverkauft > Auszeichnung > keiner
├──────────────────────────────┤
│  MARKE                       │  .eyebrow
│  Modellname                  │  Fraunces, 17–19 px
│  11-fach · 116 Glieder       │  12 px, --txm — Klartext statt Pills
│  ✓ Quick-Link inklusive      │  12 px, --tx2
│  ★★★★★ 12 Bewertungen        │  nur wenn Daten gepflegt
├──────────────────────────────┤  Haarlinie, Fußzeile auf --sf3
│  44,90 €         [ Kaufen ]  │  Preis links groß, CTA unten rechts
│  inkl. Versand · Mi. bei dir │
└──────────────────────────────┘
```

- Behälter `.shelf-card` plus `rounded-[20px]` plus `overflow-hidden` (K3).
- Bild einheitlich **3:2**, `<picture>` mit AVIF vor WebP (K4). 2:1 schneidet
  die Flatlays an und wäre die dritte Ratio auf einem Schirm.
- Spec-Pills verschwinden: „11-fach" stand dreimal (Overlay, Pill,
  Modellname). Eine Klartextzeile mit Trennpunkt liest sich als Fakt, drei
  Pills als Etiketten.
- Stretched-Link statt Button-im-Link (K2).
- Ausverkauft als eigener ruhiger Zustand: Foto entsättigt, Chip oben links,
  statt CTA ein Link auf dieselbe Schaltung. Heute wird nur der Button durch
  grauen Text ersetzt, die Karte sieht sonst kaufbar aus.
- 4-px-Raster für alle Innenabstände; heute stehen sechs Rhythmen auf einer
  Karte (`pt-2.5 sm:pt-3`, `pb-3 sm:pb-3.5`, `mt-0.5`, `mt-2`, `mt-2.5`,
  `mt-3.5`).
- Der Preis ist die größte Zahl der Karte. Immer. Keine zweite Fettzahl.
- Raster 1 / 2 / 3 / 4 Spalten (K1).
- **Falle:** `index.css:607-612` erzwingt im Hellmodus
  `h1,h2,h3,h4 { color: var(--tx1) !important }`. Kartentitel als `<p>`
  auszeichnen, wie `WaxPanel` es bereits tut.

### Welche Infos auf die Karte gehören

Geprüft gegen „hilft es beim Aussortieren?".

| Info | Karte? | Warum |
|---|---|---|
| Schaltung + Glieder | **ja** | der Kompatibilitätsfilter im Kopf des Kunden |
| Quick-Link inklusive | **ja** | echter Differenzierer, kostet eine Zeile |
| Lieferdatum | **ja** | siehe Stufe 2 |
| inkl. Versand | **ja** | stärkster Preis-Entlaster, jetzt belegt |
| Sterne + Bewertungen | **ja, sobald Zahlen da** | echte eBay-Werte, nie geschätzt |
| Preis je Anwendung (Wachs) | **ja** | K6 |
| Gewicht, Material, Pin-Typ | nein | Detailseite |
| „nur noch X verfügbar" | **nie** | Skill-Verbot: keine künstliche Verknappung im B2C |
| Ersparnis gegen UVP | nein | es gibt keinen belastbaren Streichpreis |

---

## Stufe 2 — Kaufsignale und die Versand-Wahrheit 🔨 + 🙋

### 2.1 Versandaussage an `checkoutEnabled` koppeln (K8)

Eine Hilfsfunktion in `data.ts` als **einzige** Quelle. Konsumenten:

| Ort | heute |
|---|---|
| `PriceNote` über `i18n.ts:145-148` / `:737-740` | 6 Render-Stellen |
| Meta-Description der Produktseite | `ProductDetailPage.tsx:496` |
| Prerender Produktseite | `generate-product-html.mjs:155`, `:381`, JSON-LD `:198-218` |
| JSON-LD React-Fassung | `ProductDetailPage.tsx:545-552` |
| Startseiten-noscript | `generate-home-html.mjs:94` |
| Meta `/versand-und-zahlung` | `generate-blog-html.mjs:637` |
| Seite `/versand-und-zahlung` | `VersandUndZahlungPage.tsx:22,28,33,49-81` |
| Merchant-Feed | `generate-merchant-feed.mjs:73-80` |
| Warenkorb-Hinweis | `CartDrawer.tsx:198-210` (50 hartkodiert statt `shipping.freeFromCents`) |

Die beiden JSON-LD-Fassungen müssen synchron bleiben
(`docs/SEO_TECHNIK.md:55-61`). 🙋 Der Versand-Haken im
Google-Merchant-Center liegt außerhalb des Repos.

### 2.2 Lieferdatum

- Karte kurz: `Mi. bei dir` (volles Datum als Screenreader-Text).
- Produktseite lang und erkennbar als Schätzung:
  `Voraussichtlich Mittwoch, 17. September bei dir`, darunter der
  Mechanismus: `Versand in 1–2 Werktagen aus Stuttgart. Bestellungen bis
  14 Uhr gehen meist am selben Tag raus.`
- **Kein Countdown.** Die 14-Uhr-Grenze darf als Satz stehen, ein laufender
  Ticker wäre künstliche Verknappung und im B2C verboten.
- `getEstimatedDelivery()` (`src/lib/utils.ts:47`) rechnet Wochenenden und
  den 14-Uhr-Schnitt bereits korrekt; es fehlt nur eine zweite
  Formatvariante und die Weitergabe an die Stellen ohne Lieferzeile.
- **Starter-Set-Kachel** bekommt dieselbe Schätzung (gleiche Sendung aus
  demselben Lager), **Starter-Set-Seite** eine Lieferzeile im Kaufblock.
- **Rewax-Kachel** bekommt **kein** Lieferdatum, sondern `TURNAROUND` aus
  `src/pages/rewax/content.ts` mit Rundpfeil statt LKW:
  `Zurück in 3–5 Werktagen ab Ankunft`.

### 2.3 Preis je Anwendung und Staffel (K6)

```
29,95 €                          5,99 € je 100 g      ← PAngV, bleibt
ca. 0,95 bis 1,50 € je Wachsvorgang                   ← neu, das Hauptsignal
[Mengenrabatt ▾]  ab 2 Blöcken günstiger              ← Chip, aufklappbar
```

Aufgeklappt die Stückpreise, Euro-Ersparnis vor Prozent, gerechnet aus
`WAX_TIERS` in Cent nach dem Muster von `bundleOffer()` (`data.ts:562-579`,
der Kommentar dort erklärt den Fließkomma-Fehler, den man sonst einbaut).
Dazu einmal der Mechanismus: `Rabatt wird bei eBay im Warenkorb abgezogen.`
Ohne diesen Satz ist die Staffel eine Behauptung, die der Kunde beim Klick
nicht wiederfindet.

### 2.4 Restliche Punkte

- **Bewertungen je Kette**: Felder in `data.ts` vorbereiten, Rendern nur wenn
  gesetzt, kein `aggregateRating` (K7). 🙋 Werte von Luca.
- **Rewax-Preis** wie §3 entschieden.
- **Käuferschutz-Zeile** `preWaxedHint` (DE und EN) ersatzlos löschen; der
  Nutzen zieht ins Nutzenband der Kettenseite.

**→ Pflicht-Zwischenstopp. Bericht an Luca, dann weiter.**

---

## Stufe 3 — `/ketten` als eigene Seite 🔨

Der `useState`-Zweig wird eine Route. Das löst Doppelüberschrift, Rückweg,
Teilbarkeit und Indexierbarkeit in einem. Ein großer Zurück-Button hätte nur
das Symptom repariert.

- Neue `src/pages/KettenPage.tsx`: eigene H1, Helmet-Meta, Breadcrumb- und
  `ItemList`-Schema, Footer, `removeStaticJsonLd()`. Route in `App.tsx` im
  Lazy-Muster der anderen (`App.tsx:21-43`, `:91-116`).
- Kopf: H1, ein Satzpaar, darunter ein Nutzenband aus drei Icons
  (Quick-Link inklusive · sofort fahrbereit · Versand inklusive). Die graue
  Sammelzeile entfällt. Wording-Regel aus dem Skill: Ketten sind
  **„handgewachst in Stuttgart"**, nie „Made in Germany".
- **Filter wird eine Leiste** statt einer 380-px-Karte: Desktop eine Zeile
  mit zwei Chip-Gruppen und Ergebniszahl, sticky unter der Navigation;
  Mobile zwei Auswahl-Chips, die ein Bottom-Sheet öffnen, abgeschlossen mit
  „X Ketten anzeigen". Überschrift, Erklärsatz und die „01/02"-Nummerierung
  entfallen. `.chip-active` (`index.css:992-997`) existiert und wird
  wiederverwendet. Zustand in **Query-Parameter** (`?marke=`, `?gang=`),
  nicht in Anker (K10). Aktive Filter als entfernbare Chips über dem Raster,
  X-Fläche mindestens 44 px. Ergebniszahl bleibt, bei 0 Treffern
  „Filter zurücksetzen" im Raster statt in der Leiste.
- Unter dem Raster eine **„Passt dazu"-Reihe** aus drei `SecondaryTile`:
  Kettenwachs, Starter-Set, Kette wachsen lassen. Die Seite endet damit nicht
  in einer Sackgasse, und wer hochscrollt, verliert nichts.
- **Zurück-Weg:** eine Pille mit Pfeil und **Ziel-Label** („Alle Ketten" /
  „Alle Produkte") auf allen Breakpoints, 44 px hoch. Ein Ziel-Label senkt
  die Klickhürde stärker als ein Richtungs-Label. Das Fallback-Ziel richtet
  sich nach `product.category` (Kette → `/ketten`, Wachs → `/#produkte`), die
  bestehende `handleBack`-Logik bleibt als Verhalten.
- **SEO-Pflichtprogramm** vollständig nach `docs/SEO_TECHNIK.md:29-41`:
  Sitemap (`generate-sitemap.mjs:49-77`), Prerender
  (`generate-blog-html.mjs`, `NEW_STATIC_PAGES:415`), `llms.txt` (`:43-53`),
  404-Liste (`generate-404-html.mjs:50-54`), Startseiten-noscript
  (`generate-home-html.mjs:80-91`), Breadcrumb beider Fassungen.
  `vercel.json` **nicht** anfassen, solange vorgerendert wird.
- Nur die vier Ketten-Einstiege umhängen, `#produkte` bleibt (K9). Alte
  `?ketten=`-Links client-seitig weiterleiten.

---

## Stufe 4 — Politur 🔨

- **Geteilte Elementübergänge** Karte → Produktseite über die View
  Transitions API. React Router 7.15 hat die `viewTransition`-Prop am `Link`
  (Prop-Name gegen die installierte Version prüfen). Gegen
  `prefers-reduced-motion` gegattert, in Browsern ohne Unterstützung
  wirkungslos.
- Erste Bildreihe `fetchpriority="high"` und nicht lazy, Rest lazy (K4).
- Filterwechsel ohne Ladezustand, rund 160 ms Überblendung, Ergebniszahl
  animiert. Die GSAP-Staffelung der Karteneinblendung bleibt wie sie ist.
- 44-px-Trefferflächen, `aria-pressed` auf den Filter-Chips,
  `scroll-margin-top` gegen die klebende Navigation.
- Kontrast- und Dark-Mode-Durchgang über alle neuen Flächen. Die
  Token-Paare stehen in `index.css:309-357` (hell) und `:460-506` (dunkel).

---

## Reihenfolge, Aufwand, Risiko

| Stufe | Aufwand | Risiko | Warum diese Reihenfolge |
|---|---|---|---|
| 0 Fundament | mittel, ~25 Dateien | niedrig | betrifft jede spätere Stufe; zuerst, sonst baut man die Mono wieder ein |
| 1 Karte | groß | mittel | Regression im Regal möglich |
| 2 Kaufsignale + Versand | groß | mittel | berührt Aussagen an Google |
| 3 `/ketten` | groß | **hoch** | Entkopplung plus SEO-Pflichten |
| 4 Politur | klein | niedrig | braucht 1 und 3 als Fläche |

---

## Offen für Luca 🙋

1. **Bewertungszahlen je Kette** aus eBay: SKU → Anzahl, Ø-Sterne, verkaufte
   Stück. Ohne echte Zahlen bleiben die Sterne aus.
2. **Zahlenkonflikt Anwendungen:** `data.ts:104` sagt 20–32 je 500-g-Block,
   das Skill `waxcelerate` sagt „1 Block ≈ 15–20 Wachsvorgänge". Die
   je-Anwendung-Zeile hängt daran; gerechnet wird mit `data.ts`.
3. **Google-Merchant-Center:** die Versand-Kontoeinstellung liegt außerhalb
   des Repos.
4. Das Skill ist mehrfach veraltet (Staffel, Rewax-Preise).
   `docs/aufgaben/SKILL_PREISE_UPDATE.md` existiert dafür.

---

## Nicht-Ziele

- Keine neuen Animationen außer den beiden in Stufe 4 genannten.
- Kein neues Farbsystem. `DESIGN.md` §1 gilt, insbesondere die
  OKLCH-Graustufen-Regel.
- Keine Änderung an Preisen, Intervallen oder technischen Zahlen. Dieser Plan
  ändert Darstellung, nicht Inhalt — mit den zwei Ausnahmen der falschen
  Käuferschutz- und der falschen Versandaussage.
- Kein Stripe- oder Checkout-Umbau. Der wartet weiter auf die Price-IDs.
