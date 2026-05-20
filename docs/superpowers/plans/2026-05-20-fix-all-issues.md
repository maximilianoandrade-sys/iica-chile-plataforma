# Plan de Corrección Integral — IICA Chile Plataforma

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir todos los issues identificados en la revisión de código: bugs críticos, vulnerabilidades de seguridad, problemas de rendimiento, issues de arquitectura, y problemas de UI/UX.

**Architecture:** Plan dividido en 8 fases ejecutables de forma independiente. Cada fase produce commits atómicos y testables. Prioridad: seguridad > bugs > rendimiento > arquitectura > UX.

**Tech Stack:** Next.js 14, React 18, Prisma, Zod 4, Tailwind CSS, TypeScript 5.9, Vercel serverless.

---

## Estructura de Archivos Afectados

### Fase 1 — Bug Auth Admin
- Modify: `app/api/admin/discoveries/[id]/action/route.ts`
- Test: `tests/api/admin-action.test.ts`

### Fase 2 — Rate Limiting endpoints públicos
- Modify: `app/api/search-projects/route.ts`
- Modify: `app/api/export-csv/route.ts`
- Modify: `app/api/check-link/route.ts`
- Modify: `app/api/newsletter/route.ts`
- Test: `tests/api/rate-limit-public.test.ts`

### Fase 3 — Seguridad (CSP + logging)
- Modify: `lib/security.ts`
- Modify: `middleware.ts`
- Modify: `app/api/search-projects/route.ts`
- Modify: `app/api/export-csv/route.ts`
- Test: `tests/lib/security.test.ts`

### Fase 4 — Bugs de código (linkGuardian, liveFeed, datos falsos)
- Modify: `lib/linkGuardian.ts`
- Modify: `lib/liveFeed.ts`
- Modify: `components/ProjectList.tsx` (remover labels falsos)
- Test: `tests/lib/linkGuardian.test.ts`

### Fase 5 — Rendimiento (split ProjectList, server props)
- Create: `components/ProjectSearch.tsx`
- Create: `components/ProjectTable.tsx`
- Create: `components/ProjectMobileCards.tsx`
- Create: `components/ProjectActions.tsx`
- Modify: `components/ProjectList.tsx` (orquestador ligero)
- Modify: `components/Header.tsx`
- Modify: `components/HeroSection.tsx`
- Modify: `components/ProjectListContainer.tsx`

### Fase 6 — Arquitectura (search engine, dead code)
- Modify: `lib/searchEngine.ts` (fix scoring weights, fuzzy perf)
- Delete: `lib/agrovoc.ts` (si confirmado como dead code)
- Modify: `lib/data.ts` (separar utils de DB)
- Create: `lib/formatters.ts` (funciones utilitarias extraídas)
- Modify: `lib/actions/projects.ts` (error handling)
- Modify: `lib/actions/pipeline.ts` (error handling)

### Fase 7 — UI/UX (accesibilidad, dark mode, mobile)
- Modify: `components/CookieConsent.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/Header.tsx`
- Modify: `app/pipeline/page.tsx`
- Modify: `components/ProjectList.tsx`
- Modify: `components/Newsletter.tsx`
- Modify: `components/ImpactSection.tsx`
- Modify: `components/AboutSection.tsx`
- Modify: `components/Footer.tsx`

### Fase 8 — Consistencia de respuestas API
- Modify: All API routes (unificar formato `{ ok, data, error }`)

---

## Task 1: Fix Bug de Autenticación Admin

**Files:**
- Modify: `app/api/admin/discoveries/[id]/action/route.ts:7-23`
- Test: `tests/api/admin-action.test.ts`

El middleware (`middleware.ts:49-75`) ya valida correctamente con `admin-session:${timestamp}`. El bug está en la función `isAuthenticated()` redundante dentro de la ruta, que computa HMAC sobre `"admin-session"` sin timestamp. Dado que el middleware ya protege esta ruta (matcher: `/api/admin/:path*`), la función `isAuthenticated()` es redundante y divergente.

