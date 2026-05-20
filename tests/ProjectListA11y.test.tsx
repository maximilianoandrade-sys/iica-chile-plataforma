import { render, screen } from '@testing-library/react';
import ProjectList from '@/components/ProjectList';
import type { Project } from '@/lib/data';
import type { FilterCounts } from '@/components/ProjectFilters';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} src={props.src || ''} />;
  };
});

const project: Project = {
  id: 1001,
  nombre: 'Programa Piloto de Riego',
  institucion: 'FONTAGRO',
  monto: 12000000,
  fecha_cierre: '2026-12-31',
  estado: 'Abierto',
  categoria: 'Innovación',
  url_bases: 'https://example.com/bases',
  resumen: {
    observaciones: 'Incluye componente territorial.',
  },
};

const filterCounts: FilterCounts = {
  estado: { Abierta: 1 },
  institucion: { FONTAGRO: 1 },
  region: {},
  ambito: {},
};

describe('ProjectList accesibilidad', () => {
  it('renderiza filas de proyecto', () => {
    render(<ProjectList projects={[project]} filterCounts={filterCounts} totalCount={1} />);

    expect(screen.getByText('Programa Piloto de Riego')).toBeInTheDocument();
  });
});
