import { getLogger } from '@/lib/utils/logger';
import type { SearchRequest } from '@/lib/search/contracts';
import { mapSearchRequestToLinkedInQuery } from '@/lib/search/external/mapper';
import {
  normalizeLinkedInPublicRecord,
  type LinkedInPublicRawRecord,
} from '@/lib/search/external/normalizer';
import type { ExternalProjectRecord } from '@/lib/search/external/types';
import { BaseExternalProvider, type ProviderContext } from '@/lib/search/external/providers/base';

const logger = getLogger('LinkedInPublicProvider');

export class LinkedInPublicProvider extends BaseExternalProvider {
  id = 'linkedin_public' as const;

  async search(request: SearchRequest, context?: ProviderContext): Promise<ExternalProjectRecord[]> {
    const mapped = mapSearchRequestToLinkedInQuery(request);
    logger.debug('Mapped external search query', {
      provider: this.id,
      query: mapped.query,
      unsupportedFilters: mapped.unsupportedFilters,
      timeoutMs: context?.timeoutMs ?? 0,
    });

    // Placeholder implementation for public-only mode.
    // In PR hardening/integration this is replaced with a real public source client.
    const rawRecords: LinkedInPublicRawRecord[] = [];

    return rawRecords
      .map((record, index) => normalizeLinkedInPublicRecord(record, 1_000_000 + index))
      .filter((record): record is ExternalProjectRecord => Boolean(record));
  }
}
