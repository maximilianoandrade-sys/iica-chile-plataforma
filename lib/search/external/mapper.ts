import type { SearchRequest } from '@/lib/search/contracts';

export interface LinkedInQueryMap {
  query: string;
  limit: number;
  unsupportedFilters: Array<'minAmount' | 'maxAmount'>;
}

export function mapSearchRequestToLinkedInQuery(request: SearchRequest): LinkedInQueryMap {
  const terms: string[] = ['site:linkedin.com'];

  if (request.query?.trim()) terms.push(request.query.trim());
  if (request.institution?.trim()) terms.push(request.institution.trim());
  if (request.region?.trim()) terms.push(request.region.trim());
  if (request.ambito && request.ambito !== 'all') terms.push(request.ambito);
  if (request.estado) terms.push(request.estado);

  terms.push('convocatoria');

  const unsupportedFilters: Array<'minAmount' | 'maxAmount'> = [];
  if (request.minAmount != null) unsupportedFilters.push('minAmount');
  if (request.maxAmount != null) unsupportedFilters.push('maxAmount');

  return {
    query: terms.join(' ').trim(),
    limit: 20,
    unsupportedFilters,
  };
}
