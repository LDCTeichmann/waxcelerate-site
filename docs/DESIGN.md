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
3. Produkte: das Regal — zwei Wachs-Tafeln (Classic/Pro, Größe als Schalter)
   oben, darunter eine Reihe aus drei gleich großen Kacheln (Set, Ketten,
   Rewax). Beide Ebenen tragen seit 09/2026 **dieselbe Karte**: Foto 16:10
   oben, getönter Textblock darunter, Haarlinien-Rahmen, beim Hover eine blaue
   Kante (`.shelf-card` in `index.css`, `ProductShelf.tsx`). Zwei Rollen —
   Kaufentscheidung vs. nächster Schritt — bleiben an Spaltenzahl (2 vs. 3)
   und Inhaltstiefe unterschieden, nicht an der Kartenform; ein A/B-Test mit
   25.000 Besuchern belegt 17,1 % mehr Umsatz pro Besucher allein durch
   einheitliche statt gemischte Kartengrößen in einem Produktraster.
   Vier Anläufe bis dahin, jeder mit einem eigenen Fehler:
   1. Vier Layouts für vier Elemente ("all over the place").
   2. Zwei Kartensprachen, aber ein `max-w-[880px]`-Deckel auf der Wachs-Reihe
      → 240 px Leerraum rechts daneben.
   3. Sekundär-Kacheln als schmale Foto-Scrim-Kacheln → auf Mobile brach der
      Text auf dem Foto um ("hässlich", "chaotisch").
   4. Sekundär-Kacheln als volle Breite Zeilen (Foto links, Text rechts) →
      auf dem Desktop rund 400 px tote Fläche je Zeile, und drei Zeilen
      untereinander dreimal so hoch wie eine Reihe.
   Der jetzige Stand nimmt aus (3) die Lehre mit (Text steht nie auf dem Foto)
   und aus (4) die Preise (jede Kachel zeigt "ab X €"), aber wieder in einer
   Dreierreihe. Zusätzlich getilgt: die Wachs-Titel lagen im Foto und
   brauchten dafür einen Scrim, der die untere Bildhälfte zu 76 % schwarz
   übermalte — bei Motiven, deren Wirkung aus Farbe kommt, kostet das genau
   die Farbe ("düster und nicht farbenfroh"). Titel und Untertitel stehen
   jetzt im Textblock neben dem Preis, das Foto trägt nur noch den
   Auszeichnungs-Chip.

   09/2026, Runde 2: Lucas Folge-Feedback ("Farben schöner", "Titel
   direkter, Karten schlauer/smoother, nur nützliche Infos") führte zu drei
   gezielten Nachjustierungen statt eines weiteren Layout-Umbaus:
   - **Titel wieder Produktnamen** statt Benefit-Sätzen ("Starter-Set" /
     "Vorgewachste Ketten" / "Kette wachsen lassen" statt "Alles dabei, beim
     ersten Mal." / "Schon gewachst. Von Hand." / "Wir wachsen sie für
     dich."). Kehrt die Runde-1-Begründung in `i18n.ts` (CeramicSpeed-Ansatz,
     "Titel sagen was der Kunde davon hat") teilweise um — auf Lucas
     ausdrücklichen Wunsch, dort ausführlich kommentiert stehen gelassen.
     Die Eyebrows behalten die Einwand-Framing-Rolle, nur die Titel wechseln
     zu direkten Namen. "Rewax" bleibt bewusst nur Eyebrow/CTA-Wort, nicht
     Titel — siehe die dokumentierte SEO-Entscheidung in `i18n.ts:10-13`,
     dass im Deutschen niemand "Rewax" sucht.
   - **Redundante Info raus:** `rewaxBody` nannte den Preis ein zweites Mal,
     obwohl dieselbe Kachel schon ein eigenes `price`-Badge zeigt — gestrichen.
     `setBody` verlor den Gedankenstrich und die Wertung "kein Fehlkauf"
     (Skill-Regel: keine Gedankenstriche in Kundentexten; die reine
     Inhaltsangabe ist die nützliche Information, die Wertung nicht).
   - **Wachsfotos farbiger, nicht getauscht:** `.photo-wax` ging von
     `saturate(0.9)` (Runde 1, gegen den alten Olivstich gerechnet) auf
     `saturate(1.12) contrast(1.05) brightness(1.015)` — eine echte Anhebung
     über den Bildoriginalwert, keine schwächere Abschwächung. Per
     Screenshot-Vergleich gegen 1.1/1.25 geprüft, 1.25 kippte den
     Hintergrund bereits unnatürlich knallgrün.
   - Eckenradius beider Kartenebenen von 16px auf 20px angehoben
     (`rounded-[20px]` statt `rounded-2xl`), Sekundär-Kachel-Titel von
     16-17px auf 17-18.5px, näher an WaxPanels Produktnamen-Größe — die
     Titel sind jetzt kurze Namen statt Sätze und brauchen mehr Gewicht, um
     als Überschrift zu lesen statt als Fließtext-Zeile.
   - Set-, Ketten- und Rewax-Foto folgen als separater Schritt (Lucas eigene
     Bildauswahl über `image-drop/`, siehe §5).

   09/2026, Runde 3: Set/Ketten/Rewax-Fotos sind da (siehe §5 fuer die
   Bildauswahl selbst), dazu drei weitere Nachjustierungen auf Lucas
   Rueckmeldung ("Calls brillanter", "Karten schlauer und smoother",
   "nuetzliche Infos ergaenzen"):
   - **Hover-Glow.** Lucas Referenz war ein Cyclus2-Screenshot mit blauer
     Kante beim Hover — die gab es seit Runde 1 schon als statische
     `border-color` + `--card-shadow-hover`, aber Rueckmeldung wollte sie
     zusaetzlich "auffaellig, aber sehr dezent" und "in den Blautoenen der
     Website". `.shelf-card:hover` bekommt jetzt einen sanften Puls
     (`shelf-card-glow`-Keyframe, 2.6s, `ease-in-out`), der `--accent-soft-rgb`
     als zusaetzliche Box-Shadow-Ebene ein- und ausblendet — dieselbe
     Technik wie `.cta-brand-pulse` weiter oben in `index.css`, dort aber
     bewusst schwaecher dosiert (0.22 Alpha/22px Blur/2px Spread statt
     0.35/26px/6px) und NUR waehrend `:hover` aktiv statt dauerhaft: fuenf
     Kacheln, die permanent pulsieren, waeren Dauerreiz statt Feedback.
   - **Lieferzeit bei den Ketten.** Neuer optionaler `delivery`-Prop auf
     `SecondaryTile`, nur bei "Vorgewachste Ketten" gesetzt (dieselbe
     Truck-Icon-Grammatik wie WaxPanel) — Set und Rewax haben keine
     klassische Lieferzeit (Set fuehrt zu einer eigenen Konfiguratorseite,
     Rewax ist ein Turnaround statt einer Zustellung), nur bei den Ketten
     war es eine echte Luecke.
   - **CTA-Pille reagiert jetzt auf den Card-Hover** (`group-hover:scale-[1.035]`
     zusaetzlich zum bestehenden `opacity-90`) — dieselbe Mikro-Interaktion
     wie `active:scale` bei den eBay-Buttons oben, hier auf Hover statt
     Press gemuenzt, damit der Button "antwortet" statt nur die Karte.
   - **Bewusst NICHT umgesetzt:** Text/Preis in die Fotos einbetten — siehe
     Begruendung in §5.
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
Schiefer vor grünem Bokeh. Die Regel war zwischenzeitlich gebrochen: das
`wax-classic`-Motiv wurde am 26.08.2026 gegen eine Aufsicht auf dunklem
Schiefer getauscht — anderes Licht, anderer Winkel, kein Bokeh — und genau
dieses Bild las sich neben dem Pro als düster. Seit 09/2026 wieder das Paar
aus dem Skript, beide mit identischem Zuschnitt (16:10 wie die Karte, `zoom`
so gewählt, dass beide Blöcke gleich groß im Bild stehen).
Stehen zwei Produkte nebeneinander und unterscheiden sich Winkel oder Licht,
vergleicht der Betrachter die Fotografie statt das Wachs. Der grüne
Hintergrund löst nebenbei das alte Pro-Problem: schwarzes Wachs auf dunklem
Schiefer war im Noir-Theme praktisch unsichtbar und musste mit
`.wax-card-pro-glow` übermalt werden.

**Runde 3 (09/2026): Set/Ketten/Rewax haben jetzt eigene Fotos, Lucas eigene
Auswahl statt Archivmaterial.** Workflow: drei leere Ordner unter
`image-drop/` (gitignored), Luca legt je ein Foto rein, `sharp` schneidet
via drei neue Jobs in `build-shelf-images.mjs` auf 16:10 zu (`shelf-set`,
`shelf-ketten`, `shelf-rewax`). Ergebnis: Set zeigt Wachsblock + Kettenzange
+ Kette + Schaltauge (dieselbe Utensilien-Aufnahme, die auch den Karteninhalt
beschreibt — Foto und Textzeile sagen dasselbe, statt dass das Foto nur
Stimmung liefert), Ketten einen Kette-Makro-Ausschnitt mit Quick-Link,
Rewax den Waxcelerate-Versandkarton samt gewachster Kette vor Stuttgarter
Landschaft. Alle drei farbig und im selben Blau-Grün-Gold-Spektrum wie die
Wachsfotos — "farbenfroh, aber stimmig" war Lucas Vorgabe für diese Runde.

Damit tragen jetzt **alle fünf Regal-Fotos dieselbe Filterregel**,
`.photo-shelf` (Sättigung 1,12, vorher `.photo-wax` nur für die zwei
Wachsfotos) — `.photo-neutral` (0,68 Entsättigung) ist damit fürs Regal
ausgemustert (siehe Kommentar in `index.css`): die alte Regel war gegen den
Olivstich der VIER alten Bokeh-Fotos gerechnet, die jetzt ersetzt sind,
und eine gemeinsame Filterregel für die ganze Sektion trägt "stimmig"
direkter als zwei verschiedene.

Bewusste Entscheidung gegen eingebetteten Text in den Fotos: Titel, Preis und
Lieferzeit bleiben im Textblock unter dem Foto, nicht als Overlay auf dem
Bild selbst. Grund derselbe wie beim WaxPanel-Umbau in Runde 2 (Text auf
Foto braucht einen Scrim, der genau die Farbe kostet, die die neuen Fotos
tragen sollen) — zusätzlich macht ein reiner Fotoausschnitt ohne Text die
Bilder unabhängig von Sprache (DE/EN) und von künftigen Copy-Änderungen,
ohne dass ein Zuschnitt neu gerechnet werden muss.

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
