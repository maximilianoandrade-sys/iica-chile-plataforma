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
});
