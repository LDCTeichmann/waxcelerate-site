import { useEffect } from 'react';

// Module-level counter so multiple overlays (cart drawer, mobile nav, WaxDive,
// CompareModal, ImageLightbox) can lock/unlock independently without one
// closing early and unlocking scroll while another is still open.
let lockCount = 0;

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (lockCount === 0) {
      // Hiding the scrollbar (non-overlay scrollbars on Windows/Linux/most
      // desktop browsers) widens the viewport's usable width by the
      // scrollbar's own width, reflowing full-width content by that same
      // amount — visible as the page (and anything anchored to its edges,
      // like the fixed nav bar) snapping sideways the instant any of the
      // six modals/drawers using this hook opens or closes. Padding the
      // body by exactly that width cancels the reflow.
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    lockCount++;
    document.body.style.overflow = 'hidden';
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [locked]);
}
