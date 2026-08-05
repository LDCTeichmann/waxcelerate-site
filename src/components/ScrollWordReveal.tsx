/**
 * ScrollWordReveal — word-by-word reveal triggered when element enters viewport.
 * Wraps each word in a clip-mask so words slide up out of nothing.
 *
 * Usage:
 *   <h2 className="font-display text-4xl font-bold">
 *     <ScrollWordReveal text={t.section.title} />
 *   </h2>
 */
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';


interface Props {
  text: string;
  stagger?: number;
  duration?: number;
  start?: string; // ScrollTrigger start position
}

export function ScrollWordReveal({
  text,
  stagger = 0,          // calm: reveal as a single unit (no per-word cascade)
  duration = 0.65,
  start = 'top 90%',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll<HTMLElement>('.ww-inner').forEach(w => {
        w.style.transform = 'translateY(0)';
      });
      return;
    }

    const wordInners = el.querySelectorAll<HTMLElement>('.ww-inner');
    gsap.set(wordInners, { y: '115%' });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(wordInners, {
          y: 0,
          duration,
          ease: 'power3.out',
          stagger,
          onStart() {
            wordInners.forEach(w => { w.style.willChange = 'transform'; });
          },
          onComplete() {
            wordInners.forEach(w => { w.style.willChange = 'auto'; });
          },
        });
      },
    });

    return () => { trigger.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const words = text.split(' ');

  // role="text": ohne explizite Rolle gilt fuer <span> die implizite Rolle
  // "generic", die laut ARIA-in-HTML keinen Namen von aria-label akzeptiert
  // — der Screenreader wuerde stattdessen versuchen, die einzelnen
  // aria-hidden Wort-Spans zusammenzusetzen, und nichts vorlesen. role="text"
  // ist zwar kein Teil der ARIA-Spec, wird aber u. a. von VoiceOver genau
  // fuer diesen Fall (ein zusammengesetzter, animierter Text mit eigenem
  // Namen) erkannt; andere Screenreader ignorieren die unbekannte Rolle und
  // lesen aria-label trotzdem korrekt, weil damit implizit keine
  // role="generic" mehr greift.
  return (
    <span ref={ref} role="text" aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ verticalAlign: 'bottom', lineHeight: '1.15' }}
          aria-hidden="true"
        >
          <span
            className="ww-inner inline-block"
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}
