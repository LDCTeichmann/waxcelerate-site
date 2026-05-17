import { useEffect, useRef } from 'react';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
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
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const { t, lang } = useLanguage();
  const animatedRef = useRef<boolean>(false);
  const pillRef    = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const trustRef   = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const ebayBtnRef = useRef<HTMLButtonElement>(null);
  const de = lang === 'de';

  useEffect(() => {
    if (animatedRef.current) return;

    const el = {
      pill: pillRef.current,
      head: headRef.current,
      tagline: taglineRef.current,
      cta: ctaRef.current,
      trust: trustRef.current,
      img: imgRef.current,
    };
    if (Object.values(el).some(v => !v)) return;

    animatedRef.current = true;

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

  // ── Magnetic CTA button ───────────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const btn  = ebayBtnRef.current;

    // Magnetic button — drifts toward cursor when nearby, snaps back
    const STRENGTH = 0.38;
    const RADIUS   = 90;

    const onMouseMove = (e: MouseEvent) => {
      if (btn) {
        const r   = btn.getBoundingClientRect();
        const cx  = r.left + r.width / 2;
        const cy  = r.top  + r.height / 2;
        const dx  = e.clientX - cx;
        const dy  = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS) {
          gsap.to(btn, { x: dx * STRENGTH, y: dy * STRENGTH, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        } else {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
        }
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

  const line1 = de ? 'Am Ende der Recherche.' : 'At the end of your research.';

  return (
    <section
      id="home"
      className="grain relative overflow-hidden"
      style={{ minHeight: '100dvh', background: '#06060f' }}
    >
      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-[0.07] pointer-events-none" />

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
              <button
                ref={ebayBtnRef}
                onClick={() => scrollToSection('#produkte')}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#4A6AEE', willChange: 'transform' }}
              >
                {de ? 'Produkte ansehen' : 'View products'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <a
                href="https://www.ebay.de/usr/waxcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLElement).style.color = '#FFFFFF')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)')
                }
              >
                {de ? 'Auch auf eBay' : 'Also on eBay'}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Trust strip */}
            <div ref={trustRef} className="flex flex-wrap items-center gap-y-2">
              {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((item, i) => (
                <span key={i} className="flex items-center">
                  <span
                    className="flex items-center gap-1.5 text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    <Check className="h-3 w-3 flex-shrink-0" style={{ color: '#6A8AFF' }} />
                    {item}
                  </span>
                  {i < 2 && (
                    <span
                      className="mx-4 h-3 w-px flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.15)' }}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — product image */}
          <div
            ref={imgRef}
            className="flex items-center justify-end relative h-64 sm:h-80 lg:min-h-[100dvh]"
          >
            <img
              src="/images/wax-hero-split.png"
              alt="Waxcelerate Kettenwachs"
              className="w-full h-full object-cover object-left"
              style={{ maxHeight: '100dvh' }}
              draggable={false}
              fetchPriority="high"
              width={1200}
              height={900}
            />
            {/* Left-edge fade so image blends into dark bg */}
            <div
              className="absolute inset-y-0 left-0 w-32 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, #06060f 0%, transparent 100%)',
              }}
            />
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--sf3), transparent)' }}
      />
    </section>
  );
}
