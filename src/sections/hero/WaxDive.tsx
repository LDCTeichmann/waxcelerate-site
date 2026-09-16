import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { SegmentedToggle } from '@/components/viz';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { WaxVerdict } from '@/sections/hero/WaxVerdict';
import { WaxFormulaPanel } from '@/sections/hero/WaxFormulaPanel';
import type { Entry } from '@/lib/waxRecommendation';

type Tab = 'verdict' | 'formula';

/** Kurz halten: zwei Reiter stehen neben Titel und Schliessen in einer Zeile. */
const TABS = (de: boolean) => [
  { value: 'verdict' as const, label: de ? 'Für mich' : 'For me' },
  { value: 'formula' as const, label: de ? 'Was drin ist' : "What's in it" },
];

/**
 * Der Wachs-Klick im Hero — das Gehaeuse fuer zwei Reiter.
 *
 * Bis 09/2026 oeffnete dieser Klick direkt "Die Formel unter der Lupe".
 * Dieselben sechs Komponenten stehen ausfuehrlicher auf /wissenschaft, und
 * die Rezeptur beantwortet die Frage nicht, mit der jemand hier steht. Der
 * Moment traegt jetzt zuerst ein Urteil (WaxVerdict) und daneben, einen Klick
 * entfernt, weiterhin die Rezeptur (WaxFormulaPanel).
 *
 * Bewusst KEIN zweiter Moment: derselbe Ausloeser, dieselbe Lupe, dasselbe
 * Gehaeuse — nur die Nutzlast ist getauscht. UX_UPGRADE_PLAN.md §7.5:
 * "Diese Seite hat ihren Moment bereits ... Fueg keinen zweiten hinzu."
 */
export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [tab, setTab] = useState<Tab>('verdict');
  // Liegt beim Urteil, nicht im Reiter: wer zur Rezeptur und zurueck geht,
  // soll seinen Zweig wiederfinden.
  const [entry, setEntry] = useState<Entry>('waxes');
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => { window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const title = tab === 'verdict'
    ? (de ? 'Welcher Block ist deiner?' : 'Which block is yours?')
    : (de ? 'Die Formel unter der Lupe' : 'The formula up close');
  const sub = tab === 'verdict'
    ? (de ? 'Drei Angaben. Dann weißt du es.' : 'Three answers. Then you know.')
    : (de ? 'Was in dem Block steckt, Komponente für Komponente.' : 'What is in the block, component by component.');

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Welcher Block ist deiner' : 'Which block is yours'}
        tabIndex={-1}
        className="relative w-full max-w-4xl max-h-[90dvh] flex flex-col rounded-2xl outline-none"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad), 0 40px 100px rgba(0,0,0,0.35)' }}
      >
        {/* ── Kopf ── */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-5 flex-shrink-0"
          style={{ background: 'var(--sf)', borderBottom: '1px solid var(--bd)', borderRadius: '1rem 1rem 0 0' }}>
          <div className="min-w-0">
            {/* Schliesst die Klammer zur Schlagzeile des Heros. Der Klick soll
                dieses Versprechen einloesen, nicht ihm widersprechen. */}
            <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>
              {tab === 'verdict'
                ? (de ? 'Am Ende der Recherche' : 'End of the research')
                : (de ? 'Blick ins Wachs' : 'Inside the wax')}
            </p>
            <p className="font-display font-bold text-[18px] sm:text-[19px] leading-tight mt-1 truncate" style={{ color: 'var(--tx1)' }}>
              {title}
            </p>
            <p className="text-[11.5px] mt-1 hidden sm:block" style={{ color: 'var(--txm)' }}>{sub}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Die Sichtbarkeitsklassen gehoeren an den Wrapper, nicht an den
                Toggle: `sm:block` auf dem Toggle selbst ueberschreibt sein
                `grid` und stellt die beiden Reiter untereinander. */}
            <div className="hidden sm:block">
              <SegmentedToggle
                ariaLabel={de ? 'Ansicht' : 'View'}
                value={tab}
                onChange={setTab}
                className="w-[248px]"
                options={TABS(de)}
              />
            </div>
            <button
              onClick={onClose}
              aria-label={de ? 'Schließen' : 'Close'}
              className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 btn-ghost"
              style={{ border: '1px solid var(--bd)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Auf dem Handy sind zwei Reiter neben Titel und Schliessen zu viel
            fuer eine Zeile — dort stehen sie darunter, ueber die volle Breite. */}
        <div className="sm:hidden px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--bd)' }}>
          <SegmentedToggle
            ariaLabel={de ? 'Ansicht' : 'View'}
            value={tab}
            onChange={setTab}
            options={TABS(de)}
          />
        </div>

        {tab === 'verdict' ? (
          <WaxVerdict
            de={de}
            onClose={onClose}
            entry={entry}
            setEntry={setEntry}
            onShowFormula={() => setTab('formula')}
          />
        ) : (
          <WaxFormulaPanel de={de} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body,
  );
}
