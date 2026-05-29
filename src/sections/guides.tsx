import { useRef, useState } from 'react';
import { BookOpen, Droplets, RotateCcw, ChevronDown, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { use3DReveal } from '@/hooks/useAnimation';

function StepText({ text }: { text: string }) {
  const unitPattern = /(~?\d+(?:[––]\d+)?\s*(?:°C|min|km))/g;
  const parts = text.split(unitPattern);
  const isHighlight = (s: string) => /^~?\d+(?:[––]\d+)?\s*(?:°C|min|km)$/.test(s);
  return (
    <>
      {parts.map((part, i) =>
        isHighlight(part) ? (
          <span key={i} className="font-semibold" style={{ color: '#264E8C' }}>{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function Guides() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [openGuide, setOpenGuide] = useState<string | null>(null);
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
        <div className="max-w-4xl mx-auto">

          <div className="mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.guides.title} />
            </h2>
            <p className="text-wx-tx2">{t.guides.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-[1fr_260px] gap-8 lg:gap-12 items-start">
            {/* Left: accordion */}
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
                      border: `1px solid ${isOpen ? 'rgba(26,60,110,0.25)' : 'var(--bd2)'}`,
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
                          style={{ color: isOpen ? '#1A3C6E' : 'var(--txf)' }}
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
                          {/* Note callout */}
                          {guide.data.note && (
                            <div
                              className="flex items-start gap-2.5 mb-4 px-3 py-2.5 rounded-lg"
                              style={{
                                background: 'rgba(26,60,110,0.07)',
                                borderLeft: '2px solid rgba(26,60,110,0.4)',
                              }}
                            >
                              <AlertCircle
                                className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                                style={{ color: '#1A3C6E' }}
                              />
                              <p className="text-xs leading-relaxed" style={{ color: 'var(--txf)' }}>
                                {guide.data.note}
                              </p>
                            </div>
                          )}
                          {/* Steps */}
                          <ol className="space-y-0">
                            {guide.data.steps.map((step: string, i: number) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 py-2.5"
                                style={{
                                  borderBottom: i < guide.data.steps.length - 1
                                    ? '1px solid var(--bd2)'
                                    : 'none',
                                }}
                              >
                                <span
                                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                                  style={{
                                    background: 'rgba(26,60,110,0.15)',
                                    color: '#1A3C6E',
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <span className="text-sm leading-relaxed" style={{ color: 'var(--tx2)' }}>
                                  <StepText text={step} />
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

            {/* Right: Quick Reference card — sticky sidebar on desktop */}
            <div className="md:sticky md:top-28">
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'var(--sf)',
                  border: '1px solid var(--bd)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4 block" style={{ color: 'var(--txf)' }}>
                  {de ? 'Kurzreferenz' : 'Quick Reference'}
                </p>
                <div className="space-y-0">
                  {[
                    { label: de ? 'Wachstemperatur' : 'Wax temperature', value: '85–90 °C' },
                    { label: de ? 'Erstmalig wachsen' : 'First wax', value: '10–15 min' },
                    { label: de ? 'Re-Wax' : 'Re-wax', value: '~10 min' },
                    { label: de ? 'Kettenlaufzeit' : 'Chain life', value: de ? '3× vs Öl' : '3× vs oil' },
                    { label: de ? 'Ketten-Rotation' : 'Chain rotation', value: de ? '3 Ketten' : '3 chains' },
                    { label: de ? 'Entfetten nötig?' : 'Degreasing needed?', value: de ? 'Ja, neue Kette' : 'Yes, new chain' },
                  ].map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2.5"
                      style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                    >
                      <span className="text-[11.5px]" style={{ color: 'var(--txm)' }}>{label}</span>
                      <span className="text-[12px] font-semibold tabular-nums" style={{ color: 'var(--tx1)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                {t.guides.pdfHint && (
                  <p className="text-[10.5px] mt-4 leading-snug" style={{ color: 'var(--txf)' }}>
                    {t.guides.pdfHint}
                  </p>
                )}
              </div>
            </div>
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
