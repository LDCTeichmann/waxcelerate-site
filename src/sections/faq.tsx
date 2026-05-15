import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function FAQ() {
  const { t } = useLanguage();
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section id="faq" className="py-24 bg-wx-sf">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] text-[#4A6AEE] uppercase mb-3 block font-medium">
              Häufige Fragen
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.faq.title}
            </h2>
            <p className="text-wx-tx2">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {t.faq.items.map((item: {q: string; a: string}, index: number) => (
              <div
                key={index}
                className="bg-wx-sf border border-wx-bd/30 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenItem(openItem === index.toString() ? null : index.toString())}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-wx-sf2/30 transition-colors"
                >
                  <h3 className="text-white font-medium pr-4 text-left text-sm sm:text-base">
                    {item.q}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-wx-tx2 flex-shrink-0 transition-transform ${
                      openItem === index.toString() ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openItem === index.toString() && (
                  <div className="px-6 pb-6">
                    <p className="text-wx-tx2 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-10 text-center">
            <p className="text-wx-tx2 mb-3">
              {t.faq.contactCta}
            </p>
            <a
              href="#kontakt"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#kontakt')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#4A6AEE] hover:text-[#6478F5] font-medium text-sm"
            >
              {t.faq.contactLink}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
