// ─── Compact per-component diagrams — one designed figure set ─────────────────
// Shown inside the right detail card (WaxDive) and the "Die Physik" tier
// (SciencePage). Shared grammar: generous viewBox, accent = signal / neutral =
// context, real arrowhead markers (no ASCII arrows), descriptive labels in sans
// (inherits Libre Franklin) and numbers/formulae in `.num-data` mono. All
// theme-driven via CSS vars; static (no animation).
import type { DiagramKey } from '@/lib/science';
import { ArrowMarker } from '@/sections/science/graphPrimitives';

// Shared label helpers — descriptive text in sans, numeric/formula text in mono.
function Lbl(p: React.SVGProps<SVGTextElement>) {
  return <text fontSize={10.5} fill="var(--txm)" textAnchor="middle" {...p} />;
}
function Num(p: React.SVGProps<SVGTextElement>) {
  return <text className="num-data" fontSize={11} textAnchor="middle" {...p} />;
}
function Cap({ children }: { children: React.ReactNode }) {
  return <figcaption className="text-[11px] mt-2.5 text-center leading-snug" style={{ color: 'var(--txf)' }}>{children}</figcaption>;
}
function Fig({ vb, label, children, cap }: {
  vb: string; label: string; children: React.ReactNode; cap: React.ReactNode;
}) {
  return (
    <figure>
      <svg viewBox={vb} className="w-full h-auto" role="img" aria-label={label}>{children}</svg>
      <Cap>{cap}</Cap>
    </figure>
  );
}

// Paraffin — dense aligned lamellae (left) vs gapped standard wax (right)
function Lamellar({ de }: { de: boolean }) {
  return (
    <Fig vb="0 0 240 120" label="lamellar packing"
      cap={de ? 'Engeres Erstarrungsfenster → feinere, dichtere Kristalldomänen.' : 'Tighter solidification window → finer, denser crystal domains.'}>
      {[28, 37, 46, 55, 64, 73, 82].map(y => (
        <line key={`d${y}`} x1={26} y1={y} x2={102} y2={y} stroke="var(--accent-soft)" strokeWidth={2.4} strokeLinecap="round" />
      ))}
      <line x1={120} y1={24} x2={120} y2={86} stroke="var(--bd)" strokeWidth={1} />
      {[28, 46, 64, 82].map(y => (
        <line key={`g${y}`} x1={138} y1={y} x2={214} y2={y} stroke="var(--tx2)" strokeWidth={2.4} opacity={0.5} strokeLinecap="round" />
      ))}
      <Lbl x={64} y={104} fill="var(--accent-soft)">{de ? 'Dicht' : 'Dense'}</Lbl>
      <Lbl x={176} y={104}>{de ? 'Standard' : 'Standard'}</Lbl>
    </Fig>
  );
}

// FT-Wax — drop point lifted from baseline to ~75 °C
function DropLift({ de }: { de: boolean }) {
  return (
    <Fig vb="0 0 240 120" label="drop point lift"
      cap={de ? 'FT-Wachs ko-kristallisiert → höherer Tropfpunkt.' : 'FT wax co-crystallises → higher drop point.'}>
      <defs><ArrowMarker id="dl-arrow" /></defs>
      <line x1={24} y1={98} x2={216} y2={98} stroke="var(--bd)" strokeWidth={1} />
      <rect x={36} y={72} width={68} height={12} rx={6} fill="var(--tx2)" opacity={0.35} />
      <Num x={70} y={62} fill="var(--txm)">58–60 °C</Num>
      <rect x={138} y={44} width={68} height={12} rx={6} fill="var(--accent-soft)" />
      <Num x={172} y={34} fill="var(--accent-soft)">72–78 °C</Num>
      <line x1={106} y1={78} x2={140} y2={52} stroke="var(--accent-soft)" strokeWidth={1.6} markerEnd="url(#dl-arrow)" />
    </Fig>
  );
}

