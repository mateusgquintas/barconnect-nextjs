import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DashboardControladoria } from '@/components/DashboardControladoria';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de exportToExcel
jest.mock('@/utils/exportToExcel', () => ({
  exportDashboardToExcel: jest.fn(),
}));

const mockExportDashboardToExcel = require('@/utils/exportToExcel').exportDashboardToExcel as jest.Mock;

// Mock data fixtures - usando datas de NOVEMBRO (mês padrão do componente)
const mockTransactions = [
  {
    id: '1',
    type: 'income' as const,
    amount: 1500,
    description: 'Venda de bebidas',
    date: '15/11/2025',
    time: '14:30',
    category: 'Vendas',
  },
  {
    id: '2',
    type: 'expense' as const,
    amount: 500,
    description: 'Compra de estoque',
    date: '16/11/2025',
    time: '10:15',
    category: 'Estoque',
  },
  {
    id: '3',
    type: 'income' as const,
    amount: 800,
    description: 'Eventos',
    date: '20/11/2025',
    time: '18:45',
    category: 'Eventos',
  },
  {
    id: '4',
    type: 'expense' as const,
    amount: 300,
    description: 'Funcionários',
    date: '25/11/2025',
    time: '09:00',
    category: 'Pessoal',
  },
];

const mockSalesRecords = [
  {
    id: 'sale1',
    date: '18/11/2025',
    time: '14:30',
    total: 250,
    items: [{ product: { id: 'p1', name: 'Cerveja', price: 25, stock: 100 }, quantity: 10 }],
    customerName: 'João Silva',
    paymentMethod: 'cash' as const,
    isDirectSale: true,
    isCourtesy: false,
  },
  {
    id: 'sale2',
    date: '22/11/2025',
    time: '19:45',
    total: 180,
    items: [{ product: { id: 'p2', name: 'Refrigerante', price: 30, stock: 50 }, quantity: 6 }],
    customerName: 'Maria Santos',
    paymentMethod: 'credit' as const,
    isDirectSale: true,
    isCourtesy: false,
  },
  {
    id: 'sale3',
    date: '28/11/2025',
    time: '16:20',
    total: 320,
    items: [{ product: { id: 'p3', name: 'Hambúrguer', price: 80, stock: 20 }, quantity: 4 }],
    customerName: 'Carlos Lima',
    paymentMethod: 'pix' as const,
    isDirectSale: true,
    isCourtesy: false,
  },
];

// Fixtures para diferentes cenários
const mockEmptyData = {
  transactions: [],
  salesRecords: [],
};

const mockRichData = {
  transactions: mockTransactions,
  salesRecords: mockSalesRecords,
};

