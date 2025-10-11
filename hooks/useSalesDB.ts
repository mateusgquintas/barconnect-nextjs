import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SaleRecord, OrderItem, Product } from '@/types';
import { toast } from 'sonner';
import { notifyError, notifySuccess } from '@/utils/notify';
import { registerSale, RegisterSaleInput } from '@/lib/salesService';

export function useSalesDB() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // REFATORAÇÃO: Este hook antes implementava toda a lógica de persistência (tabela sales, fallback sales_records e localStorage).
  // Agora delegamos o registro de novas vendas ao serviço central `registerSale` (lib/salesService.ts)
  // que também garante a criação automática da transação financeira correspondente.
  // Mantemos aqui apenas fetch consolidado (Supabase + localStorage) e API estável addSale para retrocompatibilidade.

  // Buscar vendas do banco
  interface DBSaleRecord {
    id: string;
    comandaNumber?: number | null;
    customerName?: string | null;
    items: OrderItem[] | any; // será parseado
    total: number | string;
    paymentMethod: string;
    date: string;
    time: string;
    isDirectSale?: boolean | null;
    isCourtesy?: boolean | null;
    createdBy?: string | null;
  }

  const coerceSale = (raw: any): SaleRecord => {
    // items podem ter vindo serializados em JSON string em alguns cenários antigos
    let items: OrderItem[] = [];
    try {
      if (Array.isArray(raw.items)) {
        items = raw.items as OrderItem[];
      } else if (typeof raw.items === 'string') {
        items = JSON.parse(raw.items);
      }
    } catch {
      items = [];
    }
    return {
      id: raw.id,
      comandaNumber: raw.comandaNumber ?? raw.comanda_number,
      customerName: raw.customerName ?? raw.customer_name,
      items,
      total: typeof raw.total === 'string' ? parseFloat(raw.total) : raw.total,
      paymentMethod: raw.paymentMethod,
      date: raw.date,
      time: raw.time,
      isDirectSale: !!raw.isDirectSale,
      isCourtesy: !!raw.isCourtesy,
      createdBy: raw.createdBy,
    };
  };

  const fetchSales = async () => {
    console.log('🔍 VENDAS: Buscando vendas...');
    let allSales: SaleRecord[] = [];
    
    // Por enquanto, usar apenas localStorage devido a problemas de schema no Supabase
    try {
      const localSales = localStorage.getItem('sales_records');
      if (localSales) {
        const parsedLocalSales = JSON.parse(localSales).map(coerceSale);
        console.log('💾 Usando vendas do localStorage:', parsedLocalSales.length);
        allSales = parsedLocalSales;
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

  // Adicionar nova venda (agora delega ao salesService)
  const addSale = async (sale: Omit<SaleRecord, 'id'>) => {
    console.log('🧭 addSale (refatorado) delegando para registerSale:', sale);

    const input: RegisterSaleInput = {
      items: sale.items,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      isDirectSale: sale.isDirectSale,
      isCourtesy: sale.isCourtesy,
      comandaNumber: sale.comandaNumber,
      customerName: sale.customerName,
    };

    try {
      const { sale: storedSale, storedLocally } = await registerSale(input);
      if (storedLocally) {
        notifySuccess('Venda registrada (local)!');
      } else {
        notifySuccess('Venda registrada!');
      }
      await fetchSales();
      return storedSale.id;
    } catch (err: any) {
      notifyError('Erro ao registrar venda', err, { context: 'addSale' });
      throw err;
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sales, loading, addSale, fetchSales };
}
