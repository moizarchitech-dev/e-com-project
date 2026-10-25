# Fieldhouse: Next.js + Supabase + Stripe storefront

## Setup
1. `npm install`
2. Create a Supabase project. In the SQL editor (or with `supabase db push`) run, in order:
   `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_functions.sql`, then optionally `supabase/seed.sql`.
3. Supabase → Authentication → Providers: enable **Email** and **Google** (add your Google OAuth client ID/secret).
   Authentication → URL Configuration: set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` as a redirect URL.
4. Copy `.env.example` to `.env.local` and fill in the Supabase and Stripe keys.
5. Forward Stripe webhooks locally and copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`:
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
6. `npm run dev`, then open http://localhost:3000. Test card: `4242 4242 4242 4242`.

## Make yourself an admin
`update profiles set role = 'admin' where id = '<your auth user id>';`

## How an order flows
Cart (Zustand) → `/api/checkout` re-prices from the database and creates a `pending` order plus a PaymentIntent →
Stripe Payment Element → redirect to `/checkout/success?session_id=pi_…` → webhook marks the order `processing`,
decrements stock and counts the coupon use.

## Notes
- `npm run typecheck` passes. Unpaid `pending` orders are hidden from the order history and can be cleaned up with a scheduled job.
- Shipping: standard $5 (free over $75), express $15. Edit `src/lib/pricing.ts`.
- No admin UI is included. Manage products, coupons and order status/tracking in the Supabase dashboard.

## Adding products and users in bulk
Edit `data/products.json` / `data/users.json`, then run:
- `npm run add:products` adds or updates products by slug. Prices are in dollars, and missing categories are created automatically.
- `npm run add:users` creates confirmed users and sets their role (`admin` or `customer`).
These scripts use the service-role key, so run them only on your own machine.
