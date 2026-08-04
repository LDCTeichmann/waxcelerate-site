# Sichtbarkeits-Plan v5 — Diagnose, Positionierung, Ausführungsauftrag

**Stand:** 4. August 2026 · Opus 5 · geprüft gegen `origin/main` = `3471d6d`
**Auszuführen von:** Claude Sonnet 5 in einer Cowork-Session
**Ersetzt:** `waxcelerate-seo-fahrplan.md` sowie v2, v3 und v4 dieses Dokuments

> **Sonnet:** §8 sind die Arbeitsregeln, sie haben Vorrang.
> **Luca:** §0 ist der aktuelle Stand und das Einzige, was du sofort tun musst.

---

## 0. Stand 4. August: was blockiert, und was nicht

### 0.1 Der eine Blocker: eine hängengebliebene Git-Sperre

**Der Fix aus §9 Phase 1 ist geschrieben, aber nie committet worden.** Verifiziert am 4. August:

- `origin/main` (das, was Vercel baut) hat `vite.config.ts` weiterhin auf `base: './'`
- die Arbeitskopie hat `base: '/'` samt Kommentar, uncommittet, auf Branch `fix/asset-base-path`
- live gegengeprüft: `/produkt/wax-500/assets/…js` liefert weiterhin `Content-Type: text/html` statt JavaScript

**Ursache, korrigiert gegenüber meiner letzten Einschätzung.** Ich hatte vermutet, das Lock-Problem existiere nur in der Cowork-Einbindung und nicht auf dem Mac. **Das war falsch.** Der Screenshot vom 4. August zeigt dieselbe Meldung im echten Terminal: `Unable to create '/Users/lucateichmann/Claude Playground/waxcelerate-site/.git/index.lock': File exists`. Die Datei ist real und hängt seit einer abgestürzten Git- oder Editor-Sitzung.

Daraus kaskadierte alles Weitere: `git add` und `git commit` scheiterten an der Sperre, `git checkout main` ebenfalls, das anschließende `git merge` meldete deshalb „Already up to date" (es merged den Branch in sich selbst), und `git push origin main` schob am Ende den **veralteten lokalen `main`** (`4af5227`, eine Version hinter `origin/main` = `3471d6d`) und wurde folgerichtig als non-fast-forward abgelehnt.

Es waren also nie zwei Probleme, sondern eines mit vier Folgefehlern.

**Lösung, in `LUCA_TODO.md` Schritt A1 als fertiger Copy-Paste-Block hinterlegt.** Kern: vorher Editoren und Claude-Code-Fenster schließen, dann

```
rm -f .git/index.lock .git/objects/maintenance.lock
```

danach committen und mit `--ff-only` auf `main` zusammenführen.

**Warum ich das nicht selbst mache:** Aus der Cowork-Einbindung heraus ist die Datei nicht löschbar (`Operation not permitted`), und die Sandbox hat keine GitHub-Zugangsdaten. Beides sind harte Grenzen, keine Vorsichtsentscheidung.

### 0.2 Korrektur an meiner eigenen letzten Aussage

In der Sitzung davor habe ich berichtet, `/rewax` sei nicht vorgerendert. **Das war falsch.** Es war ein Cache-Artefakt auf meiner Seite: Ein erneuter Abruf mit angehängtem `?v=2` liefert die korrekte, vollständig vorgerenderte Seite mit eigenem Titel, `<h1>`, Preisen und Zehnerkarte. Dasselbe gilt für `/wissenschaft`. Commit `c4017cc` hat sauber funktioniert.

### 0.3 Verifizierter Ist-Zustand aller Routen

| Route | Vorgerendert | Anmerkung |
|---|---|---|
| `/blog` + 18 Artikel | **ja** | seit 27.07., funktioniert |
| `/rewax` | **ja** | seit `c4017cc`, eigener Titel und Preise im HTML |
| `/starter-set` | **ja** | seit `c4017cc` |
| `/wissenschaft` | **ja** | seit `c4017cc` |
| Startseite `/` | **nein** | `#root` leer |
| 12 × `/produkt/:id` | **nein** | senden zusätzlich den **Canonical der Startseite** |
| 6 Rechtstextseiten | **nein** | |
| `/hero-lab` | **nein** | soll laut Commit `noindex` sein, liefert aber `index, follow`, weil die Markierung clientseitig gesetzt wird |

**Das heißt: Von 22 vorgerenderten Seiten profitiert aktuell keine einzige Besucherin**, weil der Asset-Fehler aus §0.1 auf allen Unterseiten CSS und JavaScript blockiert. Der Blog liefert rohen Text, `/rewax` ebenso. Erst der Commit aus §0.1 macht die bereits geleistete Arbeit sichtbar. Das ist der Grund, warum dieser eine Befehl vor allem anderen kommt.

### 0.4 Was danach noch fehlt, in Reihenfolge

1. **Phase 2**, Startseite und 12 Produktseiten vorrendern (§9). Das ist der eigentliche Sichtbarkeitshebel für Kaufbegriffe, und es ist die Voraussetzung für Google Shopping.
2. **Search Console**, Sitemap einreichen und Indexierung beantragen (§11). Nur du.
3. **Backlinks** (§10). Ohne die bleibt jede technische Verbesserung wirkungslos, weil Google keinen Weg zur Domain hat.

---

## 0a. Neue Befunde vom 4. August

### 0a.1 IndexNow, der schnellste verfügbare Hebel · von mir bereits eingebaut

Google entscheidet selbst, wann es eine neue Domain ernst nimmt, und lässt sich dabei nicht drängen. Bing schon. Über das offene IndexNow-Protokoll lassen sich URLs aktiv anmelden statt auf einen Crawl zu warten, mit Aufnahme typischerweise innerhalb von Minuten bis Stunden.

Der Nutzen geht weit über Bing hinaus: DuckDuckGo bezieht seinen Index von Bing, und **ChatGPT Search nutzt ebenfalls den Bing-Index**. Das ist damit der einzige Weg, kurzfristig überhaupt irgendwo auffindbar zu sein, während Google noch braucht. Für eine Marke, deren `robots.txt` KI-Crawler ausdrücklich einlädt und die eine gepflegte `llms.txt` hat, ist das besonders passend.

**Bereits erledigt von mir, liegt im Repo:**

- `public/74ee22c75cc92464f6fc7d87ee40a1848108c9411d03f5173e05ba74a23fe01f.txt` — der Authentifizierungsschlüssel
- `scripts/ping-indexnow.mjs` — liest die URLs aus `public/sitemap.xml`, prüft vorab, ob die Schlüsseldatei öffentlich erreichbar ist und ob ihr Inhalt passt, meldet dann alle URLs

Bewusst **nicht** in `npm run build` eingehängt, weil der Build auch für Preview-Deployments läuft und Preview-URLs nicht an Suchmaschinen gemeldet werden dürfen. Aufruf nach jedem Produktions-Deploy: `npx tsx scripts/ping-indexnow.mjs`.

Für Luca bleibt nur: Bing Webmaster Tools einmalig verbinden (Import aus der Search Console, keine erneute Domain-Bestätigung nötig) und den Befehl einmal auslösen. Beides in `LUCA_TODO.md` Teil B.

### 0a.2 „Gecrawlt, zurzeit nicht indexiert" ist ein Qualitätsurteil, kein Technikfehler

Wichtig für die Erwartungshaltung: In der deutschen SEO-Praxis gilt dieser Search-Console-Status überwiegend nicht als technisches Problem, sondern als Qualitätssignal. Google hat die Seite gesehen und **entschieden**, sie nicht aufzunehmen. Typische Auslöser sind Thin Content, Duplikate und widersprüchliche Canonicals.

Das passt exakt auf den bisherigen Zustand und erklärt, warum bloßes Warten nichts gebracht hat:

- die Startseite lieferte einen leeren `#root`, aus Googles Sicht eine Seite ohne Inhalt
- die 12 Produktseiten lieferten alle **denselben** Inhalt und **denselben Canonical auf die Startseite**, also zwölf Duplikate
- die vorgerenderten Seiten luden wegen des Asset-Fehlers weder CSS noch JS

Die gute Nachricht daran: Wenn der Status ein Qualitätsurteil über den ausgelieferten Inhalt ist, dann ändert sich das Urteil, sobald der Inhalt da ist. Phase 1 und 2 adressieren genau die drei Punkte oben. Das ist kein Umweg, sondern die Ursache.

### 0a.3 Zwei-Sprachen-Problem: die halbe Textarbeit ist für Suchmaschinen unsichtbar

`useLanguage.tsx` schaltet zwischen Deutsch und Englisch über `localStorage` um, **ohne eigene URL**. `index.html` steht fest auf `<html lang="de">`, `hreflang`-Angaben gibt es keine.

