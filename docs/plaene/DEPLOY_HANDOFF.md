# Handoff: Mobile-Optimization Branch — Deploy & offene Punkte

Stand: 2026-08-07, geschrieben von Claude (Cowork-Session, kein Shell-Push-Zugriff).
Zweck: falls Luca dies in einem neuen Chat (Claude Code o. ä.) mit echtem
Git-Zugriff weitergeben will, steht hier alles Nötige, um ohne Rückfragen
weiterzumachen.

**Für die Orientierung im Projekt allgemein: `PROJECT.md` zuerst lesen** —
das ist der bestehende Einstiegspunkt des Repos (Inhaltsverzeichnis, verweist
weiter auf `AGENTS.md`, `CLAUDE.md`, `docs/REPO_KARTE.md`, `docs/DESIGN.md`,
`docs/AUDIT.md`). Diese Datei hier dupliziert das absichtlich nicht — sie
deckt ausschließlich den Mobile-Optimization-Branch und den anstehenden
Deploy ab.

## 0. Sofort-Fix: GitHub-Push schlägt fehl ("Password authentication is not supported")

Luca hat versucht, direkt aus seinem Terminal zu pushen, und bekam:

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/LDCTeichmann/waxcelerate-site.git/'
```

Das ist kein Sandbox-Problem, sondern GitHub selbst: Passwort-Auth über HTTPS
git-Operationen ist seit Jahren abgeschaltet. Git fragte interaktiv nach
Username/Passwort, weil kein Credential-Helper mit gültigem Token hinterlegt
ist (`git config --list | grep credential` ist leer). Das ist unabhängig von
der Cowork-Sandbox-Einschränkung aus Abschnitt 3 unten — selbst mit echtem
Netzzugriff hätte dieser Push so nicht funktioniert.

**Fix (einmalig, dann dauerhaft gelöst):**

```bash
# falls gh noch nicht installiert:
brew install gh

gh auth login
# → GitHub.com → HTTPS → "Login with a web browser"
# → das ist exakt der Schritt, der den "Authorize your device"-Screen
#   von vorhin erzeugt hat. Diesmal den im Terminal angezeigten Code in
#   den Browser eintragen und bestätigen.

gh auth setup-git
# richtet den Credential-Helper ein, den git für https://github.com braucht.

