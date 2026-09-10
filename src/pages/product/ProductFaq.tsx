// ── Haeufige Fragen, produktbezogen ─────────────────────────────────────────
//
// Die Produktseite hatte kein FAQ. Die 22 Fragen in i18n.ts (t.faq.items)
// laufen bisher nur auf der Startseite und beantworten dort alles auf einmal —
// darunter genau die Fragen, die auf der Produktseite den Kauf blockieren
// ("Welche Ausruestung brauche ich, muss das teuer sein?", "Muss ich eine neue
// Kette vor dem Wachsen entfetten?").
//
// KEINE NEUE COPY. Ausgewaehlt wird aus dem freigegebenen Bestand, gefiltert
// nach Stichworten. Die Auswahl faellt still leer aus, wenn eine Frage
// umformuliert wird — das ist bewusst so: lieber eine Frage weniger als eine
// unpassende oder ein Absturz.
//
// Bewusst OHNE FAQPage-JSON-LD. Google hat FAQ-Rich-Results am 07.05.2026
// vollstaendig aus der Suche entfernt, und dieselben Fragen tragen bereits auf
// der Startseite Schema. Zweimal dasselbe FAQPage-Markup auf einer Domain
// bringt nichts und ist im Zweifel schaedlich.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

/** Stichworte, an denen eine Frage als produktrelevant erkannt wird.
 *  Reihenfolge = Anzeigereihenfolge. */
const WAX_TOPICS = [
  'Classic und Pro', 'Classic or Pro',
  'Ausrüstung', 'equipment',
  'entfetten', 'degrease',
  'Anwendungen hält ein 500g', 'applications does a 500g',
  'breche ich die Kette', 'break the chain in',
  'Nachwachsen immer alles', 'always remove all',
  'nicht so lange', 'not last as long',
  'PTFE',
  'E-Bike',
  'Kassette und Kettenblätter', 'cassette and chainrings',
  'Wachstopf', 'wax pot',
];

const CHAIN_TOPICS = [
  'vorgewachsten Kette', 'pre-waxed chain',
  'komplett ersetzen', 'replace the chain',
  'Quick-Links', 'quick links',
  'Ultraschallbad', 'ultrasonic',
  'Regen', 'rain',
  'Ketten-Rotation', 'chain rotation',
];

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--bd)' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 text-left py-4 transition-opacity hover:opacity-70"
      >
        <span className="text-[14.5px] font-semibold leading-[1.4]" style={{ color: 'var(--tx1)' }}>{q}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 mt-0.5 transition-transform"
          style={{ color: 'var(--txf)', transform: open ? 'rotate(180deg)' : undefined }} aria-hidden />
      </button>
      {/* grid-template-rows 0fr -> 1fr, dasselbe Aufklappmuster wie die
          Akkordeons weiter oben auf der Seite. */}
      <div className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <p className="text-[13.5px] leading-[1.65] pb-5 pr-8 max-w-3xl" style={{ color: 'var(--txm)' }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export function ProductFaq({ category }: { category: 'wax' | 'chain' | 'bundle' }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const topics = category === 'chain' ? CHAIN_TOPICS : WAX_TOPICS;
  const items = (t.faq.items ?? []).filter(item =>
    topics.some(topic => item.q.includes(topic)),
  );

  if (items.length === 0) return null;

  return (
    <section style={{ background: 'var(--pg)' }}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 pb-12 lg:pb-16">
        <div className="pt-12 lg:pt-16" style={{ borderTop: '1px solid var(--bd)' }}>
          <p className="eyebrow mb-2">{de ? 'Aus der Praxis' : 'From practice'}</p>
          <h2 className="font-display text-[22px] sm:text-[28px] font-bold tracking-[-0.025em] mb-8"
            style={{ color: 'var(--tx1)' }}>
            {de ? 'Häufige Fragen' : 'Common questions'}
          </h2>
          <div className="max-w-3xl">
            {items.map((item, i) => <FaqRow key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
