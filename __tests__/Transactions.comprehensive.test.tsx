/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Transactions } from '@/components/Transactions';
import type { Transaction, SaleRecord } from '@/types';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowUpRight: () => <div data-testid="arrow-up-right">↑</div>,
  ArrowDownRight: () => <div data-testid="arrow-down-right">↓</div>,
  Calendar: () => <div data-testid="calendar-icon">📅</div>,
  FileSpreadsheet: () => <div data-testid="file-spreadsheet">📊</div>,
  Plus: () => <div data-testid="plus-icon">+</div>,
  X: () => <div data-testid="x-icon">X</div>,
  XIcon: () => <div data-testid="x-icon">X</div>,
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon">▼</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon">▲</div>
}));

// Mock utilities
jest.mock('@/utils/format', () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
  salesToTransactions: jest.fn((sales: SaleRecord[]) => 
    sales.map(sale => ({
      id: `sale-${sale.id}`,
      type: 'income' as const,
      description: `Venda #${sale.id}`,
      category: 'Vendas',
      amount: sale.totalAmount,
      date: sale.date,
      time: sale.time || '00:00'
    }))
  ),
  sortTransactionsDesc: jest.fn((transactions: Transaction[]) => 
    [...transactions].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateB.getTime() - dateA.getTime();
    })
  )
}));

jest.mock('@/utils/exportToExcel', () => ({
  exportDashboardToExcel: jest.fn()
}));

jest.mock('@/utils/constants', () => ({
  INCOME_CATEGORIES: ['Vendas', 'Doações', 'Investimentos'],
  EXPENSE_CATEGORIES: ['Compras', 'Salários', 'Aluguel', 'Outros']
}));

// Mock NewTransactionDialog
jest.mock('@/components/NewTransactionDialog', () => ({
  NewTransactionDialog: ({ open, onOpenChange, type, onAddTransaction }: any) => 
    open ? (
      <div data-testid={`new-transaction-dialog-${type}`}>
        <h2>Nova {type === 'income' ? 'Entrada' : 'Saída'}</h2>
        <button onClick={() => onOpenChange(false)}>Close</button>
        <button onClick={() => {
          onAddTransaction({
            type,
            description: 'Test Transaction',
            category: type === 'income' ? 'Vendas' : 'Compras',
            amount: 100
          });
          onOpenChange(false);
        }}>Add</button>
      </div>
    ) : null
}));

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    description: 'Venda de produtos',
    category: 'Vendas',
    amount: 500.00,
    date: '10/12/2025',
    time: '14:30'
  },
  {
    id: '2',
    type: 'expense',
    description: 'Compra de estoque',
    category: 'Compras',
    amount: 300.00,
    date: '09/12/2025',
    time: '10:00'
  },
  {
    id: '3',
    type: 'income',
    description: 'Doação recebida',
    category: 'Doações',
    amount: 150.00,
    date: '08/12/2025',
    time: '16:00'
  },
  {
    id: '4',
    type: 'expense',
    description: 'Pagamento de aluguel',
    category: 'Aluguel',
    amount: 1000.00,
    date: '05/12/2025',
    time: '09:00'
  }
];

const mockSalesRecords: SaleRecord[] = [
  {
    id: 'sale1',
    totalAmount: 250.00,
    date: '11/12/2025',
    time: '18:00',
    items: [],
    comandaId: 'cmd1',
    paymentMethod: 'Dinheiro'
  },
  {
    id: 'sale2',
    totalAmount: 180.00,
    date: '07/12/2025',
    time: '20:00',
    items: [],
    comandaId: 'cmd2',
    paymentMethod: 'Cartão'
  }
];

const mockOnAddTransaction = jest.fn();

