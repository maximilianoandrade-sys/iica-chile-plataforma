/**
 * Scraper: FIA (Fundación para la Innovación Agraria)
 * Fuente: https://www.fia.cl/programas-estrategicos/
 * Extrae: Programas estratégicos activos
 */

import { ScrapedProject } from './types';
import { fetchPage, stripHtml, slugify, deriveEstado } from './utils';

const SOURCE_URL = 'https://www.fia.cl/programas-estrategicos/';
const INSTITUCION = 'FIA';

export async function scrapeFIA(): Promise<ScrapedProject[]> {
  const html = await fetchPage(SOURCE_URL);
  const projects: ScrapedProject[] = [];

  // FIA's programas page lists strategic programs with links
  // Pattern: links to program pages like /programas-estrategicos/programa-xxx/
  const programPattern = /<a[^>]*href="(https?:\/\/www\.fia\.cl\/programas-estrategicos\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;

  while ((match = programPattern.exec(html)) !== null) {
    const url = match[1];
    let nombre = stripHtml(match[2]).trim();

    // Skip generic navigation links
    if (nombre.length < 10 || nombre.includes('Ver más') || nombre === 'Programas Estratégicos') continue;
    // Skip anchors to same page
    if (url === SOURCE_URL || url.endsWith('/programas-estrategicos/')) continue;

    const sourceId = `fia:${slugify(nombre)}`;
    if (projects.some(p => p.sourceId === sourceId)) continue;

    // FIA programs are typically year-long
    const fechaCierre = new Date();
    fechaCierre.setMonth(fechaCierre.getMonth() + 6);

    projects.push({
      sourceId,
      nombre: `FIA – ${nombre}`,
      institucion: INSTITUCION,
      monto: 0,
      fecha_cierre: fechaCierre,
      estado: 'Abierto',
      categoria: 'Nacional',
      url_bases: url,
      regiones: ['Todas'],
      beneficiarios: ['Agricultores', 'Emprendedores rurales', 'Centros de investigación'],
      objetivo: `Programa estratégico FIA: ${nombre}`,
    });
  }

  // Also check convocatoria.fia.cl for active calls
  try {
    const convHtml = await fetchPage('https://www.fia.cl/convocatorias/');
    const convPattern = /<a[^>]*href="(https?:\/\/www\.fia\.cl\/convocatorias\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;

    while ((match = convPattern.exec(convHtml)) !== null) {
      const url = match[1];
      let nombre = stripHtml(match[2]).trim();

      if (nombre.length < 10 || nombre.includes('Ver más')) continue;

      const sourceId = `fia:conv-${slugify(nombre)}`;
      if (projects.some(p => p.sourceId === sourceId)) continue;

      const fechaCierre = new Date();
      fechaCierre.setMonth(fechaCierre.getMonth() + 3);

      projects.push({
        sourceId,
        nombre: `FIA – ${nombre}`,
        institucion: INSTITUCION,
        monto: 0,
        fecha_cierre: fechaCierre,
        estado: 'Abierto',
        categoria: 'Nacional',
        url_bases: url,
        regiones: ['Todas'],
        beneficiarios: ['Agricultores', 'Cooperativas', 'Centros de investigación'],
        objetivo: `Convocatoria FIA: ${nombre}`,
      });
    }
  } catch {
    // convocatorias page might not be accessible, skip
  }

  return projects;
}
