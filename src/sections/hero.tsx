import { useEffect, useRef } from 'react';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

// Module-level flag: survives StrictMode unmount/remount cycles
let heroAnimated = false;

export function Hero() {
  const { t, lang } = useLanguage();
  const sectionRef  = useRef<HTMLElement>(null);
  const pillRef     = useRef<HTMLButtonElement>(null);
  const h1Line1Ref  = useRef<HTMLSpanElement>(null);
  const h1Line2Ref  = useRef<HTMLSpanElement>(null);
  const taglineRef  = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const trustRef    = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

  useEffect(() => {
    // Run only once — module-level flag survives StrictMode double-invoke
    if (heroAnimated) return;
    heroAnimated = true;

    const refs = [pillRef, h1Line1Ref, h1Line2Ref, taglineRef, ctaRef, trustRef];
    if (refs.some(r => !r.current)) return;

    // Reduced motion: instant reveal
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      refs.forEach(r => { if (r.current) gsap.set(r.current, { opacity: 1, y: 0, filter: 'none' }); });
      return;
    }

    const tl = gsap.timeline({ delay: 0.1 });

    // Pill
    tl.fromTo(pillRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      0.0
    );

    // Headline line 1 — blur to sharp
    tl.fromTo(h1Line1Ref.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out',
        onStart() {
          gsap.fromTo(h1Line1Ref.current,
            { filter: 'blur(8px)' },
            { filter: 'blur(0.5px)', duration: 0.8, ease: 'power4.out',
              onComplete() { if (h1Line1Ref.current) h1Line1Ref.current.style.filter = ''; } }
          );
        } },
      0.14
    );

    // Headline line 2 — "Waxcelerate." italic, arrives like punctuation
    tl.fromTo(h1Line2Ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out',
        onStart() {
          gsap.fromTo(h1Line2Ref.current,
            { filter: 'blur(6px)' },
            { filter: 'blur(0.5px)', duration: 0.8, ease: 'power4.out',
              onComplete() { if (h1Line2Ref.current) h1Line2Ref.current.style.filter = ''; } }
          );
        } },
      0.30
    );

    // Tagline
    tl.fromTo(taglineRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      0.50
    );

    // CTA group
    tl.fromTo(ctaRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      0.62
    );

    // Trust strip
    tl.fromTo(trustRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      0.74
    );

    // No cleanup needed — hero is mounted once for the page lifetime.
    // tl.kill() would prevent re-runs (StrictMode) from completing.
  }, []);

  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex items-end overflow-hidden"
      style={{ minHeight: '100dvh' }}
    >
      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/wax-hero.jpg')" }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.60) 45%, rgba(0,0,0,0.30) 100%)',
        }}
      />

      {/* Subtle blue tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 60%, rgba(74,106,238,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Content — centered */}
      <div
        className="relative z-10 w-full px-4 sm:px-10 lg:px-16 xl:px-20 pt-24 sm:pt-32 pb-16 sm:pb-20"
      >
        <div className="max-w-4xl mx-auto text-center">

          {/* Announcement pill */}
          <button
            ref={pillRef}
            onClick={() => scrollToSection('#produkte')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 transition-all hover:border-[#6A8AFF]/50 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: '#6A8AFF' }}
            />
            <span className="text-[12px] tracking-wide" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {de
                ? 'Neu: Vorgewachste Ketten für alle Antriebe'
                : 'New: Pre-waxed chains for every drivetrain'}
            </span>
            <ArrowRight className="h-3 w-3 flex-shrink-0" style={{ color: '#6A8AFF' }} />
          </button>

          {/* Headline */}
          <h1
            className="font-display font-bold leading-[1.0] tracking-[-0.02em] mb-7"
            style={{ fontSize: 'clamp(2.6rem, 8vw, 6.4rem)', color: '#FFFFFF' }}
          >
            <span ref={h1Line1Ref} className="block">
              {de ? 'Am Ende der Recherche.' : 'At the end of your research.'}
            </span>
            <span
              ref={h1Line2Ref}
              className="block font-serif-display italic"
              style={{ color: '#6A8AFF' }}
            >
              Waxcelerate.
            </span>
          </h1>

          {/* Tagline */}
          <p
            ref={taglineRef}
            className="text-[15px] leading-relaxed mb-9 max-w-md mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {de
              ? 'Heißwachs aus Stuttgart. Entwickelt auf der Straße.'
              : 'Hot wax from Stuttgart. Built on the road.'}
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex items-center justify-center gap-5 mb-8 flex-wrap">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full transition-all"
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
              style={{ color: 'rgba(255,255,255,0.55)' }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.color = '#FFFFFF')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.color =
                  'rgba(255,255,255,0.55)')
              }
            >
              {t.hero.ctaGuide}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Trust strip */}
          <div ref={trustRef} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-[12px]"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                <Check className="h-3 w-3 flex-shrink-0" style={{ color: '#6A8AFF' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--pg), transparent)' }}
      />
    </section>
  );
}
