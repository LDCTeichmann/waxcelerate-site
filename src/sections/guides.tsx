import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Droplets, RotateCcw, ChevronDown, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { use3DReveal } from '@/hooks/useAnimation';
import { Section } from '@/components/Section';
import { waxProcessTimeline, guideFacts } from '@/lib/data';

// Minuten aus derselben Zeitleiste wie der Ablauf auf der Wachsseite
// (ProcessWatch), damit Startseite und Produktseite nie verschiedene Zeiten
// nennen. Nachwachsen = alles ausser den Nur-beim-ersten-Mal-Schritten.
const sumMin = (steps: typeof waxProcessTimeline) => steps.reduce((a, s) => a + s.minutes, 0);
const REWAX_STEPS = waxProcessTimeline.filter(s => !s.firstOnly);
const TOTALS = {
  first: sumMin(waxProcessTimeline),
  rewax: sumMin(REWAX_STEPS),
  rewaxHands: sumMin(REWAX_STEPS.filter(s => s.active)),
  degrease: sumMin(waxProcessTimeline.filter(s => s.firstOnly)),
};
const fill = (s: string, vars: Record<string, number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));

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

  const g = t.guides;
  // `time`: Gesamtdauer rechts im Kopf jeder Anleitung, auch zugeklappt
  // sichtbar — man findet so den passenden Ablauf, ohne zu oeffnen.
  const guides = [
    { id: 'neu',      icon: BookOpen,    data: g.newChain, time: fill(g.guideTotal, { min: TOTALS.first }) },
    { id: 'rewax',    icon: Droplets,    data: g.rewax,    time: fill(g.guideTotal, { min: TOTALS.rewax }) },
    { id: 'rotation', icon: RotateCcw,   data: g.rotation, time: fill(g.rotationTotal, { min: TOTALS.rewax }) },
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
            <p className="mt-3">
              <Link to="/anleitung" className="text-[13px] font-semibold" style={{ color: 'var(--accent-soft)' }}>
                {g.allOnOnePage}
              </Link>
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-start">
            {/* Left: accordion. overflow-x: clip ist eine gezielte Absicherung
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
                Ebene hoeher reicht das. Animation bleibt unveraendert.
                Bewusst clip, NICHT hidden: overflow-x:hidden macht laut Spec
                overflow-y zu auto, die Liste wird Scroll-Container, und
                waehrend des Reveals (Karten noch y:32) blitzte rechts ein
                vertikaler Scrollbalken auf. Gleiches Muster wie html/body
                in index.css. */}
            <div ref={listRef} className="space-y-2 [overflow-x:clip]">
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
                      <span className="ml-auto mr-3 flex-shrink-0 num text-[12px] tabular-nums" style={{ color: 'var(--txm)' }}>
                        {guide.time}
                      </span>
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

            {/* Right column — "Auf einen Blick" (14.09.2026). Vorher eine
                handgeschriebene Minutenliste (Wachsbad 5–10, Aushaerten
                10–15, Einfahren 10–20 min), die neben der Zeitleiste der
                Wachsseite andere Zahlen nannte. Jetzt: Temperatur, dieselbe
                Zeitleiste wie ProcessWatch, die zwei Zahlen, die nicht in
                der Zeitleiste stehen, und drei Wege weiter statt eines
                allgemeinen Ratgeber-Links. Eine Karte, eine rechte Kante. */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}
            >
              <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--bd2)' }}>
                <div className="flex items-baseline justify-between mb-3.5">
                  <span className="text-small tracking-widest uppercase" style={{ color: 'var(--txm)', letterSpacing: '0.1em' }}>
                    {g.glanceTitle}
                  </span>
                  <span className="font-display font-bold text-[15px]" style={{ color: 'var(--tx1)' }}>
                    {guideFacts.waxTemp}
                  </span>
                </div>
                {/* Zeitleiste: Balkenbreite = Minuten, dunkel = du tust
                    etwas, hell = warten. Der Satz darunter traegt dieselbe
                    Information fuer Screenreader. */}
                <div className="flex h-2.5 gap-[3px]" aria-hidden>
                  {REWAX_STEPS.map((s, i) => (
                    <span key={i} className="rounded-full"
                      style={{ flexGrow: Math.max(s.minutes, 2.5), background: s.active ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.2)' }} />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: 'var(--txm)' }} aria-hidden>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />{g.glanceHands}</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--accent-rgb),0.3)' }} />{g.glanceWait}</span>
                </div>
                <p className="text-meta leading-snug mt-3" style={{ color: 'var(--tx2)' }}>
                  <b className="font-semibold" style={{ color: 'var(--tx1)' }}>{g.glanceRun}:</b>{' '}
                  {fill(g.glanceTotalHands, { min: TOTALS.rewax, hands: TOTALS.rewaxHands })}
                </p>
                <p className="text-meta leading-snug mt-1" style={{ color: 'var(--txm)' }}>
                  {fill(g.glanceFirst, { min: TOTALS.degrease })}
                </p>
              </div>

              {[
                { value: guideFacts.rewaxKm, label: g.glanceRewaxLabel, note: g.glanceRewaxNote },
                { value: guideFacts.degreaseCount, label: g.glanceDegreaseLabel, note: g.glanceDegreaseNote },
              ].map(({ value, label, note }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--bd2)' }}>
                  <span className="font-display font-bold tabular-nums shrink-0 text-right"
                    style={{ fontSize: '0.875rem', color: 'var(--tx1)', width: '64px', whiteSpace: 'nowrap' }}>
                    {value}
                  </span>
                  <div className="w-px self-stretch shrink-0" style={{ background: 'var(--bd2)' }} />
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-meta font-semibold leading-none" style={{ color: 'var(--tx1)' }}>{label}</span>
                    <span className="text-meta leading-none" style={{ color: 'var(--txm)' }}>{note}</span>
                  </div>
                </div>
              ))}

              <ul>
                {[
                  { to: '/blog/heisswachs-anleitung', label: g.linkPhotos },
                  { to: '/rechner/intervall', label: g.linkInterval },
                  { to: '/kette-wachsen-lassen', label: g.linkService },
                ].map((l, i) => (
                  <li key={l.to} style={{ borderTop: i > 0 ? '1px solid var(--bd2)' : 'none' }}>
                    <Link to={l.to}
                      className="group flex items-center justify-between gap-3 px-5 py-3 text-[13px] font-semibold transition-colors hover:bg-[var(--sf2)]"
                      style={{ color: 'var(--tx1)' }}>
                      {l.label}
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                        style={{ color: 'var(--accent-soft)' }} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
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
