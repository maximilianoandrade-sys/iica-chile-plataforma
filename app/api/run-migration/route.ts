/**
 * TEMPORARY: One-shot migration endpoint to apply performance indexes.
 * Protected by CRON_SECRET. DELETE THIS FILE after use.
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statements = [
        `CREATE INDEX IF NOT EXISTS idx_project_ambito ON "Project" (ambito) WHERE ambito IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_project_estado_fecha ON "Project" ("estadoPostulacion" ASC, fecha_cierre ASC)`,
        `CREATE INDEX IF NOT EXISTS idx_project_needs_review ON "Project" ("needsReview") WHERE "needsReview" = FALSE`,
        `CREATE INDEX IF NOT EXISTS idx_project_source_id ON "Project" ("sourceId")`,
    ];

    const results: { sql: string; status: string }[] = [];

    for (const sql of statements) {
        try {
            await prisma.$executeRawUnsafe(sql);
            results.push({ sql: sql.substring(0, 60) + '...', status: 'OK' });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            results.push({ sql: sql.substring(0, 60) + '...', status: `ERROR: ${message}` });
        }
    }

    return NextResponse.json({ results, timestamp: new Date().toISOString() });
}
