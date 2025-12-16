import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComandasList } from '@/components/ComandasList';
import { Comanda } from '@/types';

// Mock dos ícones
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Receipt: () => <div data-testid="receipt-icon" />,
}));

// Mock dos componentes UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, ...props }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, onClick, className }: any) => (
    <div onClick={onClick} className={className} data-testid="card">
      {children}
    </div>
  ),
}));

describe('ComandasList - Comprehensive Tests', () => {
  const mockOnBack = jest.fn();
  const mockOnNewComanda = jest.fn();
  const mockOnSelectComanda = jest.fn();

  const mockComandas: Comanda[] = [
    {
      id: 'c1',
      number: 1,
      status: 'open',
      items: [
        {
          id: 'item1',
          product: { id: 'p1', name: 'Cerveja', price: 10, stock: 100, category: 'Bebidas' },
          quantity: 2,
          addedAt: new Date(),
        },
        {
          id: 'item2',
          product: { id: 'p2', name: 'Petisco', price: 15, stock: 50, category: 'Comidas' },
          quantity: 1,
          addedAt: new Date(),
        },
      ],
      customerName: 'João Silva',
      createdAt: new Date(),
    },
    {
      id: 'c2',
      number: 2,
      status: 'open',
      items: [
        {
          id: 'item3',
          product: { id: 'p3', name: 'Refrigerante', price: 5, stock: 200, category: 'Bebidas' },
          quantity: 3,
          addedAt: new Date(),
        },
      ],
      customerName: 'Maria Santos',
      createdAt: new Date(),
    },
    {
      id: 'c3',
      number: 3,
      status: 'closed',
      items: [
        {
          id: 'item4',
          product: { id: 'p4', name: 'Suco', price: 8, stock: 100, category: 'Bebidas' },
          quantity: 1,
          addedAt: new Date(),
        },
      ],
      customerName: 'Pedro Costa',
      createdAt: new Date(),
      closedAt: new Date(),
    },
  ];

  const defaultProps = {
    comandas: mockComandas,
    onBack: mockOnBack,
    onNewComanda: mockOnNewComanda,
    onSelectComanda: mockOnSelectComanda,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(<ComandasList {...defaultProps} />);
      expect(screen.getByText('Comandas Abertas')).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      const { container } = render(<ComandasList {...defaultProps} />);
      const mainDiv = container.firstChild;
      
      expect(mainDiv).toHaveClass('min-h-screen');
      expect(mainDiv).toHaveClass('bg-gradient-to-br');
    });

    it('should render back button', () => {
      render(<ComandasList {...defaultProps} />);
      
      const backButton = screen.getByLabelText('Voltar');
      expect(backButton).toBeInTheDocument();
    });

    it('should render back button icon', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByText('Comandas Abertas')).toBeInTheDocument();
    });

    it('should render new comanda button', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByText('Nova Comanda')).toBeInTheDocument();
    });

    it('should render plus icon in new comanda button', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });
  });

  describe('Comandas Count', () => {
    it('should display correct count of open comandas', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByText('2 comanda(s) ativa(s)')).toBeInTheDocument();
    });

    it('should show zero when no open comandas', () => {
      const closedComandas = mockComandas.map((c) => ({ ...c, status: 'closed' as const }));
      render(<ComandasList {...defaultProps} comandas={closedComandas} />);
      
      expect(screen.getByText('0 comanda(s) ativa(s)')).toBeInTheDocument();
    });

    it('should show one when single open comanda', () => {
      const singleComanda = [mockComandas[0]];
      render(<ComandasList {...defaultProps} comandas={singleComanda} />);
      
      expect(screen.getByText('1 comanda(s) ativa(s)')).toBeInTheDocument();
    });

    it('should show many when multiple open comandas', () => {
      const manyComandas = [
        ...mockComandas,
        { ...mockComandas[0], id: 'c4', number: 4 },
        { ...mockComandas[0], id: 'c5', number: 5 },
      ];
      render(<ComandasList {...defaultProps} comandas={manyComandas} />);
      
      expect(screen.getByText('4 comanda(s) ativa(s)')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no open comandas', () => {
      const closedComandas = mockComandas.map((c) => ({ ...c, status: 'closed' as const }));
      render(<ComandasList {...defaultProps} comandas={closedComandas} />);
      
      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
    });

    it('should show receipt icon in empty state', () => {
      render(<ComandasList {...defaultProps} comandas={[]} />);
      
      const receiptIcons = screen.getAllByTestId('receipt-icon');
      expect(receiptIcons.length).toBeGreaterThan(0);
    });

    it('should not show comanda cards in empty state', () => {
      render(<ComandasList {...defaultProps} comandas={[]} />);
      
      expect(screen.queryByText(/Comanda #/)).not.toBeInTheDocument();
    });

    it('should render empty state card', () => {
      const { container } = render(<ComandasList {...defaultProps} comandas={[]} />);
      
      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
    });
  });

  describe('Comanda Cards', () => {
    it('should render all open comandas', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByText('Comanda #1')).toBeInTheDocument();
      expect(screen.getByText('Comanda #2')).toBeInTheDocument();
    });

    it('should not render closed comandas', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.queryByText('Comanda #3')).not.toBeInTheDocument();
    });

    it('should display comanda numbers', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByText('Comanda #1')).toBeInTheDocument();
      expect(screen.getByText('Comanda #2')).toBeInTheDocument();
    });

    it('should display item count for each comanda', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByText('2 item(ns)')).toBeInTheDocument();
      expect(screen.getByText('1 item(ns)')).toBeInTheDocument();
    });

    it('should display correct total for each comanda', () => {
      render(<ComandasList {...defaultProps} />);
      
      // Comanda 1: 2*10 + 1*15 = 35.00
      expect(screen.getByText('R$ 35.00')).toBeInTheDocument();
      
      // Comanda 2: 3*5 = 15.00
      expect(screen.getByText('R$ 15.00')).toBeInTheDocument();
    });

    it('should render receipt icon for each comanda', () => {
      render(<ComandasList {...defaultProps} />);
      
      const receiptIcons = screen.getAllByTestId('receipt-icon');
      // At least one icon per open comanda
      expect(receiptIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have hover effect styling', () => {
      const { container } = render(<ComandasList {...defaultProps} />);
      const cards = container.querySelectorAll('[data-testid="card"]');
      
      // Find comanda cards (not empty state card)
      const comandaCards = Array.from(cards).filter((card) => 
        card.textContent?.includes('Comanda #')
      );
      
      comandaCards.forEach((card) => {
        expect(card).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Interactions', () => {
    it('should call onBack when back button clicked', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      const backButton = screen.getByLabelText('Voltar');
      await user.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onNewComanda when new comanda button clicked', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      const newButton = screen.getByText('Nova Comanda');
      await user.click(newButton);
      
      expect(mockOnNewComanda).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectComanda when comanda card clicked', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      const comanda1 = screen.getByText('Comanda #1').closest('[data-testid="card"]');
      if (comanda1) {
        await user.click(comanda1);
        expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[0]);
      }
    });

    it('should call onSelectComanda with correct comanda', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      const comanda2 = screen.getByText('Comanda #2').closest('[data-testid="card"]');
      if (comanda2) {
        await user.click(comanda2);
        expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[1]);
      }
    });

    it('should handle multiple clicks on different comandas', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      const comanda1 = screen.getByText('Comanda #1').closest('[data-testid="card"]');
      const comanda2 = screen.getByText('Comanda #2').closest('[data-testid="card"]');
      
      if (comanda1) await user.click(comanda1);
      if (comanda2) await user.click(comanda2);
      
      expect(mockOnSelectComanda).toHaveBeenCalledTimes(2);
      expect(mockOnSelectComanda).toHaveBeenNthCalledWith(1, mockComandas[0]);
      expect(mockOnSelectComanda).toHaveBeenNthCalledWith(2, mockComandas[1]);
    });
  });

  describe('Total Calculation', () => {
    it('should calculate total correctly for single item', () => {
      const singleItemComanda = [
        {
          ...mockComandas[0],
          items: [
            {
              id: 'i1',
              product: { id: 'p1', name: 'Item', price: 10, stock: 10, category: 'Cat' },
              quantity: 1,
              addedAt: new Date(),
            },
          ],
        },
      ];
      render(<ComandasList {...defaultProps} comandas={singleItemComanda} />);
      
      expect(screen.getByText('R$ 10.00')).toBeInTheDocument();
    });

    it('should calculate total correctly for multiple items', () => {
      render(<ComandasList {...defaultProps} />);
      
      // Comanda 1: (2*10) + (1*15) = 35.00
      expect(screen.getByText('R$ 35.00')).toBeInTheDocument();
    });

    it('should handle zero total', () => {
      const zeroTotalComanda = [
        {
          ...mockComandas[0],
          items: [
            {
              id: 'i1',
              product: { id: 'p1', name: 'Free', price: 0, stock: 10, category: 'Cat' },
              quantity: 1,
              addedAt: new Date(),
            },
          ],
        },
      ];
      render(<ComandasList {...defaultProps} comandas={zeroTotalComanda} />);
      
      expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
    });

    it('should handle decimal prices', () => {
      const decimalComanda = [
        {
          ...mockComandas[0],
          items: [
            {
              id: 'i1',
              product: { id: 'p1', name: 'Item', price: 9.99, stock: 10, category: 'Cat' },
              quantity: 2,
              addedAt: new Date(),
            },
          ],
        },
      ];
      render(<ComandasList {...defaultProps} comandas={decimalComanda} />);
      
      // 2 * 9.99 = 19.98
      expect(screen.getByText('R$ 19.98')).toBeInTheDocument();
    });

    it('should handle large quantities', () => {
      const largeQuantityComanda = [
        {
          ...mockComandas[0],
          items: [
            {
              id: 'i1',
              product: { id: 'p1', name: 'Item', price: 5, stock: 1000, category: 'Cat' },
              quantity: 100,
              addedAt: new Date(),
            },
          ],
        },
      ];
      render(<ComandasList {...defaultProps} comandas={largeQuantityComanda} />);
      
      // 100 * 5 = 500.00
      expect(screen.getByText('R$ 500.00')).toBeInTheDocument();
    });

    it('should handle large total amounts', () => {
      const largeAmountComanda = [
        {
          ...mockComandas[0],
          items: [
            {
              id: 'i1',
              product: { id: 'p1', name: 'Expensive', price: 999.99, stock: 10, category: 'Cat' },
              quantity: 10,
              addedAt: new Date(),
            },
          ],
        },
      ];
      render(<ComandasList {...defaultProps} comandas={largeAmountComanda} />);
      
      // 10 * 999.99 = 9999.90
      expect(screen.getByText('R$ 9999.90')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty comandas array', () => {
      render(<ComandasList {...defaultProps} comandas={[]} />);
      
      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
      expect(screen.getByText('0 comanda(s) ativa(s)')).toBeInTheDocument();
    });

    it('should handle comanda with empty items', () => {
      const emptyItemsComanda = [
        {
          ...mockComandas[0],
          items: [],
        },
      ];
      render(<ComandasList {...defaultProps} comandas={emptyItemsComanda} />);
      
      expect(screen.getByText('0 item(ns)')).toBeInTheDocument();
      expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
    });

    it('should handle only closed comandas', () => {
      const allClosed = mockComandas.map((c) => ({ ...c, status: 'closed' as const }));
      render(<ComandasList {...defaultProps} comandas={allClosed} />);
      
      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
    });

    it('should handle very large comanda numbers', () => {
      const largeNumberComanda = [
        {
          ...mockComandas[0],
          number: 9999,
        },
      ];
      render(<ComandasList {...defaultProps} comandas={largeNumberComanda} />);
      
      expect(screen.getByText('Comanda #9999')).toBeInTheDocument();
    });

    it('should handle many items in single comanda', () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        id: `item${i}`,
        product: { id: `p${i}`, name: `Item ${i}`, price: 1, stock: 10, category: 'Cat' },
        quantity: 1,
        addedAt: new Date(),
      }));
      
      const manyItemsComanda = [
        {
          ...mockComandas[0],
          items: manyItems,
        },
      ];
      render(<ComandasList {...defaultProps} comandas={manyItemsComanda} />);
      
      expect(screen.getByText('50 item(ns)')).toBeInTheDocument();
      expect(screen.getByText('R$ 50.00')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter out closed comandas', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByText('Comanda #1')).toBeInTheDocument();
      expect(screen.getByText('Comanda #2')).toBeInTheDocument();
      expect(screen.queryByText('Comanda #3')).not.toBeInTheDocument();
    });

    it('should only show open comandas', () => {
      const mixedStatus = [
        { ...mockComandas[0], status: 'open' as const },
        { ...mockComandas[1], status: 'closed' as const },
        { ...mockComandas[0], id: 'c4', number: 4, status: 'open' as const },
      ];
      render(<ComandasList {...defaultProps} comandas={mixedStatus} />);
      
      expect(screen.getByText('2 comanda(s) ativa(s)')).toBeInTheDocument();
      expect(screen.getByText('Comanda #1')).toBeInTheDocument();
      expect(screen.getByText('Comanda #4')).toBeInTheDocument();
      expect(screen.queryByText('Comanda #2')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible back button label', () => {
      render(<ComandasList {...defaultProps} />);
      
      expect(screen.getByLabelText('Voltar')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<ComandasList {...defaultProps} />);
      
      const title = screen.getByText('Comandas Abertas');
      expect(title.tagName).toBe('H1');
    });

    it('should have proper heading for comanda numbers', () => {
      render(<ComandasList {...defaultProps} />);
      
      const comandaHeading = screen.getByText('Comanda #1');
      expect(comandaHeading.tagName).toBe('H3');
    });

    it('should have clickable cards', () => {
      const { container } = render(<ComandasList {...defaultProps} />);
      
      const comandaCard = screen.getByText('Comanda #1').closest('[data-testid="card"]');
      expect(comandaCard).toHaveClass('cursor-pointer');
    });

    it('should have descriptive text for empty state', () => {
      render(<ComandasList {...defaultProps} comandas={[]} />);
      
      expect(screen.getByText('Nenhuma comanda aberta')).toBeInTheDocument();
    });
  });

  describe('Layout & Styling', () => {
    it('should have proper container max-width', () => {
      const { container } = render(<ComandasList {...defaultProps} />);
      const mainContainer = container.querySelector('.max-w-2xl');
      
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have gradient background', () => {
      const { container } = render(<ComandasList {...defaultProps} />);
      const background = container.querySelector('.bg-gradient-to-br');
      
      expect(background).toBeInTheDocument();
    });

    it('should have proper spacing between comandas', () => {
      const { container } = render(<ComandasList {...defaultProps} />);
      const comandasList = container.querySelector('.space-y-4');
      
      expect(comandasList).toBeInTheDocument();
    });

    it('should have new button with proper size', () => {
      render(<ComandasList {...defaultProps} />);
      
      const newButton = screen.getByText('Nova Comanda').closest('button');
      expect(newButton).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user flow', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      // Verify initial state
      expect(screen.getByText('2 comanda(s) ativa(s)')).toBeInTheDocument();
      
      // Click on comanda
      const comanda1 = screen.getByText('Comanda #1').closest('[data-testid="card"]');
      if (comanda1) {
        await user.click(comanda1);
        expect(mockOnSelectComanda).toHaveBeenCalledWith(mockComandas[0]);
      }
    });

    it('should handle navigation back', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      // Click back button
      await user.click(screen.getByLabelText('Voltar'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should handle creating new comanda', async () => {
      const user = userEvent.setup();
      render(<ComandasList {...defaultProps} />);
      
      // Click new comanda button
      await user.click(screen.getByText('Nova Comanda'));
      expect(mockOnNewComanda).toHaveBeenCalledTimes(1);
    });
  });
});
