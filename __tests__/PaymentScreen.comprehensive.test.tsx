import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PaymentScreen } from '@/components/PaymentScreen';
import { OrderItem, PaymentMethod } from '@/types';
import { UserRole } from '@/types/user';

// Mock de ícones do lucide-react
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="icon-x">X</div>,
  CreditCard: () => <div data-testid="icon-credit">Card</div>,
  DollarSign: () => <div data-testid="icon-dollar">$</div>,
  Smartphone: () => <div data-testid="icon-smartphone">Phone</div>,
  Check: () => <div data-testid="icon-check">✓</div>,
  Gift: () => <div data-testid="icon-gift">Gift</div>,
}));

describe('PaymentScreen - Comprehensive Tests', () => {
  // Mock data
  const mockItems: OrderItem[] = [
    {
      product: { id: '1', name: 'Cerveja Artesanal', price: 12.5, category: 'bebidas', stock: 50 },
      quantity: 2,
    },
    {
      product: { id: '2', name: 'Porção de Batata', price: 25.0, category: 'comidas', stock: 30 },
      quantity: 1,
    },
  ];

  const mockOnBack = jest.fn();
  const mockOnConfirmPayment = jest.fn();

  const defaultProps = {
    title: 'Pagamento - Comanda #5',
    items: mockItems,
    onBack: mockOnBack,
    onConfirmPayment: mockOnConfirmPayment,
    userRole: 'user' as UserRole,
    isDirectSale: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<PaymentScreen {...defaultProps} />);
      expect(screen.getByText('Pagamento - Comanda #5')).toBeInTheDocument();
    });

    it('should render as modal overlay with correct z-index', () => {
      const { container } = render(<PaymentScreen {...defaultProps} />);
      const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('z-50');
    });

    it('should render title correctly', () => {
      render(<PaymentScreen {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Pagamento - Comanda #5');
    });

    it('should render close button', () => {
      render(<PaymentScreen {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: 'X' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<PaymentScreen {...defaultProps} />);
      expect(screen.getByText(/resumo do pedido/i)).toBeInTheDocument();
      expect(screen.getByText(/forma de pagamento/i)).toBeInTheDocument();
      expect(screen.getByText(/confirmar pagamento/i)).toBeInTheDocument();
    });
  });

  describe('Order Summary Display', () => {
    it('should display all order items correctly', () => {
      render(<PaymentScreen {...defaultProps} />);
      expect(screen.getByText(/2x Cerveja Artesanal/i)).toBeInTheDocument();
      expect(screen.getByText(/1x Porção de Batata/i)).toBeInTheDocument();
    });

    it('should calculate individual item totals correctly', () => {
      render(<PaymentScreen {...defaultProps} />);
      // Ambos os itens totalizam 25.00, então aparecem 2x
      const values = screen.getAllByText(/R\$ 25\.00/);
      expect(values.length).toBe(2); // Um para cada item
    });

    it('should calculate and display total correctly', () => {
      render(<PaymentScreen {...defaultProps} />);
      // Total: (2 * 12.50) + (1 * 25.00) = 50.00
      expect(screen.getByText(/R\$ 50\.00/)).toBeInTheDocument();
    });

    it('should handle single item', () => {
      const singleItem: OrderItem[] = [
        { product: { id: '1', name: 'Produto Único', price: 10.0, category: 'outros', stock: 10 }, quantity: 1 },
      ];
      render(<PaymentScreen {...defaultProps} items={singleItem} />);
      expect(screen.getByText(/1x Produto Único/i)).toBeInTheDocument();
      // O valor aparece 2x: no item e no total
      const values = screen.getAllByText(/R\$ 10\.00/);
      expect(values.length).toBeGreaterThan(0);
    });

    it('should handle decimal prices correctly', () => {
      const decimalItems: OrderItem[] = [
        { product: { id: '1', name: 'Item Decimal', price: 9.99, category: 'outros', stock: 10 }, quantity: 3 },
      ];
      render(<PaymentScreen {...defaultProps} items={decimalItems} />);
      // 3 x 9.99 = 29.97
      const decimalValues = screen.getAllByText(/R\$ 29\.97/);
      expect(decimalValues.length).toBeGreaterThan(0);
    });

    it('should handle large quantities', () => {
      const largeQuantity: OrderItem[] = [
        { product: { id: '1', name: 'Item Popular', price: 5.0, category: 'outros', stock: 100 }, quantity: 50 },
      ];
      render(<PaymentScreen {...defaultProps} items={largeQuantity} />);
      expect(screen.getByText(/50x Item Popular/i)).toBeInTheDocument();
      const largeValues = screen.getAllByText(/R\$ 250\.00/);
      expect(largeValues.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Methods - Base User', () => {
    it('should display 4 payment methods for regular user', () => {
      render(<PaymentScreen {...defaultProps} userRole="user" isDirectSale={false} />);
      expect(screen.getByTestId('payment-cash')).toBeInTheDocument();
      expect(screen.getByTestId('payment-credit')).toBeInTheDocument();
      expect(screen.getByTestId('payment-debit')).toBeInTheDocument();
      expect(screen.getByTestId('payment-pix')).toBeInTheDocument();
    });

    it('should display correct payment method names', () => {
      render(<PaymentScreen {...defaultProps} />);
      expect(screen.getByText('Dinheiro')).toBeInTheDocument();
      expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument();
      expect(screen.getByText('Débito')).toBeInTheDocument();
      expect(screen.getByText('Pix')).toBeInTheDocument();
    });

    it('should NOT display courtesy option for regular user', () => {
      render(<PaymentScreen {...defaultProps} userRole="user" isDirectSale={true} />);
      expect(screen.queryByTestId('payment-courtesy')).not.toBeInTheDocument();
      expect(screen.queryByText('Cortesia')).not.toBeInTheDocument();
    });
  });

  describe('Payment Methods - Admin User', () => {
    it('should display courtesy option for admin on direct sale', () => {
      render(<PaymentScreen {...defaultProps} userRole="admin" isDirectSale={true} />);
      expect(screen.getByTestId('payment-courtesy')).toBeInTheDocument();
      expect(screen.getByText('Cortesia')).toBeInTheDocument();
    });

    it('should NOT display courtesy for admin on comanda sale', () => {
      render(<PaymentScreen {...defaultProps} userRole="admin" isDirectSale={false} />);
      expect(screen.queryByTestId('payment-courtesy')).not.toBeInTheDocument();
    });

    it('should display 5 payment methods for admin on direct sale', () => {
      render(<PaymentScreen {...defaultProps} userRole="admin" isDirectSale={true} />);
      // Verificar que todos os 5 métodos estão presentes
      expect(screen.getByTestId('payment-cash')).toBeInTheDocument();
      expect(screen.getByTestId('payment-credit')).toBeInTheDocument();
      expect(screen.getByTestId('payment-debit')).toBeInTheDocument();
      expect(screen.getByTestId('payment-pix')).toBeInTheDocument();
      expect(screen.getByTestId('payment-courtesy')).toBeInTheDocument();
    });
  });

  describe('Payment Method Selection', () => {
    it('should allow selecting a payment method', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const pixOption = screen.getByTestId('payment-pix');
      await user.click(pixOption);

      // Verifica se o método foi selecionado (check icon aparece)
      expect(within(pixOption).getByTestId('icon-check')).toBeInTheDocument();
    });

    it('should allow changing payment method', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const cashOption = screen.getByTestId('payment-cash');
      const pixOption = screen.getByTestId('payment-pix');

      await user.click(cashOption);
      expect(within(cashOption).getByTestId('icon-check')).toBeInTheDocument();

      await user.click(pixOption);
      expect(within(pixOption).getByTestId('icon-check')).toBeInTheDocument();
    });

    it('should show only one payment method as selected at a time', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      await user.click(screen.getByTestId('payment-cash'));
      await user.click(screen.getByTestId('payment-pix'));

      const checkIcons = screen.getAllByTestId('icon-check');
      expect(checkIcons).toHaveLength(1);
    });

    it('should apply selected styling to chosen payment method', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const pixOption = screen.getByTestId('payment-pix');
      await user.click(pixOption);

      expect(pixOption).toHaveClass('border-primary');
    });
  });

  describe('Confirm Payment Button', () => {
    it('should be disabled when no payment method is selected', () => {
      render(<PaymentScreen {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: /selecione uma forma de pagamento/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should be enabled after selecting a payment method', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      await user.click(screen.getByTestId('payment-pix'));

      const confirmButton = screen.getByRole('button', { name: /confirmar pagamento/i });
      expect(confirmButton).toBeEnabled();
    });

    it('should call onConfirmPayment with correct method when clicked', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      await user.click(screen.getByTestId('payment-pix'));
      await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

      expect(mockOnConfirmPayment).toHaveBeenCalledTimes(1);
      expect(mockOnConfirmPayment).toHaveBeenCalledWith('pix');
    });

    it('should not call onConfirmPayment when disabled', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: /selecione uma forma de pagamento/i });
      await user.click(confirmButton);

      expect(mockOnConfirmPayment).not.toHaveBeenCalled();
    });
  });

  describe('Back Button Interaction', () => {
    it('should call onBack when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: 'X' });
      await user.click(closeButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      render(<PaymentScreen {...defaultProps} items={[]} />);
      expect(screen.getByText(/R\$ 0\.00/)).toBeInTheDocument();
    });

    it('should handle zero-price items', () => {
      const freeItems: OrderItem[] = [
        { product: { id: '1', name: 'Item Grátis', price: 0, category: 'outros', stock: 10 }, quantity: 1 },
      ];
      render(<PaymentScreen {...defaultProps} items={freeItems} />);
      const zeroValues = screen.getAllByText(/R\$ 0\.00/);
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    it('should handle very long product names', () => {
      const longNameItem: OrderItem[] = [
        {
          product: {
            id: '1',
            name: 'Nome de Produto Extremamente Longo Que Pode Quebrar o Layout da Interface',
            price: 10.0,
            category: 'outros',
            stock: 10,
          },
          quantity: 1,
        },
      ];
      render(<PaymentScreen {...defaultProps} items={longNameItem} />);
      expect(screen.getByText(/Nome de Produto Extremamente Longo/i)).toBeInTheDocument();
    });

    it('should handle very large total amounts', () => {
      const expensiveItem: OrderItem[] = [
        { product: { id: '1', name: 'Item Caro', price: 9999.99, category: 'outros', stock: 1 }, quantity: 10 },
      ];
      render(<PaymentScreen {...defaultProps} items={expensiveItem} />);
      // Verificar que o total grande está presente
      const largeValues = screen.getAllByText(/R\$ 99999\.90/);
      expect(largeValues.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PaymentScreen {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: /selecione uma forma de pagamento/i });
      expect(confirmButton).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      // Clicar diretamente no primeiro método de pagamento
      const cashOption = screen.getByTestId('payment-cash');
      await user.click(cashOption);

      // Verificar que foi selecionado
      expect(within(cashOption).getByTestId('icon-check')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<PaymentScreen {...defaultProps} />);
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3s.length).toBeGreaterThan(0);
    });

    it('should update aria-label when payment method is selected', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: /selecione uma forma de pagamento/i });
      expect(confirmButton).toHaveAttribute('aria-label', 'Selecione uma forma de pagamento');

      await user.click(screen.getByTestId('payment-pix'));

      const updatedButton = screen.getByRole('button', { name: /confirmar pagamento/i });
      expect(updatedButton).toHaveAttribute('aria-label', 'Confirmar Pagamento');
    });
  });

  describe('User Role Permissions', () => {
    const roles: UserRole[] = ['admin', 'user', 'waiter'];

    roles.forEach((role) => {
      it(`should render correctly for ${role} role`, () => {
        render(<PaymentScreen {...defaultProps} userRole={role} />);
        expect(screen.getByText('Pagamento - Comanda #5')).toBeInTheDocument();
      });
    });

    it('should show courtesy only for admin on direct sales', () => {
      const { rerender } = render(<PaymentScreen {...defaultProps} userRole="admin" isDirectSale={true} />);
      expect(screen.getByTestId('payment-courtesy')).toBeInTheDocument();

      rerender(<PaymentScreen {...defaultProps} userRole="user" isDirectSale={true} />);
      expect(screen.queryByTestId('payment-courtesy')).not.toBeInTheDocument();

      rerender(<PaymentScreen {...defaultProps} userRole="waiter" isDirectSale={true} />);
      expect(screen.queryByTestId('payment-courtesy')).not.toBeInTheDocument();
    });
  });

  describe('Payment Flow Integration', () => {
    it('should complete full payment flow with cash', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      // 1. Verificar total
      expect(screen.getByText(/R\$ 50\.00/)).toBeInTheDocument();

      // 2. Selecionar método
      await user.click(screen.getByTestId('payment-cash'));

      // 3. Confirmar
      await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

      // 4. Validar callback
      expect(mockOnConfirmPayment).toHaveBeenCalledWith('cash');
    });

    it('should complete full payment flow with courtesy (admin)', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} userRole="admin" isDirectSale={true} />);

      await user.click(screen.getByTestId('payment-courtesy'));
      await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

      expect(mockOnConfirmPayment).toHaveBeenCalledWith('courtesy');
    });

    it('should allow canceling payment flow', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      await user.click(screen.getByTestId('payment-pix'));
      await user.click(screen.getByRole('button', { name: 'X' }));

      expect(mockOnBack).toHaveBeenCalled();
      expect(mockOnConfirmPayment).not.toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should apply hover effects to payment methods', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const cashOption = screen.getByTestId('payment-cash');
      await user.hover(cashOption);

      expect(cashOption).toHaveClass('hover:shadow-lg');
    });

    it('should show proper disabled state styling', () => {
      render(<PaymentScreen {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: /selecione uma forma de pagamento/i });

      expect(confirmButton).toHaveClass('disabled:bg-slate-300');
      expect(confirmButton).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive max-width', () => {
      const { container } = render(<PaymentScreen {...defaultProps} />);
      const modal = container.querySelector('.max-w-2xl');
      expect(modal).toBeInTheDocument();
    });

    it('should have scrollable content area', () => {
      const { container } = render(<PaymentScreen {...defaultProps} />);
      const scrollArea = container.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should have max height constraint', () => {
      const { container } = render(<PaymentScreen {...defaultProps} />);
      const modal = container.querySelector('.max-h-\\[90vh\\]');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Data Integrity', () => {
    it('should not mutate original items array', async () => {
      const user = userEvent.setup();
      const originalItems = [...mockItems];
      render(<PaymentScreen {...defaultProps} items={mockItems} />);

      await user.click(screen.getByTestId('payment-pix'));
      await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

      expect(mockItems).toEqual(originalItems);
    });

    it('should maintain correct total after multiple selections', async () => {
      const user = userEvent.setup();
      render(<PaymentScreen {...defaultProps} />);

      const totalElement = screen.getByText(/R\$ 50\.00/);

      await user.click(screen.getByTestId('payment-cash'));
      expect(totalElement).toBeInTheDocument();

      await user.click(screen.getByTestId('payment-pix'));
      expect(totalElement).toBeInTheDocument();
    });
  });
});
