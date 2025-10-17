import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
}

export function useAgendaDB(month: number, year: number) {
  const [reservations, setReservations] = useState<RoomReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    supabase
      .from('room_reservations')
      .select('*')
      .gte('check_in_date', start)
      .lte('check_out_date', end)
      .then(({ data, error }: any) => {
        if (error) setError(error.message);
        else setReservations(data || []);
        setLoading(false);
      });
  }, [month, year]);

  return { reservations, loading, error };
}
