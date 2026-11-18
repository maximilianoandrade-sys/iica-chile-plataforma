import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { checkDistributedRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';

const logger = getLogger('SubscriptionAPI');

const SubscriptionSchema = z.object({
  contact: z.string().min(1, 'Debes proporcionar un contacto'),
  type: z.enum(['email', 'whatsapp']),
  regions: z.array(z.string()).optional().default(['Todas']),
  categories: z.array(z.string()).optional().default(['Todas']),
  frequency: z.enum(['instant_urgent', 'weekly']).optional().default('weekly'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Se requiere consentimiento expreso para el tratamiento de datos (Ley 21.719)',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const clientId = getRateLimitIdentifier(request, 'newsletter');
    const rateLimit = await checkDistributedRateLimit(clientId, 5, 60_000);
    if (!rateLimit.success) {
      return createErrorResponse('Demasiadas solicitudes; reintenta más tarde', 429);
    }

    let jsonBody: unknown;
    try {
      jsonBody = await request.json();
    } catch {
      return createErrorResponse('Cuerpo de solicitud inválido', 400);
    }

    // Normalize payload if caller passed { email, name, consent }
    const raw = jsonBody as Record<string, unknown>;
    const normalizedPayload = {
      contact: raw.contact || raw.email,
      type: raw.type || 'email',
      regions: raw.regions || ['Todas'],
      categories: raw.categories || ['Todas'],
      frequency: raw.frequency || 'weekly',
      consent: raw.consent,
    };

    const parsed = SubscriptionSchema.safeParse(normalizedPayload);
    if (!parsed.success) {
      return createErrorResponse(parsed.error.issues?.[0]?.message || 'Datos de suscripción inválidos', 400);
    }

    const { contact, type, regions, categories, frequency } = parsed.data;
    const trimmedContact = contact.trim();

    if (type === 'whatsapp' && !/^\+?[0-9\s-]{8,15}$/.test(trimmedContact)) {
      return createErrorResponse('Formato de número de WhatsApp inválido (ej: +56 9 1234 5678)', 400);
    }

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact)) {
      return createErrorResponse('Formato de correo electrónico inválido', 400);
    }

    const safeRegions = regions.length > 0 ? regions : ['Todas'];
    const safeCategories = categories.length > 0 ? categories : ['Todas'];

    // Persistencia en base de datos sin catch silencioso
    const userIdentifier = type === 'whatsapp' ? `wa:${trimmedContact}` : trimmedContact.toLowerCase();

    const user = await prisma.usuario.upsert({
      where: { email: userIdentifier },
      update: {
        telefono: type === 'whatsapp' ? trimmedContact : undefined,
        region: safeRegions[0] !== 'Todas' ? safeRegions[0] : undefined,
        intereses: safeCategories,
      },
      create: {
        email: userIdentifier,
        telefono: type === 'whatsapp' ? trimmedContact : null,
        region: safeRegions[0] !== 'Todas' ? safeRegions[0] : null,
        intereses: safeCategories,
      },
    });

    await prisma.alerta.create({
      data: {
        usuarioId: user.id,
        frecuencia: frequency,
        criterios: {
          contact: trimmedContact,
          type,
          regions: safeRegions,
          categories: safeCategories,
          consentAt: new Date().toISOString(),
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

    const successMessage = type === 'whatsapp'
      ? `¡Alertas configuradas! Te enviaremos convocatorias a ${trimmedContact} por WhatsApp.`
      : `¡Alertas configuradas! Te enviaremos el boletín a ${trimmedContact}. Puedes cancelar tu suscripción en cualquier momento.`;

    return createSuccessResponse({
      message: successMessage,
      unsubscribeInfo: 'Para cancelar, responde BAJA al mensaje o contacta a contacto@iica.cl conforme a Ley 21.719.',
    });
  } catch (err) {
    logger.error('Error processing subscription API', err as Error);
    return createErrorResponse('Error interno al registrar la suscripción. Intenta nuevamente.', 500);
  }
}
