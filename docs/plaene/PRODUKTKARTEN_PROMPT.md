# Prompt für die Umsetzungs-Session

Alles ab der Trennlinie in einen neuen Chat kopieren. Der Block funktioniert
ohne den Verlauf der Planungs-Session.

---

Du arbeitest am Waxcelerate-Repo (React 19, TypeScript, Vite, Tailwind,
React Router 7). Lies zuerst `PROJECT.md`, `CLAUDE.md` und `AGENTS.md`, dann
**`docs/plaene/PRODUKTKARTEN_PLAN.md`** — das ist dein Auftrag. Der Plan ist
recherchiert, gegen den Code geprüft und von Luca abgenommen. Setz ihn um,
statt ihn neu zu erfinden. Wenn du beim Bauen einen Punkt für sachlich falsch
hältst, sag es in einem Satz und bau nach Plan weiter, außer es wäre wirklich
falsch.

## Bevor du irgendetwas änderst

1. `npm ci` — `node_modules` ist in einer frischen Session leer.
2. `npx tsc -b --force` und `npm run build`, um den Ausgangszustand zu kennen.
   **Wichtig:** `npx tsc --noEmit` aus `CLAUDE.md` Regel 5 prüft **nichts** —
   die Wurzel-`tsconfig.json` hat `"files": []` und nur `references`, der
   Befehl ist immer grün. Es gibt auch **keinen** Pre-Commit-Hook, anders als
   `CLAUDE.md` behauptet. Der einzige echte Typcheck ist `npx tsc -b --force`
   (so steht es auch in `docs/SEO_TECHNIK.md:137-139`). Korrigier `CLAUDE.md`
   in Stufe 0 mit.
3. Wenn der Ausgangszustand schon rot ist, sag es und repariere es nicht
   nebenbei.

## Reihenfolge und Zwischenstopp

Arbeite die Stufen **0 → 1 → 2** ab, ein Commit je Stufe. Danach ist
**Pflicht-Zwischenstopp**: berichte Luca, was steht, was du gelassen hast und
was ihm auffallen wird. Erst danach Stufe 3 und 4 — in derselben Session,
wenn noch Luft ist, sonst startet Luca mit demselben Prompt einen zweiten
Chat. Stufe 3 (die neue Route `/ketten`) ist der riskanteste Teil und gehört
in einen eigenen Commit.

Stufe 0 zuerst ist nicht verhandelbar: sonst baust du die Schrift, die weg
soll, in die neuen Karten wieder ein.

## Die Stufen in je einem Absatz

**Stufe 0 — Fundament.** IBM Plex Mono raus aus allen Verkaufs- und
Marketingflächen: `.num-data` wird `.num` (die Klasse setzt keine
Schriftfamilie, sie erbt Libre Franklin, das ist genau richtig), dazu die
`MONO`-Konstante in `src/sections/products.tsx:21` und das
Inline-`fontFamily` in `src/pages/ProductStagePage.tsx`. Mono **bleibt** in
`src/sections/science/`, `src/components/viz/InstrumentFrame.tsx`, den
Blog-Codeblöcken und bei echten Messwerten in `SciencePage.tsx` — dort trägt
die Gleichbreite Bedeutung. Nichts in einer Verkaufsfläche unter 12 px, kein
Kaufsignal mehr in `--txff`. Außerdem: eine Sternkomponente statt drei,
`Stars.tsx` lernt anteilige Füllung (heute harter Vergleich `i < rating` in
Zeile 12, eine 4,8 ist nicht darstellbar).

