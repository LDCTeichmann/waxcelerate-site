import { useRef, useState } from 'react';
import { BookOpen, Droplets, RotateCcw, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { use3DReveal } from '@/hooks/useAnimation';

export function Guides() {
  const { t } = useLanguage();
  const [openGuide, setOpenGuide] = useState<string | null>('neu');
  const listRef = useRef<HTMLDivElement>(null);
  use3DReveal(listRef, { stagger: 0.06, start: 'top 88%' });

  const guides = [
    { id: 'neu',      icon: BookOpen,    data: t.guides.newChain },
    { id: 'rewax',    icon: Droplets,    data: t.guides.rewax },
    { id: 'rotation', icon: RotateCcw,   data: t.guides.rotation },
  ];

  return (
    <section id="anleitungen" className="relative py-16 bg-wx-sf">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-12">
            <span className="section-eyebrow mb-4 block">
              {t.guides.eyebrow}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.guides.title} />
            </h2>
            <p className="text-wx-tx2">{t.guides.subtitle}</p>
          </div>

          <div ref={listRef} className="space-y-2">
            {guides.map((guide) => {
              const isOpen = openGuide === guide.id;
              return (
                <div
                  key={guide.id}
                  data-card
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--sf3)',
                    border: `1px solid ${isOpen ? 'rgba(74,106,238,0.25)' : 'var(--bd2)'}`,
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Header */}
                  <button
                    onClick={() => setOpenGuide(isOpen ? null : guide.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <guide.icon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: isOpen ? '#4A6AEE' : 'var(--txf)' }}
                      />
                      <span className="text-sm font-medium text-wx-tx1">{guide.data.title}</span>
                    </div>
                    <ChevronDown
                      className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                      style={{
                        color: 'var(--txf)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>

                  {/* Body */}
                  <div
                    className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-1">
                        {/* Note */}
                        <p className="text-xs mb-4" style={{ color: 'var(--txf)' }}>
                          {guide.data.note}
                        </p>
                        {/* Steps */}
                        <ol className="space-y-2.5">
                          {guide.data.steps.map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-3">
                              <span
                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                                style={{
                                  background: 'rgba(74,106,238,0.15)',
                                  color: '#4A6AEE',
                                }}
                              >
                                {i + 1}
                              </span>
                              <span className="text-sm leading-relaxed" style={{ color: 'var(--tx2)' }}>
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
      {/* Bottom gradient — bridges to FAQ below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </section>
  );
}
