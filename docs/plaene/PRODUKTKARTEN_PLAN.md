# Produktkarten, Kettenseite und Typografie — Plan

**Stand:** 12.09.2026 · **Auslöser:** Lucas Screenshot-Feedback zu Regal,
Kettenliste, Wachs-Tafeln und Rewax-Kachel („viel zu chaotische Cards und
Infos", „Rabatt nicht signifikant genug", „die Schriftart will ich generell
nicht auf der Website").

**Ziel:** Conversion und Design. Weniger Reibung, ehrlichere Signale, eine
einzige Kartensprache, eine einzige Schriftfamilie für Zahlen.

**Wie du das liest:** 🔨 = sofort umsetzbar, keine Rückfrage. 🙋 = nur Luca
kann entscheiden oder liefern. Jede Phase ist für sich lieferbar und einzeln
committbar. `npx tsc --noEmit` muss nach jeder Phase sauber sein.

---

## 0. Was der Befund tatsächlich ist

Neun Einzelbeschwerden, aber nur **fünf** Ursachen. Wer die fünf behebt, löst
alle neun.

| # | Ursache | Was daraus sichtbar wurde |
|---|---|---|
| U1 | **Zwei Kartensprachen für dieselbe Sache.** `.shelf-card` (Regal: Wachs/Set/Ketten/Rewax) und die Kettenkarte in `products.tsx` (eigener `card-bg`/`card-shad`/`rounded-2xl`-Satz, eigene Badge-Grammatik, eigene Bild-Ratio 2:1 statt 16:10). | „chaotisch", uneinheitliche Chips, CTA mal links mal rechts |
| U2 | **IBM Plex Mono als Info-Schrift** (`.num-data`, 83 Verwendungen + ein hartkodierter `MONO`-Konstant in `products.tsx` + ein Inline-`fontFamily` in `ProductStagePage.tsx`). Dazu Größen bis runter auf **10,5 px** in `--txff` (der blasseste Ton). | „lässt sich schlecht lesen", „passt nicht zu anderen Elementen" |
| U3 | **Wichtige Kaufsignale liegen in der schwächsten Typo-Stufe.** Sterne, verkaufte Stück, Staffel, Lieferdatum stehen alle in 10,5–12 px Mono in `--txf`/`--txff` in einem grauen Fußstreifen — optisch eine Zeile Kleingedrucktes. | „sieht man wichtige Infos nicht richtig", „Rabatt nicht signifikant genug" |
| U4 | **Zustandswechsel ohne URL.** Die Kettenliste ist ein `useState` auf der Startseite, der das Regal *ersetzt*. Folge: doppelte Überschrift („Produkte" H2 + „Vorgewachste Ketten" H3), ein 13-px-Textlink als einziger Rückweg, kein teilbarer Link, keine indexierbare Kategorieseite. | „zu viel Info mit zwei Überschriften", „man muss das klein geschriebene Zurück finden" |
| U5 | **Ungeprüfte und fehlende Fakten.** „voller Käuferschutz" (laut Luca falsch), kein Versandhinweis auf den Karten, keine Lieferzeit bei Set und Rewax, Rewax-Preisanker am teuersten Einzelpreis. | „Käuferschutz stimmt nicht", „kostenloser Versand wird nicht gezeigt", „Preis auf der Rewax-Karte ist nicht so genial" |

---

## 1. Recherche-Grundlage

Die Entscheidungen unten sind nicht Geschmack. Was sie trägt:

- **Listenkarten brauchen Essential + 1–3 kategoriespezifische Attribute.**
  Baymard: 50 % der geprüften Shops zeigen zu wenig oder inkonsistent, Nutzer
  verwerfen dann passende Produkte. Aber: nicht wahllos alle Attribute — das
  erzeugt genau den Clutter, den Luca sieht. Für uns heißt das: Preis, Bild,
  Name, Bewertung/Beleg als Pflicht, plus **Schaltung, Glieder, Quick-Link**
  als kategoriespezifisch, und sonst nichts.
  ([Baymard: Product Listing Information](https://baymard.com/blog/product-listing-information),
  [Baymard: 2 Key Design Principles](https://baymard.com/blog/list-item-design-ecommerce))
- **Lieferdatum schlägt Lieferzeit.** Die Nutzerfrage ist „wann ist es da",
  nicht „wie lange braucht der Versand". „2 Werktage" zwingt zum Selberrechnen.
  41 % der Shops machen es trotzdem falsch herum.
  ([Baymard: Checkout UX](https://baymard.com/blog/current-state-of-checkout-ux),
  [parcelLab: Delivery Date Estimates](https://parcellab.com/glossary/delivery-date-estimate/))
- **Staffelrabatt wirkt über den Stückpreis, nicht über den Prozentsatz.**
  Die Tabelle direkt am Produkt („Menge, Gesamtpreis, Ersparnis, was sich
  ändert") bewegt das Verhalten, der Prozentsatz allein nicht.
  ([convertcart: Tiered Discounts](https://www.convertcart.com/blog/tiered-discount-ecommerce),
  [Qikify: Volume Discount Formulas](https://qikify.com/blogs/all-articles/volume-discount-pricing-formula))
- **Monospace kostet Lesegeschwindigkeit und Platz** und gehört in Konsolen,
  Code und Messwerte, nicht in Fließtext oder Labels. Proportionale Schriften
  wurden in Vergleichstests signifikant schneller gelesen als Courier & Co.
  ([MIT 6.813 Typography](https://web.mit.edu/6.813/www/sp16/classes/17-typography/),
  [Übersicht Leseforschung Typografie](https://legible-typography.com/en/5-overview-of-research-type))
- **Einheitliche Kartengrößen im Raster** sind hier schon belegt: der in
  `docs/DESIGN.md` §4 dokumentierte A/B-Test (25.000 Besucher) zeigte 17,1 %
  mehr Umsatz pro Besucher allein durch einheitliche statt gemischte Karten.
  Das Argument gilt für U1 unverändert weiter — nur ist es bisher nur auf das
  Regal angewandt worden, nicht auf die Kettenliste daneben.

---

## Phase 1 — Schrift: IBM Plex Mono raus aus dem Verkauf 🔨

**Entscheidung:** Mono verschwindet aus allem, was verkauft. Sie bleibt
ausschließlich dort, wo sie eine Bedeutung trägt statt einer Stimmung:
**Messwerte in den Wissenschafts-Figuren** (Achsen, µ-Werte, °C, Chemie) und
**Code-Blöcke im Blog**. Das ist genau die Rolle, die `index.css` in ihrem
eigenen Kommentar für `.num-data` beschreibt — sie ist nur über den ganzen
Shop hinweg zweckentfremdet worden.

Begründung, warum nicht komplett raus: In `sections/science/` ist die
Gleichbreite funktional (Zahlen unter Achsen sollen nicht springen, `LabViz`
und `FormulaGraph` sind Instrumentendarstellungen, `InstrumentFrame` ist als
Behälter in `DESIGN.md` §3 definiert). Dort ist sie Teil der Aussage. Auf einer
Produktkarte ist sie Dekoration, die Lesbarkeit kostet.

### Konkret

1. **Ersetzen: `.num-data` → `.num`** in allen Verkaufs-/Marketingflächen:
   `ProductShelf.tsx` (11×), `products.tsx` (1× + die `MONO`-Konstante Zeile 21
   und ihre zwei Verwendungen in den Spec-Pills), `StarterSetBuilder.tsx` (8×),
   `RewaxPage.tsx` (8×), `why-wax.tsx` (5×), `WhatChanges.tsx` (2×),
   `ChainFinder.tsx` (2×), `ProductDetailPage.tsx` (2×),
   `GiftPreviewModal.tsx` (2×), `StarterSetOptions.tsx`, `ProcessAndPaths.tsx`,
   `AccessoryDetailPage.tsx`, `hero/WaxDive.tsx` (4×),
   `science/ScienceTeaser.tsx`.
   Dazu das Inline-`fontFamily: "'IBM Plex Mono'…"` im Varianten-Chip von
   `ProductStagePage.tsx`.
2. **Bleiben lassen:** `science/diagrams.tsx`, `science/ContactZones.tsx`,
   `science/ChainWaxMap.tsx`, `science/FormulaGraph.tsx`, `science/LabViz.tsx`,
   `SciencePage.tsx` (14×, dort aber prüfen: Fließtext-Labels ebenfalls
   umstellen, nur Messwerte behalten), `components/viz/InstrumentFrame.tsx`,
   Blog-Codeblöcke in `BlogArticlePage.tsx`/`BlogIndexPage.tsx`.
3. **`.num` in `index.css` härten**, damit sie den Job übernehmen kann:
   `font-variant-numeric: tabular-nums;` (hat sie vermutlich schon — prüfen)
   und `font-feature-settings` unangetastet lassen. Keine neue Klasse erfinden.
4. **Gesperrte Micro-Labels** („01 MARKE", „TROCKEN", Eyebrows), die bisher
   ihre technische Anmutung aus der Mono zogen, behalten sie über die
   bestehende `.eyebrow`-Klasse bzw. `text-eyebrow` (Libre Franklin, 0.24em
   Sperrung, Versalien). Das ist bereits im Designsystem und trägt dieselbe
   Rolle ohne die Lesbarkeitskosten.
5. **Mindestgröße.** Jede Stelle, die beim Ersetzen unter **12 px** liegt,
   geht auf 12 px hoch (`text-meta`). `DESIGN.md` §2 verlangt für Figuren
   schon 11 px; für Verkaufsflächen ist 12 px die Untergrenze dieses Plans,
   weil dort keine Figurenlogik den Platz diktiert. Die 10,5-px-Stellen
   (`compat`, `multiDiscount`, Spec-Pills der Kettenkarte) sind alle in diesem
   Plan ohnehin in Umbau.
6. **Kontrast.** Kein Verkaufssignal mehr in `--txff`. `--txff` ist ab jetzt
   nur noch für echte Fußnoten (PAngV-Zeile). Sterne, verkaufte Stück,
   Lieferdatum, Staffel gehen auf `--tx2` bzw. `--txm`.
7. **Perf-Nachlauf:** nach dem Ersetzen prüfen, ob die Mono-woff2 noch im
   kritischen Pfad vorgeladen wird (`index.html` Preloads). Wenn sie nur noch
   auf `/wissenschaft` und im Blog gebraucht wird, Preload dort entfernen und
   `font-display: swap` genügen lassen. Ein Preload weniger im Head ist auf
   Mobile messbar.
8. **`DESIGN.md` nachziehen:** neuer Abschnitt „Wo Mono erlaubt ist" mit genau
   dieser Regel, damit die Schrift nicht in sechs Wochen zurückkriecht.

**Akzeptanz:** `grep -rn "num-data\|IBM Plex Mono" src/` liefert nur noch
Treffer in `sections/science/`, `components/viz/`, `pages/blog/`, `index.css`
und `tailwind.config.js`.

---

## Phase 2 — Eine Kartensprache für alles 🔨

**Entscheidung:** Die Kettenkarte hört auf, ein Sonderfall zu sein. Alle
Produktkarten der Seite nutzen `.shelf-card` als Behälter: 20 px Radius,
Haarlinien-Rahmen, blaue Hover-Kante, Foto oben randlos, getönter Textblock
darunter, Text **nie** auf dem Foto. Das ist die Form, die im Regal nach vier
Anläufen gewonnen hat (`DESIGN.md` §4) — sie hat keinen Grund, zwanzig Pixel
weiter unten anders auszusehen.

### 2.1 Gemeinsame Komponente

Neu: `src/components/ProductCard.tsx` mit **einer** Anatomie und drei Rollen
(`wax` | `chain` | `path`). Ersetzt `ChainCard` in `products.tsx` und wird von
`WaxPanel`/`SecondaryTile` in `ProductShelf.tsx` als Grundlage genutzt. Wenn
sich die vollständige Vereinheitlichung als zu groß erweist, gilt die
Reihenfolge: **erst** die Kettenkarte auf die Regal-Grammatik bringen (Radius,
Rahmen, Hover, Bildblock, Textblock, Fußzeile), **dann** die Extraktion.
Optische Gleichheit ist das Ziel, geteilter Code der Weg dorthin.

### 2.2 Anatomie (von oben nach unten, verbindlich)

```
┌─────────────────────────────┐
│  FOTO  3:2                  │   höchstens EIN Chip auf dem Foto
│                    [Chip]   │   Priorität: Ausverkauft > Auszeichnung > keiner
├─────────────────────────────┤
│  MARKE (eyebrow)            │   11 px, gesperrt, --accent-soft
│  Modellname                 │   Display-Serif, 17–19 px, --tx1
│  ● 11-fach · 116 Glieder    │   12 px, --txm — eine Zeile, keine Pills
│  ✓ Quick-Link inklusive     │   12 px, --tx2 — der Differenzierer
│  🚚 Mittwoch geliefert      │   12,5 px, --tx2, halbfett
├─────────────────────────────┤   ← Haarlinie, getönte Fußzeile (--sf3)
│  44,90 €          [ Kaufen ]│   Preis links groß, CTA unten RECHTS
│  inkl. Versand              │
└─────────────────────────────┘
```

**Warum CTA unten rechts:** Ja, Lucas Instinkt stimmt. Der Blick läuft im
Raster Z-förmig; die Preis-links/Aktion-rechts-Zeile als **letzte** Zeile der
Karte ist die Konvention, die jeder Nutzer mitbringt, und sie erzwingt eine
gemeinsame Grundlinie über alle Karten einer Reihe (`flex-1` + `mt-auto`,
wie es `SecondaryTile` schon macht). Heute steht die Kettenkarte genau so
halbrichtig da: Preis und CTA sind schon eine Zeile, aber sie sitzen ohne
Trennung im Textblock und ohne feste Grundlinie.

**Warum die Chips verschwinden:** „11-fach" steht heute dreimal — als Overlay
auf dem Foto, als Pill im Text und implizit im Modellnamen. Einmal reicht.
Drei Pills nebeneinander („12-fach", „118 Glieder") lesen sich als Etiketten,
eine Zeile Klartext mit Trennpunkt liest sich als Fakt.

**Bildbehandlung:** 3:2 statt 2:1. Kettenfotos sind Flatlays; 2:1 schneidet
sie an und erzeugt neben dem 16:10-Regal darüber eine dritte Ratio auf einem
Schirm. Drei Ratios sind der Grund, warum Runde 1 „all over the place" war.
`.photo-neutral`/`.photo-shelf` anwenden wie im Regal.

### 2.3 Rasterdichte

Luca hat recht: pro Kettenkarte wird zu viel Platz verbraucht.

| Breakpoint | heute | neu |
|---|---|---|
| < 640 px | 1 | 2 (kompakte Variante: Foto, Name, Preis, CTA-Icon) |
| ≥ 640 px | 2 | 2 |
| ≥ 1024 px | 2 | 3 |
| ≥ 1280 px | 2 | 4 |

Acht Ketten füllen damit auf dem Desktop zwei Reihen statt vier und sind ohne
Scrollen vergleichbar — das ist der eigentliche Zweck einer Liste.
Mobile 2-spaltig nur, wenn der Test zeigt, dass Modellname und Preis bei
~165 px Breite nicht umbrechen; sonst 1-spaltig bleiben. Der dritte Anlauf im
Regal ist genau an dieser Breite gescheitert (`DESIGN.md` §4), also hier
vorher messen statt hinterher reparieren.

### 2.4 Welche Infos zusätzlich auf die Karte gehören

Geprüft gegen „hilft es beim Aussortieren?" — alles andere gehört auf die
Produktseite.

| Info | Karte? | Warum |
|---|---|---|
| Schaltung + Glieder | **ja** | der Kompatibilitäts-Filter im Kopf des Kunden |
| Quick-Link inklusive | **ja** | echter Differenzierer, kostet eine Zeile |
| Lieferdatum | **ja** | siehe Phase 4 |
| „Versand inklusive" / „inkl. Versand" | **ja**, sobald 🙋 geklärt | stärkster Preis-Entlaster, siehe Phase 4 |
| Sterne + verkaufte Stück | **ja bei Wachs** (Daten vorhanden), **nein bei Ketten** | `reviewCount`/`unitsSold` sind nur an Wachs-SKUs gepflegt. Keine Zahl erfinden — Skill-Verbot „keine erfundenen Testimonials/Social Proof". Für Ketten trägt der Trust-Streifen der Seite den Beleg. |
| Gewicht, Material, Pin-Typ | nein | Detailseite |
| „nur noch X verfügbar" | **nie** | Skill-Verbot: keine künstliche Verknappung im B2C |
| Ersparnis gegenüber UVP | nein | wir haben keinen belastbaren Streichpreis |

### 2.5 Was die Karte „hochwertiger" macht

Nicht mehr Effekte, sondern weniger Ausnahmen:

- **Eine** Radiusstufe (20 px), **eine** Rahmenfarbe (`--bd`), **eine**
  Schattenleiter (Ruhe → Hover), **ein** Hover-Verhalten (Bild 1.04, blaue
  Kante, weicher Glow — existiert bereits als `.shelf-card`).
- Höchstens ein Chip auf dem Foto. Heute sind es zwei (Schaltung + Badge), was
  die Bildoberkante zerteilt.
- 4-px-Raster für alle Abstände innerhalb der Karte. Aktuell stehen
  `pt-2.5 sm:pt-3`, `pb-3 sm:pb-3.5`, `mt-0.5`, `mt-2`, `mt-2.5`, `mt-3.5`
  nebeneinander — sechs Rhythmen auf einer Karte.
- Der Preis ist die größte Zahl der Karte. Immer. Keine andere Zahl in
  Fettschrift daneben.
- Ausverkauft-Zustand als eigener, ruhiger Zustand: Foto auf
  `saturate(0.35) opacity(0.75)`, Chip „Ausverkauft" oben links, statt CTA ein
  Textlink auf die gefilterte Liste derselben Schaltung
  („Andere 12-fach Ketten"). Heute wird nur der Button durch grauen Text
  ersetzt, die Karte sieht ansonsten kaufbar aus.

---

## Phase 3 — Die Kettenseite wird eine Seite 🔨

**Entscheidung: eigene Route `/ketten`.** Der State-Toggle auf der Startseite
verschwindet.

Warum nicht der große Zurück-Button, den Luca als Option nennt: Ein Zurück-
Button repariert das Symptom, nicht die Ursache. Die Ursache ist, dass ein
Katalog-Zweig ohne URL existiert. Daraus folgen vier Probleme auf einmal, und
eine Route löst alle vier:

1. Doppelte Überschrift verschwindet — die Liste hat ihre eigene H1
   („Vorgewachste Ketten") und steht nicht mehr unter der H2 „Produkte".
2. Zurück wird trivial: Browser-Zurück funktioniert, plus Breadcrumb
   (`Start › Produkte › Ketten`) in der Kopfzeile, genau wie
   `ProductDetailPage.tsx` es bereits hat.
3. Die Seite wird teilbar und indexierbar. „Vorgewachste Fahrradkette kaufen"
   ist ein echter Suchbegriff, für den die Startseite heute nicht ranken kann,
   weil der Inhalt hinter einem Klick liegt.
4. Der Deep-Link des Rechners wird ehrlich: `/ketten?marke=shimano&gang=12`
   statt `/?ketten=shimano-12`.

**Und darunter die Fortsetzung des Sortiments** — Lucas zweite Idee, und sie
ist die richtige: unter dem Kettenraster eine Reihe aus **drei** Karten in
`SecondaryTile`-Form: **Kettenwachs** (führt zu `/#produkte`, Bild `wax-pro`),
**Starter-Set**, **Kette wachsen lassen**. Überschrift darüber:
„Passt dazu". Damit endet die Seite nicht in einer Sackgasse, und wer nach
oben scrollt, verliert nichts.

### Konkret

- Neue Datei `src/pages/KettenPage.tsx`. Inhalt der heutigen `listOpen`-Ansicht
  aus `products.tsx`, plus H1, Meta/Helmet, Breadcrumb-Schema, `ItemList`-
  Schema über die acht Ketten, Footer, `BackLink`-Ersatz (siehe Phase 6).
- Route in `App.tsx`, lazy wie die anderen.
- `products.tsx`: `listOpen`, `resetFilters`, `openChains`, `ChainCard`, die
  Rewax-Kopie und der `?ketten=`-Handler entfallen. Die Regal-Kachel „Ketten"
  wird von `onClick` auf `to="/ketten"` umgestellt (`SecondaryTile` kann das
  bereits über die `to`-Variante). Der `wax:selectTab`-Listener mit
  `detail === 'chain'` navigiert stattdessen nach `/ketten`.
- **SEO-Pflichtprogramm** nach `docs/SEO_TECHNIK.md`: Route in die Sitemap,
  Prerender-Eintrag, `llms.txt`, interne Verlinkung, Rich-Results-Prüfung.
  Das ist kein Optional — eine neue Route ohne diese Schritte ist in diesem
  Repo ein halber Release.
- Alte Einstiege müssen weiter funktionieren: `/?ketten=shimano-12` auf
  `/ketten?marke=shimano&gang=12` weiterleiten (client-seitig genügt, der
  Parameter kommt nur aus eigenen Links).

### Der Kopf der Seite

Drei Dinge statt sechs:

```
Vorgewachste Ketten                       ← H1
Ultraschall-entfettet, in Stuttgart von Hand gewachst.
Quick-Link liegt bei, Kette ist sofort fahrbereit.    ← EIN Satzpaar

[✓ Quick-Link inklusive] [✓ Sofort fahrbereit] [🚚 Versand aus Stuttgart, 1–2 Werktage]
                                          ← Nutzenband, 3 Icons, kein Kasten
```

- Der Satz „Kauf direkt über eBay mit vollem Käuferschutz" **wird ersatzlos
  gelöscht** (`preWaxedHint`, DE und EN). Laut Luca stimmt er nicht, und ein
  falsches Vertrauenssignal ist teurer als gar keines.
- „Alle Ketten: vorgewachst · Quick-Link inklusive" verschwindet als graue
  Zeile und wird zum Nutzenband oben — das ist Lucas „geht unter, besser
  positionieren".
- Die Handarbeit („Ultraschall-entfettet, von Hand gewachst") steht damit
  direkt unter der H1 statt im Kleingedruckten. Wording-Regel aus dem Skill
  beachten: Ketten = **„Handgewachst in Stuttgart"**, nie „Made in Germany".

---

## Phase 4 — Lieferung, Versand, Vertrauen 🔨 + 🙋

### 4.1 Lieferdatum oder Werktage? Beides, aber getrennt nach Ort.

Lucas Frage ist die richtige. Die Antwort der Forschung ist eindeutig: Auf der
**Karte** steht das Datum, weil die Karte eine Ja/Nein-Entscheidung in zwei
Sekunden stützen muss und „1–2 Werktage" den Kunden rechnen lässt. Auf der
**Produktseite** steht beides, weil dort der Mechanismus Vertrauen schafft:

- Karte: `🚚 Mittwoch geliefert` (nicht „Lieferung Di., 15. Sept." — das
  Datumsformat ist auf einer Karte unnötig präzise und lang; Wochentag genügt
  innerhalb der nächsten Woche, danach Wochentag + Datum).
- Produktseite: `Mittwoch, 17. September geliefert` + darunter klein
  `Versand in 1–2 Werktagen aus Stuttgart. Bestellungen bis 14 Uhr gehen
  meist am selben Tag raus.`
- **Kein Countdown, kein Ticker.** Die 14-Uhr-Grenze ist eine Tatsache und
  darf als Satz stehen; ein laufender Countdown wäre künstliche Verknappung
  und im Skill für B2C verboten.

`getEstimatedDelivery()` in `src/lib/utils.ts` rechnet das alles bereits
korrekt inklusive Wochenenden und 14-Uhr-Schnitt. Es fehlt nur eine zweite
Formatierungsvariante (kurz/lang) und die Weitergabe an die Stellen, die es
heute nicht bekommen.

### 4.2 Wo die Lieferzeile heute fehlt

| Fläche | heute | neu |
|---|---|---|
| Wachs-Tafeln | vorhanden | bleibt, aber in `--tx2` statt Fußzeilen-Grau |
| Kettenkarten | vorhanden | Kurzformat |
| **Starter-Set-Kachel** | **fehlt** | dieselbe Schätzung wie Wachs/Ketten — es ist dieselbe Sendung aus demselben Lager |
| **Starter-Set-Seite** | prüfen | Lieferzeile in den Kaufblock |
| **Rewax-Kachel** | **fehlt** | **kein** Lieferdatum, sondern Turnaround |

### 4.3 Rewax ist kein Versand, sondern eine Umlaufzeit

Die Zahl existiert bereits sauber und begründet in
`src/pages/rewax/content.ts`: `TURNAROUND.full = "3–5 Werktage ab Ankunft bei
uns"`, von Luca am 07.09.2026 bestätigt. Lucas „3–4 Tage" aus dem Feedback ist
die ältere Erinnerung — **die 3–5 im Code gelten**, bis er sie aktiv ändert
(🙋 falls doch 3–4 richtig ist: eine Zeile in `content.ts`, alles andere zieht
automatisch nach).

Darstellung auf der Kachel, bewusst anders als eine Lieferzeile, damit niemand
sie als Zustelldatum liest:

```
🔄 Zurück in 3–5 Werktagen ab Ankunft
```

Rundpfeil-Icon statt LKW, gleiche Typo-Stufe wie die Lieferzeile. Auf der
Rewax-Seite selbst zusätzlich die ehrliche Gesamtrechnung, die dort schon
steht: plus je 1–2 Werktage Post hin und zurück.

### 4.4 Versandkosten auf die Karte 🙋

Lucas Punkt „kostenloser Versand wird nicht gezeigt" ist berechtigt, aber die
Wahrheit ist heute kanalabhängig, und genau deshalb steht sie nirgends:

- **Eigener Shop:** ab 50 € versandfrei, darunter 1,80 / 2,90 / 4,99 €
  (`shipping` in `data.ts`, Tabelle auf `/versand-und-zahlung`).
  Der eigene Checkout ist aktuell **aus** (keine `stripePriceId` gesetzt).
- **eBay:** jeder Kauf-Button führt heute dorthin. Ob dort Versand im Preis
  enthalten ist, steht nirgends im Repo.

**🙋 Entscheidung Luca:** Ist bei den eBay-Listings der Versand im Preis
enthalten (ja/nein, für Wachs und Ketten getrennt)?

- **Wenn ja:** neues, optionales Feld `shippingIncluded?: boolean` in
  `Product` (`data.ts`), gesetzt pro SKU. Die Karte zeigt dann unter dem Preis
  `inkl. Versand` in `--tx2`. Das ist der stärkste Preis-Entlaster, den wir
  ohne Rabatt haben, und er kostet nichts.
- **Wenn nein:** die Karten zeigen nichts dazu, und die vorhandene
  `PriceNote`-Zeile (PAngV) bleibt die einzige Aussage. Dann gehört die
  „ab 50 € versandfrei"-Information erst in dem Moment prominent auf die
  Karte, in dem der eigene Checkout live geht.

Nie beides gleichzeitig behaupten. Ein „versandfrei", das beim Klick auf eBay
nicht eingelöst wird, ist genau der Vertrauensbruch, den das
Käuferschutz-Problem gerade hinterlassen hat.

---

## Phase 5 — Rabatt sichtbar machen 🔨 + 🙋

### 5.1 Der Befund

`multiDiscount` steht heute als **10,5-px-Monozeile in `--txff`** ganz unten
im Fußstreifen der Wachskarte: „Wachs-Staffel: 2 Stk. 5 % · 3 Stk. 10 % ·
ab 5 Stk. 15 %". Das ist typografisch die schwächste Stelle der ganzen Karte.
Ein Rabatt, der wie eine Fußnote aussieht, wird wie eine Fußnote behandelt.

### 5.2 Neu: Stückpreis-Staffel direkt unter dem Preis

Statt Prozentsätzen die Zahl, auf die es ankommt — was **ein Block** dann
kostet und wie viel Euro man spart:

```
29,95 €                        5,99 € je 100 g
─────────────────────────────────────────────
Mehr nehmen, weniger zahlen
  2 Blöcke    je 28,45 €     du sparst 3,00 €
  3 Blöcke    je 26,96 €     du sparst 8,99 €
  ab 5        je 25,46 €     du sparst 22,46 €
```

- Alle Zahlen aus `WAX_TIERS` in `data.ts` **gerechnet**, nie getippt. Die
  Rechnung in Cent führen, wie `bundleOffer()` es bereits vormacht (der
  Kommentar dort erklärt den Float-Fehler, den man sonst einbaut).
- **Euro-Ersparnis vor Prozent.** Gleiche Regel, die für die Rewax-
  Stempelkarten bereits im Entscheidungslog steht: „Du sparst 30 €" ist eine
  Tatsache, „38 %" eine Behauptung über einen Normalpreis.
- Platz: als aufklappbare Zeile („Mengenrabatt ▾") direkt unter dem Preis,
  auf der Produktseite dauerhaft ausgeklappt. Auf der Karte zugeklappt mit
  sichtbarem Anreißer `ab 2 Blöcken günstiger`, damit die Karte nicht wieder
  wächst.
- **Ein Chip am Preis**: `Mengenrabatt` als kleiner Akzent-Chip neben dem
  Preis. Das ist das Signal, das heute komplett fehlt.
- Solange der Kauf über eBay läuft, gehört der Mechanismus dazu:
  `Rabatt wird bei eBay im Warenkorb abgezogen.` — in `--txm`, einmal unter
  der Staffel. Ohne diesen Satz ist die Staffel eine Behauptung, die der
  Kunde beim Klick nicht wiederfindet. (`SHOW_BUNDLE_OFFER` in
  `ProductDetailPage.tsx` ist seit 11.09.2026 auf `true`, weil Luca die
  Staffel bei eBay bestätigt hat — die Formulierung darf sich darauf stützen.)

### 5.3 🙋 Zahlen-Widerspruch, den nur Luca auflösen kann

| Quelle | Staffel |
|---|---|
| `WAX_TIERS` in `src/lib/data.ts` (Website, live) | 2 → 5 % · 3 → 10 % · ab 5 → 15 % |
| Skill `waxcelerate`, `20_products_pricing.md` §4 (Stand 07/2026) | 2 → 10 % · 3 → 15 % |

Die Website ist die neuere Quelle und bleibt maßgeblich, bis Luca widerspricht
— aber der Skill sagt etwas anderes, und `docs/aufgaben/SKILL_PREISE_UPDATE.md`
existiert genau für solche Fälle. **Nicht raten, nicht stillschweigend
angleichen.** Wenn tatsächlich 10/15 % gelten, wird die Staffel als Argument
deutlich stärker und die Darstellung oben lohnt sich doppelt.

### 5.4 Rewax-Preis auf der Kachel 🙋 mit klarer Empfehlung

Heute: `Ab 15,95 €`. Das ist der **teuerste** Einzelpreis, als „ab" verkauft —
die schwächstmögliche Lesart einer Preisleiter, die bis 9,45 € runtergeht.

Lucas Vorschlag „ab 9,49 € pro Kette" trifft die richtige Zahl (exakt:
**9,45 €**, 10er-Karte 94,50 €, `TEN_CARD` in `content.ts`), hat aber einen
Haken: Wer „ab 9,45 €" liest und auf der Seite 15,95 € plus eine 94,50-€-
Vorkasse-Karte findet, erlebt einen Bruch. Bei einer Marke, deren
Alleinstellung „ehrlich und technisch" ist, kostet das mehr als es bringt.

**Empfehlung — beide Zahlen, in der richtigen Reihenfolge:**

```
15,95 €  je Kette
mit 10er-Karte 9,45 €
```

Der Einzelpreis ist der Einstieg ohne Verpflichtung und steht groß. Die
zweite Zeile ist der Anker, der ihn billig aussehen lässt, und gleichzeitig
die Einladung zum Bundle — Stückpreis-Anker, genau wie bei der Wachs-Staffel
und mit derselben Forschungsgrundlage. Kaufpsychologisch ist das stärker als
„ab 9,45 €", weil es zwei Fragen auf einmal beantwortet („was kostet mich der
erste Versuch" und „was kostet es dauerhaft") statt eine zu verschleiern.

**Die Alternative, falls Luca maximalen Preis-Impact will:** Headline
`Ab 9,45 € je Kette`, direkt darunter in `--txm`: `mit 10er-Karte, einzeln
15,95 €`. Das ist zulässig, solange die Bedingung unmittelbar danebensteht,
und liefert den niedrigeren Ankerpreis. Ich würde es nicht zuerst ausspielen,
aber es ist die saubere B-Variante für einen späteren Test.

Gleiche Behandlung für die Starter-Set-Kachel prüfen: `Ab 27,92 €` ist dort
korrekt und braucht keine zweite Zeile — es ist ein echter Einstiegspreis,
kein Bündelpreis.

---

## Phase 6 — Zurück-Navigation 🔨

### 6.1 Produktdetailseite

Heute: Desktop-Breadcrumb ab `sm`, darunter ein 13-px-Textlink „Zurück".
Lucas Forderung nach einem sichtbaren Zurück-Weg ist berechtigt, vor allem
mobil.

- **Ein Zurück-Element für alle Breakpoints**, links in der Kopfleiste, als
  Pille mit Rahmen (`--bd`), 44 px Höhe, Pfeil + Text. Kein reiner Icon-Button
  — ein Label ist billiger zu verstehen als ein Symbol.
- **Kontextbewusstes Ziel statt blindem `history.back()`:** Die bestehende
  `handleBack`-Logik (`history.state.idx` prüfen, sonst `/`) bleibt als
  Verhalten, aber das **Fallback-Ziel** richtet sich nach `product.category`:
  Kette → `/ketten`, Wachs → `/#produkte`. Damit landet auch jemand, der aus
  Google direkt auf eine Kette kommt, in der Liste und nicht auf der
  Startseite.
- **Label sagt das Ziel:** „Alle Ketten" bzw. „Alle Produkte" statt „Zurück".
  Ein Ziel-Label senkt die Klickhürde messbar stärker als ein Richtungs-Label.
- Breadcrumb bleibt ab `sm` zusätzlich sichtbar (SEO-Sichtbarkeit + zweiter
  Ausgang), aber die Pille ist ab jetzt auf allen Breakpoints da.

### 6.2 `ProductStagePage`

Gleiche Behandlung, ein Label statt „Zurück" — sie führt ohnehin schon
zielgerichtet auf `/produkt/:id`.

---

## Phase 7 — Der Filter wird eine Leiste 🔨

Heute: weiße Karte, ~380 px hoch auf Mobile, mit Icon, Überschrift, Erklärsatz,
zwei nummerierten Schritten und einer Ergebniszeile — für **acht** Produkte
mit **zwei** Facetten.

**Neu: eine Leiste, eine Zeile.**

```
Marke:  [Alle] [Shimano] [SRAM] [Campagnolo]     Schaltung: [Alle] [11] [12]     8 Ketten  ↺
```

- Desktop: eine Zeile über dem Raster, zwei Chip-Gruppen durch ein feines
  Trennzeichen getrennt, Ergebniszahl rechts. Höhe ~56 px statt ~380 px.
- Mobile: zwei nebeneinanderliegende Auswahl-Chips, die ein kleines
  Auswahlblatt öffnen (`Marke ▾` / `Schaltung ▾`), aktive Auswahl steht im
  Chip. Kein Akkordeon, keine Nummerierung.
- Die Leiste wird beim Scrollen **sticky** unter der Navigation, solange das
  Raster im Bild ist. Das ist der Standard für gefilterte Listen und kostet
  keinen zusätzlichen Platz.
- Überschrift „Finde deine Kette" und der Erklärsatz entfallen. Eine
  Filterleiste über einem Produktraster erklärt sich selbst; die zwei Zeilen
  waren Kompensation für die Kartenform.
- „01 / 02" entfallen (sie waren außerdem Mono, siehe Phase 1).
- Ergebniszahl bleibt und ist wichtig — sie ist die einzige Rückmeldung, dass
  der Filter gewirkt hat. Bei 0 Treffern eine Zeile mit „Filter zurücksetzen"
  direkt im Raster, nicht in der Leiste.
- Die Zustandslogik (`brandFilter`/`speedFilter`, `compatibilityMatrix`) bleibt
  unverändert; sie zieht mit auf `/ketten` um und wird zusätzlich in die URL
  gespiegelt (`?marke=`/`?gang=`), damit ein gefiltertes Ergebnis teilbar ist.

---

## Reihenfolge, Aufwand, Risiko

| Phase | Aufwand | Risiko | Warum diese Reihenfolge |
|---|---|---|---|
| 1 Schrift | mittel, ~25 Dateien | niedrig, rein visuell | Betrifft jede spätere Phase. Zuerst, sonst baut man die Mono wieder mit ein. |
| 2 Karten | groß | mittel (Regression im Regal) | Der Kern von Lucas Kritik. |
| 4 Lieferung/Versand | klein | niedrig | Kleine Textarbeit, großer Effekt, unabhängig von Phase 3. |
| 5 Rabatt | mittel | niedrig | Braucht Phase 2 als Fläche. |
| 3 Kettenseite | groß | **hoch** (neue Route: Sitemap, Prerender, Schema, interne Links) | Erst wenn die Karten stehen, sonst zieht man eine halbfertige Liste um. |
| 7 Filter | klein | niedrig | Zieht mit Phase 3 um. |
| 6 Zurück | klein | niedrig | Braucht `/ketten` als Ziel, also nach Phase 3. |

Wer nur die Hälfte schafft: **1, 2, 4, 5** liefern den größten Teil des
sichtbaren Gewinns und berühren keine Routen. **3, 7, 6** sind der strukturelle
Teil und gehören zusammen in einen eigenen Commit.

---

## Offene Punkte für Luca 🙋

1. **eBay-Versand:** ist er bei Wachs und bei Ketten im Preis enthalten?
   (Entscheidet, ob „inkl. Versand" auf die Karten darf — Phase 4.4.)
2. **Wachs-Staffel:** gelten 5/10/15 % (Website) oder 10/15 % (Skill)?
   (Phase 5.3.)
3. **Rewax-Preisdarstellung:** Empfehlung „15,95 € je Kette / mit 10er-Karte
   9,45 €" oder die B-Variante „Ab 9,45 €"? (Phase 5.4.)
4. **Rewax-Turnaround:** 3–5 Werktage (Code, von dir am 07.09. bestätigt) oder
   3–4? (Phase 4.3.)
5. **Mono komplett weg oder in den Wissenschafts-Figuren belassen?** Mein
   Vorschlag ist: belassen, dort trägt sie Bedeutung. Sag Bescheid, wenn du
   sie wirklich nirgends mehr sehen willst — dann fällt auch der
   `InstrumentFrame`-Chip darunter.
6. **Ketten-Bewertungen:** gibt es pro Kette echte eBay-Bewertungszahlen? Wenn
   ja, kommen Sterne auch auf die Kettenkarten. Wenn nein, bleibt es beim
   Trust-Streifen — erfunden wird nichts.

---

## Nicht-Ziele

- Keine neuen Animationen. Die vorhandene GSAP-Staffelung der Karten bleibt,
  bekommt aber nichts dazu.
- Kein neues Farbsystem. `DESIGN.md` §1 gilt unverändert, insbesondere die
  OKLCH-Graustufen-Regel.
- Keine Änderung an Preisen, Intervallen oder technischen Zahlen. Dieser Plan
  ändert Darstellung, nicht Inhalt — mit der einzigen Ausnahme der falschen
  Käuferschutz-Zeile, die gelöscht wird.
- Kein Stripe/Checkout-Umbau. Der wartet weiter auf die Price-IDs.
