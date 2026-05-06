/**
 * API Route: Verificación de Enlaces
 *
 * Mejorada para detectar:
 *  - Status HTTP 4xx/5xx (link roto)
 *  - Redirect a homepage genérica (link movido/removido pero servidor responde 200
 *    con la home en vez de la página específica). Antes este caso pasaba como
 *    "válido" y el usuario aterrizaba en la home, lejos de la convocatoria.
 *
 * El consumidor (linkGuardian) usa isValid=false para mostrar fallback de
 * búsqueda de Google en lugar del sitio oficial.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isHomepageRedirect(originalUrl: string, finalUrl: string): boolean {
    try {
        const original = new URL(originalUrl);
        const final = new URL(finalUrl);
        // Mismo dominio + path original con contenido + path final vacío/raíz
        const originalHasPath = original.pathname.length > 1 && original.pathname !== '/';
        const finalIsRoot = final.pathname === '/' || final.pathname === '';
        return originalHasPath && finalIsRoot && original.hostname === final.hostname;
    } catch {
        return false;
    }
}

/**
 * URL guardada es directamente la homepage del dominio (sin path específico).
 * Útil para casos donde el dato heredado tenía solo el dominio raíz.
 */
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

        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format', isValid: false },
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

            // 2. Si HEAD falla, intentar GET con range mínimo
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

            // Status code base
            const statusOk = response.status >= 200 && response.status < 400;

            // Detectar redirect a homepage genérica
            const redirectedToHome = statusOk && response.url ? isHomepageRedirect(url, response.url) : false;

            // Detectar si la URL original ya era homepage (sin deep link)
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
        } catch (error: any) {
            return NextResponse.json({
                isValid: false,
                error: error.message || 'Network error',
                url,
            });
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error', isValid: false },
            { status: 500 }
        );
    }
}
