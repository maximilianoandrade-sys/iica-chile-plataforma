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
    expect(screen.getByRole('combobox', { name: /Buscar oportunidades/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Más filtros/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abiertas/i })).toBeInTheDocument();
  });

  it('labels filters section for assistive tech', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);
    // Quick-filter chips expose their toggle state to assistive tech
    expect(screen.getByRole('button', { name: /Todos/i })).toHaveAttribute('aria-pressed');
    expect(screen.getByRole('button', { name: /Abiertas/i })).toHaveAttribute('aria-pressed');
  });

  it('allows collapsing and expanding filter controls', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.click(screen.getByRole('button', { name: /Más filtros/i }));
    expect(screen.getByLabelText(/Región/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Más filtros/i }));
    expect(screen.queryByLabelText(/Región/i)).not.toBeInTheDocument();
  });

  it('allows choosing all estados explicitly', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.click(screen.getByRole('button', { name: /Todos/i }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    const [href] = pushMock.mock.calls[0] as [string, { scroll: boolean }];
    expect(href).toContain('estado=all');
  });

  it('aplica busqueda en vivo con debounce y replace', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    const input = screen.getByRole('combobox', { name: /Buscar oportunidades/i });
    fireEvent.change(input, { target: { value: 'indap' } });

    expect(replaceMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(360);
    });

    expect(replaceMock).toHaveBeenCalledWith('/?q=indap', { scroll: false });
  });

  it('expands advanced filters and applies ambito in real time', () => {
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.click(screen.getByRole('button', { name: /Internacional/i }));

    expect(pushMock).toHaveBeenCalled();
    const [href] = pushMock.mock.calls[0] as [string, { scroll: boolean }];
    expect(href).toContain('ambito=Internacional');
  });

  it('resets all filters with dedicated action', () => {
    mockSearchParams = new URLSearchParams('q=fia&estado=Abierta');
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.click(screen.getByRole('button', { name: /Limpiar todo/i }));

    expect(pushMock).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('normalizes amount range when minimum exceeds maximum', () => {
    mockSearchParams = new URLSearchParams('minAmount=100&maxAmount=200');
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.change(screen.getByLabelText(/Monto mínimo/i), { target: { value: '300' } });

    expect(replaceMock).toHaveBeenCalled();
    const [href] = replaceMock.mock.calls[replaceMock.mock.calls.length - 1] as [string, { scroll: boolean }];
    expect(href).toContain('minAmount=300');
    expect(href).toContain('maxAmount=300');
  });

  it('normalizes date range when postedTill is earlier than postedFrom', () => {
    mockSearchParams = new URLSearchParams('postedFrom=2026-06-10&postedTill=2026-06-20');
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.change(screen.getByLabelText('Publicado hasta', { selector: 'input' }), { target: { value: '2026-06-01' } });

    expect(replaceMock).toHaveBeenCalled();
    const [href] = replaceMock.mock.calls[replaceMock.mock.calls.length - 1] as [string, { scroll: boolean }];
    expect(href).toContain('postedFrom=2026-06-01');
    expect(href).toContain('postedTill=2026-06-01');
  });

  it('removes one active filter chip without resetting all filters', () => {
    mockSearchParams = new URLSearchParams('q=fia&estado=Próxima');
    render(<FilterChips filterCounts={mockFilterCounts} />);

    fireEvent.click(screen.getByRole('button', { name: /Quitar filtro "fia"/i }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    const [href] = pushMock.mock.calls[0] as [string, { scroll: boolean }];
    expect(href).toContain('estado=Pr%C3%B3xima');
    expect(href).not.toContain('q=');
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
    fireEvent.click(screen.getByRole('button', { name: /Más filtros/i }));

    const regionSelect = screen.getByLabelText(/Región/i);
    const optionTexts = Array.from(regionSelect.querySelectorAll('option')).map((option) => option.textContent);
    expect(optionTexts).toEqual(['Todas las regiones', 'Atacama', 'Coquimbo', 'Metropolitana', 'Magallanes']);
  });
});
