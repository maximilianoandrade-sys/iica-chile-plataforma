---
## Goal
- Tras resolver la caída en producción (white-screen), arreglar con skills la suite de tests rota. COMPLETADO: suite verde (67 suites, 386 pass, 5 skip, 0 fail).

## Constraints & Preferences
- Ponytail mode activo (full): mínimo código, borrar antes que añadir, `ponytail:` comments.
- Idioma: español para issues y comentarios.
- No usar `console.*` fuera de `scripts/` (structured logger `getLogger`).
- Next.js 15: `params`/`searchParams` son Promise, siempre `await`.
- Usar skills cuando apliquen (`agro-systematic-debugging`, `superpowers:systematic-debugging`).
- No inventar deploy ni auth de Vercel sin credenciales.
- NO commitear a menos que el usuario lo pida explícitamente.

## Progress
### Done
- **Producción caída (white-screen) — RESUELTA** (commits `6408605`, `e101709` en `main`).
- **Suite de tests 100% verde** (sin commitear). 18 fallos corregidos en 11 archivos:
  - `tests/setup.ts`: agregados mocks globales `next/link` y `next/navigation` (evita "invariant expected app router to be mounted" en tests de componentes).
  - `tests/middleware.test.ts`: eliminado mock muerto `jest.mock("@/lib/security")` — el `middleware.ts` real NO lo importa (config error "no mapped module").
  - `tests/lib/ingestion/persistence.test.ts`: el test "continues upsert when semantic duplicate embedding lookup fails" filtraba por memoización de `getAiEnv()` (`cachedAiEnv` en `lib/utils/env.ts:102`). Se importó `_resetEnvCache()` y se llama antes de setear `GEMINI_API_KEY` para que el rejection de `embedText` se consuma en el test y no fugue al test `findSemanticDuplicates`.
  - `tests/lib/ingestion/run-scrapers-select.test.ts`: esperaba `updateSourceStatus("fia","partial",1,...)`; corregido a `0` (el duplicado es `skipped`, así que `inserted` real = 0 en `scripts/run-scrapers.ts:59`).
  - `tests/Footer.test.tsx`, `tests/HeroSection.test.tsx`, `tests/FilterChips.test.tsx`, `tests/data.test.ts`, `tests/ProjectCard.test.tsx`, `tests/ProjectListA11y.test.tsx`, `tests/FuentesOficiales.test.tsx`: assertions obsoletas alineadas a componentes refactorados (confirmados funcionando en producción). Subagentes paralelos fijaron data/ProjectCard/ProjectListA11y/FuentesOficiales; HeroSection ahora hace click en el botón "cierran pronto" y verifica `router.push('/?estado=Abierta&sort=date_asc#convocatorias')`; Footer y FilterChips fxeados a mano.

### In Progress
- Nada pendiente de código. Cambios sin commitear (11 archivos de test). Confirmado verde con `npx jest` (exit 0).

### Blocked
- **Migración BD producción #79**: `scripts/sql/2026-07-15-linkcheck-lastmodified.sql` (columna `last_modified` en `LinkCheck`) no aplicada en Supabase. Requiere acción del usuario en Supabase SQL Editor o `npx prisma db push` desde entorno con conectividad.
- **Deploy Vercel**: sin auth/token (`vercel whoami` exit=1). Push a `main` dispara deploy automático si Git conectado (el usuario debe conectar Vercel y setear los secrets/envs: `DATABASE_URL`, `ADMIN_SESSION_SECRET`).

## Key Decisions
- `getAiEnv()` memoiza `cachedAiEnv` (env.ts:102-114) → en el archivo de test el primer `upsertProject` cachea `GEMINI_API_KEY: undefined`, haciendo que el test semántico no ejerza el path de embedding y fugara el `mockRejectedValueOnce` al test siguiente. Fix: `_resetEnvCache()` antes de setear GEMINI en el test.
- Los tests de componente fallaban por dos causas distintas: (1) infra falta de mocks de `next/link`/`next/navigation` (setup.ts), y (2) assertions obsoletas vs componentes refactorados. Ambas corregidas.
- `public/sw.js` quedó modificado por `npm run build` (regeneró el service worker con build ID local); se hizo `git checkout` para revertir — NO es parte del fix.

## Next Steps
1. (Usuario) Decidir si commitear y pushear los fixes de tests: `git add tests/ && git commit -m "test: alinear assertions obsoletos y mocks de infra con componentes actuales" && git push`.
2. (Usuario) Aplicar migración `last_modified` en Supabase.
3. (Usuario) Conectar Vercel y setear envs/secrets para deploy de `main`.
4. (Opcional) Habilitar IICA Dashboard scraper en `ingest-scrapers.yml`.

## Critical Context
- Repo: `https://github.com/maximilianoandrade-sys/iica-chile-plataforma.git`, rama `main`.
- Commits previos: `31c638e` (issues), `0952a0c` (borrar scrapers), `b7e0d7a` (fuentes), `6408605` (cache fix), `e101709` (prisma/getEnv fix).
- React 18.3.1: `cache` no exportado en browser build.
- `lib/prisma.ts` guard: `typeof window === 'undefined' && process.env.NODE_ENV !== 'production'`.
- `getAiEnv()` memoizado en `lib/utils/env.ts` (`_resetEnvCache()` para tests).
- Error de conexión BD: `P1001` (sin red a Supabase desde este entorno).
- `jest.config.js`: `testEnvironment: jest-environment-jsdom`, `moduleNameMapper: {'^@/(.*)$': '<rootDir>/$1'}`, `setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']`.

## Relevant Files
- `tests/setup.ts`: +mocks `next/link`, `next/navigation` (globales).
- `tests/middleware.test.ts`: -mock `@/lib/security` muerto.
- `tests/lib/ingestion/persistence.test.ts`: +`_resetEnvCache` import + llamada en test semántico.
- `tests/lib/ingestion/run-scrapers-select.test.ts`: `1` → `0`.
- `tests/Footer.test.tsx`, `tests/HeroSection.test.tsx`, `tests/FilterChips.test.tsx`: assertions alineadas.
- `tests/data.test.ts`, `tests/ProjectCard.test.tsx`, `tests/ProjectListA11y.test.tsx`, `tests/FuentesOficiales.test.tsx`: assertions alineadas (refactor de componentes).
- `scripts/run-scrapers.ts:59`: `updateSourceStatus(scraper.slug, status, inserted, errorSummary)` con `inserted` real.
- `middleware.ts`: usa solo `next/server` (no `@/lib/security`).
- `lib/utils/env.ts:102`: `getAiEnv()` memoizado.
---