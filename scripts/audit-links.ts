import { getPreferredProjectUrl } from '../lib/urlOverrides';

const args = new Set(process.argv.slice(2));
const BASE_URL = process.env.DEPLOYMENT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://iica-chile-plataforma.vercel.app';
const CHECK_LINK_BASE_URL = process.env.CHECK_LINK_BASE_URL || BASE_URL;
const INCLUDE_PROJECT_PAGES = process.env.AUDIT_INCLUDE_PROJECT_PAGES === 'true' || args.has('--include-project-pages');
const CHECK_LINK_MAX_ATTEMPTS = Number(process.env.AUDIT_CHECK_LINK_MAX_ATTEMPTS || '3');
const CHECK_LINK_RETRY_DELAY_MS = Number(process.env.AUDIT_CHECK_LINK_RETRY_DELAY_MS || '250');
const FAIL_ON_NEEDS_REVIEW = process.env.AUDIT_FAIL_ON_NEEDS_REVIEW === 'true';

type LinkResult = {
  url: string;
  ok: boolean;
  status: number;
  reason?: string;
  classification?: 'ok' | 'blocked' | 'needs_review' | 'invalid';
};

const SKIP_LINK = /^(#|mailto:|tel:|javascript:|data:)/i;

type CheckExternalOptions = {
  checkLinkBaseUrl?: string;
  fetcher?: typeof fetch;
  maxAttempts?: number;
  retryDelayMs?: number;
};

function isHomepageRedirect(originalUrl: string, finalUrl: string): boolean {
  try {
    const original = new URL(originalUrl);
    const final = new URL(finalUrl);
    const originalHasPath = original.pathname.length > 1 && original.pathname !== '/';
    const finalIsRoot = final.pathname === '/' || final.pathname === '';
    return originalHasPath && finalIsRoot && original.hostname === final.hostname;
  } catch {
    return false;
  }
}

async function runDirectExternalCheck(url: string, fetcher: typeof fetch): Promise<LinkResult | null> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
  };

  const requests: Array<RequestInit> = [
    { method: 'HEAD', redirect: 'follow', headers },
    { method: 'GET', redirect: 'follow', headers: { ...headers, Range: 'bytes=0-0' } },
    { method: 'GET', redirect: 'follow', headers },
  ];

  for (const requestInit of requests) {
    try {
      const response = await fetcher(url, requestInit);

      if (response.status === 405 && requestInit.method === 'HEAD') {
        continue;
      }

      const redirectedToHome = response.status >= 200
        && response.status < 400
        && response.url
        && isHomepageRedirect(url, response.url);

      if (redirectedToHome) {
        return {
          url,
          ok: false,
          status: response.status,
          reason: 'redirected_to_home',
          classification: 'needs_review',
        };
      }

      if (response.status >= 200 && response.status < 400) {
        return {
          url,
          ok: true,
          status: response.status,
          reason: 'ok_via_direct_check',
          classification: 'ok',
        };
      }

      if (response.status === 403 || response.status === 429) {
        return {
          url,
          ok: true,
          status: response.status,
          reason: 'blocked_by_bot_protection',
          classification: 'blocked',
        };
      }

      return {
        url,
        ok: false,
        status: response.status,
        reason: `http_${response.status}`,
        classification: 'invalid',
      };
    } catch {
      continue;
    }
  }

  return null;
}

function toAbsoluteUrl(href: string, base: string): string | null {
  try {
    const absoluteUrl = new URL(href, base).toString();
    return getPreferredProjectUrl(absoluteUrl);
  } catch {
    return null;
  }
}

function parseLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (m) => m[1]);
}

function normalizeSitemapLoc(loc: string, baseUrl: string): string | null {
  try {
    const base = new URL(baseUrl);
    const source = new URL(loc, base);
    return new URL(`${source.pathname}${source.search}${source.hash}`, base).toString();
  } catch {
    return null;
  }
}

export function parseHrefs(html: string): string[] {
  return Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi), (m) => m[1]);
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkInternal(url: string): Promise<LinkResult> {
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    return {
      url,
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
    };
  } catch {
    return { url, ok: false, status: 0, reason: 'network_error' };
  }
}

