# Blog "Die Werkstatt" — Stand und Konzept

Stand: 2026-07-27 · Branch `feat/blog-aeo` · ersetzt die Planversionen v1/v2,
weil deren technischer Teil inzwischen umgesetzt ist.

---

## 1. Was jetzt steht

| Bereich | Vorher | Jetzt |
|---|---|---|
| Sichtbarkeit für Crawler | jede URL lieferte roh den Startseitentitel und `<body><div id="root"></div></body>` | 19 Seiten statisch vorgerendert, eigener Titel, OG-Tags, Volltext |
| Strukturierte Daten | Blogseiten trugen das `Product`-Schema der Startseite inkl. `AggregateRating` | nur passendes Schema, alle Artikel auf **eine** Marken-Entität per `@id` |
| Geteilte Links | zeigten überall Startseitenbild und -titel | eigenes Bild und eigener Text pro Artikel |
| Zahlen in den Artikeln | teils erfunden, teils widersprüchlich, eine Quellenangabe falsch zugeschrieben | gegen ZFC, Park Tool, Tribologie-Literatur und die interne Technik-KB geprüft |
| Bilder | ein KI-Bild, ein Fremdbild mit englischer Kritzelei, mehrere Dubletten | 10 von 18 Artikeln auf echten Fotos aus dem eigenen Bestand |
| Weg zum Produkt | ein nackter Textlink | Produktkarte mit Bild, Preis und Bezug zum Artikel |
| Kurzfassung | 11 von 18 | 17 von 18 |

---

## 2. Wofür der Blog eigentlich da ist

Drei Aufgaben, in dieser Reihenfolge:

1. **Bei einer konkreten Frage gefunden werden**, in der Google-Suche wie im
   KI-Assistenten. Das entscheidet sich an einer Sache: Steht im Artikel eine
   überprüfbare Zahl mit Einheit, die man zitieren kann? "Oft deutlich länger"
   wird nie zitiert, "6.000 bis 12.000 km gegenüber 2.000 bis 3.000 km" schon.
2. **Als Marke erkannt werden, nicht nur als Textquelle.** Deshalb der
   `@id`-Verbund: Jede Aussage aus jedem Artikel zahlt auf denselben
   Organization-Knoten ein, der `sameAs` auf den eBay-Shop trägt. Ohne das sind
   es 18 anonyme Publisher-Strings.
3. **Den Leser nicht verlieren.** Wer sieben Minuten über Kettenverschleiß
   liest, ist die interessierteste Person auf der Seite. Dafür die Produktkarte.

Was der Blog **nicht** leisten kann: sich direkt in Trainingsdaten schreiben.
Das ist Folge davon, zitiert und verlinkt zu werden, kein Schalter.

---

## 3. Redaktionsregeln, die ab jetzt gelten

- **Jede Zahl hat eine Quelle.** Entweder die interne Technik-KB, ein benannter
  Prüfstand oder eine Herstellerangabe. Wenn keine davon greift: keine Zahl,
  sondern eine ehrliche Größenordnung.
- **Niemandem etwas in den Mund legen.** Der schwerste Fund dieser Runde war
  eine Laufleistung, die Zero Friction Cycling zugeschrieben wurde und die ZFC
  so nie veröffentlicht hat. Für eine Marke, die auf Ehrlichkeit baut, ist das
  der teuerste Fehlertyp überhaupt.
- **Verbindliche Zahlen schlagen guten Text.** Decision Log D1 legt das
  Intervall auf 400–550 km fest und verbietet "600". Solche Festlegungen sind
  nicht verhandelbar, auch wenn ein runderer Wert schöner klänge.
- **Keine Formelprozente, keine Superlative.** Steht in der Claims-Tabelle,
  gilt auch im Blog.
- Jede H2 ist die Frage, die jemand googelt. Der erste Satz darunter ist die
  Antwort. Danach die Erklärung.

---

## 4. Was ich als Nächstes bauen würde

Nach Wirkung sortiert, nicht nach Aufwand.

