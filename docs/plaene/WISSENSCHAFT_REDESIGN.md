# Wissenschaftsseite: Analyse, Faktenprüfung und Umbaukonzept

Stand 2026-09-15. Grundlage: vollständiger Durchgang durch `src/pages/SciencePage.tsx`,
`src/lib/science.ts`, `src/sections/science/*`, `src/lib/data.ts` (`waxVsOil`,
`frictionRanges`) und Abgleich gegen den Skill `waxcelerate`
(`30_claims_language`, `40_technical_kb`, `90_decision_log`) sowie gegen externe
Literatur.

Diese Datei ersetzt `docs/WISSENSCHAFT_NOTES.md` nicht, sie baut darauf auf.
Die Notes beschreiben den Umbau von 07/2026, hier steht der Befund von heute.

---

## 0. Die Kurzfassung

Die Seite ist handwerklich gut gebaut und inhaltlich an mehreren Stellen nicht
haltbar. Drei Dinge fallen zusammen:

1. **Die stärksten Argumente haben keine Grafik, die schwächsten haben drei.**
   Der µ-Wert 0,03 ist die angreifbarste Zahl der ganzen Seite und trägt Hero,
   Balkendiagramm, Formel-Knoten und Fußzeile. Der Schmutz-Mechanismus
   ("Öl bindet Schleifpaste"), also das Argument, das man fotografieren kann,
   das niemand bestreitet und für das wir eigene Belege erzeugen könnten,
   hat einen halben Satz in Zone 02.
2. **Der Graph „Warum Öl hier aufgibt" behauptet eine Physik, die es nicht gibt.**
   Lucas Verdacht stimmt. Details in Abschnitt 2. Das Schlimme daran: der
   *richtige* Grund steht schon zwei Abschnitte weiter oben auf derselben Seite,
   im Absatz über das Losbrechen, und ist deutlich stärker als der behauptete.
3. **Die Seite ist eine Sammlung von Panels, keine Erzählung.** Sie zeigt eine
   Kassette, ein Gelenk, einen Knotengraph, ein Kristallgitter, einen
   Mikroskop-Vergleich und zwei Balkendiagramme. Jedes für sich ist ordentlich.
   Zusammen fehlt der Faden. Dabei liegt er auf der Hand und ist unten in
   Abschnitt 4 ausgeführt: es ist **ein einziger Zoom über fünf Maßstäbe**,
   und alle vorhandenen Grafiken sitzen bereits auf genau einem davon.

Reihenfolge der Arbeit: erst die Zahlen geradeziehen (Abschnitt 1 und 2), das
ist Risiko und keine Geschmacksfrage. Danach der Umbau (Abschnitt 3 bis 6).

---

## 1. Faktenprüfung, Aussage für Aussage

Legende: **falsch** = inhaltlich nicht haltbar · **unbelegt** = kann stimmen,
hat aber keine Quelle und ist im Streitfall nicht verteidigbar · **Widerspruch**
= kollidiert mit einer anderen Stelle im Projekt · **ok** = geprüft, stimmt.

### 1.1 Die Reibwerte (`frictionRanges`, `waxVsOil.friction`)

| Wert | Ort | Befund |
|---|---|---|
| µ 0,03 für MoS₂ | Hero-Kachel, `HexMoS2`-Fußzeile, `mos2.metric`, Formel-Story | **falsch im Kontext** |
| µ 0,03–0,06 Pro / 0,05–0,07 Classic | `frictionRanges`, Hero, `FrictionBars`, `LineChoice` | **unbelegt** |
| µ 0,18–0,25 Öl | dieselben Stellen | **unbelegt, vermutlich zu hoch** |
| `pct` 100 / 80 / 18 als Balkenlänge | `FrictionBars` | **Darstellungsproblem** |

**µ 0,03 ist ein Vakuumwert.** Das ist der Kern des Problems und es ist gravierender
als das, was in `PROJECT.md` bisher unter „bester Wert der Pro-Spanne" steht.
MoS₂ erreicht µ ≈ 0,01 bis 0,03 im Hochvakuum und in Inertgas. In *trockener Luft*
liegt es bei etwa 0,17, unter Wasserdampf bei etwa 0,30. Die Literatur ist da
eindeutig und seit Jahrzehnten stabil: MoS₂ ist der klassische Vakuum-Festschmierstoff,
und seine Achillesferse ist Luftfeuchte. Eine Fahrradkette fährt per Definition in
feuchter Umgebungsluft.

Das heißt nicht, dass MoS₂ im Kettenwachs nichts bringt. Es heißt, dass die Zahl
0,03 aus einer Umgebung stammt, in der unser Produkt nie arbeitet. Als Kennwert
eines Feststoffs im Datenblatt ist sie korrekt, als Zahl auf einer Verkaufsseite
neben „Reibung im Antrieb" ist sie es nicht. Wenn ein technisch versierter Kunde
das nachschlägt, und genau diese Kunden kommen auf eine Seite, die
„Gemessen, nicht behauptet" heißt, ist der Schaden größer als der Nutzen der Zahl.

**µ 0,18–0,25 für Öl geht in die andere Richtung.** Grenzgeschmierter Stahl auf
Stahl mit einem handelsüblichen Kettenöl liegt eher bei 0,08 bis 0,12. 0,2 ist
der Bereich, in dem man von mangelhafter Schmierung spricht. Die Spanne ist also
zu unseren Gunsten gesetzt, und zwar deutlich. Das ist genau die Art von Zahl,
die ein Wettbewerber oder ein Forenkommentar aufmacht.

**Der `pct`-Wert ist eine Designgröße, sieht aber aus wie eine Messung.**
100 / 80 / 18 ist ein Index, den wir selbst gesetzt haben. Im Diagramm steht er
als Balkenlänge direkt neben echten µ-Zahlen in Monospace, in einem
`InstrumentFrame` mit Punktraster und Eckmarken, unter der Überschrift
„Gemessen, nicht behauptet". Formal steht nirgends, dass der Balken eine Messung
ist. Gelesen wird er als eine. Nebenbei ist er auch intern nicht konsistent: aus
µ 0,03–0,06 gegen µ 0,18–0,25 lässt sich kein Verhältnis 100 : 18 herleiten,
auf keiner Rechnung.