Folge: Sämtliche englischen Inhalte (`titleEn`, `descriptionEn`, `formulaEn`, `highlightsEn`, `bestForEn` und der gesamte englische Teil von `i18n.ts`) sind für Google und für jeden KI-Crawler **nicht existent**. Es gibt keine URL, unter der sie ausgeliefert werden. Das ist beträchtliche Arbeit ohne jede Außenwirkung.

Kein akutes Ranking-Problem für die deutschen Zielbegriffe, deshalb keine Priorität vor Phase 2. Aber eine Entscheidung, die ansteht: entweder englische Routen einführen (`/en/…` mit `hreflang`-Verweisen in beide Richtungen) und damit einen zweiten Markt öffnen, oder den englischen Zweig bewusst als reine Bedienkomfort-Funktion behandeln und nicht weiter ausbauen. Beides ist vertretbar, der Schwebezustand nicht.

### 0a.4 Kleinere technische Punkte

- **Alt-Texte sind sauber.** Von 49 `<img>`-Vorkommen fehlt in genau einem der `alt`, und das ist ein Treffer in einem Codekommentar. Hier ist nichts zu tun, entgegen meiner Annahme in einer früheren Fassung.
- **`/hero-lab`** liefert `index, follow`, obwohl es laut Commit `noindex` sein soll. Die Markierung wird clientseitig gesetzt und kommt nie an. Löst sich mit Phase 1, sollte danach kurz gegengeprüft werden.
- **Startseiten-`<h1>`** liegt in `hero-light.tsx`. Nach Phase 2 muss sichergestellt sein, dass die vorgerenderte Startseite genau ein `<h1>` mit dem Hauptsuchbegriff trägt, nicht nur einen Markennamen.

---

## 1. Was sich seit v3 geändert hat

Drei neue Funde, einer davon wiegt schwerer als der ganze Rest des Dokuments.

**1. Dein eigener Wiederverkäufer rankt für deinen Markennamen, du nicht.** `bikeoptimierung.de` verkauft „Waxcelerate MoS₂ Hot Wax 500 g" für 39,95 € mit vollständigem Google-Produkt-Snippet, inklusive Preis, Verfügbarkeit und Rückgabefrist. Genau das Ergebnis, das dir vorschwebt. Das ist der Beweis, dass es geht, und zugleich der Beleg, dass nicht deine Marke unsichtbar ist, sondern nur deine Website.

**2. Deine Website bewirbt genau das Wort, das Stiftung Warentest zu meiden empfiehlt.** Dazu §3. Das ist der wichtigste Abschnitt in diesem Dokument.

**3. Deine stärkste Preis-Zahl steht nirgends.** Dazu §4.

Alles Technische aus v3 gilt unverändert und steht ab §6.

---

## 2. Der Reseller-Fund und was daraus folgt

`bikeoptimierung.de` läuft auf Shopify und führt:

| Produkt | Preis dort | Dein Preis |
|---|---|---|
| Waxcelerate MoS₂ Hot Wax 500 g | 39,95 € | 34,95 € |
| KMC X12 Aurora, „pre-waxed mit waxcelerate" | 54,90 € | — |
| Heißwachs-Service „mit Waxcelerate Premium Kettenwachs" | 34,90 € | 13,95 € |

Drei Schlüsse daraus, in dieser Reihenfolge wichtig:

**Erstens, ein Backlink liegt auf der Straße.** Sie verwenden deinen Markennamen an acht Stellen als Qualitätsargument, verlinken dich aber nicht. Eine freundliche Bitte, „Waxcelerate" einmal auf `waxcelerate.de` zu verlinken, ideal auf der „Über uns"-Seite als Herstellerangabe, kostet dich eine Nachricht. Sie haben WhatsApp und Instagram offen im Footer. Das ist ein thematisch perfekter Shop-Link von einer Domain, die für deinen Markennamen bereits rankt.

**Zweitens, die Rich Snippets sind kein Zufall.** Shopify liefert `Product`- und `Offer`-Schema serverseitig aus, inklusive `price`, `availability`, `shippingDetails` und `hasMerchantReturnPolicy`. Genau das baut Phase 2 für dich. Deine Rückgabe- und Versandbedingungen stehen bereits in den Rechtstexten, sie müssen nur ins Schema.

**Drittens, ein Preis-Signal, das du beachten solltest.** Dein Rewax kostet 13,95 €, deren Service 34,90 €, Kettenhelden nimmt 39,95 €. Du bist bei einem Drittel des Marktpreises. Das ist entweder ein sehr starkes Argument oder ein Hinweis, dass du zu billig bist. Beides ist möglich, aber es sollte eine Entscheidung sein und kein Zufall. Deren Leistung umfasst Ultraschall, Entfettung, neues Kettenschloss, Prüfprotokoll und Versand in beide Richtungen. Deine `/rewax`-Seite grenzt korrekt ab, dass du geölte Ketten nicht entfettest. Das ist ein anderer Leistungsumfang, also ist ein anderer Preis richtig. Trotzdem: **13,95 € gegen 34,90 € ist ein Faktor 2,5.** Es wäre nicht unehrlich, bei 17,95 € oder 19,95 € zu liegen und immer noch der klar günstigste Anbieter zu sein.

---

## 3. PFAS und PTFE — die wichtigste Erkenntnis

### 3.1 Der Befund

Stiftung Warentest hat am 26. Mai 2025 den Artikel „Schmiermittel für Fahrradketten: Das läuft wie geschmiert – auch ohne PFAS" veröffentlicht. Darin steht wörtlich die Kaufempfehlung:

> Achten Sie beim Kauf darauf, dass die Produkte zum Beispiel explizit als „PFAS-frei", „PTFE-frei" oder „fluorfrei" gelabelt sind.

Und die Warnung, worauf man in Inhaltsstofflisten achten soll:

> In der Liste der Inhaltsstoffe sollten Begriffe wie „Fluoropolymer", „Fluorinated compound" und auch „Teflon" nicht auftauchen.

Namentlich als PFAS-frei bestätigt werden Silca, MSpeedWax, Optimize, R.S.P, FinishLine und Rex. Cyclowax wird als „schreibt es auf der Website" erwähnt. **Waxcelerate kommt nicht vor.**

Jetzt der Abgleich mit deiner Seite. In `src/lib/data.ts` steht bei beiden Classic-Produkten:

```
formula: ['Vollraffiniertes Paraffinwachs', 'PTFE < 1 µm', 'Stearinsäurederivat']
specs:   { Zusammensetzung: 'Paraffin + PTFE' }
```

Und `llms.txt` beschreibt die **gesamte Marke** so:

> Heißwachs für Fahrradketten aus Stuttgart — Paraffinbasiertes Kettenwachs mit PTFE

PTFE ist Polytetrafluorethylen, ein Fluorpolymer, und damit definitionsgemäß ein PFAS. Es ist derselbe Stoff, den Stiftung Warentest unter „Teflon" zum Ausschlusskriterium erklärt.

**Deine Marken-Kurzbeschreibung führt also mit genau dem Begriff, den Deutschlands meistgelesene Verbraucherorganisation als Warnsignal beschreibt.** Und zwar an der Stelle, die KI-Systeme und Crawler zuerst lesen.

### 3.2 Warum das doppelt bitter ist

Du hast das passende Produkt bereits im Sortiment. Die **MoS₂ Pro Edition ist PFAS- und PTFE-frei**, und deine eBay-Listings sagen das auch schon. Auf der eigenen Website führst du dieses Argument nirgends.

Du besetzt also den Begriff, der dir schadet, und lässt den liegen, der dir hilft.

### 3.3 Neu, von Luca: Classic wird reformuliert

Wichtige Information, die den Zeitplan der ganzen Positionierung ändert: **Die aktuelle Classic-Formel enthält noch PTFE, wird aber demnächst umgestellt auf ein anderes Additiv.** Ziel ist, dass langfristig das gesamte Sortiment PFAS- und PTFE-frei ist.

Das ist strategisch sehr stark, aber nur, wenn die Reihenfolge stimmt. Zwei Fragen, die nur du beantworten kannst, bevor Phase 4 und 5 final formuliert werden:

