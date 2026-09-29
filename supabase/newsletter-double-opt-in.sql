-- Double opt-in and self-service unsubscribe for newsletter subscribers.
alter table public.newsletter_subscribers drop constraint if exists newsletter_subscribers_status_check;
alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_status_check
  check (status in ('pending', 'active', 'unsubscribed'));

alter table public.newsletter_subscribers
  add column if not exists confirmation_sent_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;

alter table public.newsletter_subscribers alter column status set default 'pending';

-- Existing active subscribers are preserved. New signups must be confirmed by e-mail.