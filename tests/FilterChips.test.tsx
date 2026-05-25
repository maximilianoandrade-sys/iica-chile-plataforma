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
});
