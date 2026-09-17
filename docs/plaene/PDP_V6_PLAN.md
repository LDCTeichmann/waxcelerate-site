# Bauplan: Produktseiten v6 („kaufen statt verlieren“)

Betrifft: Classic- und Pro-Wachs (`WaxProductPage`) und alle Ketten (`ChainProductPage`).
Ausführung: **ein Sonnet-Chat**, arbeitet diesen Plan von oben nach unten ab.

## Prompt für den neuen Sonnet-Chat (1:1 einfügen)

```
Baue die Produktseiten v6 für Waxcelerate. Der vollständige Bauplan liegt in
/Users/lucateichmann/.claude/plans/wir-m-ssen-die-produktseiten-parsed-garden.md
Lies ihn komplett, dann CLAUDE.md und PROJECT.md. Arbeite die Schritte 1–5 der Reihe nach
ab, ohne Rückfragen, außer etwas im Plan widerspricht dem Code. Frischer Worktree von
origin/main, Branch feat/pdp-v6. Am Ende: Screenshots an mich, PR öffnen, nicht mergen.
```

## Context

Luca (17.09.2026): Die Produktseiten tragen zu viel Information, Käufer verlieren sich.
Ziel: oben kaufen, darunter nur das, was die Kaufentscheidung braucht; Hintergrund-Kapitel
bleiben erreichbar, aber zugeklappt in schönen, klickbaren Karten.
Konkret:
1. Oben die **echte Website-Navigation** (`<Navigation />` mit Topbar) statt des eigenen Mini-Headers.
2. Galerie: **ein Bild zur Zeit**, durchklickbar. **Keine Beschriftung/Text auf Bildern.**
3. **Gleiche Inhaltsbreite** wie die übrigen Seiten.
4. Kaufbox, Beweisleiste und „Was sich für dich ändert“ bleiben wie sie sind.
5. Sichtbar bleiben: Daten/Passung/Grenzen (nach **oben**), Stimmen (**kompakter**), Welches Wachs.
6. Zugeklappt in Karten: Reibung (K02), Rechner (K03), Ablauf (K04) — plus „Wenn der Block leer ist“.

Luca liest keine Textwände (Memory „Leute lesen nicht“), Anspruch preiswürdiges Design.

## Arbeitsbasis (Pflicht)

- `main` bewegt sich schnell. Frischer Worktree von `origin/main`, Branch `feat/pdp-v6`, dann `npm ci`.
  Der Worktree `rechner-deck-v5` und der alte Branch `feat/pdp-redesign` sind **veraltet — nicht benutzen**.
- Zuerst `CLAUDE.md`, `PROJECT.md` lesen. Diesen Plan nach `docs/plaene/PDP_V6_PLAN.md` kopieren und mitcommitten.
- Stil der bestehenden `src/pages/product/wax/*`-Dateien übernehmen (dort stehen DE/EN inline als `de ? … : …` — so beibehalten, keine neue i18n-Struktur).
- Keine Produktdaten hardcoden (Regel 1), keine Hooks in `.map()` (Regel 2).

## Schritt 1 — Echte Navigation

Datei: `src/pages/ProductDetailPage.tsx` (Block `{/* ── NAV ── */}`, ca. Z. 636–684).
- Den ganzen `<header className="fixed …">…</header>` durch `<Navigation />` ersetzen
  (`import { Navigation } from '@/sections/navigation'`, Muster wie `src/pages/StarterSetPage.tsx:149`).
  Navigation hat eigenes CartIcon, Topbar, Mobilmenü und markiert „Produkte“ auf `/produkt/*` schon aktiv.
- Die **Brotkrümel** (Desktop) und die **Mobil-Zurück-Pille** (`handleBack`, `backFallback`) nicht löschen,
  sondern als schlanke Zeile an den **Anfang der Heroes** verschieben: neue kleine Komponente
  `src/pages/product/PdpCrumbs.tsx` (Props: `de`, `titleText`, `backFallback`, `onBack`), Markup 1:1 aus dem alten Header,
  ohne Logo. Wird in `WaxHero` und `ChainHero` als erstes Kind von `.wxp-wrap` gerendert
  (Props durch `WaxProductPage`/`ChainProductPage` durchreichen). Der Accessory-Zweig (`else`) bekommt dieselbe Zeile über seinem Hero.
