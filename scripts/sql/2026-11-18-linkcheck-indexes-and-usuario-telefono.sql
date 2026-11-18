-- ============================================================================
-- Migración: Índices de rendimiento para LinkCheck y soporte teléfono en Usuario
-- Fecha: 18 de Noviembre de 2026
-- ============================================================================

-- Asegurar columna last_modified en LinkCheck
ALTER TABLE "LinkCheck" ADD COLUMN IF NOT EXISTS "last_modified" TEXT;

-- Índices B-tree en LinkCheck para optimizar consultas de enlaces y cron
CREATE INDEX IF NOT EXISTS "idx_linkcheck_is_valid" ON "LinkCheck" ("isValid");
CREATE INDEX IF NOT EXISTS "idx_linkcheck_last_checked" ON "LinkCheck" ("lastChecked");

-- Columna de teléfono en Usuario para WhatsApp
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "telefono" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_usuario_telefono" ON "Usuario" ("telefono");
