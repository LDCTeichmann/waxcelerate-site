# Blog-Umbau — Ausführungsplan

Arbeitsanweisung für die Umsetzung. Die Begründungen stehen in `BLOG_PLAN.md`,
**das brauchst du erst ab Aufgabe 7.** Aufgaben 1 bis 6 sind hier vollständig beschrieben.

---

## Regeln für diese Session

1. **Eine Aufgabe, ein Commit.** Vor jedem Commit `npx tsc --noEmit`, muss sauber sein (Pre-Commit-Hook läuft ohnehin).
2. **`src/pages/blog/articles.ts` ist 1259 Zeilen. Nie komplett lesen.**
   Immer erst `grep -n "slug: '<slug>'" src/pages/blog/articles.ts`, dann gezielt mit Read + offset/limit.
3. **Keine Neuanalyse.** Was zu tun ist, steht hier. Nicht erneut die Live-Seite prüfen, nicht erneut Keywords recherchieren.
4. **Fehlende Bilder blockieren nichts.** `getArticleImage()` hat einen Fallback. Wenn `public/images/blog/` leer ist,
   Aufgabe 5 überspringen und weitermachen.
5. **Sprachregeln sind bindend** (`references/30_claims_language.md` im Waxcelerate-Skill): Du-Form, keine Superlative,
   keine erfundenen Testimonials, **keine Gedankenstriche als Satzzeichen**, Zahlen immer kontextualisiert.
6. Nach jeder Änderung an Artikeln oder Produkten:
   `npx tsx scripts/generate-sitemap.mjs && npx tsx scripts/generate-llms-txt.mjs`

## Vorher klären

Der Checkout stand zuletzt auf `audit/award-winning` mit uncommitteten Änderungen und weicht von live ab.
**Erste Handlung:** `git status` prüfen. Wenn nicht auf einem frischen Branch von `origin/main`:

```bash
git stash -u && git checkout -b feat/blog-aeo origin/main && git stash pop
```

Die drei neuen Dateien (`scripts/generate-blog-html.mjs`, `BLOG_EXECUTION.md`, `public/images/blog/`) sind untracked
und wandern beim Wechsel mit.

---

## Aufgabe 1 — Prerendering aktivieren ✅ Skript ist fertig

`scripts/generate-blog-html.mjs` **existiert bereits und ist getestet** (19 Seiten, korrekte Per-Seiten-Titel,
OG-Tags, BlogPosting- und BreadcrumbList-JSON-LD, SPA-Assets intakt). Zu tun ist nur noch das Einhängen:

**Schritt 1** — in `package.json`:

```json
"build": "tsc -b && vite build && npx tsx scripts/generate-blog-html.mjs"
```

**Schritt 2** — verifizieren:

```bash
npm run build
grep -o "<title>[^<]*</title>" dist/blog/ebike-kette-wachsen/index.html
```

Erwartung: der Artikeltitel, **nicht** der Startseitentitel.

```bash
python3 -c "import re;h=open('dist/blog/ebike-kette-wachsen/index.html',encoding='utf-8').read();print(len(re.search(r'<body.*?</body>',h,re.S).group(0)))"
```

Erwartung: über 3000 Zeichen. Vorher waren es 42.

**Nicht nötig:** `vercel.json` anfassen. Vercel prüft das Dateisystem vor den Rewrites, die statischen
Dateien gewinnen also automatisch gegen die SPA-Fallback-Regel.

**Abnahme:** `dist/blog/` enthält 19 Ordner mit `index.html`, jede mit eigenem Titel und echtem Inhalt.

---

## Aufgabe 2 — OG-Tags in der React-App

Aufgabe 1 versorgt Crawler. Diese Aufgabe versorgt den Browser und alles, was beim Teilen die gerenderte Seite liest.

In `src/pages/blog/BlogArticlePage.tsx`, im `<Helmet>`-Block nach der Description ergänzen:

