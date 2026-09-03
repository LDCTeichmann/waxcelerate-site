// ── Versand ──────────────────────────────────────────────────────────────
// Deutsche-Post-Brieftarife 2026, von Luca bestätigt (27.07.2026).
// Preise ändern? Nur diese beiden Blöcke anfassen, sonst nichts.
export type ShippingClass = 'grossbrief' | 'maxibrief';

export const shipping = {
  grossbrief: { cents: 180, maxGrams:  500, label: 'Großbrief' },
  maxibrief:  { cents: 290, maxGrams: 1000, label: 'Maxibrief' },
  paket:      { cents: 490,                 label: 'Paket'     },
  freeFromCents: 5000,   // ab 50 € versandkostenfrei
} as const;

// ── Social Proof ─────────────────────────────────────────────────────────
// Manuell von Luca gepflegt, wenn eBay-Bewertungen/Verkäufe wachsen. Keine
// Herleitung aus dem unitsSold-Feld der einzelnen Produkte möglich: das Feld
// ist nur für 4 von 12 Produkten gepflegt und deckt nicht den Gesamtverkauf
// ab. Einzige Quelle für Zahlen, die an mehreren Stellen der Seite auftauchen
// (Reviews-Sektion, Trust-Strip) — sonst laufen zwei von Hand gepflegte
// Kopien irgendwann auseinander. "Über 500 verkaufte Einheiten" aus
// 30_claims_language.md ist ein Formulierungsmuster, keine feste Zahl —
// diese Datei führt den tatsächlichen aktuellen Stand.
export const trustStats = {
  reviews: '200+',
  // Hub Notion „All Sales", 19.08.2026: GET /inventory → Summe units_sold.
  // 416 erfüllte Stück. 3 stornierte und 2 offene nicht mitgezählt.
  // Nicht die Bestellzahl (385) — die Trust-Zeile sagt „Einheiten".
  sold: 416,
  negative: 0,
} as const;

export interface Product {
  id: string;
  // 'bundle' is for starterSetBundleProducts below only — never added to the
  // `products` array itself, so it never appears in the sitemap, merchant
  // feed, or llms.txt generators (all iterate `products` directly).
  category: 'wax' | 'chain' | 'bundle';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  ebayUrl: string;
  /**
   * Manual out-of-stock. Keep in sync with Hub `inventory.json` current_stock
   * for that SKU (YBN S12S → chain-ybn12). No live Hub sync — flip this and
   * rerun `npx tsx scripts/generate-merchant-feed.mjs` when stock returns.
   */
  soldOut?: boolean;
  /** Stripe Price ID — set after creating products in Stripe Dashboard → Products → copy price_xxx */
  stripePriceId?: string;
  badge?: string;
  badgeEn?: string;
  // Enriched fields
  variant?: 'classic' | 'pro';
  weight?: string;
  applications?: string;
  formula?: string[];
  formulaEn?: string[];
  highlights?: string[];
  highlightsEn?: string[];
  intervalDry?: string;
  intervalWet?: string;
  intervalTopup?: string;
  bestFor?: string[];
  bestForEn?: string[];
  compatibility?: string;
  specs?: Record<string, string>;
  /** Shipped weight including packaging, in grams — determines shipping tier via shippingFor() */
  weightGrams: number;
  /** Deutsche-Post-Brieftarif class. A wax block can be under 500g and still need
   *  'maxibrief' — it's thicker than the Großbrief's 2cm limit, not heavier than its 500g one. */
  shippingClass: ShippingClass;
  // Chain-specific fields
  chainBrand?: string;
  chainModel?: string;
  chainLinks?: string;
  chainSpeed?: string;
  unitsSold?: number;
  reviewCount?: number;
  // Image display
  imagePosition?: string;
  // Gallery — additional images shown in thumbnail strip on the detail page
  images?: string[];
  // Optional extra gallery slide (product detail page only) showing the
  // actual dip-wax process as a short muted/looping clip. Deliberately a
  // separate field from `images` rather than folding it in there — `images`
  // is consumed as plain image URLs by 9+ components and by the build-time
  // schema.org/sitemap/Merchant-feed scripts, none of which know what to do
  // with a video URL. No product sets this yet; it's schema-only until a
  // real clip exists.
  videoSlide?: { src: string; poster: string };
}

