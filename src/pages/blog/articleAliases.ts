/**
 * Alias-Flaechen: wie ein Laie nach diesem Artikel fragen wuerde.
 *
 * Der Kern der Ratgeber-Suche. Die Artikel sind fachlich geschrieben
 * ("Transferfilm", "Antriebsverlust", "Kettendehnung"), gesucht wird
 * umgangssprachlich ("hose wird dreckig", "fuehlt sich zaeh an", "kette hin").
 * Zwischen beiden gibt es oft kein einziges gemeinsames Wort, deshalb findet
 * eine reine Volltextsuche den richtigen Artikel nicht.
 *
 * Statt diese Bruecke einem Embedding-Modell zu ueberlassen, steht sie hier
 * ausgeschrieben. Vorteil gegenueber Vektoren: jeder Fehltreffer laesst sich
 * hier in einer Zeile korrigieren, und es kostet zur Laufzeit nichts.
 * Nachteil, ehrlich benannt: das muss gepflegt werden. Wer einen Artikel
 * ergaenzt, ergaenzt hier die Aliase und in scripts/check-search.mjs die
 * Testzeilen, sonst verwaessert die Suche schleichend.
 *
 * WICHTIG: Diese Datei wird ausschliesslich zur Build-Zeit von
 * scripts/generate-search-index.mjs importiert. Sie landet nie im Client-
 * Bundle. Laenge ist deshalb kein Performance-Problem.
 *
 * Faustregeln beim Schreiben:
 *   - so formulieren, wie man es tippt, nicht wie man es schreiben wuerde
 *   - Symptome aufnehmen, nicht nur Fachbegriffe ("weisses pulver" statt nur
 *     "Paraffinrueckstand")
 *   - Zweifelsfaelle lieber beim spezifischeren Artikel notieren; Aliase, die
 *     bei mehreren Artikeln stehen, machen das Ranking unscharf
 */
