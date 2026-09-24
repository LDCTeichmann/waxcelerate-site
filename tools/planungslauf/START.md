# Start — Planungslauf mit GPT-6 Astra in Codex

**Alles ist vorbereitet.** Du fügst genau einen Block in Codex ein, sonst nichts.
Kein Terminal, kein Branch-Wechsel, kein Worktree.

---

## Einstellungen

| | |
|---|---|
| Projekt | dein vorhandenes `waxcelerate-sync` (lokaler Ordner ist richtig) |
| Modell | **GPT-6 Astra** |
| Reasoning | **Extra High** |

Der Branch ist **egal** — die Start-Nachricht holt sich das Paket selbst, ohne
deinen Arbeitsbaum anzufassen.

---

## Die Start-Nachricht

```
Arbeite die folgenden vier Schritte der Reihe nach ab.

1) Hol das Planungspaket. Das wechselt NICHT den Branch und ändert nichts an
   meiner Arbeit:
     git fetch origin codex/planungskontext
     git archive FETCH_HEAD .codex-plan | tar -x

2) Nimm das Ergebnis aus der Versionsverwaltung heraus, damit mein Arbeitsbaum
   sauber bleibt:
     printf '.codex-plan/\nCODEX_PLAN.md\n' >> "$(git rev-parse --absolute-git-dir)/info/exclude"

3) Prüfe, dass .codex-plan/kontext/00_LESEKARTE.md jetzt existiert. Wenn nicht:
   brich ab und sag mir warum. Lies in dem Fall NICHT ersatzweise die AUFTRAG.md
   im Wurzelverzeichnis — das ist ein altes, unbeteiligtes Dokument.

4) Lies .codex-plan/PLANUNGSAUFTRAG.md vollständig und führe ihn aus.

Wichtig für den ganzen Lauf: kein git checkout, kein commit, kein push, kein
stash. In diesem Ordner arbeiten mehrere Sitzungen parallel. Du schreibst genau
eine neue Datei: CODEX_PLAN.md — und zwar fortlaufend, Teil für Teil, nicht erst
am Ende.
```

Dieselben zwei Nachrichten liegen nach Schritt 1 auch im Repo unter
`.codex-plan/PROMPTS.md`.

---

## Wenn das Zeitfenster ausläuft

Auf Plus ist das Kontingent ein Fenster von rund fünf Stunden. Läuft es aus,
**geht nichts verloren** — der Plan steht bis dahin auf der Platte. Neuer Chat,
gleiches Projekt, gleiches Modell:

```
In diesem Ordner liegt eine angefangene CODEX_PLAN.md und der Auftrag unter
.codex-plan/PLANUNGSAUFTRAG.md.

Lies beide. Am Ende von CODEX_PLAN.md steht eine Marke der Form
<!-- naechster Teil: T4 -->. Mach genau dort weiter und häng die fehlenden Teile
an. Fang nicht von vorn an und schreib nichts neu, was schon dasteht.

Gleiche Regeln wie vorher: kein checkout/commit/push/stash, nur CODEX_PLAN.md
wird geschrieben, fortlaufend Teil für Teil.
```

---

## Warum das so gebaut ist

**Kein Branch-Wechsel.** `git archive FETCH_HEAD .codex-plan | tar -x` legt den
Ordner in den Arbeitsbaum, ohne den Branch zu wechseln und ohne eine bestehende
Datei zu berühren. Im Hub arbeiten mehrere Sitzungen im selben Ordner — dort
gilt ein ausdrückliches Verbot für `checkout` und `stash`. Ein Worktree wäre
möglich, ist aber unnötig.

**`FETCH_HEAD`, nicht `origin/codex/planungskontext`.** Ein `git fetch origin
<branch>` legt je nach Klon keine Remote-Tracking-Ref an; `FETCH_HEAD` ist immer
gesetzt. Gegen einen frischen Klon getestet.

**Die Datei heißt `PLANUNGSAUFTRAG.md`, nicht `AUFTRAG.md`.** Im Wurzelverzeichnis
liegt schon eine `AUFTRAG.md` — der Cursor-Auftrag C0–C3 vom 14.07.2026. Beim
ersten Versuch hat Codex die gefunden und zu Recht nachgefragt. Jetzt kann nichts
mehr verwechselt werden, und der Auftrag beginnt mit einer Selbstprüfung, die
beim falschen Branch abbricht statt die falsche Datei zu lesen.

**Der Quelltext ist nicht vorgeladen.** Codex ist ein Agent im Repo und liest
gezielt nach. Vorgeladen wird nur, was er nicht billig herleiten kann:

