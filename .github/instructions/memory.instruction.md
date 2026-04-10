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

## Próximos pasos (recomendados para retomar)

1. Implementar extractores para FAO, BID, FIDA, EUROCLIMA, etc. usando receta y formato unificados.
2. Testear integración con backend y documentar la ingestión/automatización.
3. Registrar avance y resultados en este archivo de memoria cada vez que se complete un paso importante.

---
## Instrucciones para el futuro
- Si quieres continuar, solo abre esta carpeta y revisa este archivo de memoria para saber el último estado, el camino recorrido y el siguiente paso sugerido, o solicita a la IA “retomar extractor X” y continúa de inmediato.
- Archivo clave: `.github/instructions/memory.instruction.md` (esta memoria), más todo el código en `components/` y scripts en la raíz.

---
