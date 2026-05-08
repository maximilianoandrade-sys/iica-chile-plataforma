/**
 * Scraper: CNR (Comisión Nacional de Riego)
 * Fuente: https://www.cnr.gob.cl/agricultores/concursos-de-riego-y-drenaje/bases-de-concurso/
 * Extrae: Concursos Ley 18.450 de riego y drenaje
 */

import { ScrapedProject } from './types';
import { fetchPage, stripHtml, slugify, deriveEstado } from './utils';

const SOURCE_URL = 'https://www.cnr.gob.cl/agricultores/concursos-de-riego-y-drenaje/bases-de-concurso/';
const INSTITUCION = 'CNR';

export async function scrapeCNR(): Promise<ScrapedProject[]> {
  const html = await fetchPage(SOURCE_URL);
  const projects: ScrapedProject[] = [];

  // CNR page lists concurso categories as sections/links
  // Look for PDF links to bases documents and section headers
  // Categories: Obras Menores, Obras Medianas, Pequeña Agricultura, GORE, CNR-CONADI

  // Pattern 1: Look for category headers with concurso info
  const sectionPattern = /<h[2-4][^>]*>([^<]*(?:concurso|obras|pequeña|agricultura|conadi|riego)[^<]*)<\/h[2-4]>/gi;
  let match;

  const categories = new Set<string>();

  while ((match = sectionPattern.exec(html)) !== null) {
    const title = stripHtml(match[1]).trim();
    if (title.length > 5) categories.add(title);
  }

  // Pattern 2: Look for links to PDF bases
  const pdfPattern = /<a[^>]*href="([^"]*\.pdf)"[^>]*>([^<]+)<\/a>/gi;
  const pdfLinks: Array<{ url: string; name: string }> = [];

  while ((match = pdfPattern.exec(html)) !== null) {
    const url = match[1].startsWith('http') ? match[1] : `https://www.cnr.gob.cl${match[1]}`;
    const name = stripHtml(match[2]).trim();
    if (name.length > 10 && name.toLowerCase().includes('base')) {
      pdfLinks.push({ url, name });
    }
  }

  // Pattern 3: Look for general concurso links
  const linkPattern = /<a[^>]*href="(https?:\/\/[^"]*cnr[^"]*)"[^>]*>([^<]*(?:concurso|bases|riego|postul)[^<]*)<\/a>/gi;

  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    const nombre = stripHtml(match[2]).trim();
    if (nombre.length < 10) continue;

    const sourceId = `cnr:${slugify(nombre)}`;
    if (projects.some(p => p.sourceId === sourceId)) continue;

    // CNR concursos are typically open for several months
    const fechaCierre = new Date();
    fechaCierre.setMonth(fechaCierre.getMonth() + 3);

    projects.push({
      sourceId,
      nombre: `CNR – ${nombre}`,
      institucion: INSTITUCION,
      monto: 0,
      fecha_cierre: fechaCierre,
      estado: 'Abierto',
      categoria: 'Nacional',
      url_bases: url,
      regiones: ['Todas'],
      beneficiarios: ['Organizaciones de regantes', 'Agricultores', 'Comunidades de aguas'],
      objetivo: `Concurso CNR Ley 18.450: ${nombre}`,
    });
  }

  // If no individual concursos found, create entries from known categories
  if (projects.length === 0) {
    const knownCategories = [
      { name: 'Obras Menores de Riego', beneficiarios: ['Pequeños agricultores', 'Organizaciones de regantes'] },
      { name: 'Obras Medianas de Riego', beneficiarios: ['Organizaciones de usuarios de aguas', 'Juntas de vigilancia'] },
      { name: 'Pequeña Agricultura', beneficiarios: ['Pequeños agricultores INDAP', 'Campesinos'] },
      { name: 'CNR-CONADI Riego Indígena', beneficiarios: ['Comunidades indígenas', 'Pequeños agricultores indígenas'] },
    ];

    for (const cat of knownCategories) {
      const fechaCierre = new Date();
      fechaCierre.setMonth(fechaCierre.getMonth() + 3);

      projects.push({
        sourceId: `cnr:${slugify(cat.name)}-2026`,
        nombre: `CNR – Concursos Ley 18.450: ${cat.name}`,
        institucion: INSTITUCION,
        monto: 0,
        fecha_cierre: fechaCierre,
        estado: 'Abierto',
        categoria: 'Nacional',
        url_bases: SOURCE_URL,
        regiones: ['Todas'],
        beneficiarios: cat.beneficiarios,
        objetivo: `Programa de bonificación al riego - ${cat.name}. Consultar bases vigentes en ${SOURCE_URL}`,
      });
    }
  }

  return projects;
}
