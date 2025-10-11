'use client'

import React, { useState, useMemo, memo, useCallback } from 'react';
import { Card } from './ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileSpreadsheet } from 'lucide-react';
import { Input } from './ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, SaleRecord } from '@/types';
import { exportDashboardToExcel } from '@/utils/exportToExcel';

interface DashboardControladoria {
  transactions: Transaction[];
  salesRecords: SaleRecord[];
}

// Utility functions moved outside component to prevent recreation
const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const isDateInRange = (dateString: string, startDate: string, endDate: string): boolean => {
  const date = parseDate(dateString);
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
};

const filterByDateRange = <T extends { date: string }>(
  items: T[], 
  startDate: string, 
  endDate: string
): T[] => {
  return items.filter(item => isDateInRange(item.date, startDate, endDate));
};

const calculateTotals = (
  transactions: Transaction[], 
  salesRecords: SaleRecord[]
) => {
  const salesIncome = salesRecords.reduce((sum, sale) => sum + sale.total, 0);
  const transactionIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = salesIncome + transactionIncome;
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const profit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : '0.0';

  return { salesIncome, transactionIncome, totalIncome, totalExpense, profit, profitMargin };
};

export const DashboardControladoria = memo<DashboardControladoria>(({ transactions, salesRecords }) => {
  // Filtro de data - padrão: mês atual completo
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0]);

  // Optimize date calculations with useMemo
  const filteredData = useMemo(() => {
    const filteredTransactions = filterByDateRange(transactions, startDate, endDate);
    const filteredSales = filterByDateRange(salesRecords, startDate, endDate);
    
    console.log('📈 DashboardControladoria - Dados recebidos:', {
      transactions: transactions.length,
      salesRecords: salesRecords.length,
      filteredTransactions: filteredTransactions.length,
      filteredSales: filteredSales.length,
      startDate,
      endDate,
    });

    return { filteredTransactions, filteredSales };
  }, [transactions, salesRecords, startDate, endDate]);

  // Memoize heavy calculations
  const totals = useMemo(() => {
    return calculateTotals(filteredData.filteredTransactions, filteredData.filteredSales);
  }, [filteredData]);

  // Memoize monthly data calculation
  const monthlyData = useMemo(() => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return Array.from({ length: 9 }, (_, i) => {
      const monthIndex = (currentMonth - 8 + i + 12) % 12;
      const year = monthIndex > currentMonth ? currentYear - 1 : currentYear;
      
      const monthTransactions = transactions.filter(t => {
        const [day, m, y] = t.date.split('/');
        return parseInt(y) === year && parseInt(m) - 1 === monthIndex;
      });

      const monthSales = salesRecords.filter(sale => {
        const [day, m, y] = sale.date.split('/');
        return parseInt(y) === year && parseInt(m) - 1 === monthIndex;
      });
      
      const transactionIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const salesIncome = monthSales.reduce((sum, sale) => sum + sale.total, 0);
      
      const saidas = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        month: monthNames[monthIndex],
        entradas: transactionIncome + salesIncome,
        saidas,
      };
    });
  }, [transactions, salesRecords, today]);

  // Memoize distribution calculations
  const distributions = useMemo(() => {
    const { filteredTransactions, filteredSales } = filteredData;
    const { salesIncome, totalIncome, totalExpense } = totals;

    // Distribuição de Entradas por categoria (incluindo vendas)
    const incomeByCategory = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Adicionar vendas como categoria separada
    if (salesIncome > 0) {
      incomeByCategory['Vendas do Bar'] = salesIncome;
    }

    const incomeDistribution = Object.entries(incomeByCategory).map(([category, value]) => ({
      category,
      value,
      percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0,
    }));

    // Distribuição de Saídas por categoria
    const expenseByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const expenseDistribution = Object.entries(expenseByCategory).map(([category, value]) => ({
      category,
      value,
      percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
    }));

    return { incomeDistribution, expenseDistribution };
  }, [filteredData, totals]);

  // Memoized callbacks
  const handleExport = useCallback(() => {
    exportDashboardToExcel({
      transactions: filteredData.filteredTransactions,
      salesRecords: filteredData.filteredSales,
      startDate,
      endDate
    });
  }, [filteredData, startDate, endDate]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 pt-6">
        {/* Header with Date Filter and Export */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-slate-900 mb-1">Dashboard - Controladoria</h1>
            <p className="text-slate-600 text-sm">Análise financeira detalhada</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Período:</span>
            </div>
            <div className="flex flex-col">
              <label htmlFor="start-date" className="sr-only">Data de início do período</label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                className="w-36 h-9 text-sm"
                aria-label="Data de início do período"
              />
            </div>
            <span className="text-slate-400">até</span>
            <div className="flex flex-col">
              <label htmlFor="end-date" className="sr-only">Data de fim do período</label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                className="w-36 h-9 text-sm"
                aria-label="Data de fim do período"
              />
            </div>
            <button
              className="ml-4 flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow focus:ring-2 focus:ring-green-400"
              onClick={handleExport}
              aria-label="Exportar para Excel"
              type="button"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Faturamento Total</p>
                <p className="text-2xl text-emerald-600">R$ {totals.totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Despesas Total</p>
                <p className="text-2xl text-rose-600">R$ {totals.totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Lucro Líquido</p>
                <p className="text-2xl text-blue-600">R$ {totals.profit.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Margem de Lucro</p>
                <p className="text-2xl text-purple-600">{totals.profitMargin}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Chart - Entradas vs Saídas Mensal */}
        <Card className="p-6 mb-6">
          <h3 className="text-slate-900 mb-4">Fluxo de Caixa Mensal</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="entradas" fill="#10b981" name="Entradas" radius={[8, 8, 0, 0]} />
              <Bar dataKey="saidas" fill="#ef4444" name="Saídas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição de Entradas */}
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Distribuição de Entradas</h3>
            
            {/* Chart */}
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distributions.incomeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="category" type="category" width={100} stroke="#64748b" />
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Percentages */}
            <div className="space-y-3 mt-6">
              {distributions.incomeDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-900 text-sm">{item.category}</p>
                    <p className="text-xs text-slate-600">
                      R$ {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribuição de Saídas */}
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Distribuição de Saídas</h3>
            
            {/* Chart */}
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distributions.expenseDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="category" type="category" width={100} stroke="#64748b" />
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Percentages */}
            <div className="space-y-3 mt-6">
              {distributions.expenseDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-900 text-sm">{item.category}</p>
                    <p className="text-xs text-slate-600">
                      R$ {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

DashboardControladoria.displayName = 'DashboardControladoria';
