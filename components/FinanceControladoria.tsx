'use client'

import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import {
  useFinanceControladoria,
  CHANNEL_LABELS,
  AcquisitionChannel,
} from '@/hooks/useFinanceControladoria';
import { formatCurrency } from '@/utils/format';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  Ticket,
  BedDouble,
  Smile,
  UserMinus,
} from 'lucide-react';

const CHANNEL_COLORS: Record<AcquisitionChannel, string> = {
  agenciador: 'bg-purple-500',
  booking: 'bg-blue-500',
  motorista: 'bg-amber-500',
  chefe_romaria: 'bg-emerald-500',
  direto: 'bg-slate-500',
};

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

export function FinanceControladoria() {
  const [monthYear, setMonthYear] = useState(currentMonthYear());
  const [showSettings, setShowSettings] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseType, setExpenseType] = useState<'fixo' | 'variavel'>('fixo');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const {
    loading,
    settings,
    updateSettings,
    currentMonth,
    cashFlow,
    kpis,
    monthlyKpi,
    updateMonthlyKpi,
    addExpense,
    deleteExpense,
    unitCourtesyCost,
  } = useFinanceControladoria(monthYear);

  const channels: AcquisitionChannel[] = ['agenciador', 'booking', 'motorista', 'chefe_romaria', 'direto'];

  const maxChannelRevenue = useMemo(
    () => Math.max(1, ...channels.map(ch => currentMonth.revenueByChannel[ch])),
    [currentMonth, channels]
  );

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!expenseCategory || isNaN(amount) || amount <= 0) return;
    await addExpense({ month_year: monthYear, category: expenseCategory, expense_type: expenseType, amount });
    setShowAddExpense(false);
    setExpenseCategory('');
    setExpenseAmount('');
  };

  if (loading && !settings) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <p className="text-slate-500">Carregando controladoria financeira...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Controladoria Financeira</h1>
            <p className="text-slate-600 text-sm">Faturamento por canal, despesas, fluxo de caixa e indicadores.</p>
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
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="gap-2">
              <Settings className="w-4 h-4" />
              Parâmetros de Canal
            </Button>
          </div>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Receita Bruta</p>
                <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(currentMonth.grossRevenue)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Custo de Canal</p>
                <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(currentMonth.channelCost)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Receita Líquida</p>
                <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(currentMonth.netRevenue)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Total de Despesas</p>
                <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(currentMonth.totalExpenses)}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faturamento por canal */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Faturamento Bruto por Canal</h2>
            <div className="space-y-3">
              {channels.map(ch => (
                <div key={ch}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700">{CHANNEL_LABELS[ch]}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(currentMonth.revenueByChannel[ch])}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${CHANNEL_COLORS[ch]} rounded-full transition-all`}
                      style={{ width: `${(currentMonth.revenueByChannel[ch] / maxChannelRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Comissão Booking</p>
                <p className="font-semibold text-slate-900">{formatCurrency(currentMonth.bookingCommission)}</p>
              </div>
              <div>
                <p className="text-slate-500">Comissão Agenciador</p>
                <p className="font-semibold text-slate-900">{formatCurrency(currentMonth.agenciadorCommission)}</p>
              </div>
              <div>
                <p className="text-slate-500">Cortesia Agenciador</p>
                <p className="font-semibold text-slate-900">{formatCurrency(currentMonth.agenciadorCourtesyCost)}</p>
              </div>
              <div>
                <p className="text-slate-500">Cortesia Motorista + Chefe</p>
                <p className="font-semibold text-slate-900">{formatCurrency(currentMonth.motoristaCourtesyCost + currentMonth.chefeCourtesyCost)}</p>
              </div>
            </div>
          </Card>

          {/* Despesas */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Despesas do Mês</h2>
              <Button size="sm" onClick={() => setShowAddExpense(true)} className="gap-1">
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm mb-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-slate-500">Fixas: </span>
                <span className="font-semibold text-slate-900">{formatCurrency(currentMonth.totalFixed)}</span>
              </div>
              <div>
                <span className="text-slate-500">Variáveis (com canal): </span>
                <span className="font-semibold text-slate-900">{formatCurrency(currentMonth.totalVariable)}</span>
              </div>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {currentMonth.monthExpenses.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Nenhuma despesa lançada neste mês.</p>
              )}
              {currentMonth.monthExpenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{exp.category}</p>
                    <p className="text-xs text-slate-500">{exp.expense_type === 'fixo' ? 'Fixa' : 'Variável'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(exp.amount)}</span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      aria-label={`Remover ${exp.category}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* KPIs */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Painel de Indicadores (KPIs)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <BedDouble className="w-4 h-4" />
                <span className="text-xs font-medium">RevPAR</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(kpis.revPAR)}</p>
              <p className="text-xs text-slate-500">{kpis.roomsAvailable} quartos disponíveis</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Ticket className="w-4 h-4" />
                <span className="text-xs font-medium">Ticket Médio</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(kpis.avgTicket)}</p>
              <p className="text-xs text-slate-500">{currentMonth.totalEvents} reserva(s) confirmada(s)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Smile className="w-4 h-4" />
                <span className="text-xs font-medium">NPS</span>
              </div>
              <p className={`text-xl font-bold ${kpis.nps >= 50 ? 'text-green-600' : kpis.nps >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                {kpis.npsTotal > 0 ? kpis.nps.toFixed(0) : '—'}
              </p>
              <p className="text-xs text-slate-500">{kpis.npsTotal} resposta(s)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <UserMinus className="w-4 h-4" />
                <span className="text-xs font-medium">Custo de Turnover</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(kpis.turnoverCost)}</p>
              <p className="text-xs text-slate-500">{monthlyKpi.turnover_employees_left} saída(s)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ocupação por canal */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Ocupação por Canal (% das reservas)
              </h3>
              <div className="space-y-2">
                {channels.map(ch => (
                  <div key={ch} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{CHANNEL_LABELS[ch]}</span>
                    <span className="font-medium text-slate-900">{kpis.occupancyPctByChannel[ch].toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs manuais: Turnover + NPS */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Turnover (entrada manual)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Funcionários que saíram</Label>
                    <Input
                      type="number" min="0" className="h-8 text-sm"
                      value={monthlyKpi.turnover_employees_left}
                      onChange={e => updateMonthlyKpi({ turnover_employees_left: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Salário anual médio (R$)</Label>
                    <Input
                      type="number" min="0" className="h-8 text-sm"
                      value={monthlyKpi.turnover_avg_salary}
                      onChange={e => updateMonthlyKpi({ turnover_avg_salary: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">NPS (entrada manual)</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Promotoras (9-10)</Label>
                    <Input
                      type="number" min="0" className="h-8 text-sm"
                      value={monthlyKpi.nps_promoters}
                      onChange={e => updateMonthlyKpi({ nps_promoters: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Neutras (7-8)</Label>
                    <Input
                      type="number" min="0" className="h-8 text-sm"
                      value={monthlyKpi.nps_neutrals}
                      onChange={e => updateMonthlyKpi({ nps_neutrals: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Detratoras (0-6)</Label>
                    <Input
                      type="number" min="0" className="h-8 text-sm"
                      value={monthlyKpi.nps_detractors}
                      onChange={e => updateMonthlyKpi({ nps_detractors: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Dialog: Adicionar despesa */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>Lance uma despesa fixa ou variável para {formatMonthYearLabel(monthYear)}.</DialogDescription>
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
                list="expense-category-suggestions"
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value)}
                placeholder="Selecione ou digite uma categoria"
              />
              <datalist id="expense-category-suggestions">
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

      {/* Dialog: Parâmetros de canal */}
      {settings && (
        <ChannelSettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          settings={settings}
          unitCourtesyCost={unitCourtesyCost}
          onSave={updateSettings}
        />
      )}
    </main>
  );
}

function ChannelSettingsDialog({
  open,
  onOpenChange,
  settings,
  unitCourtesyCost,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  settings: import('@/hooks/useFinanceControladoria').FinanceSettings;
  unitCourtesyCost: number;
  onSave: (updates: Partial<import('@/hooks/useFinanceControladoria').FinanceSettings>) => Promise<void>;
}) {
  const [form, setForm] = useState(settings);

  const set = (field: keyof typeof form, value: number) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setForm(settings); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parâmetros de Custo por Canal</DialogTitle>
          <DialogDescription>Usados para calcular comissões e cortesias automaticamente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Parâmetros gerais (cortesia)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor médio da diária (R$)</Label>
                <Input type="number" min="0" step="0.01" value={form.avg_daily_rate} onChange={e => set('avg_daily_rate', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Nº de quartos disponíveis</Label>
                <Input type="number" min="0" value={form.rooms_available} onChange={e => set('rooms_available', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Café da manhã / pessoa (R$)</Label>
                <Input type="number" min="0" step="0.01" value={form.avg_breakfast_cost} onChange={e => set('avg_breakfast_cost', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Almoço / pessoa (R$)</Label>
                <Input type="number" min="0" step="0.01" value={form.avg_lunch_cost} onChange={e => set('avg_lunch_cost', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Jantar / pessoa (R$)</Label>
                <Input type="number" min="0" step="0.01" value={form.avg_dinner_cost} onChange={e => set('avg_dinner_cost', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Caixa inicial (R$)</Label>
                <Input type="number" step="0.01" value={form.initial_cash_balance} onChange={e => set('initial_cash_balance', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Custo unitário de 1 cortesia (diária + 3 refeições): <strong>{formatCurrency(unitCourtesyCost)}</strong></p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Booking</h3>
            <Label className="text-xs">% de Comissão</Label>
            <Input
              type="number" min="0" max="100" step="0.1"
              value={(form.booking_commission_pct * 100).toFixed(1)}
              onChange={e => set('booking_commission_pct', (parseFloat(e.target.value) || 0) / 100)}
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Agenciador</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">% de Comissão</Label>
                <Input
                  type="number" min="0" max="100" step="0.1"
                  value={(form.agenciador_commission_pct * 100).toFixed(1)}
                  onChange={e => set('agenciador_commission_pct', (parseFloat(e.target.value) || 0) / 100)}
                />
              </div>
              <div>
                <Label className="text-xs">Nº pessoas pagas por 1 cortesia</Label>
                <Input type="number" min="1" value={form.agenciador_people_per_courtesy} onChange={e => set('agenciador_people_per_courtesy', parseInt(e.target.value) || 1)} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Indicação - Motorista de Ônibus</h3>
            <Label className="text-xs">Nº de pessoas cortesia por romaria</Label>
            <Input type="number" min="0" value={form.motorista_courtesy_people} onChange={e => set('motorista_courtesy_people', parseInt(e.target.value) || 0)} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Indicação - Chefe de Romaria</h3>
            <Label className="text-xs">Nº de pessoas cortesia por romaria</Label>
            <Input type="number" min="0" value={form.chefe_romaria_courtesy_people} onChange={e => set('chefe_romaria_courtesy_people', parseInt(e.target.value) || 0)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar Parâmetros</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
