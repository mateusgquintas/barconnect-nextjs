'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { toast } from 'sonner';

export function useProductsDB() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      const formatted = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        stock: p.stock,
        category: p.category,
        subcategory: p.subcategory,
      }));

      setProducts(formatted);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos');
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Estoque atualizado');
      await fetchProducts();
    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', error);
      toast.error('Erro ao atualizar estoque');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, updateStock, refetch: fetchProducts };
}