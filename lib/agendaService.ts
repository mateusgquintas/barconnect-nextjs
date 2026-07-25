// Calcula ocupação diária (% de quartos reservados por dia)
export async function getOccupancyByDay(month: number, year: number) {
  // Intervalo alvo do mês
  const monthStart = new Date(year, month - 1, 1);
  // Limite superior exclusivo: primeiro dia do próximo mês
  const monthEndExclusive = new Date(year, month, 1);
  const startISO = monthStart.toISOString().slice(0, 10);
  const endISO = monthEndExclusive.toISOString().slice(0, 10);

  // Busca apenas reservas que sobrepõem o mês (check_in < end && check_out > start)
  type Reservation = { room_id: string; check_in_date: string; check_out_date: string };
  const { data: reservations, error: resError } = await (supabase as any)
    .from('room_reservations')
    .select('room_id, check_in_date, check_out_date')
  // check_in_date < primeiro dia do próximo mês (exclusivo)
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
    // Conta reservas que incluem este dia usando lógica padronizada [start, end)
    const reservedRooms = (reservations as Reservation[]).filter((r: Reservation) => {
      return isRoomOccupiedOnDate(r.check_in_date, r.check_out_date, dateStr);
    }).map((r: Reservation) => r.room_id);
    const uniqueRooms = Array.from(new Set(reservedRooms));
    occupancy[dateStr] = totalRooms ? Math.round((uniqueRooms.length / totalRooms) * 100) : 0;
  }
  return occupancy;
}

// Versão detalhada que retorna % e contagem de quartos E pessoas
export async function getDetailedOccupancyByDay(month: number, year: number) {
  const monthStart = new Date(year, month - 1, 1);
  const monthEndExclusive = new Date(year, month, 1);
  const startISO = monthStart.toISOString().slice(0, 10);
  const endISO = monthEndExclusive.toISOString().slice(0, 10);

  type Reservation = { room_id: string; check_in_date: string; check_out_date: string; notes?: string | null };
  const { data: reservations, error: resError } = await (supabase as any)
    .from('room_reservations')
    .select('room_id, check_in_date, check_out_date, notes')
    .lt('check_in_date', endISO)
    .gt('check_out_date', startISO);
  if (resError) throw resError;

  const { data: rooms, error: roomsError } = await (supabase as any)
    .from('rooms')
    .select('id, capacity');
  if (roomsError) throw roomsError;
  
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);

  // Helper para extrair número de pessoas das notas
  const extractPeopleCount = (notes: string | null | undefined): number | null => {
    if (!notes) return null;
    const match = notes.match(/(\d+)\s+pessoas/i);
    return match ? parseInt(match[1]) : null;
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const occupancy: Record<string, { 
    percent: number; 
    occupied: number; 
    total: number;
    occupiedPeople: number;
    totalPeople: number;
    peoplePercent: number;
  }> = {};
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const activeReservations = (reservations as Reservation[]).filter((r: Reservation) => {
      return isRoomOccupiedOnDate(r.check_in_date, r.check_out_date, dateStr);
    });
    
    const uniqueRoomIds = Array.from(new Set(activeReservations.map((r: Reservation) => r.room_id)));
    const occupiedRooms = uniqueRoomIds.length;
    
    // Calcula ocupação de pessoas
    let occupiedPeople = 0;
    activeReservations.forEach((r: Reservation) => {
      const peopleInReservation = extractPeopleCount(r.notes);
      if (peopleInReservation) {
        occupiedPeople += peopleInReservation;
      } else {
        // Se não informado, usa capacity do quarto como fallback
        const room = rooms.find((rm: any) => rm.id === r.room_id);
        occupiedPeople += room?.capacity || 1;
      }
    });
    
    const roomPercent = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const peoplePercent = totalCapacity ? Math.round((occupiedPeople / totalCapacity) * 100) : 0;
    
    // Usa a MAIOR porcentagem para a barra de ocupação
    const percent = Math.max(roomPercent, peoplePercent);
    
    occupancy[dateStr] = { 
      percent, 
      occupied: occupiedRooms, 
      total: totalRooms,
      occupiedPeople,
      totalPeople: totalCapacity,
      peoplePercent
    };
  }
  
  return occupancy;
}
import { Booking, Room, DateRange } from '@/types/agenda';
import { supabase } from '@/lib/supabase';
import { hasOverlap, isRoomOccupiedOnDate, getLocalDateStr } from '@/utils/agenda';

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
    id: String(r.id ?? r.number),
    name: String(r.number ?? r.name ?? r.id).trim(),
    number: r.number ?? r.name ?? r.id,
    type: r.type,
    floor: r.floor,
    capacity: r.capacity ?? 2,
    status: (r.status as any) || 'active',
    
    // Informações básicas (migration 006)
    beds: r.beds,
    bed_configuration: r.bed_configuration, // JSONB com configuração detalhada de camas
    customName: r.custom_name,
    dailyRate: r.daily_rate,
    roomSize: r.room_size,
    
    // Amenidades principais
    hasMinibar: r.has_minibar ?? false,
    hasAc: r.has_ac ?? false,
    hasTv: r.has_tv ?? false,
    hasWifi: r.has_wifi ?? false,
    hasBalcony: r.has_balcony ?? false,
    
    // Amenidades banheiro
    hasBathtub: r.has_bathtub ?? false,
    hasHairdryer: r.has_hairdryer ?? false,
    
    // Amenidades extras
    hasSafe: r.has_safe ?? false,
    hasPhone: r.has_phone ?? false,
    hasBathrobe: r.has_bathrobe ?? false,
    
    // Características especiais
    viewType: r.view_type,
    isAccessible: r.is_accessible ?? false,
    isSmokingAllowed: r.is_smoking_allowed ?? false,
    isPetFriendly: r.is_pet_friendly ?? false,
    
    // Custos e manutenção (migration 011)
    fixedCostMonthly: r.fixed_cost_monthly,
    variableCostDaily: r.variable_cost_daily,
    lastMaintenanceDate: r.last_maintenance_date,
    maintenanceNotes: r.maintenance_notes,
  }));
}

