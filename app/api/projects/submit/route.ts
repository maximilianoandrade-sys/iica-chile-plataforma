import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { scrapeUrlWithAI } from '@/lib/ingestion/universal-ai-scraper';
import { normalizeUrl } from '@/lib/ingestion/utils';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ProjectSubmitAPI');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = body.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json({ error: 'URL es requerida' }, { status: 400 });
    }

    const canonicalUrl = normalizeUrl(rawUrl);
    if (!canonicalUrl) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Check if it already exists
    const existing = await prisma.project.findUnique({
      where: { canonicalUrl },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Esta oportunidad ya existe en la plataforma' },
        { status: 409 }
      );
    }

    // Extract info via LLM
    const extractedProject = await scrapeUrlWithAI(canonicalUrl);

    if (!extractedProject) {
      return NextResponse.json(
        { error: 'No se pudo extraer información estructurada de este enlace' },
        { status: 422 }
      );
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
        estadoPostulacion: 'Abierta'
      },
    });

    logger.info('Project submitted by community successfully', { projectId: dbProject.id, url: canonicalUrl });

    return NextResponse.json({ ok: true, success: true, project: dbProject }, { status: 201 });
  } catch (error) {
    logger.error('Error submitting project', error as Error);
    return NextResponse.json({ ok: false, error: 'Error interno procesando la sugerencia' }, { status: 500 });
  }
}
