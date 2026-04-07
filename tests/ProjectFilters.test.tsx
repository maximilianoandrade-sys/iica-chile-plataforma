import { render, screen, fireEvent } from '@testing-library/react';
import ProjectFilters from '@/components/ProjectFilters';
import { useRouter, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackSearch: jest.fn(),
  }),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('ProjectFilters', () => {
  const mockPush = jest.fn();
  const mockParams = new URLSearchParams();

  const defaultProps = {
    categories: ['Innovacion', 'Sostenibilidad', 'Tecnologia'],
    regions: ['Metropolitana', 'Valparaiso', 'Biobio'],
    beneficiaries: ['Agricultores', 'Emprendedores', 'ONGs'],
    institutions: ['FONTAGRO', 'FAO', 'BID'],
    counts: { filtered: 10, total: 50, open: 25 },
    dynamicSuggestions: [],
    zeroResultsSuggestions: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockPush,
      prefetch: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    } as any);
    mockUseSearchParams.mockReturnValue(mockParams);
  });

  it('debe renderizar el componente correctamente', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('debe mostrar el contador de resultados', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/de 50/)).toBeInTheDocument();
  });

  it('debe renderizar los chips de busqueda rapida', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    expect(screen.getByText('FONTAGRO')).toBeInTheDocument();
    expect(screen.getByText('FAO')).toBeInTheDocument();
    expect(screen.getByText('BID')).toBeInTheDocument();
  });

  it('debe renderizar las opciones de rol IICA', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    expect(screen.getByText(/IICA Ejecutor/)).toBeInTheDocument();
    expect(screen.getByText(/Implementador/)).toBeInTheDocument();
    expect(screen.getByText(/Asesor/)).toBeInTheDocument();
  });

  it('debe renderizar las opciones de ambito', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    expect(screen.getByText(/Internacional/)).toBeInTheDocument();
    expect(screen.getByText(/Nacional/)).toBeInTheDocument();
    expect(screen.getByText(/Regional/)).toBeInTheDocument();
  });

  it('debe renderizar las opciones de viabilidad', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    expect(screen.getByText(/Alta/)).toBeInTheDocument();
    expect(screen.getByText(/Media/)).toBeInTheDocument();
    expect(screen.getByText(/Baja/)).toBeInTheDocument();
  });

  it('debe tener boton de exportar CSV', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    const exportButton = screen.getByText(/Exportar CSV/);
    expect(exportButton).toBeInTheDocument();
    expect(exportButton.closest('a')).toHaveAttribute('download');
  });

  it('debe limpiar la busqueda al hacer click en la X', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test query' } });
    
    const clearButton = screen.getByLabelText(/Limpiar busqueda/i);
    fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
  });

  it('debe manejar el toggle de filtros avanzados', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    const advancedButton = screen.getByText(/Filtros avanzados/);
    expect(advancedButton).toBeInTheDocument();
    
    fireEvent.click(advancedButton);
    
    expect(screen.getByText(/Region/)).toBeInTheDocument();
    expect(screen.getByText(/Perfil/)).toBeInTheDocument();
    expect(screen.getByText(/Fuente/)).toBeInTheDocument();
  });

  it('debe mostrar boton de limpiar filtros cuando hay filtros activos', () => {
    const paramsWithFilters = new URLSearchParams({ q: 'test', category: 'Innovacion' });
    mockUseSearchParams.mockReturnValue(paramsWithFilters);
    
    render(<ProjectFilters {...defaultProps} />);
    
    const clearButton = screen.getByText(/Limpiar filtros/);
    expect(clearButton).toBeInTheDocument();
  });

  it('debe tener atributos de accesibilidad correctos', () => {
    render(<ProjectFilters {...defaultProps} />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Buscar oportunidades IICA');
  });
});
