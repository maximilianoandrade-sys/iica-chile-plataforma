import { searchProjectsWithFuse, SearchableProject } from '../fuseSearch';

describe('searchProjectsWithFuse', () => {
  const mockProjects: SearchableProject[] = [
    {
      id: 1,
      nombre: 'Fondo de Desarrollo de Energías Renovables',
      institucion: 'Ministerio de Energía',
      categoria: 'Sostenibilidad',
      regiones: ['Metropolitana', 'Valparaíso']
    },
    {
      id: 2,
      nombre: 'Licitación para Riego Eficiente',
      institucion: 'CNR',
      categoria: 'Licitación',
      regiones: ['O\'Higgins']
    },
    {
      id: 3,
      nombre: 'Apoyo a Pequeños Agricultores',
      institucion: 'INDAP',
      categoria: 'Desarrollo Territorial',
      regiones: ['Maule', 'Ñuble']
    }
  ];

  it('should return all projects if query is empty', () => {
    const result = searchProjectsWithFuse(mockProjects, '');
    expect(result).toHaveLength(3);
  });

  it('should find projects by exact name', () => {
    const result = searchProjectsWithFuse(mockProjects, 'Riego Eficiente');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('should find projects by institution', () => {
    const result = searchProjectsWithFuse(mockProjects, 'INDAP');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it('should find projects using fuzzy matching', () => {
    // "energia" should match "Energías"
    const result = searchProjectsWithFuse(mockProjects, 'energia');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe(1);
  });

  it('should return empty array if no matches', () => {
    const result = searchProjectsWithFuse(mockProjects, 'Quantum Computing');
    expect(result).toHaveLength(0);
  });
});
