# Auftrag für die Sonnet-Session

**Erstellt:** 4. August 2026 von Opus 5, nach Verifikation aller unten genannten Fähigkeiten
**Ziel:** Phase 2 aus `docs/plaene/SICHTBARKEIT_PLAN.md` so weit wie möglich fertigstellen, ohne Git und ohne Luca
**Danach:** Opus 5 prüft das Ergebnis, Luca committet und deployt

---

## 1. Lies das zuerst

1. Dieses Dokument vollständig.
2. `docs/plaene/SICHTBARKEIT_PLAN.md`, besonders §0 (Ist-Zustand), §8 (Arbeitsregeln), §9 Phase 2.
3. `PROJECT.md`, dann gezielt `AGENTS.md`.
4. Skill `waxcelerate` laden, daraus `70_playbooks.md`, `30_claims_language.md`, `20_products_pricing.md`, `90_decision_log.md`.
5. `docs/SKILL_PREISE_UPDATE.md` im Repo — enthält die aktuellsten Preise und Entscheidungen, die im Skill selbst noch fehlen. **Bei Widerspruch gewinnt diese Datei.**

---

## 2. Was du kannst und was nicht — verifiziert, nicht vermutet

Ich habe das am 4. August alles durchgetestet. Verlass dich darauf, probiere es nicht neu aus.

### Geht

| Fähigkeit | Nachweis |
|---|---|
| `npx tsc --noEmit` im gemounteten Repo | läuft sauber durch |
| `npx tsx scripts/*.mjs` im gemounteten Repo | `generate-sitemap.mjs` lief, schrieb 35 URLs |
| **Vollständiger Build in einer `/tmp`-Kopie** | `npm install` 9 s, `npm run build` 2,3 s, Ausgabe: „19 Blog-Seiten und 3 feste Seiten vorgerendert" |
| npm-Registry erreichbar | `npm ping` → PONG |
| Dateien lesen und schreiben | ja |

### Geht nicht

| Blockade | Grund |
|---|---|
| `git add`, `commit`, `checkout`, `push` | `.git/index.lock` hängt, aus der Einbindung nicht löschbar, und keine GitHub-Zugangsdaten |
| `npm install` **im gemounteten Repo** | würde macOS-Binärdateien durch Linux-Versionen ersetzen und **Lucas lokale Umgebung zerstören** |
| `npm run build` **im gemounteten Repo** | bricht ab, `@rollup/rollup-linux-arm64-gnu` fehlt (dort liegen darwin-Binärdateien) |
| Deploy, Preview-URL, Browser-Rendering prüfen | braucht Lucas Push |

### Der Build-Trick, den du benutzen sollst

```bash
rm -rf /tmp/wx && mkdir -p /tmp/wx
cd /sessions/<deine-session>/mnt/waxcelerate-site
tar --exclude=node_modules --exclude=.git --exclude=dist -cf - . | (cd /tmp/wx && tar xf -)
cd /tmp/wx && npm install --no-audit --no-fund && npm run build
```

Dauert zusammen unter einer Minute. Danach liegt in `/tmp/wx/dist/` ein echter Produktions-Build, an dem du dein Ergebnis prüfen kannst. `npm install` läuft dabei **nur** in `/tmp/wx`, nie im gemounteten Ordner.

Nach jeder Änderung an `scripts/` oder `src/lib/data.ts`: Dateien erneut nach `/tmp/wx` kopieren und nur `npm run build` wiederholen, das `npm install` bleibt gültig.

---

## 3. Achtung: parallele Session im selben Arbeitsverzeichnis

Während dieses Dokument entstand, hat eine andere Session aktiv im selben Baum gearbeitet. Zuletzt geändert und **nicht von dir anzufassen**:

```
PROJECT.md
vite.config.ts          (enthält den base-Fix UND ein fremdes cacheDir)
src/pages/RewaxPage.tsx
src/pages/SciencePage.tsx
src/pages/StarterSetPage.tsx
src/sections/WhatChanges.tsx
src/sections/why-wax.tsx
src/components/BackLink.tsx
public/images/…
```

