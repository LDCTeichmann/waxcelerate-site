# Mobile-Plan — Waxcelerate

**Stand:** 5. August 2026
**Grundlage:** `performance-audit/AUDIT_REPORT.md` plus eine zweite Messrunde zu Kaufpfad, Scrolltiefe und Copy-Dichte
**Für:** einen Sonnet-5-Agenten, der die Pakete einzeln abarbeitet
**Regel Nummer eins:** Der Plan ist nach Risiko sortiert, nicht nach Ehrgeiz. Jedes Paket ist einzeln lieferbar, einzeln testbar und einzeln zurückrollbar. Wer Pakete zusammenzieht, verliert genau die Eigenschaft, die diesen Plan sicher macht.

---

## 0. Entschieden am 5. August

Die drei offenen Fragen aus Abschnitt 6 sind von Luca beantwortet. Der Plan ist damit vollständig freigegeben.

| | Entscheidung | Folge |
|---|---|---|
| **D-M1** | **Nativer Checkout kommt, eBay bleibt als sichtbarer Zweitweg.** | Stufe C ist freigegeben. C1 startet, sobald Luca die zwölf Stripe-Price-IDs liefert. Unter jedem Kauf-Button steht künftig eine ruhige Zeile in Richtung eBay. |
| **D-M2** | **Rewax ist live und darf frei beworben werden** — zusätzlich unter deutschen Suchbegriffen, weil „Rewax" im deutschsprachigen Raum kaum gesucht wird. | Neues Paket **B8**. Preise vom 28.07.2026 gelten (13,95 € / 9,95 € ab drei), `20_products_pricing.md` wird nachgezogen. |
| **D-M3** | **Vercel Analytics wird eingebaut.** | Neues Paket **A6**. Drei Ereignisse: Scrolltiefe, eBay-Klick, Kauf-Klick. |

Diese drei Zeilen gehören nach Abschluss in `references/90_decision_log.md` des Waxcelerate-Skills.

### Abgrenzung zu `docs/plaene/SICHTBARKEIT_PLAN.md`

Im Repo liegt seit dem 4. August ein Sichtbarkeits-Plan v5, ebenfalls für einen Sonnet-5-Agenten geschrieben. **Die beiden Dokumente dürfen sich nicht in die Quere kommen.** Die Zuständigkeit:

- **`docs/plaene/SICHTBARKEIT_PLAN.md` besitzt SEO und Auffindbarkeit:** Keyword-Architektur, Schema, Sitemap, Blogstrategie, Backlinks, Google Shopping.
- **`docs/plaene/MOBILE_PLAN.md` (dieses Dokument) besitzt Mobile-Performance, Layout, Lesbarkeit, Bedienbarkeit und den Kaufpfad.**

Es gibt genau eine Überschneidung, nämlich Paket B8. Dort ändere ich nur die sichtbaren Bezeichnungen auf der Seite (Titel, H1, Navigationslabel). Die Keyword-Strategie dahinter bleibt Sache des Sichtbarkeits-Plans, dessen §5 die Suchabsicht „Kette wachsen lassen · Rewax Service" bereits kennt.

**Ein Hinweis für den Agenten:** Der Sichtbarkeits-Plan spricht durchgehend von `/rewax`. Diese URL existiert nicht mehr als Seite, sondern wird in `vercel.json` per 301 auf `/kette-wachsen-lassen` umgeleitet. Beim Abarbeiten des anderen Dokuments also immer die neue URL verwenden.

---

## 1. Diagnose — was auf Mobile wirklich passiert

Der erste Audit hat Performance und Layout gemessen. Diese Runde hat den Kaufpfad gemessen. Das Ergebnis erklärt mehr als die Lighthouse-Scores.

### 1.1 Der Weg vom Ankommen zum Kauf

Nachgestellt bei 390 px mit Touch-Emulation:

