'use client'

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { withCache, invalidateCache } from '../lib/cache';
import { Product } from '@/types';

interface DBProduct {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  category?: string | null;
  subcategory?: string | null;
}
import { toast } from 'sonner';

export function useProductsDB() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (options?: { force?: boolean }) => {
    try {
      const result = await withCache('products:list', async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
        if (error) throw error;
        const formatted: Product[] = (data as DBProduct[] | null || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
          stock: p.stock,
          category: p.category || undefined,
          subcategory: p.subcategory || undefined,
        }));
        return formatted;
      }, { force: options?.force, ttlMs: 8000 });
      setProducts(result);
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

      // Remover toast de sucesso para não poluir durante vendas
      invalidateCache(/products:list/);
      await fetchProducts({ force: true });
    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', error);
      toast.error('Erro ao atualizar estoque');
    }
  };

  // Adicionar produto
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Only send columns that exist in DB
      const payload: Partial<DBProduct> = {
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category ?? null,
        subcategory: product.subcategory ?? null,
      };
      const { error } = await supabase
        .from('products')
        .insert([payload]);
      if (error) throw error;
      toast.success('Produto adicionado!');
      invalidateCache(/products:list/);
      await fetchProducts({ force: true });
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error?.message || error);
      toast.error('Erro ao adicionar produto');
      // Não chama fetchProducts em caso de erro no insert
    }
  };

  // Editar produto
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const payload: Partial<DBProduct> = {
        name: updates.name,
        price: updates.price,
        stock: updates.stock,
        category: updates.category ?? null,
        subcategory: updates.subcategory ?? null,
      };
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
  toast.success('Produto atualizado!');
  invalidateCache(/products:list/);
  await fetchProducts({ force: true });
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error?.message || error);
      toast.error('Erro ao atualizar produto');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, updateStock, addProduct, updateProduct, refetch: () => fetchProducts({ force: true }) };
}