import "dotenv/config";
import pg from "pg";

const targetUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

async function main() {
  const client = new pg.Client({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log("Tables:", tables.rows.map((row) => row.table_name).join(", "));

  const contactColumns = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Contact'
    ORDER BY ordinal_position
  `);

  console.log("\nContact columns:");
  for (const row of contactColumns.rows) {
    console.log(`- ${row.column_name} (${row.data_type})`);
  }

  const counts = [
    "Tag",
    "Contact",
    "Email",
    "Phone",
    "SocialLink",
    "user",
    "session",
    "account",
    "verification",
  ];

  console.log("\nRow counts:");
  for (const table of counts) {
    try {
      const result = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      console.log(`- ${table}: ${result.rows[0].count}`);
    } catch (error) {
      console.log(`- ${table}: table missing or unreadable`);
    }
  }

  await client.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
