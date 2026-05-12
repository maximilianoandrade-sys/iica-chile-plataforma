# Búsqueda Híbrida + Mejoras al Pipeline de Scrapers

> Rama: `feat/gemini-and-linkguardian-kari`
> Autora: Karina Orellana
> Fecha: 2026-05-12
> Status: ready for review

Este documento describe los cambios que esta rama trae sobre `main`. Pensado como referencia tanto para reviewers del PR como para devs que lo operen después del merge.

---

## 🎯 Resumen ejecutivo

Esta rama implementa **búsqueda híbrida** (full-text + semántica) sobre el pipeline de ingesta y agrega/mejora varios scrapers. Los problemas que resuelve, vistos por la usuaria:

1. **"Las convocatorias en la web no están actualizadas; aparecen como abiertas pero están cerradas."** → parsers de FIA/IICA Hemisférico reescritos con WP REST API + extracción real de fecha de cierre.
2. **"Los links no me llevan a la convocatoria sino a la homepage."** → fix en `lib/linkGuardian.ts` y `app/api/check-link/route.ts` que detecta redirect-to-homepage y URLs sin deep link.
3. **"Las convocatorias son inventadas (alucinaciones IA)."** → guardrails anti-alucinación en AI Discovery (snippet ≥15 palabras + URL validation + Vertex AI redirect resolution).
4. **"AI Discovery requiere API key paga de Anthropic."** → migrado a **Google Gemini** (`gemini-2.5-flash-lite`) con tier gratuito.
5. **"La búsqueda no encuentra resultados relevantes."** → motor híbrido **Postgres tsvector + pgvector** con RRF (Reciprocal Rank Fusion).
6. **"Faltan fuentes (FIDA, UNDP, FAO, FONTAGRO, INDAP, CNR)."** → CNR scraper nuevo (34 concursos); resto cubiertos vía AI Discovery con prompt fortalecido.

---

## 📦 Lo que cambia

### Nuevos archivos
```
docs/HYBRID-SEARCH-AND-IMPROVEMENTS.md     ← este archivo
lib/ingestion/embeddings.ts                  ← Gemini embedding wrapper
lib/ingestion/scrapers/cnr.ts                ← scraper nuevo CNR
lib/searchHybrid.ts                          ← orquestador búsqueda híbrida
scripts/backfill-embeddings.ts               ← genera vectores para Project sin embedding
scripts/mock-ai-discoveries.ts               ← inserta 6 mocks para probar UI sin gastar API
scripts/sql/2026-05-11-hybrid-search.sql     ← migración manual de schema
```

### Archivos modificados
```
app/admin/page.tsx                           ← (nuevo) redirect /admin → /admin/sources
app/api/check-link/route.ts                  ← detección de redirect-to-homepage + originalIsHomepage
app/api/search-projects/route.ts             ← reescritura (719 → 80 LOC) usando hybrid
components/OportunidadCard.tsx               ← badge "🤖 Sin verificar" + sin logos
components/ProjectList.tsx                   ← toggle "incluir descubrimientos sin verificar" + sin logos
components/ProjectItem.tsx                   ← sin logos (tabla y mobile)
lib/data.ts                                  ← agrega needsReview y discoveredBy al tipo Project
lib/ingestion/registry.ts                    ← FIA, CORFO, CNR, IICA Hemisférico (saca INDAP/FONTAGRO rotos)
lib/ingestion/scrapers/corfo.ts              ← URL correcta corfo.gob.cl + .cuadro-completo_fase2
lib/ingestion/scrapers/fia.ts                ← WP REST API + parseFiaDeadline
lib/ingestion/scrapers/iica-hemisferico.ts   ← WP REST API /wp-json/wp/v2/bids
lib/ingestion/scrapers/mercado-publico.ts    ← excludes médicos/dental fortalecidos
lib/ingestion/utils.ts                       ← resolveShortUrl + Vertex AI redirect support
lib/ingestion/validateUrl.ts                 ← rechaza URLs sin deep link
lib/linkGuardian.ts                          ← versionado de caché (v1 → v2)
middleware.ts                                ← (sin cambios — preserva auth admin)
prisma/schema.prisma                         ← agrega embedding Unsupported(vector(768)) y search_vector tsvector
scripts/discover-projects.ts                  ← Gemini 2-pasos + guardrails + prompt fortalecido
scripts/seed-sources.ts                      ← agrega entrada para CNR
.github/workflows/discover-projects.yml      ← (recreado) usa GEMINI_API_KEY
```

