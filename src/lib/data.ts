export interface Product {
  id: string;
  category: 'wax' | 'chain';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  ebayUrl: string;
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
  // Chain-specific fields
  chainBrand?: string;
  chainModel?: string;
  chainLinks?: string;
  chainSpeed?: string;
  // Image display
  imagePosition?: string;
}

export const products: Product[] = [
  // ── WAX PRODUCTS ──────────────────────────────────────────────
  {
    id: 'wax-500',
    category: 'wax',
    variant: 'classic',
    weight: '500g',
    applications: '20–32',
    title: 'Kettenwachs 500g — Classic',
    titleEn: 'Chain Wax 500g — Classic',
    description: 'Standard-Wachs für trockene Bedingungen. Paraffinbasis mit PTFE-Additiv, Reibungskoeffizient 0,05–0,07. 20–32 Anwendungen pro Block.',
    descriptionEn: 'Standard wax for dry conditions. Paraffin base with PTFE additive, friction coefficient 0.05–0.07. 20–32 applications per block.',
    price: 29.95,
    image: 'https://i.ebayimg.com/images/g/w8UAAeSwXeVoMeE8/s-l500.jpg',
    imagePosition: '35% 72%',
    ebayUrl: 'https://www.ebay.de/itm/395811184583',
    badge: 'Bestseller',
    badgeEn: 'Bestseller',
    formula: ['Vollraffiniertes Paraffinwachs', 'PTFE < 1 µm', 'Stearinsäurederivat'],
    formulaEn: ['Fully refined paraffin wax', 'PTFE < 1 µm', 'Stearic acid derivative'],
    highlights: [
      'Trocken & sauber — kein Ölfilm, kein Dreck',
      'Reibungskoeffizient 0,05–0,07',
      '20–32 Anwendungen pro 500g Block',
      '250–450 km Intervall (trocken)',
    ],
    highlightsEn: [
      'Dry & clean — no oil film, no grime',
      'Friction coefficient 0.05–0.07',
      '20–32 applications per 500g block',
      '250–450 km interval (dry)',
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
    applications: '10–15',
    title: 'Kettenwachs 300g — Classic',
    titleEn: 'Chain Wax 300g — Classic',
    description: 'Kompaktformat — gleiche Classic-Qualität. Ideal für Einsteiger oder als Zweitblock für unterwegs. 10–15 Anwendungen.',
    descriptionEn: 'Compact format — same Classic quality. Ideal for beginners or as a second block on the go. 10–15 applications.',
    price: 22.95,
    image: 'https://i.ebayimg.com/images/g/tjoAAOSw43xoLlRz/s-l500.jpg',
    imagePosition: '35% 72%',
    ebayUrl: 'https://www.ebay.de/itm/395811183957',
    formula: ['Vollraffiniertes Paraffinwachs', 'PTFE < 1 µm', 'Stearinsäurederivat'],
    formulaEn: ['Fully refined paraffin wax', 'PTFE < 1 µm', 'Stearic acid derivative'],
    highlights: [
      'Identische Qualität wie 500g',
      '10–15 Anwendungen pro Block',
      'Gut als Einstieg oder Ergänzung',
      '250–450 km Intervall (trocken)',
    ],
    highlightsEn: [
      'Identical quality to 500g',
      '10–15 applications per block',
      'Great for beginners or as a supplement',
      '250–450 km interval (dry)',
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
    applications: '20–32',
    title: 'Kettenwachs 500g — Pro',
    titleEn: 'Chain Wax 500g — Pro',
    description: 'Ganzjahresvariante mit MoS₂-Transferfilm. Etwas robuster bei Nässe als Classic, reduzierte Rostneigung dank hydrophober Matrix. Reibungskoeffizient 0,03–0,06.',
    descriptionEn: 'All-season variant with MoS₂ transfer film. Slightly more robust in wet conditions than Classic, reduced rust tendency via hydrophobic matrix. Friction coefficient 0.03–0.06.',
    price: 34.95,
    image: 'https://i.ebayimg.com/images/g/L3sAAeSw6Ydp5qvx/s-l500.jpg',
    imagePosition: 'center 42%',
    ebayUrl: 'https://www.ebay.de/itm/396468036330',
    badge: 'Pro',
    badgeEn: 'Pro',
    formula: [
      'Vollraffiniertes Paraffinwachs',
      'Synthetisches Hartwachs',
      'Amorphe Wachskomponente',
      'MoS₂ < 5 µm',
      'PTFE < 1 µm',
      'Phenolisches Antioxidans',
    ],
    formulaEn: [
      'Fully refined paraffin wax',
      'Synthetic hard wax',
      'Amorphous wax component',
      'MoS₂ < 5 µm',
      'PTFE < 1 µm',
      'Phenolic antioxidant',
    ],
    highlights: [
      'Ganzjährig einsetzbar — hält länger als Classic bei Nässe',
      'Reibungskoeffizient 0,03–0,06',
      'Reduzierte Rostneigung dank hydrophober Matrix',
      'Kaum Beeinträchtigungen bei Frost bis ca. −8°C',
    ],
    highlightsEn: [
      'Year-round use — outlasts Classic in wet conditions',
      'Friction coefficient 0.03–0.06',
      'Reduced rust tendency via hydrophobic matrix',
      'Minimal performance impact down to approx. −8°C',
    ],
    intervalDry: '300–550 km',
    intervalWet: '150–300 km',
    intervalTopup: 'bis 1.200 km',
    bestFor: ['Ganzjahresbetrieb', '3-Ketten-Rotation', 'Herbst & leichter Regen', 'Längere Intervalle'],
    bestForEn: ['Year-round use', '3-chain rotation', 'Autumn & light rain', 'Longer intervals'],
    compatibility: '9/10/11/12-fach',
    specs: {
      Gewicht: '500g',
      Zusammensetzung: 'Paraffin + PTFE + MoS₂',
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
    applications: '10–15',
    title: 'Kettenwachs 300g — Pro',
    titleEn: 'Chain Wax 300g — Pro',
    description: 'Pro-Formel im Kompaktformat. MoS₂-Transferfilm, reduzierte Rostneigung, ganzjährig einsetzbar. 10–15 Anwendungen.',
    descriptionEn: 'Pro formula in compact format. MoS₂ transfer film, reduced rust tendency, suitable year-round. 10–15 applications.',
    price: 26.95,
    image: 'https://i.ebayimg.com/images/g/7eoAAeSwZeRp6ThD/s-l500.jpg',
    imagePosition: 'center 42%',
    ebayUrl: 'https://www.ebay.de/itm/397861543533',
    badge: 'Pro',
    badgeEn: 'Pro',
    formula: [
      'Vollraffiniertes Paraffinwachs',
      'Synthetisches Hartwachs',
      'Amorphe Wachskomponente',
      'MoS₂ < 5 µm',
      'PTFE < 1 µm',
      'Phenolisches Antioxidans',
    ],
    formulaEn: [
      'Fully refined paraffin wax',
      'Synthetic hard wax',
      'Amorphous wax component',
      'MoS₂ < 5 µm',
      'PTFE < 1 µm',
      'Phenolic antioxidant',
    ],
    highlights: [
      'Gleiche Pro-Formel wie 500g',
      '10–15 Anwendungen pro Block',
      'Ganzjährig einsetzbar — etwas robuster als Classic',
      'Reduzierte Rostneigung & Oxidationsschutz',
    ],
    highlightsEn: [
      'Same Pro formula as 500g',
      '10–15 applications per block',
      'Year-round use — slightly more robust than Classic',
      'Reduced rust tendency & oxidation protection',
    ],
    intervalDry: '300–550 km',
    intervalWet: '150–300 km',
    intervalTopup: 'bis 1.200 km',
    bestFor: ['Einstieg in Pro', 'Ganzjahresbetrieb', 'Herbst & leichter Regen'],
    bestForEn: ['Starting with Pro', 'Year-round use', 'Autumn & light rain'],
    compatibility: '9/10/11/12-fach',
    specs: {
      Gewicht: '300g',
      Zusammensetzung: 'Paraffin + PTFE + MoS₂',
      Anwendungen: '10–15',
      Verarbeitung: '80–90°C',
      Kompatibilität: '9/10/11/12-fach',
    },
  },

  // ── PRE-WAXED CHAINS — 11-SPEED ───────────────────────────────
  {
    id: 'chain-hg701',
    category: 'chain',
    title: 'Shimano Ultegra HG701 11-fach — vorgewachst',
    titleEn: 'Shimano Ultegra HG701 11-speed — pre-waxed',
    description: 'Shimano Ultegra HG701, vollständig entfettet und mit Heißwachs behandelt. Sofort einsatzbereit, Quick-Link dabei.',
    descriptionEn: 'Shimano Ultegra HG701, fully degreased and hot-waxed. Ready to use immediately, quick-link included.',
    price: 44.90,
    image: 'https://i.ebayimg.com/images/g/gWAAAeSwAaFp9na4/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/395811182346',
    badge: 'E-Bike',
    badgeEn: 'E-Bike',
    compatibility: 'Shimano 11-fach · SRAM 11-fach',
    specs: { Gänge: '11-fach', Kompatibilität: 'Shimano / SRAM', 'Quick-Link': 'dabei' },
    chainBrand: 'Shimano',
    chainModel: 'Ultegra HG701',
    chainLinks: '116 Glieder',
    chainSpeed: '11-fach',
  },
  {
    id: 'chain-ybn11',
    category: 'chain',
    title: 'YBN 11S 11-fach — vorgewachst',
    titleEn: 'YBN 11S 11-speed — pre-waxed',
    description: 'YBN 11-fach Kette, professionell entfettet und gewachst. Shimano/SRAM/Campagnolo-Kompatibilität zum fairen Preis.',
    descriptionEn: 'YBN 11-speed chain, professionally degreased and waxed. Shimano/SRAM/Campagnolo compatible at a fair price.',
    price: 34.95,
    image: 'https://i.ebayimg.com/images/g/ryYAAeSwxC5o08UA/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/395811182725',
    compatibility: 'Shimano 11-fach · SRAM 11-fach · Campagnolo 11-fach',
    specs: { Gänge: '11-fach', Kompatibilität: 'Shimano / SRAM / Campa', 'Quick-Link': 'dabei' },
    chainBrand: 'YBN',
    chainModel: '11S',
    chainLinks: '116 Glieder',
    chainSpeed: '11-fach',
  },
  {
    id: 'chain-force',
    category: 'chain',
    title: 'SRAM Force PC-1170 11-fach — vorgewachst',
    titleEn: 'SRAM Force PC-1170 11-speed — pre-waxed',
    description: 'SRAM Force Kette für Rennrad, Triathlon und Gravel. Vorgewachst und sofort einsatzbereit.',
    descriptionEn: 'SRAM Force chain for road, triathlon and gravel. Pre-waxed and ready to use.',
    price: 39.95,
    image: 'https://i.ebayimg.com/images/g/k8MAAeSwUj5otqbb/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/397016815583',
    compatibility: 'SRAM 11-fach · Shimano 11-fach',
    specs: { Gänge: '11-fach', Kompatibilität: 'SRAM / Shimano', 'Quick-Link': 'dabei' },
    chainBrand: 'SRAM',
    chainModel: 'Force PC-1170',
    chainLinks: '114 Glieder',
    chainSpeed: '11-fach',
  },

  // ── PRE-WAXED CHAINS — 12-SPEED ───────────────────────────────
  {
    id: 'chain-m9100',
    category: 'chain',
    title: 'Shimano Dura-Ace / XTR CN-M9100 12-fach — vorgewachst',
    titleEn: 'Shimano Dura-Ace / XTR CN-M9100 12-speed — pre-waxed',
    description: 'Premium-Kette von Shimano. CN-M9100 für Dura-Ace und XTR. Vollständig gewachst, sofort einsatzbereit.',
    descriptionEn: 'Premium chain from Shimano. CN-M9100 for Dura-Ace and XTR. Fully waxed, ready to use immediately.',
    price: 69.95,
    image: 'https://i.ebayimg.com/images/g/8zEAAeSwiXJovq2H/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/396423346680',
    badge: 'Top-Modell',
    badgeEn: 'Top Model',
    compatibility: 'Shimano 12-fach Dura-Ace / XTR',
    specs: { Gänge: '12-fach', Kompatibilität: 'Dura-Ace · XTR', 'Quick-Link': 'dabei' },
    chainBrand: 'Shimano',
    chainModel: 'Dura-Ace / XTR CN-M9100',
    chainLinks: '138 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-m8100',
    category: 'chain',
    title: 'Shimano XT / Ultegra CN-M8100 12-fach — vorgewachst',
    titleEn: 'Shimano XT / Ultegra CN-M8100 12-speed — pre-waxed',
    description: 'Shimano XT / Ultegra 12-fach. Professionell entfettet und gewachst. Ideal für MTB, E-Bike und GRX.',
    descriptionEn: 'Shimano XT / Ultegra 12-speed. Professionally degreased and waxed. Ideal for MTB, E-Bike and GRX.',
    price: 54.95,
    image: 'https://i.ebayimg.com/images/g/DBwAAeSws-totNAg/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/395811183017',
    compatibility: 'Shimano 12-fach XT / Ultegra / GRX',
    specs: { Gänge: '12-fach', Kompatibilität: 'XT · Ultegra · GRX', 'Quick-Link': 'dabei' },
    chainBrand: 'Shimano',
    chainModel: 'XT / Ultegra CN-M8100',
    chainLinks: '116 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-m7100',
    category: 'chain',
    title: 'Shimano SLX / 105 CN-M7100 12-fach — vorgewachst',
    titleEn: 'Shimano SLX / 105 CN-M7100 12-speed — pre-waxed',
    description: 'Shimano SLX / 105 12-fach. Vorgewachst mit Waxcelerate Pro-Wachs. Breite Kompatibilität.',
    descriptionEn: 'Shimano SLX / 105 12-speed. Pre-waxed with Waxcelerate Pro wax. Wide compatibility.',
    price: 42.95,
    image: 'https://i.ebayimg.com/images/g/fDUAAeSwf8Fp9KQB/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/397024138966',
    compatibility: 'Shimano 12-fach SLX / 105',
    specs: { Gänge: '12-fach', Kompatibilität: 'SLX · 105', 'Quick-Link': 'dabei' },
    chainBrand: 'Shimano',
    chainModel: 'SLX / 105 CN-M7100',
    chainLinks: '116 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-nx',
    category: 'chain',
    title: 'SRAM NX Eagle 12-fach — vorgewachst',
    titleEn: 'SRAM NX Eagle 12-speed — pre-waxed',
    description: 'SRAM NX Eagle 12-fach für MTB und E-Bike. Vollständig entfettet und gewachst.',
    descriptionEn: 'SRAM NX Eagle 12-speed for MTB and E-bike. Fully degreased and waxed.',
    price: 29.95,
    image: 'https://i.ebayimg.com/images/g/SA4AAeSwCiJpWmh6/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/397461956426',
    compatibility: 'SRAM 12-fach Eagle',
    specs: { Gänge: '12-fach', Kompatibilität: 'SRAM Eagle', 'Quick-Link': 'dabei' },
    chainBrand: 'SRAM',
    chainModel: 'NX Eagle',
    chainLinks: '118 Glieder',
    chainSpeed: '12-fach',
  },
  {
    id: 'chain-ybn12',
    category: 'chain',
    title: 'YBN S12S 12-fach — vorgewachst',
    titleEn: 'YBN S12S 12-speed — pre-waxed',
    description: 'YBN S12S 12-fach mit professioneller Wachsbehandlung. Breite Shimano/SRAM/Campagnolo-Kompatibilität.',
    descriptionEn: 'YBN S12S 12-speed with professional wax treatment. Wide Shimano/SRAM/Campagnolo compatibility.',
    price: 32.95,
    image: 'https://i.ebayimg.com/images/g/70kAAeSw25Novqt0/s-l500.webp',
    ebayUrl: 'https://www.ebay.de/itm/396163352266',
    compatibility: 'Shimano 12-fach · SRAM 12-fach · Campagnolo 12-fach',
    specs: { Gänge: '12-fach', Kompatibilität: 'Shimano / SRAM / Campa', 'Quick-Link': 'dabei' },
    chainBrand: 'YBN',
    chainModel: 'S12S',
    chainLinks: '116 Glieder',
    chainSpeed: '12-fach',
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export const waxIntervals: Record<string, Record<string, number>> = {
  trocken: { strasse: 500, gravel: 350, mtb: 250 },
  gemischt: { strasse: 350, gravel: 250, mtb: 180 },
  nass: { strasse: 250, gravel: 180, mtb: 120 },
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
