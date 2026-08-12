# Waxcelerate — Performance-, Layout- und UX-Audit

**Datum:** 5. August 2026
**Gemessen gegen:** lokaler Produktions-Build (`npm run build` → `dist/`), ausgeliefert über einen statischen Server auf `localhost:8099`
**Commit-Stand:** Arbeitskopie vom 5.8.2026, unverändert
**Am bestehenden Code wurde nichts geändert.** Alle neuen Dateien liegen ausschließlich in `performance-audit/`.

---

## 0. Executive Summary

Desktop ist in Ordnung. Mobile ist es nicht.

| | Desktop | Mobile |
|---|---|---|
| Performance-Score (Spanne über 5 Seiten) | **92 – 98** | **72 – 79** |
| Largest Contentful Paint | 1,1 – 1,8 s | **5,1 – 10,5 s** |
| Time to Interactive | < 1 s | **5,3 – 10,7 s** |

Der Score-Abstand von rund 20 Punkten kommt nicht daher, dass die Seite „zu schwer" wäre. Sie ist mit 1,0–2,2 MB pro Seite schwerer als nötig, aber nicht katastrophal. Der Abstand kommt daher, dass **die Seite auf jeder einzelnen Route 394 KB Hero-Bilder mit höchster Priorität vorlädt, die auf vier von fünf Routen gar nicht angezeigt werden** — und dem echten LCP-Bild damit auf einer 4G-Leitung rund zwei Sekunden Bandbreite wegnimmt.

Parallel dazu gibt es eine zweite, davon völlig unabhängige Baustelle: **die Typografie skaliert nicht auf Mobile.** Auf der Produktseite messe ich bei 390 px Viewport Fließtext in **7 px, 7,5 px, 8 px, 8,5 px und 9 px**. Kombiniert mit zwei Farb-Tokens, die den WCAG-Kontrast klar verfehlen, ergibt das Text, der auf einem Telefon schlicht nicht lesbar ist. Und die Galerie-Punkte auf der Produktseite sind **7 × 3 Pixel** groß — kein Mensch trifft die zuverlässig.

Beides sind unterschiedliche Problemklassen und brauchen unterschiedliche Lösungen. Die Trennung zieht sich durch den ganzen Bericht.

---

## 1. Messaufbau

### 1.1 Was gemessen wurde

| Seite | Route | Warum |
|---|---|---|
| Startseite | `/` | Haupteinstieg, komplexeste Sektion-Struktur |
| Produktseite | `/produkt/wax-500/` | Kaufentscheidender Flow, Bildergalerie |
| Rewax-Service | `/kette-wachsen-lassen/` | Zweiter Conversion-Flow |
| Wissenschaft | `/wissenschaft/` | SEO-Landingpage, schwerste Grafiklast |
| Blog-Index | `/blog/` | 18 Artikel, bildlastigste Übersicht |

Jede Seite wurde in zwei Geräteklassen gefahren:

- **Mobile** — Lighthouse: 412 × 823, DPR 1,75, 4-fache CPU-Drosselung, gedrosseltes 4G (1,6 Mbit/s, 150 ms RTT). Layout-Checks: 390 × 844, DPR 3, Touch aktiv, iPhone-User-Agent.
- **Desktop** — 1350 × 940 (Lighthouse-Preset) bzw. 1440 × 900 (Layout-Checks), keine Drosselung.

### 1.2 Eingesetzte Werkzeuge

| Werkzeug | Status | Ergebnis liegt in |
|---|---|---|
| **Lighthouse CI** (`@lhci/cli` 0.15 / lighthouse 13) | ✅ gelaufen, 5 Seiten × 2 Profile | `lighthouse/mobile/`, `lighthouse/desktop/` |
| **webhint** 7 (Connector `local`) | ✅ gelaufen, 5 Seiten | `webhint/` |
| **sitespeed.io** | ❌ nicht lauffähig — siehe unten | Config in `config/sitespeed.json` |
| **Playwright + axe-core** (Ersatz für sitespeed) | ✅ gelaufen, 5 Seiten × 2 Profile | `raw/layout-audit.json`, `screenshots/` |

### 1.3 Was nicht funktioniert hat, und warum

**sitespeed.io ließ sich in der Audit-Umgebung nicht betreiben.** Beim Installieren lädt es einen Chromedriver von `storage.googleapis.com` und einen Edgedriver von `msedgedriver.microsoft.com` nach. In der Sandbox ist ausschließlich die npm-Registry erreichbar; beide Downloads liefern HTTP 403 vom Proxy. Ein Docker-Fallback stand ebenfalls nicht zur Verfügung.

Statt das Ergebnis zu beschönigen, habe ich den Teil, den sitespeed.io beigetragen hätte — Netzwerk-Wasserfall, Transfergrößen nach Typ, Third-Party-Requests, Screenshots je Geräteklasse — mit einem eigenen Playwright-Harness erhoben (`config/layout-audit.mjs`). Die fertige sitespeed-Konfiguration inklusive Performance-Budget liegt trotzdem in `config/sitespeed.json` und läuft auf deinem Rechner sofort:

```bash
npx sitespeed.io --config performance-audit/config/sitespeed.json \
  http://localhost:8099/ http://localhost:8099/produkt/wax-500/
```

