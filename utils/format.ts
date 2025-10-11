import { Transaction, SaleRecord } from '@/types';

export function formatCurrency(value: number, locale: string = 'pt-BR', currency: string = 'BRL') {
  return value.toLocaleString(locale, { style: 'currency', currency });
}

export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const normalized = value.replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

export function parseBRDateToISO(brDate: string): string | null {
  // brDate: dd/mm/aaaa
  const parts = brDate.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(p => parseInt(p));
  if (!day || !month || !year) return null;
  const iso = new Date(year, month - 1, day).toISOString().split('T')[0];
  return iso;
}

export function combineDateTimeBR(date: string, time: string): Date | null {
  const [day, month, year] = date.split('/').map(Number);
  if (!day || !month || !year) return null;
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
}

export function sortTransactionsDesc<T extends { date: string; time: string }>(arr: T[]): T[] {
  return [...arr].sort((a,b) => {
    const da = combineDateTimeBR(a.date, a.time)?.getTime() || 0;
    const db = combineDateTimeBR(b.date, b.time)?.getTime() || 0;
    return db - da;
  });
}

export function salesToTransactions(sales: SaleRecord[]) {
  return sales.map((sale) => {
    let desc = '';
    if (sale.isCourtesy) {
      desc = 'Cortesia - ' + (sale.isDirectSale ? 'Venda Direta' : `Comanda #${sale.comandaNumber}`);
    } else if (sale.isDirectSale) {
      desc = `Venda Direta${sale.customerName ? ' - ' + sale.customerName : ''}`;
    } else {
      desc = `Venda Comanda #${sale.comandaNumber}${sale.customerName ? ' - ' + sale.customerName : ''}`;
    }
    return {
      id: `sale_tx_${sale.id}`,
      type: 'income' as const,
      description: desc,
      amount: sale.total,
      category: 'Vendas',
      date: sale.date,
      time: sale.time,
    };
  });
}
