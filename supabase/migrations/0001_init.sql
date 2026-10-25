create extension if not exists "pgcrypto";

-- Enums
create type order_status as enum ('pending','processing','shipped','delivered','cancelled');
create type coupon_type as enum ('percent','fixed');

-- Profiles (synced with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Addresses
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses(user_id);

-- Catalog
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  price integer not null check (price >= 0),          -- cents
  compare_at_price integer check (compare_at_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  attributes jsonb not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_price_idx on public.products(price);
create index products_created_idx on public.products(created_at desc);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);
create table public.product_tags (
  product_id uuid references public.products(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- Coupons
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value integer not null check (value > 0),            -- percent or cents
  min_subtotal integer not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status order_status not null default 'pending',
  subtotal integer not null,
  discount integer not null default 0,
  shipping_cost integer not null default 0,
  total_amount integer not null,
  currency text not null default 'usd',
  shipping_address jsonb not null,
  billing_address jsonb not null,
  delivery_method text not null,
  coupon_id uuid references public.coupons(id),
  payment_intent_id text unique,
  tracking_number text,
  estimated_delivery date,
  created_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  quantity integer not null check (quantity > 0),
  price integer not null,
  options jsonb not null default '{}'
);
create index order_items_order_idx on public.order_items(order_id);

-- Atomic stock decrement (called by webhook with service role)
create or replace function public.decrement_stock(p_product uuid, p_qty integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update products set stock = stock - p_qty where id = p_product and stock >= p_qty;
  if not found then raise exception 'Insufficient stock for %', p_product; end if;
end $$;
revoke execute on function public.decrement_stock from public, anon, authenticated;

-- RLS
alter table public.profiles    enable row level security;
alter table public.addresses   enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.tags        enable row level security;
alter table public.product_tags enable row level security;
alter table public.coupons     enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

create policy "profiles read own"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "addresses own" on public.addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products public read" on public.products for select using (is_active or public.is_admin());
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "tags public read" on public.tags for select using (true);
create policy "product_tags public read" on public.product_tags for select using (true);
create policy "tags admin write" on public.tags for all using (public.is_admin()) with check (public.is_admin());
create policy "product_tags admin write" on public.product_tags for all using (public.is_admin()) with check (public.is_admin());

create policy "coupons admin only" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy "orders read own" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders admin update" on public.orders for update using (public.is_admin());
create policy "order_items read own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
