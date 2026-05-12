# Waxcelerate — AI Agent Guide

> Read this before touching any file. It covers the full architecture, design system, data model, and the reasoning behind every major decision. This applies to Claude, Cursor, GPT, or any other AI working on this codebase.

---

## What this project is

A product website for **Waxcelerate**, a small German business (run by Luca Teichmann) that sells hot-wax bicycle chain lubrication products on eBay. The site is **not** an e-commerce store — it's a marketing/landing page that drives traffic to eBay listings. It has:

- A hero section with a headline and CTA
- Product cards (wax blocks + pre-waxed chains) that link to eBay
- A "Why Wax?" section with animated comparison charts
- Five interactive planning tools (calculators)
- A guides/FAQ accordion
- About + contact section
- German/English language toggle

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 19 + TypeScript | Strict mode on |
| Build | Vite 7 | Dev on port 5174, build → `dist/` |
| Styling | Tailwind CSS v3 | Config in `tailwind.config.js` |
| Router | React Router DOM v6 | `<BrowserRouter>` in `main.tsx` |
| UI primitives | shadcn/ui (Radix) | Only `Slider` is currently used in tools |
| Animations | CSS transitions + IntersectionObserver | No GSAP dependency needed now |
| Icons | lucide-react | |
| Language | `useLanguage` hook + `src/lib/i18n.ts` | de/en toggle, stored in localStorage |

**No backend. No API calls. No database.** Everything is static data in `src/lib/data.ts`.

---

## Folder Structure

```
src/
├── App.tsx                   Root component — renders all sections in order
├── main.tsx                  Entry point, wraps in BrowserRouter + LanguageProvider
├── index.css                 Global CSS resets and font imports
│
├── sections/                 One file per page section (rendered in App.tsx)
│   ├── navigation.tsx        Sticky nav with smooth-scroll links
│   ├── hero.tsx              Full-viewport hero with animated headline
│   ├── products.tsx          ★ Product cards — wax + chain grids
│   ├── why-wax.tsx           Animated comparison blocks (4 "blocks")
│   ├── tools.tsx             ★ Five interactive calculators
│   ├── guides.tsx            Accordion-style step guides
│   ├── about.tsx             Stats + contact info
│   ├── contact.tsx           Contact form (static, no submit handler)
│   ├── faq.tsx               Accordion FAQ
│   └── footer.tsx            Footer links
│
├── pages/
│   └── ProductDetailPage.tsx Product detail page (reached via /produkt/:id)
│
├── lib/
│   ├── data.ts               ★ THE source of truth — all product data, intervals, compatibility
│   ├── i18n.ts               All German/English strings
│   └── utils.ts              shadcn cn() helper
│
├── hooks/
│   ├── useLanguage.tsx        Language context + hook (returns { t, lang, setLang })
│   ├── use-cart.ts            Cart hook (not used on main site yet)
│   ├── use-chain-tracker.ts   Chain tracker hook (not used on main site yet)
│   ├── use-mobile.ts          Breakpoint detection
│   ├── use-mouse-position.ts  Mouse tracking
│   └── use-scroll-velocity.ts Scroll speed
│
├── components/
│   └── ui/                   shadcn/ui components (Slider, Button, etc.)
│
└── types/                    TypeScript type definitions
```

---

## Data Model (`src/lib/data.ts`)

This is the single most important file. **All product info lives here.** Never hardcode product data in components.

### Product interface

```ts
interface Product {
  id: string;              // URL slug + lookup key (e.g. "classic-500")
  type: 'wax' | 'chain';
  title: string;           // German name
  titleEn: string;         // English name
  subtitle: string;        // Short tagline (German)
  subtitleEn: string;
  price: number;
  ebayUrl: string;         // Direct eBay listing URL
  images: string[];        // Array of image URLs (eBay CDN or /public/images/)
  imagePosition?: string;  // CSS object-position for cropping (e.g. "center 42%")
  features: string[];      // Bullet point features (German)
  featuresEn: string[];
  specs: Record<string, string>;  // Technical specs table
  specsEn: Record<string, string>;
  detailUrl?: string;      // Optional: route to ProductDetailPage
}
```

### Key data structures

```ts
// Rewax intervals in km: waxIntervals[weather][terrain]
waxIntervals['trocken']['strasse'] = 600
waxIntervals['nass']['mtb'] = 150

// Chain compatibility: compatibilityMatrix[brand][speed] = [productId, ...]
compatibilityMatrix['shimano']['11'] = ['shimano-ultegra-hg701', 'ybn-11s']

// getProductById(id: string): Product | undefined
```

---

## Design System

### Colors (dark theme only, no light mode)

| Token | Value | Usage |
|---|---|---|
| Page bg | `#090909` | Main section backgrounds |
| Tools bg | `#06060A` | Slightly darker for tools section |
| Card bg | gradient `#191c24 → #111318` | Product cards |
| Card border | `rgba(255,255,255,0.06)` | Subtle white-alpha |
| Blue accent | `#4A6AEE` / `#5B7AEE` | Primary CTA color, highlights |
| Blue text | `#8AAAFF` | Secondary blue for labels/prices |
| Body text | `#8896B0` | Main readable text |
| Muted text | `#6B7088` | Subtitles, secondary info |
| Very muted | `#4A4A62` | Labels, placeholders |
| White | `#FFFFFF` | Headings only |

### Typography

- Display/headings: `font-display` class → Montserrat or similar bold font
- Body: system sans-serif via Tailwind defaults
- Tracking: section labels use `tracking-[0.3em]` uppercase small caps

### Animation patterns