| Schritt | Aktion | Was passiert | Wo man landet |
|---|---|---|---|
| 0 | Seite lädt | Hero, Headline, ein CTA | Bildschirm 0 |
| 1 | Tap „Jetzt bestellen" | **kein Seitenwechsel**, nur `scrollIntoView('#produkte')` | Bildschirm 4,0 |
| 2 | Tap auf eine Tür (z. B. „Kettenwachs") | wieder nur Scroll, tauscht die Produktliste darunter | Bildschirm ~5 |
| 3 | Tap auf eine Produktkarte | Navigation zu `/produkt/wax-500` | neue Seite, 5,0 Bildschirme |
| 4 | Tap „Bei eBay kaufen" | **verlässt die Seite**, neuer Tab | eBay-Listing |
| 5 | Auf eBay | Login oder Gastkauf, Adresse, Zahlung | eBay-Checkout |

Fünf Interaktionen und ein Plattformwechsel, bevor überhaupt ein Bezahlvorgang beginnt. Der Hero-CTA und die eingeblendete Sticky-Leiste heißen beide „Jetzt bestellen", tun aber beide nur eines: scrollen. Das ist der Kern des Reibungsproblems, und es ist kein Designfehler im Kleinen, sondern eine Frage der Architektur.

### 1.2 Der native Checkout ist fertig gebaut und komplett abgeschaltet

Das ist der wichtigste Einzelbefund dieser Runde.

Im Code existieren vollständig: `src/store/cart.ts` (Zustand-Store mit Persistenz), `CartDrawer`, `CartIcon`, `AddToCartButton`, `CartPersistenceHint`, `api/create-checkout.ts`, `api/stripe-webhook.ts`, die Seite `/bestellung-erfolgreich`, eine Versandkostenlogik nach Deutsche-Post-Brieftarifen (`shippingFor()`), Bestandsverwaltung über `/api/stock` und `/admin`, sowie sämtliche Rechtstexte als eigene Routen. Der Checkout-Button trägt bereits die rechtlich vorgeschriebene Beschriftung „Zahlungspflichtig bestellen".

Aktiviert wird das alles über eine einzige Bedingung in `src/lib/data.ts`:

```ts
export const canCheckout = (p: Pick<Product, 'stripePriceId'>): boolean =>
  typeof p.stripePriceId === 'string' && p.stripePriceId.length > 0;

export const checkoutEnabled = products.some(canCheckout);
```

**Kein einziges der zwölf Produkte hat eine `stripePriceId`.** Damit ist `checkoutEnabled === false`, der Warenkorb wird gar nicht erst gerendert, und jeder Kauf-Button im gesamten Projekt fällt auf `<a href={product.ebayUrl}>Bei eBay kaufen</a>` zurück. Hundert Prozent des Website-Traffics werden aktuell an eBay abgegeben.

Das ist bemerkenswert saubere Arbeit: Der Fallback ist überall konsistent implementiert, es gibt keine toten Enden, und die Umstellung passiert automatisch, sobald die IDs eingetragen sind. `docs/aufgaben/STRIPE_SETUP.md` beschreibt die 45 Minuten Einrichtung Schritt für Schritt. Es fehlt buchstäblich nur die Ausführung.

### 1.3 Die Startseite ist 14,4 Bildschirme lang, und Produkte belegen davon 1,4

Gemessen bei 390 × 844 px:

| ab Bildschirm | Sektion | Höhe | Wörter | Bilder |
|---|---|---|---|---|
| 0,0 | Hero | 1,1 | 26 | 2 |
| 1,1 | Warum Wachs („Messbar besser.") | **3,0** | 235 | 2 |
| 4,0 | **Produkte** | **1,4** | **55** | 4 |
| 5,5 | Bewertungen | 1,2 | 301 | 15 |
| 6,7 | Über mich | 1,4 | 132 | 1 |
| 8,1 | Rechner & Planer | 1,2 | 214 | 0 |
| 9,3 | Anleitungen | 1,7 | 245 | 0 |
| 11,0 | FAQ | 1,1 | **385** | 0 |
| 12,1 | Kontakt | 0,9 | 43 | 0 |
| 13,1 | Abschluss-CTA | 0,3 | 20 | 0 |
| | **gesamt** | **14,4** | **1 656** | |

Produkte bekommen **9,7 Prozent der Seite**. Die Erklärsektion davor bekommt mehr als das Doppelte. Die FAQ enthält mehr Wörter als Hero, Produkte und Abschluss-CTA zusammen.

Für eine Marke, deren Positionierung ausdrücklich „Produktarbeit statt Marketing" lautet, ist die Seite in der Gewichtung genau andersherum gebaut: sehr viel Marketing, sehr wenig Produkt.

Zum Vergleich die anderen Seiten: `/wissenschaft` 12,9 Bildschirme, `/blog` 11,8, `/kette-wachsen-lassen` 7,8, `/produkt/wax-500` 5,0. Die Produktdetailseite ist die einzige Seite mit einer für Mobile vernünftigen Länge.

### 1.4 Was die Länge nicht ist

Ein Reflex wäre jetzt: kürzen. Das wäre falsch, und zwar aus einem Grund, der in `50_brand_positioning.md` steht. Die Zielgruppe sind informierte Fahrer, die „Entscheidungen vor sich selbst rechtfertigen können" wollen. Die Tiefe ist kein Ballast, sie ist das Verkaufsargument. Wer sie streicht, macht die Seite austauschbar.

Das eigentliche Problem ist nicht, dass die Tiefe existiert, sondern **wo sie liegt**: zwischen dem Besucher und dem Produkt statt daneben. Und sie ist doppelt vorhanden. `/wissenschaft` (12,9 Bildschirme) und der Blog (18 Artikel) sind bereits die dafür gebauten Orte. Die Startseite hält eine gekürzte Kopie davon vor.

Die Lösung ist also Umordnen und Verlinken, nicht Löschen. Details in Paket B1.

### 1.5 Ein Claims-Verstoß ist live

`src/lib/i18n.ts`, Zeile 202, im FAQ-Antworttext:

> „…aber kein anderes Schmiermittel kommt auch nur annähernd an Heißwachs heran."

Das ist exakt der Superlativ, den `90_decision_log.md` unter D8 als zu korrigieren markiert hat, und er steht gegen das Verbot aus `30_claims_language.md` §2. Zwei Fundstellen (DE und EN).

Ansonsten ist die Copy sauber: kein „600 km", kein „16.300 km", keine erfundenen Testimonials, kein Countdown. Die dominante Intervallangabe ist mit elf Fundstellen korrekt „400–550 km" nach D1.

### 1.6 Was bereits richtig gut ist

Damit der Agent nicht anfängt, Funktionierendes umzubauen:

- Der Hero-CTA ist mit 229 × 60 px auf dem ersten Bildschirm gut erreichbar und wurde als tatsächlich antippbar verifiziert.
- Die Sticky-Kaufleiste (`MobileStickyCTA.tsx`) erscheint korrekt erst nach dem Hero und verschwindet wieder, sobald die Produktsektion sichtbar ist. Sauber gelöst.
- Die Türen-Logik (`ProductDoors.tsx`) ist bewusst nach Kaufabsicht gebaut, nicht nach Kategorie, und trägt bereits „ab"-Preise. Der Kommentar im Code begründet die Entscheidung schlüssig.
- Der eBay-Fallback ist an allen elf Stellen konsistent.
- CLS liegt bei 0,000 bis 0,003. Keine Layout-Sprünge.
- SEO 100 auf allen fünf gemessenen Seiten.
- Die Rechtstexte sind vollständig und als eigene Routen vorgerendert.

### 1.7 Korrektur an einer Vermutung

Ein erster Screenshot zeigte die drei Produkt-Türen als schwarze Flächen ohne Bild. Nachgeprüft: die Bilder existieren, laden vollständig und werden korrekt angezeigt. Der Screenshot war vor dem Nachladen der `loading="lazy"`-Bilder entstanden. **Kein Fehler.** Steht hier, damit niemand später auf Basis des alten Screenshots etwas repariert, was nicht kaputt ist.

Ebenso: Ein automatischer Klicktest meldete die untere Sticky-Leiste als „nicht antippbar". Auch das war korrekt so — die Leiste steht per `translate-y-full` bewusst außerhalb des Bildschirms, bis der Hero durchgescrollt ist. **Kein Fehler.**

---

## 2. Die Leitidee

Drei Sätze, an denen sich jede Einzelentscheidung messen lässt.

**Erstens: Reibung wegnehmen, keinen Druck aufbauen.** Die Marke verbietet künstliche Verknappung, Countdowns, Superlative und erfundene Sozialbeweise. Das ist keine Einschränkung, sondern eine Schärfung: Es bleibt genau ein legitimer Hebel, nämlich den Weg kürzer und klarer zu machen. Kein Paket in diesem Plan fügt Dringlichkeit hinzu.

**Zweitens: Die Startseite ist eine Entscheidungsfläche, nicht ein Lehrbuch.** Die Tiefe bleibt vollständig erhalten, wandert aber dorthin, wo sie schon hingehört: `/wissenschaft`, `/blog`, die Produktdetailseiten. Auf der Startseite steht künftig das, was jemand braucht, um zu entscheiden — nicht alles, was man über Kettenwachs wissen kann.

**Drittens: Lesbarkeit vor Feinheit.** Ein 7-Pixel-Label in gesperrten Versalien sieht am Monitor nach Präzision aus. Auf einem Telefon ist es Dekoration, die niemand liest. Wo Mikrotypografie und Lesbarkeit kollidieren, gewinnt Lesbarkeit.

---

## 3. Arbeitspakete

Reihenfolge ist bewusst. A vor B vor C.

### Stufe A — risikolos, rein technisch, keine sichtbare Designänderung

Diese Pakete kann der Agent ohne Rückfrage umsetzen. Sie ändern kein Layout und keine Copy.

---

#### A1 — LCP-Bilder pro Route statt global
**Wirkung: hoch · Risiko: niedrig · Betrifft: Ladezeit aller Seiten**

**Problem.** `index.html` lädt `chain-bg.jpg` (262 KB) und `wax-cutout.webp` (132 KB) per `<link rel="preload" as="image">` vor. Die Prerender-Skripte kopieren den `<head>` unverändert, dadurch stehen beide Zeilen in *jeder* erzeugten Seite — auch in `/blog`, `/wissenschaft` und allen zwölf Produktseiten, wo keines der Bilder je gezeigt wird. Auf gedrosseltem 4G sind 394 KB rund zwei Sekunden Leitung, die dem echten LCP-Bild fehlen.

**Zu tun.**
1. Die beiden `<link rel="preload" as="image">`-Zeilen aus `index.html` entfernen.
2. In `scripts/generate-home-html.mjs`, `generate-product-html.mjs` und `generate-blog-html.mjs` je einen passenden Preload einsetzen: Startseite `chain-bg.jpg` plus `wax-cutout.webp`, Produktseiten das erste Galeriebild des jeweiligen Produkts, Blog das Beitragsbild.
3. An jeden dieser Preloads `fetchpriority="high"` hängen. Lighthouse bemängelt exakt dessen Fehlen auf der Startseite.

**Verifikation.** `npm run build`, dann prüfen: `grep -c 'rel="preload" as="image"' dist/blog/index.html` muss dieselbe Zahl liefern wie die Anzahl der Bilder, die auf `/blog` tatsächlich über dem Falz stehen. `grep chain-bg dist/produkt/wax-500/index.html` muss leer sein. Danach Lighthouse mobil gegen `/blog` und `/produkt/wax-500`: LCP muss sinken, Score steigen.

**Nicht tun.** Keine Bilder neu komprimieren, keine Komponenten anfassen. Nur `<head>`-Erzeugung.

---

#### A2 — LCP-Bild der Produktseite ins ausgelieferte HTML
**Wirkung: hoch · Risiko: niedrig-mittel · Betrifft: zwölf Produktseiten**

**Problem.** Lighthouse meldet auf `/produkt/wax-500/`: `FAIL Request is discoverable in initial document`. Das erste Galeriebild trägt zwar `fetchpriority="high"` und `loading="eager"`, existiert im DOM aber erst nach der Hydration. Der Preload-Scanner, der das HTML liest bevor JavaScript läuft, sieht es nicht. Die Ladekette wird dadurch: HTML → CSS → 494 KB JS → Hydration → erst dann startet der Bilddownload. Ergebnis: **LCP 10,5 s, TTI 10,7 s** — der schlechteste Wert im gesamten Audit, auf der Seite, auf der gekauft wird.

**Zu tun.** `scripts/generate-product-html.mjs` schreibt bereits Produktinhalte ins HTML. Zusätzlich das erste Galeriebild als echtes `<img>` im vorgerenderten Markup ausgeben, an derselben Stelle, an der React es später rendert, damit React beim Hydrieren denselben Knoten vorfindet.

**Achtung — der einzige heikle Punkt in Stufe A.** Weicht das vorgerenderte Markup vom React-Output ab, wirft React einen Hydration-Mismatch. Deshalb: nach der Änderung eine Produktseite im Browser öffnen und die Konsole prüfen. Erscheint dort eine Hydration-Warnung, ist die Änderung falsch und muss zurück. Notfalls genügt als risikoärmere Variante ein `<link rel="preload" as="image" fetchpriority="high">` auf dasselbe Bild — bringt den Großteil des Effekts ohne Mismatch-Risiko. **Im Zweifel diese Variante nehmen.**

**Verifikation.** Lighthouse mobil auf `/produkt/wax-500/`. Erwartung: `lcp-discovery-insight` besteht alle drei Kriterien, LCP fällt deutlich unter 10,5 s. Konsole muss frei von Hydration-Warnungen sein.

---

#### A3 — Bilder auf ihre Anzeigegröße bringen
**Wirkung: mittel · Risiko: niedrig · Betrifft: Produktseiten, Blog, Wissenschaft**

**Problem.** Gemessene Dateien gegen ihre tatsächliche Anzeigegröße auf Mobile:

| Datei | Auflösung | Größe | angezeigt bei |
|---|---|---|---|
| `products/classic/classic-3-lg.webp` | 2000 × 2000 | 202 KB | 358 px |
| `hero-chain-texture.jpg` | 2000 × 1333 | 212 KB | 390 px |
| `science/cassette-wear-full.webp` | 1254 × 1254 | 249 KB | 358 px |
| `logo.jpg` | **998 × 998** | **118 KB** | **32 px als Favicon** |

`logo.jpg` ist der krasseste Fall: eine 998-Pixel-JPEG als `<link rel="icon">` *und* `apple-touch-icon`, geladen auf jeder Seite, dargestellt auf 32 Pixeln.

**Zu tun.**
1. Für Produktbilder dasselbe `srcset`-Muster anlegen, das für Blog-Bilder bereits existiert und nachweislich funktioniert (`-800w` / `-1600w`). Das Muster steht in `src/sections/` bei den Blog-Komponenten — nicht neu erfinden, kopieren.
2. `logo.jpg` durch ein 180-px-PNG unter 10 KB für `apple-touch-icon` und ein echtes `favicon.ico` ersetzen.
3. `public/images/hero/wax-cutout.png` (1,20 MB) aus dem Build nehmen. Das 132 KB große WebP daneben reicht; kein aktueller Browser braucht den PNG-Fallback.

**Verifikation.** `du -sh dist --exclude=images` vorher/nachher. Jede geänderte Seite visuell auf Mobile und Desktop gegenprüfen — Bildausschnitte dürfen sich nicht verschieben.

---

#### A4 — Tote Bilddateien aus dem Auslieferungsverzeichnis
**Wirkung: mittel für Build und Deploy, null für Besucher · Risiko: niedrig**

**Problem.** `public/images/` enthält 193,6 MB. Ein Abgleich aller Bildreferenzen aus dem fertigen `dist/` (HTML, JS, CSS, XML, `llms.txt`) gegen den Dateibestand ergibt: **10,8 MB werden referenziert, 182,8 MB in 107 Dateien nie.** Vite kopiert `public/` unverändert, also landet alles im Deploy.

Die größten toten Ordner: `/images/blog` 90,1 MB (Originale neben den WebP-Varianten), `/images/Customer Review images` 45,7 MB, `/images/1 New Hero` 30,9 MB, `/images/2. Messbar besser.` 10,2 MB.

**Zu tun.** Die toten Dateien **nicht löschen**, sondern nach `assets-archiv/` außerhalb von `public/` verschieben. Das Skript, das die Referenzliste erzeugt, liegt in `performance-audit/` und ist reproduzierbar.

**Warum verschieben statt löschen:** Die Ordnernamen (`Customer Review images`, `2. Messbar besser.`) deuten auf ein Arbeitsarchiv hin, das Luca vermutlich noch braucht — nur eben nicht im Auslieferungsverzeichnis. Ein Löschen wäre unumkehrbar und ist für den Zweck nicht nötig.

**Verifikation.** Nach dem Verschieben `npm run build` und die fünf Kernseiten plus drei Blogartikel im Browser durchklicken. Kein einziges 404 im Netzwerk-Tab. Erwartete `dist/`-Größe: unter 6 MB statt 188 MB.

---

#### A5 — `/api/stock` nicht auf jeder Route aufrufen
**Wirkung: niedrig · Risiko: niedrig**

`src/App.tsx:57` ruft `fetchStock()` in einem `useEffect` ohne Bedingung. Das weckt auf `/impressum`, `/agb`, `/datenschutz` und `/blog` eine Serverless-Funktion, obwohl dort kein Lagerbestand angezeigt wird. Aufruf an die Routen binden, die Produkte zeigen.

**Achtung:** Nach Entscheidung D-M1 kommt der Warenkorb. Dann muss der Bestand auch bekannt sein, wenn der Warenkorb auf einer Rechtstextseite geöffnet wird. Deshalb gleich richtig bauen: **beim Öffnen des Warenkorbs laden**, nicht beim Mounten jeder Seite. Damit ist das Paket auch nach C1 noch korrekt und muss nicht zweimal angefasst werden.

---

#### A6 — Vercel Analytics einbauen
**Wirkung: mittel, aber Voraussetzung für alles Weitere · Risiko: niedrig · Entscheidung D-M3**

**Warum.** Ohne Messung sind alle Aussagen über Kaufabbrüche Vermutungen. Nach vier Wochen Daten lässt sich statt schätzen belegen, ob der eigene Checkout mehr bringt als die eBay-Übergabe.

**Zu tun.**
1. `@vercel/analytics` installieren und `<Analytics />` in `App.tsx` einhängen. Cookiefrei, keine personenbezogenen Daten, deshalb ohne Consent-Banner betreibbar. Das ist der Grund für diese Wahl und nicht bloß Bequemlichkeit: Ein Cookie-Banner auf einer Seite mit 14 Bildschirmen Scrolltiefe würde mehr Conversion kosten als die Daten wert wären.
2. Genau **drei** benutzerdefinierte Ereignisse, mehr nicht:
   - `scroll_products` — Produktsektion war sichtbar
   - `click_ebay` — Klick auf einen eBay-Link, mit Produkt-ID
   - `click_buy` — Klick auf Kauf-Button beziehungsweise „In den Warenkorb", mit Produkt-ID
3. **Ausgangswert festhalten.** Vier Wochen messen, bevor C1 live geht. Sonst ist der Vorher-Zustand für immer verloren und die Wirkung des eigenen Checkouts nicht mehr belegbar.

**Guardrail.** Keine weiteren Ereignisse. Wer alles misst, wertet nichts aus.

---

### Stufe B — sichtbare Änderungen an Mobile-Design und Struktur

Ab hier wird das Aussehen verändert. Jedes Paket einzeln committen, jedes einzeln auf beiden Geräteklassen ansehen.

---

#### B1 — Reihenfolge der Startseite: Produkte nach vorn
**Wirkung: hoch · Risiko: mittel · Betrifft: nur Startseite**

**Problem.** Produkte beginnen bei Bildschirm 4,0. Davor liegen drei Bildschirme Erklärung. Wer mit Kaufabsicht kommt, scrollt an allem vorbei; wer den Hero-CTA drückt, wird ohnehin dorthin gescrollt und hat die drei Bildschirme umsonst geladen.

**Zu tun.** Die Reihenfolge in `src/App.tsx` ändern. Aktuell:

```
Hero → WhyWax → Products → Reviews → About → Tools → Guides → FAQ → Contact → ClosingCTA
```

Neu:

```
Hero → Vertrauensstreifen → Products → WhyWax(kompakt) → Reviews → Tools → About → Guides → FAQ → Contact → ClosingCTA
```

Im Einzelnen:

1. **Vertrauensstreifen** direkt unter dem Hero: eine Zeile, etwa 0,2 Bildschirme, mit den drei Fakten, die die Kaufentscheidung tragen. „Über 500 verkaufte Einheiten · 100 % positives Feedback · Hergestellt in Stuttgart". Alle drei sind nach `30_claims_language.md` freigegebene Formulierungen und stehen bereits so auf der Seite, nur weiter unten. Keine neuen Behauptungen erfinden.
2. **Products** rückt auf Bildschirm ~1,5. Damit ist das erste Produkt nach einem Wisch sichtbar statt nach vieren.
3. **WhyWax** rückt dahinter und wird auf etwa 1,5 statt 3,0 Bildschirme gekürzt: die beiden stärksten Vergleichsblöcke bleiben, der Rest wandert hinter einen Link auf `/wissenschaft`, wo dieselben Inhalte ausführlicher bereits existieren. **Kein Inhalt wird gelöscht**, nur verschoben und verlinkt.
4. **Tools** rückt vor **About**. Die Rechner beantworten Kauffragen („was kostet mich das im Jahr"), die Gründergeschichte nicht.

**Warum das der Marke nicht widerspricht.** Die Positionierung sagt „Produktarbeit statt Marketing". Eine Seite, die zu neunzig Prozent aus Erklärung besteht und zu zehn Prozent aus Produkt, sagt das Gegenteil. Produkte nach vorn zu holen ist markenkonform, nicht markenfremd.

**Guardrails.**
- Keine Sektion löschen. Nur `App.tsx` umsortieren und in WhyWax kürzen.
- Anker-IDs (`#produkte`, `#warum-wachs`, `#bewertungen`, …) müssen unverändert bleiben. `MobileStickyCTA.tsx`, die Navigation und `PendingAnchorScroll` hängen daran, außerdem geteilte Links und die Sitemap.
- `MobileStickyCTA.tsx` prüft `!onProducts`, um sich auszublenden. Nach der Umsortierung ist die Produktsektion fast immer sichtbar, die Leiste erschiene also praktisch nie. Diese Logik mit anpassen — siehe B2.

**Verifikation.** `node performance-audit/config/conversion-map.mjs http://localhost:8099 /` erneut laufen lassen. Zielwerte: Produktsektion beginnt unter Bildschirm 2,0; Gesamthöhe unter 12,0 Bildschirmen. Alle Ankerlinks in der Navigation antippen und prüfen, dass sie am richtigen Ort landen.

---

#### B2 — Sticky-Leiste: aus einem Scroll einen Kauf machen
**Wirkung: hoch · Risiko: niedrig · Betrifft: Startseite mobil**

**Problem.** Hero-CTA und Sticky-Leiste heißen beide „Jetzt bestellen" und lösen beide `scrollIntoView('#produkte')` aus. Ein Button, der „bestellen" sagt und scrollt, verbraucht Vertrauen. Nach B1 kommt hinzu, dass die Leiste bei sichtbarer Produktsektion ausgeblendet wird, was nach der Umsortierung fast immer der Fall wäre.

**Zu tun.**
1. **Beschriftung ehrlich machen.** Solange der Button scrollt, heißt er „Produkte ansehen" oder „Zu den Produkten". Sobald er zu einem echten Kauf führt (Frage 1), darf er wieder „Jetzt bestellen" heißen.
2. **Sichtbarkeitslogik anpassen:** einblenden, sobald der Hero durch ist, ausblenden nur im Footer-Bereich.
3. **Auf der Produktdetailseite** existiert bereits eine eigene Sticky-Kaufleiste mit Preis und Kauf-Button. Die ist inhaltlich richtig und bleibt. Zu reparieren ist dort nur der Barrierefreiheitsfehler aus A-Stufe: Sie trägt im eingefahrenen Zustand `aria-hidden="true"`, enthält aber einen per Tab erreichbaren eBay-Link. Der eingefahrene Zustand braucht zusätzlich `inert` oder `tabindex="-1"` auf dem Link.

---

#### B3 — Die Typografie-Migration zu Ende führen
**Wirkung: hoch für wahrgenommene Qualität · Risiko: niedrig-mittel · Betrifft: alle Seiten**

**Problem.** Bei 390 px gemessen, in echtem Chromium:

| Seite | Schriftgrößen unter 12 px |
|---|---|
| Produkt `wax-500` | **7 px, 7,5 px, 8 px (3×), 8,5 px (2×), 9 px (7×), 9,5 px, 10 px (8×), 11 px (2×)** |
| Wissenschaft | 9 px (5×), 9,5 px, 10 px (7×), 10,5 px (2×), 11 px (10×) |
| Startseite | 11 px (25×) |

Konkret: `span.text-[7px]` mit dem Wort „Kette". `p.text-[7.5px]` mit `letter-spacing: 0.18em` und der Farbe `rgba(0,0,0,0.28)`. Diese Werte stammen aus Tailwind-Arbitrary-Values und haben deshalb **keinen Breakpoint** — sie sind auf dem Telefon exakt so groß wie am 27-Zoll-Monitor.

**Der eigentliche Punkt:** Die Lösung ist bereits vorhanden. In `tailwind.config.js` steht eine fertige semantische Skala mit `eyebrow` (11 px), `meta` (12 px), `small` (13 px), `body` (15 px), `lead` (17 px). Der Kommentar darüber lautet wörtlich „migrate ad-hoc `text-[Npx]` to these". Die Absicht war da, die Migration wurde nie abgeschlossen.

**Zu tun.**
1. Alle `text-[Npx]` mit N unter 12 auf die semantische Skala abbilden. Untergrenze auf Mobile: **12 px**, bei gesperrten Versalien **13 px**, weil `letter-spacing` über 0,15em die Lesbarkeit zusätzlich senkt.
2. Wo eine Größe am Desktop bewusst kleiner sein soll, responsive schreiben: `text-meta sm:text-[10px]` statt fix klein. Mobile bekommt den größeren Wert, nicht den kleineren.
3. `letter-spacing` über 0,2em auf 0,14em begrenzen, sobald die Schrift unter 14 px liegt.

**Guardrails.**
- **Paketweise vorgehen, nicht global suchen und ersetzen.** Erst Produktdetailseite, bauen, ansehen. Dann Wissenschaft. Dann Startseite. Ein einziges `sed` über alle Dateien ist der sicherste Weg, das Layout zu zerlegen.
- Nach jedem Teilschritt `node performance-audit/config/overflow-trace.mjs http://localhost:8099 390` laufen lassen. Größere Schrift kann neuen horizontalen Überlauf erzeugen — das ist der wahrscheinlichste Nebeneffekt dieses Pakets.
- Zeilenhöhen mitziehen. 7 px auf 13 px zu heben ohne `line-height` anzupassen erzeugt Textklumpen.

**Verifikation.** `node performance-audit/config/layout-audit.mjs` erneut. Zielwert: `minFont` auf allen Seiten mindestens 12. Danach die Vorher/Nachher-Screenshots nebeneinanderlegen.

---

#### B4 — Zwei Farbtokens auf Kontrast bringen
**Wirkung: hoch für Lesbarkeit und Barrierefreiheit · Risiko: niedrig · Betrifft: alle Seiten**

**Problem.** Nachgerechnet gegen alle drei Flächenfarben (WCAG 2.1, Normaltext braucht 4,5 : 1):

| Theme | Token | Wert | schlechtester Kontrast | Status |
|---|---|---|---|---|
| Light | `--txf` | `#8A8A92` | 3,03 | nur Großtext |
| Light | `--txff` | `#A8A8B0` | **2,09** | durchgefallen |
| Noir | `--txm` | `#71717A` | 3,52 | nur Großtext |
| Noir | `--txf` | `#72727E` | 3,58 | nur Großtext |
| Noir | `--txff` | `#5A5A66` | **2,50** | durchgefallen |

axe-core meldet daraus 41 Verstöße auf der Produktseite, 38 auf dem Blog, 35 auf der Startseite, alle mit Schweregrad `serious`.

Nebenbei: Der Kommentar in `src/index.css:267` behauptet für `--txm` im Noir-Theme „4.6:1 contrast". Nachgerechnet sind es 3,52 bis 4,12. Der Kommentar ist falsch und hat vermutlich dazu geführt, dass das Token für Fließtext freigegeben wurde. **Kommentar mit korrigieren**, sonst passiert derselbe Fehler wieder.

**Zu tun.** Die Tokens so weit abdunkeln beziehungsweise aufhellen, dass auf der jeweils schlechtesten Fläche 4,5 : 1 erreicht wird. Startwerte zum Nachrechnen, nicht ungeprüft übernehmen: Light `--txf` etwa `#6E6E76`, `--txff` etwa `#7A7A82`; Noir `--txm`/`--txf` etwa `#8B8B95`, `--txff` etwa `#7E7E88`.

**Wichtig.** Der visuelle Charakter soll erhalten bleiben. Diese Tokens tragen die ruhige, zurückgenommene Anmutung, die zur Marke gehört. Ziel ist der kleinstmögliche Schritt, der 4,5 : 1 erreicht, nicht maximaler Kontrast. Die Rechnung gehört ins Skript, nicht ins Augenmaß — das Kontrastskript aus dem Audit ist reproduzierbar.

**Verifikation.** Kontrastwerte nachrechnen, dann axe-core erneut. Zielwert: null `color-contrast`-Verstöße. Beide Themes ansehen.

---

#### B5 — Touch-Ziele auf Fingergröße
**Wirkung: hoch für Bedienbarkeit · Risiko: niedrig · Betrifft: Produktseite, Startseite, Wissenschaft**

**Problem.** Gemessen bei 390 px mit aktivem Touch:

| Seite | Element | Größe |
|---|---|---|
| Produkt | Galerie-Punkte „Image 2–6" | **7 × 3 px** |
| Produkt | Galerie-Punkt „Image 1" | 22 × 3 px |
| Startseite | Rechner-Punkte „Vorrat", „Rotation" | **6 × 6 px** |
| Wissenschaft | Schritt-Punkte 1–6 | 9 × 10 px |
| Wissenschaft | Slider `#wx-teeth`, `#wx-rpm` | 320 × 1 px |
| alle | Menü öffnen/schließen | 36 × 36 px |

Insgesamt 41 zu kleine Ziele auf der Startseite, 34 auf Wissenschaft, 30 auf der Produktseite. Eine Fingerkuppe deckt etwa 45 × 45 px ab — ein 7 × 3 px großes Ziel ist rund hundertmal kleiner als das Werkzeug, mit dem es getroffen werden soll.

**Zu tun.** Die sichtbare Gestaltung bleibt, die Trefferfläche wächst. Ein transparentes Pseudo-Element genügt:

```css
.dot { position: relative; }
.dot::after {
  content: ''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 44px; height: 44px;
}
```

Damit sieht der Punkt weiterhin aus wie ein 3-px-Strich, ist aber auf 44 × 44 px antippbar. Bei nebeneinanderliegenden Punkten die Abstände so wählen, dass sich die Trefferflächen nicht überlappen — sonst trifft man den Nachbarn.

Für die Slider: die Höhe des `<input type="range">` auf mindestens 44 px setzen und die Spur per `::-webkit-slider-runnable-track` optisch dünn halten.

**Verifikation.** `layout-audit.mjs` erneut. Zielwert: keine Ziele unter 24 × 24 px, Punktnavigationen bei 44 × 44 px. Dann tatsächlich mit dem Daumen auf einem echten Telefon durchtippen — dieser Test ist durch nichts zu ersetzen.

---

#### B6 — Text aus der Kassettengrafik holen
**Wirkung: mittel-hoch · Risiko: niedrig · Betrifft: `/wissenschaft`**

**Problem.** `images/science/cassette-wear-full.webp` ist 1254 × 1254 px groß und wird auf Mobile auf 358 px skaliert, Faktor 0,285. In die Grafik eingebrannt sind eine Überschrift und ein sechszeiliger Fließtext („Verschleißprinzip — Durch die Reibung der Kette nutzt sich die Zahnflanke an der Kassettenspeiche ab…") sowie die Beschriftungen „Neue Kassette" und „Abgenutzte Kassette". Nachgemessen rendert dieser Text bei **etwa 6 CSS-Pixeln**. Der Beleg liegt als sechsfach vergrößerter Ausschnitt in `performance-audit/screenshots/_klein/ZOOM-wissenschaft-diagramm-text.jpg`.

**Warum das schwerer wiegt als B3.** Eingebrannter Text skaliert nicht mit der Systemschriftgröße, lässt sich nicht markieren oder übersetzen, ist für Screenreader unsichtbar, wird von Google nicht indexiert und wird beim Zoomen unschärfer statt schärfer. Auf einer Seite, die ausdrücklich als SEO-Landingpage gebaut wurde, ist der letzte Punkt der teuerste.

**Zu tun.** Die Grafik auf das rein Bildliche reduzieren und die Beschriftungen als HTML daneben oder darüber setzen. Auf Mobile untereinander, auf Desktop bei Bedarf absolut positioniert wie bisher. Das löst nebenbei einen Teil von A3 mit: Die 249 KB der Datei gehen zu einem erheblichen Teil auf die scharfen Textkanten, die sich schlecht komprimieren lassen.

---

#### B7 — Kleinere Korrekturen
**Risiko: niedrig**

| | Was | Wo |
|---|---|---|
| a | Superlativ entfernen: „…kein anderes Schmiermittel kommt auch nur annähernd an Heißwachs heran." verstößt gegen `30_claims_language.md` §2 und ist unter D8 als zu korrigieren vermerkt. Ersatz im Sinne der Claims-Tabelle: die Wattwerte stehen lassen, den Superlativ streichen. | `src/lib/i18n.ts:202`, DE und EN |
| b | `aria-label` auf `<span>` und `<div>` ohne `role` — 15 Fälle, darunter sechsmal `aria-label="5 / 5"` bei Sternebewertungen. Screenreader ignorieren das, die Bewertung geht verloren. `role="img"` ergänzen. | Startseite |
| c | Die beiden Radix-Slider haben keinen zugänglichen Namen. `aria-label` ergänzen. | Startseite, Rechner |
| d | `<main>` fehlt auf `/produkt/*`, `/wissenschaft`, `/kette-wachsen-lassen`. Screenreader können nicht zum Inhalt springen. | drei Seiten |
| e | Ein Link im Fließtext hat 2,47 : 1 Kontrast zum Umgebungstext und nur `hover:underline`, was auf Touch nie greift. Dauerhafte Unterstreichung. | Produktseite |
| f | Horizontaler Überlauf: 2 px auf der Startseite, 4 px auf `/wissenschaft`. Beide Male ein `w-full`-Element mit negativem Versatz. Erzeugt auf iOS Gummiband-Effekte beim Wischen. | zwei Seiten |
| g | Die Bewertungs-Rail ist mit der Maus wischbar, aber nicht per Tastatur erreichbar. | Startseite |

---

#### B8 — „Rewax" heißt auf Deutsch anders
**Wirkung: hoch für Auffindbarkeit · Risiko: niedrig · Entscheidung D-M2**

**Das Problem in einem Satz.** Die URL ist bereits perfekt, alles andere auf der Seite widerspricht ihr.

Jemand hat richtig entschieden, die Seite unter `/kette-wachsen-lassen` zu führen und `/rewax` per 301 dorthin umzuleiten. Aber die Signale, die Google am stärksten gewichtet, sagen weiterhin etwas anderes:

| Signal | steht heute da | Suchbegriff enthalten? |
|---|---|---|
| URL | `/kette-wachsen-lassen` | **ja** |
| `<title>` | „Rewax-Service für gewachste Ketten \| Waxcelerate" | nein |
| `<h1>` | „Rewax. Machen wir." | nein |
| Navigationslabel | „Rewax" | nein |
| Eyebrow über der H1 | „Service" | nein |
| Meta-Description | „Gewachste Kette einschicken, frisch gewachst zurück…" | teilweise |
| Schema `serviceType` | „Kettenwachs-Service" | **ja** |

Auf der Seite selbst kommt „Rewax" achtzehnmal vor, „Kettenwachs-Service" genau einmal. Google sieht eine URL über das Wachsenlassen von Ketten und eine Seite, die von etwas namens Rewax handelt.

**Warum „Rewax" trotzdem bleibt.** Es ist kein schlechtes Wort, es ist nur ein Wort für Leute, die bereits in der Wachs-Welt sind. Und genau die sind die eigentliche Zielgruppe des Service, denn wer eine Kette zum Nachwachsen einschickt, wachst bereits. Der Begriff soll also nicht verschwinden, sondern eine Stufe nach hinten rücken: **Marken- und Zweitbegriff statt Führungsbegriff.**

**Die Begriffe.** Nach Häufigkeit der zu erwartenden Verwendung im deutschen Sprachraum geordnet:

*Kern, kommerzielle Absicht:*
- fahrradkette wachsen lassen
- kette wachsen lassen
- kettenwachs service
- fahrradkette wachsen service
- kette heißwachsen lassen
- wachsservice fahrradkette
- kette einschicken wachsen

*Marken- und Szenebegriffe, weiterhin abdecken:*
- rewax service, rewaxing fahrradkette, kette rewaxen
- heißwachs service, kettenpflege service

*Lokal:*
- fahrradkette wachsen lassen stuttgart
- kettenwachs service stuttgart
- **dasselbe für Leipzig** — siehe unten

*Fragen, für einen FAQ-Block auf derselben Seite:*
- was kostet kette wachsen lassen
- fahrradkette wachsen lassen kosten
- wo kann ich meine fahrradkette wachsen lassen
- kette wachsen lassen oder selber machen

> **Ehrlichkeitshinweis:** Diese Liste ist aus dem deutschen Sprachgebrauch abgeleitet, **nicht** aus verifizierten Suchvolumina. Die Websuche stand mir in dieser Sitzung nicht zur Verfügung (Kontingent erschöpft). Vor der Umsetzung gehört die Liste in die Google Search Console — dort steht unter „Leistung" schwarz auf weiß, für welche Begriffe die Seite heute schon Impressionen bekommt. Das ist die verlässlichere Quelle als jedes Keyword-Tool, weil es echte Daten der eigenen Seite sind.

**Zu tun.**

1. **`<title>`** → „Fahrradkette wachsen lassen — Kettenwachs-Service aus Stuttgart | Waxcelerate". Führt mit dem Suchbegriff, behält Ort und Marke.
2. **`<h1>`** → „Fahrradkette wachsen lassen." Der bisherige Satz „Rewax. Machen wir." ist gut und bleibt, aber als Zeile darunter statt als H1. Damit ist beides abgedeckt: der Suchbegriff für Google, der Markenton für den Menschen.
3. **Navigationslabel** von „Rewax" auf „Kette wachsen lassen". Das ist auch für Besucher besser: Wer nicht in der Wachs-Szene ist, weiß bei „Rewax" nicht, was ihn erwartet.
4. **Einen FAQ-Block** auf der Seite ergänzen, der die vier Fragen oben wörtlich als Überschriften trägt und `FAQPage`-Schema bekommt. Das Muster existiert bereits auf der Startseite, muss also nicht neu gebaut werden. Erste Frage: „Was kostet es, eine Fahrradkette wachsen zu lassen?" Antwort mit den echten Preisen.
5. **Schema ergänzen:** `alternateName: ['Rewax-Service', 'Kettenwachs-Service', 'Wachsservice für Fahrradketten']` im vorhandenen `Service`-Objekt.
6. **Preisangabe der Startseiten-Karte korrigieren.** Sie sagt „ab 9,95 € je Kette", der Einzelpreis ist aber 13,95 €. Formal richtig, praktisch irreführend, weil vierzig Prozent darüber. Besser: „13,95 € je Kette, ab drei Ketten 9,95 €."
7. **`references/20_products_pricing.md` nachziehen** auf die Preise vom 28.07.2026 und eine Zeile ins Decision Log, damit der Widerspruch 9,99 gegen 13,95 nicht wieder auftaucht.

**Zwei Befunde, die dabei aufgefallen sind:**

**Leipzig fehlt komplett.** Der Skill sagt: „Rewaxing in Stuttgart und Leipzig." Auf der Website kommt Leipzig kein einziges Mal vor — nicht im Text, nicht im Schema, nicht in den Geo-Metadaten, die ausschließlich auf Stuttgart zeigen (`geo.region: DE-BW`, `geo.placename: Stuttgart`). Damit ist ein kompletter zweiter lokaler Markt unbesetzt, obwohl die Leistung dort erbracht wird. Sofern das noch stimmt, gehört Leipzig in den Seitentext, ins `areaServed` des Service-Schemas und in ein zweites Google-Unternehmensprofil. **Das ist möglicherweise der billigste Sichtbarkeitsgewinn im ganzen Projekt.** Vor der Umsetzung bitte bestätigen, dass Leipzig noch aktiv ist.

**Der Preis ist auffällig niedrig.** `docs/plaene/SICHTBARKEIT_PLAN.md` §2 nennt Wettbewerber bei 34,90 € und 39,95 € gegenüber deinen 13,95 €. Das ist Faktor 2,5. Der geringere Leistungsumfang rechtfertigt einen niedrigeren Preis, aber vermutlich keinen Faktor 2,5. Das ist eine Preisfrage, keine Mobile-Frage, und gehört deshalb nicht in diesen Plan — der Sichtbarkeits-Plan hat sie bereits gestellt. Sie steht hier nur, weil B8 die Preisangaben ohnehin anfasst und es unklug wäre, sie zu zementieren, falls sie sich ändern soll.

**Guardrails.**
- Die URL `/kette-wachsen-lassen` bleibt unverändert, ebenso die 301 von `/rewax`. Beide sind indexiert.
- Kein Keyword-Stuffing. Die Begriffe gehören in Titel, H1, Zwischenüberschriften und FAQ, nicht in jeden zweiten Satz. Der Ton bleibt der aus `30_claims_language.md`: ruhig, präzise, erwachsen.
- Keine erfundenen Preise, keine Verknappung, kein „nur bis".

---

### Stufe C — Architektur. Freigegeben durch D-M1.

---

#### C1 — Nativen Checkout aktivieren
**Wirkung: sehr hoch · Risiko: mittel · Voraussetzung: Lucas Stripe-Einrichtung und die zwölf Price-IDs**

**Zu tun, nachdem Luca die Price-IDs geliefert hat.**
1. Die zwölf `stripePriceId`-Werte in `src/lib/data.ts` eintragen. Mehr ist am Code nicht nötig: `checkoutEnabled` kippt automatisch, Warenkorb-Icon, Drawer und alle Kauf-Buttons schalten sich selbst um.
2. Testkauf im Stripe-Testmodus über den kompletten Pfad, inklusive Versandkostenberechnung mit gemischtem Warenkorb (ein Wachsblock plus zwei Ketten muss auf Paket eskalieren, siehe `shippingFor()`).
3. Prüfen, dass die Bestellbestätigung ankommt und `/bestellung-erfolgreich` sauber rendert.
4. **eBay als Zweitweg sichtbar lassen.** Unter dem Kauf-Button eine ruhige Zeile: „Lieber über eBay bestellen? Hier entlang." Das kostet nichts, nimmt Zweiflern die Hürde und hält den Kanal, über den heute alles läuft.
5. Erst danach Live-Modus, und erst nachdem die Rechtstexte gegengelesen sind.

**Was damit erst möglich wird.** Die Rabattlogik aus `20_products_pricing.md` §4 (2 Produkte 10 %, 3 Produkte 15 %) lässt sich auf eBay gar nicht abbilden. Ebenso die Starter-Sets als echte Bundles und der Rewax-Service als Zusatzposition. Der Warenkorb ist die Voraussetzung für das gesamte Bundle-Konzept, das im Strategiedokument als erste Priorität steht.

---

#### C2 — Den Pfad von fünf Schritten auf zwei bringen
**Wirkung: sehr hoch · Risiko: mittel · Voraussetzung: C1**

Mit aktivem Warenkorb wird aus dem heutigen Fünf-Schritte-Pfad:

| Schritt | Aktion | Ergebnis |
|---|---|---|
| 0 | Landen | Hero, darunter direkt Produkte (nach B1) |
| 1 | „In den Warenkorb" auf der Produktkarte | Artikel im Warenkorb, Drawer öffnet |
| 2 | „Zahlungspflichtig bestellen" | Stripe-Checkout |

Zwei Interaktionen statt fünf, kein Plattformwechsel, kein Fremdkonto.

**Zu tun.**
1. `AddToCartButton` direkt auf die Produktkarten in der Übersicht setzen, nicht erst auf der Detailseite. Wer weiß, was er will, soll nicht erst eine Detailseite laden müssen. Die Detailseite bleibt für alle anderen unverändert erreichbar.
2. Nach dem Hinzufügen den Warenkorb-Drawer öffnen, statt nur einen Toast zu zeigen. Der Drawer muss Versandkosten und Zwischensumme sofort zeigen — unerwartete Versandkosten im letzten Schritt sind der klassischste Abbruchgrund im Checkout, und `shippingFor()` kann die Zahl längst berechnen.
3. Der Drawer braucht auf Mobile genau einen primären Button. Keine Nebenwege, kein Gutscheinfeld.
4. Den Rabatt aus `20_products_pricing.md` §4 im Drawer sichtbar machen, sobald er greift: „2 Artikel, 10 % Rabatt bereits abgezogen." Das ist ein Fakt, keine Verknappung, und deshalb markenkonform.

---

## 4. Reihenfolge und erwarteter Effekt

| Stufe | Pakete | Aufwand | Erwarteter Effekt |
|---|---|---|---|
| A | A1–A6 | überschaubar | Mobile-Performance von 72–79 auf geschätzt 88–95. LCP der Produktseite von 10,5 s auf deutlich unter 5 s. Deploy von 188 MB auf unter 6 MB. Ab A6 wird gemessen statt geschätzt. |
| B | B1–B8 | mittel | Startseite von 14,4 auf unter 12 Bildschirme, Produkte ab Bildschirm 1,5 statt 4,0. Accessibility von 82–96 auf über 95. Keine Schrift unter 12 px, keine Touch-Ziele unter 24 px. Rewax-Seite erstmals unter deutschen Suchbegriffen auffindbar. |
| C | C1–C2 | mittel, plus Lucas 45 Minuten | Kaufpfad von fünf auf zwei Schritte, kein Plattformwechsel. Bundles und Mengenrabatt erstmals möglich. |

**A6 gehört zeitlich nach vorn, nicht ans Ende von Stufe A.** Je früher gemessen wird, desto länger ist die Vorher-Strecke, gegen die sich Stufe B und C später vergleichen lassen. Idealerweise: A6 zuerst, dann A1–A5, dann vier Wochen Daten sammeln, während B läuft, dann C.

Die Schätzungen für Stufe A sind aus den gemessenen Einsparpotenzialen abgeleitet und belastbar. Die Schätzung für Stufe C ist es ausdrücklich nicht — sie hängt davon ab, wie viele Besucher heute am eBay-Wechsel abspringen, und das ist ohne Analytics nicht messbar. Siehe Frage 3.

---

## 5. Regeln für den ausführenden Agenten

Nicht verhandelbar.

1. **Ein Paket, ein Commit.** Niemals zwei Pakete in einem Durchgang. Der Wert dieses Plans liegt darin, dass jede Änderung einzeln rückgängig gemacht werden kann.
2. **Vor jedem Commit:** `npx tsc --noEmit` muss sauber durchlaufen. Steht so schon in `CLAUDE.md` Regel 5.
3. **Nach jedem Paket:** `npm run build`, danach die fünf Kernseiten auf 390 px **und** 1440 px ansehen. Nicht nur Mobile — Desktop steht bei 92–98 und darf dabei nicht schlechter werden.
4. **Keine Sektion, keine Komponente, keinen Absatz löschen**, ohne dass es in einem Paket ausdrücklich steht. Verschieben und verlinken ist erlaubt, entfernen nicht.
5. **Anker-IDs sind unantastbar.** `#produkte`, `#warum-wachs`, `#bewertungen`, `#kontakt` und die übrigen hängen an Navigation, Sticky-CTA, `PendingAnchorScroll`, Sitemap und an Links, die Menschen geteilt haben.
6. **Produktdaten nur aus `src/lib/data.ts`.** `CLAUDE.md` Regel 1. Niemals eine Zahl in eine Komponente schreiben.
7. **Deutsche Strings nur aus `src/lib/i18n.ts`.** `CLAUDE.md` Regel 6. Jede DE-Änderung braucht ihr EN-Gegenstück.
8. **Bei jeder Copy-Änderung** `references/30_claims_language.md` und `references/90_decision_log.md` aus dem Waxcelerate-Skill lesen. Keine Superlative, keine Verknappung, keine erfundenen Zitate, Rewax-Intervall immer „400–550 km", niemals „600".
9. **Der Performance-Index in `why-wax.tsx` Block 4** bleibt wie er ist: höherer Balken gleich besser, Classic 95 %, Graphit 72 %, Öl 18 %. `CLAUDE.md` Regel 4 sagt ausdrücklich, das nicht zurückzudrehen.
10. **Keine neue Abhängigkeit** ohne Rückfrage. Alles in diesem Plan geht mit dem, was da ist.
11. **Messen statt vermuten.** Die Skripte in `performance-audit/config/` sind reproduzierbar. Wer behauptet, etwas sei besser geworden, führt die Zahl an.
12. **Zwei Dinge sind nachweislich in Ordnung** und dürfen nicht „repariert" werden: die Bilder in den Produkt-Türen (laden korrekt, ein alter Screenshot täuscht) und die eingefahrene Sticky-Leiste (steht absichtlich außerhalb des Bildschirms). Beides ist in 1.7 dokumentiert.

---

## 6. Die Fragen und ihre Antworten

**Alle drei sind am 5. August beantwortet worden.** Die Antworten stehen als D-M1 bis D-M3 in Abschnitt 0. Die Begründungen bleiben hier stehen, weil sie erklären, warum entschieden wurde wie entschieden wurde.

Offen geblieben ist nur eine Nachfrage, die aus D-M2 entstanden ist:

> **Ist der Rewax-Standort Leipzig noch aktiv?** Der Skill nennt „Rewaxing in Stuttgart und Leipzig", auf der Website kommt Leipzig nirgends vor. Wenn ja, ist das ein zweiter lokaler Markt, der ohne nennenswerten Aufwand zu besetzen wäre. Wenn nein, bleibt alles bei Stuttgart. Details in Paket B8.

---

### Frage 1 — Soll der Verkauf auf die eigene Seite wandern?  ✅ beantwortet: ja, mit eBay als Zweitweg

**Worum es geht.** Der komplette Shop ist gebaut und wartet auf zwölf Zahlen. Es fehlen nur die Stripe-Price-IDs; `docs/aufgaben/STRIPE_SETUP.md` führt in etwa 45 Minuten hindurch, davon 20 Minuten Wartezeit auf Stripes Prüfung.

**Dafür spricht.** Kein Plattformwechsel mitten im Kauf. Kein eBay-Konto nötig. Niedrigere Gebühren (SEPA-Lastschrift 0,35 € pauschal gegen eBays prozentuale Provision). Und vor allem: Mengenrabatt, Starter-Sets als echte Bundles und der Rewax-Service als Zusatzposition sind über eBay technisch gar nicht abbildbar. Das gesamte Bundle-Konzept aus dem Strategiedokument setzt einen eigenen Warenkorb voraus.

**Dagegen spricht.** Der Rechtsaufwand liegt dann bei dir statt bei eBay: Widerruf, Bestellbestätigung, Rückabwicklung. Die Rechtstexte existieren zwar alle als Seiten, sollten vor dem Livegang aber jemand mit Sachverstand gesehen haben. Und die 200+ Bewertungen sind heute der sichtbarste Vertrauensanker; auf der eigenen Seite müssen sie anders getragen werden.

**Meine Einschätzung.** Ja, aber ohne eBay abzuschalten. Der Code ist genau dafür gebaut: Er zeigt den nativen Checkout, sobald eine Price-ID existiert, und lässt sich problemlos so ergänzen, dass darunter weiterhin „Lieber über eBay? Hier entlang" steht. Das kostet nichts und nimmt der Entscheidung das Risiko. Wer eBay vertraut, geht weiter über eBay; wer schnell kaufen will, kauft direkt.

**Was ich brauche:** ein Ja oder Nein. Bei Ja: die zwölf Price-IDs, sobald du sie hast.

---

### Frage 2 — Darf der Rewax-Service aktiv beworben werden?  ✅ beantwortet: ja, plus deutsche Suchbegriffe (Paket B8)

**Worum es geht.** In `95_open_questions.md` steht als Punkt 2, dass Rewax „ab Juli 2026" verfügbar sein sollte und bis zur Freigabe nur auf Nachfrage erwähnt werden darf. Es ist jetzt August. Auf der Startseite steht der Service aber bereits sichtbar als Karte in der Produktsektion („Keine Lust auf den Topf? Schick die Kette." mit Preis „ab 9,95 € je Kette"), und `/kette-wachsen-lassen` ist eine vollwertige, 7,8 Bildschirme lange Seite.

**Zum Preis — hier ist die Website vermutlich im Recht.** Mir ist zuerst aufgefallen, dass die Karte 9,95 € nennt, während `20_products_pricing.md` §5 für B2C 9,99 € angibt. Beim Nachsehen steht in `src/pages/RewaxPage.tsx` aber ein Kommentar vom 28.07.2026: „Prices per Luca: 13,95 € for one chain, 9,95 € per chain from three, plus 1,80 € return shipping either way. These supersede the older figures in the business context (9,99 / 24,99)." Das ist drei Wochen jünger als die Referenzdatei. Nicht die Website ist veraltet, sondern das Kontext-System.

Eine Ungenauigkeit bleibt trotzdem: Die Karte auf der Startseite sagt „ab 9,95 € je Kette", der Einzelpreis ist aber 13,95 €. Formal korrekt, weil 9,95 € tatsächlich der niedrigste Preis ist, aber wer eine einzelne Kette einschickt, zahlt vierzig Prozent mehr als die Zahl auf der Karte erwarten lässt. Sauberer wäre „13,95 € je Kette, ab drei Ketten 9,95 €".

**Was ich brauche:** Erstens, ist Rewax live und frei bewerbbar? Zweitens, bestätigst du die Preise vom 28.07. — dann aktualisiere ich `20_products_pricing.md` und trage die Klärung ins Decision Log ein, damit derselbe Widerspruch nicht wieder auftaucht.

**Warum das für den Plan zählt.** Rewax ist ein Wiederkaufprodukt, und Wiederkauf ist billiger als Neukundengewinnung. Wenn der Service frei ist, gehört er prominenter platziert als heute. Wenn nicht, muss die Karte zurückhaltender werden.

---

### Frage 3 — Gibt es Analytics?  ✅ beantwortet: Vercel Analytics (Paket A6)

**Worum es geht.** Ich habe den Code danach durchsucht (Plausible, GA, gtag, Vercel Analytics, PostHog, Matomo, Umami) und nichts gefunden. Damit ist unbekannt, wie viele Besucher überhaupt bis zur Produktsektion scrollen und wie viele auf den eBay-Link klicken.

**Was das bedeutet.** Alle Wirkungsschätzungen in Abschnitt 4 zu Stufe C sind begründete Vermutungen, keine Messungen. Für Stufe A und B ist das egal — dort messe ich Ladezeiten und Pixel, und die sind objektiv. Für die Frage „bringt der eigene Checkout mehr Umsatz" ist es entscheidend.

**Meine Einschätzung.** Vercel Analytics oder Plausible sind in wenigen Minuten eingebaut, datenschutzfreundlich und ohne Cookie-Banner betreibbar. Drei Ereignisse würden reichen: Scrolltiefe, Klick auf eBay-Link, Klick auf Kauf-Button. Nach vier Wochen wäre die Frage beantwortbar statt schätzbar.

**Was ich brauche:** Soll ich das als eigenes Paket A6 in den Plan aufnehmen? Wenn ja, mit welchem Anbieter.

---

## 7. Was dieser Plan bewusst nicht vorschlägt

Zur Abgrenzung, damit später niemand fragt, warum das Übliche fehlt.

- **Keine Countdown-Timer, keine „nur noch 2 Stück"-Banner, keine Rabattaktionen mit Frist.** `30_claims_language.md` §2 verbietet künstliche Verknappung im B2C ausdrücklich. Die vorhandene Anzeige „Nur noch X verfügbar" in `AddToCartButton.tsx` ist zulässig, solange die Zahl aus `/api/stock` echt ist. Sie darf niemals geschätzt oder gesetzt werden, um Druck zu erzeugen.
- **Keine Exit-Intent-Popups, keine Newsletter-Overlays.** Passen nicht zu einer Marke, deren Ton als „ruhig, präzise, erwachsen" definiert ist. Sie funktionieren statistisch, aber sie kosten hier mehr Glaubwürdigkeit als sie bringen.
- **Keine Neugestaltung der Bildsprache oder des Farbsystems.** Das Editorial-Design mit Serif-Headlines, Eyebrow-Typo und dunklen Full-Bleed-Sektionen entspricht exakt den Design-Präferenzen in `50_brand_positioning.md`. Es ist gut und es ist markenkonform. Der Plan repariert Lesbarkeit und Bedienbarkeit innerhalb dieses Systems, er ersetzt es nicht.
- **Keine Kürzung der Fachtiefe.** Sie ist der Grund, warum diese Zielgruppe kauft. Sie wird umsortiert und verlinkt, nicht entfernt.
- **Kein Framework-Wechsel, kein Umbau der Bundle-Architektur.** Der Total Blocking Time liegt bei 20–130 ms. JavaScript ist hier nicht das Problem, und einen funktionierenden Build anzufassen, um ein Problem zu lösen, das es nicht gibt, wäre genau die Art von Verschlimmbesserung, die dieser Plan vermeiden soll.

---

## 8. Anhang — Messwerkzeuge

Alle in `performance-audit/config/`, alle reproduzierbar:

| Skript | Beantwortet |
|---|---|
| `lighthouserc.mobile.cjs` / `.desktop.cjs` | Scores, Kernmetriken |
| `layout-audit.mjs` | Schriftgrößen, Touch-Ziele, axe-core, Netzwerk, Screenshots |
| `overflow-trace.mjs` | echter horizontaler Überlauf ohne Falschmeldungen |
| `conversion-map.mjs` | Scrolltiefe, Sektionshöhen, Wortzahlen, CTA-Positionen |
| `run-audit.sh` | alles zusammen |

Vor Stufe A einmal komplett laufen lassen und die Ergebnisse als Ausgangswert wegsichern. Ohne Ausgangswert ist jede spätere Verbesserung Behauptung.