**1. Die Rewax-Seite `/rewax`.** Weiterhin die größte unbesetzte kommerzielle
Lücke. Es gibt einen sichtbaren Wettbewerb (Kettenhelden, Rydewax,
wewaxanychain, speedwax) zwischen 64 und 150 €, du machst den Service in
Stuttgart und Leipzig, und es gibt dafür keine indexierbare Seite. Das Foto
dafür liegt bereit (`chain-ybn-mailer`).

**2. Das Wachs-Logbuch.** Eine laufend ergänzte Tabelle echter
Verschleißmessungen: Kettenmodell, km, Dehnung, Bedingungen. Nach diesem
Fact-Check bin ich noch überzeugter davon. Der Grund: Alle Zahlen im Blog sind
jetzt korrekt, aber sie stammen von anderen. Eigene Messreihen wären das
Einzige, was ein Wettbewerber nicht abschreiben kann, und genau das, was
Antwortmaschinen bevorzugt zitieren.

**3. Die zehn dünnen Artikel auf 900 bis 1200 Wörter.** Sie sind jetzt
faktisch sauber, aber weiterhin zu kurz, um gegen tour-magazin.de oder den
ADAC zu ranken.

**4. FAQ-Blöcke.** 17 von 18 Artikeln haben noch kein `faq[]`. Das ist nach
den Takeaways das zweite Format, aus dem Antwortmaschinen direkt extrahieren.

**5. Sticky-Inhaltsverzeichnis** auf der Artikelseite (Desktop). Verlängert die
Verweildauer und gibt einer KI die Gliederung mit.

**6. Pillar-Seite und Lexikon**, wie in der Vorversion beschrieben.

---

## 5. Was Luca entscheiden muss

- **`applications: '20–32'` in `src/lib/data.ts`** widerspricht Decision Log D2
  ("1 Block ≈ 15–20 Wachsvorgänge"). Ich habe die Blog-Artikel auf 15–20
  gezogen, die Produktseiten aber nicht angefasst, weil das Shop-Copy ist.
  Eine der beiden Zahlen ist falsch.
- **Reibungskoeffizient 0,03–0,06 / 0,05–0,07.** Steht in `data.ts` und
  `llms.txt`. Ich konnte keine öffentliche Quelle finden, die
  Reibungskoeffizienten für Kettenschmierstoffe in dieser Form ausweist,
  Prüfstände berichten Watt. Der zusätzlich im Blog stehende Wert "0,15–0,25"
  für Nassöl war nicht belegbar und ist entfernt. Wenn die Werte aus einer
  eigenen Messung stammen, gehören sie mit Methode in die Technik-KB. Wenn
  nicht, sollten sie auch aus den Produktseiten verschwinden.
- **Classic gegen Pro im Trockenintervall.** Die Artikel behaupteten getrennte
  Bereiche (250–450 gegen 300–550), die Technik-KB kennt nur eine Zahl. Ich
  habe die Differenzierung dorthin verschoben, wo sie belegbar ist: Nässe,
  Schotter, hohe Last. Wenn es einen echten Unterschied im Trockenintervall
  gibt, gehört er dokumentiert.
- **PTFE- und PFAS-Sprachpolitik**, blockiert weiterhin einen der wertvollsten
  geplanten Artikel.

---

## 6. Bilder

`public/images/blog/manifest.json` ist die Zuordnung. Der Ordner ist ein
Arbeitsordner: Rohdateien und private Fotos liegen dort, sind aber gitignored.
Ausgeliefert werden nur die generierten `-1600.webp` und `-800.webp`.

```bash
npx tsx scripts/optimize-blog-images.mjs
```

Noch aus dem Altbestand und irgendwann zu ersetzen: `review-gravel.jpg` und
`reviews/ride-5.jpg` sind dasselbe Foto auf zwei Artikeln.

---

## 7. Nach jeder Änderung

```bash
npx tsc --noEmit && npm run build && npx tsx scripts/generate-llms-txt.mjs && npx tsx scripts/generate-sitemap.mjs
```
