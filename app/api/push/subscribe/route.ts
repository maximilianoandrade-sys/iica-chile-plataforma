import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-response';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('PushSubscribeAPI');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, expirationTime, keys, deviceId } = body;
    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || endpoint.length > 2048) {
      return createErrorResponse('Suscripción push inválida', 400);
    }
    if (!keys || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string') {
      return createErrorResponse('Claves push inválidas', 400);
    }
    if (typeof deviceId !== 'string' || deviceId.length < 8 || deviceId.length > 200) {
      return createErrorResponse('Identificador de dispositivo inválido', 400);
    }

    const ownerHash = createHash('sha256').update(deviceId).digest('hex');
    const parsedExpiration = typeof expirationTime === 'number' && expirationTime > 0
      ? new Date(expirationTime)
      : null;
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { ownerHash, p256dh: keys.p256dh, auth: keys.auth, expirationTime: parsedExpiration, userAgent: request.headers.get('user-agent'), active: true },
      create: { endpoint, ownerHash, p256dh: keys.p256dh, auth: keys.auth, expirationTime: parsedExpiration, userAgent: request.headers.get('user-agent') },
      select: { id: true },
    });

    logger.info('Push subscription stored', { subscriptionId: subscription.id });
    return createSuccessResponse({ subscribed: true });
  } catch (error) {
    logger.error('Failed to store push subscription', error as Error);
    return createErrorResponse('No se pudo guardar la suscripción push', 500);
  }
}