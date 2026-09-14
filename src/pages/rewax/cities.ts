// ─── /kette-wachsen-lassen/:stadt — Stadtdaten ──────────────────────────────
// Zwölf Stadtseiten für „Kette wachsen lassen <Stadt>". Bewusst KEINE
// Doorway-Kopien: jede Seite trägt eigene, nachprüfbare Zahlen (Niederschlag,
// Regentage, daraus ein Nachwachs-Intervall) und sagt ehrlich, dass der Service
// per Post aus Stuttgart läuft — keine Filiale, keine Stadtadresse.
//
// REINE DATEN/FUNKTIONEN — auch vom Prerender (scripts/generate-blog-html.mjs)
// importiert, damit vorgerenderte und hydrierte Seite wortgleich sind.
//
// Quellen (abgerufen 2026-09-14):
//   precipMm  DWD, vieljährige Mittelwerte 1991–2020, Jahressumme Niederschlag
//             (opendata.dwd.de/.../multi_annual/mean_91-20/Niederschlag_1991-2020.txt),
//             Station in `dwdStation`.
//   wetDays   Tage mit ≥ 1 mm Niederschlag (Spalte RSK), Mittel 1991–2020,
//             gezählt aus den DWD-Tageswerten derselben Station
//             (.../climate/daily/kl/historical/tageswerte_KL_<id>_*_hist.zip).
//             Beide Werte: © Deutscher Wetterdienst, CC BY 4.0 — kommerziell
//             nutzbar mit Quellenvermerk. (Open-Meteo wäre für eine
//             kommerzielle Seite nicht zulässig, daher bewusst nicht genutzt.)
//   local     Hausrunden-Satz, Orte geprüft 2026-09-14.

import { PRICE, TURNAROUND, TEN_CARD, FIVE_CARD, eur } from './content';

export interface RewaxCity {
  slug: string;
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  dwdStation: string;
  precipMm: number;
  wetDays: number;
  localDe: string;
  localEn: string;
  neighbors: string[];
}

