import { useEffect, useRef, useState } from 'react';
import { Ico, type IcoName } from './wax/Ico';
import { ChapterHead } from './wax/WaxSections';

// ══════════════════════════════════════════════════════════════
// PDP v6, Schritt 4a — "Mehr wissen"-Deck
// ══════════════════════════════════════════════════════════════
// Reibung, Rechner, Ablauf (und je nach Seite "Wenn der Block leer ist" /
// "Nach dem ersten Film") stehen zugeklappt in Karten statt als eigene
// Kapitel im Fliesstext — Luca: "Leute lesen nicht", der Kaufblock soll nicht
// wieder zur Wand werden. Immer nur eine Karte offen, Inhalt erst beim
// Oeffnen gemountet.
export type DeepDiveItem = {
  id: string;
  icon: IcoName;
  title: string;
  teaser: string;
  /** Kleine statische Grafik aus DeepDivePreviews — zeigt schon auf der
   *  geschlossenen Karte, was dahinter steckt. */
  preview?: React.ReactNode;
  render: () => React.ReactNode;
};

/** Andere Stellen der Seite koennen eine Karte gezielt oeffnen (z. B. ein
 *  Link "Rechnet sich das? ansehen"), ohne DeepDive-internen State zu kennen. */
export function openDeepDive(id: string) {
  window.dispatchEvent(new CustomEvent('wxp-dd', { detail: id }));
}

export function DeepDive({ de, items }: { de: boolean; items: DeepDiveItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onEvent = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (items.some(it => it.id === id)) setOpen(id);
    };
    window.addEventListener('wxp-dd', onEvent);
    return () => window.removeEventListener('wxp-dd', onEvent);
  }, [items]);

  // Nach dem Oeffnen zum Panel scrollen — der Timeout laesst die Panel-
  // Einblendanimation erst starten, sonst zielt scrollIntoView auf eine noch
  // nicht layoutete Hoehe.
  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => {
      panelRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }, reduce ? 0 : 260);
    return () => clearTimeout(t);
  }, [open]);

  const active = items.find(it => it.id === open);

  return (
    <section className="wxp-chapter wxp-graybg wxp-dd">
      <div className="wxp-wrap">
        <ChapterHead n={de ? 'Mehr wissen' : 'Learn more'} title={de ? 'Für Neugierige.' : 'For the curious.'}
          lede={de ? `${items.length} Themen, je eine Minute. Tippen zum Aufklappen.` : `${items.length} topics, a minute each. Tap to open.`} />
        <div className="wxp-dd-grid">
          {items.map(item => {
            const isOpen = item.id === open;
            return (
              <button key={item.id} type="button" className="wxp-card wxp-dd-card"
                aria-expanded={isOpen} aria-controls={`dd-${item.id}`} data-open={isOpen || undefined}
                onClick={() => setOpen(isOpen ? null : item.id)}>
                {item.preview && <span className="pv">{item.preview}</span>}
                <span className="tt"><span className="ic"><Ico name={item.icon} /></span>{item.title}</span>
                <span className="ts">{item.teaser}</span>
                <span className="cta">{isOpen ? (de ? 'Schließen –' : 'Close –') : (de ? 'Ansehen +' : 'View +')}</span>
              </button>
            );
          })}
        </div>
      </div>
      {active && (
        <div id={`dd-${active.id}`} className="wxp-dd-panel" ref={panelRef}>
          {active.render()}
        </div>
      )}
    </section>
  );
}
