const args = new Set(process.argv.slice(2));
const BASE_URL = process.env.DEPLOYMENT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://iica-chile-plataforma.vercel.app';
const CHECK_LINK_BASE_URL = process.env.CHECK_LINK_BASE_URL || BASE_URL;
const INCLUDE_PROJECT_PAGES = process.env.AUDIT_INCLUDE_PROJECT_PAGES === 'true' || args.has('--include-project-pages');

type LinkResult = {
  url: string;
  ok: boolean;
  status: number;
  reason?: string;
  classification?: 'ok' | 'blocked' | 'needs_review' | 'invalid';
};

const SKIP_LINK = /^(#|mailto:|tel:|javascript:|data:)/i;

function toAbsoluteUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
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

function parseHrefs(html: string): string[] {
  return Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi), (m) => m[1]);
}

async function getJson(url: string, init?: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.json();
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

async function checkExternal(url: string): Promise<LinkResult> {
  try {
    const check = await getJson(`${CHECK_LINK_BASE_URL}/api/check-link?url=${encodeURIComponent(url)}`);
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

    return {
      url,
      ok,
      status,
      reason,
      classification: ok ? (isBlocked ? 'blocked' : 'ok') : (needsReview ? 'needs_review' : 'invalid'),
    };
  } catch {
    return { url, ok: false, status: 0, reason: 'check_api_failed', classification: 'invalid' };
  }
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
  const externalResults = await Promise.all(external.map(checkExternal));

  const failedInternal = internalResults.filter((r) => !r.ok);
  const failedExternal = externalResults.filter((r) => !r.ok);
  const blockedExternal = externalResults.filter((r) => r.classification === 'blocked');
  const reviewExternal = externalResults.filter((r) => r.classification === 'needs_review');

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

  if (failedInternal.length > 0 || failedExternal.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[audit-links] crash:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});

export {};
