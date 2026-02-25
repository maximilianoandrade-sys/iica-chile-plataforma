# INFORME TÉCNICO DE AVANCES
## Plataforma IICA Chile — Radar de Oportunidades 2026
**Período:** 2 de febrero al 25 de febrero de 2026  
**Preparado por:** Asistente de Desarrollo (IA)  
**Fecha de emisión:** 25/02/2026  
**Repositorio:** https://github.com/maximilianoandrade-sys/iica-chile-plataforma  

---

## RESUMEN EJECUTIVO

Durante el período cubierto por este informe se realizaron **33 commits** sobre la rama `main`, transformando la plataforma de un prototipo funcional básico en una herramienta de gestión de oportunidades agrícolas lista para uso institucional. Los avances se organizan en tres fases claramente diferenciadas.

| Fase | Período | Commits | Foco principal |
|------|---------|---------|----------------|
| Fase 0 — Fundamentos UX | 02/02/2026 | 4 | Rediseño asistente, maletín cloud |
| Fase 1 — Escala y calidad | 18/02/2026 | 18 | Base de datos real, motor de búsqueda, UX premium |
| Fase 2 — Inteligencia | 24–25/02/2026 | 11 | Motor búsqueda v2.0, analytics, feed en vivo |

---

## FASE 0 — FUNDAMENTOS UX (2 de febrero de 2026)

### 1. Refactorización Smart Assistant 2.0
**Commit:** `d78dc27`

El módulo "Asistente Inteligente" fue completamente rediseñado:
- **Antes:** Formulario paso a paso con múltiples pantallas que guiaba al usuario de forma lineal.
- **Después:** Panel reactivo de filtrado con **"Pills" (etiquetas clicables)** que aplican filtros instantáneamente sin necesidad de navegación.
- Se implementó **deep linking** desde las tarjetas de "Programas Hemisféricos" al sistema de filtrado principal, de modo que al hacer clic en un programa se precarga automáticamente el filtro correspondiente en la URL.
- El sistema de filtrado lee parámetros de URL al cargar y aplica los filtros de forma automática (útil para compartir búsquedas por enlace).

### 2. Mi Maletín → Repositorio Cloud Compartido
**Commits:** `18c8d49`, `07ec183`

El módulo "Mi Maletín" fue transformado de almacenamiento local (localStorage) a un repositorio en la nube compartido entre todos los usuarios:
- **Eliminación de localStorage:** Los documentos ya no se guardan en el navegador individual.
- **Integración JSONBin.io:** Backend cloud gratuito como almacenamiento centralizado.
- **Funcionalidades disponibles:** Subir documentos, descargar, eliminar y sincronización automática entre sesiones.
- **Resultado:** Cualquier documento subido por un técnico es visible para todos los demás usuarios autenticados.
- Se eliminó la sección "Recursos" y sus enlaces del layout principal (simplificación del menú).

---

## FASE 1 — ESCALA Y CALIDAD DE DATOS (18 de febrero de 2026)

Esta fue la fase más intensa en volumen de commits: 18 cambios en un solo día, abarcando datos, UX, motor de búsqueda y calidad de código.

### 3. Base de Datos: 26 Fondos Reales Verificados
**Commits:** `c7eb244`, `2ebb7db`, `75e0d2d`

Se realizó una auditoría completa del archivo `data/projects.json`:
- **Limpieza:** Se eliminaron todos los fondos de relleno o inventados.
- **Fondos nacionales verificados:** CNR, INDAP, FIA, CORFO, Sercotec, SAG, GOREs.
- **Fondos internacionales verificados (7 nuevos):**
  - GEF (Fondo para el Medio Ambiente Mundial)
  - FIDA (Fondo Internacional de Desarrollo Agrícola)
  - BID (Banco Interamericano de Desarrollo)
  - FAO (Organización de las Naciones Unidas para la Alimentación)
  - Unión Europea (EUROCLIMA+)
  - IICA (programas hemisféricos)
  - Banco Mundial
- Corrección de URLs de bases oficiales en todos los fondos.
- Adición de campos nuevos: `ambito`, `estadoPostulacion`, `viabilidadIICA`, `porcentajeViabilidad`, `rolIICA`, `complejidad`, `responsableIICA`, `notasInternas`, `fortalezas`, `debilidades`.

### 4. Motor de Búsqueda v1.0: Ranking de Relevancia
**Commit:** `6551fb0`

El buscador se actualizó de búsqueda simple (contiene/no contiene) a un sistema de ranking ponderado:
- Búsqueda multi-campo con pesos: título (mayor peso) > institución > categoría > descripción.
- Filtros avanzados adicionales: por monto mínimo/máximo, beneficiarios, región, institución específica.
- Filtro "Solo abiertos" con cálculo de fecha en tiempo real.
- Chip "Internacional" para distinguir oportunidades internacionales en la UI.

