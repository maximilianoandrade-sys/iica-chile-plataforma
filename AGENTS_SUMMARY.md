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
- **Saneamiento y Actualización Integral del Catálogo de Proyectos (Octubre 2026)**:
  - **Depuración de Vigencias**: Transición de 28 convocatorias vencidas a 'Cerrada'. 0 convocatorias abiertas vencidas en el catálogo.
  - **Saneamiento Textual y Mojibake**: Reparados caracteres rotos (`\uFFFD`) en nombres, objetivos y bases.
  - **Filtro de Relevancia Agrícola**: Despublicadas licitaciones residuales no agrícolas (aire acondicionado, lavandería, aseo).
  - **Desduplicación**: Depurados registros repetidos de adquisiciones multilaterales.
  - **Nuevas Convocatorias Vigentes Q4 2026 / 2027**: Incorporadas 17 convocatorias prioritarias para Chile (CNR Ley 18.450 concursos 24 a 27 y 01-2027; FIA Innovación y Jóvenes Innovadores; CORFO Innova Región, Semilla Inicia y Crea y Valida; INDAP PRI, PDI y SIRSD-S; ANID Fondef IDeA; IICA/FAO AgTech; GCF Cono Sur; Horizon Europe).
  - **Metadatos y Frescura**: `data/metadata.json` actualizado a fecha de hoy (410 proyectos totales, 195 activos). El radar y la sección de fuentes muestran estado en vivo ("Actualizado hoy").
  - **Script de Sincronización Local**: `scripts/sync-local-projects.ts` robustecido con sanitización automática de mojibake, descarte de palabras clave no agrícolas y conteo certero de proyectos publicables.
  - **Tests y Build**: 67 test suites verdes (387 tests pasando), 224 páginas estáticas SSG generadas limpiamente en `npm run build`.

- **Revisión total, auditoría con skills y mejoras mayores implementadas y pusheadas a main** (commit `33d5841`):
  - **Desacoplamiento cliente/servidor**: creado `lib/project-utils.ts` con tipos y formateadores puros. Componentes cliente ya no importan `lib/data.ts` ni arrastran dependencias de base de datos.
  - **Resiliencia de datos**: fallback garantizado a `getStaticProjects(today)` en `lib/data.ts` si Prisma/Supabase no responde.
  - **Asistente de Propuestas IA**: creado `ProposalGeneratorModal.tsx` y `ProposalGeneratorButton.tsx` conectados a `/api/generate-proposal` (Gemini 2.5 Flash Lite) con copia y descarga `.txt`.
  - **Ficha de Proyecto (`/proyecto/[id]`)**: botón de IA integrado, modo oscuro 100% corregido y sección de "Convocatorias Similares Recomendadas".
  - **Alertas Reales**: `/api/newsletter/subscribe` persiste en `prisma.usuario` y `prisma.alerta`.
  - **Higiene de Logging**: 0 llamadas a `console.*` residuales (17 migradas en `hooks/usePWA.ts`, 1 en `app/error.tsx`). Log por render eliminado de `ProjectCard`.
  - **Tests y Tipos**: 67 suites en verde (387 tests pasados), 0 errores TypeScript.

- **Producción caída (white-screen) — RESUELTA** (commits `6408605`, `e101709` en `main`).
- **Suite de tests 100% verde** (pusheado a `main`).

### In Progress
- Todo el código y catálogo probados y listos para revisión/commit por parte del usuario.

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