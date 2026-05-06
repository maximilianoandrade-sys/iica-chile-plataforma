# Spec: Mejorar la búsqueda de proyectos — Pipeline de ingesta diario

**Fecha:** 2026-05-05
**Estado:** Borrador para aprobación
**Autora:** Karina Orellana (con asistencia de Claude)

---

## 1. Contexto y problema

La plataforma IICA Chile (Next.js 14 + Prisma/Supabase) ofrece una búsqueda de oportunidades de financiamiento agrícola que hoy presenta dos problemas críticos para el equipo interno:

1. **Lentitud y fallas:** el endpoint `/api/search-projects` invoca a Claude API con `web_search` en cada query (10–30s, falla intermitentemente).
2. **Datos desactualizados / incompletos:** la BD Supabase se llena por seed manual desde `data/projects.json`. No hay pipeline automático de ingesta. Faltan fuentes enteras, faltan campos, hay datos obsoletos y duplicados.

### Causa raíz

No existe un pipeline de datos. La búsqueda en vivo con IA es el parche que oculta ese vacío.

### Estado actual relevante (auditoría rápida del repo)

- `vercel.json` configura cron diario `/api/cron/check-updates` 02:00 UTC, pero solo verifica enlaces existentes (HEAD requests). No scrapea.
- `.github/workflows/discover-projects.yml` corre semanalmente Claude+web_search → escribe a `data/discovered-projects.json` (commit al repo). **No escribe a Supabase.**
- `.github/workflows/link-guardian.yml` verifica enlaces rotos semanalmente.
- 45 scrapers Python en `scrapers/` son legado del Flask viejo. **No están integrados a Next.js.**
- `prisma/seed.ts` carga desde JSON estático, borra y recarga.
- `app/api/search-projects/route.ts` (~700 LOC) combina lectura DB + `BASE_PROJECTS` hardcoded + Claude+web_search en runtime + Mercado Público live, con cache de 24h en memoria.
- Límite Vercel functions: `maxDuration: 10s` (`vercel.json` line 12-15) — hostil para scrapers.

## 2. Usuarios y criterios de éxito

- **Usuario primario:** equipo interno IICA Chile (analistas, técnicos). Toleran 5–10s de latencia si los resultados son buenos.
- **Frescura aceptable:** diaria (decisión validada con usuaria).
- **Criterio de éxito:**
  1. La búsqueda responde en <1s consistentemente.
  2. La BD tiene proyectos actualizados con menos de 24h de antigüedad para las 5 fuentes prioritarias.
  3. Una fuente caída no rompe el resto del sistema.
  4. El equipo IICA puede ver el estado de salud de cada fuente y aprobar/descartar descubrimientos IA.

## 3. Alcance del MVP

**5 scrapers Capa A determinísticos** (diarios):
- INDAP (`indap.gob.cl`)
- FIA (`fia.cl/convocatorias`)
- CORFO (`corfo.cl`)
- FONTAGRO (`fontagro.org`)
- IICA Hemisférico (`iica.int/es/licitaciones`)

**1 fuente API live (refactor):** Mercado Público (ya existe, mantenemos llamada en vivo en cada búsqueda).

**1 capa AI Discovery (semanal):** modificación de `scripts/discover-projects.ts` para escribir a BD con flag `needsReview=true`.

**Páginas admin:** `/admin/sources` (health), `/admin/discoveries` (revisión humana).

**Modo descubrimiento ágil:** los hallazgos IA aparecen en la búsqueda con badge "🤖 Sin verificar" + toggle opt-out.

## 4. Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│  GitHub Actions (CI/CD — gratis, sin límite de duración)         │
│                                                                  │
│  ├─ ingest-scrapers.yml    cron diario 06:00 UTC (03:00 Chile)   │
│  │  └─ npx tsx scripts/run-scrapers.ts                           │
│  │     → ejecuta scrapers Capa A en paralelo                     │
│  │     → upsert a Supabase via Prisma                            │
│  │     → actualiza tabla Source con métricas y errores           │
│  │     → markStale() al final                                    │
│  │                                                               │
│  └─ discover-projects.yml  cron semanal lunes 12:00 UTC          │
│     └─ npx tsx scripts/discover-projects.ts (modificado)         │
│        → Claude + web_search                                     │
│        → upsert a BD con discoveredBy="ai" needsReview=true      │
└──────────────────────────────────────────────────────────────────┘
                              ↓ escriben a
