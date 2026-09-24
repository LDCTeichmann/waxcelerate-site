// ─── LineChoice ──────────────────────────────────────────────────────────────
// Bis 25.09.2026 stand hier auch ContactZones (ACT I der Wissenschaftsseite,
// drei Ansichten der Kette). Die Seite nutzt dafuer jetzt FrictionLens von der
// Produktseite; uebrig ist nur LineChoice, deshalb der Dateiname.

import { Link } from 'react-router-dom';
import { ReadMoreLink } from '@/sections/science/ReadMoreLink';
import { waxTechNoteClassic } from '@/lib/productContent';

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
  const header = [
    { tag: 'Classic', name: 'PTFE', forDe: 'Rennrad · Gravel · Alltag', forEn: 'Road · gravel · everyday', accent: false },
    { tag: 'MoS₂ Pro Edition', name: 'Molybdändisulfid', forDe: 'E-Bike · Winter · schwere Übersetzung', forEn: 'E-bike · winter · heavy gearing', accent: true },
  ];

  // Temperaturfenster-Zahlen sind dieselben wie in TempWindow (SciencePage.tsx,
  // ACT II) — dort die eigentliche Quelle, hier nur zur Vergleichstabelle
  // dazugestellt, kein zweiter Messwert.
  const rows = [
    // Hier stand bis 2026-09-16 eine Zeile "Reibung" mit den
    // mu-Werten aus frictionRanges. Raus, aus demselben Grund wie in
    // FrictionWatts (WISSENSCHAFT_REDESIGN.md 1.1): das sind Kennwerte der
    // Feststoffe unter trockenen Laborbedingungen, keine gemessenen Werte
    // dieser beiden Produkte im Antrieb. In einer Tabelle, deren Spalten
    // "Classic" und "MoS2 Pro Edition" heissen, liest sich so eine Zahl
    // zwangslaeufig als Produktmessung.
    //
    // An ihre Stelle die Angabe, nach der in dieser Tabelle wirklich
    // entschieden wird. Der Wortlaut folgt den Produkttexten in data.ts
    // ("haelt in Naesse und Kaelte laenger als Classic"), damit Produktseite,
    // eBay-Angebot und diese Seite dieselbe Aussage tragen statt drei
    // auseinanderlaufender Fassungen.
    {
      labelDe: 'Nässe und Kälte', labelEn: 'Wet and cold',
      classic: de ? 'Trocken bis gemischt' : 'Dry to mixed',
      pro: de ? 'Hält länger als Classic' : 'Lasts longer than Classic',
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
