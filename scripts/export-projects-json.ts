import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('Script');
import prisma from '../lib/prisma';
import { buildCatalogMetadata } from '../lib/catalog-metadata';
import * as fs from 'fs';
import * as path from 'path';

const PROJECTS_FILE = path.join(__dirname, '..', 'data', 'projects.json');
const METADATA_FILE = path.join(__dirname, '..', 'data', 'metadata.json');

function writeJsonAtomically(filePath: string, value: unknown): void {
    const temporaryPath = `${filePath}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    try {
        fs.renameSync(temporaryPath, filePath);
    } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== 'EEXIST' && code !== 'EPERM') throw error;
        fs.rmSync(filePath, { force: true });
        fs.renameSync(temporaryPath, filePath);
    }
}

/** Strip null values so JSON matches the Project interface (string | undefined, not null) */
function stripNulls(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}

async function exportProjects() {
    const projects = await prisma.project.findMany({
        orderBy: { fecha_cierre: 'asc' },
    });

    // Map to the same format as getProjects(), stripping nulls and heavy columns
    const mapped = projects.map(p => {
        const base = {
            ...p,
            estado: p.estado === 'Vigente' ? 'Abierto' : p.estado,
            fecha_cierre: p.fecha_cierre.toISOString().split('T')[0],
            webinar_fecha: p.webinar_fecha ? p.webinar_fecha.toISOString() : undefined,
            // Remove embedding and search_vector (huge, not needed in fallback)
            embedding: undefined,
            search_vector: undefined,
        };
        return stripNulls(base);
    });

    const metadata = buildCatalogMetadata(mapped, new Date().toISOString());
    writeJsonAtomically(PROJECTS_FILE, mapped);
    writeJsonAtomically(METADATA_FILE, metadata);
    logger.info(`Exported ${mapped.length} projects and refreshed catalog metadata`);
    await prisma.$disconnect();
}

exportProjects().catch(e => { logger.error(e); process.exit(1); });
