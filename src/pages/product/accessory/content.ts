// ─── Zubehörseiten — Bildstrecke, Kacheln, Fragen je Werkzeug ───────────────
// Produktdaten (Preis, Specs, Schritte) stehen in data.ts; hier nur, was die
// Seite zusätzlich zeigt. Schlüssel = Accessory.id.

export interface AccessoryPageCopy {
  gallery: { src: string; de: string; en: string; factDe: string; factEn: string; pos?: string }[];
  tiles: { v: string; vEn?: string; de: string; en: string }[];
  box: { de: string; en: string; subDe: string; subEn: string };
  faq: { qDe: string; qEn: string; aDe: string; aEn: string }[];
}

const shippingFaq = {
  qDe: 'Was kostet der Versand?',
  qEn: 'What does shipping cost?',
  aDe: 'Einzeln 1,80 €. Im Starter-Set ist der Versand kostenlos und das Set liegt bis zu 15 % unter der Summe der Einzelteile.',
  aEn: 'On its own 1.80 €. In the starter set shipping is free and the set costs up to 15 % less than the parts.',
};

export const ACCESSORY_PAGES: Record<string, AccessoryPageCopy> = {
  'acc-wire': {
    gallery: [
      // aufhaengedraht.webp (Draht auf dunklem Stein) ist als Titelbild zu
      // dunkel — auf dem Handy fast schwarz. aufhaengedraht-2.webp (Zange,
      // Wachsblock, Kette, helles Gegenlicht) zeigt das Produkt sofort klar.
      { src: '/images/products/tools/aufhaengedraht-2.webp', de: 'Aufhängedraht', en: 'Hanging wire', factDe: 'mit Wachs · Zange', factEn: 'with wax · pliers' },
      { src: '/images/blog/wax-blue-wire-chain-800.webp', de: 'Im Einsatz', en: 'In use', factDe: 'Kette eingefädelt', factEn: 'Chain threaded', pos: '80% 70%' },
      { src: '/images/products/tools/aufhaengedraht.webp', de: 'Nahaufnahme', en: 'Close-up', factDe: '3 Stück · Edelstahl', factEn: '3 pieces · steel', pos: '38% 50%' },
      { src: '/images/blog/chain-wax-kit-hills-800.webp', de: 'Aus Stuttgart', en: 'From Stuttgart', factDe: 'handverpackt', factEn: 'packed by hand' },
    ],
    tiles: [
      { v: '3 Stück', vEn: '3 pcs', de: 'Menge', en: 'Quantity' },
      { v: '~55 cm', de: 'je Draht', en: 'per wire' },
      { v: 'Edelstahl', vEn: 'Steel', de: 'rostfrei', en: 'rust-free' },
    ],
    box: { de: '3 Aufhängedrähte', en: '3 hanging wires', subDe: 'Edelstahl, je ca. 55 cm, mit Schraubverschluss', subEn: 'Stainless steel, ~55 cm each, screw clasp' },
    faq: [
      {
        qDe: 'Warum drei Stück?', qEn: 'Why three?',
        aDe: 'Damit du mehrere Ketten nacheinander wachsen und zum Abkühlen aufhängen kannst, ohne auf den ersten Draht zu warten.',
        aEn: 'So you can wax several chains one after another and hang them to cool without waiting for the first wire.',
      },
      {
        qDe: 'Rostet der Draht im Wachsbad?', qEn: 'Does the wire rust in the wax bath?',
        aDe: 'Nein, er ist aus Edelstahl. Und dünn genug, dass kaum Wachs daran hängen bleibt.',
        aEn: 'No, it is stainless steel. And thin enough that hardly any wax sticks to it.',
      },
      shippingFaq,
    ],
  },
  'acc-pliers': {
    gallery: [
      { src: '/images/products/tools/quick-link-zange.webp', de: 'Quick-Link-Zange', en: 'Quick-link pliers', factDe: 'gehärteter Stahl', factEn: 'hardened steel', pos: '48% 58%' },
      { src: '/images/products/tools/quick-link-zange-2.webp', de: 'Mit Rückholfeder', en: 'Return spring', factDe: 'öffnet von selbst', factEn: 'reopens itself', pos: '55% 50%' },
      { src: '/images/doors/starter-set-800.webp', de: 'Im Starter-Set', en: 'In the starter set', factDe: 'mit Wachs und Draht', factEn: 'with wax and wire' },
      { src: '/images/blog/chain-wax-kit-hills-800.webp', de: 'Aus Stuttgart', en: 'From Stuttgart', factDe: 'handverpackt', factEn: 'packed by hand' },
    ],
    tiles: [
      { v: '40 g', de: 'Gewicht', en: 'Weight' },
      { v: '10 × 8 cm', de: 'Maße', en: 'Size' },
      { v: '4 Marken', vEn: '4 brands', de: 'Quick-Links', en: 'quick-links' },
    ],
    box: { de: '1 Quick-Link-Zange', en: '1 quick-link pliers', subDe: 'Gehärteter Stahl, mit Rückholfeder', subEn: 'Hardened steel, with return spring' },
    faq: [
      {
        qDe: 'Passt die Zange zu meinem Kettenschloss?', qEn: 'Does it fit my quick-link?',
        aDe: 'Sie öffnet und schließt Quick-Links von Shimano, SRAM, KMC und YBN.',
        aEn: 'It opens and closes quick-links from Shimano, SRAM, KMC and YBN.',
      },
      {
        qDe: 'Geht es nicht auch ohne?', qEn: 'Can I do without?',
        aDe: 'Mit etwas Geduld und Fingerkraft manchmal. Beim Wachsen nimmst du die Kette aber jedes Mal ab, dann spart die Zange die Fummelei.',
        aEn: 'Sometimes, with patience and strong fingers. But waxing means taking the chain off every time, and the pliers save the fiddling.',
      },
      shippingFaq,
    ],
  },
};
