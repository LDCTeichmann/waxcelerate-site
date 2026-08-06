// ─── ACT I — where friction actually comes from ───────────────────────────────
// The page had ACT II and ACT III but no ACT I, and the hero's "Wie das gemessen
// wurde" link pointed at #problem, an anchor that existed nowhere. This section
// is that missing act and owns the anchor.
//
// Deliberately text-light. The drawing and the ↔ glyph carry the explanation;
// each zone gets one sentence and the components that serve it as pills, which
// removes the separate zone→component table that used to sit underneath and
// hands straight over to ACT II.
//
// Mechanics per Friction Facts / Zero Friction Cycling, "Friction-Producing
// Mechanisms of a Bicycle Chain". No measured Waxcelerate claim in here; the one
// number is arithmetic and labelled as such.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InstrumentFrame } from '@/components/viz';
import { ChainJointSection } from '@/sections/science/ChainJointSection';

const ARTICULATION_POINTS = 8; // chainring, cog, both pulleys — in and out

const ZONES = [
  {
    n: '01',
    de: 'Bolzen gegen Laschenschulter', en: 'Pin against plate shoulder',
    loadDe: 'Höchster Druck', loadEn: 'Highest pressure',
    bodyDe: 'Kleinste Fläche, volle Kettenspannung. Hier entsteht die Längung, die du mit der Kettenlehre misst.',
    bodyEn: 'Smallest area, full chain tension. This is where the elongation you measure with a chain checker comes from.',
    parts: ['MoS₂', 'PTFE'],
  },
  {
    n: '02',
    de: 'Rolle gegen Laschenschulter', en: 'Roller against plate shoulder',
    loadDe: 'Hoher Druck', loadEn: 'High pressure',
    bodyDe: 'Offen nach außen, also die Stelle, an der Staub in den Antrieb kommt. Ein fester Film bindet ihn nicht.',
    bodyEn: 'Open to the outside, so this is where dust enters the drivetrain. A solid film does not hold on to it.',
    parts: ['Mikrokristallines Wachs', 'FT-Wachs'],
  },
  {
    n: '03',
    de: 'Innenlasche gegen Außenlasche', en: 'Inner plate against outer plate',
    loadDe: 'Wenig Druck', loadEn: 'Low pressure',
    bodyDe: 'Große Fläche, kaum Last. Ein Flüssigfilm muss hier bei jeder Bewegung geschert werden, ein trockener nicht.',
    bodyEn: 'Large area, almost no load. A liquid film has to be sheared with every movement here, a dry one does not.',
    parts: ['FT-Wachs'],
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="num-data text-meta px-2 py-[3px] rounded-full whitespace-nowrap"
      style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.14)', color: 'var(--accent)' }}>
      {children}
    </span>
  );
}

