/**
 * Query-Expansion: das Woerterbuch zwischen Alltagssprache und Artikeltext.
 *
 * Die Artikel sind fachlich geschrieben ("Ölfilm", "Transferfilm",
 * "Antriebsverlust"). Gesucht wird umgangssprachlich ("hose wird schwarz",
 * "fuehlt sich schwer an"). Eine Volltextsuche allein ueberbrueckt das nicht,
 * weil schlicht kein gemeinsames Wort existiert.
 *
 * Statt die Bruecke von einem Modell raten zu lassen, steht sie hier
 * explizit: erkennt die Anfrage einen Trigger, kommen die Begriffe aus
 * `expand` als zusaetzliche, schwaecher gewichtete Suchbegriffe dazu. Das ist
 * deterministisch, nachvollziehbar und jederzeit von Hand korrigierbar — bei
 * 18 Artikeln der ehrlichere Weg als ein Vektorraum, in den niemand
 * hineinschauen kann.
 *
 * `triggers` werden gegen die TOKENISIERTE Anfrage geprueft (also gestemmt und
 * umlautgefaltet — hier deshalb schon in dieser Form notieren).
 * `phrases` werden gegen die gefaltete Rohanfrage geprueft, fuer Wendungen,
 * deren Bedeutung erst aus mehreren Woertern entsteht ("wie oft", "haelt nicht").
 */
export type SynonymGroup = {
  /** gestemmte, gefaltete Einzeltoken */
  triggers?: string[];
  /** gefaltete Teilzeichenketten der Rohanfrage */
  phrases?: string[];
  /** Begriffe, die der Anfrage hinzugefuegt werden (Rohform, wird tokenisiert) */
  expand: string[];
};

