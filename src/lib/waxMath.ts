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
  /** Längung in Prozent. */
  percent: number;
  /** Grenzwert für diese Gangzahl. */
  limit: number;
  status: 'ok' | 'soon' | 'replace' | 'cassette';
  /** Ab hier ist die Kassette mit hoher Wahrscheinlichkeit mitgelaufen. */
  cassetteAtRisk: boolean;
}

export function wearLimit(speed: ChainSpeed): number {
  if (speed >= 11) return 0.5;
  if (speed >= 9) return 0.75;
  return 1.0;
}

/**
 * Längung aus einer Messung über 12 Glieder. 12 neue Glieder messen exakt
 * 12 × 12,7 mm = 152,4 mm (halbzöllige Teilung); die Abweichung davon ist die
 * Längung. Alternativ kann direkt ein Lehrenwert in Prozent übergeben werden.
 */
export const NOMINAL_12_LINKS_MM = 152.4;

export function elongationFrom12Links(measuredMm: number): number {
  return ((measuredMm - NOMINAL_12_LINKS_MM) / NOMINAL_12_LINKS_MM) * 100;
}

export function wearVerdict(percent: number, speed: ChainSpeed): WearVerdict {
  const limit = wearLimit(speed);
  // 1,0 % gilt antriebsübergreifend als die Schwelle, ab der die Kassette
  // praktisch immer mitgelaufen ist — unabhängig davon, wie früh die
  // Tauschgrenze der jeweiligen Gangzahl liegt.
  const cassetteAtRisk = percent >= 1.0 || percent >= limit + 0.25;
  const status: WearVerdict['status'] =
    cassetteAtRisk ? 'cassette'
    : percent >= limit ? 'replace'
    : percent >= limit * 0.8 ? 'soon'
    : 'ok';
  return { percent, limit, status, cassetteAtRisk };
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
export function drivetrainCosts(input: {
  kmPerYear: number;
  rewaxKm: number;
  chains: 1 | 2 | 3;
}): DrivetrainCosts {
  const { kmPerYear, rewaxKm, chains } = input;
  const waxPerApp = costPerApplication(referenceWax) ?? 0;

  const oilPerKm =
    medianChainPrice / OIL_CHAIN_KM +
    CASSETTE_PRICE / OIL_CASSETTE_KM +
    OIL_PRICE_PER_APP / OIL_APP_INTERVAL_KM;

  const waxPerKm =
    medianChainPrice / WAX_CHAIN_KM[chains - 1] +
    CASSETTE_PRICE / WAX_CASSETTE_KM[chains - 1] +
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
    label: 'Kettenlaufleistung mit Öl',
    labelEn: 'Chain life with oil',
    value: `${OIL_CHAIN_KM.toLocaleString('de-DE')} km`,
    valueEn: `${OIL_CHAIN_KM.toLocaleString('en-US')} km`,
  },
  {
    label: 'Kettenlaufleistung mit Wachs (1 / 2 / 3 Ketten im Wechsel)',
    labelEn: 'Chain life with wax (1 / 2 / 3 chains rotated)',
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
    label: 'Öl: Kosten und Intervall',
    labelEn: 'Oil: cost and interval',
    value: `${OIL_PRICE_PER_APP.toFixed(2).replace('.', ',')} € alle ${OIL_APP_INTERVAL_KM.toLocaleString('de-DE')} km`,
    valueEn: `€${OIL_PRICE_PER_APP.toFixed(2)} every ${OIL_APP_INTERVAL_KM.toLocaleString('en-US')} km`,
  },
];
