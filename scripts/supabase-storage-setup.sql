-- Supabase Storage bucket for Payload CMS media uploads.
-- See docs/CMS-EDITABILITY.md and docs/VERCEL-DEPLOY.md.
--
-- 1) Run this SQL in the Supabase SQL editor.
-- 2) Create S3 access keys: Project Settings → Storage → S3 access keys.
-- 3) Set on Vercel / .env:
--    SUPABASE_STORAGE_BUCKET=cms-media
--    S3_ACCESS_KEY_ID=...
--    S3_SECRET_ACCESS_KEY=...
--    S3_REGION=<from Supabase S3 settings>
--    S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
--    (S3_ENDPOINT can be omitted if SUPABASE_URL is set — derived automatically.)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for next/image and the marketing site
drop policy if exists "Public read cms-media" on storage.objects;
create policy "Public read cms-media"
  on storage.objects for select
  to public
  using (bucket_id = 'cms-media');

-- Authenticated role (optional UI clients). Payload uses S3 API keys (bypasses these policies).
drop policy if exists "Authenticated insert cms-media" on storage.objects;
create policy "Authenticated insert cms-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-media');

drop policy if exists "Authenticated update cms-media" on storage.objects;
create policy "Authenticated update cms-media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-media');

drop policy if exists "Authenticated delete cms-media" on storage.objects;
create policy "Authenticated delete cms-media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-media');
