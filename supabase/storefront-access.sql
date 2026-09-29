-- Storefront data is served by /api/storefront/catalog with an explicit field list.
-- The service role keeps full access for admin and checkout.
drop policy if exists "Public can read live products" on public.products;
drop policy if exists "Public can read giftbox products" on public.giftbox_products;

revoke select on public.products from anon, authenticated;
revoke select on public.giftbox_products from anon, authenticated;

grant select on public.products to service_role;
grant select on public.giftbox_products to service_role;