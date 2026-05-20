import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
const logger = getLogger('Newsletter');

export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`newsletter:${ip}`, { maxRequests: 3, windowSizeSeconds: 3600 });
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Demasiadas solicitudes. Intente nuevamente en una hora.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const body = await req.json();
        const { email, name } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
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

        return NextResponse.json(
            { success: true, message: 'Suscripción registrada exitosamente' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Newsletter subscription error', error as Error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
