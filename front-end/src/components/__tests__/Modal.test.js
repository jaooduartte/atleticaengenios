import React from 'react';
import { render } from '@testing-library/react';
import ModalDesconected from '../modals/modal-desconected';

test('Renderiza modal', () => {
  render(<ModalDesconected isOpen={false} />);
});