/**
 * Inhalte der Ratgeber-Uebersicht, die nicht zu einem einzelnen Artikel
 * gehoeren: Lernpfad, Symptom-Wegweiser, Zahlen, Beispielfragen.
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
  /** Wo am Antrieb man es bemerkt. Steht an der Markierung in der Grafik. */
  where: string;
  cause: string;
  fix: string;
  slug: string;
  heading: string;
};

/** Die Reihenfolge ist auch die Reihenfolge der Markierungen in der Grafik. */
export const symptoms: Symptom[] = [
  {
    id: 'quietscht',
    label: 'Kette quietscht',
    where: 'Obere Kettenstrecke',
    cause: 'Kurz nach dem Wachsen: Das Wachs ist nie tief eingedrungen, weil das Bad zu kühl oder die Kette zu kurz drin war. Nach 400 km und mehr heißt Quietschen einfach: Sie ist fällig.',
    fix: '10 bis 15 Minuten bei 85 bis 90 °C, bis keine Luftbläschen mehr aufsteigen.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '2. Die Kette quietscht schon nach 50–100 km wieder',
  },
  {
    id: 'blaettert',
    label: 'Wachs blättert ab',
    where: 'Kettenblatt',
    cause: 'In über 90 % der Fälle nicht gründlich genug entfettet. Wachs haftet nicht auf Öl und bricht beim ersten Pedalieren wieder ab.',
    fix: 'Isopropanol ab 90 %, 2 bis 3 Durchgänge im verschlossenen Glas, bis die Flüssigkeit klar bleibt.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '1. Das Wachs blättert ab oder hält nicht, woran liegt das?',
  },
  {
    id: 'pulver',
    label: 'Weißes Pulver, steife Kette',
    where: 'Untere Kettenstrecke',
    cause: 'Völlig normal. Überschüssiges Außenwachs bricht beim Einfahren ab, das wirksame Wachs sitzt geschützt in den Gelenken.',
    fix: 'Kette 10 bis 20 Mal durch die Hände laufen lassen, dann fahren. Nach 20 bis 30 km ist es vorbei.',
    slug: 'erste-fahrt-nach-wachsen',
    heading: 'Normal: Weißes Pulver rieselt ab',
  },
  {
    id: 'rost',
    label: 'Rost an den Laschen',
    where: 'Außenlaschen',
    cause: 'Wachs hinterlässt außen keinen dauerhaften Feuchtigkeitsfilm wie Öl. Funktional harmlos, solange die Gelenke innen gewachst sind.',
    fix: 'Nach Nässe kurz trockenreiben. Bei Streusalz öfter nachwachsen, etwa alle 100 bis 150 km.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '5. Die Kette rostet an den Außenlaschen',
  },
  {
    id: 'schaltung',
    label: 'Schaltet schlechter',
    where: 'Schaltwerk',
    cause: 'Nach dem Umstieg von Öl sitzt der Fehler oft nicht an der Kette: Ölreste an Kassette und Kettenblättern kontaminieren sie sofort wieder.',
    fix: 'Den ganzen Antrieb entfetten, nicht nur die Kette. Danach 20 bis 30 km einfahren.',
    slug: 'wachs-haelt-nicht-haeufige-fehler',
    heading: '7. Die Schaltung läuft nach dem Wechsel auf Wachs schlechter',
  },
  {
    id: 'verschleiss',
    label: 'Springt, wirkt gelängt',
    where: 'Kassette',
    cause: 'Die Kette ist in den Gelenken verschlissen. Grenze: 0,5 % Dehnung bei 11- und 12-fach, 0,75 % bei 9- und 10-fach.',
    fix: 'Mit einer Kettenlehre für wenige Euro messen. Fällt der Messzahn bündig in die Lücke, ist sie fällig.',
    slug: 'kettenverschleiss-messen',
    heading: 'So misst du den Verschleiß',
  },
];

export type HubNumber = { value: string; label: string; note: string; slug: string };

/** Vier Kennzahlen, jede mit dem Artikel, der sie herleitet. */
export const hubNumbers: HubNumber[] = [
  { value: '400–550', label: 'km pro Wachsgang', note: 'trocken. Bei Nässe, Schotter oder MTB 200 bis 300 km.', slug: 'kettenlaufzeit-heisswachs' },
  { value: '2–3×', label: 'Kettenlaufzeit', note: '6.000 bis 12.000 km statt 2.000 bis 3.000 km mit Öl.', slug: 'kettenverschleiss-messen' },
  { value: '4–5 W', label: 'weniger Reibung', note: 'rund 2 % der Tretleistung. Für Rennfahrer relevant, für den Alltag kein Kaufargument.', slug: 'heisswachs-vs-fluessigwachs' },
  { value: '> 90 %', label: 'aller Fehler', note: 'liegen am Entfetten, wenn Wachs nicht hält.', slug: 'fahrradkette-entfetten' },
];

/** Tippt der Platzhalter der Suche nacheinander. Bewusst so formuliert, wie
 *  echte Leser fragen, nicht wie Artikel heissen: das Feld soll zeigen, dass
 *  man in eigenen Worten fragen darf. Jede davon ist in check-search.mjs
 *  abgesichert. */
export const typewriterQuestions = [
  'meine Hose wird schwarz',
  'wie oft muss ich nachwachsen?',
  'Kette quietscht nach 50 km',
  'kann ich einen Reiskocher nehmen?',
  'weißes Pulver, ist das normal?',
  'funktioniert Wachs im Winter?',
];

/** Klickbare Beispielfragen unter dem Suchfeld. */
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
