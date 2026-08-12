# Waxcelerate — Claude Code Context

**Was:** Marketing-Website für Waxcelerate (Luca Teichmann) — verkauft Heißwachs-Fahrradkettenprodukte auf eBay. Ein eigener Stripe-Checkout (`api/create-checkout.ts`, Cart-Store) ist bereits fertig gebaut, aber inaktiv: kein Produkt hat eine `stripePriceId` gesetzt, also fällt jeder Kauf-Button auf den eBay-Link zurück (`checkoutEnabled` in `src/lib/data.ts`). Siehe `docs/plaene/UX_UPGRADE_PLAN.md` Phase 6 und `docs/aufgaben/STRIPE_SETUP.md`.

**Stack:** React 19 + TypeScript (strict) · Vite 7 (Port 5174) · Tailwind CSS v3 · React Router v6 · shadcn/ui (nur Slider)

**Zuerst lesen → `PROJECT.md`.** Das ist das Inhaltsverzeichnis: wo welche Doku
liegt, welche Entscheidungen offen sind und was zuletzt entschieden wurde. Von
dort gezielt weiter in den passenden `docs/`-Unterordner, statt breit zu suchen.

**Für technische Details → siehe `AGENTS.md`**

---

## Kritische Regeln

1. **Nur `src/lib/data.ts` für Produktdaten** — niemals Produktinfo in Komponenten hardcoden
2. **Keine Hooks in `.map()`** — immer Wrapper-Komponente dazwischen (siehe `RevealSlot` in tools.tsx)
3. **`e.stopPropagation()`** auf innere Links wenn äußeres Element bereits ein Link ist
4. **Performance-Index-Balken in `why-wax.tsx` Block 4:** höherer Balken = besser. Classic=95%, Graphit=72%, Öl=18%. NICHT zurückändern.
5. **Vor jedem Commit:** `npx tsc --noEmit` muss sauber durchlaufen (pre-commit hook läuft automatisch)
6. **Sprache:** Deutsche Strings in `src/lib/i18n.ts`, niemals direkt in Komponenten

---

## Arbeitsweise mit Claude Code

**Der eingebaute Browser-Pane ist erlaubt** (`preview_start`, `navigate`, `computer`, `read_page` aus dem Claude-Browser-Toolset). Er läuft in der App und stiehlt Luca nicht den Fenster-Fokus. Für visuelle Prüfungen von Layout, Bildausschnitten und Dark Mode ruhig nutzen, ohne vorher zu fragen.

**Nicht erlaubt ohne Rückfrage:** das Chrome-Toolset (`mcp__claude-in-chrome__*`) und alle Desktop-Screenshot-/Computer-Use-Tools (`mcp__computer-use__*`). Die greifen auf Lucas echten Bildschirm und sein echtes Chrome zu und stören die parallele Arbeit sichtbar (Fenster-Fokus, orangene Bildschirmränder).

Wo eine Prüfung ohne Browser reicht, ist sie trotzdem vorzuziehen: `npx tsc --noEmit`, `npm run build`, Prüfung des vorgerenderten HTML in `dist/`, DOM-Checks via `getBoundingClientRect` / `getComputedStyle`.

---

## Datei-Map

```
src/lib/data.ts          ← Produktdaten, Intervalle, Kompatibilitäts-Matrix
src/lib/i18n.ts          ← Alle DE/EN Strings
src/sections/            ← Eine Datei pro Page-Section
  products.tsx           ← Produktkarten (WaxCard → /produkt/:id, ChainCard → eBay)
  tools.tsx              ← 5 live-updating Kalkulatoren
  why-wax.tsx            ← Animierte Vergleichs-Charts (GSAP ScrollTrigger)
src/pages/ProductDetailPage.tsx  ← Route /produkt/:id
src/hooks/useLanguage.tsx        ← { t, lang, setLang }
```

---

## Design-System (Farben)

| Rolle | Wert |
|---|---|
| Seiten-BG | `#090909` |
| Karten-BG | gradient `#191c24 → #111318` |
| Akzent-Blau | `#2B52B0` / `#3D67CA` |
| Body-Text | `#8896B0` |
| Überschriften | `#FFFFFF` |

---

## Ausführen

```bash
npm run dev -- --port 5174   # Dev-Server
npx tsc --noEmit             # Type-Check
npm run build                # Produktions-Build → dist/
```
