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
import { ChevronDown } from 'lucide-react';
import { InstrumentFrame } from '@/components/viz';
import { ChainWaxMap } from '@/sections/science/ChainWaxMap';
import { ReadMoreLink } from '@/sections/science/ReadMoreLink';
import { frictionRanges } from '@/lib/data';
import { waxTechNoteClassic } from '@/lib/productContent';

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

// ─── ChainWaxMap footer note — collapsed by default on mobile ────────────────
// Mobile height budget: at 375x667 (iPhone SE class) the grafik frame + zone
// list together need to fit comfortably under one screen (see Mobile-Plan
// measurements). This footnote is three lines of bushingless-chain trivia
// that matters to almost no one reading the page — permanently showing it ate
// ~50px of that budget on every device. sm+ has room to spare, so it stays
// inline there; only <sm collapses it behind a tap.
function FootnoteToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="sm:hidden inline-flex items-center gap-1 text-meta font-medium"
        style={{ color: 'var(--txf)' }}>
        {'Hinweis zu Kettentypen'}
        <ChevronDown className="h-3 w-3 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <div className="sm:hidden overflow-hidden transition-[grid-template-rows]"
        style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .35s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ overflow: 'hidden' }} className="pt-2">{children}</div>
      </div>
      <div className="hidden sm:block">{children}</div>
    </>
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

      {/* -mx-4 sm:mx-0: this panel sits inside the page's own px-4 column
          padding (`${W}` in SciencePage.tsx), so on a 390px phone the whole
          InstrumentFrame — and therefore the SVG inside its own p-5 — had
          only ~316px to render a 700-unit viewBox into. Scale 0.45 put every
          label under 6 real px, well under the "never below 11px in a
          figure" rule in DESIGN.md §2. Cancelling just that one layer of
          padding (the same fix already used for FormulaGraph further down
          this page) lets the card itself run edge-to-edge on mobile and
          buys back the 32px the page column was costing it; sm:mx-0 hands
          the padding straight back for tablet and up, where there is width
          to spare. overflow-x-clip (not overflow-x-hidden) on the outer
          wrapper guards against the same transient reveal-animation overflow
          documented in SciencePage.tsx for FormulaGraph: InstrumentFrame
          enters via a rotateX(9deg) transform, which can round its box a few
          px wider than the viewport for the ~700ms of the animation.
          overflow-x-hidden would fix that but forces the other axis's
          `overflow-y` from `visible` to `auto` per spec — the tilted,
          y-translated frame counts as vertical overflow of this wrapper
          before its own reveal fires, so the browser drew a transient
          scrollbar right at the hero -> ContactZones boundary. clip leaves
          overflow-y alone; the x-overflow still gets cut. */}
      <div className="overflow-x-clip">
      <div className="-mx-4 sm:mx-0">
        <InstrumentFrame
          eyebrow={de ? 'Draufsicht, Seitenansicht, Lupe' : 'Plan, side view, close-up'}
          chip={de ? 'schematisch' : 'schematic'}
          footer={
            <FootnoteToggle>
              <p className="text-meta leading-relaxed" style={{ color: 'var(--txff)' }}>
                {de
                  ? 'Moderne 9 bis 12 fach Ketten sind buchsenlos, die Schulter der Innenlasche übernimmt deren Funktion. Gilt für alle Ketten, die wir wachsen.'
                  : 'Modern 9 to 12 speed chains are bushingless, the inner plate shoulder does that job. Applies to every chain we wax.'}
              </p>
            </FootnoteToggle>
          }
        >
          {/* Full width, not half.
              The drawing was previously beside the zone list inside this panel,
              which left a 580-unit viewBox about 300px to render in. At that
              scale its 14-unit labels land near seven real pixels and the whole
              figure floats in a field of dot grid. A section drawing needs the
              width; the list reads fine underneath. */}
          <ChainWaxMap de={de} active={active} onZone={setActive} />
        </InstrumentFrame>
      </div>
      </div>

      <div className="mt-6 sm:mt-8">
            {ZONES.map((z, i) => {
              const on = active === i;
              return (
                <button key={z.n} type="button"
                  onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}
                  aria-expanded={on}
                  className="w-full text-left py-2.5 sm:py-3.5 transition-[padding] duration-500"
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
                      <span className="block text-[13px] leading-relaxed pt-2" style={{ color: 'var(--txm)' }}>
                        {de ? z.bodyDe : z.bodyEn}
                      </span>
                      <span className="flex flex-wrap gap-1.5 mt-2">
                        {z.parts.map(p => <Pill key={p}>{p}</Pill>)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
      </div>

      {/* Zwei ehemals getrennte Absaetze zu einer Pointe zusammengezogen:
          "Ein Glied dreht sich nie durch" stand bis 2026-09 als eigener
          Abschnitt mit Eyebrow und H3 da, ein Rest aus der Zeit, als hier
          noch eine eigene Animation und ein Rechner sassen (beide entfernt).
          Als reiner Textabsatz in H2-Rahmung war das zu schwer fuer eine
          einzelne Beobachtung, die ausserdem keine vierte Kontaktzone ist,
          sondern eine Eigenschaft, die in allen drei Zonen gilt (staerkste
          Auspraegung in Zone 03, siehe deren Beschreibung oben). Beide
          Gedanken — Paraffin ist bei hohem Druck nur durchschnittlich,
          und jede Bewegung startet bei null gegen die Haftreibung — sind
          jetzt eine Pointe mit Akzentlinie statt zwei Bloecke mit eigener
          Typo-Hierarchie. */}
      <div className="mt-8 pl-4 max-w-2xl" style={{ borderLeft: '2px solid var(--accent)' }}>
        <p className="text-[14.5px] leading-relaxed text-wx-tx2">
          {de
            ? 'Paraffin allein ist unter hohem Druck übrigens nur durchschnittlich. Sein Vorteil entsteht bei niedriger Last und beim Losbrechen — und bei jedem Stillstand: Ein Kettenglied dreht sich nie durch, es kippt auf und wieder zurück. Jede Bewegung beginnt bei null und muss zuerst die Haftreibung überwinden, bevor ein Flüssigfilm überhaupt schert. Ein fester Film sitzt schon in der Oberflächenrauheit, statt erst geschert werden zu müssen. Genau deshalb besteht die Formel aus sechs Komponenten und nicht aus einer.'
            : 'Paraffin on its own is merely average under high pressure. Its advantage appears at low load and on breakaway — and at every standstill: a chain link never turns all the way round, it articulates open and back again. Every movement starts from zero and has to break static friction before a liquid film even shears. A solid film already sits in the surface roughness instead of needing to be sheared first. That is exactly why the formula has six components and not one.'}
        </p>
      </div>
      {onToFormula && (
        <button type="button" onClick={onToFormula}
          className="inline-flex items-center gap-2 mt-5 text-[13px] font-semibold transition-opacity hover:opacity-75"
          style={{ color: 'var(--tx1)' }}>
          {de ? 'Zur Formel' : 'To the formula'}
          <span aria-hidden style={{ color: 'var(--accent)' }}>→</span>
        </button>
      )}
    </section>
  );
}

// ─── Which line — zone 01 turned into a purchase decision ────────────────────
// Sits directly above the page's CTA. Everything above proves that zone 01 is
// the hardest place in the chain; this is the one block where that fact becomes
// a product choice, so it belongs next to the button and nowhere else.
//
// 2026-09 revision: two prose columns forced the reader to compare Classic and
// Pro themselves, sentence against sentence. A criteria table (same hairline-row
// language as the Kontaktzonen list above) lines the same four facts up so the
// difference is a glance, not a re-read. The PTFE note below is the one
// unbedenklichkeit disclaimer this page was missing while it kept saying
// "PTFE, same material as non-stick cookware" without ever answering the
// obvious next question — pulled from productContent.ts (waxTechNoteClassic)
// so the product page, the eBay listing and this page all carry the same
// wording, not three drifting copies of a claim that has to stay accurate.
export function LineChoice({ de }: { de: boolean }) {
  const classicMu = frictionRanges.find(r => r.id === 'classic')!;
  const proMu = frictionRanges.find(r => r.id === 'pro')!;

  const header = [
    { tag: 'Classic', name: 'PTFE', forDe: 'Rennrad · Gravel · Alltag', forEn: 'Road · gravel · everyday', accent: false },
    { tag: 'MoS₂ Pro Edition', name: 'Molybdändisulfid', forDe: 'E-Bike · Winter · schwere Übersetzung', forEn: 'E-bike · winter · heavy gearing', accent: true },
  ];

  // Temperaturfenster-Zahlen sind dieselben wie in TempWindow (SciencePage.tsx,
  // ACT II) — dort die eigentliche Quelle, hier nur zur Vergleichstabelle
  // dazugestellt, kein zweiter Messwert.
  const rows = [
    {
      labelDe: 'Reibung', labelEn: 'Friction',
      classic: `μ ${classicMu.muLo.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}–${classicMu.muHi.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}`,
      pro: `μ ${proMu.muLo.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}–${proMu.muHi.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}`,
    },
    {
      labelDe: 'Temperaturfenster', labelEn: 'Temperature range',
      classic: '+5…~35 °C', pro: '−8…45+ °C',
    },
    {
      labelDe: 'PFAS', labelEn: 'PFAS',
      classic: de ? 'Enthalten (PTFE)' : 'Present (PTFE)',
      pro: de ? 'Frei' : 'Free',
    },
    {
      labelDe: 'Einsatz', labelEn: 'Use case',
      classic: de ? header[0].forDe : header[0].forEn,
      pro: de ? header[1].forDe : header[1].forEn,
    },
  ];

  return (
    <div id="linie" className="mb-14 scroll-mt-24">
      <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
        {de ? 'Zone 01 entscheidet die Linie' : 'Zone 01 decides the line'}
      </p>
      <h3 className="font-display font-bold text-wx-tx1 leading-tight mb-8"
        style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Zwei Feststoffe, ein Unterschied.' : 'Two solids, one difference.'}
      </h3>

      {/* Header row — name + tag per column, same two-column split as before */}
      <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[minmax(0,1fr)_1fr_1fr] gap-3" style={{ borderBottom: '1px solid var(--bd2)' }}>
        <span className="hidden sm:block pb-3" />
        {header.map(h => (
          <div key={h.tag} className="pb-3">
            <p className="num-data text-small uppercase tracking-[0.13em]" style={{ color: h.accent ? 'var(--accent)' : 'var(--txf)' }}>{h.tag}</p>
            <p className="font-display font-bold text-wx-tx1 mt-1" style={{ fontSize: '1.3rem', letterSpacing: '-0.015em' }}>{h.name}</p>
          </div>
        ))}
      </div>

      {/* Criteria rows. Label sits on its own full-width line on mobile
          (not nested inside the Classic cell only, an earlier version) —
          that put the label and a two-line Classic value in one grid cell
          next to a one-line Pro value, and baseline alignment lined up
          Classic's FIRST line with Pro's only line instead of the label
          with anything, reading as visually broken. A shared label line
          above a clean two-column value row can't misalign like that. */}
      <div>
        {rows.map((r, i) => (
          <div key={r.labelDe} className="py-3"
            style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--bd2)' : undefined }}>
            <span className="sm:hidden block text-meta mb-1" style={{ color: 'var(--txf)' }}>{de ? r.labelDe : r.labelEn}</span>
            <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[minmax(0,1fr)_1fr_1fr] items-baseline gap-3">
              <span className="hidden sm:block text-[13px]" style={{ color: 'var(--txf)' }}>{de ? r.labelDe : r.labelEn}</span>
              <span className="text-[13px] num-data" style={{ color: 'var(--tx2)' }}>{r.classic}</span>
              <span className="text-[13px] num-data font-semibold" style={{ color: 'var(--accent-soft)' }}>{r.pro}</span>
            </div>
          </div>
        ))}
      </div>

      {/* PTFE health/safety note — same wording as the product page and eBay,
          imported rather than duplicated (see import above). */}
      <div className="mt-6 rounded-xl p-4" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
        <p className="text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--tx1)' }}>
          {waxTechNoteClassic.title}
        </p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>
          {waxTechNoteClassic.body}
        </p>
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

      {de && (
        <ReadMoreLink to="/blog/ebike-kette-wachsen">
          Mehr zum E-Bike-Fall im Ratgeber
        </ReadMoreLink>
      )}
    </div>
  );
}