**webhint konnte nur die statische Markup-Ebene prüfen.** Der `puppeteer`-Connector hätte denselben Chromedriver gebraucht; der `jsdom`-Connector blieb bei dieser React-Seite hängen und scheiterte zusätzlich an fehlendem Canvas-Support (das native `canvas`-npm-Paket lässt sich ohne Netzzugang nicht bauen). Mit dem `local`-Connector gegen die vorgerenderten HTML-Dateien lief er sauber durch: **0 Fehler, 0 Warnungen** außer der Meldung, dass der W3C-Validator nicht erreichbar war. Das vorgerenderte Markup ist strukturell in Ordnung.

Die Accessibility-Regeln, die webhint über Puppeteer beigesteuert hätte, habe ich stattdessen mit **axe-core direkt im echten Chromium** gefahren — im Ergebnis genauer, weil dort echte Layout- und Farbwerte vorliegen statt jsdom-Approximationen.

### 1.4 Zwei Messartefakte, die keine echten Probleme sind

Damit du sie im Lighthouse-Report nicht fälschlich für Befunde hältst:

1. **`cache-insight` schlägt auf allen Seiten fehl.** Der lokale Testserver setzt keine `Cache-Control`-Header. In `vercel.json` sind sie korrekt konfiguriert (`/assets/*` → `max-age=31536000, immutable`, `/images/*` → `max-age=86400`). **Kein echtes Problem.**
2. **`/api/stock` liefert lokal 404.** Das ist eine Vercel-Serverless-Funktion (`api/stock.ts`), die es im Produktionsbetrieb gibt. Der Konsolenfehler ist ein Artefakt des statischen Servers. Der *Aufrufzeitpunkt* ist allerdings sehr wohl ein Befund — siehe Problem 10.

---

## 2. Scores

### 2.1 Mobile (gedrosseltes 4G, 4× CPU)

| Seite | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Startseite | **77** | **88** | 96 | 100 |
| Produkt `wax-500` | **72** | **82** | 96 | 100 |
| Rewax | **79** | 95 | 96 | 100 |
| Wissenschaft | **77** | 95 | 96 | 100 |
| Blog-Index | **73** | 96 | 96 | 100 |

### 2.2 Desktop

| Seite | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Startseite | 98 | **87** | 96 | 100 |
| Produkt `wax-500` | 92 | **88** | 96 | 100 |
| Rewax | 98 | 90 | 96 | 100 |
| Wissenschaft | 98 | 92 | 96 | 100 |
| Blog-Index | 96 | 91 | 96 | 100 |

### 2.3 Kernmetriken im Direktvergleich

| Seite | LCP mobil | LCP desktop | Faktor | TTI mobil | TBT mobil | CLS |
|---|---|---|---|---|---|---|
| Startseite | 5,2 s | 1,2 s | 4,3× | 6,3 s | 130 ms | 0,001 |
| Produkt | **10,5 s** | 1,8 s | **5,8×** | **10,7 s** | 120 ms | 0 |
| Rewax | 5,1 s | 1,1 s | 4,6× | 5,3 s | 20 ms | 0 |
| Wissenschaft | 5,6 s | 1,1 s | 5,1× | 5,8 s | 100 ms | 0 |
| Blog | 7,4 s | 1,4 s | 5,3× | 7,7 s | 100 ms | 0 |

Zwei Dinge fallen hier auf, und beide sind gute Nachrichten für die Priorisierung:

**CLS ist praktisch null.** Layout-Sprünge gibt es nicht. Das ist bei einer bildlastigen Seite bemerkenswert und heißt: die Bildcontainer haben feste Seitenverhältnisse. Das muss niemand anfassen.

**TBT ist mit 20–130 ms unauffällig.** JavaScript-Ausführung ist nicht der Flaschenhals. Das Problem ist reine Ladezeit, kein Rechenaufwand — und Ladezeit ist deutlich billiger zu reparieren als eine Bundle-Architektur.

---

## 3. Die zehn größten Probleme, nach Wirkung sortiert

Jedes Problem ist als **[PERF]** (reine Performance), **[LAYOUT]** (Layout/Design/Lesbarkeit) oder **[A11Y]** (Barrierefreiheit) klassifiziert, mit Kritikalität hoch / mittel / niedrig.

---

### 1. Hero-Bilder werden auf jeder Route vorgeladen — auch wo sie nicht existieren
**[PERF] · Kritikalität: HOCH · Betrifft: alle Seiten, mobil massiv**

`index.html` enthält:

```html
<link rel="preload" as="image" href="/images/hero/chain-bg.jpg" type="image/jpeg" />
<link rel="preload" as="image" href="/images/hero/wax-cutout.webp" type="image/webp" />
```

Diese beiden Zeilen stehen in **jeder** vorgerenderten Datei — geprüft in `dist/index.html`, `dist/blog/index.html`, `dist/wissenschaft/index.html`, `dist/produkt/wax-500/index.html` und `dist/kette-wachsen-lassen/index.html`. Die Prerender-Skripte kopieren den `<head>` unverändert.

Das sind **262,4 KB + 131,8 KB = 394,2 KB**, die der Browser mit `preload`-Priorität — also vor fast allem anderen — herunterlädt. Auf `/blog`, `/wissenschaft` und `/produkt/*` wird keines der beiden Bilder jemals angezeigt.

