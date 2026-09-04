-- A3: Row Level Security on public lead / analytics tables.
-- Idempotent: safe to run twice (ENABLE RLS is a no-op if already on).
-- Run this in the Supabase SQL Editor on an existing project after supabase-schema.sql.
--
-- Deny SELECT/UPDATE/DELETE for anon and authenticated.
-- INSERT is allowed so public forms work without the service role (local + edge).
-- The service role still bypasses RLS for admin reads. Keep it server-only.

alter table public.form_submissions enable row level security;
alter table public.membership_signups enable row level security;
alter table public.page_events enable row level security;

grant insert on public.form_submissions, public.membership_signups, public.page_events to anon, authenticated;

drop policy if exists membership_signups_insert_public on public.membership_signups;
create policy membership_signups_insert_public
  on public.membership_signups for insert to anon, authenticated with check (true);

drop policy if exists form_submissions_insert_public on public.form_submissions;
create policy form_submissions_insert_public
  on public.form_submissions for insert to anon, authenticated with check (true);

drop policy if exists page_events_insert_public on public.page_events;
create policy page_events_insert_public
  on public.page_events for insert to anon, authenticated with check (true);
