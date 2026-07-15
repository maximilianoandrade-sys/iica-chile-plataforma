-- ============================================================================
-- Migración: persistence de cambios para el monitor de actualizaciones.
-- Agrega last_modified a LinkCheck para detectar cambios entre corridas
-- (el estado en memoria no sobrevive en Vercel Serverless).
-- ============================================================================

ALTER TABLE "LinkCheck"
ADD COLUMN IF NOT EXISTS "last_modified" TEXT;