**Warum das ein Problem ist:** Auf der gedrosselten 4G-Verbindung (1,6 Mbit/s ≈ 200 KB/s) sind 394 KB rund **zwei Sekunden Leitung**, die dem tatsächlichen LCP-Element weggenommen werden. Auf `/blog` ist das LCP-Element `hero-chain-texture.jpg`; es muss warten, bis zwei Bilder fertig geladen sind, die niemand sieht. Genau das erklärt den LCP von 7,4 s.

Belege: `lighthouse/mobile/blog.json` → `total-byte-weight`, `raw/layout-audit.json` → `network.heaviest`.

---

### 2. Das LCP-Bild der Produktseite steht nicht im ausgelieferten HTML
**[PERF] · Kritikalität: HOCH · Betrifft: `/produkt/*` — zwölf Seiten**

Lighthouse-Audit `lcp-discovery-insight` auf `/produkt/wax-500/`:

```
PASS  fetchpriority=high applied
FAIL  Request is discoverable in initial document
PASS  LCP resources should not use loading=lazy
```

Das LCP-Element ist das erste Galeriebild (`classic-1-lg.webp`). Es trägt zwar korrekt `fetchpriority="high"` und `loading="eager"` — aber diese Attribute nützen nichts, solange das `<img>`-Tag erst existiert, nachdem React hydriert hat. Der Preload-Scanner des Browsers, der das HTML liest, *bevor* JavaScript läuft, sieht das Bild nicht.

Die Kette ist damit: HTML laden → CSS laden → 494 KB JS laden → JS parsen und ausführen → React hydriert → `<img>` erscheint im DOM → *jetzt erst* startet der Bilddownload. Auf 4G ergibt das **LCP 10,5 s und TTI 10,7 s** — der mit Abstand schlechteste Wert im ganzen Audit, und ausgerechnet auf der Seite, auf der gekauft wird.

Auf der Startseite ist der Zustand halb so schlimm (`FAIL fetchpriority=high should be applied to the image preload request`, aber `PASS Request is discoverable`) — daher dort 5,2 s statt 10,5 s. Auf `/blog` schlagen beide Kriterien fehl.

---

### 3. Schriftgrößen skalieren nicht auf Mobile — bis hinunter zu 7 px
**[LAYOUT] · Kritikalität: HOCH · Betrifft: Produktseite und Wissenschaft am stärksten**

Bei 390 px Viewport, in echtem Chromium gemessen (`raw/layout-audit.json` → `layout.tinyText`):

| Seite | Verteilung der Schriftgrößen unter 12 px |
|---|---|
| Produkt `wax-500` | **7 px (1×), 7,5 px (1×), 8 px (3×), 8,5 px (2×), 9 px (7×), 9,5 px (1×), 10 px (8×), 11 px (2×)** |
| Wissenschaft | 9 px (5×), 9,5 px (1×), 10 px (7×), 10,5 px (2×), 11 px (10×) |
| Startseite | 11 px (25×) |
| Rewax | 11 px (9×), 11,5 px (1×) |
| Blog | 10 px (5×), 11 px (3×) |

Konkrete Fälle von der Produktseite:

- `span.text-[7px]` mit Inhalt „Kette"
- `p.text-[7.5px].uppercase.tracking-[0.18em]` mit „Trocken", Farbe `rgba(0,0,0,0.28)`
- `span.text-[8px].uppercase.tracking-[0.25em]` mit „Mehr erfahren", Farbe `rgba(255,255,255,0.5)`

**Warum das ein Problem ist:** Diese Werte stammen aus Tailwind-Arbitrary-Values (`text-[7px]`, `text-[8px]`, …). Arbitrary Values haben **keinen Breakpoint** — sie sind auf einem 27-Zoll-Monitor exakt so groß wie auf einem iPhone SE. Auf dem Desktop wirkt 8 px in Großbuchstaben mit weitem `letter-spacing` wie ein feines Detail-Label. Auf einem Telefon in der Sonne ist es unlesbar. Die Messung bestätigt das: Auf Desktop finde ich dieselben 25 Klassen unter 12 px — die Werte sind identisch, nur der Betrachtungsabstand ist ein anderer.

Verschärfend: `letter-spacing: 0.18em` bis `0.25em` auf 7–8 px großen Versalien. Weites Sperren ist bei Mikrotypografie eine gute Idee, solange die Grundgröße stimmt — hier zerreißt es die Wortbilder zusätzlich.

Das ist ausdrücklich **kein Performance-Problem.** Es kostet keine Millisekunde. Es kostet Conversions.

#### 3b. Fließtext ist in Rastergrafiken eingebrannt
**[LAYOUT] · Kritikalität: HOCH · Betrifft: `/wissenschaft`**

Ein Sonderfall desselben Problems, der noch schwerer wiegt, weil er sich nicht über CSS lösen lässt.

`images/science/cassette-wear-full.webp` ist 1254 × 1254 px groß und wird auf Mobile auf rund 358 px Breite skaliert — Faktor 0,285. In die Grafik sind Überschrift und ein sechszeiliger Erklärtext eingebrannt: „**Verschleißprinzip** — Durch die Reibung der Kette nutzt sich die Zahnflanke an der Kassettenspeiche ab. Die Speiche wird dünner, die Kette greift schlechter und verschleißt schneller." Dazu die Beschriftungen „Neue Kassette" und „Abgenutzte Kassette".