```tsx
<meta property="og:type" content="article" />
<meta property="og:title" content={article.title} />
<meta property="og:description" content={article.description} />
<meta property="og:url" content={`https://waxcelerate.de/blog/${article.slug}`} />
<meta property="og:image" content={`https://waxcelerate.de${hero.src}`} />
<meta property="article:published_time" content={article.publishDate} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={article.title} />
<meta name="twitter:description" content={article.description} />
<meta name="twitter:image" content={`https://waxcelerate.de${hero.src}`} />
```

Analog in `BlogIndexPage.tsx` mit `og:type="website"` und `/images/blog/ride-road-golden.jpg` als Bild
(Fallback `/images/hero-chain-texture.jpg`, falls die Datei fehlt).

**Abnahme:** `npm run dev`, Artikelseite öffnen, im DOM-Inspector genau ein `og:title` mit dem Artikeltitel.

---

## Aufgabe 3 — Gedankenstriche entfernen

184 Treffer in `articles.ts`. Verstoß gegen die Sprachregel und das auffälligste Maschinen-Merkmal im Text.

```bash
grep -cE "\s[–—]\s" src/pages/blog/articles.ts
```

**Nur von Leerzeichen umgebene Striche ersetzen.** Zahlenbereiche wie `2,5–4,5 W`, `0,03–0,06` oder `5–8.000 km`
haben keine Leerzeichen und bleiben unangetastet.

Kein blindes Suchen-und-Ersetzen: Je nach Satz wird daraus ein Punkt, ein Komma, ein Doppelpunkt oder eine
Klammer. Vorgehen: Treffer mit `grep -nE "\s[–—]\s" src/pages/blog/articles.ts` auflisten, dann in Blöcken von
etwa 20 Zeilen mit Edit durchgehen.

Beispiel:

```
vorher:  'Genau deshalb lohnt sich Heißwachs hier besonders – es senkt die Reibung im Lager.'
nachher: 'Genau deshalb lohnt sich Heißwachs hier besonders. Es senkt die Reibung im Lager.'
```

**Abnahme:** `grep -cE "\s[–—]\s" src/pages/blog/articles.ts` gibt 0 (bis auf Code-Kommentare am Dateikopf,
die dürfen bleiben).

---

## Aufgabe 4 — Schema und Datum in der React-App nachziehen

`generate-blog-html.mjs` liefert das bereits im statischen HTML. Damit die App identisch ist:

In `BlogArticlePage.tsx`:
- `'@type': 'Article'` → `'BlogPosting'`
- `dateModified: article.dateModified ?? article.publishDate` ergänzen
- `inLanguage: 'de-DE'` und `articleSection: article.category` ergänzen
- `author` erweitern: `{ '@type': 'Person', name: 'Luca Teichmann', url: 'https://waxcelerate.de/#ueber-mich' }`
- `publisher.logo` ergänzen: `{ '@type': 'ImageObject', url: 'https://waxcelerate.de/images/logo.jpg' }`
- Zweites `<script type="application/ld+json">` mit `BreadcrumbList` (Startseite › Blog › Artikel),
  Vorlage in `scripts/generate-blog-html.mjs`, Funktion `renderArticle`

In `src/pages/blog/articles.ts`, Interface `Article`:

```ts
/** Datum der letzten inhaltlichen Prüfung. Bei jeder Überarbeitung mitsetzen. */
dateModified?: string;
```

Sichtbar in der Byline ergänzen: `Zuletzt geprüft am {dateModified}`, nur wenn gesetzt.

Hintergrund: zehn Artikel tragen identisch `2026-06-16`. Für Antwortmaschinen ist Aktualität ein starkes Signal,
und `dateModified` staffelt sich beim Überarbeiten von selbst.

**Abnahme:** `npx tsc --noEmit` sauber, im DOM ist genau ein `BlogPosting` und ein `BreadcrumbList`.

---

## Aufgabe 5 — Bilder (überspringen, wenn `public/images/blog/` leer ist)

Zuordnung steht maschinenlesbar in `public/images/blog/manifest.json`. Das ist die einzige Datei, die du dafür
lesen musst.

**Schritt 1** — `scripts/optimize-blog-images.mjs` schreiben. Nutzt `sharp` (`npm i -D sharp`), erzeugt je Quelldatei:
- `<name>-1600.webp` (Hero, Breite 1600, quality 78)
- `<name>-800.webp` (Karte, Breite 800, quality 76)
- `<name>-1600.jpg` als Fallback
Ziel jeweils unter 180 KB. Überspringt Dateien, die schon aktuell sind.

**Schritt 2** — `articleImages` in `articles.ts` erweitern:

```ts
export const articleImages: Record<string, { src: string; card?: string; alt: string }> = { ... }
```

`src` = 1600er, `card` = 800er. `getArticleImage` gibt `card` mit zurück, `card` fällt auf `src` zurück.

**Schritt 3** — in `BlogIndexPage.tsx` die Kartenbilder auf `img.card` umstellen und `width`/`height` setzen.
Hero in `BlogArticlePage.tsx` bekommt `fetchPriority="high"` statt `loading="lazy"`.

Hintergrund: aktuell lädt die Übersicht 17 Hero-Bilder in voller Auflösung als Vorschaukacheln, ohne feste Maße,
also mit springendem Layout.

**Schritt 4** — Zuordnungen aus dem Manifest übertragen. Die Einträge mit `"slot": "hero"` ersetzen die bisherigen
Pfade im angegebenen `target`. Alt-Texte wörtlich aus dem Manifest übernehmen.

**Abnahme:** kein Artikel nutzt mehr `/images/reviews/ride-*.jpg` als Hero, `process-melt.jpg` kommt genau einmal vor.

---

## Aufgabe 6 — Blogstartseite umbauen

Alles in `src/pages/blog/BlogIndexPage.tsx`. Reihenfolge auf der Seite von oben nach unten:

**6a. Vergleichsblock** (nur wenn beide Bilder existieren), direkt über dem Leitartikel.
Zwei Bilder nebeneinander, links `oil-tattoo-leg.jpg`, rechts `chain-waxed-macro.jpg`, darunter zwei Zeilen:
Überschrift „Der Unterschied in einem Bild", darunter ein Satz. Auf Mobil untereinander.
Das ist die These des Blogs in einem Blick.

**6b. Einstieg nach Absicht**, über den Kategorie-Pills. Vier Buttons, die auf Artikel verlinken:

| Label | Ziel |
|---|---|
| Ich will anfangen | `/blog/von-oel-auf-wachs-umsteigen` |
| Es klappt nicht | `/blog/wachs-haelt-nicht-haeufige-fehler` |
| Ich will es genau wissen | `/blog/kettenlaufzeit-heisswachs` |
| Ich will kaufen | `/blog/vorgewachste-kette` |

Die Kategorie-Pills bleiben darunter. Begründung: die sechs Kategorien sind Redaktionslogik, wer über
„Kette wachsen wie oft" hereinkommt, sucht keine Kategorie.

**6c. Zählerfehler.** Der Hero sagt `{articles.length} Artikel`, die Rasterüberschrift daneben `{grid.length}`,
weil der Leitartikel herausgefiltert wird. Label auf „Weitere Artikel" ändern.

**6d. Kennzahl auf jeder Karte.** `Article` bekommt ein optionales Feld:

```ts
/** Eine Kennzahl für die Übersichtskarte, z. B. { value: '400–550 km', label: 'Intervall' } */
keyStat?: { value: string; label: string };
```

In `ArticleCard` mono gesetzt neben der Lesezeit rendern. Für alle 18 Artikel einen Wert setzen, der wirklich im
Artikel steht, nichts erfinden. Das macht das Raster scannbar und verstärkt die Aussage, die die Marke von den
Magazinen unterscheidet: hier stehen Zahlen.

**6e. Suche.** Eingabefeld über den Pills, `useMemo`-Filter über `title`, `description` und `takeaways`.
Kein Fuzzy-Matching, kein Paket, `toLowerCase().includes()` reicht bei 18 Artikeln.

**6f. CTA-Banner** unten bekommt `ride-road-golden.jpg` als Hintergrund mit dunklem Verlauf.

**Gotcha, kostet sonst eine halbe Stunde:** Eine globale CSS-Regel setzt `-webkit-text-fill-color: #101013` auf
`h1`. Bei jeder Überschrift über einem Bild müssen **beide** gesetzt werden:
`style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF' }}`.

