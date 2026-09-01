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
  // card ergaenzt: src war bisher auch die Kartenvorschau (204-322 KB
  // Originalfoto statt 25-90 KB) — ausgeliefert auf der Blog-Uebersicht UND
  // im "Weiterlesen"-Widget jedes anderen Artikels. src bleibt bewusst das
  // Originalfoto (bleibt die Artikel-eigene Hero-Datei, nicht Teil dieses Fixes).
  'heisswachs-vs-fluessigwachs': { src: '/images/wax-block-spin.jpg', card: '/images/blog/wax-block-spin-800.webp', alt: 'Waxcelerate Wachsblock auf dunklem Schiefer' },
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
  'kettenwachs-rennrad-gravelbike': { src: '/images/review-gravel.jpg', card: '/images/blog/gravel-bikepacking-800.webp', alt: 'Gravelbike mit Bikepacking-Taschen' },
  'wachs-haelt-nicht-haeufige-fehler': {
    src: '/images/blog/chain-wax-kit-hills-1600.webp',
    card: '/images/blog/chain-wax-kit-hills-800.webp',
    alt: 'Gewachste Kette, Wachsblock und Versandkarton auf Schiefer vor den Hügeln',
  },
  'kettenwachs-faq': { src: '/images/hero-chain-angle.jpg', card: '/images/blog/chain-links-macro-800.webp', alt: 'Saubere Fahrradketten von der Seite' },
  'vorgewachste-kette': {
    src: '/images/blog/box-chain-delivery-1600.webp',
    card: '/images/blog/box-chain-delivery-800.webp',
    alt: 'Wachsblock, Waxcelerate-Versandkarton, Kette und zwei Kettenschlösser auf Schiefer vor den Hügeln',
  },
  'kettenwachs-winter': { src: '/images/review-sunset.jpg', card: '/images/blog/sworks-sunset-field-800.webp', alt: 'Rennrad bei Sonnenuntergang am Feldweg' },
  'topf-zum-kette-wachsen': {
    src: '/images/blog/wax-bath-hanging-1600.webp',
    card: '/images/blog/wax-bath-hanging-800.webp',
    alt: 'Fahrradkette hängt an zwei Drahthaken über einem Edelstahltopf, Hügel im Hintergrund',
  },
  'tropfwachs-hybrid-methode': { src: '/images/reviews/ride-5.jpg', card: '/images/blog/gravel-bikepacking-2-800.webp', alt: 'Gravelbike mit gewachster Kette vor einem Café' },
  'von-oel-auf-wachs-umsteigen': {
    src: '/images/blog/chain-quicklinks-detail-1600.webp',
    card: '/images/blog/chain-quicklinks-detail-800.webp',
    alt: 'Fahrradkette mit zwei losen Kettenschlössern in Nahaufnahme auf Schiefer',
  },
  'ebike-kette-wachsen': { src: '/images/reviews/ride-2.jpg', card: '/images/blog/alpine-fountain-bike-800.webp', alt: 'Rennrad an einem Dorfbrunnen in den Alpen' },
  'kettenverschleiss-messen': { src: '/images/reviews/ride-4.jpg', card: '/images/blog/dolomites-climb-800.webp', alt: 'Rennradfahrer auf Passstraße in den Dolomiten' },
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
