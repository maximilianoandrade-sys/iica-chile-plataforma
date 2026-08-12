import { type Project } from '@/lib/data';
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

export function formatWhatsAppMessage(project: Project): string {
  const amountStr = project.montoTexto || (project.monto ? `$${project.monto.toLocaleString('es-CL')} CLP` : 'Ver bases');
  const regionStr = project.regiones?.join(', ') || project.region || 'Nacional';

  return `🌾 *Radar IICA Chile — Alerta de Convocatoria*

📢 *${project.nombre}*
🏛️ *Fuente*: ${project.institucion}
💰 *Monto*: ${amountStr}
🗺️ *Región*: ${regionStr}
⏳ *Cierra*: ${project.fecha_cierre}

📄 *Ver bases y requisitos*:
${project.url_bases || `https://iica-chile.vercel.app/proyecto/${project.id}`}`;
}

export function formatEmailHtml(project: Project): string {
  const amountStr = project.montoTexto || (project.monto ? `$${project.monto.toLocaleString('es-CL')} CLP` : 'Ver bases');
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-lg: 8px; overflow: hidden;">
      <div style="background-color: #002060; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">INSTITUTO INTERAMERICANO DE COOPERACIÓN PARA LA AGRICULTURA</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #fbbf24;">Radar de Oportunidades IICA Chile</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <h3 style="color: #002060; margin-top: 0;">${project.nombre}</h3>
        <p style="color: #4a5568; font-size: 14px;"><strong>Institución:</strong> ${project.institucion}</p>
        <p style="color: #4a5568; font-size: 14px;"><strong>Monto:</strong> ${amountStr}</p>
        <p style="color: #4a5568; font-size: 14px;"><strong>Fecha de Cierre:</strong> ${project.fecha_cierre}</p>
        <p style="color: #4a5568; font-size: 14px;"><strong>Objetivo:</strong> ${project.objetivo || 'Sin descripción'}</p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${project.url_bases || '#'}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; display: inline-block;">Ver Bases Oficiales</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #718096;">
        Oficina IICA Chile · Notificación automática del Radar de Financiamiento Silvoagropecuario
      </div>
    </div>
  `;
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
