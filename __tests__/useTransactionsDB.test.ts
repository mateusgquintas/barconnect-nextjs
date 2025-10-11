import { renderHook, act, waitFor } from '@testing-library/react';
import { invalidateCache } from '../lib/cache';
import { useTransactionsDB } from '../hooks/useTransactionsDB';
import { silenceConsole, overrideSupabaseFrom, createSupabaseChain } from './utils/testUtils';


jest.mock('../utils/notify', () => ({
  notifyError: jest.fn(),
  notifySuccess: jest.fn(),
}));

// Mutable dataset reused inside mock

let rows: any[];

jest.mock('../lib/supabase', () => {
  // O mock padrão usa dataset mutável para simular o banco
  return {
    supabase: {
      from: (table: string) => createSupabaseChain({
        order: jest.fn().mockResolvedValue({ data: rows, error: null }),
        insert: jest.fn((payload: any) => {
          const row = Array.isArray(payload) ? payload[0] : payload;
          const id = row.id || `new_${Math.random().toString(36).slice(2,8)}`;
          rows.unshift({ id, ...row, created_at: new Date().toISOString() });
          return Promise.resolve({ error: null });
        })
      })
    }
  };
});


describe('useTransactionsDB', () => {
  let restoreConsole: () => void;
  beforeEach(() => {
    rows = [
      { id: 't2', type: 'income', description: 'Venda B', amount: 40, category: 'Vendas', created_at: new Date(Date.now()-2000).toISOString(), date: undefined, time: undefined },
      { id: 't1', type: 'income', description: 'Venda A', amount: 20, category: 'Vendas', created_at: new Date(Date.now()-4000).toISOString(), date: undefined, time: undefined },
    ];
    invalidateCache(/transactions:list/);
    restoreConsole = silenceConsole();
  });
  afterEach(() => restoreConsole?.());

  it('carrega transações iniciais', async () => {
    const { result } = renderHook(() => useTransactionsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.transactions[0].amount).toBe(40);
  });

  it('adiciona transação e refetch', async () => {
    const { result } = renderHook(() => useTransactionsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addTransaction({ type: 'income', description: 'Nova', amount: 99, category: 'Outros' });
    });
    await waitFor(() => expect(result.current.transactions.some(t => t.description === 'Nova')).toBe(true));
    expect(result.current.transactions[0].description).toBe('Nova');
  });
});
