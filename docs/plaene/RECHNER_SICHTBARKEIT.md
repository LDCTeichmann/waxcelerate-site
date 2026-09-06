# Rechner-Sichtbarkeit — Diagnose, Konzept, Red-Team

**Stand:** 2026-09-06 · Sonnet 5 · geprüft gegen den Arbeitsbaum auf `chore/repo-schlankheit`
**Auftrag:** Warum werden die Rechner (`/rechner`, `/rechner/:slug`) nicht gefunden — bei
Google *und* bei KI-Antwortmaschinen — und wie ändert man das? Konzept + Red-Team.
**Verwandt:** `docs/plaene/SICHTBARKEIT_PLAN.md` (Gesamt-SEO, v5, teils überholt),
`docs/plaene/GESAMTUEBERSICHT.md`.

Dieses Dokument ist das Kapitel, das im Sichtbarkeitsplan fehlt, weil die
`/rechner`-Seiten erst nach dessen letztem Stand (04.08.) entstanden sind
(~09/2026).

---

## 0. Kurzfassung

Die Technik ist da: prerenderte `/rechner`-Seiten mit Antworttext, `SoftwareApplication`-
und `BreadcrumbList`-Schema, Sitemap-Einträge, `robots.txt` lädt KI-Crawler ein,
`llms.txt`/`llms-full.txt`, IndexNow. **Was fehlt, ist nicht mehr Technik, sondern
drei Dinge:** (1) die interne Verlinkung zeigt auf einen Anker ohne Substanz statt
auf die rankfähigen Seiten, (2) der wörtliche Suchbegriff steht nirgends in Titel/
Überschrift, (3) für die KI-Zitierbarkeit fehlt frage-förmiges Q&A im HTML und im
Schema. Alles drei ist On-Site lösbar. **Der eigentliche Ranking-Blocker — kaum
Backlinks, junge Domain — ist es nicht**, und daran ändert kein Code etwas allein.

---

## 1. Diagnose — warum nichts gefunden wird

Nach Gewicht sortiert:

### 1.1 Alter und Autorität (der wahre Blocker, nicht durch Code lösbar)

Die `/rechner`-Seiten sind Wochen alt. Für eine junge Domain mit fast null
Backlinks ist der Search-Console-Status „gecrawlt, zurzeit nicht indexiert" ein
**Qualitäts-/Vertrauensurteil**, kein Technikfehler — genau so für die
Produktseiten in `SICHTBARKEIT_PLAN.md` §0a.2 dokumentiert. Google hat die Seite
gesehen und *entschieden*, sie (noch) nicht aufzunehmen. Das ändert sich, wenn (a)
der Inhalt eindeutig eine Suchabsicht bedient und (b) irgendwer von außen darauf
verlinkt.

### 1.2 Interne Verlinkung zeigt auf die falsche URL

- Blog-Artikel verlinken den Rechner als `/#tools`
  (`scripts/generate-blog-html.mjs`, `a.linksToCalculator` → `<a href="/#tools">`).
- Die Startseiten-Sektion verlinkt „Alle Rechner ansehen" ebenfalls auf `#tools`
  bzw. `/rechner` (prüfen: `src/sections/tools.tsx`).
- `/#tools` ist ein Anker auf eine JS-gerenderte Sektion. Im Roh-HTML steht dort
  nichts Rankbares. Der interne Link-Saft — der einzige Autoritätshebel, der ganz
  in eigener Hand liegt — fließt also an den `/rechner`-Seiten vorbei.

### 1.3 Kein Head-Term in Titel / H1 / H2

Getippt wird „kettenwachs rechner", „kettenwachs planer", „rewax rechner",
„kettenverschleiß messen", „kettenlänge berechnen", „wann kette neu wachsen".

- Hub-`<title>`: „Fahrrad-Rechner: Verschleiß, Kettenlänge, Intervall und Kosten"
- Hub-`<h1>`: „Rechner rund um die Fahrradkette"
- Startseiten-Sektion: „Rechner & Planer"

„Kettenwachs" kommt in keinem davon vor. Die Einzelseiten-Titel sind besser
(fragenförmig), aber der Hub — die Seite, die für den Oberbegriff ranken müsste —
benennt ihn nicht.

### 1.4 Schema-Lücken für die KI-Zitierbarkeit

Recherche-Stand 2026: Google zeigt keine FAQ-Rich-Results mehr, **aber ChatGPT,
Perplexity, Claude und Google-AI-Overviews lesen `FAQPage`-Markup weiterhin zur
Antwort-Extraktion.** Strukturierte Daten ranken nicht direkt, sind 2026 aber der
Unterschied zwischen Inhalt, den ein LLM raten muss, und Inhalt, den es
verifizieren und zitieren kann.

