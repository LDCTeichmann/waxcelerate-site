import { useEffect, useRef } from 'react';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const { t, lang } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(text, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(text, { opacity: 0, y: 28 });

    const ctx = gsap.context(() => {
      gsap.to(text, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: text, start: 'top 88%', once: true },
      });
    });

    return () => ctx.revert();
  }, []);

  const de = lang === 'de';

  const contactItems = [
    { icon: MapPin, label: t.about.location, href: undefined },
    { icon: Mail, label: t.about.email, href: 'mailto:waxcelerate@gmail.com' },
    { icon: Phone, label: t.about.phone, href: 'tel:+4915751957470' },
  ];

  return (
    <section id="ueber-mich" className="relative py-20 bg-wx-sf chain-texture">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-16">
            <span data-reveal="eyebrow" className="section-eyebrow mb-4 block">
              {de ? 'Über Uns' : 'About Us'}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.about.title} />
            </h2>
          </div>

          <div ref={textRef} className="max-w-2xl">
            <div className="space-y-5 mb-10">
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
              <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
            </div>

            {/* Contact */}
            <div className="space-y-2.5">
              {contactItems.map(({ icon: Icon, label, href }) => (
                href ? (
                  <a key={label} href={href} className="flex items-center gap-3 group w-fit">
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

          {/* Conversion CTA */}
          <div className="text-center pt-8 mt-8 border-t border-wx-bd">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-[14px] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#4A6AEE' }}
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
