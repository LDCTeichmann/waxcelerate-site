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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  text: string;
  stagger?: number;
  duration?: number;
  start?: string; // ScrollTrigger start position
}

export function ScrollWordReveal({
  text,
  stagger = 0.07,
  duration = 0.75,
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

  return (
    <span ref={ref} aria-label={text}>
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
