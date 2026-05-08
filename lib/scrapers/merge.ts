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
