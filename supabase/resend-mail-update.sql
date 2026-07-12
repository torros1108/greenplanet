-- Greenplanet Resend/mail update
-- Run this before mail-flow-templates.sql if your Supabase schema already exists.

create extension if not exists "pgcrypto";

create table if not exists public.mail_templates (
  slug text primary key,
  subject text not null,
  preheader text,
  body text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.orders
add column if not exists create_customer_profile boolean default false not null,
add column if not exists customer_welcome_sent_at timestamptz,
add column if not exists order_confirmation_sent_at timestamptz,
add column if not exists admin_notification_sent_at timestamptz;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists mail_templates_updated_at on public.mail_templates;
create trigger mail_templates_updated_at
before update on public.mail_templates
for each row execute function public.set_updated_at();

alter table public.mail_templates enable row level security;
