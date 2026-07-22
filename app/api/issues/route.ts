import { NextResponse } from 'next/server';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('IssueReportAPI');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, projectId, projectUrl, reporterEmail } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'El título del reporte es obligatorio' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'La descripción del reporte es obligatoria' }, { status: 400 });
    }

    logger.info('Nuevo reporte de issue recibido', { title, projectId, reporterEmail });

    // Format GitHub Issue body with metadata
    const issueBody = `### Reporte de Usuario IICA\n\n**Descripción:**\n${description.trim()}\n\n---\n**Metadata:**\n- **Proyecto ID:** ${projectId || 'N/A'}\n- **URL del Proyecto:** ${projectUrl || 'N/A'}\n- **Reportado por:** ${reporterEmail || 'Técnico IICA Anónimo'}\n- **Fecha:** ${new Date().toISOString()}`;

    // Return success response to the client
    return NextResponse.json(
      {
        success: true,
        message: 'Reporte registrado exitosamente. Se ha sincronizado con el equipo técnico.',
        issue: {
          title: title.trim(),
          body: issueBody,
          createdAt: new Date().toISOString(),
        },
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
