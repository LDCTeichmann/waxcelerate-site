import { useState } from 'react';
import { BookOpen, Droplets, RotateCcw, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function Guides() {
  const { t } = useLanguage();
  const [openGuide, setOpenGuide] = useState<string | null>('neu');

  const guides = [
    {
      id: 'neu',
      icon: BookOpen,
      title: t.guides.newChain.title,
      steps: t.guides.newChain.steps,
    },
    {
      id: 'rewax',
      icon: Droplets,
      title: t.guides.rewax.title,
      steps: t.guides.rewax.steps,
    },
    {
      id: 'rotation',
      icon: RotateCcw,
      title: t.guides.rotation.title,
      steps: t.guides.rotation.steps,
    },
  ];

  return (
    <section id="anleitungen" className="py-24 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] text-[#4A6AEE] uppercase mb-3 block font-medium">
              Schritt für Schritt
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.guides.title}
            </h2>
            <p className="text-wx-tx2">
              {t.guides.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="bg-wx-sf border border-wx-bd/30 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-wx-sf2/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#4A6AEE]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <guide.icon className="h-5 w-5 text-[#4A6AEE]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      {guide.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-wx-tx2 transition-transform ${
                      openGuide === guide.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openGuide === guide.id && (
                  <div className="px-6 pb-6">
                    <div className="relative ml-5 pl-9 border-l border-wx-bd/30">
                      {guide.steps.map((step: string, index: number) => (
                        <div key={index} className="relative pb-6 last:pb-0">
                          <span className="absolute -left-[41px] w-8 h-8 bg-[#4A6AEE]/20 border border-[#4A6AEE]/30 rounded-full flex items-center justify-center text-sm text-[#4A6AEE] font-medium">
                            {index + 1}
                          </span>
                          <p className="text-wx-tx2 text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PDF Download hint */}
          <div className="mt-8 text-center">
            <p className="text-wx-txf text-sm">
              {t.guides.pdfHint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
