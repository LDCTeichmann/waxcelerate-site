// ─── WaxField — der erstarrte Wachsfilm im Schnitt, auf dem Stahl ───────────
//
// Ersetzt den Knoten-Kanten-Graphen (`FormulaGraph`, 420 Zeilen). Der Graph
// beantwortete "wer haengt mit wem zusammen". Das weiss der Leser vorher, es
// ist eine Rezeptur. Seine Knotenpositionen waren frei erfunden (der Kommentar
// in science.ts gab das zu), und weil alle Kanten auf MoS2 zuliefen, hing
// alles nach unten: der "Oktopus".
//
// Hier steht stattdessen EIN Bildfeld, in dem alle sechs Komponenten
// gleichzeitig an ihrem echten Platz sitzen. "Verwoben" ist dann keine
// Metapher mehr, sondern das, was man sieht.
//
// WARUM DIE ANORDNUNG NICHT ERFUNDEN IST. Paraffin erstarrt in Sphaerolithen:
// Lamellenstapel, die von einem Keim nach aussen strahlen, getrennt durch
// amorphe Zonen. An einer Oberflaeche keimen sie am Metall und wachsen von
// dort nach oben. Die Figur darf also radial sein. Zwei Dinge fallen dabei von
// selbst richtig aus:
//
//  - Wo zwei Faecher aufeinandertreffen, stossen sie an einer senkrechten
//    Ebene an (die Mittelsenkrechte zweier Keime, die beide auf derselben
//    Linie liegen, ist senkrecht). `buildFans` rechnet genau das aus dem
//    Keimabstand aus, statt eine huebsche Grenze zu malen. Die Faecher am Rand
//    duerfen deshalb breiter werden als die in der Mitte, und das ist korrekt.
//  - Genau in diesen Stossbereichen sind die Lamellen am kuerzesten, es
//    bleibt also ein Keil uebrig. Das ist die amorphe Zone, und dass
//    Mikrokristallin sie fuellt, ist die Aussage von `winterformel.sumDe`.
//
// Jedes gezeichnete Element steht schon im Text der Seite. Keine neue
// Behauptung, nur eine andere Darstellungsform.
//
// MASSSTAB. Die Filmdicke im Bild traegt den Chip `~1 µm`. Das ist eine
// Groessenordnung, keine Messung, und die Lamellen sind bewusst NICHT
// massstabsgetreu: 4 bis 5 nm waeren bei 1 µm Bildhoehe Haarlinien im
// Abstand von einem Viertelpixel. Ueberhoeht ist hier dasselbe Zugestaendnis
// wie bei den Wachsspalten in der Kettenlupe.


// ─── Bildraum ───────────────────────────────────────────────────────────────
// Das Seitenverhaeltnis ist eine Aussage, keine Layoutfrage. Eine erste
// Fassung war 520x400 mit sechs Keimen: die Faecher erreichten dann nur ein
// Fuenftel der Filmhoehe und der Rest war ein Wald aus senkrechten Strichen.
// Im echten Film liegen Filmdicke und Domaenengroesse in derselben
// Groessenordnung, also muessen ein paar Faecher die Hoehe fuellen und nicht
// ein Dutzend darin verschwinden. Vier Keime auf 520 Breite ergeben einen
// Keimabstand von 130 und damit einen Faecherradius von 65 — gut ein Drittel
// der Filmhoehe, darueber kolumnar. Das ist das Bild, das ein Schnitt durch
// einen an der Oberflaeche gekeimten Film wirklich zeigt.
export const VB = { w: 520, h: 300 } as const;
export const STEEL_Y = 240;   // Oberkante Stahl
export const FILM_TOP = 52;   // Oberkante Wachsfilm
const FILM_H = STEEL_Y - FILM_TOP;

/**
 * Gesaeter Zufall (mulberry32). Muss sein: ohne feste Saat wuerfelt jedes
 * Rendern neue Lamellenwinkel, die Figur flimmert bei jedem State-Wechsel
 * und zwei Screenshots sind nie vergleichbar.
 */
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Komponenten-Ids aus science.ts, die im Feld ein Element haben. */
export type FieldKey =
  | 'kristallstruktur' | 'matrix' | 'winterformel' | 'mos2' | 'sedimentation' | 'antioxidans';

// ─── Geometrie, einmal gerechnet ────────────────────────────────────────────

