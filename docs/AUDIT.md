# Audit, Stand 2026-07-28

Bestandsaufnahme der ganzen Seite, nicht nur der Teile, an denen zuletzt
gearbeitet wurde. Bewusst scharf formuliert. Was hier steht, ist Kritik an
Entscheidungen, nicht an Ausführung: die Ausführung ist auf einem Niveau, das
die meisten Marken dieser Größe nie erreichen. Genau deshalb fallen die
strukturellen Sachen so auf.

---

## Das Raster, nach dem ich geprüft habe

1. **Ziel** Was soll ein Besucher tun, und gibt es pro Seite genau ein Ziel
2. **Reihenfolge und Länge** Abfolge der Sektionen, kognitive Last, Ermüdung
3. **Erstkontakt** Hero, Fünf-Sekunden-Test
4. **Angebot** Kaufweg, Preislogik, Rabatte, Bundles
5. **Beweis** Bewertungen, Messwerte, Mikroskopie, Herkunft
6. **Risiko** Rückgabe, Lieferzeit, wer dahintersteht
7. **Navigation** Informationsarchitektur, was fehlt
8. **Sprache** Claims-Konsistenz gegen die verbindlichen Regeln
9. **Bildsprache** was vorhanden ist, was benutzt wird, was fehlt
10. **Rhythmus** Formenvielfalt über die Seite
11. **Wiederkauf** Rewax, Rotation, Nachkauf
12. **Technische Schulden** toter Code, ungenutzte Assets

---

## Was auf der Startseite steht

Hero · Warum Wachs · Produkte · Bewertungen · Über mich · Rechner und Planer ·
Anleitungen · FAQ · Kontakt · Abschluss-CTA · Footer

Dazu Unterseiten: `/wissenschaft`, `/blog` mit 18 Artikeln, Produktdetailseiten,
Rechtstexte.

---

## Befunde, nach Wirkung sortiert

### 1. Zwei Kaufwege gleichzeitig · entschieden

**Stand 2026-07-28: eBay bleibt vorerst der Kaufweg, der Stripe-Checkout wird
ab Sonntag oder Montag fertiggebaut.** Damit ist die Frage terminiert und nicht
mehr blockierend. Der Text unten bleibt als Begründung stehen, warum die Sache
nicht liegenbleiben durfte.


Die Produktkarten führen zu eBay, parallel steht ein Stripe-Checkout im Aufbau
(`canCheckout`, `checkoutEnabled`, Warenkorb, Widerruf). Solange beides
nebeneinander existiert, muss ein Besucher eine Frage beantworten, die ihn nichts
angeht: wo kaufe ich das jetzt eigentlich. Jede solche Frage kostet.

Das ist keine Designfrage, sondern eine Geschäftsentscheidung, und sie blockiert
mehrere andere. Solange sie offen ist, kann die Seite keinen klaren Abschluss
haben.

### 2. Die stärksten Zahlen werden dreimal erzählt · behoben

„3×" und „~€70" laufen im Hero als Zähler hoch, stehen dann als Kacheln in
„Warum Wachs", und tauchen im Fuß des Antriebsverlust-Diagramms wieder auf.
Wiederholung macht eine Zahl nicht größer, sie macht sie billiger. Ein Wert
sollte einmal seinen Auftritt haben, danach höchstens als Beleg.

Umgesetzt: der Hero behält beide Zähler. Die Kachelreihe in „Warum Wachs" hat
die `3×`-Kachel verloren und zeigt jetzt drei Messwerte statt vier gemischter
Aussagen. Der Fuß des Antriebsverlust-Diagramms hat die `~€70` verloren und
behält die Behandlungszahl, die sonst nirgends steht. Der Produkt-Untertitel
sagt statt „Dreifache Kettenlaufzeit" jetzt „Deutlich längere Kettenlaufzeit",
was gleichzeitig die Claims-Regel „2 bis 3×" einhält.

Ergebnis: eine Aussage pro Fläche. Hero = Ergebnis, Kacheln = Messung,
Nutzenzeilen = Alltag, Diagramm = Aufwand.