### 5. Página de Detalle por Proyecto `/proyecto/[id]`
**Commit:** `2a45dbe`

Se creó una página dinámica de detalle para cada proyecto:
- URL semántica `/proyecto/[id]` generada automáticamente para cada oportunidad.
- Muestra todos los campos del proyecto: resumen ejecutivo, cofinanciamiento, requisitos clave, fortalezas/debilidades IICA, notas internas del equipo, contacto responsable.
- Primer export CSV desde esta página (exportación de ficha individual).

### 6. UX Premium: Vista de Lista Rediseñada
**Commits:** `65442b2`, `4cdd84d`, `0c9113b`, `fcd191a`

Rediseño visual completo de la lista de proyectos:
- **Vista tabla (desktop):** Padding optimizado, badges de estado coloreados, columna de acciones con botones.
- **Vista card (móvil):** Tarjetas con franja de color superior por ámbito, información compacta prioritizada.
- **Barra de comparación sticky:** Permite seleccionar hasta 3 proyectos y compararlos lado a lado (modal `ComparadorModal`).
- **Filtros rápidos (Quick Filters):** Chips horizontales de acceso inmediato a las búsquedas más comunes.
- **Cajón lateral (Side Drawer):** En móvil, los filtros avanzados se despliegan desde un drawer lateral en lugar de ocupar espacio en pantalla.

### 7. Tipografía y Marca
**Commit:** `c503bea`

Cambio de fuente institucional a **Outfit** (Google Fonts):
- Mayor legibilidad en pantallas de alta densidad.
- Mejor alineación con la imagen moderna del IICA.
- Aplicada a toda la plataforma mediante variable CSS global.

### 8. Mejoras de Contraste y Accesibilidad Móvil
**Commit:** `6dbe2f5`

- Mejora de contraste en la sección "Programas Hemisféricos" en dispositivos móviles.
- Optimización de filtros móviles: el panel de filtros se convierte en drawer en pantallas pequeñas.
- Mejora del Maletín para técnicos IICA (rediseño `71e4c13`): interfaz orientada a gestión documental institucional, no a agricultores.

### 9. Vista Rápida y Copiar Ficha
**Commit:** `bd2481c`

- Botón de "Vista rápida" en cada proyecto: despliega un resumen en un modal sin navegar a la página de detalle.
- Botón "Copiar ficha": copia al portapapeles un texto formateado con los datos clave del proyecto, listo para pegar en WhatsApp, email o documentos.

### 10. Auditoría Final y Páginas Legales
**Commit:** `75e0d2d`

- Creación de páginas `/legal/privacidad` y `/legal/terminos` (requerimiento institucional).
- Actualización del favicon con logo IICA.
- Tooltips informativos en campos técnicos (cofinanciamiento, complejidad, viabilidad).
- Corrección del export CSV: ahora incluye todos los campos y es compatible con Excel.

### 11. Fuentes Internacionales y Footer
**Commit:** `747599c`

- Limpieza de la base de datos: se eliminaron programas de fomento interno que no son convocatorias competitivas.
- Se añadieron fuentes ONU (FAO, FIDA), BID y otros en la sección "Fuentes Oficiales".
- Actualización del newsletter y footer con información de contacto real IICA Chile.

---

## FASE 2 — INTELIGENCIA Y ANALYTICS (24–25 de febrero de 2026)

### 12. 21 Mejoras Críticas — Radar de Oportunidades (Fase 1 Completa)
**Commit:** `5dfdd27` — 24/02/2026

Implementación de un plan de 21 mejoras agrupadas en áreas:

#### Datos e Interfaz
- **Indicador de Ámbito con color:** Franja lateral verde (Nacional), azul (Internacional), púrpura (Regional) en cada tarjeta.
- **Badge de Ámbito en cards y tabla:** Etiqueta visual de emoji + texto en cada resultado.
- **Barra de Viabilidad IICA:** Barra de progreso de color (verde/amarillo/rojo) con porcentaje numérico.
- **Badge de Complejidad:** Etiqueta "Fácil / Media / Alta" con tooltip explicativo.
- **Alerta "Sin responsable":** Badge naranja automático cuando un proyecto no tiene responsable IICA asignado.

#### Sección Sobre Nosotros
- Página `/about` completamente nueva con misión, visión y presencia del IICA en Chile.
- `ImpactSection`: Sección de impacto con números clave del IICA (países, proyectos, años).

