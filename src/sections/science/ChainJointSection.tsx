// ─── ChainJointSection — Kette waagerecht, Schnitt darunter ──────────────────
//
// Dritte Fassung. Was die beiden vorherigen falsch gemacht haben:
//
//  v1: drei konzentrische Ringe. Geometrisch richtig und unlesbar — drei
//      ineinanderliegende Kreise sehen aus wie drei Kreise, nicht wie eine
//      Rolle auf einem Kragen auf einem Bolzen.
//  v2: Schnitt entlang der Bolzenachse (die Geometrie unten ist daraus
//      uebernommen und stimmt), aber die Referenzkette daneben stand um 90°
//      gedreht hochkant. Der Gedanke war, die Schnittebene waagerecht
//      auszurichten. Das Ergebnis war das Gegenteil: eine hochkant stehende
//      Kette erkennt niemand als Kette, weil man Ketten immer liegend sieht.
//      Lucas Rueckmeldung dazu — "die Kette liegt schraeg und ist zu schwer
//      zu begreifen" — trifft genau das.
//
// Jetzt nach dem Vorbild echter Kettenzeichnungen (Lucas Referenzbilder:
// Seitenansicht oben, Schnitt darunter, nummerierte Positionen mit Legende):
//
//      ○──○──◎──○──○     ← die Kette, waagerecht, wie man sie kennt
//            ┊           ← Schnittmarke faellt senkrecht in den Schnitt
//   ══════ Lasche ══════
//        ╞═ Rolle ═╡     ← 2
//        ╞ Kragen  ╡     ← 1
//   ───── Bolzen ──────
//
// Oben Wiedererkennung, unten der Mechanismus, dazwischen eine senkrechte
// Schnittmarke — von oben nach unten gelesen, so wie ein Detailausschnitt auf
// einem Zeichnungsblatt gelesen wird.
//
// Moderne 9–12-fach-Ketten sind buchsenlos: der Kragen der Innenlasche hat die
// Buchse ersetzt. Eine Buchse zu zeichnen waere fuer jede Kette, die wir
// verkaufen, schlicht falsch.

const A = { x0: 60, x1: 560 };          // Bolzen-Ausdehnung
const CY = 196;                          // Mittellinie des Schnitts
const PIN = 15;
const SHO = 31;
const ROL = 52;
const SHO_X = [148, 296] as const;
const ROL_X = [186, 434] as const;
const IP_X = [130, 150] as const;
const OP_X = [102, 126] as const;

// Referenzkette oben: waagerecht, mittig ueber dem Schnitt.
const KEY_CY = 58;
const KEY_PITCH = 44;
const KEY_X0 = 222;                      // erster Bolzen
const KEY_N = 5;                         // Bolzen insgesamt
const KEY_P = Array.from({ length: KEY_N }, (_, i) => KEY_X0 + i * KEY_PITCH);
const CUT_X = KEY_P[2];                  // markiertes Gelenk = Mitte

const mirror = (x: number) => 620 - x;

const HAIR = { strokeWidth: 'var(--dw-hair)' } as const;
const LINE = { strokeWidth: 'var(--dw-line)' } as const;

