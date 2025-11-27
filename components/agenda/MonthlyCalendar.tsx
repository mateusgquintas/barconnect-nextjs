'use client'
import React from 'react';
import { DayOccupancyBar } from './DayOccupancyBar';
import { CalendarGridWithEvents } from './CalendarEventBar';
import { Pilgrimage as PilgrimageType } from '@/types';

interface RoomReservation {
  id: string;
  room_id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  customer_name?: string;
  pilgrimage_id?: string;
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
  // Novos props para visualização de eventos
  reservations?: RoomReservation[];
  rooms?: Room[];
  pilgrimages?: PilgrimageType[];
  onEventClick?: (reservation: RoomReservation) => void;
  showEvents?: boolean;
};

function startOfMonth(d: Date) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function endOfMonth(d: Date) { const x = new Date(d); x.setMonth(x.getMonth()+1, 0); x.setHours(23,59,59,999); return x; }
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

export function MonthlyCalendar({ 
  month, 
  selectedDate, 
  onDayClick, 
  onDayDoubleClick, 
  renderDayBadge, 
  renderOccupancyBar,
  reservations = [],
  rooms = [],
  pilgrimages = [],
  onEventClick,
  showEvents = true,
}: Props) {
  const DayCell = React.useMemo(() => {
    type CellProps = {
      d: Date;
      inCurrentMonth: boolean;
      selected: boolean;
      monthLabel: string;
      onDayClick?: (d: Date) => void;
      onDayDoubleClick?: (d: Date) => void;
      renderDayBadge?: (d: Date) => React.ReactNode;
      renderOccupancyBar?: (d: Date) => React.ReactNode;
      dataDate: string;
    };
    const Comp = React.memo(function DayCell({ d, inCurrentMonth, selected, monthLabel, onDayClick, onDayDoubleClick, renderDayBadge, renderOccupancyBar, dataDate }: CellProps) {
      return (
        <button
          role="gridcell"
          aria-selected={selected}
          aria-label={`Dia ${d.getDate()} de ${monthLabel}`}
          data-date={dataDate}
          onClick={() => onDayClick?.(d)}
          onDoubleClick={() => onDayDoubleClick?.(d)}
          className={[
            'h-20 p-1 rounded-xs text-left border transition-colors',
            inCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground/70',
            selected ? 'ring-2 ring-ring' : '',
            'hover:bg-accent hover:text-accent-foreground'
          ].join(' ')}
        >
          <div className="text-xs font-medium">{d.getDate()}</div>
          <div className="mt-1 text-xs">
            {renderDayBadge?.(d)}
            {renderOccupancyBar?.(d)}
          </div>
        </button>
      );
    }, (prev, next) => (
      prev.selected === next.selected &&
      prev.inCurrentMonth === next.inCurrentMonth &&
      prev.dataDate === next.dataDate &&
      prev.monthLabel === next.monthLabel &&
      prev.onDayClick === next.onDayClick &&
      prev.onDayDoubleClick === next.onDayDoubleClick &&
      prev.renderDayBadge === next.renderDayBadge &&
      prev.renderOccupancyBar === next.renderOccupancyBar
    ));
    return Comp;
  }, []);
  const days = React.useMemo(() => buildMonthDays(month), [month]);
  const monthIdx = month.getMonth();
  const year = month.getFullYear();
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  function dateKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return (
    <div className="w-full" aria-label="Calendário mensal">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold" aria-live="polite">{monthLabel}</h2>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm text-muted-foreground mb-2" role="row">
        {weekDays.map((wd) => (
          <div key={wd} className="py-2 text-center font-medium" role="columnheader">{wd}</div>
        ))}
      </div>
      
      {showEvents && reservations.length > 0 ? (
        <CalendarGridWithEvents
          month={month}
          days={days}
          reservations={reservations}
          rooms={rooms}
          pilgrimages={pilgrimages}
          selectedDate={selectedDate}
          onDayClick={onDayClick}
          onDayDoubleClick={onDayDoubleClick}
          onEventClick={onEventClick}
          renderDayBadge={renderDayBadge}
          renderOccupancyBar={renderOccupancyBar}
        />
      ) : (
        <div className="grid grid-cols-7 gap-1" role="grid">
          {days.map((d) => {
            const inCurrentMonth = d.getMonth() === monthIdx && d.getFullYear()===year;
            const selected = isSameDay(d, selectedDate || null);
            const key = dateKey(d);
            return (
              <DayCell
                key={key}
                d={d}
                inCurrentMonth={inCurrentMonth}
                selected={selected}
                monthLabel={monthLabel}
                onDayClick={onDayClick}
                onDayDoubleClick={onDayDoubleClick}
                renderDayBadge={renderDayBadge}
                renderOccupancyBar={renderOccupancyBar}
                dataDate={key}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MonthlyCalendar;
