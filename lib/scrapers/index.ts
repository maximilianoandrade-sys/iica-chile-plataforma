/**
 * Orquestador de scrapers — ejecuta todas las fuentes en paralelo
 */

import { ScrapedProject, ScrapeResult } from './types';
import { scrapeANID } from './anid';
import { scrapeCNR } from './cnr';
import { scrapeFIA } from './fia';

interface ScraperEntry {
  id: string;
  name: string;
  scrape: () => Promise<ScrapedProject[]>;
}

const SCRAPERS: ScraperEntry[] = [
  { id: 'anid', name: 'ANID', scrape: scrapeANID },
  { id: 'cnr',  name: 'CNR',  scrape: scrapeCNR },
  { id: 'fia',  name: 'FIA',  scrape: scrapeFIA },
];

export async function runAllScrapers(): Promise<ScrapeResult[]> {
  const results = await Promise.allSettled(
    SCRAPERS.map(async (s): Promise<ScrapeResult> => {
      const start = Date.now();
      try {
        const projects = await s.scrape();
        return {
          source: s.id,
          projects,
          errors: [],
          durationMs: Date.now() - start,
        };
      } catch (err: unknown) {
        return {
          source: s.id,
          projects: [],
          errors: [err instanceof Error ? err.message : String(err)],
          durationMs: Date.now() - start,
        };
      }
    })
  );

  return results.map(r =>
    r.status === 'fulfilled'
      ? r.value
      : { source: 'unknown', projects: [], errors: [String(r.reason)], durationMs: 0 }
  );
}

/** Deduplica por sourceId, manteniendo la primera aparicion */
export function deduplicateScraped(projects: ScrapedProject[]): ScrapedProject[] {
  const seen = new Set<string>();
  return projects.filter(p => {
    if (seen.has(p.sourceId)) return false;
    seen.add(p.sourceId);
    return true;
  });
}