**Regel: Fass keine Datei unter `src/pages/`, `src/sections/`, `src/components/` an.** Dein Arbeitsbereich ist `scripts/` plus eine minimale, klar abgegrenzte Änderung an `package.json`. Das ist sauber getrennt, weil die andere Session an Oberfläche arbeitet und du an der Build-Kette.

Wenn du meinst, eine Datei außerhalb deines Bereichs ändern zu müssen: **nicht tun, sondern im Abschlussbericht vermerken.**

---

## 4. Ist-Zustand, den du nicht neu ermitteln musst

Verifiziert am 4. August gegen `origin/main` = `3471d6d` und gegen den `/tmp`-Build.

| Route | Vorgerendert | Quelle |
|---|---|---|
| `/blog` + 18 Artikel | **ja** | `generate-blog-html.mjs` |
| `/rewax`, `/starter-set`, `/wissenschaft` | **ja** | `STATIC_PAGES` im selben Skript |
| Startseite `/` | **nein** | `<div id="root"></div>` ist im Build leer, bestätigt |
| 12 × `/produkt/:id` | **nein** | senden zusätzlich Titel und Canonical der Startseite |
| 6 Rechtstextseiten | **nein** | |

Der `base`-Fix ist in der Arbeitskopie vorhanden und **funktioniert nachweislich**: Im `/tmp`-Build referenzieren Startseite, `/blog/<slug>` und `/rewax` alle `/assets/index-M9gq_J9R.js` absolut. Er ist nur noch nicht committet, das macht Luca morgen.

---

## 5. Deine Aufgabe

### 5.1 Kern: `scripts/generate-product-html.mjs`

Neues Skript, Vorbild ist `scripts/generate-blog-html.mjs`. Quelle ist `src/lib/data.ts`, kein Headless-Browser. Je Produkt eine Seite nach `dist/produkt/<id>/index.html`.

Pro Seite:

- **Head:** eigener `<title>`, eigene `<meta name="description">`, `<link rel="canonical">` auf `https://waxcelerate.de/produkt/<id>`, OG- und Twitter-Tags. Nutze die vorhandene `metaTags()`-Funktion als Vorbild.
- **Body in `#root`:** `<h1>` mit dem Produkttitel, Beschreibung, Preis, Highlights, Spezifikationen, Kompatibilität, Intervalle, Brotkrumen-Navigation, Links zu thematisch passenden Blogartikeln und zurück zur Startseite.
- **JSON-LD `Product` + `Offer`:** `name`, `description`, `image` (absolut!), `brand`, `sku`, `offers` mit `price`, `priceCurrency: "EUR"`, `availability`, `url`, dazu `shippingDetails` (kostenloser Versand ab 50 €) und `hasMerchantReturnPolicy` (14 Tage, `MerchantReturnFiniteReturnWindow`). Die letzten beiden erzeugen die Zusatzzeilen im Google-Snippet.
- **JSON-LD `BreadcrumbList`.**
- `brand` und `publisher` per `@id` auf `https://waxcelerate.de/#organization` verweisen, wie es das Blog-Skript vorbildlich macht. **Keine zweite Marken-Entität aufmachen.**
- `stripHead()` muss greifen, damit Titel, Canonical und `Product`-Schema **der Startseite** aus der Hülle verschwinden. Sonst behauptet jede Produktseite zusätzlich, die Startseite zu sein. `PAGE_SPECIFIC_SCHEMA` enthält `Product` bereits.

**Zwei Sonderfälle:**