┌──────────────────────────────────────────────────────────────────┐
│  Supabase Postgres (vía Prisma)                                  │
│  ├─ Project   (existente + 4 campos nuevos)                      │
│  └─ Source    (NUEVA: salud y stats por fuente)                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ lee de
┌──────────────────────────────────────────────────────────────────┐
│  Next.js (Vercel)                                                │
│  ├─ /api/search-projects   → DB query + Mercado Público live     │
│  │                            (sin Claude runtime, sin BASE_PROJECTS)│
│  ├─ /api/admin/sources     → estado de fuentes (NUEVA)           │
│  ├─ /api/admin/discoveries → aprobar/descartar IA (NUEVA)        │
│  ├─ /admin/discoveries     → bandeja revisión IA (NUEVA)         │
│  ├─ /admin/sources         → health dashboard (NUEVA)            │
│  └─ OportunidadCard        → badge "🤖" cuando needsReview=true  │
└──────────────────────────────────────────────────────────────────┘
```

### Frecuencias

| Capa | Qué corre | Frecuencia | Duración esperada |
|---|---|---|---|
| A: Scrapers determinísticos | 5 scrapers en paralelo | Diaria 06:00 UTC | 2–5 min |
| B: AI Discovery | Claude + web_search | Semanal lunes 12:00 UTC | 5–10 min |
| Health check existente | HEAD a URLs | Diaria 02:00 UTC | <1 min |
| Mercado Público | API live en cada búsqueda | Por query | <500ms |

### Decisiones arquitectónicas clave

- **GitHub Actions, no Vercel Cron**, para ingesta — escapamos del límite 10s y de la complejidad de chunking.
- **Supabase es la única fuente de verdad** para la búsqueda. Eliminamos `BASE_PROJECTS` hardcoded y la dependencia de Claude en runtime.
- **Mercado Público se mantiene en vivo** porque es API rápida, dinámica y útil.
- **Scrapers Python legacy se quedan en el repo pero NO se usan.** Su limpieza es fuera de alcance MVP.

## 5. Cambios al schema (Prisma)

### Modelo `Project` — agregar 4 campos + 3 índices

```prisma
model Project {
  // ... campos actuales se mantienen sin cambios ...

  canonicalUrl    String   @unique
  sourceId        Int?
  source          Source?  @relation(fields: [sourceId], references: [id])
  discoveredBy    String   @default("manual")  // "scraper" | "ai" | "manual"
  needsReview     Boolean  @default(false)
  firstSeenAt     DateTime @default(now())
  lastSeenAt      DateTime @default(now())

  @@index([sourceId])
  @@index([needsReview])
  @@index([lastSeenAt])
}
```

`canonicalUrl` es la `url_bases` normalizada (lowercase, sin trailing slash, sin UTM params, sin fragments). Es la clave única para `upsert`.

### Modelo nuevo `Source`

```prisma
model Source {
  id             Int       @id @default(autoincrement())
  slug           String    @unique
  name           String
  type           String
  enabled        Boolean   @default(true)
  lastRunAt      DateTime?
  lastRunStatus  String?
  lastRunError   String?
  projectsCount  Int       @default(0)
  homepageUrl    String?

  projects       Project[]

  @@index([slug])
  @@index([enabled])
}
```

`type` ∈ {`"scraper"`, `"ai_discovery"`}. `lastRunStatus` ∈ {`"success"`, `"error"`, `"partial"`}.

### Migración inicial

1. `npx prisma migrate dev --name add_ingestion_pipeline`.
2. Script de migración de datos: para cada `Project` existente, calcular `canonicalUrl` desde `url_bases` y setear `discoveredBy = "manual"`.
3. Si dos `Project` legacy colisionan en `canonicalUrl`, el script imprime los duplicados y aborta — se resuelven manualmente antes de aplicar el constraint `@unique`.
4. Pre-poblar tabla `Source` con las 5 fuentes scraper de Capa A (INDAP, FIA, CORFO, FONTAGRO, IICA Hemisférico) + entrada `ai-discovery` para Capa B. Mercado Público se mantiene como API live sin entrada en `Source` en MVP (no tiene estado de run que tracksear).

### Lo que NO se agrega (YAGNI explícito)

- Tabla `ScraperRun` separada con histórico de ejecuciones.
- Campo `Source.config Json` (cada scraper se configura en su propio archivo TS).
- Versionado de proyectos / historial de cambios.

## 6. Capa A — Scrapers determinísticos

### Contrato común

```typescript
// lib/ingestion/types.ts
export interface RawProject {
  title: string;
  institution: string;
  url: string;
  deadline?: Date | null;
  budget?: string | null;
  description?: string;
  tags?: string[];
  // resto opcional
}

