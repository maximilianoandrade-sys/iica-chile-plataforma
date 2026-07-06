# Pipeline de Ingesta — Operación

Documentación práctica para mantener el pipeline de búsqueda de proyectos.

## Arquitectura rápida

- **Capa A** (diaria 06:00 UTC + 11:00 UTC): scrapers determinísticos en GitHub Actions → Supabase
- **Capa B** (semanal lunes 12:00 UTC): AI Discovery con guardrails → Supabase con `needsReview=true`
- **Búsqueda** (`/api/search-projects`): query directa a Supabase + Mercado Público live

## Cómo agregar una nueva fuente

1. Crear `lib/ingestion/scrapers/<slug>.ts` con la interfaz `Scraper`
2. Crear test en `tests/lib/ingestion/scrapers/<slug>.test.ts`
3. Agregar al array en `lib/ingestion/registry.ts`
4. Agregar entry en tabla `Source` (editar `scripts/seed-sources.ts` y correr)
5. Probar localmente: `npx tsx scripts/run-scrapers.ts`
6. Commit + push. El próximo cron diario la incluye automáticamente.

## Cómo correr el pipeline manualmente

```bash
# Todos los scrapers
npm run ingest

# Solo discovery IA
npm run discover

# Auditoría legacy (dry-run)
npm run ingest:audit

# Smoke test
npm run smoke
```

## Cómo debuggear un scraper roto

1. `/admin/sources` → ver `lastRunStatus` y `lastRunError`
2. Si `partial`: el scraper corrió pero algunas cards fallaron — ajustar selector
3. Si `error`: el fetch falló o crash total — ver logs de GitHub Actions
4. Correr test: `npx jest tests/lib/ingestion/scrapers/<slug>.test.ts`

## Cómo aprobar / descartar descubrimientos IA

1. Ir a `/admin/discoveries`
2. Login con `ADMIN_PASSWORD`
3. Por cada fila: leer el snippet, validar URL, decidir
4. **Aprobar**: el proyecto sigue en búsqueda sin badge
5. **Descartar**: el proyecto se cierra con nota "descartado por revisión IA"

## Variables de entorno

| Variable | Vercel | GH Secrets | Descripción |
|---|---|---|---|
| `DATABASE_URL` | ✅ | ✅ | Prisma connection string |
| `DIRECT_URL` | ✅ | ✅ | Prisma migrations |
| `CRON_SECRET` | ✅ | ✅ | Autenticación de `/api/cron/check-updates` |
| `GEMINI_API_KEY` | ✅ | ✅ | Gemini para Capa B + embeddings |
| `MERCADO_PUBLICO_TICKET` | ✅ | — | API Mercado Público |
| `ADMIN_PASSWORD` | ✅ | — | Auth /admin/login |
| `ADMIN_SESSION_SECRET` | ✅ | — | HMAC cookie firma |
| `DEPLOYMENT_URL` | — | ✅ | Smoke test post-deploy |

## Stale detection

`markStale()` corre al final de cada `run-scrapers.ts`:
- Proyectos con `lastSeenAt > 7 días` (y no `manual`) se marcan `Cerrada`
- Proyectos con `fecha_cierre < hoy` se marcan `Cerrada` (incluye estados `Abierta` y `Próxima`)

## Limpieza one-shot de expiradas abiertas

Si aparecen oportunidades antiguas como abiertas, ejecutar una limpieza puntual:

```bash
# En Supabase SQL editor o psql sobre el entorno afectado
\i scripts/sql/2026-06-01-close-expired-open-projects.sql
```

Después de la limpieza, correr una ingesta y smoke test para verificar consistencia.

## Limitaciones conocidas

- Dedup solo por URL canónica (no fuzzy por título)
- Si una fuente requiere JS para renderizar, Cheerio no alcanza (migrar a Playwright)
- Capa B puede traer alucinaciones. La revisión humana en `/admin/discoveries` es la última línea de defensa

## IICA Dashboard (Playwright)

Scraper for the IICA projects dashboard that searches by counterpart (partner organization).

### How It Works

1. Uses Playwright (Chromium) to automate `https://apps.iica.int/dashboardproyectos/`
2. Iterates through ~75 pre-selected counterparts relevant to IICA Chile
3. For each counterpart: selects it in the dropdown, submits, parses results
4. Uses adaptive parsing (GridView → Table → Cards → Generic links)
5. Ingests results via `upsertProject()`

### Running

```bash
# Full scrape (dry run - no DB writes)
npx tsx scripts/scrape-iica-dashboard.ts --dry-run

# Full scrape (live - writes to DB)
npx tsx scripts/scrape-iica-dashboard.ts

# Filter by category
npx tsx scripts/scrape-iica-dashboard.ts --category chilean
npx tsx scripts/scrape-iica-dashboard.ts --category multilateral --dry-run
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `IICA_HEADLESS` | `true` | Set to `false` to see the browser |
| `IICA_DELAY_MS` | `4000` | Milliseconds between counterpart queries |

### Categories

| Category | Count | Description |
|----------|-------|-------------|
| chilean | ~15 | Chilean government, academia, private sector |
| regional | ~6 | PROCISUR, CAS, COSAVE, FONTAGRO |
| multilateral | ~8 | BID, BM, CAF, GEF, GCF, IFAD |
| bilateral | ~16 | EU, GIZ, AECID, USAID, JICA, KOICA, NZ |
| un | ~5 | FAO, UNDP, UNEP, ILO, UN Women |
| research | ~10 | CIAT, CIP, CIMMYT, CGIAR, CATIE, EMBRAPA |
| other | ~15 | CEPAL, OEA, WRI, WWF, IUCN |

### Requirements

- Playwright + Chromium: `npm install -D playwright && npx playwright install chromium`
- Cannot run in Vercel serverless (use GitHub Actions or local)
- Respects rate limits: 4s delay between queries (~5 min for full run)