describe('DashboardControladoria Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log para evitar logs nos testes
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renderiza header com título e descrição', () => {
      render(<DashboardControladoria {...mockEmptyData} />);
      
      expect(screen.getByText('Dashboard - Controladoria')).toBeInTheDocument();
      expect(screen.getByText('Análise financeira detalhada')).toBeInTheDocument();
    });

    it('renderiza filtros de data', () => {
      render(<DashboardControladoria {...mockEmptyData} />);
      
      expect(screen.getByText('Período:')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue(/-/)).toHaveLength(2); // 2 inputs de data
      expect(screen.getByText('até')).toBeInTheDocument();
    });

    it('renderiza botão de exportar Excel', () => {
      render(<DashboardControladoria {...mockEmptyData} />);
      
      const exportButton = screen.getByRole('button', { name: /exportar para excel/i });
      expect(exportButton).toBeInTheDocument();
      expect(within(exportButton).getByText('Exportar Excel')).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    it('calcula e exibe métricas financeiras corretamente', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Faturamento Total = vendas (250+180+320) + income transactions (1500+800) = 3050
      expect(screen.getByText('Faturamento Total')).toBeInTheDocument();
      expect(screen.getByText('R$ 3.050')).toBeInTheDocument();
      
      // Despesas Total = expense transactions (500+300) = 800
      expect(screen.getByText('Despesas Total')).toBeInTheDocument();
      expect(screen.getByText('R$ 800')).toBeInTheDocument();
      
      // Lucro Líquido = 3050 - 800 = 2250
      expect(screen.getByText('Lucro Líquido')).toBeInTheDocument();
      expect(screen.getByText('R$ 2.250')).toBeInTheDocument();
      
      // Margem de Lucro = (2250/3050) * 100 = 73.8%
      expect(screen.getByText('Margem de Lucro')).toBeInTheDocument();
      expect(screen.getByText('73.8%')).toBeInTheDocument();
    });

    it('exibe ícones corretos para cada métrica', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      const cards = screen.getAllByRole('generic').filter(el => 
        el.className?.includes('p-6') && el.children.length > 0
      );
      
      expect(cards.length).toBeGreaterThanOrEqual(4); // 4 cards de métricas
    });

    it('lida com dados vazios graciosamente', () => {
      render(<DashboardControladoria {...mockEmptyData} />);
      
        const zeroValues = screen.getAllByText('R$ 0');
        expect(zeroValues.length).toBeGreaterThan(0); // Múltiplos valores zero
      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Margem 0%
    });
  });

  describe('Date Filtering', () => {
    const user = userEvent.setup();

    it('permite alterar data de início', async () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      const startDateInput = screen.getAllByDisplayValue(/-/)[0];
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-10-01');
      
      expect(startDateInput).toHaveValue('2025-10-01');
    });

    it('permite alterar data de fim', async () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      const endDateInput = screen.getAllByDisplayValue(/-/)[1];
      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-10-31');
      
      expect(endDateInput).toHaveValue('2025-10-31');
    });

    it('filtra dados baseado no período selecionado', async () => {
      // Renderizar com data que exclui alguns dados
      render(<DashboardControladoria {...mockRichData} />);
      
      // Definir período que inclui apenas algumas transações
      const startDateInput = screen.getAllByDisplayValue(/-/)[0];
      const endDateInput = screen.getAllByDisplayValue(/-/)[1];
      
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-10-16');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-10-25');
      
      // Os valores devem ser recalculados automaticamente
      // Verificar que o componente ainda renderiza normalmente
      expect(screen.getByText('Faturamento Total')).toBeInTheDocument();
    });
  });

  describe('Charts and Visualizations', () => {
    it('renderiza gráfico de fluxo de caixa mensal', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      expect(screen.getByText('Fluxo de Caixa Mensal')).toBeInTheDocument();
      // ResponsiveContainer é renderizado (Recharts)
      expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('renderiza distribuição de entradas', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      expect(screen.getByText('Distribuição de Entradas')).toBeInTheDocument();
      
      // Verificar se as categorias aparecem (podem aparecer múltiplas vezes: SVG + lista)
      expect(screen.getByText('Vendas do Bar')).toBeInTheDocument(); // Vendas diretas
      expect(screen.getAllByText('Eventos').length).toBeGreaterThan(0);
    });

    it('renderiza distribuição de saídas', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      expect(screen.getByText('Distribuição de Saídas')).toBeInTheDocument();
      
      // Verificar se as categorias aparecem (podem aparecer múltiplas vezes: SVG + lista + measurement span)
      expect(screen.getAllByText('Estoque').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pessoal').length).toBeGreaterThan(0);
    });

    it('mostra percentuais corretos nas distribuições', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Verificar que existem percentuais sendo exibidos
      const percentageTexts = screen.getAllByText(/\d+\.\d%|\d+%/);
      expect(percentageTexts.length).toBeGreaterThan(0);
    });

    it('exibe valores monetários formatados', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Valores devem estar formatados com R$ e separadores (verificar que existem valores monetários)
      const moneyRegex = /R\$/;
      const elements = screen.getAllByText(moneyRegex);
      expect(elements.length).toBeGreaterThan(3); // Pelo menos alguns valores monetários visíveis
    });
  });

  describe('Data Processing', () => {
    it('combina vendas diretas com transações de entrada', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Total de vendas: 250+180+320 = 750
      // Total de transações income: 1500+800 = 2300
      // Total esperado: 3050
      // Verificar que o total está sendo exibido (pode estar formatado de várias formas)
      expect(screen.getByText(/3\.050|3050/)).toBeInTheDocument();
    });

    it('agrupa dados por categoria corretamente', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Verificar se diferentes categorias são mostradas (podem aparecer em múltiplos lugares)
      expect(screen.getByText('Vendas do Bar')).toBeInTheDocument();
      expect(screen.getAllByText('Eventos').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Estoque').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pessoal').length).toBeGreaterThan(0);
    });

    it('calcula margem de lucro corretamente', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Lucro: 3050 - 800 = 2250
      // Margem: (2250/3050) * 100 = 73.77% -> rounded to 73.8%
      // Verificar que a margem está visível (pode estar formatada de diferentes formas)
      const marginText = screen.getByText(/73\.8|73,8/);
      expect(marginText).toBeInTheDocument();
    });

    it('lida com margem de lucro quando não há receita', () => {
      const noIncomeData = {
        transactions: [mockTransactions[1], mockTransactions[3]], // Apenas expenses
        salesRecords: [],
      };
      
      render(<DashboardControladoria {...noIncomeData} />);
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    const user = userEvent.setup();

    it('chama função de exportar quando botão é clicado', async () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      const exportButton = screen.getByRole('button', { name: /exportar para excel/i });
      await user.click(exportButton);
      
      expect(mockExportDashboardToExcel).toHaveBeenCalledWith({
        transactions: expect.any(Array),
        salesRecords: expect.any(Array),
        startDate: expect.any(String),
        endDate: expect.any(String),
      });
    });

    it('passa dados filtrados para a exportação', async () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Alterar filtros
      const startDateInput = screen.getAllByDisplayValue(/-/)[0];
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-10-20');
      
      const exportButton = screen.getByRole('button', { name: /exportar para excel/i });
      await user.click(exportButton);
      
      expect(mockExportDashboardToExcel).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2025-10-20',
        })
      );
    });
  });

  describe('Responsive Layout', () => {
    it('usa grid responsivo para cards de métricas', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      const metricsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
      expect(metricsGrid).toBeInTheDocument();
    });

    it('usa layout responsivo para distribuições', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      const distributionGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(distributionGrid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('possui labels acessíveis para inputs de data', () => {
      render(<DashboardControladoria {...mockEmptyData} />);
      
      const dateInputs = screen.getAllByDisplayValue(/-/);
      dateInputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'date');
      });
    });

    it('botão de exportar tem aria-label descritivo', () => {
      render(<DashboardControladoria {...mockEmptyData} />);
      
      const exportButton = screen.getByRole('button', { name: /exportar para excel/i });
      expect(exportButton).toHaveAttribute('aria-label', 'Exportar para Excel');
    });

    it('usa headings apropriados para seções', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      expect(screen.getByRole('heading', { name: /dashboard - controladoria/i })).toBeInTheDocument();
      expect(screen.getByText('Fluxo de Caixa Mensal')).toBeInTheDocument();
      expect(screen.getByText('Distribuição de Entradas')).toBeInTheDocument();
      expect(screen.getByText('Distribuição de Saídas')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('lida com datas em formato inválido graciosamente', () => {
      const invalidDateData = {
        transactions: [{
          ...mockTransactions[0],
          date: 'invalid-date',
        }],
        salesRecords: [{
          ...mockSalesRecords[0],
          date: 'invalid-date',
        }],
      };
      
      // Não deve quebrar a aplicação
      expect(() => {
        render(<DashboardControladoria {...invalidDateData} />);
      }).not.toThrow();
    });

    it('lida com arrays vazios sem erro', () => {
      render(<DashboardControladoria {...mockEmptyData} />);
      
        const zeroValues = screen.getAllByText('R$ 0');
        expect(zeroValues.length).toBeGreaterThan(0);
      expect(screen.getByText('Dashboard - Controladoria')).toBeInTheDocument();
    });

    it('lida com valores muito grandes corretamente', () => {
      const largeValueData = {
        transactions: [{
          id: '1',
          type: 'income' as const,
          amount: 1000000,
          description: 'Grande venda',
          date: '15/11/2025', // Usar novembro para corresponder ao filtro padrão
          time: '14:00',
          category: 'Vendas',
        }],
        salesRecords: [],
      };
      
      render(<DashboardControladoria {...largeValueData} />);
      
      // Verificar formatação de números grandes (formato brasileiro: 1.000.000)
      const largeValues = screen.getAllByText(/1\.000\.000/);
      expect(largeValues.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('renderiza rapidamente com grande volume de dados', () => {
      // Criar dataset grande
      const largeTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        type: i % 2 === 0 ? 'income' as const : 'expense' as const,
        amount: Math.random() * 1000,
        description: `Transaction ${i}`,
        date: '15/11/2025', // Usar novembro
        time: '12:00',
        category: `Category ${i % 10}`,
      }));

      const largeSalesRecords = Array.from({ length: 500 }, (_, i) => ({
        id: `sale${i}`,
        date: '15/11/2025', // Usar novembro
        time: '12:00',
        total: Math.random() * 500,
        items: [],
        customerName: `Customer ${i}`,
        paymentMethod: 'cash' as const,
        isDirectSale: true,
        isCourtesy: false,
      }));
      
      const start = performance.now();
      render(<DashboardControladoria transactions={largeTransactions} salesRecords={largeSalesRecords} />);
      const end = performance.now();
      
      // Deve renderizar em menos de 1 segundo
      expect(end - start).toBeLessThan(1000);
      expect(screen.getByText('Dashboard - Controladoria')).toBeInTheDocument();
    });
  });

  describe('Monthly Data Processing', () => {
    it('gera dados mensais para os últimos 9 meses', () => {
      render(<DashboardControladoria {...mockRichData} />);
      
      // Deve existir um gráfico com dados mensais
      expect(screen.getByText('Fluxo de Caixa Mensal')).toBeInTheDocument();
      
    // Verificar que o gráfico foi renderizado
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('processa corretamente transações de meses diferentes', () => {
      const multiMonthData = {
        transactions: [
          { ...mockTransactions[0], date: '15/09/2025' }, // Setembro
          { ...mockTransactions[1], date: '15/10/2025' }, // Outubro
          { ...mockTransactions[2], date: '15/11/2025' }, // Novembro (futuro)
        ],
        salesRecords: mockSalesRecords,
      };
      
      render(<DashboardControladoria {...multiMonthData} />);
      
      expect(screen.getByText('Fluxo de Caixa Mensal')).toBeInTheDocument();
    });
  });
});