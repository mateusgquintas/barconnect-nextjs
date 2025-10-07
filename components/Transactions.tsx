'use client'
import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { NewTransactionDialog } from './NewTransactionDialog';
import { Transaction } from '@/types';

interface TransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'time'>) => void;
}

export function Transactions({ transactions, onAddTransaction }: TransactionsProps) {

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  // Filtros de busca e data
  const [search, setSearch] = useState('');
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

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
  const filteredTransactions = transactions.filter(t => {
    const [day, month, year] = t.date.split('/');
    const transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const matchesDate = transactionDate >= start && transactionDate <= end;
    const matchesSearch = !search.trim() ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8">
        {/* Header with Date Filter and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-slate-900 mb-2">Financeiro</h1>
            <p className="text-slate-600">Controle de entradas e saídas do hotel</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
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
            <Input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 h-9 text-sm"
              aria-label="Buscar transação"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-600 text-sm">Entradas</h3>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl text-green-600">R$ {totalIncome.toFixed(2)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-600 text-sm">Saídas</h3>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl text-red-600">R$ {totalExpense.toFixed(2)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-600 text-sm">Saldo</h3>
              <div className={`w-10 h-10 ${balance >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
                <span className="text-white">R$</span>
              </div>
            </div>
            <p className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '' : '- '}R$ {Math.abs(balance).toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => setShowIncomeDialog(true)}
            className="h-14 px-8 bg-green-600 hover:bg-green-700 gap-3 flex-1"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-lg">Nova Entrada</span>
          </Button>
          <Button 
            onClick={() => setShowExpenseDialog(true)}
            className="h-14 px-8 bg-red-600 hover:bg-red-700 gap-3 flex-1"
          >
            <ArrowDownRight className="w-5 h-5" />
            <span className="text-lg">Nova Saída</span>
          </Button>
        </div>

        {/* Transactions Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900">Entradas</h2>
              <span className="text-sm text-slate-500">{incomeTransactions.length} registros</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {incomeTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                      <ArrowUpRight className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-500">
                        {transaction.category} • {transaction.date} às {transaction.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl text-green-600">
                    + R$ {transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Expenses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900">Saídas</h2>
              <span className="text-sm text-slate-500">{expenseTransactions.length} registros</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {expenseTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
                      <ArrowDownRight className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-500">
                        {transaction.category} • {transaction.date} às {transaction.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl text-red-600">
                    - R$ {transaction.amount.toFixed(2)}
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
    </div>
  );
}