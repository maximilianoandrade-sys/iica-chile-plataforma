import { render, screen, fireEvent } from '@testing-library/react';
import FuentesOficiales from '@/components/FuentesOficiales';

const mockCounts = { CNR: 4, INDAP: 6, FIA: 3, CORFO: 4, PNUD: 0, FAO: 0, FIDA: 0, FONTAGRO: 0 };

describe('FuentesOficiales', () => {
  it('renders section heading', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} />);
    expect(screen.getByRole('heading', { name: /fuentes oficiales/i })).toBeInTheDocument();
  });

  it('shows total fondos activos from counts prop', () => {
    render(<FuentesOficiales institutionCounts={mockCounts} />);
    // Total = 4+6+3+4 = 17
    expect(screen.getByText('17 fondos activos')).toBeInTheDocument();
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
    expect(corfoSite).toHaveAttribute('href', 'https://www.corfo.gob.cl');
  });
});
