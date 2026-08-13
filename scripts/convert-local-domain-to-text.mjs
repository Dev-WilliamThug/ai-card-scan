import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const localUrl = process.env.LOCAL_DATABASE_URL;

if (!localUrl) {
  throw new Error("LOCAL_DATABASE_URL manquant dans .env");
}

const sql = fs.readFileSync(
  path.join(process.cwd(), "prisma/migrations/20260813120000_domain_of_activity_as_string/migration.sql"),
  "utf8"
);

const client = new pg.Client({ connectionString: localUrl });

await client.connect();
await client.query(sql);

const column = await client.query(`
  SELECT data_type, udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Contact'
    AND column_name = 'domainOfActivity'
`);

console.log("domainOfActivity local :", column.rows[0]);
await client.end();
