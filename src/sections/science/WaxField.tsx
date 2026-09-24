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

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/hooks/useAnimation';

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
const VB = { w: 520, h: 300 } as const;
const STEEL_Y = 240;   // Oberkante Stahl
const FILM_TOP = 52;   // Oberkante Wachsfilm
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
interface Lamella { x1: number; y1: number; mx: number; my: number; x2: number; y2: number; ft: boolean }
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


/**
 * Der Streckenzug einer Lamelle, auf den Anteil `g` des Gesamtwegs gekuerzt.
 * Erst das radiale Stueck, dann das senkrechte. So waechst die Figur beim
 * Aufbau in derselben Reihenfolge, in der sie real erstarrt, statt dass alle
 * Punkte gleichzeitig nach aussen kriechen.
 */
function grown(l: Lamella, g: number) {
  const d1 = Math.hypot(l.mx - l.x1, l.my - l.y1);
  const d2 = Math.hypot(l.x2 - l.mx, l.y2 - l.my);
  const total = d1 + d2;
  if (total < 0.01 || g >= 1) return `${l.x1},${l.y1} ${l.mx},${l.my} ${l.x2},${l.y2}`;
  const want = total * g;
  if (want <= d1) {
    const t = want / (d1 || 1);
    return `${l.x1},${l.y1} ${l.x1 + (l.mx - l.x1) * t},${l.y1 + (l.my - l.y1) * t}`;
  }
  const t = (want - d1) / (d2 || 1);
  return `${l.x1},${l.y1} ${l.mx},${l.my} ${l.mx + (l.x2 - l.mx) * t},${l.my + (l.y2 - l.my) * t}`;
}

const FANS = buildFans();
const PLATELETS = buildPlatelets(false);
const PLATELETS_SUNKEN = buildPlatelets(true);

/**
 * Amorphe Keile: der Zwickel, der uebrig bleibt, wo zwei Faecher aneinander
 * stossen. Er endet dort, wo die Faecher enden, also auf Hoehe des
 * Anstosspunkts — darueber wachsen beide Seiten kolumnar und dicht gepackt
 * weiter, dort ist kein Zwickel mehr. Eine erste Fassung zog die Keile bis an
 * die Filmoberflaeche; das sah nach Lichtschaechten aus und behauptete amorphe
 * Zonen, wo keine sind.
 */
const WEDGES = FANS.slice(0, -1).map((f, i) => {
  const xm = (f.x + FANS[i + 1].x) / 2;
  const half = (FANS[i + 1].x - f.x) / 2;
  return { x: xm, halfW: 9 + (i % 2) * 3, top: STEEL_Y - half };
});

const ANTIOX = (() => {
  const r = rng(31337);
  return Array.from({ length: 20 }, () => ({
    x: 16 + r() * (VB.w - 32),
    y: FILM_TOP + 8 + r() * (FILM_H - 16),
    a: r() * 180,
  }));
})();

// ─── Ankerpunkte fuer das Netz ("Netz im Film", FieldNet.tsx) ─────────────
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

// ─── Aufbau-Reihenfolge ─────────────────────────────────────────────────────
// Die physikalische Erstarrung, NICHT die Reihenfolge der Liste daneben. Die
// Liste folgt FORMULA_STORY (Paraffin, MoS2, FT, Mikro, Dispergier, Antiox).
// Beides gleichzuschalten waere falsch: MoS2 kommt nicht nach dem Paraffin
// dazu, es ist von Anfang an in der Schmelze und wird eingebettet.
const PHASE: Record<string, [number, number]> = {
  melt: [0.00, 0.10],
  lamellae: [0.08, 0.46],
  ft: [0.34, 0.56],
  wedges: [0.46, 0.66],
  platelets: [0.56, 0.78],
  shells: [0.72, 0.88],
  antiox: [0.82, 1.00],
};
const at = (p: number, key: keyof typeof PHASE) => {
  const [a, b] = PHASE[key];
  return Math.max(0, Math.min(1, (p - a) / (b - a)));
};

