import { getProjects } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import ProjectFilters from "@/components/ProjectFilters";
import JsonLd from "@/components/JsonLd";
import { smartSearch } from "@/lib/searchEngine";
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
        ...counterparts.slice(0, 20).map(c => c.name)
    ])).sort();

    // 2. Filter Results
    const filteredProjects = projects.filter(project => {
        // Smart Search
        const searchableText = `${project.nombre} ${project.institucion} ${project.categoria} ${(project.regiones || []).join(' ')} ${(project.beneficiarios || []).join(' ')} ${project.resumen?.observaciones || ''} ${(project.resumen?.requisitos_clave || []).join(' ')}`;
        const matchesSearch = searchTerm ? smartSearch(searchTerm, searchableText) : true;

        const matchesCategory = selectedCategory === 'Todas' || project.categoria === selectedCategory;
        const matchesRegion = selectedRegion === 'Todas' || (project.regiones && project.regiones.includes(selectedRegion));
        const matchesBeneficiary = selectedBeneficiary === 'Todos' || (project.beneficiarios && project.beneficiarios.includes(selectedBeneficiary));
        const matchesInstitution = selectedInstitution === 'Todas' || project.institucion === selectedInstitution || project.institucion.includes(selectedInstitution);

        const filterActive = minAmount > 0 || maxAmount < Infinity;
        const matchesAmount = !filterActive || (project.monto >= minAmount && project.monto <= maxAmount);

        return matchesSearch && matchesCategory && matchesRegion && matchesBeneficiary && matchesInstitution && matchesAmount;
    });

    return (
        <>
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
