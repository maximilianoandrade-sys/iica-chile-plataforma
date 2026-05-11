# Pipeline de Proyectos IICA — Implementation Plan

> **For agentic workers:**  
> REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**  
Construir un pipeline automático, robusto y auditable para ingesta diaria/mensual de proyectos desde fuentes públicas, con validación AI+humana, observabilidad avanzada y bandeja de revisión eficiente para el equipo IICA.

**Architecture:**  
Incorpora scrapers modulares, procesado AI con flags needsReview, base de datos transaccional (Supabase+Prisma), capa UI admin Next.js para monitoreo granular y bandeja operacional, logging centralizado y pruebas integrales. El rollout es progresivo, probado primero en staging y con backups para seguridad de datos.

**Tech Stack:**  
- Next.js 14 (frontend/admin)
- TypeScript (fullstack)
- Prisma ORM + Supabase (SQL DB)
- GitHub Actions (ingesta/scraping scheduler, logs)
- Playwright/cheerio para scraping
- Vitest/jest para tests
- Prometheus (opcional, para métricas avanzadas)

---

## Archivo y responsabilidades clave

1. Lógica y Core Pipeline
   - `src/scrapers/[source].ts` — Scrapers individuales por fuente.
   - `src/pipeline/ingestProjects.ts` — Orquestador: ejecuta scrapers, AI review, validación de enlaces y logs.
   - `src/pipeline/aiReview.ts` — Flags AI (aprobado/needsReview/descartado).
   - `src/pipeline/validators/linkValidator.ts` — Validación de enlaces.
   - `src/db/models/project.ts` — Modelo proyecto.
   - `src/db/models/scrapeLog.ts` — Logs scrapeo.

2. Tests
   - `tests/pipeline/ingestProjects.test.ts`, etc.

3. Admin/UI
   - `src/pages/admin/pipeline-dashboard.tsx`, etc.

4. Utils/Logging
   - `src/utils/metrics.ts`, etc.

5. Config/Scripts
   - `.github/workflows/scrape-pipeline.yml`

---

## Desglose de tareas principales (bite-sized, TDD-driven)

### Monitoring Dashboard
- [ ] Test de renderizado tabla (SourceStatsTable)
- [ ] Implementación mínima tabla
- [ ] Página pipeline-dashboard, con test
- [ ] Función getMetrics, con test
- [ ] Alerts visuales (test + implementación)

### Pipeline Core
- [ ] Test orquestador dummy
- [ ] Implementación mínima orquestador
- [ ] Test + scraper SUBDERE
- [ ] Implementación scraper
- [ ] Test + implementación AI review
- [ ] Test + validador de enlaces
- [ ] Logger y logs estructurados
- [ ] Test integración E2E pipeline

### Bandeja needsReview
- [ ] Página needsReview, test
- [ ] Componente ProjectCard, test
- [ ] Batch/hotkeys/stuck

### Rollout
- [ ] Job scheduler/workflow CI
- [ ] Estrategia de rollout/canary/docs

---

**Checks:**
1. Cobertura ok, ningún paso "TBD"
2. Code snippets y comandos exactos
3. Consistencia.

---

**NOTA:** Se recomienda ejecución "subagent-driven-development" para máxima velocidad y control.