Fehlt aktuell:
- `WebApplication`-Typ (nur `SoftwareApplication` — beide sind gültig, `WebApplication`
  ist der spezifischere und für „online tool" der klarere).
- `FAQPage` mit 3–5 Q&A je Tool-Seite, Fragen = reale Suchphrasen.
- Sichtbarer Q&A-Block im prerenderten Body (nicht nur Fließtext-Absätze).
- `HowTo` auf `/rechner/verschleiss` und `/rechner/kettenlaenge`.
- Hub: eine `ItemList` der 6 Tools (zusätzlich zur `CollectionPage`).

Der Kommentar in `generate-blog-html.mjs:415-417` begründet die FAQ-Auslassung mit
den abgeschalteten Rich-Results — das war für den Google-Hebel richtig, verkennt
aber den KI-Hebel. **Kehrt sich mit diesem Konzept um.**

### 1.5 Die Startseite führt nicht zu den Rechnern

`scripts/generate-home-html.mjs` füllt `<div id="root">` mit einem `<noscript>`-
Textkörper (h1 + Produktlisten + Links zu `/kette-wachsen-lassen`, `/starter-set`,
`/wissenschaft`, `/blog`). **Die Rechner kommen darin nicht vor.** Die
meistverlinkte Seite der Domain leitet Crawler nicht zu `/rechner`.

### 1.6 `llms.txt` — Rechner gelistet, aber ohne die harten Zahlen

`scripts/generate-llms-txt.mjs` listet die 7 Rechner-URLs bereits (`## Rechner`),
und `llms-full.txt` hat je Tool `h1` + `lead` + `answer[]`. Was fehlte: die
Kernzahlen als kompakte Tabelle direkt in `llms.txt` — Intervalltabelle
(Wetter × Gelände), Verschleißgrenzen, Kettenlängenformel. Fragt eine KI „wann
rewaxen", soll die Antwort ohne Umweg über `llms-full.txt` dastehen.
**Erledigt** (s. §2.4).

---

## 2. Konzept — On-Site (im Repo umsetzbar)

### 2.1 Interne Verlinkung (größter Hebel hier)

| Von | Bisher | Neu |
|---|---|---|
| Blog-Artikel mit `linksToCalculator` | `/#tools` | `/rechner/intervall` (Text passt: „dein eigenes Intervall") |
| Startseiten-Sektion `tools.tsx` | `#tools` / `/rechner` | `/rechner` (bleibt), zusätzlich die Karten-Deckel auf `/rechner/:slug` verlinken statt nur aufzuklappen — optional |
| Einzelne Blog-Artikel, thematisch | — | kontextueller Inline-Link auf den passenden Rechner (Winter → `/rechner/intervall`, „vorgewachste Kette" → `/rechner/passende-kette`, …) |
| `/produkt/*`, `/wissenschaft`, `/kette-wachsen-lassen` | — | je ein Link auf den thematisch passenden Rechner |
| Startseiten-`<noscript>` (`generate-home-html.mjs`) | — | Absatz „Rechner" mit den 7 Links |

`/#tools` bleibt als Anker bestehen (Alt-Links, QR-Codes im Paket zeigen ohnehin
schon auf `/rechner/intervall?w=…`, `toolState.ts:6`).

### 2.2 Titel / Überschriften — je eine natürliche Nennung

- `TOOLS_HUB.title` (`src/lib/toolRegistry.ts`): den Oberbegriff aufnehmen, z. B.
  „Kettenwachs-Rechner & Kettenpflege-Planer: Verschleiß, Länge, Intervall, Kosten".
- `TOOLS_HUB.h1`: „Kettenwachs-Rechner & Planer für die Fahrradkette" (statt
  „Rechner rund um die Fahrradkette").
- `src/lib/i18n.ts` `tools.title` (Startseiten-Sektion): Eyebrow „Kettenwachs" +
  Titel „Rechner & Planer" — oder Titel „Kettenwachs-Rechner & Planer".
- Jede `/rechner/:slug`-Seite: die Nebenfrage(n) als sichtbare `<h2>` unter dem
  `<h1>` (die Fragen aus dem geplanten FAQ-Block, s. u.).

Kein Stuffing: eine Nennung in Titel, eine in H1, der Rest bleibt Fragesprache.

### 2.3 Schema-Ausbau

Beide Pfade gleich halten — Prerender (`generate-blog-html.mjs`, `renderTool`/
`renderToolsHub`) und React-Helmet (`src/pages/RechnerPage.tsx`) — beide aus
`toolRegistry.ts` gespeist.

- Jeden Rechner als `['SoftwareApplication', 'WebApplication']` typisieren, plus
  `browserRequirements: 'Requires JavaScript'`, `featureList`.
- **`FAQPage`** je Tool-Seite: 3–5 `Question`/`Answer`. Fragen = Suchphrasen,
  Antworten = 1–2 Sätze **wörtlich/nah aus `t.answer[]`** (bereits geprüfte Copy —
  keine neuen Zahlen, keine neuen Claims). Q&A **auch sichtbar** im Body rendern,
  aus derselben Datenquelle.
- `HowTo` auf `verschleiss` (Messen mit Lineal/Lehre) und `kettenlaenge`.
- Hub: `ItemList` der 6 Tools mit `url` + `description`.
- `@id`-Referenzen weiter auf `https://waxcelerate.de/#organization`.

**Content für den FAQ-Block** kommt in `toolRegistry.ts` als `faq: {q, a}[]` je
Tool, gezogen aus den vorhandenen `answer`-Sätzen. Muss vor dem Live-Gang gegen
`30_claims_language.md` (im `waxcelerate`-Skill) geprüft werden.

### 2.4 `llms.txt` — Kernzahlen ergänzt · ERLEDIGT

`scripts/generate-llms-txt.mjs`, `## Rechner`-Abschnitt: unter der URL-Liste jetzt
als Text
- Rewax-Intervall-Tabelle (trocken/gemischt/nass × Straße/Gravel/MTB, aus
  `data.ts` `waxIntervals`),
- Verschleißgrenzen 0,5 % (11-/12-fach) / 0,75 % (9-/10-fach) / 1,0 % (5–8-fach),
- Kettenlängenformel.

### 2.5 Sitemap

Rechner-Routen sind drin (`generate-sitemap.mjs:66`). Nach den Content-Änderungen
`lastmod` frisch stempeln lassen. Keine `priority`-Spielereien.

---

## 3. Konzept — Off-Site (nur Luca)

Reihenfolge nach Wirkung/Aufwand:

1. **Search Console:** die 7 `/rechner`-URLs einzeln per URL-Prüfung →
   „Indexierung beantragen". Kostet 10 Minuten, ist der direkteste Anstoß.
2. **IndexNow nach dem nächsten Deploy:** `npx tsx scripts/ping-indexnow.mjs`
   (Skript liegt bereit). Bing-Index ⇒ auch ChatGPT-Search.
3. **Ein Backlink, der auf der Straße liegt:** `bikeoptimierung.de` nutzt den
   Markennamen als Qualitätsargument, verlinkt aber nicht
   (`SICHTBARKEIT_PLAN.md` §2). Freundliche Nachricht, Bitte um einen Link auf
   `waxcelerate.de`.
4. **2–3 echte Community-Antworten** (r/Fahrrad, Rennrad-News-Forum,
   MTB-News-Forum) auf reale Fragen — „wann muss ich meine Kette neu wachsen",
   „wie messe ich Kettenverschleiß" — die auf **den konkreten Rechner** verlinken,
   nicht auf die Startseite. Keine Spam-Postings, echte hilfreiche Antworten mit
   dem Rechner als einer von mehreren Quellen.
5. **Google-Unternehmensprofil** fertig ausfüllen (steht in
   `GESAMTUEBERSICHT.md`).

---

## 4. Red-Team des Konzepts

**„Schema rankt nicht."**
Stimmt. Schema ist notwendig, nicht hinreichend. Der Ranking-Blocker ist Autorität
(1.1). Die On-Site-Arbeit ist die *Voraussetzung* und wirkt sofort auf Long-Tail
und KI-Zitat; Seite 1 für einen umkämpften Oberbegriff ist ein 2–4-Monats-Spiel
und braucht §3. Erwartung so setzen — sonst enttäuscht das Ergebnis, obwohl die
Arbeit richtig war.

**„FAQPage kann als Spam / Thin Content gewertet werden."**
Nur bei dünnem oder dupliziertem Q&A. Gegenmittel: je Seite höchstens 5, jede
Frage inhaltlich eigenständig, Antworten aus dem bestehenden Fachtext, nichts
erfunden. Der Nutzen (KI-Extraktion + Entity-Klarheit) überwiegt das Risiko
deutlich, solange die Qualität stimmt.

**„Head-Term in Titel + H1 = Keyword-Stuffing."**
Deshalb genau eine natürliche Nennung je Ort. Die aktuellen Titel sind ohnehin
schon nah dran; es ist eine Präzisierung, kein Zupflastern.

**„Interne Links umbiegen bricht Bookmarks / QR-Codes."**
`/#tools` bleibt als Anker erhalten. Nur die *kanonischen* internen Referenzen
wandern auf `/rechner/*`. Die QR-Codes im Paket zeigen bereits auf
`/rechner/intervall?w=…`.

**„Hat ‚Kettenwachs Rechner' überhaupt Suchvolumen?"**
Wenig. Die größere Chance ist (a) der fragenförmige Long-Tail und (b) die
KI-Referenz: fragt jemand eine KI „wann muss ich rewaxen", soll sie den Rechner
als Quelle greifen. Dafür zählt prerenderte Q&A-Substanz + Schema +
Drittnennungen, nicht das exakte Oberbegriff-Volumen.

**„KI-Crawler ignorieren `llms.txt`."**
Teilweise wahr — Google sagt ausdrücklich, es nutzt `llms.txt` nicht; die Adoption
ist niedrig. `llms.txt` ist billige Absicherung, kein Haupthebel. Der echte
KI-Zitat-Hebel ist sauberes prerendertes Q&A + Schema + Zitierbarkeit anderswo.
`llms.txt` trotzdem pflegen, weil quasi kostenlos.

**„Doppelte Schema-Pfade (Node-Prerender + React-Helmet) driften auseinander."**
Reales Repo-Risiko. Beide Stellen aus `toolRegistry.ts` speisen; ein kleiner
Build-Check (prerendertes JSON-LD vs. Helmet-Ausgabe einer Tool-Seite diffen)
hält sie zusammen.

**„Was, wenn die FAQ-Copy einen verbotenen Claim enthält?"**
Deshalb: jede Antwort wörtlich/nah aus den bereits geprüften `answer`-Sätzen, und
vor Live-Gang ein Durchgang gegen `30_claims_language.md`. Keine neue Zahl, kein
neuer Vergleich in der FAQ.

**„Reihenfolge-Falle: Backlinks auf eine noch nicht indexierte Seite verpuffen."**
Nicht ganz — ein Link ist auch ein Crawl-Pfad. Aber die Wirkung ist größer, wenn
die Zielseite schon sauberen Inhalt + Schema hat. Also: §2 zuerst (ist schnell),
§3.1/3.2 direkt danach, §3.3/3.4 parallel.

---

## 5. Reihenfolge

1. **§2.1 + §2.2 + §2.4 + §1.5-Fix — ERLEDIGT (2026-09-06):**
   - Blog-`linksToCalculator` → `/rechner/intervall` (`generate-blog-html.mjs`).
   - Startseiten-Sektionstitel → „Kettenwachs-Rechner & Planer" (`i18n.ts`).
   - `TOOLS_HUB.title` / `.h1` mit Head-Term (`toolRegistry.ts`).
   - `llms.txt`: Kernzahlen-Tabellen im `## Rechner`-Abschnitt.
   - `generate-home-html.mjs`: `<noscript>`-Body bekommt einen Abschnitt
     „Kettenwachs-Rechner" mit den 7 Links.
   - Offen aus dieser Gruppe: kontextuelle Inline-Links in einzelnen
     Blog-Artikeln; Links von `/produkt/*`, `/wissenschaft`,
     `/kette-wachsen-lassen`; Footer-„Rechner" ggf. auf `/rechner` (Route) statt
     `#tools`-Anker.
2. **§2.3** — Schema + sichtbarer FAQ-Block. Braucht `toolRegistry.ts`-`faq`-Feld,
   einen Build und den Google-Rich-Results-Test. FAQ-Copy von Luca gegenlesen.
   Noch nicht angefangen.
3. **§3** — Lucas Off-Site-Schritte, parallel ab sofort.

## 6. Verifikation (§2.3)

`npm run build` (lokal oder Vercel-Preview, **nicht** im gemounteten Repo —
`sharp`). Am gebauten HTML:
1. `/rechner` + jede `/rechner/:slug`: eigener `<title>` mit Head-Term, genau ein
   `<h1>`, sichtbarer FAQ-Block im Body.
2. Google Rich-Results-Test / Schema-Validator: `WebApplication` + `FAQPage` +
   `BreadcrumbList` fehlerfrei.
3. `grep` im `dist/`: kein Blog-Artikel verlinkt mehr `/#tools` als Haupt-CTA.
4. `dist/llms.txt` enthält den `## Rechner`-Abschnitt mit URLs + Zahlen.
5. `dist/index.html` `<noscript>` erwähnt die Rechner mit Links.
6. Prerender-JSON-LD vs. Helmet-JSON-LD einer Tool-Seite diffen — gleiche Fakten.
