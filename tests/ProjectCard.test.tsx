import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/ProjectCard';

const mockProject = {
  id: 1,
  nombre: 'Programa de Riego Tecnificado',
  institucion: 'CORFO',
  monto: 150000000,
  fecha_cierre: '2026-06-01',
  estado: 'active',
  categoria: 'Infraestructura',
  url_bases: 'https://example.com',
  ambito: 'Nacional' as const,
  estadoPostulacion: 'Abierta' as const,
  regiones: ['Biobío', 'Maule'],
};

describe('ProjectCard', () => {
  it('renders project name as link', () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole('link', { name: /Programa de Riego/i });
    expect(link).toHaveAttribute('href', '/proyecto/1');
  });

  it('renders institution name', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('CORFO')).toBeInTheDocument();
  });

  it('renders formatted monto', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/\$150M CLP/)).toBeInTheDocument();
  });

  it('renders region', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/Biobío/)).toBeInTheDocument();
  });

  it('renders urgency deadline', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/Cierra/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite:/i)).toBeInTheDocument();
  });

  it('applies reduced opacity for closed projects', () => {
    const closed = { ...mockProject, estadoPostulacion: 'Cerrada' as const };
    const { container } = render(<ProjectCard project={closed} />);
    expect(container.firstChild).toHaveClass('opacity-60');
  });

  it('has accessible article role', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('makes the entire card clickable via stretched link', () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole('link', { name: mockProject.nombre });
    expect(link.className).toContain('stretched-link');
  });
});