- Nicht mehr genutzte Imports (`ChevronRight`, `ArrowLeft`, Logo-`picture`, ggf. `CartIcon`/`checkoutEnabled`) nur entfernen, wenn wirklich verwaist.
- `wax.css`: `.wxp-hero` padding-top so erhöhen, dass der Inhalt unter Topbar + Nav beginnt
  (Richtwert mobil ~120px, ab 1024px ~150px; **im Browser messen**: `header.wx-header` `getBoundingClientRect().bottom` + 16px).
  Gleiches für den Accessory-Hero prüfen.
- BreadcrumbList-JSON-LD bleibt unverändert.

## Schritt 2 — Galerie: ein Bild, durchklickbar, ohne Text

Neue Komponente `src/pages/product/PdpGallery.tsx`, von `WaxHero` **und** `ChainHero` genutzt
(ersetzt dort den Block `<div className="wxp-gallery">…</div>` + `wxp-gcount`).

Props: `{ images: { src: string; alt: string }[]; de: boolean; onOpen: (i: number) => void }`.
Verhalten:
- Eine Bühne, `aspect-ratio: 4/5` mobil, `1/1` ab 900px, `border-radius: 18px`, Hintergrund `var(--hero-stage)`.
- Bilder als horizontaler `scroll-snap`-Streifen (je 100% Breite) → Swipe mobil gratis; aktiver Index per `onScroll`
  (Muster aus WaxHero Z. 85–88). Pfeil-Buttons links/rechts (lucide `ChevronLeft/Right`, runde 40px-Buttons, halbtransparent,
  ab 900px sichtbar bei Hover/Fokus, mobil ausgeblendet) scrollen per `scrollTo({ left: i * width, behavior: 'smooth' })`.
- Darunter **Thumbnail-Leiste** (64px Quadrate, `gap: 8px`, aktiver mit 2px `var(--accent)`-Rahmen, `aria-current`), Klick springt.
  Mobil stattdessen Punkte (6px, aktiver 18px breit).
- Pfeiltasten ←/→ wenn Bühne fokussiert; `aria-roledescription="carousel"`, Buttons mit `aria-label` („Vorheriges Bild“ / „Nächstes Bild“, „Bild n von m“).
- Klick aufs Bild → `onOpen(i)` (bestehende `ImageLightbox` bleibt).
- **Kein figcaption, kein Overlay-Gradient, kein Text im Bild.** `alt` = Titel der Szene (nur für Screenreader).
- Erstes Bild `loading="eager" fetchPriority="high"`, Rest lazy; `photo-neutral`-Klasse für Bilder ab Index 1 beibehalten.
- Alle Bilder zeigen (nicht mehr `slice(0, 4)`).
- In `ProductDetailPage.tsx` die `gallery`-Props für Wax/Chain auf `{ src, alt }` umstellen (`alt` = bisheriges `title`),
  `fact` entfällt. Den Typ in `WaxProductPage`/`ChainProductPage`/Heroes entsprechend anpassen.
- Alte `.wxp-gallery*`- und `.wxp-gcount`-Regeln in `wax.css` löschen, wenn nichts anderes sie nutzt (`git grep` prüfen,
  Starter-Set/Accessory!). Neue Regeln als `.wxp-pg-*` in `wax.css`.

## Schritt 3 — Gleiche Breite wie die übrigen Seiten

- Referenz: `src/components/Section.tsx:25` → `max-w-7xl` (1280px), Padding `px-6 sm:px-10 lg:px-14`.
- `wax.css` Z. 31–32: `.wxp-wrap` auf `max-width: 1280px; padding: 0 24px`, ab 640px `0 40px`, ab 1024px `0 56px`.
- Das betrifft bewusst auch Starter-Set und Zubehörseiten (teilen `.wxp-wrap`) → einheitlich. Dort kurz visuell gegenprüfen.
- Kontrolle bei 1440px Viewport: linke Kante des Hero-Inhalts = linke Kante des Inhalts in `#produkte` auf `/` (±2px).

