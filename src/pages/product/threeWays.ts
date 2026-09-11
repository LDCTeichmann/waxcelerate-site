// "Drei Wege zur gewachsten Kette" — dieselben drei Karten auf jeder Wachs-
// Produktseite (siehe ProcessAndPaths.tsx). Eigene, JSX-freie Datei, damit
// scripts/generate-product-html.mjs (P1-2) denselben Text fuer den vorge-
// renderten Rumpf verwenden kann, ohne eine .tsx-Datei mit React-/lucide-
// react-Imports zu importieren — eine Quelle statt einer zweiten Kopie.
export const THREE_WAYS = [
  {
    titleDe: 'Selbst wachsen', titleEn: 'Wax it yourself',
    bodyDe: 'Topf, Draht, Isopropanol und dieses Wachs. Kein Spezialgerät nötig.',
    bodyEn: 'A pot, some wire, isopropanol and this wax. No special equipment needed.',
    to: '/blog/heisswachs-anleitung',
    ctaDe: 'Zur Anleitung', ctaEn: 'To the guide',
  },
  {
    titleDe: 'Starter-Set', titleEn: 'Starter set',
    bodyDe: 'Wachs zusammen mit dem, was beim ersten Mal sonst fehlt: Zange und Aufhängedraht.',
    bodyEn: 'Wax together with what is otherwise missing the first time: pliers and hanging wire.',
    to: '/starter-set',
    ctaDe: 'Set ansehen', ctaEn: 'View the set',
  },
  {
    titleDe: 'Einschicken', titleEn: 'Send it in',
    bodyDe: 'Kette am Quick-Link öffnen, einschicken, fahrbereit zurückbekommen. Reinigen musst du vorher nichts.',
    bodyEn: 'Open the chain at the quick link, send it in, get it back ready to ride. No cleaning needed first.',
    to: '/kette-wachsen-lassen',
    ctaDe: 'Wie das läuft', ctaEn: 'How it works',
  },
] as const;
