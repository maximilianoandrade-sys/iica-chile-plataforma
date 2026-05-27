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
const DEFAULT_TIMEOUT_MS = 10_000;
const PUBLIC_SEARCH_URL = 'https://duckduckgo.com/html/';

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, ' ');
}

function shortHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function extractDateCandidate(text: string): string | undefined {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso?.[1]) return iso[1];

  const ddmmyyyy = text.match(/\b(\d{2})[\/\-](\d{2})[\/\-](20\d{2})\b/);
  if (!ddmmyyyy?.[0]) return undefined;

  const [, dd, mm, yyyy] = ddmmyyyy;
  return `${yyyy}-${mm}-${dd}`;
}

function extractAmountCandidate(text: string): string | undefined {
  const amount = text.match(/(\$\s?[\d\.,]{4,}|CLP\s?[\d\.,]{4,}|USD\s?[\d\.,]{4,})/i);
  return amount?.[1];
}

function inferOrganization(request: SearchRequest, text: string): string {
  if (request.institution?.trim()) return request.institution.trim();

  const known = [
    'INDAP',
    'CNR',
    'CORFO',
    'FIA',
    'IICA',
    'FAO',
    'FONTAGRO',
    'BID',
    'GEF',
  ];

  const upper = text.toUpperCase();
  const found = known.find((entry) => upper.includes(entry));
  return found ?? 'LinkedIn (público)';
}

export function resolvePublicResultUrl(href: string | undefined): string | null {
  if (!href) return null;
  if (href.startsWith('/l/?')) {
    try {
      const wrapper = new URL(`https://duckduckgo.com${href}`);
      const resolved = wrapper.searchParams.get('uddg');
      return resolved ? decodeURIComponent(resolved) : null;
    } catch {
      return null;
    }
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  return null;
}

export function extractLinkedInRawRecordsFromHtml(
  html: string,
  request: SearchRequest
): LinkedInPublicRawRecord[] {
  const seenUrls = new Set<string>();
  const records: LinkedInPublicRawRecord[] = [];

  const anchorRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let index = 0;
  let anchorMatch: RegExpExecArray | null;

  while ((anchorMatch = anchorRegex.exec(html)) !== null) {
    const href = anchorMatch[1];
    const titleHtml = anchorMatch[2] || '';

    const resolvedUrl = resolvePublicResultUrl(href);
    if (!resolvedUrl || !resolvedUrl.includes('linkedin.com')) continue;
    if (seenUrls.has(resolvedUrl)) continue;

    const title = normalizeWhitespace(stripHtmlTags(titleHtml));
    if (!title) continue;

    const tail = html.slice(anchorRegex.lastIndex);
    const snippetMatch = tail.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const snippet = normalizeWhitespace(stripHtmlTags(snippetMatch?.[1] || ''));

    seenUrls.add(resolvedUrl);

    const combinedText = `${title} ${snippet}`;
    records.push({
      id: `pub-${shortHash(resolvedUrl)}-${index}`,
      title,
      organization: inferOrganization(request, combinedText),
      url: resolvedUrl,
      snippet,
      postedAt: new Date().toISOString().slice(0, 10),
      deadlineText: extractDateCandidate(combinedText),
      amountText: extractAmountCandidate(combinedText),
      regionText: request.region,
    });

    index++;
  }

  return records;
}

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

    const timeoutMs = context?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        `${PUBLIC_SEARCH_URL}?q=${encodeURIComponent(mapped.query)}&kl=${encodeURIComponent(mapped.languageRegion)}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; IICA-Chile-Platform/1.0)',
            'Accept-Language': 'es-CL,es;q=0.9,en;q=0.6',
          },
        }
      );

      if (!response.ok) {
        logger.warn('Public search returned non-OK response', {
          provider: this.id,
          status: response.status,
        });
        return [];
      }

      const html = await response.text();
      const rawRecords: LinkedInPublicRawRecord[] = extractLinkedInRawRecordsFromHtml(html, request);

      const normalized = rawRecords
        .map((record, index) => normalizeLinkedInPublicRecord(record, 1_000_000 + index))
        .filter((record): record is ExternalProjectRecord => Boolean(record));

      return normalized.slice(0, mapped.limit);
    } catch (error) {
      logger.warn('Public search failed', {
        provider: this.id,
        error: (error as Error).message,
      });
      return [];
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
