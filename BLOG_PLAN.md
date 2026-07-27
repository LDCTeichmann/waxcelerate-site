# Blog-Plan "Die Werkstatt" — v2

Stand: 2026-07-26 · Basis: Code-Audit auf `origin/main`, Live-Checks gegen waxcelerate.de, Keyword-Recherche DE,
plus Einarbeitung der 7 neuen Fotos

---

## Was sich gegenüber v1 geändert hat

Drei Dinge, die ich beim zweiten Durchgang gefunden oder besser gelöst habe:

1. **Prerendering geht ohne Headless-Browser**, und zwar besser. Details in Abschnitt 2. Das halbiert den Aufwand
   für den wichtigsten Punkt und macht ihn ausfallsicher.
2. **184 Gedankenstriche als Satzzeichen** in `articles.ts`. Das verstößt gegen die verbindliche Sprachregel und ist
   gleichzeitig das deutlichste "das hat eine KI geschrieben"-Signal im deutschen Text. Hatte ich übersehen.
3. **Die Bilder sind ein Inhaltsproblem, nicht nur Deko.** 6 von 18 Artikeln tragen ein Foto, das nichts mit dem
   Thema zu tun hat, eins ist doppelt vergeben. Die neuen Fotos lösen genau diese 7 Fälle. Abschnitt 5.

Was aus v1 unverändert gilt: kein Prerendering, keine OG-Tags, dünne zweite Artikelwelle, fehlende Rewax-Seite.

---

## 1. Ausgangslage in einer Zeile

Die Seite hat 18 gute Artikel, sauberes Schema-Markup, generierte `sitemap.xml` und `llms.txt`,
und **nichts davon ist für einen Crawler ohne JavaScript sichtbar.**

```bash
curl -sL https://waxcelerate.de/blog/kettenlaufzeit-heisswachs | grep -o "<title>[^<]*</title>"
# → <title>Waxcelerate | Heißwachs für Fahrradketten – Sauber, effizient, langlebig</title>
```

Body: `<body><div id="root"></div></body>`. Für **jede** URL der Domain, identisch.

---

## 2. Findbarkeit: der technische Kern

### 2.1 Prerendering, konkret und ohne Puppeteer

Ich hatte in v1 einen Headless-Browser vorgeschlagen. Der bessere Weg für diesen Fall:

**Der Blog-Inhalt liegt bereits als reine Datenstruktur in `articles.ts` vor.** Ein Generator-Skript kann daraus
direkt vollständiges statisches HTML erzeugen. Kein Browser, kein Rendering-Timeout, deterministisch, läuft in
einer Sekunde. Es ist exakt dasselbe Muster wie die drei Skripte, die schon existieren:

```
scripts/generate-sitemap.mjs
scripts/generate-llms-txt.mjs
scripts/generate-merchant-feed.mjs
scripts/generate-blog-html.mjs   ← neu
```

Das Skript liest `articles.ts`, rendert pro Artikel Intro, Takeaways, alle Sections, FAQ und CTA als semantisches
HTML, setzt `<title>`, Description, Canonical, OG-Tags und das komplette JSON-LD, und schreibt nach
`dist/blog/<slug>/index.html`.

**Warum das auf Vercel ohne Config-Änderung funktioniert:** `vercel.json` hat zwar

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

aber Vercel prüft das Dateisystem **vor** den Rewrites. Existiert `dist/blog/foo/index.html`, wird diese Datei
ausgeliefert und der Rewrite greift nicht. Die SPA übernimmt danach im Browser wie gehabt. Nichts an der App
ändert sich, nur der Auslieferungspfad.

**Ehrlicher Nachteil:** zwei Renderer für denselben Inhalt, React und der Generator, können auseinanderlaufen.
Abgefedert dadurch, dass beide `articles.ts` als einzige Quelle lesen und das statische Markup nur semantisch
korrekt sein muss, nicht pixelgleich. React nutzt `createRoot().render()`, ersetzt das DOM also ohnehin komplett,
es gibt keine Hydration-Mismatch-Fehler. Ein kurzer Repaint beim ersten Laden ist der ganze Preis, und die
statische Seite malt sogar früher.

