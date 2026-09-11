# SEO-Technik — wie Indexierbarkeit auf dieser Seite entsteht

Referenz, keine Anleitung von Null. Für den Gesamtstatus (was ist live, was ist
bewusst nicht umgesetzt) siehe [`docs/plaene/SICHTBARKEIT_PLAN.md`](plaene/SICHTBARKEIT_PLAN.md).
Für den letzten Prüfdurchgang siehe [`docs/berichte/`](berichte/).

---

## 1. Welche URLs indexierbar sind

Die Site ist eine reine Client-Side-SPA (Vite + React Router). Jede indexierbare
Route braucht deshalb einen **eigenen Prerender-Eintrag** — ohne den liefert
Vercel für die URL entweder die Startseiten-Hülle oder (seit dem Wegfall des
Catch-all-Rewrites) ein echtes 404. Es gibt keinen SSR-Server; alles Statische
entsteht einmalig beim Build in `dist/`.

| Kategorie | Anzahl | Erzeugt von | Indexierbar |
|---|---|---|---|
| Startseite | 1 | `scripts/generate-home-html.mjs` | ja |
| Feste Info-/Verkaufsseiten (`/wissenschaft`, `/kette-wachsen-lassen`, `/starter-set`, `/ueber-uns`, `/kontakt`, `/faq`, `/anleitung`) | 7 | `scripts/generate-blog-html.mjs` → `STATIC_PAGES` + `NEW_STATIC_PAGES` | ja |
| Rechtstexte (`/impressum`, `/datenschutz`, `/agb`, `/widerruf`, `/widerrufsbelehrung`, `/versand-und-zahlung`) | 6 | `scripts/generate-blog-html.mjs` → `LEGAL_PAGES` | ja, außer `/datenschutz` (`noindex`, siehe Kommentar dort) |
| Rechner (`/rechner`, `/rechner/:slug`) | 7 | `scripts/generate-blog-html.mjs` → `renderToolsHub`/`renderTool` | ja |
| Blog (`/blog`, `/blog/:slug`) | 19 | `scripts/generate-blog-html.mjs` → `renderIndex`/`renderArticle` | ja |
| Produkte (`/produkt/:id`) | 12 | `scripts/generate-product-html.mjs` | ja |
| Zubehör (`/zubehoer/:slug`) | 2 | `scripts/generate-accessory-html.mjs` | ja |
| App-Routen ohne Prerender: `/admin`, `/bestellung-erfolgreich`, `/produkt/:id/stage` | 3 | — (per `vercel.json` auf `index.html` umgeschrieben) | **nein** — `X-Robots-Tag: noindex, nofollow` per `vercel.json`-Header |
| Alles andere | — | `dist/404.html` (`scripts/generate-404-html.mjs`) | nein, HTTP 404 |

**Regel für jede neue öffentliche Route:** Prerender-Eintrag ergänzen (in
`generate-blog-html.mjs`, `-product-html.mjs` oder `-accessory-html.mjs`, je
nach Art), dazu die URL in `scripts/generate-sitemap.mjs` und
`scripts/generate-llms-txt.mjs` eintragen — beide Listen sind handgepflegt und
leiten nichts automatisch aus den Routen ab. Fehlt der Prerender-Eintrag, liefert
die URL live entweder falschen/fehlenden Meta-Inhalt oder ein 404. Fehlt der
Sitemap-Eintrag, wird die Seite nicht gecrawlt. Fehlt der llms.txt-Eintrag, ist
sie für KI-Agenten nicht auffindbar.

`vercel.json` selbst braucht für eine neue vorgerenderte Seite **keine**
Änderung — es gibt bewusst keinen Catch-all-Rewrite mehr, Vercel prüft das
Dateisystem vor jedem Rewrite. Ein `rewrites`-Eintrag ist nur für App-Routen
nötig, die absichtlich NICHT vorgerendert werden (Formulare, interner Zustand).

## 2. Wie Sitemap und strukturierte Daten erzeugt werden

