import { useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';


const reviews = [
  {
    textDe: 'Schnelle Lieferung, einwandfrei gewachste Kette die sehr gut läuft, gerne wieder',
    textEn: 'Fast delivery, impeccably waxed chain that runs very well — will order again',
    name: 'seyrane',
    reviewerCount: '934',
    dateDe: 'März 2026',
    dateEn: 'March 2026',
  },
  {
    textDe: 'Positiver als positiv kann leider niemand bewerten – Wäre aber hier angebracht 1+ mit ★',
    textEn: "Can't rate higher than positive — but this would deserve a 1+ with ★",
    name: 'volvo210b',
    reviewerCount: '1.019',
    dateDe: 'Jan 2026',
    dateEn: 'Jan 2026',
  },
  {
    textDe: 'Alles bestens, läuft wie gewachst !!',
    textEn: 'All good — runs like a dream !!',
    name: 'maienbuehl',
    reviewerCount: '774',
    dateDe: 'Feb 2026',
    dateEn: 'Feb 2026',
  },
];

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" style={{ fill: 'var(--accent-soft)' }}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function Reviews() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.review-card', {
        onEnter: (els) => {
          gsap.set(els, { transformPerspective: 700, transformOrigin: '50% 0%' });
          gsap.from(els, {
            y: 30, opacity: 0, rotateX: 8, duration: 0.7,
            stagger: 0.09, ease: 'power3.out',
            onComplete: () => els.forEach(el => gsap.set(el, { clearProps: 'transform,willChange' })),
          });
        },
        start: 'top 87%',
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-20 sm:py-28 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header: claim left · aggregate proof panel right ── */}
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 items-end mb-10">
            <div>
              <p className="eyebrow mb-4" style={{ color: 'var(--txf)' }}>
                {de ? 'eBay verifiziert · alle Bewertungen echt' : 'eBay verified · all reviews genuine'}
              </p>
              <h2 className="section-title mb-3">
                {de ? '171 Fahrer. 100 % positiv.' : '171 Riders. 100 % positive.'}
              </h2>
              <p className="text-[15px] text-wx-txm max-w-md">
                {de
                  ? 'Kein einziges negatives Feedback seit 2024 — auf einer Plattform, auf der Käufer anonym bewerten.'
                  : 'Not a single negative review since 2024 — on a platform where buyers rate anonymously.'}
              </p>
            </div>

            {/* Aggregate proof panel */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="font-display font-bold leading-none tabular-nums"
                  style={{ fontSize: 'clamp(2.6rem, 5vw, 3.4rem)', color: 'var(--accent)', letterSpacing: '-0.03em' }}
                >
                  100 %
                </span>
                <div className="flex items-center gap-0.5 pb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" style={{ fill: 'var(--accent-soft)' }}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-[12px] mt-2" style={{ color: 'var(--txm)' }}>
                {de ? 'positive Bewertungen seit 2024' : 'positive reviews since 2024'}
              </p>
              <div className="grid grid-cols-2 gap-px mt-5 rounded-xl overflow-hidden" style={{ background: 'var(--bd2)' }}>
                {[
                  { v: '171', l: de ? 'Bewertungen' : 'reviews' },
                  { v: '326', l: de ? 'verkauft' : 'sold' },
                ].map((s, i) => (
                  <div key={i} className="py-3 px-4 text-center" style={{ background: 'var(--sf3)' }}>
                    <p className="font-display font-bold text-wx-tx1 tabular-nums leading-none" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                      {s.v}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--txf)' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={gridRef} className="grid sm:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="review-card relative rounded-xl p-5 flex flex-col gap-3 transition-colors duration-300"
                style={{
                  background: 'var(--sf3)',
                  border: '1px solid var(--bd2)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bd)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd2)'; }}
              >
                {/* Decorative quote mark */}
                <span
                  className="absolute top-3 right-4 font-display leading-none select-none pointer-events-none"
                  style={{ fontSize: '2.6rem', color: 'rgba(var(--accent-rgb),0.10)' }}
                  aria-hidden="true"
                >
                  &rdquo;
                </span>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-[13px] leading-relaxed flex-1"
                  style={{ color: 'var(--tx2)' }}
                >
                  &ldquo;{de ? r.textDe : r.textEn}&rdquo;
                </p>

                {/* Footer */}
                <div
                  className="flex items-center justify-between text-[11px] pt-2"
                  style={{
                    borderTop: '1px solid var(--bd2)',
                    color: 'var(--txf)',
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium" style={{ color: 'var(--tx2)' }}>{r.name}</span>
                    <span style={{ color: 'var(--txff)' }}>{r.reviewerCount} eBay-Bew.</span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    eBay · {de ? r.dateDe : r.dateEn}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
              style={{
                border: '1px solid var(--bd)',
                background: 'var(--sf2)',
                color: 'var(--tx2)',
              }}
            >
              {de ? 'Alle 171 Bewertungen auf eBay ansehen →' : 'See all 171 reviews on eBay →'}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
