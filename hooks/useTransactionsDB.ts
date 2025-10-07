'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import { formatDate, formatTime } from '@/utils/calculations';

export function useTransactionsDB() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        amount: parseFloat(t.amount),
        category: t.category,
        date: formatDate(new Date(t.created_at)),
        time: formatTime(new Date(t.created_at)),
      }));

      setTransactions(formatted);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      toast.error('Erro ao carregar transações');
      setLoading(false);
    }
  };

  const addTransaction = async (
    transaction: Omit<Transaction, 'id' | 'date' | 'time'>
  ) => {
    try {
      console.log('💾 Salvando transação:', transaction);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          type: transaction.type,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
        });

      if (error) throw error;

      console.log('✅ Transação salva, recarregando lista...');
      toast.success('Transação adicionada');
      await fetchTransactions();
      console.log('📊 Lista atualizada, total:', transactions.length);
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions,
  };
}
