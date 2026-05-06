# Pipeline de Ingesta para Búsqueda de Proyectos — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la búsqueda en vivo con Claude+web_search por un pipeline de ingesta diario que mantiene la BD Supabase actualizada con datos verificados de fuentes reales, eliminando convocatorias inventadas.

**Architecture:** Tres capas. (A) 5 scrapers determinísticos diarios vía GitHub Actions: INDAP, FIA, CORFO, FONTAGRO, IICA Hemisférico. (B) AI Discovery semanal con guardrails anti-alucinación (snippet textual obligatorio + URL validation). (C) Páginas admin para revisión humana. Cada proyecto pasa por `validateUrl` antes de ingestarse. La búsqueda es query directa a Supabase + Mercado Público live (sin Claude en runtime).

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma + Supabase Postgres, Cheerio (HTML parsing), Jest + fixtures (testing), GitHub Actions (cron diaria/semanal), Anthropic SDK (Capa B), HMAC-SHA256 (auth admin).

**Spec de referencia:** `docs/superpowers/specs/2026-05-05-mejorar-busqueda-proyectos-design.md`

---

## Reglas para el agente que ejecuta el plan

1. **Pedir verificaciones manuales locales en cada checkpoint marcado** (`> CHECKPOINT con usuaria`). NO avanzar al siguiente step hasta que la usuaria confirme. Cada checkpoint dice exactamente qué hay que verificar y dónde (browser, Supabase Studio, GitHub Actions UI, etc.).
2. **NO abrir el Pull Request automáticamente.** El Step 11.10 está gateado: antes de correr `gh pr create`, pedir confirmación explícita a la usuaria. Solo se abre el PR si dice "sí, abrir PR" (o equivalente).
3. **Operaciones que tocan producción** (auditoría --apply, migraciones Prisma sobre Supabase, push a `main` o a la feature branch remota) requieren confirmación de la usuaria aunque no haya un checkpoint explícito.
4. **Si un test falla por motivo no obvio**, parar y reportar a la usuaria en lugar de "arreglar" el test cambiando expectativas.
5. **Preservar el orden de tasks**. No reordenar ni saltarse Task 0 (auditoría legacy) — está pensada para correr antes de tocar nada más.

---

## Estructura de archivos

**Nuevos:**
- `lib/ingestion/types.ts`
- `lib/ingestion/utils.ts`
- `lib/ingestion/validateUrl.ts`
- `lib/ingestion/persistence.ts`
- `lib/ingestion/registry.ts`
- `lib/ingestion/scrapers/fia.ts`
- `lib/ingestion/scrapers/indap.ts`
- `lib/ingestion/scrapers/corfo.ts`
- `lib/ingestion/scrapers/fontagro.ts`
- `lib/ingestion/scrapers/iica-hemisferico.ts`
- `lib/ingestion/scrapers/mercado-publico.ts`
- `scripts/run-scrapers.ts`
- `scripts/audit-legacy-data.ts`
- `scripts/smoke-test.ts`
- `scripts/discover-projects.ts` *(modificado)*
- `.github/workflows/ingest-scrapers.yml`
- `app/admin/login/page.tsx`
- `app/admin/login/route.ts` *(server action via API)*
- `app/admin/sources/page.tsx`
- `app/admin/discoveries/page.tsx`
- `app/api/admin/discoveries/[id]/action/route.ts`
- `middleware.ts`
- `tests/lib/ingestion/utils.test.ts`
- `tests/lib/ingestion/validateUrl.test.ts`
- `tests/lib/ingestion/persistence.test.ts`
- `tests/lib/ingestion/scrapers/<fuente>.test.ts` *(uno por scraper)*
- `tests/fixtures/<fuente>.html` *(uno por scraper)*
- `docs/INGESTION.md` *(README de operación)*

**Modificados:**
- `prisma/schema.prisma`
- `app/api/search-projects/route.ts` *(simplificación masiva)*
- `components/OportunidadCard.tsx` *(badge needsReview)*
- `components/ProjectFilters.tsx` *(toggle includeUnverified)*

---

## Setup: crear rama de trabajo

Antes de empezar Task 0, aislar el trabajo en una feature branch para mantener `main` limpio durante las 2-3 semanas de implementación. Todos los commits del plan van a esta rama. Al final se mergea vía PR.

- [ ] **Step S.1: Verificar working tree limpio**

```bash
git status
```

Esperado: `nothing to commit, working tree clean` o solo cambios sin trackear no relacionados. Si hay cambios pendientes, stashearlos o commitearlos antes.

- [ ] **Step S.2: Sincronizar con remoto**

```bash
git checkout main
git pull origin main
```

- [ ] **Step S.3: Crear y cambiar a feature branch**

```bash
git checkout -b feat/pipeline-ingesta-busqueda
```

- [ ] **Step S.4: Push inicial para crear rama remota**

```bash
git push -u origin feat/pipeline-ingesta-busqueda
```

A partir de acá, **todos los commits de Tasks 0–11 van a esta rama**. Al terminar Task 11, se abre un PR a `main`.

> **Si preferís worktree en lugar de branch simple** (para tener `main` checkouteado en otra ventana en paralelo), reemplazar Steps S.3-S.4 por:
> ```bash
> git worktree add ../iica-pipeline-ingesta -b feat/pipeline-ingesta-busqueda
> cd ../iica-pipeline-ingesta
> git push -u origin feat/pipeline-ingesta-busqueda
> ```
> Y trabajar dentro de `../iica-pipeline-ingesta/`. Al terminar, `git worktree remove ../iica-pipeline-ingesta` después del merge.

---

## Variables de entorno requeridas

Antes de empezar, asegurar que estas existan en Vercel + GitHub Secrets:

| Variable | Vercel | GitHub Secrets | Para qué |
|---|---|---|---|
| `DATABASE_URL` | ✅ | ✅ | Prisma → Supabase |
| `DIRECT_URL` | ✅ | ✅ | Prisma migrations |
| `ANTHROPIC_API_KEY` | ✅ | ✅ | Capa B AI Discovery |
| `MERCADO_PUBLICO_TICKET` | ✅ | — | API Mercado Público (ya existe) |
| `ADMIN_PASSWORD` | ✅ | — | Auth `/admin/login` |
| `ADMIN_SESSION_SECRET` | ✅ | — | HMAC para cookie de sesión |
| `DEPLOYMENT_URL` | — | ✅ | Smoke test post-deploy |

Generar `ADMIN_SESSION_SECRET` con: `openssl rand -hex 32`.

---

## Task 0: Auditoría de datos legacy (limpieza pre-pipeline)

**Files:**
- Create: `scripts/audit-legacy-data.ts`

Esta tarea corre **una sola vez** antes que cualquier otra. Detecta y reporta proyectos cuyas URLs ya no resuelven (alucinaciones / URLs muertas). En modo dry-run genera un CSV. Con `--apply` marca los proyectos rotos como `Cerrada` con nota explícita.

- [ ] **Step 0.1: Crear el script con validateUrl inline**

Crear `scripts/audit-legacy-data.ts`:

```typescript
import prisma from "../lib/prisma";
import * as fs from "fs";

interface ValidationResult {
  ok: boolean;
  reason?: string;
}

async function validateUrl(url: string): Promise<ValidationResult> {
  if (!url || !url.trim()) return { ok: false, reason: "URL vacía" };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
    });
    clearTimeout(timeoutId);

    if (res.status === 404 || res.status === 410) return { ok: false, reason: `HTTP ${res.status}` };
    if (res.status >= 500) return { ok: false, reason: `HTTP ${res.status}` };
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

    // Detectar redirect a homepage genérica
    const original = new URL(url);
    const final = new URL(res.url);
    const originalHasPath = original.pathname.length > 1;
    const finalIsRoot = final.pathname === "/" || final.pathname === "";
    if (originalHasPath && finalIsRoot && original.hostname === final.hostname) {
      return { ok: false, reason: "redirige a homepage" };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

function toCsv(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
  ].join("\n");
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(`[audit] Modo: ${apply ? "APPLY (modificará BD)" : "DRY-RUN (solo CSV)"}`);

  const all = await prisma.project.findMany({
    where: { estadoPostulacion: { not: "Cerrada" } },
  });

  console.log(`[audit] Validando ${all.length} proyectos no-cerrados...`);

  const broken: Array<Record<string, string | number>> = [];
  let okCount = 0;

  for (let i = 0; i < all.length; i++) {
    const p = all[i];
    process.stdout.write(`\r[audit] ${i + 1}/${all.length}`);
    const v = await validateUrl(p.url_bases || "");
    if (!v.ok) {
      broken.push({
        id: p.id,
        nombre: p.nombre,
        institucion: p.institucion,
        url: p.url_bases || "",
        reason: v.reason || "unknown",
      });
    } else {
      okCount++;
    }
  }
  console.log("\n");

  const csv = toCsv(broken);
  fs.writeFileSync("audit-broken-urls.csv", csv);

  console.log(`[audit] OK: ${okCount}`);
  console.log(`[audit] Broken: ${broken.length}`);
  console.log(`[audit] CSV escrito: audit-broken-urls.csv`);

  if (apply && broken.length > 0) {
    console.log(`[audit] Aplicando cierre de ${broken.length} proyectos...`);
    const today = new Date().toISOString().slice(0, 10);
    for (const b of broken) {
      await prisma.project.update({
        where: { id: b.id as number },
        data: {
          estadoPostulacion: "Cerrada",
          notasInternas: `auditoría legacy ${today}: ${b.reason}`,
        },
      });
    }
    console.log(`[audit] Listo.`);
  } else if (!apply) {
    console.log(`[audit] Revisá audit-broken-urls.csv. Para aplicar el cierre, corré con --apply.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 0.2: Correr el script en modo dry-run**

Ejecutar:

```bash
npx tsx scripts/audit-legacy-data.ts
```

Esperado: imprime contadores (`OK: N | Broken: M`), genera `audit-broken-usrls.csv` en raíz del repo. **No modifica BD.**

- [ ] **Step 0.3: Revisar el CSV manualmente**

Abrir `audit-broken-urls.csv` (Excel / Google Sheets). Buscar falsos positivos (URLs temporalmente caídas, redirecciones legítimas). Si hay sospechas, sacar esas filas a un CSV `audit-keep-these.csv` para excluir del apply.

> **CHECKPOINT con usuaria:** revisar el CSV antes de avanzar al step siguiente. La usuaria aprueba qué se cierra.

- [ ] **Step 0.4: Aplicar el cierre**

```bash
npx tsx scripts/audit-legacy-data.ts -- --apply
```

Esperado: la consola muestra `Aplicando cierre de N proyectos... Listo.`. Verificar en Supabase que esos proyectos tengan `estadoPostulacion = "Cerrada"` y `notasInternas` con el formato `auditoría legacy YYYY-MM-DD: ...`.

- [ ] **Step 0.5: CHECKPOINT con usuaria — verificación post-apply**

> Pedir a la usuaria que verifique en **Supabase Studio**:
> 1. Filtrar `Project` por `notasInternas LIKE '%auditoría legacy%'` → confirmar que aparecen los proyectos esperados con `estadoPostulacion = "Cerrada"`.
> 2. Hacer una búsqueda en la web del proyecto IICA → confirmar que esos proyectos cerrados ya **no aparecen** en la búsqueda principal (a menos que se filtre por "cerrados").
>
> Si algún proyecto se cerró por error (la URL estaba caída temporalmente y debería seguir abierto): revertir manualmente con `UPDATE Project SET estadoPostulacion = 'Abierta', notasInternas = NULL WHERE id = X;`.
>
> **NO avanzar a Step 0.6 hasta que la usuaria confirme.**

- [ ] **Step 0.6: Commit**

```bash
git add scripts/audit-legacy-data.ts audit-broken-urls.csv
git commit -m "chore: auditoría de datos legacy con URLs muertas

Cierre automático de proyectos cuyas URLs no resuelven (alucinaciones
históricas de IA + URLs vencidas). Reporte completo en audit-broken-urls.csv."
```

---

## Task 1: Schema migration + helpers comunes

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/ingestion/types.ts`
- Create: `lib/ingestion/utils.ts`
- Create: `lib/ingestion/validateUrl.ts`
- Create: `tests/lib/ingestion/utils.test.ts`
- Create: `tests/lib/ingestion/validateUrl.test.ts`

- [ ] **Step 1.1: Modificar `prisma/schema.prisma` — agregar campos a Project**

En el bloque `model Project { ... }`, antes del cierre `@@index([rolIICA])`, **agregar**:

```prisma
  canonicalUrl    String   @unique
  sourceId        Int?
  source          Source?  @relation(fields: [sourceId], references: [id])
  discoveredBy    String   @default("manual")
  needsReview     Boolean  @default(false)
  firstSeenAt     DateTime @default(now())
  lastSeenAt      DateTime @default(now())

  @@index([sourceId])
  @@index([needsReview])
  @@index([lastSeenAt])
```

- [ ] **Step 1.2: Modificar `prisma/schema.prisma` — agregar modelo Source**

Al final del archivo, **agregar**:

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

- [ ] **Step 1.3: Generar canonicalUrl temporalmente NULLABLE**

Antes de aplicar la migración, hacemos `canonicalUrl` opcional para que la migración no falle con filas existentes. **Cambiar temporalmente** la línea recién agregada por:

```prisma
  canonicalUrl    String?  @unique
