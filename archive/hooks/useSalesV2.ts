'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Sale {
  id: string;
  comanda_id?: string;
  sale_type: 'direct' | 'comanda';
  total: number;
  payment_method: 'cash' | 'credit' | 'debit' | 'pix' | 'courtesy';
  is_courtesy: boolean;
  customer_name?: string;
  items_snapshot?: any;
  notes?: string;
  created_at: string;
  sale_date: string;
  sale_time: string;
  
  // Dados relacionados
  comanda_number?: number;
  table_number?: number;
  items_count?: number;
  items_summary?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface CreateSaleInput {
  sale_type: 'direct' | 'comanda';
  comanda_id?: string;
  total: number;
  payment_method: 'cash' | 'credit' | 'debit' | 'pix' | 'courtesy';
  is_courtesy?: boolean;
  customer_name?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
  }>;
  notes?: string;
}

export function useSalesV2() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar vendas com detalhes
  const fetchSales = async (filters?: { startDate?: string; endDate?: string; sale_type?: string }) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sales_detailed')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.startDate) {
        query = query.gte('sale_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('sale_date', filters.endDate);
      }
      if (filters?.sale_type) {
        query = query.eq('sale_type', filters.sale_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar vendas:', error);
        toast.error('Erro ao carregar vendas');
        return;
      }

      setSales(data || []);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova venda completa (com transação automática)
  const createSale = async (input: CreateSaleInput): Promise<string | null> => {
    try {
      console.log('📊 Criando nova venda:', input);

      // 1. Criar registro da venda
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          comanda_id: input.comanda_id || null,
          sale_type: input.sale_type,
          total: input.total,
          payment_method: input.payment_method,
          is_courtesy: input.is_courtesy || false,
          customer_name: input.customer_name || null,
          items_snapshot: input.items,
          notes: input.notes || null
        })
        .select('id')
        .single();

      if (saleError) {
        console.error('Erro ao criar venda:', saleError);
        toast.error('Erro ao registrar venda');
        return null;
      }

      const saleId = saleData.id;
      console.log('✅ Venda criada com ID:', saleId);

      // 2. Inserir itens da venda
      const saleItems = input.items.map(item => ({
        sale_id: saleId,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Erro ao inserir itens da venda:', itemsError);
        // Reverter venda se falhar
        await supabase.from('sales').delete().eq('id', saleId);
        toast.error('Erro ao registrar itens da venda');
        return null;
      }

      console.log('✅ Itens da venda inseridos');

      // 3. Criar transação financeira (se não for cortesia)
      if (!input.is_courtesy) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            sale_id: saleId,
            type: 'income',
            description: input.sale_type === 'direct' 
              ? `Venda Direta (${input.payment_method.toUpperCase()})`
              : `Venda Comanda (${input.payment_method.toUpperCase()})`,
            amount: input.total,
            category: 'Vendas',
            payment_method: input.payment_method
          });

        if (transactionError) {
          console.warn('Erro ao criar transação, mas venda foi registrada:', transactionError);
          // Não reverter a venda por causa da transação
        } else {
          console.log('✅ Transação financeira criada');
        }
      }

      // 4. Fechar comanda se for venda de comanda
      if (input.comanda_id && input.sale_type === 'comanda') {
        const { error: comandaError } = await supabase
          .from('comandas')
          .update({ 
            status: 'closed',
            closed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', input.comanda_id);

        if (comandaError) {
          console.warn('Erro ao fechar comanda:', comandaError);
        } else {
          console.log('✅ Comanda fechada');
        }
      }

      toast.success(input.is_courtesy ? 'Cortesia registrada' : 'Venda registrada com sucesso');
      
      // Atualizar lista local
      await fetchSales();
      
      return saleId;

    } catch (error) {
      console.error('Erro fatal ao criar venda:', error);
      toast.error('Erro interno ao processar venda');
      return null;
    }
  };

  // Buscar detalhes de uma venda específica
  const getSaleDetails = async (saleId: string) => {
    try {
      const { data: sale, error: saleError } = await supabase
        .from('sales_detailed')
        .select('*')
        .eq('id', saleId)
        .single();

      if (saleError) {
        console.error('Erro ao buscar detalhes da venda:', saleError);
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId);

      if (itemsError) {
        console.error('Erro ao buscar itens da venda:', itemsError);
        return { sale, items: [] };
      }

      return { sale, items };
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda:', error);
      return null;
    }
  };

  // Estatísticas de vendas
  const getSalesStats = async (filters?: { startDate?: string; endDate?: string }) => {
    try {
      let query = supabase
        .from('sales')
        .select('total, payment_method, is_courtesy, sale_date');

      if (filters?.startDate) {
        query = query.gte('sale_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('sale_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      const stats = {
        totalSales: data.length,
        totalRevenue: data.filter((s: any) => !s.is_courtesy).reduce((sum: number, s: any) => sum + s.total, 0),
        totalCourtesies: data.filter((s: any) => s.is_courtesy).length,
        courtesyValue: data.filter((s: any) => s.is_courtesy).reduce((sum: number, s: any) => sum + s.total, 0),
        paymentMethods: data.reduce((acc: Record<string, number>, sale: any) => {
          acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  };

  // Carregar vendas na inicialização
  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    fetchSales,
    createSale,
    getSaleDetails,
    getSalesStats,
    refetch: fetchSales
  };
}
