'use client'

import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { useFinancialReports } from '@/hooks/useFinancialReports';
import { formatCurrency } from '@/utils/format';
import { PAYMENT_METHOD_NAMES } from '@/utils/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { TrendingUp, TrendingDown, CalendarDays, CreditCard, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const PAYMENT_COLORS: Record<string, string> = {
  cash: '#10b981',
  credit: '#3b82f6',
  debit: '#6366f1',
  pix: '#06b6d4',
  courtesy: '#94a3b8',
  outro: '#f59e0b',
};

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

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
function formatMonthYearLabel(my: string): string {
  const month = parseInt(my.slice(4, 6)) - 1;
  const year = my.slice(0, 4);
  return `${MONTH_LABELS[month]} de ${year}`;
}

export function FinancialReports() {
  const [monthYear, setMonthYear] = useState(currentMonthYear());
  const { loading, dailyRevenueForMonth, paymentMethodBreakdown, monthlyTotals, seasonality } = useFinancialReports();

  const dailyData = useMemo(() => dailyRevenueForMonth(monthYear), [dailyRevenueForMonth, monthYear]);
  const monthTotal = useMemo(() => dailyData.reduce((s, d) => s + d.total, 0), [dailyData]);
  const paymentTotal = useMemo(() => paymentMethodBreakdown.reduce((s, p) => s + p.total, 0), [paymentMethodBreakdown]);

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <p className="text-slate-500">Carregando relatórios financeiros...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-slate-500" />
            Gráficos e Relatórios Financeiros
          </h1>
          <p className="text-slate-600 text-sm">
            Receita diária, formas de pagamento, rendimento mensal e sazonalidade — combinando vendas do bar/PDV e faturamento de hospedagem.
          </p>
        </div>

        {/* Receita diária */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              Receita Diária
            </h2>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button onClick={() => setMonthYear(m => shiftMonthYear(m, -1))} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-medium text-slate-900 min-w-[110px] text-center capitalize">{formatMonthYearLabel(monthYear)}</span>
              <button onClick={() => setMonthYear(m => shiftMonthYear(m, 1))} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-3">Total do mês: <strong className="text-slate-900">{formatCurrency(monthTotal)}</strong></p>
          {monthTotal === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Nenhuma receita lançada em {formatMonthYearLabel(monthYear)}.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name === 'barTotal' ? 'Bar/PDV' : 'Hospedagem']} labelFormatter={(d) => `Dia ${d}`} />
                <Bar dataKey="barTotal" stackId="a" fill="#3b82f6" name="Bar/PDV" />
                <Bar dataKey="hospedagemTotal" stackId="a" fill="#10b981" name="Hospedagem" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forma de pagamento */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Detalhamento por Forma de Pagamento
            </h2>
            {paymentMethodBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">Sem vendas do bar/PDV registradas ainda.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={paymentMethodBreakdown} dataKey="total" nameKey="method" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {paymentMethodBreakdown.map((entry) => (
                        <Cell key={entry.method} fill={PAYMENT_COLORS[entry.method] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {paymentMethodBreakdown.map(p => (
                    <div key={p.method} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[p.method] || '#94a3b8' }} />
                        {PAYMENT_METHOD_NAMES[p.method as keyof typeof PAYMENT_METHOD_NAMES] || p.method}
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(p.total)} <span className="text-xs text-slate-400">({paymentTotal > 0 ? Math.round((p.total / paymentTotal) * 100) : 0}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <p className="text-xs text-slate-400 mt-3">Baseado nas vendas do bar/PDV (a receita de hospedagem ainda não registra forma de pagamento).</p>
          </Card>

          {/* Sazonalidade */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              Sazonalidade (últimos 12 meses)
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-700 flex items-center gap-1 mb-1"><TrendingUp className="w-3.5 h-3.5" />Mês de maior movimento</p>
                <p className="text-sm font-semibold text-emerald-900">
                  {seasonality.peak ? `${seasonality.peak.label} — ${formatCurrency(seasonality.peak.total)}` : '—'}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg">
                <p className="text-xs text-rose-700 flex items-center gap-1 mb-1"><TrendingDown className="w-3.5 h-3.5" />Mês de menor movimento</p>
                <p className="text-sm font-semibold text-rose-900">
                  {seasonality.low ? `${seasonality.low.label} — ${formatCurrency(seasonality.low.total)}` : '—'}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyTotals} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Receita" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Rendimento consolidado por mês */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Rendimento Consolidado por Mês
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyTotals} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name === 'barTotal' ? 'Bar/PDV' : 'Hospedagem']} />
              <Bar dataKey="barTotal" stackId="a" fill="#3b82f6" name="Bar/PDV" />
              <Bar dataKey="hospedagemTotal" stackId="a" fill="#10b981" name="Hospedagem" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </main>
  );
}
