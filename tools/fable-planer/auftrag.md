# Auftrag an Fable 5.1 — Waxcelerate Hub

<!--
  In Claude Code als EINE Nachricht einfuegen, nachdem die Sitzung mit
      claude --model "fable[1m]" --effort xhigh
  im Ordner waxcelerate-sync auf Branch feat/porto-labels gestartet ist.
  Vorher einmal `python3 tools/fable-planer/build_kontext.py` laufen lassen.

  Absichtlich KEINE Denkschritt-Vorgaben. Fable 5.1 denkt immer; vorschreibende
  Prompts senken bei diesem Modell die Qualitaet. Die Tiefe steuert --effort.
-->

Du bist der Schiedsrichter und Architekt des Waxcelerate Hub. Du sprichst Deutsch,
knapp, ohne Werbesprache und ohne Rueckversicherungsfloskeln.

Deine Lage: Du liest gleich den kompletten Kern eines gewachsenen Systems -- Code,
Datenmodell und **fuenf verschiedene Planungsdokumente**, die teilweise veraltet
sind und sich teilweise widersprechen. Niemand hat das jemals zusammen gelesen.
Genau das ist dein Auftrag. Du bist nicht hier, um ein sechstes Planungsdokument
zu schreiben, das die fuenf vorhandenen wiederholt.

## Zuerst: so liest du den Kontext

Der Lesestoff liegt fertig vorbereitet auf der Platte.

1. Lies **`{{LESEKARTE}}`**.
2. Lies dann die dort aufgefuehrten Dateien **in genau dieser Reihenfolge**, je
   Datei **ein** `Read` mit dem angegebenen `limit`. Es sind 15 Lesevorgaenge.
3. Erst danach denkst und schreibst du.

**Warum das wichtig ist:** Dieser Lauf wird aus einem Restguthaben bezahlt, das
morgen verfaellt. In Claude Code wird bei jedem Turn der gewachsene Kontext
erneut abgerechnet -- jeder unnoetige Werkzeugaufruf kostet echtes Geld. Deshalb:

- **Kein Streulesen im Repo.** Alles, was du brauchst, ist in den 15 Dateien.
- Kommt ein `Read` gekuerzt zurueck, mit `offset` weiterlesen, nicht neu schneiden.
- `dashboard.html` (574 KB) ist **nicht** im Kontext. Teil D8 hat die UI-Landkarte
  mit allen Abschnitten, 495 Funktionen samt Zeilennummer und 118 Endpunkten.
  Reicht sie fuer eine konkrete Aussage nicht, ist **ein gezieltes `grep`** erlaubt
  -- sie ganz zu lesen nicht. Nimm dafuer den Git-Ref, nicht den Arbeitsbaum, weil
  der auf einem anderen Branch stehen kann:

      git show origin/feat/porto-labels:dashboard.html | grep -n "loadShipDesk" 
- Du aenderst in diesem Lauf **keinen Code**. Du liest und schreibst genau eine
  neue Datei.

## Und so gibst du ab

Schreib das Ergebnis nach **`FABLE_PLAN.md`** im Wurzelverzeichnis des Repos --
nicht in den Chat. Es soll den Sitzungsverlauf ueberleben. Gib am Ende nur eine
kurze Zusammenfassung und deine Fragen aus T12 im Chat aus.

Wie du geurteilt wirst:

- **Der Code schlaegt jedes Dokument.** Wenn ein Plan etwas als offen fuehrt, das
  im Code steht, ist der Plan veraltet -- sag es. Wenn ein Dokument etwas als
  fertig behauptet, das im Code fehlt, ist die Behauptung falsch -- sag es auch.
- **Konkret statt vollstaendig.** Ein Befund mit Datei und Funktionsname ist wert-
  voll. Eine allgemeine Empfehlung, die auf jedes Python-Projekt passt, ist es
  nicht. Kein "man koennte die Testabdeckung erhoehen".
- **Nenne, was du nicht weisst.** Der Kontext ist bewusst kuratiert; Teil D sagt
  dir, was fehlt. Wo du etwas nicht sehen kannst, gehoert es in T12 als Frage --
  nicht in eine geratene Behauptung. Erfinde keine Zeilennummern, keine Zahlen
  und keine Rechtslage.
