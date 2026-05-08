/**
 * Scraper: ANID (Agencia Nacional de Investigación y Desarrollo)
 * Fuente: https://anid.cl/concursos/
 * Extrae: Fondecyt, FONDEF, Becas, y otros concursos de investigación
 */

import { ScrapedProject } from './types';
import { fetchPage, stripHtml, slugify, parseDate, deriveEstado } from './utils';

const SOURCE_URL = 'https://anid.cl/concursos/';
const INSTITUCION = 'ANID';

export async function scrapeANID(): Promise<ScrapedProject[]> {
  const html = await fetchPage(SOURCE_URL);
  const projects: ScrapedProject[] = [];

  // ANID's concursos page has cards/items with concurso info
  // Pattern: <a href="URL">TITLE</a> with dates
  // Look for concurso links with their titles
  const concursoPattern = /<a[^>]*href="(https?:\/\/anid\.cl\/concursos\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;

  while ((match = concursoPattern.exec(html)) !== null) {
    const url = match[1];
    const nombre = stripHtml(match[2]).trim();

    // Skip navigation links, generic text
    if (nombre.length < 15 || nombre.includes('Ver más') || nombre.includes('Inicio')) continue;

    // Try to extract date from nearby context (search within 500 chars after the link)
    const contextStart = match.index;
    const context = html.substring(contextStart, contextStart + 1000);

    // Look for dates like "24 de junio de 2026" or "24/06/2026"
    const datePatterns = [
      /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i,
      /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,
    ];

    const months: Record<string, number> = {
      enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
      julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
    };

    let fechaCierre: Date | null = null;

    for (const pattern of datePatterns) {
      const dateMatch = context.match(pattern);
      if (dateMatch) {
        if (dateMatch[2] && months[dateMatch[2].toLowerCase()]) {
          fechaCierre = new Date(
            parseInt(dateMatch[3]),
            months[dateMatch[2].toLowerCase()] - 1,
            parseInt(dateMatch[1])
          );
        } else {
          fechaCierre = parseDate(dateMatch[0]);
        }
        break;
      }
    }

    // Default: 6 months from now if no date found
    if (!fechaCierre) {
      fechaCierre = new Date();
      fechaCierre.setMonth(fechaCierre.getMonth() + 6);
    }

    const sourceId = `anid:${slugify(nombre)}`;

    // Skip duplicates within this scrape
    if (projects.some(p => p.sourceId === sourceId)) continue;

    projects.push({
      sourceId,
      nombre: `ANID – ${nombre}`,
      institucion: INSTITUCION,
      monto: 0, // ANID doesn't usually list amounts on the listing page
      fecha_cierre: fechaCierre,
      estado: deriveEstado(fechaCierre),
      categoria: 'Nacional',
      url_bases: url,
      regiones: ['Todas'],
      beneficiarios: ['Investigadores', 'Universidades', 'Centros de investigación'],
      objetivo: `Concurso ANID: ${nombre}`,
    });
  }

  return projects;
}
