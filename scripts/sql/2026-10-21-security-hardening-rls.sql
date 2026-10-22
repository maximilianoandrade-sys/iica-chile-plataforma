-- ============================================================================
-- MIGRACIÓN DE SEGURIDAD: ROW LEVEL SECURITY (RLS) EN SUPABASE POSTGRES
-- Fecha: Octubre 2026
-- Objetivo: Proteger las tablas contra accesos no autorizados a través de
-- PostgREST / Data API de Supabase mediante políticas de mínimo privilegio.
-- ============================================================================

-- 1. Habilitar Row Level Security en todas las tablas existentes
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Source" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alerta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorito" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SearchHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LinkCheck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza de políticas previas si existieran
DROP POLICY IF EXISTS "Public can view publishable projects" ON "Project";
DROP POLICY IF EXISTS "Public can view enabled sources" ON "Source";
DROP POLICY IF EXISTS "Service role full access on Project" ON "Project";
DROP POLICY IF EXISTS "Service role full access on Source" ON "Source";
DROP POLICY IF EXISTS "Service role full access on Usuario" ON "Usuario";
DROP POLICY IF EXISTS "Service role full access on Alerta" ON "Alerta";
DROP POLICY IF EXISTS "Service role full access on Favorito" ON "Favorito";
DROP POLICY IF EXISTS "Service role full access on SearchHistory" ON "SearchHistory";
DROP POLICY IF EXISTS "Service role full access on Analytics" ON "Analytics";
DROP POLICY IF EXISTS "Service role full access on LinkCheck" ON "LinkCheck";
DROP POLICY IF EXISTS "Service role full access on NewsletterSubscriber" ON "NewsletterSubscriber";

-- 3. Políticas para tabla 'Project'
-- Lectura pública permitida únicamente para proyectos publicados y elegibles
CREATE POLICY "Public can view publishable projects"
  ON "Project"
  FOR SELECT
  TO anon, authenticated
  USING (publishable = true AND "relevanciaChile" = true);

-- Bloqueo total de escritura pública (insert/update/delete)
-- Solo el backend vía service_role / superuser (Prisma) puede modificar proyectos
CREATE POLICY "Service role full access on Project"
  ON "Project"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Políticas para tabla 'Source'
-- Lectura pública restringida a fuentes habilitadas
CREATE POLICY "Public can view enabled sources"
  ON "Source"
  FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

CREATE POLICY "Service role full access on Source"
  ON "Source"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Tablas sensibles / privadas (Usuario, Alerta, Favorito, Newsletter, Analytics, etc.)
-- Acceso restringido exclusivamente a service_role (backend autenticado)
CREATE POLICY "Service role full access on Usuario"
  ON "Usuario"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on Alerta"
  ON "Alerta"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on Favorito"
  ON "Favorito"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on SearchHistory"
  ON "SearchHistory"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on Analytics"
  ON "Analytics"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on LinkCheck"
  ON "LinkCheck"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on NewsletterSubscriber"
  ON "NewsletterSubscriber"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Revocar privilegios directos de escritura en esquema público para roles anon/authenticated
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON "Project", "Source" TO anon, authenticated;
