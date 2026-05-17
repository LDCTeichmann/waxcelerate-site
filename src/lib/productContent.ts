export interface StatCard {
  value: string;
  label: string;
  sub: string;
}

export interface ProcessStep {
  n: number;
  title: string;
  body: string;
}

export interface V9Bullet {
  title: string;
  body: string;
}

export interface RichContent {
  stats: StatCard[];
  compatTags: string[][];
  reviewCount: number;
  reviewCats: string;
  footerNote: string;
  // Wax products
  formulaDetails?: Array<{ name: string; detail: string }>;
  techNote?: { title: string; body: string };
  compHeaders?: string[];
  compRows?: Array<{ label: string; cols: string[]; winCol?: number; dimCols?: number[] }>;
  compFootnote?: string;
  costExample?: string;
  costNote?: string;
  oilCount?: string; oilLabel?: string;
  waxCount?: string; waxLabel?: string;
  oilItems?: Array<{ label: string; cost: string }>;
  waxItems?: Array<{ label: string; cost: string }>;
  oilTotal?: string; waxTotal?: string; savings?: string;
  // Chain products V9 (MoS₂)
  hook?: string;
  processSteps?: ProcessStep[];
  processNote?: string;
  v9Intro?: string;
  v9Bullets?: V9Bullet[];
  v9Note?: string;
  chainSpec?: Record<string, string>;
  chainCompRows?: Array<{ label: string; good: string; bad: string }>;
  // Chain products old format (PTFE)
  benefits?: string[];
  techData?: string[];
  proTip?: string;
}

const v9SharedProcessSteps: ProcessStep[] = [
  { n: 1, title: 'Chemische Reinigung', body: 'Lösungsmittelbasierte Entfettung. Fabrikfett und Oberflächenrückstände werden vollständig gelöst.' },
  { n: 2, title: 'Ultraschallreinigung', body: 'Kavitation löst Rückstände tief in den Gelenken — dort, wo chemische Reinigung allein nicht ausreicht.' },
];

const v9SharedProcessNote = 'Wachs und Molybdändisulfid dringen nur in metallisch saubere Gelenke ein. Fabrikfett auf der Innenoberfläche blockiert den Wirkstoff vollständig — Ultraschall stellt sicher, dass kein Rückstand bleibt.';

const v9SharedIntro = 'V9 ist das Ergebnis iterativer Entwicklung — jede Version hat ein konkretes Problem gelöst: Flockenbildung, Schaltaussetzer bei Kälte, Wachsaustrag im Sommer, Sedimentierung der MoS₂-Partikel. Getestet Sommer 2025 (36°C Asphalt, Stuttgart) und Winter 2025/26 (−8°C, nasse Forstwege).';

const v9SharedBullets: V9Bullet[] = [
  { title: 'MoS₂-Transferfilm, Korngröße <5 µm', body: 'Reibungskoeffizient 0,03–0,06, Schichtgitterstruktur, aktiv bis 300 MPa Kontaktdruck. Tribochemisch gebunden auf Bolzen und Hülsen — persistiert nach Abnutzung des Trägerwachses.' },
  { title: 'Kein Wachsverlust im Sommer', body: 'Synthetisches Hartwachs hebt den Tropfpunkt auf ~75°C. Wachs bleibt unter Betriebslast in den Gelenken — keine Migration auf Schaltwerk oder Umwerfer nach langen Sommertagen.' },
  { title: 'Deutlich geringere Rostneigung · weniger Flocken · keine Schaltaussetzer bei Kälte', body: 'Amorphe Wachskomponente hält die Matrix flexibel bis −8°C. Feinere Kristallstruktur haftet besser an der Kette — weniger abblätterndes Wachs, weniger freiliegendes Metall, weniger Rostneigung nach Regenfahrten.' },
  { title: 'Jeder Block identisch — Charge für Charge', body: 'MoS₂ ist 5× schwerer als Paraffin und sedimentiert ohne Stabilisierung. Ein sterischer Stabilisator hält die Partikel gleichmäßig verteilt. Wer inkonsistente Ergebnisse mit MoS₂-Wachs kennt: das ist oft die Ursache.' },
];