// ─── Farben ─────────────────────────────────────────────────────────────────
// DESIGN.md Abschnitt 1: Graustufen strikt R=G=B. Blau ist ausschliesslich
// Wachs. Der Stahl bekommt eine neutrale Grauwaesche mit Alpha, die auf hellem
// Grund abdunkelt und auf dunklem aufhellt, also in beiden Themes in dieselbe
// Richtung wirkt.
//
// MoS2 war als "das dunkelste Element" geplant. Das geht in einer themefaehigen
// Figur nicht: im Noir-Theme ist nichts dunkler als der Seitengrund, ein
// schwarzes Plaettchen waere unsichtbar. Die uebertragbare Fassung derselben
// Absicht ist "das kontraststaerkste Element", also var(--tx1) — und dann darf
// sonst NICHTS in der Figur var(--tx1) benutzen. Die Stahlkante tat das in
// einer Zwischenfassung und war im Dunkelmodus ein weisser Balken, der mit den
// Plaettchen um dieselbe Rolle konkurrierte; sie laeuft jetzt ueber STEEL_EDGE.
const STEEL = 'rgba(128,128,128,0.26)';
const STEEL_HATCH = 'rgba(128,128,128,0.42)';
const STEEL_EDGE = 'rgba(128,128,128,0.85)';

interface Props {
  de: boolean;
  /** Hervorgehobene Komponente; alle anderen treten zurueck. */
  active?: FieldKey | null;
  /** Zustand ohne diese Komponente ("nimm eine weg"). */
  missing?: FieldKey | null;
  /** 0..1, Aufbau. 1 = fertig. */
  progress?: number;
  /** Nur diese Komponenten zeigen (Scroll-Geschichte baut den Film Stoff fuer
   *  Stoff auf). Fehlt es, sind alle da. Die anderen blenden weich aus. */
  present?: FieldKey[] | null;
  /** Wie weit die nicht hervorgehobenen Komponenten zuruecktreten (Deckkraft). */
  dimLevel?: number;
  /** Belastungstest: mehrere Stoffe gleichzeitig weglassen. */
  without?: FieldKey[];
  /** Belastungstest: Risse zeigen (Kaelte ohne Mikrokristallin). Ohne Angabe
   *  gilt der alte "Nimm eine weg"-Zustand: Risse, sobald Mikro fehlt. */
  cracked?: boolean;
  /** 0..1 — Oberflaeche rundet ab und wandert (Waerme ueber dem Tropfpunkt).
   *  Ohne Angabe: 1, sobald FT-Wachs fehlt. */
  slump?: number;
  /** 0..1 — Staerke des Fe–S-Transferfilms am Stahl (waechst unter Last). */
  transfer?: number;
}