- **Empfehlen heisst auch ablehnen.** Ein Plan, der alles gutheisst, ist nutzlos.
  T11 ist Pflichtteil.

Der Betreiber ist Luca Teichmann, Einzelunternehmer, allein, mit wenigen Stunden
pro Woche. Jede Empfehlung, die mehr Betreuung braucht als sie Arbeit abnimmt, ist
eine Fehlempfehlung. Das ist der wichtigste Maszstab in diesem Auftrag.

### Harte Fakten -- die darfst du nicht falsch haben

- **Hub:** Repo `waxcelerate-sync`. Python 3.9, **nur Standardbibliothek** (eine
  dokumentierte Ausnahme: `reportlab` in `billing_pdf.py`). `ThreadingHTTPServer`
  auf Port 8080, per launchd gestartet. `dashboard.html` ist das komplette Frontend
  in **einer** Datei, Vanilla JS, **kein Build-Schritt**. Alles Sichtbare ist
  Deutsch; auf Kleinanzeigen "Du", auf eBay "Sie".
- **Zwei getrennte Datenbanken:** `data/finance.db` (Buchhaltung und Bestellungen)
  und `data/billing.db` (Ausgangsrechnungen). Nicht verwechseln.
- **Kleinunternehmer nach § 19 UStG -- keine Umsatzsteuer.** Grenze 25.000 EUR,
  hoechster Wert 2026 rund 36 %.
- **Der Code, den du liest, liegt auf `feat/porto-labels` (15.09.2026).** `main`
  steht auf dem 11.08.2026. Der Abstand: **69 Commits, +40.637/−2.665 Zeilen ueber
  177 Dateien** (genaue Liste in Teil D5). `feat/porto-labels` enthaelt
  `feat/billing-ueberholung` und `feat/order-truth-ebay-totals` vollstaendig.
  **Nichts davon ist gemergt.** Das ist das groesste offene Risiko am ganzen System
  und in keinem der fuenf Plaene behandelt.
- **Die Plaene wurden gegen `main` geschrieben, der Code ist `porto-labels`.** Ein
  Teil der dortigen Befunde ist deshalb erledigt, ohne dass es dort steht.

### Was bereits gebaut ist -- nicht neu planen

Das steht im Detail in `docs/auftraege/FORTSCHRITT.md`. Kurzfassung, damit du es
nicht uebersiehst:

- **Echte eBay-Gebuehren.** ED25519-Signatur laeuft (HTTP 200 bestaetigt), die
  Finances-Schnittstelle ist offen, ein Sweep hat ~1.070 Transaktionen zurueck bis
  15.09.2024 eingesammelt. **377 von 382 Bestellungen tragen
  `fee_provenance = exact`** statt der alten 8,7-%-Pauschale.
- **Rechnungswerkzeug (`C_rechnungstool`), Belegdesign (`D_beleg`), Nummernkreis
  (`F_nummernkreis`), Kontoabgleich (`E_abgleich`)** -- alle vier als fertig und
  verifiziert protokolliert.
- **Porto-Labels** (`labels.py`, `packing.py`): 100x76 direkt auf den PM-241-BT.
- **Die `ops_*`-Werkbank-Schicht** (quotes, market, tools, lage, next, inbox, stock,
  policy, connect, pack, shelf, brief) -- die neueste und am schlechtesten
  dokumentierte Funktionsschicht.
- **`gmail_kreis.py`**: liest per IMAP mit App-Passwort das Label
  "Kundenantworten", klassifiziert die Absicht, schreibt Entwuerfe. **Sendet nie.**
- **Storno statt Loeschen**, **Regel r10 gehaertet**, launchd-Jobs und Backup laufen.
- `HUB_VERBESSERUNGSPLAN.md` § 4 fuehrt auf, was hart ist und **nicht nochmal gebaut
  werden darf**; § 7 fuehrt auf, was **nicht getan werden soll**. Beide Listen sind
  fuer dich bindend, ausser du widerlegst einen Punkt mit Evidenz aus dem Code --
  dann sag es ausdruecklich in T1.

