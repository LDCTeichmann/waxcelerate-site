// ─── /kette-wachsen-lassen — geteilter Inhalt ────────────────────────────────
// Preise, FAQ, Meta-Texte, Service-Copy und der Umstieg-Flag an EINER Stelle,
// importiert von src/pages/RewaxPage.tsx UND scripts/generate-blog-html.mjs
// (via tsx). So sind das vorgerenderte HTML und die hydrierte Seite garantiert
// wortgleich — kein Auseinanderdriften von FAQ-Antworten, Preisen oder
// Schema-Offers, das vorher der Grund für die "Wortlaut deckungsgleich"-
// Kommentare war.
//
// REINE DATEN/FUNKTIONEN — kein React, kein JSX. Muss auch im Node-Kontext des
// Prerender-Skripts laufen.

// ── Zwei Leistungen ─────────────────────────────────────────────────────────
//   Auffrischung  — eine bereits gewachste Kette neu wachsen (der Wiederkauf,
//                   der einzige wiederkehrende Umsatz im ganzen Modell)
//   Umstieg       — eine geölte oder fabrikneue Kette: separates Lösemittelbad,
//                   gründlich entfetten, vollständig trocknen, dann ERSTMALS
//                   wachsen. Wie das volle Programm des Wettbewerbs, nur
//                   günstiger.
//
// Die Physik hinter dem separaten Bad: Öl schwimmt im Wachsbad oben auf und
// blockiert die Penetration — eine einzige ölige Kette macht eine ganze Charge
// unbrauchbar. Deshalb sieht das Wachsbad NIE eine ölige Kette; sie wird vorher
// in einem eigenen Prozess entfettet. Früher war das der Grund, geölte Ketten
// abzulehnen — jetzt ist es der Grund, warum der Umstieg seinen eigenen Ablauf
// (und Preis) hat.

export const PRICE = {
  rewax: { single: 15.95, bundle: 11.95 }, // Auffrischung (war 13,95 / 9,95)
  umstieg: { single: 24.95, bundle: 21.95 }, // Umstieg — entfetten + erstwachsen
  bundleCount: 3,
  // Eine Kette passt in den Großbrief (1,80 €). Drei Ketten brauchen den
  // Maxibrief (2,90 €) — deshalb zwei Rückversandpreise statt einem.
  shippingSingle: 1.80,
  shippingBundle: 2.90,
} as const;

// Wettbewerbspreise für die Umstieg-Preiszeile (volles Programm inkl. Entfetten).
// Stand docs/plaene/SICHTBARKEIT_PLAN.md §2. Konkrete Zahlen nennen, nie
// "~30 % günstiger" behaupten — gemessen statt behauptet.
export const COMPETITOR_FULL_SERVICE = [
  { name: 'Kettenhelden', price: 39.95 },
  { name: 'bikeoptimierung.de', price: 34.9 },
] as const;

// ── Umstieg-Flag ────────────────────────────────────────────────────────────
// Der Umstieg-Service setzt voraus, dass geölte Ketten in einem SEPARATEN
// Prozess (eigenes Lösemittelbad, Trocknung) VOR dem Wachsbad entfettet werden.
// Solange der Betrieb das nicht sicher leistet, bleibt der Flag auf false:
//   - keine Leistungswahl im Hero, Formular ist reine Auffrischung wie bisher
//   - `Pricing` zeigt nur die Auffrischung
//   - keine Umstieg-FAQ, kein Umstieg-Offer im Service-Schema
//   - Meta-Description nennt nur die Auffrischung
// Umschalten = diese eine Zeile. Alles andere (Preis-Anhebung auf 15,95 €, alle
// SEO-/Conversion-Fixes) ist von diesem Flag unabhängig und geht sofort live.
export const UMSTIEG_LIVE = true;

// Umlaufzeit hin und zurück, als Spanne (nie als Versprechen einer festen Zahl).
// Von Luca zu bestätigen. `de`/`en` = Grundform ("3–5 Werktage"), `deIn`/`enIn`
// = die Präpositionalform für "zurück in …".
export const TURNAROUND = {
  de: '3–5 Werktage', en: '3–5 working days',
  deIn: 'in 3 bis 5 Werktagen', enIn: 'in 3 to 5 working days',
} as const;

