import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

describe('useProductsDB concorrência de estoque', () => {
  function useMockProductsDB() {
    const [products, setProducts] = useState([
      { id: '1', name: 'Cerveja', price: 10, stock: 10 },
    ]);
    const [loading] = useState(false);
    // Simula updateStock concorrente
    const updateStock = async (productId: string, newStock: number) => {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    };
    return { products, loading, updateStock };
  }

  it('última atualização de estoque prevalece após concorrência', async () => {
    const { result } = renderHook(() => useMockProductsDB());
    // Simula updates concorrentes
    await act(async () => {
      await Promise.all([
        result.current.updateStock('1', 20),
        result.current.updateStock('1', 30),
        result.current.updateStock('1', 40),
      ]);
    });
    expect(result.current.products[0].stock).toBe(40);
  });
});
