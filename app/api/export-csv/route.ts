import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('ExportCSV');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const region = searchParams.get('region') || '';
    const institution = searchParams.get('institution') || '';
    const q = searchParams.get('q') || '';

    const beneficiary = searchParams.get('beneficiary') || '';
    const minAmountRaw = searchParams.get('minAmount');
    const maxAmountRaw = searchParams.get('maxAmount');
    const minAmount = minAmountRaw != null ? Number(minAmountRaw) : undefined;
    const maxAmount = maxAmountRaw != null ? Number(maxAmountRaw) : undefined;

    // ponytail: reject malformed amounts instead of silently dropping every row
    if ((minAmountRaw != null && !Number.isFinite(minAmount)) || (maxAmountRaw != null && !Number.isFinite(maxAmount))) {
      return NextResponse.json({ error: 'Parámetros de monto inválidos' }, { status: 400 });
    }

    const result = await getProjects();
    const projects = result.ok ? result.projects : [];

    // Apply filters
    const filtered = projects.filter(p => {
        const matchCat = !category || p.categoria === category;
        const matchReg = !region || (p.regiones && (p.regiones.includes(region) || p.regiones.includes('Todas')));
        const matchInst = !institution || p.institucion === institution;
        const matchQ = !q || `${p.nombre} ${p.institucion} ${p.categoria} ${p.resumen?.observaciones || ''}`.toLowerCase().includes(q.toLowerCase());
        const matchBen = !beneficiary || (p.beneficiarios && p.beneficiarios.includes(beneficiary));

        // Amount logic handling "sin monto definido" (0 or null)
        const amount = p.monto || 0;
        const matchMin = minAmount === undefined || amount >= minAmount;
        const matchMax = maxAmount === undefined || amount <= maxAmount;

        return matchCat && matchReg && matchInst && matchQ && matchBen && matchMin && matchMax;
    });

    // Build CSV
    const headers = [
        'ID',
        'Nombre',
        'Institución',
        'Categoría',
        'Monto (CLP)',
        'Fecha Cierre',
        'Estado',
        'Regiones',
        'Beneficiarios',
        'Cofinanciamiento',
        'Plazo Ejecución',
        'URL Bases Oficiales'
    ];

    const escapeCSV = (val: string | number | undefined): string => {
        if (val === undefined || val === null) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = filtered.map(p => [
        p.id,
        p.nombre,
        p.institucion,
        p.categoria,
        p.monto,
        p.fecha_cierre,
        p.estado,
        (p.regiones || []).join(' | '),
        (p.beneficiarios || []).join(' | '),
        p.resumen?.cofinanciamiento || '',
        p.resumen?.plazo_ejecucion || '',
        p.url_bases
    ].map(escapeCSV).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    // Add BOM for Excel compatibility with Spanish characters
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    const today = new Date().toISOString().split('T')[0];
    const filename = `fondos-iica-chile-${today}.csv`;

    return new NextResponse(csvWithBom, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache'
        }
    });
    } catch (error) {
        logger.error('Export CSV error', error as Error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
