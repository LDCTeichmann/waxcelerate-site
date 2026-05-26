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

    gsap.set([photos, text], { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      gsap.to(photos, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: photos, start: 'top 88%', once: true },
      });
      gsap.to(text, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.08,
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
          <div ref={headerRef} className="text-center mb-12">
            <p
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-3"
              style={{ color: 'rgba(255,255,255,0.40)' }}
            >
              {de ? 'Über den Gründer' : 'Founder'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1">
              <ScrollWordReveal text={t.about.title} />
            </h2>
          </div>

          {/* Body: photos left · bio right */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">

            {/* ── Left: photo column ─────────────────────────────────── */}
            <div ref={photosRef} className="w-full md:w-[200px] lg:w-[215px] flex-shrink-0">

              {/* Portrait */}
              <div
                className="relative overflow-hidden rounded-2xl w-full"
                style={{
                  aspectRatio: '3 / 4',
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  border: '1px solid var(--bd)',
                  boxShadow: '0 0 0 1px rgba(61,103,202,0.08), 0 8px 32px rgba(0,0,0,0.28)',
                }}
              >
                <img
                  src="/images/luca.jpg"
                  alt="Luca Teichmann"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: '50% 12%' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {/* Bottom name overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-3.5 pb-3 pt-10"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)' }}
                >
                  <p className="font-semibold text-white text-[13px] leading-tight">Luca Teichmann</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.58)' }}>
                    Waxcelerate · Stuttgart
                  </p>
                </div>
              </div>

              {/* eBay credential */}
              <div
                className="relative overflow-hidden rounded-xl mt-2 w-full ebay-credential"
                style={{
                  aspectRatio: '16 / 10',
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  border: '1px solid var(--bd)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
                }}
              >
                <img
                  src="/images/luca-ebay.jpg"
                  alt="eBay Seller Leadership Week 2025 San Jose"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={(e) => {
                    const wrap = e.currentTarget.closest('.ebay-credential') as HTMLElement | null;
                    if (wrap) wrap.style.display = 'none';
                  }}
                />
                {/* Stronger gradient so caption is always readable */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.04) 52%, transparent 100%)' }}
                />
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-6">
                  <p
                    className="text-[8.5px] font-semibold uppercase tracking-[0.18em] leading-none mb-0.5"
                    style={{ color: 'rgba(255,255,255,0.50)' }}
                  >
                    eBay Seller Leadership Week
                  </p>
                  <p className="text-[11.5px] font-semibold text-white leading-tight">
                    2025 · San Jose, CA
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: bio + stats card + link ─────────────────────── */}
            <div ref={textRef} className="flex-1 min-w-0">

              {/* Bio */}
              <div className="space-y-4 mb-8">
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
              </div>

              {/* Stats — single unified card with 2×2 grid */}
              <div
                className="rounded-2xl overflow-hidden mb-7"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  border: '1px solid var(--bd)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                <div className="grid grid-cols-2">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="px-5 py-4"
                      style={{
                        borderTop:  i >= 2 ? '1px solid var(--bd2)' : undefined,
                        borderLeft: i % 2 === 1 ? '1px solid var(--bd2)' : undefined,
                      }}
                    >
                      <p className="text-[1.65rem] font-bold leading-none text-wx-tx1 tabular-nums mb-1">
                        {s.value}
                      </p>
                      <p className="text-[11px] text-wx-txf leading-snug">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Active strip */}
                <div
                  className="px-5 py-2.5 flex items-center gap-2"
                  style={{ borderTop: '1px solid var(--bd2)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3D67CA] animate-pulse flex-shrink-0" />
                  <span className="text-[11px] text-wx-txf">
                    {de
                      ? 'Aktiv auf eBay · Versand aus Deutschland'
                      : 'Active on eBay · Ships from Germany'}
                  </span>
                </div>
              </div>

              {/* eBay link */}
              <a
                href="https://www.ebay.de/usr/waxcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 group"
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-colors"
                  style={{ background: 'rgba(43,82,176,0.12)', border: '1px solid rgba(43,82,176,0.22)' }}
                >
                  <ExternalLink className="h-3 w-3 text-[#2B52B0]" />
                </span>
                <span
                  className="text-[13px] font-medium transition-colors"
                  style={{ color: '#3D67CA' }}
                >
                  {t.about.ebay}
                </span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf))', zIndex: 1 }}
      />
    </section>
  );
}
