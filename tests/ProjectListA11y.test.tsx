import { fireEvent, render, screen } from '@testing-library/react';
import ProjectList from '@/components/ProjectList';
import React from 'react';

const pushMock = jest.fn();
let mockSearchParams = new URLSearchParams('');

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react') as typeof import('react');
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()] as const,
  };
});

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

  it('renders results as a semantic list region', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByRole('list', { name: /Resultados de oportunidades/i })).toBeInTheDocument();
  });

  it('has live region for result count', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByText(/Mostrando 1 de 1 oportunidades/i)).toHaveAttribute('aria-live', 'polite');
  });

  it('announces pending updates while transitioning', () => {
    jest.spyOn(React, 'useTransition').mockReturnValue([true, (cb: () => void) => cb()]);
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByText(/Actualizando resultados/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Contenedor de resultados/i })).toHaveAttribute('aria-busy', 'true');
  });

  it('shows strict relevance badge by default', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByText(/Solo Chile \(estricto\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver todas/i })).toBeInTheDocument();
  });

  it('shows active filters and clear action in empty state', () => {
    render(
      <ProjectList
        projects={[]}
        filterCounts={filterCounts}
        totalCount={1}
        activeFilterLabels={['Búsqueda: "fia"', 'Estado: Abierta']}
      />
    );

    expect(screen.getByText(/No encontramos oportunidades con estos filtros/i)).toBeInTheDocument();
    expect(screen.getByText(/^Filtros activos$/i)).toBeInTheDocument();
    expect(screen.getByText('Búsqueda: "fia"')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(clearButton);
    expect(pushMock).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('offers include-international action in empty strict mode', () => {
    render(<ProjectList projects={[]} filterCounts={filterCounts} totalCount={0} />);

    const expandButton = screen.getByRole('button', { name: /Incluir internacionales/i });
    fireEvent.click(expandButton);

    expect(pushMock).toHaveBeenCalledWith('/?relevanceMode=all', { scroll: false });
  });

  it('offers return-to-chile action in empty all mode', () => {
    mockSearchParams = new URLSearchParams('relevanceMode=all');
    render(<ProjectList projects={[]} filterCounts={filterCounts} totalCount={0} />);

    const strictButton = screen.getByRole('button', { name: /Volver a Solo Chile/i });
    fireEvent.click(strictButton);

    expect(pushMock).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('shows active-filter summary strip with reset action', () => {
    render(
      <ProjectList
        projects={projects}
        filterCounts={filterCounts}
        totalCount={1}
        activeFilterLabels={['Estado: Abierta', 'Región: Metropolitana']}
      />
    );

    expect(screen.getByText(/2 filtros activos/i)).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /Restablecer vista/i });
    fireEvent.click(resetButton);

    expect(pushMock).toHaveBeenCalledWith('/', { scroll: false });
  });
});
