import { getProjects, type Project } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import JsonLd from "@/components/JsonLd";
import { searchAndRankProjects, defaultSortProjects } from "@/lib/searchEngine";
import DatabaseError from "@/components/DatabaseError";
import {
    buildFilterCounts,
    filterProjectsByFacets,
} from "@/lib/search/filtering";

export default async function ProjectListContainer({
    searchParams,
    initialProjects,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
    initialProjects?: Project[];
}) {
    const result = initialProjects ? { ok: true as const, projects: initialProjects } : await getProjects();

    if (!result.ok) {
        return <DatabaseError />;
    }

    const projects = result.projects;

    const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : '';
    const selectedEstado = typeof searchParams.estado === 'string' ? searchParams.estado : '';
    const selectedInstitutions = typeof searchParams.institution === 'string' ? searchParams.institution.split(',').filter(Boolean) : [];
    const selectedRegions = typeof searchParams.region === 'string' ? searchParams.region.split(',').filter(Boolean) : [];
    const selectedAmbito = typeof searchParams.ambito === 'string' ? searchParams.ambito : '';
    const minAmountRaw = typeof searchParams.minAmount === 'string' ? Number.parseInt(searchParams.minAmount, 10) : 0;
    const maxAmountRaw = typeof searchParams.maxAmount === 'string' ? Number.parseInt(searchParams.maxAmount, 10) : Infinity;
    const minAmount = Number.isFinite(minAmountRaw) ? minAmountRaw : 0;
    const maxAmount = Number.isFinite(maxAmountRaw) ? maxAmountRaw : Infinity;

    const filterCounts = buildFilterCounts(projects);

    const filteredByFacets = filterProjectsByFacets(projects, {
        selectedEstado,
        selectedInstitutions,
        selectedRegions,
        selectedAmbito,
        minAmount,
        maxAmount,
    });

    const filteredProjects = searchTerm
        ? searchAndRankProjects(searchTerm, filteredByFacets)
        : defaultSortProjects(filteredByFacets);

    const activeFilterLabels: string[] = [];
    if (searchTerm.trim()) activeFilterLabels.push(`Busqueda: "${searchTerm.trim()}"`);
    if (selectedEstado) activeFilterLabels.push(`Estado: ${selectedEstado}`);
    if (selectedAmbito) activeFilterLabels.push(`Ambito: ${selectedAmbito}`);
    selectedInstitutions.forEach((inst) => activeFilterLabels.push(`Institucion: ${inst}`));
    selectedRegions.forEach((region) => activeFilterLabels.push(`Region: ${region}`));
    if (minAmount > 0 || maxAmount < Infinity) {
        const amountLabel = maxAmount < Infinity
            ? `Monto: ${minAmount.toLocaleString('es-CL')} - ${maxAmount.toLocaleString('es-CL')}`
            : `Monto: desde ${minAmount.toLocaleString('es-CL')}`;
        activeFilterLabels.push(amountLabel);
    }

    return (
        <>
            <JsonLd projects={filteredProjects} />
            <ProjectList
                projects={filteredProjects}
                filterCounts={filterCounts}
                totalCount={projects.length}
                activeFilterLabels={activeFilterLabels}
            />
        </>
    );
}
