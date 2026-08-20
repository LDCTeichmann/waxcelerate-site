# Designsystem

Nur lesen, wenn etwas Visuelles ansteht. Einstieg ist `PROJECT.md`.

---

## 1. Warum Panels bräunlich aussahen

**Vier unabhängige Ursachen**, alle behoben, alle leicht wieder einzubauen. Der
„ockrig/olive" Eindruck kam viermal zurück, jedes Mal aus einer anderen Ecke —
wer ihn ein fünftes Mal sieht, sollte hier von oben nach unten durchgehen,
statt an Hex-Werten zu drehen.

**Ursache 3 — die Fotos selbst.** Nachgemessen am 21.08.2026 (Kanalmittelwerte
via `sharp().stats()`): `starter-box` R109 G114 B72 — 42 Einheiten Gelbgrün.
`wax-pro` 19, `chains-hanging-gold` 12, `chains-flat` 6. Alle zeigen Produkt vor
grünem Laub-Bokeh. Der Regal-Umbau stellte drei davon erstmals nebeneinander,
mit `wax-pro` direkt darüber. Behoben mit `.photo-neutral`
(`saturate(0.68) contrast(1.06)`) auf der Produktfotografie — Entsättigung, weil
das Laub das gesättigtste Motiv ist und am meisten verliert, während der blaue
Classic-Block seine Identität behält.

**Ursache 4 — zu wenig Abstand zwischen den Graustufen.** Das ist die
eigentliche, und sie ist **keine Farbe**: nachgemessen waren alle Tokens exakt
R=G=B und kein großflächiges Element im DOM hatte einen Stich über 3 Einheiten.
Die vier hellen Flächen lagen mit `#EAEAEA / #F1F1F1 / #F6F6F6 / #FFFFFF` in
einer nur **21 Einheiten schmalen Spanne** dicht unter Weiß. Vier fast gleiche
Grautöne erzeugen keine Tiefe, sondern Matsch — und ein Feld, das weder als
„weiß" noch als „grau" liest, benennt das Auge als beige/ocker. Die Literatur zu
Grau-Skalen sagt dasselbe: zu viele ähnliche Graustufen wirken „muddy", und im
hellen Bereich braucht es *mehr* Abstand, weil die Wahrnehmung dort komprimiert.

### Die verbindliche Regel für alle Graustufen

Neutrale werden **in OKLCH mit Chroma = 0 gerechnet**, nicht von Hand geraten.
Chroma 0 heißt: ein Farbstich ist mathematisch ausgeschlossen, unabhängig vom
Gamut des Displays. Das ist der strukturelle Teil — er kann nicht verrutschen.

| Token | Wert | Δ zur Stufe davor |
|---|---|---|
| `--sf` | `#FFFFFF` | — |
| `--pg` | `#F9F9F9` | 6 |
| `--sf2` | `#F1F1F1` | 8 |
| `--sf3` | `#EBEBEB` | 6 |
| `--bd2` | `#E4E4E4` | 7 |
| `--bd` | `#D4D4D4` | 16 — die Kante trägt die Trennung, nicht die Füllung |

Untergrenze für `--sf3` ist **WCAG, nicht Geschmack**: bei `#E8E8E8` fällt
`--txff` auf 4.48:1 und reißt die 4.5:1-Schwelle. `#EBEBEB` gibt 4.61:1.
Nachgerechnet gegen die dunkelste Fläche: txm 5.61, txf 5.12, txff 4.61,
tx2 8.11, tx1 15.93 — alle bestanden.

**Nicht wieder einen Farbstich einbauen, auch keinen angenehm kühlen.**

---

### Die ersten beiden Ursachen (historisch)

**Simultankontrast.** Die Grautöne trugen früher einen Blaustich von 1 bis 4
Einheiten pro Kanal. Isoliert las sich das als kühles Neutral, neben dem
gesättigten Akzentblau kippte es wahrnehmungsseitig ins Pistaziengrüne. Gelöst,
indem alle Grautöne exakt R=G=B gesetzt wurden. Der Kommentar dazu steht bei den
Tokens in `index.css`. **Nicht wieder einen Farbstich einbauen, auch keinen
angenehm kühlen.**

**Der Filter-Farbraum.** `.grain` legt ein `feTurbulence`-Rauschen über jedes
`InstrumentFrame`. Rohes fractalNoise ist olivfarben, deshalb war bereits ein
`feColorMatrix saturate=0` eingebaut. Der lief aber wirkungslos, weil SVG-Filter
per Voreinstellung in **linearRGB** rechnen: die Entsättigung passierte im
linearen Raum, und beim Zurückrechnen durch die sRGB-Kennlinie kam der Stich
zurück. `color-interpolation-filters='sRGB'` am Filter behebt das.

Regel: **jeder SVG-Filter, der Farbe verändert, braucht dieses Attribut.**

**Deckkraft.** Zusätzlich von 5 % auf 2 % gesenkt. Eine Textur soll gefühlt und
nicht gesehen werden, und 5 % Rauschen über hellem Grund kostet genau den
Kontrast, den Haarlinien brauchen.

---

