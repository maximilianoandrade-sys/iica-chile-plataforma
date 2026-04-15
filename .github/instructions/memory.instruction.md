---
applyTo: '**'
---

# Memoria / Auditoría de Implementación

**Fecha de actualización:** 10 abril 2026

---
## Avance actual

### Frontend
- Migrados los filtros de Región, Perfil y Fuente a multiselección usando Material UI Autocomplete, ahora con sincronización robusta Estado ↔ URL (arrays, cadenas, retrocompatible, edge cases).
- Validación de valores: Solo se aceptan valores válidos en la UI y desde la URL; cualquier error o dato inconsistente es limpiado automáticamente.
- Sincronización bidireccional totalmente probada y estable.
- Componente `MultiFilterSelect.tsx` reutilizable y consistente con línea visual institucional.

### Data/Backend
- Script extractor modular para FONTAGRO (`fetch-fontagro-calls.js`) listo para recolectar todas las convocatorias abiertas/históricas, scrapeando y normalizando datos clave al formato estándar del proyecto (`fontagro_convocatorias.json`).
- Documentación de uso y dependencias incluida en el script.

---
## Implementación extractor GEF (Global Environment Facility) — 10.04.2026

- Se creó el script `fetch-gef-calls.js` con Node.js. Automatiza la descarga y extracción del CSV oficial exportado en https://www.thegef.org/projects-operations/database/export?page&_format=csv
- El script mapea y normaliza todos los proyectos/llamados del GEF al formato estándar: `{ titulo, agencia, categoria, monto, fecha_apertura, fecha_cierre, link, resumen, tags, paises, fuente, links_docs }`. La compatibilidad con el backend/ingesta está garantizada (usa las mismas llaves y estructura que FONTAGRO).
- Dependencias: `npm install axios csv-parse`.
- Instrucciones de uso: ejecutar `node fetch-gef-calls.js`. Genera el archivo `gef_projects.json` listo para importar.
- Enlaces a proyectos individuales se reconstruyen por ID si no vienen explícitos.
- Si algún campo de resumen o links a documentos específicos faltan, se recomienda enriquecer programáticamente en siguientes iteraciones o integrar scraping modularizado en el futuro.
- Documentación y receta incluida de manera similar a los otros extractores.

## Gaps/fuentes internacionales prioritarias pendientes (**Actualizado 10.04.2026**)

- Fuentes con extractor y output vigente: GEF, FONTAGRO (ver scripts raíz).
- Fuentes prioritarias faltantes a cubrir con extractor propio (al menos):
  - FAO
  - World Bank
  - BID (+ BID Lab)
  - CAF
  - GAFSP
  - FIDA
  - CIAT/CGIAR
  - USDA NIFA
  - Fondos UE (CAP, otros)
  - Fondation FARM, Gates Foundation, Rockefeller, USAID, OEA
  - **Adaptation Fund (Fondo de Adaptación)**
  - Otros portales multi-agencia relevantes

> Se detectó que el sitio del Fondo de Adaptación (https://www.adaptation-fund.org/projects-programmes/project-information/projects-table-view/) permite la descarga masiva de proyectos en CSV, lo que asegura máxima robustez en la automatización y adaptación a cambios futuros. Se recomienda crear extractor modular Node.js usando este endpoint como fuente primaria. Se podrá filtrar por país, sector (“Agriculture”, “Food Security”, “Rural Development”, etc.) y estado, y normalizar al formato estándar de GEF/FONTAGRO.

---
## Roadmap inmediato

1. Implementar y documentar extractor para el Fondo de Adaptación (output: `adaptation_fund_projects.json`), usando el CSV exportable oficial.
2. Documentar y normalizar el output al formato institucional `{ titulo, agencia, categoria, monto, fecha_apertura, fecha_cierre, link, resumen, tags, paises, fuente, links_docs }`.
3. Investigar estructura del portal de convocatorias FAO y bosquejar/extractar plantilla o endpoint para automatizar su scraper.
4. Dejar preparado el esqueleto/scripts para World Bank, BID, CAF, y otras fuentes multilaterales clave, siguiendo el mismo patrón modular.

# Si retomas, continua desde aquí siguiendo el orden del roadmap, o contacta a la IA con “retomar roadmap extractor internacional”.

---
