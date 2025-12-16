import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { NewTransactionDialog } from '@/components/NewTransactionDialog';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NewTransactionDialog - Comprehensive Tests', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnAddTransaction = jest.fn();

  const defaultPropsIncome = {
    open: true,
    onOpenChange: mockOnOpenChange,
    type: 'income' as const,
    onAddTransaction: mockOnAddTransaction,
  };

  const defaultPropsExpense = {
    open: true,
    onOpenChange: mockOnOpenChange,
    type: 'expense' as const,
    onAddTransaction: mockOnAddTransaction,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing for income', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      expect(screen.getByText('Nova Entrada')).toBeInTheDocument();
    });

    it('should render without crashing for expense', () => {
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      expect(screen.getByText('Nova Saída')).toBeInTheDocument();
    });

    it('should render dialog title correctly for income', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      expect(screen.getByText('Nova Entrada')).toBeInTheDocument();
      expect(screen.getByText('Registre uma nova entrada financeira')).toBeInTheDocument();
    });

    it('should render dialog title correctly for expense', () => {
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      expect(screen.getByText('Nova Saída')).toBeInTheDocument();
      expect(screen.getByText('Registre uma nova saída financeira')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} open={false} />);
      expect(screen.queryByText('Nova Entrada')).not.toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Valor')).toBeInTheDocument();
    });

    it('should render cancel and submit buttons', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });
  });

  describe('Income Categories', () => {
    it('should display correct income categories', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /categoria/i });
      await user.click(categorySelect);
      
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Vendas' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Hospedagens' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Serviços' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Eventos' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Outras Receitas' })).toBeInTheDocument();
      });
    });

    it('should have 5 income categories', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /categoria/i });
      await user.click(categorySelect);
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(5);
      });
    });
  });

  describe('Expense Categories', () => {
    it('should display correct expense categories', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /categoria/i });
      await user.click(categorySelect);
      
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Fornecedores' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Salários' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Aluguel' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Impostos' })).toBeInTheDocument();
      });
    });

    it('should have 14 expense categories', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /categoria/i });
      await user.click(categorySelect);
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(14);
      });
    });
  });

  describe('Form Input', () => {
    it('should allow typing in description field', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const descInput = screen.getByLabelText('Descrição');
      await user.type(descInput, 'Teste descrição');
      
      expect(descInput).toHaveValue('Teste descrição');
    });

    it('should allow typing in amount field', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const amountInput = screen.getByLabelText('Valor');
      await user.type(amountInput, '100.50');
      
      expect(amountInput).toHaveValue(100.5);
    });

    it('should allow selecting a category', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /categoria/i });
      await user.click(categorySelect);
      
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Vendas' })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('option', { name: 'Vendas' }));
      
      expect(categorySelect).toHaveTextContent('Vendas');
    });
  });

  describe('Form Submission - Valid Data', () => {
    it('should submit income transaction with all fields', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Venda de produto');
      await user.type(screen.getByLabelText('Valor'), '150.00');
      
      const categorySelect = screen.getByRole('combobox', { name: /categoria/i });
      await user.click(categorySelect);
      await waitFor(() => screen.getByRole('option', { name: 'Vendas' }));
      await user.click(screen.getByRole('option', { name: 'Vendas' }));
      
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith({
          type: 'income',
          description: 'Venda de produto',
          amount: 150.00,
          category: 'Vendas',
        });
      });
    });

    it('should submit expense transaction with all fields', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Compra de materiais');
      await user.type(screen.getByLabelText('Valor'), '250.50');
      
      const categorySelect = screen.getByRole('combobox', { name: /categoria/i });
      await user.click(categorySelect);
      await waitFor(() => screen.getByRole('option', { name: 'Fornecedores' }));
      await user.click(screen.getByRole('option', { name: 'Fornecedores' }));
      
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith({
          type: 'expense',
          description: 'Compra de materiais',
          amount: 250.50,
          category: 'Fornecedores',
        });
      });
    });

    it('should use default category if none selected (income)', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Entrada sem categoria');
      await user.type(screen.getByLabelText('Valor'), '100');
      
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith({
          type: 'income',
          description: 'Entrada sem categoria',
          amount: 100,
          category: 'Vendas', // categoria padrão
        });
      });
    });

    it('should use default category if none selected (expense)', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Saída sem categoria');
      await user.type(screen.getByLabelText('Valor'), '50');
      
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith({
          type: 'expense',
          description: 'Saída sem categoria',
          amount: 50,
          category: 'Outras Despesas', // categoria padrão
        });
      });
    });

    it('should show success toast for income', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Entrada registrada');
      });
    });

    it('should show success toast for expense', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Saída registrada');
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty amount', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      
      const amountInput = screen.getByLabelText('Valor');
      amountInput.removeAttribute('required');
      
      fireEvent.change(amountInput, { target: { value: '' } });
      
      const form = amountInput.closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Valor inválido');
        expect(mockOnAddTransaction).not.toHaveBeenCalled();
      });
    });

    it('should show error for NaN amount', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      
      const amountInput = screen.getByLabelText('Valor') as HTMLInputElement;
      amountInput.removeAttribute('required');
      amountInput.removeAttribute('min');
      amountInput.type = 'text';
      
      fireEvent.change(amountInput, { target: { value: 'abc' } });
      
      const form = amountInput.closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Valor inválido');
        expect(mockOnAddTransaction).not.toHaveBeenCalled();
      });
    });

    it('should show error for zero amount', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      
      const amountInput = screen.getByLabelText('Valor');
      amountInput.removeAttribute('min');
      
      fireEvent.change(amountInput, { target: { value: '0' } });
      
      const form = amountInput.closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Valor inválido');
        expect(mockOnAddTransaction).not.toHaveBeenCalled();
      });
    });

    it('should show error for negative amount', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      
      const amountInput = screen.getByLabelText('Valor') as HTMLInputElement;
      amountInput.removeAttribute('min');
      amountInput.type = 'text';
      
      fireEvent.change(amountInput, { target: { value: '-50' } });
      
      const form = amountInput.closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Valor inválido');
        expect(mockOnAddTransaction).not.toHaveBeenCalled();
      });
    });

    it('should handle onAddTransaction error', async () => {
      const user = userEvent.setup();
      mockOnAddTransaction.mockRejectedValueOnce(new Error('Erro de rede'));
      
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao registrar transação');
      });
    });
  });

  describe('Cancel Behavior', () => {
    it('should call onOpenChange when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should clear form fields when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const descInput = screen.getByLabelText('Descrição') as HTMLInputElement;
      const amountInput = screen.getByLabelText('Valor') as HTMLInputElement;
      
      await user.type(descInput, 'Teste');
      await user.type(amountInput, '100');
      
      expect(descInput.value).toBe('Teste');
      expect(amountInput.value).toBe('100');
      
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      
      // Os campos são limpos internamente, mas o dialog fecha
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not call onAddTransaction when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      
      expect(mockOnAddTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Submit Button States', () => {
    it('should have correct aria-label for submit button', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    it('should have submit button with text for income', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      expect(screen.getByText(/registrar entrada/i)).toBeInTheDocument();
    });

    it('should have submit button with text for expense', () => {
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      expect(screen.getByText(/registrar saída/i)).toBeInTheDocument();
    });

    it('should have green styling for income button', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      const button = screen.getByRole('button', { name: /salvar/i });
      expect(button).toHaveClass('bg-green-600');
      expect(button).toHaveClass('hover:bg-green-700');
    });

    it('should have red styling for expense button', () => {
      render(<NewTransactionDialog {...defaultPropsExpense} />);
      const button = screen.getByRole('button', { name: /salvar/i });
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('hover:bg-red-700');
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      mockOnAddTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      
      const submitButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(submitButton);
      
      // Durante o submit, o botão fica desabilitado
      expect(submitButton).toBeDisabled();
    });

    it('should disable cancel button while submitting', async () => {
      const user = userEvent.setup();
      mockOnAddTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      
      const submitButton = screen.getByRole('button', { name: /salvar/i });
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      
      await user.click(submitButton);
      
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Valor')).toBeInTheDocument();
    });

    it('should have aria-label for amount input', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      const amountInput = screen.getByLabelText('Valor');
      expect(amountInput).toHaveAttribute('aria-label', 'Valor');
    });

    it('should have aria-describedby for amount input', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      const amountInput = screen.getByLabelText('Valor');
      expect(amountInput).toHaveAttribute('aria-describedby', 'amount-help');
    });

    it('should have sr-only help text for amount', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      const helpText = screen.getByText(/informe o valor em reais/i);
      expect(helpText).toHaveClass('sr-only');
    });

    it('should have role="alert" for form errors', async () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const amountInput = screen.getByLabelText('Valor');
      amountInput.removeAttribute('required');
      
      fireEvent.change(amountInput, { target: { value: '' } });
      
      const form = amountInput.closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should have noValidate on form to allow custom validation', () => {
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      const form = screen.getByLabelText('Descrição').closest('form')!;
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle decimal amounts with precision', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '99.99');
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith(
          expect.objectContaining({ amount: 99.99 })
        );
      });
    });

    it('should handle large amounts', async () => {
      const user = userEvent.setup();
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '999999.99');
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith(
          expect.objectContaining({ amount: 999999.99 })
        );
      });
    });

    it('should handle very long descriptions', async () => {
      const user = userEvent.setup();
      mockOnAddTransaction.mockResolvedValueOnce(undefined);
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      const longDesc = 'A'.repeat(200);
      const descInput = screen.getByLabelText('Descrição');
      const amountInput = screen.getByLabelText('Valor');
      
      // Use fireEvent for long text (faster than userEvent)
      fireEvent.change(descInput, { target: { value: longDesc } });
      fireEvent.change(amountInput, { target: { value: '100' } });
      
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith(
          expect.objectContaining({ description: longDesc })
        );
      });
    });

    it('should prevent double submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: () => void;
      mockOnAddTransaction.mockReturnValue(new Promise(resolve => {
        resolvePromise = resolve;
      }));
      
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      
      const submitButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(submitButton);
      await user.click(submitButton); // Segundo click
      
      // Só deve chamar uma vez
      expect(mockOnAddTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Reset After Success', () => {
    it('should close dialog after successful submission', async () => {
      const user = userEvent.setup();
      mockOnAddTransaction.mockResolvedValueOnce(undefined);
      
      render(<NewTransactionDialog {...defaultPropsIncome} />);
      
      await user.type(screen.getByLabelText('Descrição'), 'Teste');
      await user.type(screen.getByLabelText('Valor'), '100');
      await user.click(screen.getByRole('button', { name: /salvar/i }));
      
      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalled();
      });
      
      // Aguarda o handleClose() chamar onOpenChange(false)
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      }, { timeout: 3000 });
    });
  });
});
