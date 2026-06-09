/**
 * Thin analytics wrapper around PostHog.
 *
 * Vendor-agnostic on purpose: call sites use `analytics.*`, so swapping PostHog
 * for something else only touches this file. No-ops entirely when
 * VITE_POSTHOG_KEY is unset (e.g. local dev without a key), so nothing breaks.
 *
 * Privacy: initialised against the EU host (Frankfurt) and configured to avoid
 * cross-site cookies, which keeps the GDPR/consent burden minimal.
 */
import posthog from 'posthog-js';

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';

let started = false;

export function initAnalytics() {
  if (started || !KEY) return;
  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'identified_only',
    persistence: 'localStorage', // no third-party cookies
    capture_pageview: false, // we capture SPA pageviews manually on route change
    autocapture: true, // raw click/scroll capture — "what do people click"
  });
  started = true;
}

function track(event: string, props?: Record<string, unknown>) {
  if (!KEY) return;
  posthog.capture(event, props);
}

export const analytics = {
  pageview: (path: string) => track('$pageview', { $current_url: path }),
  viewProduct: (productId: string, price?: number) =>
    track('view_product', { product_id: productId, price }),
  addToCart: (productId: string, price?: number) =>
    track('add_to_cart', { product_id: productId, price }),
  beginCheckout: (items: { productId: string; quantity: number }[], value: number) =>
    track('begin_checkout', { item_count: items.length, value, items }),
  ebayClick: (productId: string) => track('ebay_click', { product_id: productId }),
  purchase: (sessionId: string) => track('purchase', { session_id: sessionId }),
};
