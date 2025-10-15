import { renderHook, act, waitFor } from '@testing-library/react';
import { silenceConsole, createSupabaseChain, overrideSupabaseFrom } from './utils/testUtils';
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('useComandasDB', () => {
  let restoreConsole: () => void;
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    restoreConsole = silenceConsole();
  });
  afterEach(() => restoreConsole?.());

  it('busca comandas e prioriza localStorage', async () => {
    // Prepara localStorage
    window.localStorage.setItem('comanda_items_1', JSON.stringify([
      { product_id: 'p1', product_name: 'Coca', product_price: '5', quantity: 3 }
    ]));
    const restore = overrideSupabaseFrom(() => createSupabaseChain({
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            number: 101,
            customer_name: 'Cliente Teste',
            created_at: new Date().toISOString(),
            status: 'open',
            comanda_items: [
              { product_id: 'p1', product_name: 'Coca', product_price: '5', quantity: 2 }
            ],
            items: null,
            data: null
          }
        ],
        error: null
      })
    }));
    const { useComandasDB } = require('../hooks/useComandasDB');
    const { result } = renderHook(() => useComandasDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.comandas[0].items[0].product.name).toBe('Coca');
    expect(result.current.comandas[0].items[0].quantity).toBe(3);
    restore();
  });

  it('usa comanda_items do banco se localStorage vazio', async () => {
    const restore = overrideSupabaseFrom(() => createSupabaseChain({
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            number: 101,
            customer_name: 'Cliente Teste',
            created_at: new Date().toISOString(),
            status: 'open',
            comanda_items: [
              { product_id: 'p1', product_name: 'Coca', product_price: '5', quantity: 2 }
            ],
            items: null,
            data: null
          }
        ],
        error: null
      })
    }));
    const { useComandasDB } = require('../hooks/useComandasDB');
    const { result } = renderHook(() => useComandasDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.comandas[0].items[0].product.name).toBe('Coca');
    expect(result.current.comandas[0].items[0].quantity).toBe(2);
    restore();
  });

  it('trata erro do supabase e dispara toast', async () => {
    const restore = overrideSupabaseFrom(() => createSupabaseChain({
      order: jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } })
    }));
    const { useComandasDB } = require('../hooks/useComandasDB');
    const { toast } = require('sonner');
    const { result } = renderHook(() => useComandasDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(toast.error).toHaveBeenCalledWith('Erro ao carregar comandas');
    restore();
  });

  it('trata JSON inválido no campo items', async () => {
    const restore = overrideSupabaseFrom(() => createSupabaseChain({
      order: jest.fn().mockResolvedValue({
        data: [{
          id: '2',
          number: 102,
          customer_name: 'Cliente X',
          created_at: new Date().toISOString(),
          status: 'open',
          comanda_items: [],
          items: 'INVALID_JSON',
          data: null
        }],
        error: null
      })
    }));
    const { useComandasDB } = require('../hooks/useComandasDB');
    const { result } = renderHook(() => useComandasDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.comandas[0].items).toEqual([]);
    restore();
  });

  it('retorna lista vazia se não houver comandas', async () => {
    const restore = overrideSupabaseFrom(() => createSupabaseChain({
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    }));
    const { useComandasDB } = require('../hooks/useComandasDB');
    const { result } = renderHook(() => useComandasDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.comandas).toEqual([]);
    restore();
  });
});
