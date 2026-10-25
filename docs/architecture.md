# Architecture

## Stack
Next.js 14+ (App Router) · TypeScript · Tailwind + shadcn/ui · Supabase (Postgres, Auth, RLS) · Stripe · Zustand (cart) · zod + react-hook-form

## Folder structure
```
src/
  app/
    layout.tsx, error.tsx, loading.tsx, not-found.tsx, globals.css
    page.tsx                      # Home
    products/page.tsx             # PLP (server, searchParams-driven filters)
    products/[slug]/page.tsx      # PDP
    cart/page.tsx
    checkout/page.tsx, checkout/success/page.tsx
    signin/, signup/, auth/callback/route.ts
    account/                      # protected by middleware
      layout.tsx, page.tsx, orders/page.tsx, orders/[id]/page.tsx
    api/
      checkout/route.ts           # re-prices cart, creates order + PaymentIntent
      coupons/validate/route.ts
      webhooks/stripe/route.ts    # source of truth for paid orders
  components/                     # see docs/components-map.md
  lib/
    supabase/{client,server,admin}.ts, stripe.ts, pricing.ts, validators.ts, utils.ts, hooks.ts
  store/cart.ts                   # Zustand, persisted to localStorage
  types.ts
  middleware.ts                   # session refresh + /account and /checkout guard
supabase/migrations/, supabase/seed.sql
docs/
```

## Conventions
- Server Components by default; `'use client'` only for filters, cart, forms, Stripe Elements.
- Filter/sort/page state lives in the URL (`?category=&min=&max=&inStock=&sort=&page=`) so PLP is server-rendered and shareable.
- Mutations go through Server Actions or route handlers; all input validated with zod on the server.
- Prices stored as integer minor units (cents).

## State management
- Cart: Zustand store (`items[{productId, slug, title, price, image, qty, options}]`), persisted locally. Prices are **never trusted from the client**; the checkout route re-fetches products and recomputes totals.
- Everything else: server data, no client global state.

## Data flow
1. Browser → Supabase (anon key + user JWT) for reads governed by RLS.
2. Checkout: client posts cart → `/api/checkout` (server) re-prices from DB, validates coupon + stock, creates a `pending` order + Stripe PaymentIntent, returns `client_secret`.
3. Stripe Payment Element confirms on client → redirect to `/checkout/success`.
4. Stripe webhook (`payment_intent.succeeded`) verifies signature, uses the **service-role** client to mark order `processing`, decrement stock, and increment coupon usage. Idempotent on `payment_intent_id`.
5. Success page reads the order server-side via the user's session.

## Security
- Service-role key only in `lib/supabase/admin.ts` (server-only, used by webhook).
- RLS on every table; users cannot write orders/order_items directly.
