import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

export function About() {
  const { t, lang } = useLanguage();
  const headerRef  = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const ebayBannerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const portrait    = portraitRef.current;
    const text        = textRef.current;
    const ebayBanner  = ebayBannerRef.current;
    if (!portrait || !text || !ebayBanner) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([portrait, text, ebayBanner], { opacity: 1, y: 0 });
      return;
    }

    gsap.set([portrait, text, ebayBanner], { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      gsap.to(portrait, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: portrait, start: 'top 88%', once: true },
      });
      gsap.to(text, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: 0.1,
        scrollTrigger: { trigger: text, start: 'top 88%', once: true },
      });
      gsap.to(ebayBanner, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.08,
        scrollTrigger: { trigger: ebayBanner, start: 'top 90%', once: true },
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

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div ref={headerRef} className="text-center mb-10">
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

          {/* ── Top row: floating portrait · bio + stats ─────────────── */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-end">

            {/* Portrait — bg-removed, floats on section background */}
            <div
              ref={portraitRef}
              className="w-full md:w-[200px] lg:w-[218px] flex-shrink-0 relative self-end"
            >
              {/* Subtle radial glow behind the figure */}
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: '80%',
                  background: 'radial-gradient(ellipse 70% 55% at 50% 100%, rgba(43,82,176,0.13) 0%, transparent 70%)',
                }}
              />

              {/* Portrait image — no frame, transparent bg */}
              <div className="relative" style={{ aspectRatio: '4 / 5' }}>
                <img
                  src="/images/luca-nobg.png"
                  alt="Luca Teichmann"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: '50% 8%',
                    filter: 'drop-shadow(0px 12px 28px rgba(0,0,0,0.50))',
                  }}
                  onError={(e) => {
                    // Fallback to photo-with-bg in a card
                    const el = e.currentTarget;
                    el.src = '/images/luca.jpg';
                    el.style.filter = '';
                    el.style.borderRadius = '16px';
                    el.style.border = '1px solid var(--bd)';
                    el.style.objectPosition = '50% 12%';
                  }}
                />
                {/* Bottom fade — blends figure into section background */}
                <div
                  className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{
                    height: '38%',
                    background: 'linear-gradient(to top, var(--sf) 0%, transparent 100%)',
                  }}
                />
              </div>
            </div>

            {/* Bio + stats + link */}
            <div ref={textRef} className="flex-1 min-w-0 pb-1">
              <div className="space-y-4 mb-7">
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
              </div>

              {/* Stats — single unified card */}
              <div
                className="rounded-2xl overflow-hidden mb-6"
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
                      <p className="text-[1.6rem] font-bold leading-none text-wx-tx1 tabular-nums mb-1">
                        {s.value}
                      </p>
                      <p className="text-[11px] text-wx-txf leading-snug">{s.label}</p>
                    </div>
                  ))}
                </div>
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
                  className="text-[13px] font-medium transition-colors text-[#3D67CA] group-hover:text-[#5580E0]"
                >
                  {t.about.ebay}
                </span>
              </a>
            </div>
          </div>

          {/* ── eBay credential banner — full width, cinematic ──────────── */}
          <div
            ref={ebayBannerRef}
            className="relative mt-8 rounded-2xl overflow-hidden"
            style={{
              height: '220px',
              border: '1px solid var(--bd)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.30)',
            }}
          >
            <img
              src="/images/luca-ebay.jpg"
              alt="Luca Teichmann auf der Bühne — eBay Seller Leadership Week 2025, San Jose"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 38%' }}
            />
            {/* Dark vignette — heaviest on left for text */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 45%, transparent 75%), ' +
                  'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
              }}
            />
            {/* Caption — bottom left */}
            <div className="absolute bottom-0 left-0 px-6 pb-5">
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.22em] mb-0.5"
                style={{ color: 'rgba(255,255,255,0.52)' }}
              >
                eBay Seller Leadership Week
              </p>
              <p className="text-[15px] font-semibold text-white leading-tight">
                2025 · San Jose, CA
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.60)' }}>
                {de
                  ? 'Von eBay eingeladen — als Seller Persona auf der Hauptbühne präsentiert'
                  : 'Invited by eBay — featured as a seller persona on the main stage'}
              </p>
            </div>
            {/* eBay logo badge top-right */}
            <div
              className="absolute top-4 right-5 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <span className="text-[11px] font-bold tracking-wide text-white opacity-80">ebay</span>
              <span className="text-[9px] font-medium tracking-[0.12em] text-white opacity-50 ml-1.5">HQ</span>
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
