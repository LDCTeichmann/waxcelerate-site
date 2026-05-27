import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

export function About() {
  const { t, lang } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const els = [textRef.current, bannerRef.current].filter(Boolean);
    if (!els.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(els, { opacity: 0, y: 24 });
    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: textRef.current, start: 'top 88%', once: true },
      });
      gsap.to(bannerRef.current, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: bannerRef.current, start: 'top 92%', once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  const de = lang === 'de';

  const stats = [
    { value: '171',                   label: de ? 'eBay-Bewertungen'   : 'eBay reviews'       },
    { value: '100%',                 label: de ? 'Positiv seit 2023'  : 'Positive since 2023' },
    { value: '2024',                 label: de ? 'Gegründet'          : 'Founded'             },
    { value: de ? '1 Tag' : '1 Day', label: de ? 'Versandzeit'       : 'Shipping time'       },
  ];

  return (
    <section id="ueber-mich" className="relative py-20 bg-wx-sf chain-texture">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div ref={headerRef} className="text-center mb-10">
            <p
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-3"
              style={{ color: 'var(--txf)' }}
            >
              {de ? 'Über den Gründer' : 'Founder'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1">
              <ScrollWordReveal text={t.about.title} />
            </h2>
          </div>

          {/* ── Bio + stats ─────────────────────────────────────────────── */}
          <div ref={textRef}>

            {/* Bio */}
            <div className="max-w-2xl mx-auto mb-10 space-y-4">
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
            </div>

            {/* Stats row — gap-px creates 1px dividers from the container bg */}
            <div
              className="rounded-2xl overflow-hidden mb-7"
              style={{ background: 'var(--bd)', border: '1px solid var(--bd)' }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="py-7 px-5 text-center"
                    style={{ background: 'var(--sf2)' }}
                  >
                    <p
                      className="font-display font-bold text-wx-tx1 tabular-nums leading-none mb-2"
                      style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[11px] leading-snug" style={{ color: 'var(--txf)' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active indicator + eBay link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3D67CA] animate-pulse flex-shrink-0" />
                <span className="text-[11px]" style={{ color: 'var(--txf)' }}>
                  {de ? 'Aktiv auf eBay · Versand aus Stuttgart' : 'Active on eBay · Ships from Stuttgart'}
                </span>
              </div>
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
                <span className="text-[13px] font-medium text-[#3D67CA] group-hover:text-[#5580E0] transition-colors">
                  {t.about.ebay}
                </span>
              </a>
            </div>
          </div>

          {/* ── eBay credential banner ─────────────────────────────────── */}
          <div
            ref={bannerRef}
            className="relative mt-10 rounded-2xl overflow-hidden"
            style={{
              height: '340px',
              border: '1px solid var(--bd)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
            }}
          >
            <img
              src="/images/luca-ebay.jpg"
              alt="eBay Seller Leadership Week 2025, San Jose"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 38%' }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.30) 40%, transparent 65%), ' +
                  'linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 55%)',
              }}
            />
            <div className="absolute bottom-0 left-0 px-6 pb-5">
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.22em] mb-1"
                style={{ color: 'rgba(255,255,255,0.48)' }}
              >
                eBay Seller Leadership Week
              </p>
              <p className="text-[16px] font-bold text-white leading-tight mb-1">
                2025 · San Jose, CA
              </p>
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.58)' }}>
                {de
                  ? 'Von eBay eingeladen — als Seller Persona auf der Hauptbühne präsentiert'
                  : 'Invited by eBay — featured as a seller persona on the main stage'}
              </p>
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
