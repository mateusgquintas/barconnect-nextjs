import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SaleRecord } from '@/types';
import { toast } from 'sonner';

export function useSalesDB() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar vendas do banco
  const fetchSales = async () => {
    console.log('🔍 VENDAS: Buscando vendas...');
    let allSales: SaleRecord[] = [];
    
    try {
      // Tentar buscar do Supabase (tabela 'sales')
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        console.log('📊 Vendas encontradas na tabela sales:', data.length);
        allSales = [...allSales, ...data];
      } else {
        console.log('⚠️ Erro na tabela sales, tentando sales_records:', error);
        
        // Tentar tabela alternativa
        const { data: data2, error: error2 } = await supabase
          .from('sales_records')
          .select('*')
          .order('date', { ascending: false });

        if (!error2 && data2) {
          console.log('📊 Vendas encontradas na tabela sales_records:', data2.length);
          allSales = [...allSales, ...data2];
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar no Supabase, usando apenas localStorage:', error);
    }
    
    // Sempre buscar também no localStorage
    try {
      const localSales = localStorage.getItem('sales_records');
      if (localSales) {
        const parsedLocalSales = JSON.parse(localSales);
        console.log('💾 Vendas encontradas no localStorage:', parsedLocalSales.length);
        allSales = [...allSales, ...parsedLocalSales];
      }
    } catch (error) {
      console.log('⚠️ Erro ao ler localStorage:', error);
    }
    
    // Remover duplicatas baseado no ID e ordenar por data
    const uniqueSales = allSales.filter((sale, index, self) => 
      index === self.findIndex((s) => s.id === sale.id)
    ).sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
    
    console.log('✅ Total de vendas únicas encontradas:', uniqueSales.length);
    setSales(uniqueSales);
    setLoading(false);
  };

  // Adicionar nova venda
  const addSale = async (sale: Omit<SaleRecord, 'id'>) => {
    console.log('🚀 NOVA FUNÇÃO VENDAS: Registrando venda:', sale);
    
    try {
      // Tentar inserir no Supabase primeiro
      const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single();

      if (error) {
        console.log('⚠️ Erro no Supabase, tentando tabela alternativa sales_records:', error);
        
        // Tentar tabela alternativa
        const { data: data2, error: error2 } = await supabase
          .from('sales_records')
          .insert(sale)
          .select()
          .single();

        if (error2) {
          console.log('⚠️ Erro em sales_records, usando localStorage:', error2);
          
          // Fallback para localStorage
          const salesKey = 'sales_records';
          let existingSales = [];
          
          try {
            const existing = localStorage.getItem(salesKey);
            existingSales = existing ? JSON.parse(existing) : [];
          } catch (e) {
            console.log('📝 Criando nova lista de vendas no localStorage');
            existingSales = [];
          }

          // Gerar ID único
          const newId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const saleWithId = { ...sale, id: newId };
          
          existingSales.push(saleWithId);
          localStorage.setItem(salesKey, JSON.stringify(existingSales));
          
          console.log('💾 Venda salva no localStorage:', saleWithId);
          toast.success('Venda registrada (local)!');
          await fetchSales();
          return newId;
        } else {
          console.log('✅ Sucesso com tabela sales_records');
          toast.success('Venda registrada!');
          await fetchSales();
          return data2.id;
        }
      } else {
        console.log('✅ Sucesso com tabela sales');
        toast.success('Venda registrada!');
        await fetchSales();
        return data.id;
      }
    } catch (error: any) {
      console.error('💥 Erro geral ao registrar venda:', error);
      console.error('📝 Detalhes do erro:', JSON.stringify(error, null, 2));
      
      // Fallback final para localStorage
      console.log('🔄 Usando fallback final: localStorage');
      const salesKey = 'sales_records';
      let existingSales = [];
      
      try {
        const existing = localStorage.getItem(salesKey);
        existingSales = existing ? JSON.parse(existing) : [];
      } catch (e) {
        existingSales = [];
      }

      const newId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const saleWithId = { ...sale, id: newId };
      
      existingSales.push(saleWithId);
      localStorage.setItem(salesKey, JSON.stringify(existingSales));
      
      console.log('💾 Venda salva no localStorage (fallback):', saleWithId);
      toast.success('Venda registrada (local)!');
      await fetchSales();
      return newId;
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sales, loading, addSale, fetchSales };
}
