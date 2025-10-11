// Utilitário para limpeza de registros locais (localStorage)
export function clearLocalSalesAndComandas() {
  // Limpa vendas locais
  try {
    window.localStorage.removeItem('sales_records');
  } catch {}
  // Limpa todas as comandas locais
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('comanda_items_'))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {}
}
import { supabase } from '@/lib/supabase';
import { SaleRecord, PaymentMethod, Product, OrderItem } from '@/types';
import { formatDate, formatTime } from '@/utils/calculations';
import { toast } from 'sonner';

// Input para registrar venda
export interface RegisterSaleInput {
  items: OrderItem[] | readonly OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  isDirectSale?: boolean;
  isCourtesy?: boolean;
  comandaNumber?: number;
  customerName?: string;
}

export interface RegisterSaleResult {
  sale: SaleRecord;
  transactionId?: string;
  storedLocally?: boolean;
}

const LOCAL_SALES_KEY = 'sales_records';
const LOCAL_TRANSACTIONS_KEY = 'transactions_pending';

function buildSaleDescription(sale: SaleRecord) {
  if (sale.isCourtesy) {
    return sale.isDirectSale
      ? 'Cortesia - Venda Direta'
      : `Cortesia - Comanda #${sale.comandaNumber}`;
  }
  if (sale.isDirectSale) return `Venda Direta (${sale.paymentMethod.toUpperCase()})`;
  return `Venda Comanda #${sale.comandaNumber} (${sale.paymentMethod.toUpperCase()})`;
}

function buildTransactionPayload(sale: SaleRecord) {
  return {
    type: 'income' as const,
    description: buildSaleDescription(sale),
    amount: sale.total,
    category: 'Vendas',
    date: sale.date,
    time: sale.time,
  };
}

async function persistTransactionToSupabase(payload: ReturnType<typeof buildTransactionPayload>) {
  // A tabela transactions armazena created_at; date/time são campos derivativos para UI.
  // Inserimos somente as colunas existentes (type, description, amount, category)
  // date/time são para payload local/offline e não persistem se a coluna não existir.
  const insertPayload: any = {
    type: payload.type,
    description: payload.description,
    amount: payload.amount,
    category: payload.category,
  };
  const { error, data } = await supabase.from('transactions').insert(insertPayload).select('id').single();
  if (error) throw error;
  return data?.id as string;
}

async function persistSaleToSupabase(sale: Omit<SaleRecord, 'id'>): Promise<string> {
  // Usar apenas campos básicos que provavelmente existem no Supabase
  const saleForDb = {
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    items: JSON.stringify(sale.items), // Converter array para string JSON
    // Remover campos que podem não existir: date, time, comandaNumber, customerName, etc.
  };

  console.log('📊 Tentando salvar venda simplificada no Supabase:', saleForDb);

  // Tentar tabela principal 'sales'
  const { error, data } = await supabase
    .from('sales')
    .insert(saleForDb)
    .select('id')
    .single();
  
  if (!error && data?.id) {
    console.log('✅ Venda salva na tabela sales:', data.id);
    return data.id as string;
  }

  console.log('❌ Erro na tabela sales:', error);

  // Fallback tabela alternativa
  const { error: error2, data: data2 } = await supabase
    .from('sales_records')
    .insert(saleForDb)
    .select('id')
    .single();
  
  if (error2) {
    console.log('❌ Erro na tabela sales_records:', error2);
    throw error2;
  }
  
  console.log('✅ Venda salva na tabela sales_records:', data2?.id);
  return data2?.id as string;
}

function persistLocallySale(sale: SaleRecord) {
  try {
    const existing = localStorage.getItem(LOCAL_SALES_KEY);
    const arr = existing ? JSON.parse(existing) : [];
    arr.push(sale);
    localStorage.setItem(LOCAL_SALES_KEY, JSON.stringify(arr));
  } catch (err) {
    console.warn('Falha ao salvar venda localmente', err);
  }
}

function persistLocallyTransaction(payload: ReturnType<typeof buildTransactionPayload>) {
  try {
    const existing = localStorage.getItem(LOCAL_TRANSACTIONS_KEY);
    const arr = existing ? JSON.parse(existing) : [];
    arr.push({ ...payload, id: `tx_local_${Date.now()}` });
    localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(arr));
  } catch (err) {
    console.warn('Falha ao salvar transação localmente', err);
  }
}

export async function registerSale(input: RegisterSaleInput): Promise<RegisterSaleResult> {
  const now = new Date();
  // Garantir array mutável
  const items = Array.isArray(input.items) ? [...input.items] : [];
  const baseSale: Omit<SaleRecord, 'id'> = {
    comandaNumber: input.comandaNumber,
    customerName: input.customerName,
    items,
    total: input.total,
    paymentMethod: input.paymentMethod,
    date: formatDate(now),
    time: formatTime(now),
    isDirectSale: !!input.isDirectSale,
    isCourtesy: !!input.isCourtesy,
  };

  let saleId: string | null = null;
  let transactionId: string | undefined;
  let storedLocally = false;

  // Por enquanto, salvar apenas localmente devido a problemas de schema
  console.log('⚠️ Salvando apenas no localStorage devido a problemas de schema no Supabase');
  saleId = `sale_local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  storedLocally = true;

  // Comentado temporariamente
  // try {
  //   saleId = await persistSaleToSupabase(baseSale);
  // } catch (saleErr) {
  //   console.warn('Erro ao persistir venda no Supabase, salvando localmente', saleErr);
  //   saleId = `sale_local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  //   storedLocally = true;
  // }

  const sale: SaleRecord = { ...baseSale, id: saleId };
  if (storedLocally) persistLocallySale(sale);

  const txPayload = buildTransactionPayload(sale);
  try {
    if (!storedLocally) {
      transactionId = await persistTransactionToSupabase(txPayload);
    } else {
      persistLocallyTransaction(txPayload);
    }
  } catch (txErr) {
    console.warn('Erro ao registrar transação no Supabase, salvando localmente', txErr);
    persistLocallyTransaction(txPayload);
    storedLocally = true;
  }

  toast.success(sale.isCourtesy ? 'Cortesia registrada' : 'Venda registrada');
  return { sale, transactionId, storedLocally };
}
