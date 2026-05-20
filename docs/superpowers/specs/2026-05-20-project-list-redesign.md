# Rediseño Lista de Oportunidades — Estilo DevelopmentAid

## Resumen

Reemplazar la vista actual de oportunidades (grid de cards + tabla + filtros dispersos)
por una lista vertical compacta con sidebar de filtros, al estilo DevelopmentAid Tenders.
Eliminar features no usados por el target (AI search, AGROVOC, compare, viabilidad,
favoritos). Resultado: UI minimalista, mobile-first, que un productor agrícola chileno
con 3G puede usar en 1-2 clicks.

## Decisiones de diseño

| Decisión | Resolución |
|----------|------------|
| Click en título | Misma pestaña → `/proyecto/[id]` |
| Botón "Postular" en fila | No — solo en página de detalle |
| Favoritos | Eliminados |
| Proyectos cerrados | Atenuados visualmente, ocultos por defecto (filtro Estado default = "Abiertas") |
| Approach | Refactor in-place (no V2 paralelo) |
| Animaciones | CSS transitions (eliminar framer-motion de esta vista) |

## Arquitectura de componentes

### Archivos resultantes

| Archivo | Líneas est. | Responsabilidad |
|---------|-------------|-----------------|
| `components/ProjectRow.tsx` | ~80 | Fila individual: título (link), metadata inline, deadline |
| `components/ProjectFilters.tsx` | ~250 | Sidebar `<aside>` con 5 filtros + search bar |
| `components/ProjectList.tsx` | ~300 | Layout 2-col, sort dropdown, paginación, render rows |
| `components/MobileFilterDrawer.tsx` | ~150 | Bottom-sheet CSS-only para mobile |

### Archivos eliminados

| Archivo | Razón |
|---------|-------|
| `components/OportunidadCard.tsx` | Reemplazado por ProjectRow |
| `components/ProjectItem.tsx` (default export + subcomponents) | Código muerto. Solo se mantienen exports de `ActionButton` y `UrgencyBadge` (se extraen a archivos propios) |

### Props flow

```
app/page.tsx → <ProjectListContainer searchParams={resolvedSearchParams}>
  → getProjects() + server-side filter/sort via URL params
  → <ProjectList projects={filteredProjects} filterCounts={counts} totalCount={N} />
      → <ProjectFilters /> (sidebar desktop / drawer mobile)
      → ProjectRow × N
```

## Layout

### Desktop (≥1024px)
- Sidebar fijo `w-72` (280px) a la izquierda
- Lista `flex-1` a la derecha
- Search bar dentro del sidebar

### Mobile (<1024px)
- Botón "Filtros (N)" que abre MobileFilterDrawer (bottom-sheet)
- Lista full-width debajo
- Paginación al fondo

## Filtros (5 total)

| # | Filtro | Tipo | Comportamiento |
|---|--------|------|----------------|
| 1 | Búsqueda | `<input type="search">` | Debounce 300ms, filtra por nombre/descripción/institución |
| 2 | Estado | Radio buttons | Default: "Abiertas". Opciones: Todas, Abiertas, Próximas, Cerradas. Con conteo `(N)` |
| 3 | Institución | Checkboxes multi-select | Top 5 visibles + "Ver todas". Con conteo `(N)` |
| 4 | Región | Checkboxes multi-select | Top 5 visibles + "Ver todas". Con conteo `(N)` |
| 5 | Monto | Radio buttons | Cualquiera, <$100M, $100M–$300M, >$300M |
| 6 | Ámbito | Radio buttons | Todos, Nacional, Regional, Internacional |

### Sort (3 opciones)
- Cierre más próximo (default)
- Mayor monto
- Más recientes

### Filtros eliminados
Viabilidad, Rol IICA, Quick Search Chips, Solo Abiertas toggle, Incluir sin verificar,
Categoría pills, AGROVOC, Quick Filters (fácil/mujeres/etc.)

## ProjectRow — Anatomía

```
┌─────────────────────────────────────────────────────────────────┐
│  Programa de Absorción Tecnológica para la Innovación    ←link  │
│  CORFO · Nacional · $150M CLP · Cierra en 12 días              │
│                                                    [Abierta]    │
└─────────────────────────────────────────────────────────────────┘
```

- **Línea 1:** Nombre del proyecto como `<a href="/proyecto/{id}">` (color `iica-navy`, hover underline)
- **Línea 2:** Institución · Ámbito/Región · Monto · Deadline — separados por `·`
- **Badge:** Estado (usa `<Badge variant="open|closed|neutral">`)
- **Cerradas:** `opacity-60` en toda la fila
- **Min-height:** 72px (touch-friendly)
- **Separador:** `border-b border-iica-border`

## Accesibilidad (WCAG AA)

| Requisito | Implementación |
|-----------|----------------|
| Sidebar semántico | `<aside aria-label="Filtros de búsqueda">` |
| Filter groups | `<fieldset><legend class="sr-only">Estado</legend>` + `<input type="radio">` reales |
| Resultados dinámicos | `<div aria-live="polite" aria-atomic="true">Mostrando N...</div>` |
| Focus visible | `focus-visible:ring-2 focus-visible:ring-iica-yellow` |
| Labels es-CL | Todos los `aria-label` en español |
| Contraste | Badge colors pasan ratio 4.5:1 |
| Link semántico | Título es `<a>` no `<div onClick>` |

## Copy (español formal, usted)

| Elemento | Texto |
|----------|-------|
| Heading filtros | "Filtros" |
| Placeholder búsqueda | "Buscar por palabra clave..." |
| Contador resultados | "Mostrando N de M oportunidades" |
| Limpiar filtros | "Limpiar filtros" |
| Sort label | "Ordenar por" |
| Sort opciones | "Cierre más próximo" / "Mayor monto" / "Más recientes" |
| Empty state | "No encontramos oportunidades con estos filtros. Pruebe ampliar su búsqueda." |
| Deadline | "Cierra en N días" / "Cierra hoy" / "Cerrada" |
| Mobile filter button | "Filtros (N)" donde N = filtros activos |
| Mobile drawer CTA | "Ver N resultados" |

## Bundle optimization

| Acción | Impacto |
|--------|---------|
| Eliminar framer-motion de lista/filtros/drawer | -30-50kB gzipped |
| CSS `transform: translateY()` + `transition` para drawer | 0 dep extra |
| Eliminar imports muertos (15+ Lucide icons) de ProjectList | Menor |

## Estado del cliente (mínimo)

| Variable | Tipo | Propósito |
|----------|------|-----------|
| `currentPage` | number | Paginación (reset a 1 en cambio de filtro via URL) |
| `mobileDrawerOpen` | boolean | Toggle bottom-sheet mobile |

Todo lo demás vive en URL search params → SSR-friendly, compartible, back-button.

## Fuera de scope

- Página de detalle `/proyecto/[id]` (no se toca)
- Header / Footer (no se tocan)
- Estructura de datos / API (no se toca)
- SEO / JSON-LD (ya existe, no se toca)

## Métricas de éxito

- De ~3,000 líneas a ~780 líneas (-74%)
- De 17 estados de cliente a 2 (-88%)
- De 14 filtros a 5 (-64%)
- Bundle: -30-50kB de framer-motion
- Mobile usable en 375px con touch targets ≥44px
- Build pasa sin errores
- Tests pasan
