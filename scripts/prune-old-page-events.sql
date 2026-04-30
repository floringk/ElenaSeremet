-- Optional: run in Supabase SQL Editor to cap analytics table growth.
-- Adjust the interval (e.g. 90 days) to your retention policy.
-- Test on a backup or staging project first.

delete from public.page_events
where created_at < now() - interval '90 days';

-- Reclaim space (optional, Postgres/Supabase):
-- vacuum analyze public.page_events;
