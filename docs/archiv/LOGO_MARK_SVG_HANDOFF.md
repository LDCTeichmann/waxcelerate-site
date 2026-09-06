# Header-Logo: Vektor-Nachbau + Hover-Animation — Übergabe

Status: **gelöst (2026-08-21)**. Der User hat eine echte Vektordatei bereitgestellt
("Logo No Background.svg", Canva-Export, in `~/Downloads`) — genau das, was in den
"Offenen Fragen" unten als fehlendes Puzzlestück identifiziert wurde. Daraus wurden
neue, präzise Pfaddaten extrahiert und `WaxcelerateMark.tsx` ersetzt. Diff-frei,
keine Dellen mehr an Taille/Naht, in `npx tsc --noEmit` und live im Header
(6×-Zoom via DOM-Inspektion) geprüft. Der Rest dieses Dokuments beschreibt die
vorherigen, gescheiterten Anläufe — als Referenz stehen gelassen, falls der Ansatz
je wieder gebraucht wird, aber nicht mehr der aktuelle Stand.

**Was die neue Quelldatei enthielt (wichtig, falls nochmal sowas auftaucht):** kein
echtes Vektor-Pfad-SVG mit Flächenfarbe, sondern ein Canva-"SVG"-Export, der intern
nur zwei eingebettete Raster-PNGs (1024×1024) per Maske kombiniert — beim Rendern
sichtbar wird aber nur ein dünner doppelter Konturlinienzug (Außen-/Innenkante der
weißen Sticker-Kontur je Feature), keine Flächen. Das war trotzdem genau die
fehlende Information: die zwei Konturlinien pro Feature (Außensilhouette + jedes
Loch) sind exakt die zwei Kanten, die das bestehende Zwei-Flächen-Konzept
(weiß außen/innen, Farbverlauf dazwischen) braucht. Extraktion siehe Kommentar-Header
in `WaxcelerateMark.tsx`.

---

## Vorheriger Stand (archiviert, nicht mehr aktuell)

Mehrere Anläufe, der User sagte zuletzt nur "funktioniert immer noch nicht" ohne
neuen Screenshot — die letzte Fassung war NICHT verifiziert als korrekt. Nicht von
den Diff-Checks in diesem Dokument täuschen lassen: die hatten alle "bestanden" und
trotzdem war das Ergebnis für den User sichtbar falsch.

## Ursprüngliche Anfrage (Kontext, nicht mehr das Problem)

User fragte, ob Logo+Markenname im Header (`src/sections/navigation.tsx`) besser
gestaltet werden könnten und wie man dem Nutzer vermittelt, dass ein Klick darauf
zur Startseite zurückführt. Das ist erledigt und unstrittig:

- `<a>` um Logo+Text bekam `aria-label`, Hover-Unterstrich unter dem Wortmark
  (gleiche Sprache wie die Nav-Links daneben).
- Wortmark-Textgröße 15px → 17px.
- Eyebrow im Hero (`src/lib/i18n.ts`, Keys `hero.subtitle`) erweitert auf
  "Waxcelerate · Heißwachs · Stuttgart" als dezenter Herkunftshinweis, bewusst
  ohne Flaggen-Emoji (Begründung siehe Chatverlauf: Flagge wirkt wie generisches
  Marktplatz-Badge, bricht den editorialen Ton).

Das ist alles isoliert von unten stehendem Problem und muss nicht angefasst werden.

## Das eigentliche, ungelöste Problem

User wollte eine Hover-Animation, bei der die drei Kettenglieder des Logos
"einrasten"/"zusammenfliegen". Das Logo existierte nur als PNG
(`public/images/logo-dark.png`, 320×320, RGBA) — für eine Animation pro
Kettenglied braucht es aber einzeln ansteuerbare Vektor-Shapes. Also: PNG in SVG
zurückverwandeln (3 `<g>`-Elemente, je eins pro Glied).

**Genau dieser Rückverwandlungs-Schritt (PNG → SVG) ist es, der nach vier
Anläufen immer noch nicht sauber funktioniert.** Der User hat wiederholt
Screenshots geschickt, in denen die Kettenglied-Silhouette sichtbar falsch
aussieht (Dellen, fehlende/falsche weiße Kontur, wirkt "nicht clean") — verglichen
mit einem Referenzbild, das er mehrfach gepostet hat (eine "Sticker"-Darstellung
der drei Glieder mit klarer weißer Kontur um Außenkante UND Löcher).

**Wichtig: Der User hat kein Dateisystem-Zugriff-Referenzbild bereitgestellt.**
Alle Referenzbilder kamen nur als Chat-Anhänge (Vision-Input), nie als Datei auf
Platte. Trotz Ankündigung "das Original ist als Bild/Dokument hochgeladen" wurde
keine Datei im Dateisystem gefunden (mehrfach mit `find` in `~/Desktop`,
`~/Downloads`, Scratchpad-Verzeichnissen gesucht, nichts Neues). Falls eine neue
Session anfängt: **zuerst fragen, ob der User die Referenzdatei tatsächlich
irgendwo ablegen kann** (Downloads-Ordner, Pfad mitteilen) statt nur ins Chat zu
pasten — das würde pixelgenaues Arbeiten möglich machen statt Rätselraten aus
Vision-Screenshots.

