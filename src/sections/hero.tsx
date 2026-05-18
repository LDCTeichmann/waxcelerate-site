import { useEffect, useRef } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

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
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const { lang } = useLanguage();
  const animatedRef = useRef<boolean>(false);
  const pillRef     = useRef<HTMLDivElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const taglineRef  = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const ebayBtnRef  = useRef<HTMLButtonElement>(null);
  const de = lang === 'de';

  useEffect(() => {
    if (animatedRef.current) return;

    const el = {
      pill:    pillRef.current,
      head:    headRef.current,
      tagline: taglineRef.current,
      cta:     ctaRef.current,
    };
    if (Object.values(el).some(v => !v)) return;

    animatedRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(Object.values(el), { opacity: 1, y: 0 });
      if (el.head) {
        el.head.querySelectorAll<HTMLElement>('.word-inner').forEach(w => {
          w.style.transform = 'translateY(0)';
        });
      }
      return;
    }

    gsap.set([el.pill, el.tagline, el.cta], { opacity: 0, y: 18 });
    if (el.head) {
      el.head.querySelectorAll<HTMLElement>('.word-inner').forEach(w => {
        w.style.transform = 'translateY(110%)';
      });
    }

    const tl = gsap.timeline({ delay: 0.08 });
    tl.to(el.pill,    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0);
    if (el.head) {
      const words = el.head.querySelectorAll<HTMLElement>('.word-inner');
      tl.to(words, { y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.055 }, 0.18);
    }
    tl.to(el.tagline, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.52);
    tl.to(el.cta,     { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out' }, 0.64);
  }, []);

  // Magnetic CTA button
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const btn = ebayBtnRef.current;
    const STRENGTH = 0.38;
    const RADIUS   = 90;

    const onMouseMove = (e: MouseEvent) => {
      if (!btn) return;
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS) {
        gsap.to(btn, { x: dx * STRENGTH, y: dy * STRENGTH, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      } else {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
      }
    };
    const onMouseLeave = () => {
      if (btn) gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
    };

    window.addEventListener('mousemove', onMouseMove);
    if (btn) btn.addEventListener('mouseleave', onMouseLeave);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (btn) btn.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const scrollToSection = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const line1 = de ? 'Am Ende der Recherche.' : 'End of the search.';

  return (
    <section
      id="home"
      className="grain relative overflow-hidden"
      style={{ minHeight: '100dvh', background: '#06060f' }}
    >
      {/* Subtle radial glow behind text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(74,106,238,0.10) 0%, transparent 70%)',
        }}
      />
      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-[0.07] pointer-events-none" />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 sm:px-10 text-center pt-24 pb-16">
        <div className="max-w-2xl w-full mx-auto flex flex-col items-center">

          {/* Category label — product anchor for cold traffic */}
          <p
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-6"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          >
            {de ? 'Kettenwachs · Heißwachs · Stuttgart' : 'Chain Wax · Hot Wax · Stuttgart'}
          </p>

          {/* Pill */}
          <div ref={pillRef} className="mb-10">
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

          {/* Headline */}
          <div ref={headRef} className="mb-7">
            <h1
              className="font-display font-bold leading-[1.05] tracking-[-0.025em] text-center"
              style={{ fontSize: 'clamp(2.8rem, 7.5vw, 6rem)', color: '#FFFFFF' }}
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
            className="text-[16px] leading-relaxed mb-10 max-w-xs sm:max-w-sm text-center"
            style={{ color: 'rgba(255,255,255,0.52)' }}
          >
            {de
              ? 'Heißwachs aus Stuttgart. Entwickelt auf der Straße.'
              : 'Hot wax from Stuttgart. Built on the road.'}
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex items-center justify-center gap-5 flex-wrap">
            <button
              ref={ebayBtnRef}
              onClick={() => scrollToSection('#produkte')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#4A6AEE', willChange: 'transform' }}
            >
              {de ? 'Classic 500g — 29,95 €' : 'Classic 500g — €29.95'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#FFFFFF')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)')}
            >
              {de ? 'Auf eBay kaufen' : 'Buy on eBay'}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

        </div>
      </div>

      {/* Bottom fade into conviction */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #06060f 0%, transparent 100%)' }}
      />
    </section>
  );
}
