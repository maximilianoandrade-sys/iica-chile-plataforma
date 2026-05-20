import { render, screen } from '@testing-library/react';
import { FilterChips } from '@/components/FilterChips';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}));

const mockFilterCounts = {
  estado: { Abierta: 10, 'Próxima': 3, Cerrada: 5 },
  institucion: { CORFO: 8, FIA: 5, INDAP: 4, FONTAGRO: 2 },
  region: { Metropolitana: 6, 'Biobío': 4 },
  ambito: { Nacional: 10, Regional: 5, Internacional: 3 },
};

describe('FilterChips', () => {
  it('renders estado chips', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('button', { name: /Abiertas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Próximas/i })).toBeInTheDocument();
  });

  it('renders top institution chips', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('button', { name: /CORFO/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FIA/i })).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('renders "Más filtros" button', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('button', { name: /Más filtros/i })).toBeInTheDocument();
  });
});
