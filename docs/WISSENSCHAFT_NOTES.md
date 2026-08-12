# Wissenschaftsteil und Startseite: Stand der Arbeit

Stand 2026-07-28. Nicht committet, liegt im Working Tree.
`npx tsc --noEmit` läuft sauber. `npm run build` bitte lokal prüfen, im
Linux-Sandbox scheitert das rollup-Binary an macOS.

---

## Der Ausgangsbefund

Die Wissenschaftsseite hatte **ACT II** und **ACT III**, aber keinen ACT I. Der
Hero verlinkt mit „Wie das gemessen wurde" auf `#problem`. Diesen Anker gab es
nirgends im Code. Im Kommentar über `ScienceHero` stand noch `ProblemHero below
carries on…` für eine Sektion, die es nicht mehr gibt.

Inhaltlich fehlte damit das Bindeglied: Die Seite zeigte **das Ergebnis** und
**die Zusammensetzung**, aber nie **den Ort**. Ohne ihn ist der Formel-Graph
eine sehr schöne Zutatenliste.

---

## Neue Dateien

| Datei | Zweck |
|---|---|
| `src/sections/science/ChainJointSection.tsx` | Schnitt A–A durch ein Gelenk. Jedes Bauteil ein eigener Block, jede Gleitfläche eine eindeutige Linie, aktive Fläche bekommt ein ↔ Zeichen. |
| `src/sections/science/ContactZones.tsx` | ACT I plus `LineChoice` (Classic gegen Pro). Trägt `id="problem"`. |
| `src/sections/science/ScienceTeaser.tsx` | Tür von der Startseite in die Wissenschaftsseite. |
| `src/components/viz/MaintenanceTimeline.tsx` | 12.000 km als Ereignisse, nicht als Balken. |

## Geänderte Dateien

- `src/pages/SciencePage.tsx` — ACT I zwischen Hero und ACT II, `id="formel"` auf ACT II, `LineChoice` direkt über dem CTA.
- `src/sections/why-wax.tsx` — Timeline als Hauptgrafik im Block „Was das bedeutet", vier Kacheln zu Haarlinien-Zeilen umgebaut, Kostenkachel gegen Antriebsverlust getauscht, `ScienceTeaser` statt CTA-Karte.
- `src/components/viz/index.ts` — Timeline exportiert.
- `src/index.css` — `.wx-range`, ein Haarlinien-Slider. Es gab vorher keine Range-Styles im Projekt.

**Verwaist, kann gelöscht werden:** `src/sections/science/ZoneRing.tsx` und
`src/components/viz/DrivetrainLedger.tsx`. Beide werden von nichts mehr
importiert, beide waren Zwischenstände. Sie stören nichts, sind aber toter Code.

---

## Warum die Zeichnung neu gemacht wurde

Die erste Fassung zeigte das Gelenk als konzentrische Ringe. Geometrisch
richtig, aber unlesbar: drei ineinanderliegende Kreise sehen aus wie drei
Kreise, nicht wie eine Rolle auf einer Schulter auf einem Bolzen. Die
Zuleitungslinien der Beschriftungen kollidierten zusätzlich.

Jetzt ein Schnitt entlang der Bolzenachse. Jedes Bauteil ist ein eigener Block,
die drei Gleitflächen sind eindeutige Linien zwischen zwei Blöcken. Die aktive
Fläche bekommt ein ↔ Zeichen, und dieses Zeichen erklärt „hier gleitet etwas"
schneller als jeder Satz. Deshalb trägt die Zeichnung nur noch drei eigene
Wörter: BOLZEN, ROLLE, LASCHEN.

Die Zone-zu-Komponente-Tabelle darunter ist ersatzlos weg. Die Komponenten
erscheinen jetzt als Pills direkt in der aufgeklappten Zone. Gleiche Information,
ungefähr ein Drittel des Textes.

---

## Warum die Timeline statt Balken

Der Einwand, der Leute vom Umstieg abhält, ist fast nie der Preis, sondern der
Aufwand. Aufwand ist aber keine Größe, sondern eine **Anzahl**. Balken zeigen
Verhältnisse, Zählungen zeigen sie nicht.

Zwei Kämme aus Strichen machen die Anzahl körperlich: 96 Abende gegen 25 sieht
man, bevor man irgendeine Zahl liest. Hohe Striche sind Kettenwechsel.

Alles ist Division veröffentlichter Intervalle, kein Messwert. Und im Footer
steht der Teil, der gegen uns spricht: ein Wachsvorgang dauert 15 bis 20
Minuten, Ölen zwei.

Die Timeline zeigt **ein Szenario mit mittleren Intervallen** (Öl alle 125 km,
Wachs alle 475 km). Die Spannen selbst stehen weiterhin in den Zeilen darunter.

---

## Wo jetzt was steht

**Startseite, Abschnitt „Warum Wachs":**

1. Vier Messkacheln — der Überflug
2. „Was das bedeutet" → **Timeline** als Hauptgrafik
3. Vier Haarlinien-Zeilen: saubere Hände, Nachschmier-Intervall, Antriebsverschleiß, Antriebsverlust
4. **ScienceTeaser** — eine Zeile, eine Zeichnung, eine Zahl

