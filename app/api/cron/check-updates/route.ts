/**
 * MONITOR DE ACTUALIZACIONES
 * Vercel Cron Job que verifica cambios en convocatorias cada 24 horas
 * Detecta cambios usando headers Last-Modified
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/data';
import prisma from '@/lib/prisma';
import { embedText, projectToEmbeddingText, toPgVector } from '@/lib/ingestion/embeddings';
import { sendEmail } from '@/lib/email';
import { getLogger } from '@/lib/utils/logger';
import { sendAlert } from '@/lib/utils/alerts';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
import { isAllowedPublicHttpUrl, verifyHostnameResolvesToPublicIps } from '@/lib/utils/network-security';
import { getEnv } from '@/lib/utils/env';

const logger = getLogger('CronCheckUpdates');

export const runtime = 'nodejs';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas

function getRuntimeConfig() {
    const env = getEnv();
    return {
        cronSecret: env.CRON_SECRET,
        adminEmail: env.ADMIN_EMAIL || 'admin@iica.cl',
        notificationWebhook: env.NOTIFICATION_WEBHOOK,
        geminiApiKey: env.GEMINI_API_KEY,
    };
}

// ============================================================================
// VERIFICACIÓN DE AUTORIZACIÓN
// ============================================================================

function isAuthorized(request: NextRequest): boolean {
    const { cronSecret } = getRuntimeConfig();
    if (!cronSecret) {
        logger.error('CRON_SECRET no configurado', new Error('Env faltante'));
        return false;
    }

    // Vercel Cron sets Authorization: Bearer <CRON_SECRET> automatically
    const authHeader = request.headers.get('authorization');
    if (authHeader === `Bearer ${cronSecret}`) {
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
        if (!isAllowedPublicHttpUrl(url)) {
            return {
                url,
                projectName,
                status: 0,
                hasChanged: false,
                error: 'URL not allowed: must be a public HTTP/HTTPS URL',
            };
        }

        const parsed = new URL(url);
        const ipSafe = await verifyHostnameResolvesToPublicIps(parsed.hostname);
        if (!ipSafe) {
            return {
                url,
                projectName,
                status: 0,
                hasChanged: false,
                error: 'URL resolves to a private/internal IP address',
            };
        }

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

        // Persist and detect changes across invocations (serverless has no shared memory).
        let previous: { lastModified: string | null } | null = null;
        try {
            previous = await prisma.linkCheck.findUnique({ where: { url } });
        } catch (e) {
            // ponytail: LinkCheck.last_modified puede faltar si no se aplicó scripts/sql/2026-07-15-linkcheck-lastmodified.sql
            logger.warn('LinkCheck lectura falló (¿esquema desactualizado?)', { url, error: String(e) });
        }
        const hasChanged = Boolean(
            previous?.lastModified && lastModified && previous.lastModified !== lastModified
        );

        const isValid = response.status > 0 && response.status < 400;
        try {
            await prisma.linkCheck.upsert({
                where: { url },
                update: {
                    statusCode: response.status,
                    lastModified: lastModified || null,
                    isValid,
                    lastChecked: new Date(),
                },
                create: {
                    url,
                    status: isValid ? 'ok' : 'broken',
                    statusCode: response.status,
                    lastModified: lastModified || null,
                    isValid,
                },
            });
        } catch (e) {
            // ponytail: no romper el cron completo si falta la columna last_modified en producción
            logger.warn('LinkCheck upsert falló (aplicar scripts/sql/2026-07-15-linkcheck-lastmodified.sql)', {
                url,
                error: String(e),
            });
        }

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
// NOTIFICACIONES
// ============================================================================

interface UpdateNotification {
    changedProjects: LinkCheckResult[];
    brokenLinks: LinkCheckResult[];
    totalChecked: number;
    timestamp: string;
}

async function sendNotification(notification: UpdateNotification): Promise<void> {
    const { notificationWebhook, adminEmail } = getRuntimeConfig();
    const message = formatNotificationMessage(notification);

    // Enviar por webhook si está configurado
    if (notificationWebhook) {
        try {
            await fetch(notificationWebhook, {
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
        to: adminEmail,
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
            return createErrorResponse('Unauthorized', 401);
        }

        logger.info('Starting update check...');

        const results: LinkCheckResult[] = [];
        const changedProjects: LinkCheckResult[] = [];
        const brokenLinks: LinkCheckResult[] = [];

        // Obtener proyectos
        const result = await getProjects();
        const projects = result.ok ? result.projects : [];

        // Verificar proyectos en lotes paralelos de 10
        const BATCH_SIZE = 10;
        const projectsWithUrls = projects.filter(p => p.url_bases && p.url_bases.trim() !== '');

        for (let i = 0; i < projectsWithUrls.length; i += BATCH_SIZE) {
            const batch = projectsWithUrls.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.allSettled(
                batch.map(project => checkLinkForUpdates(project.url_bases, project.nombre))
            );

            for (const settled of batchResults) {
                if (settled.status === 'fulfilled') {
                    const result = settled.value;
                    results.push(result);
                    if (result.hasChanged) changedProjects.push(result);
                    if (result.status === 0 || result.status >= 400) brokenLinks.push(result);
                }
            }
        }

        // ==================================================================
        // EMBEDDING BACKFILL — fill up to 20 projects missing embeddings
        // ==================================================================
        let embeddingsBackfilled = 0;
        const { geminiApiKey } = getRuntimeConfig();
        if (geminiApiKey) {
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

        // Enviar alerta webhook si hay enlaces caídos
        const failedChecks = results.filter((r: LinkCheckResult) => r.error || r.status >= 400);
        if (failedChecks.length > 0) {
            await sendAlert({
                title: 'Scraper: enlaces caídos detectados',
                message: `${failedChecks.length} enlace(s) fallaron en la verificación diaria.`,
                severity: failedChecks.length > 5 ? 'error' : 'warning',
                context: {
                    total: String(results.length),
                    failed: String(failedChecks.length),
                    urls: failedChecks.slice(0, 3).map((r: LinkCheckResult) => r.url).join(', '),
                },
            });
        }

        // Enviar notificación si hay cambios o problemas
        if (changedProjects.length > 0 || brokenLinks.length > 0) {
            await sendNotification(notification);
        }

        logger.info('Update check completed', { totalChecked: results.length, embeddingsBackfilled });

        return createSuccessResponse({
            ...notification,
            embeddingsBackfilled,
            message: 'Verificación completada exitosamente'
        });

    } catch (error: unknown) {
        logger.error('Update check failed', error as Error);
        return createErrorResponse('Error interno del servidor', 500);
    }
}

// ============================================================================
// ENDPOINT MANUAL (para testing)
// ============================================================================

export async function POST(request: NextRequest) {
    // Permitir ejecución manual con autenticación
    return GET(request);
}
