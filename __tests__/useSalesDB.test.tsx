import { renderHook, act, waitFor } from '@testing-library/react';
import { useSalesDB } from '../hooks/useSalesDB';

// Mock supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
    })),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useSalesDB', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('normaliza vendas de diferentes fontes e remove duplicatas', async () => {
    // Simula fallback: supabase falha, localStorage tem vendas
    const vendasRaw = [
      {
        id: '1',
        comanda_number: 10,
        customer_name: 'João',
        items: JSON.stringify([{ product: { id: 'p1', name: 'A', price: 5, stock: 1 }, quantity: 2 }]),
        total: '10',
        paymentMethod: 'cash',
        date: '2025-10-01',
        time: '12:00',
        isDirectSale: true,
        isCourtesy: false,
        createdBy: 'admin',
      },
      {
        id: '1', // duplicada
        comandaNumber: 10,
        customerName: 'João',
        items: [{ product: { id: 'p1', name: 'A', price: 5, stock: 1 }, quantity: 2 }],
        total: 10,
        paymentMethod: 'cash',
        date: '2025-10-01',
        time: '12:00',
        isDirectSale: true,
        isCourtesy: false,
        createdBy: 'admin',
      },
      {
        id: '2',
        comanda_number: 11,
        customer_name: 'Maria',
        items: JSON.stringify([{ product: { id: 'p2', name: 'B', price: 7, stock: 1 }, quantity: 1 }]),
        total: '7',
        paymentMethod: 'pix',
        date: '2025-10-02',
        time: '13:00',
        isDirectSale: false,
        isCourtesy: false,
        createdBy: 'admin',
      },
    ];
    window.localStorage.setItem('sales_records', JSON.stringify(vendasRaw));
  const { result } = renderHook(() => useSalesDB());
  // Aguarda carregamento
  await waitFor(() => expect(result.current.loading).toBe(false));
    // Deve normalizar e remover duplicatas
    expect(result.current.sales.length).toBe(2);
    expect(result.current.sales[0].id).toBe('2'); // Mais recente primeiro
    expect(result.current.sales[1].id).toBe('1');
    expect(result.current.sales[0].items[0].product.name).toBe('B');
    expect(result.current.sales[1].items[0].product.name).toBe('A');
  });
});
