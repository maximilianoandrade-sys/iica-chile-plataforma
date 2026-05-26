import type { Project } from '@/lib/data';
import {
  buildFilterCounts,
  filterProjectsByFacets,
  getProjectRegions,
  inferEstado,
} from '@/lib/search/filtering';

function makeProject(overrides: Partial<Project>): Project {
  return {
    id: overrides.id ?? 1,
    nombre: overrides.nombre ?? 'Proyecto de riego',
    institucion: overrides.institucion ?? 'INDAP',
    monto: overrides.monto ?? 200000,
    montoTexto: overrides.montoTexto ?? null,
    fecha_cierre: overrides.fecha_cierre ?? '2099-12-31',
    estado: overrides.estado ?? 'Activa',
    categoria: overrides.categoria ?? 'Convocatoria',
    url_bases: overrides.url_bases ?? 'https://example.com/proyecto',
    ...overrides,
  };
}

describe('search filtering helpers', () => {
  it('infers estado from estadoPostulacion when available', () => {
    const project = makeProject({ estadoPostulacion: 'Cerrada' });
    expect(inferEstado(project)).toBe('Cerrada');
  });

  it('infers estado by deadline when estadoPostulacion is missing', () => {
    const open = makeProject({ fecha_cierre: '2099-12-31' });
    const soon = makeProject({ fecha_cierre: '2026-06-10' });
    const closed = makeProject({ fecha_cierre: '2020-01-01' });
    const now = new Date('2026-06-01T12:00:00.000Z');

    expect(inferEstado(open, now)).toBe('Abierta');
    expect(inferEstado(soon, now)).toBe('Próxima');
    expect(inferEstado(closed, now)).toBe('Cerrada');
  });

  it('extracts regions from regiones or comma-separated region fallback', () => {
    const withRegiones = makeProject({ regiones: ['Maule', 'Biobío'] });
    const withRegionString = makeProject({ regiones: [], region: 'Coquimbo, Atacama' });

    expect(getProjectRegions(withRegiones)).toEqual(['Maule', 'Biobío']);
    expect(getProjectRegions(withRegionString)).toEqual(['Coquimbo', 'Atacama']);
  });

  it('builds filter counts from all projects', () => {
    const projects = [
      makeProject({ id: 1, institucion: 'INDAP', ambito: 'Nacional', regiones: ['Maule'], estadoPostulacion: 'Abierta' }),
      makeProject({ id: 2, institucion: 'CORFO', ambito: 'Regional', regiones: ['Maule', 'Biobío'], estadoPostulacion: 'Próxima' }),
      makeProject({ id: 3, institucion: 'INDAP', ambito: 'Nacional', region: 'Atacama' }),
    ];

    const counts = buildFilterCounts(projects, new Date('2026-06-01T12:00:00.000Z'));

    expect(counts.institucion.INDAP).toBe(2);
    expect(counts.region.Maule).toBe(2);
    expect(counts.ambito.Nacional).toBe(2);
    expect(counts.estado.Abierta).toBeGreaterThanOrEqual(1);
  });

  it('filters projects by estado/institution/region/ambito/amount', () => {
    const projects = [
      makeProject({
        id: 1,
        institucion: 'INDAP',
        ambito: 'Nacional',
        regiones: ['Maule'],
        estadoPostulacion: 'Abierta',
        monto: 300000,
      }),
      makeProject({
        id: 2,
        institucion: 'CORFO',
        ambito: 'Regional',
        regiones: ['Biobío'],
        estadoPostulacion: 'Próxima',
        monto: 1000000,
      }),
    ];

    const filtered = filterProjectsByFacets(
      projects,
      {
        selectedEstado: 'Abierta',
        selectedInstitutions: ['INDAP'],
        selectedRegions: ['Maule'],
        selectedAmbito: 'Nacional',
        minAmount: 200000,
        maxAmount: 500000,
      },
      new Date('2026-06-01T12:00:00.000Z')
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1);
  });
});
