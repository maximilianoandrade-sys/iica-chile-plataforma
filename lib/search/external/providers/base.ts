import type { ExternalProvider, ExternalProjectRecord } from '@/lib/search/external/types';
import type { SearchRequest } from '@/lib/search/contracts';

export interface ProviderContext {
  timeoutMs?: number;
}

export abstract class BaseExternalProvider implements ExternalProvider {
  abstract id: ExternalProvider['id'];

  abstract search(request: SearchRequest, context?: ProviderContext): Promise<ExternalProjectRecord[]>;
}
