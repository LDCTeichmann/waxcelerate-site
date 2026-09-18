# Fable-5.1-Planer für den Waxcelerate Hub

Vorbereitung für **einen** Planungslauf mit Fable 5.1 in Claude Code, bezahlt aus
einem Restguthaben. Der Werkzeugkasten baut den Lesestoff, prüft ihn auf
Geheimnisse und liefert den Auftrag — den Lauf selbst startest du.

**→ Bedienung: [`START.md`](START.md) — im Kern ein Befehl, `bash los.sh`.
Diese Datei erklärt das Warum.**

Er plant nicht diese Website, sondern den **Hub** (`waxcelerate-sync`). Nur
Python-3-stdlib, kein API-Key, kein Netz. `tools/` liegt außerhalb des
TypeScript-Projekts.

---

## Die zwei Geldtöpfe — der Grund für den Umbau

Das ist die Unterscheidung, an der die erste Fassung dieses Werkzeugkastens
gescheitert ist:

| Topf | Wo er gilt | Wofür |
|---|---|---|
| **claude.ai Usage Credits** | Claude Code, Claude-Apps | ← **hier liegen die 18,29 €** |
| **Developer-Platform-Credits** | `platform.claude.com`, die API | separat zu bezahlen |

Ein Claude-Abo deckt keine API-Nutzung, und Usage Credits lassen sich nicht über
die API ausgeben. Die erste Fassung rief Fable per API-Skript auf — mit dem
falschen Topf. Deshalb läuft der Plan jetzt **in Claude Code** (`/model fable`),
wo das Guthaben tatsächlich gilt.

Nebenwirkung: **kein Batch-Rabatt.** Die 50 % gibt es nur auf der API-Schiene.

---

## Der Kostenhebel: wenige große Lesevorgänge

In Claude Code wird bei jedem Turn der gewachsene Kontext erneut abgerechnet.
Liest Fable 82 Dateien einzeln, zahlt man den Kontext 82-mal — grob geschätzt
mehrere Dollar allein an Cache-Lesekosten.

`build_kontext.py` konkateniert deshalb vor: **15 Lesevorgänge statt 82.**

| Teil | Inhalt | ~Token |
|---|---|---|
| A | Orientierung, Regelwerk, die fünf Planungsebenen, Geschäftszahlen | 113k |
| B | Der Code: `server.py`, `finance.py`, `billing.py`, `ops_*`, `order_truth`-Kern | 332k |
| C | `order_truth/overlay.js` | 2k |
| D | **generiert**: Dateibaum, DB-Schema, Routen, Test-Landkarte, die 69 ungemergten Commits, Rechtslage, UI-Landkarte | 47k |

**~493k Token gesamt.** Der ganze Branch wäre ~1 Mio.

### Warum `dashboard.html` nicht drin ist

Die Datei ist 574 KB / ~164k Token — ein Drittel des gesamten Kontexts. Teil D8
enthält stattdessen eine generierte **UI-Landkarte**: alle Sidebar-Abschnitte,
**495 JS-Funktionen mit Zeilennummer**, **118 gerufene Endpunkte** — mit ~5k
Token. Gemessen, nicht geschätzt: **164.141 → 5.024**. Für Details greift Fable
gezielt per `grep` in die Datei.

Teil D ist überhaupt der beste Gegenwert: das vollständige DB-Schema entsteht aus
77 DDL-Anweisungen in `finance.py`, `billing.py`, `order_truth/schema.sql` und
allen Migrationsskripten — ohne dass diese Skripte im Kontext liegen.

---

## Der Auftrag

`auftrag.md` wird als eine Nachricht eingefügt. Bewusst **ohne**
Denkschritt-Vorgaben: Fable 5.1 denkt immer, und vorschreibende Prompts senken bei
diesem Modell die Qualität. Die Tiefe steuert `--effort`, nicht der Text.

Fable liefert **`FABLE_PLAN.md`** (nicht Chat-Ausgabe — die überlebt die Sitzung
nicht) mit dreizehn Teilen, Zielumfang 9.000–13.000 Wörter:

`T0` Urteil · `T1` Ist-Abgleich und Widersprüche · `T2` Merge-Entscheidung ·
`T3` Zielarchitektur · `T4` Feature-Lücke gegen Kaufsoftware · `T5`
Kennzahlen-Neubau · `T6` Bestell- und Rechnungsfluss · `T7` Beleg-Pipeline aus dem
Postfach · `T8` KI-Antworten · `T9` die eine Reihenfolge · `T10` Task-Index ·
`T11` was Fable nicht empfiehlt · `T12` höchstens zehn Fragen an dich.

Der Auftrag ist **Schiedsrichter, nicht Planschreiber**. Es gibt schon fünf
Planungsebenen (`00_MASTER.md` § 13, `AUSBAUPLAN.md`, `HUB_VERBESSERUNGSPLAN.md`,
`docs/auftraege/`, `MASTERPLAN.md`), die sich teils widersprechen und teils gegen
den veralteten `main` geschrieben wurden. Ein sechstes Dokument wäre die
Verschwendung; das Zusammenlesen ist der Wert.

`T10` bleibt **einzeilig**. Die ausführlichen Aufgabenbriefe schreibt danach
Sonnet 5 über Claude Pro daraus — kostenlos, Vorlage in `handoff_sonnet.md`. So
bleibt Fables teurer Output klein.

**Rechtliches ist ausgeklammert.** Ein Modell ohne Netz kann Recht nicht
recherchieren, und Recht aus dem Gedächtnis ist gefährlich. Teil D6 gibt den
geklärten Stand nur als Randbedingung mit.

---

## Sicherheitsnetz

`build_kontext.py --check` prüft jeden Manifest-Pfad gegen den Git-Ref und bricht
ab, wenn ein **Geheimnis-Muster** auftaucht (Notion-Token, eBay-Refresh-Token,
privater Schlüssel, PayPal-Secret, App-Passwort). Der Hub behauptet, seit Juli 2026
lägen keine Secrets mehr in `config.json` — das wird geprüft, nicht geglaubt.
Beim letzten Lauf: keine Treffer, einzige Klartext-Adresse ist Lucas eigene
Geschäftsadresse.

Nach dem Bauen prüft das Skript zusätzlich, dass **jede** Manifest-Datei in genau
einem Baustein gelandet ist, und bricht sonst ab — ein stilles Auslassen wäre der
teuerste Fehler.

---

## Dateien

| Datei | Rolle |
|---|---|
| `START.md` | **die Bedienung** — ein Befehl, plus der Monatsdeckel |
| `los.sh` | findet die Repos, holt den Branch ohne `checkout`, prüft, baut, sagt den nächsten Schritt |
| `auftrag.md` | der Fable-Auftrag, als eine Nachricht einzufügen |
| `build_kontext.py` | baut `kontext/` aus einem Git-Ref; erzeugt Teil D |
| `manifest.json` | die kuratierte Dateiliste, editierbar |
| `handoff_sonnet.md` | Vorlage: aus einer `T10`-Zeile einen Auftrag für Sonnet 5 |
| `<hub>/.fable/` | erzeugt: Lesestoff plus fertiger `AUFTRAG.md` mit echten Pfaden |
