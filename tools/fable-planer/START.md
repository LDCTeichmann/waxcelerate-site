# Start — der Fable-Lauf in acht Schritten

Auf deinem Mac, im Hub-Ordner. Zeitkritisch: **das Promo-Guthaben verfällt am 19.09.2026.**

---

## Schritt 1–2 · Die zwei Sperren lösen (sonst stirbt der Lauf mittendrin)

Auf **claude.ai → Einstellungen → Nutzung**:

1. **Usage credits einschalten.** Der Schalter „Turn on usage credits to keep using
   Claude if you hit a plan limit" steht bei dir auf **aus**. Solange er aus ist,
   bleibt Fable 5.1 im Modell-Wähler ausgegraut.

2. **Monatsdeckel anheben.** Bei „Monthly spend limit" steht **18,53 € von 22 €**
   verbraucht — also nur **3,47 € Spielraum**. Dein Guthaben ist zwar 18,29 €, aber
   der Deckel lässt dich davon diesen Monat nur 3,47 € ausgeben. Über „Manage" auf
   **mindestens 40 €** setzen. Ohne diesen Schritt bricht der Lauf nach etwa einem
   Drittel ab.

> Warum das so ist: deine 18,29 € sind **claude.ai Usage Credits**. Die gelten für
> Claude Code und die Claude-Apps — **nicht** für die Developer-Platform-API. Das
> sind zwei getrennte Geldtöpfe. Fable 5.1 läuft auf dem Pro-Plan immer gegen
> Credits, nie gegen dein Wochenlimit; dass das Wochenlimit zu 93 % voll ist,
> blockiert den Lauf also nicht.

---

## Schritt 3–5 · Vorbereiten

```bash
cd ~/Developer\ Luca/waxcelerate/waxcelerate-sync

# 3 · Auf den echten Stand. main ist fünf Wochen alt.
git fetch origin feat/porto-labels
git checkout feat/porto-labels

# 4 · Prüfen, dass der Masterplan als Nachbarordner liegt
ls ../waxcelerate-masterplan >/dev/null && echo "Masterplan da" || echo "FEHLT"

# 5 · Lesestoff bauen — kostet nichts, braucht keinen Key
python3 tools/fable-planer/build_kontext.py
```

Falls der Werkzeugkasten noch nicht in diesem Repo liegt: er kommt aus
`waxcelerate-site`, Ordner `tools/fable-planer/`. Einfach herüberkopieren — die
Skripte nehmen auch `--hub <pfad>`.

Schritt 5 muss enden mit „Alle 82 Manifest-Dateien sind in den Bausteinen
enthalten." Meldet es `NICHT GEFUNDEN` oder `GEHEIMNIS-VERDACHT`: **anhalten** und
erst klären. Bei `GEHEIMNIS-VERDACHT` wird bewusst nichts geschrieben.

---

## Schritt 6–7 · Laufen lassen

```bash
claude --model "fable[1m]" --effort xhigh
```

Dann den **kompletten Inhalt von `tools/fable-planer/auftrag.md`** als eine
Nachricht einfügen. Claude Code zeigt einen Einwilligungsdialog, bevor der erste
Fable-Aufruf gegen Guthaben bucht — bestätigen. Der Dialog wartet 5 Minuten.

Fable liest dann 15 vorbereitete Dateien und schreibt `FABLE_PLAN.md`.

**Zwischenkontrolle:** wenn die 15 Lesevorgänge durch sind, einmal `/cost`.
Erwartung an dieser Stelle rund **6–7 $**. Steht dort mehr als **8 $**, mit
`/effort high` weitermachen statt zu hoffen — das kostet Tiefe, aber kein
abgebrochenes Dokument.

---

## Schritt 8 · Sichern, bevor die Sitzung endet

```bash
git add FABLE_PLAN.md
git commit -m "Fable-5.1-Planungslauf: Schiedsspruch, Zielarchitektur, Task-Index"
```

Danach: `T12` beantworten → `T9` lesen → die ersten `T10`-Zeilen einzeln durch
`handoff_sonnet.md` an Sonnet 5 geben. Das kostet über Claude Pro nichts mehr.

---

## Was der Lauf kosten soll

| Posten | Menge | Kosten |
|---|---|---|
| Kontext einlesen (15 Lesevorgänge) | ~493k Token | ~4,95 $ |
| Cache-Lesen über die Lese-Turns | ~2 Mio Token | ~0,50 $ |
| Ausgabe Text (~11.000 Wörter) | ~18k Token | ~0,90 $ |
| Ausgabe Thinking (`xhigh`) | ~55k Token | ~2,75 $ |
| **Summe** | | **~9,10 $** |

Fable 5.1: 10 $/MTok Input, 50 $/MTok Output, Cache-Lesen 0,25 $/MTok. Thinking ist
immer an und zählt als Output — das ist der Treiber, nicht der große Input. Einen
Batch-Rabatt gibt es in Claude Code nicht.

Die Thinking-Zahl ist geschätzt. `/cost` zeigt die Wahrheit.

---

## Wenn etwas klemmt

| Symptom | Ursache und Weg |
|---|---|
| Fable im `/model`-Wähler ausgegraut | Usage credits nicht eingeschaltet (Schritt 1) |
| Lauf bricht mit Limit-Meldung ab | Monatsdeckel (Schritt 2). Anheben, dann `claude --continue` |
| `Ref 'feat/porto-labels' existiert nicht` | `git fetch --depth=200 origin feat/porto-labels` |
| `NICHT GEFUNDEN` beim Bauen | Datei wurde verschoben. Pfad in `manifest.json` korrigieren — nicht ignorieren, sonst plant Fable ohne sie |
| `GEHEIMNIS-VERDACHT` | Es wird nichts geschrieben. Betroffene Datei aus `manifest.json` nehmen oder das Geheimnis aus dem Repo räumen |
| Sitzung komprimiert automatisch | Sollte bei ~550k Token nicht passieren (Schwelle ~967k). Falls doch: `/autocompact 900k` |
| Fable liest von sich aus im Repo herum | Einmal erinnern: nur die 15 Dateien aus der Lesekarte, `dashboard.html` nur per gezieltem `grep` |
| `FABLE_PLAN.md` wirkt abgeschnitten | Fable weiterschreiben lassen („mach bei T*N* weiter"), nicht neu starten |
