import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, ...props }: any) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('Header', () => {
  it('muestra accesos clave en la navegacion de escritorio', () => {
    render(<Header />);

    const nav = screen.getByRole('navigation', { name: /Navegación principal/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Oportunidades/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Sobre IICA/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Fuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar Oportunidades/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Logo oficial IICA Chile/i })).toBeInTheDocument();
    const logoLink = screen.getByRole('link', { name: /Logo oficial IICA Chile/i });
    expect(logoLink).toHaveAttribute('href', 'https://iica.int/es/countries/chile-es/');
    expect(logoLink).toHaveAttribute('target', '_blank');
    expect(logoLink).toHaveAttribute('rel', 'noopener noreferrer');
    // Removed zombie features
    expect(screen.queryByRole('link', { name: /Consultores/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mi Maletín/i })).not.toBeInTheDocument();
    // Admin link removed from public nav (security fix)
    expect(screen.queryByRole('link', { name: /^Admin$/i })).not.toBeInTheDocument();
  });
});