```

(volveremos a `String @unique` en Step 1.6 después de poblarla.)

- [ ] **Step 1.4: Aplicar migración inicial**

```bash
npx prisma migrate dev --name add_ingestion_pipeline
```

Esperado: nueva carpeta `prisma/migrations/<timestamp>_add_ingestion_pipeline/migration.sql`. Cliente Prisma regenerado.

- [ ] **Step 1.5: Pre-poblar tabla Source con las 6 entradas iniciales**

Crear archivo temporal `scripts/seed-sources.ts`:

```typescript
import prisma from "../lib/prisma";

const SOURCES = [
  { slug: "indap",            name: "INDAP",                                  type: "scraper",       homepageUrl: "https://www.indap.gob.cl/" },
  { slug: "fia",              name: "FIA — Fundación para la Innovación Agraria", type: "scraper", homepageUrl: "https://www.fia.cl/convocatorias/" },
  { slug: "corfo",            name: "CORFO",                                  type: "scraper",       homepageUrl: "https://www.corfo.cl/" },
  { slug: "fontagro",         name: "FONTAGRO",                               type: "scraper",       homepageUrl: "https://www.fontagro.org/es/iniciativas/convocatorias/" },
  { slug: "iica-hemisferico", name: "IICA Hemisférico",                       type: "scraper",       homepageUrl: "https://iica.int/es/licitaciones/" },
  { slug: "ai-discovery",     name: "AI Discovery (Claude + web search)",     type: "ai_discovery",  homepageUrl: null },
];

async function main() {
  for (const s of SOURCES) {
    await prisma.source.upsert({
      where: { slug: s.slug },
      update: { name: s.name, type: s.type, homepageUrl: s.homepageUrl },
      create: s,
    });
    console.log(`✅ ${s.slug}`);
  }
  await prisma.$disconnect();
}

main();
```

Ejecutar:

```bash
npx tsx scripts/seed-sources.ts
```

Esperado: las 6 fuentes aparecen en la tabla `Source`.

- [ ] **Step 1.6: Backfill de canonicalUrl + restaurar NOT NULL**

Crear `scripts/backfill-canonical-urls.ts`:

```typescript
import prisma from "../lib/prisma";

function normalizeUrl(rawUrl: string | null): string | null {
  if (!rawUrl) return null;
  try {
    const u = new URL(rawUrl.trim());
    u.hash = "";
    const params = new URLSearchParams();
    u.searchParams.forEach((v, k) => {
      if (!k.toLowerCase().startsWith("utm_")) params.set(k, v);
    });
    u.search = params.toString();
    let normalized = u.toString().toLowerCase();
    if (normalized.endsWith("/") && u.pathname !== "/") {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return null;
  }
}

async function main() {
  const all = await prisma.project.findMany({ where: { canonicalUrl: null } });
  const seen = new Map<string, number>();
  const collisions: number[] = [];

  for (const p of all) {
    const cu = normalizeUrl(p.url_bases);
    if (!cu) {
      console.warn(`Project ${p.id} (${p.nombre}) sin URL válida — saltando`);
      continue;
    }
    if (seen.has(cu)) {
      collisions.push(p.id);
      console.warn(`Colisión: project ${p.id} colisiona con ${seen.get(cu)} en ${cu}`);
      continue;
    }
    seen.set(cu, p.id);
    await prisma.project.update({ where: { id: p.id }, data: { canonicalUrl: cu } });
  }

  if (collisions.length > 0) {
    console.error(`⚠️  ${collisions.length} colisiones detectadas. Resolver manualmente antes de NOT NULL.`);
    process.exit(1);
  }
  console.log(`✅ Backfilled ${all.length - collisions.length}/${all.length} proyectos`);
  await prisma.$disconnect();
}

main();
```

Ejecutar:

```bash
npx tsx scripts/backfill-canonical-urls.ts
```

Si hay colisiones reportadas: revisar manualmente en Supabase, decidir cuál mantener, marcar el otro `Cerrada`. Re-ejecutar.

Después, en `prisma/schema.prisma` cambiar:

```prisma
  canonicalUrl    String?  @unique
```

a:

```prisma
  canonicalUrl    String   @unique
```

Aplicar migración:

```bash
npx prisma migrate dev --name canonical_url_not_null
```

- [ ] **Step 1.7: Crear `lib/ingestion/types.ts`**

```typescript
export interface RawProject {
  title: string;
  institution: string;
  url: string;
  deadline?: Date | null;
  budget?: string | null;
  description?: string;
  tags?: string[];
  region?: string;
  ambito?: "Nacional" | "Internacional" | "Regional";
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

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}
```

- [ ] **Step 1.8: Escribir test fallando para `normalizeUrl`**

Crear `tests/lib/ingestion/utils.test.ts`:

```typescript
import { normalizeUrl, parseSpanishDate, parseAmount, cleanText, absoluteUrl } from "@/lib/ingestion/utils";

describe("normalizeUrl", () => {
  it("baja a minúsculas", () => {
    expect(normalizeUrl("https://Example.COM/Path")).toBe("https://example.com/path");
  });
  it("quita trailing slash excepto en raíz", () => {
    expect(normalizeUrl("https://example.com/path/")).toBe("https://example.com/path");
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
  });
  it("quita params utm_*", () => {
    expect(normalizeUrl("https://example.com/x?utm_source=abc&id=1")).toBe("https://example.com/x?id=1");
  });
  it("quita fragmento", () => {
    expect(normalizeUrl("https://example.com/x#section")).toBe("https://example.com/x");
  });
  it("devuelve null para inputs inválidos", () => {
    expect(normalizeUrl("")).toBeNull();
    expect(normalizeUrl("not a url")).toBeNull();
  });
});

describe("parseSpanishDate", () => {
  it("DD-MM-YYYY", () => {
    expect(parseSpanishDate("31-03-2026")?.toISOString().slice(0, 10)).toBe("2026-03-31");
  });
  it("DD/MM/YYYY", () => {
    expect(parseSpanishDate("31/03/2026")?.toISOString().slice(0, 10)).toBe("2026-03-31");
  });
  it("'31 de marzo de 2026'", () => {
    expect(parseSpanishDate("31 de marzo de 2026")?.toISOString().slice(0, 10)).toBe("2026-03-31");
  });
  it("devuelve null si no parsea", () => {
    expect(parseSpanishDate("foo")).toBeNull();
    expect(parseSpanishDate("")).toBeNull();
  });
});

describe("parseAmount", () => {
  it("$10.000.000 CLP", () => {
    expect(parseAmount("$10.000.000 CLP")).toBe(10_000_000);
  });
  it("USD 250,000", () => {
    expect(parseAmount("USD 250,000")).toBe(250_000);
  });
  it("devuelve null si no parsea", () => {
    expect(parseAmount("ver bases")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });
});

describe("cleanText", () => {
  it("colapsa espacios y trim", () => {
    expect(cleanText("  hola   mundo  ")).toBe("hola mundo");
  });
  it("normaliza saltos de línea", () => {
    expect(cleanText("a\n\nb\n\n\nc")).toBe("a b c");
  });
});

describe("absoluteUrl", () => {
  it("relativa con base", () => {
    expect(absoluteUrl("/x", "https://a.com/b/")).toBe("https://a.com/x");
  });
  it("absoluta se conserva", () => {
    expect(absoluteUrl("https://b.com/y", "https://a.com/")).toBe("https://b.com/y");
  });
});
```

- [ ] **Step 1.9: Correr tests — esperado FAIL**

```bash
npm test -- tests/lib/ingestion/utils.test.ts
```

Esperado: error "Cannot find module '@/lib/ingestion/utils'".

- [ ] **Step 1.10: Crear `lib/ingestion/utils.ts`**

```typescript
export function normalizeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  try {
    const u = new URL(rawUrl.trim());
    u.hash = "";
    const params = new URLSearchParams();
    u.searchParams.forEach((v, k) => {
      if (!k.toLowerCase().startsWith("utm_")) params.set(k, v);
    });
    u.search = params.toString();
    let result = u.toString().toLowerCase();
    if (result.endsWith("/") && u.pathname !== "/") {
      result = result.slice(0, -1);
    }
    return result;
  } catch {
    return null;
  }
}

const MONTHS_ES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

export function parseSpanishDate(input: string): Date | null {
  if (!input || !input.trim()) return null;
  const s = input.trim().toLowerCase();

  // DD-MM-YYYY o DD/MM/YYYY
  const numeric = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (numeric) {
    const [, d, m, y] = numeric;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  // "DD de MES de YYYY"
  const written = s.match(/^(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})$/);
  if (written) {
    const [, d, monthName, y] = written;
    const month = MONTHS_ES[monthName];
    if (!month) return null;
    const date = new Date(Number(y), month - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function parseAmount(input: string): number | null {
  if (!input || !input.trim()) return null;
  const cleaned = input.replace(/[^\d,.]/g, "");
  if (!cleaned) return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized: string;
  if (lastComma > lastDot) {
    // formato latino: 1.000.000,50
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // formato anglo: 1,000,000.50 ó 10.000.000 (chileno sin decimales)
    if (lastDot > -1 && cleaned.split(".").length > 2) {
      normalized = cleaned.replace(/\./g, "");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
  }
  const n = Number(normalized);
  return isNaN(n) ? null : n;
}

export function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/\s+/g, " ").trim();
}

export function absoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}
```

- [ ] **Step 1.11: Correr tests — esperado PASS**

```bash
npm test -- tests/lib/ingestion/utils.test.ts
```

Esperado: 16 tests PASS.

- [ ] **Step 1.12: Escribir test fallando para `validateUrl`**

Crear `tests/lib/ingestion/validateUrl.test.ts`:

```typescript
import { validateUrl } from "@/lib/ingestion/validateUrl";

global.fetch = jest.fn();

describe("validateUrl", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("ok cuando 200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, url: "https://example.com/x",
    });
    expect(await validateUrl("https://example.com/x")).toEqual({ ok: true });
  });

  it("falla con 404", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 404, url: "https://example.com/x",
    });
    const r = await validateUrl("https://example.com/x");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("404");
  });

  it("falla con 5xx", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 503, url: "https://example.com/x",
    });
    const r = await validateUrl("https://example.com/x");
    expect(r.ok).toBe(false);
  });

  it("detecta redirect a homepage", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, url: "https://example.com/",
    });
    const r = await validateUrl("https://example.com/convocatoria/abc");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("homepage");
  });

  it("acepta redirect dentro del mismo path", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, url: "https://example.com/convocatoria/abc-2026",
    });
    const r = await validateUrl("https://example.com/convocatoria/abc");
    expect(r.ok).toBe(true);
  });

  it("falla con URL vacía", async () => {
    expect((await validateUrl("")).ok).toBe(false);
  });

  it("captura errores de red", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ETIMEDOUT"));
    const r = await validateUrl("https://example.com/x");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("ETIMEDOUT");
  });
});
```

- [ ] **Step 1.13: Correr tests — esperado FAIL**

```bash
npm test -- tests/lib/ingestion/validateUrl.test.ts
```

Esperado: error "Cannot find module".

- [ ] **Step 1.14: Crear `lib/ingestion/validateUrl.ts`**

```typescript
import type { ValidationResult } from "./types";

export async function validateUrl(url: string): Promise<ValidationResult> {
  if (!url || !url.trim()) return { ok: false, reason: "URL vacía" };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
    });
    clearTimeout(timeoutId);

    if (res.status === 404 || res.status === 410) return { ok: false, reason: `HTTP ${res.status}` };
    if (res.status >= 500) return { ok: false, reason: `HTTP ${res.status}` };
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

    try {
      const original = new URL(url);
      const final = new URL(res.url);
      const originalHasPath = original.pathname.length > 1;
      const finalIsRoot = final.pathname === "/" || final.pathname === "";
      if (originalHasPath && finalIsRoot && original.hostname === final.hostname) {
        return { ok: false, reason: "redirige a homepage" };
      }
    } catch {
      // si no parsea no penalizamos
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}
```

- [ ] **Step 1.15: Correr tests — esperado PASS**

```bash
npm test -- tests/lib/ingestion/validateUrl.test.ts
```

Esperado: 7 tests PASS.

- [ ] **Step 1.16: Verificar typecheck completo**

```bash
npm run typecheck
```

Esperado: sin errores.

- [ ] **Step 1.17: CHECKPOINT con usuaria — verificación de schema**

> Pedir a la usuaria que verifique en **Supabase Studio**:
> 1. Tabla `Project` tiene las columnas nuevas: `canonicalUrl` (NOT NULL UNIQUE), `sourceId`, `discoveredBy` (default "manual"), `needsReview` (default false), `firstSeenAt`, `lastSeenAt`.
> 2. Tabla `Source` existe y contiene 6 filas: indap, fia, corfo, fontagro, iica-hemisferico, ai-discovery.
> 3. Todos los proyectos legacy tienen `canonicalUrl` no-nulo y `discoveredBy = "manual"`.
>
> **NO avanzar a Step 1.18 hasta que la usuaria confirme.**

- [ ] **Step 1.18: Commit**

```bash
git add prisma/ lib/ingestion/types.ts lib/ingestion/utils.ts lib/ingestion/validateUrl.ts tests/lib/ingestion/ scripts/seed-sources.ts scripts/backfill-canonical-urls.ts
git commit -m "feat: schema + helpers para pipeline de ingesta

