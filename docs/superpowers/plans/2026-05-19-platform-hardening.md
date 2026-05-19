# Plan de Endurecimiento de Plataforma

> **Para agentes:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Objetivo:** Endurecer la plataforma IICA Chile en seguridad, rendimiento, accesibilidad y DX.

**Stack:** Next.js 14, Prisma, PostgreSQL (pgvector), Jest, Zod 4, Tailwind CSS, Framer Motion

---

## Sprint 1: Seguridad (5 tareas)
- Tarea 1: Fix cron auth bypass
- Tarea 2: Admin session expiry
- Tarea 3: Consolidar rate limiter
- Tarea 4: Zod validation schemas
- Tarea 5: Focus trap MobileFilterDrawer

## Sprint 2: Rendimiento + A11y (5 tareas)
- Tarea 6: maxDuration AI routes
- Tarea 7: Color contrast WCAG AA
- Tarea 8: aria-live result count
- Tarea 9: Code-split searchEngine.ts
- Tarea 10: DB indexes

## Sprint 3: DX + Monitoreo (4 tareas)
- Tarea 11: lib/utils/env.ts
- Tarea 12: Slack webhook alerts
- Tarea 13: CSP + security headers
- Tarea 14: Dead code removal

## Sprint 4: Pulido (4 tareas)
- Tarea 15: Fix tildes header
- Tarea 16: Dark mode drawer
- Tarea 17: Cookie reject option
- Tarea 18: .gitignore cleanup
