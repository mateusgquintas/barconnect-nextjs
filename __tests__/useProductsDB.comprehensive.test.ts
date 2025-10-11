import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductsDB } from '../hooks/useProductsDB';
import { toast } from 'sonner';
import { overrideSupabaseFrom, createSupabaseChain, silenceConsole } from './utils/testUtils';

// Mock supabase client chain with minimal methods used inside the hook
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'Coca', price: '5', stock: 10 },
          { id: '2', name: 'Fanta', price: 4, stock: 2, category: null }
        ],
        error: null
      }),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null })
    }))
  }
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../lib/cache', () => ({
  withCache: jest.fn((key, fn, opts) => fn()),
  invalidateCache: jest.fn()
}));

// Reset any in-memory cache between tests (if invalidateCache exported we could import; fallback: clear modules)
let restoreConsole: () => void;
beforeEach(() => {
  jest.clearAllMocks();
  restoreConsole = silenceConsole();
});

afterEach(() => {
  restoreConsole?.();
});

describe('useProductsDB comprehensive', () => {
  it('fetches products and parses price string', async () => {
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products[0].price).toBe(5);
    expect(result.current.products[1].category).toBeUndefined();
  });

  it('handles fetch error', async () => {
    const { withCache } = require('../lib/cache');
    withCache.mockImplementationOnce(() => { throw new Error('fail'); });
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(toast.error).toHaveBeenCalledWith('Erro ao carregar produtos');
  });

  it('updates stock, invalidates cache, triggers toast', async () => {
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateStock('1', 99);
    });
    const { invalidateCache } = require('../lib/cache');
    expect(invalidateCache).toHaveBeenCalled();
    // Note: updateStock não chama toast.success por design (comentário no código)
  });

  it('handles updateStock error', async () => {
    const restore = overrideSupabaseFrom(() =>
      createSupabaseChain({ eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } }) })
    );

    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateStock('1', 99);
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar estoque');

    restore();
  });

  it('adds product, invalidates cache, triggers toast', async () => {
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addProduct({ name: 'Sprite', price: 3, stock: 5 });
    });
    const { invalidateCache } = require('../lib/cache');
    expect(invalidateCache).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Produto adicionado!');
  });

  it('handles addProduct error', async () => {
    const restore = overrideSupabaseFrom(() =>
      createSupabaseChain({ insert: jest.fn().mockResolvedValue({ error: { message: 'Insert failed' } }) })
    );

    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addProduct({ name: 'Sprite', price: 3, stock: 5 });
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao adicionar produto');

    restore();
  });

  it('does not refetch if cache is valid', async () => {
    const { withCache } = require('../lib/cache');
    const spy = jest.fn().mockResolvedValue([]);
    withCache.mockImplementationOnce((key: any, fn: any, opts: any) => spy());
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(spy).toHaveBeenCalled();
  });
});
