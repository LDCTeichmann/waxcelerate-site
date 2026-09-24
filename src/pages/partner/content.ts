// ─── /partner: Inhalte der B2B-Partnerseite ─────────────────────────────────
// Quelle: Partner-Infoblatt (Stand 18.09.2026, PR #45), Claims aus dem
// Waxcelerate-Skill (30_claims_language, 21_b2b_masterplan). Nur Deutsch, Sie-Form.
//
// Regeln, die hier gelten (nicht "verbessern"):
//  - Preise, Ketten und Kundenzahlen kommen aus src/lib/data.ts, nie hart getippt.
//  - An Laeden geht nur MoS2 Pro 500 g (Luca, 24.09.2026): keine Classic- oder 300-g-Zeilen.
//  - Alle Endpreise sind UVP-Empfehlungen (Kartellrecht). Keine Staffelpreise
//    auf dieser oeffentlichen Seite, die stehen nur im Partnerbereich.
//  - Keine internen Margen, keine Formel-Prozente, keine Superlative,
//    "0 EUR Warenrisiko" (nie "0 EUR Risiko"), Intervall 400-550 km (nie 600).
//  - Keine Gedankenstriche als Satzzeichen. Bereiche wie 400–550 sind Zahlen.
//
// Import relativ und ohne "@/": generate-blog-html.mjs laedt diese Datei per
// tsx ohne Pfad-Aufloesung (gleiches Muster wie kettenwachs/content.ts).

import { CONTACT, products, trustStats, type Product } from '../../lib/data';
import type { PartnerShop } from './shops';

export const BASE = 'https://waxcelerate.de';
export const PARTNER_PATH = '/partner';
export const PARTNER_AREA_PATH = '/partner/konditionen';

export const PARTNER_TITLE = 'Partner werden: Kettenwachs und Rewax für den Fachhandel | Waxcelerate';
export const PARTNER_DESCRIPTION =
  'Für Fahrradläden und Werkstätten: Wachs auf Kommission, vorgewachste Ketten und der Tausch-Kreislauf. Sie behalten Kunde, Preis und Gebühr. 0 € Warenrisiko.';
export const PARTNER_H1 = 'Ihre Kunden wachsen schon. Verdienen Sie mit?';
export const PARTNER_LEAD =
  'Wir wachsen die Ketten. Sie tauschen sie in zwei Minuten über den Tresen und behalten den Kunden, den Preis und die Gebühr.';

// ─── Kontakt ────────────────────────────────────────────────────────────────
export const PHONE_DISPLAY = '0157 51957470';
export const PHONE_HREF = 'tel:+4915751957470';