Nachgemessen am Screenshot bei DPR 3 rendert dieser Text mit **etwa 6 CSS-Pixeln**. Ich habe den Ausschnitt sechsfach vergrößern müssen, um ihn selbst lesen zu können (`screenshots/_klein/ZOOM-wissenschaft-diagramm-text.jpg`).

**Warum das schlimmer ist als Problem 3:** Eingebrannter Text hat keinen einzigen der Vorteile von echtem Text. Er

- skaliert nicht mit der Systemschriftgröße, die sehbehinderte Nutzer eingestellt haben,
- lässt sich nicht markieren, kopieren oder übersetzen,
- ist für Screenreader unsichtbar (das `alt`-Attribut ersetzt keine sechs Zeilen Fachtext),
- wird von Google nicht indexiert — auf einer Seite, die ausdrücklich als SEO-Landingpage gebaut ist,
- und wird beim Zoomen unscharf statt schärfer.

Der saubere Weg wäre, die Grafik auf das rein Bildliche zu reduzieren und die Beschriftungen als HTML daneben oder darüber zu legen. Das löst gleichzeitig Problem 7 mit: die Datei ist 248,6 KB schwer, größtenteils wegen der scharfen Textkanten, die sich schlecht komprimieren lassen.

---

### 4. Zwei Farb-Tokens verfehlen den Kontrastgrenzwert — in beiden Themes
**[A11Y] · Kritikalität: HOCH · Betrifft: alle Seiten**

Ich habe die Tokens aus `src/index.css` gegen alle drei Flächenfarben durchgerechnet (WCAG 2.1, Normaltext braucht 4,5 : 1):

**Light Mode (Standard):**

| Token | Wert | auf `--pg` | auf `--sf` | auf `--sf2` | Bewertung |
|---|---|---|---|---|---|
| `--tx1` | `#101013` | 17,58 | 19,00 | 16,82 | OK |
| `--tx2` | `#44444A` | 8,95 | 9,67 | 8,56 | OK |
| `--txm` | `#6B6B72` | 4,89 | 5,29 | 4,68 | OK |
| `--txf` | `#8A8A92` | **3,17** | **3,43** | **3,03** | nur Großtext |
| `--txff` | `#A8A8B0` | **2,19** | **2,36** | **2,09** | **durchgefallen** |

**Noir (Dark Mode):**

| Token | Wert | auf `--pg` | auf `--sf` | auf `--sf2` | Bewertung |
|---|---|---|---|---|---|
| `--tx2` | `#A1A1AA` | 7,76 | 7,36 | 6,63 | OK |
| `--txm` | `#71717A` | **4,12** | **3,90** | **3,52** | nur Großtext |
| `--txf` | `#72727E` | **4,19** | **3,97** | **3,58** | nur Großtext |
| `--txff` | `#5A5A66` | **2,93** | **2,77** | **2,50** | **durchgefallen** |

Zwei Anmerkungen dazu:

Erstens: Der Kommentar in `src/index.css:267` behauptet für `--txm` im Dark Mode „4.6:1 contrast". Nachgerechnet sind es **3,52 – 4,12 : 1**. Der Kommentar ist falsch und hat vermutlich dazu geführt, dass das Token für Fließtext freigegeben wurde.

Zweitens — und das ist der eigentliche Punkt: **Problem 3 und Problem 4 potenzieren sich.** `--txff` bei 2,09 : 1 wäre bei 16 px unschön. Bei 7,5 px, gesperrt, in Versalien, auf einem Telefon ist es faktisch unsichtbar. axe-core meldet entsprechend **41 Verstöße auf der Produktseite, 38 auf dem Blog, 35 auf der Startseite** — durchweg Severity `serious`.

---

### 5. Touch-Ziele weit unter dem Minimum — Galerie-Punkte sind 7 × 3 px
**[LAYOUT + A11Y] · Kritikalität: HOCH · Betrifft: Produktseite, Startseite, Wissenschaft**

Gemessen bei 390 px mit aktivem Touch (`raw/layout-audit.json` → `layout.smallTouchTargets`). WCAG 2.5.8 fordert 24 × 24 px, Apples HIG und Materials Guidelines fordern 44 × 44 px:

| Seite | Element | Gemessene Größe |
|---|---|---|
| Produkt | Galerie-Punkte „Image 2–6" | **7 × 3 px** |
| Produkt | Galerie-Punkt „Image 1" (aktiv) | **22 × 3 px** |
| Startseite | Kalkulator-Punkte „Vorrat", „Rotation" | **6 × 6 px** |
| Startseite | Kalkulator-Punkt „Intervall" | **20 × 6 px** |
| Wissenschaft | Schritt-Punkte 1–6 | **9 × 10 px** |
| Wissenschaft | Slider `#wx-teeth`, `#wx-rpm` | **320 × 1 px** |
| alle | Menü öffnen / schließen | 36 × 36 px |
| alle | Footer-Links „FAQ", „AGB", „eBay" | 24 × 16 / 27 × 16 / 32 × 16 px |

Insgesamt: **41 zu kleine Touch-Ziele auf der Startseite, 34 auf Wissenschaft, 30 auf der Produktseite.**

