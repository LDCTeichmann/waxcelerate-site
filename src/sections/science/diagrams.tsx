// ─── Compact per-component diagrams (minimal line + accent) ──────────────────
// Shown inside the collapsed "Die Physik" tier, so they add depth without
// crowding the skim layer. All theme-driven via CSS vars; static (no animation).
import type { DiagramKey } from '@/lib/science';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

function Cap({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] mt-2 text-center" style={{ color: 'var(--txf)' }}>{children}</p>;
}

// Paraffin — dense aligned lamellae (left) vs gapped standard wax (right)
function Lamellar({ de }: { de: boolean }) {
  return (
    <figure>
      <svg viewBox="0 0 200 80" className="w-full h-auto" role="img" aria-label="lamellar packing">
        {/* dense */}
        {[20, 27, 34, 41, 48, 55].map(y => (
          <line key={`d${y}`} x1={12} y1={y} x2={90} y2={y} stroke="var(--accent)" strokeWidth={2} />
        ))}
        {/* gapped */}
        {[20, 34, 41, 55].map(y => (
          <line key={`g${y}`} x1={110} y1={y} x2={188} y2={y} stroke="var(--tx2)" strokeWidth={2} opacity={0.5} />
        ))}
        <text x={51} y={72} textAnchor="middle" fontSize={9} fill="var(--accent)" fontFamily={MONO}>
          {de ? 'dicht' : 'dense'}
        </text>
        <text x={149} y={72} textAnchor="middle" fontSize={9} fill="var(--txf)" fontFamily={MONO}>
          {de ? 'Lücken' : 'gaps'}
        </text>
      </svg>
      <Cap>{de ? 'Engeres Erstarrungsfenster → feinere, dichtere Kristalldomänen.' : 'Tighter solidification window → finer, denser crystal domains.'}</Cap>
    </figure>
  );
}

// FT-Wax — drop point lifted from baseline to ~75 °C
function DropLift({ de }: { de: boolean }) {
  return (
    <figure>
      <svg viewBox="0 0 200 80" className="w-full h-auto" role="img" aria-label="drop point lift">
        <line x1={12} y1={60} x2={188} y2={60} stroke="var(--bd)" strokeWidth={1} />
        {/* baseline band */}
        <rect x={20} y={44} width={70} height={10} rx={5} fill="var(--tx2)" opacity={0.4} />
        <text x={55} y={38} textAnchor="middle" fontSize={9} fill="var(--txf)" fontFamily={MONO}>58–60°</text>
        {/* lifted band */}
        <rect x={110} y={26} width={70} height={10} rx={5} fill="var(--accent)" />
        <text x={145} y={20} textAnchor="middle" fontSize={9} fill="var(--accent)" fontFamily={MONO}>72–78°</text>
        {/* arrow */}
        <path d="M100 49 L100 31 M100 31 L96 36 M100 31 L104 36" stroke="var(--accent)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </svg>
      <Cap>{de ? 'FT-Wachs ko-kristallisiert → höherer Tropfpunkt.' : 'FT wax co-crystallises → higher drop point.'}</Cap>
    </figure>
  );
}

// Microcrystalline — elastic (intact bend) vs brittle (cracked)
function ColdFlex({ de }: { de: boolean }) {
  return (
    <figure>
      <svg viewBox="0 0 200 80" className="w-full h-auto" role="img" aria-label="cold flexibility">
        {/* elastic */}
        <path d="M14 50 Q51 20 88 50" stroke="var(--accent)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <text x={51} y={68} textAnchor="middle" fontSize={9} fill="var(--accent)" fontFamily={MONO}>{de ? 'elastisch' : 'elastic'}</text>
        {/* brittle (cracked) */}
        <path d="M112 50 Q140 26 146 30" stroke="var(--tx2)" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.5} />
        <path d="M154 30 Q160 26 186 50" stroke="var(--tx2)" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.5} />
        <path d="M150 22 L150 38" stroke="var(--txf)" strokeWidth={1} />
        <text x={149} y={68} textAnchor="middle" fontSize={9} fill="var(--txf)" fontFamily={MONO}>{de ? 'spröde' : 'brittle'}</text>
      </svg>
      <Cap>{de ? 'Amorphe Moleküle halten die Matrix bis −10 °C elastisch.' : 'Amorphous molecules keep the matrix elastic to −10 °C.'}</Cap>
    </figure>
  );
}