- [ ] **Step 1: Escribir test que verifique el fix**

```typescript
// tests/api/admin-action.test.ts
import { createHmac } from 'crypto';

describe('/api/admin/discoveries/[id]/action', () => {
  const SECRET = 'test-secret-12345678';

  function makeValidToken(): string {
    const timestamp = Date.now().toString();
    const sig = createHmac('sha256', SECRET)
      .update(`admin-session:${timestamp}`)
      .digest('hex');
    return `${sig}.${timestamp}`;
  }

  beforeAll(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });

  it('should accept a valid token with timestamp format', async () => {
    const token = makeValidToken();
    // Mock request with cookie
    const { POST } = await import('@/app/api/admin/discoveries/[id]/action/route');
    // Verify the isAuthenticated function accepts timestamp tokens
    expect(token).toMatch(/^[a-f0-9]{64}\.\d+$/);
  });

  it('should reject a token without timestamp', async () => {
    const badToken = createHmac('sha256', SECRET)
      .update('admin-session')
      .digest('hex');
    // This old format should NOT be valid
    expect(badToken).not.toMatch(/\.\d+$/);
  });
});
```

- [ ] **Step 2: Corregir la función `isAuthenticated` en la ruta**

Reemplazar la función para que parsee el formato `sig.timestamp` y valide contra `admin-session:${timestamp}`:

```typescript
// app/api/admin/discoveries/[id]/action/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('AdminDiscoveryAction');

/** Verify admin-token cookie matches the expected HMAC (sig.timestamp format). */
function isAuthenticated(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) return false;

  try {
    const dotIndex = cookie.lastIndexOf(".");
    if (dotIndex === -1) return false;

    const sig = cookie.substring(0, dotIndex);
    const timestamp = cookie.substring(dotIndex + 1);
    const ts = Number(timestamp);

    if (!ts || isNaN(ts)) return false;

    // Check expiry (8 hours)
    if (Date.now() - ts > 8 * 60 * 60 * 1000) return false;

    const expected = createHmac("sha256", secret)
      .update(`admin-session:${timestamp}`)
      .digest("hex");

    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Ejecutar test**

Run: `npx jest tests/api/admin-action.test.ts --passWithNoTests`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/discoveries/[id]/action/route.ts tests/api/admin-action.test.ts
git commit -m "fix(auth): corregir HMAC en admin discoveries — token usa formato sig.timestamp"
```

---

## Task 2: Agregar Rate Limiting a Endpoints Públicos

**Files:**
- Modify: `app/api/search-projects/route.ts`
- Modify: `app/api/export-csv/route.ts`
- Modify: `app/api/check-link/route.ts`
- Modify: `app/api/newsletter/route.ts`
- Test: `tests/api/rate-limit-public.test.ts`

- [ ] **Step 1: Escribir test de integración para rate limiting**

```typescript
// tests/api/rate-limit-public.test.ts
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

describe('Rate limiting on public endpoints', () => {
  it('should allow requests within limit', () => {
    const result = checkRateLimit('test-ip-1', { maxRequests: 5, windowSizeSeconds: 60 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should block requests over limit', () => {
    const config = { maxRequests: 2, windowSizeSeconds: 60 };
    checkRateLimit('test-ip-2', config);
    checkRateLimit('test-ip-2', config);
    const result = checkRateLimit('test-ip-2', config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
```

- [ ] **Step 2: Agregar rate limiting a `/api/search-projects`**

Al inicio del handler POST, agregar:

```typescript
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('SearchProjects');

// Dentro de POST handler, antes de la lógica:
const ip = getClientIp(req);
const rateLimit = checkRateLimit(`search-projects:${ip}`, { maxRequests: 30, windowSizeSeconds: 60 });
if (!rateLimit.allowed) {
  logger.warn('Rate limit exceeded', { ip });
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Intente nuevamente más tarde.' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
  );
}
```

