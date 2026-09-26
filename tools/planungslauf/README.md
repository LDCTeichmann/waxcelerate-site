# Planungslauf für den Waxcelerate Hub

Vorbereitung für **einen** tiefen Analyse- und Planungslauf über den Hub
(`waxcelerate-sync`) — ausgeführt von **GPT-6 Astra in Codex**.

**→ Bedienung: [`START.md`](START.md).** Alles ist bereits vorbereitet; das
Paket liegt im Hub-Repo auf Branch `codex/planungskontext`.

Reines Python-3-stdlib, kein API-Key. `tools/` liegt außerhalb des TS-Projekts.

---

## Warum der Auftrag so zugeschnitten ist

**Der Hub ist nicht unter-, sondern übergeplant.** Es gibt fünf Planungsebenen
(`00_MASTER.md` §13, `AUSBAUPLAN.md`, `HUB_VERBESSERUNGSPLAN.md` mit 8 Wellen und
20 gemessenen Befunden, `docs/auftraege/`, `MASTERPLAN.md`) — teils
widersprüchlich, teils gegen den veralteten `main` geschrieben. Ein sechstes
Dokument wäre die Verschwendung. Der Auftrag ist deshalb **Schiedsrichter und
Zielarchitektur**, kein Planschreiber.

**`main` ist tot-veraltet (11.08.2026).** Der echte Stand liegt auf
`feat/porto-labels`: 69 Commits, +40.637/−2.665 Zeilen über 177 Dateien, enthält
`feat/billing-ueberholung` und `feat/order-truth-ebay-totals` vollständig. Nichts
davon ist gemergt — das größte offene Risiko am System.

**Viel aus der Wunschliste ist gebaut:** Rechnungswerkzeug, Nummernkreis,
Belegdesign, Kontoabgleich, echte eBay-Gebühren per ED25519-Signatur (377/382
Bestellungen `exact`), Porto-Labels, `ops_*`-Werkbank, 285+ Tests,
`gmail_kreis.py`.

---

## Der Zuschnitt: Landkarten statt Volltext

Codex ist ein **Agent im Repo** — er kann Quelltext selbst lesen. Also wird nur
das vorgeladen, was er nicht billig herleiten kann:

| Teil | Inhalt | ~Token |
|---|---|---|
| Dokumente | die fünf Planungsebenen, Regelwerk, Steuer-Playbook, Geschäftszahlen aus dem Masterplan-Repo | 113k |
| Teil D | Dateibaum · DB-Schema (77 DDL-Anweisungen) · Routentabelle · Test-Landkarte · die 69 Commits · Rechtslage · UI-Landkarte · Code-Landkarte | 60k |

**~173.000 Token, vier Lesevorgänge.** Der Quelltext bleibt draußen; zwei
generierte Landkarten mit Zeilennummern ersetzen ihn:

- **Code-Landkarte** — 957 Definitionen aus 52 Modulen: **323.143 → 12.903 Token**
- **UI-Landkarte** — `dashboard.html`: 13 Abschnitte, 495 JS-Funktionen,
  118 Endpunkte: **164.141 → 5.024 Token**

Beides gemessen, nicht geschätzt. Der Einstieg bleibt damit unter **272.000
Token** — darüber zählt bei den GPT-Modellen die *gesamte* Anfrage doppelt.

Der Masterplan-Auszug ist mit drin, weil Codex in der Cloud nur **ein** Repo
sieht und die Geschäftszahlen (Wachs-Einbruch, DB1 70 % → 42 %) sonst fehlten —
sie sind der Maßstab, an dem jedes Feature gemessen wird.

---

## Der Auftrag

`auftrag.md` (im Hub als `.codex-plan/PLANUNGSAUFTRAG.md` — bewusst nicht
`AUFTRAG.md`, so heißt schon ein altes Dokument im Wurzelverzeichnis).
Ergebnis ist
**`CODEX_PLAN.md`**, 13 Teile, Zielumfang 9.000–13.000 Wörter:

`T0` Urteil · `T1` Ist-Abgleich und Widersprüche · `T2` Merge-Entscheidung ·
`T3` Zielarchitektur · `T4` Feature-Lücke gegen Kaufsoftware · `T5`
Kennzahlen-Neubau · `T6` Bestell- und Rechnungsfluss · `T7` Beleg-Pipeline aus
dem Postfach · `T8` KI-Antworten · `T9` die eine Reihenfolge · `T10` Task-Index ·
`T11` was nicht empfohlen wird · `T12` höchstens zehn Fragen an Luca.

Zwei bewusste Eigenheiten:

- **Fortlaufendes Schreiben.** Jeder Teil wird sofort angehängt, mit einer Marke
  `<!-- naechster Teil: T4 -->`. Läuft das Plus-Zeitfenster aus, ist nichts
  verloren und eine Folgesitzung macht ohne Suchen weiter.
- **`T10` bleibt einzeilig.** Die ausführlichen Aufgabenbriefe schreibt danach ein
  günstigeres Modell daraus — Vorlage in `handoff_sonnet.md`.
- **Pflichtlektüre-Tabelle.** Weil der Quelltext nicht vorgeladen ist, besteht die
  Gefahr, dass zu wenig nachgelesen wird. Der Auftrag nennt deshalb je Ausgabeteil
  die Dateien, die wirklich geöffnet sein müssen, und verlangt `datei:zeile` für
  jede Behauptung über Code.

**Rechtliches ist ausgeklammert** (CLP, Sicherheitsdatenblätter, PPWR). Recht aus
dem Gedächtnis ist gefährlich, und Recherche gehört nicht in diesen Lauf. Teil D6
gibt den geklärten Stand nur als Randbedingung mit.

---

## Sicherheitsnetz

`build_kontext.py --check` prüft jeden Manifest-Pfad gegen den Git-Ref und bricht
bei **Geheimnis-Mustern** ab (Notion-Token, eBay-Refresh-Token, private Schlüssel,
PayPal-Secrets, App-Passwörter). Nach dem Bauen prüft es, dass jede eingebettete
Datei in genau einem Baustein gelandet ist. Fehlt das Masterplan-Repo, bricht es
**hart** ab statt still weniger zu liefern.

`los.sh` committet ausschließlich `.codex-plan/` und bricht ab, sobald eine fremde
Datei im Index läge — im Hub arbeiten mehrere Sitzungen im selben Ordner.

---

## Dateien

| Datei | Rolle |
|---|---|
| `START.md` | **die Bedienung** — ChatGPT-App oder CLI |
| `auftrag.md` | der Auftrag — im Hub als `.codex-plan/PLANUNGSAUFTRAG.md` |
| `prompts.md` | die zwei fertigen Codex-Nachrichten (Start und Fortsetzung) |
| `build_kontext.py` | baut das Paket aus einem Git-Ref; erzeugt Teil D samt beider Landkarten |
| `los.sh` | nur nötig, wenn der Hub sich bewegt hat: neu bauen und den Branch aktualisieren |
| `manifest.json` | die kuratierte Dateiliste, editierbar |
| `handoff_sonnet.md` | Vorlage: aus einer `T10`-Zeile einen ausführbaren Auftrag |
