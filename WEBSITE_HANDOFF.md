# Übergabe: Waxcelerate Website

Für eine neue Claude-Code-Session (anderer Account, kein Zugriff auf Speicher
oder Skills der vorherigen Sessions). Stand: 2026-07-27. Alles hier ist gerade
verifiziert, nicht aus Erinnerung geschrieben.

---

## Was das ist

Marketing-Website für **Waxcelerate**, eine deutsche Kleinmarke für
Heißwachs-Kettenpflege für Fahrräder (Inhaber: Luca Teichmann, Stuttgart).
Kein Shop, kein Backend im klassischen Sinn — die Seite verkauft über eBay und
leitet dorthin weiter. React 19 + TypeScript + Vite, kein Framework-Server.

---

## Wo alles liegt

| Was | Pfad / Adresse |
|---|---|
| **Der Code, an dem du arbeitest** | `/Users/lucateichmann/Claude Playground/waxcelerate-site` |
| GitHub | `github.com/LDCTeichmann/waxcelerate-site`, Branch `main` ist Produktion |
| Live-Seite | `waxcelerate.de` |
| Vercel-Projekt | `waxcelerate-site` (baut automatisch bei Push auf `main`) |

Im selben `Claude Playground`-Ordner liegen daneben weitere Verzeichnisse.
**Die sind nicht dein Arbeitsbereich, außer der Nutzer nennt sie ausdrücklich:**

- `wx-hero-light/` und `wx-hr6jkh/` — eigenständige Git-Worktrees mit eigenen
  Branches (`feat/hero-light`, `work/reviews-on-hr6jkh`), aus früheren
  Design-Experimenten. Teilweise schon in `main` gemerged, teilweise nicht.
- `DESIGN/`, `New Product selection june 2026/`, `Waxcelerate website images/`
  — Rohfoto-Archive und Design-Ablage, kein Code.
- `waxcelerate-store/` — ein separates, nicht aktiv genutztes Projekt, laut
  Vercel-Notizen früherer Sessions zu ignorieren.

**Wichtig, bevor du irgendetwas mit `git checkout`/`reset`/`stash` machst:**
Im Hauptrepo liegen zwei offene `git stash`-Einträge von früheren Sessions
(uncommitteter Umbau auf Branch `audit/award-winning`, und ein älterer WIP-Stash
auf `main`). Nicht löschen, nicht droppen. Wenn du sie im Weg hast, frag den
Nutzer statt sie zu verwerfen.

---

## Zuerst lesen, in dieser Reihenfolge

Alle vier liegen im Repo-Root.

