create table if not exists public.visitor_sessions (
  session_id text primary key,
  first_seen_at timestamptz default now() not null,
  last_seen_at timestamptz default now() not null,
  page_views integer default 0 not null,
  current_view text,
  current_path text,
  referrer text,
  user_agent text,
  cart_gift_count integer default 0 not null,
  cart_item_count integer default 0 not null,
  cart_total numeric(10, 2) default 0 not null,
  cart_items jsonb default '[]'::jsonb not null,
  cart_updated_at timestamptz,
  checkout_started_at timestamptz,
  converted_order_number text,
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists visitor_sessions_last_seen_at_idx
on public.visitor_sessions (last_seen_at desc);

create index if not exists visitor_sessions_cart_updated_at_idx
on public.visitor_sessions (cart_updated_at desc)
where cart_gift_count > 0;

drop trigger if exists visitor_sessions_updated_at on public.visitor_sessions;
create trigger visitor_sessions_updated_at
before update on public.visitor_sessions
for each row execute function public.set_updated_at();

alter table public.visitor_sessions enable row level security;

-- Visitor activity is written and read through server routes using SUPABASE_SERVICE_ROLE_KEY.
-- Do not add public select policies for this table.
