# Waxcelerate — Checkout, Inventory & Analytics Setup

Everything except this checklist is already coded. Work top to bottom; after each
section the related feature goes live. All accounts have free tiers; the **GitHub
Student Developer Pack** adds the Stripe fee waiver (first ~$1,000 of revenue).

> **Tax note (Kleinunternehmer §19 UStG):** keep **Stripe Tax OFF**. We do not
> charge VAT. The invoice footer in `api/create-checkout.ts` already states this —
> leave it as is.

---

## 1. Stripe — makes checkout work (required)

1. Create a Stripe account; stay in **Test mode** until everything works.
2. **Products** → create all 11 products with EUR prices matching `src/lib/data.ts`.
   For each, copy its **Price ID** (`price_…`) into that product's
   `stripePriceId` field in `src/lib/data.ts`.
3. **Shipping rates** → create two rates: one €0 (free) and one standard. Copy both
   `shr_…` IDs → env vars `STRIPE_SHIPPING_FREE` and `STRIPE_SHIPPING_STANDARD`.
4. **Developers → API keys** → copy the secret key → `STRIPE_SECRET_KEY`.
5. **Developers → Webhooks** → add endpoint `https://<your-domain>/api/stripe-webhook`,
   event `checkout.session.completed` → copy the **Signing secret** →
   `STRIPE_WEBHOOK_SECRET`.
6. Set `SITE_URL` to your production URL.

Test: add items → checkout → pay with card `4242 4242 4242 4242` (any future expiry /
CVC) → you land on `/bestellung-erfolgreich`. Discounts already work via the
"Add promotion code" field on the Stripe page — create codes under **Products →
Coupons / Promotion codes**.

Go live: flip Stripe to **Live mode**, redo steps 2–5 with live keys.

---

## 2. Upstash Redis — inventory + /admin (recommended)

1. Create a free Upstash Redis database.
2. Copy the REST URL + token → `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
3. Set `ADMIN_PASSWORD`.

Now `/admin` works: log in, set stock per product (`-1` = unlimited, `0` = sold out,
or an exact count). Stock **auto-decrements** on each completed order (handled in
`api/stripe-webhook.ts`). Without Upstash, all products show as unlimited.

---

## 3. Supabase — order history (optional, you chose to include)

1. Create a Supabase project (**EU / Frankfurt** region for GDPR).
2. Create the `orders` table (SQL editor):

   ```sql
   create table orders (
     id bigint generated always as identity primary key,
     stripe_session_id text unique,
     email text,
     amount_total bigint,
     currency text,
     items jsonb,
     shipping jsonb,
     created_at timestamptz default now()
   );
   ```
3. Settings → API → copy **Project URL** + **service_role** key →
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose).

Note: free Supabase projects pause after 7 days of inactivity; the next webhook
write wakes it.

---

## 4. Resend — order confirmation email (optional)

1. Create a Resend account; verify the `waxcelerate.de` sending domain (DNS records).
2. Copy the API key → `RESEND_API_KEY`.

The webhook then emails the buyer on each order. Edit the template in
`api/stripe-webhook.ts → sendConfirmationEmail`.

---

## 5. PostHog — click analytics (the "what do people click" goal)

1. Create a PostHog account, **EU Cloud** region.
2. Project Settings → copy the **Project API Key** → `VITE_POSTHOG_KEY`
   (and keep `VITE_POSTHOG_HOST=https://eu.i.posthog.com`).

Tracked out of the box: pageviews, plus custom events `view_product`,
`add_to_cart`, `begin_checkout`, `ebay_click`, `purchase` (see
`src/lib/analytics.ts`). Autocapture also records raw clicks/scrolls, so you can
build funnels (e.g. view_product → add_to_cart → purchase) and a heatmap of what
gets clicked. Without the key, analytics no-ops silently.

---

## Quick verification

```bash
npx tsc --noEmit                 # must be clean (pre-commit enforces this)
npm run dev -- --port 5174       # local smoke test
```

End-to-end: add multiple items → cart → checkout → Stripe test card → success page.
Then confirm: Supabase has the order row, the buyer email arrived, the Upstash
`stock:<id>` dropped, and the PostHog dashboard shows the events.
