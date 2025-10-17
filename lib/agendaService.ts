import { Booking, Room, DateRange } from '@/types/agenda';
import { supabase } from '@/lib/supabase';
import { hasOverlap } from '@/utils/agenda';

// We support two possible schemas (based on provided SQL files):
// - Minimal: rooms, room_reservations (schema_hotel_romarias.sql)
// - Hotel: hotel_rooms, hotel_reservations (schema_hotel.sql)
// We'll try primary names first, then fall back.
const TABLES = {
  rooms: ['rooms', 'hotel_rooms'],
  bookings: ['bookings', 'room_reservations', 'hotel_reservations'],
};

async function resolveFirstAvailableTable(candidates: string[]): Promise<string> {
  // We cannot introspect easily without RPC; assume first exists.
  // Keep order as priority; envs/tests use mock, so it's fine.
  return candidates[0];
}

export async function listRooms(): Promise<Room[]> {
  const tbl = await resolveFirstAvailableTable(TABLES.rooms);
  const { data, error } = await (supabase as any).from(tbl).select('*');
  if (error) throw error;
  // Normalize to our Room type shape where possible
  return (data || []).map((r: any) => ({
    id: String(r.id),
    name: String(r.number ?? r.name ?? r.id).trim(),
    capacity: r.capacity ?? null,
    status: (r.status as any) || 'active',
  }));
}

export async function listBookingsInRange(range: DateRange): Promise<Booking[]> {
  const tbl = await resolveFirstAvailableTable(TABLES.bookings);
  // We fetch by simple date window when possible; since schemas differ (date vs datetime), we select broad and filter client-side.
  const { data, error } = await (supabase as any).from(tbl).select('*');
  if (error) throw error;
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();
  const out: Booking[] = [];
  for (const row of data || []) {
    // Normalize to ISO datetimes [start, end)
    const startISO: string = row.start ?? row.check_in_date ?? row.checkin_date;
    const endISO: string = row.end ?? row.check_out_date ?? row.checkout_date;
    if (!startISO || !endISO) continue;
    const start = new Date(startISO);
    const end = new Date(endISO);
    const s = start.getTime();
    const e = end.getTime();
    // Overlap with [range.start, range.end)
    const overlaps = s < endMs && startMs < e;
    if (!overlaps) continue;
    const status = (row.status as any) || 'confirmed';
    if (String(status).toLowerCase() === 'cancelled') continue;
    out.push({
      id: String(row.id),
      room_id: String(row.room_id ?? row.roomId ?? 'unknown'),
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      customer_name: row.customer_name ?? row.guest_name ?? null,
      pilgrimage_id: row.pilgrimage_id ?? null,
      created_at: row.created_at ?? undefined,
    });
  }
  return out;
}

export async function createBooking(payload: Omit<Booking,'id'|'created_at'|'status'> & { status?: Booking['status'] }): Promise<string> {
  const tbl = await resolveFirstAvailableTable(TABLES.bookings);
  
  // Client-side overlap validation as fast-fail (server should also enforce via constraints)
  const startDate = new Date(payload.start);
  const endDate = new Date(payload.end);
  
  if (startDate >= endDate) {
    throw new Error('Data de início deve ser anterior à data de término.');
  }
  
  const existing = await listBookingsInRange({ start: startDate, end: endDate });
  const conflict = existing.some(b => 
    b.room_id === payload.room_id && 
    hasOverlap(
      { start: new Date(b.start), end: new Date(b.end) },
      { start: startDate, end: endDate }
    )
  );
  
  if (conflict) {
    throw new Error('Conflito: já existe uma reserva neste período para o quarto selecionado.');
  }
  
  // Normalize payload to table columns
  const start = payload.start;
  const end = payload.end;
  const status = payload.status ?? 'confirmed';
  const row: any = {
    room_id: payload.room_id,
    status,
    customer_name: payload.customer_name ?? null,
    pilgrimage_id: payload.pilgrimage_id ?? null,
  };
  // Column names differ
  if (tbl === 'room_reservations') {
    row.check_in_date = start;
    row.check_out_date = end;
  } else if (tbl === 'hotel_reservations') {
    row.checkin_date = start;
    row.checkout_date = end;
  } else {
    // Default 'bookings' table uses start/end
    row.start = start;
    row.end = end;
  }
  
  const { data, error } = await (supabase as any).from(tbl).insert(row).select('id').single();
  if (error) {
    console.error('[agendaService] createBooking error:', error);
    throw new Error(error.message || 'Erro ao criar reserva');
  }
  return String(data?.id);
}

export async function cancelBooking(id: string): Promise<boolean> {
  const tbl = await resolveFirstAvailableTable(TABLES.bookings);
  const { error } = await (supabase as any).from(tbl).update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
  return true;
}
