/**
 * Die Suchmaschine der Ratgeber-Seite.
 *
 * Aufbau in drei Laeufen ueber denselben MiniSearch-Index, deren Ergebnisse
 * gewichtet zusammengefuehrt werden:
 *
 *   1. STRENG    — alle Suchwoerter muessen vorkommen (AND). Das ist der
 *                  praezise Treffer; wer "kette entfetten" tippt, will genau
 *                  den Artikel, in dem beides steht.
 *   2. LOCKER    — irgendeines der Woerter (OR). Faengt lange, natuerlich
 *                  formulierte Fragen ab, bei denen nie alle Woerter in einem
 *                  Artikel stehen.
 *   3. ERWEITERT — die ueber synonyms.ts hinzugefuegten Begriffe, OR.
 *                  Das ist die Bruecke von Alltagssprache zu Fachtext.
 *
 * Warum nicht ein Lauf mit allem drin: die Synonyme wuerden dann gleich stark
 * zaehlen wie das, was der Nutzer wirklich getippt hat. Eine Anfrage nach
 * "Topf" landete so schnell bei einem Artikel, der nur "Ausruestung" erwaehnt.
 * Getrennte Laeufe mit fallender Gewichtung halten den woertlichen Treffer
 * immer vorne und nutzen die Synonyme nur als Netz darunter.
 *
 * Die Punktzahlen der drei Laeufe sind nicht vergleichbar (MiniSearch
 * normalisiert nicht ueber Suchaufrufe hinweg), deshalb wird jeder Lauf auf
 * sein eigenes Maximum normiert, bevor gewichtet summiert wird.
 *
 * Auf dem Ranking sitzen drei Dinge, die aus einer Trefferliste eine Antwort
 * machen:
 *   - ABSCHNITT: pro Treffer der Abschnitt (<h2>), in dem die Anfrage am
 *     dichtesten steht. Der Link springt dorthin, nicht an den Artikelanfang.
 *   - ANTWORT:   passt eine FAQ-Frage der obersten Treffer klar zur Anfrage,
 *     steht ihre Antwort als Karte ueber der Liste. Die Antworten sind Lucas
 *     eigene FAQ-Texte aus articles.ts, nichts davon ist generiert.
 *   - VORSCHLAG: bei null Treffern ein "Meintest du …?" aus dem Wortschatz der
 *     Artikel.
 */
import MiniSearch from 'minisearch';
import { fold, tokenize, searchTokenize, searchProcess } from './normalize';
import { expandQuery } from './synonyms';
import { headingId } from '@/pages/blog/headingId';

export type SearchSection = { h: string | null; id: string | null; t: string };

export type SearchDoc = {
  id: string;
  title: string;
  titleShort: string;
  description: string;
  category: string;
  readingTime: string;
  keyStat: { value: string; label: string } | null;
  takeaways: string;
  aliases: string;
  sections: SearchSection[];
  faq: { q: string; a: string }[];
};

export type SearchIndexPayload = {
  v: number;
  generatedAt: string;
  categories: string[];
  docs: SearchDoc[];
};

/** Ein Schnipsel-Stueck. `hit` markiert die Woerter, die getroffen haben —
 *  die Komponente rendert sie als <mark>. */
export type SnippetPart = { text: string; hit: boolean };

export type SearchHit = {
  slug: string;
  score: number;
  snippet: SnippetPart[] | null;
  /** Abschnitt mit der dichtesten Fundstelle. `id` ist null, wenn die
   *  Fundstelle im Intro oder in der HowTo-Liste liegt (kein eigener Anker). */
  section: { id: string | null; heading: string | null } | null;
};

/** `anchor` zeigt auf die Frage in der sichtbaren FAQ des Artikels. */
export type SearchAnswer = { slug: string; question: string; answer: string; anchor: string };

export type SearchResult = {
  hits: SearchHit[];
  answer: SearchAnswer | null;
  /** Nur bei null Treffern gesetzt. */
  suggestion: string | null;
  /** Gesetzt, wenn ein Tippfehler korrigiert wurde: die tatsaechlich
   *  gesuchte Anfrage, fuer ein "Ergebnisse fuer …" in der Oberflaeche. */
  corrected: string | null;
};

