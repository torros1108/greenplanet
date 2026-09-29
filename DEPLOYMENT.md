# Greenplanet Live Plan

## 1. Supabase

1. Create a Supabase project named `greenplanet`.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Run `supabase/security-hardening.sql` to install atomic Stripe processing and persistent admin login rate limiting.
4. Run `supabase/activity-schema.sql` to install visitor and cart activity tracking.
5. Run `supabase/seed.sql` to import starter products, gift boxes, gift box composition, and policy pages.
6. Copy these values into `.env.local` locally and into Vercel environment variables later:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `ADMIN_RATE_LIMIT_SECRET` (recommended; use a separate random secret)
   - `NEWSLETTER_TOKEN_SECRET` (a separate random secret for confirmation links)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (when webhooks are enabled)
   - `RESEND_API_KEY`
   - `MAIL_FROM`
   - `ORDER_NOTIFICATION_EMAIL`
8. Keep `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_RATE_LIMIT_SECRET`, Stripe keys, and Resend keys secret. They must only be used in server routes.
9. Existing projects must also run new SQL migration files before deploying application code that depends on them.

## 2. Vercel

1. Push this project to GitHub or import the folder into Vercel.
2. Create a Vercel project for `greenplanet-shop`.
3. Add the environment variables from `.env.example`.
4. Deploy.
5. In Stripe Dashboard, create a webhook endpoint:
   - `https://greenplanet.dk/api/stripe/webhook`
   - Events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

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
6. Add Stripe webhook handling so paid orders can automatically move to `paid`.

## Before Launch

- Replace placeholder CVR, address, phone, and e-mail.
- Confirm shipping prices and delivery provider.
- Review terms, privacy policy, cookie policy, and return policy.
- Add a real cookie consent banner if analytics or marketing scripts are used.
- Confirm that cookie/privacy texts mention Google Analytics and visitor/cart activity.
- Verify `/api/activity` returns `{"ok":true}` after `supabase/activity-schema.sql` is installed.
