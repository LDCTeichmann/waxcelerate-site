import { useEffect, useRef } from 'react';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

export function Hero() {
  const { t, lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.25 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen bg-wx-bg flex items-center overflow-hidden"
    >
      {/* Grid + glow */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 hero-glow" />

      {/* Split layout */}
      <div
        ref={contentRef}
        className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-20 pt-24 pb-14"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-6">

          {/* ── LEFT: Text ─────────────────────────────────── */}
          <div className="flex-1 text-center lg:text-left">

            {/* Label */}
            <span
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-semibold mb-5"
              style={{ color: '#4A6AEE' }}
            >
              {de ? 'Kettenwachs · Stuttgart' : 'Chain wax · Stuttgart'}
            </span>

            {/* Editorial headline — fluid type via clamp */}
            <h1
              className="font-display font-bold leading-[0.9] tracking-[-0.02em] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 8.5vw, 6.8rem)' }}
            >
              <span className="block text-wx-tx1">
                {de ? 'NICHTS DEM' : 'NOTHING'}
              </span>
              <span className="block text-wx-tx1">
                {de ? 'ZUFALL' : 'LEFT TO'}
              </span>
              <span className="block" style={{ color: '#4A6AEE' }}>
                {de ? 'ÜBERLASSEN.' : 'CHANCE.'}
              </span>
            </h1>

            {/* Single tagline */}
            <p className="text-wx-tx2 text-[15px] leading-relaxed mb-8 max-w-sm mx-auto lg:mx-0">
              {de
                ? 'Stuttgarter Heißwachs. PTFE-Formula. Sauber, leise, messbar schneller als Öl.'
                : 'Hot wax from Stuttgart. PTFE formula. Cleaner, quieter, measurably faster than oil.'}
            </p>

            {/* CTAs — one solid, one text link */}
            <div className="flex items-center gap-5 justify-center lg:justify-start mb-7 flex-wrap">
              <a
                href="https://www.ebay.de/usr/waxcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all"
                style={{
                  background: '#4A6AEE',
                  boxShadow: '0 0 0 1px rgba(74,106,238,0.4)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#5B7AEE';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(74,106,238,0.45), 0 0 0 1px rgba(74,106,238,0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#4A6AEE';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(74,106,238,0.4)';
                }}
              >
                {t.hero.ctaBuy}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                onClick={() => scrollToSection('#anleitungen')}
                className="inline-flex items-center gap-1.5 text-wx-tx2 hover:text-wx-tx1 text-sm font-medium transition-colors"
              >
                {t.hero.ctaGuide}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Compact trust strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 justify-center lg:justify-start">
              {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 text-wx-txm text-[12px]">
                  <Check className="h-3 w-3 flex-shrink-0" style={{ color: '#4A6AEE' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Spinning wax block ───────────────────── */}
          <div className="lg:flex-shrink-0 flex items-center justify-center">
            <div className="wax-spin-container relative">
              <div
                className="absolute inset-0 rounded-full blur-[90px] scale-150"
                style={{ background: 'rgba(74,106,238,0.07)' }}
              />
              <div className="wax-spin-image relative">
                <img
                  src="/images/wax-block-spin.png"
                  alt="Waxcelerate Blue Wax Block"
                  className="object-contain rounded-2xl"
                  style={{
                    width: 'clamp(220px, 35vw, 420px)',
                    height: 'clamp(220px, 35vw, 420px)',
                    maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 55%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 55%, transparent 100%)',
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28"
        style={{ background: 'linear-gradient(to top, var(--pg), transparent)' }}
      />
    </section>
  );
}
