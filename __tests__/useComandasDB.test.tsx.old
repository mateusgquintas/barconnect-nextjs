import { renderHook, act, waitFor } from '@testing-library/react';
import { useComandasDB } from '../hooks/useComandasDB';
import { silenceConsole, createSupabaseChain, overrideSupabaseFrom } from './utils/testUtils';
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useComandasDB', () => {
  let restoreConsole: () => void;
  const mockComandaData = {
    id: 'cmd-1',
    number: 101,
    customer_name: 'João Silva',
    status: 'open',
    created_at: '2025-10-08T10:00:00Z',
    comanda_items: [],
    items: null,
    data: null
  };
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    restoreConsole = silenceConsole();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    restoreConsole?.();
  });

  describe('fetchComandas', () => {
    it('busca comandas com sucesso', async () => {
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [mockComandaData],
          error: null
        })
      }));
      const { result } = renderHook(() => useComandasDB());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.comandas).toHaveLength(1);
      expect(result.current.comandas[0]).toMatchObject({
        id: 'cmd-1',
        number: 101,
        customerName: 'João Silva',
        status: 'open',
        items: []
      });
      restoreSupabase();
    });

  it('utiliza itens do localStorage quando disponível', async () => {
      // Arrange
      const itemsLocalStorage = [
        {
          product_id: 'prod-1',
          product_name: 'Cerveja',
          product_price: '8.50',
          quantity: 2
        }
      ];
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'comanda_items_cmd-1') {
          return JSON.stringify(itemsLocalStorage);
        }
        return null;
      });

      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [mockComandaData],
          error: null
        })
      }));

  const { result } = renderHook(() => useComandasDB());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.comandas[0].items).toHaveLength(1);
      expect(result.current.comandas[0].items[0]).toMatchObject({
        product: {
          id: 'prod-1',
          name: 'Cerveja',
          price: 8.50
        },
        quantity: 2
      });
      restoreSupabase();
    });

  it('utiliza itens de comanda_items quando localStorage vazio', async () => {
      // Arrange - garantir que localStorage está vazio
      localStorageMock.getItem.mockReturnValue(null);
      
      const comandaWithItems = {
        ...mockComandaData,
        comanda_items: [
          {
            product_id: 'prod-2',
            product_name: 'Refrigerante',
            product_price: '5.00',
            quantity: 1
          }
        ]
      };

      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [comandaWithItems],
          error: null
        })
      }));

  const { result } = renderHook(() => useComandasDB());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('comanda_items_cmd-1');
      expect(result.current.comandas[0].items).toHaveLength(1);
      expect(result.current.comandas[0].items[0]).toMatchObject({
        product: {
          id: 'prod-2',
          name: 'Refrigerante',
          price: 5.00
        },
        quantity: 1
      });
      restoreSupabase();
    });

  it('trata erro de JSON no localStorage graciosamente', async () => {
      // Arrange
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'comanda_items_cmd-1') {
          return '{invalid json}'; // JSON inválido
        }
        return null;
      });

      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [mockComandaData],
          error: null
        })
      }));

  const { result } = renderHook(() => useComandasDB());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.comandas[0].items).toHaveLength(0);
      expect(console.log).toHaveBeenCalledWith(
        '⚠️ Erro ao buscar itens do localStorage:',
        expect.any(Error)
      );
      restoreSupabase();
    });

  it('trata erro da busca no Supabase', async () => {
      // Arrange
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

  const { result } = renderHook(() => useComandasDB());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(console.error).toHaveBeenCalledWith(
        'Erro ao buscar comandas:',
        { message: 'Database error' }
      );
      expect(require('sonner').toast.error).toHaveBeenCalledWith('Erro ao carregar comandas');
      expect(result.current.comandas).toHaveLength(0);
      restoreSupabase();
    });
  });

  describe('createComanda', () => {
    it('cria comanda com sucesso', async () => {
      // Arrange
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'new-cmd', number: 102 }, error: null });
      const mockSelect = jest.fn(() => ({ single: mockSingle }));
      const mockInsert = jest.fn(() => ({ select: mockSelect }));
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
      const restoreSupabase = overrideSupabaseFrom(() => ({
        insert: mockInsert,
        order: mockOrder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
      }));
      const { result } = renderHook(() => useComandasDB());
      let comandaId;
      await act(async () => {
        comandaId = await result.current.createComanda(102, 'Cliente Teste');
      });
      expect(comandaId).toBe('new-cmd');
      restoreSupabase();
    });

  it('trata erro na criação de comanda', async () => {
      // Arrange
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Duplicate number' }
        })
      }));

  const { result } = renderHook(() => useComandasDB());

      let comandaId;
      await act(async () => {
        comandaId = await result.current.createComanda(101);
      });
      expect(comandaId).toBeNull();
      restoreSupabase();
    });
  });

  describe('addItemToComanda', () => {
  it('adiciona novo item ao localStorage', async () => {
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
      const { result } = renderHook(() => useComandasDB());

      await act(async () => {
        await result.current.addItemToComanda('cmd-1', 'prod-1', 'Cerveja', 8.50);
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'comanda_items_cmd-1',
        JSON.stringify([{
          product_id: 'prod-1',
          product_name: 'Cerveja',
          product_price: 8.50,
          quantity: 1
        }])
      );
      restoreSupabase();
    });

  it('incrementa quantidade de item existente', async () => {
      // Arrange
      const existingItems = [{
        product_id: 'prod-1',
        product_name: 'Cerveja',
        product_price: 8.50,
        quantity: 1
      }];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingItems));
      
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
      const { result } = renderHook(() => useComandasDB());

      await act(async () => {
        await result.current.addItemToComanda('cmd-1', 'prod-1', 'Cerveja', 8.50);
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'comanda_items_cmd-1',
        JSON.stringify([{
          product_id: 'prod-1',
          product_name: 'Cerveja',
          product_price: 8.50,
          quantity: 2 // Incrementado
        }])
      );
      restoreSupabase();
    });

  it('trata erro no localStorage graciosamente', async () => {
      // Arrange
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
      const { result } = renderHook(() => useComandasDB());

      await act(async () => {
        await result.current.addItemToComanda('cmd-1', 'prod-1', 'Cerveja', 8.50);
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'comanda_items_cmd-1',
        JSON.stringify([{
          product_id: 'prod-1',
          product_name: 'Cerveja',
          product_price: 8.50,
          quantity: 1
        }])
      );
      expect(console.log).toHaveBeenCalledWith('📝 Criando nova lista de itens no localStorage');
      restoreSupabase();
    });
  });

  describe('Estado de loading', () => {
  it('inicia com loading true', () => {
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
      const { result } = renderHook(() => useComandasDB());
      expect(result.current.loading).toBe(true);
      restoreSupabase();
    });

  it('define loading false após sucesso', async () => {
      // Arrange
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      const { result } = renderHook(() => useComandasDB());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      restoreSupabase();
    });

  it('define loading false após erro', async () => {
      // Arrange
      const restoreSupabase = overrideSupabaseFrom(() => createSupabaseChain({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Error' }
        })
      }));

      const { result } = renderHook(() => useComandasDB());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      restoreSupabase();
    });
  });
});