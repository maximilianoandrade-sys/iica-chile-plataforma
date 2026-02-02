import { getProjects } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import ProjectFilters from "@/components/ProjectFilters";
import JsonLd from "@/components/JsonLd";
import { smartSearch } from "@/lib/searchEngine";
import SmartAssistant from "@/components/SmartAssistant";
import counterparts from '@/lib/counterparts_raw.json';

export default async function ProjectListContainer({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const projects = await getProjects();

    const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : '';
    const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : 'Todas';
    const selectedRegion = typeof searchParams.region === 'string' ? searchParams.region : 'Todas';
    const selectedBeneficiary = typeof searchParams.beneficiary === 'string' ? searchParams.beneficiary : 'Todos';
    const selectedInstitution = typeof searchParams.institution === 'string' ? searchParams.institution : 'Todas';

    const minAmount = typeof searchParams.minAmount === 'string' ? parseInt(searchParams.minAmount) : 0;
    const maxAmount = typeof searchParams.maxAmount === 'string' ? parseInt(searchParams.maxAmount) : Infinity;

    // 1. Calculate Options
    const categories = ['Todas', ...Array.from(new Set(projects.map(p => p.categoria)))];
    const uniqueRegions = Array.from(new Set(projects.flatMap(p => p.regiones || []))).sort();
    const uniqueBeneficiaries = Array.from(new Set(projects.flatMap(p => p.beneficiarios || []))).sort();

    // Institution list from projects + counterparts
    const uniqueInstitutions = Array.from(new Set([
        ...projects.map(p => p.institucion),
        ...counterparts.slice(0, 20).map(c => c.name) // Keep logic from original
    ])).sort();


    // 2. Filter Results
    const filteredProjects = projects.filter(project => {
        // Smart Search
        const searchableText = `${project.nombre} ${project.institucion} ${project.categoria} ${(project.regiones || []).join(' ')} ${(project.beneficiarios || []).join(' ')}`;
        const matchesSearch = searchTerm ? smartSearch(searchTerm, searchableText) : true;

        const matchesCategory = selectedCategory === 'Todas' || project.categoria === selectedCategory;
        const matchesRegion = selectedRegion === 'Todas' || (project.regiones && project.regiones.includes(selectedRegion));
        const matchesBeneficiary = selectedBeneficiary === 'Todos' || (project.beneficiarios && project.beneficiarios.includes(selectedBeneficiary));
        const matchesInstitution = selectedInstitution === 'Todas' || project.institucion === selectedInstitution || project.institucion.includes(selectedInstitution);

        // Amount Filter
        // Note: Project amount is a number. If amount is 0/null in JSON, we might want to include it or exclude it depending on logic.
        // Assuming 0 means "Not specified" or "Variable". Let's handle standard ranges.
        // If project.monto is 0, we treat it as matching "Any" but if a specific range is set, maybe exclude? 
        // Let's assume matches if (project.monto >= min && project.monto <= max) OR if amount filter is not active (0-Infinity).
        const filterActive = minAmount > 0 || maxAmount < Infinity;
        const matchesAmount = !filterActive || (project.monto >= minAmount && project.monto <= maxAmount);

        return matchesSearch && matchesCategory && matchesRegion && matchesBeneficiary && matchesInstitution && matchesAmount;
    });

    return (
        <>
            <SmartAssistant projects={projects} />
            <JsonLd projects={filteredProjects} />
            <ProjectFilters
                categories={categories}
                regions={uniqueRegions}
                beneficiaries={uniqueBeneficiaries}
                institutions={uniqueInstitutions}
                counts={{ filtered: filteredProjects.length, total: projects.length }}
            />
            <ProjectList projects={filteredProjects} />
        </>
    );
}