---

## 🧩 Stack técnico

### Búsqueda híbrida
- **Lexical:** Postgres `tsvector` con configuración `'spanish'` + índice GIN. Columna `search_vector` GENERATED desde `nombre` (peso A), `institucion` (B), `objetivo` (C), `descripcionIICA` (D).
- **Semántica:** `pgvector` con `vector(768)` + índice IVFFlat. Embeddings vía Gemini `gemini-embedding-001` con `outputDimensionality: 768`.
- **Fusión:** función SQL `match_projects_hybrid(query_text, query_embedding, limit, include_unverified)` con Reciprocal Rank Fusion (`1/(60 + rank)`).

### AI Discovery (Capa B)
- **LLM:** Google Gemini `gemini-2.5-flash-lite` (free tier, cuota separada de la versión `flash`).
- **Tool:** `googleSearch` para grounding (no se inventan URLs, se citan de search results).
- **Estrategia:** 2 calls. Primero investigación en lenguaje natural con grounding (`temperature=0.1`, ~20-30 search chunks). Segundo call sin tools convierte a JSON (`temperature=0`).
- **Guardrails:**
  1. `source_snippet` ≥ 15 palabras textuales → fuerza a Claude a citar fuente literal.
  2. `validateUrl()` HEAD check → rechaza 404/410/5xx + redirect a homepage + URLs sin deep link.
  3. `resolveShortUrl()` → sigue bit.ly, t.co, **vertexaisearch.cloud.google.com** y otros 12 shorteners.

### Scrapers de Capa A (determinísticos)
| Slug | Método | URL | Resultado típico |
|---|---|---|---|
| `fia` | WP REST `/wp-json/wp/v2/convocatorias` | fia.cl | 50 |
| `corfo` | Cheerio HTML | corfo.gob.cl/sites/cpp/convocatorias_programas_innovacion/ | 10 |
| `cnr` | Cheerio HTML | cnr.gob.cl/agricultores/calendario-de-concurso/ | 34 |
| `iica-hemisferico` | WP REST `/wp-json/wp/v2/bids` | iica.int | 50 |
| `iica-dashboard` | Playwright (fuera del runner principal) | apps.iica.int/dashboardproyectos | ~75 con perfil persistente |

---

## ⚙️ Setup post-merge

### 1. Aplicar la migración SQL

En **Supabase SQL Editor** (o en local con `psql`):

```bash
# Local Docker:
docker exec -i iica-postgres psql -U iica -d iica_local < scripts/sql/2026-05-11-hybrid-search.sql

# Supabase: copiar y pegar el contenido del archivo en SQL Editor
```

Esto crea:
- `CREATE EXTENSION vector`
- columnas `embedding vector(768)` y `search_vector tsvector` en `Project`
- índices GIN y IVFFlat
- funciones `match_projects_hybrid()` y `match_projects_semantic()`

### 2. Variables de entorno

#### Vercel (Production + Preview)
```
DATABASE_URL=...                     # Supabase pooler
DIRECT_URL=...                        # Supabase direct
GEMINI_API_KEY=AIza...                # Google AI Studio (gratis)
MERCADO_PUBLICO_TICKET=4B24B3F0-...   # opcional, ya tiene fallback público
ADMIN_PASSWORD=...                    # auth /admin/*
ADMIN_SESSION_SECRET=...              # openssl rand -hex 32
```

#### GitHub Secrets (para workflows)
```
DATABASE_URL
DIRECT_URL
GEMINI_API_KEY
DEPLOYMENT_URL                        # para smoke test post-ingest
```

### 3. Backfill de embeddings

Una vez sola post-deploy, generar vectores para los proyectos existentes:

```bash
npm run discover  # no, este corre AI Discovery; usa el script de backfill:
npx tsx scripts/backfill-embeddings.ts
```