Aufwand: ca. 3 Stunden. Für Startseite, Produkt- und Wissenschaftsseiten kommt später ein Puppeteer-Durchgang
dazu (P2), aber der Inhalt, der ranken und zitiert werden soll, liegt im Blog.

Einbinden in `package.json`:

```json
"build": "tsc -b && vite build && node scripts/generate-blog-html.mjs"
```

### 2.2 OG-Tags pro Artikel

`BlogArticlePage.tsx` setzt nur `title`, `description`, `canonical` und JSON-LD. **Keine `og:`- oder
`twitter:`-Tags.** Jeder Artikel-Link, den du in MTB-News, Rennrad-News, Reddit oder WhatsApp teilst, zeigt
Startseitentitel und Startseitenbild. Genau der Kanal, auf dem die ganze KI-Sichtbarkeitsstrategie aufbaut, weil
Antwortmaschinen Community-Quellen überproportional zitieren.

Fix: `og:title`, `og:description`, `og:image` (das Artikelbild aus `getArticleImage`, absolut), `og:type=article`,
`article:published_time`, `article:modified_time`, `twitter:card=summary_large_image`. Gleiches in
`BlogIndexPage.tsx`. Ca. 30 Minuten, und der Generator aus 2.1 schreibt dieselben Tags ins statische HTML.

### 2.3 Schema aufwerten

Aktuell: `Article` plus vereinzelt `HowTo` und `FAQPage`. Fehlt:

- `BlogPosting` statt `Article` (spezifischer, korrekter)
- `dateModified` (siehe 2.4)
- `BreadcrumbList` je Artikel. Die Produktseiten haben es, der Blog nicht.
- `author` als echte `Person`-Entity mit `url` und `sameAs` auf den eBay-Shop. Das ist die Verbindung zwischen
  "Luca Teichmann" im Artikel und der real existierenden Person mit Verkaufshistorie, also die E-E-A-T-Substanz.
- `publisher.logo`

Ca. 45 Minuten, alles in `BlogArticlePage.tsx` plus Generator.

### 2.4 Datumsproblem

```
4 Artikel  2026-05-19
2 Artikel  2026-06-01
10 Artikel 2026-06-16   ← alle am selben Tag
2 Artikel  2026-06-17
```

Zehn Artikel mit identischem Publikationsdatum sehen nach Content-Dump aus, weil es einer war. Für Google ist das
kein Rankingfaktor, für Antwortmaschinen aber sehr wohl, die gewichten Aktualität stark.

Fix: `dateModified` einführen und beim Überarbeiten jedes Artikels mitsetzen, plus eine sichtbare Zeile
"Zuletzt geprüft am …" unter der Byline. Das ist ehrlich, weil du die Artikel tatsächlich anfasst, und es
staffelt die Daten von selbst.

### 2.5 Bilder-Performance

`getArticleImage` liefert **eine** Datei, die sowohl als Artikel-Hero (volle Breite) als auch als Kartenbild
(ca. 380 px) verwendet wird. Kein `srcset`, kein `width`/`height`. Die Blog-Übersicht lädt also 17 Hero-Bilder in
voller Auflösung für Vorschaukacheln, und ohne feste Maße springt das Layout beim Laden.

Fix: `articleImages` um eine Kartenvariante erweitern, WebP in zwei Größen (1600 px Hero, 800 px Karte),
`width`/`height` setzen, Hero mit `fetchpriority="high"` statt `loading="lazy"`. Das ist gleichzeitig die
Vorbereitung für die neuen Fotos in Abschnitt 5.

---

## 3. Die bestehenden 18 Artikel

