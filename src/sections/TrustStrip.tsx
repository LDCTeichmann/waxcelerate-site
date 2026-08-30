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
//
// Mobile-Hero-Redesign (2026-08): auf Mobil jetzt ausgeblendet (hidden
// sm:block) — der Hero selbst zeigt seit dem Redesign direkt unter dem CTA
// bereits "★★★★★ 200+ · 100% positiv · Hergestellt in Stuttgart", genau die
// drei Fakten, die diese Komponente hierher zieht. Zwei fast identische
// Vertrauens-Zeilen in Folge, bevor auch nur ein Produkt zu sehen war, war
// der urspruengliche Befund fuer dieses Redesign. Ab sm: unveraendert (der
// Desktop-Hero traegt sein eigenes, umfangreicheres Zahlenraster in der
// Kartenleiste statt dieser drei Fakten, TrustStrip bleibt dort sinnvoll).

import { useLanguage } from '@/hooks/useLanguage';
import { trustStats } from '@/lib/data';

export function TrustStrip() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const items = de
    ? [`${trustStats.sold} verkaufte Einheiten`, '100 % positives Feedback', 'Hergestellt in Stuttgart']
    : [`${trustStats.sold} units sold`, '100% positive feedback', 'Made in Stuttgart'];

  return (
    <div className="hidden sm:block" style={{ borderBottom: '1px solid var(--bd2)' }}>
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
