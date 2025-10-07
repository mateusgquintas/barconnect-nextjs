// utils/exportToExcel.ts
import * as XLSX from 'xlsx';

export function exportDashboardToExcel({
  transactions,
  salesRecords,
  startDate,
  endDate
}: {
  transactions: any[];
  salesRecords: any[];
  startDate: string;
  endDate: string;
}) {
  // Planilha 1: Transações
  const txSheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
    Data: t.date,
    Tipo: t.type === 'income' ? 'Entrada' : 'Saída',
    Categoria: t.category,
    Descrição: t.description,
    Valor: t.amount
  })));

  // Planilha 2: Vendas
  const salesSheet = XLSX.utils.json_to_sheet(salesRecords.map(s => ({
    Data: s.date,
    Cliente: s.customerName,
    Total: s.total
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, txSheet, 'Transações');
  XLSX.utils.book_append_sheet(wb, salesSheet, 'Vendas');

  XLSX.writeFile(wb, `dashboard_${startDate}_a_${endDate}.xlsx`);
}
