import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Droplets, RotateCcw, ChevronDown, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { use3DReveal } from '@/hooks/useAnimation';
import { Section } from '@/components/Section';

function StepText({ text }: { text: string }) {
  const unitPattern = /(~?\d+(?:[––]\d+)?\s*(?:°C|min|km))/g;
  const parts = text.split(unitPattern);
  const isHighlight = (s: string) => /^~?\d+(?:[––]\d+)?\s*(?:°C|min|km)$/.test(s);
  return (
    <>
      {parts.map((part, i) =>
        isHighlight(part) ? (
          <span key={i} className="font-semibold" style={{ color: 'var(--accent)' }}>{part}</span>
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
  // First entry open by default on tablet/desktop — a reader shouldn't have
  // to interact with an accordion just to see that the section has content
  // at all. On mobile this section already stacks a 3-item accordion under a
  // full reference table (single column below `md`, see the grid below), so
  // forcing 5 steps + a warning callout open by default just to reach the
  // rest of the homepage was the single biggest contributor to the page
  // feeling overwhelming on a phone. Closed-by-default there costs one tap.
  const [openGuide, setOpenGuide] = useState<string | null>(
    () => (typeof window !== 'undefined' && window.innerWidth < 768 ? null : 'neu'),
  );
  const listRef = useRef<HTMLDivElement>(null);
  use3DReveal(listRef, { stagger: 0.06, start: 'top 88%' });

  const guides = [
    { id: 'neu',      icon: BookOpen,    data: t.guides.newChain },
    { id: 'rewax',    icon: Droplets,    data: t.guides.rewax },
    { id: 'rotation', icon: RotateCcw,   data: t.guides.rotation },
  ];

  return (
    <Section id="anleitungen" className="bg-wx-sf">
        {/* Full column width, like every other section. The old max-w-4xl
            wrapper left 304px of the 1120px column empty on the right. Prose
            keeps its own reading width instead. */}
        <div>

          <div className="mb-12">
            <h2 className="section-title mb-4">
              <ScrollWordReveal text={t.guides.title} />
            </h2>
            <p className="text-wx-tx2 max-w-xl">{t.guides.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-start">
            {/* Left: accordion. overflow-x-hidden ist eine gezielte Absicherung
                gegen einen GSAP-Artefakt, nicht Geschmackssache: use3DReveal
                setzt jede [data-card] vor dem Scroll-Trigger per gsap.set()
                auf rotateX(9deg) mit perspective(700px) (siehe useAnimation.ts).
                Dieser Zustand liegt schon beim ersten Rendern im DOM, bevor
                irgendwer scrollt, und erzeugt dabei ~2px echten
                Dokument-Overflow (bestaetigt: 2px vor dem Scrollen zu
                #anleitungen, 0px danach, sobald der Trigger feuert und
                transform auf identity zurueckgesetzt wird) — Mobile-Plan B7f,
                das iOS-Rubber-Band-Wippen beim seitlichen Wischen. Die Karte
                selbst hat zwar eigenes overflow-hidden, kann damit aber nicht
                die eigene Rendering-Kante gegen sich selbst clippen; eine
                Ebene hoeher reicht das. Animation bleibt unveraendert. */}
            <div ref={listRef} className="space-y-2 overflow-x-hidden">
              {guides.map((guide) => {
                const isOpen = openGuide === guide.id;
                return (
                  <div
                    key={guide.id}
                    data-card
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: 'var(--card-bg)',
                      border: `1px solid ${isOpen ? 'rgba(var(--accent-rgb),0.25)' : 'var(--bd)'}`,
                      boxShadow: 'var(--card-shad)',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Header */}
                    <button
                      onClick={() => setOpenGuide(isOpen ? null : guide.id)}
                      className="w-full flex items-center justify-between px-5 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <guide.icon
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: isOpen ? 'var(--accent)' : 'var(--txf)' }}
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
                                background: 'rgba(var(--accent-rgb),0.07)',
                                borderLeft: '2px solid rgba(var(--accent-rgb),0.4)',
                              }}
                            >
                              <AlertCircle
                                className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                                style={{ color: 'var(--accent)' }}
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
                                    background: 'rgba(var(--accent-rgb),0.15)',
                                    color: 'var(--accent)',
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
                          {/* Nur beim Rewax-Item, nicht im generischen
                              note-Renderer oben (der gilt fuer alle drei
                              Guides) — sonst muesste der note-Text durch
                              einen Link-Parser laufen, nur damit dieses eine
                              Item einen echten Link bekommt. */}
                          {guide.id === 'rewax' && (
                            <Link to="/kette-wachsen-lassen"
                              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold"
                              style={{ color: 'var(--accent)' }}>
                              {de ? 'Lieber einschicken? Service ansehen' : 'Prefer to send it in? See the service'}
                              <ArrowRight className="h-3 w-3" aria-hidden />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right column — reference card plus the blog link stacked. The
                blog link used to sit under BOTH columns at full width while
                the accordion stopped ~340px short of it, so the section had
                two different right edges and a void under the (short)
                reference card. Stacking them here gives one right edge and
                fills the column. */}
            <div className="flex flex-col gap-5">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--sf)',
                  border: '1px solid var(--bd)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                {/* Temperature bar */}
                <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--bd2)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-small tracking-widest uppercase" style={{ color: 'var(--txm)', letterSpacing: '0.1em' }}>
                      {de ? 'Wachstemperatur' : 'Wax temperature'}
                    </span>
                    <span className="font-display font-bold text-[14px]" style={{ color: 'var(--tx1)' }}>
                      80–90 °C
                    </span>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--sf3)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(to right, var(--accent), var(--accent-soft))',
                        width: '90%',
                        animation: 'guides-bar-fill 1.2s cubic-bezier(0.16,1,0.3,1) forwards',
                        transformOrigin: 'left',
                      }}
                    />
                  </div>
                  <style>{`
                    @keyframes guides-bar-fill {
                      from { clip-path: inset(0 100% 0 0); }
                      to   { clip-path: inset(0 0% 0 0); }
                    }
                  `}</style>
                </div>

                {/* Stat rows */}
                {(
                  [
                    { value: '5–10 min',  label: de ? 'Im Wachsbad'        : 'In the wax',     note: de ? 'Alte Schicht abschmelzen'     : 'Melt off old layer'         },
                    { value: '10–15 min', label: de ? 'Abkühlen/Aushärten' : 'Cool & harden',  note: de ? 'Bis steif, Glieder lockern'   : 'Until stiff, flex links'    },
                    { value: '10–20 min', label: de ? 'Einfahren'          : 'Break in',       note: de ? 'Erst dann läuft sie leise'    : 'Chain quiets down after'    },
                    { value: '<300 km',    label: de ? 'Nachwachsen'        : 'Re-wax',         note: de ? 'Für optimale Performance'     : 'For best performance'       },
                    { value: '1×',        label: de ? 'Entfetten'          : 'Degrease',       note: de ? 'Nur beim ersten Mal'          : 'New chain only, once'       },
                  ] as { value: string; label: string; note: string }[]
                ).map(({ value, label, note }, i, arr) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-5 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                  >
                    <span
                      className="font-display font-bold tabular-nums shrink-0 text-right"
                      style={{ fontSize: '0.875rem', color: 'var(--tx1)', width: '76px', whiteSpace: 'nowrap' }}
                    >
                      {value}
                    </span>
                    <div className="w-px self-stretch shrink-0" style={{ background: 'var(--bd2)' }} />
                    <div className="flex flex-col gap-[3px]">
                      <span className="text-meta font-semibold leading-none" style={{ color: 'var(--tx1)' }}>{label}</span>
                      <span className="text-meta leading-none" style={{ color: 'var(--txm)' }}>{note}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* The blog's in-depth guides were only reachable from the footer
                  or nav — nothing linked to them from the one section whose
                  whole subject is "how to do this". */}
              <Link to="/blog"
                className="group flex items-start justify-between gap-3 px-5 py-4 rounded-2xl transition-all hover:shadow-md"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)' }}>
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: 'var(--tx1)' }}>
                    {de ? 'Ausführliche Ratgeber' : 'In-depth guides'}
                  </p>
                  <p className="text-meta mt-1 leading-snug" style={{ color: 'var(--txm)' }}>
                    {de ? 'Jede Anleitung im Detail, mit Fotos und Schritt für Schritt.' : 'Every guide in full detail, with photos, step by step.'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: 'var(--accent-soft)' }} />
              </Link>
            </div>
          </div>

        </div>
      {/* Bottom gradient — bridges to FAQ below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--pg), transparent 100%), var(--pg))', zIndex: 1 }}
      />
    </Section>
  );
}