export const articleAliases: Record<string, string[]> = {
  'heisswachs-vs-fluessigwachs': [
    'heisswachs oder fluessigwachs', 'was ist besser heiss oder fluessig',
    'lohnt sich der aufwand mit dem topf', 'unterschied wachsarten',
    'wachs aus der flasche oder im topf', 'muss ich die kette wirklich abnehmen',
    'gibt es wachs zum auftragen', 'wachs ohne kette abnehmen',
    'drip wax vs hot wax', 'squirt oder heisswachs', 'wie viel watt bringt wachs',
    'ist wachs wirklich schneller als oel', 'reibung im vergleich',
    'welche methode fuer alltagsfahrer', 'was bringt mir das ueberhaupt',
    'wachs vergleich', 'bequemer weg zum wachsen', 'kompromiss wachs',
    'wachs oberflaeche oder im gelenk', 'dringt das wachs wirklich ein',
    'oberflaechlich oder tief', 'ist heisswachsen zu aufwendig',
    'zu viel arbeit wachs', 'kann ich fluessigwachs auf oel geben',
    'einsteigerfreundliche wachsmethode', 'was kostet mich welche methode',
    'konstanz ueber das intervall', 'wird oel mit der zeit schlechter',
  ],

  'fahrradkette-entfetten': [
    'kette sauber machen vor dem wachsen', 'wie bekomme ich das fett von der kette',
    'werksfett entfernen', 'neue kette vorbereiten', 'kette putzen',
    'womit entfette ich', 'welches mittel zum entfetten', 'isopropanol wie viel prozent',
    'reicht 70 prozent alkohol', 'desinfektionsmittel zum entfetten',
    'kann ich bremsenreiniger nehmen', 'geht wd40', 'benzin zum reinigen',
    'aceton fuer die kette', 'ultraschallbad kette', 'spiritus kette',
    'wie oft schuetteln', 'wie viele durchgaenge', 'wann ist die kette sauber genug',
    'fluessigkeit bleibt truebe', 'muss die kette trocknen', 'wie lange trocknen lassen',
    'restfeuchte im wachs', 'wachs spritzt beim eintauchen',
    'shimano kette schwer zu entfetten', 'fett aus den gelenken holen',
    'kette vor dem ersten wachsen', 'hose wird schwarz von der kette',
    'schwarze finger nach der fahrt', 'oel faerbt auf die wade ab',
    'ketten tattoo am bein', 'schmutzige socken vom rad',
  ],

  'kettenlaufzeit-heisswachs': [
    'wie oft muss ich neu wachsen', 'wann wieder wachsen', 'wie lange haelt eine wachsschicht',
    'nach wie vielen kilometern', 'nach wie vielen kilometern wieder wachsen',
    'wie viele kilometer haelt das wachs', 'alle wie viel km', 'intervall wachs',
    'wie lange haelt eine gewachste kette', 'wie viele kilometer haelt die kette',
    'lebensdauer kette', 'haelt die kette laenger', 'lohnt sich wachs finanziell',
    'rechnet sich das', 'was spare ich mit wachs', 'ist wachs guenstiger als oel',
    'kosten ueber die jahre', 'kostenvergleich oel wachs', 'was kostet mich das pro jahr',
    'woran merke ich dass die kette faellig ist', 'kette klingt trocken',
    'wann ist nachwachsen dran', 'drei ketten rotation', 'mehrere ketten im wechsel',
    'kettenrotation sinnvoll', 'wie oft bei naesse nachwachsen',
    'intervall mtb schotter', 'amortisiert sich der topf', 'zahlt sich wachs aus',
    'watt vorteil in zahlen', 'ist das teurer als oel',
  ],

  'heisswachs-anleitung': [
    'wie wachse ich meine kette', 'wie geht heisswachsen', 'schritt fuer schritt wachsen',
    'anleitung kette wachsen', 'wie mache ich das mit dem wachs',
    'erstes mal kette wachsen', 'wie lange dauert wachsen', 'wie viel zeit brauche ich',
    'welche temperatur braucht das wachs', 'wie heiss muss das wachs sein',
    'wie viel grad', 'darf das wachs kochen', 'zu heiss geworden',
    'wie lange kette im wachsbad', 'wie lange eintauchen', 'blaeschen steigen auf',
    'wann ist die kette durchtraenkt', 'kette aufhaengen zum abtropfen',
    'abkuehlen lassen', 'kette durchbrechen nach dem wachsen',
    'was brauche ich zum wachsen', 'ausruestung wachsen',
    'neue kette direkt wachsen', 'gebrauchte kette auffrischen',
    'wachsbad pflegen', 'wie oft wachs wechseln', 'classic oder pro beim wachsen',
    'erste kilometer nach dem wachsen', 'einfahrphase',
  ],

  'mos2-kettenwachs': [
    'was ist mos2', 'was ist molybdaendisulfid', 'wofuer das schwarze wachs',
    'warum ist das wachs schwarz', 'was bringt pro gegenueber classic',
    'unterschied classic pro', 'brauche ich die pro edition',
    'festschmierstoff im wachs', 'wie funktioniert der zusatz',
    'transferfilm was ist das', 'wie lange bis der film steht',
    'warum wird die kette nach 30 km leiser', 'physik hinter dem wachs',
    'ist mos2 giftig', 'ist das gesundheitlich bedenklich',
    'muss ich handschuhe tragen', 'einatmen gefaehrlich',
    'wirkt das auch bei naesse', 'nasswetter vorteil',
    'ptfe oder mos2', 'pfas frei wachs', 'welche variante bei hoher last',
    'schmiert auch wenn das wachs weg ist', 'notlaufeigenschaft',
    'schichtgitter gleiten', 'was steckt technisch drin',
  ],

  'kettenwachs-rennrad-gravelbike': [
    'wachs fuer rennrad', 'lohnt sich wachs am rennrad', 'kettenwachs gravel',
    'gravelbike kette', 'schotter und wachs', 'staub bindet sich nicht',
    'sand in der kette', 'schleifpaste aus staub', 'welches wachs fuer strasse',
    'welches wachs fuer schotter', 'rennrad intervall', 'wie oft rennrad nachwachsen',
    'zwei prozent tretleistung', 'bringt mir das watt am rennrad',
    'wettkampf kette', 'schneller mit wachs', 'zwoelffach kette wachsen',
    '12 fach geeignet', 'moderne schaltgruppen wachs', 'sram und shimano wachsen',
    'umstieg am rennrad', 'bikepacking kette sauber', 'lange touren kette',
    'gravelrennen kettenpflege', 'kette bleibt sauber auf schotter',
  ],

  'wachs-haelt-nicht-haeufige-fehler': [
    'wachs haelt nicht', 'wachs blaettert ab', 'wachs faellt von der kette',
    'wachs loest sich', 'wachs broeselt', 'schon wieder trocken',
    'haelt nur 50 km', 'kette quietscht wieder', 'quietschen nach kurzer zeit',
    'kette knarzt', 'kette sirrt', 'geraeusche nach dem wachsen',
    'was habe ich falsch gemacht', 'klappt nicht mit dem wachs',
    'funktioniert bei mir nicht', 'wachs will nicht haften',
    'weisses pulver ueberall', 'pulver rieselt von der kette',
    'kette ist steif geworden', 'kette springt nach dem wachsen',
    'kette rostet', 'rost an den laschen', 'wachs spritzt beim eintauchen',
    'schaltung laeuft schlechter', 'schaltet schlecht nach dem wachsen',
    'fehler beim wachsen', 'typische probleme wachs', 'wachs troubleshooting',
    'wachsbad zu kalt', 'zu kurz eingetaucht', 'nicht gruendlich entfettet',
  ],

  'kettenwachs-faq': [
    'kurze antworten kettenwachs', 'haeufige fragen wachs', 'faq wachs',
    'schnelle antwort', 'alles wichtige auf einen blick',
    'ueberblick kettenwachs', 'kurz und knapp wachs', 'wachsen oder oelen',
    'was ist besser wachs oder oel', 'brauche ich einen spezialtopf',
    'geoelte kette ins wachs tauchen', 'wie lange haelt ein wachsblock',
    'wie viele wachsvorgaenge pro block', 'riecht das wachs',
    'qualmt das wachs', 'stinkt das in der wohnung', 'brauche ich ein kettenschloss',
    'funktioniert wachs im winter', 'wachs und ebike', 'tropfwachs kombinieren',
    'altes wachs was tun', 'einsteigerfragen',
  ],

  'vorgewachste-kette': [
    'fertig gewachste kette kaufen', 'vorgewachste kette', 'kette schon gewachst',
    'kette fertig kaufen', 'ohne selbst zu wachsen', 'keine lust selbst zu wachsen',
    'keine zeit zum wachsen', 'ohne topf starten', 'ohne ausruestung anfangen',
    'einfach montieren und fahren', 'was bekomme ich da genau',
    'lohnt sich eine vorgewachste kette', 'fuer wen lohnt sich das',
    'worauf beim kauf achten', 'muss ich die trotzdem nachwachsen',
    'was kommt nach der ersten kette', 'einstieg ohne investition',
    'kette bestellen gewachst', 'testen ob wachs was fuer mich ist',
    'geschenk fuer radfahrer kette', 'passt in die kettenrotation',
    'welche kette passt zu meiner schaltung',
  ],

  'kettenwachs-winter': [
    'wachs im winter', 'funktioniert wachs bei kaelte', 'winterkette',
    'streusalz und wachs', 'salz auf der strasse', 'salzschlamm kette',
    'dauerregen kette', 'nasses wetter wachs', 'matschwetter',
    'wachs bei schnee', 'frost kette', 'wie kalt darf es sein',
    'bei welcher temperatur funktioniert wachs noch', 'winterpendler kette',
    'jeden tag bei naesse fahren', 'ist oel im winter besser',
    'soll ich im winter auf oel wechseln', 'wie oft im winter nachwachsen',
    'kette waescht sich aus', 'wachs wird weggewaschen',
    'saisonwechsel kettenpflege', 'herbst kettenpflege', 'rad im winter pflegen',
  ],

  'topf-zum-kette-wachsen': [
    'welchen topf brauche ich', 'womit erhitze ich das wachs',
    'slow cooker kette', 'reiskocher zum wachsen', 'fritteuse wachs',
    'kann ich einen normalen topf nehmen', 'wachs auf dem herd schmelzen',
    'topf auf induktion', 'wasserbad wachs', 'sous vide wachs',
    'brauche ich ein spezialgeraet', 'muss ich viel geld ausgeben',
    'billige loesung zum wachsen', 'was kostet die ausruestung',
    'welche groesse topf', 'topf fuer drei ketten', 'wie viel wachs passt rein',
    'haelt das geraet die temperatur', 'temperatur stabil halten',
    'thermometer noetig', 'kann ich den topf danach noch zum kochen nehmen',
    'topf fuer lebensmittel weiterverwenden', 'wie oft wachs nachfuellen',
    'was brauche ich nicht', 'ausruestung einkaufsliste',
  ],

  'tropfwachs-hybrid-methode': [
    'tropfwachs zwischendurch', 'hybrid methode', 'heiss und tropf kombinieren',
    'seltener heiss wachsen', 'kette nicht jedes mal abnehmen',
    'auffrischen ohne topf', 'zwischendurch nachlegen', 'wachs nachtropfen',
    'wachs auffrischen unterwegs', 'auf tour nachwachsen',
    'wie oft heiss bei hybrid', 'alle 200 km auffrischen',
    'darf ich oel dazwischen nehmen', 'oel auf wachs geben',
    'was zerstoert die wachsbasis', 'echtes tropfwachs erkennen',
    'welches tropfwachs passt', 'kompatibles tropfwachs',
    'wann reicht auffrischen nicht mehr', 'fuer wen lohnt sich hybrid',
    'weniger aufwand wachs', 'bequemer wachsen',
  ],

  'von-oel-auf-wachs-umsteigen': [
    'wie fange ich mit wachs an', 'wo fange ich an', 'umstieg von oel',
    'von oel auf wachs wechseln', 'erstes mal wachsen', 'noch nie gewachst',
    'einsteiger wachs', 'anfaenger kettenwachs', 'wie starte ich',
    'was muss ich zuerst machen', 'lohnt sich der umstieg',
    'muss ich die kassette auch reinigen', 'ganzen antrieb reinigen',
    'kettenblaetter entfetten', 'oelreste am antrieb',
    'alte kette behalten oder neue kaufen', 'lohnt sich die alte kette noch',
    'stark geoelte kette retten', 'antrieb komplett sauber machen',
    'wie lange dauert die einfahrphase', 'was aendert sich nach dem umstieg',
    'was kommt auf mich zu', 'komplettanleitung umstieg',
    'erste schritte kettenwachs', 'wachs ausprobieren',
  ],

  'ebike-kette-wachsen': [
    'ebike kette wachsen', 'pedelec kettenpflege', 'wachs fuer e bike',
    'lohnt sich wachs beim ebike', 'motor drehmoment kette',
    'warum verschleisst die ebike kette so schnell', 'kette haelt am ebike nicht lange',
    'bosch motor kette', 'shimano steps kette', 'hohe last kette',
    'welches wachs fuer ebike', 'classic oder pro am ebike',
    'wie oft am ebike nachwachsen', 'ebike intervall',
    'wann ebike kette wechseln', 'kettenverschleiss ebike',
    'lastenrad kette', 'schweres rad kettenpflege', 'viel drehmoment schmierung',
  ],

  'kettenverschleiss-messen': [
    'ist meine kette durch', 'kette hin', 'wann kette wechseln',
    'wann muss die kette getauscht werden', 'kette ausgeleiert',
    'kette gelaengt', 'kettendehnung messen', 'wie messe ich verschleiss',
    'kettenlehre benutzen', 'kettenmesslehre', 'wie funktioniert die lehre',
    'mit dem lineal messen', 'null komma fuenf prozent',
    'ab wann ist die kette kaputt', 'grenzwert kette', '0 75 prozent',
    'elf fach grenzwert', 'kette springt durch', 'kette rutscht unter last',
    'muss ich die kassette auch tauschen', 'kassette mit verschlissen',
    'ab wie vielen kilometern messen', 'wie oft kontrollieren',
    'haelt eine gewachste kette laenger', 'verschleiss vergleich oel wachs',
  ],

  'erste-fahrt-nach-wachsen': [
    'kette ist steif nach dem wachsen', 'kette laesst sich schlecht bewegen',
    'kette klebt zusammen', 'weisses pulver nach dem wachsen',
    'pulver rieselt ab', 'ist das normal', 'ist das schlimm',
    'was ist nach dem wachsen normal', 'erste fahrt nach dem wachsen',
    'erste kilometer', 'einfahren kette', 'wie lange dauert das einfahren',
    'knackgeraeusche am anfang', 'leise geraeusche nach dem wachsen',
    'kette wird leiser mit der zeit', 'wann laeuft es rund',
    'wann muss ich mir sorgen machen', 'wann ist es ein echter fehler',
    'quietschen unter last', 'wachsklumpen stoeren beim schalten',
    'soll ich nach der ersten fahrt putzen', 'kette abwischen nach dem wachsen',
    'wie fahre ich richtig ein',
  ],

  'schnellverschluss-quicklink': [
    'kettenschloss welches', 'quicklink auswaehlen', 'missing link',
    'powerlink kette', 'welcher verschluss passt', 'schloss fuer 12 fach',
    'kette oeffnen ohne werkzeug', 'wie mache ich die kette auf',
    'kette abnehmen', 'kette wieder schliessen', 'kettenschlosszange',
    'ohne zange oeffnen', 'schnuer trick kette oeffnen',
    'wie oft darf ich das schloss wiederverwenden', 'ist der link mehrfach nutzbar',
    'sram nur einmal', 'kmc wiederverwendbar', 'haelt das schloss',
    'brauche ich ueberhaupt ein kettenschloss', 'ohne schloss wachsen',
    'nietstift statt schloss', 'schloss mit ins wachsbad',
    'welcher link ist am robustesten', 'kette fuer rotation vorbereiten',
  ],

  'wachs-entsorgen-topf-pflegen': [
    'altes wachs entsorgen', 'wohin mit dem alten wachs', 'wachs wegwerfen',
    'wachs in den muell', 'darf wachs in den abfluss', 'restwachs entsorgen',
    'wachsreste loswerden', 'schmutziges wachs', 'wachs ist dunkel geworden',
    'wann muss das wachs raus', 'wie lange haelt ein wachsbad',
    'wachs filtern', 'wie filtere ich das wachs', 'sieb fuer wachs',
    'topf reinigen', 'topf sauber machen', 'wachs aus dem topf bekommen',
    'wachsbad pflegen', 'wachs nachfuellen oder tauschen',
    'ist paraffin umweltfreundlich', 'wie oekologisch ist wachs',
    'nachhaltigkeit kettenwachs', 'umwelt oel oder wachs',
    'abwasser kettenreiniger',
  ],
};