**Sitemap** (`public/sitemap.xml`, generiert von `scripts/generate-sitemap.mjs`):
läuft in `npm run gen:public`, **vor** `vite build` (schreibt nach `public/`,
das Vite erst beim Build nach `dist/` kopiert). Statische URLs liegen in einem
handgepflegten `staticPages`-Array im Skript; Produkte, Zubehör und Artikel
werden aus `src/lib/data.ts` bzw. `src/pages/blog/articles.ts` abgeleitet.
`lastmod` kommt aus einem Content-Hash (`scripts/sitemap-lastmod.json`) statt
aus dem heutigen Datum — eine Seite ohne inhaltliche Änderung behält ihr altes
Datum. `scripts/assert-xml.mjs` prüft vor dem Schreiben auf Wohlgeformtheit
(fehlende XML-Deklaration, unescapte `&`, Null-Bytes).

**JSON-LD** entsteht an zwei Stellen für dieselbe Seite, mit demselben Inhalt:
einmal statisch im Prerender-Skript (sichtbar für jeden Crawler ohne
JavaScript, markiert mit `data-prerendered-ld`), einmal per `react-helmet-async`
in der React-Komponente (ersetzt das statische Schema beim Hydrieren via
`removeStaticJsonLd()`, `src/lib/utils.ts`). Ändert sich das Schema einer
Seite, muss es an **beiden** Stellen geändert werden — ein Grep nach dem
`@type`-Namen findet üblicherweise beide Fundstellen.

| Typ | Wo | Umfang |
|---|---|---|
| `Organization`, `WebSite`, `Person` | `index.html`, Kopf jeder Seite (nicht gestrippt) | sitewide, ein Knoten je Typ (`@id` auf `Person`/`Organization`, andere Seiten referenzieren statt zu duplizieren) |
| `Product`, `Offer`, `BreadcrumbList` | Produkt-/Zubehörseiten | pro Produkt |
| `FAQPage`, `HowTo` | `/faq`, `/anleitung`, Blogartikel mit `faq`/`howTo`-Feldern, Rechner mit `faq` | pro Seite |
| `BlogPosting` | Blogartikel | pro Artikel |
| `AboutPage`, `ContactPage` | `/ueber-uns`, `/kontakt` | je einmal |
| `CollectionPage`, `ItemList`, `SoftwareApplication`/`WebApplication` | `/rechner`, `/rechner/:slug` | Rechner-Hub und Einzelseiten |

`stripHead()` (`scripts/lib/prerender.mjs`) entfernt `Product`, `FAQPage`,
`HowTo` und `ItemList` aus der Kopie der `index.html`-Hülle, die jede
Unterseite als Basis nimmt — sonst trüge jede Unterseite zusätzlich die
Marken-`Product`- und Startseiten-`FAQPage`-Aussagen der Startseite mit.
`Organization`, `WebSite`, `Person` bleiben, weil sie die Site als Ganzes
beschreiben, nicht die Startseite.

**Kein `AggregateRating`** irgendwo im Schema (bewusst, zweimal entfernt): die
verfügbare Zahl ist die eBay-Konto-Bewertung, identisch auf allen Produkten —
genau das Muster, das Googles Spam-Policy als selbstreferenzielles/templated
Review-Markup einstuft (Risiko: sitewide Manual Action auf Rich Results). Um es
legitim zu bekommen, bräuchte es ein eigenes Bewertungssystem mit echten,
pro-Produkt-eindeutigen `review_id`s.

## 3. Nach einem Release extern zu prüfen

Automatisiert, direkt ausführbar:

```bash
npm run check:live                              # gegen https://waxcelerate.de
npm run check:live -- --base=https://waxcelerate.de
npx tsx scripts/ping-indexnow.mjs               # meldet alle Sitemap-URLs an IndexNow/Bing
```

`check:live` (`scripts/check-live.mjs`) prüft automatisiert: HTTP 200 für jede
Sitemap-URL, echtes 404 auf unbekannten URLs, genau ein `<title>`/`<h1>`/Canonical
pro Seite, Canonical absolut und self-referenzierend, kein `noindex` auf
indexierbaren Seiten und `noindex` auf den drei App-Routen, robots.txt-Inhalt,
Sitemap-Wohlgeformtheit, die Redirect-Ketten aller vier Domain-Varianten, und
dass die Startseite ohne JavaScript substanziellen Text liefert. Lokal gegen
`vite preview` liefert es zwei erwartbare, im Skriptkopf dokumentierte falsche
Fehlschläge (Trailing-Slash-Auflösung, fehlende Vercel-Header) — echte
Aussagekraft hat der Lauf gegen eine Vercel-Deployment-URL.

