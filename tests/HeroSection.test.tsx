import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/HeroSection';

describe('HeroSection', () => {
  it('prioriza explorar oportunidades y mantiene la alerta como texto contextual', () => {
    render(
      <HeroSection
        stats={{ total: 10, abiertas: 6, internacionales: 3, urgentes: 2 }}
      />,
    );

    expect(screen.getByRole('link', { name: /Explorar 10 oportunidades/i })).toHaveAttribute(
      'href',
      '#convocatorias',
    );
    expect(screen.getByText('2 oportunidades cierran pronto')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cierran pronto/i })).not.toBeInTheDocument();
  });
});