Das Schreiben ist gut. Der Ton stimmt, die Struktur "H2 ist die gegoogelte Frage" sitzt in der ersten Welle.
Vier konkrete Baustellen:

### 3.1 184 Gedankenstriche

```bash
grep -oE ".{0,40}\s[–—]\s.{0,40}" src/pages/blog/articles.ts | wc -l   # 184
```

Beispiel aus `ebike-kette-wachsen`:

> "Genau deshalb lohnt sich Heißwachs hier besonders – es senkt die Reibung im Lager und hält den abrasiven
> Schmutz draußen."

Verstößt gegen die verbindliche Regel in `30_claims_language.md` ("NIE Gedankenstriche als Satzzeichen in
Kunden-Copy") und ist im Deutschen das auffälligste Maschinen-Merkmal überhaupt. Beides zusammen macht es zur
lohnendsten Textarbeit der ganzen Liste.

Mechanisch machbar mit einem Skript, das **nur** von Leerzeichen umgebene Striche anfasst. Zahlenbereiche wie
`2,5–4,5 W` oder `0,03–0,06` haben keine Leerzeichen und bleiben unangetastet. Danach einmal manuell drüber,
weil aus jedem Strich mal ein Punkt, mal ein Komma und mal ein Doppelpunkt werden muss.

### 3.2 Die zehn dünnen Artikel

`vorgewachste-kette` bis `wachs-entsorgen-topf-pflegen` liegen bei grob 450 bis 550 echten Wörtern.
Gegen tour-magazin.de, ADAC oder KMC reicht das nicht, weil die Domain-Autorität mitbringen, die du nicht hast.
Dein einziger Hebel gegen sie ist Tiefe plus eigene Zahlen.

Ziel: 900 bis 1200 Wörter, 6 bis 8 H2, jede H2 eine echte Suchfrage.

### 3.3 Die Zahlenregel

Das ist der Punkt, an dem AEO tatsächlich entschieden wird. Aus `ebike-kette-wachsen`:

> "Eine E-Bike-Kette, die mit demselben Öl wie ein normales Rad gefahren wird, ist oft schon nach der Hälfte der
> Kilometer am Verschleißlimit."

Inhaltlich richtig, aber unzitierbar. Eine Antwortmaschine übernimmt keine Aussage ohne Zahl, weil sie damit
nichts belegen kann. Mit "statt 3.000 bis 4.000 km oft schon nach 1.500 bis 2.000 km, gemessen an 0,5 %
Kettendehnung" wird aus derselben Aussage eine zitierfähige.

**Regel für alle Artikel, alt wie neu: mindestens drei harte Zahlen mit Einheit, jede kontextualisiert
("Richtwert", "je nach Bedingungen"), keine isolierten Hero-Zahlen.** Das ist gleichzeitig genau der Ton, den
`30_claims_language.md` ohnehin vorschreibt.

### 3.4 Takeaways und FAQ überall

Aktuell: 1 von 18 hat `faq[]`, 1 von 18 hat `howTo`, die sechs ältesten und besten haben keine Takeaways.
Google hat FAQ-Rich-Results am 07.05.2026 abgeschaltet, das ist bekannt und kein Gegenargument: Frage-Antwort-Paare
sind das Format, aus dem Antwortmaschinen extrahieren, unabhängig davon, ob Google daraus noch ein SERP-Feature baut.

Jeder Artikel: `takeaways[]` mit 3 bis 5 Punkten oben, `faq[]` mit 4 bis 6 Paaren unten.

### 3.5 Zwei Artikel, die anders behandelt gehören

- `kettenwachs-faq` (15 Fragen, der einzige mit `faq[]`) kannibalisiert potenziell die FAQ-Blöcke aller anderen.
  Besser: zur Verteilerseite umbauen, die jede Frage kurz beantwortet und auf den Artikel verlinkt, der sie
  ausführt. Damit wird sie zur zweiten Hub-Seite neben der Pillar-Seite.
- `ebike-kette-wachsen` ist mit 545 Wörtern das stärkste unterentwickelte Thema. Mittelmotor-Drehmoment und
  Verschleiß trägt einen eigenen, längeren Artikel, und E-Bike ist der wachsende Markt.

---

## 4. Neue Artikel

Recherchiert gegen echte deutsche Suchergebnisse und Foren-Aktivität. Pro Eintrag: Zielfrage, warum wir gewinnen
können, und wie der Artikel gebaut wird.

### Zuerst

**1. Kette wachsen lassen: Ablauf, Preis, Rückversand** → eigene Route `/rewax`, nicht nur Artikel.
Der Markt ist sichtbar besetzt: Kettenhelden, Rydewax (150 € Jahrespass für vier Ketten), wewaxanychain,
speedwax.ch, Radwelt Ehningen, eine Hamburger Werkstatt ab 64 €. Du machst Rewax in Stuttgart und Leipzig und hast
dafür keine einzige indexierbare Seite. Größte kommerzielle Lücke der Site.
*Wie:* Preistabelle, Versandweg in vier Schritten, Intervall 400 bis 550 km, Foto der zurückkommenden Kette
(Bild 6). `Service`-Schema statt `Article`.

**2. Wie viel Watt spart eine gewachste Kette wirklich?**
Im Netz stehen 3 W, 5,5 W bei 370 W Antriebsleistung und "bis zu 8 W" unkommentiert nebeneinander, ohne dass
jemand erklärt, warum sie auseinandergehen. Genau dieses Auseinandernehmen ist zitierfähig.
*Wie:* eine Tabelle Prüfstand gegen Prüfstand, dann die eigene Einordnung im vorgeschriebenen Rahmen
("ca. 2,6 W gegenüber ca. 7,5 W bei 300 bis 400 W Eingangsleistung, Laborwerte"). Nie "5 Watt schneller",
keine Superlative.

**3. Wachsen ohne Entfetten: was Strip Chips und Transformer Blocks wirklich machen**
Wachsender Trend, TOUR hat über den REX Transformer Block geschrieben, im Deutschen erklärt es niemand chemisch
sauber. Kein Konflikt mit `fahrradkette-entfetten`, sondern Verlinkung dorthin.

**4. Gewachste Kette reinigen und pflegen**
Belegter Schmerzpunkt mit mehreren langen Foren-Threads, KMC hat eine Seite, sonst wenig. Deckt mit ab, was
trotzdem geölt werden muss (Schaltröllchen, Züge) und was nicht (Kassette, Kettenblätter).

**5. Kettenwachs selber machen: Paraffin, Additive, und wo es kippt**
Kontraintuitiv für einen Verkäufer, deshalb richtig. Der MTB-News-Thread dazu läuft über 57 Seiten, Rezepte wie
"500 g Paraffin, 135 g Öl, 10 g Graphit" kursieren ungeprüft. Ein ehrlicher Artikel darüber, was DIY kann und wo
Dispersion, Härte und Festschmierstoffanteil den Unterschied machen, ist das stärkste Vertrauenssignal, das dir
zur Verfügung steht, bei fast null Konkurrenz. Formelprozente bleiben draußen.

**6. Kettenwachs-Tests lesen: was TOUR, BIKE und ZeroFriction eigentlich messen**
Hohes Volumen, von Magazinen besetzt, frontal nicht zu gewinnen, und "wir sind das beste" ist ohnehin verboten.
Gewinnbar ist die Meta-Ebene: welche Methodik was misst, warum dasselbe Wachs in zwei Tests unterschiedlich
abschneidet. Nebeneffekt: das ist die Seite, die eine KI heranzieht, wenn jemand nach dem besten Kettenwachs fragt.

**7. Neue Kette wachsen: muss das Werksfett runter?**
Sehr konkrete Frage, sehr konkrete Antwort (Shimano typisch 3 bis 4 Durchgänge, SRAM oft 2).
*Entscheidung nötig:* eigener Artikel oder H2 in `fahrradkette-entfetten`. Ich tendiere zum Ausbau, sonst stehen
zwei fast identische Seiten gegeneinander.

**8. PTFE, PFAS und Kettenwachs: Stand des EU-Verfahrens**
Stiftung Warentest hat getestet, Squirt hat eine eigene PFAS-Seite, antidot bewirbt aktiv "100 % PTFE-frei".
Das Thema kommt auf dich zu, ob du schreibst oder nicht. Du verkaufst Classic mit PTFE und MoS₂ Pro ohne, damit
ist der ehrliche Artikel Vertrauens- und Verkaufsasset zugleich.
**Blockiert:** vorher muss die offene Frage aus `95_open_questions.md` entschieden werden, ob PTFE in öffentlicher
Copy aktiv genannt wird. Verbindlich ist bereits "PFAS-frei und zukunftssicher, unabhängig vom Ausgang des
EU-Verfahrens" für Pro, niemals "PTFE wird verboten".

### Danach

**9. Wachsen oder ölen: Entscheidungshilfe in 6 Fragen.** Der eigentliche Kopf-Begriff, ADAC rankt darauf.
Kannibalisierungsgefahr gegenüber `heisswachs-vs-fluessigwachs` (Wachs gegen Wachs) und `von-oel-auf-wachs-umsteigen`
(Anleitung), deshalb **nur** als Entscheidungsbaum, nicht als dritter Vergleich. Die Site hat schon fünf Rechner in
`tools.tsx`, ein interaktiver "Wachs-Check" liegt nahe und ist gleichzeitig ein Linkmagnet.

**10. MTB im Matsch: was Wachs aushält und was nicht.** Belegte Praxiswerte aus den Foren, von "nach 50 km neu
wachsen" bis "1000 km bei trockener Kälte". Der Winterartikel deckt Streusalz ab, nicht Schlamm.

**11. Bikepacking und Mehrtagestour: Kettenpflege ohne Wachstopf.** Aktive Threads in Rennrad-News und im
Ultraleicht-Trekking-Forum, im Deutschen besetzt das niemand. Verbindet sich mit dem Tropfwachs-Hybrid-Artikel.

**12. Wachstemperatur: wie heiß muss das Wachs?** Kurz, präzise, extrem zitierfähig. Im Umlauf: 75 bis 95 °C,
Additiv-Aktivierung 85 bis 90 °C, Silca-Chips kurzzeitig 125 °C.

**13. Rost auf der gewachsten Kette.** **14. Nabenschaltung, Riemen, Rohloff: wann Wachs keinen Sinn ergibt**
(Ausschlussartikel, verhindert Fehlkäufe, fast keine Konkurrenz). **15. Kette wechseln: wann, welche, und was das
beim Wachsen ändert.**

### Autorität, die eigentlichen KI-Hebel

**16. Wachs-Logbuch: laufende Verschleißmessungen aus der Werkstatt.**
Eine lebende Datenseite, monatlich ergänzt: Kettenmodell, km, Dehnung in Prozent, Bedingungen, Wachsvariante.
Das ist das mit Abstand zitierfähigste Asset, das dir zur Verfügung steht, weil Antwortmaschinen spezifische, einer
benannten Quelle zurechenbare Zahlen bevorzugen und niemand in Deutschland laufende Messreihen veröffentlicht.
Gleichzeitig der beste Linkmagnet für Foren und Fachredaktionen, und das einzige Element dieser Liste, das ein
Wettbewerber nicht einfach nachschreiben kann.

**17. Kettenwachs-Lexikon.** 30 bis 40 Begriffe à 40 bis 80 Wörter, eigene Route, jeder Begriff per Anker
verlinkbar. Glossare werden von KI-Systemen überproportional zitiert und ranken nebenbei für hunderte Longtails.

**18. Hergestellt in Stuttgart: wie das Wachs entsteht.** Die Lücke, die im SEO-Memory benannt und nie geschlossen
wurde. Claims: "Hergestellt in Stuttgart" für das Wachs, "Handgewachst in Stuttgart" für die Ketten,
"Made in Germany" für Shimano, SRAM und YBN ist tabu. Kein Deutschland-Pathos.

**19. Pillar-Seite "Kettenwachs: der komplette Leitfaden".** Bündelt und verlinkt alle Artikel. Die Seite, die eine
KI heranzieht, wenn die Frage breit gestellt wird, und der Anker für die topische Autorität der Domain.

---

## 5. Die neuen Fotos

Sieben Bilder, und sie treffen fast genau die sieben Stellen, an denen aktuell ein unpassendes oder doppeltes Foto
steht. Ablage unter `public/images/blog/`, Dateinamen unten.

| Bild | Datei | Einsatz | Warum |
|---|---|---|---|
| Bein mit Ölspuren, schwarz verschmierte weiße Socke über dem Antrieb | `oil-tattoo-leg.jpg` | Hero `von-oel-auf-wachs-umsteigen` **und** linke Hälfte des Vergleichsblocks auf der Blogstartseite | Das wertvollste Bild im Set. Es *ist* das Argument, kein Produkt, kein Studio, nur das Problem. Jeder Radfahrer erkennt es sofort, und in einem Raster aus 17 hübschen Fotos ist es das einzige, das den Scroll stoppt. Ersetzt einen generischen Sonnenuntergang. |
| Makro gewachste YBN-Kette auf Schiefer, weißer Wachsfilm sichtbar | `chain-waxed-macro.jpg` | Hero `erste-fahrt-nach-wachsen` **und** rechte Hälfte des Vergleichsblocks | Der Artikel handelt davon, wie die Kette nach dem Wachsen aussieht, und zeigt aktuell ein beliebiges Rennradfoto. Hier ist der weiße Wachsrand zu sehen, nach dem die Leute fragen. Inhalt und Bild decken sich endlich. |
| Ketten am Draht über dem Edelstahltopf, Hügel im Hintergrund | `wax-bath-hanging.jpg` | Hero `topf-zum-kette-wachsen` | Löst nebenbei den einzigen Doppelbelegungsfehler auf: `process-melt.jpg` steht aktuell bei `topf-zum-kette-wachsen` **und** `wachs-entsorgen-topf-pflegen`. Und es zeigt den Abtropfschritt, den die meisten falsch machen. |
| Kraftkarton mit Logo, Kette und zwei Kettenschlössern auf Schiefer | `box-chain-delivery.jpg` | Hero `vorgewachste-kette` **und** Hero der neuen `/rewax`-Seite | Der Artikel heißt "Was du beim Kauf wirklich bekommst". Das Bild zeigt exakt das. Auf `/rewax` beantwortet dasselbe Bild die Frage "wie kommt meine Kette zurück". |
| Neue YBN-Kette flach im offenen schwarzen Mailer, Kettenschloss oben rechts | `chain-ybn-mailer.jpg` | Hero `schnellverschluss-quicklink` | Das Kettenschloss liegt sichtbar im Bild. Wörtlicher geht Bild-zu-Thema nicht. |
| Goldene HG-X-Ketten hängend vor Hügeln, Markenkarton, Abendlicht | `chains-hanging-gold.jpg` | Bild des Leitartikels auf der Blogstartseite | Das schönste Bild im Set, deshalb gehört es an die Stelle mit der größten Bildfläche. **Nicht** als Masthead: der Masthead muss weiße Schrift tragen, dafür ist das dunkle Kettenmakro besser geeignet. Jedes Bild macht den Job, den es kann. |
| Fahrer von vorn auf leerer Straße, Abendlicht, quadratisch | `ride-road-golden.jpg` | CTA-Banner unten auf der Blogstartseite, plus Standard-OG-Bild für `/blog` | Es gibt bereits fünf Rennradfotos im Raster, ein sechstes bringt nichts. Als Fläche hinter dem CTA und als Vorschaubild beim Teilen wirkt es dagegen. Das quadratische Format passt genau dafür. |

### Der Vergleichsblock

Bild 1 und Bild 5 nebeneinander, direkt über dem Leitartikel, zwei Zeilen Text darunter. Links das ölverschmierte
Bein, rechts die trockene gewachste Kette im Makro. Das ist die These des gesamten Blogs in einem Blick, und es
kostet eine Komponente. Beide Bilder stammen aus deinem eigenen Alltag, keine Stockfotografie, was genau zur
Markenhaltung passt.

Das Bild vom Bein ist außerdem der beste OG-Kandidat für die Umstiegs- und Vergleichsartikel. Geteilte Links leben
von Wiedererkennung, und "so sieht mein Bein nach der Tour aus" wird in einem Forum eher angeklickt als ein
weiteres Kettenfoto.

### Aufbereitung

Es sind Kameradateien mit mehreren MB. Vor dem Einbinden:

- WebP in zwei Größen, 1600 px für Hero, 800 px für Karten, JPEG als Fallback
- Ziel unter 180 KB je Datei
- `width` und `height` setzen, sonst springt das Layout
- Hero mit `fetchpriority="high"`, Karten mit `loading="lazy"` (steht schon)
- `articleImages` um ein `card`-Feld erweitern, siehe 2.5
- Bein-Foto ist hochkant aufgenommen und liegt gedreht vor, vor dem Export korrekt ausrichten und auf 16:10
  beschneiden, Bildmitte auf Socke und Kettenblatt

Alt-Texte konkret schreiben, nicht dekorativ. "Schwarze Ölspuren an Wade und weißer Socke nach einer Fahrt mit
geölter Kette" ist gleichzeitig Barrierefreiheit und ein Textsignal, das ein Crawler lesen kann.

---

## 6. Design der Blogseite

Handwerklich ist die Seite gut. Was fehlt, ist Führung: 17 optisch gleichwertige Kacheln unter einem Leitartikel
sind eine Liste, kein Magazin.

**A. Einstieg nach Absicht.** Über den Kategorie-Pills eine Zeile mit vier Absichten:
*Ich will anfangen · Es klappt nicht · Ich will es genau wissen · Ich will kaufen*.
Die sechs Kategorien sind Redaktionslogik. Wer über "Kette wachsen wie oft" hereinkommt, sucht keine Kategorie.
Die Pills bleiben darunter fürs Stöbern.

**B. Vergleichsblock** aus Abschnitt 5, direkt über dem Leitartikel.

**C. "Start hier" als nummerierter Pfad.** Drei Artikel als schmaler Streifen, nicht als Karten:
Umstieg → Anleitung → Intervalle.

**D. Kennzahl auf jeder Karte.** Der Leitartikel hat mono-gesetzte Chips (`3–5 W`, `5–8.000 km`, `~140 €`) und die
funktionieren. Jede Karte bekommt eine Kennzahl plus Datum. Das macht das Raster scannbar und verstärkt genau die
Aussage, die dich von den Magazinen unterscheidet: hier stehen Zahlen, keine Adjektive.

**E. Rhythmus im Raster.** Alle sechs Karten eine breite Karte über zwei Spalten. Bricht die Monotonie ohne neue
Komponente.

**F. Suche.** Bei 18 Artikeln ein `useMemo`-Filter über Titel, Beschreibung und Takeaways. Mit wachsender
Bibliothek Pflicht.

**G. Artikelseite:** Sticky-Inhaltsverzeichnis auf Desktop (verlängert die Verweildauer und liefert der KI die
Gliederung), Kurzfassung auf jedem Artikel, FAQ-Block am Ende jedes Artikels, Breadcrumb, Zeile "Zuletzt geprüft am".

**H. Weiterlesen wird zur Reihe.** Aktuell füllt `related` mit derselben Kategorie auf. Besser ein explizites
`next`-Feld pro Artikel.

**I. Zählerfehler.** Der Hero sagt "18 Artikel", die Rasterüberschrift daneben "17", weil der Leitartikel
herausgefiltert wird.

**Nicht anfassen:** Typografie, Farbtokens, Dark Mode, Leseprogress-Balken, Autorenbox. Funktioniert.
Und die Gotcha aus dem Memory bleibt gültig: bei jeder `h1` über einem Bild müssen `color` **und**
`WebkitTextFillColor` inline gesetzt werden, sonst greift die globale Regel und die Überschrift wird fast schwarz.

---

## 7. Reihenfolge

| # | Maßnahme | Aufwand | Wirkung |
|---|---|---|---|
| 1 | `generate-blog-html.mjs`, Prerendering der 18 Artikel plus `/blog` | 3 h | schaltet Google-Zweitwelle und **alle** KI-Crawler überhaupt erst frei |
| 2 | OG-/Twitter-Tags pro Artikel | 30 min | macht geteilte Links klickbar, Voraussetzung für Foren-Strategie |
| 3 | Gedankenstrich-Durchlauf plus manuelle Kontrolle | 2 h | Markenregel, und entfernt das deutlichste Maschinen-Signal |
| 4 | Schema aufwerten, `dateModified`, Breadcrumb, Person-Entity | 1,5 h | E-E-A-T und Aktualitätssignal |
| 5 | Neue Fotos aufbereiten und zuordnen, `card`-Variante, `srcset` | 2 h | behebt 6 Fehlzuordnungen und die Ladezeit der Übersicht |
| 6 | `/rewax`-Seite plus Artikel 1 | 1 Tag | einzige unbesetzte kommerzielle Suchanfrage mit echtem Angebot dahinter |
| 7 | Takeaways plus FAQ auf allen 18, Zahlenregel anwenden | 1 Tag | AEO-Format flächendeckend |
| 8 | Die zehn dünnen Artikel auf 900 bis 1200 Wörter | 2 bis 3 Tage, gut aufteilbar | Rankingfähigkeit gegen Magazine |
| 9 | Blogseiten-Umbau A bis I | 1 Tag | |
| 10 | Artikel 2 bis 8 | je 2 bis 3 h | |
| 11 | Wachs-Logbuch, Lexikon, Pillar-Seite | 2 Tage plus Pflege | die eigentlichen Zitier-Hebel |
| 12 | Artikel 9 bis 15 | je 2 h | |

Punkte 1 bis 5 sind zusammen etwa ein Arbeitstag und heben mehr als alle 15 neuen Artikel zusammen, solange
Prerendering fehlt.

Nach jedem neuen Artikel oder Produkt:

```bash
npx tsx scripts/generate-sitemap.mjs && npx tsx scripts/generate-llms-txt.mjs && npx tsc --noEmit
```

---

## 8. Offen und außerhalb meiner Reichweite

- **Branch klären.** Der lokale Checkout steht auf `audit/award-winning` mit zehn uncommitteten Dateien und weicht
  von live ab (lokal eigener Mini-Header im Blog, live `<Navigation />`). Vor der Umsetzung entscheiden, worauf
  gebaut wird.
- **PTFE-Sprachpolitik** entscheiden, blockiert Artikel 8.
- **Search-Console-Verifizierung** bestätigen. Ohne sie lässt sich die Wirkung von Punkt 1 nicht messen, und genau
  das will man hier messen.
- **Echte Suchvolumina** fehlen. Die Recherche stützt sich auf Suchergebnisse, Foren-Aktivität und
  Wettbewerbsabdeckung, nicht auf Keyword-Tool-Daten.
- `SEO_TODO.md` ist von Mai 2026 und überholt (Domain steht, Sitemap wird generiert, GBP ist geprüft und
  ausgeschlossen). Archivieren.