**Warum das ein Problem ist:** Der durchschnittliche Fingerkuppen-Kontaktbereich liegt bei etwa 45 × 45 px. Ein 7 × 3 px großes Ziel ist damit rund **hundertmal kleiner** als das Werkzeug, mit dem es getroffen werden soll. Auf der Produktseite bedeutet das: Wer sich Bild 4 der Galerie ansehen will, muss wischen — der Punkt ist als Bedienelement praktisch nicht vorhanden. Das ist ausgerechnet auf der Seite, auf der die Kaufentscheidung fällt.

Die Slider mit 320 × 1 px sind ein Sonderfall: der sichtbare Thumb ist größer, aber das `<input>` selbst hat 1 px Höhe. Ob das in der Praxis trifft, hängt am Browser.

Ein Hinweis zur Fairness: 36 × 36 px für den Menü-Button und 24 × 16 px für Footer-Links sind unschön, aber unkritisch — sie stehen isoliert, und Browser vergrößern die Trefferfläche kleiner Links etwas. Die Punkt-Navigationen sind die echten Ausfälle.

---

### 6. 183 MB tote Bilddateien werden mit ausgeliefert
**[PERF] · Kritikalität: MITTEL · Betrifft: Deploy und Build, nicht die Ladezeit der Besucher**

`public/images/` enthält **193,6 MB**. Ich habe alle Bildreferenzen aus `dist/` extrahiert — HTML, JS, CSS, XML, `llms.txt` — und gegen den tatsächlichen Dateibestand abgeglichen:

| | Umfang |
|---|---|
| Gesamt | 193,6 MB |
| Tatsächlich referenziert | **10,8 MB** |
| Nie referenziert | **182,8 MB in 107 Dateien** |

Die größten toten Ordner:

| Ordner | Gewicht | Dateien |
|---|---|---|
| `/images/blog` (Originale neben den `-800`/`-1600`-WebP-Varianten) | 90,1 MB | 36 |
| `/images/Customer Review images` | 45,7 MB | 19 |
| `/images/1 New Hero` | 30,9 MB | 6 |
| `/images/2. Messbar besser.` | 10,2 MB | 5 |
| `/images/hero-alt` | 0,9 MB | 12 |

Einzelne Dateien: `wax-blue-wire-chain.jpg` 7,41 MB, `IMG_2445 2 16.58.15.jpeg` 7,28 MB (doppelt vorhanden, in `blog/` und in `Customer Review images/`), `2 Chain.JPG` 6,59 MB.

**Warum das ein Problem ist — und warum nur mittel:** Vite kopiert `public/` unverändert nach `dist/`. Kein Besucher lädt diese Dateien; die Ladezeit leidet nicht. Betroffen sind Build-Dauer, Deploy-Größe (Vercel hat Limits) und Repo-Handhabung. Die Ordnernamen mit Leerzeichen und Punkten (`Customer Review images`, `2. Messbar besser.`) verraten außerdem, dass hier ein Arbeitsarchiv im Auslieferungsverzeichnis gelandet ist. Zusätzlich liegt `wax-cutout.png` mit 1,20 MB neben dem 132 KB großen WebP im Build — ein Fallback, den kein aktueller Browser mehr braucht.

---

### 7. Bilder werden in einem Vielfachen ihrer Anzeigegröße ausgeliefert
**[PERF] · Kritikalität: MITTEL · Betrifft: Produktseite, Blog, Wissenschaft**

Nachgemessene Dateien:

| Datei | Auflösung | Größe | Angezeigt auf Mobile bei ca. |
|---|---|---|---|
| `products/classic/classic-3-lg.webp` | 2000 × 2000 | 202,2 KB | 358 px |
| `products/classic/classic-6-lg.webp` | 2000 × 2000 | 189,7 KB | 358 px |
| `hero-chain-texture.jpg` | 2000 × 1333 | 212,0 KB | 390 px |
| `science/cassette-wear-full.webp` | 1254 × 1254 | 248,6 KB | 358 px |
| `wax-block-spin.jpg` | 946 × 1418 | 199,9 KB | 390 px |
| `logo.jpg` | **998 × 998** | **117,7 KB** | **als Favicon: 32 px** |

`logo.jpg` ist der auffälligste Fall: eine 998 × 998 Pixel große JPEG-Datei, eingebunden als `<link rel="icon">` *und* als `apple-touch-icon`. Sie wird auf jeder Seite geladen, in jeder Messung, und in 99 % der Fälle auf 32 × 32 skaliert. Ein Favicon dieser Größe gehört in ein `.ico` oder ein 180 px PNG unter 10 KB.

Lighthouse beziffert das Einsparpotenzial über `image-delivery-insight` mit **191,5 KB allein für `classic-3-lg.webp`** und **175,3 KB für `hero-chain-texture.jpg`** auf der Mobile-Emulation.

Positiv anzumerken: für Blog-Bilder existiert bereits ein sauberes `srcset` mit `-800w`/`-1600w`-Varianten, und es greift auch — auf Mobile lädt der Blog 1.432 KB Bilder, auf Desktop 2.832 KB. Das Muster ist also vorhanden, es ist nur auf Produktbilder, Hero und Wissenschaft nicht übertragen worden.

---

### 8. Der Haupt-Chunk ist 494 KB groß, davon ~73 KB ungenutzt
**[PERF] · Kritikalität: MITTEL · Betrifft: alle Seiten**

Build-Ausgabe:

