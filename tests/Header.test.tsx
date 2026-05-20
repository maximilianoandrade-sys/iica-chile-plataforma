import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('Header', () => {
  it('muestra accesos clave en la navegacion de escritorio', () => {
    render(<Header />);

    const nav = screen.getByRole('navigation', { name: /Navegación principal/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Consultores/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sobre IICA/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mi Maletín/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar Oportunidades/i })).toBeInTheDocument();
    // Admin link removed from public nav (security fix)
    expect(screen.queryByRole('link', { name: /^Admin$/i })).not.toBeInTheDocument();
  });
});
