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

import { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-response';
import { isAllowedPublicHttpUrl, verifyHostnameResolvesToPublicIps } from '@/lib/utils/network-security';

export const runtime = 'nodejs';

const BOT_PROTECTED_HOST_PATTERNS = [
    'fia.cl',
    'iadb.org',
    'ifad.org',
    'facebook.com',
    'linkedin.com',
    'x.com',
    'twitter.com',
];

function isLikelyBotProtectedHost(hostname: string): boolean {
    return BOT_PROTECTED_HOST_PATTERNS.some((pattern) => hostname === pattern || hostname.endsWith(`.${pattern}`));
}

function isAbortError(error: unknown): boolean {
    return error instanceof Error && (error.name === 'AbortError' || /aborted/i.test(error.message));
}

/** Resolve DNS and verify the resolved IP is not private (prevents DNS rebinding). */
async function verifyResolvedIp(hostname: string): Promise<boolean> {
    return verifyHostnameResolvesToPublicIps(hostname);
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
        return createErrorResponse(
            'Demasiadas solicitudes. Intente nuevamente más tarde.',
            429,
            { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return createErrorResponse('URL parameter is required', 400);
        }

        if (!isAllowedPublicHttpUrl(url)) {
            return createErrorResponse('URL not allowed: must be a public HTTP/HTTPS URL', 400);
        }

        // DNS rebinding protection: resolve hostname and verify IP is public
        const parsed = new URL(url);
        const ipSafe = await verifyResolvedIp(parsed.hostname);
        if (!ipSafe) {
            return createErrorResponse('URL resolves to a private/internal IP address', 400);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const baseHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            };

            let response: Response | null = null;

            // 1) HEAD primero (rápido y liviano)
            try {
                const headResponse = await fetch(url, {
                    method: 'HEAD',
                    redirect: 'follow',
                    headers: baseHeaders,
                    signal: controller.signal,
                });

                if (headResponse.status < 400) {
                    response = headResponse;
                }
            } catch {
            }

            // 2) Si HEAD no confirmó validez, intentar GET con range mínimo
            if (!response) {
                try {
                    response = await fetch(url, {
                        method: 'GET',
                        redirect: 'follow',
                        headers: {
                            ...baseHeaders,
                            Range: 'bytes=0-0',
                        },
                        signal: controller.signal,
                    });
                } catch {
                }
            }

            // 3) Fallback final: GET normal (algunos sitios bloquean Range)
            if (!response) {
                response = await fetch(url, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: baseHeaders,
                    signal: controller.signal,
                });
            }

            clearTimeout(timeoutId);

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

            return createSuccessResponse({
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
                return createSuccessResponse({
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

            return createSuccessResponse({
                isValid: false,
                error: error instanceof Error ? error.message : 'Network error',
                url,
            }, 502);
        }
    } catch (error: unknown) {
        return createErrorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
    }
}
