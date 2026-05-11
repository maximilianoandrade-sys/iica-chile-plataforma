import { fireEvent, render, screen } from '@testing-library/react';
import SearchableSelect from '@/components/SearchableSelect';

describe('SearchableSelect', () => {
  it('expone listbox y opciones con semantica accesible', () => {
    render(
      <SearchableSelect
        options={['Chile', 'Peru', 'Argentina']}
        value="Chile"
        onChange={() => undefined}
      />
    );

    const trigger = screen.getByRole('button', { name: /Chile/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Peru' })).toBeInTheDocument();
  });

  it('permite cerrar el desplegable con Escape', () => {
    render(
      <SearchableSelect
        options={['Chile', 'Peru', 'Argentina']}
        value="Chile"
        onChange={() => undefined}
      />
    );

    const trigger = screen.getByRole('button', { name: /Chile/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
