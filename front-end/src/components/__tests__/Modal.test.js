import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalDesconected from '../modals/modal-desconected';

test('Renderiza modal', () => {
  const mockFn = jest.fn();
  render(<ModalDesconected isOpen={true} onConfirm={mockFn} />);
  expect(screen.getByText('Sessão Expirada')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /ok/i }));
  expect(mockFn).toHaveBeenCalled();
});
