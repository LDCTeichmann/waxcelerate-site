# Waxcelerate — AI Agent Guide

> Der veraltete englische Architekturteil von 2025 wurde im August 2026 durch
> „Architektur in Kürze" ersetzt. Im Zweifel gilt weiterhin der Code.

---

## Schnellstart für eine neue Session

**Projekt:** `/Users/lucateichmann/Claude Playground/waxcelerate-site`
**GitHub:** `github.com/LDCTeichmann/waxcelerate-site` · **Live:** `waxcelerate.de`

Daneben liegen Worktrees (`wx-hero-light`, `wx-hr6jkh`) aus früheren Umbauten.
Dort **nicht** arbeiten, außer es geht ausdrücklich um die.

```bash
cd ~/"Claude Playground"/waxcelerate-site
git status                       # muss sauber sein, sonst erst klären
git checkout main && git pull
git checkout -b feat/<thema>
```

Dev-Server **nicht** per `npm run dev` im Hintergrund starten, sondern über den
eingebauten Browser-Pane: `preview_start` mit `{ "name": "waxcelerate-site" }`
(Port 5174).

**Vor jedem Commit:**

```bash
npx tsc --noEmit && npm run build
```

Ein Pre-Commit-Hook prüft zusätzlich `tsc -b`, das findet Fehler, die
`--noEmit` von der Wurzel aus übersieht. Kommt der Hook durch, ist es sauber.

**Nach Änderungen an Blog-Artikeln oder Produkten zusätzlich:**

```bash
npx tsx scripts/generate-llms-txt.mjs && npx tsx scripts/generate-sitemap.mjs
```

Sonst stehen in `llms.txt`, `llms-full.txt` und `sitemap.xml` weiter die alten
Inhalte. Das ist schon mehrfach übersehen worden.

**Deployen, immer über git, nie über die Vercel-CLI.** `npx vercel --prod`
bleibt bei diesem Projekt reproduzierbar bei `status: UNKNOWN` hängen, ohne dass
der Build startet. Der GitHub-Integrationsbuild läuft dagegen in etwa einer
Minute durch.

```bash
git push -u origin feat/<thema>     # Preview-Build
git checkout main && git merge --ff-only feat/<thema>
git push origin main                # löst den Produktions-Build aus
```

Danach live prüfen statt dem Deploy-Status zu vertrauen:

```bash
curl -sL https://waxcelerate.de/blog/<slug> | grep -o "<title>[^<]*</title>"
```

`/assets/*` ist ein Jahr immutable gecacht, bei visuellen Änderungen den Nutzer
auf Hard-Refresh hinweisen. `llms.txt` und Co. brauchen bis zu einer Minute über
alle Edge-Standorte.

---

## Die fünf Dinge, die hier anders sind als erwartet

**1. Die Blogseiten werden vorgerendert.** `scripts/generate-blog-html.mjs`
läuft am Ende von `npm run build` und schreibt statisches HTML nach
`dist/blog/<slug>/`. Ohne das lieferte jede URL nur
`<body><div id="root"></div></body>` plus Startseitentitel, und KI-Crawler sahen
gar nichts. Wenn du die Artikeldarstellung änderst, musst du **beide** Renderer
anfassen: `BlogArticlePage.tsx` für den Browser, den Generator für Crawler.

**2. `index.html` trägt das JSON-LD der Startseite.** Der Generator filtert
`Product`, `FAQPage`, `HowTo` und `ItemList` heraus, sonst behauptet jeder
Artikel, ein Produkt mit Sternebewertung zu sein. Diesen Filter nicht entfernen.

**3. Eine globale CSS-Regel setzt `-webkit-text-fill-color` auf `h1`.** Bei
jeder Überschrift über einem Bild müssen `color` **und** `WebkitTextFillColor`
inline gesetzt werden, sonst wird sie fast schwarz.

**4. Zahlen sind verbindlich.** Intervalle, Laufzeiten und Watt-Werte stehen im
Waxcelerate-Skill (`references/40_technical_kb.md`, `90_decision_log.md`). Das
Decision Log hat höchste Präzedenz. Nie eine Zahl erfinden und nie eine Quelle
zitieren, die sie nicht hergibt: In einem früheren Durchgang stand eine
Laufleistung im Blog, die Zero Friction Cycling zugeschrieben war und die ZFC
nie veröffentlicht hat.

**5. Bilder.** Rohfotos gehören nach `public/images/blog/`, werden aber nicht
eingecheckt (gitignored). Zuordnung und Alt-Texte in
`public/images/blog/manifest.json`, dann
`npx tsx scripts/optimize-blog-images.mjs`. Das erzeugt `-1600.webp` (Hero) und
`-800.webp` (Karte) im Format 16:10. Sitzt der Ausschnitt falsch, im Manifest
`"crop": "center"` (oder `top`/`bottom`) setzen. **Nur eigene Fotos verwenden**,
es waren schon ein KI-Bild und ein fremdes mit englischer Kritzelei drin.

---

## Werkzeuge und Ton

