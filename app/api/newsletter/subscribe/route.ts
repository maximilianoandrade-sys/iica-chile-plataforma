import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('SubscriptionAPI');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, type, regions, categories, frequency } = body;

    if (!contact || typeof contact !== 'string' || !contact.trim()) {
      return NextResponse.json({ ok: false, error: 'Debes proporcionar un correo o número de WhatsApp válido' }, { status: 400 });
    }

    const trimmedContact = contact.trim();

    if (type === 'whatsapp' && !/^\+?[0-9\s-]{8,15}$/.test(trimmedContact)) {
      return NextResponse.json({ ok: false, error: 'Formato de número de WhatsApp inválido (ej: +56 9 1234 5678)' }, { status: 400 });
    }

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact)) {
      return NextResponse.json({ ok: false, error: 'Formato de correo electrónico inválido' }, { status: 400 });
    }

    const safeRegions = Array.isArray(regions) ? regions : ['Todas'];
    const safeCategories = Array.isArray(categories) ? categories : ['Todas'];
    const safeFrequency = frequency === 'instant_urgent' ? 'instant_urgent' : 'weekly';

    // Persistencia en base de datos
    try {
      const userIdentifier = type === 'whatsapp' ? `wa:${trimmedContact}` : trimmedContact.toLowerCase();
      
      const user = await prisma.usuario.upsert({
        where: { email: userIdentifier },
        update: {
          region: safeRegions[0] !== 'Todas' ? safeRegions[0] : undefined,
          intereses: safeCategories,
        },
        create: {
          email: userIdentifier,
          region: safeRegions[0] !== 'Todas' ? safeRegions[0] : null,
          intereses: safeCategories,
        },
      });

      await prisma.alerta.create({
        data: {
          usuarioId: user.id,
          frecuencia: safeFrequency,
          criterios: {
            contact: trimmedContact,
            type,
            regions: safeRegions,
            categories: safeCategories,
          },
          activo: true,
        },
      });

      if (type === 'email') {
        await prisma.newsletterSubscriber.upsert({
          where: { email: trimmedContact.toLowerCase() },
          update: {},
          create: {
            email: trimmedContact.toLowerCase(),
            verified: false,
          },
        });
      }

      logger.info('Alert subscription successfully stored in DB', { type, contact: trimmedContact });
    } catch (dbError) {
      // Non-blocking: no fallar la UX del agricultor si la BD está offline o no disponible
      logger.warn('Subscription DB persist non-blocking warning', { error: (dbError as Error).message });
    }

    const successMessage = type === 'whatsapp'
      ? `¡Alertas configuradas! Te enviaremos convocatorias a ${trimmedContact} por WhatsApp.`
      : `¡Alertas configuradas! Te enviaremos el boletín personalizado a ${trimmedContact}.`;

    return NextResponse.json({ ok: true, success: true, message: successMessage });
  } catch (err) {
    logger.error('Error processing subscription API', err as Error);
    return NextResponse.json({ ok: false, error: 'Error al procesar la suscripción' }, { status: 500 });
  }
}

