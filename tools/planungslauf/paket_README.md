# `.codex-plan/` — Lesestoff für den Planungslauf

Erzeugt am 23.09.2026 aus `feat/porto-labels` von
`waxcelerate-site/tools/fable-planer/build_kontext.py`.

- **`PROMPTS.md`** — die zwei Nachrichten zum Einfügen (Start und Fortsetzung).
- **`PLANUNGSAUFTRAG.md`** — der Auftrag. Bewusst *nicht* `AUFTRAG.md`: so heisst
  schon ein altes, unbeteiligtes Dokument im Wurzelverzeichnis. In Codex als **eine** Nachricht einfügen.
- **`kontext/00_LESEKARTE.md`** — die Lesereihenfolge, vier Dateien.
- **`kontext/teil_d.md`** — generiert: Dateibaum · komplettes DB-Schema
  (77 DDL-Anweisungen) · Routentabelle · Test-Landkarte · die 69 ungemergten
  Commits · Rechtslage als Randbedingung · **UI-Landkarte** (`dashboard.html`:
  13 Abschnitte, 495 JS-Funktionen, 118 Endpunkte) · **Code-Landkarte**
  (922 Definitionen aus 52 Modulen, je mit Zeilennummer).
- **`kontext/0*_baustein.txt`** — alle Planungs- und Orientierungsdokumente,
  inklusive der Geschäftszahlen aus `waxcelerate-masterplan` (das liegt in einem
  anderen Repo und wäre in Codex sonst unsichtbar).

Zusammen ~173.000 Token. Der **Quelltext ist absichtlich nicht eingebettet** —
er liegt im Repo, und die beiden Landkarten sagen mit Zeilennummern, wo was
steht. Das hält den Einstieg unter der 272k-Schwelle, ab der eine Anfrage
doppelt zählt.

Ergebnis des Laufs: `CODEX_PLAN.md` im Wurzelverzeichnis, fortlaufend
geschrieben.

**Dieser Ordner ist Wegwerf-Material.** Er kann nach dem Lauf gelöscht werden;
`build_kontext.py` erzeugt ihn jederzeit neu.
