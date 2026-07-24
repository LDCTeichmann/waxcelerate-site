import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Navigation's anchor links (#warum-wachs, #produkte, ...) only exist on the
// homepage. When clicked from another route, Navigation routes home first and
// stashes the target in router state — this component (rendered on the
// homepage only) picks that up and scrolls once the target section exists.
// Retries because below-the-fold sections are lazy-loaded and may not be in
// the DOM yet on the first render after navigation.
export function PendingAnchorScroll() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;

    let attempts = 0;
    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        navigate(location.pathname, { replace: true, state: {} });
      } else if (attempts < 30) {
        attempts += 1;
        setTimeout(tryScroll, 100);
      }
    };
    tryScroll();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return null;
}
