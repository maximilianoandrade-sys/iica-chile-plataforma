import { render, screen } from '@testing-library/react';
import ProjectList from '@/components/ProjectList';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}));

const projects = [
  {
    id: 1, nombre: 'Test Project', institucion: 'CORFO', monto: 100000000,
    fecha_cierre: '2026-12-01', estado: 'active', categoria: 'Test',
    url_bases: 'https://example.com', estadoPostulacion: 'Abierta' as const,
  },
];

const filterCounts = {
  estado: { Abierta: 1 }, institucion: { CORFO: 1 },
  region: {}, ambito: { Nacional: 1 },
};

describe('ProjectList accessibility', () => {
  it('has search input with label', () => {
    render(<ProjectList projects={projects} filterCounts={filterCounts} totalCount={1} />);
    expect(screen.getByRole('searchbox', { name: /Buscar oportunidades/i })).toBeInTheDocument();
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
});