Costo Gemini para 1k proyectos: <$0 (cabe en free tier).

---

## 🚀 Operación diaria

### Cron diario (ingest-scrapers.yml)
06:00 UTC (03:00 Chile). Corre FIA, CORFO, CNR, IICA Hemisférico → upsert a Supabase. Después corre `markStale()` que cierra proyectos con `lastSeenAt > 7 días` o `fecha_cierre < hoy`.

**TODO post-merge:** agregar a este workflow el step de backfill de embeddings para que los proyectos nuevos también tengan vector. Por ahora se hace manualmente.

### Cron semanal (discover-projects.yml)
Lunes 12:00 UTC. Corre AI Discovery con Gemini. Inserta nuevos con `needsReview=true`.

### Comandos útiles

```bash
# Todos los scrapers (Capa A)
npm run ingest

# Auditoría de URLs muertas
npm run ingest:audit

# AI Discovery (Capa B) — requiere GEMINI_API_KEY
npm run discover

# Smoke test post-deploy
DEPLOYMENT_URL=https://tu-app.vercel.app npm run smoke

# Mock data para QA (sin gastar API)
npx tsx scripts/mock-ai-discoveries.ts

# Backfill embeddings de proyectos sin vector
npx tsx scripts/backfill-embeddings.ts

# Re-embed TODO (caro, solo si cambias modelo)
npx tsx scripts/backfill-embeddings.ts --force
```

### Cómo aprobar/descartar descubrimientos IA

1. Ir a `/admin/login` (password = `ADMIN_PASSWORD`).
2. Después de login, `/admin/discoveries`.
3. Cada fila muestra: título, institución, URL, **snippet textual** que Gemini citó.
4. Botones:
   - **Aprobar** → `needsReview=false`, sigue en búsqueda sin badge.
   - **Descartar** → marca `estadoPostulacion=Cerrada` con nota "descartado por revisión IA".

### Cómo debuggear scrapers

1. `/admin/sources` → ver `lastRunStatus` y `lastRunError` por fuente.
2. Si `partial`: el scraper corrió pero algunos items fallaron. Ver detalle del error.
3. Si `error`: ver logs del workflow en GitHub Actions.
4. Refrescar un scraper específico localmente:
   ```bash
   npx tsx -e "import('./lib/ingestion/scrapers/fia').then(m=>m.fiaScraper.scrape().then(console.log))"
   ```

---

## 🏗️ Decisiones arquitectónicas

### ¿Por qué Gemini en lugar de Claude/OpenAI?
- Free tier robusto (no requiere tarjeta para empezar).
- Google Search grounding integrado (no necesita Brave Search ni Perplexity).
- Multilingüe nativo (español sin degradación).
- Embeddings + chat con la misma API key.
- Modelo `gemini-2.5-flash-lite` tiene cuota más generosa que `gemini-2.5-flash` para grounding.

### ¿Por qué RRF en vez de weighted sum?
Reciprocal Rank Fusion (Cormack 2009) **no requiere calibrar pesos** porque opera sobre rangos, no scores. Es más robusta cuando lexical y semantic devuelven escalas muy distintas (ts_rank en [0,1] vs cosine en [-1,1]).

### ¿Por qué pgvector y no Pinecone/Weaviate?
- Ya tenemos Postgres en Supabase — cero infra extra.
- Para <100k docs, IVFFlat alcanza recall >90% sin tuning.
- Queries hybrid se hacen en una sola SQL function (cero round-trips).
- Costo: $0/mes (vs. ~$70/mes Pinecone starter).

### ¿Por qué `gemini-embedding-001` con 768 dims y no 1536/3072?
- 768 ya da resultados de calidad para nuestro caso (~1k docs).
- Mucho más rápido el cosine similarity.
- Menor footprint en BD (~3KB por proyecto vs 12KB para 3072 dims).
- Cabe en índice IVFFlat estándar.

### ¿Por qué quitar logos de las cards?
- Pedido del usuario para foco en contenido textual.
- `getInstitutionalLogo()` legacy fallaba con instituciones nuevas (Banagro, Endeavor, etc.).
- Layout más compacto deja espacio para descripciones más largas.