1. **Ketten sind zugekauft.** `brand` muss bei `chain-*`-Produkten der Originalhersteller sein (Shimano, SRAM, YBN), nicht Waxcelerate. `generate-merchant-feed.mjs` löst das bereits korrekt, lies dort nach und übernimm die Logik. Niemals „Made in Germany" für Ketten, erlaubt ist „Handgewachst in Stuttgart".
2. **Die beiden Pro-Produkte** (`wax-500-mos2`, `wax-300-mos2`) bekommen zusätzlich `additionalProperty` mit `PFAS-frei` und `PTFE-frei` sowie einen eigenen kurzen Absatz im Body. Begründung und erlaubte Formulierung in `docs/plaene/SICHTBARKEIT_PLAN.md` §3.5. **Für Classic gilt das nicht**, dort steht PTFE offen und ruhig erklärt, siehe `docs/SKILL_PREISE_UPDATE.md`.

### 5.2 Startseite mit Inhalt füllen

`dist/index.html` behält ihren bereits gepflegten Head unverändert und bekommt echten Body-Inhalt in `#root`: genau **ein** `<h1>`, das den Hauptsuchbegriff enthält und nicht nur den Markennamen, eine Einleitung, die Produktliste mit Preisen, Verweise auf `/rewax`, `/starter-set`, `/wissenschaft`, `/blog`.

Formuliere schlank, wie `renderStatic()` es für die festen Seiten tut. Der Rumpf muss nur beschreiben, worum es geht, und verlinken. Sobald React übernimmt, ersetzt die echte Seite ihn ohnehin.

### 5.3 Sechs Rechtstextseiten

`/impressum`, `/datenschutz`, `/agb`, `/widerruf`, `/widerrufsbelehrung`, `/versand-und-zahlung`. Je eigener Titel, eigene Description, eigener Canonical, ein `<h1>` und zwei, drei Sätze Inhalt. **Kein Schema.** Diese Seiten sollen auffindbar und eindeutig sein, mehr nicht.

### 5.4 Build-Kette schließen

`package.json`, Skript `build`. Aktuell läuft nur `generate-blog-html.mjs` mit. Ergänze `generate-product-html.mjs`.

**Wichtige Reihenfolge-Entscheidung:** `generate-sitemap.mjs` und `generate-merchant-feed.mjs` schreiben nach `public/`, müssen also **vor** `vite build` laufen, damit Vite sie nach `dist/` kopiert. Die HTML-Generatoren schreiben nach `dist/` und müssen **danach** laufen. Entscheide bewusst, kommentiere es im `package.json` oder in einem der Skripte, und prüfe im `/tmp`-Build, dass `dist/sitemap.xml` und `dist/google-merchant-feed.xml` wirklich aktuell sind.

### 5.5 Sitemap-Bilder absolut machen

`generate-sitemap.mjs`: Die vier Wachsprodukte liefern relative `<image:loc>` wie `/images/products/classic/classic-4.webp`. Image-Sitemaps verlangen absolute URLs, diese Einträge sind derzeit wertlos. Kleine, isolierte Korrektur.

---

## 6. Wie du dein Ergebnis prüfst

Kein „sieht richtig aus". Diese Prüfungen sind Pflicht und gehören in den Bericht:

1. **`npx tsc --noEmit`** im gemounteten Repo, muss sauber sein.
2. **`/tmp`-Build** nach §2 durchlaufen lassen, muss ohne Fehler enden.
3. **Regressionsprüfung Blog:** Vor deiner Änderung `dist/blog/` aus einem sauberen Build sichern, nach deiner Änderung erneut bauen und **diffen**. Der Blog-Output muss byte-identisch bleiben. Dasselbe für `dist/rewax/`, `dist/starter-set/`, `dist/wissenschaft/`. Wenn sich dort etwas ändert, hast du etwas kaputt gemacht.
4. **Jede neue Seite prüfen**, am besten mit einem kleinen Node-Skript, das über `dist/` läuft und je Datei ausgibt: hat `<title>`, ist der Titel eindeutig, hat genau ein `<h1>`, hat `<link rel="canonical">` mit der korrekten URL, Zeichenzahl in `#root` größer null.
5. **JSON-LD validieren:** Jeden `<script type="application/ld+json">`-Block per `JSON.parse` durchlassen. Muss fehlerfrei sein. Zusätzlich prüfen, dass auf Produktseiten **kein** Startseiten-`Product`-Schema mehr übrig ist.
6. **Preise gegenprüfen:** Jeder Preis im generierten HTML muss exakt dem Wert in `src/lib/data.ts` entsprechen. Schreib die Prüfung als Skript, nicht per Auge.

