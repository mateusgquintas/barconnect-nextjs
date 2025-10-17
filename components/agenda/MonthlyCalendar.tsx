'use client'
import React from 'react';
import { DayOccupancyBar } from './DayOccupancyBar';

type Props = {
  month: Date; // any date within the month to display
  selectedDate?: Date | null;
  onDayClick?: (date: Date) => void;
  renderDayBadge?: (date: Date) => React.ReactNode;
  renderOccupancyBar?: (date: Date) => React.ReactNode;
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

export function MonthlyCalendar({ month, selectedDate, onDayClick, renderDayBadge, renderOccupancyBar }: Props) {
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold" aria-live="polite">{monthLabel}</h2>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm text-muted-foreground mb-1" role="row">
        {weekDays.map((wd) => (
          <div key={wd} className="py-1 text-center" role="columnheader">{wd}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid">
        {days.map((d, idx) => {
          const inCurrentMonth = d.getMonth() === monthIdx && d.getFullYear()===year;
          const selected = isSameDay(d, selectedDate || null);
          const key = dateKey(d);
          return (
            <button
              key={idx}
              role="gridcell"
              aria-selected={selected}
              aria-label={`Dia ${d.getDate()} de ${monthLabel}`}
              data-date={key}
              onClick={() => onDayClick?.(d)}
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
        })}
      </div>
    </div>
  );
}

export default MonthlyCalendar;
