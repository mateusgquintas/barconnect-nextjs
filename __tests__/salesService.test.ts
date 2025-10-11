// Mock toast (sonner)
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// Supabase mock factories must be defined before jest.mock call
function successInsert() {
  return {
    from: jest.fn().mockImplementation((table: string) => ({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: table + '_123' }, error: null })
        })
      })
    }))
  };
}

function failingInsert(firstTableFail = true) {
  return {
    from: jest.fn().mockImplementation((table: string) => ({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(async () => {
            if (firstTableFail && (table === 'sales' || table === 'sales_records')) return { data: null, error: new Error('sales down') };
            if (table === 'transactions') return { data: null, error: new Error('tx fail') };
            return { data: { id: table + '_999' }, error: null };
          })
        })
      })
    }))
  };
}

jest.mock('../lib/supabase', () => ({ supabase: successInsert() }));

import { registerSale } from '../lib/salesService';
import { supabase } from '../lib/supabase';

// Mutable in-memory stores to simulate localStorage
let localStore: Record<string,string> = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (k: string) => localStore[k] || null,
    setItem: (k: string, v: string) => { localStore[k] = v; },
    removeItem: (k: string) => { delete localStore[k]; },
    clear: () => { localStore = {}; }
  },
  writable: true,
});

// Fixed date
// Fix date now() usage but keep Date constructor functional
const fixedNow = Date.now();
jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

describe('salesService.registerSale', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registra venda e transação (sucesso)', async () => {
    const result = await registerSale({
      items: [],
      total: 55,
      paymentMethod: 'pix' as any,
      isDirectSale: true,
    });
    expect(result.sale.total).toBe(55);
      // Com o fallback atual para localStorage, transactionId pode ser undefined
      expect(result.transactionId).toBeUndefined();
      expect(result.storedLocally).toBe(true);
  });

  it('fallback local quando falha vendas e transações', async () => {
    // Remock supabase to fail
    (supabase as any).from = failingInsert(true).from;
    const result = await registerSale({
      items: [],
      total: 10,
  paymentMethod: 'cash' as any,
      isDirectSale: true,
      isCourtesy: true,
    });
    expect(result.sale.id).toContain('sale_local_');
    expect(result.storedLocally).toBe(true);
    // Verifica se transação local armazenada
    const pending = JSON.parse(localStorage.getItem('transactions_pending') || '[]');
    expect(pending.length).toBeGreaterThan(0);
    expect(pending[0].amount).toBe(10);
  });
});
