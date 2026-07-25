'use client'

import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useFinanceControladoria, CHANNEL_LABELS } from '@/hooks/useFinanceControladoria';
import { formatCurrency } from '@/utils/format';
import { ChevronLeft, ChevronRight, Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function currentMonthYear() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonthYear(my: string, delta: number): string {
  const year = parseInt(my.slice(0, 4));
  const month = parseInt(my.slice(4, 6)) - 1;
  const d = new Date(year, month + delta, 1);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthYearLabel(my: string): string {
  const month = parseInt(my.slice(4, 6)) - 1;
  const year = my.slice(0, 4);
  return `${MONTH_LABELS[month]} de ${year}`;
}

function monthYearOf(dateStr: string): string {
  return dateStr.slice(0, 7).replace('-', '');
}

const EXPENSE_CATEGORIES_FIXED = [
  'Salários dos funcionários (com encargos)',
  'Energia elétrica',
  'Água',
  'Internet/telefonia',
  'Manutenção básica',
  'Seguros',
  'Impostos e taxas fixas',
  'Outros fixos',
];
const EXPENSE_CATEGORIES_VARIABLE = [
  'Diaristas',
  'Alimentação e Insumos',
  'Material de Limpeza',
  'Manutenção extra',
];

type LedgerEntry = {
  id: string;
  date: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  detail: string;
};

export function CashFlow() {
  const [monthYear, setMonthYear] = useState(currentMonthYear());
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseType, setExpenseType] = useState<'fixo' | 'variavel'>('fixo');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const {
    loading,
    revenueEntries,
    currentMonth,
    cashFlow,
    addExpense,
    deleteExpense,
  } = useFinanceControladoria(monthYear);

  const ledger = useMemo<LedgerEntry[]>(() => {
    const entradas: LedgerEntry[] = revenueEntries
      .filter(r => monthYearOf(r.event_date) === monthYear)
      .map(r => ({
        id: `rev-${r.id}`,
        date: r.event_date,
        description: r.description,
        type: 'entrada' as const,
        amount: r.total_value,
        detail: CHANNEL_LABELS[r.channel],
      }));
    const saidas: LedgerEntry[] = currentMonth.monthExpenses.map(e => ({
      id: `exp-${e.id}`,
      date: `${monthYear.slice(0, 4)}-${monthYear.slice(4, 6)}-01`,
      description: e.category,
      type: 'saida' as const,
      amount: e.amount,
      detail: e.expense_type === 'fixo' ? 'Despesa Fixa' : 'Despesa Variável',
    }));
    return [...entradas, ...saidas].sort((a, b) => b.date.localeCompare(a.date));
  }, [revenueEntries, currentMonth.monthExpenses, monthYear]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!expenseCategory || isNaN(amount) || amount <= 0) return;
    await addExpense({ month_year: monthYear, category: expenseCategory, expense_type: expenseType, amount });
    setShowAddExpense(false);
    setExpenseCategory('');
    setExpenseAmount('');
  };

  const handleDelete = async (entry: LedgerEntry) => {
    if (entry.type !== 'saida') return; // entradas vêm do Faturamento por Canal / Agenda, não são editáveis aqui
    const expenseId = entry.id.replace('exp-', '');
    await deleteExpense(expenseId);
  };

  if (loading && revenueEntries.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <p className="text-slate-500">Carregando fluxo de caixa...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Fluxo de Caixa</h1>
            <p className="text-slate-600 text-sm">
              Extrato único de entradas (Faturamento por Canal) e saídas (Despesas) — mesmos dados da Controladoria Financeira.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setMonthYear(m => shiftMonthYear(m, -1))}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-medium text-slate-900 min-w-[130px] text-center capitalize">
                {formatMonthYearLabel(monthYear)}
              </span>
              <button
                onClick={() => setMonthYear(m => shiftMonthYear(m, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={() => setShowAddExpense(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Saída
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Entradas do Mês</p>
                <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(cashFlow.received)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Saídas do Mês</p>
                <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(cashFlow.spent)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cashFlow.monthResult >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Sobra/Falta do Mês</p>
                <p className={`text-lg font-bold truncate ${cashFlow.monthResult >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(cashFlow.monthResult)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Saldo Acumulado</p>
                <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(cashFlow.accumulatedBalance)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Extrato do Mês</h2>
          {ledger.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Nenhuma movimentação neste mês.</p>
          ) : (
            <div className="space-y-1.5">
              {ledger.map(entry => (
                <div key={entry.id} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${entry.type === 'entrada' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {entry.type === 'entrada' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{entry.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')} · {entry.detail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-semibold ${entry.type === 'entrada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {entry.type === 'entrada' ? '+' : '-'} {formatCurrency(entry.amount)}
                    </span>
                    {entry.type === 'saida' && (
                      <button
                        onClick={() => handleDelete(entry)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        aria-label={`Remover ${entry.description}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Saída</DialogTitle>
            <DialogDescription>Lance uma despesa fixa ou variável para {formatMonthYearLabel(monthYear)}. Aparece também na Controladoria Financeira.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={expenseType} onValueChange={(v: any) => { setExpenseType(v); setExpenseCategory(''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Custo Fixo</SelectItem>
                  <SelectItem value="variavel">Custo Variável</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                list="cashflow-category-suggestions"
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value)}
                placeholder="Selecione ou digite uma categoria"
              />
              <datalist id="cashflow-category-suggestions">
                {(expenseType === 'fixo' ? EXPENSE_CATEGORIES_FIXED : EXPENSE_CATEGORIES_VARIABLE).map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" min="0" step="0.01" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="0,00" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddExpense(false)}>Cancelar</Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
