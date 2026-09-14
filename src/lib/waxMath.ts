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

import { products, waxIntervals, getProductById, type Product } from '@/lib/data';

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
// Standardformel (Park Tool, in Glieder umgerechnet): Glieder =
// 0,157 × Kettenstrebe(mm) + Zähne(Kettenblatt)/2 + Zähne(größtes Ritzel)/2 + 2.
// Park rechnet in Zoll: L = 2·Strebe + Blatt/4 + Ritzel/4 + 1; ein Glied ist ein
// halber Zoll, also ×2 → der Strebenanteil wird 4 Glieder je Zoll = 4/25,4 =
// 0,157 je mm. Das Ergebnis wird auf die nächste gerade Zahl aufgerundet, weil
// eine Kette immer aus Innen- und Außenlaschenpaaren besteht.
/** Die Terme der Formel einzeln — damit der Rechner den Rechenweg zeigen kann. */
export function chainLengthBreakdown(input: {
  chainstayMm: number;
  bigChainring: number;
  bigSprocket: number;
}) {
  // Exakt 2 × mm ÷ 12,7 statt der gerundeten 0,157: die Karte zeigt den
  // Rechenweg als „2 × Strebe ÷ 12,7", und mit 0,157 stand dort 66,7 statt
  // der 66,9, die jeder beim Nachrechnen bekommt (09/2026).
  const stay = (2 * input.chainstayMm) / 12.7;
  const ring = input.bigChainring / 2;
  const sprocket = input.bigSprocket / 2;
  const reserve = 2;
  const raw = stay + ring + sprocket + reserve;
  const rounded = Math.ceil(raw);
  return { stay, ring, sprocket, reserve, raw, links: rounded % 2 === 0 ? rounded : rounded + 1 };
}

export function chainLengthLinks(input: {
  chainstayMm: number;
  bigChainring: number;
  bigSprocket: number;
}): number {
  return chainLengthBreakdown(input).links;
}

// ── Antriebskosten: Wachs gegen Öl ──────────────────────────────────────────
//
// Alle Zahlen hier sind Annahmen über typische Laufleistungen und Marktpreise,
// keine Messwerte von Waxcelerate. Sie stehen deshalb sowohl hier als auch in
// ASSUMPTIONS, das die Seite dem Besucher aufklappbar zeigt.
// Shimano XT CS-M8100 12-fach, Strassenpreis 09/2026 (tuning-bikes.de
// 142,80 €, mtb-news-Forum ~129 €). Bis 09/2026 stand hier 85,70 €, das lag
// deutlich unter dem Markt (Luca, 14.09.2026).
export const CASSETTE_PRICE = 130;
// Kettenlaufleistung bis zur Verschleissgrenze. Abgestimmt mit Blog und FAQ
// (articles.ts, i18n.ts): Oel 2.000–3.000 km, Wachs 6.000–12.000 km, also
// grob das Zwei- bis Dreifache (Zero Friction Cycling, Praxiswerte). Bis
// 09/2026 stand hier 4.000 gegen 6.000 km = 1,5x und widersprach dem
// eigenen Claim; jetzt jeweils das vorsichtige Ende: 3.000 gegen 7.500 km.
export const OIL_CHAIN_KM = 3000;
export const OIL_CASSETTE_KM = 15000;  // Kassettenlaufleistung mit Nassöl
export const OIL_PRICE_PER_APP = 1.10; // Öl je Anwendung
export const OIL_APP_INTERVAL_KM = 1000;
/** Kassetten-/Kettenlaufleistung mit Wachs, je Anzahl rotierter Ketten (1/2/3). */
export const WAX_CASSETTE_KM = [30000, 40000, 48000] as const;
export const WAX_CHAIN_KM = [7500, 9500, 11000] as const;


/**
 * Antriebsklassen fuer den Ersparnis-Rechner der Produktseite, als Shimano-
 * 12-fach-Stufen (Luca, 14.09.2026). Ketten = Waxcelerate-Preise der
 * vorgewachsten Kette (M6100 noch nicht im Sortiment, 39,95 € als geplanter
 * Preis), Kassetten = Strassenpreise 09/2026 (Deore ~70 €, XT ~130 €,
 * XTR ~280–300 €). Die Ersparnis haengt fast nur am Teilepreis, deshalb
 * waehlbar. Default ist XT (Index 1).
 */
