import { getProjects } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import ProjectFilters from "@/components/ProjectFilters";
import JsonLd from "@/components/JsonLd";
import { searchAndRankProjects } from "@/lib/searchEngine";
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
    const soloAbiertos = searchParams.open === '1';
    const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'relevance';

    const minAmount = typeof searchParams.minAmount === 'string' ? parseInt(searchParams.minAmount) : 0;
    const maxAmount = typeof searchParams.maxAmount === 'string' ? parseInt(searchParams.maxAmount) : Infinity;

    // 1. Opciones de filtros (calculadas sobre todos los proyectos)
    const categories = ['Todas', ...Array.from(new Set(projects.map(p => p.categoria)))];
    const uniqueRegions = Array.from(new Set(projects.flatMap(p => p.regiones || []))).sort();
    const uniqueBeneficiaries = Array.from(new Set(projects.flatMap(p => p.beneficiarios || []))).sort();
    const uniqueInstitutions = Array.from(new Set([
        ...projects.map(p => p.institucion),
        ...counterparts.slice(0, 20).map(c => c.name)
    ])).sort();

    // 2. Filtrar + ordenar por relevancia
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Primero aplicar búsqueda inteligente con ranking
    let filteredProjects = searchAndRankProjects(searchTerm, projects);

    // Luego aplicar filtros adicionales
    filteredProjects = filteredProjects.filter(project => {
        const matchesCategory = selectedCategory === 'Todas' || project.categoria === selectedCategory;
        const matchesRegion = selectedRegion === 'Todas' || (project.regiones && project.regiones.includes(selectedRegion));
        const matchesBeneficiary = selectedBeneficiary === 'Todos' || (project.beneficiarios && project.beneficiarios.includes(selectedBeneficiary));
        const matchesInstitution = selectedInstitution === 'Todas' || project.institucion === selectedInstitution || project.institucion.includes(selectedInstitution);

        const filterActive = minAmount > 0 || maxAmount < Infinity;
        const matchesAmount = !filterActive || (project.monto >= minAmount && project.monto <= maxAmount);

        // Filtro solo abiertos
        const closeDate = new Date(project.fecha_cierre);
        const isOpen = closeDate.getTime() >= today.getTime();
        const matchesOpen = !soloAbiertos || isOpen;

        return matchesCategory && matchesRegion && matchesBeneficiary && matchesInstitution && matchesAmount && matchesOpen;
    });

    // 3. Ordenamiento secundario (cuando no hay búsqueda de texto)
    if (!searchTerm) {
        if (sortBy === 'date_asc') {
            filteredProjects.sort((a, b) => new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime());
        } else if (sortBy === 'date_desc') {
            filteredProjects.sort((a, b) => new Date(b.fecha_cierre).getTime() - new Date(a.fecha_cierre).getTime());
        } else if (sortBy === 'amount_desc') {
            filteredProjects.sort((a, b) => b.monto - a.monto);
        } else if (sortBy === 'amount_asc') {
            filteredProjects.sort((a, b) => a.monto - b.monto);
        } else {
            // Default: abiertos primero, luego por fecha de cierre más próxima
            filteredProjects.sort((a, b) => {
                const aOpen = new Date(a.fecha_cierre).getTime() >= today.getTime();
                const bOpen = new Date(b.fecha_cierre).getTime() >= today.getTime();
                if (aOpen && !bOpen) return -1;
                if (!aOpen && bOpen) return 1;
                return new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime();
            });
        }
    }

    // Contar abiertos para el badge
    const openCount = projects.filter(p => new Date(p.fecha_cierre).getTime() >= today.getTime()).length;

    return (
        <>
            <JsonLd projects={filteredProjects} />
            <ProjectFilters
                categories={categories}
                regions={uniqueRegions}
                beneficiaries={uniqueBeneficiaries}
                institutions={uniqueInstitutions}
                counts={{ filtered: filteredProjects.length, total: projects.length, open: openCount }}
            />
            <ProjectList projects={filteredProjects} />
        </>
    );
}
