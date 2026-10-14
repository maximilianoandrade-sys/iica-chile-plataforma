import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-response';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('PushUnsubscribeAPI');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, deviceId } = body;
    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || typeof deviceId !== 'string' || deviceId.length < 8 || deviceId.length > 200) {
      return createErrorResponse('Solicitud de desuscripción inválida', 400);
    }

    const ownerHash = createHash('sha256').update(deviceId).digest('hex');
    const result = await prisma.pushSubscription.updateMany({
      where: { endpoint, ownerHash },
      data: { active: false },
    });

    logger.info('Push subscription disabled', { count: result.count });
    return createSuccessResponse({ unsubscribed: true });
  } catch (error) {
    logger.error('Failed to disable push subscription', error as Error);
    return createErrorResponse('No se pudo desactivar la suscripción push', 500);
  }
}