/**
 * Retorna quartos disponíveis no período especificado.
 * Filtra quartos que:
 * 1. Não estão em manutenção ou inativos
 * 2. Não possuem reservas conflitantes no período [start, end)
 * 3. Não estão bloqueados por romarias (considerando todas as occurrences)
 */
export async function getAvailableRooms(
  start: string | Date,
  end: string | Date,
  excludePilgrimageId?: string // Permitir excluir uma romaria específica (útil ao editar)
): Promise<Room[]> {
  // Buscar todos os quartos
  const allRooms = await listRooms();
  
  // Buscar reservas que podem conflitar no período
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  // Validação básica
  if (startDate >= endDate) {
    throw new Error('Data de início deve ser anterior à data de término.');
  }
  
  const bookings = await listBookingsInRange({ start: startDate, end: endDate });
  
  // Buscar romarias com suas ocorrências para validar bloqueios
  const { data: pilgrimagesData, error: pilgrimagesError } = await (supabase as any)
    .from('pilgrimages')
    .select(`
      id,
      pilgrimages_occurrences:pilgrimage_occurrences(
        id,
        arrival_date,
        departure_date,
        status
      )
    `);
  
  if (pilgrimagesError) {
    console.warn('[getAvailableRooms] Erro ao buscar romarias:', pilgrimagesError);
  }
  
  // Mapear ocorrências ativas que conflitam com o período solicitado
  const conflictingPilgrimageIds = new Set<string>();
  if (pilgrimagesData) {
    for (const pilgrimage of pilgrimagesData) {
      // Ignorar romaria específica se fornecida (útil ao editar)
      if (excludePilgrimageId && pilgrimage.id === excludePilgrimageId) {
        continue;
      }
      
      const occurrences = pilgrimage.pilgrimages_occurrences || [];
      for (const occ of occurrences) {
        // Considerar apenas ocorrências ativas ou agendadas
        if (occ.status === 'cancelled' || occ.status === 'completed') {
          continue;
        }
        
        const occStart = new Date(occ.arrival_date);
        const occEnd = new Date(occ.departure_date);
        
        // Verificar overlap: occurrence[start, end) com período solicitado[start, end)
        if (hasOverlap(
          { start: occStart, end: occEnd },
          { start: startDate, end: endDate }
        )) {
          conflictingPilgrimageIds.add(pilgrimage.id);
          break; // Já encontrou conflito, não precisa verificar outras occurrences
        }
      }
    }
  }
  
  // Filtrar quartos disponíveis
  return allRooms.filter(room => {
    // Excluir quartos em manutenção ou inativos
    if (room.status === 'maintenance' || room.status === 'inactive') {
      return false;
    }
    
    // Verificar se existe alguma reserva conflitante para este quarto
    const hasBookingConflict = bookings.some(booking => {
      // Se a reserva pertence a uma romaria conflitante, considerar indisponível
      if (booking.pilgrimage_id && conflictingPilgrimageIds.has(booking.pilgrimage_id)) {
        return booking.room_id === room.id;
      }
      
      // Verificar overlap normal de reservas
      return booking.room_id === room.id &&
        hasOverlap(
          { start: new Date(booking.start), end: new Date(booking.end) },
          { start: startDate, end: endDate }
        );
    });
    
    return !hasBookingConflict;
  });
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
      occurrence_id: row.occurrence_id ?? null,
      notes: row.notes ?? null,
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

// Depois de cancelar reserva(s) de quarto, verifica se TODAS as linhas de room_reservations
// daquela ocorrência de romaria já estão canceladas — se sim, marca a própria ocorrência como
// cancelada, para que a Gestão de Romarias reflita o cancelamento feito na Agenda/Gestão de
// Quartos (status "Cancelada" é calculado a partir do status das ocorrências).
export async function syncOccurrenceCancellation(occurrenceId: string | null | undefined): Promise<void> {
  if (!occurrenceId) return;
  const { data, error } = await (supabase as any)
    .from('room_reservations')
    .select('status')
    .eq('occurrence_id', occurrenceId);
  if (error) {
    console.error('[agendaService] Erro ao verificar reservas da ocorrência:', error);
    return;
  }
  const rows = data || [];
  if (rows.length === 0) return;
  const allCancelled = rows.every((r: any) => r.status === 'cancelled');
  if (!allCancelled) return;
  const { error: occError } = await (supabase as any)
    .from('pilgrimage_occurrences')
    .update({ status: 'cancelled' })
    .eq('id', occurrenceId);
  if (occError) {
    console.error('[agendaService] Erro ao marcar ocorrência como cancelada:', occError);
  }
}

export async function updateRoomReservation(id: string, updates: Partial<{
  check_in_date: string;
  check_out_date: string;
  notes: string | undefined;
  status: string;
}>): Promise<boolean> {
  const tbl = await resolveFirstAvailableTable(TABLES.bookings);
  const { error } = await (supabase as any).from(tbl).update(updates).eq('id', id);
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
    if ((payload as any).channel !== undefined) row.channel = (payload as any).channel || null;
    if ((payload as any).total_value !== undefined) row.total_value = (payload as any).total_value ?? null;
    if ((payload as any).number_of_people !== undefined) row.number_of_people = (payload as any).number_of_people ?? null;
    if ((payload as any).number_of_buses !== undefined) row.number_of_buses = (payload as any).number_of_buses ?? null;
    // occurrence_id identifica a vinda específica da romaria (não só o grupo), evitando que
    // quartos de vindas diferentes se misturem no mesmo agrupamento visual.
    if ((payload as any).occurrence_id !== undefined) row.occurrence_id = (payload as any).occurrence_id ?? null;
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

export interface ReservationPaymentPlan {
  method: string;
  installments: number;
  alreadyPaid: boolean;
  receivingMode: 'antecipado' | 'parcela_a_parcela';
  receivedDate: string | null;
  dueDate: string | null;
  // Liga a transação à vinda específica da romaria (pilgrimage_occurrences.id), permitindo
  // ao relatório financeiro cruzar receita de hospedagem com a estadia exata que a gerou.
  occurrenceId?: string | null;
}

// Aplica o plano de pagamento definido no bloco financeiro da Nova Reserva: grava as parcelas
// em `reservation_payments` (fonte de verdade para o cálculo dinâmico de "valor em aberto") e
// espelha no fluxo de caixa (`transactions`) o que já foi de fato recebido ou está agendado.
export async function applyReservationPaymentPlan(
  reservationId: string,
  description: string,
  totalAmount: number,
  plan: ReservationPaymentPlan
): Promise<void> {
  if (!totalAmount || totalAmount <= 0) return;

  const insertTransaction = async (amount: number, date: string): Promise<string | undefined> => {
    const { data, error } = await (supabase as any)
      .from('transactions')
      .insert({
        type: 'income',
        description,
        amount,
        category: 'Hospedagens',
        payment_method: plan.method || null,
        transaction_date: date,
        occurrence_id: plan.occurrenceId || null,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[agendaService] Erro ao lançar transação da reserva:', error);
      return undefined;
    }
    return data?.id;
  };

  // Com uma única parcela, não há "forma de recebimento" — só importa se já foi pago ou não.
  if (plan.installments <= 1) {
    if (!plan.alreadyPaid) {
      const dueDate = plan.dueDate || getLocalDateStr();
      await (supabase as any).from('reservation_payments').insert({
        room_reservation_id: reservationId,
        installment_number: 1,
        amount: totalAmount,
        due_date: dueDate,
        status: 'pending',
        payment_method: plan.method || null,
      });
      return;
    }
    const receivedDate = plan.receivedDate || getLocalDateStr();
    const txId = await insertTransaction(totalAmount, receivedDate);
    await (supabase as any).from('reservation_payments').insert({
      room_reservation_id: reservationId,
      installment_number: 1,
      amount: totalAmount,
      due_date: receivedDate,
      status: 'paid',
      payment_method: plan.method || null,
      received_date: receivedDate,
      transaction_id: txId || null,
    });
    return;
  }

  // Mais de uma parcela: a forma de recebimento é escolhida independentemente de o cliente já
  // ter pago ou não, pois define como as parcelas futuras serão projetadas no fluxo de caixa.
  const receivedDate = plan.receivedDate || getLocalDateStr();

  if (plan.receivingMode === 'antecipado') {
    if (!plan.alreadyPaid) {
      // Ainda não recebeu, mas quando receber será de uma vez só: registra como pendente,
      // sem lançar transação até a confirmação de recebimento.
      await (supabase as any).from('reservation_payments').insert({
        room_reservation_id: reservationId,
        installment_number: 1,
        amount: totalAmount,
        due_date: receivedDate,
        status: 'pending',
        payment_method: plan.method || null,
      });
      return;
    }
    const txId = await insertTransaction(totalAmount, receivedDate);
    await (supabase as any).from('reservation_payments').insert({
      room_reservation_id: reservationId,
      installment_number: 1,
      amount: totalAmount,
      due_date: receivedDate,
      status: 'paid',
      payment_method: plan.method || null,
      received_date: receivedDate,
      transaction_id: txId || null,
    });
    return;
  }

  // Parcela a parcela: uma linha por mês. Se o cliente ainda não pagou, as parcelas só
  // ficam registradas como pendentes (sem lançar nada no fluxo de caixa ainda); se já pagou,
  // cada parcela também nasce como um lançamento agendado no fluxo de caixa, mas só entra na
  // conta de "valor em aberto" quando for confirmada como recebida (ação futura).
  const n = plan.installments;
  const perInstallment = Math.round((totalAmount / n) * 100) / 100;
  const base = new Date(`${receivedDate}T00:00:00`);
  for (let i = 0; i < n; i++) {
    const dueDate = new Date(base);
    dueDate.setMonth(dueDate.getMonth() + i);
    const dueDateStr = getLocalDateStr(dueDate);
    const amount = i === n - 1 ? Math.round((totalAmount - perInstallment * (n - 1)) * 100) / 100 : perInstallment;
    const txId = plan.alreadyPaid ? await insertTransaction(amount, dueDateStr) : undefined;
    await (supabase as any).from('reservation_payments').insert({
      room_reservation_id: reservationId,
      installment_number: i + 1,
      amount,
      due_date: dueDateStr,
      status: 'pending',
      payment_method: plan.method || null,
      transaction_id: txId || null,
    });
  }
}

// Soma das parcelas efetivamente pagas por reserva, usada para calcular o "valor em aberto"
// dinamicamente (total da reserva − soma das parcelas quitadas), em vez de um valor fixo.
export async function getOpenAmountsByReservation(reservationIds: string[]): Promise<Record<string, number>> {
  if (reservationIds.length === 0) return {};
  const { data: reservations, error: resError } = await (supabase as any)
    .from('room_reservations')
    .select('id, total_value')
    .in('id', reservationIds);
  if (resError) throw resError;

  const { data: payments, error: payError } = await (supabase as any)
    .from('reservation_payments')
    .select('room_reservation_id, amount, status')
    .in('room_reservation_id', reservationIds);
  if (payError) throw payError;

  const paidByReservation: Record<string, number> = {};
  (payments || []).forEach((p: any) => {
    if (p.status === 'paid') {
      paidByReservation[p.room_reservation_id] = (paidByReservation[p.room_reservation_id] || 0) + Number(p.amount);
    }
  });

  const result: Record<string, number> = {};
  (reservations || []).forEach((r: any) => {
    const total = Number(r.total_value) || 0;
    const paid = paidByReservation[r.id] || 0;
    result[r.id] = Math.max(0, total - paid);
  });
  return result;
}
