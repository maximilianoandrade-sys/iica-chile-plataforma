import { getProjects } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import ProjectFilters from "@/components/ProjectFilters";
import JsonLd from "@/components/JsonLd";
import { smartSearch } from "@/lib/searchEngine";
import counterparts from '@/lib/counterparts_raw.json';
import { trackSearch } from "@/lib/analytics"; // Wait, trackSearch is likely client side or needs checking? 
// Checking lib/analytics.ts: "export function trackSearch". It uses localStorage and console. warn. 
// Ideally we track on server, but for now we can't easily track from Server Component without a side effect or logging.
// The user requirement was "The component ProjectList should be a Server Component that reads searchParams".
// Analytics for "Search" is usually done client side or via middleware. 
// I will omit direct tracking here or use a Client Component wrapper for tracking if strictly needed, 
// but "trackSearch" in the original code put it in localStorage. 
// I will move tracking to the "ProjectFilters" component (Client Side) when search changes?
// Or leave it out for now to ensure server rendering speed.

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

        return matchesSearch && matchesCategory && matchesRegion && matchesBeneficiary && matchesInstitution;
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
