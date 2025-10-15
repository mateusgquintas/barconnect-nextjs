/**
 * Testes atualizados para useComandasDB - Supabase only
 * Reflete a arquitetura atual sem localStorage
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useComandasDB } from '@/hooks/useComandasDB';
import { overrideSupabaseFrom, createSupabaseChain, silenceConsole } from './utils/testUtils';

// Mock data
const mockComandaData = {
  id: 'cmd-1',
  number: 101,
  customer_name: 'João Silva',
  status: 'open',
  created_at: '2025-01-15T10:00:00Z'
};

const mockComandaItems = [
  {
    id: 'item-1',
    comanda_id: 'cmd-1',
    product_id: 'prod-1',
    product_name: 'Cerveja',
    product_price: 8.50,
    quantity: 2
  },
  {
    id: 'item-2',
    comanda_id: 'cmd-1',
    product_id: 'prod-2',
    product_name: 'Refrigerante',
    product_price: 5.00,
    quantity: 1
  }
];

describe('useComandasDB (Updated - Supabase)', () => {
  let restoreConsole: (() => void) | undefined;

  beforeEach(() => {
    restoreConsole = silenceConsole();
  });

  afterEach(() => {
    restoreConsole?.();
  });

  describe('fetchComandas', () => {
    it('busca comandas e seus itens do Supabase', async () => {
      let fetchCount = 0;
      const restoreSupabase = overrideSupabaseFrom(() => {
        fetchCount++;
        // Primeira chamada: comandas table
        if (fetchCount === 1) {
          return createSupabaseChain({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [mockComandaData],
              error: null
            })
          });
        }
        // Demais chamadas: comanda_items table
        return createSupabaseChain({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: mockComandaItems,
            error: null
          })
        });
      });

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
      });
      expect(result.current.comandas[0].items).toHaveLength(2);
      expect(result.current.comandas[0].items[0].product.name).toBe('Cerveja');
      expect(result.current.comandas[0].items[0].quantity).toBe(2);

      restoreSupabase();
    });

    it('filtra apenas comandas abertas', async () => {
      let fetchCount = 0;
      const mockComandasData = [
        { ...mockComandaData, id: 'cmd-1', status: 'open' },
        { ...mockComandaData, id: 'cmd-2', status: 'closed' },
        { ...mockComandaData, id: 'cmd-3', status: 'open' }
      ];
      
      const restoreSupabase = overrideSupabaseFrom(() => {
        fetchCount++;
        // Primeira chamada: comandas table
        if (fetchCount === 1) {
          return createSupabaseChain({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockComandasData,
              error: null
            })
          });
        }
        // Demais chamadas: comanda_items table
        return createSupabaseChain({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        });
      });

      const { result } = renderHook(() => useComandasDB());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.comandas).toHaveLength(2);
      expect(result.current.comandas.every(c => c.status === 'open')).toBe(true);

      restoreSupabase();
    });
  });

  describe('createComanda', () => {
    it('cria nova comanda no Supabase', async () => {
      const restoreSupabase = overrideSupabaseFrom(() =>
        createSupabaseChain({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null
          }),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'cmd-new', number: 102, customer_name: 'Maria Santos', status: 'open' },
            error: null
          })
        })
      );

      const { result } = renderHook(() => useComandasDB());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const id = await result.current.createComanda(102, 'Maria Santos');
        expect(id).toBe('cmd-new');
      });

      restoreSupabase();
    });
  });
});
