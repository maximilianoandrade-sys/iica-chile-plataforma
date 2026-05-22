import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
const logger = getLogger('Newsletter');

export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`newsletter:${ip}`, { maxRequests: 3, windowSizeSeconds: 3600 });
    if (!rateLimit.allowed) {
        return createErrorResponse('Demasiadas solicitudes. Intente nuevamente en una hora.', 429, { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) });
    }

    try {
        const body = await req.json();
        const { email, name } = body;

        if (!email || typeof email !== 'string') {
            return createErrorResponse('Email es requerido', 400);
        }

        if (email.length > 254) {
            return createErrorResponse('Email demasiado largo', 400);
        }

        if (name && (typeof name !== 'string' || name.length > 200)) {
            return createErrorResponse('Nombre inválido o demasiado largo', 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return createErrorResponse('Email no válido', 400);
        }

        await prisma.newsletterSubscriber.upsert({
            where: { email: email.toLowerCase().trim() },
            update: { name: name || undefined },
            create: {
                email: email.toLowerCase().trim(),
                name: name || null,
                verified: false,
            },
        });

        return createSuccessResponse({ message: 'Suscripción registrada exitosamente' });
    } catch (error) {
        logger.error('Newsletter subscription error', error as Error);
        return createErrorResponse('Error interno del servidor', 500);
    }
}
