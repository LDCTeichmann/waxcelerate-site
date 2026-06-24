export interface ArticleSection {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'tip' | 'note';
  text?: string;
  items?: string[];
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
  readingTime: string;
  intro: string;
  sections: ArticleSection[];
  ctaSlug: string;
  ctaText: string;
  /** Hervorgehobener Leitartikel auf der Blog-Startseite. */
  featured?: boolean;
  /** Kennzahlen-Chips für den Leitartikel (nur bei featured genutzt). */
  stats?: { value: string; label: string }[];
  /** Kurzfassung oben im Artikel ("Das Wichtigste in Kürze"). */
  takeaways?: string[];
  /** Frage-Antwort-Paare für FAQPage-Schema. */
  faq?: { q: string; a: string }[];
  howTo?: {
    name: string;
    totalTime: string;
    steps: HowToStep[];
  };
}

/** Akzentfarbe je Kategorie — lesbar auf hellem und dunklem Hintergrund. */
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

export const articles: Article[] = [
  {
    slug: 'heisswachs-vs-fluessigwachs',
    title: 'Heißwachs vs. Flüssigwachs für Fahrradketten: Ein ehrlicher Vergleich',
    titleShort: 'Heißwachs vs. Flüssigwachs: Der Vergleich',
    description: 'Heißwachs oder Flüssigwachs für die Fahrradkette? Wir vergleichen Reibungswerte, Intervalle und Kosten – ehrlich und ohne Marketing.',
    category: 'Grundlagen',
    publishDate: '2026-05-19',
    readingTime: '7 min',
    intro: 'Kettenwachs ist nicht gleich Kettenwachs. Heißwachs (Paraffin, im Topf geschmolzen) und Flüssigwachs (Wachs-Emulsion aus der Flasche) versprechen beide saubere, reibungsarme Antriebe – aber mit sehr unterschiedlichen Kompromissen. Dieser Artikel zeigt, was die Messwerte wirklich sagen und welche Methode zu welchem Fahrertyp passt.',
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
        text: 'Flüssigwachs ist deutlich bequemer: Kette nicht entfernen, nicht entfetten (zumindest nach der ersten Behandlung), einfach auftropfen und kurz einfahren. Das ist der eigentliche Vorteil – nicht die Leistung.',
      },
      {
        type: 'h2',
        text: 'Reibungswerte im Vergleich',
      },
      {
        type: 'p',
        text: 'Unabhängige Prüfstände (u.a. ZeroFriction Cycling, Jason Smith) messen Kettenverluste in Watt. Hier die typischen Messbereiche unter Laborbedingungen bei 250 W Systemleistung:',
      },
      {
        type: 'ul',
        items: [
          'Heißwachs (Paraffin + PTFE): 2,5–4,5 W Verlust – Reibungskoeffizient ~0,03–0,06',
          'Flüssigwachs (Squirt, Silca): 5–8 W – Reibungskoeffizient ~0,09–0,12',
          'Nasses Kettenöl (Bio-based, Standard): 8–16 W – Reibungskoeffizient ~0,15–0,25',
          'Trockenes Kettenöl: 6–10 W – besser als nasses Öl, schlechter als Wachs',
        ],
      },
      {
        type: 'p',
        text: 'Der Unterschied zwischen Heißwachs und gutem Flüssigwachs liegt in der Praxis bei 3–5 W. Bei einem 4-Stunden-Ride mit 250 W entspricht das ungefähr 4–7 kJ – subjektiv kaum spürbar, für Rennsportler aber relevant. Für Alltagsfahrer sind 4 W Unterschied keine Kaufentscheidung.',
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
          'Heißwachs, trockene Bedingungen: 300–600 km pro Anwendung (je nach Produkt und Bedingungen)',
          'Heißwachs, nass / MTB: 200–300 km (Wasser löst Paraffin schneller heraus)',
          'Flüssigwachs, trocken: 150–250 km',
          'Flüssigwachs, nass: 80–120 km',
        ],
      },
      {
        type: 'tip',
        text: 'Das Erkennungszeichen für einen fälligen Nachwachsvorgang: Die Kette fängt an zu quietschen, besonders unter Last. Warte nicht auf sichtbaren Schmutz – der kommt erst, wenn das Wachs schon deutlich verschlissen ist.',
      },
      {
        type: 'h2',
        text: 'Kettenlaufzeit',
      },
      {
        type: 'p',
        text: 'Paraffin-basiertes Heißwachs hält die Kette sauberer als jedes Öl, weil es keinen Schmutz bindet. Weniger Abrasion bedeutet weniger Kettendehnung. ZeroFriction Cycling dokumentiert für gut gewachste Ketten Laufleistungen von 5.000–8.000 km bis zur 0,5-%-Dehngrenze, bei Öl sind es typisch 2.000–2.500 km. Das ist eine Verdreifachung der Kettenlaufzeit – und damit auch weniger Verschleiß an Kassette und Kettenblättern.',
      },
      {
        type: 'h2',
        text: 'Der Mythos "Heißwachs ist zu aufwendig"',
      },
      {
        type: 'p',
        text: 'Der häufigste Einwand gegen Heißwachs ist der Aufwand. Das stimmt für eine einzelne Kette – aber nicht für eine 3-Ketten-Rotation. Das Prinzip: Drei Ketten gleichzeitig im Einsatz. Während Kette 1 am Rad läuft, hängt Kette 2 fertig gewachst bereit und Kette 3 wartet auf die nächste Wachsrunde. Wenn Kette 1 nachgewachst werden muss, nimmst du einfach Kette 2 – der Wechsel dauert 60 Sekunden mit einem Schnellverschluss. Den eigentlichen Wachsvorgang (Kette einhängen, 10 min warten, abtropfen) erledigst du gesammelt für alle drei Ketten in einer Session. Zeitaufwand pro Kette und Wachsvorgang: 5–10 Minuten.',
      },
      {
        type: 'h2',
        text: 'Fazit: Wer sollte was verwenden?',
      },
      {
        type: 'ul',
        items: [
          'Ambitionierte Rennfahrer, Randonneure, Vielkilometer-Fahrer: Heißwachs lohnt sich eindeutig – niedrigste Reibung, längste Kettenlaufzeit, sauberster Antrieb.',
          'Gelegenheitsfahrer (unter 100 km/Woche, überwiegend trockene Bedingungen): Flüssigwachs wie Squirt ist eine absolut legitime Wahl. Der Komfortvorteil überwiegt.',
          'MTB / Gravelbike bei wechselhaftem Wetter: Heißwachs mit MoS₂-Variante oder gut bewährtes nasses Kettenöl. Flüssigwachs hat hier die kürzesten Intervalle.',
        ],
      },
      {
        type: 'note',
        text: 'Wichtig: Flüssigwachs auf einer zuvor mit Öl geschmierten Kette funktioniert schlecht. Das Öl verdrängt die Wachsemulsion. Wer von Öl auf Flüssigwachs wechselt, muss die Kette zuerst entfetten – genau wie beim Heißwachs.',
      },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },

  {
    slug: 'fahrradkette-entfetten',
    title: 'Fahrradkette entfetten: So geht es richtig vor dem Wachsen',
    titleShort: 'Fahrradkette entfetten – richtig vor dem Wachsen',
    description: 'Fahrradkette entfetten vor dem Heißwachsen: Warum es zwingend notwendig ist, welche Mittel wirklich funktionieren und häufige Fehler vermeiden.',
    category: 'Anleitung',
    publishDate: '2026-05-19',
    readingTime: '6 min',
    intro: 'Das Entfetten der Kette ist der einzige Schritt beim Heißwachsen, bei dem Anfänger am häufigsten scheitern. Wer diesen Schritt überspringt oder halbherzig erledigt, wird feststellen, dass das Wachs nicht haftet, schnell abblättert und die Kette nach 50 km wieder quietscht. Das hat nichts mit dem Wachs zu tun – es liegt am Öl darunter.',
    sections: [
      {
        type: 'h2',
        text: 'Warum Entfetten zwingend notwendig ist',
      },
      {
        type: 'p',
        text: 'Neue Ketten werden ab Werk mit einem zähen, mineralölbasierten Korrosionsschutzöl konserviert. Genau dieses Öl ist das Problem beim Wachsen: Es bleibt flüssig und beweglich. Festes Paraffin kann sich nicht mit einer ölbenetzten Metalloberfläche verbinden – das Wachs legt sich nur außen darüber, während im Inneren der Bolzen und Hülsen eine weiche Öl-Wachs-Mischung zurückbleibt, die weder richtig schmiert noch sauber bleibt. Deshalb hält Wachs ohne gründliches Entfetten nicht.',
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
          'Deckel zu, 30–60 Sekunden kräftig schütteln. IPA wird trüb – das ist das gelöste Öl.',
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
        text: 'Aceton (Nagellackentferner ohne Zusätze, oder technisches Aceton) ist aggressiver als IPA und löst Öl schneller und vollständiger. Ein bis zwei Durchgänge genügen meist. Aceton verdunstet rückstandsfrei und sehr schnell – die Kette ist in 5 Minuten trocken. Nachteile: stärkerer Geruch, schlechter für Kunststoffgefäße (Metall- oder Glasgefäß verwenden), und deutlich entflammbarer.',
      },
      {
        type: 'h2',
        text: 'Methode 3: Ultraschallbad (professionell)',
      },
      {
        type: 'p',
        text: 'Ein Ultraschallreiniger (Elma, Codyson oder ähnliche, ab ca. 40–60 € für einfache Modelle) mit IPA oder einem Ultraschall-Reinigungskonzentrat reinigt die Kette in jedem Winkel – auch dort, wo manuelles Schütteln nicht hinkommt. 5–10 Minuten Laufzeit, danach abspülen und trocknen. Für Fahrer, die mehrere Ketten im Einsatz haben und regelmäßig wachsen, amortisiert sich das Gerät schnell.',
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
        text: 'Wer eine 3-Ketten-Rotation betreibt, kann alle drei Ketten gleichzeitig entfetten – dasselbe IPA im Glas. Spart Zeit und Lösungsmittel. Danach alle drei direkt ins Wachsbad hängen.',
      },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },

  {
    slug: 'kettenlaufzeit-heisswachs',
    title: 'Wie lange hält Kettenwachs? Intervalle, Kettenlaufzeit und Kostenrechnung',
    titleShort: 'Kettenwachs: Intervalle, Laufzeit & Kostenrechnung',
    description: 'Wie lange hält Kettenwachs wirklich? Intervalle, Kettenlaufzeit und eine ehrliche Kostenrechnung von Heißwachs vs. Öl über 15.000 km.',
    category: 'Grundlagen',
    featured: true,
    stats: [
      { value: '3–5 W', label: 'Reibung' },
      { value: '5–8.000 km', label: 'Kettenlaufzeit' },
      { value: '~140 €', label: 'Ersparnis' },
    ],
    publishDate: '2026-05-19',
    readingTime: '7 min',
    intro: 'Eine der häufigsten Fragen zu Heißwachs: Wann muss ich wieder wachsen, und lohnt sich das finanziell überhaupt? Beides lässt sich konkret beantworten – mit Messdaten und einer einfachen Rechnung über einen realistischen Nutzungszeitraum.',
    sections: [
      {
        type: 'h2',
        text: 'Wie lange hält Kettenwachs? Intervalle in der Praxis',
      },
      {
        type: 'p',
        text: 'Die Haltbarkeit von Heißwachs hängt stark von den Bedingungen ab. Paraffin wird durch Wasser herausgelöst – Regen, feuchte Straßen und Schmutz verkürzen den Zyklus erheblich. Als Orientierungswerte aus der Praxis:',
      },
      {
        type: 'ul',
        items: [
          'Trockene Straße / Rennrad / Commuter: 300–600 km pro Wachsvorgang',
          'Wechselhaftes Wetter / Gravelbike: 250–400 km',
          'Nass, MTB, Schotter mit Pfützen: 150–250 km',
          'Waxcelerate Pro mit MoS₂ (Nassbereich): ca. 15–20 % längere Intervalle als Classic',
        ],
      },
      {
        type: 'p',
        text: 'Der zuverlässigste Indikator für einen fälligen Nachwachsvorgang ist das Knirschen oder Quietschen der Kette unter Last – nicht die Farbe oder Optik. Eine saubere, gewachste Kette sieht lange "trocken" aus, auch wenn das Wachs in den Gelenken schon aufgebraucht ist. Wer bei Regen fährt: lieber früher wachsen als warten.',
      },
      {
        type: 'h2',
        text: 'Kettenlaufzeit: Öl vs. Heißwachs',
      },
      {
        type: 'p',
        text: 'Kettenverschleiß entsteht fast ausschließlich durch abrasive Partikel, die sich im Schmiermittel ansammeln. Öl zieht Straßenstaub, Sand und Metallabrieb an – die Kette wird zur Schleifpaste. Wachs dagegen bindet keinen Schmutz: Schmutz setzt sich auf der äußeren Wachsschicht ab und bröselt ab, ohne in die Gelenke einzudringen.',
      },
      {
        type: 'p',
        text: 'Das hat messbare Folgen für die Kettenlaufzeit. Als Verschleißgrenze gilt 0,5 % Kettendehnung (gemessen mit Kettenlehre), ab der ein Kettenwechsel nötig ist, um Kassette und Kettenblätter zu schonen. Messwerte aus ZeroFriction Cycling-Tests:',
      },
      {
        type: 'ul',
        items: [
          'Kettenöl (gut gepflegt, regelmäßig gewechselt): 2.000–2.500 km bis 0,5 % Dehnung',
          'Heißwachs (Paraffin + PTFE, korrekt angewendet): 5.000–8.000 km',
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
          'Wachs: 1 Block Waxcelerate Classic 500 g (29,95 €) reicht für ca. 20–25 Wachsvorgänge bei 3-Ketten-Rotation – also ca. 2 Blöcke über 15.000 km = 59,90 €',
          'Kassettenverschleiß deutlich geringer, kein Extra-Kassettenwechsel nötig',
          'Gesamtkosten Wachs-Szenario: ca. 130–165 €',
        ],
      },
      {
        type: 'p',
        text: 'Differenz: 120–160 € Ersparnis über 15.000 km. Das ist kein dramatisches Ergebnis – aber solide. Wer teure Kassetten fährt (SRAM XDR, Shimano Dura-Ace), erhöht die Ersparnis erheblich, weil die längere Kettenlaufzeit den Kassettenring schützt.',
      },
      {
        type: 'h2',
        text: 'Die 3-Ketten-Rotation – warum sie die Rechnung verändert',
      },
      {
        type: 'p',
        text: 'Mit nur einer Kette verlängert sich die Laufzeit trotzdem auf ~5.000–6.000 km. Aber mit drei rotierenden Ketten passiert etwas Zusätzliches: Jede Kette trägt weniger Gesamtkilometer als eine Einzelkette, weil der Verschleiß auf drei Exemplare verteilt wird. Das verlängert die Gesamtlaufzeit der Kassette noch weiter, weil nie eine stark gedehnte Kette auf einen "frischen" Kassettenring trifft.',
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
        text: 'Heißwachs spart Geld – aber nicht dramatisch. Der eigentliche Gewinn ist Zeit (seltener wachsen, nie Schmiermittel auftropfen unterwegs) und Komfort (sauberer Antrieb, keine Öl-Flecken). Wer bereit ist, den initialen Aufwand für das Einrichten des Wachsbades und das erste Entfetten zu investieren, wird es nicht bereuen. Wer nur eine Kette besitzt und keine Lust auf Kettenwechsel hat: Flüssigwachs ist eine vernünftige Alternative.',
      },
    ],
    ctaSlug: 'wax-500-mos2',
    ctaText: 'Pro Heißwachs mit MoS₂ ansehen →',
  },

  {
    slug: 'heisswachs-anleitung',
    title: 'Fahrradkette mit Heißwachs behandeln — vollständige Anleitung',
    titleShort: 'Heißwachs Anleitung: Schritt für Schritt',
    description: 'Schritt-für-Schritt-Anleitung zum Wachsen einer Fahrradkette mit Heißwachs – von der Ausrüstung über die richtige Temperatur bis zum fertigen Ergebnis.',
    category: 'Anleitung',
    publishDate: '2026-05-19',
    readingTime: '8 min',
    intro: 'Heißwachs klingt aufwendiger als es ist. Wer den Prozess einmal gemacht hat, braucht für jeden Wachsvorgang weniger als 20 Minuten aktive Zeit. Diese Anleitung führt durch den vollständigen Prozess – von der nötigen Ausrüstung bis zur fertig eingefahrenen Kette.',
    sections: [
      {
        type: 'h2',
        text: 'Ausrüstung',
      },
      {
        type: 'p',
        text: 'Das brauchst du – nicht mehr, nicht weniger:',
      },
      {
        type: 'ul',
        items: [
          'Heißwachs-Block (z.B. Waxcelerate Classic 500 g oder Pro mit MoS₂)',
          'Kleiner Topf oder Slow Cooker (Mini-Crockpot, 0,5–1 L Fassungsvermögen)',
          'Thermometer (optional, aber empfehlenswert – ein einfaches Kochthermometer reicht)',
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
        text: 'Ohne Thermometer: Das Wachs ist bereit, wenn es vollständig flüssig ist und leicht glänzt, aber noch keine Dämpfe sichtbar sind und keine Blasenbildung auftritt. Bei einem Slow Cooker auf niedrigster Stufe – mit Deckel – ist die Temperatur meist automatisch im richtigen Bereich.',
      },
      {
        type: 'h2',
        text: 'Erstbehandlung: Neue Kette wachsen',
      },
      {
        type: 'p',
        text: 'Bei einer neuen Kette ist das Entfetten zwingend notwendig – das Fabrikfett ist nicht kompatibel mit Paraffin.',
      },
      {
        type: 'ol',
        items: [
          'Kette aus der Verpackung nehmen. Neue Shimano- und KMC-Ketten sind besonders stark geölt – sehen oft silbrig-glänzend aus.',
          'Kette in Glasgefäß mit Isopropanol 99 % geben. Deckel drauf, 60 Sekunden kräftig schütteln. IPA wird trüb.',
          'IPA abschütten, frisches IPA rein, erneut 60 Sekunden schütteln. Nach der 2. Runde prüfen: IPA sollte kaum noch trüb werden.',
          'Kette auf sauberem Tuch ausbreiten. 10–15 Minuten bei Raumtemperatur vollständig trocknen lassen.',
          'Weißen-Tuch-Test: Kette über Papiertuch ziehen. Kein Ölfilm sichtbar? Bereit.',
          'Wachs auf 85–90 °C erhitzen. Kette einhängen. 10–15 Minuten warten – bei geschlossenem Topfdeckel geht es schneller.',
          'Kette herausheben, kurz abtropfen lassen, an einem Haken aufhängen. Nicht auf Oberflächen legen – Wachs läuft ab.',
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
        text: 'Eine Kette, die zuvor mit Heißwachs behandelt wurde und nicht mit Öl in Berührung gekommen ist, kann direkt nachgewachst werden – ohne IPA.',
      },
      {
        type: 'ol',
        items: [
          'Kette vom Rad nehmen (Schnellverschluss öffnen).',
          'Kette unter heißem Wasser (so heiß wie möglich aus der Leitung) abspülen. Optional: 1–2 Tropfen Spülmittel dazu, kurz einwirken, abspülen.',
          'Kette auf Tuch legen. Vollständig trocknen lassen – mindestens 20 Minuten, oder kurz mit einem Fön beschleunigen.',
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
          'Wachs komplett schmelzen, durch einen Kaffeefilter oder feines Sieb filtern – Schmutz bleibt im Filter zurück.',
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
          'Kein Einfahren: Kette direkt ans Rad und losfahren – das Wachs außen ist noch hart und bricht beim ersten Pedalieren ungleichmäßig auf. Lieber vorher durch die Hände laufen lassen.',
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
        text: 'Pro-Tipp für Vielfahr: Behalte denselben Topf und dasselbe Wachs für alle Ketten deiner Rotation. Das Wachs "lernt" über Zeit – die Zusammensetzung stabilisiert sich nach den ersten paar Ketten.',
      },
    ],
    howTo: {
      name: 'Fahrradkette mit Heißwachs behandeln',
      totalTime: 'PT45M',
      steps: [
        { name: 'Kette entfetten', text: 'Neue Kette 2× je 60 Sekunden in Isopropanol 99 % schütteln, bis das IPA nicht mehr trüb wird. Dann vollständig trocknen lassen (10–15 min) und mit weißem Tuch prüfen — kein Ölfilm mehr sichtbar.' },
        { name: 'Wachs erhitzen', text: 'Waxcelerate auf 85–90 °C erhitzen. Das Wachs ist bereit, wenn es vollständig flüssig ist und leicht glänzt, aber noch keine Dämpfe sichtbar sind.' },
        { name: 'Kette eintauchen', text: 'Kette vollständig ins Wachsbad hängen. Mindestens 10–15 Minuten einwirken lassen — Deckel schließen hält die Temperatur stabiler.' },
        { name: 'Kette aushängen und abkühlen', text: 'Kette an einem Haken aufhängen und abtropfen lassen. 10 Minuten auf Raumtemperatur abkühlen lassen.' },
        { name: 'Einfahren', text: 'Kette 10–20 Mal durch die Hände laufen lassen, bis sie wieder biegsam ist. Überschüssiges Außenwachs bricht auf — das weiße Pulver, das abfällt, ist normal.' },
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
    publishDate: '2026-06-01',
    readingTime: '6 min',
    intro: 'Waxcelerate Pro enthält neben Paraffin und PTFE auch Molybdändisulfid — abgekürzt MoS₂. Auf Produktverpackungen taucht der Begriff regelmäßig auf, eine Erklärung bleibt meist aus. Dieser Artikel erklärt, was MoS₂ auf atomarer Ebene tut, warum es bei Kettenschmierung sinnvoll ist, und wann du es wirklich brauchst.',
    sections: [
      {
        type: 'h2',
        text: 'Was ist Molybdändisulfid?',
      },
      {
        type: 'p',
        text: 'Molybdändisulfid (MoS₂) ist ein natürlich vorkommendes Mineral aus der Gruppe der Übergangsmetall-Dichalkogenide. Chemisch besteht es aus einem Molybdänatom zwischen zwei Schwefelatomen — S–Mo–S. Diese Schichtstruktur ist der Schlüssel zu seiner Schmierwirkung.',
      },
      {
        type: 'p',
        text: 'MoS₂-Kristalle sind in dünne Schichten aufgebaut, die durch schwache Van-der-Waals-Kräfte zusammengehalten werden. Unter mechanischem Druck gleiten diese Schichten gegeneinander ab — ähnlich wie Blätter in einem Stapel. Der Reibungskoeffizient liegt je nach Belastung und Atmosphäre zwischen 0,03 und 0,06. Unter Vakuum und extremem Druck sogar darunter — weshalb MoS₂ in der Raumfahrt und im Hochdruckmaschinenbau eingesetzt wird.',
      },
      {
        type: 'h2',
        text: 'Wie wirkt MoS₂ in einer Fahrradkette?',
      },
      {
        type: 'p',
        text: 'In einer Fahrradkette entstehen die größten Reibungskräfte in den Rollenlagern — dem Kontakt zwischen Kettenbolzen und Kettenhülse. Bei jedem Umlauf über das Kettenblatt und die Kassettenzähne verbiegt sich die Kette leicht, die Bolzen drehen sich in den Hülsen. Genau dort muss das Schmiermittel wirken.',
      },
      {
        type: 'p',
        text: 'Reines Paraffin mit PTFE (Waxcelerate Classic) schmiert gut bei normalen Bedingungen. Bei erhöhtem Druck — hohes Tretkraft, hohes Körpergewicht, E-Bike-Unterstützung oder schwere Geländebelastung — kann die Paraffinschicht komprimiert werden, und die Metallteile kommen näher aneinander. MoS₂ lagert sich als Transferfilm direkt auf den Metalloberflächen ab. Dieser Film bleibt auch dann wirksam, wenn der Paraffinfilm verdrängt wird.',
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
        text: 'Paraffin alleine ist zwar wasserabweisend, wird aber bei längerem Regenkontakt von den Metalloberflächen abgewaschen — besonders an exponierten Stellen wie Kettenbolzen und Nieten. MoS₂ haftet als kovalent gebundener Transferfilm direkter auf der Stahloberfläche und widersteht Wasser besser als die rein physikalische Schicht aus Paraffin.',
      },
      {
        type: 'p',
        text: 'In der Praxis: Waxcelerate Classic hält bei Trockenheit 250–450 km, bei Nässe 150–250 km. Waxcelerate Pro hält trocken 300–550 km, nass 150–300 km. Der Unterschied bei Nässe ist geringer als bei Trockenheit, weil der MoS₂-Transferfilm unter Feuchtigkeit besonders schützend wirkt.',
      },
      {
        type: 'h2',
        text: 'Ist MoS₂ gesundheitlich bedenklich?',
      },
      {
        type: 'p',
        text: 'Nein. Molybdändisulfid ist chemisch inert, nicht wasserlöslich und wird nicht über die Haut aufgenommen. Es ist in der EU als Schmierstoffadditiv für Lebensmittelkontaktmaterialien zugelassen und wird seit Jahrzehnten in der Automobilindustrie, Luft- und Raumfahrt sowie im Maschinenbau eingesetzt. Die schwarze Farbe des Pro-Wachses kommt von den feinen MoS₂-Partikeln — sie hinterlässt auf der Kette eine leicht dunklere Patina, aber keinen Schmierfilm.',
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
          'Pro empfohlen: Herbst und Winter, wenn Temperaturen unter 5 °C fallen — MoS₂ behält seine Schmierwirkung bis −8 °C',
          'Im Zweifel: Pro. Der Preisunterschied (5 €) ist gering, der Vorteil bei wechselhaftem Wetter messbar',
        ],
      },
      {
        type: 'h2',
        text: 'Warum das Wachs schwarz ist — und was das bedeutet',
      },
      {
        type: 'p',
        text: 'MoS₂ ist von Natur aus silbergrau bis schwarz. In Waxcelerate Pro ist es in feiner Partikelgröße in das Paraffinwachs eingemischt — daher die schwarze Farbe des Blocks und des flüssigen Wachses. Auf der Kette selbst ist nach dem Aushärten kaum Verfärbung sichtbar; der Großteil des überschüssigen Wachses bricht beim Einfahren ab (das weiße Pulver, das du an der Kette siehst). Was bleibt, ist der dünne, unsichtbare MoS₂-Transferfilm auf den Kontaktflächen.',
      },
      {
        type: 'note',
        text: 'Den Wachstopf nach der Nutzung von Pro-Wachs nicht mit Classic mischen — die schwarzen MoS₂-Partikel verbleiben im Topf und würden das Classic-Wachs leicht verunreinigen. Für Pro-Nutzer empfiehlt sich ein dedizierter Topf.',
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
    publishDate: '2026-06-01',
    readingTime: '7 min',
    intro: 'Heißwachs ist für jede Fahrradkette geeignet — aber für Rennrad- und Gravelbike-Fahrer lohnt es sich besonders. Wer auf Leistung und Sauberkeit achtet, für wen jedes Watt zählt oder wer einfach nicht will, dass die Kette nach 50 km Gravelpiste eine schwarze Öllage trägt: Heißwachs ist die logische Wahl.',
    sections: [
      {
        type: 'h2',
        text: 'Reibung — warum Wachs auf dem Rennrad besonders wirkt',
      },
      {
        type: 'p',
        text: 'Eine Fahrradkette überträgt unter Last nie 100 % der Tretkraft. Ein Teil geht als Wärme verloren — durch innere Reibung in den Kettengelenken. Bei Kettenöl liegt dieser Verlust je nach Produkt bei 6–10 Watt (gemessen bei 250 W Eingangsleistung). Heißwachs mit PTFE kommt auf 3–5 Watt. Das klingt wenig, macht über 3 Stunden Fahrt aber einen merklichen Unterschied — und auf dem Rennrad, wo Watts gezählt werden, ist jede Reduktion relevant.',
      },
      {
        type: 'p',
        text: 'Waxcelerate Classic erzielt einen Reibungskoeffizient von 0,05–0,07, die Pro-Variante mit MoS₂ 0,03–0,06. Zum Vergleich: handelsübliches Nassöl liegt bei 0,15–0,25 — je nachdem wie viel Schmutz es bereits aufgenommen hat.',
      },
      {
        type: 'h2',
        text: 'Sauberkeit auf dem Gravelbike',
      },
      {
        type: 'p',
        text: 'Schotterfahrten bringen feinen Kies, Sand und Staub in direkten Kontakt mit dem Antrieb. Auf einer geölten Kette wirken diese Partikel wie Schleifpaste — der Verschleiß an Kassette und Kettenblatt steigt stark. Eine gewachste Kette ist trocken und zieht keinen Schmutz an. Partikel, die auf die Kette gelangen, haften nicht und werden beim nächsten Pedaltritt einfach weggeworfen.',
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
          'Rennrad, Sommer, überwiegend Asphalt: Waxcelerate Classic reicht vollkommen. Reibungskoeffizient 0,05–0,07, Intervall 250–450 km trocken.',
          'Rennrad, Ganzjahr oder häufig Regen: Waxcelerate Pro mit MoS₂. Bessere Nasswetterbeständigkeit, längere Intervalle (300–550 km trocken).',
          'Gravelbike, gemischtes Terrain: Waxcelerate Pro. Der MoS₂-Transferfilm widersteht mechanischem Druck und Feuchtigkeit besser.',
          'Cyclocross: Waxcelerate Pro. Kurze Intervalle, oft nass — die hydrophobe Matrix macht einen Unterschied.',
        ],
      },
      {
        type: 'h2',
        text: 'Intervalle: Wie oft muss ich auf dem Rennrad nachwachsen?',
      },
      {
        type: 'p',
        text: 'Die Faustregeln aus der Praxis: Waxcelerate Classic bei trockenen Asphaltbedingungen alle 250–450 km. Bei Regen oder gemischten Bedingungen alle 150–250 km. Waxcelerate Pro trocken alle 300–550 km, bei Nässe alle 150–300 km.',
      },
      {
        type: 'p',
        text: 'Erkennbar ist das Ende des Intervalls am Klang: Der Antrieb klingt trockener, manchmal leichtes Quietschen unter Last. Auf dem Rennrad bei sportlicher Belastung spürst du auch minimal mehr Widerstand. Lieber 50 km früher nachwachsen als zu spät.',
      },
      {
        type: 'tip',
        text: '3-Ketten-Rotation auf dem Rennrad: Mit drei Ketten im Wechsel wächst du alle drei auf einmal (ca. 15 Minuten) und wechselst alle 300–400 km. Keine Wartezeit, kein Aufwand während der Saison, und alle drei Ketten verschleißen gleichmäßig — die Kassette hält doppelt so lange.',
      },
      {
        type: 'h2',
        text: 'Was ist mit modernen 12-fach-Systemen?',
      },
      {
        type: 'p',
        text: '12-fach-Ketten (Shimano Dura-Ace, SRAM Red/Force AXS, Campagnolo Super Record) sind enger gefertigt und empfindlicher gegenüber Abrasion. Genau deshalb profitieren sie besonders von Heißwachs: kein Schmutz, der die engen Toleranzen angreift. Waxcelerate ist mit allen gängigen 12-fach-Ketten getestet und kompatibel. Die Erstentfettung ist bei modernen 12-fach-Ketten wichtiger denn je — das Werkfett haftet stärker.',
      },
      {
        type: 'h2',
        text: 'Umstieg von Öl auf Wachs: Was auf dem Rennrad zu beachten ist',
      },
      {
        type: 'ol',
        items: [
          'Alte Kette entsorgen oder vollständig entfetten (Ultraschallbad für beste Ergebnisse)',
          'Kassette und Kettenblätter reinigen — Ölreste dort kontaminieren die neue Wachskette schnell',
          'Neue Kette oder sauber entfettete Kette 10–15 min im Wachsbad (85–90 °C)',
          'Erste 20–30 km sind die Einfahrphase — der MoS₂-Transferfilm bildet sich erst, Wachs bricht ein',
          'Nach der Einfahrphase läuft die Kette auf dem Niveau, das du kennst: leise, leicht, sauber',
        ],
      },
      {
        type: 'note',
        text: 'Vorgewachste Ketten von Waxcelerate überspringen Schritt 1–3 komplett. Die Kette kommt bereits entfettet, gewachst und einfahrbereit — einfach montieren und losfahren.',
      },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Waxcelerate Classic für Rennrad & Gravel ansehen →',
  },
  {
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    title: 'Wachs hält nicht, Kette quietscht? Die 7 häufigsten Heißwachs-Fehler',
    titleShort: 'Wachs hält nicht? Die 7 häufigsten Fehler',
    description: 'Wachs blättert ab, die Kette quietscht nach 50 km, weißes Pulver überall? Die häufigsten Heißwachs-Fehler – und wie du sie wirklich behebst.',
    category: 'Problemlösung',
    publishDate: '2026-06-16',
    readingTime: '6 min',
    intro: 'Heißwachs ist im Grunde simpel: entfetten, eintauchen, abkühlen, fahren. Trotzdem berichten Einsteiger immer wieder von denselben Problemen – Wachs, das nicht hält, eine Kette, die schon nach 50 km wieder quietscht, oder ein Antrieb, der staubt. Die gute Nachricht: Fast jedes dieser Probleme hat eine einzige, identifizierbare Ursache. Hier sind die sieben häufigsten – mit dem konkreten Schritt, der sie löst.',
    takeaways: [
      'Wachs hält nicht → in über 90 % der Fälle nicht gründlich genug entfettet.',
      'Quietschen nach kurzer Zeit → Wachsbad zu kühl oder Kette zu kurz eingetaucht.',
      'Steife Kette und weißes Pulver → völlig normal, das Einfahren löst es.',
    ],
    sections: [
      { type: 'h2', text: '1. Das Wachs blättert ab oder hält nicht – woran liegt das?' },
      { type: 'p', text: 'In über 90 % der Fälle liegt es am Entfetten. Wachs haftet nicht auf Öl. Wenn auch nur ein Film Fabrik- oder Restöl in den Kettengelenken sitzt, legt sich das Wachs außen darüber, statt sich mit dem Metall zu verbinden – und bricht beim ersten Pedalieren wieder ab. Das Wachs ist nicht schuld, die Vorbereitung ist es.' },
      { type: 'p', text: 'Die Lösung: Kette mit Isopropanol 99 % in einem verschließbaren Glas in 2–3 Durchgängen entfetten, bis das IPA kaum noch trüb wird. Danach der Weiße-Tuch-Test – Kette über ein Papiertuch ziehen, kein Abrieb sichtbar. Erst dann ins Wachsbad.' },
      { type: 'note', text: 'Kein 70-%-Isopropanol (Desinfektionsmittel) verwenden. Der Wasseranteil hinterlässt Rückstände in den Gliedern und fördert Rost. Nur 99 % oder 96 %.' },
      { type: 'h2', text: '2. Die Kette quietscht schon nach 50–100 km wieder' },
      { type: 'p', text: 'Quietschen so kurz nach dem Wachsen heißt fast immer: Das Wachs ist nie tief in die Gelenke eingedrungen. Zwei typische Ursachen – das Wachsbad war zu kühl (unter 80 °C, das Paraffin bleibt dann zu zäh) oder die Kette war zu kurz im Bad. 10 Minuten sind das Minimum, eher 15. Bei 85–90 °C zieht das flüssige Paraffin in jeden Bolzen und jede Hülse.' },
      { type: 'tip', text: 'Ein Zeichen, dass die Penetration stimmt: Während die kalte Kette im heißen Bad liegt, steigen für ein paar Minuten kleine Bläschen auf – das ist verdrängte Luft aus den Gelenken. Erst wenn keine Bläschen mehr kommen, ist die Kette komplett durchtränkt.' },
      { type: 'h2', text: '3. Die Kette ist nach dem Abkühlen steif und springt' },
      { type: 'p', text: 'Das ist normal – und kein Defekt. Frisch gewachst sind die Gelenke vom erstarrten Paraffin verklebt. Wer so direkt losfährt, bekommt eine hakelige Schaltung. Der Schritt, den die meisten überspringen: das Einfahren. Kette 10–20 Mal durch die Hände laufen lassen oder über einen Stab knicken, bis jedes Glied sauber abwinkelt. Danach läuft sie geschmeidig.' },
      { type: 'h2', text: '4. Weißes Pulver fällt von der Kette – ist das schlecht?' },
      { type: 'p', text: 'Nein, das ist überschüssiges Außenwachs, das beim Einfahren und auf den ersten Kilometern abbricht. Es bedeutet nicht, dass das Schmiermittel verloren geht – das wirksame Wachs sitzt geschützt in den Gelenken, nicht außen. Das Pulver verschwindet nach den ersten 20–30 km von selbst.' },
      { type: 'h2', text: '5. Die Kette rostet an den Außenlaschen' },
      { type: 'p', text: 'Flugrost an der Oberfläche nach einer Nassfahrt ist bei gewachsten Ketten möglich, weil Wachs – anders als Öl – keinen dauerhaften Feuchtigkeitsfilm außen hinterlässt. Funktional ist das harmlos, solange die Gelenke innen gewachst sind. Wichtiger ist, der Ursache vorzubeugen: Kette nach Nässe nie nass wegstellen, sondern kurz trockenreiben. Wer oft im Nassen fährt, profitiert von der MoS₂-Variante, deren Transferfilm direkter auf dem Stahl haftet.' },
      { type: 'h2', text: '6. Beim Eintauchen spritzt das Wachs' },
      { type: 'p', text: 'Das ist gefährlich und hat genau eine Ursache: Wasser oder Lösungsmittelreste auf der Kette treffen auf 85–90 °C heißes Wachs. Die Kette muss vor dem Bad vollständig trocken sein – nach dem Entfetten 10–15 Minuten an der Luft, nach dem Abspülen mit Wasser eher 20 Minuten oder kurz mit dem Fön. Im Zweifel länger warten.' },
      { type: 'h2', text: '7. Die Schaltung läuft nach dem Wechsel auf Wachs schlechter' },
      { type: 'p', text: 'Wenn der Umstieg von Öl kommt, sitzt der Fehler oft nicht an der Kette, sondern an Kassette und Kettenblättern: Dort kleben noch Ölreste, die die frisch gewachste Kette sofort wieder kontaminieren. Beim Umstieg deshalb den ganzen Antrieb entfetten, nicht nur die Kette. Danach die ersten 20–30 km als Einfahrphase einplanen – erst danach läuft das System auf dem leisen, leichten Niveau, für das man Wachs überhaupt fährt.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'kettenwachs-faq',
    title: 'Kettenwachs FAQ: Die 15 häufigsten Fragen kurz beantwortet',
    titleShort: 'Kettenwachs FAQ: 15 Fragen, kurz beantwortet',
    description: 'Die häufigsten Fragen zu Heißwachs für Fahrradketten – jeweils in zwei, drei Sätzen beantwortet. Für alle, die nur schnell eine Antwort brauchen.',
    category: 'Grundlagen',
    publishDate: '2026-06-16',
    readingTime: '5 min',
    intro: 'Nicht jede Frage braucht einen ganzen Artikel. Hier sind die fünfzehn Fragen, die uns am häufigsten erreichen – jeweils in zwei, drei Sätzen. Für die tiefen Themen gibt es weiterführende Artikel, aber wer nur schnell eine Antwort sucht, findet sie hier.',
    faq: [
      { q: 'Wie oft muss ich die Kette nachwachsen?', a: 'Bei trockenen Bedingungen alle 300–600 km, bei Nässe oder auf Schotter 150–300 km. Der zuverlässigste Indikator ist nicht die Optik, sondern das Geräusch: Sobald die Kette unter Last trockener klingt oder quietscht, ist es Zeit.' },
      { q: 'Muss ich eine neue Kette vor dem ersten Wachsen entfetten?', a: 'Ja, zwingend. Neue Ketten sind ab Werk mit Mineralöl konserviert, und Wachs haftet nicht auf Öl. Ohne Entfetten hält das Wachs nicht. Ausnahme: bereits vorgewachste Ketten.' },
      { q: 'Welche Temperatur braucht das Wachsbad?', a: '85–90 °C. Darunter ist das Wachs zu zäh und dringt nicht in die Gelenke ein, darüber oxidiert es schneller. Ein Slow Cooker auf niedrigster Stufe trifft diesen Bereich meist von allein.' },
      { q: 'Wie lange muss die Kette im Wachs bleiben?', a: '10–15 Minuten. Die Kette ist erst durchtränkt, wenn keine Luftbläschen mehr aufsteigen.' },
      { q: 'Wachsen oder ölen – was ist besser?', a: 'Wachs läuft reibungsärmer, hält die Kette sauber und verlängert die Kettenlaufzeit deutlich. Öl ist bequemer und im Dauerregen robuster. Für Vielfahrer und sportliche Fahrer lohnt sich Wachs, für seltene Schlechtwetter-Pendler ist Öl legitim.' },
      { q: 'Brauche ich einen teuren Spezial-Topf?', a: 'Nein. Ein einfacher Mini-Slow-Cooker für 25–35 € reicht völlig. Wichtig ist nur, dass er die Temperatur niedrig und stabil hält.' },
      { q: 'Kann ich eine geölte Kette einfach ins Wachs tauchen?', a: 'Nein. Das Öl kontaminiert das Wachsbad und verhindert, dass das Wachs haftet. Erst gründlich entfetten.' },
      { q: 'Wie lange hält ein Wachsblock?', a: 'Ein 500-g-Block reicht für rund 20–25 Wachsvorgänge. Bei einer 3-Ketten-Rotation also für eine ganze Saison und mehr.' },
      { q: 'Ist das weiße Pulver an der Kette ein Problem?', a: 'Nein, das ist überschüssiges Außenwachs, das beim Einfahren abbricht. Es verschwindet nach 20–30 km von selbst.' },
      { q: 'Funktioniert Wachs im Winter?', a: 'Bei Kälte und Trockenheit ja. Problematisch ist Streusalz und Dauernässe, die das Wachs schneller auswaschen. Dann häufiger nachwachsen oder zur MoS₂-Variante greifen.' },
      { q: 'Brauche ich einen Schnellverschluss?', a: 'Er macht das Abnehmen der Kette deutlich einfacher und ist für eine Rotation praktisch unverzichtbar. KMC- und SRAM-Quick-Links lassen sich mehrfach wiederverwenden.' },
      { q: 'Ist Heißwachs auch für E-Bikes geeignet?', a: 'Ja, gerade hier. E-Bike-Ketten verschleißen durch das hohe Drehmoment schneller – die saubere, reibungsarme Wachsschmierung schont den Antrieb spürbar.' },
      { q: 'Kann ich Wachs und Tropfwachs kombinieren?', a: 'Ja, das ist sogar eine sehr praktische Methode: zwischen den Heißwachs-Gängen mit kompatiblem Tropfwachs auffrischen und nur etwa alle 1.000 km neu heiß wachsen.' },
      { q: 'Riecht oder qualmt das Wachs?', a: 'Bei richtiger Temperatur nahezu nicht. Sichtbarer Dampf oder Rauch ist ein Zeichen, dass das Bad zu heiß ist – dann Stufe reduzieren.' },
      { q: 'Was mache ich mit altem, verschmutztem Wachs?', a: 'Komplett schmelzen, durch einen Kaffeefilter gießen – der Schmutz bleibt zurück. Erstarrte Wachsreste gehören in den Restmüll, niemals in den Abfluss.' },
    ],
    sections: [
      { type: 'note', text: 'Die Antworten unten sind bewusst kurz gehalten. Verlinkte Begriffe und die Artikel im Blog gehen jeweils in die Tiefe.' },
      { type: 'h2', text: 'Anwendung & Intervalle' },
      { type: 'h3', text: 'Wie oft muss ich nachwachsen?' },
      { type: 'p', text: 'Bei trockenen Bedingungen alle 300–600 km, bei Nässe oder auf Schotter 150–300 km. Der zuverlässigste Indikator ist nicht die Optik, sondern das Geräusch: Sobald die Kette unter Last trockener klingt, ist es Zeit.' },
      { type: 'h3', text: 'Wie lange muss die Kette im Wachs bleiben?' },
      { type: 'p', text: '10–15 Minuten. Durchtränkt ist sie erst, wenn keine Luftbläschen mehr aufsteigen.' },
      { type: 'h3', text: 'Welche Temperatur braucht das Bad?' },
      { type: 'p', text: '85–90 °C. Darunter ist das Wachs zu zäh, darüber oxidiert es schneller. Ein Slow Cooker auf niedrigster Stufe trifft den Bereich meist von allein.' },
      { type: 'h2', text: 'Vorbereitung & Ausrüstung' },
      { type: 'h3', text: 'Muss ich eine neue Kette entfetten?' },
      { type: 'p', text: 'Ja, zwingend. Werksöl und Paraffin sind nicht kompatibel – ohne Entfetten hält das Wachs nicht. Ausnahme: bereits vorgewachste Ketten.' },
      { type: 'h3', text: 'Brauche ich einen teuren Topf?' },
      { type: 'p', text: 'Nein. Ein Mini-Slow-Cooker für 25–35 € reicht. Wichtig ist nur eine niedrige, stabile Temperatur.' },
      { type: 'h3', text: 'Brauche ich einen Schnellverschluss?' },
      { type: 'p', text: 'Für eine Rotation praktisch unverzichtbar. KMC- und SRAM-Quick-Links lassen sich mehrfach wiederverwenden.' },
      { type: 'h2', text: 'Leistung & Bedingungen' },
      { type: 'h3', text: 'Wachsen oder ölen?' },
      { type: 'p', text: 'Wachs läuft reibungsärmer, bleibt sauber und verlängert die Kettenlaufzeit. Öl ist bequemer und im Dauerregen robuster. Für Vielfahrer lohnt sich Wachs, für seltene Schlechtwetter-Pendler ist Öl legitim.' },
      { type: 'h3', text: 'Funktioniert Wachs im Winter?' },
      { type: 'p', text: 'Bei Kälte und Trockenheit ja. Problematisch sind Streusalz und Dauernässe – dann häufiger nachwachsen oder zur MoS₂-Variante greifen.' },
      { type: 'h3', text: 'Ist Wachs für E-Bikes geeignet?' },
      { type: 'p', text: 'Ja, gerade hier. E-Bike-Ketten verschleißen durch das hohe Drehmoment schneller; die saubere Wachsschmierung schont den Antrieb spürbar.' },
      { type: 'h2', text: 'Häufige Sorgen' },
      { type: 'h3', text: 'Ist das weiße Pulver ein Problem?' },
      { type: 'p', text: 'Nein, das ist überschüssiges Außenwachs, das beim Einfahren abbricht. Nach 20–30 km verschwindet es von selbst.' },
      { type: 'h3', text: 'Riecht oder qualmt das Wachs?' },
      { type: 'p', text: 'Bei richtiger Temperatur kaum. Sichtbarer Rauch heißt: Bad ist zu heiß, Stufe reduzieren.' },
      { type: 'h3', text: 'Was mache ich mit altem Wachs?' },
      { type: 'p', text: 'Schmelzen, durch einen Kaffeefilter gießen – der Schmutz bleibt zurück. Erstarrte Reste in den Restmüll, nie in den Abfluss.' },
      { type: 'tip', text: 'Eine Frage offen geblieben? Schreib uns direkt über die Kontaktseite – die häufigsten neuen Fragen landen anschließend hier.' },
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
    readingTime: '5 min',
    intro: 'Eine vorgewachste Kette nimmt dir den aufwendigsten Teil des Heißwachsens ab: das erste Entfetten und das Einrichten des Wachsbades. Du montierst sie und fährst los. Aber lohnt sich der Aufpreis gegenüber einer Standardkette, die du selbst wachst? Die ehrliche Antwort hängt davon ab, wie oft du wachsen willst – und ob du überhaupt einsteigen möchtest.',
    takeaways: [
      'Eine vorgewachste Kette ist entfettet, im Wachsbad behandelt und einfahrbereit – einfach montieren und losfahren.',
      'Sinnvoll als Einstieg ohne eigene Ausrüstung und für alle, die den Aufwand der Erstbehandlung scheuen.',
      'Wer langfristig wachst, braucht trotzdem irgendwann Wachs und einen Topf zum Nachwachsen.',
    ],
    sections: [
      { type: 'h2', text: 'Was ist eine vorgewachste Kette genau?' },
      { type: 'p', text: 'Eine vorgewachste Kette ist eine fabrikneue Markenkette (Shimano, SRAM, YBN), bei der das Werks-Konservierungsöl bereits vollständig entfernt und durch Heißwachs ersetzt wurde. Der Ablauf entspricht dem, was du sonst selbst machen würdest: mehrstufig entfetten, im 85–90 °C heißen Wachsbad behandeln, abkühlen, einfahren. Das Ergebnis ist eine trockene, saubere Kette, die du direkt montieren kannst.' },
      { type: 'p', text: 'Der entscheidende Punkt: Das Entfetten neuer Ketten ist der Schritt, an dem die meisten Einsteiger scheitern – das Werksöl sitzt tief in den Gelenken und ist hartnäckig. Eine vorgewachste Kette überspringt genau diese Hürde.' },
      { type: 'h2', text: 'Für wen lohnt sich der Kauf?' },
      { type: 'ul', items: [
        'Einsteiger ohne Ausrüstung: Du willst die Vorteile von Wachs, aber (noch) keinen Topf, kein IPA und keine Wachsblöcke kaufen. Eine vorgewachste Kette ist der niedrigschwellige Einstieg.',
        'Zeitknappe Vielfahrer: Du kennst das Wachsen, willst dir aber die Erstbehandlung einer neuen Kette sparen.',
        'Geschenk oder Test: Du willst Heißwachs ausprobieren, ohne dich gleich für das ganze System zu entscheiden.',
      ] },
      { type: 'h2', text: 'Und wann lohnt es sich nicht?' },
      { type: 'p', text: 'Ehrlich gesagt: Wer ohnehin regelmäßig selbst wachst und bereits Topf und Wachs besitzt, zahlt für eine vorgewachste Kette vor allem den Arbeitslohn der Erstbehandlung. Das kann es wert sein – muss es aber nicht. Wenn du eine 3-Ketten-Rotation aufbaust, kaufst du günstiger Standardketten und wachst sie in einem Rutsch selbst.' },
      { type: 'note', text: 'Wichtig zu verstehen: Auch eine vorgewachste Kette muss irgendwann nachgewachst werden – nach 300–600 km trocken. Die Vorbehandlung spart dir den Einstieg, nicht die laufende Pflege. Spätestens dann brauchst du Wachs und einen Topf, oder du nutzt kompatibles Tropfwachs zum Auffrischen.' },
      { type: 'h2', text: 'Worauf du beim Kauf achten solltest' },
      { type: 'ul', items: [
        'Markenkette als Basis: Eine gewachste No-Name-Kette bleibt eine No-Name-Kette. Achte auf Shimano, SRAM oder YBN als Grundlage.',
        'Mehrstufige Entfettung: Seriöse Anbieter entfetten in mehreren Schritten (oft im Ultraschallbad), nicht nur oberflächlich. Sonst hält das Wachs nicht.',
        'Passende Geschwindigkeit: 11-fach und 12-fach sind nicht austauschbar. Prüfe die Kompatibilität mit deiner Schaltgruppe.',
        'Schnellverschluss dabei: Praktisch, wenn ein passender Quick-Link mitgeliefert wird – den brauchst du fürs Nachwachsen ohnehin.',
      ] },
      { type: 'h2', text: 'Fazit' },
      { type: 'p', text: 'Eine vorgewachste Kette ist kein Wundermittel, sondern eine bequeme Abkürzung. Sie nimmt dir die schwierigste Hürde ab und liefert ab Kilometer null die volle Wachsleistung. Für den Einstieg und für zeitknappe Fahrer ist das Geld gut investiert. Wer langfristig dabei bleibt, wechselt früher oder später trotzdem zum Selbermachen – und das ist auch völlig in Ordnung.' },
    ],
    ctaSlug: 'chain-hg701',
    ctaText: 'Vorgewachste Ketten ansehen →',
  },
  {
    slug: 'kettenwachs-winter',
    title: 'Kettenwachs im Winter: Streusalz, Regen und die ehrliche Wahrheit',
    titleShort: 'Kettenwachs im Winter: die ehrliche Wahrheit',
    description: 'Funktioniert Heißwachs im Winter? Was Streusalz und Dauernässe mit der Wachsschicht machen, wann Wachs überzeugt – und wann Öl die bessere Wahl ist.',
    category: 'Saison',
    publishDate: '2026-06-16',
    readingTime: '6 min',
    intro: 'Kaum eine Frage spaltet die Wachs-Community so wie der Winter. Die einen schwören darauf, dass eine gewachste Kette im Schmuddelwetter sauber bleibt, die anderen warnen vor Streusalz und ausgewaschenem Wachs. Beide haben recht – es kommt darauf an, wo und wie du fährst. Hier die ehrliche Einordnung, ohne das Produkt schönzureden.',
    takeaways: [
      'Bei trockener Kälte und gelegentlichem Regen ist Wachs im Winter klar im Vorteil: sauber, leise, kein verharztes Öl.',
      'Bei täglichem Streusalz und Dauernässe wäscht sich Wachs schneller aus – dann häufiger nachwachsen oder zu Öl greifen.',
      'Der größte Winter-Vorteil von Wachs: Es bindet keinen Salzschlamm, der sonst als Schleifpaste wirkt.',
    ],
    sections: [
      { type: 'h2', text: 'Was im Winter wirklich gegen die Kette arbeitet' },
      { type: 'p', text: 'Drei Faktoren setzen einer Winterkette zu: Feuchtigkeit (löst Schmiermittel aus), Streusalz (fördert Korrosion) und der nasse Schmutzschlamm aus Salz, Splitt und Straßendreck (wirkt wie Schleifpaste). Entscheidend ist, wie ein Schmiermittel mit diesen drei umgeht.' },
      { type: 'h2', text: 'Wo Wachs im Winter punktet' },
      { type: 'p', text: 'Der größte Vorteil bleibt auch im Winter bestehen: Wachs bindet keinen Schmutz. Während eine geölte Kette den nassen Salzschlamm regelrecht aufsaugt und zu einer schwarzen, schmirgelnden Paste verklebt, perlt der Dreck an der trockenen Wachsschicht ab. Die Kette bleibt sauber, das Schaltwerk präziser, und der abrasive Verschleiß durch eingebundene Partikel fällt geringer aus.' },
      { type: 'p', text: 'Bei trockener Kälte – Frost ohne Salz, klare Wintertage – ist Wachs nahezu unschlagbar. Paraffin bleibt bis weit unter den Gefrierpunkt funktionsfähig, und kein Öl verharzt bei Kälte.' },
      { type: 'h2', text: 'Wo Wachs an seine Grenzen kommt' },
      { type: 'p', text: 'Die ehrliche Kehrseite: Paraffin wird durch Wasser ausgewaschen. Wer täglich bei Dauerregen oder durch nasse, gesalzene Straßen pendelt, verkürzt das Wachsintervall drastisch – statt 400 km sind es dann vielleicht 100–150 km. Und an den blanken Außenlaschen kann sich nach einer Salzfahrt Flugrost bilden, weil Wachs dort keinen dauerhaften Schutzfilm hinterlässt wie kriechendes Öl.' },
      { type: 'note', text: 'Das heißt nicht, dass die Kette kaputtgeht. Solange die Gelenke innen gewachst sind, läuft sie. Aber der Pflegeaufwand steigt im nassen Salzwinter spürbar – das sollte man wissen, bevor man enttäuscht wird.' },
      { type: 'h2', text: 'Die praktische Empfehlung nach Fahrertyp' },
      { type: 'ul', items: [
        'Trockene Winterregion, sportliche Ausfahrten: Wachs, am besten die MoS₂-Variante. Sauber, leise, schützt vor Kältereibung.',
        'Pendler bei wechselhaftem Wetter ohne Dauernässe: Wachs funktioniert gut, einfach das Intervall verkürzen und nach Salzfahrten kurz abspülen und trockenreiben.',
        'Täglicher Ganzjahres-Pendler durch Salz und Matsch: Hier ist ein gutes Nassöl oft die pragmatischere Wahl – oder das Winterrad bekommt Öl, das gute Rad bleibt gewachst.',
      ] },
      { type: 'h2', text: 'Pflege-Tipps für die Wachskette im Winter' },
      { type: 'ol', items: [
        'Nach Salz- oder Nassfahrten die Kette kurz mit heißem Wasser abspülen und trockenreiben – das entfernt Salz, bevor es arbeitet.',
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
    description: 'Slow Cooker, Reiskocher oder einfacher Topf zum Kette wachsen? Was wirklich funktioniert, worauf es bei der Temperatur ankommt – und was du nicht brauchst.',
    category: 'Kaufberatung',
    publishDate: '2026-06-16',
    readingTime: '5 min',
    intro: 'Eine der ersten Fragen beim Einstieg ins Heißwachsen: Worin schmelze ich das Wachs eigentlich? Die Antwort ist erfreulich günstig – du brauchst kein Spezialgerät. Entscheidend ist nur eines: eine niedrige, stabile Temperatur. Hier ein ehrlicher Vergleich der Optionen.',
    takeaways: [
      'Ein einfacher Mini-Slow-Cooker für 25–35 € ist die beste Allround-Lösung.',
      'Wichtig ist nicht das Gerät, sondern dass es die Temperatur stabil bei 85–90 °C hält.',
      'Reserviere den Topf dauerhaft fürs Wachs – er wird nicht wieder für Lebensmittel genutzt.',
    ],
    sections: [
      { type: 'h2', text: 'Worauf es wirklich ankommt' },
      { type: 'p', text: 'Der optimale Temperaturbereich für Heißwachs liegt bei 85–90 °C. Darunter ist das Paraffin zu zäh und dringt nicht in die Gelenke ein, deutlich darüber oxidiert es schneller und kann qualmen. Jedes Gerät, das diesen Bereich stabil und ohne Überhitzung hält, ist geeignet. Alles andere – Marke, Optik, Zusatzfunktionen – ist zweitrangig.' },
      { type: 'h2', text: 'Option 1: Mini-Slow-Cooker (die Empfehlung)' },
      { type: 'p', text: 'Ein kleiner Slow Cooker (Crockpot, Fassungsvermögen 0,5–1,5 l) ist für die meisten die beste Wahl. Auf der niedrigsten Stufe pendelt er sich oft von allein im richtigen Bereich ein, die Wärme kommt sanft und gleichmäßig, und es gibt nichts, was überhitzen kann. Preis: 25–35 €. Der herausnehmbare Keramik- oder Metalleinsatz macht das Handling einfach.' },
      { type: 'tip', text: 'Beim ersten Mal mit einem Küchenthermometer kontrollieren, wo die niedrigste Stufe deines Geräts landet. Viele Mini-Cooker liegen bei 80–90 °C – ideal. Manche laufen heißer; dann hilft es, den Deckel leicht versetzt aufzulegen.' },
      { type: 'h2', text: 'Option 2: Reiskocher' },
      { type: 'p', text: 'Ein einfacher Reiskocher funktioniert, ist aber heikler: Viele Modelle haben nur „Kochen" und „Warmhalten". Warmhalten ist oft zu kühl (65–75 °C), Kochen zu heiß. Wer einen Reiskocher mit einstellbarer Temperatur oder einer guten Warmhaltefunktion hat, kann ihn nutzen – sonst lieber zum Slow Cooker greifen.' },
      { type: 'h2', text: 'Option 3: Topf auf dem Herd' },
      { type: 'p', text: 'Geht zur Not, ist aber die schlechteste Dauerlösung. Die Temperatur schwankt stark, man muss ständig danebenstehen, und die Überhitzungsgefahr ist real. Wenn überhaupt, dann mit Wasserbad-Prinzip (Wachs im kleineren Gefäß, das in einem Topf mit Wasser steht) – das deckelt die Temperatur natürlich bei rund 100 °C. Für den gelegentlichen Einstieg okay, für die Dauer unkomfortabel.' },
      { type: 'h2', text: 'Option 4: Sous-vide-Beutel-Methode' },
      { type: 'p', text: 'Manche Wachsblöcke kommen in einem hitzebeständigen Beutel, den man einfach in einen Topf mit heißem Wasser legt. Praktisch für unterwegs oder als platzsparende Lösung, weil kein eigenes Gerät nötig ist. Für eine regelmäßige Rotation ist ein fester Slow-Cooker-Aufbau aber bequemer.' },
      { type: 'note', text: 'Ganz wichtig: Der Topf wird zum Wachstopf und bleibt es. Wachs lässt sich nicht restlos entfernen, und du willst kein Schmiermittel-Additiv im Essen. Ein gebrauchtes Gerät vom Flohmarkt für ein paar Euro reicht völlig.' },
      { type: 'h2', text: 'Was du nicht brauchst' },
      { type: 'ul', items: [
        'Teure „Chain-Waxing-Systeme" für dreistellige Beträge – ein Mini-Cooker leistet dasselbe.',
        'Ein Präzisions-Sous-vide-Stick – nett, aber Overkill für eine Fahrradkette.',
        'Ein großes Fassungsvermögen – die Kette muss nur bedeckt sein, mehr Wachs heißt nur längere Aufheizzeit.',
      ] },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'tropfwachs-hybrid-methode',
    title: 'Tropfwachs zwischen den Heißwachs-Gängen: Die Hybrid-Methode',
    titleShort: 'Die Hybrid-Methode: Heißwachs + Tropfwachs',
    description: 'Heißwachs und Tropfwachs kombinieren: Wie du mit der Hybrid-Methode seltener heiß wachsen musst, ohne die Kette abzunehmen – und worauf zu achten ist.',
    category: 'Anleitung',
    publishDate: '2026-06-16',
    readingTime: '5 min',
    intro: 'Heißwachs läuft am besten, ist aber gebunden an Topf, Abnehmen und Abkühlen. Tropfwachs aus der Flasche ist bequem, hält aber kürzer. Die Hybrid-Methode verbindet beides: Du baust die Wachsbasis im heißen Bad auf und frischst sie unterwegs mit Tropfwachs auf – ohne die Kette je abzunehmen. So musst du nur noch selten heiß wachsen.',
    takeaways: [
      'Basis im Heißwachsbad aufbauen, dann etwa alle 200 km mit kompatiblem Tropfwachs auffrischen.',
      'Heiß nachwachsen nur noch rund alle 1.000 km nötig – die Kette muss dafür nicht jedes Mal ab.',
      'Funktioniert nur Wachs auf Wachs: niemals Öl dazwischen, das zerstört die Basis.',
    ],
    sections: [
      { type: 'h2', text: 'Warum überhaupt kombinieren?' },
      { type: 'p', text: 'Heißwachs liefert die tiefste Penetration und die niedrigste Reibung, weil das flüssige Paraffin bis in jeden Bolzen zieht. Der Nachteil: Kette abnehmen, Bad erhitzen, abkühlen, einfahren. Tropfwachs spart diesen Aufwand, dringt aber weniger tief ein und hält kürzer. Die Hybrid-Methode nutzt die Stärken beider: die tiefe, langlebige Basis vom Heißwachs, die schnelle Auffrischung vom Tropfwachs.' },
      { type: 'h2', text: 'So funktioniert die Hybrid-Methode' },
      { type: 'ol', items: [
        'Basis legen: Kette einmal sauber entfetten und im Heißwachsbad (85–90 °C, 10–15 min) behandeln. Das ist dein Fundament.',
        'Fahren bis zum Intervall: Die Heißwachsbasis trägt 300–600 km trocken.',
        'Auffrischen statt heiß wachsen: Etwa alle 200 km – oder bevor die Kette trockener klingt – ein kompatibles Tropfwachs dünn auf die saubere Kette geben, Glied für Glied, kurz einwirken lassen, Überschuss abwischen.',
        'Trocknen lassen: Tropfwachs braucht je nach Produkt mehrere Stunden, bis das Trägermittel verdunstet ist. Am besten abends auftragen, am nächsten Tag fahren.',
        'Heiß nachwachsen alle ~1.000 km: Wenn sich über die Zeit Reste und Schmutz aufbauen, einmal komplett neu heiß wachsen – das setzt die Basis zurück.',
      ] },
      { type: 'tip', text: 'Tropfwachs nie auf eine schmutzige Kette geben – das schließt den Dreck ein. Vorher mit einem trockenen Lappen oder, wenn nötig, kurz mit heißem Wasser reinigen und trocknen lassen.' },
      { type: 'h2', text: 'Die eine Regel, die du nicht brechen darfst' },
      { type: 'p', text: 'Wachs verträgt sich nicht mit Öl. Wer zwischendurch zu einem Öl-Schmiermittel greift, zerstört die Wachsbasis und muss wieder komplett entfetten. Bleib im System: Heißwachs als Basis, Wachs-basiertes Tropfwachs zum Auffrischen. Achte beim Tropfwachs darauf, dass es eine echte Wachs-Emulsion ist und kein „Wax-Lube", das in Wahrheit ein Öl mit Wachszusatz ist.' },
      { type: 'h2', text: 'Für wen lohnt sich die Hybrid-Methode?' },
      { type: 'ul', items: [
        'Vielfahrer, die den Heißwachs-Aufwand reduzieren wollen, ohne auf die Leistung zu verzichten.',
        'Fahrer ohne 3-Ketten-Rotation, die ungern ständig die Kette abnehmen.',
        'Reisende und Bikepacker: Eine kleine Flasche Tropfwachs passt ins Gepäck, ein Wachstopf nicht.',
      ] },
      { type: 'note', text: 'Reine Heißwachs-Puristen erreichen minimal bessere Reibungswerte, weil jede Behandlung von Grund auf frisch ist. Der Unterschied ist klein – für die allermeisten überwiegt der Komfortgewinn der Hybrid-Methode deutlich.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs als Basis ansehen →',
  },
  {
    slug: 'von-oel-auf-wachs-umsteigen',
    title: 'Von Öl auf Wachs umsteigen: Die Komplett-Anleitung für den Wechsel',
    titleShort: 'Von Öl auf Wachs umsteigen',
    description: 'Du willst von Kettenöl auf Heißwachs umsteigen? Schritt für Schritt: Antrieb reinigen, Kette entfetten, erstes Wachsbad und die Einfahrphase richtig machen.',
    category: 'Anleitung',
    publishDate: '2026-06-16',
    readingTime: '6 min',
    intro: 'Der Umstieg von Öl auf Wachs ist einmalig etwas Arbeit – danach ist die Pflege einfacher als zuvor. Der häufigste Fehler dabei: nur die Kette anzufassen und Kassette, Schaltwerk und Kettenblätter zu vergessen. Dort sitzt noch Öl, das die frisch gewachste Kette sofort wieder kontaminiert. Diese Anleitung führt durch den vollständigen Wechsel.',
    takeaways: [
      'Beim Umstieg den ganzen Antrieb entfetten, nicht nur die Kette – Ölreste an Kassette und Kettenblättern kontaminieren sonst sofort.',
      'Eine stark geölte Altkette lässt sich oft schwer komplett entfetten; manchmal ist eine neue Kette der sauberere Start.',
      'Die ersten 20–30 km sind Einfahrphase – erst danach läuft der Antrieb auf vollem Wachs-Niveau.',
    ],
    sections: [
      { type: 'h2', text: 'Schritt 1: Entscheiden – Altkette entfetten oder neu starten?' },
      { type: 'p', text: 'Eine lange mit Öl gefahrene Kette hat Öl tief in den Gelenken, das selbst gründliches Entfetten nicht immer restlos löst. Wenn die Kette ohnehin schon Kilometer auf dem Buckel hat, ist eine neue (oder vorgewachste) Kette oft der saubere Neuanfang. Ist die Kette noch jung, lohnt das Entfetten – am besten im Ultraschallbad.' },
      { type: 'h2', text: 'Schritt 2: Den ganzen Antrieb reinigen' },
      { type: 'p', text: 'Das ist der Schritt, den fast alle unterschätzen. Kassette, Kettenblätter und Schaltrollen sind voller Altöl. Wenn die neue Wachskette darüberläuft, nimmt sie dieses Öl auf – und das Wachs hält nicht mehr.' },
      { type: 'ol', items: [
        'Kassette abnehmen (oder am Rad gründlich zwischen den Ritzeln reinigen) und entfetten.',
        'Kettenblätter und die Schaltröllchen am Schaltwerk mit Entfetter säubern.',
        'Alles vollständig trocknen lassen, bevor die gewachste Kette montiert wird.',
      ] },
      { type: 'h2', text: 'Schritt 3: Kette entfetten (falls du die alte behältst)' },
      { type: 'p', text: 'Kette abnehmen und in 2–3 Durchgängen mit Isopropanol 99 % im verschlossenen Glas entfetten, bis das IPA kaum noch trüb wird. Bei einer geölten Altkette darf es ruhig ein Durchgang mehr sein. Danach vollständig trocknen lassen und den Weiße-Tuch-Test machen: Kette über ein Papiertuch ziehen – kein Ölfilm sichtbar.' },
      { type: 'note', text: 'Kein 70-%-Isopropanol verwenden. Der Wasseranteil hinterlässt Rückstände und fördert Rost. Nur 99 % oder 96 %.' },
      { type: 'h2', text: 'Schritt 4: Erstes Wachsbad' },
      { type: 'p', text: 'Wachs auf 85–90 °C erhitzen, die trockene Kette einhängen und 10–15 Minuten baden, bis keine Luftbläschen mehr aufsteigen. Herausheben, abtropfen lassen, an einem Haken aufhängen und auf Raumtemperatur abkühlen lassen.' },
      { type: 'h2', text: 'Schritt 5: Einfahren und die ersten Kilometer' },
      { type: 'p', text: 'Die abgekühlte Kette ist steif – das ist normal. Sie 10–20 Mal durch die Hände laufen lassen, bis jedes Glied geschmeidig abwinkelt. Dann montieren. Die ersten 20–30 km sind die Einfahrphase: Überschüssiges Außenwachs bricht ab (das weiße Pulver ist normal), und der Antrieb findet sein finales, leises Niveau. Erst danach beurteilst du die Wachsleistung fair.' },
      { type: 'tip', text: 'Jetzt ist der ideale Moment, eine 3-Ketten-Rotation aufzubauen: Gleich zwei oder drei Ketten zusammen entfetten und wachsen. Dann wechselst du künftig in 60 Sekunden und wachst alle Ketten gesammelt – das macht den Wachs-Alltag fast aufwandsfrei.' },
      { type: 'h2', text: 'Was sich nach dem Umstieg ändert' },
      { type: 'ul', items: [
        'Der Antrieb bleibt sauber – keine schwarzen Hosenbeine, keine ölige Kette mehr.',
        'Die Kette läuft leiser und minimal leichter.',
        'Die Pflege verschiebt sich: kein Öl mehr unterwegs auftragen, dafür gelegentlich gesammelt wachsen.',
      ] },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
  {
    slug: 'ebike-kette-wachsen',
    title: 'E-Bike-Kette wachsen: Warum sich Heißwachs hier besonders lohnt',
    titleShort: 'E-Bike-Kette wachsen',
    description: 'E-Bike-Ketten verschleißen durch das hohe Drehmoment schneller. Warum Heißwachs den Antrieb besonders schont, was zu beachten ist und welches Wachs passt.',
    category: 'Kaufberatung',
    publishDate: '2026-06-16',
    readingTime: '5 min',
    intro: 'E-Bike-Ketten haben es schwer: Das Motordrehmoment belastet die Kettengelenke deutlich stärker als bei einem unmotorisierten Rad, der Verschleiß ist entsprechend höher. Genau deshalb lohnt sich Heißwachs hier besonders – es senkt die Reibung im Lager und hält den abrasiven Schmutz draußen. Was du beim E-Bike beachten solltest.',
    takeaways: [
      'Das hohe Motordrehmoment lässt E-Bike-Ketten schneller verschleißen – saubere, reibungsarme Schmierung zahlt sich hier doppelt aus.',
      'Wachs bindet keinen Schmutz, der sonst unter hoher Last als Schleifpaste wirkt.',
      'Bei hoher Dauerlast und Nässe ist die MoS₂-Variante die sicherere Wahl.',
    ],
    sections: [
      { type: 'h2', text: 'Warum E-Bike-Ketten schneller verschleißen' },
      { type: 'p', text: 'Ein Mittelmotor addiert sein Drehmoment direkt auf die Kette, bevor die Kraft ans Hinterrad geht. Die Folge: deutlich höhere Flächenpressung in den Kettengelenken – also genau dort, wo Verschleiß entsteht. Eine E-Bike-Kette, die mit demselben Öl wie ein normales Rad gefahren wird, ist oft schon nach der Hälfte der Kilometer am Verschleißlimit.' },
      { type: 'h2', text: 'Was Wachs hier konkret bringt' },
      { type: 'p', text: 'Verschleiß entsteht fast nie durch das Metall allein, sondern durch abrasive Partikel im Schmiermittel. Öl zieht Staub und Sand an und presst sie unter der hohen E-Bike-Last in die Gelenke – die Kette wird zur Schleifpaste. Wachs bindet keinen Schmutz: Die Kette bleibt trocken, Partikel haften nicht und werden weggeworfen. Unter hoher Last ist dieser Unterschied größer als beim normalen Rad, weil eingebundene Partikel hier mehr Schaden anrichten.' },
      { type: 'p', text: 'Dazu kommt die geringere Reibung im Lager. Beim E-Bike spürst du die zwar nicht als „Watt-Ersparnis" wie der Rennfahrer – aber weniger Reibung heißt weniger Wärme und weniger Verschleiß über die Lebensdauer.' },
      { type: 'h2', text: 'Worauf du beim E-Bike achten solltest' },
      { type: 'ul', items: [
        'Häufiger nachwachsen: Durch die höhere Last und oft mehr Jahreskilometer sind die Intervalle eher am unteren Ende anzusetzen.',
        'Verschleiß im Blick behalten: E-Bike-Ketten dehnen sich schneller – regelmäßig mit der Kettenlehre prüfen.',
        'Richtige Kette wählen: Viele E-Bikes nutzen verstärkte Ketten. Achte auf die passende Geschwindigkeit und Eignung deiner Schaltgruppe.',
        'MoS₂ bei hoher Dauerlast: Der Festschmierstoff bleibt wirksam, wenn unter Druck der Paraffinfilm dünner wird.',
      ] },
      { type: 'note', text: 'Hinweis: Bei E-Bikes mit Riemenantrieb (Gates Carbon Drive) entfällt das Thema – Riemen werden nicht gewachst und brauchen keine Schmierung. Dieser Artikel betrifft Kettenantriebe.' },
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
    publishDate: '2026-06-16',
    readingTime: '6 min',
    intro: 'Eine verschlissene Kette frisst die Kassette und die Kettenblätter mit. Wer rechtzeitig wechselt, tauscht ein 35-€-Teil – wer zu lange wartet, zahlt das Vielfache für den ganzen Antrieb. Die gute Nachricht: Kettenverschleiß lässt sich in 30 Sekunden messen. Hier, wie es geht und welche Grenzwerte gelten.',
    takeaways: [
      'Die übliche Wechselgrenze liegt bei 0,5 % Kettendehnung (0,75 % bei einigen 11-/12-fach-Systemen).',
      'Eine Kettenlehre für wenige Euro misst das zuverlässiger als ein Lineal.',
      'Gewachste Ketten erreichen die Grenze deutlich später – oft beim 2–3-Fachen der Kilometer einer geölten Kette.',
    ],
    sections: [
      { type: 'h2', text: 'Was „Kettenverschleiß" eigentlich ist' },
      { type: 'p', text: 'Ketten „längen" sich nicht durch gedehntes Metall, sondern durch Materialabtrag an Bolzen und Hülsen. Mit jedem Kilometer wird in den Gelenken minimal Material abgerieben, der Abstand zwischen den Gliedern wächst. Diese Längung lässt die Kette nicht mehr sauber in Kassette und Kettenblatt greifen – und beginnt, deren Zähne abzunutzen.' },
      { type: 'h2', text: 'Die Grenzwerte: 0,5 % und 0,75 %' },
      { type: 'p', text: 'Als Faustregel gilt: Bei 0,5 % Längung sollte die Kette gewechselt werden, um Kassette und Kettenblätter zu schonen. Manche Hersteller nennen für moderne 11- und 12-fach-Ketten 0,75 %, andere bleiben bei 0,5 %. Im Zweifel ist 0,5 % die sichere Grenze – besonders bei teuren Kassetten lohnt sich der frühe Wechsel.' },
      { type: 'h2', text: 'So misst du den Verschleiß' },
      { type: 'h3', text: 'Mit einer Kettenlehre (empfohlen)' },
      { type: 'p', text: 'Eine Kettenverschleißlehre kostet wenige Euro und ist die einfachste Methode. Du legst sie auf die Kette: Fällt der Messzahn nicht in die Lücke, ist die Kette unter der Grenze. Fällt er bündig hinein, ist die markierte Verschleißgrenze (z. B. 0,5 oder 0,75 %) erreicht. Wichtig: einige günstige Lehren messen tendenziell zu früh „verschlissen" – Markenlehren sind hier genauer.' },
      { type: 'h3', text: 'Mit dem Lineal' },
      { type: 'p', text: 'Ohne Lehre geht es auch: Eine neue Kette misst über 12 Glieder exakt 12 Zoll (304,8 mm), von Bolzenmitte zu Bolzenmitte. Bei 0,5 % Längung sind es rund 306,3 mm, bei 0,75 % etwa 307,1 mm. Mit einem Stahllineal und gespannter Kette lässt sich das gut ablesen.' },
      { type: 'tip', text: 'Immer unter leichter Spannung messen – also auf dem größten Kettenblatt, am besten mit etwas Zug am Schaltwerk. Eine schlaffe Kette verfälscht das Ergebnis.' },
      { type: 'h2', text: 'Warum gewachste Ketten länger halten' },
      { type: 'p', text: 'Da Verschleiß vor allem durch abrasive Partikel im Schmiermittel entsteht, hält eine gewachste Kette deutlich länger: Wachs bindet keinen Schmutz, der in die Gelenke wandert. Prüfstandsdaten zeigen für gut gewachste Ketten Laufleistungen von 5.000–8.000 km bis zur 0,5-%-Grenze, gegenüber 2.000–2.500 km bei Öl. Das ist näherungsweise eine Verdreifachung – und der Hauptgrund, warum sich Wachs über die Antriebskosten rechnet.' },
      { type: 'note', text: 'Tipp zur Rotation: Wer mehrere Ketten im Wechsel fährt, verteilt den Verschleiß. Wichtig ist, alle Ketten der Rotation regelmäßig zu messen und gemeinsam zu tauschen, bevor eine die Grenze überschreitet – so bleibt die Kassette über die volle Lebensdauer geschont.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs für lange Kettenlaufzeit ansehen →',
  },
  {
    slug: 'erste-fahrt-nach-wachsen',
    title: 'Die erste Fahrt nach dem Wachsen: Was normal ist und was nicht',
    titleShort: 'Die erste Fahrt nach dem Wachsen',
    description: 'Weißes Pulver, eine steife Kette, leise Knackgeräusche nach dem Wachsen? Was bei den ersten Kilometern völlig normal ist – und welche Zeichen wirklich auf einen Fehler hindeuten.',
    category: 'Problemlösung',
    publishDate: '2026-06-16',
    readingTime: '4 min',
    intro: 'Du hast die Kette frisch gewachst, montiert – und etwas wirkt komisch. Sie ist steif, es rieselt weißes Pulver, vielleicht knackt es leise. Bevor du an einen Fehler glaubst: Das meiste davon ist völlig normal und gehört zur Einfahrphase. Hier die Einordnung, was bei den ersten Kilometern dazugehört und was nicht.',
    takeaways: [
      'Weißes Pulver und eine anfangs steife Kette sind normal und verschwinden nach 20–30 km.',
      'Erst nach der Einfahrphase läuft der Antrieb auf seinem finalen, leisen Niveau.',
      'Anhaltendes Quietschen unter Last deutet dagegen auf einen echten Fehler beim Entfetten oder Wachsen hin.',
    ],
    sections: [
      { type: 'h2', text: 'Normal: Die Kette ist anfangs steif' },
      { type: 'p', text: 'Frisch gewachst sind die Gelenke vom erstarrten Paraffin leicht verklebt. Wenn du das Einfahren übersprungen hast, merkst du das als hakelige Schaltung auf den ersten Metern. Lösung: vor der Montage die Kette 10–20 Mal durch die Hände laufen lassen. Aber auch ohne löst sich die Steifigkeit nach den ersten Kilometern von selbst.' },
      { type: 'h2', text: 'Normal: Weißes Pulver rieselt ab' },
      { type: 'p', text: 'Das überschüssige Wachs an der Außenseite der Kette bricht beim Fahren auf und fällt als feines weißes Pulver ab. Das ist kein Verlust an Schmierung – das wirksame Wachs sitzt geschützt in den Gelenken. Nach 20–30 km ist der Überschuss weg und das Rieseln hört auf.' },
      { type: 'h2', text: 'Normal: Leichte Geräusche in der Einfahrphase' },
      { type: 'p', text: 'In den ersten Kilometern kann der Antrieb minimal anders klingen, während sich das Wachs setzt und – bei der MoS₂-Variante – der Transferfilm auf den Kontaktflächen bildet. Dieser Film entsteht nach etwa 20–30 km, danach läuft die Kette oft sogar noch etwas geschmeidiger als direkt nach der Montage.' },
      { type: 'tip', text: 'Plane die erste kurze Runde bewusst als Einfahrfahrt ein, nicht als Wertungsfahrt. Beurteile die Wachsleistung erst nach 30 km – vorher vergleichst du gegen einen Zustand, der sich noch einpendelt.' },
      { type: 'h2', text: 'Nicht normal: Anhaltendes Quietschen unter Last' },
      { type: 'p', text: 'Wenn die Kette nach der Einfahrphase weiter quietscht, besonders beim kräftigen Treten, stimmt etwas nicht. Die häufigste Ursache: Das Wachs ist nie tief eingedrungen – entweder war das Bad zu kühl oder die Kette zu kurz drin. Zweithäufigste Ursache: unzureichend entfettet, das Wachs sitzt nur außen auf. In beiden Fällen hilft nur erneutes (gründliches) Entfetten und Wachsen.' },
      { type: 'h2', text: 'Nicht normal: Wachsklumpen, die das Schalten stören' },
      { type: 'p', text: 'Dicke Wachsbrocken zwischen den Gliedern, die die Schaltung blockieren, deuten auf zu dick aufgetragenes Wachs oder fehlendes Einfahren hin. Kette abnehmen, kurz durch die Hände arbeiten, gröbere Klumpen vorsichtig entfernen. Wenn das Bad zu kühl war, beim nächsten Mal heißer (85–90 °C) arbeiten – dann läuft das Wachs dünner ab.' },
      { type: 'note', text: 'Kurz gesagt: Steifigkeit, weißes Pulver und ein kurzes Einpendeln gehören dazu. Anhaltendes Quietschen oder störende Klumpen sind Hinweise auf einen Schritt, der nachgebessert werden muss – meist das Entfetten oder die Badtemperatur.' },
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
    readingTime: '5 min',
    intro: 'Wer seine Kette wachst, nimmt sie regelmäßig ab – und genau dafür ist der Schnellverschluss (Quick-Link) das wichtigste kleine Teil im ganzen System. Mit ihm dauert der Kettenwechsel 60 Sekunden statt einer Vernietaktion. Aber welcher passt zu deiner Kette, wie oft darf man ihn wiederverwenden, und wie geht er ohne Spezialwerkzeug auf? Hier die kompakten Antworten.',
    takeaways: [
      'Der Quick-Link muss zur Geschwindigkeit der Kette passen (11-fach-Link nur an 11-fach-Kette).',
      'Wiederverwendbarkeit ist herstellerabhängig: KMC nennt mehrfach, SRAM offiziell einmalig – in der Wachs-Praxis hält ein guter Link aber viele Zyklen.',
      'Für eine Kettenrotation ist ein wiederverwendbarer Link praktisch unverzichtbar.',
    ],
    sections: [
      { type: 'h2', text: 'Was ist ein Schnellverschluss überhaupt?' },
      { type: 'p', text: 'Ein Schnellverschluss – je nach Hersteller Quick-Link, Missing Link oder Power Link genannt – ersetzt einen Kettenniet durch ein zweiteiliges Glied, das sich von Hand öffnen und schließen lässt. Statt die Kette mit dem Nietdrücker zu öffnen, klickst du den Link auf. Für gewachste Ketten, die regelmäßig ins Bad müssen, ist das der entscheidende Komfortgewinn.' },
      { type: 'h2', text: 'Warum er fürs Wachsen fast Pflicht ist' },
      { type: 'p', text: 'Heißwachs entfaltet seinen vollen Komfort erst, wenn das Abnehmen der Kette schnell geht – besonders bei einer 2- oder 3-Ketten-Rotation, bei der du häufig wechselst. Mit einem Quick-Link öffnest du die Kette in Sekunden, hängst sie ins Bad und montierst die nächste. Ohne Schnellverschluss müsstest du jedes Mal nieten, was die ganze Logik der Rotation zunichtemacht.' },
      { type: 'h2', text: 'Welcher Link passt zu meiner Kette?' },
      { type: 'p', text: 'Die wichtigste Regel: Der Link muss zur Geschwindigkeit (Anzahl Ritzel) deiner Kette passen. Ein 12-fach-Link ist schmaler als ein 11-fach-Link – sie sind nicht austauschbar.' },
      { type: 'ul', items: [
        'Passend zur Kettenbreite: 8-, 9-, 10-, 11- oder 12-fach. Steht auf der Verpackung.',
        'Markenkompatibilität: KMC Missing Link passt zu vielen Shimano- und SRAM-Ketten gleicher Geschwindigkeit; im Zweifel beim Kettenhersteller bleiben.',
        'Shimano 12-fach ist heikler: Shimano gibt für seine 12-fach-Ketten teils einen Niet statt Quick-Link vor – hier auf ausdrücklich kompatible Links achten.',
      ] },
      { type: 'h2', text: 'Wie oft darf man einen Quick-Link wiederverwenden?' },
      { type: 'p', text: 'Hier gehen Herstellerangabe und Praxis auseinander. SRAM gibt seine Power Locks offiziell als einmalig an, KMC erlaubt das mehrfache Öffnen explizit. In der Wachs-Praxis hält ein hochwertiger, wiederverwendbarer Link viele Zyklen – das eigentliche Verschleißteil ist nicht der Link, sondern ob er noch satt und ohne Spiel einrastet.' },
      { type: 'note', text: 'Sicherheit geht vor: Wenn ein Link sich zu leicht öffnen lässt, sichtbares Spiel hat oder beim Schließen nicht hörbar/spürbar einrastet, gehört er ersetzt. Ein paar Euro für einen neuen Link sind günstiger als eine reißende Kette unter Last. Ein gewachster Link bleibt übrigens sauber – das erleichtert die Sichtprüfung.' },
      { type: 'h2', text: 'Öffnen und schließen ohne Spezialwerkzeug' },
      { type: 'ol', items: [
        'Öffnen: Den Link an die obere, gerade Kettenstrecke bringen (zwischen Kettenblatt und Schaltwerk, ohne Spannung). Die beiden Glieder mit den Daumen zueinander drücken und gleichzeitig auseinanderschieben – er klickt auf. Eine Quick-Link-Zange macht es noch leichter, ist aber kein Muss.',
        'Schließen: Beide Hälften in die Kettenenden einfädeln, zusammenstecken, dann unter Zug bringen – am einfachsten, indem du das Pedal mit der Bremse blockierst und kräftig trittst, bis der Link hörbar einrastet.',
        'Kontrolle: Der geschlossene Link muss sich sauber durchbiegen lassen und darf kein seitliches Spiel haben.',
      ] },
      { type: 'tip', text: 'Halte immer einen passenden Ersatz-Link in der Satteltasche. Er wiegt nichts, kostet wenig und rettet jede Tour, falls die Kette unterwegs reißt – ganz unabhängig vom Wachsen.' },
    ],
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
    readingTime: '5 min',
    intro: 'Ein Wachsbad ist erstaunlich langlebig – mit etwas Pflege hält dasselbe Wachs Monate bis Jahre. Trotzdem stellen sich irgendwann die praktischen Fragen: Wann ist das Wachs aufgebraucht, wie wird es wieder sauber, wohin mit den Resten, und wie umweltfreundlich ist das Ganze eigentlich? Hier die ehrlichen Antworten.',
    takeaways: [
      'Ein Wachsbad muss man selten ganz austauschen – meist reicht regelmäßiges Filtern.',
      'Altwachs gehört erstarrt in den Restmüll, niemals flüssig in den Abfluss.',
      'Paraffin ist gut filterbar und bindet keinen Schmutz – ökologisch oft günstiger als der Reinigungs- und Abwasseraufwand bei Öl.',
    ],
    sections: [
      { type: 'h2', text: 'Wie lange hält ein Wachsbad?' },
      { type: 'p', text: 'Sehr lange. Anders als Öl, das man laufend nachkippt und das verschmutzt, bleibt Paraffin im Topf grundsätzlich erhalten – es wird nur durch jede Kette minimal mitgenommen. Was sich mit der Zeit ansammelt, ist Schmutz: feiner Metallabrieb und Straßenstaub, die sich am Topfboden absetzen. Solange du nachfüllst, wenn der Pegel sinkt, kann dasselbe Bad eine ganze Saison und länger laufen.' },
      { type: 'h2', text: 'Das Wachs filtern statt wegwerfen' },
      { type: 'p', text: 'Der entscheidende Pflegeschritt ist Filtern, nicht Austauschen. So geht es:' },
      { type: 'ol', items: [
        'Wachs vollständig schmelzen (85–90 °C), damit es dünnflüssig ist.',
        'Durch einen Kaffeefilter oder ein feines Metallsieb in ein zweites hitzebeständiges Gefäß gießen – der Schmutz bleibt im Filter zurück.',
        'Gefiltertes Wachs zurück in den gereinigten Topf. Fertig.',
      ] },
      { type: 'p', text: 'Ein sauberes Bad ist klar und leicht gelblich; ein verschmutztes wird dunkler und trüber. Filtern alle paar Wachsrunden hält die Qualität stabil.' },
      { type: 'tip', text: 'Pro- und Classic-Wachs nicht im selben Topf mischen: Die schwarzen MoS₂-Partikel der Pro-Variante setzen sich im Topf fest und verfärben späteres Classic-Wachs. Wer beide nutzt, hält am besten zwei getrennte Töpfe.' },
      { type: 'h2', text: 'Wann muss das Wachs wirklich raus?' },
      { type: 'p', text: 'Komplett ersetzen musst du Wachs selten – meist nur, wenn es trotz Filtern sichtbar gesättigt mit feinstem Abrieb ist, der sich nicht mehr herausfiltern lässt, oder wenn es durch wiederholtes Überhitzen oxidiert ist (zäh, dunkel, riecht ranzig). Dann lieber einen frischen Block einschmelzen, statt mit verbrauchtem Wachs schlechtere Ergebnisse zu erzielen.' },
      { type: 'h2', text: 'Altwachs richtig entsorgen' },
      { type: 'ul', items: [
        'Niemals flüssig in den Abfluss: Wachs erstarrt im Rohr und verstopft die Leitung zuverlässig.',
        'Erstarren lassen und in den Restmüll: Abgekühltes, festes Paraffin gehört in den normalen Hausmüll (Restmüll), nicht in Bio- oder Wertstofftonne.',
        'Filterreste (Kaffeefilter mit Schmutz und Wachs) ebenfalls in den Restmüll.',
        'Größere Mengen alter Schmierstoffe gehören – falls mit Öl vermischt – streng genommen zum Wertstoffhof. Reines, erstarrtes Paraffin ist unkritisch.',
      ] },
      { type: 'h2', text: 'Wie nachhaltig ist Paraffinwachs?' },
      { type: 'p', text: 'Ehrlich eingeordnet: Paraffin ist ein Nebenprodukt der Erdölverarbeitung – nicht "bio", aber chemisch inert und gut handhabbar. Der ökologische Vorteil liegt im System: Wachs bindet keinen Schmutz, du brauchst keine aggressiven Kettenreiniger, keine literweise Entfetter und keinen ölverschmierten Lappenberg. Es gelangt kaum Schmiermittel in die Umwelt, weil das Wachs an der Kette bleibt und nicht abtropft wie Öl. Über die Lebensdauer ist der Reinigungs- und Abfallaufwand deutlich geringer als bei Ölschmierung.' },
      { type: 'note', text: 'Der größte Umwelt-Hebel ist ohnehin die längere Kettenlaufzeit: Eine gewachste Kette hält das Zwei- bis Dreifache und schont Kassette und Kettenblätter. Weniger Verschleißteile, die produziert und entsorgt werden müssen – das ist nachhaltiger als jede Schmierstoff-Diskussion.' },
    ],
    ctaSlug: 'wax-500',
    ctaText: 'Classic Heißwachs 500 g ansehen →',
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Redaktionelles Hero-Bild je Artikel (Dateien liegen in /public/images). */
export const articleImages: Record<string, { src: string; alt: string }> = {
  'heisswachs-vs-fluessigwachs': { src: '/images/wax-block-spin.jpg', alt: 'Waxcelerate Wachsblock auf dunklem Schiefer' },
  'fahrradkette-entfetten': { src: '/images/chain-dirty.jpg', alt: 'Verölte, verschmutzte Fahrradkette in Nahaufnahme' },
  'kettenlaufzeit-heisswachs': { src: '/images/review-dolomites.jpg', alt: 'Rennradfahrer auf einer Passstraße in den Dolomiten' },
  'heisswachs-anleitung': { src: '/images/process-dip.jpg', alt: 'Fahrradkette wird in heißes Wachsbad getaucht' },
  'mos2-kettenwachs': { src: '/images/wax-mos2-zoom.png', alt: 'MoS₂-Wachsblock mit vergrößertem Ausschnitt der Partikel' },
  'kettenwachs-rennrad-gravelbike': { src: '/images/review-gravel.jpg', alt: 'Gravelbike mit Bikepacking-Taschen' },
  'wachs-haelt-nicht-haeufige-fehler': { src: '/images/hero-chain-texture.jpg', alt: 'Fahrradketten dicht an dicht, Makroaufnahme' },
  'kettenwachs-faq': { src: '/images/hero-chain-angle.jpg', alt: 'Saubere Fahrradketten von der Seite' },
  'vorgewachste-kette': { src: '/images/chain-clean.jpg', alt: 'Frisch gewachste Ketten im Wachsbad' },
  'kettenwachs-winter': { src: '/images/review-sunset.jpg', alt: 'Rennrad bei Sonnenuntergang am Feldweg' },
  'topf-zum-kette-wachsen': { src: '/images/process-melt.jpg', alt: 'Wachs schmilzt im Slow Cooker' },
  'tropfwachs-hybrid-methode': { src: '/images/reviews/ride-5.jpg', alt: 'Gravelbike mit gewachster Kette vor einem Café' },
  'von-oel-auf-wachs-umsteigen': { src: '/images/reviews/ride-1.jpg', alt: 'Rennrad bei Sonnenuntergang auf Feldweg' },
  'ebike-kette-wachsen': { src: '/images/reviews/ride-2.jpg', alt: 'Rennrad an einem Dorfbrunnen in den Alpen' },
  'kettenverschleiss-messen': { src: '/images/reviews/ride-4.jpg', alt: 'Rennradfahrer auf Passstraße in den Dolomiten' },
  'erste-fahrt-nach-wachsen': { src: '/images/reviews/ride-3.jpg', alt: 'Rennrad am Waldweg nach der ersten Fahrt' },
  'schnellverschluss-quicklink': { src: '/images/hero/chain.jpg', alt: 'Fahrradketten mit Kettenschloss auf Schieferplatte' },
  'wachs-entsorgen-topf-pflegen': { src: '/images/process-melt.jpg', alt: 'Geschmolzenes Wachs im Topf' },
};

export function getArticleImage(slug: string): { src: string; alt: string } {
  return (
    articleImages[slug] ?? {
      src: '/images/hero-chain-texture.jpg',
      alt: 'Fahrradkette in Nahaufnahme',
    }
  );
}

/** Autor — für Byline und Autoren-Box. */
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
