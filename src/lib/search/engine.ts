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
 */
import MiniSearch from 'minisearch';
import { fold, tokenize, searchTokenize, searchProcess } from './normalize';
import { expandQuery } from './synonyms';

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
  body: string;
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
const RELATIVE_CUTOFF = 0.12;

const FIELD_BOOSTS = {
  title: 6,
  titleShort: 5,
  aliases: 4,
  description: 3,
  takeaways: 2.5,
  category: 2,
  body: 1,
};

export type SearchEngine = {
  mini: MiniSearch<SearchDoc>;
  /** Pro Artikel der gefaltete Text aus Titel und Alias-Flaeche, in dem nach
   *  woertlichen Wortgruppen gesucht wird (siehe `phraseRun`). */
  phraseHaystack: Map<string, string>;
};

export function createIndex(payload: SearchIndexPayload): SearchEngine {
  const mini = new MiniSearch<SearchDoc>({
    fields: ['title', 'titleShort', 'description', 'category', 'takeaways', 'aliases', 'body'],
    storeFields: ['title', 'titleShort', 'description', 'category', 'readingTime', 'keyStat', 'body'],
    // Derselbe Tokenizer wie im Generator. Weicht er ab, trifft nichts mehr —
    // siehe Kommentar in normalize.ts.
    tokenize: searchTokenize,
    processTerm: searchProcess,
  });
  mini.addAll(payload.docs);

  const phraseHaystack = new Map<string, string>();
  for (const doc of payload.docs) {
    phraseHaystack.set(doc.id, fold(`${doc.title} ${doc.titleShort} ${doc.aliases}`));
  }
  return { mini, phraseHaystack };
}

type ScoredRun = Map<string, number>;

/** Ein Lauf, auf sein eigenes Maximum normiert (0..1). */
function run(mini: MiniSearch<SearchDoc>, query: string, options: Parameters<MiniSearch['search']>[1]): ScoredRun {
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

/**
 * Schnipsel um die erste Fundstelle bauen.
 *
 * Bewusst wortweise statt ueber Zeichenpositionen: `fold()` aendert die Laenge
 * (ae fuer ae-Umlaut), ein Index aus dem gefalteten Text zeigt im Originaltext
 * also auf die falsche Stelle. Wort fuer Wort vergleichen ist etwas
 * langsamer, aber bei 18 Artikeln irrelevant und immer korrekt.
 */
function buildSnippet(body: string, queryTokens: Set<string>, windowSize = 30): SnippetPart[] | null {
  if (!body || queryTokens.size === 0) return null;
  const words = body.split(/\s+/);
  const isHit = (word: string) => tokenize(word).some((t) => queryTokens.has(t));

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
 * Suchen. Gibt nach Relevanz sortierte Treffer zurueck.
 * `limit` deckelt nur die Ausgabe, nicht die Suche selbst.
 */
export function search(engine: SearchEngine, rawQuery: string, limit = 24): SearchHit[] {
  const { mini } = engine;
  const query = rawQuery.trim();
  if (query.length < 2) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const strict = run(mini, query, {
    combineWith: 'AND',
    prefix: true,
    // Tippfehlertoleranz proportional zur Wortlaenge. 0.2 heisst: pro fuenf
    // Zeichen ein erlaubter Fehler — genug fuer "Kettenschlos", nicht so viel,
    // dass "Wachs" auf "Wachse"/"Waschen"/"Wacht" gleichzeitig passt.
    fuzzy: 0.2,
    boost: FIELD_BOOSTS,
  });
  const loose = run(mini, query, {
    combineWith: 'OR',
    prefix: true,
    fuzzy: 0.2,
    boost: FIELD_BOOSTS,
  });

  const expandedTerms = expandQuery(query, fold, tokenize);
  const expanded = expandedTerms.length
    // prefix/fuzzy hier aus: die Synonyme sind bereits die unscharfe Schicht,
    // noch eine Unschaerfe daraufgesetzt holt nur Rauschen herein.
    ? run(mini, expandedTerms.join(' '), { combineWith: 'OR', prefix: false, boost: FIELD_BOOSTS })
    : new Map<string, number>();

  const total = new Map<string, number>();
  const add = (partial: ScoredRun, weight: number) => {
    for (const [id, score] of partial) total.set(id, (total.get(id) ?? 0) + score * weight);
  };
  add(strict, WEIGHT_STRICT);
  add(phraseRun(engine, query), WEIGHT_PHRASE);
  add(loose, WEIGHT_LOOSE);
  add(expanded, WEIGHT_EXPANDED);

  if (total.size === 0) return [];

  const ranked = [...total.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0][1];
  const tokenSet = new Set(queryTokens);

  return ranked
    .filter(([, score]) => score >= top * RELATIVE_CUTOFF)
    .slice(0, limit)
    .map(([slug, score]) => {
      const doc = mini.getStoredFields(slug) as unknown as SearchDoc | undefined;
      return {
        slug,
        score,
        snippet: doc ? buildSnippet(doc.body, tokenSet) : null,
      };
    });
}