**Nicht anfassen:** Typografie, Farbtokens, Dark Mode (`.noir` auf `<html>`, nicht `.dark`), Leseprogress-Balken,
Autorenbox. Funktioniert alles.

---

## Aufgabe 7 und weiter — Inhalt

Ab hier `BLOG_PLAN.md` lesen, Abschnitte 3 und 4.

| # | Aufgabe | Quelle |
|---|---|---|
| 7 | `takeaways[]` und `faq[]` auf allen 18 Artikeln, Zahlenregel anwenden | BLOG_PLAN 3.3, 3.4 |
| 8 | Route `/rewax` plus Artikel „Kette wachsen lassen" | BLOG_PLAN 4, Punkt 1 |
| 9 | Die zehn dünnen Artikel auf 900 bis 1200 Wörter | BLOG_PLAN 3.2 |
| 10 | Neue Artikel 2 bis 8 | BLOG_PLAN 4 |
| 11 | Wachs-Logbuch, Lexikon, Pillar-Seite | BLOG_PLAN 4, Welle 3 |

**Aufgabe 7 ist die wichtigste inhaltliche.** Kurzfassung der Regel, damit sie nicht untergeht:
Jeder Artikel braucht drei harte Zahlen mit Einheit. „Oft schon nach der Hälfte der Kilometer" ist unzitierbar,
„statt 3.000 bis 4.000 km oft schon nach 1.500 bis 2.000, gemessen an 0,5 % Kettendehnung" ist zitierbar.
Antwortmaschinen übernehmen keine Aussage ohne Zahl.

**Blockiert und nicht ohne Lucas Entscheidung anfangen:**
- Artikel zu PTFE und PFAS. Offene Sprachpolitik, ob PTFE öffentlich genannt wird.
- Alles, was Zugriff auf Search Console, Merchant Center oder eBay-Konto braucht.

---

## Zustand bei Übergabe

Fertig und getestet:
- `scripts/generate-blog-html.mjs` (Aufgabe 1, nur noch einhängen)
- `public/images/blog/manifest.json` und `BILDER-HIERHER.md`
- `BLOG_PLAN.md` (Analyse und Begründungen)

Offen: Aufgaben 1 (Einhängen) bis 11.