- Schema: canonicalUrl, sourceId, discoveredBy, needsReview, firstSeenAt,
  lastSeenAt en Project + tabla Source con health stats.
- Helpers: normalizeUrl, parseSpanishDate, parseAmount, cleanText, absoluteUrl.
- validateUrl con detección de redirect a homepage y timeout 10s.
- Tests: 23 casos cubriendo dedup y validación URL."
```

---

## Task 2: Capa de persistencia + runner

**Files:**
- Create: `lib/ingestion/persistence.ts`
- Create: `lib/ingestion/registry.ts`
- Create: `scripts/run-scrapers.ts`
- Create: `tests/lib/ingestion/persistence.test.ts`

- [ ] **Step 2.1: Escribir test fallando para `upsertProject` y `markStale`**

Crear `tests/lib/ingestion/persistence.test.ts`:

```typescript
import { upsertProject, markStale, updateSourceStatus } from "@/lib/ingestion/persistence";
import prisma from "@/lib/prisma";
import type { RawProject } from "@/lib/ingestion/types";

jest.mock("@/lib/ingestion/validateUrl", () => ({
  validateUrl: jest.fn().mockResolvedValue({ ok: true }),
}));

describe("upsertProject", () => {
  beforeEach(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "test-fixture" } } });
    await prisma.source.upsert({
      where: { slug: "test-source" },
      update: {},
      create: { slug: "test-source", name: "Test", type: "scraper" },
    });
  });
  afterAll(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "test-fixture" } } });
    await prisma.source.deleteMany({ where: { slug: "test-source" } });
    await prisma.$disconnect();
  });

  const sample: RawProject = {
    title: "Convocatoria Test",
    institution: "Test Institution",
    url: "https://test-fixture.com/conv/1",
    deadline: new Date("2026-12-31"),
  };

  it("inserta nuevo proyecto", async () => {
    const r = await upsertProject(sample, "test-source");
    expect(r.skipped).toBeFalsy();
    const found = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/1" },
    });
    expect(found).not.toBeNull();
    expect(found!.discoveredBy).toBe("scraper");
  });

  it("actualiza lastSeenAt en re-upsert", async () => {
    await upsertProject(sample, "test-source");
    const before = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/1" },
    });
    await new Promise((r) => setTimeout(r, 50));
    await upsertProject(sample, "test-source");
    const after = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/1" },
    });
    expect(after!.lastSeenAt.getTime()).toBeGreaterThan(before!.lastSeenAt.getTime());
  });

  it("salta si validateUrl falla", async () => {
    const { validateUrl } = require("@/lib/ingestion/validateUrl");
    (validateUrl as jest.Mock).mockResolvedValueOnce({ ok: false, reason: "404" });
    const r = await upsertProject(
      { ...sample, url: "https://test-fixture.com/conv/dead" },
      "test-source"
    );
    expect(r.skipped).toBe(true);
    expect(r.reason).toContain("404");
    const found = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/dead" },
    });
    expect(found).toBeNull();
  });
});

describe("markStale", () => {
  beforeEach(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "stale-fixture" } } });
  });
  afterAll(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "stale-fixture" } } });
    await prisma.$disconnect();
  });

  it("cierra proyectos con lastSeenAt > 7 días", async () => {
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    await prisma.project.create({
      data: {
        canonicalUrl: "https://stale-fixture.com/old",
        url_bases: "https://stale-fixture.com/old",
        nombre: "Old", institucion: "X", monto: 0,
        fecha_cierre: new Date("2027-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
        lastSeenAt: old,
      },
    });
    await markStale();
    const r = await prisma.project.findUnique({ where: { canonicalUrl: "https://stale-fixture.com/old" } });
    expect(r!.estadoPostulacion).toBe("Cerrada");
  });

  it("cierra proyectos con fecha_cierre vencida", async () => {
    await prisma.project.create({
      data: {
        canonicalUrl: "https://stale-fixture.com/expired",
        url_bases: "https://stale-fixture.com/expired",
        nombre: "Expired", institucion: "X", monto: 0,
        fecha_cierre: new Date("2020-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
      },
    });
    await markStale();
    const r = await prisma.project.findUnique({ where: { canonicalUrl: "https://stale-fixture.com/expired" } });
    expect(r!.estadoPostulacion).toBe("Cerrada");
  });
});
```

- [ ] **Step 2.2: Correr tests — esperado FAIL**

```bash
npm test -- tests/lib/ingestion/persistence.test.ts
```

Esperado: error "Cannot find module '@/lib/ingestion/persistence'".

- [ ] **Step 2.3: Crear `lib/ingestion/persistence.ts`**

```typescript
import prisma from "@/lib/prisma";
import { normalizeUrl } from "./utils";
import { validateUrl } from "./validateUrl";
import type { RawProject } from "./types";

const STALE_DAYS = 7;

export async function upsertProject(
  raw: RawProject,
  sourceSlug: string
): Promise<{ skipped?: boolean; reason?: string }> {
  const validation = await validateUrl(raw.url);
  if (!validation.ok) {
    return { skipped: true, reason: validation.reason };
  }
  const canonicalUrl = normalizeUrl(raw.url);
  if (!canonicalUrl) {
    return { skipped: true, reason: "URL no normalizable" };
  }

  const source = await prisma.source.findUnique({ where: { slug: sourceSlug } });
  if (!source) {
    return { skipped: true, reason: `Source '${sourceSlug}' no existe` };
  }

  const now = new Date();
  const baseFields = {
    nombre: raw.title,
    institucion: raw.institution,
    url_bases: raw.url,
    fecha_cierre: raw.deadline ?? new Date("2099-12-31"),
    monto: 0,
    estado: "Activo",
    categoria: raw.tags?.[0] ?? "General",
    objetivo: raw.description ?? "",
    ambito: raw.ambito ?? "Nacional",
    region: raw.region ?? null,
    lastSeenAt: now,
  };

  await prisma.project.upsert({
    where: { canonicalUrl },
    update: baseFields,
    create: {
      ...baseFields,
      canonicalUrl,
      firstSeenAt: now,
      discoveredBy: "scraper",
      needsReview: false,
      sourceId: source.id,
      estadoPostulacion: "Abierta",
    },
  });

  return {};
}

