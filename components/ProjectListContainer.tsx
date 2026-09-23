import { getCachedProjectFilterSnapshot, getCachedProjects, type Project } from '@/lib/data';
import ProjectList from "@/components/ProjectList";
import JsonLd from "@/components/JsonLd";
import { hybridSearch } from '@/lib/searchHybrid';
import DatabaseError from "@/components/DatabaseError";

const DEFAULT_PAGE_SIZE = 16;

export default async function ProjectListContainer({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Parse all params synchronously (no DB calls needed here)
    const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : '';
    const selectedEstadoRaw = typeof searchParams.estado === 'string' ? searchParams.estado : 'Abierta';
    const selectedEstado = selectedEstadoRaw === 'all' ? '' : selectedEstadoRaw;
    const selectedInstitutions = typeof searchParams.institution === 'string' ? searchParams.institution.split(',').filter(Boolean) : [];
    const selectedRegions = typeof searchParams.region === 'string' ? searchParams.region.split(',').filter(Boolean) : [];
    const selectedCategories = typeof searchParams.category === 'string' ? searchParams.category.split(',').filter(Boolean) : [];
    const rawAmbito = typeof searchParams.ambito === 'string' ? searchParams.ambito : '';
    const relevanceMode = typeof searchParams.relevanceMode === 'string' ? searchParams.relevanceMode : 'chile_strict';
    const selectedAmbito = rawAmbito || (relevanceMode === 'all' ? 'all' : relevanceMode === 'international' ? 'Internacional' : 'chile');
    const tipo = (typeof searchParams.tipo === 'string' && (searchParams.tipo === 'fondo' || searchParams.tipo === 'licitacion')) ? searchParams.tipo : 'all';
    const postedFrom = typeof searchParams.postedFrom === 'string' ? searchParams.postedFrom : undefined;
    const postedTill = typeof searchParams.postedTill === 'string' ? searchParams.postedTill : undefined;
    const sort = typeof searchParams.sort === 'string'
        ? searchParams.sort
        : (searchTerm.trim() ? 'relevance' : 'date_asc');
    const currentPageRaw = typeof searchParams.page === 'string' ? Number.parseInt(searchParams.page, 10) : 1;
    const currentPage = Number.isFinite(currentPageRaw) && currentPageRaw > 0 ? currentPageRaw : 1;
    const minAmountRaw = typeof searchParams.minAmount === 'string' ? Number.parseInt(searchParams.minAmount, 10) : 0;
    const maxAmountRaw = typeof searchParams.maxAmount === 'string' ? Number.parseInt(searchParams.maxAmount, 10) : Infinity;
    const minAmount = Number.isFinite(minAmountRaw) ? minAmountRaw : 0;
    const maxAmount = Number.isFinite(maxAmountRaw) ? maxAmountRaw : Infinity;
    const closingWithinDays = typeof searchParams.urgencia === 'string' ? Number.parseInt(searchParams.urgencia, 10) : undefined;

    // Run DB check and search in parallel for better performance
    const filterSnapshot = await getCachedProjectFilterSnapshot();
    let searchResult: Awaited<ReturnType<typeof hybridSearch>>;

    try {
        searchResult = await hybridSearch({
            query: searchTerm,
            ambito: selectedAmbito || 'all',
            tipo,
            selectedInstitutions,
            selectedRegions,
            selectedCategories,
            estado: selectedEstado || undefined,
            minAmount,
            maxAmount,
            postedFrom,
            postedTill,
            closingWithinDays: closingWithinDays && Number.isFinite(closingWithinDays) && closingWithinDays > 0 ? closingWithinDays : undefined,
            sort: sort === 'amount_desc' || sort === 'newest' || sort === 'relevance' ? sort : 'date_asc',
            offset: (currentPage - 1) * DEFAULT_PAGE_SIZE,
            limit: DEFAULT_PAGE_SIZE,
            includeUnverified: relevanceMode === 'all',
        });
        if (searchResult.projects.length === 0 && filterSnapshot.ok && filterSnapshot.projects.length > 0) {
            throw new Error('La búsqueda remota no devolvió resultados; usar catálogo estático');
        }
    } catch {
        const fallback = await getCachedProjects();
        const sourceProjects = fallback.ok ? fallback.projects : [];
        const normalizedQuery = searchTerm.trim().toLocaleLowerCase('es-CL');
        const filtered = sourceProjects.filter((project) => {
            const searchable = [project.nombre, project.institucion, project.categoria, project.objetivo, project.descripcionIICA]
                .filter(Boolean)
                .join(' ')
                .toLocaleLowerCase('es-CL');
            const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
            const matchesStatus = !selectedEstado || project.estadoPostulacion === selectedEstado;
            const matchesAmbito = selectedAmbito === 'all' || (selectedAmbito === 'Nacional' && project.ambito !== 'Internacional') || project.ambito === selectedAmbito;
            const matchesInstitution = selectedInstitutions.length === 0 || selectedInstitutions.includes(project.institucion);
            const matchesRegion = selectedRegions.length === 0 || selectedRegions.some((region) => project.regiones?.includes(region) || project.region === region);
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(project.categoria);
            return matchesQuery && matchesStatus && matchesAmbito && matchesInstitution && matchesRegion && matchesCategory;
        });
        const sorted = [...filtered].sort((a, b) => new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime());
        const offset = (currentPage - 1) * DEFAULT_PAGE_SIZE;
        const fallbackProjects = sorted.slice(offset, offset + DEFAULT_PAGE_SIZE).map((project) => ({
            ...project,
            fecha_cierre: new Date(project.fecha_cierre),
            webinar_fecha: project.webinar_fecha ? new Date(project.webinar_fecha) : null,
        })) as Awaited<ReturnType<typeof hybridSearch>>['projects'];
        searchResult = { projects: fallbackProjects, mode: 'all', total: sorted.length };
    }

    if (!filterSnapshot.ok) {
        return <DatabaseError />;
    }

    const filteredProjects = searchResult.projects.map((project) => ({
        ...project,
        fecha_cierre: project.fecha_cierre.toISOString().split('T')[0],
        webinar_fecha: project.webinar_fecha ? project.webinar_fecha.toISOString() : null,
        ambito: project.ambito as Project['ambito'],
        estadoPostulacion: project.estadoPostulacion as Project['estadoPostulacion'],
        viabilidadIICA: project.viabilidadIICA as Project['viabilidadIICA'],
        rolIICA: project.rolIICA as Project['rolIICA'],
        complejidad: project.complejidad as Project['complejidad'],
    })) as Project[];
    const resultTotal = typeof searchResult.total === 'number' && Number.isFinite(searchResult.total)
        ? searchResult.total
        : filteredProjects.length;

    const activeFilterLabels: string[] = [];
    if (searchTerm.trim()) activeFilterLabels.push(`Búsqueda: "${searchTerm.trim()}"`);
    if (tipo !== 'all') activeFilterLabels.push(tipo === 'fondo' ? 'Fondos Concursables' : 'Licitaciones / Procurement');
    if (selectedEstado) activeFilterLabels.push(`Estado: ${selectedEstado}`);
    if (selectedAmbito) activeFilterLabels.push(`Ámbito: ${selectedAmbito}`);
    selectedInstitutions.forEach((inst) => activeFilterLabels.push(`Institución: ${inst}`));
    selectedRegions.forEach((region) => activeFilterLabels.push(`Región: ${region}`));
    selectedCategories.forEach((category) => activeFilterLabels.push(`Sector: ${category}`));
    if (minAmount > 0 || maxAmount < Infinity) {
        const amountLabel = maxAmount < Infinity
            ? `Monto: ${minAmount.toLocaleString('es-CL')} - ${maxAmount.toLocaleString('es-CL')}`
            : `Monto: desde ${minAmount.toLocaleString('es-CL')}`;
        activeFilterLabels.push(amountLabel);
    }
    if (postedFrom) activeFilterLabels.push(`Publicado desde: ${postedFrom}`);
    if (postedTill) activeFilterLabels.push(`Publicado hasta: ${postedTill}`);

    return (
        <>
            <JsonLd projects={filteredProjects} />
            <ProjectList
                projects={filteredProjects}
                totalCount={resultTotal}
                pageSize={DEFAULT_PAGE_SIZE}
                activeFilterLabels={activeFilterLabels}
            />
        </>
    );
}
