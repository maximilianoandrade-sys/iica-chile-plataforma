import { NextRequest, NextResponse } from 'next/server';
import { processSubscription, SubscriptionPreference } from '@/lib/services/notifications';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('SubscriptionAPI');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, type, regions, categories, frequency } = body;

    if (!contact || typeof contact !== 'string' || !contact.trim()) {
      return NextResponse.json({ error: 'Debes proporcionar un correo o número de WhatsApp válido' }, { status: 400 });
    }

    if (type === 'whatsapp' && !/^\+?[0-9\s-]{8,15}$/.test(contact.trim())) {
      return NextResponse.json({ error: 'Formato de número de WhatsApp inválido (ej: +56 9 1234 5678)' }, { status: 400 });
    }

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())) {
      return NextResponse.json({ error: 'Formato de correo electrónico inválido' }, { status: 400 });
    }

    const sub: SubscriptionPreference = {
      contact: contact.trim(),
      type: type === 'whatsapp' ? 'whatsapp' : 'email',
      regions: Array.isArray(regions) ? regions : ['Todas'],
      categories: Array.isArray(categories) ? categories : ['Todas'],
      frequency: frequency === 'instant_urgent' ? 'instant_urgent' : 'weekly',
      createdAt: new Date().toISOString()
    };

    const result = await processSubscription(sub);

    return NextResponse.json(result);
  } catch (err) {
    logger.error('Error processing subscription API', err as Error);
    return NextResponse.json({ error: 'Error al procesar la suscripción' }, { status: 500 });
  }
}
