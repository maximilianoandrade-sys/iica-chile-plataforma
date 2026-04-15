-- ============================================================
-- IICA Chile Plataforma — Setup completo de tablas en Supabase
-- Pegar este SQL en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "Usuario" (
  "id"            SERIAL PRIMARY KEY,
  "email"         TEXT UNIQUE NOT NULL,
  "nombre"        TEXT,
  "region"        TEXT,
  "intereses"     TEXT[] DEFAULT '{}',
  "fechaRegistro" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Proyectos (la principal)
CREATE TABLE IF NOT EXISTS "Project" (
  "id"                        SERIAL PRIMARY KEY,
  "nombre"                    TEXT NOT NULL,
  "institucion"               TEXT NOT NULL,
  "monto"                     DOUBLE PRECISION NOT NULL,
  "fecha_cierre"              TIMESTAMPTZ NOT NULL,
  "estado"                    TEXT NOT NULL,
  "categoria"                 TEXT NOT NULL,
  "url_bases"                 TEXT NOT NULL,
  "regiones"                  TEXT[] DEFAULT '{}',
  "beneficiarios"             TEXT[] DEFAULT '{}',
  "monto_min"                 DOUBLE PRECISION,
  "monto_max"                 DOUBLE PRECISION,
  "plazo_meses"               INTEGER,
  "requiere_cofinanciamiento" BOOLEAN DEFAULT FALSE,
  "idioma"                    TEXT DEFAULT 'es',
  "faq_disponible"            BOOLEAN DEFAULT FALSE,
  "webinar_fecha"             TIMESTAMPTZ,
  "permite_adendas"           BOOLEAN DEFAULT FALSE,
  "bases_estado"              TEXT DEFAULT 'published',
  "requiere_firma"            BOOLEAN DEFAULT FALSE,
  "tipos_solicitante"         TEXT[] DEFAULT '{}',
  "checklist"                 TEXT[] DEFAULT '{}',
  "ambito"                    TEXT DEFAULT 'Nacional',
  "estadoPostulacion"         TEXT DEFAULT 'Abierta',
  "viabilidadIICA"            TEXT DEFAULT 'Media',
  "porcentajeViabilidad"      INTEGER,
  "responsableIICA"           TEXT,
  "region"                    TEXT,
  "objetivo"                  TEXT,
  "descripcionIICA"           TEXT,
  "requisitos"                TEXT[] DEFAULT '{}',
  "fortalezas"                TEXT[] DEFAULT '{}',
  "debilidades"               TEXT[] DEFAULT '{}',
  "notasInternas"             TEXT,
  "ejeIICA"                   TEXT,
  "complejidad"               TEXT DEFAULT 'Media',
  "rolIICA"                   TEXT DEFAULT 'Indirecto',
  "createdAt"                 TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt"                 TIMESTAMPTZ DEFAULT NOW(),
  "lastCheckedAt"             TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS "Project_institucion_idx" ON "Project"("institucion");
CREATE INDEX IF NOT EXISTS "Project_estado_idx" ON "Project"("estado");
CREATE INDEX IF NOT EXISTS "Project_fecha_cierre_idx" ON "Project"("fecha_cierre");
CREATE INDEX IF NOT EXISTS "Project_viabilidadIICA_idx" ON "Project"("viabilidadIICA");
CREATE INDEX IF NOT EXISTS "Project_rolIICA_idx" ON "Project"("rolIICA");

-- 3. Tabla de Fondos (oportunidades de financiamiento)
CREATE TABLE IF NOT EXISTS "Fondo" (
  "id"              SERIAL PRIMARY KEY,
  "nombre"          TEXT NOT NULL,
  "descripcion"     TEXT NOT NULL,
  "organismo"       TEXT NOT NULL,
  "montoTotal"      DOUBLE PRECISION,
  "montoTexto"      TEXT,
  "moneda"          TEXT DEFAULT 'USD',
  "paisDestino"     TEXT[] DEFAULT '{}',
  "ods"             INTEGER[] DEFAULT '{}',
  "estado"          TEXT NOT NULL,
  "fechaApertura"   TIMESTAMPTZ,
  "fechaCierre"     TIMESTAMPTZ NOT NULL,
  "fechaScraping"   TIMESTAMPTZ DEFAULT NOW(),
  "documentoTexto"  TEXT,
  "enlaceFuente"    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "Fondo_organismo_idx" ON "Fondo"("organismo");
CREATE INDEX IF NOT EXISTS "Fondo_estado_idx" ON "Fondo"("estado");

-- 4. Tabla de Alertas
CREATE TABLE IF NOT EXISTS "Alerta" (
  "id"         SERIAL PRIMARY KEY,
  "usuarioId"  INTEGER NOT NULL REFERENCES "Usuario"("id"),
  "criterios"  JSONB NOT NULL,
  "frecuencia" TEXT NOT NULL,
  "activo"     BOOLEAN DEFAULT TRUE
);

-- 5. Tabla de Favoritos
CREATE TABLE IF NOT EXISTS "Favorito" (
  "id"         SERIAL PRIMARY KEY,
  "usuarioId"  INTEGER NOT NULL REFERENCES "Usuario"("id"),
  "proyectoId" INTEGER REFERENCES "Project"("id"),
  "fondoId"    INTEGER REFERENCES "Fondo"("id"),
  "notas"      TEXT,
  "createdAt"  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("usuarioId", "proyectoId"),
  UNIQUE("usuarioId", "fondoId")
);

-- 6. Tabla de Postulaciones
CREATE TABLE IF NOT EXISTS "Postulacion" (
  "id"        SERIAL PRIMARY KEY,
  "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"("id"),
  "fondoId"   INTEGER NOT NULL REFERENCES "Fondo"("id"),
  "estado"    TEXT NOT NULL,
  "fecha"     TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Historial de búsquedas
CREATE TABLE IF NOT EXISTS "SearchHistory" (
  "id"        SERIAL PRIMARY KEY,
  "query"     TEXT NOT NULL,
  "results"   INTEGER NOT NULL,
  "filters"   JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");

-- 8. Analytics
CREATE TABLE IF NOT EXISTS "Analytics" (
  "id"         SERIAL PRIMARY KEY,
  "event"      TEXT NOT NULL,
  "properties" JSONB,
  "userAgent"  TEXT,
  "ipHash"     TEXT,
  "createdAt"  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Analytics_event_idx" ON "Analytics"("event");
CREATE INDEX IF NOT EXISTS "Analytics_createdAt_idx" ON "Analytics"("createdAt");

-- 9. Verificación de enlaces
CREATE TABLE IF NOT EXISTS "LinkCheck" (
  "id"          SERIAL PRIMARY KEY,
  "url"         TEXT UNIQUE NOT NULL,
  "status"      TEXT NOT NULL,
  "statusCode"  INTEGER,
  "lastChecked" TIMESTAMPTZ DEFAULT NOW(),
  "isValid"     BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS "LinkCheck_url_idx" ON "LinkCheck"("url");

-- 10. Suscriptores newsletter
CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
  "id"        SERIAL PRIMARY KEY,
  "email"     TEXT UNIQUE NOT NULL,
  "name"      TEXT,
  "verified"  BOOLEAN DEFAULT FALSE,
  "token"     TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");

-- ============================================================
-- ✅ LISTO. Si ves "Success. No rows returned" significa que
--    todas las tablas se crearon correctamente.
-- ============================================================
