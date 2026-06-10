import { useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { AnimatedNumber } from '@/components/AnimatedNumber';


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
    textDe: 'Kette läuft seit 500 km noch immer komplett sauber, kein Dreck, kein Lärm. Hätte nicht gedacht dass der Unterschied so krass ist.',
    textEn: "Chain still completely clean after 500 km — no dirt, no noise. Didn't expect such a big difference.",
    name: 'volvo210b',
    reviewerCount: '1.019',
    dateDe: 'Jan 2026',
    dateEn: 'Jan 2026',
  },
  {
    textDe: 'Zweite Kette läuft jetzt schon deutlich länger als meine alten mit Öl. Antrieb bleibt sauber, Kettenblätter auch.',
    textEn: 'Second chain already lasting much longer than my old ones with oil. Drivetrain stays clean, chainrings too.',
    name: 'maienbuehl',
    reviewerCount: '774',
    dateDe: 'Feb 2026',
    dateEn: 'Feb 2026',
  },
];

const AVATAR_COLORS = ['#2B52B0', '#1A6E4A', '#7C3AED', '#B45309', '#0E6DA8'];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" style={{ fill: '#D4AA30' }}>
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

          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'var(--txf)' }}>
            {de ? 'eBay verifiziert · alle Bewertungen echt' : 'eBay verified · all reviews genuine'}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-3">
            {de ? (<><AnimatedNumber value={171} /> Fahrer. 100 % positiv.</>) : (<><AnimatedNumber value={171} /> Riders. 100 % positive.</>)}
          </h2>
          <p className="text-[15px] text-wx-txm mb-6 max-w-md">
            {de
              ? 'Kein einziges negatives Feedback seit Gründung 2024 — auf einer Plattform, auf der Käufer anonym bewerten.'
              : 'Not a single negative review since founding in 2024 — on a platform where buyers rate anonymously.'}
          </p>

          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" style={{ fill: '#D4AA30' }}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-wx-tx1"><AnimatedNumber value={171} /></span>
            <span style={{ color: 'var(--bd)' }}>·</span>
            <span className="text-[13px]" style={{ color: 'var(--txm)' }}>
              {de ? '326 Bestellungen' : '326 orders'}
            </span>
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
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: avatarColor(r.name) }}
                      aria-hidden="true"
                    >
                      {r.name[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium" style={{ color: 'var(--tx2)' }}>{r.name}</span>
                      <span style={{ color: 'var(--txff)' }}>{r.reviewerCount} eBay-Bew.</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: '#2B52B0' }}
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
