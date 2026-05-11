import { render, screen } from '@testing-library/react';
import AdminLayout from '@/app/admin/layout';

describe('AdminLayout', () => {
  it('incluye enlaces de descubrimientos y fuentes en navegacion', () => {
    render(
      <AdminLayout>
        <div>Contenido</div>
      </AdminLayout>
    );

    expect(screen.getByRole('link', { name: /Descubrimientos/i })).toHaveAttribute('href', '/admin/discoveries');
    expect(screen.getByRole('link', { name: /Fuentes/i })).toHaveAttribute('href', '/admin/sources');
  });
});
