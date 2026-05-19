import { useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';


const reviews = [
  {
    textDe: 'Kette läuft seit 600 km sauber durch. Schaltwerk makellos. Hätte nicht gedacht, dass der Unterschied so spürbar ist.',
    textEn: 'Chain has been running cleanly for 600 km. Derailleur spotless. Didn\'t expect the difference to be this noticeable.',
    name: 'M. H.',
    date: 'Feb 2026',
  },
  {
    textDe: 'Einfache Anwendung, sehr gutes Ergebnis. Wachs hält deutlich länger als erwartet. Klare Kaufempfehlung.',
    textEn: 'Easy to use, great results. Wax lasts noticeably longer than expected. Clear recommendation.',
    name: 'T. R.',
    date: 'März 2026',
  },
  {
    textDe: 'Schnelle Lieferung, top Qualität. Antrieb ist jetzt leise und sauber. Genau das, was ich gesucht habe.',
    textEn: 'Fast delivery, top quality. Drivetrain is now quiet and clean. Exactly what I was looking for.',
    name: 'S. K.',
    date: 'Apr 2026',
  },
];

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" style={{ fill: 'rgba(255,255,255,0.30)' }}>
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
    <section className="relative py-20 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-3">
            {de ? 'Was Fahrer sagen' : 'What Riders Say'}
          </h2>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" style={{ fill: 'rgba(255,255,255,0.30)' }}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-wx-tx1">164</span>
            <span className="text-sm text-wx-txm">{de ? '· 100% positive Bewertungen · eBay verifiziert' : '· 100% positive · eBay verified'}</span>
          </div>

          <div ref={gridRef} className="grid sm:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="review-card rounded-xl p-5 flex flex-col gap-3"
                style={{
                  background: 'var(--sf3)',
                  border: '1px solid var(--bd2)',
                }}
              >
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
                  <span className="font-medium" style={{ color: 'var(--tx2)' }}>{r.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: '#2B52B0' }}
                    />
                    eBay · {r.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] transition-colors"
              style={{ color: 'var(--txf)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#2B52B0')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--txf)')}
            >
              {de ? 'Alle 164 Bewertungen auf eBay ansehen →' : 'See all 164 reviews on eBay →'}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