## Datei-Lage

- `src/components/WaxcelerateMark.tsx` — die SVG-Komponente, komplett von mir
  gebaut (neu, nicht im Git-Verlauf vorher vorhanden). Wird in
  `src/sections/navigation.tsx` an zwei Stellen verwendet (Desktop-Header-Logo,
  mobiles Menü-Logo).
- `src/index.css` — Suchbegriff `wx-mark` bzw. `wx-link` für die
  Hover-Animation und den `.wx-mark-svg` drop-shadow-Filter.
- Beide Dateien sind aktuell **uncommitted** im Arbeitsverzeichnis (`git status`
  zeigt sie als geändert/neu). Das Arbeitsverzeichnis hat daneben noch andere,
  von mir NICHT angefasste uncommitted Änderungen (`src/sections/why-wax.tsx`,
  `public/images/compare/`) — vermutlich parallele Arbeit des Users auf
  demselben Rechner. Nicht verwechseln, nicht anfassen, nicht committen ohne
  Rückfrage.

## Chronologie der Anläufe (damit der nächste Versuch nicht dieselben Sackgassen nimmt)

1. **v1 — naive Kontur-Extraktion.** `marching squares` (skimage
   `find_contours`) direkt auf der Alpha-Maske, Douglas-Peucker vereinfacht,
   Catmull-Rom zu Bezier geglättet. Ein separater weißer SVG-`stroke` um die
   Außenkontur simuliert die "Sticker"-Kontur. Ergebnis laut User: Konturen
   "unterbrochen"/fehlend.
   - Root Cause die ich damals fand: `--nav-bg` ist im Light-Theme fast weiß
     (`rgba(249,249,249,0.92)`), ein weißer Stroke hat darauf praktisch keinen
     Kontrast. Fix: `filter: drop-shadow(...)` auf `.wx-mark-svg` in
     `index.css`, funktioniert unabhängig vom Hintergrund. **Dieser Teilfix ist
     wahrscheinlich weiterhin richtig/nötig**, hat aber das Kernproblem nicht
     gelöst.

2. **v2 — echte Kreise für die Nietlöcher.** Die Löcher waren aus rohen,
   leicht unregelmäßigen Pixel-Konturen tracet. Per Least-Squares-Kreisfit
   durch mathematisch perfekte Kreise ersetzt. Sah in isolierten Tests klar
   besser aus.

