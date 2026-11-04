export interface CatalogProjectForMetadata {
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
  const activeProjects = projects.filter((project) => {
    const state = project.estadoPostulacion || project.estado;
    return (
      project.publishable !== false &&
      project.relevanciaChile !== false &&
      typeof state === "string" &&
      ACTIVE_STATES.has(state)
    );
  }).length;

  return {
    lastUpdatedAt,
    totalProjects: projects.length,
    activeProjects,
  };
}