```
dist/assets/index-Deuh9p2W.js   493,75 kB │ gzip: 158,42 kB
dist/assets/articles-DH6VCRG9.js  95,63 kB │ gzip:  30,94 kB
dist/assets/gsap-DDlvirwQ.js      69,89 kB │ gzip:  27,48 kB
dist/assets/index-BjUpsCUo.css    69,87 kB │ gzip:  13,69 kB
dist/assets/vendor-fwxo-lE_.js    48,77 kB │ gzip:  17,32 kB
```

Initial pro Seitenaufruf: rund **612 KB roh / 216 KB gzip** an JS und CSS. Lighthouse meldet ungenutztes JavaScript von **48,3 KB auf der Startseite, 72,7 KB auf der Produktseite und 73,8 KB auf dem Blog** — jeweils aus `index-*.js`. Route-Splitting existiert bereits und funktioniert (alle Unterseiten sind eigene Chunks), aber der Einstiegs-Chunk trägt Code für alle Sektionen der Startseite mit, egal welche Route gerade offen ist.

`gsap` mit 69,89 KB wird per `modulepreload` auf **jeder** Route geladen. Genutzt wird es hauptsächlich für die ScrollTrigger-Animationen in `why-wax.tsx` — eine Sektion, die auf `/impressum`, `/blog` oder `/agb` nie gerendert wird.

**Warum nur mittel:** Der Total Blocking Time liegt bei 20–130 ms. Das JS bremst also nicht durch Ausführung, sondern nur durch Downloadzeit — und die ist auf 4G gegenüber den 394 KB überflüssiger Hero-Bilder aus Problem 1 der kleinere Posten.

---

### 9. Zwei Seiten haben echten horizontalen Überlauf
**[LAYOUT] · Kritikalität: NIEDRIG bis MITTEL · Betrifft: Startseite (2 px), Wissenschaft (4 px)**

Bei 390 px Viewport, mit einem Detektor, der Elemente ignoriert, die von einem Vorfahren mit `overflow-x: hidden|auto|scroll|clip` abgeschnitten werden (`config/overflow-trace.mjs`):

| Seite | `documentElement.scrollWidth` | Viewport | Echter Überlauf |
|---|---|---|---|
| Startseite | 392 px | 390 px | **2 px** |
| Wissenschaft | 394 px | 390 px | **4 px** |
| Produkt, Rewax, Blog | 390 px | 390 px | 0 px |

Verursacher:

- **Startseite:** `div.rounded-xl.overflow-hidden` mit `left: -2px, width: 394px`, Inhalt „Neue Kette erstmalig wachsen — Fabrikfett blockiert d…". Zusätzlich `div.w-full.px-4.sm:px-6.lg:px-8.xl:px-12` (der Header-Container) mit 392 px Breite und `button.w-full.py-4` („Jetzt bestellen →") mit 392 px.
- **Wissenschaft:** `div.relative.w-full.rounded-2xl.overflow-hidden` mit `left: -4px, width: 398px`, Inhalt „Das System / Paraffin 58–60 °C / FT-Wachs +75 °C / Mikrokris…".

Das Muster ist beide Male dasselbe: ein Element mit `w-full` bekommt zusätzlich einen negativen horizontalen Versatz (vermutlich `-mx-`), wodurch es breiter wird als sein Container.

**Warum das ein Problem ist:** 2–4 px erzeugen keine sichtbare Verschiebung, aber sie machen das Dokument breiter als den Viewport. Auf iOS Safari führt das zu Gummiband-Effekten beim seitlichen Wischen und dazu, dass vertikale Scrollgesten gelegentlich als horizontale interpretiert werden. Es fühlt sich „wacklig" an, ohne dass man den Grund sieht.

**Wichtig — was hier *kein* Problem ist:** Mein erster, naiver Durchlauf meldete auf der Startseite ein Element mit 2.236 px Überlauf (die Bewertungs-Kacheln) und auf der Produktseite 370 px (die Ketten-Karten). Beides sind bewusst horizontal scrollbare Rails in einem `overflow-x`-Container und völlig korrekt. Ebenso das geschlossene Off-Canvas-Menü, das per Definition rechts außerhalb liegt. Diese drei Falschmeldungen habe ich mit dem präziseren Detektor aussortiert — sie stehen hier nur, damit du sie nicht später in den Rohdaten findest und dich erschreckst.

---

### 10. Kleinere Befunde
**Kritikalität: NIEDRIG**

**a) `/api/stock` wird auf jeder Route aufgerufen. [PERF]**
`src/App.tsx:57` ruft `fetchStock()` in einem `useEffect` ohne Bedingung auf. Das erzeugt eine Netzwerk-Anfrage auf `/impressum`, `/agb`, `/datenschutz`, `/blog` — überall dort, wo es keinen Lagerbestand anzuzeigen gibt. Eine Anfrage ist wenig, aber es ist eine Anfrage, die auf einer statischen Rechtstextseite eine Serverless-Funktion aufweckt.

**b) `aria-label` auf `<span>` und `<div>` ohne Rolle. [A11Y] — 15 Fälle auf der Startseite**
`<span aria-label="Messbar besser.">`, `<span aria-label="Produkte">`, sechsmal `<div class="flex items-center gap-0.5" aria-label="5 / 5">`. `aria-label` ist auf generischen Elementen ohne `role` unzulässig; Screenreader ignorieren es. Bei den Sterne-Bewertungen geht die Information „5 von 5" damit komplett verloren. Fix: `role="img"` ergänzen.

