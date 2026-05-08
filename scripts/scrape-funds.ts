/**
 * CLI: Ejecuta scrapers y actualiza data/projects.json
 *
 * Uso: npm run scrape
 *      npm run scrape -- --dry-run   (solo muestra, no escribe)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { runAllScrapers, deduplicateScraped } from '../lib/scrapers/index';
import { mergeScrapedIntoProjects } from '../lib/scrapers/merge';
import type { ScrapedProject } from '../lib/scrapers/types';

const PROJECTS_PATH = resolve(__dirname, '..', 'data', 'projects.json');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log('=== IICA Chile — Scraper de Fondos ===\n');

  // 1. Ejecutar scrapers
  console.log('Ejecutando scrapers...');
  const results = await runAllScrapers();

  let totalScraped = 0;
  let totalErrors = 0;

  for (const r of results) {
    const status = r.errors.length > 0 ? 'ERROR' : 'OK';
    console.log(`  [${status}] ${r.source}: ${r.projects.length} fondos (${r.durationMs}ms)`);
    if (r.errors.length > 0) {
      r.errors.forEach(e => console.log(`       -> ${e}`));
    }
    totalScraped += r.projects.length;
    totalErrors += r.errors.length;
  }

  // 2. Agrupar y deduplicar
  const allScraped: ScrapedProject[] = results.flatMap(r => r.projects);
  const unique = deduplicateScraped(allScraped);
  console.log(`\nTotal scrapeado: ${totalScraped} | Unicos: ${unique.length} | Errores: ${totalErrors}`);

  if (unique.length === 0) {
    console.log('No se encontraron fondos nuevos. Saliendo.');
    return;
  }

  // 3. Leer existentes
  const existingRaw = readFileSync(PROJECTS_PATH, 'utf-8');
  const existing = JSON.parse(existingRaw);
  console.log(`Proyectos existentes en JSON: ${existing.length}`);

  // 4. Merge
  const merged = mergeScrapedIntoProjects(existing, unique);
  const newCount = merged.length - existing.length;
  const updatedCount = unique.length - newCount;

  console.log(`\nResultado del merge:`);
  console.log(`  Nuevos:       ${newCount}`);
  console.log(`  Actualizados: ${updatedCount}`);
  console.log(`  Total final:  ${merged.length}`);

  // 5. Escribir
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No se escribio ningun archivo.');
    return;
  }

  writeFileSync(PROJECTS_PATH, JSON.stringify(merged, null, 4), 'utf-8');
  console.log(`\nArchivo actualizado: ${PROJECTS_PATH}`);
  console.log('Listo. Ejecuta "npm run build" para verificar.');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