1. **Wie sicher ist der Zeitplan?** Ist die neue Formel bereits validiert und in Testchargen bestätigt, oder noch in der Entwicklung? Der Unterschied entscheidet, ob wir jetzt schon öffentlich „bald PFAS-frei" ankündigen dürfen oder nur intern planen sollten. Eine öffentliche Ankündigung, die sich dann verzögert, kostet mehr Vertrauen, als sie bringt.
2. **Timing der Außenwirkung.** Sobald die Umstellung steht, ist „Waxcelerate ist komplett PFAS-frei" eine der stärksten Aussagen, die eine Kettenwachs-Marke in Deutschland aktuell machen kann, siehe §3.1. Das spricht dafür, die Anfrage an Stiftung Warentest (§10.4) und an speed-ville (§10.5) **nach** der Umstellung zu schicken, nicht davor. Eine ehrliche Zwischenlösung: die Anfrage jetzt mit transparentem Hinweis auf die laufende Umstellung schicken, das ist selbst ein glaubwürdiges Signal, weil es zeigt, dass die Marke aktiv reagiert statt nur zu behaupten.

Bis diese beiden Fragen geklärt sind, gilt für alle Texte aus Phase 4: **die Formulierung „Classic enthält noch PTFE, wird aber umgestellt" ist erlaubt**, aber niemals ein festes Datum ohne deine Bestätigung, und niemals „ist bereits PFAS-frei" für Classic, solange es nicht stimmt.

### 3.4 Was NICHT zu tun ist

Zwei Fehler liegen nahe und wären beide schlecht, auch mit der Reformulierung im Blick.

**Nicht PTFE stillschweigend aus den aktuellen Produktdaten löschen**, solange die alte Formel noch verkauft wird. Es zu verschweigen wäre gegenüber genau der Zielgruppe unehrlich, die deswegen sucht, und es widerspricht dem, wofür die Marke steht.

**Nicht „PTFE wird verboten" behaupten.** Das ist die ausdrückliche Regel aus `30_claims_language.md`, und es ist sachlich falsch. Der Stand des EU-Verfahrens, geprüft für dieses Dokument: Der RAC-Ausschuss der ECHA hat seine Stellungnahme am 3. März 2026 verabschiedet, die SEAC-Konsultation lief bis 25. Mai 2026, die finale ECHA-Bewertung wird Ende 2026 erwartet, eine Kommissionsentscheidung 2027, danach gestaffelte Übergangsfristen. Für Fluorpolymere wurden gezielte Ausnahmen diskutiert, eine vollständige Freistellung wurde aber nicht akzeptiert. Kurz: offen, in Bewegung, kein Verbot. Wer heute etwas anderes behauptet, verliert Glaubwürdigkeit, sobald jemand nachsieht.

### 3.5 Was stattdessen zu tun ist, für die JETZIGE Übergangszeit

Drei Ebenen, alle innerhalb der bestehenden Claims-Regeln.

**Ebene 1, Markenbeschreibung neutralisieren.** In `llms.txt`, `index.html` und im Organization-Schema darf die Marke nicht mehr mit „mit PTFE" beschrieben werden. Richtig ist die Beschreibung der Produktlinie, nicht eines Inhaltsstoffs:

> Heißwachs für Fahrradketten aus Stuttgart. Zwei Formeln: Classic auf Paraffinbasis, MoS₂ Pro Edition PFAS- und PTFE-frei für Winter und Nässe.

Damit erscheinen beide Begriffe, „PFAS-frei" wird zum ersten Mal überhaupt indexiert, und nichts wird verschwiegen.

**Ebene 2, Pro besetzt die Suchbegriffe.** Die beiden Pro-Produktseiten sollen für „PFAS-freies Kettenwachs", „PTFE-freies Kettenwachs", „fluorfreies Kettenwachs" und „Kettenwachs ohne Teflon" ranken. Titel, Beschreibung, `<h1>`, ein eigener Abschnitt, und im Product-Schema eine `additionalProperty` mit `PFAS-frei: ja`. Die im Skill freigegebene Formulierung lautet: „PFAS-frei und zukunftssicher, unabhängig vom Ausgang des EU-Verfahrens." Die passt exakt und ist bereits abgesegnet.

**Ebene 3, Classic bleibt ehrlich und bekommt Kontext.** Die Classic-Seite nennt PTFE weiter, aber eingeordnet statt beworben: lebensmittelzugelassenes Fluorpolymer, bekannt aus Antihaftgeschirr, gebunden in fester Wachsmatrix, und der Hinweis, dass es die Pro-Variante ohne gibt. Ruhig, nicht alarmierend. Das ist genau das Framing, das in `30_claims_language.md` §4 als Option vorgesehen ist, und es macht die Kaufentscheidung für den Kunden leichter statt schwerer.

Damit ist die offene Frage 1 im Skill beantwortet und der in `PROJECT.md` als blockiert vermerkte Blogartikel entsperrt.

### 3.6 Der Artikel, der daraus entsteht

Stiftung Warentest hat die Frage gestellt und ausdrücklich geschrieben, sie könne nicht überprüfen, ob die Fluorverbindungen tatsächlich aus allen Produktpaletten verschwunden sind. Genau da ist eine Lücke, die ein Hersteller füllen kann, der ehrlich ist.

**Vorschlag: „Kettenwachs ohne PFAS: was hinter dem Label steckt".** Inhalt: was PFAS und Fluorpolymere unterscheidet, warum PTFE hineinfällt, wo das EU-Verfahren wirklich steht mit Daten und Quellen, welche Alternativen es technisch gibt, und eine offene Deklaration für beide eigenen Linien. Kein Wettbewerber wird genannt, keine Panik erzeugt.

Das ist der stärkste Artikel, den du schreiben kannst. Er trifft eine aktuell steigende Suchnachfrage, er ist von Stiftung Warentest thematisch vorbereitet, er ist hoch verlinkbar, und deine Ausbildung macht ihn glaubwürdig. Für die Zielgruppe, die „ruhig überlegen" honoriert, ist er obendrein die beste Visitenkarte, die die Marke haben kann.

**Und der zugehörige Zug außerhalb der Website:** Stiftung Warentest schreibt, andere Anbieter hätten nicht geantwortet. Schreib sie an, erkläre in fünf Sätzen den Sortimentsstand, und bitte um Aufnahme in die Liste. Wenn das klappt, steht deine Marke auf `test.de`. Vorlage in §10.4.

---

## 4. Drei verschiedene Zahlen, die nicht verwechselt werden dürfen

Luca hat zu Recht nachgehakt: In v3 stand ein Vergleich, der zwei unterschiedliche Messgrößen so nebeneinanderstellte, als wären sie dieselbe. Das war handwerklich schlampig, und genau dieser Fehler ist es, der in diesem Themenfeld am meisten Schaden anrichtet, siehe die Geschichte der „16.300 km" weiter unten. Deshalb hier sauber getrennt, mit Quelle für jede Zahl.

Es gibt in dieser Kategorie **drei unabhängige Kennzahlen**, die ständig durcheinandergeworfen werden:

| Kennzahl | Frage, die sie beantwortet | Waxcelerate |
|---|---|---|
| **A. Nachwachs-Intervall** | Wie oft muss ich nachwachsen? | 400–550 km trocken |
| **B. Reichweite pro Block** | Wie weit komme ich mit einem Block, über alle Anwendungen? | offen, siehe unten |
| **C. Kettenlaufzeit** | Wie lange hält die Kette selbst, bis sie verschlissen ist? | offen, siehe unten |

Diese drei Zahlen hängen lose zusammen, sind aber **keine Umrechnung voneinander**. Eine Kette überlebt in der Regel mehrere Wachsblöcke. Ein Block-Volumen sagt nichts über die Kettenqualität. Und die Kettenlaufzeit hängt von Material, Belastung und Wartungsdisziplin ab, nicht nur vom Schmiermittel.

### 4.1 Kennzahl A und B im Wettbewerbsvergleich, sauber getrennt

Aus dem speed-ville-Vergleich, wörtlich zitiert:

> Optimize Heißwachs: Menge 375 ± 5 g. **Mögliche Kilometer: 16.000–25.000 / 20–30 Anwendungen.** Wachs alle 800–1.000 km auftragen.

Das ist wichtig: **Optimize selbst nennt „16.000 bis 25.000 km" als Reichweite pro Block** (Kennzahl B), nicht als Kettenlaufzeit. Die Rechnung dahinter: 20 bis 30 Anwendungen mal 800 bis 1.000 km Intervall ergibt in etwa diese Spanne. Optimize macht also offen vor, wie man Kennzahl A in Kennzahl B umrechnet und als Marketingzahl zeigt.

SILCA dagegen schreibt laut derselben Quelle „bis zu 25.000 km **pro Kette**". Das ist Kennzahl C, Kettenlaufzeit, eine andere Frage mit einer anderen Grundlage. Die Zahl sieht der von Optimize zufällig ähnlich, misst aber etwas anderes. **Genau diese beiden Zahlen hatte ich in v3 fälschlich nebeneinandergestellt, als wären sie vergleichbar. Das war falsch, danke für den Einwand.**