// Microcrystalline — elastic (intact bend) vs brittle (cracked)
function ColdFlex({ de }: { de: boolean }) {
  return (
    <Fig vb="0 0 240 120" label="cold flexibility"
      cap={de ? 'Amorphe Moleküle halten die Matrix bis −10 °C elastisch.' : 'Amorphous molecules keep the matrix elastic to −10 °C.'}>
      <path d="M28 80 Q64 40 100 80" stroke="var(--accent-soft)" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <Lbl x={64} y={102} fill="var(--accent-soft)">{de ? 'Elastisch' : 'Elastic'}</Lbl>
      <path d="M140 80 Q164 48 176 54" stroke="var(--tx2)" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.5} />
      <path d="M182 54 Q194 48 212 80" stroke="var(--tx2)" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.5} />
      <line x1={179} y1={44} x2={179} y2={64} stroke="var(--txf)" strokeWidth={1} />
      <Lbl x={176} y={102}>{de ? 'Spröde' : 'Brittle'}</Lbl>
    </Fig>
  );
}

// MoS₂ — S–Mo–S layers shearing (the star viz, echoing HexMoS2's glow cues)
function Shear({ de }: { de: boolean }) {
  const sx = [44, 76, 108, 140, 172, 204];
  const Row = ({ y, soft, r, dx = 0 }: { y: number; soft?: boolean; r: number; dx?: number }) =>
    <>{sx.map((x, i) => (
      <circle key={i} cx={x + dx} cy={y} r={r}
        fill={soft ? 'rgba(var(--accent-rgb),0.55)' : 'var(--accent-soft)'}
        style={soft ? undefined : { filter: 'drop-shadow(0 0 4px rgba(var(--accent-rgb),0.55))' }} />
    ))}</>;
  return (
    <Fig vb="0 0 240 150" label="MoS2 layer shear"
      cap={de ? 'Schwache Bindung zwischen S–Mo–S-Schichten → Reibung μ 0,03.' : 'Weak bonding between S–Mo–S layers → friction μ 0.03.'}>
      <defs><ArrowMarker id="sh-arrow" /></defs>
      {/* left atom labels (element symbols = data) */}
      <text className="num-data" fontSize={8} fill="var(--txf)" x={12} y={26}>S</text>
      <text className="num-data" fontSize={8} fill="var(--txf)" x={10} y={42}>Mo</text>
      <text className="num-data" fontSize={8} fill="var(--txf)" x={12} y={58}>S</text>
      {/* top sandwich, shifted right */}
      <Row y={24} soft r={4.5} dx={10} />
      <Row y={40} r={6.5} dx={10} />
      <Row y={56} soft r={4.5} dx={10} />
      <line x1={150} y1={12} x2={196} y2={12} stroke="var(--accent-soft)" strokeWidth={1.6} markerEnd="url(#sh-arrow)" />
      {/* van-der-Waals gap */}
      <line x1={14} y1={75} x2={226} y2={75} stroke="rgba(var(--accent-rgb),0.30)" strokeWidth={1} strokeDasharray="6 5" />
      {/* bottom sandwich, shifted left */}
      <Row y={94} soft r={4.5} dx={-10} />
      <Row y={110} r={6.5} dx={-10} />
      <Row y={126} soft r={4.5} dx={-10} />
      <line x1={90} y1={138} x2={44} y2={138} stroke="var(--accent-soft)" strokeWidth={1.6} markerEnd="url(#sh-arrow)" />
    </Fig>
  );
}

// Dispersant — density ratio 5.6× (paraffin vs MoS₂)
function Density({ de }: { de: boolean }) {
  return (
    <Fig vb="0 0 240 120" label="density ratio"
      cap={de ? 'MoS₂ ist 5,6× dichter — ohne Hülle sinkt es ab.' : 'MoS₂ is 5.6× denser — without a shell it sinks.'}>
      <circle cx={52} cy={62} r={15} fill="none" stroke="var(--tx2)" strokeWidth={2} />
      <Num x={52} y={66} fill="var(--txm)">0,9</Num>
      <Lbl x={52} y={94}>Paraffin</Lbl>
      <text x={120} y={50} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--accent-soft)">5,6×</text>
      <circle cx={186} cy={58} r={36} fill="rgba(var(--accent-rgb),0.10)" stroke="var(--accent-soft)" strokeWidth={2} />
      <Num x={186} y={62} fontSize={13} fill="var(--accent-soft)">5,06</Num>
      <Lbl x={186} y={108}>MoS₂ · g/cm³</Lbl>
    </Fig>
  );
}

