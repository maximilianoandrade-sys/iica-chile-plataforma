-- Add relevanciaChile field to Project table
-- Default true for existing national projects, false for Devex/Internacional
-- Run: psql $DATABASE_URL < scripts/sql/2026-06-30-relevancia-chile.sql

ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "relevanciaChile" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: mark existing Devex projects as NOT chile-relevant
-- unless their region is Chile or title/description mentions Chile
UPDATE "Project"
SET "relevanciaChile" = false
WHERE "ambito" = 'Internacional'
  AND "institucion" = 'Devex'
  AND COALESCE("region", '') NOT ILIKE '%chile%'
  AND COALESCE("nombre", '') NOT ILIKE '%chile%'
  AND COALESCE("objetivo", '') NOT ILIKE '%chile%';

-- Mark Devex projects that DO mention Chile as relevant
UPDATE "Project"
SET "relevanciaChile" = true
WHERE "ambito" = 'Internacional'
  AND "institucion" = 'Devex'
  AND (
    COALESCE("region", '') ILIKE '%chile%'
    OR COALESCE("nombre", '') ILIKE '%chile%'
    OR COALESCE("objetivo", '') ILIKE '%chile%'
  );

-- Index for filtering
CREATE INDEX IF NOT EXISTS "Project_relevanciaChile_idx" ON "Project"("relevanciaChile");
