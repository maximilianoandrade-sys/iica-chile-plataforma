import { getProjects } from "@/lib/data";
import ProjectList from "@/components/ProjectList";
import ProjectFilters from "@/components/ProjectFilters";
import JsonLd from "@/components/JsonLd";
import AnalyticsStrip from "@/components/AnalyticsStrip";
import { searchAndRankProjects, buildDynamicSuggestions, defaultSortProjects, getZeroResultsSuggestions } from "@/lib/searchEngine";
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

    // Filtros avanzados
    const selectedAmbito = typeof searchParams.ambito === 'string' ? searchParams.ambito : 'Todos';
    const selectedViabilidad = typeof searchParams.viabilidad === 'string' ? searchParams.viabilidad : 'Todas';
    const selectedEstado = typeof searchParams.estado === 'string' ? searchParams.estado : 'Todos';

    const minAmount = typeof searchParams.minAmount === 'string' ? parseInt(searchParams.minAmount) : 0;
    const maxAmount = typeof searchParams.maxAmount === 'string' ? parseInt(searchParams.maxAmount) : Infinity;
    const selectedRol = typeof searchParams.rol === 'string' ? searchParams.rol : 'Todos';

    // 1. Opciones de filtros (calculadas sobre todos los proyectos)
    const categories = ['Todas', ...Array.from(new Set(projects.map(p => p.categoria)))];
    const uniqueRegions = Array.from(new Set(projects.flatMap(p => p.regiones || []))).sort();
    const uniqueBeneficiaries = Array.from(new Set(projects.flatMap(p => p.beneficiarios || []))).sort();
    const uniqueInstitutions = Array.from(new Set([
        ...projects.map(p => p.institucion),
        ...counterparts.slice(0, 20).map(c => c.name)
    ])).sort();

    // 2. Sugerencias dinámicas generadas del contenido real de proyectos
    const dynamicSuggestions = buildDynamicSuggestions(projects);

    // 3. Filtrar + ordenar por relevancia
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

        // Filtro solo abiertos — usa fecha real como fuente de verdad absoluta
        const closeDate = new Date(project.fecha_cierre);
        const daysLeft = Math.ceil((closeDate.getTime() - today.getTime()) / 86_400_000);
        const isOpen = daysLeft > 0;
        const matchesOpen = !soloAbiertos || isOpen;

        // Filtros Fase 1
        const matchesAmbito = selectedAmbito === 'Todos' || project.ambito === selectedAmbito;
        const matchesViabilidad = selectedViabilidad === 'Todas' || project.viabilidadIICA === selectedViabilidad;

        // Estado: primero usa estadoPostulacion del JSON, si no está disponible infiere por fecha
        let matchesEstado = true;
        if (selectedEstado !== 'Todos') {
            if (project.estadoPostulacion) {
                matchesEstado = project.estadoPostulacion === selectedEstado;
            } else {
                // Inferir estado por fecha cuando el campo no está definido
                let inferredEstado: string;
                if (daysLeft < 0) inferredEstado = 'Cerrada';
                else if (daysLeft <= 30) inferredEstado = 'Próxima';
                else inferredEstado = 'Abierta';
                matchesEstado = inferredEstado === selectedEstado;
            }
        }

        const matchesRol = selectedRol === 'Todos' || project.rolIICA === selectedRol;

        return matchesCategory && matchesRegion && matchesBeneficiary && matchesInstitution
            && matchesAmount && matchesOpen
            && matchesAmbito && matchesViabilidad && matchesEstado && matchesRol;
    });

    // 4. Ordenamiento secundario
    if (searchTerm && sortBy !== 'relevance') {
        // Con búsqueda activa + orden manual elegido por usuario
        if (sortBy === 'date_asc') {
            filteredProjects.sort((a, b) => new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime());
        } else if (sortBy === 'date_desc') {
            filteredProjects.sort((a, b) => new Date(b.fecha_cierre).getTime() - new Date(a.fecha_cierre).getTime());
        } else if (sortBy === 'amount_desc') {
            filteredProjects.sort((a, b) => b.monto - a.monto);
        } else if (sortBy === 'amount_asc') {
            filteredProjects.sort((a, b) => a.monto - b.monto);
        } else if (sortBy === 'viabilidad_desc') {
            filteredProjects.sort((a, b) => (b.porcentajeViabilidad || 0) - (a.porcentajeViabilidad || 0));
        }
        // sortBy === 'relevance' con query → mantiene orden del motor de búsqueda
    } else if (!searchTerm || sortBy === 'relevance') {
        // Sin búsqueda: ordenamiento elegido o inteligente por defecto
        // Con búsqueda y sortBy 'relevance': si no hay resultados de búsqueda, se aplica el ordenamiento por defecto
        if (sortBy === 'date_asc') {
            filteredProjects.sort((a, b) => new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime());
        } else if (sortBy === 'date_desc') {
            filteredProjects.sort((a, b) => new Date(b.fecha_cierre).getTime() - new Date(a.fecha_cierre).getTime());
        } else if (sortBy === 'amount_desc') {
            filteredProjects.sort((a, b) => b.monto - a.monto);
        } else if (sortBy === 'amount_asc') {
            filteredProjects.sort((a, b) => a.monto - b.monto);
        } else if (sortBy === 'viabilidad_desc') {
            filteredProjects.sort((a, b) => (b.porcentajeViabilidad || 0) - (a.porcentajeViabilidad || 0));
        } else {
            // Default: urgencyScore compuesto (urgencia + viabilidad + rol)
            filteredProjects = defaultSortProjects(filteredProjects);
        }
    }

    // 5. Sugerencias para 0 resultados
    const zeroResultsSuggestions = filteredProjects.length === 0 && searchTerm
        ? getZeroResultsSuggestions(searchTerm, projects)
        : [];

    // Contar abiertos para el badge
    const openCount = projects.filter(p => new Date(p.fecha_cierre).getTime() >= today.getTime()).length;

    const hasActiveFilters = !!(searchTerm || selectedCategory !== 'Todas' || selectedRegion !== 'Todas'
        || selectedBeneficiary !== 'Todos' || selectedInstitution !== 'Todas' || soloAbiertos
        || selectedAmbito !== 'Todos' || selectedViabilidad !== 'Todas' || selectedEstado !== 'Todos'
        || selectedRol !== 'Todos');

    return (
        <>
            <JsonLd projects={filteredProjects} />
            <ProjectFilters
                categories={categories}
                regions={uniqueRegions}
                beneficiaries={uniqueBeneficiaries}
                institutions={uniqueInstitutions}
                counts={{ filtered: filteredProjects.length, total: projects.length, open: openCount }}
                dynamicSuggestions={dynamicSuggestions}
                zeroResultsSuggestions={zeroResultsSuggestions}
            />
            <AnalyticsStrip
                projects={filteredProjects}
                totalAll={projects.length}
                searchActive={hasActiveFilters}
            />
            <ProjectList projects={filteredProjects} />
        </>
    );
}
