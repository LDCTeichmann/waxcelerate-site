# Drei unfertige SciencePage-Experimente, 2. Juni 2026

Diese Patches sind alles, was von drei verwaisten Arbeitskopien übrig ist, die
bis August 2026 unter `.claude/worktrees/agent-*` lagen und dort zusammen 219 MB
belegt haben.

**Warum sie überhaupt gerettet wurden:** die Arbeitskopien waren aus Git
herausgefallen (ihre `.git`-Dateien zeigten auf Registry-Einträge, die es nicht
mehr gab). Die zugehörigen Branches `worktree-agent-*` waren null Commits vor
`main`, also schien zunächst alles enthalten. Der Vergleich Arbeitskopie gegen
eigenen Branch-Stand zeigte aber je genau eine ungespeicherte Datei:
`src/pages/SciencePage.tsx`. Das hier ist echte Arbeit, die nirgends committet war.

## Was drin steht

| Patch | Inhalt |
|---|---|
| `agent-a03988f45777147bf` | `TempBandViz` und weitere Mini-SVGs für `StatCallout` — Temperaturband 52–70 °C mit hervorgehobenem Waxcelerate-Fenster 58–60 °C, hell/dunkel getrennt eingefärbt |
| `agent-a11f0960b7b733025` | Kristallgitter als **Split-Panel**: links geordnete Lamellen (Waxcelerate, enges Fenster), rechts unregelmäßig (Generisches Paraffin). Dazu mehr Schwebepartikel und höhere Deckkraft |
| `agent-a9f6fd0eb9ff4f8d4` | Touch-Bedienung für die Viz-Karten: `(hover: none)` erkannt, Tap schaltet den Hover-Zustand für 2,2 s, plus `pulse-gap`-Keyframes |

## Anwenden

Die Patches sind gegen den Stand vom 2. Juni 2026 gebaut, inzwischen liegen über
200 Commits dazwischen. `git apply` wird **nicht** sauber durchlaufen.
Sie sind als Ideenspeicher gedacht, nicht als anwendbare Diffs: die betreffende
Stelle in der heutigen `SciencePage.tsx` suchen und den Gedanken neu umsetzen.

Der dritte Patch (Touch-Bedienung) ist der einzige mit einem echten
Nutzungsproblem dahinter und am ehesten die Nacharbeit wert.
