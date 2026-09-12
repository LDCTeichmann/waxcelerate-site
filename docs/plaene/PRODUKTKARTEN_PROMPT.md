# Prompt für die Umsetzungs-Session

Diesen Block in einen neuen Chat kopieren. Er ist so geschrieben, dass er ohne
den Verlauf dieser Session funktioniert.

---

Du arbeitest am Waxcelerate-Repo. Lies zuerst `PROJECT.md`, `CLAUDE.md` und
`AGENTS.md`, dann **`docs/plaene/PRODUKTKARTEN_PLAN.md`** — das ist dein
Auftrag. Der Plan ist recherchiert und abgestimmt; setze ihn um, statt ihn neu
zu erfinden. Wenn du beim Bauen einen Punkt für falsch hältst, sag es in einem
Satz und bau weiter nach Plan, es sei denn, es wäre sachlich falsch.

## Auftrag

Setze die Phasen **1, 2, 4 und 5** des Plans vollständig um. Phasen 3, 7 und 6
(neue Route `/ketten`, Filterleiste, Zurück-Navigation) machst du **nur**, wenn
1/2/4/5 sauber stehen, `npx tsc --noEmit` und `npm run build` durchlaufen und
du noch Luft hast. Sie hängen an einer neuen Route mit Sitemap-, Prerender- und
Schema-Pflichten (`docs/SEO_TECHNIK.md`) und gehören in einen eigenen Commit.

Reihenfolge ist verbindlich: **1 → 2 → 4 → 5**. Phase 1 zuerst, sonst baust du
die Schrift, die weg soll, in die neuen Karten wieder ein.

## Die vier Phasen in einem Absatz

1. **Schrift.** IBM Plex Mono (`.num-data`, die `MONO`-Konstante in
   `src/sections/products.tsx`, das Inline-`fontFamily` in
   `src/pages/ProductStagePage.tsx`) verschwindet aus allen Verkaufs- und
   Marketingflächen und wird zu `.num` (Libre Franklin, tabellarische Ziffern).
   Sie bleibt **nur** in `src/sections/science/`, `src/components/viz/`,
   `src/pages/SciencePage.tsx` (dort nur echte Messwerte, nicht Fließtext-
   Labels) und in den Blog-Codeblöcken. Nichts in einer Verkaufsfläche unter
   12 px. Kein Kaufsignal mehr in `--txff`.
2. **Karten.** Eine Kartensprache für alles. Die Kettenkarte in
   `src/sections/products.tsx` übernimmt die `.shelf-card`-Grammatik aus
   `src/sections/ProductShelf.tsx` (20 px Radius, Haarlinie, blaue Hover-Kante,
   Foto oben randlos, getönter Textblock, Text nie auf dem Foto). Anatomie,
   Rasterdichte und die Tabelle „welche Info gehört auf die Karte" stehen im
   Plan §2 — halte dich daran, auch bei der Versuchung, noch ein Attribut
   unterzubringen. CTA sitzt unten rechts in einer abgesetzten Fußzeile,
   Preis links, gemeinsame Grundlinie über alle Karten einer Reihe.
3. **Lieferung.** Kurzes Lieferdatum auf Karten, Datum + Mechanismus auf der
   Produktseite. Starter-Set-Kachel bekommt eine Lieferzeile (dieselbe
   Schätzung wie Wachs/Ketten), die Rewax-Kachel bekommt **keine**, sondern
   `TURNAROUND` aus `src/pages/rewax/content.ts` mit Rundpfeil-Icon. Kein
   Countdown.
4. **Rabatt.** Die Wachs-Staffel wird aus der 10,5-px-Fußnote eine
   Stückpreis-Staffel unter dem Preis (Euro-Ersparnis vor Prozent), plus ein
   `Mengenrabatt`-Chip am Preis und der Satz, dass eBay den Rabatt im Warenkorb
   abzieht. Alle Zahlen aus `WAX_TIERS` in `src/lib/data.ts` gerechnet, in Cent,
   nach dem Muster von `bundleOffer()` — nie getippt.

## Harte Regeln, die du nicht verletzen darfst

- **Produktdaten nur aus `src/lib/data.ts`**, Strings nur aus
  `src/lib/i18n.ts` (DE **und** EN pflegen). Nie eine Zahl oder einen Satz in
  eine Komponente hardcoden.
