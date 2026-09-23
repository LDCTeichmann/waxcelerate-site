# Start — Planungslauf mit GPT-6 Astra in Codex

**Alles ist vorbereitet.** Der Lesestoff liegt fertig im privaten Hub-Repo, auf
dem Branch `codex/planungskontext`. Du musst kein Terminal anfassen.

---

## Weg A · Codex in der ChatGPT-App (für dich empfohlen)

### Einmalig

1. In der ChatGPT-App **Codex** einschalten.
2. **GitHub verbinden**, falls noch nicht geschehen, und dabei
   `LDCTeichmann/waxcelerate-sync` freigeben. Das Repo ist privat — das ist
   Absicht und der Grund, warum der Lesestoff dort liegt und nicht im
   öffentlichen Website-Repo.

### Der Lauf

3. Neue Codex-Aufgabe. Repo `waxcelerate-sync`, **Branch
   `codex/planungskontext`** wählen — nicht `main`, das ist sechs Wochen alt.
4. **Modell `GPT-6 Astra`**, Reasoning auf die **höchste verfügbare Stufe**
   (`xhigh`, sonst `high`).
5. Als Nachricht genau das hier:

   > Lies `.codex-plan/AUFTRAG.md` vollständig und führe ihn aus.

   Mehr nicht. Der Auftrag steht im Repo und sagt Codex alles Weitere — welche
   vier Dateien in welcher Reihenfolge, wie nachgelesen wird, und wie das
   Ergebnis geschrieben werden soll.
6. Codex liest ~173.000 Token vorbereiteten Kontext und schreibt
   **`CODEX_PLAN.md`** — **fortlaufend, Teil für Teil.**

### Wenn das Zeitfenster ausläuft

Auf Plus ist das Kontingent ein Fenster von rund fünf Stunden. Läuft es aus,
**ist nichts verloren** — der Plan steht bis dahin auf der Platte. Neue Aufgabe,
gleicher Branch, diese Nachricht:

> Lies `.codex-plan/AUFTRAG.md` und das vorhandene `CODEX_PLAN.md`. Mach genau
> bei dem Teil weiter, der unten als nächster markiert ist. Fang nicht von vorn an.

Der Auftrag lässt Codex nach jedem Teil eine Marke `<!-- naechster Teil: T4 -->`
setzen, damit das ohne Suchen geht.

### Danach

Codex committet `CODEX_PLAN.md` auf den Branch. Du liest `T12` (höchstens zehn
Fragen an dich), beantwortest sie, liest dann `T9` (die eine Reihenfolge) und
gibst die ersten `T10`-Zeilen einzeln über `handoff_sonnet.md` an Sonnet 5 oder
zurück an Codex.

---

## Weg B · Codex CLI auf dem Mac

Falls du es doch lokal willst — es ist weniger Aufwand, als du denkst, und es
sieht aus wie Claude Code:

```bash
npm install -g @openai/codex     # Astra braucht >= 0.153.0
cd ~/Developer\ Luca/waxcelerate/waxcelerate-sync
git fetch origin codex/planungskontext
git checkout codex/planungskontext
codex                            # beim ersten Start mit ChatGPT-Konto anmelden
```

Einstellungen dauerhaft in `~/.codex/config.toml`:

```toml
model = "gpt-6-astra"
model_reasoning_effort = "xhigh"

[profiles.gruendlich]
model = "gpt-6-astra"
model_reasoning_effort = "max"
```

Dann `codex -p gruendlich` für den tiefsten Modus. Im laufenden Chat wechselst
du mit `/model`.

Danach dieselbe Nachricht wie oben.

**Lohnt sich das für dich?** Für diesen einen Lauf nicht — die App reicht. Für
später schon: der CLI sieht deinen Arbeitsbaum ohne Umweg über GitHub, was bei
Code-Änderungen der angenehmere Weg ist.

---

## Was Codex bekommt — und was bewusst nicht

| Teil | Inhalt | ~Token |
|---|---|---|
| Dokumente | alle fünf Planungsebenen, Regelwerk, Steuer-Playbook, Geschäftszahlen aus dem Masterplan-Repo | 113k |
| Teil D | Dateibaum · komplettes DB-Schema (77 DDL-Anweisungen) · Routentabelle · Test-Landkarte · die 69 ungemergten Commits · Rechtslage · **UI-Landkarte** · **Code-Landkarte** | 60k |

**Der Quelltext ist absichtlich nicht eingebettet.** Statt dessen zwei
Landkarten mit Zeilennummern:

- **Code-Landkarte:** 957 Definitionen aus 52 Modulen — gemessen
  **323.143 → 12.903 Token**
- **UI-Landkarte:** `dashboard.html`, 13 Abschnitte, 495 JS-Funktionen,
  118 Endpunkte — gemessen **164.141 → 5.024 Token**

Codex hat das ganze Repo vor sich und liest gezielt die Stelle nach, die eine
Frage beantwortet. Das ist nicht nur billiger, es ist auch besser: ein Agent,
der gezielt nachschlägt, verliert weniger als einer, der 500.000 Token
überflogen hat.

Nebeneffekt: der Einstieg bleibt unter **272.000 Token**. Darüber zählt bei den
GPT-Modellen die *gesamte* Anfrage doppelt.

---

## Warum nicht mehr Claude Fable 5.1

Das Guthaben dafür ist am 18./19.09. verfallen, bevor es eingesetzt werden
konnte. „Expires Sep 19" hieß **ab** dem 19., nicht bis zu dessen Ende. Die
Lehre für nächstes Mal: ablaufendes Guthaben sofort ausgeben, nie auf den
letzten Tag planen.

Inhaltlich ändert das wenig — der Auftrag `T0`–`T12` ist derselbe, nur der
Ausführende und der Zuschnitt des Kontexts sind neu.

---

## Wenn etwas klemmt

| Symptom | Weg |
|---|---|
| Astra nicht im Modell-Wähler | Codex-Zugang prüfen; im CLI braucht Astra Version ≥ 0.153.0 |
| Codex sieht `.codex-plan/` nicht | Falscher Branch. Es muss `codex/planungskontext` sein, nicht `main` |
| Codex fängt an, im Repo herumzulesen | Einmal erinnern: *„nur die vier Dateien aus der Lesekarte, Quelltext nur gezielt per grep/sed"* |
| Fenster ausgeschöpft | Neue Aufgabe mit der Fortsetzungs-Nachricht oben. Nichts geht verloren |
| `CODEX_PLAN.md` wirkt abgeschnitten | Weiterschreiben lassen, nicht neu starten |
| Paket veraltet (Hub hat sich bewegt) | `bash los.sh` neu laufen lassen und den Branch neu bauen — siehe `README.md` |
