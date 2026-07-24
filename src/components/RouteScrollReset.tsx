import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Plain route changes (e.g. clicking "Blog" in the nav while scrolled deep
// into another page) don't reset scroll position on their own — React
// Router just re-renders in place, so you land mid-page on the new route
// at whatever scrollY the old one happened to be at. Anchor navigation to
// homepage sections already handles its own scroll via PendingAnchorScroll
// (via router state), so this skips when that state is present.
export function RouteScrollReset() {
  const location = useLocation();

  useEffect(() => {
    if ((location.state as { scrollTo?: string } | null)?.scrollTo) return;
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
}
