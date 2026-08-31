import "dotenv/config";
import { defineConfig } from "prisma/config";

const migrationUrl = process.env["DATABASE_URL"];

if (!migrationUrl) {
  throw new Error(
    "Missing DIRECT_URL or DATABASE_URL. For Supabase, use the Session pooler URL (port 5432), not db.*.supabase.co."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
