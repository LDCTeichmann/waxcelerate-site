# Archiv: Hero-Tauchgang (WaxDive / WaxVerdict / WaxFormulaPanel)

Nur als Beleg lesen, nicht als Auftrag — siehe `PROJECT.md` Doku-Tabelle.

## Was es war

Klick oder Tap auf den schwebenden Wachsblock im Hero öffnete `WaxDive`, ein
Overlay mit zwei Reitern: **„Für mich"** (`WaxVerdict.tsx`, fragt Gelände,
Wetter, km/Woche und empfiehlt ein Produkt) und **„Was drin ist"**
(`WaxFormulaPanel.tsx`, die sechs Formel-Komponenten aus `science.ts`). Dazu
eine Lupe über dem Block (`WaxLensCutout.tsx`), die auf Desktop mit feinem
Zeiger die Kontaktstelle zeigte und den Dive öffnete, und ein wiederkehrender
Tap-Hinweis (Ripple + kurz aufblitzende Lupe) auf Mobile.

Entfernt am 17.09.2026 im Rahmen der Seitenordnung
(`docs/plaene/SEITENORDNUNG_PLAN.md`, Chat 2): der Hero-Klick scrollt seitdem
direkt zu `#produkte`, die Formel-Entscheidung fällt auf der neuen Seite
`/kettenwachs`.

## Warum es raus ist

Luca, 16.09.2026: „nicht überzeugt, man kommt auch über die Wissenschaftsseite,
trägt das zur Conversion bei?" — dieselben sechs Komponenten stehen
ausführlicher auf `/wissenschaft`, und die Wachsseiten-Formel gehört nicht in
ein Overlay über dem Hero-Bild.

## Betroffene Dateien (Stand des Tags `archiv/hero-waxdive`)

- `src/sections/hero/WaxDive.tsx`
- `src/sections/hero/WaxVerdict.tsx`
- `src/sections/hero/WaxFormulaPanel.tsx`
- `src/sections/hero/WaxLensCutout.tsx`
- `src/sections/hero/constants.ts` (nur `waxLensEnabled`, geteilte Lupen-Konstanten)
- `src/lib/science.ts` — Funktion `diveFormula`
- `src/lib/analytics.ts` — Funktion `trackWaxVerdict`, Event `wax_verdict`
- `src/hooks/useBodyScrollLock.ts` — ein Verbraucher weniger (Cart-Drawer und
  mobiles Menü nutzen den Hook weiter, die Datei bleibt bestehen)

## Wie man es zurückholt

```bash
git worktree add ../wax-dive-restore archiv/hero-waxdive
```

Die vier Hero-Dateien und `diveFormula`/`trackWaxVerdict` von dort in den
aktuellen Stand von `src/sections/hero-light.tsx` zurückkopieren (die Datei
hat sich seitdem verändert, ein direktes `git checkout` einer alten Version
würde die neuen Hero-Änderungen verwerfen). Der GitHub-Release
`archiv/hero-waxdive` trägt dieselbe Beschreibung wie diese Datei.
