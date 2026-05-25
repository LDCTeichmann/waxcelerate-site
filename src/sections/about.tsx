import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

export function About() {
  const { t, lang } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const text = textRef.current;
    const card = cardRef.current;
    if (!text || !card) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([text, card], { opacity: 1, y: 0 });
      return;
    }

    gsap.set([text, card], { opacity: 0, y: 28 });

    const ctx = gsap.context(() => {
      gsap.to(text, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: text, start: 'top 88%', once: true },
      });
      gsap.to(card, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.12,
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      });
    });

    return () => ctx.revert();
  }, []);

  const de = lang === 'de';

  const stats = [
    { value: 100, prefix: '', suffix: '%',  label: t.about.stats.rating },
    { value: 500, prefix: '', suffix: '+',  label: t.about.stats.sold },
    { value: 168, prefix: '', suffix: '',   label: de ? 'eBay-Bewertungen' : 'eBay Reviews' },
    { value: 24,  prefix: '<', suffix: 'h', label: t.about.stats.response },
  ];

  return (
    <section id="ueber-mich" className="relative py-20 bg-wx-sf chain-texture">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.about.title} />
            </h2>
          </div>

          {/* Two-column: bio left, stats card right */}
          <div className="grid md:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">

            {/* Left: Story + Contact */}
            <div ref={textRef}>
              <div className="space-y-5 mb-10">
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
              </div>

              <a
                href="https://www.ebay.de/usr/waxcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group w-fit"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2B52B0]/10 border border-[#2B52B0]/20 transition-colors group-hover:bg-[#2B52B0]/20">
                  <ExternalLink className="h-3.5 w-3.5 text-[#2B52B0]" />
                </span>
                <span className="text-sm text-[#2B52B0] group-hover:text-[#3D67CA] transition-colors">{t.about.ebay}</span>
              </a>
            </div>

            {/* Right: Stats card */}
            <div ref={cardRef}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  border: '1px solid var(--bd)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                {/* Founder header — place your photo at /images/luca.jpg (square crop recommended) */}
                <div
                  className="flex items-center gap-3 px-6 py-4"
                  style={{ borderBottom: '1px solid var(--bd2)' }}
                >
                  <img
                    src="/images/luca.jpg"
                    alt="Luca Teichmann"
                    className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.src = '/images/logo.jpg';
                      el.className = 'h-9 w-9 rounded-lg object-cover flex-shrink-0';
                    }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-wx-tx1 tracking-wide text-[14px] leading-tight">
                      Luca Teichmann
                    </span>
                    <span className="text-[10px] tracking-[0.14em] mt-0.5" style={{ color: 'var(--txf)' }}>
                      Waxcelerate · Stuttgart
                    </span>
                  </div>
                </div>

                {/* Stats 2×2 grid */}
                <div className="grid grid-cols-2">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="px-6 py-5"
                      style={{
                        borderTop: i >= 2 ? '1px solid var(--bd2)' : undefined,
                        borderLeft: i % 2 === 1 ? '1px solid var(--bd2)' : undefined,
                      }}
                    >
                      <div
                        className="text-[1.9rem] font-bold leading-none mb-1.5 tabular-nums text-wx-tx1"
                      >
                        {s.prefix}{s.value}{s.suffix}
                      </div>
                      <div className="text-xs text-wx-txf leading-snug">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Footer strip */}
                <div
                  className="px-6 py-3.5 flex items-center gap-2"
                  style={{ borderTop: '1px solid var(--bd2)' }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3D67CA] animate-pulse flex-shrink-0" />
                  <span className="text-[11px] text-wx-txf">
                    {de
                      ? 'Aktiv auf eBay · Versand aus Deutschland'
                      : 'Active on eBay · Ships from Germany'}
                  </span>
                </div>
              </div>
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
