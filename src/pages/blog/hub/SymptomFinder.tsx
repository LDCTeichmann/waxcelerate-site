import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { symptoms } from '../hubContent';
import { headingId } from '../headingId';

/**
 * Symptom-Wegweiser: "Was ist los mit deiner Kette?"
 *
 * Bis 09/2026 eine interaktive Antriebs-SVG mit sechs Hotspots und einem
 * Detail-Panel daneben (Seitenordnung Chat 4: raus, siehe SEITENORDNUNG_PLAN.md
 * "Etwas stimmt nicht?"). Die Grafik war hübsch, aber ein zweiter Klick bis zur
 * eigentlichen Antwort — hier stattdessen sechs Direktlinks: Symptom lesen,
 * Ursache in einem Satz, ein Klick landet direkt im Abschnitt, der es genau
 * erklärt. `sprocketPath` (components/tools/sketches.tsx) bleibt, es zeichnet
 * weiterhin die Rechner-Grafiken.
 */
export function SymptomFinder() {
  return (
    <section aria-labelledby="symptome-titel" className="mb-20">
      <div className="max-w-xl mb-8">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>Etwas stimmt nicht?</p>
        <h2 id="symptome-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1] mb-3">
          Was ist los mit deiner Kette?
        </h2>
        <p className="text-[15px] leading-[1.7] text-wx-txm">
          Tipp auf das Symptom, das zu dir passt. Der Link springt direkt in den
          Abschnitt, der die Ursache und die schnelle Lösung erklärt.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {symptoms.map((s) => (
          <Link
            key={s.id}
            to={`/blog/${s.slug}#${headingId(s.heading)}`}
            className="group flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
          >
            <span className="font-mono text-small uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--txf)' }}>
              {s.where}
            </span>
            <h3 className="font-display text-[17px] font-semibold text-wx-tx1 leading-snug mb-2 transition-colors group-hover:text-[color:var(--accent)]">
              {s.label}
            </h3>
            <p className="text-[13.5px] leading-[1.6] text-wx-txm mb-4">{s.causeAt}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
              Ursache & Lösung
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
