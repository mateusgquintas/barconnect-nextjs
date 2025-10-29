// utils/exportToExcel.ts
import ExcelJS from 'exceljs';

export async function exportDashboardToExcel({
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
  const workbook = new ExcelJS.Workbook();
  
  // Planilha 1: Transações
  const txSheet = workbook.addWorksheet('Transações');
  txSheet.columns = [
    { header: 'Data', key: 'date', width: 12 },
    { header: 'Tipo', key: 'type', width: 10 },
    { header: 'Categoria', key: 'category', width: 15 },
    { header: 'Descrição', key: 'description', width: 30 },
    { header: 'Valor', key: 'amount', width: 12 }
  ];
  
  transactions.forEach(t => {
    txSheet.addRow({
      date: t.date,
      type: t.type === 'income' ? 'Entrada' : 'Saída',
      category: t.category,
      description: t.description,
      amount: t.amount
    });
  });
  
  // Formatação do cabeçalho
  txSheet.getRow(1).font = { bold: true };
  txSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Planilha 2: Vendas
  const salesSheet = workbook.addWorksheet('Vendas');
  salesSheet.columns = [
    { header: 'Data', key: 'date', width: 12 },
    { header: 'Cliente', key: 'customerName', width: 25 },
    { header: 'Total', key: 'total', width: 12 }
  ];
  
  salesRecords.forEach(s => {
    salesSheet.addRow({
      date: s.date,
      customerName: s.customerName,
      total: s.total
    });
  });
  
  // Formatação do cabeçalho
  salesSheet.getRow(1).font = { bold: true };
  salesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Gera o arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard_${startDate}_a_${endDate}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
