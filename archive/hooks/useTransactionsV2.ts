'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  type: 'sale' | 'expense' | 'adjustment' | 'refund';
  amount: number;
  description?: string;
  payment_method: 'money' | 'debit' | 'credit' | 'pix' | 'other';
  sale_id?: string;
  created_by?: string;
  created_at: string;
  
  // Campos calculados/relacionados
  sale?: {
    id: string;
    total: number;
    status: string;
  };
}

export interface CreateTransactionInput {
  type: 'sale' | 'expense' | 'adjustment' | 'refund';
  amount: number;
  description?: string;
  payment_method: 'money' | 'debit' | 'credit' | 'pix' | 'other';
  sale_id?: string;
  created_by?: string;
}

export interface TransactionFilters {
  type?: 'sale' | 'expense' | 'adjustment' | 'refund';
  payment_method?: 'money' | 'debit' | 'credit' | 'pix' | 'other';
  start_date?: string;
  end_date?: string;
  created_by?: string;
}

export interface TransactionStats {
  totalSales: number;
  totalExpenses: number;
  totalRefunds: number;
  netProfit: number;
  transactionCount: number;
  
  // Por método de pagamento
  paymentMethods: {
    money: number;
    debit: number;
    credit: number;
    pix: number;
    other: number;
  };
  
  // Por período
  dailyStats?: {
    date: string;
    sales: number;
    expenses: number;
    profit: number;
  }[];
}

export function useTransactionsV2() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar transações com filtros
  const fetchTransactions = async (filters?: TransactionFilters, limit = 100) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          sale:sales (
            id,
            total,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Aplicar filtros
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.payment_method) {
        query = query.eq('payment_method', filters.payment_method);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar transações:', error);
        toast.error('Erro ao carregar transações');
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    fetchTransactions,
  };
}
