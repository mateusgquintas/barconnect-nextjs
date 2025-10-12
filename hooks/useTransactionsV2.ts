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

  // Criar transação
  const createTransaction = async (input: CreateTransactionInput): Promise<string | null> => {
    try {
      console.log('💰 Criando transação:', input);

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          type: input.type,
          amount: input.amount,
          description: input.description || null,
          payment_method: input.payment_method,
          sale_id: input.sale_id || null,
          created_by: input.created_by || null
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao criar transação:', error);
        toast.error('Erro ao registrar transação');
        return null;
      }

      console.log('✅ Transação criada com ID:', data.id);
      
      // Não mostrar toast para vendas (já é mostrado no hook de vendas)
      if (input.type !== 'sale') {
        toast.success('Transação registrada com sucesso');
      }
      
      return data.id;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro interno ao registrar transação');
      return null;
    }
  };

  // Buscar transações de um período específico
  const getTransactionsByPeriod = async (startDate: string, endDate: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          sale:sales (
            id,
            total,
            status
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações do período:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações do período:', error);
      return [];
    }
  };

  // Obter estatísticas de transações
  const getTransactionStats = async (filters?: TransactionFilters): Promise<TransactionStats | null> => {
    try {
      console.log('📊 Calculando estatísticas de transações...');

      let query = supabase
        .from('transactions')
        .select('type, amount, payment_method, created_at');

      // Aplicar filtros
      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados para estatísticas:', error);
        return null;
      }

      const transactions = data || [];

      // Calcular totais por tipo
      const sales = transactions.filter((t: any) => t.type === 'sale');
      const expenses = transactions.filter((t: any) => t.type === 'expense');
      const refunds = transactions.filter((t: any) => t.type === 'refund');

      const totalSales = sales.reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalExpenses = expenses.reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalRefunds = refunds.reduce((sum: number, t: any) => sum + t.amount, 0);
      const netProfit = totalSales - totalExpenses - totalRefunds;

      // Calcular por método de pagamento
      const paymentMethods = {
        money: transactions.filter((t: any) => t.payment_method === 'money').reduce((sum: number, t: any) => sum + t.amount, 0),
        debit: transactions.filter((t: any) => t.payment_method === 'debit').reduce((sum: number, t: any) => sum + t.amount, 0),
        credit: transactions.filter((t: any) => t.payment_method === 'credit').reduce((sum: number, t: any) => sum + t.amount, 0),
        pix: transactions.filter((t: any) => t.payment_method === 'pix').reduce((sum: number, t: any) => sum + t.amount, 0),
        other: transactions.filter((t: any) => t.payment_method === 'other').reduce((sum: number, t: any) => sum + t.amount, 0)
      };

      return {
        totalSales,
        totalExpenses,
        totalRefunds,
        netProfit,
        transactionCount: transactions.length,
        paymentMethods
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  };

  // Obter vendas diárias para gráficos
  const getDailySalesStats = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar vendas diárias:', error);
        return [];
      }

      // Agrupar por data
      const dailyData: { [key: string]: { sales: number; expenses: number } } = {};

      (data || []).forEach((transaction: any) => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = { sales: 0, expenses: 0 };
        }

        if (transaction.type === 'sale') {
          dailyData[date].sales += transaction.amount;
        } else if (transaction.type === 'expense' || transaction.type === 'refund') {
          dailyData[date].expenses += transaction.amount;
        }
      });

      // Converter para array
      return Object.entries(dailyData).map(([date, stats]) => ({
        date,
        sales: stats.sales,
        expenses: stats.expenses,
        profit: stats.sales - stats.expenses
      }));
    } catch (error) {
      console.error('Erro ao calcular vendas diárias:', error);
      return [];
    }
  };

  // Buscar transações de uma venda específica
  const getTransactionsBySale = async (saleId: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('sale_id', saleId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações da venda:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações da venda:', error);
      return [];
    }
  };

  // Registrar despesa
  const recordExpense = async (amount: number, description: string, paymentMethod: string = 'money'): Promise<boolean> => {
    try {
      const transactionId = await createTransaction({
        type: 'expense',
        amount,
        description,
        payment_method: paymentMethod as any
      });

      if (transactionId) {
        toast.success('Despesa registrada com sucesso');
        await fetchTransactions();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      toast.error('Erro ao registrar despesa');
      return false;
    }
  };

  // Processar estorno
  const processRefund = async (saleId: string, amount: number, reason: string): Promise<boolean> => {
    try {
      const transactionId = await createTransaction({
        type: 'refund',
        amount,
        description: `Estorno: ${reason}`,
        payment_method: 'money', // Padrão, pode ser ajustado
        sale_id: saleId
      });

      if (transactionId) {
        toast.success('Estorno processado com sucesso');
        await fetchTransactions();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao processar estorno:', error);
      toast.error('Erro ao processar estorno');
      return false;
    }
  };

  // Carregar transações do dia atual na inicialização
  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    fetchTransactions({
      start_date: startOfDay,
      end_date: endOfDay
    });
  }, []);

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
    getTransactionsByPeriod,
    getTransactionStats,
    getDailySalesStats,
    getTransactionsBySale,
    recordExpense,
    processRefund,
    refetch: () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      return fetchTransactions({
        start_date: startOfDay,
        end_date: endOfDay
      });
    }
  };
}