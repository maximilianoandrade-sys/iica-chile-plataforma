import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DiscoveriesClient from '@/app/admin/discoveries/DiscoveriesClient';

const baseItem = {
  id: 1,
  nombre: 'Proyecto Piloto',
  institucion: 'IICA',
  url_bases: 'https://example.com/bases',
  notasInternas: 'Resumen IA',
};

describe('DiscoveriesClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra mensaje de error amigable cuando la acción falla', async () => {
    (global.fetch as jest.Mock) = jest.fn(() => Promise.resolve({ ok: false, statusText: 'Bad Request' }));

    render(<DiscoveriesClient initial={[baseItem]} />);

    fireEvent.click(screen.getByLabelText(/Aprobar Proyecto Piloto/i));

    await waitFor(() => {
      expect(screen.getByText(/No pudimos actualizar este proyecto/i)).toBeInTheDocument();
    });
  });

  it('permite seleccionar varios y ejecutar aprobacion masiva', async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });

    render(
      <DiscoveriesClient
        initial={[
          baseItem,
          {
            ...baseItem,
            id: 2,
            nombre: 'Proyecto Dos',
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Seleccionar Proyecto Piloto/i));
    fireEvent.click(screen.getByLabelText(/Seleccionar Proyecto Dos/i));
    fireEvent.click(screen.getByRole('button', { name: /Aprobar seleccionados/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/discoveries/bulk/action',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
