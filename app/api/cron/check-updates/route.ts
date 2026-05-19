/**
 * MONITOR DE ACTUALIZACIONES
 * Vercel Cron Job que verifica cambios en convocatorias cada 24 horas
 * Detecta cambios usando headers Last-Modified
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/data';
import prisma from '@/lib/prisma';
import { embedText, projectToEmbeddingText, toPgVector } from '@/lib/ingestion/embeddings';
import { getKVStore } from '@/lib/kvStore';
import { sendEmail } from '@/lib/email';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('CronCheckUpdates');

export const runtime = 'nodejs';

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

    } catch (error: unknown) {
        return {
            url,
            projectName,
            status: 0,
            hasChanged: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// ============================================================================
// CACHE CON KV STORE
// ============================================================================

async function getFromCache(key: string): Promise<Record<string, string> | null> {
    const kv = getKVStore();
    return kv.get<Record<string, string>>(key);
}

async function saveToCache(key: string, value: Record<string, string | null>): Promise<void> {
    const kv = getKVStore();
    // TTL 7 days - entries older than that are stale anyway
    await kv.set(key, value, { ttlSeconds: 7 * 24 * 60 * 60 });
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
            logger.error('Webhook notification failed', error as Error);
        }
    }

    // Enviar email de notificación
    await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[IICA] Actualización de Convocatorias - ${notification.changedProjects.length} cambios, ${notification.brokenLinks.length} enlaces rotos`,
        text: message,
        html: `<pre style="font-family: monospace; white-space: pre-wrap;">${message}</pre>`,
    });

    logger.info('Update notification sent', {
        changedCount: notification.changedProjects.length,
        brokenCount: notification.brokenLinks.length,
    });
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

        logger.info('Starting update check...');

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

        // ==================================================================
        // EMBEDDING BACKFILL — fill up to 20 projects missing embeddings
        // ==================================================================
        let embeddingsBackfilled = 0;
        if (process.env.GEMINI_API_KEY) {
            try {
                const missing = await prisma.$queryRawUnsafe<
                    Array<{ id: number; nombre: string; institucion: string | null; objetivo: string | null; categoria: string | null }>
                >(
                    `SELECT id, nombre, institucion, objetivo, categoria FROM "Project" WHERE embedding IS NULL LIMIT 20`
                );
                for (const p of missing) {
                    try {
                        const text = projectToEmbeddingText({
                            nombre: p.nombre,
                            institucion: p.institucion || "",
                            objetivo: p.objetivo,
                            categoria: p.categoria,
                        });
                        const embedding = await embedText(text);
                        if (embedding) {
                            await prisma.$executeRawUnsafe(
                                `UPDATE "Project" SET embedding = $1::vector WHERE id = $2`,
                                toPgVector(embedding),
                                p.id
                            );
                            embeddingsBackfilled++;
                        }
                    } catch (err) {
                        logger.warn('Embedding backfill failed for project', { projectId: p.id, error: (err as Error).message });
                    }
                }
            } catch (err) {
                logger.error('Embedding backfill query failed', err as Error);
            }
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

        logger.info('Update check completed', { totalChecked: results.length, embeddingsBackfilled });

        return NextResponse.json({
            success: true,
            ...notification,
            embeddingsBackfilled,
            message: 'Verificación completada exitosamente'
        });

    } catch (error: unknown) {
        logger.error('Update check failed', error as Error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
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
