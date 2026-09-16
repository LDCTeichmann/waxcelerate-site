// ─── /starter-set — Texte, Schnellwahl, FAQ ─────────────────────────────────
// Eine Quelle für StarterSetPage.tsx UND scripts/generate-blog-html.mjs
// (Prerender), deshalb nur relative Importe mit .ts-Endung — Node lädt die
// Datei ohne Vite-Aliasse. Preise stehen hier nie: sie kommen aus data.ts
// (starterSetPriceFor / starterSetBundleProducts).
//
// v3 (16.09.2026): Luca — „Leute lesen nicht". Jede Aussage hat eine kurze
// Zeile; was länger ist, steht hinter einem Aufklapper.

import { products, starterSet, starterSetOptions } from '../../lib/data.ts';

export const PCT = starterSet.discountPct;

export const eur = (n: number, de = true) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// ── Wachs-Linien ────────────────────────────────────────────────────────────
export type WaxLine = 'classic' | 'pro';
export type WaxSize = '300' | '500';
export const WAX_IDS: Record<WaxLine, Record<WaxSize, string>> = {
  classic: { '300': 'wax-300', '500': 'wax-500' },
  pro: { '300': 'wax-300-mos2', '500': 'wax-500-mos2' },
};
export function waxLineOf(waxId: string): { line: WaxLine; size: WaxSize } {
  for (const line of ['classic', 'pro'] as const) {
    for (const size of ['300', '500'] as const) {
      if (WAX_IDS[line][size] === waxId) return { line, size };
    }
  }
  return { line: 'classic', size: '300' };
}

// ── Kombination ─────────────────────────────────────────────────────────────
export interface SetCombo { waxId: string; chainId: string | null }

/** Einstieg: das günstigste Set, Basis 300 g ohne Kette. */
export const DEFAULT_COMBO: SetCombo = { waxId: 'wax-300', chainId: null };
/** Wer auf „Mit Kette" schaltet und noch keine gewählt hat, bekommt diese. */
export const DEFAULT_CHAIN = 'chain-ybn11';

export function comboFromSetId(id: string | null): SetCombo | null {
  const opt = id ? starterSetOptions.find((o) => o.id === id) : undefined;
  return opt ? { waxId: opt.waxId, chainId: opt.chainId ?? null } : null;
}

// Schnellwahl über der Kaufbox: die drei festen Sets mit Kette.
export const QUICK_PICKS = [
  { id: 'starter-classic', de: 'Classic · 11-fach', en: 'Classic · 11-speed' },
  { id: 'starter-hg701', de: 'Rennrad', en: 'Road' },
  { id: 'starter-pro', de: 'Winter & E-Bike', en: 'Winter & e-bike' },
] as const;

export const shortChainName = (p: { chainBrand?: string; chainModel?: string; title: string }) =>
  p.chainBrand && p.chainModel ? `${p.chainBrand} ${p.chainModel}` : p.title.split(' — ')[0];

export function starterMeta(de: boolean) {
  return {
    title: de ? 'Starter-Set Kettenwachs | Waxcelerate' : 'Chain wax starter set | Waxcelerate',
    description: de
      ? `Wachs, Quick-Link-Zange und Aufhängedraht in einem Set, vorgewachste Kette optional dazu, bis zu ${PCT} Prozent unter der Summe der Einzelteile und versandkostenfrei. Alles, was für das erste Wachsen nötig ist.`
      : `Wax, quick-link pliers and hanging wire in one set, pre-waxed chain optional, up to ${PCT} percent below the sum of the parts and shipped free. Everything the first waxing needs.`,
  };
}

// ── Bildstrecke ─────────────────────────────────────────────────────────────
export const GALLERY = [
  { src: '/images/doors/starter-set.webp', de: 'Das Set', en: 'The set', factDe: 'Wachs · Zange · Draht', factEn: 'Wax · pliers · wire' },
  { src: '/images/blog/wax-blue-wire-chain-800.webp', de: 'Einhängen', en: 'Hang it', factDe: '3 Drähte', factEn: '3 wires' },
  { src: '/images/shelf/wax-classic-800.webp', de: 'Kettenwachs', en: 'Chain wax', factDe: '300 oder 500 g', factEn: '300 or 500 g' },
  { src: '/images/blog/chain-wax-kit-hills-800.webp', de: 'Ein Paket', en: 'One parcel', factDe: 'Versand kostenlos', factEn: 'Free shipping' },
] as const;

