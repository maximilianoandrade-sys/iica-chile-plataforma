-- One-shot cleanup for production/staging data quality
-- Closes projects that are still marked as open-like but already expired.

WITH closed_abierta AS (
  UPDATE "Project"
  SET "estadoPostulacion" = 'Cerrada',
      "updatedAt" = NOW(),
      "notasInternas" = COALESCE("notasInternas", '') ||
        CASE WHEN COALESCE("notasInternas", '') = '' THEN '' ELSE E'\n' END ||
        '[cleanup 2026-06-01] cierre automatico por fecha_cierre vencida (estado Abierta)'
  WHERE "estadoPostulacion" = 'Abierta'
    AND "fecha_cierre" < date_trunc('day', NOW())
  RETURNING id
),
closed_proxima AS (
  UPDATE "Project"
  SET "estadoPostulacion" = 'Cerrada',
      "updatedAt" = NOW(),
      "notasInternas" = COALESCE("notasInternas", '') ||
        CASE WHEN COALESCE("notasInternas", '') = '' THEN '' ELSE E'\n' END ||
        '[cleanup 2026-06-01] cierre automatico por fecha_cierre vencida (estado Próxima)'
  WHERE "estadoPostulacion" = 'Próxima'
    AND "fecha_cierre" < date_trunc('day', NOW())
  RETURNING id
)
SELECT
  (SELECT COUNT(*) FROM closed_abierta) AS closed_from_abierta,
  (SELECT COUNT(*) FROM closed_proxima) AS closed_from_proxima;