/** Gewichte der Laeufe. Streng > Phrase > locker > erweitert, mit deutlichem
 *  Abstand: ein woertlicher Volltreffer soll nie von einem Synonymtreffer
 *  ueberholt werden koennen. */
const WEIGHT_STRICT = 1;
const WEIGHT_PHRASE = 0.8;
const WEIGHT_LOOSE = 0.5;
const WEIGHT_EXPANDED = 0.3;

/** Treffer unter diesem Anteil des Spitzenreiters fliegen raus. Ohne das
 *  haengt an jeder Anfrage ein Schwanz aus Artikeln, die ein einziges
 *  Allerweltswort teilen — das laesst die Suche schlechter wirken, als sie ist. */
const RELATIVE_CUTOFF = 0.2;

/** Ab diesem Anteil der erreichbaren Punkte gilt eine FAQ-Frage als Antwort.
 *  Darunter lieber keine Karte als eine, die an der Frage vorbeigeht: eine
 *  falsche Antwort kostet mehr Vertrauen als eine fehlende. */
const ANSWER_THRESHOLD = 0.42;

const FIELD_BOOSTS = {
  title: 6,
  titleShort: 5,
  aliases: 4,
  description: 3,
  takeaways: 2.5,
  category: 2,
  body: 1,
};

type IndexedDoc = Omit<SearchDoc, 'sections' | 'faq'> & { body: string };

type PreparedFaq = { q: string; a: string; qTokens: string[]; aTokens: string[]; qFolded: string };

export type SearchEngine = {
  mini: MiniSearch<IndexedDoc>;
  /** Pro Artikel der gefaltete Text aus Titel und Alias-Flaeche, in dem nach
   *  woertlichen Wortgruppen gesucht wird (siehe `phraseRun`). */
  phraseHaystack: Map<string, string>;
  sections: Map<string, (SearchSection & { tokens: string[] })[]>;
  faq: Map<string, PreparedFaq[]>;
  /** Token -> haeufigste Schreibweise im Text, fuer "Meintest du …?".
   *  MiniSearch schlaegt gestemmte Tokens vor ("kett"), angezeigt werden soll
   *  aber ein echtes Wort ("kette"). */
  surface: Map<string, string>;
  /** Wie oft ein Token in allen Artikeln vorkommt. Entscheidet bei der
   *  Tippfehlerkorrektur zwischen mehreren gleich nahen Kandidaten. */
  frequency: Map<string, number>;
};

export function createIndex(payload: SearchIndexPayload): SearchEngine {
  const mini = new MiniSearch<IndexedDoc>({
    fields: ['title', 'titleShort', 'description', 'category', 'takeaways', 'aliases', 'body'],
    storeFields: ['title'],
    // Derselbe Tokenizer wie im Generator. Weicht er ab, trifft nichts mehr —
    // siehe Kommentar in normalize.ts.
    tokenize: searchTokenize,
    processTerm: searchProcess,
  });
  mini.addAll(payload.docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    titleShort: doc.titleShort,
    description: doc.description,
    category: doc.category,
    readingTime: doc.readingTime,
    keyStat: doc.keyStat,
    takeaways: doc.takeaways,
    aliases: doc.aliases,
    body: doc.sections.map((s) => s.t).join(' '),
  })));

  const phraseHaystack = new Map<string, string>();
  const sections = new Map<string, (SearchSection & { tokens: string[] })[]>();
  const faq = new Map<string, PreparedFaq[]>();
  const surfaceCounts = new Map<string, Map<string, number>>();

  const countSurface = (text: string) => {
    for (const word of text.toLowerCase().split(/[^a-zäöüß0-9]+/)) {
      if (word.length < 3) continue;
      const [token] = tokenize(word);
      if (!token) continue;
      const counts = surfaceCounts.get(token) ?? new Map<string, number>();
      counts.set(word, (counts.get(word) ?? 0) + 1);
      surfaceCounts.set(token, counts);
    }
  };

  for (const doc of payload.docs) {
    phraseHaystack.set(doc.id, fold(`${doc.title} ${doc.titleShort} ${doc.aliases}`));
    sections.set(doc.id, doc.sections.map((s) => ({ ...s, tokens: tokenize(s.t) })));
    faq.set(doc.id, doc.faq.map((f) => ({
      ...f,
      qTokens: tokenize(f.q),
      aTokens: tokenize(f.a),
      qFolded: fold(f.q),
    })));
    countSurface(`${doc.title} ${doc.aliases} ${doc.sections.map((s) => s.t).join(' ')}`);
  }

  const surface = new Map<string, string>();
  const frequency = new Map<string, number>();
  for (const [token, counts] of surfaceCounts) {
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    surface.set(token, sorted[0][0]);
    frequency.set(token, sorted.reduce((n, [, c]) => n + c, 0));
  }
  return { mini, phraseHaystack, sections, faq, surface, frequency };
}