// Antioxidant — phenolic shield breaks the radical chain
function Radical({ de }: { de: boolean }) {
  return (
    <Fig vb="0 0 240 110" label="radical chain break"
      cap={de ? 'Phenol-OH bricht die Oxidationskette → kein abrasives MoO₃.' : 'Phenolic OH breaks the oxidation chain → no abrasive MoO₃.'}>
      <path d="M86 70 Q120 26 154 70" stroke="var(--accent-soft)" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d="M120 40 L120 60" stroke="var(--accent-soft)" strokeWidth={1.6} />
      <text className="num-data" fontSize={11} fill="var(--txm)" x={28} y={52}>ROO•</text>
      <line x1={56} y1={54} x2={80} y2={62} stroke="var(--txf)" strokeWidth={1.4} strokeDasharray="2 3" />
      <line x1={82} y1={50} x2={92} y2={66} stroke="var(--accent-soft)" strokeWidth={1.6} />
      <text className="num-data" fontSize={10} fill="var(--accent-soft)" x={170} y={50}>MoS₂ ✓</text>
      <text className="num-data" fontSize={10} fill="var(--txf)" x={170} y={68}>MoO₃ ✗</text>
    </Fig>
  );
}

// PTFE — slick, non-stick film: nothing sticks, stays dry & clean
function Ptfe({ de }: { de: boolean }) {
  return (
    <Fig vb="0 0 240 120" label="PTFE glide film"
      cap={de ? 'PTFE < 1 µm hält den Film glatt und antihaftend — trocken & sauber.' : 'PTFE < 1 µm keeps the film slick and non-stick — dry & clean.'}>
      <defs><ArrowMarker id="ptfe-arrow" /></defs>
      <line x1={24} y1={88} x2={216} y2={88} stroke="var(--accent-soft)" strokeWidth={2.6} strokeLinecap="round" />
      {[56, 98, 140].map((x, i) => (
        <circle key={x} cx={x} cy={62 - i * 2} r={7 - i} fill="none" stroke="var(--tx2)" strokeWidth={1.6} opacity={0.6} />
      ))}
      <line x1={150} y1={60} x2={200} y2={60} stroke="var(--accent-soft)" strokeWidth={1.6} markerEnd="url(#ptfe-arrow)" />
      <Lbl x={120} y={108} fill="var(--accent-soft)">{de ? 'glatt, nichts haftet' : 'slick, nothing sticks'}</Lbl>
    </Fig>
  );
}

// Stearate — molecular bridge: polar head bonds to steel, tail into wax
function Stearin({ de }: { de: boolean }) {
  return (
    <Fig vb="0 0 240 120" label="adhesion promoter"
      cap={de ? 'Polarer Kopf bindet an Stahl, Kette verankert im Wachs.' : 'Polar head bonds to steel, tail anchors in the wax.'}>
      <Lbl x={120} y={22}>{de ? 'Wachsmatrix' : 'wax matrix'}</Lbl>
      {[70, 120, 170].map(x => (
        <g key={x}>
          <path d={`M${x} 86 L${x - 6} 70 L${x + 6} 54 L${x - 6} 38`} stroke="var(--accent-soft)" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={x} cy={88} r={4} fill="var(--accent-soft)" />
        </g>
      ))}
      <rect x={16} y={94} width={208} height={10} rx={2} fill="var(--tx2)" opacity={0.35} />
      <text className="num-data" fontSize={8} fill="var(--txf)" x={20} y={114}>Fe</text>
    </Fig>
  );
}

export function ComponentDiagram({ which, de, bare = false }: { which: DiagramKey; de: boolean; bare?: boolean }) {
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
  if (bare) return <>{map[which]}</>;
  return (
    <div className="rounded-xl p-4 mt-3" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      {map[which]}
    </div>
  );
}
