/**
 * MONITOR DE ACTUALIZACIONES
 * Vercel Cron Job que verifica cambios en convocatorias cada 24 horas
 * Detecta cambios usando headers Last-Modified
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/data';

export const runtime = 'edge';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@iica.cl';
const NOTIFICATION_WEBHOOK = process.env.NOTIFICATION_WEBHOOK;

// ============================================================================
// VERIFICACIÓN DE AUTORIZACIÓN
// ============================================================================

function isAuthorized(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verificar si viene de Vercel Cron
    if (authHeader === `Bearer ${cronSecret}`) {
        return true;
    }

    // Verificar si es una request de Vercel Cron
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    if (vercelCronHeader) {
        return true;
    }

    return false;
}

// ============================================================================
// VERIFICACIÓN DE ENLACES
// ============================================================================

interface LinkCheckResult {
    url: string;
    projectName: string;
    status: number;
    lastModified?: string;
    hasChanged: boolean;
    error?: string;
}

async function checkLinkForUpdates(url: string, projectName: string): Promise<LinkCheckResult> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'IICA-Chile-Platform/2.0 (Update Monitor)'
            }
        });

        clearTimeout(timeoutId);

        const lastModified = response.headers.get('last-modified');
        const etag = response.headers.get('etag');

        // Obtener última verificación desde caché
        const cacheKey = `last_check_${url}`;
        const lastCheck = await getFromCache(cacheKey);

        let hasChanged = false;

        if (lastCheck) {
            // Comparar Last-Modified o ETag
            if (lastModified && lastCheck.lastModified !== lastModified) {
                hasChanged = true;
            } else if (etag && lastCheck.etag !== etag) {
                hasChanged = true;
            }
        }

        // Guardar en caché
        await saveToCache(cacheKey, {
            lastModified,
            etag,
            checkedAt: new Date().toISOString()
        });

        return {
            url,
            projectName,
            status: response.status,
            lastModified: lastModified || undefined,
            hasChanged
        };

    } catch (error: any) {
        return {
            url,
            projectName,
            status: 0,
            hasChanged: false,
            error: error.message || 'Network error'
        };
    }
}

// ============================================================================
// CACHE SIMPLE (KV Store o similar)
// ============================================================================

// En producción, usar Vercel KV, Redis, o similar
// Por ahora, simulamos con un Map en memoria
const memoryCache = new Map<string, any>();

async function getFromCache(key: string): Promise<any> {
    // TODO: Implementar con Vercel KV en producción
    return memoryCache.get(key);
}

async function saveToCache(key: string, value: any): Promise<void> {
    // TODO: Implementar con Vercel KV en producción
    memoryCache.set(key, value);
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

interface UpdateNotification {
    changedProjects: LinkCheckResult[];
    brokenLinks: LinkCheckResult[];
    totalChecked: number;
    timestamp: string;
}

async function sendNotification(notification: UpdateNotification): Promise<void> {
    const message = formatNotificationMessage(notification);

    // Enviar por webhook si está configurado
    if (NOTIFICATION_WEBHOOK) {
        try {
            await fetch(NOTIFICATION_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: message,
                    notification
                })
            });
        } catch (error) {
            console.error('Error enviando webhook:', error);
        }
    }

    // Log para Vercel
    console.log('📧 NOTIFICACIÓN DE ACTUALIZACIÓN:');
    console.log(message);

    // TODO: Implementar envío de email en producción
    // await sendEmail(ADMIN_EMAIL, 'Actualización de Convocatorias', message);
}

function formatNotificationMessage(notification: UpdateNotification): string {
    const { changedProjects, brokenLinks, totalChecked, timestamp } = notification;

    let message = `🔔 MONITOR DE ACTUALIZACIONES - ${timestamp}\n\n`;
    message += `Total de convocatorias verificadas: ${totalChecked}\n\n`;

    if (changedProjects.length > 0) {
        message += `📝 CONVOCATORIAS ACTUALIZADAS (${changedProjects.length}):\n`;
        changedProjects.forEach(project => {
            message += `  • ${project.projectName}\n`;
            message += `    URL: ${project.url}\n`;
            message += `    Última modificación: ${project.lastModified || 'N/A'}\n\n`;
        });
    }

    if (brokenLinks.length > 0) {
        message += `⚠️ ENLACES ROTOS (${brokenLinks.length}):\n`;
        brokenLinks.forEach(project => {
            message += `  • ${project.projectName}\n`;
            message += `    URL: ${project.url}\n`;
            message += `    Error: ${project.error || `Status ${project.status}`}\n\n`;
        });
    }

    if (changedProjects.length === 0 && brokenLinks.length === 0) {
        message += `✅ No se detectaron cambios ni problemas.\n`;
    }

    return message;
}

// ============================================================================
// ENDPOINT PRINCIPAL
// ============================================================================

export async function GET(request: NextRequest) {
    try {
        // Verificar autorización
        if (!isAuthorized(request)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('🔍 Iniciando verificación de actualizaciones...');

        const results: LinkCheckResult[] = [];
        const changedProjects: LinkCheckResult[] = [];
        const brokenLinks: LinkCheckResult[] = [];

        // Obtener proyectos
        const projects = await getProjects();

        // Verificar cada proyecto
        for (const project of projects) {
            if (project.url_bases && project.url_bases.trim() !== '') {
                const result = await checkLinkForUpdates(project.url_bases, project.nombre);
                results.push(result);

                if (result.hasChanged) {
                    changedProjects.push(result);
                }

                if (result.status === 0 || result.status >= 400) {
                    brokenLinks.push(result);
                }
            }

            // Pequeña pausa para no sobrecargar
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Crear notificación
        const notification: UpdateNotification = {
            changedProjects,
            brokenLinks,
            totalChecked: results.length,
            timestamp: new Date().toISOString()
        };

        // Enviar notificación si hay cambios o problemas
        if (changedProjects.length > 0 || brokenLinks.length > 0) {
            await sendNotification(notification);
        }

        console.log('✅ Verificación completada');

        return NextResponse.json({
            success: true,
            ...notification,
            message: 'Verificación completada exitosamente'
        });

    } catch (error: any) {
        console.error('❌ Error en verificación:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        );
    }
}

// ============================================================================
// ENDPOINT MANUAL (para testing)
// ============================================================================

export async function POST(request: NextRequest) {
    // Permitir ejecución manual con autenticación
    return GET(request);
}
