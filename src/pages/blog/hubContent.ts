/**
 * Inhalte der Ratgeber-Uebersicht, die nicht zu einem einzelnen Artikel
 * gehoeren: Lernpfad, Symptom-Wegweiser, Beispielfragen.
 *
 * Getrennt von den Komponenten aus zwei Gruenden: generate-blog-html.mjs
 * rendert Lernpfad und Symptome ins statische HTML (Crawler ohne JS sollen sie
 * sehen), und es gilt dieselbe Regel wie fuer articles.ts: kein Inhalt im JSX.
 *
 * Jede Aussage hier stammt aus dem verlinkten Artikel (Takeaways, FAQ oder
 * Abschnittstext). Wer eine Zahl im Artikel aendert, aendert sie hier mit.
 * `heading` muss wortgleich einer <h2> des Artikels entsprechen, daraus wird
 * der Sprunganker (headingId). scripts/check-search.mjs prueft das.
 */
import type { ArticleCategory } from './articles';

export type PathStep = { slug: string; why: string };

/** "Von Öl zu Wachs": die Reihenfolge, in der ein Umsteiger die Artikel
 *  wirklich braucht, nicht die Reihenfolge, in der sie geschrieben wurden. */
export const learningPath: PathStep[] = [
  { slug: 'von-oel-auf-wachs-umsteigen', why: 'Alte Kette behalten oder neu starten? Was beim Umstieg auf dich zukommt.' },
  { slug: 'fahrradkette-entfetten', why: 'Der Schritt, an dem Heißwachs steht oder fällt. In über 90 % der Fälle liegt es hier.' },
  { slug: 'heisswachs-anleitung', why: '85 bis 90 °C, 10 bis 15 Minuten, unter 20 Minuten aktive Zeit.' },
  { slug: 'erste-fahrt-nach-wachsen', why: 'Weißes Pulver, steife Kette: was normal ist und was nicht.' },
  { slug: 'kettenlaufzeit-heisswachs', why: 'Wann nachwachsen, wie lange die Kette hält, was es spart.' },
];

export type SymptomId = 'quietscht' | 'blaettert' | 'pulver' | 'rost' | 'schaltung' | 'verschleiss';

export type Symptom = {
  id: SymptomId;
  label: string;
  /** Wo man es am Rad bemerkt. */
  where: string;
  /** Wo die Ursache sitzt. Oft nicht dort, wo man es merkt (Schaltung). */
  causeAt: string;
  cause: string;
  fix: string;
  slug: string;
  heading: string;
};