3. **v3 — Konturglättung vor Vereinfachung.** User meldete "komische
   Cutouts", sichtbare Dellen an allen drei Gliedern. Diagnose: Douglas-Peucker
   hatte einzelne verrauschte Pixel-Randpunkte durchgelassen (sie waren "weit
   genug" von der Sehne entfernt, um als "echter" Punkt zu zählen), Catmull-Rom
   hat durch diese Ausreißer Dellen gezogen. Fix-Versuch 1: Maske vor
   Konturerkennung hochskalieren + gaußweichzeichnen — hat Dellen entfernt,
   aber auch die echte Taille zwischen den beiden Ringen verwaschen (per
   Differenz-Rendering gegen Original sichtbar). Fix-Versuch 2 (übernommen):
   gleitender Mittelwert direkt auf den rohen Konturpunkten VOR der
   Vereinfachung — Diff-Check gegen Original sah danach sauber aus.
   **User meldete trotzdem: immer noch falsch, Dellen weiterhin sichtbar**,
   mit rotem Pfeil im Screenshot markiert (Taille von Glied 1 und 2, Naht
   zwischen Glied 2 und 3).

4. **v4 — der Fund, der alles ändert: Der weiße Rand ist Teil des Quell-PNGs.**
   Bei Pixel-für-Pixel-Inspektion (ungefilterte, nearest-neighbor-hochskalierte
   Crops von `logo-dark.png`, keine eigene Verarbeitung) zeigte sich: der weiße
   "Sticker"-Rand ist **im PNG selbst bereits als eigene Pixelfläche
   gerendert**, nicht nur transparenter Hintergrund neben einer farbigen
   Silhouette. Ein nachträglich aufgesetzter SVG-`stroke` entlang der ÄUSSEREN
   Kontur kann diese echte, im Bild vorhandene Randfläche prinzipiell nicht
   exakt treffen — daher die Dellen genau an den komplexesten Kurvenstellen
   (Taille, Nähte).
   - Neuer Ansatz: HSV-Test (`Sättigung < 0.18 UND Hellwert > 0.80` innerhalb
     der Alpha-Maske) trennt "weiße Randfläche" von "farbiger Körper" **als
     zwei separate, unabhängig konturierte Flächen** — kein Stroke mehr,
     stattdessen zwei echte `fill`-Pfade übereinander (weiße Silhouette unten,
     Farbverlauf-Körper oben, beide mit eigenem `fill-rule="evenodd"` für die
     Löcher).
   - Diff-Rendering gegen das Original (Canvas `globalCompositeOperation =
     'difference'`) zeigte danach eine nahezu perfekte Übereinstimmung: die
     komplette Fläche schwarz (= keine Abweichung), nur ein hauchdünner Rand
     durch normale Antialiasing-Toleranz. Auch visuell im Live-Header (per
     `XMLSerializer` + Canvas gerendert, checkered Transparenz-Hintergrund)
     sah es sauber aus — keine sichtbaren Dellen mehr an Taille oder Naht.
   - **Trotzdem: User meldet danach erneut "funktioniert immer noch nicht"**,
     diesmal ohne neuen Screenshot/genaue Ortsangabe.

## Offene Fragen für die nächste Session

1. **Was genau sieht der User noch als falsch?** Ohne neuen Screenshot lässt
   sich das nicht eingrenzen — als Erstes danach fragen, idealerweise mit
   möglichst genauer Ortsangabe (wie beim roten Pfeil in einer früheren
   Runde) oder noch besser: eine Datei statt nur Chat-Paste.

2. **Ist mein Diff-Check-Verfahren blind für das, was der User sieht?** Der
   Diff-Check vergleicht Farbwerte pixelweise gegen `logo-dark.png` — er würde
   z. B. NICHT auffallen, wenn:
   - Die Referenz, die der User im Kopf hat (die "Vorlage"-Sticker-Bilder aus
     dem Chat), **von `logo-dark.png` selbst abweicht** — dann stimmt mein SVG
     zwar exakt mit der Quelldatei überein, aber nicht mit dem, was der User
     eigentlich will. Das würde erklären, warum wiederholte Fixes gegen die
     Quelldatei nichts ändern. **Diese Möglichkeit aktiv mit dem User klären**,
     bevor weiter an der PNG-Extraktion geschraubt wird — evtl. ist
     `logo-dark.png` gar nicht das richtige Ausgangsmaterial, und es müsste
     stattdessen `public/images/logo-512.png` (höher aufgelöst, aber ohne
     Alpha — RGB mit vermutlich weißem Hintergrund) oder eine andere,
     bessere Quelle her.
   - Es könnte auch am **Rendering-Kontext** liegen (Zoomstufe im Browser,
     Retina/High-DPI-Downscaling auf die tatsächliche Anzeigegröße ~64–67px,
     wo Details verschwinden, die bei 320px-Diff-Checks unsichtbar bleiben).
     Bei so kleiner Anzeigegröße lohnt ein Test: SVG bei genau der finalen
     Pixelgröße rendern und dort vergleichen, nicht nur bei 320px oder
     hochskaliert.

3. **Alternative, die bisher nicht versucht wurde:** eine echte
   Vektorisierungs-Software (Illustrator Image Trace, vectorizer.ai,
   Figma-Plugin) statt einer selbstgebauten Python-Pipeline. Der User hat
   das in einer früheren Nachricht selbst als Option angesprochen ("wie kann
   ich das selber machen") — falls die eigene Pipeline strukturell an ihre
   Grenzen stößt, ist das evtl. der pragmatischere Weg, besonders wenn der
   User Zugriff auf die Originaldatei (evtl. Figma/Illustrator-Quelle) hat,
   die er als "Bild 5" erwähnte, aber nie tatsächlich als Datei bereitstellte.

## Technischer Pipeline-Stand (falls weiter an der Python-Extraktion gearbeitet wird)

Das Extraktions-Skript existierte nur im Scratchpad
(`/private/tmp/claude-501/.../scratchpad/logo-trace/build_svg5.py`) und wurde
NICHT ins Projekt-Repo übernommen — nur das Ergebnis (die fertigen Pfad-Strings)
wurde von Hand in `WaxcelerateMark.tsx` eingesetzt. Falls die Pipeline
weiterentwickelt werden soll, muss sie in einer neuen Session neu geschrieben
werden (Kernideen: HSV-Split weiß/farbig, gleitender Mittelwert auf
Kontur-Punkten vor Vereinfachung, Least-Squares-Kreisfit für Löcher,
Catmull-Rom für die Außenkontur) — der Code selbst ist nicht mehr vorhanden,
nur diese Beschreibung und das Ergebnis in der `.tsx`-Datei.

## Hover-Animation (separat vom SVG-Qualitätsproblem, zuletzt als "ok" gemeldet)

`src/index.css`, Suchbegriff `wx-link-assemble`: jedes Glied driftet beim
Hover leicht raus und zurück (keine Sprünge, `animation-fill-mode: backwards`
wurde bewusst NICHT mehr verwendet, weil es einen Sofort-Sprung verursachte —
siehe Kommentar im CSS). ~1,3s Dauer, gestaffelt. Das war in der letzten
Rückmeldung des Users kein Thema mehr — vermutlich unabhängig vom SVG-Problem
in Ordnung, aber nicht erneut vom User bestätigt worden.