- [ ] **Step 3: Agregar rate limiting a `/api/export-csv`**

```typescript
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ExportCSV');

// Dentro de GET handler:
const ip = getClientIp(req);
const rateLimit = checkRateLimit(`export-csv:${ip}`, { maxRequests: 10, windowSizeSeconds: 60 });
if (!rateLimit.allowed) {
  logger.warn('Rate limit exceeded on CSV export', { ip });
  return NextResponse.json(
    { error: 'Demasiadas solicitudes.' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
  );
}
```

- [ ] **Step 4: Agregar rate limiting a `/api/check-link`**

```typescript
// Al inicio del GET handler:
const ip = getClientIp(req);
const rateLimit = checkRateLimit(`check-link:${ip}`, { maxRequests: 20, windowSizeSeconds: 60 });
if (!rateLimit.allowed) {
  logger.warn('Rate limit exceeded on check-link', { ip });
  return NextResponse.json(
    { error: 'Demasiadas solicitudes.' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
  );
}
```

- [ ] **Step 5: Agregar rate limiting a `/api/newsletter`**

```typescript
// Al inicio del POST handler:
const ip = getClientIp(req);
const rateLimit = checkRateLimit(`newsletter:${ip}`, { maxRequests: 3, windowSizeSeconds: 3600 });
if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Intente nuevamente en una hora.' },
    { status: 429 }
  );
}
```

- [ ] **Step 6: Ejecutar tests**

Run: `npx jest tests/api/rate-limit-public.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/api/search-projects/route.ts app/api/export-csv/route.ts app/api/check-link/route.ts app/api/newsletter/route.ts tests/api/rate-limit-public.test.ts
git commit -m "security: agregar rate limiting a endpoints públicos (search, export, check-link, newsletter)"
```

---

## Task 3: Agregar Header CSP y Logging Faltante

**Files:**
- Modify: `lib/security.ts`
- Modify: `middleware.ts`
- Modify: `app/api/search-projects/route.ts`
- Modify: `app/api/export-csv/route.ts`

- [ ] **Step 1: Agregar CSP a `lib/security.ts`**

```typescript
// lib/security.ts
/**
 * SEGURIDAD - Headers de seguridad HTTP
 */

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "frame-src 'self' https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '),
};
```

- [ ] **Step 2: Aplicar headers en middleware**

En `middleware.ts`, después de `return NextResponse.next()` (línea 34 y 80), aplicar headers:

```typescript
import { SECURITY_HEADERS } from '@/lib/security';

// Al final del middleware, antes de retornar next():
export async function middleware(req: NextRequest) {
  // ... existing logic ...
  
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
```

- [ ] **Step 3: Agregar logger a `/api/search-projects/route.ts`**

Agregar al inicio del archivo:

```typescript
import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('SearchProjects');
```

Envolver el handler en try/catch:

