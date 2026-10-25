# Components Map

| Component | Type | Responsibility / Props |
|---|---|---|
| `Header` | Server | Nav, categories; renders `CartButton`, `UserMenu` |
| `CartButton` | Client | Count badge, opens `CartDrawer` |
| `CartDrawer` | Client | Slide-over; reads Zustand; qty update/remove, subtotal, link to /cart |
| `Hero`, `CategoryHighlights`, `PromoBanner` | Server | Static/DB-driven home sections |
| Featured carousel | Server | CSS scroll-snap list inside `app/page.tsx` |
| `ProductCard` | Server | `product: Product` |
| `ProductGrid` | Server | `products`, pagination via `Pagination` |
| `Filters` | Client | `categories`; pushes URL params (category, min/max price, inStock, sort) |
| `SortSelect` | Client | Updates `sort` param |
| `Pagination` | Server | `page`, `totalPages`, preserves params |
| `Gallery` | Client | `images: string[]` |
| `AddToCartForm` | Client | `product`; options (size/color), qty, stock check |
| `RelatedProducts` | Server | `categoryId`, `excludeId` |
| `CouponInput` | Client | Calls `/api/coupons/validate`; props `onApplied` |
| `CheckoutForm` | Client | Address forms (zod+RHF), delivery method; creates the order, then shows `PaymentElementWrapper` |
| `AddressFields` | Client | Reusable address inputs with `prefix`, `register`, `errors` |
| `CartLines` | Client | Line items with qty/remove; used by drawer and cart page |
| `PaymentElementWrapper` | Client | Stripe `Elements` + `PaymentElement`, `clientSecret` |
| `OrderSummary` | Client | `items`, totals |
| `AuthForm` | Client | Email/password + `GoogleButton` |
| `ProfileForm`, `AddressList` | Client | Account settings CRUD via the browser Supabase client (RLS-protected) |
| `OrderStatusBadge` | Server | Status: pending, processing, shipped, delivered, cancelled |
| `OrderDetail` | Server | Items, pricing breakdown, tracking info |