## 2. Zeichenskala

Definiert in `index.css`, hell und dunkel getrennt.

| Token | Hell | Verwendung |
|---|---|---|
| `--dw-hair` | 1.2px | Konstruktionslinien, Schraffur, Raster, Achsen |
| `--dw-line` | 1.7px | die Geometrie des gezeichneten Dings |
| `--dw-bold` | 2.6px | das eine Element, um das es in der Figur geht |

Wichtiger als die Absolutwerte ist der Abstand. Bei 1,1 / 1,3 / 1,5 sieht
niemand mehr, welche Linie der Punkt der Zeichnung ist. Verhältnis etwa
1 : 1,4 : 2,2 halten. Dunkelmodus liegt bewusst etwas darunter, weil helle
Striche auf Schwarz optisch aufblühen.

**Schrift in Figuren: nie unter 11 px.** IBM Plex Mono in den Grautönen fällt
darunter auf einem 1x-Display unter die Wahrnehmungsschwelle. In
`sections/science/` ist das umgesetzt, unter anderem waren dort vier Labels auf
8 px. Diese Figuren brauchen einen kurzen Blick, ob die größere Schrift noch ins
Layout passt.

**Offen:** im restlichen `src/` stehen noch rund hundert Klassen unter 11 px, vor
allem in `tools.tsx`, `guides.tsx`, `reviews.tsx`, `products.tsx`, `about.tsx`,
`contact.tsx` sowie `LabViz.tsx` und `FormulaGraph.tsx`. Das ist bewusst nicht
blind ersetzt worden, weil Badges und Navigationselemente daran hängen. Sollte
einmal bewusst durchgegangen werden.

---

## 3. Flächen und Kanten

Aus dem Markenprofil: dünne Trennlinien statt Kartenboxen, Serif-Überschriften,
Eyebrow-Typo mit Sperrung, große Serifzahlen sparsam.

Praktisch heißt das drei erlaubte Behälter, mehr nicht:

1. **Haarlinie.** Standard für Listen, Vergleiche, Aufzählungen. Kein Rahmen, kein Fond.
2. **`InstrumentFrame`.** Für Messtechnik: Diagramme, Rechner, Datenpanels. Punktraster, Eckmarken, Chip oben rechts. Das ist die Ausnahme, nicht der Normalfall.
3. **Ganzflächiges Foto.** Für Produkteinstiege und Storytelling. Immer mit Scrim von unten, damit weißer Text hält.

Was es nicht mehr geben sollte: gefüllte Kacheln mit Icon und zwei Zeilen Text.
Die widersprechen der eigenen Regel und ergeben, mehrfach untereinander, den
Baukasten-Eindruck.

---

## 4. Reihenfolge auf der Startseite

Ziel ist, dass jemand, der noch nicht von Kettenwachs überzeugt ist, nicht als
Erstes Messtechnik sieht.

1. Hero
2. Warum Wachs: was sich für dich ändert, dann der Antriebsverlust-Sägezahn, dann die Messkacheln
3. Produkte: das Regal — zwei Wachs-Tafeln (Classic/Pro, Größe als Schalter,
   4:3.3 Querformat), darunter eine Reihe aus drei gleich großen Kacheln (Set,
   Ketten, Rewax) in einer gemeinsamen Sprache (`SecondaryTile` in
   `ProductShelf.tsx`, ebenfalls 4:3.3, Foto mit Scrim-Titel, ein Fließtext,
   ein CTA). Erst vier verschiedene Layouts für vier Elemente auf einem
   Bildschirm, dann korrigiert auf zwei Kartensprachen nach genau zwei
   Rollen (Kaufentscheidung vs. nächster Schritt) — ein A/B-Test mit 25.000
   Besuchern belegt 17,1 % mehr Umsatz pro Besucher allein durch einheitliche
   statt gemischte Kartengrößen in einem Produktraster.
   Zwei Anläufe, bis das griff. Erster Anlauf (4:5 vs. 4:3, ~2,6× Höhen-
   verhältnis, dann ein max-w-[880px]-Deckel auf die Wachs-Reihe): löste
   Lucas Beobachtung ("Wax-Tafeln wirken viel größer") nur zur Hälfte und
   erzeugte einen neuen Fehler — der Deckel schnitt die Wachs-Reihe bei
   880px ab, während die Dreierreihe darunter die volle Sektionsbreite
   (1120px bei 1400px Viewport) nutzt. 240px Leerraum rechts neben den
   Tafeln plus ein eigenes Seitenverhältnis ergab genau "zu groß, nicht
   zentral, nicht aus einem Guss" — Lucas Screenshot vom 21.08. zeigte es.
   Zweiter Anlauf: kein Deckel mehr (Wachs-Reihe trägt jetzt dieselbe volle
   Breite wie die Reihe darunter), und dasselbe Seitenverhältnis 4:3.3 für
   beide Ebenen (vorher 4:4.6 für die Wachs-Tafeln). Bei zwei statt drei
   Spalten sind die Wax-Tafeln dadurch automatisch breiter und bei gleichem
   Verhältnis auch etwas höher (bei 1400px rund 544×449px statt vorher
   424×488px) — aber dieselbe Bildsprache wie die Kacheln darunter statt
   eines eigenen Seitenverhältnisses, und der Größenunterschied liest sich
   jetzt als Spaltenzahl, nicht als Formfaktor-Bruch. Dieselbe Hover-Sprache
   auf beiden Ebenen (Lift + Pfeil-Chip) trägt den Rest der Hierarchie
   (Kaufentscheidung vs. nächster Schritt).
