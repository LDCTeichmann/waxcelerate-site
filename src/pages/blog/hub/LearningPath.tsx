import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { articles } from '../articles';
import { learningPath } from '../hubContent';
import type { PathStep } from '../hubContent';

const bySlug = new Map(articles.map((a) => [a.slug, a]));

function StepCard({ step, index, read, next }: { step: PathStep; index: number; read: boolean; next: boolean }) {
  const article = bySlug.get(step.slug);
  if (!article) return null;
  return (
    <li className="relative pl-14 lg:pl-0">
      <Link
        to={`/blog/${article.slug}`}
        className="group flex flex-col h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
        style={{
          background: 'var(--sf)',
          border: next ? '1px solid rgba(var(--accent-rgb),0.6)' : '1px solid var(--bd)',
          boxShadow: next ? '0 10px 30px rgba(var(--accent-rgb),0.12)' : undefined,
        }}
      >
        {/* Nummer: auf dem Handy links neben der Karte an der senkrechten
            Linie, ab lg oben auf der waagerechten. */}
        <span
          className="absolute left-0 top-5 lg:static lg:mb-4 h-10 w-10 shrink-0 rounded-full inline-flex items-center justify-center font-mono text-[14px] font-semibold"
          style={
            read
              ? { background: 'var(--accent)', color: 'var(--pg)' }
              : { background: 'var(--pg)', color: next ? 'var(--accent)' : 'var(--txm)', border: `1.5px solid ${next ? 'var(--accent)' : 'var(--bd)'}` }
          }
          aria-hidden
        >
          {read ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
        </span>
        <span className="font-mono text-small uppercase tracking-[0.14em] mb-2" style={{ color: next ? 'var(--accent)' : 'var(--txf)' }}>
          {read ? 'Gelesen' : next ? 'Als Nächstes' : `Schritt ${index + 1}`} · {article.readingTime}
        </span>
        <h3 className="font-display text-[17px] font-semibold text-wx-tx1 leading-snug mb-2 transition-colors group-hover:text-[color:var(--accent)]">
          {article.titleShort}
        </h3>
        <p className="text-[13px] leading-[1.6] text-wx-txm">{step.why}</p>
      </Link>
    </li>
  );
}

/**
 * Lernpfad "Von Öl zu Wachs". Die Uebersicht zeigte bisher 18 gleichrangige
 * Kacheln; wer neu ist, weiss aber nicht, womit anfangen. Hier steht die
 * Reihenfolge, in der ein Umsteiger die Artikel braucht, mit Haken an dem,
 * was er schon gelesen hat (nur in seinem Browser, siehe readState.ts). Das
 * Vorbild sind die Lernpfade in Hilfezentren wie Mailchimp oder Notion.
 */
export function LearningPath({ read }: { read: Set<string> }) {
  const doneCount = learningPath.filter((s) => read.has(s.slug)).length;
  const nextIndex = learningPath.findIndex((s) => !read.has(s.slug));
  const nextStep = nextIndex >= 0 ? learningPath[nextIndex] : null;
  const nextArticle = nextStep ? bySlug.get(nextStep.slug) : null;

  return (
    <section aria-labelledby="lernpfad-titel" className="mb-24">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <p className="font-mono text-small uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)' }}>
            Neu hier?
          </p>
          <h2 id="lernpfad-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1] mb-3">
            Von Öl zu Wachs in fünf Schritten.
          </h2>
          <p className="text-[15px] leading-[1.7] text-wx-txm">
            Die Artikel in der Reihenfolge, in der du sie beim Umstieg brauchst. Rund
            eine halbe Stunde Lesezeit, danach weißt du alles für den ersten Wachsgang.
          </p>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[240px]">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono text-small uppercase tracking-[0.16em] text-wx-txf">Dein Fortschritt</span>
            <span className="font-mono text-[13px] text-wx-tx1">{doneCount} / {learningPath.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--sf2)' }}>
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${(doneCount / learningPath.length) * 100}%`, background: 'var(--accent)' }}
            />
          </div>
          {nextArticle ? (
            <Link
              to={`/blog/${nextArticle.slug}`}
              className="inline-flex items-center gap-2 text-[14px] font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--pg)' }}
            >
              {doneCount === 0 ? 'Mit Schritt 1 starten' : `Weiter mit Schritt ${nextIndex + 1}`}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <p className="text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>
              Alle fünf gelesen. Bereit für den Wachstopf.
            </p>
          )}
        </div>
      </div>

      <ol className="relative grid gap-3 lg:grid-cols-5">
        {/* Verbindungslinie: senkrecht auf dem Handy, waagerecht ab lg. */}
        <span className="absolute left-5 top-6 bottom-6 w-px lg:hidden" style={{ background: 'var(--bd)' }} aria-hidden />
        {learningPath.map((step, i) => (
          <StepCard key={step.slug} step={step} index={i} read={read.has(step.slug)} next={i === nextIndex} />
        ))}
      </ol>
    </section>
  );
}
