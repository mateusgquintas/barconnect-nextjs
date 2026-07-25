'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type AcquisitionChannel = 'agenciador' | 'booking' | 'motorista' | 'chefe_romaria' | 'direto';

export const CHANNEL_LABELS: Record<AcquisitionChannel, string> = {
  agenciador: 'Agenciador',
  booking: 'Booking',
  motorista: 'Indicação - Motorista de Ônibus',
  chefe_romaria: 'Indicação - Chefe de Romaria',
  direto: 'Direto',
};

export interface FinanceSettings {
  avg_daily_rate: number;
  avg_breakfast_cost: number;
  avg_lunch_cost: number;
  avg_dinner_cost: number;
  booking_commission_pct: number;
  agenciador_commission_pct: number;
  agenciador_people_per_courtesy: number;
  motorista_courtesy_people: number;
  chefe_romaria_courtesy_people: number;
  initial_cash_balance: number;
  rooms_available: number;
}

export interface RevenueEntry {
  id: string;
  event_date: string;
  description: string;
  channel: AcquisitionChannel;
  total_value: number;
  number_of_people: number | null;
  number_of_buses: number | null;
  source: 'manual' | 'reservation';
  reservation_id: string | null;
}

export interface MonthlyKpiInput {
  turnover_employees_left: number;
  turnover_avg_salary: number;
  turnover_pct: number;
  nps_promoters: number;
  nps_neutrals: number;
  nps_detractors: number;
}

interface ExpenseRow {
  id: string;
  month_year: string;
  category: string;
  expense_type: 'fixo' | 'variavel';
  amount: number;
}

function monthYearOf(dateStr: string): string {
  // dateStr pode ser 'YYYY-MM-DD' ou um ISO datetime completo
  const d = dateStr.slice(0, 7).replace('-', '');
  return d;
}