export interface ScraperResult {
  sourceSlug: string;
  projects: RawProject[];
  partialErrors: string[];
}

export interface Scraper {
  slug: string;
  name: string;
  homepageUrl: string;
  scrape(): Promise<ScraperResult>;
}
```

### Runner central

```typescript
// scripts/run-scrapers.ts
import { scrapers } from "@/lib/ingestion/registry";
import { upsertProject, markStale, updateSourceStatus } from "@/lib/ingestion/persistence";

const results = await Promise.allSettled(
  scrapers.map(async (scraper) => {
    try {
      const result = await scraper.scrape();
      for (const raw of result.projects) {
        await upsertProject(raw, scraper.slug);
      }
      const status = result.partialErrors.length > 0 ? "partial" : "success";
      await updateSourceStatus(scraper.slug, status, result.projects.length, result.partialErrors.join("\n"));
    } catch (err) {
      await updateSourceStatus(scraper.slug, "error", 0, (err as Error).message);
      throw err;
    }
  })
);

await markStale();

const failed = results.filter(r => r.status === "rejected").length;
if (failed === scrapers.length) process.exit(1); // si TODO falló, alerta
```

### Persistencia (`lib/ingestion/persistence.ts`)

- `normalizeUrl(rawUrl): string` — lowercase, strip trailing `/`, strip UTM and fragment params.
- `upsertProject(raw, sourceSlug)`:
  ```typescript
  await prisma.project.upsert({
    where: { canonicalUrl: normalizeUrl(raw.url) },
    update: { ...mappedFields, lastSeenAt: new Date() },
    create: { ...mappedFields, canonicalUrl: ..., firstSeenAt: now, lastSeenAt: now, discoveredBy: "scraper", source: { connect: { slug: sourceSlug } } },
  });
  ```
- `markStale()`:
  - Marca `estadoPostulacion = "Cerrada"` los proyectos con `lastSeenAt < hace 7 días` AND `estadoPostulacion = "Abierta"`.
  - Marca `estadoPostulacion = "Cerrada"` los proyectos con `fecha_cierre < hoy` AND `estadoPostulacion = "Abierta"`.
- `updateSourceStatus(slug, status, count, errorMsg?)` — actualiza `Source.lastRunAt/Status/Error/projectsCount`.

### Patrones obligatorios para todos los scrapers

- User-Agent identificable: `IICA-Chile-Bot/1.0 (+contacto@iica.cl)`.
- Timeout fetch a 30s, máximo 1 reintento.
- Si una card falla en parsear, capturar a `partialErrors` y seguir (parcial > nada).
- Helpers compartidos en `lib/ingestion/utils.ts`: `parseSpanishDate`, `parseAmount`, `cleanText`, `absoluteUrl`.

### Workflow GitHub Actions

```yaml
# .github/workflows/ingest-scrapers.yml
name: Ingesta diaria de proyectos
on:
  schedule:
    - cron: "0 6 * * *"  # 06:00 UTC = 03:00 Chile
  workflow_dispatch:

