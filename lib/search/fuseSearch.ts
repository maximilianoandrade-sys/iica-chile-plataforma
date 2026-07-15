import Fuse from 'fuse.js';

export interface SearchableProject {
  id: number;
  nombre: string;
  institucion: string;
  categoria: string;
  regiones: string[];
}

export function searchProjectsWithFuse<T extends SearchableProject>(
  projects: T[],
  query: string
): T[] {
  if (!query || query.trim() === '') {
    return projects;
  }

  const fuse = new Fuse(projects, {
    keys: [
      { name: 'nombre', weight: 0.5 },
      { name: 'institucion', weight: 0.3 },
      { name: 'categoria', weight: 0.1 },
      { name: 'regiones', weight: 0.1 }
    ],
    threshold: 0.3, // lower threshold = stricter match
    ignoreLocation: true,
    includeScore: true,
  });

  const results = fuse.search(query);
  return results.map(result => result.item);
}
