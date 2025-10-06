import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SaleRecord } from '@/types';
import { toast } from 'sonner';

export function useSalesDB() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar vendas do banco
  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSales(data || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar vendas:', error);
      toast.error('Erro ao carregar vendas');
      setLoading(false);
    }
  };

  // Adicionar nova venda
  const addSale = async (sale: Omit<SaleRecord, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single();

      if (error) throw error;

      toast.success('Venda registrada!');
      await fetchSales();
      return data.id;
    } catch (error: any) {
      console.error('Erro ao registrar venda:', error);
      toast.error('Erro ao registrar venda');
      return null;
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sales, loading, addSale, fetchSales };
}
