import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('Header', () => {
  it('muestra accesos clave en la navegacion de escritorio', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /Consultores/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sobre IICA/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Admin/i })).toHaveAttribute('href', '/admin/login');
  });
});
