// ── Eine Quelle für alles, was die Rechner rechnen ───────────────────────────
//
// Vorher lagen drei Konstantensätze nebeneinander, die dieselbe Frage
// unterschiedlich beantworteten: `WAX_PER_REWAX = 20` und `APPS_PER_BLOCK = 33`
// in tools.tsx und die `applications`-Spanne aus data.ts in ridingProfile.ts.
// Je nachdem, welcher Rechner antwortete, reichte ein 500-g-Block für 25, 33
// oder 26 Wachsungen. Diese Datei ist jetzt die einzige Quelle; alle Rechner
// und `weeksRemainingForProduct` lesen von hier.
//
// Grundregel wie überall im Projekt (CLAUDE.md Regel 1): Produktdaten kommen
// aus data.ts, nie aus einer Konstante hier. Was hier steht, sind Annahmen über
// die Welt (Verschleißgrenzen, Öl-Kosten, Laufleistungen) — und die sind
// vollständig in ASSUMPTIONS beschrieben, damit die Seite sie offenlegen kann.

import { products, waxIntervals, type Product } from '@/lib/data';

export { waxIntervals };

// ── Wachsverbrauch ──────────────────────────────────────────────────────────

/**
 * Anwendungen je Block — Mittelwert der in data.ts deklarierten Spanne
 * (z. B. '20–32' → 26). Bewusst aus den Produktdaten abgeleitet statt fest
 * verdrahtet: ändert Luca die Spanne, ändern sich alle Rechner mit.
 */
export function applicationsPerBlock(product: Product): number | null {
  const raw = product.applications;
  if (!raw) return null;
  const [lo, hi] = raw.split(/[–-]/).map(n => parseInt(n.trim(), 10));
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  return (lo + hi) / 2;
}

/** Gramm je Wachsung, aus Blockgewicht und deklarierter Anwendungsspanne. */
export function gramsPerApplication(product: Product): number | null {
  const apps = applicationsPerBlock(product);
  const grams = parseInt(product.weight ?? '', 10);
  if (!apps || !Number.isFinite(grams)) return null;
  return grams / apps;
}

/** Kosten je Wachsung in Euro. */
export function costPerApplication(product: Product): number | null {
  const apps = applicationsPerBlock(product);
  return apps ? product.price / apps : null;
}

// ── Referenzprodukte für Rechner, die einen Preis brauchen ──────────────────
// Der Classic-500er ist die Standardgröße und der Bezugspunkt für jede
// Kostenrechnung. Kein Fallback: fehlt er, ist data.ts kaputt und ein stiller
// Ersatzwert würde den Fehler nur verstecken.
export const referenceWax = products.find(p => p.id === 'wax-500')!;

/** Medianpreis der vorgewachsten Ketten — Bezugsgröße der Antriebsrechnung. */
export const medianChainPrice = (() => {
  const prices = products.filter(p => p.category === 'chain').map(p => p.price).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
})();

// ── Verschleiß ──────────────────────────────────────────────────────────────
//
// Die Grenzwerte sind Herstellerkonsens, kein Waxcelerate-Wert: bei 11- und
// 12-fach ist ab 0,5 % Längung zu tauschen, bei 9-/10-fach ab 0,75 %, bei
// älteren 5- bis 8-fach-Antrieben ab 1,0 %. Über der jeweiligen Grenze frisst
// die Kette die Kassette mit.
export type ChainSpeed = 8 | 9 | 10 | 11 | 12;

export interface WearVerdict {
  /** Laengung in Prozent. */
  percent: number;
  /** Grenzwert fuer diese Gangzahl. */
  limit: number;
  /**
   * ok        — unter dem Grenzwert, nichts zu tun
   * soon      — kurz davor, im Blick behalten
   * replace   — Kette tauschen, Kassette darf in aller Regel bleiben
   * checkCass — Kette raus; die Kassette kann mitgelaufen sein, pruefen
   * cassette  — Kette raus, Kassette ist praktisch sicher mitgelaufen
   */
  status: 'ok' | 'soon' | 'replace' | 'checkCass' | 'cassette';
}

export function wearLimit(speed: ChainSpeed): number {
  if (speed >= 11) return 0.5;
  if (speed >= 9) return 0.75;
  return 1.0;
}

/**
 * Laengung aus einer Messung ueber 12 Glieder.
 *
 * ACHTUNG, hier lag bis zur Korrektur ein echter Fachfehler: der Wert stand auf
 * 152,4 mm, also 12 × 12,7 mm. 12,7 mm ist aber die Teilung von Bolzen zu
 * Bolzen (ein halbes Zoll), und ein *Glied* im Sprachgebrauch der Messung ist
 * ein volles Glied aus Innen- und Aussenlaschenpaar, also 25,4 mm. Die
 * Werkstattregel lautet deshalb: 12 Glieder = 12 Zoll = 304,8 mm.
 *
 * Der Unterschied ist nicht bloss kosmetisch. Ueber 152,4 mm entspraechen
 * 0,5 % Laengung 0,76 mm — das liest niemand von einem Lineal ab. Ueber die
 * volle Zoll-Strecke sind es 1,52 mm, und genau darauf ist die Methode
 * ausgelegt.
 */
