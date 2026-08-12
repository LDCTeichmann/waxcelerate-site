# Repo-Karte

Wo was liegt, was daneben liegt, und was man anfassen darf. Für eine neue
Session, die weder Speicher noch Skills der vorherigen hat.
Stand: 2026-08-11, alles darin frisch nachgeprüft.

Einstieg ins Projekt ist `PROJECT.md`, nicht diese Datei.

---

## Was das ist

Marketing- und Verkaufsseite für **Waxcelerate**, deutsche Kleinmarke für
Heißwachs-Kettenpflege (Luca Teichmann, Stuttgart). React 19, TypeScript, Vite.

Verkauft wird über eBay **und** einen eigenen Stripe-Checkout. Der Checkout ist
fertig gebaut, aber inaktiv: solange kein Produkt eine `stripePriceId` trägt,
fällt jeder Kauf-Button auf eBay zurück. Serverless-Endpunkte liegen in `api/`
(Vercel). Die frühere Behauptung „kein Backend" stimmt seit Mitte 2026 nicht mehr.

---

## Wo alles liegt

| Was | Pfad / Adresse |
|---|---|
| Der Code | `/Users/lucateichmann/Claude Playground/waxcelerate-site` |
| GitHub | `github.com/LDCTeichmann/waxcelerate-site`, `main` ist Produktion |
| Live | `waxcelerate.de` |
| Vercel | Projekt `waxcelerate-site`, baut automatisch bei Push auf `main` |
| Rohbild-Archiv | `../waxcelerate-assets-archiv/` — seit 08/2026 **außerhalb** des Repos |

### Nachbarordner im `Claude Playground`

**Nicht dein Arbeitsbereich, außer der Nutzer nennt sie ausdrücklich.**

- `wx-hero-light/` und `wx-hr6jkh/` — sehen aus wie Git-Worktrees, sind aber
  **keine gültigen mehr**: ihre `.git`-Datei zeigt auf
  `.git/worktrees/<name>`, und diese Registry-Einträge existieren nicht.
  Jedes `git`-Kommando **in** diesen Ordnern bricht mit „not a git repository"
  ab. Am 11.08.2026 geprüft: beide enthalten **keine ungespeicherte Arbeit**,
  ihr Inhalt entspricht exakt den Branches `feat/hero-light` bzw.
  `work/reviews-on-hr6jkh`. Es geht dort also nichts verloren. Wer wieder darin
  arbeiten will, legt den Worktree neu an, statt die Ordner zu reparieren.
- `waxcelerate-store/` — separates, nicht genutztes Projekt. Ignorieren.
- `DESIGN/`, `New Product selection june 2026/`, `Waxcelerate website images/` —
  Rohfotos und Design-Ablage, kein Code.

### Vor `git checkout` / `reset` / `stash`

Im Hauptrepo liegen **zwei offene Stashes** aus früheren Sessions (ein Umbau auf
`audit/award-winning`, ein älterer WIP auf `main`). Nicht droppen. Stehen sie im
Weg, den Nutzer fragen.

Zwei Branches tragen eigene, nirgends sonst vorhandene Commits:
`audit/award-winning` und `work/reviews-on-hr6jkh` (je einer). Alle übrigen
Branches sind vollständig in `main` enthalten.

---

## Struktur

```
PROJECT.md CLAUDE.md AGENTS.md README.md   die einzigen vier Markdown-Dateien in der Wurzel
docs/                Referenz (DESIGN, AUDIT, diese Karte, Wissenschaftsnotizen)
docs/plaene/         laufende Bauvorhaben
docs/aufgaben/       was Luca selbst tun muss
docs/archiv/         abgearbeitet oder überholt — nie als Auftrag lesen
src/lib/data.ts      Produktdaten, Preise, Intervalle — einzige Quelle
src/pages/blog/articles.ts        18 Blogartikel als Datenstruktur
scripts/             Vorrendern, Sitemap, llms.txt, Merchant-Feed
api/                 Vercel Serverless Functions
performance-audit/   Bericht und Skript versioniert, die Messartefakte nicht
```

