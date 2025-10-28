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
  notes?: string | null;
}

export function useAgendaDB(month: number, year: number) {
  const [reservations, setReservations] = useState<RoomReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const start = startDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
    .toISOString()
    .slice(0, 10); // YYYY-MM-DD

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      // Importante: sobreposição (start < check_out) && (end > check_in)
      const { data, error } = await supabase
        .from('room_reservations')
        .select('*')
        .lt('check_in_date', end)
        .gt('check_out_date', start);
      if (error) throw error;
      setReservations(data || []);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // Realtime subscription para manter a agenda atualizada
    let cleanup: (() => void) | undefined;
    try {
      const s = supabase as any;
      if (s && typeof s.channel === 'function') {
        const channel = s
          .channel('room_reservations-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'room_reservations' }, () => {
            fetchReservations();
          })
          .subscribe();
        cleanup = () => { try { s.removeChannel?.(channel); } catch {} };
      }
    } catch {}
    return () => { cleanup?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  return { reservations, loading, error, refetch: fetchReservations };
}