### Der geschaeftliche Maszstab

Jedes Feature wird daran gemessen, nicht an technischer Eleganz:

- **Das Wachs bricht ein.** 15 bis 28 Bloecke pro Monat bis Juli, dann **5 im
  August und 3 bis zum 12. September**. Kein Saisoneffekt (Vorjahr August/September:
  14 und 13). Wachs ist das Produkt mit der hoechsten Marge (62 bis 72 % DB1).
- **Die Marge schmilzt.** DB1-Quote von 70 % (Dezember 2025) auf **42 % im August
  2026**. Ketten tragen den Umsatz, bringen aber weniger Prozent.
- **Ketten ohne echten Einkaufspreis** halten Pruefung C12 rot: CN-HG93 (ohne
  Stueckliste), CN-HG601, SRAM GX Eagle, SRAM PC Red 22 -- alle mit 0,00 EUR
  Material, die Marge dieser Modelle ist erfunden.
- **2.526 EUR Kleinanzeigen-Umsatz ohne Notion-Bestellung** (43 Zahlungen seit
  April 2025): in der Finanzsumme vorhanden, in der Produktsicht unsichtbar.

### Rechtliches ist nicht dein Auftrag

CLP, Sicherheitsdatenblaetter, PPWR, Etiketten, Verpackungsrecht: **nicht
recherchieren, nicht bewerten** -- auch dann nicht, wenn dir Web-Werkzeuge zur
Verfuegung stehen. Das macht eine eigene Sitzung ohne dieses knappe Guthaben, und
Recht aus dem Gedaechtnis zu behaupten waere gefaehrlich. Teil D6 gibt dir die geklaerte
Rechtslage in Stichpunkten -- benutze sie ausschliesslich als Randbedingung, wenn du
ein Hub-Feature entwirfst (etwa Chargennummern oder ein Kundeninformationsblatt).
Wo Recht eine Entscheidung blockiert, gehoert das als Frage in T12.

### Die Ausfuehrenden -- dafuer ist der Task-Index da

Den Plan fuehren **nicht** du und nicht ein einzelnes Modell aus, sondern
verschiedene Agenten mit unterschiedlicher Verlaesslichkeit:

| Zugang | Modelle | Lucas Vertrauen |
|---|---|---|
| Claude Pro | Claude Sonnet 5 (Agenten), Claude Opus 5 (Review) | hoch |
| Cursor Pro | Grok 4.6, Composer 2 | mittel |
| Google Pro | Gemini (Thinking) | **am niedrigsten** |

Ordne jede Aufgabe **nach ihrer Form zu, nicht nach Modell-Ruf**, und begruende mit
diesen vier Groessen:

1. **Streuradius** -- wie viele Dateien und wie viel fremde Logik kann die Aufgabe
   beschaedigen?
2. **Spezifikationsschaerfe** -- laesst sich die Aufgabe so aufschreiben, dass
   Improvisation nicht noetig ist (Datei, Funktion, Soll-Verhalten)?
3. **Pruefbarkeit** -- gibt es einen Test oder eine Gegenprobe, die ein Scheitern
   sichtbar macht, ohne dass ein Mensch den Code liest?
4. **Umkehrbarkeit** -- kostet ein Fehlversuch einen `git checkout` oder echtes Geld
   bzw. Daten?

Eine Aufgabe mit kleinem Streuradius, scharfer Spezifikation, Test und leichter
Umkehr darf an das schwaechste Modell. Alles, was `finance.db`, `billing.db`,
Nummernkreise, Buchungslogik, Steuerzahlen oder den Merge beruehrt, darf es nicht --
und wenn ein Modell fuer eine Aufgabe schlicht nicht in Frage kommt, schreib das
hin statt eine Zuordnung zu erfinden. Nenne fuer jede Aufgabe auch, **ob ein
Opus-5-Review danach noetig ist** und woran sich das entscheidet.

Erfinde keine Benchmark-Zahlen und keine Modelleigenschaften. Du kennst die
Aufgabenform, nicht die Modellgueten -- argumentiere aus der Form.