export const SYNONYM_GROUPS: SynonymGroup[] = [
  // ── Sauberkeit: der haeufigste Einstieg ueberhaupt ──────────────────────
  {
    // "schwarz" steht hier bewusst NICHT als Einzeltrigger: das Pro-Wachs IST
    // schwarz, und "warum ist das Wachs schwarz" landete dadurch bei den
    // Reinigungsartikeln statt bei MoS2. Nur die Wendungen, in denen Schwarz
    // wirklich Verschmutzung meint, loesen aus.
    triggers: ['wade', 'hose', 'sock', 'bein', 'tattoo', 'finger', 'fleck', 'sudel', 'saut'],
    phrases: ['faerbt ab', 'wird schwarz', 'macht dreckig', 'alles dreckig', 'schmutzige finger',
      'schwarze finger', 'schwarze haende', 'schwarze hose', 'schwarz an der wade'],
    expand: ['sauber', 'oelfilm', 'dreck', 'schmutz', 'abfaerben', 'entfetten'],
  },
  {
    triggers: ['sauber', 'sauberkeit', 'clean'],
    expand: ['oelfilm', 'dreck', 'schmutz', 'trocken'],
  },

  // ── Geraeusch ──────────────────────────────────────────────────────────
  {
    triggers: ['quietsch', 'knarz', 'sirr', 'knirsch', 'geraeusch', 'laut', 'rassel', 'klapper', 'schleif'],
    phrases: ['macht geraeusche', 'hoert man'],
    expand: ['geraeusch', 'trocken', 'schmierung', 'nachwachsen', 'intervall', 'wachs haelt nicht'],
  },

  // ── Haltbarkeit / Fehlersuche ──────────────────────────────────────────
  {
    triggers: ['blaetter', 'abblaetter', 'broesel', 'pulver', 'staub', 'rieselt', 'krueml', 'flocken'],
    phrases: ['haelt nicht', 'geht wieder ab', 'faellt ab', 'loest sich', 'weisses pulver', 'haelt nur kurz',
      'schon wieder trocken', 'was falsch gemacht', 'klappt nicht', 'funktioniert nicht'],
    expand: ['haftung', 'entfetten', 'fehler', 'wachs haelt nicht', 'vorbereitung', 'reinigung'],
  },

  // ── Reinigung / Vorbereitung ───────────────────────────────────────────
  {
    triggers: ['entfett', 'reinig', 'saeuber', 'waschen', 'spuel', 'bremsenreiniger', 'benzin', 'ipa',
      'isopropanol', 'alkohol', 'spiritus', 'aceton', 'ultraschall'],
    phrases: ['neue kette vorbereiten', 'kette vorbereiten', 'fett runter', 'werksfett'],
    expand: ['entfetten', 'reinigung', 'vorbereitung', 'isopropanol', 'werksfett'],
  },

  // ── Intervall / Haeufigkeit ────────────────────────────────────────────
  {
    triggers: ['intervall', 'haeufigkeit', 'turnus', 'rhythmus'],
    phrases: ['wie oft', 'wie lange', 'wann wieder', 'wie viele kilometer', 'wie vielen kilometer',
      'nach wie vielen', 'wieviel km', 'wieviel kilometer', 'wann muss ich', 'wie haeufig', 'alle wie viel'],
    expand: ['intervall', 'kilometer', 'nachwachsen', 'kettenlaufzeit', '400', '550'],
  },

  // ── Effizienz / Watt ───────────────────────────────────────────────────
  {
    triggers: ['watt', 'effizienz', 'leistung', 'schnell', 'rollwiderstand', 'widerstand', 'reibung',
      'verlust', 'wirkungsgrad', 'leichtgaengig', 'zaeh', 'schwer'],
    phrases: ['bringt das was', 'lohnt sich das technisch', 'fuehlt sich schwer', 'geht schwer',
      'laeuft schwer', 'mehr speed', 'schneller fahren'],
    expand: ['reibung', 'antriebsverlust', 'watt', 'reibwert', 'effizienz'],
  },

  // ── Kosten ─────────────────────────────────────────────────────────────
  {
    triggers: ['kosten', 'preis', 'teuer', 'guenstig', 'billig', 'geld', 'euro', 'sparen', 'ersparnis',
      'budget', 'rechnet'],
    phrases: ['lohnt sich', 'lohnt das', 'rechnet sich', 'was kostet', 'zu teuer', 'ist das teuer'],
    expand: ['kosten', 'ersparnis', 'rechnung', 'kettenlaufzeit', 'euro'],
  },

  // ── Verschleiss ────────────────────────────────────────────────────────
  {
    triggers: ['verschleiss', 'laengung', 'gelaengt', 'ausgeleiert', 'abgenutzt', 'kaputt', 'durch',
      'lehre', 'messen', 'messung', 'kassette', 'ritzel', 'springt'],
    phrases: ['kette hin', 'kette durch', 'wann tauschen', 'wann wechseln', 'noch gut', 'kette messen',
      'springt durch', 'rutscht durch'],
    expand: ['verschleiss', 'kettenlehre', 'messen', 'laengung', 'kassette', 'tauschen'],
  },

  // ── Winter / Wetter ────────────────────────────────────────────────────
  {
    triggers: ['winter', 'kalt', 'frost', 'schnee', 'salz', 'streusalz', 'regen', 'nass', 'matsch',
      'pfuetze', 'feucht', 'herbst', 'eis'],
    phrases: ['bei naesse', 'im regen', 'bei kaelte', 'schlechtes wetter'],
    expand: ['winter', 'naesse', 'salz', 'intervall', 'nachwachsen'],
  },

  // ── Topf / Ausruestung ─────────────────────────────────────────────────
  {
    triggers: ['topf', 'kocher', 'reiskocher', 'fritteuse', 'slowcooker', 'wasserbad', 'herd', 'ceran',
      'induktion', 'thermometer', 'temperatur', 'grad', 'heiss', 'schmelzen', 'wachsbad'],
    phrases: ['womit erhitzen', 'wie warm', 'welche temperatur', 'was brauche ich dafuer',
      'slow cooker', 'in der pfanne'],
    expand: ['wachstopf', 'temperatur', 'schmelzen', 'grad', 'ausruestung'],
  },

  // ── Kettenschloss ──────────────────────────────────────────────────────
  {
    triggers: ['kettenschloss', 'schloss', 'quicklink', 'missinglink', 'powerlink', 'nietstift',
      'niet', 'zange', 'oeffnen', 'aufmachen', 'abnehmen', 'demontage'],
    phrases: ['missing link', 'kette abnehmen', 'kette oeffnen', 'wie oft wiederverwenden'],
    expand: ['schnellverschluss', 'quicklink', 'kettenschloss', 'zange', 'oeffnen'],
  },

  // ── Einstieg / Umstieg ─────────────────────────────────────────────────
  {
    triggers: ['anfangen', 'anfaenger', 'einstieg', 'umsteigen', 'umstieg', 'wechseln', 'neu', 'erstmal',
      'starten', 'beginnen'],
    phrases: ['wie fange ich an', 'wo fange ich an', 'erste mal', 'zum ersten mal', 'noch nie gemacht',
      'von oel auf wachs', 'komme von oel', 'lohnt der umstieg', 'wie anfangen'],
    expand: ['umstieg', 'anleitung', 'einstieg', 'erste', 'schritt'],
  },

  // ── Anleitung ──────────────────────────────────────────────────────────
  {
    triggers: ['anleitung', 'schritt', 'ablauf', 'howto', 'tutorial', 'vorgehen'],
    phrases: ['wie mache ich', 'wie geht das', 'schritt fuer schritt', 'was muss ich tun', 'wie waxe ich',
      'wie wachse ich'],
    expand: ['anleitung', 'schritt', 'ablauf', 'wachsen'],
  },

  // ── Produktwahl / Kaufberatung ─────────────────────────────────────────
  {
    triggers: ['classic', 'pro', 'mos2', 'molybdaen', 'ptfe', 'unterschied', 'vergleich', 'welche',
      'empfehlung', 'kaufen', 'bestellen', 'set'],
    phrases: ['was soll ich nehmen', 'welches wachs', 'classic oder pro', 'was ist besser',
      'welches produkt', 'was brauche ich'],
    expand: ['kaufberatung', 'classic', 'pro', 'mos2', 'unterschied'],
  },
  {
    triggers: ['vorgewachst', 'fertig', 'service', 'rewax', 'machen lassen'],
    phrases: ['selber machen', 'machen lassen', 'keine lust', 'keine zeit', 'ohne aufwand',
      'fertig gewachst', 'schon gewachst'],
    expand: ['vorgewachst', 'rewax', 'service', 'fertig'],
  },

  // ── Radtypen ───────────────────────────────────────────────────────────
  {
    triggers: ['rennrad', 'gravel', 'roadbike', 'strasse', 'schotter'],
    expand: ['rennrad', 'gravel'],
  },
  {
    triggers: ['ebike', 'pedelec', 'bosch', 'motor', 'shimano', 'steps', 'unterstuetzung', 'drehmoment'],
    phrases: ['e bike', 'e-bike', 'mit motor'],
    expand: ['ebike', 'pedelec', 'drehmoment', 'motor'],
  },
  {
    triggers: ['mtb', 'mountainbike', 'trail', 'enduro'],
    expand: ['mtb', 'gelaende', 'schotter'],
  },

  // ── Fluessigwachs / Alternativen ───────────────────────────────────────
  {
    triggers: ['fluessigwachs', 'tropfwachs', 'drip', 'squirt', 'traeufeln', 'tropfen', 'flasche'],
    phrases: ['aus der flasche', 'zum tropfen', 'ohne topf', 'ohne kette abnehmen'],
    expand: ['fluessigwachs', 'tropfwachs', 'hybrid', 'vergleich'],
  },

  // ── Erste Fahrt / direkt danach ────────────────────────────────────────
  {
    triggers: ['steif', 'starr', 'fest', 'klebt', 'knackt', 'eingefahren', 'einfahren'],
    phrases: ['nach dem wachsen', 'erste fahrt', 'erste km', 'direkt danach', 'kette ist steif',
      'laesst sich nicht bewegen'],
    expand: ['erste fahrt', 'einfahren', 'steif', 'transferfilm'],
  },

  // ── Entsorgung ─────────────────────────────────────────────────────────
  {
    triggers: ['entsorgen', 'muell', 'wegwerfen', 'restwachs', 'altwachs', 'abfall', 'umwelt', 'ausleeren'],
    phrases: ['wachs weg', 'altes wachs', 'topf reinigen', 'topf sauber', 'wohin damit'],
    expand: ['entsorgung', 'restwachs', 'topfpflege', 'muell'],
  },

  // ── Sicherheit ─────────────────────────────────────────────────────────
  {
    triggers: ['gefaehrlich', 'sicher', 'brennt', 'feuer', 'daempfe', 'giftig', 'verbrennung'],
    phrases: ['ist das gefaehrlich', 'kann das brennen'],
    expand: ['sicherheit', 'temperatur', 'daempfe'],
  },
];