export const REWAX_CITIES: RewaxCity[] = [
  { slug: 'hamburg', name: 'Hamburg', nameEn: 'Hamburg', lat: 53.55, lon: 9.99, dwdStation: 'Hamburg-Fuhlsbüttel', precipMm: 771, wetDays: 128,
    localDe: 'Alsterrunde, Elbradweg, Vier- und Marschlande: flach, windig und oft feucht.',
    localEn: 'Alster loop, Elbe cycle path, the marshlands: flat, windy and often damp.',
    neighbors: ['hannover', 'berlin', 'duesseldorf'] },
  { slug: 'berlin', name: 'Berlin', nameEn: 'Berlin', lat: 52.52, lon: 13.40, dwdStation: 'Berlin-Tempelhof', precipMm: 572, wetDays: 104,
    localDe: 'Havelchaussee, Mauerweg, Grunewald: viel Stadt, vergleichsweise wenig Regen.',
    localEn: 'Havelchaussee, the Wall Trail, Grunewald: lots of city, comparatively little rain.',
    neighbors: ['leipzig', 'dresden', 'hamburg'] },
  { slug: 'muenchen', name: 'München', nameEn: 'Munich', lat: 48.14, lon: 11.58, dwdStation: 'München-Stadt', precipMm: 940, wetDays: 129,
    localDe: 'Isarradweg, Starnberger See, die Voralpen: die niederschlagsreichste der zwölf Städte.',
    localEn: 'Isar cycle path, Lake Starnberg, the Alpine foothills: the wettest of the twelve cities.',
    neighbors: ['nuernberg', 'stuttgart', 'freiburg'] },
  { slug: 'koeln', name: 'Köln', nameEn: 'Cologne', lat: 50.94, lon: 6.96, dwdStation: 'Köln/Bonn', precipMm: 802, wetDays: 131,
    localDe: 'Rheinufer, Königsforst, Bergisches Land: mildes, oft feuchtes Rheinwetter.',
    localEn: 'Rhine banks, Königsforst, Bergisches Land: mild and often damp Rhine weather.',
    neighbors: ['duesseldorf', 'frankfurt', 'hannover'] },
  { slug: 'frankfurt', name: 'Frankfurt', nameEn: 'Frankfurt', lat: 50.11, lon: 8.68, dwdStation: 'Frankfurt/Main', precipMm: 599, wetDays: 107,
    localDe: 'Mainufer, Taunus, Wetterau: eher trocken, im Taunus schnell auf Schotter.',
    localEn: 'Main riverside, Taunus, Wetterau: fairly dry, quickly onto gravel in the Taunus.',
    neighbors: ['koeln', 'stuttgart', 'nuernberg'] },
  { slug: 'leipzig', name: 'Leipzig', nameEn: 'Leipzig', lat: 51.34, lon: 12.37, dwdStation: 'Leipzig/Halle', precipMm: 532, wetDays: 98,
    localDe: 'Neuseenland, Auwald, Elster-Radweg: die niederschlagsärmste der zwölf Städte.',
    localEn: 'Lake district, the floodplain forest, Elster cycle path: the driest of the twelve cities.',
    neighbors: ['dresden', 'berlin', 'nuernberg'] },
  { slug: 'dresden', name: 'Dresden', nameEn: 'Dresden', lat: 51.05, lon: 13.74, dwdStation: 'Dresden-Klotzsche', precipMm: 637, wetDays: 108,
    localDe: 'Elberadweg, Sächsische Schweiz, Dresdner Heide: im Sommer oft gewittrig.',
    localEn: 'Elbe cycle path, Saxon Switzerland, Dresden Heath: often stormy in summer.',
    neighbors: ['leipzig', 'berlin', 'nuernberg'] },
  { slug: 'hannover', name: 'Hannover', nameEn: 'Hanover', lat: 52.37, lon: 9.74, dwdStation: 'Hannover', precipMm: 627, wetDays: 117,
    localDe: 'Maschsee, Eilenriede, Deister: flach bis hügelig, typisch norddeutsch feucht.',
    localEn: 'Maschsee, Eilenriede, the Deister: flat to hilly, typically damp northern weather.',
    neighbors: ['hamburg', 'berlin', 'koeln'] },
  { slug: 'nuernberg', name: 'Nürnberg', nameEn: 'Nuremberg', lat: 49.45, lon: 11.08, dwdStation: 'Nürnberg', precipMm: 601, wetDays: 107,
    localDe: 'Pegnitztal, Fränkische Schweiz, Reichswald: eher trocken, dafür viel Schotter.',
    localEn: 'Pegnitz valley, Franconian Switzerland, Reichswald: fairly dry, lots of gravel.',
    neighbors: ['muenchen', 'stuttgart', 'frankfurt'] },
  { slug: 'duesseldorf', name: 'Düsseldorf', nameEn: 'Düsseldorf', lat: 51.23, lon: 6.78, dwdStation: 'Düsseldorf', precipMm: 751, wetDays: 128,
    localDe: 'Rheinufer, Neandertal, Bergisches Land: mild und oft nass.',
    localEn: 'Rhine banks, Neander valley, Bergisches Land: mild and often wet.',
    neighbors: ['koeln', 'hannover', 'frankfurt'] },
  { slug: 'freiburg', name: 'Freiburg', nameEn: 'Freiburg', lat: 47.99, lon: 7.85, dwdStation: 'Freiburg', precipMm: 887, wetDays: 124,
    localDe: 'Schauinsland, Kaiserstuhl, Schwarzwald: lange Anstiege und viel Regen am Berg.',
    localEn: 'Schauinsland, Kaiserstuhl, Black Forest: long climbs and plenty of rain on the hills.',
    neighbors: ['stuttgart', 'muenchen', 'frankfurt'] },
  { slug: 'stuttgart', name: 'Stuttgart', nameEn: 'Stuttgart', lat: 48.78, lon: 9.18, dwdStation: 'Stuttgart (Schnarrenberg)', precipMm: 691, wetDays: 112,
    localDe: 'Schönbuch, Remstal, Fildern: unsere eigenen Hausrunden, hier wachsen wir.',
    localEn: 'Schönbuch, Rems valley, Fildern: our own home loops, this is where we wax.',
    neighbors: ['freiburg', 'nuernberg', 'muenchen'] },
];