Für Waxcelerate lässt sich Kennzahl B genauso ehrlich berechnen wie bei Optimize, sobald die Anwendungszahl pro Block feststeht:

- Skill sagt „1 Block ≈ 15–20 Wachsvorgänge à 400–550 km" → **6.000 bis 11.000 km pro 500-g-Block**
- `data.ts` sagt `applications: '20–32'` → **8.000 bis 17.600 km pro 500-g-Block**

Beide Spannen liegen in ungefähr derselben Größenordnung wie Optimize (16.000–25.000 km bei 375 g), wenn man auf 500 g hochrechnet. Das ist eine **legitime, unangreifbare Marketingzahl im selben Format, das der stärkste Wettbewerber selbst benutzt** — sobald die Anwendungszahl geklärt ist (§12, Punkt 1).

**Die Herkunft der verbotenen „16.300 km" ist damit auch geklärt, und sie ist weniger dramatisch als vermutet.** 32 Anwendungen mal 550 km ergibt 17.600 km, die obere Ecke der `data.ts`-Rechnung. „16.300" liegt genau in dieser Spanne. Das eigentliche Problem war laut `AGENTS.md` nie die Größenordnung, sondern dass die Zahl fälschlich Zero Friction Cycling als Quelle zugeschrieben wurde, einer Quelle, die sie nie veröffentlicht hat. Fabrizierte Attribution, nicht fabrizierte Mathematik. Das bleibt trotzdem verboten, aber aus einem sauberen, nachvollziehbaren Grund, und **Kennzahl B, korrekt als „Reichweite pro Block" benannt und mit eigener Herleitung versehen, ist etwas anderes und darf verwendet werden.**

### 4.2 Kennzahl C, Kettenlaufzeit: die neue Zahl von Luca

