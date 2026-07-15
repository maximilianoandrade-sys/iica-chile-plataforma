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