// ─── The breakaway counter ───────────────────────────────────────────────────
function Breakaway({ de }: { de: boolean }) {
  const [teeth, setTeeth] = useState(53);
  const [rpm, setRpm] = useState(95);
  const locale = de ? 'de-DE' : 'en-US';

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-center">
      <div>
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Und dazwischen: Stillstand' : 'And in between: standstill'}
        </p>
        <h3 className="font-display font-bold text-wx-tx1 leading-tight tracking-[-0.02em]"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>
          {de ? 'Ein Glied dreht sich nie durch.' : 'A link never turns all the way round.'}
        </h3>
        <p className="text-[15px] leading-relaxed text-wx-tx2 mt-4 max-w-[44ch]">
          {de
            ? 'Es kippt auf und wieder zurück. Jede Bewegung beginnt bei null und muss zuerst die Haftreibung überwinden. Ein fester Film sitzt in der Oberflächenrauheit, statt zwei Flächen aneinander zu kleben.'
            : 'It articulates open and back again. Every movement starts from zero and has to break static friction first. A solid film sits in the surface roughness instead of sticking two faces together.'}
        </p>

        <div className="mt-7 space-y-4 max-w-xs">
          {[
            { id: 'wx-teeth', l: de ? 'Kettenblatt' : 'Chainring', v: teeth, set: setTeeth, min: 34, max: 56, u: de ? 'Z' : 'T' },
            { id: 'wx-rpm', l: de ? 'Trittfrequenz' : 'Cadence', v: rpm, set: setRpm, min: 60, max: 110, u: 'rpm' },
          ].map(c => (
            <div key={c.id}>
              <label htmlFor={c.id} className="flex justify-between items-baseline text-[12.5px]"
                style={{ color: 'var(--txm)' }}>
                <span>{c.l}</span>
                <span className="num-data" style={{ color: 'var(--tx1)' }}>{c.v} {c.u}</span>
              </label>
              <input id={c.id} type="range" min={c.min} max={c.max} step={1} value={c.v}
                onChange={e => c.set(Number(e.target.value))} className="wx-range w-full mt-2.5" />
            </div>
          ))}
        </div>
      </div>

      <InstrumentFrame
        eyebrow={de ? 'Haftreibung' : 'Breakaway friction'}
        chip={`${teeth}T · ${rpm} rpm`}
        footer={
          <p className="text-meta leading-relaxed" style={{ color: 'var(--txff)' }}>
            {de
              ? 'Zähne × Trittfrequenz × 8 Umlenkpunkte. Reine Geometrie, kein Messwert.'
              : 'Teeth × cadence × 8 articulation points. Pure geometry, not a measurement.'}
          </p>
        }
      >
        <div className="py-7 text-center">
          <p className="num-data font-bold leading-none tabular-nums"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 4.4rem)', letterSpacing: '-0.045em', color: 'var(--tx1)' }}>
            {(teeth * rpm * ARTICULATION_POINTS).toLocaleString(locale)}
          </p>
          <p className="text-small uppercase tracking-[0.16em] mt-4" style={{ color: 'var(--txf)' }}>
            {de ? 'Losbrech-Vorgänge pro Minute' : 'Breakaway events per minute'}
          </p>
        </div>
      </InstrumentFrame>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export function ContactZones({ de, onToFormula }: { de: boolean; onToFormula?: () => void }) {
  const [active, setActive] = useState(0);

  return (
    <section id="problem" className="scroll-mt-24">
      <div className="mb-10">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Kontaktzonen' : 'Contact zones'}
        </p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight"
          style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>
          {de ? 'Drei Flächen, mehr nicht.' : 'Three surfaces. That is all.'}
        </h2>
        <p className="text-wx-txm text-lead max-w-xl mt-4">
          {de
            ? 'Alles, was ein Schmierstoff leisten kann, leistet er an diesen drei Stellen. Keine ist wie die andere, und keine einzelne Substanz ist an allen dreien stark.'
            : 'Whatever a lubricant can do, it does at these three places. No two are alike, and no single substance is strong at all three.'}
        </p>
      </div>

      <InstrumentFrame
        eyebrow={de ? 'Schnitt durch ein Gelenk' : 'Section through one joint'}
        chip={de ? 'schematisch' : 'schematic'}
        footer={
          <p className="text-meta leading-relaxed" style={{ color: 'var(--txff)' }}>
            {de
              ? 'Moderne 9 bis 12 fach Ketten sind buchsenlos, die Schulter der Innenlasche übernimmt deren Funktion. Gilt für alle Ketten, die wir wachsen.'
              : 'Modern 9 to 12 speed chains are bushingless, the inner plate shoulder does that job. Applies to every chain we wax.'}
          </p>
        }
      >
        {/* Full width, not half.
            The drawing was previously beside the zone list inside this panel,
            which left a 580-unit viewBox about 300px to render in. At that
            scale its 14-unit labels land near seven real pixels and the whole
            figure floats in a field of dot grid. A section drawing needs the
            width; the list reads fine underneath. */}
        <ChainJointSection active={active} onZone={setActive} />
      </InstrumentFrame>

      <div className="mt-6 sm:mt-8">
            {ZONES.map((z, i) => {
              const on = active === i;
              return (
                <button key={z.n} type="button"
                  onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}
                  aria-expanded={on}
                  className="w-full text-left py-3.5 transition-[padding] duration-500"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bd2)', paddingLeft: on ? 10 : 0 }}>
                  <span className="flex items-baseline gap-3">
                    <span className="num-data text-meta flex-shrink-0"
                      style={{ color: on ? 'var(--accent)' : 'var(--txf)', transition: 'color .3s' }}>{z.n}</span>
                    <span className="text-[14px] text-wx-tx1 leading-snug">{de ? z.de : z.en}</span>
                    <span className="ml-auto text-small uppercase tracking-[0.13em] whitespace-nowrap flex-shrink-0"
                      style={{ color: 'var(--txf)' }}>{de ? z.loadDe : z.loadEn}</span>
                  </span>
                  <span style={{ display: 'grid', gridTemplateRows: on ? '1fr' : '0fr', transition: 'grid-template-rows .45s cubic-bezier(0.22,1,0.36,1)' }}>
                    <span style={{ overflow: 'hidden' }}>
                      <span className="block text-[13px] leading-relaxed pt-2.5" style={{ color: 'var(--txm)' }}>
                        {de ? z.bodyDe : z.bodyEn}
                      </span>
                      <span className="flex flex-wrap gap-1.5 mt-3">
                        {z.parts.map(p => <Pill key={p}>{p}</Pill>)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
      </div>

      <p className="text-wx-txm text-[14.5px] leading-relaxed max-w-2xl mt-8">
        {de
          ? 'Paraffin allein ist unter hohem Druck übrigens nur durchschnittlich. Sein Vorteil entsteht bei niedriger Last und beim Losbrechen. Genau deshalb besteht die Formel aus sechs Komponenten und nicht aus einer.'
          : 'Paraffin on its own is merely average under high pressure. Its advantage appears at low load and on breakaway. That is exactly why the formula has six components and not one.'}
      </p>
      {onToFormula && (
        <button type="button" onClick={onToFormula}
          className="inline-flex items-center gap-2 mt-4 text-[13px] font-semibold transition-opacity hover:opacity-75"
          style={{ color: 'var(--tx1)' }}>
          {de ? 'Zur Formel' : 'To the formula'}
          <span aria-hidden style={{ color: 'var(--accent)' }}>→</span>
        </button>
      )}

      <div className="mt-20 sm:mt-24">
        <Breakaway de={de} />
      </div>
    </section>
  );
}

// ─── Which line — zone 01 turned into a purchase decision ────────────────────
// Sits directly above the page's CTA. Everything above proves that zone 01 is
// the hardest place in the chain; this is the one block where that fact becomes
// a product choice, so it belongs next to the button and nowhere else.
export function LineChoice({ de }: { de: boolean }) {
  const lines = [
    {
      tag: 'Classic', name: 'PTFE',
      forDe: 'Rennrad · Gravel · Alltag', forEn: 'Road · gravel · everyday',
      de: 'Sehr niedrige Reibung, glatter trockener Film. Lebensmittelzugelassen, bekannt aus Antihaft-Kochgeschirr.',
      en: 'Very low friction, smooth dry film. Food-grade, the same material as non-stick cookware.',
      accent: false,
    },
    {
      tag: 'MoS₂ Pro Edition', name: 'Molybdändisulfid',
      forDe: 'E-Bike · Winter · schwere Übersetzung', forEn: 'E-bike · winter · heavy gearing',
      de: 'Schichtförmig aufgebaut und dadurch belastbarer genau in Zone 01. Zusätzlich PFAS-frei.',
      en: 'Layered, and therefore more load bearing exactly in zone 01. PFAS-free as well.',
      accent: true,
    },
  ];

  return (
    <div className="mb-14">
      <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
        {de ? 'Zone 01 entscheidet die Linie' : 'Zone 01 decides the line'}
      </p>
      <h3 className="font-display font-bold text-wx-tx1 leading-tight mb-8"
        style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Zwei Feststoffe, ein Unterschied.' : 'Two solids, one difference.'}
      </h3>

      <div className="grid sm:grid-cols-2" style={{ borderTop: '1px solid var(--bd2)' }}>
        {lines.map((l, i) => (
          <div key={l.tag} className="py-7 sm:pr-9"
            style={{ borderLeft: i === 1 ? '1px solid var(--bd2)' : undefined, paddingLeft: i === 1 ? 36 : 0 }}>
            <p className="num-data text-small uppercase tracking-[0.14em]"
              style={{ color: l.accent ? 'var(--accent)' : 'var(--txf)' }}>{l.tag}</p>
            <p className="font-display font-bold text-wx-tx1 mt-2" style={{ fontSize: '1.6rem', letterSpacing: '-0.015em' }}>
              {l.name}
            </p>
            <p className="text-[13.5px] leading-relaxed mt-3 max-w-[38ch]" style={{ color: 'var(--txm)' }}>
              {de ? l.de : l.en}
            </p>
            <p className="text-small uppercase tracking-[0.13em] mt-4" style={{ color: 'var(--txf)' }}>
              {de ? l.forDe : l.forEn}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[12px] mt-5" style={{ color: 'var(--txff)' }}>
        {de
          ? 'Beide Linien nutzen dieselbe Wachsmatrix. Der Unterschied liegt allein im Feststoff.'
          : 'Both lines use the same wax matrix. The difference is the solid lubricant alone.'}
        {' '}
        <Link to="/#produkte" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>
          {de ? 'Zu den Produkten' : 'See the products'}
        </Link>
      </p>
    </div>
  );
}