- **Scroll reveal**: `useScrollReveal(delayMs)` hook → IntersectionObserver, opacity 0→1 + translateY 22px→0
- **3D tilt**: `useTilt(strength)` hook → mousemove calculates rotateX/rotateY from center offset, perspective(900px)
- **Animated bars**: `AnimatedBar` component in tools.tsx → IntersectionObserver triggers CSS width transition
- **Cycle diagram**: SVG-based, `setInterval` rotates active node every 1.8s

---

## Section Deep-dives

### `products.tsx` — Product Cards

Two card types rendered in separate grids:

**WaxCard** (for wax blocks):
- Wraps in `<Link to={/produkt/${id}}>` (React Router) → goes to ProductDetailPage
- 360px tall image zone with `object-cover`, `objectPosition` from `product.imagePosition`
- Gradient scrim overlay with product name + variant label
- Inner eBay CTA anchor has `e.stopPropagation()` so clicking "Auf eBay kaufen" doesn't navigate to detail page
- `useTilt(4)` + `useScrollReveal(index * 80ms)` applied via merged ref callback

**ChainCard** (for pre-waxed chains):
- Wraps in `<a href={product.ebayUrl}>` (external, opens eBay directly)
- 210px image zone
- Same tilt + reveal hooks

Both hooks return refs that must be merged onto the same div using a `useCallback` ref function (since you can't put two refs on one element without this pattern).

### `why-wax.tsx` — Comparison Blocks

4 animated blocks, each using GSAP ScrollTrigger for the bar animations. **Important:**

- Block 4 ("Messbar weniger Reibung") shows a **performance index**, NOT raw friction values
- Higher bar = better lubrication. Values: Classic 95%, Graphit-Heißwachs 72%, Kettenöl 18%
- This is intentionally inverted from friction coefficient (μ). Do NOT change back to "percentage of oil" baseline.

### `tools.tsx` — Five Calculators

All tools are **live-updating** — no "Calculate" button. Results update instantly on slider/toggle changes.

| Tool | Component | Key output |
|---|---|---|
| Rewax interval | `RewaxCalculator` | km until next rewax + weeks estimate |
| Chain compatibility | `CompatibilityCheck` | Filtered chain list from `compatibilityMatrix` |
| Wax stock | `WaxStockCalculator` | g/month consumption, recommended pack size |
| Cost savings | `CostSavingsCalculator` | Animated bars: wax vs oil cost per year |
| Rotation planner | `RotationPlanner` | Animated SVG cycle diagram + interval stats |

The `RevealSlot` wrapper component handles staggered scroll-reveal for the tool grid (5 cards, 90ms stagger).

---

## Language System

```tsx
const { t, lang, setLang } = useLanguage();

// t is the full translation object from i18n.ts
t.about.title          // "Über Waxcelerate"
t.tools.rewax.calculate // "Berechnen" (kept in i18n but no longer used as button label)

// lang is 'de' | 'en'
// Inline ternaries for short strings not in i18n:
lang === 'de' ? 'Seit' : 'Since'
```

The `LanguageProvider` wraps the whole app in `main.tsx`. Language is persisted in `localStorage`.

---

## Routing

```
/                   → App.tsx (all sections, single page)
/produkt/:id        → ProductDetailPage.tsx
```

React Router DOM v6. `<BrowserRouter>` in `main.tsx`. The product `id` comes from `Product.id` in data.ts. `getProductById(id)` fetches the full product object.

---

## Running the project

```bash
# Install dependencies (only needed once)
npm install

# Dev server (hot-reload)
npm run dev -- --port 5174
# → http://localhost:5174

# Type-check without building
npx tsc --noEmit

# Production build → dist/
npm run build
```

**macOS app launcher:** Double-click `/Applications/Waxcelerate.app` — this starts the dev server in Terminal and opens the browser. If Cursor is installed, it also opens the project in Cursor automatically.

---

## Common pitfalls

1. **Hook rules**: `useScrollReveal` and `useTilt` return refs — never call them inside `.map()`. Use a wrapper component (`RevealSlot`, or similar) that calls the hook at the top level.

2. **Image cropping**: Wax product images need `imagePosition` set in `data.ts` per product. Default is `center 55%`. Chain images are generally fine with `center center`.

3. **eBay vs detail page**: Wax cards → `/produkt/:id`. Chain cards → `ebayUrl` directly. Don't mix these up.

4. **`e.stopPropagation()`**: The inner eBay CTA inside a `<Link>` wrapper MUST call `stopPropagation()` to prevent double navigation.

5. **Performance index bars**: The `why-wax.tsx` Block 4 bars represent lubrication efficiency (inverted friction coefficient), not friction magnitude. Classic = 95% is GOOD (lowest friction). Do not revert.

6. **Translation keys in i18n.ts**: Some keys like `tools.rewax.calculate` exist but are no longer used in buttons. Don't delete them unless you're sure — they might be referenced elsewhere or planned for reuse.

---

## Pending / ideas for future work

- [ ] Contact form submit handler (currently renders but does nothing)
- [ ] Real product images from Luca's eBay store (replace eBay CDN URLs with hosted versions)
- [ ] `use-cart.ts` and `use-chain-tracker.ts` hooks exist but aren't wired into the UI yet
- [ ] SEO: add `<meta>` tags, `og:image`, structured data for products
- [ ] Mobile nav: hamburger menu for small screens
- [ ] Pro wax interval bar in `why-wax.tsx` Block 3 (the "Topup" bar is at 100% which looks wrong — should be milestone dots instead)
- [ ] Push to production hosting (Vercel/Netlify recommended — zero config with Vite)
