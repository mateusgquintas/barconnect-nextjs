'use client'

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRoomsDB } from './useRoomsDB';
import { AcquisitionChannel, CHANNEL_LABELS } from './useFinanceControladoria';
import { getLocalDateStr } from '@/utils/agenda';

interface RevenueRow {
  id: string;
  event_date: string;
  description: string;
  channel: AcquisitionChannel;
  total_value: number;
}

interface ReservationRow {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  notes: string | null;
  channel: string | null;
  created_at: string;
}

interface StockMovementRow {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  created_at: string;
  product_name?: string;
}

export interface ActivityItem {
  id: string;
  type: 'reservation' | 'stock';
  description: string;
  detail: string;
  timestamp: string;
}

function monthKeyOf(dateStr: string) {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function useDashboardGeral() {
  const { rooms, loading: roomsLoading } = useRoomsDB();
  const [revenueRows, setRevenueRows] = useState<RevenueRow[]>([]);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovementRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const sinceStr = sixMonthsAgo.toISOString().slice(0, 10);

        const [revenueRes, reservationsRes, stockRes] = await Promise.all([
          supabase
            .from('finance_channel_revenue')
            .select('id, event_date, description, channel, total_value')
            .gte('event_date', sinceStr),
          supabase
            .from('room_reservations')
            .select('id, room_id, status, check_in_date, check_out_date, notes, channel, created_at')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })
            .limit(300),
          supabase
            .from('stock_movements')
            .select('id, product_id, movement_type, quantity, created_at, products(name)')
            .order('created_at', { ascending: false })
            .limit(20),
        ]);

        if (revenueRes.data) setRevenueRows(revenueRes.data as RevenueRow[]);
        if (reservationsRes.data) setReservations(reservationsRes.data as ReservationRow[]);
        if (stockRes.data) {
          setStockMovements(
            (stockRes.data as any[]).map(m => ({
              id: m.id,
              product_id: m.product_id,
              movement_type: m.movement_type,
              quantity: m.quantity,
              created_at: m.created_at,
              product_name: m.products?.name,
            }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard geral:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const today = getLocalDateStr();
  const thisMonthKey = today.slice(0, 7);

  const totalRevenueThisMonth = useMemo(
    () => revenueRows.filter(r => monthKeyOf(r.event_date) === thisMonthKey).reduce((s, r) => s + (r.total_value || 0), 0),
    [revenueRows, thisMonthKey]
  );

  const newBookingsThisMonth = useMemo(
    () => reservations.filter(r => monthKeyOf(r.created_at) === thisMonthKey).length,
    [reservations, thisMonthKey]
  );

  const checkInsToday = useMemo(
    () => reservations.filter(r => r.check_in_date === today).length,
    [reservations, today]
  );

  const checkOutsToday = useMemo(
    () => reservations.filter(r => r.check_out_date === today).length,
    [reservations, today]
  );

  // Ocupação de quartos "agora": ocupado (reserva cobre hoje), reservado (futuro), não pronto (limpeza/manutenção), disponível.
  const roomOccupancy = useMemo(() => {
    let occupied = 0, reserved = 0, notReady = 0, available = 0;
    rooms.forEach(room => {
      if (room.status === 'cleaning' || room.status === 'maintenance') {
        notReady++;
        return;
      }
      if (room.status === 'occupied') {
        occupied++;
        return;
      }
      const roomReservations = reservations.filter(r => r.room_id === room.id);
      const isOccupiedToday = roomReservations.some(r => r.check_in_date <= today && r.check_out_date > today);
      if (isOccupiedToday) {
        occupied++;
        return;
      }
      const hasFuture = roomReservations.some(r => r.check_in_date > today);
      if (hasFuture) {
        reserved++;
        return;
      }
      available++;
    });
    return { total: rooms.length, occupied, reserved, available, notReady };
  }, [rooms, reservations, today]);

  // Tendência de faturamento dos últimos 6 meses
  const revenueTrend = useMemo(() => {
    const months: string[] = [];
    const cursor = new Date();
    cursor.setDate(1);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cursor);
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }
    const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map(m => {
      const total = revenueRows.filter(r => monthKeyOf(r.event_date) === m).reduce((s, r) => s + (r.total_value || 0), 0);
      const [year, month] = m.split('-');
      return { month: m, label: `${MONTH_LABELS[parseInt(month) - 1]}/${year.slice(2)}`, total };
    });
  }, [revenueRows]);

  // Faturamento por canal (mês atual)
  const revenueByChannel = useMemo(() => {
    const channels: AcquisitionChannel[] = ['agenciador', 'booking', 'motorista', 'chefe_romaria', 'direto'];
    const byChannel = channels.map(ch => ({
      channel: ch,
      label: CHANNEL_LABELS[ch],
      total: revenueRows
        .filter(r => monthKeyOf(r.event_date) === thisMonthKey && r.channel === ch)
        .reduce((s, r) => s + (r.total_value || 0), 0),
    }));
    return byChannel.filter(c => c.total > 0);
  }, [revenueRows, thisMonthKey]);

  // Atividade recente: combina reservas e movimentações de estoque
  const recentActivity = useMemo<ActivityItem[]>(() => {
    const fromReservations: ActivityItem[] = reservations.slice(0, 10).map(r => ({
      id: `res-${r.id}`,
      type: 'reservation',
      description: r.notes || 'Nova reserva',
      detail: `Check-in ${new Date(r.check_in_date + 'T00:00:00').toLocaleDateString('pt-BR')}`,
      timestamp: r.created_at,
    }));
    const fromStock: ActivityItem[] = stockMovements.slice(0, 10).map(m => ({
      id: `stock-${m.id}`,
      type: 'stock',
      description: m.product_name || 'Produto',
      detail: m.movement_type === 'in' ? `+${m.quantity} un. adicionadas` : m.movement_type === 'out' ? `-${m.quantity} un. retiradas` : `Ajuste: ${m.quantity} un.`,
      timestamp: m.created_at,
    }));
    return [...fromReservations, ...fromStock]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 8);
  }, [reservations, stockMovements]);

  // Últimas reservas para a tabela de booking list
  const recentBookings = useMemo(() => {
    return reservations.slice(0, 8).map(r => {
      const room = rooms.find(rm => rm.id === r.room_id);
      return {
        id: r.id,
        guestName: r.notes || 'Hóspede',
        roomNumber: room?.number ?? '—',
        checkIn: r.check_in_date,
        checkOut: r.check_out_date,
        status: r.status,
        channel: r.channel,
      };
    });
  }, [reservations, rooms]);

  return {
    loading: loading || roomsLoading,
    totalRevenueThisMonth,
    newBookingsThisMonth,
    checkInsToday,
    checkOutsToday,
    roomOccupancy,
    revenueTrend,
    revenueByChannel,
    recentActivity,
    recentBookings,
  };
}