#### Herramientas Rurales (`lib/ruralTools.ts`)
- **Compartir por WhatsApp:** Genera enlace con texto formateado del proyecto.
- **Agregar a Calendario (.ics):** Descarga archivo de calendario con fecha de cierre de la convocatoria.
- **Google Calendar:** Abre Google Calendar con los datos del proyecto precargados.

#### Comparador de Proyectos
- **Modal de comparación lado a lado:** Hasta 3 proyectos simultáneamente.
- Muestra: institución, monto, fecha cierre, viabilidad, rol IICA, complejidad, ámbito.
- Barra sticky de comparación en la parte inferior de la pantalla.

#### Breadcrumb y Navegación
- Componente `Breadcrumb` en página de detalle `/proyecto/[id]`.
- Estado vacío mejorado (`EmptyState`): mensaje específico cuando no hay resultados con link a limpiar filtros.

### 13. Campo `rolIICA` — Filtro de Rol del IICA
**Commit:** `55df09a` — 25/02/2026

Nuevo campo y filtro en todo el sistema:
- **Valores:** `Ejecutor` / `Implementador` / `Asesor` / `Indirecto`
- **Actualización de datos:** Campo `rolIICA` añadido a todos los proyectos en `projects.json`.
- **Motor de búsqueda:** El campo `rolIICA` ahora forma parte del corpus de búsqueda textual.
- **UI `ProjectFilters`:** Nuevo selector "Rol del IICA" con 5 opciones (incluye "Todos").
- **Ordenamiento:** El rol IICA es uno de los criterios del score de urgencia compuesto.

### 14. Motor de Búsqueda v2.0 — Sistema Unificado
**Commit:** `35627c5` — 25/02/2026

Refactorización completa del motor de búsqueda en `lib/searchEngine.ts`:

| Componente | Descripción |
|-----------|-------------|
| **Corpus unificado** | Todos los campos del proyecto concatenados con pesos diferenciados |
| **Índice invertido** | Pre-computado para lookup O(1) en lugar de scan lineal |
| **TF-IDF + Cosine Similarity** | Score semántico que detecta relevancia aunque las palabras exactas no coincidan |
| **Tesauro agrícola** | 80+ términos con sinónimos (agua↔riego↔hidrico, indap↔agricultor, etc.) |
| **Lenguaje natural rural** | 30+ frases completas: "fondos para riego", "subsidio pequeño agricultor" |
| **Tolerancia a errores** | Distancia Levenshtein ≤2 para corregir typos ("fontagor" encuentra FONTAGRO) |
| **Score contextual** | Penalización por proyectos cerrados, bonus por urgencia de cierre |

**Fórmula de score final:**
```
Score Total = 70% (score por campo ponderado) + 30% (cosine similarity TF-IDF)
```

### 15. Funcionalidades de Búsqueda Inteligente
**Commit:** `c973c31` — 25/02/2026

- **Búsqueda por frase exacta:** Usar comillas — `"FAO TCP"` encuentra solo proyectos con esa frase literal.
- **Sugerencias dinámicas:** El autocompletado se genera a partir del contenido real de los proyectos (nombres, instituciones, ejes IICA), no de listas hardcodeadas.
- **"¿Quisiste decir?":** Banner que aparece cuando una búsqueda retorna 0 resultados, sugiriendo términos similares mediante Levenshtein + tesauro.
- **Ordenamiento inteligente por defecto:** Cuando no hay búsqueda activa, los proyectos se ordenan por score compuesto (urgencia + rol + viabilidad).

### 16. Datos Verificados: FONTAGRO 2026, FIA, CNR
**Commit:** `e639d5f` — 25/02/2026

Actualización de `data/projects.json` con información 100% verificada desde fuentes oficiales:

| Proyecto | Dato verificado |
|---------|----------------|
| **FONTAGRO 2026** | Cierre: 20 abril 2026 (15:00 ET). Monto: hasta USD 250.000. IICA es co-administrador con BID. Contacto: fontagro@iica.int |
| **FIA AgroCoopInnova 2026** | Cierre: 31 marzo 2026. URL específica de convocatoria verificada. |
| **CNR Concurso N°05-2026** | Cierre: 23 abril 2026. Obras civiles y tecnificación centro-norte. |

### 17. Sección "Fondos Abiertos Ahora" (LiveFeedSection)
**Commits:** `e639d5f`, `deebf6c` — 25/02/2026