**Empfehlung.** Die µ-Zeile als Leitzahl der Seite aufgeben. Sie ist nicht
reparierbar, nur ersetzbar. Was stattdessen trägt, steht in Abschnitt 1.2: die
Wattzahlen sind echte, unabhängig gemessene, veröffentlichte Werte für genau
unseren Anwendungsfall. Wenn µ überhaupt bleiben soll, dann ausschließlich im
Kapitel über den Festschmierstoff, mit der Umgebungsangabe daneben
("MoS₂ erreicht im Labor unter trockenen Bedingungen µ ≈ 0,03; in feuchter Luft
liegt der Wert höher"). Ehrlich gesagt macht das die Zahl als Verkaufsargument
wertlos, und das ist die richtige Erkenntnis: sie war nie eins.

### 1.2 Die Wattzahlen (`waxVsOil.watts`)

| Wert | Befund |
|---|---|
| Wachs 2–4 W, Öl 6–10 W | **Größenordnung ok** |
| „bei 300–400 W Tretleistung" | **falsch** |
| Skill sagt „ca. 2,6 W vs. ca. 7,5 W" | **Widerspruch zu `data.ts`** |

Die veröffentlichten Werte von Zero Friction Cycling entstehen bei **250 W**
Eingangsleistung und 90 U/min. Frisches Heißwachs liegt dort bei etwa 2 bis 3 W,
frisches Nassöl bei 5 bis 7 W, verschmutztes Nassöl nach ein paar hundert
Kilometern bei 8 bis 12 W. Unsere Spannen passen also gut zu den Messungen, aber
die Eingangsleistung stimmt nicht. Reibungsverlust skaliert im Wesentlichen mit
der Last, das heißt: bei 350 W wären die Absolutwerte *höher*, nicht gleich.
Die Zeile „Laborwerte von Zero Friction Cycling bei 300–400 W Tretleistung"
schreibt einer fremden Messung eine Bedingung zu, unter der sie nicht entstanden ist.

Das betrifft nicht nur die Website, sondern die **Claims-Tabelle im Skill selbst**
(`30_claims_language`, Zeile „Watt-Zahlen als Richtwert"). Der Fehler ist dort
dieselbe Formulierung. Das sollte an der Wurzel korrigiert werden, sonst wandert
er in die nächste eBay-Beschreibung.

Zweiter Punkt: `data.ts` sagt 2–4 gegen 6–10, der Skill sagt 2,6 gegen 7,5.
Beides gleichzeitig ist nicht haltbar. Vorschlag: `data.ts` hat recht (eine Spanne
ist ehrlicher als eine Kommastelle, die Präzision suggeriert), der Skill zieht nach,
und beide nennen 250 W.

Dritter Punkt, klein: die Hero-Kachel nennt das „Antriebsverlust". Gemessen wird
in diesen Tests der **Kettenverlust**, nicht der Antrieb inklusive Schaltrollen
und Verzahnung. „Reibungsverlust in der Kette" ist dasselbe Wort weniger und dafür
richtig.

### 1.3 Der Graph „Warum Öl hier aufgibt" (`TransferFilm` in `LabViz.tsx`)

Eigener Abschnitt, siehe **Abschnitt 2**. Kurzfassung: die Kernaussage ist falsch.

### 1.4 Die Formel-Inhalte (`science.ts`)

| Aussage | Befund |
|---|---|
| Orthorhombisch, a = 7,42 Å, b = 4,96 Å | **ok**, Standardwerte für Paraffin |
| „~10 nm dünne Lamellen" | **falsch** |
| MoS₂ 5,06 g/cm³, „5,6× dichter als Wachs" | **ok**, 5,06 / 0,9 = 5,62 |
| Stokes: 5 µm sinken ~0,8 mm/min bei 65 °C, η ≈ 3,5 mPa·s | **ok**, nachgerechnet ≈ 1,0 mm/min |
| MoS₂ Interlayer-Bindungsenergie „~0,55 J/m²" | **unbelegt**, Literatur eher 0,25–0,30 J/m² |
| Kontaktpunkte erreichen „45–55 °C unter Last" | **unbelegt** |
| MoO₃ „hart, abrasiv, Mohshärte ~5,5" | **falsch bis unbelegt** |
| FT-Wachs >90 % Kristallinität, Tropfpunkt ~75 °C | **plausibel**, unbelegt |
| „12 Monate stabile Lagerung" | **Widerspruch zum Technik-KB** |
| Partikel < 5 µm passen in Spalte von 5–15 µm | **unbelegt** |

**Die 10-nm-Lamelle** lässt sich in einer Zeile widerlegen und das sollte sie
auch, bevor es jemand anders tut. Eine all-trans gestreckte C36-Kette ist rund
1,27 Å je CH₂-Gruppe lang, also etwa 4,6 nm. Eine einzelne Lamelle kann nicht
dicker sein als ihre Moleküle lang sind. Die knapp 9 bis 10 nm, die man in der
Literatur findet, sind die *Periode* eines Doppelstapels. Richtig wäre also
„Lamellen von rund 4 bis 5 nm" oder „eine Schichtperiode von rund 9 nm".
Steht schon als offener Punkt in `PROJECT.md`, ist aber nicht erledigt, und die
Zahl steht inzwischen an drei Stellen (`sumDe`, `physicsDe[2]`, `FORMULA_STORY[0]`).

**MoO₃.** Die Aussage „hartes, abrasives Material (Mohshärte ~5,5 vs. MoS₂ ~1)"
ist tribologisches Hörensagen. Molybdit, also natürliches MoO₃, gilt als sehr
weich; eine Härte von 5,5 ist in den Mineralogie-Handbüchern nicht zu finden, dort
steht die Härte überwiegend als nicht bestimmt oder im Bereich 1 bis 2. Der real
belegte Mechanismus ist auch ein anderer und für uns sogar besser erzählbar: die
Oxidation **erhöht die Scherfestigkeit der Gleitfläche**, das heißt die Schichten
gleiten schlechter aufeinander. Es wird nicht schmirgelig, es wird zäh. Ein Satz
umschreiben, und aus einer angreifbaren Behauptung wird eine belegbare.

**Die 12 Monate.** Die Seite sagt „12 Monate stabile Lagerung", das Technik-KB
sagt, Wachs „verdirbt nicht" (nur nicht in die Sommersonne). Das eine schließt das
andere nicht logisch aus, liest sich für einen Kunden aber als Haltbarkeitsdatum,
das wir gar nicht behaupten wollen. Entweder streichen oder als das ausweisen, was
es ist: die getestete Lagerzeit, nicht die Grenze.

### 1.5 Innere Widersprüche

**Der gravierendste:** `LineChoice` schließt mit „Beide Linien nutzen dieselbe
Wachsmatrix. Der Unterschied liegt allein im Feststoff." Direkt daneben in
`science.ts` sagt `diveFormula('classic')`, dass Classic **kein FT-Wachs und kein
Antioxidans** enthält. Das ist nicht derselbe Matrixaufbau, sondern ein anderer.
Beides steht live auf der Website, das eine auf der Wissenschaftsseite, das andere
im Hero-Dive der Startseite. Das muss Luca entscheiden, weil nur er die Formel
kennt; die Website kann es nicht auflösen.

Daran hängt direkt das **Temperaturfenster**: Classic „+5…~35 °C" gegen Pro
„−8…45+ °C". Wenn die Matrix dieselbe wäre, gäbe es für die obere Grenze keinen
Grund, der Tropfpunkt liegt in beiden Fällen weit über 35 °C Außentemperatur. Ist
die Matrix nicht dieselbe (kein FT-Wachs in Classic), ergibt die Grenze Sinn,
dann stimmt aber der Satz darunter nicht. Die Zahlen selbst sind übrigens
ebenfalls unbelegt, insbesondere das offene „45+" mit Pfeil.

**Das Rewax-Intervall.** In `ACT III` steht als Kachel „~300 km pro
Rewax-Vorgang". Die Entscheidung D1 im Decision Log, die höchste Präzedenz hat,
lautet 400 bis 550 km. Auch der Fließtext in `TempWindow` und der Blog nennen
andere Werte. `PROJECT.md` weiß von der Divergenz und hat sie bewusst stehen
lassen. Auf der Wissenschaftsseite, in einem Panel mit Messgeräteoptik, ist sie
besonders unglücklich, weil sie neben zwei Zahlen steht, die aus einer Quelle
stammen sollen.

**„Gemessen in Zone 01."** Der Schlusssatz vor dem CTA lautet
„2–3× Kettenlaufzeit gegenüber Öl, gemessen in Zone 01." Es wurde nichts in
Zone 01 gemessen, von niemandem. Zone 01 ist unsere eigene didaktische Benennung
einer Kontaktfläche. Die Kettenlaufzeit stammt aus Praxiswerten. Das ist der
klarste Claims-Verstoß auf der Seite, weil das Wort „gemessen" hier eine Messung
behauptet, die es nicht gibt.

**„Gemessen, nicht behauptet."** Die H2 von ACT III, direkt darunter der Absatz
„Diese Werte stammen aus unabhängigen Labortests von Zero Friction Cycling, nicht
aus eigenen Messungen von Waxcelerate." Der Disclaimer ist vorbildlich ehrlich und
genau richtig. Nur steht er unter einer Überschrift, die das Gegenteil suggeriert.
Die Überschrift ist das Problem, nicht der Absatz. „Was unabhängig gemessen wurde"
kostet nichts und stimmt.

### 1.6 Quellen und Bildmaterial

**Die Quellenzeile** im Footer lautet „Friction Facts / Zero Friction Cycling,
‚Friction-Producing Mechanisms of a Bicycle Chain'". Das sind zwei verschiedene
Firmen, mit Schrägstrich verbunden, als wären sie eine. Friction Facts (USA) hat
das Papier verfasst, Zero Friction Cycling (Australien) hostet es und macht eigene,
andere Tests. Dazu fehlen Jahr und URL. Eine Seite mit dem Anspruch dieser Seite
sollte eine saubere Quellenangabe haben, das ist eine Zeile Arbeit.

**Die Mikroskopaufnahmen** sind der heikelste Punkt der ganzen Seite, und zwar
nicht fachlich, sondern rechtlich. Die Bildunterschrift sagt inzwischen ehrlich
„keine Aufnahmen der hier verkauften Chargen". Damit bleibt offen, was sie dann
sind und woher sie kommen. Acht Aufnahmen, beschriftet mit „Referenz" gegen
„MoS₂", mit Vergrößerungsangaben von 1 000× bis 2 500×, in einem Vorher-Nachher-
Schieber auf einer Verkaufsseite. Das liest jeder als Beleg für unser Produkt.
Zwei Risiken: Bildrechte (wenn die Herkunft ungeklärt ist) und § 5 UWG
(Irreführung durch Belege, die nichts belegen). Mein Rat: raus, bis geklärt ist,
woher sie stammen und ob wir sie zeigen dürfen. Ein starker Abschnitt weniger ist
besser als ein Abschnitt, der ein Verfahren auslöst.

### 1.7 Sprache

Die verbindliche Regel aus `30_claims_language` ist eindeutig: **niemals
Gedankenstriche als Satzzeichen in Kundencopy.** In `science.ts` allein stehen
rund 90 Zeilen Kundentext mit Geviertstrich, dazu 10 in `SciencePage.tsx` und
weitere in `ContactZones.tsx` und `LabViz.tsx`. Das ist kein Detail, das ist die
am häufigsten verletzte Sprachregel im Projekt und sie betrifft ausgerechnet die
Seite mit der längsten Fließtextstrecke. Ein Durchgang, der Gedankenstriche durch
Punkt, Komma oder Doppelpunkt ersetzt, macht den Text nebenbei auch besser
lesbar, weil der Strich in fast allen Fällen einen zu langen Satz zusammenhält.

### 1.8 Was geprüft wurde und stimmt

Damit der Befund nicht einseitig wirkt, das hier ist sauber und sollte so bleiben:

- Buchsenlose 9- bis 12-fach-Ketten, Schulter der Innenlasche übernimmt die
  Buchsenfunktion. Korrekt und für unsere Ketten relevant.
- „Paraffin allein ist unter hohem Druck nur durchschnittlich." Korrekt, deckt
  sich mit der zitierten Quelle, und es ist selten, dass eine Verkaufsseite eine
  Schwäche des eigenen Grundstoffs nennt. Das ist der beste Absatz der Seite.
- Kettenlebensdauer 2–3×. Deckt sich mit D2.
- Ersparnis 47 € auf 12.000 km. Aus `waxMath.ts` abgeleitet, dokumentiert,
  Annahmen zugunsten von Öl gesetzt.
- Die PFAS-Zeile in `LineChoice`: „Classic: Enthalten (PTFE)". Genau der ruhige,
  offene Umgang, den die Claims-Regeln verlangen.
- Die Stokes-Rechnung und die Dichteangaben zum Dispergiersystem.
- Der Methodik-Absatz in ACT III (nur die Überschrift darüber passt nicht).

---

## 2. Der Graph „Warum Öl hier aufgibt": warum er weg muss

Der Verdacht stimmt. Der Graph ist an drei Stellen gleichzeitig kaputt.

### 2.1 Die Kernaussage ist physikalisch falsch

Unter dem Diagramm steht: **„Gestrichelt: ab 50 MPa trägt kein Flüssigfilm mehr,
Grenzschmierung."**

Grenzschmierung wird nicht durch einen Druckschwellwert ausgelöst. Sie wird durch
das Verhältnis von Schmierfilmdicke zu Oberflächenrauheit bestimmt, und diese
Filmdicke hängt vor allem von der **Einlaufgeschwindigkeit** ab, dazu von
Viskosität und Geometrie. Druck allein zerstört keinen Film. Im Gegenteil: unter
hohem Druck steigt die Viskosität eines Öls um Größenordnungen, das ist der Grund,
warum elastohydrodynamische Filme in Wälzlagern und Zahnrädern bei 1 bis 3 GPa
tragen, also beim Zehnfachen dessen, was unser Diagramm als Todesgrenze
einzeichnet. Wären 50 MPa das Ende der Flüssigschmierung, gäbe es kein einziges
funktionierendes Wälzlager.

Der wahre Grund, warum ein Kettengelenk grenzgeschmiert läuft, ist ein anderer und
ein besserer: **das Gelenk dreht sich nicht, es schwenkt.** Bei jedem Ein- und
Auslauf am Ritzel öffnet es sich und schließt sich wieder. Die Gleitgeschwindigkeit
geht dabei zweimal pro Zyklus durch null. Bei Geschwindigkeit null baut sich kein
hydrodynamischer Film auf, egal wie gut das Öl ist und egal bei welchem Druck.
Deshalb ist die Kette einer der wenigen Maschinenelemente, die dauerhaft im
Grenzreibungsgebiet arbeiten.

Und jetzt das Ärgerliche: **genau dieser Satz steht schon auf der Seite.** In
`ContactZones`, im Absatz mit der Akzentlinie: „Ein Kettenglied dreht sich nie
durch, es kippt auf und wieder zurück. Jede Bewegung beginnt bei null und muss
zuerst die Haftreibung überwinden, bevor ein Flüssigfilm überhaupt schert." Das
ist richtig, das ist stark, und es ist der Beweis, den das Panel weiter unten
führen will. Das Panel behauptet stattdessen eine Druckgrenze, die es nicht gibt.

### 2.2 Die Achse vergleicht drei verschiedene Größen

- **Fahrradreifen 0,25 MPa** ist ein *Fülldruck*. Er entspricht ungefähr der
  Flächenpressung im Latsch, insofern ist er noch der sauberste der drei Werte.
  Nur sind 0,25 MPa 2,5 bar, also ein weicher MTB-Reifen. Ein Rennrad fährt 6 bis
  8 bar. Der Wert ist nicht repräsentativ für das, was der Leser sich vorstellt.
- **Hydraulikpresse 30 MPa** ist ein *Systemdruck in einer Flüssigkeit*. Mit einer
  Flächenpressung zwischen zwei Festkörpern hat das nichts zu tun. Eine Presse
  erzeugt an ihrem Werkzeug völlig andere Pressungen, je nach Fläche.
- **Kettengelenk 50–300 MPa** ist eine *Flächenpressung im Festkörperkontakt*.

Drei physikalisch verschiedene Größen auf einer logarithmischen Achse, damit die
Kette gewinnt. Das ist der Teil, den man auf den ersten Blick nicht sieht und der
einem Ingenieur im ersten Moment auffällt.

### 2.3 Die Zahl selbst ist plausibel, aber unbelegt

50 bis 300 MPa lässt sich grob nachrechnen. Bei einem Bolzendurchmesser um
3,65 mm und einer tragenden Länge um 3 mm ergibt sich eine projizierte Fläche von
etwa 11 mm². Bei 500 N Kettenzug, also zügigem Fahren, sind das rund 45 MPa, bei
1.500 N Antritt rund 135 MPa. Die Spanne ist also nicht erfunden. Sie ist nur
nirgends hergeleitet und steht als Messwert da.

### 2.4 Was an die Stelle gehört

Vorschlag: **„Jede Bewegung beginnt bei null."** Ein Panel, das die
Gelenkbewegung selbst zeigt statt eines Druckvergleichs.

Aufbau, zwei übereinanderliegende Spuren über eine Gelenkbewegung hinweg (also
ein Ein- und Auslauf am Ritzel, das sind ein paar Grad Schwenk):

- **Spur 1, Gleitgeschwindigkeit.** Eine Kurve, die zweimal durch null geht.
  Die Nulldurchgänge sind die Pointe und werden markiert.
- **Spur 2, Filmdicke.** Zwei Linien im selben Raster. Die Öl-Linie folgt der
  Geschwindigkeit und fällt an jedem Nulldurchgang auf null. Die Wachs-Linie ist
  eine waagerechte Gerade, weil ein Feststofffilm nicht aufgebaut werden muss.
  Er ist da.

Das ist derselbe Kontrast wie bisher, nur ist er diesmal richtig. Er braucht keine
erfundene Schwelle, keinen schiefen Vergleich, und er greift den Absatz aus
`ContactZones` auf, statt neben ihm zu stehen. Die drei Kennzahlen in der Fußzeile
können bleiben, nur „50–300 MPa Kontaktdruck" wandert dorthin, wo es hingehört:
in den MoS₂-Abschnitt, wo der Text die Zahl ohnehin schon erklärt.

Wenn der Druckvergleich unbedingt bleiben soll, dann nur mit Flächenpressungen
gegen Flächenpressungen (Reifenlatsch, Schuhsohle, Zahnradflanke, Kettengelenk),
ohne Schwellenlinie und mit dem Hinweis, dass es sich um überschlägige Werte
handelt. Ich halte das aber für die schwächere Lösung: es bleibt eine Grafik, die
nur zeigt, dass es eng zugeht, und nicht, warum das für Öl ein Problem ist.

---

## 3. Der Hero

### 3.1 Was heute da ist

Ein freigestelltes Kassettenfoto mit Lupenring auf einem Zahn, einer Führungslinie
nach unten, einer geteilten Linse neu/abgenutzt und einem gezeichneten Zahnprofil.
Daneben drei Kennzahlen und die Überschrift „Ein messbarer Unterschied."

Das ist sauber gebaut, die 2026-09-Überarbeitung mit Lupe und Führungslinie hat
ein echtes Problem gelöst. Aber der Hero zeigt die **Kassette**, also das Bauteil,
über das die Seite danach nicht mehr spricht. ACT I handelt vom Kettengelenk,
ACT II von der Formel, ACT III vom Reibwert. Die Kassette kommt nie wieder vor.
Der Einstieg zeigt also die Folge, und die ganze Seite erklärt danach die Ursache,
ohne dass die Verbindung je gezeichnet wird.

### 3.2 Was die Produktseiten inzwischen besser machen

Auf der Wachs-Produktseite steht `FrictionLens` (Kapitel 02): die Kette in
Seitenansicht, so wie sie am Rad hängt, dazu eine Lupe, die durch den Bolzen eines
Gelenks schaut, und ein Umschalter Öl gegen Wachs, der dieselben Spalte einmal als
körnige Schleifpaste und einmal als sauberen blauen Film zeigt.

Das ist die beste Grafik, die das Projekt hat, und zwar aus drei Gründen:

1. **Die Ansicht stimmt mit der Anschauung überein.** Die Kette steht aufrecht, man
   sieht sie von der Seite. Der Kommentar in `ChainWaxMap.tsx` beschreibt Lucas
   wiederkehrende Rückmeldung genau: jeder Schnitt durch ein Gelenk legt die Kette
   auf die Seite, und so sieht man sie am Rad nie.
2. **Der Umschalter macht den Unterschied körperlich.** Nicht zwei Balken, die man
   vergleichen muss, sondern dieselbe Stelle, die sich vor den Augen verändert.
3. **Die Farbregel trägt.** Alles Metall bleibt grau, Blau ist ausschließlich das
   Wachs. Dadurch liest man „wo ist Wachs" ohne eine einzige Beschriftung.

### 3.3 Konzept: die Kette als Einstieg und als Inhaltsverzeichnis

Der Hero der Wissenschaftsseite sollte dieselbe Zeichensprache aufnehmen, aber
eine andere Aufgabe bekommen als auf der Produktseite. Dort ist die Lupe ein
Kapitel, das eine Frage beantwortet. Hier ist sie der **Grundriss der ganzen Seite**.

Bild: die Kette in Seitenansicht läuft von links ins Bild, um ein Ritzel herum und
rechts wieder heraus. Eine Lupe liegt auf einem Gelenk. Drei Dinge sind
anklickbare Einstiege, jeder mit einer Haarlinie zu seinem Abschnitt:

- **das Gelenk in der Lupe** führt zu ACT I, den Kontaktzonen
- **der blaue Film im Spalt** führt zu ACT II, der Formel
- **die Zahnflanke am Ritzel** führt zu ACT III, dem Verschleiß und den Zahlen

Damit ist die Kassette nicht weg, sie sitzt nur da, wo sie hingehört: am Ende der
Kausalkette, nicht an ihrem Anfang. Und die Seite hat zum ersten Mal eine Karte.
Wer nur zehn Sekunden bleibt, hat trotzdem verstanden, worum es geht, weil die
Zeichnung die Struktur der Seite *ist*.

Der Öl-Wachs-Umschalter bleibt auf der Produktseite. Im Hero wäre er eine zweite
Interaktion neben der Navigation und würde die Aufgabe verwischen.

Die Kennzahlen daneben bleiben, aber mit der Korrektur aus 1.1 und 1.2: statt
µ-Wert, Watt und Laufzeit besser Watt (mit 250 W), Laufzeit (2–3×) und
Rewax-Intervall (400–550 km). Alle drei sind belegbar, alle drei bedeuten dem
Leser etwas.

### 3.4 Was das technisch bedeutet

`FrictionLens` ist heute **nicht wiederverwendbar**. Die Farben stehen als
Hex-Literale im SVG (`#262B33`, `#A9B2BD`, `#5685C0`, `#3A2F24`), weil das Kapitel
in einem erzwungenen Dunkelband läuft (`wxp-darkband pdp-dark`). Die
Wissenschaftsseite ist themefähig und arbeitet mit Tokens.

Also nicht kopieren, sondern **die Geometrie herausziehen**. Vorschlag:
`src/components/viz/chain/` mit der Kettengeometrie (Laschenpfad, Bolzenraster,
Rollen) und der Lupengeometrie (konzentrische Ringe mit den Verhältnissen
Bolzen : Kragen : Rolle etwa 1 : 2 : 3) als tokenfähige Primitive. Darauf setzen
dann drei Verwender auf: `FrictionLens` (Produktseite, Umschalter),
`ChainWaxMap` (ACT I, drei Ansichten) und der neue Hero (Einstiegskarte).

Das ist nicht nur Aufräumen. Heute existieren **drei unabhängig gezeichnete
Ketten** im Projekt mit unterschiedlichen Proportionen. Sie werden auseinander
driften, sobald jemand eine davon anfasst. Eine Quelle für die Geometrie ist
dieselbe Regel, die `CLAUDE.md` schon für Produktdaten aufstellt.

---

## 4. Die Klammer: ein Zoom über fünf Maßstäbe

Das ist der eigentliche Vorschlag für die Gesamtstruktur, und er kostet fast
keine neue Grafik.

Die Seite hat heute sechs Panels, die visuell nichts miteinander zu tun haben.
Tatsächlich sitzen sie auf einer einzigen Skala, von grob nach fein:

| Maßstab | Was man sieht | Vorhandene Grafik |
|---|---|---|
| ~10 cm | Kette am Ritzel | neuer Hero / `FrictionLens` |
| ~1 cm | ein Gelenk, drei Kontaktflächen | `ChainWaxMap` (ACT I) |
| ~100 µm | der Spalt, Bewegung und Film | Ersatz für den Öl-Graph (Abschnitt 2.4) |
| ~1 µm | der Schmierfilm im Schnitt | **neu**, Formel als Schichtschnitt (Abschnitt 5) |
| ~1 nm | die S–Mo–S-Schichten | `HexMoS2` |

Fünf Stufen, jede zehn- bis hundertfach feiner als die vorige. Die Seite wird
damit zu **einem einzigen Hineinzoomen**, und das ist genau der Ton, den die
Marke sonst schon trifft: ein Instrument, das immer weiter aufdreht.

Umsetzung, minimal:

- Jedes Panel bekommt im `chip`-Slot des `InstrumentFrame`, den es ohnehin hat,
  seinen Maßstab: `10 cm`, `1 cm`, `100 µm`, `1 µm`, `1 nm`. Der Mikroskop-Abschnitt
  macht das mit `1 000×` bereits vor, es ist also keine neue Sprache.
- Zwischen zwei Panels eine Haarlinie mit einer kleinen Lupe, die den Sprung
  markiert. Eine Linie, kein Bauteil.
- Optional, wenn Zeit ist: eine schmale Maßstabsleiste am linken Rand, die beim
  Scrollen mitläuft und zeigt, wo man gerade ist. Das ist der Moment, in dem die
  Seite anfängt, sich wie ein Gerät anzufühlen.

Nebeneffekt: die Reihenfolge der Abschnitte begründet sich damit von selbst.
Heute steht der Mikroskop-Abschnitt zwischen Formel und Beweis ohne erkennbaren
Grund. Auf der Zoom-Skala hat jeder Abschnitt genau einen richtigen Platz.

---

## 5. Die Formel-Grafik: der Knotengraph muss weg

### 5.1 Warum er nicht trägt

`FormulaGraph` ist der aufwendigste Code der Seite: radiales Layout mit drei
Ringen, Ring-Beschriftungen, gekrümmte Kanten mit Kantenlabels, sechs
Aufbauschritte mit Play/Pause, ein Zielknoten, ein Gegenspieler-Kante mit eigener
Darstellung, dazu eine eigene Mobilvariante mit Karussell und Punktnavigation.

Und er sagt: diese sechs Dinge hängen zusammen.

Das weiß der Leser vorher. Es ist eine Formel, natürlich hängen die Zutaten
zusammen. Ein Knotengraph beantwortet die Frage „wer hängt mit wem zusammen", und
das ist hier die uninteressanteste aller möglichen Fragen. Die interessante Frage
ist **wo sitzt das Zeug eigentlich**, und die kann ein Graph prinzipiell nicht
beantworten, weil seine Positionen frei erfunden sind. Der Kommentar in
`science.ts` gibt das offen zu: die `cx/cy`-Werte waren vorher ein
„gewachsener, bedeutungsfreier Streuplot" und kodieren jetzt die Rolle. Besser,
aber immer noch eine Metapher. Es gibt keinen Ring in unserem Wachs.

Dazu kommt: der Graph ist die einzige Stelle der Seite, an der die Erzählung die
Realität verlässt. Überall sonst wird ein echtes Ding gezeigt (eine Kette, ein
Gelenk, ein Kristall). Hier plötzlich ein Diagramm über Beziehungen. Das ist der
Bruch, den man als „nicht optimal" spürt, auch wenn man ihn nicht benennt.

### 5.2 Konzept: der Schnitt durch den Film

Der Schmierfilm hat einen echten, beschreibbaren Aufbau, und der steht in unserem
eigenen Text schon vollständig drin. Von unten nach oben:

1. **Stahl**, die Laschenschulter, mit ihrer Rauheit.
2. **Fe–S-Transferfilm**, 2 bis 5 nm, chemisch verankert. Der Text nennt ihn
   „den eigentlichen Schmierstoff".
3. **MoS₂-Plättchen**, unter 5 µm, mit den Basalebenen parallel zur Gleitrichtung.
4. **Paraffin-Lamellen**, das Skelett, gestapelte Schichten von 4 bis 5 nm.
5. **Amorphe Zonen zwischen den Lamellen**, gefüllt mit mikrokristallinem Wachs.
6. **FT-Wachs**, ko-kristallisiert in den Lamellen, macht sie dichter.
7. **Dispergierhüllen** um die MoS₂-Partikel.
8. **Antioxidans**, im ganzen Volumen verteilt.

Das ist keine Metapher. Das ist die Anordnung, die wir behaupten. Und sie leistet
etwas, was der Graph nie konnte: **sie erklärt, warum sechs Komponenten und nicht
eine.** Jede sitzt an einem anderen Ort und hält etwas anderes. Man sieht, dass
das Antioxidans nirgends „sitzt", sondern überall ist. Man sieht, dass das
FT-Wachs *im* Paraffin steckt und nicht daneben. Man sieht, dass MoS₂ ganz unten
an der Grenzfläche arbeitet, nicht im Volumen.

Ablauf: derselbe Sechs-Schritt-Aufbau wie heute, dieselben Texte aus
`FORMULA_STORY`, nur baut sich diesmal ein Film auf statt eines Netzes. Schritt 1
zeichnet die Lamellen, Schritt 2 setzt die MoS₂-Plättchen an die Grenzfläche und
lässt den Transferfilm entstehen, und so weiter. Der Aufbau bekommt eine Richtung,
weil der Film eine hat.

Anschluss nach oben und unten: der Stahl ganz unten im Bild ist dieselbe
Laschenschulter, die im Panel darüber im Spalt sichtbar war. Die MoS₂-Plättchen
ganz unten sind dasselbe Gitter, das im Panel darunter als S–Mo–S-Schichten
aufgeht. Die Formel ist damit keine Zutatenliste mehr, sondern eine Zoomstufe.

### 5.3 Tiefe, ohne dass es peinlich wird

Lucas Punkt mit der 3D-Optik ist richtig, und der Schichtschnitt ist genau die
Figur, die sie verträgt, weil sie echte Tiefe **hat**: Ebenen liegen wirklich
übereinander. Es geht nicht darum, Tiefe anzutäuschen, sondern die vorhandene
sichtbar zu machen.

**Was funktioniert:**

- **Axonometrie statt Perspektive.** Ein isometrischer oder dimetrischer
  Schnittblock, gerade Parallelen, kein Fluchtpunkt. Das ist die Sprache
  technischer Zeichnungen seit hundert Jahren. Sie wirkt nie billig, weil sie
  nichts vortäuscht. Ein Fluchtpunkt dagegen macht aus einer Zeichnung sofort
  eine Produktvisualisierung.
- **Verdeckung als Haupt-Tiefenreiz.** Vordere Lamellen überdecken hintere. Das
  ist der stärkste Tiefenreiz überhaupt und kostet nichts.
- **Genau drei flache Grauwerte** für Deckfläche, linke und rechte Schnittfläche.
  Keine Verläufe. Das ist die Regel aus `DESIGN.md` §1 (R = G = B) und sie ergibt
  automatisch den Eindruck einer Lichtrichtung.
- **Schnittkanten schraffiert.** Das Schraffurmuster gibt es schon zweimal im
  Projekt (`ProcessWatch`, `FrictionLens`). Eine Schraffur an der Schnittkante
  sagt „hier ist aufgeschnitten" schneller als jede Beschriftung.
- **Parallaxe statt Rotation.** Wenn Bewegung sein soll: beim Scrollen bewegen
  sich die Ebenen um wenige Pixel unterschiedlich schnell. Zwei, drei Pixel
  Versatz reichen, das Auge liest sofort Tiefe. Bei `prefers-reduced-motion`
  einfach statisch, kein Ersatzverhalten nötig.
- **Die Linienskala halten.** `--dw-hair` für Konstruktion und Schraffur,
  `--dw-line` für die Geometrie, `--dw-bold` für das eine Element, um das es im
  jeweiligen Schritt geht. Beim Aufbau wandert die fette Linie mit dem Schritt
  mit. Das ist eine bessere Fokusanzeige als jede Einfärbung.
- **Die Farbregel halten.** Metall grau, Wachs blau, MoS₂ als das dunkelste
  Element. Höchstens zwei Blautöne. Die Zusätze bekommen **keine eigenen Farben**,
  sondern Umrisse und Formen. Sechs Farben wären ein Tortendiagramm.
- **Maßstab anschreiben.** Jede Schnittfigur bekommt eine Maßstabsleiste. Das ist
  der Unterschied zwischen einer Illustration und einer Zeichnung.

**Was nicht funktioniert und der Grund für das Unbehagen wäre:**

- Abgeschrägte Kanten, Glanzlichter, Schlagschatten, Glaseffekte, Spiegelungen.
- Ein Modell, das beim Scrollen rotiert. Das ist der klassische Fehlgriff.
- Weichzeichnung als Tiefenschärfe. Auf einer Zeichnung liest sich Unschärfe als
  Fehler, nicht als Tiefe.
- Echtes 3D im Browser (three.js). Das kostet einen Haufen Startchunk auf einer
  Seite, die gerade erst von 603 auf 533 kB gebracht wurde, bringt keine einzige
  zusätzliche Aussage, und es sähe mehr nach Render als nach Messung aus. Die
  ganze Figur bleibt SVG.

Kurzformel: **Tiefe kommt aus Projektion und Verdeckung, nicht aus Material.**
Sobald eine Fläche anfängt zu glänzen, ist es kippt.

### 5.4 Was mit dem alten Code passiert

`FormulaGraph.tsx` (24 kB), `graphPrimitives.tsx`, `EDGES` und `FORMULA_STORY.edges`
in `science.ts` entfallen. `COMPONENTS` bleibt vollständig erhalten, nur die
Felder `cx/cy/r` werden durch eine Schichtposition ersetzt. Alle Texte,
`diveFormula()` und der Hero-Dive auf der Startseite sind davon nicht betroffen.
Das ist ein spürbarer Rückbau: weniger Code, weniger Mobilsonderfall (die
Karussell-plus-Graph-Konstruktion mit `IntersectionObserver` fällt weg, ein
Schichtschnitt ist hochkant von sich aus mobiltauglich) und eine Aussage mehr.

---

## 6. Die restlichen Abschnitte, der Reihe nach

**ACT I, Kontaktzonen.** Der stärkste Teil der Seite. Der Absatz über das
Losbrechen ist das beste Argument, das wir haben, und steht als Fließtext ganz
unten im Abschnitt. Er gehört nach oben und er gehört bebildert, siehe 2.4.
Die drei Zonenzeilen funktionieren gut. Kleine Sache: sie reagieren auf
`onMouseEnter`, `onFocus` und `onClick` gleichzeitig; auf dem Desktop wechselt
die Zeichnung also schon beim Drüberfahren mit der Maus, was beim Lesen von oben
nach unten unruhig ist.

**ACT II, Formel.** Siehe Abschnitt 5. Die sechs Komponententexte sind inhaltlich
das Wertvollste auf der Seite und bleiben unangetastet, abgesehen von den
Korrekturen aus 1.4.

**Temperaturfenster.** Zahlen unbelegt und im Widerspruch zum Matrix-Satz (1.5).
Bevor hier gestaltet wird, muss die inhaltliche Frage geklärt sein. Wenn die
Zahlen nicht zu belegen sind, ist die ehrlichere Grafik eine ohne Achse: zwei
Zeilen mit „stark bei", „geht bei", „braucht dann öfter einen Wachsgang". Keine
Skala vortäuschen, die auf keiner Messung beruht.

**Mikroskop.** Siehe 1.6. Vorschlag: raus, bis die Herkunft geklärt ist. Und das
ist der Moment, den `PROJECT.md` seit Wochen als größten offenen Hebel führt: an
dieser Stelle gehört das **eigene Fotopaar** hin, gleiche Kette, gleicher Winkel,
gleiches Licht, einmal nach 300 km geölt, einmal nach 300 km gewachst. Der
`BeforeAfterSlider` steht fertig da und wird hier bereits achtmal benutzt. Ein
einziges echtes eigenes Bild schlägt acht fremde Mikroskopaufnahmen, rechtlich
und rhetorisch. Es ist auch das einzige Argument auf der ganzen Seite, das eine
Zielgruppe erreicht, die nicht wegen Tribologie gekommen ist.

**ACT III, Beweis.** Überschrift ändern (1.5), µ-Balken überdenken (1.1),
Wattzahlen korrigieren (1.2), Öl-Panel ersetzen (2.4), „gemessen in Zone 01"
streichen (1.5), Quellenzeile sauber setzen (1.6). Was fehlt und die Sektion
tragen würde: ein **Methodenkasten**. Was wurde gemessen, von wem, wann, bei
welcher Leistung, wie viele Kilometer, unter welchen Bedingungen. Eine Seite, die
„Was unabhängig gemessen wurde" heißt, wird durch einen nüchternen Methodenkasten
glaubwürdiger als durch jedes weitere Diagramm.

**`LineChoice`.** Die Tabelle funktioniert. Der PFAS-Umgang ist vorbildlich. Der
Schlusssatz zur Matrix ist der Widerspruch aus 1.5.

**CTA.** Zwei echte Produktkarten aus `data.ts`, richtig gemacht.

**Sprache, ganze Seite.** Gedankenstrich-Durchgang (1.7). Dazu Abgleich mit
`DESIGN.md`: Monospace nur an echten Messwerten. Nach der µ-Entscheidung aus 1.1
fallen ein paar Mono-Stellen ohnehin weg.

---

## 7. Reihenfolge

**Stufe 0, Zahlen und Aussagen. Ohne Designarbeit, größter Hebel.**
1. „ab 50 MPa trägt kein Flüssigfilm mehr" entfernen.
2. Wattzahlen auf 250 W korrigieren, in `data.ts` **und** im Skill.
3. „gemessen in Zone 01" streichen. ACT-III-Überschrift ändern.
4. Matrix-Widerspruch klären (braucht Luca) und eine der beiden Stellen anpassen.
5. Rewax-Intervall vereinheitlichen, D1 folgt.
6. MoO₃-Satz auf den belegbaren Mechanismus umschreiben. 10-nm-Lamelle auf 4–5 nm
   korrigieren, an allen drei Stellen.
7. Quellenzeile mit Autor, Jahr, URL.
8. Mikroskop-Abschnitt aussetzen, bis die Herkunft geklärt ist.
9. µ-Werte zurückstufen (braucht Luca, siehe Abschnitt 8).

~~**Stufe 1, das falsche Panel ersetzen.**~~ Erledigt am 15.09.2026, siehe 7a.

**Stufe 2, Hero und Klammer.** Kettengeometrie in ein gemeinsames Primitiv,
neuer Hero als Einstiegskarte, Maßstabs-Chips in allen Panels.

**Stufe 3, Formel als Schnitt.** Die größte Einzelarbeit, aber mit Rückbau
verbunden: `FormulaGraph` und `graphPrimitives` entfallen.

**Stufe 4, Politur.** Gedankenstriche, Mono-Regel, Hover-Verhalten der
Zonenzeilen, Methodenkasten.

Vor jedem Commit `npx tsc -b --force`, siehe `CLAUDE.md` Regel 5. Bei
Strukturänderungen an der Seite `docs/SEO_TECHNIK.md` beachten, die Route ist
vorgerendert und trägt eigenes Schema.

---

## 7a. Was am 15.09.2026 bereits umgesetzt wurde

Stufe 0, nur die Punkte ohne Entscheidungsbedarf:

- Die 50-MPa-Schwelle und die Zeile „ab 50 MPa trägt kein Flüssigfilm mehr" sind
  raus. Die Bildunterschrift nennt jetzt den richtigen Mechanismus (die
  Gleitgeschwindigkeit geht zweimal je Zyklus durch null). Der Panel-Titel heißt
  nicht mehr „Warum Öl hier aufgibt", sondern „Flächenpressung im Gelenk", also
  das, was die Figur tatsächlich zeigt. Die Zeile „Hydraulikpresse 30 MPa" ist
  weg, weil ein Systemdruck in einer Flüssigkeit keine Flächenpressung ist; der
  Reifen steht jetzt bei rund 0,7 MPa statt 0,25, also bei Rennradniveau.
  Die Öl-Pointe darunter sagt nicht mehr „der Film wird herausgedrückt",
  sondern dass er ohne Geschwindigkeit gar nicht erst entsteht.
- `waxVsOil.watts.inputW` ist von `[300, 400]` auf `250` geändert, mit Begründung
  im Code. Betroffen waren vier Verwender: Startseite, Wissenschaftsseite,
  vorgerenderter Rumpf und `llms.txt`. Der Rumpf hätte nach der Umstellung
  „undefined–undefined W" ausgeliefert, das ist mitgefixt.
- „Antriebsverlust" heißt an diesen Stellen jetzt „Reibungsverlust in der Kette",
  weil die zitierten Tests die Kette allein messen.
- Die Hero-Fußnote schreibt nur noch die Wattzahlen Zero Friction Cycling zu,
  nicht mehr auch die µ-Werte.
- „Gemessen, nicht behauptet." heißt jetzt „Was unabhängig gemessen wurde.",
  passend zum Absatz direkt darunter. Dieselbe Korrektur in der Meta-Description
  des vorgerenderten Rumpfs.
- „gemessen in Zone 01" ist gestrichen.
- Die Quellenzeile trennt Friction Facts und Zero Friction Cycling wieder.
  Jahr und URL stehen weiterhin aus.
- Die 10-nm-Lamelle ist an allen sechs Stellen (DE und EN) auf 4 bis 5 nm
  korrigiert, mit der Herleitung im Tiefentext.
- MoO₃ ist nicht mehr „hart und abrasiv, Mohshärte ~5,5", sondern erhöht die
  Scherfestigkeit der Gleitfläche. Das ist der belegte Mechanismus. Betrifft
  auch die Bildunterschrift in `diagrams.tsx`.
- Im vorgerenderten Rumpf stand noch „jede Gegenüberstellung bei identischer
  Vergrößerung", eine Methodikbehauptung, die 09/2026 aus der hydrierten Seite
  entfernt worden war, weil sie für diese Bilder nicht zutrifft. Jetzt auch dort weg.

Geprüft mit `npx tsc -b --force` und `npm run build`, Rumpf und `llms.txt`
gegengelesen.

### Stufe 1 am 15.09.2026: die Ersatzfigur steht

Nach Stufe 0 zeigte das Panel eine Druckgrafik unter einer Bildunterschrift,
die sagt, dass der Druck nicht der Punkt ist. Diese Lücke ist zu.

`TransferFilm` heißt jetzt `StandstillFilm` und trägt die Figur aus Abschnitt
2.4: zwei Spuren über eine Gelenkbewegung. Oben die Gleitgeschwindigkeit, die
sichtbar das Vorzeichen wechselt und zweimal durch null geht, beide
Nulldurchgänge markiert und mit „Stillstand" beschriftet. Unten die Filmdicke:
die Ölkurve folgt der Geschwindigkeit und fällt an beiden Stillständen auf die
Grundlinie, die Wachslinie ist eine Waagerechte.

Zwei bewusste Entscheidungen:

- **Keine y-Achsenwerte.** Das ist ein Mechanismus, keine Messung. Der Chip
  sagt „schematisch", wie in den Kontaktzonen.
- **Die Wachslinie liegt unter den Ölspitzen.** Zu behaupten, der Wachsfilm sei
  dicker als ein aufgebauter Ölfilm, wäre eine Aussage ohne Beleg, und die
  Pointe braucht sie nicht: Öl ist zeitweise dicker und zweimal je Zyklus gar
  nicht da. Das ist die ehrlichere und zugleich die stärkere Fassung.

Die Flächenpressung bleibt als Kennzahl in der Fußzeile, jetzt als Ortsangabe
(„Pressung im Gelenk") statt als Mechanismus.

Geprüft mit Chromium über Playwright auf dem gebauten `dist/`, in hell, dunkel
und auf 390 px: keine JS-Fehler, kein waagerechter Überlauf. Achtung für die
nächste Prüfung: die Seite schaltet den Dunkelmodus über die Klasse `noir` aus
`localStorage['wx-theme']`, nicht über `prefers-color-scheme`. Ein Screenshot
mit `colorScheme: 'dark'` zeigt deshalb die helle Seite.

Die Figurenschrift lag mobil zuerst bei 9,7 px, also unter der 11-px-Grenze aus
`DESIGN.md` §2. Die viewBox ist deshalb von 360 auf 320 Einheiten geschrumpft,
damit der Skalierungsfaktor nahe 1 liegt: jetzt 13,7 px auf dem Desktop und
11,9 px auf einem 390er Gerät. Auf sehr schmalen Telefonen (360 px) bleiben
10,7 px. Das ist der Rest, den die Figur ohne einen Umbau auf
HTML-Beschriftung nicht loswird.

---

### Direkt daraus entstanden: eine neue Inkonsistenz

`data.ts` sagt jetzt 250 W. Vier Stellen in `articles.ts` und eine in `i18n.ts`
nennen weiterhin **300 bis 400 W**, und zwar als „**unsere Laborreferenz**".
Das ist eine andere und größere Frage als die Eingangsleistung: haben wir eine
eigene Laborreferenz, die wir so nennen dürfen? Der Skill kennt keine. Solange
das offen ist, wurde die Blog- und FAQ-Copy bewusst nicht mitgeändert, sonst
würden in einer Session zwei verschiedene Behauptungen gleichzeitig verschoben.
Gehört als Nächstes geklärt, siehe Abschnitt 8.

### Nachtrag 15.09.2026: die Seite rechnet mit

- ACT III hat ein `ProofInstrument` (Fahrprofil → Ersparnis, Intervall,
  Wachsgänge über `drivetrainCosts()`). Die statische €-Kachel im
  Reibungs-Panel ist dafür raus: ein Kostenmodell pro Seite. **Neu offen:**
  `waxVsOil.cost` (47 € auf 12.000 km) ist gegenüber `waxMath.ts` veraltet,
  das Modell ergibt beim Standardprofil rund 127 €; die Startseite zeigt die
  47 € weiter und verlinkt sie auf die Herleitung, die etwas anderes rechnet.
- Die Stokes-Rechnung (1.4) steht als `CalcTrace` im Dispergiersystem und wird
  aus ihren Eingangswerten berechnet; die Texte sagen jetzt „rund 1 mm/min“.
- Beides hängt an `COMPONENTS`-IDs bzw. an ACT III, nicht an `FormulaGraph`,
  und übersteht damit Stufe 3 (Formel als Schnitt).
- Ein Querverweis MoS₂ → Mikroskop war gebaut und ist bewusst wieder raus,
  solange 1.6 offen ist.

---

## 7b. Stufe 2 am 15.09.2026: der Hero ist die Kette

Der Hero zeigte ein Kassettenfoto, also die **Folge**, und die Seite erklärte
danach die **Ursache**, ohne dass die Verbindung je gezeichnet wurde. Die
Kassette kam nach dem Hero außerdem nie wieder vor.

Jetzt steht dort die Kette in Seitenansicht, wie sie am Rad hängt, mit einer
Lupe im Gelenk und dem Ritzel rechts, auf das sie aufwickelt. Darunter drei
Einstiege, die zugleich das Inhaltsverzeichnis der Seite sind: Gelenk → ACT I,
Spalt → ACT II, Verschleiß → ACT III. Wer über eine Zeile fährt, sieht das
zugehörige Teil in der Zeichnung hervortreten.

Die Kassettenfigur ist **nicht gelöscht**, sondern nach ACT III gewandert,
direkt über die Rechnung, die aus Laufzeit Geld macht. Damit bleibt auch das
og:image gültig, das weiter auf dieses Bild zeigt.

Neu: `src/components/viz/chain/geometry.ts` als **eine Quelle für die
Kettengeometrie**. Es gab drei unabhängig gezeichnete Ketten
(`ChainWaxMap`, `FrictionLens`, `sketches.tsx`). Das Modul enthält nur
Geometrie und Pfadhelfer, keine Farben, weil die Wissenschaftsseite themefähig
ist und die Produktseite in einem erzwungenen Dunkelband läuft.

Zwei Dinge, die beim Bauen aufgefallen sind:

- **Teilung und Rollengröße hängen zusammen.** Die Absolutwerte in `SIDE`
  stammen aus `ChainWaxMap` mit Teilung 66. Neben einem Ritzel mit Teilung 37
  saß die Kette dadurch auf den Zähnen statt in den Sitzen. Dafür gibt es
  jetzt `sideAt(pitch)`, und der Kommentar sagt, warum man es benutzen muss.
- **Die Maßstabs-Chips aus §4 sind bewusst nicht gebaut.** Der `chip`-Slot ist
  überall belegt und leistet dort echte Arbeit: `< 5 µm` ist die Partikelgröße,
  `Außentemperatur` die Achse, `schematisch` der Vorbehalt. Einen Maßstab
  dazwischenzumischen hätte das System verwässert statt es zu schärfen. Die
  Zoom-Klammer bräuchte einen eigenen Träger, etwa eine Maßstabsleiste je
  Figur. Offen.

Die µ-Kachel im Hero ist weg (siehe 1.1). Keine Ersatzkachel: die Intervalle
unterscheiden sich je Produkt und die Rewax-Zahl ist offen, also zwei belegte
Kennzahlen statt drei mit einer schwachen darunter. µ steht weiterhin in
`FrictionBars` und `LineChoice`; das ist der nächste Schritt, als eigener PR,
zusammen mit dem Umbau der Balken auf Watt.

Geprüft: `tsc -b --force`, `npm run build`, Chromium über Playwright in hell,
dunkel und bei 1280 / 390 / 360 px. Kein waagerechter Überlauf, keine
JS-Fehler, alle drei Einstiege springen auf ihr Ziel.

### Stufe 2, zurückgenommen: der Hero ist wieder die Kassette

Der Ketten-Hero oben ist **verworfen**. Luca: die Kassette mit der Zoomlinse,
wie sie auf der Wachs-Produktseite steht, ist deutlich hochwertiger, und die
gezeichnete Kette kam dagegen nicht an. `ChainOverview.tsx` und
`components/viz/chain/geometry.ts` sind gelöscht.

**Die Dedup der drei Kettenzeichnungen ist damit wieder offen.** `ChainWaxMap`,
`FrictionLens` und `sketches.tsx` zeichnen weiter je eine eigene Kette mit
eigenen Konstanten. Der Befund aus `sideAt(pitch)` bleibt gültig: Teilung und
Rollengröße hängen zusammen, wer eine Kette neben ein Ritzel zeichnet, muss
umrechnen. Das gehört in einen eigenen kleinen PR, nicht in einen Design-PR.

An der Stelle steht jetzt `src/sections/science/CassetteLens.tsx`: dieselbe
Komposition wie auf der Produktseite, aber größer und an drei Stellen besser.
Eine Koordinate (`FLANK`) statt zwei unabhängiger Prozentpaare, ein Ring, dessen
Durchmesser per Definition `LENS / ZOOM` ist und der damit wirklich zeigt, was
die Linse zeigt, und eine Übergabezeile nach ACT I, die den alten Einwand gegen
das Foto auflöst: der Hero zeigte die Folge, während die Seite die Ursache
erklärt.

**Beim Bauen geprüft und verworfen: der Split-Zoom neu/abgenutzt.** Der Plan
sah vor, `cassette-new.jpg` und `cassette-worn.jpg` in einer großen Linse
gegenüberzustellen. Beide sind **326 × 170 px**, stammen erkennbar aus einer
anderen Aufnahme als das Hauptbild (weißer Grund, flaches Licht) und der
Unterschied zwischen ihnen ist mit bloßem Auge kaum zu erkennen. Als Beleg für
„so sieht Verschleiß aus" tragen sie nicht, und vergrößert tragen sie erst
recht nicht. Sie sind aus der Seite raus. Den Vergleich führt jetzt die
gezeichnete Zahnkontur, die als Schema gekennzeichnet ist.

Die Zahnkontur ist dabei neu gezeichnet worden. Die alte war ein Trapez mit
gerader Deckfläche und ohne Rollensitze und sah nach Kegelstumpf aus. Die neue
zeigt einen Zahn mit seinen beiden halben Sitzen. Dabei gefunden und behoben:
eine Zwischenfassung ließ die abgenutzte Kontur an der Zahnkuppe über die
ideale hinausragen, dichtete dort also Material an. Ursache war der Wiedereinstieg
am **Steuerpunkt** der Kuppenkurve statt an ihrem Scheitel; der Scheitel einer
quadratischen Kurve ist `B(0,5)`, nicht der Steuerpunkt.

Geprüft: `tsc -b --force`, `npm run build`, Chromium über Playwright in hell und
dunkel bei 1280 / 390 / 360 px. Kein waagerechter Überlauf, keine JS-Fehler,
og:image und `preloadImage` zeigen weiter auf das Bild, das der Hero wirklich
rendert (und das jetzt wieder über der Falz steht, was den Preload überhaupt
erst rechtfertigt).

**Nebenbefund für §7 dieses Dokuments:** auf der Seite stehen weiterhin
SVG-Beschriftungen mit 10 px (`vdW`, `S` in den Molekülfiguren). DESIGN.md §2
fordert mindestens 11 px. Nicht Teil dieses PRs.

---

## 8. Was nur Luca entscheiden kann

1. **Die µ-Werte.** Bleiben sie mit Umgebungsangabe im MoS₂-Kapitel, oder
   verschwinden sie ganz von der Seite? Empfehlung: ganz weg als Leitzahl, in
   `frictionRanges` bleiben sie als interne Referenz. Die Seite verliert dadurch
   keine Aussage, sie verliert eine Angriffsfläche.
2. **Die Matrixfrage.** Hat Classic FT-Wachs und Antioxidans oder nicht? Davon
   hängen der Schlusssatz von `LineChoice`, `diveFormula()` und das
   Temperaturfenster ab.
3. **Die Mikroskopaufnahmen.** Woher stammen sie, dürfen wir sie zeigen?
4. **Die Rewax-Zahl auf dieser Seite.** 300 oder 400 bis 550.
5. **Das eigene Fotopaar.** Steht seit Juli als größter offener Hebel in
   `PROJECT.md`. Es kostet einen Nachmittag und zwei Ketten.
6. **Das Temperaturfenster.** Gibt es eine Grundlage für −8 / +5 / 35 / 45, oder
   wird die Skala durch eine Aussage ohne Achse ersetzt?
7. **„Unsere Laborreferenz".** Vier Stellen im Blog und eine in der FAQ nennen
   300 bis 400 W als unsere eigene Laborreferenz. Der Skill kennt keine eigene
   Messung. Streichen, umformulieren, oder gibt es sie wirklich?