export function WaxField({ de, active = null, missing = null, progress = 1, present = null, dimLevel = 0.14, without = [], cracked, slump, transfer = 1 }: Props) {
  const p = progress;
  const on = (k: FieldKey) => (!present || present.includes(k) ? 1 : 0);
  const fade = { transition: 'opacity .6s ease' } as const;
  // Hervorheben und Weglassen schliessen einander aus. Eine Zwischenfassung
  // liess beides gleichzeitig gelten: im Zustand "ohne Mikrokristallin" war
  // Mikrokristallin die offene Zeile, also wurde alles ANDERE auf 14 Prozent
  // gedimmt — und das Weggelassene war ohnehin nicht gezeichnet. Uebrig blieb
  // ein fast leeres Feld. Wer "nimm eine weg" anschaut, will den ganzen Film
  // in seinem kaputten Zustand sehen, nicht einen ausgeblendeten.
  const dim = (k: FieldKey) => (!missing && active && active !== k ? dimLevel : 1) * on(k);

  const gone = (k: FieldKey) => missing === k || without.includes(k);
  const noMicro = gone('winterformel');
  const noFt = gone('matrix');
  const noMos = gone('mos2');
  const noDisp = gone('sedimentation');
  const noAntiox = gone('antioxidans');
  const showCracks = cracked ?? noMicro;
  const sl = slump ?? (noFt ? 1 : 0);

  const platelets = noDisp ? PLATELETS_SUNKEN : PLATELETS;

  const svg = (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto" role="img"
      aria-label={de
        ? 'Schnitt durch den erstarrten Wachsfilm auf dem Stahl, etwa ein Mikrometer dick: Lamellenfaecher wachsen von Keimen am Stahl nach oben, dazwischen amorphe Keile, am Stahl liegen MoS2-Plaettchen.'
        : 'Cross-section through the solidified wax film on steel, about one micrometre thick: lamellar fans grow upward from nuclei at the steel, amorphous wedges between them, MoS2 platelets lying at the steel.'}>
      <defs>
        <clipPath id="wf-film">
          <rect x="0" y={FILM_TOP} width={VB.w} height={FILM_H} />
        </clipPath>
        {/* Schnittkante des Stahls schraffiert, wie in einer technischen
            Zeichnung. Das sagt "hier ist aufgeschnitten" ohne ein Wort. */}
        <pattern id="wf-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={STEEL_HATCH} strokeWidth="var(--dw-hair)" />
        </pattern>
      </defs>

      {/* ── Schmelze / Wachsgrundflaeche ─────────────────────────────────── */}
      <rect x="0" y={FILM_TOP} width={VB.w} height={FILM_H}
        fill="rgba(var(--accent-rgb),0.07)" opacity={at(p, 'melt')} />

      <g clipPath="url(#wf-film)">
        {/* ── Amorphe Keile, gefuellt von Mikrokristallin ────────────────── */}
        <g opacity={at(p, 'wedges') * dim('winterformel')} style={fade}>
          {WEDGES.map((w, i) => (
            <path key={i}
              d={`M ${w.x - w.halfW} ${w.top} L ${w.x + w.halfW} ${w.top} L ${w.x + 2} ${STEEL_Y} L ${w.x - 2} ${STEEL_Y} Z`}
              fill={noMicro ? 'transparent' : 'rgba(var(--accent-rgb),0.13)'}
              stroke={noMicro ? 'var(--txff)' : 'none'}
              strokeWidth="var(--dw-hair)"
              strokeDasharray={noMicro ? '3 3' : undefined} />
          ))}
        </g>

        {/* ── Paraffin: die Lamellenfaecher ──────────────────────────────── */}
        <g opacity={dim('kristallstruktur')} style={fade}>
          {FANS.map((f, fi) => (
            <g key={fi}>
              {f.lamellae.filter(l => !l.ft).map((l, li) => (
                <polyline key={li} points={grown(l, at(p, 'lamellae'))} fill="none"
                  stroke="rgba(var(--accent-rgb),0.5)" strokeWidth="var(--dw-hair)"
                  strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </g>
          ))}
        </g>

        {/* ── FT-Wachs: dichtere, defektaermere Lamellenbereiche ─────────── */}
        {/* Es sitzt IN den Faechern, weil es mit dem Paraffin ko-kristallisiert
            (EDGES: FT-Wachs -> Paraffin, "Ko-Kristallisation"). Deshalb keine
            eigene Zone, sondern jede dritte Lamelle, kraeftiger gezeichnet. */}
        {!noFt && (
          <g opacity={at(p, 'ft') * dim('matrix')} style={fade}>
            {FANS.map((f, fi) => (
              <g key={fi}>
                {f.lamellae.filter(l => l.ft).map((l, li) => (
                  <polyline key={li} points={grown(l, 1)} fill="none"
                    stroke="rgba(var(--accent-rgb),0.9)" strokeWidth="var(--dw-line)"
                    strokeLinecap="round" strokeLinejoin="round" />
                ))}
              </g>
            ))}
          </g>
        )}

        {/* ── Ohne FT-Wachs: die Matrix rundet oben ab und wandert weg ───── */}
        {sl > 0.01 && (
          <path d={`M 0 ${FILM_TOP + 18 * sl} Q ${VB.w * 0.25} ${FILM_TOP + 3 * sl} ${VB.w * 0.5} ${FILM_TOP + 22 * sl}
                    Q ${VB.w * 0.75} ${FILM_TOP + 42 * sl} ${VB.w} ${FILM_TOP + 15 * sl} L ${VB.w} ${FILM_TOP} L 0 ${FILM_TOP} Z`}
            fill="var(--pg)" stroke="var(--txff)" strokeWidth="var(--dw-hair)" strokeDasharray="4 3" />
        )}

        {/* ── Ohne Mikrokristallin: der Film reisst in der Kaelte ────────── */}
        {/* FAILURES[0], die erste echte Iteration: "Wachsschicht platzte bei
            < 5 °C ab, Biegebelastung brach die sproede Matrix." Kein
            ausgedachter Zustand.

            Ein Riss ist ein SPALT, keine Linie. Eine erste Fassung zog einen
            dicken Strich durch den Film; auf dem blauen Lamellenfeld war der
            praktisch unsichtbar, und der Zustand, um den es in dieser Zeile
            geht, kam gar nicht an. Jetzt ist es eine Flaeche in der Seitenfarbe
            mit Haarlinienrand: dahinter ist nichts mehr, und genau das ist die
            Aussage. Nach unten laeuft der Spalt breiter zu und endet in einer
            Abloesung am Stahl, weil der Film dort abplatzt und nicht in der
            Mitte auseinanderfaellt. */}
        {showCracks && (
          <g>
            {WEDGES.map((w, i) => {
              const top = FILM_TOP + 2, bot = STEEL_Y - 1;
              const k = (f: number) => top + (bot - top) * f;
              const wid = (f: number) => 1.5 + f * 7;
              const pts = [0, 0.34, 0.68, 1];
              const leftEdge = pts.map(f => `${w.x - wid(f) + (f === 0.34 ? -5 : f === 0.68 ? 4 : 0)},${k(f)}`);
              const rightEdge = pts.slice().reverse().map(f => `${w.x + wid(f) + (f === 0.34 ? -5 : f === 0.68 ? 4 : 0)},${k(f)}`);
              return (
                <polygon key={`crack-${i}`} points={[...leftEdge, ...rightEdge].join(' ')}
                  fill="var(--pg)" stroke={STEEL_EDGE} strokeWidth="var(--dw-hair)" strokeLinejoin="round" />
              );
            })}
            {/* Abloesung: der Film liegt nicht mehr ueberall auf. */}
            <path d={`M 0 ${STEEL_Y - 3} Q ${VB.w * 0.16} ${STEEL_Y - 13} ${VB.w * 0.33} ${STEEL_Y - 3}
                      M ${VB.w * 0.58} ${STEEL_Y - 3} Q ${VB.w * 0.74} ${STEEL_Y - 15} ${VB.w * 0.92} ${STEEL_Y - 3}`}
              fill="none" stroke="var(--pg)" strokeWidth="6" />
            <path d={`M 0 ${STEEL_Y - 3} Q ${VB.w * 0.16} ${STEEL_Y - 13} ${VB.w * 0.33} ${STEEL_Y - 3}
                      M ${VB.w * 0.58} ${STEEL_Y - 3} Q ${VB.w * 0.74} ${STEEL_Y - 15} ${VB.w * 0.92} ${STEEL_Y - 3}`}
              fill="none" stroke={STEEL_EDGE} strokeWidth="var(--dw-line)" />
          </g>
        )}

        {/* ── MoS2-Plaettchen ────────────────────────────────────────────── */}
        {!noMos && (
          <g opacity={at(p, 'platelets') * dim('mos2')} style={fade}>
            {platelets.map((pl, i) => (
              <g key={i} transform={`translate(${pl.x} ${pl.y}) rotate(${pl.rot})`}>
                {/* Sterische Huelle des Dispergiersystems um jedes Partikel.
                    Ohne sie sinken und verklumpen die Plaettchen, siehe
                    PLATELETS_SUNKEN oben. */}
                {!noDisp && (
                  <ellipse rx={pl.w / 2 + 5} ry={7} fill="none"
                    stroke="rgba(var(--accent-rgb),0.5)" strokeWidth="var(--dw-hair)"
                    strokeDasharray="2.5 2.5"
                    opacity={at(p, 'shells') * dim('sedimentation')} style={fade} />
                )}
                <rect x={-pl.w / 2} y={-1.8} width={pl.w} height={3.6} rx={1.4}
                  fill="var(--tx1)" />
              </g>
            ))}
          </g>
        )}
      </g>

      {/* ── Stahl ──────────────────────────────────────────────────────────── */}
      {/* Rauheit als echte Zacken, nicht als glatte Linie: die Zonen-01-Copy
          in ContactZones redet von genau dieser Oberflaeche. */}
      <path d={steelPath()} fill="url(#wf-hatch)" />
      <path d={steelPath()} fill={STEEL} />
      <path d={steelTopPath()} fill="none" stroke={STEEL_EDGE} strokeWidth="var(--dw-bold)" />

      {/* Fe-S-Transferfilm auf dem Stahl: das Ergebnis, nicht die Zutat. */}
      {!noMos && (
        <path d={steelTopPath()} fill="none" stroke="var(--accent)" strokeWidth="var(--dw-line)"
          transform="translate(0,-4)" opacity={at(p, 'platelets') * 0.8 * dim('mos2') * transfer} style={fade} />
      )}

      {/* ── Antioxidans: feine Marken im ganzen Volumen ───────────────────── */}
      {!noAntiox && (
        <g opacity={at(p, 'antiox') * dim('antioxidans')} clipPath="url(#wf-film)" style={fade}>
          {ANTIOX.map((a, i) => (
            <g key={i} transform={`translate(${a.x} ${a.y}) rotate(${a.a})`}>
              <line x1={-3.5} y1="0" x2={3.5} y2="0" stroke="var(--accent)" strokeWidth="var(--dw-hair)" />
              <line x1="0" y1={-3.5} x2="0" y2={3.5} stroke="var(--accent)" strokeWidth="var(--dw-hair)" />
            </g>
          ))}
        </g>
      )}

    </svg>
  );

  // ── Die zwei Beschriftungen liegen NEBEN dem SVG, nicht darin ────────────
  // DESIGN.md Abschnitt 2: Schrift in Figuren nie unter 11 px. Eine erste
  // Fassung setzte sie als <text fontSize="13"> in die viewBox. Das
  // skaliert mit: nachgemessen kamen bei 360 px Fensterbreite 9,3 px heraus,
  // und selbst bei 1280 px nur 10 px, weil die Figur in einer schmalen Spalte
  // steht. Als HTML daneben haengt die Groesse an gar keinem Massstab mehr.
  // Die Prozentwerte kommen aus denselben Konstanten wie die Zeichnung,
  // koennen also nicht davon abdriften.
  return (
    <div className="relative">
      {svg}
      <span className="absolute text-[11px] pointer-events-none" aria-hidden
        style={{ left: '2%', top: `${((STEEL_Y + 16) / VB.h) * 100}%`, color: 'var(--txm)' }}>
        {de ? 'Stahl' : 'Steel'}
      </span>
      <span className="absolute text-[11px] pointer-events-none" aria-hidden
        style={{ right: '2%', top: `${((FILM_TOP - 24) / VB.h) * 100}%`, color: 'var(--txm)' }}>
        {de ? 'Filmoberfläche' : 'Film surface'}
      </span>
    </div>
  );
}

// Stahlrauheit, gesaet, damit sie sich zwischen zwei Renderings nicht bewegt.
const ROUGH = (() => {
  const r = rng(4711);
  return Array.from({ length: 27 }, (_, i) => ({
    x: (i * VB.w) / 26,
    y: STEEL_Y + (r() - 0.5) * 7,
  }));
})();
const steelTopPath = () => ROUGH.map((pt, i) => `${i ? 'L' : 'M'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
const steelPath = () => `${steelTopPath()} L ${VB.w} ${VB.h} L 0 ${VB.h} Z`;

/**
 * Der Aufbau als Hook: 0 -> 1 in `ms`, einmal, sobald die Figur sichtbar wird.
 * Bei `prefers-reduced-motion` sofort der Endzustand, ohne Timer.
 * Gibt zusaetzlich `replay` zurueck, damit der Vorgang nicht einmalig ist.
 */
export function useFieldBuild(ms = 3500) {
  const [p, setP] = useState(() => (prefersReducedMotion() ? 1 : 0));
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  const run = () => {
    if (prefersReducedMotion()) { setP(1); return; }
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      setP(t);
      raf.current = t < 1 ? requestAnimationFrame(step) : null;
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    // Einmal, wenn die Figur wirklich zu sehen ist. Ein Aufbau, der beim
    // Seitenaufbau weit oberhalb des Sichtfelds ablaeuft, ist kein Aufbau.
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { run(); obs.disconnect(); }
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => { obs.disconnect(); if (raf.current !== null) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { p, ref, replay: run };
}
