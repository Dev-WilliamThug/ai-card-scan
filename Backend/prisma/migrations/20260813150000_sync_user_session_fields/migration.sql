-- Sync user and session models with current Prisma schema (better-auth fields)

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banReason" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banExpires" TIMESTAMP(3);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "image" TEXT;

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonatedBy" TEXT;