# danach normal weiter:
git push origin backup/pre-mobile-optimization-20260806
git push origin mobile-optimization:main
```

Alternative ohne `gh`: unter github.com/settings/tokens ein Personal Access
Token erzeugen (Scope `repo`), und beim Passwort-Prompt von `git push` dieses
Token statt des echten Account-Passworts einfügen.

**Zur Einordnung, warum ich das nicht selbst pushen konnte:** Cowork läuft in
einer isolierten Sandbox ohne Zugriff auf Lucas lokale Anmeldedaten und ohne
Netzwerkpfad zu github.com (siehe Abschnitt 3) — das ist Absicht, kein Bug.
Eine Claude-Code-Session in Lucas eigenem Terminal läuft dagegen direkt auf
seinem Mac und erbt automatisch, was dort an Git-Credentials bereits
eingerichtet ist. Der obige `gh auth login` ist genau das: einmalig auf dem
Mac einrichten, danach funktioniert `git push` von dort aus ohne
Rückfragen — auch für eine künftige Claude-Code-Session in diesem Repo.

## 1. Was fertig ist

Alle Pakete aus `docs/plaene/MOBILE_PLAN.md` Stufe A und B sind implementiert, verifiziert
und auf dem Branch `mobile-optimization` committet (16 Commits über
`origin/main` hinaus, siehe Liste unten). Nur Stufe C (nativer Checkout)
fehlt — bewusst, siehe Abschnitt 3.

- **A1–A6**: LCP-Preloads pro Route, Produktbild im vorgerenderten HTML,
  Bilder auf Anzeigegröße, tote Assets archiviert, `/api/stock` nur wo
  gebraucht, Vercel Analytics.
- **B1–B2**: Produkte auf der Startseite nach vorn, Sticky-CTA korrigiert.
- **B3**: Typografie-Migration abgeschlossen — alle `text-[Npx]`-Werte unter
  12px sitewide (25+ Dateien, nicht nur die 3 im Plan genannten) auf die
  semantische Skala (`text-meta`=12px, `text-small`=13px) migriert.
  Sanktionierte Ausnahmen (bewusst nicht angefasst): `WhatChanges.tsx` (toter
  Code), mehrere `hidden`/`sm:`-Blöcke, die auf Mobile gar nicht sichtbar
  sind, und vier bestehende `sm:`-Overrides in `products.tsx`, die absichtlich
  auf Desktop kleiner bleiben.
- **B4**: Farbkontrast-Tokens auf WCAG 2.1 AA.
- **B5**: Touch-Ziele auf 44×44px (Punkt-Navigationen, Slider, Hamburger-Menü)
  per unsichtbarem `::after`-Pseudo-Element, sichtbare Optik unverändert.
- **B6**: Text aus der Kassettenverschleiß-Grafik gelöst, echtes HTML statt
  Pixel-Text (Screenreader-Fix).
- **B7**: sieben kleinere A11y-/Copy-Korrekturen (a–g, siehe Commit
  `23448dd`).
- **B8**: Rewax-Seite auf deutsche Suchbegriffe umgestellt (Title, H1,
  Nav-Label, neuer FAQ-Block, Homepage-Preistext korrigiert).
- **Abschließende Verifikation**: `layout-audit.mjs` (axe-core) deckte zwei
  echte Restbefunde auf, die B3/B5 übersehen hatten — sitewide
  Footer-Textlinks (16px Trefferhöhe) und einen übersehenen
  Punkt-Stepper in `FormulaGraph.tsx` — beide behoben, plus ein
  `scrollable-region-focusable`-Fix auf der Wissenschaftsseite.

Jeder Commit ist einzeln build- und overflow-verifiziert (`npm run build`,
`overflow-trace.mjs`, teils `layout-audit.mjs`/axe-core, Playwright-Screenshots).
Details stehen in den jeweiligen Commit-Messages — die sind absichtlich
ausführlich, damit man nicht in diesem Dokument nachschlagen muss.

## 2. Branch- und Commit-Status

```
Branch:            mobile-optimization
HEAD:              39df3776db8eaf14adfcb11e3e607f9b39116941
origin/main HEAD:  805ac044df8c02b6b51af48f3ede7616784fd0d6 (Stand: 2026-08-06)
```

`mobile-optimization` ist ein sauberer Fast-Forward von `origin/main` — 16
Commits neu, keine Divergenz, kein Merge-Konflikt möglich:

```
39df377 Abschliessende Verifikation: layout-audit.mjs deckt weitere Touch-Ziel- und A11y-Luecken auf, behoben
4c364b1 B5: Touch-Ziele auf 44x44px Trefferflaeche gebracht
a57d27f B3 (Teil 3/N, Abschluss): Typografie-Migration — verbleibende 19 Dateien sitewide
6b3bcee B3 (Teil 2/N): Typografie-Migration — 11 weitere Dateien
ef7fb9d B3 (Teil 1/N): Typografie-Migration — ProductDetailPage, SciencePage, products.tsx, tools.tsx
e4a218d B8: Rewax-Seite auf deutsche Suchbegriffe umgestellt
23448dd B7: sieben kleinere A11y-/Copy-Korrekturen
6ddf00d B6: Text aus Kassettengrafik geloest
69b8583 B4: Farbkontrast-Tokens auf WCAG-2.1-AA
a9a8423 B2: Sticky-CTA ehrlich beschriftet
4582fcb B1: Startseiten-Reihenfolge — Produkte nach vorn
75d9160 A6: Vercel Analytics
049a7f0 A5: /api/stock nur auf Routen mit Bestandsanzeige
0370319 A4: Unreferenzierte Bilddateien archiviert
273d801 A3: Produktbilder und Icons auf Anzeigegroesse
774706e A1+A2: LCP-Preloads pro Route, Produktbild discoverable
```

Ein lokaler Backup-Branch existiert bereits (zeigt exakt auf den aktuell
live geschalteten Stand von `origin/main`):

```
backup/pre-mobile-optimization-20260806  →  805ac04...
```

**Dieser Backup-Branch ist noch NICHT nach GitHub gepusht** — die Cowork-
Sandbox hat keine Git-Push-Credentials und kann github.com nicht erreichen
(DNS schlägt fehl, kein Token, kein SSH-Key). Das muss von einer Maschine
mit echtem Zugriff aus passieren (Lucas eigenes Terminal oder eine
Claude-Code-Session mit Repo-Zugriff).

## 3. Nächster Schritt: Deploy

Von einer Umgebung mit funktionierendem `git push` (Lucas Terminal oder
Claude Code) im Repo-Root ausführen:

```bash
git push origin backup/pre-mobile-optimization-20260806
git push origin mobile-optimization:main
```

Der zweite Befehl ist ein garantierter Fast-Forward (siehe Abschnitt 2) —
git verweigert ihn automatisch, falls das doch nicht mehr stimmen sollte
(z. B. weil in der Zwischenzeit jemand anders auf `origin/main` gepusht hat).
In dem Fall: nicht force-pushen, sondern erst `git fetch origin` und die
Situation neu bewerten.

Falls `main` bei Vercel als Production-Branch konfiguriert ist (wovon
auszugehen ist), löst der zweite Push automatisch ein Live-Deploy aus.

**Revert-Weg**, falls Luca nach dem Deploy zurück will:

```bash
git push origin backup/pre-mobile-optimization-20260806:main --force
```

## 4. Was noch offen ist

### 4.1 Stufe C — Nativer Checkout (blockiert, wartet auf Luca)

Bewusst nicht begonnen, wie vereinbart. Voraussetzung: die zwölf
`stripePriceId`-Werte von Luca. Sobald die da sind:

1. `docs/aufgaben/STRIPE_SETUP.md` folgen (Luca-Anteil: ca. 45 Min, davon
   20 Min Wartezeit auf Stripes Prüfung).
2. Die zwölf `stripePriceId`-Werte in `src/lib/data.ts` eintragen — das ist
   der einzige Code-Eingriff. `checkoutEnabled` kippt automatisch von
   `false` auf `true`, Warenkorb-Icon/Drawer/alle Kauf-Buttons schalten sich
   selbst von `<a href={product.ebayUrl}>` auf den Stripe-Checkout um.
3. Testkauf im Stripe-Testmodus über den kompletten Pfad, inklusive
   Versandkostenberechnung mit gemischtem Warenkorb (ein Wachsblock plus
   zwei Ketten muss auf Paket-Versand eskalieren, siehe `shippingFor()`
   in `src/lib/data.ts`).
4. Das ist C1. C2 (Kaufpfad von 5 auf 2 Schritte) ist der nächste Schritt
   danach, siehe `docs/plaene/MOBILE_PLAN.md` ab Zeile 508.

### 4.2 Kleiner Rest aus B5 (dokumentiert, nicht verfolgt)

~19 kurze Inline-Textlinks sitewide (z. B. "Zurück", "Pro MoS₂ →", "Lieber
per E-Mail", Blog-Intent-Links) sind 15–21px hoch statt der Zielgröße 24px.
WCAG 2.5.8 nennt Inline-Links in Fließtext explizit als Ausnahme vom
24×24-Minimum; diese sind großzügig breit (>60–230px) und stehen einzeln.
Bewusst als akzeptabler Restbestand eingestuft, kein Blocker. Falls das
irgendwann doch angefasst werden soll: gleiche Technik wie beim
Footer-Fix (`inline-block` + `py-*`, `space-y-*` der Umgebung entsprechend
reduzieren).

### 4.3 Waxcelerate-Skill-Referenzdateien (aus B8, Tooling-Limit)

Beim B8-Commit (`e4a218d`) konnte die Preisangabe in der Waxcelerate-Skill
(`references/20_products_pricing.md`) nicht direkt korrigiert werden — der
`save_skill`-Mechanismus in dieser Cowork-Session kann nur `SKILL.md`
überschreiben, nicht Dateien im `references/`-Unterordner. Manuell
nachzuziehen:

- **`references/20_products_pricing.md`**: die veralteten Rewax-Preise
  "9,99 €/24,99 €" ersetzen durch: "13,95 € je Kette einzeln, 9,95 € je
  Kette ab drei Ketten, 1,80 € Rückversand pauschal pro Sendung".
- **`references/90_decision_log.md`**: neuen Eintrag D13 ergänzen, der diese
  Korrektur dokumentiert. Quelle: `RewaxPage.tsx`-Kommentar "Prices per
  Luca, 2026-07-28".

### 4.4 Uncommitted lokale Dateien — nicht anfassen ohne Rückfrage

Im Arbeitsverzeichnis liegen unabhängig von dieser ganzen Arbeit noch
Änderungen, die nicht von mir stammen und nicht committet sind:

```
M  docs/aufgaben/EBAY_MICH_SEITE.md
M  docs/aufgaben/GOOGLE_UNTERNEHMENSPROFIL.md
M  docs/aufgaben/LUCA_TODO.md
?? docs/plaene/MOBILE_PLAN.md          (der Plan selbst, bewusst nicht Teil des Repos)
?? performance-audit/      (Audit-Rohdaten aus der Baseline-Messung)
```

Diese wurden in der gesamten Mobile-Optimization-Arbeit absichtlich
unangetastet gelassen (nicht Teil des Auftrags). Vor irgendeinem `git
add -A`, `git stash`, `git checkout` o. ä. erst mit Luca klären, ob die
drei `.md`-Dateien behalten/committet werden sollen.

## 5. Falls Lighthouse-Zahlen gebraucht werden

Lighthouse ließ sich in der Cowork-Sandbox nicht ausführen (Chrome zeigt
für jede URL, auch externe, eine Verbindungs-Interstitial-Seite —
Sandbox-Netzwerkrestriktion, kein Code-Problem). Mit echtem Netzzugriff
(Lucas Rechner oder Claude Code mit funktionierendem Netz) sollte das
funktionieren:

```bash
npm run build
npx serve -s dist -l 8099 &
npx lhci autorun --config=performance-audit/config/lighthouserc.mobile.cjs
npx lhci autorun --config=performance-audit/config/lighthouserc.desktop.cjs
```

Alternativ das komplette Original-Audit-Skript, das auch axe-core, webhint
und Screenshots mitnimmt:

```bash
bash performance-audit/run-audit.sh
```