const v9SharedNote = 'Molybdändisulfid (MoS₂) — Festschmierstoff, Reibungskoeffizient 0,03–0,06. Eingesetzt in Getrieben, Luft- und Raumfahrt, Präzisionsmechanik. Phenolisches Antioxidans verhindert Oxidation zu abrasivem Molybdäntrioxid — 12 Monate Lagerstabilität.';

const v9SharedChainCompRows = [
  { label: 'Schmierstoff', good: 'MoS₂-Transferfilm', bad: 'Nassschmierung' },
  { label: 'Startbereit', good: 'Sofort ✓', bad: 'Nach Ölen' },
  { label: 'Antrieb', good: 'Trocken & sauber', bad: 'Ölfilm, Dreck' },
  { label: 'Intervall', good: '300–550 km', bad: '50–150 km' },
  { label: 'Kettenlaufzeit', good: '3–5× länger', bad: 'Basis' },
  { label: 'Aufwand', good: 'Einbauen & fahren', bad: 'Alle 100–150 km ölen' },
];

const v9ChainFooterNote = 'Made in Germany. Wachsbehandlung in Stuttgart — frisch behandelt, direkt versandt. Versand 1–2 Werktage. Selbst wachsen? Waxcelerate MoS₂ Edition 300g / 500g — gleiche Formulierung, für alle Ketten.';


const waxCompatTags: string[][] = [
  ['Shimano', 'SRAM', 'Campagnolo', 'KMC', 'YBN', 'Connex'],
  ['HG601', 'HG701', 'HG901', 'CN-M7100', 'CN-M8100', 'CN-M9100', 'GX Eagle', 'XX1 Eagle', 'Red AXS', 'KMC X11', 'KMC X12', 'YBN 11s', 'YBN 12s'],
  ['9-fach', '10-fach', '11-fach', '12-fach', 'Rennrad', 'MTB', 'Gravel', 'E-Bike', 'Triathlon', 'Cyclocross'],
];

const waxFormulaClassic = [
  { name: 'Vollraffiniertes Paraffinwachs', detail: 'Kristalline Trägermatrix, 58–60°C. Hält den Wirkstoff in den Gelenken und bildet nach dem Erstarren eine formstabile, trockene Schicht.' },
  { name: 'PTFE mit optimierter Verteilung', detail: 'Durch gezielte Formulierung wird der Wirkstoff in der Schmelze besser verteilt. Das erhöht die aktive Schmierfläche und erlaubt eine effizientere Dosierung bei gleichwertiger Leistung. Reibungskoeffizient 0,05–0,07.' },
  { name: 'Stearin', detail: 'Fettsäurederivat, verbessert Matrixkohäsion und Gleichmäßigkeit des Auftrags.' },
];

const waxTechNoteClassic = {
  title: 'PTFE — Einordnung',
  body: 'Dasselbe Material wie in Antihaft-Kochgeschirr, lebensmittelzugelassen und in diesem Anwendungsbereich seit Jahrzehnten geprüft. Thermisch stabil bis 260°C — bei 80–90°C Verarbeitungstemperatur vollständig inert. Nicht über 100°C erhitzen, gut lüften. Ausschließlich für den Einsatz an Fahrradkomponenten — nicht zum Verzehr geeignet.',
};

const waxCompHeadersClassic = ['Waxcelerate Standard', 'Graphit-Heißwachs', 'Kettenöl'];

const waxCompRowsClassic = [
  { label: 'Wirkstoff', cols: ['PTFE-Film', 'Graphit-Matrix', 'Nassschmierung'], winCol: 0, dimCols: [2] },
  { label: 'Reibungskoeffizient', cols: ['0,05–0,07', '0,08–0,12', '0,18–0,25'], winCol: 0, dimCols: [2] },
  { label: 'Antrieb', cols: ['Trocken, sauber', 'Leicht grauer Belag', 'Ölfilm, bindet Dreck'], winCol: 0, dimCols: [2] },
  { label: 'Intervall trocken', cols: ['250–450 km', '200–350 km', '50–150 km'], winCol: 0, dimCols: [2] },
  { label: 'Kettenlaufzeit', cols: ['3–5× länger als Öl', '2–4× länger als Öl', 'Basis'], winCol: 0, dimCols: [2] },
];

