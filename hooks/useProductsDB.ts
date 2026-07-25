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
  min_stock?: number | null;
}
import { toast } from 'sonner';

export function useProductsDB() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('name').order('name');
    if (!error && data) setCategories(data.map((c: { name: string }) => c.name));
  };

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
          min_stock: p.min_stock ?? undefined,
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
        min_stock: product.min_stock ?? null,
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
        min_stock: updates.min_stock ?? null,
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

  // Registra uma entrada de estoque (reposição) e o respectivo movimento
  const addStock = async (productId: string, quantity: number, reason?: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Produto não encontrado');
      const newStock = product.stock + quantity;
      const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', productId);
      if (error) throw error;
      await supabase.from('stock_movements').insert([{
        product_id: productId,
        movement_type: 'in',
        quantity,
        previous_stock: product.stock,
        new_stock: newStock,
        reason: reason || 'Reposição manual',
      }]);
      toast.success('Estoque atualizado!');
      invalidateCache(/products:list/);
      await fetchProducts({ force: true });
    } catch (error: any) {
      console.error('Erro ao adicionar estoque:', error?.message || error);
      toast.error('Erro ao adicionar estoque');
    }
  };

  // Registra uma retirada de estoque (consumo) e o respectivo movimento
  const removeStock = async (productId: string, quantity: number, reason?: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Produto não encontrado');
      if (quantity > product.stock) {
        toast.error('Quantidade maior que o estoque disponível');
        return;
      }
      const newStock = product.stock - quantity;
      const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', productId);
      if (error) throw error;
      await supabase.from('stock_movements').insert([{
        product_id: productId,
        movement_type: 'out',
        quantity,
        previous_stock: product.stock,
        new_stock: newStock,
        reason: reason || 'Consumo/retirada manual',
      }]);
      toast.success('Retirada registrada!');
      invalidateCache(/products:list/);
      await fetchProducts({ force: true });
    } catch (error: any) {
      console.error('Erro ao registrar retirada:', error?.message || error);
      toast.error('Erro ao registrar retirada');
    }
  };

  // Adicionar uma categoria nova (fica disponível mesmo antes de qualquer produto usá-la)
  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const { error } = await supabase.from('categories').insert([{ name: trimmed }]);
      if (error) {
        if ((error as any).code === '23505') {
          toast.error('Essa categoria já existe');
        } else {
          throw error;
        }
        return;
      }
      toast.success('Categoria adicionada!');
      await fetchCategories();
    } catch (error: any) {
      console.error('Erro ao adicionar categoria:', error?.message || error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  // Renomear uma categoria (na tabela de categorias e em todos os produtos que a usam)
  const renameCategory = async (oldName: string, newName: string) => {
    try {
      await supabase.from('categories').update({ name: newName }).eq('name', oldName);
      const { error } = await supabase
        .from('products')
        .update({ category: newName })
        .eq('category', oldName);
      if (error) throw error;
      toast.success('Categoria renomeada!');
      invalidateCache(/products:list/);
      await Promise.all([fetchProducts({ force: true }), fetchCategories()]);
    } catch (error: any) {
      console.error('Erro ao renomear categoria:', error?.message || error);
      toast.error('Erro ao renomear categoria');
    }
  };

  // Remover uma categoria (da tabela de categorias e dos produtos que a usam, que ficam sem categoria)
  const deleteCategory = async (name: string) => {
    try {
      await supabase.from('categories').delete().eq('name', name);
      const { error } = await supabase
        .from('products')
        .update({ category: null })
        .eq('category', name);
      if (error) throw error;
      toast.success('Categoria removida!');
      invalidateCache(/products:list/);
      await Promise.all([fetchProducts({ force: true }), fetchCategories()]);
    } catch (error: any) {
      console.error('Erro ao remover categoria:', error?.message || error);
      toast.error('Erro ao remover categoria');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return {
    products,
    categories,
    loading,
    updateStock,
    addProduct,
    updateProduct,
    addStock,
    removeStock,
    addCategory,
    renameCategory,
    deleteCategory,
    refetch: () => fetchProducts({ force: true }),
  };
}