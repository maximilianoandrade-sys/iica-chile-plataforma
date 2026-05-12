-- Agrega campo montoTexto a Project para exponer el monto tal cual
-- viene de la fuente (con su unidad: "8.500 UF", "USD 50,000", etc.)
-- en vez de forzar parseo a número que pierde la unidad o falla con
-- formato chileno ("8.500" interpretado como decimal).
--
-- El campo numérico `monto` se conserva para filtros/ordenamiento.
-- El UI debe preferir montoTexto cuando esté seteado.

ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "montoTexto" TEXT;

-- Backfill desde CNR: el monto está en la descripción (formato
-- "Monto: 8.500 UF."). Lo extraemos a montoTexto para entradas que
-- ya están en DB y aún no fueron reingeridas por el scraper.
-- Tras el reingest del scraper actualizado, montoTexto se mantiene
-- sincronizado vía persistence.upsertProject.
UPDATE "Project"
SET "montoTexto" = SUBSTRING(objetivo FROM 'Monto:\s*([\d.,]+(?:\s*(?:mil\s+)?UF)?)')
WHERE institucion ILIKE '%CNR%'
  AND objetivo ~ 'Monto:\s*[\d.,]+'
  AND "montoTexto" IS NULL;
