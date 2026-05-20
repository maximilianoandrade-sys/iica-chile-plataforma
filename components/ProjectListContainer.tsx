import { getProjects, type Project } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import type { FilterCounts } from "@/components/ProjectFilters";
import JsonLd from "@/components/JsonLd";
import { searchAndRankProjects, defaultSortProjects } from "@/lib/searchEngine";

function inferEstado(project: Project): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const close = new Date(project.fecha_cierre);
    const daysLeft = Math.ceil((close.getTime() - today.getTime()) / 86_400_000);
    if (daysLeft < 0) return 'Cerrada';
    if (daysLeft <= 30) return 'Próxima';
    return 'Abierta';
}

function getProjectRegions(project: Project): string[] {
    if (project.regiones && project.regiones.length > 0) {
        return project.regiones;
    }

    if (project.region) {
        return project.region
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean);
    }

    return [];
}

export default async function ProjectListContainer({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const projects = await getProjects();

    const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : '';
    const selectedEstado = typeof searchParams.estado === 'string' ? searchParams.estado : '';
    const selectedInstitutions = typeof searchParams.institution === 'string' ? searchParams.institution.split(',').filter(Boolean) : [];
    const selectedRegions = typeof searchParams.region === 'string' ? searchParams.region.split(',').filter(Boolean) : [];
    const selectedAmbito = typeof searchParams.ambito === 'string' ? searchParams.ambito : '';
    const minAmount = typeof searchParams.minAmount === 'string' ? parseInt(searchParams.minAmount) : 0;
    const maxAmount = typeof searchParams.maxAmount === 'string' ? parseInt(searchParams.maxAmount) : Infinity;

    // Compute filterCounts from ALL projects
    const filterCounts: FilterCounts = {
        estado: projects.reduce((acc, p) => {
            const estado = p.estadoPostulacion || inferEstado(p);
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        institucion: projects.reduce((acc, p) => {
            acc[p.institucion] = (acc[p.institucion] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        region: projects.reduce((acc, p) => {
            getProjectRegions(p).forEach(r => { acc[r] = (acc[r] || 0) + 1; });
            return acc;
        }, {} as Record<string, number>),
        ambito: projects.reduce((acc, p) => {
            if (p.ambito) acc[p.ambito] = (acc[p.ambito] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };

    // Filter projects
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredProjects = searchTerm
        ? searchAndRankProjects(searchTerm, projects)
        : defaultSortProjects([...projects]);

    filteredProjects = filteredProjects.filter(project => {
        // Estado filter
        let matchesEstado = true;
        if (selectedEstado) {
            if (project.estadoPostulacion) {
                matchesEstado = project.estadoPostulacion === selectedEstado;
            } else {
                matchesEstado = inferEstado(project) === selectedEstado;
            }
        }

        const matchesInstitution = selectedInstitutions.length === 0 || selectedInstitutions.includes(project.institucion);
        const projectRegions = getProjectRegions(project);
        const matchesRegion = selectedRegions.length === 0 || projectRegions.some(r => selectedRegions.includes(r));
        const matchesAmbito = !selectedAmbito || project.ambito === selectedAmbito;

        const filterActive = minAmount > 0 || maxAmount < Infinity;
        const matchesAmount = !filterActive || (project.monto >= minAmount && project.monto <= maxAmount);

        return matchesEstado && matchesInstitution && matchesRegion && matchesAmbito && matchesAmount;
    });

    return (
        <>
            <JsonLd projects={filteredProjects} />
            <ProjectList
                projects={filteredProjects}
                filterCounts={filterCounts}
                totalCount={projects.length}
            />
        </>
    );
}
