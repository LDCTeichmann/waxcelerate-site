// ─── CassetteLens — das Kassettenfoto mit Lupe und Zoomlinse ────────────────
//
// Herkunft: die Komposition stammt von der Wachs-Produktseite
// (`src/pages/product/wax/FrictionLens.tsx`, Block `.wxp-cassette`): Foto,
// ein Ring auf einer echten Zahnflanke, eine gestrichelte Leitlinie und eine
// grosse Linse, die genau diese Stelle vergroessert zeigt. Die
// Wissenschaftsseite hatte bis 2026-09-16 dasselbe Bild, aber eine 92-px-Linse
// mit zwei 326x170-Ausschnitten darin. Das war kein Konzept-, sondern ein
// Groessenproblem.
//
// Drei Dinge sind hier besser als auf der Produktseite:
//
// 1. EINE KOORDINATE. Die Produktseite setzt den Ring in wax.css auf 20 % / 38 %
//    und den Ausschnitt getrennt davon auf `background-position: 6,4 % / 32,5 %`.
//    Die Umrechnung steht dort als Kommentar, nicht als Code, also koennen die
//    beiden Zahlen auseinanderlaufen, sobald jemand eine davon anfasst. Hier
//    gibt es nur FLANK und ZOOM; Ringposition, Ringradius, Leitlinie und
//    Ausschnitt werden daraus gerechnet (siehe `bgPosition` unten).
// 2. DER RING ZEIGT, WAS DIE LINSE ZEIGT. Sein Durchmesser ist per Definition
//    LENS / ZOOM. Damit ist der eingekreiste Bereich nicht ungefaehr, sondern
//    genau der Bildausschnitt in der Linse.
// 3. DIE UEBERGABE. Unter der Figur steht eine Zeile, die vom Verschleiss auf
//    die Ursache zeigt und nach ACT I verlinkt. Der Hero ist damit der Anfang
//    der Zoomreise, nicht ein Foto davor.
//
// Die beiden Ausschnitte `cassette-new.jpg` / `cassette-worn.jpg` sind hier
// bewusst NICHT mehr verbaut. Sie sind 326 x 170 px gross, stammen erkennbar
// aus einer anderen Aufnahme (weisser Grund, flaches Licht) und der Unterschied
// zwischen ihnen ist mit blossem Auge kaum zu sehen. Als Beleg fuer "so sieht
// Verschleiss aus" haben sie damit nicht getragen. Den Vergleich uebernimmt
// die gezeichnete Zahnkontur darunter, die als Schema gekennzeichnet ist und
// zeigt, was ein Foto nicht kann: wo das Material hingeht.
//
// Das Bild selbst haengt an EINER Konstante (`SRC`) plus FLANK. Ein Austausch
// gegen eine lizenzierte oder selbst fotografierte Kassette ist damit zwei
// Zeilen, nicht ein Umbau.

// Bildquelle. `-800` ist die schmale Variante fuers Layout; die Linse
// vergroessert und braucht deshalb immer das grosse Original.
const SRC = {
  base: '/images/science/cassette-wear-diagram',
  // Voller Ausschnitt fuer die Linse: WebP, weil die Datei wie die PNG einen
  // transparenten Grund hat. Die JPG ist flachgerechnet (og:image) und haette
  // in der Linse einen weissen Kasten ergeben.
  lens: '/images/science/cassette-wear-diagram.webp',
  w: 1254, h: 1254,
} as const;

// Die Stelle auf dem Bild, um die es geht: eine Zahnflanke des aeusseren,
// groessten Ritzels, also des Ritzels, das unter Last am meisten traegt.
// Anteile der Bildbreite bzw. -hoehe, gueltig als Prozentwerte des
// Bildkastens, weil das Motiv 1:1 quadratisch ist (SRC.w === SRC.h).
const FLANK = { x: 0.17, y: 0.42 } as const;

// Vergroesserung der Linse. Drei Zwaenge treffen sich hier, deshalb steht
// die Zahl nicht auf einem runderen Wert:
//   - Aufloesung: die Linse ist 44 % eines rund 560 px breiten Bildkastens,
//     also etwa 246 px, und zeigt das Bild damit in 739 px Breite. Auf einem
//     2x-Display sind das 1478 px aus einer 1254-px-Quelle, also eine leichte
//     Hochskalierung, die eine weiche Studioaufnahme noch vertraegt. Bei 4x
//     waere es fast das Doppelte.
//   - Lesbarkeit des Rings: sein Durchmesser ist LENS / ZOOM. Bei 4x waren das
//     10 % des Bildes, ein Kringel, den man uebersieht. Bei 3x sind es rund
//     15 %, ungefaehr so viel wie auf der Produktseite.
//   - Aussage: bei 3x liegen im Ausschnitt drei bis vier ganze Zaehne, also
//     genug Kontext, um die Flanke als Flanke zu erkennen.
const ZOOM = 3;

