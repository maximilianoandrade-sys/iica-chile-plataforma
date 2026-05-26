/**
 * API Route: Verificación de Enlaces
 *
 * Mejorada para detectar:
 *  - Status HTTP 4xx/5xx (link roto)
 *  - Redirect a homepage genérica (link movido/removido pero servidor responde
 *    200 con la home en vez de la página específica). Antes este caso pasaba
 *    como "válido" y el usuario aterrizaba en la home, lejos de la convocatoria.
 *  - URL guardada es directamente la homepage del dominio (sin path específico).
 *
 * El consumidor (linkGuardian) usa isValid=false para mostrar fallback de
 * búsqueda de Google en lugar del sitio oficial.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { lookup } from 'dns/promises';

export const runtime = 'nodejs';

/** Blocked IP ranges: private, loopback, link-local, metadata endpoints */
const BLOCKED_HOSTNAMES = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '[::1]',
    '169.254.169.254', // AWS/GCP metadata
    'metadata.google.internal',
]);

const BOT_PROTECTED_HOST_PATTERNS = [
    'fia.cl',
    'iadb.org',
    'ifad.org',
    'facebook.com',
    'linkedin.com',
    'x.com',
    'twitter.com',
];

function isBlockedHost(hostname: string): boolean {
    if (BLOCKED_HOSTNAMES.has(hostname)) return true;

    // Block private IPv4 ranges
    const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ipv4Match) {
        const [, a, b] = ipv4Match.map(Number);
        if (a === 10) return true;                    // 10.0.0.0/8
        if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
        if (a === 192 && b === 168) return true;      // 192.168.0.0/16
        if (a === 127) return true;                   // 127.0.0.0/8
        if (a === 0) return true;                     // 0.0.0.0/8
        if (a === 169 && b === 254) return true;      // 169.254.0.0/16 link-local
    }

    return false;
}

function isAllowedUrl(urlString: string): boolean {
    try {
        const parsed = new URL(urlString);
        // Only allow http and https
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
        // Block private/internal hosts
        if (isBlockedHost(parsed.hostname)) return false;
        return true;
    } catch {
        return false;
    }
}

function isLikelyBotProtectedHost(hostname: string): boolean {
    return BOT_PROTECTED_HOST_PATTERNS.some((pattern) => hostname === pattern || hostname.endsWith(`.${pattern}`));
}

function isAbortError(error: unknown): boolean {
    return error instanceof Error && (error.name === 'AbortError' || /aborted/i.test(error.message));
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

/** Resolve DNS and verify the resolved IP is not private (prevents DNS rebinding). */
async function verifyResolvedIp(hostname: string): Promise<boolean> {
    try {
        const { address } = await lookup(hostname);
        return !isBlockedHost(address);
    } catch {
        // DNS resolution failed — allow fetch to handle the error
        return true;
    }
}

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

function isOriginalHomepage(originalUrl: string): boolean {
    try {
        const u = new URL(originalUrl);
        return u.pathname === '/' || u.pathname === '';
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`check-link:${ip}`, { maxRequests: 20, windowSizeSeconds: 60 });
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Demasiadas solicitudes. Intente nuevamente más tarde.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required', isValid: false },
                { status: 400 }
            );
        }

        if (!isAllowedUrl(url)) {
            return NextResponse.json(
                { error: 'URL not allowed: must be a public HTTP/HTTPS URL', isValid: false },
                { status: 400 }
            );
        }

        // DNS rebinding protection: resolve hostname and verify IP is public
        const parsed = new URL(url);
        const ipSafe = await verifyResolvedIp(parsed.hostname);
        if (!ipSafe) {
            return NextResponse.json(
                { error: 'URL resolves to a private/internal IP address', isValid: false },
                { status: 400 }
            );
        }

        try {
            const baseHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            };

            let response: Response | null = null;

            // 1) HEAD primero (rápido y liviano)
            try {
                const headResponse = await fetchWithTimeout(url, {
                    method: 'HEAD',
                    redirect: 'follow',
                    headers: baseHeaders,
                }, 9000);

                if (headResponse.status < 400) {
                    response = headResponse;
                }
            } catch (error: unknown) {
            }

            // 2) Si HEAD no confirmó validez, intentar GET con range mínimo
            if (!response) {
                try {
                    response = await fetchWithTimeout(url, {
                        method: 'GET',
                        redirect: 'follow',
                        headers: {
                            ...baseHeaders,
                            Range: 'bytes=0-0',
                        },
                    }, 12000);
                } catch (error: unknown) {
                }
            }

            // 3) Fallback final: GET normal (algunos sitios bloquean Range)
            if (!response) {
                response = await fetchWithTimeout(url, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: baseHeaders,
                }, 12000);
            }

            const statusOk = response.status >= 200 && response.status < 400;
            const redirectedToHome = statusOk && response.url ? isHomepageRedirect(url, response.url) : false;
            const originalIsHomepage = isOriginalHomepage(url);
            const blockedByBotProtection = response.status === 403 || response.status === 429;
            const methodNotAllowed = response.status === 405;

            const isValid = (statusOk || blockedByBotProtection || methodNotAllowed) && !redirectedToHome && !originalIsHomepage;
            const reason = !isValid
                ? (redirectedToHome
                    ? 'redirected_to_home'
                    : originalIsHomepage
                        ? 'homepage_url_not_specific'
                        : `http_${response.status}`)
                : blockedByBotProtection
                    ? 'blocked_by_bot_protection'
                    : methodNotAllowed
                        ? 'head_not_allowed'
                        : 'ok';

            return NextResponse.json({
                isValid,
                status: response.status,
                statusText: response.statusText,
                url,
                finalUrl: response.url,
                reason,
                redirectedToHome,
                originalIsHomepage,
            });
        } catch (error: unknown) {
            const originalIsHomepage = isOriginalHomepage(url);
            if (isAbortError(error) && isLikelyBotProtectedHost(parsed.hostname) && !originalIsHomepage) {
                return NextResponse.json({
                    isValid: true,
                    status: 0,
                    statusText: 'Request Timeout',
                    url,
                    finalUrl: url,
                    reason: 'blocked_by_bot_protection',
                    redirectedToHome: false,
                    originalIsHomepage,
                });
            }

            return NextResponse.json({
                isValid: false,
                error: error instanceof Error ? error.message : 'Network error',
                url,
            });
        }
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error', isValid: false },
            { status: 500 }
        );
    }
}