## Schritt 4 — Neue Reihenfolge und Karten-Deck

### 4a Neue Komponente `src/pages/product/DeepDive.tsx`

„Mehr wissen“-Deck. Props:
`{ de: boolean; items: { id: string; icon: IcoName; title: string; teaser: string; render: () => React.ReactNode }[] }`
(`Ico` aus `wax/Ico.tsx`, vorhandene Icon-Namen verwenden).
- Abschnitt `section.wxp-chapter` mit `ChapterHead` (n = „Mehr wissen“, Titel „Für Neugierige.“ / „For the curious.“, keine Lede).
- Raster aus Karten: 1 Spalte mobil, 2 ab 640px, `repeat(auto-fit, minmax(220px,1fr))` ab 900px. Karte = `button.wxp-card.wxp-dd-card`
  mit Icon (Kreis `var(--wxp-soft)`), Titel (Fraunces 20px), Teaser (1 Zeile, `var(--txm)`, 14px), unten „Ansehen +“ / „Schließen –“.
  Hover: `translateY(-2px)` + `--wxp-shadow-hi`. Offene Karte: Rahmen `var(--accent)`, `aria-expanded`, `aria-controls`.
- **Immer nur eine offen.** Der Inhalt erscheint **unter dem Raster, volle Breite** (die eingebetteten Kapitel bringen ihr eigenes `.wxp-wrap` und teils dunkle Bänder mit), in `<div id="dd-{id}" className="wxp-dd-panel">`, sanftes Einblenden (opacity + translateY, 250ms, `prefers-reduced-motion` respektieren). Nach dem Öffnen `scrollIntoView({ block: 'start', behavior: 'smooth' })` auf das Panel, mit `scroll-margin-top` = Navhöhe.
- Inhalt erst beim Öffnen mounten (`render()`), das spart Gewicht; offene Karte merkt sich nichts über Reload.
- CSS im Panel: `.wxp-dd-panel .wxp-chapter { padding: 40px 0 56px; }` und `.wxp-dd-panel .wxp-chead .eyebrow { display: none; }`
  (die Karte ist schon die Überschrift, alte „Kapitel 0x“-Nummern verschwinden so ohne Eingriff in die Komponenten).
- Export zusätzlich `openDeepDive(id)` über ein einfaches Custom-Event (`window.dispatchEvent(new CustomEvent('wxp-dd', { detail: id }))`), damit andere Stellen eine Karte öffnen können.

### 4b `WaxProductPage.tsx` — neue Reihenfolge

```
WaxHero
ProofStrip
ChangeForYou            (Kapitel 01, unverändert)
DataFitLimits           (jetzt Kapitel 02)
WhichWax                (jetzt Kapitel 03, id="welches" bleibt, onProHint funktioniert weiter)
WaxReviews compact      (jetzt Kapitel 04)
DeepDive: friction | calc | process | empty
WaxFaq
WaxClosing
```
DeepDive-Items (Wachs):
| id | Titel | Teaser | render |
|---|---|---|---|
| friction | Wo die Reibung sitzt | Warum ein fester Film besser schützt als Öl. | `<FrictionLens de={de} />` |
| calc | Rechnet sich das? | Deine Ersparnis mit deinem Fahrprofil. | `<WaxCalculator … onTouch={() => setPersonalized(true)} />` |
| process | So läuft’s ab | Ein Wachsgang, Schritt für Schritt. | `<ProcessWatch de={de} product={product} />` |
| empty | Wenn der Block leer ist | Nachbestellen oder einschicken. | `<WhenEmpty product={product} de={de} />` |
(EN-Texte sinngemäß.)

Kapitelnummern: `ChapterHead` in `DataFitLimits` und `WhichWax` bekommen ein optionales `n`-Prop wie `WaxReviews` schon `chapter` hat;
WaxProductPage übergibt 02/03/04. Hartkodierte Nummern nur dort ändern, wo es nötig ist.
`DataFitLimits` behält die Klasse `wxp-graybg`, bei `WhichWax` prüfen, dass zwei graue Bänder nicht aneinanderstoßen (ggf. Hintergrund einer Sektion neutral).