Luca schreibt: „meins ist pro waxing cycle aber die Kette hält viel länger dadurch, eher gegen 16.000 bis 20.000 km." Das ist eine Aussage zu Kennzahl C, unabhängig von A und B, und sie liegt deutlich über der aktuell im Skill festgelegten Zahl: „2–3× länger, typisch 6.000–12.000 km" (Decision Log D2, „16.300 nie sagen").

Ich will hier ehrlich sein, weil genau das der Sinn des ganzen Claims-Systems ist, das du selbst aufgebaut hast: **Ich kann diese Zahl nicht von außen bestätigen, und sie liegt zufällig sehr nah an der Zahl, die im Skill explizit wegen einer erfundenen Quellenzuschreibung verboten wurde.** Das heißt nicht, dass sie falsch ist. Hot-wax-Ketten, konsequent gepflegt, können durchaus sehr lange halten, das ist technisch plausibel. Es heißt nur, dass ich sie nicht ungeprüft übernehmen und in den Plan schreiben sollte, ohne zu fragen, worauf sie beruht.

**Frage an Luca, bevor diese Zahl irgendwo landet:** Worauf stützt sich „16.000 bis 20.000 km"? Zum Beispiel:
- eigene Kette(n), über Verschleißlehre (0,5-%-Grenze) gemessen, wie viele und über welchen Zeitraum
- Kundenrückmeldungen, wie viele, wie erhoben
- eine Hochrechnung aus Erfahrungswerten, ohne Einzelmessung

Das ist keine Formalie. **Wenn du eine echte Messung hast, und sei es nur an deiner eigenen Kette, ist das potenziell der stärkste Content-Baustein im ganzen Projekt:** eine dokumentierte, nachvollziehbare Laufleistungsmessung schlägt jede Werbezahl der Konkurrenz, weil niemand sonst in dieser Kategorie öffentlich zeigt, wie er misst. Das wäre ein eigener Artikel wert, mit Fotos der Verschleißlehre und Datum der Messungen. Wenn es dagegen eine Schätzung ist, bleibt vorerst die aktuelle Skill-Zahl (6.000–12.000 km, „2 bis 3×") die einzige, die öffentlich verwendet wird, bis die neue Zahl eine Grundlage hat, die dem Decision-Log-Standard entspricht.

### 4.3 Die eine Zahl, die schon jetzt hundertprozentig sicher ist: Preis pro Gramm

Anders als A, B und C hängt diese Zahl an keiner Annahme über Verbrauch, Fahrstil oder Wetter. Sie ist reine Division aus öffentlich genannten Preisen, erneut geprüft:

| Produkt | Menge | Preis | Quelle | € je 100 g |
|---|---|---|---|---|
| **Waxcelerate Classic** | 500 g | 29,95 € | `data.ts`, von Luca bestätigt | **5,99 €** |
| **Waxcelerate Pro** | 500 g | 34,95 € | `data.ts`, von Luca bestätigt | **6,99 €** |
| SILCA Secret Chain Blend HOT Melt | 500 g | 49,95 € | speed-ville.de, unabhängiger Dritter | 9,99 € |
| Optimize Graphit-Heißwachs | 375 g (±5 g) | 39,99 € | speed-ville.de, unabhängiger Dritter | 10,66 € |
| Optimize Graphen-Heißwachs | 375 g (±5 g) | 79,99 € | speed-ville.de, unabhängiger Dritter | 21,33 € |

Rechnung: 29,95 ÷ 5 = 5,99. 34,95 ÷ 5 = 6,99. 49,95 ÷ 5 = 9,99. 39,99 ÷ 3,75 = 10,664. Nachgerechnet, stimmt.

**Waxcelerate Classic liegt 40 Prozent unter SILCA und 44 Prozent unter Optimize Graphit, bei gleicher oder größerer Füllmenge.** Das ist keine Behauptung, das ist Bruchrechnung mit zwei unabhängig bestätigten Quellen. Anders als bei A, B oder C gibt es hier keine Interpretationsspielraum und keine Annahme, die noch von Luca bestätigt werden müsste. **Diese Zahl ist ab sofort einsetzbar**, unabhängig davon, wie die Fragen in §4.1 und §4.2 ausgehen.

Wichtig zur Ehrlichkeit: Preis pro Gramm ist nicht dasselbe wie Preis pro Kilometer Reichweite. Wenn Optimize pro Anwendung mehr Wachs braucht als Waxcelerate, oder umgekehrt, kann sich das Bild bei Kennzahl B verschieben. Das lässt sich erst sauber berechnen, wenn die Anwendungszahl aus §4.1 feststeht. **Bis dahin wird nur mit „Preis pro Gramm" geworben, nie mit einer daraus abgeleiteten "Preis pro Kilometer"-Aussage.** Das ist der Unterschied zwischen einer bewiesenen und einer vermuteten Zahl, und in diesem Projekt hat sich gezeigt, dass genau diese Vermischung am meisten Ärger macht.

Für die Reichweitenfrage bleibt trotzdem der Absatz sinnvoll, der Werbeversprechen einordnet, ohne jemanden anzugreifen:

> Reichweitenangaben in dieser Kategorie sind oft Bestwerte unter Idealbedingungen. Unser Nachwachs-Intervall von 400 bis 550 km ist ein Alltagswert, gemessen auf normalen Straßen bei normalem Wetter. Wenn du Angebote vergleichst, lohnt sich ein Blick darauf, ob die genannte Zahl ein Intervall, eine Blockreichweite oder eine Kettenlaufzeit ist. Das sind drei verschiedene Dinge.

Das ist zitierfähig, wahr, und es erklärt dem Leser sogar das Problem, das dieser ganze Abschnitt hier löst.

### 4.4 Der Rest der Zahlen im Code, nachgeprüft

| Zahl | Wo | Bewertung |
|---|---|---|
| 400–550 km trocken (Kennzahl A) | Blog, Skill D1 | korrekt und konsistent |
| 200–300 km nass | `llms.txt` | konsistent |
| 100–150 km Streusalz | Winterartikel | plausibel, konsistent |
| 6.000–12.000 km Kettenlaufzeit (Kennzahl C) | `llms.txt`, Skill D2 | aktueller Stand, siehe §4.2 zur möglichen Anpassung |
| „2 bis 3×" Laufzeit | seit `7f2ef51` überall | korrekt, war vorher „3×" |
| **`applications: '20–32'`** (Kennzahl B, Eingabe) | `data.ts` für 500 g | **widerspricht dem Skill** (15–20), §4.1 |
| 16.300 km | eBay, Kleinanzeigen | **verboten per D2**, Grund siehe §4.1 |
| „bis zu 5x länger" | eBay | **überzogen, D2** |
| µ 0,03–0,06 | `index.html` viermal | in `PROJECT.md` selbst als strittig geführt |

---

## 5. Keyword-Architektur

Du hast Begriffe genannt. Hier ist, welche Seite jeweils dafür zuständig ist. Eine Seite pro Suchabsicht, sonst konkurrieren deine eigenen Seiten miteinander.

| Suchabsicht | Zielseite | Was dort stehen muss |
|---|---|---|
| günstiges Kettenwachs · Preis-Leistung | `/produkt/wax-500` | die € je 100 g Tabelle aus §4 |
| PFAS-frei · PTFE-frei · fluorfrei · ohne Teflon | `/produkt/wax-500-mos2`, `/produkt/wax-300-mos2` | §3.5 Ebene 2 |
| deutsches Kettenwachs · lokal produziert · Made in Germany | Startseite plus beide Wachsseiten | „Hergestellt in Stuttgart", nie „Made in Germany" für die Ketten |
| Kettenwachs Stuttgart | Startseite plus Google Unternehmensprofil | Geo-Meta sind schon da |
| Kettenwachs Test · Vergleich | neuer Blogartikel | §4 plus ehrliche Einordnung |
| gewachste Kette kaufen | `/produkt/chain-*` | Phase 2 |
| Kette wachsen lassen · Rewax Service | `/rewax` | Service-Schema, Preisvergleich |
| Heißwachs Anleitung, Intervalle, Winter usw. | 18 vorhandene Artikel | funktionieren bereits, brauchen nur Autorität |

Deine 18 Artikel decken die Informationssuche schon gut ab. Was fehlt, sind exakt die **kommerziellen** Begriffe, und die hängen an Seiten, die Google noch nicht lesen kann. Deshalb ist Phase 2 der Hebel, nicht mehr Content.

Zwei neue Artikel lohnen sich trotzdem, in dieser Reihenfolge:

1. **„Kettenwachs ohne PFAS: was hinter dem Label steckt"** (§3.5)
2. **„Was kostet Kettenwachs wirklich? Preis pro Gramm und pro 1.000 km"** mit der Tabelle aus §4 und der ehrlichen Halbierungsregel

---

## 6. Google Shopping und Rich Snippets

Du hast nach den Produktanzeigen im Screenshot gefragt. Die entstehen aus zwei Quellen, du brauchst beide.

**Quelle 1, `Product`-Schema auf der Seite.** Erzeugt die Preis- und Verfügbarkeitsangabe direkt im normalen Suchergebnis. Das baut Phase 2. Für die Anzeige „Free delivery over €70" und „14-day returns" wie im Screenshot braucht es zusätzlich `shippingDetails` und `hasMerchantReturnPolicy` im `Offer`. Bei dir also: kostenloser Versand ab 50 €, 14 Tage Widerruf. Beides steht in den Rechtstexten und muss nur ins Schema.

**Quelle 2, Google Merchant Center.** Für die kostenlosen Shopping-Einträge. **Das Repo hat den Feed bereits**, `scripts/generate-merchant-feed.mjs` erzeugt `public/google-merchant-feed.xml`. Der Kommentar im Skript nennt die drei fehlenden Schritte, und sie sind alle in deiner Hand:

1. Merchant-Center-Konto für `waxcelerate.de` anlegen und verifizieren
2. Produkte → Feeds → „Geplanter Abruf" auf `https://waxcelerate.de/google-merchant-feed.xml`
3. EU-Besonderheit: Für kostenlose Einträge muss das Konto mit einem Preisvergleichsdienst verknüpft sein, etwa idealo, unter Wachstum → Programme verwalten

Punkt 3 wird gern übersehen und ist der Grund, warum EU-Händler oft keine kostenlosen Shopping-Einträge bekommen.

Ein Hinweis zur Reihenfolge: Merchant Center prüft die Zielseite. Solange `/produkt/wax-500` eine weiße Seite ausliefert, wird der Feed abgelehnt. **Also erst Phase 1 und 2, dann Merchant Center.** Andersherum kostet es nur Ablehnungen.

---

## 7. Das Modell dahinter

Auffindbarkeit hat vier Schichten, sie bauen aufeinander auf.

| Schicht | Frage | Stand | Wo |
|---|---|---|---|
| 1 Erreichbar | Kann ein Crawler laden? | ja, `robots.txt` vorbildlich | erledigt |
| 2 Lesbar | Steht Inhalt im HTML? | nur Blog | Phase 1 + 2 |
| 3 Verstehbar | Weiß Google, was und wie teuer? | kein Product-Schema, falsche Canonicals | Phase 2 + 3 |
| 4 Vertrauenswürdig | Verlinkt jemand? | fast niemand | Phase 6, parallel |

Der typische Fehler ist, bei Schicht 4 anzufangen, weil es sich nach Marketing anfühlt. Links auf eine Seite, die Google nicht lesen kann, verpuffen. Umgekehrt bleibt perfektes HTML ohne Links lange unsichtbar. Deshalb laufen Phase 1 bis 3 und Phase 6 parallel.

---

## 8. Arbeitsregeln für Sonnet

Vorrang vor allen Aufgaben.

**Ablauf**

1. Eigener Branch je Phase, niemals direkt auf `main`.
2. Keine Phase ohne Lucas Freigabe für genau diese Phase.
3. Kein Merge auf `main`, kein Produktions-Deploy ohne ausdrückliche Freigabe im Chat.
4. Vor jedem Branch `git status`. Es liegen ungetrackte Dateien im Baum, die zu anderer Arbeit gehören. Nichts davon eigenmächtig committen.

**Umgebung, größte Gefahr**

5. **Niemals `npm install` oder `npm ci` im gemounteten Repo.** `node_modules` enthält macOS-Binärdateien (`@rollup/rollup-darwin-arm64`, `@img/sharp-darwin-arm64`), die Cowork-Shell ist Linux. Ein Install dort **zerstört Lucas lokale Entwicklungsumgebung.** In Phase 0 verifiziert: `npm run build` bricht in der Cowork-Shell ab.
6. Bauen über **Vercel Preview** (erste Wahl, und die einzige Umgebung, in der sich der Fehler aus §9 Phase 1 überhaupt zeigt). Sonst Luca lokal bauen lassen. Sonst eine Kopie unter `/tmp`. Nie im gemounteten Ordner.
7. Deployment nur über Git, nie `npx vercel --prod`, das hängt bei diesem Projekt reproduzierbar (`AGENTS.md`).
8. `npx tsc --noEmit` läuft in der Cowork-Shell und ist nach jeder Änderung Pflicht.

**Verifizieren**

9. Prerendering wird **am ausgelieferten HTML einer Preview-URL** geprüft, nie am Quellcode.
10. „Direkter Aufruf" heißt URL eintippen oder neu laden, **nicht** von der Startseite klicken. Client-seitige Navigation umgeht den Fehler.
11. Bei Widersprüchen Repo gegen Skill: **für Preise hat aktuell der Code recht**, das Skill ist veraltet (§12). Bei Claims und Intervallen hat das Skill recht.

**Inhalt**

12. Keine Design- oder Layoutänderung in Phase 1 bis 3.
13. Keine URL ändern. Falls unvermeidbar: 301 in `vercel.json` und explizit melden.
14. Keine neue Abhängigkeit ohne Begründung. Insbesondere **kein `vite-react-ssg`**, das Repo hat ein erprobtes eigenes Prerender-Skript.
15. Copy wird vorgeschlagen, nie eigenmächtig live gesetzt. Vorher gegen `30_claims_language.md` und `31_voice_examples.md` prüfen.
16. **Keine Gedankenstriche als Satzzeichen** in Kunden-Copy.
17. **PTFE nicht kommentarlos aus `data.ts` entfernen.** §3.4. Jede Änderung an PFAS- oder PTFE-Aussagen geht als Vorschlag an Luca.
18. Chrome-Toolset und Desktop-Screenshots nur nach Rückfrage. Der eingebaute Browser-Pane ist frei.

---

## 9. Phasen

### Phase 1 — Asset-Fehler beheben · P0, eine Zeile

Branch `fix/asset-base-path`. Bewusst nur diese Änderung.

`vite.config.ts` Zeile 7 steht auf `base: './'`, also relative Asset-Pfade. Von `/produkt/wax-500` aus zeigt `./assets/…` auf `/produkt/assets/…`, das existiert nicht, die Rewrite-Regel liefert HTML, der Browser verweigert das Modul. Luca hat bestätigt: die Seite ist weiß. In Phase 0 geprüft: nichts im Projekt braucht den relativen Pfad.

1. `base: './'` → `base: '/'`. Sonst nichts.
2. `npx tsc --noEmit`.
3. Push, Preview abwarten.
4. **Auf der Preview, direkter Aufruf:** `/produkt/wax-500` und `/blog/kettenwachs-winter`. Lädt CSS? Startet die SPA? Navigation und Warenkorb da? Konsole sauber? Asset-URL direkt abrufen und `Content-Type: application/javascript` bestätigen.
5. `/`, `/blog`, `/rewax`, `/impressum` gegen Live vergleichen, Desktop und mobil.
6. Bericht mit Preview-URL.

**Abnahme:** `/produkt/wax-500` ist beim direkten Aufruf nicht mehr weiß, keine Konsolenfehler, keine sichtbare Abweichung sonst.

> Diese Phase allein behebt einen laufenden Umsatzverlust: Jeder Besucher, der bisher aus eBay, Kleinanzeigen oder einem geteilten Link direkt auf einer Produktseite landete, sah eine weiße Seite.

---

### Phase 2 — Alle Seiten vorrendern

Branch `feat/prerender-seiten`

**Update, Commit `c4017cc`:** Ein Teil dieser Phase ist bereits gebaut, parallel zu diesem Dokument. `/rewax`, `/starter-set` und `/wissenschaft` sind jetzt vorgerendert (in `generate-blog-html.mjs`, Funktion `renderStatic` über eine `STATIC_PAGES`-Liste), und die Sitemap kennt alle drei. Schritt 2 und der `/starter-set`/`/wissenschaft`-Teil von Schritt 5 unten sind damit erledigt, **aber erst wirksam, sobald Phase 1 den Asset-Fehler behoben hat** — diese drei Seiten hängen an derselben `write()`-Hülle wie die Blogartikel und laden ihr CSS/JS aktuell vermutlich genauso wenig wie diese, siehe §12. Prüfen, nicht annehmen.

Weiterhin nicht vorgerendert: Startseite, 12 Produktseiten, sechs Rechtstextseiten. Die Produktseiten senden zusätzlich **den Head der Startseite**, also deren Titel, Canonical und Product-Schema, was für Google wie zwölf Duplikate der Startseite aussieht.

1. `scripts/generate-blog-html.mjs` lesen, inklusive der neuen `renderStatic`/`STATIC_PAGES`-Ergänzung aus `c4017cc`. Prüfen, ob die wiederverwendbaren Teile (`stripHead`, `buildPage`, `metaTags`, `ld`, `esc`, `write`) schon sauber genug faktorisiert sind oder ob ein Auszug nach `scripts/lib/prerender.mjs` weiterhin sinnvoll ist, jetzt mit drei Verbrauchern statt einem. **Blog- und Static-Page-Output müssen danach byte-identisch bleiben.** Vorher `dist/blog/`, `dist/rewax/`, `dist/starter-set/`, `dist/wissenschaft/` sichern, nachher diffen.
2. `/rewax`-Schema ergänzen, falls in `c4017cc` noch nicht geschehen: `Service` plus `Offer` mit 13,95 € und 9,95 € ab drei Ketten, plus der neuen Zehnerkarte aus `docs/SKILL_PREISE_UPDATE.md`, `areaServed` Deutschland, `provider` per `@id`. Prüfen, was schon da ist, nicht doppeln.
3. `scripts/generate-product-html.mjs` neu, Quelle `src/lib/data.ts`, kein Headless-Browser. Je Produkt: eigener Titel und Beschreibung (Vorschlag an Luca), Canonical, Body mit `<h1>`, Beschreibung, Preis, Highlights, Spezifikationen, Kompatibilität, Intervallen, Brotkrumen, Links zu passenden Blogartikeln. Dazu:
   - `Product` plus `Offer` mit `name`, `description`, `image` absolut, `brand`, `sku`, `price`, `priceCurrency`, `availability`, `url`
   - **`shippingDetails`** (kostenloser Versand ab 50 €) und **`hasMerchantReturnPolicy`** (14 Tage) — das erzeugt die Zusatzzeilen im Snippet, siehe §6
   - **Für die beiden Pro-Produkte** zusätzlich `additionalProperty` mit `PFAS-frei` und `PTFE-frei`, plus eigener Abschnitt im Body, siehe §3.5
   - `BreadcrumbList`
   - `brand` und `publisher` per `@id` auf `https://waxcelerate.de/#organization`, keine zweite Marken-Entität
   - `PAGE_SPECIFIC_SCHEMA` anwenden, sonst behauptet jede Produktseite zusätzlich, die Startseite zu sein
4. Startseite: `dist/index.html` behält ihren Head, bekommt echten Body-Inhalt in `#root`.
5. Sechs Rechtstextseiten mit eigenem Titel, Beschreibung, Canonical. Ohne Schema.
6. Alle Generatoren in den Build hängen. **Reihenfolge beachten:** `generate-sitemap.mjs` und `generate-merchant-feed.mjs` schreiben nach `public/`, müssen also **vor** `vite build` laufen, oder auf `dist/` umgestellt werden. Bewusst entscheiden und im Code kommentieren.
7. Push, Preview.
8. **Jede Route auf der Preview prüfen:** eigener Titel, eigenes Canonical, `<h1>`, echter Text. Ein Prüfskript mit Tabellenausgabe ist besser als Stichproben.
9. Produktseiten und `/rewax` durch Googles Rich-Results-Test. Null Fehler.
10. Visueller Vergleich Preview gegen Live, Desktop und mobil.
11. Funktionsprüfung: Warenkorb, Stripe-Einstieg, Sprachumschaltung, Dark Mode, interne Links, 404.

**Abnahme:** Jede Route mit eigenem Titel und echtem Inhalt, Blog-Output unverändert, keine Konsolenfehler, keine visuelle Abweichung, Rich-Results fehlerfrei.

---

### Phase 3 — Sitemap, Schema, Bilder

Branch `fix/seo-daten`

1. `generate-sitemap.mjs`: `/rewax` und `/starter-set` sind laut `c4017cc` bereits ergänzt, kurz verifizieren. `<image:loc>` weiterhin absolut machen. Vier Wachsprodukte haben relative Pfade und sind dadurch wertlos.
2. Kettenbilder von `i.ebayimg.com` auf die eigene Domain. Acht Produkte hotlinken von eBay, diese URLs landen in Sitemap, Schema und Merchant-Feed und brechen, wenn ein Listing endet. Herunterladen, nach `public/images/products/chains/`, WebP (`optimize-blog-images.mjs` ist die Vorlage), `data.ts` umstellen, sprechende Dateinamen. **Sharp läuft nicht in Cowork**, also lokal oder in `/tmp`.
3. Alt-Texte für alle Produktbilder, sachlich. Vorschlag an Luca.
4. `Organization` um vollständige `sameAs`-Liste erweitern. **URLs von Luca.** Das ist zugleich die Abgrenzung gegen „GM LINE Waxcelerate", das Skiwachs von Maplus, das bei der Markensuche mit auftaucht.
5. Interne Verlinkung: Die drei stärksten Artikel auf `/rewax` verlinken, `/rewax` zurück auf beide Wachsprodukte. Interne Links sind der einzige Autoritätshebel, der komplett in deiner Hand liegt.

---

### Phase 4 — PFAS-Positionierung und Claims

Branch `fix/positionierung`. **Inhaltlich die wichtigste Phase.** Jede Textänderung geht als Vorschlag an Luca.

1. **Markenbeschreibung neutralisieren** (§3.5 Ebene 1): `llms.txt`, `index.html` Description und og, Organization-Schema. „mit PTFE" raus, Zwei-Linien-Beschreibung rein.
2. **Pro-Seiten besetzen die PFAS-Begriffe** (§3.5 Ebene 2).
3. **Classic-Seite bekommt Kontext** (§3.5 Ebene 3), ruhig, nicht alarmierend.
4. **Preis pro 100 g** (§4) auf Startseite und beide Wachsseiten, plus der Absatz zur Halbierungsregel.
5. **Claims bereinigen:**

| Datei | Was | Warum |
|---|---|---|
| `index.html` Z. 15, 17, 29 | „200+ Bewertungen … auf eBay" | D11, kanalneutral |
| `public/manifest.json` | „164 Bewertungen … auf eBay" | D11, dritte abweichende Zahl |
| `public/llms.txt` Z. 6 | „200+ eBay-Bewertungen" | D11 |
| `public/llms.txt` Z. 3, 6 | „seit 2024", „gegründet … 2024" | nicht in Body-Copy |
| `index.html` Z. 15, 17, 29, 86 | „Reibungskoeffizient 0,03–0,06" | nur kontextualisiert, in `PROJECT.md` selbst strittig |
| `src/lib/data.ts` | `applications: '20–32'` | widerspricht Skill (§4.1) |
| `src/lib/data.ts` | 62 Gedankenstriche | harte Regel |

Zu den Gedankenstrichen: In „Kettenwachs 500g — Classic" ist der Strich ein Trenner, kein Satzzeichen, und ein Teil der Treffer steht in Code-Kommentaren. **Nicht blind ersetzen**, nach Verwendung trennen und vorlegen.

6. **San José prominenter.** Die Einladung von eBay 2025 auf die Hauptbühne des Seller-Events ist bestätigt und steht bisher nur klein in der Autorenbox unter Blogartikeln. Sie gehört auf Startseite und `/rewax`. Sachlich formuliert, sie trägt sich selbst.
7. **Skill nachziehen:** SRAM-Preise, Rewax-Preise, San José, `chain-m7100`, PFAS-Politik als neue Decision-Log-Zeile, Rewax-Freigabe.

---

### Phase 5 — Zwei neue Artikel

Branch `feat/artikel-pfas-preis`. Erst nach Freigabe der Positionierung aus Phase 4.

1. „Kettenwachs ohne PFAS: was hinter dem Label steckt" (§3.5)
2. „Was kostet Kettenwachs wirklich? Preis pro Gramm und pro 1.000 km" (§4)

Beide über die vorhandene `articles.ts`-Struktur, damit Prerendering, Sitemap und `llms.txt` automatisch mitziehen. Regeln aus `BLOG_PLAN.md` beachten: nur eigene Fotos, keine erfundenen Quellen, keine Zahl ohne belegbare Herkunft.

---

### Phase 6 — Autorität · läuft parallel ab sofort

Lucas Arbeit, siehe §10 und §11. Sonnet liefert Textentwürfe, verschickt nichts.

---

### Phase 7 — Danach

1. **eBay- und Kleinanzeigen-Claims bereinigen.** Dort laufen „16.300 km" (D2 verboten), „bis zu 5x länger", „~0,05" und **„Made in Germany" für Shimano- und SRAM-Ketten**. Letzteres ist ein Herkunftsrechts-Risiko, weil die Ketten der Originalhersteller baut. Diese Texte ranken derzeit besser als deine Website.
2. **Rewax-Preis überdenken** (§2, dritter Punkt).
3. **CRO-Ausbau der Produktseiten:** Sticky Add-to-Cart mobil, Trust-Leiste, Bewertungen am CTA, Bundle-Modul. Erst wenn Traffic ankommt.
4. **Starter-Sets als echte SKUs** in `data.ts`, steht als beauftragt in `PROJECT.md`.

---

## 10. Backlinks, nach Wirkung sortiert

### 10.1 bikeoptimierung.de · neu, am einfachsten

Sie nutzen deinen Markennamen als Verkaufsargument und ranken dafür. Eine Nachricht, WhatsApp oder Instagram stehen offen:

> Hallo, hier ist Luca von Waxcelerate. Schön zu sehen, wie ihr das Wachs einsetzt, der Kettenservice ist sauber aufgebaut.
>
> Eine kleine Bitte: Würdet ihr „Waxcelerate" bei euch einmal auf waxcelerate.de verlinken, zum Beispiel auf der Über-uns-Seite als Herstellerangabe? Das hilft mir gerade sehr, weil die Marke online noch schwer zu finden ist, und für eure Kunden ist es auch praktisch, wenn sie die Datenblätter direkt finden.
>
> Falls ihr Produktfotos oder technische Angaben für eure Seite braucht, schick ich euch die gern in guter Auflösung.
>
> Beste Grüße, Luca (waxcelerate)

Dasselbe bei allen B2B-Partnern: drei in Stuttgart, Erlangen, Salzburg, Wien in Anbahnung. **Nimm die Bitte fest ins Onboarding auf**, dann passiert es automatisch.

### 10.2 Kleinanzeigen-Impressum · Pflicht, sofort, kostenlos

Als gewerblicher Anbieter bist du impressumspflichtig. Unter „Unternehmensseite" → „Rechtliche Angaben" das Impressum inklusive Website-URL hinterlegen. Es erscheint dann automatisch bei **allen** Anzeigen. Rechtlich ohnehin nötig, auf jeder Anzeige sichtbar. **Der einfachste Punkt der Liste.**

### 10.3 eBay „Mich"-Seite

eBay verbietet Links in Artikelbeschreibungen, das solltest du auch nicht testen. Auf der Shop-Info- beziehungsweise „Mich"-Seite sind externe Links ausdrücklich erlaubt. Dort gehört `waxcelerate.de` hin. In der Artikelbeschreibung reicht die Textnennung „Waxcelerate" ohne Link, unverlinkte Markennennungen wertet Google ebenfalls.

### 10.4 Stiftung Warentest · höchste Autorität, echte Chance

Sie schreiben ausdrücklich, andere Anbieter hätten nicht geantwortet. Kontakt über `test.de/kontakt`:

> Betreff: Ergänzung zu „Schmiermittel für Fahrradketten – auch ohne PFAS"
>
> Sehr geehrte Redaktion,
>
> in Ihrem Beitrag vom 26.05.2025 haben Sie Anbieter von Heißwachsen zur PFAS-Frage befragt. Wir waren damals nicht dabei und möchten die Angabe gern nachreichen.
>
> Waxcelerate ist ein Kleinunternehmen aus Stuttgart, das Heißwachs für Fahrradketten in eigenen Chargen herstellt. Wir führen zwei Formeln, und wir unterscheiden dabei bewusst:
>
> Die MoS₂ Pro Edition ist PFAS- und PTFE-frei. Basis ist Paraffin, geschmiert wird mit Molybdändisulfid, also einem metallischen Festschmierstoff.
>
> Die Classic-Linie enthält PTFE. Das weisen wir auf der Produktseite offen aus, statt es zu umschreiben.
>
> Für Rückfragen zu Zusammensetzung oder Herstellung stehe ich gern zur Verfügung, ebenso für Muster.
>
> Beste Grüße, Luca Teichmann, Waxcelerate, Stuttgart

Selbst ohne Aufnahme in den Artikel ist das der richtige Zug: Die Anfrage ist ehrlich, sie unterscheidet zwischen den Linien, und sie beweist genau die Haltung, für die die Marke steht.

### 10.5 speed-ville.de · der stärkste redaktionelle Backlink

Deutscher Rennrad-Blog, WordPress, der Artikel „Welches Kettenwachs fürs Rennrad ist das beste, 6 Anbieter im Vergleich" hat 48.100 Aufrufe und rankt für dein Hauptkeyword. Du kommst nicht vor. Entscheidend: **Optimize hat dort bereits einen Gastbeitrag platziert**, der Kanal ist nachweislich für Hersteller offen. Der Blog arbeitet offen mit Affiliate-Links und sucht Redakteure.

> Betreff: Kettenwachs-Vergleich, Ergänzung aus Stuttgart
>
> Hallo Daniel,
>
> euer Vergleich „Welches Kettenwachs fürs Rennrad ist das beste" ist der Artikel, auf den ich Kunden am häufigsten verweise, wenn sie erst mal verstehen wollen, worum es geht.
>
> Ich stelle in Stuttgart selbst Heißwachs her, in kleinen Chargen, seit 2024. Zwei Formeln, eine für Frühjahr bis Herbst, eine mit MoS₂ für Winter und Nässe. 500 g liegen bei 29,95 €, also bei etwa 6 € je 100 g. In eurem Vergleich liegen die Heißwachse zwischen 10 und 11 € je 100 g.
>
> Zwei Dinge, die ich anbieten kann:
>
> Erstens Testmuster, beide Formeln, kostenlos, ohne Bedingungen. Wenn es euch nicht überzeugt, schreibt das gern genauso.
>
> Zweitens, falls es euch inhaltlich reizt: Seit dem PFAS-Beitrag der Stiftung Warentest fragen mich Kunden ständig, was davon für Kettenwachs eigentlich gilt. Ich könnte einen Gastbeitrag schreiben, der das sauber auseinandersortiert, inklusive offener Deklaration für unsere eigenen beiden Linien. Ohne Wettbewerber zu nennen, es geht um die Sache.
>
> Sag Bescheid, wohin ich die Muster schicken darf.
>
> Beste Grüße, Luca (waxcelerate)

Denselben Ansatz für `rennrad-news.de`, `bike-x.de`, `bavarian-bike.de`, `ride-with-love.bike`, `raddeluxe.com`, `fitfortrails.ch`. **Immer offen als Hersteller auftreten**, verdeckte Eigenwerbung fliegt in deutschen Foren auf und schadet mehr, als sie nützt.

### 10.6 Radforum · du wirst dort schon empfohlen

Im Thread `radforum.de/threads/3164256-kettenwachs` taucht Waxcelerate bereits in Empfehlungen auf, mit dem Hinweis, es sei deutlich günstiger als Optimize und Cyclowax. Organischer Social Proof, den du nicht gekauft hast. Account anlegen, Website ins Profil, **einmal** offen als Hersteller antworten. Vorher die Forenregeln zu Herstellerbeiträgen lesen. Nicht in zehn Threads posten.

### 10.7 Google Unternehmensprofil

Auch ohne Ladenlokal als Dienstleister möglich. Verlinkt auf `waxcelerate.de`, erzeugt einen Eintrag bei der Markensuche und hilft direkt gegen die Verwechslung mit dem Skiwachs.

### 10.8 Kleineres

Velomarkt- und buycycle-Profil auf ein Website-Feld prüfen. Instagram- und Strava-Bio. Preisvergleichsportale, idealo ist ohnehin für Punkt 3 in §6 nötig. IHK-Firmeneintrag Stuttgart. Ein einziges gutes YouTube-Video „Kette wachsen, Schritt für Schritt" mit Link, denn bei Anleitungsfragen zeigt Google Videos prominent und der deutschsprachige Wettbewerb ist dünn.

### 10.9 Was du nicht tun solltest

Keine gekauften Links, keine Linktausch-Netzwerke, keine automatisierten Verzeichniseinträge. Bei einer elf Wochen alten Domain mit sonst null Links fällt ein plötzlicher Schwall billiger Links sofort auf. Zehn ehrliche Links aus dem Radsport schlagen tausend aus Verzeichnissen.

---

## 11. Deine eigene Liste

> **Aufgabenteilung.** Alles, was Code, Text, Schema, Sitemap oder Recherche ist, mache ich. Nur die vier folgenden Kategorien kann ich prinzipiell nicht übernehmen: Git-Push (Zugangsdaten), fremde Konten (Search Console, Merchant Center, eBay, Kleinanzeigen), das Versenden von Nachrichten in deinem Namen, und Aussagen über deine eigenen Messungen und Rezepturen.

**Sofort, blockiert alles andere**

- [ ] **Der Befehlsblock aus §0.1.** Zwei Minuten. Ohne ihn bleibt die gesamte bisherige Arbeit unsichtbar.

**Heute, etwa eine Stunde**

- [ ] **Search Console prüfen.** Unter „Indexierung → Seiten": wie viele URLs sind gültig, wie viele „gecrawlt, zurzeit nicht indexiert"? Unter „Sitemaps": ist `sitemap.xml` eingereicht? Falls nicht, jetzt. **Screenshot von beidem an mich**, das ist die Messgrundlage.
- [ ] **Kleinanzeigen-Impressum** mit URL (§10.2).
- [ ] **eBay „Mich"-Seite** mit Link (§10.3).
- [ ] **bikeoptimierung.de anschreiben** (§10.1), zwei Minuten.
- [ ] **Kimi-Klon prüfen und abschalten:** `https://bffweqay3hca2.kimi.page/` trägt öffentlich den Titel „Waxcelerate" und ist vermutlich ein übrig gebliebener Vorschau-Build.

**Diese Woche**

- [ ] **Stiftung Warentest anschreiben** (§10.4). Höchste Autorität im deutschen Verbraucherumfeld.
- [ ] **speed-ville.de anschreiben** (§10.5).
- [ ] **Google Unternehmensprofil** anlegen.
- [ ] `sameAs`-URLs sammeln: eBay-Shop, Kleinanzeigen, Instagram.
- [ ] Die offenen Punkte aus §12 beantworten.

**Nach Phase 2**

- [ ] Sitemap neu einreichen, dann Startseite, `/rewax` und drei Produktseiten einzeln über „URL-Prüfung" → „Indexierung beantragen".
- [ ] **Merchant Center** einrichten, drei Schritte in §6. Erst jetzt, vorher wird der Feed abgelehnt.
- [ ] Eine Woche später `site:waxcelerate.de` prüfen.

---

## 12. Offen, nur von Luca zu klären

**Update, Commits `c4017cc` und `4af5227`, während dieses Dokument entstand:** Ein Teil dieser Liste hat sich parallel von selbst erledigt. `docs/SKILL_PREISE_UPDATE.md` liegt jetzt im Repo, fertig zum Einfügen ins Skill: Rewax-Preise final (13,95 € / 9,95 € ab drei / 1,80 € Rückversand, dazu eine neue Zehnerkarte für 89,55 €), Zubehörpreise (Aufhängedraht 4,95 €, Quick-Link-Zange 4,95 €), Starter-Set-Logik (15 % unter Einzelpreis-Summe), Wachs-Mengenstaffel (2/3/5 Stück = 5/10/15 %, nur auf Wachs, nie auf Ketten), „Leiser Antrieb" freigegeben, und **PTFE-Politik entschieden: aktiv nennen, mit Antihaft-Vergleich** — deckt sich mit der Empfehlung aus §3.5 Ebene 3 dieses Plans. `chain-dirty.jpg` ist gelöscht, der Dauerrabatt-Badge ist weg. Das war noch nicht in meiner Analyse, weil es entstand, während ich schrieb.

**Wichtig, unverändert offen und jetzt dringender:** `vite.config.ts` steht auf `origin/main` weiterhin auf `base: './'`. Der Asset-Fehler ist nicht behoben, siehe §0.1. Da `c4017cc` das Vorrendern zusätzlich auf `/rewax`, `/starter-set` und `/wissenschaft` ausgeweitet hat, sind jetzt **22 Seiten** vom selben Fehler betroffen: Sie liefern echten Text, aber ohne CSS und JavaScript. Am 4. August verifiziert und unverändert. Phase 1 zuerst.

Tatsächlich noch offen:

1. **Anwendungen pro 500-g-Block:** `data.ts` sagt 20–32, das Skill sagt 15–20 (§4.1).
2. **Kennzahl C, Kettenlaufzeit:** Basis für „16.000 bis 20.000 km" (§4.2). Eigene Messung, Kundenrückmeldung oder Schätzung?
3. **Bewertungszahl:** 200+ oder 164? Und was ist Bewertung, was ist Verkauf? Das Skill sagt „über 500 verkaufte Einheiten".
4. **`chain-m7100`** fehlt in der Preistabelle des Skills.
5. **Produktname:** Skill sagt „MoS₂ Pro Edition", Website sagt „Pro".
6. **`sameAs`-URLs.**
7. **Reibungskoeffizient** in der Meta-Description: streichen, als Spanne mit Kontext, oder durch ein anderes Argument ersetzen?
8. **Classic-Reformulierung** (§3.3): Zeitplan, Validierungsstatus, Timing der Außenwirkung.

**Bereits geklärt:** SRAM Force 39,95 € und NX Eagle 44,95 € · Rewax-Preise inkl. Zehnerkarte · Zubehör- und Staffelpreise · San José bestätigt · Rewax live · PTFE wird aktiv genannt (Skill-Update liegt bereit) · „Leiser Antrieb" freigegeben · Rewax-Preis bewusst niedrig, keine Anhebung nötig (durch die Zehnerkarte ohnehin ein anderes Modell als in §2 angenommen).

---

## 13. Erwartung, ehrlich

| Zeitpunkt | Was passieren sollte |
|---|---|
| nach Phase 1 | `/produkt/wax-500` ist beim Direktaufruf nicht mehr weiß |
| nach Phase 2 | Roh-HTML jeder Route hat echten Inhalt, Rich-Results fehlerfrei |
| 3 bis 14 Tage nach Einreichung | erste eigene Seiten bei `site:waxcelerate.de` |
| 2 bis 6 Wochen | Suche nach „waxcelerate" findet dich, braucht am wenigsten Autorität |
| 4 bis 12 Wochen | erste Blogartikel ranken für Long-Tail-Fragen |
| 3 bis 9 Monate | Kaufbegriffe wie „Kettenwachs günstig", hängt fast ausschließlich an §10 |

Wenn nach vier Wochen bei `site:waxcelerate.de` nichts erscheint, obwohl Phase 2 live und die Sitemap eingereicht ist, stimmt etwas anderes nicht. Dann melden, das wäre ein neuer Befund.

**Der unterschätzteste Hebel:** Deine `robots.txt` lädt GPTBot, ClaudeBot, PerplexityBot und CCBot ausdrücklich ein, und `llms.txt` ist gepflegt. Diese Crawler führen kein JavaScript aus. Für sie existieren Produktseiten, `/rewax` und `/starter-set` heute schlicht nicht, und die Marke ist dort mit „Kettenwachs mit PTFE" beschrieben. Nach Phase 2 und 4 existieren die Seiten, und die Beschreibung nennt „PFAS-frei". In dieser Kategorie ist der Wettbewerb um Sichtbarkeit in KI-Antworten noch fast leer.
