/**
 * Ein Tokenizer fuer Index UND Anfrage.
 *
 * Das ist die wichtigste Regel dieser Datei: der Index wird zur Build-Zeit
 * (scripts/generate-search-index.mjs) mit exakt denselben Funktionen zerlegt
 * wie die Nutzeranfrage zur Laufzeit. Weicht auch nur der Stemmer ab, trifft
 * "Ketten" nicht mehr auf "Kette" und die Suche wirkt kaputt, ohne dass ein
 * Fehler geworfen wird. Deshalb liegt beides hier und nirgends sonst.
 *
 * Deutsch braucht drei Dinge, die eine reine Substring-Suche nicht kann:
 *   1. Umlaut-/ss-Faltung   — "verschleiss" muss "Verschleiß" finden
 *   2. leichtes Stemming    — "gewachste Ketten" -> "wachs", "kett"
 *   3. Kompositazerlegung   — "Kettenwachs" muss auch auf "Wachs" treffen
 * Punkt 3 ist der eigentliche Knackpunkt: im Deutschen verschwindet das
 * gesuchte Wort im Kompositum. Wer "Wachstopf" tippt, sucht Artikel ueber
 * "Topf". Ein englischer Tokenizer trennt das nie.
 */

/** Basiswoerter der Domaene, an denen Komposita getrennt werden.
 *  Bewusst klein gehalten: nur Woerter, die in den Artikeln tatsaechlich als
 *  eigenstaendiger Begriff vorkommen. Eine grosse Liste erzeugt Falschtrennungen
 *  ("Wachstum" -> "wachs" + "tum"), eine kleine nur weniger Treffer.
 *  Reihenfolge egal, die Zerlegung probiert immer das laengste Teilwort zuerst. */
export const COMPOUND_PARTS = [
  'fahrrad', 'kette', 'ketten', 'wachs', 'wachsen', 'heisswachs', 'tropfwachs',
  'fluessigwachs', 'paraffin', 'oel', 'schmier', 'schmierung', 'reibung',
  'verschleiss', 'laufzeit', 'lebensdauer', 'intervall', 'topf', 'becken',
  'reiniger', 'entfetten', 'entfetter', 'bremsenreiniger', 'alkohol',
  'schloss', 'verschluss', 'quicklink', 'glied', 'bolzen', 'huelse', 'rolle',
  'kassette', 'ritzel', 'blatt', 'blaetter', 'antrieb', 'schaltung',
  'rennrad', 'gravel', 'mtb', 'bike', 'rad', 'winter', 'sommer', 'saison',
  'regen', 'schnee', 'salz', 'staub', 'dreck', 'schmutz', 'sauber',
  'werkzeug', 'zange', 'lehre', 'messer', 'pflege', 'service', 'set',
  'watt', 'leistung', 'kosten', 'preis', 'geld',
] as const;

/** Suffixe, die abgeschnitten werden, laengste zuerst.
 *  Bewusst KEIN vollstaendiger Snowball-Stemmer: der wuerde hier mehr
 *  zusammenwerfen als helfen (z. B. "Wachs"/"wachsen"/"Wachstum") und waere
 *  600 Zeilen, die niemand mehr prueft. Diese acht Endungen decken die Faelle
 *  ab, die in echten Suchanfragen vorkommen (Plural, Genitiv, Adjektivendung). */
const SUFFIXES = ['ungen', 'ung', 'ern', 'end', 'em', 'en', 'er', 'es', 'e', 'n', 's'];

/** Endungen, nach denen ein blankes -s NICHT abgeschnitten werden darf.
 *
 *  Teuer gelernt: "Wachs" wurde zu "wach" gestemmt. Damit traf das wichtigste
 *  Wort der ganzen Seite per Praefixsuche auf "Wachsbad", "Wachstopf",
 *  "Wachsrest" — also auf jeden Artikel gleich stark, und das Ranking war bei
 *  jeder Anfrage mit "Wachs" darin praktisch zufaellig.
 *
 *  Der deutsche Plural auf -s ist ohnehin die Ausnahme (Autos, Handys); die
 *  Regelfaelle -e/-en/-er sind oben abgedeckt. Nach diesen Endungen ist ein
 *  -s deshalb fast immer Wortbestandteil, nicht Flexion. */
const KEEP_TRAILING_S = ['chs', 'ss', 'is', 'us', 'as', 'os', 'ls', 'rs'];

/** Sehr haeufige Woerter ohne Trennschaerfe. Fliegen aus Index und Anfrage,
 *  damit "wie oft muss ich die kette wachsen" nicht an "wie/oft/muss/ich/die"
 *  haengen bleibt und jeden Artikel gleich gut trifft. */
