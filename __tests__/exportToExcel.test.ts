jest.mock('xlsx', () => ({
  writeFile: jest.fn(),
  utils: {
    json_to_sheet: jest.fn(() => ({})),
    sheet_to_json: jest.fn(() => []),
    book_new: jest.fn(() => ({ SheetNames: [], Sheets: {} })),
    book_append_sheet: jest.fn(),
  },
}));

import { exportDashboardToExcel } from '../utils/exportToExcel';
import * as XLSX from 'xlsx';

describe('exportDashboardToExcel', () => {
  const mockWriteFile = XLSX.writeFile as jest.Mock;
  const mockJsonToSheet = XLSX.utils.json_to_sheet as jest.Mock;

  afterEach(() => {
    mockWriteFile.mockReset();
    mockJsonToSheet.mockReset();
  });

  it('gera planilha com abas e headers corretos', () => {
    const transactions = [
      { date: '2025-10-01', type: 'income', category: 'Bar', description: 'Venda', amount: 100 },
      { date: '2025-10-02', type: 'expense', category: 'Compra', description: 'Reposição', amount: 50 },
    ];
    const salesRecords = [
      { date: '2025-10-01', customerName: 'João', total: 80 },
      { date: '2025-10-02', customerName: 'Maria', total: 120 },
    ];

    exportDashboardToExcel({ transactions, salesRecords, startDate: '2025-10-01', endDate: '2025-10-02' });

    expect(mockJsonToSheet).toHaveBeenCalledWith([
      { Data: '2025-10-01', Tipo: 'Entrada', Categoria: 'Bar', Descrição: 'Venda', Valor: 100 },
      { Data: '2025-10-02', Tipo: 'Saída', Categoria: 'Compra', Descrição: 'Reposição', Valor: 50 },
    ]);

    expect(mockJsonToSheet).toHaveBeenCalledWith([
      { Data: '2025-10-01', Cliente: 'João', Total: 80 },
      { Data: '2025-10-02', Cliente: 'Maria', Total: 120 },
    ]);

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it('exporta corretamente com arrays vazios', () => {
    exportDashboardToExcel({ transactions: [], salesRecords: [], startDate: '2025-10-01', endDate: '2025-10-02' });

    expect(mockJsonToSheet).toHaveBeenCalledWith([]);
    expect(mockJsonToSheet).toHaveBeenCalledTimes(2);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it('exporta corretamente com dados inválidos (faltando campos)', () => {
    const transactions = [
      { date: '2025-10-01', type: 'income' }, // faltando campos
    ];
    const salesRecords = [
      { date: '2025-10-01' }, // faltando campos
    ];

    exportDashboardToExcel({ transactions, salesRecords, startDate: '2025-10-01', endDate: '2025-10-02' });

    expect(mockJsonToSheet).toHaveBeenCalledWith([
      { Data: '2025-10-01', Tipo: 'Entrada', Categoria: undefined, Descrição: undefined, Valor: undefined },
    ]);

    expect(mockJsonToSheet).toHaveBeenCalledWith([
      { Data: '2025-10-01', Cliente: undefined, Total: undefined },
    ]);

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });
});