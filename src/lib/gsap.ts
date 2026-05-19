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

export { gsap, ScrollTrigger };