Nueva sección en la página principal:
- Muestra convocatorias abiertas con datos verificados estáticos (FONTAGRO, FIA, CNR).
- Badges de urgencia automáticos: 🔴 <7 días / 🟡 <21 días / 🟢 +21 días.
- Badge de relevancia IICA: "⭐ Relevancia IICA" para los más relevantes.
- Indicador de fuente (verificado manualmente).
- **Fix de estabilidad:** El componente usa datos síncronos estáticos (no fetch externo) → no puede crashear el build.

### 18. Motor de Analytics: `lib/analyticsEngine.ts`
**Commit:** `c89e429` — 25/02/2026

Nuevo módulo de cálculo de KPIs:

```typescript
calcUrgencyScore(project)    // Score 0-100: 40% urgencia + 35% viabilidad + 25% rol
calcProjectKPIs(projects)    // KPIs sobre conjunto filtrado
exportProjectsToCSV(projects) // CSV completo con 16 campos + score
```

**KPIs calculados en tiempo real:**
- Total de proyectos abiertos / cerrados / urgentes
- Monto total en pipeline (solo abiertos, formateado CLP)
- Distribución por viabilidad (Alta / Media / Baja)
- Días promedio al cierre
- Proyecto con score más alto

### 19. Barra de Analytics (AnalyticsStrip)
**Commit:** `c89e429` — 25/02/2026

Componente `AnalyticsStrip` integrado entre los filtros y la lista de resultados:
- Se actualiza en tiempo real con cada búsqueda o cambio de filtro.
- KPIs: abiertos/total, monto pipeline, distribución viabilidad, días promedio al cierre.
- Barra visual de distribución de viabilidad con colores verde/amarillo/rojo.
- Alerta pulsante 🔴 cuando hay proyectos que cierran en ≤7 días.
- **Botón "Exportar CSV":** Descarga exactamente lo que está visible en pantalla en ese momento, compatible con Excel (BOM UTF-8). Incluye 16 campos: nombre, institución, monto, fecha cierre, días restantes, viabilidad, rol IICA, score de urgencia, URL bases, etc.

### 20. Mejora del Ordenamiento: urgencyScore Compuesto
**Commit:** `c89e429` — 25/02/2026

El `defaultSortProjects` en `searchEngine.ts` ahora usa una fórmula única en lugar de 4 criterios encadenados:

```
urgencyScore = (urgencia_temporal × 0.40) + (viabilidad_% × 0.35) + (rol_mult × via_mult × 100 × 0.25)

Donde:
  urgencia_temporal = max(0, 100 - (días_restantes / 120) × 100)
  rol_mult:  Ejecutor=1.0  Implementador=0.85  Asesor=0.65  Indirecto=0.4
  via_mult:  Alta=1.0      Media=0.7            Baja=0.4
```

---

## RESUMEN DE ARCHIVOS MODIFICADOS/CREADOS

### Archivos nuevos creados
| Archivo | Descripción |
|---------|-------------|
| `lib/searchEngine.ts` | Motor de búsqueda v2.0 completo |
| `lib/analyticsEngine.ts` | Motor de KPIs y export CSV |
| `lib/liveFeed.ts` | Feed de convocatorias verificadas |
| `lib/ruralTools.ts` | Herramientas WhatsApp, .ics, Google Calendar |
| `lib/linkGuardian.ts` | Validador de URLs de bases oficiales |
| `lib/logos.ts` | Mapa de logos institucionales |
| `components/AnalyticsStrip.tsx` | Barra de KPIs en tiempo real |
| `components/LiveFeedSection.tsx` | Sección fondos abiertos ahora |
| `components/ImpactSection.tsx` | Sección de impacto IICA |
| `components/AboutSection.tsx` | Sección Quiénes Somos |
| `components/ui/Toast.tsx` | Componente de notificación |
| `components/ui/ComparadorModal.tsx` | Modal de comparación de proyectos |
| `app/about/page.tsx` | Página /about |
| `app/proyecto/[id]/page.tsx` | Página detalle por proyecto |
| `app/legal/privacidad/page.tsx` | Política de privacidad |
| `app/legal/terminos/page.tsx` | Términos de uso |
| `hooks/useAnalytics.ts` | Hook de tracking de eventos |

### Archivos significativamente modificados
| Archivo | Cambios principales |
|---------|---------------------|
| `data/projects.json` | 26 fondos reales + campos IICA completos |
| `components/ProjectItem.tsx` | Badges, viabilidad, herramientas rurales, comparador |
| `components/ProjectFilters.tsx` | Sugerencias dinámicas, "¿Quisiste decir?", filtro rolIICA |
| `components/ProjectListContainer.tsx` | AnalyticsStrip, hasActiveFilters, motor v2.0 |
| `components/Header.tsx` | Navegación actualizada, hero mejorado |
| `components/Footer.tsx` | Fuentes internacionales, contacto IICA real |
| `components/ProgramsSection.tsx` | Deep linking, datos hemisféricos reales |
| `app/page.tsx` | LiveFeedSection integrado, layout mejorado |
| `app/globals.css` | Fuente Outfit, variables CSS, animaciones |

