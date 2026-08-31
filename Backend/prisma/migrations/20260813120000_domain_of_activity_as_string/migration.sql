-- AlterTable
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "domainOfActivity" TEXT DEFAULT 'AUTRE';

-- Convert enum column to text if it was previously created as enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Contact'
      AND column_name = 'domainOfActivity'
      AND udt_name = 'DomainOfActivity'
  ) THEN
    ALTER TABLE "Contact" ALTER COLUMN "domainOfActivity" DROP DEFAULT;
    ALTER TABLE "Contact" ALTER COLUMN "domainOfActivity" TYPE TEXT USING "domainOfActivity"::TEXT;
    ALTER TABLE "Contact" ALTER COLUMN "domainOfActivity" SET DEFAULT 'AUTRE';
  END IF;
END $$;

DROP TYPE IF EXISTS "DomainOfActivity";
