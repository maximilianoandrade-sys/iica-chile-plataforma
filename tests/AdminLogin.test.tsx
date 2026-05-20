import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminLogin from '@/app/admin/login/page';

// Mock window.location.href assignment
const locationHrefSpy = jest.fn();
const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: '' },
  });
  Object.defineProperty(window.location, 'href', {
    set: locationHrefSpy,
    get: () => 'http://localhost:3000/admin/login',
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

describe('AdminLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deshabilita el boton y muestra estado de carga durante login', async () => {
    (global.fetch as jest.Mock) = jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true }), 20);
        })
    );

    render(<AdminLogin />);

    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    expect(screen.getByRole('button', { name: /Verificando/i })).toBeDisabled();

    await waitFor(() => {
      expect(locationHrefSpy).toHaveBeenCalledWith('/admin/pipeline-dashboard');
    });
  });

  it('muestra un mensaje amigable cuando falla la red', async () => {
    (global.fetch as jest.Mock) = jest.fn(() => Promise.reject(new Error('network')));

    render(<AdminLogin />);

    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), { target: { value: 'secreta' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/problema de conexión/i)).toBeInTheDocument();
    });
  });
});
