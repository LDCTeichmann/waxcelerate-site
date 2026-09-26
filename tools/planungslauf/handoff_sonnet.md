# Anschluss: aus einer Task-Index-Zeile einen ausführbaren Auftrag machen

Der Planungslauf liefert in **T10** eine Tabelle mit 30 bis 60 einzeiligen Aufgaben. Diese
Zeilen sind bewusst knapp — das war Kostensteuerung. Die ausführlichen
Aufgabenbriefe schreibt danach **Sonnet 5 über Claude Pro** oder **Codex mit
GPT-5.6 Sol** — beides aus laufenden Abos, ohne Zusatzkosten.

Reihenfolge: erst T9 lesen (die eine Reihenfolge), dann die dort zuerst genannten
T10-Zeilen einzeln durch die Vorlage unten schicken. Nicht alle 60 auf einmal —
die Reihenfolge existiert, weil Aufgaben voneinander abhängen.

---

## Vorlage · ein Auftrag aus einer Zeile

> Du schreibst einen ausführbaren Arbeitsauftrag für den Waxcelerate Hub
> (`waxcelerate-sync`, Branch `feat/porto-labels`). Ein anderer Agent wird ihn
> ohne weitere Rückfragen abarbeiten.
>
> **Die Aufgabe** (eine Zeile aus dem Task-Index eines Planungslaufs):
>
> ```
> <HIER DIE T10-ZEILE EINFÜGEN>
> ```
>
> **Der Zusammenhang** (aus T9 und dem passenden Teil des Plans):
>
> ```
> <HIER DIE 5–15 ZEILEN AUS T3/T4/T5/T6/T7/T8 EINFÜGEN, DIE DIESE AUFGABE BEGRÜNDEN>
> ```
>
> Lies die in der Zeile genannten Dateien im Repo, **bevor** du den Auftrag
> schreibst. Prüfe jede Zeilennummer und jeden Funktionsnamen aus dem Plan gegen
> den echten Code. **Stimmt etwas nicht, schreib das an den Anfang des Auftrags
> statt es stillschweigend zu korrigieren** — dann hat sich seit dem Planungslauf
> etwas geändert, und das muss geklärt werden.
>
> Liefere genau diese Abschnitte:
>
> 1. **Ziel** — ein Satz. Was ist danach anders?
> 2. **Geltungsbereich** — welche Dateien darf der Agent ändern, welche nicht.
>    Namentlich, keine Muster.
> 3. **Ist-Zustand** — was der Code heute tut, mit `datei.py:zeile` und
>    Funktionsnamen, aus dem Code gelesen, nicht aus dem Plan übernommen.
> 4. **Soll-Zustand** — das neue Verhalten, so scharf, dass nicht improvisiert
>    werden muss.
> 5. **Schritte** — nummeriert, je Schritt eine Datei.
> 6. **Tests** — welche bestehenden Tests weiter laufen müssen und welcher neue
>    Test das neue Verhalten beweist, mit Dateiname und Testnamen.
> 7. **Gegenprobe** — die Befehle, mit denen der Erfolg belegt wird.
> 8. **Abbruchbedingungen** — woran der Agent erkennt, dass er aufhören und
>    melden muss.
>
> **Hausregeln, die in jeden Auftrag müssen:**
>
> - Python 3.9, **nur Standardbibliothek**. Keine pip-Pakete. Ausnahme ist allein
>   `reportlab` in `billing_pdf.py`.
> - Kein Build-Schritt. Nach `server.py` Server neu starten
>   (`launchctl kickstart -k "gui/$(id -u)/com.waxcelerate.server"`), nach
>   `dashboard.html` nur den Browser neu laden.
> - **`data/` ist tabu.** Tests laufen gegen Fixtures unter `tests/`.
>   `finance.db` und `billing.db` werden in Code-Aufträgen nicht angefasst.
> - Mehrere Sitzungen teilen denselben Arbeitsordner: **nur eigene Dateien
>   einzeln committen** (`git add pfad/datei.py`), **niemals `git add -A`**, und
>   keine zerstörerischen Git-Befehle (`reset --hard`, `checkout --`, `clean`,
>   `stash`).
> - **Trifft eine Annahme nicht zu: STOPP und melden.** Nicht improvisieren.
> - Eine `0` ist ein Wert, kein „keine Daten". Bei Geldbeträgen immer mit
>   `is not None` prüfen — `if x:` hat hier über Monate echte Zahlen verfälscht.
> - Alles Sichtbare ist deutsch. Auf Kleinanzeigen „Du", auf eBay „Sie".
> - Kein repo-weites Suchen. Die relevanten Stellen stehen im Auftrag.
>
> Abschluss: `python3 -m unittest discover -s tests -q` und
> `python3 checks.py --no-persist`. Nie `GET /finance/summary` als Smoke-Test —
> die Route schreibt.

---

## Welches Modell bekommt welchen Auftrag

Der Plan trägt in T10 je Zeile eine Modell-Zuordnung und ein `Review nötig?`-Feld
ein. Halte dich daran; die Begründung steht in den Zuordnungs-Kriterien (Streuradius,
Spezifikationsschärfe, Prüfbarkeit, Umkehrbarkeit).

Zwei Regeln stehen darüber, unabhängig von der Zuordnung im Plan:

- **Alles, was `finance.db`, `billing.db`, Nummernkreise, Buchungslogik oder
  Steuerzahlen berührt, geht an ein starkes Modell — Claude Sonnet 5/Opus 5 oder
  GPT-6 Astra — nie an eines, dem du weniger vertraust.** Ein falsch gebuchter Euro ist teurer als die gesparte Zeit.
- **Der Merge der 69 Commits ist kein Agentenauftrag**, solange T2 nicht
  entschieden und von dir freigegeben ist.

Wenn du einen Auftrag an Grok 4.6, Composer 2 oder Gemini gibst, lass ihn danach
von Sonnet 5 gegen den Auftrag prüfen — ein Review kostet dich über Pro nichts und
fängt genau die Improvisation ab, die bei knappen Spezifikationen entsteht.

---

## Wenn der Plan Lücken hat

T12 enthält höchstens zehn Fragen an dich, jede mit Vorschlagswert. Beantworte sie
**bevor** du Aufträge verteilst — ein Agent, der auf eine deiner Entscheidungen
wartet, blockiert den Arbeitsordner.

Reicht der Plan an einer Stelle nicht, ist ein zweiter Astra-Lauf oft nicht
nötig: Sonnet 5 kann einen einzelnen Teil (etwa T5 oder T6) mit dem Plan
als Vorgabe vertiefen. Ein zweiter Astra-Lauf lohnt nur, wenn die **Architektur-
entscheidung** selbst strittig ist — dann eine neue Codex-Aufgabe mit
`CODEX_PLAN.md` und deiner Kritik im Auftrag.
