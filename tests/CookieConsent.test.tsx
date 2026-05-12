import { render, screen } from '@testing-library/react';
import CookieConsent from '@/components/CookieConsent';

describe('CookieConsent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('enlaza la politica de privacidad a la ruta legal', () => {
    render(<CookieConsent />);

    expect(screen.getByRole('link', { name: /Pol[ií]tica de Privacidad/i })).toHaveAttribute('href', '/legal/privacidad');
  });
});
