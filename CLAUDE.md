# Waxcelerate — Claude Code Context

**Was:** Marketing-Website für Waxcelerate (Luca Teichmann) — verkauft Heißwachs-Fahrradkettenprodukte auf eBay. Keine E-Commerce-Funktionalität, kein Backend. Die Site leitet Besucher zu eBay-Listings weiter.

**Stack:** React 19 + TypeScript (strict) · Vite 7 (Port 5174) · Tailwind CSS v3 · React Router v6 · shadcn/ui (nur Slider)

**Für Details → siehe `AGENTS.md`**

---

## Kritische Regeln

1. **Nur `src/lib/data.ts` für Produktdaten** — niemals Produktinfo in Komponenten hardcoden
2. **Keine Hooks in `.map()`** — immer Wrapper-Komponente dazwischen (siehe `RevealSlot` in tools.tsx)
3. **`e.stopPropagation()`** auf innere Links wenn äußeres Element bereits ein Link ist
4. **Performance-Index-Balken in `why-wax.tsx` Block 4:** höherer Balken = besser. Classic=95%, Graphit=72%, Öl=18%. NICHT zurückändern.
5. **Vor jedem Commit:** `npx tsc --noEmit` muss sauber durchlaufen (pre-commit hook läuft automatisch)
6. **Sprache:** Deutsche Strings in `src/lib/i18n.ts`, niemals direkt in Komponenten

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
| Akzent-Blau | `#4A6AEE` / `#5B7AEE` |
| Body-Text | `#8896B0` |
| Überschriften | `#FFFFFF` |

---

## Ausführen

```bash
npm run dev -- --port 5174   # Dev-Server
npx tsc --noEmit             # Type-Check
npm run build                # Produktions-Build → dist/
```
