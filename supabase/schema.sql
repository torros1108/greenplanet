-- Greenplanet webshop database schema
-- Run this in Supabase SQL Editor when the project is created.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  slug text unique not null,
  title text not null,
  brand text not null,
  category text not null,
  description text not null,
  cost numeric(10, 2) default 0 not null,
  price numeric(10, 2) not null,
  stock integer default 0 not null,
  sku text,
  image_url text,
  giftbox_eligible boolean default true not null,
  occasions text[] default '{}'::text[] not null,
  shape text default 'box' not null,
  status text default 'draft' not null check (status in ('draft', 'live', 'archived')),
  specs jsonb default '[]'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.giftboxes (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  slug text unique not null,
  title text not null,
  category text not null,
  description text not null,
  note text,
  recipient text,
  occasion text,
  packing text,
  card_text text,
  delivery text,
  why text,
  details text[] default '{}'::text[] not null,
  box_price numeric(10, 2) default 49 not null,
  status text default 'draft' not null check (status in ('draft', 'live', 'archived')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.giftbox_products (
  giftbox_id uuid not null references public.giftboxes(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  sort_order integer default 0 not null,
  primary key (giftbox_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  status text default 'new' not null check (status in ('new', 'confirmed', 'paid', 'packed', 'sent', 'cancelled')),
  total numeric(10, 2) not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  customer_postcode text,
  customer_city text,
  delivery_method text,
  recipient_name text,
  delivery_address text,
  delivery_postcode text,
  delivery_city text,
  requested_delivery_date text,
  delivery_note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  title text not null,
  note text,
  card_text text,
  total numeric(10, 2) not null,
  items jsonb default '[]'::jsonb not null,
  created_at timestamptz default now() not null
);

create table if not exists public.pages (
  slug text primary key,
  title text not null,
  eyebrow text,
  intro text,
  sections jsonb default '[]'::jsonb not null,
  updated_at timestamptz default now() not null
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists giftboxes_updated_at on public.giftboxes;
create trigger giftboxes_updated_at
before update on public.giftboxes
for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists pages_updated_at on public.pages;
create trigger pages_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.giftboxes enable row level security;
alter table public.giftbox_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_lines enable row level security;
alter table public.pages enable row level security;

drop policy if exists "Public can read live products" on public.products;
create policy "Public can read live products"
on public.products for select
using (status = 'live');

drop policy if exists "Public can read live giftboxes" on public.giftboxes;
create policy "Public can read live giftboxes"
on public.giftboxes for select
using (status = 'live');

drop policy if exists "Public can read giftbox products" on public.giftbox_products;
create policy "Public can read giftbox products"
on public.giftbox_products for select
using (true);

drop policy if exists "Public can read pages" on public.pages;
create policy "Public can read pages"
on public.pages for select
using (true);

-- Orders should be inserted through a server route using SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose service role keys in browser code.