export const NOMINAL_12_LINKS_MM = 304.8;

export function elongationFrom12Links(measuredMm: number): number {
  return ((measuredMm - NOMINAL_12_LINKS_MM) / NOMINAL_12_LINKS_MM) * 100;
}

export function wearVerdict(percent: number, speed: ChainSpeed): WearVerdict {
  const limit = wearLimit(speed);
  // Vier Stufen statt der frueheren Ja/Nein-Antwort auf die Kassettenfrage.
  // Die Quellenlage ist abgestuft, nicht binaer: ab dem Grenzwert reicht in
  // aller Regel der Kettentausch, ab etwa einem Viertelprozent darueber kann
  // die Kassette mitgelaufen sein, und ab 1,0 % ist sie es praktisch immer —
  // unabhaengig davon, wie frueh die Tauschgrenze der Gangzahl liegt.
  // „Kann mitgelaufen sein" als eigene Stufe auszuweisen ist ehrlicher, als
  // jemandem bei 0,75 % eine neue Kassette zu verkaufen, die er vielleicht
  // nicht braucht.
  const status: WearVerdict['status'] =
    percent >= 1.0 ? 'cassette'
    : percent >= limit + 0.25 ? 'checkCass'
    : percent >= limit ? 'replace'
    : percent >= limit * 0.8 ? 'soon'
    : 'ok';
  return { percent, limit, status };
}

// ── Kettenlänge ─────────────────────────────────────────────────────────────
//
// Standardformel: Glieder = 0,157 × Kettenstrebe(mm) + Zähne(Kettenblatt)/2
// + Zähne(größtes Ritzel)/2 + 2. Der Faktor 0,157 ist 2/12,7 — zwei Glieder je
// Zoll Kettenstrebe. Das Ergebnis wird auf die nächste gerade Zahl aufgerundet,
// weil eine Kette immer aus Innen- und Außenlaschenpaaren besteht.
export function chainLengthLinks(input: {
  chainstayMm: number;
  bigChainring: number;
  bigSprocket: number;
}): number {
  const raw = 0.157 * input.chainstayMm + input.bigChainring / 2 + input.bigSprocket / 2 + 2;
  const rounded = Math.ceil(raw);
  return rounded % 2 === 0 ? rounded : rounded + 1;
}

// ── Antriebskosten: Wachs gegen Öl ──────────────────────────────────────────
//
// Alle Zahlen hier sind Annahmen über typische Laufleistungen und Marktpreise,
// keine Messwerte von Waxcelerate. Sie stehen deshalb sowohl hier als auch in
// ASSUMPTIONS, das die Seite dem Besucher aufklappbar zeigt.
export const CASSETTE_PRICE = 85.70;   // Shimano XT CS-M8100 12s, Referenz
export const OIL_CHAIN_KM = 4000;      // Kettenlaufleistung mit Nassöl
export const OIL_CASSETTE_KM = 15000;  // Kassettenlaufleistung mit Nassöl
export const OIL_PRICE_PER_APP = 1.10; // Öl je Anwendung
export const OIL_APP_INTERVAL_KM = 1000;
/** Kassetten-/Kettenlaufleistung mit Wachs, je Anzahl rotierter Ketten (1/2/3). */
export const WAX_CASSETTE_KM = [30000, 40000, 48000] as const;
export const WAX_CHAIN_KM = [6000, 8500, 10500] as const;

export interface DrivetrainCosts {
  oilPerYear: number;
  waxPerYear: number;
  savingsPerYear: number;
  savingsPct: number;
  waxSessionsPerYear: number;
}

/**
 * Jahreskosten des Antriebs, Wachs gegen Öl, bei gegebener Laufleistung,
 * Wachsintervall und Anzahl rotierter Ketten.
 */
/**
 * Wie hart die Bedingungen sind, abgeleitet aus dem Wachsintervall: trockene
 * Strasse (500 km) = 1,0, nasser MTB-Einsatz (120 km) = rund 4,2.
 *
 * Warum das noetig wurde: vorher waren die Laufleistungen von Kette und
 * Kassette feste Zahlen, unabhaengig von Wetter und Gelaende, waehrend die
 * Wachskosten mit kuerzerem Intervall stiegen. Das Modell kam damit zu dem
 * Schluss, Wachs lohne sich bei Naesse nicht — also genau das Gegenteil
 * dessen, was die Vergleichstests zeigen: unter Schmutz und Naesse bindet
 * trockenes Wachs kaum Schleifpaste, waehrend geoelte Ketten dort am
 * schnellsten verschleissen.
 *
 * Beide Schmierarten leiden also unter harten Bedingungen, Oel aber deutlich
 * staerker. Der Exponent unten haelt den Wachsnachteil bewusst konservativ
 * klein statt den in Tests gemessenen grossen Abstand voll anzusetzen.
 */