/**
 * Anfrage um Synonyme erweitern.
 * Rueckgabe sind ZUSAETZLICHE Begriffe, nicht die ersetzte Anfrage — der
 * Originalwortlaut bleibt immer der staerkste Treffer, die Erweiterung ist nur
 * das Sicherheitsnetz darunter (die Gewichtung passiert im Suchaufruf).
 */
export function expandQuery(rawQuery: string, fold: (s: string) => string, tokenize: (s: string) => string[]): string[] {
  const folded = fold(rawQuery);
  const queryTokens = new Set(tokenize(rawQuery));
  const added = new Set<string>();

  for (const group of SYNONYM_GROUPS) {
    const hitByToken = group.triggers?.some((t) => queryTokens.has(t) ||
      // Trigger sind bereits gestemmt notiert; ein laengerer Anfragetoken mit
      // demselben Stamm ("quietschen" -> "quietsch") soll trotzdem greifen.
      [...queryTokens].some((q) => q.startsWith(t) || t.startsWith(q)));
    const hitByPhrase = group.phrases?.some((p) => folded.includes(p));
    if (!hitByToken && !hitByPhrase) continue;

    for (const term of group.expand) {
      for (const token of tokenize(term)) {
        if (!queryTokens.has(token)) added.add(token);
      }
    }
  }
  return [...added];
}