export function whatsappLink(shop: PartnerShop | null): string {
  const intro = shop ? `Hallo Luca, hier ist ${shop.name} aus ${shop.city}. Wir haben` : 'Hallo Luca, ich habe';
  const text =
    `${intro} das Partner-Infoblatt von Waxcelerate gesehen. ` +
    'Können wir kurz sprechen, wie ein Start als Partner aussehen würde?';
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

// ─── Zahlen aus data.ts ─────────────────────────────────────────────────────
const byId = (id: string): Product => {
  const p = products.find((x) => x.id === id);
  if (!p) throw new Error(`partner/content: Produkt ${id} fehlt in data.ts`);
  return p;
};

export const COMMISSION_PCT = 30;
export const DIRECT_BUY_MAX_PCT = 45;
/** "rund 10,50 EUR je verkauftem Block": 30 % vom UVP des MoS2 Pro 500 g (34,95 EUR), auf halbe Euro gerundet.
 *  An Laeden geht nur noch Pro 500 g (Luca, 24.09.2026). */
export const commissionPerBlock = Math.round(((byId('wax-500-mos2').price * COMMISSION_PCT) / 100) * 2) / 2;
const commissionText = commissionPerBlock.toFixed(2).replace('.', ',');

export const TRUST_LINE = `Über ${trustStats.sold} verkaufte Einheiten, 100 % positives Feedback, ${trustStats.reviews} Bewertungen.`;

/** Co-Branding ab dieser Menge im Direktkauf (Pro 500 g, eine Etikettenvariante), nie auf Kommissionsware.
 *  Entschieden 24.09.2026: 16 Bloecke = volles 10-kg-DHL-Paket (0,6 kg je Block). Rechnung: Die Erstbestellung
 *  bringt dann rund 185 EUR Gewinn, die Co-Branding-Kosten (Etikett + 10 EUR Einrichtung + 5 EUR Zeit) liegen
 *  bei 0,30 bis 1,20 EUR je Etikett bei 11 bis 19 %. Darueber (Etikett teurer) wieder anheben.
 *  Infoblatt #45 nennt noch 20, Masterplan 10. */
export const COBRANDING_MIN_BLOCKS = 16;

// ─── Marktpreise (Luecke) ───────────────────────────────────────────────────
export const GAP = {
  question: 'Was machen Sie, wenn ein Kunde mit gewachster Kette zur Inspektion kommt?',
  items: [
    { label: 'Nachwachsen einer Kette', value: '35–64 €', note: 'Das nehmen Werkstätten und Versanddienste heute dafür.' },
    { label: 'Erstumstellung auf Wachs', value: 'bis 145 €', note: 'Einmalig, mit Reinigung und erstem Wachsen.' },
  ],
  source:
    'Öffentliche Preislisten deutscher Werkstätten und Versanddienste, Stand 07/2026. Wer vor Ort keinen Anbieter findet, schickt die Kette per Post. An Ihrer Kasse vorbei.',
  frequency: 'Aus einem Werkstattbesuch im Jahr werden sechs.',
  frequencyNote: 'Vier bis zehn Wachsgänge im Jahr, also vier bis zehn Besuche, jeder mit Beratung und Zubehör-Chance.',
};

// ─── Drei Wege ──────────────────────────────────────────────────────────────
export const WAYS = [
  {
    no: '01',
    name: 'Regal',
    figure: `${COMMISSION_PCT} % Kommission`,
    text: `Wachs auf Kommission, rund ${commissionText} € je verkauftem Block. Bis ${DIRECT_BUY_MAX_PCT} % im Direktkauf. Kein Einkauf, keine Kapitalbindung.`,
  },
  {
    no: '02',
    name: 'Ketten',
    figure: '2 Typen lagern',
    text: 'Vorgewachst und einbaufertig. Sie lagern zwei Typen, den Rest liefern wir in 48–72 h. Ketten gibt es nur im Direktkauf, nicht auf Kommission.',
  },
  {
    no: '03',
    name: 'Kreislauf',
    figure: '5–10 € je Tausch',
    text: 'Kette raus, gewachste rein. Zwei Minuten, wiederkehrend. Ihre Gebühr setzen Sie selbst.',
  },
];
export const WAYS_NOTE = 'Kombinierbar. Die meisten Partner starten mit Regal und Kreislauf.';

// ─── Kreislauf ──────────────────────────────────────────────────────────────
export const CYCLE = [
  { who: 'Kunde', text: 'Kette fällig nach 400–550 km, je nach Bedingungen.' },
  { who: 'Ihr Shop', text: 'Gibt eine gewachste heraus. Zwei Minuten über den Tresen, ohne Werkzeug. Gesammelt wird in einer Box auf der Theke.' },
  { who: 'Waxcelerate', text: 'Reinigt und wachst. Gleiches Ergebnis bei jeder Kette. Sie senden ab 5 Ketten ein, gewachst zurück in der Regel nach etwa 5 Werktagen (3 Werktage Bearbeitung ab Ankunft, dazu Post).' },
];
export const CYCLE_NOTE =
  'Woanders steht das Rad dafür einen Tag in der Werkstatt oder eine Woche bei der Post. Bei Ihnen dauert es zwei Minuten, und die Zweitkette beim Kunden macht die Laufzeit unwichtig. Neue Ketten aus dem Lager liefern wir in 48–72 h.';

/** Rechenbeispiel wie im Infoblatt: 20 Rotationskunden x 5 Tausche x 7,50 EUR. */
export const EXAMPLE = { customers: 20, swapsPerYear: 5, minutesPerSwap: 2, feeEur: 7.5 };
export const exampleResult = (() => {
  const swaps = EXAMPLE.customers * EXAMPLE.swapsPerYear;
  const hours = (swaps * EXAMPLE.minutesPerSwap) / 60;
  const revenue = swaps * EXAMPLE.feeEur;
  return { swaps, hours, revenue, perHour: revenue / hours };
})();
export const EXAMPLE_NOTE =
  'Rechenbeispiel mit einer angenommenen Tauschgebühr von 7,50 €. Ihre Gebühr und alle Endpreise bestimmen Sie selbst. Die Rewax-Kosten von unter 10 € je Kette trägt Ihr Kunde, er zahlt je Tausch also rund 15 bis 20 €.';

// ─── Aufwand und Beleg ──────────────────────────────────────────────────────
export const EFFORT = {
  title: 'Wachsen kostet Werkbank.',
  lead: 'Nicht das Wachs ist das Problem, sondern die Zeit davor und danach. Genau die nehmen wir Ihnen ab und lassen Ihnen den Kunden.',
  before: { label: 'Selbst wachsen', value: '30–45 Min.', text: 'Vorbereitung pro Kette: entfetten, trocknen, schmelzen, tauchen, aushärten. Im Frühjahr steht jede Kette im Topf gegen einen Auftrag, den Sie abrechnen könnten.' },
  after: { label: 'Mit uns', value: '2 Min.', text: 'Kette tauschen, fertig. Kein Topf, kein Ultraschall, keine Wachsentsorgung. Im Peak keine Warteschlange.' },
  note: 'Referenzwerte aus veröffentlichten Preislisten und Prozessbeschreibungen deutscher Wachs-Werkstätten und Versanddienste, Stand 07/2026. Keine Preisempfehlung.',
};
export const PROOF = {
  title: 'Verschleiß frisst die Zahnflanke.',
  text: 'Schleifpaste aus Öl und Staub trägt die Flanken der Kassette ab. Die Kette greift schlechter und längt sich schneller. Trockenes Wachs bindet diesen Staub nicht, deshalb läuft die Kette deutlich länger, oft zwei- bis dreimal so lange. Für Ihren Kunden: seltener die teuren Teile. Für Sie: er kommt trotzdem öfter, zum Tausch statt zur Reparatur.',
  keep: { title: 'Sie behalten', text: 'Kunde, Endpreis und Tauschgebühr bei jedem Besuch. Ihre Kunden bleiben Ihre Kunden.' },
  take: { title: 'Wir übernehmen', text: 'Reinigen und Wachsen. Ultraschall-entfettet, gewachst, versiegelt, einbaufertig. Gleiches Ergebnis bei jeder Kette.' },
};

// ─── Sortiment (Preise = UVP-Empfehlung aus data.ts) ────────────────────────
export const RANGE_NOTE = 'Alle Endkundenpreise sind unverbindliche Preisempfehlungen. Ihre Preise bestimmen Sie.';
export const WAX_NOTE =
  'PFAS-frei und zukunftssicher, unabhängig vom Ausgang des EU-Verfahrens. Ein Block leistet 15–20 Wachsvorgänge, je Vorgang 400–550 km trocken.';
export const CHAINS_NOTE =
  'Ultraschall-entfettet, mit Pro (MoS₂) gewachst, versiegelt und einbaufertig. Quick-Link liegt bei. Handgewachst in Stuttgart. Wunschkette auf Anfrage.';
export const CARDS = {
  title: 'Stempelkarten',
  lead: 'Umsatz heute, Leistung später. Nicht eingelöste Stempel bleiben Ihre Marge. Blanko geliefert, co-brandbar mit Ihrem Logo.',
  sizes: ['5er-Karte', '10er-Karte'],
  // Bewusst ohne Euro-Empfehlung: die Website verkauft dieselben Karten direkt (49,75 / 94,50 EUR),
  // eine hoehere Handelsempfehlung waere ein Widerspruch (docs/plaene/PARTNER_SEITE.md, P09).
  note: 'Die Karte gibt Ihr Shop aus und setzt den Preis, wir liefern den Service. Eine Preisempfehlung nennen wir Ihnen im Gespräch.',
};

/** Wachs- und Ketten-Listen fuer die Seite, alles aus data.ts. */
export function partnerWax(): Product[] {
  return products.filter((p) => p.id === 'wax-500-mos2');
}
export function partnerChains(): Product[] {
  return products
    .filter((p) => p.category === 'chain' && !p.soldOut)
    .sort((a, b) => b.price - a.price);
}

// ─── Testpaket und Start ────────────────────────────────────────────────────
export const TRIAL = {
  title: 'Das Testpaket',
  badge: '0 € Warenrisiko',
  lead: 'Unverkauftes holen wir auf unsere Kosten zurück. Kommissionsware, also kein Einkauf und keine Kapitalbindung.',
  items: [
    '8 Blöcke MoS₂ Pro in einem Paket: 7 auf Kommission und 1 gratis für die Werkstatt, zum Selbsttesten',
    'Ketten ab Tag 1 lieferbar',
    'Blanko-Stempelkarten, kostenlos',
    `Co-Branding: Ihr Logo auf dem Etikett, ab ${COBRANDING_MIN_BLOCKS} Blöcken im Direktkauf ohne Aufpreis`,
  ],
};
export const STEPS = [
  { no: '01', text: 'Kurz anrufen oder schreiben.' },
  { no: '02', text: 'Antwort am selben Tag.' },
  { no: '03', text: 'Testpaket in 48–72 Stunden.' },
];

// ─── Fragen von Inhabern ────────────────────────────────────────────────────
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Nehmen Sie mir Kunden weg?',
    a: 'Nein. Ihre Kunden bleiben Ihre Kunden. Im Rewax-Kreislauf läuft alles über Ihren Tresen, dort haben wir nie Kontakt zum Endkunden. Kunde, Endpreis und Tauschgebühr bleiben bei Ihnen.',
  },
  {
    q: 'Was muss ich lagern?',
    a: 'Beim Wachs nichts, was Sie einkaufen müssten: Es läuft auf Kommission. Bei den Ketten genügen zwei Typen, passend zu Ihrer Kundschaft. Den Rest liefern wir in 48–72 h. Wachs verdirbt nicht, gehört im Sommer aber nicht ins sonnige Schaufenster.',
  },
  {
    q: 'Wer legt die Preise fest?',
    a: 'Sie. Alle Preise auf dieser Seite sind unverbindliche Empfehlungen. Auch Ihre Tauschgebühr bestimmen Sie selbst.',
  },
  {
    q: 'Was kostet mich der Einstieg?',
    a: 'Das Testpaket läuft auf Kommission, es gibt kein Warenrisiko. Die Konditionen für Kauf, Rewax und Mengen erhalten Partner im geschützten Bereich oder im Gespräch.',
  },
  {
    q: 'Was, wenn ich lieber selbst wachse?',
    a: 'Auch das geht. Anleitung und Großgebinde gibt es ebenfalls. Sie legen sich nicht fest.',
  },
];

export const EXCLUSIVITY = 'Wir suchen zwei bis drei Partner pro Stadt, mehr nicht.';
export const LEGAL_LINE = 'Luca Teichmann · Waxcelerate, Stuttgart · Kleinunternehmer nach § 19 UStG, keine Umsatzsteuer ausgewiesen.';

// ─── Vorrender-Text fuer Crawler (scripts/generate-blog-html.mjs) ───────────
export const PARTNER_POINTS: string[] = [
  `${PARTNER_LEAD}`,
  `${GAP.items[0].label}: ${GAP.items[0].value}. ${GAP.items[1].label}: ${GAP.items[1].value}. ${GAP.frequency}`,
  ...WAYS.map((w) => `${w.name}: ${w.figure}. ${w.text}`),
  `Testpaket: ${TRIAL.badge}. ${TRIAL.lead}`,
  EXCLUSIVITY,
  `Kontakt: WhatsApp und Telefon ${PHONE_DISPLAY}.`,
];
