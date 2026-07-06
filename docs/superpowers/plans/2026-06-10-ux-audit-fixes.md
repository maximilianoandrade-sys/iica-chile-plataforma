# UX Audit Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolver los 22 issues de la auditoría UX en 5 fases, mejorando credibilidad, usabilidad y compliance legal de la plataforma IICA Chile.

**Architecture:** Frontend refactoring (React + Tailwind), pipeline enrichment (Gemini translation + relevance scoring), Prisma schema extension (`title_es`), y compliance legal (cookie consent + privacy page).

**Tech Stack:** Next.js 14, React 18, Prisma, Tailwind CSS, TypeScript, Gemini API, Vercel.

---

## Phase 1 — Quick Wins

### Task 1: Ficha de Proyecto — Ocultar campos vacíos + CTA

**Files:**
- Modify: `app/proyecto/[id]/page.tsx`

**Steps:**

- [ ] Step 1: In `app/proyecto/[id]/page.tsx`, wrap regiones/beneficiarios fields with conditional: `if (!value || value === 'en validación editorial') return null`
- [ ] Step 2: Add `proyecto.objetivo` as description block if present
- [ ] Step 3: Add prominent CTA "Ver Bases / Postular" (full-width mobile, links to url_bases). If no url_bases, show "Consulte directamente con {institucion}"
- [ ] Step 4: Verify build: `npx next build`
- [ ] Step 5: Commit: `fix(ficha): ocultar campos vacíos, agregar CTA y descripción`

---

### Task 2: Eliminar /maletin

**Files:**
- Delete: `app/maletin/page.tsx`
- Modify: `next.config.js`
- Modify: `components/Header.tsx`
- Modify: `components/Footer.tsx`

**Steps:**

- [ ] Step 1: Delete `app/maletin/page.tsx`
- [ ] Step 2: Add permanent redirect in `next.config.js`: `/maletin` → `/`
- [ ] Step 3: Remove maletín links from Header navigation
- [ ] Step 4: Remove maletín links from Footer
- [ ] Step 5: Verify build: `npx next build`
- [ ] Step 6: Commit: `fix: eliminar /maletin del sitio público, redirect 301 a /`

---

### Task 3: Unificar Footer Global

**Files:**
- Modify: `components/Footer.tsx`

**Steps:**

- [ ] Step 1: Reduce footer to 2 columns (IICA Chile + Enlaces útiles)
- [ ] Step 2: Set definitive RRSS: LinkedIn IICA + X @IICA
- [ ] Step 3: Remove "Fuentes Internacionales" section (duplicates home)
- [ ] Step 4: Ensure all internal links use `<Link>` from next/link
- [ ] Step 5: Verify build
- [ ] Step 6: Commit: `fix(footer): simplificar a 2 columnas, unificar RRSS`

---

### Task 4: Hero CTA Hierarchy

**Files:**
- Modify: `components/HeroSection.tsx`

**Steps:**

- [ ] Step 1: Primary CTA "Explorar Oportunidades": solid bg-green-600, large, font-semibold
- [ ] Step 2: Secondary CTA "Conocer IICA Chile": border/ghost style, smaller
- [ ] Step 3: Verify visual difference at 375px
- [ ] Step 4: Commit: `fix(hero): jerarquía visual CTA primario vs secundario`

---

## Phase 2 — Compliance & Newsletter

### Task 5: Cookie Consent — Contraste y categorías

**Files:**
- Modify: `components/CookieConsent.tsx`

**Steps:**

- [ ] Step 1: Fix reject button contrast: `text-gray-200 hover:text-white underline`
- [ ] Step 2: Store granular consent: `{ essential: true, analytics: boolean, timestamp }`
- [ ] Step 3: Update visibility check to handle JSON format
- [ ] Step 4: Run existing tests: `npx jest tests/CookieConsent.test.tsx --passWithNoTests`
- [ ] Step 5: Commit: `fix(cookies): mejorar contraste + granular consent storage`

---

### Task 6: Newsletter — Checkbox consentimiento + feedback

**Files:**
- Modify: `components/Newsletter.tsx`
- Modify: `app/api/newsletter/route.ts`

**Steps:**

- [ ] Step 1: Add consent checkbox with link to /legal/privacidad
- [ ] Step 2: Disable submit if no consent
- [ ] Step 3: Improve success/error messages (Spanish, specific)
- [ ] Step 4: Validate consent in API route, use `createErrorResponse` if missing
- [ ] Step 5: Commit: `fix(newsletter): checkbox consentimiento + feedback mejorado`

---

### Task 7: Página de Política de Privacidad

**Files:**
- Create: `app/legal/privacidad/page.tsx`

**Steps:**

- [ ] Step 1: Create page with metadata, Header, Footer, content sections (datos recopilados, finalidad, base legal, localStorage, derechos, contacto)
- [ ] Step 2: Add disclaimer banner "requiere revisión legal profesional"
- [ ] Step 3: Verify build
- [ ] Step 4: Commit: `feat(legal): crear página de política de privacidad`

---

## Phase 3 — Cards, Filters & Feed UX

### Task 8: Semáforo de urgencia 3 niveles

**Files:**
- Modify: `components/ProjectCard.tsx`

**Steps:**

- [ ] Step 1: Define UrgencyLevel type and getUrgencyLevel function (critical ≤1 day, warning 2-7, normal >7, closed)
- [ ] Step 2: Define URGENCY_STYLES with badge + border + text classes for each level
- [ ] Step 3: Apply border-l-4 with urgency color to card wrapper
- [ ] Step 4: Commit: `feat(cards): semáforo 3 niveles de urgencia`