Seit dem Aufräumen am 11.08.2026 gehören **keine neuen Markdown-Dateien in die
Wurzel**, sondern in den passenden `docs/`-Unterordner, plus eine Zeile in der
Tabelle in `PROJECT.md`.

---

## Zuerst lesen

1. **`PROJECT.md`** — Inhaltsverzeichnis, offene Entscheidungen, Entscheidungslog.
2. **`AGENTS.md`** — Schnellstart, Deploy, die fünf Dinge, die hier anders sind,
   und die bekannten Fallen. Der alte, teils falsche englische Architekturteil
   wurde am 11.08.2026 ersetzt; die Datei ist jetzt durchgehend gültig.
3. **`CLAUDE.md`** — Kurzregeln.
4. Themenbezogen aus `docs/`, geführt über die Tabelle in `PROJECT.md`.

Für Textarbeit gibt es das Anthropic-Skill **`waxcelerate`** mit den
verbindlichen Zahlen und einem Decision Log, das bei Widersprüchen gewinnt. Ist
es nicht installiert: **fragen, nicht raten**, und keine technische Zahl
ungeprüft aus dem Code übernehmen.

---

## Loslegen

```bash
cd ~/"Claude Playground"/waxcelerate-site
git status && git checkout main && git pull && git checkout -b feat/<thema>
```

Dev-Server über den Browser-Pane (`preview_start`, `{"name":"waxcelerate-site"}`,
Port 5174), nicht als Terminal-Hintergrundjob.

Vor jedem Commit `npx tsc -b && npm run build`. **Achtung:** `api/` wird von
keiner `tsconfig` erfasst und damit von beidem **nicht** geprüft. Bei Änderungen
an Serverless-Endpunkten zusätzlich:

```bash
npx tsc --noEmit --skipLibCheck --strict --module esnext --moduleResolution bundler --target es2022 --types node api/*.ts
```

Nach Änderungen an Artikeln oder Produkten:

```bash
npx tsx scripts/generate-llms-txt.mjs && npx tsx scripts/generate-sitemap.mjs
```

Deploy **immer über git**, nie über `npx vercel` — die CLI hängt hier
reproduzierbar. Danach live gegenprüfen statt dem Vercel-Status zu vertrauen:

```bash
curl -sL https://waxcelerate.de/blog/<slug> | grep -o "<title>[^<]*</title>"
```

---

## Die wichtigsten Fallen

1. **Der Blog wird doppelt gerendert** — React (`BlogArticlePage.tsx`) für den
   Browser, `scripts/generate-blog-html.mjs` für Crawler. Änderst du die
   Darstellung, zieh beide nach.
2. **`index.html` trägt globales JSON-LD**, das der Blog-Generator filtert
   (Product/FAQPage/HowTo/ItemList raus). Diesen Filter nicht entfernen.
3. **Keine Gedankenstriche als Satzzeichen** in Kundencopy. Verbindliche
   Markenregel. In `src/lib/data.ts` stehen noch 66 Stück offen.
4. **Keine Zahl ohne Quelle.** Es stand schon eine Laufleistung im Blog, die
   einer Quelle zugeschrieben war, die sie nie veröffentlicht hat.
5. **Nur echte Fotos.** Es waren schon ein KI-Bild und ein fremdes Foto drin.
6. **Browser-Pane frei**, Chrome-Toolset und Desktop-Screenshots nur nach
   Rückfrage — die greifen auf Lucas echten Bildschirm zu.
7. **Bilder nie auf Verdacht löschen.** Viele Pfade entstehen erst zur Laufzeit
   (`${slug}-800.webp`, die `-lg`-Ersetzung auf Produktseiten, die
   PWA-Manifest-Icons). Eine Suche nach dem Dateinamen im Quelltext findet sie
   nicht und meldet sie fälschlich als unbenutzt.