describe('Transactions - Comprehensive Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  // ==================== RENDERING & STRUCTURE ====================
  describe('Rendering & Structure', () => {
    it('should render without crashing', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getByRole('heading', { name: /financeiro/i })).toBeInTheDocument();
    });

    it('should render page title and description', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getByText(/financeiro/i)).toBeInTheDocument();
      expect(screen.getByText(/controle de entradas.*e saídas/i)).toBeInTheDocument();
    });

    it('should render date filters', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getByLabelText(/data inicial/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data final/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getByRole('button', { name: /exportar para excel/i })).toBeInTheDocument();
    });

    it('should render summary cards', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getAllByText(/^entradas$/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/^saídas$/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/^saldo$/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getByRole('button', { name: /nova entrada/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nova saída/i })).toBeInTheDocument();
    });

    it('should render income and expense sections', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      expect(screen.getByRole('heading', { name: /^entradas$/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /^saídas$/i, level: 2 })).toBeInTheDocument();
    });
  });

  // ==================== SUMMARY CALCULATIONS ====================
  describe('Summary Calculations', () => {
    it('should calculate total income correctly', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      // Income: 500 + 150 + sales (250 + 180) = 1080
      const incomeCard = screen.getAllByText(/^entradas$/i)[0].closest('.p-6');
      expect(within(incomeCard!).getByText('R$ 1080.00')).toBeInTheDocument();
    });

    it('should calculate total expense correctly', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      // Expenses: 300 + 1000 = 1300
      const expenseCard = screen.getAllByText(/^saídas$/i)[0].closest('.p-6');
      expect(within(expenseCard!).getByText('R$ 1300.00')).toBeInTheDocument();
    });

    it('should calculate negative balance correctly', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      // Balance: 1080 - 1300 = -220
      const balanceCard = screen.getByText(/^saldo$/i).closest('.p-6');
      expect(within(balanceCard!).getByText(/- R\$ 220\.00/)).toBeInTheDocument();
    });

    it('should show positive balance with correct styling', () => {
      const positiveTransactions: Transaction[] = [
        { id: '1', type: 'income', description: 'Test', category: 'Vendas', amount: 2000, date: '10/12/2025', time: '10:00' }
      ];

      render(
        <Transactions
          transactions={positiveTransactions}
          salesRecords={[]}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      
      const balanceCard = screen.getByText(/^saldo$/i).closest('.p-6');
      const balanceAmount = within(balanceCard!).getByText(/R\$ 2000\.00/);
      expect(balanceAmount).toHaveClass('text-green-600');
    });

    it('should show negative balance with correct styling', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );
      
      const balanceCard = screen.getByText(/^saldo$/i).closest('.p-6');
      const balanceAmount = within(balanceCard!).getByText(/- R\$ 220\.00/);
      expect(balanceAmount).toHaveClass('text-red-600');
    });
  });

  // ==================== DATE FILTERING ====================
  describe('Date Filtering', () => {
    it('should filter transactions by date range', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-08"
          endDate="2025-12-10"
        />
      );

      // Should show transactions from 08, 09, 10
      expect(screen.getByText('Venda de produtos')).toBeInTheDocument(); // 10/12
      expect(screen.getByText('Compra de estoque')).toBeInTheDocument(); // 09/12
      expect(screen.getByText('Doação recebida')).toBeInTheDocument(); // 08/12
      
      // Should NOT show transaction from 05/12
      expect(screen.queryByText('Pagamento de aluguel')).not.toBeInTheDocument();
    });

    it('should update filter when start date changes', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const startDateInput = screen.getByLabelText(/data inicial/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-12-09');

      // Should NOT show transaction from 08/12 and earlier
      await waitFor(() => {
        expect(screen.queryByText('Doação recebida')).not.toBeInTheDocument();
      });
    });

    it('should update filter when end date changes', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const endDateInput = screen.getByLabelText(/data final/i);
      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-12-09');

      // Should NOT show transactions from 10/12 and later
      await waitFor(() => {
        expect(screen.queryByText('Venda de produtos')).not.toBeInTheDocument();
      });
    });
  });

  // ==================== SEARCH FUNCTIONALITY ====================
  describe('Search Functionality', () => {
    it('should filter by transaction description', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.type(screen.getByPlaceholderText(/buscar/i), 'Venda');

      expect(screen.getByText('Venda de produtos')).toBeInTheDocument();
      expect(screen.queryByText('Compra de estoque')).not.toBeInTheDocument();
    });

    it('should filter by category', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.type(screen.getByPlaceholderText(/buscar/i), 'Aluguel');

      expect(screen.getByText('Pagamento de aluguel')).toBeInTheDocument();
      expect(screen.queryByText('Venda de produtos')).not.toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.type(screen.getByPlaceholderText(/buscar/i), 'VENDA');

      expect(screen.getByText('Venda de produtos')).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.type(screen.getByPlaceholderText(/buscar/i), 'xyz123notfound');

      await waitFor(() => {
        expect(screen.getAllByText(/nenhuma.*no período/i).length).toBeGreaterThan(0);
      });
    });

    it('should clear search and show all transactions', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await user.type(searchInput, 'Aluguel');
      expect(screen.queryByText('Venda de produtos')).not.toBeInTheDocument();

      await user.clear(searchInput);
      
      expect(screen.getByText('Venda de produtos')).toBeInTheDocument();
    });
  });

  // ==================== CATEGORY FILTERING ====================
  describe('Category Filtering', () => {
    it('should filter income by category', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const incomeSelect = screen.getByLabelText(/categoria:/i, { selector: '#income-category' });
      await user.selectOptions(incomeSelect, 'Vendas');

      // Should show only Vendas category
      await waitFor(() => {
        expect(screen.getByText('Venda de produtos')).toBeInTheDocument();
        expect(screen.queryByText('Doação recebida')).not.toBeInTheDocument();
      });
    });

    it('should filter expense by category', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const expenseSelect = screen.getByLabelText(/categoria:/i, { selector: '#expense-category' });
      await user.selectOptions(expenseSelect, 'Aluguel');

      // Should show only Aluguel category
      await waitFor(() => {
        expect(screen.getByText('Pagamento de aluguel')).toBeInTheDocument();
        expect(screen.queryByText('Compra de estoque')).not.toBeInTheDocument();
      });
    });

    it('should show all categories when "Todas" is selected', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const incomeSelect = screen.getByLabelText(/categoria:/i, { selector: '#income-category' });
      await user.selectOptions(incomeSelect, 'Vendas');
      await user.selectOptions(incomeSelect, '');

      expect(screen.getByText('Venda de produtos')).toBeInTheDocument();
      expect(screen.getByText('Doação recebida')).toBeInTheDocument();
    });
  });

  // ==================== TRANSACTION LISTS ====================
  describe('Transaction Lists', () => {
    it('should display income transactions', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText('Venda de produtos')).toBeInTheDocument();
      expect(screen.getByText('Doação recebida')).toBeInTheDocument();
    });

    it('should display expense transactions', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText('Compra de estoque')).toBeInTheDocument();
      expect(screen.getByText('Pagamento de aluguel')).toBeInTheDocument();
    });

    it('should display sales as income transactions', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText('Venda #sale1')).toBeInTheDocument();
      expect(screen.getByText('Venda #sale2')).toBeInTheDocument();
    });

    it('should show transaction count for income', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const incomeSection = screen.getByRole('heading', { name: /^entradas$/i, level: 2 }).closest('.p-6');
      // 2 manual income + 2 sales = 4
      expect(within(incomeSection!).getByText(/4 registros/i)).toBeInTheDocument();
    });

    it('should show transaction count for expenses', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const expenseSection = screen.getByRole('heading', { name: /^saídas$/i, level: 2 }).closest('.p-6');
      // 2 expenses
      expect(within(expenseSection!).getByText(/2 registros/i)).toBeInTheDocument();
    });

    it('should show empty state for income when no transactions', () => {
      render(
        <Transactions
          transactions={[]}
          salesRecords={[]}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText(/nenhuma entrada no período/i)).toBeInTheDocument();
    });

    it('should show empty state for expenses when no transactions', () => {
      render(
        <Transactions
          transactions={[]}
          salesRecords={[]}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText(/nenhuma saída no período/i)).toBeInTheDocument();
    });
  });

  // ==================== NEW TRANSACTION DIALOGS ====================
  describe('New Transaction Dialogs', () => {
    it('should open income dialog when Nova Entrada is clicked', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.click(screen.getByRole('button', { name: /nova entrada/i }));

      const dialog = screen.getByTestId('new-transaction-dialog-income');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading')).toHaveTextContent('Nova Entrada');
    });

    it('should open expense dialog when Nova Saída is clicked', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.click(screen.getByRole('button', { name: /nova saída/i }));

      const dialog = screen.getByTestId('new-transaction-dialog-expense');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading')).toHaveTextContent('Nova Saída');
    });

    it('should close income dialog', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.click(screen.getByRole('button', { name: /nova entrada/i }));
      expect(screen.getByTestId('new-transaction-dialog-income')).toBeInTheDocument();

      await user.click(screen.getByText('Close'));

      await waitFor(() => {
        expect(screen.queryByTestId('new-transaction-dialog-income')).not.toBeInTheDocument();
      });
    });

    it('should add income transaction', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.click(screen.getByRole('button', { name: /nova entrada/i }));
      await user.click(screen.getByText('Add'));

      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith({
          type: 'income',
          description: 'Test Transaction',
          category: 'Vendas',
          amount: 100
        });
      });
    });

    it('should add expense transaction', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.click(screen.getByRole('button', { name: /nova saída/i }));
      await user.click(screen.getByText('Add'));

      await waitFor(() => {
        expect(mockOnAddTransaction).toHaveBeenCalledWith({
          type: 'expense',
          description: 'Test Transaction',
          category: 'Compras',
          amount: 100
        });
      });
    });
  });

  // ==================== EXPORT FUNCTIONALITY ====================
  describe('Export Functionality', () => {
    it('should call export function when button is clicked', async () => {
      const { exportDashboardToExcel } = require('@/utils/exportToExcel');
      
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      await user.click(screen.getByRole('button', { name: /exportar para excel/i }));

      expect(exportDashboardToExcel).toHaveBeenCalledWith({
        transactions: expect.any(Array),
        salesRecords: mockSalesRecords,
        startDate: '2025-12-01',
        endDate: '2025-12-31'
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle empty transactions array', () => {
      render(
        <Transactions
          transactions={[]}
          salesRecords={[]}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText(/nenhuma entrada no período/i)).toBeInTheDocument();
      expect(screen.getByText(/nenhuma saída no período/i)).toBeInTheDocument();
    });

    it('should handle transactions with special characters', () => {
      const specialTransactions: Transaction[] = [{
        id: '1',
        type: 'income',
        description: 'Venda @ R$ 10 & Cia',
        category: 'Vendas',
        amount: 100,
        date: '10/12/2025',
        time: '10:00'
      }];

      render(
        <Transactions
          transactions={specialTransactions}
          salesRecords={[]}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText('Venda @ R$ 10 & Cia')).toBeInTheDocument();
    });

    it('should handle very large amounts', () => {
      const largeTransactions: Transaction[] = [{
        id: '1',
        type: 'income',
        description: 'Grande venda',
        category: 'Vendas',
        amount: 999999.99,
        date: '10/12/2025',
        time: '10:00'
      }];

      render(
        <Transactions
          transactions={largeTransactions}
          salesRecords={[]}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getAllByText('R$ 999999.99')[0]).toBeInTheDocument();
    });

    it('should handle zero amounts', () => {
      const zeroTransactions: Transaction[] = [{
        id: '1',
        type: 'income',
        description: 'Free item',
        category: 'Vendas',
        amount: 0,
        date: '10/12/2025',
        time: '10:00'
      }];

      render(
        <Transactions
          transactions={zeroTransactions}
          salesRecords={[]}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getAllByText('R$ 0.00').length).toBeGreaterThan(0);
    });

    it('should handle missing initial dates', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate=""
          endDate=""
        />
      );

      // Should have date inputs rendered
      const startInput = screen.getByLabelText(/data inicial/i);
      const endInput = screen.getByLabelText(/data final/i);
      expect(startInput).toBeInTheDocument();
      expect(endInput).toBeInTheDocument();
      // Component sets default dates internally when empty string is passed
      expect(startInput.getAttribute('value')).toBeTruthy();
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe('Accessibility', () => {
    it('should have skip to content link', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByText(/pular para conteúdo/i)).toBeInTheDocument();
    });

    it('should have proper ARIA labels for inputs', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByLabelText(/data inicial/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data final/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/buscar transação ou venda/i)).toBeInTheDocument();
    });

    it('should have role="region" for main sections', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByRole('region', { name: /resumo financeiro/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /listas de entradas e saídas/i })).toBeInTheDocument();
    });

    it('should have aria-live regions for dynamic content', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      const incomeCount = screen.getByText(/4 registros/i);
      expect(incomeCount).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByRole('heading', { name: /financeiro/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /^entradas$/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /^saídas$/i, level: 2 })).toBeInTheDocument();
    });

    it('should have role="group" for action buttons', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(screen.getByRole('group', { name: /ações de lançamento/i })).toBeInTheDocument();
    });
  });

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should integrate sales and transactions in income list', () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      // Should show both manual income and sales
      expect(screen.getByText('Venda de produtos')).toBeInTheDocument(); // manual
      expect(screen.getByText('Venda #sale1')).toBeInTheDocument(); // from sales
    });

    it('should sort transactions correctly', () => {
      const { sortTransactionsDesc } = require('@/utils/format');

      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      expect(sortTransactionsDesc).toHaveBeenCalled();
    });

    it('should update summary when filters change', async () => {
      render(
        <Transactions
          transactions={mockTransactions}
          salesRecords={mockSalesRecords}
          onAddTransaction={mockOnAddTransaction}
          startDate="2025-12-01"
          endDate="2025-12-31"
        />
      );

      // Initial balance
      const balanceCard = screen.getByText(/^saldo$/i).closest('.p-6');
      expect(within(balanceCard!).getByText(/- R\$ 220\.00/)).toBeInTheDocument();

      // Change date range to exclude some transactions
      const startDateInput = screen.getByLabelText(/data inicial/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-12-10');

      // Balance should update
      await waitFor(() => {
        const newBalanceCard = screen.getByText(/^saldo$/i).closest('.p-6');
        // Only includes transactions from 10/12 onwards
        expect(within(newBalanceCard!).queryByText(/- R\$ 220\.00/)).not.toBeInTheDocument();
      });
    });
  });
});