// MoS₂ — S–Mo–S layers shearing (the star split-second viz)
function Shear({ de }: { de: boolean }) {
  const sx = [20, 50, 80, 110, 140, 170];
  const Row = ({ y, fill, r, dx = 0 }: { y: number; fill: string; r: number; dx?: number }) =>
    <>{sx.map((x, i) => <circle key={i} cx={x + dx} cy={y} r={r} fill={fill} />)}</>;
  return (
    <figure>
      <svg viewBox="0 0 200 110" className="w-full h-auto" role="img" aria-label="MoS2 layer shear">
        {/* top sandwich shifted right */}
        <Row y={16} fill="var(--tx2)" r={3.5} dx={14} />
        <Row y={28} fill="var(--accent)" r={5} dx={14} />
        <Row y={40} fill="var(--tx2)" r={3.5} dx={14} />
        {/* vdW gap */}
        <line x1={6} y1={54} x2={194} y2={54} stroke="var(--bd)" strokeWidth={1} strokeDasharray="3 4" />
        {/* bottom sandwich shifted left */}
        <Row y={68} fill="var(--tx2)" r={3.5} dx={-14} />
        <Row y={80} fill="var(--accent)" r={5} dx={-14} />
        <Row y={92} fill="var(--tx2)" r={3.5} dx={-14} />
        <text x={100} y={106} textAnchor="middle" fontSize={9} fill="var(--accent)" fontFamily={MONO}>
          {de ? '← Schichten gleiten →' : '← layers slide →'}
        </text>
      </svg>
      <Cap>{de ? 'Schwache Bindung zwischen S–Mo–S-Schichten → Reibung μ 0,03.' : 'Weak bonding between S–Mo–S layers → friction μ 0.03.'}</Cap>
    </figure>
  );
}

// Dispersant — density ratio 5.6× (paraffin vs MoS₂)
function Density({ de }: { de: boolean }) {
  return (
    <figure>
      <svg viewBox="0 0 200 90" className="w-full h-auto" role="img" aria-label="density ratio">
        <circle cx={50} cy={48} r={14} fill="none" stroke="var(--tx2)" strokeWidth={2} />
        <text x={50} y={51} textAnchor="middle" fontSize={10} fill="var(--tx2)" fontFamily={MONO}>0,9</text>
        <text x={50} y={80} textAnchor="middle" fontSize={8} fill="var(--txf)" fontFamily={MONO}>Paraffin</text>
        <circle cx={140} cy={45} r={34} fill="rgba(var(--accent-rgb),0.10)" stroke="var(--accent)" strokeWidth={2} />
        <text x={140} y={49} textAnchor="middle" fontSize={12} fill="var(--accent)" fontFamily={MONO}>5,06</text>
        <text x={140} y={86} textAnchor="middle" fontSize={8} fill="var(--txf)" fontFamily={MONO}>MoS₂ · g/cm³</text>
      </svg>
      <Cap>{de ? 'MoS₂ ist 5,6× dichter — ohne Hülle sinkt es ab.' : 'MoS₂ is 5.6× denser — without a shell it sinks.'}</Cap>
    </figure>
  );
}

