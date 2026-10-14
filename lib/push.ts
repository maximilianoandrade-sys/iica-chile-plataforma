import webpush from 'web-push';
import prisma from '@/lib/prisma';
import { getEnv } from '@/lib/utils/env';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('PushDelivery');

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(payload: PushPayload): Promise<void> {
  const env = getEnv();
  if (!env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT || !env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    logger.warn('VAPID no configurado; entrega push omitida');
    return;
  }

  webpush.setVapidDetails(env.VAPID_SUBJECT, env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const subscriptions = await prisma.pushSubscription.findMany({ where: { active: true } });

  await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime?.getTime() ?? null,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }, JSON.stringify(payload));
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.update({ where: { id: subscription.id }, data: { active: false } });
        return;
      }
      logger.warn('Push delivery failed', { subscriptionId: subscription.id, statusCode });
    }
  }));
}