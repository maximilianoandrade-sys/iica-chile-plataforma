import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/HeroSection';

describe('HeroSection', () => {
  it('usa URL válida para CTA de cierran pronto con query + hash', () => {
    render(
      <HeroSection
        stats={{ total: 10, abiertas: 6, internacionales: 3, urgentes: 2 }}
      />,
    );

    const urgentLink = screen.getByRole('link', { name: /Cierran pronto/i });
    expect(urgentLink).toHaveAttribute('href', '/?estado=Abierta&sort=date_asc#convocatorias');
  });
});
