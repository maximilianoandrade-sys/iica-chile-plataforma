/**
 * API Route: Verificación de Enlaces
 * Verifica si un enlace está activo usando HEAD request
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

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

        // Validar que sea una URL válida
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format', isValid: false },
                { status: 400 }
            );
        }

        // Verificar el enlace
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout

            // 1. Intentar HEAD primero (más rápido)
            let response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            });

            // 2. Si HEAD falla (403, 405, etc), intentar GET limitado
            if (response.status >= 400) {
                response = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Range': 'bytes=0-0' // Solo pedir el primer byte
                    }
                });
            }

            clearTimeout(timeoutId);

            // Considerar válido si el status es 2xx o 3xx
            const isValid = response.status >= 200 && response.status < 400;

            return NextResponse.json({
                isValid,
                status: response.status,
                statusText: response.statusText,
                url,
                method: response.url === url ? 'HEAD/GET' : 'REDIRECT'
            });

        } catch (error: any) {
            return NextResponse.json({
                isValid: false,
                error: error.message || 'Network error',
                url
            });
        }

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error', isValid: false },
            { status: 500 }
        );
    }
}
