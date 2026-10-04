import "dotenv/config";
import pg from "pg";

const url = (
  process.env.PAYLOAD_DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  ""
).trim();
if (!url) {
  console.error("NO_PAYLOAD_DB — set PAYLOAD_DATABASE_URL or POSTGRES_URL_NON_POOLING");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  connectionTimeoutMillis: 20000,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log("DB_OK");

  await client.query(`
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
      allowed_mime_types = excluded.allowed_mime_types
  `);

  await client.query(`drop policy if exists "Public read cms-media" on storage.objects`);
  await client.query(`
    create policy "Public read cms-media"
      on storage.objects for select
      to public
      using (bucket_id = 'cms-media')
  `);

  await client.query(`drop policy if exists "Authenticated insert cms-media" on storage.objects`);
  await client.query(`
    create policy "Authenticated insert cms-media"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'cms-media')
  `);

  await client.query(`drop policy if exists "Authenticated update cms-media" on storage.objects`);
  await client.query(`
    create policy "Authenticated update cms-media"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'cms-media')
  `);

  await client.query(`drop policy if exists "Authenticated delete cms-media" on storage.objects`);
  await client.query(`
    create policy "Authenticated delete cms-media"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'cms-media')
  `);

  const bucket = await client.query(`select id, public from storage.buckets where id = 'cms-media'`);
  console.log("BUCKET", JSON.stringify(bucket.rows));

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'payload'
      and (
        table_name ilike '%studio%'
        or table_name ilike '%gallery%'
        or table_name ilike '%navigation%'
        or table_name = 'media'
        or table_name = 'pages'
      )
    order by table_name
  `);
  console.log("TABLES", JSON.stringify(tables.rows));
} catch (error) {
  console.error("DB_ERR", error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
