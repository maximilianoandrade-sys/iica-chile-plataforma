import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, ...props }: any) => <img {...props} alt={props.alt} />,
}));

describe('Footer', () => {
  it('muestra el logo institucional de IICA en el footer', () => {
    render(<Footer />);

    expect(screen.getByRole('img', { name: /Logo oficial IICA Chile/i })).toBeInTheDocument();
    expect(screen.getByText(/Enlaces Útiles/i)).toBeInTheDocument();
  });

  it('incluye enlace a política de privacidad', () => {
    render(<Footer />);
    const privacidad = screen.getByRole('link', { name: /Política de Privacidad/i });
    expect(privacidad).toHaveAttribute('href', '/legal/privacidad');
  });

  it('usa redes oficiales verificables para iconos sociales', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /linkedin iica/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/iica/',
    );
    expect(screen.getByRole('link', { name: /x iica/i })).toHaveAttribute(
      'href',
      'https://x.com/IABOREA',
    );
  });
});
