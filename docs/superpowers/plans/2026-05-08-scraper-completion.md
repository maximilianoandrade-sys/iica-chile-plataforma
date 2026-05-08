# Scraper System Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the scraper system by adding an orchestrator, merge logic, and CLI script so that fund data from ANID, CNR, and FIA can be automatically scraped and merged into `data/projects.json`.

**Architecture:** Three scrapers already exist (`lib/scrapers/{anid,cnr,fia}.ts`). We add an orchestrator (`lib/scrapers/index.ts`) that runs them in parallel, a merge module (`lib/scrapers/merge.ts`) that reconciles scraped data with the existing JSON, and a CLI entry point (`scripts/scrape-funds.ts`) invoked via `npm run scrape`. The Vercel function timeout (10s) is too tight for live scraping, so this runs locally/CI only.

**Tech Stack:** TypeScript, Node.js (tsx runner), Jest for tests, existing Next.js 14 project.

---

### Task 1: Add `sourceId` to Project interface

**Files:**
- Modify: `lib/data.ts:7-98` (Project interface)

- [ ] **Step 1: Add `sourceId` field to Project interface**

In `lib/data.ts`, add `sourceId` after the `id` field:

```typescript
// Inside the Project interface, after line 9 (id: number;)
sourceId?: string;   // Scraper origin key, e.g. "anid:fondecyt-regular-2027"
```

- [ ] **Step 2: Run typecheck to verify no breakage**

Run: `npx tsc --noEmit`
Expected: No errors (field is optional, no existing code references it).

- [ ] **Step 3: Commit**

```bash
git add lib/data.ts
git commit -m "feat: add sourceId field to Project interface for scraper integration"
```

---

### Task 2: Create scraper orchestrator

**Files:**
- Create: `lib/scrapers/index.ts`

- [ ] **Step 1: Create orchestrator file**

```typescript
/**
 * Orquestador de scrapers — ejecuta todas las fuentes en paralelo
 */

import { ScrapedProject, ScrapeResult } from './types';
import { scrapeANID } from './anid';
import { scrapeCNR } from './cnr';
import { scrapeFIA } from './fia';

interface ScraperEntry {
  id: string;
  name: string;
  scrape: () => Promise<ScrapedProject[]>;
}

const SCRAPERS: ScraperEntry[] = [
  { id: 'anid', name: 'ANID', scrape: scrapeANID },
  { id: 'cnr',  name: 'CNR',  scrape: scrapeCNR },
  { id: 'fia',  name: 'FIA',  scrape: scrapeFIA },
];

export async function runAllScrapers(): Promise<ScrapeResult[]> {
  const results = await Promise.allSettled(
    SCRAPERS.map(async (s): Promise<ScrapeResult> => {
      const start = Date.now();
      try {
        const projects = await s.scrape();
        return {
          source: s.id,
          projects,
          errors: [],
          durationMs: Date.now() - start,
        };
      } catch (err: any) {
        return {
          source: s.id,
          projects: [],
          errors: [err.message || String(err)],
          durationMs: Date.now() - start,
        };
      }
    })
  );

  return results.map(r =>
    r.status === 'fulfilled'
      ? r.value
      : { source: 'unknown', projects: [], errors: [String(r.reason)], durationMs: 0 }
  );
}

/** Deduplica por sourceId, manteniendo la primera aparicion */
export function deduplicateScraped(projects: ScrapedProject[]): ScrapedProject[] {
  const seen = new Set<string>();
  return projects.filter(p => {
    if (seen.has(p.sourceId)) return false;
    seen.add(p.sourceId);
    return true;
  });
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/scrapers/index.ts
git commit -m "feat: add scraper orchestrator with parallel execution"
```

---

### Task 3: Create merge logic with tests

**Files:**
- Create: `lib/scrapers/merge.ts`
- Create: `tests/scrapers/merge.test.ts`

- [ ] **Step 1: Write the failing test file**

Create `tests/scrapers/merge.test.ts`:

