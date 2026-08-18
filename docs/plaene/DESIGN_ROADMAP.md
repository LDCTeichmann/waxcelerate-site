# Design-, Struktur- und Erscheinungs-Roadmap

**Stand:** 12. August 2026
**Grundlage:** vollständige Durchsicht von `docs/AUDIT.md`, `docs/DESIGN.md`,
`docs/plaene/MOBILE_PLAN.md`, `docs/plaene/UX_UPGRADE_PLAN.md`,
`docs/plaene/BLOG_PLAN.md`, `docs/archiv/LOTTIE_MOTION_BRIEFS.md`,
`docs/WISSENSCHAFT_NOTES.md` und `PROJECT.md`.

> **Wichtigste Eigenschaft dieses Dokuments:** jeder Status hier ist **gegen den
> Code und die Live-Seite geprüft**, nicht aus den Plänen übernommen. Die Pläne
> behaupten an mehreren Stellen Dinge, die nicht stimmen — in beide Richtungen.
> Wo Plan und Wirklichkeit auseinandergehen, steht das dabei.

Legende: ✅ erledigt · 🔨 offen, ich kann es · 🤔 Entscheidung nötig ·
🙋 nur Luca · ⛔ blockiert

---

## 0. SOFORT: ein rechtliches Risiko, live auf acht Seiten

### R1 — „Made in Germany" steht auf allen acht zugekauften Ketten

Auf jeder der acht Kettenproduktseiten steht sichtbar **„Made in Germany.
Wachsbehandlung in Stuttgart"**. Gebaut werden diese Ketten von Shimano, SRAM
und YBN — in Deutschland passiert nur die Wachsbehandlung.

`docs/plaene/SICHTBARKEIT_PLAN.md` §9 Phase 7 führt genau das für eBay und
Kleinanzeigen als **Herkunftsrechts-Risiko**, und die Keyword-Tabelle in §5
schreibt wörtlich vor: „Hergestellt in Stuttgart", **nie** „Made in Germany"
für die Ketten. Dass es auch auf der eigenen Website steht, ist in keinem
Dokument vermerkt — der Satz kommt aus der gemeinsamen Konstante
`v9ChainFooterNote` (`src/lib/productContent.ts:79`) und wurde damit auf alle
acht Seiten verteilt.

Beim Wachs selbst ist die Aussage richtig und bleibt.

**Geprüft:** live sichtbar auf `/produkt/chain-m8100` (Shimano).
**Vorschlag:** „Wachsbehandlung in Stuttgart. Kette von Shimano." — wahr, nimmt
nichts weg, Risiko weg. Formulierung braucht deine Freigabe.

---

## 0a. Weitere Funde aus der Durchsicht des Sichtbarkeitsplans

| | Was | Stand |
|---|---|---|
| ✅ | Phase 1 Asset-Fehler, Phase 2 Vorrendern (Start-, 12 Produkt-, 6 Rechtstextseiten) | erledigt |
| ✅ | Sitemap-Bilder absolut · Schema Versand/Rückgabe/mpn · `/hero-lab` serverseitig noindex | erledigt |
| ✅ | PFAS-Positionierung Ebene 2 (Pro-Seiten) und Ebene 3 (Classic-Kontext) | erledigt |
| 🔨 | **Ebene 1 fehlt:** `llms.txt` beschreibt die Marke weiter als „Kettenwachs **mit PTFE**" — genau der Begriff, den Stiftung Warentest zum Ausschlusskriterium erklärt, und genau die Datei, die KI-Crawler zuerst lesen | offen |
| 🔨 | **Vier Bewertungszahlen parallel:** 200+ (index.html, llms.txt), 164 (manifest.json), 145 und 150 (productContent). Dazu „auf eBay" statt kanalneutral | offen |
| 🔨 | **Acht Kettenbilder hotlinken `i.ebayimg.com`** — brechen, sobald ein Listing endet, und landen so in Sitemap, Schema und Merchant-Feed | offen |
| 🔨 | `sameAs` kennt nur eBay — Kleinanzeigen, Instagram fehlen | offen |
| 🔨 | Die zwei geplanten Artikel (PFAS, Preis pro Gramm) fehlen beide — weiterhin 18 Artikel | offen |
| 🤔 | **Englisch ohne URL:** kein `hreflang`, `lang="de"` fest. Die gesamte englische Textarbeit ist für Google und KI-Crawler unsichtbar | Entscheidung |
| 🤔 | **Widersprüchliche Zahlen live:** „3×" (12 Fundstellen, Regel sagt 2–3×), „20–32" Anwendungen (Skill sagt 15–20), µ „0,03–0,06" (selbst als strittig geführt) | Entscheidung |
| 🙋 | Drei fertig formulierte Backlink-Nachrichten warten aufs Abschicken: bikeoptimierung.de, Stiftung Warentest, speed-ville.de | nur du |
| 🙋 | Kleinanzeigen-Impressum und eBay-„Mich"-Seite — rechtlich ohnehin Pflicht, kostenlos | nur du |


