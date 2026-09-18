# Fable-5.1-Planer für den Waxcelerate Hub

Werkzeugkasten für **einen** teuren Planungslauf mit Fable 5.1 über die API, bei
18 € Guthaben. Er tut drei Dinge: das kuratierte Kontext-Bündel bauen, die Kosten
**vor** dem Senden exakt nennen, und den Lauf mit Verbrauchsprotokoll ausführen.

> **Wo das läuft:** auf deinem Mac, im Hub-Ordner — nicht in einer
> Claude-Code-Sitzung. Eine Websitzung ist flüchtig und hat keinen
> `ANTHROPIC_API_KEY`. Der Ordner darf überall liegen; `--hub <pfad>` zeigt auf
> `waxcelerate-sync`.

Voraussetzungen: Python 3, `pip install anthropic`, `ANTHROPIC_API_KEY` gesetzt
(oder `ant auth login`). `waxcelerate-masterplan` sollte als Nachbarordner von
`waxcelerate-sync` liegen, sonst werden dessen Dateien übersprungen (mit Meldung).

---

## Die drei Schritte

```bash
# 1 · Bündel prüfen und bauen. Kostet nichts, braucht keinen API-Key.
python3 build_bundle.py --check --hub ~/Developer\ Luca/waxcelerate/waxcelerate-sync
python3 build_bundle.py        --hub ~/Developer\ Luca/waxcelerate/waxcelerate-sync

# 2 · Exakte Tokenzahl und Kosten. count_tokens ist KOSTENLOS.
python3 price.py --budget 19 --effort xhigh --batch

# 3 · Erst die Generalprobe (Cent-Bereich), dann der echte Lauf.
python3 run_fable.py --rehearsal
python3 run_fable.py --batch --effort xhigh
```

Schritt 1 bricht ab, wenn eine Manifest-Datei fehlt oder ein **Geheimnis-Muster**
im Bündel auftaucht (Notion-Token, eBay-Refresh-Token, privater Schlüssel,
App-Passwort). Der Hub behauptet, seit Juli 2026 lägen keine Secrets mehr in
`config.json` — das wird geprüft, nicht geglaubt.

Schritt 3 nennt Modell, Modus, Tokenzahl und Schätzung und fragt einmal nach,
bevor etwas fließt. `--yes` überspringt die Rückfrage.

---

## Was der Lauf kostet

Fable 5.1: **10 $/MTok Input, 50 $/MTok Output.** Thinking ist immer an und zählt
als Output — das ist der Kostentreiber, nicht der große Input. **Batch gibt 50 %
auf alles.** 18 € ≈ 19 $.

| Modus | Input ~653k | Output ~73k | Summe |
|---|---|---|---|
| Standard, `xhigh` | 6,53 $ | 3,65 $ | **10,18 $** |
| **Batch, `xhigh`** | 3,27 $ | 1,82 $ | **5,09 $** |
| Batch, `max` | 3,27 $ | 2,70 $ | 5,97 $ |
| Batch, `xhigh`, `--slim` | ~2,27 $ | 1,82 $ | ~4,09 $ |

**Empfehlung: Durchlauf 1 per `--batch --effort xhigh`.** Batch ist asynchron
(Minuten bis Stunden), und ein Planungslauf ist nicht interaktiv — der halbe Preis
ist geschenkt. Danach bleiben ~14 $ für ein Nachschärfen und Reserve.

**Cache:** Standard ist `--cache aus`. Der Schreibaufschlag (12,50 $/MTok) lohnt
sich nur, wenn ein zweiter Aufruf **innerhalb des TTL** folgt — und bis du ein
12.000-Wörter-Dokument gelesen hast, ist ein 5-Minuten-Cache längst kalt. Nur wenn
du direkt hintereinander zweimal fragst: `--cache 1h`.

`--slim` lässt `dashboard.html` weg (~165k Token). Spart ~1 $, kostet Fable aber
die Grundlage für jedes Urteil über die Oberfläche (T3, T5, T6) — nur nehmen, wenn
das Budget sonst reißt.

Jeder Lauf schreibt eine Zeile nach `out/spend.log` mit dem **echten** `usage` und
den daraus gerechneten Kosten. `price.py` zieht das vom Budget ab. Nach dem ersten
Lauf kennst du deinen tatsächlichen Thinking-Verbrauch — die Schätzung in
`price.py` ist bis dahin nur eine Schätzung.

---

## Was Fable bekommt und was nicht

`manifest.json` ist die kuratierte Liste, editierbar. Der ganze Branch wäre ~1 Mio
Token, also ~10 $ Input **je Aufruf** — Kuratierung ist Pflicht, nicht Feinschliff.

| Teil | Inhalt | ~Token |
|---|---|---|
| A | Orientierung, Regelwerk, die fünf Planungsebenen, Geschäftszahlen | 113k |
| B | Der Code: `server.py`, `finance.py`, `billing.py`, `ops_*`, `order_truth`-Kern | 332k |
| C | `dashboard.html` (580 KB, 13 Abschnitte) | 167k |
| D | **generiert**: Dateibaum, komplettes DB-Schema, Routentabelle, Test-Landkarte, die 69 ungemergten Commits, Rechtslage in Stichpunkten | 41k |

