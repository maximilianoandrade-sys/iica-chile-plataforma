import { render, screen, fireEvent } from '@testing-library/react';
import CookieConsent from '@/components/CookieConsent';

describe('CookieConsent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('enlaza la politica de privacidad a la ruta legal', () => {
    render(<CookieConsent />);

    expect(screen.getByRole('link', { name: /Pol[ií]tica de Privacidad/i })).toHaveAttribute('href', '/legal/privacidad');
  });

  it('muestra el banner cuando no hay consent almacenado', () => {
    render(<CookieConsent />);
    expect(screen.getByText(/Respetamos tu privacidad/)).toBeInTheDocument();
  });

  it('oculta el banner cuando ya existe consent válido', () => {
    localStorage.setItem('iica_cookie_consent', JSON.stringify({ essential: true, analytics: true, timestamp: Date.now() }));
    render(<CookieConsent />);
    expect(screen.queryByText(/Respetamos tu privacidad/)).not.toBeInTheDocument();
  });

  it('muestra el banner cuando el valor almacenado es corrupto', () => {
    localStorage.setItem('iica_cookie_consent', 'invalid-json');
    render(<CookieConsent />);
    expect(screen.getByText(/Respetamos tu privacidad/)).toBeInTheDocument();
  });

  it('almacena consent granular al aceptar', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole('button', { name: /Aceptar todo/i }));

    const stored = JSON.parse(localStorage.getItem('iica_cookie_consent')!);
    expect(stored.essential).toBe(true);
    expect(stored.analytics).toBe(true);
    expect(typeof stored.timestamp).toBe('number');
  });

  it('almacena consent granular al rechazar opcionales', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole('button', { name: /Rechazar opcionales/i }));

    const stored = JSON.parse(localStorage.getItem('iica_cookie_consent')!);
    expect(stored.essential).toBe(true);
    expect(stored.analytics).toBe(false);
    expect(typeof stored.timestamp).toBe('number');
  });
});