## 1. Verifiziert erledigt (Design und Struktur)

Nicht abhaken, sondern zur Kenntnis: das ist bereits gebaut und live.

| | Was | Beleg |
|---|---|---|
| ✅ | **B1 Startseiten-Reihenfolge** | `App.tsx`: TrustStrip → Produkte → WarumWachs → Bewertungen → Rechner → Über → Anleitungen → FAQ → Kontakt. Live gemessen: Produkte beginnen bei **Screen 1,1** (vorher 4,0) |
| ✅ | **Startseite gekürzt** | **12,3 Screens** live gemessen, vorher 14,4 |
| ✅ | **B2 Sticky-CTA ehrlich beschriftet** | „Zu den Produkten" statt „Jetzt bestellen", solange der Knopf nur scrollt |
| ✅ | **B4 Kontrast-Tokens** | alle sechs Tokens jetzt 4,56–5,56 : 1, Kommentare korrigiert |
| ✅ | **B5 Touch-Ziele** | 44-px-Trefferflächen in `index.css` |
| ✅ | **B6 Text aus der Kassettengrafik** | „Verschleißprinzip", „Neue/Abgenutzte Kassette" sind jetzt HTML |
| ✅ | **B7a Superlativ entfernt** | „annähernd" nicht mehr in `i18n.ts` |
| ✅ | **B7d `<main>` ergänzt** | auf Produkt-, Wissenschafts- und Rewax-Seite |
| ✅ | **B8 Rewax auf Deutsch** | live: Title *und* H1 tragen „Fahrradkette wachsen lassen" |
| ✅ | **AUDIT 2 — Zahlen nicht mehr dreifach** | Hero = Ergebnis, Kacheln = Messung, Diagramm = Aufwand |
| ✅ | **AUDIT 4 — Rewax-Seite existiert** | `/kette-wachsen-lassen`, in der Navigation, aus der Produktsektion verlinkt |
| ✅ | **AUDIT 7 — Bewertungs-Marquee ist weg** | jetzt Wisch-Container ohne Eigenbewegung, tastaturbedienbar |
| ✅ | **AUDIT 8 — Dauerrabatt ist weg** | ersetzt durch die Staffel 2 Stk 5 % · 3 Stk 10 % · ab 5 Stk 15 % — genau die vom Audit vorgeschlagene Lösung |
| ✅ | **Schema: Versand + Rückgabe + mpn** | `shippingDetails`, `hasMerchantReturnPolicy`, `mpn` stehen im vorgerenderten HTML |

---

## 2. Offen — Arbeit, die ich übernehmen kann

### 2.1 🔨 Hero-Bild als WebP — der größte Performance-Hebel

`chain-bg.jpg` ist das LCP-Bild der Startseite: 262 KB JPEG, kein `<picture>`,
kein srcset. **Es wird mit `filter: blur(1.4px)` dargestellt** — Bildschärfe ist
also praktisch irrelevant. Selbst gemessen:

| Fassung | Größe |
|---|---|
| heute (JPEG) | 262 KB |
| WebP q82 | 65 KB (−75 %) |
| **WebP q72** | **46 KB (−82 %)** |

**Falle:** dieselbe Datei ist auch `og:image` für Social-Vorschauen. Die JPEG
muss dafür bleiben; WebP kommt per `<picture>` dazu. Nicht einfach ersetzen.

Aufwand klein · Risiko niedrig.

### 2.2 🔨 Typografie zu Ende bringen

Zwei Reste aus zwei Dokumenten:

- **MOBILE_PLAN B3:** noch **10 Fundstellen** unter 12 px (6× `10.5px`,
  3× `11px`, 1× `11.5px`). Die schlimmen Fälle (7–9 px) sind erledigt.
- **DESIGN §2:** darüber hinaus rund hundert Klassen unter 11 px in
  `tools.tsx`, `guides.tsx`, `reviews.tsx`, `products.tsx`, `about.tsx`,
  `contact.tsx`, `LabViz.tsx`, `FormulaGraph.tsx`. Bewusst nie angefasst, weil
  Badges und Navigation daran hängen.

