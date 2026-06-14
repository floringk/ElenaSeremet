-- FUTURE: Supabase Storage + Payload S3 adapter (not required while using /content/images paths).
-- Run when scaling to CMS media upload — see docs/VERCEL-DEPLOY.md § Storage.

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

drop policy if exists "Public read cms-media" on storage.objects;
create policy "Public read cms-media"
  on storage.objects for select
  to public
  using (bucket_id = 'cms-media');

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
