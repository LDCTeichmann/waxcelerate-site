# Changelog

Format: `## [DATUM] — Kurze Beschreibung`

---

## [2025-05-12] — Kompletter Website-Redesign & Feature-Sprint

### Produktkarten (`products.tsx`)
- Bildzone: Wachs 300px → 360px, Ketten 200px → 210px
- `imagePosition` per Produkt in `data.ts` für präzises Cropping
- `object-cover` statt `object-contain` — Bilder füllen Karte vollständig
- 3D-Tilt-Effekt bei Hover (perspective + rotateX/Y aus Mausposition)
- Scroll-Reveal Eingangsanimation (staggered, 80ms Versatz pro Karte)
- Wachs-Karten → Klick → `/produkt/:id` Detailseite
- Ketten-Karten → Klick → eBay-Listing direkt

### About-Section (`about.tsx`)
- Stat: 294+ → 500+ verkaufte Produkte
- Stat: "eBay-Mitglied seit 2017" → "Waxcelerate seit 2024"
- Stat: "Antwortzeit 12h" → "Versand in < 24h"

### Tools-Section (`tools.tsx`)
- Alle "Berechnen"-Buttons entfernt — Ergebnisse live-updating
- CostSavingsCalculator: Animierte Balkendiagramm-Visualisierung
- RotationPlanner: SVG Cycle-Diagram mit animiertem Aktiv-Indikator
- Staggered Scroll-Reveal für alle 5 Tool-Karten (90ms Versatz)

### Why-Wax (`why-wax.tsx`)
- Block 4 Balken: Reibungs-Koeffizienten → Performance-Index invertiert
  - Classic: 95% · Graphit-Heißwachs: 72% · Kettenöl: 18%
  - Höherer Balken = bessere Schmierung

### Infrastruktur
- `AGENTS.md` erstellt (273 Zeilen, vollständige Architektur-Doku)
- `CLAUDE.md` erstellt (projekt-spezifischer AI-Kontext)
- `.cursorrules` erstellt (Cursor AI-Kontext)
- `/Applications/Waxcelerate.app` erstellt (macOS Launcher)
- Git-Repo initialisiert mit pre-commit TypeScript-Check
