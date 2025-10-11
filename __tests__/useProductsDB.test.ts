import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductsDB } from '../hooks/useProductsDB';

// Mock supabase client chain with minimal methods used inside the hook
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'Coca', price: 5, stock: 10 },
          { id: '2', name: 'Fanta', price: 4, stock: 2 }
        ],
        error: null
      })
    })),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null })
  }
}));

// Reset any in-memory cache between tests (if invalidateCache exported we could import; fallback: clear modules)
beforeEach(() => {
  jest.resetModules();
});

describe('useProductsDB', () => {
  it('fetches and exposes products', async () => {
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(2);
    expect(result.current.products[0].name).toBe('Coca');
  });

  it('updates stock and triggers refresh logic', async () => {
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateStock('1', 20);
    });
    // Still two products after refresh
    expect(result.current.products).toHaveLength(2);
  });

  it('adds product and triggers refresh logic', async () => {
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addProduct({ name: 'Sprite', price: 3, stock: 5 });
    });
    expect(result.current.products).toHaveLength(2);
  });
});
