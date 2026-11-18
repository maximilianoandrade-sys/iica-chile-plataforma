import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
import { verifyAdminToken } from '@/lib/utils/admin-auth';

const logger = getLogger('AdminDiscoveriesBulkAction');

function normalizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin-token')?.value;
  if (!verifyAdminToken(token)) {
    return createErrorResponse('no autorizado', 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse('JSON body inválido', 400);
  }

  const action = body.action as string;
  if (!action || !['approve', 'discard'].includes(action)) {
    return createErrorResponse('action inválida', 400);
  }

  const ids = normalizeIds(body.ids);
  if (ids.length === 0) {
    return createErrorResponse('ids inválidos o vacío', 400);
  }

  logger.info('Processing bulk discovery action', { action, count: ids.length });

  try {
    if (action === 'approve') {
      const result = await prisma.project.updateMany({
        where: { id: { in: ids } },
        data: {
          needsReview: false,
          bases_estado: 'published',
        },
      });

      revalidatePath('/admin/discoveries');
      revalidatePath('/admin/projects/needsReview');
      revalidatePath('/');

      return createSuccessResponse({
        action,
        count: result.count,
        updated: result.count,
        updatedIds: ids,
      });
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

    return createSuccessResponse({
      action,
      count: result.count,
      updated: result.count,
      updatedIds: ids,
    });
  } catch (error) {
    logger.error('Bulk discovery action error', error as Error, { action, idsCount: ids.length });
    return createErrorResponse('Error interno al ejecutar la acción', 500);
  }
}
