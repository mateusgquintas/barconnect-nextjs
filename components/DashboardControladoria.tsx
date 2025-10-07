'use client'

import { useState } from 'react';
import { Card } from './ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Input } from './ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, SaleRecord } from '@/types';

interface DashboardControladoria {
  transactions: Transaction[];
  salesRecords: SaleRecord[];
}

export function DashboardControladoria({ transactions, salesRecords }: DashboardControladoria) {
  // Filtro de data - padrão: mês atual completo
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0]);

  // Debug logs para verificar dados
  console.log('📈 DashboardControladoria - Dados recebidos:', {
    transactions: transactions.length,
    salesRecords: salesRecords.length,
    startDate,
    endDate,
    todayISO: today.toISOString(),
    transactionDates: transactions.map(t => t.date).slice(0, 5),
    salesDates: salesRecords.map(s => s.date).slice(0, 5)
  });

  // Filtrar transações por período
  const filteredTransactions = transactions.filter(t => {
    const [day, month, year] = t.date.split('/');
    const transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return transactionDate >= start && transactionDate <= end;
  });

  // Filtrar vendas por período
  const filteredSales = salesRecords.filter(sale => {
    const [day, month, year] = sale.date.split('/');
    const saleDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return saleDate >= start && saleDate <= end;
  });

  // Calcular totais do período incluindo vendas
  const salesIncome = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const transactionIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = salesIncome + transactionIncome;
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const profit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : '0.0';

  // Agrupar por mês para o gráfico (últimos 9 meses incluindo mês atual)
  const currentMonth = today.getMonth(); // outubro = 9
  const currentYear = today.getFullYear();
  const monthlyData = Array.from({ length: 9 }, (_, i) => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIndex = (currentMonth - 8 + i + 12) % 12; // últimos 9 meses
    const year = monthIndex > currentMonth ? currentYear - 1 : currentYear;
    const month = monthIndex;
    
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 pt-6">
        {/* Header with Date Filter */}
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
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36 h-9 text-sm"
            />
            <span className="text-slate-400">até</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36 h-9 text-sm"
            />
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
                <p className="text-2xl text-emerald-600">R$ {totalIncome.toLocaleString()}</p>
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
                <p className="text-2xl text-rose-600">R$ {totalExpense.toLocaleString()}</p>
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
                <p className="text-2xl text-blue-600">R$ {profit.toLocaleString()}</p>
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
                <p className="text-2xl text-purple-600">{profitMargin}%</p>
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
              <BarChart data={incomeDistribution} layout="vertical">
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
              {incomeDistribution.map((item, index) => (
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
              <BarChart data={expenseDistribution} layout="vertical">
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
              {expenseDistribution.map((item, index) => (
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
}