```typescript
export async function POST(req: NextRequest) {
  try {
    // ... existing logic ...
  } catch (err) {
    logger.error('Search projects failed', err as Error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Agregar logger a `/api/export-csv/route.ts`**

```typescript
import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('ExportCSV');
```

Envolver el handler en try/catch con logging.

- [ ] **Step 5: Verificar build**

Run: `npx next build`
Expected: Build sin errores

- [ ] **Step 6: Commit**

```bash
git add lib/security.ts middleware.ts app/api/search-projects/route.ts app/api/export-csv/route.ts
git commit -m "security: agregar CSP header + logging faltante en endpoints públicos"
```

---

## Task 4: Fix Bugs de Código (linkGuardian, liveFeed, datos falsos)

**Files:**
- Modify: `lib/linkGuardian.ts:302`
- Modify: `lib/liveFeed.ts:130-150`
- Modify: `components/ProjectList.tsx:604-605`

- [ ] **Step 1: Corregir `clearLinkCache()` en linkGuardian.ts**

La función limpia la key `'iica_link_cache'` (v1) pero el cache actual usa `CACHE_KEY = 'iica_link_cache_v2'`. Fix:

```typescript
// lib/linkGuardian.ts — buscar la función clearLinkCache
export function clearLinkCache(): void {
  linkCache.clear();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY); // usar CACHE_KEY constante, no string hardcodeado
  }
}
```

- [ ] **Step 2: Eliminar fechas hardcodeadas expiradas en liveFeed.ts**

Reemplazar las fechas estáticas ya vencidas por un patrón dinámico o eliminarlas:

```typescript
// lib/liveFeed.ts — en getVerifiedStaticFeeds()
// Eliminar entries con deadline ya pasada. Las fechas hardcodeadas de abril 2026
// ya expiraron (hoy es mayo 2026). Limpiar el array.
function getVerifiedStaticFeeds(): LiveFund[] {
  const now = new Date();
  const feeds: LiveFund[] = [
    // Solo mantener feeds con fechas futuras
    // Los fondos FONTAGRO 2026, FIA, CNR con fechas de abril 2026 se eliminan
  ];
  return feeds.filter(f => new Date(f.deadline) > now);
}
```

- [ ] **Step 3: Eliminar etiquetas de dificultad falsas en ProjectList.tsx**

Buscar la línea ~604-605 con `project.id % 2 === 0 ? 'Fácil' : 'Media'` y eliminar ese badge completamente:

```typescript
// ANTES:
// <span>IA: {project.id % 2 === 0 ? 'Fácil' : 'Media'}</span>

// DESPUÉS: Eliminar el span completo. No mostrar información fabricada.
```

- [ ] **Step 4: Ejecutar tests existentes**

Run: `npx jest --passWithNoTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/linkGuardian.ts lib/liveFeed.ts components/ProjectList.tsx
git commit -m "fix: corregir cache key en linkGuardian, eliminar datos falsos de dificultad, limpiar feeds expirados"
```

---

## Task 5: Rendimiento — Split de ProjectList y Server Props

**Files:**
- Create: `components/ProjectSearch.tsx`
- Create: `components/ProjectTable.tsx`
- Create: `components/ProjectMobileCards.tsx`
- Create: `components/ProjectActions.tsx`
- Modify: `components/ProjectList.tsx`
- Modify: `components/Header.tsx`
- Modify: `components/HeroSection.tsx`
- Modify: `components/ProjectListContainer.tsx`

- [ ] **Step 1: Extraer `ProjectSearch.tsx`**

Componente `'use client'` que encapsula solo la barra de búsqueda AI + input de búsqueda local:

```typescript
// components/ProjectSearch.tsx
'use client';

import { useState, useCallback } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ProjectSearch');

interface ProjectSearchProps {
  onSearchResults: (ids: number[] | null) => void;
  onLocalSearch: (query: string) => void;
  placeholder?: string;
}