### 4c `ChainProductPage.tsx` — neue Reihenfolge

```
ChainHero
ProofStrip
ChangeForYou            (01)
ChainFit                (02)
ChainData               (03)
WaxReviews compact chain (04)
DeepDive: friction | process | calc (nur wenn withCalc) | after
WaxFaq kind="chain"
ChainClosing
```
Items: friction (FrictionLens), process („Was wir damit machen“, `<ChainProcess de n="" />`),
calc (`<WaxCalculator mode="chain" chapter="" />`, nur 11/12-fach), after („Nach dem ersten Film“, `<ChainAfter de />`).
Die `next()`-Zählung vereinfachen: feste Nummern 02/03/04, da der Rechner nicht mehr mitzählt.

### 4d Stimmen kompakter (`WaxReviews` in `WaxSections.tsx`)

Prop `compact?: boolean` (beide Seiten übergeben `compact`). Im compact-Modus:
- Kein großes Foto-Element (`wxp-rv-big` entfällt), stattdessen **drei gleich große Karten** in einer Reihe
  (1 Spalte mobil als horizontaler Snap-Streifen, 3 Spalten ab 900px), Zitat auf 4 Zeilen begrenzt (`-webkit-line-clamp: 4`), Klick auf „mehr“ klappt die Karte auf.
- Statistikzeile als **eine** schmale Zeile über den Karten: `★ 250+ Bewertungen · 100 % positiv · 1.000+ verkauft` (Werte aus `trustStats`, nicht hardcoden) + der eBay-Hinweis als kleiner Text (`12.5px`, `var(--txf)`).
- `.wxp-chapter`-Padding für diese Sektion `56px 0` statt 88/112.
- Bestehende Regeln: nur wortgleiche Bewertungen, maskierte Namen, `aboutOf` für Ketten — unverändert lassen.

## Schritt 5 — Prüfen (Pflicht, vor Commit)

1. `npx tsc -b --force` sauber, `npm run build` sauber (Prerender der `/produkt/*`-Seiten in `dist/` enthält Navigation und H1).
2. Browser-Pane (`preview_start`, Port 5174) auf `/produkt/kettenwachs-500g` (IDs aus `src/lib/data.ts` nehmen), einer Pro-Seite, einer 12-fach- und der 9-fach-Kette:
   - echte Navigation + Topbar sichtbar, nichts vom Hero verdeckt, Brotkrümel darunter;
   - Galerie: 1 Bild, Pfeile/Thumbs/Swipe/Tastatur funktionieren, kein Text auf Bildern, Lightbox öffnet;
   - Breite = Startseite (Messung aus Schritt 3);
   - Reihenfolge wie 4b/4c; Karten öffnen/schließen, nur eine offen, Rechner rechnet, „Welches Wachs“-Hinweis im Kaufblock scrollt weiter;
   - 9-fach: keine Rechner-Karte;
   - mobil 375px (`resize_window` mobile) und Dark Mode prüfen, kein horizontales Scrollen (`document.documentElement.scrollWidth === innerWidth`);
   - Starter-Set und eine Zubehörseite kurz gegenprüfen (geteiltes `.wxp-wrap`).
   - Konsole: nur der bekannte harmlose „Invalid hook call“-Dev-Fehler ist ok.
3. Screenshots Desktop + Mobil an Luca (SendUserFile).
4. Commit(s) auf `feat/pdp-v6` mit klaren deutschen Messages, pushen, PR gegen `main` öffnen. **Nicht selbst mergen.**
5. `PROJECT.md` Entscheidungslog um eine Zeile ergänzen.

## Bewusste Entscheidungen (bei Unklarheit so lassen)

- „Welches Wachs“ bleibt sichtbar (hilft bei Classic vs. Pro, der Kaufblock verlinkt dorthin).
- „Wenn der Block leer ist“ / „Nach dem ersten Film“ wandern mit ins Deck (Nachkauf-Info, nicht kaufentscheidend).
- FAQ bleibt (ist schon zugeklappt), Schluss-CTA bleibt.
- Deck-Inhalte werden erst beim Öffnen gerendert (weniger Gewicht); Textinhalte davon fehlen damit im Prerender — akzeptiert.
