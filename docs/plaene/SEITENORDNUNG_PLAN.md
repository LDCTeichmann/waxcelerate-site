# Seitenordnung 2026-09: schlanke Startseite, drei Türen, neue Seitenstruktur

> Von Luca freigegeben am 17.09.2026. Umsetzung durch vier Sonnet-Chats, jeder arbeitet
> nur seinen Abschnitt ab. Stand der Erkundung: `origin/main` 910212d (16.09.2026).
> **Status:** Chat 1 ☐ · Chat 2 ☐ · Chat 3 ☐ · Chat 4 ☐ (jeder Chat hakt seinen eigenen Kasten ab)

## Kontext

Kundenfeedback: Die Seite ist zu chaotisch, hat zu viele Werkzeuge mit derselben
Funktion und zu viel Bewegung. Die Startseite hat zwölf Abschnitte, und viele
Fakten stehen dort drei- bis sechsmal. Die Seitenbreite springt je nach Seite
zwischen 672 px und 1440 px. Seit es die Topbar gibt, fällt außerdem die untere
Rundung der Hero-Karte aus dem ersten Bildschirm.

Ziel:
- **Startseite:** Hero → drei Produkttüren → „Was sich für dich ändert“ → Bewertungen → Footer.
- **Alles andere auf eigenen Seiten**, mit klarer Menüordnung.
- **Keine doppelten Werkzeuge.**
- **Eine gemeinsame Inhaltsbreite** auf allen Seiten.

Die Produktseiten sind die nächste Runde und gehören **nicht** in diesen Plan.

## Getroffene Entscheidungen

| Thema | Entscheidung | Warum |
|---|---|---|
| FAQ | Lebt in **„Blog & FAQ“** (`/blog#fragen`); `/faq` leitet per 301 dorthin. Die Kontaktseite verlinkt nur mit einer Zeile. | Lucas Wahl; die Suche findet Antworten schon heute |
| Tür 1 „Kettenwachs“ | **Eigene Seite `/kettenwachs`**, kein Aufklappen | Siehe Begründung unten |
| Anleitungen & Rechner | Eine Seite unter der bestehenden URL **`/anleitung`**; `/rechner` leitet per 301 auf `/anleitung#rechner`. `/rechner/:slug` bleiben als Einzelseiten bestehen. | Die URL hat schon Ranking; Blogartikel verlinken die Einzelrechner |
| Über mich | Wird Teil von **`/kontakt`**; `/ueber-uns` leitet per 301 auf `/kontakt#ueber-mich` | Lucas Vorgabe |
| Hero-Klick | Der Block scrollt zu `#produkte`. `WaxDive`, `WaxVerdict`, `WaxFormulaPanel`, die Lupe und der Hinweis „Welcher ist deiner?“ fliegen raus. Vorher werden sie als Git-Tag **und** GitHub-Release `archiv/hero-waxdive` gesichert. | Conversion; der Zustand bleibt auffindbar |
| Kosten-Rechner | `WaxCalculator` (von der Wachsseite) ersetzt `CostCalculator` überall. Die Rotationsempfehlung wird eine einzige Funktion in `waxMath.ts`. | Zwei Rechner beantworteten dieselbe Frage mit widersprüchlichen Regeln |
| Ablauf | Chat 1 läuft allein bis auf `main`, danach laufen Chat 2–4 parallel | Lucas Wahl, weniger Konflikte |