Aufwand mittel · Risiko mittel (Layout-Überlauf ist der wahrscheinlichste
Nebeneffekt). **Paketweise, nie global ersetzen.**

### 2.3 🔨 `priceValidUntil` erreicht Google nicht

Der Fix vom 11.08. betrifft nur den React-Renderer. `generate-product-html.mjs`
schreibt das Feld gar nicht — und dieses HTML liest Google. Die Änderung hat
aktuell **null SEO-Wirkung**. Genau die Falle, vor der `AGENTS.md` Regel 1 warnt.

Aufwand klein · Risiko niedrig.

### 2.4 🔨 Doppeltes JSON-LD prüfen

Das ausgelieferte HTML enthält `Product` und `BreadcrumbList`; Helmet fügt beim
Hydrieren eigene hinzu. Ein JavaScript-ausführender Crawler sieht sie vermutlich
doppelt. **Das ist eine Vermutung, keine Messung.** Erst messen, dann handeln.

Aufwand klein (Messung) · Risiko niedrig.

### 2.5 🔨 Ruhiger Satz am Kaufpunkt (AUDIT 11)

Geprüft: Widerrufsrecht steht **nur** in der CartDrawer — also im abgeschalteten
Checkout. Auf der Produktseite steht am Kaufpunkt nichts. Bei einem Produkt, das
eine Verhaltensänderung verlangt, ist die stille Frage „was, wenn ich damit nicht
klarkomme" — ein Satz beantwortet sie billiger als jedes weitere Argument.

Aufwand klein · Risiko niedrig · **Formulierung solltest du freigeben.**

### 2.6 🔨 Aufräumen nach der Hero-Entscheidung

Sobald 3.1 entschieden ist: `/hero-lab` und `public/images/hero-alt/` löschen —
so steht es als Nachbedingung in `DESIGN.md §6`.

---

## 3. Offen — Entscheidung nötig, bevor irgendwer baut

### 3.1 🤔 Der Hero-Widerspruch

**Das ist der wichtigste offene Punkt des ganzen Dokuments.**

`DESIGN.md §6` hält unter dem 29.07.2026 fest: **„Gewählt: Variante A, das Foto
der hängenden gewachsten Ketten"**, mit drei sauberen Begründungen (Bild und Text
kommen sich nicht in die Quere, das Logo liegt beiläufig im Bild, das goldene
Licht gibt der Marke einen Ort). Dazu die Nachbedingung, danach `/hero-lab` und
`hero-alt/` zu löschen.

**Geprüft: nie gebaut.** Der aktive Hero (`hero-light.tsx`) nutzt weiterhin
`chain-bg.jpg` plus freigestellten Wachsblock. `hero-alt/hanging.webp` existiert,
wird aber ausschließlich von `/hero-lab` geladen.

Entweder die Entscheidung ist überholt, oder sie ist liegengeblieben. Beides ist
möglich — das musst du sagen, ich kann es nicht aus dem Code ablesen.

### 3.2 🤔 Rechner und Anleitungen auf eigene Unterseiten (AUDIT 3)

Nach dem Kaufangebot liegen heute noch: Rechner (ab Screen 5,5), Über mich (7,0),
Anleitungen (8,3), FAQ (9,5). Zusammen rund **4 Screens hinter dem Kaufpunkt.**

Das Audit nennt sie „hervorragende Inhalte, aber Retention- und
Suchmaschinen-Assets, keine Conversion-Assets". Verschiebt man Rechner und
Anleitungen auf Unterseiten mit je einem Einstieg auf der Startseite, sinkt die
Seite von 12,3 auf etwa **9,6 Screens**.

**Gegenargument, das im Plan fehlt:** die Rechner sind Verweildauer und die
Anleitungen tragen Suchbegriffe. Beides von der Startseite zu nehmen kann SEO
kosten. Deshalb Entscheidung, nicht Ausführung.

### 3.3 🤔 Ein dunkler Moment in der Mitte (AUDIT 6)

Geprüft: es gibt **keine einzige** dunkle Full-Bleed-Sektion nach dem Hero. Das
Markenprofil sieht sie ausdrücklich vor. Alle zehn Sektionen haben dieselbe Form
— Eyebrow, Serif-Überschrift, Untertitel, Raster.

Vorschlag des Audits: Herkunft und Produktion als dunkler Block in der Mitte,
teilt die Seite in zwei Hälften und macht beide leichter.

**Offen ist das Foto.** `DESIGN.md` empfiehlt dafür `chain-clean.jpg`
(Ketten im Wachsbad) — **diese Datei existiert nicht mehr**, sie ist bei einem
früheren Aufräumen verschwunden und auch nicht im ausgelagerten Archiv. Die
Empfehlung läuft ins Leere, es braucht ein anderes Motiv.

