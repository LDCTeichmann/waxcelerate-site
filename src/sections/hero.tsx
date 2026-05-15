import { useEffect, useRef } from 'react';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

// Module-level flag: survives StrictMode unmount/remount cycles
let heroAnimated = false;

// Split text into word spans for clip-mask reveal
function WordReveal({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(' ');
  return (
    <span className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden leading-[1.15]"
          style={{ verticalAlign: 'bottom' }}
        >
          <span className="word-inner inline-block" style={{ willChange: 'transform' }}>
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const { t, lang } = useLanguage();
  const pillRef    = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const trustRef   = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

  useEffect(() => {
    if (heroAnimated) return;
    heroAnimated = true;

    const el = {
      pill: pillRef.current,
      head: headRef.current,
      tagline: taglineRef.current,
      cta: ctaRef.current,
      trust: trustRef.current,
      img: imgRef.current,
    };
    if (Object.values(el).some(v => !v)) return;

    // Reduced motion — instant reveal
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(Object.values(el), { opacity: 1, y: 0, x: 0, scale: 1 });
      if (el.head) {
        el.head.querySelectorAll<HTMLElement>('.word-inner').forEach(w => {
          w.style.transform = 'translateY(0)';
        });
      }
      return;
    }

    // Set initial states
    gsap.set([el.pill, el.tagline, el.cta, el.trust], { opacity: 0, y: 18 });
    gsap.set(el.img, { opacity: 0, x: 40, scale: 1.03 });
    if (el.head) {
      el.head.querySelectorAll<HTMLElement>('.word-inner').forEach(w => {
        w.style.transform = 'translateY(110%)';
      });
    }

    const tl = gsap.timeline({ delay: 0.08 });

    // 1. Pill
    tl.to(el.pill, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0);

    // 2. Word-by-word headline reveal
    if (el.head) {
      const words = el.head.querySelectorAll<HTMLElement>('.word-inner');
      tl.to(words, {
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.055,
      }, 0.18);
    }

    // 3. Tagline
    tl.to(el.tagline, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.52);

    // 4. CTAs
    tl.to(el.cta, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.64);

    // 5. Trust strip
    tl.to(el.trust, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.76);

    // 6. Product image — slides in from right
    tl.to(el.img, { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.22);
  }, []);

  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const line1 = de ? 'Am Ende der Recherche.' : 'At the end of your research.';

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ minHeight: '100dvh', background: '#090909' }}
    >
      {/* Subtle blue radial glow — left side where text lives */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 20% 55%, rgba(74,106,238,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-[0.12] pointer-events-none" />

      {/* ── 2-column layout ── */}
      <div className="relative z-10 flex items-center min-h-[100dvh]">
        <div className="w-full grid lg:grid-cols-2 gap-0">

          {/* LEFT — text content */}
          <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 pt-28 pb-16 lg:pt-0 lg:pb-0">

            {/* Pill */}
            <div ref={pillRef} className="mb-8">
              <button
                onClick={() => scrollToSection('#produkte')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:border-[#6A8AFF]/50 cursor-pointer"
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
            </div>

            {/* Headline — word-by-word reveal */}
            <div ref={headRef} className="mb-7">
              <h1
                className="font-display font-bold leading-[1.05] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2.4rem, 5.5vw, 5rem)', color: '#FFFFFF' }}
              >
                <WordReveal text={line1} className="block" />
                <span
                  className="block font-serif-display italic overflow-hidden"
                  style={{ color: '#6A8AFF', verticalAlign: 'bottom' }}
                >
                  <span className="word-inner inline-block" style={{ willChange: 'transform' }}>
                    Waxcelerate.
                  </span>
                </span>
              </h1>
            </div>

            {/* Tagline */}
            <p
              ref={taglineRef}
              className="text-[15px] leading-relaxed mb-9 max-w-sm"
              style={{ color: 'rgba(255,255,255,0.60)' }}
            >
              {de
                ? 'Heißwachs aus Stuttgart. Entwickelt auf der Straße.'
                : 'Hot wax from Stuttgart. Built on the road.'}
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex items-center gap-5 mb-8 flex-wrap">
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
                  ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)')
                }
              >
                {t.hero.ctaGuide}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Trust strip */}
            <div ref={trustRef} className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-[12px]"
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                >
                  <Check className="h-3 w-3 flex-shrink-0" style={{ color: '#6A8AFF' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — product image */}
          <div
            ref={imgRef}
            className="hidden lg:flex items-center justify-end relative"
            style={{ minHeight: '100dvh' }}
          >
            <img
              src="/images/wax-hero-split.png"
              alt="Waxcelerate Kettenwachs"
              className="w-full h-full object-cover object-left"
              style={{ maxHeight: '100dvh' }}
              draggable={false}
            />
            {/* Left-edge fade so image blends into dark bg */}
            <div
              className="absolute inset-y-0 left-0 w-32 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, #090909 0%, transparent 100%)',
              }}
            />
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
