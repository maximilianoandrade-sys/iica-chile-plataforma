import { getLogger } from '@/lib/utils/logger';
import type { SearchRequest } from '@/lib/search/contracts';
import type {
  ExternalProjectRecord,
  ExternalProvider,
  ExternalSearchResult,
} from '@/lib/search/external/types';

const logger = getLogger('ExternalSearchOrchestrator');

function normalizeString(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function dedupeKey(record: Pick<ExternalProjectRecord, 'nombre' | 'institucion' | 'url_bases'>): string {
  return `${normalizeString(record.url_bases)}::${normalizeString(record.nombre)}::${normalizeString(record.institucion)}`;
}

export function dedupeExternalProjects(projects: ExternalProjectRecord[]): ExternalProjectRecord[] {
  const seen = new Set<string>();
  const deduped: ExternalProjectRecord[] = [];

  for (const project of projects) {
    const key = dedupeKey(project);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(project);
  }

  return deduped;
}

export async function runExternalSearch(
  providers: ExternalProvider[],
  request: SearchRequest
): Promise<ExternalSearchResult> {
  const runs = await Promise.all(
    providers.map(async (provider) => {
      const startedAt = Date.now();
      try {
        const projects = await provider.search(request);
        return {
          provider: provider.id,
          projects,
          success: true,
          error: undefined,
          durationMs: Date.now() - startedAt,
        };
      } catch (error) {
        logger.warn('External provider failed', {
          provider: provider.id,
          error: (error as Error).message,
        });
        return {
          provider: provider.id,
          projects: [] as ExternalProjectRecord[],
          success: false,
          error: (error as Error).message,
          durationMs: Date.now() - startedAt,
        };
      }
    })
  );

  const allProjects = dedupeExternalProjects(runs.flatMap((run) => run.projects));
  const degraded = runs.some((run) => !run.success);

  return {
    projects: allProjects,
    providers: runs.map((run) => run.provider),
    providerStats: runs.map((run) => ({
      provider: run.provider,
      success: run.success,
      resultCount: run.projects.length,
      durationMs: run.durationMs,
      error: run.error,
    })),
    degraded,
  };
}

export type { ExternalProvider } from '@/lib/search/external/types';
