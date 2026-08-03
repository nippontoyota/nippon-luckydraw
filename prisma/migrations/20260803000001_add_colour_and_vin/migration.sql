-- Align production entries with Prisma schema (colourId + vin + colours table)
-- Extra columns customerLocation/interestedInPurchase are left in place; Prisma ignores them.

CREATE TABLE IF NOT EXISTS "colours" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    CONSTRAINT "colours_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "colours_modelId_name_key" ON "colours"("modelId", "name");

DO $$ BEGIN
  ALTER TABLE "colours"
    ADD CONSTRAINT "colours_modelId_fkey"
    FOREIGN KEY ("modelId") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "colours" ("id", "name", "modelId")
SELECT 'placeholder-' || m.id, 'Unknown', m.id
FROM "models" m
ON CONFLICT DO NOTHING;

ALTER TABLE "entries" ADD COLUMN IF NOT EXISTS "colourId" TEXT;
ALTER TABLE "entries" ADD COLUMN IF NOT EXISTS "vin" TEXT;

UPDATE "entries" e
SET "colourId" = 'placeholder-' || e."modelId"
WHERE e."colourId" IS NULL AND e."modelId" IS NOT NULL;

UPDATE "entries"
SET "vin" = 'UNKNOWN-' || UPPER(SUBSTRING(id FROM 1 FOR 12))
WHERE "vin" IS NULL;

DELETE FROM "entries" WHERE "modelId" IS NULL OR "colourId" IS NULL OR "vin" IS NULL;

ALTER TABLE "entries" ALTER COLUMN "modelId" SET NOT NULL;
ALTER TABLE "entries" ALTER COLUMN "colourId" SET NOT NULL;
ALTER TABLE "entries" ALTER COLUMN "vin" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "entries_vin_key" ON "entries"("vin");
CREATE INDEX IF NOT EXISTS "entries_vin_idx" ON "entries"("vin");

DO $$ BEGIN
  ALTER TABLE "entries"
    ADD CONSTRAINT "entries_colourId_fkey"
    FOREIGN KEY ("colourId") REFERENCES "colours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;