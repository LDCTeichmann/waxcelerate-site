// ─── Geometrie der Formel-Reise ──────────────────────────────────────────────
//
// Eine einzige Welt in Millimetern, eine Kamera. Die Szenen (Kette, Gelenk,
// Spalt, Film) sind keine getrennten Bilder, sondern liegen ineinander: der
// Spalt sitzt wirklich an der Druckseite von Bolzen B, der Film wirklich in
// diesem Spalt. Die Kamera faehrt hinein, statt von Bild zu Bild zu schneiden
// ("Powers of Ten"). Darum stehen hier echte Masse und keine Layoutzahlen.
//
// Kette: 1/2" Teilung (12,7 mm), Rolle 7,75 mm, Bolzen 3,7 mm. Buchsenlos:
// der Kragen der Innenlasche ist die Buchse. Kettenblatt 40 Zaehne, also
// knickt jedes Glied beim Auflaufen um 360°/40 = 9°.
//
// Spalt und Film: der Bolzen liegt unter Zug einseitig am Kragen an. Dort
// trennen die beiden Stahlflaechen nur wenige Mikrometer, das ist der Ort, an
// dem der Film arbeitet. Die Filmdicke im Bild (3 µm) ist eine
// Groessenordnung, keine Messung. Die Kristalle darin sind schematisch, aber
// in der richtigen Form: Paraffin erstarrt in Plaettchen, mikrokristallines
// Wachs in feinen, unregelmaessigen Nadeln (bis 26.09.2026 standen hier
// Faecher aus einem Keim, also Sphaerolithe. Die bildet Paraffinwachs so
// nicht).

// ─── Gesaeter Zufall ─────────────────────────────────────────────────────────
// Ohne feste Saat wuerfelt jedes Rendern neu und die Figur flimmert.
export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (a: number, b: number, v: number) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Kette am Kettenblatt ────────────────────────────────────────────────────
export const PITCH = 12.7;
export const TEETH = 40;
export const DELTA = (Math.PI * 2) / TEETH;
export const RING_R = PITCH / (2 * Math.sin(DELTA / 2));   // Teilkreis, ~80,9 mm
export const PIN_R = 1.85;
export const COLLAR_R = 2.65;                               // Aussenradius Kragen = Bohrung der Rolle
export const ROLLER_R = 3.875;

export interface Pin { k: number; x: number; y: number }

/**
 * Bolzenpositionen fuer den Drehwinkel `alpha` des Kettenblatts (rad, im
 * Uhrzeigersinn, 0 = oben). Das obere Trum laeuft von links unter Zug aufs
 * Blatt; das ist bei Blick auf die Antriebsseite eines nach rechts fahrenden
 * Rads tatsaechlich die Zugseite.
 *
 * Aufliegende Bolzen sitzen auf dem Teilkreis bei psi = alpha − k·Delta. Der
 * erste freie Bolzen liegt auf der Tangente y = −R im Abstand einer Teilung
 * vom letzten aufliegenden. Das Glied dazwischen ist das, das gerade einknickt.
 */
export function pinsAt(alpha: number, free = 16, seated = 17): Pin[] {
  const k0 = Math.floor(alpha / DELTA);
  const psi0 = alpha - k0 * DELTA;
  const out: Pin[] = [];
  for (let k = k0 - seated; k <= k0; k++) {
    const psi = alpha - k * DELTA;
    out.push({ k, x: RING_R * Math.sin(psi), y: -RING_R * Math.cos(psi) });
  }
  const dy = RING_R - RING_R * Math.cos(psi0);
  const xB = RING_R * Math.sin(psi0) - Math.sqrt(PITCH * PITCH - dy * dy);
  for (let j = 0; j < free; j++) out.push({ k: k0 + 1 + j, x: xB - j * PITCH, y: -RING_R });
  return out;
}

/** Drehwinkel, in dem die Kette fuer die Kamerafahrt stehen bleibt: das
 *  einknickende Glied steht genau auf halbem Weg (4,5°). */
export const ALPHA_F = 20 * DELTA + DELTA / 2;
export const PINS_F = pinsAt(ALPHA_F);
const kB = Math.floor(ALPHA_F / DELTA) + 1;
/** Bolzen B: der erste freie Bolzen, dort knickt das Gelenk ein. */
export const PIN_B = PINS_F.find(p => p.k === kB)!;
export const PIN_A = PINS_F.find(p => p.k === kB - 1)!;

