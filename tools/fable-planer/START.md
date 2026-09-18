# Start — ein Befehl, dann einfügen, fertig

Zeitfenster: **das Promo-Guthaben verfällt am 19.09.2026.** Anthropic setzt bei
vergleichbaren Promos 23:59 PT des genannten Tages an — das wäre 08:59 Berliner
Zeit am 20.09. Du hast also sehr wahrscheinlich den ganzen 19. Verlass dich nicht
auf die letzten Stunden; mach es tagsüber.

---

## Einmal vorher: der Monatsdeckel

Auf **claude.ai → Einstellungen → Nutzung**:

- Usage credits **EIN** ✅ (hast du erledigt)
- **„Monthly spend limit" über „Manage" auf mindestens 40 €.** Er steht auf 22 €,
  davon sind 18,53 € verbraucht — es blieben also nur **3,47 €** Spielraum. Dein
  Guthaben von 18,29 € nützt dir nichts, solange der Deckel es nicht durchlässt.
  **Ohne diesen Schritt bricht der Lauf nach etwa einem Drittel ab.**

Das ist die einzige Einstellung, die noch fehlt.

---

## Weg A · Auf deinem Mac (einfachster Weg)

```bash
bash /pfad/zu/waxcelerate-site/tools/fable-planer/los.sh
```

Mehr nicht. Das Skript sucht beide Repos selbst, holt `feat/porto-labels`
(**ohne** `checkout` — dein Arbeitsbaum bleibt unangetastet), prüft alles, baut
den Lesestoff nach `<hub>/.fable/` und druckt am Ende die zwei Zeilen, die du
dann tippst.

Findet es die Repos nicht, sagt es dir das und du hilfst nach:

```bash
HUB=~/Developer\ Luca/waxcelerate/waxcelerate-sync \
MASTERPLAN=~/pfad/zu/waxcelerate-masterplan \
bash /pfad/zu/tools/fable-planer/los.sh
```

Danach:

```bash
cd <dein waxcelerate-sync>
pbcopy < .fable/AUFTRAG.md          # legt den Auftrag in die Zwischenablage
claude --model "fable[1m]" --effort xhigh
```

Einfügen (⌘V), abschicken, den Einwilligungsdialog bestätigen. Fable liest
15 vorbereitete Dateien und schreibt `FABLE_PLAN.md`.

---

## Weg B · In einer Claude-Code-Cloud-Sitzung

Geht auch. Ein Schritt mehr, weil beide Hub-Repos privat sind.

1. Neue Cloud-Sitzung öffnen, Modell erst mal auf **Sonnet** lassen (das läuft
   über dein Abo und kostet kein Guthaben).
2. Als erste Nachricht:

   > Häng bitte `LDCTeichmann/waxcelerate-sync` und
   > `LDCTeichmann/waxcelerate-masterplan` an diese Session an und klone beide.
   > Klone dann `LDCTeichmann/waxcelerate-site` mit Branch
   > `claude/nice-bohr-6lhikb` und führe aus:
   > `HUB=<pfad-zu-sync> MASTERPLAN=<pfad-zu-masterplan> bash <site>/tools/fable-planer/los.sh`
   > Zeig mir danach die letzten 20 Zeilen der Ausgabe.

3. Erst wenn das sauber durchgelaufen ist: `/model fable[1m]` und `/effort xhigh`.
4. Inhalt von `<hub>/.fable/AUFTRAG.md` als eine Nachricht einfügen.

**Wichtig:** die Vorbereitung auf Sonnet erledigen, nicht auf Fable — Aufräum-
und Klon-Schritte auf Fable-Preisen sind rausgeworfenes Geld. Und: `FABLE_PLAN.md`
am Ende committen und pushen, sonst stirbt das Ergebnis mit dem Container.

---

## Während es läuft

Nach den 15 Lesevorgängen einmal **`/cost`**. Erwartung an dieser Stelle rund
**6–7 $**.

| `/cost` zeigt | Was tun |
|---|---|
| bis 7 $ | weiterlaufen lassen |
| 7–8 $ | weiterlaufen lassen, aber im Auge behalten |
| über 8 $ | `/effort high` — kostet Tiefe, aber kein abgebrochenes Dokument |

Fable soll **nichts am Code ändern**; es liest und schreibt genau eine neue Datei.
Fängt es an, im Repo herumzulesen, einmal erinnern: *„nur die 15 Dateien aus der
Lesekarte."*

---

## Danach

```bash
git add FABLE_PLAN.md
git commit -m "Fable-5.1-Planungslauf: Schiedsspruch, Zielarchitektur, Task-Index"
```

Dann: `T12` beantworten → `T9` lesen → die ersten `T10`-Zeilen einzeln durch
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

Thinking ist bei Fable immer an und zählt als Output ($50/MTok) — das ist der
Treiber, nicht der große Input ($10/MTok). Einen Batch-Rabatt gibt es in Claude
Code nicht. Die Thinking-Zahl ist geschätzt; `/cost` zeigt die Wahrheit.

---

## Wenn etwas klemmt

| Symptom | Weg |
|---|---|
| Fable im `/model`-Wähler ausgegraut | Usage credits nicht eingeschaltet |
| Lauf bricht mit Limit-Meldung ab | Monatsdeckel. Anheben, dann `claude --continue` |
| `Hub nicht gefunden` | `HUB=/pfad bash los.sh` |
| `Masterplan NICHT GEFUNDEN` | `MASTERPLAN=/pfad bash los.sh`, oder das Repo klonen. Das Skript bricht hier **absichtlich** ab: darin steckt die Geschäftsdiagnose, an der Fable jedes Feature misst |
| `NICHT GEFUNDEN` beim Prüfen | Datei wurde verschoben. Pfad in `manifest.json` korrigieren — nicht ignorieren, sonst plant Fable ohne sie |
| `GEHEIMNIS-VERDACHT` | Es wird nichts geschrieben. Betroffene Datei aus `manifest.json` nehmen oder das Geheimnis aus dem Repo räumen |
| Sitzung komprimiert automatisch | Sollte bei ~550k Token nicht passieren (Schwelle ~967k). Falls doch: `/autocompact 900k` |
| `FABLE_PLAN.md` wirkt abgeschnitten | Weiterschreiben lassen („mach bei T*N* weiter"), nicht neu starten |
