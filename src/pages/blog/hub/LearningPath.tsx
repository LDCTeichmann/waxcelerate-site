import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { articles, getArticleImage } from '../articles';
import { learningPath } from '../hubContent';
import type { PathStep } from '../hubContent';

const bySlug = new Map(articles.map((a) => [a.slug, a]));

/**
 * Eine Etappe der Route. Bis 09/2026 reine Textkarten, die niemand las. Jetzt
 * mit dem Foto des Artikels (getArticleImage, dieselbe Quelle wie das Archiv),
 * grosser Etappenziffer und klarer Markierung, wo es weitergeht.
 */
function StepCard({ step, index, read, next, started }: {
  step: PathStep; index: number; read: boolean; next: boolean; started: boolean;
}) {
  const article = bySlug.get(step.slug);
  if (!article) return null;
  const img = getArticleImage(article.slug);
  return (
    <li className="shrink-0 w-[78%] sm:w-[44%] lg:w-auto snap-start">
      <Link
        to={`/blog/${article.slug}`}
        className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          background: 'var(--sf)',
          border: next ? '1.5px solid var(--accent)' : '1px solid var(--bd)',
          boxShadow: next ? '0 14px 34px rgba(var(--accent-rgb),0.16)' : undefined,
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={img.card}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={read ? { filter: 'grayscale(0.75) brightness(0.92)' } : undefined}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)' }} aria-hidden />
          <span className="absolute left-4 bottom-2 font-display font-bold leading-none" style={{ color: '#FFFFFF', fontSize: 44 }} aria-hidden>
            {index + 1}
          </span>
          {read && (
            <span className="absolute right-3 top-3 h-7 w-7 rounded-full inline-flex items-center justify-center" style={{ background: 'var(--accent)', color: 'var(--pg)' }} aria-hidden>
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
          )}
          {next && (
            <span className="absolute right-3 top-3 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--accent)', color: 'var(--pg)' }}>
              {started ? 'Weiter hier' : 'Hier starten'}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 p-4 sm:p-5">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] mb-2" style={{ color: next ? 'var(--accent)' : 'var(--txf)' }}>
            {read ? 'Gelesen' : `Schritt ${index + 1}`} · {article.readingTime}
          </span>
          <h3 className="font-display text-[17px] font-semibold text-wx-tx1 leading-snug mb-2 transition-colors group-hover:text-[color:var(--accent)]">
            {article.titleShort}
          </h3>
          <p className="text-[13px] leading-[1.6] text-wx-txm">{step.why}</p>
        </div>
      </Link>
    </li>
  );
}

/**
 * Lernpfad "Von Öl zu Wachs" als Route: fuenf Etappen mit Foto, darueber ab lg
 * eine Streckenlinie, die sich mit dem Lesefortschritt fuellt (nur im Browser
 * des Lesers, siehe readState.ts). Auf dem Handy ein wischbares Karussell
 * statt fuenf gestapelter Karten, die den halben Bildschirm fuellten.
 */
export function LearningPath({ read }: { read: Set<string> }) {
  const doneCount = learningPath.filter((s) => read.has(s.slug)).length;
  const nextIndex = learningPath.findIndex((s) => !read.has(s.slug));
  const nextStep = nextIndex >= 0 ? learningPath[nextIndex] : null;
  const nextArticle = nextStep ? bySlug.get(nextStep.slug) : null;
  const last = learningPath.length - 1;
  const progress = nextIndex < 0 ? 1 : nextIndex / last;

  return (
    <section aria-labelledby="lernpfad-titel" className="mb-20">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <p className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>Neu hier?</p>
          <h2 id="lernpfad-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1] mb-3">
            Von Öl zu Wachs in fünf Schritten.
          </h2>
          <p className="text-[15px] leading-[1.7] text-wx-txm">
            Die Artikel in der Reihenfolge, in der du sie beim Umstieg brauchst. Rund
            eine halbe Stunde Lesezeit, danach weißt du das Wichtigste für den ersten Wachsgang.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[13px] text-wx-txm">
            <span className="text-wx-tx1 font-semibold">{doneCount}</span> / {learningPath.length} gelesen
          </span>
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

      {/* Streckenlinie ab lg: je Etappe ein Punkt ueber ihrer Karte, bis zur
          naechsten Etappe durchgezogen, danach gestrichelt. */}
      <div className="relative hidden lg:grid grid-cols-5 mb-4 h-5" aria-hidden>
        <span className="absolute top-1/2 left-[10%] right-[10%] border-t border-dashed" style={{ borderColor: 'var(--bd)' }} />
        <span
          className="absolute top-1/2 left-[10%] h-[2px] -translate-y-[1px] transition-[width] duration-700"
          style={{ width: `${progress * 80}%`, background: 'var(--accent)' }}
        />
        {learningPath.map((s, i) => {
          const isRead = read.has(s.slug);
          const isNext = i === nextIndex;
          return (
            <span key={s.slug} className="relative flex justify-center items-center">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={
                  isRead
                    ? { background: 'var(--accent)' }
                    : isNext
                      ? { background: 'var(--pg)', border: '2px solid var(--accent)', boxShadow: '0 0 0 4px rgba(var(--accent-rgb),0.15)' }
                      : { background: 'var(--pg)', border: '2px solid var(--bd)' }
                }
              />
            </span>
          );
        })}
      </div>

      <ol className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 -mx-4 px-4 sm:-mx-6 sm:px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0">
        {learningPath.map((step, i) => (
          <StepCard key={step.slug} step={step} index={i} read={read.has(step.slug)} next={i === nextIndex} started={doneCount > 0} />
        ))}
      </ol>
    </section>
  );
}
