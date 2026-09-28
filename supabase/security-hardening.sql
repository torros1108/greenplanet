-- Atomic Stripe processing and persistent admin login rate limiting.
-- Safe to run more than once in Supabase SQL Editor.

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  order_id uuid references public.orders(id) on delete set null,
  processed_at timestamptz default now() not null
);

alter table public.stripe_webhook_events enable row level security;

create or replace function public.process_stripe_checkout_payment(
  p_event_id text,
  p_order_id uuid,
  p_amount_total bigint
)
returns table(processed boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  order_total numeric(10, 2);
  order_status text;
  expected_amount bigint;
  stock_item record;
  product_row public.products%rowtype;
  updated_variants jsonb;
begin
  if coalesce(trim(p_event_id), '') = '' then
    raise exception 'Stripe event-id mangler';
  end if;

  insert into public.stripe_webhook_events (event_id, order_id)
  values (p_event_id, p_order_id)
  on conflict (event_id) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    return query select false, 'duplicate'::text;
    return;
  end if;

  select total, status
  into order_total, order_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Ordren findes ikke';
  end if;

  expected_amount := round(order_total * 100)::bigint;
  if p_amount_total <> expected_amount then
    raise exception 'Stripe-beløb stemmer ikke med ordren';
  end if;

  if order_status = 'paid' then
    return query select false, 'already_paid'::text;
    return;
  end if;

  for stock_item in
    select
      item.value ->> 'id' as product_id,
      item.value #>> '{selectedVariant,id}' as variant_id,
      count(*)::integer as quantity
    from public.order_lines ol
    cross join lateral jsonb_array_elements(ol.items) as item(value)
    where ol.order_id = p_order_id
      and coalesce(item.value ->> 'id', '') <> ''
    group by item.value ->> 'id', item.value #>> '{selectedVariant,id}'
    order by item.value ->> 'id', item.value #>> '{selectedVariant,id}'
  loop
    select *
    into product_row
    from public.products
    where legacy_id = stock_item.product_id
    for update;

    if not found then
      continue;
    end if;

    updated_variants := product_row.variants;
    if coalesce(stock_item.variant_id, '') <> '' then
      select coalesce(
        jsonb_agg(
          case
            when variant.value ->> 'id' = stock_item.variant_id
              then jsonb_set(
                variant.value,
                '{stock}',
                to_jsonb(greatest(0, coalesce((variant.value ->> 'stock')::integer, 0) - stock_item.quantity))
              )
            else variant.value
          end
          order by variant.ordinality
        ),
        '[]'::jsonb
      )
      into updated_variants
      from jsonb_array_elements(coalesce(product_row.variants, '[]'::jsonb))
        with ordinality as variant(value, ordinality);
    end if;

    update public.products
    set
      stock = greatest(0, coalesce(stock, 0) - stock_item.quantity),
      variants = updated_variants
    where id = product_row.id;
  end loop;

  update public.orders
  set status = 'paid'
  where id = p_order_id;

  return query select true, 'processed'::text;
end;
$$;

revoke all on function public.process_stripe_checkout_payment(text, uuid, bigint) from public, anon, authenticated;
grant execute on function public.process_stripe_checkout_payment(text, uuid, bigint) to service_role;

create table if not exists public.admin_login_attempts (
  key_hash text primary key,
  attempt_count integer default 0 not null,
  window_started_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.admin_login_attempts enable row level security;

create or replace function public.check_admin_login_rate_limit(
  p_key_hash text,
  p_max_attempts integer default 8,
  p_window_seconds integer default 900
)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt_row public.admin_login_attempts%rowtype;
  window_length interval := make_interval(secs => greatest(1, p_window_seconds));
begin
  delete from public.admin_login_attempts
  where updated_at < now() - interval '2 days';

  insert into public.admin_login_attempts (key_hash, attempt_count, window_started_at, updated_at)
  values (p_key_hash, 1, now(), now())
  on conflict (key_hash) do update
  set
    attempt_count = case
      when public.admin_login_attempts.window_started_at + window_length <= now() then 1
      else public.admin_login_attempts.attempt_count + 1
    end,
    window_started_at = case
      when public.admin_login_attempts.window_started_at + window_length <= now() then now()
      else public.admin_login_attempts.window_started_at
    end,
    updated_at = now()
  returning * into attempt_row;

  return query
  select
    attempt_row.attempt_count <= greatest(1, p_max_attempts),
    case
      when attempt_row.attempt_count <= greatest(1, p_max_attempts) then 0
      else greatest(
        1,
        ceil(extract(epoch from (attempt_row.window_started_at + window_length - now())))::integer
      )
    end;
end;
$$;

create or replace function public.reset_admin_login_rate_limit(p_key_hash text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_login_attempts where key_hash = p_key_hash;
$$;

revoke all on function public.check_admin_login_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.reset_admin_login_rate_limit(text) from public, anon, authenticated;
grant execute on function public.check_admin_login_rate_limit(text, integer, integer) to service_role;
grant execute on function public.reset_admin_login_rate_limit(text) to service_role;
