import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { scrapeUrlWithAI } from '@/lib/ingestion/universal-ai-scraper';
import { normalizeUrl } from '@/lib/ingestion/utils';
import { getLogger } from '@/lib/utils/logger';
import { checkDistributedRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';
import { isAllowedPublicHttpUrl, verifyHostnameResolvesToPublicIps } from '@/lib/utils/network-security';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';

const logger = getLogger('ProjectSubmitAPI');

const SubmitSchema = z.object({
  url: z.string().url('URL no válida').max(2000, 'URL demasiado larga'),
});

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 8_000) {
      return createErrorResponse('Solicitud demasiado grande', 413);
    }

    const clientId = getRateLimitIdentifier(request, 'project-submit');
    const rateLimit = await checkDistributedRateLimit(clientId, 5, 60_000);
    if (!rateLimit.success) {
      return createErrorResponse('Demasiadas solicitudes; reintenta más tarde', 429);
    }

    let jsonBody: unknown;
    try {
      jsonBody = await request.json();
    } catch {
      return createErrorResponse('Cuerpo JSON inválido', 400);
    }

    const parsed = SubmitSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return createErrorResponse(parsed.error.issues?.[0]?.message || 'URL inválida', 400);
    }

    const rawUrl = parsed.data.url;
    const canonicalUrl = normalizeUrl(rawUrl);
    if (!canonicalUrl) {
      return createErrorResponse('URL inválida o no normalizable', 400);
    }

    // SSRF prevention: verify protocol, block private IPs and non-public hostnames
    if (!isAllowedPublicHttpUrl(canonicalUrl)) {
      logger.warn('SSRF blocked in project submit', { url: canonicalUrl });
      return createErrorResponse('Solo se permiten URLs públicas accesibles (HTTP/HTTPS)', 400);
    }

    try {
      const parsedUrl = new URL(canonicalUrl);
      const resolvesToPublic = await verifyHostnameResolvesToPublicIps(parsedUrl.hostname);
      if (!resolvesToPublic) {
        logger.warn('SSRF private IP resolution blocked', { hostname: parsedUrl.hostname });
        return createErrorResponse('La URL apunta a una dirección IP interna o no autorizada', 400);
      }
    } catch {
      return createErrorResponse('No se pudo verificar el host de la URL', 400);
    }

    // Check if it already exists
    const existing = await prisma.project.findUnique({
      where: { canonicalUrl },
    });

    if (existing) {
      return createErrorResponse('Esta oportunidad ya existe en la plataforma', 409);
    }

    // Extract info via LLM
    const extractedProject = await scrapeUrlWithAI(canonicalUrl);

    if (!extractedProject) {
      return createErrorResponse('No se pudo extraer información estructurada de este enlace', 422);
    }

    // Save as needsReview
    const dbProject = await prisma.project.create({
      data: {
        canonicalUrl,
        url_bases: extractedProject.url || canonicalUrl,
        nombre: extractedProject.title,
        institucion: extractedProject.institution || 'Sugerencia de usuario',
        objetivo: extractedProject.description || '',
        monto: 0,
        estado: 'Abierto',
        categoria: extractedProject.opportunityType || 'Convocatoria',
        fecha_cierre: extractedProject.deadline || new Date('2099-12-31'),
        ambito: extractedProject.ambito || 'Nacional',
        region: extractedProject.region || 'Nacional',
        discoveredBy: 'community',
        needsReview: true,
        publishable: false,
        estadoPostulacion: 'Abierta',
      },
    });

    logger.info('Project submitted by community successfully', { projectId: dbProject.id, url: canonicalUrl });

    return createSuccessResponse(
      { id: dbProject.id, status: 'needs_review', message: 'Sugerencia recibida exitosamente para revisión técnica' },
      201
    );
  } catch (error) {
    logger.error('Error submitting project', error as Error);
    return createErrorResponse('Error interno procesando la sugerencia', 500);
  }
}
