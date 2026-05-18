import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Animated count-up triggered when card scrolls into view
function CountUp({ end, duration = 1600 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => setStarted(true),
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return <span ref={ref}>{count}</span>;
}

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
    { value: 2024, prefix: '', suffix: '',  label: de ? 'Waxcelerate seit' : 'Waxcelerate since' },
    { value: 24,   prefix: '<', suffix: 'h', label: de ? 'Antwort in < 24h' : 'Reply within 24h' },
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
                {/* Logo header */}
                <div
                  className="flex items-center gap-3 px-6 py-4"
                  style={{ borderBottom: '1px solid var(--bd2)' }}
                >
                  <img
                    src="/images/logo.jpg"
                    alt="Waxcelerate"
                    className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <span className="font-semibold text-wx-tx1 tracking-wide text-[14px]">
                    waxcelerate
                  </span>
                  <span
                    className="ml-auto text-[10px] tracking-[0.2em] uppercase"
                    style={{ color: 'var(--txf)' }}
                  >
                    Stuttgart
                  </span>
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
                        className="text-[1.9rem] font-bold leading-none mb-1.5 tabular-nums"
                        style={{ color: '#2B52B0' }}
                      >
                        {s.prefix}
                        {/* 2024 and 100 are static; 500 and 24 count up */}
                        {i === 0 || i === 2 ? s.value : <CountUp end={s.value} />}
                        {s.suffix}
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
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  <span className="text-[11px] text-wx-txf">
                    {de
                      ? 'Aktiv auf eBay · Versand aus Deutschland'
                      : 'Active on eBay · Ships from Germany'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Conversion CTA */}
          <div className="text-center pt-10 mt-10 border-t border-wx-bd">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-[14px] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#2B52B0' }}
            >
              {de ? 'Jetzt im eBay-Shop kaufen' : 'Shop on eBay'}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

        </div>
      </div>
      {/* Bottom gradient — bridges to Contact below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </section>
  );
}
