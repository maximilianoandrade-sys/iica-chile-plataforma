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

  it('renders main search and basic filter controls', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicaciones/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instituciones/i)).toBeInTheDocument();
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

  it('expands advanced filters and applies ambito in real time', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.click(screen.getByRole('button', { name: /Filtros avanzados/i }));

    const scopeSelect = screen.getByLabelText(/Ambito/i);
    fireEvent.change(scopeSelect, { target: { value: 'Internacional' } });

    expect(pushMock).toHaveBeenCalledWith('/?ambito=Internacional', { scroll: false });
  });

  it('resets all filters with dedicated action', () => {
    mockSearchParams = new URLSearchParams('q=fia&estado=Abierta');
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.click(screen.getByRole('button', { name: /Restablecer todo/i }));

    expect(pushMock).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('orders region options in Chile official order, not alphabetical', () => {
    const regionSortedByName = {
      ...mockFilterCounts,
      region: {
        Magallanes: 1,
        Coquimbo: 1,
        Atacama: 1,
        Metropolitana: 1,
      },
    };

    render(<FilterChips filterCounts={regionSortedByName} />);

    const regionSelect = screen.getByLabelText(/Ubicaciones/i);
    const optionTexts = Array.from(regionSelect.querySelectorAll('option')).map((option) => option.textContent);
    expect(optionTexts).toEqual(['Atacama', 'Coquimbo', 'Metropolitana', 'Magallanes']);
  });
});
