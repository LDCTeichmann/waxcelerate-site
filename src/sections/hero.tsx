import { useEffect, useRef } from 'react';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

export function Hero() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen bg-[#090909] flex items-center justify-center overflow-hidden"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Radial glow behind wax block */}
      <div className="absolute inset-0 hero-glow" />

      {/* Spinning wax block - centered background element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="wax-spin-container relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-[#4A6AEE]/5 blur-[100px] scale-150" />
          
          {/* The spinning wax block */}
          <div className="wax-spin-image relative">
            <img
              src="/images/wax-block-spin.png"
              alt="Waxcelerate Blue Wax Block"
              className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px] object-contain rounded-2xl"
              style={{
                maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Content overlay */}
      <div ref={contentRef} className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Brand label */}
          <span className="text-xs tracking-[0.35em] text-[#4A6AEE] uppercase mb-6 block font-medium">
            Paraffin + PTFE — Kettenwachs aus Stuttgart
          </span>

          {/* Brand name */}
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4">
            WAXCELERATE
          </h1>

          <p className="text-xl sm:text-2xl text-[#8896B0] font-light mb-4">
            {t.hero.subtitle}
          </p>

          <p className="text-base text-[#8896B0] mb-12 max-w-lg mx-auto leading-relaxed">
            {t.hero.tagline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#4A6AEE] hover:bg-[#6478F5] text-white px-8 py-6 text-sm font-medium rounded-lg transition-all hover:shadow-[0_0_40px_rgba(74,106,238,0.35)]">
                {t.hero.ctaBuy}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={() => scrollToSection('#anleitungen')}
              className="border-[#22222E] text-[#8896B0] hover:bg-[#18181E] hover:text-white px-8 py-6 text-sm rounded-lg transition-all"
            >
              {t.hero.ctaGuide}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-14">
            {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-[#8896B0]">
                <Check className="h-4 w-4 text-[#4A6AEE]" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Spec badges - factual */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-[#111117]/80 backdrop-blur-sm border border-[#22222E]/30 rounded-lg px-5 py-3">
              <p className="text-[10px] text-[#8896B0] uppercase tracking-wider mb-1">Zusammensetzung</p>
              <p className="text-base font-semibold text-white">Paraffin + PTFE</p>
            </div>
            <div className="bg-[#111117]/80 backdrop-blur-sm border border-[#22222E]/30 rounded-lg px-5 py-3">
              <p className="text-[10px] text-[#8896B0] uppercase tracking-wider mb-1">Verkäufer-Bewertung</p>
              <p className="text-base font-semibold text-white">100% (154)</p>
            </div>
            <div className="bg-[#111117]/80 backdrop-blur-sm border border-[#22222E]/30 rounded-lg px-5 py-3">
              <p className="text-[10px] text-[#8896B0] uppercase tracking-wider mb-1">Artikel verkauft</p>
              <p className="text-base font-semibold text-white">294+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#090909] to-transparent" />
    </section>
  );
}
