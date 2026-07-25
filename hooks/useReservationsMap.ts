'use client'

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface MapReservation {
  id: string;
  room_id: string;
  pilgrimage_id: string | null;
  check_in_date: string;
  check_out_date: string;
  status: string;
  notes: string | null;
  channel: string | null;
  total_value: number | null;
  number_of_people: number | null;
  number_of_buses: number | null;
}

export function useReservationsMap(startDate: string, endDate: string) {
  const [reservations, setReservations] = useState<MapReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      // Overlap com o período: check_in < endDate && check_out > startDate
      const { data, error } = await supabase
        .from('room_reservations')
        .select('id, room_id, pilgrimage_id, check_in_date, check_out_date, status, notes, channel, total_value, number_of_people, number_of_buses')
        .lt('check_in_date', endDate)
        .gt('check_out_date', startDate)
        .neq('status', 'cancelled');
      if (error) throw error;
      setReservations((data as MapReservation[]) || []);
    } catch (error: any) {
      console.error('Erro ao carregar reservas do mapa:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const cancelReservation = async (id: string) => {
    const { error } = await supabase.from('room_reservations').update({ status: 'cancelled' }).eq('id', id);
    if (!error) await fetchReservations();
    return !error;
  };

  const updateReservation = async (id: string, updates: Partial<Omit<MapReservation, 'id'>>) => {
    const { error } = await supabase.from('room_reservations').update(updates).eq('id', id);
    if (!error) await fetchReservations();
    return !error;
  };

  return { reservations, loading, refetch: fetchReservations, cancelReservation, updateReservation };
}
