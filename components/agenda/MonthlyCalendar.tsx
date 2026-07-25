'use client'
import React from 'react';
import { ChevronLeft, ChevronRight, Bus, Hotel } from 'lucide-react';
import { Pilgrimage as PilgrimageType } from '@/types';
import { ReservationDetailPopover, ReservationDetail } from './ReservationDetailPopover';

interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
  occurrence_id?: string | null;
  notes?: string | null;
  total_value?: number | null;
  number_of_people?: number | null;
}

interface Room {
  id: string;
  number: number | string;
}

type Props = {
  month: Date; // any date within the month to display
  selectedDate?: Date | null;
  onDayClick?: (date: Date) => void;
  onDayDoubleClick?: (date: Date) => void;
  renderDayBadge?: (date: Date) => React.ReactNode;
  renderOccupancyBar?: (date: Date) => React.ReactNode;
  reservations?: RoomReservation[];
  rooms?: Room[];
  pilgrimages?: PilgrimageType[];
  openAmountByReservation?: Record<string, number>;
  onEventClick?: (reservation: RoomReservation) => void;
  onEditReservation?: (reservation: RoomReservation) => void;
  // allIds inclui todas as linhas de room_reservations do grupo (todos os quartos da mesma
  // romaria), para que cancelar de fato encerre a reserva inteira, não só um quarto dela.
  onCancelReservation?: (reservation: RoomReservation, allIds?: string[]) => void;
  showEvents?: boolean;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
  headerActions?: React.ReactNode;
};

function startOfMonth(d: Date) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function startOfWeek(d: Date) {
  const x = new Date(d); const dow = (x.getDay()+6)%7; // Monday=0
  x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x;
}

function buildMonthDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const days: Date[] = [];
  for (let i=0;i<42;i++) { const d = new Date(start); d.setDate(start.getDate()+i); days.push(d); }
  return days;
}

