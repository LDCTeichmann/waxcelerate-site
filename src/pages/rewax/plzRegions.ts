// ─── PLZ-Leitregionen → Ort, Koordinaten, Bundesland ────────────────────────
// Die ersten zwei Ziffern einer Postleitzahl (95 vergebene Leitregionen;
// 00, 05, 11, 43 und 62 gibt es nicht). Je Region die größte Stadt als
// Wetterpunkt — Bright Sky sucht die nächste DWD-Station im Umkreis von 50 km,
// genauer muss es für eine Wochenvorschau nicht sein. Das Bundesland der
// Stadt entscheidet über die Feiertage im Rückgabe-Fenster (dates.ts);
// Regionen über Landesgrenzen hinweg bekommen das Land ihrer Hauptstadt.
//
// Kein Browser-Standortzugriff: der Ort kommt grob aus der Verbindung
// (/api/locate → nearestRegion) oder aus der getippten PLZ, die im Browser bleibt.

import type { State } from './dates';
import { REWAX_CITIES, type RewaxCity } from './cities';

export interface PlzRegion { code: string; name: string; lat: number; lon: number; state: State }

const R: [string, string, number, number, State][] = [
  ['01', 'Dresden', 51.05, 13.74, 'SN'], ['02', 'Bautzen', 51.18, 14.42, 'SN'], ['03', 'Cottbus', 51.76, 14.33, 'BB'],
  ['04', 'Leipzig', 51.34, 12.37, 'SN'], ['06', 'Halle (Saale)', 51.48, 11.97, 'ST'], ['07', 'Gera', 50.88, 12.08, 'TH'],
  ['08', 'Zwickau', 50.72, 12.49, 'SN'], ['09', 'Chemnitz', 50.83, 12.92, 'SN'],
  ['10', 'Berlin', 52.52, 13.40, 'BE'], ['12', 'Berlin', 52.44, 13.45, 'BE'], ['13', 'Berlin', 52.59, 13.33, 'BE'],
  ['14', 'Potsdam', 52.40, 13.06, 'BB'], ['15', 'Frankfurt (Oder)', 52.34, 14.55, 'BB'], ['16', 'Eberswalde', 52.83, 13.82, 'BB'],
  ['17', 'Neubrandenburg', 53.56, 13.26, 'MV'], ['18', 'Rostock', 54.09, 12.10, 'MV'], ['19', 'Schwerin', 53.63, 11.41, 'MV'],
  ['20', 'Hamburg', 53.55, 9.99, 'HH'], ['21', 'Lüneburg', 53.25, 10.41, 'NI'], ['22', 'Hamburg', 53.62, 10.03, 'HH'],
  ['23', 'Lübeck', 53.87, 10.69, 'SH'], ['24', 'Kiel', 54.32, 10.14, 'SH'], ['25', 'Itzehoe', 53.92, 9.52, 'SH'],
  ['26', 'Oldenburg', 53.14, 8.21, 'NI'], ['27', 'Bremerhaven', 53.54, 8.58, 'HB'], ['28', 'Bremen', 53.08, 8.80, 'HB'],
  ['29', 'Celle', 52.62, 10.08, 'NI'],
  ['30', 'Hannover', 52.37, 9.74, 'NI'], ['31', 'Hildesheim', 52.15, 9.95, 'NI'], ['32', 'Herford', 52.12, 8.67, 'NW'],
  ['33', 'Bielefeld', 52.02, 8.53, 'NW'], ['34', 'Kassel', 51.31, 9.48, 'HE'], ['35', 'Gießen', 50.58, 8.68, 'HE'],
  ['36', 'Fulda', 50.55, 9.68, 'HE'], ['37', 'Göttingen', 51.54, 9.93, 'NI'], ['38', 'Braunschweig', 52.27, 10.52, 'NI'],
  ['39', 'Magdeburg', 52.13, 11.63, 'ST'],
  ['40', 'Düsseldorf', 51.23, 6.78, 'NW'], ['41', 'Mönchengladbach', 51.19, 6.44, 'NW'], ['42', 'Wuppertal', 51.26, 7.15, 'NW'],
  ['44', 'Dortmund', 51.51, 7.47, 'NW'], ['45', 'Essen', 51.46, 7.01, 'NW'], ['46', 'Oberhausen', 51.47, 6.85, 'NW'],
  ['47', 'Duisburg', 51.43, 6.76, 'NW'], ['48', 'Münster', 51.96, 7.63, 'NW'], ['49', 'Osnabrück', 52.28, 8.05, 'NI'],
  ['50', 'Köln', 50.94, 6.96, 'NW'], ['51', 'Bergisch Gladbach', 50.99, 7.13, 'NW'], ['52', 'Aachen', 50.78, 6.08, 'NW'],
  ['53', 'Bonn', 50.73, 7.10, 'NW'], ['54', 'Trier', 49.75, 6.64, 'RP'], ['55', 'Mainz', 50.00, 8.27, 'RP'],
  ['56', 'Koblenz', 50.36, 7.59, 'RP'], ['57', 'Siegen', 50.87, 8.02, 'NW'], ['58', 'Hagen', 51.36, 7.47, 'NW'],
  ['59', 'Hamm', 51.68, 7.82, 'NW'],
  ['60', 'Frankfurt am Main', 50.11, 8.68, 'HE'], ['61', 'Bad Homburg', 50.23, 8.62, 'HE'], ['63', 'Offenbach', 50.10, 8.77, 'HE'],
  ['64', 'Darmstadt', 49.87, 8.65, 'HE'], ['65', 'Wiesbaden', 50.08, 8.24, 'HE'], ['66', 'Saarbrücken', 49.24, 6.99, 'SL'],
  ['67', 'Ludwigshafen', 49.48, 8.44, 'RP'], ['68', 'Mannheim', 49.49, 8.47, 'BW'], ['69', 'Heidelberg', 49.40, 8.69, 'BW'],
  ['70', 'Stuttgart', 48.78, 9.18, 'BW'], ['71', 'Böblingen', 48.68, 9.01, 'BW'], ['72', 'Tübingen', 48.52, 9.06, 'BW'],
  ['73', 'Esslingen', 48.74, 9.31, 'BW'], ['74', 'Heilbronn', 49.14, 9.22, 'BW'], ['75', 'Pforzheim', 48.89, 8.70, 'BW'],
  ['76', 'Karlsruhe', 49.01, 8.40, 'BW'], ['77', 'Offenburg', 48.47, 7.94, 'BW'], ['78', 'Villingen-Schwenningen', 48.06, 8.46, 'BW'],
  ['79', 'Freiburg', 47.99, 7.85, 'BW'],
  ['80', 'München', 48.14, 11.58, 'BY'], ['81', 'München', 48.11, 11.55, 'BY'], ['82', 'Starnberg', 48.00, 11.34, 'BY'],
  ['83', 'Rosenheim', 47.86, 12.12, 'BY'], ['84', 'Landshut', 48.54, 12.15, 'BY'], ['85', 'Ingolstadt', 48.77, 11.43, 'BY'],
  ['86', 'Augsburg', 48.37, 10.90, 'BY'], ['87', 'Kempten', 47.73, 10.31, 'BY'], ['88', 'Friedrichshafen', 47.65, 9.48, 'BW'],
  ['89', 'Ulm', 48.40, 9.99, 'BW'],
  ['90', 'Nürnberg', 49.45, 11.08, 'BY'], ['91', 'Erlangen', 49.60, 11.00, 'BY'], ['92', 'Amberg', 49.44, 11.86, 'BY'],
  ['93', 'Regensburg', 49.01, 12.10, 'BY'], ['94', 'Passau', 48.57, 13.43, 'BY'], ['95', 'Bayreuth', 49.94, 11.58, 'BY'],
  ['96', 'Bamberg', 49.89, 10.89, 'BY'], ['97', 'Würzburg', 49.79, 9.95, 'BY'], ['98', 'Suhl', 50.61, 10.69, 'TH'],
  ['99', 'Erfurt', 50.98, 11.03, 'TH'],
];