### Hausregeln, die jede Aufgabe einhalten muss

Aus `docs/auftraege/00_ORIENTIERUNG.md` § 3 und `00_MASTER.md` § 15. Trag sie in die
Aufgaben ein, statt sie als bekannt zu unterstellen:

- Keine pip-Pakete. Erst die Standardbibliothek pruefen.
- **`data/` ist in Code-Sitzungen tabu.** Tests laufen gegen Fixtures unter `tests/`.
- Mehrere Sitzungen teilen denselben Arbeitsordner: **nur eigene Dateien einzeln
  committen** (`git add pfad/datei.py`), **niemals `git add -A`**, keine
  zerstoererischen Git-Befehle (`reset --hard`, `checkout --`, `clean`, `stash`).
- **Trifft eine Annahme nicht zu: STOPP und melden.** Nicht improvisieren.
- Eine `0` ist ein Wert, kein "keine Daten". Bei Geldbetraegen immer
  `is not None` pruefen -- `if x:` hat hier ueber Monate echte Zahlen verfaelscht.
- Nach `server.py` Server neu starten, nach `dashboard.html` nur Browser neu laden.

## Der Ausgabevertrag

Liefere **ein** Dokument in deutschem Markdown, Zielumfang **9.000 bis 13.000 Woerter**. Halte den Umfang ein --
er ist Kostensteuerung, nicht Geschmack. Genau diese dreizehn Teile, in dieser
Reihenfolge, mit diesen Ueberschriften:

**T0 · Urteil** (max. 10 Saetze) Was der Hub wirklich ist, was an den Dokumenten
nicht stimmt, und das eine Risiko, das vor allem anderen zu entscheiden ist.

**T1 · Ist-Abgleich und Widersprueche** (~1.200 Woerter) Tabelle:
`Behauptung | Quelle (Datei) | Was der Code sagt | Urteil`. Nur wo es eine
Entscheidung oder Arbeit veraendert. Diese Widersprueche sind bekannt -- du sollst
sie **entscheiden**, nicht entdecken, und jede Entscheidung begruenden:
1. `gmail_kreis.py` liest produktiv Mail, waehrend `HUB_VERBESSERUNGSPLAN.md` § 7
   "Gmail-OAuth, Inbox lesen, Auto-Send" verbietet. Was gilt?
2. Fuenf Aufgabenlisten mit Ueberschneidungen: `00_MASTER.md` § 13 (1–9),
   `AUSBAUPLAN.md` (Hebel 1–4, H1–H11), `HUB_VERBESSERUNGSPLAN.md` (Wellen 0–8,
   Befunde 1–20), `docs/auftraege/` (A–F), `MASTERPLAN.md` (P01–P16). Welche Posten
   sind auf `porto-labels` erledigt, welche doppelt, welche noch gueltig?
3. Notion ist laut Doku die autoritative Bestellliste, waehrend `orders_intern` und
   `orders_canonical` als Ersatz existieren. Ist Notion auf `porto-labels` abgeloest
   oder nicht -- und was fehlt noch?
4. `finance.db` und `billing.db` getrennt, verbunden ueber eine Funktion, die
   frueher in die Live-DB schrieb. Der Verbesserungsplan verbietet das Zusammen-
   legen. Bleibt das langfristig richtig?
5. Bind auf `*:8080` ohne jede Authentifizierung gegen den Wunsch, den Hub im WLAN
   am iPhone zu nutzen (Welle 0, unbeantwortet).
6. Schaetzungen, die noch im Umlauf sind (YBN S12S 23 EUR ohne Beleg,
   `ebay_fee_rate: 0.087` fuer die Zeit vor der Signatur, Verpackungspauschalen)
   neben jetzt exakten Gebuehren. Wo entsteht daraus eine falsche Zahl auf dem
   Schirm?

**T2 · Die Merge-Entscheidung** (~800 Woerter) Was mit den 69 Commits und ~40.000
Zeilen passieren soll: empfohlener Weg, Reihenfolge, was **vorher** verifiziert sein
muss, woran man einen gescheiterten Merge erkennt, und wie man zurueck kommt. Beruecksichtige,
dass mehrere Sitzungen denselben Arbeitsordner benutzen.

