# Database Schema

Source of truth: `supabase/migrations/0001_init.sql`.

## Tables
- **profiles** – 1:1 with `auth.users` (auto-created by trigger). `role` = `customer|admin`.
- **addresses** – user's saved addresses (`user_id` FK, cascade).
- **categories** – `slug` unique, optional `parent_id`.
- **products** – `slug` unique, `price` (cents), `stock`, `images text[]`, `attributes jsonb` (e.g. `{"sizes":["S","M"],"colors":["Black"]}`), `category_id` FK, `is_featured`, `is_active`.
- **tags / product_tags** – many-to-many.
- **coupons** – `code`, `type` (percent|fixed), `value`, `min_subtotal`, `max_uses`, `used_count`, `expires_at`, `is_active`.
- **orders** – `user_id`, `status`, `subtotal`, `discount`, `shipping_cost`, `total_amount`, `shipping_address jsonb`, `billing_address jsonb`, `delivery_method`, `coupon_id`, `payment_intent_id` (unique), `tracking_number`, `estimated_delivery`, `created_at`.
- **order_items** – `order_id`, `product_id`, `title` (snapshot), `quantity`, `price` (snapshot), `options jsonb`.

## Indexes
`products(category_id)`, `products(price)`, `products(created_at desc)`, `products(slug)`, `orders(user_id, created_at desc)`, `order_items(order_id)`, `addresses(user_id)`, unique `orders(payment_intent_id)`.

## RLS summary
| Table | Anon/Users | Admin |
|---|---|---|
| products, categories, tags | SELECT active only | ALL |
| profiles | SELECT/UPDATE own row (role not changeable) | ALL |
| addresses | ALL on own rows | – |
| orders, order_items | SELECT own only; **no client writes** | ALL |
| coupons | No direct access (validated server-side) | ALL |

Order creation and status changes use the service-role client (API route / webhook), which bypasses RLS.
