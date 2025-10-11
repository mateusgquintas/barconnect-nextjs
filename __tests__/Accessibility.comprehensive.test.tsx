// Testes básicos de acessibilidade para componentes principais

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginScreen } from '@/components/LoginScreen';

describe('Acessibilidade (mínimo)', () => {
  it('LoginScreen: navegação por teclado e labels', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={jest.fn()} />);

    const username = screen.getByLabelText(/usuário/i);
    const password = screen.getByLabelText(/senha/i);
    const entrar = screen.getByRole('button', { name: /entrar/i });

    // Testar navegação por teclado
    await user.tab();
    expect(username).toHaveFocus();
    await user.tab();
    expect(password).toHaveFocus();
    await user.tab();
    expect(entrar).toHaveFocus();
  });
});