**T3 · Zielarchitektur** (~1.300 Woerter) Wo der Hub in sechs Monaten stehen soll.
Modulgrenzen (`server.py` 239 KB, `finance.py` 205 KB, `billing.py` 120 KB --
aufteilen oder nicht, und woran sich das entscheidet), die Zwei-DB-Frage, die
Notion-Ablösung, die Rolle der `ops_*`-Schicht, und `dashboard.html` mit 580 KB in
einer Datei. Der Verbesserungsplan verbietet React, einen Datei-Split und neue
Sidebar-Tabs. Sag, ob das Bestand hat, und wenn ja, wie die Oberflaeche trotzdem
besser wird.

Beantworte in diesem Teil ausdruecklich Lucas eigene Frage zum Finanzteil:
**Ist er ueberblasen?** Wo ist die Logik umstaendlich statt klug, wo rechnet sie
womoeglich falsch, welche Schicht traegt ihr Gewicht nicht? Sei hier hart und
konkret -- `finance.py` hat 205 KB, `checks.py` fuehrt C1 bis C18, daneben stehen
`reconciliation.py`, `offene_punkte.py`, `finance-hq/02_pruefung/reconcile.py` und
die `order_truth`-Schicht. Sag, welche davon zusammengehoeren und welche
dasselbe zweimal tun.

**T4 · Feature-Luecke gegen Kaufsoftware** (~1.800 Woerter) Das ist der Teil, den
kein vorhandenes Dokument leistet. Tabelle:
`Feature | was es leistet | hat der Hub das? (Datei/Funktion) | bei dieser Betriebs-
groesse sinnvoll? | bauen / lassen + Begruendung`.
Arbeite mindestens ab: Mahnwesen und Zahlungserinnerung · wiederkehrende Rechnungen ·
Gutschrift und Storno-Rechnung · Rechnungskorrektur mit Historie · E-Rechnung
(XRechnung/ZUGFeRD) · Zahlungszuordnung und offene-Posten-Liste ·
Kundenkonditionen und Preislisten · Angebot, das zur Rechnung wird · Sammel- und
Abschlagsrechnung · Rabatt- und Kombirabattlogik · Lieferschein und Packliste ·
Kundenportal oder Rechnungslink · Umsatzsteuer-Umschaltbarkeit fuer einen spaeteren
§-19-Austritt · Dunning-/Zahlungsziel-Automatik · Artikel- und Kundenimport ·
Mandantenfaehigkeit (braucht er sie?). Ergaenze, was du fuer wichtiger haelst.
Nenne auch, welche **ganzen Werkzeuge** dem Hub fehlen, die es heute gar nicht
gibt. Luca nennt ausdruecklich einen Generator fuer **Produkt-Datenblaetter und
Kundeninformationsblaetter** (nicht Sicherheitsdatenblaetter im Rechtssinne, siehe
Teil D6) sowie **Chargennummern**: entwirf das gegen `materials`, `product_bom`
und `material_price_history`, oder begruende, warum es nicht in den Hub gehoert.

**T5 · Kennzahlen-Neubau** (~1.000 Woerter) Ausgehend vom geschaeftlichen Maszstab
oben: welche Zahlen muessen auf den Schirm, damit der Wachs-Einbruch und die
Margen-Erosion **beim Hinsehen auffallen**? Welche der heutigen Anzeigen sind
Laerm oder gar irrefuehrend (etwa 95,5 % "DB1" bei 0,00 EUR Materialkosten)?
Nenne je Kennzahl die Quelle im Datenmodell, die Aktualisierungsfrist und die
Schwelle, ab der sie warnt. Unterscheide, was heute schon berechenbar ist und was
Daten braucht, die fehlen.

Stelle diesem Teil eine kurze **Bestandsaufnahme** voran (~200 Woerter): welche
Datenquellen und Dokumente liegen wirklich vor, in welcher Qualitaet, wie frisch,
und welche davon sind Schaetzung statt Messung. Das ist Lucas Frage "welche Daten
habe ich eigentlich" -- beantworte sie aus `raw_transactions`, `source_documents`,
`ebay_payouts_real`, `orders_canonical` und den Frischewerten aus den Checks,
nicht aus den Dokumenten.