// Städte für den "deutschlandweit"-Absatz und die Stadt-FAQ. Ehrlich als
// Wohnorte von Kunden genannt, nie als Waxcelerate-Standorte. KEINE
// Doorway-Stadtseiten — eine starke nationale Seite.
export const CITIES = ['Hamburg', 'München', 'Köln', 'Berlin', 'Leipzig'] as const;

export type ServiceId = 'rewax' | 'umstieg';

// ── Prepaid-Karten (nur Auffrischung) ───────────────────────────────────────
// `list` ist abgeleitet (Einzelpreis × Anzahl), damit der Anker nie driftet.
// `price` ist gesetzt — eine Geschäftsentscheidung (All-in: deckt Wachsen UND
// Rückversand). Die Karte zeigt nur die Euro-Ersparnis, keinen Prozentsatz:
// "Du sparst 30 €" ist eine Tatsache, "38 %" eine Behauptung über den
// Normalpreis (dieselbe Regel wie beim Starter-Set).
export const TEN_CARD = {
  count: 10,
  get list() { return PRICE.rewax.single * this.count; }, // 159,50 €
  price: 94.5, // 9,45 €/Vorgang, Rückversand inklusive
};
export const FIVE_CARD = {
  count: 5,
  get list() { return PRICE.rewax.single * this.count; }, // 79,75 €
  price: 49.75, // 9,95 €/Vorgang, Rückversand inklusive
};

export const eur = (n: number, de = true) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// ── Meta ────────────────────────────────────────────────────────────────────
export function rewaxMeta(de: boolean) {
  const title = de
    ? 'Fahrradkette wachsen lassen — Kettenwachs-Service aus Stuttgart | Waxcelerate'
    : 'Rewax & first-wax service for bicycle chains | Waxcelerate';
  const description = de
    ? (UMSTIEG_LIVE
      ? `Kette einschicken, frisch gewachst zurück. Auffrischung ab ${eur(PRICE.rewax.single)}, geölte Kette auf Wachs umstellen ab ${eur(PRICE.umstieg.single)}, jeweils zzgl. Rückversand. Handgewachst in Stuttgart, deutschlandweit per Post.`
      : `Gewachste Kette einschicken, frisch gewachst zurückbekommen. Ab ${eur(PRICE.rewax.single)} je Kette, ${eur(PRICE.rewax.bundle)} ab drei Ketten, zzgl. Rückversand. Handgewachst in Stuttgart, deutschlandweit per Post.`)
    : (UMSTIEG_LIVE
      ? `Send in your chain, get it back freshly waxed. Rewax from ${eur(PRICE.rewax.single, false)}, oil-to-wax switch from ${eur(PRICE.umstieg.single, false)}, plus return shipping. Hand-waxed in Stuttgart, nationwide by mail.`
      : `Send in your waxed chain, get it back freshly waxed. From ${eur(PRICE.rewax.single, false)} per chain, ${eur(PRICE.rewax.bundle, false)} from three chains, plus return shipping. Hand-waxed in Stuttgart.`);
  return { title, description };
}

// ── JSON-LD ─────────────────────────────────────────────────────────────────
// Von RewaxPage.tsx (client-Helmet) UND vom Prerender genutzt — ein Builder,
// damit die Schemata garantiert identisch sind. `provider` per @id auf den
// echten Organization-Knoten aus index.html. `areaServed` als echtes Country.
// Kein `aggregateRating`: die sitewide "200+" sind Wachs-Produktrezensionen,
// nicht Service-Bewertungen.
const CANONICAL_URL = 'https://waxcelerate.de/kette-wachsen-lassen';
const ORGANIZATION_ID = 'https://waxcelerate.de/#organization';

