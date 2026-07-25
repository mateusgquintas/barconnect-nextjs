'use client'

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getLocalDateStr } from '@/utils/agenda';

interface SaleRow {
  id: string;
  total: number;
  payment_method: string | null;
  is_courtesy: boolean;
  created_at: string;
}

interface RevenueRow {
  id: string;
  event_date: string;
  total_value: number;
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function monthKeyOf(dateStr: string) {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function useFinancialReports() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [revenueEntries, setRevenueEntries] = useState<RevenueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const sinceISO = twelveMonthsAgo.toISOString();
        const sinceDateStr = getLocalDateStr(twelveMonthsAgo);

        const [salesRes, revenueRes] = await Promise.all([
          supabase.from('sales').select('id, total, payment_method, is_courtesy, created_at').gte('created_at', sinceISO),
          supabase.from('finance_channel_revenue').select('id, event_date, total_value').gte('event_date', sinceDateStr),
        ]);

        if (salesRes.data) setSales(salesRes.data as SaleRow[]);
        if (revenueRes.data) setRevenueEntries(revenueRes.data as RevenueRow[]);
      } catch (error) {
        console.error('Erro ao carregar relatórios financeiros:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Vendas do bar/PDV que efetivamente geraram receita (cortesias não contam)
  const paidSales = useMemo(() => sales.filter(s => !s.is_courtesy), [sales]);

  const dailyRevenueForMonth = (monthYear: string) => {
    const year = parseInt(monthYear.slice(0, 4));
    const month = parseInt(monthYear.slice(4, 6));
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return days.map(day => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const barTotal = paidSales
        .filter(s => s.created_at.slice(0, 10) === dateStr)
        .reduce((sum, s) => sum + (s.total || 0), 0);
      const hospedagemTotal = revenueEntries
        .filter(r => r.event_date === dateStr)
        .reduce((sum, r) => sum + (r.total_value || 0), 0);
      return { day, dateStr, barTotal, hospedagemTotal, total: barTotal + hospedagemTotal };
    });
  };

  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    paidSales.forEach(s => {
      const method = s.payment_method || 'outro';
      map[method] = (map[method] || 0) + (s.total || 0);
    });
    return Object.entries(map).map(([method, total]) => ({ method, total }));
  }, [paidSales]);

  const monthlyTotals = useMemo(() => {
    const months: string[] = [];
    const cursor = new Date();
    cursor.setDate(1);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(cursor);
      d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months.map(my => {
      const barTotal = paidSales
        .filter(s => monthKeyOf(s.created_at) === `${my.slice(0, 4)}-${my.slice(4, 6)}`)
        .reduce((sum, s) => sum + (s.total || 0), 0);
      const hospedagemTotal = revenueEntries
        .filter(r => monthKeyOf(r.event_date) === `${my.slice(0, 4)}-${my.slice(4, 6)}`)
        .reduce((sum, r) => sum + (r.total_value || 0), 0);
      const month = parseInt(my.slice(4, 6)) - 1;
      const year = my.slice(0, 4);
      return {
        monthYear: my,
        label: `${MONTH_LABELS[month]}/${year.slice(2)}`,
        barTotal,
        hospedagemTotal,
        total: barTotal + hospedagemTotal,
      };
    });
  }, [paidSales, revenueEntries]);

  const seasonality = useMemo(() => {
    const withData = monthlyTotals.filter(m => m.total > 0);
    if (withData.length === 0) return { peak: null, low: null };
    const peak = withData.reduce((a, b) => (b.total > a.total ? b : a));
    const low = withData.reduce((a, b) => (b.total < a.total ? b : a));
    return { peak, low };
  }, [monthlyTotals]);

  return {
    loading,
    dailyRevenueForMonth,
    paymentMethodBreakdown,
    monthlyTotals,
    seasonality,
  };
}
