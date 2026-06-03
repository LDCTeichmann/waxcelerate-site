import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { use3DReveal } from '@/hooks/useAnimation';

const ITEMS_DEFAULT = 5;

export function FAQ() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  use3DReveal(listRef, { stagger: 0.07, start: 'top 85%' });

  useEffect(() => { setOpenItem(null); }, [query]);

  const filteredItems = query.trim()
    ? t.faq.items.filter((item: {q: string; a: string}) =>
        (item.q + ' ' + item.a).toLowerCase().includes(query.trim().toLowerCase())
      )
    : t.faq.items;

  const visibleItems = query.trim() ? filteredItems : (showAll ? filteredItems : filteredItems.slice(0, ITEMS_DEFAULT));

  return (
    <section id="faq" className="relative py-20 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.faq.title} />
            </h2>
            <p className="text-wx-tx2">
              {t.faq.subtitle}
            </p>
          </div>

          {/* Search input */}
          <div className="relative mb-6">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.faq.searchPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl text-[14px] outline-none transition-colors"
              style={{
                background: 'var(--sf)',
                border: '1px solid var(--bd)',
                color: 'var(--tx1)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#1A3C6E'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--bd)'; }}
            />
          </div>

          {visibleItems.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--txm)' }}>
              {t.faq.noResults}
            </p>
          ) : (
          <div ref={listRef}>
            {visibleItems.map((item: {q: string; a: string}, index: number) => (
              <div
                key={item.q.slice(0, 30)}
                data-card
                className="border-b border-wx-bd/25 last:border-0 first:border-t first:border-wx-bd/25"
              >
                <button
                  onClick={(e) => {
                    const next = openItem === index.toString() ? null : index.toString();
                    setOpenItem(next);
                    if (next !== null) {
                      (e.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && openItem === index.toString()) {
                      setOpenItem(null);
                    }
                  }}
                  className="w-full flex items-center justify-between py-5 text-left gap-5 hover:text-wx-tx1 transition-colors group"
                >
                  <h3 className="text-wx-tx1 font-medium text-[15px] leading-snug text-left flex-1 group-hover:text-wx-tx1 transition-colors">
                    {item.q}
                  </h3>
                  <ChevronDown
                    className={`h-4 w-4 text-wx-txf flex-shrink-0 transition-transform duration-300 ${
                      openItem === index.toString() ? 'rotate-180 text-[#1A3C6E]' : ''
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
                    <div className="pb-5 pr-10 border-l-2 pl-4" style={{ borderColor: 'rgba(26,60,110,0.35)' }}>
                      <div className="space-y-1.5">
                        {item.a.split(/\.\s+(?=[A-ZÜÖÄ])/).map((sentence, i, arr) => (
                          <p key={i} className="text-wx-tx2 text-[14px] leading-[1.75]">
                            {sentence}{i < arr.length - 1 ? '.' : ''}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Show all toggle */}
          {!showAll && filteredItems.length > ITEMS_DEFAULT && !query.trim() && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full mt-4 py-3 text-sm font-medium rounded-xl border border-wx-bd/40 transition-colors hover:border-wx-bd"
              style={{ color: 'var(--txm)', background: 'var(--sf3)' }}
            >
              {de
                ? `Alle ${t.faq.items.length} Fragen anzeigen`
                : `Show all ${t.faq.items.length} questions`}
              <ChevronDown className="inline-block h-3.5 w-3.5 ml-1.5 opacity-60" />
            </button>
          )}

          {/* Single CTA — high-intent readers who finished the FAQ */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {de ? 'Meine Kette jetzt wachsen →' : 'Start waxing my chain →'}
            </button>
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