export function ChainJointSection({
  active,
  compact = false,
  onZone,
}: {
  active: number | null;
  compact?: boolean;
  onZone?: (i: number) => void;
}) {
  const on = (i: number) => active === i;
  const stroke = (i: number) => (on(i) ? 'var(--accent)' : 'var(--txf)');
  const iw = (i: number) => ({ strokeWidth: on(i) ? 'var(--dw-bold)' : 'var(--dw-line)' });
  const fade = (i: number) => (active === null || on(i) ? 1 : 0.62);
  const fs = 13;

  const hit = (i: number) =>
    onZone ? { onMouseEnter: () => onZone(i), style: { cursor: 'pointer' } } : {};

  const Slide = ({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) => (
    <g transform={`translate(${x},${y})${vertical ? ' rotate(90)' : ''}`} style={{ pointerEvents: 'none' }}>
      <circle r={12} fill="var(--sf)" stroke="var(--accent)" style={LINE} />
      <path d="M-6 0 L6 0 M-6 0 L-3.2 -2.8 M-6 0 L-3.2 2.8 M6 0 L3.2 -2.8 M6 0 L3.2 2.8"
        fill="none" stroke="var(--accent)" strokeLinecap="round" style={LINE} />
    </g>
  );

  // Nummernmarke an einer Gleitflaeche. Ersetzt die frueheren Fliesstext-
  // Beschriftungen: Lucas Referenzzeichnungen arbeiten alle mit Ziffern in
  // der Figur und einer Legende darunter, weil Woerter in einer Zeichnung
  // entweder kollidieren oder zu klein werden.
  const Tag = ({ x, y, n }: { x: number; y: number; n: number }) => (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
      <circle r={11} fill={on(n - 1) ? 'var(--accent)' : 'var(--sf)'}
        stroke={on(n - 1) ? 'var(--accent)' : 'var(--txf)'} style={HAIR}
        opacity={fade(n - 1)} />
      <text className="num-data" fontSize={12} textAnchor="middle" dy={4}
        fill={on(n - 1) ? '#fff' : 'var(--tx2)'} opacity={fade(n - 1)}>{n}</text>
    </g>
  );

  return (
    <svg viewBox="20 14 600 300" className="w-full h-auto"
      role="img" aria-label="Fahrradkette in Seitenansicht mit Schnitt durch ein Gelenk, die drei Gleitflächen sind nummeriert">

      {/* ── Referenzkette, waagerecht ──
          Aussen- und Innenlaschen wechseln sich ab, Rollen an jedem Bolzen.
          Bewusst schlicht: sie muss nur eines leisten, naemlich dass man
          binnen einer Sekunde "das ist eine Fahrradkette" denkt. */}
      <g>
        {KEY_P.slice(0, -1).map((x, i) => {
          const h = i % 2 === 0 ? 11 : 8.5;   // Aussenlaschen stehen ueber
          return (
            <rect key={x} x={x - 13} y={KEY_CY - h} width={KEY_PITCH + 26} height={h * 2} rx={h}
              fill="none" stroke="var(--bd)" style={HAIR} />
          );
        })}
        {KEY_P.map(x => (
          <circle key={`r${x}`} cx={x} cy={KEY_CY} r={7.5} fill="none" stroke="var(--bd)" style={HAIR} />
        ))}
        {KEY_P.map(x => <circle key={`p${x}`} cx={x} cy={KEY_CY} r={3} fill="var(--bd)" />)}

        {/* markiertes Gelenk */}
        <circle cx={CUT_X} cy={KEY_CY} r={20} fill="none" stroke="var(--accent)"
          strokeDasharray="4 3" style={HAIR} opacity={0.9} />
      </g>

      {/* Schnittmarke: senkrecht vom markierten Gelenk in den Schnitt */}
      <line x1={CUT_X} y1={KEY_CY + 24} x2={CUT_X} y2={CY - ROL - 26}
        stroke="var(--accent)" strokeDasharray="5 4" style={HAIR} opacity={0.45} />

      {!compact && (
        <text className="num-data" fontSize={fs} fill="var(--txff)" x={KEY_P[0] - 34} y={KEY_CY + 4}
          textAnchor="end">KETTE</text>
      )}

      {/* ── Aussenlaschen ── */}
      {[OP_X[0], mirror(OP_X[1])].map((x, i) => (
        <rect key={`op${i}`} x={x} y={CY - 78} width={OP_X[1] - OP_X[0]} height={156} rx={5}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} opacity={fade(2)} />
      ))}

      {/* ── Innenlaschen ── */}
      {[IP_X[0], mirror(IP_X[1])].map((x, i) => (
        <rect key={`ip${i}`} x={x} y={CY - 66} width={IP_X[1] - IP_X[0]} height={132} rx={4}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} opacity={fade(2)} />
      ))}

      {/* ── Kragen — übernimmt die Aufgabe der Buchse, aus der Innenlasche gezogen ── */}
      {[[SHO_X[0], SHO_X[1]], [mirror(SHO_X[1]), mirror(SHO_X[0])]].map(([x0, x1], i) => (
        <g key={`sh${i}`} opacity={Math.max(fade(0), fade(1))}>
          <rect x={x0} y={CY - SHO} width={x1 - x0} height={SHO - PIN}
            fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
          <rect x={x0} y={CY + PIN} width={x1 - x0} height={SHO - PIN}
            fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
        </g>
      ))}

      {/* ── Rolle ── */}
      <g opacity={fade(1)}>
        <rect x={ROL_X[0]} y={CY - ROL} width={ROL_X[1] - ROL_X[0]} height={ROL - SHO} rx={3}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
        <rect x={ROL_X[0]} y={CY + SHO} width={ROL_X[1] - ROL_X[0]} height={ROL - SHO} rx={3}
          fill="var(--sf2)" stroke="var(--txf)" style={LINE} />
      </g>

      {/* ── Bolzen ── */}
      <g opacity={fade(0)}>
        <rect x={A.x0} y={CY - PIN} width={A.x1 - A.x0} height={PIN * 2} rx={7}
          fill="var(--sf)" stroke="var(--tx2)" style={LINE} />
        {Array.from({ length: 26 }, (_, i) => A.x0 + 14 + i * 19).map(x => (
          <line key={x} x1={x} y1={CY - PIN + 2} x2={x - 11} y2={CY + PIN - 2}
            stroke="var(--bd)" style={HAIR} />
        ))}
      </g>

      {/* ── Fläche 1 · Bolzen gegen Kragen ── */}
      <g {...hit(0)}>
        <rect x={SHO_X[0]} y={CY - PIN - 8} width={mirror(SHO_X[0]) - SHO_X[0]} height={16} fill="transparent" />
        {[CY - PIN, CY + PIN].map(y => (
          <line key={y} x1={SHO_X[0]} y1={y} x2={mirror(SHO_X[0])} y2={y}
            stroke={stroke(0)} style={{ ...iw(0), transition: 'stroke .35s, stroke-width .35s' }} />
        ))}
        {on(0) && <Slide x={310} y={CY - PIN} />}
        <Tag x={SHO_X[0] + 26} y={CY + PIN + 20} n={1} />
      </g>

      {/* ── Fläche 2 · Rolle gegen Kragen ── */}
      <g {...hit(1)}>
        <rect x={ROL_X[0]} y={CY - SHO - 8} width={ROL_X[1] - ROL_X[0]} height={16} fill="transparent" />
        {[CY - SHO, CY + SHO].map(y => (
          <line key={y} x1={ROL_X[0]} y1={y} x2={ROL_X[1]} y2={y}
            stroke={stroke(1)} style={{ ...iw(1), transition: 'stroke .35s, stroke-width .35s' }} />
        ))}
        {on(1) && <Slide x={ROL_X[1] - 36} y={CY - SHO} />}
        <Tag x={ROL_X[1] - 20} y={CY - SHO - 20} n={2} />
      </g>

      {/* ── Fläche 3 · Innen- gegen Aussenlasche ── */}
      <g {...hit(2)}>
        {[IP_X[0], mirror(IP_X[0])].map((x, i) => (
          <line key={i} x1={x} y1={CY - 66} x2={x} y2={CY + 66}
            stroke={stroke(2)} style={{ ...iw(2), transition: 'stroke .35s, stroke-width .35s' }} />
        ))}
        {on(2) && <Slide x={IP_X[0]} y={CY - 46} vertical />}
        {/* 14px ueber die Laschenoberkante gesetzt — auf der Kante selbst
            (CY-78) haette die Marke die Lasche ueberdeckt statt sie zu
            bezeichnen. */}
        <Tag x={IP_X[0]} y={CY - 92} n={3} />
      </g>

      {/* ── Legende ──
          Ziffern in der Figur, Woerter darunter — genau die Aufteilung, die
          Lucas Referenzzeichnungen benutzen. Auch in der kompakten Fassung
          sichtbar: ohne sie ist der Schnitt ein Stapel Rechtecke, und die
          kompakte Fassung steht auf der Startseite vor dem kaeltesten
          Publikum der Seite, wo Benennung am meisten zaehlt. */}
      <g className="num-data" fontSize={fs} fill="var(--txf)">
        {[
          { n: 1, x: 96, de: 'Bolzen / Kragen' },
          { n: 2, x: 268, de: 'Rolle / Kragen' },
          { n: 3, x: 432, de: 'Laschen' },
        ].map(({ n, x, de: label }) => (
          <g key={n} transform={`translate(${x},${CY + 104})`}>
            <circle r={9} cx={0} cy={-4} fill={on(n - 1) ? 'var(--accent)' : 'none'}
              stroke={on(n - 1) ? 'var(--accent)' : 'var(--bd)'} style={HAIR} />
            <text x={0} y={0} textAnchor="middle" fontSize={11}
              fill={on(n - 1) ? '#fff' : 'var(--txf)'}>{n}</text>
            <text x={16} y={0} fontSize={fs} fill={on(n - 1) ? 'var(--tx1)' : 'var(--txf)'}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