// Geometrie der Linse, in Prozent des Bildkastens.
const LENS = { size: 44, right: 3, bottom: 4 } as const;
const LENS_R = LENS.size / 2;
const LENS_C = { x: 100 - LENS.right - LENS_R, y: 100 - LENS.bottom - LENS_R };

// Der Ring zeigt genau den Bereich, den die Linse vergroessert.
const RING_R = LENS_R / ZOOM;
const RING_C = { x: FLANK.x * 100, y: FLANK.y * 100 };

/**
 * Hintergrundposition fuer einen vergroesserten Ausschnitt.
 *
 * Gesucht ist der Wert p, bei dem der Bildpunkt c (Anteil 0..1) in der Mitte
 * des Fensters liegt. Bei `background-size: s` (s = 1 waere fensterbreit)
 * ragt das Bild um (s − 1) Fensterbreiten ueber, und `background-position: p`
 * legt den Anteil p dieses Ueberstands nach links. Die Fenstermitte trifft
 * damit den Bildanteil c = (0,5 + p·(s − 1)) / s, umgestellt:
 *
 *     p = (c·s − 0,5) / (s − 1)
 *
 * Geklemmt auf 0..1, sonst laege das Fenster ausserhalb des Bildes. Zur
 * Kontrolle gegen die Produktseite: c = 0,20 bei s = 3,2 ergibt 6,4 %, genau
 * die Zahl, die in wax.css von Hand ausgerechnet steht.
 */
function bgPosition(c: number, s: number) {
  return `${Math.min(100, Math.max(0, ((c * s - 0.5) / (s - 1)) * 100))}%`;
}

// Leitlinie vom Ring zur Linse, an beiden Enden um den jeweiligen Radius
// gekuerzt, damit sie an den Kreisen ansetzt statt sie zu durchstossen.
// Prozent in x und y sind hier dieselbe Einheit, weil der Kasten quadratisch
// ist, also darf hier wirklich mit Pythagoras gerechnet werden.
const LEAD = (() => {
  const dx = LENS_C.x - RING_C.x, dy = LENS_C.y - RING_C.y;
  const len = Math.hypot(dx, dy);
  const t0 = (RING_R + 1.5) / len, t1 = (len - LENS_R - 1.5) / len;
  return {
    x1: RING_C.x + dx * t0, y1: RING_C.y + dy * t0,
    x2: RING_C.x + dx * t1, y2: RING_C.y + dy * t1,
  };
})();

// ─── ToothProfile — ideale gegen abgenutzte Zahnflanke, schematisch ──────────
//
// Ein Foto zweier aehnlich aussehender Zaehne liest sich nicht als "hier fehlt
// Material". Eine gezeichnete Kontur mit hinterlegter Differenz schon.
//
// Gezeichnet ist ein Zahn mit seinen beiden halben Rollensitzen, nicht der
// Zahn allein: erst dadurch erkennt man ein Ritzel. Die Vorgaengerfassung war
// ein Trapez mit gerader Deckflaeche und ohne Sitze und sah nach Kegelstumpf
// aus.
//
// Zwei Regeln, an denen sich die Pfade messen lassen muessen:
//
//  - Verschleiss traegt ab, er baut nichts an. Die abgenutzte Kontur liegt
//    deshalb an KEINER Stelle ausserhalb der idealen. Der Wiedereinstieg in
//    die Zahnkuppe liegt genau auf deren Scheitel (60|17): das ist der
//    Punkt B(0,5) der idealen Kuppe Q(47|22 -> 60|12 -> 73|22), nicht der
//    Steuerpunkt (60|12), der ausserhalb der Kurve liegt. Genau da hatte eine
//    Zwischenfassung die abgenutzte Linie ueber die ideale hinausragen
//    lassen, also Material dazugedichtet.
//  - Nur die belastete Flanke wandert. Rechte Flanke, beide Sitze und die
//    rechte Kuppenhaelfte sind in beiden Konturen identisch, damit der
//    Unterschied dort sichtbar ist, wo er hingehoert.
//
// Kein gemessenes Profil, und das steht auch so in der Legende daneben.
const TOOTH = {
  ideal: 'M4,56 Q7,82 30,84 L47,22 Q60,12 73,22 L90,84 Q113,82 116,56',
  worn: 'M4,56 Q7,82 30,84 Q42,66 50,44 Q55,28 60,17 Q66.5,17 73,22 L90,84 Q113,82 116,56',
  loss: 'M30,84 L47,22 Q53.5,17 60,17 Q55,28 50,44 Q42,66 30,84 Z',
} as const;