Der Teaser nennt die drei Zonen bewusst nicht mehr. Vorher konnte man das
Argument auf der Startseite zu Ende lesen und hatte keinen Grund zu klicken.

**Wissenschaftsseite:**

1. Hero „Ein messbarer Unterschied" *(unverändert)*
2. **ACT I · Kontaktzonen** + Losbrech-Rechner *(neu)*
3. ACT II · Die Formel *(unverändert)*
4. MoS₂-Struktur, Einsatzbereich, „Wie die Formel entstand" *(unverändert)*
5. Unter dem Mikroskop *(unverändert)*
6. Der Beweis *(unverändert)*
7. **Zone 01 entscheidet die Linie** *(neu)* → CTA

---

## Bildmaterial: ein Fund und eine Lücke

`public/images/chain-dirty.jpg` ist das fremde Foto mit der englischen
Handschrift-Kritzelei „filth", vor dem `WEBSITE_HANDOFF.md` unter Fallen Punkt 5
warnt. Es liegt noch im Repo und wird von keiner Komponente benutzt. Sollte weg.

`public/images/chain-clean.jpg` ist dagegen ein echtes eigenes Foto von Ketten im
Wachsbad, ebenfalls unbenutzt und richtig gut. Das gehört auf die Seite.

**Was fehlt und die größte Wirkung hätte:** ein eigenes Fotopaar, gleiche Kette,
gleicher Winkel, gleiches Licht. Einmal nach 300 km geölt, einmal nach 300 km
gewachst. Der `ComparisonSlider` dafür existiert bereits ungenutzt in
`src/components/comparison-slider.tsx`. Für die Zielgruppe, die nicht wegen
Tribologie kommt, schlägt dieses eine Bild jede Grafik auf der Seite. Solange es
das nicht gibt, trägt die Textzeile „saubere Hände, saubere Hose" diese Aussage
allein, und das ist zu wenig.

---

## Fachliche Punkte

Belegt über Friction Facts / Zero Friction Cycling,
`Friction-Producing Mechanisms of a Bicycle Chain`:

1. **Buchsenlos.** Moderne 9 bis 12 fach Ketten haben keine Buchse, die Schulter der Innenlasche übernimmt deren Funktion. Steht so in der Sektion.
2. **Wachs gewinnt nicht im Hochdruckbereich.** Dort ist Paraffin durchschnittlich. Der Vorteil kommt aus dem Niederdruckbereich und aus der Haftreibung.
3. **MoS₂ trägt höhere Flächenpressung als PTFE**, das unter Last kriecht. Damit ist „Pro bei E-Bike und hohem Drehmoment" physikalisch begründet und nicht nur Staffelung. Genau das macht `LineChoice`.
4. **40.280** ist nachrechenbar: 53 × 95 × 8 Umlenkpunkte.

### Noch offen, betrifft bestehende Inhalte

- `waxVsOil.friction` ist `{ wax: 0.03, oil: 0.2 }`, daraus wird „7× weniger als Öl". Die 0,03 ist der beste Wert der Pro-Spanne und im Formel-Graph korrekt als MoS₂-Kennwert ausgewiesen. Als Einzelzahl ohne Zuordnung der angreifbarste Wert der Seite. `frictionRanges` weiter unten hat die ehrlichere Darstellung.
- `life: { wax: 3 }` ergibt „3×". Verbindlich ist „deutlich länger, oft 2 bis 3×".
- „~10 nm Lamellen" im Paraffin-Text: die kristallographische Periode liegt bei rund 9,3 nm, das ist aber ein Doppelstapel. Eine einzelne Lamelle ist 4 bis 5 nm.
- Gedankenstriche stehen im Bestand noch überall, unter anderem in „Derselbe Antrieb, zwei Schmierstoffe — Seite an Seite gemessen." auf beiden Seiten. In allen neuen Texten vermieden.
- „Leiser Antrieb" wäre für die unentschlossene Zielgruppe ein starkes Argument, steht aber in keiner verbindlichen Claims-Quelle. Nicht verwendet, bis du das bestätigst.

Alle bewusst nicht mitgeändert: das sind inhaltliche Entscheidungen.

---

## Vor dem Merge prüfen

- [ ] `npm run build` lokal
- [ ] Dark Mode auf beiden Seiten, besonders die Blockflächen im Gelenkschnitt
- [ ] EN auf beiden Seiten, inklusive Zahlenformat in Rechner und Timeline
- [ ] Hero-Link „Wie das gemessen wurde" landet auf ACT I
- [ ] Tab-Durchlauf: drei Zonenzeilen als Buttons, beide Regler erreichbar
- [ ] Reduzierte Bewegung: keine Tick-Staffelung, kein Zonenwechsel, Endzustand direkt
- [ ] Mobil unter 400 px: Gelenkschnitt und Timeline bleiben lesbar
- [ ] Rechner zeigt bei 53 und 95 exakt 40.280
