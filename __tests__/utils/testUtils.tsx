/**
 * Utilitários de teste para garantir consistência e reutilização
 * Infraestrutura robusta para testes de longo prazo
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { PaymentMethod, OrderItem, Product, SaleRecord, Transaction } from '@/types';

// Providers de contexto se necessário (para testes futuros)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Factory para criar dados de teste consistentes
export const TestDataFactory = {
  createProduct: (overrides: Partial<Product> = {}): Product => ({
    id: 'prod-1',
    name: 'Test Product',
    price: 10.0,
    stock: 100,
    category: 'bebidas',
    ...overrides,
  }),

  createOrderItem: (overrides: Partial<OrderItem> = {}): OrderItem => ({
    product: TestDataFactory.createProduct(),
    quantity: 1,
    ...overrides,
  }),

  createSaleRecord: (overrides: Partial<SaleRecord> = {}): SaleRecord => ({
    id: 'sale-1',
    items: [TestDataFactory.createOrderItem()],
    total: 10.0,
    paymentMethod: 'cash' as PaymentMethod,
    date: '2025-10-09',
    time: '14:30',
    isDirectSale: true,
    isCourtesy: false,
    createdBy: 'Test User',
    ...overrides,
  }),

  createTransaction: (overrides: Partial<Transaction> = {}): Transaction => ({
    id: 'trans-1',
    type: 'income',
    description: 'Test transaction',
    amount: 10.0,
    category: 'Vendas',
    date: '2025-10-09',
    time: '14:30',
    ...overrides,
  }),

  createComanda: (overrides: any = {}) => ({
    id: 'cmd-1',
    number: 123,
    customerName: 'Test Customer',
    items: [TestDataFactory.createOrderItem()],
    createdAt: new Date('2025-10-09T14:30:00'),
    status: 'open' as const,
    createdBy: 'Test User',
    ...overrides,
  }),

  // Utilitários para grandes datasets utilizados em testes de performance
  createProductSet: (count: number): Product[] =>
    Array.from({ length: count }, (_, i) =>
      TestDataFactory.createProduct({ id: `prod-${i + 1}`, name: `Product ${i + 1}` })
    ),

  createSalesSet: (count: number): SaleRecord[] =>
    Array.from({ length: count }, (_, i) =>
      TestDataFactory.createSaleRecord({
        id: `sale-${i + 1}`,
        total: 10 + i,
        date: `2025-10-${(i % 30 + 1).toString().padStart(2, '0')}`,
      })
    ),

  createTransactionSet: (count: number): Transaction[] =>
    Array.from({ length: count }, (_, i) =>
      TestDataFactory.createTransaction({
        id: `trans-${i + 1}`,
        amount: 10 + i,
        date: `2025-10-${(i % 30 + 1).toString().padStart(2, '0')}`,
      })
    ),
};

// Helpers para assertivas de valores monetários
export const MoneyMatchers = {
  // Aceita diferentes formatos de moeda (R$ 10,00 ou R$ 10.00)
  toMatchCurrency: (value: number) => new RegExp(`R\\$\\s*${value.toString().replace('.', '[.,]')}`),
  // Para valores exatos
  toMatchExactCurrency: (value: string) => new RegExp(`R\\$\\s*${value.replace('.', '[.,]')}`),
};

// Mock helpers para hooks
export const MockHookFactory = {
  createUseSalesDB: (overrides: any = {}) => ({
    sales: [TestDataFactory.createSaleRecord()],
    loading: false,
    addSale: jest.fn(),
    fetchSales: jest.fn(),
    ...overrides,
  }),

  createUseTransactionsDB: (overrides: any = {}) => ({
    transactions: [TestDataFactory.createTransaction()],
    loading: false,
    addTransaction: jest.fn(),
    refetch: jest.fn(),
    ...overrides,
  }),

  createUseProductsDB: (overrides: any = {}) => ({
    products: [TestDataFactory.createProduct()],
    loading: false,
    addProduct: jest.fn(),
    fetchProducts: jest.fn(),
    ...overrides,
  }),

  createUseComandasDB: (overrides: any = {}) => ({
    comandas: [TestDataFactory.createComanda()],
    loading: false,
    createComanda: jest.fn(),
    addItemToComanda: jest.fn(),
    removeItem: jest.fn(),
    closeComanda: jest.fn(),
    deleteComanda: jest.fn(),
    refetch: jest.fn(),
    ...overrides,
  }),
};

// Cenários de teste pré-definidos
export const TestScenarios = {
  emptyOrder: {
    items: [],
    total: 0,
  },

  singleItem: {
    items: [TestDataFactory.createOrderItem({ quantity: 1 })],
    total: 10.0,
  },

  multipleItems: {
    items: [
      TestDataFactory.createOrderItem({
        product: TestDataFactory.createProduct({ id: 'prod-1', name: 'Cerveja', price: 5.0 }),
        quantity: 2,
      }),
      TestDataFactory.createOrderItem({
        product: TestDataFactory.createProduct({ id: 'prod-2', name: 'Refrigerante', price: 3.0 }),
        quantity: 1,
      }),
    ],
    total: 13.0,
  },

  highValueOrder: {
    items: [
      TestDataFactory.createOrderItem({
        product: TestDataFactory.createProduct({ price: 50.0 }),
        quantity: 3,
      }),
    ],
    total: 150.0,
  },
};

// Helpers para testar fluxos específicos
export const FlowHelpers = {
  async completeDirectSale(userEvent: any, screen: any, paymentMethod: PaymentMethod = 'cash') {
    const paymentButtons: Record<PaymentMethod, string> = {
      cash: 'Dinheiro',
      credit: 'Crédito',
      debit: 'Débito',
      pix: 'Pix',
      courtesy: 'Cortesia',
    };

    const button = screen.getByText(paymentButtons[paymentMethod]);
    await userEvent.click(button);

    const confirmButton = screen.getByText('Confirmar Pagamento');
    await userEvent.click(confirmButton);
  },

  async completeComandaSale(userEvent: any, screen: any, paymentMethod: PaymentMethod = 'cash') {
    // Mesmo fluxo da venda direta, mas pode ser estendido para comandas específicas
    return FlowHelpers.completeDirectSale(userEvent, screen, paymentMethod);
  },
};

// Validators para assertivas complexas
export const TestValidators = {
  validateSaleCreation: (mockAddSale: jest.Mock, expectedSale: Partial<SaleRecord>) => {
    expect(mockAddSale).toHaveBeenCalledWith(expect.objectContaining(expectedSale));
  },

  validateTransactionCreation: (mockAddTransaction: jest.Mock, expectedTransaction: Partial<Transaction>) => {
    expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining(expectedTransaction));
  },

  validateTotalsCalculation: (transactions: Transaction[]) => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  },
};

// Setup padrão para testes de integração
export const setupIntegrationTest = () => {
  const mockFunctions = {
    addSale: jest.fn(),
    addTransaction: jest.fn(),
    refetchTransactions: jest.fn(),
    createComanda: jest.fn(),
    addItemToComanda: jest.fn(),
  };

  return {
    ...mockFunctions,
    // Reset all mocks
    resetAll: () => {
      Object.values(mockFunctions).forEach((mock: any) => mock.mockReset());
    },
  };
};
// Alias para datasets (compatibilidade com imports antigos)
export const createProductSet = TestDataFactory.createProductSet;
export const createSalesSet = TestDataFactory.createSalesSet;
export const createTransactionSet = TestDataFactory.createTransactionSet;

// =====================
// Supabase + Console Utils
// =====================

// Conjunto padrão de produtos para mocks de fetch
export const defaultProducts = [
  { id: '1', name: 'Coca', price: '5', stock: 10 },
  { id: '2', name: 'Fanta', price: 4, stock: 2, category: null },
];

// Cria um objeto encadeável semelhante ao cliente do Supabase usado nos hooks
export const createSupabaseChain = (overrides: Record<string, any> = {}) => ({
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: defaultProducts, error: null }),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockResolvedValue({ error: null }),
  ...overrides,
});

// Substitui temporariamente supabase.from e retorna uma função de restauração
export const overrideSupabaseFrom = (factory: () => any) => {
  // Import dinâmico para usar o mesmo módulo mockado no teste
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { supabase } = require('../../lib/supabase');
  const original = supabase.from;
  supabase.from = jest.fn(() => factory());
  return () => {
    supabase.from = original;
  };
};

// Silencia console.error, console.warn e console.log durante testes verbosos
export const silenceConsole = () => {
  const spies = [
    jest.spyOn(console, 'error').mockImplementation(() => {}),
    jest.spyOn(console, 'warn').mockImplementation(() => {}),
    jest.spyOn(console, 'log').mockImplementation(() => {}),
  ];
  return () => spies.forEach((s) => s.mockRestore());
};