### 3. Die Seite ist zu lang für ihr Produkt

Nach dem Kaufangebot kommen noch drei schwere Blöcke: fünf Rechner, drei
Anleitungen, die FAQ. Das sind hervorragende Inhalte, aber sie sind
Retention- und Suchmaschinen-Assets, keine Conversion-Assets. Sie stehen dort,
wo jemand entweder kauft oder geht.

Für ein Produkt zwischen 22 und 30 Euro ist das zu viel Entscheidungsarbeit.
Vorschlag: Rechner und Anleitungen auf eigene Unterseiten, auf der Startseite
nur je ein Einstieg. Die FAQ kann bleiben, gekürzt auf die fünf Fragen, die
tatsächlich vor dem Kauf gestellt werden.

### 4. Es gibt keine Rewax-Seite · gebaut

Der Rewax-Service ist der einzige wiederkehrende Umsatz im ganzen Modell und
hat auf der Website null Fläche. Kein Menüpunkt, keine Route, keine Landingpage.
Das steht schon als größte Lücke in `docs/plaene/BLOG_PLAN.md` und ist immer noch offen.

Aus Sicht des Geschäfts war das der teuerste Punkt in diesem Dokument.

**Erledigt 2026-07-28:** `/rewax` existiert, ist in der Navigation, und wird
zusätzlich aus der Produktsektion heraus verlinkt, direkt unter der Produktliste,
weil dort genau die Leute stehen, die den Service in vierhundert Kilometern
brauchen. Preise: 13,95 € je Kette, 9,95 € ab drei Ketten, jeweils zuzüglich
1,80 € Rückversand. Die Seite sagt außerdem klar, was **nicht** geht, nämlich
geölte Ketten entfetten und erstmalig wachsen.

### 5. ~~Produkte fehlt in der Desktop-Navigation~~ · zurückgezogen

Zunächst als Befund notiert, nach Blick in den Code zurückgezogen: in
`navigation.tsx` steht ein Kommentar, der genau das begründet. Produkte entfällt
im Desktop-Header, weil der „Jetzt bestellen"-Knopf diese Rolle übernimmt, und
bleibt mobil erhalten. Das ist eine bewusste Entscheidung, keine Lücke.

Neu in der Navigation ist seit 2026-07-28 `/rewax`.

### 6. Alle Sektionen haben dieselbe Form

Eyebrow, Serif-Überschrift, Untertitel, Raster. Zehnmal hintereinander. Das ist
in sich konsistent und ermüdet trotzdem, weil es keinen Rhythmus gibt.

Im Markenprofil stehen ausdrücklich dunkle Full-Bleed-Sektionen. Nach dem Hero
kommt keine einzige mehr. Ein dunkler Moment in der Mitte der Seite, etwa für
Herkunft und Produktion, würde die Seite in zwei Hälften teilen und beide
leichter machen.

### 7. Bewertungen als Laufschrift

Eine Marquee liest niemand, sie wird als Dekoration wahrgenommen. Der stärkste
Beleg, den die Marke hat, ist ein Satz: über 500 verkaufte Einheiten, 100 %
positives Feedback. Der gehört groß und still hingeschrieben, mit drei
ausgewählten Zitaten darunter, nicht in eine bewegte Wand.

### 8. Dauerrabatt gegen Premiumhaltung

„Bis 15 % Rabatt" steht dauerhaft auf den Produktkarten. Ein permanenter Rabatt
ist kein Rabatt, sondern ein Preis mit schlechtem Gewissen. Für eine Marke, die
über Urteil statt Hype verkauft, ist das der falsche Reflex. Entweder in eine
Staffel überführen, die als Vernunft lesbar ist, oder weg.

### 9. Claims-Inkonsistenz, systemisch · teilweise behoben

- ~~Produkt-Untertitel „Dreifache Kettenlaufzeit", Kachel „3×"~~ · behoben, beide raus. Der Blog benutzte bereits korrekt „Zwei- bis Dreifache".
- „µ 0,03 · 7× weniger als Öl" als Einzelzahl ohne Zuordnung.
- Wattwerte in zwei Versionen im Umlauf.
- 57 Gedankenstriche als Satzzeichen in `data.ts`.

