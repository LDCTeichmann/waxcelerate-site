/**
 * GLSL für die Wachs-Lupe (WebGL2, #version 300 es).
 *
 * Idee: Ein Vollbild-Dreieck deckt die Karte. Außerhalb einer Scheibe um den
 * Cursor ist die Ausgabe komplett transparent — das Foto darunter bleibt
 * unberührt. Innerhalb der Scheibe sampeln wir DASSELBE Foto (object-cover,
 * object-position 68%/50%, via uImgScaleOffset auf der CPU berechnet), ziehen
 * die UVs zur Mitte (Vergrößerung) und legen eine luminanzgekoppelte
 * Mikrotextur (fbm) darüber — sie liest sich als kristalline Wachs-Lamellen,
 * nicht als aufgesetzter Filter. Der Rand bekommt einen dünnen Brechungs-Ring.
 *
 * Straight alpha (nicht prämultipliziert) — der Hook setzt das Blending passend.
 */

export const VERT = /* glsl */ `#version 300 es
precision highp float;

// Vollbild-Dreieck ohne Attribut-Buffer: Position aus gl_VertexID ableiten.
// (-1,-1) (3,-1) (-1,3) deckt den Clip-Space garantiert ab.
out vec2 vUv;

void main() {
  vec2 p = vec2(
    float((gl_VertexID & 1) << 2) - 1.0,   // 0, 3, 0  -> -1, 3, -1
    float((gl_VertexID & 2) << 1) - 1.0    // 0, 0, 3  -> -1, -1, 3
  );
  vUv = p * 0.5 + 0.5;                       // [0,1] über das Canvas
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTex;            // Hero-Foto
uniform vec2  uTexResolution;      // Bild in Pixeln (natural size)
uniform vec2  uResolution;         // Canvas in Pixeln
uniform vec2  uCenter;             // Cursor in Canvas-px, y nach unten
uniform float uRadius;             // Lupen-Radius in px
uniform float uZoom;               // Vergrößerung (~1.8)
uniform float uActive;             // 0..1 Ein-/Ausblende-Ease
uniform float uTime;               // Sekunden
uniform vec4  uImgScaleOffset;     // (scaleX, scaleY, offsetX, offsetY): Canvas-UV -> Bild-UV

// ── Canvas-UV -> Bild-UV (repliziert object-cover + object-position) ─────────
vec2 toImageUv(vec2 uv) {
  return uv * uImgScaleOffset.xy + uImgScaleOffset.zw;
}

// ── Hash / Value-Noise / fbm ─────────────────────────────────────────────────
// Kompakt und deterministisch — kein Texture-Lookup nötig.
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Smoothstep-Interpolation der vier Gitterecken.
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  // Vier Oktaven reichen für eine feine Lamellen-Struktur.
  for (int i = 0; i < 4; i++) {
    sum += amp * valueNoise(p);
    p = p * 2.03 + 17.1;
    amp *= 0.5;
  }
  return sum;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
  vec2 fragPx = vUv * uResolution;          // Pixel-Koordinate dieses Fragments
  vec2 d = fragPx - uCenter;
  float dist = length(d);

  // Außerhalb der Scheibe: vollständig transparent — Foto bleibt unberührt.
  if (dist > uRadius || uActive < 0.001) {
    fragColor = vec4(0.0);
    return;
  }

  float r = dist / uRadius;                  // 0 Mitte .. 1 Rand

  // ── Vergrößerung: UV zur Mitte ziehen, weich auslaufend ────────────────────
  // mag<1 staucht das Sample-Fenster -> Bild wirkt größer. Zur Mitte voll,
  // zum Rand sanft auf 1.0 zurück, damit der Rand „brechend" wirkt.
  float falloff = smoothstep(1.0, 0.35, r);  // 1 in der Mitte, 0 am Rand
  float mag = mix(1.0, 1.0 / uZoom, falloff);
  vec2 lensFragPx = uCenter + d * mag;
  vec2 baseUv = toImageUv(lensFragPx / uResolution);

  // Leichte radiale Brechung am Rand — verschiebt das Sample minimal nach außen.
  float refract = smoothstep(0.6, 1.0, r) * 0.012;
  vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
  baseUv += dir * refract;

  vec3 col = texture(uTex, baseUv).rgb;

  // ── Kristalline Mikrotextur (luminanzgekoppelt) ───────────────────────────
  // Skala an die Bildauflösung gebunden, damit die Struktur unabhängig von der
  // Canvas-Größe gleich fein bleibt. Sehr langsame Zeitdrift -> lebt minimal.
  vec2 nUv = baseUv * uTexResolution * 0.05;
  float n  = fbm(nUv + uTime * 0.04);
  float n2 = fbm(nUv * 2.7 - uTime * 0.025);
  float crystal = (n * 0.65 + n2 * 0.35) - 0.5;   // um 0 zentriert

  // Helle Bereiche (Wachsglanz) tragen mehr Struktur als dunkle.
  float lum = luma(col);
  float amp = 0.10 * smoothstep(0.18, 0.85, lum);
  col += crystal * amp;

  // Dünner, heller Brechungs-Ring kurz vor dem Rand.
  float ring = smoothstep(0.86, 0.97, r) * (1.0 - smoothstep(0.97, 1.0, r));
  col += ring * 0.18;

  // ── Gefederte Alpha-Kante + globaler Aktiv-Fade ───────────────────────────
  float edge = 1.0 - smoothstep(0.92, 1.0, r);
  float alpha = edge * uActive;

  fragColor = vec4(clamp(col, 0.0, 1.0), alpha);
}
`;
