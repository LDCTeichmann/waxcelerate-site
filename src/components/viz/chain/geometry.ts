// ─── Kettengeometrie, eine Quelle ───────────────────────────────────────────
//
// Im Projekt gab es drei unabhaengig gezeichnete Ketten mit je eigenen
// Konstanten: ChainWaxMap (Wissenschaftsseite), FrictionLens (Produktseite)
// und DrivetrainSketch (Rechner). Sie driften auseinander, sobald jemand eine
// davon anfasst, und CLAUDE.md stellt fuer Produktdaten laengst dieselbe
// Regel auf: eine Quelle.
//
// Hier stehen nur Geometrie und Pfadhelfer, keine Farben und keine
// Komponenten. Farbe entscheidet die aufrufende Figur, weil die
// Wissenschaftsseite themefaehig ist (hell und .noir) waehrend die
// Produktseite in einem erzwungenen Dunkelband laeuft.
//
// Uebernommen aus ChainWaxMap (dort war die Geometrie am besten dokumentiert
// und bereits vollstaendig tokengetrieben) und aus sketches.tsx
// (sprocketPath, v2 der Rechner-Grafiken).

/** Kettenteilung nach ISO 606: 12,7 mm, also ein halbes Zoll. */
export const PITCH_MM = 12.7;

/** Teilkreisradius eines Zahnrads in mm: Umfang = Zaehne x Teilung. */
export const pitchRadiusMm = (teeth: number) => (teeth * PITCH_MM) / (2 * Math.PI);

/**
 * Seitenansicht: die Radien eines Gelenks im Verhaeltnis zueinander.
 * Bolzen : Kragen : Rolle liegt beim echten Gelenk etwa bei 1 : 2 : 3.
 * `lobe` und `waist` formen die Lasche (Auge und Taille).
 */
export const SIDE = { roller: 22, collar: 15, pin: 9, lobe: 27, waist: 19 } as const;

/** Die Teilung, fuer die die Absolutwerte in SIDE gezeichnet sind (ChainWaxMap). */
export const SIDE_PITCH = 66;

/**
 * Dieselben Radien, auf eine andere Teilung umgerechnet. Wer eine Kette neben
 * ein Ritzel zeichnet, MUSS das benutzen: Teilung und Zahnteilung sind
 * dieselbe Zahl, also haengt auch die Rollengroesse daran. Mit den
 * Absolutwerten aus SIDE an einer kleineren Teilung sitzt die Kette auf den
 * Zaehnen statt in den Sitzen. Zur Kontrolle: sprocketPath setzt den
 * Rollensitz auf 0,31 x Teilung, roller liegt bei 0,33 x Teilung.
 */
export function sideAt(pitch: number) {
  const k = pitch / SIDE_PITCH;
  return {
    roller: SIDE.roller * k, collar: SIDE.collar * k, pin: SIDE.pin * k,
    lobe: SIDE.lobe * k, waist: SIDE.waist * k,
  };
}

/**
 * Lupe: dasselbe Gelenk als konzentrische Ringe, von innen nach aussen
 * Bolzen, Wachsspalt, Laschenkragen, Wachsspalt, Rolle. Die beiden Spalte
 * sind bewusst ueberhoeht: massstabsgetreu waeren sie Haarlinien und damit
 * unsichtbar, und genau sie sind der Gegenstand der Figur.
 */
export const JOINT = { pin: 21, wax1: 28, collar: 44, wax2: 51, roller: 67 } as const;

/**
 * Laschenkontur in Seitenansicht: zwei Augen um x1 und x2, dazwischen eine
 * Taille. `R` ist der Augenradius, `waist` die halbe Taillenhoehe.
 */
export function platePath(x1: number, x2: number, y: number, R: number, waist: number) {
  const m = (x1 + x2) / 2;
  return `M ${x1} ${y - R} Q ${m} ${y - waist} ${x2} ${y - R} A ${R} ${R} 0 0 1 ${x2} ${y + R} `
    + `Q ${m} ${y + waist} ${x1} ${y + R} A ${R} ${R} 0 0 1 ${x1} ${y - R} Z`;
}

/**
 * Ring mit Loch, als ein Pfad mit fillRule="evenodd". Gestapelte Vollkreise
 * gehen nicht: die Metallflaechen sind halbtransparent, das Blau darunter
 * schiene durch und die Lupe saehe aus wie eine blaue Scheibe.
 */
export function ringPath(cx: number, cy: number, ro: number, ri: number) {
  return `M ${cx - ro} ${cy} a ${ro} ${ro} 0 1 0 ${ro * 2} 0 a ${ro} ${ro} 0 1 0 ${-ro * 2} 0 `
    + `M ${cx - ri} ${cy} a ${ri} ${ri} 0 1 1 ${ri * 2} 0 a ${ri} ${ri} 0 1 1 ${-ri * 2} 0`;
}

/**
 * Zahnrad-Silhouette: je Zahn ein Rollensitz (Radius ~ Rolle, ISO 606) und
 * ein gerundeter Zahnkopf. Teilung und Zahnteilung stehen im selben Massstab,
 * deshalb liegen die Kettenbolzen genau in den Sitzen. `phase` dreht das Rad.
 */
export function sprocketPath(cx: number, cy: number, n: number, R: number, P: number, phase: number) {
  const rs = 0.31 * P;
  const Ro = R + 0.32 * P;
  const step = (2 * Math.PI) / n;
  const dA = Math.min(rs / R, step * 0.3);
  const tA = step * 0.12;
  const pt = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  let d = '';
  for (let j = 0; j < n; j++) {
    const a = phase + j * step;
    d += `${j ? 'L' : 'M'}${pt(R + 0.05 * P, a - dA)} Q${pt(R - 1.9 * rs, a)} ${pt(R + 0.05 * P, a + dA)} `
      + `L${pt(Ro, a + step / 2 - tA)} Q${pt(Ro + 0.12 * P, a + step / 2)} ${pt(Ro, a + step / 2 + tA)} `;
  }
  return `${d}Z`;
}

/**
 * Metallabstufung als neutrale Grauwaesche statt ueber die Flaechentoken:
 * --sf2 ist zugleich der Fond der Teaser-Karte, dort waeren die Laschen
 * unsichtbar, und --sf3 ist im Noir-Theme dunkler als die Seite. Mittleres
 * Grau mit Alpha dunkelt helle Untergruende ab und hellt dunkle auf, wirkt
 * also in beiden Themes in dieselbe Richtung. R=G=B, wie DESIGN.md Abschnitt 1
 * fordert.
 */
export const METAL = {
  light: 'rgba(128,128,128,0.10)',
  mid: 'rgba(128,128,128,0.22)',
  strong: 'rgba(128,128,128,0.34)',
} as const;

/** Linienstaerken nach DESIGN.md Abschnitt 2. */
export const HAIR = { strokeWidth: 'var(--dw-hair)' } as const;
export const LINE = { strokeWidth: 'var(--dw-line)' } as const;
export const BOLD = { strokeWidth: 'var(--dw-bold)' } as const;