**Warum Tür 1 eine eigene Seite wird:**
- **Gleiches Verhalten:** Tür 2 (`/ketten`) und Tür 3 (`/kette-wachsen-lassen`) sind schon Seiten. Eine Tür, die aufklappt, und zwei, die wegführen, wären inkonsistent.
- **Vorbild:** Cyclowax führt jede Kachel auf eine eigene Kategorieseite.
- **Kaufpsychologie:** erst drei Optionen, dann drei (Hick's Law). Jeder Schritt zeigt wenig und dafür klar. Aufklappen schiebt das Layout und verwirrt beim Zuklappen.
- **SEO:** `/kettenwachs` kann für „Kettenwachs kaufen“ ranken.
- **Kein Tempoverlust:** Der Chunk wird beim Hover vorgeladen, der Wechsel läuft mit `viewTransition`.

## Neue Menüordnung (Desktop und mobil gleich)

1. **Warum Wachs?** → `/#warum-wachs`. Dropdown: „Öl gegen Wachs“, „Bewertungen“; „Herkunft“ entfällt.
2. **Produkte** → `/#produkte`. Dropdown: Kettenwachs (`/kettenwachs`), Classic, Pro, Starter-Set, Vorgewachste Ketten.
3. **Kette wachsen lassen** → `/kette-wachsen-lassen`
4. **Anleitungen & Rechner** → `/anleitung`
5. **Blog & FAQ** → `/blog`
6. **Wissenschaft** → `/wissenschaft`
7. **Kontakt** → `/kontakt`

„Über mich“ und die Gruppe „Ratgeber“ entfallen als Menüpunkte.

## Gemeinsame Regeln für alle Chats

- **Pflichtlektüre:** `CLAUDE.md`, `PROJECT.md`, `AGENTS.md`, `docs/DESIGN.md` und diesen Plan. Ein Chat arbeitet **nur seinen eigenen Abschnitt** ab.
- **Arbeitskopie:** eigene Worktree von frischem `main`, danach `npm ci`:
  `git fetch origin && git worktree add ".claude/worktrees/<name>" -b <branch> origin/main`.
  Nie im Haupt-Checkout arbeiten, nie mit bare `git stash`.
- **Dateibesitz:** Jede Datei gehört genau einem Chat (Tabelle unten).
  - Geteilte Dateien (`i18n.ts`, `data.ts`, `App.tsx`, `vercel.json`, `scripts/generate-*.mjs`, `index.css`, `PROJECT.md`): nur die eigenen Namespaces bzw. Zeilen anfassen.
  - Neue i18n-Keys **innerhalb** des eigenen Namespaces anlegen (DE und EN), nie am Dateiende. So entstehen getrennte Hunks.
- **Inhalte:**
  - Keine Zahlen erfinden. Werte kommen aus `data.ts` / `waxMath.ts`.
  - Deutsche Strings nur in `i18n.ts`.
  - Keine Gedankenstriche als Satzzeichen in neuen Texten.
  - Wenig Text, Details aufklappbar (siehe `leute-lesen-nicht`).
  - Anspruch: preiswürdiges Design.
- **Weniger Bewegung:**
  - Keine neue Autoplay-Animation.
  - Alles, was sich bewegt, respektiert `prefers-reduced-motion` und lässt sich pausieren.
- **Neue oder entfernte Route:** Checkliste in `docs/SEO_TECHNIK.md` §1 abarbeiten: Prerender, Sitemap, `llms.txt`, identisches JSON-LD, 301 in `vercel.json`.
- **Abschluss eines Chats:**
  1. `git fetch origin && git rebase origin/main`
  2. `npx tsc -b --force` und `npm run build` laufen grün.
  3. Browser-Prüfung (siehe Abschnitt Verifikation).
  4. `git push origin <branch>` (Sicherung), dann `git push origin HEAD:main` (nur Fast-Forward). Bei Ablehnung: erneut rebasen, bauen, pushen.
  5. Eine Zeile im Entscheidungslog von `PROJECT.md`. Bei einem Konflikt dort beide Zeilen behalten.
  6. Memory-Eintrag anlegen.
  7. Am Ende eine kurze Liste der offenen Fragen an Luca.

### Dateibesitz

| Chat | Besitzt |
|---|---|
| 1 Rahmen | `index.css` (Rahmen-Token), `Section.tsx`, `navigation.tsx`, `NavMenu.tsx`, `Topbar.tsx`, `footer.tsx`, `NotFoundPage.tsx`, i18n `nav`/`header`/`footer`; äußere Wrapper aller Seiten |
| 2 Startseite | `hero-light.tsx`, `sections/hero/*`, `products.tsx`, `ProductShelf.tsx`, neue `ProductDoors.tsx`, neue `KettenwachsPage.tsx`, `why-wax.tsx`, `BeforeAfterSlider.tsx`, `ScienceTeaser.tsx`, `reviews.tsx`, `TrustStrip.tsx`, `Origin.tsx`, `closing-cta.tsx`, `MobileStickyCTA.tsx`, `useDispatchLine.tsx`, `KettenPage.tsx` („Passt dazu“), `index.html`, `generate-home-html.mjs`; `App.tsx` Homepage-Block + `/kettenwachs` |
| 3 Anleitungen & Rechner | `AnleitungPage.tsx`, `RechnerPage.tsx`, `guides.tsx`, `tools.tsx`, `components/tools/**`, `toolRegistry.ts`, `WaxCalculator.tsx`, `ProcessWatch.tsx` (+ Auslagerung), Rotationsfunktion in `waxMath.ts`, `guideFacts`/`waxProcessTimeline`; `App.tsx` `/rechner`-Zeile |
| 4 Kontakt, Blog & FAQ | `KontaktPage.tsx`, `UeberUnsPage.tsx`, `FaqPage.tsx`, `about.tsx`, `contact.tsx`, `faq.tsx`, `pages/blog/BlogIndexPage.tsx` + `blog/hub/*`, `generate-search-index.mjs`, `lib/search/*`; `App.tsx` `/faq`- und `/ueber-uns`-Zeilen |

---

## Chat 1 · Rahmen und Navigation (Welle 1, läuft allein)

Branch `feat/seitenrahmen-nav`.

1. **Ein Rahmen für alle Seiten**
   - In `index.css` einführen: `--frame-w: 1180px` und die Klasse `.wx-frame` (`max-width: var(--frame-w)`, `margin-inline: auto`, Seitenabstand 20 px, ab 640 px 32 px). Das sind die Werte von `.wxp-wrap`.
   - `.wxp-wrap` (`wax.css`) liest dasselbe Token.
   - Anwenden auf:
     - `Section.tsx` (heute `max-w-7xl` + `px-6…xl:px-20`)
     - Footer (`max-w-6xl`)
     - `/ketten` (1440)
     - `/rechner`, `/kette-wachsen-lassen`, Stadtseiten (`max-w-5xl`)
     - `/wissenschaft` (außer Hero)
     - `/blog`-Index (`max-w-6xl`)
     - `/kontakt`, `/faq`, `/ueber-uns`, `/anleitung` (`max-w-3xl`)
     - Legacy-Zweig von `ProductDetailPage` (1400)
   - **Ausnahmen:**
     - Heros dürfen breiter sein.
     - Die Textspalte eines Blogartikels bleibt 740 px (Lesemaß). Ihr Bildband richtet sich am Rahmen aus.
     - Rechtstexte bleiben schmal.
     - Innerhalb des Rahmens dürfen Fließtexte ein Lesemaß haben, aber **linksbündig an der Rahmenkante**, nicht zentriert schmaler.
2. **Navigation** nach der Menüordnung oben, in `primaryNavItems`, im mobilen Menü (`navItems`) und in den i18n-Labels:
   - Neue Keys `nav.guidesTools` („Anleitungen & Rechner“) und `nav.blogFaq` („Blog & FAQ“).
   - Die Ratgeber-Gruppe entfernen.
   - Der Dropdown-Eintrag „Kettenwachs“ zeigt vorerst auf `#produkte`; Chat 2 stellt ihn auf `/kettenwachs` um.
   - Der aktive Zustand von „Anleitungen & Rechner“ gilt auch für `/rechner/*`.
3. **Footer:**
   - Links an die neue Struktur anpassen: Über mich → `/kontakt#ueber-mich`, FAQ → `/blog#fragen`, Tools → `/anleitung#rechner`.
   - Die doppelten eBay-Links zusammenfassen.
4. **Topbar:** Wechselintervall `AUTOPLAY_MS` von 5000 auf 8000 ms (weniger Bewegung).
5. **`NotFoundPage`:** Der Link „#faq“ zeigt auf `/blog#fragen`.
6. **Verifikation:**
   - Im Browser-Pane bei 1440×900 auf `/`, `/ketten`, `/kette-wachsen-lassen`, `/wissenschaft`, `/blog`, `/kontakt`, `/anleitung`, `/rechner/intervall` und `/produkt/wax-500` per `getBoundingClientRect` die linke Kante der ersten H1/H2 außerhalb des Heros messen.
   - Ziel: überall derselbe x-Wert (±2 px). Zusätzlich bei 375 px: kein horizontales Scrollen.

**Abschluss:** Luca melden, dass Welle 2 starten kann.

---

## Chat 2 · Startseite, Hero, drei Türen, /kettenwachs (Welle 2)

Branch `feat/startseite-tueren`.

1. **Archiv sichern** (vor dem Löschen):
   ```bash
   git tag archiv/hero-waxdive origin/main && git push origin archiv/hero-waxdive
   gh release create archiv/hero-waxdive --title "Archiv: Hero-Tauchgang (WaxDive/Verdict/Formel)" --notes "<was es war, welche Dateien, wie man es zurückholt>"
   ```
   Dazu `docs/archiv/HERO_WAXDIVE.md` mit derselben Beschreibung.
2. **Hero** (`hero-light.tsx`)
   - **Höhe:** Die Topbar-Höhe in die Kartenhöhe einrechnen (`calc(100dvh - 108px - var(--topbar-h))` bzw. `134px`) und die Obergrenze `64vw`/`78vw` etwas senken. Die untere Rundung plus mindestens 16 px weißer Rand muss bei 1280×800, 1440×900 und 1920×1080 **mit sichtbarer Topbar** im ersten Bildschirm liegen.
   - **Block** (Bild, Größe, Bounce) bleibt unverändert. Klick bzw. Tap scrollt zu `#produkte` (`aria-label` „Zu den Produkten“).
   - **Entfernen:** Lupe (`WaxLensCutout`), Hinweis-Pille, Knopf „Welcher ist deiner?“, Tap-Ripple, `WaxDive`, `WaxVerdict`, `WaxFormulaPanel`, `diveOpen`-State. Verwaiste Dateien löschen; `science.ts diveFormula` nur löschen, wenn es keinen Verbraucher mehr hat.
   - **Eyebrow:** statt „WAXCELERATE · KETTENWACHS · STUTTGART“ nun „Handgegossen in Stuttgart“. Der blaue Strich davor wird ein 18×3 px **Deutschland-Strich** (drei Streifen: Schwarz / Rot `#DD0000` / Gold `#FFCC00`, im Dunklen mit feiner Kontur). Dezent, kein Emoji.
   - **Untere Leiste neu:**
     - **Links, Bewertungszeile als Link** auf das eBay-Bewertungsprofil: `<Stars>` in Akzentblau `#3D67CA` (größer, gut lesbar), „250+ Bewertungen · 100 % positiv“ in 13–14 px statt Versal-Mikroschrift.
     - **Rechts drei Kennzahlen:**
       - „2–3×“ / „längere Kettenlaufzeit“
       - `~{waxVsOil.cost.savedEur} €` / „gespart auf 12.000 km“, live aus `data.ts` (heute 127 €, nicht 70)
       - **Live-Versand:** grüner Punkt (statisch) + kompakte Variante von `useDispatchLine`, z. B. „Heute versandt“ / „bis 15 Uhr bestellt“, nach Versandschluss „Versand morgen“ bzw. Wochentag. Dafür erhält `useDispatchLine` eine `compact`-Option.
     - Alle Labels nach `i18n hero.*`; die Inline-`de ? :`-Strings verschwinden.
   - **Mobil:** gleiche Inhalte (Bewertungszeile, Versandzeile) knapp.
3. **Drei Türen** (`#produkte`, neue `ProductDoors.tsx`)
   - **Überschrift (SEO):** H2 „Kettenwachs, gewachste Ketten oder wachsen lassen“ plus eine Zeile Unterzeile.
   - **Drei gleich große Bildkarten:** Bild randlos (Desktop 4:5, mobil 16:10), Verlauf unten, darauf Titel, eine Zeile Nutzen, Preis, Pfeil. Die ganze Karte ist ein Link mit `viewTransition`. Hover: ruhiges Bild-Zoom 1.03, kein Autoplay.
   - **Tür 1 „Kettenwachs“:** „Heißwachs zum Selberwachsen. Classic, Pro oder als Set.“, „ab {minWaxPrice}“, Versandzeile. Ziel `/kettenwachs`.
   - **Tür 2 „Vorgewachste Ketten“:** „Fertig gewachst, direkt montieren.“, „ab {günstigste Kette}“, Versandzeile. Ziel `/ketten`.
   - **Tür 3 „Kette wachsen lassen“:** „Einschicken, gewachst zurück in {TURNAROUND}.“, „15,95 € je Kette“. Ziel `/kette-wachsen-lassen`.
   - **Bilder:** aus `public/images/shelf/*`, `products/*` und `rewax/hero` wählen (vorhandene AVIF/WebP + `-800`). Eine Tür bekommt nur dann ein neues Bild, wenn sonst nichts passt. Falls nötig, per `build-shelf-images.mjs` erzeugen.
   - **Aufräumen:** `products.tsx` rendert nur noch die Türen. Die Weiterleitung `wax:selectTab` / `?ketten=` bleibt erhalten. Der Mobile-Sticky-CTA zielt weiter auf `#produkte`.
4. **`/kettenwachs`** (neue `KettenwachsPage.tsx`, lazy Route in `App.tsx`)
   - Kopf wie `/ketten`: Rück-Pille, H1 „Kettenwachs kaufen“, eine Zeile, Versandzeile.
   - **Drei gleich hohe Karten:** Classic und Pro (bestehendes `WaxPanel` aus `ProductShelf.tsx`) plus eine **Starter-Set-Karte in derselben Zonen-Grammatik** (Bild, Name, „ab {minSetPrice}“, drei kurze Punkte zum Inhalt, CTA „Set zusammenstellen“ → `/starter-set`). Gleiche Zonenhöhen per Grid, nicht per `mt-auto`-Zufall.
   - Darunter Vergleichen-Knopf (`CompareModal`) und `PriceNote`.
   - **„Lieber anders?“:** die zwei anderen Türen als kleine Variante von `ProductDoors`.
   - **SEO:** Meta, `CollectionPage` + `ItemList` + Breadcrumb (Helmet und Prerender identisch), Sitemap, `llms.txt`.
   - Nav-Dropdown „Kettenwachs“ und „Passt dazu“ auf `/ketten` → `/kettenwachs`. Hover-Prefetch des Chunks.
5. **Startseite verschlanken** (`App.tsx`, Homepage-Block)
   - Neue Reihenfolge: Hero → Products → WhyWax → Reviews → Footer.
   - **Raus:** `TrustStrip` (steht jetzt im Hero), `Origin`, `Tools`, `About`, `Guides`, `FAQ`, `Contact`, `ClosingCTA` (wiederholte nur Hero-Zahlen).
   - `Origin.tsx`, `TrustStrip.tsx` und `closing-cta.tsx` samt eigener i18n-Keys löschen. `tools`/`guides`/`about`/`contact`/`faq` räumen Chat 3/4 ab; hier nur die Imports entfernen.
   - **Alte QR-Links:** `/?w=…`/`?waxed=…` → `navigate('/anleitung' + search + '#rechner', {replace:true})`.
   - **`MobileStickyCTA`:** beobachtet nicht mehr `#tools`.
   - **`index.html`:** das handgeschriebene FAQPage-Schema (23 Fragen) und das HowTo-Schema aus dem Homepage-`<head>` entfernen.
   - **`generate-home-html.mjs`:** `noscript`-Gliederung an die neue Startseite anpassen.
6. **„Was sich für dich ändert“** (`why-wax.tsx`)
   - **Doppelungen raus:** Die Kennzahlen „2–3×“ und „127 €“ stehen jetzt im Hero. Die Kennzahlenreihe behält nur, was sonst nirgends steht (250–450 km Intervall, 2–4 W). Also zwei Zahlen ruhig neben- bzw. unter den Punkten statt einer Vierer-Reihe.
   - **Slider etwas kleiner:** Spalten `1fr/1fr`, Höhe auf höchstens rund 520 px begrenzt. Mikroskop-Umschalter und Beleg-Links bleiben.
   - **`BeforeAfterSlider`:**
     - Nur **ein** Sweep beim ersten Sichtkontakt, kein 20-s-Loop.
     - Übergänge 3,2 s statt 1,8 s, Handle-Puls höchstens zweimal statt endlos.
     - `prefers-reduced-motion` schaltet beides ab.
     - Die Änderung wirkt auch auf dem Blog und der Wachsseite; das ist gewollt.
   - **`ScienceTeaser`:** kein 2,8-s-Autowechsel mehr. Zonen wechseln nur bei Hover oder Klick.
   - **Wo Luca Gegenteiliges bestätigt hat** (Foto/Mikroskop bleibt, „Es wird leise“ bleibt draußen), nicht anfassen.
7. **Bewertungen** (`reviews.tsx`)
   - **Tempo in px/s statt fester Dauer:** Dauer = halbe Spurbreite ÷ **18 px/s**, per `ResizeObserver` gemessen (heute rund 3–4× schneller). Lesbar laut Scroll-Text-Empfehlungen.
   - **Sichtbarer Pause-Knopf** (WCAG 2.2.2). Hover- und Fokus-Pause bleiben.
   - **Kartenbreite streng nach Textlänge:** unter 60 Zeichen 220 px, unter 140 Zeichen 300 px, unter 260 Zeichen 380 px, darüber 460 px. Bewertungen mit Foto bekommen zusätzlich die Fotobreite.
   - **Ganze Karte klickbar:**
     - Ziel: `https://www.ebay.de/fdbk/feedback_profile/waxcelerate` als neue Konstante `CONTACT.ebayFeedback` in `data.ts`.
     - `target="_blank" rel="noopener"`, `aria-label` „Bewertung auf eBay ansehen“, kleines ↗ beim Hover.
     - Die doppelte Kopie im Marquee bleibt `aria-hidden` und `tabIndex=-1`.
     - Den festverdrahteten eBay-Link im Abschnitt durch die Konstante ersetzen.
8. **Doppelungs-Endprüfung:** Auf der fertigen Startseite steht jede der Aussagen 2–3×, 127 €, 250+/100 %, Stuttgart und Versand **genau einmal** (Ausnahme: Punkt 3 der Liste nennt 2–3× im Satz).
9. **Verifikation:**
   - Hero-Rundung bei den drei Auflösungen mit Topbar; per Screenshot belegen.
   - Blockklick scrollt zu `#produkte`.
   - Türen führen zu drei Seiten; `/kettenwachs` zeigt drei gleich hohe Karten (Höhen messen).
   - Marquee-Tempo messen: `transform`-Differenz über 5 s ≈ 90 px.
   - Kartenklick öffnet eBay; bei `reduced-motion` bewegt sich nichts.
   - `dist/kettenwachs/index.html` existiert mit JSON-LD; `dist/sitemap.xml` enthält `/kettenwachs`.

---

## Chat 3 · Seite „Anleitungen & Rechner“ (Welle 2)

Branch `feat/anleitungen-rechner`. Ziel: **eine** Seite `/anleitung`, jede Frage nur einmal, die neuen Werkzeuge von der Wachsseite stehen im Vordergrund.

1. **`ProcessWatch` wiederverwendbar machen**
   - Auslagern nach `src/components/process/ProcessWatch.tsx`, mit Props `chapter?` (Eyebrow optional) und `product?`.
   - Die benötigten `wax.css`-Variablen und Styles über einen eigenen Wrapper bzw. eine eigene CSS-Datei bereitstellen.
   - Die Wachsseite nutzt die neue Datei, Optik dort unverändert (Pixelvergleich).
2. **`ProcessWatch` ergänzen**, damit das Akkordeon und die Karte „Auf einen Blick“ ersetzt werden können:
   - **Dritter Modus „Drei Ketten“** (Rotation): gleicher Zeitplan, Arbeitsschritte ×3 wo nötig. Minuten aus `waxProcessTimeline` ableiten, nicht erfinden. Falls das ohne neue Daten nicht geht: neue, klar kommentierte Felder in `data.ts` und die Frage an Luca melden.
   - **Entfetten-Details** aus der alten Anleitung: Isopropanol **oder Aceton**, „bis die Flüssigkeit klar bleibt“, „kein Lösungsmittelrest ins Wachs“.
   - **Fakten-Zeile:** Nachwachsen unter {guideFacts.rewaxKm}, Entfetten 1× → Link „Wann genau? Intervall-Rechner“.
   - **Links:** „Keine Zeit? Wir wachsen für dich“ mit Preis aus `rewax/content.ts`, „Anleitung mit Fotos“ (Blog).
   - **Eine Quelle für die Minuten:** Die sequentielle Summe aus `guides.tsx` (38/53 min) entfällt überall zugunsten des Parallelmodells (36/43).
   - **HowTo-JSON-LD** (Helmet und Prerender) mit denselben Zeiten statt `PT45M`.
3. **Rechner**
   - **Rotationsregel vereinheitlichen:** neue Funktion `recommendedChains(profile)` in `waxMath.ts`. `WaxCalculator` und alle bisherigen `CostCalculator`-Nutzer rufen sie. Im Kommentar dokumentieren, welche Regel gewonnen hat und warum.
   - **`WaxCalculator` produktneutral nutzbar:** `product` optional; ohne Produkt zeigt er statt Kaufknopf den Link „Wachs wählen“ → `/kettenwachs`.
   - **Registry:** `umstieg` und `ersparnis` rendern `WaxCalculator` (mit `preselectRotation`). `CostCalculator.tsx` und `CostDumbbell`, falls verwaist, löschen.
   - **Deck** (`ToolDeck`): nur noch **vier** Karten: Intervall, Verschleiß, Kettenlänge, Passende Kette. Die Kostenfrage beantwortet `WaxCalculator` direkt über dem Deck. `TOOLS[].inDeck` anpassen; `TOOLS_HUB`-Text („Sechs“) korrigieren.
   - **`ProfileBar`:** `WaxCalculator` schreibt ins geteilte Profil. Über dem Deck steht die ProfileBar deshalb nur als eingeklappte Zusammenfassung („Dein Profil: trocken · Straße · 150 km/Woche · ändern“), keine zweite Eingabemaske.
4. **Seitenaufbau `/anleitung`** (neu gestaltet, Rahmen aus Chat 1)
   1. Kopf: H1 „Anleitungen & Rechner“ (Title/Meta SEO: „Kette wachsen: Anleitung & Rechner“), eine Zeile, **Sprungleiste** „Ablauf · Lohnt es sich? · Rechner“.
   2. `#ablauf`: `ProcessWatch` mit den drei Modi, darunter „Das brauchst du“.
   3. `#lohnt-sich`: `WaxCalculator` (neutral).
   4. `#rechner`: Deck mit vier Karten; unter jeder Karte der Link auf die Einzelseite `/rechner/:slug`.
   5. Kurze Zeile zu „Blog & FAQ“.
   - Alte Anker `#neue-kette`, `#re-waxen`, `#rotation` auf die passenden Modi abbilden (Anker setzt den Modus).
   - **QR-Parameter** `?w=`/`?waxed=` auf dieser Seite auswerten (Logik aus `tools.tsx` übernehmen) und zu `#rechner` scrollen.
5. **Aufräumen**
   - `guides.tsx` und `tools.tsx` löschen, samt verwaister i18n-Keys (`guides.*`, `tools.*`, sofern ungenutzt).
   - `ProcessAndPaths.tsx` ist toter Code; nur melden, nicht löschen.
   - `/rechner` → `<Navigate to="/anleitung#rechner">` plus 301 in `vercel.json`. Hub-Prerender (`renderToolsHub`) entfernen, Sitemap, `llms.txt` und alle internen Links auf `/rechner` umstellen (Liste im Erkundungsbericht: `FaqPage`, `ProductDetailPage`, `RewaxPage`, `rewax/content.ts`, Scripts, 404-Seite).
   - `/rechner/:slug` bleiben bestehen; ihr Rückweg zeigt auf `/anleitung#rechner`.
6. **Widersprüche** nur melden, nicht selbst entscheiden: 80–90 °C gegen 85–90 °C, Nachwachsintervall (<300 / 300–500 / 400–550 km). Bis Luca antwortet, liest die Seite alles aus **einer** Quelle (`guideFacts`).
7. **Verifikation:**
   - Wachsseite optisch unverändert.
   - `/anleitung`: Moduswechsel, Anker `#rotation` öffnet den Rotationsmodus; `WaxCalculator`-Eingaben ändern das Intervall im Deck.
   - `/rechner` → `/anleitung#rechner` (lokal und in `vercel.json`).
   - `/?w=2026-09-01` landet im Intervallrechner.
   - `/rechner/umstieg` zeigt `WaxCalculator`.
   - `dist/anleitung/index.html` mit HowTo.
   - Mobil 375 px ohne Querscrollen.

---

## Chat 4 · Kontakt mit „Über mich“, Blog & FAQ (Welle 2)

Branch `feat/kontakt-blog-faq`.

1. **`/kontakt` neu** (Rahmen aus Chat 1)
   - **`#ueber-mich`:** Foto (`people/luca-stage`), Geschichte aus `about.bio1–4`, zweiter Absatz aufklappbar. Kennzahlen aus `trustStats`; das festverdrahtete `200+` in `UeberUnsPage` entfällt. Link zum eBay-Profil aus `CONTACT`.
   - **`#schreiben`:** zwei große Kanal-Karten (WhatsApp, E-Mail) plus Instagram klein. **Alle Adressen aus `CONTACT`**, keine hartkodierten `wa.me`/`mailto`. Antwortzeiten, Betreiber-/Versandhinweis wie bisher.
   - **Eine Zeile:** „Häufige Fragen? → Blog & FAQ“.
   - **SEO:** Title „Kontakt & über mich“; `ContactPage` + `AboutPage`/`Person` + Breadcrumb (Helmet und Prerender identisch).
   - **Umleitung:** `/ueber-uns` → `<Navigate>` plus 301 auf `/kontakt#ueber-mich`. Sitemap, `llms.txt` und Prerender (`STATIC_PAGES`) anpassen.
   - **Löschen:** `UeberUnsPage.tsx`, `about.tsx`, `contact.tsx`.
2. **„Blog & FAQ“ auf `/blog`**, neues ruhigeres Konzept: eine Aufgabe je Block, weniger Werkzeuge. Aufbau von oben nach unten:
   1. **HubHero mit Suche** bleibt, H1 „Blog & FAQ“. Die Tipp-Animation im Platzhalter entfällt (Bewegung), die Vorschlags-Chips bleiben. **Die Suche findet auch die 22 Seiten-FAQ** (`t.faq.items`): in `generate-search-index.mjs` indexieren; die Antwortkarte springt auf `#fragen-<id>`.
   2. **`#fragen` Häufige Fragen:** Akkordeon, gruppiert nach den Themen aus `product/faqTopics.ts`, Themen-Chips als Filter, anfangs alles zu. Deep-Link öffnet die Frage. FAQPage-JSON-LD hier (Helmet und Prerender).
   3. **„Einstieg“:** `LearningPath` kompakter (eine Zeile, fünf Stationen).
   4. **„Etwas stimmt nicht?“:** statt der großen interaktiven Antriebs-SVG (`SymptomFinder`) sechs Symptom-Chips mit Direktlink. Die SVG-Komponente löschen, falls verwaist (`sprocketPath` in `sketches.tsx` bleibt).
   5. **`#archiv`:** `ArchiveGrid` mit Kategorie-Filter bleibt.
   6. **Raus:** `NumbersStrip` (doppelt zur Startseite) und `FeatureTile` (zweiter Slider, Bewegung). Der Kontakt-Kasten zeigt auf `/kontakt` statt `/#kontakt`.
   - **Umleitung:** `/faq` → `<Navigate>` plus 301 auf `/blog#fragen`. Sitemap, `llms.txt`, Prerender anpassen.
   - **Löschen:** `FaqPage.tsx` und `sections/faq.tsx`. `t.faq.items` bleibt, `ProductFaq` und die Scripts lesen weiter daraus.
3. **Inhalte nur melden, nicht ändern:** FAQ `items[3]` nennt 300–400 W (die Daten sagen 250 W), `items[5]` nennt 85–90 °C.
4. **Verifikation:**
   - `/ueber-uns` → `/kontakt#ueber-mich`, `/faq` → `/blog#fragen`, jeweils lokal und in `vercel.json`.
   - Suche „Aceton“ und „wie heiß“ liefert FAQ-Antwortkarten.
   - Deep-Link `/blog#fragen-…` öffnet die Frage.
   - Keine Autoplay-Bewegung auf `/blog`.
   - `dist/blog/index.html` enthält FAQPage.
   - Keine toten Links (`grep` nach `/faq"`, `/ueber-uns`, `#kontakt`).

---

## Verifikation gesamt (macht der zuletzt fertige Chat aus Welle 2)

- `npx tsc -b --force` und `npm run build` laufen grün.
- `node scripts/assert-xml.mjs` läuft grün, falls im Build nicht enthalten.
- **Browser-Pane, 1440×900 und 375×812, hell und dunkel:** Startseite, `/kettenwachs`, `/ketten`, `/kette-wachsen-lassen`, `/anleitung`, `/blog`, `/wissenschaft`, `/kontakt`.
  - Menüordnung stimmt.
  - Rahmenkante gleich.
  - Keine Konsolenfehler außer dem bekannten „Invalid hook call“ im Dev-Modus.
- **Tote Links:** `grep -rn` über `src scripts public index.html` nach `/rechner"` (Hub), `/faq`, `/ueber-uns`, `#tools`, `#kontakt`, `#faq`, `#herkunft`, `#anleitungen`, `#ueber-mich` (nur noch `/kontakt#ueber-mich`).
- **Nach dem Deploy (Luca):** Sitemap in der Google Search Console neu einreichen.

## Offene Fragen an Luca (blockieren nichts)

- Wachstemperatur: 80–90 °C oder 85–90 °C?
- Nachwachsintervall: welche Spanne gilt?
- Minuten für den Rotationsmodus, falls sie sich nicht aus den Daten ableiten lassen.