**c) Die Radix-Slider haben keinen zugänglichen Namen. [A11Y] — 2 Fälle auf der Startseite**
`<span role="slider" aria-valuemin="20" aria-valuemax="400" tabindex="0">` ohne `aria-label`. Ein Screenreader-Nutzer hört „Schieberegler, 250" ohne zu erfahren, was eingestellt wird.

**d) Fokussierbarer Inhalt in einem `aria-hidden`-Container. [A11Y] — Produktseite**
Die eingefahrene Sticky-Kaufleiste (`div.fixed.bottom-0.inset-x-0.z-50.translate-y-full` mit `aria-hidden="true"`) enthält einen eBay-Link, der weiter per Tab erreichbar ist. Tastaturnutzer landen auf einem unsichtbaren Link.

**e) Ein Link ist nur farblich unterscheidbar. [A11Y] — Produktseite**
Der Link auf `/produkt/wax-500-mos2` im Fließtext hat 2,47 : 1 Kontrast zum umgebenden Text (nötig sind 3 : 1) und keine Unterstreichung im Ruhezustand — `hover:underline` greift auf Touch-Geräten nie.

**f) Scrollbare Region ohne Tastaturzugang. [A11Y] — Startseite**
Die Bewertungs-Rail ist mit der Maus wischbar, aber nicht per Tab erreichbar.

**g) Der `landmark-one-main`-Verstoß auf drei Seiten. [A11Y]**
`/produkt/*`, `/wissenschaft` und `/kette-wachsen-lassen` haben kein `<main>`-Element. Screenreader-Nutzer können nicht zum Hauptinhalt springen.

**h) Fixierte Elemente belegen 15 % des mobilen Viewports. [LAYOUT]**
Auf der Startseite: `header` 80 px + Bottom-Bar 52 px = 132 px von 844 px. Auf der Produktseite: 57 px + 61 px Sticky-Kaufleiste = 118 px. Das ist im üblichen Rahmen und eher ein Hinweis als ein Befund — aber in Kombination mit 7 px Text bleibt vom nutzbaren Bildschirm wenig übrig.

---

## 4. Trennung: Performance versus Layout/Design

Die Frage aus dem Auftrag, sauber getrennt:

### Reine Performance-Probleme
*Symptom: Nutzer sieht dasselbe, nur später. Messbar in Sekunden.*

| # | Problem | Kritikalität |
|---|---|---|
| 1 | Hero-Preload auf allen Routen (394 KB) | hoch |
| 2 | LCP-Bild der Produktseite erst nach Hydration im DOM | hoch |
| 7 | Bilder in Vielfachem der Anzeigegröße (`logo.jpg` 998 px als Favicon) | mittel |
| 8 | 494 KB Haupt-Chunk, ~73 KB ungenutzt, GSAP überall | mittel |
| 6 | 183 MB tote Assets im Deploy (kein Nutzer-Impact) | mittel |
| 10a | `/api/stock` auf jeder Route | niedrig |

### Layout-, Design- und Lesbarkeitsprobleme
*Symptom: Nutzer sieht es sofort, aber es ist schlecht bedienbar. Kostet keine Millisekunde.*

| # | Problem | Kritikalität |
|---|---|---|
| 3 | Schrift bis 7 px, keine Breakpoints auf Arbitrary Values | hoch |
| 3b | Fließtext in Rastergrafik eingebrannt, rendert bei ~6 px (`/wissenschaft`) | hoch |
| 5 | Touch-Ziele bis hinunter zu 7 × 3 px | hoch |
| 4 | `--txf` / `--txff` unter WCAG-Kontrast, beide Themes | hoch |
| 9 | 2–4 px horizontaler Überlauf auf zwei Seiten | niedrig–mittel |
| 10h | 15 % Viewport von fixierten Elementen belegt | niedrig |

### Barrierefreiheit im engeren Sinn
| # | Problem | Kritikalität |
|---|---|---|
| 10b–g | ARIA-Fehler, fehlende Landmarks, Tastaturfallen | niedrig–mittel |

**Der wichtigste Satz dieses Abschnitts:** Die beiden Blöcke sind unabhängig voneinander. Wenn du morgen alle Performance-Probleme löst, steht die Seite bei Lighthouse Mobile bei ~95 — und der Text auf der Produktseite ist immer noch 7 px groß. Umgekehrt genauso. Es sind zwei getrennte Arbeitspakete, und sie brauchen unterschiedliche Leute und unterschiedliche Reviews.

---

## 5. Was gut ist

Damit das Bild nicht schief hängt — es gibt eine ganze Reihe Dinge, die hier bereits sehr sauber gelöst sind:

