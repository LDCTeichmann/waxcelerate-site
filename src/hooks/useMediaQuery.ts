import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query. Needed because SVG figures cannot be made
 * legible on a phone by CSS alone: text inside an SVG scales with the viewBox,
 * so a 900-unit-wide chart squeezed into a 360px screen renders its 15-unit
 * labels at about 6 real pixels. The fix is a different figure, not a smaller
 * one, which means the component has to know.
 *
 * SSR-safe: returns false until mounted.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Phone-width layouts. Matches Tailwind's sm breakpoint. */
export const useIsNarrow = () => useMediaQuery('(max-width: 639px)');
