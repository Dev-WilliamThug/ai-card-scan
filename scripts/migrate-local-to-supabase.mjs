import "dotenv/config";
import pg from "pg";

const LOCAL_URL = process.env.LOCAL_DATABASE_URL;
const REMOTE_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

const TABLES_IN_ORDER = [
  { table: "Tag", pk: "tag_id" },
  { table: "user", pk: "id" },
  { table: "Contact", pk: "contact_id" },
  { table: "Email", pk: "email_id" },
  { table: "Phone", pk: "phone_id" },
  { table: "SocialLink", pk: "socialLink_id" },
  { table: "session", pk: "id" },
  { table: "account", pk: "id" },
  { table: "verification", pk: "id" },
];

function createClient(connectionString) {
  const isSupabase = connectionString.includes("supabase");

  return new pg.Client({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });
}

async function tableExists(client, table) {
  const result = await client.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [table]
  );

  return result.rows[0]?.exists === true;
}

async function getColumns(client, table) {
  const result = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );

  return result.rows.map((row) => row.column_name);
}

async function countRows(client, table) {
  const result = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
  return result.rows[0]?.count ?? 0;
}

async function copyTable(local, remote, table, pk) {
  const existsLocally = await tableExists(local, table);
  if (!existsLocally) {
    console.log(`- ${table} : absent en local, ignoré`);
    return 0;
  }

  const localCount = await countRows(local, table);
  if (localCount === 0) {
    console.log(`- ${table} : 0 ligne`);
    return 0;
  }

  const localColumns = await getColumns(local, table);
  const remoteColumns = await getColumns(remote, table);
  const columns = localColumns.filter((column) => remoteColumns.includes(column));

  if (columns.length === 0) {
    console.log(`- ${table} : colonnes incompatibles, ignoré`);
    return 0;
  }

  const quotedColumns = columns.map((column) => `"${column}"`).join(", ");
  const rows = await local.query(`SELECT ${quotedColumns} FROM "${table}"`);

  await remote.query("BEGIN");

  try {
    for (const row of rows.rows) {
      const values = columns.map((_, index) => `$${index + 1}`);
      const params = columns.map((column) => row[column]);

      await remote.query(
        `INSERT INTO "${table}" (${quotedColumns})
         VALUES (${values.join(", ")})
         ON CONFLICT ("${pk}") DO NOTHING`,
        params
      );
    }

    await remote.query("COMMIT");
    console.log(`- ${table} : ${rows.rowCount} ligne(s) copiée(s)`);
    return rows.rowCount;
  } catch (error) {
    await remote.query("ROLLBACK");
    throw error;
  }
}

async function backfillCompanyFields(local) {
  const hasCompany = await tableExists(local, "Company");
  const contactColumns = await getColumns(local, "Contact");

  if (!hasCompany || !contactColumns.includes("company_id")) {
    return;
  }

  if (!contactColumns.includes("companyName")) {
    await local.query(`ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "companyName" TEXT`);
  }
  if (!contactColumns.includes("companyAddress")) {
    await local.query(`ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "companyAddress" TEXT`);
  }
  if (!contactColumns.includes("companyWebsite")) {
    await local.query(`ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "companyWebsite" TEXT`);
  }

  await local.query(`
    UPDATE "Contact" AS c
    SET
      "companyName" = COALESCE(c."companyName", co."name"),
      "companyAddress" = COALESCE(c."companyAddress", co."address"),
      "companyWebsite" = COALESCE(c."companyWebsite", co."website")
    FROM "Company" AS co
    WHERE c."company_id" = co."company_id"
  `);

  console.log("- Company : données fusionnées dans Contact");
}

async function main() {
  if (!LOCAL_URL) {
    throw new Error(
      "LOCAL_DATABASE_URL manquant. Exemple : postgresql://postgres:password@localhost:5432/ai_card_scan"
    );
  }

  if (!REMOTE_URL) {
    throw new Error("DIRECT_URL ou DATABASE_URL manquant pour Supabase.");
  }

  const local = createClient(LOCAL_URL);
  const remote = createClient(REMOTE_URL);

  console.log("Connexion aux bases...");
  await local.connect();
  await remote.connect();
  console.log("Connexions OK\n");

  await backfillCompanyFields(local);

  let total = 0;

  for (const { table, pk } of TABLES_IN_ORDER) {
    total += await copyTable(local, remote, table, pk);
  }

  console.log(`\nMigration terminée : ${total} ligne(s) traitées.`);

  await local.end();
  await remote.end();
}

main().catch((error) => {
  console.error("Erreur migration :", error.message);
  process.exit(1);
});
