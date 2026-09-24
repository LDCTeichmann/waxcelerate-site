// Texte der Ketten-Produktseite (Kettenseite v1, 15.09.2026). Eigene Datei
// nach dem Muster von src/pages/ketten/content.ts, damit die Komponenten
// keine Saetze tragen (CLAUDE.md Regel 6).
//
// Quelle der Inhalte: die eBay-Beschreibung "Das Blatt" (Muster CN-HG93),
// abgeglichen mit den verbindlichen Quellen der Website. Bewusst NICHT
// uebernommen: "Es wird leise" (PROJECT.md, bis Luca freigibt), die REM-Bilder
// (Bildherkunft ungeklaert), "400–550 km" (Seite rechnet mit 300–550 km) und
// feste Rewax-Preise (kommen aus src/pages/rewax/content.ts).

export const CHAIN_INTERVAL = '300–550 km';

export function chainCopy(de: boolean) {
  return de ? {
    eyebrow: 'Vorgewachst',
    inStock: 'Auf Lager',
    reviews: 'Bewertungen · 100 % positiv',
    lede: (speed: string) => `Eine ${speed}-Kette, fahrbereit aus dem Karton. Kein Entfetten, kein Wachsen, keine Sauerei.`,
    proWax: 'MoS₂ Pro-Wachs',
    included: 'dabei',
    tiles: { speed: 'Gänge', links: 'Glieder', ready: 'Vorbereitung', readyV: '0 min' },
    boxTitle: 'Das bekommst du',
    box: {
      chain: (links: string) => `${links} · neu, vom Hersteller`,
      wax: 'In jedem Gelenk ausgehärtet · PFAS- und PTFE-frei',
      link: 'Werkzeuglos öffnen, zum Nachwachsen oder Einschicken',
    },
    orderNow: 'Jetzt bestellen',
    orderQty: (q: number) => `${q} Ketten bestellen`,
    qtyLabel: 'Menge',
    qtyPiece: 'Stück',
    perPiece: '/Stk.',
    qtySave: (total: string, eur: string) => `Zusammen ${total} €, du sparst ${eur} €.`,
    qtyEbay: (q: string) => `Bei eBay Menge ${q} wählen, der Rabatt wird im Warenkorb abgezogen.`,
    soldOut: 'Ausverkauft',
    trust: { delivery: 'voraussichtlich bei dir', city: 'handgewachst', days: '14 Tage', daysSub: 'Rückgabe, nicht montiert' },
    fitHint: 'Passt die zu deinem Antrieb?',

    process: {
      title: 'Was wir damit machen.',
      lede: 'Vier Schritte, in kleiner Charge, in Stuttgart. Danach musst du nur noch einbauen.',
      imgAlt: 'Fahrradkette hängt an zwei Drahthaken über einem Wachsbad',
      imgCap: 'Im Wachsbad', imgCapSub: 'kleine Charge · Stuttgart',
      steps: [
        { t: 'Entfettet', b: 'In drei Stufen bis auf blankes Metall. Das Werksfett muss komplett raus.' },
        { t: 'Getrocknet', b: 'Hängend, bis der Weiße-Tuch-Test sauber bleibt: kein Abrieb auf dem Papier.' },
        { t: 'MoS₂-Wachsbad', b: 'Heiß getaucht. Das Wachs zieht in jedes Gelenk und erstarrt dort zum trockenen Film.' },
        { t: 'Verpackt', b: 'Kettenschloss dazu, in den Recyclingkarton, Versand in 1–2 Werktagen.' },
      ],
      cleanTitle: 'Die drei Reinigungsstufen',
      clean: [
        { t: 'Mechanisch', b: 'Grobreinigung, löst den Großteil des Werksfetts.' },
        { t: 'Ultraschall', b: 'Kavitation holt Rückstände aus den Gelenken, wo Wischen nicht hinkommt.' },
        { t: 'Isopropanol 99 %', b: 'Rückstandsfrei. Zähes Werksfett braucht oft einen Durchgang mehr.' },
      ],
      note: 'Wachs und MoS₂ dringen nur in metallisch saubere Gelenke ein.',
      noteRest: 'Werksfett auf der Innenfläche blockiert den Wirkstoff. Deshalb drei Reinigungsstufen, nicht nur eine.',
    },

    fit: {
      title: 'Passt sie an dein Rad?',
      lede: 'Antrieb, Radtyp, und ehrlich dazu, wofür die Kette nicht taugt.',
      drive: 'Antrieb', bikes: 'Räder',
      good: 'Passt', goodBody: (speed: string, comp: string) => `Alle ${speed}-Antriebe aus der Liste: ${comp}.`,
      no: 'Nicht geeignet',
      noBody: (others: string, model: string, speed: string) => `Antriebe mit ${others} Ritzeln. Die ${model} ist eine reine ${speed}-Kette und läuft dort nicht sauber.`,
      siblings: (speed: string) => `Weitere ${speed}-Ketten`,
      all: (speed: string) => `Alle ${speed}-Ketten vergleichen →`,
      allChains: 'Alle Ketten vergleichen →',
      soldOut: 'ausverkauft',
      cheapest: 'Günstigste',
      widthTitle: 'Kettenbreite nach Gangzahl',
      widthOwn: 'diese Kette',
      widthNote: 'Außenbreite, ca.-Werte. Je mehr Ritzel, desto enger stehen sie und desto schmaler muss die Kette sein. Deshalb passt eine Kette nur zu ihrer Gangzahl.',
    },

    data: {
      title: 'Daten, Einbau, Grenzen.',
      lede: 'Alles, was du vor dem Kauf prüfen willst.',
      wax: 'Wachs', waxV: 'MoS₂ Pro (V9) · PFAS- und PTFE-frei',
      interval: 'Nachwachsen', intervalV: `alle ${CHAIN_INTERVAL}, je nach Wetter`,
      shipping: 'Versand', shippingV: 'kostenlos, 1–2 Werktage',
      maker: 'Kettenhersteller', treat: 'Wachsbehandlung',
      cmpTitle: 'Vorgewachst gegen frisch geölt',
      cmpWax: 'Vorgewachst', cmpOil: 'Frisch geölt',
      installTitle: 'Einbau',
      install: [
        { t: 'Kürzen, falls nötig', b: 'Schadet dem Wachs nicht. Der Film sitzt in der Kette, nicht außen darauf.' },
        { t: 'Schloss schließen, losfahren', b: 'Keine Einfahrzeit, der Antrieb läuft sofort sauber.' },
        { t: 'Kein Öl zwischendurch', b: 'Öl löst den Wachsfilm auf. Lieber rechtzeitig neu wachsen.' },
      ],
    },

    after: {
      n: 'Wenn das Wachs nachlässt', title: 'Zwei Wege danach.',
      lede: `Nach ${CHAIN_INTERVAL}, je nach Bedingungen, ist der Film verbraucht. Die Kette selbst hält weiter.`,
      self: 'Selbst', selfT: 'Nachwachsen',
      selfB: 'Mit Pro MoS₂, derselben Formel wie auf dieser Kette. 300 g oder 500 g, ein Topf, 10–15 Minuten im Bad.',
      selfCta: 'Pro MoS₂ ansehen →',
      send: 'Oder', sendT: 'Einschicken',
      sendB: (single: string, card: string) => `Wir wachsen sie neu, fahrbereit zurück. ${single} pro Kette, mit der 10er-Karte ${card}, Rückversand inklusive.`,
      sendCta: 'Wie das Einschicken läuft →',
      greenTitle: 'Nachhaltig gedacht',
      greenSub: 'Weniger Abfall, weniger Chemie, länger fahren.',
      green: [
        { t: 'PFAS-frei', b: 'Das MoS₂-Wachs kommt ohne Fluorverbindungen aus.' },
        { t: 'Nachwachsen statt neu kaufen', b: 'Ist der Film verbraucht, wird die Kette nachgewachst, nicht ersetzt.' },
        { t: 'Keine öligen Lappen', b: 'Kein Kettenreiniger, kein Altöl in der laufenden Pflege.' },
        { t: 'Recyclingkarton', b: 'Versand im unbeschichteten Recyclingkarton.' },
      ],
    },

  } : {
    eyebrow: 'Pre-waxed',
    inStock: 'In stock',
    reviews: 'reviews · 100 % positive',
    lede: (speed: string) => `A ${speed.replace('-fach', '-speed')} chain, ready to ride out of the box. No degreasing, no waxing, no mess.`,
    proWax: 'MoS₂ Pro wax',
    included: 'included',
    tiles: { speed: 'Speed', links: 'Links', ready: 'Prep', readyV: '0 min' },
    boxTitle: 'What you get',
    box: {
      chain: (links: string) => `${links.replace('Glieder', 'links')} · new, from the maker`,
      wax: 'Set in every joint · PFAS- and PTFE-free',
      link: 'Opens without tools, for rewaxing or sending in',
    },
    orderNow: 'Order now',
    orderQty: (q: number) => `Order ${q} chains`,
    qtyLabel: 'Quantity',
    qtyPiece: 'pc',
    perPiece: '/pc',
    qtySave: (total: string, eur: string) => `Together €${total}, you save €${eur}.`,
    qtyEbay: (q: string) => `Choose quantity ${q} on eBay, the discount is applied in the basket.`,
    soldOut: 'Sold out',
    trust: { delivery: 'estimated delivery', city: 'hand-waxed', days: '14 days', daysSub: 'return, not fitted' },
    fitHint: 'Will it fit your drivetrain?',

    process: {
      title: 'What we do to it.',
      lede: 'Four steps, in small batches, in Stuttgart. All you do is fit it.',
      imgAlt: 'Bicycle chain hanging on two wire hooks over a wax bath',
      imgCap: 'In the wax bath', imgCapSub: 'small batch · Stuttgart',
      steps: [
        { t: 'Degreased', b: 'In three stages down to bare metal. All factory grease has to go.' },
        { t: 'Dried', b: 'Hanging until the white-cloth test stays clean: no residue on the paper.' },
        { t: 'MoS₂ wax bath', b: 'Dipped hot. The wax runs into every joint and sets there as a dry film.' },
        { t: 'Packed', b: 'Connector added, into the recycled box, ships in 1–2 working days.' },
      ],
      cleanTitle: 'The three cleaning stages',
      clean: [
        { t: 'Mechanical', b: 'Rough clean, removes most of the factory grease.' },
        { t: 'Ultrasonic', b: 'Cavitation pulls residue out of the joints where wiping cannot reach.' },
        { t: 'Isopropanol 99 %', b: 'Residue-free. Tough factory grease often needs one more pass.' },
      ],
      note: 'Wax and MoS₂ only get into metallically clean joints.',
      noteRest: 'Factory grease on the inner surfaces blocks them. Hence three cleaning stages, not one.',
    },

    fit: {
      title: 'Will it fit your bike?',
      lede: 'Drivetrain, bike type, and honestly what the chain is not for.',
      drive: 'Drivetrain', bikes: 'Bikes',
      good: 'Fits', goodBody: (speed: string, comp: string) => `Every ${speed.replace('-fach', '-speed')} drivetrain on the list: ${comp}.`,
      no: 'Not suitable',
      noBody: (others: string, model: string, speed: string) => `Drivetrains with ${others} sprockets. The ${model} is a pure ${speed.replace('-fach', '-speed')} chain and will not run cleanly there.`,
      siblings: (speed: string) => `More ${speed.replace('-fach', '-speed')} chains`,
      all: (speed: string) => `Compare all ${speed.replace('-fach', '-speed')} chains →`,
      allChains: 'Compare all chains →',
      soldOut: 'sold out',
      cheapest: 'Cheapest',
      widthTitle: 'Chain width by speed',
      widthOwn: 'this chain',
      widthNote: 'Outer width, approximate. The more sprockets, the closer they sit and the narrower the chain has to be. That is why a chain only fits its own speed.',
    },

    data: {
      title: 'Specs, fitting, limits.',
      lede: 'Everything to check before you buy.',
      wax: 'Wax', waxV: 'MoS₂ Pro (V9) · PFAS- and PTFE-free',
      interval: 'Rewax', intervalV: `every ${CHAIN_INTERVAL}, weather dependent`,
      shipping: 'Shipping', shippingV: 'free, 1–2 working days',
      maker: 'Chain maker', treat: 'Wax treatment',
      cmpTitle: 'Pre-waxed versus freshly oiled',
      cmpWax: 'Pre-waxed', cmpOil: 'Freshly oiled',
      installTitle: 'Fitting',
      install: [
        { t: 'Shorten if needed', b: 'Does not hurt the wax. The film sits inside the chain, not on the outside.' },
        { t: 'Close the link, ride', b: 'No break-in, the drivetrain runs clean right away.' },
        { t: 'No oil in between', b: 'Oil dissolves the wax film. Rewax in time instead.' },
      ],
    },

    after: {
      n: 'When the wax wears off', title: 'Two ways on.',
      lede: `After ${CHAIN_INTERVAL}, depending on conditions, the film is used up. The chain itself carries on.`,
      self: 'Yourself', selfT: 'Rewax',
      selfB: 'With Pro MoS₂, the same formula as on this chain. 300 g or 500 g, one pot, 10–15 minutes in the bath.',
      selfCta: 'View Pro MoS₂ →',
      send: 'Or', sendT: 'Send it in',
      sendB: (single: string, card: string) => `We rewax it and send it back ready to ride. ${single} per chain, ${card} with the 10-pack card, return shipping included.`,
      sendCta: 'How sending it in works →',
      greenTitle: 'Built to last',
      greenSub: 'Less waste, fewer chemicals, more riding.',
      green: [
        { t: 'PFAS-free', b: 'The MoS₂ wax contains no fluorine compounds.' },
        { t: 'Rewax instead of replace', b: 'When the film is used up the chain gets rewaxed, not replaced.' },
        { t: 'No oily rags', b: 'No degreaser and no used oil in day-to-day care.' },
        { t: 'Recycled box', b: 'Shipped in an uncoated recycled cardboard box.' },
      ],
    },

  };
}
