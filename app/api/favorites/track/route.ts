import { NextRequest } from 'next/server';
import { getLogger } from '@/lib/utils/logger';
import prisma from '@/lib/prisma';

const logger = getLogger('FavoritesTrackingAPI');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, action, deviceId } = body;

    logger.info('POST request received', { projectId, action, deviceId });

    if (!projectId || !action) {
      return new Response(JSON.stringify({ error: 'Missing parameters', code: 'VALIDATION_FAILED' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log the event to Analytics table for tracking popularity
    await prisma.analytics.create({
      data: {
        event: action === 'add' ? 'favorite_added' : 'favorite_removed',
        properties: { projectId, deviceId },
        userAgent: request.headers.get('user-agent') || 'Unknown',
        ipHash: 'anonymized', // we shouldn't store raw IPs ideally
      }
    });

    // Save/Remove in Favorito table if numeric projectId and valid user/device reference exist
    const numProjectId = typeof projectId === 'number' ? projectId : Number.parseInt(String(projectId), 10);
    const numUserId = typeof body.userId === 'number' ? body.userId : Number.parseInt(String(body.userId), 10);

    if (Number.isFinite(numProjectId)) {
      try {
        const targetUserId = Number.isFinite(numUserId) ? numUserId : 1; // default anonymous system user
        if (action === 'add') {
          await prisma.favorito.upsert({
            where: {
              usuarioId_proyectoId: {
                usuarioId: targetUserId,
                proyectoId: numProjectId,
              },
            },
            create: {
              usuarioId: targetUserId,
              proyectoId: numProjectId,
            },
            update: {},
          });
        } else if (action === 'remove') {
          await prisma.favorito.deleteMany({
            where: {
              usuarioId: targetUserId,
              proyectoId: numProjectId,
            },
          });
        }
      } catch (favErr) {
        // Non-blocking fallback if FK or DB is temporarily unavailable
        logger.warn('Non-blocking favorite DB update warning', { error: String(favErr) });
      }
    }

    logger.info('Favorite action tracked successfully', { projectId, action });
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
