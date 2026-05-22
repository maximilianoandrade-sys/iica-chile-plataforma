# Política de Logos Institucionales

## Prioridad de fuentes

1. **Sitio oficial** de la institución (máxima prioridad)
2. **Wikimedia Commons** (fuente secundaria confiable)
3. **Google Images** (último recurso, verificar licencia)

## Formato preferido

- **SVG** es el formato preferido (escalable, liviano).
- **PNG** se permite como fallback temporal cuando no hay SVG disponible.

## Campos requeridos por logo en el manifiesto

Cada entrada en `institutions[]` dentro de `public/logos/official/manifest.json` debe incluir:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `key` | string | Identificador único (ej. `"cnr"`, `"corfo"`) |
| `displayName` | string | Nombre visible (ej. `"Comisión Nacional de Riego"`) |
| `file` | string | Ruta relativa al asset (ej. `"cnr.svg"`) |
| `sourceUrl` | string | URL de donde se obtuvo el logo |
| `sourceType` | `"official"` \| `"wikimedia"` \| `"google"` | Tipo de fuente |
| `capturedAt` | string (ISO date) | Fecha en que se descargó el asset |
| `format` | `"svg"` \| `"png"` | Formato del archivo |
| `notes` | string | Observaciones opcionales |

## Prohibiciones

- **No se permiten logos generados por IA** (DALL-E, Midjourney, etc.).
- **No se permiten recreaciones vectoriales inventadas** — solo assets obtenidos directamente de fuentes verificables.

## Cuando no hay asset disponible

Si ninguna fuente proporciona un logo válido, la UI muestra únicamente **texto o sigla** de la institución con un badge de color asignado. No se debe inventar ni aproximar un logo.

## Proceso para agregar un logo nuevo

1. **Encontrar fuente** — buscar en sitio oficial, luego Wikimedia, luego Google Images.
2. **Guardar asset** — descargar el archivo a `public/logos/official/`.
3. **Registrar en manifiesto** — agregar entrada en `manifest.json` con todos los campos requeridos.
4. **Verificar en local** — confirmar que el logo se renderiza correctamente en la aplicación.
