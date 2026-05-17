import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { use3DReveal } from '@/hooks/useAnimation';

export function FAQ() {
  const { t } = useLanguage();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  use3DReveal(listRef, { stagger: 0.07, start: 'top 85%' });

  return (
    <section id="faq" className="relative py-20 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-eyebrow mb-4 block">
              {t.faq.eyebrow}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.faq.title} />
            </h2>
            <p className="text-wx-tx2">
              {t.faq.subtitle}
            </p>
          </div>

          <div ref={listRef}>
            {t.faq.items.map((item: {q: string; a: string}, index: number) => (
              <div
                key={item.q.slice(0, 30)}
                data-card
                className="border-b border-wx-bd/25 last:border-0 first:border-t first:border-wx-bd/25"
              >
                <button
                  onClick={() => setOpenItem(openItem === index.toString() ? null : index.toString())}
                  className="w-full flex items-center justify-between py-5 text-left gap-5 hover:text-wx-tx1 transition-colors group"
                >
                  <h3 className="text-wx-tx1 font-medium text-[15px] leading-snug text-left flex-1 group-hover:text-wx-tx1 transition-colors">
                    {item.q}
                  </h3>
                  <ChevronDown
                    className={`h-4 w-4 text-wx-txf flex-shrink-0 transition-transform duration-300 ${
                      openItem === index.toString() ? 'rotate-180 text-[#4A6AEE]' : ''
                    }`}
                  />
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-[320ms]"
                  style={{
                    gridTemplateRows: openItem === index.toString() ? '1fr' : '0fr',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-5 pr-10 border-l-2 pl-4" style={{ borderColor: 'rgba(74,106,238,0.35)' }}>
                      <p className="text-wx-tx2 text-[14px] leading-[1.75]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 rounded-xl border border-wx-bd/40 p-6 text-center" style={{ background: 'var(--sf3)' }}>
            <p className="text-wx-tx2 text-sm mb-4">
              {t.faq.contactCta}
            </p>
            <a
              href="#kontakt"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#kontakt')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: '#4A6AEE' }}
            >
              {t.faq.contactLink}
            </a>
          </div>
        </div>
      </div>
      {/* Bottom gradient — bridges to About below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf))', zIndex: 1 }}
      />
    </section>
  );
}