```typescript
/**
 * @jest-environment node
 */
import { mergeScrapedIntoProjects, scrapedToProject } from '@/lib/scrapers/merge';
import type { ScrapedProject } from '@/lib/scrapers/types';

// Helper: minimal existing project
function makeExisting(overrides: Record<string, any> = {}) {
  return {
    id: 200,
    nombre: 'Existing Fund',
    institucion: 'TEST',
    monto: 100000,
    fecha_cierre: '2026-12-31',
    estado: 'Abierto',
    categoria: 'Nacional',
    url_bases: 'https://example.com',
    ...overrides,
  };
}

// Helper: minimal scraped project
function makeScraped(overrides: Partial<ScrapedProject> = {}): ScrapedProject {
  return {
    sourceId: 'test:fund-abc',
    nombre: 'Scraped Fund',
    institucion: 'TEST',
    monto: 0,
    fecha_cierre: new Date('2026-12-31'),
    estado: 'Abierto',
    categoria: 'Nacional',
    url_bases: 'https://test.cl/fund',
    regiones: ['Todas'],
    beneficiarios: ['Agricultores'],
    objetivo: 'Test objective',
    ...overrides,
  };
}

describe('scrapedToProject', () => {
  it('converts ScrapedProject to Project shape with assigned id', () => {
    const scraped = makeScraped();
    const result = scrapedToProject(scraped, 300);

    expect(result.id).toBe(300);
    expect(result.sourceId).toBe('test:fund-abc');
    expect(result.nombre).toBe('Scraped Fund');
    expect(result.fecha_cierre).toBe('2026-12-31');
    expect(result.estado).toBe('Abierto');
  });

  it('formats fecha_cierre as YYYY-MM-DD string', () => {
    const scraped = makeScraped({ fecha_cierre: new Date('2026-06-15T10:30:00Z') });
    const result = scrapedToProject(scraped, 1);
    expect(result.fecha_cierre).toBe('2026-06-15');
  });
});

describe('mergeScrapedIntoProjects', () => {
  it('appends new scraped projects with incremented ids', () => {
    const existing = [makeExisting({ id: 180 })];
    const scraped = [makeScraped({ sourceId: 'test:new-one' })];

    const merged = mergeScrapedIntoProjects(existing, scraped);

    expect(merged).toHaveLength(2);
    expect(merged[1].id).toBe(181);
    expect(merged[1].sourceId).toBe('test:new-one');
  });

  it('updates existing project when sourceId matches', () => {
    const existing = [
      makeExisting({ id: 150, sourceId: 'test:existing', nombre: 'Old Name', monto: 50000 }),
    ];
    const scraped = [
      makeScraped({ sourceId: 'test:existing', nombre: 'Updated Name', monto: 99000 }),
    ];

    const merged = mergeScrapedIntoProjects(existing, scraped);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(150); // preserves id
    expect(merged[0].nombre).toBe('Updated Name');
    expect(merged[0].monto).toBe(99000);
  });

  it('preserves manual entries (no sourceId) untouched', () => {
    const manual = makeExisting({ id: 101, nombre: 'Manual Entry' });
    const scraped = [makeScraped({ sourceId: 'test:auto' })];

    const merged = mergeScrapedIntoProjects([manual], scraped);

    expect(merged).toHaveLength(2);
    expect(merged[0]).toEqual(manual); // untouched
  });

  it('auto-marks expired entries as Cerrado', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const scraped = [
      makeScraped({
        sourceId: 'test:expired',
        fecha_cierre: pastDate,
        estado: 'Abierto', // scraper says open but date is past
      }),
    ];

    const merged = mergeScrapedIntoProjects([], scraped);

    expect(merged[0].estado).toBe('Cerrado');
  });

  it('handles empty scraped array without modifying existing', () => {
    const existing = [makeExisting({ id: 101 }), makeExisting({ id: 102 })];
    const merged = mergeScrapedIntoProjects(existing, []);
    expect(merged).toEqual(existing);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/scrapers/merge.test.ts --no-cache`
Expected: FAIL — `Cannot find module '@/lib/scrapers/merge'`

- [ ] **Step 3: Write merge implementation**

Create `lib/scrapers/merge.ts`:

```typescript
/**
 * Merge logic: reconcilia datos scrapeados con projects.json existente
 */

import type { ScrapedProject } from './types';

/** Tipo Project simplificado (compatible con el de lib/data.ts) */
interface ProjectRecord {
  id: number;
  sourceId?: string;
  nombre: string;
  institucion: string;
  monto: number;
  fecha_cierre: string;
  estado: string;
  categoria: string;
  url_bases: string;
  regiones?: string[];
  beneficiarios?: string[];
  objetivo?: string;
  [key: string]: any; // preserva campos extra del JSON original
}

/**
 * Convierte un ScrapedProject al formato de projects.json
 */
export function scrapedToProject(scraped: ScrapedProject, id: number): ProjectRecord {
  const fechaStr = scraped.fecha_cierre.toISOString().split('T')[0];

  // Corregir estado si fecha ya paso
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const estado = scraped.fecha_cierre < now ? 'Cerrado' : scraped.estado;

  return {
    id,
    sourceId: scraped.sourceId,
    nombre: scraped.nombre,
    institucion: scraped.institucion,
    monto: scraped.monto,
    fecha_cierre: fechaStr,
    estado,
    categoria: scraped.categoria,
    url_bases: scraped.url_bases,
    regiones: scraped.regiones,
    beneficiarios: scraped.beneficiarios,
    objetivo: scraped.objetivo,
  };
}

/**
 * Fusiona proyectos scrapeados con la lista existente.
 *
 * Reglas:
 * 1. Entradas manuales (sin sourceId) se preservan intactas.
 * 2. Si sourceId coincide, se actualiza (preservando id y campos IICA extra).
 * 3. Si sourceId es nuevo, se agrega con id auto-incrementado.
 * 4. Entradas con fecha_cierre pasada se marcan como "Cerrado".
 */
export function mergeScrapedIntoProjects(
  existing: ProjectRecord[],
  scraped: ScrapedProject[],
): ProjectRecord[] {
  if (scraped.length === 0) return existing;

  // Indice de existentes por sourceId
  const bySourceId = new Map<string, number>();
  existing.forEach((p, idx) => {
    if (p.sourceId) bySourceId.set(p.sourceId, idx);
  });

  // Clonar existentes
  const result = existing.map(p => ({ ...p }));

  // Max id para auto-incremento
  let maxId = existing.reduce((max, p) => Math.max(max, p.id), 0);

  for (const s of scraped) {
    const existingIdx = bySourceId.get(s.sourceId);

    if (existingIdx !== undefined) {
      // Actualizar existente: preservar id y campos IICA extra
      const old = result[existingIdx];
      const updated = scrapedToProject(s, old.id);

      // Preservar campos IICA que el scraper no produce
      result[existingIdx] = {
        ...old,           // campos IICA originales
        ...updated,       // datos frescos del scraper
        id: old.id,       // siempre preservar id
      };
    } else {
      // Nuevo proyecto
      maxId++;
      result.push(scrapedToProject(s, maxId));
    }
  }

  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/scrapers/merge.test.ts --no-cache`