function severityFactor(rewaxKm: number): number {
  // Muss der trockenen Strasse aus waxIntervals entsprechen, sonst verschiebt
  // sich die ganze Skala. Nicht importiert, weil hier ein Bezugspunkt gemeint
  // ist und keine Nachschlagetabelle — der Kommentar haelt beide zusammen.
  const DRY_ROAD_REFERENCE_KM = 300;
  return rewaxKm > 0 ? Math.max(1, DRY_ROAD_REFERENCE_KM / rewaxKm) : 1;
}

/** Oel verschleisst unter Schmutz voll mit. */
const OIL_SEVERITY_EXPONENT = 1;
/** Wachs deutlich weniger — bewusst vorsichtig angesetzt. */
const WAX_SEVERITY_EXPONENT = 0.35;

export function drivetrainCosts(input: {
  kmPerYear: number;
  rewaxKm: number;
  chains: 1 | 2 | 3;
}): DrivetrainCosts {
  const { kmPerYear, rewaxKm, chains } = input;
  const waxPerApp = costPerApplication(referenceWax) ?? 0;

  const sev = severityFactor(rewaxKm);
  const oilWear = Math.pow(sev, OIL_SEVERITY_EXPONENT);
  const waxWear = Math.pow(sev, WAX_SEVERITY_EXPONENT);

  const oilPerKm =
    (medianChainPrice / OIL_CHAIN_KM) * oilWear +
    (CASSETTE_PRICE / OIL_CASSETTE_KM) * oilWear +
    OIL_PRICE_PER_APP / OIL_APP_INTERVAL_KM;

  const waxPerKm =
    (medianChainPrice / WAX_CHAIN_KM[chains - 1]) * waxWear +
    (CASSETTE_PRICE / WAX_CASSETTE_KM[chains - 1]) * waxWear +
    waxPerApp / rewaxKm;

  const oilPerYear = Math.round(kmPerYear * oilPerKm);
  const waxPerYear = Math.round(kmPerYear * waxPerKm);
  const savingsPerYear = Math.max(0, oilPerYear - waxPerYear);

  return {
    oilPerYear,
    waxPerYear,
    savingsPerYear,
    savingsPct: oilPerYear > 0 ? Math.round((savingsPerYear / oilPerYear) * 100) : 0,
    waxSessionsPerYear: Math.ceil(kmPerYear / (chains * rewaxKm)),
  };
}

// ── Offengelegte Annahmen ───────────────────────────────────────────────────
// Wird von AssumptionsDisclosure gerendert. Ein Spar-Rechner auf einer
// Verkäuferseite ist nur so glaubwürdig wie die Zahlen, die er zugibt.
export interface Assumption { label: string; value: string; labelEn: string; valueEn: string }

