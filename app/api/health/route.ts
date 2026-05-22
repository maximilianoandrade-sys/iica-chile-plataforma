import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('Health');

export const dynamic = 'force-dynamic';

export async function GET() {
    const checks: Record<string, 'ok' | 'error'> = {};

    // DB connection check
    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = 'ok';
    } catch (err) {
        logger.error('Health: DB connection failed', err as Error);
        checks.database = 'error';
    }

    const healthy = Object.values(checks).every(v => v === 'ok');

    return NextResponse.json(
        { status: healthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
        { status: healthy ? 200 : 503 }
    );
}
