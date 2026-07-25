'use client'
import React from 'react';
import { ChevronLeft, ChevronRight, Hotel, Bus } from 'lucide-react';
import { Pilgrimage as PilgrimageType } from '@/types';
import { parseLocalDate } from '@/utils/dateHelpers';

interface Room {
  id: string;
  number: number | string;
}

interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
  notes?: string | null;
}

type Props = {
  weekStart: Date; // any date within the week; the week is computed as Monday-Sunday around it
  selectedDate?: Date | null;
  onDayClick?: (date: Date) => void;
  onDayDoubleClick?: (date: Date) => void;
  reservations?: RoomReservation[];
  rooms?: Room[];
  pilgrimages?: PilgrimageType[];
  onEventClick?: (reservation: RoomReservation) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  headerActions?: React.ReactNode;
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-400' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-500' },
  reserved: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-500' },
  checked_in: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-500' },
  checked_out: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-400' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-400' },
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - dow);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const weekDayLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export function WeeklyCalendar({
  weekStart,
  selectedDate,
  onDayClick,
  onDayDoubleClick,
  reservations = [],
  rooms = [],
  pilgrimages = [],
  onEventClick,
  onPrevWeek,
  onNextWeek,
  headerActions,
}: Props) {
  const days = React.useMemo(() => {
    const start = startOfWeek(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const today = new Date();

  const weekLabel = React.useMemo(() => {
    const first = days[0];
    const last = days[6];
    const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
    const fmt = (d: Date, withMonth: boolean) =>
      withMonth ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : d.toLocaleDateString('pt-BR', { day: '2-digit' });
    return sameMonth
      ? `${fmt(first, false)} - ${last.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
      : `${fmt(first, true)} - ${last.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }, [days]);

  // Agrupa reservas em "eventos" (romarias agrupadas, individuais separados) — mesma lógica da view mensal
  const events = React.useMemo(() => {
    const grouped = new Map<string, RoomReservation[]>();
    reservations
      .filter(r => r.status !== 'cancelled')
      .forEach(r => {
        const key = r.pilgrimage_id ? `pilgrimage-${r.pilgrimage_id}` : `individual-${r.id}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
      });

    return Array.from(grouped.entries()).map(([key, group]) => {
      const first = group[0];
      const pilgrimage = first.pilgrimage_id ? pilgrimages.find(p => p.id === first.pilgrimage_id) : undefined;
      const startDate = parseLocalDate(first.check_in_date);
      const endDate = parseLocalDate(first.check_out_date);
      let title: string;
      if (pilgrimage) {
        title = `${pilgrimage.name} (${group.length} quarto${group.length > 1 ? 's' : ''})`;
      } else {
        const room = rooms.find(rm => rm.id === first.room_id);
        const roomLabel = room ? `Q${room.number}` : 'Quarto';
        const guestName = first.notes || first.customer_name || '';
        title = guestName ? `${roomLabel} - ${guestName}` : roomLabel;
      }
      return { id: key, title, startDate, endDate, status: first.status, pilgrimage, reservation: first };
    });
  }, [reservations, rooms, pilgrimages]);

  return (
    <div className="w-full" aria-label="Calendário semanal">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {onPrevWeek && (
            <button
              type="button"
              onClick={onPrevWeek}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-600"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg font-semibold capitalize" aria-live="polite">{weekLabel}</h2>
          {onNextWeek && (
            <button
              type="button"
              onClick={onNextWeek}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-600"
              aria-label="Próxima semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {headerActions}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const selected = isSameDay(d, selectedDate || null);
          const isToday = isSameDay(d, today);

          const dayStart = new Date(d);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const dayEvents = events.filter(ev => {
            const s = new Date(ev.startDate); s.setHours(0, 0, 0, 0);
            const e = new Date(ev.endDate); e.setHours(0, 0, 0, 0);
            return s < dayEnd && e > dayStart;
          });

          return (
            <div key={i} className="flex flex-col min-h-[260px]">
              <button
                type="button"
                onClick={() => onDayClick?.(d)}
                onDoubleClick={() => onDayDoubleClick?.(d)}
                className={[
                  'w-full text-center py-2 rounded-t-lg border border-b-0 transition-all',
                  isToday ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100',
                  selected && !isToday ? 'ring-2 ring-blue-500' : '',
                ].join(' ')}
              >
                <div className={`text-xs font-medium ${isToday ? 'text-blue-100' : 'text-slate-500'}`}>{weekDayLabels[i]}</div>
                <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-slate-900'}`}>{d.getDate()}</div>
              </button>
              <div className="flex-1 border border-slate-200 rounded-b-lg p-1.5 space-y-1.5 bg-white overflow-y-auto max-h-[400px]">
                {dayEvents.length === 0 && (
                  <p className="text-[11px] text-slate-400 text-center pt-4">Sem reservas</p>
                )}
                {dayEvents.map(ev => {
                  const colors = statusColors[ev.status] || statusColors.confirmed;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => onEventClick?.(ev.reservation)}
                      className={`${colors.bg} ${colors.text} border-l-2 ${colors.border} rounded px-1.5 py-1 text-[11px] font-medium cursor-pointer hover:shadow-sm transition-shadow flex items-start gap-1`}
                      title={ev.title}
                    >
                      {ev.pilgrimage ? <Bus className="w-3 h-3 mt-0.5 shrink-0" /> : <Hotel className="w-3 h-3 mt-0.5 shrink-0" />}
                      <span className="truncate">{ev.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
