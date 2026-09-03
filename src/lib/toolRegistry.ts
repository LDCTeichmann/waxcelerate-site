// ── Was es an Rechnern gibt, als reine Daten ────────────────────────────────
//
// Bewusst ohne JSX und ohne React-Import: diese Datei wird von den
// Prerender-Skripten unter scripts/ mitgelesen (Node, kein Browser), genau wie
// data.ts und articles.ts. Die Zuordnung Slug → Komponente liegt getrennt
// davon in components/tools/registry.tsx.
//
// `answer` ist nicht Deko. Die vorgerenderte Seite besteht daraus. Eine
// Rechnerseite, die im Roh-HTML nur eine leere Huelle mit Widget ausliefert,
// hat fuer Google und fuer KI-Antwortmaschinen keinen Inhalt — es gaebe nichts
// zu ranken und nichts zu zitieren. Der Text muss die Frage also auch ohne
// JavaScript beantworten.

export interface ToolEntry {
  slug: string;
  /** Kurzes Wort fuer Reiter, Punkte und Navigation. */
  label: string;
  labelEn: string;
  /** Die Frage, die der Rechner beantwortet. Steht auf dem Deckel im Deck. */
  cover: string;
  coverEn: string;
  hint: string;
  hintEn: string;
  /** <title> und Meta-Description der eigenen Seite. */
  title: string;
  description: string;
  h1: string;
  lead: string;
  /** Die Antwort im Klartext — Rumpf der vorgerenderten Seite. */
  answer: string[];
  /** Passender Blogartikel, fuer die gegenseitige Verlinkung. */
  article?: string;
  /** Weiterfuehrender Link auf der Seite. */
  next?: { href: string; label: string };
}

