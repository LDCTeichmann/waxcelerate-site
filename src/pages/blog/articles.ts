export interface ArticleSection {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'tip' | 'note';
  text?: string;
  items?: string[];
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface Article {
  slug: string;
  title: string;
  titleShort: string;
  description: string;
  publishDate: string;
  readingTime: string;
  intro: string;
  sections: ArticleSection[];
  ctaSlug: string;
  ctaText: string;
  howTo?: {
    name: string;
    totalTime: string;
    steps: HowToStep[];
  };
}

export const articles: Article[] = [
  {
    slug: 'heisswachs-vs-fluessigwachs',
    title: 'Heißwachs vs. Flüssigwachs für Fahrradketten: Ein ehrlicher Vergleich',
    titleShort: 'Heißwachs vs. Flüssigwachs: Der Vergleich',
    description: 'Heißwachs oder Flüssigwachs für die Fahrradkette? Wir vergleichen Reibungswerte, Intervalle und Kosten – ehrlich und ohne Marketing.',
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
          'Heißwachs, trockene Bedingungen: 400–600 km pro Anwendung',
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
        text: 'Neue Ketten werden ab Werk mit Mineralöl-basiertem Korrosionsschutzöl konserviert. Dieses Öl ist nicht mit Paraffin kompatibel: Paraffin ist unpolar, Mineralöl ist unpolar – sie mischen sich zwar, aber das Öl verhindert, dass das Wachs an den Metalloberflächen haften kann. Im Ergebnis bleibt das Wachs außen auf der Kette, während sich im Inneren der Bolzen und Hülsen eine Öl-Wachs-Mischung bildet, die weder gut schmiert noch sauber bleibt.',
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
          'Trockene Straße / Rennrad / Commuter: 400–600 km pro Wachsvorgang',
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
        text: 'Eine Kette, die zuvor mit Heißwachs behandelt wurde und nicht mit Öl in Berührung gekommen ist, kann direkt nachweiß werden – ohne IPA.',
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
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