- **Keine Hooks in `.map()`** — immer Wrapper-Komponente.
- **`e.stopPropagation()`** auf inneren Links/Buttons, wenn das äußere Element
  schon ein Link ist (die Karte ist einer).
- **Vor jedem Commit `npx tsc --noEmit`** sauber. Pre-commit-Hook läuft
  ohnehin.
- **Keine erfundenen Fakten.** Keine Sterne oder Verkaufszahlen an Ketten, für
  die `reviewCount`/`unitsSold` in `data.ts` nicht gesetzt sind. Keine
  künstliche Verknappung („nur noch 2 verfügbar") — im B2C verboten. Keine
  Superlative.
- **Löschen, nicht umformulieren:** `preWaxedHint` in `i18n.ts` (DE und EN)
  behauptet „Kauf direkt über eBay mit vollem Käuferschutz". Das stimmt laut
  Luca nicht. Ersatzlos raus, der Nutzen zieht ins Nutzenband (Plan §3).
- **Keine Gedankenstriche als Satzzeichen in Kundentexten.** Gilt für jeden
  neuen deutschen String.
- **Performance-Index-Balken in `why-wax.tsx` Block 4 nicht anfassen**
  (Classic 95 %, Graphit 72 %, Öl 18 % — höher = besser).
- Kein neues Farbsystem, keine neuen Animationen, keine Preisänderungen.

## Was du NICHT entscheiden darfst

Fünf Punkte hängen an Luca und stehen im Plan unter „Offene Punkte".
Bau sie so, dass die Entscheidung später eine Zeile ist:

- **eBay-Versand inklusive?** Lege das optionale Feld `shippingIncluded?:
  boolean` in `Product` (`data.ts`) an, setze es bei **keinem** Produkt, und
  lass die Karte die Zeile `inkl. Versand` nur rendern, wenn es `true` ist.
  Nicht behaupten, bis Luca bestätigt.
- **Wachs-Staffel 5/10/15 % (Code) vs. 10/15 % (Skill `waxcelerate`).**
  `WAX_TIERS` bleibt unverändert. Nicht angleichen.
- **Rewax-Preis:** setze die empfohlene Variante um — groß `15,95 € je Kette`,
  darunter klein `mit 10er-Karte 9,45 €` (aus `TEN_CARD` gerechnet, nicht
  getippt). Die B-Variante nicht bauen.
- **Rewax-Turnaround:** `TURNAROUND` aus `content.ts` verwenden (3–5 Werktage),
  nicht 3–4.
- **Mono in den Wissenschafts-Figuren** bleibt. Nicht weiter entfernen.

## Arbeitsweise

- Branch: arbeite auf dem Branch, den dir deine Session vorgibt; wenn keiner
  vorgegeben ist, leg einen eigenen an. Nicht auf `main` committen.
- **Ein Commit pro Phase**, deutsche Commit-Nachricht im Stil der bestehenden
  Historie (was und warum, nicht nur was).
- Nach Phase 2 und nach Phase 5 einmal `npm run build` und die betroffenen
  Ansichten im eingebauten Browser-Pane prüfen (`preview_start`, Port 5174) —
  Startseite, Regal, Kettenliste, eine Produktseite, hell **und** dunkel, und
  bei ~390 px Breite. Das Chrome-Toolset und Desktop-Screenshots sind ohne
  Rückfrage nicht erlaubt (siehe `CLAUDE.md`).
- Achte bei Phase 2 besonders auf Mobile: die 2-spaltige Kettenkachel darf bei
  ~165 px Breite weder den Modellnamen noch den Preis umbrechen. Wenn sie es
  tut, bleib mobil 1-spaltig — das ist im Plan ausdrücklich erlaubt und ein
  schon einmal gemachter Fehler (`docs/DESIGN.md` §4, dritter Anlauf).
- Wenn du eine Entscheidung triffst, die im Plan nicht steht, schreib sie als
  Kommentar an die Stelle im Code, an der sie wirkt — so hält es dieses Repo
  durchgängig.
- Am Ende: `docs/plaene/PRODUKTKARTEN_PLAN.md` abhaken (erledigte Phasen
  markieren) und eine Zeile ins Entscheidungslog in `PROJECT.md` schreiben.
- Berichte am Schluss knapp: was gebaut, was bewusst ausgelassen, was Luca
  noch entscheiden muss.