type ScoredRun = Map<string, number>;

/** Ein Lauf, auf sein eigenes Maximum normiert (0..1). */
function run(mini: MiniSearch<IndexedDoc>, query: string, options: Parameters<MiniSearch['search']>[1]): ScoredRun {
  const out: ScoredRun = new Map();
  if (!query.trim()) return out;
  const results = mini.search(query, options);
  const max = results[0]?.score ?? 0;
  if (max <= 0) return out;
  for (const r of results) out.set(r.id as string, r.score / max);
  return out;
}

/**
 * Woertliche Wortgruppen gegen Titel und Alias-Flaeche.
 *
 * Die Aliase sind als ganze Fragen geschrieben ("warum ist das wachs
 * schwarz"), nicht als Schlagwortlisten. Genau diese Eigenschaft geht in einer
 * reinen Bag-of-Words-Bewertung verloren: MiniSearch sieht nur fuenf einzelne
 * Woerter und kann nicht wissen, dass sie in dieser Reihenfolge irgendwo
 * wortgleich stehen. Der Artikel ueber die Wachsentsorgung gewann die Anfrage
 * allein deshalb, weil in ihm "Wachs" oefter vorkommt.
 *
 * Deshalb dieser vierte Lauf: die laengste zusammenhaengende Wortgruppe der
 * Anfrage, die woertlich in Titel oder Aliasen steht, zaehlt extra — je
 * laenger die Gruppe im Verhaeltnis zur Anfrage, desto staerker.
 */
function phraseRun(engine: SearchEngine, rawQuery: string): ScoredRun {
  const out: ScoredRun = new Map();
  const words = fold(rawQuery).split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length < 2) return out;

  for (const [id, haystack] of engine.phraseHaystack) {
    let best = 0;
    // Von der laengsten Gruppe abwaerts; die erste gefundene ist die beste.
    for (let size = Math.min(words.length, 6); size >= 2 && best === 0; size -= 1) {
      for (let i = 0; i + size <= words.length; i += 1) {
        if (haystack.includes(words.slice(i, i + size).join(' '))) { best = size; break; }
      }
    }
    if (best >= 2) out.set(id, best / words.length);
  }
  // Auf das eigene Maximum normieren, wie die anderen Laeufe auch.
  const max = Math.max(...out.values(), 0);
  if (max > 0) for (const [id, value] of out) out.set(id, value / max);
  return out;
}

/** Hoechstens ein vertauschter, fehlender oder falscher Buchstabe. */
function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  if (a.length === b.length) {
    // Buchstabendreher ("quitschen" <-> "quietschen" ist ein fehlender,
    // "wahcs" ein vertauschter)
    if (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2)) return true;
    return a.slice(i + 1) === b.slice(i + 1);
  }
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.slice(i) === longer.slice(i + 1);
}

/**
 * Passt ein Anfragetoken auf ein Texttoken? Gleiche Unschaerfe wie im Ranking:
 * Praefix fuer halb getippte Woerter, ein Tippfehler ab fuenf Zeichen. Ohne
 * das zeigten Schnipsel und Abschnittswahl bei "quitscht" nichts an, obwohl
 * das Ranking den richtigen Artikel laengst gefunden hatte.
 */