export const cityBySlug = (slug: string | undefined) => REWAX_CITIES.find((c) => c.slug === slug);

// Gesamtdauer ab Einwurf: Post hin (1–2) + Bearbeitung (3–5) + Post zurück (1–2).
export const DOOR_TO_DOOR = { de: '5–9 Werktage', en: '5–9 working days' } as const;

// ── Nachwachs-Intervall aus dem Klima ───────────────────────────────────────
// Dieselben Straßen-Stützwerte wie /rechner/intervall (waxIntervals in
// src/lib/data.ts: trocken 300 km, nass 150 km). Annahme: gefahren wird an
// nassen wie an trockenen Tagen gleich viel. Dann ist das Intervall das
// gewichtete harmonische Mittel — jeder nasse Kilometer verbraucht doppelt so
// viel Wachs. Ergebnis auf 10 km gerundet.
const DRY_KM = 300;
const WET_KM = 150;
export function cityIntervalKm(c: RewaxCity): number {
  const f = c.wetDays / 365;
  return Math.round(1 / ((1 - f) / DRY_KM + f / WET_KM) / 10 + 1e-9) * 10;
}
export const rewaxesPerYear = (c: RewaxCity, kmPerYear: number) => Math.max(1, Math.round(kmPerYear / cityIntervalKm(c)));
/** Karte, die zu dieser Häufigkeit passt — oder keine. */
export function cardFor(n: number) {
  if (n >= 8) return TEN_CARD;
  if (n >= 4) return FIVE_CARD;
  return null;
}

// ── Meta, FAQ, Schema ───────────────────────────────────────────────────────
const BASE_URL = 'https://waxcelerate.de/kette-wachsen-lassen';
const ORGANIZATION_ID = 'https://waxcelerate.de/#organization';
export const cityUrl = (c: RewaxCity) => `${BASE_URL}/${c.slug}`;

export function cityMeta(c: RewaxCity, de: boolean) {
  const n = de ? c.name : c.nameEn;
  return {
    title: de
      ? `Fahrradkette wachsen lassen in ${n} — per Post | Waxcelerate`
      : `Chain waxing service for ${n} — by mail | Waxcelerate`,
    description: de
      ? `Kette aus ${n} einschicken, frisch gewachst zurück in ${DOOR_TO_DOOR.de}. Ab ${eur(PRICE.rewax.single)}. Mit ${n}er Klima: ${c.wetDays} Regentage im Jahr, Nachwachsen etwa alle ${cityIntervalKm(c)} km.`
      : `Mail your chain from ${n}, back freshly waxed in ${DOOR_TO_DOOR.en}. From ${eur(PRICE.rewax.single, false)}. ${n} climate: ${c.wetDays} rain days a year, rewax roughly every ${cityIntervalKm(c)} km.`,
  };
}

export function cityLead(c: RewaxCity, de: boolean) {
  const n = de ? c.name : c.nameEn;
  return de
    ? `Von ${n} per Großbrief zu uns nach Stuttgart, frisch gewachst zurück. Meist ${DOOR_TO_DOOR.de} ab Einwurf, ab ${eur(PRICE.rewax.single)} je Kette.`
    : `From ${n} to us in Stuttgart as a letter, back freshly waxed. Usually ${DOOR_TO_DOOR.en} from posting, from ${eur(PRICE.rewax.single, false)} per chain.`;
}