jobs:
  ingest:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npx prisma generate
      - run: npx tsx scripts/run-scrapers.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
      - name: Smoke test
        run: npx tsx scripts/smoke-test.ts
        env:
          DEPLOYMENT_URL: ${{ secrets.DEPLOYMENT_URL }}
```

## 7. Capa B — AI Discovery (modificación)

`scripts/discover-projects.ts` cambia de "escribir a JSON + commit" a "escribir a BD":

```typescript
const aiResults = await callClaudeWithWebSearch(query);

for (const r of aiResults) {
  const canonicalUrl = normalizeUrl(r.url);

  // Si ya existe (Capa A o discovery previo), solo refrescar lastSeenAt
  const existing = await prisma.project.findUnique({ where: { canonicalUrl } });
  if (existing) {
    await prisma.project.update({
      where: { canonicalUrl },
      data: { lastSeenAt: new Date() },
    });
    continue;
  }

  // Nuevo descubrimiento → insertar con flag de revisión
  await prisma.project.create({
    data: {
      canonicalUrl,
      url_bases: r.url,
      nombre: r.title,
      institucion: r.institution,
      // ... mapeo de campos ...
      discoveredBy: "ai",
      needsReview: true,
      source: { connect: { slug: "ai-discovery" } },
    }
  });
}
```

El JSON commiteado al repo se mantiene como histórico/auditoría, pero ya no es la fuente de verdad.

## 8. Endpoint de búsqueda (refactor)

`app/api/search-projects/route.ts` se reduce de ~700 LOC a ~150 LOC:

```typescript
export async function POST(req: NextRequest) {
  const { query, scope, role, includeUnverified = true } = await req.json();

  const where: Prisma.ProjectWhereInput = {
    AND: [
      query ? {
        OR: [
          { nombre: { contains: query, mode: "insensitive" } },
          { institucion: { contains: query, mode: "insensitive" } },
          { objetivo: { contains: query, mode: "insensitive" } },
        ]
      } : {},
      scope && scope !== "all" ? { ambito: scope } : {},
      role && role !== "all" ? { rolIICA: role } : {},
      includeUnverified ? {} : { needsReview: false },
    ]
  };

  const [dbProjects, mercadoPublicoDocs] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { source: { select: { slug: true, name: true } } },
      orderBy: [{ estadoPostulacion: "asc" }, { fecha_cierre: "asc" }],
      take: 50,
    }),
    fetchMercadoPublico(query),
  ]);

  return NextResponse.json({
    results: [...dbProjects, ...mercadoPublicoDocs],
    meta: { total: ..., source: "db+mercadopublico", searchedAt: new Date().toISOString() }
  });
}
```

**Eliminado:** rama Claude+web_search, `BASE_PROJECTS` hardcoded, cache 24h en memoria.

**Mantenido:** Mercado Público live, helper `enrich()` para `days_left` calculado.

## 9. UX

### Badge en `OportunidadCard`

```tsx
{project.needsReview && (
  <span className="ai-badge">
    🤖 Descubrimiento IA · Sin verificar
  </span>
)}
```

Pill amarilla/dorada (`iicaGold` ya en paleta), tooltip: *"Encontrado por IA en el scan semanal. Pendiente de verificación por el equipo."*

### Toggle en filtros

`[ ] Incluir descubrimientos sin verificar` — encendido por default (modo ágil). Si se apaga, query agrega `needsReview = false`.

### `/admin/discoveries` — bandeja revisión

Tabla simple, filas por proyecto con `needsReview=true`, ordenadas por `firstSeenAt desc`.

| Columna | Contenido |
|---|---|
| Proyecto | Título + URL |
| Institución | Nombre |
| Encontrado | `firstSeenAt` formato relativo |
| Acciones | **Aprobar** / **Descartar** / **Crear scraper** |

- **Aprobar:** `needsReview = false`. Sigue en búsqueda sin badge.
- **Descartar:** `estadoPostulacion = "Cerrada"`, `notasInternas = "descartado por revisión IA-discovery"`. No se borra (auditoría).
- **Crear scraper:** abre un GitHub issue con template (atajo de UX, no genera código).

API: `POST /api/admin/discoveries/[id]/action` con body `{ action: "approve" | "discard" }`.

### `/admin/sources` — health dashboard

Solo lectura. Lista todas las fuentes con: nombre, último run, estado (✅⚠️❌), proyectos contados, último error.

```
INDAP            ✅  Hace 8 horas    · 47 proyectos · OK
FIA              ✅  Hace 8 horas    · 23 proyectos · OK
CORFO            ⚠️  Hace 8 horas    · 12 proyectos · 3 cards rotas
FONTAGRO         ✅  Hace 8 horas    · 6 proyectos  · OK
IICA Hemisférico ❌  Hace 3 días     · 0 proyectos · HTTP 503
ai-discovery     ✅  Hace 2 días     · 4 nuevos
```

### Auth para `/admin/*`

Esquema simple basado en HMAC: el servidor tiene un secret `ADMIN_SESSION_SECRET`. La cookie contiene un valor firmado que el middleware verifica.

Flujo:
1. Usuario va a `/admin/login`, ingresa password.
2. Servidor verifica `password === process.env.ADMIN_PASSWORD`.
3. Si coincide, setea cookie HTTP-only `admin-token` con valor `HMAC-SHA256(ADMIN_SESSION_SECRET, "admin-session")` y `Max-Age=30 días`.
4. Middleware en cada request a `/admin/*` recomputa el HMAC esperado y verifica que la cookie coincida (timing-safe compare).

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return;
  if (req.nextUrl.pathname === "/admin/login") return;

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) return NextResponse.redirect(new URL("/admin/login", req.url));

  const expected = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update("admin-session")
    .digest("hex");

  const valid = cookie.length === expected.length &&
    timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));

  if (!valid) return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = { matcher: "/admin/:path*" };
```

Suficiente para uso interno. Si más adelante hay multiusuario o auditoría, se migra a Supabase Auth (post-MVP).

## 10. Manejo de errores y observabilidad

| Escenario | Comportamiento |
|---|---|
| Una fuente HTTP 500 | `Source.lastRunError` se anota, otras fuentes siguen, próximo cron reintenta. |
| HTML cambió y rompe parser | Scraper devuelve 0 proyectos + `partialErrors`. `Source.lastRunStatus = "partial"`. Proyectos viejos NO se borran (siguen con `lastSeenAt` viejo, eventualmente caen como stale). |
| Anthropic API key vencida | El job de discovery falla pero búsqueda principal no se afecta (BD ya tiene Capa A). |
| Cron entero falla | GitHub Actions notifica al owner del repo por defecto. Webhook a Slack/email es post-MVP. |
| Duplicados que pasan dedup por URL | Aceptable en MVP. Dedup fuzzy por (institucion + nombre) es post-MVP. |

**Smoke test post-deploy:** `scripts/smoke-test.ts` corre como último step de `ingest-scrapers.yml`. Llama al endpoint, valida >0 resultados y schema mínimo. Si falla, el workflow falla y notifica.

## 11. Testing

| Qué | Cómo | Por qué |
|---|---|---|
| Helpers de normalización (`normalizeUrl`, `parseSpanishDate`, `parseAmount`) | Tests unitarios puros, ~20 casos cada uno. | Núcleo de dedup y parseo. |
| Cada scraper individual | Test con HTML fixture en `tests/fixtures/<fuente>.html`. Snapshot del output. | Detecta cambios de HTML. |
| `upsertProject` | Integración con Prisma test DB. Verifica que upsert no duplica y refresca `lastSeenAt`. | Lógica central del pipeline. |
| `markStale` | Unitario: setea fechas, corre la función, verifica estados. | Idem. |
| Endpoint `/api/search-projects` | 1–2 tests integración: query devuelve N resultados, toggle `includeUnverified=false` funciona. | Sanity del happy path. |

**No testeamos:** HTTP real a fuentes (flaky), Claude API (caro/flaky), UI de `/admin/*` (manual basta).

## 12. Orden de implementación (commits incrementales)

| # | Commit / PR | Salida visible |
|---|---|---|
| 1 | Schema migration + `Source` model + helpers de normalización (con tests) | BD tiene campos nuevos. Sin scrapers aún. |
| 2 | Runner + persistence (`upsertProject`, `markStale`) sin scrapers reales | Infra lista. Se puede correr en vacío. |
| 3 | Primer scraper: **FIA** + workflow `ingest-scrapers.yml` | Cron diario corriendo, BD se llena con FIA. ✨ Primera demo real. |
| 4 | INDAP + CORFO scrapers | 3 fuentes funcionando. |
| 5 | FONTAGRO + IICA Hemisférico scrapers | 5 fuentes Capa A completas. |
| 6 | Refactor Mercado Público al nuevo contrato | 6 fuentes consistentes. |
| 7 | Modificación de `discover-projects.ts` (Capa B → BD) | AI descubre y persiste. |
| 8 | Endpoint `/api/search-projects` simplificado + eliminar Claude runtime | Búsqueda <1s, confiable. |
| 9 | Badge + toggle en UI | UX completa. |
| 10 | `/admin/sources` y `/admin/discoveries` + middleware auth | Equipo IICA puede operar. |
| 11 | Smoke test + cleanup + README de operación | Listo para producción. |

**Tiempo estimado:** 2–3 semanas de un dev senior dedicado, o 4–6 semanas en paralelo con otras tareas. Cada commit es 1–3 horas.

**Primer valor visible:** commit #3 ya pone proyectos reales de FIA en la BD vía cron diario.

## 13. Variables de entorno requeridas

| Variable | Dónde | Para qué |
|---|---|---|
| `DATABASE_URL` | Vercel + GitHub Secrets | Prisma → Supabase |
| `DIRECT_URL` | Vercel + GitHub Secrets | Prisma migrations |
| `ANTHROPIC_API_KEY` | GitHub Secrets | Capa B (AI discovery) |
| `ADMIN_PASSWORD` | Vercel | Password que se valida en `/admin/login` |
| `ADMIN_SESSION_SECRET` | Vercel | Secret HMAC con el que se firma la cookie de sesión |
| `MERCADO_PUBLICO_TICKET` | Vercel | API Mercado Público (ya existe) |
| `DEPLOYMENT_URL` | GitHub Secrets | Smoke test post-deploy |

## 14. Fuera de alcance del MVP

- Dedup fuzzy por título+institución
- Notificaciones Slack/email cuando un scraper falla varios días
- Histórico de cambios por proyecto (versionado)
- Botón "Re-ejecutar workflow" desde `/admin/sources`
- Multi-usuario / auditoría con Supabase Auth
- Generador automático de scrapers a partir de descubrimientos IA recurrentes
- Eliminación de los 45 scrapers Python legacy
- Eliminación de los `app_*.py` Flask legacy
- Búsqueda semántica con embeddings (`lib/semanticSearch.ts` ya existe pero no se toca en MVP)

## 15. Riesgos conocidos

1. **Las 5 fuentes elegidas pueden tener HTML que requiera JS para renderizar.** Mitigación: si Cheerio no basta, evaluamos Playwright para esa fuente puntual. Costo: GitHub Actions soporta Playwright sin problema.
2. **Los scrapers se rompen cuando las fuentes cambian.** Mitigación: alerta clara en `/admin/sources` + `Source.lastRunStatus = "partial"` o `"error"` visible. Es trabajo recurrente, no se elimina — solo se hace visible y manejable.
3. **Migración de datos legacy puede tener duplicados de `canonicalUrl`.** Mitigación: script previo a la migración detecta y reporta colisiones para resolución manual.
4. **Si `DATABASE_URL` está expuesta en GitHub Secrets, un commit malicioso podría leakearla.** Mitigación estándar: branch protection + review en PRs sobre `main`.
