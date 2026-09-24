// ─── Kreislauf als Schiene: Zweitkette → Tauschen → Einsenden → Wachsen ─────
// Wie Seite 3 des Infoblatts, aber mit der Zweitkette als erstem Schritt.
// Desktop: waagerechte Schiene, darunter eine gestrichelte Rueckfuehrung von
// Schritt 4 zurueck zu Schritt 2 (der wiederkehrende Teil). Handy: senkrechte
// Schiene, die Rueckfuehrung als Zeile unter dem letzten Schritt.
// Nur Theme-Tokens und Haarlinien (docs/DESIGN.md §3), Schrift nie unter 11 px.

import { CYCLE, CYCLE_RETURN } from './content';

export function CycleDiagram() {
  return (
    <figure className="m-0">
      <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
        {/* Schiene: senkrecht links (Handy), waagerecht durch die Punkte (Desktop). */}
        <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px md:hidden" style={{ background: 'var(--bd)' }} />
        <span aria-hidden className="absolute left-0 right-0 top-[5px] hidden h-px md:block" style={{ background: 'var(--bd)' }} />
        {CYCLE.map((c, i) => (
          <li key={c.title} className="relative pl-8 md:pl-0 md:pt-8">
            <span
              aria-hidden
              className="absolute left-0 top-1 h-[11px] w-[11px] rounded-full md:top-0"
              style={{ background: i === 0 ? 'var(--pg)' : 'var(--accent)', border: '1.7px solid var(--accent)' }}
            />
            <p className="eyebrow mb-2">{String(i + 1).padStart(2, '0')} · {c.who}</p>
            <p className="text-[17px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>{c.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{c.text}</p>
          </li>
        ))}
      </ol>

      {/* Rueckfuehrung 4 → 2, nur Desktop: U-Form aus gestrichelten Kanten von
          Punkt 2 bis Punkt 4. Die Punkte sitzen am linken Spaltenrand, deshalb
          endet das U eine Spaltenluecke (24 px) hinter Spalte 3. */}
      <div aria-hidden className="mt-6 hidden md:grid md:grid-cols-4 md:gap-6">
        <div className="relative col-start-2 col-end-4 h-8 border-x border-b border-dashed" style={{ borderColor: 'var(--accent)', marginLeft: 5, marginRight: -19 }}>
          <span className="absolute -top-[6px] left-[-5px] h-0 w-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '7px solid var(--accent)' }} />
          <span className="eyebrow absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-3" style={{ background: 'var(--sf)' }}>
            {CYCLE_RETURN}
          </span>
        </div>
      </div>
      <p className="eyebrow mt-6 pl-8 md:hidden">↺ {CYCLE_RETURN}</p>
    </figure>
  );
}