---

## 7. Harte Regeln

1. **Kein `npm install` im gemounteten Repo.** Nur in `/tmp/wx`. Verstoß zerstört Lucas Entwicklungsumgebung.
2. **Kein Git.** Nicht committen, nicht branchen, nicht pushen. Deine Arbeit bleibt als geänderte Dateien liegen, Luca committet morgen.
3. **Nichts unter `src/pages/`, `src/sections/`, `src/components/` anfassen**, siehe §3.
4. **`PROJECT.md` und `vite.config.ts` nicht anfassen.**
5. **Keine neue Abhängigkeit.** Insbesondere kein `vite-react-ssg`.
6. **Keine Zahl erfinden.** Preise und Intervalle kommen aus `src/lib/data.ts` und `docs/SKILL_PREISE_UPDATE.md`. Bei Widerspruch zum Skill gewinnt `SKILL_PREISE_UPDATE.md`, weil neuer.
7. **Claims-Regeln gelten für jeden Text**, den du erzeugst: keine Superlative, keine erfundenen Testimonials, **keine Gedankenstriche als Satzzeichen**, Du-Form, „Hergestellt in Stuttgart" nur fürs Wachs, „Handgewachst in Stuttgart" für Ketten, nie „Made in Germany" für Ketten.
8. **Titel und Descriptions sind Vorschläge.** Schreib sie, aber markiere im Bericht, dass Luca sie freigeben muss.
9. Bei Unsicherheit über einen Fakt: nicht raten, in den Bericht unter „offene Fragen".

---

## 8. Was du am Ende ablieferst

Ein Bericht im Chat mit:

1. **Was geändert wurde**, Datei für Datei, mit einem Satz warum.
2. **Prüfergebnisse** aus §6, inklusive der Tabelle aus 6.4 über alle Routen.
3. **Diff-Nachweis**, dass Blog und die drei festen Seiten unverändert sind.
4. **Alle vorgeschlagenen Titel und Descriptions** als Liste, damit Luca sie in einem Rutsch freigeben oder korrigieren kann.
5. **Offene Fragen**, falls welche entstanden sind.
6. **Commit-Vorschlag** für Luca: welche Dateien zusammen committet werden sollen, mit fertiger Commit-Nachricht. Beachte, dass parallel andere Änderungen im Baum liegen, die **nicht** mit hinein sollen.

---

## 9. Was ausdrücklich nicht dein Auftrag ist

Damit du nicht abdriftest:

- Keine Design- oder Layoutänderung.
- Keine Claims-Bereinigung an bestehenden Texten (`index.html`, `llms.txt`, `manifest.json`). Das ist Phase 4 und braucht Lucas Entscheidungen zu drei offenen Zahlen.
- Keine neuen Blogartikel.
- Keine Bilder herunterladen oder konvertieren (`sharp` läuft hier nicht, das ist Phase 3 und läuft auf Lucas Mac).
- Kein Merchant Center, keine Search Console, keine Backlinks. Das steht in `docs/aufgaben/LUCA_TODO.md` und gehört Luca.

---

## 10. Startsatz für die Session

> Lies `docs/archiv/SONNET_AUFTRAG.md` vollständig, danach `docs/plaene/SICHTBARKEIT_PLAN.md` §0, §8 und §9 Phase 2, danach `PROJECT.md` und `docs/SKILL_PREISE_UPDATE.md`. Lade das Skill `waxcelerate`.
>
> Arbeite §5 des Auftrags ab, prüfe nach §6, halte §7 strikt ein. Kein Git, kein `npm install` im Projektordner, nichts unter `src/pages`, `src/sections`, `src/components` anfassen.
>
> Liefere am Ende den Bericht nach §8.