Der eingebaute Browser-Pane ist frei nutzbar. Das Chrome-Toolset
(`mcp__claude-in-chrome__*`) und Desktop-Screenshots (`mcp__computer-use__*`)
nur nach Rückfrage, weil sie Lucas echten Bildschirm übernehmen.

Bei Textarbeit vorher das Waxcelerate-Skill laden. Verbindlich: Du-Form, keine
Superlative, keine erfundenen Testimonials, **keine Gedankenstriche als
Satzzeichen** in Kundencopy, keine Formel-Prozentangaben (Rezeptschutz),
„Hergestellt in Stuttgart" nur fürs Wachs und nie „Made in Germany" für die
zugekauften Shimano-, SRAM- und YBN-Ketten.

Stand und offene Entscheidungen zum Blog: `docs/plaene/BLOG_PLAN.md`.

---

## Architektur in Kürze

Verbindlich ist der Code. Was hier steht, ist die Orientierung, nicht die Wahrheit.

**Was das ist:** Marketing- und Verkaufsseite. Verkauft wird über eBay und einen
eigenen Stripe-Checkout, der fertig gebaut, aber inaktiv ist: solange kein
Produkt eine `stripePriceId` trägt, fällt jeder Kauf-Button auf eBay zurück
(`checkoutEnabled` in `src/lib/data.ts`).

| Schicht | Wahl | Anmerkung |
|---|---|---|
| Framework | React 19 + TypeScript | strict, `noUnusedLocals` an |
| Build | Vite 7 | Dev auf 5174, Build nach `dist/` |
| Styles | Tailwind v3 | Themes `light` und `noir`, siehe `useTheme.tsx` |
| Router | React Router v7 | `<BrowserRouter>` in `main.tsx`, rund 20 Routen in `App.tsx` |
| Serverless | Vercel Functions in `api/` | Checkout, Bestand, Widerruf, Admin |
| Bestand | Upstash Redis | optional: fehlt die Konfiguration, gilt alles als unbegrenzt |
| Animation | GSAP + IntersectionObserver | `src/hooks/useAnimation.ts` |

### Ordner

```
src/
├── App.tsx            Routen + Reihenfolge der Startseiten-Abschnitte
├── main.tsx           BrowserRouter, Language- und ThemeProvider
├── sections/          Ein Abschnitt je Datei; science/ und hero/ als Untergruppen
├── pages/             Eine Datei je Route, inkl. blog/
├── components/        Wiederverwendbares; viz/ sind Diagramm-Bausteine
├── hooks/             useLanguage, useTheme, useAnimation, useActiveSection, useBodyScrollLock
├── lib/               data.ts (Quelle der Wahrheit), i18n.ts, science.ts, analytics.ts
└── store/cart.ts      Zustand-Store für Warenkorb und Bestand

api/                   Vercel Functions
scripts/               Sitemap, llms.txt, Merchant-Feed, Vorrendern
docs/                  Alle weitere Doku, siehe PROJECT.md
```

### Datenmodell

`src/lib/data.ts` ist die einzige Quelle für Produktdaten. `Product` trägt
`category: 'wax' | 'chain'` — **nicht** `type`. Zubehör ist ein eigener Typ
`Accessory`, weil es keine Intervalle, Kompatibilitäten oder Bewertungen hat.
`getProductById(id)` löst die Route `/produkt/:id` auf.

### Sprache und Theme

```tsx
const { t, lang, setLang } = useLanguage();   // t = Objekt aus i18n.ts, lang: 'de' | 'en'
const { theme, setTheme } = useTheme();        // 'light' | 'noir'
```

Beides liegt in `localStorage`. Kurze Strings, die nicht in `i18n.ts` stehen,
werden inline ternär geschrieben (`lang === 'de' ? … : …`).

---

## Fallen, die hier schon einmal Zeit gekostet haben

1. **Keine Hooks in `.map()`.** `useScrollReveal` und `use3DReveal` geben Refs
   zurück. Immer eine Wrapper-Komponente dazwischen, Muster: `RevealSlot` in
   `tools.tsx`.

2. **`e.stopPropagation()`** auf dem inneren eBay-Link, wenn außen schon ein
   `<Link>` sitzt. Sonst navigiert der Klick doppelt.

3. **Die Balken in `why-wax.tsx` Block 4** zeigen einen Schmier-Index, nicht den
   Reibwert. Höher ist besser: Classic 95 %, Graphit 72 %, Öl 18 %. Bewusst
   invertiert, **nicht zurückdrehen**.

4. **Bildausschnitt** über `imagePosition` je Produkt in `data.ts`. Voreinstellung
   `center 55%`.

5. **Wachskarten** führen auf `/produkt/:id`, **Kettenkarten** direkt auf eBay.

6. **Ungenutzte i18n-Schlüssel** nicht auf Verdacht löschen.

7. **`ComparisonSlider` und `WhatChanges`** liegen bewusst ungenutzt im Code.
   Beide warten auf Inhalte, siehe `PROJECT.md`. Nicht als toten Code entfernen.
