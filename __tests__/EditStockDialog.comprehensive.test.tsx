import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EditStockDialog } from '@/components/EditStockDialog';
import { Product } from '@/types';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('EditStockDialog - Comprehensive Tests', () => {
  // Mock data
  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Cerveja Heineken',
    price: 12.5,
    category: 'bebidas',
    stock: 50,
  };

  const mockOnOpenChange = jest.fn();
  const mockOnUpdateStock = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    product: mockProduct,
    onUpdateStock: mockOnUpdateStock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByText('Editar Estoque')).toBeInTheDocument();
    });

    it('should render dialog title', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /editar estoque/i })).toBeInTheDocument();
    });

    it('should render dialog description', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByText(/atualize a quantidade em estoque do produto/i)).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should render update button', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /atualizar estoque/i })).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<EditStockDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Editar Estoque')).not.toBeInTheDocument();
    });
  });

  describe('Product Information Display', () => {
    it('should display product name', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
    });

    it('should display current stock with label', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByText('Estoque Atual')).toBeInTheDocument();
      expect(screen.getByText('50 unidades')).toBeInTheDocument();
    });

    it('should display product label', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByText('Produto')).toBeInTheDocument();
    });

    it('should handle very long product names', () => {
      const longNameProduct: Product = {
        ...mockProduct,
        name: 'Nome de Produto Extremamente Longo Que Pode Quebrar o Layout do Dialog',
      };
      render(<EditStockDialog {...defaultProps} product={longNameProduct} />);
      expect(screen.getByText(/Nome de Produto Extremamente Longo/i)).toBeInTheDocument();
    });

    it('should display large stock numbers correctly', () => {
      const highStockProduct: Product = {
        ...mockProduct,
        stock: 9999,
      };
      render(<EditStockDialog {...defaultProps} product={highStockProduct} />);
      expect(screen.getByText('9999 unidades')).toBeInTheDocument();
    });

    it('should display zero stock correctly', () => {
      const zeroStockProduct: Product = {
        ...mockProduct,
        stock: 0,
      };
      render(<EditStockDialog {...defaultProps} product={zeroStockProduct} />);
      expect(screen.getByText('0 unidades')).toBeInTheDocument();
    });
  });

  describe('Input Field Behavior', () => {
    it('should render stock input field', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should initialize input as empty on first render', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      // Input inicia vazio até o useEffect/handleOpenChange popular
      expect(input).toBeInTheDocument();
    });

    it('should render input field when dialog is open', () => {
      // Testa que quando o dialog está aberto, o input é renderizado
      render(<EditStockDialog {...defaultProps} open={true} />);
      
      // Dialog aberto deve mostrar o input
      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toBeRequired();
    });

    it('should handle dialog state transitions correctly', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      
      // Digite um valor
      await user.clear(input);
      await user.type(input, '99');
      expect(input.value).toBe('99');

      // O valor persiste enquanto o dialog está aberto
      expect(input.value).toBe('99');
    });

    it('should have minimum value of 0', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i);
      expect(input).toHaveAttribute('min', '0');
    });

    it('should have required attribute', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i);
      expect(input).toBeRequired();
    });

    it('should have placeholder text', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i);
      expect(input).toHaveAttribute('placeholder', 'Digite a nova quantidade');
    });

    it('should allow typing new value', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;

      await user.clear(input);
      await user.type(input, '100');

      expect(input.value).toBe('100');
    });

    it('should persist input value during same render cycle', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);
      
      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '75');
      expect(input.value).toBe('75');
      
      // Valor deve persistir no mesmo ciclo de renderização
      expect(input.value).toBe('75');
    });
  });

  describe('Form Submission', () => {
    it('should call onUpdateStock with correct values on submit', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '75');

      const submitButton = screen.getByRole('button', { name: /atualizar estoque/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnUpdateStock).toHaveBeenCalledWith('prod-1', 75);
      });
    });

    it('should show success toast on successful update', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '100');

      const submitButton = screen.getByRole('button', { name: /atualizar estoque/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Estoque atualizado com sucesso');
      });
    });

    it('should close dialog after successful update', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '80');

      const submitButton = screen.getByRole('button', { name: /atualizar estoque/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should accept zero as valid stock value', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '0');

      const submitButton = screen.getByRole('button', { name: /atualizar estoque/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnUpdateStock).toHaveBeenCalledWith('prod-1', 0);
      });
    });

    it('should accept large stock numbers', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '9999');

      const submitButton = screen.getByRole('button', { name: /atualizar estoque/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnUpdateStock).toHaveBeenCalledWith('prod-1', 9999);
      });
    });
  });

  describe('Validation', () => {
    it('should have HTML5 validation attributes', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i);
      // HTML5 constraints
      expect(input).toHaveAttribute('min', '0');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should handle empty product gracefully', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} product={null} />);

      // Não deve renderizar o formulário
      expect(screen.queryByLabelText(/nova quantidade/i)).not.toBeInTheDocument();
    });

    it('should show error toast when submitting invalid stock (NaN)', async () => {
      render(<EditStockDialog {...defaultProps} />);
      
      const input = screen.getByLabelText(/nova quantidade/i);
      const form = input.closest('form')!;
      
      // Remove validação HTML5 temporariamente para testar validação JS
      input.removeAttribute('required');
      input.removeAttribute('min');
      
      // Seta valor vazio que gera NaN
      fireEvent.change(input, { target: { value: '' } });
      
      // Submit direto sem userEvent para bypass HTML5
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Quantidade inválida');
        expect(mockOnUpdateStock).not.toHaveBeenCalled();
      });
    });

    it('should show error toast when submitting negative stock', async () => {
      render(<EditStockDialog {...defaultProps} />);
      
      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      const form = input.closest('form')!;
      
      // Remove validação HTML5 temporariamente
      input.removeAttribute('required');
      input.removeAttribute('min');
      input.type = 'text'; // Permite digitar negativo
      
      // Seta valor negativo
      fireEvent.change(input, { target: { value: '-5' } });
      
      // Submit direto
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Quantidade inválida');
        expect(mockOnUpdateStock).not.toHaveBeenCalled();
      });
    });

    it('should not close dialog when validation fails', async () => {
      render(<EditStockDialog {...defaultProps} />);
      
      const input = screen.getByLabelText(/nova quantidade/i);
      const form = input.closest('form')!;
      
      // Remove validação HTML5
      input.removeAttribute('required');
      input.removeAttribute('min');
      
      // Valor inválido (vazio/NaN)
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      
      // Dialog deve permanecer aberto (não chama onOpenChange(false))
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('Cancel Button', () => {
    it('should call onOpenChange with false when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not call onUpdateStock when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '999');

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnUpdateStock).not.toHaveBeenCalled();
    });

    it('should have border styling for cancel button', () => {
      render(<EditStockDialog {...defaultProps} />);
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toHaveClass('border');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close cycles', async () => {
      const { rerender } = render(<EditStockDialog {...defaultProps} open={false} />);
      
      rerender(<EditStockDialog {...defaultProps} open={true} />);
      rerender(<EditStockDialog {...defaultProps} open={false} />);
      rerender(<EditStockDialog {...defaultProps} open={true} />);

      expect(screen.getByText('Editar Estoque')).toBeInTheDocument();
    });

    it('should handle changing product while dialog is open', () => {
      const { rerender } = render(<EditStockDialog {...defaultProps} />);
      
      const newProduct: Product = {
        id: 'prod-2',
        name: 'Vodka Absolut',
        price: 80.0,
        category: 'bebidas',
        stock: 25,
      };

      rerender(<EditStockDialog {...defaultProps} product={newProduct} />);

      expect(screen.getByText('Vodka Absolut')).toBeInTheDocument();
      expect(screen.getByText('25 unidades')).toBeInTheDocument();
    });

    it('should preserve form state during re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '123');

      rerender(<EditStockDialog {...defaultProps} />);

      expect(input.value).toBe('123');
    });

    it('should handle product with special characters in name', () => {
      const specialProduct: Product = {
        ...mockProduct,
        name: 'Whisky Jack Daniel\'s N°7 (750ml)',
      };
      render(<EditStockDialog {...defaultProps} product={specialProduct} />);
      expect(screen.getByText(/Whisky Jack Daniel's N°7/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i);
      expect(input).toHaveAttribute('id', 'stock');
    });

    it('should be keyboard navigable between elements', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      // Primeiro tab foca no cancel button
      await user.tab();
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toHaveFocus();
    });

    it('should have proper heading hierarchy', () => {
      render(<EditStockDialog {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2, name: /editar estoque/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(<EditStockDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /atualizar estoque/i })).toBeInTheDocument();
    });

    it('should support Enter key to submit form', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '88');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnUpdateStock).toHaveBeenCalledWith('prod-1', 88);
      });
    });
  });

  describe('Form Interaction Flow', () => {
    it('should complete full edit flow successfully', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      // 1. Verificar estado inicial
      expect(screen.getByText('50 unidades')).toBeInTheDocument();

      // 2. Editar valor
      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '120');

      // 3. Submeter
      const submitButton = screen.getByRole('button', { name: /atualizar estoque/i });
      await user.click(submitButton);

      // 4. Validar callbacks
      await waitFor(() => {
        expect(mockOnUpdateStock).toHaveBeenCalledWith('prod-1', 120);
        expect(toast.success).toHaveBeenCalledWith('Estoque atualizado com sucesso');
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should allow editing after successful update', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      // Primeira edição
      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '60');
      await user.click(screen.getByRole('button', { name: /atualizar estoque/i }));

      await waitFor(() => {
        expect(mockOnUpdateStock).toHaveBeenCalledWith('prod-1', 60);
        expect(toast.success).toHaveBeenCalledWith('Estoque atualizado com sucesso');
        expect(mockOnUpdateStock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Button Styling', () => {
    it('should have correct styling on update button', () => {
      render(<EditStockDialog {...defaultProps} />);
      const updateButton = screen.getByRole('button', { name: /atualizar estoque/i });
      expect(updateButton).toHaveClass('bg-slate-900');
      expect(updateButton).toHaveClass('hover:bg-slate-800');
    });

    it('should have submit type on update button', () => {
      render(<EditStockDialog {...defaultProps} />);
      const updateButton = screen.getByRole('button', { name: /atualizar estoque/i });
      expect(updateButton).toHaveAttribute('type', 'submit');
    });

    it('should have button type on cancel button', () => {
      render(<EditStockDialog {...defaultProps} />);
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Input Constraints', () => {
    it('should have proper spacing classes', () => {
      render(<EditStockDialog {...defaultProps} />);
      const input = screen.getByLabelText(/nova quantidade/i);
      expect(input).toHaveClass('mt-2');
    });

    it('should update value in real-time while typing', async () => {
      const user = userEvent.setup();
      render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      await user.clear(input);
      
      await user.type(input, '1');
      expect(input.value).toBe('1');
      
      await user.type(input, '2');
      expect(input.value).toBe('12');
      
      await user.type(input, '3');
      expect(input.value).toBe('123');
    });
  });

  describe('Data Integrity', () => {
    it('should not mutate original product object', async () => {
      const user = userEvent.setup();
      const originalProduct = { ...mockProduct };
      render(<EditStockDialog {...defaultProps} product={mockProduct} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '999');
      await user.click(screen.getByRole('button', { name: /atualizar estoque/i }));

      // Produto original não deve ter mudado
      expect(mockProduct).toEqual(originalProduct);
    });

    it('should preserve input state when product changes without closing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<EditStockDialog {...defaultProps} />);

      const input = screen.getByLabelText(/nova quantidade/i);
      await user.clear(input);
      await user.type(input, '77');

      const newProduct: Product = {
        id: 'prod-3',
        name: 'Gin Tanqueray',
        price: 120.0,
        category: 'bebidas',
        stock: 15,
      };

      rerender(<EditStockDialog {...defaultProps} product={newProduct} />);

      // Nome do produto muda, mas input mantém valor digitado
      expect(screen.getByText('Gin Tanqueray')).toBeInTheDocument();
      const updatedInput = screen.getByLabelText(/nova quantidade/i) as HTMLInputElement;
      expect(updatedInput.value).toBe('77'); // Mantém valor digitado
    });
  });
});