const waxFormulaProMos2 = [
  { name: 'Vollraffiniertes Paraffinwachs', detail: 'Kristalline Trägermatrix, 58–60°C. Trägersubstrat, das Wirkstoff in den Gelenken hält und nach Erstarren eine formstabile, trockene Schicht bildet.' },
  { name: 'Synthetisches Hartwachs', detail: 'Hebt den Tropfpunkt auf ~75°C. Wachs bleibt unter Betriebslast in den Gelenken — keine Migration auf Schaltwerk oder Umwerfer nach langen Sommertagen.' },
  { name: 'Amorphe Wachskomponente', detail: 'Hält die Matrix flexibel bis −8°C. Feinere Kristallstruktur haftet besser an der Kette — weniger abblätterndes Wachs, weniger Rostneigung nach Regenfahrten.' },
  { name: 'MoS₂ < 5 µm', detail: 'Molybdändisulfid-Transferfilm. Reibungskoeffizient 0,03–0,06, Schichtgitterstruktur, aktiv bis 300 MPa Kontaktdruck. Tribochemisch gebunden auf Bolzen und Hülsen — persistiert nach Abnutzung des Trägerwachses.' },
  { name: 'Phenolisches Antioxidans', detail: 'Verhindert Oxidation von MoS₂ zu abrasivem Molybdäntrioxid. 12 Monate Lagerstabilität. Sterischer Stabilisator hält MoS₂-Partikel gleichmäßig verteilt — Charge für Charge identisch.' },
];

const waxTechNoteProMos2 = {
  title: 'MoS₂ — Festschmierstoff',
  body: 'Molybdändisulfid (MoS₂) ist eingesetzt in Getrieben, Luft- und Raumfahrt, Präzisionsmechanik. Reibungskoeffizient 0,03–0,06. MoS₂ ist 5× schwerer als Paraffin und sedimentiert ohne Stabilisierung — ein sterischer Stabilisator hält die Partikel gleichmäßig verteilt. Formulierung V9 — getestet Sommer 2025 (36°C, Stuttgart) und Winter 2025/26 (−8°C, nasse Forstwege).',
};

const waxCompHeadersProMos2 = ['Waxcelerate Pro MoS₂', 'Waxcelerate Standard', 'Kettenöl'];

const waxCompRowsProMos2 = [
  { label: 'Wirkstoff', cols: ['MoS₂-Transferfilm', 'PTFE-Film', 'Nassschmierung'], winCol: 0, dimCols: [2] },
  { label: 'Reibungskoeffizient', cols: ['0,03–0,06', '0,05–0,07', '0,18–0,25'], winCol: 0, dimCols: [2] },
  { label: 'Intervall trocken', cols: ['300–550 km', '250–450 km', '50–150 km'], winCol: 0, dimCols: [2] },
  { label: 'Wintereignung', cols: ['bis −8°C ✓', 'bedingt', '—'], winCol: 0, dimCols: [2] },
  { label: 'Rostschutz', cols: ['Hydrophobe Matrix ✓', 'Standard', 'Keiner'], winCol: 0, dimCols: [2] },
  { label: 'PFAS/PTFE-frei', cols: ['✓', '—', '—'], winCol: 0, dimCols: [1, 2] },
];