// ── Der erste Abend ─────────────────────────────────────────────────────────
// Nur die Basis-Teile: Zange, Draht, Wachs. Die Kette ist ein eigener Hinweis.
export const STEPS = [
  {
    n: '1', img: '/images/products/tools/quick-link-zange.webp', pos: '48% 58%',
    partDe: 'Zange', partEn: 'Pliers',
    titleDe: 'Kette öffnen', titleEn: 'Open the chain',
    moreDe: 'Das Kettenschloss geht von Hand kaum auf. Die Zange setzt an beiden Seiten an, ein Druck, und die Kette ist ab.',
    moreEn: 'The quick-link barely opens by hand. The pliers grip both sides, one squeeze, and the chain is off.',
  },
  {
    n: '2', img: '/images/products/tools/aufhaengedraht.webp', pos: '38% 50%',
    partDe: 'Draht', partEn: 'Wire',
    titleDe: 'Einhängen', titleEn: 'Hang it in',
    moreDe: 'Steif genug, dass die Kette im Bad nicht kippt. Danach kühlt sie am selben Draht ab. Drei Stück, falls du mehrere Ketten wachst.',
    moreEn: 'Stiff enough that the chain does not tip in the bath. It then cools on the same wire. Three of them, for several chains.',
  },
  {
    n: '3', img: '/images/shelf/wax-classic-800.webp', pos: '50% 50%',
    partDe: 'Wachs', partEn: 'Wax',
    titleDe: 'Wachsen', titleEn: 'Wax it',
    moreDe: '85 bis 90 °C, 10 bis 15 Minuten, bis keine Bläschen mehr aufsteigen. Abtropfen, aufhängen, montieren. Dazu brauchst du nur einen alten Topf und ein Thermometer.',
    moreEn: '85 to 90 °C, 10 to 15 minutes, until no more bubbles rise. Drip, hang, fit. All you add is an old pot and a thermometer.',
  },
] as const;

// ── FAQ ─────────────────────────────────────────────────────────────────────
// Kein Datum in den Antworten: der Text landet auch im statischen HTML und
// wäre dort nach einem Tag falsch. Das Lieferdatum steht live in der Kaufbox.
interface StarterFaqItem {
  q: string;
  a: string;
  link?: { to: string; labelDe: string; labelEn: string };
}

export function starterFaqItems(de: boolean): StarterFaqItem[] {
  const small = products.find((p) => p.id === 'wax-300');
  const big = products.find((p) => p.id === 'wax-500');
  const uses = small?.applications ?? '10–15';
  const usesBig = big?.applications ?? '20–32';
  return de ? [
    {
      q: 'Brauche ich die Kette dazu?',
      a: 'Nein. Das Basis-Set ist für deine eigene Kette. Die vorgewachste Kette lohnt sich, wenn deine noch geölt ist: dann entfällt das gründliche Entfetten.',
    },
    {
      q: 'Welche Kette passt zu meinem Rad?',
      a: 'Das hängt an Antrieb und Gangzahl. Wähle beides in der Kaufbox, dann bleiben nur passende Ketten übrig.',
      link: { to: '/ketten', labelDe: 'Alle Ketten im Detail', labelEn: 'All chains in detail' },
    },
    {
      q: '300 oder 500 g?',
      a: `300 g reichen für ${uses} Wachsgänge, gut für die erste Saison auf einer Kette. 500 g reichen für ${usesBig} und lohnen sich bei mehreren Ketten oder ganzjährigem Fahren.`,
    },
    {
      q: 'Was brauche ich zusätzlich?',
      a: 'Einen alten Topf und ein Küchenthermometer. Eine eigene, geölte Kette muss vorher gründlich entfettet werden.',
      link: { to: '/anleitung', labelDe: 'Zur Anleitung', labelEn: 'Step-by-step guide' },
    },
    {
      q: 'Was kostet der Versand?',
      a: 'Das Set kommt versandkostenfrei in einem Paket. Zange oder Draht einzeln kosten je 1,80 € Versand.',
    },
    {
      q: 'Kann ich das Set zurückgeben?',
      a: 'Ja, innerhalb von 14 Tagen, solange Wachs und Kette unbenutzt sind.',
      link: { to: '/widerruf', labelDe: 'Zum Widerrufsrecht', labelEn: 'Right of withdrawal' },
    },
  ] : [
    {
      q: 'Do I need the chain?',
      a: 'No. The basic set is for your own chain. The pre-waxed chain pays off if yours is still oiled: it saves the thorough degreasing.',
    },
    {
      q: 'Which chain fits my bike?',
      a: 'It depends on drivetrain and number of gears. Pick both in the buy box and only fitting chains remain.',
      link: { to: '/ketten', labelDe: 'Alle Ketten im Detail', labelEn: 'All chains in detail' },
    },
    {
      q: '300 or 500 g?',
      a: `300 g covers ${uses} waxings, a good first season on one chain. 500 g covers ${usesBig} and pays off with several chains or year-round riding.`,
    },
    {
      q: 'What else do I need?',
      a: 'An old pot and a kitchen thermometer. Your own oiled chain needs a thorough degrease first.',
      link: { to: '/anleitung', labelDe: 'Zur Anleitung', labelEn: 'Step-by-step guide' },
    },
    {
      q: 'What does shipping cost?',
      a: 'The set ships free in one parcel. Pliers or wire on their own cost 1.80 € shipping each.',
    },
    {
      q: 'Can I return the set?',
      a: 'Yes, within 14 days as long as the wax and chain are unused.',
      link: { to: '/widerruf', labelDe: 'Zum Widerrufsrecht', labelEn: 'Right of withdrawal' },
    },
  ];
}

export function starterFaqSchema(de: boolean) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: starterFaqItems(de).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
