import { fireEvent, render, screen } from '@testing-library/react';
import ErrorPage from '@/app/error';

describe('ErrorPage', () => {
  it('ofrece acciones para recuperarse y volver al inicio', () => {
    const reset = jest.fn();

    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: /Intentar nuevamente/i }));
    expect(reset).toHaveBeenCalled();

    expect(screen.getByRole('link', { name: /Volver al inicio/i })).toHaveAttribute('href', '/');
  });
});