const STOPWORDS = new Set([
  'und', 'oder', 'aber', 'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine',
  'einen', 'einem', 'einer', 'eines', 'ist', 'sind', 'war', 'waren', 'wird',
  'werden', 'wurde', 'hat', 'habe', 'haben', 'hatte', 'kann', 'koennen', 'muss',
  'muessen', 'soll', 'sollen', 'darf', 'will', 'ich', 'du', 'er', 'sie', 'es',
  'wir', 'ihr', 'man', 'mein', 'meine', 'meinen', 'dein', 'sich', 'mir', 'mich',
  'dir', 'dich', 'fuer', 'mit', 'von', 'vom', 'zum', 'zur', 'auf', 'aus', 'bei',
  'nach', 'ueber', 'unter', 'vor', 'an', 'am', 'im', 'in', 'zu', 'als', 'wie',
  'was', 'wer', 'wo', 'wann', 'warum', 'welche', 'welcher', 'welches', 'nicht',
  'auch', 'noch', 'nur', 'schon', 'sehr', 'mehr', 'dann', 'denn', 'doch', 'so',
  'wenn', 'weil', 'dass', 'ob', 'man', 'etwas', 'alle', 'alles', 'jede', 'jeder',
  'the', 'and', 'for', 'with', 'you', 'your',
  // Fuellwoerter aus echten Fragen. Sie stehen in fast jedem Artikel und in
  // fast jeder Alias-Phrase und verwaessern dadurch das Ranking: "wie oft muss
  // ich neu wachsen" landete ueber das blosse "oft" beim Kettenschloss-Artikel
  // ("wie oft darf ich den Link wiederverwenden"). Die Bedeutung dieser
  // Wendungen steckt ohnehin in den Phrasen-Triggern von synonyms.ts, die auf
  // der ungefilterten Rohanfrage arbeiten.
  'oft', 'lange', 'viel', 'viele', 'mal', 'wieder', 'immer', 'eigentlich',
  'ueberhaupt', 'richtig', 'gut', 'damit', 'dafuer', 'davon', 'dabei', 'daran',
  'bitte', 'danke', 'gibt', 'macht', 'machen', 'geht', 'tun',
]);

/**
 * Umlaute/ss falten, Akzente entfernen, alles klein.
 * Wichtig fuer die Realitaet auf Mobilgeraeten: viele tippen "verschleiss",
 * "oel", "muell" statt der Umlaute. Ohne diese Faltung waere das ein Nulltreffer.
 */
export function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Endungen abschneiden, aber nie unter vier Zeichen — sonst wird aus "Oele"
 *  ein "O" und der Token trifft alles. */
function stem(token: string): string {
  if (token.length <= 4) return token;
  for (const suffix of SUFFIXES) {
    if (token.length - suffix.length < 4 || !token.endsWith(suffix)) continue;
    if (suffix === 's' && KEEP_TRAILING_S.some((end) => token.endsWith(end))) continue;
    return token.slice(0, token.length - suffix.length);
  }
  return token;
}

/**
 * Kompositum in bekannte Basiswoerter zerlegen.
 * Greedy von links, immer das laengste passende Teilwort. Bleibt ein Rest
 * uebrig, der zu keinem Basiswort passt, gilt die Zerlegung als
 * fehlgeschlagen und das Wort bleibt ganz — lieber gar nicht trennen als
 * falsch trennen.
 */
function splitCompound(token: string): string[] {
  if (token.length < 8) return [];
  const parts: string[] = [];
  let rest = token;
  const byLength = [...COMPOUND_PARTS].sort((a, b) => b.length - a.length);

  while (rest.length > 0) {
    // Fugen-s zwischen zwei Teilen ("Verschleissmessung") ueberspringen.
    if (parts.length > 0 && rest.startsWith('s') && rest.length > 1) {
      const withoutS = rest.slice(1);
      if (byLength.some((p) => withoutS.startsWith(p))) rest = withoutS;
    }
    const hit = byLength.find((p) => rest.startsWith(p) && p.length >= 3);
    if (!hit) return parts.length >= 2 ? parts : [];
    parts.push(hit);
    rest = rest.slice(hit.length);
  }
  return parts.length >= 2 ? parts : [];
}

/**
 * Freitext in durchsuchbare Tokens zerlegen.
 * Rueckgabe enthaelt sowohl den gestemmten Volltoken als auch — falls
 * zerlegbar — seine Bestandteile, damit "Wachstopf" gleichzeitig auf
 * "wachstopf", "wachs" und "topf" matcht.
 */
export function tokenize(input: string): string[] {
  const out: string[] = [];
  const raw = fold(input).split(/[^a-z0-9µ]+/).filter(Boolean);

  for (const word of raw) {
    if (STOPWORDS.has(word)) continue;
    // Reine Zahlen bleiben erhalten ("400", "12000") — Nutzer suchen danach.
    if (/^\d+$/.test(word)) { out.push(word); continue; }
    if (word.length < 2) continue;

    const stemmed = stem(word);
    // Auch nach dem Stemmen pruefen: "vielen" wird erst hier zu "viel" und
    // haette die Stoppwortliste sonst unbemerkt passiert.
    if (STOPWORDS.has(stemmed)) continue;
    out.push(stemmed);
    for (const part of splitCompound(word)) {
      const partStem = stem(part);
      if (partStem !== stemmed) out.push(partStem);
    }
  }
  return out;
}

/** MiniSearch erwartet einen Tokenizer, der die Rohzeichenkette zerlegt, und
 *  einen separaten Prozessor pro Token. Da `tokenize` bereits stemmt und
 *  zerlegt, ist der Prozessor die Identitaet — sonst wuerde zweimal gestemmt. */
export const searchTokenize = (text: string): string[] => tokenize(text);
export const searchProcess = (token: string): string => token;
