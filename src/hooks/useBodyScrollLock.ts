import { useEffect } from 'react';

// Module-level counter so multiple overlays (cart drawer, mobile nav, WaxDive,
// CompareModal, ImageLightbox) can lock/unlock independently without one
// closing early and unlocking scroll while another is still open.
let lockCount = 0;

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount++;
    document.body.style.overflow = 'hidden';
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = '';
    };
  }, [locked]);
}
