import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('notifications');

export interface SubscriptionPreference {
  contact: string; // Email or WhatsApp number
  type: 'email' | 'whatsapp';
  regions: string[];
  categories: string[];
  frequency: 'instant_urgent' | 'weekly';
  createdAt: string;
}

export async function processSubscription(sub: SubscriptionPreference): Promise<{ success: boolean; message: string }> {
  logger.info('New subscription received', { type: sub.type, contact: sub.contact });
  return {
    success: true,
    message: sub.type === 'whatsapp' 
      ? `¡Suscripción confirmada! Te enviaremos las convocatorias urgentes a ${sub.contact} por WhatsApp.` 
      : `¡Suscripción confirmada! Te enviaremos el boletín IICA a ${sub.contact}.`
  };
}