export async function markStale(): Promise<{ markedByLastSeen: number; markedByDeadline: number }> {
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

  const byLastSeen = await prisma.project.updateMany({
    where: {
      lastSeenAt: { lt: staleCutoff },
      estadoPostulacion: "Abierta",
      discoveredBy: { not: "manual" }, // proyectos manuales no se auto-cierran
    },
    data: { estadoPostulacion: "Cerrada" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const byDeadline = await prisma.project.updateMany({
    where: {
      fecha_cierre: { lt: today },
      estadoPostulacion: "Abierta",
    },
    data: { estadoPostulacion: "Cerrada" },
  });

  return { markedByLastSeen: byLastSeen.count, markedByDeadline: byDeadline.count };
}

export async function updateSourceStatus(
  slug: string,
  status: "success" | "error" | "partial",
  count: number,
  errorMsg?: string
): Promise<void> {
  await prisma.source.update({
    where: { slug },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: status,
      lastRunError: errorMsg ?? null,
      projectsCount: count,
    },
  });
}
```

- [ ] **Step 2.4: Correr tests — esperado PASS**

```bash
npm test -- tests/lib/ingestion/persistence.test.ts
```

Esperado: 5 tests PASS. (Requiere DB Supabase reachable. Si en CI no hay Supabase, marcar este test con `describe.skip` cuando no hay `DATABASE_URL` y correrlo localmente.)

- [ ] **Step 2.5: Crear `lib/ingestion/registry.ts` (vacío inicialmente)**

```typescript
import type { Scraper } from "./types";

export const scrapers: Scraper[] = [
  // Se irán agregando uno por uno en las próximas tareas
];
```

- [ ] **Step 2.6: Crear `scripts/run-scrapers.ts`**

```typescript
import { scrapers } from "../lib/ingestion/registry";
import { upsertProject, markStale, updateSourceStatus } from "../lib/ingestion/persistence";
import prisma from "../lib/prisma";

async function runOne(scraper: typeof scrapers[number]) {
  console.log(`[${scraper.slug}] Iniciando...`);
  try {
    const result = await scraper.scrape();
    let inserted = 0;
    const skipReasons: string[] = [];

    for (const raw of result.projects) {
      const r = await upsertProject(raw, scraper.slug);
      if (r.skipped) {
        skipReasons.push(`${raw.url}: ${r.reason}`);
      } else {
        inserted++;
      }
    }

    const status: "success" | "partial" =
      result.partialErrors.length > 0 || skipReasons.length > 0 ? "partial" : "success";
    const errorSummary = [
      ...result.partialErrors.slice(0, 5),
      ...skipReasons.slice(0, 5),
    ].join("\n") || undefined;

    await updateSourceStatus(scraper.slug, status, inserted, errorSummary);
    console.log(`[${scraper.slug}] ✅ ${inserted} ingestados (${result.projects.length} crudos), status=${status}`);
  } catch (err) {
    const msg = (err as Error).message;
    await updateSourceStatus(scraper.slug, "error", 0, msg);
    console.error(`[${scraper.slug}] ❌ ${msg}`);
    throw err;
  }
}

async function main() {
  if (scrapers.length === 0) {
    console.warn("[run-scrapers] Registry vacío, nada que correr.");
    return;
  }
  console.log(`[run-scrapers] Corriendo ${scrapers.length} scrapers en paralelo...`);

  const results = await Promise.allSettled(scrapers.map(runOne));

  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`[run-scrapers] Terminado. Fallidos: ${failed}/${scrapers.length}`);

  console.log(`[run-scrapers] Marcando proyectos stale...`);
  const stale = await markStale();
  console.log(`[run-scrapers] Stale: ${stale.markedByLastSeen} por lastSeenAt, ${stale.markedByDeadline} por deadline`);

  await prisma.$disconnect();

  if (failed === scrapers.length) {
    process.exit(1); // si TODO falló, alerta
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2.7: Correr el runner contra registry vacío**

```bash
npx tsx scripts/run-scrapers.ts
```

Esperado: imprime `Registry vacío, nada que correr.` y `Stale: ...` (probablemente 0). Sale con código 0.

- [ ] **Step 2.8: Commit**

```bash
git add lib/ingestion/persistence.ts lib/ingestion/registry.ts scripts/run-scrapers.ts tests/lib/ingestion/persistence.test.ts
git commit -m "feat: persistencia + runner de scrapers

- upsertProject con validación URL antes de tocar BD
- markStale: cierra proyectos con lastSeenAt > 7 días o deadline vencida
- updateSourceStatus: actualiza tabla Source tras cada run
- run-scrapers.ts ejecuta scrapers en paralelo con Promise.allSettled,
  aislamiento de fallos (una fuente no rompe las demás)"
```

---

## Task 3: Primer scraper — FIA + workflow GitHub Actions

**Files:**
- Create: `lib/ingestion/scrapers/fia.ts`
- Create: `tests/lib/ingestion/scrapers/fia.test.ts`
- Create: `tests/fixtures/fia.html`
- Modify: `lib/ingestion/registry.ts`
- Create: `.github/workflows/ingest-scrapers.yml`

- [ ] **Step 3.1: Capturar HTML real de FIA como fixture**

Abrir https://www.fia.cl/convocatorias/ en el navegador. **View source** o usar:

```bash
curl -A "IICA-Chile-Bot/1.0" -L "https://www.fia.cl/convocatorias/" -o tests/fixtures/fia.html
```

Inspeccionar la estructura. Identificar el selector CSS de cada card de convocatoria (probablemente algo como `article.convocatoria`, `.convocatoria-card`, `.card-news`, etc.). Para los pasos siguientes asumimos `article.convocatoria` con sub-elementos `h3 > a` (título + link), `.fecha` (fecha cierre), `.descripcion` (texto). **El engineer ajusta los selectores reales a lo que ve en el HTML.**

- [ ] **Step 3.2: Escribir test fallando para FIA scraper**

Crear `tests/lib/ingestion/scrapers/fia.test.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";
import { fiaScraper } from "@/lib/ingestion/scrapers/fia";

global.fetch = jest.fn();

describe("fiaScraper", () => {
  it("parsea HTML fixture y extrae proyectos", async () => {
    const html = fs.readFileSync(path.join(__dirname, "../../../fixtures/fia.html"), "utf-8");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await fiaScraper.scrape();

    expect(result.sourceSlug).toBe("fia");
    expect(result.projects.length).toBeGreaterThan(0);
    const first = result.projects[0];
    expect(first.title).toBeTruthy();
    expect(first.url).toMatch(/^https:\/\/(www\.)?fia\.cl\//);
    expect(first.institution).toBe("FIA");
  });

  it("captura partialErrors si una card está mal formada", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<article class='convocatoria'></article>"),
    });
    const result = await fiaScraper.scrape();
    expect(result.partialErrors.length).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 3.3: Correr test — esperado FAIL**

```bash
npm test -- tests/lib/ingestion/scrapers/fia.test.ts
```

Esperado: "Cannot find module '@/lib/ingestion/scrapers/fia'".

- [ ] **Step 3.4: Implementar `lib/ingestion/scrapers/fia.ts`**

```typescript
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const fiaScraper: Scraper = {
  slug: "fia",
  name: "FIA — Fundación para la Innovación Agraria",
  homepageUrl: "https://www.fia.cl/convocatorias/",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    const $ = load(html);

    // AJUSTAR EL SELECTOR según HTML real de FIA
    $("article.convocatoria, .convocatoria-card, .post-convocatoria").each((_, el) => {
      try {
        const $el = $(el);
        const $titleLink = $el.find("h3 a, h2 a, .titulo a").first();
        const title = cleanText($titleLink.text());
        if (!title) return;

        const href = $titleLink.attr("href");
        if (!href) {
          partialErrors.push("card sin href");
          return;
        }
        const url = absoluteUrl(href, this.homepageUrl);

        const fechaTxt = cleanText($el.find(".fecha-cierre, .fecha, time").text());
        const deadline = parseSpanishDate(fechaTxt);

        const description = cleanText($el.find(".descripcion, .extracto, p").first().text());

        projects.push({
          title,
          institution: "FIA",
          url,
          deadline,
          description,
          ambito: "Nacional",
        });
      } catch (err) {
        partialErrors.push(`parse error: ${(err as Error).message}`);
      }
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
```

- [ ] **Step 3.5: Correr test — esperado PASS**

```bash
npm test -- tests/lib/ingestion/scrapers/fia.test.ts
```

Esperado: 2 tests PASS. **Si falla porque el fixture no contiene cards reconocibles**, ajustar el selector en `scrapers/fia.ts` hasta que parsee correctamente lo que está en `tests/fixtures/fia.html`.

- [ ] **Step 3.6: Agregar FIA al registry**

Modificar `lib/ingestion/registry.ts`:

```typescript
import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";

export const scrapers: Scraper[] = [
  fiaScraper,
];
```

- [ ] **Step 3.7: Probar scraper en vivo localmente**

```bash
npx tsx scripts/run-scrapers.ts
```

Esperado: `[fia] ✅ N ingestados...` con N > 0. Verificar en Supabase que aparezcan filas con `sourceId` apuntando a FIA y `discoveredBy = "scraper"`.

- [ ] **Step 3.8: Crear workflow GitHub Actions**

Crear `.github/workflows/ingest-scrapers.yml`:

```yaml
name: Ingesta diaria de proyectos

on:
  schedule:
    - cron: "0 6 * * *"  # 06:00 UTC = 03:00 Chile
  workflow_dispatch:
    inputs:
      only:
        description: "Slug de un solo scraper a correr (opcional)"
        required: false
        default: ""

jobs:
  ingest:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run scrapers
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
          ONLY_SCRAPER: ${{ github.event.inputs.only }}
        run: npx tsx scripts/run-scrapers.ts

      - name: Summary
        if: always()
        run: |
          echo "## Resultado de ingesta" >> $GITHUB_STEP_SUMMARY
          echo "- Ejecutado: $(date -u +%FT%TZ)" >> $GITHUB_STEP_SUMMARY
          echo "- Disparador: ${{ github.event_name }}" >> $GITHUB_STEP_SUMMARY
```

- [ ] **Step 3.9: Verificar que el workflow es válido**

```bash
# Si tenés `act` instalado:
act -W .github/workflows/ingest-scrapers.yml --list

# O simplemente sintaxis YAML:
npx js-yaml .github/workflows/ingest-scrapers.yml > /dev/null && echo OK
```

- [ ] **Step 3.10: Commit y push**

```bash
git add lib/ingestion/scrapers/fia.ts lib/ingestion/registry.ts tests/lib/ingestion/scrapers/fia.test.ts tests/fixtures/fia.html .github/workflows/ingest-scrapers.yml
git commit -m "feat: primer scraper FIA + workflow ingesta diaria

- Scraper FIA con fixture HTML para tests deterministicos
- Workflow ingest-scrapers.yml corre cron diario 06:00 UTC
- Registro en lib/ingestion/registry.ts
- Aislamiento de fallos: una card mal formada no rompe el scraper"
git push
```

- [ ] **Step 3.11: Triggerear el workflow manualmente desde GitHub UI**

En GitHub → Actions → "Ingesta diaria de proyectos" → "Run workflow" → branch `feat/pipeline-ingesta-busqueda` → Run.

Verificar en logs que termina exitoso.

- [ ] **Step 3.12: CHECKPOINT con usuaria — verificación end-to-end del primer scraper**

> Pedir a la usuaria que verifique:
> 1. **En Supabase Studio**: tabla `Project` tiene filas con `sourceId` apuntando a FIA, `discoveredBy = "scraper"`, `lastSeenAt` reciente (hoy).
> 2. **En `/admin/sources`** (cuando exista, post-Task 10): FIA aparece con `lastRunStatus = "success"` y `projectsCount > 0`. *(Si Task 10 aún no está hecha, saltarse este punto.)*
> 3. **En la web del proyecto** (ya levantada con `npm run dev` o en preview de Vercel): hacer una búsqueda con un término de FIA — los resultados deben aparecer con datos reales del scraper, no el `BASE_PROJECTS` viejo.
> 4. **En GitHub Actions UI**: el run del workflow tiene status verde y duración <5 min.
>
> Este es el primer momento de "valor visible" del pipeline. Si algo no funciona acá, probablemente está roto el contrato `Scraper` o el runner. NO avanzar a Task 4 sin esta verificación.

---

## Task 4: Scrapers INDAP y CORFO

**Files:**
- Create: `lib/ingestion/scrapers/indap.ts`
- Create: `lib/ingestion/scrapers/corfo.ts`
- Create: `tests/lib/ingestion/scrapers/indap.test.ts`
- Create: `tests/lib/ingestion/scrapers/corfo.test.ts`
- Create: `tests/fixtures/indap.html`
- Create: `tests/fixtures/corfo.html`
- Modify: `lib/ingestion/registry.ts`

- [ ] **Step 4.1: Capturar fixtures HTML reales**

```bash
curl -A "IICA-Chile-Bot/1.0" -L "https://www.indap.gob.cl/convocatorias" -o tests/fixtures/indap.html
curl -A "IICA-Chile-Bot/1.0" -L "https://www.corfo.cl/convocatorias" -o tests/fixtures/corfo.html
```

(Si las URLs específicas no traen lo esperado, ajustar a la página de convocatorias real de cada institución.)

- [ ] **Step 4.2: Test fallando para INDAP**

Crear `tests/lib/ingestion/scrapers/indap.test.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";
import { indapScraper } from "@/lib/ingestion/scrapers/indap";

global.fetch = jest.fn();

describe("indapScraper", () => {
  it("parsea HTML fixture y extrae proyectos", async () => {
    const html = fs.readFileSync(path.join(__dirname, "../../../fixtures/indap.html"), "utf-8");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });
    const result = await indapScraper.scrape();
    expect(result.sourceSlug).toBe("indap");
    expect(result.projects.length).toBeGreaterThan(0);
    expect(result.projects[0].institution).toBe("INDAP");
  });
});
```

- [ ] **Step 4.3: Correr test — esperado FAIL**

```bash
npm test -- tests/lib/ingestion/scrapers/indap.test.ts
```

- [ ] **Step 4.4: Implementar `lib/ingestion/scrapers/indap.ts`**

```typescript
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const indapScraper: Scraper = {
  slug: "indap",
  name: "INDAP",
  homepageUrl: "https://www.indap.gob.cl/convocatorias",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    const $ = load(html);
    // Selector a ajustar tras inspeccionar HTML real
    $(".convocatoria, .programa-item, article.programa").each((_, el) => {
      try {
        const $el = $(el);
        const $link = $el.find("a").first();
        const title = cleanText($el.find("h2, h3, .titulo").first().text() || $link.text());
        if (!title) return;
        const href = $link.attr("href");
        if (!href) { partialErrors.push("sin href"); return; }
        const url = absoluteUrl(href, this.homepageUrl);
        const deadline = parseSpanishDate(cleanText($el.find(".fecha, time").text()));
        const description = cleanText($el.find(".descripcion, p").first().text());
        projects.push({ title, institution: "INDAP", url, deadline, description, ambito: "Nacional" });
      } catch (err) {
        partialErrors.push(`parse: ${(err as Error).message}`);
      }
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
```

- [ ] **Step 4.5: Correr test — esperado PASS**

Ajustar selectores si necesario hasta que el fixture parsee.

- [ ] **Step 4.6: Test fallando para CORFO**

Crear `tests/lib/ingestion/scrapers/corfo.test.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";
import { corfoScraper } from "@/lib/ingestion/scrapers/corfo";

global.fetch = jest.fn();

describe("corfoScraper", () => {
  it("parsea HTML fixture y extrae proyectos", async () => {
    const html = fs.readFileSync(path.join(__dirname, "../../../fixtures/corfo.html"), "utf-8");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });
    const result = await corfoScraper.scrape();
    expect(result.sourceSlug).toBe("corfo");
    expect(result.projects.length).toBeGreaterThan(0);
    expect(result.projects[0].institution).toBe("CORFO");
  });
});
```

- [ ] **Step 4.7: Correr test — esperado FAIL, luego implementar `corfo.ts`**

Crear `lib/ingestion/scrapers/corfo.ts` (mismo patrón que INDAP, ajustar selectores a HTML de CORFO):

```typescript
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const corfoScraper: Scraper = {
  slug: "corfo",
  name: "CORFO",
  homepageUrl: "https://www.corfo.cl/convocatorias",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    const $ = load(html);
    $(".convocatoria-card, .programa-card, article").each((_, el) => {
      try {
        const $el = $(el);
        const $link = $el.find("a").first();
        const title = cleanText($el.find("h2, h3, .titulo").first().text() || $link.text());
        if (!title) return;
        const href = $link.attr("href");
        if (!href) { partialErrors.push("sin href"); return; }
        const url = absoluteUrl(href, this.homepageUrl);
        const deadline = parseSpanishDate(cleanText($el.find(".fecha, time, .cierre").text()));
        const description = cleanText($el.find(".descripcion, p").first().text());
        projects.push({ title, institution: "CORFO", url, deadline, description, ambito: "Nacional" });
      } catch (err) {
        partialErrors.push(`parse: ${(err as Error).message}`);
      }
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
```

- [ ] **Step 4.8: Agregar al registry**

Modificar `lib/ingestion/registry.ts`:

```typescript
import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { indapScraper } from "./scrapers/indap";
import { corfoScraper } from "./scrapers/corfo";

export const scrapers: Scraper[] = [fiaScraper, indapScraper, corfoScraper];
```

- [ ] **Step 4.9: Correr todos los tests**

```bash
npm test -- tests/lib/ingestion/scrapers
```

Esperado: 4+ tests PASS.

- [ ] **Step 4.10: Probar runner localmente**

```bash
npx tsx scripts/run-scrapers.ts
```

Esperado: 3 fuentes ejecutadas. Si alguna falla por fixture o sitio caído, debe quedar marcada con `lastRunStatus = "error"` en BD pero las otras siguen.

- [ ] **Step 4.11: Commit**

```bash
git add lib/ingestion/scrapers/indap.ts lib/ingestion/scrapers/corfo.ts lib/ingestion/registry.ts tests/lib/ingestion/scrapers/indap.test.ts tests/lib/ingestion/scrapers/corfo.test.ts tests/fixtures/indap.html tests/fixtures/corfo.html
git commit -m "feat: scrapers INDAP y CORFO"
```

---

## Task 5: Scrapers FONTAGRO y IICA Hemisférico

**Files:**
- Create: `lib/ingestion/scrapers/fontagro.ts`
- Create: `lib/ingestion/scrapers/iica-hemisferico.ts`
- Create: `tests/lib/ingestion/scrapers/fontagro.test.ts`
- Create: `tests/lib/ingestion/scrapers/iica-hemisferico.test.ts`
- Create: `tests/fixtures/fontagro.html`
- Create: `tests/fixtures/iica-hemisferico.html`
- Modify: `lib/ingestion/registry.ts`

- [ ] **Step 5.1: Capturar fixtures**

```bash
curl -A "IICA-Chile-Bot/1.0" -L "https://www.fontagro.org/es/iniciativas/convocatorias/" -o tests/fixtures/fontagro.html
curl -A "IICA-Chile-Bot/1.0" -L "https://iica.int/es/licitaciones" -o tests/fixtures/iica-hemisferico.html
```

- [ ] **Step 5.2: Test fallando para FONTAGRO**

Crear `tests/lib/ingestion/scrapers/fontagro.test.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";
import { fontagroScraper } from "@/lib/ingestion/scrapers/fontagro";

global.fetch = jest.fn();

describe("fontagroScraper", () => {
  it("parsea fixture", async () => {
    const html = fs.readFileSync(path.join(__dirname, "../../../fixtures/fontagro.html"), "utf-8");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const result = await fontagroScraper.scrape();
    expect(result.sourceSlug).toBe("fontagro");
    expect(result.projects.length).toBeGreaterThan(0);
    expect(result.projects[0].ambito).toBe("Internacional");
  });
});
```

- [ ] **Step 5.3: Correr test — esperado FAIL, luego implementar `fontagro.ts`**

Crear `lib/ingestion/scrapers/fontagro.ts`:

```typescript
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const fontagroScraper: Scraper = {
  slug: "fontagro",
  name: "FONTAGRO",
  homepageUrl: "https://www.fontagro.org/es/iniciativas/convocatorias/",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    const $ = load(html);
    $("article, .post, .convocatoria-item").each((_, el) => {
      try {
        const $el = $(el);
        const $link = $el.find("a").first();
        const title = cleanText($el.find("h2, h3, .entry-title").first().text() || $link.text());
        if (!title) return;
        const href = $link.attr("href");
        if (!href) { partialErrors.push("sin href"); return; }
        const url = absoluteUrl(href, this.homepageUrl);
        const deadline = parseSpanishDate(cleanText($el.find(".fecha, time, .deadline").text()));
        const description = cleanText($el.find(".excerpt, p").first().text());
        projects.push({
          title, institution: "FONTAGRO", url, deadline, description,
          ambito: "Internacional",
          tags: ["FONTAGRO", "ALC"],
        });
      } catch (err) {
        partialErrors.push(`parse: ${(err as Error).message}`);
      }
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
```

- [ ] **Step 5.4: Correr test — esperado PASS** (ajustar selectores si necesario)

```bash
npm test -- tests/lib/ingestion/scrapers/fontagro.test.ts
```

- [ ] **Step 5.5: Test fallando para IICA Hemisférico**

Crear `tests/lib/ingestion/scrapers/iica-hemisferico.test.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";
import { iicaHemisfericoScraper } from "@/lib/ingestion/scrapers/iica-hemisferico";

global.fetch = jest.fn();

describe("iicaHemisfericoScraper", () => {
  it("parsea fixture", async () => {
    const html = fs.readFileSync(path.join(__dirname, "../../../fixtures/iica-hemisferico.html"), "utf-8");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const result = await iicaHemisfericoScraper.scrape();
    expect(result.sourceSlug).toBe("iica-hemisferico");
    expect(result.projects.length).toBeGreaterThan(0);
    expect(result.projects[0].institution).toContain("IICA");
  });
});
```

- [ ] **Step 5.6: Implementar `iica-hemisferico.ts`**

Crear `lib/ingestion/scrapers/iica-hemisferico.ts`:

```typescript
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const iicaHemisfericoScraper: Scraper = {
  slug: "iica-hemisferico",
  name: "IICA Hemisférico",
  homepageUrl: "https://iica.int/es/licitaciones",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    const $ = load(html);
    $(".licitacion, article, .views-row").each((_, el) => {
      try {
        const $el = $(el);
        const $link = $el.find("a").first();
        const title = cleanText($el.find("h2, h3, .titulo").first().text() || $link.text());
        if (!title) return;
        const href = $link.attr("href");
        if (!href) { partialErrors.push("sin href"); return; }
        const url = absoluteUrl(href, this.homepageUrl);
        const deadline = parseSpanishDate(cleanText($el.find(".fecha-cierre, .deadline, time").text()));
        const description = cleanText($el.find(".descripcion, p").first().text());
        projects.push({
          title,
          institution: "IICA Sede Central",
          url, deadline, description,
          ambito: "Internacional",
          tags: ["IICA", "Licitación institucional"],
        });
      } catch (err) {
        partialErrors.push(`parse: ${(err as Error).message}`);
      }
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
```

- [ ] **Step 5.7: Agregar al registry**

Modificar `lib/ingestion/registry.ts`:

```typescript
import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { indapScraper } from "./scrapers/indap";
import { corfoScraper } from "./scrapers/corfo";
import { fontagroScraper } from "./scrapers/fontagro";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";

export const scrapers: Scraper[] = [
  fiaScraper,
  indapScraper,
  corfoScraper,
  fontagroScraper,
  iicaHemisfericoScraper,
];
```

- [ ] **Step 5.8: Correr suite completa de scrapers**

```bash
npm test -- tests/lib/ingestion/scrapers
npx tsx scripts/run-scrapers.ts
```

Esperado: 5+ tests PASS, runner ingesta de las 5 fuentes.

- [ ] **Step 5.9: CHECKPOINT con usuaria — verificación de las 5 fuentes**

> Pedir a la usuaria que verifique:
> 1. **En Supabase**: filtrar `Project` por `source.slug IN (indap, fia, corfo, fontagro, iica-hemisferico)`. Cada slug debe tener al menos 1 proyecto con `lastSeenAt` de hoy.
> 2. **En `/admin/sources`** (si Task 10 ya está hecha): las 5 fuentes aparecen con `lastRunStatus` = `success` o `partial`. Si alguna está `error`, mostrar el `lastRunError` para diagnosticar.
> 3. **Buscar en la web** algún término genérico ("agrícola", "innovación") y confirmar que aparecen resultados de las 5 fuentes (mirar el campo `institucion`).
>
> Si una fuente no trajo nada o parsea mal, el problema está en su selector CSS — refrescar el fixture con curl, ajustar selectores. NO avanzar a Task 6.

- [ ] **Step 5.10: Commit**

```bash
git add lib/ingestion/scrapers/fontagro.ts lib/ingestion/scrapers/iica-hemisferico.ts lib/ingestion/registry.ts tests/lib/ingestion/scrapers/fontagro.test.ts tests/lib/ingestion/scrapers/iica-hemisferico.test.ts tests/fixtures/fontagro.html tests/fixtures/iica-hemisferico.html
git commit -m "feat: scrapers FONTAGRO e IICA Hemisférico — 5 fuentes Capa A completas"
```

---

## Task 6: Refactor Mercado Público al contrato común

**Files:**
- Create: `lib/ingestion/scrapers/mercado-publico.ts`
- Modify: `app/api/search-projects/route.ts` (importar desde nueva ubicación)
- Create: `tests/lib/ingestion/scrapers/mercado-publico.test.ts`

Mercado Público sigue siendo API live en cada búsqueda, **pero la lógica de fetch + filtrado se mueve a `lib/ingestion/scrapers/mercado-publico.ts`** para mantener todo el "qué fuentes existen" en un solo lugar. Exporta dos funciones: `fetchMercadoPublico(query)` (live para el endpoint) y `mercadoPublicoScraper` (cumple el contrato `Scraper` por consistencia, aunque NO se incluye en `registry.ts` porque no se ingesta a BD diariamente — Mercado Público es transitorio).

- [ ] **Step 6.1: Test fallando**

Crear `tests/lib/ingestion/scrapers/mercado-publico.test.ts`:

```typescript
import { fetchMercadoPublicoLive } from "@/lib/ingestion/scrapers/mercado-publico";

global.fetch = jest.fn();

describe("fetchMercadoPublicoLive", () => {
  it("filtra por keywords agrícolas", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Listado: [
          { CodigoExterno: "1", Nombre: "Asistencia técnica agrícola", FechaCierre: "2026-12-31T00:00:00" },
          { CodigoExterno: "2", Nombre: "Compra de computadores", FechaCierre: "2026-12-31T00:00:00" },
          { CodigoExterno: "3", Nombre: "Capacitación rural", FechaCierre: "2026-12-31T00:00:00" },
        ],
      }),
    });
    const result = await fetchMercadoPublicoLive("ticket-test", "");
    expect(result.length).toBe(2);
    expect(result.find((p) => p.title.includes("computadores"))).toBeUndefined();
  });

  it("devuelve [] si la API falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    const result = await fetchMercadoPublicoLive("ticket-test", "");
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 6.2: Correr test — esperado FAIL**

```bash
npm test -- tests/lib/ingestion/scrapers/mercado-publico.test.ts
```

- [ ] **Step 6.3: Implementar `lib/ingestion/scrapers/mercado-publico.ts`**

Migra la lógica que hoy está en `app/api/search-projects/route.ts` (función `fetchMercadoPublico`):

```typescript
import type { RawProject } from "../types";

const VALID_KEYWORDS = [
  "agrícola", "agricola", "rural", "riego", "asistencia técnica", "asistencia tecnica",
  "capacitación", "capacitacion", "estudio", "agro", "campesino", "forestal",
  "sustentable", "cambio climático", "cambio climatico", "agronomía", "agronomia",
  "veterinari", "ganader", "pecuaria", "silvoagropecuario", "indap", "sag", "conaf",
  "fia", "ciren", "innovación", "cooperativa", "apícola", "apicola", "hidrico", "hídrico",
];

const EXCLUDE_KEYWORDS = [
  "construcción", "construccion", "obra", "vehículo", "vehiculo", "guardia", "limpieza",
  "computador", "software", "equipo médico", "alimentación", "alimentacion", "hospital",
  "catering", "mantención", "mantencion", "arriendo", "pasaje", "hotel", "mobiliario",
  "aseo", "seguridad", "pavimentación", "hormigón", "camioneta",
];

export interface MercadoPublicoLive extends RawProject {
  codigoExterno: string;
  isLive: true;
}

export async function fetchMercadoPublicoLive(
  ticket: string,
  query: string
): Promise<MercadoPublicoLive[]> {
  if (!ticket) return [];
  try {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    const url = `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=${d}${m}${y}&ticket=${ticket}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.Listado || !Array.isArray(data.Listado)) return [];

    const queryLower = query.toLowerCase().trim();
    const allowed = queryLower ? [...VALID_KEYWORDS, queryLower] : VALID_KEYWORDS;

    const filtered = data.Listado.filter((lic: any) => {
      const text = (lic.Nombre || "").toLowerCase();
      const isAffinity = allowed.some((k) => text.includes(k));
      if (!isAffinity) return false;
      const isExcluded = EXCLUDE_KEYWORDS.some((k) => text.includes(k));
      return !isExcluded;
    });

    return filtered.map((lic: any) => {
      const deadlineISO = lic.FechaCierre ? lic.FechaCierre.split("T")[0] : null;
      const deadline = deadlineISO ? new Date(deadlineISO) : null;
      return {
        codigoExterno: lic.CodigoExterno,
        title: `Mercado Público: ${lic.Nombre}`,
        institution: "Gobierno de Chile / Organismos Públicos",
        url: `https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?qs=${lic.CodigoExterno}`,
        deadline,
        description: `Licitación Mercado Público (Cod: ${lic.CodigoExterno}). Alineación detectada con mandato técnico/agrícola.`,
        tags: ["Mercado Público", "Licitación Nacional"],
        ambito: "Nacional" as const,
        isLive: true as const,
      };
    });
  } catch (err) {
    console.error("[mercado-publico] error:", err);
    return [];
  }
}
```

- [ ] **Step 6.4: Correr test — esperado PASS**

```bash
npm test -- tests/lib/ingestion/scrapers/mercado-publico.test.ts
```

- [ ] **Step 6.5: Commit (sin tocar todavía el endpoint — eso es Task 8)**

```bash
git add lib/ingestion/scrapers/mercado-publico.ts tests/lib/ingestion/scrapers/mercado-publico.test.ts
git commit -m "refactor: extraer Mercado Público live a lib/ingestion/scrapers"
```

---

## Task 7: AI Discovery con guardrails (Capa B)

**Files:**
- Modify: `scripts/discover-projects.ts` (existente)
- Create: `tests/lib/ingestion/discover-guardrails.test.ts`

> Si `scripts/discover-projects.ts` no existe en el repo (porque el workflow `discover-projects.yml` lo usaba pero el script estaba en otra parte): crear el archivo desde cero con la versión modificada.

- [ ] **Step 7.1: Inspeccionar el script existente**

```bash
cat scripts/discover-projects.ts || echo "no existe — crearlo"
```

- [ ] **Step 7.2: Test fallando para los guardrails**

Crear `tests/lib/ingestion/discover-guardrails.test.ts`:

```typescript
import { passesGuardrails } from "@/scripts/discover-projects-lib";

jest.mock("@/lib/ingestion/validateUrl", () => ({
  validateUrl: jest.fn(),
}));
const { validateUrl } = require("@/lib/ingestion/validateUrl");

describe("passesGuardrails", () => {
  beforeEach(() => validateUrl.mockReset());

  it("descarta si snippet < 15 palabras", async () => {
    const r = await passesGuardrails({
      url: "https://x.com/a", title: "T", source_snippet: "muy corto",
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("snippet");
  });

  it("descarta si snippet vacío", async () => {
    const r = await passesGuardrails({ url: "https://x.com/a", title: "T", source_snippet: "" });
    expect(r.ok).toBe(false);
  });

  it("descarta si URL no resuelve", async () => {
    validateUrl.mockResolvedValue({ ok: false, reason: "404" });
    const r = await passesGuardrails({
      url: "https://x.com/a",
      title: "T",
      source_snippet: "este snippet tiene exactamente quince palabras suficientes para superar el umbral mínimo establecido",
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("404");
  });

  it("acepta cuando snippet >= 15 palabras y URL ok", async () => {
    validateUrl.mockResolvedValue({ ok: true });
    const r = await passesGuardrails({
      url: "https://x.com/a",
      title: "T",
      source_snippet: "este snippet tiene exactamente quince palabras suficientes para superar el umbral mínimo establecido",
    });
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 7.3: Correr test — esperado FAIL**

```bash
npm test -- tests/lib/ingestion/discover-guardrails.test.ts
```

- [ ] **Step 7.4: Crear `scripts/discover-projects-lib.ts`** (helpers reutilizables y testeables)

```typescript
import { validateUrl } from "../lib/ingestion/validateUrl";

export interface AiResult {
  url: string;
  title: string;
  source_snippet: string;
  institution?: string;
  description?: string;
  deadline?: string;
}

export async function passesGuardrails(
  r: AiResult
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const wordCount = (r.source_snippet || "").trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 15) {
    return { ok: false, reason: `snippet < 15 palabras (${wordCount})` };
  }
  const v = await validateUrl(r.url);
  if (!v.ok) return { ok: false, reason: v.reason ?? "URL inválida" };
  return { ok: true };
}
```

- [ ] **Step 7.5: Correr tests — esperado PASS**

- [ ] **Step 7.6: Modificar/crear `scripts/discover-projects.ts`**

Reescribir el script entero con la nueva versión:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import prisma from "../lib/prisma";
import { passesGuardrails, type AiResult } from "./discover-projects-lib";
import { normalizeUrl, parseSpanishDate } from "../lib/ingestion/utils";

const SYSTEM_PROMPT = `Sos el motor de descubrimiento de oportunidades de financiamiento agrícola del IICA Chile.

Buscás proyectos REALES Y VIGENTES donde el IICA Chile pueda participar institucionalmente.

REGLA CRÍTICA: Solo incluí proyectos donde puedas citar el snippet exacto del web_search que viste (campo source_snippet, mínimo 15 palabras). Si no tenés un snippet textual del search result que mencione el proyecto, NO lo incluyas. NO inventes URLs, fechas ni montos. Si un dato no está en los snippets que recibiste, dejá el campo vacío en vez de adivinar.

FUENTES preferidas (pero podés explorar otras):
- fontagro.org/convocatorias
- fao.org/chile y fao.org/americas/tcp
- iadb.org (BID asistencia técnica)
- ifad.org (FIDA)
- thegef.org y greenclimate.fund
- euroclima.org
- fia.cl, indap.gob.cl, corfo.cl
- mercadopublico.cl

Respondé SOLO con JSON válido (sin markdown, sin backticks):
{
  "results": [
    {
      "url": "URL real (no homepage genérica)",
      "title": "Título del proyecto",
      "institution": "Institución",
      "description": "1-2 oraciones",
      "deadline": "DD-MM-YYYY o vacío",
      "source_snippet": "TEXTO LITERAL del search result, >= 15 palabras"
    }
  ]
}`;

async function callClaudeWithWebSearch(query: string): Promise<AiResult[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    tools: [{ type: "web_search_20250305", name: "web_search" } as any],
    messages: [{
      role: "user",
      content: query
        ? `Buscá oportunidades nuevas de financiamiento agrícola para IICA Chile sobre: ${query}`
        : "Buscá oportunidades nuevas de financiamiento agrícola para IICA Chile, vigentes a hoy.",
    }],
  });

  const text = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed.results) ? parsed.results : [];
  } catch {
    return [];
  }
}

async function main() {
  const query = process.env.DISCOVERY_QUERY || "";
  console.log(`[discover] query: "${query || '(general)'}"`);

  const results = await callClaudeWithWebSearch(query);
  console.log(`[discover] Claude devolvió ${results.length} resultados crudos`);

  const aiSource = await prisma.source.findUnique({ where: { slug: "ai-discovery" } });
  if (!aiSource) {
    console.error("[discover] Source 'ai-discovery' no existe. Corré seed-sources.ts.");
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;
  let discarded = 0;
  const discardReasons: string[] = [];

  for (const r of results) {
    const guard = await passesGuardrails(r);
    if (!guard.ok) {
      discarded++;
      discardReasons.push(`${r.url || "(sin url)"}: ${guard.reason}`);
      continue;
    }

    const canonicalUrl = normalizeUrl(r.url);
    if (!canonicalUrl) { discarded++; continue; }

    const existing = await prisma.project.findUnique({ where: { canonicalUrl } });
    if (existing) {
      await prisma.project.update({
        where: { canonicalUrl },
        data: { lastSeenAt: new Date() },
      });
      updated++;
      continue;
    }

    const deadline = r.deadline ? parseSpanishDate(r.deadline) : null;
    await prisma.project.create({
      data: {
        canonicalUrl,
        url_bases: r.url,
        nombre: r.title,
        institucion: r.institution || "Por confirmar",
        objetivo: r.description || "",
        fecha_cierre: deadline ?? new Date("2099-12-31"),
        monto: 0,
        estado: "Activo",
        categoria: "AI Discovery",
        notasInternas: `AI snippet: "${r.source_snippet.slice(0, 200)}..."`,
        discoveredBy: "ai",
        needsReview: true,
        sourceId: aiSource.id,
        estadoPostulacion: "Abierta",
        ambito: "Internacional",
      },
    });
    inserted++;
  }

  await prisma.source.update({
    where: { slug: "ai-discovery" },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: discarded === results.length ? "error" : "success",
      lastRunError: discardReasons.slice(0, 5).join("\n") || null,
      projectsCount: inserted + updated,
    },
  });

  console.log(`[discover] Insertados: ${inserted}, Actualizados: ${updated}, Descartados: ${discarded}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 7.7: Verificar tipos**

```bash
npm run typecheck
```

Si `claude-sonnet-4-6` u otro modelo da error de tipos, ajustar al ID de modelo válido al momento (verificar en docs Anthropic).

- [ ] **Step 7.8: Modificar workflow `.github/workflows/discover-projects.yml`**

El workflow actual escribía a JSON. Reemplazar el step `Ejecutar script de descubrimiento` y siguientes para que solo corra el script (que ahora escribe a BD):

```yaml
      - name: Ejecutar descubrimiento
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
          DISCOVERY_QUERY: ${{ github.event.inputs.query }}
        run: |
          npx prisma generate
          npx tsx scripts/discover-projects.ts

      - name: Resumen
        if: always()
        run: |
          echo "## Resultado del descubrimiento" >> $GITHUB_STEP_SUMMARY
          echo "- Ejecutado: $(date -u +%FT%TZ)" >> $GITHUB_STEP_SUMMARY
```

Eliminar steps "Verificar si hay cambios" y "Commit de nuevas convocatorias" (ya no commiteamos JSON).

- [ ] **Step 7.9: Probar el workflow desde GitHub UI**

Push y disparar manualmente. Verificar logs y BD: aparecen entradas con `discoveredBy = "ai"` y `needsReview = true`.

- [ ] **Step 7.10: Commit**

```bash
git add scripts/discover-projects.ts scripts/discover-projects-lib.ts tests/lib/ingestion/discover-guardrails.test.ts .github/workflows/discover-projects.yml
git commit -m "feat: AI Discovery con guardrails anti-alucinación

- Snippet textual >=15 palabras obligatorio
- validateUrl antes de insertar
- Snippet guardado en notasInternas para auditoría humana
- Workflow ya no commitea JSON; escribe directo a Supabase con
  discoveredBy=ai needsReview=true"
```

---

## Task 8: Refactor `/api/search-projects` (eliminar Claude runtime)

**Files:**
- Modify: `app/api/search-projects/route.ts` *(reescritura masiva, ~700 → ~150 LOC)*
- Create: `tests/api/search-projects.test.ts`

- [ ] **Step 8.1: Escribir test de integración**

Crear `tests/api/search-projects.test.ts`:

```typescript
import { POST } from "@/app/api/search-projects/route";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

jest.mock("@/lib/ingestion/scrapers/mercado-publico", () => ({
  fetchMercadoPublicoLive: jest.fn().mockResolvedValue([]),
}));

describe("POST /api/search-projects", () => {
  beforeAll(async () => {
    await prisma.source.upsert({
      where: { slug: "test-route" },
      update: {},
      create: { slug: "test-route", name: "test", type: "scraper" },
    });
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "search-test" } } });
    await prisma.project.create({
      data: {
        canonicalUrl: "https://search-test.com/verified",
        url_bases: "https://search-test.com/verified",
        nombre: "Verificado", institucion: "X", monto: 0,
        fecha_cierre: new Date("2027-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
        discoveredBy: "scraper", needsReview: false,
      },
    });
    await prisma.project.create({
      data: {
        canonicalUrl: "https://search-test.com/unverified",
        url_bases: "https://search-test.com/unverified",
        nombre: "Sin verificar", institucion: "X", monto: 0,
        fecha_cierre: new Date("2027-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
        discoveredBy: "ai", needsReview: true,
      },
    });
  });
  afterAll(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "search-test" } } });
    await prisma.source.deleteMany({ where: { slug: "test-route" } });
    await prisma.$disconnect();
  });

  function mkRequest(body: any) {
    return new NextRequest("http://x/api/search-projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("devuelve ambos cuando includeUnverified=true (default)", async () => {
    const res = await POST(mkRequest({ query: "" }));
    const data = await res.json();
    const titles = data.results.map((p: any) => p.nombre);
    expect(titles).toContain("Verificado");
    expect(titles).toContain("Sin verificar");
  });

  it("filtra needsReview=true cuando includeUnverified=false", async () => {
    const res = await POST(mkRequest({ query: "", includeUnverified: false }));
    const data = await res.json();
    const titles = data.results.map((p: any) => p.nombre);
    expect(titles).toContain("Verificado");
    expect(titles).not.toContain("Sin verificar");
  });
});
```

- [ ] **Step 8.2: Correr test — esperado FAIL** (porque el endpoint actual no acepta `includeUnverified`)

```bash
npm test -- tests/api/search-projects.test.ts
```

- [ ] **Step 8.3: Reescribir `app/api/search-projects/route.ts`**

Reemplazar contenido completo del archivo:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchMercadoPublicoLive } from "@/lib/ingestion/scrapers/mercado-publico";

interface SearchBody {
  query?: string;
  scope?: string;
  role?: string;
  includeUnverified?: boolean;
}

function calcDaysLeft(deadline: Date | null): number | null {
  if (!deadline) return null;
  const diff = deadline.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86400000));
}

export async function POST(req: NextRequest) {
  const body: SearchBody = await req.json().catch(() => ({}));
  const query = body.query?.trim() || "";
  const scope = body.scope || "all";
  const role = body.role || "all";
  const includeUnverified = body.includeUnverified !== false;

  const filters: any[] = [];
  if (query) {
    filters.push({
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { institucion: { contains: query, mode: "insensitive" } },
        { objetivo: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  if (scope !== "all") filters.push({ ambito: scope });
  if (role !== "all") filters.push({ rolIICA: role });
  if (!includeUnverified) filters.push({ needsReview: false });

  const where = filters.length > 0 ? { AND: filters } : {};

  const ticket = process.env.MERCADO_PUBLICO_TICKET || "";

  const [dbProjects, mpDocs] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { source: { select: { slug: true, name: true } } },
      orderBy: [{ estadoPostulacion: "asc" }, { fecha_cierre: "asc" }],
      take: 50,
    }),
    fetchMercadoPublicoLive(ticket, query),
  ]);

  const enriched = dbProjects.map((p) => ({
    ...p,
    days_left: calcDaysLeft(p.fecha_cierre),
  }));

  return NextResponse.json({
    results: [...enriched, ...mpDocs],
    meta: {
      total: enriched.length + mpDocs.length,
      db_count: enriched.length,
      mercado_publico_count: mpDocs.length,
      source: "db+mercadopublico",
      searched_at: new Date().toISOString(),
    },
  });
}

export async function GET() {
  const sources = await prisma.source.findMany({
    where: { enabled: true },
    select: { slug: true, name: true, lastRunAt: true, lastRunStatus: true, projectsCount: true },
  });
  return NextResponse.json({
    status: "ok",
    service: "IICA Chile - Búsqueda de Proyectos",
    sources,
  });
}
```

- [ ] **Step 8.4: Correr test — esperado PASS**

```bash
npm test -- tests/api/search-projects.test.ts
npm run typecheck
```

- [ ] **Step 8.5: Probar endpoint manualmente**

```bash
npm run dev
# en otra terminal:
curl -X POST http://localhost:3000/api/search-projects -H "content-type: application/json" -d '{"query":"FIA"}'
```

Esperado: respuesta en <1s con resultados de BD.

- [ ] **Step 8.6: CHECKPOINT con usuaria — verificación de búsqueda**

> Pedir a la usuaria que verifique en local con `npm run dev`:
> 1. Hacer 3 búsquedas distintas en la página principal. **Cada una debe responder en menos de 2 segundos** (no 10-30s como antes).
> 2. Ninguna búsqueda debe fallar con error. La rama Claude+web_search ya no existe en runtime.
> 3. Los resultados que aparecen son los de la BD (todos tienen URL real, no inventados).
> 4. Si Mercado Público está respondiendo, aparecen mezclados con prefijo "Mercado Público:".
>
> Si alguna búsqueda devuelve 0 resultados cuando antes traía algunos, revisar si el problema es la query (filtros muy estrictos) o la BD (vacía para ese término). NO avanzar a Task 9 sin esta verificación.

- [ ] **Step 8.7: Commit**

```bash
git add app/api/search-projects/route.ts tests/api/search-projects.test.ts
git commit -m "refactor: simplificar /api/search-projects, eliminar Claude runtime

- BD + Mercado Público live en paralelo
- Toggle includeUnverified filtra needsReview=true (default: true)
- ~700 LOC → ~80 LOC, respuesta <1s consistente"
```

---

## Task 9: Badge UI + toggle de filtro

**Files:**
- Modify: `components/OportunidadCard.tsx`
- Modify: `components/ProjectFilters.tsx` (o el componente que tiene los filtros)

> **Nota:** los detalles exactos del JSX dependen del componente actual. Los pasos siguientes muestran los CAMBIOS, no la reescritura. Adaptar la integración al patrón de cada componente.

- [ ] **Step 9.1: Agregar badge en `OportunidadCard.tsx`**

Abrir el archivo. Identificar dónde se renderiza el título del proyecto. **Justo debajo del título**, agregar:

```tsx
{(project as any).needsReview && (
  <span
    className="ai-badge"
    title="Encontrado por IA en el scan semanal. Pendiente de verificación por el equipo."
    style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      background: "#FFF8E1",
      color: "#C8A84B",
      border: "1px solid #C8A84B",
      marginLeft: 8,
    }}
  >
    🤖 Sin verificar
  </span>
)}
```

(`#C8A84B` es `iicaGold` que ya está en la paleta del proyecto.)

- [ ] **Step 9.2: Verificar visualmente en dev**

```bash
npm run dev
```

Ir a la página principal. Si todavía no hay proyectos con `needsReview=true` en BD, crear uno temporalmente desde Supabase Studio:

```sql
UPDATE "Project" SET "needsReview" = true WHERE id = (SELECT id FROM "Project" LIMIT 1);
```

Verificar que el badge aparece. Después revertir el UPDATE.

- [ ] **Step 9.3: Agregar toggle de filtro en `ProjectFilters.tsx`**

Identificar el componente que contiene los filtros (categoría, región, etc.). Agregar:

```tsx
<label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
  <input
    type="checkbox"
    checked={includeUnverified}
    onChange={(e) => onIncludeUnverifiedChange(e.target.checked)}
  />
  Incluir descubrimientos sin verificar 🤖
</label>
```

Donde `includeUnverified` y `onIncludeUnverifiedChange` son props nuevas. Default `true` (modo ágil).

- [ ] **Step 9.4: Pasar el flag al fetch de búsqueda**

En el componente padre que llama a `/api/search-projects`, agregar `includeUnverified` al body del POST:

```typescript
body: JSON.stringify({ query, category, region, includeUnverified })
```

- [ ] **Step 9.5: Probar manualmente**

```bash
npm run dev
```

Buscar algo. Toggle ON → aparecen `needsReview=true` con badge. Toggle OFF → no aparecen.

- [ ] **Step 9.6: CHECKPOINT con usuaria — verificación visual del badge y toggle**

> Pedir a la usuaria que verifique en local con `npm run dev`:
> 1. **Badge visible**: hacer una búsqueda. Si hay resultados con `needsReview=true` en BD, deben mostrar la pill dorada "🤖 Sin verificar" al lado del título. (Si no hay descubrimientos IA todavía, marcar manualmente uno desde Supabase Studio para probar el render.)
> 2. **Tooltip funciona**: pasar el mouse sobre el badge muestra el texto "Encontrado por IA en el scan semanal...".
> 3. **Toggle funciona**: el checkbox "Incluir descubrimientos sin verificar 🤖" en el panel de filtros está ON por default. Al desactivarlo y buscar de nuevo, los proyectos con badge desaparecen de los resultados.
> 4. **Estilo institucional**: el badge dorado encaja con la paleta IICA (no rompe el diseño).
>
> NO avanzar a Task 10 sin esta verificación.

- [ ] **Step 9.7: Commit**

```bash
git add components/OportunidadCard.tsx components/ProjectFilters.tsx components/ProjectExplorer.tsx
# ajustar a archivos realmente modificados
git commit -m "feat: badge '🤖 sin verificar' + toggle includeUnverified

- Badge dorado en OportunidadCard cuando project.needsReview=true
- Toggle en filtros, default ON (modo ágil)
- Body de /api/search-projects acepta includeUnverified"
```

---

## Task 10: Páginas admin (`/admin/sources`, `/admin/discoveries`) + auth

**Files:**
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/api/admin/login/route.ts`
- Create: `app/admin/sources/page.tsx`
- Create: `app/admin/discoveries/page.tsx`
- Create: `app/api/admin/discoveries/[id]/action/route.ts`

- [ ] **Step 10.1: Crear `middleware.ts`** (raíz del repo)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function expectedToken(): string {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "dev-secret")
    .update("admin-session")
    .digest("hex");
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  const expected = expectedToken();
  const valid =
    cookie.length === expected.length &&
    timingSafeEqual(Buffer.from(cookie, "hex"), Buffer.from(expected, "hex"));

  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
```

- [ ] **Step 10.2: Crear `app/admin/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "content-type": "application/json" },
    });
    if (res.ok) {
      router.push("/admin/sources");
    } else {
      setError("Contraseña incorrecta");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "120px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Admin IICA Chile</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
          style={{ padding: 10, fontSize: 14 }}
        />
        <button type="submit" style={{ padding: 10, background: "#2D7A2F", color: "white", border: "none", borderRadius: 6 }}>
          Entrar
        </button>
        {error && <span style={{ color: "#c62828" }}>{error}</span>}
      </form>
    </div>
  );
}
```

- [ ] **Step 10.3: Crear `app/api/admin/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !password || password.length !== expected.length) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const match = timingSafeEqual(Buffer.from(password), Buffer.from(expected));
  if (!match) return NextResponse.json({ ok: false }, { status: 401 });

  const token = createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "dev-secret")
    .update("admin-session")
    .digest("hex");

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 días
    path: "/",
  });
  return res;
}
```

- [ ] **Step 10.4: Crear `app/admin/sources/page.tsx`**

```tsx
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function statusEmoji(status: string | null): string {
  if (status === "success") return "✅";
  if (status === "partial") return "⚠️";
  if (status === "error") return "❌";
  return "❓";
}

function relative(date: Date | null): string {
  if (!date) return "—";
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({ orderBy: { slug: "asc" } });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Fuentes de datos — Salud</h1>
      <p style={{ color: "#666" }}>Estado de cada scraper / discovery.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr style={{ background: "#f5f2e8" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Fuente</th>
            <th style={{ padding: 8 }}>Estado</th>
            <th style={{ padding: 8 }}>Último run</th>
            <th style={{ padding: 8 }}>Proyectos</th>
            <th style={{ padding: 8, textAlign: "left" }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>
                <strong>{s.name}</strong>
                <div style={{ fontSize: 11, color: "#666" }}>{s.slug}</div>
              </td>
              <td style={{ padding: 8, textAlign: "center" }}>{statusEmoji(s.lastRunStatus)}</td>
              <td style={{ padding: 8, textAlign: "center" }}>{relative(s.lastRunAt)}</td>
              <td style={{ padding: 8, textAlign: "center" }}>{s.projectsCount}</td>
              <td style={{ padding: 8, fontSize: 12, color: "#c62828" }}>
                {s.lastRunError ? s.lastRunError.slice(0, 100) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 10.5: Crear `app/admin/discoveries/page.tsx`**

```tsx
import prisma from "@/lib/prisma";
import DiscoveriesClient from "./DiscoveriesClient";

export const dynamic = "force-dynamic";

export default async function DiscoveriesPage() {
  const items = await prisma.project.findMany({
    where: { needsReview: true, estadoPostulacion: "Abierta" },
    orderBy: { firstSeenAt: "desc" },
    take: 100,
  });

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Bandeja de Descubrimientos IA</h1>
      <p style={{ color: "#666" }}>
        {items.length} proyecto(s) encontrado(s) por Claude pendientes de revisión.
        El snippet textual del web search está en notas internas.
      </p>
      <DiscoveriesClient initial={items} />
    </div>
  );
}
```

Crear `app/admin/discoveries/DiscoveriesClient.tsx`:

```tsx
"use client";
import { useState } from "react";

export default function DiscoveriesClient({ initial }: { initial: any[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);

  async function act(id: number, action: "approve" | "discard") {
    setBusy(id);
    const res = await fetch(`/api/admin/discoveries/${id}/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (res.ok) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Error: " + res.statusText);
    }
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
      <thead>
        <tr style={{ background: "#f5f2e8" }}>
          <th style={{ padding: 8, textAlign: "left" }}>Proyecto</th>
          <th style={{ padding: 8 }}>Snippet</th>
          <th style={{ padding: 8 }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>
              <strong>{p.nombre}</strong>
              <div style={{ fontSize: 11, color: "#666" }}>{p.institucion}</div>
              <a href={p.url_bases} target="_blank" rel="noopener" style={{ fontSize: 11 }}>
                {p.url_bases}
              </a>
            </td>
            <td style={{ padding: 8, fontSize: 11, color: "#444", maxWidth: 400 }}>
              {(p.notasInternas || "").slice(0, 250)}
            </td>
            <td style={{ padding: 8, whiteSpace: "nowrap" }}>
              <button
                disabled={busy === p.id}
                onClick={() => act(p.id, "approve")}
                style={{ padding: "6px 12px", marginRight: 6, background: "#2D7A2F", color: "white", border: "none", borderRadius: 4 }}
              >
                Aprobar
              </button>
              <button
                disabled={busy === p.id}
                onClick={() => act(p.id, "discard")}
                style={{ padding: "6px 12px", background: "#c62828", color: "white", border: "none", borderRadius: 4 }}
              >
                Descartar
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr><td colSpan={3} style={{ padding: 20, textAlign: "center", color: "#666" }}>Bandeja vacía 🎉</td></tr>
        )}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 10.6: Crear `app/api/admin/discoveries/[id]/action/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const { action } = await req.json().catch(() => ({}));
  if (!["approve", "discard"].includes(action)) {
    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.project.update({
      where: { id },
      data: { needsReview: false },
    });
  } else {
    const today = new Date().toISOString().slice(0, 10);
    await prisma.project.update({
      where: { id },
      data: {
        estadoPostulacion: "Cerrada",
        notasInternas: `descartado por revisión IA ${today}`,
      },
    });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 10.7: Configurar env vars locales**

Agregar a `.env.local`:

```
ADMIN_PASSWORD=cambiar-en-produccion
ADMIN_SESSION_SECRET=  # generar con openssl rand -hex 32
```

- [ ] **Step 10.8: Probar manualmente**

```bash
npm run dev
```

Ir a `http://localhost:3000/admin/sources` → debe redirigir a `/admin/login`.
Ingresar password incorrecta → "Contraseña incorrecta".
Ingresar password correcta → redirige a `/admin/sources`, muestra tabla.
Ir a `/admin/discoveries` → muestra bandeja con descubrimientos pendientes.
Probar Aprobar y Descartar.

- [ ] **Step 10.9: Configurar env vars en Vercel**

En Vercel project settings → Environment Variables:
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` (generado con `openssl rand -hex 32`)

- [ ] **Step 10.10: CHECKPOINT con usuaria — verificación end-to-end del admin**

> Pedir a la usuaria que verifique en local (`npm run dev`):
> 1. **Login**: ir a `/admin/sources` → debe redirigir a `/admin/login`. Probar password incorrecto → "Contraseña incorrecta". Probar password correcto → redirige a `/admin/sources` y muestra la tabla de fuentes.
> 2. **Persistencia de sesión**: cerrar la pestaña, volver a abrir `/admin/sources` → debe entrar sin pedir login (cookie de 30 días activa).
> 3. **`/admin/sources`**: la tabla muestra las 6 fuentes con su estado, último run, conteo, y errores si los hay.
> 4. **`/admin/discoveries`**: lista los proyectos con `needsReview=true`. Cada uno muestra título, institución, URL, y el snippet IA en notas internas (truncado a 250 chars).
> 5. **Aprobar funciona**: clic en "Aprobar" en un descubrimiento → la fila desaparece. En Supabase, `needsReview` pasa a `false`. En la búsqueda principal, el badge ya no aparece para ese proyecto.
> 6. **Descartar funciona**: clic en "Descartar" → la fila desaparece. En Supabase, `estadoPostulacion = "Cerrada"` y `notasInternas` contiene "descartado por revisión IA".
>
> NO avanzar a Task 11 sin esta verificación.

- [ ] **Step 10.11: Commit y deploy**

```bash
git add middleware.ts app/admin/ app/api/admin/
git commit -m "feat: páginas admin /sources y /discoveries con auth HMAC

- /admin/login con password único + cookie firmada (HMAC-SHA256, 30 días)
- /admin/sources: dashboard de salud por fuente
- /admin/discoveries: bandeja con Aprobar/Descartar para descubrimientos IA
- middleware.ts protege /admin/* con timing-safe compare"
git push
```

---

## Task 11: Smoke test + cleanup + README de operación

**Files:**
- Create: `scripts/smoke-test.ts`
- Create: `docs/INGESTION.md`
- Modify: `.github/workflows/ingest-scrapers.yml` (agregar step de smoke test)
- Modify: `package.json` (agregar scripts útiles)

- [ ] **Step 11.1: Crear `scripts/smoke-test.ts`**

```typescript
const BASE = process.env.DEPLOYMENT_URL || "http://localhost:3000";

async function main() {
  console.log(`[smoke] testing ${BASE}/api/search-projects`);

  const res = await fetch(`${BASE}/api/search-projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "" }),
  });

  if (!res.ok) {
    console.error(`[smoke] HTTP ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  if (!Array.isArray(data.results)) {
    console.error("[smoke] results no es array:", data);
    process.exit(1);
  }
  if (data.results.length === 0) {
    console.error("[smoke] 0 resultados — la BD parece vacía");
    process.exit(1);
  }
  const sample = data.results[0];
  const requiredFields = ["nombre", "institucion", "url_bases"];
  for (const f of requiredFields) {
    if (!sample[f]) {
      console.error(`[smoke] sample missing field '${f}':`, sample);
      process.exit(1);
    }
  }
  console.log(`[smoke] ✅ ${data.results.length} resultados OK`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 11.2: Probar smoke test localmente**

```bash
npm run dev
# en otra terminal:
DEPLOYMENT_URL=http://localhost:3000 npx tsx scripts/smoke-test.ts
```

Esperado: `✅ N resultados OK`.

- [ ] **Step 11.3: Agregar smoke test al workflow ingest-scrapers**

Modificar `.github/workflows/ingest-scrapers.yml`, agregar al final del `jobs.ingest.steps`:

```yaml
      - name: Smoke test post-ingesta
        if: success()
        env:
          DEPLOYMENT_URL: ${{ secrets.DEPLOYMENT_URL }}
        run: npx tsx scripts/smoke-test.ts
```

- [ ] **Step 11.4: Crear `docs/INGESTION.md`** (README de operación)

```markdown
# Pipeline de Ingesta — Operación

Documentación práctica para mantener el pipeline de búsqueda de proyectos.

## Arquitectura rápida

- **Capa A** (diaria 06:00 UTC): scrapers determinísticos en GitHub Actions → Supabase
- **Capa B** (semanal lunes 12:00 UTC): AI Discovery con guardrails → Supabase con `needsReview=true`
- **Búsqueda** (`/api/search-projects`): query directa a Supabase + Mercado Público live

## Cómo agregar una nueva fuente

1. Crear `lib/ingestion/scrapers/<slug>.ts` con la interfaz `Scraper`
2. Crear fixture HTML en `tests/fixtures/<slug>.html`
3. Crear test en `tests/lib/ingestion/scrapers/<slug>.test.ts`
4. Agregar al array en `lib/ingestion/registry.ts`
5. Agregar entry en tabla `Source`:
   ```bash
   npx tsx scripts/seed-sources.ts
   ```
   (editar el archivo para incluir la nueva fuente)
6. Probar localmente: `npx tsx scripts/run-scrapers.ts`
7. Commit + push. El próximo cron diario la incluye automáticamente.

## Cómo correr el pipeline manualmente

```bash
# Todos los scrapers
npx tsx scripts/run-scrapers.ts

# Solo discovery IA
ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/discover-projects.ts

# Auditoría legacy (dry-run)
npx tsx scripts/audit-legacy-data.ts

# Auditoría legacy (apply)
npx tsx scripts/audit-legacy-data.ts -- --apply
```

## Cómo debuggear un scraper roto

1. `/admin/sources` → ver `lastRunStatus` y `lastRunError`
2. Si `partial`: el scraper corrió pero algunas cards fallaron — ajustar selector
3. Si `error`: el fetch fallo o crash total — ver logs de GitHub Actions
4. Refrescar fixture: `curl -A "IICA-Chile-Bot/1.0" -L <url> -o tests/fixtures/<slug>.html`
5. Correr test: `npm test -- tests/lib/ingestion/scrapers/<slug>.test.ts`

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
| `ANTHROPIC_API_KEY` | ✅ | ✅ | Claude para Capa B |
| `MERCADO_PUBLICO_TICKET` | ✅ | — | API Mercado Público |
| `ADMIN_PASSWORD` | ✅ | — | Auth `/admin/login` |
| `ADMIN_SESSION_SECRET` | ✅ | — | HMAC cookie firma |
| `DEPLOYMENT_URL` | — | ✅ | Smoke test post-deploy |

## Stale detection

`markStale()` corre al final de cada `run-scrapers.ts`:
- Proyectos con `lastSeenAt > 7 días` (y no `manual`) se marcan `Cerrada`
- Proyectos con `fecha_cierre < hoy` se marcan `Cerrada`

Si un proyecto desaparece de su fuente, eventualmente cae en stale (max 7 días).

## Limitaciones conocidas

- Dedup solo por URL canónica (no fuzzy por título). Misma convocatoria con URLs distintas aparece dos veces.
- Si una fuente requiere JS para renderizar, Cheerio no alcanza. Migrar a Playwright en `lib/ingestion/scrapers/<slug>.ts` cuando sea necesario.
- Capa B puede traer alucinaciones que pasan los guardrails. La revisión humana en `/admin/discoveries` es la última línea de defensa.
```

- [ ] **Step 11.5: Agregar scripts npm útiles**

Modificar `package.json`, en la sección `scripts`, agregar:

```json
    "ingest": "tsx scripts/run-scrapers.ts",
    "ingest:audit": "tsx scripts/audit-legacy-data.ts",
    "discover": "tsx scripts/discover-projects.ts",
    "smoke": "tsx scripts/smoke-test.ts"
```

- [ ] **Step 11.6: Eliminar archivos legacy obvios** *(opcional pero recomendado — reduce ruido)*

Estos archivos quedaron del Flask viejo y ya no se usan. **Solo remover los que estén realmente fuera de uso.** Verificar antes con `grep -r "<filename>" --include="*.ts" --include="*.tsx"`.

```bash
# Estos no se importan desde ningún archivo TS/TSX:
git rm data/discovered-projects.json  # ya no se commitea, se va a .gitignore en su lugar
echo "data/discovered-projects.json" >> .gitignore
```

(Si la usuaria prefiere preservar el JSON histórico como respaldo, saltear este paso.)

- [ ] **Step 11.7: Verificar build completo**

```bash
npm run typecheck
npm test
npm run build
```

Esperado: typecheck OK, todos los tests PASS, build sin errores.

- [ ] **Step 11.8: Commit final**

```bash
git add scripts/smoke-test.ts docs/INGESTION.md package.json .github/workflows/ingest-scrapers.yml .gitignore
git commit -m "feat: smoke test + README de operación + scripts npm

- scripts/smoke-test.ts valida endpoint post-deploy
- docs/INGESTION.md cubre cómo agregar fuentes, debuggear,
  aprobar descubrimientos, y operar el pipeline
- npm run ingest / discover / smoke como atajos"
git push
```

- [ ] **Step 11.9: Verificar en producción**

Esperar al próximo cron (o disparar manualmente desde GitHub Actions UI):
- ✅ `/admin/sources` muestra las 6 fuentes con `lastRunStatus = "success"`
- ✅ Buscar en la UI: respuesta <1s, resultados con datos verificados
- ✅ `/admin/discoveries` lista descubrimientos del último run de Capa B
- ✅ Badge "🤖 Sin verificar" aparece en cards correspondientes

- [ ] **Step 11.10: CHECKPOINT FINAL — pedir permiso explícito para abrir el PR**

> ⛔ **El agente NO ejecuta `gh pr create` automáticamente.** Antes de avanzar al Step 11.11, **pedir confirmación explícita a la usuaria** con el siguiente mensaje:
>
> > *"Las 11 tareas del plan están completas. Antes de abrir el PR a `main`, te pido que verifiques manualmente:*
> > - *Smoke test corrió OK localmente y en GitHub Actions*
> > - *`/admin/sources` muestra todas las fuentes en verde (o amarillo aceptable)*
> > - *Búsqueda en la web responde rápido y muestra datos reales*
> > - *El badge "🤖" aparece donde corresponde y el toggle filtra correctamente*
> > - *Aprobar/Descartar en `/admin/discoveries` funciona*
> > - *El último deploy (preview de Vercel sobre la rama) está OK*
> >
> > *¿Procedo a abrir el PR a `main`?"*
>
> Solo si la usuaria responde "sí" (o equivalente claro), continuar al Step 11.11. Si pide cambios o más checks, hacerlos y volver a preguntar.

- [ ] **Step 11.11: Abrir Pull Request a main**

```bash
gh pr create --title "feat: pipeline de ingesta diario de proyectos" --body "$(cat <<'EOF'
## Resumen
Reemplaza la búsqueda en vivo con Claude+web_search por un pipeline de ingesta diario que mantiene la BD Supabase actualizada con datos verificados.

- 5 scrapers determinísticos (INDAP, FIA, CORFO, FONTAGRO, IICA Hemisférico) corriendo diario vía GitHub Actions
- AI Discovery semanal con guardrails anti-alucinación (snippet >=15 palabras + URL validation)
- Páginas /admin/sources y /admin/discoveries para revisión humana
- Badge "🤖 Sin verificar" + toggle includeUnverified
- Endpoint /api/search-projects simplificado (700 LOC → ~80, sin Claude runtime)
- Auditoría legacy ejecutada antes de empezar limpia URLs muertas

Spec: docs/superpowers/specs/2026-05-05-mejorar-busqueda-proyectos-design.md
Plan: docs/superpowers/plans/2026-05-06-pipeline-ingesta-busqueda.md

## Test plan
- [ ] npm test pasa
- [ ] npm run typecheck pasa
- [ ] npm run build pasa
- [ ] Workflow ingest-scrapers.yml corrió manualmente con éxito
- [ ] /admin/sources muestra las 6 fuentes con lastRunStatus="success"
- [ ] Búsqueda responde <1s
- [ ] Badge aparece en cards needsReview
- [ ] /admin/discoveries permite Aprobar/Descartar
EOF
)"
```

Esperar review, mergear, eliminar la rama remota y local. ✅ Pipeline en producción.

---

## Self-Review

### 1. Spec coverage

| Sección spec | Task(s) cubriendo |
|---|---|
| 1. Contexto y problema | (contexto, no requiere implementación) |
| 2. Usuarios y criterios de éxito | Task 8 (búsqueda <1s), Task 11 (smoke test) |
| 3. Alcance MVP | Tasks 0–11 cubren todo |
| 4. Arquitectura | Tasks 1, 2, 3, 7, 8 |
| 5. Schema | Task 1 (Steps 1.1–1.6) |
| 6. Capa A scrapers | Tasks 2, 3, 4, 5 |
| 7. Capa B AI Discovery | Task 7 |
| 8. Endpoint refactor | Task 8 |
| 9. UX (badge + admin) | Tasks 9, 10 |
| 10. Manejo de errores | Task 2 (run-scrapers aislamiento), Task 11 (smoke test) |
| 11. Testing | Tests dentro de Tasks 1, 2, 3, 4, 5, 6, 7, 8 |
| 12. Orden de implementación | Mapea 1:1 a Tasks 0–11 |
| 13. Variables de entorno | Sección "Variables de entorno requeridas" + Task 10.7, 10.9 |
| 14. Fuera de alcance | (no requiere implementación) |
| 15. Riesgos | Mitigaciones embebidas en cada task (validateUrl, partialErrors, dry-run audit) |

✅ Todas las secciones del spec están cubiertas.

### 2. Placeholder scan

Búsqueda de patrones prohibidos:
- ✅ Sin "TBD", "TODO", "implement later"
- ✅ Sin "Add appropriate error handling" sin código
- ✅ Sin "Similar to Task N" — cada scraper repite el patrón completo
- ✅ Cada step que cambia código incluye el código completo
- ⚠️ En Task 9 (Step 9.1) digo "AJUSTAR EL SELECTOR según HTML real" — esto NO es un placeholder, es una instrucción explícita al engineer porque el HTML real es información que solo se obtiene en runtime visitando el sitio. Las pruebas con fixture verifican el resultado.

### 3. Type consistency

- ✅ `Scraper`, `ScraperResult`, `RawProject` definidos en `lib/ingestion/types.ts` (Task 1.7), usados consistentemente en todos los scrapers (Tasks 3-6).
- ✅ `validateUrl` retorna `ValidationResult` con shape `{ ok: boolean; reason?: string }` consistente entre `validateUrl.ts` (Task 1.14), uso en `persistence.ts` (Task 2.3), `discover-projects-lib.ts` (Task 7.4) y `audit-legacy-data.ts` (Task 0.1, copia local).
- ✅ `passesGuardrails` en Task 7 retorna union `{ ok: true } | { ok: false; reason: string }` — consistente.
- ✅ Source fields (`slug`, `name`, `type`, `homepageUrl`, `lastRunStatus`) usados igual en seed (Task 1.5), persistence (Task 2.3), admin/sources page (Task 10.4).
- ✅ Project fields (`canonicalUrl`, `discoveredBy`, `needsReview`, `firstSeenAt`, `lastSeenAt`) consistentes entre schema (Task 1.1), upsertProject (Task 2.3), discovery (Task 7.6), admin (Task 10).

✅ Plan listo para ejecución.

---

## Plan complete and saved to `docs/superpowers/plans/2026-05-06-pipeline-ingesta-busqueda.md`.

**Two execution options:**

**1. Subagent-Driven (recomendado)** — Despacho un subagent fresco por cada task, reviso entre tasks, iteración rápida con context limpio en cada paso.

**2. Inline Execution** — Ejecuto las tasks en esta sesión usando `executing-plans`, ejecución por lotes con checkpoints para tu review.

¿Qué enfoque querés?
