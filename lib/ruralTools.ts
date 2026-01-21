/**
 * HERRAMIENTAS RURALES
 * Utilidades para WhatsApp y Calendario (.ics)
 */

import { Project } from './data';

// ============================================================================
// WHATSAPP
// ============================================================================

/**
 * Genera enlace de WhatsApp con mensaje pre-llenado
 */
export function generateWhatsAppLink(project: Project): string {
    const message = `
🌾 *${project.nombre}*

📋 Institución: ${project.institucion}
📅 Cierre: ${new Date(project.fecha_cierre).toLocaleDateString('es-CL')}
🔗 Más info: ${project.url_bases || 'No disponible'}

_Compartido desde IICA Chile - Plataforma de Financiamiento Agrícola_
    `.trim();

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// ============================================================================
// CALENDARIO (.ics)
// ============================================================================

/**
 * Genera archivo .ics para agregar al calendario
 */
export function generateICSFile(project: Project): string {
    const startDate = new Date(project.fecha_cierre);
    // Recordatorio 7 días antes
    const reminderDate = new Date(startDate);
    reminderDate.setDate(reminderDate.getDate() - 7);

    const formatDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IICA Chile//Plataforma Financiamiento//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${project.id}@iica-chile.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(startDate)}
SUMMARY:Cierre: ${project.nombre}
DESCRIPTION:Convocatoria de ${project.institucion}\\n\\nCategoría: ${project.categoria}\\n\\nMás información: ${project.url_bases || 'No disponible'}
LOCATION:${project.institucion}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P7D
DESCRIPTION:Recordatorio: Cierre en 7 días
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
}

/**
 * Descarga archivo .ics
 */
export function downloadICSFile(project: Project): void {
    const icsContent = generateICSFile(project);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.nombre.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Genera enlace de Google Calendar
 */
export function generateGoogleCalendarLink(project: Project): string {
    const startDate = new Date(project.fecha_cierre);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const formatGoogleDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Cierre: ${project.nombre}`,
        dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
        details: `Convocatoria de ${project.institucion}\n\nCategoría: ${project.categoria}\n\nMás información: ${project.url_bases || 'No disponible'}`,
        location: project.institucion,
        trp: 'false'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ============================================================================
// EMAIL
// ============================================================================

/**
 * Genera enlace mailto para compartir por email
 */
export function generateEmailLink(project: Project): string {
    const subject = `Convocatoria: ${project.nombre}`;
    const body = `
Hola,

Te comparto esta convocatoria que puede interesarte:

📋 ${project.nombre}
🏛️ Institución: ${project.institucion}
📂 Categoría: ${project.categoria}
📅 Fecha de cierre: ${new Date(project.fecha_cierre).toLocaleDateString('es-CL')}
🔗 Más información: ${project.url_bases || 'No disponible'}

Saludos,

---
Compartido desde IICA Chile - Plataforma de Financiamiento Agrícola
https://iica-chile-plataforma.vercel.app
    `.trim();

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ============================================================================
// COPIAR AL PORTAPAPELES
// ============================================================================

/**
 * Copia información del proyecto al portapapeles
 */
export async function copyToClipboard(project: Project): Promise<boolean> {
    const text = `
📋 ${project.nombre}
🏛️ ${project.institucion}
📂 ${project.categoria}
📅 Cierre: ${new Date(project.fecha_cierre).toLocaleDateString('es-CL')}
🔗 ${project.url_bases || 'No disponible'}
    `.trim();

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        return false;
    }
}

// ============================================================================
// COMPARTIR NATIVO (Web Share API)
// ============================================================================

/**
 * Comparte usando Web Share API nativa
 */
export async function shareNative(project: Project): Promise<boolean> {
    if (!navigator.share) {
        return false;
    }

    try {
        await navigator.share({
            title: project.nombre,
            text: `Convocatoria de ${project.institucion} - Cierre: ${new Date(project.fecha_cierre).toLocaleDateString('es-CL')}`,
            url: project.url_bases || window.location.href
        });
        return true;
    } catch (error) {
        // Usuario canceló o error
        return false;
    }
}