export const products: Product[] = [
  // ── WAX PRODUCTS ──────────────────────────────────────────────
  {
    id: 'wax-500',
    category: 'wax',
    variant: 'classic',
    weight: '500g',
    weightGrams: 600, // estimate: 500g block + packaging, not measured
    shippingClass: 'maxibrief',
    applications: '20–32',
    title: 'Kettenwachs 500g — Classic',
    titleEn: 'Chain Wax 500g — Classic',
    description: 'Der Einstieg — und für die meisten der einzige Block, den sie je brauchen. Sauberer Antrieb, kein Nachschmieren, kein Dreck. Ideal für Frühling bis Herbst.',
    descriptionEn: 'The starting point — and for most riders, the only block they\'ll ever need. Clean drivetrain, no re-lubing, no grime. Perfect from spring through autumn.',
    price: 29.95,
    image: '/images/products/classic/classic-4.webp',
    imagePosition: 'center 52%',
    images: [
      '/images/products/classic/classic-6.webp',
      '/images/products/classic/classic-1.webp',
      '/images/products/classic/classic-2.webp',
      '/images/products/classic/classic-5.webp',
      '/images/products/classic/classic-3.webp',
    ],
    ebayUrl: 'https://www.ebay.de/itm/395811184583',
    unitsSold: 188,
    reviewCount: 52,
    badge: 'Bestseller',
    badgeEn: 'Bestseller',
    formula: ['Vollraffiniertes Paraffinwachs', 'PTFE < 1 µm', 'Stearinsäurederivat'],
    formulaEn: ['Fully refined paraffin wax', 'PTFE < 1 µm', 'Stearic acid derivative'],
    highlights: [
      'Trocken & sauber — kein Ölfilm, kein Dreck an Schaltwerk und Kassette',
      '2–3× längere Kettenlaufzeit gegenüber Öl',
      '20–32 Anwendungen pro 500g Block',
      'Sofort einsatzbereit — keine Einfahrzeit',
    ],
    highlightsEn: [
      'Dry & clean — no oil film, no grime on derailleur or cassette',
      '2–3× longer chain life vs. oil',
      '20–32 applications per 500g block',
      'Ready to ride instantly — no break-in needed',
    ],
    intervalDry: '250–450 km',
    intervalWet: '150–250 km',
    bestFor: ['Sommer & Trockenheit', 'Einstieg ins Heißwachsen', 'Regelmäßiges Wachsen'],
    bestForEn: ['Summer & dry conditions', 'Getting started with hot wax', 'Regular waxing routine'],
    compatibility: '9/10/11/12-fach',
    specs: {
      Gewicht: '500g',
      Zusammensetzung: 'Paraffin + PTFE',
      Anwendungen: '20–32',
      Verarbeitung: '80–90°C',
      Kompatibilität: '9/10/11/12-fach',
    },
  },
  {
    id: 'wax-300',
    category: 'wax',
    variant: 'classic',
    weight: '300g',
    weightGrams: 380, // estimate: 300g block + packaging, not measured
    shippingClass: 'maxibrief',
    applications: '10–15',
    title: 'Kettenwachs 300g — Classic',
    titleEn: 'Chain Wax 300g — Classic',
    description: 'Gleiche Formel wie der 500g-Block — nur kleiner. Perfekt zum Ausprobieren, als Reiseblock oder wenn du selten wächst.',
    descriptionEn: 'Same formula as the 500g block — just smaller. Perfect for trying it out, travelling light, or infrequent waxers.',
    price: 22.95,
    image: '/images/products/classic/classic-4.webp',
    imagePosition: 'center 52%',
    images: [
      '/images/products/classic/classic-6.webp',
      '/images/products/classic/classic-1.webp',
      '/images/products/classic/classic-2.webp',
      '/images/products/classic/classic-5.webp',
      '/images/products/classic/classic-3.webp',
    ],
    ebayUrl: 'https://www.ebay.de/itm/395811183957',
    unitsSold: 65,
    reviewCount: 26,
    badge: 'Kompakt',
    badgeEn: 'Compact',
    formula: ['Vollraffiniertes Paraffinwachs', 'PTFE < 1 µm', 'Stearinsäurederivat'],
    formulaEn: ['Fully refined paraffin wax', 'PTFE < 1 µm', 'Stearic acid derivative'],
    highlights: [
      'Identische Classic-Formel wie im 500g Block',
      '10–15 Anwendungen — reicht ca. 6 Monate bei 2 Fahrten/Woche',
      'Ideal zum Ausprobieren oder als Reise-Block',
      'Sofort einsatzbereit — keine Einfahrzeit',
    ],
    highlightsEn: [
      'Identical Classic formula to the 500g block',
      '10–15 applications — lasts ~6 months at 2 rides/week',
      'Ideal for trying hot wax or as a travel block',
      'Ready to ride instantly — no break-in needed',
    ],
    intervalDry: '250–450 km',
    intervalWet: '150–250 km',
    bestFor: ['Einstieg', 'Gelegentliches Fahren', 'Unterwegs / Reise'],
    bestForEn: ['Getting started', 'Occasional riding', 'Travel / on the go'],
    compatibility: '9/10/11/12-fach',
    specs: {
      Gewicht: '300g',
      Zusammensetzung: 'Paraffin + PTFE',
      Anwendungen: '10–15',
      Verarbeitung: '80–90°C',
      Kompatibilität: '9/10/11/12-fach',
    },
  },
  {
    id: 'wax-500-mos2',
    category: 'wax',
    variant: 'pro',
    weight: '500g',
    weightGrams: 600, // estimate: 500g block + packaging, not measured
    shippingClass: 'maxibrief',
    applications: '20–32',
    title: 'Kettenwachs 500g — Pro',
    titleEn: 'Chain Wax 500g — Pro',
    description: 'Für Herbst, Winter und nasse Ausfahrten. MoS₂ bildet einen festeren Transferfilm — längere Intervalle, weniger Rost, flexibel bis −8 °C.',
    descriptionEn: 'For autumn, winter and wet rides. MoS₂ builds a harder transfer film — longer intervals, less rust, functional down to −8 °C.',
    price: 34.95,
    image: '/images/products/pro/pro-3.webp',
    imagePosition: 'center 45%',
    images: [
      '/images/products/pro/pro-5.webp',
      '/images/products/pro/pro-1.webp',
      '/images/products/pro/pro-4.webp',
      '/images/products/pro/pro-2.webp',
      '/images/products/pro/pro-6.webp',
    ],
    ebayUrl: 'https://www.ebay.de/itm/396468036330',
    unitsSold: 64,
    reviewCount: 14,
    badge: 'Empfohlen',
    badgeEn: 'Recommended',
    formula: [
      'Vollraffiniertes Paraffinwachs',
      'Synthetisches Hartwachs',
      'Amorphe Wachskomponente',
      'MoS₂ < 5 µm',
      'Phenolisches Antioxidans',
    ],
    formulaEn: [
      'Fully refined paraffin wax',
      'Synthetic hard wax',
      'Amorphous wax component',
      'MoS₂ < 5 µm',
      'Phenolic antioxidant',
    ],
    highlights: [
      'Besser im Herbst & Winter — längere Intervalle, deutlich weniger Rost',
      'Reibungskoeffizient 0,03–0,06',
      'Reduzierte Rostneigung dank hydrophober Matrix',
      'Kaum Beeinträchtigungen bei Frost bis ca. −8°C',
    ],
    highlightsEn: [
      'Better in autumn & winter — longer intervals, significantly less rust',
      'Friction coefficient 0.03–0.06',
      'Reduced rust tendency via hydrophobic matrix',
      'Minimal performance impact down to approx. −8°C',
    ],
    intervalDry: '300–550 km',
    intervalWet: '150–300 km',
    intervalTopup: 'bis 1.200 km',
    bestFor: ['Ganzjahresbetrieb', '3-Ketten-Rotation', 'Herbst & Winter', 'Längere Intervalle'],
    bestForEn: ['Year-round use', '3-chain rotation', 'Autumn & Winter', 'Longer intervals'],
    compatibility: '9/10/11/12-fach',
    specs: {
      Gewicht: '500g',
      Zusammensetzung: 'Paraffin + MoS₂',
      Anwendungen: '20–32',
      Verarbeitung: '80–90°C',
      Kompatibilität: '9/10/11/12-fach',
    },
  },
  {
    id: 'wax-300-mos2',
    category: 'wax',
    variant: 'pro',
    weight: '300g',
    weightGrams: 380, // estimate: 300g block + packaging, not measured
    shippingClass: 'maxibrief',
    applications: '10–15',
    title: 'Kettenwachs 300g — Pro',
    titleEn: 'Chain Wax 300g — Pro',
    description: 'Pro-Formel kompakt — für Fahrer, die zwischen Sommer und Winter die Formel wechseln, oder als Winterblock zum Mitnehmen.',
    descriptionEn: 'Pro formula compact — for riders who switch between summer and winter formulas, or as a portable winter block.',
    price: 26.95,
    image: '/images/products/pro/pro-3.webp',
    imagePosition: 'center 45%',
    images: [
      '/images/products/pro/pro-5.webp',
      '/images/products/pro/pro-1.webp',
      '/images/products/pro/pro-4.webp',
      '/images/products/pro/pro-2.webp',
      '/images/products/pro/pro-6.webp',
    ],
    ebayUrl: 'https://www.ebay.de/itm/397861543533',
    unitsSold: 17,
    reviewCount: 6,
    badge: 'Pro',
    badgeEn: 'Pro',
    formula: [
      'Vollraffiniertes Paraffinwachs',
      'Synthetisches Hartwachs',
      'Amorphe Wachskomponente',
      'MoS₂ < 5 µm',
      'Phenolisches Antioxidans',
    ],
    formulaEn: [
      'Fully refined paraffin wax',
      'Synthetic hard wax',
      'Amorphous wax component',
      'MoS₂ < 5 µm',
      'Phenolic antioxidant',
    ],
    highlights: [
      'Besser im Herbst & Winter — gleiche Pro-Formel wie 500g',
      '10–15 Anwendungen pro Block',
      'Ganzjährig einsetzbar — etwas robuster als Classic',
      'Reduzierte Rostneigung & Oxidationsschutz',
    ],
    highlightsEn: [
      'Better in autumn & winter — same Pro formula as 500g',
      '10–15 applications per block',
      'Year-round use — slightly more robust than Classic',
      'Reduced rust tendency & oxidation protection',
    ],
    intervalDry: '300–550 km',
    intervalWet: '150–300 km',
    intervalTopup: 'bis 1.200 km',
    bestFor: ['Einstieg in Pro', 'Ganzjahresbetrieb', 'Herbst & Winter'],
    bestForEn: ['Starting with Pro', 'Year-round use', 'Autumn & Winter'],
    compatibility: '9/10/11/12-fach',
    specs: {
      Gewicht: '300g',
      Zusammensetzung: 'Paraffin + MoS₂',
      Anwendungen: '10–15',
      Verarbeitung: '80–90°C',
      Kompatibilität: '9/10/11/12-fach',
    },
  },

  // ── PRE-WAXED CHAINS — 11-SPEED ───────────────────────────────
  {
    id: 'chain-hg701',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'Shimano Ultegra HG701 11-fach — vorgewachst',
    titleEn: 'Shimano Ultegra HG701 11-speed — pre-waxed',
    description: 'Shimano CN-HG701, 116 Glieder, 11-fach (Ultegra / XT / GRX / 105). Vollständig entfettet und mit MoS₂-Transferfilm vorgewachst. Kettenschloss liegt bei.',
    descriptionEn: 'Shimano CN-HG701, 116 links, 11-speed (Ultegra / XT / GRX / 105). Fully degreased and pre-waxed with MoS₂ transfer film. Quick-link included.',
    price: 44.90,
    // Local photo (own shoot, CN-HG701 stamp verified legible on the plate)
    // — was hotlinked to i.ebayimg.com, which breaks the moment that listing
    // ends. See raw-image-library/products/chains/11 Chain.jpeg for the source.
    image: '/images/products/chains/hg701.webp',
    ebayUrl: 'https://www.ebay.de/itm/395811182346',
    compatibility: 'Shimano 11-fach · Ultegra R8000 · XT M8000 · GRX RX810 · 105 R7000',
    specs: { Gänge: '11-fach', Kompatibilität: 'Shimano (Ultegra / XT / GRX / 105)', 'Verbinder': 'Quick-Link (dabei)' },
    chainBrand: 'Shimano',
    chainModel: 'CN-HG701',
    chainLinks: '116 Glieder',
    chainSpeed: '11-fach',
  },
  {
    id: 'chain-ybn11',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'YBN 11S 11-fach — vorgewachst',
    titleEn: 'YBN 11S 11-speed — pre-waxed',
    description: 'YBN S11 / 11S, 116 Glieder, 11-fach — universal für Shimano, SRAM, Campagnolo und KMC. Vollständig entfettet und mit MoS₂-Transferfilm vorgewachst. Kettenschloss liegt bei.',
    descriptionEn: 'YBN S11 / 11S, 116 links, 11-speed — universal for Shimano, SRAM, Campagnolo and KMC. Fully degreased and pre-waxed with MoS₂ transfer film. Quick-link included.',
    price: 34.95,
    // Local photo (own shoot, "YBN" + "11-SPEED" stamps verified legible) —
    // was hotlinked to i.ebayimg.com. See
    // raw-image-library/products/chains/12 Chain.JPG for the source.
    image: '/images/products/chains/ybn11.webp',
    ebayUrl: 'https://www.ebay.de/itm/395811182725',
    compatibility: 'Shimano 11-fach · SRAM 11-fach · Campagnolo 11-fach',
    specs: { Gänge: '11-fach', Kompatibilität: 'Shimano / SRAM / Campa', 'Verbinder': 'Quick-Link (dabei)' },
    badge: 'Beste Wahl',
    badgeEn: 'Best Value',
    chainBrand: 'YBN',
    chainModel: 'S11 / 11S',
    chainLinks: '116 Glieder',
    chainSpeed: '11-fach',
  },
  {
    id: 'chain-force',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain (256g) + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'SRAM Force PC-1170 11-fach — vorgewachst',
    titleEn: 'SRAM Force PC-1170 11-speed — pre-waxed',
    description: 'SRAM Force PC-1170, 114 Glieder, 11-fach. Hollow-Pin-Technologie, 256 g. Vollständig entfettet und vorgewachst. PowerLock® Kettenschloss liegt bei.',
    descriptionEn: 'SRAM Force PC-1170, 114 links, 11-speed. Hollow-pin technology, 256 g. Fully degreased and pre-waxed. PowerLock® connector included.',
    price: 39.95,
    image: 'https://i.ebayimg.com/images/g/k8MAAeSwUj5otqbb/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/397016815583',
    compatibility: 'SRAM 11-fach · Shimano 11-fach',
    specs: { Gänge: '11-fach', Kompatibilität: 'SRAM / Shimano', 'Verbinder': 'PowerLock® (dabei)' },
    chainBrand: 'SRAM',
    chainModel: 'Force PC-1170',
    chainLinks: '114 Glieder',
    chainSpeed: '11-fach',
  },

  // ── PRE-WAXED CHAINS — 12-SPEED ───────────────────────────────
  {
    id: 'chain-m9100',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'Shimano Dura-Ace / XTR CN-M9100 12-fach — vorgewachst',
    titleEn: 'Shimano Dura-Ace / XTR CN-M9100 12-speed — pre-waxed',
    description: 'Shimano CN-M9100, 138 Glieder, 12-fach (Dura-Ace / XTR). Vollständig entfettet und mit MoS₂-Transferfilm vorgewachst. Kettenschloss liegt bei.',
    descriptionEn: 'Shimano CN-M9100, 138 links, 12-speed (Dura-Ace / XTR). Fully degreased and pre-waxed with MoS₂ transfer film. Quick-link included.',
    price: 69.95,
    image: 'https://i.ebayimg.com/images/g/8zEAAeSwiXJovq2H/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/396423346680',
    badge: 'Top-Modell',
    badgeEn: 'Top Model',
    compatibility: 'Shimano 12-fach Dura-Ace / XTR',
    specs: { Gänge: '12-fach', Kompatibilität: 'Dura-Ace · XTR', 'Verbinder': 'Quick-Link (dabei)' },
    chainBrand: 'Shimano',
    chainModel: 'Dura-Ace / XTR CN-M9100',
    chainLinks: '138 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-m8100',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'Shimano XT / Ultegra CN-M8100 12-fach — vorgewachst',
    titleEn: 'Shimano XT / Ultegra CN-M8100 12-speed — pre-waxed',
    description: 'Shimano CN-M8100, 116 Glieder, 12-fach (XT / Ultegra / GRX). Vollständig entfettet und mit MoS₂-Transferfilm vorgewachst. Kettenschloss liegt bei.',
    descriptionEn: 'Shimano CN-M8100, 116 links, 12-speed (XT / Ultegra / GRX). Fully degreased and pre-waxed with MoS₂ transfer film. Quick-link included.',
    price: 54.95,
    image: 'https://i.ebayimg.com/images/g/DBwAAeSws-totNAg/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/395811183017',
    compatibility: 'Shimano 12-fach XT / Ultegra / GRX',
    specs: { Gänge: '12-fach', Kompatibilität: 'XT · Ultegra · GRX', 'Verbinder': 'Quick-Link (dabei)' },
    chainBrand: 'Shimano',
    chainModel: 'XT / Ultegra CN-M8100',
    chainLinks: '116 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-m7100',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'Shimano SLX / 105 CN-M7100 12-fach — vorgewachst',
    titleEn: 'Shimano SLX / 105 CN-M7100 12-speed — pre-waxed',
    description: 'Shimano CN-M7100, 116 Glieder, 12-fach (SLX / 105). Vollständig entfettet und mit MoS₂-Transferfilm vorgewachst. Kettenschloss liegt bei.',
    descriptionEn: 'Shimano CN-M7100, 116 links, 12-speed (SLX / 105). Fully degreased and pre-waxed with MoS₂ transfer film. Quick-link included.',
    price: 44.95,
    image: 'https://i.ebayimg.com/images/g/fDUAAeSwf8Fp9KQB/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/397024138966',
    compatibility: 'Shimano 12-fach SLX / 105',
    specs: { Gänge: '12-fach', Kompatibilität: 'SLX · 105', 'Verbinder': 'Quick-Link (dabei)' },
    chainBrand: 'Shimano',
    chainModel: 'SLX / 105 CN-M7100',
    chainLinks: '116 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-nx',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'SRAM NX Eagle 12-fach — vorgewachst',
    titleEn: 'SRAM NX Eagle 12-speed — pre-waxed',
    description: 'SRAM NX Eagle, 118 Glieder, 12-fach MTB. Vollständig entfettet und vorgewachst. PowerLock® Kettenschloss liegt bei.',
    descriptionEn: 'SRAM NX Eagle, 118 links, 12-speed MTB. Fully degreased and pre-waxed. PowerLock® connector included.',
    price: 44.95,
    image: 'https://i.ebayimg.com/images/g/SA4AAeSwCiJpWmh6/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/397461956426',
    compatibility: 'SRAM 12-fach Eagle',
    specs: { Gänge: '12-fach', Kompatibilität: 'SRAM Eagle', 'Verbinder': 'PowerLock® (dabei)' },
    chainBrand: 'SRAM',
    chainModel: 'NX Eagle',
    chainLinks: '118 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-ybn12',
    category: 'chain',
    weightGrams: 300, // estimate: pre-waxed chain (259g) + packaging, not measured
    shippingClass: 'grossbrief',
    title: 'YBN S12S 12-fach — vorgewachst',
    titleEn: 'YBN S12S 12-speed — pre-waxed',
    description: 'YBN S12S, 116 Glieder, 12-fach, 259 g — universell für Shimano, SRAM und Campagnolo. Vollständig entfettet und vorgewachst. Quick-Link liegt bei.',
    descriptionEn: 'YBN S12S, 116 links, 12-speed, 259 g — universal for Shimano, SRAM and Campagnolo. Fully degreased and pre-waxed. Quick-link included.',
    price: 39.95,
    image: 'https://i.ebayimg.com/images/g/70kAAeSw25Novqt0/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/396163352266',
    compatibility: 'Shimano 12-fach · SRAM 12-fach · Campagnolo 12-fach',
    specs: { Gänge: '12-fach', Kompatibilität: 'Shimano / SRAM / Campa', 'Verbinder': 'Quick-Link (dabei)' },
    badge: 'Beste Wahl',
    badgeEn: 'Best Value',
    chainBrand: 'YBN',
    chainModel: 'S12S',
    chainLinks: '116 Glieder',
    chainSpeed: '12-fach',
    soldOut: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
    ?? starterSetBundleProducts.find((p) => p.id === id);
}

export const isSoldOut = (p: Pick<Product, 'soldOut'> | undefined): boolean =>
  !!p?.soldOut;

export function schemaAvailability(p: Pick<Product, 'soldOut'>): string {
  return isSoldOut(p)
    ? 'https://schema.org/OutOfStock'
    : 'https://schema.org/InStock';
}

/**
 * Native Stripe checkout is only offered once a product has a real `stripePriceId`
 * (otherwise /api/create-checkout 503s). Until the owner sets price IDs, eBay stays
 * the primary buy path. Gating the cart CTA on this keeps the UI free of dead-ends
 * and lets native checkout appear automatically the moment price IDs are added.
 */
export const canCheckout = (p: Pick<Product, 'stripePriceId'>): boolean =>
  typeof p.stripePriceId === 'string' && p.stripePriceId.length > 0;

/**
 * True once at least one product has a stripePriceId. Until then, the cart
 * (icon, drawer, persistence hint) stays hidden entirely — an always-empty
 * cart icon that opens a drawer with nothing addable to it is worse than no
 * cart icon at all. Flips on automatically the moment the first price ID is
 * added to a product below; nothing else needs to change.
 */
export const checkoutEnabled = products.some(canCheckout);

// The class eskaliert nur nach oben: erst das dickste Produkt im Warenkorb,
// dann das Gesamtgewicht. Ein Wachsblock ist auch bei 380 g ein Maxibrief,
// weil er die 2-cm-Grenze des Großbriefs reißt. Two chains (~600g total)
// escalate to maxibrief on weight alone even though each is a grossbrief
// individually — this reflects what physically happens to the parcel, not
// what's true of any single item in it.
// Used by both the cart drawer (display, before checkout) and
// /api/create-checkout (the actual charge) — the same import, not two
// copies of this logic.
export function shippingFor(items: { product: Pick<Product, 'weightGrams' | 'shippingClass'>; quantity: number }[]) {
  const grams = items.reduce((g, i) => g + i.product.weightGrams * i.quantity, 0);
  const needsMaxi = items.some(i => i.product.shippingClass === 'maxibrief');

  if (grams > shipping.maxibrief.maxGrams)               return shipping.paket;
  if (needsMaxi || grams > shipping.grossbrief.maxGrams) return shipping.maxibrief;
  return shipping.grossbrief;
}

/**
 * Kilometer je Wachsung, nach Wetter und Gelaende. Grundlage der Rechner unter
 * /rechner.
 *
 * Stand September 2026 auf die Empfehlungen von Zero Friction Cycling
 * umgestellt, der ausfuehrlichsten unabhaengigen Testreihe zu Kettenschmierung.
 * Vorher lagen die Werte deutlich hoeher (500 / 350 / 250 fuer Strasse).
 *
 * Die Herleitung:
 *  - Trockene Strasse 300 km ist der ZFC-Kernwert.
 *  - Nass und gemischt liegen laut ZFC bei 150 bis 200 km.
 *  - Fuer Gelaende nennt ZFC keine Kilometerzahl, sondern die Faustregel, dass
 *    man je Wachsung etwa die halbe Strecke schafft wie auf der Strasse.
 *    Gravel liegt entsprechend dazwischen.
 *
 * Bewusst konservativ: zu frueh gewachst kostet eine Stunde, zu spaet gefahren
 * kostet Kette und Kassette. Die Produktangaben in den Produktdaten
 * (intervalDry/intervalWet) nennen weiterhin Spannen, deren unteres Ende diese
 * Werte enthaelt — hier steht die Empfehlung, dort das Moegliche.
 */
export const waxIntervals: Record<string, Record<string, number>> = {
  trocken:  { strasse: 300, gravel: 200, mtb: 150 },
  gemischt: { strasse: 200, gravel: 150, mtb: 120 },
  nass:     { strasse: 150, gravel: 110, mtb:  80 },
};

export const compatibilityMatrix: Record<string, Record<string, string[]>> = {
  shimano: {
    '11': ['chain-hg701', 'chain-ybn11'],
    '12': ['chain-m9100', 'chain-m8100', 'chain-m7100', 'chain-ybn12'],
  },
  sram: {
    '11': ['chain-force', 'chain-ybn11'],
    '12': ['chain-nx', 'chain-ybn12'],
  },
  campagnolo: {
    '11': ['chain-ybn11'],
    '12': ['chain-ybn12'],
  },
};

// ─── Wax vs. Oil head-to-head — single source for landing + science page ──────
// Used by the Wax⇄Oil toggle (why-wax.tsx) and the science page problem act.
// ─── Zubehoer ────────────────────────────────────────────────────────────────
// Bewusst kein `Product`: Zubehoer hat keine Wachsintervalle, keine
// Kompatibilitaetsliste und keine Bewertungen, und es soll auch nicht in den
// Produktfiltern auftauchen. Ein eigener, schlanker Typ ist ehrlicher als ein
// Product mit einem Dutzend leerer Felder.
export interface Accessory {
  id: string;
  /** URL-Slug für /zubehoer/:slug — lesbarer als die interne id. */
  slug: string;
  title: string;
  titleEn: string;
  price: number;
  description: string;
  descriptionEn: string;
  /** Stripe Price ID — nach Anlegen im Dashboard eintragen */
  stripePriceId?: string;
  /** eBay-Listing-URL für den Einzelkauf — bis Luca das Listing anlegt, bleibt
   *  das Feld leer und die Detailseite zeigt "Demnächst auf eBay" statt eines
   *  toten Kaufen-Buttons. Genau das gleiche Aktivierungsmuster wie
   *  stripePriceId/canCheckout oben: sobald der echte Wert eingetragen wird,
   *  erscheint der Kaufen-Button automatisch, ohne dass hier sonst etwas
   *  geändert werden muss. */
  ebayUrl?: string;
  weightGrams: number;
  shippingClass: ShippingClass;
  image: string;
  images?: string[];
  /** Erste zwei Einträge aus `specs` werden auf der Detailseite als große
   *  Kennzahlen-Chips direkt unter dem Preis gezeigt — deshalb müssen
   *  Gewicht/Maße/Menge in `specs` vorne stehen, nicht Material zuerst. */
  highlights?: string[];
  highlightsEn?: string[];
  specs?: Record<string, string>;
  /** Kurzer Absatz "So funktioniert's" auf der Detailseite. */
  howTo?: string;
  howToEn?: string;
}

export const accessories: Accessory[] = [
  {
    id: 'acc-wire',
    slug: 'aufhaengedraht',
    title: 'Aufhängedraht, 3 Stück',
    titleEn: 'Hanging wire, 3 pieces',
    price: 4.95,
    description: 'Steif genug, dass die Kette im Bad nicht kippt, dünn genug, dass kaum Wachs daran hängen bleibt.',
    descriptionEn: 'Stiff enough that the chain does not tip in the bath, thin enough that hardly any wax stays on it.',
    weightGrams: 40,
    shippingClass: 'grossbrief',
    image: '/images/products/tools/aufhaengedraht.webp',
    images: ['/images/products/tools/aufhaengedraht-2.webp'],
    highlights: [
      'Edelstahl — rostet nicht im Wachsbad',
      'Schraubverschluss statt Haken: die Kette hängt sicher, auch beim Umrühren',
    ],
    highlightsEn: [
      'Stainless steel — will not rust in the wax bath',
      'Screw clasp instead of a hook: the chain hangs securely, even while stirring',
    ],
    specs: {
      Menge: '3 Stück',
      Länge: 'ca. 55 cm je Draht',
      Material: 'Edelstahl',
      Verschluss: 'Schraubverschluss',
    },
    howTo: 'Kette einfädeln, Schraubverschluss zudrehen, Draht über den Rand des Wachstopfs hängen — fertig.',
    howToEn: 'Thread the chain on, screw the clasp shut, hang the wire over the edge of the wax pot — done.',
  },
  {
    id: 'acc-pliers',
    slug: 'quick-link-zange',
    title: 'Quick-Link-Zange',
    titleEn: 'Quick-link pliers',
    price: 4.95,
    description: 'Öffnet und schließt den Verschluss. Ohne sie wird das Abnehmen der Kette jedes Mal zur Geduldsprobe.',
    descriptionEn: 'Opens and closes the link. Without it, taking the chain off is a test of patience every time.',
    weightGrams: 40,
    shippingClass: 'maxibrief',
    image: '/images/products/tools/quick-link-zange.webp',
    images: ['/images/products/tools/quick-link-zange-2.webp'],
    highlights: [
      'Gehärteter Stahl, verformt sich nicht bei häufigem Gebrauch',
      'Rückholfeder — kein manuelles Nachstellen zwischen zwei Griffen',
    ],
    highlightsEn: [
      'Hardened steel, will not deform with frequent use',
      'Return spring — no manual resetting between squeezes',
    ],
    specs: {
      Gewicht: '40 g',
      Maße: '10 × 8 × 1 cm',
      Material: 'Gehärteter Stahl',
      Einsatz: 'Shimano · SRAM · KMC · YBN Quick-Links',
    },
    howTo: 'Zangenmaul auf beide Seiten des Quick-Links setzen und zusammendrücken, bis die Platten übereinandergleiten — die Rückholfeder öffnet die Zange danach von selbst wieder.',
    howToEn: 'Place the jaws on both sides of the quick-link and squeeze until the plates slide over each other — the return spring reopens the pliers on its own afterward.',
  },
];

export const getAccessoryBySlug = (slug: string): Accessory | undefined =>
  accessories.find((a) => a.slug === slug);

// ─── Starter-Set ─────────────────────────────────────────────────────────────
// Kein eigener Artikel, sondern eine Regel: ein Wachs plus eine Kette, dazu
// gehoeren Zange und Draht immer mit dazu. Deshalb steht hier nur der
// Rabattsatz und die Liste der Beilagen — die Preise kommen aus dem echten
// Katalog und koennen dadurch nie auseinanderlaufen.
//
// Angezeigt wird der Set-Preis und die Ersparnis in Euro, nicht der Prozentsatz.
// "Du sparst 11,80 EUR" ist eine Tatsache, "15 % Rabatt" ist eine Behauptung
// ueber den Normalpreis, und die will diese Marke nicht dauerhaft fuehren.
export const starterSet = {
  discountPct: 15,
  includedAccessoryIds: ['acc-pliers', 'acc-wire'] as const,
};

/** Set-Preis aus den gewaehlten Teilen. Immer hierueber rechnen, nie von Hand. */
export const starterSetPrice = (partsSum: number) =>
  Math.round(partsSum * (1 - starterSet.discountPct / 100) * 100) / 100;

// Zwei feste Kombinationen fuer alle, die nicht selbst konfigurieren wollen —
// die freie Konfiguration (StarterSetBuilder) bleibt daneben bestehen. Bewusst
// KEINE eigenen `products`-Eintraege (siehe Accessory-Kommentar oben, gleicher
// Grund): landen sonst unfiltriert in Sitemap, Merchant-Feed und llms.txt, wo
// jeweils ueber `products` iteriert wird, als eigenstaendig kaufbare Artikel,
// obwohl es nur Zusammenstellungen bestehender Produkte sind.
export interface StarterSetOption {
  id: string;
  waxId: string;
  chainId: string;
  taglineDe: string;
  taglineEn: string;
}

export const starterSetOptions: StarterSetOption[] = [
  {
    id: 'starter-classic',
    waxId: 'wax-500',
    chainId: 'chain-ybn11',
    taglineDe: 'Frühjahr bis Herbst · 11-fach universal',
    taglineEn: 'Spring to autumn · 11-speed universal',
  },
  {
    id: 'starter-pro',
    waxId: 'wax-500-mos2',
    chainId: 'chain-m8100',
    taglineDe: 'Ganzjahr, Winter, E-Bike · 12-fach',
    taglineEn: 'All year, winter, e-bike · 12-speed',
  },
];

// Product-shaped view of the two fixed bundles above, for the cart only:
// AddToCartButton/useCartStore work against the `Product` shape, and the
// shipping estimate in CartDrawer looks products up by id via
// getProductById() — both need something to find. Never spread into the
// `products` array itself (see the comment on StarterSetOption above).
export const starterSetBundleProducts: Product[] = starterSetOptions.map((opt) => {
  const wax = products.find((p) => p.id === opt.waxId)!;
  const chain = products.find((p) => p.id === opt.chainId)!;
  const extras = accessories.filter((a) =>
    (starterSet.includedAccessoryIds as readonly string[]).includes(a.id));
  const partsSum = wax.price + chain.price + extras.reduce((s, a) => s + a.price, 0);
  return {
    id: opt.id,
    category: 'bundle',
    title: `Starter-Set — ${wax.title} + ${chain.title}`,
    titleEn: `Starter set — ${wax.titleEn} + ${chain.titleEn}`,
    description: opt.taglineDe,
    descriptionEn: opt.taglineEn,
    price: starterSetPrice(partsSum),
    image: wax.image,
    ebayUrl: wax.ebayUrl,
    weightGrams: wax.weightGrams + chain.weightGrams + extras.reduce((s, a) => s + a.weightGrams, 0),
    // 'maxibrief' is the heaviest declared class a single Product can carry;
    // shippingFor() escalates to an actual 'paket' on its own once the real
    // combined weight demands it (see shippingFor below), same as it would
    // for any other heavy combination of real products in the same cart.
    shippingClass: 'maxibrief',
  };
});

// Mengenstaffel. Gilt ausschliesslich auf Kettenwachs, nie auf Ketten: eine
// Kette kauft man einmal pro Rad, ein Rabatt darauf verschenkt Marge ohne die
// Menge zu bewegen. Wachs dagegen ist Verbrauchsmaterial, und wer drei Bloecke
// nimmt, kauft ein Jahr im Voraus.
//
// Die 15 Prozent stehen bewusst weit hinten. Ein Rabatt, den fast jeder sofort
// bekommt, ist kein Rabatt mehr, sondern ein Preis mit schlechtem Gewissen.
export const waxTiers = [
  { qty: 2, pct: 5 },
  { qty: 3, pct: 10 },
  { qty: 5, pct: 15 },
] as const;

export const waxVsOil = {
  // Grenzreibungszahlen. `wax` ist der beste Wert der Pro-Spanne und stammt vom
  // MoS2-Feststofffilm, nicht vom fertigen Film jeder Linie — deshalb wird er
  // nie als nackte Einzelzahl fuer die Marke ausgegeben, sondern immer der
  // Spanne aus `frictionRanges` gegenuebergestellt. Oel liegt je nach
  // Additivierung zwischen 0,18 und 0,25.
  friction: { wax: 0.03, waxHi: 0.06, oil: 0.2 },
  // Antriebsverlust. Eine Version fuer die ganze Seite. Der untere Wert ist
  // frisch behandelt, der obere am Ende des Intervalls. `inputW` gehoert an
  // jede Nennung: eine Wattzahl ohne Eingangsleistung ist technisch bedeutungslos.
  watts: { wax: [2, 4], oil: [6, 10], inputW: [300, 400] },
  // Relative chain lifetime. Rendered as the RANGE, never as the top value
  // alone: the binding claim is "deutlich länger, oft 2 bis 3×". A bare "3×"
  // is the kind of rounding that costs more credibility than the number buys.
  life: { waxLo: 2, wax: 3, oil: 1 },
  cost: { savedEur: 70, pctLess: 46, km: 12000, oilEur: 151, waxEur: 81 },
} as const;

// Friction comparison ranges (performance bars — higher bar = better, never invert).
// pct = performance index (lower μ → higher bar). Mirrors the science FrictionBars.
export const frictionRanges = [
  { id: 'pro',     muLo: 0.03, muHi: 0.06, pct: 100, highlight: true  },
  { id: 'classic', muLo: 0.05, muHi: 0.07, pct: 80,  highlight: true  },
  { id: 'oil',     muLo: 0.18, muHi: 0.25, pct: 18,  highlight: false },
] as const;
