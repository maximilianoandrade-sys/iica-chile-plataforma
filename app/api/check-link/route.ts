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

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            // 1. HEAD primero (más rápido)
            let response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                },
            });

            // 2. Si HEAD falla (403, 405, etc), intentar GET con range mínimo
            if (response.status >= 400) {
                response = await fetch(url, {
                    method: 'GET',
                    redirect: 'follow',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Range': 'bytes=0-0',
                    },
                });
            }

            clearTimeout(timeoutId);

            const statusOk = response.status >= 200 && response.status < 400;
            const redirectedToHome = statusOk && response.url ? isHomepageRedirect(url, response.url) : false;
            const originalIsHomepage = isOriginalHomepage(url);

            const isValid = statusOk && !redirectedToHome && !originalIsHomepage;

            return NextResponse.json({
                isValid,
                status: response.status,
                statusText: response.statusText,
                url,
                finalUrl: response.url,
                redirectedToHome,
                originalIsHomepage,
            });
        } catch (error: unknown) {
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