Teil D ist der beste Gegenwert im Bündel: er gibt Fable das vollständige Schema
(77 DDL-Anweisungen aus `finance.py`, `billing.py`, `order_truth/schema.sql` und
allen Migrationsskripten), ohne dass diese Skripte im Bündel liegen. Was im
Dateibaum steht, aber nicht im Bündel, hat Fable nicht gesehen — der Prompt sagt
ihm, dass das in T12 als Frage gehört und nicht geraten wird.

`out/bundle_bericht.txt` listet nach dem Bau jede Datei mit ihrem Token-Anteil.
Dort siehst du, was eine Kürzung wirklich einspart.

---

## Der Auftrag

`prompt.md` enthält genau zwei gesendete Abschnitte, `## SYSTEM` und `## USER`;
alles andere ist Kommentar. Absichtlich **ohne** Denkschritt-Vorgaben: Fable 5.1
denkt immer, und vorschreibende Prompts senken bei diesem Modell die Qualität.
Die Tiefe steuert `output_config.effort`, nicht der Text. Kein `thinking`-Parameter,
kein `budget_tokens`, kein Prefill, kein erzwungenes Tool — all das gibt auf
Fable 5.1 einen 400er.

Fable liefert ein Dokument mit dreizehn Teilen, Zielumfang 9.000–13.000 Wörter:

`T0` Urteil · `T1` Ist-Abgleich und Widersprüche · `T2` Merge-Entscheidung ·
`T3` Zielarchitektur · `T4` Feature-Lücke gegen Kaufsoftware · `T5`
Kennzahlen-Neubau · `T6` Bestell- und Rechnungsfluss · `T7` Beleg-Pipeline aus dem
Postfach · `T8` KI-Antworten · `T9` die eine Reihenfolge · `T10` Task-Index ·
`T11` was Fable nicht empfiehlt · `T12` höchstens zehn Fragen an dich.

Der Auftrag ist bewusst **Schiedsrichter, nicht Planschreiber**. Es gibt schon fünf
Planungsebenen (`00_MASTER.md` § 13, `AUSBAUPLAN.md`, `HUB_VERBESSERUNGSPLAN.md`,
`docs/auftraege/`, `MASTERPLAN.md`), die sich teils widersprechen und teils gegen
den veralteten `main` geschrieben wurden. Ein sechstes Dokument wäre die
Verschwendung; das Zusammenlesen ist der Wert.

**Rechtliches ist ausgeklammert.** Ein API-Aufruf hat keinen Webzugriff, und Recht
aus dem Gedächtnis ist gefährlich. Teil D6 gibt die geklärte Rechtslage als
Randbedingung mit; recherchiert wird sie anderswo.

---

## Danach

`handoff_sonnet.md` ist die Vorlage, mit der **Sonnet 5 über Claude Pro** aus einer
einzeiligen T10-Zeile einen vollständigen Arbeitsauftrag macht — kostenlos. So
bleibt Fables teurer Output klein und die Ausführung günstig.

Reihenfolge: T12 beantworten → T9 lesen → die ersten T10-Zeilen einzeln durch
`handoff_sonnet.md` → ausführen lassen → T2 (Merge) erst, wenn du ihn freigegeben hast.

---

## Wenn etwas klemmt

| Meldung | Ursache und Weg |
|---|---|
| `Ref 'feat/porto-labels' existiert nicht` | flacher Klon. `git -C <hub> fetch --depth=200 origin feat/porto-labels` |
| `NICHT GEFUNDEN` beim `--check` | Datei wurde verschoben oder umbenannt. Pfad in `manifest.json` korrigieren — **nicht** ignorieren, sonst plant Fable ohne sie |
| `GEHEIMNIS-VERDACHT` | Bündel wird nicht geschrieben. Betroffene Datei aus `manifest.json` nehmen oder das Geheimnis aus dem Repo räumen |
| `Über dem 1-Mio-Kontextfenster` | `--slim` bauen oder Manifest-Zeilen streichen (`bundle_bericht.txt` zeigt, was lohnt) |
| `400 — Parameter abgelehnt` | fast immer ein Parameter, den Fable 5.1 nicht nimmt. Skript setzt bewusst kein `thinking` und kein `tool_choice` |
| `max_tokens erreicht` | Dokument ist abgeschnitten. `--max-tokens 100000` oder den Ausgabevertrag in `prompt.md` kürzen |
| `Das Modell hat abgelehnt` | Sicherheitsablehnung. Bei Standardläufen springt serverseitig ein Ausweichmodell ein (`--no-fallbacks` schaltet das ab); bei Batch gibt es das nicht |
| Batch hängt | Abbrechen ist gefahrlos. Wieder aufnehmen mit `run_fable.py --batch-id <id>` |

`--rehearsal` fährt dieselbe Strecke mit Haiku 4.5 und gekürztem Bündel für
Cent-Beträge. Es beweist Auth, Parameter, Antwort-Zerlegung und Schreibpfade —
dass die **volle** Nutzlast wohlgeformt ist und passt, beweist `price.py` vorher
kostenlos.