4. Tür in die Wissenschaft

Der Sägezahn trägt zwei Argumente gleichzeitig: wie viele Watt ein Schmierstoff
kostet und wie oft man ihn zurücksetzen muss. Deshalb ersetzt eine Figur zwei.

---

## 5. Bilder

`public/images/shelf/` enthält die Zuschnitte der Produktsektion, erzeugt von
`scripts/build-shelf-images.mjs` aus `raw-image-library/`. Je Motiv eine große
und eine 800er WebP.

Auswahllogik: **Classic und Pro müssen aus derselben Session stammen** —
DSC05242 (blauer Block) und DSC04096 (schwarzer Block), beide hochkant auf
Schiefer vor grünem Bokeh. Stehen zwei Produkte nebeneinander und unterscheiden
sich Winkel oder Licht, vergleicht der Betrachter die Fotografie statt das
Wachs. Der grüne Hintergrund löst nebenbei das alte Pro-Problem: schwarzes
Wachs auf dunklem Schiefer war im Noir-Theme praktisch unsichtbar und musste
mit `.wax-card-pro-glow` übermalt werden.

`public/images/doors/` ist bis auf `starter-set*.webp` (noch von
`StarterSetPage.tsx` genutzt) seit dem Regal-Umbau ungenutzt.

Ungenutzt und gut: `chain-clean.jpg` zeigt Ketten im Wachsbad, echtes eigenes
Foto. Gehört auf die Seite.

Ungenutzt und problematisch: `chain-dirty.jpg` ist ein fremdes Foto mit
englischer Handschrift-Kritzelei. Sollte gelöscht werden.


---

## 6. Hero-Entscheidung — abgeschlossen 2026-08-18

> **Ergebnis: Variante A wurde NICHT gebaut, der bestehende Hero bleibt.**
> Nachgetragen am 13.08.2026 (Doku hinkte hinterher). Belegt durch den Zustand
> des Repos: `/hero-lab` ist als Route entfernt, `public/images/hero-alt/`
> geloescht, und der aktuelle Hero (`chain-bg` plus freigestellter Wachsblock)
> wurde weiter ausgebaut — WebP-Fassung und eigene Mobile-Varianten. In diese
> Richtung investiert niemand, der das Motiv tauschen will.
>
> Der Text unten bleibt als Begruendungsprotokoll stehen. Die darin genannten
> Dateien existieren nicht mehr — **nicht danach suchen**.

### Die urspruengliche Abwaegung vom 2026-07-29

**Gewählt: Variante A, das Foto der hängenden gewachsten Ketten** („4 Chain.JPG",
liegt als `public/images/hero-alt/hanging*.webp` in drei Größen). Noch nicht
eingebaut, Aufgabe liegt für Mittwoch in Todoist. Vergleichsseite: `/hero-lab`,
noindex.

Warum dieses und nicht die anderen:

- Es ist das einzige Motiv, bei dem **Bild und Textspalte sich nicht in die Quere
  kommen.** Die Ketten füllen die rechte Bildhälfte mit senkrechtem Rhythmus,
  links bleibt eine ruhige Fläche, die der Scrim abdunkeln kann, ohne dass etwas
  Wichtiges verschwindet.
- Der Logo-Aufsteller **liegt beiläufig mit im Bild** statt platziert zu wirken.
  Das ist der Unterschied zwischen einer Aufnahme und einem Werbefoto.
- Goldenes Licht plus Hügel im Bokeh **gibt der Marke einen Ort.** Cyclowax und
  Optimize fotografieren im Studio auf Weiß. Draußen bei Abendlicht steht
  niemand, und die Herkunft ist ohnehin ein Kernargument der Marke.

Warum das alte Bild weg kann: die Kettentextur im Studio ist handwerklich sauber
und trotzdem austauschbar. Sie zeigt das Produkt, aber nicht, wer es macht.

**Rotation verworfen.** Der erste Entwurf blendete drei Aufnahmen derselben
Session, was formal aufgeht: gleicher Schiefer, gleicher Horizont, gleiches
Licht. Beim Rendern der Mockups wurde es trotzdem deutlich: Umschlag und
offener Karton sind gute Produktbilder, haben aber nicht die Bildkraft der
hängenden Ketten. Eine Blende zwischen einem starken und zwei mittleren Bildern
macht das starke schwächer, nicht die mittleren stärker. Die beiden gehören auf
`/starter-set` und `/rewax`, wo sie thematisch etwas beweisen.

Beim Einbau: Scrim von links 0,80 nach rechts 0,16, nur das Hero-Bild lädt
eager. Danach `/hero-lab` und `public/images/hero-alt` löschen.
