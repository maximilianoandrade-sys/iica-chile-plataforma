import { getLogger } from './logger';

const logger = getLogger('Alerts');

interface AlertPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  context?: Record<string, unknown>;
}

/**
 * Enviar alerta al webhook configurado (Slack, Discord, o personalizado).
 * Hace fallback al logger si no hay webhook configurado.
 */
export async function sendAlert(payload: AlertPayload): Promise<void> {
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK;

  if (!webhookUrl) {
    logger.warn('NOTIFICATION_WEBHOOK no configurado, logueando alerta', {
      title: payload.title,
      severity: payload.severity,
    });
    return;
  }

  try {
    const slackPayload = {
      text: `[${payload.severity.toUpperCase()}] ${payload.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${payload.title}*\n${payload.message}`,
          },
        },
        ...(payload.context
          ? [{
              type: 'context',
              elements: [{
                type: 'mrkdwn',
                text: Object.entries(payload.context)
                  .map(([k, v]) => `*${k}:* ${v}`)
                  .join(' | '),
              }],
            }]
          : []),
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      logger.error('Webhook de alerta falló', new Error(`HTTP ${response.status}`));
    }
  } catch (error) {
    logger.error('Error en webhook de alerta', error as Error);
  }
}
