import { act, fireEvent, render, screen } from '@testing-library/react';
import { FilterChips } from '@/components/FilterChips';

const pushMock = jest.fn();
const replaceMock = jest.fn();
let mockSearchParams = new URLSearchParams('');

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

const mockFilterCounts = {
  estado: { Abierta: 10, 'Próxima': 3, Cerrada: 5 },
  institucion: { CORFO: 8, FIA: 5, INDAP: 4, FONTAGRO: 2 },
  region: { Metropolitana: 6, 'Biobío': 4 },
  categoria: { Riego: 4, Innovacion: 3 },
  ambito: { Nacional: 10, Regional: 5, Internacional: 3 },
};

describe('FilterChips', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams('');
    pushMock.mockReset();
    replaceMock.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders search input and estado chips', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('searchbox', { name: /Buscar oportunidades/i })).toBeInTheDocument();
    // Estado chips rendered as buttons
    expect(screen.getByRole('button', { name: /Abiertas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Próximas/i })).toBeInTheDocument();
  });

  it('renders top institution chips', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('button', { name: 'CORFO' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FIA' })).toBeInTheDocument();
  });

  it('renders top region chips', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('button', { name: 'Metropolitana' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Biobío' })).toBeInTheDocument();
  });

  it('aplica busqueda en vivo con debounce y replace', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'indap' } });

    expect(replaceMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(360);
    });

    expect(replaceMock).toHaveBeenCalledWith('/?q=indap', { scroll: false });
  });

  it('expands advanced filters panel on "Más filtros" click', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    const toggleBtn = screen.getByRole('button', { name: /Más filtros/i });
    fireEvent.click(toggleBtn);

    // Ambito chips appear in expanded panel
    expect(screen.getByRole('button', { name: 'Nacional' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Regional' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Internacional' })).toBeInTheDocument();
  });

  it('selects ambito chip and navigates', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    // Open panel first
    fireEvent.click(screen.getByRole('button', { name: /Más filtros/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Internacional' }));

    expect(pushMock).toHaveBeenCalledWith('/?ambito=Internacional', { scroll: false });
  });

  it('resets all filters with "Limpiar" button', () => {
    mockSearchParams = new URLSearchParams('estado=Abierta');
    render(<FilterChips filterCounts={mockFilterCounts} />);

    // Use exact name to avoid matching "Limpiar búsqueda" on the search box
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(pushMock).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('renders top regions sorted by count (most first)', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    // Metropolitana (6) appears before Biobío (4) in the DOM
    const buttons = screen.getAllByRole('button').map((b) => b.textContent?.trim());
    const metroIdx = buttons.findIndex((t) => t === 'Metropolitana');
    const biobioIdx = buttons.findIndex((t) => t === 'Biobío');
    expect(metroIdx).toBeLessThan(biobioIdx);
  });
});