Einzeln Kleinigkeiten. Zusammen genau das Muster, das eine Marke unglaubwürdig
macht, die mit Präzision argumentiert.

### 10. Bildsprache

Vorhanden und ungenutzt: `chain-clean.jpg` zeigt Ketten im Wachsbad, eigenes
Foto, sehr gut. Der Ordner mit den Produktbildern enthält mehrere Motive, die
besser sind als das, was auf der Seite steht.

Fehlend und wichtiger als alles andere in diesem Abschnitt: ein eigenes
Vorher-Nachher-Paar, gleiche Kette, gleicher Winkel, gleiches Licht, einmal
geölt und einmal gewachst nach gleicher Strecke. Für die Zielgruppe, die nicht
wegen Tribologie kommt, schlägt dieses eine Bild jede Grafik auf der Seite.
Der `ComparisonSlider` liegt fertig und ungenutzt im Repo.

Zu löschen: `chain-dirty.jpg`, fremdes Foto mit englischer Kritzelei.

### 11. Risiko wird nicht adressiert

Rückgaberecht und Widerruf existieren als Rechtstexte, aber nirgends als
Beruhigung an der Stelle, an der jemand auf Kaufen zeigt. Bei einem Produkt, das
eine Verhaltensänderung verlangt, ist die stille Frage nicht „ist es gut",
sondern „was, wenn ich damit nicht klarkomme". Ein ruhiger Satz neben dem Knopf
beantwortet das billiger als jedes weitere Argument.

### 12. Verwaiste Reste

- `Warum Heißwachs?` mit Untertitel liegt in `i18n.ts` und wird nirgends verwendet.
- Aus meiner eigenen Arbeit sind drei Dateien tot: `ZoneRing.tsx`, `DrivetrainLedger.tsx`, `MaintenanceTimeline.tsx`. Zwischenstände, die durch bessere Lösungen ersetzt wurden. Sollten weg.
- `main` liegt acht Commits vor `origin/main`. Nichts davon ist live.

---

## Was ich zuerst machen würde

In dieser Reihenfolge, weil jeder Punkt den nächsten billiger macht.

1. **Kaufweg entscheiden.** eBay oder eigener Checkout. Alles andere hängt daran.
2. **Zahlen vereinheitlichen.** Ein Nachmittag, behebt Punkt 9 vollständig, und die Seite wird dadurch glaubwürdiger als durch jede neue Sektion.
3. **Das Fotopaar schießen.** Größter Hebel pro Aufwand auf der ganzen Seite.
4. **Rechner und Anleitungen auf Unterseiten.** Macht die Startseite um etwa ein Drittel kürzer, ohne dass ein Inhalt verloren geht.
5. **Rewax-Landingpage.** Der einzige wiederkehrende Umsatz braucht eine Adresse.
6. **Einen dunklen Moment einbauen.** Herkunft und Produktion, mit dem Wachsbad-Foto.
7. **Bewertungen still stellen.** Eine Zahl, drei Zitate, keine Bewegung.

---

## Was ausdrücklich gut ist

Damit die Liste oben nicht den Eindruck erweckt, hier stimme etwas Grundsätzliches
nicht.

Der Formel-Graph auf der Wissenschaftsseite ist besser als alles, was die
Wettbewerber in dieser Kategorie zeigen. Die Mikroskopaufnahmen sind echt und
werden auch so ausgewiesen. Die Tonalität ist über die ganze Seite konsistent
erwachsen. Das Farbsystem ist durchdacht genug, dass es einen dokumentierten
Grund für jeden Grauton gibt. Und die Bereitschaft, Nicht-Idealbedingungen zu
nennen, ist der Grund, warum die Seite überhaupt glaubwürdig wirkt.

Die Probleme oben sind fast alle Wachstumsprobleme: es ist über die Zeit viel
Gutes dazugekommen und wenig weggenommen worden.