export function cityClimateSentence(c: RewaxCity, de: boolean) {
  const n = de ? c.name : c.nameEn;
  return de
    ? `In ${n} fallen im Mittel ${c.precipMm} mm Niederschlag im Jahr, an rund ${c.wetDays} Tagen mindestens 1 mm. Wer bei jedem Wetter fährt, sollte die Kette deshalb etwa alle ${cityIntervalKm(c)} km nachwachsen — auf trockener Straße hält sie ${DRY_KM} km.`
    : `${n} gets ${c.precipMm} mm of precipitation a year on average, with at least 1 mm on about ${c.wetDays} days. Riding in all weather, rewax roughly every ${cityIntervalKm(c)} km — on dry roads a chain lasts ${DRY_KM} km.`;
}

export function cityFaqItems(c: RewaxCity, de: boolean) {
  const n = de ? c.name : c.nameEn;
  const per3000 = rewaxesPerYear(c, 3000);
  return [
    {
      q: de ? `Kann ich meine Fahrradkette in ${n} wachsen lassen?` : `Can I get my bike chain waxed in ${n}?`,
      a: de
        ? `Ja, per Post. Wir haben keine Filiale in ${n}: Du öffnest die Kette am Quick-Link und schickst sie als Großbrief (${eur(PRICE.shippingSingle)}) zu uns nach Stuttgart. Wir wachsen sie in ${TURNAROUND.full} und schicken sie zurück — insgesamt meist ${DOOR_TO_DOOR.de}.`
        : `Yes, by mail. We have no shop in ${n}: open the chain at the quick link and send it as a letter to us in Stuttgart. We wax it within ${TURNAROUND.fullEn} and send it back — usually ${DOOR_TO_DOOR.en} in total.`,
    },
    {
      q: de ? `Wie oft muss ich die Kette in ${n} nachwachsen?` : `How often should I rewax in ${n}?`,
      a: cityClimateSentence(c, de) + (de
        ? ` Bei 3.000 km im Jahr sind das etwa ${per3000} Auffrischungen.`
        : ` At 3,000 km a year that is about ${per3000} rewaxes.`),
    },
    {
      q: de ? `Was kostet es, die Kette aus ${n} wachsen zu lassen?` : `What does it cost from ${n}?`,
      a: de
        ? `Eine bereits gewachste Kette frischen wir für ${eur(PRICE.rewax.single)} auf, eine geölte oder neue stellen wir für ${eur(PRICE.umstieg.single)} auf Wachs um, jeweils plus ${eur(PRICE.shippingSingle)} Rückversand. Der Preis ist in ${n} derselbe wie überall in Deutschland.`
        : `We rewax an already-waxed chain for ${eur(PRICE.rewax.single, false)}, and switch an oiled or new chain to wax for ${eur(PRICE.umstieg.single, false)}, each plus return shipping. The price in ${n} is the same as anywhere in Germany.`,
    },
  ];
}

export function cityServiceSchema(c: RewaxCity, de: boolean) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: de ? `Kettenwachs-Service per Post für ${c.name}` : `Chain wax service by mail for ${c.nameEn}`,
    serviceType: de ? 'Kettenwachs-Service' : 'Chain waxing service',
    provider: { '@id': ORGANIZATION_ID },
    areaServed: { '@type': 'City', name: c.name, geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lon } },
    url: cityUrl(c),
    offers: {
      '@type': 'AggregateOffer', priceCurrency: 'EUR',
      lowPrice: PRICE.rewax.bundle.toFixed(2), highPrice: PRICE.umstieg.single.toFixed(2),
    },
  };
}

export function cityBreadcrumbSchema(c: RewaxCity, de: boolean) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Waxcelerate', item: 'https://waxcelerate.de/' },
      { '@type': 'ListItem', position: 2, name: de ? 'Kette wachsen lassen' : 'Chain waxing service', item: BASE_URL },
      { '@type': 'ListItem', position: 3, name: de ? c.name : c.nameEn, item: cityUrl(c) },
    ],
  };
}

export function cityFaqSchema(c: RewaxCity, de: boolean) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cityFaqItems(c, de).map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}
