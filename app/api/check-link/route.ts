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

        // Verificar el enlace con HEAD request
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'IICA-Chile-Platform/1.0 (Link Checker)'
                }
            });

            clearTimeout(timeoutId);

            // Considerar válido si el status es 2xx o 3xx
            const isValid = response.status >= 200 && response.status < 400;

            return NextResponse.json({
                isValid,
                status: response.status,
                statusText: response.statusText,
                url
            });

        } catch (error: any) {
            // Si hay error (timeout, network, etc), considerar inválido
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
