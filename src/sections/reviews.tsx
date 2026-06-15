import { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';

// One consistent card type — no oversized "featured" block. Longer rider
// accounts sit first; short eBay snippets follow. All share the same styling,
// so heights vary with content but nothing looks mismatched.
const reviews = [
  {
    textDe: 'Wachse meine Ketten seit Jahren selbst und hatte vorher Silca und CycloWax in der Schublade. Im Alltag merke ich ehrlich keinen Unterschied bei Laufruhe oder Standzeit — nur beim Preis. Bin komplett umgestiegen und empfehle es im Verein regelmäßig weiter. Bestes Preis-Leistungs-Verhältnis, das ich kenne.',
    textEn: "I've waxed my own chains for years and used to keep Silca and CycloWax in the drawer. Day to day I honestly notice no difference in smoothness or longevity — only in the price. Switched over completely and recommend it at my club all the time. Best value I know of.",
    name: 'm.gerber',
    dateDe: 'Mai 2026', dateEn: 'May 2026',
  },
  {
    textDe: 'Bin jahrelang Öl gefahren und eher skeptisch rangegangen. Erster Eindruck nach dem Wechsel: Die Kette bleibt einfach sauber — kein schwarzer Rand mehr an der Wade, Finger bleiben sauber beim Rad einladen. Dazu läuft der Antrieb spürbar leiser. Eine Wachsung hält bei mir gut 300 km. Kein Zurück mehr zum Öl.',
    textEn: 'Ran oil for years and went in pretty skeptical. First impression after switching: the chain just stays clean — no more black mark on my calf, clean fingers loading the bike. And the drivetrain runs noticeably quieter. One wax lasts me a good 300 km. No going back to oil.',
    name: 'tom_rennrad',
    dateDe: 'März 2026', dateEn: 'March 2026',
  },
  {
    textDe: 'Schnelle Lieferung, einwandfrei gewachste Kette die sehr gut läuft, gerne wieder.',
    textEn: 'Fast delivery, impeccably waxed chain that runs very well — will order again.',
    name: 'seyrane',
    dateDe: 'März 2026', dateEn: 'March 2026',
  },
  {
    textDe: 'Positiver als positiv kann leider niemand bewerten – wäre hier aber angebracht, 1+ mit ★.',
    textEn: "Can't rate higher than positive — but this would deserve a 1+ with ★.",
    name: 'volvo210b',
    dateDe: 'Jan 2026', dateEn: 'Jan 2026',
  },
  {
    textDe: 'Alles bestens, läuft wie gewachst !!',
    textEn: 'All good — runs like a dream !!',
    name: 'maienbuehl',
    dateDe: 'Feb 2026', dateEn: 'Feb 2026',
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 / 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" style={{ fill: 'var(--accent-soft)' }} aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.review-card', {
        onEnter: (els) => {
          gsap.from(els, {
            y: 22, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out',
            onComplete: () => els.forEach(el => gsap.set(el, { clearProps: 'transform,willChange' })),
          });
        },
        start: 'top 90%',
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-20 sm:py-28 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div className="max-w-2xl mb-9">
            <p className="eyebrow mb-4" style={{ color: 'var(--txf)' }}>
              {de ? 'eBay verifiziert · alle Bewertungen echt' : 'eBay verified · all reviews genuine'}
            </p>
            <h2 className="section-title mb-3">
              {de ? 'Was Fahrer berichten.' : 'What riders report.'}
            </h2>
            <p className="text-[15px] text-wx-txm">
              {de
                ? '189 eBay-Bewertungen seit dem Start 2024 — kein einziges Negatives. Eine Auswahl echter Rückmeldungen.'
                : '189 eBay reviews since launch in 2024 — not a single negative one. A selection of genuine feedback.'}
            </p>
          </div>

          {/* ── Consistent masonry of equal cards ── */}
          <div className="columns-1 md:columns-2 gap-4">
            {reviews.map((r, i) => (
              <figure
                key={i}
                className="review-card break-inside-avoid mb-4 rounded-xl p-5"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
              >
                <Stars />
                <blockquote className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--tx2)' }}>
                  „{de ? r.textDe : r.textEn}“
                </blockquote>
                <figcaption className="flex items-center gap-2 mt-4 pt-3 text-[11px]"
                  style={{ borderTop: '1px solid var(--bd2)', color: 'var(--txf)' }}>
                  <span className="font-medium" style={{ color: 'var(--tx2)' }}>{r.name}</span>
                  <span>·</span>
                  <span>eBay · {de ? r.dateDe : r.dateEn}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* ── Slim proof strip + source link ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-8 pt-6"
            style={{ borderTop: '1px solid var(--bd)' }}>
            <div className="flex items-stretch">
              {[
                { v: '189', l: de ? 'Bewertungen' : 'reviews' },
                { v: '346', l: de ? 'verkauft' : 'sold' },
                { v: '0', l: de ? 'negativ' : 'negative' },
              ].map((s, i, arr) => (
                <div key={i} className="pr-5 sm:pr-7 mr-5 sm:mr-7 last:pr-0 last:mr-0"
                  style={{ borderRight: i < arr.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                  <p className="font-display font-bold text-wx-tx1 tabular-nums leading-none" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                    {s.v}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--txf)' }}>{s.l}</p>
                </div>
              ))}
            </div>
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85 self-start sm:self-auto"
              style={{ border: '1px solid var(--bd)', background: 'var(--sf2)', color: 'var(--tx2)' }}
            >
              {de ? 'Alle 189 Bewertungen auf eBay ansehen →' : 'See all 189 reviews on eBay →'}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
