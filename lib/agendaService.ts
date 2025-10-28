// Calcula ocupação diária (% de quartos reservados por dia)
export async function getOccupancyByDay(month: number, year: number) {
  // Intervalo alvo do mês
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const startISO = monthStart.toISOString().slice(0, 10);
  const endISO = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate(), 23, 59, 59, 999)
    .toISOString()
    .slice(0, 10);

  // Busca apenas reservas que sobrepõem o mês (check_in < end && check_out > start)
  type Reservation = { room_id: string; check_in_date: string; check_out_date: string };
  const { data: reservations, error: resError } = await (supabase as any)
    .from('room_reservations')
    .select('room_id, check_in_date, check_out_date')
    .lt('check_in_date', endISO)
    .gt('check_out_date', startISO);
  if (resError) throw resError;

  // Busca todos os quartos
  const { data: rooms, error: roomsError } = await (supabase as any)
    .from('rooms')
    .select('id');
  if (roomsError) throw roomsError;
  const totalRooms = rooms.length;

  // Mapeia ocupação por dia
  const daysInMonth = new Date(year, month, 0).getDate();
  const occupancy: Record<string, number> = {};
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Conta reservas que incluem este dia
    const reservedRooms = (reservations as Reservation[]).filter((r: Reservation) => {
      return r.check_in_date <= dateStr && r.check_out_date > dateStr;
    }).map((r: Reservation) => r.room_id);
    const uniqueRooms = Array.from(new Set(reservedRooms));
    occupancy[dateStr] = totalRooms ? Math.round((uniqueRooms.length / totalRooms) * 100) : 0;
  }
  return occupancy;
}
import { Booking, Room, DateRange } from '@/types/agenda';
import { supabase } from '@/lib/supabase';
import { hasOverlap } from '@/utils/agenda';

const TABLES = {
  rooms: ['rooms', 'hotel_rooms'],
  bookings: ['room_reservations', 'hotel_reservations'],
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
  const requestedStatus = payload.status ?? 'confirmed';
  // Map status to table-specific allowed value (room_reservations uses 'reserved')
  const normalizedStatus = (tbl === 'room_reservations' && (requestedStatus === 'confirmed' || requestedStatus === 'pending'))
    ? 'reserved'
    : requestedStatus;

  const row: any = {
    room_id: payload.room_id,
    status: normalizedStatus,
    pilgrimage_id: payload.pilgrimage_id ?? null,
  };
  // Optional notes support where available
  if ((payload as any).notes !== undefined) {
    row.notes = (payload as any).notes || null;
  }
  // Se estivermos no schema room_reservations e não houver notes, preservar o nome do hóspede em notes
  if (tbl === 'room_reservations' && !row.notes && payload.customer_name) {
    row.notes = payload.customer_name;
  }
  // Column names differ
  if (tbl === 'room_reservations') {
    row.check_in_date = start;
    row.check_out_date = end;
    // room_reservations (schema_hotel_romarias) não possui customer_name
  } else if (tbl === 'hotel_reservations') {
    row.checkin_date = start;
    row.checkout_date = end;
    row.customer_name = payload.customer_name ?? null;
  } else {
    // Default 'bookings' table uses start/end
    row.start = start;
    row.end = end;
    row.customer_name = payload.customer_name ?? null;
  }
  
  const { data, error } = await (supabase as any).from(tbl).insert(row).select('id').single();
  if (error) {
    console.error('[agendaService] createBooking error:', error);
    throw new Error(error.message || 'Erro ao criar reserva');
  }
  return String(data?.id);
}

export async function cancelRoomReservation(id: string): Promise<boolean> {
  const tbl = await resolveFirstAvailableTable(TABLES.bookings);
  const { error } = await (supabase as any).from(tbl).update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
  return true;
}

export async function createRoomReservation(payload: Omit<Booking,'id'|'created_at'|'status'> & { status?: Booking['status'] }): Promise<string> {
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
  const requestedStatus = payload.status ?? 'confirmed';
  const normalizedStatus = (tbl === 'room_reservations' && (requestedStatus === 'confirmed' || requestedStatus === 'pending'))
    ? 'reserved'
    : requestedStatus;
  const row: any = {
    room_id: payload.room_id,
    status: normalizedStatus,
    pilgrimage_id: payload.pilgrimage_id ?? null,
  };
  // Optional notes
  if ((payload as any).notes !== undefined) {
    row.notes = (payload as any).notes || null;
  }
  // Preservar nome do hóspede em notes quando usando room_reservations
  if (tbl === 'room_reservations' && !row.notes && payload.customer_name) {
    row.notes = payload.customer_name;
  }
  // Column names differ
  if (tbl === 'room_reservations') {
    row.check_in_date = start;
    row.check_out_date = end;
    // Não enviar customer_name pois a tabela não possui essa coluna neste esquema
  } else if (tbl === 'hotel_reservations') {
    row.checkin_date = start;
    row.checkout_date = end;
    row.customer_name = payload.customer_name ?? null;
  } else {
    row.start = start;
    row.end = end;
    row.customer_name = payload.customer_name ?? null;
  }
  
  const { data, error } = await (supabase as any).from(tbl).insert(row).select('id').single();
  if (error) {
    console.error('[agendaService] createRoomReservation error:', error);
    throw new Error(error.message || 'Erro ao criar reserva');
  }
  return String(data?.id);
}