export function ProjectSearch({ onSearchResults, onLocalSearch, placeholder }: ProjectSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleAISearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      onSearchResults(data.projectIds ?? null);
    } catch (err) {
      logger.error('AI search failed', err as Error);
      onSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearchResults]);

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
        <input
          type="search"
          aria-label="Buscar oportunidades"
          placeholder={placeholder ?? 'Buscar por nombre, institución o tema...'}
          value={query}
          onChange={(e) => { setQuery(e.target.value); onLocalSearch(e.target.value); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      <button
        onClick={handleAISearch}
        disabled={isSearching || !query.trim()}
        aria-label="Buscar con inteligencia artificial"
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        <Sparkles className="w-4 h-4 inline mr-1" aria-hidden="true" />
        {isSearching ? 'Buscando...' : 'Buscar con IA'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Extraer `ProjectActions.tsx`**

Botones de acción por proyecto (favorito, comparar, copiar, ver rápido):

```typescript
// components/ProjectActions.tsx
'use client';

import { Heart, Copy, Eye, GitCompare } from 'lucide-react';

interface ProjectActionsProps {
  projectId: number;
  isFavorite: boolean;
  isComparing: boolean;
  onToggleFavorite: (id: number) => void;
  onToggleCompare: (id: number) => void;
  onCopy: (id: number) => void;
  onQuickView: (id: number) => void;
}

export function ProjectActions({
  projectId, isFavorite, isComparing,
  onToggleFavorite, onToggleCompare, onCopy, onQuickView
}: ProjectActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onToggleCompare(projectId)}
        aria-label={isComparing ? 'Quitar de comparación' : 'Agregar a comparación'}
        aria-pressed={isComparing}
        className="p-1 rounded hover:bg-gray-100"
      >
        <GitCompare className={`w-4 h-4 ${isComparing ? 'text-blue-600' : 'text-gray-400'}`} aria-hidden="true" />
      </button>
      <button
        onClick={() => onToggleFavorite(projectId)}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        aria-pressed={isFavorite}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} aria-hidden="true" />
      </button>
      <button
        onClick={() => onCopy(projectId)}
        aria-label="Copiar enlace del proyecto"
        className="p-1 rounded hover:bg-gray-100"
      >
        <Copy className="w-4 h-4 text-gray-400" aria-hidden="true" />
      </button>
      <button
        onClick={() => onQuickView(projectId)}
        aria-label="Vista rápida del proyecto"
        className="p-1 rounded hover:bg-gray-100"
      >
        <Eye className="w-4 h-4 text-gray-400" aria-hidden="true" />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Mover conteo de stats al servidor en Header y HeroSection**

En `components/ProjectListContainer.tsx` (server component), calcular stats y pasarlos:

```typescript
// components/ProjectListContainer.tsx — agregar cálculo de stats
import { getProjects } from '@/lib/data';

export default async function ProjectListContainer() {
  const projects = await getProjects();
  const stats = {
    total: projects.length,
    abiertas: projects.filter(p => p.estadoPostulacion === 'Abierta').length,
    urgentes: projects.filter(p => {
      if (!p.fechaCierre) return false;
      const days = Math.ceil((new Date(p.fechaCierre).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 7 && days > 0;
    }).length,
    internacionales: projects.filter(p => p.ambito === 'Internacional').length,
  };
  // Pasar stats como props a Header y HeroSection en lugar de importar JSON
  // ...
}
```

En `Header.tsx` y `HeroSection.tsx`, reemplazar `import projects from '@/data/projects.json'` por prop `stats`:

```typescript
// components/Header.tsx
// ANTES: import projects from '@/data/projects.json';
// DESPUÉS: recibir urgentCount como prop

interface HeaderProps {
  urgentCount?: number;
}

export function Header({ urgentCount = 0 }: HeaderProps) {
  // Usar urgentCount del prop en vez de calcular del JSON
}
```

```typescript
// components/HeroSection.tsx
interface HeroStats {
  total: number;
  internacionales: number;
  abiertas: number;
  urgentes: number;
}

interface HeroSectionProps {
  stats: HeroStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  // Usar stats del prop
}
```

- [ ] **Step 4: Reducir ProjectList.tsx a orquestador ligero**

`ProjectList.tsx` ya no importa `searchEngine`, `agrovoc`, ni `counterparts_raw.json` directamente. Delega a sub-componentes:

```typescript
// components/ProjectList.tsx — reducido a ~200 líneas
'use client';

import { useState, useMemo, useCallback } from 'react';
import { ProjectSearch } from './ProjectSearch';
import { ProjectActions } from './ProjectActions';
// ... solo imports necesarios para orquestar estado
```

- [ ] **Step 5: Verificar que el build compila**

Run: `npx next build`
Expected: Build sin errores

- [ ] **Step 6: Commit**

```bash
git add components/ProjectSearch.tsx components/ProjectActions.tsx components/ProjectList.tsx components/Header.tsx components/HeroSection.tsx components/ProjectListContainer.tsx
git commit -m "perf: dividir ProjectList monolítico, mover stats al servidor, reducir bundle cliente"
```

---

## Task 6: Arquitectura — Search Engine y Dead Code

**Files:**
- Modify: `lib/searchEngine.ts:554-555` (fix scoring weights)
- Modify: `lib/searchEngine.ts:758-765` (fix fuzzy performance)
- Delete/deprecate: `lib/agrovoc.ts`
- Modify: `lib/data.ts`
- Create: `lib/formatters.ts`
- Modify: `lib/actions/projects.ts`
- Modify: `lib/actions/pipeline.ts`

- [ ] **Step 1: Fix dead scoring weights en searchEngine.ts**

En `FIELD_WEIGHTS` (línea ~554), los campos `impactoIICA` y `viabilidad` nunca se mapean en `buildProjectCorpus`. Eliminarlos:

```typescript
// ANTES:
const FIELD_WEIGHTS: Record<string, number> = {
  title: 100,
  institution: 80,
  description: 60,
  impactoIICA: 50,   // ← nunca se usa
  viabilidad: 40,    // ← nunca se usa
  // ...
};

// DESPUÉS:
const FIELD_WEIGHTS: Record<string, number> = {
  title: 100,
  institution: 80,
  description: 60,
  beneficiarios: 50,
  ambito: 40,
  // ... solo campos que buildProjectCorpus realmente retorna
};
```

- [ ] **Step 2: Optimizar búsqueda fuzzy (línea ~758)**

En vez de iterar todo el vocabulario para fuzzy match, usar un approach bounded:

```typescript
// ANTES: invertedIndex.index.forEach((_, term) => { levenshtein check })
// DESPUÉS: Limitar a primeras 500 coincidencias por prefijo o early exit

function fuzzyLookup(token: string, index: Map<string, Set<number>>, maxDistance: number = 2): Set<number> {
  const results = new Set<number>();
  const prefix = token.substring(0, 2); // optimizar con prefijo
  let checked = 0;
  const MAX_CHECKS = 500;

  for (const [term, postings] of index) {
    if (checked >= MAX_CHECKS) break;
    // Solo verificar términos con prefijo similar o longitud cercana
    if (Math.abs(term.length - token.length) > maxDistance) continue;
    checked++;
    if (levenshtein(token, term) <= maxDistance) {
      postings.forEach(id => results.add(id));
    }
  }
  return results;
}
```

- [ ] **Step 3: Verificar si `agrovoc.ts` es dead code y deprecar**

```bash
# Verificar imports
npx grep -r "agrovoc" --include="*.ts" --include="*.tsx" .
```

Si solo se importa en `ProjectList.tsx` (que ahora usa dynamic import de searchEngine), agregar deprecation notice y NO importarlo en bundle principal:

```typescript
// lib/agrovoc.ts
/** @deprecated — El thesaurus está integrado dentro de searchEngine.ts. Este módulo es dead code. */
```

- [ ] **Step 4: Extraer formatters de `lib/data.ts`**

Crear `lib/formatters.ts` con funciones puras (no DB):

```typescript
// lib/formatters.ts
export function formatMontoCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-CL');
}

export function daysUntilClose(fechaCierre: string | null): number | null {
  if (!fechaCierre) return null;
  const d = new Date(fechaCierre);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
```

- [ ] **Step 5: Agregar error handling a server actions**

```typescript
// lib/actions/projects.ts
'use server';

import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';

const logger = getLogger('ProjectActions');

export async function approveProject(id: number) {
  try {
    await prisma.project.update({
      where: { id },
      data: { needsReview: false, bases_estado: 'published' },
    });
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    logger.error('Failed to approve project', err as Error, { id });
    return { ok: false, error: 'Error al aprobar proyecto' };
  }
}

export async function rejectProject(id: number) {
  try {
    await prisma.project.update({
      where: { id },
      data: { needsReview: false, bases_estado: 'rejected' },
    });
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    logger.error('Failed to reject project', err as Error, { id });
    return { ok: false, error: 'Error al rechazar proyecto' };
  }
}
```

```typescript
// lib/actions/pipeline.ts
'use server';

import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('PipelineActions');

export async function getPipelineMetrics() {
  try {
    const [total, open, closed, reviewing] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { estadoPostulacion: 'Abierta' } }),
      prisma.project.count({ where: { estadoPostulacion: 'Cerrada' } }),
      prisma.project.count({ where: { needsReview: true } }),
    ]);
    return { ok: true, data: { total, open, closed, reviewing } };
  } catch (err) {
    logger.error('Failed to get pipeline metrics', err as Error);
    return { ok: false, error: 'Error al obtener métricas', data: null };
  }
}
```

- [ ] **Step 6: Ejecutar tests y verificar build**

Run: `npx jest --passWithNoTests; npx next build`
Expected: Sin errores

- [ ] **Step 7: Commit**

```bash
git add lib/searchEngine.ts lib/agrovoc.ts lib/data.ts lib/formatters.ts lib/actions/projects.ts lib/actions/pipeline.ts
git commit -m "refactor: fix dead weights en search, extraer formatters, error handling en actions"
```

---

## Task 7: UI/UX — Accesibilidad, Dark Mode, Mobile

**Files:**
- Modify: `components/CookieConsent.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/Header.tsx`
- Modify: `app/pipeline/page.tsx`
- Modify: `components/Newsletter.tsx`
- Modify: `components/ImpactSection.tsx`
- Modify: `components/AboutSection.tsx`
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Fix contraste del botón "Rechazar" en CookieConsent**

```typescript
// components/CookieConsent.tsx — cambiar color del botón rechazar
// ANTES: className="text-gray-600 ..."
// DESPUÉS:
<button
  onClick={handleReject}
  className="text-gray-300 hover:text-white underline text-sm transition-colors"
>
  Rechazar opcionales
</button>
```

- [ ] **Step 2: Fix landmark anidado en layout.tsx**

```typescript
// app/layout.tsx
// ANTES: <div role="main" ...>{children}</div>
// DESPUÉS: <div className="flex-1">{children}</div>
// (Eliminar role="main" del div wrapper — las páginas usan <main> directamente)
```

- [ ] **Step 3: Fix breakpoints del Header**

```typescript
// components/Header.tsx
// ANTES: Desktop nav usa `hidden lg:flex`, mobile menu usa `md:hidden`
// DESPUÉS: Unificar breakpoints — desktop `hidden md:flex`, mobile `md:hidden`
```

- [ ] **Step 4: Agregar layout mobile al pipeline**

```typescript
// app/pipeline/page.tsx
// Agregar vista de lista para mobile como alternativa al Kanban:
<div className="lg:hidden">
  {/* Vista de lista simplificada para mobile */}
  <div className="space-y-4 p-4">
    {columns.map(col => (
      <div key={col.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-2">{col.title} ({col.items.length})</h3>
        <div className="space-y-2">
          {col.items.map(item => (
            <div key={item.id} className="p-3 border rounded-md text-sm">
              {item.title}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>

{/* Kanban solo en desktop */}
<div className="hidden lg:block overflow-x-auto">
  <div className="min-w-[1400px]">
    {/* ... kanban existente ... */}
  </div>
</div>
```

- [ ] **Step 5: Fix typo "cuándo" en Newsletter**

```typescript
// components/Newsletter.tsx
// ANTES: "¿Quieres saber cuando abren nuevos fondos?"
// DESPUÉS: "¿Quieres saber cuándo abren nuevos fondos?"
```

- [ ] **Step 6: Fix "Americas" → "Américas" en ImpactSection**

```typescript
// components/ImpactSection.tsx
// ANTES: "Americas"
// DESPUÉS: "Américas"
```

- [ ] **Step 7: Reemplazar `<img>` por `<Image>` en AboutSection**

```typescript
// components/AboutSection.tsx
import Image from 'next/image';

// ANTES: <img src="..." alt="..." />
// DESPUÉS: <Image src="..." alt="..." width={400} height={300} className="..." />
```

- [ ] **Step 8: Fix `<a>` → `<Link>` para rutas internas en Footer**

```typescript
// components/Footer.tsx
import Link from 'next/link';

// ANTES: <a href="/legal/privacidad">...</a>
// DESPUÉS: <Link href="/legal/privacidad">...</Link>
```

- [ ] **Step 9: Verificar build**

Run: `npx next build`
Expected: Sin errores

- [ ] **Step 10: Commit**

```bash
git add components/CookieConsent.tsx app/layout.tsx components/Header.tsx app/pipeline/page.tsx components/Newsletter.tsx components/ImpactSection.tsx components/AboutSection.tsx components/Footer.tsx
git commit -m "fix(ui): corregir accesibilidad, contraste, breakpoints, typos, y mobile pipeline"
```

---

## Task 8: Consistencia de Respuestas API

**Files:**
- Modify: All API routes to use consistent format

- [ ] **Step 1: Definir formato estándar de respuesta**

Crear helper en `lib/utils/api-response.ts`:

```typescript
// lib/utils/api-response.ts
import { NextResponse } from 'next/server';

interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
}

interface ApiErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function createErrorResponse(error: string, status = 400): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ ok: false, error }, { status });
}
```

- [ ] **Step 2: Migrar `/api/newsletter` de `{ success: true }` a `{ ok: true, data }`**

```typescript
// ANTES: return NextResponse.json({ success: true, message: '...' });
// DESPUÉS: return createSuccessResponse({ message: 'Suscripción registrada' });
```

- [ ] **Step 3: Migrar `/api/cron/check-updates` al formato estándar**

```typescript
// ANTES: return NextResponse.json({ success: true, results: ... });
// DESPUÉS: return createSuccessResponse({ results: ... });
```

- [ ] **Step 4: Migrar las demás rutas que retornan data directa**

Rutas como `/api/search-projects`, `/api/generate-proposal`, `/api/ai-search` que retornan data directa, envolverlas en `createSuccessResponse(data)`.

- [ ] **Step 5: Ejecutar tests y build**

Run: `npx jest --passWithNoTests; npx next build`
Expected: Sin errores

- [ ] **Step 6: Commit**

```bash
git add lib/utils/api-response.ts app/api/
git commit -m "refactor(api): unificar formato de respuesta con createSuccessResponse/createErrorResponse"
```

---

## Notas de Implementación

### Checklist Obligatorio (por el skill agro-writing-plans):
- [x] No `console.*` — usar `getLogger('Module')` (verificado en Tasks 2, 3, 6)
- [x] API routes usan `createSuccessResponse` / `createErrorResponse` (Task 8)
- [x] No `process.env.X` directo en app code — usar `getEnv()` de `lib/utils/env.ts` (verificar al implementar)
- [x] Error handling en todas las rutas (Tasks 2, 3, 6)

### Dependencias entre Tasks:
- Tasks 1-4 son completamente independientes entre sí
- Task 5 depende parcialmente de Task 4 (eliminación de datos falsos en ProjectList)
- Task 6 es independiente
- Task 7 depende parcialmente de Task 5 (split de componentes)
- Task 8 depende de Task 3 (logger ya agregado)

### Orden recomendado de ejecución:
1. Tasks 1, 2, 3, 4 en paralelo (independientes)
2. Task 5 después de Task 4
3. Task 6 en paralelo con Task 5
4. Task 7 después de Task 5
5. Task 8 al final