function tokenMatches(query: string, text: string): boolean {
  if (query === text) return true;
  if (query.length >= 4 && text.startsWith(query)) return true;
  return query.length >= 5 && text.length >= 5 && withinOneEdit(query, text);
}

const matchesAny = (token: string, pool: string[]) => pool.some((t) => tokenMatches(token, t));

/**
 * Schnipsel um die erste Fundstelle bauen.
 *
 * Bewusst wortweise statt ueber Zeichenpositionen: `fold()` aendert die Laenge
 * (ae fuer ae-Umlaut), ein Index aus dem gefalteten Text zeigt im Originaltext
 * also auf die falsche Stelle. Wort fuer Wort vergleichen ist etwas
 * langsamer, aber bei 18 Artikeln irrelevant und immer korrekt.
 */
function buildSnippet(text: string, queryTokens: string[], windowSize = 30): SnippetPart[] | null {
  if (!text || queryTokens.length === 0) return null;
  const words = text.split(/\s+/);
  const isHit = (word: string) => tokenize(word).some((t) => queryTokens.some((q) => tokenMatches(q, t)));

  const first = words.findIndex(isHit);
  if (first === -1) return null;

  const start = Math.max(0, first - Math.floor(windowSize / 3));
  const slice = words.slice(start, start + windowSize);

  const parts: SnippetPart[] = [];
  if (start > 0) parts.push({ text: '… ', hit: false });
  for (const word of slice) {
    const hit = isHit(word);
    const last = parts[parts.length - 1];
    // Aufeinanderfolgende Woerter desselben Typs zusammenfassen, damit nicht
    // jedes Wort ein eigenes DOM-Element wird.
    if (last && last.hit === hit) last.text += ` ${word}`;
    else parts.push({ text: (parts.length ? ' ' : '') + word, hit });
  }
  if (start + windowSize < words.length) parts.push({ text: ' …', hit: false });
  return parts;
}

/**
 * Abschnitt waehlen, in dem die Anfrage am dichtesten steht.
 * Getippte Woerter zaehlen voll, Synonyme zu einem Drittel — sonst gewinnt
 * bei "hose wird schwarz" der Abschnitt, der zufaellig "Schmutz" am
 * haeufigsten sagt, statt der, in dem "Hose" steht. Bei Gleichstand gewinnt
 * der Abschnitt mit Anker, weil der Sprung dorthin mehr bringt als ans Intro.
 */
function bestSection(engine: SearchEngine, slug: string, queryTokens: string[], expanded: string[]) {
  const list = engine.sections.get(slug) ?? [];
  let best: (typeof list)[number] | null = null;
  let bestScore = 0;
  for (const section of list) {
    let score = 0;
    for (const q of queryTokens) if (matchesAny(q, section.tokens)) score += 1;
    for (const e of expanded) if (section.tokens.includes(e)) score += 0.34;
    // Abschnitte ohne Anker (Intro, FAQ, HowTo) nur, wenn sie klar dichter
    // sind: die FAQ wiederholt jedes Stichwort des Artikels einmal und gewann
    // sonst fast jede Anfrage, obwohl der Sprung dorthin nur an den
    // Artikelanfang fuehrt.
    if (!section.id) score *= 0.8;
    // Die FAQ hat seit ihrer Sichtbarkeit einen Anker, bleibt aber leicht
    // hinter echten Abschnitten: dort steht die Antwort ausfuehrlicher.
    else if (section.id === 'haeufige-fragen') score *= 0.85;
    if (score > bestScore) { best = section; bestScore = score; }
  }
  return bestScore >= 0.3 ? best : null;
}

/**
 * Antwortkarte aus der FAQ der obersten Treffer.
 *
 * Nur die ersten zwei Artikel kommen in Frage: eine Antwort aus einem Artikel,
 * den das Ranking selbst auf Platz 5 sieht, widerspraeche der Liste darunter.
 * Treffer in der Frage zaehlen doppelt so viel wie in der Antwort — die Frage
 * ist die Formulierung des Lesers, die Antwort nur ihr Kontext.
 */
