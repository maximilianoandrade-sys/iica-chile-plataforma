import { fireEvent, render, screen } from '@testing-library/react';
import ProjectList from '@/components/ProjectList';
import { Project } from '@/lib/data';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/ProjectItem', () => ({
  ActionButton: () => <button type="button">Ver bases externas</button>,
  UrgencyBadge: ({ date }: { date: string }) => <span>{date}</span>,
}));

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} src={props.src || ''} />;
  };
});

const project: Project = {
  id: 1001,
  nombre: 'Programa Piloto de Riego',
  institucion: 'FONTAGRO',
  monto: 12000000,
  fecha_cierre: '2026-12-31',
  estado: 'Abierto',
  categoria: 'Innovación',
  url_bases: 'https://example.com/bases',
  resumen: {
    observaciones: 'Incluye componente territorial.',
  },
};

describe('ProjectList accesibilidad', () => {
  it('usa botones para cabeceras de ordenamiento', () => {
    render(<ProjectList projects={[project]} />);

    expect(screen.getByRole('button', { name: /Proyecto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Institución/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Cierre$/i })).toBeInTheDocument();
  });

  it('expone dialogo semantico en vista rapida', () => {
    render(<ProjectList projects={[project]} />);

    fireEvent.click(screen.getByLabelText(/Abrir panel de detalles/i));

    expect(screen.getByRole('dialog', { name: /Programa Piloto de Riego/i })).toBeInTheDocument();
  });
});