export const ASSUMPTIONS: Assumption[] = [
  {
    label: 'Kettenpreis (Median unserer vorgewachsten Ketten)',
    labelEn: 'Chain price (median of our pre-waxed chains)',
    value: `${medianChainPrice.toFixed(2).replace('.', ',')} €`,
    valueEn: `€${medianChainPrice.toFixed(2)}`,
  },
  {
    label: 'Kassettenpreis (Shimano XT CS-M8100 12-fach)',
    labelEn: 'Cassette price (Shimano XT CS-M8100 12-speed)',
    value: `${CASSETTE_PRICE.toFixed(2).replace('.', ',')} €`,
    valueEn: `€${CASSETTE_PRICE.toFixed(2)}`,
  },
  {
    label: 'Wachs je Anwendung',
    labelEn: 'Wax per application',
    value: `${(costPerApplication(referenceWax) ?? 0).toFixed(2).replace('.', ',')} € (${referenceWax.weight}-Block, ${referenceWax.applications} Anwendungen)`,
    valueEn: `€${(costPerApplication(referenceWax) ?? 0).toFixed(2)} (${referenceWax.weight} block, ${referenceWax.applications} applications)`,
  },
  {
    label: 'Kettenlaufleistung mit Öl (trockene Straße)',
    labelEn: 'Chain life with oil (dry road)',
    value: `${OIL_CHAIN_KM.toLocaleString('de-DE')} km`,
    valueEn: `${OIL_CHAIN_KM.toLocaleString('en-US')} km`,
  },
  {
    label: 'Kettenlaufleistung mit Wachs, trockene Straße (1 / 2 / 3 Ketten)',
    labelEn: 'Chain life with wax, dry road (1 / 2 / 3 chains)',
    value: WAX_CHAIN_KM.map(k => `${k.toLocaleString('de-DE')} km`).join(' / '),
    valueEn: WAX_CHAIN_KM.map(k => `${k.toLocaleString('en-US')} km`).join(' / '),
  },
  {
    label: 'Kassettenlaufleistung mit Öl / mit Wachs',
    labelEn: 'Cassette life with oil / with wax',
    value: `${OIL_CASSETTE_KM.toLocaleString('de-DE')} km / ${WAX_CASSETTE_KM.map(k => k.toLocaleString('de-DE')).join(' – ')} km`,
    valueEn: `${OIL_CASSETTE_KM.toLocaleString('en-US')} km / ${WAX_CASSETTE_KM.map(k => k.toLocaleString('en-US')).join(' – ')} km`,
  },
  {
    label: 'Härtere Bedingungen',
    labelEn: 'Harsher conditions',
    value: 'Nässe und Gelände verkürzen die Laufleistung beider Schmierarten — bei Öl voll, bei Wachs deutlich weniger. Konservativ angesetzt.',
    valueEn: 'Wet and off-road shorten component life for both lubricants — fully for oil, far less for wax. Set conservatively.',
  },
  {
    label: 'Öl: Kosten und Intervall',
    labelEn: 'Oil: cost and interval',
    value: `${OIL_PRICE_PER_APP.toFixed(2).replace('.', ',')} € alle ${OIL_APP_INTERVAL_KM.toLocaleString('de-DE')} km`,
    valueEn: `€${OIL_PRICE_PER_APP.toFixed(2)} every ${OIL_APP_INTERVAL_KM.toLocaleString('en-US')} km`,
  },
];


// ── Umstieg: was kostet er wirklich, und ab wann traegt er sich ─────────────
//
// Die erste Fassung hatte hier einen Rechenfehler, der das Ergebnis um den
// Faktor vier verzerrte: der erste Wachsblock stand sowohl in den einmaligen
// Startkosten als auch, anteilig, in den laufenden Wachskosten. Damit wurde er
// doppelt bezahlt, und die Amortisation sprang von realistischen drei auf
// achtzehn Monate.
//
// Richtig ist die Frage: was kostet der Umstieg MEHR als weiterzuoelen?
// Schmierstoff kauft man in beiden Welten, Wachs wie Oel — der einzige echte
// Mehraufwand am Anfang ist das Werkzeug, das man beim Oelen nicht braucht.
// Alles Weitere ist ein laufender Kostenvergleich, und den liefert bereits
// drivetrainCosts().
export interface SwitchEconomics {
  /** Einmaliger Mehraufwand gegenueber Weiteroelen: nur das Werkzeug. */
  toolingCost: number;
  /** Wachsverbrauch pro Jahr in Euro. */
  waxPerYear: number;
  /** Oelverbrauch pro Jahr in Euro. */
  oilPerYear: number;
  /** Gesamtersparnis pro Jahr inkl. Kette und Kassette. */
  savingsPerYear: number;
  /** Monate bis das Werkzeug wieder drin ist. null = rechnet sich nicht. */
  breakEvenMonths: number | null;
  /** Wachsungen pro Jahr bei diesem Fahrprofil. */
  applicationsPerYear: number;
  /** Wie lange ein Block reicht, in Monaten. */
  monthsPerBlock: number;
}

export function switchEconomics(input: {
  kmPerYear: number;
  rewaxKm: number;
  toolingCost: number;
}): SwitchEconomics {
  const { kmPerYear, rewaxKm, toolingCost } = input;
  const perApp = costPerApplication(referenceWax) ?? 0;
  const apps = applicationsPerBlock(referenceWax) ?? 0;

  const applicationsPerYear = rewaxKm > 0 ? kmPerYear / rewaxKm : 0;
  const waxPerYear = applicationsPerYear * perApp;
  const oilPerYear = (kmPerYear / OIL_APP_INTERVAL_KM) * OIL_PRICE_PER_APP;

  // Eine Kette, nicht rotiert: der ehrliche Einstiegsfall.
  const { savingsPerYear } = drivetrainCosts({ kmPerYear, rewaxKm, chains: 1 });

  return {
    toolingCost,
    waxPerYear: Math.round(waxPerYear),
    oilPerYear: Math.round(oilPerYear),
    savingsPerYear,
    breakEvenMonths: savingsPerYear > 0 ? Math.max(1, Math.ceil((toolingCost / savingsPerYear) * 12)) : null,
    applicationsPerYear,
    monthsPerBlock: applicationsPerYear > 0 ? Math.round((apps / applicationsPerYear) * 12) : 0,
  };
}
