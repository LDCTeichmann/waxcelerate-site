import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

export function About() {
  const { t, lang } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const photos = photosRef.current;
    const text   = textRef.current;
    if (!photos || !text) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([photos, text], { opacity: 1, y: 0 });
      return;
    }

    gsap.set([photos, text], { opacity: 0, y: 28 });

    const ctx = gsap.context(() => {
      gsap.to(photos, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: photos, start: 'top 88%', once: true },
      });
      gsap.to(text, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: 0.1,
        scrollTrigger: { trigger: text, start: 'top 88%', once: true },
      });
    });

    return () => ctx.revert();
  }, []);

  const de = lang === 'de';

  const stats = [
    { value: '100%', label: t.about.stats.rating },
    { value: '500+', label: t.about.stats.sold },
    { value: '168',  label: de ? 'eBay-Bewertungen' : 'eBay reviews' },
    { value: '<24h', label: t.about.stats.response },
  ];

  return (
    <section id="ueber-mich" className="relative py-20 bg-wx-sf chain-texture">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-14">
            <p
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-3"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              {de ? 'Über den Gründer' : 'Founder'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1">
              <ScrollWordReveal text={t.about.title} />
            </h2>
          </div>

          {/* Two-column: photos left, bio right */}
          <div className="flex flex-col md:flex-row gap-10 lg:gap-14 items-start">

            {/* ── Left: photo column ─────────────────────────────────────────── */}
            <div ref={photosRef} className="w-full md:w-[272px] lg:w-[292px] flex-shrink-0">

              {/* Portrait headshot */}
              <div
                className="relative overflow-hidden rounded-2xl w-full"
                style={{
                  aspectRatio: '3 / 4',
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  border: '1px solid var(--bd)',
                }}
              >
                <img
                  src="/images/luca.jpg"
                  alt="Luca Teichmann"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {/* Gradient overlay — name badge at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-14"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%)' }}
                >
                  <p className="font-semibold text-white text-[14px] leading-tight">Luca Teichmann</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.62)' }}>
                    Waxcelerate · Stuttgart
                  </p>
                </div>
              </div>

              {/* eBay credential photo */}
              <div
                className="relative overflow-hidden rounded-xl mt-2.5 w-full ebay-credential"
                style={{
                  aspectRatio: '16 / 10',
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  border: '1px solid var(--bd)',
                }}
              >
                <img
                  src="/images/luca-ebay.jpg"
                  alt="eBay Seller Leadership Week 2025, San Jose"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={(e) => {
                    const wrap = e.currentTarget.closest('.ebay-credential') as HTMLElement | null;
                    if (wrap) wrap.style.display = 'none';
                  }}
                />
                {/* Caption overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-10"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
                >
                  <p
                    className="text-[9px] font-semibold uppercase tracking-[0.2em] leading-none mb-0.5"
                    style={{ color: 'rgba(255,255,255,0.52)' }}
                  >
                    eBay Seller Leadership Week
                  </p>
                  <p className="text-[12px] font-semibold text-white leading-tight">
                    2025 · San Jose, CA
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: bio + stats + link ───────────────────────────────────── */}
            <div ref={textRef} className="flex-1 min-w-0">

              {/* Bio paragraphs */}
              <div className="space-y-4 mb-9">
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
              </div>

              {/* Stats — 4 cards, 2×2 on md, 4-across on lg */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3.5"
                    style={{
                      background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                      border: '1px solid var(--bd)',
                    }}
                  >
                    <p className="text-[1.55rem] font-bold leading-none text-wx-tx1 tabular-nums mb-1">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-wx-txf leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* eBay link */}
              <a
                href="https://www.ebay.de/usr/waxcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group w-fit"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                  style={{ background: 'rgba(43,82,176,0.10)', border: '1px solid rgba(43,82,176,0.20)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(43,82,176,0.20)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(43,82,176,0.10)')}
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#2B52B0]" />
                </span>
                <span
                  className="text-sm transition-colors"
                  style={{ color: '#2B52B0' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3D67CA')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#2B52B0')}
                >
                  {t.about.ebay}
                </span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom gradient — bridges to Guides below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf))', zIndex: 1 }}
      />
    </section>
  );
}
