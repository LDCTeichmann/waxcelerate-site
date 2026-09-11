// ── So laeuft's ab · Drei Wege ──────────────────────────────────────────────
//
// Die groesste ungeloeste Kaufhuerde bei Heisswachs ist nicht "ist das gut",
// sondern "das klingt kompliziert": Kette ausbauen, entfetten, 80-90 °C,
// tauchen, aushaerten, einfahren. Auf der Wachs-Produktseite stand dazu bis
// 09/2026 KEIN EINZIGER SATZ. Die Seite verkaufte die Substanz (Formel, PTFE,
// Inhaltsstoffe) und liess die Frage offen, die den Kauf tatsaechlich
// blockiert.
//
// KEINE NEUE COPY. Die fuenf Schritte kommen wortgleich aus dem bereits
// freigegebenen Artikel `heisswachs-anleitung` (articles.ts, Feld `howTo`),
// inklusive der dort hinterlegten Gesamtzeit von 45 Minuten. Derselbe Text
// speist bereits das HowTo-JSON-LD der Blogseite — eine Quelle, zwei Orte.
//
// Danach die drei Wege. Wer nach dem Ablauf denkt "mach ich nicht selbst",
// soll nicht abspringen, sondern den passenden Weg finden: Starter-Set fuer
// das fehlende Werkzeug, Einschicken fuer gar keinen Aufwand. Beide Seiten
// existieren seit Monaten und wurden von der Produktseite kaum verlinkt.
//
// Gestaltung nach DESIGN.md §3: Haarlinien, keine gefuellten Icon-Kacheln.

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getArticleBySlug } from '@/pages/blog/articles';
import { useLanguage } from '@/hooks/useLanguage';
import { THREE_WAYS } from '@/pages/product/threeWays';

/** Wandelt "PT45M" in "45 Minuten". Faellt still auf null zurueck. */
function minutesFrom(iso: string | undefined, de: boolean): string | null {
  const m = iso?.match(/PT(\d+)M/);
  if (!m) return null;
  return de ? `${m[1]} Minuten` : `${m[1]} minutes`;
}

export function ProcessAndPaths({ accentColor }: { accentColor: string }) {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const guide = getArticleBySlug('heisswachs-anleitung');
  const steps = guide?.howTo?.steps ?? [];
  const total = minutesFrom(guide?.howTo?.totalTime, de);

  return (
    <section style={{ background: 'var(--pg)' }}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 pb-12 lg:pb-16">

        {/* ── So laeuft's ab ──────────────────────────────────────────────── */}
        {steps.length > 0 && (
          <div className="pt-12 lg:pt-16" style={{ borderTop: '1px solid var(--bd)' }}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-8">
              <div>
                <p className="eyebrow mb-2">{de ? 'Der Ablauf' : 'The process'}</p>
                <h2 className="font-display text-[22px] sm:text-[28px] font-bold tracking-[-0.025em]"
                  style={{ color: 'var(--tx1)' }}>
                  {de ? 'So läuft’s ab' : 'How it works'}
                </h2>
              </div>
              {total && (
                <p className="text-small" style={{ color: 'var(--txm)' }}>
                  {de ? `${total} insgesamt, davon das meiste Wartezeit.` : `${total} in total, most of it waiting.`}
                </p>
              )}
            </div>

            {/* Nummerierte Haarlinien-Liste, dasselbe Muster wie
                "Formel & Inhaltsstoffe" weiter unten. */}
            <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, i) => (
                <li key={i} className="pt-4 pb-5 pr-5" style={{ borderTop: '1px solid var(--bd)' }}>
                  <span className="num-data block text-meta mb-2" style={{ color: accentColor }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[14px] font-semibold leading-[1.35] mb-1.5" style={{ color: 'var(--tx1)' }}>
                    {step.name}
                  </p>
                  <p className="text-meta leading-[1.55]" style={{ color: 'var(--txm)' }}>
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>

            <Link to="/blog/heisswachs-anleitung"
              className="inline-flex items-center gap-1.5 mt-5 text-[13px] font-semibold hover:opacity-70 transition-opacity"
              style={{ color: accentColor }}>
              {de ? 'Ausführliche Anleitung mit Fotos' : 'Full guide with photos'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* ── Drei Wege ───────────────────────────────────────────────────── */}
        <div className="pt-12 lg:pt-16 mt-12 lg:mt-16" style={{ borderTop: '1px solid var(--bd)' }}>
          <p className="eyebrow mb-2">{de ? 'Nicht der einzige Weg' : 'Not the only way'}</p>
          <h2 className="font-display text-[22px] sm:text-[28px] font-bold tracking-[-0.025em] mb-2"
            style={{ color: 'var(--tx1)' }}>
            {de ? 'Drei Wege zur gewachsten Kette' : 'Three ways to a waxed chain'}
          </h2>
          <p className="text-small mb-8 max-w-2xl" style={{ color: 'var(--txm)' }}>
            {de
              ? 'Selbst wachsen ist der günstigste Weg, aber nicht der einzige.'
              : 'Waxing it yourself is the cheapest route, but not the only one.'}
          </p>

          <div className="grid gap-0 sm:grid-cols-3">
            {THREE_WAYS.map((path, i) => (
              <div key={i} className="pt-4 pb-5 pr-6" style={{ borderTop: '1px solid var(--bd)' }}>
                <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--tx1)' }}>{de ? path.titleDe : path.titleEn}</h3>
                <p className="text-meta leading-[1.55] mb-3" style={{ color: 'var(--txm)' }}>{de ? path.bodyDe : path.bodyEn}</p>
                <Link to={path.to}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity"
                  style={{ color: accentColor }}>
                  {de ? path.ctaDe : path.ctaEn} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