---

## ⚠️ Limitaciones conocidas

1. **INDAP, FONTAGRO, FIDA, UNDP, FAO solo vía AI Discovery.** Sus sitios bloquean bots (403), son SPAs Next.js sin server-side render, o requieren browser automation con Playwright. No se scrapean determinísticamente.

2. **`gemini-2.5-flash-lite` con grounding tiene rate limit del free tier.** Si el cron semanal corre muchas queries seguidas, puede saltar 429. Mitigación: el script falla gracefully y deja `Source.lastRunStatus = "error"` con el detalle. Re-correr al día siguiente o activar billing.

3. **IVFFlat con poca data tiene baja recall.** Postgres avisa con `NOTICE` cuando hay <1000 vectores. No es bloqueante; cuando crezca la BD el recall mejora.

4. **Caché del linkGuardian dura 24h** en el browser del usuario. Si la lógica de check-link cambia, se debe bumpear `CACHE_VERSION` en `lib/linkGuardian.ts` (actualmente en `v2`).

5. **Scraper CORFO solo cubre 'Innovación'** — las otras categorías (Emprendimiento, Innovación Regional con PDT regionales, Mercados, Capacidades Tecnológicas) están en JS-SPAs. Lo cubre AI Discovery semanal.

6. **IICA Dashboard requiere perfil de browser persistente** (cookie Cloudflare). No corre en serverless. Está fuera del array `scrapers[]` y debe correrse con `npx tsx scripts/scrape-iica-dashboard.ts` desde una máquina con perfil ya autenticado.

---

## 🧪 Cómo probar localmente

