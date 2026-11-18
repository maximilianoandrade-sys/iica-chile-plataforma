import { render, screen, fireEvent } from '@testing-library/react';
import { EligibilityAssistant } from '@/components/EligibilityAssistant';
import type { Project } from '@/lib/project-utils';

const mockProject: Project = {
  id: 101,
  nombre: 'Start-Up Chile – Ignite 13',
  institucion: 'CORFO',
  monto: 30000000,
  montoTexto: 'Hasta $30M',
  fecha_cierre: '2026-11-24',
  estado: 'Abierto',
  categoria: 'Programa',
  url_bases: 'https://corfo.cl/ignite',
  regiones: ['Nacional (Todas las Regiones)'],
  beneficiarios: ['PYME', 'Empresa', 'Startup'],
  tipos_solicitante: ['Persona Jurídica', 'PYME'],
  requiere_cofinanciamiento: false,
};

describe('EligibilityAssistant', () => {
  it('renders correctly with default values', () => {
    render(<EligibilityAssistant project={mockProject} />);
    expect(screen.getByText(/Asistente de Elegibilidad/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Perfil del Postulante/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Ubicación \/ Región/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Aporte Propio Disponible/i)).toBeInTheDocument();
  });

  it('evaluates profile and displays score and verdict', () => {
    render(<EligibilityAssistant project={mockProject} />);
    expect(screen.getByText(/Puntaje de afinidad:/i)).toBeInTheDocument();
  });

  it('updates evaluation when changing applicant type', () => {
    render(<EligibilityAssistant project={mockProject} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'pyme' } });
    expect(screen.getByText(/Preevaluación favorable/i)).toBeInTheDocument();
  });
});
