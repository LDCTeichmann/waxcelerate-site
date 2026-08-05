// ─── TrustStrip — eine Zeile Vertrauen zwischen Hero und Produkten ───────────
//
// Mobile-Plan B1: Wer mit Kaufabsicht kommt, soll nicht drei Bildschirme
// Erklärung durchscrollen, bevor der erste Beleg kommt, dass hier echte
// Menschen echte Ware bekommen haben. Eine Zeile, keine neue Behauptung —
// alle drei Fakten stehen bereits weiter unten auf der Seite (Reviews-Sektion,
// ProductDoors-Chip, Produktseiten) und sind nach 30_claims_language.md
// freigegebene Formulierungen. Diese Komponente wiederholt sie nur früher.
//
// Bewusst kein <Section>: dessen Standard-Padding (py-14 sm:py-28) ist für
// vollwertige Abschnitte gedacht. Diese Zeile soll rund 0,2 Bildschirme hoch
// sein, nicht 1,5.

import { useLanguage } from '@/hooks/useLanguage';
import { trustStats } from '@/lib/data';

export function TrustStrip() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const items = de
    ? [`${trustStats.sold} verkaufte Einheiten`, '100 % positives Feedback', 'Hergestellt in Stuttgart']
    : [`${trustStats.sold} units sold`, '100% positive feedback', 'Made in Stuttgart'];

  return (
    <div style={{ borderBottom: '1px solid var(--bd2)' }}>
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-20 py-3 sm:py-3.5">
        <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-[12px] sm:text-[13px]"
          style={{ color: 'var(--txm)' }}>
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2.5">
              {i > 0 && <span aria-hidden="true" style={{ color: 'var(--bd2)' }}>·</span>}
              {item}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
