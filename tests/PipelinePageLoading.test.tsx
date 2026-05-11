import { render, screen } from '@testing-library/react';
import React from 'react';
import PipelinePage from '@/app/pipeline/page';

jest.mock('@/lib/pipelineManager', () => ({
  getPipelineTasks: jest.fn(() => []),
  savePipelineTasks: jest.fn(),
}));

describe('PipelinePage', () => {
  it('muestra estado de carga inicial en vez de retornar null', () => {
    jest.spyOn(React, 'useEffect').mockImplementation(() => {
      return undefined;
    });

    render(<PipelinePage />);

    expect(screen.getByText(/Cargando pipeline institucional/i)).toBeInTheDocument();

    (React.useEffect as jest.Mock).mockRestore();
  });
});
