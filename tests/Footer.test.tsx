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
    expect(screen.getByText(/Contacto IICA Chile/i)).toBeInTheDocument();
  });

  it('usa enlace canonico de FONTAGRO', () => {
    render(<Footer />);
    const fontagro = screen.getByRole('link', { name: /FONTAGRO/i });
    expect(fontagro).toHaveAttribute('href', 'https://www.fontagro.org/es/convocatorias/');
    expect(fontagro).toHaveAttribute('target', '_blank');
  });

  it('usa redes oficiales verificables para iconos sociales', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /linkedin iica/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/iica/',
    );
    expect(screen.getByRole('link', { name: /x iica noticias/i })).toHaveAttribute(
      'href',
      'https://x.com/IICAnoticias',
    );
  });
});
