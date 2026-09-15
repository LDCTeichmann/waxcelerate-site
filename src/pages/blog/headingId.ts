/**
 * Anker-ID aus einer Abschnittsueberschrift.
 *
 * Eigene Datei statt in articles.ts oder normalize.ts, weil drei Stellen
 * dieselbe ID erzeugen muessen und keine davon die anderen importieren soll:
 * BlogArticlePage (setzt id auf die <h2>), generate-search-index.mjs (schreibt
 * die ID in den Suchindex, damit ein Treffer direkt in den Abschnitt springt)
 * und generate-blog-html.mjs (dieselben IDs im vorgerenderten HTML). Weicht
 * eine davon ab, landet der Sprung aus der Suche am Artikelanfang, ohne dass
 * irgendwo ein Fehler auftaucht.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/, '');
}