function ToothProfile({ de }: { de: boolean }) {
  return (
    <svg viewBox="0 0 120 92" className="h-auto flex-shrink-0" style={{ width: 104 }}
      role="img" aria-label={de
        ? 'Schema eines Ritzelzahns: ideale Kontur und abgenutzte Kontur. Die belastete Flanke ist ausgehoehlt, die Flaeche dazwischen ist der Abtrag.'
        : 'Schematic sprocket tooth: ideal contour and worn contour. The loaded flank is hollowed out, the area between them is the material loss.'}>
      {/* Reihenfolge ist Absicht: Abtragflaeche, dann die abgenutzte Linie,
          die IDEALE zuletzt und damit obenauf. Sitze, rechte Flanke und
          rechte Kuppenhaelfte sind in beiden Konturen identisch; laege die
          gestrichelte Linie oben, waere dort nur sie zu sehen und der ganze
          Zahn saehe blau aus, waehrend die Legende eine graue Linie fuer
          "Neu" zeigt. So steht ueberall die graue Kontur, und die
          gestrichelte taucht genau dort auf, wo sie abweicht. */}
      <path d={TOOTH.loss} fill="var(--accent)" opacity="0.28" />
      <path d={TOOTH.worn} fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeDasharray="3 2.5"
        strokeLinejoin="round" strokeLinecap="round" />
      <path d={TOOTH.ideal} fill="none" stroke="var(--txf)" strokeWidth="1.6"
        strokeLinejoin="round" strokeLinecap="round" />
      <line x1="2" y1="88" x2="118" y2="88" stroke="var(--bd)" strokeWidth="1" />
    </svg>
  );
}

/** Die Kassette als Hero-Figur, gleich auf Mobil und Desktop. */
/** `handoff` = die Uebergabezeile nach ACT I (#problem). Nur auf /wissenschaft sinnvoll,
 *  die Partnerseite zeigt die Figur ohne sie. */