export const symptoms: Symptom[] = [
  {
    id: 'quietscht',
    label: 'Kette quietscht',
    where: 'Kettengelenke, unter Last',
    causeAt: 'Zu wenig Wachs in den Gelenken',
    cause: 'Kurz nach dem Wachsen: Das Wachs ist nie tief eingedrungen, weil das Bad zu kühl oder die Kette zu kurz drin war. Nach einem vollen Intervall (trocken 400–550 km, nass 200–300 km) heißt Quietschen einfach: Sie ist fällig.',
    fix: '10 bis 15 Minuten bei 85 bis 90 °C, bis keine Luftbläschen mehr aufsteigen.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '2. Die Kette quietscht schon nach 50–100 km wieder',
  },
  {
    id: 'blaettert',
    label: 'Wachs blättert ab',
    where: 'Laschen und Rollen der Kette',
    causeAt: 'Ölreste unter dem Wachs',
    cause: 'In über 90 % der Fälle nicht gründlich genug entfettet. Wachs haftet nicht auf Öl und bricht beim ersten Pedalieren wieder ab.',
    fix: 'Isopropanol ab 90 %, 2 bis 3 Durchgänge im verschlossenen Glas, bis die Flüssigkeit klar bleibt.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '1. Das Wachs blättert ab oder hält nicht, woran liegt das?',
  },
  {
    id: 'pulver',
    label: 'Weißes Pulver, steife Kette',
    where: 'Untere Kettenstrecke',
    causeAt: 'Überschüssiges Außenwachs, kein Fehler',
    cause: 'Völlig normal. Überschüssiges Außenwachs bricht beim Einfahren ab, das wirksame Wachs sitzt geschützt in den Gelenken.',
    fix: 'Kette montieren und ein paar Minuten locker einfahren. Nach 20 bis 30 km ist es vorbei.',
    slug: 'erste-fahrt-nach-wachsen',
    heading: 'Normal: Weißes Pulver rieselt ab',
  },
  {
    id: 'rost',
    label: 'Rost an den Laschen',
    where: 'Außenlaschen',
    causeAt: 'Nässe auf der Stahloberfläche',
    cause: 'Wachs hinterlässt außen keinen dauerhaften Feuchtigkeitsfilm wie Öl. Funktional harmlos, solange die Gelenke innen gewachst sind.',
    fix: 'Nach Nässe nie nass wegstellen, sondern kurz trockenreiben. Wer oft im Nassen fährt, profitiert von der MoS₂-Variante, deren Film direkter auf dem Stahl haftet.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '5. Die Kette rostet an den Außenlaschen',
  },
  {
    id: 'schaltung',
    label: 'Schaltet schlechter',
    where: 'Schaltwerk, beim Gangwechsel',
    causeAt: 'Ölreste an Kassette und Kettenblatt',
    cause: 'Nach dem Umstieg von Öl sitzt der Fehler oft nicht an der Kette: Ölreste an Kassette und Kettenblättern kontaminieren sie sofort wieder.',
    fix: 'Den ganzen Antrieb entfetten, nicht nur die Kette. Danach 20 bis 30 km einfahren.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '7. Die Schaltung läuft nach dem Wechsel auf Wachs schlechter',
  },
  {
    // Zwei Faelle, die sich gleich anfuehlen: frisch gewachst sind die Glieder
    // verklebt (wachs-haelt-nicht, Abschnitt 3), nach vielen km ist die Kette
    // gedehnt. Nur den Verschleiss zu nennen, schickte Einsteiger zur Lehre.
    id: 'verschleiss',
    label: 'Kette springt',
    where: 'Kassette, unter Last',
    causeAt: 'Steife Glieder oder gedehnte Gelenke',
    cause: 'Frisch gewachst: Die Glieder sind vom erstarrten Paraffin noch verklebt, das ist normal. Nach vielen Kilometern: Die Kette ist in den Gelenken verschlissen. Grenze 0,5 % Dehnung bei 11- und 12-fach, 0,75 % bei 9- und 10-fach.',
    fix: 'Frisch gewachst: montieren und ein paar Minuten einfahren, dann löst sich die Steifigkeit. Sonst mit einer Kettenlehre messen. Fällt der Messzahn bündig in die Lücke, ist sie fällig.',
    slug: 'kettenverschleiss-messen',
    heading: 'So misst du den Verschleiß',
  },
];

/** Klickbare Beispielfragen unter dem Suchfeld. Bewusst so formuliert, wie
 *  echte Leser fragen, nicht wie Artikel heissen. Jede davon ist in
 *  check-search.mjs abgesichert. */
export const suggestedQuestions = [
  'Wie oft nachwachsen?',
  'Kette quietscht',
  'Welcher Topf?',
  'Classic oder Pro?',
  'Wachs im Winter',
];

/** Kurztext pro Kategorie fuer die Archiv-Filter. */
export const categoryBlurb: Record<ArticleCategory, string> = {
  Grundlagen: 'Wie Wachs funktioniert',
  Anleitung: 'Schritt für Schritt',
  Technik: 'Physik und Messwerte',
  Kaufberatung: 'Was du brauchst',
  'Problemlösung': 'Wenn es hakt',
  Saison: 'Winter und Nässe',
};
