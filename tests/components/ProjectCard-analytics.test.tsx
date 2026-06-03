import { fireEvent, render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/ProjectCard';

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

const project = {
  id: 77,
  nombre: 'Proyecto Analitica',
  institucion: 'CORFO',
  monto: 1000000,
  fecha_cierre: '2030-01-01',
  estado: 'active',
  categoria: 'Riego',
  url_bases: 'https://example.com',
  estadoPostulacion: 'Abierta' as const,
};

describe('ProjectCard analytics', () => {
  it('tracks project_click when user opens detail', async () => {
    const { trackEvent } = await import('@/lib/analytics');

    render(<ProjectCard project={project} />);
    fireEvent.click(screen.getByRole('link', { name: /Proyecto Analitica/i }));

    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'project_click',
        category: 'Search',
      }),
    );
  });
});
