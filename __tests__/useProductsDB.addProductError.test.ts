import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductsDB } from '../hooks/useProductsDB';
import { toast } from 'sonner';
import { silenceConsole } from './utils/testUtils';

// Mock do Supabase
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
      insert: jest.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
      eq: jest.fn().mockReturnThis()
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

describe('useProductsDB.addProductError', () => {
  let restoreConsole: () => void;
  beforeEach(() => {
    jest.clearAllMocks();
    restoreConsole = silenceConsole();
  });
  afterEach(() => restoreConsole?.());

  it('deve lidar com erro ao adicionar produto', async () => {
    const { result } = renderHook(() => useProductsDB());
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    await act(async () => {
      await result.current.addProduct({ name: 'Test', price: 10, stock: 5 });
    });
    
    expect(toast.error).toHaveBeenCalledWith('Erro ao adicionar produto');
  });
});