function findAnswer(engine: SearchEngine, rawQuery: string, hits: SearchHit[], queryTokens: string[], expanded: string[]): SearchAnswer | null {
  const words = fold(rawQuery).split(/[^a-z0-9]+/).filter(Boolean);
  const bigrams = words.slice(0, -1).map((w, i) => `${w} ${words[i + 1]}`);
  // Erreichbar sind die getippten Woerter voll und hoechstens drei Synonyme:
  // eine Anfrage, die zwei Synonymgruppen ausloest, bekommt schnell zehn
  // Zusatzbegriffe, von denen keine einzelne FAQ-Frage mehr als zwei enthaelt.
  // Die Wortpaare sind reiner Bonus und stehen deshalb nicht im Nenner.
  const reachable = queryTokens.length * 2 + Math.min(expanded.length, 3) * 0.7;
  if (reachable === 0) return null;

  let best: SearchAnswer | null = null;
  let bestScore = 0;
  hits.slice(0, 2).forEach((hit, rank) => {
    for (const f of engine.faq.get(hit.slug) ?? []) {
      let score = 0;
      let directQuestionHit = false;
      const qCompact = f.qFolded.replace(/[^a-z0-9]/g, '');
      for (const q of queryTokens) {
        // Zusammengeschrieben gegen getrennt ("quicklink" vs. "Quick-Link"):
        // der Tokenizer sieht zwei Woerter, gemeint ist eins.
        const inQuestion = matchesAny(q, f.qTokens) || (q.length >= 5 && qCompact.includes(q));
        if (inQuestion) { score += 2; directQuestionHit = true; } else if (matchesAny(q, f.aTokens)) score += 1;
      }
      for (const e of expanded) {
        if (f.qTokens.includes(e)) { score += 0.7; if (queryTokens.length === 0) directQuestionHit = true; } else if (f.aTokens.includes(e)) score += 0.35;
      }
      // Wendungen wie "wie oft" oder "wie lange" bestehen nur aus Stoppwoertern
      // und sind im Token-Vergleich unsichtbar. Als Wortpaar tragen sie genau
      // die Bedeutung, nach der gefragt wird.
      for (const pair of bigrams) if (f.qFolded.includes(pair)) score += 0.5;
      if (!directQuestionHit) continue;
      const relative = (score / reachable) * (rank === 0 ? 1.15 : 1);
      if (relative > bestScore) {
        bestScore = relative;
        best = { slug: hit.slug, question: f.q, answer: f.a, anchor: `faq-${headingId(f.q)}` };
      }
    }
  });
  return bestScore >= ANSWER_THRESHOLD ? best : null;
}

function rank(engine: SearchEngine, query: string, queryTokens: string[], expanded: string[]) {
  const { mini } = engine;
  const strict = run(mini, query, {
    combineWith: 'AND',
    prefix: true,
    // Tippfehlertoleranz proportional zur Wortlaenge. 0.2 heisst: pro fuenf
    // Zeichen ein erlaubter Fehler — genug fuer "Kettenschlos", nicht so viel,
    // dass "Wachs" auf "Wachse"/"Waschen"/"Wacht" gleichzeitig passt.
    fuzzy: 0.2,
    boost: FIELD_BOOSTS,
  });
  const loose = queryTokens.length
    ? run(mini, query, { combineWith: 'OR', prefix: true, fuzzy: 0.2, boost: FIELD_BOOSTS })
    : new Map<string, number>();
  const expandedRun = expanded.length
    // prefix/fuzzy hier aus: die Synonyme sind bereits die unscharfe Schicht,
    // noch eine Unschaerfe daraufgesetzt holt nur Rauschen herein.
    ? run(mini, expanded.join(' '), { combineWith: 'OR', prefix: false, boost: FIELD_BOOSTS })
    : new Map<string, number>();

  const total = new Map<string, number>();
  const add = (partial: ScoredRun, weight: number) => {
    for (const [id, score] of partial) total.set(id, (total.get(id) ?? 0) + score * weight);
  };
  add(strict, WEIGHT_STRICT);
  add(phraseRun(engine, query), WEIGHT_PHRASE);
  add(loose, WEIGHT_LOOSE);
  add(expandedRun, WEIGHT_EXPANDED);
  return total;
}