Manuell, nicht automatisierbar:

- **Google Rich Results Test** (search.google.com/test/rich-results) für
  Startseite, eine Produktseite, `/faq`, `/anleitung`, einen Blogartikel.
- **Schema-Validator** (validator.schema.org) — dieselben Seiten, zusätzlich
  auf doppelte `@type`-Blöcke im Live-DOM achten (siehe Falle unten).
- **Lighthouse Mobile**, lokal (siehe `docs/berichte/`, dort steht das
  Kommando mit dem gecachten Chromium-Pfad und die Messdisziplin: erst per
  `curl` aufwärmen, dann 2–3 Läufe, Median nehmen).
- **PageSpeed Insights / Search Console** — Kern-Web-Vitals-Feld-Daten
  brauchen echten Traffic, tauchen erst Tage nach einem Release auf.

## 4. Google Search Console aktualisieren

1. Property `waxcelerate.de` muss weiterhin verifiziert sein (Verifizierungs-
   Methode ist eine statische Datei/Meta-Tag im Repo — prüfen, dass sie noch
   ausgeliefert wird, nicht nur dass sie einmal eingerichtet wurde).
2. Nach einem Release mit neuen oder geänderten URLs: **Sitemaps → erneut
   einreichen** (`https://waxcelerate.de/sitemap.xml`) — GSC crawlt eine
   bekannte Sitemap sonst nur in seinem eigenen Rhythmus neu.
3. Für jede neue Seite, die schnell auffindbar sein soll: **URL-Prüfung** →
   URL eingeben → **Indexierung beantragen**. Sinnvoll für `/ueber-uns`,
   `/kontakt`, `/faq`, `/anleitung` nach diesem Release.
4. **Abdeckung/Seiten**-Bericht nach ein paar Tagen prüfen: neue Seiten sollten
   als „Gültig" erscheinen, nicht als „Gecrawlt – zurzeit nicht indexiert"
   (genau der Status, den die Startseite vor dem Prerender-Umbau trug).
5. Diese vier Schritte sind Kontoarbeit — sie brauchen Zugriff auf das
   Google-Konto, das nur Luca hat, und können nicht automatisiert werden.

## 5. Bekannte Fallen (Ergänzung zu `AGENTS.md`/`docs/REPO_KARTE.md`)

- **`npx tsc --noEmit` ist hier ein Blindgänger** — die Root-`tsconfig.json`
  hat `"files": []`, das prüft null Dateien und ist immer grün. Echter
  Type-Check: `npx tsc -b --force`.
- **Build-Reihenfolge ist zwingend:** `gen:public` vor `vite build` (schreibt
  nach `public/`), `gen:html` danach (schreibt nach `dist/`), und innerhalb
  von `gen:html` muss `generate-home-html.mjs` **zuletzt** laufen — die
  anderen Generatoren erwarten ein leeres `<div id="root"></div>` als Hülle.
  `package.json`s `build`-Skript hält das bereits ein; ein Skript einzeln von
  Hand aufzurufen kann diese Reihenfolge brechen.
- **Doppeltes Meta/Schema nach Hydration ist unsichtbar, wenn man nur
  `document.title` prüft** — Browser zeigen immer den ersten `<title>` in
  Dokumentreihenfolge an, das ist Helmets eigener. Der vorgerenderte bleibt
  dann trotzdem im DOM stehen, wenn die Seite `removeStaticHeadMeta()`/
  `removeStaticJsonLd()` (`src/lib/utils.ts`) vergisst aufzurufen. Prüfen mit
  `document.querySelectorAll('title').length` bzw. `script[type="application/ld+json"]`,
  nicht mit dem sichtbaren Tab-Titel.
- **Ein sitewide-Knoten (`Person`, `Organization`) nicht pro Seite duplizieren.**
  Beide tragen ein `@id` in `index.html`; eine neue Seite referenziert sie mit
  `{ '@id': 'https://waxcelerate.de/#…' }` statt ein zweites, unvollständiges
  Objekt über dieselbe Entität aufzumachen — sonst stehen zwei sich
  widersprechende Aussagen über „Luca Teichmann" im selben DOM.