export async function checkExternal(url: string, options: CheckExternalOptions = {}): Promise<LinkResult> {
  const checkLinkBaseUrl = options.checkLinkBaseUrl || CHECK_LINK_BASE_URL;
  const fetcher = options.fetcher || fetch;
  const maxAttempts = Math.max(1, options.maxAttempts ?? CHECK_LINK_MAX_ATTEMPTS);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? CHECK_LINK_RETRY_DELAY_MS);
  const endpoint = `${checkLinkBaseUrl}/api/check-link?url=${encodeURIComponent(url)}`;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetcher(endpoint);

      if (response.status === 429) {
        if (attempt < maxAttempts) {
          await sleep(retryDelayMs * attempt);
          continue;
        }
        return {
          url,
          ok: false,
          status: 429,
          reason: 'check_api_rate_limited',
          classification: 'invalid',
        };
      }

      if (!response.ok) {
        if (attempt < maxAttempts) {
          await sleep(retryDelayMs * attempt);
          continue;
        }
        return {
          url,
          ok: false,
          status: response.status,
          reason: 'check_api_failed',
          classification: 'invalid',
        };
      }

      const responseBody = await response.json();
      const check = (responseBody && typeof responseBody === 'object' && 'data' in responseBody)
        ? (responseBody.data as Record<string, unknown>)
        : (responseBody as Record<string, unknown>);
      const reason = check.reason as string | undefined;
      const status = Number(check.status || 0);
      const isBlocked = reason === 'blocked_by_bot_protection' || status === 403 || status === 429;
      const needsReview = reason === 'homepage_url_not_specific'
        || reason === 'redirected_to_home'
        || reason === 'head_not_allowed'
        || check.redirectedToHome === true
        || check.originalIsHomepage === true
        || status === 405;
      const ok = check.isValid === true || isBlocked;

      const result: LinkResult = {
        url,
        ok,
        status,
        reason,
        classification: ok ? (isBlocked ? 'blocked' : 'ok') : (needsReview ? 'needs_review' : 'invalid'),
      };

      if (result.classification !== 'blocked') {
        return result;
      }

      const directCheckResult = await runDirectExternalCheck(url, fetcher);
      if (!directCheckResult) {
        return result;
      }

      if (directCheckResult.classification === 'ok' || directCheckResult.classification === 'needs_review') {
        return directCheckResult;
      }

      return result;
    } catch {
      if (attempt < maxAttempts) {
        await sleep(retryDelayMs * attempt);
        continue;
      }
      return { url, ok: false, status: 0, reason: 'check_api_failed', classification: 'invalid' };
    }
  }

  return { url, ok: false, status: 0, reason: 'check_api_failed', classification: 'invalid' };
}

async function main() {
  const sitemapResponse = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!sitemapResponse.ok) throw new Error(`sitemap unavailable: HTTP ${sitemapResponse.status}`);
  const sitemapXml = await sitemapResponse.text();
  const pages = parseLocs(sitemapXml)
    .map((loc) => normalizeSitemapLoc(loc, BASE_URL))
    .filter((url): url is string => Boolean(url));

  const pagesToScan = pages.filter((raw) => {
    if (INCLUDE_PROJECT_PAGES) return true;
    const pathname = new URL(raw).pathname;
    return !pathname.startsWith('/proyecto/');
  });

  const origin = new URL(BASE_URL).origin;

  const links = new Set<string>();

  for (const page of pagesToScan) {
    const response = await fetch(page);
    if (!response.ok) continue;
    const html = await response.text();
    for (const href of parseHrefs(html)) {
      if (SKIP_LINK.test(href)) continue;
      const absolute = toAbsoluteUrl(href, page);
      if (!absolute) continue;
      links.add(absolute);
    }
  }

  const allLinks = Array.from(links);
  const internal = allLinks.filter((u) => u.startsWith(origin));
  const external = allLinks.filter((u) => !u.startsWith(origin));

  const internalResults = await Promise.all(internal.map(checkInternal));
  const externalResults = await Promise.all(external.map((url) => checkExternal(url)));

  const failedInternal = internalResults.filter((r) => !r.ok);
  const failedExternal = externalResults.filter((r) => !r.ok);
  const blockedExternal = externalResults.filter((r) => r.classification === 'blocked');
  const reviewExternal = externalResults.filter((r) => r.classification === 'needs_review');
  const recoveredByDirectCheck = externalResults.filter((r) => r.reason === 'ok_via_direct_check');

  console.log(
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        checkLinkBaseUrl: CHECK_LINK_BASE_URL,
        pagesScanned: pagesToScan.length,
        pagesSkipped: pages.length - pagesToScan.length,
        includeProjectPages: INCLUDE_PROJECT_PAGES,
        linksFound: allLinks.length,
        internalChecked: internal.length,
        internalFailed: failedInternal.length,
        externalChecked: external.length,
        externalBlockedByBotProtection: blockedExternal.length,
        externalRecoveredByDirectCheck: recoveredByDirectCheck.length,
        externalNeedsReview: reviewExternal.length,
        externalFailed: failedExternal.length,
      },
      null,
      2,
    ),
  );

  if (failedInternal.length > 0) {
    console.log('\nFAILED_INTERNAL_LINKS');
    for (const item of failedInternal) {
      console.log(`${item.status} ${item.url}`);
    }
  }

  if (failedExternal.length > 0) {
    console.log('\nFAILED_EXTERNAL_LINKS');
    for (const item of failedExternal) {
      console.log(`${item.status} ${item.url} ${item.reason || ''}`);
    }
  }

  if (blockedExternal.length > 0) {
    console.log('\nBLOCKED_EXTERNAL_LINKS');
    for (const item of blockedExternal) {
      console.log(`${item.status} ${item.url} ${item.reason || ''}`);
    }
  }

  if (reviewExternal.length > 0) {
    console.log('\nREVIEW_EXTERNAL_LINKS');
    for (const item of reviewExternal) {
      console.log(`${item.status} ${item.url} ${item.reason || ''}`);
    }
  }

  const shouldFailByReview = FAIL_ON_NEEDS_REVIEW && reviewExternal.length > 0;

  if (shouldFailByReview) {
    console.error(`\n[audit-links] failing due to needs_review links: ${reviewExternal.length}`);
  }

  if (failedInternal.length > 0 || failedExternal.length > 0 || shouldFailByReview) {
    process.exit(1);
  }
}

const isDirectExecution = Boolean(
  process.argv[1]
  && /audit-links\.(ts|js)$/.test(process.argv[1])
  && !process.env.JEST_WORKER_ID,
);

if (isDirectExecution) {
  main().catch((error) => {
    console.error('[audit-links] crash:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

export {};
