# Greenplanet Live Plan

## 1. Supabase

1. Create a Supabase project named `greenplanet`.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Run `supabase/seed.sql` to import starter products, gift boxes, gift box composition, and policy pages.
4. Copy these values into `.env.local` locally and into Vercel environment variables later:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
5. Keep `SUPABASE_SERVICE_ROLE_KEY` secret. It must only be used in server routes.

## 2. Vercel

1. Push this project to GitHub or import the folder into Vercel.
2. Create a Vercel project for `greenplanet-shop`.
3. Add the environment variables from `.env.example`.
4. Deploy.

## 3. Domain

1. Add `greenplanet.dk` in Vercel under Project Settings > Domains.
2. Vercel will show the DNS records.
3. Log in where the domain DNS is managed.
4. Point:
   - `greenplanet.dk` to Vercel's A record, or use the records Vercel provides.
   - `www.greenplanet.dk` as CNAME to Vercel.
5. Wait for SSL and DNS verification.

## 4. What We Build Next

1. Install Supabase client.
2. Move products and giftboxes into the database.
3. Create an order API route so checkout saves orders in Supabase.
4. Create an admin view for orders.
5. Add order e-mail notifications.
6. Add payment through Stripe, MobilePay, or payment links.

## Before Launch

- Replace placeholder CVR, address, phone, and e-mail.
- Confirm shipping prices and delivery provider.
- Review terms, privacy policy, cookie policy, and return policy.
- Add a real cookie consent banner if analytics or marketing scripts are used.
