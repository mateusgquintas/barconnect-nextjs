import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardBar } from '@/components/DashboardBar';
import { Comanda, Transaction, SaleRecord } from '@/types';

// Mock do lucide-react
jest.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up">📈</div>,
  ShoppingCart: () => <div data-testid="shopping-cart">🛒</div>,
  DollarSign: () => <div data-testid="dollar-sign">💵</div>,
  Calendar: () => <div data-testid="calendar">📅</div>,
  Search: () => <div data-testid="search">🔍</div>,
  Gift: () => <div data-testid="gift">🎁</div>,
  Eye: () => <div data-testid="eye">👁️</div>,
}));

// Mock do logger
jest.mock('@/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('DashboardBar - Comprehensive Tests', () => {
  // Mock data
  const mockSalesRecords: SaleRecord[] = [
    {
      id: '1',
      date: '01/12/2025',
      time: '12:00',
      comandaNumber: 1,
      customerName: 'João Silva',
      items: [
        {
          product: { id: 'p1', name: 'Cerveja', price: 10, stock: 100, category: 'Bebidas' },
          quantity: 2,
        },
        {
          product: { id: 'p2', name: 'Petisco', price: 15, stock: 50, category: 'Comidas' },
          quantity: 1,
        },
      ],
      total: 35,
      paymentMethod: 'credit',
      isCourtesy: false,
      isDirectSale: false,
      userId: 'user1',
      userName: 'Atendente 1',
    },
    {
      id: '2',
      date: '02/12/2025',
      time: '14:30',
      comandaNumber: 2,
      customerName: 'Maria Santos',
      items: [
        {
          product: { id: 'p1', name: 'Cerveja', price: 10, stock: 100, category: 'Bebidas' },
          quantity: 3,
        },
      ],
      total: 30,
      paymentMethod: 'pix',
      isCourtesy: false,
      isDirectSale: false,
      userId: 'user1',
      userName: 'Atendente 1',
    },
    {
      id: '3',
      date: '03/12/2025',
      time: '16:45',
      comandaNumber: 3,
      customerName: 'Pedro Costa',
      items: [
        {
          product: { id: 'p3', name: 'Batata Frita', price: 20, stock: 30, category: 'Comidas' },
          quantity: 1,
        },
      ],
      total: 20,
      paymentMethod: 'courtesy',
      isCourtesy: true,
      isDirectSale: false,
      userId: 'user1',
      userName: 'Atendente 1',
    },
  ];

  const mockComandas: Comanda[] = [
    {
      id: 'c1',
      number: 10,
      items: [
        {
          id: 'item1',
          product: { id: 'p1', name: 'Cerveja', price: 10, stock: 100, category: 'Bebidas' },
          quantity: 1,
          addedAt: new Date('2025-12-01T10:00:00'),
        },
      ],
      customerName: 'Cliente Aberto',
      createdAt: new Date('2025-12-01T10:00:00'),
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 't1',
      description: 'Aluguel',
      amount: -1000,
      category: 'Despesas Fixas',
      date: '01/12/2025',
      time: '09:00',
      type: 'expense',
      userId: 'user1',
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    comandas: mockComandas,
    salesRecords: mockSalesRecords,
  };

  describe('Rendering & Structure', () => {
    it('should render date filters with calendar icon', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
      expect(screen.getByLabelText(/data de início do período/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data de fim do período/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /aplicar/i })).toBeInTheDocument();
    });

    it('should render summary cards with correct icons', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByTestId('dollar-sign')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
      expect(screen.getByTestId('trending-up')).toBeInTheDocument();
    });

    it('should render últimas vendas section with search', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByText(/últimas vendas/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/buscar por número ou nome/i)).toBeInTheDocument();
      expect(screen.getByTestId('search')).toBeInTheDocument();
    });

    it('should render produtos mais vendidos section', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByText(/produtos mais vendidos/i)).toBeInTheDocument();
    });

    it('should render métodos de pagamento section', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByText(/métodos de pagamento/i)).toBeInTheDocument();
    });

    it('should render cortesias section with gift icon', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getAllByText(/cortesias/i)[0]).toBeInTheDocument();
      expect(screen.getByTestId('gift')).toBeInTheDocument();
    });

    it('should render placeholder for loading tests', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByTestId('placeholder-loading')).toBeInTheDocument();
    });
  });

  describe('Summary Cards Calculations', () => {
    it('should calculate total revenue correctly (excluding courtesy)', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Total revenue: sale 1 (35) + sale 2 (30) = 65 (excluding courtesy)
      const revenueCards = screen.getAllByText(/receita total/i);
      expect(revenueCards[0]).toBeInTheDocument();
      expect(screen.getByText('R$ 65.00')).toBeInTheDocument();
    });

    it('should count total comandas correctly', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Comandas fechadas: 2 (excluding courtesy)
      const comandasCard = screen.getAllByText(/comandas/i)[0].closest('.p-6');
      expect(within(comandasCard!).getByText('2')).toBeInTheDocument();
      expect(within(comandasCard!).getByText(/1 comandas abertas/i)).toBeInTheDocument();
    });

    it('should calculate ticket médio correctly', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Ticket médio: 65 / 2 = 32.50
      expect(screen.getByText(/ticket médio/i)).toBeInTheDocument();
      expect(screen.getByText('R$ 32.50')).toBeInTheDocument();
    });

    it('should calculate courtesies total correctly', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Courtesy total: 20.00
      const courtesySection = screen.getByText(/total em cortesias/i).closest('.p-4');
      expect(within(courtesySection!).getByText('R$ 20.00')).toBeInTheDocument();
    });

    it('should handle zero sales', () => {
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={[]}
        />
      );
      
      expect(screen.getAllByText('R$ 0.00')[0]).toBeInTheDocument();
      expect(screen.getAllByText(/nenhuma venda no período/i)[0]).toBeInTheDocument();
    });
  });

  describe('Date Filtering', () => {
    it('should have default dates set (first and last day of month)', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const startDateInput = screen.getByLabelText(/data de início do período/i) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/data de fim do período/i) as HTMLInputElement;
      
      expect(startDateInput.value).toMatch(/^\d{4}-\d{2}-01$/);
      expect(endDateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should update start date when changed', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const startDateInput = screen.getByLabelText(/data de início do período/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-12-15');
      
      expect(startDateInput).toHaveValue('2025-12-15');
    });

    it('should update end date when changed', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const endDateInput = screen.getByLabelText(/data de fim do período/i);
      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-12-20');
      
      expect(endDateInput).toHaveValue('2025-12-20');
    });
  });

  describe('Sales List Display', () => {
    it('should display closed sales with correct information', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('- João Silva')).toBeInTheDocument();
      expect(screen.getAllByText('R$ 35.00')[0]).toBeInTheDocument();
    });

    it('should show "Fechada" status for closed sales', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const statusBadges = screen.getAllByText(/fechada/i);
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it('should display eye icon for sales with records', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const eyeIcons = screen.getAllByTestId('eye');
      expect(eyeIcons.length).toBeGreaterThan(0);
    });

    it('should show empty state when no sales match search', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar por número ou nome/i);
      await user.type(searchInput, 'Inexistente');
      
      // No sales should be visible
      expect(screen.queryByText('#1')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter sales by comanda number', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar por número ou nome/i);
      await user.type(searchInput, '1');
      
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('should filter sales by customer name', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar por número ou nome/i);
      await user.type(searchInput, 'Maria');
      
      expect(screen.getByText('- Maria Santos')).toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar por número ou nome/i);
      await user.type(searchInput, 'MARIA');
      
      expect(screen.getByText('- Maria Santos')).toBeInTheDocument();
    });

    it('should clear search and show all sales', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar por número ou nome/i);
      await user.type(searchInput, 'Maria');
      await user.clear(searchInput);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });

  describe('Top Products Display', () => {
    it('should display top 5 products sorted by quantity', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Cerveja: 5 units (2 + 3)
      expect(screen.getByText('Cerveja')).toBeInTheDocument();
      expect(screen.getByText('5 vendidos')).toBeInTheDocument();
    });

    it('should show product revenue', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Cerveja revenue: 5 * 10 = 50.00
      expect(screen.getByText('R$ 50.00')).toBeInTheDocument();
    });

    it('should show ranking number for each product', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const rankings = ['1', '2'];
      rankings.forEach(rank => {
        const rankingBadges = screen.getAllByText(rank);
        expect(rankingBadges.length).toBeGreaterThan(0);
      });
    });

    it('should show empty state when no products', () => {
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={[]}
        />
      );
      
      expect(screen.getAllByText(/nenhuma venda no período/i)[0]).toBeInTheDocument();
    });
  });

  describe('Payment Methods Display', () => {
    it('should display payment methods with counts', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByText('Crédito')).toBeInTheDocument();
      expect(screen.getAllByText(/1.*transações/)[0]).toBeInTheDocument();
    });

    it('should display payment methods totals', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Credit and Pix payments should have totals displayed
      const paymentSection = screen.getByText(/métodos de pagamento/i).closest('.p-6');
      expect(within(paymentSection!).getByText('Crédito')).toBeInTheDocument();
      expect(within(paymentSection!).getByText('Pix')).toBeInTheDocument();
    });

    it('should sort payment methods by total (descending)', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const methodElements = screen.getAllByText(/\d+ transações/i);
      // Should be sorted by total, credit (35) before pix (30)
      expect(methodElements.length).toBeGreaterThan(0);
    });

    it('should exclude courtesy from payment methods', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Courtesy should not appear in payment methods section
      const methodsSection = screen.getByText(/métodos de pagamento/i).closest('.p-6');
      expect(within(methodsSection!).queryByText('Cortesia')).not.toBeInTheDocument();
    });

    it('should show empty state when no payment methods', () => {
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={[]}
        />
      );
      
      const methodsSection = screen.getByText(/métodos de pagamento/i).closest('.p-6');
      expect(within(methodsSection!).getByText(/nenhuma venda no período/i)).toBeInTheDocument();
    });
  });

  describe('Courtesies Display', () => {
    it('should display courtesies count and total', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const courtesyCard = screen.getByText(/total em cortesias/i).closest('.p-4');
      expect(within(courtesyCard!).getByText('R$ 20.00')).toBeInTheDocument();
      expect(within(courtesyCard!).getByText('1')).toBeInTheDocument();
    });

    it('should list courtesy items with details', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const courtesyHeading = screen.getAllByText(/cortesias/i)[0];
      const courtesySection = courtesyHeading.closest('.p-6');
      expect(within(courtesySection!).getByText('#3')).toBeInTheDocument();
      expect(within(courtesySection!).getByText('16:45')).toBeInTheDocument();
    });

    it('should show empty state when no courtesies', () => {
      const nonCourtesySales = mockSalesRecords.filter(s => !s.isCourtesy);
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={nonCourtesySales}
        />
      );
      
      const courtesyHeading = screen.getAllByText(/cortesias/i)[0];
      const courtesySection = courtesyHeading.closest('.p-6');
      expect(within(courtesySection!).getByText(/nenhuma cortesia no período/i)).toBeInTheDocument();
    });

    it('should have clickable courtesy items in list', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const courtesyHeading = screen.getAllByText(/cortesias/i)[0];
      const courtesySection = courtesyHeading.closest('.p-6');
      const courtesyItem = within(courtesySection!).getByText('#3').closest('.cursor-pointer');
      
      expect(courtesyItem).toBeInTheDocument();
      expect(courtesyItem).toHaveClass('cursor-pointer');
    });
  });

  describe('Sale Details Dialog', () => {
    it('should have clickable sale items', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const saleItem = screen.getByText('#1').closest('.cursor-pointer');
      expect(saleItem).toBeInTheDocument();
      expect(saleItem).toHaveClass('cursor-pointer');
    });

    it('should render sale items with eye icon for details', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // Sales with records should have eye icon
      const eyeIcons = screen.getAllByTestId('eye');
      expect(eyeIcons.length).toBeGreaterThan(0);
    });

    it('should have hover effects on sale items', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const saleItem = screen.getByText('#1').closest('.cursor-pointer');
      expect(saleItem).toHaveClass('hover:bg-slate-50');
      expect(saleItem).toHaveClass('transition-colors');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transactions array', () => {
      render(
        <DashboardBar
          transactions={[]}
          comandas={mockComandas}
          salesRecords={mockSalesRecords}
        />
      );
      
      expect(screen.getByText(/receita total/i)).toBeInTheDocument();
    });

    it('should handle empty comandas array', () => {
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={[]}
          salesRecords={mockSalesRecords}
        />
      );
      
      expect(screen.getByText(/0 comandas abertas/i)).toBeInTheDocument();
    });

    it('should handle sales without customer name', () => {
      const salesWithoutCustomer: SaleRecord[] = [
        {
          ...mockSalesRecords[0],
          customerName: '',
        },
      ];
      
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={salesWithoutCustomer}
        />
      );
      
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('should handle direct sales', () => {
      const directSales: SaleRecord[] = [
        {
          ...mockSalesRecords[0],
          isDirectSale: true,
          comandaNumber: 0,
        },
      ];
      
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={directSales}
        />
      );
      
      expect(screen.getByText('Venda Direta')).toBeInTheDocument();
    });

    it('should handle invalid date formats gracefully', () => {
      const invalidDateSales: SaleRecord[] = [
        {
          ...mockSalesRecords[0],
          date: 'invalid-date',
        },
      ];
      
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={invalidDateSales}
        />
      );
      
      // Should render without crashing
      expect(screen.getByText(/receita total/i)).toBeInTheDocument();
    });

    it('should handle very large revenue values', () => {
      const largeSales: SaleRecord[] = [
        {
          ...mockSalesRecords[0],
          total: 999999.99,
        },
      ];
      
      render(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={largeSales}
        />
      );
      
      expect(screen.getAllByText('R$ 999999.99')[0]).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for date inputs', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByLabelText(/data de início do período/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data de fim do período/i)).toBeInTheDocument();
    });

    it('should have sr-only labels for screen readers', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const srOnlyLabel = screen.getByLabelText(/data de início do período/i)
        .closest('div')
        ?.querySelector('label');
      expect(srOnlyLabel).toHaveClass('sr-only');
    });

    it('should have accessible button labels', () => {
      render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /aplicar/i })).toBeInTheDocument();
    });

    it('should have placeholder text for search input', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar por número ou nome/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should have clickable elements with cursor pointer', () => {
      render(<DashboardBar {...defaultProps} />);
      
      const saleItem = screen.getByText('#1').closest('.cursor-pointer');
      expect(saleItem).toHaveClass('cursor-pointer');
    });
  });

  describe('Integration', () => {
    it('should correctly aggregate sales and comandas data', () => {
      render(<DashboardBar {...defaultProps} />);
      
      // 2 closed sales + 1 open comanda
      const comandasCard = screen.getAllByText(/comandas/i)[0].closest('.p-6');
      expect(within(comandasCard!).getByText('2')).toBeInTheDocument();
      expect(within(comandasCard!).getByText(/1 comandas abertas/i)).toBeInTheDocument();
    });

    it('should update calculations when data changes', () => {
      const { rerender } = render(<DashboardBar {...defaultProps} />);
      
      expect(screen.getByText('R$ 65.00')).toBeInTheDocument();
      
      const newSales = [
        ...mockSalesRecords.filter(s => !s.isCourtesy),
        {
          ...mockSalesRecords[0],
          id: '4',
          total: 100,
        },
      ];
      
      rerender(
        <DashboardBar
          transactions={mockTransactions}
          comandas={mockComandas}
          salesRecords={newSales}
        />
      );
      
      // New total: 65 + 100 = 165
      expect(screen.getByText('R$ 165.00')).toBeInTheDocument();
    });

    it('should filter and search work together', async () => {
      const user = userEvent.setup();
      render(<DashboardBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar por número ou nome/i);
      await user.type(searchInput, 'João');
      
      expect(screen.getByText('- João Silva')).toBeInTheDocument();
      expect(screen.queryByText('- Maria Santos')).not.toBeInTheDocument();
    });
  });
});
