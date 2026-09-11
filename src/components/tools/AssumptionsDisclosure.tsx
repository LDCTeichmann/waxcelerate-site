// ── Womit gerechnet wird ────────────────────────────────────────────────────
//
// Ein Spar-Rechner auf der Seite des Verkaeufers ist nur so glaubwuerdig wie
// die Zahlen, die er zugibt. Vorher lagen zehn Preise und Laufleistungen fest
// verdrahtet im Rechner, ohne dass ein Besucher sie sehen konnte. Jetzt kommen
// sie aus waxMath.ASSUMPTIONS und stehen hier aufklappbar im Klartext — was
// nebenbei der Textkoerper ist, den eine KI aus der Seite zitieren kann.
//
// Etappe 5 (11.09.2026): optional zusaetzlich die drivetrainCosts-Aufschluess-
// elung (Kette/Kassette/Schmierstoff, Oel gegen Wachs). Die Kassette ist der
// groesste Einzelposten der Ersparnis (15.000 km mit Oel gegen 30.000 km mit
// Wachs) — das stand bisher nirgends auf der Seite. Der Schmierstoff ist die
// einzige Zeile, in der Wachs verliert; sie gehoert sichtbar dazu, sonst ist
// die Offenlegung keine. Die Tabelle steht ABSICHTLICH ausserhalb der <dl>,
// nicht darin — nur <dt>/<dd> sind direkte Kinder eines <dl> erlaubt (dieser
// Fehler kostete in Etappe 2 bereits einmal die A11y-Wertung).

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ASSUMPTIONS } from '@/lib/waxMath';
import type { DrivetrainCosts } from '@/lib/waxMath';
import { useLanguage } from '@/hooks/useLanguage';

export function AssumptionsDisclosure({ breakdown, oilPerYear, waxPerYear }: {
  breakdown?: DrivetrainCosts['breakdown'];
  oilPerYear?: number;
  waxPerYear?: number;
}) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [open, setOpen] = useState(false);
  const hasBreakdown = !!breakdown && oilPerYear !== undefined && waxPerYear !== undefined;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="relative flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer after:content-[''] after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:h-11"
        style={{ color: 'var(--brand)' }}
      >
        {t.tools.shared.assumptions}
        <ChevronDown className="h-3.5 w-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && (
        <div className="mt-2 max-w-xl">
          {hasBreakdown && breakdown && (
            <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--bd)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--txff)' }}>
                {t.tools.shared.breakdownTitle}
              </p>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1">
                <span />
                <span className="text-[11px] text-right font-medium" style={{ color: 'var(--txff)' }}>{t.tools.shared.breakdownOil}</span>
                <span className="text-[11px] text-right font-medium" style={{ color: 'var(--txff)' }}>{t.tools.shared.breakdownWax}</span>

                <span className="text-[12px]" style={{ color: 'var(--txf)' }}>{t.tools.shared.breakdownChain}</span>
                <span className="text-[12px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{breakdown.chain.oil} €</span>
                <span className="text-[12px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{breakdown.chain.wax} €</span>

                <span className="text-[12px]" style={{ color: 'var(--txf)' }}>{t.tools.shared.breakdownCassette}</span>
                <span className="text-[12px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{breakdown.cassette.oil} €</span>
                <span className="text-[12px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{breakdown.cassette.wax} €</span>

                <span className="text-[12px]" style={{ color: 'var(--txf)' }}>{t.tools.shared.breakdownLube}</span>
                <span className="text-[12px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{breakdown.lube.oil} €</span>
                <span className="text-[12px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{breakdown.lube.wax} €</span>

                <span className="text-[12px] font-semibold pt-1" style={{ color: 'var(--txf)', borderTop: '1px solid var(--bd)' }}>
                  {de ? 'Gesamt' : 'Total'}
                </span>
                <span className="text-[12px] text-right font-semibold tabular-nums pt-1" style={{ color: 'var(--tx1)', borderTop: '1px solid var(--bd)' }}>
                  {oilPerYear} €
                </span>
                <span className="text-[12px] text-right font-semibold tabular-nums pt-1" style={{ color: 'var(--tx1)', borderTop: '1px solid var(--bd)' }}>
                  {waxPerYear} €
                </span>
              </div>
            </div>
          )}
          <dl className="space-y-1.5">
            {ASSUMPTIONS.map(a => (
              <div key={a.label} className="flex items-baseline justify-between gap-3">
                <dt className="text-[12px] leading-snug" style={{ color: 'var(--txf)' }}>
                  {de ? a.label : a.labelEn}
                </dt>
                <dd className="text-[12px] font-medium tabular-nums text-right flex-shrink-0" style={{ color: 'var(--tx2)' }}>
                  {de ? a.value : a.valueEn}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] leading-snug pt-1" style={{ color: 'var(--txff)' }}>
            {t.tools.shared.assumptionsNote}
          </p>
        </div>
      )}
    </div>
  );
}
