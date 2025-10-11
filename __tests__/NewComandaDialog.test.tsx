import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewComandaDialog } from '../components/NewComandaDialog';

// Mocks e helpers podem ser adicionados conforme necessário

describe('NewComandaDialog', () => {
  it('renderiza o dialog e todos os campos obrigatórios', () => {
    render(
      <NewComandaDialog open={true} onOpenChange={() => {}} onCreateComanda={jest.fn()} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Adapte os campos conforme a implementação
  expect(screen.getByLabelText(/número da comanda/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/nome do cliente/i)).toBeInTheDocument();
  });

  it('valida campos obrigatórios ao submeter', async () => {
    render(
      <NewComandaDialog open={true} onOpenChange={() => {}} onCreateComanda={jest.fn()} />
    );
      const numberInput = screen.getByLabelText(/número da comanda/i);
      // O campo não é mais required; o formulário assume 1 quando vazio
      expect(numberInput).not.toBeRequired();
  });

  // Outros testes de UX, integração e acessibilidade serão adicionados
});
  it('chama onCreateComanda com dados corretos ao submeter', async () => {
    const onCreateComanda = jest.fn();
    const onOpenChange = jest.fn();
    render(
      <NewComandaDialog open={true} onOpenChange={onOpenChange} onCreateComanda={onCreateComanda} />
    );
    const numberInput = screen.getByLabelText(/número da comanda/i);
    const nameInput = screen.getByLabelText(/nome do cliente/i);
    await userEvent.type(numberInput, '123');
    await userEvent.type(nameInput, 'Maria');
    fireEvent.click(screen.getByRole('button', { name: /criar comanda/i }));
    await waitFor(() => {
      expect(onCreateComanda).toHaveBeenCalledWith(123, 'Maria');
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('exibe mensagem de erro para número inválido', async () => {
    render(
      <NewComandaDialog open={true} onOpenChange={() => {}} onCreateComanda={jest.fn()} />
    );
    const numberInput = screen.getByLabelText(/número da comanda/i);
    await userEvent.type(numberInput, '0');
    fireEvent.click(screen.getByRole('button', { name: /criar comanda/i }));
    expect(await screen.findByText(/número válido/i)).toBeInTheDocument();
  });
  it('possui labels e atributos de acessibilidade', () => {
    render(
      <NewComandaDialog open={true} onOpenChange={() => {}} onCreateComanda={jest.fn()} />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName(/nova comanda/i);
    // Campo de número não é required; valor padrão é 1 quando vazio
    expect(screen.getByLabelText(/número da comanda/i)).not.toBeRequired();
    expect(screen.getByLabelText(/nome do cliente/i)).not.toBeRequired();
  });

  it('reseta campos após submissão e cancelamento', async () => {
    const onCreateComanda = jest.fn();
    const onOpenChange = jest.fn();
    render(
      <NewComandaDialog open={true} onOpenChange={onOpenChange} onCreateComanda={onCreateComanda} />
    );
    const numberInput = screen.getByLabelText(/número da comanda/i);
    const nameInput = screen.getByLabelText(/nome do cliente/i);
    await userEvent.type(numberInput, '456');
    await userEvent.type(nameInput, 'Carlos');
    fireEvent.click(screen.getByRole('button', { name: /criar comanda/i }));
    await waitFor(() => expect(onCreateComanda).toHaveBeenCalled());
    expect(numberInput).toHaveValue(null);
    expect(nameInput).toHaveValue('');
    // Simular reabertura do dialog
    render(
      <NewComandaDialog open={true} onOpenChange={onOpenChange} onCreateComanda={onCreateComanda} />
    );
    expect(screen.getByLabelText(/número da comanda/i)).toHaveValue(null);
    expect(screen.getByLabelText(/nome do cliente/i)).toHaveValue('');
  });

  it('permite navegação por teclado', async () => {
    render(
      <NewComandaDialog open={true} onOpenChange={() => {}} onCreateComanda={jest.fn()} />
    );
    const numberInput = screen.getByLabelText(/número da comanda/i);
    numberInput.focus();
    expect(numberInput).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByLabelText(/nome do cliente/i)).toHaveFocus();
  });
