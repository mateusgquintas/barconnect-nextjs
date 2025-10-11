'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { withCache, invalidateCache } from '@/lib/cache';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import { notifyError, notifySuccess } from '@/utils/notify';
import { formatDate, formatTime } from '@/utils/calculations';

export function useTransactionsDB() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  interface DBTransaction {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number | string;
    category: string;
    created_at: string;
    date?: string | null;
    time?: string | null;
  }

  const fetchTransactions = async (options?: { force?: boolean }) => {
    try {
      const result = await withCache('transactions:list', async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const formatted: Transaction[] = (data as DBTransaction[] | null || []).map((t) => {
          let dateStr = t.date;
          let timeStr = t.time;
          if (!dateStr || !timeStr) {
            const created = new Date(t.created_at);
            dateStr = formatDate(created);
            timeStr = formatTime(created);
          }
          return {
            id: t.id,
            type: t.type,
            description: t.description,
            amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
            category: t.category,
            date: dateStr,
            time: timeStr,
          };
        });
        return formatted;
      }, { force: options?.force, ttlMs: 7000 });
      setTransactions(result);
      setLoading(false);
    } catch (error: any) {
      notifyError('Erro ao carregar transações', error, { context: 'fetchTransactions' });
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
      notifySuccess('Transação adicionada');
  invalidateCache(/transactions:list/);
  await fetchTransactions({ force: true });
      console.log('📊 Lista atualizada, total:', transactions.length);
    } catch (error: any) {
      notifyError('Erro ao adicionar transação', error, { context: 'addTransaction' });
    }
  };

  useEffect(() => {
  fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    refetch: () => fetchTransactions({ force: true }),
  };
}
