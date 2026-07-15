import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
const logger = getLogger('Newsletter');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, name, consent } = body;

        if (!consent) {
            return createErrorResponse('Se requiere consentimiento para la suscripción', 400);
        }

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