| Teil | Inhalt | ~Token |
|---|---|---|
| Dokumente | die fünf Planungsebenen, Regelwerk, Steuer-Playbook, Geschäftszahlen aus dem Masterplan-Repo | 113k |
| Teil D | Dateibaum · DB-Schema (77 DDL-Anweisungen) · Routentabelle · Test-Landkarte · die 69 ungemergten Commits · Rechtslage · UI-Landkarte · Code-Landkarte | 60k |

**~173.000 Token in vier Lesevorgängen.** Zwei Landkarten mit Zeilennummern
ersetzen den Quelltext: **Code** (957 Definitionen aus 52 Modulen, gemessen
323.143 → 12.903 Token) und **Oberfläche** (`dashboard.html`, 13 Abschnitte,
495 JS-Funktionen, 118 Endpunkte, gemessen 164.141 → 5.024 Token).

Damit bleibt der Einstieg unter **272.000 Token** — darüber zählt bei den
GPT-Modellen die *gesamte* Anfrage doppelt.

**Damit trotzdem tief gearbeitet wird**, enthält der Auftrag eine
**Pflichtlektüre-Tabelle**: welche Dateien vor welchem Ausgabeteil wirklich
geöffnet sein müssen (`billing*` vor T4/T6, `gmail_kreis.py` vor T7, `echo.py`
und `followup.py` vor T8, `checks.py` und die Views vor T5). Dazu die Regel: jede
Behauptung über Code trägt `datei:zeile`, sonst gilt sie als „nicht geprüft".

---

## Danach

Codex schreibt `CODEX_PLAN.md` — 13 Teile: `T0` Urteil · `T1` Ist-Abgleich und
Widersprüche · `T2` Merge-Entscheidung · `T3` Zielarchitektur · `T4`
Feature-Lücke gegen Kaufsoftware · `T5` Kennzahlen · `T6` Bestell- und
Rechnungsfluss · `T7` Beleg-Pipeline aus dem Postfach · `T8` KI-Antworten ·
`T9` die eine Reihenfolge · `T10` Task-Index · `T11` was nicht empfohlen wird ·
`T12` höchstens zehn Fragen an dich.

Reihenfolge danach: `T12` beantworten → `T9` lesen → die ersten `T10`-Zeilen
einzeln über `handoff_sonnet.md` an Sonnet 5 oder zurück an Codex.

Aufräumen: `rm -rf .codex-plan` — Wegwerf-Material, jederzeit über `los.sh` neu
erzeugbar. `CODEX_PLAN.md` behältst du.

---

## Wenn etwas klemmt

| Symptom | Weg |
|---|---|
| „`.codex-plan/AUFTRAG.md` ist nicht vorhanden" | Alter Stand. Die Datei heißt jetzt `PLANUNGSAUFTRAG.md`; nimm die Start-Nachricht von oben |
| `git fetch` / `git archive` scheitert | Einmal selbst im Terminal ausführen (beide Zeilen aus Schritt 1), dann die Nachricht ohne Schritt 1 senden |
| Codex liest im Repo herum | Einmal erinnern: *„nur die vier Dateien aus der Lesekarte; Quelltext nur gezielt per grep/sed, und nur die Pflichtlektüre"* |
| Fenster ausgeschöpft | Fortsetzungs-Nachricht oben. Nichts geht verloren |
| `CODEX_PLAN.md` wirkt abgeschnitten | Weiterschreiben lassen, nicht neu starten |
| Paket veraltet (Hub hat sich bewegt) | `bash los.sh` — baut neu und aktualisiert den Branch |

---

## Der Lauf ist erledigt (24.09.2026)

Dieses Werkzeug hat seine Arbeit getan. Der Planungslauf ist gelaufen, ausgeführt
von GPT-6 Astra (Extra High) in Codex, und hat ein vollständiges Ergebnis geliefert.

**Wo es liegt:** im privaten Hub-Repo, nicht hier. Branch `plan/umsetzung`:

- `CODEX_PLAN.md` — das Planungsergebnis
- `docs/planung/00_UEBERGABE_OPUS.md` — **der Einstieg**, wenn du dort weiterarbeitest
- `docs/planung/LAUFBUCH.md` — der laufende Stand der Umsetzung

**Du brauchst diesen Ordner also nur noch**, wenn ein *neuer* Planungslauf ansteht —
etwa weil der Hub sich so weit bewegt hat, dass das Ergebnis nicht mehr passt. Dann
`bash los.sh` und von oben. Für die Abarbeitung des vorhandenen Plans nimmst du
stattdessen die Übergabe im Hub-Repo.