/**
 * Eine Lamelle ist ein Streckenzug, kein Strich: radial vom Keim nach aussen,
 * und wenn sie seitlich am Nachbarfaecher anstoesst, von dort senkrecht weiter
 * nach oben. Das ist kein Kunstgriff, sondern das, was in einem an einer
 * Oberflaeche gekeimten Film wirklich passiert: die Spaerolithe wachsen
 * halbkugelig, stossen seitlich aneinander und wachsen danach nur noch in die
 * einzige freie Richtung weiter, also kolumnar nach oben.
 *
 * Eine erste Fassung zog jede Lamelle in einem Zug bis an ihre Grenze. Die
 * senkrechten schossen dadurch bis unter die Filmoberflaeche, die schraegen
 * blieben kurz, und das Ergebnis sah nach Spiessen aus statt nach Faechern.
 */
export interface Lamella { x1: number; y1: number; mx: number; my: number; x2: number; y2: number; ft: boolean }
interface Fan { x: number; lamellae: Lamella[]; left: number; right: number }
interface Platelet { x: number; y: number; w: number; rot: number }

function buildFans(): Fan[] {
  const r = rng(20260916);
  // Keime auf der Stahloberflaeche, leicht ungleich verteilt: perfekt
  // gleichmaessig saehe nach Tapete aus, und echte Keimbildung ist es nicht.
  const xs = [0.12, 0.37, 0.62, 0.88].map(f => Math.round(f * VB.w + (r() - 0.5) * 18));
  return xs.map((x, i) => {
    const left = i === 0 ? x + 40 : (x - xs[i - 1]) / 2;
    const right = i === xs.length - 1 ? VB.w - x + 40 : (xs[i + 1] - x) / 2;
    const n = 17;
    const lamellae: Lamella[] = [];
    for (let j = 0; j < n; j++) {
      // -82°..+82°: eine Lamelle genau waagerecht haette unendliche
      // Reichweite nach oben und Null nach der Seite, also nur Rechenrauschen.
      const a = (-82 + (164 * j) / (n - 1) + (r() - 0.5) * 5) * (Math.PI / 180);
      const sa = Math.sin(a), ca = Math.cos(a);
      const byTop = ca > 0.02 ? FILM_H / ca : Infinity;
      const bySide = Math.abs(sa) > 0.02 ? (sa < 0 ? left : right) / Math.abs(sa) : Infinity;
      const reach = Math.min(byTop, bySide) * (0.88 + r() * 0.12);
      const r0 = 10 + r() * 8;   // der Keim selbst ist kein Punkt
      // Knick nur, wenn die Lamelle seitlich anstoesst, nicht wenn sie die
      // Filmoberflaeche erreicht: dort ist Schluss, da waechst nichts weiter.
      const mx = x + sa * reach, my = STEEL_Y - ca * reach;
      const turns = bySide < byTop;
      lamellae.push({
        x1: x + sa * r0, y1: STEEL_Y - ca * r0,
        mx, my,
        x2: mx, y2: turns ? FILM_TOP + (r() * 18) : my,
        // FT-Wachs ko-kristallisiert mit dem Paraffin und sitzt damit IN den
        // Faechern, nicht daneben: jede dritte Lamelle traegt es.
        ft: j % 3 === 1,
      });
    }
    return { x, lamellae, left, right };
  });
}

function buildPlatelets(sunken: boolean): Platelet[] {
  const r = rng(77002);
  const out: Platelet[] = [];
  for (let i = 0; i < 13; i++) {
    const x = 24 + r() * (VB.w - 48);
    // Normal: ueber die ganze Filmhoehe verteilt, unten dichter, weil die
    // Plaettchen am Stahl ihren Transferfilm bilden. Ohne Dispergiersystem
    // liegen sie alle unten und beruehren einander (FAILURES[2]: messbarer
    // Konzentrationsgradient von oben nach unten im Block).
    const t = sunken ? 0.90 + r() * 0.09 : Math.pow(r(), 0.45);
    out.push({
      x, y: FILM_TOP + (1 - t) * FILM_H * 0.02 + t * FILM_H * 0.98,
      w: 15 + r() * 11,
      // Am Stahl richten sie sich flach aus, das ist die Voraussetzung fuers
      // Basalebenen-Scheren. Weiter oben liegen sie beliebig.
      rot: (r() - 0.5) * (t > 0.8 ? 10 : 70),
    });
  }
  return out;
}


export const FANS = buildFans();
export const PLATELETS = buildPlatelets(false);
export const PLATELETS_SUNKEN = buildPlatelets(true);

