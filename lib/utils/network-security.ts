import { lookup } from 'dns/promises';
import { isIP } from 'net';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  '169.254.169.254',
  'metadata.google.internal',
]);

function isPrivateIpv4(hostname: string): boolean {
  const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!ipv4Match) return false;

  const [, a, b, c, d] = ipv4Match.map(Number);
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 198 && b === 18) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224 || (a === 255 && b === 255 && c === 255 && d === 255)) return true;
  return false;
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (normalized === '::1') return true;
  const mappedIpv4 = normalized.match(/^::ffff:(?:(\d+)\.(\d+)\.(\d+)\.(\d+)|([0-9a-f]{1,4}):([0-9a-f]{1,4}))$/i);
  if (mappedIpv4) {
    const address = mappedIpv4[1]
      ? mappedIpv4.slice(1, 5).join('.')
      : `${Number.parseInt(mappedIpv4[5], 16) >> 8}.${Number.parseInt(mappedIpv4[5], 16) & 255}.${Number.parseInt(mappedIpv4[6], 16) >> 8}.${Number.parseInt(mappedIpv4[6], 16) & 255}`;
    return isPrivateIpv4(address);
  }
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // fc00::/7
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true; // fe80::/10
  if (normalized === '::' || normalized.startsWith('2001:db8:')) return true;
  return false;
}

export function isBlockedHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(normalized)) return true;
  if (isPrivateIpv4(normalized)) return true;
  if (isIP(normalized) === 6 && isPrivateIpv6(normalized)) return true;
  return false;
}

export function isAllowedPublicHttpUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (isBlockedHost(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function verifyHostnameResolvesToPublicIps(hostname: string): Promise<boolean> {
  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (addresses.length === 0) return true; // domain has no IP records, fetch will handle network error
    return addresses.every((entry) => !isBlockedHost(entry.address));
  } catch (err: unknown) {
    // If domain lookup fails (e.g. ENOTFOUND / ENODATA), it's not a private IP threat;
    // return true so fetch attempts connection and properly returns 502 with isValid=false.
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : undefined;
    if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'EAI_AGAIN') {
      return true;
    }
    return false;
  }
}

const MAX_REDIRECTS = 3;

/** Fetches a public URL while validating every redirect destination. */
export async function fetchPublicUrl(
  input: string,
  init: RequestInit = {},
  maxRedirects = MAX_REDIRECTS,
): Promise<Response> {
  let currentUrl = input;

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    if (!isAllowedPublicHttpUrl(currentUrl)) {
      throw new Error('URL not allowed: must be a public HTTP/HTTPS URL');
    }

    const parsed = new URL(currentUrl);
    if (!(await verifyHostnameResolvesToPublicIps(parsed.hostname))) {
      throw new Error('URL resolves to a private/internal IP address');
    }

    const response = await fetch(currentUrl, { ...init, redirect: 'manual' });
    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get('location');
    if (!location || redirectCount === maxRedirects) {
      throw new Error('Too many or invalid redirects');
    }
    currentUrl = new URL(location, currentUrl).toString();
  }

  throw new Error('Too many redirects');
}
