# Designsystem

Nur lesen, wenn etwas Visuelles ansteht. Einstieg ist `PROJECT.md`.

---

## 1. Warum Panels bräunlich aussahen

Zwei unabhängige Ursachen, beide behoben, beide leicht wieder einzubauen.

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
3. Produkte: drei Türen nach Absicht, danach erst Tabs und Liste
4. Tür in die Wissenschaft

Der Sägezahn trägt zwei Argumente gleichzeitig: wie viele Watt ein Schmierstoff
kostet und wie oft man ihn zurücksetzen muss. Deshalb ersetzt eine Figur zwei.

---

## 5. Bilder

`public/images/doors/` enthält 4:5-Zuschnitte für die Produkttüren, erzeugt aus
dem Ordner `Product section possible images` außerhalb des Repos. Je Motiv eine
1200er und eine 800er WebP.

Auswahllogik: ein Motiv pro Tür, klar unterscheidbares Subjekt. Blockschrägbild
für Wachs, Einzelkette für Ketten, Karton mit Block und Kette für das Set.
Landschaftsbokeh nur dort, wo Text nicht darüber liegt.

Ungenutzt und gut: `chain-clean.jpg` zeigt Ketten im Wachsbad, echtes eigenes
Foto. Gehört auf die Seite.

Ungenutzt und problematisch: `chain-dirty.jpg` ist ein fremdes Foto mit
englischer Handschrift-Kritzelei. Sollte gelöscht werden.


---

## 6. Hero-Entscheidung, Stand 2026-07-29

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