Expected: All 6 tests PASS.

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add lib/scrapers/merge.ts tests/scrapers/merge.test.ts
git commit -m "feat: add scraper merge logic with full test coverage"
```

---

### Task 4: Create CLI script

**Files:**
- Create: `scripts/scrape-funds.ts`
- Modify: `package.json` (add `scrape` script)

- [ ] **Step 1: Create the CLI entry point**

Create `scripts/scrape-funds.ts`:

```typescript
/**
 * CLI: Ejecuta scrapers y actualiza data/projects.json
 *
 * Uso: npm run scrape
 *      npm run scrape -- --dry-run   (solo muestra, no escribe)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { runAllScrapers, deduplicateScraped } from '../lib/scrapers/index';
import { mergeScrapedIntoProjects } from '../lib/scrapers/merge';
import type { ScrapedProject } from '../lib/scrapers/types';

const PROJECTS_PATH = resolve(__dirname, '..', 'data', 'projects.json');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log('=== IICA Chile — Scraper de Fondos ===\n');

  // 1. Ejecutar scrapers
  console.log('Ejecutando scrapers...');
  const results = await runAllScrapers();

  let totalScraped = 0;
  let totalErrors = 0;

  for (const r of results) {
    const status = r.errors.length > 0 ? 'ERROR' : 'OK';
    console.log(`  [${status}] ${r.source}: ${r.projects.length} fondos (${r.durationMs}ms)`);
    if (r.errors.length > 0) {
      r.errors.forEach(e => console.log(`       -> ${e}`));
    }
    totalScraped += r.projects.length;
    totalErrors += r.errors.length;
  }

  // 2. Agrupar y deduplicar
  const allScraped: ScrapedProject[] = results.flatMap(r => r.projects);
  const unique = deduplicateScraped(allScraped);
  console.log(`\nTotal scrapeado: ${totalScraped} | Unicos: ${unique.length} | Errores: ${totalErrors}`);

  if (unique.length === 0) {
    console.log('No se encontraron fondos nuevos. Saliendo.');
    return;
  }

  // 3. Leer existentes
  const existingRaw = readFileSync(PROJECTS_PATH, 'utf-8');
  const existing = JSON.parse(existingRaw);
  console.log(`Proyectos existentes en JSON: ${existing.length}`);

  // 4. Merge
  const merged = mergeScrapedIntoProjects(existing, unique);
  const newCount = merged.length - existing.length;
  const updatedCount = unique.length - newCount;

  console.log(`\nResultado del merge:`);
  console.log(`  Nuevos:       ${newCount}`);
  console.log(`  Actualizados: ${updatedCount}`);
  console.log(`  Total final:  ${merged.length}`);

  // 5. Escribir
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No se escribio ningun archivo.');
    return;
  }

  writeFileSync(PROJECTS_PATH, JSON.stringify(merged, null, 4), 'utf-8');
  console.log(`\nArchivo actualizado: ${PROJECTS_PATH}`);
  console.log('Listo. Ejecuta "npm run build" para verificar.');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add npm script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"scrape": "tsx scripts/scrape-funds.ts",
"scrape:dry": "tsx scripts/scrape-funds.ts --dry-run"
```

- [ ] **Step 3: Run dry-run to verify script works**

Run: `npm run scrape:dry`
Expected: Output showing scraper execution with `[DRY RUN]` at the end and no file written.

- [ ] **Step 4: Commit**

```bash
git add scripts/scrape-funds.ts package.json
git commit -m "feat: add CLI scrape script with dry-run support"
```

---

### Task 5: Verify build & final commit

**Files:**
- Verify: all modified/created files

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass (existing + new merge tests).

- [ ] **Step 3: Run full build**

Run: `npm run build`
Expected: Build succeeds, all pages generated.

- [ ] **Step 4: Stage and commit all remaining changes**

```bash
git add data/projects.json prisma/schema.prisma public/sw.js lib/scrapers/
git commit -m "feat: complete scraper system - orchestrator, merge, CLI, and updated fund data"
```
