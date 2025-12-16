import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComandaDetail } from '@/components/ComandaDetail';
import { Comanda } from '@/types';
import { UserRole } from '@/types/user';

// Mock dos ícones
jest.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash-icon" />,
}));

// Mock dos componentes UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, title, className, variant, size, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title} 
      className={className}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

describe('ComandaDetail - Comprehensive Tests', () => {
  const mockOnRemoveItem = jest.fn();
  const mockOnCheckout = jest.fn();

  const mockComanda: Comanda = {
    id: 'c1',
    number: 1,
    status: 'open',
    items: [
      {
        id: 'item1',
        product: { id: 'p1', name: 'Cerveja Heineken', price: 10, stock: 100, category: 'Bebidas' },
        quantity: 2,
        addedAt: new Date(),
      },
      {
        id: 'item2',
        product: { id: 'p2', name: 'Batata Frita', price: 15, stock: 50, category: 'Comidas' },
        quantity: 1,
        addedAt: new Date(),
      },
    ],
    customerName: 'João Silva',
    createdAt: new Date(),
  };

  const defaultProps = {
    comanda: mockComanda,
    onRemoveItem: mockOnRemoveItem,
    onCheckout: mockOnCheckout,
    userRole: 'admin' as UserRole,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<ComandaDetail {...defaultProps} />);
      expect(screen.getByText(/Comanda #1/)).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      const { container } = render(<ComandaDetail {...defaultProps} />);
      const mainDiv = container.firstChild;
      
      expect(mainDiv).toHaveClass('flex');
      expect(mainDiv).toHaveClass('flex-col');
      expect(mainDiv).toHaveClass('h-full');
    });

    it('should render header section', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText(/Comanda #1/)).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render items section title', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText('Itens da Comanda')).toBeInTheDocument();
    });

    it('should render all comanda items', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText(/2x Cerveja Heineken/)).toBeInTheDocument();
      expect(screen.getByText(/1x Batata Frita/)).toBeInTheDocument();
    });

    it('should render checkout button when items exist', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Fechar Comanda/i })).toBeInTheDocument();
    });
  });

  describe('Empty State (No Comanda)', () => {
    it('should show empty state when comanda is null', () => {
      render(<ComandaDetail {...defaultProps} comanda={null} />);
      
      expect(screen.getByText('Selecione uma comanda')).toBeInTheDocument();
    });

    it('should show helper text in empty state', () => {
      render(<ComandaDetail {...defaultProps} comanda={null} />);
      
      expect(screen.getByText('ou crie uma nova')).toBeInTheDocument();
    });

    it('should not show comanda details when null', () => {
      render(<ComandaDetail {...defaultProps} comanda={null} />);
      
      expect(screen.queryByText(/Comanda #/)).not.toBeInTheDocument();
      expect(screen.queryByText('Itens da Comanda')).not.toBeInTheDocument();
    });

    it('should have proper styling for empty state', () => {
      const { container } = render(<ComandaDetail {...defaultProps} comanda={null} />);
      const emptyState = container.querySelector('.text-center.text-slate-400');
      
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Empty Items State', () => {
    it('should show empty items message when no items', () => {
      const emptyComanda = { ...mockComanda, items: [] };
      render(<ComandaDetail {...defaultProps} comanda={emptyComanda} />);
      
      expect(screen.getByText('Nenhum item adicionado')).toBeInTheDocument();
    });

    it('should not show checkout button when no items', () => {
      const emptyComanda = { ...mockComanda, items: [] };
      render(<ComandaDetail {...defaultProps} comanda={emptyComanda} />);
      
      expect(screen.queryByRole('button', { name: /Fechar Comanda/i })).not.toBeInTheDocument();
    });

    it('should show zero total when no items', () => {
      const emptyComanda = { ...mockComanda, items: [] };
      render(<ComandaDetail {...defaultProps} comanda={emptyComanda} />);
      
      expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
    });
  });

  describe('Comanda Header', () => {
    it('should display comanda number', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText(/Comanda #1/)).toBeInTheDocument();
    });

    it('should display customer name', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('should display first product name when no customer name', () => {
      const noCustomerComanda = { ...mockComanda, customerName: undefined };
      render(<ComandaDetail {...defaultProps} comanda={noCustomerComanda} />);
      
      expect(screen.getByText('Cerveja')).toBeInTheDocument();
    });

    it('should display "Nova" when no customer and no items', () => {
      const newComanda = { ...mockComanda, customerName: undefined, items: [] };
      render(<ComandaDetail {...defaultProps} comanda={newComanda} />);
      
      expect(screen.getByText('Nova')).toBeInTheDocument();
    });

    it('should display total label', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should display calculated total', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      // 2*10 + 1*15 = 35.00
      const totalElements = screen.getAllByText(/R\$ 35\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  describe('Items List', () => {
    it('should render all items', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should display item quantity and name', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByText(/2x Cerveja Heineken/)).toBeInTheDocument();
      expect(screen.getByText(/1x Batata Frita/)).toBeInTheDocument();
    });

    it('should display item total price', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      // 2 * 10 = 20.00
      expect(screen.getByText('R$ 20.00')).toBeInTheDocument();
      // 1 * 15 = 15.00
      expect(screen.getByText('R$ 15.00')).toBeInTheDocument();
    });

    it('should render trash icon for each item', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      const trashIcons = screen.getAllByTestId('trash-icon');
      expect(trashIcons.length).toBe(2);
    });

    it('should render remove button for each item', () => {
      const { container } = render(<ComandaDetail {...defaultProps} />);
      
      const removeButtons = container.querySelectorAll('button[data-variant="ghost"]');
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Total Calculation', () => {
    it('should calculate total correctly for multiple items', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      // 2*10 + 1*15 = 35.00
      const totalElements = screen.getAllByText(/R\$ 35\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should calculate total for single item', () => {
      const singleItemComanda = {
        ...mockComanda,
        items: [mockComanda.items[0]],
      };
      render(<ComandaDetail {...defaultProps} comanda={singleItemComanda} />);
      
      // 2*10 = 20.00
      const totalElements = screen.getAllByText(/R\$ 20\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should handle decimal prices', () => {
      const decimalComanda = {
        ...mockComanda,
        items: [
          {
            id: 'i1',
            product: { id: 'p1', name: 'Item', price: 9.99, stock: 10, category: 'Cat' },
            quantity: 3,
            addedAt: new Date(),
          },
        ],
      };
      render(<ComandaDetail {...defaultProps} comanda={decimalComanda} />);
      
      // 3 * 9.99 = 29.97
      const totalElements = screen.getAllByText(/R\$ 29\.97/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should handle large quantities', () => {
      const largeQuantityComanda = {
        ...mockComanda,
        items: [
          {
            id: 'i1',
            product: { id: 'p1', name: 'Item', price: 5, stock: 1000, category: 'Cat' },
            quantity: 100,
            addedAt: new Date(),
          },
        ],
      };
      render(<ComandaDetail {...defaultProps} comanda={largeQuantityComanda} />);
      
      // 100 * 5 = 500.00
      const totalElements = screen.getAllByText(/R\$ 500\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should handle zero-price items', () => {
      const freeComanda = {
        ...mockComanda,
        items: [
          {
            id: 'i1',
            product: { id: 'p1', name: 'Free', price: 0, stock: 10, category: 'Cat' },
            quantity: 1,
            addedAt: new Date(),
          },
        ],
      };
      render(<ComandaDetail {...defaultProps} comanda={freeComanda} />);
      
      const zeroElements = screen.getAllByText(/R\$ 0\.00/);
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe('Remove Item Functionality', () => {
    it('should call onRemoveItem when admin clicks remove button', async () => {
      const user = userEvent.setup();
      render(<ComandaDetail {...defaultProps} userRole="admin" />);
      
      const removeButtons = screen.getAllByTestId('trash-icon');
      const firstButton = removeButtons[0].closest('button');
      
      if (firstButton) {
        await user.click(firstButton);
        expect(mockOnRemoveItem).toHaveBeenCalledWith('p1');
      }
    });

    it('should call onRemoveItem with correct product id', async () => {
      const user = userEvent.setup();
      render(<ComandaDetail {...defaultProps} userRole="admin" />);
      
      const removeButtons = screen.getAllByTestId('trash-icon');
      const secondButton = removeButtons[1].closest('button');
      
      if (secondButton) {
        await user.click(secondButton);
        expect(mockOnRemoveItem).toHaveBeenCalledWith('p2');
      }
    });

    it('should disable remove button for non-admin users', () => {
      const { container } = render(<ComandaDetail {...defaultProps} userRole="user" />);
      
      const removeButtons = container.querySelectorAll('button[data-variant="ghost"]');
      removeButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should not call onRemoveItem when non-admin clicks', async () => {
      const user = userEvent.setup();
      render(<ComandaDetail {...defaultProps} userRole="user" />);
      
      const removeButtons = screen.getAllByTestId('trash-icon');
      const button = removeButtons[0].closest('button');
      
      if (button) {
        // Button is disabled, click won't work
        expect(button).toBeDisabled();
      }
    });

    it('should show proper title for admin remove button', () => {
      render(<ComandaDetail {...defaultProps} userRole="admin" />);
      
      const removeButtons = screen.getAllByTestId('trash-icon');
      const button = removeButtons[0].closest('button');
      
      expect(button).toHaveAttribute('title', 'Remover item');
    });

    it('should show proper title for non-admin remove button', () => {
      render(<ComandaDetail {...defaultProps} userRole="user" />);
      
      const removeButtons = screen.getAllByTestId('trash-icon');
      const button = removeButtons[0].closest('button');
      
      expect(button).toHaveAttribute('title', 'Apenas administradores podem remover itens');
    });
  });

  describe('Checkout Functionality', () => {
    it('should show checkout button when items exist', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Fechar Comanda/i })).toBeInTheDocument();
    });

    it('should display total in checkout button', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Fechar Comanda.*35\.00/i })).toBeInTheDocument();
    });

    it('should call onCheckout when clicked', async () => {
      const user = userEvent.setup();
      render(<ComandaDetail {...defaultProps} />);
      
      const checkoutButton = screen.getByRole('button', { name: /Fechar Comanda/i });
      await user.click(checkoutButton);
      
      expect(mockOnCheckout).toHaveBeenCalledTimes(1);
    });

    it('should not show checkout button when no items', () => {
      const emptyComanda = { ...mockComanda, items: [] };
      render(<ComandaDetail {...defaultProps} comanda={emptyComanda} />);
      
      expect(screen.queryByRole('button', { name: /Fechar Comanda/i })).not.toBeInTheDocument();
    });

    it('should have proper styling for checkout button', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      const checkoutButton = screen.getByRole('button', { name: /Fechar Comanda/i });
      expect(checkoutButton).toHaveClass('w-full');
      expect(checkoutButton).toHaveClass('h-12');
    });
  });

  describe('User Roles & Permissions', () => {
    it('should allow admin to remove items', () => {
      const { container } = render(<ComandaDetail {...defaultProps} userRole="admin" />);
      
      const removeButtons = container.querySelectorAll('button[data-variant="ghost"]');
      removeButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should disable remove for regular user', () => {
      const { container } = render(<ComandaDetail {...defaultProps} userRole="user" />);
      
      const removeButtons = container.querySelectorAll('button[data-variant="ghost"]');
      removeButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should disable remove for manager', () => {
      const { container } = render(<ComandaDetail {...defaultProps} userRole="manager" />);
      
      const removeButtons = container.querySelectorAll('button[data-variant="ghost"]');
      removeButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long product names', () => {
      const longNameComanda = {
        ...mockComanda,
        items: [
          {
            id: 'i1',
            product: { 
              id: 'p1', 
              name: 'Nome Extremamente Longo de Produto Que Pode Quebrar Layout', 
              price: 10, 
              stock: 10, 
              category: 'Cat' 
            },
            quantity: 1,
            addedAt: new Date(),
          },
        ],
      };
      render(<ComandaDetail {...defaultProps} comanda={longNameComanda} />);
      
      expect(screen.getByText(/Nome Extremamente Longo/)).toBeInTheDocument();
    });

    it('should handle very large comanda numbers', () => {
      const largeNumberComanda = { ...mockComanda, number: 9999 };
      render(<ComandaDetail {...defaultProps} comanda={largeNumberComanda} />);
      
      expect(screen.getByText(/Comanda #9999/)).toBeInTheDocument();
    });

    it('should handle many items', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        id: `item${i}`,
        product: { id: `p${i}`, name: `Item ${i}`, price: 10, stock: 100, category: 'Cat' },
        quantity: 1,
        addedAt: new Date(),
      }));
      
      const manyItemsComanda = { ...mockComanda, items: manyItems };
      render(<ComandaDetail {...defaultProps} comanda={manyItemsComanda} />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThanOrEqual(20);
    });

    it('should handle empty customer name', () => {
      const noCustomerComanda = { ...mockComanda, customerName: '' };
      render(<ComandaDetail {...defaultProps} comanda={noCustomerComanda} />);
      
      // Should show first product name
      expect(screen.getByText('Cerveja')).toBeInTheDocument();
    });

    it('should handle very large totals', () => {
      const largeTotal = {
        ...mockComanda,
        items: [
          {
            id: 'i1',
            product: { id: 'p1', name: 'Expensive', price: 9999.99, stock: 10, category: 'Cat' },
            quantity: 10,
            addedAt: new Date(),
          },
        ],
      };
      render(<ComandaDetail {...defaultProps} comanda={largeTotal} />);
      
      // 10 * 9999.99 = 99999.90
      const largeValues = screen.getAllByText(/R\$ 99999\.90/);
      expect(largeValues.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      const comandaHeading = screen.getByText(/Comanda #1/);
      expect(comandaHeading.tagName).toBe('H2');
      
      const itemsHeading = screen.getByText('Itens da Comanda');
      expect(itemsHeading.tagName).toBe('H3');
    });

    it('should have descriptive button titles', () => {
      render(<ComandaDetail {...defaultProps} userRole="admin" />);
      
      const removeButtons = screen.getAllByTestId('trash-icon');
      const button = removeButtons[0].closest('button');
      
      expect(button).toHaveAttribute('title');
    });

    it('should have proper button roles', () => {
      render(<ComandaDetail {...defaultProps} />);
      
      const checkoutButton = screen.getByRole('button', { name: /Fechar Comanda/i });
      expect(checkoutButton).toBeInTheDocument();
    });

    it('should have descriptive empty state text', () => {
      render(<ComandaDetail {...defaultProps} comanda={null} />);
      
      expect(screen.getByText('Selecione uma comanda')).toBeInTheDocument();
      expect(screen.getByText('ou crie uma nova')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete item removal flow', async () => {
      const user = userEvent.setup();
      render(<ComandaDetail {...defaultProps} userRole="admin" />);
      
      // Initial state: 2 items, total 35.00
      expect(screen.getByText(/2x Cerveja Heineken/)).toBeInTheDocument();
      
      // Remove first item
      const removeButtons = screen.getAllByTestId('trash-icon');
      const firstButton = removeButtons[0].closest('button');
      
      if (firstButton) {
        await user.click(firstButton);
        expect(mockOnRemoveItem).toHaveBeenCalledWith('p1');
      }
    });

    it('should handle checkout flow', async () => {
      const user = userEvent.setup();
      render(<ComandaDetail {...defaultProps} />);
      
      // Verify items exist
      expect(screen.getByText(/2x Cerveja Heineken/)).toBeInTheDocument();
      
      // Click checkout
      await user.click(screen.getByRole('button', { name: /Fechar Comanda/i }));
      expect(mockOnCheckout).toHaveBeenCalledTimes(1);
    });

    it('should handle state change from null to comanda', () => {
      const { rerender } = render(<ComandaDetail {...defaultProps} comanda={null} />);
      
      expect(screen.getByText('Selecione uma comanda')).toBeInTheDocument();
      
      rerender(<ComandaDetail {...defaultProps} comanda={mockComanda} />);
      
      expect(screen.getByText(/Comanda #1/)).toBeInTheDocument();
      expect(screen.queryByText('Selecione uma comanda')).not.toBeInTheDocument();
    });

    it('should handle role change', () => {
      const { container, rerender } = render(
        <ComandaDetail {...defaultProps} userRole="admin" />
      );
      
      let removeButtons = container.querySelectorAll('button[data-variant="ghost"]');
      removeButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
      
      rerender(<ComandaDetail {...defaultProps} userRole="user" />);
      
      removeButtons = container.querySelectorAll('button[data-variant="ghost"]');
      removeButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
