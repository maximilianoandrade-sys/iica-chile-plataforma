import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectFilters } from '@/components/ProjectFilters';
import type { FilterCounts } from '@/components/ProjectFilters';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/pipeline',
}));

const filterCounts: FilterCounts = {
  estado: { Abierta: 10, Cerrada: 5 },
  institucion: { FONTAGRO: 8, FAO: 4, BID: 3 },
  region: { Metropolitana: 6, Valparaíso: 3 },
  ambito: { Nacional: 7, Internacional: 5 },
};

describe('ProjectFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el conteo de resultados', () => {
    render(<ProjectFilters filterCounts={filterCounts} totalCount={50} filteredCount={15} />);

    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('renderiza el campo de búsqueda con aria-label', () => {
    render(<ProjectFilters filterCounts={filterCounts} totalCount={50} filteredCount={15} />);

    const input = screen.getByRole('searchbox', { name: /buscar oportunidades/i });
    expect(input).toBeInTheDocument();
  });

  it('no muestra botón limpiar filtros sin filtros activos', () => {
    render(<ProjectFilters filterCounts={filterCounts} totalCount={50} filteredCount={15} />);

    expect(screen.queryByText(/Limpiar filtros/)).not.toBeInTheDocument();
  });

  it('renderiza opciones de estado', () => {
    render(<ProjectFilters filterCounts={filterCounts} totalCount={50} filteredCount={15} />);

    expect(screen.getByText(/Abierta/)).toBeInTheDocument();
  });

  it('renderiza instituciones del filterCounts', () => {
    render(<ProjectFilters filterCounts={filterCounts} totalCount={50} filteredCount={15} />);

    expect(screen.getByText(/FONTAGRO/)).toBeInTheDocument();
  });
});
