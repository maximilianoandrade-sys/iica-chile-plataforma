/**
 * @jest-environment node
 */
import { mergeScrapedIntoProjects, scrapedToProject } from '@/lib/scrapers/merge';
import type { ScrapedProject } from '@/lib/scrapers/types';

// Helper: minimal existing project
function makeExisting(overrides: Record<string, any> = {}) {
  return {
    id: 200,
    nombre: 'Existing Fund',
    institucion: 'TEST',
    monto: 100000,
    fecha_cierre: '2026-12-31',
    estado: 'Abierto',
    categoria: 'Nacional',
    url_bases: 'https://example.com',
    ...overrides,
  };
}

// Helper: minimal scraped project
function makeScraped(overrides: Partial<ScrapedProject> = {}): ScrapedProject {
  return {
    sourceId: 'test:fund-abc',
    nombre: 'Scraped Fund',
    institucion: 'TEST',
    monto: 0,
    fecha_cierre: new Date('2026-12-31'),
    estado: 'Abierto',
    categoria: 'Nacional',
    url_bases: 'https://test.cl/fund',
    regiones: ['Todas'],
    beneficiarios: ['Agricultores'],
    objetivo: 'Test objective',
    ...overrides,
  };
}

describe('scrapedToProject', () => {
  it('converts ScrapedProject to Project shape with assigned id', () => {
    const scraped = makeScraped();
    const result = scrapedToProject(scraped, 300);

    expect(result.id).toBe(300);
    expect(result.sourceId).toBe('test:fund-abc');
    expect(result.nombre).toBe('Scraped Fund');
    expect(result.fecha_cierre).toBe('2026-12-31');
    expect(result.estado).toBe('Abierto');
  });

  it('formats fecha_cierre as YYYY-MM-DD string', () => {
    const scraped = makeScraped({ fecha_cierre: new Date('2026-06-15T10:30:00Z') });
    const result = scrapedToProject(scraped, 1);
    expect(result.fecha_cierre).toBe('2026-06-15');
  });
});

describe('mergeScrapedIntoProjects', () => {
  it('appends new scraped projects with incremented ids', () => {
    const existing = [makeExisting({ id: 180 })];
    const scraped = [makeScraped({ sourceId: 'test:new-one' })];

    const merged = mergeScrapedIntoProjects(existing, scraped);

    expect(merged).toHaveLength(2);
    expect(merged[1].id).toBe(181);
    expect(merged[1].sourceId).toBe('test:new-one');
  });

  it('updates existing project when sourceId matches', () => {
    const existing = [
      makeExisting({ id: 150, sourceId: 'test:existing', nombre: 'Old Name', monto: 50000 }),
    ];
    const scraped = [
      makeScraped({ sourceId: 'test:existing', nombre: 'Updated Name', monto: 99000 }),
    ];

    const merged = mergeScrapedIntoProjects(existing, scraped);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(150); // preserves id
    expect(merged[0].nombre).toBe('Updated Name');
    expect(merged[0].monto).toBe(99000);
  });

  it('preserves manual entries (no sourceId) untouched', () => {
    const manual = makeExisting({ id: 101, nombre: 'Manual Entry' });
    const scraped = [makeScraped({ sourceId: 'test:auto' })];

    const merged = mergeScrapedIntoProjects([manual], scraped);

    expect(merged).toHaveLength(2);
    expect(merged[0]).toEqual(manual); // untouched
  });

  it('auto-marks expired entries as Cerrado', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const scraped = [
      makeScraped({
        sourceId: 'test:expired',
        fecha_cierre: pastDate,
        estado: 'Abierto', // scraper says open but date is past
      }),
    ];

    const merged = mergeScrapedIntoProjects([], scraped);

    expect(merged[0].estado).toBe('Cerrado');
  });

  it('handles empty scraped array without modifying existing', () => {
    const existing = [makeExisting({ id: 101 }), makeExisting({ id: 102 })];
    const merged = mergeScrapedIntoProjects(existing, []);
    expect(merged).toEqual(existing);
  });
});
