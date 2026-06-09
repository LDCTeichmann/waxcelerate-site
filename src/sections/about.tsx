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
  const statsRef  = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const els = [textRef.current, bannerRef.current, statsRef.current].filter(Boolean);
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
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.08,
        scrollTrigger: { trigger: bannerRef.current, start: 'top 88%', once: true },
      });
      gsap.to(statsRef.current, {
        opacity: 1, y: 0, duration: 0.65, ease: 'power3.out',
        scrollTrigger: { trigger: statsRef.current, start: 'top 92%', once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  const de = lang === 'de';

  // De-duplicated: 171/100% live in Reviews + nav badge, 3× lives in the
  // hero ribbon / why-wax. About keeps only its own, unique facts.
  const stats: { value: string; label: string }[] = [
    {
      value: de ? '1 Tag' : '1 day',
      label: de ? 'Versand nach Bestellung' : 'Ships after order',
    },
    {
      value: '2024',
      label: de ? 'In Stuttgart gegründet' : 'Founded in Stuttgart',
    },
  ];

  return (
    <section id="ueber-mich" className="relative py-20 bg-wx-sf chain-texture">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div ref={headerRef} className="text-center mb-10">
            <p
              className="eyebrow mb-3"
              style={{ color: 'var(--txf)' }}
            >
              {de ? 'Die Geschichte' : 'Our Story'}
            </p>
            <h2 className="section-title">
              <ScrollWordReveal text={t.about.title} />
            </h2>
          </div>

          {/* ── Two-column: bio left · image + stats right ──────────────── */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Left: bio paragraphs + links */}
            <div ref={textRef} className="space-y-4">
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
              <blockquote
                className="italic text-[14px] leading-relaxed pl-4 my-1"
                style={{ borderLeft: '2px solid rgba(var(--accent-rgb),0.4)', color: 'var(--txm)' }}
              >
                {de
                  ? 'Nicht jede Charge war sofort richtig. Aber jede war näher dran.'
                  : 'Not every batch was right straight away. But each one was closer.'}
              </blockquote>
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio4}</p>

              <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse flex-shrink-0" />
                  <span className="text-[11px]" style={{ color: 'var(--txm)' }}>
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
                    style={{ background: 'rgba(var(--accent-rgb),0.12)', border: '1px solid rgba(var(--accent-rgb),0.22)' }}
                  >
                    <ExternalLink className="h-3 w-3 text-[var(--accent)]" />
                  </span>
                  <span className="text-[13px] font-medium text-[var(--accent)] group-hover:text-[var(--accent)] transition-colors">
                    {t.about.ebay}
                  </span>
                </a>
              </div>
            </div>

            {/* Right: eBay credential image + stats below */}
            <div ref={bannerRef} className="flex flex-col gap-0">
              {/* Image */}
              <div
                className="relative rounded-t-2xl overflow-hidden"
                style={{
                  height: '300px',
                  border: '1px solid var(--bd)',
                  borderBottom: 'none',
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
                      'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 55%)',
                  }}
                />
                <div className="absolute top-0 left-0 px-6 pt-5">
                  <p
                    className="text-[9px] font-semibold uppercase tracking-[0.22em] mb-1"
                    style={{ color: 'rgba(255,255,255,0.48)' }}
                  >
                    eBay Seller Leadership Week
                  </p>
                  <p className="text-[16px] font-bold text-white leading-tight mb-1">
                    2025 · San Jose, CA
                  </p>
                  <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {de
                      ? 'Von eBay eingeladen — als Seller Persona auf der Hauptbühne präsentiert'
                      : 'Invited by eBay — featured as a seller persona on the main stage'}
                  </p>
                </div>
              </div>

              {/* Stats — compact 2×2 grid below image */}
              <div
                ref={statsRef}
                className="grid grid-cols-2 rounded-b-2xl overflow-hidden"
                style={{ border: '1px solid var(--bd)', borderTop: '1px solid var(--bd2)' }}
              >
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="py-4 px-4 text-center"
                    style={{
                      background: 'var(--sf2)',
                      borderRight: i === 0 ? '1px solid var(--bd2)' : 'none',
                    }}
                  >
                    <p
                      className="font-display font-bold text-wx-tx1 tabular-nums leading-none"
                      style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[11px] leading-snug mt-1.5" style={{ color: 'var(--tx2)' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
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
