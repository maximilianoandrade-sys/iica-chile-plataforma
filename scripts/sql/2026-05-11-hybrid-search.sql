-- ============================================================================
-- Migración manual: búsqueda híbrida (tsvector + pgvector)
-- Aplicar UNA VEZ post-deploy de la rama feat/gemini-and-linkguardian-kari.
--
-- Por qué manual: Prisma no soporta nativamente tipos pgvector ni columnas
-- GENERATED de tsvector. Se aplica fuera del migrate normal.
--
-- En Supabase: ejecutar desde SQL Editor.
-- En local Docker: docker exec iica-postgres psql -U iica -d iica_local -f <este_archivo>
-- ============================================================================

-- 1) Habilitar pgvector (en Supabase está disponible por default)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Columna de embedding semántico (Gemini text-embedding-004 → 768 dims)
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3) Columna tsvector GENERATED (full-text search en español)
-- Pesos: A=título (más relevante), B=institución, C=objetivo, D=descripción
ALTER TABLE "Project"
DROP COLUMN IF EXISTS search_vector;
ALTER TABLE "Project"
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('spanish', coalesce(nombre, '')), 'A') ||
  setweight(to_tsvector('spanish', coalesce(institucion, '')), 'B') ||
  setweight(to_tsvector('spanish', coalesce(objetivo, '')), 'C') ||
  setweight(to_tsvector('spanish', coalesce("descripcionIICA", '')), 'D')
) STORED;

-- 4) Índice GIN para búsqueda lexical rápida
CREATE INDEX IF NOT EXISTS idx_project_search_vector
ON "Project" USING GIN (search_vector);

-- 5) Índice IVFFlat para búsqueda vectorial (cosine similarity)
-- lists=100 razonable para 60-10k docs. Para >10k considerar lists=sqrt(N) o HNSW.
CREATE INDEX IF NOT EXISTS idx_project_embedding
ON "Project" USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 6) Función SQL para búsqueda híbrida con Reciprocal Rank Fusion (RRF)
-- Combina ranking lexical (tsvector @@) + semántico (embedding cosine)
-- usando RRF: 1/(60 + rank). El constante 60 es el "k" estándar de Cormack 2009.
CREATE OR REPLACE FUNCTION match_projects_hybrid(
  query_text TEXT,
  query_embedding vector(768),
  match_limit INT DEFAULT 50,
  include_unverified BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id INT,
  rrf_score FLOAT,
  lexical_rank FLOAT,
  semantic_rank FLOAT
)
LANGUAGE SQL STABLE
AS $$
  WITH lexical AS (
    SELECT
      p.id,
      ts_rank(p.search_vector, plainto_tsquery('spanish', query_text)) AS rank,
      ROW_NUMBER() OVER (ORDER BY ts_rank(p.search_vector, plainto_tsquery('spanish', query_text)) DESC) AS rownum
    FROM "Project" p
    WHERE
      p.search_vector @@ plainto_tsquery('spanish', query_text)
      AND (include_unverified OR p."needsReview" = FALSE)
    LIMIT 100
  ),
  semantic AS (
    SELECT
      p.id,
      1 - (p.embedding <=> query_embedding) AS rank,
      ROW_NUMBER() OVER (ORDER BY p.embedding <=> query_embedding) AS rownum
    FROM "Project" p
    WHERE
      p.embedding IS NOT NULL
      AND (include_unverified OR p."needsReview" = FALSE)
    ORDER BY p.embedding <=> query_embedding
    LIMIT 100
  ),
  combined AS (
    SELECT
      COALESCE(l.id, s.id) AS id,
      COALESCE(1.0 / (60 + l.rownum), 0.0) + COALESCE(1.0 / (60 + s.rownum), 0.0) AS rrf,
      COALESCE(l.rank, 0.0) AS lex_rank,
      COALESCE(s.rank, 0.0) AS sem_rank
    FROM lexical l
    FULL OUTER JOIN semantic s ON l.id = s.id
  )
  SELECT
    c.id, c.rrf, c.lex_rank, c.sem_rank
  FROM combined c
  ORDER BY c.rrf DESC
  LIMIT match_limit;
$$;

-- 7) Función helper: solo semántica (cuando query es muy difusa)
CREATE OR REPLACE FUNCTION match_projects_semantic(
  query_embedding vector(768),
  match_limit INT DEFAULT 20,
  include_unverified BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (id INT, similarity FLOAT)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    1 - (embedding <=> query_embedding) AS similarity
  FROM "Project"
  WHERE
    embedding IS NOT NULL
    AND (include_unverified OR "needsReview" = FALSE)
  ORDER BY embedding <=> query_embedding
  LIMIT match_limit;
$$;

-- ============================================================================
-- Verificación post-migración:
--   SELECT extname FROM pg_extension WHERE extname='vector';
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='Project' AND column_name IN ('embedding','search_vector');
--   SELECT indexname FROM pg_indexes
--     WHERE tablename='Project' AND indexname LIKE 'idx_project_%';
-- ============================================================================
