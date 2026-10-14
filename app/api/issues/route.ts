import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';
import { checkDistributedRateLimit } from '@/lib/utils/rateLimit';

const logger = getLogger('IssueReportAPI');

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 12_000) return NextResponse.json({ error: 'El reporte excede el tamaño permitido' }, { status: 413 });
    const clientIp = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimit = await checkDistributedRateLimit(`issues:${clientIp}`, 10, 60_000);
    if (!rateLimit.success) return NextResponse.json({ error: 'Demasiados reportes; reintenta más tarde' }, { status: 429 });
    const body = await request.json();
    const { title, description, projectId, projectUrl, reporterEmail } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'El título del reporte es obligatorio' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'La descripción del reporte es obligatoria' }, { status: 400 });
    }

    logger.info('Nuevo reporte de issue recibido', { title, projectId, reporterEmail });

    if (title.length > 200 || description.length > 10000) {
      return NextResponse.json({ error: 'El reporte excede el tamaño permitido' }, { status: 400 });
    }

    const report = await prisma.userIssueReport.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        projectId: typeof projectId === 'number' ? projectId : null,
        projectUrl: typeof projectUrl === 'string' ? projectUrl.slice(0, 2000) : null,
        reporterEmail: typeof reporterEmail === 'string' ? reporterEmail.slice(0, 254) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reporte recibido y guardado para revisión técnica.',
        issue: { id: report.id, title: report.title, createdAt: report.createdAt.toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al procesar reporte de issue', error as Error);
    return NextResponse.json(
      { error: 'No se pudo procesar el reporte de issue' },
      { status: 500 }
    );
  }
}
