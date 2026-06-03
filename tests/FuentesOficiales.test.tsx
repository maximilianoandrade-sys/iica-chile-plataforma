import { render, screen, fireEvent } from '@testing-library/react';
import FuentesOficiales from '@/components/FuentesOficiales';

const mockCounts = { CNR: 4, INDAP: 6, FIA: 3, CORFO: 4, PNUD: 0, FAO: 0, FIDA: 0, FONTAGRO: 0 };

describe('FuentesOficiales', () => {
  it('renders section heading', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} />);
    expect(screen.getByRole('heading', { name: /fuentes oficiales/i })).toBeInTheDocument();
  });

  it('shows total oportunidades activas from dashboard prop', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} totalActiveOpportunities={72} />);
    expect(screen.getByText('72 oportunidades activas')).toBeInTheDocument();
  });

  it('falls back to institution counts when dashboard total is not provided', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} />);
    expect(screen.getByText('17 oportunidades activas')).toBeInTheDocument();
  });

  it('renders without prop (uses defaults)', () => {
    render(<FuentesOficiales />);
    // Should render without crashing, using default fondosActivos from FUENTES
    expect(screen.getByRole('heading', { name: /fuentes oficiales/i })).toBeInTheDocument();
  });

  it('uses updated CORFO official URL', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} />);
    const trigger = screen.getByRole('button', { name: /corfo/i });
    fireEvent.click(trigger);
    const corfoSite = screen.getAllByRole('link', { name: /sitio web/i })[0];
    expect(corfoSite).toHaveAttribute('href', 'https://www.corfo.gob.cl/sites/cpp/convocatorias_programas_innovacion/');
  });

  it('shows dynamic update label from pipeline timestamp', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} lastUpdatedAt="2026-05-25T19:45:00.000Z" />);
    expect(screen.getByText(/Actualizado/i)).toBeInTheDocument();
  });

  it('uses normalized FONTAGRO url', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} />);
    const trigger = screen.getByRole('button', { name: /fontagro/i });
    fireEvent.click(trigger);
    const links = screen.getAllByRole('link', { name: /sitio web/i });
    const fontagroSite = links.find((link) => link.getAttribute('href')?.includes('fontagro'));
    expect(fontagroSite).toHaveAttribute('href', 'https://www.fontagro.org/es');
  });
});
