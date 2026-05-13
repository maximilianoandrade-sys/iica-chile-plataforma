import prisma from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

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
            fecha_cierre: p.fecha_cierre.toISOString().split('T')[0],
            webinar_fecha: p.webinar_fecha ? p.webinar_fecha.toISOString() : undefined,
            // Remove embedding and search_vector (huge, not needed in fallback)
            embedding: undefined,
            search_vector: undefined,
        };
        return stripNulls(base);
    });

    const outPath = path.join(__dirname, '..', 'data', 'projects.json');
    fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2), 'utf-8');
    console.log(`Exported ${mapped.length} projects to ${outPath}`);
    await prisma.$disconnect();
}

exportProjects().catch(e => { console.error(e); process.exit(1); });
