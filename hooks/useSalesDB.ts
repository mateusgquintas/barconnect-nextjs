import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SaleRecord, OrderItem } from '@/types';
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
  interface DBSaleRecordLegacy {
    id: string;
    comandaNumber?: number | null;
    customerName?: string | null;
    items?: OrderItem[] | string | null; // legado sales_records
    total: number | string;
    paymentMethod: string;
    date?: string;
    time?: string;
    isDirectSale?: boolean | null;
    isCourtesy?: boolean | null;
    createdBy?: string | null;
  }

  interface DBSaleRow {
    id: string;
    comanda_id: string | null;
    total: number | string;
    payment_method: string;
    is_courtesy?: boolean | null;
    customer_name?: string | null;
    items_snapshot?: any[] | null;
    created_at: string;
    comanda_number?: number | null; // via join opcional
  }

  // Normaliza registros legados do localStorage/sales_records
  const coerceLegacySale = (raw: DBSaleRecordLegacy): SaleRecord => {
    let items: OrderItem[] = [];
    try {
      if (Array.isArray(raw.items)) items = raw.items as OrderItem[];
      else if (typeof raw.items === 'string') items = JSON.parse(raw.items);
    } catch { items = []; }
    return {
      id: raw.id,
  comandaNumber: raw.comandaNumber ?? undefined,
      customerName: raw.customerName || undefined,
      items,
      total: typeof raw.total === 'string' ? parseFloat(raw.total) : raw.total,
      paymentMethod: raw.paymentMethod as any,
      date: raw.date!,
      time: raw.time!,
      isDirectSale: !!raw.isDirectSale,
      isCourtesy: !!raw.isCourtesy,
      createdBy: raw.createdBy || undefined,
    };
  };

  // Normaliza linhas atuais da tabela sales
  const coerceDbSale = (row: DBSaleRow): SaleRecord => {
    // items_snapshot:
    //   [{ product: { id, name, price }, quantity }]
    const items: OrderItem[] = Array.isArray(row.items_snapshot)
      ? row.items_snapshot.map((it: any) => ({
          product: {
            id: it.product?.id ?? it.product_id ?? '',
            name: it.product?.name ?? it.product_name ?? '',
            price: Number(it.product?.price ?? it.product_price ?? 0),
            stock: 0,
            category: 'bar',
          },
          quantity: Number(it.quantity ?? 0),
        }))
      : [];

    const created = new Date(row.created_at);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date = `${pad(created.getDate())}/${pad(created.getMonth() + 1)}/${created.getFullYear()}`;
    const time = `${pad(created.getHours())}:${pad(created.getMinutes())}`;

    return {
      id: row.id,
      comandaNumber: row.comanda_number ?? undefined,
      customerName: row.customer_name ?? undefined,
      items,
      total: typeof row.total === 'string' ? parseFloat(row.total) : (row.total as number),
      paymentMethod: row.payment_method as any,
      date,
      time,
      isDirectSale: !row.comanda_id,
      isCourtesy: !!row.is_courtesy,
    };
  };

  const fetchSales = async () => {
    console.log('🔍 VENDAS: Buscando vendas (DB primeiro, depois local)...');
    let allSales: SaleRecord[] = [];

    // 1) Tentar buscar da tabela sales com join opcional para número da comanda
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('id, comanda_id, total, payment_method, is_courtesy, customer_name, items_snapshot, created_at, comandas!sales_comanda_id_fkey(number)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data as any[]).map((row: any) => {
        const dbRow: DBSaleRow = {
          id: row.id,
          comanda_id: row.comanda_id,
          total: row.total,
          payment_method: row.payment_method,
          is_courtesy: row.is_courtesy,
          customer_name: row.customer_name,
          items_snapshot: row.items_snapshot,
          created_at: row.created_at,
          comanda_number: row.comandas?.number ?? null,
        };
        return coerceDbSale(dbRow);
      });

      if (mapped.length > 0) {
        allSales = mapped;
        console.log('✅ Vendas carregadas do Supabase:', allSales.length);
      }
    } catch (err) {
      console.warn('⚠️ Erro ao buscar vendas no Supabase, tentando localStorage:', err);
    }

    // 2) Fallback/local: juntar com registros locais legados
    try {
      const localSales = localStorage.getItem('sales_records');
      if (localSales) {
        const parsedLocalSales = (JSON.parse(localSales) as DBSaleRecordLegacy[]).map(coerceLegacySale);
        console.log('💾 Vendas locais encontradas:', parsedLocalSales.length);
        // Mesclar e remover duplicatas por id (prioriza versão DB por estar primeiro)
        const merged = [...allSales, ...parsedLocalSales].filter((sale, index, self) =>
          index === self.findIndex((s) => s.id === sale.id)
        );
        allSales = merged;
      }
    } catch (error) {
      console.log('⚠️ Erro ao ler localStorage:', error);
    }

    // Ordenar por data/hora desc se houver
    allSales.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

    console.log('📦 Total de vendas carregadas:', allSales.length);
    setSales(allSales);
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
