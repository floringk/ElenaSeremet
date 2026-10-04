import "dotenv/config";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local", override: true });

const url = (
  process.env.PAYLOAD_DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  ""
).trim();

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
const users = await client.query("select count(*)::int as n from payload.users");
const tables = await client.query(`
  select table_name
  from information_schema.tables
  where table_schema = 'payload'
  order by table_name
`);
console.log("USERS", users.rows[0].n);
console.log(
  "TABLES",
  tables.rows.map((r) => r.table_name).join(", ")
);
await client.end();