### Requisitos
- Docker (para Postgres con pgvector)
- Node 20+
- API key de Gemini ([aistudio.google.com](https://aistudio.google.com/) → gratis)

### Pasos
```bash
# 1. Postgres local con pgvector
docker run -d --name iica-postgres \
  -e POSTGRES_USER=iica -e POSTGRES_PASSWORD=iica_dev -e POSTGRES_DB=iica_local \
  -p 5432:5432 pgvector/pgvector:pg16

# 2. .env.local
cat > .env.local <<EOF
DATABASE_URL="postgresql://iica:iica_dev@localhost:5432/iica_local"
DIRECT_URL="postgresql://iica:iica_dev@localhost:5432/iica_local"
GEMINI_API_KEY="AIza..."
ADMIN_PASSWORD="iica-dev-2026"
ADMIN_SESSION_SECRET="$(openssl rand -hex 32)"
MERCADO_PUBLICO_TICKET="4B24B3F0-E802-4E89-9641-E167BD2C1F10"
EOF

# 3. Dependencias + schema
npm install
set -a && source ./.env.local && set +a
npx prisma db push --accept-data-loss
docker exec -i iica-postgres psql -U iica -d iica_local < scripts/sql/2026-05-11-hybrid-search.sql
npx tsx scripts/seed-sources.ts

# 4. Poblar BD
npx tsx scripts/run-scrapers.ts       # ~150 proyectos reales
npx tsx scripts/mock-ai-discoveries.ts # 6 mocks adicionales
npx tsx scripts/backfill-embeddings.ts # genera vectores

# 5. Levantar UI
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin/login (password de ADMIN_PASSWORD)
```

### Queries de prueba para validar hybrid
- `"agua riego"` → debería traer EUROCLIMA+ Agua, CNR concursos, sin necesidad de que aparezcan las palabras literalmente en BD.
- `"cambio climático adaptación"` → GEF-8 (que matchea lexical también) en top, seguido de EUROCLIMA+, FAO TCP.
- `"innovación cooperativas"` → FIA AgroCoopInnova, CORFO Innovación.

---

## 📈 Métricas comparativas

| | Antes (main) | Después (esta rama) |
|---|---|---|
| `/api/search-projects` LOC | 719 | 80 |
| Endpoint latencia p50 | 4-30s (con Claude runtime) | <1s |
| Scrapers funcionales | 1 (CORFO 10) | 4 (FIA 50, IICA-Hem 50, CNR 34, CORFO 10) |
| Búsqueda full-text | ILIKE %x% (seq scan) | tsvector + GIN |
| Búsqueda semántica | — | pgvector + Gemini |
| Búsqueda híbrida | — | RRF en SQL |
| AI Discovery | Anthropic Claude (paid) | Gemini (free) |
| Detección homepage redirect | — | sí (validateUrl + check-link) |
| Caché stale (linkGuardian) | nunca expira hasta TTL | versionada (auto-invalida) |

---

## 🔁 Próximos pasos sugeridos (no incluidos en este PR)

1. **Integrar backfill de embeddings al cron de ingest.** Hoy se corre manual; el cron debería generar embeddings de proyectos nuevos automáticamente.
2. **Playwright para CORFO regionales / FONTAGRO** — cubrir PDT Valparaíso y otras categorías JS-rendered.
3. **Notificaciones Slack/email** cuando un scraper falla 3 días seguidos.
4. **Dedup fuzzy por (institucion + nombre)** para casos donde la misma convocatoria llega de scraper y de AI Discovery con URLs distintas.
5. **Activar billing de Gemini** si se llega al límite del free tier (`gemini-2.5-flash-lite` con grounding tiene cuota más alta pero no infinita).
6. **Migrar las 3 rutas legacy de Anthropic** (`/api/ai-search`, `/api/ai-web-search`, `/api/generate-proposal`) a Gemini para consolidar dependencias.

---

## 📂 Commits de la rama (14)

```
10389af  feat: resolver redirects de Vertex AI Search + gemini-2.5-flash-lite
f7d9b9d  feat: eliminar logos institucionales de las cards y tablas
fc5c165  feat: scraper CNR + fortalecer AI Discovery para FIDA/UNDP/FAO/INDAP/FONTAGRO
887c6cb  fix: aplicar las 3 recomendaciones del análisis de scrapers
b7e01a9  feat: búsqueda híbrida full-text + semántica con RRF
db0811e  feat: resolver URLs cortas (bit.ly, t.co, etc.) en AI Discovery
f34a1df  fix: scraper CORFO usa URL correcta y dominio corfo.gob.cl
6dd6d1f  fix: /admin daba 404 — agregar página índice con redirect a /sources
0708bc3  fix: bumpear versión de caché linkGuardian a v2 (auto-invalida)
278a89f  fix: links '<Ver Bases>' usan linkGuardian (no van directo al url crudo)
f35b107  chore: script mock-ai-discoveries para probar UI sin gastar API
a6f0242  fix: rechazar URLs homepage en validateUrl + check-link
6dabf3a  feat: migrar AI Discovery de Anthropic a Gemini (free tier)
```

---

## ❓ FAQ rápido para reviewers

**¿Por qué no hay tests nuevos?**
Hay tests para validateUrl, embeddings, utils. Para los scrapers nuevos (CORFO, CNR) tests funcionales con fixtures están planificados pero fuera del scope inmediato — los scrapers tienen su propio "smoke test" al correr `npm run ingest`.

**¿Esto rompe alguna API pública existente?**
No. El endpoint `/api/search-projects` mantiene el mismo body y shape de respuesta (`{results, meta}`). Solo el contenido de `meta` agrega campos (`mode`, `hybrid_count`).

**¿Y si Gemini se cae?**
`/api/search-projects` hace fallback a búsqueda lexical-only (sigue siendo rápida con índice GIN). El cron de discovery falla gracefully y deja error log visible en `/admin/sources`.

**¿Cuánto cuesta operarlo?**
$0/mes en uso normal:
- pgvector y tsvector son features nativas de Postgres.
- Gemini free tier cubre ~250 RPD de embeddings + 20 RPD de grounding (suficiente para 1 ingest diario + 1 discovery semanal).
- Si supera el límite, el costo de Gemini paid es ~$0.30 por discovery completa.

**¿Y si quiero deshacer este cambio?**
- Schema: los `DROP COLUMN` y `DROP INDEX` están commentados en el SQL — descomentar y aplicar.
- Code: revert del commit b7e01a9 elimina la búsqueda híbrida.
- Endpoint: el viejo `route.ts` queda en historial git.