/** Laschenkontur (Achter) von (0,0) nach (PITCH,0). */
export function platePath(rE: number, rW: number) {
  const p = PITCH, h = p / 2;
  return `M0 ${-rE} C${p * 0.24} ${-rE} ${p * 0.3} ${-rW} ${h} ${-rW} C${p * 0.7} ${-rW} ${p * 0.76} ${-rE} ${p} ${-rE}`
    + ` A${rE} ${rE} 0 1 1 ${p} ${rE} C${p * 0.76} ${rE} ${p * 0.7} ${rW} ${h} ${rW} C${p * 0.3} ${rW} ${p * 0.24} ${rE} 0 ${rE}`
    + ` A${rE} ${rE} 0 1 1 0 ${-rE} Z`;
}
export const OUTER_PLATE = platePath(4.1, 3.2);
export const INNER_PLATE = platePath(4.35, 3.45);

/** Zahnkontur des Kettenblatts im eigenen (ungedrehten) Rahmen. */
export const RING_PATH = (() => {
  const pts: string[] = [];
  const steps = TEETH * 8;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    // Zahngrund genau unter jedem Bolzen (a = k·Delta), Spitze dazwischen.
    const ph = (a / DELTA) % 1;
    const tooth = Math.pow(Math.sin(Math.PI * ph), 1.6);
    const r = RING_R - ROLLER_R - 0.35 + tooth * 7.2;
    pts.push(`${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
})();

// ─── Kontaktrahmen: Spalt und Film an der Druckseite von Bolzen B ───────────
//
// Lokale Koordinaten in µm, X nach rechts, Y nach unten, Ursprung auf der
// Bolzenoberflaeche am Beruehrpunkt. Die Kamera dreht beim Hineinfahren um
// 90°, damit der Bolzen unten und der Kragen oben liegt: so liest man einen
// Film "auf Stahl" am schnellsten.
export const CONTACT = { x: PIN_B.x - PIN_R, y: PIN_B.y };
export const contactToWorld = (X: number, Y: number) => ({ x: CONTACT.x + Y * 1e-3, y: CONTACT.y - X * 1e-3 });
/** Affine Matrix [a b c d e f] Kontakt-lokal (µm) → Welt (mm). */
export const CONTACT_MATRIX: [number, number, number, number, number, number] = [0, -1e-3, 1e-3, 0, CONTACT.x, CONTACT.y];

export const GAP_H0 = 3;                    // µm Abstand am Beruehrpunkt
const RP = PIN_R * 1000, RB = RP + 15;      // Bolzen, Bohrung (15 µm Spiel)

const phases = (() => { const r = rng(4711); return [r(), r(), r(), r(), r(), r()].map(v => v * Math.PI * 2); })();
const win = (X: number) => clamp01(1 - (Math.abs(X) - 11) / 5);
const roughPin = (X: number) => win(X) * (0.09 * Math.sin((2 * Math.PI * X) / 1.6 + phases[0]) + 0.035 * Math.sin((2 * Math.PI * X) / 0.8 + phases[1]) + 0.05 * Math.sin((2 * Math.PI * X) / 3.4 + phases[2]));
const roughBore = (X: number) => win(X) * (0.08 * Math.sin((2 * Math.PI * X) / 1.4 + phases[3]) + 0.03 * Math.sin((2 * Math.PI * X) / 0.7 + phases[4]) + 0.05 * Math.sin((2 * Math.PI * X) / 2.7 + phases[5]));
export const pinY = (X: number) => RP - Math.sqrt(RP * RP - X * X) - roughPin(X);
export const boreY = (X: number) => -GAP_H0 + RB - Math.sqrt(RB * RB - X * X) + roughBore(X);

function sampleXs() {
  const xs: number[] = [];
  for (let x = -420; x < -16; x += 12) xs.push(x);
  for (let x = -16; x <= 16; x += 0.08) xs.push(+x.toFixed(2));
  for (let x = 28; x <= 420; x += 12) xs.push(x);
  return xs;
}
const XS = sampleXs();
const line = (f: (x: number) => number) => XS.map(x => `${x} ${f(x).toFixed(3)}`).join(' L');
export const PIN_SURFACE = `M${line(pinY)}`;
export const BORE_SURFACE = `M${line(boreY)}`;
export const PIN_BODY = `M${line(pinY)} L420 900 L-420 900 Z`;
export const BORE_BODY = `M${line(boreY)} L420 -900 L-420 -900 Z`;
export const FILM_BAND = `M${line(boreY)} L${XS.slice().reverse().map(x => `${x} ${pinY(x).toFixed(3)}`).join(' L')} Z`;

// ─── Filminhalt (nur im Film-Massstab sichtbar) ──────────────────────────────
export interface Plate { x: number; y: number; len: number; rot: number; ft: boolean; d: number }
export interface Needle { x: number; y: number; len: number; rot: number; d: number }
export interface Flake { x: number; y: number; w: number; rot: number }

const FILM_X = 8.5;
const midY = (X: number) => (pinY(X) + boreY(X)) / 2;

export const PLATES: Plate[] = (() => {
  const r = rng(20260926);
  return Array.from({ length: 96 }, (_, i) => {
    const x = (r() * 2 - 1) * FILM_X;
    const top = boreY(x) + 0.15, bot = pinY(x) - 0.15;
    const y = top + r() * (bot - top);
    // Wachstumsfront vom Stahl nach oben: unten zuerst, oben zuletzt.
    const d = 0.05 + 0.55 * ((bot - y) / (bot - top)) + 0.2 * r();
    return { x, y, len: 0.7 + r() * 1.6, rot: (r() - 0.5) * 150, ft: i % 4 === 1, d };
  });
})();

export const NEEDLES: Needle[] = (() => {
  const r = rng(90210);
  return Array.from({ length: 170 }, () => {
    const x = (r() * 2 - 1) * FILM_X;
    const top = boreY(x) + 0.1, bot = pinY(x) - 0.1;
    return { x, y: top + r() * (bot - top), len: 0.12 + r() * 0.24, rot: r() * 180, d: r() * 0.6 };
  });
})();

export const FLAKES: Flake[] = (() => {
  const r = rng(77002);
  const xs = [-6.4, -3.1, 0.6, 3.8, 6.6, -4.9, 2.2, 5.3];
  return xs.map((x, i) => {
    // Am Stahl richten sich die Plaettchen flach aus, das ist die
    // Voraussetzung fuers Gleiten auf der Basalebene. Weiter innen liegen sie
    // beliebig.
    const onPin = i < 4, onBore = i === 4 || i === 5;
    const y = onPin ? pinY(x) - 0.24 : onBore ? boreY(x) + 0.24 : midY(x) + (r() - 0.5) * 0.8;
    return { x, y, w: 1.0 + r() * 0.7, rot: onPin || onBore ? (r() - 0.5) * 6 : (r() - 0.5) * 70 };
  });
})();

/** Rauheitsspitzen des Bolzens nahe dem Beruehrpunkt: hier reisst ohne
 *  Festschmierstoff der Film zuerst. */
export const PEAKS = (() => {
  const out: { x: number; y: number }[] = [];
  for (let x = -6.5; x <= 6.5; x += 0.04) {
    const a = pinY(x - 0.04), b = pinY(x), c = pinY(x + 0.04);
    if (b < a && b < c) out.push({ x, y: b });
  }
  const step = Math.max(1, Math.floor(out.length / 7));
  return out.filter((_, i) => i % step === 0).slice(0, 7);
})();

export const CRACKS = [-5.2, -1.1, 3.4, 7.0].map((x, i) => {
  const r = rng(300 + i);
  const top = boreY(x), bot = pinY(x);
  const pts: string[] = [];
  for (let j = 0; j <= 6; j++) {
    const t = j / 6;
    pts.push(`${(x + (r() - 0.5) * 0.7).toFixed(2)} ${(top + (bot - top) * t).toFixed(2)}`);
  }
  return pts.join(' ');
});

export const ANTIOX = (() => {
  const r = rng(31337);
  return Array.from({ length: 16 }, () => {
    const x = (r() * 2 - 1) * FILM_X * 0.9;
    return { x, y: midY(x) + (r() - 0.5) * 2, a: r() * 60 };
  });
})();

export const RADICALS = (() => {
  const r = rng(555);
  return Array.from({ length: 7 }, () => {
    const x = (r() * 2 - 1) * FILM_X * 0.85;
    return { x, y: midY(x) + (r() - 0.5) * 1.6, dx: (r() - 0.5) * 1.6, dy: (r() - 0.5) * 0.8 };
  });
})();

/** Staubkoerner im Oelfilm (Spalt-Massstab, 100 µm). */
export const GRIT = (() => {
  const r = rng(8080);
  return [-34, -22, -12, -2, 9, 19, 30].map(x0 => {
    const size = 0.75 + r() * 0.45;
    const pts = Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2, rr = size * (0.7 + r() * 0.5);
      return `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
    }).join(' ');
    return { x0, y: midY(x0) + (r() - 0.5) * 0.4, pts, travel: 10 + r() * 8, spin: 120 + r() * 200 };
  });
})();

/** Ankerpunkte der Mikroskop-Lupe, im Kontaktrahmen (µm). */
export const SCOPE_ANCHOR = {
  paraffin: (() => { const p = PLATES.find(q => !q.ft && Math.abs(q.x + 2) < 1.5)!; return { x: p.x, y: p.y }; })(),
  mos2: { x: FLAKES[1].x, y: FLAKES[1].y },
  ft: (() => { const p = PLATES.find(q => q.ft && Math.abs(q.x - 1.5) < 2)!; return { x: p.x, y: p.y }; })(),
  micro: { x: -1.1, y: midY(-1.1) },
  disp: { x: FLAKES[6].x, y: FLAKES[6].y },
  antiox: { x: ANTIOX[3].x, y: ANTIOX[3].y },
} as const;