export const DRIVETRAIN_CLASSES = [
  { id: 'deore', de: 'Deore', en: 'Deore', model: 'M6100', chainPrice: 39.95, cassettePrice: 70 },
  { id: 'xt', de: 'XT', en: 'XT', model: 'M8100', chainPrice: getProductById('chain-m8100')?.price ?? 54.95, cassettePrice: CASSETTE_PRICE },
  { id: 'xtr', de: 'XTR', en: 'XTR', model: 'M9100', chainPrice: getProductById('chain-m9100')?.price ?? 69.95, cassettePrice: 290 },
] as const;

/** Ein Posten der Antriebsrechnung, Oel gegen Wachs, gerundet in Euro/Jahr. */
export interface CostLine { oil: number; wax: number }

export interface DrivetrainCosts {
  oilPerYear: number;
  waxPerYear: number;
  savingsPerYear: number;
  savingsPct: number;
  waxSessionsPerYear: number;
  /**
   * Die drei Posten einzeln, fuer die Aufschluesselung im Umstiegs-Rechner:
   * Kette und Kassette sprechen fuer Wachs, der Schmierstoff dagegen — vorher
   * stand nur die Schmierstoffzeile im Ergebnis, und das ist die eine Zeile,
   * in der Wachs verliert. Lube wird aus der Gesamtsumme abgeleitet statt
   * einzeln gerundet, damit die drei Posten in der Tabelle exakt auf die
   * bereits gerundete Gesamtsumme aufgehen.
   */
  breakdown: { chain: CostLine; cassette: CostLine; lube: CostLine };
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
export function severityFactor(rewaxKm: number): number {
  // Muss der trockenen Strasse aus waxIntervals entsprechen, sonst verschiebt
  // sich die ganze Skala. Nicht importiert, weil hier ein Bezugspunkt gemeint
  // ist und keine Nachschlagetabelle — der Kommentar haelt beide zusammen.
  const DRY_ROAD_REFERENCE_KM = 300;
  return rewaxKm > 0 ? Math.max(1, DRY_ROAD_REFERENCE_KM / rewaxKm) : 1;
}

/** Oel verschleisst unter Schmutz staerker, aber nicht linear zum Intervall:
 *  Exponent 0,5 statt 1 (14.09.2026). Mit 1 hielt eine geoelte Kette bei
 *  "gemischt/Gravel" (Intervall 150 km, Faktor 2) nur 1.500 km und bei nass/
 *  MTB rund 800 km, das rechnete Luca bei 130 km/Woche auf ~4,5 Ketten im
 *  Jahr hoch. Mit 0,5: gemischt/Gravel ~2.100 km, nass/MTB ~1.550 km. */
export const OIL_SEVERITY_EXPONENT = 0.5;
/** Wachs deutlich weniger — bewusst vorsichtig angesetzt. */
export const WAX_SEVERITY_EXPONENT = 0.35;

/**
 * Verbrauch an Ketten und Kassetten pro Jahr, Oel gegen Wachs, mit denselben
 * Laufleistungen und demselben Haerte-Faktor wie drivetrainCosts() — damit
 * die Stueckzahlen und der Euro-Betrag auf der Produktseite dieselbe
 * Rechnung sind. Eine Kette, nicht rotiert.
 */
export function partsPerYear(kmPerYear: number, rewaxKm: number, chains: 1 | 2 | 3 = 1) {
  const sev = severityFactor(rewaxKm);
  const oilWear = Math.pow(sev, OIL_SEVERITY_EXPONENT);
  const waxWear = Math.pow(sev, WAX_SEVERITY_EXPONENT);
  // Rotation wie in drivetrainCosts(): Laufleistung je Kette aus
  // WAX_CHAIN_KM/WAX_CASSETTE_KM[chains - 1], Oel bleibt eine Kette.
  return {
    oil: { chains: (kmPerYear / OIL_CHAIN_KM) * oilWear, cassettes: (kmPerYear / OIL_CASSETTE_KM) * oilWear },
    wax: { chains: (kmPerYear / WAX_CHAIN_KM[chains - 1]) * waxWear, cassettes: (kmPerYear / WAX_CASSETTE_KM[chains - 1]) * waxWear },
  };
}

export function drivetrainCosts(input: {
  kmPerYear: number;
  rewaxKm: number;
  chains: 1 | 2 | 3;
  /** Teilepreise der Antriebsklasse; ohne Angabe die Mittelklasse-Referenz. */
  chainPrice?: number;
  cassettePrice?: number;
}): DrivetrainCosts {
  const { kmPerYear, rewaxKm, chains } = input;
  const chainPrice = input.chainPrice ?? medianChainPrice;
  const cassettePrice = input.cassettePrice ?? CASSETTE_PRICE;
  const waxPerApp = costPerApplication(referenceWax) ?? 0;

  const sev = severityFactor(rewaxKm);
  const oilWear = Math.pow(sev, OIL_SEVERITY_EXPONENT);
  const waxWear = Math.pow(sev, WAX_SEVERITY_EXPONENT);

  const chainOilPerKm = (chainPrice / OIL_CHAIN_KM) * oilWear;
  const cassetteOilPerKm = (cassettePrice / OIL_CASSETTE_KM) * oilWear;
  const lubeOilPerKm = OIL_PRICE_PER_APP / OIL_APP_INTERVAL_KM;
  const oilPerKm = chainOilPerKm + cassetteOilPerKm + lubeOilPerKm;

  const chainWaxPerKm = (chainPrice / WAX_CHAIN_KM[chains - 1]) * waxWear;
  const cassetteWaxPerKm = (cassettePrice / WAX_CASSETTE_KM[chains - 1]) * waxWear;
  const lubeWaxPerKm = waxPerApp / rewaxKm;
  const waxPerKm = chainWaxPerKm + cassetteWaxPerKm + lubeWaxPerKm;

  const oilPerYear = Math.round(kmPerYear * oilPerKm);
  const waxPerYear = Math.round(kmPerYear * waxPerKm);
  const savingsPerYear = Math.max(0, oilPerYear - waxPerYear);

  // Kette und Kassette einzeln runden, den Schmierstoff aus der bereits
  // gerundeten Gesamtsumme ableiten — so gehen die drei Zeilen der
  // Aufschluesselung immer exakt auf die grosse Zahl daneben auf, auch wenn
  // die Einzelrundung sonst um einen Euro abweichen wuerde.
  const chainOil = Math.round(kmPerYear * chainOilPerKm);
  const cassetteOil = Math.round(kmPerYear * cassetteOilPerKm);
  const chainWax = Math.round(kmPerYear * chainWaxPerKm);
  const cassetteWax = Math.round(kmPerYear * cassetteWaxPerKm);

  return {
    oilPerYear,
    waxPerYear,
    savingsPerYear,
    savingsPct: oilPerYear > 0 ? Math.round((savingsPerYear / oilPerYear) * 100) : 0,
    waxSessionsPerYear: Math.ceil(kmPerYear / (chains * rewaxKm)),
    breakdown: {
      chain: { oil: chainOil, wax: chainWax },
      cassette: { oil: cassetteOil, wax: cassetteWax },
      lube: { oil: oilPerYear - chainOil - cassetteOil, wax: waxPerYear - chainWax - cassetteWax },
    },
  };
}

// ── Zeit: der Rotationsvorteil, den bisher niemand vorrechnete ──────────────
//
// Hands-on-Zeit einer Heisswachs-Session: abbauen, aufwickeln, mit kochendem
// Wasser abspuelen, ins Wachs, bewegen, herausnehmen, trocknen, montieren.
// Der Aufwand ist fast vollstaendig fix — der Topf ist der Flaschenhals, nicht
// die Kette. Drei Ketten gleichzeitig kosten laut Luca ein bis zwei Minuten
// mehr, nicht das Dreifache. Genau darin liegt der Zeitgewinn der Rotation,
// und er stand bisher nirgends vorgerechnet.
export const WAX_SESSION_MINUTES = 20;
export const WAX_SESSION_MINUTES_PER_EXTRA_CHAIN = 1;

export function waxHoursPerYear(sessionsPerYear: number, chains: 1 | 2 | 3): number {
  const perSession = WAX_SESSION_MINUTES + (chains - 1) * WAX_SESSION_MINUTES_PER_EXTRA_CHAIN;
  return (sessionsPerYear * perSession) / 60;
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
    label: 'Kettenlaufleistung mit Öl, trockene Straße (Praxis 2.000–3.000 km)',
    labelEn: 'Chain life with oil, dry road (typical 2,000–3,000 km)',
    value: `${OIL_CHAIN_KM.toLocaleString('de-DE')} km`,
    valueEn: `${OIL_CHAIN_KM.toLocaleString('en-US')} km`,
  },
  {
    label: 'Kettenlaufleistung mit Wachs, trockene Straße, 1 / 2 / 3 Ketten (Praxis 6.000–12.000 km)',
    labelEn: 'Chain life with wax, dry road, 1 / 2 / 3 chains (typical 6,000–12,000 km)',
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
  {
    label: 'Zeit je Wachs-Session',
    labelEn: 'Time per waxing session',
    value: `${WAX_SESSION_MINUTES} Minuten für eine Kette, +${WAX_SESSION_MINUTES_PER_EXTRA_CHAIN} Minute je weitere Kette gleichzeitig`,
    valueEn: `${WAX_SESSION_MINUTES} minutes for one chain, +${WAX_SESSION_MINUTES_PER_EXTRA_CHAIN} minute per additional chain at once`,
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
/**
 * Wie lange ein Wachsblock lagerfaehig ist. Stand im alten Vorrat-Rechner als
 * SHELF_LIFE_MONTHS und ging beim Umbau verloren — ohne diese Grenze empfiehlt
 * der Rechner einem Wenigfahrer einen Vorrat fuer drei Jahre.
 */
export const WAX_SHELF_LIFE_MONTHS = 30;

/**
 * Ab wie vielen Wachsungen im Jahr die Heisswachs-Methode allein unpraktisch
 * wird. Oefter als woechentlich den Topf anzuwerfen macht in der Praxis
 * niemand — dort ist Tropfwachs zwischen den Heisswachs-Gaengen der Weg.
 */
export const HYBRID_THRESHOLD_PER_YEAR = 52;

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
  /** Der Block waere vor dem Aufbrauchen ueberlagert — kleinere Packung sinnvoll. */
  outlastsShelfLife: boolean;
  /** So oft wachsen macht praktisch niemand — Hybrid-Methode sinnvoller. */
  needsHybridHint: boolean;
}

export function switchEconomics(input: {
  kmPerYear: number;
  rewaxKm: number;
  toolingCost: number;
  /** Welcher Wachsblock: 300 g ist im Einstieg guenstiger, kostet je
      Wachsung aber mehr. Default der 500er, der Standardbezugspunkt der
      Seite (siehe referenceWax oben). */
  waxProduct?: Product;
}): SwitchEconomics {
  const { kmPerYear, rewaxKm, toolingCost, waxProduct = referenceWax } = input;
  const perApp = costPerApplication(waxProduct) ?? 0;
  const apps = applicationsPerBlock(waxProduct) ?? 0;

  const applicationsPerYear = rewaxKm > 0 ? kmPerYear / rewaxKm : 0;
  const waxPerYear = applicationsPerYear * perApp;
  const oilPerYear = (kmPerYear / OIL_APP_INTERVAL_KM) * OIL_PRICE_PER_APP;

  // Eine Kette, nicht rotiert: der ehrliche Einstiegsfall.
  const { savingsPerYear } = drivetrainCosts({ kmPerYear, rewaxKm, chains: 1 });
  const monthsPerBlock = applicationsPerYear > 0 ? Math.round((apps / applicationsPerYear) * 12) : 0;

  return {
    toolingCost,
    waxPerYear: Math.round(waxPerYear),
    oilPerYear: Math.round(oilPerYear),
    savingsPerYear,
    breakEvenMonths: savingsPerYear > 0 ? Math.max(1, Math.ceil((toolingCost / savingsPerYear) * 12)) : null,
    applicationsPerYear,
    monthsPerBlock,
    outlastsShelfLife: monthsPerBlock > WAX_SHELF_LIFE_MONTHS,
    needsHybridHint: applicationsPerYear > HYBRID_THRESHOLD_PER_YEAR,
  };
}
