import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroSection } from '@/components/HeroSection';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('HeroSection', () => {
  it('usa URL válida para CTA de cierran pronto con query + hash', async () => {
    render(
      <HeroSection
        stats={{ total: 10, abiertas: 6, internacionales: 3, urgentes: 2 }}
      />,
    );

    const urgentButton = screen.getByRole('button', { name: /cierran pronto/i });
    fireEvent.click(urgentButton);

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        '/?estado=Abierta&sort=date_asc#convocatorias',
      ),
    );
  });
});
