import { fireEvent, render, screen } from '@testing-library/react';
import ProjectList from '@/components/ProjectList';

const pushMock = jest.fn();
let mockSearchParams = new URLSearchParams('');

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

const projects = [
  {
    id: 1, nombre: 'Test Project', institucion: 'CORFO', monto: 100000000,
    fecha_cierre: '2026-12-01', estado: 'active', categoria: 'Test',
    url_bases: 'https://example.com', estadoPostulacion: 'Abierta' as const,
    region: 'Metropolitana',
  },
];

const filterCounts = {
  estado: { Abierta: 1 }, institucion: { CORFO: 1 },
  region: { Metropolitana: 1 }, categoria: { Test: 1 }, ambito: { Nacional: 1 },
};

describe('ProjectList accessibility', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams('');
    pushMock.mockReset();
  });

  it('defaults to relevance sort when query is active', () => {
    mockSearchParams = new URLSearchParams('q=riego');
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByRole('combobox', { name: /Ordenar por/i })).toHaveValue('relevance');
  });

  it('renders structured filter controls', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByRole('searchbox', { name: /Buscar oportunidades/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toHaveValue('Abierta');
    expect(screen.getByLabelText(/Ubicaciones/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instituciones/i)).toBeInTheDocument();
  });

  it('has sort control with label', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByRole('combobox', { name: /Ordenar por/i })).toBeInTheDocument();
  });

  it('renders project cards as articles', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('has live region for result count', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByText(/1 de 1 oportunidades/)).toHaveAttribute('aria-live', 'polite');
  });

  it('shows active filters and clear action in empty state', () => {
    render(
      <ProjectList
        projects={[]}
        filterCounts={filterCounts}
        totalCount={1}
        activeFilterLabels={['Busqueda: "fia"', 'Estado: Abierta']}
      />
    );

    expect(screen.getByText(/No se encontraron oportunidades/i)).toBeInTheDocument();
    expect(screen.getByText(/^Filtros activos$/i)).toBeInTheDocument();
    expect(screen.getByText('Busqueda: "fia"')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(clearButton);
    expect(pushMock).toHaveBeenCalledWith('/', { scroll: false });
  });
});