1. **`AGENTS.md`** — technischer Einstieg. Der obere, neu geschriebene Teil
   (Schnellstart, Deploy-Ablauf, „die fünf Dinge, die hier anders sind als
   erwartet") ist aktuell und verlässlich. Der untere, alte Architekturteil ist
   von 2025 und in Teilen falsch (steht dort auch so vermerkt) — im Zweifel
   gilt der Code, nicht dieser Teil.
2. **`CLAUDE.md`** — Kurzregeln: Datenhaltung (`src/lib/data.ts`), Hook-Regeln,
   ein Performance-Balken, der nicht zurückgeändert werden darf, und wann der
   Browser-Pane genutzt werden darf.
3. **`BLOG_PLAN.md`** — Stand und Konzept des Blogs „Die Werkstatt", inklusive
   einer Liste offener Entscheidungen, die nur der Nutzer treffen kann
   (Abschnitt 5).
4. **`BLOG_EXECUTION.md`** — abgearbeitete Aufgabenliste des letzten großen
   Blog-Umbaus, als Referenz für Muster und Vorgehen.

Für inhaltliche/textliche Arbeit an Waxcelerate-Copy gibt es außerdem ein
Anthropic-Skill namens **`waxcelerate`** (falls in diesem Account installiert,
per `/waxcelerate` oder Skill-Tool aufrufbar). Es enthält verbindliche Zahlen
(Intervalle, Preise, Formulierungsregeln) mit einem Decision Log, das bei
Widersprüchen immer gewinnt. **Ist das Skill in diesem Account nicht
installiert, frag den Nutzer nach den verbindlichen Zahlen, bevor du technische
Claims schreibst — nicht raten und keine alten Werte aus dem Code übernehmen,
ohne sie zu hinterfragen.**

---

## Repo-Struktur, kurz

```
src/lib/data.ts              Produktdaten, Preise, Intervalle — einzige Quelle
src/pages/blog/articles.ts   Alle 18 Blog-Artikel als Datenstruktur
src/pages/blog/BlogIndexPage.tsx / BlogArticlePage.tsx   Blog-Rendering (Browser)
scripts/generate-blog-html.mjs   Vorrendert die Blogseiten für Crawler (siehe unten)
scripts/generate-sitemap.mjs, generate-llms-txt.mjs, optimize-blog-images.mjs
public/images/blog/manifest.json   Bildzuordnung für den Blog
```

---

## Aktueller Stand (2026-07-27)

Gerade abgeschlossen und live auf `main`: ein kompletter AEO/SEO-Umbau des
Blogs — Vorrendern für Crawler, Schema-Fixes, Faktencheck aller 18 Artikel
gegen externe Quellen, echte Fotos statt Stockbildern, Produktverlinkung am
Artikelende. Details und Begründungen stehen in `BLOG_PLAN.md`.

**Offene To-dos aus diesem Umbau** (Abschnitt 4/5 in `BLOG_PLAN.md`):
- Eine `/rewax`-Servicelandingpage fehlt noch (größte unbesetzte Content-Lücke)
- 17 von 18 Artikeln haben noch kein `faq[]`-Feld
- Zehn Artikel sind mit 450–550 Wörtern zu kurz für echte Konkurrenzfähigkeit
- PTFE/PFAS-Sprachpolitik ist offen (blockiert einen geplanten Artikel)
- 57 Gedankenstriche als Satzzeichen in `src/lib/data.ts` (Shop-Copy) sind noch
  nicht bereinigt — im Blog wurde das schon gemacht, siehe unten

---

## Wie loslegen

```bash
cd ~/"Claude Playground"/waxcelerate-site
git status                       # sollte sauber sein
git checkout main && git pull
git checkout -b feat/<dein-thema>
```

Dev-Server über den eingebauten Browser-Pane starten (`preview_start` mit
`{"name": "waxcelerate-site"}`, Port 5174), nicht per Terminal-Hintergrundjob.

Vor jedem Commit:

```bash
npx tsc --noEmit && npm run build
```

Nach Änderungen an Artikeln/Produkten zusätzlich:

```bash
npx tsx scripts/generate-llms-txt.mjs && npx tsx scripts/generate-sitemap.mjs
```

Deploy **immer über git**, nie über `npx vercel` — die CLI hängt bei diesem
Projekt reproduzierbar. Push auf `main` löst den Vercel-Build automatisch aus:

```bash
git push origin main
```

Danach live gegenprüfen, nicht nur dem Vercel-Status vertrauen:

```bash
curl -sL https://waxcelerate.de/blog/<slug> | grep -o "<title>[^<]*</title>"
```

Volles Detail zu alledem: `AGENTS.md`.

---

## Die wichtigsten Fallen

1. **Der Blog wird doppelt gerendert.** Einmal in React (`BlogArticlePage.tsx`,
   für den Browser) und einmal statisch (`scripts/generate-blog-html.mjs`, für
   Crawler ohne JavaScript). Änderst du eine Artikelseite, zieh beide nach,
   sonst sehen Crawler etwas anderes als Besucher.
2. **`index.html` trägt globales JSON-LD**, das der Blog-Generator filtert
   (Product/FAQPage/HowTo/ItemList raus, sonst behauptet jeder Artikel ein
   Produkt mit Sternebewertung zu sein). Diesen Filter nicht entfernen.
3. **Keine Gedankenstriche als Satzzeichen** in Kundencopy (`text: '... – ...'`).
   Ist eine verbindliche Markenregel, nicht Geschmackssache — macht Texte
   sofort als KI-generiert erkennbar.
4. **Keine Zahl ohne Quelle.** Ein früherer Durchgang hatte eine Laufleistung
   im Blog stehen, die einer externen Quelle zugeschrieben war, die sie nie
   veröffentlicht hat. Vor jeder technischen Zahl (km, Watt, °C, %) im Zweifel
   fragen statt schätzen.
5. **Nur echte Fotos.** Es waren schon ein KI-generiertes Bild und ein fremdes
   Foto mit einer englischen Handschrift-Kritzelei im Blog. Bildquelle immer
   prüfen, bevor sie verwendet wird.
6. **Browser-Tools:** Der eingebaute Browser-Pane darf frei genutzt werden.
   Das Chrome-Toolset und Desktop-Screenshot-Tools nur nach Rückfrage — die
   greifen auf den echten Bildschirm des Nutzers zu, der oft parallel arbeitet.
