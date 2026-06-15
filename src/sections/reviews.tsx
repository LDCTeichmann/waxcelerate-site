import { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap, ScrollTrigger } from '@/lib/gsap';

// Featured: a rider's full account — specific to the wax, concrete, not hype.
const featured = {
  textDe: 'Bin jahrelang Öl gefahren und eher skeptisch rangegangen. Erster Eindruck nach dem Wechsel: Die Kette bleibt einfach sauber — kein schwarzer Rand mehr an der Wade, Finger bleiben sauber beim Rad einladen. Dazu läuft der Antrieb spürbar leiser und leichtgängiger. Bei mir hält eine Wachsung gut 300 km, dann kurz nachlegen. Für mich gibt es kein Zurück mehr zum Öl.',
  textEn: 'I ran oil for years and went in fairly skeptical. First impression after switching: the chain just stays clean — no more black mark on my calf, clean fingers when loading the bike. On top of that the drivetrain runs noticeably quieter and smoother. A single wax lasts me a good 300 km, then a quick top-up. For me there is no going back to oil.',
  name: 'tom_rennrad',
  dateDe: 'Apr 2026',
  dateEn: 'Apr 2026',
};

// Short eBay snippets (genuine).
const reviews = [
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

function Stars({ size = 'h-3.5 w-3.5' }: { size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 / 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={size} viewBox="0 0 20 20" style={{ fill: 'var(--accent-soft)' }} aria-hidden="true">
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
            y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
            onComplete: () => els.forEach(el => gsap.set(el, { clearProps: 'transform,willChange' })),
          });
        },
        start: 'top 88%',
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  const stats = [
    { v: '189', l: de ? 'Bewertungen' : 'reviews' },
    { v: '346', l: de ? 'verkauft' : 'sold' },
    { v: '0',   l: de ? 'negativ' : 'negative' },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header — one clean claim, no repeated numbers ── */}
          <div className="max-w-2xl mb-10">
            <p className="eyebrow mb-4" style={{ color: 'var(--txf)' }}>
              {de ? 'eBay verifiziert · alle Bewertungen echt' : 'eBay verified · all reviews genuine'}
            </p>
            <h2 className="section-title mb-3">
              {de ? '100 % positiv. Seit 2024.' : '100 % positive. Since 2024.'}
            </h2>
            <p className="text-[15px] text-wx-txm">
              {de
                ? 'Kein einziges negatives Feedback — auf einer Plattform, auf der Käufer anonym bewerten.'
                : 'Not a single negative review — on a platform where buyers rate anonymously.'}
            </p>
          </div>

          {/* ── Featured rider review ── */}
          <figure
            className="review-card relative rounded-2xl p-6 sm:p-8 mb-4 overflow-hidden"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
          >
            <span aria-hidden className="absolute top-0 left-0 h-full w-1" style={{ background: 'var(--accent)' }} />
            <Stars size="h-4 w-4" />
            <blockquote
              className="font-display mt-4"
              style={{ fontSize: 'clamp(1.05rem, 2.1vw, 1.35rem)', lineHeight: 1.5, color: 'var(--tx1)', letterSpacing: '-0.01em' }}
            >
              „{de ? featured.textDe : featured.textEn}“
            </blockquote>
            <figcaption className="flex items-center gap-2 mt-5 text-[12px]" style={{ color: 'var(--txm)' }}>
              <span className="font-medium" style={{ color: 'var(--tx2)' }}>{featured.name}</span>
              <span style={{ color: 'var(--txff)' }}>·</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              eBay · {de ? featured.dateDe : featured.dateEn}
            </figcaption>
          </figure>

          {/* ── Short supporting snippets — simpler cards ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <figure
                key={i}
                className="review-card rounded-xl p-5 flex flex-col gap-3"
                style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}
              >
                <Stars />
                <blockquote className="text-[13px] leading-relaxed flex-1" style={{ color: 'var(--tx2)' }}>
                  „{de ? r.textDe : r.textEn}“
                </blockquote>
                <figcaption className="flex items-center gap-2 text-[11px] pt-2" style={{ borderTop: '1px solid var(--bd2)', color: 'var(--txf)' }}>
                  <span className="font-medium" style={{ color: 'var(--tx2)' }}>{r.name}</span>
                  <span>·</span>
                  <span>eBay · {de ? r.dateDe : r.dateEn}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* ── Footer — slim proof strip + link to source ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-8">
            <div className="flex items-stretch">
              {stats.map((s, i) => (
                <div key={i} className="pr-5 sm:pr-7 mr-5 sm:mr-7 last:pr-0 last:mr-0"
                  style={{ borderRight: i < stats.length - 1 ? '1px solid var(--bd)' : 'none' }}>
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
