# Waxcelerate Website

Marketing website for Waxcelerate — hot-wax bicycle chain lubrication sold on eBay.

**Not an e-commerce store.** This site drives traffic to eBay listings. No backend, no database, no API calls.

## Quick start

```bash
npm install
npm run dev -- --port 5174
# → http://localhost:5174
```

Or double-click `/Applications/Waxcelerate.app` — starts the server + opens the browser + opens Cursor.

## Stack

- **React 19 + TypeScript** — Strict mode
- **Vite 7** — Dev server + build
- **Tailwind CSS v3** — Dark theme only
- **React Router DOM v6** — `/` and `/produkt/:id`
- **shadcn/ui** — Radix-based UI primitives (Slider used in tools)

## For AI agents

Read **`AGENTS.md`** — full architecture, design system, data model, routing, and common pitfalls. Start there before touching any file.

## Key files

| File | What it does |
|---|---|
| `src/lib/data.ts` | All product data — single source of truth |
| `src/lib/i18n.ts` | German/English translations |
| `src/sections/products.tsx` | Product cards with tilt + scroll-reveal |
| `src/sections/tools.tsx` | Five live-updating calculators |
| `src/sections/why-wax.tsx` | Animated comparison charts |
| `src/pages/ProductDetailPage.tsx` | Product detail route |

## Build

```bash
npm run build      # → dist/
npx tsc --noEmit   # type-check only
```
