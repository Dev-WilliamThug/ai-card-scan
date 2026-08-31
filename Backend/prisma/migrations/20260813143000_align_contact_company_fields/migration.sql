-- Align Contact with current Prisma schema (inline company fields)

ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "companyAddress" TEXT;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "companyWebsite" TEXT;

-- Backfill from legacy Company table when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Company'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Contact' AND column_name = 'company_id'
  ) THEN
    UPDATE "Contact" AS c
    SET
      "companyName" = COALESCE(c."companyName", co."name"),
      "companyAddress" = COALESCE(c."companyAddress", co."address"),
      "companyWebsite" = COALESCE(c."companyWebsite", co."website")
    FROM "Company" AS co
    WHERE c."company_id" = co."company_id";
  END IF;
END $$;

ALTER TABLE "Contact" DROP CONSTRAINT IF EXISTS "Contact_company_id_fkey";
ALTER TABLE "Contact" DROP COLUMN IF EXISTS "company_id";

DROP TABLE IF EXISTS "Company";