/**
 * "Meintest du …?" — nur wenn der Vorschlag selbst etwas findet. Ein
 * Vorschlag, der wieder bei null landet, ist schlimmer als keiner.
 */
function suggest(engine: SearchEngine, query: string): string | null {
  const suggestions = engine.mini.autoSuggest(query, { fuzzy: 0.3, prefix: true, combineWith: 'OR' });
  for (const s of suggestions.slice(0, 3)) {
    const text = s.terms.map((t) => engine.surface.get(t) ?? t).join(' ');
    if (fold(text) === fold(query.trim())) continue;
    const tokens = tokenize(text);
    if (tokens.length && rank(engine, text, tokens, []).size > 0) return text;
  }
  return null;
}

/**
 * Suchen. Gibt nach Relevanz sortierte Treffer zurueck, plus Antwortkarte und
 * Vorschlag. `limit` deckelt nur die Ausgabe, nicht die Suche selbst.
 */
/**
 * Tippfehler gegen den Wortschatz der Artikel korrigieren, bevor gesucht wird.
 *
 * MiniSearch ist zwar selbst unscharf, aber nur fuer das Ranking. Die
 * Synonym-Trigger, die Antwortkarte und die Schnipsel arbeiten mit exakten
 * Tokens. "quitscht" fand deshalb zwar irgendetwas, aber ueber "kette" den
 * Verschleiss-Artikel statt der Fehlersuche, weil die Quietsch-Bruecke nie
 * ausgeloest wurde. Korrigiert wird nur ein Wort, das es in keinem Artikel
 * gibt, nur ab fuenf Zeichen und nur um genau einen Buchstaben. Bei mehreren
 * Kandidaten gewinnt der haeufigste.
 */
function correctQuery(engine: SearchEngine, query: string): string | null {
  let changed = false;
  const corrected = query.split(/(\s+)/).map((word) => {
    const [token] = tokenize(word);
    if (!token || token.length < 5 || engine.surface.has(token)) return word;
    let best: string | null = null;
    let bestFreq = 0;
    for (const [candidate, freq] of engine.frequency) {
      if (freq > bestFreq && withinOneEdit(token, candidate)) { best = candidate; bestFreq = freq; }
    }
    if (!best) return word;
    changed = true;
    return engine.surface.get(best) ?? word;
  }).join('');
  return changed ? corrected : null;
}

export function search(engine: SearchEngine, rawQuery: string, limit = 24): SearchResult {
  const empty: SearchResult = { hits: [], answer: null, suggestion: null, corrected: null };
  const typed = rawQuery.trim();
  if (typed.length < 2) return empty;
  const corrected = correctQuery(engine, typed);
  const query = corrected ?? typed;

  const queryTokens = tokenize(query);
  const expanded = expandQuery(query, fold, tokenize);
  // "wie oft" besteht nur aus Stoppwoertern, traegt aber ueber die
  // Phrasen-Trigger in synonyms.ts trotzdem Bedeutung. Erst wenn weder Token
  // noch Erweiterung uebrig bleiben, gibt es wirklich nichts zu suchen.
  if (queryTokens.length === 0 && expanded.length === 0) return empty;

  const total = rank(engine, query, queryTokens, expanded);
  if (total.size === 0) return { ...empty, corrected, suggestion: queryTokens.length ? suggest(engine, query) : null };

  const ranked = [...total.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0][1];
  const snippetTokens = queryTokens.length ? queryTokens : expanded;

  const hits: SearchHit[] = ranked
    .filter(([, score]) => score >= top * RELATIVE_CUTOFF)
    .slice(0, limit)
    .map(([slug, score]) => {
      const section = bestSection(engine, slug, queryTokens, expanded);
      const snippet = section
        ? buildSnippet(section.t, snippetTokens) ?? buildSnippet(section.t, expanded)
        : null;
      return {
        slug,
        score,
        snippet,
        section: section ? { id: section.id, heading: section.h } : null,
      };
    });

  return { hits, answer: findAnswer(engine, query, hits, queryTokens, expanded), suggestion: null, corrected };
}
