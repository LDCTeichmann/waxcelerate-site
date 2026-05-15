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
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
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
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/wax-hero.jpg')" }}
      />

      {/* Dark overlay — keeps text readable across all themes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)',
        }}
      />

      {/* Subtle blue tint layer — ties into brand colour */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 20% 60%, rgba(74,106,238,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-20 pt-28 pb-16"
      >
        <div className="max-w-3xl">

          {/* Label */}
          <span
            className="inline-block text-[10px] tracking-[0.3em] uppercase font-semibold mb-5"
            style={{ color: '#6A8AFF' }}
          >
            {de ? 'Kettenwachs · Stuttgart' : 'Chain wax · Stuttgart'}
          </span>

          {/* Editorial headline */}
          <h1
            className="font-display font-bold leading-[0.9] tracking-[-0.02em] mb-7"
            style={{ fontSize: 'clamp(2.8rem, 8.5vw, 6.8rem)', color: '#FFFFFF' }}
          >
            <span className="block">
              {de ? 'KEIN ÖL.' : 'NO OIL.'}
            </span>
            <span className="block">
              {de ? 'KEIN DRECK.' : 'NO GRIME.'}
            </span>
            <span className="block" style={{ color: '#6A8AFF' }}>
              {de ? 'KEIN LIMIT.' : 'NO LIMITS.'}
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="text-[15px] leading-relaxed mb-9 max-w-sm"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            {de
              ? 'Stuttgarter Heißwachs. Entwickelt auf der Straße. Sauber, leise, schneller als Öl.'
              : 'Hot wax from Stuttgart. Developed on the road. Clean, quiet, faster than oil.'}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-5 mb-8 flex-wrap">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all"
              style={{
                background: '#4A6AEE',
                boxShadow: '0 0 0 1px rgba(74,106,238,0.5)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#5B7AEE';
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 0 28px rgba(74,106,238,0.5), 0 0 0 1px rgba(74,106,238,0.6)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#4A6AEE';
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 0 0 1px rgba(74,106,238,0.5)';
              }}
            >
              {t.hero.ctaBuy}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              onClick={() => scrollToSection('#anleitungen')}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.color = '#FFFFFF')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.color =
                  'rgba(255,255,255,0.65)')
              }
            >
              {t.hero.ctaGuide}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-[12px]"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <Check className="h-3 w-3 flex-shrink-0" style={{ color: '#6A8AFF' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--pg), transparent)' }}
      />
    </section>
  );
}