export const PLZ_REGIONS: Record<string, PlzRegion> = Object.fromEntries(
  R.map(([code, name, lat, lon, state]) => [code, { code, name, lat, lon, state }]),
);

/** Region zu einer (Teil-)PLZ, ab zwei Ziffern; sonst null. */
export function regionForPlz(plz: string): PlzRegion | null {
  const digits = plz.replace(/\D/g, '');
  return digits.length >= 2 ? PLZ_REGIONS[digits.slice(0, 2)] ?? null : null;
}

/** Nächste PLZ-Leitregion zu einer (grob geschätzten) Position — für den
 *  automatischen Ort aus /api/locate. */
export function nearestRegion(lat: number, lon: number): PlzRegion {
  const dist = (r: PlzRegion) => {
    const dLat = r.lat - lat, dLon = (r.lon - lon) * Math.cos((lat * Math.PI) / 180);
    return dLat * dLat + dLon * dLon;
  };
  return Object.values(PLZ_REGIONS).reduce((best, r) => (dist(r) < dist(best) ? r : best));
}

/** Nächste der zwölf Städte mit DWD-Klimamitteln — ehrlich als Referenz genannt. */
export function climateReference(r: { lat: number; lon: number }): RewaxCity {
  const dist = (c: RewaxCity) => {
    const dLat = c.lat - r.lat, dLon = (c.lon - r.lon) * Math.cos((r.lat * Math.PI) / 180);
    return dLat * dLat + dLon * dLon;
  };
  return REWAX_CITIES.reduce((best, c) => (dist(c) < dist(best) ? c : best));
}
