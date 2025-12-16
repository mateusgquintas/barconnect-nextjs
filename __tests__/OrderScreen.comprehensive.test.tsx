import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { OrderScreen } from '@/components/OrderScreen';
import { OrderItem, Product } from '@/types';

// Mock de ícones do lucide-react
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="icon-arrow-left">←</div>,
  Plus: () => <div data-testid="icon-plus">+</div>,
  Trash2: () => <div data-testid="icon-trash">🗑</div>,
  Minus: () => <div data-testid="icon-minus">-</div>,
}));

// Mock do AddItemDialog
jest.mock('@/components/AddItemDialog', () => ({
  AddItemDialog: ({ open, onClose, onAddItem }: any) => 
    open ? (
      <div data-testid="add-item-dialog">
        <button onClick={onClose}>Fechar</button>
        <button onClick={() => {
          onAddItem({ id: '99', name: 'Produto Teste', price: 15.00, category: 'test', stock: 10 }, 2);
          onClose();
        }}>
          Adicionar Produto
        </button>
      </div>
    ) : null
}));

describe('OrderScreen - Comprehensive Tests', () => {
  // Mock data
  const mockProduct1: Product = {
    id: '1',
    name: 'Cerveja Heineken',
    price: 12.5,
    category: 'bebidas',
    stock: 50,
  };

  const mockProduct2: Product = {
    id: '2',
    name: 'Porção de Batata Frita',
    price: 25.0,
    category: 'comidas',
    stock: 30,
  };

  const mockItems: OrderItem[] = [
    { product: mockProduct1, quantity: 2 },
    { product: mockProduct2, quantity: 1 },
  ];

  const mockOnBack = jest.fn();
  const mockOnAddItem = jest.fn();
  const mockOnRemoveItem = jest.fn();
  const mockOnUpdateQuantity = jest.fn();
  const mockOnFinish = jest.fn();

  const defaultProps = {
    title: 'Comanda #5',
    items: mockItems,
    onBack: mockOnBack,
    onAddItem: mockOnAddItem,
    onRemoveItem: mockOnRemoveItem,
    onUpdateQuantity: mockOnUpdateQuantity,
    onFinish: mockOnFinish,
    showFinishButton: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.getByText('Comanda #5')).toBeInTheDocument();
    });

    it('should render title correctly', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Comanda #5');
    });

    it('should display item count', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.getByText('2 item(ns)')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<OrderScreen {...defaultProps} />);
      const backButton = screen.getByTestId('icon-arrow-left');
      expect(backButton).toBeInTheDocument();
    });

    it('should render add item button', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /adicionar item/i })).toBeInTheDocument();
    });

    it('should have gradient background', () => {
      const { container } = render(<OrderScreen {...defaultProps} />);
      const mainDiv = container.querySelector('.bg-gradient-to-br');
      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe('Items Display', () => {
    it('should display all items correctly', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.getByText('Cerveja Heineken')).toBeInTheDocument();
      expect(screen.getByText('Porção de Batata Frita')).toBeInTheDocument();
    });

    it('should display item prices correctly', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.getByText(/R\$ 12\.50 x 2/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 25\.00 x 1/)).toBeInTheDocument();
    });

    it('should display item quantities', () => {
      render(<OrderScreen {...defaultProps} />);
      const quantities = screen.getAllByText(/^\d+$/).filter(el => {
        const text = el.textContent || '';
        return text === '2' || text === '1';
      });
      expect(quantities.length).toBeGreaterThan(0);
    });

    it('should calculate and display item totals', () => {
      render(<OrderScreen {...defaultProps} />);
      // 2 x 12.50 = 25.00
      const values25 = screen.getAllByText(/R\$ 25\.00/);
      expect(values25.length).toBeGreaterThan(0);
    });

    it('should show empty state when no items', () => {
      render(<OrderScreen {...defaultProps} items={[]} />);
      expect(screen.getByText(/nenhum item adicionado/i)).toBeInTheDocument();
    });

    it('should display correct item count for empty list', () => {
      render(<OrderScreen {...defaultProps} items={[]} />);
      expect(screen.getByText('0 item(ns)')).toBeInTheDocument();
    });
  });

  describe('Total Calculation', () => {
    it('should calculate total correctly', () => {
      render(<OrderScreen {...defaultProps} />);
      // (2 * 12.50) + (1 * 25.00) = 50.00
      expect(screen.getByText(/R\$ 50\.00/)).toBeInTheDocument();
    });

    it('should not show total when no items', () => {
      render(<OrderScreen {...defaultProps} items={[]} />);
      expect(screen.queryByText('Total')).not.toBeInTheDocument();
    });

    it('should handle single item total', () => {
      const singleItem: OrderItem[] = [
        { product: mockProduct1, quantity: 1 },
      ];
      render(<OrderScreen {...defaultProps} items={singleItem} />);
      const totals = screen.getAllByText(/R\$ 12\.50/);
      expect(totals.length).toBeGreaterThan(0);
    });

    it('should handle large quantities', () => {
      const largeQuantity: OrderItem[] = [
        { product: { ...mockProduct1, price: 10.00 }, quantity: 50 },
      ];
      render(<OrderScreen {...defaultProps} items={largeQuantity} />);
      const totals = screen.getAllByText(/R\$ 500\.00/);
      expect(totals.length).toBeGreaterThan(0);
    });

    it('should handle decimal prices correctly', () => {
      const decimalItem: OrderItem[] = [
        { product: { ...mockProduct1, price: 9.99 }, quantity: 3 },
      ];
      render(<OrderScreen {...defaultProps} items={decimalItem} />);
      const totals = screen.getAllByText(/R\$ 29\.97/);
      expect(totals.length).toBeGreaterThan(0);
    });
  });

  describe('Quantity Controls', () => {
    it('should render increase button for each item', () => {
      render(<OrderScreen {...defaultProps} />);
      const plusButtons = screen.getAllByTestId('icon-plus');
      // 1 no botão "Adicionar Item" + 2 nos itens = 3
      expect(plusButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render decrease button for each item', () => {
      render(<OrderScreen {...defaultProps} />);
      const minusButtons = screen.getAllByTestId('icon-minus');
      expect(minusButtons).toHaveLength(2);
    });

    it('should call onUpdateQuantity when increase button clicked', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const plusButtons = screen.getAllByTestId('icon-plus');
      const itemPlusButton = plusButtons[1]; // Primeiro item (ignorando o botão de adicionar)
      
      await user.click(itemPlusButton);
      
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 3);
    });

    it('should call onUpdateQuantity when decrease button clicked', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const minusButtons = screen.getAllByTestId('icon-minus');
      await user.click(minusButtons[0]);
      
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 1);
    });

    it('should not allow quantity to go below 1', async () => {
      const user = userEvent.setup();
      const singleQuantityItem: OrderItem[] = [
        { product: mockProduct1, quantity: 1 },
      ];
      render(<OrderScreen {...defaultProps} items={singleQuantityItem} />);
      
      const minusButton = screen.getByTestId('icon-minus');
      await user.click(minusButton);
      
      // Deve chamar com quantidade mínima de 1
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 1);
    });

    it('should allow increasing quantity multiple times', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const plusButtons = screen.getAllByTestId('icon-plus');
      const itemPlusButton = plusButtons[1];
      
      await user.click(itemPlusButton);
      await user.click(itemPlusButton);
      
      expect(mockOnUpdateQuantity).toHaveBeenCalledTimes(2);
      expect(mockOnUpdateQuantity).toHaveBeenNthCalledWith(1, '1', 3);
      expect(mockOnUpdateQuantity).toHaveBeenNthCalledWith(2, '1', 3);
    });
  });

  describe('Remove Item Functionality', () => {
    it('should render remove button for each item', () => {
      render(<OrderScreen {...defaultProps} />);
      const trashButtons = screen.getAllByTestId('icon-trash');
      expect(trashButtons).toHaveLength(2);
    });

    it('should call onRemoveItem when remove button clicked', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const trashButtons = screen.getAllByTestId('icon-trash');
      await user.click(trashButtons[0]);
      
      expect(mockOnRemoveItem).toHaveBeenCalledWith('1');
    });

    it('should have trash icon on remove button', () => {
      render(<OrderScreen {...defaultProps} />);
      const trashIcons = screen.getAllByTestId('icon-trash');
      expect(trashIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Add Item Dialog', () => {
    it('should not show dialog initially', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.queryByTestId('add-item-dialog')).not.toBeInTheDocument();
    });

    it('should open dialog when add item button clicked', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      await user.click(addButton);
      
      expect(screen.getByTestId('add-item-dialog')).toBeInTheDocument();
    });

    it('should close dialog when close button clicked', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      await user.click(addButton);
      
      // Dialog tem múltiplos botões fechar, pegar todos e clicar no primeiro (do dialog)
      const closeButtons = screen.getAllByRole('button', { name: /fechar/i });
      await user.click(closeButtons[closeButtons.length - 1]); // Último é do dialog
      
      expect(screen.queryByTestId('add-item-dialog')).not.toBeInTheDocument();
    });

    it('should call onAddItem when item added from dialog', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      await user.click(addButton);
      
      const addProductButton = screen.getByRole('button', { name: /adicionar produto/i });
      await user.click(addProductButton);
      
      expect(mockOnAddItem).toHaveBeenCalledWith(
        expect.objectContaining({ id: '99', name: 'Produto Teste' }),
        2
      );
    });
  });

  describe('Back Button Functionality', () => {
    it('should call onBack when back button clicked', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const backButton = screen.getByTestId('icon-arrow-left').parentElement;
      await user.click(backButton!);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Finish Button', () => {
    it('should show finish button when items exist and showFinishButton is true', () => {
      render(<OrderScreen {...defaultProps} showFinishButton={true} />);
      expect(screen.getByRole('button', { name: /fechar comanda/i })).toBeInTheDocument();
    });

    it('should hide finish button when showFinishButton is false', () => {
      render(<OrderScreen {...defaultProps} showFinishButton={false} />);
      expect(screen.queryByRole('button', { name: /fechar comanda/i })).not.toBeInTheDocument();
    });

    it('should not show finish button when no items', () => {
      render(<OrderScreen {...defaultProps} items={[]} showFinishButton={true} />);
      expect(screen.queryByRole('button', { name: /fechar comanda/i })).not.toBeInTheDocument();
    });

    it('should call onFinish when finish button clicked', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const finishButton = screen.getByRole('button', { name: /fechar comanda/i });
      await user.click(finishButton);
      
      expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it('should have proper button styling', () => {
      render(<OrderScreen {...defaultProps} />);
      const finishButton = screen.getByRole('button', { name: /fechar comanda/i });
      expect(finishButton).toHaveClass('w-full', 'h-14');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long product names', () => {
      const longNameItem: OrderItem[] = [
        {
          product: {
            id: '1',
            name: 'Produto com Nome Extremamente Longo Que Pode Quebrar o Layout da Interface do Usuário',
            price: 10.0,
            category: 'test',
            stock: 10,
          },
          quantity: 1,
        },
      ];
      render(<OrderScreen {...defaultProps} items={longNameItem} />);
      expect(screen.getByText(/Produto com Nome Extremamente Longo/)).toBeInTheDocument();
    });

    it('should handle zero-price items', () => {
      const freeItem: OrderItem[] = [
        { product: { ...mockProduct1, price: 0 }, quantity: 1 },
      ];
      render(<OrderScreen {...defaultProps} items={freeItem} />);
      const zeroValues = screen.getAllByText(/R\$ 0\.00/);
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    it('should handle large totals', () => {
      const expensiveItem: OrderItem[] = [
        { product: { ...mockProduct1, price: 999.99 }, quantity: 10 },
      ];
      render(<OrderScreen {...defaultProps} items={expensiveItem} />);
      const totals = screen.getAllByText(/R\$ 9999\.90/);
      expect(totals.length).toBeGreaterThan(0);
    });

    it('should handle many items in list', () => {
      const manyItems: OrderItem[] = Array.from({ length: 20 }, (_, i) => ({
        product: {
          id: `${i}`,
          name: `Produto ${i}`,
          price: 10.0,
          category: 'test',
          stock: 10,
        },
        quantity: 1,
      }));
      render(<OrderScreen {...defaultProps} items={manyItems} />);
      expect(screen.getByText('20 item(ns)')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have max-width constraint', () => {
      const { container } = render(<OrderScreen {...defaultProps} />);
      const mainContainer = container.querySelector('.max-w-2xl');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have scrollable content area', () => {
      const { container } = render(<OrderScreen {...defaultProps} />);
      const scrollArea = container.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should have full-width add button', () => {
      render(<OrderScreen {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      expect(addButton).toHaveClass('w-full');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<OrderScreen {...defaultProps} />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<OrderScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /adicionar item/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fechar comanda/i })).toBeInTheDocument();
    });

    it('should have clear visual hierarchy', () => {
      render(<OrderScreen {...defaultProps} />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-3xl');
    });
  });

  describe('Data Integrity', () => {
    it('should not mutate original items array', async () => {
      const user = userEvent.setup();
      const originalItems = [...mockItems];
      render(<OrderScreen {...defaultProps} items={mockItems} />);
      
      const plusButtons = screen.getAllByTestId('icon-plus');
      await user.click(plusButtons[1]);
      
      expect(mockItems).toEqual(originalItems);
    });

    it('should maintain correct total after multiple operations', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      const totalElement = screen.getByText(/R\$ 50\.00/);
      expect(totalElement).toBeInTheDocument();
      
      const plusButtons = screen.getAllByTestId('icon-plus');
      await user.click(plusButtons[1]);
      
      // Total original deve permanecer até props mudarem
      expect(totalElement).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should have card styling for items', () => {
      const { container } = render(<OrderScreen {...defaultProps} />);
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between items', () => {
      const { container } = render(<OrderScreen {...defaultProps} />);
      const itemsContainer = container.querySelector('.space-y-3');
      expect(itemsContainer).toBeInTheDocument();
    });

    it('should have backdrop blur on total section', () => {
      const { container } = render(<OrderScreen {...defaultProps} />);
      const totalSection = container.querySelector('.backdrop-blur');
      expect(totalSection).toBeInTheDocument();
    });
  });

  describe('Item Operations Flow', () => {
    it('should handle complete add-update-remove flow', async () => {
      const user = userEvent.setup();
      render(<OrderScreen {...defaultProps} />);
      
      // Adicionar item
      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      await user.click(addButton);
      
      const addProductButton = screen.getByRole('button', { name: /adicionar produto/i });
      await user.click(addProductButton);
      
      expect(mockOnAddItem).toHaveBeenCalled();
      
      // Atualizar quantidade
      const plusButtons = screen.getAllByTestId('icon-plus');
      await user.click(plusButtons[1]);
      
      expect(mockOnUpdateQuantity).toHaveBeenCalled();
      
      // Remover item
      const trashButtons = screen.getAllByTestId('icon-trash');
      await user.click(trashButtons[0]);
      
      expect(mockOnRemoveItem).toHaveBeenCalled();
    });
  });

  describe('Title Variations', () => {
    it('should display custom title correctly', () => {
      render(<OrderScreen {...defaultProps} title="Venda Direta" />);
      expect(screen.getByText('Venda Direta')).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle = 'Comanda com Título Extremamente Longo para Testar Layout';
      render(<OrderScreen {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should have proper button sizes', () => {
      render(<OrderScreen {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      expect(addButton).toHaveClass('h-14');
    });

    it('should have icon buttons with correct size', () => {
      const { container } = render(<OrderScreen {...defaultProps} />);
      const iconButtons = container.querySelectorAll('.h-8.w-8');
      expect(iconButtons.length).toBeGreaterThan(0);
    });
  });
});
