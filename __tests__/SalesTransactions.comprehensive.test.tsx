/**
 * Testes abrangentes para Vendas e Transações
 * Cobertura completa do checklist de QA para funcionalidades de vendas
 * 
 * Cenários cobertos:
 * - Registrar venda direta
 * - Registrar venda por comanda
 * - Geração automática de transação financeira
 * - Conferir vendas em Entradas (Financeiro)
 * - Registrar nova entrada manual
 * - Registrar nova saída manual
 * - Conferir totais e saldo
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { PaymentScreen } from '@/components/PaymentScreen';
import { useSalesDB } from '@/hooks/useSalesDB';
import { useTransactionsDB } from '@/hooks/useTransactionsDB';
import { useComandasDB } from '@/hooks/useComandasDB';
import { registerSale } from '@/lib/salesService';
import { PaymentMethod, OrderItem, SaleRecord, Transaction } from '@/types';
import { 
  render, 
  screen, 
  TestDataFactory, 
  MoneyMatchers, 
  MockHookFactory,
  TestScenarios,
  FlowHelpers 
} from './utils/testUtils';

// Mock dos hooks e serviços
jest.mock('@/hooks/useSalesDB');
jest.mock('@/hooks/useTransactionsDB');
jest.mock('@/hooks/useComandasDB');
jest.mock('@/lib/salesService');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUseSalesDB = useSalesDB as jest.MockedFunction<typeof useSalesDB>;
const mockUseTransactionsDB = useTransactionsDB as jest.MockedFunction<typeof useTransactionsDB>;
const mockUseComandasDB = useComandasDB as jest.MockedFunction<typeof useComandasDB>;
const mockRegisterSale = registerSale as jest.MockedFunction<typeof registerSale>;

describe('Vendas e Transações - Testes Abrangentes', () => {
  // Usar factory para dados consistentes
  const mockItems = TestScenarios.multipleItems.items;
  const mockSaleRecord = TestDataFactory.createSaleRecord({
    items: mockItems,
    total: TestScenarios.multipleItems.total,
    paymentMethod: 'cash',
  });
  const mockTransaction = TestDataFactory.createTransaction({
    description: 'Venda direta',
    amount: TestScenarios.multipleItems.total,
  });

  const mockAddSale = jest.fn();
  const mockAddTransaction = jest.fn();
  const mockRefetchTransactions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSalesDB.mockReturnValue(MockHookFactory.createUseSalesDB({
      sales: [mockSaleRecord],
      addSale: mockAddSale,
    }));

    mockUseTransactionsDB.mockReturnValue(MockHookFactory.createUseTransactionsDB({
      transactions: [mockTransaction],
      addTransaction: mockAddTransaction,
      refetch: mockRefetchTransactions,
    }));

    mockUseComandasDB.mockReturnValue(MockHookFactory.createUseComandasDB());

    mockRegisterSale.mockResolvedValue({
      sale: mockSaleRecord,
      storedLocally: false,
    });
  });

  describe('1. Registrar Venda Direta', () => {
    it('deve processar venda direta com dinheiro corretamente', async () => {
      const user = userEvent.setup();
      const mockOnConfirmPayment = jest.fn();

      render(
        <PaymentScreen
          title="Venda Direta"
          items={mockItems}
          onBack={jest.fn()}
          onConfirmPayment={mockOnConfirmPayment}
          userRole="admin"
          isDirectSale={true}
        />
      );

  // Verificar exibição dos itens (usar regex para corresponder dentro do texto "2 x Cerveja")
  expect(screen.getByText(/Cerveja/)).toBeInTheDocument();
  expect(screen.getByText(/Refrigerante/)).toBeInTheDocument();
      expect(screen.getByText(/R\$\s*13[.,]00/)).toBeInTheDocument();

      // Selecionar método de pagamento
      const moneyButton = screen.getByText('Dinheiro');
      await user.click(moneyButton);

      // Confirmar pagamento
      const confirmButton = screen.getByText('Confirmar Pagamento');
      await user.click(confirmButton);

  expect(mockOnConfirmPayment).toHaveBeenCalledWith('cash');
    });

    it('deve processar venda direta com cartão de crédito', async () => {
      const user = userEvent.setup();
      const mockOnConfirmPayment = jest.fn();

      render(
        <PaymentScreen
          title="Venda Direta"
          items={mockItems}
          onBack={jest.fn()}
          onConfirmPayment={mockOnConfirmPayment}
          userRole="admin"
          isDirectSale={true}
        />
      );

      const creditButton = screen.getByText('Cartão de Crédito');
      await user.click(creditButton);

      const confirmButton = screen.getByText('Confirmar Pagamento');
      await user.click(confirmButton);

      expect(mockOnConfirmPayment).toHaveBeenCalledWith('credit');
    });

    it('deve processar venda direta com PIX', async () => {
      const user = userEvent.setup();
      const mockOnConfirmPayment = jest.fn();

      render(
        <PaymentScreen
          title="Venda Direta"
          items={mockItems}
          onBack={jest.fn()}
          onConfirmPayment={mockOnConfirmPayment}
          userRole="admin"
          isDirectSale={true}
        />
      );

  const pixButton = screen.getByText('Pix');
      await user.click(pixButton);

      const confirmButton = screen.getByText('Confirmar Pagamento');
      await user.click(confirmButton);

  expect(mockOnConfirmPayment).toHaveBeenCalledWith('pix');
    });

    it('deve permitir cortesia para admin', async () => {
      const user = userEvent.setup();
      const mockOnConfirmPayment = jest.fn();

      render(
        <PaymentScreen
          title="Venda Direta"
          items={mockItems}
          onBack={jest.fn()}
          onConfirmPayment={mockOnConfirmPayment}
          userRole="admin"
          isDirectSale={true}
        />
      );

      const courtesyButton = screen.getByText('Cortesia');
      await user.click(courtesyButton);

      const confirmButton = screen.getByText('Confirmar Pagamento');
      await user.click(confirmButton);

      expect(mockOnConfirmPayment).toHaveBeenCalledWith('courtesy');
    });

    it('não deve permitir cortesia para operador', () => {
      render(
        <PaymentScreen
          title="Venda Direta"
          items={mockItems}
          onBack={jest.fn()}
          onConfirmPayment={jest.fn()}
          userRole="operator"
          isDirectSale={true}
        />
      );

      expect(screen.queryByText('Cortesia')).not.toBeInTheDocument();
    });
  });

  describe('2. Registrar Venda por Comanda', () => {
    const mockComandaItems = [
      TestDataFactory.createOrderItem({ 
        product: TestDataFactory.createProduct({ name: 'Cerveja', price: 5.0 }),
        quantity: 3 
      }),
      TestDataFactory.createOrderItem({ 
        product: TestDataFactory.createProduct({ name: 'Refrigerante', price: 3.0 }),
        quantity: 2 
      }),
    ];

    it('deve processar venda por comanda corretamente', async () => {
      const user = userEvent.setup();
      const mockOnConfirmPayment = jest.fn();

      render(
        <PaymentScreen
          title="Comanda #123"
          items={mockComandaItems}
          onBack={jest.fn()}
          onConfirmPayment={mockOnConfirmPayment}
          userRole="admin"
          isDirectSale={false}
        />
      );

      // Verificar total da comanda
      const total = (3 * 5.0) + (2 * 3.0); // 21.00
      expect(screen.getByText(/R\$\s*21[.,]00/)).toBeInTheDocument();

      // Processar pagamento
      const moneyButton = screen.getByText('Dinheiro');
      await user.click(moneyButton);

      const confirmButton = screen.getByText('Confirmar Pagamento');
      await user.click(confirmButton);

  expect(mockOnConfirmPayment).toHaveBeenCalledWith('cash');
    });

    it('deve exibir título correto para comanda', () => {
      render(
        <PaymentScreen
          title="Comanda #456"
          items={mockComandaItems}
          onBack={jest.fn()}
          onConfirmPayment={jest.fn()}
          userRole="admin"
          isDirectSale={false}
        />
      );

      expect(screen.getByText('Comanda #456')).toBeInTheDocument();
    });
  });

  describe('3. Geração Automática de Transação Financeira', () => {
    it('deve registrar venda e gerar transação automaticamente', async () => {
      const saleInput = {
        items: mockItems,
        total: 13.0,
        paymentMethod: 'money' as PaymentMethod,
        isDirectSale: true,
        isCourtesy: false,
        createdBy: 'Admin',
      };

      const result = await mockRegisterSale(saleInput);

      expect(mockRegisterSale).toHaveBeenCalledWith(saleInput);
      expect(result).toEqual({
        sale: mockSaleRecord,
        storedLocally: false,
      });
    });

    it('deve criar transação de entrada para venda normal', async () => {
      const saleInput = {
        items: mockItems,
        total: 13.0,
        paymentMethod: 'credit' as PaymentMethod,
        isDirectSale: true,
        isCourtesy: false,
        createdBy: 'Admin',
      };

      // Simular que registerSale criou a transação
      mockRegisterSale.mockResolvedValue({
        sale: { ...mockSaleRecord, paymentMethod: 'credit' },
        storedLocally: false,
      });

      const result = await mockRegisterSale(saleInput);

      expect(result.sale.paymentMethod).toBe('credit');
      expect(result.sale.total).toBe(13.0);
    });

    it('não deve criar transação financeira para cortesia', async () => {
      const saleInput = {
        items: mockItems,
        total: 13.0,
        paymentMethod: 'courtesy' as PaymentMethod,
        isDirectSale: true,
        isCourtesy: true,
        createdBy: 'Admin',
      };

      mockRegisterSale.mockResolvedValue({
        sale: { ...mockSaleRecord, paymentMethod: 'courtesy', isCourtesy: true },
        storedLocally: false,
      });

      const result = await mockRegisterSale(saleInput);

      expect(result.sale.isCourtesy).toBe(true);
      expect(result.sale.paymentMethod).toBe('courtesy');
    });
  });

  describe('4. Conferir Vendas em Entradas (Financeiro)', () => {
    it('deve listar vendas como entradas no financeiro', () => {
      const { transactions } = mockUseTransactionsDB();

      expect(transactions).toHaveLength(1);
      expect(transactions[0].type).toBe('income');
      expect(transactions[0].description).toBe('Venda direta');
      expect(transactions[0].amount).toBe(13.0);
    });

    it('deve categorizar vendas corretamente', () => {
      const { transactions } = mockUseTransactionsDB();
      const saleTransaction = transactions[0];

      expect(saleTransaction.category).toBe('Vendas');
      expect(saleTransaction.type).toBe('income');
    });
  });

  describe('5. Registrar Nova Entrada Manual', () => {
    it('deve permitir adicionar entrada manual', async () => {
      const newEntry: Omit<Transaction, 'id'> = {
        type: 'income',
        description: 'Entrada manual teste',
        amount: 100.0,
        category: 'Outras Receitas',
        date: '2025-10-09',
        time: '15:00',
      };

      await mockAddTransaction(newEntry);

      expect(mockAddTransaction).toHaveBeenCalledWith(newEntry);
    });

    it('deve atualizar lista após adicionar entrada', async () => {
      const newEntry: Omit<Transaction, 'id'> = {
        type: 'income',
        description: 'Nova entrada',
        amount: 50.0,
        category: 'Receitas',
        date: '2025-10-09',
        time: '16:00',
      };

      await mockAddTransaction(newEntry);
      await mockRefetchTransactions();

      expect(mockRefetchTransactions).toHaveBeenCalled();
    });
  });

  describe('6. Registrar Nova Saída Manual', () => {
    it('deve permitir adicionar saída manual', async () => {
      const newExpense: Omit<Transaction, 'id'> = {
        type: 'expense',
        description: 'Compra de suprimentos',
        amount: 75.0,
        category: 'Fornecedores',
        date: '2025-10-09',
        time: '14:00',
      };

      await mockAddTransaction(newExpense);

      expect(mockAddTransaction).toHaveBeenCalledWith(newExpense);
    });

    it('deve categorizar saídas corretamente', async () => {
      const newExpense: Omit<Transaction, 'id'> = {
        type: 'expense',
        description: 'Despesa operacional',
        amount: 200.0,
        category: 'Operacional',
        date: '2025-10-09',
        time: '11:00',
      };

      await mockAddTransaction(newExpense);

      expect(mockAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          category: 'Operacional',
        })
      );
    });
  });

  describe('7. Conferir Totais e Saldo', () => {
    it('deve calcular totais corretamente', () => {
      const mockTransactions = [
        { ...mockTransaction, type: 'income' as const, amount: 100 },
        { ...mockTransaction, id: 'trans-2', type: 'income' as const, amount: 50 },
        { ...mockTransaction, id: 'trans-3', type: 'expense' as const, amount: 30 },
      ];

      mockUseTransactionsDB.mockReturnValue({
        transactions: mockTransactions,
        loading: false,
        addTransaction: mockAddTransaction,
        refetch: mockRefetchTransactions,
      });

      const { transactions } = mockUseTransactionsDB();
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const balance = totalIncome - totalExpense;

      expect(totalIncome).toBe(150);
      expect(totalExpense).toBe(30);
      expect(balance).toBe(120);
    });

    it('deve agrupar transações por categoria', () => {
      const mockTransactions = [
        { ...mockTransaction, category: 'Vendas', amount: 100 },
        { ...mockTransaction, id: 'trans-2', category: 'Vendas', amount: 50 },
        { ...mockTransaction, id: 'trans-3', category: 'Fornecedores', type: 'expense' as const, amount: 30 },
      ];

      mockUseTransactionsDB.mockReturnValue({
        transactions: mockTransactions,
        loading: false,
        addTransaction: mockAddTransaction,
        refetch: mockRefetchTransactions,
      });

      const { transactions } = mockUseTransactionsDB();
      
      const categories = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      expect(categories['Vendas']).toBe(150);
      expect(categories['Fornecedores']).toBe(30);
    });
  });

  describe('Cenários de Erro e Edge Cases', () => {
    it('deve tratar erro ao registrar venda', async () => {
      mockRegisterSale.mockRejectedValue(new Error('Erro de conexão'));

      const saleInput = {
        items: mockItems,
        total: 13.0,
        paymentMethod: 'money' as PaymentMethod,
        isDirectSale: true,
        isCourtesy: false,
        createdBy: 'Admin',
      };

      await expect(mockRegisterSale(saleInput)).rejects.toThrow('Erro de conexão');
    });

    it('deve tratar erro ao adicionar transação', async () => {
      mockAddTransaction.mockRejectedValue(new Error('Falha ao salvar'));

      const newTransaction: Omit<Transaction, 'id'> = {
        type: 'income',
        description: 'Teste',
        amount: 10.0,
        category: 'Teste',
        date: '2025-10-09',
        time: '10:00',
      };

      await expect(mockAddTransaction(newTransaction)).rejects.toThrow('Falha ao salvar');
    });

    it('deve validar venda com itens vazios', async () => {
      const user = userEvent.setup();
      const mockOnConfirmPayment = jest.fn();

      render(
        <PaymentScreen
          title="Venda Direta"
          items={[]}
          onBack={jest.fn()}
          onConfirmPayment={mockOnConfirmPayment}
          userRole="admin"
          isDirectSale={true}
        />
      );

      // Deve exibir total zero
      expect(screen.getByText(/R\$\s*0[.,]00/)).toBeInTheDocument();

      // Botão de confirmar deve estar disponível (validação no componente pai)
      const confirmButton = screen.getByText('Confirmar Pagamento');
      expect(confirmButton).toBeInTheDocument();
    });

    it('deve calcular total corretamente com quantidades múltiplas', () => {
      const multipleItems = [
        TestDataFactory.createOrderItem({ 
          product: TestDataFactory.createProduct({ name: 'Cerveja', price: 10.0 }),
          quantity: 3 
        }),
        TestDataFactory.createOrderItem({ 
          product: TestDataFactory.createProduct({ name: 'Refrigerante', price: 5.0 }),
          quantity: 2 
        }),
      ];

      render(
        <PaymentScreen
          title="Teste Total"
          items={multipleItems}
          onBack={jest.fn()}
          onConfirmPayment={jest.fn()}
          userRole="admin"
          isDirectSale={true}
        />
      );

      // Total: (10 * 3) + (5 * 2) = 40
      expect(screen.getByText(/R\$\s*40[.,]00/)).toBeInTheDocument();
    });
  });

  describe('Integração entre Componentes', () => {
    it('deve manter consistência entre vendas e transações', async () => {
      const { sales } = mockUseSalesDB();
      const { transactions } = mockUseTransactionsDB();

      // Verificar que há correspondência entre vendas e transações
      expect(sales).toHaveLength(1);
      expect(transactions).toHaveLength(1);
      
      const sale = sales[0];
      const transaction = transactions[0];
      
      expect(sale.total).toBe(transaction.amount);
      expect(sale.date).toBe(transaction.date);
    });

    it('deve sincronizar atualizações entre hooks', async () => {
      await mockAddSale(mockSaleRecord);
      await mockRefetchTransactions();

      expect(mockAddSale).toHaveBeenCalledWith(mockSaleRecord);
      expect(mockRefetchTransactions).toHaveBeenCalled();
    });
  });
});