**Stufe 1 — Eine Produktkarte.** Die Kettenkarte hört auf, ein Sonderfall zu
sein, und übernimmt die `.shelf-card`-Grammatik aus
`src/sections/ProductShelf.tsx`. Anatomie, Rasterdichte und die Tabelle
„welche Info gehört auf die Karte" stehen im Plan §Stufe 1 — halt dich daran,
auch bei der Versuchung, noch ein Attribut unterzubringen. Drei Dinge sind
Pflicht und leicht zu übersehen: das Bild bekommt dieselbe
`<picture>`-Pipeline mit AVIF vor WebP wie das Regal (heute lädt die
Kettenkarte ein nacktes `<img>`), der eBay-Button darf **nicht** mehr im
`<Link>` liegen (Stretched-Link-Muster, siehe K2 im Plan), und Kartentitel
sind `<p>`, weil `index.css:607-612` Überschriftenfarben global mit
`!important` erzwingt.

**Stufe 2 — Kaufsignale und die Versand-Wahrheit.** Der größte Brocken. Die
Versandaussage der Seite ist im reinen eBay-Betrieb falsch und hängt an rund
14 Stellen; sie wird an `checkoutEnabled` gekoppelt, sodass sie beim
Stripe-Start automatisch zurückkippt. Dazu Lieferdatum auf Karten und
Produktseite, Turnaround statt Lieferdatum bei Rewax, der Preis je Anwendung
als neues Hauptsignal beim Wachs, die Staffel als kompakter Zusatz, die
Rewax-Preiszeile und das Löschen der falschen Käuferschutz-Aussage. Die
vollständige Liste der Fundstellen steht im Plan §Stufe 2.

**Stufe 3 — `/ketten`.** Die Kettenliste wird eine echte Route statt eines
`useState`, der das Regal ersetzt. Der Filter wird eine Leiste statt einer
380-px-Karte, der Zustand wandert in Query-Parameter, unter das Raster kommt
eine „Passt dazu"-Reihe, und der Zurück-Weg bekommt ein Ziel-Label. Das
SEO-Pflichtprogramm aus `docs/SEO_TECHNIK.md:29-41` ist Teil der Aufgabe,
nicht optional.

**Stufe 4 — Politur.** Geteilte Elementübergänge Karte → Produktseite,
Bildprioritäten, Filterwechsel ohne Ladezustand, Trefferflächen, Dark-Mode-
Durchgang.

## Harte Regeln, die du nicht verletzen darfst

- **Produktdaten nur aus `src/lib/data.ts`**, Strings nur aus
  `src/lib/i18n.ts`, **DE und EN**. Nie eine Zahl oder einen Satz in eine
  Komponente hardcoden.
- **Preise, Rabatte und Ersparnisse immer rechnen, nie tippen.** In Cent
  rechnen, wie `bundleOffer()` in `data.ts:562-579` es vormacht — der
  Kommentar dort erklärt den Fließkomma-Fehler, den man sonst einbaut.