export const TOOLS: ToolEntry[] = [
  {
    slug: 'intervall',
    label: 'Intervall', labelEn: 'Interval',
    cover: 'Wann muss ich rewaxen?', coverEn: 'When do I re-wax?',
    hint: 'Dein Intervall in Wochen — nach Wetter, Gelände und Kilometern.',
    hintEn: 'Your interval in weeks — from weather, terrain and distance.',
    title: 'Rewax-Intervall berechnen: Wann muss die Kette neu gewachst werden? | Waxcelerate',
    description: 'Kostenloser Rechner: Wetter, Gelände und Wochenkilometer eingeben und das Rewax-Intervall in Wochen samt Termin für den Kalender erhalten.',
    h1: 'Wann muss ich meine Kette neu wachsen?',
    lead: 'Das Intervall hängt an drei Dingen: wie nass es ist, worauf du fährst und wie viel du fährst. Der Rechner setzt sie zusammen und gibt dir ein Datum, das du direkt in den Kalender legen kannst.',
    answer: [
      'Als Faustwerte für eine Wachsung gelten: trocken auf der Straße rund 500 km, gemischt rund 350 km, bei Nässe rund 250 km. Auf Gravel liegen die Werte bei 350, 250 und 180 km, im MTB-Einsatz bei 250, 180 und 120 km.',
      'Diese Kilometer teilst du durch deine Wochenleistung — das Ergebnis ist dein Intervall in Wochen. Bei 100 km pro Woche auf trockener Straße sind das rund fünf Wochen.',
      'Über etwa ein halbes Jahr hinaus ist das Intervall keine sinnvolle Angabe mehr: Wachs altert auch ohne Kilometer, und Standzeit im Regen zählt mit.',
      'Ein sicheres Zeichen, unabhängig vom Rechner: sobald die Kette anfängt, hörbar trocken zu laufen, ist sie überfällig. Ein leichtes Klappern der Rollen dagegen ist bei Wachs normal.',
    ],
    article: 'kettenlaufzeit-heisswachs',
    next: { href: '/rechner/ersparnis', label: 'Was Ketten im Wechsel sparen' },
  },
  {
    slug: 'verschleiss',
    label: 'Verschleiß', labelEn: 'Wear',
    cover: 'Muss meine Kette raus?', coverEn: 'Does my chain need replacing?',
    hint: 'Messwert eingeben — Urteil, Kassettenrisiko und Kostenfolge.',
    hintEn: 'Enter your measurement — verdict, cassette risk and cost.',
    title: 'Kettenverschleiß-Rechner: Wann muss die Fahrradkette gewechselt werden? | Waxcelerate',
    description: 'Messwert über 12 Glieder oder Lehrenwert eingeben: Längung in Prozent, Tauschempfehlung nach Gangzahl und ob die Kassette mit muss.',
    h1: 'Kettenverschleiß berechnen',
    lead: 'Eine gelängte Kette frisst die Kassette mit. Ob dich der Wechsel 45 € oder 130 € kostet, entscheidet sich an einem halben Prozent — deshalb lohnt das Messen.',
    answer: [
      'Gemessen wird über 12 Glieder, von Bolzenmitte zu Bolzenmitte. Neu sind das exakt 152,4 mm, weil eine Fahrradkette eine Teilung von einem halben Zoll (12,7 mm) hat. Jede Abweichung nach oben ist die Längung.',
      'Die Tauschgrenze hängt an der Gangzahl: bei 11- und 12-fach-Antrieben ab 0,5 % Längung, bei 9- und 10-fach ab 0,75 %, bei älteren 5- bis 8-fach-Antrieben ab 1,0 %. Je schmaler die Kette, desto früher.',
      'Bis 0,5 % bei 12-fach reicht in aller Regel der Kettentausch, die Kassette darf bleiben. Ab etwa 1,0 % Längung ist die Kassette mit hoher Wahrscheinlichkeit mitgelaufen und muss mit — das ist der teure Fall.',
      'Eine einfache Kettenlehre kostet rund 8 € und amortisiert sich beim ersten vermiedenen Kassettentausch. Wichtig: viele Lehren mit zwei Enden messen 0,75 % und 1,0 % — für 12-fach brauchst du eine, die 0,5 % anzeigt.',
      'Gewachste Ketten längen sich langsamer als geölte, weil trockenes Wachs deutlich weniger Schleifpaste aus Staub und Abrieb bindet. Das verschiebt den Zeitpunkt, es ersetzt das Messen nicht.',
    ],
    article: 'kettenverschleiss-messen',
    next: { href: '/rechner/passende-kette', label: 'Passende Kette finden' },
  },
  {
    slug: 'kettenlaenge',
    label: 'Kettenlänge', labelEn: 'Chain length',
    cover: 'Wie viele Glieder?', coverEn: 'How many links?',
    hint: 'Kettenstrebe, größtes Kettenblatt, größtes Ritzel — fertig.',
    hintEn: 'Chainstay, biggest chainring, biggest sprocket — done.',
    title: 'Kettenlänge berechnen: Gliederzahl für dein Fahrrad | Waxcelerate',
    description: 'Kettenstrebe, größtes Kettenblatt und größtes Ritzel eingeben und die passende Gliederzahl nach der Standardformel erhalten.',
    h1: 'Kettenlänge berechnen',
    lead: 'Eine neue Kette kommt zu lang. Wie viele Glieder du herausnimmst, sagt dir diese Formel — sie braucht drei Zahlen, die du am Rad ablesen oder nachschlagen kannst.',
    answer: [
      'Die Formel lautet: Glieder = 0,157 × Kettenstrebe in mm + Zähne des größten Kettenblatts ÷ 2 + Zähne des größten Ritzels ÷ 2 + 2. Der Faktor 0,157 ist 2 ÷ 12,7 — zwei Glieder je Zoll Kettenstrebe.',
      'Das Ergebnis wird immer auf eine gerade Zahl aufgerundet. Eine Kette besteht abwechselnd aus Innen- und Außenlaschenpaaren, eine ungerade Gliederzahl lässt sich nicht schließen.',
      'Die Kettenstrebe misst du von der Mitte des Tretlagers zur Mitte der Hinterachse. Typisch sind 405 bis 425 mm am Rennrad und 425 bis 445 mm am Mountainbike.',
      'Gegenprobe ohne Formel: Kette auf das größte Kettenblatt und das größte Ritzel legen, ohne sie durch das Schaltwerk zu führen, beide Enden straff zusammenziehen und zwei Glieder zugeben. Bei langem Schaltwerkskäfig oder Vollfederung ist diese Probe der Formel überlegen.',
      'Unsere vorgewachsten Ketten kommen mit 114 bis 138 Gliedern, je nach Modell. Kürzen kannst du sie ohne das Wachs zu beschädigen — der Wachsfilm sitzt in der Kette, nicht nur außen darauf.',
    ],
    next: { href: '/rechner/passende-kette', label: 'Passende Kette finden' },
  },
  {
    slug: 'passende-kette',
    label: 'Passende Kette', labelEn: 'Matching chain',
    cover: 'Welche Kette passt?', coverEn: 'Which chain fits?',
    hint: 'Antrieb und Gangzahl wählen — wir zeigen, was passt.',
    hintEn: 'Pick drivetrain and speeds — we show what fits.',
    title: 'Welche Fahrradkette passt zu meinem Antrieb? Kompatibilität prüfen | Waxcelerate',
    description: 'Antrieb und Gangzahl auswählen und sehen, welche vorgewachsten Ketten zu Shimano, SRAM oder Campagnolo in 11- oder 12-fach passen.',
    h1: 'Welche Kette passt zu meinem Rad?',
    lead: 'Bis 11-fach ist fast alles mit allem kombinierbar. Ab 12-fach wird es eng — hier siehst du direkt, was zu deinem Antrieb passt.',
    answer: [
      'Entscheidend sind zwei Angaben: die Gangzahl hinten und der Hersteller deiner Schaltung. Die Gangzahl bestimmt die Kettenbreite, der Hersteller ab 12-fach das Profil.',
      'Bis einschließlich 11-fach lassen sich Ketten von Shimano, SRAM, Campagnolo und Drittanbietern wie YBN weitgehend untereinander tauschen. Die Innenmaße sind gleich, nur die Laschendicke unterscheidet sich.',
      'Ab 12-fach haben die Hersteller ihre Systeme auseinanderentwickelt. Hier bleibst du entweder beim Hersteller deiner Schaltung oder nimmst gezielt eine Kette, die ausdrücklich als systemübergreifend ausgewiesen ist.',
      'Die Gangzahl liest du an der Kassette ab, indem du die Ritzel zählst. Steht auf dem Schaltwerk eine Modellnummer, hilft auch die: M8100 und M7100 sind 12-fach, HG701 ist 11-fach.',
      'Vorgewachste Ketten sind ab Werk entfettet und heißgewachst. Du kürzt sie auf deine Länge und montierst sie — das erste Entfetten, das bei einer neuen Kette sonst Pflicht ist, entfällt.',
    ],
    article: 'vorgewachste-kette',
    next: { href: '/rechner/kettenlaenge', label: 'Kettenlänge berechnen' },
  },
  {
    slug: 'umstieg',
    label: 'Umstieg', labelEn: 'Switching',
    cover: 'Was kostet der Umstieg?', coverEn: 'What does switching cost?',
    hint: 'Erstausstattung, laufende Kosten und ab wann es sich rechnet.',
    hintEn: 'Starting kit, running cost, and when it pays off.',
    title: 'Umstieg auf Heißwachs: Was kostet der Einstieg wirklich? | Waxcelerate',
    description: 'Erstausstattung, laufende Kosten pro Jahr und der Punkt, ab dem sich Heißwachs gegenüber Kettenöl rechnet — mit deinen eigenen Kilometern.',
    h1: 'Was kostet der Umstieg auf Heißwachs?',
    lead: 'Der Einstieg kostet einmalig mehr als eine Flasche Öl. Danach dreht es sich um — hier siehst du, ab wann.',
    answer: [
      'Einmalig brauchst du einen Wachsblock, eine Quick-Link-Zange und einen Draht zum Aufhängen. Einen Topf musst du meist nicht kaufen: ein alter Reiskocher oder Slow Cooker reicht völlig.',
      'Ein 500-g-Block hält 20 bis 32 Wachsungen. Bei 100 km pro Woche auf trockener Straße reicht das über eine ganze Saison hinaus.',
      'Laufend ist Wachs je Anwendung teurer als ein Tropfen Öl, aber du wachst deutlich seltener als du ölst — und der eigentliche Unterschied liegt ohnehin nicht beim Schmierstoff, sondern bei Kette und Kassette.',
      'Der Umstieg lohnt sich rechnerisch über den Verschleiß: eine gewachste Kette hält länger, und die Kassette hält deutlich länger, weil trockenes Wachs keinen Schleifschlamm aus Staub und Abrieb bildet.',
      'Wichtig beim ersten Mal: eine neue Kette muss vor dem Wachsen vollständig entfettet werden. Fabrikfett blockiert das Wachs komplett. Wer sich das sparen will, nimmt eine bereits vorgewachste Kette.',
    ],
    article: 'von-oel-auf-wachs-umsteigen',
    next: { href: '/starter-set', label: 'Starter-Set ansehen' },
  },
  {
    slug: 'ersparnis',
    label: 'Ersparnis', labelEn: 'Savings',
    cover: 'Rotation & Ersparnis', coverEn: 'Rotation & savings',
    hint: 'Was zwei oder drei Ketten im Wechsel pro Jahr sparen.',
    hintEn: 'What rotating two or three chains saves per year.',
    title: 'Kettenrotation: Was zwei oder drei Ketten im Wechsel sparen | Waxcelerate',
    description: 'Jahreskosten des Antriebs mit Wachs gegen Kettenöl, für eine, zwei oder drei rotierte Ketten — mit offengelegten Annahmen.',
    h1: 'Rotation und Ersparnis',
    lead: 'Mehrere Ketten im Wechsel bedeuten seltener wachsen und gleichmäßigeren Verschleiß. Was das im Jahr ausmacht, hängt an deinen Kilometern.',
    answer: [
      'Beim Rotieren fährst du zwei oder drei Ketten abwechselnd und wachst sie gemeinsam. Jede einzelne läuft dadurch weniger Kilometer zwischen zwei Wachsungen, und die Kassette sieht nie eine stark gelängte Kette.',
      'Der Effekt ist doppelt: du wachst seltener, weil du zwischendurch nur die Kette tauschst, und Kette wie Kassette halten länger, weil keine von beiden über ihre Verschleißgrenze hinaus läuft.',
      'Ab welcher Laufleistung sich das lohnt, ist eine reine Rechenfrage. Unter etwa 2.500 km im Jahr trägt eine zweite Kette sich nicht; ab rund 8.000 km rechnen sich drei.',
      'Alle Zahlen im Rechner beruhen auf marktüblichen Annahmen zu Preisen und Laufleistungen, nicht auf eigenen Messungen. Sie stehen auf der Seite unter „Womit gerechnet wird" vollständig offen.',
    ],
    article: 'kettenlaufzeit-heisswachs',
    next: { href: '/rechner/intervall', label: 'Rewax-Intervall berechnen' },
  },
];

export function getToolBySlug(slug: string): ToolEntry | undefined {
  return TOOLS.find(t => t.slug === slug);
}

export const TOOLS_HUB = {
  title: 'Fahrrad-Rechner: Verschleiß, Kettenlänge, Intervall und Kosten | Waxcelerate',
  description: 'Sechs kostenlose Rechner rund um Fahrradkette und Kettenpflege: Verschleiß messen, Kettenlänge bestimmen, passende Kette finden, Rewax-Intervall und Kosten berechnen.',
  h1: 'Rechner rund um die Fahrradkette',
  lead: 'Sechs Werkzeuge für die Fragen, die beim Schrauben wirklich aufkommen. Kostenlos, ohne Anmeldung, und die Annahmen hinter jeder Zahl stehen offen da.',
};