---

## MÉTRICAS DE IMPACTO TÉCNICO

| Métrica | Antes (01/02) | Después (25/02) | Mejora |
|---------|--------------|-----------------|--------|
| Proyectos en base de datos | ~10 inventados | **26 reales verificados** | +160% |
| Campos por proyecto | ~8 | **30+** | +275% |
| Precisión del buscador | Básica (contiene/no contiene) | **TF-IDF + Levenshtein + tesauro 80+ términos** | ∞ |
| Páginas de la plataforma | 1 (home) | **7** (home, about, detalle, legal×2, admin, maletín) | +600% |
| Filtros disponibles | 3 | **10** (categoría, región, beneficiario, institución, ámbito, viabilidad, estado, rol, monto, abiertos) | +233% |
| Funciones de exportación | 0 | **2** (CSV filtrado, ficha individual) | nueva |
| Herramientas de colaboración | 0 | **3** (WhatsApp, .ics, Google Calendar) | nueva |

---

## ARQUITECTURA ACTUAL DE LA PLATAFORMA

```
iica-chile-plataforma/
├── app/
│   ├── page.tsx                    ← Dashboard principal
│   ├── about/page.tsx              ← Quiénes somos
│   ├── proyecto/[id]/page.tsx      ← Detalle dinámico
│   ├── maletin/page.tsx            ← Repositorio cloud
│   ├── admin/page.tsx              ← Panel administración
│   └── legal/                      ← Privacidad + Términos
├── components/
│   ├── ProjectListContainer.tsx    ← Orquestador central (Server)
│   ├── ProjectFilters.tsx          ← Búsqueda + filtros (Client)
│   ├── ProjectList.tsx             ← Renderizado lista/tabla
│   ├── ProjectItem.tsx             ← Tarjeta/fila individual
│   ├── AnalyticsStrip.tsx          ← KPIs en tiempo real (Client) ← NUEVO
│   ├── LiveFeedSection.tsx         ← Fondos abiertos ahora ← NUEVO
│   ├── ProgramsSection.tsx         ← Programas hemisféricos IICA
│   ├── ImpactSection.tsx           ← Métricas de impacto ← NUEVO
│   └── ...
├── lib/
│   ├── searchEngine.ts             ← Motor búsqueda v2.0 ← RENOVADO
│   ├── analyticsEngine.ts          ← KPIs + urgencyScore ← NUEVO
│   ├── liveFeed.ts                 ← Feed convocatorias ← NUEVO
│   ├── data.ts                     ← Tipos + helpers
│   ├── ruralTools.ts               ← WhatsApp/Calendar ← NUEVO
│   └── logos.ts                    ← Logos institucionales ← NUEVO
└── data/
    └── projects.json               ← 26 fondos reales verificados ← ACTUALIZADO
```

---

## PENDIENTES IDENTIFICADOS / PRÓXIMOS PASOS

### Alta prioridad
1. **Panel de estado de aplicaciones (Kanban):** Columnas Identificado → Analizando → Aplicado → Adjudicado/Rechazado. Sin esto, el equipo no puede trackear el pipeline de postulaciones.
2. **Alertas de vencimiento por email:** Notificación automática cuando una convocatoria cierra en ≤7 días.
3. **Edición de proyectos desde la UI:** Actualmente requiere editar `projects.json` manualmente en el código.

### Prioridad media
4. **Vista Calendario de cierres:** Ver todos los vencimientos en un calendario mensual interactivo.
5. **Comentarios por proyecto:** Notas del equipo visibles para todos (integrar con JSONBin.io ya existente).
6. **CRM de contactos por institución:** "El contacto en FONTAGRO es X, teléfono Y".
7. **Historial de convocatorias cerradas:** Memoria institucional de lo que se postuló.

### Mejoras técnicas
8. **`npm install` en ambiente local:** El entorno local del usuario no tiene `node_modules` instalado, lo que genera warnings en el IDE (no afecta producción en Render).
9. **Variables de entorno en Render:** Verificar que `NEXT_PUBLIC_*` estén configuradas en el dashboard de Render.
10. **Tests automatizados:** Agregar tests al motor de búsqueda para garantizar regresiones.

---

*Informe generado el 25/02/2026 — Para uso interno del equipo técnico IICA Chile*  
*Repositorio: https://github.com/maximilianoandrade-sys/iica-chile-plataforma*
