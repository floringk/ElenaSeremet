create extension if not exists pgcrypto;

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  source_page text not null default '/contact',
  submitted_at timestamptz not null default now(),
  ip_address text
);

create index if not exists idx_form_submissions_submitted_at
  on public.form_submissions (submitted_at desc);

-- Înscrieri / lead-uri abonament (fără email obligatoriu; doar Supabase)
create table if not exists public.membership_signups (
  id uuid primary key default gen_random_uuid(),
  want_goal text not null,
  subscription_type text not null,
  member_kind text not null,
  source_page text not null default '/inscriere',
  submitted_at timestamptz not null default now(),
  ip_address text
);

create index if not exists idx_membership_signups_submitted_at
  on public.membership_signups (submitted_at desc);

create table if not exists public.page_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text not null,
  referrer text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_events_created_at
  on public.page_events (created_at desc);

create index if not exists idx_page_events_event_name
  on public.page_events (event_name);

-- Payload CMS tables live here (see payload.config.ts `schemaName`), not in `public`.
create schema if not exists payload;