export const richContent: Record<string, RichContent> = {
  'wax-500': {
    stats: [
      { value: '20–32', label: 'Tauchgänge pro Block', sub: 'pro 500g · je nach Kettengröße' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '250–450 km', label: 'Intervall trocken', sub: 'Kein Nachölen nach jeder Fahrt.' },
      { value: '≤ 0,07', label: 'Reibungskoeffizient', sub: 'Messbar weniger als Öl (0,18–0,25).' },
    ],
    formulaDetails: waxFormulaClassic,
    techNote: waxTechNoteClassic,
    compHeaders: waxCompHeadersClassic,
    compRows: waxCompRowsClassic,
    compFootnote: 'Für Winterbetrieb, Nässe und maximale Intervalle: Waxcelerate MoS₂ Edition.',
    costExample: 'CN-M8100 (Shimano XT / Ultegra) · UVP €45,99',
    costNote: 'Basis: ~4.000 km Kettenlaufzeit mit Öl vs. ~12.000 km mit Heißwachs · 30 Behandlungen à 400 km · Öl alle 150 km',
    oilCount: '3×', oilLabel: 'Ketten mit Öl',
    waxCount: '1×', waxLabel: 'Kette mit Waxcelerate',
    oilItems: [{ label: '3 Ketten à €45,99', cost: '€138' }, { label: 'Öl (~1,2 Flaschen)', cost: '€13' }],
    waxItems: [{ label: '1 Kette à €45,99', cost: '€46' }, { label: 'Wachs (1,2 Blöcke)', cost: '~€35' }],
    oilTotal: '~€151', waxTotal: '~€81', savings: '≈€70 gespart',
    compatTags: waxCompatTags,
    reviewCount: 145,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · verifizierte Käufer',
    footerNote: 'Made in Germany. Produziert in Stuttgart — frisch gefertigt, direkt versandt. Kein Lagerbestand. Versand 1–2 Werktage · möglichst wenig und recyclierbares Verpackungsmaterial.',
  },

  'wax-300': {
    stats: [
      { value: '10–15', label: 'Tauchgänge pro Block', sub: 'pro 300g · je nach Kettengröße' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '250–450 km', label: 'Intervall trocken', sub: 'Kein Nachölen nach jeder Fahrt.' },
      { value: '≤ 0,07', label: 'Reibungskoeffizient', sub: 'Messbar weniger als Öl (0,18–0,25).' },
    ],
    formulaDetails: waxFormulaClassic,
    techNote: waxTechNoteClassic,
    compHeaders: waxCompHeadersClassic,
    compRows: waxCompRowsClassic,
    compFootnote: 'Für Winterbetrieb, Nässe und maximale Intervalle: Waxcelerate MoS₂ Edition.',
    costExample: 'CN-M8100 (Shimano XT / Ultegra) · UVP €45,99',
    costNote: 'Basis: ~4.000 km Kettenlaufzeit mit Öl vs. ~12.000 km mit Heißwachs · 30 Behandlungen à 400 km · Öl alle 150 km',
    oilCount: '3×', oilLabel: 'Ketten mit Öl',
    waxCount: '1×', waxLabel: 'Kette mit Waxcelerate',
    oilItems: [{ label: '3 Ketten à €45,99', cost: '€138' }, { label: 'Öl (~1,2 Flaschen)', cost: '€13' }],
    waxItems: [{ label: '1 Kette à €45,99', cost: '€46' }, { label: 'Wachs (2,4 Blöcke)', cost: '~€55' }],
    oilTotal: '~€151', waxTotal: '~€101', savings: '≈€50 gespart',
    compatTags: waxCompatTags,
    reviewCount: 145,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · verifizierte Käufer',
    footerNote: 'Made in Germany. Produziert in Stuttgart — frisch gefertigt, direkt versandt. Kein Lagerbestand. Versand 1–2 Werktage · möglichst wenig und recyclierbares Verpackungsmaterial.',
  },

  'wax-500-mos2': {
    stats: [
      { value: '20–32', label: 'Tauchgänge pro Block', sub: 'pro 500g · je nach Kettengröße' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km.' },
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl: 0,18–0,25.' },
    ],
    formulaDetails: waxFormulaProMos2,
    techNote: waxTechNoteProMos2,
    compHeaders: waxCompHeadersProMos2,
    compRows: waxCompRowsProMos2,
    compFootnote: 'PFAS/PTFE-frei — MoS₂ ist ein natürlicher Festschmierstoff ohne synthetische Fluorverbindungen.',
    costExample: 'CN-M8100 (Shimano XT / Ultegra) · UVP €45,99',
    costNote: 'Basis: ~4.000 km Kettenlaufzeit mit Öl vs. ~12.000 km mit Heißwachs · ~28 Behandlungen à 425 km',
    oilCount: '3×', oilLabel: 'Ketten mit Öl',
    waxCount: '1×', waxLabel: 'Kette mit Waxcelerate Pro',
    oilItems: [{ label: '3 Ketten à €45,99', cost: '€138' }, { label: 'Öl (~1,2 Flaschen)', cost: '€13' }],
    waxItems: [{ label: '1 Kette à €45,99', cost: '€46' }, { label: 'Wachs (1,1 Blöcke)', cost: '~€38' }],
    oilTotal: '~€151', waxTotal: '~€84', savings: '≈€67 gespart',
    compatTags: waxCompatTags,
    reviewCount: 145,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · verifizierte Käufer',
    footerNote: 'Made in Germany. Produziert in Stuttgart — frisch gefertigt, direkt versandt. PFAS/PTFE-frei — Formulierung V9.',
  },

  'wax-300-mos2': {
    stats: [
      { value: '10–15', label: 'Tauchgänge pro Block', sub: 'pro 300g · je nach Kettengröße' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km.' },
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl: 0,18–0,25.' },
    ],
    formulaDetails: waxFormulaProMos2,
    techNote: waxTechNoteProMos2,
    compHeaders: waxCompHeadersProMos2,
    compRows: waxCompRowsProMos2,
    compFootnote: 'PFAS/PTFE-frei — MoS₂ ist ein natürlicher Festschmierstoff ohne synthetische Fluorverbindungen.',
    costExample: 'CN-M8100 (Shimano XT / Ultegra) · UVP €45,99',
    costNote: 'Basis: ~4.000 km Kettenlaufzeit mit Öl vs. ~12.000 km mit Heißwachs · ~28 Behandlungen à 425 km',
    oilCount: '3×', oilLabel: 'Ketten mit Öl',
    waxCount: '1×', waxLabel: 'Kette mit Waxcelerate Pro',
    oilItems: [{ label: '3 Ketten à €45,99', cost: '€138' }, { label: 'Öl (~1,2 Flaschen)', cost: '€13' }],
    waxItems: [{ label: '1 Kette à €45,99', cost: '€46' }, { label: 'Wachs (2,2 Blöcke)', cost: '~€60' }],
    oilTotal: '~€151', waxTotal: '~€106', savings: '≈€45 gespart',
    compatTags: waxCompatTags,
    reviewCount: 145,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · verifizierte Käufer',
    footerNote: 'Made in Germany. Produziert in Stuttgart — frisch gefertigt, direkt versandt. PFAS/PTFE-frei — Formulierung V9.',
  },

  'chain-hg701': {
    hook: 'Shimanos universellste 11-fach-Kette — SIL-TEC, 116 Glieder, kompatibel mit Ultegra, XT, GRX, 105 und mehr — vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. Kettenschloss liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '116', label: 'Glieder', sub: '11-fach · Ultegra / XT / GRX · SIL-TEC' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: v9SharedBullets,
    v9Note: v9SharedNote,
    chainSpec: {
      'Serie': 'Shimano Ultegra R8000 / XT M8000 / GRX RX810 / 105 R7000',
      'Geschwindigkeit': '11-fach · 116 Glieder',
      'Oberfläche': 'Vollnieten · SIL-TEC-Beschichtung',
      'Technologie': 'HG-X11 · direktional',
      'Verbinder': 'Quick-Link (im Lieferumfang)',
    },
    chainCompRows: v9SharedChainCompRows,
    compatTags: [
      ['Ultegra R8000', 'XT M8000', 'GRX RX810', '105 R7000', 'Tiagra 4700', 'Deore M6000'],
      ['Rennrad', 'MTB', 'Gravel', 'Cyclocross', 'E-Bike', 'Triathlon'],
    ],
    reviewCount: 150,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · E-Bike',
    footerNote: v9ChainFooterNote,
  },

  'chain-ybn11': {
    hook: 'YBN 11S — universal 11-fach für Shimano, SRAM, Campagnolo und KMC. 116 Glieder, keine Kompatibilitätskompromisse. Vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. Kettenschloss liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '116', label: 'Glieder', sub: '11-fach universal · Shimano + SRAM + Campa' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: v9SharedBullets,
    v9Note: v9SharedNote,
    chainSpec: {
      'Hersteller': 'YBN — Yaban Chain Industrial Co., Taiwan',
      'Modell': 'S11 / 11S · 116 Glieder',
      'Kompatibilität': 'Shimano · SRAM · Campagnolo · KMC 11-fach',
      'Verbinder': 'Quick-Link (im Lieferumfang)',
      'Einsatz': 'Rennrad · MTB · Gravel · E-Bike · Triathlon',
    },
    chainCompRows: v9SharedChainCompRows,
    compatTags: [
      ['Shimano 11-fach', 'HG601 / HG701 / HG901', 'SRAM 11-fach', 'Force / Rival / Red', 'Campagnolo 11-fach', 'KMC X11'],
      ['Rennrad', 'MTB', 'Gravel', 'E-Bike', 'Triathlon', 'Cyclocross'],
    ],
    reviewCount: 150,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · E-Bike',
    footerNote: v9ChainFooterNote,
  },

  'chain-m8100': {
    hook: 'Drei Antriebe, eine Kette — Deore XT M8100, Ultegra R8100, GRX 12-fach — 116 Glieder, SIL-TEC, Hyperglide+. Vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. Kettenschloss liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '116', label: 'Glieder', sub: '12-fach · XT / Ultegra / GRX · Hyperglide+' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: v9SharedBullets,
    v9Note: v9SharedNote,
    chainSpec: {
      'Serie': 'Shimano Deore XT M8100 / Ultegra R8100 / GRX 12-fach',
      'Geschwindigkeit': '12-fach · 116 Glieder · ~278 g',
      'Oberfläche': 'Vollnieten, chromiert · SIL-TEC',
      'Technologie': 'Hyperglide+ · DCE+ · direktional',
      'Verbinder': 'Quick-Link SM-CN910 (im Lieferumfang)',
    },
    chainCompRows: v9SharedChainCompRows,
    compatTags: [
      ['Deore XT M8100 / M8200', 'Ultegra R8100', 'GRX 12-fach', 'XTR M9100', 'Dura-Ace R9200', 'SLX M7100', 'Deore M6100'],
      ['MTB', 'Rennrad', 'Gravel', 'E-Bike'],
    ],
    reviewCount: 150,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · E-Bike',
    footerNote: v9ChainFooterNote,
  },

  'chain-m7100': {
    hook: 'SLX und 105 — Shimanos Einstieg in 12-fach mit voller Hyperglide+- und DCE+-Architektur. 116 Glieder, SIL-TEC, identisches System wie XT und XTR. Vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. Kettenschloss liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '116', label: 'Glieder', sub: '12-fach · SLX / 105 · Hyperglide+' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: v9SharedBullets,
    v9Note: v9SharedNote,
    chainSpec: {
      'Serie': 'Shimano SLX M7100 / 105 R7100',
      'Geschwindigkeit': '12-fach · 116 Glieder',
      'Oberfläche': 'Vollnieten · SIL-TEC',
      'Technologie': 'Hyperglide+ · DCE+',
      'Verbinder': 'Quick-Link SM-CN910 (im Lieferumfang)',
    },
    chainCompRows: v9SharedChainCompRows,
    compatTags: [
      ['SLX M7100', '105 R7100', 'Deore XT M8100', 'Deore M6100', 'XTR M9100', 'GRX 12-fach'],
      ['MTB', 'Rennrad', 'Gravel', 'E-Bike'],
    ],
    reviewCount: 150,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · E-Bike',
    footerNote: v9ChainFooterNote,
  },

  'chain-m9100': {
    hook: 'Shimanos präziseste 12-fach-Kette — Hohlnieten, SIL-TEC, 289 g — vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. Kettenschloss liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '138', label: 'Glieder · Hohlnieten', sub: 'XTR / Dura-Ace · 12-fach · ~289 g' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: v9SharedBullets,
    v9Note: v9SharedNote,
    chainSpec: {
      'Serie': 'Shimano XTR M9100 / Dura-Ace R9200',
      'Geschwindigkeit · Glieder': '12-fach · 138 Glieder · ~289 g',
      'Nieten · Oberfläche': 'Hohlnieten · SIL-TEC-Beschichtung',
      'Technologie': 'Hyperglide+ · DCE+ · direktional',
      'Verbinder': 'Quick-Link SM-CN910 (im Lieferumfang)',
    },
    chainCompRows: v9SharedChainCompRows,
    compatTags: [
      ['XTR M9100 / M9200', 'Dura-Ace R9200', 'Ultegra R8100', 'GRX 12-fach', 'Deore XT M8100', 'SLX M7100', 'Deore M6100'],
      ['Rennrad', 'MTB', 'Gravel', 'E-Bike', 'Triathlon'],
    ],
    reviewCount: 150,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · E-Bike · verifizierte Käufer',
    footerNote: v9ChainFooterNote,
  },

  'chain-force': {
    hook: 'SRAM Force PC-1170 — Hollow-Pin, 114 Glieder, 256 g — vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. PowerLock® liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '114', label: 'Glieder · Hollow-Pin', sub: 'SRAM Force · 11-fach · 256 g' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: [
      { title: 'Hollow-Pin-Nieten, 256 g', body: 'PC-1170 verwendet hohle Nieten — leichter als viele 11-fach Alternativen bei gleichem Schaltkomfort. Geringes Kettengewicht reduziert Trägheit bei schnellen Schaltvorgängen.' },
      { title: 'PowerLock® — werkzeuglos, mehrfach verwendbar', body: 'SRAMs Quick-Link öffnet ohne Werkzeug. Für die 3-Ketten-Rotation besonders praktisch: Kettenwechsel in unter 2 Minuten, kein Spezialwerkzeug nötig.' },
      { title: 'SRAM Force / Rival / Red / Apex — und Shimano 11-fach', body: 'PC-1170 ist mit allen SRAM 11-fach Antrieben kompatibel. Läuft zuverlässig auch auf Shimano 11-fach Kassetten und Kettenblättern.' },
      { title: 'V9 MoS₂-Behandlung — selbe Formulierung wie auf allen Waxcelerate-Ketten', body: 'Dieselbe Wachsbehandlung wie auf Shimano XTR und Dura-Ace. Reibungskoeffizient 0,03–0,06 — unabhängig vom Kettenmodell.' },
    ],
    v9Note: v9SharedNote,
    chainSpec: {
      'Modell': 'SRAM Force PC-1170',
      'Geschwindigkeit · Glieder': '11-fach · 114 Glieder · 256 g',
      'Nieten · Technologie': 'Hollow-Pin',
      'Verbinder': 'PowerLock® (im Lieferumfang)',
      'Kompatibilität': 'SRAM Force / Rival / Red / Apex · Shimano 11-fach',
    },
    chainCompRows: v9SharedChainCompRows,
    proTip: 'Fahre drei Ketten im Wechsel, um Wartung zu minimieren und die Lebensdauer zu maximieren. Wachse alle gleichzeitig nach — entweder selbst mit Waxcelerate 300g / 500g oder professionell bei uns. 10 % Rabatt beim Kauf von 3 Ketten!',
    compatTags: [
      ['SRAM Force', 'SRAM Rival', 'SRAM Red', 'SRAM Apex', 'Shimano 11-fach'],
      ['11-fach', 'Rennrad', 'Gravel', 'Triathlon'],
    ],
    reviewCount: 150,
    reviewCats: 'Rennrad · Gravel · Triathlon · verifizierte Käufer',
    footerNote: v9ChainFooterNote,
  },

  'chain-nx': {
    hook: 'SRAM NX Eagle — 118 Glieder, 12-fach MTB — vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. PowerLock® liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '118', label: 'Glieder · Eagle', sub: 'SRAM NX Eagle · 12-fach MTB' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: [
      { title: 'NX Eagle — Einstieg ins 12-fach Eagle-System', body: 'Kompatibel mit dem gesamten SRAM Eagle-Ökosystem: SX, NX, GX, X01, XX1. Gleiche Schaltqualität wie die teureren Eagle-Ketten — bewährte NX-Zuverlässigkeit für den Trail.' },
      { title: 'PowerLock® — Kettenwechsel ohne Werkzeug', body: 'SRAMs Quick-Link öffnet ohne Werkzeug und ist mehrfach verwendbar. Bei der 3-Ketten-Rotation: Kette ab, neue drauf, in unter 2 Minuten weiterfahren.' },
      { title: '118 Glieder — passt auf die meisten MTB-Geometrien', body: 'Standardlänge für die meisten 12-fach MTB-Rahmen. Bei Bedarf leicht zu kürzen. Kommt mit montiertem PowerLock® — sofort einsatzbereit.' },
      { title: 'V9 MoS₂-Behandlung — selbe Formulierung wie auf allen Waxcelerate-Ketten', body: 'Reibungskoeffizient 0,03–0,06, Schichtgitterstruktur, tribochemisch gebunden. Kein Unterschied in der Behandlungsqualität zwischen NX und XX1 Eagle.' },
    ],
    v9Note: v9SharedNote,
    chainSpec: {
      'Modell': 'SRAM NX Eagle',
      'Geschwindigkeit · Glieder': '12-fach · 118 Glieder',
      'System': 'Eagle MTB',
      'Verbinder': 'PowerLock® (im Lieferumfang)',
      'Kompatibilität': 'SRAM SX / NX / GX / X01 / XX1 Eagle',
    },
    chainCompRows: v9SharedChainCompRows,
    proTip: 'Fahre drei Ketten im Wechsel, um Wartung zu minimieren und die Lebensdauer zu maximieren. Wachse alle gleichzeitig nach — entweder selbst mit Waxcelerate 300g / 500g oder professionell bei uns. 10 % Rabatt beim Kauf von 3 Ketten!',
    compatTags: [
      ['SRAM NX Eagle', 'SRAM SX Eagle', 'SRAM GX Eagle', 'SRAM X01 Eagle', 'SRAM XX1 Eagle'],
      ['12-fach MTB', 'Mountainbike', 'E-Bike MTB'],
    ],
    reviewCount: 150,
    reviewCats: 'MTB · Trail · Enduro · verifizierte Käufer',
    footerNote: v9ChainFooterNote,
  },

  'chain-ybn12': {
    hook: 'YBN S12S — 116 Glieder, 259 g, 12-fach universal für Shimano, SRAM und Campagnolo — vollständig entfettet und mit Molybdändisulfid-Transferfilm vorgewachst. Quick-Link liegt bei. Einbauen und fahren.',
    stats: [
      { value: '0,03–0,06', label: 'Reibungskoeffizient', sub: 'MoS₂-Transferfilm. Öl liegt bei 0,18–0,25.' },
      { value: '3–5×', label: 'Längere Kettenlaufzeit', sub: 'Gegenüber Öl. Kette und Kassette länger.' },
      { value: '300–550 km', label: 'Intervall trocken', sub: 'Mit Topup bis 1.200 km. Kein Nachölen.' },
      { value: '259 g', label: 'Gewicht · 116 Glieder', sub: 'YBN S12S · 12-fach universal' },
    ],
    processSteps: v9SharedProcessSteps,
    processNote: v9SharedProcessNote,
    v9Intro: v9SharedIntro,
    v9Bullets: [
      { title: 'Universal 12-fach — Shimano, SRAM und Campagnolo', body: 'YBN S12S ist eine der wenigen echten Universal-Ketten für 12-fach. Kompatibel mit Shimano, SRAM Eagle und Campagnolo — kein Hersteller-Lock-in, eine Kette für alles.' },
      { title: '259 g — leichter als Shimano CN-M8100 (278 g)', body: 'Bei gleichwertiger Haltbarkeit und Schaltzuverlässigkeit bringt die YBN S12S weniger auf die Waage als viele OEM-Ketten. Vorteil bei der Rotation: günstigerer Preis, weniger Gewicht.' },
      { title: 'Quick-Link — werkzeuglos, mehrfach verwendbar', body: 'YBNs Quick-Link funktioniert wie SRAM PowerLock: ohne Werkzeug lösbar, mehrfach verwendbar. Ideal für die 3-Ketten-Rotation — schneller Wechsel auf der Werkbank.' },
      { title: 'Beste-Wahl-Verhältnis: universal einsetzbar, günstig, sauber', body: 'Günstiger als Shimano CN-M8100 bei breiter Kompatibilität. Für Fahrer mit gemischtem Antrieb oder als zuverlässiger Ersatz ohne Hersteller-Festlegung.' },
    ],
    v9Note: v9SharedNote,
    chainSpec: {
      'Hersteller': 'YBN — Yaban Chain Industrial Co., Taiwan',
      'Modell · Gewicht': 'S12S · 259 g · 116 Glieder',
      'Kompatibilität': 'Shimano 12-fach · SRAM 12-fach · Campagnolo 12-fach',
      'Verbinder': 'Quick-Link (im Lieferumfang)',
      'Einsatz': 'Rennrad · MTB · Gravel · E-Bike',
    },
    chainCompRows: v9SharedChainCompRows,
    proTip: 'Fahre drei Ketten im Wechsel, um Wartung zu minimieren und die Lebensdauer zu maximieren. Wachse alle gleichzeitig nach — entweder selbst mit Waxcelerate 300g / 500g oder professionell bei uns. 10 % Rabatt beim Kauf von 3 Ketten!',
    compatTags: [
      ['Shimano 12-fach', 'SRAM 12-fach', 'Campagnolo 12-fach', 'KMC X12'],
      ['Rennrad', 'MTB', 'Gravel', 'E-Bike', 'Triathlon', 'Cyclocross'],
    ],
    reviewCount: 150,
    reviewCats: 'Rennrad · MTB · Gravel · Triathlon · verifizierte Käufer',
    footerNote: v9ChainFooterNote,
  },
};
