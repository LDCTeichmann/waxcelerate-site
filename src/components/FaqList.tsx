// ─── Aufklappbare Fragenliste ───────────────────────────────────────────────
// Dasselbe <details>-Muster wie die Fragen auf /kette-wachsen-lassen, hier
// herausgelöst für Starter-Set und Zubehörseiten. Ab lg zweispaltig.

import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
  link?: { to: string; labelDe: string; labelEn: string };
}

export function FaqList({ items, de, columns = true }: { items: FaqItem[]; de: boolean; columns?: boolean }) {
  return (
    <div className={columns ? 'lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start' : ''}>
      {items.map((item) => (
        <details key={item.q} className="group py-4" style={{ borderBottom: '1px solid var(--bd2)' }}>
          <summary className="flex items-center justify-between gap-5 cursor-pointer list-none min-h-11">
            <h3 className="text-[15px] font-medium" style={{ color: 'var(--tx1)' }}>{item.q}</h3>
            <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-180"
              style={{ color: 'var(--txf)' }} aria-hidden />
          </summary>
          <p className="text-[14px] leading-relaxed mt-2 max-w-[62ch]" style={{ color: 'var(--txm)' }}>{item.a}</p>
          {item.link && (
            <Link to={item.link.to} className="inline-flex items-center gap-2 mt-2 text-[13.5px] font-semibold"
              style={{ color: 'var(--tx1)' }}>
              {de ? item.link.labelDe : item.link.labelEn}
              <ArrowRight className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            </Link>
          )}
        </details>
      ))}
    </div>
  );
}