function isSameDay(a?: Date|null, b?: Date|null) {
  if (!a || !b) return false;
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type ReservationKind = 'romaria' | 'avulso';
type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

interface DayEvent {
  key: string;
  title: string;
  time: string;
  kind: ReservationKind;
  reservationStatus: ReservationStatus;
  reservation: RoomReservation;
  pilgrimage?: PilgrimageType;
  roomLabels: string[];
  // Uma reserva de romaria costuma virar várias linhas em room_reservations (uma por quarto),
  // cada uma guardando apenas a fração do valor/pessoas daquele quarto. O card de detalhe
  // precisa do total do grupo inteiro, não do valor de uma única linha — daí somamos aqui.
  totalPeople: number;
  totalValueSum: number;
  totalOpenAmount: number;
  startDate: Date;
  endDate: Date; // exclusivo (dia do check-out)
  // Todas as linhas de room_reservations que compõem este evento (uma romaria com N quartos
  // vira N linhas). Cancelar precisa encerrar todas elas, não só a primeira — senão o restante
  // continua ocupando quartos e a barra nunca some da agenda.
  reservationIds: string[];
}

interface BarSegment {
  event: DayEvent;
  colStart: number; // 0-6, coluna da semana
  colSpan: number; // 1-7
  lane: number;
  isStart: boolean; // este segmento inclui o dia real do check-in
  isEnd: boolean; // este segmento inclui a última noite (check-out - 1 dia)
}

function chunk7(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

// Cor por tipo (romaria x avulso) modulada pelo status: pendente é sempre âmbar e cancelada é
// sempre vermelha, independente do tipo — só quando confirmada é que a cor de tipo aparece.
function getChipStyle(kind: ReservationKind, status: ReservationStatus): string {
  if (status === 'cancelled') return 'bg-red-50 text-red-700 hover:bg-red-100 line-through decoration-red-300';
  if (status === 'pending') return 'bg-amber-50 text-amber-800 hover:bg-amber-100';
  return kind === 'romaria' ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'bg-blue-50 text-blue-800 hover:bg-blue-100';
}

function getStatusLabel(status: ReservationStatus): string {
  if (status === 'cancelled') return 'Cancelada';
  if (status === 'pending') return 'Pendente';
  return 'Confirmada';
}

// Cor da tag de status no popover de detalhe (ver ReservationDetailPopover).
function getStatusTagColor(kind: ReservationKind, status: ReservationStatus): 'green' | 'blue' | 'amber' | 'red' {
  if (status === 'cancelled') return 'red';
  if (status === 'pending') return 'amber';
  return kind === 'romaria' ? 'green' : 'blue';
}

export function MonthlyCalendar({
  month,
  selectedDate,
  onDayClick,
  onDayDoubleClick,
  reservations = [],
  rooms = [],
  pilgrimages = [],
  openAmountByReservation = {},
  onEditReservation,
  onCancelReservation,
  onPrevMonth,
  onNextMonth,
  onToday,
  headerActions,
}: Props) {
  const days = React.useMemo(() => buildMonthDays(month), [month]);
  const monthIdx = month.getMonth();
  const year = month.getFullYear();
  const monthLabel = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const today = new Date();

  const weekDays = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];

  // Agrupa reservas por romaria (uma "carta" por grupo) ou individualmente. Cada grupo vira UM
  // evento com data de início/fim — a renderização (mais abaixo) é quem decide como desenhar
  // esse intervalo no grid (uma barra contínua, possivelmente quebrada em mais de uma semana).
  const events = React.useMemo(() => {
    const grouped = new Map<string, RoomReservation[]>();
    // Reservas canceladas continuam aparecendo (em vermelho) — só saem de vista quando o
    // usuário filtra por status na tela, nunca somem silenciosamente da agenda.
    reservations.forEach(r => {
        // occurrence_id identifica a vinda específica da romaria — fonte de verdade para o
        // agrupamento. Reservas antigas sem occurrence_id (criadas antes dessa coluna existir)
        // caem no fallback por pilgrimage_id+data, que é sujeito a divergências de fuso/formatação.
        const key = r.occurrence_id
          ? `occurrence-${r.occurrence_id}`
          : r.pilgrimage_id
          ? `pilgrimage-${r.pilgrimage_id}-${r.check_in_date}`
          : `individual-${r.id}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
      });

    const list: DayEvent[] = [];
    grouped.forEach((group, key) => {
      const first = group[0];
      const pilgrimage = first.pilgrimage_id ? pilgrimages.find(p => p.id === first.pilgrimage_id) : undefined;
      const kind: ReservationKind = pilgrimage ? 'romaria' : 'avulso';
      const roomLabels = group.map(r => {
        const room = rooms.find(rm => rm.id === r.room_id);
        return room ? `Quarto ${room.number}` : '';
      }).filter(Boolean);
      const title = pilgrimage
        ? `${pilgrimage.name}`
        : (first.notes || first.customer_name || roomLabels[0] || 'Reserva');
      const time = roomLabels.length > 1 ? `${roomLabels.length} quartos` : 'check-in';

      const totalPeople = group.reduce((sum, r) => sum + (r.number_of_people || 0), 0);
      const totalValueSum = group.reduce((sum, r) => sum + (r.total_value || 0), 0);
      const totalOpenAmount = group.reduce((sum, r) => {
        const open = openAmountByReservation[r.id];
        return sum + (open != null ? open : (r.total_value || 0));
      }, 0);

      // Cancelada = todos os quartos do grupo cancelados. Pendente = ainda tem valor em aberto.
      // Confirmada = sem pendência bloqueante. (Check-in/check-out não entram aqui — são
      // conceito da Gestão de Quartos, não da Agenda.)
      const isCancelled = group.every(r => r.status === 'cancelled');
      const reservationStatus: ReservationStatus = isCancelled ? 'cancelled' : (totalOpenAmount > 0 ? 'pending' : 'confirmed');

      list.push({
        key, title, time, kind, reservationStatus, reservation: first, pilgrimage, roomLabels,
        totalPeople, totalValueSum, totalOpenAmount,
        startDate: new Date(first.check_in_date + 'T00:00:00'),
        endDate: new Date(first.check_out_date + 'T00:00:00'),
        reservationIds: group.map(r => r.id),
      });
    });
    return list;
  }, [reservations, rooms, pilgrimages, openAmountByReservation]);

  // Ocupação por dia: quantos quartos distintos estão ocupados/reservados naquele dia (excluindo
  // canceladas) sobre o total de quartos — usado para sinalizar dias perto/no limite da lotação.
  const occupancyByDay = React.useMemo(() => {
    const totalRooms = rooms.length;
    const map = new Map<string, number>(); // dateKey -> ratio 0..1
    if (totalRooms === 0) return map;
    const active = reservations.filter(r => r.status !== 'cancelled');
    days.forEach(d => {
      const key = dateKey(d);
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
      const occupiedRoomIds = new Set<string>();
      active.forEach(r => {
        const start = new Date(r.check_in_date + 'T00:00:00');
        const end = new Date(r.check_out_date + 'T00:00:00');
        if (start < dayEnd && end > dayStart) occupiedRoomIds.add(r.room_id);
      });
      map.set(key, occupiedRoomIds.size / totalRooms);
    });
    return map;
  }, [reservations, rooms, days]);

  const weeks = React.useMemo(() => chunk7(days), [days]);

  // Para cada semana da grade, calcula os segmentos de barra que caem nela (recortando o
  // intervalo do evento nos limites da semana) e atribui "raias" (lanes) para empilhar
  // reservas simultâneas sem sobrepor.
  const weekBars = React.useMemo(() => {
    return weeks.map((weekDays) => {
      const weekStart = weekDays[0];
      const weekEndExclusive = new Date(weekStart);
      weekEndExclusive.setDate(weekEndExclusive.getDate() + 7);

      const segments = events
        .filter(ev => ev.startDate < weekEndExclusive && ev.endDate > weekStart)
        .map(ev => {
          const segStart = ev.startDate < weekStart ? weekStart : ev.startDate;
          const segEndExclusive = ev.endDate > weekEndExclusive ? weekEndExclusive : ev.endDate;
          const colStart = Math.round((segStart.getTime() - weekStart.getTime()) / 86400000);
          const colEndExclusive = Math.round((segEndExclusive.getTime() - weekStart.getTime()) / 86400000);
          return {
            event: ev,
            colStart,
            colSpan: Math.max(1, colEndExclusive - colStart),
            isStart: ev.startDate.getTime() === segStart.getTime(),
            isEnd: ev.endDate.getTime() === segEndExclusive.getTime(),
          };
        })
        .sort((a, b) => a.colStart - b.colStart || b.colSpan - a.colSpan);

      const laneEnds: number[] = [];
      const withLanes: BarSegment[] = segments.map(seg => {
        let lane = laneEnds.findIndex(end => end <= seg.colStart);
        if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
        laneEnds[lane] = seg.colStart + seg.colSpan;
        return { ...seg, lane };
      });
      return withLanes;
    });
  }, [weeks, events]);

  const buildDetail = (event: DayEvent): ReservationDetail => ({
    id: event.reservation.id,
    title: event.title,
    statusLabel: getStatusLabel(event.reservationStatus),
    statusColor: getStatusTagColor(event.kind, event.reservationStatus),
    pilgrimageName: event.pilgrimage?.name,
    checkInDate: event.reservation.check_in_date,
    checkOutDate: event.reservation.check_out_date,
    numberOfPeople: event.totalPeople,
    totalValue: event.totalValueSum,
    openAmount: event.totalOpenAmount,
    roomLabels: event.roomLabels,
  });

  return (
    <div className="w-full" aria-label="Calendário mensal">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {onPrevMonth && (
            <button
              type="button"
              onClick={onPrevMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onToday && (
            <button
              type="button"
              onClick={onToday}
              className="h-8 px-3 text-sm rounded-full border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600 font-medium"
            >
              Hoje
            </button>
          )}
          {onNextMonth && (
            <button
              type="button"
              onClick={onNextMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg font-medium text-slate-900 capitalize ml-1" aria-live="polite">{monthLabel}</h2>
        </div>
        {headerActions}
      </div>

      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((wd) => (
          <div key={wd} className="py-2 text-center text-xs font-medium text-slate-400 lowercase" role="columnheader">{wd}</div>
        ))}
      </div>

      <div className="flex flex-col gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100" role="grid">
        {weeks.map((weekDays, weekIndex) => {
          const bars = weekBars[weekIndex];
          const laneCount = bars.reduce((max, seg) => Math.max(max, seg.lane + 1), 0);

          return (
            <div
              key={weekIndex}
              className="grid grid-cols-7 gap-px"
              style={{ gridTemplateRows: `1.75rem repeat(${laneCount}, 1.1rem) minmax(0.35rem, 1fr)` }}
            >
              {weekDays.map((d, dayIndex) => {
                const inCurrentMonth = d.getMonth() === monthIdx && d.getFullYear() === year;
                const selected = isSameDay(d, selectedDate || null);
                const isToday = isSameDay(d, today);
                const key = dateKey(d);
                const occupancyRatio = occupancyByDay.get(key) || 0;
                const isNearFull = occupancyRatio >= 0.9;
                const isFull = occupancyRatio >= 1;

                return (
                  <div
                    key={key}
                    role="gridcell"
                    aria-selected={selected}
                    data-date={key}
                    onClick={() => onDayClick?.(d)}
                    onDoubleClick={() => onDayDoubleClick?.(d)}
                    style={{ gridColumn: dayIndex + 1, gridRow: '1 / -1' }}
                    className={[
                      'min-h-[6rem] p-1.5 bg-white cursor-pointer transition-colors',
                      selected ? 'ring-2 ring-inset ring-blue-500' : 'hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      {isToday ? (
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                          {d.getDate()}
                        </span>
                      ) : (
                        <span className={`text-xs font-medium ${inCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                          {d.getDate()}
                        </span>
                      )}
                      {isNearFull && (
                        <span
                          title={isFull ? 'Hotel lotado neste dia' : 'Ocupação próxima do limite neste dia'}
                          className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {bars.map(seg => (
                <ReservationDetailPopover
                  key={`${seg.event.key}-${seg.colStart}`}
                  detail={buildDetail(seg.event)}
                  onEdit={onEditReservation && seg.event.reservationStatus !== 'cancelled' ? () => onEditReservation(seg.event.reservation) : undefined}
                  onCancel={onCancelReservation && seg.event.reservationStatus !== 'cancelled' ? () => onCancelReservation(seg.event.reservation, seg.event.reservationIds) : undefined}
                >
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      gridColumn: `${seg.colStart + 1} / span ${seg.colSpan}`,
                      gridRow: seg.lane + 2,
                      marginLeft: seg.isStart ? '4px' : '0',
                      marginRight: seg.isEnd ? '4px' : '0',
                      borderTopLeftRadius: seg.isStart ? '4px' : '0',
                      borderBottomLeftRadius: seg.isStart ? '4px' : '0',
                      borderTopRightRadius: seg.isEnd ? '4px' : '0',
                      borderBottomRightRadius: seg.isEnd ? '4px' : '0',
                    }}
                    className={`self-center h-[1rem] px-1.5 text-left text-[11px] font-medium truncate flex items-center gap-1 transition-colors ${getChipStyle(seg.event.kind, seg.event.reservationStatus)}`}
                  >
                    {seg.isStart && (seg.event.pilgrimage ? <Bus className="w-2.5 h-2.5 shrink-0" /> : <Hotel className="w-2.5 h-2.5 shrink-0" />)}
                    <span className="truncate">{seg.isStart ? seg.event.title : ' '}</span>
                  </button>
                </ReservationDetailPopover>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthlyCalendar;
