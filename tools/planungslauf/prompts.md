# Die zwei Nachrichten für Codex

Modell **GPT-6 Astra**, Reasoning **Extra High**. Sonst nichts einstellen.

---

## 1 · Start — das hier komplett einfügen

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

---

## 2 · Fortsetzung — wenn das Zeitfenster ausgelaufen ist

Neuer Chat, gleiches Projekt, gleiches Modell. Es geht **nichts** verloren:

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

## Wenn Schritt 1 scheitert

Meldet Codex, dass `git fetch` oder `git archive` nicht geht (kein Netz, keine
Berechtigung), dann einmal selbst im Terminal:

```bash
cd <dein waxcelerate-sync>
git fetch origin codex/planungskontext
git archive FETCH_HEAD .codex-plan | tar -x
```

Danach die Start-Nachricht ohne Schritt 1 senden.

## Aufräumen, wenn alles fertig ist

```bash
rm -rf .codex-plan          # Wegwerf-Material, jederzeit neu erzeugbar
```

`CODEX_PLAN.md` behältst du natürlich.