### 3.4 🤔 Die Motion-Briefs — bauen oder fallen lassen

`LOTTIE_MOTION_BRIEFS.md` beschreibt auf 298 Zeilen drei fertig durchdachte
Animationen (Kristallabdeckung, Temperaturfenster, Wachsverlust bei Hitze),
inklusive Farbreferenzen und Integrations-Checkliste.

**Geprüft: nie gebaut.** Keine `lottie`- oder `rive`-Abhängigkeit im Projekt. Das
Dokument liegt inzwischen in `docs/archiv/`.

Entweder bewusst beerdigen — oder es ist der stärkste ungenutzte Design-Baustein,
den das Projekt hat.

### 3.5 🤔 Zwei fertige, ungenutzte Komponenten

`ComparisonSlider` und `WhatChanges` liegen fertig im Code, **null Einbindungen**.
Beide warten auf Inhalte (siehe 4.1). Sie stören nichts. Die Frage ist nur, ob sie
weiter warten oder aufgegeben werden.

---

## 4. Nur du kannst das

### 4.1 🙋 Das Vorher-Nachher-Fotopaar

Im Audit als **„größter Hebel pro Aufwand auf der ganzen Seite"** bezeichnet, und
das halte ich für richtig. Gleiche Kette, gleicher Winkel, gleiches Licht, einmal
geölt und einmal gewachst nach gleicher Strecke.

Für die Zielgruppe, die nicht wegen Tribologie kommt, schlägt dieses eine Bild
jede Grafik auf der Seite. Es entblockiert außerdem `ComparisonSlider` (3.5).

### 4.2 🙋 Die zwölf Stripe-Price-IDs

Geprüft: **kein einziges Produkt** hat eine `stripePriceId`. Damit ist der
komplette, fertig gebaute Checkout tot und jeder Kauf-Knopf fällt auf eBay
zurück. Blockiert C1 und C2 vollständig.

Anleitung liegt fertig in `docs/aufgaben/STRIPE_SETUP.md`.

### 4.3 🙋 Ein Foto für den dunklen Moment

Siehe 3.3 — das ursprünglich vorgesehene Motiv existiert nicht mehr.

### 4.4 🙋 GTINs der zugekauften Ketten

Shimano- und SRAM-Teile haben echte GTINs; sie verbessern die Produktzuordnung
bei Google deutlich. `mpn` steht bereits im Schema, `gtin` fehlt. Die Nummern
stehen auf den Kartons.

---

## 5. Blockiert

| | Was | Wartet auf |
|---|---|---|
| ⛔ | **C1 — Checkout aktivieren** | 4.2 (Stripe-IDs) |
| ⛔ | **C2 — Kaufpfad von fünf auf zwei Schritte** | C1 |

---

## 6. Empfohlene Reihenfolge

Sortiert danach, dass jeder Schritt den nächsten billiger macht.

1. **Entscheidungen 3.1 bis 3.4 treffen.** Kosten dich Nachdenken, keine Arbeit,
   und geben alles andere frei.
2. **2.1 Hero-WebP** — kleinster Aufwand, sofort messbar, unabhängig von allem.
3. **2.3 `priceValidUntil`** und **2.4 JSON-LD messen** — beide klein, beide SEO.
4. **2.5 Satz am Kaufpunkt** — sobald du die Formulierung freigibst.
5. **Fotopaar schießen (4.1)** — sobald du dazu kommst; entblockiert 3.5.
6. **3.2 / 3.3 umsetzen**, falls entschieden — die größeren Struktureingriffe.
7. **2.2 Typografie-Rest** — bewusst zuletzt, weil breit und am ehesten Nebenwirkungen.
8. **Stripe (4.2 → C1 → C2)** unabhängig davon, wann immer die IDs da sind.

---

## 7. Nebenbefund: die Pläne selbst sind teils veraltet

Beim Prüfen aufgefallen, unabhängig von der Roadmap:

- `DESIGN.md §5` empfiehlt ein Foto (`chain-clean.jpg`), das es nicht mehr gibt.
- `DESIGN.md §6` beschreibt eine Hero-Entscheidung als anstehend, die seit über
  zwei Wochen weder umgesetzt noch widerrufen wurde.
- `LOTTIE_MOTION_BRIEFS.md` liegt im Archiv, ist aber nie beerdigt worden.

Wer hier weiterarbeitet: **erst gegen den Code prüfen, dann glauben.**
