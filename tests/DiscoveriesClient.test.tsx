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

    fireEvent.click(screen.getByRole('button', { name: /Aprobar/i }));

    await waitFor(() => {
      expect(screen.getByText(/No pudimos actualizar este proyecto/i)).toBeInTheDocument();
    });
  });
});
