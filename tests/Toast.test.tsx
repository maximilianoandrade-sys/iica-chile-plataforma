import { render, screen } from '@testing-library/react';
import Toast from '@/components/ui/Toast';

describe('Toast', () => {
  it('usa announcement accesible para mensajes de exito', () => {
    render(<Toast message="Guardado" onClose={() => undefined} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('usa announcement prioritario para errores', () => {
    render(<Toast message="Error" type="error" onClose={() => undefined} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
