/**
 * @jest-environment jsdom
 */
jest.mock('exceljs');

import { exportDashboardToExcel } from '../utils/exportToExcel';
import ExcelJS from 'exceljs';

describe('exportDashboardToExcel', () => {
  let mockWorksheet: any;
  let mockWorkbook: any;

  beforeEach(() => {
    // Mock da worksheet
    mockWorksheet = {
      columns: [],
      addRow: jest.fn(),
      getRow: jest.fn().mockReturnValue({
        font: {},
        fill: {}
      })
    };

    // Mock do workbook
    mockWorkbook = {
      addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-excel-data'))
      }
    };

    // Mock do construtor ExcelJS.Workbook
    (ExcelJS.Workbook as jest.Mock) = jest.fn(() => mockWorkbook);

    // Mock de URL e DOM
    global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = jest.fn();
    
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gera planilha com abas e headers corretos', async () => {
    const transactions = [
      { date: '2025-10-01', type: 'income', category: 'Bar', description: 'Venda', amount: 100 },
      { date: '2025-10-02', type: 'expense', category: 'Compra', description: 'Reposição', amount: 50 },
    ];
    const salesRecords = [
      { date: '2025-10-01', customerName: 'João', total: 80 },
      { date: '2025-10-02', customerName: 'Maria', total: 120 },
    ];

    await exportDashboardToExcel({ transactions, salesRecords, startDate: '2025-10-01', endDate: '2025-10-02' });

    // Verifica criação do workbook
    expect(ExcelJS.Workbook).toHaveBeenCalled();
    
    // Verifica criação de worksheets
    expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Transações');
    expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Vendas');
    
    // Verifica adição de linhas
    expect(mockWorksheet.addRow).toHaveBeenCalledWith({
      date: '2025-10-01',
      type: 'Entrada',
      category: 'Bar',
      description: 'Venda',
      amount: 100
    });
    
    expect(mockWorksheet.addRow).toHaveBeenCalledWith({
      date: '2025-10-01',
      customerName: 'João',
      total: 80
    });
    
    // Verifica geração do arquivo
    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
    
    // Verifica download
    const link = (document.createElement as jest.Mock).mock.results[0].value;
    expect(link.click).toHaveBeenCalled();
    expect(link.download).toBe('dashboard_2025-10-01_a_2025-10-02.xlsx');
  });

  it('exporta corretamente com arrays vazios', async () => {
    await exportDashboardToExcel({ transactions: [], salesRecords: [], startDate: '2025-10-01', endDate: '2025-10-02' });

    expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(2);
    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
  });

  it('exporta corretamente com dados inválidos (faltando campos)', async () => {
    const transactions = [
      { date: '2025-10-01', type: 'income' } as any, // faltando campos
    ];
    const salesRecords = [
      { date: '2025-10-01' } as any, // faltando campos
    ];

    await exportDashboardToExcel({ transactions, salesRecords, startDate: '2025-10-01', endDate: '2025-10-02' });

    expect(mockWorksheet.addRow).toHaveBeenCalledWith({
      date: '2025-10-01',
      type: 'Entrada',
      category: undefined,
      description: undefined,
      amount: undefined
    });

    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
  });
});
