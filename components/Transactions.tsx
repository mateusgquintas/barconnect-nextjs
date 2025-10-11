'use client'
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowUpRight, ArrowDownRight, Calendar, FileSpreadsheet } from 'lucide-react';
import { exportDashboardToExcel } from '@/utils/exportToExcel';
import { NewTransactionDialog } from './NewTransactionDialog';
import { Transaction, SaleRecord } from '@/types';
import { salesToTransactions, sortTransactionsDesc, formatCurrency } from '@/utils/format';

interface TransactionsProps {
  transactions: Transaction[];
  salesRecords: SaleRecord[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'time'>) => void;
  startDate: string;
  endDate: string;
}

export function Transactions({ transactions, salesRecords, onAddTransaction, startDate: initialStartDate, endDate: initialEndDate }: TransactionsProps) {

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  // Filtros de busca e data
  const [search, setSearch] = useState('');
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(initialStartDate || firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialEndDate || today.toISOString().split('T')[0]);

  const handleAddTransactionLocal = (transaction: Omit<Transaction, 'id' | 'date' | 'time'>) => {
    try {
      onAddTransaction(transaction);
      toast.success('Transação adicionada com sucesso!');
      // Atualizar data final para incluir hoje se necessário
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      if (endDate < todayStr) {
        setEndDate(todayStr);
      }
    } catch (e) {
      toast.error('Erro ao adicionar transação.');
    }
  };

  // Filtrar transações por data e busca
  const filteredTransactions = useMemo(() => transactions.filter(t => {
    const [day, month, year] = t.date.split('/');
    const transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // Criar datas de início e fim no mesmo fuso horário (local)
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    end.setHours(23, 59, 59, 999);
    const matchesDate = transactionDate >= start && transactionDate <= end;
    const matchesSearch = !search.trim() ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchesDate && matchesSearch;
  }), [transactions, startDate, endDate, search]);

  // Converter vendas em transações sintéticas de entrada
  const salesAsTransactions: Transaction[] = useMemo(() => salesToTransactions(salesRecords), [salesRecords]);

  // Aplicar filtros de data nas vendas também
  const filteredSalesTransactions = useMemo(() => salesAsTransactions.filter(t => {
    // Suporte robusto a datas BR e ISO
    let date: Date;
    if (t.date.includes('/')) {
      const [day, month, year] = t.date.split('/');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(t.date);
    }
    // Criar datas de início e fim no mesmo fuso horário (local)
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    end.setHours(23,59,59,999);
    return date >= start && date <= end && (
      !search.trim() ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    );
  }), [salesAsTransactions, startDate, endDate, search]);

  const incomeTransactions = useMemo(() => sortTransactionsDesc([
    ...filteredTransactions.filter(t => t.type === 'income'),
    ...filteredSalesTransactions,
  ]), [filteredTransactions, filteredSalesTransactions]);
  const expenseTransactions = useMemo(() => filteredTransactions.filter(t => t.type === 'expense'), [filteredTransactions]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const ti = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const te = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: ti, totalExpense: te, balance: ti - te };
  }, [incomeTransactions, expenseTransactions]);

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50" aria-labelledby="financial-heading">
      <a href="#conteudo-financeiro" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white shadow px-3 py-2 rounded">Pular para conteúdo</a>
      <div className="p-8" id="conteudo-financeiro">
        {/* Header alinhado com botão Export à direita */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-col lg:flex-row gap-4">
            <div>
              <h1 id="financial-heading" className="text-slate-900 mb-2 text-2xl">Financeiro</h1>
              <p className="text-slate-600">Controle de entradas (inclui vendas) e saídas</p>
            </div>
            <form className="flex items-center gap-3 flex-wrap" aria-label="Filtros de período e busca" onSubmit={e => e.preventDefault()}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span className="text-sm text-slate-600">Período:</span>
              </div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-36 h-9 text-sm"
                aria-label="Data inicial"
              />
              <span className="text-slate-400" aria-hidden="true">até</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-36 h-9 text-sm"
                aria-label="Data final"
              />
              <Input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-56 h-9 text-sm"
                aria-label="Buscar transação ou venda"
              />
              <Button
                onClick={() => exportDashboardToExcel({
                  transactions: incomeTransactions.concat(expenseTransactions),
                  salesRecords,
                  startDate,
                  endDate
                })}
                className="h-9 px-4 bg-green-600 hover:bg-green-700 gap-2"
                aria-label="Exportar dados filtrados para Excel"
              >
                <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                Exportar
              </Button>
            </form>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" aria-label="Resumo financeiro" role="region" aria-describedby="resumo-caption">
          <p id="resumo-caption" className="sr-only">Cards com totais de entradas, saídas e saldo</p>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-600 text-sm">Entradas</h3>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl text-green-600">{formatCurrency(totalIncome)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-600 text-sm">Saídas</h3>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl text-red-600">{formatCurrency(totalExpense)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-600 text-sm">Saldo</h3>
              <div className={`w-10 h-10 ${balance >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
                <span className="text-white">R$</span>
              </div>
            </div>
            <p className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '' : '- '}{formatCurrency(Math.abs(balance))}
            </p>
          </Card>
        </div>

        {/* Action Buttons (abaixo dos cards) */}
  <div className="flex gap-4 mb-6 flex-wrap" role="group" aria-label="Ações de lançamento">
          <Button 
            onClick={() => setShowIncomeDialog(true)}
            className="h-14 px-8 bg-green-600 hover:bg-green-700 gap-3 flex-1 min-w-[180px]"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-lg">Nova Entrada</span>
          </Button>
          <Button 
            onClick={() => setShowExpenseDialog(true)}
            className="h-14 px-8 bg-red-600 hover:bg-red-700 gap-3 flex-1 min-w-[180px]"
          >
            <ArrowDownRight className="w-5 h-5" />
            <span className="text-lg">Nova Saída</span>
          </Button>
        </div>

        {/* Transactions Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="region" aria-label="Listas de entradas e saídas">
          {/* Income */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 text-lg" id="heading-entradas">Entradas</h2>
              <span className="text-sm text-slate-500" aria-live="polite">{incomeTransactions.length} registros</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto" role="list" aria-labelledby="heading-entradas">
              {incomeTransactions.length === 0 && (
                <div role="status" aria-live="polite" className="text-sm text-slate-500 px-1">Nenhuma entrada no período</div>
              )}
              {incomeTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  role="listitem"
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 focus-within:ring-2 ring-offset-2 ring-slate-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                      <ArrowUpRight className="w-6 h-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-500">
                        {transaction.category} • {transaction.date} às {transaction.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl text-green-600">
                    + {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Expenses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 text-lg" id="heading-saidas">Saídas</h2>
              <span className="text-sm text-slate-500" aria-live="polite">{expenseTransactions.length} registros</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto" role="list" aria-labelledby="heading-saidas">
              {expenseTransactions.length === 0 && (
                <div role="status" aria-live="polite" className="text-sm text-slate-500 px-1">Nenhuma saída no período</div>
              )}
              {expenseTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  role="listitem"
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 focus-within:ring-2 ring-offset-2 ring-slate-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
                      <ArrowDownRight className="w-6 h-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-500">
                        {transaction.category} • {transaction.date} às {transaction.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl text-red-600">
                    - {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <NewTransactionDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        type="income"
        onAddTransaction={handleAddTransactionLocal}
      />

      <NewTransactionDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        type="expense"
        onAddTransaction={handleAddTransactionLocal}
      />
    </main>
  );
}