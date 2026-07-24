/**
 * Central GSAP initialisation — import this instead of calling
 * gsap.registerPlugin(ScrollTrigger) in every file.
 *
 * GSAP handles duplicate registerPlugin calls gracefully, but calling it once
 * here is cleaner and shaves a tiny amount of module-load work.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Lazy-loaded <img>s (product cards, blog thumbnails, etc.) finish loading
// after ScrollTrigger has already measured each section's start/end from
// pre-image layout, so every trigger below a late-loading image ends up
// keyed to stale coordinates — entrance animations then fire early/late or
// look like they've already played. `load` doesn't bubble, but it does fire
// during the capture phase, so one window-level capture listener catches
// every image on the page without wiring an onLoad handler into each one.
if (typeof window !== 'undefined') {
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener('load', (e) => {
    if ((e.target as HTMLElement | null)?.tagName !== 'IMG') return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  }, true);
}

export { gsap, ScrollTrigger };
