import { NextRequest } from 'next/server';
import { getLogger } from '@/lib/utils/logger';
import prisma from '@/lib/prisma';
import { createHash } from 'crypto';
import { checkDistributedRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

const logger = getLogger('FavoritesTrackingAPI');

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2_000) return new Response(JSON.stringify({ error: 'Solicitud demasiado grande' }), { status: 413 });
    const clientId = getRateLimitIdentifier(request, 'favorites');
    const rateLimit = await checkDistributedRateLimit(clientId, 60, 60_000);
    if (!rateLimit.success) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429 });
    const body = await request.json();
    const { projectId, action, deviceId } = body;

    logger.info('POST request received', { projectId, action });

    if (!projectId || !['add', 'remove'].includes(action) || typeof deviceId !== 'string' || deviceId.length < 8 || deviceId.length > 200) {
      return new Response(JSON.stringify({ error: 'Missing parameters', code: 'VALIDATION_FAILED' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const numProjectId = typeof projectId === 'number' ? projectId : Number.parseInt(String(projectId), 10);
    if (!Number.isInteger(numProjectId) || numProjectId <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid projectId', code: 'VALIDATION_FAILED' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const deviceHash = createHash('sha256').update(deviceId).digest('hex');
    const anonymousEmail = `anonymous+${deviceHash}@local.invalid`;

    const project = await prisma.project.findUnique({ where: { id: numProjectId }, select: { id: true } });
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found', code: 'NOT_FOUND' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const user = await prisma.usuario.upsert({
      where: { email: anonymousEmail },
      update: {},
      create: { email: anonymousEmail, intereses: [] },
    });

    if (action === 'add') {
      await prisma.favorito.upsert({
        where: { usuarioId_proyectoId: { usuarioId: user.id, proyectoId: numProjectId } },
        create: { usuarioId: user.id, proyectoId: numProjectId },
        update: {},
      });
    } else {
      await prisma.favorito.deleteMany({ where: { usuarioId: user.id, proyectoId: numProjectId } });
    }

    await prisma.analytics.create({
      data: {
        event: action === 'add' ? 'favorite_added' : 'favorite_removed',
        properties: { projectId: numProjectId, deviceHash },
        userAgent: request.headers.get('user-agent') || 'Unknown',
        ipHash: deviceHash,
      },
    });

    logger.info('Favorite action tracked successfully', { projectId: numProjectId, action });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Failed to track favorite', error as Error);
    return new Response(JSON.stringify({ error: 'Failed to track favorite', code: 'SERVER_ERROR' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