export function rewaxServiceSchema(de: boolean) {
  const offer = (name: string, price: number) => ({
    '@type': 'Offer', name, price: price.toFixed(2), priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  });
  const catalogs: unknown[] = [
    {
      '@type': 'OfferCatalog', name: de ? 'Auffrischung' : 'Rewax',
      itemListElement: [
        offer(de ? 'Auffrischung, eine Kette' : 'Rewax, one chain', PRICE.rewax.single),
        offer(de ? 'Auffrischung, ab drei Ketten je Kette' : 'Rewax, from three chains per chain', PRICE.rewax.bundle),
      ],
    },
  ];
  if (UMSTIEG_LIVE) {
    catalogs.push({
      '@type': 'OfferCatalog', name: de ? 'Umstieg von Öl auf Wachs' : 'Oil-to-wax switch',
      itemListElement: [
        offer(de ? 'Umstieg, eine Kette' : 'Switch, one chain', PRICE.umstieg.single),
        offer(de ? 'Umstieg, ab drei Ketten je Kette' : 'Switch, from three chains per chain', PRICE.umstieg.bundle),
      ],
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: de ? 'Kettenwachs-Service' : 'Chain wax service',
    alternateName: de
      ? ['Rewax-Service', 'Fahrradkette wachsen lassen', 'Kette entfetten und wachsen', 'Wachsservice für Fahrradketten']
      : ['Rewax service', 'Get your bike chain waxed', 'Chain degrease and wax', 'Bicycle chain waxing service'],
    serviceType: de ? 'Kettenwachs-Service' : 'Chain waxing service',
    provider: { '@id': ORGANIZATION_ID },
    areaServed: { '@type': 'Country', name: 'Deutschland' },
    url: CANONICAL_URL,
    hasOfferCatalog: { '@type': 'OfferCatalog', name: de ? 'Leistungen' : 'Services', itemListElement: catalogs },
  };
}

export function rewaxFaqSchema(de: boolean) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rewaxFaqItems(de).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

// ── FAQ ─────────────────────────────────────────────────────────────────────
// Preise kommen aus PRICE/eur(), nie neu getippt. `link` (optional) rendert die
// Seite als <Link>, der Prerender als <a>.
export interface RewaxFaqItem {
  q: string;
  a: string;
  link?: { to: string; labelDe: string; labelEn: string };
}

export function rewaxFaqItems(de: boolean): RewaxFaqItem[] {
  const compLine = COMPETITOR_FULL_SERVICE.map((c) => `${c.name} ${eur(c.price, de)}`).join(', ');

  const items: RewaxFaqItem[] = [
    {
      q: de ? 'Was kostet es, eine Fahrradkette wachsen zu lassen?' : 'How much does it cost to get a chain rewaxed?',
      a: de
        ? `Eine bereits gewachste Kette frischen wir für ${eur(PRICE.rewax.single, de)} auf, zuzüglich ${eur(PRICE.shippingSingle, de)} Rückversand. Ab drei Ketten sinkt der Preis auf ${eur(PRICE.rewax.bundle, de)} pro Kette.`
        : `We rewax an already-waxed chain for ${eur(PRICE.rewax.single, de)}, plus ${eur(PRICE.shippingSingle, de)} return shipping. From three chains the price drops to ${eur(PRICE.rewax.bundle, de)} per chain.`,
    },
    {
      q: de ? 'Was kostet es, mehrere Fahrradketten wachsen zu lassen?' : 'How much does it cost to get several chains rewaxed?',
      a: de
        ? `Ab drei Ketten sinkt der Preis auf ${eur(PRICE.rewax.bundle, de)} pro Kette. Der Rückversand (${eur(PRICE.shippingBundle, de)}) fällt dabei nur einmal an, egal wie viele Ketten im selben Umschlag sind.`
        : `From three chains the price drops to ${eur(PRICE.rewax.bundle, de)} per chain. Return shipping (${eur(PRICE.shippingBundle, de)}) is charged only once, no matter how many chains are in the same envelope.`,
    },
  ];

  if (UMSTIEG_LIVE) {
    items.push({
      q: de ? 'Was kostet es, eine geölte oder neue Kette auf Wachs umzustellen?' : 'How much does it cost to switch an oiled or new chain to wax?',
      a: de
        ? `Der Umstieg kostet ${eur(PRICE.umstieg.single, de)} je Kette (ab drei Ketten ${eur(PRICE.umstieg.bundle, de)}), zuzüglich ${eur(PRICE.shippingSingle, de)} Rückversand. Der Aufpreis gegenüber der Auffrischung ist der echte Mehraufwand: Die Kette kommt zuerst in ein separates Lösemittelbad, wird gründlich entfettet und vollständig getrocknet, bevor sie das erste Mal ins Wachs geht. Zum Vergleich: ${compLine}.`
        : `The switch costs ${eur(PRICE.umstieg.single, de)} per chain (from three chains ${eur(PRICE.umstieg.bundle, de)}), plus ${eur(PRICE.shippingSingle, de)} return shipping. The premium over a rewax is real extra work: the chain first goes into a separate solvent bath, is thoroughly degreased and fully dried before its first time in the wax. For comparison: ${compLine}.`,
    });
  }

  items.push({
    q: de ? 'Wie funktioniert die 5er- oder 10er-Karte?' : 'How do the 5- and 10-visit cards work?',
    a: de
      ? `Du zahlst fünf oder zehn Auffrischungen im Voraus, der Rückversand ist im Kartenpreis schon drin. Nach dem Kauf bekommst du einen Code, den schickst du bei jeder Sendung mit — wir führen die Karte für dich. Kein Ablaufdatum, übertragbar. Gegen den Einzelpreis von ${eur(PRICE.rewax.single, de)} sparst du auf der 5er-Karte ${eur(FIVE_CARD.list - FIVE_CARD.price, de)}, auf der 10er ${eur(TEN_CARD.list - TEN_CARD.price, de)}. Die Karten gelten für die Auffrischung, nicht für den Umstieg.`
      : `You pay for five or ten rewaxes up front, return shipping is already included in the card price. After purchase you get a code to include with every shipment — we keep the card for you. No expiry, transferable. Against the single price of ${eur(PRICE.rewax.single, de)} you save ${eur(FIVE_CARD.list - FIVE_CARD.price, de)} on the 5-visit card and ${eur(TEN_CARD.list - TEN_CARD.price, de)} on the 10-visit one. The cards are for rewaxing, not for the oil-to-wax switch.`,
  });

  items.push({
    q: de ? 'Wie läuft das ab?' : 'How does the process work?',
    a: de
      ? 'Kette am Quick-Link öffnen, in den Umschlag, einschicken — reinigen musst du vorher nichts. Eine bereits gewachste Kette lösen wir mit kochendem Wasser vom alten Wachs, ganz ohne Lösemittel. Eine geölte oder neue Kette kommt zuerst in ein separates Lösemittelbad und wird gründlich entfettet und getrocknet. Dann geht sie in ein frisches Wachsbad. Zurück kommt sie ausgehärtet, Glieder freigebrochen, trocken verpackt — anbauen, kurz kurbeln, fertig.'
      : 'Open the chain at the quick link, put it in an envelope, send it in — no cleaning needed beforehand. An already-waxed chain we release from the old wax with boiling water, no solvents at all. An oiled or new chain first goes into a separate solvent bath and is thoroughly degreased and dried. Then it goes into a fresh wax bath. It comes back cured, links broken free, packed dry — fit it, turn the cranks, ride.',
  });

  items.push({
    q: de ? 'Wo kann ich meine Fahrradkette wachsen lassen?' : 'Where can I get my bicycle chain waxed?',
    a: de
      ? `Bei uns in Stuttgart — du musst aber nicht vor Ort sein. Der Service ist reiner Postversand: ${CITIES.join(', ')} oder das Dorf dazwischen, die Kette geht im Großbrief zu uns, wird handgewachst und kommt zurück. Hin und zurück bist du meist ${TURNAROUND.deIn} wieder auf dem Rad.`
      : `With us in Stuttgart — but you don't need to be local. The service is purely by mail: ${CITIES.join(', ')} or the village in between, the chain travels to us as a letter, gets hand-waxed and comes back. Round trip you're usually back on the bike within ${TURNAROUND.en}.`,
  });

  items.push({
    q: de ? 'Kann ich meine Kette aus Hamburg, München, Köln oder Berlin einschicken?' : 'Can I send in my chain from Hamburg, Munich, Cologne or Berlin?',
    a: de
      ? `Ja. Der Service läuft komplett per Post, egal wo in Deutschland du wohnst. Kette am Quick-Link öffnen, in einen gepolsterten Umschlag, als Großbrief (1,80 €) an unsere Stuttgarter Adresse. Wir wachsen sie am Eingangstag oder tags darauf und schicken sie im Maxibrief zurück. Umlauf meist ${TURNAROUND.de}.`
      : `Yes. The service runs entirely by mail, wherever in Germany you live. Open the chain at the quick link, into a padded envelope, as a letter to our Stuttgart address. We wax it the day it arrives or the next day and send it back. Round trip usually ${TURNAROUND.en}.`,
  });

  items.push({
    q: de ? 'Welche Ketten nehmt ihr an?' : 'Which chains do you accept?',
    a: de
      ? (UMSTIEG_LIVE
        ? 'Beide Zustände, alle gängigen 9- bis 12-fach-Ketten, unsere oder fremde. Eine bereits gewachste Kette frischen wir auf. Eine geölte oder fabrikneue Kette übernehmen wir als Umstieg: separates Lösemittelbad, gründlich entfetten, vollständig trocknen, dann erst ins Wachs. So sieht unser Wachsbad nie eine ölige Kette — die würde ein ganzes Bad unbrauchbar machen, weil das Öl oben schwimmt und die Wachspenetration blockiert.'
        : 'Jede Kette, die schon gewachst ist — unsere oder fremde, alle gängigen 9- bis 12-fach-Ketten. Was wir aktuell nicht anbieten: eine geölte Kette entfetten und erstmals wachsen.')
      : (UMSTIEG_LIVE
        ? "Both states, all common 9 to 12 speed chains, ours or anyone's. An already-waxed chain we rewax. An oiled or factory-new chain we take on as a switch: separate solvent bath, thorough degrease, full dry, then into the wax. That way our wax bath never sees an oily chain — one would ruin a whole bath, because the oil floats on top and blocks the wax from reaching the joints."
        : "Any chain that's already waxed — ours or someone else's, all common 9 to 12 speed chains. What we don't currently offer: degreasing an oiled chain for its first wax."),
    link: { to: '/blog/von-oel-auf-wachs-umsteigen', labelDe: 'Anleitung: von Öl auf Wachs umsteigen', labelEn: 'Guide: switching from oil to wax' },
  });

  items.push({
    q: de ? 'Wie oft muss eine gewachste Kette neu gewachst werden?' : 'How often does a waxed chain need rewaxing?',
    a: de
      ? 'Trocken auf Asphalt 400–550 km, bei Nässe, MTB oder gemischt 200–300 km, im Winter bei Dauerregen unter 200 km. Das zuverlässigste Signal ist aber das Ohr: Wird die Kette lauter und trockener, ist sie fällig.'
      : 'Dry on tarmac 400–550 km, in the wet, on MTB or mixed 200–300 km, in winter with constant rain under 200 km. The most reliable signal is your ear though: when the chain gets louder and drier, it is due.',
    link: { to: '/rechner/intervall', labelDe: 'Dein Intervall in Wochen berechnen', labelEn: 'Work out your interval in weeks' },
  });

  items.push({
    q: de ? 'Wachsen lassen oder selbst wachsen — was lohnt sich?' : 'Send it in or wax it myself — which is worth it?',
    a: de
      ? 'Selbst wachsen ist einfach, kostet aber einen Abend, einen Topf und Platz für die Ausrüstung. Der Service lohnt sich, wenn du das nicht selbst machen willst oder der Platz dafür fehlt. Ab der zweiten oder dritten Kette in Rotation rechnet er sich zusätzlich, weil der Rückversand nur einmal anfällt.'
      : "Waxing it yourself is simple, but costs an evening, a pot and space for the gear. The service is worth it if you'd rather not do that yourself or don't have the space for it. From a second or third chain in rotation it pays off further, since return shipping is only charged once.",
    link: { to: '/blog/heisswachs-anleitung', labelDe: 'Anleitung: Heißwachs selber machen', labelEn: 'Guide: hot-wax your chain yourself' },
  });

  return items;
}
