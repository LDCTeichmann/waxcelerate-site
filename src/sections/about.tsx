import { useEffect, useRef, useState } from 'react';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function CountUp({ end, duration = 1800 }: { end: number; duration?: number }) {
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
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const card = cardRef.current;
    const text = textRef.current;
    if (!card || !text) return;

    gsap.set([card, text], { opacity: 0, y: 32 });

    const t1 = ScrollTrigger.create({
      trigger: text,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(text, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }),
    });
    const t2 = ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.12 }),
    });

    return () => { t1.kill(); t2.kill(); };
  }, []);

  const de = lang === 'de';

  const stats = [
    { value: 100, prefix: '', suffix: '%', label: t.about.stats.rating },
    { value: 500, prefix: '', suffix: '+', label: t.about.stats.sold },
    { value: 2024, prefix: '', suffix: '', label: de ? 'Waxcelerate seit' : 'Waxcelerate since' },
    { value: 24, prefix: '<', suffix: 'h', label: de ? 'Versand in < 24h' : 'Ships within 24h' },
  ];

  const contactItems = [
    { icon: MapPin, label: t.about.location, href: undefined },
    { icon: Mail, label: t.about.email, href: 'mailto:waxcelerate@gmail.com' },
    { icon: Phone, label: t.about.phone, href: 'tel:+4915751957470' },
  ];

  return (
    <section id="ueber-mich" className="py-24 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-16">
            <span data-reveal="eyebrow" className="text-xs tracking-[0.3em] text-[#4A6AEE] uppercase mb-3 block font-medium">
              {de ? 'Über Uns' : 'About Us'}
            </span>
            <h2 data-reveal="heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.about.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-[1fr_400px] gap-12 items-start">

            {/* Left: Story + Contact */}
            <div ref={textRef}>
              <div className="space-y-5 mb-10">
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
              </div>

              {/* Contact */}
              <div className="space-y-2.5">
                {contactItems.map(({ icon: Icon, label, href }) => (
                  href ? (
                    <a key={label} href={href}
                      className="flex items-center gap-3 group w-fit"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A6AEE]/10 border border-[#4A6AEE]/20 transition-colors group-hover:bg-[#4A6AEE]/20">
                        <Icon className="h-3.5 w-3.5 text-[#4A6AEE]" />
                      </span>
                      <span className="text-sm text-wx-tx2 group-hover:text-wx-tx1 transition-colors">{label}</span>
                    </a>
                  ) : (
                    <div key={label} className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A6AEE]/10 border border-[#4A6AEE]/20">
                        <Icon className="h-3.5 w-3.5 text-[#4A6AEE]" />
                      </span>
                      <span className="text-sm text-wx-tx2">{label}</span>
                    </div>
                  )
                ))}
                <a
                  href="https://www.ebay.de/usr/waxcelerate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group w-fit"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A6AEE]/10 border border-[#4A6AEE]/20 transition-colors group-hover:bg-[#4A6AEE]/20">
                    <ExternalLink className="h-3.5 w-3.5 text-[#4A6AEE]" />
                  </span>
                  <span className="text-sm text-[#4A6AEE] group-hover:text-[#6A8AFF] transition-colors">{t.about.ebay}</span>
                </a>
              </div>
            </div>

            {/* Right: Stats Card */}
            <div ref={cardRef}>
              <div
                className="rounded-2xl overflow-hidden border border-white/[0.07]"
                style={{ background: 'linear-gradient(160deg, #16191f 0%, #0f1115 100%)' }}
              >
                {/* Logo header */}
                <div className="flex items-center gap-3.5 px-7 py-5 border-b border-white/[0.06]">
                  <img
                    src="/images/logo.jpg"
                    alt="Waxcelerate"
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                  <span className="font-roboto font-semibold text-wx-tx1 tracking-wide text-[15px]">
                    waxcelerate
                  </span>
                  <span className="ml-auto text-[10px] tracking-[0.2em] text-wx-txf uppercase">Stuttgart</span>
                </div>

                {/* Stats 2×2 */}
                <div className="grid grid-cols-2">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className={[
                        'px-7 py-6',
                        i >= 2 ? 'border-t border-white/[0.06]' : '',
                        i % 2 === 1 ? 'border-l border-white/[0.06]' : '',
                      ].join(' ')}
                    >
                      <div
                        className="text-[2rem] font-bold leading-none mb-1.5 tabular-nums"
                        style={{ color: '#4A6AEE' }}
                      >
                        {s.prefix}
                        {i === 0 || i === 2
                          ? <>{s.value}</>
                          : <CountUp end={s.value} />
                        }
                        {s.suffix}
                      </div>
                      <div className="text-xs text-wx-txf leading-snug">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Footer strip */}
                <div className="px-7 py-4 border-t border-white/[0.06] flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-wx-txf">
                    {de ? 'Aktiv auf eBay · Versand aus Deutschland' : 'Active on eBay · Ships from Germany'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
