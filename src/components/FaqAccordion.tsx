// ─── Fragen als weiches Akkordeon ───────────────────────────────────────────
// Dieselbe Sprache wie die FAQ der Produktseiten (FaqList in
// src/pages/product/wax/WaxSections.tsx): gerahmte Karten, „+“ dreht sich zum
// „×“, immer nur eine Antwort offen, weiche Höhe über grid-template-rows statt
// des harten <details>-Sprungs. `visible` Fragen stehen, der Rest klappt auf.
// In Tailwind statt wax.css, weil wax.css nur auf der Wachsseite geladen ist.
// Alle Fragen bleiben im DOM (versteckte per `hidden`), für Suche und JSON-LD.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';

export interface FaqAccordionItem {
  q: string;
  a: string;
  link?: { to: string; labelDe: string; labelEn: string };
}

export function FaqAccordion({ items, de, visible = 5, idPrefix = 'faq' }: {
  items: FaqAccordionItem[]; de: boolean; visible?: number; idPrefix?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(false);

  return (
    <div>
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const isOpen = open === i;
          const id = `${idPrefix}-${i}`;
          return (
            <div key={item.q} className={`rounded-xl ${i >= visible && !all ? 'hidden' : ''}`}
              style={{ background: 'var(--sf)', border: `1px solid ${isOpen ? 'var(--bd2)' : 'var(--bd)'}` }}>
              <h3 className="font-sans" style={{ fontVariationSettings: 'normal' }}>
                <button type="button" aria-expanded={isOpen} aria-controls={id}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left font-sans text-[14.5px] font-semibold rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                  style={{ color: 'var(--tx1)', outlineColor: 'var(--accent-soft)' }}>
                  {item.q}
                  <Plus className="h-4 w-4 flex-shrink-0 transition-transform duration-300"
                    style={{ color: 'var(--txf)', transform: isOpen ? 'rotate(45deg)' : undefined }} aria-hidden />
                </button>
              </h3>
              <div id={id} role="region" inert={!isOpen}
                className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 text-[14px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                    <p className="max-w-[62ch]">{item.a}</p>
                    {item.link && (
                      <Link to={item.link.to} className="inline-flex items-center gap-1.5 mt-2.5 text-[13.5px] font-semibold"
                        style={{ color: 'var(--tx1)' }}>
                        {de ? item.link.labelDe : item.link.labelEn}
                        <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {items.length > visible && (
        <button type="button" aria-expanded={all} onClick={() => setAll(v => !v)}
          className="mt-4 py-2.5 text-[13.5px] font-semibold hover:underline underline-offset-2"
          style={{ color: 'var(--accent-soft)' }}>
          {all
            ? (de ? 'Weniger Fragen zeigen' : 'Show fewer questions')
            : (de ? `Alle ${items.length} Fragen zeigen` : `Show all ${items.length} questions`)}
        </button>
      )}
    </div>
  );
}
