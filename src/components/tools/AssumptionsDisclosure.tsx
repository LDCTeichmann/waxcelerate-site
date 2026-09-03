// ── Womit gerechnet wird ────────────────────────────────────────────────────
//
// Ein Spar-Rechner auf der Seite des Verkaeufers ist nur so glaubwuerdig wie
// die Zahlen, die er zugibt. Vorher lagen zehn Preise und Laufleistungen fest
// verdrahtet im Rechner, ohne dass ein Besucher sie sehen konnte. Jetzt kommen
// sie aus waxMath.ASSUMPTIONS und stehen hier aufklappbar im Klartext — was
// nebenbei der Textkoerper ist, den eine KI aus der Seite zitieren kann.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ASSUMPTIONS } from '@/lib/waxMath';
import { useLanguage } from '@/hooks/useLanguage';

export function AssumptionsDisclosure() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [open, setOpen] = useState(false);

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
        <dl className="mt-2 space-y-1.5 max-w-xl">
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
          <p className="text-[11px] leading-snug pt-1" style={{ color: 'var(--txff)' }}>
            {t.tools.shared.assumptionsNote}
          </p>
        </dl>
      )}
    </div>
  );
}