- **Keine Hooks in `.map()`** — immer eine Wrapper-Komponente dazwischen.
- **Keine erfundenen Fakten.** Keine Sterne oder Verkaufszahlen an Produkten,
  für die `reviewCount`/`unitsSold` in `data.ts` nicht gesetzt sind. Keine
  künstliche Verknappung („nur noch 2 verfügbar"), kein Countdown — im B2C
  verboten. Keine Superlative.
- **Kein `aggregateRating` im JSON-LD.** Der Verzicht ist zweimal bewusst
  getroffen worden (`ProductDetailPage.tsx:530-537`,
  `docs/SEO_TECHNIK.md:79-84`). Bewertungen erscheinen sichtbar auf der
  Karte, nicht im Schema.
- **Der Grundpreis je 100 g bleibt.** Bei Ware nach Gewicht ist er nach PAngV
  Pflicht. Nicht wegräumen, weil die neue je-Anwendung-Zeile hübscher ist.
- **JSON-LD immer in beiden Fassungen pflegen** — React-Komponente **und**
  Prerender-Skript (`docs/SEO_TECHNIK.md:55-61`). Eine allein reicht nie.
- **Löschen, nicht umformulieren:** `preWaxedHint` in `i18n.ts` behauptet
  „Kauf direkt über eBay mit vollem Käuferschutz". Das stimmt laut Luca
  nicht. Ersatzlos raus, DE und EN.
- **Keine Gedankenstriche als Satzzeichen in Kundentexten.** Gilt für jeden
  neuen deutschen String.
- **Ketten sind „handgewachst in Stuttgart", nie „Made in Germany"** — das
  Herkunftsrecht gilt für die Marke der Kette, nicht für die Wachsarbeit.
- **Performance-Index-Balken in `why-wax.tsx` Block 4 nicht anfassen**
  (Classic 95 %, Graphit 72 %, Öl 18 %, höher = besser).
- Kein neues Farbsystem, keine Preisänderungen, kein Stripe-Umbau.

## Was du NICHT entscheiden darfst

Bau diese Punkte so, dass eine spätere Entscheidung eine Zeile ist:

- **Bewertungszahlen je Kette.** Luca bestätigt, dass es echte eBay-Werte
  gibt, hat sie aber noch nicht geliefert. Leg die Felder in `data.ts` an,
  setz sie bei **keiner** Kette, und render die Sternzeile nur, wenn sie
  gesetzt sind. Nichts schätzen.
- **Wachs-Staffel bleibt 5 / 10 / 15 %** (`WAX_TIERS` in `data.ts`). Das
  Skill `waxcelerate` sagt etwas anderes und ist veraltet. Nicht angleichen.
- **Anwendungen je Block:** rechne mit `applications` aus `data.ts` (20–32
  bei 500 g). Das Skill sagt 15–20; der Konflikt ist bekannt und liegt bei
  Luca. Nicht selbst auflösen.
- **Rewax:** `TURNAROUND` aus `src/pages/rewax/content.ts` (3–5 Werktage) und
  die im Plan entschiedene Preiszeile („15,95 € je Kette" groß, „mit
  10er-Karte 9,45 €" darunter). Keine B-Variante bauen.
- **Mono in den Wissenschafts-Figuren bleibt.** Nicht weiter entfernen.
- **Der Versand-Haken im Google-Merchant-Center** liegt außerhalb des Repos.
  Nenn ihn im Bericht, änder nichts daran.

## Arbeitsweise

- Branch: nimm den, den deine Session vorgibt; sonst leg einen eigenen an.
  Nicht auf `main` committen.
- **Ein Commit pro Stufe**, deutsche Commit-Nachricht im Stil der
  bestehenden Historie: was und warum, nicht nur was.
- Vor jedem Commit `npx tsc -b --force`. Nach Stufe 1, 2 und 3 zusätzlich
  `npm run build`.
- Prüf die betroffenen Ansichten im **eingebauten Browser-Pane**
  (`preview_start`, Port 5174): Startseite, Regal, Kettenliste, eine
  Produktseite, **hell und dunkel**, und bei rund 390 px Breite. Das
  Chrome-Toolset und Desktop-Screenshots sind ohne Rückfrage nicht erlaubt,
  siehe `CLAUDE.md`.
- Achte in Stufe 1 besonders auf Mobile. Der Plan schreibt einspaltig unter
  640 px vor, und zwar aus einem konkreten Grund: bei 390 px blieben
  zweispaltig nur ~149 px Inhalt je Karte, dort passt „Bei eBay kaufen" nicht
  in eine Zeile. An genau dieser Breite ist im Regal schon ein Layout
  zerbrochen (`docs/DESIGN.md` §4, dritter Anlauf). Nicht optimistisch
  zweispaltig bauen und hoffen.
- Wenn du eine Entscheidung triffst, die im Plan nicht steht, schreib sie als
  Kommentar an die Stelle im Code, an der sie wirkt. So hält es dieses Repo
  durchgängig, und die Kommentare sind der Grund, warum man hier nach Monaten
  noch versteht, warum etwas so ist.
- Am Ende: erledigte Stufen im Plan abhaken und eine Zeile ins
  Entscheidungslog in `PROJECT.md`.

## Bericht

Nach Stufe 2 und am Ende jeweils knapp: was gebaut, was bewusst ausgelassen,
was Luca noch entscheiden oder liefern muss, und was ihm beim ersten
Draufschauen auffallen wird.