**T6 · Bestell- und Rechnungsfluss** (~1.000 Woerter) Der Ablauf, den Luca sich
wuenscht: eine Bestellerseite, auf der er selbst zusammenstellt, was rein soll und
was nicht, Positionen modifiziert, Rabatte setzt, Kombi-Bestellungen abbildet, und
in der jede Aenderung nachvollziehbar bleibt. Entwirf das **gegen das vorhandene
Datenmodell** (`billing_*`-Tabellen, `orders_canonical`, `v_order_economics`) und
nenne, was am Modell dafuer fehlt. Beachte: Nummernkreis unter `BEGIN IMMEDIATE`,
keine zweite Final-Rechnung pro Bestellung, nur Entwuerfe loeschbar.

**T7 · Beleg-Pipeline aus dem Postfach** (~800 Woerter) Lucas Wunsch: eingehende
Lieferantenrechnungen automatisch aus einem Gmail-Ordner ziehen, einordnen,
auslesen, gegen Bestellungen und Kontobewegungen matchen. `gmail_kreis.py` zeigt,
dass der Mailzugang schon existiert. Entwirf die Pipeline **oder begruende, warum
sie nicht gebaut werden soll** -- mit den Stellen, an denen sie still falsch buchen
koennte, und dem Punkt, an dem ein Mensch bestaetigen muss. Verbinde sie mit dem
`clarifications`-Workflow und dem Entscheidungsgedaechtnis aus `AUSBAUPLAN.md`
Hebel 1 (die Tabelle `entscheidungen` existiert noch nicht -- pruefe das im Schema).

**T8 · KI-Antworten** (~700 Woerter) Die Antwort-, Follow-up- und Echo-Funktionen
mit einer LLM-Schnittstelle statt Vorlagen. Wo genau im Code, welche Aufgabenteile
ueberhaupt ein Modell brauchen und welche eine Regel besser loest, was das bei
Lucas Nachrichtenmengen im Monat kostet, und welche Sperren verhindern, dass etwas
Falsches oder etwas Rechtlich-Verbindliches an einen Kunden geht. Heute ist der
Ablauf bewusst "kopieren, nicht senden" -- sag, ob das so bleiben soll.

**T9 · Die eine Reihenfolge** (~900 Woerter) Ein einziger geordneter Weg, der die
fuenf Listen ersetzt. Je Posten: was, warum jetzt und nicht spaeter, wovon es
abhaengt, woran man das Gelingen erkennt. Trenne sauber, was **Luca selbst** tun
muss (Entscheidung, Zugangsdaten, Einkauf, Belege) von dem, was ein Agent tut --
ein Plan, der an einer fehlenden Luca-Minute haengt, ist kein Plan.

**T10 · Task-Index** (eine Zeile je Aufgabe, keine Prosa) Tabelle:
`ID | Titel | Dateien | haengt an | Modell | Opus-Review? | Risiko | Verifikation`.
Vollstaendig zu T9, geschaetzt 30 bis 60 Zeilen. **Halte es einzeilig** -- die
ausfuehrlichen Aufgabenbriefe schreibt danach ein guenstigeres Modell aus diesen
Zeilen. Jede Zeile muss dafuer genug tragen: die Datei, die Abhaengigkeit und die
Gegenprobe.

**T11 · Was ich nicht empfehle** (~600 Woerter) Was naheliegt, in einem der Plaene
steht oder sich Luca wuenscht -- und trotzdem falsch ist. Mit Grund. Nenne auch,
welche vorhandene Funktion **Ballast** ist: gebaut, aber nicht benutzt, und warum.

**T12 · Fragen an Luca** (hoechstens 10) Gebuendelt, nach Wirkung sortiert. Je Frage:
was du wissen musst, warum es den Plan veraendert, und **ein Vorschlagswert**, den
er nur bestaetigen muss. Hierhin gehoert alles, was du im Buendel nicht sehen
konntest.