export function CassetteLens({ de, handoff = true }: { de: boolean; handoff?: boolean }) {
  return (
    <figure className="m-0">
      <div className="relative">
        {/* Echter Alphakanal (2026-09-02), kein Foto auf angeglichenem Grund:
            die frueheren Fassungen lagen auf rgb(245,245,245) und das war im
            Dunkelmodus ein heller Kasten mit harter Kante. PNG als Rueckfall,
            nicht JPG, weil JPG keinen Alphakanal hat. Die flachgerechnete
            cassette-wear-diagram.jpg existiert weiter fuer og:image. */}
        <picture>
          <source type="image/avif" sizes="(min-width: 1024px) 640px, 100vw"
            srcSet={`${SRC.base}-800.avif 800w, ${SRC.base}.avif ${SRC.w}w`} />
          <source type="image/webp" sizes="(min-width: 1024px) 640px, 100vw"
            srcSet={`${SRC.base}-800.webp 800w, ${SRC.base}.webp ${SRC.w}w`} />
          <img src={`${SRC.base}.png`} width={SRC.w} height={SRC.h} className="w-full h-auto"
            alt={de ? 'Shimano Ultegra Kassette' : 'Shimano Ultegra cassette'} />
        </picture>

        {/* Leitlinie zuerst, damit die beiden Kreise darueber liegen und die
            Linie sauber unter ihren Raendern verschwindet. viewBox 0..100 mit
            preserveAspectRatio="none" bildet exakt die Prozentkoordinaten ab. */}
        <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Zweimal dieselbe Linie: zuerst breit in der Seitenfarbe, dann
              schmal in Akzent. Ohne den Unterleger verschwindet die
              gestrichelte Linie auf dem hellen Metall, und ein dunklerer
              Blauton waere im Noir-Theme wieder zu dunkel. Die Seitenfarbe
              wirkt in beiden Themes in die richtige Richtung. */}
          <line x1={LEAD.x1} y1={LEAD.y1} x2={LEAD.x2} y2={LEAD.y2}
            stroke="var(--pg)" strokeWidth="4" strokeLinecap="round"
            opacity="0.65" vectorEffect="non-scaling-stroke" />
          <line x1={LEAD.x1} y1={LEAD.y1} x2={LEAD.x2} y2={LEAD.y2}
            stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="4 3.5"
            opacity="0.95" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Der Ring auf der echten Zahnflanke. Der zweite, breite Schatten in
            der Seitenfarbe setzt ihn vom Metall ab, ohne eine zweite Linie zu
            zeichnen. */}
        <div aria-hidden className="absolute rounded-full pointer-events-none"
          style={{
            left: `${RING_C.x}%`, top: `${RING_C.y}%`,
            width: `${RING_R * 2}%`, aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            border: '1.8px solid var(--accent)',
            boxShadow: '0 0 0 3px var(--pg), 0 0 0 4.2px rgba(var(--accent-rgb),0.30)',
          }} />

        {/* Die Linse. Derselbe Bildausschnitt, nur ZOOM-fach, und die
            Hintergrundposition kommt aus FLANK statt aus einer zweiten,
            handgerechneten Zahl. */}
        <div aria-hidden className="absolute rounded-full pointer-events-none"
          style={{
            right: `${LENS.right}%`, bottom: `${LENS.bottom}%`,
            width: `${LENS.size}%`, aspectRatio: '1',
            backgroundImage: `url(${SRC.lens})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${ZOOM * 100}%`,
            backgroundPosition: `${bgPosition(FLANK.x, ZOOM)} ${bgPosition(FLANK.y, ZOOM)}`,
            backgroundColor: 'var(--pg)',
            border: '1.5px solid var(--accent)',
            boxShadow: '0 0 0 4px var(--pg), 0 14px 34px rgba(0,0,0,0.28)',
          }} />
        <span className="absolute text-[11px] font-semibold text-center"
          style={{
            right: `${LENS.right}%`, bottom: `calc(${LENS.bottom}% - 20px)`,
            width: `${LENS.size}%`, color: 'var(--txm)',
          }}>
          {de ? `Zahnflanke, ${ZOOM}fach` : `Tooth flank, ${ZOOM}×`}
        </span>
      </div>

      <figcaption className="mt-8">
        <p className="text-[15px] font-bold mb-1.5" style={{ color: 'var(--tx1)' }}>
          {de ? 'Verschleißprinzip' : 'Wear principle'}
        </p>
        <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--txm)', maxWidth: '40ch' }}>
          {de
            ? 'Reibung trägt die Zahnflanke ab. Die Kette greift schlechter, längt sich schneller und nimmt die Kassette mit.'
            : 'Friction wears the tooth flank down. The chain engages worse, elongates faster and takes the cassette with it.'}
        </p>

        {/* Legende mit eigenen Strichproben statt nur farbiger Woerter: die
            gestrichelte Linie und die Flaeche sehen hier genauso aus wie in
            der Zeichnung daneben, also muss niemand raten, welches Wort zu
            welcher Linie gehoert. */}
        <div className="flex items-center gap-5 mt-4">
          <ToothProfile de={de} />
          <ul className="text-[11.5px] leading-snug space-y-1.5 m-0 p-0 list-none" style={{ color: 'var(--txm)' }}>
            {([
              ['ideal', de ? 'Neu, symmetrisch' : 'New, symmetric'],
              ['worn', de ? 'Abgenutzt, Haifischflosse' : 'Worn, shark fin'],
              ['loss', de ? 'Abtrag auf der belasteten Flanke' : 'Loss on the loaded flank'],
            ] as const).map(([kind, label]) => (
              <li key={kind} className="flex items-center gap-2">
                <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden className="flex-shrink-0">
                  {kind === 'loss'
                    ? <rect x="1" y="2" width="16" height="6" fill="var(--accent)" opacity="0.28" />
                    : <line x1="1" y1="5" x2="17" y2="5" strokeWidth="1.7" strokeLinecap="round"
                        stroke={kind === 'ideal' ? 'var(--txf)' : 'var(--accent)'}
                        strokeDasharray={kind === 'worn' ? '3 2.5' : undefined} />}
                </svg>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11.5px] mt-2.5" style={{ color: 'var(--txff)' }}>
          {de ? 'Schema, kein gemessenes Profil.' : 'Schematic, not a measured profile.'}
        </p>

        {/* Die Uebergabe. Ohne diese Zeile zeigt der Hero die Folge, waehrend
            die Seite danach die Ursache erklaert, und niemand verbindet die
            beiden. Ziel ist ACT I, wo der Spalt aufgemacht wird. */}
        {handoff && (
        <p className="text-[13px] leading-relaxed mt-5 pt-4" style={{ color: 'var(--tx2)', borderTop: '1px solid var(--bd2)', maxWidth: '40ch' }}>
          {de ? 'Und das entsteht in einem Spalt von wenigen Mikrometern. ' : 'And all of this starts in a gap a few micrometres wide. '}
          <a href="#problem" className="font-semibold underline underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)', textDecorationColor: 'rgba(var(--accent-rgb),0.4)' }}>
            {de ? 'Dort weiterlesen' : 'Read on there'}
          </a>
        </p>
        )}
      </figcaption>
    </figure>
  );
}