// Antioxidant — phenolic shield breaks the radical chain
function Radical({ de }: { de: boolean }) {
  return (
    <figure>
      <svg viewBox="0 0 200 80" className="w-full h-auto" role="img" aria-label="radical chain break">
        {/* shield arc */}
        <path d="M70 56 Q100 18 130 56" stroke="var(--accent)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M100 30 L100 46" stroke="var(--accent)" strokeWidth={1.5} />
        {/* incoming radical, broken */}
        <text x={28} y={40} fontSize={11} fill="var(--txf)" fontFamily={MONO}>ROO•</text>
        <path d="M48 36 L60 36" stroke="var(--txf)" strokeWidth={1.5} strokeDasharray="2 3" />
        <line x1={64} y1={30} x2={70} y2={42} stroke="var(--accent)" strokeWidth={1.5} />
        {/* outcome */}
        <text x={150} y={36} fontSize={9} fill="var(--accent)" fontFamily={MONO}>MoS₂ ✓</text>
        <text x={150} y={50} fontSize={9} fill="var(--txf)" fontFamily={MONO}>MoO₃ ✗</text>
      </svg>
      <Cap>{de ? 'Phenol-OH bricht die Oxidationskette → kein abrasives MoO₃.' : 'Phenolic OH breaks the oxidation chain → no abrasive MoO₃.'}</Cap>
    </figure>
  );
}

// PTFE — slick film: nothing sticks, lower surface friction
function Ptfe({ de }: { de: boolean }) {
  return (
    <figure>
      <svg viewBox="0 0 200 80" className="w-full h-auto" role="img" aria-label="PTFE glide film">
        <line x1={12} y1={58} x2={188} y2={58} stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
        {[40, 70, 100].map((x, i) => (
          <circle key={x} cx={x} cy={50 - i * 2} r={5 - i} fill="none" stroke="var(--tx2)" strokeWidth={1.5} opacity={0.6} />
        ))}
        <path d="M120 50 L168 50 M168 50 L162 46 M168 50 L162 54" stroke="var(--accent)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <text x={100} y={74} textAnchor="middle" fontSize={9} fill="var(--accent)" fontFamily={MONO}>
          {de ? '← glatt, nichts haftet →' : '← slick, nothing sticks →'}
        </text>
      </svg>
      <Cap>{de ? 'PTFE < 1 µm senkt die Oberflächenreibung — trocken & sauber.' : 'PTFE < 1 µm lowers surface friction — dry & clean.'}</Cap>
    </figure>
  );
}

// Stearate — molecular bridge: polar head bonds to steel, tail into wax
function Stearin({ de }: { de: boolean }) {
  return (
    <figure>
      <svg viewBox="0 0 200 80" className="w-full h-auto" role="img" aria-label="adhesion promoter">
        <rect x={8} y={60} width={184} height={8} rx={2} fill="var(--tx2)" opacity={0.35} />
        <text x={16} y={54} fontSize={8} fill="var(--txf)" fontFamily={MONO}>Fe</text>
        {[50, 100, 150].map(x => (
          <g key={x}>
            <circle cx={x} cy={58} r={3.5} fill="var(--accent)" />
            <path d={`M${x} 55 L${x - 5} 44 L${x + 5} 32 L${x - 5} 20`} stroke="var(--accent)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <text x={100} y={14} textAnchor="middle" fontSize={8} fill="var(--txf)" fontFamily={MONO}>{de ? 'Wachsmatrix' : 'wax matrix'}</text>
      </svg>
      <Cap>{de ? 'Polarer Kopf bindet an Stahl, Kette verankert im Wachs.' : 'Polar head bonds to steel, tail anchors in the wax.'}</Cap>
    </figure>
  );
}

export function ComponentDiagram({ which, de }: { which: DiagramKey; de: boolean }) {
  const map: Record<DiagramKey, React.ReactNode> = {
    lamellar: <Lamellar de={de} />,
    droplift: <DropLift de={de} />,
    coldflex: <ColdFlex de={de} />,
    shear: <Shear de={de} />,
    density: <Density de={de} />,
    radical: <Radical de={de} />,
    ptfe: <Ptfe de={de} />,
    stearin: <Stearin de={de} />,
  };
  return (
    <div className="rounded-xl p-4 mt-3" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      {map[which]}
    </div>
  );
}
