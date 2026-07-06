import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
import { getEnv } from '@/lib/utils/env';

const logger = getLogger('AdminDiscoveriesBulkAction');

const MAX_AGE_MS = 8 * 60 * 60 * 1000;

function isAuthenticated(req: NextRequest): boolean {
  const secret = getEnv().ADMIN_SESSION_SECRET;
  const cookie = req.cookies.get('admin-token')?.value;
  if (!cookie) return false;

  try {
    const dotIndex = cookie.lastIndexOf('.');
    if (dotIndex === -1) return false;

    const sig = cookie.substring(0, dotIndex);
    const timestamp = cookie.substring(dotIndex + 1);
    const ts = Number(timestamp);
    if (Number.isNaN(ts)) return false;

    if (Date.now() - ts > MAX_AGE_MS) {
      logger.warn('Admin token expired');
      return false;
    }

    const expected = createHmac('sha256', secret)
      .update(`admin-session:${timestamp}`)
      .digest('hex');

    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch (error) {
    logger.error('Bulk auth verification failed', error as Error);
    return false;
  }
}

function normalizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return createErrorResponse('no autorizado', 401);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('JSON body inválido', 400);
    }

    const ids = normalizeIds(body.ids);
    const action = typeof body.action === 'string' ? body.action : '';

    if (ids.length === 0) {
      return createErrorResponse('ids inválidos', 400);
    }

    if (action !== 'approve' && action !== 'discard') {
      return createErrorResponse('action inválida', 400);
    }

    if (action === 'approve') {
      const result = await prisma.project.updateMany({
        where: { id: { in: ids } },
        data: { needsReview: false, bases_estado: 'published' },
      });

      revalidatePath('/admin/discoveries');
      revalidatePath('/admin/projects/needsReview');
      revalidatePath('/');
      return createSuccessResponse({ updated: result.count });
    }

    const today = new Date().toISOString().slice(0, 10);
    const result = await prisma.project.updateMany({
      where: { id: { in: ids } },
      data: {
        needsReview: false,
        bases_estado: 'rejected',
        estadoPostulacion: 'Cerrada',
        notasInternas: `descartado por revisión IA ${today}`,
      },
    });

    revalidatePath('/admin/discoveries');
    revalidatePath('/admin/projects/needsReview');
    revalidatePath('/');
    return createSuccessResponse({ updated: result.count });
  } catch (error) {
    logger.error('Bulk action failed', error as Error);
    return createErrorResponse('error interno del servidor', 500);
  }
}