/**
 * Amorphe Keile: der Zwickel, der uebrig bleibt, wo zwei Faecher aneinander
 * stossen. Er endet dort, wo die Faecher enden, also auf Hoehe des
 * Anstosspunkts — darueber wachsen beide Seiten kolumnar und dicht gepackt
 * weiter, dort ist kein Zwickel mehr. Eine erste Fassung zog die Keile bis an
 * die Filmoberflaeche; das sah nach Lichtschaechten aus und behauptete amorphe
 * Zonen, wo keine sind.
 */
export const WEDGES = FANS.slice(0, -1).map((f, i) => {
  const xm = (f.x + FANS[i + 1].x) / 2;
  const half = (FANS[i + 1].x - f.x) / 2;
  return { x: xm, halfW: 9 + (i % 2) * 3, top: STEEL_Y - half };
});

export const ANTIOX = (() => {
  const r = rng(31337);
  return Array.from({ length: 20 }, () => ({
    x: 16 + r() * (VB.w - 32),
    y: FILM_TOP + 8 + r() * (FILM_H - 16),
    a: r() * 180,
  }));
})();

// ─── Ankerpunkte fuer das Netz (Film-Labor, LabFilm.tsx) ─────────────
// Jede Komponente bekommt EINEN Punkt, an dem ihre Verbindungen ansetzen, und
// zwar dort, wo sie in dieser Zeichnung wirklich sitzt — abgeleitet aus
// derselben Geometrie, nicht daneben getippt. Das war der Konstruktionsfehler
// des alten Knotengraphen (FormulaGraph, bis 16.09.2026): frei erfundene
// Positionen, alle Kanten liefen auf MoS2 zu ("Oktopus"). Hier liegen die
// Punkte so weit auseinander, wie die Stoffe im Film auseinanderliegen.
//
//  Paraffin       die senkrechte Lamelle im linken Faecher
//  FT-Wachs       eine der kraeftigen FT-Lamellen im dritten Faecher
//  Mikrokristallin der amorphe Keil zwischen Faecher 1 und 2
//  MoS2           das Plaettchen, das in der Mitte am tiefsten am Stahl liegt
//  Dispergiersystem die Huelle um das hoechste Plaettchen rechts
//  Antioxidans    eine Marke nahe der Oberflaeche in der Mitte
const along = (l: Lamella, t: number) => ({ x: l.x1 + (l.mx - l.x1) * t, y: l.y1 + (l.my - l.y1) * t });
const pickPlatelet = (xMin: number, xMax: number, by: (a: Platelet, b: Platelet) => number) =>
  PLATELETS.filter(pl => pl.x >= xMin && pl.x <= xMax).sort(by)[0] ?? PLATELETS[0];
export const FIELD_ANCHORS: Record<FieldKey, { x: number; y: number }> = (() => {
  const low = pickPlatelet(VB.w * 0.38, VB.w * 0.66, (a, b) => b.y - a.y);
  const high = pickPlatelet(VB.w * 0.7, VB.w - 20, (a, b) => a.y - b.y);
  const ox = ANTIOX.filter(a => a.x > VB.w * 0.3 && a.x < VB.w * 0.6).sort((a, b) => a.y - b.y)[0] ?? ANTIOX[0];
  const w = WEDGES[0];
  return {
    kristallstruktur: along(FANS[0].lamellae[8], 0.62),
    matrix: along(FANS[2].lamellae.filter(l => l.ft)[3], 0.75),
    winterformel: { x: w.x, y: (w.top + STEEL_Y) / 2 },
    mos2: { x: low.x, y: low.y },
    sedimentation: { x: high.x + high.w / 2 + 5, y: high.y },
    antioxidans: { x: ox.x, y: ox.y },
  };
})();
export const FIELD_VB = VB;

// Die frueher hier gezeichnete Figur (WaxField) ist seit 25.09.2026 durch
// LabFilm (src/sections/science/lab) ersetzt. Diese Datei liefert nur noch
// die Geometrie, aus der beide gezeichnet wurden.

// Stahlrauheit, gesaet, damit sie sich zwischen zwei Renderings nicht bewegt.
const ROUGH = (() => {
  const r = rng(4711);
  return Array.from({ length: 27 }, (_, i) => ({
    x: (i * VB.w) / 26,
    y: STEEL_Y + (r() - 0.5) * 7,
  }));
})();
export const steelTopPath = () => ROUGH.map((pt, i) => `${i ? 'L' : 'M'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
