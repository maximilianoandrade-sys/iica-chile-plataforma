-- Índices de rendimiento para patrones comunes de filtro + orden
-- Fecha: 2026-05-19
-- Contexto: Las queries más frecuentes filtran por ambito, estado+fecha, needsReview y sourceId

-- Filtro por ambito (usado en runLexicalOnly y hybridSearch)
CREATE INDEX IF NOT EXISTS idx_project_ambito ON "Project" (ambito)
  WHERE ambito IS NOT NULL;

-- Orden por estadoPostulacion + fecha_cierre (orden por defecto en listado)
CREATE INDEX IF NOT EXISTS idx_project_estado_fecha ON "Project" (
  "estadoPostulacion" ASC,
  fecha_cierre ASC
);

-- Filtro parcial needsReview = FALSE (usado cuando includeUnverified es false)
CREATE INDEX IF NOT EXISTS idx_project_needs_review ON "Project" ("needsReview")
  WHERE "needsReview" = FALSE;

-- FK sourceId para JOIN eficiente con tabla Source
CREATE INDEX IF NOT EXISTS idx_project_source_id ON "Project" ("sourceId");