---

### Task 9: Tipografía con jerarquía en tarjetas

**Files:**
- Modify: `components/ProjectCard.tsx`

**Steps:**

- [ ] Step 1: Title: 15px/font-medium/text-gray-900/line-clamp-2
- [ ] Step 2: Institution: 12px/text-gray-500
- [ ] Step 3: Monto: 13px/font-semibold/text-gray-800
- [ ] Step 4: Deadline: 13px with urgency color
- [ ] Step 5: Commit: `fix(cards): jerarquía tipográfica estricta`

---

### Task 10: Filtro de instituciones searchable

**Files:**
- Create: `components/InstitutionFilter.tsx`
- Modify: `components/FilterChips.tsx`
- Modify: `lib/search/filtering.ts`

**Steps:**

- [ ] Step 1: Add INSTITUTION_ALIASES normalization map in filtering.ts
- [ ] Step 2: Create InstitutionFilter combobox (search input + quick chips + checkbox list)
- [ ] Step 3: Integrate into FilterChips replacing dropdown
- [ ] Step 4: Verify build
- [ ] Step 5: Commit: `feat(filters): filtro instituciones searchable con chips`

---

### Task 11: Paginación con contexto

**Files:**
- Modify: pagination area in main feed

**Steps:**

- [ ] Step 1: Add "Página N de M" text alongside pagination numbers
- [ ] Step 2: Highlight current page with distinct style (bg-green-600 text-white)
- [ ] Step 3: Add aria-current="page" to active button
- [ ] Step 4: Commit: `fix(pagination): contexto 'Página N de M' + highlight activo`

---

### Task 12: Indicador de frescura del pipeline

**Files:**
- Create: `components/PipelineStatus.tsx`
- Modify: home page (above feed)

**Steps:**

- [ ] Step 1: Create PipelineStatus component with timeAgo() helper
- [ ] Step 2: Show green pulse dot if updated <1h ago
- [ ] Step 3: Integrate above feed grid in home page
- [ ] Step 4: Commit: `feat(feed): indicador de frescura pipeline`

---

### Task 13: Empty state diseñado

**Files:**
- Verify/modify empty state in feed

**Steps:**

- [ ] Step 1: Verify existing empty state has icon + message + actions
- [ ] Step 2: If insufficient: add Search icon, "No encontramos oportunidades" message, "Limpiar filtros" + "Ver todas" buttons
- [ ] Step 3: Commit if changes needed: `fix(feed): empty state con acciones`

---

## Phase 4 — Pipeline Intelligence

### Task 14: Filtro de relevancia agrícola

**Files:**
- Create: `lib/ingestion/relevance-filter.ts`
- Modify: data query (exclude non-publishable)

**Steps:**

- [ ] Step 1: Create relevance-filter.ts with NON_AGRICULTURAL_KEYWORDS blacklist and assessRelevance() function
- [ ] Step 2: Ensure public feed query filters `publishable: true`
- [ ] Step 3: Commit: `feat(pipeline): filtro de relevancia agrícola`

---

### Task 15: Badge de idioma + traducción de títulos

**Files:**
- Create: `lib/ingestion/translate.ts`
- Modify: `prisma/schema.prisma` (add title_es)
- Modify: `components/ProjectCard.tsx` (badge + translated title display)

**Steps:**

- [ ] Step 1: Add `title_es String?` to Project model in schema.prisma
- [ ] Step 2: Run `npx prisma db push` (or migrate dev)
- [ ] Step 3: Create translate.ts with Gemini translation function
- [ ] Step 4: Add language badge to ProjectCard when idioma !== 'es'
- [ ] Step 5: Display title_es if available, fallback to nombre
- [ ] Step 6: Commit: `feat(pipeline): badge idioma + traducción títulos con Gemini`

---

## Phase 5 — Visual Polish

### Task 16: Logos de instituciones normalizados

**Files:**
- Create: `components/InstitutionAvatar.tsx`
- Modify: `components/ProjectCard.tsx`

**Steps:**

- [ ] Step 1: Create InstitutionAvatar with LOGO_MAP + category-colored fallback
- [ ] Step 2: Integrate into ProjectCard replacing current badge
- [ ] Step 3: Commit: `feat(ui): logos normalizados + avatar fallback por categoría`

---

### Task 17: Hero con identidad sectorial

**Files:**
- Modify: `components/HeroSection.tsx`

**Steps:**

- [ ] Step 1: Verify/replace hero image with agricultural Chilean landscape
- [ ] Step 2: Add gradient overlay for text readability
- [ ] Step 3: Commit: `fix(hero): imagen identidad agrícola + overlay gradiente`

---

### Task 18: Página /about con contenido visual

**Files:**
- Modify: `app/about/page.tsx`

**Steps:**

- [ ] Step 1: Add placeholder image sections (2 minimum) with proper alt text
- [ ] Step 2: Use Image from next/image with proper dimensions
- [ ] Step 3: Commit: `fix(about): espacios para contenido visual del sector`

---

## Mandatory Checks

- No `console.*` → use `getLogger('Module')`
- API routes use `createSuccessResponse` / `createErrorResponse`
- No `process.env.X` → use `getEnv()` from `lib/utils/env.ts`
- After Prisma changes → regenerate client