- **CLS bei 0,000–0,003.** Auf einer bildlastigen Seite ist das eine Leistung. Die Bildcontainer haben durchgängig feste Seitenverhältnisse.
- **SEO-Score 100 auf allen fünf Seiten, in beiden Geräteklassen.** Canonical, Open Graph, Twitter Cards, drei JSON-LD-Blöcke (Organization, Product mit AggregateRating, FAQPage), Geo-Meta für Stuttgart, generierte Sitemap mit 35 URLs, `llms.txt`. Das ist überdurchschnittlich gründlich.
- **Self-hosted Fonts statt Google Fonts.** Spart einen render-blockierenden Third-Party-Roundtrip und ist für ein deutsches Publikum die DSGVO-seitig richtige Entscheidung. Der Kommentar im `<head>`, der genau das begründet, ist vorbildlich.
- **Prerendering funktioniert.** 19 Blogseiten, 12 Produktseiten, 6 Rechtstextseiten liegen als echtes HTML in `dist/`. Der FCP von 2,1 s auf Mobile kommt genau daher.
- **Route-Splitting ist konsequent umgesetzt.** Jede Unterseite ist ein eigener Lazy-Chunk.
- **`srcset` mit `-800w`/`-1600w` für Blog-Bilder** — das Muster ist da und funktioniert nachweislich (1.432 KB mobil gegen 2.832 KB desktop).
- **Total Blocking Time 20–130 ms.** Kein JavaScript-Ausführungsproblem.
- **Sicherheits-Header in `vercel.json`** sind vollständig gesetzt, `noindex` auf `/admin`, `/hero-lab` und `/produkt/:id/stage`.
- **webhint findet null strukturelle Markup-Fehler** in den vorgerenderten Seiten.
- **Die Kommentare im Code** — insbesondere die Begründung für `base: '/'` in `vite.config.ts` und die Font-Entscheidung — dokumentieren *warum* etwas so ist, nicht *was* dasteht. Das ist selten.

---

## 6. Der eine größte Hebel

**Wenn nur eine Sache gemacht wird: Repariere die LCP-Bildauslieferung.**

Konkret sind das drei zusammengehörige Handgriffe:

1. **Den globalen Hero-Preload aus dem geteilten `<head>` nehmen** und stattdessen pro Route das jeweils richtige LCP-Bild vorladen. Auf `/` bleibt es `chain-bg.jpg`; auf `/blog` wäre es `hero-chain-texture.jpg`; auf `/produkt/:id` das erste Galeriebild. Die Prerender-Skripte in `scripts/` wissen bereits, welche Seite sie gerade bauen — die Information ist vorhanden, sie wird nur nicht genutzt.
2. **`fetchpriority="high"` an den Preload-Tag** hängen, nicht nur ans `<img>`. Lighthouse bemängelt exakt das auf der Startseite.
3. **Das erste Galeriebild der Produktseite ins vorgerenderte HTML schreiben**, damit der Preload-Scanner es findet, bevor React lädt.

**Warum genau das:** Es adressiert Problem 1 und Problem 2 in einem Zug — die beiden einzigen Befunde mit Kritikalität „hoch" auf der Performance-Seite. Nach meiner Rechnung entfallen damit 394 KB Vorabladung auf vier von fünf Routen, und die Produktseite verliert die vollständige Abhängigkeitskette *HTML → CSS → 494 KB JS → Hydration → Bild*. Der LCP der Produktseite von 10,5 s sollte in die Größenordnung des Rewax-Werts (5,1 s) fallen, plausibel eher darunter, weil dort dann auch kein Fremd-Hero mehr geladen wird.

Der Aufwand ist gering: Es sind Änderungen an den drei Generator-Skripten und an `index.html`, nicht an Komponenten. Kein Refactoring, kein Risiko für die Darstellung.

**Und wenn du zwei Sachen machst:** Nimm als zweites die Typografie. Ersetze die Arbitrary Values unter 12 px durch die semantische Skala, die in `tailwind.config.js` bereits definiert ist (`eyebrow` 11 px, `meta` 12 px, `small` 13 px, `body` 15 px, `lead` 17 px) und gib ihnen Mobile-Breakpoints. Der Kommentar im Config sagt sogar ausdrücklich „migrate ad-hoc `text-[Npx]` to these" — die Absicht war da, die Migration ist nur nie zu Ende geführt worden. Das ist die Änderung, die auf einem Telefon am unmittelbarsten sichtbar wird, und sie kostet keine einzige Millisekunde Ladezeit.

---

## 7. Verzeichnis der Rohdaten

```
performance-audit/
├── AUDIT_REPORT.md              ← dieses Dokument
├── run-audit.sh                 ← kompletter Lauf, reproduzierbar
├── config/
│   ├── lighthouserc.mobile.cjs  ← Lighthouse CI, Mobile-Profil
│   ├── lighthouserc.desktop.cjs ← Lighthouse CI, Desktop-Profil
│   ├── sitespeed.json           ← sitespeed.io inkl. Performance-Budget
│   ├── .hintrc                  ← webhint
│   ├── layout-audit.mjs         ← Layout + axe-core + Netzwerk
│   └── overflow-trace.mjs       ← präziser Überlauf-Detektor
├── lighthouse/
│   ├── mobile/*.html|.json      ← 5 Seiten
│   └── desktop/*.html|.json     ← 5 Seiten
├── webhint/*.json               ← 5 Seiten
├── raw/
│   ├── layout-audit.json        ← alle Layout-/axe-/Netzwerkdaten
│   └── layout-audit-*.json      ← Einzelläufe
└── screenshots/
    ├── mobile/   *-fold.png (390×844), *-full.png
    ├── desktop/  *-fold.png (1440×900), *-full.png
    └── _klein/   verkleinerte JPEGs zur schnellen Durchsicht
                  + ZOOM-wissenschaft-diagramm-text.jpg (Beleg zu Problem 3b)
```

Die Lighthouse-HTML-Reports lassen sich direkt im Browser öffnen und enthalten Filmstrip, vollständigen Wasserfall und jedes Einzelaudit mit Erklärung.
