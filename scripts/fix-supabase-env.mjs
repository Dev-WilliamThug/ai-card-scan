import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "tavpggchexzluzwzodzh";
const HOST_PATTERNS = (region) => [
  `aws-0-${region}.pooler.supabase.com`,
  `aws-1-${region}.pooler.supabase.com`,
  `aws-${region}.pooler.supabase.com`,
];

function parseDatabaseUrl(rawUrl) {
  const url = new URL(rawUrl);
  return {
    password: decodeURIComponent(url.password),
    user: decodeURIComponent(url.username),
  };
}

function buildPoolerUrl(host, password, port) {
  const params = new URLSearchParams({ sslmode: "require" });
  if (port === 6543) {
    params.set("pgbouncer", "true");
  }

  return `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@${host}:${port}/postgres?${params.toString()}`;
}

const REGIONS = [
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "eu-north-1",
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "ap-southeast-1",
  "ap-northeast-1",
  "ap-south-1",
  "sa-east-1",
];

async function canConnect(connectionString) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function main() {
  const currentUrl = process.env.DATABASE_URL;
  if (!currentUrl) {
    throw new Error("DATABASE_URL manquant dans .env");
  }

  const { password } = parseDatabaseUrl(currentUrl);
  let matchedHost = null;

  for (const region of REGIONS) {
    for (const host of HOST_PATTERNS(region)) {
      const sessionUrl = buildPoolerUrl(host, password, 5432);
      process.stdout.write(`Test ${host}... `);

      if (await canConnect(sessionUrl)) {
        matchedHost = host;
        console.log("OK");
        break;
      }

      console.log("non");
    }

    if (matchedHost) break;
  }

  if (!matchedHost) {
    throw new Error(
      "Impossible de joindre Supabase via le pooler. Copie les URLs depuis Supabase > Connect > ORMs > Prisma."
    );
  }

  const databaseUrl = buildPoolerUrl(matchedHost, password, 6543);
  const directUrl = buildPoolerUrl(matchedHost, password, 5432);

  const envPath = path.join(process.cwd(), ".env");
  let envContent = fs.readFileSync(envPath, "utf8");

  if (/^DATABASE_URL=/m.test(envContent)) {
    envContent = envContent.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${databaseUrl}"`);
  } else {
    envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
  }

  if (/^DIRECT_URL=/m.test(envContent)) {
    envContent = envContent.replace(/^DIRECT_URL=.*$/m, `DIRECT_URL="${directUrl}"`);
  } else {
    envContent += `DIRECT_URL="${directUrl}"\n`;
  }

  fs.writeFileSync(envPath, envContent);

  console.log(`\nPooler détecté : ${matchedHost}`);
  console.log(".env mis à jour avec les URLs pooler Supabase.");
  console.log("Lance ensuite : npm run db:migrate");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
