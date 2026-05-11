import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
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
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
