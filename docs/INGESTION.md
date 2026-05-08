# Pipeline de Ingesta — Operación

Documentación práctica para mantener el pipeline de búsqueda de proyectos del IICA Chile.

## Arquitectura

- **Capa A — Scrapers determinísticos** (diaria, 06:00 UTC):
  GitHub Action `ingest-scrapers.yml` corre los scrapers de `lib/ingestion/registry.ts`
  contra las fuentes con APIs limpias (FIA WP REST, IICA Hemisférico WP REST `bids`).
  Hace upsert a Supabase via `lib/ingestion/persistence.ts`.

- **Capa B — AI Discovery** (semanal, lunes 12:00 UTC):
  GitHub Action `discover-projects.yml` corre Gemini 2.5 Flash + Google Search
  grounding con guardrails anti-alucinación (snippet >= 15 palabras + URL
  validation). Escribe a Supabase con `discoveredBy='ai'` y `needsReview=true`.
  Gratis con tier free de Gemini API (1500 req/día).

- **API live de Mercado Público**: en cada búsqueda, `/api/search-projects` consulta
  Mercado Público en tiempo real para captar licitaciones del día (filtradas por
  keywords agrícolas).

- **Búsqueda** (`/api/search-projects`): query directa a Supabase + Mercado Público.
  Sin Claude en runtime. Respuesta consistentemente <1s.

## Fuentes activas

| Fuente | Tipo | Frecuencia | Notas |
|---|---|---|---|
| FIA | Scraper Capa A | Diaria | WP REST `/wp-json/wp/v2/convocatorias` |
| IICA Hemisférico | Scraper Capa A | Diaria | WP REST `/wp-json/wp/v2/bids`, filtra por `final_date` futuro |
| Mercado Público | API live | Por query | Filtros de keywords agrícolas |
| AI Discovery | Capa B (Claude) | Semanal | Solo agrega lo que NO esté en Capa A |

### Fuentes NO incluidas y por qué

- **INDAP / CORFO**: opera con programas continuos (PRODESAL, PAP, PDI, etc.), no
  convocatorias time-bound. La plata pública concreta aparece en Mercado Público.
- **FONTAGRO**: no expone WP REST ni API pública. Diferido a v2 (Playwright o
  partnership con FONTAGRO).
- **SAG / MINAGRI / ANID**: cobertura vía Mercado Público (nacionales) y AI
  Discovery (internacionales).

## Cómo agregar una nueva fuente Capa A

1. Verificar si el sitio es WordPress: `curl -s SITIO/wp-json/wp/v2/types`. Si lo es,
   buscá el custom post type relevante. Suele ser la opción más limpia.
2. Crear `lib/ingestion/scrapers/<slug>.ts` con la interfaz `Scraper` (ver
   `fia.ts` o `iica-hemisferico.ts` como ejemplos).
3. Crear fixture en `tests/fixtures/<slug>.json` (o `.html` si scraping HTML).
4. Crear test en `tests/lib/ingestion/scrapers/<slug>.test.ts`.
5. Agregar al array en `lib/ingestion/registry.ts`.
6. Agregar entry en tabla `Source`:
   ```bash
   # editá scripts/seed-sources.ts agregando la nueva fuente
   npm run prisma:generate
   set -a && source ./.env.local && set +a && npx tsx scripts/seed-sources.ts
   ```
7. Probá local: `npm run ingest`
8. Commit + push. El cron diario de GitHub Actions la incluye automáticamente.

## Comandos útiles

```bash
# Todos los scrapers
npm run ingest

# Solo discovery IA (necesita GEMINI_API_KEY — gratis en aistudio.google.com)
npm run discover

# Auditoría legacy (dry-run, genera CSV)
npm run ingest:audit

# Auditoría legacy (apply, modifica BD)
npx tsx scripts/audit-legacy-data.ts -- --apply

# Smoke test post-deploy
DEPLOYMENT_URL=https://tu-app.vercel.app npm run smoke
```

## Cómo debuggear un scraper roto

1. `/admin/sources` → ver `lastRunStatus` y `lastRunError`.
2. Si `partial`: el scraper corrió pero algunos items fallaron. Ajustar selectores/parsing.
3. Si `error`: fetch falló o crash total. Ver logs de GitHub Actions.
4. Refrescar fixture si el HTML cambió:
   ```bash
   curl -A "IICA-Chile-Bot/1.0" -L <url> -o tests/fixtures/<slug>.html
   ```
5. Correr test:
   ```bash
   npm test -- tests/lib/ingestion/scrapers/<slug>.test.ts
   ```

## Cómo aprobar / descartar descubrimientos IA

1. Ir a `/admin/discoveries`.
2. Login con `ADMIN_PASSWORD`.
3. Por cada fila: leer el snippet (cita textual de Claude), validar URL, decidir.
4. **Aprobar**: el proyecto sigue en búsqueda sin badge.
5. **Descartar**: el proyecto se cierra con nota "descartado por revisión IA".

## Variables de entorno

| Variable | Vercel | GitHub Secrets | Para qué |
|---|---|---|---|
| `DATABASE_URL` | ✅ | ✅ | Prisma → Supabase (pooler) |
| `DIRECT_URL` | ✅ | ✅ | Prisma migrations |
| `GEMINI_API_KEY` | — | ✅ | Capa B AI Discovery (https://aistudio.google.com) |
| `MERCADO_PUBLICO_TICKET` | ✅ | — | API Mercado Público |
| `ADMIN_PASSWORD` | ✅ | — | Auth `/admin/login` |
| `ADMIN_SESSION_SECRET` | ✅ | — | HMAC cookie firma (`openssl rand -hex 32`) |
| `DEPLOYMENT_URL` | — | ✅ | Smoke test post-deploy |

## Stale detection

`markStale()` corre al final de cada `run-scrapers.ts`:
- Proyectos con `lastSeenAt > 7 días` Y `discoveredBy != "manual"` → `Cerrada`
- Proyectos con `fecha_cierre < hoy` (cualquier `discoveredBy`) → `Cerrada`

Si un proyecto desaparece de su fuente, eventualmente cae en stale (max 7 días).

## Limitaciones conocidas

- Dedup solo por URL canónica (no fuzzy por título). Misma convocatoria con URLs
  distintas puede aparecer dos veces.
- Si una fuente requiere JS para renderizar, Cheerio no alcanza. Migrar a Playwright
  en el scraper específico cuando sea necesario.
- Claude puede aún alucinar dentro de un `source_snippet` falso (poco probable pero
  posible). La revisión humana en `/admin/discoveries` es la última defensa.

## Desarrollo local

Ver el README principal del proyecto. Para conectarse al Postgres local en Docker:

```bash
# .env.local
DATABASE_URL="postgresql://iica:iica_dev@localhost:5432/iica_local"
DIRECT_URL="postgresql://iica:iica_dev@localhost:5432/iica_local"
ADMIN_PASSWORD="iica-dev-2026"
ADMIN_SESSION_SECRET="$(openssl rand -hex 32)"
```

Inicializar BD local:
```bash
docker run -d --name iica-postgres -e POSTGRES_USER=iica -e POSTGRES_PASSWORD=iica_dev -e POSTGRES_DB=iica_local -p 5432:5432 postgres:16-alpine
set -a && source ./.env.local && set +a
npx prisma db push
npx tsx scripts/seed-sources.ts
npx tsx scripts/run-scrapers.ts  # llena con FIA + IICA Hemisférico
npm run dev
```
