'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  category: string;
  barcode?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  
  // Campos calculados
  stock_status?: 'out_of_stock' | 'critical' | 'low' | 'normal';
  stock_difference?: number;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  sale_id?: string;
  created_by?: string;
  created_at: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock?: number;
  min_stock?: number;
  category?: string;
  barcode?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface StockAdjustmentInput {
  product_id: string;
  new_stock: number;
  reason: string;
  movement_type?: 'in' | 'out' | 'adjustment';
}

export function useProductsV2() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar produtos
  const fetchProducts = async (filters?: { category?: string; active?: boolean; criticalOnly?: boolean }) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      // Aplicar filtros
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        toast.error('Erro ao carregar produtos');
        return;
      }

      let filteredData = data || [];

      // Filtro de estoque crítico
      if (filters?.criticalOnly) {
        filteredData = filteredData.filter((p: Product) => p.stock <= p.min_stock);
      }

      setProducts(filteredData);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos com estoque crítico
  const getCriticalStockProducts = async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products_critical_stock')
        .select('*')
        .in('stock_status', ['out_of_stock', 'critical', 'low']);

      if (error) {
        console.error('Erro ao buscar produtos críticos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos críticos:', error);
      return [];
    }
  };

  // Criar produto
  const createProduct = async (input: CreateProductInput): Promise<string | null> => {
    try {
      console.log('📦 Criando produto:', input);

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: input.name,
          description: input.description || null,
          price: input.price,
          cost_price: input.cost_price || 0,
          stock: input.stock || 0,
          min_stock: input.min_stock || 20,
          category: input.category || 'geral',
          barcode: input.barcode || null,
          active: true
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao criar produto:', error);
        toast.error('Erro ao criar produto');
        return null;
      }

      console.log('✅ Produto criado com ID:', data.id);
      toast.success('Produto criado com sucesso');
      
      // Atualizar lista
      await fetchProducts();
      
      return data.id;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro interno ao criar produto');
      return null;
    }
  };

  // Atualizar produto
  const updateProduct = async (input: UpdateProductInput): Promise<boolean> => {
    try {
      console.log('📝 Atualizando produto:', input);

      const { id, ...updateData } = input;
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('products')
        .update(dataToUpdate)
        .eq('id', input.id);

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        toast.error('Erro ao atualizar produto');
        return false;
      }

      console.log('✅ Produto atualizado');
      toast.success('Produto atualizado com sucesso');
      
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro interno ao atualizar produto');
      return false;
    }
  };

  // Ajustar estoque
  const adjustStock = async (input: StockAdjustmentInput): Promise<boolean> => {
    try {
      console.log('📊 Ajustando estoque:', input);

      // Buscar estoque atual
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', input.product_id)
        .single();

      if (fetchError || !product) {
        console.error('Erro ao buscar produto:', fetchError);
        toast.error('Produto não encontrado');
        return false;
      }

      const previousStock = product.stock;
      const stockDifference = input.new_stock - previousStock;
      
      // Determinar tipo de movimento
      let movementType = input.movement_type;
      if (!movementType) {
        if (stockDifference > 0) {
          movementType = 'in';
        } else if (stockDifference < 0) {
          movementType = 'out';
        } else {
          movementType = 'adjustment';
        }
      }

      // Atualizar estoque do produto
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: input.new_stock,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.product_id);

      if (updateError) {
        console.error('Erro ao atualizar estoque:', updateError);
        toast.error('Erro ao atualizar estoque');
        return false;
      }

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: input.product_id,
          movement_type: movementType,
          quantity: Math.abs(stockDifference),
          previous_stock: previousStock,
          new_stock: input.new_stock,
          reason: input.reason
        });

      if (movementError) {
        console.warn('Erro ao registrar movimentação (estoque foi atualizado):', movementError);
      }

      console.log('✅ Estoque ajustado');
      toast.success('Estoque atualizado com sucesso');
      
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      toast.error('Erro interno ao ajustar estoque');
      return false;
    }
  };

  // Buscar movimentações de estoque
  const getStockMovements = async (productId?: string, limit = 50): Promise<StockMovement[]> => {
    try {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar movimentações:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      return [];
    }
  };

  // Desativar produto (ao invés de deletar)
  const deactivateProduct = async (productId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao desativar produto:', error);
        toast.error('Erro ao desativar produto');
        return false;
      }

      toast.success('Produto desativado');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Erro ao desativar produto:', error);
      return false;
    }
  };

  // Reativar produto
  const reactivateProduct = async (productId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao reativar produto:', error);
        toast.error('Erro ao reativar produto');
        return false;
      }

      toast.success('Produto reativado');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Erro ao reativar produto:', error);
      return false;
    }
  };

  // Estatísticas de estoque
  const getStockStats = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock, min_stock, price, cost_price, active');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      const activeProducts = data.filter((p: any) => p.active);
      const totalProducts = activeProducts.length;
      const criticalStock = activeProducts.filter((p: any) => p.stock <= p.min_stock).length;
      const outOfStock = activeProducts.filter((p: any) => p.stock <= 0).length;
      const totalValue = activeProducts.reduce((sum: number, p: any) => sum + (p.stock * p.price), 0);
      const totalCost = activeProducts.reduce((sum: number, p: any) => sum + (p.stock * p.cost_price), 0);

      return {
        totalProducts,
        criticalStock,
        outOfStock,
        totalValue,
        totalCost,
        potentialProfit: totalValue - totalCost
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  };

  // Carregar produtos na inicialização
  useEffect(() => {
    fetchProducts({ active: true });
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    getCriticalStockProducts,
    createProduct,
    updateProduct,
    adjustStock,
    getStockMovements,
    deactivateProduct,
    reactivateProduct,
    getStockStats,
    refetch: () => fetchProducts({ active: true })
  };
}