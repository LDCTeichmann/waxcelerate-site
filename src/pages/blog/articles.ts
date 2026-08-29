export interface ArticleSection {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'tip' | 'note' | 'image';
  /** For 'p'/'ul'/'ol' items/'tip'/'note': supports inline links via
   * [[Link-Text|/ziel-pfad]] — parsed by renderInlineText() in
   * BlogArticlePage.tsx and its server-side equivalent in
   * scripts/generate-blog-html.mjs. Internal paths only (/blog/..., /produkt/...). */
  text?: string;
  items?: string[];
  /** 'image' only. */
  src?: string;
  alt?: string;
  caption?: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export type ArticleCategory =
  | 'Grundlagen'
  | 'Anleitung'
  | 'Technik'
  | 'Kaufberatung'
  | 'Problemlösung'
  | 'Saison';

export interface Article {
  slug: string;
  title: string;
  titleShort: string;
  description: string;
  category: ArticleCategory;
  publishDate: string;
  /** Datum der letzten inhaltlichen Prüfung. Bei jeder Überarbeitung mitsetzen. */
  dateModified?: string;
  readingTime: string;
  intro: string;
  sections: ArticleSection[];
  ctaSlug: string;
  ctaText: string;
  /** Hervorgehobener Leitartikel auf der Blog-Startseite. */
  featured?: boolean;
  /** Kennzahlen-Chips für den Leitartikel (nur bei featured genutzt). */
  stats?: { value: string; label: string }[];
  /** Eine reale Kennzahl aus dem Artikel, für die Karte in der Übersicht. Nichts erfinden — leer lassen, wenn der Artikel keine belastbare Zahl hergibt. */
  keyStat?: { value: string; label: string };
  /** Kurzfassung oben im Artikel ("Das Wichtigste in Kürze"). */
  takeaways?: string[];
  /** Frage-Antwort-Paare für FAQPage-Schema. */
  faq?: { q: string; a: string }[];
  /** Cross-Link auf die passende Sektion der Wissenschaftsseite, sofern der Artikel eine Entsprechung dort hat. */
  scienceLink?: { anchor?: string; label: string };
  /** Zeigt einen Verweis auf den Rewax-Rechner (/#tools) — nur bei Artikeln setzen, bei denen das eigene Intervall inhaltlich relevant ist. */
  linksToCalculator?: boolean;
  howTo?: {
    name: string;
    totalTime: string;
    steps: HowToStep[];
  };
}

/** Akzentfarbe je Kategorie. Lesbar auf hellem und dunklem Hintergrund. */
export const categoryColors: Record<ArticleCategory, string> = {
  Grundlagen: 'var(--accent)',
  Anleitung: '#5FA8A8',
  Technik: '#9B7BAE',
  Kaufberatung: '#6E9F6E',
  'Problemlösung': '#C26D4F',
  Saison: '#C9A14A',
};

export const categoryOrder: ArticleCategory[] = [
  'Grundlagen',
  'Anleitung',
  'Technik',
  'Kaufberatung',
  'Problemlösung',
  'Saison',
];

/** Ein passendes Produkt je Kategorie, für den Cross-Sell auf der Blog-Startseite.
 * Eine redaktionelle Einschätzung, was jemand, der diese Kategorie liest, am
 * ehesten sucht — Luca sollte diese Zuordnung gegenlesen. IDs sind reale
 * Product.id-Werte aus src/lib/data.ts. */
export const categoryProductSlug: Record<ArticleCategory, string> = {
  Grundlagen: 'wax-500',
  Anleitung: 'starter-classic',
  Technik: 'wax-500-mos2',
  Kaufberatung: 'wax-500-mos2',
  'Problemlösung': 'wax-500',
  Saison: 'wax-500-mos2',
};

export const articles: Article[] = [
  {
    slug: 'heisswachs-vs-fluessigwachs',
    title: 'Heißwachs vs. Flüssigwachs für Fahrradketten: Ein ehrlicher Vergleich',
    titleShort: 'Heißwachs vs. Flüssigwachs: Der Vergleich',
    description: 'Heißwachs oder Flüssigwachs für die Fahrradkette? Wir vergleichen Reibungswerte, Intervalle und Kosten, ehrlich und ohne Marketing.',
    category: 'Grundlagen',
    publishDate: '2026-05-19',
    dateModified: '2026-07-27',
    readingTime: '7 min',
    takeaways: [
      'Heißwachs dringt durch Immersion und Hitze bis in die Gelenke, Flüssigwachs bleibt eher an der Oberfläche.',
      'Der Reibungsunterschied zu Öl liegt bei rund 4 bis 5 W, also etwa 2 % der Tretleistung. Für Rennfahrer relevant, für Alltagsfahrer kein Kaufargument.',
      'Der eigentliche Vorteil ist die Konstanz: Öl verliert unter Schmutz weiter an Effizienz, Wachs bleibt über das Intervall nahezu gleich.',
      'Flüssigwachs ist kein schlechter Kompromiss, sondern die bequemere Wahl, wenn du die Kette nicht abnehmen willst.',
    ],
    keyStat: { value: '3–5 W', label: 'Unterschied' },
    intro: 'Kettenwachs ist nicht gleich Kettenwachs. Heißwachs (Paraffin, im Topf geschmolzen) und Flüssigwachs (Wachs-Emulsion aus der Flasche) versprechen beide saubere, reibungsarme Antriebe, aber mit sehr unterschiedlichen Kompromissen. Dieser Artikel zeigt, was die Messwerte wirklich sagen und welche Methode zu welchem Fahrertyp passt.',
    faq: [
      { q: 'Was ist der Unterschied zwischen Heißwachs und Flüssigwachs?', a: 'Heißwachs wird im heißen Bad bei 85 bis 90 Grad angewendet und dringt durch Hitze und Immersion tief in die Kettengelenke ein. Flüssigwachs ist eine Wachs-Emulsion aus der Flasche, die du direkt auftropfst. Sie bleibt eher an der Oberfläche, weil die thermische Unterstützung fehlt.' },
      { q: 'Wie viel Watt spart Heißwachs gegenüber Kettenöl?', a: 'In unserer Laborreferenz liegt der Unterschied bei rund 4 bis 5 Watt, also etwa 2 Prozent der Tretleistung bei 250 Watt Eingangsleistung. Für Rennfahrer ist das relevant, für Alltagsfahrer eher kein Kaufargument.' },
      { q: 'Wie oft muss ich bei Flüssigwachs im Vergleich zu Heißwachs nachwachsen?', a: 'Flüssigwachs hält trocken etwa 150 bis 250 km und bei Nässe nur 80 bis 120 km. Heißwachs kommt trocken auf 400 bis 550 km und bei Nässe oder MTB auf 200 bis 300 km, also deutlich länger.' },
      { q: 'Ist Heißwachsen zu aufwendig für den Alltag?', a: 'Für eine einzelne Kette schon etwas Aufwand, für eine 3-Ketten-Rotation nicht. Du wachst alle drei Ketten gesammelt in einer Session, der Wechsel am Rad dauert mit Schnellverschluss etwa 60 Sekunden.' },
      { q: 'Kann ich Flüssigwachs auf eine bereits geölte Kette auftragen?', a: 'Nicht direkt. Öl verdrängt die Wachsemulsion und das Flüssigwachs hält dann schlecht. Wer von Öl umsteigt, muss die Kette zuerst entfetten, genau wie beim Heißwachsen.' },
    ],
    sections: [
      {
        type: 'h2',
        text: 'Was ist Heißwachs?',
      },
      {
        type: 'p',
        text: 'Heißwachs besteht aus Paraffin (Schmelzpunkt ca. 58 °C) und ultrafeinem PTFE-Pulver (Teilchengröße unter 1 µm). Die Kette wird in das auf 85–90 °C erhitzte Wachsbad getaucht, 10–15 Minuten gebadet, dann herausgehängt und abgekühlt. Beim Abkühlen zieht das flüssige Paraffin tief in jeden Kettenbolzen und jede Hülse ein. Das erstarrte Wachs bildet ein festes, trockenes Schmiermittel, das keinen Staub und Schmutz anzieht.',
      },
      {
        type: 'p',
        text: 'Das Ergebnis: Die Kette ist nach dem Wachsen trocken anfassbar, hinterlässt keinerlei Abrieb an Kleidung oder Rahmen, und die Reibung sinkt auf Werte, die Öl nicht erreicht. Waxcelerate Classic enthält neben Paraffin auch PTFE; die Pro-Variante zusätzlich Molybdändisulfid (MoS₂), das vor allem bei Nässe und hohen Belastungen die Reibung weiter reduziert.',
      },
      {
        type: 'h2',
        text: 'Was ist Flüssigwachs?',
      },
      {
        type: 'p',
        text: 'Produkte wie Squirt Lube oder Silca Super Secret Chain Lube sind Wachs-Emulsionen: Paraffin oder synthetisches Wachs ist in Wasser dispergiert und lässt sich direkt aus der Flasche auf die Kette tropfen. Das Wasser verdunstet nach dem Auftragen, und das Wachs bleibt auf der Kette zurück. Die Penetrationstiefe ist dabei geringer als beim Heißwachsprozess, weil keine thermische Unterstützung vorhanden ist.',
      },
      {
        type: 'p',
        text: 'Flüssigwachs ist deutlich bequemer: Kette nicht entfernen, nicht entfetten (zumindest nach der ersten Behandlung), einfach auftropfen und kurz einfahren. Das ist der eigentliche Vorteil, nicht die Leistung.',
      },
      {
        type: 'h2',
        text: 'Reibungswerte im Vergleich',
      },
      {
        type: 'p',
        text: 'Unabhängige Prüfstände wie Zero Friction Cycling messen Kettenverluste in Watt. Die Zahlen hängen stark vom Prüfprotokoll ab, deshalb hier Richtwerte statt Nachkommastellen:',
      },
      {
        type: 'ul',
        items: [
          'Heißwachs: rund 2,6 W Verlust in unserer Laborreferenz bei 300–400 W Eingangsleistung. Zero Friction Cycling misst für ein frisches Heißwachs-Bad etwa 3,8 W bei 250 W.',
          'Flüssigwachs: liegt dazwischen, sauber aufgetragen etwa 5 W.',
          'Kettenöl: rund 7,5 W in derselben Laborreferenz. Unter realer Verschmutzung driftet Öl weiter nach oben, Wachs kaum.',
        ],
      },
      {
        type: 'note',
        text: 'Warum wir keine exakteren Zahlen nennen: Prüfstände arbeiten mit unterschiedlicher Eingangsleistung, Kettenspannung und Verschmutzungsprotokoll. Wer eine Zahl auf zwei Nachkommastellen verkauft, verschweigt das Protokoll. Uns interessiert die Größenordnung, und die ist stabil.',
      },
      {
        type: 'p',
        text: 'Der Abstand zwischen Heißwachs und Öl liegt damit bei grob 4 bis 5 W. Bei 250 W Tretleistung sind das etwa 2 % deiner Leistung. Für Rennfahrer ist das relevant, für Alltagsfahrer ist es kein Kaufargument. Der eigentliche Vorteil liegt woanders: Öl verliert unter Schmutz weiter an Effizienz, Wachs bleibt über das Intervall nahezu konstant.',
      },
      {
        type: 'h2',
        text: 'Wiederholungsintervalle',
      },
      {
        type: 'p',
        text: 'Hier liegt der größte praktische Unterschied. Heißwachs hält deutlich länger zwischen den Anwendungen:',
      },
      {
        type: 'ul',
        items: [
          'Heißwachs, trockene Bedingungen: 400–550 km pro Anwendung',
          'Heißwachs, nass / MTB: 200–300 km (Wasser löst Paraffin schneller heraus)',
          'Flüssigwachs, trocken: 150–250 km',
          'Flüssigwachs, nass: 80–120 km',
        ],
      },
      {
        type: 'tip',
        text: 'Das Erkennungszeichen für einen fälligen Nachwachsvorgang: Die Kette fängt an zu quietschen, besonders unter Last. Warte nicht auf sichtbaren Schmutz. Der kommt erst, wenn das Wachs schon deutlich verschlissen ist.',
      },
      {
        type: 'h2',
        text: 'Kettenlaufzeit',
      },
      {
        type: 'p',
        text: 'Paraffin-basiertes Heißwachs hält die Kette sauberer als jedes Öl, weil es keinen Schmutz bindet. Weniger Abrasion bedeutet weniger Kettendehnung. Zero Friction Cycling misst unter Laborprotokoll mit konsequentem Nachwachsen Laufleistungen von 15.000 bis 20.000 km bis zur 0,5-%-Dehngrenze. Wer die Intervalle streckt, wie es im Alltag üblich ist, landet dort bei 8.000 bis 10.000 km. In der Praxis rechnen wir mit 6.000 bis 12.000 km gegenüber 2.000 bis 3.000 km bei Öl, also grob dem Zwei- bis Dreifachen. Das schont zugleich Kassette und Kettenblätter.',
      },
      {
        type: 'h2',
        text: 'Der Mythos "Heißwachs ist zu aufwendig"',
      },
      {
        type: 'p',
        text: 'Der häufigste Einwand gegen Heißwachs ist der Aufwand. Das stimmt für eine einzelne Kette, aber nicht für eine 3-Ketten-Rotation. Das Prinzip: Drei Ketten gleichzeitig im Einsatz. Während Kette 1 am Rad läuft, hängt Kette 2 fertig gewachst bereit und Kette 3 wartet auf die nächste Wachsrunde. Wenn Kette 1 nachgewachst werden muss, nimmst du einfach Kette 2. Der Wechsel dauert 60 Sekunden mit einem Schnellverschluss. Den eigentlichen Wachsvorgang (Kette einhängen, 10 min warten, abtropfen) erledigst du gesammelt für alle drei Ketten in einer Session. Zeitaufwand pro Kette und Wachsvorgang: 5–10 Minuten.',
      },
      {
        type: 'h2',
        text: 'Fazit: Wer sollte was verwenden?',
      },
      {
        type: 'ul',
        items: [
          'Ambitionierte Rennfahrer, Randonneure, Vielkilometer-Fahrer: Heißwachs lohnt sich eindeutig. Niedrigste Reibung, längste Kettenlaufzeit, sauberster Antrieb.',
          'Gelegenheitsfahrer (unter 100 km/Woche, überwiegend trockene Bedingungen): Flüssigwachs wie Squirt ist eine absolut legitime Wahl. Der Komfortvorteil überwiegt.',
          'MTB / Gravelbike bei wechselhaftem Wetter: Heißwachs mit MoS₂-Variante oder gut bewährtes nasses Kettenöl. Flüssigwachs hat hier die kürzesten Intervalle.',
        ],
      },
      {
        type: 'note',
        text: 'Wichtig: Flüssigwachs auf einer zuvor mit Öl geschmierten Kette funktioniert schlecht. Das Öl verdrängt die Wachsemulsion. Wer von Öl auf Flüssigwachs wechselt, muss die Kette zuerst entfetten, genau wie beim Heißwachs.',
      },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },

  {
    slug: 'fahrradkette-entfetten',
    title: 'Fahrradkette entfetten: So geht es richtig vor dem Wachsen',
    titleShort: 'Fahrradkette entfetten: richtig vor dem Wachsen',
    description: 'Fahrradkette entfetten vor dem Heißwachsen: Warum es zwingend notwendig ist, welche Mittel wirklich funktionieren und häufige Fehler vermeiden.',
    category: 'Anleitung',
    publishDate: '2026-05-19',
    dateModified: '2026-07-27',
    readingTime: '6 min',
    takeaways: [
      'Entfetten ist der Schritt, an dem Heißwachs steht oder fällt. In über 90 % der Fälle liegt es daran, wenn Wachs nicht hält.',
      'Isopropanol ab 90 % im verschlossenen Glas, 2 bis 3 Durchgänge, bis die Flüssigkeit klar bleibt. Shimano-Ketten brauchen meist einen Durchgang mehr.',
      'Kein 70-prozentiges Desinfektionsmittel: Der Wasseranteil löst Mineralöl nicht zuverlässig.',
      'Vor dem Wachsbad vollständig trocknen lassen, mindestens 15 Minuten hängend. Restfeuchte im heißen Wachs spritzt.',
    ],
    keyStat: { value: '30–60 Sek.', label: 'IPA schütteln' },
    intro: 'Das Entfetten der Kette ist der einzige Schritt beim Heißwachsen, bei dem Anfänger am häufigsten scheitern. Wer diesen Schritt überspringt oder halbherzig erledigt, wird feststellen, dass das Wachs nicht haftet, schnell abblättert und die Kette nach 50 km wieder quietscht. Das hat nichts mit dem Wachs zu tun. Es liegt am Öl darunter.',
    faq: [
      { q: 'Warum hält Kettenwachs auf meiner Kette nicht?', a: 'In den allermeisten Fällen liegt es am Entfetten. Festes Paraffin verbindet sich nicht mit einer ölbenetzten Oberfläche, das Wachs legt sich nur außen darüber und blättert schnell wieder ab.' },
      { q: 'Welches Isopropanol brauche ich zum Entfetten?', a: 'Isopropanol mit mindestens 90 Prozent, besser 99 Prozent. Kein 70-prozentiges Desinfektionsmittel, der Wasseranteil hinterlässt Rückstände und fördert Rost.' },
      { q: 'Wie oft muss ich die Kette in Isopropanol schütteln?', a: '2 bis 3 Durchgänge à 30 bis 60 Sekunden im verschlossenen Glas, bis das Isopropanol beim Schütteln kaum noch trüb wird. Shimano-Ketten brauchen wegen des zäheren Werksfetts oft einen Durchgang mehr.' },
      { q: 'Kann ich WD-40 zum Entfetten der Kette verwenden?', a: 'Nein. WD-40 ist selbst ein Ölprodukt und hinterlässt einen Film, der die Wachsaufnahme verhindert. Nie als Vorbereitung für Heißwachs nutzen.' },
      { q: 'Wie lange muss die Kette nach dem Entfetten trocknen, bevor sie ins Wachsbad kann?', a: 'Mindestens 10 bis 15 Minuten hängend bei Raumtemperatur. Danach den Weißen-Tuch-Test machen: Kette über ein weißes Papiertuch ziehen, kein Abrieb sichtbar heißt bereit fürs Wachsbad.' },
    ],
    sections: [
      {
        type: 'h2',
        text: 'Warum Entfetten zwingend notwendig ist',
      },
      {
        type: 'p',
        text: 'Neue Ketten werden ab Werk mit einem zähen, mineralölbasierten Korrosionsschutzöl konserviert. Genau dieses Öl ist das Problem beim Wachsen: Es bleibt flüssig und beweglich. Festes Paraffin kann sich nicht mit einer ölbenetzten Metalloberfläche verbinden. Das Wachs legt sich nur außen darüber, während im Inneren der Bolzen und Hülsen eine weiche Öl-Wachs-Mischung zurückbleibt, die weder richtig schmiert noch sauber bleibt. Deshalb hält Wachs ohne gründliches Entfetten nicht.',
      },
      {
        type: 'p',
        text: 'Das gleiche gilt für gebrauchte Ketten, die zuvor mit Öl geschmiert wurden. Selbst wenige Milligramm Restöl reichen aus, um den Wachsprozess zu kompromittieren. Das Entfetten muss deshalb gründlich und mit dem richtigen Lösungsmittel durchgeführt werden.',
      },
      {
        type: 'h2',
        text: 'Methode 1: Isopropanol 99 % (empfohlen für Einsteiger)',
      },
      {
        type: 'p',
        text: 'Isopropanol (IPA) ist das günstigste und am leichtesten erhältliche Lösungsmittel. In der 99-%-Konzentration löst es Mineralöl zuverlässig und hinterlässt nach dem Verdunsten keinen Rückstand. Kosten: ca. 3–5 € pro Liter in der Apotheke oder bei Amazon (Suchbegriff: "Isopropanol 99% 1L").',
      },
      {
        type: 'note',
        text: 'Nicht 70-%-Isopropanol (Desinfektionsmittel) verwenden. Der Wasseranteil hinterlässt Rückstände in den Kettengliedern, die Rost fördern und die Wachsadhäsion beeinträchtigen. Nur 99 % oder 96 % kaufen.',
      },
      {
        type: 'p',
        text: 'Ablauf mit IPA:',
      },
      {
        type: 'ol',
        items: [
          'Kette vom Rad abnehmen (Schnellverschluss oder Kettennieter).',
          'Kette in ein verschließbares Gefäß (z.B. Einmachglas) legen, so viel IPA dazugeben, dass die Kette bedeckt ist.',
          'Deckel zu, 30–60 Sekunden kräftig schütteln. IPA wird trüb. Das ist das gelöste Öl.',
          'IPA abgießen, frisches IPA rein, erneut schütteln (2. Durchgang).',
          'Bei stark verschmutzten oder neuen Ketten: einen 3. Durchgang mit frischem IPA.',
          'Kette auf einem sauberen Tuch auslegen und vollständig trocknen lassen (10–15 Minuten bei Raumtemperatur, 5 Minuten bei leichter Wärme).',
          'Weißen-Tuch-Test: Kette über ein weißes Papiertuch ziehen. Kein Abrieb = bereit fürs Wachsbad.',
        ],
      },
      {
        type: 'h2',
        text: 'Methode 2: Aceton',
      },
      {
        type: 'p',
        text: 'Aceton (Nagellackentferner ohne Zusätze, oder technisches Aceton) ist aggressiver als IPA und löst Öl schneller und vollständiger. Ein bis zwei Durchgänge genügen meist. Aceton verdunstet rückstandsfrei und sehr schnell. Die Kette ist in 5 Minuten trocken. Nachteile: stärkerer Geruch, schlechter für Kunststoffgefäße (Metall- oder Glasgefäß verwenden), und deutlich entflammbarer.',
      },
      {
        type: 'h2',
        text: 'Methode 3: Ultraschallbad (professionell)',
      },
      {
        type: 'p',
        text: 'Ein Ultraschallreiniger (Elma, Codyson oder ähnliche, ab ca. 40–60 € für einfache Modelle) mit IPA oder einem Ultraschall-Reinigungskonzentrat reinigt die Kette in jedem Winkel, auch dort, wo manuelles Schütteln nicht hinkommt. 5–10 Minuten Laufzeit, danach abspülen und trocknen. Für Fahrer, die mehrere Ketten im Einsatz haben und regelmäßig wachsen, amortisiert sich das Gerät schnell.',
      },
      {
        type: 'h2',
        text: 'Häufige Fehler beim Entfetten',
      },
      {
        type: 'ul',
        items: [
          'WD-40 als Entfetter verwenden: WD-40 ist selbst ein Ölprodukt und hinterlässt einen Film. Es löst zwar manches Öl an, gibt aber gleichzeitig Mineralöl ab. Nie als Vorbereitung für Wachs nutzen.',
          'Kette nass ins Wachsbad geben: Lösungsmittel oder Wasser + heißes Wachs = gefährliches Spritzen. Die Kette muss vollständig trocken sein.',
          'Degreaser-Lösung zu oft wiederverwenden: Abgestandenes, trübes IPA mit hohem Ölanteil reinigt kaum noch. Nach 3–5 Ketten neues IPA verwenden.',
          'Nur einen Durchgang: Bei neuen Ketten reicht ein Durchgang oft nicht. Immer den Weißen-Tuch-Test machen.',
          'Kettenreiniger aus dem Radsport-Shop: Viele dieser Produkte sind zu schwach für die Vorbereitung auf Heißwachs. Sie entfernen Schmutz, aber nicht das Fabrikfett tief in den Gelenkbolzen.',
        ],
      },
      {
        type: 'h2',
        text: 'Zusammenfassung: Der richtige Ablauf',
      },
      {
        type: 'ol',
        items: [
          'Kette abnehmen.',
          '2–3 Durchgänge Isopropanol 99 % im Glas, kräftig schütteln.',
          'Auf sauberem Tuch vollständig trocknen lassen.',
          'Weißen-Tuch-Test: kein Abrieb sichtbar.',
          'Erst dann ins Wachsbad.',
        ],
      },
      {
        type: 'tip',
        text: 'Wer eine 3-Ketten-Rotation betreibt, kann alle drei Ketten gleichzeitig entfetten, dasselbe IPA im Glas. Spart Zeit und Lösungsmittel. Danach alle drei direkt ins Wachsbad hängen.',
      },
    ],
    howTo: {
      name: 'Fahrradkette mit Isopropanol entfetten',
      totalTime: 'PT20M',
      steps: [
        { name: 'Kette abnehmen', text: 'Kette vom Rad abnehmen (Schnellverschluss oder Kettennieter).' },
        { name: 'In Isopropanol einlegen', text: 'Kette in ein verschließbares Gefäß (z. B. Einmachglas) legen, so viel Isopropanol 99 % dazugeben, dass die Kette bedeckt ist.' },
        { name: 'Schütteln (1. Durchgang)', text: 'Deckel zu, 30–60 Sekunden kräftig schütteln. Das Isopropanol wird trüb — das ist das gelöste Öl.' },
        { name: 'Schütteln (2. Durchgang)', text: 'Isopropanol abgießen, frisches Isopropanol einfüllen, erneut 30–60 Sekunden schütteln.' },
        { name: 'Bei Bedarf 3. Durchgang', text: 'Bei stark verschmutzten oder neuen Ketten (v. a. Shimano) einen dritten Durchgang mit frischem Isopropanol wiederholen.' },
        { name: 'Vollständig trocknen lassen', text: 'Kette auf einem sauberen Tuch auslegen und vollständig trocknen lassen — 10–15 Minuten bei Raumtemperatur, 5 Minuten bei leichter Wärme.' },
        { name: 'Weißen-Tuch-Test', text: 'Kette über ein weißes Papiertuch ziehen. Kein Abrieb sichtbar heißt: bereit fürs Wachsbad.' },
      ],
    },
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },

  {
    slug: 'kettenlaufzeit-heisswachs',
    title: 'Wie lange hält Kettenwachs? Intervalle, Kettenlaufzeit und Kostenrechnung',
    titleShort: 'Kettenwachs: Intervalle, Laufzeit & Kostenrechnung',
    description: 'Wie lange hält Kettenwachs wirklich? Intervalle, Kettenlaufzeit und eine ehrliche Kostenrechnung von Heißwachs vs. Öl über 15.000 km.',
    category: 'Grundlagen',
    scienceLink: { anchor: 'reibung', label: 'Reibung, Kettenlaufzeit und Kosten im Messvergleich' },
    linksToCalculator: true,
    featured: true,
    stats: [
      { value: '400–550 km', label: 'Intervall' },
      { value: '6–12.000 km', label: 'Kettenlaufzeit' },
      { value: '125–190 €', label: 'Ersparnis' },
    ],
    publishDate: '2026-05-19',
    dateModified: '2026-07-27',
    readingTime: '7 min',
    takeaways: [
      'Nachwachsen bei trockenen Bedingungen alle 400 bis 550 km, bei Nässe, Schotter oder MTB alle 200 bis 300 km.',
      'Das zuverlässigste Signal ist das Geräusch, nicht die Optik: Sobald die Kette unter Last trockener klingt, ist sie fällig.',
      'Kettenlaufzeit typisch 6.000 bis 12.000 km gegenüber 2.000 bis 3.000 km bei Öl, also grob das Zwei- bis Dreifache.',
      'Über 15.000 km spart Wachs rund 120 bis 160 Euro. Kein dramatischer Betrag, aber die Rechnung geht auf.',
    ],
    keyStat: { value: '6–12.000 km', label: 'Kettenlaufzeit' },
    intro: 'Eine der häufigsten Fragen zu Heißwachs: Wann muss ich wieder wachsen, und lohnt sich das finanziell überhaupt? Beides lässt sich konkret beantworten, mit Messdaten und einer einfachen Rechnung über einen realistischen Nutzungszeitraum.',
    faq: [
      { q: 'Wie oft muss ich die Kette bei Heißwachs nachwachsen?', a: 'Bei trockenen Bedingungen alle 400 bis 550 km, bei Nässe, Schotter oder MTB alle 200 bis 300 km. Das zuverlässigste Signal ist das Geräusch: Sobald die Kette unter Last trockener klingt, ist sie fällig.' },
      { q: 'Wie lange hält eine gewachste Kette im Vergleich zu einer geölten?', a: 'Typisch 6.000 bis 12.000 km gegenüber 2.000 bis 3.000 km bei Öl, also grob das Zwei- bis Dreifache. Grund ist, dass Wachs keinen Schmutz bindet, der sonst als Schleifpaste wirkt.' },
      { q: 'Lohnt sich Heißwachs finanziell?', a: 'Über 15.000 km spart Heißwachs gegenüber Öl rund 125 bis 190 Euro, vor allem weil seltener Ketten und Kassetten gewechselt werden müssen. Kein dramatischer Betrag, aber die Rechnung geht auf.' },
      { q: 'Woran erkenne ich, dass die Kette nachgewachst werden muss?', a: 'Am Geräusch, nicht an der Optik. Eine saubere gewachste Kette sieht auch dann noch trocken und ordentlich aus, wenn das Wachs in den Gelenken schon aufgebraucht ist. Knirschen oder Quietschen unter Last ist das verlässliche Signal.' },
      { q: 'Verlängert eine 3-Ketten-Rotation die Lebensdauer der Kassette?', a: 'Ja. Der Verschleiß verteilt sich auf drei Ketten statt einer, sodass nie eine stark gedehnte Kette auf einen frischen Kassettenring trifft. Das schont die Kassette zusätzlich zum ohnehin geringeren Verschleiß durch Wachs.' },
    ],
    sections: [
      {
        type: 'h2',
        text: 'Wie lange hält Kettenwachs? Intervalle in der Praxis',
      },
      {
        type: 'p',
        text: 'Die Haltbarkeit von Heißwachs hängt stark von den Bedingungen ab. Paraffin wird durch Wasser herausgelöst. Regen, feuchte Straßen und Schmutz verkürzen den Zyklus erheblich. Als Orientierungswerte aus der Praxis:',
      },
      {
        type: 'ul',
        items: [
          'Trockene Straße / Rennrad / Commuter: 400–550 km pro Wachsvorgang',
          'Wechselhaftes Wetter / Gravelbike: 250–400 km',
          'Nass, MTB, Schotter mit Pfützen: 150–250 km',
          'Waxcelerate Pro mit MoS₂ (Nassbereich): ca. 15–20 % längere Intervalle als Classic',
        ],
      },
      {
        type: 'p',
        text: 'Der zuverlässigste Indikator für einen fälligen Nachwachsvorgang ist das Knirschen oder Quietschen der Kette unter Last, nicht die Farbe oder Optik. Eine saubere, gewachste Kette sieht lange "trocken" aus, auch wenn das Wachs in den Gelenken schon aufgebraucht ist. Wer bei Regen fährt: lieber früher wachsen als warten.',
      },
      {
        type: 'h2',
        text: 'Kettenlaufzeit: Öl vs. Heißwachs',
      },
      {
        type: 'p',
        text: 'Kettenverschleiß entsteht fast ausschließlich durch abrasive Partikel, die sich im Schmiermittel ansammeln. Öl zieht Straßenstaub, Sand und Metallabrieb an. Die Kette wird zur Schleifpaste. Wachs dagegen bindet keinen Schmutz: Schmutz setzt sich auf der äußeren Wachsschicht ab und bröselt ab, ohne in die Gelenke einzudringen.',
      },
      {
        type: 'image',
        src: '/images/blog/wax-bath-hanging-1600.webp',
        alt: 'Fahrradkette hängt zum Abkühlen nach dem Heißwachsbad',
        caption: 'Nach dem Bad abtropfen und abkühlen lassen, bevor die Kette wieder ans Rad kommt.',
      },
      {
        type: 'p',
        text: 'Das hat messbare Folgen für die Kettenlaufzeit. Als Verschleißgrenze gilt 0,5 % Kettendehnung ([[wie du das mit einer Kettenlehre selbst misst|/blog/kettenverschleiss-messen]]), ab der ein Kettenwechsel nötig ist, um Kassette und Kettenblätter zu schonen. Messwerte aus ZeroFriction Cycling-Tests:',
      },
      {
        type: 'ul',
        items: [
          'Kettenöl (gut gepflegt, regelmäßig gewechselt): 2.000–3.000 km bis 0,5 % Dehnung',
          'Heißwachs (korrekt angewendet, Intervall eingehalten): 6.000–12.000 km',
          'Heißwachs mit MoS₂ (Pro-Variante): vereinzelte Tests zeigen bis 8.500 km unter optimalen Bedingungen',
        ],
      },
      {
        type: 'p',
        text: 'Das ist keine Marketing-Aussage, sondern Messtechnik: Derselbe Prüfstand, dieselbe Last, nur das Schmiermittel unterschiedlich. Die Kettenlaufzeit verdreifacht sich näherungsweise.',
      },
      {
        type: 'h2',
        text: 'Kostenrechnung über 15.000 km',
      },
      {
        type: 'p',
        text: 'Um die Gesamtkosten fair zu vergleichen, rechnen wir beide Szenarien über 15.000 km durch. Das entspricht ungefähr 3 Jahren für einen Rennfahrer mit 5.000 km/Jahr.',
      },
      {
        type: 'h3',
        text: 'Szenario 1: Kettenöl',
      },
      {
        type: 'ul',
        items: [
          'Kettenwechsel bei 2.500 km → 6 Ketten über 15.000 km × 35 € = 210 €',
          'Öl-Anwendungen: ca. alle 200 km = 75 Anwendungen × 0,50 € (Ölverbrauch) = 38 €',
          'Gelegentlich Kassettenwechsel durch erhöhten Verschleiß (konservativ: 1 Kassette extra) ≈ 40 €',
          'Gesamtkosten Öl-Szenario: ca. 288 €',
        ],
      },
      {
        type: 'h3',
        text: 'Szenario 2: Heißwachs',
      },
      {
        type: 'ul',
        items: [
          'Kettenwechsel bei 7.000 km → 2–3 Ketten über 15.000 km × 35 € = 70–105 €',
          'Wachs: bei 400–550 km Intervall sind das rund 30 Anwendungen über 15.000 km. Ein 500-g-Block Classic (29,95 €) trägt 20–32 davon, also ein bis zwei Blöcke = 30–60 €',
          'Kassettenverschleiß deutlich geringer, kein Extra-Kassettenwechsel nötig',
          'Gesamtkosten Wachs-Szenario: ca. 100–165 €',
        ],
      },
      {
        type: 'p',
        text: 'Differenz: rund 125 bis 190 € Ersparnis über 15.000 km. Das ist kein dramatisches Ergebnis, aber solide. Wer teure Kassetten fährt (SRAM XDR, Shimano Dura-Ace), erhöht die Ersparnis erheblich, weil die längere Kettenlaufzeit den Kassettenring schützt.',
      },
      {
        type: 'h2',
        text: 'Warum die 3-Ketten-Rotation die Rechnung verändert',
      },
      {
        type: 'p',
        text: 'Auch mit nur einer Kette liegst du schon bei 6.000 bis 12.000 km. Mit drei rotierenden Ketten passiert etwas Zusätzliches: Jede Kette trägt weniger Gesamtkilometer als eine Einzelkette, weil der Verschleiß auf drei Exemplare verteilt wird. Das verlängert die Gesamtlaufzeit der Kassette noch weiter, weil nie eine stark gedehnte Kette auf einen "frischen" Kassettenring trifft.',
      },
      {
        type: 'tip',
        text: 'Wer bei Regen oder Schlechtwetter fährt: Die MoS₂-Variante (Waxcelerate Pro) verlängert die Intervalle in feuchten Bedingungen spürbar. Das reduziert die Gesamtzahl der Wachsvorgänge pro Jahr.',
      },
      {
        type: 'h2',
        text: 'Ehrliches Fazit',
      },
      {
        type: 'p',
        text: 'Heißwachs spart Geld, aber nicht dramatisch. Der eigentliche Gewinn ist Zeit (seltener wachsen, nie Schmiermittel auftropfen unterwegs) und Komfort (sauberer Antrieb, keine Öl-Flecken). Wer bereit ist, den initialen Aufwand für das Einrichten des Wachsbades und das erste Entfetten zu investieren, wird es nicht bereuen. Wer nur eine Kette besitzt und keine Lust auf Kettenwechsel hat: Flüssigwachs ist eine vernünftige Alternative.',
      },
    ],
    ctaSlug: 'wax-500-mos2',
    ctaText: 'Pro Heißwachs mit MoS₂ ansehen →',
  },

  {
    slug: 'heisswachs-anleitung',
    title: 'Fahrradkette mit Heißwachs behandeln: vollständige Anleitung',
    titleShort: 'Heißwachs Anleitung: Schritt für Schritt',
    description: 'Schritt-für-Schritt-Anleitung zum Wachsen einer Fahrradkette mit Heißwachs, von der Ausrüstung über die richtige Temperatur bis zum fertigen Ergebnis.',
    category: 'Anleitung',
    publishDate: '2026-05-19',
    dateModified: '2026-07-27',
    readingTime: '8 min',
    takeaways: [
      'Der ganze Vorgang braucht unter 20 Minuten aktive Zeit, der Rest ist Warten.',
      'Wachs auf 85 bis 90 °C, nie über 95 °C. Kette 10 bis 15 Minuten eintauchen, bis keine Luftbläschen mehr aufsteigen.',
      'Die aufsteigenden Bläschen sind das Qualitätssignal: Das ist verdrängte Luft aus den Gelenken. Erst wenn sie ausbleiben, ist die Kette durchtränkt.',
      'Erste 20 bis 30 km sind Einfahrphase. Weißes Pulver und eine anfangs steife Kette sind normal.',
    ],
    keyStat: { value: '< 20 Min.', label: 'Aktive Zeit' },
    intro: 'Heißwachs klingt aufwendiger als es ist. Wer den Prozess einmal gemacht hat, braucht für jeden Wachsvorgang weniger als 20 Minuten aktive Zeit. Diese Anleitung führt durch den vollständigen Prozess, von der nötigen Ausrüstung bis zur fertig eingefahrenen Kette.',
    faq: [
      { q: 'Welche Temperatur muss das Wachsbad beim Heißwachsen haben?', a: '85 bis 90 Grad Celsius. Darunter ist das Wachs zu zäh und dringt nicht tief genug ein, über 95 Grad oxidiert es schneller und die Additive verteilen sich ungleichmäßig.' },
      { q: 'Wie lange muss die Kette im Wachsbad bleiben?', a: '10 bis 15 Minuten. Bei geschlossenem Topfdeckel geht es etwas schneller. Die Kette ist erst durchtränkt, wenn keine Luftbläschen mehr aus den Gelenken aufsteigen.' },
      { q: 'Muss ich eine neue Kette vor dem ersten Wachsen entfetten?', a: 'Ja, zwingend. Neue Ketten sind ab Werk mit zähem Mineralöl konserviert, das nicht mit Paraffin kompatibel ist. 2 bis 3 Durchgänge Isopropanol 99 Prozent im verschlossenen Glas lösen es zuverlässig.' },
      { q: 'Was ist der Unterschied zwischen Classic und Pro beim Wachsen?', a: 'Waxcelerate Classic enthält Paraffin und PTFE für trockene Bedingungen. Pro enthält zusätzlich Molybdändisulfid, das vor allem bei Nässe und hohem Druck in den Gelenken die Reibung weiter senkt. Für überwiegend trockene Touren reicht Classic.' },
      { q: 'Wie pflege ich das Wachsbad, damit es lange hält?', a: 'Das Wachs komplett schmelzen und durch einen Kaffeefilter oder ein feines Sieb gießen, der Schmutz bleibt zurück. Danach das gefilterte Wachs zurück in den Topf geben und bei Bedarf mit neuem Block auffüllen.' },
    ],
    sections: [
      {
        type: 'h2',
        text: 'Ausrüstung',
      },
      {
        type: 'p',
        text: 'Das brauchst du, nicht mehr, nicht weniger:',
      },
      {
        type: 'ul',
        items: [
          'Heißwachs-Block (z.B. Waxcelerate Classic 500 g oder Pro mit MoS₂)',
          'Kleiner Topf oder Slow Cooker (Mini-Crockpot, 0,5–1 L Fassungsvermögen)',
          'Thermometer (optional, aber empfehlenswert. Ein einfaches Kochthermometer reicht)',
          'Kettenwerkzeug oder Schnellverschluss-Link (KMC, SRAM, Shimano)',
          'Isopropanol 99 % und Glasgefäß (nur bei neuen Ketten oder Ketten, die bisher geölt wurden)',
          'Backpapier oder Alufolie unter dem Topf (schützt die Arbeitsfläche vor Spritzern)',
          'Haken oder Draht zum Aufhängen der Kette während des Abkühlens',
        ],
      },
      {
        type: 'h2',
        text: 'Die richtige Temperatur',
      },
      {
        type: 'p',
        text: 'Der kritischste Parameter beim Heißwachsen ist die Temperatur des Wachsbades. Der optimale Bereich liegt bei 85–90 °C:',
      },
      {
        type: 'ul',
        items: [
          'Unter 80 °C: Das Wachs ist zu viskös. Es dringt nicht tief genug in die Gelenke ein, und die Kette kommt mit zu dicker Außenschicht heraus.',
          '85–90 °C: Optimaler Bereich. Das Wachs ist dünnflüssig genug für gute Penetration, aber nicht so heiß, dass es schnell degradiert.',
          'Über 95 °C: Das Wachs beginnt schneller zu oxidieren. Der Schmelzpunkt verändert sich mit der Zeit, und PTFE-Additive verteilen sich ungleichmäßig.',
        ],
      },
      {
        type: 'tip',
        text: 'Ohne Thermometer: Das Wachs ist bereit, wenn es vollständig flüssig ist und leicht glänzt, aber noch keine Dämpfe sichtbar sind und keine Blasenbildung auftritt. Bei einem Slow Cooker auf niedrigster Stufe, mit Deckel, ist die Temperatur meist automatisch im richtigen Bereich.',
      },
      {
        type: 'h2',
        text: 'Erstbehandlung: Neue Kette wachsen',
      },
      {
        type: 'p',
        text: 'Bei einer neuen Kette ist das Entfetten zwingend notwendig. Das Fabrikfett ist nicht kompatibel mit Paraffin.',
      },
      {
        type: 'ol',
        items: [
          'Kette aus der Verpackung nehmen. Neue Shimano- und KMC-Ketten sind besonders stark geölt. Sehen oft silbrig-glänzend aus.',
          'Kette in Glasgefäß mit Isopropanol 99 % geben. Deckel drauf, 60 Sekunden kräftig schütteln. IPA wird trüb.',
          'IPA abschütten, frisches IPA rein, erneut 60 Sekunden schütteln. Nach der 2. Runde prüfen: IPA sollte kaum noch trüb werden.',
          'Kette auf sauberem Tuch ausbreiten. 10–15 Minuten bei Raumtemperatur vollständig trocknen lassen.',
          'Weißen-Tuch-Test: Kette über Papiertuch ziehen. Kein Ölfilm sichtbar? Bereit.',
          'Wachs auf 85–90 °C erhitzen. Kette einhängen. 10–15 Minuten warten, bei geschlossenem Topfdeckel geht es schneller.',
          'Kette herausheben, kurz abtropfen lassen, an einem Haken aufhängen. Nicht auf Oberflächen legen. Wachs läuft ab.',
          'Abkühlen lassen bis Raumtemperatur (ca. 10 Minuten).',
          'Einfahren: Kette durch die Hände laufen lassen, 10–20 Mal, bis sie biegsam ist. Das bricht überschüssiges Außenwachs auf und macht die Kette geschmeidig.',
        ],
      },
      {
        type: 'h2',
        text: 'Nachwachsen: Gebrauchte Kette auffrischen',
      },
      {
        type: 'p',
        text: 'Eine Kette, die zuvor mit Heißwachs behandelt wurde und nicht mit Öl in Berührung gekommen ist, kann direkt nachgewachst werden, ohne IPA.',
      },
      {
        type: 'ol',
        items: [
          'Kette vom Rad nehmen (Schnellverschluss öffnen).',
          'Kette unter heißem Wasser (so heiß wie möglich aus der Leitung) abspülen. Optional: 1–2 Tropfen Spülmittel dazu, kurz einwirken, abspülen.',
          'Kette auf Tuch legen. Vollständig trocknen lassen. Mindestens 20 Minuten, oder kurz mit einem Fön beschleunigen.',
          'Wichtig: Kette muss wirklich trocken sein. Wasser im heißen Wachsbad spritzt heftig.',
          'Kette ins auf 85–90 °C erhitzte Wachsbad hängen. 10 Minuten warten.',
          'Aushängen, abtropfen, aufhängen zum Abkühlen.',
          'Einfahren durch die Hände bis die Kette biegsam ist.',
        ],
      },
      {
        type: 'h2',
        text: 'Das Wachsbad pflegen',
      },
      {
        type: 'p',
        text: 'Ein Wachsbad hält Monate, wenn man es sauber hält. Mit der Zeit sammeln sich Schmutzpartikel und Metallabrieb am Boden des Topfes. Das schadet dem Wachs nicht sofort, aber irgendwann sollte man es reinigen:',
      },
      {
        type: 'ul',
        items: [
          'Wachs komplett schmelzen, durch einen Kaffeefilter oder feines Sieb filtern. Schmutz bleibt im Filter zurück.',
          'Gereinigtes Wachs wieder in den Topf geben.',
          'Ein sauberes Wachsbad ist klarer und leicht gelblich; ein verschmutztes wird dunkler und trüber.',
          'Neue Wachsblöcke einfach dazugeben, wenn der Pegel sinkt.',
        ],
      },
      {
        type: 'h2',
        text: 'Häufige Fehler und wie man sie vermeidet',
      },
      {
        type: 'ul',
        items: [
          'Nasse Kette ins Wachsbad: Immer sofort auffallend (heißes Wachs + Wasser = Spritzer). Vor dem Einbad immer Trockenheit sicherstellen.',
          'Wachs zu heiß: Rauchen oder starkes Dampfen ist ein Zeichen, dass die Temperatur zu hoch ist. Herd ausschalten, kurz warten.',
          'Kette zu kurz eingetaucht: 10 Minuten sind das Minimum. Weniger reicht nicht für vollständige Penetration.',
          'Kein Einfahren: Kette direkt ans Rad und losfahren. Das Wachs außen ist noch hart und bricht beim ersten Pedalieren ungleichmäßig auf. Lieber vorher durch die Hände laufen lassen.',
        ],
      },
      {
        type: 'h2',
        text: 'Classic vs. Pro: Wann lohnt sich MoS₂?',
      },
      {
        type: 'p',
        text: 'Waxcelerate Classic ist das Standard-Produkt für Straße und trockene Bedingungen. Waxcelerate Pro enthält zusätzlich Molybdändisulfid (MoS₂), ein Festschmierstoff, der vor allem bei Nässe und hohem Druck in den Kettengelenken die Reibung weiter senkt. In Friktionsmessungen zeigt MoS₂-Wachs besonders bei simulierten Nassbedingungen eine messbare Verbesserung. Wer häufig im Regen oder auf Schotter fährt, ist mit der Pro-Variante besser bedient; für überwiegend trockene Touren reicht Classic vollkommen.',
      },
      {
        type: 'tip',
        text: 'Pro-Tipp für Vielfahrer: Behalte denselben Topf und dasselbe Wachs für alle Ketten deiner Rotation. Das Wachs "lernt" über Zeit. Die Zusammensetzung stabilisiert sich nach den ersten paar Ketten.',
      },
    ],
    howTo: {
      name: 'Fahrradkette mit Heißwachs behandeln',
      totalTime: 'PT45M',
      steps: [
        { name: 'Kette entfetten', text: 'Neue Kette 2× je 60 Sekunden in Isopropanol 99 % schütteln, bis das IPA nicht mehr trüb wird. Dann vollständig trocknen lassen (10–15 min) und mit weißem Tuch prüfen, kein Ölfilm mehr sichtbar.' },
        { name: 'Wachs erhitzen', text: 'Waxcelerate auf 85–90 °C erhitzen. Das Wachs ist bereit, wenn es vollständig flüssig ist und leicht glänzt, aber noch keine Dämpfe sichtbar sind.' },
        { name: 'Kette eintauchen', text: 'Kette vollständig ins Wachsbad hängen. Mindestens 10–15 Minuten einwirken lassen. Deckel schließen hält die Temperatur stabiler.' },
        { name: 'Kette aushängen und abkühlen', text: 'Kette an einem Haken aufhängen und abtropfen lassen. 10 Minuten auf Raumtemperatur abkühlen lassen.' },
        { name: 'Einfahren', text: 'Kette 10–20 Mal durch die Hände laufen lassen, bis sie wieder biegsam ist. Überschüssiges Außenwachs bricht auf. Das weiße Pulver, das abfällt, ist normal.' },
      ],
    },
    ctaSlug: 'wax-300',
    ctaText: 'Classic Heißwachs 300 g ansehen →',
  },
  {
    slug: 'mos2-kettenwachs',
    title: 'MoS₂ im Kettenwachs: Was Molybdändisulfid für deine Kette tut',
    titleShort: 'MoS₂ Kettenwachs erklärt',
    description: 'Was ist Molybdändisulfid (MoS₂) und warum ist es im Kettenwachs sinnvoll? Physik, Einsatzgebiete und wann Classic ausreicht.',
    category: 'Technik',
    scienceLink: { anchor: 'formel', label: 'Die Physik hinter MoS₂, mit Formel-Grafik und Mikroskopaufnahmen' },
    publishDate: '2026-06-01',
    dateModified: '2026-07-27',
    readingTime: '6 min',
    takeaways: [
      'MoS₂ ist ein Schichtmineral: Innerhalb der Schichten sitzen starke Bindungen, zwischen ihnen nur schwache Van-der-Waals-Kräfte. Deshalb gleiten sie so leicht.',
      'Unter Druck bildet sich ein Transferfilm auf dem Metall, der auch dann noch schmiert, wenn das Paraffin ringsum verdrängt ist.',
      'Der Film braucht 20 bis 30 km, danach läuft die Kette oft leiser als direkt nach der Montage.',
      'Im festen Block ist MoS₂ vollständig eingekapselt, es besteht keine Haut- oder Inhalationsgefahr.',
    ],
    keyStat: { value: '20–30 km', label: 'Bis Transferfilm steht' },
    intro: 'Waxcelerate Pro enthält neben Paraffin und PTFE auch Molybdändisulfid, abgekürzt MoS₂. Auf Produktverpackungen taucht der Begriff regelmäßig auf, eine Erklärung bleibt meist aus. Dieser Artikel erklärt, was MoS₂ auf atomarer Ebene tut, warum es bei Kettenschmierung sinnvoll ist, und wann du es wirklich brauchst.',
    faq: [
      { q: 'Was ist MoS₂ und wie wirkt es im Kettenwachs?', a: 'Molybdändisulfid ist ein Schichtmineral, dessen Schichten unter Druck leicht gegeneinander abgleiten. In der Kette lagert es sich als Transferfilm direkt auf den Metallflächen ab und schmiert auch dann noch, wenn der Paraffinfilm ringsum komprimiert oder verdrängt ist.' },
      { q: 'Ist MoS₂-Kettenwachs gesundheitlich bedenklich?', a: 'Nein. MoS₂ ist chemisch inert, nicht wasserlöslich und wird nicht über die Haut aufgenommen. Im festen Wachsblock ist es zudem vollständig eingekapselt, es besteht keine Haut- oder Inhalationsgefahr.' },
      { q: 'Wann sollte ich Pro statt Classic verwenden?', a: 'Bei Ganzjahresbetrieb, häufigen Regenfahrten, Gravel oder Cyclocross sowie bei Temperaturen unter 5 Grad ist Pro die bessere Wahl. Für überwiegend trockene Sommerfahrten reicht Classic vollkommen.' },
      { q: 'Wie lange dauert es, bis sich der MoS₂-Transferfilm bildet?', a: 'Etwa 20 bis 30 km. Danach läuft eine frisch mit Pro gewachste Kette oft sogar noch etwas geschmeidiger als direkt nach der Montage.' },
      { q: 'Warum ist Waxcelerate Pro schwarz?', a: 'Die Farbe kommt von den feinen MoS₂-Partikeln, die dem Paraffin beigemischt sind. Auf der Kette selbst ist nach dem Aushärten und Einfahren kaum Verfärbung sichtbar, der Großteil des überschüssigen Wachses bricht als weißes Pulver ab.' },
    ],
    sections: [
      {
        type: 'h2',
        text: 'Was ist Molybdändisulfid?',
      },
      {
        type: 'p',
        text: 'Molybdändisulfid (MoS₂) ist ein natürlich vorkommendes Mineral aus der Gruppe der Übergangsmetall-Dichalkogenide. Chemisch besteht es aus einem Molybdänatom zwischen zwei Schwefelatomen, S–Mo–S. Diese Schichtstruktur ist der Schlüssel zu seiner Schmierwirkung.',
      },
      {
        type: 'p',
        text: 'MoS₂-Kristalle sind in dünne Schichten aufgebaut, die durch schwache Van-der-Waals-Kräfte zusammengehalten werden. Unter mechanischem Druck gleiten diese Schichten gegeneinander ab, ähnlich wie Blätter in einem Stapel. Der Reibungskoeffizient des Feststoffs liegt in trockener Umgebung zwischen 0,03 und 0,06, im Vakuum sogar darunter. Zum Einordnen: PTFE, das im Classic steckt, liegt bei 0,05 bis 0,10. Deshalb wird MoS₂ in der Raumfahrt und im Hochdruckmaschinenbau eingesetzt.',
      },
      {
        type: 'h2',
        text: 'Wie wirkt MoS₂ in einer Fahrradkette?',
      },
      {
        type: 'p',
        text: 'In einer Fahrradkette entstehen die größten Reibungskräfte in den Rollenlagern, also im Kontakt zwischen Kettenbolzen und Kettenhülse. Bei jedem Umlauf über das Kettenblatt und die Kassettenzähne verbiegt sich die Kette leicht, die Bolzen drehen sich in den Hülsen. Genau dort muss das Schmiermittel wirken.',
      },
      {
        type: 'p',
        text: 'Reines Paraffin mit PTFE (Waxcelerate Classic) schmiert gut bei normalen Bedingungen. Bei erhöhtem Druck, hohes Tretkraft, hohes Körpergewicht, E-Bike-Unterstützung oder schwere Geländebelastung, kann die Paraffinschicht komprimiert werden, und die Metallteile kommen näher aneinander. MoS₂ lagert sich als Transferfilm direkt auf den Metalloberflächen ab. Dieser Film bleibt auch dann wirksam, wenn der Paraffinfilm verdrängt wird.',
      },
      {
        type: 'tip',
        text: 'Der MoS₂-Transferfilm bildet sich nach den ersten 20–30 km. Deshalb läuft eine frisch mit Pro gewachste Kette nach kurzer Einfahrzeit noch etwas geschmeidiger als direkt nach der Montage.',
      },
      {
        type: 'h2',
        text: 'MoS₂ und Wasser: der Nasswitterungsvorteil',
      },
      {
        type: 'p',
        text: 'Paraffin alleine ist zwar wasserabweisend, wird aber bei längerem Regenkontakt von den Metalloberflächen abgewaschen, besonders an exponierten Stellen wie Kettenbolzen und Nieten. MoS₂ bildet dagegen unter Druck einen dünnen Transferfilm, der sich mechanisch in die Oberfläche einarbeitet und dort auch dann bleibt, wenn das Paraffin ringsum ausgewaschen ist. Kovalent gebunden ist dieser Film nicht, das wird oft falsch dargestellt: Die starken Bindungen sitzen innerhalb der MoS₂-Schichten, zwischen den Schichten wirken nur schwache Van-der-Waals-Kräfte. Genau deshalb gleiten sie so leicht.',
      },
      {
        type: 'p',
        text: 'In der Praxis liegen beide bei trockenen Asphaltbedingungen im selben Fenster von 400 bis 550 km. Der Unterschied zeigt sich dort, wo es unangenehm wird: bei Nässe, auf Schotter und unter hoher Dauerlast. Da rutscht Classic ans untere Ende von 200 bis 300 km, während Pro dank Transferfilm eher am oberen Ende bleibt. Wer überwiegend im Sommer auf trockener Straße fährt, merkt zwischen beiden kaum einen Unterschied.',
      },
      {
        type: 'h2',
        text: 'Ist MoS₂ gesundheitlich bedenklich?',
      },
      {
        type: 'p',
        text: 'Nein. Molybdändisulfid ist chemisch inert, nicht wasserlöslich und wird nicht über die Haut aufgenommen. Es ist in der EU als Schmierstoffadditiv für Lebensmittelkontaktmaterialien zugelassen und wird seit Jahrzehnten in der Automobilindustrie, Luft- und Raumfahrt sowie im Maschinenbau eingesetzt. Die schwarze Farbe des Pro-Wachses kommt von den feinen MoS₂-Partikeln. Sie hinterlässt auf der Kette eine leicht dunklere Patina, aber keinen Schmierfilm.',
      },
      {
        type: 'h2',
        text: 'Wann reicht Classic, wann brauche ich Pro?',
      },
      {
        type: 'ul',
        items: [
          'Classic reicht: Überwiegend trockene Ausfahrten, Rennrad im Sommer, Gewicht unter 80 kg, keine E-Bike-Unterstützung',
          'Pro sinnvoll: Ganzjahresbetrieb, häufige Regenfahrten, Gravelbike auf Schotter, schweres Gepäck oder E-Bike, Cyclocross',
          'Pro empfohlen: Herbst und Winter, wenn Temperaturen unter 5 °C fallen. MoS₂ behält seine Schmierwirkung bis −8 °C',
          'Im Zweifel: Pro. Der Preisunterschied (5 €) ist gering, der Vorteil bei wechselhaftem Wetter messbar',
        ],
      },
      {
        type: 'h2',
        text: 'Warum das Wachs schwarz ist, und was das bedeutet',
      },
      {
        type: 'p',
        text: 'MoS₂ ist von Natur aus silbergrau bis schwarz. In Waxcelerate Pro ist es in feiner Partikelgröße in das Paraffinwachs eingemischt. Daher kommt die schwarze Farbe des Blocks und des flüssigen Wachses. Auf der Kette selbst ist nach dem Aushärten kaum Verfärbung sichtbar; der Großteil des überschüssigen Wachses bricht beim Einfahren ab (das weiße Pulver, das du an der Kette siehst). Was bleibt, ist der dünne, unsichtbare MoS₂-Transferfilm auf den Kontaktflächen.',
      },
      {
        type: 'note',
        text: 'Den Wachstopf nach der Nutzung von Pro-Wachs nicht mit Classic mischen. Die schwarzen MoS₂-Partikel verbleiben im Topf und würden das Classic-Wachs leicht verunreinigen. Für Pro-Nutzer empfiehlt sich ein dedizierter Topf.',
      },
    ],
    ctaSlug: 'wax-500-mos2',
    ctaText: 'Waxcelerate Pro mit MoS₂ ansehen →',
  },
  {
    slug: 'kettenwachs-rennrad-gravelbike',
    title: 'Kettenwachs für Rennrad und Gravelbike: Warum Heißwachs hier besonders sinnvoll ist',
    titleShort: 'Kettenwachs für Rennrad & Gravelbike',
    description: 'Für Rennrad- und Gravelbike-Fahrer lohnt sich Heißwachs besonders: niedrigste Reibung, sauberer Antrieb, längere Kettenlaufzeit. Was zu beachten ist.',
    category: 'Kaufberatung',
    linksToCalculator: true,
    publishDate: '2026-06-01',
    dateModified: '2026-07-27',
    readingTime: '7 min',
    takeaways: [
      'Auf dem Rennrad zählt der Reibungsvorteil von rund 2 % der Tretleistung, auf dem Gravelbike vor allem, dass Wachs keinen Schotterstaub bindet.',
      'Eine geölte Kette macht aus Sand eine Schleifpaste. Eine gewachste Kette wirft die Partikel beim nächsten Pedaltritt wieder ab.',
      'Nachwachsen alle 400 bis 550 km trocken, auf Schotter eher alle 200 bis 300 km.',
      'Mit einer 3-Ketten-Rotation wachst du alle drei in einer Session und wechselst in 60 Sekunden am Rad.',
    ],
    keyStat: { value: '60 km', label: 'Schotter sauber' },
    intro: 'Heißwachs ist für jede Fahrradkette geeignet, aber für Rennrad- und Gravelbike-Fahrer lohnt es sich besonders. Wer auf Leistung und Sauberkeit achtet, für wen jedes Watt zählt oder wer einfach nicht will, dass die Kette nach 50 km Gravelpiste eine schwarze Öllage trägt: Heißwachs ist die logische Wahl.',
    faq: [
      { q: 'Welches Kettenwachs eignet sich für Rennrad, welches für Gravel?', a: 'Für Rennrad im Sommer und überwiegend Asphalt reicht Waxcelerate Classic. Für Ganzjahresbetrieb, häufigen Regen oder Gravelbike auf Schotter ist Waxcelerate Pro mit MoS₂ die stabilere Wahl, weil der Transferfilm Feuchtigkeit und Druck besser widersteht.' },
      { q: 'Wie oft muss ich beim Rennrad nachwachsen?', a: 'Bei trockenen Asphaltbedingungen alle 400 bis 550 km, bei Regen, Schotter oder gemischten Bedingungen alle 200 bis 300 km. Erkennbar am Klang: Der Antrieb wird trockener und manchmal leicht quietschend.' },
      { q: 'Ist Heißwachs auch für moderne 12-fach-Ketten geeignet?', a: 'Ja, sogar besonders gut. 12-fach-Ketten sind enger gefertigt und empfindlicher gegenüber Abrasion, und Wachs bindet keinen Schmutz, der die engen Toleranzen angreift. Waxcelerate ist mit allen gängigen 12-fach-Systemen getestet.' },
      { q: 'Was muss ich beim Umstieg von Öl auf Wachs am Rennrad beachten?', a: 'Alte Kette vollständig entfetten oder ersetzen, Kassette und Kettenblätter von Ölresten befreien, dann 10 bis 15 Minuten im Wachsbad behandeln. Die ersten 20 bis 30 km sind Einfahrphase, danach läuft der Antrieb leise und sauber.' },
      { q: 'Lohnt sich Heißwachs auf dem Gravelbike bei viel Schotter?', a: 'Ja. Eine geölte Kette macht aus Schotterstaub und Sand eine Schleifpaste, eine gewachste Kette bleibt trocken und wirft die Partikel beim nächsten Pedaltritt wieder ab. Auch nach 60 km Schotter bleibt sie deutlich sauberer als eine geölte.' },
    ],
    sections: [
      {
        type: 'h2',
        text: 'Warum Wachs auf dem Rennrad besonders wirkt',
      },
      {
        type: 'p',
        text: 'Eine Fahrradkette überträgt unter Last nie 100 % der Tretkraft. Ein Teil geht als Wärme verloren, durch innere Reibung in den Kettengelenken. In unserer Laborreferenz bei 300–400 W Eingangsleistung liegt dieser Verlust bei Kettenöl um 7,5 W, bei Heißwachs um 2,6 W. Beides sind Richtwerte, keine garantierten Werte, denn jeder Prüfstand misst etwas anders. Die Größenordnung ist aber stabil: rund 2 % der Tretleistung. Auf dem Rennrad, wo Watt gezählt werden, ist das relevant.',
      },
      {
        type: 'p',
        text: 'Ein Wort zu den Reibungskoeffizienten, weil sie oft falsch verstanden werden: 0,05 bis 0,07 für PTFE im Classic und 0,03 bis 0,06 für MoS₂ im Pro sind Kennwerte der Festschmierstoffe selbst, gemessen unter Laborbedingungen. Sie beschreiben nicht die ganze Kette, denn dort kommen Kettenspannung, Verschmutzung und Geometrie dazu. Ehrlich bleibt: Der Festschmierstoff im Pro gleitet leichter, und unter Feuchtigkeit steigt der Wert bei MoS₂ deutlich an. Genau deshalb ist Pro bei Nässe besser als Classic, aber kein Freifahrtschein.',
      },
      {
        type: 'h2',
        text: 'Sauberkeit auf dem Gravelbike',
      },
      {
        type: 'p',
        text: 'Schotterfahrten bringen feinen Kies, Sand und Staub in direkten Kontakt mit dem Antrieb. Auf einer geölten Kette wirken diese Partikel wie Schleifpaste. Der Verschleiß an Kassette und Kettenblatt steigt stark. Eine gewachste Kette ist trocken und zieht keinen Schmutz an. Partikel, die auf die Kette gelangen, haften nicht und werden beim nächsten Pedaltritt einfach weggeworfen.',
      },
      {
        type: 'p',
        text: 'Das Ergebnis: gewachste Ketten auf dem Gravelbike bleiben auch nach 60 km Schotter deutlich sauberer als geölte. Die Kassette bleibt länger scharf, das Schaltwerk funktioniert präziser, und das Antriebsgewicht bleibt stabil statt Dreck aufzunehmen.',
      },
      {
        type: 'h2',
        text: 'Welches Wachs für Rennrad, welches für Gravel?',
      },
      {
        type: 'ul',
        items: [
          'Rennrad, Sommer, überwiegend Asphalt: Waxcelerate Classic reicht vollkommen, 400–550 km trocken.',
          'Rennrad, Ganzjahr oder häufig Regen: Waxcelerate Pro mit MoS₂. Gleiches Trockenintervall, aber deutlich stabiler, sobald Nässe und Schmutz dazukommen.',
          'Gravelbike, gemischtes Terrain: Waxcelerate Pro. Der MoS₂-Transferfilm widersteht mechanischem Druck und Feuchtigkeit besser.',
          'Cyclocross: Waxcelerate Pro. Kurze Intervalle, oft nass. Die hydrophobe Matrix macht einen Unterschied.',
        ],
      },
      {
        type: 'h2',
        text: 'Intervalle: Wie oft muss ich auf dem Rennrad nachwachsen?',
      },
      {
        type: 'p',
        text: 'Die Faustregel aus der Praxis: bei trockenen Asphaltbedingungen alle 400 bis 550 km, bei Regen, Schotter oder gemischten Bedingungen alle 200 bis 300 km. Pro hält sich in der zweiten Kategorie besser, das Trockenintervall ist bei beiden gleich.',
      },
      {
        type: 'p',
        text: 'Erkennbar ist das Ende des Intervalls am Klang: Der Antrieb klingt trockener, manchmal leichtes Quietschen unter Last. Auf dem Rennrad bei sportlicher Belastung spürst du auch minimal mehr Widerstand. Lieber 50 km früher nachwachsen als zu spät.',
      },
      {
        type: 'tip',
        text: '3-Ketten-Rotation auf dem Rennrad: Mit drei Ketten im Wechsel wächst du alle drei auf einmal (ca. 15 Minuten) und wechselst alle 300–400 km. Keine Wartezeit, kein Aufwand während der Saison, und alle drei Ketten verschleißen gleichmäßig. Die Kassette hält doppelt so lange.',
      },
      {
        type: 'h2',
        text: 'Was ist mit modernen 12-fach-Systemen?',
      },
      {
        type: 'p',
        text: '12-fach-Ketten (Shimano Dura-Ace, SRAM Red/Force AXS, Campagnolo Super Record) sind enger gefertigt und empfindlicher gegenüber Abrasion. Genau deshalb profitieren sie besonders von Heißwachs: kein Schmutz, der die engen Toleranzen angreift. Waxcelerate ist mit allen gängigen 12-fach-Ketten getestet und kompatibel. Die Erstentfettung ist bei modernen 12-fach-Ketten wichtiger denn je. Das Werkfett haftet stärker.',
      },
      {
        type: 'h2',
        text: 'Umstieg von Öl auf Wachs: Was auf dem Rennrad zu beachten ist',
      },
      {
        type: 'ol',
        items: [
          'Alte Kette entsorgen oder vollständig entfetten (Ultraschallbad für beste Ergebnisse)',
          'Kassette und Kettenblätter reinigen. Ölreste dort kontaminieren die neue Wachskette schnell',
          'Neue Kette oder sauber entfettete Kette 10–15 min im Wachsbad (85–90 °C)',
          'Erste 20–30 km sind die Einfahrphase. Der MoS₂-Transferfilm bildet sich erst, Wachs bricht ein',
          'Nach der Einfahrphase läuft die Kette auf dem Niveau, das du kennst: leise, leicht, sauber',
        ],
      },
      {
        type: 'note',
        text: 'Vorgewachste Ketten von Waxcelerate überspringen Schritt 1–3 komplett. Die Kette kommt bereits entfettet, gewachst und einfahrbereit, einfach montieren und losfahren.',
      },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Waxcelerate Classic für Rennrad & Gravel ansehen →',
  },
  {
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    title: 'Wachs hält nicht, Kette quietscht? Die 7 häufigsten Heißwachs-Fehler',
    titleShort: 'Wachs hält nicht? Die 7 häufigsten Fehler',
    description: 'Wachs blättert ab, die Kette quietscht nach 50 km, weißes Pulver überall? Die häufigsten Heißwachs-Fehler und wie du sie wirklich behebst.',
    category: 'Problemlösung',
    linksToCalculator: true,
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '6 min',
    keyStat: { value: '>90 %', label: 'Fehlerursache' },
    intro: 'Heißwachs ist im Grunde simpel: entfetten, eintauchen, abkühlen, fahren. Trotzdem berichten Einsteiger immer wieder von denselben Problemen. Wachs, das nicht hält, eine Kette, die schon nach 50 km wieder quietscht, oder ein Antrieb, der staubt. Die gute Nachricht: Fast jedes dieser Probleme hat eine einzige, identifizierbare Ursache. Hier sind die sieben häufigsten, mit dem konkreten Schritt, der sie löst.',
    takeaways: [
      'Wachs hält nicht → in über 90 % der Fälle nicht gründlich genug entfettet.',
      'Quietschen nach kurzer Zeit → Wachsbad zu kühl oder Kette zu kurz eingetaucht.',
      'Steife Kette und weißes Pulver → völlig normal, das Einfahren löst es.',
    ],
    faq: [
      { q: 'Warum hält mein Kettenwachs nicht und blättert ab?', a: 'In über 90 Prozent der Fälle liegt es am Entfetten. Wachs haftet nicht auf Öl, deshalb bricht es beim ersten Pedalieren wieder ab, wenn noch Fabrik- oder Restöl in den Gelenken sitzt.' },
      { q: 'Warum quietscht die Kette schon nach 50 km wieder?', a: 'Meist weil das Wachs nie tief eingedrungen ist, entweder war das Bad unter 80 Grad zu kühl oder die Kette zu kurz eingetaucht. 10 bis 15 Minuten bei 85 bis 90 Grad sind das Minimum für vollständige Penetration.' },
      { q: 'Ist weißes Pulver an der frisch gewachsten Kette ein Problem?', a: 'Nein, das ist überschüssiges Außenwachs, das beim Einfahren und auf den ersten Kilometern abbricht. Das wirksame Wachs sitzt geschützt in den Gelenken und ist davon nicht betroffen. Nach 20 bis 30 km verschwindet das Pulver von selbst.' },
      { q: 'Warum rostet meine gewachste Kette an den Außenlaschen?', a: 'Weil Wachs, anders als Öl, keinen dauerhaften Feuchtigkeitsfilm außen hinterlässt. Das ist funktional harmlos, solange die Gelenke innen gewachst sind. Nach Nässe die Kette kurz trockenreiben beugt vor.' },
      { q: 'Warum spritzt das Wachs, wenn ich die Kette eintauche?', a: 'Weil Wasser oder Lösungsmittelreste auf der Kette auf das 85 bis 90 Grad heiße Wachs treffen. Die Kette muss vor dem Bad vollständig trocken sein, nach dem Entfetten mindestens 10 bis 15 Minuten, nach dem Abspülen mit Wasser eher 20 Minuten.' },
    ],
    sections: [
      { type: 'h2', text: '1. Das Wachs blättert ab oder hält nicht, woran liegt das?' },
      { type: 'p', text: 'In über 90 % der Fälle liegt es am Entfetten. Wachs haftet nicht auf Öl. Wenn auch nur ein Film Fabrik- oder Restöl in den Kettengelenken sitzt, legt sich das Wachs außen darüber, statt sich mit dem Metall zu verbinden, und bricht beim ersten Pedalieren wieder ab. Das Wachs ist nicht schuld, die Vorbereitung ist es.' },
      { type: 'p', text: 'Die Lösung: Kette mit Isopropanol 99 % in einem verschließbaren Glas in 2–3 Durchgängen entfetten, bis das IPA kaum noch trüb wird. Danach der Weiße-Tuch-Test. Kette über ein Papiertuch ziehen, kein Abrieb sichtbar. Erst dann ins Wachsbad.' },
      { type: 'note', text: 'Kein 70-%-Isopropanol (Desinfektionsmittel) verwenden. Der Wasseranteil hinterlässt Rückstände in den Gliedern und fördert Rost. Nur 99 % oder 96 %.' },
      { type: 'h2', text: '2. Die Kette quietscht schon nach 50–100 km wieder' },
      { type: 'p', text: 'Quietschen so kurz nach dem Wachsen heißt fast immer: Das Wachs ist nie tief in die Gelenke eingedrungen. Dafür gibt es zwei typische Ursachen: Das Wachsbad war zu kühl (unter 80 °C, das Paraffin bleibt dann zu zäh) oder die Kette war zu kurz im Bad. 10 Minuten sind das Minimum, eher 15. Bei 85–90 °C zieht das flüssige Paraffin in jeden Bolzen und jede Hülse.' },
      { type: 'tip', text: 'Ein Zeichen, dass die Penetration stimmt: Während die kalte Kette im heißen Bad liegt, steigen für ein paar Minuten kleine Bläschen auf. Das ist verdrängte Luft aus den Gelenken. Erst wenn keine Bläschen mehr kommen, ist die Kette komplett durchtränkt.' },
      { type: 'h2', text: '3. Die Kette ist nach dem Abkühlen steif und springt' },
      { type: 'p', text: 'Das ist normal, und kein Defekt. Frisch gewachst sind die Gelenke vom erstarrten Paraffin verklebt. Wer so direkt losfährt, bekommt eine hakelige Schaltung. Der Schritt, den die meisten überspringen: das Einfahren. Kette 10–20 Mal durch die Hände laufen lassen oder über einen Stab knicken, bis jedes Glied sauber abwinkelt. Danach läuft sie geschmeidig.' },
      { type: 'h2', text: '4. Weißes Pulver fällt von der Kette, ist das schlecht?' },
      { type: 'p', text: 'Nein, das ist überschüssiges Außenwachs, das beim Einfahren und auf den ersten Kilometern abbricht. Es bedeutet nicht, dass das Schmiermittel verloren geht. Das wirksame Wachs sitzt geschützt in den Gelenken, nicht außen. Das Pulver verschwindet nach den ersten 20–30 km von selbst.' },
      { type: 'h2', text: '5. Die Kette rostet an den Außenlaschen' },
      { type: 'p', text: 'Flugrost an der Oberfläche nach einer Nassfahrt ist bei gewachsten Ketten möglich, weil Wachs, anders als Öl, keinen dauerhaften Feuchtigkeitsfilm außen hinterlässt. Funktional ist das harmlos, solange die Gelenke innen gewachst sind. Wichtiger ist, der Ursache vorzubeugen: Kette nach Nässe nie nass wegstellen, sondern kurz trockenreiben. Wer oft im Nassen fährt, profitiert von der MoS₂-Variante, deren Transferfilm direkter auf dem Stahl haftet.' },
      { type: 'h2', text: '6. Beim Eintauchen spritzt das Wachs' },
      { type: 'p', text: 'Das ist gefährlich und hat genau eine Ursache: Wasser oder Lösungsmittelreste auf der Kette treffen auf 85–90 °C heißes Wachs. Die Kette muss vor dem Bad vollständig trocken sein, nach dem Entfetten 10–15 Minuten an der Luft, nach dem Abspülen mit Wasser eher 20 Minuten oder kurz mit dem Fön. Im Zweifel länger warten.' },
      { type: 'h2', text: '7. Die Schaltung läuft nach dem Wechsel auf Wachs schlechter' },
      { type: 'p', text: 'Wenn der Umstieg von Öl kommt, sitzt der Fehler oft nicht an der Kette, sondern an Kassette und Kettenblättern: Dort kleben noch Ölreste, die die frisch gewachste Kette sofort wieder kontaminieren. Beim Umstieg deshalb den ganzen Antrieb entfetten, nicht nur die Kette. Danach die ersten 20–30 km als Einfahrphase einplanen. Erst danach läuft das System auf dem leisen, leichten Niveau, für das man Wachs überhaupt fährt.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'kettenwachs-faq',
    title: 'Kettenwachs FAQ: Die 15 häufigsten Fragen kurz beantwortet',
    titleShort: 'Kettenwachs FAQ: 15 Fragen, kurz beantwortet',
    description: 'Die häufigsten Fragen zu Heißwachs für Fahrradketten. Jeweils in zwei, drei Sätzen beantwortet. Für alle, die nur schnell eine Antwort brauchen.',
    category: 'Grundlagen',
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '5 min',
    keyStat: { value: '15', label: 'Fragen beantwortet' },
    intro: 'Nicht jede Frage braucht einen ganzen Artikel. Hier sind die fünfzehn Fragen, die uns am häufigsten erreichen, jeweils in zwei, drei Sätzen beantwortet. Für die tiefen Themen gibt es weiterführende Artikel, aber wer nur schnell eine Antwort sucht, findet sie hier.',
    faq: [
      { q: 'Wie oft muss ich die Kette nachwachsen?', a: 'Bei trockenen Bedingungen alle 400–550 km, bei Nässe, MTB oder gemischt 200–300 km. Der zuverlässigste Indikator ist nicht die Optik, sondern das Geräusch: Sobald die Kette unter Last trockener klingt oder quietscht, ist es Zeit.' },
      { q: 'Muss ich eine neue Kette vor dem ersten Wachsen entfetten?', a: 'Ja, zwingend. Neue Ketten sind ab Werk mit Mineralöl konserviert, und Wachs haftet nicht auf Öl. Ohne Entfetten hält das Wachs nicht. Ausnahme: bereits vorgewachste Ketten.' },
      { q: 'Welche Temperatur braucht das Wachsbad?', a: '85–90 °C. Darunter ist das Wachs zu zäh und dringt nicht in die Gelenke ein, darüber oxidiert es schneller. Ein Slow Cooker auf niedrigster Stufe trifft diesen Bereich meist von allein.' },
      { q: 'Wie lange muss die Kette im Wachs bleiben?', a: '10–15 Minuten. Die Kette ist erst durchtränkt, wenn keine Luftbläschen mehr aufsteigen.' },
      { q: 'Wachsen oder ölen, was ist besser?', a: 'Wachs läuft reibungsärmer, hält die Kette sauber und verlängert die Kettenlaufzeit deutlich. Öl ist bequemer und im Dauerregen robuster. Für Vielfahrer und sportliche Fahrer lohnt sich Wachs, für seltene Schlechtwetter-Pendler ist Öl legitim.' },
      { q: 'Brauche ich einen teuren Spezial-Topf?', a: 'Nein. Ein einfacher Mini-Slow-Cooker für 25–35 € reicht völlig. Wichtig ist nur, dass er die Temperatur niedrig und stabil hält.' },
      { q: 'Kann ich eine geölte Kette einfach ins Wachs tauchen?', a: 'Nein. Das Öl kontaminiert das Wachsbad und verhindert, dass das Wachs haftet. Erst gründlich entfetten.' },
      { q: 'Wie lange hält ein Wachsblock?', a: 'Ein 500-g-Block trägt 20 bis 32 Anwendungen, je nachdem wie viel Wachs beim Abtropfen an der Kette bleibt. Bei einem Intervall von 400 bis 550 km sind das grob 10.000 bis 17.000 km Fahrleistung pro Block.' },
      { q: 'Ist das weiße Pulver an der Kette ein Problem?', a: 'Nein, das ist überschüssiges Außenwachs, das beim Einfahren abbricht. Es verschwindet nach 20–30 km von selbst.' },
      { q: 'Funktioniert Wachs im Winter?', a: 'Bei Kälte und Trockenheit ja. Problematisch ist Streusalz und Dauernässe, die das Wachs schneller auswaschen. Dann häufiger nachwachsen oder zur MoS₂-Variante greifen.' },
      { q: 'Brauche ich einen Schnellverschluss?', a: 'Er macht das Abnehmen der Kette deutlich einfacher und ist für eine Rotation praktisch unverzichtbar. KMC- und SRAM-Quick-Links lassen sich mehrfach wiederverwenden.' },
      { q: 'Ist Heißwachs auch für E-Bikes geeignet?', a: 'Ja, gerade hier. E-Bike-Ketten verschleißen durch das hohe Drehmoment schneller. Die saubere, reibungsarme Wachsschmierung schont den Antrieb spürbar.' },
      { q: 'Kann ich Wachs und Tropfwachs kombinieren?', a: 'Ja, das ist sogar eine sehr praktische Methode: zwischen den Heißwachs-Gängen mit kompatiblem Tropfwachs auffrischen und nur etwa alle 1.000 km neu heiß wachsen.' },
      { q: 'Riecht oder qualmt das Wachs?', a: 'Bei richtiger Temperatur nahezu nicht. Sichtbarer Dampf oder Rauch ist ein Zeichen, dass das Bad zu heiß ist, dann Stufe reduzieren.' },
      { q: 'Was mache ich mit altem, verschmutztem Wachs?', a: 'Komplett schmelzen, durch einen Kaffeefilter gießen, der Schmutz bleibt zurück. Erstarrte Wachsreste gehören in den Restmüll, niemals in den Abfluss.' },
    ],
    sections: [
      { type: 'note', text: 'Die Antworten unten sind bewusst kurz gehalten. Verlinkte Begriffe und die Artikel im Blog gehen jeweils in die Tiefe.' },
      { type: 'h2', text: 'Anwendung & Intervalle' },
      { type: 'h3', text: 'Wie oft muss ich nachwachsen?' },
      { type: 'p', text: 'Bei trockenen Bedingungen alle 400–550 km, bei Nässe, MTB oder gemischt 200–300 km. Der zuverlässigste Indikator ist nicht die Optik, sondern das Geräusch: Sobald die Kette unter Last trockener klingt, ist es Zeit.' },
      { type: 'h3', text: 'Wie lange muss die Kette im Wachs bleiben?' },
      { type: 'p', text: '10–15 Minuten. Durchtränkt ist sie erst, wenn keine Luftbläschen mehr aufsteigen.' },
      { type: 'h3', text: 'Welche Temperatur braucht das Bad?' },
      { type: 'p', text: '85–90 °C. Darunter ist das Wachs zu zäh, darüber oxidiert es schneller. Ein Slow Cooker auf niedrigster Stufe trifft den Bereich meist von allein.' },
      { type: 'h2', text: 'Vorbereitung & Ausrüstung' },
      { type: 'h3', text: 'Muss ich eine neue Kette entfetten?' },
      { type: 'p', text: 'Ja, zwingend. Werksöl und Paraffin sind nicht kompatibel, ohne Entfetten hält das Wachs nicht. Ausnahme: bereits vorgewachste Ketten.' },
      { type: 'h3', text: 'Brauche ich einen teuren Topf?' },
      { type: 'p', text: 'Nein. Ein Mini-Slow-Cooker für 25–35 € reicht. Wichtig ist nur eine niedrige, stabile Temperatur.' },
      { type: 'h3', text: 'Brauche ich einen Schnellverschluss?' },
      { type: 'p', text: 'Für eine Rotation praktisch unverzichtbar. KMC- und SRAM-Quick-Links lassen sich mehrfach wiederverwenden.' },
      { type: 'h2', text: 'Leistung & Bedingungen' },
      { type: 'h3', text: 'Wachsen oder ölen?' },
      { type: 'p', text: 'Wachs läuft reibungsärmer, bleibt sauber und verlängert die Kettenlaufzeit. Öl ist bequemer und im Dauerregen robuster. Für Vielfahrer lohnt sich Wachs, für seltene Schlechtwetter-Pendler ist Öl legitim.' },
      { type: 'h3', text: 'Funktioniert Wachs im Winter?' },
      { type: 'p', text: 'Bei Kälte und Trockenheit ja. Problematisch sind Streusalz und Dauernässe, dann häufiger nachwachsen oder zur MoS₂-Variante greifen.' },
      { type: 'h3', text: 'Ist Wachs für E-Bikes geeignet?' },
      { type: 'p', text: 'Ja, gerade hier. E-Bike-Ketten verschleißen durch das hohe Drehmoment schneller; die saubere Wachsschmierung schont den Antrieb spürbar.' },
      { type: 'h2', text: 'Häufige Sorgen' },
      { type: 'h3', text: 'Ist das weiße Pulver ein Problem?' },
      { type: 'p', text: 'Nein, das ist überschüssiges Außenwachs, das beim Einfahren abbricht. Nach 20–30 km verschwindet es von selbst.' },
      { type: 'h3', text: 'Riecht oder qualmt das Wachs?' },
      { type: 'p', text: 'Bei richtiger Temperatur kaum. Sichtbarer Rauch heißt: Bad ist zu heiß, Stufe reduzieren.' },
      { type: 'h3', text: 'Was mache ich mit altem Wachs?' },
      { type: 'p', text: 'Schmelzen, durch einen Kaffeefilter gießen, der Schmutz bleibt zurück. Erstarrte Reste in den Restmüll, nie in den Abfluss.' },
      { type: 'tip', text: 'Eine Frage offen geblieben? Schreib uns direkt über die Kontaktseite. Die häufigsten neuen Fragen landen anschließend hier.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'vorgewachste-kette',
    title: 'Lohnt sich eine vorgewachste Kette? Was du beim Kauf wirklich bekommst',
    titleShort: 'Lohnt sich eine vorgewachste Kette?',
    description: 'Vorgewachste Fahrradkette kaufen: Was eine fertig gewachste Kette leistet, für wen sie sich lohnt und worauf du beim Kauf achten solltest.',
    category: 'Kaufberatung',
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '5 min',
    keyStat: { value: '400–550 km', label: 'Bis Nachwachsen' },
    intro: 'Eine vorgewachste Kette nimmt dir den aufwendigsten Teil des Heißwachsens ab: das erste Entfetten und das Einrichten des Wachsbades. Du montierst sie und fährst los. Aber lohnt sich der Aufpreis gegenüber einer Standardkette, die du selbst wachst? Die ehrliche Antwort hängt davon ab, wie oft du wachsen willst, und ob du überhaupt einsteigen möchtest.',
    takeaways: [
      'Eine vorgewachste Kette ist entfettet, im Wachsbad behandelt und einfahrbereit, einfach montieren und losfahren.',
      'Sinnvoll als Einstieg ohne eigene Ausrüstung und für alle, die den Aufwand der Erstbehandlung scheuen.',
      'Wer langfristig wachst, braucht trotzdem irgendwann Wachs und einen Topf zum Nachwachsen.',
    ],
    faq: [
      { q: 'Was ist eine vorgewachste Kette genau?', a: 'Eine fabrikneue Markenkette, bei der das Werks-Konservierungsöl bereits vollständig entfernt und durch Heißwachs ersetzt wurde. Sie kommt entfettet, im Wachsbad behandelt und einfahrbereit, du montierst sie und fährst los.' },
      { q: 'Für wen lohnt sich eine vorgewachste Kette?', a: 'Für Einsteiger ohne eigene Ausrüstung, für zeitknappe Vielfahrer, die sich die Erstbehandlung sparen wollen, und für alle, die Heißwachs erst einmal ausprobieren möchten, ohne sich gleich fürs ganze System zu entscheiden.' },
      { q: 'Muss ich eine vorgewachste Kette trotzdem irgendwann nachwachsen?', a: 'Ja. Auch eine vorgewachste Kette hält nur 400 bis 550 km trocken, danach ist Nachwachsen fällig. Die Vorbehandlung erspart dir den Einstieg, nicht die laufende Pflege.' },
      { q: 'Worauf sollte ich beim Kauf einer vorgewachsten Kette achten?', a: 'Auf eine Markenkette als Basis wie Shimano, SRAM oder YBN, eine mehrstufige Entfettung statt nur oberflächlicher Reinigung, die passende Geschwindigkeit für deine Schaltgruppe und im besten Fall einen mitgelieferten Schnellverschluss.' },
    ],
    sections: [
      { type: 'h2', text: 'Was ist eine vorgewachste Kette genau?' },
      { type: 'p', text: 'Eine vorgewachste Kette ist eine fabrikneue Markenkette (Shimano, SRAM, YBN), bei der das Werks-Konservierungsöl bereits vollständig entfernt und durch Heißwachs ersetzt wurde. Der Ablauf entspricht dem, was du sonst selbst machen würdest: mehrstufig entfetten, im 85–90 °C heißen Wachsbad behandeln, abkühlen, einfahren. Das Ergebnis ist eine trockene, saubere Kette, die du direkt montieren kannst.' },
      { type: 'p', text: 'Der entscheidende Punkt: Das Entfetten neuer Ketten ist der Schritt, an dem die meisten Einsteiger scheitern. Das Werksöl sitzt tief in den Gelenken und ist hartnäckig. Eine vorgewachste Kette überspringt genau diese Hürde.' },
      { type: 'h2', text: 'Für wen lohnt sich der Kauf?' },
      { type: 'ul', items: [
        'Einsteiger ohne Ausrüstung: Du willst die Vorteile von Wachs, aber (noch) keinen Topf, kein IPA und keine Wachsblöcke kaufen. Eine vorgewachste Kette ist der niedrigschwellige Einstieg.',
        'Zeitknappe Vielfahrer: Du kennst das Wachsen, willst dir aber die Erstbehandlung einer neuen Kette sparen.',
        'Geschenk oder Test: Du willst Heißwachs ausprobieren, ohne dich gleich für das ganze System zu entscheiden.',
      ] },
      { type: 'h2', text: 'Und wann lohnt es sich nicht?' },
      { type: 'p', text: 'Ehrlich gesagt: Wer ohnehin regelmäßig selbst wachst und bereits Topf und Wachs besitzt, zahlt für eine vorgewachste Kette vor allem den Arbeitslohn der Erstbehandlung. Das kann es wert sein, muss es aber nicht. Wenn du eine 3-Ketten-Rotation aufbaust, kaufst du günstiger Standardketten und wachst sie in einem Rutsch selbst.' },
      { type: 'note', text: 'Wichtig zu verstehen: Auch eine vorgewachste Kette muss irgendwann nachgewachst werden, nach 400–550 km trocken. Die Vorbehandlung spart dir den Einstieg, nicht die laufende Pflege. Spätestens dann brauchst du Wachs und einen Topf, oder du nutzt kompatibles Tropfwachs zum Auffrischen.' },
      { type: 'h2', text: 'Worauf du beim Kauf achten solltest' },
      { type: 'ul', items: [
        'Markenkette als Basis: Eine gewachste No-Name-Kette bleibt eine No-Name-Kette. Achte auf Shimano, SRAM oder YBN als Grundlage.',
        'Mehrstufige Entfettung: Seriöse Anbieter entfetten in mehreren Schritten (oft im Ultraschallbad), nicht nur oberflächlich. Sonst hält das Wachs nicht.',
        'Passende Geschwindigkeit: 11-fach und 12-fach sind nicht austauschbar. Prüfe die Kompatibilität mit deiner Schaltgruppe.',
        'Schnellverschluss dabei: Praktisch, wenn ein passender Quick-Link mitgeliefert wird. Den brauchst du fürs Nachwachsen ohnehin.',
      ] },
      { type: 'h2', text: 'Wie pflege ich eine vorgewachste Kette danach weiter?' },
      { type: 'p', text: 'Genau wie jede andere gewachste Kette, die noch nie mit Öl in Kontakt kam: einfach unter heißem Wasser abspülen, trocknen lassen und direkt ins Wachsbad hängen. Das aufwendige Entfetten mit Isopropanol brauchst du dafür nicht, das war nur für die erste Behandlung beim Hersteller nötig.' },
      { type: 'h2', text: 'Passt eine vorgewachste Kette in meine 3-Ketten-Rotation?' },
      { type: 'p', text: 'Ja, gut sogar. Wer mehrere vorgewachste Ketten kauft, startet direkt mit einer fertigen Rotation, ohne die Erstbehandlung für jede einzelne Kette selbst zu machen. Ab dem ersten Nachwachsen läufst du dann genauso wie mit selbst gewachsten Ketten.' },
      { type: 'h2', text: 'Fazit' },
      { type: 'p', text: 'Eine vorgewachste Kette ist kein Wundermittel, sondern eine bequeme Abkürzung. Sie nimmt dir die schwierigste Hürde ab und liefert ab Kilometer null die volle Wachsleistung. Für den Einstieg und für zeitknappe Fahrer ist das Geld gut investiert. Wer langfristig dabei bleibt, wechselt früher oder später trotzdem zum Selbermachen, und das ist auch völlig in Ordnung.' },
    ],
    ctaSlug: 'chain-hg701',
    ctaText: 'Vorgewachste Ketten ansehen →',
  },
  {
    slug: 'kettenwachs-winter',
    title: 'Kettenwachs im Winter: Streusalz, Regen und die ehrliche Wahrheit',
    titleShort: 'Kettenwachs im Winter: die ehrliche Wahrheit',
    description: 'Funktioniert Heißwachs im Winter? Was Streusalz und Dauernässe mit der Wachsschicht machen, wann Wachs überzeugt, und wann Öl die bessere Wahl ist.',
    category: 'Saison',
    scienceLink: { anchor: 'matrix-window', label: 'Das Temperaturfenster von Classic und Pro im Vergleich' },
    linksToCalculator: true,
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '6 min',
    keyStat: { value: '100–150 km', label: 'Intervall Streusalz' },
    intro: 'Kaum eine Frage spaltet die Wachs-Community so wie der Winter. Die einen schwören darauf, dass eine gewachste Kette im Schmuddelwetter sauber bleibt, die anderen warnen vor Streusalz und ausgewaschenem Wachs. Beide haben recht. Es kommt darauf an, wo und wie du fährst. Hier die ehrliche Einordnung, ohne das Produkt schönzureden.',
    takeaways: [
      'Bei trockener Kälte und gelegentlichem Regen ist Wachs im Winter klar im Vorteil: sauber, leise, kein verharztes Öl.',
      'Bei täglichem Streusalz und Dauernässe wäscht sich Wachs schneller aus, dann häufiger nachwachsen oder zu Öl greifen.',
      'Der größte Winter-Vorteil von Wachs: Es bindet keinen Salzschlamm, der sonst als Schleifpaste wirkt.',
    ],
    faq: [
      { q: 'Funktioniert Kettenwachs im Winter?', a: 'Bei trockener Kälte und gelegentlichem Regen ja, sogar mit klarem Vorteil: Wachs bindet keinen Schmutz, während eine geölte Kette Salzschlamm regelrecht aufsaugt. Bei täglichem Streusalz und Dauernässe wäscht sich Wachs dagegen schneller aus.' },
      { q: 'Was macht Streusalz mit einer gewachsten Kette?', a: 'Streusalz fördert Korrosion, und Feuchtigkeit löst das Paraffin schneller aus den Gelenken. Wachs hinterlässt außen keinen dauerhaften Schutzfilm wie Öl, deshalb kann sich nach einer Salzfahrt Flugrost an den Außenlaschen bilden. Innen bleibt die Kette trotzdem geschmiert.' },
      { q: 'Wie oft muss ich im Winter nachwachsen?', a: 'Bei täglichem Streusalz und Dauernässe verkürzt sich das Intervall auf etwa 100 bis 150 km statt der üblichen 400 bis 550 km im Trockenen. Nach Salzfahrten hilft es zusätzlich, die Kette kurz mit heißem Wasser abzuspülen und trockenzureiben.' },
      { q: 'Ist Öl im Winter die bessere Wahl?', a: 'Für tägliche Ganzjahres-Pendler durch Salz und Matsch ist ein gutes Nassöl oft die pragmatischere Wahl. Für sportliche Ausfahrten bei trockener Kälte oder wechselhaftem Wetter ohne Dauernässe bleibt Wachs, am besten die MoS₂-Variante, klar im Vorteil.' },
    ],
    sections: [
      { type: 'h2', text: 'Was im Winter wirklich gegen die Kette arbeitet' },
      { type: 'p', text: 'Drei Faktoren setzen einer Winterkette zu: Feuchtigkeit (löst Schmiermittel aus), Streusalz (fördert Korrosion) und der nasse Schmutzschlamm aus Salz, Splitt und Straßendreck (wirkt wie Schleifpaste). Entscheidend ist, wie ein Schmiermittel mit diesen drei umgeht.' },
      { type: 'h2', text: 'Wo Wachs im Winter punktet' },
      { type: 'p', text: 'Der größte Vorteil bleibt auch im Winter bestehen: Wachs bindet keinen Schmutz. Während eine geölte Kette den nassen Salzschlamm regelrecht aufsaugt und zu einer schwarzen, schmirgelnden Paste verklebt, perlt der Dreck an der trockenen Wachsschicht ab. Die Kette bleibt sauber, das Schaltwerk präziser, und der abrasive Verschleiß durch eingebundene Partikel fällt geringer aus.' },
      { type: 'p', text: 'Bei trockener Kälte, Frost ohne Salz, klare Wintertage, spielt Wachs seine Stärken voll aus. Paraffin bleibt bis weit unter den Gefrierpunkt funktionsfähig, und kein Öl verharzt bei Kälte.' },
      { type: 'h2', text: 'Wo Wachs an seine Grenzen kommt' },
      { type: 'p', text: 'Die ehrliche Kehrseite: Paraffin wird durch Wasser ausgewaschen. Wer täglich bei Dauerregen oder durch nasse, gesalzene Straßen pendelt, verkürzt das Wachsintervall drastisch. Statt 400 km sind es dann vielleicht 100–150 km — wie sich dieses Intervall im Trockenen überhaupt zusammensetzt, steht in [[Wie lange hält Kettenwachs? Intervalle, Kettenlaufzeit und Kostenrechnung|/blog/kettenlaufzeit-heisswachs]]. Und an den blanken Außenlaschen kann sich nach einer Salzfahrt Flugrost bilden, weil Wachs dort keinen dauerhaften Schutzfilm hinterlässt wie kriechendes Öl.' },
      {
        type: 'image',
        src: '/images/blog/chain-waxed-macro-1600.webp',
        alt: 'Nahaufnahme einer frisch gewachsten Fahrradkette',
        caption: 'Trocken gewachst bleibt der Antrieb auch nach einer schmutzigen Ausfahrt sichtbar sauber.',
      },
      { type: 'note', text: 'Das heißt nicht, dass die Kette kaputtgeht. Solange die Gelenke innen gewachst sind, läuft sie. Aber der Pflegeaufwand steigt im nassen Salzwinter spürbar. Das sollte man wissen, bevor man enttäuscht wird.' },
      { type: 'h2', text: 'Bei welcher Temperatur funktioniert Kettenwachs noch?' },
      { type: 'p', text: 'Paraffin bleibt bis weit unter den Gefrierpunkt funktionsfähig, ganz anders als Öl, das bei Kälte eher zäh und harzig wird. Die MoS₂-Variante Pro behält ihre Schmierwirkung sogar bis etwa minus 8 Grad, was sie für Wintertouren zur robusteren Wahl macht.' },
      { type: 'h2', text: 'Woran erkenne ich im Winter, dass ich zu spät dran bin?' },
      { type: 'p', text: 'Am gleichen Signal wie im Sommer: Sobald die Kette unter Last trockener klingt oder quietscht, ist Nachwachsen fällig. Im Winter lohnt es sich, danach genauer hinzuhören, weil Streusalz und Dauernässe das Intervall stark verkürzen und ein zu spätes Nachwachsen dann schneller zu Flugrost führt.' },
      { type: 'h2', text: 'Die praktische Empfehlung nach Fahrertyp' },
      { type: 'ul', items: [
        'Trockene Winterregion, sportliche Ausfahrten: Wachs, am besten die MoS₂-Variante. Sauber, leise, schützt vor Kältereibung.',
        'Pendler bei wechselhaftem Wetter ohne Dauernässe: Wachs funktioniert gut, einfach das Intervall verkürzen und nach Salzfahrten kurz abspülen und trockenreiben.',
        'Täglicher Ganzjahres-Pendler durch Salz und Matsch: Hier ist ein gutes Nassöl oft die pragmatischere Wahl, oder das Winterrad bekommt Öl, das gute Rad bleibt gewachst.',
      ] },
      { type: 'h2', text: 'Pflege-Tipps für die Wachskette im Winter' },
      { type: 'ol', items: [
        'Nach Salz- oder Nassfahrten die Kette kurz mit heißem Wasser abspülen und trockenreiben. Das entfernt Salz, bevor es arbeitet.',
        'Intervall halbieren: lieber einmal zu früh nachwachsen als mit aufgebrauchtem Wachs durch den Matsch.',
        'Zwischendurch mit kompatiblem Tropfwachs auffrischen, statt jedes Mal heiß zu wachsen.',
        'MoS₂-Variante nutzen: Der Transferfilm haftet direkter auf dem Stahl und widersteht Feuchtigkeit besser.',
      ] },
      { type: 'tip', text: 'Ein bewährtes Setup für Ganzjahresfahrer: zwei Wintersätze in Rotation. Während ein Satz im Einsatz ist, hängt der zweite frisch gewachst bereit. So fährst du nie auf aufgebrauchtem Wachs durch den Salzwinter.' },
    ],
    ctaSlug: 'wax-500-mos2',
    ctaText: 'Pro Heißwachs mit MoS₂ ansehen →',
  },
  {
    slug: 'topf-zum-kette-wachsen',
    title: 'Welcher Topf zum Kettenwachsen? Slow Cooker, Reiskocher & Co.',
    titleShort: 'Welcher Topf zum Kettenwachsen?',
    description: 'Slow Cooker, Reiskocher oder einfacher Topf zum Kette wachsen? Was wirklich funktioniert, worauf es bei der Temperatur ankommt, und was du nicht brauchst.',
    category: 'Kaufberatung',
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '5 min',
    keyStat: { value: '25–35 €', label: 'Slow Cooker' },
    intro: 'Eine der ersten Fragen beim Einstieg ins Heißwachsen: Worin schmelze ich das Wachs eigentlich? Die Antwort ist erfreulich günstig. Du brauchst kein Spezialgerät. Entscheidend ist nur eines: eine niedrige, stabile Temperatur. Hier ein ehrlicher Vergleich der Optionen.',
    takeaways: [
      'Ein einfacher Mini-Slow-Cooker für 25–35 € ist die beste Allround-Lösung.',
      'Wichtig ist nicht das Gerät, sondern dass es die Temperatur stabil bei 85–90 °C hält.',
      'Reserviere den Topf dauerhaft fürs Wachs. Er wird nicht wieder für Lebensmittel genutzt.',
    ],
    faq: [
      { q: 'Welcher Topf eignet sich zum Kettenwachsen?', a: 'Entscheidend ist nicht das Gerät, sondern dass es die Temperatur stabil bei 85 bis 90 Grad hält. Ein einfacher Mini-Slow-Cooker für 25 bis 35 Euro ist für die meisten die beste Lösung.' },
      { q: 'Brauche ich einen teuren Slow Cooker oder ein Spezialgerät?', a: 'Nein. Ein gebrauchter Mini-Crockpot vom Flohmarkt für ein paar Euro reicht völlig. Teure Chain-Waxing-Systeme für dreistellige Beträge leisten technisch dasselbe wie ein einfacher Slow Cooker.' },
      { q: 'Welche Temperatur muss der Topf für Kettenwachs halten?', a: '85 bis 90 Grad Celsius. Auf der niedrigsten Stufe pendelt sich ein Mini-Slow-Cooker oft von allein in diesem Bereich ein, kontrollieren lässt sich das beim ersten Mal einfach mit einem Küchenthermometer.' },
      { q: 'Kann ich einen Reiskocher zum Kettenwachsen benutzen?', a: 'Nur eingeschränkt. Viele Reiskocher kennen nur „Kochen" und „Warmhalten", wobei Warmhalten mit 65 bis 75 Grad oft zu kühl ist und Kochen zu heiß. Nur bei einstellbarer Temperatur oder guter Warmhaltefunktion geeignet.' },
      { q: 'Kann ich den Topf danach noch für Lebensmittel verwenden?', a: 'Nein. Wachs lässt sich nicht restlos aus dem Topf entfernen, deshalb wird er zum dauerhaften Wachstopf. Am besten von Anfang an ein gebrauchtes, günstiges Gerät dafür reservieren.' },
    ],
    sections: [
      { type: 'h2', text: 'Worauf es wirklich ankommt' },
      { type: 'p', text: 'Der optimale Temperaturbereich für Heißwachs liegt bei 85–90 °C. Darunter ist das Paraffin zu zäh und dringt nicht in die Gelenke ein, deutlich darüber oxidiert es schneller und kann qualmen. Jedes Gerät, das diesen Bereich stabil und ohne Überhitzung hält, ist geeignet. Alles andere, Marke, Optik, Zusatzfunktionen, ist zweitrangig.' },
      { type: 'h2', text: 'Option 1: Mini-Slow-Cooker (die Empfehlung)' },
      { type: 'p', text: 'Ein kleiner Slow Cooker (Crockpot, Fassungsvermögen 0,5–1,5 l) ist für die meisten die beste Wahl. Auf der niedrigsten Stufe pendelt er sich oft von allein im richtigen Bereich ein, die Wärme kommt sanft und gleichmäßig, und es gibt nichts, was überhitzen kann. Preis: 25–35 €. Der herausnehmbare Keramik- oder Metalleinsatz macht das Handling einfach.' },
      { type: 'tip', text: 'Beim ersten Mal mit einem Küchenthermometer kontrollieren, wo die niedrigste Stufe deines Geräts landet. Viele Mini-Cooker liegen bei 80–90 °C, ideal. Manche laufen heißer; dann hilft es, den Deckel leicht versetzt aufzulegen.' },
      { type: 'h2', text: 'Option 2: Reiskocher' },
      { type: 'p', text: 'Ein einfacher Reiskocher funktioniert, ist aber heikler: Viele Modelle haben nur „Kochen" und „Warmhalten". Warmhalten ist oft zu kühl (65–75 °C), Kochen zu heiß. Wer einen Reiskocher mit einstellbarer Temperatur oder einer guten Warmhaltefunktion hat, kann ihn nutzen. Sonst lieber zum Slow Cooker greifen.' },
      { type: 'h2', text: 'Option 3: Topf auf dem Herd' },
      { type: 'p', text: 'Geht zur Not, ist aber die schlechteste Dauerlösung. Die Temperatur schwankt stark, man muss ständig danebenstehen, und die Überhitzungsgefahr ist real. Wenn überhaupt, dann mit Wasserbad-Prinzip (Wachs im kleineren Gefäß, das in einem Topf mit Wasser steht). Das deckelt die Temperatur natürlich bei rund 100 °C. Für den gelegentlichen Einstieg okay, für die Dauer unkomfortabel.' },
      { type: 'h2', text: 'Option 4: Sous-vide-Beutel-Methode' },
      { type: 'p', text: 'Manche Wachsblöcke kommen in einem hitzebeständigen Beutel, den man einfach in einen Topf mit heißem Wasser legt. Praktisch für unterwegs oder als platzsparende Lösung, weil kein eigenes Gerät nötig ist. Für eine regelmäßige Rotation ist ein fester Slow-Cooker-Aufbau aber bequemer.' },
      { type: 'note', text: 'Ganz wichtig: Der Topf wird zum Wachstopf und bleibt es. Wachs lässt sich nicht restlos entfernen, und du willst kein Schmiermittel-Additiv im Essen. Ein gebrauchtes Gerät vom Flohmarkt für ein paar Euro reicht völlig.' },
      { type: 'h2', text: 'Wie groß muss der Topf für eine 3-Ketten-Rotation sein?' },
      { type: 'p', text: 'Reicht, um alle drei Ketten gleichzeitig zu bedecken, mehr nicht. Ein 0,5- bis 1,5-Liter-Slow-Cooker fasst in der Regel drei Ketten problemlos, weil sie sich beim Eintauchen ineinanderhängen lassen. Ein größeres Gefäß bedeutet vor allem längere Aufheizzeit, keinen Vorteil beim Wachsen selbst.' },
      { type: 'h2', text: 'Wie oft muss ich Wachs nachfüllen?' },
      { type: 'p', text: 'Ein 500-Gramm-Block trägt 15 bis 20 Wachsvorgänge für eine Kette. Wer eine 3-Ketten-Rotation fährt und alle drei gemeinsam wachst, kommt mit dem Topf oft 1.200 bis 1.800 km ohne Nachfüllen aus. Einfach nachlegen, sobald der Pegel im Topf sichtbar sinkt.' },
      { type: 'h2', text: 'Was du nicht brauchst' },
      { type: 'ul', items: [
        'Teure „Chain-Waxing-Systeme" für dreistellige Beträge. Ein Mini-Cooker leistet dasselbe.',
        'Ein Präzisions-Sous-vide-Stick. Nett, aber Overkill für eine Fahrradkette.',
        'Ein großes Fassungsvermögen. Die Kette muss nur bedeckt sein, mehr Wachs heißt nur längere Aufheizzeit.',
      ] },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'tropfwachs-hybrid-methode',
    title: 'Tropfwachs zwischen den Heißwachs-Gängen: Die Hybrid-Methode',
    titleShort: 'Die Hybrid-Methode: Heißwachs + Tropfwachs',
    description: 'Heißwachs und Tropfwachs kombinieren: Wie du mit der Hybrid-Methode seltener heiß wachsen musst, ohne die Kette abzunehmen, und worauf zu achten ist.',
    category: 'Anleitung',
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '5 min',
    keyStat: { value: '200 km', label: 'Auffrischen' },
    intro: 'Heißwachs läuft am besten, ist aber gebunden an Topf, Abnehmen und Abkühlen. Tropfwachs aus der Flasche ist bequem, hält aber kürzer. Die Hybrid-Methode verbindet beides: Du baust die Wachsbasis im heißen Bad auf und frischst sie unterwegs mit Tropfwachs auf, ohne die Kette je abzunehmen. So musst du nur noch selten heiß wachsen.',
    takeaways: [
      'Basis im Heißwachsbad aufbauen, dann etwa alle 200 km mit kompatiblem Tropfwachs auffrischen.',
      'Heiß nachwachsen nur noch rund alle 1.000 km nötig. Die Kette muss dafür nicht jedes Mal ab.',
      'Funktioniert nur Wachs auf Wachs: niemals Öl dazwischen, das zerstört die Basis.',
    ],
    faq: [
      { q: 'Was ist die Hybrid-Methode beim Kettenwachsen?', a: 'Du baust die Wachsbasis einmal im heißen Bad auf und frischst sie danach etwa alle 200 km mit kompatiblem Tropfwachs auf, ohne die Kette abzunehmen. Heiß nachgewachst wird dann nur noch etwa alle 1.000 km.' },
      { q: 'Wie oft muss ich bei der Hybrid-Methode heiß nachwachsen?', a: 'Etwa alle 1.000 km, wenn sich über die Zeit Reste und Schmutz aufbauen. Das setzt die Wachsbasis komplett zurück, dazwischen reicht das Auffrischen mit Tropfwachs.' },
      { q: 'Kann ich Tropfwachs und Kettenöl kombinieren?', a: 'Nein. Wachs verträgt sich nicht mit Öl. Wer zwischendurch zu einem Öl-Schmiermittel greift, zerstört die Wachsbasis und muss die Kette wieder komplett entfetten und neu wachsen.' },
      { q: 'Für wen lohnt sich die Hybrid-Methode?', a: 'Für Vielfahrer, die den Heißwachs-Aufwand reduzieren wollen, für Fahrer ohne 3-Ketten-Rotation, die ungern ständig die Kette abnehmen, und für Reisende und Bikepacker, für die eine kleine Flasche Tropfwachs praktischer ist als ein Wachstopf.' },
    ],
    sections: [
      { type: 'h2', text: 'Warum überhaupt kombinieren?' },
      { type: 'p', text: 'Heißwachs liefert die tiefste Penetration und die niedrigste Reibung, weil das flüssige Paraffin bis in jeden Bolzen zieht. Der Nachteil: Kette abnehmen, Bad erhitzen, abkühlen, einfahren. Tropfwachs spart diesen Aufwand, dringt aber weniger tief ein und hält kürzer. Die Hybrid-Methode nutzt die Stärken beider: die tiefe, langlebige Basis vom Heißwachs, die schnelle Auffrischung vom Tropfwachs.' },
      { type: 'h2', text: 'So funktioniert die Hybrid-Methode' },
      { type: 'ol', items: [
        'Basis legen: Kette einmal sauber entfetten und im Heißwachsbad (85–90 °C, 10–15 min) behandeln. Das ist dein Fundament.',
        'Fahren bis zum Intervall: Die Heißwachsbasis trägt 400–550 km trocken.',
        'Auffrischen statt heiß wachsen: Etwa alle 200 km, oder bevor die Kette trockener klingt, ein kompatibles Tropfwachs dünn auf die saubere Kette geben, Glied für Glied, kurz einwirken lassen, Überschuss abwischen.',
        'Trocknen lassen: Tropfwachs braucht je nach Produkt mehrere Stunden, bis das Trägermittel verdunstet ist. Am besten abends auftragen, am nächsten Tag fahren.',
        'Heiß nachwachsen alle ~1.000 km: Wenn sich über die Zeit Reste und Schmutz aufbauen, einmal komplett neu heiß wachsen. Das setzt die Basis zurück.',
      ] },
      { type: 'tip', text: 'Tropfwachs nie auf eine schmutzige Kette geben, das schließt den Dreck ein. Vorher mit einem trockenen Lappen oder, wenn nötig, kurz mit heißem Wasser reinigen und trocknen lassen.' },
      { type: 'h2', text: 'Die eine Regel, die du nicht brechen darfst' },
      { type: 'p', text: 'Wachs verträgt sich nicht mit Öl. Wer zwischendurch zu einem Öl-Schmiermittel greift, zerstört die Wachsbasis und muss wieder komplett entfetten. Bleib im System: Heißwachs als Basis, Wachs-basiertes Tropfwachs zum Auffrischen. Achte beim Tropfwachs darauf, dass es eine echte Wachs-Emulsion ist und kein „Wax-Lube", das in Wahrheit ein Öl mit Wachszusatz ist.' },
      { type: 'h2', text: 'Für wen lohnt sich die Hybrid-Methode?' },
      { type: 'ul', items: [
        'Vielfahrer, die den Heißwachs-Aufwand reduzieren wollen, ohne auf die Leistung zu verzichten.',
        'Fahrer ohne 3-Ketten-Rotation, die ungern ständig die Kette abnehmen.',
        'Reisende und Bikepacker: Eine kleine Flasche Tropfwachs passt ins Gepäck, ein Wachstopf nicht.',
      ] },
      { type: 'h2', text: 'Woran erkenne ich, dass Auffrischen nicht mehr reicht?' },
      { type: 'p', text: 'Am selben Signal wie beim reinen Heißwachsen: Sobald die Kette unter Last trockener klingt oder leicht quietscht, obwohl du gerade erst mit Tropfwachs aufgefrischt hast, ist die Wachsbasis aufgebraucht. Dann hilft nur noch ein komplettes Heißwachsbad, kein weiteres Tropfwachs.' },
      { type: 'h2', text: 'Woran erkenne ich echtes Tropfwachs?' },
      { type: 'p', text: 'Ein echtes Tropfwachs ist eine Wachs-Emulsion, bei der das Trägermittel verdunstet und reines Wachs zurückbleibt. Manche als „Wax-Lube" verkaufte Produkte sind dagegen im Kern ein Öl mit Wachszusatz. Wer damit auffrischt, mischt Öl in die Wachsbasis und zerstört genau das, was die Hybrid-Methode ausmacht. Im Zweifel die Inhaltsstoffe prüfen oder beim Hersteller nachfragen, ob es sich um eine reine Wachs-Emulsion handelt.' },
      { type: 'note', text: 'Reine Heißwachs-Puristen erreichen minimal bessere Reibungswerte, weil jede Behandlung von Grund auf frisch ist. Der Unterschied ist klein, für die allermeisten überwiegt der Komfortgewinn der Hybrid-Methode deutlich.' },
    ],
    howTo: {
      name: 'Hybrid-Methode: Heißwachs-Basis mit Tropfwachs auffrischen',
      totalTime: 'PT15M',
      steps: [
        { name: 'Basis legen', text: 'Kette einmal sauber entfetten und im Heißwachsbad (85–90 °C, 10–15 min) behandeln. Das ist dein Fundament.' },
        { name: 'Fahren bis zum Intervall', text: 'Die Heißwachsbasis trägt 400–550 km trocken.' },
        { name: 'Auffrischen statt heiß wachsen', text: 'Etwa alle 200 km, oder bevor die Kette trockener klingt, ein kompatibles Tropfwachs dünn auf die saubere Kette geben, Glied für Glied, kurz einwirken lassen, Überschuss abwischen.' },
        { name: 'Trocknen lassen', text: 'Tropfwachs braucht je nach Produkt mehrere Stunden, bis das Trägermittel verdunstet ist. Am besten abends auftragen, am nächsten Tag fahren.' },
        { name: 'Heiß nachwachsen alle ~1.000 km', text: 'Wenn sich über die Zeit Reste und Schmutz aufbauen, einmal komplett neu heiß wachsen. Das setzt die Basis zurück.' },
      ],
    },
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs als Basis ansehen →',
  },
  {
    slug: 'von-oel-auf-wachs-umsteigen',
    title: 'Von Öl auf Wachs umsteigen: Die Komplett-Anleitung für den Wechsel',
    titleShort: 'Von Öl auf Wachs umsteigen',
    description: 'Du willst von Kettenöl auf Heißwachs umsteigen? Schritt für Schritt: Antrieb reinigen, Kette entfetten, erstes Wachsbad und die Einfahrphase richtig machen.',
    category: 'Anleitung',
    scienceLink: { label: 'Die Physik hinter dem Umstieg, gemessen statt behauptet' },
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '6 min',
    keyStat: { value: '2–3×', label: 'Entfetten' },
    intro: 'Der Umstieg von Öl auf Wachs ist einmalig etwas Arbeit. Danach ist die Pflege einfacher als zuvor. Der häufigste Fehler dabei: nur die Kette anzufassen und Kassette, Schaltwerk und Kettenblätter zu vergessen. Dort sitzt noch Öl, das die frisch gewachste Kette sofort wieder kontaminiert. Diese Anleitung führt durch den vollständigen Wechsel.',
    takeaways: [
      'Beim Umstieg den ganzen Antrieb entfetten, nicht nur die Kette. Ölreste an Kassette und Kettenblättern kontaminieren sonst sofort.',
      'Eine stark geölte Altkette lässt sich oft schwer komplett entfetten; manchmal ist eine neue Kette der sauberere Start.',
      'Die ersten 20–30 km sind Einfahrphase. Erst danach läuft der Antrieb auf vollem Wachs-Niveau.',
    ],
    faq: [
      { q: 'Wie steige ich von Kettenöl auf Heißwachs um?', a: 'Antrieb komplett von Ölresten befreien, Kette in 2 bis 3 Durchgängen mit Isopropanol 99 Prozent entfetten, dann 10 bis 15 Minuten im 85 bis 90 Grad heißen Wachsbad behandeln und vor der ersten Fahrt einfahren.' },
      { q: 'Muss ich beim Umstieg auch die Kassette reinigen?', a: 'Ja, das wird oft unterschätzt. Kassette, Kettenblätter und Schaltröllchen sind voller Altöl. Läuft die neue Wachskette darüber, nimmt sie das Öl sofort wieder auf und das Wachs hält nicht mehr.' },
      { q: 'Sollte ich meine alte Kette behalten oder eine neue kaufen?', a: 'Eine lange geölte Kette hat Öl tief in den Gelenken, das selbst gründliches Entfetten nicht immer restlos löst. Ist die Kette schon älter, ist eine neue oder vorgewachste Kette oft der sauberere Start. Eine junge Kette lohnt sich zu entfetten, am besten im Ultraschallbad.' },
      { q: 'Wie lange dauert die Einfahrphase nach dem Umstieg?', a: '20 bis 30 km. In dieser Zeit bricht überschüssiges Außenwachs als weißes Pulver ab, das ist normal. Erst danach läuft der Antrieb auf seinem finalen, leisen Niveau und lässt sich fair beurteilen.' },
    ],
    sections: [
      { type: 'h2', text: 'Schritt 1: Entscheiden. Altkette entfetten oder neu starten?' },
      { type: 'p', text: 'Eine lange mit Öl gefahrene Kette hat Öl tief in den Gelenken, das selbst gründliches Entfetten nicht immer restlos löst. Wenn die Kette ohnehin schon Kilometer auf dem Buckel hat, ist eine neue (oder vorgewachste) Kette oft der saubere Neuanfang. Ist die Kette noch jung, lohnt das Entfetten, am besten im Ultraschallbad.' },
      { type: 'h2', text: 'Schritt 2: Den ganzen Antrieb reinigen' },
      { type: 'p', text: 'Das ist der Schritt, den fast alle unterschätzen. Kassette, Kettenblätter und Schaltrollen sind voller Altöl. Wenn die neue Wachskette darüberläuft, nimmt sie dieses Öl auf, und das Wachs hält nicht mehr.' },
      { type: 'ol', items: [
        'Kassette abnehmen (oder am Rad gründlich zwischen den Ritzeln reinigen) und entfetten.',
        'Kettenblätter und die Schaltröllchen am Schaltwerk mit Entfetter säubern.',
        'Alles vollständig trocknen lassen, bevor die gewachste Kette montiert wird.',
      ] },
      { type: 'h2', text: 'Schritt 3: Kette entfetten (falls du die alte behältst)' },
      { type: 'p', text: 'Kette abnehmen und in 2–3 Durchgängen mit Isopropanol 99 % im verschlossenen Glas entfetten, bis das IPA kaum noch trüb wird. Bei einer geölten Altkette darf es ruhig ein Durchgang mehr sein. Danach vollständig trocknen lassen und den Weiße-Tuch-Test machen: Kette über ein Papiertuch ziehen, kein Ölfilm sichtbar.' },
      { type: 'note', text: 'Kein 70-%-Isopropanol verwenden. Der Wasseranteil hinterlässt Rückstände und fördert Rost. Nur 99 % oder 96 %.' },
      { type: 'h2', text: 'Schritt 4: Erstes Wachsbad' },
      { type: 'p', text: 'Wachs auf 85–90 °C erhitzen, die trockene Kette einhängen und 10–15 Minuten baden, bis keine Luftbläschen mehr aufsteigen. Herausheben, abtropfen lassen, an einem Haken aufhängen und auf Raumtemperatur abkühlen lassen.' },
      { type: 'h2', text: 'Schritt 5: Einfahren und die ersten Kilometer' },
      { type: 'p', text: 'Die abgekühlte Kette ist steif, das ist normal. Sie 10–20 Mal durch die Hände laufen lassen, bis jedes Glied geschmeidig abwinkelt. Dann montieren. Die ersten 20–30 km sind die Einfahrphase: Überschüssiges Außenwachs bricht ab (das weiße Pulver ist normal), und der Antrieb findet sein finales, leises Niveau. Erst danach beurteilst du die Wachsleistung fair.' },
      { type: 'tip', text: 'Jetzt ist der ideale Moment, eine 3-Ketten-Rotation aufzubauen: Gleich zwei oder drei Ketten zusammen entfetten und wachsen. Dann wechselst du künftig in 60 Sekunden und wachst alle Ketten gesammelt. Das macht den Wachs-Alltag fast aufwandsfrei.' },
      { type: 'h2', text: 'Wie oft muss ich nach dem Umstieg auf Wachs nachwachsen?' },
      { type: 'p', text: 'Bei trockenen Bedingungen alle 400 bis 550 km, bei Nässe, Schotter oder MTB alle 200 bis 300 km. Das ist deutlich seltener als beim Ölen, wo je nach Wetter oft alle 100 bis 200 km nachgeschmiert werden muss.' },
      { type: 'h2', text: 'Woran erkenne ich, dass der Umstieg gut gelaufen ist?' },
      { type: 'p', text: 'Nach der Einfahrphase von 20 bis 30 km sollte der Antrieb leise und ohne Quietschen unter Last laufen. Hält das Quietschen darüber hinaus an, sitzen meist noch Ölreste an Kassette oder Kettenblättern, dann hilft nur eine gründlichere Reinigung des ganzen Antriebs.' },
      { type: 'h2', text: 'Was sich nach dem Umstieg ändert' },
      { type: 'ul', items: [
        'Der Antrieb bleibt sauber, keine schwarzen Hosenbeine, keine ölige Kette mehr.',
        'Die Kette läuft leiser und minimal leichter.',
        'Die Pflege verschiebt sich: kein Öl mehr unterwegs auftragen, dafür gelegentlich gesammelt wachsen.',
      ] },
    ],
    howTo: {
      name: 'Von Kettenöl auf Heißwachs umsteigen',
      totalTime: 'PT30M',
      steps: [
        { name: 'Entscheiden: Altkette entfetten oder neu starten?', text: 'Eine lange mit Öl gefahrene Kette hat Öl tief in den Gelenken, das selbst gründliches Entfetten nicht immer restlos löst. Bei einer älteren Kette ist eine neue oder vorgewachste Kette oft der saubere Neuanfang, eine junge Kette lohnt sich zu entfetten.' },
        { name: 'Den ganzen Antrieb reinigen', text: 'Kassette abnehmen (oder gründlich zwischen den Ritzeln reinigen), Kettenblätter und Schaltröllchen mit Entfetter säubern und alles vollständig trocknen lassen, bevor die gewachste Kette montiert wird — sonst kontaminiert Restöl an Kassette und Kettenblättern die frisch gewachste Kette sofort wieder.' },
        { name: 'Kette entfetten', text: 'Kette abnehmen und in 2–3 Durchgängen mit Isopropanol 99 % im verschlossenen Glas entfetten, bis das Isopropanol kaum noch trüb wird. Danach vollständig trocknen lassen und den Weiße-Tuch-Test machen.' },
        { name: 'Erstes Wachsbad', text: 'Wachs auf 85–90 °C erhitzen, die trockene Kette einhängen und 10–15 Minuten baden, bis keine Luftbläschen mehr aufsteigen. Herausheben, abtropfen lassen und auf Raumtemperatur abkühlen lassen.' },
        { name: 'Einfahren', text: 'Die abgekühlte Kette 10–20 Mal durch die Hände laufen lassen, bis jedes Glied geschmeidig abwinkelt, dann montieren. Die ersten 20–30 km sind Einfahrphase — überschüssiges Außenwachs bricht als normales weißes Pulver ab.' },
      ],
    },
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'ebike-kette-wachsen',
    title: 'E-Bike-Kette wachsen: Warum sich Heißwachs hier besonders lohnt',
    titleShort: 'E-Bike-Kette wachsen',
    description: 'E-Bike-Ketten verschleißen durch das hohe Drehmoment schneller. Warum Heißwachs den Antrieb besonders schont, was zu beachten ist und welches Wachs passt.',
    category: 'Kaufberatung',
    scienceLink: { anchor: 'linie', label: 'Warum MoS₂ Pro Edition gerade bei E-Bikes vorne liegt' },
    linksToCalculator: true,
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '5 min',
    intro: 'E-Bike-Ketten haben es schwer: Das Motordrehmoment belastet die Kettengelenke deutlich stärker als bei einem unmotorisierten Rad, der Verschleiß ist entsprechend höher. Genau deshalb lohnt sich Heißwachs hier besonders. Es senkt die Reibung im Lager und hält den abrasiven Schmutz draußen. Was du beim E-Bike beachten solltest.',
    takeaways: [
      'Das hohe Motordrehmoment lässt E-Bike-Ketten schneller verschleißen. Saubere, reibungsarme Schmierung zahlt sich hier doppelt aus.',
      'Wachs bindet keinen Schmutz, der sonst unter hoher Last als Schleifpaste wirkt.',
      'Bei hoher Dauerlast und Nässe ist die MoS₂-Variante die sicherere Wahl.',
    ],
    faq: [
      { q: 'Warum verschleißen E-Bike-Ketten schneller?', a: 'Ein Mittelmotor addiert sein Drehmoment direkt auf die Kette, bevor die Kraft ans Hinterrad geht. Das führt zu deutlich höherer Flächenpressung in den Kettengelenken, also genau dort, wo Verschleiß entsteht.' },
      { q: 'Lohnt sich Heißwachs beim E-Bike?', a: 'Ja, gerade hier. Wachs bindet keinen Schmutz, der unter der hohen E-Bike-Last besonders stark als Schleifpaste wirkt, und die geringere Lagerreibung bedeutet weniger Wärme und Verschleiß über die Lebensdauer der teuren Antriebskomponenten.' },
      { q: 'Sollte ich beim E-Bike Classic oder Pro Wachs nehmen?', a: 'Bei hoher Dauerlast und Nässe ist die MoS₂-Variante Pro die sicherere Wahl, weil der Transferfilm auch dann noch schmiert, wenn der Paraffinfilm unter Druck dünner wird. Für überwiegend trockene, moderate Fahrten reicht Classic.' },
      { q: 'Muss ich beim E-Bike öfter nachwachsen als bei einem normalen Rad?', a: 'Durch die höhere Last und oft mehr Jahreskilometer eher ja, die Intervalle liegen sinnvollerweise am unteren Ende der üblichen Spanne von 400 bis 550 km trocken beziehungsweise 200 bis 300 km bei Nässe.' },
    ],
    sections: [
      { type: 'h2', text: 'Warum E-Bike-Ketten schneller verschleißen' },
      { type: 'p', text: 'Ein Mittelmotor addiert sein Drehmoment direkt auf die Kette, bevor die Kraft ans Hinterrad geht. Die Folge: deutlich höhere Flächenpressung in den Kettengelenken, also genau dort, wo Verschleiß entsteht. Eine E-Bike-Kette, die mit demselben Öl wie ein normales Rad gefahren wird, ist oft schon nach der Hälfte der Kilometer am Verschleißlimit.' },
      { type: 'h2', text: 'Was Wachs hier konkret bringt' },
      { type: 'p', text: 'Verschleiß entsteht fast nie durch das Metall allein, sondern durch abrasive Partikel im Schmiermittel. Öl zieht Staub und Sand an und presst sie unter der hohen E-Bike-Last in die Gelenke. Die Kette wird zur Schleifpaste. Wachs bindet keinen Schmutz: Die Kette bleibt trocken, Partikel haften nicht und werden weggeworfen. Unter hoher Last ist dieser Unterschied größer als beim normalen Rad, weil eingebundene Partikel hier mehr Schaden anrichten.' },
      { type: 'p', text: 'Dazu kommt die geringere Reibung im Lager. Beim E-Bike spürst du die zwar nicht als „Watt-Ersparnis" wie der Rennfahrer, aber weniger Reibung heißt weniger Wärme und weniger Verschleiß über die Lebensdauer.' },
      { type: 'h2', text: 'Worauf du beim E-Bike achten solltest' },
      { type: 'ul', items: [
        'Häufiger nachwachsen: Durch die höhere Last und oft mehr Jahreskilometer sind die Intervalle eher am unteren Ende anzusetzen.',
        'Verschleiß im Blick behalten: E-Bike-Ketten dehnen sich schneller. Regelmäßig mit der Kettenlehre prüfen.',
        'Richtige Kette wählen: Viele E-Bikes nutzen verstärkte Ketten. Achte auf die passende Geschwindigkeit und Eignung deiner Schaltgruppe.',
        'MoS₂ bei hoher Dauerlast: Der Festschmierstoff bleibt wirksam, wenn unter Druck der Paraffinfilm dünner wird.',
      ] },
      { type: 'note', text: 'Hinweis: Bei E-Bikes mit Riemenantrieb (Gates Carbon Drive) entfällt das Thema. Riemen werden nicht gewachst und brauchen keine Schmierung. Dieser Artikel betrifft Kettenantriebe.' },
      { type: 'h2', text: 'Wie oft muss ich die E-Bike-Kette nachwachsen?' },
      { type: 'p', text: 'Genau wie bei einem unmotorisierten Rad gilt: trocken alle 400 bis 550 km, bei Nässe oder Schotter alle 200 bis 300 km. Wegen der höheren Last durch den Motor und meist mehr Jahreskilometern lohnt es sich, eher am unteren Ende dieser Spannen zu bleiben, statt das Intervall auszureizen.' },
      {
        type: 'image',
        src: '/images/blog/chain-drivetrain-closeup-1600.webp',
        alt: 'Nahaufnahme eines Fahrrad-Antriebs mit Kassette und Schaltwerk',
        caption: 'Bei hoher Motorlast verschleißt nicht nur die Kette — auch Kassette und Kettenblatt leiden mit, wenn zu spät gewechselt wird.',
      },
      { type: 'h2', text: 'Wann muss die E-Bike-Kette gewechselt werden?' },
      { type: 'p', text: 'Wie bei jeder Kette gilt die 0,5-Prozent-Grenze bei modernen 11- und 12-fach-Antrieben, [[gemessen mit einer Kettenlehre|/blog/kettenverschleiss-messen]]. Wegen der hohen Last lohnt es sich beim E-Bike, öfter zu messen als beim normalen Rad, damit die teure Kassette nicht mitverschleißt.' },
      { type: 'h2', text: 'Lohnt sich der Aufwand beim E-Bike?' },
      { type: 'p', text: 'Gerade beim E-Bike, ja. Die Antriebskomponenten sind teuer, und eine verschlissene Kette zieht bei zu langem Fahren Kassette und Kettenblatt mit in den Verschleiß. Wachs verlängert die Kettenlaufzeit deutlich und schont damit die ganze, oft hochpreisige Antriebseinheit. Wer viel und unter Last fährt, holt den Aufwand schnell wieder rein.' },
    ],
    ctaSlug: 'wax-500-mos2',
    ctaText: 'Pro Heißwachs mit MoS₂ ansehen →',
  },
  {
    slug: 'kettenverschleiss-messen',
    title: 'Kettenverschleiß messen: Wann muss die Kette gewechselt werden?',
    titleShort: 'Kettenverschleiß messen: wann wechseln?',
    description: 'Kettenverschleiß richtig messen: Was die 0,5-%-Grenze bedeutet, wie eine Kettenlehre funktioniert und warum eine gewachste Kette deutlich länger hält.',
    category: 'Technik',
    linksToCalculator: true,
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '6 min',
    keyStat: { value: '0,5 %', label: 'Wechselgrenze' },
    intro: 'Eine verschlissene Kette frisst die Kassette und die Kettenblätter mit. Wer rechtzeitig wechselt, tauscht ein 35-€-Teil, wer zu lange wartet, zahlt das Vielfache für den ganzen Antrieb. Die gute Nachricht: Kettenverschleiß lässt sich in 30 Sekunden messen. Hier, wie es geht und welche Grenzwerte gelten.',
    takeaways: [
      'Wechselgrenze: 0,5 % Kettendehnung bei 11- und 12-fach, 0,75 % bei 9- und 10-fach.',
      'Eine Kettenlehre für wenige Euro misst das zuverlässiger als ein Lineal.',
      'Gewachste Ketten erreichen die Grenze deutlich später, oft beim 2–3-Fachen der Kilometer einer geölten Kette.',
    ],
    faq: [
      { q: 'Wie messe ich Kettenverschleiß?', a: 'Am einfachsten mit einer Kettenverschleißlehre für wenige Euro: Fällt der Messzahn bündig in die Lücke, ist die markierte Verschleißgrenze erreicht. Alternativ mit einem Stahllineal über 12 Glieder unter leichter Kettenspannung.' },
      { q: 'Ab welcher Dehnung muss ich die Kette wechseln?', a: '0,5 Prozent bei 11- und 12-fach-Ketten, 0,75 Prozent bei 9- und 10-fach. Je schmaler die Kette, desto früher muss sie raus, sonst nimmt sie beim Warten die Kassette mit in den Verschleiß.' },
      { q: 'Wie funktioniert eine Kettenlehre genau?', a: 'Du legst die Lehre auf die gespannte Kette. Fällt der Messzahn nicht in die Lücke, liegt die Kette unter der Grenze. Fällt er bündig hinein, ist die markierte Grenze, meist 0,5 oder 0,75 Prozent, erreicht. Markenlehren messen dabei genauer als sehr günstige.' },
      { q: 'Warum halten gewachste Ketten länger, bevor sie die Verschleißgrenze erreichen?', a: 'Weil Wachs keinen Schmutz bindet, der sonst in die Gelenke wandert und dort wie Schleifpapier wirkt. Realistisch sind 6.000 bis 12.000 km bis zur 0,5-Prozent-Grenze, gegenüber 2.000 bis 3.000 km bei Öl.' },
    ],
    sections: [
      { type: 'h2', text: 'Was „Kettenverschleiß" eigentlich ist' },
      { type: 'p', text: 'Ketten „längen" sich nicht durch gedehntes Metall, sondern durch Materialabtrag an Bolzen und Hülsen. Mit jedem Kilometer wird in den Gelenken minimal Material abgerieben, der Abstand zwischen den Gliedern wächst. Diese Längung lässt die Kette nicht mehr sauber in Kassette und Kettenblatt greifen, und beginnt, deren Zähne abzunutzen.' },
      { type: 'h2', text: 'Die Grenzwerte: 0,5 % und 0,75 %' },
      { type: 'p', text: 'Die Grenze hängt an der Anzahl der Ritzel, und zwar andersherum, als viele vermuten: Je schmaler die Kette, desto früher muss sie raus. Für 9- und 10-fach-Ketten gilt 0,75 %. Für 11- und 12-fach-Ketten, also alles Moderne, liegt die Grenze bei 0,5 %. Park Tool und die Hersteller sind sich hier einig. Wer bei einer 12-fach-Kette bis 0,75 % wartet, hat die Kassette meist schon mitgenommen, und die kostet ein Vielfaches der Kette.' },
      { type: 'h2', text: 'So misst du den Verschleiß' },
      { type: 'h3', text: 'Mit einer Kettenlehre (empfohlen)' },
      { type: 'p', text: 'Eine Kettenverschleißlehre kostet wenige Euro und ist die einfachste Methode. Du legst sie auf die Kette: Fällt der Messzahn nicht in die Lücke, ist die Kette unter der Grenze. Fällt er bündig hinein, ist die markierte Verschleißgrenze (z. B. 0,5 oder 0,75 %) erreicht. Wichtig: einige günstige Lehren messen tendenziell zu früh „verschlissen". Markenlehren sind hier genauer.' },
      { type: 'h3', text: 'Mit dem Lineal' },
      { type: 'p', text: 'Ohne Lehre geht es auch: Eine neue Kette misst über 12 Glieder exakt 12 Zoll (304,8 mm), von Bolzenmitte zu Bolzenmitte. Bei 0,5 % Längung sind es rund 306,3 mm, bei 0,75 % etwa 307,1 mm. Mit einem Stahllineal und gespannter Kette lässt sich das gut ablesen.' },
      { type: 'tip', text: 'Immer unter leichter Spannung messen, also auf dem größten Kettenblatt, am besten mit etwas Zug am Schaltwerk. Eine schlaffe Kette verfälscht das Ergebnis.' },
      { type: 'h2', text: 'Warum gewachste Ketten länger halten' },
      { type: 'p', text: 'Da Verschleiß vor allem durch abrasive Partikel im Schmiermittel entsteht, hält eine gewachste Kette deutlich länger: Wachs bindet keinen Schmutz, der in die Gelenke wandert. Zero Friction Cycling misst im Laborprotokoll 15.000 bis 20.000 km bis zur 0,5-%-Grenze, bei gestreckten Nachwachs-Intervallen 8.000 bis 10.000 km. Realistisch sind 6.000 bis 12.000 km gegenüber 2.000 bis 3.000 km bei Öl. Das ist der Hauptgrund, warum sich Wachs über die Antriebskosten rechnet.' },
      { type: 'h2', text: 'Ab wie vielen Kilometern sollte ich anfangen zu messen?' },
      { type: 'p', text: 'Bei gewachsten Ketten reicht es, ab etwa 4.000 bis 5.000 km regelmäßig zu prüfen, weil der Verschleiß so viel langsamer voranschreitet. Bei geölten Ketten sollte die Kontrolle schon ab etwa 2.000 km beginnen.' },
      { type: 'h2', text: 'Muss ich bei starkem Verschleiß auch die Kassette prüfen?' },
      { type: 'p', text: 'Ja, ab etwa 1,0 Prozent Dehnung sollte die Kassette mitgeprüft werden. Eine Kette, die die Wechselgrenze deutlich überschritten hat, hat die Kassettenzähne meist schon angegriffen. Eine neue Kette springt dann trotzdem, weil sie nicht mehr sauber in die verschlissenen Zähne greift.' },
      { type: 'note', text: 'Tipp zur Rotation: Wer mehrere Ketten im Wechsel fährt, verteilt den Verschleiß. Wichtig ist, alle Ketten der Rotation regelmäßig zu messen und gemeinsam zu tauschen, bevor eine die Grenze überschreitet. So bleibt die Kassette über die volle Lebensdauer geschont.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs für lange Kettenlaufzeit ansehen →',
  },
  {
    slug: 'erste-fahrt-nach-wachsen',
    title: 'Die erste Fahrt nach dem Wachsen: Was normal ist und was nicht',
    titleShort: 'Die erste Fahrt nach dem Wachsen',
    description: 'Weißes Pulver, eine steife Kette, leise Knackgeräusche nach dem Wachsen? Was bei den ersten Kilometern völlig normal ist, und welche Zeichen wirklich auf einen Fehler hindeuten.',
    category: 'Problemlösung',
    publishDate: '2026-06-16',
    dateModified: '2026-07-27',
    readingTime: '4 min',
    keyStat: { value: '20–30 km', label: 'Einfahrzeit' },
    intro: 'Du hast die Kette frisch gewachst, montiert, und etwas wirkt komisch. Sie ist steif, es rieselt weißes Pulver, vielleicht knackt es leise. Bevor du an einen Fehler glaubst: Das meiste davon ist völlig normal und gehört zur Einfahrphase. Hier die Einordnung, was bei den ersten Kilometern dazugehört und was nicht.',
    takeaways: [
      'Weißes Pulver und eine anfangs steife Kette sind normal und verschwinden nach 20–30 km.',
      'Erst nach der Einfahrphase läuft der Antrieb auf seinem finalen, leisen Niveau.',
      'Anhaltendes Quietschen unter Last deutet dagegen auf einen echten Fehler beim Entfetten oder Wachsen hin.',
    ],
    faq: [
      { q: 'Ist es normal, dass die Kette nach dem Wachsen steif ist?', a: 'Ja. Frisch gewachst sind die Gelenke vom erstarrten Paraffin leicht verklebt. Die Steifigkeit löst sich nach den ersten Kilometern von selbst, schneller geht es, wenn du die Kette vorher 10 bis 20 Mal durch die Hände laufen lässt.' },
      { q: 'Warum rieselt weißes Pulver von der frisch gewachsten Kette?', a: 'Das ist überschüssiges Außenwachs, das beim Fahren aufbricht und abfällt. Es bedeutet keinen Verlust an Schmierung, das wirksame Wachs sitzt geschützt in den Gelenken. Nach 20 bis 30 km ist der Überschuss weg.' },
      { q: 'Wie lange dauert die Einfahrphase nach dem Wachsen?', a: 'Etwa 20 bis 30 km. In dieser Zeit setzt sich das Wachs, und bei der MoS₂-Variante bildet sich der Transferfilm auf den Kontaktflächen. Erst danach läuft der Antrieb auf seinem finalen Niveau.' },
      { q: 'Wann sollte ich mir nach dem Wachsen Sorgen machen?', a: 'Wenn die Kette nach der Einfahrphase weiter quietscht, besonders unter Last, oder wenn dicke Wachsklumpen das Schalten stören. Beides deutet auf zu kurzes Eintauchen, ein zu kühles Bad oder unzureichendes Entfetten hin und braucht ein erneutes, gründliches Wachsen.' },
    ],
    sections: [
      { type: 'h2', text: 'Normal: Die Kette ist anfangs steif' },
      { type: 'p', text: 'Frisch gewachst sind die Gelenke vom erstarrten Paraffin leicht verklebt. Wenn du das Einfahren übersprungen hast, merkst du das als hakelige Schaltung auf den ersten Metern. Lösung: vor der Montage die Kette 10–20 Mal durch die Hände laufen lassen. Aber auch ohne löst sich die Steifigkeit nach den ersten Kilometern von selbst.' },
      { type: 'h2', text: 'Normal: Weißes Pulver rieselt ab' },
      { type: 'p', text: 'Das überschüssige Wachs an der Außenseite der Kette bricht beim Fahren auf und fällt als feines weißes Pulver ab. Das ist kein Verlust an Schmierung. Das wirksame Wachs sitzt geschützt in den Gelenken. Nach 20–30 km ist der Überschuss weg und das Rieseln hört auf.' },
      { type: 'h2', text: 'Normal: Leichte Geräusche in der Einfahrphase' },
      { type: 'p', text: 'In den ersten Kilometern kann der Antrieb minimal anders klingen, während sich das Wachs setzt und, bei der MoS₂-Variante, der Transferfilm auf den Kontaktflächen bildet. Dieser Film entsteht nach etwa 20–30 km, danach läuft die Kette oft sogar noch etwas geschmeidiger als direkt nach der Montage.' },
      { type: 'tip', text: 'Plane die erste kurze Runde bewusst als Einfahrfahrt ein, nicht als Wertungsfahrt. Beurteile die Wachsleistung erst nach 30 km. Vorher vergleichst du gegen einen Zustand, der sich noch einpendelt.' },
      { type: 'h2', text: 'Nicht normal: Anhaltendes Quietschen unter Last' },
      { type: 'p', text: 'Wenn die Kette nach der Einfahrphase weiter quietscht, besonders beim kräftigen Treten, stimmt etwas nicht. Die häufigste Ursache: Das Wachs ist nie tief eingedrungen. Entweder war das Bad zu kühl oder die Kette zu kurz drin. Zweithäufigste Ursache: unzureichend entfettet, das Wachs sitzt nur außen auf. In beiden Fällen hilft nur erneutes (gründliches) Entfetten und Wachsen.' },
      { type: 'h2', text: 'Nicht normal: Wachsklumpen, die das Schalten stören' },
      { type: 'p', text: 'Dicke Wachsbrocken zwischen den Gliedern, die die Schaltung blockieren, deuten auf zu dick aufgetragenes Wachs oder fehlendes Einfahren hin. Kette abnehmen, kurz durch die Hände arbeiten, gröbere Klumpen vorsichtig entfernen. Wenn das Bad zu kühl war, beim nächsten Mal heißer (85–90 °C) arbeiten, dann läuft das Wachs dünner ab.' },
      { type: 'h2', text: 'Wie fahre ich die frisch gewachste Kette am besten ein?' },
      { type: 'p', text: 'Am effektivsten von Hand, noch vor der Montage: Kette 10 bis 20 Mal durch die Hände laufen lassen oder über einen Stab knicken, bis jedes Glied sauber abwinkelt. Danach die erste Ausfahrt bewusst als kurze Einfahrrunde planen, nicht als Wertungsfahrt, und erst nach etwa 30 km ein Urteil über die Wachsleistung fällen.' },
      { type: 'h2', text: 'Sollte ich die Kette nach der ersten Fahrt reinigen?' },
      { type: 'p', text: 'Ein trockenes Abwischen reicht. Das lose, weiße Pulver, das sich in der Einfahrphase löst, lässt sich einfach mit einem Tuch entfernen. Eine feuchte Reinigung oder gar erneutes Entfetten ist nicht nötig, das würde der frischen Wachsschicht in den Gelenken eher schaden als nutzen.' },
      { type: 'note', text: 'Kurz gesagt: Steifigkeit, weißes Pulver und ein kurzes Einpendeln gehören dazu. Anhaltendes Quietschen oder störende Klumpen sind Hinweise auf einen Schritt, der nachgebessert werden muss, meist das Entfetten oder die Badtemperatur.' },
    ],
    ctaSlug: 'wax-300',
    ctaText: 'Classic Heißwachs 300 g ansehen →',
  },
  {
    slug: 'schnellverschluss-quicklink',
    title: 'Schnellverschluss am Fahrrad: Welcher Quick-Link, wie oft wiederverwenden?',
    titleShort: 'Schnellverschluss: welcher & wie oft?',
    description: 'Welcher Schnellverschluss passt zu deiner Kette, wie oft darf man einen Quick-Link wiederverwenden und wie öffnet man ihn ohne Werkzeug? Die Praxis-Antworten.',
    category: 'Anleitung',
    publishDate: '2026-06-17',
    dateModified: '2026-07-27',
    readingTime: '5 min',
    keyStat: { value: '60 Sek.', label: 'Kettenwechsel' },
    intro: 'Wer seine Kette wachst, nimmt sie regelmäßig ab, und genau dafür ist der Schnellverschluss (Quick-Link) das wichtigste kleine Teil im ganzen System. Mit ihm dauert der Kettenwechsel 60 Sekunden statt einer Vernietaktion. Aber welcher passt zu deiner Kette, wie oft darf man ihn wiederverwenden, und wie geht er ohne Spezialwerkzeug auf? Hier die kompakten Antworten.',
    takeaways: [
      'Der Quick-Link muss zur Geschwindigkeit der Kette passen (11-fach-Link nur an 11-fach-Kette).',
      'Wiederverwendbarkeit ist herstellerabhängig: KMC nennt mehrfach, SRAM offiziell einmalig. In der Wachs-Praxis hält ein guter Link aber viele Zyklen.',
      'Für eine Kettenrotation ist ein wiederverwendbarer Link praktisch unverzichtbar.',
    ],
    faq: [
      { q: 'Welcher Schnellverschluss passt zu meiner Kette?', a: 'Der Quick-Link muss zur Geschwindigkeit der Kette passen, ein 12-fach-Link ist schmaler als ein 11-fach-Link und nicht austauschbar. Die passende Breite steht auf der Verpackung, im Zweifel beim Kettenhersteller bleiben.' },
      { q: 'Wie oft darf man einen Quick-Link wiederverwenden?', a: 'Herstellerabhängig: SRAM gibt seine Power Locks offiziell als einmalig an, KMC erlaubt mehrfaches Öffnen explizit. In der Wachs-Praxis hält ein hochwertiger, wiederverwendbarer Link viele Zyklen, solange er noch satt und ohne Spiel einrastet.' },
      { q: 'Wie öffne ich einen Quick-Link ohne Spezialwerkzeug?', a: 'Den Link auf die obere, spannungsfreie Kettenstrecke bringen, beide Glieder mit den Daumen zueinander drücken und gleichzeitig auseinanderschieben. Eine Quick-Link-Zange erleichtert das, ist aber kein Muss.' },
      { q: 'Brauche ich einen Schnellverschluss zum Kettenwachsen?', a: 'Praktisch unverzichtbar, vor allem bei einer 2- oder 3-Ketten-Rotation. Mit Quick-Link öffnest du die Kette in Sekunden, ohne müsstest du jedes Mal nieten, was die Rotation deutlich aufwendiger macht.' },
    ],
    sections: [
      { type: 'h2', text: 'Was ist ein Schnellverschluss überhaupt?' },
      { type: 'p', text: 'Ein Schnellverschluss, je nach Hersteller Quick-Link, Missing Link oder Power Link genannt, ersetzt einen Kettenniet durch ein zweiteiliges Glied, das sich von Hand öffnen und schließen lässt. Statt die Kette mit dem Nietdrücker zu öffnen, klickst du den Link auf. Für gewachste Ketten, die regelmäßig ins Bad müssen, ist das der entscheidende Komfortgewinn.' },
      { type: 'h2', text: 'Warum er fürs Wachsen fast Pflicht ist' },
      { type: 'p', text: 'Heißwachs entfaltet seinen vollen Komfort erst, wenn das Abnehmen der Kette schnell geht, besonders bei einer 2- oder 3-Ketten-Rotation, bei der du häufig wechselst. Mit einem Quick-Link öffnest du die Kette in Sekunden, hängst sie ins Bad und montierst die nächste. Ohne Schnellverschluss müsstest du jedes Mal nieten, was die ganze Logik der Rotation zunichtemacht.' },
      { type: 'h2', text: 'Welcher Link passt zu meiner Kette?' },
      { type: 'p', text: 'Die wichtigste Regel: Der Link muss zur Geschwindigkeit (Anzahl Ritzel) deiner Kette passen. Ein 12-fach-Link ist schmaler als ein 11-fach-Link, sie sind nicht austauschbar.' },
      { type: 'ul', items: [
        'Passend zur Kettenbreite: 8-, 9-, 10-, 11- oder 12-fach. Steht auf der Verpackung.',
        'Markenkompatibilität: KMC Missing Link passt zu vielen Shimano- und SRAM-Ketten gleicher Geschwindigkeit; im Zweifel beim Kettenhersteller bleiben.',
        'Shimano 12-fach ist heikler: Shimano gibt für seine 12-fach-Ketten teils einen Niet statt Quick-Link vor, hier auf ausdrücklich kompatible Links achten.',
      ] },
      { type: 'h2', text: 'Wie oft darf man einen Quick-Link wiederverwenden?' },
      { type: 'p', text: 'Hier gehen Herstellerangabe und Praxis auseinander. SRAM gibt seine Power Locks offiziell als einmalig an, KMC erlaubt das mehrfache Öffnen explizit. In der Wachs-Praxis hält ein hochwertiger, wiederverwendbarer Link viele Zyklen. Das eigentliche Verschleißteil ist nicht der Link, sondern ob er noch satt und ohne Spiel einrastet.' },
      { type: 'note', text: 'Sicherheit geht vor: Wenn ein Link sich zu leicht öffnen lässt, sichtbares Spiel hat oder beim Schließen nicht hörbar/spürbar einrastet, gehört er ersetzt. Ein paar Euro für einen neuen Link sind günstiger als eine reißende Kette unter Last. Ein gewachster Link bleibt übrigens sauber. Das erleichtert die Sichtprüfung.' },
      { type: 'h2', text: 'Muss ich den Quick-Link beim Wachsen mit ins Wachsbad hängen?' },
      { type: 'p', text: 'Nein, besser nicht. Beim Wachsen lässt du den Quick-Link ausgespart und tauchst nur die geschlossene Kette ohne den Verschluss ein. Er würde sonst unnötig mit Wachs überzogen und ist danach schwerer zu öffnen und zu schließen. Nach dem Abkühlen lassen sich die Kettenglieder ohnehin über eine Flasche oder Sattelstütze freibrechen, an dieser Stelle bleibt der Link am besten wachsfrei.' },
      { type: 'h2', text: 'Welcher Quick-Link gilt in der Wachs-Praxis als robustester?' },
      { type: 'p', text: 'Connex-Links gelten unter Wachsern als Standard, weil sie als unbegrenzt wiederverwendbar angesehen werden. Shimano- und SRAM-Links halten in der Praxis oft 3 bis 5 Wiederverwendungen, auch wenn SRAM seine Power Locks offiziell nur für eine einzige Nutzung freigibt.' },
      { type: 'h2', text: 'Öffnen und schließen ohne Spezialwerkzeug' },
      { type: 'ol', items: [
        'Öffnen: Den Link an die obere, gerade Kettenstrecke bringen (zwischen Kettenblatt und Schaltwerk, ohne Spannung). Die beiden Glieder mit den Daumen zueinander drücken und gleichzeitig auseinanderschieben, er klickt auf. Eine Quick-Link-Zange macht es noch leichter, ist aber kein Muss.',
        'Schließen: Beide Hälften in die Kettenenden einfädeln, zusammenstecken, dann unter Zug bringen. Am einfachsten, indem du das Pedal mit der Bremse blockierst und kräftig trittst, bis der Link hörbar einrastet.',
        'Kontrolle: Der geschlossene Link muss sich sauber durchbiegen lassen und darf kein seitliches Spiel haben.',
      ] },
      { type: 'tip', text: 'Halte immer einen passenden Ersatz-Link in der Satteltasche. Er wiegt nichts, kostet wenig und rettet jede Tour, falls die Kette unterwegs reißt, ganz unabhängig vom Wachsen.' },
    ],
    howTo: {
      name: 'Quick-Link ohne Spezialwerkzeug öffnen und schließen',
      totalTime: 'PT1M',
      steps: [
        { name: 'Öffnen', text: 'Den Link an die obere, gerade Kettenstrecke bringen (zwischen Kettenblatt und Schaltwerk, ohne Spannung). Die beiden Glieder mit den Daumen zueinander drücken und gleichzeitig auseinanderschieben, er klickt auf. Eine Quick-Link-Zange macht es noch leichter, ist aber kein Muss.' },
        { name: 'Schließen', text: 'Beide Hälften in die Kettenenden einfädeln, zusammenstecken, dann unter Zug bringen. Am einfachsten, indem du das Pedal mit der Bremse blockierst und kräftig trittst, bis der Link hörbar einrastet.' },
        { name: 'Kontrolle', text: 'Der geschlossene Link muss sich sauber durchbiegen lassen und darf kein seitliches Spiel haben.' },
      ],
    },
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'wachs-entsorgen-topf-pflegen',
    title: 'Wachs entsorgen und den Wachstopf pflegen: sauber und nachhaltig',
    titleShort: 'Wachs entsorgen & Topf pflegen',
    description: 'Wie lange hält ein Wachsbad, wie filtert man es sauber, wann muss das Wachs raus und wie entsorgt man Altwachs richtig? Plus: Wie nachhaltig ist Paraffinwachs?',
    category: 'Technik',
    publishDate: '2026-06-17',
    dateModified: '2026-07-27',
    readingTime: '5 min',
    intro: 'Ein Wachsbad ist erstaunlich langlebig, mit etwas Pflege hält dasselbe Wachs Monate bis Jahre. Trotzdem stellen sich irgendwann die praktischen Fragen: Wann ist das Wachs aufgebraucht, wie wird es wieder sauber, wohin mit den Resten, und wie umweltfreundlich ist das Ganze eigentlich? Hier die ehrlichen Antworten.',
    takeaways: [
      'Ein Wachsbad muss man selten ganz austauschen, meist reicht regelmäßiges Filtern.',
      'Altwachs gehört erstarrt in den Restmüll, niemals flüssig in den Abfluss.',
      'Paraffin ist gut filterbar und bindet keinen Schmutz. Ökologisch oft günstiger als der Reinigungs- und Abwasseraufwand bei Öl.',
    ],
    faq: [
      { q: 'Wie entsorge ich altes Kettenwachs richtig?', a: 'Erstarren lassen und in den Restmüll geben, niemals flüssig in den Abfluss, das Wachs erstarrt im Rohr und verstopft die Leitung. Filterreste wie ein Kaffeefilter mit Schmutz und Wachs gehören ebenfalls in den Restmüll.' },
      { q: 'Wie lange hält ein Wachsbad, bevor es ausgetauscht werden muss?', a: 'Sehr lange, oft eine ganze Saison und länger. Anders als Öl bleibt Paraffin im Topf grundsätzlich erhalten, solange du regelmäßig filterst und bei sinkendem Pegel neues Wachs nachfüllst.' },
      { q: 'Wie filtere ich schmutziges Wachs?', a: 'Wachs vollständig schmelzen, durch einen Kaffeefilter oder ein feines Metallsieb in ein zweites hitzebeständiges Gefäß gießen. Der Schmutz bleibt im Filter zurück, das gefilterte Wachs kommt zurück in den gereinigten Topf.' },
      { q: 'Ist Paraffinwachs umweltfreundlich?', a: 'Paraffin ist ein Nebenprodukt der Erdölverarbeitung, also nicht bio, aber chemisch inert und gut handhabbar. Der ökologische Vorteil liegt im System: keine aggressiven Kettenreiniger, kein Entfetter, kaum Schmiermittel, das in die Umwelt gelangt, weil es an der Kette bleibt statt abzutropfen.' },
    ],
    sections: [
      { type: 'h2', text: 'Wie lange hält ein Wachsbad?' },
      { type: 'p', text: 'Sehr lange. Anders als Öl, das man laufend nachkippt und das verschmutzt, bleibt Paraffin im Topf grundsätzlich erhalten. Es wird nur durch jede Kette minimal mitgenommen. Was sich mit der Zeit ansammelt, ist Schmutz: feiner Metallabrieb und Straßenstaub, die sich am Topfboden absetzen. Solange du nachfüllst, wenn der Pegel sinkt, kann dasselbe Bad eine ganze Saison und länger laufen.' },
      { type: 'h2', text: 'Das Wachs filtern statt wegwerfen' },
      { type: 'p', text: 'Der entscheidende Pflegeschritt ist Filtern, nicht Austauschen. So geht es:' },
      { type: 'ol', items: [
        'Wachs vollständig schmelzen (85–90 °C), damit es dünnflüssig ist.',
        'Durch einen Kaffeefilter oder ein feines Metallsieb in ein zweites hitzebeständiges Gefäß gießen. Der Schmutz bleibt im Filter zurück.',
        'Gefiltertes Wachs zurück in den gereinigten Topf. Fertig.',
      ] },
      { type: 'p', text: 'Ein sauberes Bad ist klar und leicht gelblich; ein verschmutztes wird dunkler und trüber. Filtern alle paar Wachsrunden hält die Qualität stabil.' },
      { type: 'tip', text: 'Pro- und Classic-Wachs nicht im selben Topf mischen: Die schwarzen MoS₂-Partikel der Pro-Variante setzen sich im Topf fest und verfärben späteres Classic-Wachs. Wer beide nutzt, hält am besten zwei getrennte Töpfe.' },
      { type: 'h2', text: 'Wann muss das Wachs wirklich raus?' },
      { type: 'p', text: 'Komplett ersetzen musst du Wachs selten, meist nur, wenn es trotz Filtern sichtbar gesättigt mit feinstem Abrieb ist, der sich nicht mehr herausfiltern lässt, oder wenn es durch wiederholtes Überhitzen oxidiert ist (zäh, dunkel, riecht ranzig). Dann lieber einen frischen Block einschmelzen, statt mit verbrauchtem Wachs schlechtere Ergebnisse zu erzielen.' },
      { type: 'h2', text: 'Altwachs richtig entsorgen' },
      { type: 'ul', items: [
        'Niemals flüssig in den Abfluss: Wachs erstarrt im Rohr und verstopft die Leitung zuverlässig.',
        'Erstarren lassen und in den Restmüll: Abgekühltes, festes Paraffin gehört in den normalen Hausmüll (Restmüll), nicht in Bio- oder Wertstofftonne.',
        'Filterreste (Kaffeefilter mit Schmutz und Wachs) ebenfalls in den Restmüll.',
        'Größere Mengen alter Schmierstoffe gehören, falls mit Öl vermischt, streng genommen zum Wertstoffhof. Reines, erstarrtes Paraffin ist unkritisch.',
      ] },
      { type: 'h2', text: 'Wie nachhaltig ist Paraffinwachs?' },
      { type: 'p', text: 'Ehrlich eingeordnet: Paraffin ist ein Nebenprodukt der Erdölverarbeitung, nicht "bio", aber chemisch inert und gut handhabbar. Der ökologische Vorteil liegt im System: Wachs bindet keinen Schmutz, du brauchst keine aggressiven Kettenreiniger, keine literweise Entfetter und keinen ölverschmierten Lappenberg. Es gelangt kaum Schmiermittel in die Umwelt, weil das Wachs an der Kette bleibt und nicht abtropft wie Öl. Über die Lebensdauer ist der Reinigungs- und Abfallaufwand deutlich geringer als bei Ölschmierung.' },
      { type: 'note', text: 'Der größte Umwelt-Hebel ist ohnehin die längere Kettenlaufzeit: Eine gewachste Kette hält das Zwei- bis Dreifache und schont Kassette und Kettenblätter. Das bedeutet weniger Verschleißteile, die produziert und entsorgt werden müssen. Das ist nachhaltiger als jede Schmierstoff-Diskussion.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/**
 * Redaktionelles Hero-Bild je Artikel (Dateien liegen in /public/images).
 * `card` ist die 800px-Vorschauvariante für die Blog-Übersicht, fällt auf
 * `src` zurück, falls nicht gesetzt. Erzeugt via
 * `npx tsx scripts/optimize-blog-images.mjs`.
 */
export const articleImages: Record<string, { src: string; card?: string; alt: string }> = {
  'heisswachs-vs-fluessigwachs': { src: '/images/wax-block-spin.jpg', alt: 'Waxcelerate Wachsblock auf dunklem Schiefer' },
  'fahrradkette-entfetten': {
    src: '/images/blog/oil-tattoo-leg-1600.webp',
    card: '/images/blog/oil-tattoo-leg-800.webp',
    alt: 'Schwarze Ölspuren an Wade und weißer Socke nach einer Fahrt mit geölter Kette',
  },
  'kettenlaufzeit-heisswachs': {
    src: '/images/blog/chains-hanging-gold-1600.webp',
    card: '/images/blog/chains-hanging-gold-800.webp',
    alt: 'Gewachste goldene Shimano-Ketten hängen vor den Hügeln bei Stuttgart im Abendlicht',
  },
  'heisswachs-anleitung': {
    src: '/images/blog/wax-blue-wire-chain-1600.webp',
    card: '/images/blog/wax-blue-wire-chain-800.webp',
    alt: 'Blauer Wachsblock, ausgelegte Fahrradkette und aufgerollte Drahthaken zum Eintauchen',
  },
  'mos2-kettenwachs': {
    src: '/images/blog/wax-pro-box-open-1600.webp',
    card: '/images/blog/wax-pro-box-open-800.webp',
    alt: 'Offener Versandkarton mit zwei dunklen MoS2-Wachsblöcken, Abendlicht auf Schiefer',
  },
  'kettenwachs-rennrad-gravelbike': { src: '/images/review-gravel.jpg', alt: 'Gravelbike mit Bikepacking-Taschen' },
  'wachs-haelt-nicht-haeufige-fehler': {
    src: '/images/blog/chain-wax-kit-hills-1600.webp',
    card: '/images/blog/chain-wax-kit-hills-800.webp',
    alt: 'Gewachste Kette, Wachsblock und Versandkarton auf Schiefer vor den Hügeln',
  },
  'kettenwachs-faq': { src: '/images/hero-chain-angle.jpg', alt: 'Saubere Fahrradketten von der Seite' },
  'vorgewachste-kette': {
    src: '/images/blog/box-chain-delivery-1600.webp',
    card: '/images/blog/box-chain-delivery-800.webp',
    alt: 'Wachsblock, Waxcelerate-Versandkarton, Kette und zwei Kettenschlösser auf Schiefer vor den Hügeln',
  },
  'kettenwachs-winter': { src: '/images/review-sunset.jpg', alt: 'Rennrad bei Sonnenuntergang am Feldweg' },
  'topf-zum-kette-wachsen': {
    src: '/images/blog/wax-bath-hanging-1600.webp',
    card: '/images/blog/wax-bath-hanging-800.webp',
    alt: 'Fahrradkette hängt an zwei Drahthaken über einem Edelstahltopf, Hügel im Hintergrund',
  },
  'tropfwachs-hybrid-methode': { src: '/images/reviews/ride-5.jpg', alt: 'Gravelbike mit gewachster Kette vor einem Café' },
  'von-oel-auf-wachs-umsteigen': {
    src: '/images/blog/chain-quicklinks-detail-1600.webp',
    card: '/images/blog/chain-quicklinks-detail-800.webp',
    alt: 'Fahrradkette mit zwei losen Kettenschlössern in Nahaufnahme auf Schiefer',
  },
  'ebike-kette-wachsen': { src: '/images/reviews/ride-2.jpg', alt: 'Rennrad an einem Dorfbrunnen in den Alpen' },
  'kettenverschleiss-messen': { src: '/images/reviews/ride-4.jpg', alt: 'Rennradfahrer auf Passstraße in den Dolomiten' },
  'erste-fahrt-nach-wachsen': {
    src: '/images/blog/chain-waxed-macro-1600.webp',
    card: '/images/blog/chain-waxed-macro-800.webp',
    alt: 'Gewachste Fahrradkette diagonal auf dunklem Schiefer, grünes Blatt am Rand',
  },
  'schnellverschluss-quicklink': {
    src: '/images/blog/tools-quicklink-pliers-1600.webp',
    card: '/images/blog/tools-quicklink-pliers-800.webp',
    alt: 'Kettenschloss-Zange lehnt an einem blauen Wachsblock, Kette und Draht im Vordergrund',
  },
  'wachs-entsorgen-topf-pflegen': {
    src: '/images/blog/wax-block-chain-slate-1600.webp',
    card: '/images/blog/wax-block-chain-slate-800.webp',
    alt: 'Dunkler Wachsblock und gewachste Fahrradkette auf Schiefer vor den Hügeln',
  },
};

export function getArticleImage(slug: string): { src: string; card: string; alt: string } {
  const img = articleImages[slug] ?? {
    src: '/images/hero-chain-texture.jpg',
    alt: 'Fahrradkette in Nahaufnahme',
  };
  return { ...img, card: img.card ?? img.src };
}

/** Autor, für Byline und Autoren-Box. */
export const author = {
  name: 'Luca Teichmann',
  role: 'Gründer von Waxcelerate',
  bio: 'Medizinstudent und Vielfahrer aus Stuttgart. Wachst seine Ketten seit Jahren selbst und testet jede Charge vor dem Verkauf. 2025 von eBay als Verkäufer auf die Hauptbühne des Seller-Events nach San José eingeladen.',
  avatar: '/images/luca.jpg',
};

export const blogHero = {
  src: '/images/hero-chain-texture.jpg',
  alt: 'Fahrradketten in Makroaufnahme',
};

/**
 * Bildpaar für die Feature-Kachel oben auf dem Blog-Index (großes Hauptbild +
 * kleineres überlappendes Kontrastbild). Beide Fotos stammen aus Lucas
 * Alltag, keine Stockfotografie — das ist die These des gesamten Blogs in
 * einem Blick.
 */
export const blogFeature = {
  main: {
    src: '/images/blog/chain-waxed-macro-1600.webp',
    alt: 'Frisch gewachste Fahrradkette in Nahaufnahme auf dunklem Schiefer',
    caption: 'Gewachst · 400 km',
  },
  inset: {
    src: '/images/blog/oil-tattoo-leg-800.webp',
    alt: 'Schwarze Ölspuren an Wade und weißer Socke nach einer Fahrt mit geölter Kette',
    caption: 'Geölt · 80 km',
  },
};
