# Waxcelerate Website

Marketing- und Verkaufsseite für Waxcelerate — Heißwachs für Fahrradketten,
kleine Marke aus Stuttgart (Luca Teichmann). Live auf
[waxcelerate.de](https://waxcelerate.de).

Verkauft wird über eBay **und** einen eigenen Stripe-Checkout. Der Checkout ist
fertig gebaut, aber inaktiv: solange kein Produkt eine `stripePriceId` trägt,
fällt jeder Kauf-Button auf eBay zurück (`checkoutEnabled` in `src/lib/data.ts`).

## Schnellstart

```bash
npm install
npm run dev -- --port 5174
```

## Stack

- **React 19 + TypeScript**, strict
- **Vite 7** — Dev-Server auf Port 5174, Build nach `dist/`
- **Tailwind CSS v3** — hell, dunkel und ein `.noir`-Modus
- **React Router v7** — 18 Routen, u. a. `/produkt/:id`, `/blog/:slug`,
  `/wissenschaft`, `/kette-wachsen-lassen`, `/starter-set`
- **Vercel Serverless Functions** in `api/` — Stripe-Checkout, Bestand (Upstash
  Redis), Widerruf, Bestandsverwaltung
- **shadcn/ui** — nur der Slider
- **GSAP** — Scroll-Animationen

## Build

```bash
npm run build      # tsc -b, Generatoren, vite build, Vorrendern → dist/
npx tsc --noEmit   # nur Typprüfung
```

`npm run build` erzeugt zusätzlich `sitemap.xml`, `llms.txt`, den
Merchant-Feed und rendert Blog-, Produkt- und Startseiten statisch vor. Ohne
diesen Schritt sehen Crawler nur ein leeres `<div id="root">`. Details in
`AGENTS.md`.

## Für Agenten und neue Sessions

**Erst `PROJECT.md` lesen.** Das ist das Inhaltsverzeichnis: es sagt, welche
Datei in `docs/` zur jeweiligen Aufgabe gehört, welche Entscheidungen offen sind
und was zuletzt entschieden wurde. Danach `CLAUDE.md` für die Kurzregeln und
`AGENTS.md` für Deploy und die bekannten Fallen.

## Wichtige Dateien

| Datei | Zweck |
|---|---|
| `src/lib/data.ts` | Produktdaten, Preise, Intervalle — einzige Quelle |
| `src/lib/i18n.ts` | Alle deutschen und englischen Strings |
| `src/App.tsx` | Routen und Reihenfolge der Startseiten-Abschnitte |
| `src/sections/` | Ein Abschnitt je Datei |
| `api/` | Serverless Functions (Vercel) |
| `scripts/` | Sitemap, llms.txt, Merchant-Feed, Vorrendern |
