export interface CatalogProjectForMetadata {
  fecha_cierre?: string | null;
  estado?: string | null;
  estadoPostulacion?: string | null;
  publishable?: boolean | null;
  relevanciaChile?: boolean | null;
}

export interface CatalogMetadata {
  lastUpdatedAt: string;
  totalProjects: number;
  activeProjects: number;
}

const ACTIVE_STATES = new Set(["Abierto", "Abierta", "Próximo", "Permanente"]);

export function buildCatalogMetadata(
  projects: CatalogProjectForMetadata[],
  lastUpdatedAt: string,
): CatalogMetadata {
  const today = new Date().toISOString().slice(0, 10);
  const activeProjects = projects.filter((project) => {
    const state = project.estadoPostulacion || project.estado;
    const deadline = project.fecha_cierre || '';
    const hasUnknownDeadline = deadline.startsWith('2099');
    const isCurrentOrUnknown = !deadline || hasUnknownDeadline || deadline >= today;
    return (
      project.publishable !== false &&
      project.relevanciaChile !== false &&
      typeof state === "string" &&
      ACTIVE_STATES.has(state) &&
      isCurrentOrUnknown
    );
  }).length;

  return {
    lastUpdatedAt,
    totalProjects: projects.length,
    activeProjects,
  };
}