export function useFinanceControladoria(monthYear: string) {
  const [settings, setSettings] = useState<FinanceSettings | null>(null);
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [monthlyKpi, setMonthlyKpi] = useState<MonthlyKpiInput>({
    turnover_employees_left: 0,
    turnover_avg_salary: 0,
    turnover_pct: 100,
    nps_promoters: 0,
    nps_neutrals: 0,
    nps_detractors: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, revenueRes, expensesRes, kpiRes] = await Promise.all([
        supabase.from('finance_settings').select('*').eq('id', 1).single(),
        supabase
          .from('finance_channel_revenue')
          .select('id, event_date, description, channel, total_value, number_of_people, number_of_buses, source, reservation_id'),
        supabase.from('finance_expenses').select('id, month_year, category, expense_type, amount'),
        supabase.from('finance_monthly_kpis').select('*').eq('month_year', monthYear).maybeSingle(),
      ]);

      if (settingsRes.data) setSettings(settingsRes.data as FinanceSettings);
      if (revenueRes.data) setRevenueEntries(revenueRes.data as RevenueEntry[]);
      if (expensesRes.data) setExpenses(expensesRes.data as ExpenseRow[]);
      setMonthlyKpi({
        turnover_employees_left: kpiRes.data?.turnover_employees_left ?? 0,
        turnover_avg_salary: kpiRes.data?.turnover_avg_salary ?? 0,
        turnover_pct: kpiRes.data?.turnover_pct ?? 100,
        nps_promoters: kpiRes.data?.nps_promoters ?? 0,
        nps_neutrals: kpiRes.data?.nps_neutrals ?? 0,
        nps_detractors: kpiRes.data?.nps_detractors ?? 0,
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados financeiros:', error?.message || error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthYear]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateSettings = async (updates: Partial<FinanceSettings>) => {
    try {
      const { error } = await supabase.from('finance_settings').update(updates).eq('id', 1);
      if (error) throw error;
      toast.success('Configurações atualizadas!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error?.message || error);
      toast.error('Erro ao atualizar configurações');
    }
  };

  const addExpense = async (expense: { month_year: string; category: string; expense_type: 'fixo' | 'variavel'; amount: number }) => {
    try {
      const { error } = await supabase.from('finance_expenses').insert([expense]);
      if (error) throw error;
      toast.success('Despesa adicionada!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao adicionar despesa:', error?.message || error);
      toast.error('Erro ao adicionar despesa');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('finance_expenses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Despesa removida!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao remover despesa:', error?.message || error);
      toast.error('Erro ao remover despesa');
    }
  };

  const addRevenueEntry = async (entry: {
    event_date: string;
    description: string;
    channel: AcquisitionChannel;
    total_value: number;
    number_of_people?: number | null;
    number_of_buses?: number | null;
  }) => {
    try {
      const { error } = await supabase.from('finance_channel_revenue').insert([{ ...entry, source: 'manual' }]);
      if (error) throw error;
      toast.success('Faturamento adicionado!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao adicionar faturamento:', error?.message || error);
      toast.error('Erro ao adicionar faturamento');
    }
  };

  const updateRevenueEntry = async (id: string, updates: Partial<{
    event_date: string;
    description: string;
    channel: AcquisitionChannel;
    total_value: number;
    number_of_people: number | null;
    number_of_buses: number | null;
  }>) => {
    try {
      const { error } = await supabase.from('finance_channel_revenue').update(updates).eq('id', id);
      if (error) throw error;
      toast.success('Faturamento atualizado!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao atualizar faturamento:', error?.message || error);
      toast.error('Erro ao atualizar faturamento');
    }
  };

  const deleteRevenueEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('finance_channel_revenue').delete().eq('id', id);
      if (error) throw error;
      toast.success('Faturamento removido!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao remover faturamento:', error?.message || error);
      toast.error('Erro ao remover faturamento');
    }
  };

  const updateMonthlyKpi = async (updates: Partial<MonthlyKpiInput>) => {
    try {
      const merged = { ...monthlyKpi, ...updates };
      const { error } = await supabase
        .from('finance_monthly_kpis')
        .upsert([{ month_year: monthYear, ...merged, updated_at: new Date().toISOString() }], { onConflict: 'month_year' });
      if (error) throw error;
      toast.success('Indicadores atualizados!');
      await fetchAll();
    } catch (error: any) {
      console.error('Erro ao atualizar indicadores:', error?.message || error);
      toast.error('Erro ao atualizar indicadores');
    }
  };

  // ------- Cálculos -------

  const unitCourtesyCost = useMemo(() => {
    if (!settings) return 0;
    return settings.avg_daily_rate + settings.avg_breakfast_cost + settings.avg_lunch_cost + settings.avg_dinner_cost;
  }, [settings]);

  const computeMonth = useCallback((my: string, allRevenue: RevenueEntry[], allExpenses: ExpenseRow[]) => {
    const monthRevenue = allRevenue.filter(r => monthYearOf(r.event_date) === my);

    const revenueByChannel: Record<AcquisitionChannel, number> = {
      agenciador: 0, booking: 0, motorista: 0, chefe_romaria: 0, direto: 0,
    };
    const peopleByChannel: Record<AcquisitionChannel, number> = {
      agenciador: 0, booking: 0, motorista: 0, chefe_romaria: 0, direto: 0,
    };
    // Cada linha de faturamento por canal representa 1 evento
    const eventCountByChannel: Record<AcquisitionChannel, number> = {
      agenciador: 0, booking: 0, motorista: 0, chefe_romaria: 0, direto: 0,
    };

    monthRevenue.forEach(r => {
      const ch = (r.channel || 'direto') as AcquisitionChannel;
      revenueByChannel[ch] = (revenueByChannel[ch] || 0) + (r.total_value || 0);
      peopleByChannel[ch] = (peopleByChannel[ch] || 0) + (r.number_of_people || 0);
      eventCountByChannel[ch] = (eventCountByChannel[ch] || 0) + 1;
    });

    const grossRevenue = Object.values(revenueByChannel).reduce((s, v) => s + v, 0);

    const bookingCommission = revenueByChannel.booking * (settings?.booking_commission_pct || 0);
    const agenciadorCommission = revenueByChannel.agenciador * (settings?.agenciador_commission_pct || 0);
    const agenciadorPeople = peopleByChannel.agenciador;
    const agenciadorCourtesyUnits = settings?.agenciador_people_per_courtesy
      ? Math.floor(agenciadorPeople / settings.agenciador_people_per_courtesy)
      : 0;
    const agenciadorCourtesyCost = agenciadorCourtesyUnits * unitCourtesyCost;

    const motoristaEventCount = eventCountByChannel.motorista;
    const motoristaCourtesyCost = motoristaEventCount * (settings?.motorista_courtesy_people || 0) * unitCourtesyCost;

    const chefeEventCount = eventCountByChannel.chefe_romaria;
    const chefeCourtesyCost = chefeEventCount * (settings?.chefe_romaria_courtesy_people || 0) * unitCourtesyCost;

    const channelCost = bookingCommission + agenciadorCommission + agenciadorCourtesyCost + motoristaCourtesyCost + chefeCourtesyCost;
    const netRevenue = grossRevenue - channelCost;

    const totalEvents = Object.values(eventCountByChannel).reduce((s, v) => s + v, 0);

    // Despesas do mês
    const monthExpenses = allExpenses.filter(e => e.month_year === my);
    const totalFixed = monthExpenses.filter(e => e.expense_type === 'fixo').reduce((s, e) => s + e.amount, 0);
    const totalVariableOwn = monthExpenses.filter(e => e.expense_type === 'variavel').reduce((s, e) => s + e.amount, 0);
    // Segue o modelo da planilha: custo de canal também compõe o total de despesas variáveis
    const totalVariable = totalVariableOwn + channelCost;
    const totalExpenses = totalFixed + totalVariable;

    return {
      monthYear: my,
      revenueByChannel,
      peopleByChannel,
      eventCountByChannel,
      grossRevenue,
      bookingCommission,
      agenciadorCommission,
      agenciadorPeople,
      agenciadorCourtesyCost,
      motoristaEventCount,
      motoristaCourtesyCost,
      chefeEventCount,
      chefeCourtesyCost,
      channelCost,
      netRevenue,
      totalEvents,
      totalFixed,
      totalVariableOwn,
      totalVariable,
      totalExpenses,
      monthExpenses,
    };
  }, [settings, unitCourtesyCost]);

  const currentMonth = useMemo(() => computeMonth(monthYear, revenueEntries, expenses), [computeMonth, monthYear, revenueEntries, expenses]);

  // Fluxo de caixa acumulado: soma todos os meses <= monthYear que têm dado
  const cashFlow = useMemo(() => {
    const allMonthKeys = new Set<string>();
    revenueEntries.forEach(r => allMonthKeys.add(monthYearOf(r.event_date)));
    expenses.forEach(e => allMonthKeys.add(e.month_year));
    allMonthKeys.add(monthYear);

    const sortedMonths = Array.from(allMonthKeys).filter(m => m <= monthYear).sort();
    let accumulated = settings?.initial_cash_balance || 0;
    let monthResult = 0;
    let received = 0;
    let spent = 0;
    for (const m of sortedMonths) {
      const data = computeMonth(m, revenueEntries, expenses);
      const r = data.netRevenue;
      const s = data.totalExpenses;
      accumulated += (r - s);
      if (m === monthYear) {
        monthResult = r - s;
        received = r;
        spent = s;
      }
    }
    return { received, spent, monthResult, accumulatedBalance: accumulated };
  }, [revenueEntries, expenses, settings, monthYear, computeMonth]);

  // KPIs
  const kpis = useMemo(() => {
    const roomsAvailable = settings?.rooms_available || 0;
    const revPAR = roomsAvailable > 0 ? currentMonth.grossRevenue / roomsAvailable : 0;
    const avgTicket = currentMonth.totalEvents > 0 ? currentMonth.grossRevenue / currentMonth.totalEvents : 0;
    const occupancyPctByChannel: Record<AcquisitionChannel, number> = {
      agenciador: 0, booking: 0, motorista: 0, chefe_romaria: 0, direto: 0,
    };
    (Object.keys(occupancyPctByChannel) as AcquisitionChannel[]).forEach(ch => {
      occupancyPctByChannel[ch] = currentMonth.totalEvents > 0
        ? (currentMonth.eventCountByChannel[ch] / currentMonth.totalEvents) * 100
        : 0;
    });
    const turnoverCost = monthlyKpi.turnover_employees_left * monthlyKpi.turnover_avg_salary * (monthlyKpi.turnover_pct / 100);
    const npsTotal = monthlyKpi.nps_promoters + monthlyKpi.nps_neutrals + monthlyKpi.nps_detractors;
    const nps = npsTotal > 0
      ? ((monthlyKpi.nps_promoters / npsTotal) - (monthlyKpi.nps_detractors / npsTotal)) * 100
      : 0;

    return { revPAR, avgTicket, occupancyPctByChannel, turnoverCost, nps, npsTotal, roomsAvailable };
  }, [settings, currentMonth, monthlyKpi]);

  return {
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
    revenueEntries,
    addRevenueEntry,
    updateRevenueEntry,
    deleteRevenueEntry,
    unitCourtesyCost,
    refetch: fetchAll,
  };
}
